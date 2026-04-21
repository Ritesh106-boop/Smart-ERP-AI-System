import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import type { DashboardData } from '@/types';
import { Users, BookOpen, FileText, Upload, Megaphone, ArrowUpRight } from 'lucide-react';

export default function FacultyDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/faculty/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-800 rounded w-48"/><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-32 bg-slate-800 rounded-xl"/>)}</div></div>;
  if (!data) return <div className="text-slate-400">Failed to load</div>;

  const stats = [
    { icon: BookOpen, label: 'Subjects', value: data.subjectCount, color: 'green', sub: 'Assigned courses' },
    { icon: Users, label: 'Students', value: data.studentCount, color: 'blue', sub: 'Enrolled students' },
    { icon: FileText, label: 'Assignments', value: data.assignmentCount, color: 'purple', sub: 'Created' },
    { icon: Upload, label: 'Materials', value: data.materialCount, color: 'amber', sub: 'Uploaded' },
  ];

  const colorMap: Record<string, string> = {
    green: 'from-green-500/20 to-green-500/5 border-green-500/10',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/10',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/10',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/10',
  };
  const iconColor: Record<string, string> = {
    green: 'text-green-400', blue: 'text-blue-400', purple: 'text-purple-400', amber: 'text-amber-400'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Faculty Dashboard 👨‍🏫</h1>
        <p className="text-slate-400 mt-1">Department: {data.department}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className={`bg-gradient-to-br ${colorMap[s.color]} border`}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <s.icon className={`w-5 h-5 ${iconColor[s.color]}`} />
                <ArrowUpRight className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-white text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a href="/dashboard/attendance" className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors text-center">
              <p className="text-green-400 font-medium text-sm">Mark Attendance</p>
              <p className="text-xs text-slate-500 mt-1">Record today's attendance</p>
            </a>
            <a href="/dashboard/marks" className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-center">
              <p className="text-blue-400 font-medium text-sm">Enter Marks</p>
              <p className="text-xs text-slate-500 mt-1">Update exam results</p>
            </a>
            <a href="/dashboard/assignments" className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-center">
              <p className="text-purple-400 font-medium text-sm">Create Assignment</p>
              <p className="text-xs text-slate-500 mt-1">Add new assignment</p>
            </a>
          </div>
        </CardContent>
      </Card>

      {data.announcements && data.announcements.length > 0 && (
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><Megaphone className="w-4 h-4 text-blue-400"/>Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {data.announcements.map((ann: any, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                <p className="text-sm font-medium text-white">{ann.title}</p>
                <p className="text-xs text-slate-400 mt-1">{ann.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
