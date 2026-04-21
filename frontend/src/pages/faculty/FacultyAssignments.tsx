import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { Subject, Assignment } from '@/types';
import { Plus, FileText, Users } from 'lucide-react';

export default function FacultyAssignments() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject_id: 0, title: '', description: '', deadline: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/faculty/subjects'), api.get('/faculty/assignments')])
      .then(([subRes, assRes]) => { setSubjects(subRes.data); setAssignments(assRes.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/faculty/assignments', form);
      const res = await api.get('/faculty/assignments');
      setAssignments(res.data);
      setShowForm(false);
      setForm({ subject_id: 0, title: '', description: '', deadline: '' });
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48"/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Assignments</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
          <Plus size={16} className="mr-1"/> New Assignment
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-900/50 border-purple-500/20">
          <CardContent className="pt-5 space-y-3">
            <select value={form.subject_id} onChange={e => setForm({ ...form, subject_id: parseInt(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm">
              <option value={0}>Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
            </select>
            <Input placeholder="Assignment Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white" />
            <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white" />
            <Input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
              className="bg-white/5 border-white/10 text-white" />
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">Create</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-white/10 text-slate-400">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {assignments.map(a => (
          <Card key={a.id} className="bg-slate-900/50 border-white/5">
            <CardContent className="pt-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400"><FileText size={20}/></div>
              <div className="flex-1">
                <p className="font-medium text-white">{a.title}</p>
                <p className="text-xs text-slate-500">{a.subject_name} · Due: {a.deadline ? new Date(a.deadline).toLocaleDateString() : 'N/A'}</p>
              </div>
              <Badge variant="outline" className="border-white/10 text-slate-400 flex items-center gap-1">
                <Users size={12}/> {a.submission_count || 0} submitted
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
