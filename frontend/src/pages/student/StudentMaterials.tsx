import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import type { Material } from '@/types';
import { BookOpen, Download, FileText } from 'lucide-react';

export default function StudentMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/materials').then(r => setMaterials(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48 mb-4"/><div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-slate-800 rounded-xl"/>)}</div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Study Materials</h1>
      <div className="space-y-3">
        {materials.map(m => (
          <Card key={m.id} className="bg-slate-900/50 border-white/5 hover:border-white/10 transition-colors">
            <CardContent className="pt-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                <BookOpen size={20}/>
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{m.title}</p>
                <p className="text-xs text-slate-500">{m.subject_name} ({m.code}) · {new Date(m.uploaded_at).toLocaleDateString()}</p>
              </div>
              {m.file_path && <a href={`/${m.file_path}`} target="_blank" className="text-purple-400 hover:text-purple-300"><Download size={18}/></a>}
            </CardContent>
          </Card>
        ))}
        {materials.length === 0 && <p className="text-slate-500 text-center py-8">No materials uploaded yet</p>}
      </div>
    </div>
  );
}
