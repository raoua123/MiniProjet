import { useAuth } from "@/lib/auth";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import AdminDashboard from "./AdminDashboard";

export default function DashboardHome() {
  const { profile } = useAuth();

  if (profile?.role === "admin") return <AdminDashboard />;
  if (profile?.role === "teacher") return <TeacherDashboard />;
  return <StudentDashboard />;
}
