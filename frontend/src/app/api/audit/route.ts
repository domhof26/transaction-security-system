import { NextRequest, NextResponse } from 'next/server';
import { n8nClient } from '@/lib/n8n-client';
import { handleProxyError, proxyResponse } from '@/lib/api-handler';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get('organization_id');
    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_ORGANIZATION_ID',
          message: 'A valid organization_id query parameter is required.',
        },
        { status: 400 }
      );
    }
    const result = await n8nClient.getAuditEvents(organizationId);
    return proxyResponse(result.status, result.body);
  } catch (err) {
    return handleProxyError(err);
  }
}
