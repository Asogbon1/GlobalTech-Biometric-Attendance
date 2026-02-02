import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, ClipboardList, Settings, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users & Staff", icon: Users },
  { href: "/attendance", label: "Attendance Logs", icon: ClipboardList },
  { href: "/simulation", label: "Simulate Scan", icon: Fingerprint },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col sticky top-0 left-0 shadow-xl z-20">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight tracking-tight">Globaltech</h1>
            <p className="text-xs text-muted-foreground font-medium">Biometric System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {items.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium text-sm",
              isActive 
                ? "bg-primary/10 text-primary shadow-sm" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:pl-5"
            )}>
              <Icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-primary/10">
        <p className="text-xs text-primary/80 font-semibold mb-1">System Status</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">Online & Active</span>
        </div>
      </div>
    </div>
  );
}
