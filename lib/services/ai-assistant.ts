import OpenAI from "openai";
import { querySimilarDocuments } from "./vector-db";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface for transcript message
interface TranscriptMessage {
  id: string;
  sender: 'caller' | 'agent' | 'system';
  text: string;
  timestamp: Date;
  confidence?: number;
}

// Interface for AI suggestion
export interface AISuggestion {
  id: string;
  text: string;
  type: 'response' | 'information' | 'action';
  confidence: number;
  sources?: {
    title: string;
    text: string;
    relevance: number;
  }[];
  timestamp: Date;
}

// Sliding window size for transcript processing
const WINDOW_SIZE = 10;

// Minimum confidence threshold for suggestions
const MIN_CONFIDENCE = 0.7;

/**
 * Process transcript messages to generate AI suggestions
 */
export async function processTranscript(
  messages: TranscriptMessage[],
  teamId: string,
  companyId?: string
): Promise<AISuggestion | null> {
  try {
    console.log(`🧠 Processing ${messages.length} transcript messages`);
    
    // If there are no messages, return null
    if (messages.length === 0) {
      return null;
    }
    
    // Get the most recent messages (sliding window)
    const recentMessages = messages.slice(-WINDOW_SIZE);
    console.log(`🔍 Using ${recentMessages.length} most recent messages for processing`);
    
    // Check if there's a trigger in the recent messages
    const trigger = detectTrigger(recentMessages);
    if (!trigger) {
      console.log('❌ No trigger detected in recent messages');
      return null;
    }
    
    console.log(`✅ Trigger detected: ${trigger.type}`);
    
    // Extract key information from the transcript
    const keyInfo = extractKeyInformation(recentMessages);
    console.log('🔑 Extracted key information:', keyInfo);
    
    // Create a query for the vector database
    const query = createVectorQuery(keyInfo, trigger);
    console.log(`🔍 Vector query: ${query}`);
    
    // Query the vector database for relevant information
    const vectorResults = await querySimilarDocuments(query, teamId, companyId, 3);
    console.log(`📊 Found ${vectorResults.length} relevant documents`);
    
    // Format the vector results for the AI prompt
    const formattedVectorResults = vectorResults.map(result => ({
      text: result.metadata.text,
      title: result.metadata.documentTitle,
      relevance: result.score
    }));
    
    // Generate AI suggestion
    const suggestion = await generateSuggestion(
      recentMessages,
      formattedVectorResults,
      trigger,
      keyInfo
    );
    
    return suggestion;
  } catch (error) {
    console.error('❌ Error processing transcript:', error);
    return null;
  }
}

/**
 * Detect triggers in the transcript
 */
function detectTrigger(messages: TranscriptMessage[]): { type: string; confidence: number } | null {
  // Get the most recent message
  const lastMessage = messages[messages.length - 1];
  
  // If the last message is from the system, ignore it
  if (lastMessage.sender === 'system') {
    return null;
  }
  
  // If the last message is from the caller, check for question patterns
  if (lastMessage.sender === 'caller') {
    const text = lastMessage.text.toLowerCase();
    
    // Check for question patterns
    if (
      text.includes('?') ||
      text.startsWith('how') ||
      text.startsWith('what') ||
      text.startsWith('why') ||
      text.startsWith('when') ||
      text.startsWith('where') ||
      text.startsWith('who') ||
      text.startsWith('can you') ||
      text.startsWith('could you') ||
      text.includes('help me') ||
      text.includes('i need')
    ) {
      return { type: 'question', confidence: 0.9 };
    }
    
    // Check for confusion patterns
    if (
      text.includes('confused') ||
      text.includes('don\'t understand') ||
      text.includes('not sure') ||
      text.includes('unclear')
    ) {
      return { type: 'confusion', confidence: 0.8 };
    }
    
    // Check for frustration patterns
    if (
      text.includes('frustrated') ||
      text.includes('annoyed') ||
      text.includes('angry') ||
      text.includes('upset')
    ) {
      return { type: 'frustration', confidence: 0.8 };
    }
  }
  
  // If the last message is from the agent, check for assistance patterns
  if (lastMessage.sender === 'agent') {
    const text = lastMessage.text.toLowerCase();
    
    // Check for assistance patterns
    if (
      text.includes('let me check') ||
      text.includes('i\'ll look that up') ||
      text.includes('one moment') ||
      text.includes('give me a moment')
    ) {
      return { type: 'agent_assistance', confidence: 0.7 };
    }
  }
  
  // If we've processed at least 5 messages, generate a suggestion anyway
  if (messages.length >= 5) {
    return { type: 'regular_update', confidence: 0.6 };
  }
  
  return null;
}

/**
 * Extract key information from the transcript
 */
function extractKeyInformation(messages: TranscriptMessage[]): any {
  // Initialize key information
  const keyInfo: any = {
    topics: [],
    entities: [],
    questions: [],
    sentiments: {
      positive: 0,
      negative: 0,
      neutral: 0
    }
  };
  
  // Process each message
  for (const message of messages) {
    const text = message.text.toLowerCase();
    
    // Extract topics (simple keyword matching for now)
    const topicKeywords = [
      'account', 'password', 'login', 'billing', 'payment',
      'subscription', 'cancel', 'upgrade', 'downgrade',
      'feature', 'bug', 'error', 'issue', 'problem',
      'help', 'support', 'question', 'feedback'
    ];
    
    for (const keyword of topicKeywords) {
      if (text.includes(keyword) && !keyInfo.topics.includes(keyword)) {
        keyInfo.topics.push(keyword);
      }
    }
    
    // Extract questions
    if (text.includes('?')) {
      const questionMatch = message.text.match(/[^.!?]+\?/g);
      if (questionMatch) {
        keyInfo.questions.push(...questionMatch);
      }
    }
    
    // Simple sentiment analysis
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'thank', 'appreciate', 'helpful'];
    const negativeWords = ['angry', 'bad', 'terrible', 'awful', 'unhappy', 'frustrated', 'problem'];
    
    const words = text.split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;
    
    if (positiveCount > negativeCount) {
      keyInfo.sentiments.positive++;
    } else if (negativeCount > positiveCount) {
      keyInfo.sentiments.negative++;
    } else {
      keyInfo.sentiments.neutral++;
    }
  }
  
  return keyInfo;
}

/**
 * Create a query for the vector database
 */
function createVectorQuery(keyInfo: any, trigger: { type: string; confidence: number }): string {
  // Start with the topics
  let query = keyInfo.topics.join(' ');
  
  // Add the most recent question if available
  if (keyInfo.questions.length > 0) {
    query += ' ' + keyInfo.questions[keyInfo.questions.length - 1];
  }
  
  // If the query is too short, use a default query based on the trigger
  if (query.length < 10) {
    switch (trigger.type) {
      case 'question':
        query = 'common customer questions and answers';
        break;
      case 'confusion':
        query = 'explaining complex topics simply';
        break;
      case 'frustration':
        query = 'handling customer frustration and complaints';
        break;
      case 'agent_assistance':
        query = 'helpful information for customer service agents';
        break;
      default:
        query = 'general customer service information';
        break;
    }
  }
  
  return query;
}

/**
 * Generate an AI suggestion based on the transcript and vector results
 */
async function generateSuggestion(
  messages: TranscriptMessage[],
  vectorResults: any[],
  trigger: { type: string; confidence: number },
  keyInfo: any
): Promise<AISuggestion> {
  try {
    // Format the transcript for the AI prompt
    const formattedTranscript = messages.map(message => 
      `${message.sender.toUpperCase()}: ${message.text}`
    ).join('\n');
    
    // Format the vector results for the AI prompt
    const formattedVectorResults = vectorResults.map(result => 
      `DOCUMENT: ${result.title}\n${result.text}\n`
    ).join('\n');
    
    // Create the prompt
    const prompt = `
You are an AI assistant helping a customer service agent during a live call.
Below is the recent transcript of the conversation:

${formattedTranscript}

Based on the conversation, I've found these relevant documents that might help:

${formattedVectorResults || 'No specific documents found.'}

The customer seems to be discussing these topics: ${keyInfo.topics.join(', ') || 'No specific topics detected.'}

Please provide a helpful suggestion for the agent. This could be:
1. A suggested response to the customer
2. Relevant information that might help resolve the customer's issue
3. A recommended action the agent should take

Keep your suggestion concise, professional, and directly relevant to the conversation.
Format your response as a single paragraph without any prefixes or explanations.
`;

    // Generate the suggestion using OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant for customer service agents.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    });
    
    // Get the suggestion text
    const suggestionText = response.choices[0]?.message.content?.trim() || 'No suggestion available.';
    
    // Create the suggestion object
    const suggestion: AISuggestion = {
      id: `suggestion-${Date.now()}`,
      text: suggestionText,
      type: trigger.type === 'question' ? 'response' : 
            trigger.type === 'agent_assistance' ? 'information' : 'action',
      confidence: trigger.confidence,
      sources: vectorResults.length > 0 ? vectorResults : undefined,
      timestamp: new Date()
    };
    
    return suggestion;
  } catch (error) {
    console.error('❌ Error generating suggestion:', error);
    
    // Return a fallback suggestion
    return {
      id: `suggestion-${Date.now()}`,
      text: 'I couldn\'t generate a specific suggestion at this time. Please continue assisting the customer based on your training.',
      type: 'information',
      confidence: 0.5,
      timestamp: new Date()
    };
  }
}

/**
 * Process a single new message and update suggestions
 */
export async function processNewMessage(
  newMessage: TranscriptMessage,
  previousMessages: TranscriptMessage[],
  teamId: string,
  companyId?: string
): Promise<AISuggestion | null> {
  // Combine previous messages with the new message
  const allMessages = [...previousMessages, newMessage];
  
  // Process the transcript
  return processTranscript(allMessages, teamId, companyId);
}