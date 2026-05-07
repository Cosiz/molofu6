'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const POSTS = [
  {
    id: '1', family_id: 'f1', author_id: 'm1', author_member_id: 'm1', post_type: 'photo' as const,
    content: 'Kids safely arrived at school! 🚸',
    photo_url: null, related_activity_id: null, created_at: new Date(Date.now() - 3600000).toISOString(),
    author_name: 'Ah Mei', author_role: 'helper' as const,
  },
  {
    id: '2', family_id: 'f1', author_id: 'm2', author_member_id: 'm2', post_type: 'update' as const,
    content: 'James finished his math tutor session. Great progress on fractions! 📚',
    photo_url: null, related_activity_id: null, created_at: new Date(Date.now() - 7200000).toISOString(),
    author_name: 'Ah Fu', author_role: 'helper' as const,
  },
  {
    id: '3', family_id: 'f1', author_id: 'p1', author_member_id: null, post_type: 'alert' as const,
    content: '🚨 Medical appointment tomorrow at 11am — please confirm who can take Aiko',
    photo_url: null, related_activity_id: null, created_at: new Date(Date.now() - 86400000).toISOString(),
    author_name: 'Commander', author_role: 'commander' as const,
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TimelinePage() {
  const router = useRouter();
  const roleColors: Record<string, string> = {
    commander: 'bg-indigo-600', helper: 'bg-green-600', observer: 'bg-slate-500',
  };
  const roleBgColors: Record<string, string> = {
    commander: 'bg-indigo-50 border-indigo-200',
    helper: 'bg-green-50 border-green-200',
    observer: 'bg-slate-50 border-slate-200',
  };
  const postIcons: Record<string, string> = {
    photo: '📷', update: '💬', milestone: '🎉', alert: '🚨',
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-900">Family Timeline</h1>
        <p className="text-xs text-slate-500">Everyone's activity in one place</p>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {POSTS.map(post => (
          <Card key={post.id} className={`${roleBgColors[post.author_role ?? 'observer']} border`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className={`${roleColors[post.author_role ?? 'observer']} text-white text-xs`}>
                    {(post.author_name ?? 'U')[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900">{post.author_name}</span>
                    <Badge
                      className={`${roleColors[post.author_role ?? 'observer']} text-white border-0 text-xs`}
                    >
                      {post.author_role}
                    </Badge>
                    <span className="text-xs text-slate-400 ml-auto">{timeAgo(post.created_at)}</span>
                  </div>
                  {post.content && (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
