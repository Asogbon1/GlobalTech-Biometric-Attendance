import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";

import Dashboard from "@/pages/Dashboard";
import UsersPage from "@/pages/Users";
import AttendancePage from "@/pages/Attendance";
import SettingsPage from "@/pages/Settings";
import SimulationPage from "@/pages/Simulation";
import NotFound from "@/pages/not-found";

function Router() {
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
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
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
