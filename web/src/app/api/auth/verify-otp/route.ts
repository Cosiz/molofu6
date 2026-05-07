import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  try {
    const { phone, token } = await req.json();
    if (!phone || !token) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    // Development bypass
    if (token === '123456') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'demo-user',
          phone,
          role: 'commander',
          family_id: 'demo-family',
          member_id: 'demo-member',
          display_name: 'Commander',
          preferred_language: 'en',
        },
      });
    }

    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
    if (error) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ success: true, user: data.user });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
