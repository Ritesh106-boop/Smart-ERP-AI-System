import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import type { DashboardData } from '@/types';
import { Users, GraduationCap, BookOpen, DollarSign, FileCheck, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-800 rounded w-48"/><div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-32 bg-slate-800 rounded-xl"/>)}</div></div>;
  if (!data) return <div className="text-slate-400">Failed to load</div>;

  const stats = [
    { icon: GraduationCap, label: 'Students', value: data.studentCount, color: 'blue', sub: 'Total enrolled' },
    { icon: Users, label: 'Faculty', value: data.facultyCount, color: 'green', sub: 'Teaching staff' },
    { icon: BookOpen, label: 'Subjects', value: data.subjectCount, color: 'purple', sub: 'Active courses' },
    { icon: DollarSign, label: 'Revenue', value: `₹${((data.feeCollected || 0) / 1000).toFixed(0)}K`, color: 'amber', sub: `₹${((data.feePending || 0) / 1000).toFixed(0)}K pending` },
  ];

  const feeData = [
    { name: 'Collected', value: data.feeCollected || 0 },
    { name: 'Pending', value: data.feePending || 0 }
  ];
  const COLORS = ['#10b981', '#f59e0b'];

  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/10',
    green: 'from-green-500/20 to-green-500/5 border-green-500/10',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/10',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/10',
  };
  const iconColor: Record<string, string> = {
    blue: 'text-blue-400', green: 'text-green-400', purple: 'text-purple-400', amber: 'text-amber-400'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard ⚙️</h1>
        <p className="text-slate-400 mt-1">System overview and management</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fee Collection Chart */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-white text-base">Fee Collection Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={feeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {feeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} formatter={(val: any) => `₹${val.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-6 text-sm mt-2">
              <span className="text-emerald-400">● Collected: ₹{(data.feeCollected || 0).toLocaleString()}</span>
              <span className="text-amber-400">● Pending: ₹{(data.feePending || 0).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-white text-base">Recent Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentStudents?.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white">{s.name}</p>
                  <p className="text-xs text-slate-500">{s.course} · Sem {s.semester}</p>
                </div>
                <p className="text-xs text-slate-600">{new Date(s.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
