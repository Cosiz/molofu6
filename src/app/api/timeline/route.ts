import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const client = (globalThis as any).__supabase;
    if (!client) return NextResponse.json({ posts: [], demo: true });
    const { data, error } = await client
      .from('timeline_posts')
      .select('*, author_name:profiles(display_name), activity:activities(title, activity_type)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return NextResponse.json({ posts: data ?? [] });
  } catch {
    return NextResponse.json({ posts: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = (globalThis as any).__supabase;
    if (!client) {
      return NextResponse.json({ post: { ...body, id: 'demo-' + Date.now(), created_at: new Date().toISOString() }, demo: true }, { status: 201 });
    }
    const { data, error } = await client
      .from('timeline_posts')
      .insert(body)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ post: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}