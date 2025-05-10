"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  Upload,
  File,
  X,
  Loader2
} from "lucide-react"
import { useTeam } from "@/contexts/TeamContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"

interface Category {
  id: string
  name: string
}

interface DocumentUploadProps {
  categories: Category[]
  onSuccess?: () => void
}

export function DocumentUpload({ categories, onSuccess }: DocumentUploadProps) {
  const router = useRouter()
  const { selectedTeam } = useTeam()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("uncategorized")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processImmediately, setProcessImmediately] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      // Auto-fill title with filename (without extension)
      if (!title) {
        const fileName = selectedFile.name
        const fileNameWithoutExt = fileName.split('.').slice(0, -1).join('.')
        setTitle(fileNameWithoutExt)
      }
    }
  }

  const clearForm = () => {
    setTitle("")
    setCategoryId("uncategorized")
    setFile(null)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("📄 Document upload initiated")
    
    if (!file) {
      console.log("❌ Upload failed: No file selected")
      toast({
        title: "Missing file",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }
    
    console.log("📋 Upload details", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      title: title || file.name,
      categoryId: categoryId || "uncategorized",
      processImmediately,
      teamId: selectedTeam?.id,
      companyId: selectedTeam?.companyId
    })
    
    setUploading(true)
    console.log("🔄 Upload started, showing progress indicator")
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 200)
    
    try {
      console.log("📦 Preparing form data for upload")
      const formData = new FormData()
      formData.append("title", title || file.name)
      if (categoryId && categoryId !== "uncategorized") {
        formData.append("categoryId", categoryId)
      }
      formData.append("file", file)
      formData.append("processImmediately", processImmediately.toString())
      
      // Add team information
      if (selectedTeam) {
        console.log("👥 Adding team information", {
          teamId: selectedTeam.id,
          companyId: selectedTeam.companyId
        })
        formData.append("teamId", selectedTeam.id)
        formData.append("companyId", selectedTeam.companyId)
      }
      
      console.log("⬆️ Sending upload request to /api/documents/upload")
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      })
      
      if (!response.ok) {
        const error = await response.json()
        console.error("❌ Upload request failed", error)
        throw new Error(error.error || "Failed to upload document")
      }
      
      const result = await response.json()
      console.log("✅ Upload successful", result)
      
      // Set progress to 100% when complete
      setUploadProgress(100)
      console.log("📊 Upload progress: 100%")
      
      toast({
        title: "Document uploaded",
        description: "Your document has been uploaded successfully",
      })
      console.log("🔔 Success notification displayed")
      
      // Clear form and close dialog after a short delay
      console.log("⏱️ Waiting to clear form and close dialog")
      setTimeout(() => {
        clearForm()
        setOpen(false)
        console.log("🧹 Form cleared and dialog closed")
        
        // Refresh data
        console.log("🔄 Refreshing page data")
        router.refresh()
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          console.log("📣 Calling onSuccess callback")
          onSuccess()
        }
      }, 1000)
    } catch (error: any) {
      console.error("❌ Upload error", error)
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred while uploading the document",
        variant: "destructive",
      })
      console.log("🔔 Error notification displayed")
    } finally {
      clearInterval(progressInterval)
      setUploading(false)
      console.log("🏁 Upload process completed")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Documents
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload documents to your knowledge base to improve AI assistance during calls.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="files">Select Files</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="files"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls"
                  disabled={uploading}
                />
                <Input
                  readOnly
                  value={file ? file.name : "No file selected"}
                  className="flex-1"
                  disabled={uploading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Browse
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOCX, TXT, CSV, XLSX (max 50MB per file)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                disabled={uploading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} disabled={uploading}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="process" 
                checked={processImmediately}
                onCheckedChange={setProcessImmediately}
                disabled={uploading}
              />
              <Label htmlFor="process">Process document for AI immediately</Label>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uploading...</span>
                  <span className="text-sm font-medium">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}