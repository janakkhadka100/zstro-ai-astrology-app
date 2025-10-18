# ZSTRO AI Astrology Platform - Production Ready

<div align="center">

![ZSTRO Logo](https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=ZSTRO+AI)

**A comprehensive AI-powered astrology platform built with Next.js 15, featuring advanced Vedic astrology calculations, real-time chat consultations, and modern web technologies.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/zstro-astrology)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)

</div>

## 🌟 **Key Features**

### 🎯 **Cards-First Architecture**
- **Source of Truth**: Prokerala API data is the only authoritative source
- **No Hallucination**: LLM analysis strictly limited to provided data
- **Deterministic**: All calculations are reproducible and testable
- **Type Safety**: Full TypeScript coverage with strict typing

### 🔮 **Advanced Astrology**
- **Vedic Calculations**: Accurate planetary positions, house calculations, and divisional charts
- **Yoga & Dosha Detection**: Automated detection of astrological yogas and doshas
- **Dasha Systems**: Vimshottari and Yogini dasha calculations
- **Chart Visualization**: North Indian and South Indian chart styles
- **On-Demand Fetching**: Intelligent data requirement detection

### 🤖 **AI-Powered Analysis**
- **Enhanced Prompting**: Context-aware AI with DataNeeded detection
- **Bilingual Support**: Full Nepali and English language support
- **Evidence Cards**: Visual analysis from chin, palm, and document uploads
- **Real-time Chat**: ChatGPT-powered astrology consultations
- **Zero Hallucination**: Strict adherence to provided astrological data

### 🚀 **Modern Technology Stack**
- **Next.js 15**: React 18 with App Router
- **TypeScript**: Strict type safety throughout
- **Tailwind CSS**: Modern, responsive design
- **PostgreSQL**: Robust database with Drizzle ORM
- **Redis**: High-performance caching
- **Web Push**: Real-time notifications

### 🔒 **Enterprise Security**
- **Input Validation**: Comprehensive Zod schemas
- **Rate Limiting**: API protection and abuse prevention
- **File Security**: Upload scanning and metadata stripping
- **Data Privacy**: GDPR compliance and encryption
- **Authentication**: NextAuth.js with JWT encryption

### 📱 **User Experience**
- **Mobile-First**: Responsive design for all devices
- **Dark Mode**: Theme switching with system preference
- **Skeletons**: Loading states and error handling
- **Real-time Updates**: Live card updates via SSE
- **Export Options**: PDF, image, and text export

## 🏗️ **Architecture Overview**

```mermaid
graph TB
    A[User Interface] --> B[Next.js App Router]
    B --> C[API Routes]
    C --> D[Prokerala API]
    C --> E[OpenAI API]
    C --> F[PostgreSQL]
    C --> G[Redis Cache]
    
    H[File Uploads] --> I[Security Scanner]
    I --> J[Evidence Cards]
    J --> K[AI Analysis]
    
    L[Web Push] --> M[Notification Service]
    M --> N[User Subscriptions]
    
    O[Real-time Updates] --> P[SSE Stream]
    P --> Q[Redis Pub/Sub]
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (optional, for caching)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/zstro-astrology.git
   cd zstro-astrology
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/zstro_astrology"
   
   # Redis (optional)
   REDIS_URL="redis://localhost:6379"
   
   # API Keys
   OPENAI_API_KEY="your-openai-api-key"
   PROKERALA_API_KEY="your-prokerala-api-key"
   
   # VAPID Keys for Push Notifications
   VAPID_PUBLIC_KEY="your-vapid-public-key"
   VAPID_PRIVATE_KEY="your-vapid-private-key"
   
   # Feature Flags
   FF_DARK_MODE=1
   FF_SKELETONS=1
   FF_WS_REALTIME=1
   FF_EXPORT=1
   FF_HISTORY=1
   FF_NOTIFICATIONS=1
   FF_PWA=1
   ```

5. **Set up the database**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 **Documentation**

### Core Concepts

#### Cards-First Architecture
The platform uses a "cards-first" approach where all astrological data is presented as structured cards before any AI analysis. This ensures:

- **Data Integrity**: Only verified astrological data is used
- **No Hallucination**: AI cannot invent astrological facts
- **Transparency**: Users can see exactly what data is being analyzed
- **Reproducibility**: All calculations are deterministic and testable

#### On-Demand Data Fetching
The system intelligently detects what astrological data is needed for a specific question and fetches only the required information:

- **Efficiency**: Reduces API calls and costs
- **Speed**: Faster responses for simple questions
- **Accuracy**: Ensures all required data is available
- **User Experience**: Seamless data loading

#### Evidence Cards
Visual analysis from uploaded images and documents:

- **Chin Analysis**: Facial structure and features
- **Palm Reading**: Hand lines and mounts
- **Document Processing**: Scanned reports and certificates
- **OCR Integration**: Text extraction and analysis

### API Reference

#### Astrology Endpoints

##### `POST /api/astro/bootstrap`
Bootstrap astrological data from user profile.

**Request:**
```json
{
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
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "d1": [...],
    "divisionals": [...],
    "yogas": [...],
    "doshas": [...],
    "shadbala": [...],
    "dashas": [...]
  }
}
```

##### `POST /api/astro/fetch`
Fetch additional astrological data on-demand.

**Request:**
```json
{
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
}
```

##### `POST /api/astrology`
Get AI analysis of astrological data.

**Request:**
```json
{
  "question": "What is my career potential?",
  "lang": "ne",
  "includeCharts": true
}
```

**Response:**
```json
{
  "success": true,
  "answer": "तपाईंको करियर सम्भावना...",
  "dataNeeded": null,
  "confidence": 0.95
}
```

#### File Upload Endpoints

##### `POST /api/upload/secure`
Upload and scan files for evidence cards.

**Request:**
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('category', 'chin');
formData.append('scanForThreats', 'true');
formData.append('stripMetadata', 'true');
```

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "chin_1234567890_abc123.jpg",
    "originalName": "chin_photo.jpg",
    "size": 1024000,
    "type": "image/jpeg",
    "category": "chin",
    "scanResult": {
      "safe": true,
      "threats": [],
      "scanTime": 150
    }
  }
}
```

#### Notification Endpoints

##### `POST /api/notifications/subscribe`
Subscribe to push notifications.

**Request:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  },
  "language": "en"
}
```

##### `POST /api/notifications/send`
Send notifications (admin use).

**Request:**
```json
{
  "type": "analysis_ready",
  "title": "Analysis Ready",
  "body": "Your astrology analysis is complete",
  "data": {
    "analysisId": "123",
    "url": "/analysis/123"
  }
}
```

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT FALSE
);
```

#### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Snapshots Table
```sql
CREATE TABLE snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  astro_data JSONB NOT NULL,
  analysis_result TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 **Testing**

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:parity
npm run test:extract
npm run test:on-demand
npm run test:ai-enhanced

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Parity Tests**: 16/16 passing ✅
- **Extraction Tests**: 21/21 passing ✅
- **On-Demand Tests**: 22/22 passing ✅
- **AI Enhanced Tests**: 18/18 passing ✅
- **Jest Tests**: 71/71 passing ✅
- **Total**: 148/148 tests passing ✅

### Writing Tests

```typescript
// Example test for DataNeeded detection
describe('DataNeeded Detection', () => {
  it('should detect missing divisional chart requirements', () => {
    const question = 'नवांशमा शुक्र कहाँ छ?';
    const dataNeeded = detectDataNeeded(question, mockAstroData, 'ne');
    
    expect(dataNeeded).toBeDefined();
    expect(dataNeeded?.divisionals).toContain('D9');
  });
});
```

## 🚀 **Deployment**

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```

2. **Set environment variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add OPENAI_API_KEY
   vercel env add PROKERALA_API_KEY
   # ... add all required variables
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Docker

1. **Build the image**
   ```bash
   docker build -t zstro-astrology .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 \
     -e DATABASE_URL="postgresql://..." \
     -e OPENAI_API_KEY="..." \
     zstro-astrology
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🔧 **Configuration**

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `REDIS_URL` | Redis connection string | No | `redis://localhost:6379` |
| `OPENAI_API_KEY` | OpenAI API key | Yes | - |
| `PROKERALA_API_KEY` | Prokerala API key | Yes | - |
| `VAPID_PUBLIC_KEY` | VAPID public key for push notifications | No | - |
| `VAPID_PRIVATE_KEY` | VAPID private key for push notifications | No | - |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes | - |
| `NEXTAUTH_URL` | NextAuth.js URL | Yes | - |

### Feature Flags

| Flag | Description | Default |
|------|-------------|---------|
| `FF_DARK_MODE` | Enable dark mode | `1` |
| `FF_SKELETONS` | Enable loading skeletons | `1` |
| `FF_WS_REALTIME` | Enable real-time updates | `1` |
| `FF_EXPORT` | Enable export functionality | `1` |
| `FF_HISTORY` | Enable history management | `1` |
| `FF_NOTIFICATIONS` | Enable push notifications | `1` |
| `FF_PWA` | Enable PWA features | `0` |

## 📊 **Performance**

### Optimization Features

- **Redis Caching**: 15-30 minute cache for expensive calculations
- **Image Optimization**: Next.js Image component with WebP support
- **Bundle Splitting**: Automatic code splitting for optimal loading
- **CDN Integration**: Global content delivery
- **Database Indexing**: Optimized queries for fast responses

### Monitoring

- **Performance Metrics**: Core Web Vitals tracking
- **Error Monitoring**: Comprehensive error tracking
- **Usage Analytics**: User behavior and feature usage
- **Health Checks**: Application and service monitoring

## 🔒 **Security**

### Security Features

- **Input Validation**: Zod schemas for all API endpoints
- **Rate Limiting**: Redis-based rate limiting
- **File Security**: Upload scanning and metadata stripping
- **Data Privacy**: GDPR compliance and encryption
- **Authentication**: Secure session management
- **Headers**: Security headers for all responses

### Security Headers

```typescript
const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

## 🌍 **Internationalization**

### Supported Languages

- **English**: Full support
- **Nepali**: Complete translation

### Adding New Languages

1. **Add language to type definition**
   ```typescript
   export type Lang = "ne" | "en" | "hi";
   ```

2. **Add translations**
   ```typescript
   const strings = {
     en: { ... },
     ne: { ... },
     hi: { ... }
   };
   ```

3. **Update components**
   ```typescript
   const { getString } = useI18n('hi');
   ```

## 🤝 **Contributing**

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Write tests**
5. **Run tests**
   ```bash
   npm test
   ```
6. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for Next.js
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Pull Request Process

1. **Update documentation** for any new features
2. **Add tests** for new functionality
3. **Ensure all tests pass**
4. **Update version numbers** if needed
5. **Request review** from maintainers

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

### Documentation
- [Quick Start Guide](docs/01-quick-start.md)
- [Model Updates](docs/02-update-models.md)
- [Artifacts](docs/03-artifacts.md)
- [Architecture](docs/architecture.md)

### Community
- **GitHub Issues**: [Report bugs and request features](https://github.com/your-org/zstro-astrology/issues)
- **Discussions**: [Community discussions](https://github.com/your-org/zstro-astrology/discussions)

### Contact
- **Email**: support@zstro.ai
- **Website**: https://zstro.ai

## 🙏 **Acknowledgments**

- [Prokerala API](https://www.prokerala.com/) for astrology calculations
- [OpenAI](https://openai.com/) for AI capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Vercel](https://vercel.com/) for deployment platform
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📈 **Roadmap**

### Phase 1: Core Platform ✅
- [x] Basic astrology calculations
- [x] User authentication
- [x] Payment integration
- [x] AI chat interface

### Phase 2: Advanced Features ✅
- [x] Enhanced security
- [x] Data privacy compliance
- [x] Performance optimization
- [x] Mobile optimization

### Phase 3: Future Enhancements
- [ ] Mobile app (React Native)
- [ ] Advanced chart visualizations
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Machine learning for personalized insights

---

<div align="center">

**Built with ❤️ for the astrology community**

[![GitHub stars](https://img.shields.io/github/stars/your-org/zstro-astrology?style=social)](https://github.com/your-org/zstro-astrology)
[![GitHub forks](https://img.shields.io/github/forks/your-org/zstro-astrology?style=social)](https://github.com/your-org/zstro-astrology/fork)
[![Twitter Follow](https://img.shields.io/twitter/follow/zstro_ai?style=social)](https://twitter.com/zstro_ai)

</div>
