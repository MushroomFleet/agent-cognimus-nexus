import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from '@/hooks/useProfile';
import { ConductorDashboard } from "@/components/consciousness/ConductorDashboard";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, LogOut, User } from "lucide-react";
import { APIKeyManagerDialog } from '@/components/APIKeyManager';

export default function Index() {
  const { user, loading, signOut } = useAuth();
  const { profile, loading: profileLoading, isAdmin, isGuest } = useProfile();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 animate-pulse text-primary" />
          <span>Initializing OrangeAI...</span>
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
            <span className="font-semibold">OrangeAI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{profile?.display_name || user.email}</span>
                  <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                    {isAdmin ? "Admin" : "Guest"}
                  </Badge>
                </div>
                {profile?.display_name && (
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                )}
              </div>
            </div>
            <APIKeyManagerDialog />
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