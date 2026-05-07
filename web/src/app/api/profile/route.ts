import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const client = (globalThis as any).__supabase;
    if (!client) return NextResponse.json({ profile: null });
    const { data: { user } } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await client.from('profiles').select('*').eq('id', user.id).single();
    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch {
    return NextResponse.json({ profile: null }, { status: 200 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const client = (globalThis as any).__supabase;
    if (!client) return NextResponse.json({ success: true, demo: true });
    const { data: { user } } = await client.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { data, error } = await client.from('profiles').update(body).eq('id', user.id).select().single();
    if (error) throw error;
    return NextResponse.json({ success: true, profile: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}