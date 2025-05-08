"use client"

import { useState } from "react"
import {
  BarChart3,
  Download,
  Filter,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Star,
  Trash2,
  User,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"

export default function TeamPage() {
  const [activeTab, setActiveTab] = useState("agents")
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and their performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Team Member</DialogTitle>
                <DialogDescription>Add a new agent or manager to your team.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" placeholder="Enter full name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input id="email" placeholder="Enter email address" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3" id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="senior-agent">Senior Agent</SelectItem>
                      <SelectItem value="team-lead">Team Lead</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">
                    Department
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3" id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="support">Customer Support</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="team" className="text-right">
                    Team
                  </Label>
                  <Select>
                    <SelectTrigger className="col-span-3" id="team">
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alpha">Alpha Team</SelectItem>
                      <SelectItem value="beta">Beta Team</SelectItem>
                      <SelectItem value="gamma">Gamma Team</SelectItem>
                      <SelectItem value="delta">Delta Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="access-level" className="text-right">
                    Access Level
                  </Label>
                  <Select defaultValue="standard">
                    <SelectTrigger className="col-span-3" id="access-level">
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="extended">Extended</SelectItem>
                      <SelectItem value="full">Full Access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-start-2 col-span-3 flex items-center space-x-2">
                    <Switch id="send-invite" defaultChecked />
                    <Label htmlFor="send-invite">Send email invitation</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Team Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search team members by name, role, or department..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="support">Customer Support</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="technical">Technical Support</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="agents" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="managers">Managers</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            Showing <strong>15</strong> of <strong>24</strong> team members
          </div>
        </div>

        <TabsContent value="agents" className="space-y-4">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Role</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Department</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Team</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Performance</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Emma Rodriguez",
                      avatar: "/placeholder.svg?height=32&width=32",
                      role: "Senior Agent",
                      department: "Customer Support",
                      team: "Alpha Team",
                      status: "active",
                      performance: 92,
                    },
                    {
                      name: "Michael Chen",
                      avatar: "/placeholder.svg?height=32&width=32",
                      role: "Agent",
                      department: "Technical Support",
                      team: "Beta Team",
                      status: "active",
                      performance: 89,
                    },
                    {
                      name: "Sarah Johnson",
                      avatar: "/placeholder.svg?height=32&width=32",
                      role: "Agent",
                      department: "Customer Support",
                      team: "Alpha Team",
                      status: "active",
                      performance: 85,
                    },
                    {
                      name: "David Williams",
                      avatar: "/placeholder.svg?height=32&width=32",
                      role: "Senior Agent",
                      department: "Sales",
                      team: "Gamma Team",
                      status: "active",
                      performance: 82,
                    },
                    {
                      name: "Lisa Taylor",
                      avatar: "/placeholder.svg?height=32&width=32",
                      role: "Agent",
                      department: "Billing",
                      team: "Delta Team",
                      status: "inactive",
                      performance: 79,
                    },
                  ].map((agent, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                            <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{agent.name}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{agent.role}</td>
                      <td className="p-4 align-middle">{agent.department}</td>
                      <td className="p-4 align-middle">{agent.team}</td>
                      <td className="p-4 align-middle">
                        <Badge
                          className={
                            agent.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                          }
                        >
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={agent.performance}
                            className="h-2 w-[100px]"
                            indicatorClassName={
                              agent.performance >= 90
                                ? "bg-green-600"
                                : agent.performance >= 80
                                  ? "bg-blue-600"
                                  : agent.performance >= 70
                                    ? "bg-amber-600"
                                    : "bg-red-600"
                            }
                          />
                          <span className="text-sm font-medium">{agent.performance}%</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Performance
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Button variant="outline" className="mx-2">
              Previous
            </Button>
            <div className="flex items-center">
              <Button variant="outline" className="h-8 w-8 p-0" disabled>
                1
              </Button>
              <Button variant="ghost" className="h-8 w-8 p-0">
                2
              </Button>
              <Button variant="ghost" className="h-8 w-8 p-0">
                3
              </Button>
              <span className="mx-2">...</span>
              <Button variant="ghost" className="h-8 w-8 p-0">
                5
              </Button>
            </div>
            <Button variant="outline" className="mx-2">
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="managers" className="space-y-4">
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Name</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Role</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Department</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Teams Managed</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                    <th className="h-10 px-4 text-left font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Jennifer Adams",
                      avatar: "/placeholder.svg?height=32&width=32",
                      role: "Department Manager",
                      department: "Customer Support",
                      teamsManaged: ["Alpha Team", "Beta Team"],
                      status: "active",
                    },
                    {
                      name: "Robert Johnson",
                      avatar: "/placeholder.svg?height=32&width=32",
                      role: "Team Lead",
                      department: "Technical Support",
                      teamsManaged: ["Beta Team"],
                      status: "active",
                    },
                    {
                      name: "Maria Garcia",
                      avatar: "/placeholder.svg?height=32&width=32",
                      role: "Department Manager",
                      department: "Sales",
                      teamsManaged: ["Gamma Team"],
                      status: "active",
                    },
                  ].map((manager, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={manager.avatar || "/placeholder.svg"} alt={manager.name} />
                            <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{manager.name}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">{manager.role}</td>
                      <td className="p-4 align-middle">{manager.department}</td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-wrap gap-1">
                          {manager.teamsManaged.map((team, i) => (
                            <Badge key={i} variant="outline" className="bg-slate-100">
                              {team}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Badge
                          className={
                            manager.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                          }
                        >
                          {manager.status.charAt(0).toUpperCase() + manager.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <User className="mr-2 h-4 w-4" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              Manage Teams
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Alpha Team",
                department: "Customer Support",
                memberCount: 8,
                manager: "Jennifer Adams",
                performance: 88,
              },
              {
                name: "Beta Team",
                department: "Technical Support",
                memberCount: 6,
                manager: "Robert Johnson",
                performance: 92,
              },
              {
                name: "Gamma Team",
                department: "Sales",
                memberCount: 5,
                manager: "Maria Garcia",
                performance: 85,
              },
              {
                name: "Delta Team",
                department: "Billing",
                memberCount: 4,
                manager: "James Wilson",
                performance: 79,
              },
            ].map((team, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{team.name}</CardTitle>
                    <Badge className="bg-indigo-100 text-indigo-800">{team.department}</Badge>
                  </div>
                  <CardDescription>Managed by {team.manager}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Team Members</span>
                      <span className="font-medium">{team.memberCount}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Performance</span>
                        <span className="font-medium">{team.performance}%</span>
                      </div>
                      <Progress
                        value={team.performance}
                        className="h-2"
                        indicatorClassName={
                          team.performance >= 90
                            ? "bg-green-600"
                            : team.performance >= 80
                              ? "bg-blue-600"
                              : team.performance >= 70
                                ? "bg-amber-600"
                                : "bg-red-600"
                        }
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    View Members
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Performance
                  </Button>
                </CardFooter>
              </Card>
            ))}

            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-6 h-full min-h-[220px]">
                <div className="rounded-full bg-slate-100 p-3 mb-4">
                  <UserPlus className="h-6 w-6 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">Create New Team</h3>
                <p className="text-sm text-center text-muted-foreground mb-4">Add a new team to organize your agents</p>
                <Button variant="outline">Create Team</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.3%</div>
                <p className="text-xs text-muted-foreground">+5.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Call Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8m 42s</div>
                <p className="text-xs text-muted-foreground">-2.3% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.6/5</div>
                <p className="text-xs text-muted-foreground">+0.3 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">AI Assistance Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">92.7%</div>
                <p className="text-xs text-muted-foreground">+3.1% from last month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Agents with the highest performance scores this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Rank</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Agent</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Department</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Resolution Rate</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Avg. Duration</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">CSAT</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Overall Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          rank: 1,
                          name: "Emma Rodriguez",
                          avatar: "/placeholder.svg?height=32&width=32",
                          department: "Customer Support",
                          resolutionRate: "92%",
                          avgDuration: "7m 12s",
                          csat: "4.8/5",
                          overallScore: "95",
                        },
                        {
                          rank: 2,
                          name: "Michael Chen",
                          avatar: "/placeholder.svg?height=32&width=32",
                          department: "Technical Support",
                          resolutionRate: "89%",
                          avgDuration: "8m 45s",
                          csat: "4.7/5",
                          overallScore: "92",
                        },
                        {
                          rank: 3,
                          name: "Sarah Johnson",
                          avatar: "/placeholder.svg?height=32&width=32",
                          department: "Customer Support",
                          resolutionRate: "85%",
                          avgDuration: "6m 30s",
                          csat: "4.6/5",
                          overallScore: "88",
                        },
                        {
                          rank: 4,
                          name: "David Williams",
                          avatar: "/placeholder.svg?height=32&width=32",
                          department: "Sales",
                          resolutionRate: "82%",
                          avgDuration: "9m 20s",
                          csat: "4.5/5",
                          overallScore: "85",
                        },
                        {
                          rank: 5,
                          name: "Lisa Taylor",
                          avatar: "/placeholder.svg?height=32&width=32",
                          department: "Billing",
                          resolutionRate: "79%",
                          avgDuration: "10m 15s",
                          csat: "4.3/5",
                          overallScore: "82",
                        },
                      ].map((agent, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4 align-middle">
                            <div className="flex items-center justify-center">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-800">
                                {agent.rank}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{agent.name}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle">{agent.department}</td>
                          <td className="p-4 align-middle">{agent.resolutionRate}</td>
                          <td className="p-4 align-middle">{agent.avgDuration}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              <span className="mr-2">{agent.csat}</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= Math.round(Number.parseFloat(agent.csat))
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-slate-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <Badge
                              className={
                                Number.parseInt(agent.overallScore) >= 90
                                  ? "bg-green-100 text-green-800"
                                  : Number.parseInt(agent.overallScore) >= 80
                                    ? "bg-blue-100 text-blue-800"
                                    : Number.parseInt(agent.overallScore) >= 70
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                              }
                            >
                              {agent.overallScore}/100
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Full Performance Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
