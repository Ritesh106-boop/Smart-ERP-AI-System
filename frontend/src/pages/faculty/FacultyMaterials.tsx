import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import type { Subject } from '@/types';
import { Upload, BookOpen } from 'lucide-react';

export default function FacultyMaterials() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState(0);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/faculty/subjects').then(r => { setSubjects(r.data); setLoading(false); }).catch(console.error);
  }, []);

  const handleUpload = () => {
    if (!selectedSubject || !title) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject_id', String(selectedSubject));
      formData.append('title', title);
      try {
        await api.post('/faculty/materials', formData);
        setMessage('Material uploaded!');
        setTitle('');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) { setMessage('Upload failed'); }
    };
    input.click();
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48"/></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Upload Materials</h1>

      <Card className="bg-slate-900/50 border-white/5">
        <CardContent className="pt-5 space-y-3">
          <select value={selectedSubject} onChange={e => setSelectedSubject(parseInt(e.target.value))}
            className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm">
            <option value={0}>Select Subject</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.code} - {s.name}</option>)}
          </select>
          <Input placeholder="Material Title" value={title} onChange={e => setTitle(e.target.value)}
            className="bg-white/5 border-white/10 text-white" />
          <Button onClick={handleUpload} className="bg-green-600 hover:bg-green-700">
            <Upload size={14} className="mr-1"/> Upload Material
          </Button>
          {message && <p className="text-sm text-green-400">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
