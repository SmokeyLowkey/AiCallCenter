"use client"

import { Phone } from "lucide-react"
import { useTeam } from "@/contexts/TeamContext"

export function SidebarHeaderContent() {
  const { selectedTeam } = useTeam()

  return (
    <div className="flex flex-col px-2 py-3">
      <div className="flex items-center gap-2">
        <Phone className="h-6 w-6 text-indigo-600" />
        <span className="font-bold text-lg">AI Call Clarity</span>
      </div>
      {selectedTeam && (
        <div className="text-xs text-muted-foreground mt-1 ml-8">
          Team: {selectedTeam.name}
        </div>
      )}
    </div>
  )
}