import { useState } from "react";
import { useAttendanceLogs } from "@/hooks/use-attendance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Download } from "lucide-react";
import { format, parseISO, isSameDay } from "date-fns";

export default function AttendancePage() {
  const [date, setDate] = useState<string>("");
  const { data: logs, isLoading } = useAttendanceLogs({ date: date || undefined });

  // Group logs by user and date
  const groupedLogs = logs?.reduce((acc: any, log) => {
    const logDate = format(parseISO(log.timestamp), "yyyy-MM-dd");
    const key = `${log.userId}-${logDate}`;
    
    if (!acc[key]) {
      acc[key] = {
        date: logDate,
        timestamp: log.timestamp,
        user: log.user,
        signIn: null,
        signOut: null,
        source: log.source,
      };
    }
    
    if (log.action === "SIGN_IN") {
      acc[key].signIn = log.timestamp;
    } else if (log.action === "SIGN_OUT") {
      acc[key].signOut = log.timestamp;
    }
    
    return acc;
  }, {}) || {};

  const attendanceRecords = Object.values(groupedLogs).sort((a: any, b: any) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleExport = () => {
    if (attendanceRecords.length === 0) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Date,User,Category,Sign In,Sign Out,Source\n"
      + attendanceRecords.map((record: any) => {
        const signInTime = record.signIn ? format(parseISO(record.signIn), "HH:mm:ss") : "-";
        const signOutTime = record.signOut ? format(parseISO(record.signOut), "HH:mm:ss") : "Didn't sign out";
        return `${format(parseISO(record.date), "MMM dd yyyy")},${record.user.fullName},${record.user.category},${signInTime},${signOutTime},${record.source}`;
      }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-foreground">Attendance Logs</h1>
          <p className="text-muted-foreground">View and export daily attendance records.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport} disabled={!logs?.length}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/20">
          <div className="relative max-w-xs">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="date"
              className="pl-9 bg-background"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          {date && (
            <Button variant="ghost" onClick={() => setDate("")} className="text-xs">
              Clear Filter
            </Button>
          )}
        </div>

        <div className="relative w-full overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Sign In</TableHead>
                  <TableHead>Sign Out</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-32 text-muted-foreground">
                      No logs found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceRecords.map((record: any, idx) => {
                    const today = new Date();
                    const recordDate = parseISO(record.date);
                    const didntSignOut = record.signIn && !record.signOut && !isSameDay(recordDate, today);

                    return (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {format(recordDate, "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell className="font-medium">{record.user.fullName}</TableCell>
                        <TableCell className="capitalize text-muted-foreground text-sm">{record.user.category}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.signIn ? format(parseISO(record.signIn), "HH:mm:ss") : "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.signOut ? (
                            <span className="text-green-600">{format(parseISO(record.signOut), "HH:mm:ss")}</span>
                          ) : didntSignOut ? (
                            <span className="text-destructive text-xs">User didn't sign out</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground uppercase tracking-wider">{record.source}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
