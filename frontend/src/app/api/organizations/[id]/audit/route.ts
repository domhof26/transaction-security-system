import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json({ success: false, error: 'INVALID_ORGANIZATION_ID', message: 'A valid organization UUID is required.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data: organization, error: organizationError } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    if (organizationError) {
      return NextResponse.json({ success: false, error: 'DATABASE_ERROR', message: organizationError.message }, { status: 500 });
    }
    if (!organization) {
      return NextResponse.json({ success: false, error: 'ORGANIZATION_NOT_FOUND', message: 'Organization not found.' }, { status: 404 });
    }

    const limit = Math.min(Math.max(Number(new URL(req.url).searchParams.get('limit') ?? '50'), 1), 200);
    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .eq('organization_id', id)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      return NextResponse.json({ success: false, error: 'DATABASE_ERROR', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, data: data ?? [], count: data?.length ?? 0 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'INTERNAL_SERVER_ERROR', message: error instanceof Error ? error.message : 'Unexpected server error' }, { status: 500 });
  }
}
