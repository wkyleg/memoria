// ────────────────────────────────────────────────────────────────────────────────
// contracts/Archive.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/// @title Archive – ERC‑1155 vault of immutable community memories (Artifacts)
/// @dev One Archive per community; each Artifact is a unique token ID.
contract Archive is ERC1155, ReentrancyGuard {
    // ─────────────────────────────────────────  Types  ─────────────────────────

    enum Status {
        Pending,
        Accepted,
        Rejected
    }

    struct ArtifactMetadata {
        string title;
        string arweaveURI;
        string mimeType;
        uint256 timestamp;
        address submitter;
        Status status;
    }

    struct Donor {
        address donor;
        uint256 totalDonated;
        uint256 donationCount;
    }

    // ─────────────────────────────────────  Immutable data  ────────────────────

    string public name; // archive name
    string public description; // short blurb
    address public admin; // curator / moderator

    // ───────────────────────────────────────  Storage  ─────────────────────────

    uint256 private _nextId = 1; // starts at 1
    mapping(uint256 => ArtifactMetadata) public metadata; // id → meta
    
    // Donor tracking
    address[] public donors; // list of all donor addresses
    mapping(address => uint256) public donorIndex; // donor address → index in donors array (0 means not found)
    mapping(address => Donor) public donorInfo; // donor address → donor info

    // ───────────────────────────────────────  Events  ──────────────────────────

    event ArtifactSubmitted(uint256 indexed id, address indexed submitter);
    event ArtifactAccepted(uint256 indexed id, address indexed submitter, uint256 reward);
    event ArtifactRejected(uint256 indexed id, address indexed submitter);
    event DonationReceived(address indexed from, uint256 amount);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // ───────────────────────────────────────  Modifiers  ───────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "Archive: not admin");
        _;
    }

    modifier validString(string calldata str) {
        require(bytes(str).length > 0, "Archive: empty string");
        _;
    }

    // ──────────────────────────────────────  Constructor  ──────────────────────

    constructor(string memory _name, string memory _description, string memory _baseUri, address _admin)
        ERC1155(_baseUri)
    {
        require(_admin != address(0), "Archive: zero admin address");
        require(bytes(_name).length > 0, "Archive: empty name");
        
        name = _name;
        description = _description;
        admin = _admin;
    }

    // ───────────────────────────────────  Public Functions  ────────────────────

    /// @notice Anyone can propose a new Artifact (memory capsule)
    function submitArtifact(string calldata _title, string calldata _arweaveURI, string calldata _mimeType)
        external
        validString(_title)
        validString(_arweaveURI)
        validString(_mimeType)
        returns (uint256 id)
    {
        id = _nextId++;
        metadata[id] = ArtifactMetadata({
            title: _title,
            arweaveURI: _arweaveURI,
            mimeType: _mimeType,
            timestamp: block.timestamp,
            submitter: msg.sender,
            status: Status.Pending
        });
        emit ArtifactSubmitted(id, msg.sender);
    }

    /// @notice Admin accepts a pending Artifact, mints 1 token to submitter and optionally rewards ETH
    function acceptArtifact(uint256 _id, uint256 _rewardWei) external onlyAdmin nonReentrant {
        ArtifactMetadata storage art = metadata[_id];
        require(art.status == Status.Pending, "Archive: already finalised");
        require(art.submitter != address(0), "Archive: invalid artifact");

        art.status = Status.Accepted;
        _mint(art.submitter, _id, 1, "");

        if (_rewardWei > 0) {
            require(address(this).balance >= _rewardWei, "Archive: insufficient balance");
            _safeTransferETH(art.submitter, _rewardWei);
        }

        emit ArtifactAccepted(_id, art.submitter, _rewardWei);
    }

    /// @notice Admin rejects a pending Artifact (no mint, no reward)
    function rejectArtifact(uint256 _id) external onlyAdmin {
        ArtifactMetadata storage art = metadata[_id];
        require(art.status == Status.Pending, "Archive: already finalised");
        art.status = Status.Rejected;
        emit ArtifactRejected(_id, art.submitter);
    }

    /// @notice Anyone can donate ETH to fund future rewards
    function receiveDonation(string calldata /* _message */) external payable {
        require(msg.value > 0, "Archive: zero donation");
        _addDonor(msg.sender, msg.value);
        emit DonationReceived(msg.sender, msg.value);
    }

    /// @notice Anyone can donate ETH to fund future rewards
    receive() external payable {
        require(msg.value > 0, "Archive: zero donation");
        _addDonor(msg.sender, msg.value);
        emit DonationReceived(msg.sender, msg.value);
    }

    /// @notice Base64‑encoded, fully on‑chain metadata once the Artifact is accepted
    function uri(uint256 _id) public view override returns (string memory) {
        ArtifactMetadata memory art = metadata[_id];
        require(art.status == Status.Accepted, "Archive: not accepted");

        string memory json = string(
            abi.encodePacked(
                "{",
                '"name":"',
                art.title,
                '",',
                '"description":"Artifact stored in ',
                name,
                '",',
                '"image":"',
                art.arweaveURI,
                '",',
                '"mimeType":"',
                art.mimeType,
                '",',
                '"timestamp":',
                Strings.toString(art.timestamp),
                "}"
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
    }

    /// @notice Get total number of unique donors
    function totalDonors() external view returns (uint256) {
        return donors.length;
    }

    /// @notice Get paginated list of donors
    function getDonors(uint256 offset, uint256 limit) external view returns (Donor[] memory slice) {
        uint256 total = donors.length;
        if (offset >= total) return new Donor[](0);
        uint256 end = offset + limit;
        if (end > total) end = total;
        slice = new Donor[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            address donorAddr = donors[i];
            slice[i - offset] = donorInfo[donorAddr];
        }
    }

    /// @notice Get total number of artifacts
    function getTotalArtifacts() external view returns (uint256) {
        return _nextId - 1;
    }

    /// @notice Get artifacts by status (simple version)
    function getArtifactsByStatus(Status _status, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids) 
    {
        uint256[] memory tempIds = new uint256[](limit);
        uint256 count = 0;
        
        for (uint256 i = 1; i < _nextId && count < limit; i++) {
            if (metadata[i].status == _status) {
                tempIds[count] = i;
                count++;
            }
        }
        
        ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = tempIds[i];
        }
    }

    /// @notice Get basic archive stats
    function getArchiveStats() external view returns (
        uint256 totalArtifacts,
        uint256 totalDonationsWei,
        uint256 totalDonorCount
    ) {
        totalArtifacts = _nextId - 1;
        totalDonationsWei = address(this).balance;
        totalDonorCount = donors.length;
    }

    /// @notice Transfer admin rights to another address
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Archive: zero address");
        emit AdminTransferred(admin, _newAdmin);
        admin = _newAdmin;
    }

    // ───────────────────────────────────  Internal Functions  ──────────────────

    /// @dev Safely transfer ETH using call instead of transfer
    function _safeTransferETH(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success, "Archive: ETH transfer failed");
    }

    /// @dev Add or update donor information
    function _addDonor(address donor, uint256 amount) internal {
        if (donorIndex[donor] == 0) {
            // New donor
            donors.push(donor);
            donorIndex[donor] = donors.length; // Store 1-based index
            donorInfo[donor] = Donor({
                donor: donor,
                totalDonated: amount,
                donationCount: 1
            });
        } else {
            // Existing donor
            donorInfo[donor].totalDonated += amount;
            donorInfo[donor].donationCount += 1;
        }
    }
}
