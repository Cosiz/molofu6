'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const KIDS = [
  { id: 'k1', name: 'Aiko', school: "St. Michael's Primary", grade: 'P.3', avatar: null },
  { id: 'k2', name: 'James', school: 'Diocesan Boys School', grade: 'P.5', avatar: null },
];

export default function KidsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Kids</h1>
            <p className="text-sm text-slate-500">{KIDS.length} children registered</p>
          </div>
          <Button className="bg-indigo-600">+ Add Kid</Button>
        </div>

        <div className="space-y-4">
          {KIDS.map(kid => (
            <Card key={kid.id} className="bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-lg">
                    {kid.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{kid.name}</h3>
                  <p className="text-sm text-slate-500">{kid.school}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{kid.grade}</Badge>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
