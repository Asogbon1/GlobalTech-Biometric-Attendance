import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [autoToggle, setAutoToggle] = useState(true);

  // Sync state when data loads
  useEffect(() => {
    if (settings) {
      setAutoToggle(settings.autoToggleEnabled);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({ autoToggleEnabled: autoToggle });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display text-foreground">System Settings</h1>
        <p className="text-muted-foreground">Configure global application behavior.</p>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm divide-y divide-border">
        <div className="p-6 flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="auto-toggle" className="text-base font-semibold">Auto-Toggle Attendance</Label>
            <p className="text-sm text-muted-foreground max-w-md">
              When enabled, consecutive scans automatically toggle between Sign In and Sign Out.
              If disabled, scans will always default to Sign In (or require manual override).
            </p>
          </div>
          <Switch 
            id="auto-toggle" 
            checked={autoToggle} 
            onCheckedChange={setAutoToggle}
          />
        </div>

        {/* Placeholder for future settings */}
        <div className="p-6 flex items-center justify-between opacity-50 cursor-not-allowed">
          <div className="space-y-1">
            <Label className="text-base font-semibold">Allow Manual Entry</Label>
            <p className="text-sm text-muted-foreground">
              Allow admins to manually add attendance logs without biometric verification.
            </p>
          </div>
          <Switch disabled checked={true} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={updateSettings.isPending} 
          className="min-w-[120px]"
        >
          {updateSettings.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
