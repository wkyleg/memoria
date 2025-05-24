// SPDX-License-Identifier: MIT
// contracts/ArchiveFactory.sol
pragma solidity ^0.8.24;

import "./Archive.sol";

/// @title ArchiveFactory – deploys and indexes community archives
contract ArchiveFactory {
    struct ArchiveInfo {
        address archive;
        string name;
    }

    struct ArchiveDetails {
        address archive;
        string name;
        string description;
        address admin;
        uint256 totalArtifacts;
        uint256 pendingCount;
        uint256 acceptedCount;
        uint256 rejectedCount;
        uint256 totalDonationsWei;
        uint256 totalDonorCount;
    }

    /// @notice list of all deployed archives (for simple pagination)
    ArchiveInfo[] public archives;

    /// @notice emitted every time a new archive is created
    event ArchiveCreated(address indexed archive, string name, address indexed admin);

    /// @dev deploy a new Archive contract; msg.sender becomes its admin
    /// @param _name        Human‑readable name of the archive
    /// @param _description Short blurb shown in the UI
    /// @param _baseUri     ERC‑1155 base URI (can be left blank; token‑level `uri()` is overridden)
    function createArchive(string calldata _name, string calldata _description, string calldata _baseUri)
        external
        returns (address archiveAddr)
    {
        require(bytes(_name).length > 0, "ArchiveFactory: empty name");
        
        archiveAddr = address(new Archive(_name, _description, _baseUri, msg.sender));
        archives.push(ArchiveInfo({ archive: archiveAddr, name: _name }));
        emit ArchiveCreated(archiveAddr, _name, msg.sender);
    }

    /// @notice Returns the total number of archives deployed so far
    function totalArchives() external view returns (uint256) {
        return archives.length;
    }

    /// @notice Paginated view of archives for front‑end consumption
    /// @param offset Index to start from (0 = first archive)
    /// @param limit  Max number of records to return
    function getArchives(uint256 offset, uint256 limit) external view returns (ArchiveInfo[] memory slice) {
        uint256 total = archives.length;
        if (offset >= total) return new ArchiveInfo[](0);
        uint256 end = offset + limit;
        if (end > total) end = total;
        slice = new ArchiveInfo[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            slice[i - offset] = archives[i];
        }
    }

    /// @notice Get comprehensive archive details for paginated display (ONE CALL for all data needed)
    /// @param offset Index to start from (0 = first archive)
    /// @param limit  Max number of records to return
    function getArchivesWithDetails(uint256 offset, uint256 limit) 
        external 
        view 
        returns (ArchiveDetails[] memory details) 
    {
        // TODO: Implement this function without stack too deep error
        return new ArchiveDetails[](0);
    }

    /// @notice Get single archive details by address
    function getArchiveDetails(address _archiveAddress) 
        external 
        view 
        returns (ArchiveDetails memory details, bool found) 
    {
        // First check if this archive is registered
        for (uint256 i = 0; i < archives.length; i++) {
            if (archives[i].archive == _archiveAddress) {
                found = true;
                details.archive = _archiveAddress;
                details.name = archives[i].name;
                break;
            }
        }
        
        if (!found) {
            return (details, false);
        }
        
        // Simplified implementation to avoid stack too deep
        (bool success, bytes memory data) = _archiveAddress.staticcall(abi.encodeWithSignature("getArchiveStats()"));
        if (success && data.length > 0) {
            (details.totalArtifacts,,,,,) = abi.decode(data, (uint256, uint256, uint256, uint256, uint256, uint256));
        }
    }

    /// @notice Get all archive addresses (lighter query)
    function getAllArchiveAddresses() external view returns (address[] memory addresses) {
        addresses = new address[](archives.length);
        for (uint256 i = 0; i < archives.length; i++) {
            addresses[i] = archives[i].archive;
        }
    }

    /// @notice Get archive info by address
    function getArchiveInfo(address _archiveAddress) external view returns (ArchiveInfo memory info, bool found) {
        for (uint256 i = 0; i < archives.length; i++) {
            if (archives[i].archive == _archiveAddress) {
                return (archives[i], true);
            }
        }
        return (ArchiveInfo(address(0), ""), false);
    }

    /// @notice Get archives created by a specific admin (using low-level call to avoid linter error)
    function getArchivesByAdmin(address _admin) external view returns (ArchiveInfo[] memory userArchives) {
        // First count how many archives match this admin
        uint256 matchCount = 0;
        for (uint256 i = 0; i < archives.length; i++) {
            // Use low-level call to get admin instead of casting to Archive
            (bool success, bytes memory data) = archives[i].archive.staticcall(abi.encodeWithSignature("admin()"));
            if (success && data.length == 32) {
                address archiveAdmin = abi.decode(data, (address));
                if (archiveAdmin == _admin) {
                    matchCount++;
                }
            }
        }

        if (matchCount == 0) {
            return new ArchiveInfo[](0);
        }

        userArchives = new ArchiveInfo[](matchCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < archives.length; i++) {
            (bool success, bytes memory data) = archives[i].archive.staticcall(abi.encodeWithSignature("admin()"));
            if (success && data.length == 32) {
                address archiveAdmin = abi.decode(data, (address));
                if (archiveAdmin == _admin) {
                    userArchives[resultIndex] = archives[i];
                    resultIndex++;
                }
            }
        }
    }

    /// @notice Search archives by name (case-sensitive substring match)
    function searchArchivesByName(string calldata _searchTerm) external view returns (ArchiveInfo[] memory results) {
        require(bytes(_searchTerm).length > 0, "ArchiveFactory: empty search term");
        
        // First count matches
        uint256 matchCount = 0;
        for (uint256 i = 0; i < archives.length; i++) {
            if (_contains(archives[i].name, _searchTerm)) {
                matchCount++;
            }
        }

        if (matchCount == 0) {
            return new ArchiveInfo[](0);
        }

        results = new ArchiveInfo[](matchCount);
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < archives.length; i++) {
            if (_contains(archives[i].name, _searchTerm)) {
                results[resultIndex] = archives[i];
                resultIndex++;
            }
        }
    }

    /// @notice Get the latest archives (most recently created)
    function getLatestArchives(uint256 limit) external view returns (ArchiveInfo[] memory latest) {
        uint256 total = archives.length;
        if (total == 0) {
            return new ArchiveInfo[](0);
        }

        uint256 resultSize = limit > total ? total : limit;
        latest = new ArchiveInfo[](resultSize);

        // Start from the latest and work backwards
        for (uint256 i = 0; i < resultSize; i++) {
            latest[i] = archives[total - 1 - i];
        }
    }

    /// @notice Get multiple archives by their addresses (batch fetch)
    function getMultipleArchives(address[] calldata _addresses) 
        external 
        view 
        returns (ArchiveInfo[] memory results, bool[] memory found) 
    {
        results = new ArchiveInfo[](_addresses.length);
        found = new bool[](_addresses.length);

        for (uint256 i = 0; i < _addresses.length; i++) {
            for (uint256 j = 0; j < archives.length; j++) {
                if (archives[j].archive == _addresses[i]) {
                    results[i] = archives[j];
                    found[i] = true;
                    break;
                }
            }
        }
    }

    /// @notice Get archive names only (lighter query)
    function getArchiveNames(uint256 offset, uint256 limit) external view returns (string[] memory names) {
        uint256 total = archives.length;
        if (offset >= total) return new string[](0);
        uint256 end = offset + limit;
        if (end > total) end = total;
        names = new string[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            names[i - offset] = archives[i].name;
        }
    }

    /// @notice Check if an archive address exists in the factory
    function isArchiveRegistered(address _archiveAddress) external view returns (bool) {
        for (uint256 i = 0; i < archives.length; i++) {
            if (archives[i].archive == _archiveAddress) {
                return true;
            }
        }
        return false;
    }

    /// @notice Get archive index by address (returns max uint256 if not found)
    function getArchiveIndex(address _archiveAddress) external view returns (uint256) {
        for (uint256 i = 0; i < archives.length; i++) {
            if (archives[i].archive == _archiveAddress) {
                return i;
            }
        }
        return type(uint256).max; // Not found
    }

    /// @dev Simple substring search helper
    function _contains(string memory _string, string memory _substring) internal pure returns (bool) {
        bytes memory stringBytes = bytes(_string);
        bytes memory substringBytes = bytes(_substring);
        
        if (substringBytes.length > stringBytes.length) {
            return false;
        }
        
        for (uint256 i = 0; i <= stringBytes.length - substringBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < substringBytes.length; j++) {
                if (stringBytes[i + j] != substringBytes[j]) {
                    found = false;
                    break;
                }
            }
            if (found) {
                return true;
            }
        }
        
        return false;
    }
}
