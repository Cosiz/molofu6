import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const client = (globalThis as any).__supabase;
    if (!client) return NextResponse.json({ members: [] });

    const { data, error } = await client
      .from('family_members')
      .select('*')
      .eq('status', 'active')
      .order('created_at');
    if (error) throw error;
    return NextResponse.json({ members: data ?? [] });
  } catch {
    return NextResponse.json({ members: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = (globalThis as any).__supabase;
    if (!client) return NextResponse.json({ member: { ...body, id: 'demo-' + Date.now() }, demo: true }, { status: 201 });
    const { data, error } = await client.from('family_members').insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ member: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}