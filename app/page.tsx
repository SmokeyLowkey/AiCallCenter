import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  CheckCircle,
  Headphones,
  Database,
  Phone,
  BarChart,
  Zap,
  MessageSquare,
  FileText,
  PieChart,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Phone className="h-6 w-6" />
            <span>AI Call Clarity</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Features
            </Link>
            <Link href="#integrations" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Integrations
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-indigo-600 transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:flex">
              Login
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">Request Demo</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-slate-50 w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                  <span className="text-indigo-600">AI-Powered</span> Intelligence for Every Call
                </h1>
                <p className="text-xl text-slate-600 mb-8">
                  Transform your call quality with real-time AI assistance that brings relevant information to your
                  fingertips during customer service, sales, and support calls.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                    Schedule Demo
                  </Button>
                  <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    Learn More
                  </Button>
                </div>

                <div className="flex flex-wrap gap-8 mt-12">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium">Live Call Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium">CRM Integration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium">Real-time Insights</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    alt="Call center agent using AI Call Clarity"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-indigo-600">Powerful Features</span> for Superior Call Experiences
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Our comprehensive suite of AI-powered tools helps you deliver exceptional customer experiences while
                improving operational efficiency.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Live Call Transcription</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Get accurate transcriptions in real-time on your calls, enabling better focus on conversations and
                    improved productivity.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <Database className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">RAG-Powered Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Our AI leverages Retrieval Augmented Generation to connect conversation context with your knowledge
                    base, delivering accurate information during calls.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <Layers className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">CRM Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Seamlessly connect with your existing CRM systems to automatically update customer records and
                    access key data during calls.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <Headphones className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Continuous Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Keep your calls secure and compliant with automatic recording and storage following industry
                    standards.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Call Routing Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Works with advanced call routing systems like Luware Nimbus to optimize your entire call flow.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Actionable Summaries</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Get AI-generated call summaries with key points, action items and follow-up recommendations.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 bg-slate-50 w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-indigo-600">Transforming</span> Call Experiences Across Industries
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                See how different teams leverage AI Call Clarity to enhance their customer communications.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <Headphones className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Customer Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-6">
                    Empower your support team's capabilities by providing them with instant access to relevant
                    information during calls.
                  </p>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-slate-900">Key Benefits:</h4>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Reduce average call time by 30%</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Improve first-call resolution rates</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Enhance customer satisfaction</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <BarChart className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Sales Calls</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-6">
                    Empower your sales team with real-time product information, competitive insights, and personalized
                    recommendations.
                  </p>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-slate-900">Key Benefits:</h4>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Increase conversion rates by 27%</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Personalized pitches with customer history</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Reduce onboarding time for new sales reps</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                    <Database className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-xl">Technical Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-6">
                    Give your technical support access to documentation, troubleshooting guides, and previous case
                    resolutions.
                  </p>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-slate-900">Key Benefits:</h4>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Provide accurate technical solutions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Reduce escalations by 40%</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Improve customer satisfaction scores</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section id="integrations" className="py-20 bg-white w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-indigo-600">Seamless Integrations</span> With Your Tech Stack
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Connect AI Call Clarity with your favorite CRMs, call routing systems, and productivity tools without
                any hassle.
              </p>
            </div>

            <div className="flex justify-center mb-12">
              <Badge variant="outline" className="px-4 py-2 text-sm border-indigo-200 bg-indigo-50 text-indigo-700">
                30+ Integration Available
              </Badge>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-8 max-w-4xl mx-auto">
              {["Salesforce", "Microsoft Dynamics", "HubSpot", "Zendesk", "Freshdesk", "Zoho"].map((integration) => (
                <div key={integration} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-xl font-bold text-slate-500">{integration.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{integration}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-600 mb-4">Don't see your tool?</p>
              <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                Request an integration <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-slate-50 w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Trusted by <span className="text-indigo-600">Industry Leaders</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                See how AI Call Clarity is helping businesses transform their customer communication.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-0 shadow-md">
                <CardContent className="pt-8">
                  <div className="mb-6 text-4xl text-indigo-300">"</div>
                  <p className="text-slate-600 mb-8">
                    AI Call Clarity has transformed our customer support workflow. Our agents now have instant access to
                    customer history and product information during calls.
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 mr-3"></div>
                    <div>
                      <p className="font-semibold">Sarah Johnson</p>
                      <p className="text-sm text-slate-500">Customer Success Director, TechSolutions Inc.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-8">
                  <div className="mb-6 text-4xl text-indigo-300">"</div>
                  <p className="text-slate-600 mb-8">
                    The RAG technology is incredibly accurate at finding relevant information during calls. It's like
                    having an expert colleague always available to assist.
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 mr-3"></div>
                    <div>
                      <p className="font-semibold">Michael Chen</p>
                      <p className="text-sm text-slate-500">Sales Operations Manager, Global Services Ltd.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardContent className="pt-8">
                  <div className="mb-6 text-4xl text-indigo-300">"</div>
                  <p className="text-slate-600 mb-8">
                    Integration with our existing systems was seamless. Our IT team was impressed by how quickly we
                    could deploy and see results.
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-200 mr-3"></div>
                    <div>
                      <p className="font-semibold">Rebecca Martinez</p>
                      <p className="text-sm text-slate-500">CTO, EnterpriseWorks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white w-full">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-indigo-600">Flexible Pricing</span> for Teams of All Sizes
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Choose the plan that fits your call volume and feature requirements. All plans include our core AI
                functionality.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border border-slate-200 relative">
                <CardHeader>
                  <CardTitle className="text-xl">Professional</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$399</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    For growing teams handling up to 1,000 calls per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-4 text-sm">What's included:</h4>
                  <ul className="space-y-3">
                    {[
                      "Live call transcription",
                      "Basic RAG capabilities",
                      "Standard CRM integration",
                      "Technical support",
                      "Call recording & storage (30 days)",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Get Started</Button>
                </CardFooter>
              </Card>

              <Card className="border-0 shadow-lg relative">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-4 py-1 text-xs font-medium rounded-bl-lg">
                  MOST POPULAR
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">Business</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$999</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <CardDescription className="mt-2">
                    For teams handling up to 5,000 calls with advanced needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-4 text-sm">What's included:</h4>
                  <ul className="space-y-3">
                    {[
                      "Everything in Professional",
                      "Advanced RAG with custom knowledge base",
                      "Advanced CRM integration",
                      "Priority support",
                      "Call recording & storage (90 days)",
                      "Advanced analytics dashboard",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
                </CardFooter>
              </Card>

              <Card className="border border-slate-200 relative">
                <CardHeader>
                  <CardTitle className="text-xl">Enterprise</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                  <CardDescription className="mt-2">Custom solutions for high-volume enterprise needs</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-4 text-sm">Everything in Business, plus:</h4>
                  <ul className="space-y-3">
                    {[
                      "Dedicated SLA",
                      "Custom RAG infrastructure",
                      "Custom API integration support",
                      "Dedicated account manager",
                      "Service Level Agreement (SLA)",
                      "Custom training & onboarding",
                    ].map((feature) => (
                      <li key={feature} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50">
                    Contact Sales
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold mb-4">Need a custom solution?</h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Contact our sales team to design a plan specifically for your needs.
              </p>
              <Button className="bg-indigo-600 hover:bg-indigo-700">Contact Sales</Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-indigo-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Call Experience?</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join leading companies using AI Call Clarity to deliver exceptional customer experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-slate-100">
                Request a Demo
              </Button>
              <Button size="lg" variant="outline" className="border-white text-black hover:text-white hover:bg-indigo-500">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-indigo-400 transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 font-bold text-xl text-indigo-400 mb-4 md:mb-0">
              <Phone className="h-6 w-6" />
              <span>AI Call Clarity</span>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-slate-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-slate-400 hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
            </div>
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} AI Call Clarity. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
