"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, PlusCircle, Building, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useTeam } from "@/contexts/TeamContext"

// Import Team type from TeamContext
import { Team } from "@/contexts/TeamContext"

interface TeamSwitcherProps {
  className?: string
}

export function TeamSwitcher({ className }: TeamSwitcherProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { teams, selectedTeam, setSelectedTeam, loading, createNewTeam } = useTeam()
  const [open, setOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team)
    setOpen(false)
    router.refresh()
  }

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Team name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const team = await createNewTeam(newTeamName)
      if (team) {
        setCreateDialogOpen(false)
        setNewTeamName("")
        router.refresh()
      }
    } finally {
      setIsCreating(false)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" className={cn("w-[200px] justify-between", className)}>
        <span className="animate-pulse">Loading teams...</span>
      </Button>
    )
  }

  // If no teams exist, show a create team button
  if (teams.length === 0) {
    return (
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className={cn("w-[200px] justify-between", className)}>
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Your First Team</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new team</DialogTitle>
            <DialogDescription>
              Create your first team to get started with AI Call Clarity.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Team name</Label>
              <Input
                id="name"
                placeholder="Enter team name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateTeam}
              disabled={isCreating || !newTeamName.trim()}
            >
              {isCreating ? "Creating..." : "Create Team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Normal team switcher when teams exist
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className={cn("w-[200px] justify-between", className)}
        >
          {selectedTeam ? (
            <>
              <Building className="mr-2 h-4 w-4" />
              <span className="truncate max-w-[120px] inline-block">
                {selectedTeam.name}
              </span>
            </>
          ) : (
            "Select team"
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search team..." />
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandGroup heading="Teams">
              {Array.isArray(teams) && teams.map((team) => (
                <CommandItem
                  key={team.id}
                  onSelect={() => handleTeamSelect(team)}
                  className="text-sm"
                >
                  <Building className="mr-2 h-4 w-4" />
                  {team.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedTeam?.id === team.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <CommandItem onSelect={() => setCreateDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Team
                  </CommandItem>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a new team</DialogTitle>
                    <DialogDescription>
                      Add a new team to manage your call center operations.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Team name</Label>
                      <Input
                        id="name"
                        placeholder="Enter team name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleCreateTeam}
                      disabled={isCreating || !newTeamName.trim()}
                    >
                      {isCreating ? "Creating..." : "Create Team"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}