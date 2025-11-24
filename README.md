# 🌳 Sentinel Forest Monitoring Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20+-blue.svg)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-4.2.x-092E20.svg)](https://www.djangoproject.com/)

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Development](#-development)
  - [Smart Contracts](#smart-contracts)
  - [Backend API](#backend-api)
  - [Frontend](#frontend)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🌍 Project Overview

Sentinel is a comprehensive platform designed to monitor and incentivize forest conservation activities. The platform enables schools, communities, and organizations to track tree planting initiatives, monitor growth, and measure environmental impact while earning verifiable impact certificates and rewards through a transparent, decentralized system.

## ✨ Features

### 🌱 For Schools & Environmental Clubs
- **Club Registration**: Create and manage environmental clubs with unique digital identities
- **Activity Tracking**: Log tree planting and conservation activities with geolocation data
- **Growth Monitoring**: Track the progress and health of planted trees over time
- **Gamification**: Earn points and climb leaderboards based on conservation impact
- **Digital Certification**: Receive blockchain-verified impact certificates as NFTs
- **Resource Management**: Access educational materials and conservation resources

### 🔍 For Verifiers & Validators
- **Activity Verification**: Review and validate conservation activities
- **Quality Assurance**: Ensure data accuracy and environmental impact
- **Reputation System**: Build verifier reputation through accurate validations
- **Incentive Mechanism**: Earn rewards for verification activities

### 💰 For Donors & Partners
- **Transparent Impact**: Track contributions and their environmental impact in real-time
- **Analytics Dashboard**: Access comprehensive statistics and visualizations
- **Project Support**: Fund specific conservation initiatives or regions
- **ESG Reporting**: Generate reports for environmental, social, and governance compliance

## 🛠️ Tech Stack

### Blockchain & Smart Contracts
- **Language**: Solidity 0.8.20+
- **Frameworks**: Hardhat, OpenZeppelin
- **Token Standards**: ERC-721 (NFTs), ERC-1155 (Multi-token)
- **Networks**:
  - Polygon zkEVM (Mainnet & Testnet)
  - Scroll (Testnet)
  - zkSync Era (Testnet)

### Backend (Django REST Framework)
- **Framework**: Django 4.2+
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite (Development), PostgreSQL (Production)
- **API**: Django REST Framework
- **Caching**: Redis
- **Task Queue**: Celery

### Frontend (React)
- **Framework**: React 18+
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Web3 Integration**: ethers.js, Web3Modal
- **Maps & Visualization**: Leaflet, Chart.js
- **Form Handling**: Formik & Yup

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry, Prometheus, Grafana
- **Storage**: IPFS/Filecoin for decentralized storage
- **Hosting**: AWS/GCP (Backend), Vercel (Frontend)

## 🏗️ Project Structure

```
├── backend/                   # Django REST API
│   ├── authentification/      # User authentication & JWT
│   ├── ecokuza/               # Django project configuration
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Python dependencies
│
├── contracts/                 # Smart contracts
│   ├── core/                  # Main business logic
│   ├── registry/              # Club and verifier registries
│   ├── tokens/                # NFT and token contracts
│   ├── interfaces/            # Contract interfaces
│   ├── test/                  # Test files
│   └── scripts/               # Deployment scripts
│
├── frontend/                  # React frontend
│   ├── public/                # Static files
│   └── src/
│       ├── assets/            # Images, fonts, etc.
│       ├── components/        # Reusable UI components
│       ├── contexts/          # React contexts
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # Page components
│       ├── services/          # API services
│       └── utils/             # Utility functions
│
├── .github/                   # GitHub configurations
│   └── workflows/             # CI/CD workflows
│
├── .env.example               # Environment variables example
├── .gitignore                 # Git ignore file
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- Python 3.9+
- npm 9.x or yarn 1.22+
- Hardhat
- Git
- MetaMask or Web3 wallet

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Sentinel-Hack/ecokuza.git
   cd ecokuza
   ```

2. **Set up the backend**
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Create and activate virtual environment (Windows)
   python -m venv venv
   .\venv\Scripts\activate
   
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Run migrations
   python manage.py migrate
   
   # Create superuser (follow prompts)
   python manage.py createsuperuser
   ```

3. **Set up the frontend**
   ```bash
   # Navigate to frontend directory
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Copy environment file
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the smart contracts**
   ```bash
   # Navigate to contracts directory
   cd ../contracts
   
   # Install dependencies
   npm install
   
   # Compile contracts
   npx hardhat compile
   ```

### Configuration

1. **Backend Configuration**
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key
   DATABASE_URL=sqlite:///db.sqlite3
   CORS_ALLOWED_ORIGINS=http://localhost:3000
   JWT_SECRET_KEY=your-jwt-secret
   ```

2. **Frontend Configuration**
   Update the `.env.local` file in the `frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   REACT_APP_NETWORK_ID=80001  # Mumbai Testnet
   REACT_APP_INFURA_ID=your-infura-id
   ```

3. **Smart Contracts Configuration**
   Create a `.env` file in the `contracts` directory:
   ```env
   PRIVATE_KEY=your-wallet-private-key
   POLYGONSCAN_API_KEY=your-polygonscan-api-key
   ALCHEMY_API_KEY=your-alchemy-api-key
   ```



## 🌐 Network Configuration

### Supported Networks
- **Polygon zkEVM Testnet (Cardona)**: `polygonZkEVMTestnet`
- **Polygon zkEVM Mainnet**: `polygonZkEVM`
- **Scroll Testnet**: `scrollSepolia`
- **zkSync Era Testnet**: `zksyncTestnet`

### Network URLs
- **Polygon zkEVM Testnet RPC**: `https://rpc.cardona.zkevm-rpc.com`
- **Polygon zkEVM Mainnet RPC**: `https://zkevm-rpc.com`
- **Explorer**: [Polygon zkEVM Explorer](https://zkevm.polygonscan.com)

## 📚 Documentation

### Contract Addresses

```env
NEXT_PUBLIC_POINTS_ENGINE_ADDRESS=0xfaCC6C825F79D534af3cC9F611511258466290a3
NEXT_PUBLIC_CLUB_REGISTRY_ADDRESS=0xd7600dE536139605E6541db5d0908862981E157f
NEXT_PUBLIC_VERIFIER_REGISTRY_ADDRESS=0x65806FF71b11b1FCDfaB8ca741b7A7575b666437
NEXT_PUBLIC_SENTINEL_CLUBS_ADDRESS=0xb84622f542DC1071A074CA32E5Cc0F3DDE9aF2eF
```

### Contract ABIs
ABIs are available in the `artifacts/` directory after compilation.

## 🤝 Contributing

### Code Style
- Follow Solidity Style Guide
- Use NatSpec for documentation
- Write comprehensive tests

### Workflow
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- Inspired by the Green Belt Movement
- Built for the Wangari Maathai Hackathon
- Special thanks to all contributors and supporters


## 💻 Development

### Smart Contracts

#### Compile Contracts
```bash
cd contracts
npx hardhat compile
```

#### Run Tests
```bash
npx hardhat test
```

#### Deploy to Local Network
```bash
npx hardhat node
# In a separate terminal
npx hardhat run scripts/deploy.js --network localhost
```

### Backend API

#### Run Development Server
```bash
cd backend
python manage.py runserver
```

#### Create Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Frontend

#### Start Development Server
```bash
cd frontend
npm start
```

#### Build for Production
```bash
npm run build
```

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
npx hardhat test
```

### Backend
```bash
cd backend
python manage.py test
```

### Frontend
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Smart Contracts to Testnet
```bash
# Deploy to Polygon Mumbai Testnet
npx hardhat run scripts/deploy.js --network mumbai

# Verify on Polygonscan
npx hardhat verify --network mumbai DEPLOYED_CONTRACT_ADDRESS "Constructor Argument 1"
```

### Backend to Production
1. Set up a production-ready database (PostgreSQL recommended)
2. Configure environment variables for production
3. Set up a production-grade WSGI server (Gunicorn + Nginx)
4. Configure HTTPS with Let's Encrypt

### Frontend to Production
1. Build the production bundle:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy the `build` folder to a static hosting service (Vercel, Netlify, etc.)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Message Guidelines
- Use present tense ("Add feature" not "Added feature")
- Keep the first line under 72 characters
- Reference issues and pull requests liberally

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

For questions or support, please contact:
- **Email**: contact@ecokuza.org
- **Twitter**: [@Ecokuza](https://twitter.com/Ecokuza)
- **Discord**: Join our [community server](https://discord.gg/ecokuza)

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- The Ethereum Foundation for the EVM
- Polygon for scalable blockchain infrastructure
- All our contributors and community members

---

<div align="center">
  Made with ❤️ by the Ecokuza Team
</div>
