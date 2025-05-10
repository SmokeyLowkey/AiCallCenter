"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

// Export the Team interface so it can be imported elsewhere
export interface Team {
  id: string
  name: string
  companyId: string
  companyName: string
}

interface TeamContextType {
  selectedTeam: Team | null
  setSelectedTeam: (team: Team) => void
  teams: Team[]
  loading: boolean
  error: string | null
  createNewTeam: (teamName: string) => Promise<Team | null>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTeams() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/teams')
        
        if (response.status === 401) {
          // Handle unauthorized - user not logged in
          console.log('User not authenticated, skipping team fetch')
          setTeams([])
          setLoading(false)
          return
        }
        
        if (!response.ok) {
          // If the user has no teams yet, don't show an error
          if (response.status === 404) {
            console.log('No teams found for user')
            setTeams([])
            setLoading(false)
            return
          }
          
          throw new Error(`Failed to fetch teams: ${response.status}`)
        }
        
        const data = await response.json()
        // Ensure teams is always an array
        const teamsArray = Array.isArray(data.teams) ? data.teams : []
        setTeams(teamsArray)
        
        // If we have teams but no selected team, select the first one
        if (teamsArray.length > 0 && !selectedTeam) {
          // Check if there's a stored team first
          const storedTeam = localStorage.getItem('selectedTeam')
          if (storedTeam) {
            try {
              const parsedTeam = JSON.parse(storedTeam)
              // Verify the stored team still exists in the user's teams
              if (teamsArray.some((team: Team) => team.id === parsedTeam.id)) {
                setSelectedTeam(parsedTeam)
              } else {
                // If stored team no longer exists, use the first available team
                setSelectedTeam(teamsArray[0])
                localStorage.setItem('selectedTeam', JSON.stringify(teamsArray[0]))
              }
            } catch (error) {
              console.error('Error parsing stored team:', error)
              setSelectedTeam(teamsArray[0])
              localStorage.setItem('selectedTeam', JSON.stringify(teamsArray[0]))
            }
          } else {
            // No stored team, use the first available team
            setSelectedTeam(teamsArray[0])
            localStorage.setItem('selectedTeam', JSON.stringify(teamsArray[0]))
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
        // Don't show error toast for new users without teams
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    // We'll handle the stored team inside fetchTeams to ensure
    // we validate it against the actual teams the user has access to

    fetchTeams()
  }, []) // Remove toast from dependencies to avoid potential re-renders

  const handleTeamChange = (team: Team) => {
    setSelectedTeam(team)
    localStorage.setItem('selectedTeam', JSON.stringify(team))
    
    toast({
      title: "Team Changed",
      description: `You are now working in ${team.name}`,
    })
  }
  
  // Function to create a new team when user has none
  const createNewTeam = async (teamName: string) => {
    try {
      setLoading(true)
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: teamName }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to create team')
      }
      
      const data = await response.json()
      const newTeam = data.team
      
      // Update teams list and select the new team
      setTeams([...teams, newTeam])
      setSelectedTeam(newTeam)
      localStorage.setItem('selectedTeam', JSON.stringify(newTeam))
      
      toast({
        title: "Team Created",
        description: `You are now working in ${newTeam.name}`,
      })
      
      return newTeam
    } catch (error) {
      console.error('Error creating team:', error)
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  return (
    <TeamContext.Provider
      value={{
        selectedTeam,
        setSelectedTeam: handleTeamChange,
        teams,
        loading,
        error,
        createNewTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  
  return context
}