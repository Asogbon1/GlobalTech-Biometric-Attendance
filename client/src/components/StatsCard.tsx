import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, className }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-xl p-6 border border-border/60 shadow-sm hover:shadow-md transition-all duration-200 h-full",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-muted/50 text-muted-foreground">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trendUp ? "text-green-600 dark:text-green-400 bg-green-500/10" : "text-red-600 dark:text-red-400 bg-red-500/10"
          )}>
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
