import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRegisterFingerprint } from "@/hooks/use-fingerprints";
import { Fingerprint, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { type User } from "@shared/schema";
import { registerFingerprint, isBiometricSupported, bufferToBase64 } from "@/lib/webauthn";
import { useToast } from "@/hooks/use-toast";

interface FingerprintModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FingerprintModal({ user, open, onOpenChange }: FingerprintModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const registerFingerprintMutation = useRegisterFingerprint();
  const { toast } = useToast();

  const handleRegister = async () => {
    if (!user) return;

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
      const credential = await registerFingerprint(user.id, user.fullName);
      
      const credentialId = bufferToBase64(credential.rawId);
      
      // Save to database
      registerFingerprintMutation.mutate(
        { 
          userId: user.id, 
          templateId: credentialId,
          publicKey: credential.id, // Store the credential ID
          credentialType: "webauthn"
        },
        {
          onSuccess: () => {
            setStatus("success");
            setTimeout(() => {
              onOpenChange(false);
              setStatus("idle");
            }, 2000);
          },
          onError: (error) => {
            setStatus("error");
            toast({
              title: "Registration Failed",
              description: error.message,
              variant: "destructive",
            });
            setTimeout(() => setStatus("idle"), 2000);
          },
        }
      );
    } catch (error: any) {
      setStatus("error");
      toast({
        title: "Fingerprint Scan Failed",
        description: error.message || "Failed to capture fingerprint. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => setStatus("idle"), 2000);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Fingerprint className="w-5 h-5 text-primary" />
            Register Fingerprint
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 text-center space-y-4">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
            status === "scanning" ? "bg-primary/10 animate-pulse" :
            status === "success" ? "bg-green-100 dark:bg-green-900" :
            status === "error" ? "bg-red-100 dark:bg-red-900" :
            "bg-primary/10"
          }`}>
            {status === "success" ? (
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            ) : status === "error" ? (
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            ) : (
              <Fingerprint className={`w-12 h-12 text-primary ${status === "scanning" ? "animate-pulse" : ""}`} />
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Registering for: <span className="font-bold text-foreground">{user?.fullName}</span>
          </div>

          {status === "idle" && (
            <p className="text-xs text-muted-foreground px-4">
              Click the button below to scan your fingerprint using your laptop's built-in sensor (Windows Hello).
            </p>
          )}

          {status === "scanning" && (
            <p className="text-sm font-medium text-primary">
              Please place your finger on the sensor...
            </p>
          )}

          {status === "success" && (
            <p className="text-sm font-medium text-green-600 dark:text-green-400">
              Fingerprint registered successfully!
            </p>
          )}

          {status === "error" && (
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Failed to register fingerprint
            </p>
          )}

          <Button 
            onClick={handleRegister} 
            disabled={isScanning || status === "success"} 
            className="w-full"
          >
            {isScanning && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {status === "success" ? "Registered!" : "Scan Fingerprint"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
