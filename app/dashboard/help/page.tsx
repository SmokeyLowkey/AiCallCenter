"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { HelpCircle, Mail, MessageSquare, Phone } from "lucide-react"

export default function HelpPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmitSupport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast({
      title: "Support request submitted",
      description: "We'll get back to you as soon as possible.",
    })
    
    // Reset form
    const form = e.target as HTMLFormElement
    form.reset()
    
    setIsSubmitting(false)
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Help & Support</h1>
      
      <Tabs defaultValue="faq" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="contact">Contact Support</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Find answers to common questions about the AI Call Center platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">How do I set up my first integration?</h3>
                <p className="text-muted-foreground">
                  Go to the Integrations page and select the service you want to connect. Follow the step-by-step instructions to authorize and configure the integration.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">How does the AI assistant work?</h3>
                <p className="text-muted-foreground">
                  The AI assistant analyzes call transcripts in real-time and provides suggestions based on your knowledge base. It uses a combination of natural language processing and retrieval augmented generation to provide contextually relevant information.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Can I customize the AI suggestions?</h3>
                <p className="text-muted-foreground">
                  Yes, you can customize the AI suggestions by updating your knowledge base and adjusting the LLM settings in the Settings page. You can also provide feedback on suggestions to improve future recommendations.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">How do I add team members?</h3>
                <p className="text-muted-foreground">
                  Navigate to the Team page and click on "Add Team Member". Enter their email address and select their role. They will receive an invitation to join your team.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">How are call recordings stored?</h3>
                <p className="text-muted-foreground">
                  Call recordings are securely stored in your configured S3 bucket. They are encrypted at rest and only accessible to authorized team members. You can configure retention policies in the Settings page.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Need help? Reach out to our support team and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitSupport} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input id="email" type="email" placeholder="Your email" required />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input id="subject" placeholder="What's your issue about?" required />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your issue in detail" 
                    rows={5}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Support Request"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4 border-t p-6">
              <h3 className="text-lg font-medium">Alternative Contact Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <Mail className="h-8 w-8 text-primary" />
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">support@aicallcenter.com</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <Phone className="h-8 w-8 text-primary" />
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-sm text-muted-foreground">+1 (800) 123-4567</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    <h4 className="font-medium">Live Chat</h4>
                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                  </CardContent>
                </Card>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentation">
          <Card>
            <CardHeader>
              <CardTitle>Documentation</CardTitle>
              <CardDescription>
                Explore our comprehensive documentation to learn more about the AI Call Center platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="hover:bg-slate-50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-medium">Getting Started</h3>
                      <p className="text-sm text-muted-foreground">
                        Learn the basics of setting up and using the AI Call Center platform.
                      </p>
                      <Button variant="link" className="px-0">Read Guide</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:bg-slate-50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-medium">Integrations</h3>
                      <p className="text-sm text-muted-foreground">
                        Detailed guides for connecting with Twilio, Salesforce, and other services.
                      </p>
                      <Button variant="link" className="px-0">Read Guide</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:bg-slate-50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-medium">AI Assistant</h3>
                      <p className="text-sm text-muted-foreground">
                        How to customize and optimize the AI assistant for your team.
                      </p>
                      <Button variant="link" className="px-0">Read Guide</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:bg-slate-50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-medium">Knowledge Base</h3>
                      <p className="text-sm text-muted-foreground">
                        Best practices for building and maintaining your knowledge base.
                      </p>
                      <Button variant="link" className="px-0">Read Guide</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:bg-slate-50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-medium">Analytics</h3>
                      <p className="text-sm text-muted-foreground">
                        Understanding call metrics, insights, and performance reports.
                      </p>
                      <Button variant="link" className="px-0">Read Guide</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="hover:bg-slate-50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-medium">API Reference</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete API documentation for developers.
                      </p>
                      <Button variant="link" className="px-0">Read Guide</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HelpCircle className="h-4 w-4" />
                <span>Can't find what you're looking for? <Button variant="link" className="h-auto p-0">Contact our support team</Button></span>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}