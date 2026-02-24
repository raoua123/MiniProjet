import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, BookOpen, Building2, CheckCircle, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0, filieres: 0 });

  const fetchData = async () => {
    const [pending, students, teachers, courses, filieres] = await Promise.all([
      supabase.from("profiles").select("*").eq("status", "pending"),
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "student").eq("status", "approved"),
      supabase.from("profiles").select("id", { count: "exact" }).eq("role", "teacher").eq("status", "approved"),
      supabase.from("courses").select("id", { count: "exact" }),
      supabase.from("filieres").select("id", { count: "exact" }),
    ]);
    setPendingUsers(pending.data || []);
    setStats({
      students: students.count || 0,
      teachers: teachers.count || 0,
      courses: courses.count || 0,
      filieres: filieres.count || 0,
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleApproval = async (userId: string, approve: boolean) => {
    await supabase.from("profiles").update({ status: approve ? "approved" : "rejected" }).eq("user_id", userId);
    toast.success(approve ? "Utilisateur approuvé" : "Utilisateur refusé");
    fetchData();
  };

  const statCards = [
    { label: "Étudiants", value: stats.students, icon: GraduationCap, color: "bg-primary/10 text-primary" },
    { label: "Enseignants", value: stats.teachers, icon: BookOpen, color: "bg-accent/10 text-accent" },
    { label: "Cours", value: stats.courses, icon: BookOpen, color: "bg-chart-4/10 text-chart-4" },
    { label: "Filières", value: stats.filieres, icon: Building2, color: "bg-chart-3/10 text-chart-3" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold">Administration</h1>
        <p className="text-muted-foreground">Gérez votre plateforme universitaire</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Demandes en attente ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">Aucune demande en attente</p>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="secondary" className="capitalize">{user.role}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApproval(user.user_id, true)} className="gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Approuver
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleApproval(user.user_id, false)} className="gap-1">
                      <XCircle className="h-3.5 w-3.5" /> Refuser
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
