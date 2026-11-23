import { NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { ApplicationErrorRecord } from '@/types';

export const dynamic = 'force-dynamic';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isErrorRecord(value: unknown): value is ApplicationErrorRecord {
  if (!isRecord(value)) return false;

  const optionalStringFields = [
    'workflow_name',
    'workflow_id',
    'error_code',
    'error_message',
    'request_data',
    'updatedAt',
  ];

  return (
    typeof value.category === 'string' &&
    typeof value.createdAt === 'string' &&
    optionalStringFields.every((field) => value[field] === undefined || value[field] === null || typeof value[field] === 'string') &&
    (value.execution_id === undefined || value.execution_id === null || typeof value.execution_id === 'string' || typeof value.execution_id === 'number') &&
    (value.id === undefined || typeof value.id === 'string' || typeof value.id === 'number')
  );
}

function gatewayError(message: string, status = 502) {
  return NextResponse.json(
    { success: false, error: 'ERRORS_UPSTREAM_ERROR', message },
    { status }
  );
}

export async function GET() {
  try {
    const result = await n8nClient.getErrors();
    if (result.status < 200 || result.status >= 300) {
      return gatewayError('Unable to load error records from the monitoring service.');
    }

    if (
      !isRecord(result.body) ||
      result.body.success !== true ||
      !Array.isArray(result.body.data) ||
      !result.body.data.every(isErrorRecord)
    ) {
      return gatewayError('The monitoring service returned an invalid response.');
    }

    const data = result.body.data as ApplicationErrorRecord[];
    return NextResponse.json(
      { success: true, count: data.length, data },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return gatewayError('Unable to reach the monitoring service.');
  }
}
