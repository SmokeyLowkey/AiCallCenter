"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TwilioConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: string;
  onSuccess?: () => void;
}

interface WebhookConfig {
  name: string;
  url: string;
  description: string;
  enabled: boolean;
}

export function TwilioConfigDialog({ 
  open, 
  onOpenChange, 
  teamId,
  onSuccess 
}: TwilioConfigDialogProps) {
  const [step, setStep] = useState(1);
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [listenOnly, setListenOnly] = useState(true);
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(true);
  const [transcriptionLanguage, setTranscriptionLanguage] = useState("en-US");
  const [saveTranscripts, setSaveTranscripts] = useState(true);
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [notifyAgents, setNotifyAgents] = useState(true);
  
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      name: "Voice Incoming",
      url: "/api/integrations/twilio/voice/incoming",
      description: "Handles incoming voice calls",
      enabled: true
    },
    {
      name: "Voice Status",
      url: "/api/integrations/twilio/voice/status",
      description: "Handles call status updates",
      enabled: true
    },
    {
      name: "Transcription",
      url: "/api/integrations/twilio/voice/transcribe",
      description: "Handles real-time transcription",
      enabled: true
    },
    {
      name: "Recording",
      url: "/api/integrations/twilio/voice/recording",
      description: "Handles call recordings",
      enabled: true
    }
  ]);
  const { toast } = useToast();
  const router = useRouter();
  // Use ngrok URL for development, or the actual domain in production
  const baseUrl = 'https://6116-24-72-111-53.ngrok-free.app';

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!accountSid || !authToken) {
      toast({
        title: "Missing fields",
        description: "Please enter both Account SID and Auth Token",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/integrations/twilio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...(teamId ? { teamId } : {}),
          accountSid,
          authToken,
          webhooks: webhooks.filter((webhook: WebhookConfig) => webhook.enabled).map((webhook: WebhookConfig) => ({
            name: webhook.name,
            url: `${baseUrl}${webhook.url}`,
          })),
          config: {
            listenOnly,
            transcription: {
              enabled: transcriptionEnabled,
              language: transcriptionLanguage,
              saveTranscripts
            },
            recording: {
              enabled: recordingEnabled
            },
            notifications: {
              notifyAgents
            }
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.error) {
          if (data.error.includes("Team not found")) {
            throw new Error("Team not found. Please check your team ID or create a team first.");
          } else if (data.error.includes("Invalid Twilio credentials")) {
            throw new Error("Invalid Twilio credentials. Please check your Account SID and Auth Token.");
          } else {
            throw new Error(data.error);
          }
        } else {
          throw new Error("Failed to configure Twilio. Please try again later.");
        }
      }

      toast({
        title: "Twilio configured",
        description: "Your Twilio integration has been set up successfully",
      });

      // Reset form
      setAccountSid("");
      setAuthToken("");
      setStep(1);
      
      // Close dialog
      onOpenChange(false);
      
      // Refresh data
      router.refresh();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error configuring Twilio:", error);
      toast({
        title: "Configuration failed",
        description: error instanceof Error ? error.message : "Failed to configure Twilio",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWebhook = (index: number) => {
    setWebhooks(prev => 
      prev.map((webhook: WebhookConfig, i: number) => 
        i === index ? { ...webhook, enabled: !webhook.enabled } : webhook
      )
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect to Twilio</DialogTitle>
          <DialogDescription>
            Configure your Twilio account to enable call monitoring and analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
              >
                1
              </div>
              <span className="ml-2 font-medium">Credentials</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
              >
                2
              </div>
              <span className="ml-2 font-medium">Call Monitoring</span>
            </div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
              >
                3
              </div>
              <span className="ml-2 font-medium">Webhooks</span>
            </div>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>

        {step === 1 && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="account-sid">Account SID</Label>
              <Input
                id="account-sid"
                placeholder="Enter your Account SID"
                value={accountSid}
                onChange={(e) => setAccountSid(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You can find your Account SID in your Twilio dashboard.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auth-token">Auth Token</Label>
              <Input
                id="auth-token"
                type="password"
                placeholder="Enter your Auth Token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Keep this secure. Never share your Auth Token with anyone.
              </p>
            </div>
            <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Don't have a Twilio account?</AlertTitle>
              <AlertDescription>
                <Link href="https://www.twilio.com/try-twilio" className="underline" target="_blank">
                  Sign up for a free Twilio account
                </Link>{" "}
                to get started.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Call Monitoring Configuration</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Configure how your system monitors and processes calls.
              </p>
              
              <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Listen-Only Mode</AlertTitle>
                <AlertDescription>
                  Your system will only listen to calls and provide transcription and analysis.
                  It will not interact with the caller or modify the call flow.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="transcription-enabled">Real-time Transcription</Label>
                    <Switch 
                      id="transcription-enabled"
                      checked={transcriptionEnabled} 
                      onCheckedChange={setTranscriptionEnabled}
                    />
                  </div>
                  
                  {transcriptionEnabled && (
                    <div className="space-y-2 pl-4 border-l-2 border-slate-100">
                      <div className="grid gap-2">
                        <Label htmlFor="transcription-language">Language</Label>
                        <Select value={transcriptionLanguage} onValueChange={setTranscriptionLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="es-ES">Spanish</SelectItem>
                            <SelectItem value="fr-FR">French</SelectItem>
                            <SelectItem value="de-DE">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="save-transcripts" 
                          checked={saveTranscripts}
                          onCheckedChange={(checked) => setSaveTranscripts(checked === true)}
                        />
                        <Label htmlFor="save-transcripts" className="text-sm">
                          Save transcripts for future reference
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="recording-enabled">Call Recording</Label>
                    <Switch 
                      id="recording-enabled"
                      checked={recordingEnabled} 
                      onCheckedChange={setRecordingEnabled}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recordings are stored securely and can be accessed from the transcripts page.
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notify-agents">Agent Notifications</Label>
                    <Switch 
                      id="notify-agents"
                      checked={notifyAgents} 
                      onCheckedChange={setNotifyAgents}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Notify agents when a new call is detected and requires attention.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Webhook Configuration</Label>
              <p className="text-sm text-muted-foreground mb-2">
                These webhooks will be configured in your Twilio account to handle calls and events.
              </p>
              
              <div className="space-y-4">
                {webhooks.map((webhook, index) => (
                  <div key={index} className="flex items-start justify-between p-3 border rounded-md">
                    <div>
                      <h4 className="font-medium">{webhook.name}</h4>
                      <p className="text-sm text-muted-foreground">{webhook.description}</p>
                      <code className="text-xs bg-slate-100 p-1 rounded mt-1 block">
                        {baseUrl}{webhook.url}
                      </code>
                      <p className="text-xs text-muted-foreground mt-1">
                        {webhook.name === "Voice Incoming" && "Use for 'A call comes in'"}
                        {webhook.name === "Voice Status" && "Use for 'Call status changes'"}
                        {webhook.name === "Transcription" && "Use for transcription callback"}
                        {webhook.name === "Recording" && "Use for recording callback"}
                      </p>
                    </div>
                    <Switch 
                      checked={webhook.enabled} 
                      onCheckedChange={() => toggleWebhook(index)}
                    />
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Configure these webhooks in your Twilio phone number settings:
              </p>
              <ul className="text-xs text-muted-foreground list-disc pl-5 mt-1">
                <li>For "A call comes in" use the Voice Incoming webhook</li>
                <li>For "Primary handler fails" use the Voice Incoming webhook with "/fallback" appended</li>
                <li>For "Call status changes" use the Voice Status webhook</li>
              </ul>
            </div>

            <Alert variant="default" className="bg-indigo-50 border-indigo-200 text-indigo-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Ready to complete setup</AlertTitle>
              <AlertDescription>
                After connecting to Twilio, you'll need to configure your Twilio phone number to forward
                call events to these webhooks. Copy each URL and paste it into the corresponding field in your
                Twilio phone number settings. Make sure to select HTTP POST as the method.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <h3 className="font-medium">Configuration Summary</h3>
              <div className="p-3 bg-slate-50 rounded-md">
                <p className="text-sm"><strong>Account SID:</strong> {accountSid ? `${accountSid.substring(0, 8)}...${accountSid.substring(accountSid.length - 4)}` : 'Not provided'}</p>
                <p className="text-sm"><strong>Auth Token:</strong> {authToken ? '••••••••••••' : 'Not provided'}</p>
                <p className="text-sm"><strong>Webhooks:</strong> {webhooks.filter(w => w.enabled).length} enabled</p>
                <p className="text-sm"><strong>Call Recording:</strong> {recordingEnabled ? 'Enabled' : 'Disabled'}</p>
                <p className="text-sm"><strong>Transcription:</strong> {transcriptionEnabled ? 'Enabled' : 'Disabled'}</p>
                <p className="text-sm"><strong>Mode:</strong> Listen-Only</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button onClick={handleNext} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : step === 3 ? (
              "Connect"
            ) : (
              "Next"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}