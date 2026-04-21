import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { Users, Search, Trash2, Edit2, Save, X } from 'lucide-react';

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: '', course: '', semester: 0 });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    api.get('/admin/students').then(r => setStudents(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  const startEdit = (s: any) => {
    setEditing(s.id);
    setEditForm({ name: s.name, course: s.course, semester: s.semester });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await api.put(`/admin/students/${editing}`, editForm);
      setEditing(null);
      loadStudents();
    } catch (err) { console.error(err); }
  };

  const deleteStudent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      loadStudents();
    } catch (err) { console.error(err); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48 mb-4" /><div className="h-64 bg-slate-800 rounded-xl" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Student Management</h1>
        <Badge variant="outline" className="border-blue-500/30 text-blue-400">{students.length} students</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
        <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-white/5 border-white/10 text-white pl-10" />
      </div>

      <Card className="bg-slate-900/50 border-white/5">
        <CardContent className="pt-5">
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-4 text-xs text-slate-500 font-medium pb-2 border-b border-white/5 px-2">
              <span>Name</span><span>Email</span><span>Course</span><span>Semester</span><span className="text-right">Actions</span>
            </div>
            {filtered.map(s => (
              <div key={s.id} className="grid grid-cols-5 gap-4 items-center py-3 px-2 rounded-lg hover:bg-white/5 transition-colors">
                {editing === s.id ? (
                  <>
                    <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white text-sm h-8" />
                    <span className="text-sm text-slate-400">{s.email}</span>
                    <Input value={editForm.course} onChange={e => setEditForm({ ...editForm, course: e.target.value })}
                      className="bg-white/5 border-white/10 text-white text-sm h-8" />
                    <Input type="number" value={editForm.semester} onChange={e => setEditForm({ ...editForm, semester: parseInt(e.target.value) })}
                      className="bg-white/5 border-white/10 text-white text-sm h-8 w-16" />
                    <div className="flex gap-1 justify-end">
                      <button onClick={saveEdit} className="p-1.5 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"><Save size={14} /></button>
                      <button onClick={() => setEditing(null)} className="p-1.5 rounded bg-slate-500/20 text-slate-400 hover:bg-slate-500/30"><X size={14} /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">{s.name.charAt(0)}</div>
                      <span className="text-sm text-white">{s.name}</span>
                    </div>
                    <span className="text-sm text-slate-400 truncate">{s.email}</span>
                    <span className="text-sm text-slate-400">{s.course}</span>
                    <span className="text-sm text-slate-400">Sem {s.semester}</span>
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => startEdit(s)} className="p-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"><Edit2 size={14} /></button>
                      <button onClick={() => deleteStudent(s.id)} className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"><Trash2 size={14} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {filtered.length === 0 && <p className="text-slate-500 text-center py-8">No students found</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
