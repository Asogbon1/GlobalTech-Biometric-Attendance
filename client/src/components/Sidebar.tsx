import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, ClipboardList, Settings, Fingerprint, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users & Staff", icon: Users },
  { href: "/attendance", label: "Attendance Logs", icon: ClipboardList },
  { href: "/simulation", label: "Simulate Scan", icon: Fingerprint },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col sticky top-0 left-0 shadow-xl z-20 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground flex-shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display font-bold text-lg leading-tight tracking-tight text-sidebar-foreground">Globaltech</h1>
              <p className="text-xs text-sidebar-foreground/70 font-medium">Biometric System</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          const linkContent = (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group font-medium text-sm",
              collapsed && "justify-center px-0",
              isActive 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
            data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
            >
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-colors", 
                isActive ? "text-secondary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"
              )} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 mx-3 mb-3 bg-sidebar-accent/30 rounded-xl border border-sidebar-border/50">
          <p className="text-xs text-secondary font-semibold mb-1">System Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-sidebar-foreground/70 font-medium">Online & Active</span>
          </div>
        </div>
      )}

      <div className={cn(
        "p-3 border-t border-sidebar-border/50 flex items-center",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && <ThemeToggle />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded-full"
          data-testid="button-collapse-sidebar"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
        {collapsed && <ThemeToggle />}
      </div>
    </div>
  );
}
