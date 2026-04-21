import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { Subject } from '@/types';
import { Plus, BookOpen } from 'lucide-react';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', credits: 3, semester: 1 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/admin/subjects').then(r => setSubjects(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    try {
      await api.post('/admin/subjects', form);
      const res = await api.get('/admin/subjects');
      setSubjects(res.data);
      setShowForm(false);
      setForm({ name: '', code: '', credits: 3, semester: 1 });
      setMessage('Subject created!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48 mb-4" /><div className="h-64 bg-slate-800 rounded-xl" /></div>;

  // Group by semester
  const bySemester = subjects.reduce((acc: Record<number, Subject[]>, s) => {
    if (!acc[s.semester]) acc[s.semester] = [];
    acc[s.semester].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Subject Management</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
          <Plus size={16} className="mr-1" /> Add Subject
        </Button>
      </div>

      {message && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{message}</div>}

      {showForm && (
        <Card className="bg-slate-900/50 border-purple-500/20">
          <CardContent className="pt-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Subject Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white" />
              <Input placeholder="Subject Code (e.g. CS101)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                className="bg-white/5 border-white/10 text-white" />
              <Input type="number" placeholder="Credits" value={form.credits} min={1} max={6}
                onChange={e => setForm({ ...form, credits: parseInt(e.target.value) })}
                className="bg-white/5 border-white/10 text-white" />
              <Input type="number" placeholder="Semester" value={form.semester} min={1} max={8}
                onChange={e => setForm({ ...form, semester: parseInt(e.target.value) })}
                className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">Create Subject</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-white/10 text-slate-400">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(bySemester).sort(([a], [b]) => Number(a) - Number(b)).map(([sem, subs]) => (
        <Card key={sem} className="bg-slate-900/50 border-white/5">
          <CardHeader>
            <CardTitle className="text-white text-base">Semester {sem}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subs.map(s => (
                <div key={s.id} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-purple-500/20 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-purple-400" />
                    <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">{s.code}</Badge>
                  </div>
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{s.credits} Credits</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
