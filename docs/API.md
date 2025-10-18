# API Documentation

## Overview

The ZSTRO AI Astrology Platform provides a comprehensive REST API for astrology calculations, AI analysis, file uploads, and real-time features.

## Base URL

```
Production: https://zstro.ai/api
Development: http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via NextAuth.js session cookies.

```typescript
// Example: Include session cookie in requests
const response = await fetch('/api/astro/bootstrap', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'next-auth.session-token=your-session-token'
  },
  body: JSON.stringify(data)
});
```

## Rate Limiting

API endpoints are protected by rate limiting:

- **General API**: 100 requests per minute per IP
- **User Actions**: 50 requests per minute per user
- **Analysis**: 3 analyses per 5 minutes per user
- **Uploads**: 10 uploads per hour per user
- **Export**: 5 exports per hour per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:00:00Z
```

## Error Handling

All API endpoints return consistent error responses:

```typescript
interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  details?: any;
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Astrology Endpoints

### Bootstrap Data

**POST** `/api/astro/bootstrap`

Initialize astrological data from user profile without external API calls.

**Request Body:**
```typescript
interface BootstrapRequest {
  profile: {
    birthDate: string; // YYYY-MM-DD
    birthTime: string; // HH:MM
    birthPlace: {
      name: string;
      latitude: number;
      longitude: number;
      timezone: {
        id: string;
        offset: number;
      };
    };
    timezone: {
      id: string;
      offset: number;
    };
  };
  lang: 'ne' | 'en';
}
```

**Response:**
```typescript
interface BootstrapResponse {
  success: true;
  data: AstroData;
}
```

**Example:**
```bash
curl -X POST https://zstro.ai/api/astro/bootstrap \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "birthDate": "1990-01-01",
      "birthTime": "12:00",
      "birthPlace": {
        "name": "Kathmandu",
        "latitude": 27.7172,
        "longitude": 85.3240,
        "timezone": {
          "id": "Asia/Kathmandu",
          "offset": 5.75
        }
      },
      "timezone": {
        "id": "Asia/Kathmandu",
        "offset": 5.75
      }
    },
    "lang": "en"
  }'
```

### Fetch Additional Data

**POST** `/api/astro/fetch`

Fetch specific astrological data on-demand based on user questions.

**Request Body:**
```typescript
interface FetchRequest {
  profile: Profile;
  plan: Array<{
    kind: string;
    levels?: string[];
    list?: string[];
    detail?: boolean;
  }>;
  lang: 'ne' | 'en';
}
```

**Response:**
```typescript
interface FetchResponse {
  success: true;
  patch: AstroPatch;
}
```

**Example:**
```bash
curl -X POST https://zstro.ai/api/astro/fetch \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {...},
    "plan": [
      {
        "kind": "divisionals",
        "levels": ["D9", "D10"]
      },
      {
        "kind": "shadbala",
        "detail": true
      }
    ],
    "lang": "en"
  }'
```

### AI Analysis

**POST** `/api/astrology`

Get AI-powered analysis of astrological data.

**Request Body:**
```typescript
interface AnalysisRequest {
  name?: string;
  gender?: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timezone?: string;
  question: string;
  language?: 'ne' | 'en';
}
```

**Response:**
```typescript
interface AnalysisResponse {
  success: true;
  answer: string;
  dataNeeded?: DataNeeded;
  confidence?: number;
  astroData: AstrologyData;
  yogas: YogaItem[];
  doshas: DoshaItem[];
  divSupport?: string[];
}
```

**Example:**
```bash
curl -X POST https://zstro.ai/api/astrology \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Kathmandu",
    "question": "What is my career potential?",
    "language": "ne"
  }'
```

## File Upload Endpoints

### Secure Upload

**POST** `/api/upload/secure`

Upload and scan files for evidence cards with security validation.

**Request Body:**
```typescript
// FormData
const formData = new FormData();
formData.append('file', file);
formData.append('category', 'chin' | 'palm' | 'document');
formData.append('scanForThreats', 'true' | 'false');
formData.append('stripMetadata', 'true' | 'false');
```

**Response:**
```typescript
interface UploadResponse {
  success: true;
  data: {
    filename: string;
    originalName: string;
    size: number;
    type: string;
    category: string;
    uploadedAt: string;
    scanResult?: {
      safe: boolean;
      threats: string[];
      scanTime: number;
    };
    metadata: {
      stripped: boolean;
      scanned: boolean;
    };
  };
}
```

**Example:**
```bash
curl -X POST https://zstro.ai/api/upload/secure \
  -F "file=@chin_photo.jpg" \
  -F "category=chin" \
  -F "scanForThreats=true" \
  -F "stripMetadata=true"
```

## Export Endpoints

### PDF Export

**POST** `/api/export/pdf`

Generate PDF report of astrology analysis.

**Request Body:**
```typescript
interface ExportRequest {
  sessionId?: string;
  analysis: string;
  cards: AstroData;
  title?: string;
  lang: 'ne' | 'en';
  includeCharts?: boolean;
  includeSnapshots?: boolean;
}
```

**Response:**
```typescript
// Returns PDF file with appropriate headers
Content-Type: application/pdf
Content-Disposition: attachment; filename="analysis.pdf"
```

**Example:**
```bash
curl -X POST https://zstro.ai/api/export/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "analysis": "Your astrology analysis...",
    "cards": {...},
    "title": "My Astrology Report",
    "lang": "en",
    "includeCharts": true
  }' \
  --output analysis.pdf
```

## Notification Endpoints

### Subscribe to Notifications

**POST** `/api/notifications/subscribe`

Subscribe to push notifications.

**Request Body:**
```typescript
interface SubscriptionRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  language?: 'ne' | 'en';
}
```

**Response:**
```typescript
interface SubscriptionResponse {
  success: true;
  message: string;
  vapidPublicKey: string;
}
```

### Unsubscribe from Notifications

**DELETE** `/api/notifications/subscribe?endpoint={endpoint}`

Unsubscribe from push notifications.

**Response:**
```typescript
interface UnsubscribeResponse {
  success: true;
  message: string;
}
```

### Send Notifications (Admin)

**POST** `/api/notifications/send`

Send notifications to users (admin/internal use).

**Request Body:**
```typescript
interface SendNotificationRequest {
  type: 'analysis_ready' | 'new_message' | 'maintenance' | 'promotional' | 'custom';
  userId?: string;
  title: string;
  body: string;
  icon?: string;
  data?: any;
  language?: 'ne' | 'en';
}
```

**Response:**
```typescript
interface SendNotificationResponse {
  success: true;
  message: string;
  stats: {
    sent: number;
    failed: number;
    total: number;
  };
}
```

### Get VAPID Public Key

**GET** `/api/notifications/vapid-key`

Get VAPID public key for client-side push subscription.

**Response:**
```typescript
interface VapidKeyResponse {
  publicKey: string;
}
```

## History Endpoints

### Get User Sessions

**GET** `/api/history`

Get all chat sessions for the authenticated user.

**Response:**
```typescript
interface SessionsResponse {
  success: true;
  data: Array<{
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    isArchived: boolean;
  }>;
}
```

### Get Session Details

**GET** `/api/history/{id}`

Get detailed information about a specific session.

**Response:**
```typescript
interface SessionResponse {
  success: true;
  data: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    isArchived: boolean;
    messages: Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      createdAt: string;
    }>;
    snapshot?: {
      id: string;
      astroData: AstroData;
      analysisResult?: string;
      createdAt: string;
    };
  };
}
```

### Create New Session

**POST** `/api/history`

Create a new chat session.

**Request Body:**
```typescript
interface CreateSessionRequest {
  title: string;
}
```

**Response:**
```typescript
interface CreateSessionResponse {
  success: true;
  data: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    isArchived: boolean;
  };
}
```

### Update Session

**PUT** `/api/history/{id}`

Update session title or archive status.

**Request Body:**
```typescript
interface UpdateSessionRequest {
  title?: string;
  isArchived?: boolean;
}
```

### Delete Session

**DELETE** `/api/history/{id}`

Delete a session and all associated data.

**Response:**
```typescript
interface DeleteSessionResponse {
  success: true;
  message: string;
}
```

## Real-time Endpoints

### SSE Stream

**GET** `/api/realtime/stream?u={userId}`

Server-Sent Events stream for real-time updates.

**Headers:**
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event Format:**
```typescript
// Connection established
data: {"type": "connected"}

// Card updates
data: {"type": "cards-patch", "patch": {...}}

// Keep-alive ping
data: ping
```

**Example:**
```javascript
const eventSource = new EventSource('/api/realtime/stream?u=user123');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'cards-patch') {
    // Update UI with new card data
    updateCards(data.patch);
  }
};
```

## Data Types

### Core Types

```typescript
interface AstroData {
  d1: D1PlanetRow[];
  divisionals: DivisionalBlock[];
  yogas: YogaItem[];
  doshas: DoshaItem[];
  shadbala: ShadbalaRow[];
  dashas: DashaItem[];
  transits: TransitItem[];
  aspects: AspectItem[];
  houses: HouseItem[];
  nakshatras: NakshatraItem[];
  profile: Profile;
  provenance: {
    account: boolean;
    prokerala: string[];
  };
}

interface Profile {
  birthDate: string;
  birthTime: string;
  birthPlace: {
    name: string;
    latitude: number;
    longitude: number;
    timezone: {
      id: string;
      offset: number;
    };
  };
  timezone: {
    id: string;
    offset: number;
  };
}

interface DataNeeded {
  divisionals: string[];
  shadbala: boolean;
  dashas: boolean;
  yogas: boolean;
  doshas: boolean;
  transits: boolean;
  aspects: boolean;
  houses: boolean;
  nakshatras: boolean;
}
```

### Planet and Chart Types

```typescript
interface D1PlanetRow {
  planet: PlanetName;
  signId: number;
  signLabel: string;
  house: number;
  retro: boolean;
}

interface DivisionalBlock {
  chart: string;
  planets: DivisionalPlanetRow[];
}

interface YogaItem {
  label: string;
  factors: string[];
  type: 'benefic' | 'malefic' | 'neutral';
}

interface DoshaItem {
  label: string;
  factors: string[];
  type: 'benefic' | 'malefic' | 'neutral';
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
class ZstroAPI {
  constructor(private baseURL: string, private sessionToken: string) {}

  async bootstrap(profile: Profile, lang: 'ne' | 'en' = 'en') {
    const response = await fetch(`${this.baseURL}/api/astro/bootstrap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `next-auth.session-token=${this.sessionToken}`
      },
      body: JSON.stringify({ profile, lang })
    });
    
    return response.json();
  }

  async analyze(question: string, profile: Profile, lang: 'ne' | 'en' = 'en') {
    const response = await fetch(`${this.baseURL}/api/astrology`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `next-auth.session-token=${this.sessionToken}`
      },
      body: JSON.stringify({
        question,
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthPlace: profile.birthPlace.name,
        language: lang
      })
    });
    
    return response.json();
  }

  async uploadFile(file: File, category: 'chin' | 'palm' | 'document') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('scanForThreats', 'true');
    formData.append('stripMetadata', 'true');

    const response = await fetch(`${this.baseURL}/api/upload/secure`, {
      method: 'POST',
      headers: {
        'Cookie': `next-auth.session-token=${this.sessionToken}`
      },
      body: formData
    });
    
    return response.json();
  }
}

// Usage
const api = new ZstroAPI('https://zstro.ai', 'your-session-token');

const profile = {
  birthDate: '1990-01-01',
  birthTime: '12:00',
  birthPlace: {
    name: 'Kathmandu',
    latitude: 27.7172,
    longitude: 85.3240,
    timezone: { id: 'Asia/Kathmandu', offset: 5.75 }
  },
  timezone: { id: 'Asia/Kathmandu', offset: 5.75 }
};

// Bootstrap data
const astroData = await api.bootstrap(profile, 'en');

// Get analysis
const analysis = await api.analyze('What is my career potential?', profile, 'ne');

// Upload file
const file = document.getElementById('fileInput').files[0];
const uploadResult = await api.uploadFile(file, 'chin');
```

### Python

```python
import requests
import json

class ZstroAPI:
    def __init__(self, base_url: str, session_token: str):
        self.base_url = base_url
        self.session_token = session_token
        self.headers = {
            'Content-Type': 'application/json',
            'Cookie': f'next-auth.session-token={session_token}'
        }

    def bootstrap(self, profile: dict, lang: str = 'en'):
        response = requests.post(
            f'{self.base_url}/api/astro/bootstrap',
            headers=self.headers,
            json={'profile': profile, 'lang': lang}
        )
        return response.json()

    def analyze(self, question: str, profile: dict, lang: str = 'en'):
        data = {
            'question': question,
            'birthDate': profile['birthDate'],
            'birthTime': profile['birthTime'],
            'birthPlace': profile['birthPlace']['name'],
            'language': lang
        }
        response = requests.post(
            f'{self.base_url}/api/astrology',
            headers=self.headers,
            json=data
        )
        return response.json()

# Usage
api = ZstroAPI('https://zstro.ai', 'your-session-token')

profile = {
    'birthDate': '1990-01-01',
    'birthTime': '12:00',
    'birthPlace': {
        'name': 'Kathmandu',
        'latitude': 27.7172,
        'longitude': 85.3240,
        'timezone': {'id': 'Asia/Kathmandu', 'offset': 5.75}
    },
    'timezone': {'id': 'Asia/Kathmandu', 'offset': 5.75}
}

# Bootstrap data
astro_data = api.bootstrap(profile, 'en')

# Get analysis
analysis = api.analyze('What is my career potential?', profile, 'ne')
```

## Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `INVALID_PROFILE` | Invalid birth data provided | Check date/time format and place coordinates |
| `MISSING_DATA` | Required astrological data not available | Use fetch endpoint to get additional data |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Wait and retry after rate limit resets |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit | Compress file or use smaller file |
| `INVALID_FILE_TYPE` | Unsupported file format | Use supported formats (JPEG, PNG, PDF) |
| `SCAN_FAILED` | File security scan failed | Try different file or contact support |
| `SUBSCRIPTION_FAILED` | Push notification subscription failed | Check VAPID keys and browser support |

## Best Practices

### Performance
- Use bootstrap endpoint for initial data loading
- Only fetch additional data when needed
- Cache responses on client side
- Use appropriate image sizes for uploads

### Security
- Always validate input on client side
- Use HTTPS in production
- Implement proper error handling
- Don't expose sensitive data in error messages

### Error Handling
- Check response status codes
- Handle network errors gracefully
- Implement retry logic for transient failures
- Log errors for debugging

### Rate Limiting
- Monitor rate limit headers
- Implement exponential backoff
- Cache frequently accessed data
- Use bulk operations when possible
