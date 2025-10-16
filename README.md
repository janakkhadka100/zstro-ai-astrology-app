# ZSTRO AI Astrology Platform

A comprehensive AI-powered astrology platform built with Next.js 15, featuring advanced Vedic astrology calculations, real-time chat consultations, and modern web technologies.

## 🌟 Features

### Core Astrology Features
- **Advanced Vedic Calculations**: Accurate planetary positions, house calculations, and divisional charts
- **Yoga & Dosha Detection**: Automated detection of astrological yogas and doshas
- **Dasha Systems**: Vimshottari and Yogini dasha calculations
- **Chart Visualization**: North Indian and South Indian chart styles
- **Real-time AI Consultations**: ChatGPT-powered astrology readings

### Technical Features
- **Modern Stack**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis for performance optimization
- **Authentication**: NextAuth.js with JWT encryption
- **Rate Limiting**: API protection and abuse prevention
- **Security**: Data privacy compliance, input validation, encryption

### Business Features
- **Payment Integration**: Khalti, eSewa, ConnectIPS, and international payments
- **Coin System**: Freemium model with credit-based usage
- **Subscription Management**: Multiple pricing tiers
- **Data Export**: GDPR-compliant data export and deletion

## 🚀 Quick Start

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

## 🚀 Deploy to Vercel

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/zstro-astrology)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Link to Vercel project**
   ```bash
   npm run vercel:link
   ```

3. **Set up environment variables**
   ```bash
   # Generate secrets
   npx tsx scripts/gen-secrets.ts
   
   # Add to Vercel (Preview & Production)
   vercel env add
   ```

4. **Deploy to Preview (Development-like)**
   ```bash
   npm run vercel:deploy
   ```

5. **Deploy to Production**
   ```bash
   npm run vercel:prod
   ```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXTAUTH_SECRET` - Generate with `npx tsx scripts/gen-secrets.ts`
- `OPENAI_API_KEY` - Your OpenAI API key
- `PROKERALA_API_KEY` - Your Pokhrel API key
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (optional)

### Vercel Configuration

The project includes `vercel.json` with optimized settings:
- Next.js framework detection
- API function configuration
- Security headers
- Caching rules
- Memory optimization

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in the required environment variables:
   ```env
   # Database
   POSTGRES_URL="postgresql://username:password@localhost:5432/zstro_astrology"
   DATABASE_URL="postgresql://username:password@localhost:5432/zstro_astrology"
   
   # Authentication
   AUTH_SECRET="your-auth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OpenAI
   OPENAI_API_KEY="your-openai-api-key-here"
   
   # Prokerala API
   PROKERALA_API_KEY="your-prokerala-api-key-here"
   PROKERALA_API_SECRET="your-prokerala-api-secret-here"
   
   # Redis (optional)
   REDIS_URL="redis://localhost:6379"
   
   # Payment Gateways
   KHALTI_SECRET_KEY="your-khalti-secret-key"
   KHALTI_PUBLIC_KEY="your-khalti-public-key"
   ESEWA_MERCHANT_ID="your-esewa-merchant-id"
   ESEWA_SECRET_KEY="your-esewa-secret-key"
   ```

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
zstro-astrology/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (chat)/            # Chat and astrology pages
│   ├── api/               # API routes
│   └── dashboard/         # Admin dashboard
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── lib/                  # Core library code
│   ├── ai/               # AI and astrology calculations
│   ├── astro/            # Astrology logic
│   ├── db/               # Database schema and queries
│   ├── services/         # Business logic services
│   └── config/           # Configuration files
├── public/               # Static assets
└── docs/                 # Documentation
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | NextAuth.js secret key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for ChatGPT | Yes |
| `PROKERALA_API_KEY` | Prokerala astrology API key | Yes |
| `REDIS_URL` | Redis connection string | No |
| `KHALTI_SECRET_KEY` | Khalti payment gateway key | No |

### Database Schema

The application uses PostgreSQL with the following main tables:
- `User` - User accounts and birth data
- `Chat` - Chat sessions
- `Message` - Chat messages
- `AstrologicalData` - Cached astrology calculations
- `Payment` - Payment transactions
- `Subscription` - User subscriptions

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User sign out

### Astrology
- `POST /api/astrology` - Get astrology reading
- `GET /api/astrology` - Health check

### Payments
- `POST /api/khalti/initiate` - Initiate Khalti payment
- `POST /api/khalti/verify` - Verify Khalti payment
- `POST /api/esewa/initiate` - Initiate eSewa payment
- `POST /api/esewa/verify` - Verify eSewa payment

### Privacy
- `GET /api/privacy` - Get privacy policy
- `POST /api/privacy` - Export/delete user data

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker
```bash
# Build image
docker build -t zstro-astrology .

# Run container
docker run -p 3000:3000 zstro-astrology
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Monitoring

### Logging
- Application logs are written to console and external services
- Log levels: ERROR, WARN, INFO, DEBUG
- Structured logging with context and request IDs

### Performance
- Redis caching for expensive calculations
- Database query optimization
- CDN for static assets
- Rate limiting for API protection

### Health Checks
- `GET /api/health` - Application health
- `GET /api/health/db` - Database connectivity
- `GET /api/health/redis` - Redis connectivity

## 🔒 Security

### Data Protection
- JWT token encryption
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Privacy Compliance
- GDPR-compliant data export
- Automatic data retention policies
- User data anonymization
- Privacy policy and consent management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow the existing code style
- Use conventional commits

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Quick Start Guide](docs/01-quick-start.md)
- [Model Updates](docs/02-update-models.md)
- [Artifacts](docs/03-artifacts.md)

### Community
- GitHub Issues: [Report bugs and request features](https://github.com/your-org/zstro-astrology/issues)
- Discussions: [Community discussions](https://github.com/your-org/zstro-astrology/discussions)

### Contact
- Email: support@zstro.ai
- Website: https://zstro.ai

## 🙏 Acknowledgments

- [Prokerala API](https://www.prokerala.com/) for astrology calculations
- [OpenAI](https://openai.com/) for AI capabilities
- [Next.js](https://nextjs.org/) for the React framework
- [Vercel](https://vercel.com/) for deployment platform
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components

## 📈 Roadmap

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

**Built with ❤️ for the astrology community**