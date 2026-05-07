export const MAGIC_PHONE = '+852 00000000';
export const MAGIC_CODE = '123456';

export const ACTIVITY_TYPE_LABELS: Record<string, { en: string; zh: string; icon: string }> = {
  pickup: { en: 'Pickup', zh: '接人', icon: '🚗' },
  dropoff: { en: 'Dropoff', zh: '送人', icon: '📍' },
  lesson: { en: 'Lesson', zh: '課堂', icon: '🎹' },
  tutor: { en: 'Tutor', zh: '補習', icon: '📚' },
  medical: { en: 'Medical', zh: '醫療', icon: '🏥' },
  social: { en: 'Social', zh: '社交', icon: '🎉' },
  other: { en: 'Other', zh: '其他', icon: '📌' },
};

export const PRIORITY_LABELS: Record<string, { en: string; zh: string }> = {
  low: { en: 'Low', zh: '低' },
  normal: { en: 'Normal', zh: '一般' },
  high: { en: 'High', zh: '高' },
  critical: { en: 'Critical', zh: '緊急' },
};

export const ROLE_LABELS: Record<string, { en: string; zh: string }> = {
  commander: { en: 'Commander', zh: '家長' },
  helper: { en: 'Helper', zh: '傭工' },
  observer: { en: 'Observer', zh: '觀察者' },
};

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh-HK', label: '中文' },
];
