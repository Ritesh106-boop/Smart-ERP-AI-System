import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import type { Note } from '@/types';
import { StickyNote, Upload, Share2, User } from 'lucide-react';

export default function StudentNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  useEffect(() => {
    api.get('/student/notes').then(r => setNotes(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleUpload = async (shared: boolean) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title || file.name);
      formData.append('shared', String(shared));
      try {
        await api.post('/student/notes', formData);
        const res = await api.get('/student/notes');
        setNotes(res.data);
        setTitle('');
      } catch (err) { console.error(err); }
    };
    input.click();
  };

  if (loading) return <div className="animate-pulse space-y-3"><div className="h-8 bg-slate-800 rounded w-48"/>{[1,2].map(i=><div key={i} className="h-20 bg-slate-800 rounded-xl"/>)}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Notes</h1>

      <Card className="bg-slate-900/50 border-white/5">
        <CardContent className="pt-5">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input placeholder="Note title..." value={title} onChange={e => setTitle(e.target.value)}
                className="bg-white/5 border-white/10 text-white" />
            </div>
            <Button onClick={() => handleUpload(false)} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Upload size={14} className="mr-1"/> Private
            </Button>
            <Button onClick={() => handleUpload(true)} size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Share2 size={14} className="mr-1"/> Share
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {notes.map(n => (
          <Card key={n.id} className="bg-slate-900/50 border-white/5">
            <CardContent className="pt-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <StickyNote size={20}/>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{n.title}</p>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <User size={10}/> {n.author_name} · {new Date(n.uploaded_at).toLocaleDateString()}
                  {n.shared && <span className="text-purple-400">· Shared</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && <p className="text-slate-500 text-center py-8">No notes yet. Upload your first note!</p>}
      </div>
    </div>
  );
}
