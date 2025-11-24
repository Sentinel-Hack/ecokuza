# Sentinel Forest Monitoring Platform

## 🌳 Project Overview
Sentinel is a blockchain-powered platform for monitoring and incentivizing forest conservation activities. It enables schools and communities to track tree planting, growth, and environmental impact while earning verifiable impact certificates and rewards.

## 🏗️ Project Structure

### 📁 contracts/
- `core/`: Main business logic contracts
  - `SentinelClubs.sol`: Main contract for activities and tracking
  - `PointsEngine.sol`: Points calculation and rewards system
  - `Activities.sol`: Activity management
- `registry/`
  - `ClubRegistry.sol`: Club registration and management
  - `VerifierRegistry.sol`: Verifier management
- `tokens/`
  - `ImpactCertificate.sol`: ERC721 NFTs for impact tracking
  - `ClubBadge.sol`: ERC721 for club identification
- `interfaces/`: Contract interfaces
- `utils/`: Utility contracts and libraries

### 📁 scripts/
- Deployment and interaction scripts
- Test scripts
- Utility scripts

### 📁 test/
- Unit and integration tests
- Test utilities

## 🚀 Features

### For Schools & Clubs
- 📝 Register and manage environmental clubs
- 🌱 Record tree planting and conservation activities
- 📊 Track growth and maintenance of planted trees
- 🏆 Earn points and climb leaderboards
- 📜 Receive verifiable impact certificates

### For Verifiers
- 🔍 Verify and validate conservation activities
- 🎯 Ensure data accuracy and integrity
- 🏅 Award verification bonuses

### For Donors & Partners
- 🔍 Transparent impact tracking
- 📈 Real-time statistics and analytics
- 🌍 Support verified environmental projects

## 🛠️ Tech Stack

### Smart Contracts
- **Language**: Solidity 0.8.20+
- **Frameworks**: Hardhat, OpenZeppelin
- **Standards**: ERC-721, ERC-1155
- **Networks**: Polygon zkEVM, Scroll, zkSync

### Frontend (Coming Soon)
- React.js with TypeScript
- Web3.js / ethers.js
- Tailwind CSS
- IPFS/Filecoin for decentralized storage

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- Hardhat
- Git

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/sentinel-forest.git
   cd sentinel-forest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Testing
```bash
npx hardhat test
```

### Deployment
Deploy to Polygon zkEVM Testnet:
```bash
npx hardhat run scripts/deploy-zkevm.js --network polygonZkEVMTestnet
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
*Deployed addresses will appear here after deployment*

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
