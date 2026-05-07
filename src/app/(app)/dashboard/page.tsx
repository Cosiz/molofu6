'use client';

import { useState, useEffect } from 'react';
import { SessionUser, ActivityWithRelations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ACTIVITY_TYPE_LABELS, PRIORITY_LABELS } from '@/lib/constants';

const MOCK_ACTIVITIES: ActivityWithRelations[] = [
  {
    id: '1', family_id: 'f1', kid_id: 'k1', title: 'Piano Lesson',
    description: 'Grade 3 exam prep', date: new Date().toISOString().split('T')[0],
    start_time: '16:00', end_time: '17:00', location_name: 'Music Studio', location_address: 'Causeway Bay',
    location_lat: 22.28, location_lng: 114.18, activity_type: 'lesson',
    assigned_to: 'm1', status: 'scheduled', priority: 'normal', is_offline_available: true,
    notes: null, created_at: '', updated_at: '',
    kids: { name: 'Aiko', avatar_url: null },
    assigned_member: { display_name: 'Ah Mei', role: 'helper' },
  },
  {
    id: '2', family_id: 'f1', kid_id: 'k1', title: 'School Pickup',
    description: 'Diary + PE bag', date: new Date().toISOString().split('T')[0],
    start_time: '15:30', end_time: '16:00', location_name: 'St. Michael\'s Primary', location_address: 'Causeway Bay',
    location_lat: 22.28, location_lng: 114.18, activity_type: 'pickup',
    assigned_to: 'm1', status: 'in_progress', priority: 'high', is_offline_available: true,
    notes: null, created_at: '', updated_at: '',
    kids: { name: 'Aiko', avatar_url: null },
    assigned_member: { display_name: 'Ah Mei', role: 'helper' },
  },
  {
    id: '3', family_id: 'f1', kid_id: 'k2', title: 'Math Tutor',
    description: 'Chapter 5 fractions', date: new Date().toISOString().split('T')[0],
    start_time: '18:00', end_time: '19:00', location_name: 'Kowloon Tong',
    location_address: 'Kowloon Tong', location_lat: 22.32, location_lng: 114.18, activity_type: 'tutor',
    assigned_to: 'm2', status: 'scheduled', priority: 'normal', is_offline_available: false,
    notes: null, created_at: '', updated_at: '',
    kids: { name: 'James', avatar_url: null },
    assigned_member: { display_name: 'Ah Fu', role: 'helper' },
  },
  {
    id: '4', family_id: 'f1', kid_id: null, title: 'Doctor Checkup',
    description: 'Annual flu vaccine', date: new Date().toISOString().split('T')[0],
    start_time: '11:00', end_time: '11:30', location_name: 'Queen Mary Hospital', location_address: 'Pokfulam',
    location_lat: 22.27, location_lng: 114.14, activity_type: 'medical',
    assigned_to: null, status: 'scheduled', priority: 'critical', is_offline_available: true,
    notes: null, created_at: '', updated_at: '',
    kids: null, assigned_member: null,
  },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function groupActivitiesByPeriod(activities: ActivityWithRelations[]) {
  const morning: ActivityWithRelations[] = [];
  const afternoon: ActivityWithRelations[] = [];
  const evening: ActivityWithRelations[] = [];
  for (const a of activities) {
    const hour = parseInt(a.start_time.split(':')[0]);
    if (hour < 12) morning.push(a);
    else if (hour < 18) afternoon.push(a);
    else evening.push(a);
  }
  return { morning, afternoon, evening };
}

function ActivityCard({ activity }: { activity: ActivityWithRelations }) {
  const type = ACTIVITY_TYPE_LABELS[activity.activity_type] ?? ACTIVITY_TYPE_LABELS.other;
  const priority = PRIORITY_LABELS[activity.priority];
  const statusColors: Record<string, string> = {
    scheduled: 'bg-slate-600',
    in_progress: 'bg-indigo-600',
    completed: 'bg-green-600',
    cancelled: 'bg-slate-700',
  };
  return (
    <Card className="bg-slate-800 border-slate-700 text-white hover:bg-slate-750">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{type.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{activity.title}</span>
              <Badge className={`${statusColors[activity.status]} text-white border-0 text-xs`}>
                {activity.status.replace('_', ' ')}
              </Badge>
              {activity.priority === 'critical' && (
                <Badge className="bg-red-600 text-white border-0 text-xs">CRITICAL</Badge>
              )}
              {activity.priority === 'high' && (
                <Badge className="bg-amber-600 text-white border-0 text-xs">HIGH</Badge>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-2">{activity.start_time} — {activity.location_name ?? 'No location'}</p>
            {activity.kids && (
              <div className="flex items-center gap-1 text-xs text-slate-300">
                <Avatar className="h-4 w-4"><AvatarFallback className="bg-indigo-700 text-xs">K</AvatarFallback></Avatar>
                {activity.kids.name}
              </div>
            )}
            {activity.assigned_member && (
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <Avatar className="h-4 w-4"><AvatarFallback className="bg-green-800 text-xs">H</AvatarFallback></Avatar>
                {activity.assigned_member.display_name}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NewActivityForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    title: '',    description: '', date: new Date().toISOString().split('T')[0],
    start_time: '', end_time: '', location_name: '',
    activity_type: 'other' as string, priority: 'normal' as string, assigned_to: '',
  });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label className="text-slate-300">Title</Label>
          <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="e.g. School Pickup" />
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300">Type</Label>
          <Select onValueChange={v => setForm({...form, activity_type: v as string})}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ACTIVITY_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.icon} {v.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300">Date</Label>
          <Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300">Start Time</Label>
          <Input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300">End Time</Label>
          <Input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-slate-300">Priority</Label>
          <Select onValueChange={v => setForm({...form, priority: v as string})} defaultValue="normal">
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-slate-300">Location</Label>
        <Input value={form.location_name} onChange={e => setForm({...form, location_name: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="e.g. St. Michael's Primary" />
      </div>
      <div className="space-y-1">
        <Label className="text-slate-300">Notes</Label>
        <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-slate-800 border-slate-700 text-white" placeholder="Any notes..." />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300">Cancel</Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => {
          // TODO: POST to /api/activities
          onClose();
        }}>Create Activity</Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [activities, setActivities] = useState<ActivityWithRelations[]>(MOCK_ACTIVITIES);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('molofu_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const grouped = groupActivitiesByPeriod(activities);

  const sections = [
    { label: '🌅 Morning', items: grouped.morning },
    { label: '☀️ Afternoon', items: grouped.afternoon },
    { label: '🌙 Evening', items: grouped.evening },
  ];

  const critical = activities.filter(a => a.priority === 'critical' && a.status !== 'completed');
  const inProgress = activities.filter(a => a.status === 'in_progress');

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{getGreeting()}, {user?.display_name ?? 'Commander'}</h1>
          <p className="text-sm text-slate-400">
            {new Date().toLocaleDateString('en-HK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2" onClick={() => setDialogOpen(true)}>
          <span>+</span> New Activity
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Activity</DialogTitle>
            </DialogHeader>
            <NewActivityForm onClose={() => setDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Critical alerts */}
      {critical.length > 0 && (
        <div className="mb-6 space-y-2">
          {critical.map(a => (
            <Card key={a.id} className="bg-red-900/30 border-red-700">
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-xl">🚨</span>
                <div>
                  <p className="text-red-400 font-medium text-sm">CRITICAL: {a.title}</p>
                  <p className="text-red-300/60 text-xs">{a.start_time} — {a.location_name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* In progress */}
      {inProgress.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-indigo-400 uppercase mb-3 tracking-wider">In Progress</h2>
          <div className="space-y-2">
            {inProgress.map(a => <ActivityCard key={a.id} activity={a} />)}
          </div>
        </div>
      )}

      {/* Grouped timeline */}
      {sections.map(section => (
        section.items.length > 0 && (
          <div key={section.label} className="mb-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase mb-3 tracking-wider">{section.label}</h2>
            <div className="space-y-2">
              {section.items.map(a => <ActivityCard key={a.id} activity={a} />)}
            </div>
          </div>
        )
      ))}

      {activities.length === 0 && (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🏠</p>
          <p className="text-slate-400 text-lg">No activities today</p>
          <p className="text-slate-500 text-sm">Tap "+ New Activity" to schedule one</p>
        </div>
      )}
    </div>
  );
}
