import { useState } from "react";
import { useVerifyFingerprint } from "@/hooks/use-fingerprints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Fingerprint, ScanLine, Loader2 } from "lucide-react";

export default function Simulation() {
  const [templateId, setTemplateId] = useState("");
  const verifyFingerprint = useVerifyFingerprint();

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateId) return;
    verifyFingerprint.mutate(templateId, {
      onSuccess: () => setTemplateId("") // Clear on success so they can scan again
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-8">
        <div className="space-y-2">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
            <ScanLine className="w-10 h-10 text-primary absolute animate-[ping_3s_ease-in-out_infinite] opacity-20" />
            <Fingerprint className="w-10 h-10 text-primary relative z-10" />
          </div>
          <h1 className="text-2xl font-display font-bold">Simulate Scanner</h1>
          <p className="text-muted-foreground text-sm">
            Enter a valid Template ID (e.g., from the User page) to simulate a physical fingerprint scan event.
          </p>
        </div>

        <form onSubmit={handleSimulate} className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="templateId">Fingerprint Template ID</Label>
            <Input 
              id="templateId"
              placeholder="e.g. FPRINT_12345"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="font-mono text-center text-lg tracking-widest h-12"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
            disabled={!templateId || verifyFingerprint.isPending}
          >
            {verifyFingerprint.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Simulate Scan"
            )}
          </Button>
        </form>

        <div className="bg-muted/50 p-4 rounded-lg text-xs text-left text-muted-foreground">
          <p className="font-semibold mb-1">Debug Info:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>API Endpoint: POST /api/fingerprint/verify</li>
            <li>Payload: {"{ templateId: string }"}</li>
            <li>Logic: Auto-toggles SIGN_IN / SIGN_OUT</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
