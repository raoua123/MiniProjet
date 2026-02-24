import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (profile?.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-warm p-4">
        <div className="max-w-md text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="font-display text-2xl font-bold">Compte en attente</h2>
          <p className="text-muted-foreground">
            Votre compte est en attente de validation par l'administrateur. Vous recevrez un email une fois approuvé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
