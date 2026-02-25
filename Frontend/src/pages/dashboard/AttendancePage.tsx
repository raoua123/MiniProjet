import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const records = [
  { id: "1", date: "2024-01-15", present: true, courseTitle: "Introduction à la Programmation" },
  { id: "2", date: "2024-01-17", present: true, courseTitle: "Algorithmes et Structures de Données" },
  { id: "3", date: "2024-01-22", present: false, courseTitle: "Base de Données" },
  { id: "4", date: "2024-01-24", present: true, courseTitle: "Développement Web" },
  { id: "5", date: "2024-01-29", present: true, courseTitle: "Intelligence Artificielle" },
];

export default function AttendancePage() {
  const total = records.length;
  const present = records.filter((r) => r.present).length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          Mes absences
        </h1>
        <p className="text-muted-foreground">Suivez votre taux de présence</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total séances", value: total, icon: ClipboardList, color: "bg-primary/10 text-primary" },
          { label: "Présent", value: present, icon: CheckCircle2, color: "bg-chart-1/10 text-chart-1" },
          { label: "Taux de présence", value: `${rate}%`, icon: TrendingUp, color: "bg-accent/10 text-accent" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="shadow-card border-0">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="shadow-card border-0">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Taux de présence global</span>
            <span className="text-sm font-bold text-primary">{rate}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${rate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="font-display text-lg">Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {records.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucun enregistrement</p>
            ) : (
              records.map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {rec.present ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {rec.courseTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rec.date}
                      </p>
                    </div>
                  </div>
                  <Badge variant={rec.present ? "secondary" : "destructive"} className="text-xs">
                    {rec.present ? "Présent" : "Absent"}
                  </Badge>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
