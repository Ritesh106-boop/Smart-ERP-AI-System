import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { Subject } from '@/types';

export default function FacultyMarks() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, { marks: string; max_marks: string; exam_type: string }>>({});
  const [examType, setExamType] = useState('midterm');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/faculty/subjects').then(r => { setSubjects(r.data); setLoading(false); }).catch(console.error);
  }, []);

  const loadStudents = async (subjectId: number) => {
    setSelectedSubject(subjectId);
    const res = await api.get(`/faculty/subjects/${subjectId}/students`);
    setStudents(res.data);
    const initial: Record<string, any> = {};
    res.data.forEach((s: any) => { initial[s.student_id] = { marks: '', max_marks: '100', exam_type: examType }; });
    setMarks(initial);
  };

  const saveMarks = async () => {
    if (!selectedSubject) return;
    try {
      for (const [studentId, data] of Object.entries(marks)) {
        if (data.marks) {
          await api.post('/faculty/marks', {
            student_id: parseInt(studentId), subject_id: selectedSubject,
            exam_type: examType, marks: parseFloat(data.marks), max_marks: parseFloat(data.max_marks)
          });
        }
      }
      setMessage('Marks saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error saving marks'); }
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48"/></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Enter Marks</h1>

      <div className="flex flex-wrap gap-2">
        {subjects.map(s => (
          <Button key={s.id} variant={selectedSubject === s.id ? 'default' : 'outline'} size="sm"
            onClick={() => loadStudents(s.id)} className={selectedSubject === s.id ? 'bg-blue-600' : 'border-white/10 text-slate-400'}>
            {s.code}
          </Button>
        ))}
      </div>

      {selectedSubject && (
        <>
          <div className="flex gap-3 items-center">
            <select value={examType} onChange={e => setExamType(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm">
              <option value="midterm">Midterm</option>
              <option value="endterm">End Term</option>
              <option value="quiz1">Quiz 1</option>
              <option value="quiz2">Quiz 2</option>
              <option value="assignment">Assignment</option>
            </select>
            <Button onClick={saveMarks} className="bg-blue-600 hover:bg-blue-700">Save Marks</Button>
            {message && <Badge className="bg-green-500/20 text-green-400">{message}</Badge>}
          </div>

          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="pt-5 space-y-3">
              {students.map(s => (
                <div key={s.student_id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5">
                  <div className="flex-1">
                    <p className="text-sm text-white">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.email}</p>
                  </div>
                  <Input type="number" placeholder="Marks" value={marks[s.student_id]?.marks || ''}
                    onChange={e => setMarks(prev => ({ ...prev, [s.student_id]: { ...prev[s.student_id], marks: e.target.value } }))}
                    className="w-24 bg-white/5 border-white/10 text-white text-center" />
                  <span className="text-slate-500">/</span>
                  <Input type="number" placeholder="Max" value={marks[s.student_id]?.max_marks || '100'}
                    onChange={e => setMarks(prev => ({ ...prev, [s.student_id]: { ...prev[s.student_id], max_marks: e.target.value } }))}
                    className="w-20 bg-white/5 border-white/10 text-white text-center" />
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
