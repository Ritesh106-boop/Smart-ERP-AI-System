import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { Mark } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentMarks() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/marks').then(r => setMarks(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48 mb-4"/><div className="h-64 bg-slate-800 rounded-xl"/></div>;

  // Group by subject
  const bySubject = marks.reduce((acc: Record<string, Mark[]>, m) => {
    const key = m.subject_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const chartData = Object.entries(bySubject).map(([name, ms]) => {
    const avg = ms.reduce((sum, m) => sum + (m.marks / m.max_marks * 100), 0) / ms.length;
    return { name: ms[0].code, percentage: Math.round(avg) };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Academic Progress</h1>

      <Card className="bg-slate-900/50 border-white/5">
        <CardHeader><CardTitle className="text-white text-base">Performance Overview</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} formatter={(v: any) => `${v}%`} />
              <Bar dataKey="percentage" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {Object.entries(bySubject).map(([subject, ms]) => {
        const avg = ms.reduce((sum, m) => sum + (m.marks / m.max_marks * 100), 0) / ms.length;
        const isLow = avg < 40;
        return (
          <Card key={subject} className={`border ${isLow ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-900/50 border-white/5'}`}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-base">{subject}</CardTitle>
                <Badge variant="outline" className={isLow ? 'border-red-500/30 text-red-400' : 'border-blue-500/30 text-blue-400'}>
                  Avg: {Math.round(avg)}%
                </Badge>
              </div>
              {isLow && <p className="text-xs text-red-400 mt-1">⚠️ Performance below threshold — needs improvement</p>}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ms.map(m => (
                  <div key={m.id} className="p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-slate-500 capitalize">{m.exam_type}</p>
                    <p className="text-lg font-bold text-white">{m.marks}<span className="text-sm text-slate-500">/{m.max_marks}</span></p>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                      <div className={`h-1.5 rounded-full ${(m.marks/m.max_marks*100) >= 60 ? 'bg-blue-500' : (m.marks/m.max_marks*100) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${(m.marks/m.max_marks*100)}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
