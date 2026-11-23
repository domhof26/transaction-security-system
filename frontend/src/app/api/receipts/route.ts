import { NextRequest } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { handleProxyError, proxyResponse } from '@/lib/api-handler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await n8nClient.submitReceipt(body);
    return proxyResponse(result.status, result.body);
  } catch (err) {
    return handleProxyError(err);
  }
}
