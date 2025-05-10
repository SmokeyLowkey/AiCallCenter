import { PrismaClient, DocumentStatus, CallStatus } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Seed Departments
  console.log('Seeding departments...');
  const departments = [
    { name: 'Customer Support', description: 'Handles general customer inquiries and issues' },
    { name: 'Technical Support', description: 'Provides technical assistance and troubleshooting' },
    { name: 'Sales', description: 'Manages sales inquiries and processes' },
    { name: 'Billing', description: 'Handles billing inquiries and payment issues' },
    { name: 'Operations', description: 'Manages internal operations and processes' },
  ];

  for (const department of departments) {
    await prisma.department.upsert({
      where: { name: department.name },
      update: {},
      create: department,
    });
  }

  // Seed Topics
  console.log('Seeding topics...');
  const topics = [
    { name: 'Account Access', description: 'Issues related to logging in or account access', category: 'Technical' },
    { name: 'Password Reset', description: 'Assistance with password resets', category: 'Technical' },
    { name: 'Billing Questions', description: 'Questions about billing or payments', category: 'Billing' },
    { name: 'Product Information', description: 'Information about products or services', category: 'Sales' },
    { name: 'Technical Issue', description: 'Technical problems with products or services', category: 'Technical' },
    { name: 'Subscription', description: 'Questions about subscriptions', category: 'Billing' },
    { name: 'Return Policy', description: 'Information about return policies', category: 'Sales' },
    { name: 'Order Status', description: 'Checking on order status', category: 'Sales' },
    { name: 'Complaint', description: 'Customer complaints', category: 'Support' },
    { name: 'Feedback', description: 'Customer feedback', category: 'Support' },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: { name: topic.name },
      update: {},
      create: topic,
    });
  }

  // Seed Categories for Knowledge Base
  console.log('Seeding knowledge base categories...');
  const categories = [
    { name: 'Product Documentation', description: 'Official product documentation and manuals' },
    { name: 'Support Guidelines', description: 'Guidelines for customer support agents' },
    { name: 'Policies & Procedures', description: 'Company policies and procedures' },
    { name: 'Training Materials', description: 'Training materials for agents' },
    { name: 'Technical Documentation', description: 'Technical documentation for products and services' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  // Seed sample documents
  console.log('Seeding documents...');
  const documents = [
    {
      title: "Product Manual v2.5",
      type: "PDF",
      size: 4300000, // 4.3 MB in bytes
      path: "/storage/documents/product-manual-v2.5.pdf",
      status: DocumentStatus.PROCESSED,
      uploadDate: new Date("2023-05-15"),
      categoryName: "Product Documentation",
    },
    {
      title: "Customer Support Guidelines",
      type: "DOCX",
      size: 1800000, // 1.8 MB in bytes
      path: "/storage/documents/support-guidelines.docx",
      status: DocumentStatus.PROCESSED,
      uploadDate: new Date("2023-06-22"),
      categoryName: "Support Guidelines",
    },
    {
      title: "Troubleshooting Guide",
      type: "PDF",
      size: 3500000, // 3.5 MB in bytes
      path: "/storage/documents/troubleshooting-guide.pdf",
      status: DocumentStatus.PROCESSED,
      uploadDate: new Date("2023-07-10"),
      categoryName: "Support Guidelines",
    },
    {
      title: "Pricing Structure 2023",
      type: "XLSX",
      size: 900000, // 0.9 MB in bytes
      path: "/storage/documents/pricing-2023.xlsx",
      status: DocumentStatus.PROCESSED,
      uploadDate: new Date("2023-08-05"),
      categoryName: "Policies & Procedures",
    },
    {
      title: "Agent Training Manual",
      type: "PDF",
      size: 5700000, // 5.7 MB in bytes
      path: "/storage/documents/training-manual.pdf",
      status: DocumentStatus.PROCESSING,
      uploadDate: new Date("2023-09-12"),
      categoryName: "Training Materials",
    },
    {
      title: "Technical Specifications",
      type: "PDF",
      size: 2300000, // 2.3 MB in bytes
      path: "/storage/documents/tech-specs.pdf",
      status: DocumentStatus.FAILED,
      processingError: "File is corrupted",
      uploadDate: new Date("2023-10-01"),
      categoryName: "Product Documentation",
    },
  ];

  // We need to find the category IDs and a user ID for the documents
  // Since we're not seeding users, we'll need to find an existing user
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (adminUser) {
    for (const doc of documents) {
      const category = await prisma.category.findUnique({
        where: { name: doc.categoryName },
      });

      if (category) {
        await prisma.document.create({
          data: {
            title: doc.title,
            type: doc.type,
            size: doc.size,
            path: doc.path,
            status: doc.status,
            processingError: doc.processingError,
            uploadDate: doc.uploadDate,
            updatedAt: doc.uploadDate,
            categoryId: category.id,
            uploadedById: adminUser.id,
          },
        });
      }
    }
  }

  // Seed sample integrations
  console.log('Seeding integrations...');
  const integrations = [
    {
      name: 'Twilio',
      type: 'Calling',
      config: { apiKey: 'sample-key', accountSid: 'sample-sid' },
      status: 'Not Connected',
    },
    {
      name: 'Salesforce',
      type: 'CRM',
      config: { apiKey: 'sample-key', instanceUrl: 'https://example.salesforce.com' },
      status: 'Not Connected',
    },
    {
      name: 'Microsoft Dynamics',
      type: 'CRM',
      config: { apiKey: 'sample-key', tenantId: 'sample-tenant' },
      status: 'Not Connected',
    },
  ];

  for (const integration of integrations) {
    await prisma.integration.create({
      data: integration,
    });
  }

  // Seed forwarding rules
  console.log('Seeding forwarding rules...');
  const forwardingRules = [
    {
      name: 'Business Hours',
      description: 'Monday-Friday, 9am-5pm',
      timeCondition: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '09:00',
        endTime: '17:00',
      },
      destination: 'Support Team',
      isActive: true,
    },
    {
      name: 'After Hours',
      description: 'Evenings and weekends',
      timeCondition: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '17:00',
        endTime: '09:00',
        includeWeekends: true,
      },
      destination: 'Voicemail',
      isActive: true,
    },
    {
      name: 'VIP Customers',
      description: 'Priority customers',
      callerCondition: {
        vipList: ['1234567890', '0987654321'],
      },
      destination: 'Senior Support Team',
      isActive: true,
    },
  ];

  for (const rule of forwardingRules) {
    await prisma.forwardingRule.create({
      data: rule,
    });
  }

  // Seed insights
  console.log('Seeding insights...');
  const insights = [
    {
      title: "Customer Satisfaction Trend",
      description: "Customer satisfaction has increased by 12% over the past 30 days, correlating with the implementation of AI assistance.",
      details: "Analysis of customer satisfaction ratings shows a consistent upward trend since the AI assistance feature was implemented. The average rating has increased from 3.8 to 4.3 out of 5.",
      category: "Sentiment Analysis",
      confidence: "High",
      trend: "up",
      change: "+12%",
      recommendations: [
        "Continue expanding AI assistance features",
        "Train agents on effectively using AI suggestions",
        "Monitor which AI suggestions lead to highest satisfaction"
      ]
    },
    {
      title: "Common Customer Issues",
      description: "45% of support calls are related to account access issues. Creating a self-service password reset could reduce call volume.",
      details: "Topic analysis of call transcripts reveals that nearly half of all support calls involve account access problems, with password resets being the most common specific issue.",
      category: "Topic Analysis",
      confidence: "High",
      trend: "neutral",
      recommendations: [
        "Implement self-service password reset feature",
        "Create clearer account access documentation",
        "Add account troubleshooting guide to knowledge base"
      ]
    },
    {
      title: "Agent Performance Gap",
      description: "Agents using AI suggestions resolve calls 2.4 minutes faster on average than those who don't.",
      details: "Comparison of call duration between agents with high AI tool adoption (>80% of suggestions) and those with low adoption (<20%) shows a significant difference in resolution time.",
      category: "Performance",
      confidence: "Medium",
      trend: "up",
      change: "-2.4 min",
      recommendations: [
        "Provide additional training on AI tool usage",
        "Share best practices from high-performing agents",
        "Consider incentives for effective AI tool usage"
      ]
    },
    {
      title: "Call Volume Pattern",
      description: "Call volume is consistently highest between 10am-12pm and 2pm-4pm on weekdays. Consider adjusting staffing to match these peak times.",
      details: "Analysis of call volume by hour of day and day of week shows clear patterns with two daily peaks. Current staffing does not optimally align with these patterns.",
      category: "Operations",
      confidence: "High",
      trend: "neutral",
      recommendations: [
        "Adjust staffing schedule to match peak call times",
        "Consider staggered lunch breaks to maintain coverage",
        "Implement call-back options during peak times"
      ]
    },
    {
      title: "Product Feedback Trend",
      description: "15 customers mentioned difficulty with the new checkout process in the past week. This represents a 200% increase from the previous period.",
      details: "Sentiment analysis of call transcripts identified a significant increase in negative feedback specifically about the checkout process following the recent website update.",
      category: "Product",
      confidence: "Medium",
      trend: "down",
      change: "+200%",
      recommendations: [
        "Review checkout process usability",
        "Create guided tutorial for new checkout process",
        "Consider reverting to previous checkout flow temporarily"
      ]
    }
  ];

  for (const insight of insights) {
    await prisma.insight.create({
      data: insight,
    });
  }

  // Seed analytics data
  console.log('Seeding analytics data...');
  const today = new Date();
  
  // Define metrics for different time periods
  const dailyMetrics = [
    { metricType: "CallVolume", values: [120, 135, 142, 128, 145, 110, 95, 105, 115, 125, 130, 140, 150, 145, 135, 120, 110, 100, 90, 95, 105, 115, 125, 130, 140, 145, 150, 155, 160, 155] },
    { metricType: "AverageCallDuration", values: [520, 510, 525, 505, 490, 500, 515, 530, 525, 515, 505, 495, 485, 490, 500, 510, 520, 525, 530, 535, 530, 525, 520, 515, 510, 505, 500, 495, 490, 485] }, // in seconds
    { metricType: "ResolutionRate", values: [75.5, 76.2, 78.0, 77.5, 79.1, 78.5, 78.9, 79.2, 79.5, 79.8, 80.1, 80.5, 80.8, 81.0, 81.2, 81.5, 81.8, 82.0, 82.2, 82.5, 82.8, 83.0, 83.2, 83.5, 83.8, 84.0, 84.2, 84.5, 84.8, 85.0] }, // percentage
    { metricType: "AIAssistance", values: [88.5, 89.2, 90.5, 91.2, 92.0, 92.5, 93.1, 93.5, 93.8, 94.0, 94.2, 94.5, 94.8, 95.0, 95.2, 95.5, 95.8, 96.0, 96.2, 96.5, 96.8, 97.0, 97.2, 97.5, 97.8, 98.0, 98.2, 98.5, 98.8, 99.0] }, // percentage
    { metricType: "CustomerSatisfaction", values: [4.2, 4.3, 4.3, 4.4, 4.5, 4.5, 4.6, 4.6, 4.7, 4.7, 4.7, 4.8, 4.8, 4.8, 4.8, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 4.9, 5.0] }, // out of 5
  ];
  
  // Distribution metrics - create individual metrics for each category
  const distributionMetrics = [
    // Call Type Distribution
    { metricType: "CallTypeDistribution_Support", value: 45 },
    { metricType: "CallTypeDistribution_Sales", value: 25 },
    { metricType: "CallTypeDistribution_Technical", value: 20 },
    { metricType: "CallTypeDistribution_Billing", value: 10 },
    
    // Call Outcome Distribution
    { metricType: "CallOutcomeDistribution_Resolved", value: 65 },
    { metricType: "CallOutcomeDistribution_Escalated", value: 15 },
    { metricType: "CallOutcomeDistribution_FollowUp", value: 12 },
    { metricType: "CallOutcomeDistribution_Unresolved", value: 8 },
    
    // Call Duration Distribution
    { metricType: "CallDurationDistribution_LessThan5Min", value: 30 },
    { metricType: "CallDurationDistribution_5To10Min", value: 40 },
    { metricType: "CallDurationDistribution_10To15Min", value: 20 },
    { metricType: "CallDurationDistribution_MoreThan15Min", value: 10 }
  ];

  // Create analytics data for the past 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i)); // 29 days ago to today
    
    // Add daily metrics
    for (const metric of dailyMetrics) {
      await prisma.analyticsData.create({
        data: {
          date: date,
          metricType: metric.metricType,
          value: metric.values[i],
        },
      });
    }
    
    // Add distribution metrics (only for today and a few previous days for trend)
    if (i >= 25) { // Last 5 days
      for (const metric of distributionMetrics) {
        await prisma.analyticsData.create({
          data: {
            date: date,
            metricType: metric.metricType,
            value: metric.value + (Math.random() * 5 - 2.5), // Add some variation
          },
        });
      }
    }
  }
  
  // Add summary metrics for quick access
  const summaryMetrics = [
    { metricType: "TotalCalls", value: 1284 },
    { metricType: "AverageDuration", value: 522 }, // in seconds
    { metricType: "ResolutionRate", value: 78.3 }, // percentage
    { metricType: "AIAssistance", value: 92.7 }, // percentage
  ];
  
  for (const metric of summaryMetrics) {
    await prisma.analyticsData.create({
      data: {
        date: today,
        metricType: metric.metricType,
        value: metric.value,
      },
    });
  }

  // Seed sample calls and transcripts
  console.log('Seeding calls and transcripts...');
  
  // Only proceed if we have a user to associate with the calls
  if (adminUser) {
    const calls = [
      {
        callId: "CALL-1234",
        status: CallStatus.COMPLETED,
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 12), // 12 minutes later
        duration: 12 * 60, // 12 minutes in seconds
        callerName: "Sarah Johnson",
        callerPhone: "+1 (555) 123-4567",
        callerAvatar: "/placeholder.svg?height=40&width=40",
        agentId: adminUser.id,
        type: "support",
        sentiment: "positive",
        resolution: true,
        resolutionTime: 10 * 60, // 10 minutes in seconds
        aiAssisted: true,
        aiSuggestions: 5,
        aiSuggestionsUsed: 3,
        transcript: {
          create: {
            content: [
              {
                speaker: "system",
                text: "Call connected",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
              },
              {
                speaker: "agent",
                text: "Thank you for calling our support line. My name is Admin. How can I help you today?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 5)
              },
              {
                speaker: "customer",
                text: "Hi, I'm having trouble logging into my account. I keep getting an error message.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 15)
              },
              {
                speaker: "agent",
                text: "I'm sorry to hear that. I'd be happy to help you with this issue. Could you please provide me with your email address associated with the account?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 25)
              },
              {
                speaker: "customer",
                text: "It's sarah.johnson@example.com",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 35)
              },
              {
                speaker: "agent",
                text: "Thank you. I'm checking your account now. It looks like there might be an issue with your password. When was the last time you successfully logged in?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 50)
              },
              {
                speaker: "customer",
                text: "I think it was about a week ago. I haven't changed my password since then.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60)
              },
              {
                speaker: "agent",
                text: "I see. Let's try resetting your password. I'll send a password reset link to your email. Could you check your inbox in a few minutes?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 80)
              },
              {
                speaker: "customer",
                text: "Sure, I'll check it now.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 90)
              },
              {
                speaker: "agent",
                text: "Great. I've sent the reset link. Let me know when you receive it.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 100)
              },
              {
                speaker: "customer",
                text: "I got it! Let me reset my password... Ok, I've reset it and I can log in now. Thank you so much for your help!",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 300)
              },
              {
                speaker: "agent",
                text: "You're welcome! I'm glad we could resolve this issue. Is there anything else I can help you with today?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 320)
              },
              {
                speaker: "customer",
                text: "No, that's all. Thanks again!",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 330)
              },
              {
                speaker: "agent",
                text: "You're welcome! Have a great day!",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 340)
              },
              {
                speaker: "system",
                text: "Call ended",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 12)
              }
            ],
            summary: "Customer called about issues accessing their account. Agent helped reset their password and verified security questions. Issue was resolved successfully.",
            isStarred: true,
            isFlagged: false
          }
        },
        topics: {
          create: [
            {
              name: "Account Access",
              confidence: 0.95
            },
            {
              name: "Password Reset",
              confidence: 0.98
            }
          ]
        }
      },
      {
        callId: "CALL-1235",
        status: CallStatus.COMPLETED,
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 60 * 8), // 8 minutes later
        duration: 8 * 60, // 8 minutes in seconds
        callerName: "James Wilson",
        callerPhone: "+1 (555) 987-6543",
        callerAvatar: "/placeholder.svg?height=40&width=40",
        agentId: adminUser.id,
        type: "billing",
        sentiment: "neutral",
        resolution: true,
        resolutionTime: 7 * 60, // 7 minutes in seconds
        aiAssisted: true,
        aiSuggestions: 3,
        aiSuggestionsUsed: 2,
        transcript: {
          create: {
            content: [
              {
                speaker: "system",
                text: "Call connected",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4)
              },
              {
                speaker: "agent",
                text: "Thank you for calling our billing department. My name is Admin. How can I assist you today?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 5)
              },
              {
                speaker: "customer",
                text: "Hi, I'm calling about a charge on my bill that I don't recognize.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 15)
              },
              {
                speaker: "agent",
                text: "I understand your concern. I'd be happy to look into that for you. Could you please provide me with your account number or the phone number associated with your account?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 25)
              },
              {
                speaker: "customer",
                text: "My phone number is +1 (555) 987-6543.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 35)
              },
              {
                speaker: "agent",
                text: "Thank you. I'm pulling up your account now. Could you tell me which charge you're concerned about?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 50)
              },
              {
                speaker: "customer",
                text: "There's a $29.99 charge from last week labeled 'Premium Service Fee' but I don't think I signed up for any premium service.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 65)
              },
              {
                speaker: "agent",
                text: "I see that charge on your account. Let me check what this is for... It looks like this was for the premium subscription that was activated on your account last month. However, if you didn't authorize this, I can certainly remove this charge and make sure you're not billed for it in the future.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 90)
              },
              {
                speaker: "customer",
                text: "Yes, please remove it. I don't remember signing up for any premium subscription.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 110)
              },
              {
                speaker: "agent",
                text: "I understand. I've gone ahead and removed the charge from your current bill, and I've also made sure the premium subscription is canceled so you won't be charged for it in the future. The adjustment should be reflected in your account within 24-48 hours.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 140)
              },
              {
                speaker: "customer",
                text: "Thank you, I appreciate that. Will I receive a confirmation email about this adjustment?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 160)
              },
              {
                speaker: "agent",
                text: "Yes, you'll receive an email confirmation of the adjustment within the next hour. Is there anything else I can help you with today?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 180)
              },
              {
                speaker: "customer",
                text: "No, that's all. Thank you for your help.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 200)
              },
              {
                speaker: "agent",
                text: "You're welcome. Thank you for calling, and have a great day!",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 210)
              },
              {
                speaker: "system",
                text: "Call ended",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4 + 1000 * 60 * 8)
              }
            ],
            summary: "Customer had questions about their recent bill. Agent explained the charges and offered to adjust a late fee. Customer was satisfied with the resolution.",
            isStarred: false,
            isFlagged: true,
            flagReason: "Billing dispute"
          }
        },
        topics: {
          create: [
            {
              name: "Billing Question",
              confidence: 0.92
            },
            {
              name: "Subscription",
              confidence: 0.85
            }
          ]
        }
      },
      {
        callId: "CALL-1236",
        status: CallStatus.COMPLETED,
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 15), // 15 minutes later
        duration: 15 * 60, // 15 minutes in seconds
        callerName: "Robert Smith",
        callerPhone: "+1 (555) 234-5678",
        callerAvatar: "/placeholder.svg?height=40&width=40",
        agentId: adminUser.id,
        type: "technical",
        sentiment: "negative",
        resolution: false,
        aiAssisted: true,
        aiSuggestions: 7,
        aiSuggestionsUsed: 4,
        transcript: {
          create: {
            content: [
              {
                speaker: "system",
                text: "Call connected",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24)
              },
              {
                speaker: "agent",
                text: "Thank you for calling technical support. My name is Admin. How can I help you today?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 5)
              },
              {
                speaker: "customer",
                text: "Hi, I'm having a lot of problems with your product. It keeps crashing every time I try to use the main feature.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 20)
              },
              {
                speaker: "agent",
                text: "I'm sorry to hear that you're experiencing issues. I'll do my best to help you resolve this. Could you tell me which product you're using and what version?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 35)
              },
              {
                speaker: "customer",
                text: "I'm using your latest software, version 4.2. I just updated it yesterday thinking it would fix the problem, but it's actually worse now.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 55)
              },
              {
                speaker: "agent",
                text: "Thank you for that information. Let's try a few troubleshooting steps. First, could you tell me what operating system you're using?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 70)
              },
              {
                speaker: "customer",
                text: "I'm using Windows 11, and my computer meets all the system requirements. I've never had problems with any other software.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 90)
              },
              {
                speaker: "agent",
                text: "I understand your frustration. Let's try a few things. First, could you try running the software as an administrator? Right-click on the application icon and select 'Run as administrator'.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 110)
              },
              {
                speaker: "customer",
                text: "I've already tried that. It still crashes at the same point.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 130)
              },
              {
                speaker: "agent",
                text: "Let's try resetting the application settings. Go to Control Panel, then Programs, find our application and select 'Repair'.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 150)
              },
              {
                speaker: "customer",
                text: "Okay, I'm doing that now... It's repairing... Okay, it's done. Let me try opening it again... Nope, still crashing. This is really frustrating. I paid a lot of money for this software.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 240)
              },
              {
                speaker: "agent",
                text: "I understand your frustration. Let's try one more thing. Could you completely uninstall the software, restart your computer, and then reinstall it?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 260)
              },
              {
                speaker: "customer",
                text: "I've already tried that twice! Look, I need this working for a project due tomorrow. Can you escalate this to someone who can actually help me?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 290)
              },
              {
                speaker: "agent",
                text: "I apologize for the inconvenience. I'll escalate this issue to our senior technical team. They'll contact you within the next 4 hours with a solution. Can I have your email address to send you updates?",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 320)
              },
              {
                speaker: "customer",
                text: "It's robert.smith@example.com. Please make sure they contact me as soon as possible.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 340)
              },
              {
                speaker: "agent",
                text: "I've created a high-priority ticket for you, and I've included all the details we've discussed. Our senior technical team will contact you as soon as possible.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 360)
              },
              {
                speaker: "customer",
                text: "Alright, thank you.",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 380)
              },
              {
                speaker: "system",
                text: "Call ended",
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 15)
              }
            ],
            summary: "Customer reported issues with the product not working as expected. Agent troubleshooted but couldn't resolve the issue. Escalated to technical team for follow-up.",
            isStarred: false,
            isFlagged: true,
            flagReason: "Customer dissatisfaction"
          }
        },
        topics: {
          create: [
            {
              name: "Technical Issue",
              confidence: 0.97
            },
            {
              name: "Product Complaint",
              confidence: 0.88
            }
          ]
        }
      }
    ];

    for (const callData of calls) {
      await prisma.call.create({
        data: callData
      });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });