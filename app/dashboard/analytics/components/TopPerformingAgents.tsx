"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Agent {
  id: string
  name: string
  avatar?: string
  role?: string
  calls: number
  resolution: number
  satisfaction: number
}

interface TopPerformingAgentsProps {
  limit?: number
  days?: number
}

export function TopPerformingAgents({ limit = 3, days = 7 }: TopPerformingAgentsProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch agent performance data
        const response = await fetch(`/api/analytics/agents?days=${days}&limit=${limit}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch agent performance data')
        }
        
        const data = await response.json()
        setAgents(data)
      } catch (err) {
        console.error('Error fetching agent performance:', err)
        setError('Failed to load agent performance data')
        
        // Use sample data as fallback
        setAgents([
          {
            id: "1",
            name: "Emma Rodriguez",
            avatar: "/placeholder.svg?height=40&width=40",
            role: "Senior Support Agent",
            calls: 145,
            resolution: 92,
            satisfaction: 4.8,
          },
          {
            id: "2",
            name: "Michael Chen",
            avatar: "/placeholder.svg?height=40&width=40",
            role: "Technical Support",
            calls: 132,
            resolution: 89,
            satisfaction: 4.7,
          },
          {
            id: "3",
            name: "Sarah Johnson",
            avatar: "/placeholder.svg?height=40&width=40",
            role: "Customer Support",
            calls: 128,
            resolution: 85,
            satisfaction: 4.6,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [days, limit])

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-slate-200"></div>
                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-300"></div>
              </div>
              <div>
                <div className="h-4 w-24 bg-slate-200 rounded"></div>
                <div className="h-3 w-16 bg-slate-200 rounded mt-1"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="h-3 w-8 bg-slate-200 rounded mx-auto"></div>
                <div className="h-4 w-6 bg-slate-200 rounded mx-auto mt-1"></div>
              </div>
              <div>
                <div className="h-3 w-8 bg-slate-200 rounded mx-auto"></div>
                <div className="h-4 w-8 bg-slate-200 rounded mx-auto mt-1"></div>
              </div>
              <div>
                <div className="h-3 w-8 bg-slate-200 rounded mx-auto"></div>
                <div className="h-4 w-6 bg-slate-200 rounded mx-auto mt-1"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p>{error}</p>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-4 text-slate-500">
        <p>No agent performance data available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {agents.map((agent, i) => (
        <div key={agent.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border border-slate-200">
                <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-medium text-white">
                {i + 1}
              </div>
            </div>
            <div>
              <h4 className="font-medium">{agent.name}</h4>
              <p className="text-xs text-muted-foreground">{agent.role || "Agent"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Calls</p>
              <p className="font-medium">{agent.calls}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resolution</p>
              <p className="font-medium">{agent.resolution}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Satisfaction</p>
              <p className="font-medium">{agent.satisfaction}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}