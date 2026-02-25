import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FolderOpen, Search, FileText, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const materials = [
  { id: "1", title: "Cours 1 - Introduction", description: "Introduction à la programmation Python", file_url: "#", created_at: "2024-01-15", courseTitle: "Introduction à la Programmation" },
  { id: "2", title: "TD 1 - Algorithmes", description: "Travaux dirigés sur les algorithmes de tri", file_url: "#", created_at: "2024-01-17", courseTitle: "Algorithmes et Structures de Données" },
  { id: "3", title: "Cours 2 - SQL", description: "Langage SQL et requêtes", file_url: "#", created_at: "2024-01-20", courseTitle: "Base de Données" },
  { id: "4", title: "TP - HTML/CSS", description: "Travaux pratiques HTML et CSS", file_url: "#", created_at: "2024-01-22", courseTitle: "Développement Web" },
];

export default function MaterialsPage() {
  const [search, setSearch] = useState("");

  const filtered = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="h-6 w-6 text-primary" /> Supports de cours
        </h1>
        <p className="text-muted-foreground">Accédez à tous vos documents</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un support..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((mat, i) => (
            <motion.div
              key={mat.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="shadow-card border-0 hover:shadow-elevated transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{mat.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {mat.courseTitle}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {mat.created_at}
                      </span>
                    </div>
                  </div>
                  {mat.file_url && (
                    <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📄</div>
          <p className="text-muted-foreground">Aucun support trouvé</p>
        </div>
      )}
    </div>
  );
}
