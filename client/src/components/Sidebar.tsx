import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, ClipboardList, Settings, Fingerprint, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/attendance", label: "Attendance", icon: ClipboardList },
  { href: "/simulation", label: "Simulate", icon: Fingerprint },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border flex flex-col sticky top-0 left-0 z-20 transition-all duration-300",
      collapsed ? "w-16" : "w-56"
    )}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
            <Fingerprint className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-semibold text-sm leading-tight text-foreground">Globaltech</h1>
              <p className="text-[10px] text-muted-foreground">Attendance</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {items.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          const linkContent = (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
              collapsed && "justify-center px-2",
              isActive 
                ? "bg-muted text-foreground font-medium" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
            data-testid={`nav-${item.href.replace("/", "") || "dashboard"}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      <div className={cn(
        "p-2 border-t border-border flex items-center gap-1",
        collapsed ? "flex-col" : "justify-between"
      )}>
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          data-testid="button-collapse-sidebar"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
