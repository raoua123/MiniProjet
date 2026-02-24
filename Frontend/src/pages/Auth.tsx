import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, BookOpen, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

type Role = 'student' | 'teacher' | 'admin';

const roleConfig: Record<Role, { icon: React.ElementType; label: string }> = {
  student: { icon: GraduationCap, label: 'Étudiant' },
  teacher: { icon: BookOpen,      label: 'Enseignant' },
  admin:   { icon: Shield,        label: 'Administrateur' },
};

export default function Auth() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>('student');

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">UniPortal</h1>
          <p className="text-muted-foreground mt-2">Plateforme Universitaire</p>
        </div>

        <Card className="shadow-elevated border-0">
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
            </CardHeader>

            {/* ── Login ── */}
            <TabsContent value="login">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="votre@email.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input id="login-password" type="password" placeholder="••••••••" />
                </div>
                <Button className="w-full" onClick={() => navigate('/dashboard')}>
                  Se connecter
                </Button>
              </CardContent>
            </TabsContent>

            {/* ── Signup ── */}
            <TabsContent value="signup">
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-3 block">Rôle</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.entries(roleConfig) as [Role, { icon: React.ElementType; label: string }][]).map(
                      ([role, config]) => {
                        const Icon = config.icon;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                              selectedRole === role
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/40'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{config.label}</span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="votre@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Mot de passe</Label>
                  <Input type="password" placeholder="Min. 6 caractères" />
                </div>
                <Button className="w-full" onClick={() => navigate('/dashboard')}>
                  Créer un compte
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}