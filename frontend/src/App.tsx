import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardLayout from '@/components/DashboardLayout';

// Student pages
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentAttendance from '@/pages/student/StudentAttendance';
import StudentMarks from '@/pages/student/StudentMarks';
import StudentAssignments from '@/pages/student/StudentAssignments';
import StudentMaterials from '@/pages/student/StudentMaterials';
import StudentNotes from '@/pages/student/StudentNotes';

// Faculty pages
import FacultyDashboard from '@/pages/faculty/FacultyDashboard';
import FacultyAttendance from '@/pages/faculty/FacultyAttendance';
import FacultyMarks from '@/pages/faculty/FacultyMarks';
import FacultyAssignments from '@/pages/faculty/FacultyAssignments';
import FacultyMaterials from '@/pages/faculty/FacultyMaterials';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminFees from '@/pages/admin/AdminFees';
import AdminSubjects from '@/pages/admin/AdminSubjects';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
}

function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentDashboard />;
  if (user?.role === 'faculty') return <FacultyDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return <Navigate to="/login" />;
}

function RoleAttendance() {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentAttendance />;
  if (user?.role === 'faculty') return <FacultyAttendance />;
  return <Navigate to="/dashboard" />;
}

function RoleMarks() {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentMarks />;
  if (user?.role === 'faculty') return <FacultyMarks />;
  return <Navigate to="/dashboard" />;
}

function RoleAssignments() {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentAssignments />;
  if (user?.role === 'faculty') return <FacultyAssignments />;
  return <Navigate to="/dashboard" />;
}

function RoleMaterials() {
  const { user } = useAuth();
  if (user?.role === 'student') return <StudentMaterials />;
  if (user?.role === 'faculty') return <FacultyMaterials />;
  return <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<RoleDashboard />} />
            <Route path="attendance" element={<RoleAttendance />} />
            <Route path="marks" element={<RoleMarks />} />
            <Route path="assignments" element={<RoleAssignments />} />
            <Route path="materials" element={<RoleMaterials />} />
            {/* Student-only */}
            <Route path="notes" element={<StudentNotes />} />
            {/* Admin-only */}
            <Route path="students" element={<AdminStudents />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
          </Route>

          {/* Redirect root to dashboard or login */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
