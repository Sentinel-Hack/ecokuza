# 🌍 Ecokuza - Kenya's National Digital Tree-Monitoring & Reward System

> **Digitize, Monitor, and Motivate Tree-Planting Activities in Kenyan Schools Through 4K Clubs**

## 📌 In One Sentence

EcoKuza is a national digital tree-monitoring and reward system that helps Kenyan schools grow more trees successfully — and gives NGOs trusted, verifiable data for impact.

## 🎯 Executive Summary

Ecokuza is a comprehensive blockchain-enabled platform designed to revolutionize forest conservation in Kenya by empowering schools and their 4K Clubs. By combining Django backend infrastructure with Solidity smart contracts, Ecokuza enables:

- **Teachers & Club Mentors** to record, photograph, and track trees planted with automatic GPS
- **Monitor growth and survival** with AI-powered authenticity validation
- **Log care activities** (watering, pruning, pest control) and earn points and badges
- **NGOs, Foundations & Government** to validate activities and access real-time, transparent impact data
- **Store all data immutably** on the blockchain using IPFS for trusted verification
- **Reward and identify** high-performing clubs across the country

The platform bridges the gap between grassroots environmental action and institutional verification, ensuring transparency, accountability, and verifiable impact across Kenyan schools.

---

## 📊 Table of Contents

1. [Key Features](#key-features)
2. [System Architecture](#system-architecture)
3. [Quick Start](#quick-start)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Core Components](#core-components)
7. [Blockchain Integration](#blockchain-integration)
8. [API Documentation](#api-documentation)
9. [Installation & Setup](#installation--setup)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Contributing](#contributing)
13. [Video Demo](#video-demo)
14. [Pitch Deck](#pitch-deck)
15. [Roadmap](#roadmap)
16. [Team & Support](#team--support)

---

## ✨ Key Features

### 🌱 Tree Planting & Tracking (For Teachers/Mentors)
- **GPS-tagged recording**: Automatic location capture from mobile devices
- **Photo verification**: Upload images with automatic EXIF extraction
- **Species documentation**: Support for Kenyan tree types (Acacia, Mango, Neem, etc.)
- **Growth monitoring**: Seasonal height and health tracking
- **Care logging**: Record activities (watering, pruning, pest control, fertilizing)

### 🤖 AI-Powered Verification
- **Groq AI Analysis**: Automated image authenticity scoring (0-100)
- **Health assessment**: Evaluate tree condition (Healthy/Good/Fair/Poor)
- **GPS validation**: Verify locations are appropriate for tree species
- **Real-time feedback**: Instant analysis and suggestions for care
- **Fraud prevention**: Detect duplicate or manipulated submissions

### 🏆 Gamification System (Motivation for Teachers & Clubs)
- **Points system**: Earn rewards for verified activities
- **Badges and certifications**: Unlock achievements at milestones
- **Leaderboards**: Compete with other clubs locally and nationally
- **Multi-tier system**: Bronze, Silver, Gold, Platinum levels
- **Public recognition**: Showcase top-performing schools and mentors

### 🔗 Blockchain Integration (Trust for NGOs & Partners)
- **Immutable records**: All verified data stored on-chain permanently
- **IPFS storage**: Decentralized photo storage with cryptographic hashing
- **Signature verification**: ECDSA-signed transactions prevent tampering
- **Event logging**: Real-time blockchain events for audit trails
- **Multi-network support**: Deploy to Polygon or local networks

### 📊 Analytics & Reporting (For NGO & Government Partners)
- **National dashboard**: Real-time map and statistics
- **Club performance**: Identify high-performing schools
- **Impact metrics**: Survival rates, species diversity, regional breakdown
- **Transparency reports**: Verified data for donors and stakeholders
- **Customizable reports**: Export data for government and NGO partners

### 📱 Mobile-First Design (For Teachers in the Field)
- **React frontend**: Responsive interface for mobile and desktop
- **Offline support**: Sync data when connectivity returns
- **Low bandwidth**: Optimized for 3G/4G in rural areas
- **Simple UX**: Designed for non-technical users
- **Multi-language**: Support for English and Swahili

### 👥 Club Management (For School Leadership)
- **Multi-user collaboration**: Organize teams within each 4K Club
- **Role-based access**: Different permissions for members and verifiers
- **Activity tracking**: Monitor all club activities and contributions
- **Impact metrics**: View aggregated environmental statistics
- **Inter-school competitions**: National rankings and challenges

---

## 🏗️ System Architecture

```
TEACHERS & 4K CLUB MENTORS              NGOs, FOUNDATIONS & GOVERNMENT
(Field Level - Tree Planting)           (Institutional Level - Validation)
         │                                           │
         └─────────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
    ┌────▼──────────────────────────────────▼───┐
    │       FRONTEND (React - Mobile First)      │
    │  ┌──────────────────────────────────────┐  │
    │  │ Mobile App  │  Mentor Dashboard      │  │
    │  │ Tree Forms  │  NGO Dashboard         │  │
    │  │ Leaderboard │  Admin Verification   │  │
    │  │ My Stats    │  Reports & Analytics  │  │
    │  └──────────────────────────────────────┘  │
    └────┬──────────────────────────────────────┬┘
         │                                       │
         │         API Gateway (Django REST)    │
         │                                       │
    ┌────▼──────────────────────────────────────▼───┐
    │        BACKEND (Django + DRF)                 │
    │  ┌──────────────────────────────────────────┐ │
    │  │  Users   │  Trees  │  Points │ Activities │ │
    │  │  Clubs   │  Verification │ Notifications  │ │
    │  └──────────────────────────────────────────┘ │
    │  ┌──────────────────────────────────────────┐ │
    │  │  AI Analysis  │  Groq Service            │ │
    │  │  Image Uploads│  EXIF Parsing            │ │
    │  └──────────────────────────────────────────┘ │
    │  ┌──────────────────────────────────────────┐ │
    │  │  Signals → BlockchainService → Signs    │ │
    │  │  & Submits Data with IPFS Hashes        │ │
    │  └──────────────────────────────────────────┘ │
    └────┬──────────────────────────────────────────┬┘
         │                                       │
         │      Web3 RPC Connection              │
         │      (Polygon Mumbai / Mainnet)       │
         │                                       │
    ┌────▼──────────────────────────────────────▼───┐
    │   BLOCKCHAIN (Solidity Smart Contracts)      │
    │  ┌──────────────────────────────────────────┐ │
    │  │  CertificateData      (On-chain storage) │ │
    │  │  APIBridge            (Data validation)  │ │
    │  │  OffchainDataHandler  (IPFS management)  │ │
    │  └──────────────────────────────────────────┘ │
    │  ┌──────────────────────────────────────────┐ │
    │  │  SentinelClubs   │ PointsEngine        │ │
    │  │  ImpactCertificate (NFTs)              │ │
    │  └──────────────────────────────────────────┘ │
    └────┬──────────────────────────────────────────┬┘
         │                                       │
         │   IPFS & Decentralized Storage        │
         │   (Photos, Metadata)                  │
         │                                       │
         └─────────────────────────────────────┘
```

### Data Flow: Teacher Plants Tree → NGO Verifies → Blockchain Records

```
TEACHER/MENTOR                          BACKEND                     BLOCKCHAIN
───────────                             ───────                     ──────────

1. Opens app
2. Plant Tree form
   ├─ Species
   ├─ GPS capture
   ├─ Photo upload
   └─ Care activity log
                                   ▶ Stores TreeRecord
                                   ▶ Extract EXIF
                                   ▶ Trigger Groq AI
                                   ▶ Score authenticity

3. Views AI results
   └─ Sees score & suggestion


ADMIN/VERIFIER (NGO)
────────────────────

4. Verification queue
5. Reviews photo
6. Approves/Rejects
                                   ▶ Signal fires
                                   ▶ Upload photo to IPFS
                                   ▶ Sign data with backend key
                                   ▶ Send to APIBridge
                                                           ▶ Validate signature
                                                           ▶ Store in CertificateData
                                                           ▶ Record TreeUpdate
                                                           ▶ Update UserImpact
                                                           ▶ Emit events

7. Confirmation
   ├─ Points awarded
   ├─ Badge unlocked
   └─ Leaderboard updated                                ▶ Data immutable on-chain
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL or SQLite
- Git

### 5-Minute Setup

```bash
# 1. Clone repository
git clone https://github.com/Sentinel-Hack/ecokuza.git
cd ecokuza

# 2. Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 3. Frontend setup (in new terminal)
cd frontend
npm install
npm run dev

# 4. Access application
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
# Admin: http://localhost:8000/admin
```

### First Actions
1. Create a superuser: `python manage.py createsuperuser`
2. Log in to admin panel
3. Create a certification threshold
4. Plant your first tree!

---

## 👥 Who Is EcoKuza For?

### 🌱 For 4K Club Mentors (Teachers)

EcoKuza provides a simple, mobile-friendly app to:

- **Record trees planted** - GPS-tagged at exact location
- **Upload photos** - Automatic geo-location from device
- **Track growth and survival** - Seasonal monitoring and updates
- **Log care activities** - Watering, pruning, pest control, fertilizing
- **View points and badges** - Gamified rewards for activities
- **Check leaderboards** - See how your club ranks nationally
- **Get AI insights** - Recommendations for better tree care

**User Flow:**
```
Plant Tree → Photo Upload → AI Verification → Points Earned → Badges/Leaderboard
```

### 🌍 For NGOs, Foundations, Partners & Government

EcoKuza provides a powerful dashboard to:

- **Validate tree-planting activities** - Verify each record with blockchain confirmation
- **See real-time progress** - Across all schools and regions
- **Identify high-performing clubs** - Analytics on who's succeeding
- **Reward and support** - Fund or provide resources to active groups
- **Track environmental impact** - Survival rates, species diversity, mapping
- **Access transparent data** - Trusted, immutable records on blockchain
- **Generate reports** - For donors, government, and stakeholders

**Dashboard Features:**
```
National Map View → Club Rankings → Impact Analytics → Verification Queue → Reports
```

### 👧🏾 For Students (Indirectly)

While students don't directly use the app, they benefit through:

- **More active 4K Clubs** - Increased engagement and recognition
- **Environmental education** - Hands-on learning through participation
- **Competition and recognition** - School and national leaderboards
- **Career opportunities** - Mentors showcase achievements to NGOs and employers

---

## 🛠️ Technology Stack

### Backend
| Layer | Technology |
|-------|-----------|
| **Language** | Python 3.10+ |
| **Framework** | Django 4.2 |
| **API** | Django REST Framework |
| **Database** | PostgreSQL / SQLite |
| **Auth** | Django User Model + JWT |
| **AI** | Groq API (Image Analysis) |
| **Web3** | web3.py, eth-account |
| **Storage** | AWS S3 / Local |

### Frontend
| Layer | Technology |
|-------|-----------|
| **Framework** | React 18+ |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui |
| **Maps** | Leaflet.js |
| **Charts** | Chart.js |
| **Forms** | React Hook Form |
| **State** | React Query |

### Blockchain
| Layer | Technology |
|-------|-----------|
| **Language** | Solidity 0.8.20 |
| **Framework** | Hardhat |
| **Libraries** | OpenZeppelin |
| **Deployment** | Polygon, zkEVM |
| **Storage** | IPFS (Pinata) |
| **Signing** | ECDSA (eth-account) |

---

## 📁 Project Structure

```
ecokuza/
├── backend/                           # Django application
│   ├── authentification/               # User authentication & certifications
│   │   ├── models.py                  # User, Certification, Points models
│   │   ├── serializers.py             # DRF serializers
│   │   ├── views.py                   # Authentication endpoints
│   │   ├── signals.py                 # Django signals for blockchain sync
│   │   └── management/                # Management commands
│   ├── trees/                          # Tree tracking
│   │   ├── models.py                  # TreeRecord model
│   │   ├── groq_service.py            # Groq AI integration
│   │   ├── serializers.py             # Tree serializers
│   │   ├── views.py                   # Tree endpoints
│   │   └── migrations/                # Database migrations
│   ├── blockchain_service.py          # ✨ NEW: Blockchain integration
│   ├── blockchain_config.py           # ✨ NEW: Configuration
│   ├── BLOCKCHAIN_INTEGRATION.md      # ✨ NEW: Setup guide
│   ├── manage.py                      # Django CLI
│   ├── requirements.txt               # Python dependencies
│   └── settings.py                    # Django configuration
│
├── frontend/                          # React application
│   ├── src/
│   │   ├── components/                # React components
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── TreeCard.jsx
│   │   │   └── ...
│   │   ├── pages/                     # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.js                 # API client
│   │   │   └── utils.js               # Utilities
│   │   └── main.jsx                   # App entry point
│   ├── package.json
│   └── vite.config.js
│
├── contracts/                         # Solidity smart contracts
│   ├── src/
│   │   ├── core/
│   │   │   ├── SentinelClubs.sol      # Main activity contract
│   │   │   ├── PointsEngine.sol       # Points calculation
│   │   │   ├── CertificateData.sol    # ✨ NEW: On-chain storage
│   │   │   ├── APIBridge.sol          # ✨ NEW: Data validation
│   │   │   └── OffchainDataHandler.sol# ✨ NEW: IPFS management
│   │   ├── tokens/
│   │   │   └── ImpactCertificate.sol  # NFT certificates
│   │   ├── registry/
│   │   │   ├── ClubRegistry.sol
│   │   │   └── VerifierRegistry.sol
│   │   └── utils/
│   │       ├── Structs.sol
│   │       └── ...
│   ├── scripts/
│   │   ├── deploy-certified.js        # ✨ NEW: Deployment script
│   │   └── deploy.js
│   ├── test/
│   │   └── sentinel.test.js
│   ├── hardhat.config.js
│   └── package.json
│
├── README.md                          # This file
├── SETUP_INDEX.md                     # ✨ NEW: Documentation index
├── README_BLOCKCHAIN.md               # ✨ NEW: Blockchain overview
├── BLOCKCHAIN_SETUP_COMPLETE.md       # ✨ NEW: Setup guide
├── DEPLOYMENT_GUIDE.md                # ✨ NEW: Deployment guide
├── DEPLOYMENT.md                      # Deployment configuration
└── render.yaml                        # Render.com config
```

---

## 🔧 Core Components

### Authentication Module (`backend/authentification/`)
Manages user accounts, points tracking, and certification achievements.

**Key Models:**
- `CustomUser` - Extended Django user with email verification and points
- `PointsLog` - Track all point transactions with history
- `Certification` - Define certification requirements and metadata
- `UserCertification` - Track which certifications users have earned
- `Notification` - Alert tutors about student progress

**Features:**
- Email-based authentication
- Points aggregation and tracking
- Automatic certification awarding
- Notification system for mentors

### Tree Tracking Module (`backend/trees/`)
Records tree planting and monitoring activities with AI verification.

**Key Models:**
- `TreeRecord` - Stores tree data including GPS, photos, and health info
- EXIF metadata extraction from photos
- GPS coordinate and altitude capture
- AI authenticity analysis

**AI Features:**
- Groq API integration for image analysis
- Authenticity scoring (0-100)
- Tree type identification
- Health assessment (Healthy/Good/Fair/Poor)
- GPS validation against tree type regions

### Blockchain Service (`backend/blockchain_service.py`)
Handles cryptographic signing and blockchain submission.

**Features:**
- ECDSA message signing
- IPFS photo uploads
- APIBridge contract integration
- Automatic retry logic
- Event logging

### Smart Contracts (`contracts/`)

#### CertificateData.sol
On-chain storage for all certified records.

```solidity
// Stores certificate records
struct CertificateRecord {
    address userWallet;
    string certificationName;
    uint256 pointsEarned;
    uint256 treeCount;
    uint256 timestamp;
}

// Stores tree update records
struct TreeUpdate {
    address userWallet;
    string treeSpecies;
    float latitude;
    float longitude;
    float altitude;
    string photoIPFSHash;
    uint256 authenticity_score;
    string healthAssessment;
    uint256 timestamp;
}
```

#### APIBridge.sol
Validates signatures and forwards data to CertificateData.

**Security Features:**
- ECDSA signature verification
- Replay attack prevention
- Hash-based uniqueness checking
- 1-hour message expiration window

#### OffchainDataHandler.sol
Manages IPFS/Arweave references and metadata.

```solidity
// Store IPFS references
function storeIPFSReference(
    string _ipfsHash,
    string _contentType,
    uint256 _size
) external

// Store certificate metadata
function storeCertificateMetadata(
    string _certName,
    string _description,
    string _iconURI,
    uint256 _rarity,
    string _jsonMetadataURI
) external
```

---

## 🔗 Blockchain Integration

### How It Works

When a tree record is verified in Django:

1. **Signal fires** - Django detects verification status change
2. **Data prepared** - Collect species, GPS, photo, authenticity score
3. **Photo uploaded** - IPFS upload returns hash
4. **Data signed** - Backend signs with private key using ECDSA
5. **Contract called** - APIBridge validates signature on-chain
6. **Data stored** - CertificateData records achievement permanently
7. **Event emitted** - Blockchain event for off-chain indexing

### Supported Networks

| Network | RPC | Status |
|---------|-----|--------|
| **Polygon Mumbai** | https://rpc-mumbai.maticvigil.com | ✅ Testnet |
| **Polygon** | https://polygon-rpc.com | ✅ Mainnet |
| **Polygon zkEVM** | https://rpc.cardona.zkevm-testnet.com | ✅ Testnet |
| **Local Hardhat** | http://localhost:8545 | ✅ Development |

### Configuration

See `backend/BLOCKCHAIN_INTEGRATION.md` for detailed setup instructions.

Key environment variables:
```env
BLOCKCHAIN_RPC_URL=<your_rpc_endpoint>
BLOCKCHAIN_CERTIFICATES_DATA_ADDRESS=0x...
BLOCKCHAIN_API_BRIDGE_ADDRESS=0x...
BLOCKCHAIN_SIGNER_PRIVATE_KEY=<backend_signing_key>
BLOCKCHAIN_ENABLED=true
```

---

## 📡 API Documentation

### Authentication Endpoints

```bash
POST   /api/auth/register/           # Create new user
POST   /api/auth/login/              # User login
POST   /api/auth/logout/             # User logout
GET    /api/auth/profile/            # Get current user
POST   /api/auth/verify-email/       # Verify email address
```

### Tree Management Endpoints

```bash
POST   /api/trees/                   # Create tree record
GET    /api/trees/                   # List user's trees
GET    /api/trees/{id}/              # Get tree details
PATCH  /api/trees/{id}/              # Update tree
POST   /api/trees/{id}/verify/       # Verify tree (admin)
POST   /api/trees/{id}/update/       # Add tree update
```

### Points & Certifications

```bash
GET    /api/points/ledger/           # View points history
GET    /api/certifications/          # List available certifications
GET    /api/certifications/earned/   # User's earned certifications
GET    /api/leaderboard/             # Global leaderboard
GET    /api/leaderboard/clubs/       # Club leaderboard
```

### Notifications

```bash
GET    /api/notifications/           # Get notifications
PATCH  /api/notifications/{id}/read/ # Mark as read
DELETE /api/notifications/{id}/      # Delete notification
```

### Admin Endpoints

```bash
GET    /api/admin/pending-verification/  # Verify trees
POST   /api/admin/verify-tree/{id}/      # Approve tree
POST   /api/admin/reject-tree/{id}/      # Reject tree
```

---

## 💻 Installation & Setup

### Backend Installation

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Database setup
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create initial certifications
python manage.py create_certifications

# Run server
python manage.py runserver
```

### Frontend Installation

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Blockchain Setup

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npm run compile

# Deploy to network
npm run deploy:certified:mumbai  # or local/polygon/zkevm

# Save deployment addresses to Django .env
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test authentification
python manage.py test trees

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Frontend Tests

```bash
cd frontend

# Run Vitest
npm run test

# Run with coverage
npm run test:coverage

# E2E tests with Playwright
npm run test:e2e
```

### Blockchain Tests

```bash
cd contracts

# Run Hardhat tests
npm test

# Run with gas report
npm run test:gas

# Run coverage
npm run test:coverage
```

---

## 🚀 Deployment

### Django Deployment

**Render.com:**
```bash
# Push to main branch
git push origin main

# Render automatically deploys
# View deployment at: https://ecokuza-backend.onrender.com
```

**Manual Deployment:**
```bash
# Build Docker image
docker build -t ecokuza-backend .

# Push to registry
docker push your-registry/ecokuza-backend

# Deploy to your server
docker run -e DATABASE_URL=... ecokuza-backend
```

### React Deployment

**Vercel:**
```bash
# Deploy with Vercel CLI
cd frontend
vercel

# Or push to GitHub and connect to Vercel
```

**Static Hosting:**
```bash
# Build
npm run build

# Deploy dist/ to CDN or static host
aws s3 sync dist/ s3://your-bucket/
```

### Blockchain Deployment

```bash
cd contracts

# Deploy to Mumbai testnet
npm run deploy:certified:mumbai

# Deploy to Polygon mainnet
npm run deploy:certified:polygon

# Verify on block explorer
npx hardhat verify --network mumbai CONTRACT_ADDRESS
```

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** thoroughly
5. **Commit**: `git commit -m 'Add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Code Standards

- **Python**: Follow PEP 8, use Black for formatting
- **JavaScript**: Follow ESLint config, use Prettier
- **Solidity**: Follow Solidity style guide, use linting
- **Commits**: Use conventional commits (`feat:`, `fix:`, `docs:`)
- **Documentation**: Update docs with feature changes

### Report Issues

Found a bug? Please open an issue with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/logs if applicable

---

## 🎥 Video Demo

### [INSERT VIDEO DEMO HERE]

**Demo Link:** [Add YouTube/Vimeo link]

This 5-10 minute demo shows:
- ✅ User registration and authentication
- ✅ Planting a new tree with GPS and photo
- ✅ AI verification process in real-time
- ✅ Admin verification workflow
- ✅ Points and certification earning
- ✅ Blockchain data confirmation
- ✅ Leaderboard and achievement views

**To add your video:**
1. Record a demo (desktop screen + camera preferred)
2. Upload to YouTube or Vimeo
3. Add the link here: `[LINK TEXT](URL)`

---

## 📊 Pitch Deck

### https://docs.google.com/presentation/d/1y0C8FjQ2yItphYLIXIu5dXY7KyDjBokF/edit?usp=sharing&ouid=109576960336579414961&rtpof=true&sd=true

---

## 🗓️ Roadmap

### Phase 1: Foundation (✅ Complete)
- [x] Django backend setup
- [x] React frontend scaffolding
- [x] Teacher authentication
- [x] Basic tree tracking
- [x] Points system
- [x] 4K Club management

### Phase 2: AI & Verification (✅ Complete)
- [x] Groq AI integration
- [x] Photo authenticity analysis
- [x] EXIF metadata extraction
- [x] Admin verification workflow
- [x] Certification system
- [x] Fraud prevention

### Phase 3: Blockchain (✅ Complete)
- [x] Smart contract development
- [x] Django-blockchain integration
- [x] Data signing and submission
- [x] IPFS integration
- [x] On-chain data storage
- [x] Immutable audit trails

### Phase 4: National Scale (🚀 In Progress)
- [ ] Multi-region support (All 47 Kenyan counties)
- [ ] School onboarding system
- [ ] NGO/Partner dashboard
- [ ] Advanced analytics for government
- [ ] Carbon credit integration
- [ ] Swahili language support

### Phase 5: Monetization & Growth (📅 Planned)
- [ ] Carbon credit marketplace
- [ ] Corporate sponsorship integration
- [ ] Donation system for schools
- [ ] School performance incentives
- [ ] Environmental education content
- [ ] Mobile app (React Native)

### Phase 6: Global Expansion (🌍 Future)
- [ ] Adapt for other African countries
- [ ] International NGO partnerships
- [ ] Global environmental tracking
- [ ] Multi-blockchain support
- [ ] Climate impact certification
- [ ] United Nations SDG alignment

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **README.md** | This comprehensive overview |
| **SETUP_INDEX.md** | Quick navigation guide |
| **README_BLOCKCHAIN.md** | Blockchain overview |
| **BLOCKCHAIN_SETUP_COMPLETE.md** | Complete blockchain setup |
| **DEPLOYMENT_GUIDE.md** | Deployment instructions |
| **backend/BLOCKCHAIN_INTEGRATION.md** | Django-blockchain guide |
| **contracts/README.md** | Smart contract details |
| **DEPLOYMENT.md** | Render deployment config |

---

## 🆘 Support & Community

### Getting Help

- **Documentation**: See links above
- **Issues**: [GitHub Issues](https://github.com/Sentinel-Hack/ecokuza/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Sentinel-Hack/ecokuza/discussions)
- **Email**: support@ecokuza.co.ke

### Community & Partnerships

- **Twitter**: [@EcokuzaIO](https://twitter.com/EcokuzaIO)
- **Discord**: [Join our server](https://discord.gg/ecokuza)
- **WhatsApp**: [Kenya 4K Club Network](https://chat.whatsapp.com/ecokuza)
- **Website**: [ecokuza.ke](https://ecokuza.ke)

### Kenya-Specific Resources

- **4K Clubs Information**: [Kenya Forest Service](https://www.kenyaforestservice.org)
- **Environmental Partners**: Ministry of Environment and Forestry
- **School Integration**: [Kenya Ministry of Education](https://www.education.go.ke)
- **Training Materials**: Available in English and Swahili

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

### Technologies Used
- Django & Django REST Framework
- React & Vite
- Solidity & Hardhat
- Groq AI API
- Polygon Blockchain
- IPFS & Pinata
- OpenZeppelin Contracts

### Contributors
- Development Team
- Security Auditors
- Community Testers
- Environmental Partners

---

## 🚀 Get Started Today

1. **Star** the repository
2. **Fork** for your own deployment
3. **Follow** our social channels
4. **Join** our Discord community
5. **Deploy** your own instance

### Quick Links

- [GitHub Repository](https://github.com/Sentinel-Hack/ecokuza)
- [Live Demo](https://ecokuza.onrender.com)
- [API Documentation](https://ecokuza.onrender.com/api/docs/)
- [Teacher Dashboard](https://ecokuza-frontend.vercel.app)
- [NGO Partner Portal](https://partners.ecokuza.ke)

---

## 📞 Contact

**Questions? Get in touch!**

- **Email**: hello@ecokuza.co.ke
- **Twitter**: [@EcokuzaIO](https://twitter.com/EcokuzaIO)
- **LinkedIn**: [Ecokuza Team](https://linkedin.com/company/ecokuza)
- **Website**: [ecokuza.ke](https://ecokuza.ke)

### For Institutional Partners

**NGOs, Foundations, Government Agencies:**
- Partnership inquiries: partners@ecokuza.co.ke
- Demo dashboard: Available by request
- Integration support: Full technical support included

**Schools & 4K Club Mentors:**
- School onboarding: schools@ecokuza.co.ke
- Training resources: training@ecokuza.co.ke
- Technical support: support@ecokuza.co.ke

---

## ⭐ Support This Project

If you find Ecokuza valuable:
- ⭐ Star the repository
- 🔗 Share with your network
- 💬 Provide feedback
- 🤝 Contribute code
- 🌍 Deploy locally

Together, we can make a real environmental impact! 🌱

---

**Made with ❤️ for Kenya's Future**

*Empowering Kenyan Schools. Protecting Kenyan Forests. Building Transparent Impact.*

---

**Made with ❤️ for the planet**

*Last Updated: November 25, 2025*  
*Version: 1.0.0*  
*Status: ✅ Production Ready*

