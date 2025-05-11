"use client"

import { useState, useEffect, ReactNode } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Database,
  ExternalLink,
  FileText,
  HelpCircle,
  Phone,
  Plus,
  RefreshCw,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { TwilioConfigDialog } from "./components/TwilioConfigDialog"
import { TwilioPhoneNumberManager } from "./components/TwilioPhoneNumberManager"

// Define interfaces for component props
interface CrmIntegrationCardProps {
  name: string;
  description: string;
  icon: ReactNode;
  status: string;
  lastSync?: string;
}

interface CallForwardingCardProps {
  name: string;
  description: string;
  icon: ReactNode;
  status: string;
  lastSync?: string;
}

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("crm")
  // We no longer need a hardcoded teamId since our API will handle users without teams

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Connect your CRMs and call forwarding systems</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Connections
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </div>
      </div>

      <Tabs defaultValue="crm" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="crm">CRM Systems</TabsTrigger>
            <TabsTrigger value="call-forwarding">Call Forwarding</TabsTrigger>
            <TabsTrigger value="api">API Connections</TabsTrigger>
            <TabsTrigger value="settings">Integration Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="crm" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CrmIntegrationCard
              name="Salesforce"
              description="Connect to Salesforce to sync customer data and call records"
              icon={<Database className="h-12 w-12 text-blue-600" />}
              status="connected"
              lastSync="Today at 10:30 AM"
            />
            <CrmIntegrationCard
              name="HubSpot"
              description="Integrate with HubSpot CRM for contact management and sales tracking"
              icon={<Database className="h-12 w-12 text-orange-600" />}
              status="not-connected"
              lastSync=""
            />
            <CrmIntegrationCard
              name="Microsoft Dynamics"
              description="Connect to Microsoft Dynamics 365 for enterprise CRM capabilities"
              icon={<Database className="h-12 w-12 text-indigo-600" />}
              status="not-connected"
              lastSync=""
            />
            <CrmIntegrationCard
              name="Zoho CRM"
              description="Integrate with Zoho CRM for sales automation and analytics"
              icon={<Database className="h-12 w-12 text-green-600" />}
              status="not-connected"
              lastSync=""
            />
            <CrmIntegrationCard
              name="Zendesk"
              description="Connect to Zendesk for customer support and ticket management"
              icon={<Database className="h-12 w-12 text-teal-600" />}
              status="not-connected"
            />
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[220px]">
                <div className="rounded-full bg-slate-100 p-3 mb-4">
                  <Plus className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">Add Custom CRM</h3>
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Connect to any CRM system using our API
                </p>
                <Button variant="outline">Configure Custom CRM</Button>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Need help with CRM integration?</AlertTitle>
            <AlertDescription>
              Our team can help you set up and configure your CRM integration.
              <Button variant="link" className="text-blue-800 p-0 h-auto ml-2">
                Contact support
              </Button>
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="call-forwarding" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <CallForwardingCard
              name="Twilio"
              description="Connect to Twilio for voice, SMS, and call forwarding capabilities"
              icon={<Phone className="h-12 w-12 text-red-600" />}
              status="connected"
              lastSync="Today at 9:15 AM"
            />
            <CallForwardingCard
              name="Vonage"
              description="Integrate with Vonage for global voice and messaging solutions"
              icon={<Phone className="h-12 w-12 text-purple-600" />}
              status="not-connected"
              lastSync=""
            />
            <CallForwardingCard
              name="Amazon Connect"
              description="Use Amazon Connect for cloud-based contact center services"
              icon={<Phone className="h-12 w-12 text-yellow-600" />}
              status="not-connected"
              lastSync=""
            />
            <CallForwardingCard
              name="RingCentral"
              description="Connect to RingCentral for cloud communications and call management"
              icon={<Phone className="h-12 w-12 text-blue-600" />}
              status="not-connected"
              lastSync=""
            />
            <CallForwardingCard
              name="8x8"
              description="Integrate with 8x8 for cloud voice, video, and contact center solutions"
              icon={<Phone className="h-12 w-12 text-green-600" />}
              status="not-connected"
              lastSync=""
            />
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[220px]">
                <div className="rounded-full bg-slate-100 p-3 mb-4">
                  <Plus className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">Add Custom Provider</h3>
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Connect to any call forwarding system using SIP or our API
                </p>
                <Button variant="outline">Configure Custom Provider</Button>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-indigo-50 border-indigo-200 text-indigo-800">
            <Phone className="h-4 w-4" />
            <AlertTitle>Phone number management</AlertTitle>
            <AlertDescription>
              You can manage your phone numbers and call routing rules in the Call Forwarding settings.
              <Button variant="link" className="text-indigo-800 p-0 h-auto ml-2" asChild>
                <Link href="/dashboard/live-calls">Go to Call Forwarding</Link>
              </Button>
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Connections</CardTitle>
              <CardDescription>Manage your API keys and webhook endpoints</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">API Keys</h3>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate New Key
                  </Button>
                </div>

                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Key Name</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Created</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Last Used</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-4 align-middle font-medium">Production API Key</td>
                          <td className="p-4 align-middle">2023-05-15</td>
                          <td className="p-4 align-middle">Today at 10:30 AM</td>
                          <td className="p-4 align-middle">
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                Revoke
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 align-middle font-medium">Development API Key</td>
                          <td className="p-4 align-middle">2023-06-22</td>
                          <td className="p-4 align-middle">Yesterday at 3:45 PM</td>
                          <td className="p-4 align-middle">
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                Revoke
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Webhook Endpoints</h3>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Endpoint
                  </Button>
                </div>

                <div className="rounded-md border">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Endpoint Name</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">URL</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Events</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-4 align-middle font-medium">Call Events</td>
                          <td className="p-4 align-middle text-sm text-muted-foreground">
                            https://example.com/webhooks/calls
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="bg-slate-100">
                                call.started
                              </Badge>
                              <Badge variant="outline" className="bg-slate-100">
                                call.ended
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-4 align-middle font-medium">Transcript Events</td>
                          <td className="p-4 align-middle text-sm text-muted-foreground">
                            https://example.com/webhooks/transcripts
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="bg-slate-100">
                                transcript.created
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Access our API documentation and developer resources</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h4 className="font-medium">API Reference</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Complete documentation for our REST API endpoints
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      View Documentation
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h4 className="font-medium">SDK Documentation</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Guides for using our JavaScript, Python, and Ruby SDKs
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      View SDKs
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h4 className="font-medium">Webhook Events</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Documentation for all webhook events and payloads
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      View Events
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>Configure global settings for all integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Data Synchronization</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="sync-frequency" className="flex flex-col space-y-1">
                      <span>Sync Frequency</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        How often to sync data with connected systems
                      </span>
                    </Label>
                    <Select defaultValue="15">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Every 5 minutes</SelectItem>
                        <SelectItem value="15">Every 15 minutes</SelectItem>
                        <SelectItem value="30">Every 30 minutes</SelectItem>
                        <SelectItem value="60">Every hour</SelectItem>
                        <SelectItem value="360">Every 6 hours</SelectItem>
                        <SelectItem value="720">Every 12 hours</SelectItem>
                        <SelectItem value="1440">Every day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto-sync" className="flex flex-col space-y-1">
                      <span>Auto-Sync New Data</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Automatically sync new data as it's created
                      </span>
                    </Label>
                    <Switch id="auto-sync" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="conflict-resolution" className="flex flex-col space-y-1">
                      <span>Conflict Resolution</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        How to handle data conflicts between systems
                      </span>
                    </Label>
                    <Select defaultValue="newest">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest Wins</SelectItem>
                        <SelectItem value="ai-call">AI Call Clarity Wins</SelectItem>
                        <SelectItem value="external">External System Wins</SelectItem>
                        <SelectItem value="manual">Manual Resolution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security & Compliance</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="data-encryption" className="flex flex-col space-y-1">
                      <span>Data Encryption</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Encrypt all data transferred between systems
                      </span>
                    </Label>
                    <Switch id="data-encryption" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="audit-logging" className="flex flex-col space-y-1">
                      <span>Audit Logging</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Log all integration activities for compliance
                      </span>
                    </Label>
                    <Switch id="audit-logging" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="ip-restrictions" className="flex flex-col space-y-1">
                      <span>IP Restrictions</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Limit API access to specific IP addresses
                      </span>
                    </Label>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Mappings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="contact-mapping" className="flex flex-col space-y-1">
                      <span>Contact Field Mapping</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Default field mappings for contact data
                      </span>
                    </Label>
                    <Button variant="outline" size="sm">
                      Edit Mappings
                    </Button>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="call-mapping" className="flex flex-col space-y-1">
                      <span>Call Record Mapping</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Default field mappings for call records
                      </span>
                    </Label>
                    <Button variant="outline" size="sm">
                      Edit Mappings
                    </Button>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="custom-fields" className="flex flex-col space-y-1">
                      <span>Custom Fields</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Configure custom fields for integration data
                      </span>
                    </Label>
                    <Button variant="outline" size="sm">
                      Manage Fields
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t p-6">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function CrmIntegrationCard({ name, description, icon, status, lastSync }: CrmIntegrationCardProps) {
  const [showConfigDialog, setShowConfigDialog] = useState(false)

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="rounded-full bg-slate-100 p-3">{icon}</div>
            <Badge
              variant="outline"
              className={
                status === "connected"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-slate-100 text-slate-800 border-slate-200"
              }
            >
              {status === "connected" ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          <CardTitle className="text-xl mt-4">{name}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {status === "connected" && (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                <span>Successfully connected</span>
              </div>
              <div className="mt-1">Last synced: {lastSync}</div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {status === "connected" ? (
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1">
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
              <Button variant="outline" className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => setShowConfigDialog(true)}>
              Connect {name}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect to {name}</DialogTitle>
            <DialogDescription>Enter your {name} credentials to establish the connection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" placeholder="Enter your API key" />
              <p className="text-xs text-muted-foreground">
                You can find your API key in your {name} account settings.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-secret">API Secret</Label>
              <Input id="api-secret" type="password" placeholder="Enter your API secret" />
              <p className="text-xs text-muted-foreground">
                Keep this secure. Never share your API secret with anyone.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instance-url">Instance URL</Label>
              <Input id="instance-url" placeholder="https://your-instance.example.com" />
              <p className="text-xs text-muted-foreground">The URL of your {name} instance.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Cancel
            </Button>
            <Button>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CallForwardingCard({ name, description, icon, status, lastSync }: CallForwardingCardProps) {
  const [showConfigDialog, setShowConfigDialog] = useState(false)
  const [showNumberManager, setShowNumberManager] = useState(false)

  // For Twilio-specific functionality
  const isTwilio = name === "Twilio"

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="rounded-full bg-slate-100 p-3">{icon}</div>
            <Badge
              variant="outline"
              className={
                status === "connected"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-slate-100 text-slate-800 border-slate-200"
              }
            >
              {status === "connected" ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          <CardTitle className="text-xl mt-4">{name}</CardTitle>
          <CardDescription className="mt-1">{description}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          {status === "connected" && (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                <span>Successfully connected</span>
              </div>
              <div className="mt-1">Last synced: {lastSync}</div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          {status === "connected" ? (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => isTwilio ? setShowConfigDialog(true) : null}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => isTwilio ? setShowNumberManager(true) : null}
              >
                <Phone className="mr-2 h-4 w-4" />
                Manage Numbers
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => setShowConfigDialog(true)}>
              Connect {name}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Use our custom Twilio components for Twilio, or the generic dialog for other providers */}
      {isTwilio ? (
        <>
          <TwilioConfigDialog
            open={showConfigDialog}
            onOpenChange={setShowConfigDialog}
          />
          <TwilioPhoneNumberManager
            open={showNumberManager}
            onOpenChange={setShowNumberManager}
          />
        </>
      ) : (
        <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Connect to {name}</DialogTitle>
              <DialogDescription>Enter your {name} credentials to establish the connection.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="account-sid">Account SID</Label>
                <Input id="account-sid" placeholder="Enter your Account SID" />
                <p className="text-xs text-muted-foreground">You can find your Account SID in your {name} dashboard.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-token">Auth Token</Label>
                <Input id="auth-token" type="password" placeholder="Enter your Auth Token" />
                <p className="text-xs text-muted-foreground">
                  Keep this secure. Never share your Auth Token with anyone.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-numbers">Phone Numbers</Label>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium">No phone numbers added yet</p>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Number
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can add phone numbers after connecting your account.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancel
              </Button>
              <Button>Connect</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
