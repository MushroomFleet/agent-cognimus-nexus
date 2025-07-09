import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ConductorDashboard } from "@/components/consciousness/ConductorDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, LogOut } from "lucide-react";

export default function Index() {
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 animate-pulse text-primary" />
          <span>Accessing consciousness network...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header Bar */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-semibold">ZeroVector Consciousness</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Disconnect
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <ConductorDashboard />
    </div>
  );
}