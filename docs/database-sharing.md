# Pages Likely to Share Database Data

This document outlines the pages in the AI Call Center Solution that are likely to share data from a database, along with the specific data entities they would access.

## 1. Call-Related Data

**Shared across these pages:**
- **Dashboard Page** - Shows recent calls in the RecentCallsTable component
- **Analytics Page** - Displays call volume, distribution, and metrics
- **Transcripts Page** - Lists detailed call transcripts with metadata
- **Insights Page** - Uses call data to generate insights

**Shared data entities:**
- Call records (id, date, duration, type)
- Call metadata (sentiment, topics/categories)
- Call transcripts and summaries

## 2. Agent Data

**Shared across these pages:**
- **Dashboard Page** - Shows team performance metrics
- **Analytics Page** - Displays agent performance statistics
- **Team Page** (referenced but not shown in code)
- **Insights Page** - Analyzes agent performance patterns

**Shared data entities:**
- Agent profiles (name, role, avatar)
- Performance metrics (calls handled, resolution rate, satisfaction score)
- AI assistance usage statistics

## 3. Customer Data

**Shared across these pages:**
- **Dashboard Page** - Indirectly through call data
- **Transcripts Page** - Shows customer information with each transcript
- **Insights Page** - Analyzes customer sentiment and issues

**Shared data entities:**
- Customer profiles (name, contact info)
- Customer interaction history

## 4. Analytics & Metrics

**Shared across these pages:**
- **Dashboard Page** - Shows summary metrics
- **Analytics Page** - Provides detailed metrics and charts
- **Insights Page** - Uses metrics to generate insights

**Shared data entities:**
- Aggregated call statistics
- Performance trends
- Sentiment analysis data

## 5. Insights & AI Analysis

**Shared across these pages:**
- **Insights Page** - Primary location for AI-generated insights
- **Analytics Page** - Shows some derived insights
- **Dashboard Page** - May show high-priority insights

**Shared data entities:**
- AI-generated insights and recommendations
- Topic analysis results
- Trend identification

## Database Schema Implications

Based on this analysis, a database schema would likely include these core tables:

1. **Calls** - Store call records with metadata
2. **Transcripts** - Store detailed call transcripts linked to calls
3. **Agents** - Store agent information and performance data
4. **Customers** - Store customer information
5. **Topics** - Store categorization of call topics
6. **Insights** - Store AI-generated insights from call analysis

These tables would have relationships that allow the different pages to query and display related information efficiently.