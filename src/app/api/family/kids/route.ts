import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const client = (globalThis as any).__supabase;
    if (!client) return NextResponse.json({ kids: [] });
    const { data, error } = await client.from('kids').select('*').order('name');
    if (error) throw error;
    return NextResponse.json({ kids: data ?? [] });
  } catch {
    return NextResponse.json({ kids: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = (globalThis as any).__supabase;
    if (!client) return NextResponse.json({ kid: { ...body, id: 'demo-' + Date.now() }, demo: true }, { status: 201 });
    const { data, error } = await client.from('kids').insert(body).select().single();
    if (error) throw error;
    return NextResponse.json({ kid: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}