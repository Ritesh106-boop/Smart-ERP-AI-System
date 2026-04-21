import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { Fee } from '@/types';
import { DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function AdminFees() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/fees').then(r => setFees(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.put(`/admin/fees/${id}`, { status });
      const res = await api.get('/admin/fees');
      setFees(res.data);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48 mb-4" /><div className="h-64 bg-slate-800 rounded-xl" /></div>;

  const paid = fees.filter(f => f.status === 'paid');
  const pending = fees.filter(f => f.status === 'pending');
  const overdue = fees.filter(f => f.status === 'overdue');

  const pieData = [
    { name: 'Paid', value: paid.reduce((s, f) => s + Number(f.amount), 0) },
    { name: 'Pending', value: pending.reduce((s, f) => s + Number(f.amount), 0) },
    { name: 'Overdue', value: overdue.reduce((s, f) => s + Number(f.amount), 0) },
  ];
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const statusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle size={14} className="text-emerald-400" />;
    if (status === 'overdue') return <AlertTriangle size={14} className="text-red-400" />;
    return <Clock size={14} className="text-amber-400" />;
  };

  const statusColor = (status: string) => {
    if (status === 'paid') return 'border-emerald-500/30 text-emerald-400';
    if (status === 'overdue') return 'border-red-500/30 text-red-400';
    return 'border-amber-500/30 text-amber-400';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Fee Management</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardContent className="pt-5 text-center">
            <p className="text-emerald-400 text-sm font-medium">Collected</p>
            <p className="text-2xl font-bold text-white mt-1">₹{paid.reduce((s, f) => s + Number(f.amount), 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{paid.length} payments</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="pt-5 text-center">
            <p className="text-amber-400 text-sm font-medium">Pending</p>
            <p className="text-2xl font-bold text-white mt-1">₹{pending.reduce((s, f) => s + Number(f.amount), 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{pending.length} payments</p>
          </CardContent>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="pt-5 text-center">
            <p className="text-red-400 text-sm font-medium">Overdue</p>
            <p className="text-2xl font-bold text-white mt-1">₹{overdue.reduce((s, f) => s + Number(f.amount), 0).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">{overdue.length} payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Records */}
      <Card className="bg-slate-900/50 border-white/5">
        <CardHeader><CardTitle className="text-white text-base">All Fee Records</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-4 text-xs text-slate-500 font-medium pb-2 border-b border-white/5 px-2">
              <span>Student</span><span>Description</span><span>Amount</span><span>Due Date</span><span>Status</span><span className="text-right">Action</span>
            </div>
            {fees.map(f => (
              <div key={f.id} className="grid grid-cols-6 gap-4 items-center py-3 px-2 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-sm text-white">{f.student_name}</span>
                <span className="text-sm text-slate-400">{f.description}</span>
                <span className="text-sm text-white font-medium">₹{Number(f.amount).toLocaleString()}</span>
                <span className="text-sm text-slate-400">{f.due_date ? new Date(f.due_date).toLocaleDateString() : 'N/A'}</span>
                <Badge variant="outline" className={statusColor(f.status)}>
                  <span className="flex items-center gap-1">{statusIcon(f.status)} {f.status}</span>
                </Badge>
                <div className="flex gap-1 justify-end">
                  {f.status !== 'paid' && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(f.id, 'paid')}
                      className="text-emerald-400 hover:bg-emerald-500/20 h-7 text-xs">Mark Paid</Button>
                  )}
                  {f.status === 'pending' && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(f.id, 'overdue')}
                      className="text-red-400 hover:bg-red-500/20 h-7 text-xs">Overdue</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
