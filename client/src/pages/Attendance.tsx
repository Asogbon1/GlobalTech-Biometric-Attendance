import { useState } from "react";
import { useAttendanceLogs } from "@/hooks/use-attendance";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Download } from "lucide-react";
import { format } from "date-fns";

export default function AttendancePage() {
  const [date, setDate] = useState<string>("");
  const { data: logs, isLoading } = useAttendanceLogs({ date: date || undefined });

  const handleExport = () => {
    // Mock export functionality
    if (!logs || logs.length === 0) return;
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + "User,Category,Action,Time,Source\n"
      + logs.map(log => 
        `${log.user.fullName},${log.user.category},${log.action},${log.timestamp},${log.source}`
      ).join("\n");
    
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
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      No logs found for this period.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs?.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {log.timestamp ? format(new Date(log.timestamp), "MMM dd, HH:mm:ss") : "-"}
                      </TableCell>
                      <TableCell className="font-medium">{log.user.fullName}</TableCell>
                      <TableCell className="capitalize text-muted-foreground text-sm">{log.user.category}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                          log.action === 'SIGN_IN' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {log.action === 'SIGN_IN' ? 'IN' : 'OUT'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground uppercase tracking-wider">{log.source}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
