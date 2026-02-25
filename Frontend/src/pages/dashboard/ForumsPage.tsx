import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, MessageCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const forums = [
  { id: "1", title: "Discussion sur les algorithmes", description: "Échangez sur les algorithmes et structures de données", forum_type: "discussion", created_at: "2024-01-15", courseTitle: "Algorithmes et Structures de Données" },
  { id: "2", title: "Compte rendu - TD1 Python", description: "Résumé du premier TD de programmation", forum_type: "compte_rendu", created_at: "2024-01-10", courseTitle: "Introduction à la Programmation" },
  { id: "3", title: "Questions Base de Données", description: "Posez vos questions sur les bases de données", forum_type: "discussion", created_at: "2024-01-20", courseTitle: "Base de Données" },
  { id: "4", title: "Projet Web - Phase 1", description: "Discussion sur le premier projet de développement web", forum_type: "discussion", created_at: "2024-01-22", courseTitle: "Développement Web" },
];

export default function ForumsPage() {
  const [search, setSearch] = useState("");

  const filtered = forums.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  const typeLabel = (type: string) => {
    switch (type) {
      case "compte_rendu": return "Compte rendu";
      case "discussion": return "Discussion";
      default: return type;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "compte_rendu": return "bg-accent/10 text-accent";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" /> Forums
          </h1>
          <p className="text-muted-foreground">Participez aux discussions</p>
        </div>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher un forum..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((forum, i) => (
            <motion.div
              key={forum.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="shadow-card border-0 hover:shadow-elevated transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-chart-4/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-chart-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{forum.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{forum.courseTitle}</Badge>
                      <Badge className={`text-xs ${typeColor(forum.forum_type)} border-0`}>{typeLabel(forum.forum_type)}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {forum.created_at}
                      </span>
                    </div>
                    {forum.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{forum.description}</p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-muted-foreground">Aucun forum trouvé</p>
        </div>
      )}
    </div>
  );
}
