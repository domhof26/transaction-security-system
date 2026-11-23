import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { getSupabaseServerClient } from '@/lib/supabase-server';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type AuditEventType =
  | 'FISCALIZATION_STARTED'
  | 'FISCALIZATION_COMPLETED'
  | 'FISCALIZATION_FAILED';

interface FiscalizationContext {
  organizationId: string;
  registerId: string;
  receiptId: string | null;
  receiptCreated: boolean;
  receiptSigned: boolean;
  receiptVerified: boolean;
  orchestrationId: string;
}

function errorResponse(
  error: string,
  message: string,
  status: number,
  extra: Record<string, unknown> = {}
) {
  return NextResponse.json({ success: false, error, message, ...extra }, { status });
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readReceiptId(body: unknown): string | null {
  const record = asRecord(body);
  const receipt = asRecord(record.receipt);
  const data = asRecord(record.data);

  for (const candidate of [
    record.receipt_id,
    record.id,
    receipt.id,
    data.id,
  ]) {
    if (typeof candidate === 'string' && UUID_PATTERN.test(candidate)) {
      return candidate;
    }
  }
  return null;
}

function readReceiptData(body: unknown): Record<string, unknown> {
  const record = asRecord(body);
  const data = asRecord(record.data);
  const receipt = asRecord(record.receipt);
  return Object.keys(data).length ? data : Object.keys(receipt).length ? receipt : record;
}

async function writeFiscalizationEvent(
  context: FiscalizationContext,
  eventType: AuditEventType,
  step: string,
  errorCode?: string
) {
  const { error } = await getSupabaseServerClient()
    .from('audit_events')
    .insert({
      organization_id: context.organizationId,
      register_id: context.registerId,
      receipt_id: context.receiptId,
      event_type: eventType,
      payload: {
        source: 'NEXTJS_FISCALIZATION',
        orchestration_id: context.orchestrationId,
        step,
        ...(errorCode ? { error_code: errorCode } : {}),
      },
    });

  if (error) {
    throw new Error(`Could not record ${eventType} audit event: ${error.message}`);
  }
}

async function failedResult(
  context: FiscalizationContext,
  step: string,
  error: string,
  message: string,
  status: number,
  extra: Record<string, unknown> = {}
) {
  try {
    const errorCode = typeof extra.signing_error === 'string'
      ? extra.signing_error
      : typeof extra.verification_error === 'string'
        ? extra.verification_error
        : error;
    await writeFiscalizationEvent(context, 'FISCALIZATION_FAILED', step, errorCode);
  } catch (auditError) {
    return errorResponse(
      'FISCALIZATION_AUDIT_WRITE_FAILED',
      auditError instanceof Error ? auditError.message : 'Failed to record fiscalization failure.',
      500,
      {
        orchestration_id: context.orchestrationId,
        failure: { error, message },
        receipt_id: context.receiptId,
        ...extra,
      }
    );
  }

  return errorResponse(error, message, status, {
    status: 'FAILED',
    orchestration_id: context.orchestrationId,
    receipt_created: context.receiptCreated,
    receipt_signed: context.receiptSigned,
    receipt_verified: context.receiptVerified,
    receipt_id: context.receiptId ?? undefined,
    ...extra,
  });
}

export async function POST(req: NextRequest) {
  let context: FiscalizationContext | null = null;
  let step = 'VALIDATION';

  try {
    const body = asRecord(await req.json());
    const organizationId = typeof body.organization_id === 'string' ? body.organization_id.trim() : '';
    const registerId = typeof body.register_id === 'string' ? body.register_id.trim() : '';
    const receiptNumber = typeof body.receipt_number === 'string' ? body.receipt_number.trim() : '';
    const amountCents = body.amount_cents;
    const vatRate = body.vat_rate;

    if (!UUID_PATTERN.test(organizationId) || !UUID_PATTERN.test(registerId)) {
      return errorResponse('INVALID_FISCALIZATION_INPUT', 'Valid organization_id and register_id UUIDs are required.', 400);
    }
    if (!receiptNumber) {
      return errorResponse('INVALID_FISCALIZATION_INPUT', 'receipt_number is required.', 400);
    }
    if (!Number.isSafeInteger(amountCents) || (amountCents as number) < 0) {
      return errorResponse('INVALID_FISCALIZATION_INPUT', 'amount_cents must be a non-negative integer.', 400);
    }
    if (typeof vatRate !== 'number' || !Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
      return errorResponse('INVALID_FISCALIZATION_INPUT', 'vat_rate must be between 0 and 100.', 400);
    }

    const supabase = getSupabaseServerClient();
    const { data: register, error: registerError } = await supabase
      .from('cash_registers')
      .select('id, organization_id, status')
      .eq('id', registerId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (registerError) {
      return errorResponse('DATABASE_ERROR', registerError.message, 500);
    }
    if (!register) {
      return errorResponse('REGISTER_NOT_IN_ORGANIZATION', 'The register was not found for the selected organization.', 404);
    }
    if (register.status !== 'ACTIVE') {
      return errorResponse('REGISTER_NOT_ACTIVE', 'The selected cash register must be ACTIVE.', 409);
    }

    context = {
      organizationId,
      registerId,
      receiptId: null,
      receiptCreated: false,
      receiptSigned: false,
      receiptVerified: false,
      orchestrationId: randomUUID(),
    };

    await writeFiscalizationEvent(context, 'FISCALIZATION_STARTED', 'STARTED');

    const netCents = Math.round(((amountCents as number) * 100) / (100 + vatRate));
    const vatCents = (amountCents as number) - netCents;
    const vatBreakdown = [{ rate: vatRate, net_cents: netCents, vat_cents: vatCents }];

    step = 'RECEIPT_CREATION';
    const creation = await n8nClient.submitReceipt({
      register_id: registerId,
      receipt_number: receiptNumber,
      amount_cents: amountCents as number,
      vat_breakdown: vatBreakdown,
    });

    if (creation.status < 200 || creation.status >= 300) {
      const creationBody = asRecord(creation.body);
      return await failedResult(
        context,
        step,
        'RECEIPT_CREATION_FAILED',
        'Receipt creation failed.',
        creation.status || 500,
        { details: creation.body, creation_error: creationBody.error ?? creationBody.message }
      );
    }

    context.receiptCreated = true;
    const receiptId = readReceiptId(creation.body);
    if (!receiptId) {
      return await failedResult(
        context,
        step,
        'RECEIPT_ID_NOT_RETURNED',
        'WF-04 created the receipt but did not return a usable receipt UUID.',
        502,
        { receipt_created: true, details: creation.body }
      );
    }

    context.receiptId = receiptId;
    const createdData = readReceiptData(creation.body);

    step = 'RECEIPT_SIGNING';
    const signing = await n8nClient.signReceipt(receiptId);
    const signingBody = asRecord(signing.body);
    const signingSucceeded = signing.status >= 200
      && signing.status < 300
      && (signingBody.success === true || signingBody.ok === true);

    if (!signingSucceeded) {
      return await failedResult(
        context,
        step,
        'RECEIPT_SIGNING_FAILED',
        'Receipt was created, but signing failed.',
        signing.status >= 400 ? signing.status : 502,
        {
          receipt_number: createdData.receipt_number ?? receiptNumber,
          sequence_number: createdData.sequence_number,
          receipt_signed: false,
          signing_error: signingBody.error ?? signingBody.message ?? 'SIGNING_FAILED',
          details: signing.body,
        }
      );
    }
    context.receiptSigned = true;

    step = 'RECEIPT_VERIFICATION';
    const verification = await n8nClient.verifyReceipt(receiptId);
    const verificationBody = asRecord(verification.body);
    const verificationData = asRecord(verificationBody.data);
    const verificationResult = Object.keys(verificationData).length
      ? verificationData
      : verificationBody;
    const verified = verification.status >= 200
      && verification.status < 300
      && verificationBody.success === true
      && verificationResult.valid === true;

    if (!verified) {
      const signedData = readReceiptData(signing.body);
      return await failedResult(
        context,
        step,
        'RECEIPT_VERIFICATION_FAILED',
        'Receipt was created and signed, but verification did not pass.',
        verification.status >= 400 ? verification.status : 422,
        {
          receipt_number: signedData.receipt_number ?? createdData.receipt_number ?? receiptNumber,
          sequence_number: signedData.sequence_number ?? createdData.sequence_number,
          receipt_signed: true,
          signature: signedData.signature,
          hash: signedData.hash,
          verification_error: verificationResult.error ?? 'VERIFICATION_INVALID',
          checks: verificationResult.checks,
          details: verification.body,
        }
      );
    }
    context.receiptVerified = true;

    const finalSignedData = readReceiptData(signing.body);
    step = 'COMPLETION';
    try {
      await writeFiscalizationEvent(context, 'FISCALIZATION_COMPLETED', step);
    } catch (auditError) {
      return errorResponse(
        'FISCALIZATION_AUDIT_WRITE_FAILED',
        auditError instanceof Error ? auditError.message : 'Could not record completed fiscalization.',
        500,
        {
          orchestration_id: context.orchestrationId,
          receipt_created: true,
          receipt_signed: true,
          receipt_verified: true,
          receipt_id: receiptId,
        }
      );
    }

    return NextResponse.json({
      success: true,
      status: 'SUCCESS',
      orchestration_id: context.orchestrationId,
      receipt_created: true,
      receipt_signed: true,
      receipt_verified: true,
      receipt_id: receiptId,
      receipt_number: finalSignedData.receipt_number ?? createdData.receipt_number ?? receiptNumber,
      sequence_number: finalSignedData.sequence_number ?? createdData.sequence_number,
      signature: finalSignedData.signature,
      hash: finalSignedData.hash,
      key_id: finalSignedData.key_id,
      verification: verificationResult,
      checks: verificationResult.checks,
      message: 'Receipt was created, signed, and verified successfully.',
    });
  } catch (error) {
    if (context) {
      try {
        await writeFiscalizationEvent(context, 'FISCALIZATION_FAILED', step, 'FISCALIZATION_ORCHESTRATION_ERROR');
      } catch (auditError) {
        return errorResponse(
          'FISCALIZATION_AUDIT_WRITE_FAILED',
          auditError instanceof Error ? auditError.message : 'Failed to record fiscalization failure.',
          500,
          {
            orchestration_id: context.orchestrationId,
            receipt_id: context.receiptId ?? undefined,
            failure: error instanceof Error ? error.message : 'Fiscalization orchestration failed.',
          }
        );
      }

      return errorResponse(
        'FISCALIZATION_ORCHESTRATION_ERROR',
        error instanceof Error ? error.message : 'Fiscalization orchestration failed.',
        500,
        {
          status: 'FAILED',
          orchestration_id: context.orchestrationId,
          receipt_created: context.receiptCreated,
          receipt_signed: context.receiptSigned,
          receipt_verified: context.receiptVerified,
          receipt_id: context.receiptId ?? undefined,
          failed_step: step,
        }
      );
    }

    return errorResponse(
      'FISCALIZATION_ORCHESTRATION_ERROR',
      error instanceof Error ? error.message : 'Fiscalization orchestration failed.',
      500
    );
  }
}
