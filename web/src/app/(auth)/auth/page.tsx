'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { SessionUser, Role } from '@/types';
import { LANGUAGES } from '@/lib/constants';

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Already logged in
    const stored = sessionStorage.getItem('molofu_user');
    if (stored) {
      const user: SessionUser = JSON.parse(stored);
      const dest = user.role === 'helper' ? '/helper' : user.role === 'observer' ? '/observer' : '/dashboard';
      router.push(dest);
    }
  }, []);

  const handleSendOtp = async () => {
    if (!phone.trim()) { setError('Please enter phone number'); return; }
    setLoading(true);
    setError('');

    // Magic bypass: demo mode
    if (phone === '+852 00000000') {
      await new Promise(r => setTimeout(r, 500)); // simulate network
      setStep('otp');
      setLoading(false);
      return;
    }

    try {
      const client = (supabase as any)._supabase || supabase;
      if (!client) throw new Error('Supabase not configured');

      const { error } = await client.auth.signInWithOtp({
        phone: phone.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) throw error;
      setStep('otp');
    } catch (e: any) {
      setError(e.message ?? 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { setError('Please enter code'); return; }
    setLoading(true);
    setError('');

    // Magic bypass: demo mode
    if (otp === '123456') {
      const mockUser: SessionUser = {
        id: 'demo-user-id',
        phone: phone || '+852 00000000',
        role: (sessionStorage.getItem('molofu_role') as Role) || 'commander',
        family_id: 'demo-family-id',
        member_id: 'demo-member-id',
        display_name: 'Commander',
        preferred_language: lang,
      };
      sessionStorage.setItem('molofu_user', JSON.stringify(mockUser));
      router.push('/dashboard');
      return;
    }

    try {
      const client = (supabase as any)._supabase || supabase;
      if (!client) throw new Error('Supabase not configured');

      const { data, error } = await client.auth.verifyOtp({
        phone: phone.trim(),
        token: otp.trim(),
        type: 'sms',
      });
      if (error) throw error;

      if (data.user) {
        // Fetch profile for role
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const { data: member } = await client
          .from('family_members')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        const user: SessionUser = {
          id: data.user.id,
          phone: data.user.phone,
          role: (member?.role as Role) || 'observer',
          family_id: member?.family_id || '',
          member_id: member?.id || '',
          display_name: profile?.display_name || data.user.phone || 'User',
          preferred_language: profile?.preferred_language || lang,
        };
        sessionStorage.setItem('molofu_user', JSON.stringify(user));
        const dest = user.role === 'helper' ? '/helper' : user.role === 'observer' ? '/observer' : '/dashboard';
        router.push(dest);
      }
    } catch (e: any) {
      setError(e.message ?? 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Language Picker */}
        <div className="flex justify-end">
          <select
            value={lang}
            onChange={e => setLang(e.target.value)}
            className="text-sm border rounded px-2 py-1 bg-white"
          >
            {LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🏠</div>
            <CardTitle className="text-2xl">Molofu6</CardTitle>
            <CardDescription>
              {lang === 'en' ? 'Family Command Centre' : '家庭指揮中心'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'phone' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === 'en' ? 'Phone Number' : '電話號碼'}
                  </label>
                  <Input
                    type="tel"
                    placeholder="+852 60000000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  className="w-full h-12 text-lg"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? '...' : lang === 'en' ? 'Send Code' : '發送驗證碼'}
                </Button>
                <Separator />
                <p className="text-xs text-center text-muted-foreground">
                  {lang === 'en'
                    ? 'Demo: use phone +852 00000000, code 123456'
                    : '示範: 電話 +852 00000000，密碼 123456'}
                </p>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {lang === 'en' ? 'Verification Code' : '驗證碼'}
                  </label>
                  <Input
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    className="text-lg h-12 text-center tracking-widest"
                    maxLength={6}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  className="w-full h-12 text-lg"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? '...' : lang === 'en' ? 'Verify' : '驗證'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep('phone')}>
                  {lang === 'en' ? 'Change phone number' : '更換電話號碼'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            Molofu6 v1.0
          </Badge>
        </div>
      </div>
    </div>
  );
}