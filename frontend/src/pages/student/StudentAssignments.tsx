import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import type { Assignment } from '@/types';
import { FileText, Upload, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/assignments').then(r => setAssignments(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (assignmentId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
        await api.post(`/student/assignments/${assignmentId}/submit`, formData);
        // Refresh
        const res = await api.get('/student/assignments');
        setAssignments(res.data);
      } catch (err) { console.error(err); }
    };
    input.click();
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48 mb-4"/><div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-24 bg-slate-800 rounded-xl"/>)}</div></div>;

  const pendingCount = assignments.filter(a => !a.submission_id).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Assignments</h1>
        <Badge variant="outline" className="border-amber-500/30 text-amber-400">{pendingCount} pending</Badge>
      </div>

      <div className="space-y-3">
        {assignments.map(a => {
          const isPast = new Date(a.deadline) < new Date();
          const isSubmitted = !!a.submission_id;
          return (
            <Card key={a.id} className={`border ${isSubmitted ? 'bg-emerald-500/5 border-emerald-500/20' : isPast ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-900/50 border-white/5'}`}>
              <CardContent className="pt-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSubmitted ? 'bg-emerald-500/20 text-emerald-400' : isPast ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {isSubmitted ? <CheckCircle size={20}/> : isPast ? <AlertTriangle size={20}/> : <FileText size={20}/>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white">{a.title}</h3>
                    <Badge variant="outline" className="border-white/10 text-slate-400 text-xs">{a.code}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">{a.subject_name}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Clock size={12}/> Due: {new Date(a.deadline).toLocaleDateString()} {new Date(a.deadline).toLocaleTimeString()}
                  </p>
                  {isSubmitted && <p className="text-xs text-emerald-400 mt-1">✓ Submitted on {new Date(a.submitted_at!).toLocaleDateString()}</p>}
                </div>
                {!isSubmitted && (
                  <Button onClick={() => handleSubmit(a.id)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Upload size={14} className="mr-1"/> Submit
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
        {assignments.length === 0 && <p className="text-slate-500 text-center py-8">No assignments found</p>}
      </div>
    </div>
  );
}
