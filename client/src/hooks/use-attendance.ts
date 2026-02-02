import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertAttendanceLog } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAttendanceLogs(params?: { date?: string; userId?: string }) {
  const queryString = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
  const queryKey = [api.attendance.list.path, params?.date, params?.userId].filter(Boolean);

  return useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(api.attendance.list.path + queryString, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.attendance.list.responses[200].parse(await res.json());
    },
    refetchInterval: 5000, // Poll for live updates
  });
}

export function useAttendanceStats() {
  return useQuery({
    queryKey: [api.attendance.stats.path],
    queryFn: async () => {
      const res = await fetch(api.attendance.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.attendance.stats.responses[200].parse(await res.json());
    },
    refetchInterval: 10000,
  });
}

export function useManualAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAttendanceLog) => {
      const res = await fetch(api.attendance.create.path, {
        method: api.attendance.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create log");
      return api.attendance.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.attendance.stats.path] });
      toast({ title: "Success", description: "Manual entry added" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
