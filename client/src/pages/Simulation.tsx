import { useState } from "react";
import { useVerifyFingerprint } from "@/hooks/use-fingerprints";
import { Button } from "@/components/ui/button";
import { Fingerprint, ScanLine, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { authenticateFingerprint, isBiometricSupported, bufferToBase64 } from "@/lib/webauthn";
import { useToast } from "@/hooks/use-toast";

export default function Simulation() {
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [isScanning, setIsScanning] = useState(false);
  const verifyFingerprint = useVerifyFingerprint();
  const { toast } = useToast();

  const handleScan = async () => {
    if (!isBiometricSupported()) {
      toast({
        title: "Not Supported",
        description: "Your device doesn't support fingerprint authentication. Please use a device with a built-in fingerprint sensor.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScanning(true);
      setStatus("scanning");
      
      // Trigger Windows Hello / fingerprint sensor
      const credential = await authenticateFingerprint();
      const credentialId = bufferToBase64(credential.rawId);
      
      // Verify with backend
      verifyFingerprint.mutate(credentialId, {
        onSuccess: () => {
          setStatus("success");
          setTimeout(() => setStatus("idle"), 3000);
        },
        onError: (error) => {
          setStatus("error");
          toast({
            title: "Verification Failed",
            description: error.message,
            variant: "destructive",
          });
          setTimeout(() => setStatus("idle"), 3000);
        },
      });
    } catch (error: any) {
      setStatus("error");
      toast({
        title: "Fingerprint Scan Failed",
        description: error.message || "Failed to capture fingerprint. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 shadow-xl text-center space-y-8">
        <div className="space-y-2">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 relative overflow-hidden ${
            status === "scanning" ? "bg-primary/10 animate-pulse" :
            status === "success" ? "bg-green-100 dark:bg-green-900" :
            status === "error" ? "bg-red-100 dark:bg-red-900" :
            "bg-primary/10"
          }`}>
            {status === "scanning" && (
              <ScanLine className="w-10 h-10 text-primary absolute animate-[ping_3s_ease-in-out_infinite] opacity-20" />
            )}
            {status === "success" ? (
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            ) : status === "error" ? (
              <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            ) : (
              <Fingerprint className={`w-10 h-10 text-primary relative z-10 ${status === "scanning" ? "animate-pulse" : ""}`} />
            )}
          </div>
          <h1 className="text-2xl font-display font-bold">
            {status === "success" ? "Success!" :
             status === "error" ? "Failed" :
             "Attendance Scanner"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {status === "idle" && "Click the button below to scan your fingerprint for attendance."}
            {status === "scanning" && "Please place your finger on the sensor..."}
            {status === "success" && "Attendance recorded successfully!"}
            {status === "error" && "Fingerprint not recognized. Please try again."}
          </p>
        </div>

        <Button 
          onClick={handleScan} 
          className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5"
          disabled={isScanning || status === "success"}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Scanning...
            </>
          ) : status === "success" ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Recorded!
            </>
          ) : (
            <>
              <Fingerprint className="w-5 h-5 mr-2" />
              Scan Fingerprint
            </>
          )}
        </Button>

        <div className="bg-muted/50 p-4 rounded-lg text-xs text-left text-muted-foreground">
          <p className="font-semibold mb-1">System Info:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Using: Windows Hello / Built-in Sensor</li>
            <li>Technology: WebAuthn API</li>
            <li>Auto-toggles: SIGN_IN ↔ SIGN_OUT</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
