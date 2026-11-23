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

    const { searchParams } = new URL(req.url);
    const registerId = searchParams.get('register_id');
    const limit = Math.min(Math.max(Number(searchParams.get('limit') ?? '50'), 1), 200);

    const { data: registers, error: registersError } = await supabase
      .from('cash_registers')
      .select('id')
      .eq('organization_id', id);
    if (registersError) {
      return NextResponse.json({ success: false, error: 'DATABASE_ERROR', message: registersError.message }, { status: 500 });
    }

    let registerIds = (registers ?? []).map((register) => register.id as string);
    if (registerId) {
      if (!UUID_PATTERN.test(registerId)) {
        return NextResponse.json({ success: false, error: 'INVALID_REGISTER_ID', message: 'A valid register UUID is required.' }, { status: 400 });
      }
      if (!registerIds.includes(registerId)) {
        return NextResponse.json({ success: false, error: 'REGISTER_NOT_FOUND', message: 'Register not found for this organization.' }, { status: 404 });
      }
      registerIds = [registerId];
    }
    if (registerIds.length === 0) {
      return NextResponse.json({ success: true, data: [], count: 0 });
    }

    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .in('register_id', registerIds)
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
