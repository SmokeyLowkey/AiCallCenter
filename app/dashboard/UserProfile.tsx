"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch the user's session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching user session:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <>
        <Avatar className="h-6 w-6">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
        <span className="hidden md:inline-flex">Loading...</span>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Avatar className="h-6 w-6">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <span className="hidden md:inline-flex">Guest</span>
      </>
    )
  }

  // Get initials for the avatar fallback
  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : user.email?.substring(0, 2).toUpperCase() || 'U'

  return (
    <>
      <Avatar className="h-6 w-6">
        <AvatarImage src={user.image || "/placeholder.svg?height=32&width=32"} alt="Avatar" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="hidden md:inline-flex">{user.name || user.email}</span>
    </>
  )
}