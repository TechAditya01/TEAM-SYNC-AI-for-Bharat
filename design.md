## Nagar Alert Hub : System Design Document

## 1. System Architecture Overview

Nagar Alert Hub is built on a serverless, event-driven architecture leveraging AWS cloud services. The system uses WhatsApp Business API as the primary citizen interface, with AI-powered verification and classification using Amazon Bedrock. The architecture is designed for high availability, scalability, and real-time processing.

### Architecture Principles

- **Serverless-First**: Utilize AWS Lambda for compute to minimize operational overhead
- **Event-Driven**: Asynchronous processing using message queues and event streams
- **Microservices**: Loosely coupled services for independent scaling and deployment
- **API-First**: RESTful APIs for all service interactions
- **Multi-Tenancy**: Support multiple cities with data isolation
- **Real-Time**: WebSocket connections for live dashboard updates

### Key Design Decisions

- WhatsApp Business API for zero-friction citizen engagement
- Amazon Bedrock for AI/ML capabilities without model management overhead
- DynamoDB for flexible schema and automatic scaling
- S3 for cost-effective media storage with CDN integration
- Amazon Location Service for geospatial operations
- React with Tailwind CSS for modern, responsive dashboard

## 2. High-Level Architecture Description

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CITIZEN LAYER                              │
│                     (WhatsApp Interface)                            │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                              │
│              (WhatsApp Webhook + REST APIs)                         │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │   Message    │  │     AI       │  │  Geospatial  │               │
│  │   Handler    │  │  Processor   │  │   Service    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │    Alert     │  │   Report     │  │    Media     │               │
│  │   Service    │  │   Manager    │  │   Handler    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  DynamoDB    │  │   S3 Media   │  │   Location   │               │
│  │   Tables     │  │   Storage    │  │   Service    │               │
│  └──────────────┘  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     AUTHORITY LAYER                                 │
│              (React Dashboard + WebSocket)                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Flow

1. **Citizen Interaction**: Users send messages via WhatsApp
2. **Webhook Processing**: WhatsApp Business API forwards messages to API Gateway
3. **Message Routing**: Lambda functions process and route messages
4. **AI Processing**: Amazon Bedrock analyzes content for verification
5. **Geospatial Analysis**: Location Service handles proximity detection
6. **Data Persistence**: DynamoDB stores structured data, S3 stores media
7. **Real-Time Updates**: WebSocket pushes updates to authority dashboard
8. **Alert Distribution**: Verified reports trigger alerts to affected citizens


## 3. Component Details

### 3.1 WhatsApp Business API

**Purpose**: Primary citizen interface for reporting and receiving alerts

**Key Features**:
- Webhook integration for incoming messages
- Template messages for structured alerts
- Media message support (images, videos, voice, location)
- Interactive buttons and lists for guided reporting
- Message status tracking (sent, delivered, read)

**Integration Points**:
- Webhook endpoint: `/api/whatsapp/webhook`
- Outbound messaging via WhatsApp Cloud API
- Message templates pre-approved by Meta

**Configuration**:
```javascript
{
  "webhookUrl": "https://api.nagaralerthub.in/whatsapp/webhook",
  "verifyToken": "SECURE_RANDOM_TOKEN",
  "accessToken": "WHATSAPP_BUSINESS_API_TOKEN",
  "phoneNumberId": "BUSINESS_PHONE_NUMBER_ID"
}
```

**Message Flow**:
1. Citizen sends message to WhatsApp Business number
2. WhatsApp forwards to webhook endpoint
3. System validates webhook signature
4. Message queued for processing
5. Response sent back to citizen via WhatsApp API

### 3.2 Backend Server (Node.js + Express)

**Purpose**: Core application server handling business logic

**Technology Stack**:
- Node.js 20.x LTS
- Express.js 4.x for REST APIs
- TypeScript for type safety
- Socket.io for WebSocket connections

**Key Responsibilities**:
- WhatsApp webhook handling
- REST API endpoints for dashboard
- WebSocket server for real-time updates
- Session management
- Request validation and sanitization

**Server Structure**:
```
src/
├── controllers/      # Request handlers
├── services/         # Business logic
├── models/          # Data models
├── middleware/      # Auth, validation, logging
├── routes/          # API route definitions
├── utils/           # Helper functions
└── config/          # Configuration files
```

**Key Modules**:
- `whatsappController`: Handles incoming WhatsApp messages
- `reportService`: Manages report lifecycle
- `alertService`: Handles alert distribution
- `authMiddleware`: JWT validation and authorization

### 3.3 AWS Lambda Functions

**Purpose**: Serverless compute for event-driven processing

**Lambda Functions**:

1. **MessageProcessor** (`message-processor`)
   - Trigger: API Gateway (WhatsApp webhook)
   - Purpose: Parse and route incoming messages
   - Runtime: Node.js 20.x
   - Memory: 512 MB
   - Timeout: 30 seconds

2. **AIVerifier** (`ai-verifier`)
   - Trigger: SQS queue
   - Purpose: AI-based report verification
   - Runtime: Node.js 20.x
   - Memory: 1024 MB
   - Timeout: 60 seconds

3. **MediaProcessor** (`media-processor`)
   - Trigger: S3 upload event
   - Purpose: Image/video processing and analysis
   - Runtime: Node.js 20.x
   - Memory: 2048 MB
   - Timeout: 120 seconds

4. **DuplicateDetector** (`duplicate-detector`)
   - Trigger: DynamoDB stream
   - Purpose: Identify and merge duplicate reports
   - Runtime: Node.js 20.x
   - Memory: 1024 MB
   - Timeout: 45 seconds

5. **AlertDispatcher** (`alert-dispatcher`)
   - Trigger: EventBridge rule
   - Purpose: Send alerts to affected citizens
   - Runtime: Node.js 20.x
   - Memory: 512 MB
   - Timeout: 30 seconds

6. **VoiceTranscriber** (`voice-transcriber`)
   - Trigger: SQS queue
   - Purpose: Convert voice messages to text
   - Runtime: Python 3.11
   - Memory: 1024 MB
   - Timeout: 60 seconds

**Lambda Configuration**:
- VPC: Enabled for DynamoDB and RDS access
- Environment variables for configuration
- IAM roles with least privilege access
- CloudWatch Logs for monitoring
- X-Ray tracing enabled

### 3.4 Amazon Bedrock (AI Models)

**Purpose**: AI-powered verification, classification, and NLP

**Models Used**:

1. **Claude 3 Sonnet** (Primary)
   - Report verification and credibility scoring
   - Content moderation and safety checks
   - Contextual understanding of civic issues

2. **Titan Text Embeddings**
   - Semantic similarity for duplicate detection
   - Report clustering and categorization

3. **Titan Multimodal Embeddings**
   - Image and video content analysis
   - Visual verification of reported issues

**AI Processing Tasks**:
- **Verification**: Analyze report text for credibility indicators
- **Classification**: Categorize reports (road, water, power, safety, etc.)
- **Sentiment Analysis**: Detect urgency and severity
- **Language Detection**: Identify input language
- **Translation**: Convert regional languages to English
- **Duplicate Detection**: Semantic similarity matching
- **Image Analysis**: Verify photo authenticity and relevance

**Bedrock Configuration**:
```javascript
{
  "modelId": "anthropic.claude-3-sonnet-20240229-v1:0",
  "region": "us-east-1",
  "maxTokens": 2048,
  "temperature": 0.3,
  "topP": 0.9
}
```

**Prompt Engineering**:
```javascript
const verificationPrompt = `
Analyze this civic issue report and provide:
1. Credibility score (0-100)
2. Issue category
3. Severity level (Low/Medium/High/Critical)
4. Key details extracted
5. Potential duplicates flag

Report: {reportText}
Location: {location}
Media: {hasMedia}
`;
```

### 3.5 Amazon Location Service

**Purpose**: Geospatial operations and proximity detection

**Key Features**:
- Geocoding: Convert addresses to coordinates
- Reverse Geocoding: Get address from coordinates
- Place search and autocomplete
- Geofencing for alert zones
- Distance calculation between reports

**Use Cases**:
- Validate and standardize location data
- Calculate proximity for duplicate detection (50m radius)
- Define alert broadcast zones
- Generate heat maps for dashboard
- Route optimization for field teams

**Configuration**:
```javascript
{
  "placeIndex": "NagarAlertHub-PlaceIndex",
  "mapName": "NagarAlertHub-Map",
  "geofenceCollection": "NagarAlertHub-Geofences",
  "provider": "Esri"
}
```

**Geospatial Queries**:
- Find reports within 50m radius
- Get all reports in a city boundary
- Calculate affected population in alert zone
- Identify high-density issue areas

### 3.6 DynamoDB

**Purpose**: Primary NoSQL database for application data

**Table Design**: See Section 6 for detailed schema

**Key Tables**:
- `Reports`: Citizen-submitted reports
- `Users`: Citizen and authority user profiles
- `Alerts`: Alert history and delivery status
- `Sessions`: WhatsApp conversation state
- `AuditLogs`: System activity tracking

**DynamoDB Features Used**:
- On-demand capacity mode for auto-scaling
- Global Secondary Indexes (GSI) for query patterns
- DynamoDB Streams for change data capture
- Point-in-time recovery (PITR) enabled
- Encryption at rest with AWS KMS

**Access Patterns**:
- Get report by ID (primary key)
- Query reports by location (GSI)
- Query reports by status and timestamp (GSI)
- Query user's reports (GSI)
- Query alerts by recipient (GSI)

### 3.7 S3 Storage

**Purpose**: Object storage for media files and static assets

**S3 Bucket Structure**:

```
📦 nagar-alert-hub-media-ap-south-1/
│
├── 📁 nashik/                                    # City-level partition
│   │
│   ├── 📁 reports/                               # All citizen reports
│   │   │
│   │   ├── 📁 images/                            # Image uploads
│   │   │   ├── 📁 original/                      # High-quality originals
│   │   │   │   └── 📁 NAH12345/
│   │   │   │       ├── 📷 1707301800-a3f2c1.jpg
│   │   │   │       └── 📷 1707301850-b4e3d2.jpg
│   │   │   │
│   │   │   └── 📁 compressed/                    # Optimized for dashboard
│   │   │       └── 📁 NAH12345/
│   │   │           └── 📷 1707301800-a3f2c1-compressed.jpg
│   │   │
│   │   ├── 📁 videos/                            # Video uploads
│   │   │   ├── 📁 original/                      # Full resolution
│   │   │   │   └── 📁 NAH12345/
│   │   │   │       └── 🎥 1707301900-c5f4e3.mp4
│   │   │   │
│   │   │   └── 📁 compressed/                    # Transcoded for web
│   │   │       └── 📁 NAH12345/
│   │   │           └── 🎥 1707301900-c5f4e3-compressed.mp4
│   │   │
│   │   └── 📁 voice/                             # Voice notes
│   │       └── 📁 NAH12345/
│   │           └── 🎤 1707302000-d6g5h4.ogg
│   │
│   ├── 📁 thumbnails/                            # Auto-generated thumbnails
│   │   └── 📁 NAH12345/
│   │       ├── 🖼️ 1707301800-a3f2c1-thumb.jpg
│   │       └── 🖼️ 1707301900-c5f4e3-thumb.jpg
│   │
│   └── 📁 exports/                               # Generated reports
│       ├── 📁 daily/
│       │   ├── 📄 2026-02-07-report.pdf
│       │   └── 📄 2026-02-06-report.pdf
│       │
│       ├── 📁 weekly/
│       │   └── 📄 2026-W06-report.pdf
│       │
│       └── 📁 monthly/
│           └── 📄 2026-02-report.pdf
│
├── 📁 pune/                                      # Another city
│   └── 📁 reports/
│       └── ...
│
└── 📁 temp/                                      # Temporary uploads
    └── 📁 upload_xyz123/
        └── 📷 temp_image.jpg                     # Auto-deleted after 24h
```

**Example Paths**:
```
# Original image
nashik/reports/images/original/NAH12345/1707301800-a3f2c1.jpg

# Compressed image (for dashboard)
nashik/reports/images/compressed/NAH12345/1707301800-a3f2c1-compressed.jpg

# Thumbnail
nashik/thumbnails/NAH12345/1707301800-a3f2c1-thumb.jpg

# Voice note
nashik/reports/voice/NAH12345/1707301850-b4e3d2.ogg

# Daily export
nashik/exports/daily/2026-02-07-report.pdf

# Temporary upload (deleted after processing)
temp/upload_xyz123/image.jpg
```

**S3 Configuration**:
- **Versioning**: Enabled for audit trail and accidental deletion recovery
- **Encryption**: Server-side encryption (SSE-S3) for all objects
- **CORS**: Configured for dashboard uploads
- **CloudFront CDN**: Fast media delivery across India (edge locations)
- **Pre-signed URLs**: 5-minute expiry for secure access
- **Multipart Upload**: For videos >5MB

**Lifecycle Policies**:
```json
{
  "Rules": [
    {
      "Id": "CompressedImagesTransition",
      "Status": "Enabled",
      "Prefix": "*/reports/images/compressed/",
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "INTELLIGENT_TIERING"
        },
        {
          "Days": 90,
          "StorageClass": "GLACIER_INSTANT_RETRIEVAL"
        }
      ]
    },
    {
      "Id": "OriginalMediaArchive",
      "Status": "Enabled",
      "Prefix": "*/reports/images/original/",
      "Transitions": [
        {
          "Days": 7,
          "StorageClass": "INTELLIGENT_TIERING"
        },
        {
          "Days": 60,
          "StorageClass": "GLACIER_INSTANT_RETRIEVAL"
        }
      ]
    },
    {
      "Id": "TempFilesCleanup",
      "Status": "Enabled",
      "Prefix": "temp/",
      "Expiration": {
        "Days": 1
      }
    },
    {
      "Id": "OldExportsArchive",
      "Status": "Enabled",
      "Prefix": "*/exports/",
      "Transitions": [
        {
          "Days": 90,
          "StorageClass": "GLACIER_FLEXIBLE_RETRIEVAL"
        }
      ]
    }
  ]
}
```

**Storage Cost Optimization**:
- **Standard**: Active reports (0-7 days) - ₹1.84/GB/month
- **Intelligent-Tiering**: Recent reports (7-60 days) - ₹1.61/GB/month
- **Glacier Instant Retrieval**: Old reports (60-365 days) - ₹0.37/GB/month
- **Glacier Flexible Retrieval**: Archives (365+ days) - ₹0.12/GB/month

**Estimated Storage Costs** (per city, 500 reports/day):
- Images: 500 × 2MB × 30 days = 30GB → ₹55/month
- Videos: 100 × 10MB × 30 days = 30GB → ₹55/month
- Thumbnails: 500 × 50KB × 30 days = 750MB → ₹1.4/month
- **Total**: ~₹110/month (with lifecycle optimization)
- CORS enabled for dashboard uploads
- Presigned URLs for secure access

**Lifecycle Rules**:
- Move to S3 Infrequent Access after 90 days
- Move to Glacier after 1 year
- Delete after 3 years (compliance requirement)

### 3.8 Admin Dashboard (React + Tailwind)

**Purpose**: Web-based interface for authorities and admins

**Technology Stack**:
- React 18.x with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- React Query for data fetching
- Zustand for state management
- React Router for navigation
- Recharts for data visualization
- Leaflet for map integration

**Key Features**:
- Real-time report monitoring
- Interactive map with report markers
- Report verification and status updates
- Alert broadcasting interface
- Analytics and reporting dashboards
- User management
- System configuration

**Dashboard Modules**:

1. **Live Map View**
   - Real-time report markers
   - Heat map overlay
   - Geofence visualization
   - Click for report details

2. **Report Management**
   - List view with filters
   - Detailed report view
   - Status workflow management
   - Assignment to field teams

3. **Analytics Dashboard**
   - Report trends over time
   - Category distribution
   - Response time metrics
   - Citizen engagement stats

4. **Alert Center**
   - Create and broadcast alerts
   - Template management
   - Delivery status tracking
   - Scheduled alerts

5. **User Management**
   - Authority user accounts
   - Role-based permissions
   - Activity logs
   - Access control

**Component Structure**:
```
src/
├── components/
│   ├── Map/
│   ├── Reports/
│   ├── Alerts/
│   ├── Analytics/
│   └── Common/
├── pages/
├── hooks/
├── services/
├── store/
└── utils/
```


## 4. Data Flow Diagram Explanation

### 4.1 Report Submission Flow (3-Step Process)

**Step 1: Snap (Initial Report)**
```
Citizen → WhatsApp Message → API Gateway → MessageProcessor Lambda
    ↓
Parse message type (text/media/voice/location)
    ↓
Store in Sessions table (conversation state)
    ↓
Request additional info if needed (category, description)
    ↓
Send acknowledgment to citizen
```

**Step 2: Auto Verify (AI Processing)**
```
Complete report data → SQS Queue → AIVerifier Lambda
    ↓
Amazon Bedrock (Claude 3)
    ├── Credibility scoring
    ├── Category classification
    ├── Severity assessment
    └── Language translation
    ↓
Media analysis (if present)
    ├── S3 trigger → MediaProcessor Lambda
    └── Bedrock Multimodal → Image verification
    ↓
Geospatial processing
    ├── Amazon Location Service → Geocoding
    └── DuplicateDetector → 50m proximity check
    ↓
Update report with AI scores and metadata
    ↓
Store in Reports table
```

**Step 3: Ticket (Report Creation & Alert)**
```
Verified report → DynamoDB Stream → AlertDispatcher Lambda
    ↓
Check if alert criteria met (severity, verification score)
    ↓
Identify affected citizens (geofence query)
    ↓
Generate personalized alert messages
    ↓
WhatsApp Business API → Send alerts
    ↓
Store alert delivery status in Alerts table
    ↓
WebSocket → Push to dashboard (real-time)
    ↓
Send confirmation to original reporter
```

### 4.2 Voice Message Flow

```
Citizen sends voice message → WhatsApp webhook
    ↓
Download audio file → Store in S3
    ↓
S3 event → VoiceTranscriber Lambda
    ↓
Amazon Transcribe → Convert to text
    ↓
Detect language → Translate if needed
    ↓
Continue with standard report flow
```

### 4.3 Dashboard Interaction Flow

```
Authority logs in → Cognito authentication
    ↓
JWT token issued → Stored in browser
    ↓
WebSocket connection established
    ↓
Dashboard loads → API calls for initial data
    ↓
Real-time updates via WebSocket
    ↓
Authority actions (verify, update status, broadcast alert)
    ↓
API Gateway → Lambda → DynamoDB
    ↓
DynamoDB Stream → Trigger downstream processes
    ↓
WebSocket broadcast → All connected dashboards
```

### 4.4 Duplicate Detection Flow

```
New report created → DynamoDB Stream
    ↓
DuplicateDetector Lambda triggered
    ↓
Query reports within 50m radius (Location Service)
    ↓
Get recent reports (last 24 hours)
    ↓
Generate embeddings (Bedrock Titan)
    ↓
Calculate semantic similarity
    ↓
If similarity > 85% threshold:
    ├── Mark as duplicate
    ├── Link to original report
    ├── Increment duplicate count
    └── Notify citizen (already reported)
    ↓
If unique:
    └── Proceed with verification
```

## 5. AI Processing Pipeline

### 5.1 Text Analysis Pipeline

```
Input: Report text, location, timestamp
    ↓
┌─────────────────────────────────────┐
│   Language Detection                │
│   (Bedrock Claude 3)                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Translation to English            │
│   (if non-English)                  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Content Moderation                │
│   - Profanity check                 │
│   - Spam detection                  │
│   - Inappropriate content           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Credibility Scoring               │
│   - Specificity of details          │
│   - Consistency check               │
│   - Historical pattern match        │
│   - Reporter reputation             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Category Classification           │
│   - Road/Traffic                    │
│   - Water Supply                    │
│   - Power Outage                    │
│   - Public Safety                   │
│   - Sanitation                      │
│   - Other                           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Severity Assessment               │
│   - Low: Minor inconvenience        │
│   - Medium: Significant impact      │
│   - High: Major disruption          │
│   - Critical: Safety risk           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Entity Extraction                 │
│   - Location names                  │
│   - Time references                 │
│   - Affected infrastructure         │
│   - Contact information             │
└─────────────────────────────────────┘
    ↓
Output: Structured report metadata
```

### 5.2 Image/Video Analysis Pipeline

```
Input: Media file from S3
    ↓
┌─────────────────────────────────────┐
│   Metadata Extraction               │
│   - EXIF data                       │
│   - GPS coordinates                 │
│   - Timestamp                       │
│   - Device information              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Image Quality Check               │
│   - Resolution                      │
│   - Blur detection                  │
│   - Lighting conditions             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Manipulation Detection            │
│   (Bedrock Multimodal)              │
│   - Edited/filtered images          │
│   - Deepfake detection              │
│   - Timestamp tampering             │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Content Recognition               │
│   - Object detection                │
│   - Scene classification            │
│   - Text extraction (OCR)           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Relevance Scoring                 │
│   - Match with report description   │
│   - Civic issue identification      │
│   - Location consistency            │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Thumbnail Generation              │
│   - Multiple sizes                  │
│   - Optimized for web               │
└─────────────────────────────────────┘
    ↓
Output: Media analysis metadata
```

### 5.3 Voice Processing Pipeline

```
Input: Voice message (OGG/MP3)
    ↓
┌─────────────────────────────────────┐
│   Audio Quality Check               │
│   - Duration validation             │
│   - Noise level assessment          │
│   - Format conversion if needed     │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Speech-to-Text                    │
│   (Amazon Transcribe)               │
│   - Multi-language support          │
│   - Accent adaptation               │
│   - Punctuation restoration         │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Language Detection                │
│   - Identify primary language       │
│   - Detect code-switching           │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│   Translation                       │
│   (if non-English)                  │
└─────────────────────────────────────┘
    ↓
Continue with text analysis pipeline
```

### 5.4 Duplicate Detection Algorithm

```javascript
async function detectDuplicates(newReport) {
  // Step 1: Geospatial filtering
  const nearbyReports = await locationService.findWithinRadius(
    newReport.location,
    50 // meters
  );
  
  // Step 2: Temporal filtering (last 24 hours)
  const recentReports = nearbyReports.filter(
    r => (Date.now() - r.timestamp) < 24 * 60 * 60 * 1000
  );
  
  // Step 3: Category matching
  const sameCategoryReports = recentReports.filter(
    r => r.category === newReport.category
  );
  
  // Step 4: Semantic similarity
  const newEmbedding = await bedrock.generateEmbedding(
    newReport.description
  );
  
  const similarities = await Promise.all(
    sameCategoryReports.map(async (report) => {
      const embedding = await bedrock.generateEmbedding(
        report.description
      );
      return {
        reportId: report.id,
        similarity: cosineSimilarity(newEmbedding, embedding)
      };
    })
  );
  
  // Step 5: Threshold check
  const duplicates = similarities.filter(
    s => s.similarity > 0.85
  );
  
  return duplicates;
}
```


## 6. Database Design

### 6.1 DynamoDB Tables

#### Table: Reports

**Purpose**: Store all citizen-submitted reports

**Primary Key**:
- Partition Key: `reportId` (String) - UUID
- Sort Key: None

**Attributes**:
```javascript
{
  reportId: "uuid-v4",
  citizenPhone: "hashed-phone-number",
  citizenName: "string (optional)",
  cityId: "string",
  category: "ROAD | WATER | POWER | SAFETY | SANITATION | OTHER",
  description: "string",
  descriptionTranslated: "string (English)",
  language: "hi | en | ta | te | mr | etc",
  
  // Location data
  location: {
    latitude: "number",
    longitude: "number",
    address: "string",
    landmark: "string (optional)",
    geoHash: "string" // for geospatial queries
  },
  
  // Media attachments
  media: [
    {
      type: "IMAGE | VIDEO | VOICE",
      url: "s3-url",
      thumbnailUrl: "s3-url",
      metadata: {
        size: "number",
        duration: "number (for video/voice)",
        exif: "object"
      }
    }
  ],
  
  // AI verification
  aiVerification: {
    credibilityScore: "number (0-100)",
    verificationStatus: "VERIFIED | SUSPICIOUS | REJECTED",
    confidence: "number (0-1)",
    reasoning: "string",
    processedAt: "timestamp"
  },
  
  // Status tracking
  status: "SUBMITTED | VERIFIED | IN_PROGRESS | RESOLVED | REJECTED",
  severity: "LOW | MEDIUM | HIGH | CRITICAL",
  priority: "number (1-10)",
  
  // Duplicate handling
  isDuplicate: "boolean",
  originalReportId: "string (if duplicate)",
  duplicateCount: "number",
  relatedReports: ["reportId1", "reportId2"],
  
  // Assignment
  assignedTo: "authorityUserId",
  assignedAt: "timestamp",
  
  // Timestamps
  createdAt: "timestamp",
  updatedAt: "timestamp",
  resolvedAt: "timestamp (optional)",
  
  // Engagement
  viewCount: "number",
  upvotes: "number",
  
  // Metadata
  source: "WHATSAPP | DASHBOARD | API",
  version: "number"
}
```

**Global Secondary Indexes (GSI)**:

1. **GSI-CityStatus**
   - Partition Key: `cityId`
   - Sort Key: `status#createdAt`
   - Purpose: Query reports by city and status

2. **GSI-Location**
   - Partition Key: `cityId`
   - Sort Key: `location.geoHash`
   - Purpose: Geospatial queries

3. **GSI-Category**
   - Partition Key: `cityId#category`
   - Sort Key: `createdAt`
   - Purpose: Category-wise report listing

4. **GSI-Citizen**
   - Partition Key: `citizenPhone`
   - Sort Key: `createdAt`
   - Purpose: User's report history

#### Table: Users

**Purpose**: Store citizen and authority user profiles

**Primary Key**:
- Partition Key: `userId` (String) - UUID
- Sort Key: None

**Attributes**:
```javascript
{
  userId: "uuid-v4",
  userType: "CITIZEN | AUTHORITY | ADMIN",
  
  // Contact information
  phone: "hashed-phone-number",
  phoneVerified: "boolean",
  email: "string (optional)",
  name: "string",
  
  // Location preferences
  cityId: "string",
  preferredLanguage: "hi | en | ta | etc",
  location: {
    latitude: "number",
    longitude: "number",
    address: "string"
  },
  
  // Alert preferences
  alertPreferences: {
    enabled: "boolean",
    categories: ["ROAD", "WATER", "POWER"],
    radius: "number (meters)",
    quietHours: {
      start: "HH:MM",
      end: "HH:MM"
    }
  },
  
  // Reputation (for citizens)
  reputation: {
    score: "number (0-100)",
    totalReports: "number",
    verifiedReports: "number",
    falseReports: "number"
  },
  
  // Authority-specific
  department: "string (optional)",
  role: "VIEWER | OPERATOR | MANAGER | ADMIN",
  permissions: ["VIEW_REPORTS", "UPDATE_STATUS", "BROADCAST_ALERTS"],
  
  // Timestamps
  createdAt: "timestamp",
  lastActiveAt: "timestamp",
  
  // Status
  isActive: "boolean",
  isBanned: "boolean",
  banReason: "string (optional)"
}
```

**Global Secondary Indexes**:

1. **GSI-Phone**
   - Partition Key: `phone`
   - Purpose: Lookup user by phone number

2. **GSI-CityType**
   - Partition Key: `cityId#userType`
   - Sort Key: `createdAt`
   - Purpose: List users by city and type

#### Table: Alerts

**Purpose**: Track alert broadcasts and delivery status

**Primary Key**:
- Partition Key: `alertId` (String) - UUID
- Sort Key: None

**Attributes**:
```javascript
{
  alertId: "uuid-v4",
  cityId: "string",
  
  // Alert content
  title: "string",
  message: "string",
  category: "ROAD | WATER | POWER | SAFETY | SANITATION | OTHER",
  severity: "LOW | MEDIUM | HIGH | CRITICAL",
  
  // Targeting
  targetArea: {
    type: "GEOFENCE | CITY | CUSTOM",
    coordinates: "polygon or circle",
    radius: "number (if circle)"
  },
  recipientCount: "number",
  
  // Source
  sourceReportId: "string (optional)",
  createdBy: "authorityUserId",
  
  // Delivery tracking
  deliveryStatus: {
    sent: "number",
    delivered: "number",
    read: "number",
    failed: "number"
  },
  
  // Timestamps
  createdAt: "timestamp",
  scheduledAt: "timestamp (optional)",
  sentAt: "timestamp",
  expiresAt: "timestamp (optional)",
  
  // Metadata
  isScheduled: "boolean",
  isActive: "boolean"
}
```

**Global Secondary Indexes**:

1. **GSI-CityDate**
   - Partition Key: `cityId`
   - Sort Key: `createdAt`
   - Purpose: Alert history by city

#### Table: Sessions

**Purpose**: Maintain WhatsApp conversation state

**Primary Key**:
- Partition Key: `sessionId` (String) - Phone number
- Sort Key: None

**Attributes**:
```javascript
{
  sessionId: "hashed-phone-number",
  userId: "uuid-v4",
  
  // Conversation state
  currentStep: "AWAITING_CATEGORY | AWAITING_DESCRIPTION | AWAITING_LOCATION | COMPLETE",
  conversationContext: {
    reportId: "uuid-v4 (draft)",
    category: "string (optional)",
    description: "string (optional)",
    mediaUrls: ["s3-url"],
    language: "string"
  },
  
  // Timestamps
  createdAt: "timestamp",
  lastMessageAt: "timestamp",
  expiresAt: "timestamp (TTL)",
  
  // Message history (last 10)
  messageHistory: [
    {
      direction: "INBOUND | OUTBOUND",
      content: "string",
      timestamp: "timestamp"
    }
  ]
}
```

**TTL**: Enabled on `expiresAt` (auto-delete after 1 hour of inactivity)

#### Table: AuditLogs

**Purpose**: Track all system actions for compliance

**Primary Key**:
- Partition Key: `logId` (String) - UUID
- Sort Key: `timestamp` (Number)

**Attributes**:
```javascript
{
  logId: "uuid-v4",
  timestamp: "number (epoch milliseconds)",
  
  // Actor
  userId: "string",
  userType: "CITIZEN | AUTHORITY | ADMIN | SYSTEM",
  
  // Action
  action: "CREATE_REPORT | UPDATE_STATUS | SEND_ALERT | LOGIN | etc",
  resource: "REPORT | USER | ALERT | SYSTEM",
  resourceId: "string",
  
  // Details
  changes: {
    before: "object",
    after: "object"
  },
  
  // Context
  ipAddress: "string",
  userAgent: "string",
  cityId: "string",
  
  // Result
  status: "SUCCESS | FAILURE",
  errorMessage: "string (optional)"
}
```

**Global Secondary Indexes**:

1. **GSI-UserActions**
   - Partition Key: `userId`
   - Sort Key: `timestamp`
   - Purpose: User activity history

2. **GSI-ResourceActions**
   - Partition Key: `resource#resourceId`
   - Sort Key: `timestamp`
   - Purpose: Resource change history

### 6.2 Data Retention Policies

- **Reports**: Retain for 3 years, then archive to S3 Glacier
- **Users**: Retain active users indefinitely, delete inactive after 2 years
- **Alerts**: Retain for 1 year
- **Sessions**: Auto-delete after 1 hour (TTL)
- **AuditLogs**: Retain for 7 years (compliance requirement)


## 7. API Design

### 7.1 REST API Endpoints

**Base URL**: `https://api.nagaralerthub.in/v1`

#### WhatsApp Webhook Endpoints

**POST /whatsapp/webhook**
```javascript
// Receive incoming WhatsApp messages
Request Body:
{
  "object": "whatsapp_business_account",
  "entry": [{
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "messages": [{
          "from": "919876543210",
          "id": "wamid.xxx",
          "timestamp": "1234567890",
          "type": "text | image | video | voice | location",
          "text": { "body": "Report text" },
          "image": { "id": "media-id", "mime_type": "image/jpeg" },
          "location": { "latitude": 12.34, "longitude": 56.78 }
        }]
      }
    }]
  }]
}

Response: 200 OK
```

**GET /whatsapp/webhook**
```javascript
// Webhook verification
Query Parameters:
  hub.mode: "subscribe"
  hub.verify_token: "VERIFY_TOKEN"
  hub.challenge: "challenge-string"

Response: hub.challenge value
```

#### Report Management Endpoints

**GET /reports**
```javascript
// List reports with filters
Query Parameters:
  cityId: string (required)
  status: "SUBMITTED | VERIFIED | IN_PROGRESS | RESOLVED"
  category: "ROAD | WATER | POWER | SAFETY | SANITATION"
  severity: "LOW | MEDIUM | HIGH | CRITICAL"
  startDate: ISO timestamp
  endDate: ISO timestamp
  page: number (default: 1)
  limit: number (default: 20)
  sortBy: "createdAt | severity | priority"
  sortOrder: "asc | desc"

Response: 200 OK
{
  "reports": [
    {
      "reportId": "uuid",
      "category": "ROAD",
      "description": "Pothole on Main Street",
      "location": { "latitude": 12.34, "longitude": 56.78 },
      "status": "VERIFIED",
      "severity": "MEDIUM",
      "createdAt": "2026-02-06T10:30:00Z",
      "media": [{ "type": "IMAGE", "url": "https://..." }],
      "aiVerification": { "credibilityScore": 85 }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

**GET /reports/:reportId**
```javascript
// Get report details
Response: 200 OK
{
  "reportId": "uuid",
  "citizenPhone": "hashed",
  "category": "ROAD",
  "description": "Large pothole causing traffic issues",
  "descriptionTranslated": "English translation",
  "language": "hi",
  "location": {
    "latitude": 12.34,
    "longitude": 56.78,
    "address": "Main Street, Near City Mall",
    "landmark": "City Mall"
  },
  "media": [
    {
      "type": "IMAGE",
      "url": "https://cdn.nagaralerthub.in/...",
      "thumbnailUrl": "https://cdn.nagaralerthub.in/...",
      "metadata": { "size": 2048576 }
    }
  ],
  "aiVerification": {
    "credibilityScore": 85,
    "verificationStatus": "VERIFIED",
    "confidence": 0.92,
    "reasoning": "Report contains specific details and supporting photo"
  },
  "status": "IN_PROGRESS",
  "severity": "MEDIUM",
  "priority": 6,
  "isDuplicate": false,
  "duplicateCount": 3,
  "relatedReports": ["uuid1", "uuid2"],
  "assignedTo": "authority-user-id",
  "createdAt": "2026-02-06T10:30:00Z",
  "updatedAt": "2026-02-06T11:00:00Z"
}
```

**PATCH /reports/:reportId**
```javascript
// Update report status
Request Body:
{
  "status": "IN_PROGRESS | RESOLVED | REJECTED",
  "assignedTo": "authority-user-id",
  "notes": "Field team dispatched",
  "estimatedResolution": "2026-02-07T18:00:00Z"
}

Response: 200 OK
{
  "reportId": "uuid",
  "status": "IN_PROGRESS",
  "updatedAt": "2026-02-06T11:30:00Z"
}
```

**POST /reports/:reportId/verify**
```javascript
// Manual verification by authority
Request Body:
{
  "verificationStatus": "VERIFIED | REJECTED",
  "notes": "Verified by field inspection",
  "severity": "MEDIUM"
}

Response: 200 OK
```

#### Alert Management Endpoints

**POST /alerts**
```javascript
// Create and broadcast alert
Request Body:
{
  "cityId": "bangalore",
  "title": "Road Closure Alert",
  "message": "Main Street closed for repairs until 6 PM",
  "category": "ROAD",
  "severity": "HIGH",
  "targetArea": {
    "type": "GEOFENCE",
    "coordinates": [[lat, lng], [lat, lng], ...],
    "radius": 1000
  },
  "sourceReportId": "uuid (optional)",
  "scheduledAt": "2026-02-06T12:00:00Z (optional)"
}

Response: 201 Created
{
  "alertId": "uuid",
  "recipientCount": 1523,
  "status": "SENT",
  "sentAt": "2026-02-06T12:00:00Z"
}
```

**GET /alerts**
```javascript
// List alerts
Query Parameters:
  cityId: string (required)
  startDate: ISO timestamp
  endDate: ISO timestamp
  category: string
  severity: string

Response: 200 OK
{
  "alerts": [
    {
      "alertId": "uuid",
      "title": "Road Closure Alert",
      "message": "Main Street closed...",
      "severity": "HIGH",
      "recipientCount": 1523,
      "deliveryStatus": {
        "sent": 1523,
        "delivered": 1498,
        "read": 1245,
        "failed": 25
      },
      "createdAt": "2026-02-06T12:00:00Z"
    }
  ]
}
```

**GET /alerts/:alertId/delivery-status**
```javascript
// Get detailed delivery status
Response: 200 OK
{
  "alertId": "uuid",
  "totalRecipients": 1523,
  "deliveryStatus": {
    "sent": 1523,
    "delivered": 1498,
    "read": 1245,
    "failed": 25
  },
  "failureReasons": {
    "INVALID_NUMBER": 15,
    "BLOCKED": 8,
    "NETWORK_ERROR": 2
  }
}
```

#### User Management Endpoints

**POST /users**
```javascript
// Create authority user
Request Body:
{
  "name": "John Doe",
  "email": "john@city.gov.in",
  "phone": "+919876543210",
  "cityId": "bangalore",
  "department": "Public Works",
  "role": "OPERATOR",
  "permissions": ["VIEW_REPORTS", "UPDATE_STATUS"]
}

Response: 201 Created
{
  "userId": "uuid",
  "email": "john@city.gov.in",
  "role": "OPERATOR"
}
```

**GET /users/me**
```javascript
// Get current user profile
Response: 200 OK
{
  "userId": "uuid",
  "name": "John Doe",
  "email": "john@city.gov.in",
  "cityId": "bangalore",
  "role": "OPERATOR",
  "permissions": ["VIEW_REPORTS", "UPDATE_STATUS"],
  "lastActiveAt": "2026-02-06T11:45:00Z"
}
```

#### Analytics Endpoints

**GET /analytics/dashboard**
```javascript
// Get dashboard analytics
Query Parameters:
  cityId: string (required)
  startDate: ISO timestamp
  endDate: ISO timestamp

Response: 200 OK
{
  "summary": {
    "totalReports": 1523,
    "activeReports": 342,
    "resolvedReports": 1181,
    "averageResolutionTime": 14.5 // hours
  },
  "byCategory": {
    "ROAD": 523,
    "WATER": 412,
    "POWER": 298,
    "SAFETY": 156,
    "SANITATION": 134
  },
  "bySeverity": {
    "LOW": 612,
    "MEDIUM": 534,
    "HIGH": 298,
    "CRITICAL": 79
  },
  "trends": [
    { "date": "2026-02-01", "count": 45 },
    { "date": "2026-02-02", "count": 52 }
  ],
  "hotspots": [
    {
      "location": { "latitude": 12.34, "longitude": 56.78 },
      "reportCount": 23,
      "area": "Main Street"
    }
  ]
}
```

**GET /analytics/reports/trends**
```javascript
// Get report trends over time
Query Parameters:
  cityId: string
  groupBy: "hour | day | week | month"
  category: string (optional)

Response: 200 OK
{
  "trends": [
    {
      "period": "2026-02-01",
      "totalReports": 45,
      "byCategory": {
        "ROAD": 15,
        "WATER": 12,
        "POWER": 10,
        "SAFETY": 5,
        "SANITATION": 3
      }
    }
  ]
}
```

#### Geospatial Endpoints

**GET /geo/reports/nearby**
```javascript
// Find reports near location
Query Parameters:
  latitude: number
  longitude: number
  radius: number (meters, default: 1000)
  category: string (optional)
  status: string (optional)

Response: 200 OK
{
  "reports": [
    {
      "reportId": "uuid",
      "category": "ROAD",
      "description": "Pothole",
      "location": { "latitude": 12.34, "longitude": 56.78 },
      "distance": 245 // meters
    }
  ]
}
```

**POST /geo/geocode**
```javascript
// Convert address to coordinates
Request Body:
{
  "address": "Main Street, Bangalore",
  "cityId": "bangalore"
}

Response: 200 OK
{
  "latitude": 12.34,
  "longitude": 56.78,
  "formattedAddress": "Main Street, Bangalore, Karnataka 560001",
  "confidence": 0.95
}
```

### 7.2 WebSocket Events

**Connection**: `wss://api.nagaralerthub.in/ws`

**Authentication**: JWT token in query parameter or header

#### Client → Server Events

**subscribe**
```javascript
{
  "event": "subscribe",
  "data": {
    "cityId": "bangalore",
    "channels": ["reports", "alerts", "status-updates"]
  }
}
```

**unsubscribe**
```javascript
{
  "event": "unsubscribe",
  "data": {
    "channels": ["alerts"]
  }
}
```

#### Server → Client Events

**report:new**
```javascript
{
  "event": "report:new",
  "data": {
    "reportId": "uuid",
    "category": "ROAD",
    "severity": "MEDIUM",
    "location": { "latitude": 12.34, "longitude": 56.78 },
    "createdAt": "2026-02-06T12:00:00Z"
  }
}
```

**report:updated**
```javascript
{
  "event": "report:updated",
  "data": {
    "reportId": "uuid",
    "status": "IN_PROGRESS",
    "assignedTo": "authority-user-id",
    "updatedAt": "2026-02-06T12:30:00Z"
  }
}
```

**alert:broadcast**
```javascript
{
  "event": "alert:broadcast",
  "data": {
    "alertId": "uuid",
    "title": "Road Closure Alert",
    "severity": "HIGH",
    "recipientCount": 1523
  }
}
```


## 8. Authentication & Authorization

### 8.1 Amazon Cognito Configuration

**User Pools**:

1. **Authority User Pool**
   - Purpose: Authentication for dashboard users
   - MFA: Required for admin roles
   - Password Policy: Minimum 12 characters, complexity requirements
   - Account Recovery: Email and SMS
   - Custom Attributes: `cityId`, `department`, `role`

2. **Citizen User Pool** (Optional - for future mobile app)
   - Purpose: Optional authentication for citizens
   - MFA: Optional
   - Social Login: Google, Facebook
   - Phone Number Verification: Required

**Identity Pools**:
- Federated identities for temporary AWS credentials
- Role-based access to S3 for media uploads

### 8.2 Authentication Flow

#### Dashboard Login Flow

```
1. User enters email/password → Cognito User Pool
2. Cognito validates credentials
3. If MFA enabled → Send OTP → Verify OTP
4. Cognito returns tokens:
   - ID Token (user identity)
   - Access Token (API authorization)
   - Refresh Token (token renewal)
5. Frontend stores tokens in secure storage
6. Include Access Token in API requests (Authorization header)
7. API Gateway validates token with Cognito
8. Lambda receives decoded user claims
```

#### WhatsApp Authentication

```
1. Citizen sends message → WhatsApp webhook
2. Extract phone number from webhook payload
3. Hash phone number for privacy
4. Lookup or create user in Users table
5. No explicit authentication required (phone verified by WhatsApp)
6. Session maintained in Sessions table
```

### 8.3 Authorization Model

**Role-Based Access Control (RBAC)**:

**Roles**:

1. **VIEWER**
   - View reports and analytics
   - View alerts
   - No modification permissions

2. **OPERATOR**
   - All VIEWER permissions
   - Update report status
   - Assign reports to team members
   - Create alerts

3. **MANAGER**
   - All OPERATOR permissions
   - Verify/reject reports
   - Manage team members
   - Access advanced analytics
   - Export reports

4. **ADMIN**
   - All MANAGER permissions
   - Manage user accounts
   - Configure system settings
   - Access audit logs
   - Manage geofences and alert zones

**Permission Matrix**:

| Action | VIEWER | OPERATOR | MANAGER | ADMIN |
|--------|--------|----------|---------|-------|
| View Reports | ✓ | ✓ | ✓ | ✓ |
| Update Status | ✗ | ✓ | ✓ | ✓ |
| Verify Reports | ✗ | ✗ | ✓ | ✓ |
| Create Alerts | ✗ | ✓ | ✓ | ✓ |
| Manage Users | ✗ | ✗ | ✗ | ✓ |
| System Config | ✗ | ✗ | ✗ | ✓ |
| Audit Logs | ✗ | ✗ | ✗ | ✓ |

**City-Based Isolation**:
- Users can only access data for their assigned city
- Enforced at API Gateway level using JWT claims
- DynamoDB queries filtered by `cityId`

### 8.4 API Security

**JWT Token Validation**:
```javascript
// API Gateway Lambda Authorizer
async function authorize(event) {
  const token = event.headers.Authorization.replace('Bearer ', '');
  
  // Verify token with Cognito
  const decoded = await cognito.verifyToken(token);
  
  // Extract claims
  const userId = decoded.sub;
  const cityId = decoded['custom:cityId'];
  const role = decoded['custom:role'];
  const permissions = decoded['custom:permissions'];
  
  // Generate IAM policy
  return {
    principalId: userId,
    policyDocument: generatePolicy('Allow', event.methodArn),
    context: {
      userId,
      cityId,
      role,
      permissions
    }
  };
}
```

**Rate Limiting**:
- API Gateway throttling: 1000 requests/second per user
- Lambda concurrency limits per function
- DynamoDB adaptive capacity for burst traffic

**CORS Configuration**:
```javascript
{
  "allowOrigins": [
    "https://dashboard.nagaralerthub.in",
    "https://admin.nagaralerthub.in"
  ],
  "allowMethods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
  "allowHeaders": ["Content-Type", "Authorization"],
  "maxAge": 3600
}
```

## 9. Security Design

### 9.1 Data Security

**Encryption at Rest**:
- DynamoDB: AWS KMS encryption enabled
- S3: Server-side encryption (SSE-S3)
- RDS (if used): Encrypted storage volumes
- Secrets Manager: API keys and credentials

**Encryption in Transit**:
- TLS 1.3 for all API communications
- HTTPS only (HTTP redirects to HTTPS)
- Certificate management via AWS Certificate Manager

**Data Privacy**:
- Phone numbers hashed using SHA-256 with salt
- PII anonymized in analytics and exports
- GDPR-compliant data handling
- Right to deletion support

### 9.2 Application Security

**Input Validation**:
```javascript
// Example validation middleware
const validateReport = (req, res, next) => {
  const schema = Joi.object({
    category: Joi.string().valid('ROAD', 'WATER', 'POWER', 'SAFETY', 'SANITATION', 'OTHER').required(),
    description: Joi.string().min(10).max(1000).required(),
    location: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required()
    }).required()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
```

**SQL Injection Prevention**:
- DynamoDB (NoSQL) - not vulnerable to SQL injection
- Parameterized queries for any SQL databases
- Input sanitization for all user inputs

**XSS Prevention**:
- Content Security Policy (CSP) headers
- Input sanitization on frontend
- Output encoding for user-generated content
- React's built-in XSS protection

**CSRF Protection**:
- SameSite cookie attribute
- CSRF tokens for state-changing operations
- Origin validation

### 9.3 Infrastructure Security

**Network Security**:
- VPC with private subnets for Lambda functions
- Security groups restricting inbound/outbound traffic
- NAT Gateway for outbound internet access
- VPC endpoints for AWS services

**IAM Policies**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/Reports",
      "Condition": {
        "ForAllValues:StringEquals": {
          "dynamodb:LeadingKeys": ["${aws:userid}"]
        }
      }
    }
  ]
}
```

**Secrets Management**:
- AWS Secrets Manager for API keys
- Environment variables for configuration
- Automatic secret rotation
- No hardcoded credentials

**DDoS Protection**:
- AWS Shield Standard (automatic)
- AWS WAF rules for common attack patterns
- CloudFront for DDoS mitigation
- Rate limiting at API Gateway

### 9.4 Monitoring & Incident Response

**Security Monitoring**:
- CloudWatch Logs for all API requests
- AWS CloudTrail for AWS API calls
- GuardDuty for threat detection
- Security Hub for compliance monitoring

**Audit Logging**:
- All user actions logged to AuditLogs table
- Immutable audit trail
- Log retention for 7 years
- Regular audit log reviews

**Incident Response Plan**:
1. Detection: Automated alerts via CloudWatch
2. Containment: Isolate affected resources
3. Investigation: Analyze logs and traces
4. Remediation: Apply fixes and patches
5. Recovery: Restore from backups if needed
6. Post-Incident: Review and improve

## 10. Scalability Design

### 10.1 Horizontal Scaling

**Lambda Auto-Scaling**:
- Concurrent execution limit: 1000 per function
- Reserved concurrency for critical functions
- Provisioned concurrency for low-latency requirements
- Automatic scaling based on invocation rate

**DynamoDB Auto-Scaling**:
- On-demand capacity mode (default)
- Automatic scaling to handle traffic spikes
- No capacity planning required
- Pay per request pricing

**API Gateway Scaling**:
- Automatic scaling to handle any request volume
- Regional endpoints for low latency
- Throttling limits configurable per stage

### 10.2 Vertical Scaling

**Lambda Memory Allocation**:
- Message processing: 512 MB
- AI verification: 1024 MB
- Media processing: 2048 MB
- Adjust based on performance metrics

**Database Optimization**:
- Efficient GSI design for query patterns
- Composite sort keys for range queries
- Sparse indexes for optional attributes
- DynamoDB Accelerator (DAX) for caching

### 10.3 Caching Strategy

**CloudFront CDN**:
- Cache static assets (dashboard, images)
- Edge locations for global distribution
- TTL: 24 hours for media, 5 minutes for API responses

**Application-Level Caching**:
```javascript
// Redis/ElastiCache for session data
const cache = {
  // User sessions
  sessions: { ttl: 3600 }, // 1 hour
  
  // Report data
  reports: { ttl: 300 }, // 5 minutes
  
  // Analytics
  analytics: { ttl: 1800 }, // 30 minutes
  
  // Geospatial queries
  nearbyReports: { ttl: 600 } // 10 minutes
};
```

**DynamoDB DAX**:
- Microsecond latency for read-heavy workloads
- Cache frequently accessed reports
- Automatic cache invalidation

### 10.4 Load Distribution

**Geographic Distribution**:
- Multi-region deployment for disaster recovery
- Route 53 latency-based routing
- Regional S3 buckets for media storage

**Queue-Based Processing**:
```
High Priority Queue (Critical alerts)
    ↓
Medium Priority Queue (Standard reports)
    ↓
Low Priority Queue (Analytics, batch jobs)
```

**Batch Processing**:
- Aggregate analytics computed hourly
- Report exports generated asynchronously
- Media compression in background

### 10.5 Database Sharding

**City-Based Partitioning**:
- Each city can be isolated to separate tables if needed
- Partition key includes `cityId` for natural sharding
- Cross-city queries avoided in design

**Time-Based Partitioning**:
- Archive old reports to separate tables
- Hot data (last 30 days) in primary table
- Cold data in archive tables with lower throughput


## 11. Error Handling & Logging

### 11.1 Error Handling Strategy

**Error Categories**:

1. **Client Errors (4xx)**
   - 400 Bad Request: Invalid input
   - 401 Unauthorized: Missing/invalid token
   - 403 Forbidden: Insufficient permissions
   - 404 Not Found: Resource doesn't exist
   - 429 Too Many Requests: Rate limit exceeded

2. **Server Errors (5xx)**
   - 500 Internal Server Error: Unexpected error
   - 502 Bad Gateway: Upstream service failure
   - 503 Service Unavailable: Temporary outage
   - 504