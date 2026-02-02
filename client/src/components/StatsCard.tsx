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
      "bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 card-hover group",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-primary/5 group-hover:bg-primary/10 transition-colors text-primary">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-muted-foreground text-sm font-medium tracking-wide">{title}</h3>
      <p className="text-3xl font-bold font-display mt-1 text-foreground">{value}</p>
    </div>
  );
}
