import { Navigate } from 'react-router-dom';
import { useClassroomStore } from '../../stores/classroomStore';
import { TeacherDashboard } from './TeacherDashboard';
import { StudentHome } from './StudentHome';

export function ClassesHome() {
  const { backendUrl, certTrusted, role, token } = useClassroomStore();

  if (!backendUrl || !certTrusted) return <Navigate to="/classes/connect" replace />;
  if (!role || !token) return <Navigate to="/classes/auth" replace />;

  return role === 'teacher' ? <TeacherDashboard /> : <StudentHome />;
}
