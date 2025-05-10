"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
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

// Define types for our data
interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  jobTitle?: string
  department: string
  departmentId?: string
  team: string
  teamId: string
  status: string
  performance: number
  callsHandled: number
  avgCallDuration?: number
  resolutionRate?: number
  satisfactionScore?: number
  profileImage?: string
}

interface Team {
  id: string
  name: string
  description?: string
  industry?: string
  owner: {
    id: string
    name: string
  }
  memberCount: number
}

interface Department {
  id: string
  name: string
  description?: string
  users: any[]
}

export default function TeamPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState(tabParam || "agents")
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      })
      return
    }
    
    try {
      setIsCreatingTeam(true)
      
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newTeamName }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create team")
      }
      
      const data = await response.json()
      
      toast({
        title: "Success",
        description: "Team created successfully",
      })
      
      // Close the dialog and reset the form
      setCreateTeamDialogOpen(false)
      setNewTeamName("")
      
      // Refresh the page to show the new team
      router.refresh()
    } catch (error) {
      console.error("Error creating team:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create team",
        variant: "destructive",
      })
    } finally {
      setIsCreatingTeam(false)
    }
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<TeamMember[]>([])
  const [managers, setManagers] = useState<TeamMember[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 10

  // Fetch team members (agents and managers)
  useEffect(() => {
    async function fetchTeamMembers() {
      try {
        setLoading(true)
        
        // Fetch agents
        const agentsResponse = await fetch('/api/team-members?role=AGENT')
        if (!agentsResponse.ok) {
          throw new Error('Failed to fetch agents')
        }
        const agentsData = await agentsResponse.json()
        setAgents(agentsData)
        
        // Fetch managers
        const managersResponse = await fetch('/api/team-members?role=MANAGER')
        if (!managersResponse.ok) {
          throw new Error('Failed to fetch managers')
        }
        const managersData = await managersResponse.json()
        setManagers(managersData)
        
        setTotalItems(agentsData.length + managersData.length)
      } catch (error) {
        console.error('Error fetching team members:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTeamMembers()
  }, [])
  
  // Fetch teams
  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await fetch('/api/teams/details')
        if (!response.ok) {
          throw new Error('Failed to fetch teams')
        }
        const data = await response.json()
        setTeams(data)
      } catch (error) {
        console.error('Error fetching teams:', error)
      }
    }
    
    fetchTeams()
  }, [])
  
  // Fetch departments
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch('/api/departments')
        if (!response.ok) {
          throw new Error('Failed to fetch departments')
        }
        const data = await response.json()
        setDepartments(data)
      } catch (error) {
        console.error('Error fetching departments:', error)
      }
    }
    
    fetchDepartments()
  }, [])
  
  // Filter agents based on search query and selected department
  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      searchQuery === '' ||
      agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.department?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesDepartment =
      selectedDepartment === 'all' ||
      agent.department?.toLowerCase() === selectedDepartment.toLowerCase()
    
    return matchesSearch && matchesDepartment
  })
  
  // Filter managers based on search query
  const filteredManagers = managers.filter(manager => {
    return searchQuery === '' ||
      manager.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.department?.toLowerCase().includes(searchQuery.toLowerCase())
  })
  
  // Handle department filter change
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedAgents = filteredAgents.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage)

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
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
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
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
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
        <Select
          defaultValue="all"
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name.toLowerCase()}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} className="space-y-4" onValueChange={(value) => {
        setActiveTab(value)
        router.push(`/dashboard/team?tab=${value}`)
      }}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="managers">Managers</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          <div className="text-sm text-muted-foreground">
            Showing <strong>{paginatedAgents.length}</strong> of <strong>{filteredAgents.length}</strong> team members
          </div>
        </div>

        <TabsContent value="agents" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <h3 className="text-lg font-medium">No agents found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
            <>
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
                      {paginatedAgents.map((agent, i) => (
                        <tr key={agent.id || i} className="border-b">
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={agent.profileImage || "/placeholder.svg"} alt={agent.name} />
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
                              {agent.status ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1) : "Active"}
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
          </>
          )}
        </TabsContent>

        <TabsContent value="managers" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredManagers.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <h3 className="text-lg font-medium">No managers found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            </div>
          ) : (
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
                    {filteredManagers.map((manager, i) => (
                      <tr key={manager.id || i} className="border-b">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={manager.profileImage || "/placeholder.svg"} alt={manager.name} />
                              <AvatarFallback>{manager.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{manager.name}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">{manager.role}</td>
                        <td className="p-4 align-middle">{manager.department}</td>
                        <td className="p-4 align-middle">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="bg-slate-100">
                              {manager.team || "No team"}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge
                            className={
                              manager.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                            }
                          >
                            {manager.status ? manager.status.charAt(0).toUpperCase() + manager.status.slice(1) : "Active"}
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
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : teams.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium">No teams found</h3>
                <p className="text-muted-foreground">Create a team to get started</p>
              </div>
              <Button onClick={() => setCreateTeamDialogOpen(true)}>
                Create a team
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team, i) => (
              <Card key={team.id || i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{team.name}</CardTitle>
                    <Badge className="bg-indigo-100 text-indigo-800">{team.industry || "General"}</Badge>
                  </div>
                  <CardDescription>Managed by {team.owner?.name || "Unknown"}</CardDescription>
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
                        <span className="font-medium">85%</span>
                      </div>
                      <Progress
                        value={85} // Default performance value
                        className="h-2"
                        indicatorClassName="bg-blue-600"
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
                <Button
                  variant="outline"
                  onClick={() => setCreateTeamDialogOpen(true)}
                >
                  Create Team
                </Button>
              </CardContent>
            </Card>
          </div>
          )}
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

      {/* Create Team Dialog */}
      <Dialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>Add a new team to organize your agents.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="teamName" className="text-right">
                Name
              </Label>
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Enter team name"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateTeamDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTeam}
              disabled={isCreatingTeam}
            >
              {isCreatingTeam ? "Creating..." : "Add Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
