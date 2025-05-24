# 🏛️ Memoria Smart Contracts

This directory contains the Memoria smart contracts built with Foundry. The contracts enable decentralized preservation of community memories through a factory pattern and ERC-1155 NFT system.

## 📦 Contracts

### 🏛️ ArchiveFactory.sol
Factory contract for deploying and indexing community archives.

**Address:** `TBD` (deployed address will be updated here)

#### Key Functions:
- `createArchive(name, description, baseUri)` - Deploy new archive
- `getArchives(offset, limit)` - Paginated archive listing
- `totalArchives()` - Total archive count

#### Events:
- `ArchiveCreated(address indexed archive, string name, address indexed admin)`

### 📦 Archive.sol
ERC-1155 contract for individual community memory vaults.

#### Key Features:
- **Artifact Management** - Submit, review, and manage community memories
- **NFT Minting** - ERC-1155 tokens for accepted artifacts  
- **Donor Tracking** - Complete donation management system
- **On-chain Metadata** - Base64-encoded JSON metadata

#### Artifact States:
- `Pending` - Submitted, awaiting admin review
- `Accepted` - Approved, NFT minted to submitter
- `Rejected` - Declined by admin

#### Core Functions:

##### 📝 Artifact Management
```solidity
function submitArtifact(
    string calldata _title,
    string calldata _arweaveURI,
    string calldata _mimeType
) external returns (uint256 id)
```
Submit new artifact for community review.

```solidity
function acceptArtifact(uint256 _id, uint256 _rewardWei) external onlyAdmin
```
Admin accepts artifact, mints NFT, and sends optional ETH reward.

```solidity
function rejectArtifact(uint256 _id) external onlyAdmin  
```
Admin rejects submitted artifact.

##### 💰 Donation System
```solidity
function receiveDonation(string calldata _message) external payable
```
Donate ETH with an optional message.

```solidity
receive() external payable
```
Anonymous donations via direct ETH transfer.

```solidity
function getDonors(uint256 offset, uint256 limit) external view returns (Donor[] memory)
```
Get paginated list of donors with their contribution stats.

##### 🔍 View Functions
```solidity
function metadata(uint256 id) external view returns (ArtifactMetadata memory)
```
Get artifact metadata by ID.

```solidity
function uri(uint256 _id) external view returns (string memory)
```
ERC-1155 metadata URI (base64-encoded JSON for accepted artifacts).

```solidity
function donorInfo(address donor) external view returns (Donor memory)  
```
Get donor statistics by address.

#### Events:
- `ArtifactSubmitted(uint256 indexed id, address indexed submitter)`
- `ArtifactAccepted(uint256 indexed id, address indexed submitter, uint256 reward)`
- `ArtifactRejected(uint256 indexed id, address indexed submitter)`
- `DonationReceived(address indexed from, uint256 amount)`
- `AdminTransferred(address indexed oldAdmin, address indexed newAdmin)`

## 🛡️ Security Features

### Access Control
- **Admin Functions** - Critical functions restricted to archive admin
- **Input Validation** - Comprehensive validation for all user inputs
- **Zero Address Protection** - Prevents invalid address assignments

### Reentrancy Protection
- Uses OpenZeppelin's `ReentrancyGuard` for state-changing functions
- Safe ETH transfers using `call()` instead of `transfer()`

### Input Validation
- Non-empty strings required for all artifact fields
- Non-zero donations required
- Admin address cannot be zero

## 🧪 Testing

### Test Coverage
```bash
forge coverage
```

**Current Coverage:**
- Archive Contract: 100% function coverage, 93.33% branch coverage
- ArchiveFactory Contract: 100% coverage across all metrics

### Running Tests
```bash
# Run all tests
forge test

# Run with verbose output  
forge test -vv

# Run specific test file
forge test --match-path test/Archive.t.sol

# Run specific test function
forge test --match-test testSubmitArtifact
```

### Test Structure
- `test/Archive.t.sol` - 25 comprehensive tests covering all Archive functionality
- `test/ArchiveFactory.t.sol` - 11 tests for factory contract features

## 🚀 Deployment

### Local Development
```bash
# Start local network
anvil

# Deploy contracts
forge script script/DeployLocal.s.sol --broadcast --rpc-url localhost
```

### Testnet Deployment
```bash
# Set environment variables
export PRIVATE_KEY="your-private-key"
export RPC_URL="https://sepolia.infura.io/v3/your-key"

# Deploy with verification
forge script script/DeployMemoria.s.sol \
  --broadcast \
  --rpc-url $RPC_URL \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Deployment Scripts
- `script/DeployLocal.s.sol` - Local development deployment
- `script/DeployMemoria.s.sol` - Production deployment with environment variables
- `script/Deploy.s.sol` - Main deployment script using SE-2 helpers

## ⚙️ Configuration

### Foundry Configuration (`foundry.toml`)
```toml
[profile.default]
src = 'contracts'
out = 'out'
libs = ['lib']
solc_version = '0.8.24'

[rpc_endpoints]
sepolia = "https://sepolia.infura.io/v3/${INFURA_API_KEY}"
mainnet = "https://mainnet.infura.io/v3/${INFURA_API_KEY}"
```

### Network Support
- Local (Anvil/Hardhat)
- Ethereum Sepolia Testnet  
- Ethereum Mainnet
- Polygon, Arbitrum, Optimism (configurable)

## 📊 Gas Usage

| Function | Estimated Gas |
|----------|---------------|
| `createArchive()` | ~4.2M gas |
| `submitArtifact()` | ~150k gas |
| `acceptArtifact()` | ~220k gas |
| `receiveDonation()` | ~160k gas |

## 🔗 Dependencies

- **OpenZeppelin Contracts** - Security and standards
  - ERC1155 - NFT standard implementation
  - ReentrancyGuard - Reentrancy protection
  - Strings - String utilities  
  - Base64 - Encoding utilities

- **Forge Standard Library** - Testing utilities

## 📋 Contract Addresses

| Network | ArchiveFactory | 
|---------|----------------|
| Sepolia | `TBD` |
| Mainnet | `TBD` |

*Addresses will be updated after deployment*

## 🐛 Known Issues

- Message parameter in `receiveDonation()` not stored (only emitted)
- Gas optimization opportunities in pagination functions
- Consider adding pause functionality for emergency situations

## 🔮 Future Enhancements

- [ ] Archive metadata updates by admin
- [ ] Bulk artifact operations
- [ ] Donation message storage
- [ ] Archive pause/unpause functionality
- [ ] Enhanced access control (multiple admins)
- [ ] Artifact categories and tagging
- [ ] Staking mechanism for curators

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Add comprehensive tests
4. Ensure 100% test coverage
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

### Development Guidelines
- Follow Solidity style guide
- Add NatSpec documentation
- Maintain test coverage above 95%
- Use meaningful commit messages 