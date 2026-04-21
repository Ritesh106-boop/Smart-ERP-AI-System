import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { DashboardData } from '@/types';
import {
  ClipboardCheck, BarChart3, FileText, DollarSign, BookOpen, AlertTriangle,
  TrendingUp, TrendingDown, CheckCircle, ArrowUpRight, Megaphone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/dashboard'),
      api.get('/student/attendance')
    ]).then(([dashRes, attRes]) => {
      setData(dashRes.data);
      setAttendance(attRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!data) return <div className="text-slate-400">Failed to load dashboard</div>;

  const chartData = attendance.map(a => ({
    name: a.code,
    attended: a.attended,
    absent: a.total_classes - a.attended,
    percentage: a.percentage
  }));

  const pieData = [
    { name: 'Present', value: data.attendedClasses || 0 },
    { name: 'Absent', value: (data.totalClasses || 0) - (data.attendedClasses || 0) }
  ];
  const COLORS = ['#8b5cf6', '#334155'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {data.profile?.course || 'Student'} 👋</h1>
        <p className="text-slate-400 mt-1">Semester {data.profile?.semester} · Here's your academic overview</p>
      </div>

      {/* Risk Alert */}
      {data.riskLevel === 'high' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Attendance Alert!</p>
            <p className="text-sm opacity-80">Your overall attendance is below 75%. You are at risk of being detained.</p>
          </div>
        </div>
      )}
      {data.riskLevel === 'warning' && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Attendance Warning</p>
            <p className="text-sm opacity-80">Your attendance is below 80%. Attend more classes to stay safe.</p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={ClipboardCheck} label="Attendance" value={`${data.overallAttendance}%`}
          color="purple" sub={`${data.attendedClasses}/${data.totalClasses} classes`} />
        <StatCard icon={BarChart3} label="Avg Marks" value={`${data.avgMarks}%`}
          color="blue" sub={data.avgMarks! >= 60 ? '✓ Above average' : '⚠ Needs improvement'} />
        <StatCard icon={FileText} label="Pending" value={`${data.pendingAssignments}`}
          color="amber" sub="Assignments due" />
        <StatCard icon={DollarSign} label="Fees Due" value={`₹${(data.pendingFees || 0).toLocaleString()}`}
          color="emerald" sub={data.pendingFees ? 'Payment pending' : 'All clear!'} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance Bar Chart */}
        <Card className="lg:col-span-2 bg-slate-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-white text-base">Attendance by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} itemStyle={{ color: '#fff' }} />
                <Bar dataKey="attended" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#334155" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Overall Pie */}
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-white text-base">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-2">
              <p className="text-3xl font-bold text-white">{data.overallAttendance}%</p>
              <p className="text-xs text-slate-500">{data.attendedClasses} of {data.totalClasses} classes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Smart Insights */}
      <Card className="bg-slate-900/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Smart Attendance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attendance.map((a) => (
              <div key={a.subject_id} className={`p-4 rounded-lg border ${
                a.riskLevel === 'high' ? 'bg-red-500/5 border-red-500/20' :
                a.riskLevel === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                'bg-emerald-500/5 border-emerald-500/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">{a.subject_name}</span>
                  <Badge variant="outline" className={
                    a.riskLevel === 'high' ? 'border-red-500/30 text-red-400' :
                    a.riskLevel === 'warning' ? 'border-amber-500/30 text-amber-400' :
                    'border-emerald-500/30 text-emerald-400'
                  }>
                    {a.percentage}%
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">{a.attended}/{a.total_classes} classes attended</p>
                {a.riskLevel === 'safe' && a.classesCanSkip > 0 && (
                  <p className="text-xs text-emerald-400 mt-1">✓ You can skip {a.classesCanSkip} more classes</p>
                )}
                {a.riskLevel !== 'safe' && a.classesNeeded > 0 && (
                  <p className="text-xs text-red-400 mt-1">⚠ Must attend next {a.classesNeeded} classes</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Announcements */}
      {data.announcements && data.announcements.length > 0 && (
        <Card className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-blue-400" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.announcements.map((ann, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/5">
                <p className="text-sm font-medium text-white">{ann.title}</p>
                <p className="text-xs text-slate-400 mt-1">{ann.content}</p>
                <p className="text-xs text-slate-600 mt-2">{new Date(ann.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, sub }: any) {
  const colorMap: Record<string, string> = {
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/10',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/10',
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/10',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/10',
  };
  const iconColor: Record<string, string> = {
    purple: 'text-purple-400', blue: 'text-blue-400', amber: 'text-amber-400', emerald: 'text-emerald-400'
  };

  return (
    <Card className={`bg-gradient-to-br ${colorMap[color]} border`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <Icon className={`w-5 h-5 ${iconColor[color]}`} />
          <ArrowUpRight className="w-4 h-4 text-slate-600" />
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400 mt-1">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-slate-800 rounded w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-xl" />)}
      </div>
      <div className="h-64 bg-slate-800 rounded-xl" />
    </div>
  );
}
