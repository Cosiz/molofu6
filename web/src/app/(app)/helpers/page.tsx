'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const MEMBERS = [
  { id: 'm0', name: 'Commander (You)', role: 'commander', phone: '+852 60000001', status: 'active' },
  { id: 'm1', name: 'Ah Mei', role: 'helper', phone: '+852 60000002', status: 'active' },
  { id: 'm2', name: 'Ah Fu', role: 'helper', phone: '+852 60000003', status: 'active' },
  { id: 'm3', name: 'Grandma', role: 'observer', phone: '+852 60000004', status: 'active' },
];

export default function HelpersPage() {
  const roleColors: Record<string, string> = {
    commander: 'bg-indigo-600', helper: 'bg-green-600', observer: 'bg-slate-500',
  };
  const roleLabels: Record<string, string> = {
    commander: 'Commander', helper: 'Helper', observer: 'Observer',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Family Members</h1>
            <p className="text-sm text-slate-500">{MEMBERS.length} members</p>
          </div>
          <Button className="bg-indigo-600">+ Invite</Button>
        </div>

        <div className="space-y-3">
          {MEMBERS.map(m => (
            <Card key={m.id} className="bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={`${roleColors[m.role]} text-white`}>
                    {m.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.phone}</p>
                </div>
                <Badge className={`${roleColors[m.role]} text-white border-0`}>
                  {roleLabels[m.role]}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
