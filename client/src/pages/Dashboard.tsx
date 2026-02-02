import { motion } from "framer-motion";
import { StatsCard } from "@/components/StatsCard";
import { useAttendanceStats, useAttendanceLogs } from "@/hooks/use-attendance";
import { Users, UserCheck, UserCog, History } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats } = useAttendanceStats();
  const { data: logs } = useAttendanceLogs();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">Real-time attendance metrics for today.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={item}>
          <StatsCard
            title="Total Present"
            value={stats?.totalPresent || 0}
            icon={UserCheck}
            trend="+12%"
            trendUp={true}
            className="border-primary/20 bg-primary/5"
          />
        </motion.div>
        
        <motion.div variants={item}>
          <StatsCard
            title="Students Active"
            value={stats?.activeStudents || 0}
            icon={Users}
            className="border-blue-500/10"
          />
        </motion.div>

        <motion.div variants={item}>
          <StatsCard
            title="Staff Active"
            value={stats?.activeStaff || 0}
            icon={UserCog}
            className="border-amber-500/10"
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Scans
            </h2>
          </div>

          <div className="space-y-4">
            {logs?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No activity recorded today.</div>
            ) : (
              logs?.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors border border-transparent hover:border-border">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      log.action === 'SIGN_IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{log.user.fullName}</p>
                      <p className="text-xs text-muted-foreground capitalize">{log.user.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      log.action === 'SIGN_IN' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                    }`}>
                      {log.action === 'SIGN_IN' ? 'Checked In' : 'Checked Out'}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {log.timestamp && format(new Date(log.timestamp), "h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions / Info */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg shadow-primary/20">
          <h2 className="text-xl font-bold mb-2">System Status</h2>
          <p className="text-primary-foreground/80 text-sm mb-6">
            All systems are operational. Fingerprint scanners are online and syncing.
          </p>
          
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-white/60 mb-1">Server Time</p>
              <p className="font-mono text-lg font-bold">{format(new Date(), "HH:mm:ss")}</p>
            </div>
            
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-xs text-white/60 mb-1">Device Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-medium text-sm">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
