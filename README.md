# 🏛️ Memoria

> _Preserving community memories forever on the blockchain_

Memoria is a decentralized memory archive system designed at ETH Dublin Hackathon 2025. The project enables communities to preserve memories—stories, images, songs, recipes, and cultural artifacts—permanently on-chain and on Arweave, creating an unstoppable record of human heritage.

It's live [here](https://memoria-silk.vercel.app/)

You can check out [the archives here](https://memoria-silk.vercel.app/archive/list) or [you can check out the memories in an archive here](https://memoria-silk.vercel.app/archive/0x804bd3020d20Ba0192a90F8CFcfa34609F0A25c6)

## 🌍 Why Memoria Matters

Across the world, local histories are often erased, censored, or forgotten. Centralized institutions (governments, media, museums) frequently fail to preserve emotional, oral, and grassroots stories. Memoria enables decentralized, trust-anchored preservation of human memory with permanent storage on Arweave and immutable verification on Ethereum.

**Example Use Cases:**

- 🇮🇪 Preserving rare Irish dialects through audio recordings and cultural context
- 📖 Collecting family recipes and traditional cooking methods before they're lost
- 🎵 Archiving indigenous music and oral histories
- 📸 Documenting community events and local celebrations
- 🏘️ Recording neighborhood stories and urban development history

## Roadmap

Our goal is to create a public goods incentive structure to fund cultural preservation. Users who build archives can receive donations from other users, and use the donations to directly fund artifacts/memories submitted to Arweave. This model fosters greater transparency, and more easily funds those directly involved in cultural preservation.

Also, the donors and participants in this project will receive ERC-1155 NFTs minted to them as backers of the archives, and do function as a badge for supporting the project

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

You can view our contracts live on [Etherscan Sepolia](https://sepolia.etherscan.io/address/0x371cb38b81ae204a7950ff31b3caa1a5b563b1de)

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

_Preserving memories, one artifact at a time_ 🌟

---

# 📚 Complete Smart Contract API Reference

This section provides comprehensive documentation for developers and designers working with Memoria's smart contracts. All functions, data structures, events, and integration patterns are documented in detail.

## 📋 Table of Contents

- [Contract Addresses](#contract-addresses)
- [ArchiveFactory Contract](#archivefactory-contract)
- [Archive Contract (ERC-1155)](#archive-contract-erc-1155)
- [Data Structures](#data-structures)
- [Events Reference](#events-reference)
- [Error Codes](#error-codes)
- [Gas Estimates](#gas-estimates)
- [Integration Examples](#integration-examples)

---

## 🏭 ArchiveFactory Contract

The factory contract manages the deployment and indexing of all community archives in the Memoria ecosystem.

### 📊 Contract Overview

```solidity
contract ArchiveFactory {
    address[] public archives;  // All deployed archive addresses
}
```

### 🔧 Functions

#### `createArchive`

```solidity
function createArchive(
    string calldata _name,
    string calldata _description,
    string calldata _baseUri
) external returns (address archiveAddr)
```

**Description**: Creates a new Archive contract for a community. The caller automatically becomes the admin.

**Parameters**:

- `_name` (string): Human-readable name of the archive (e.g., "Dublin Folk Memories")
- `_description` (string): Short description shown in UI (e.g., "Preserving stories from Dublin's communities")
- `_baseUri` (string): ERC-1155 base URI (optional, can be empty string)

**Returns**:

- `archiveAddr` (address): Address of the newly deployed Archive contract

**Access Control**: Public - anyone can create an archive

**Gas Cost**: ~2,100,000 gas (deploys new contract)

**Requirements**:

- `_name` must not be empty string
- Will revert if deployment fails

**Events Emitted**: `ArchiveCreated(address indexed archive, string name, address indexed admin)`

**Example Usage**:

```javascript
const tx = await archiveFactory.createArchive(
  "Dublin Folk Memories",
  "Preserving stories from Dublin's communities",
  ""
);
const receipt = await tx.wait();
const archiveAddress = receipt.events[0].args.archive;
```

---

#### `totalArchives`

```solidity
function totalArchives() external view returns (uint256)
```

**Description**: Returns the total number of archives created through this factory.

**Parameters**: None

**Returns**:

- `uint256`: Total count of deployed archives

**Access Control**: Public view

**Gas Cost**: ~2,400 gas

**Example Usage**:

```javascript
const total = await archiveFactory.totalArchives();
console.log(`Total archives: ${total}`);
```

---

#### `archives` (Array Getter)

```solidity
function archives(uint256 index) external view returns (address)
```

**Description**: Public array getter to access archive addresses by index.

**Parameters**:

- `index` (uint256): Zero-based index in the archives array

**Returns**:

- `address`: Archive contract address at the given index

**Access Control**: Public view

**Gas Cost**: ~2,600 gas

**Requirements**:

- `index` must be less than `totalArchives()`

**Example Usage**:

```javascript
// Get the first archive
const firstArchive = await archiveFactory.archives(0);

// Get all archives
const total = await archiveFactory.totalArchives();
const allArchives = [];
for (let i = 0; i < total; i++) {
  allArchives.push(await archiveFactory.archives(i));
}
```

---

## 🏛️ Archive Contract (ERC-1155)

Individual community memory vaults that store artifact metadata, manage donations, and mint NFTs for accepted memories.

### 📊 Contract Overview

```solidity
contract Archive is ERC1155, ReentrancyGuard {
    string public name;           // Archive name
    string public description;    // Archive description
    address public admin;         // Archive administrator

    // Artifact tracking
    uint256 private _nextId = 1;  // Next artifact ID (starts at 1)
    mapping(uint256 => ArtifactMetadata) public metadata;

    // Donor tracking
    address[] public donors;
    mapping(address => uint256) public donorIndex;
    mapping(address => Donor) public donorInfo;
}
```

### 🗂️ Data Structures

#### `Status` Enum

```solidity
enum Status {
    Pending,   // 0 - Awaiting admin review
    Accepted,  // 1 - Approved and NFT minted
    Rejected   // 2 - Rejected by admin
}
```

#### `ArtifactMetadata` Struct

```solidity
struct ArtifactMetadata {
    string title;        // Human-readable title
    string arweaveURI;   // Arweave storage URI
    string mimeType;     // Content MIME type (e.g., "image/jpeg")
    uint256 timestamp;   // Submission timestamp
    address submitter;   // Who submitted this artifact
    Status status;       // Current status (Pending/Accepted/Rejected)
}
```

#### `Donor` Struct

```solidity
struct Donor {
    address donor;         // Donor's address
    uint256 totalDonated;  // Total ETH donated (in wei)
    uint256 donationCount; // Number of separate donations
}
```

### 🔧 Public State Variables

#### `name`

```solidity
string public name;
```

**Description**: Human-readable name of the archive
**Example**: `"Dublin Folk Memories"`

#### `description`

```solidity
string public description;
```

**Description**: Short description of the archive's purpose
**Example**: `"Preserving stories from Dublin's communities"`

#### `admin`

```solidity
address public admin;
```

**Description**: Address with administrative privileges (can accept/reject artifacts)

#### `metadata`

```solidity
mapping(uint256 => ArtifactMetadata) public metadata;
```

**Description**: Maps artifact IDs to their metadata
**Usage**: `metadata[1]` returns the metadata for artifact ID 1

#### `donors`

```solidity
address[] public donors;
```

**Description**: Array of all unique donor addresses (ordered by first donation)

#### `donorIndex`

```solidity
mapping(address => uint256) public donorIndex;
```

**Description**: Maps donor address to their index in the donors array (1-based, 0 means not found)

#### `donorInfo`

```solidity
mapping(address => Donor) public donorInfo;
```

**Description**: Maps donor address to their donation statistics

---

### 🔧 Functions

#### `submitArtifact`

```solidity
function submitArtifact(
    string calldata _title,
    string calldata _arweaveURI,
    string calldata _mimeType
) external returns (uint256 id)
```

**Description**: Submit a new artifact for admin review. Creates a pending artifact with a unique ID.

**Parameters**:

- `_title` (string): Human-readable title (e.g., "My Grandmother's Recipe")
- `_arweaveURI` (string): Arweave URI where content is stored (e.g., "ar://abc123...")
- `_mimeType` (string): MIME type of the content (e.g., "image/jpeg", "audio/mp3", "application/pdf")

**Returns**:

- `id` (uint256): Unique identifier for the submitted artifact

**Access Control**: Public - anyone can submit

**Gas Cost**: ~85,000 gas

**Requirements**:

- All string parameters must be non-empty
- No duplicate checking (same content can be submitted multiple times)

**Events Emitted**: `ArtifactSubmitted(uint256 indexed id, address indexed submitter)`

**Example Usage**:

```javascript
const tx = await archive.submitArtifact(
  "My Grandmother's Irish Stew Recipe",
  "ar://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  "application/pdf"
);
const receipt = await tx.wait();
const artifactId = receipt.events[0].args.id;
```

---

#### `acceptArtifact`

```solidity
function acceptArtifact(uint256 _id, uint256 _rewardWei) external onlyAdmin nonReentrant
```

**Description**: Admin accepts a pending artifact, mints an ERC-1155 NFT to the submitter, and optionally sends ETH reward.

**Parameters**:

- `_id` (uint256): ID of the artifact to accept
- `_rewardWei` (uint256): Amount of ETH to send as reward (in wei, can be 0)

**Returns**: None

**Access Control**: Admin only

**Gas Cost**: ~180,000 gas (includes NFT minting and potential ETH transfer)

**Requirements**:

- Artifact must exist and be in Pending status
- If `_rewardWei > 0`, contract must have sufficient balance
- Artifact cannot already be finalized (accepted or rejected)

**Events Emitted**:

- `ArtifactAccepted(uint256 indexed id, address indexed submitter, uint256 reward)`
- ERC-1155 `TransferSingle` event from minting

**Side Effects**:

- Mints 1 ERC-1155 token with ID `_id` to the submitter
- Transfers `_rewardWei` ETH to submitter (if > 0)
- Changes artifact status to Accepted

**Example Usage**:

```javascript
// Accept artifact and reward with 0.1 ETH
const rewardAmount = ethers.utils.parseEther("0.1");
await archive.acceptArtifact(artifactId, rewardAmount);

// Accept without reward
await archive.acceptArtifact(artifactId, 0);
```

---

#### `rejectArtifact`

```solidity
function rejectArtifact(uint256 _id) external onlyAdmin
```

**Description**: Admin rejects a pending artifact. No NFT is minted and no reward is given.

**Parameters**:

- `_id` (uint256): ID of the artifact to reject

**Returns**: None

**Access Control**: Admin only

**Gas Cost**: ~25,000 gas

**Requirements**:

- Artifact must exist and be in Pending status
- Artifact cannot already be finalized

**Events Emitted**: `ArtifactRejected(uint256 indexed id, address indexed submitter)`

**Side Effects**:

- Changes artifact status to Rejected
- Artifact becomes permanently rejected (cannot be re-reviewed)

**Example Usage**:

```javascript
await archive.rejectArtifact(artifactId);
```

---

#### `receiveDonation`

```solidity
function receiveDonation(string calldata _message) external payable
```

**Description**: Accept a donation with an optional message. Updates donor statistics.

**Parameters**:

- `_message` (string): Optional message from donor (not stored on-chain, only for events)

**Returns**: None

**Access Control**: Public payable

**Gas Cost**: ~65,000 gas (first donation), ~45,000 gas (subsequent donations)

**Requirements**:

- `msg.value` must be greater than 0

**Events Emitted**: `DonationReceived(address indexed from, uint256 amount)`

**Side Effects**:

- Adds ETH to contract balance
- Updates or creates donor record
- If first donation from address, adds to donors array

**Example Usage**:

```javascript
const donationAmount = ethers.utils.parseEther("0.5");
await archive.receiveDonation("Keep up the great work!", {
  value: donationAmount,
});
```

---

#### `receive`

```solidity
receive() external payable
```

**Description**: Fallback function for anonymous donations (when sending ETH directly to contract).

**Parameters**: None (ETH value via `msg.value`)

**Returns**: None

**Access Control**: Public payable

**Gas Cost**: ~65,000 gas (first donation), ~45,000 gas (subsequent donations)

**Requirements**:

- `msg.value` must be greater than 0

**Events Emitted**: `DonationReceived(address indexed from, uint256 amount)`

**Side Effects**: Same as `receiveDonation` but without message

**Example Usage**:

```javascript
// Send ETH directly to contract
await signer.sendTransaction({
  to: archiveAddress,
  value: ethers.utils.parseEther("0.25"),
});
```

---

#### `uri`

```solidity
function uri(uint256 _id) public view override returns (string memory)
```

**Description**: Returns base64-encoded JSON metadata for accepted artifacts (ERC-1155 standard).

**Parameters**:

- `_id` (uint256): Token/artifact ID

**Returns**:

- `string`: Data URI with base64-encoded JSON metadata

**Access Control**: Public view

**Gas Cost**: ~15,000 gas

**Requirements**:

- Artifact must exist and be in Accepted status

**Metadata Format**:

```json
{
  "name": "Artifact Title",
  "description": "Artifact stored in Archive Name",
  "image": "ar://arweave-uri",
  "mimeType": "image/jpeg",
  "timestamp": 1641024000
}
```

**Example Usage**:

```javascript
const tokenURI = await archive.uri(artifactId);
// Returns: "data:application/json;base64,eyJuYW1lIjoi..."

// To decode:
const base64Data = tokenURI.split(",")[1];
const jsonString = atob(base64Data);
const metadata = JSON.parse(jsonString);
```

---

#### `totalDonors`

```solidity
function totalDonors() external view returns (uint256)
```

**Description**: Returns the total number of unique donors.

**Parameters**: None

**Returns**:

- `uint256`: Number of unique addresses that have donated

**Access Control**: Public view

**Gas Cost**: ~2,400 gas

**Example Usage**:

```javascript
const donorCount = await archive.totalDonors();
```

---

#### `getDonors`

```solidity
function getDonors(uint256 offset, uint256 limit) external view returns (Donor[] memory slice)
```

**Description**: Returns a paginated list of donors with their statistics.

**Parameters**:

- `offset` (uint256): Starting index (0-based)
- `limit` (uint256): Maximum number of donors to return

**Returns**:

- `slice` (Donor[]): Array of Donor structs

**Access Control**: Public view

**Gas Cost**: ~5,000 + (1,000 \* returned donors) gas

**Example Usage**:

```javascript
// Get first 10 donors
const firstDonors = await archive.getDonors(0, 10);

// Get all donors (if you know the total)
const total = await archive.totalDonors();
const allDonors = await archive.getDonors(0, total);

// Pagination example
const pageSize = 20;
const page2Donors = await archive.getDonors(20, pageSize);
```

---

#### `getTotalArtifacts`

```solidity
function getTotalArtifacts() external view returns (uint256)
```

**Description**: Returns the total number of artifacts submitted (regardless of status).

**Parameters**: None

**Returns**:

- `uint256`: Total number of artifacts submitted

**Access Control**: Public view

**Gas Cost**: ~2,300 gas

**Example Usage**:

```javascript
const totalArtifacts = await archive.getTotalArtifacts();
```

---

#### `getArtifactsByStatus`

```solidity
function getArtifactsByStatus(Status _status, uint256 limit) external view returns (uint256[] memory ids)
```

**Description**: Returns artifact IDs filtered by status, up to a specified limit.

**Parameters**:

- `_status` (Status): Status to filter by (0=Pending, 1=Accepted, 2=Rejected)
- `limit` (uint256): Maximum number of IDs to return

**Returns**:

- `ids` (uint256[]): Array of artifact IDs matching the status

**Access Control**: Public view

**Gas Cost**: ~5,000 + (500 \* checked artifacts) gas

**Note**: This function scans from ID 1 up to `_nextId`, so gas cost increases with total artifacts

**Example Usage**:

```javascript
// Get pending artifacts for admin review
const pendingIds = await archive.getArtifactsByStatus(0, 50);

// Get accepted artifacts for display
const acceptedIds = await archive.getArtifactsByStatus(1, 100);

// Get rejected artifacts
const rejectedIds = await archive.getArtifactsByStatus(2, 25);
```

---

#### `getArchiveStats`

```solidity
function getArchiveStats() external view returns (
    uint256 totalArtifacts,
    uint256 totalDonationsWei,
    uint256 totalDonorCount
)
```

**Description**: Returns key statistics about the archive in a single call.

**Parameters**: None

**Returns**:

- `totalArtifacts` (uint256): Total number of artifacts submitted
- `totalDonationsWei` (uint256): Current contract balance (total donations minus rewards)
- `totalDonorCount` (uint256): Number of unique donors

**Access Control**: Public view

**Gas Cost**: ~4,500 gas

**Example Usage**:

```javascript
const [totalArtifacts, totalDonations, totalDonors] =
  await archive.getArchiveStats();
console.log(
  `Stats: ${totalArtifacts} artifacts, ${ethers.utils.formatEther(
    totalDonations
  )} ETH, ${totalDonors} donors`
);
```

---

#### `transferAdmin`

```solidity
function transferAdmin(address _newAdmin) external onlyAdmin
```

**Description**: Transfer administrative rights to another address.

**Parameters**:

- `_newAdmin` (address): New admin address

**Returns**: None

**Access Control**: Admin only

**Gas Cost**: ~28,000 gas

**Requirements**:

- `_newAdmin` cannot be zero address
- Only current admin can call

**Events Emitted**: `AdminTransferred(address indexed oldAdmin, address indexed newAdmin)`

**Side Effects**:

- Immediately transfers all admin privileges
- Original admin loses all admin access

**Example Usage**:

```javascript
await archive.transferAdmin("0x742d35Cc6634C0532925a3b8D7389d12345678901");
```

---

## 🔔 Events Reference

### ArchiveFactory Events

#### `ArchiveCreated`

```solidity
event ArchiveCreated(address indexed archive, string name, address indexed admin);
```

**Description**: Emitted when a new archive is created
**Parameters**:

- `archive` (indexed): Address of the new archive contract
- `name`: Name of the archive
- `admin` (indexed): Address of the archive admin

---

### Archive Events

#### `ArtifactSubmitted`

```solidity
event ArtifactSubmitted(uint256 indexed id, address indexed submitter);
```

**Description**: Emitted when a new artifact is submitted
**Parameters**:

- `id` (indexed): Unique artifact ID
- `submitter` (indexed): Address that submitted the artifact

#### `ArtifactAccepted`

```solidity
event ArtifactAccepted(uint256 indexed id, address indexed submitter, uint256 reward);
```

**Description**: Emitted when an artifact is accepted by admin
**Parameters**:

- `id` (indexed): Artifact ID
- `submitter` (indexed): Address that submitted the artifact
- `reward`: ETH reward amount in wei (can be 0)

#### `ArtifactRejected`

```solidity
event ArtifactRejected(uint256 indexed id, address indexed submitter);
```

**Description**: Emitted when an artifact is rejected by admin
**Parameters**:

- `id` (indexed): Artifact ID
- `submitter` (indexed): Address that submitted the artifact

#### `DonationReceived`

```solidity
event DonationReceived(address indexed from, uint256 amount);
```

**Description**: Emitted when a donation is received
**Parameters**:

- `from` (indexed): Donor address
- `amount`: Donation amount in wei

#### `AdminTransferred`

```solidity
event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);
```

**Description**: Emitted when admin rights are transferred
**Parameters**:

- `oldAdmin` (indexed): Previous admin address
- `newAdmin` (indexed): New admin address

---

## ⚠️ Error Codes

### ArchiveFactory Errors

- `"ArchiveFactory: empty name"` - Archive name cannot be empty string

### Archive Errors

- `"Archive: not admin"` - Function requires admin privileges
- `"Archive: empty string"` - String parameter cannot be empty
- `"Archive: zero admin address"` - Admin address cannot be zero
- `"Archive: empty name"` - Archive name cannot be empty
- `"Archive: already finalised"` - Artifact status already set (accepted/rejected)
- `"Archive: invalid artifact"` - Artifact doesn't exist or has zero submitter
- `"Archive: insufficient balance"` - Not enough ETH for reward payment
- `"Archive: zero donation"` - Donation amount must be greater than 0
- `"Archive: not accepted"` - Artifact must be accepted to access metadata
- `"Archive: zero address"` - Address parameter cannot be zero
- `"Archive: ETH transfer failed"` - ETH transfer to recipient failed

---

## ⛽ Gas Estimates

### ArchiveFactory

| Function        | Gas Cost   | Notes                |
| --------------- | ---------- | -------------------- |
| `createArchive` | ~2,100,000 | Deploys new contract |
| `totalArchives` | ~2,400     | Simple storage read  |
| `archives[i]`   | ~2,600     | Array access         |

### Archive

| Function               | First Call             | Subsequent Calls | Notes                   |
| ---------------------- | ---------------------- | ---------------- | ----------------------- |
| `submitArtifact`       | ~85,000                | ~85,000          | Consistent cost         |
| `acceptArtifact`       | ~180,000               | ~180,000         | Includes NFT mint       |
| `rejectArtifact`       | ~25,000                | ~25,000          | Simple state change     |
| `receiveDonation`      | ~65,000                | ~45,000          | First adds to array     |
| `receive`              | ~65,000                | ~45,000          | Same as receiveDonation |
| `uri`                  | ~15,000                | ~15,000          | String manipulation     |
| `totalDonors`          | ~2,400                 | ~2,400           | Simple read             |
| `getDonors`            | ~5,000 + (1k × items)  | Same             | Scales with results     |
| `getTotalArtifacts`    | ~2,300                 | ~2,300           | Simple read             |
| `getArtifactsByStatus` | ~5,000 + (500 × total) | Same             | Scans all artifacts     |
| `getArchiveStats`      | ~4,500                 | ~4,500           | Multiple reads          |
| `transferAdmin`        | ~28,000                | ~28,000          | Event emission          |

---

## 🛠️ Integration Examples

### Frontend Integration with Wagmi/Scaffold-ETH

#### Reading Archive Data

```typescript
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

// Get archive basic info
const { data: archiveName } = useScaffoldReadContract({
  contractName: "Archive",
  functionName: "name",
});

// Get archive stats
const { data: stats } = useScaffoldReadContract({
  contractName: "Archive",
  functionName: "getArchiveStats",
});

// Get pending artifacts for admin
const { data: pendingIds } = useScaffoldReadContract({
  contractName: "Archive",
  functionName: "getArtifactsByStatus",
  args: [0, 50], // Status.Pending, limit 50
});

// Get specific artifact metadata
const { data: artifactData } = useScaffoldReadContract({
  contractName: "Archive",
  functionName: "metadata",
  args: [artifactId],
});
```

#### Writing to Archive

```typescript
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const { writeContractAsync: writeArchive } = useScaffoldWriteContract({
  contractName: "Archive",
});

// Submit new artifact
const submitArtifact = async (
  title: string,
  arweaveUri: string,
  mimeType: string
) => {
  try {
    const result = await writeArchive({
      functionName: "submitArtifact",
      args: [title, arweaveUri, mimeType],
    });
    console.log("Artifact submitted:", result);
  } catch (error) {
    console.error("Error submitting:", error);
  }
};

// Make donation
const donate = async (amount: string, message: string) => {
  try {
    const result = await writeArchive({
      functionName: "receiveDonation",
      args: [message],
      value: parseEther(amount),
    });
    console.log("Donation sent:", result);
  } catch (error) {
    console.error("Error donating:", error);
  }
};

// Admin: Accept artifact with reward
const acceptArtifact = async (id: number, rewardEth: string) => {
  try {
    const result = await writeArchive({
      functionName: "acceptArtifact",
      args: [id, parseEther(rewardEth)],
    });
    console.log("Artifact accepted:", result);
  } catch (error) {
    console.error("Error accepting:", error);
  }
};
```

### Event Listening

```typescript
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

// Listen for new artifacts
const { data: artifactEvents } = useScaffoldEventHistory({
  contractName: "Archive",
  eventName: "ArtifactSubmitted",
  fromBlock: 0n,
});

// Listen for donations
const { data: donationEvents } = useScaffoldEventHistory({
  contractName: "Archive",
  eventName: "DonationReceived",
  fromBlock: 0n,
});
```

### Batch Operations

```typescript
// Get multiple artifacts with their metadata
const getArtifactsWithMetadata = async (ids: number[]) => {
  const promises = ids.map((id) =>
    readContract({
      address: archiveAddress,
      abi: archiveAbi,
      functionName: "metadata",
      args: [id],
    })
  );
  return Promise.all(promises);
};

// Get paginated donors
const getAllDonors = async () => {
  const total = await readContract({
    address: archiveAddress,
    abi: archiveAbi,
    functionName: "totalDonors",
  });

  return readContract({
    address: archiveAddress,
    abi: archiveAbi,
    functionName: "getDonors",
    args: [0, total],
  });
};
```

### Archive Factory Integration

```typescript
// Create new archive
const { writeContractAsync: writeFactory } = useScaffoldWriteContract({
  contractName: "ArchiveFactory",
});

const createArchive = async (name: string, description: string) => {
  try {
    const result = await writeFactory({
      functionName: "createArchive",
      args: [name, description, ""], // Empty baseUri
    });

    // Get archive address from event
    const receipt = await result.wait();
    const event = receipt.events?.find((e) => e.event === "ArchiveCreated");
    const archiveAddress = event?.args?.archive;

    return archiveAddress;
  } catch (error) {
    console.error("Error creating archive:", error);
  }
};

// Get all archives
const getAllArchives = async () => {
  const total = await readContract({
    address: factoryAddress,
    abi: factoryAbi,
    functionName: "totalArchives",
  });

  const promises = [];
  for (let i = 0; i < total; i++) {
    promises.push(
      readContract({
        address: factoryAddress,
        abi: factoryAbi,
        functionName: "archives",
        args: [i],
      })
    );
  }

  return Promise.all(promises);
};
```

---

This comprehensive documentation provides all the information needed for developers and designers to integrate with Memoria's smart contracts. Each function includes parameter types, return values, gas costs, access control requirements, and practical usage examples.
