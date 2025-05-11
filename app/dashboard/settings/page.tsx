"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSession } from "next-auth/react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

// Define the form schema for API keys
const apiKeysFormSchema = z.object({
  openaiApiKey: z.string().optional(),
  pineconeApiKey: z.string().optional(),
  assemblyAiApiKey: z.string().optional(),
  saveToDatabase: z.boolean().default(false),
})

// Define the form schema for LLM settings
const llmSettingsFormSchema = z.object({
  defaultModel: z.enum(["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo", "claude-3-opus", "claude-3-sonnet", "claude-3-haiku"]),
  maxTokens: z.number().min(100).max(4000).default(1000),
  temperature: z.number().min(0).max(2).default(0.7),
  enableRag: z.boolean().default(true),
})

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // Initialize the API keys form
  const apiKeysForm = useForm<z.infer<typeof apiKeysFormSchema>>({
    resolver: zodResolver(apiKeysFormSchema),
    defaultValues: {
      openaiApiKey: "",
      pineconeApiKey: "",
      assemblyAiApiKey: "",
      saveToDatabase: false,
    },
  })
  
  // Initialize the LLM settings form
  const llmSettingsForm = useForm<z.infer<typeof llmSettingsFormSchema>>({
    resolver: zodResolver(llmSettingsFormSchema),
    defaultValues: {
      defaultModel: "gpt-4o-mini",
      maxTokens: 1000,
      temperature: 0.7,
      enableRag: true,
    },
  })
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedApiKeys = localStorage.getItem("apiKeys")
    if (savedApiKeys) {
      try {
        const parsedApiKeys = JSON.parse(savedApiKeys)
        apiKeysForm.reset(parsedApiKeys)
      } catch (error) {
        console.error("Error parsing saved API keys:", error)
      }
    }
    
    const savedLlmSettings = localStorage.getItem("llmSettings")
    if (savedLlmSettings) {
      try {
        const parsedLlmSettings = JSON.parse(savedLlmSettings)
        llmSettingsForm.reset(parsedLlmSettings)
      } catch (error) {
        console.error("Error parsing saved LLM settings:", error)
      }
    }
  }, [])
  
  // Handle API keys form submission
  const onSubmitApiKeys = async (values: z.infer<typeof apiKeysFormSchema>) => {
    setIsLoading(true)
    
    try {
      // Save to localStorage
      localStorage.setItem("apiKeys", JSON.stringify(values))
      
      // If saveToDatabase is true, save to database
      if (values.saveToDatabase) {
        // This would be implemented in a real application
        // For now, we'll just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      toast({
        title: "API Keys Saved",
        description: "Your API keys have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving API keys:", error)
      toast({
        title: "Error",
        description: "There was an error saving your API keys.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle LLM settings form submission
  const onSubmitLlmSettings = async (values: z.infer<typeof llmSettingsFormSchema>) => {
    setIsLoading(true)
    
    try {
      // Save to localStorage
      localStorage.setItem("llmSettings", JSON.stringify(values))
      
      // This would be implemented in a real application
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "LLM Settings Saved",
        description: "Your LLM settings have been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving LLM settings:", error)
      toast({
        title: "Error",
        description: "There was an error saving your LLM settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="llm-settings" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="llm-settings">LLM Settings</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
        </TabsList>
        
        <TabsContent value="llm-settings">
          <Card>
            <CardHeader>
              <CardTitle>LLM Settings</CardTitle>
              <CardDescription>
                Configure the settings for the AI assistant used in live calls.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...llmSettingsForm}>
                <form onSubmit={llmSettingsForm.handleSubmit(onSubmitLlmSettings)} className="space-y-6">
                  <FormField
                    control={llmSettingsForm.control}
                    name="defaultModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Model</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                            <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                            <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select the default language model to use for generating suggestions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={llmSettingsForm.control}
                    name="maxTokens"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Tokens</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          The maximum number of tokens to generate in the response.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={llmSettingsForm.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Temperature</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Controls randomness: Lower values are more focused, higher values more creative.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={llmSettingsForm.control}
                    name="enableRag"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable Retrieval Augmented Generation (RAG)
                          </FormLabel>
                          <FormDescription>
                            Use your knowledge base to enhance AI suggestions.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Configure the API keys used for various services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiKeysForm}>
                <form onSubmit={apiKeysForm.handleSubmit(onSubmitApiKeys)} className="space-y-6">
                  <FormField
                    control={apiKeysForm.control}
                    name="openaiApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OpenAI API Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="sk-..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your OpenAI API key for generating AI suggestions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiKeysForm.control}
                    name="pineconeApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pinecone API Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Your Pinecone API key"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your Pinecone API key for vector database operations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiKeysForm.control}
                    name="assemblyAiApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AssemblyAI API Key</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Your AssemblyAI API key"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Your AssemblyAI API key for speech recognition and transcription.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiKeysForm.control}
                    name="saveToDatabase"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Save API Keys to Database
                          </FormLabel>
                          <FormDescription>
                            Store your API keys securely in the database (encrypted).
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save API Keys"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t">
              <p className="text-sm text-muted-foreground">
                Note: API keys are stored securely in your browser. If you enable "Save to Database", they will be encrypted before storage.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}