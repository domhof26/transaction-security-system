import { NextResponse } from 'next/server';
import { N8nClientError } from './n8n-client';

export function handleProxyError(error: unknown) {
  if (error instanceof N8nClientError) {
    return NextResponse.json(
      {
        success: false,
        error: 'N8N_GATEWAY_ERROR',
        message: error.message,
        details: error.data,
      },
      { status: error.status }
    );
  }

  const message = error instanceof Error ? error.message : 'An unexpected server error occurred';
  return NextResponse.json(
    {
      success: false,
      error: 'INTERNAL_PROXY_ERROR',
      message,
    },
    { status: 500 }
  );
}

export function proxyResponse(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}
