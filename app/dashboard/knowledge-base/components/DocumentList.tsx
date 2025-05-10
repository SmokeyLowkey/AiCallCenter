"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Download,
  File,
  FileText,
  FileSpreadsheet,
  FileArchive,
  MoreHorizontal,
  Trash,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  RefreshCw,
  Zap
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Category {
  id: string
  name: string
}

interface Document {
  id: string
  title: string
  type: string
  size: number
  path: string
  status: string
  processingError?: string
  category?: {
    id: string
    name: string
  }
  uploadedBy: {
    id: string
    name: string
  }
  uploadDate: string
  downloadUrl?: string
}

interface DocumentListProps {
  categories: Category[]
  initialDocuments?: Document[]
}

export function DocumentList({ categories, initialDocuments = [] }: DocumentListProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  const [processingDocumentId, setProcessingDocumentId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  })

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams()
      
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      
      if (categoryFilter && categoryFilter !== 'all') {
        params.append('categoryId', categoryFilter)
      }
      
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      
      // Fetch documents
      const response = await fetch(`/api/documents?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents')
      }
      
      const data = await response.json()
      setDocuments(data.documents)
      setPagination(data.pagination)
    } catch (err: any) {
      console.error('Error fetching documents:', err)
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialDocuments.length > 0) {
      setDocuments(initialDocuments)
      setLoading(false)
    } else {
      fetchDocuments()
    }
  }, [pagination.page, searchQuery, categoryFilter, statusFilter])

  const handleRefresh = () => {
    fetchDocuments()
  }

  const processDocument = async (documentId: string) => {
    try {
      setProcessingDocumentId(documentId);
      
      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ documentId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process document');
      }
      
      toast({
        title: "Processing started",
        description: "The document is being processed. This may take a few minutes.",
      });
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchDocuments();
      }, 2000);
      
    } catch (err: any) {
      toast({
        title: "Processing failed",
        description: err.message || "An error occurred while processing the document",
        variant: "destructive",
      });
    } finally {
      setProcessingDocumentId(null);
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return
    
    try {
      const response = await fetch(`/api/documents/${documentToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete document')
      }
      
      // Remove document from state
      setDocuments(documents.filter(doc => doc.id !== documentToDelete.id))
      
      toast({
        title: "Document deleted",
        description: "The document has been deleted successfully",
      })
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message || "An error occurred while deleting the document",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    }
  }

  const confirmDelete = (document: Document) => {
    setDocumentToDelete(document)
    setDeleteDialogOpen(true)
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return <File className="h-6 w-6 text-red-500" />
    } else if (type.includes('word') || type.includes('doc')) {
      return <FileText className="h-6 w-6 text-blue-500" />
    } else if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />
    } else {
      return <FileArchive className="h-6 w-6 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    } else {
      return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return <Badge className="bg-green-100 text-green-800">Processed</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <div className="flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          <p>{error}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={handleRefresh}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="PROCESSED">Processed</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading && documents.length === 0 ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No documents found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Upload a document to get started or try a different search.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <Card key={document.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    {getFileIcon(document.type)}
                    <div>
                      <CardTitle className="text-base">{document.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(document.size)} • {document.path.split('.').pop()?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {processingDocumentId === document.id ? (
                        <DropdownMenuItem disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </DropdownMenuItem>
                      ) : document.downloadUrl && (
                        <DropdownMenuItem asChild>
                          <a href={document.downloadUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </a>
                        </DropdownMenuItem>
                      )}
                      {document.status !== 'PROCESSED' && document.status !== 'PROCESSING' && (
                        <DropdownMenuItem onClick={() => processDocument(document.id)}>
                          <Zap className="mr-2 h-4 w-4" />
                          Process Document
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => confirmDelete(document)} className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {getStatusBadge(document.status)}
                  {document.category && (
                    <Badge variant="outline">{document.category.name}</Badge>
                  )}
                </div>
                {document.status === 'FAILED' && document.processingError && (
                  <div className="text-xs text-red-600 mt-1">
                    <AlertCircle className="h-3 w-3 inline-block mr-1" />
                    {document.processingError}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 text-xs text-muted-foreground">
                Uploaded by {document.uploadedBy.name} on {formatDate(document.uploadDate)}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center mt-4">
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <div className="flex items-center mx-2">
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the document "{documentToDelete?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}