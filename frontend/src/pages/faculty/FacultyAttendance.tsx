import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import type { Subject } from '@/types';
import { CheckCircle, XCircle } from 'lucide-react';

export default function FacultyAttendance() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/faculty/subjects').then(r => { setSubjects(r.data); setLoading(false); }).catch(console.error);
  }, []);

  const loadStudents = async (subjectId: number) => {
    setSelectedSubject(subjectId);
    const res = await api.get(`/faculty/subjects/${subjectId}/students`);
    setStudents(res.data);
    const initial: Record<number, string> = {};
    res.data.forEach((s: any) => { initial[s.student_id] = 'present'; });
    setAttendance(initial);
  };

  const toggleAttendance = (studentId: number) => {
    setAttendance(prev => ({ ...prev, [studentId]: prev[studentId] === 'present' ? 'absent' : 'present' }));
  };

  const saveAttendance = async () => {
    if (!selectedSubject) return;
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([id, status]) => ({ student_id: parseInt(id), status }));
      await api.post('/faculty/attendance', { subject_id: selectedSubject, date, records });
      setMessage('Attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Failed to save'); }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse"><div className="h-8 bg-slate-800 rounded w-48"/></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Mark Attendance</h1>

      {/* Subject selection */}
      <div className="flex flex-wrap gap-2">
        {subjects.map(s => (
          <Button key={s.id} variant={selectedSubject === s.id ? 'default' : 'outline'} size="sm"
            onClick={() => loadStudents(s.id)}
            className={selectedSubject === s.id ? 'bg-green-600 hover:bg-green-700' : 'border-white/10 text-slate-400'}>
            {s.code} - {s.name}
          </Button>
        ))}
      </div>

      {selectedSubject && (
        <>
          <div className="flex gap-3 items-center">
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm" />
            <Button onClick={saveAttendance} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Saving...' : 'Save Attendance'}
            </Button>
            {message && <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{message}</Badge>}
          </div>

          <Card className="bg-slate-900/50 border-white/5">
            <CardContent className="pt-5">
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 text-xs text-slate-500 font-medium pb-2 border-b border-white/5">
                  <span>Student</span><span>Course</span><span className="text-right">Status</span>
                </div>
                {students.map(s => (
                  <div key={s.student_id} className="grid grid-cols-3 gap-4 items-center py-2 hover:bg-white/5 rounded-lg px-2 transition-colors">
                    <div>
                      <p className="text-sm text-white">{s.name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                    <p className="text-sm text-slate-400">{s.course} · Sem {s.semester}</p>
                    <div className="flex justify-end">
                      <button onClick={() => toggleAttendance(s.student_id)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          attendance[s.student_id] === 'present'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                        {attendance[s.student_id] === 'present' ? <><CheckCircle size={14}/> Present</> : <><XCircle size={14}/> Absent</>}
                      </button>
                    </div>
                  </div>
                ))}
                {students.length === 0 && <p className="text-slate-500 text-center py-4">No students enrolled</p>}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
