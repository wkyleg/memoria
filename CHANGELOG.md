# Changelog

All notable changes to the Memoria project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial implementation of Memoria smart contracts
- Comprehensive documentation and README files
- Full test suite with 100% function coverage

## [1.0.0] - 2025-01-24

### Added
- **Archive Contract (ERC-1155)**
  - Artifact submission and management system
  - Admin controls for artifact acceptance/rejection
  - NFT minting for accepted artifacts
  - Comprehensive donor tracking system
  - On-chain metadata generation with Base64 encoding
  - ETH reward system for contributors
  - Secure admin transfer functionality

- **ArchiveFactory Contract**
  - Factory pattern for deploying community archives
  - Archive indexing with pagination support
  - Event emission for archive creation tracking
  - Input validation for archive parameters

- **Security Features**
  - OpenZeppelin ReentrancyGuard integration
  - Safe ETH transfers using `call()` instead of `transfer()`
  - Comprehensive input validation
  - Zero address protection
  - Admin-only function access control

- **Donor Management System**
  - Track individual donor statistics
  - Support for both named donations (with messages) and anonymous donations
  - Paginated donor viewing functions
  - Donation count and total amount tracking

- **Testing Infrastructure**
  - 36 comprehensive tests covering all functionality
  - 100% function coverage for both contracts
  - 93.33% branch coverage for Archive contract
  - Edge case and security boundary testing

- **Development Tools**
  - Local deployment scripts
  - Production deployment scripts with environment variable support
  - Foundry configuration for multiple networks
  - Gas usage optimization and monitoring

### Changed
- Updated README with comprehensive project documentation
- Enhanced smart contract documentation
- Improved project structure and organization

### Security
- Replaced `transfer()` with `call()` for ETH transfers
- Added comprehensive input validation
- Implemented reentrancy protection
- Added zero address checks throughout

## [0.1.0] - 2025-01-23

### Added
- Initial project scaffolding with Scaffold-ETH 2
- Basic project structure
- Foundry integration
- Development environment setup

---

## Release Categories

- **Added** for new features
- **Changed** for changes in existing functionality  
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for security-related changes 