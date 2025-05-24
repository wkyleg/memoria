// SPDX-License-Identifier: MIT
// contracts/ArchiveFactory.sol
pragma solidity ^0.8.24;

import "./Archive.sol";

/// @title ArchiveFactory – deploys and indexes community archives
contract ArchiveFactory {
    /// @notice list of all deployed archive addresses
    address[] public archives;

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
        archives.push(archiveAddr);
        emit ArchiveCreated(archiveAddr, _name, msg.sender);
    }

    /// @notice Returns the total number of archives deployed so far
    function totalArchives() external view returns (uint256) {
        return archives.length;
    }
}
