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
}
