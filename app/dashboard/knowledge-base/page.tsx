"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Filter,
  RefreshCw,
  Search,
  Settings,
  Plus,
  Download
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DocumentUpload } from "./components/DocumentUpload"
import { CategoryManager } from "./components/CategoryManager"
import { toast } from "@/components/ui/use-toast"

interface Category {
  id: string
  name: string
  description?: string
}

export default function KnowledgeBasePage() {
  const [activeTab, setActiveTab] = useState("documents")
  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [documentsLoading, setDocumentsLoading] = useState(true)

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        console.log('Fetching categories...');
        const response = await fetch('/api/knowledge-base/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        console.log('Categories loaded:', data);
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch documents
  useEffect(() => {
    async function fetchDocuments() {
      try {
        setDocumentsLoading(true);
        console.log('Fetching documents...');
        
        // Build query parameters
        const params = new URLSearchParams();
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        
        const response = await fetch(`/api/documents?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        
        const data = await response.json();
        console.log('Documents loaded:', data);
        setDocuments(data.documents);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast({
          title: "Error",
          description: "Failed to load documents. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setDocumentsLoading(false);
      }
    }

    fetchDocuments();
  }, [searchQuery]);

  // Function to refresh documents
  const refreshDocuments = () => {
    setDocumentsLoading(true);
    fetch('/api/documents')
      .then(res => res.json())
      .then(data => {
        setDocuments(data.documents);
        setDocumentsLoading(false);
      })
      .catch(err => {
        console.error('Error refreshing documents:', err);
        toast({
          title: "Error",
          description: "Failed to refresh documents.",
          variant: "destructive",
        });
        setDocumentsLoading(false);
      });
  };

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground">Upload and manage documents for your AI assistant</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <DocumentUpload categories={categories} />
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
        <Button variant="outline" size="icon" onClick={refreshDocuments}>
          <RefreshCw className={`h-4 w-4 ${documentsLoading ? 'animate-spin' : ''}`} />
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
          {documentsLoading ? (
            <div className="rounded-lg border p-4 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mx-auto">
              <div className="rounded-lg border p-4 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 font-medium">No documents found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a document to get started
                </p>
                <DocumentUpload categories={categories} onSuccess={refreshDocuments} />
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc: any) => (
                <div key={doc.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      {doc.type.includes('pdf') ? (
                        <FileText className="h-6 w-6 text-red-500" />
                      ) : doc.type.includes('sheet') || doc.type.includes('excel') || doc.type.includes('csv') ? (
                        <FileText className="h-6 w-6 text-green-500" />
                      ) : (
                        <FileText className="h-6 w-6 text-blue-500" />
                      )}
                      <div>
                        <h3 className="font-medium">{doc.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {doc.size < 1024 * 1024
                            ? `${(doc.size / 1024).toFixed(1)} KB`
                            : `${(doc.size / 1024 / 1024).toFixed(1)} MB`}
                          {' • '}
                          {doc.path.split('.').pop()?.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {doc.status === 'PROCESSED' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Processed</span>
                      ) : doc.status === 'PROCESSING' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Processing</span>
                      ) : doc.status === 'FAILED' ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Failed</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{doc.status}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    {doc.downloadUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {loading ? (
            <div className="rounded-lg border p-4 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading categories...</p>
            </div>
          ) : (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Manage Categories</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Create and manage categories to organize your knowledge base documents.
                Categories help you structure your information and make it easier to find.
              </p>
              
              <CategoryManager
                categories={categories}
                onSuccess={() => {
                  // Refresh categories after successful operation
                  fetch('/api/knowledge-base/categories')
                    .then(res => res.json())
                    .then(data => setCategories(data))
                    .catch(err => {
                      console.error('Error refreshing categories:', err)
                      toast({
                        title: "Error",
                        description: "Failed to refresh categories.",
                        variant: "destructive",
                      })
                    })
                }}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">Knowledge Base Settings</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Configure how your knowledge base is processed and used by the AI
            </p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="rounded-lg border p-4 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 font-medium">No upload history</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your document upload history will appear here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
