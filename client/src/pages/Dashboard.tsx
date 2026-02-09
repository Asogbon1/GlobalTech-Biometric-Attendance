import { motion } from "framer-motion";
import { StatsCard } from "@/components/StatsCard";
import { useAttendanceStats, useAttendanceLogs } from "@/hooks/use-attendance";
import { Users, UserCheck, UserCog, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: stats } = useAttendanceStats();
  const { data: logs } = useAttendanceLogs();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Today's attendance overview</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <StatsCard
            title="Total Present"
            value={stats?.totalPresent || 0}
            icon={UserCheck}
            trend="+12%"
            trendUp={true}
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatsCard
            title="Students"
            value={stats?.activeStudents || 0}
            icon={Users}
          />
        </motion.div>

        <motion.div variants={item}>
          <StatsCard
            title="Staff"
            value={stats?.activeStaff || 0}
            icon={UserCog}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border/60 shadow-sm h-full">
            <div className="p-6 border-b border-border/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                <Link href="/attendance" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-border/50">
              {logs?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No activity recorded today.
                </div>
              ) : (
                logs?.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {log.user.fullName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{log.user.fullName}</p>
                        <p className="text-xs text-muted-foreground capitalize">{log.user.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={log.action === 'SIGN_IN' ? 'default' : 'secondary'} className="text-xs">
                        {log.action === 'SIGN_IN' ? 'In' : 'Out'}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {log.timestamp && format(new Date(log.timestamp), "h:mm a")}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-card rounded-xl border border-border/60 shadow-sm h-full">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">Quick Info</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Time</p>
                  <p className="text-sm font-mono font-medium">{format(new Date(), "h:mm:ss a")}</p>
                </div>
              </div>
              
              <div className="border-t border-border/50 pt-6">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">System Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
