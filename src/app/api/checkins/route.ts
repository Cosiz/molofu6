import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = (globalThis as any).__supabase;
    if (!client) {
      return NextResponse.json({ checkin: { ...body, id: 'demo-' + Date.now() }, demo: true }, { status: 201 });
    }
    const { data, error } = await client
      .from('activity_checkins')
      .insert(body)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ checkin: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}