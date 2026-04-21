export interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  profile?: StudentProfile | FacultyProfile;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  course: string;
  semester: number;
}

export interface FacultyProfile {
  id: number;
  user_id: number;
  department: string;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  credits: number;
  semester: number;
}

export interface AttendanceRecord {
  subject_id: number;
  subject_name: string;
  code: string;
  total_classes: number;
  attended: number;
  percentage: number;
  classesNeeded: number;
  classesCanSkip: number;
  riskLevel: 'high' | 'warning' | 'safe';
}

export interface Mark {
  id: number;
  student_id: number;
  subject_id: number;
  subject_name: string;
  code: string;
  exam_type: string;
  marks: number;
  max_marks: number;
}

export interface Assignment {
  id: number;
  subject_id: number;
  subject_name: string;
  code: string;
  title: string;
  description: string;
  deadline: string;
  submission_id?: number;
  submitted_file?: string;
  submitted_at?: string;
  submission_count?: number;
}

export interface Material {
  id: number;
  subject_id: number;
  subject_name: string;
  code: string;
  title: string;
  file_path: string;
  uploaded_at: string;
}

export interface Note {
  id: number;
  student_id: number;
  title: string;
  file_path: string;
  shared: boolean;
  uploaded_at: string;
  author_name: string;
}

export interface Fee {
  id: number;
  student_id: number;
  student_name: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  target_role: string;
  created_at: string;
  posted_by: string;
}

export interface DashboardData {
  profile?: any;
  overallAttendance?: number;
  totalClasses?: number;
  attendedClasses?: number;
  subjectCount?: number;
  pendingAssignments?: number;
  avgMarks?: number;
  pendingFees?: number;
  announcements?: Announcement[];
  riskLevel?: string;
  // Faculty
  department?: string;
  assignmentCount?: number;
  materialCount?: number;
  studentCount?: number;
  // Admin
  facultyCount?: number;
  feeCollected?: number;
  feePending?: number;
  feeTotal?: number;
  documentsPending?: number;
  documentsTotal?: number;
  recentStudents?: any[];
}
