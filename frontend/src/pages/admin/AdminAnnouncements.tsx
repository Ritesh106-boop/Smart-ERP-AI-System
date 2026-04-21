import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { Announcement } from '@/types';
import { Plus, Megaphone, Trash2, Users, GraduationCap } from 'lucide-react';

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', target_role: 'all' });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = () => {
    api.get('/admin/announcements').then(r => setAnnouncements(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    try {
      await api.post('/admin/announcements', form);
      setShowForm(false);
      setForm({ title: '', content: '', target_role: 'all' });
      loadAnnouncements();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      loadAnnouncements();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48 mb-4" /><div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 bg-slate-800 rounded-xl" />)}</div></div>;

  const targetIcon = (role: string) => {
    if (role === 'student') return <GraduationCap size={12} />;
    if (role === 'faculty') return <Users size={12} />;
    return <Megaphone size={12} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Announcements</h1>
        <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700">
          <Plus size={16} className="mr-1" /> New Announcement
        </Button>
      </div>

      {showForm && (
        <Card className="bg-slate-900/50 border-purple-500/20">
          <CardContent className="pt-5 space-y-3">
            <Input placeholder="Announcement Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="bg-white/5 border-white/10 text-white" />
            <Textarea placeholder="Announcement content..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
              className="bg-white/5 border-white/10 text-white" rows={3} />
            <div className="flex gap-2">
              <select value={form.target_role} onChange={e => setForm({ ...form, target_role: e.target.value })}
                className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm">
                <option value="all">All Users</option>
                <option value="student">Students Only</option>
                <option value="faculty">Faculty Only</option>
              </select>
              <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700">Post</Button>
              <Button onClick={() => setShowForm(false)} variant="outline" className="border-white/10 text-slate-400">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {announcements.map(a => (
          <Card key={a.id} className="bg-slate-900/50 border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-white">{a.title}</h3>
                    <Badge variant="outline" className="border-white/10 text-slate-400 text-xs flex items-center gap-1">
                      {targetIcon(a.target_role)} {a.target_role}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{a.content}</p>
                  <p className="text-xs text-slate-600 mt-2">Posted by {a.posted_by} · {new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && <p className="text-slate-500 text-center py-8">No announcements yet</p>}
      </div>
    </div>
  );
}
