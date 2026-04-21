import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { AttendanceRecord } from '@/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentAttendance() {
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/attendance').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48 mb-4"/><div className="h-64 bg-slate-800 rounded-xl"/></div>;

  const chartData = data.map(d => ({ name: d.code, percentage: d.percentage }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Attendance Tracker</h1>

      <Card className="bg-slate-900/50 border-white/5">
        <CardHeader><CardTitle className="text-white text-base">Attendance Percentage by Subject</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
              <Bar dataKey="percentage" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(a => (
          <Card key={a.subject_id} className={`border ${
            a.riskLevel === 'high' ? 'bg-red-500/5 border-red-500/20' :
            a.riskLevel === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
            'bg-emerald-500/5 border-emerald-500/20'
          }`}>
            <CardContent className="pt-5">
              <div className="flex justify-between items-start mb-3">
                <div><p className="font-medium text-white">{a.subject_name}</p><p className="text-xs text-slate-500">{a.code}</p></div>
                <Badge variant="outline" className={
                  a.riskLevel === 'high' ? 'border-red-500/30 text-red-400' :
                  a.riskLevel === 'warning' ? 'border-amber-500/30 text-amber-400' :
                  'border-emerald-500/30 text-emerald-400'
                }>{a.percentage}%</Badge>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-3">
                <div className={`h-2 rounded-full ${
                  a.riskLevel === 'high' ? 'bg-red-500' : a.riskLevel === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} style={{ width: `${Math.min(a.percentage, 100)}%` }}/>
              </div>
              <div className="space-y-1 text-xs">
                <p className="text-slate-400">📊 {a.attended} of {a.total_classes} classes attended</p>
                {a.riskLevel === 'safe' && a.classesCanSkip > 0 && <p className="text-emerald-400">✅ You can safely skip {a.classesCanSkip} more classes</p>}
                {a.riskLevel !== 'safe' && a.classesNeeded > 0 && <p className="text-red-400">🚨 Must attend next {a.classesNeeded} classes continuously</p>}
                {a.riskLevel === 'high' && <p className="text-red-400 font-medium">⚠️ CRITICAL: Below 75% — Detention risk!</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
