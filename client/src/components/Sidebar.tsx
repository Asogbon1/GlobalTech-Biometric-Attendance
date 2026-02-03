import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, ClipboardList, Settings, Fingerprint, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogout, useAuth } from "@/hooks/use-auth";

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
  const logout = useLogout();
  const { data: user } = useAuth();

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border flex flex-col sticky top-0 left-0 z-20 transition-all duration-300",
      collapsed ? "w-16" : "w-56"
    )}>
      <div className="p-4 border-b border-border">
        <div className={cn(
          "flex items-center gap-3",
          collapsed && "flex-col"
        )}>
          {!collapsed ? (
            <div className="flex items-center gap-2 flex-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center">
                    <Fingerprint className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-bold text-lg">
                    <span className="text-foreground">Global</span>
                    <span className="text-primary">TECH</span>
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground pl-8">WORLD COMPUTER INSTITUTE</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
              <Fingerprint className="w-5 h-5 text-primary" />
            </div>
          )}
          {!collapsed && <ThemeToggle />}
          {collapsed && <ThemeToggle />}
        </div>
        {!collapsed && user && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium text-foreground truncate">{user.fullName}</p>
          </div>
        )}
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
        "p-2 border-t border-border space-y-2",
        collapsed && "flex flex-col"
      )}>
        {!collapsed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        )}
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-end"
        )}>
          {collapsed && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                Logout
              </TooltipContent>
            </Tooltip>
          )}
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
    </div>
  );
}
