import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, LayoutDashboard, BookOpen, ClipboardCheck, FileText,
  Users, DollarSign, Megaphone, LogOut, Menu, X, BarChart3,
  Upload, StickyNote, Settings, ChevronRight
} from 'lucide-react';

const studentNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/dashboard/marks', label: 'Marks', icon: BarChart3 },
  { path: '/dashboard/assignments', label: 'Assignments', icon: FileText },
  { path: '/dashboard/materials', label: 'Materials', icon: BookOpen },
  { path: '/dashboard/notes', label: 'Notes', icon: StickyNote },
];

const facultyNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/attendance', label: 'Mark Attendance', icon: ClipboardCheck },
  { path: '/dashboard/marks', label: 'Enter Marks', icon: BarChart3 },
  { path: '/dashboard/assignments', label: 'Assignments', icon: FileText },
  { path: '/dashboard/materials', label: 'Materials', icon: Upload },
];

const adminNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/students', label: 'Students', icon: Users },
  { path: '/dashboard/fees', label: 'Fees', icon: DollarSign },
  { path: '/dashboard/subjects', label: 'Subjects', icon: BookOpen },
  { path: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = user?.role === 'student' ? studentNav
    : user?.role === 'faculty' ? facultyNav
    : adminNav;

  const roleLabel = user?.role === 'student' ? '🎓 Student' : user?.role === 'faculty' ? '👨‍🏫 Faculty' : '⚙️ Admin';
  const roleColor = user?.role === 'student' ? 'from-blue-500 to-cyan-500'
    : user?.role === 'faculty' ? 'from-green-500 to-emerald-500'
    : 'from-purple-500 to-pink-500';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 p-5 border-b border-white/5">
            <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${roleColor} shadow-lg`}>
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm">SmartERP AI</h1>
              <p className="text-xs text-slate-500">{roleLabel}</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-slate-400">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-purple-400' : 'group-hover:text-purple-400 transition-colors'} />
                  {item.label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-purple-400" />}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-sm font-bold`}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-9"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
