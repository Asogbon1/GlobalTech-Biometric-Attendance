import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/Users";
import AttendancePage from "@/pages/Attendance";
import SettingsPage from "@/pages/Settings";
import SimulationPage from "@/pages/Simulation";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  const { data: user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, show the app
  if (user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative">
          {/* Background decorative blob */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-1/2 -translate-y-1/2" />
          
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/users" component={UsersPage} />
            <Route path="/attendance" component={AttendancePage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="/simulation" component={SimulationPage} />
            <Route path="/login"><Redirect to="/" /></Route>
            <Route path="/register"><Redirect to="/" /></Route>
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    );
  }

  // If user is not authenticated, show login/register
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route><Redirect to="/login" /></Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
