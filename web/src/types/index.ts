export type Role = 'commander' | 'helper' | 'observer';

export type ActivityType =
  | 'pickup'
  | 'dropoff'
  | 'lesson'
  | 'tutor'
  | 'medical'
  | 'social'
  | 'other';

export type ActivityStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type Priority = 'low' | 'normal' | 'high' | 'critical';

export type CheckinType = 'arrival' | 'departure' | 'completed';

export type NotificationType = 'info' | 'reminder' | 'alert' | 'critical';

export type PostType = 'update' | 'photo' | 'milestone' | 'alert';

export interface Family {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  phone: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  user_id: string | null;
  phone: string | null;
  role: Role;
  display_name: string | null;
  status: 'active' | 'inactive' | 'invited';
  created_at: string;
}

export interface Kid {
  id: string;
  family_id: string;
  name: string;
  birth_date: string | null;
  school_name: string | null;
  school_address: string | null;
  school_lat: number | null;
  school_lng: number | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Activity {
  id: string;
  family_id: string;
  kid_id: string | null;
  title: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  activity_type: ActivityType;
  assigned_to: string | null;
  status: ActivityStatus;
  priority: Priority;
  is_offline_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityWithRelations extends Activity {
  kids: Pick<Kid, 'name' | 'avatar_url'> | null;
  assigned_member: Pick<FamilyMember, 'display_name' | 'role'> | null;
}

export interface ActivityCheckin {
  id: string;
  activity_id: string;
  member_id: string | null;
  checkin_type: CheckinType;
  arrived_at: string | null;
  departed_at: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  family_id: string;
  user_id: string | null;
  title: string;
  body: string | null;
  notification_type: NotificationType;
  is_critical: boolean;
  is_read: boolean;
  related_activity_id: string | null;
  created_at: string;
}

export interface TimelinePost {
  id: string;
  family_id: string;
  author_id: string | null;
  author_member_id: string | null;
  post_type: PostType;
  content: string | null;
  photo_url: string | null;
  related_activity_id: string | null;
  created_at: string;
}

export interface TimelinePostWithAuthor extends TimelinePost {
  author_name: string | null;
  author_role: Role | null;
  activity?: Pick<Activity, 'title' | 'activity_type'> | null;
}

export interface SessionUser {
  id: string;
  phone: string | null;
  role: Role;
  family_id: string;
  member_id: string;
  display_name: string | null;
  preferred_language: string;
}
