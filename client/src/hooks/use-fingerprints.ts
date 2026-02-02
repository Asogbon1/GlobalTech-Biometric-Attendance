import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertFingerprint } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useRegisterFingerprint() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertFingerprint) => {
      const res = await fetch(api.fingerprints.register.path, {
        method: api.fingerprints.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to register fingerprint");
      }
      return api.fingerprints.register.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Fingerprint registered linked to user" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

// Simulation hook
export function useVerifyFingerprint() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const res = await fetch(api.fingerprints.verify.path, {
        method: api.fingerprints.verify.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
        credentials: "include",
      });
      if (res.status === 404) throw new Error("Fingerprint not recognized");
      if (!res.ok) throw new Error("Verification failed");
      return api.fingerprints.verify.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.attendance.stats.path] });
      toast({
        title: `${data.action === "SIGN_IN" ? "Welcome" : "Goodbye"}, ${data.user.fullName}!`,
        description: `Successfully logged at ${new Date().toLocaleTimeString()}`,
        variant: "default",
        className: "bg-green-500 text-white border-none",
      });
    },
    onError: (error) => {
      toast({ title: "Scan Failed", description: error.message, variant: "destructive" });
    },
  });
}
