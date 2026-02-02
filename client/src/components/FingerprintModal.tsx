import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRegisterFingerprint } from "@/hooks/use-fingerprints";
import { Fingerprint, Loader2 } from "lucide-react";
import { type User } from "@shared/schema";

interface FingerprintModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FingerprintModal({ user, open, onOpenChange }: FingerprintModalProps) {
  const [templateId, setTemplateId] = useState("");
  const registerFingerprint = useRegisterFingerprint();

  const handleRegister = () => {
    if (!user || !templateId) return;
    registerFingerprint.mutate(
      { userId: user.id, templateId },
      {
        onSuccess: () => {
          setTemplateId("");
          onOpenChange(false);
        },
      }
    );
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
          <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <Fingerprint className="w-12 h-12 text-primary" />
          </div>
          
          <div className="text-sm text-muted-foreground">
            Registering for: <span className="font-bold text-foreground">{user?.fullName}</span>
          </div>

          <p className="text-xs text-muted-foreground px-4">
            In a real scenario, this would trigger the physical scanner. For now, enter a simulated Template ID.
          </p>

          <div className="space-y-2 text-left">
            <Label>Fingerprint Template ID</Label>
            <Input 
              value={templateId} 
              onChange={(e) => setTemplateId(e.target.value)} 
              placeholder="e.g. FPRINT_12345"
            />
          </div>

          <Button 
            onClick={handleRegister} 
            disabled={!templateId || registerFingerprint.isPending} 
            className="w-full"
          >
            {registerFingerprint.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Fingerprint Data
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
