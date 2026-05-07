'use client';

import { useState, useEffect } from 'react';
import { SessionUser, ActivityWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ACTIVITY_TYPE_LABELS } from '@/lib/constants';

const MOCK_TASKS: ActivityWithRelations[] = [
  {
    id: '2', family_id: 'f1', kid_id: 'k1', title: 'School Pickup',
    description: 'Remember diary + PE bag', date: new Date().toISOString().split('T')[0],
    start_time: '15:30', end_time: '16:00', location_name: "St. Michael's Primary", location_address: 'Causeway Bay',
    location_lat: 22.28, location_lng: 114.18, activity_type: 'pickup',
    assigned_to: 'm1', status: 'in_progress', priority: 'high', is_offline_available: true,
    notes: 'School gate B', created_at: '', updated_at: '',
    kids: { name: 'Aiko', avatar_url: null },
    assigned_member: { display_name: 'Ah Mei', role: 'helper' },
  },
  {
    id: '1', family_id: 'f1', kid_id: 'k1', title: 'Piano Lesson',
    description: 'Grade 3 exam prep — bring music book',
    date: new Date().toISOString().split('T')[0],
    start_time: '16:00', end_time: '17:00', location_name: 'Music Studio', location_address: 'Causeway Bay',
    location_lat: 22.28, location_lng: 114.18, activity_type: 'lesson',
    assigned_to: 'm1', status: 'scheduled', priority: 'normal', is_offline_available: true,
    notes: null, created_at: '', updated_at: '',
    kids: { name: 'Aiko', avatar_url: null },
    assigned_member: { display_name: 'Ah Mei', role: 'helper' },
  },
];

export default function HelperPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [tasks, setTasks] = useState<ActivityWithRelations[]>(MOCK_TASKS);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('molofu_user');
    if (stored) setUser(JSON.parse(stored));
    setIsOnline(navigator.onLine);
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));
  }, []);

  const handleCheckin = (id: string, type: 'arrival' | 'completed') => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: type === 'completed' ? 'completed' : 'in_progress' } : t
    ));
  };

  const pending = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const done = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <span>📵</span> Offline — tasks still available
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-green-600 text-white">H</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-bold text-slate-900">Ah Mei</h1>
            <p className="text-xs text-slate-500">Helper · {pending.length} tasks today</p>
          </div>
        </div>
      </div>

      {/* Pending tasks */}
      <div className="flex-1 p-4 space-y-4">
        {pending.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-slate-500 font-medium">All done for today!</p>
          </div>
        )}

        {pending.map(task => {
          const type = ACTIVITY_TYPE_LABELS[task.activity_type] ?? ACTIVITY_TYPE_LABELS.other;
          return (
            <Card key={task.id} className="bg-white border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{type.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 text-lg">{task.title}</h3>
                    <p className="text-sm text-slate-500 mb-1">
                      🕐 {task.start_time} — {task.location_name ?? 'No location'}
                    </p>
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-3">{task.description}</p>
                    )}
                    {task.notes && (
                      <Badge variant="outline" className="text-xs mb-3 border-indigo-300 text-indigo-700">
                        📝 {task.notes}
                      </Badge>
                    )}
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        className="flex-1 h-16 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handleCheckin(task.id, 'arrival')}
                      >
                        ✅ I'm Here
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1 h-16 text-lg font-semibold border-2"
                        onClick={() => handleCheckin(task.id, 'completed')}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Completed */}
        {done.length > 0 && (
          <div className="pt-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase mb-3">Completed</h2>
            {done.map(task => (
              <div key={task.id} className="flex items-center gap-3 py-2 text-slate-400">
                <span>✅</span>
                <span className="line-through text-sm">{task.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="bg-white border-t border-slate-200 p-3 flex justify-around">
        <Button variant="ghost" className="flex-col gap-1 h-14 text-xs">
          <span>📋</span> Tasks
        </Button>
        <Button variant="ghost" className="flex-col gap-1 h-14 text-xs text-slate-400">
          <span>📰</span> Timeline
        </Button>
        <Button variant="ghost" className="flex-col gap-1 h-14 text-xs text-slate-400">
          <span>👤</span> Profile
        </Button>
      </div>
    </div>
  );
}
