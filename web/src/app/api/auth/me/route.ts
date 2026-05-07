import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // In real app: join with family_members to get role
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
