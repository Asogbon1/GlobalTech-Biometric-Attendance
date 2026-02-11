import { type User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Calendar, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay } from "date-fns";

interface UserProfileProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfile({ user, open, onOpenChange }: UserProfileProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["/api/attendance/logs", user?.id],
    queryFn: async () => {
      const res = await fetch(api.attendance.logs.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      const allLogs = await res.json();
      return allLogs.filter((log: any) => log.userId === user?.id);
    },
    enabled: !!user && open,
  });

  if (!user) return null;

  const daysOfWeek = user.daysOfWeek ? user.daysOfWeek.split(",") : [];
  const frequency = user.frequency || 0;

  // Group logs by date
  const logsByDate = logs?.reduce((acc: any, log: any) => {
    const date = format(parseISO(log.timestamp), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = { date, signIn: null, signOut: null };
    if (log.action === "SIGN_IN") acc[date].signIn = log.timestamp;
    if (log.action === "SIGN_OUT") acc[date].signOut = log.timestamp;
    return acc;
  }, {}) || {};

  const attendanceRecords = Object.values(logsByDate).sort((a: any, b: any) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate progress for current week
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const thisWeekAttendance = daysInWeek.filter(day => {
    const dateKey = format(day, "yyyy-MM-dd");
    return logsByDate[dateKey]?.signIn;
  }).length;

  const progress = frequency > 0 ? Math.min((thisWeekAttendance / frequency) * 100, 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* User Info */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-3">
            <div>
              <h3 className="text-lg font-semibold">{user.fullName}</h3>
              <Badge className="mt-1">
                {user.category === "student" ? "Student" : "Staff"}
              </Badge>
            </div>

            {user.email && (
              <div className="text-sm text-muted-foreground">
                📧 {user.email}
              </div>
            )}

            {user.courseName && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="font-medium">Course:</span> {user.courseName}
              </div>
            )}

            {user.duration && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium">Duration:</span> {user.duration}
              </div>
            )}

            {user.frequency && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-medium">Frequency:</span> {user.frequency} times per week
              </div>
            )}

            {daysOfWeek.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Days:</span> {daysOfWeek.join(", ")}
              </div>
            )}
          </div>

          {/* Progress This Week */}
          {frequency > 0 && (
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">This Week's Progress</h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium">{thisWeekAttendance}/{frequency}</span>
              </div>
            </div>
          )}

          {/* Attendance Records */}
          <div>
            <h4 className="font-semibold mb-3">Attendance History</h4>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : attendanceRecords.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No attendance records yet</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Sign In</TableHead>
                      <TableHead>Sign Out</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record: any) => {
                      const date = parseISO(record.date);
                      const signInTime = record.signIn ? format(parseISO(record.signIn), "hh:mm a") : "-";
                      const signOutTime = record.signOut ? format(parseISO(record.signOut), "hh:mm a") : null;
                      const didntSignOut = record.signIn && !record.signOut && !isSameDay(date, today);

                      return (
                        <TableRow key={record.date}>
                          <TableCell className="font-medium">
                            {format(date, "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>{signInTime}</TableCell>
                          <TableCell>
                            {signOutTime || (didntSignOut ? (
                              <span className="text-destructive text-xs">User didn't sign out</span>
                            ) : "-")}
                          </TableCell>
                          <TableCell>
                            {record.signOut ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : didntSignOut ? (
                              <XCircle className="w-4 h-4 text-destructive" />
                            ) : (
                              <Clock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
