import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { handleProxyError, proxyResponse } from '@/lib/api-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.receipt_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_RECEIPT_ID',
          message: 'receipt_id is required',
        },
        { status: 400 }
      );
    }
    const result = await n8nClient.signReceipt(body.receipt_id);
    return proxyResponse(result.status, result.body);
  } catch (err) {
    return handleProxyError(err);
  }
}
