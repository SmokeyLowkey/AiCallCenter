"use client"

import { useState } from "react"
import {
  ArrowUp,
  Book,
  BookOpen,
  Check,
  Database,
  File,
  FileText,
  Filter,
  FolderOpen,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  Upload,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState("documents")
  const [searchQuery, setSearchQuery] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const handleUpload = () => {
    setUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          setShowUploadDialog(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Manage documents for AI-powered call assistance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
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
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="files">Select Files</Label>
                  <div className="flex items-center gap-2">
                    <Input id="files" type="file" multiple />
                    <Button variant="outline" size="sm">
                      Browse
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Supported formats: PDF, DOCX, TXT, CSV, XLSX (max 50MB per file)
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product Documentation</SelectItem>
                      <SelectItem value="support">Support Guidelines</SelectItem>
                      <SelectItem value="policies">Policies & Procedures</SelectItem>
                      <SelectItem value="training">Training Materials</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="process" />
                  <Label htmlFor="process">Process documents for AI immediately</Label>
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
                <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
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
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents by title, content, or category..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="documents" className="space-y-4" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">Upload History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Product Manual v2.5",
                type: "PDF",
                size: "4.2 MB",
                category: "Product Documentation",
                uploadDate: "2023-05-15",
                status: "processed",
              },
              {
                title: "Customer Support Guidelines",
                type: "DOCX",
                size: "1.8 MB",
                category: "Support Guidelines",
                uploadDate: "2023-06-22",
                status: "processed",
              },
              {
                title: "Troubleshooting Guide",
                type: "PDF",
                size: "3.5 MB",
                category: "Support Guidelines",
                uploadDate: "2023-07-10",
                status: "processed",
              },
              {
                title: "Pricing Structure 2023",
                type: "XLSX",
                size: "0.9 MB",
                category: "Policies & Procedures",
                uploadDate: "2023-08-05",
                status: "processed",
              },
              {
                title: "Agent Training Manual",
                type: "PDF",
                size: "5.7 MB",
                category: "Training Materials",
                uploadDate: "2023-09-12",
                status: "processing",
              },
              {
                title: "Technical Specifications",
                type: "PDF",
                size: "2.3 MB",
                category: "Product Documentation",
                uploadDate: "2023-10-01",
                status: "failed",
              },
            ].map((document, i) => (
              <DocumentCard key={i} document={document} />
            ))}
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
                8
              </Button>
            </div>
            <Button variant="outline" className="mx-2">
              Next
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Product Documentation",
                documentCount: 15,
                lastUpdated: "2023-10-01",
                icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
              },
              {
                name: "Support Guidelines",
                documentCount: 8,
                lastUpdated: "2023-09-15",
                icon: <FileText className="h-8 w-8 text-indigo-600" />,
              },
              {
                name: "Policies & Procedures",
                documentCount: 12,
                lastUpdated: "2023-08-22",
                icon: <Book className="h-8 w-8 text-indigo-600" />,
              },
              {
                name: "Training Materials",
                documentCount: 10,
                lastUpdated: "2023-09-12",
                icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
              },
              {
                name: "Technical Documentation",
                documentCount: 7,
                lastUpdated: "2023-07-30",
                icon: <FileText className="h-8 w-8 text-indigo-600" />,
              },
              {
                name: "Other",
                documentCount: 3,
                lastUpdated: "2023-06-15",
                icon: <FolderOpen className="h-8 w-8 text-indigo-600" />,
              },
            ].map((category, i) => (
              <CategoryCard key={i} category={category} />
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
              <CardDescription>Create a new category for organizing your knowledge base documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input id="category-name" placeholder="Enter category name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category-description">Description (Optional)</Label>
                  <Input id="category-description" placeholder="Enter category description" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base Settings</CardTitle>
              <CardDescription>Configure how your knowledge base is processed and used by the AI</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Processing Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="auto-process" className="flex flex-col space-y-1">
                      <span>Automatic Processing</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Automatically process documents when uploaded
                      </span>
                    </Label>
                    <Switch id="auto-process" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="chunk-size" className="flex flex-col space-y-1">
                      <span>Chunk Size</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Size of text chunks for processing (smaller chunks are more precise but slower)
                      </span>
                    </Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select chunk size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (256 tokens)</SelectItem>
                        <SelectItem value="medium">Medium (512 tokens)</SelectItem>
                        <SelectItem value="large">Large (1024 tokens)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="overlap" className="flex flex-col space-y-1">
                      <span>Chunk Overlap</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Amount of overlap between chunks to maintain context
                      </span>
                    </Label>
                    <Select defaultValue="medium">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select overlap" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (10%)</SelectItem>
                        <SelectItem value="medium">Medium (20%)</SelectItem>
                        <SelectItem value="large">Large (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Retrieval Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="retrieval-method" className="flex flex-col space-y-1">
                      <span>Retrieval Method</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Method used to retrieve relevant information during calls
                      </span>
                    </Label>
                    <Select defaultValue="semantic">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semantic">Semantic Search</SelectItem>
                        <SelectItem value="hybrid">Hybrid Search</SelectItem>
                        <SelectItem value="keyword">Keyword Search</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="top-k" className="flex flex-col space-y-1">
                      <span>Top K Results</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Number of relevant chunks to retrieve for each query
                      </span>
                    </Label>
                    <Select defaultValue="5">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select number" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Results</SelectItem>
                        <SelectItem value="5">5 Results</SelectItem>
                        <SelectItem value="10">10 Results</SelectItem>
                        <SelectItem value="15">15 Results</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="similarity-threshold" className="flex flex-col space-y-1">
                      <span>Similarity Threshold</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Minimum similarity score for retrieved chunks
                      </span>
                    </Label>
                    <Select defaultValue="0.7">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.6">0.6 (More results)</SelectItem>
                        <SelectItem value="0.7">0.7 (Balanced)</SelectItem>
                        <SelectItem value="0.8">0.8 (More precise)</SelectItem>
                        <SelectItem value="0.9">0.9 (Very precise)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Storage Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="storage-provider" className="flex flex-col space-y-1">
                      <span>Storage Provider</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Where your knowledge base documents are stored
                      </span>
                    </Label>
                    <Select defaultValue="vercel">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vercel">Vercel Blob</SelectItem>
                        <SelectItem value="s3">Amazon S3</SelectItem>
                        <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="retention" className="flex flex-col space-y-1">
                      <span>Document Retention</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        How long to keep documents in storage
                      </span>
                    </Label>
                    <Select defaultValue="indefinite">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select retention" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 Days</SelectItem>
                        <SelectItem value="90">90 Days</SelectItem>
                        <SelectItem value="365">1 Year</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="compression" className="flex flex-col space-y-1">
                      <span>Document Compression</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        Compress documents to save storage space
                      </span>
                    </Label>
                    <Switch id="compression" defaultChecked />
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

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload History</CardTitle>
              <CardDescription>Recent document uploads and their processing status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Document</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Category</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Uploaded By</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Date</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Status</th>
                        <th className="h-10 px-4 text-left font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          name: "Agent Training Manual",
                          category: "Training Materials",
                          uploadedBy: "Emma Rodriguez",
                          date: "Today, 10:30 AM",
                          status: "processing",
                        },
                        {
                          name: "Technical Specifications",
                          category: "Product Documentation",
                          uploadedBy: "Michael Chen",
                          date: "Today, 9:15 AM",
                          status: "failed",
                        },
                        {
                          name: "Customer Feedback Analysis Q3",
                          category: "Support Guidelines",
                          uploadedBy: "Sarah Johnson",
                          date: "Yesterday, 4:20 PM",
                          status: "processed",
                        },
                        {
                          name: "Product Roadmap 2024",
                          category: "Product Documentation",
                          uploadedBy: "David Williams",
                          date: "Yesterday, 2:45 PM",
                          status: "processed",
                        },
                        {
                          name: "Call Handling Procedures",
                          category: "Training Materials",
                          uploadedBy: "Emma Rodriguez",
                          date: "Yesterday, 11:30 AM",
                          status: "processed",
                        },
                      ].map((upload, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-4 align-middle font-medium">{upload.name}</td>
                          <td className="p-4 align-middle">{upload.category}</td>
                          <td className="p-4 align-middle">{upload.uploadedBy}</td>
                          <td className="p-4 align-middle">{upload.date}</td>
                          <td className="p-4 align-middle">
                            <Badge
                              className={
                                upload.status === "processed"
                                  ? "bg-green-100 text-green-800"
                                  : upload.status === "processing"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {upload.status === "processed" ? (
                                <Check className="mr-1 h-3 w-3" />
                              ) : upload.status === "processing" ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <X className="mr-1 h-3 w-3" />
                              )}
                              {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                              {upload.status === "failed" && (
                                <Button variant="ghost" size="sm">
                                  Retry
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="bg-indigo-50 border-indigo-200 text-indigo-800">
        <Info className="h-4 w-4" />
        <AlertTitle>Knowledge Base Usage</AlertTitle>
        <AlertDescription>
          Your knowledge base is currently using 45.8 MB of storage (9.2% of your 500 MB limit). You have processed 55
          documents this month.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function DocumentCard({ document }) {
  const getFileIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-10 w-10 text-red-600" />
      case "DOCX":
        return <FileText className="h-10 w-10 text-blue-600" />
      case "XLSX":
        return <FileText className="h-10 w-10 text-green-600" />
      default:
        return <File className="h-10 w-10 text-slate-600" />
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "processed":
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            Processed
          </Badge>
        )
      case "processing":
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800">
            <X className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        )
      default:
        return <Badge>Unknown</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="rounded-full bg-slate-100 p-2">{getFileIcon(document.type)}</div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-100">
              {document.type}
            </Badge>
            {getStatusBadge(document.status)}
          </div>
        </div>
        <CardTitle className="text-lg mt-4 line-clamp-1">{document.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Database className="h-3 w-3" />
          {document.category}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Size: {document.size}</span>
            <span>Uploaded: {document.uploadDate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1">
            View
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <ArrowUp className="mr-2 h-4 w-4" />
                Update
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reprocess
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )
}

function CategoryCard({ category }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="rounded-full bg-indigo-50 p-2">{category.icon}</div>
          <Badge variant="outline" className="bg-slate-100">
            {category.documentCount} Documents
          </Badge>
        </div>
        <CardTitle className="text-lg mt-4">{category.name}</CardTitle>
        <CardDescription>Last updated: {category.lastUpdated}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            <span>{category.documentCount} documents in this category</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button variant="outline" className="flex-1">
            View Documents
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reprocess All
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardFooter>
    </Card>
  )
}

function MoreVertical(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  )
}
