'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useEffect } from 'react';

export default function ObserverPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-900">Family View</h1>
        <p className="text-xs text-slate-500">Observer — read only</p>
      </div>

      <div className="max-w-lg mx-auto p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
          <p className="text-sm text-blue-700">
            👁️ As an Observer, you can see all family activity but cannot make changes.
          </p>
        </div>
      </div>
    </div>
  );
}
