import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

    const client = (supabase as any)._supabase || supabase;
    if (!client) {
      return NextResponse.json({ activities: [], demo: true });
    }

    const { data, error } = await client
      .from('activities')
      .select('*, kids(name, avatar_url), assigned_member:family_members!activities_assigned_to_fkey(display_name, role)')
      .eq('date', date)
      .order('start_time');

    if (error) throw error;
    return NextResponse.json({ activities: data ?? [] });
  } catch {
    return NextResponse.json({ activities: [], error: 'fetch failed' }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const client = (supabase as any)._supabase || supabase;

    if (!client) {
      return NextResponse.json({ activity: { ...body, id: 'demo-' + Date.now() }, demo: true }, { status: 201 });
    }

    const { data, error } = await client
      .from('activities')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}