# 🏛️ Memoria

> *Preserving community memories forever on the blockchain*

Memoria is a decentralized memory archive system designed at ETH Dublin Hackathon 2025. The project enables communities to preserve memories—stories, images, songs, recipes, and cultural artifacts—permanently on-chain and on Arweave, creating an unstoppable record of human heritage.

## 🌍 Why Memoria Matters

Across the world, local histories are often erased, censored, or forgotten. Centralized institutions (governments, media, museums) frequently fail to preserve emotional, oral, and grassroots stories. Memoria enables decentralized, trust-anchored preservation of human memory with permanent storage on Arweave and immutable verification on Ethereum.

**Example Use Cases:**
- 🇮🇪 Preserving rare Irish dialects through audio recordings and cultural context
- 📖 Collecting family recipes and traditional cooking methods before they're lost
- 🎵 Archiving indigenous music and oral histories
- 📸 Documenting community events and local celebrations
- 🏘️ Recording neighborhood stories and urban development history

## 🏗️ Architecture

Memoria consists of two main smart contracts built on Ethereum:

### 🏛️ ArchiveFactory Contract
The factory contract that deploys and indexes community archives.

**Key Features:**
- Deploy new Archive contracts for communities
- Index all archives with pagination support
- Emit events for archive creation tracking
- Input validation for archive parameters

### 📦 Archive Contract (ERC-1155)
Individual community memory vaults that store artifact metadata and manage rewards.

**Key Features:**
- **Artifact Management**: Submit, review, accept/reject community memories
- **NFT Minting**: ERC-1155 tokens minted for accepted artifacts
- **Donor Tracking**: Complete donor management with statistics and rewards
- **Metadata Generation**: On-chain base64-encoded JSON metadata
- **Admin Controls**: Secure admin functions with proper access control

## 🔗 Smart Contract Details

### Archive Contract Functions

#### 📝 Artifact Management
```solidity
// Submit a new artifact for review
function submitArtifact(
    string calldata _title,
    string calldata _arweaveURI, 
    string calldata _mimeType
) external returns (uint256 id)

// Admin accepts artifact and mints NFT
function acceptArtifact(uint256 _id, uint256 _rewardWei) external onlyAdmin

// Admin rejects artifact
function rejectArtifact(uint256 _id) external onlyAdmin
```

#### 💰 Donation System
```solidity
// Donate with a message
function receiveDonation(string calldata _message) external payable

// Anonymous donations via receive function
receive() external payable

// View donor information
function donorInfo(address donor) external view returns (Donor memory)
function getDonors(uint256 offset, uint256 limit) external view returns (Donor[] memory)
function totalDonors() external view returns (uint256)
```

#### 🔐 Admin Functions
```solidity
// Transfer admin rights
function transferAdmin(address _newAdmin) external onlyAdmin
```

### ArchiveFactory Contract Functions

```solidity
// Create a new community archive
function createArchive(
    string calldata _name,
    string calldata _description, 
    string calldata _baseUri
) external returns (address archiveAddr)

// View archives with pagination
function getArchives(uint256 offset, uint256 limit) external view returns (ArchiveInfo[] memory)
function totalArchives() external view returns (uint256)
```

## 🎯 Artifact Lifecycle

1. **📤 Submission**: Community members submit artifacts with title, Arweave URI, and MIME type
2. **👀 Review**: Archive admin reviews submissions for quality and relevance
3. **✅ Acceptance**: Admin accepts artifact, mints ERC-1155 NFT to submitter, and optionally rewards ETH
4. **🏆 Collection**: Submitter receives unique NFT representing their contribution
5. **🌐 Discovery**: Artifact becomes publicly viewable with on-chain metadata

## 🛡️ Security Features

- **ReentrancyGuard**: Protection against reentrancy attacks
- **Input Validation**: Comprehensive validation for all string inputs
- **Safe ETH Transfers**: Uses `call()` instead of `transfer()` for compatibility
- **Access Control**: Admin-only functions with proper validation
- **Zero Address Protection**: Prevents invalid address assignments

## 🏃‍♂️ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (>= v20.18.3)
- [Yarn](https://yarnpkg.com/) (v1 or v2+)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd memoria
```

2. **Install dependencies**:
```bash
yarn install
```

3. **Start local blockchain**:
```bash
yarn chain
```

4. **Deploy contracts**:
```bash
yarn deploy
```

5. **Start the frontend**:
```bash
yarn start
```

Visit `http://localhost:3000` to interact with your deployed contracts.

## 🧪 Testing

Memoria includes comprehensive test coverage with 36 tests covering all functionality:

```bash
# Run all tests
yarn foundry:test

# Run tests with verbose output
yarn foundry:test -vv

# Generate coverage report
yarn foundry:coverage
```

**Test Coverage:**
- Archive Contract: 100% function coverage, 93.33% branch coverage
- ArchiveFactory Contract: 100% coverage across all metrics

## 🚀 Deployment

### Local Development
```bash
# Deploy to local network
forge script script/DeployLocal.s.sol --broadcast --rpc-url localhost
```

### Testnet/Mainnet
```bash
# Set environment variables
export PRIVATE_KEY="your-private-key"
export RPC_URL="your-rpc-url"

# Deploy with verification
forge script script/DeployMemoria.s.sol --broadcast --rpc-url $RPC_URL --verify
```

## 📁 Project Structure

```
memoria/
├── packages/
│   ├── foundry/                 # Smart contracts
│   │   ├── contracts/
│   │   │   ├── Archive.sol      # Main archive contract
│   │   │   └── ArchiveFactory.sol # Factory contract
│   │   ├── test/                # Contract tests
│   │   ├── script/              # Deployment scripts
│   │   └── foundry.toml         # Foundry config
│   └── nextjs/                  # Frontend application
│       ├── app/                 # Next.js app router
│       ├── components/          # React components
│       └── hooks/               # Wagmi hooks
```

## 🔧 Configuration

### Foundry Configuration
Edit `packages/foundry/foundry.toml` for:
- Solidity compiler settings
- Network configurations
- Gas optimization settings

### Frontend Configuration  
Edit `packages/nextjs/scaffold.config.ts` for:
- Target network selection
- UI customization
- Contract integration settings

## 🤝 Contributing

We welcome contributions to Memoria! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Development Guidelines
- Follow Solidity best practices
- Maintain 100% test coverage for new features
- Add comprehensive documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [Scaffold-ETH 2](https://scaffoldeth.io) framework
- Uses [OpenZeppelin](https://openzeppelin.com/) security standards
- Developed at ETH Dublin Hackathon 2025
- Inspired by the need to preserve cultural heritage globally

## 📞 Support

- 📖 [Documentation](https://docs.scaffoldeth.io)
- 🐛 [Issue Tracker](https://github.com/your-repo/issues)
- 💬 [Community Discord](https://discord.gg/your-discord)

---

*Preserving memories, one artifact at a time* 🌟