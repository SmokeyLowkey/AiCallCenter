"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Star, Phone, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

interface VIPPhoneNumber {
  id: string
  name: string
  phoneNumber: string
  notes?: string
}

export function VIPPhoneNumberManager() {
  const [vipNumbers, setVipNumbers] = useState<VIPPhoneNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newVipNumber, setNewVipNumber] = useState<Partial<VIPPhoneNumber>>({
    name: "",
    phoneNumber: "",
    notes: ""
  })
  const { toast } = useToast()

  // Fetch VIP numbers on component mount
  useEffect(() => {
    const fetchVipNumbers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/vip-numbers')
        
        if (response.ok) {
          const data = await response.json()
          setVipNumbers(data)
        } else {
          console.error('Failed to fetch VIP numbers')
          toast({
            title: "Error",
            description: "Failed to load VIP numbers",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error fetching VIP numbers:', error)
        toast({
          title: "Error",
          description: "Failed to load VIP numbers",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVipNumbers()
  }, [toast])

  // Add a new VIP number
  const handleAddVipNumber = async () => {
    try {
      // Validate phone number
      if (!newVipNumber.phoneNumber) {
        toast({
          title: "Error",
          description: "Phone number is required",
          variant: "destructive"
        })
        return
      }

      // Format phone number to E.164 format if not already
      let formattedNumber = newVipNumber.phoneNumber
      if (!formattedNumber.startsWith('+')) {
        // If US/Canada number without country code
        if (formattedNumber.length === 10 && /^\d+$/.test(formattedNumber)) {
          formattedNumber = `+1${formattedNumber}`
        } else {
          // Add + if missing but has country code
          formattedNumber = `+${formattedNumber}`
        }
      }

      const response = await fetch('/api/vip-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newVipNumber,
          phoneNumber: formattedNumber
        })
      })

      if (response.ok) {
        const newNumber = await response.json()
        setVipNumbers([...vipNumbers, newNumber])
        setNewVipNumber({ name: "", phoneNumber: "", notes: "" })
        setAddDialogOpen(false)
        toast({
          title: "Success",
          description: "VIP number added successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add VIP number')
      }
    } catch (error) {
      console.error('Error adding VIP number:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add VIP number",
        variant: "destructive"
      })
    }
  }

  // Delete a VIP number
  const handleDeleteVipNumber = async (id: string) => {
    try {
      const response = await fetch(`/api/vip-numbers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setVipNumbers(vipNumbers.filter(num => num.id !== id))
        toast({
          title: "Success",
          description: "VIP number removed successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete VIP number')
      }
    } catch (error) {
      console.error('Error deleting VIP number:', error)
      toast({
        title: "Error",
        description: "Failed to delete VIP number",
        variant: "destructive"
      })
    }
  }

  // No mock data - we'll only show VIP numbers from the database

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-amber-500" />
              VIP Phone Numbers
            </CardTitle>
            <CardDescription>Manage phone numbers that receive priority treatment</CardDescription>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add VIP Number
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add VIP Phone Number</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Contact Name</Label>
                  <Input
                    id="name"
                    placeholder="John Smith"
                    value={newVipNumber.name || ''}
                    onChange={(e) => setNewVipNumber({...newVipNumber, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 (306) 209-2891"
                    value={newVipNumber.phoneNumber || ''}
                    onChange={(e) => setNewVipNumber({...newVipNumber, phoneNumber: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter in international format: +1XXXXXXXXXX
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Important customer, always route to senior support"
                    value={newVipNumber.notes || ''}
                    onChange={(e) => setNewVipNumber({...newVipNumber, notes: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddVipNumber}>Add VIP Number</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : vipNumbers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
            <Star className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No VIP Numbers</h3>
            <p className="text-sm text-muted-foreground mt-1">Add VIP phone numbers to provide priority service.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vipNumbers.map((vipNumber) => (
              <div key={vipNumber.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-full">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{vipNumber.name}</h4>
                      <Badge variant="outline" className="ml-2 bg-amber-50">VIP</Badge>
                    </div>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-sm">{vipNumber.phoneNumber}</span>
                    </div>
                    {vipNumber.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{vipNumber.notes}</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteVipNumber(vipNumber.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}