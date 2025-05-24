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

    /// @notice Anyone can donate ETH to fund future rewards with a message
    function receiveDonation(string calldata _message) external payable {
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

    /// @notice Get artifacts by status with pagination
    function getArtifactsByStatus(Status _status, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        // First count how many artifacts match the status
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (metadata[i].status == _status) {
                matchCount++;
            }
        }

        if (matchCount == 0 || offset >= matchCount) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 end = offset + limit;
        if (end > matchCount) end = matchCount;
        uint256 resultSize = end - offset;

        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);

        uint256 currentMatch = 0;
        uint256 resultIndex = 0;

        for (uint256 i = 1; i < _nextId && resultIndex < resultSize; i++) {
            if (metadata[i].status == _status) {
                if (currentMatch >= offset) {
                    ids[resultIndex] = i;
                    artifacts[resultIndex] = metadata[i];
                    resultIndex++;
                }
                currentMatch++;
            }
        }
    }

    /// @notice Get total count of artifacts by status
    function getTotalArtifactsByStatus(Status _status) external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (metadata[i].status == _status) {
                count++;
            }
        }
        return count;
    }

    /// @notice Get artifacts submitted by a specific address
    function getArtifactsBySubmitter(address _submitter, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        // First count how many artifacts match the submitter
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (metadata[i].submitter == _submitter) {
                matchCount++;
            }
        }

        if (matchCount == 0 || offset >= matchCount) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 end = offset + limit;
        if (end > matchCount) end = matchCount;
        uint256 resultSize = end - offset;

        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);

        uint256 currentMatch = 0;
        uint256 resultIndex = 0;

        for (uint256 i = 1; i < _nextId && resultIndex < resultSize; i++) {
            if (metadata[i].submitter == _submitter) {
                if (currentMatch >= offset) {
                    ids[resultIndex] = i;
                    artifacts[resultIndex] = metadata[i];
                    resultIndex++;
                }
                currentMatch++;
            }
        }
    }

    /// @notice Get all artifacts with pagination (regardless of status)
    function getAllArtifacts(uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        uint256 total = _nextId - 1;
        if (total == 0 || offset >= total) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 resultSize = end - offset;

        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);

        for (uint256 i = 0; i < resultSize; i++) {
            uint256 artifactId = offset + i + 1; // artifacts start at ID 1
            ids[i] = artifactId;
            artifacts[i] = metadata[artifactId];
        }
    }

    /// @notice Get the latest artifacts (most recently submitted)
    function getLatestArtifacts(uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        uint256 total = _nextId - 1;
        if (total == 0) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 resultSize = limit > total ? total : limit;
        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);

        // Start from the latest and work backwards
        for (uint256 i = 0; i < resultSize; i++) {
            uint256 artifactId = total - i;
            ids[i] = artifactId;
            artifacts[i] = metadata[artifactId];
        }
    }

    /// @notice Get multiple artifacts by their IDs (batch fetch)
    function getMultipleArtifacts(uint256[] calldata _ids) 
        external 
        view 
        returns (ArtifactMetadata[] memory artifacts) 
    {
        artifacts = new ArtifactMetadata[](_ids.length);
        for (uint256 i = 0; i < _ids.length; i++) {
            require(_ids[i] > 0 && _ids[i] < _nextId, "Archive: invalid artifact ID");
            artifacts[i] = metadata[_ids[i]];
        }
    }

    /// @notice Get just the artifact IDs with pagination (lighter query)
    function getArtifactIds(uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids) 
    {
        uint256 total = _nextId - 1;
        if (total == 0 || offset >= total) {
            return new uint256[](0);
        }

        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 resultSize = end - offset;

        ids = new uint256[](resultSize);
        for (uint256 i = 0; i < resultSize; i++) {
            ids[i] = offset + i + 1; // artifacts start at ID 1
        }
    }

    /// @notice Check if an artifact ID exists and is valid
    function isArtifactExists(uint256 _id) external view returns (bool) {
        return _id > 0 && _id < _nextId;
    }

    /// @notice Get artifact IDs by status (lighter than full metadata)
    function getArtifactIdsByStatus(Status _status, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids) 
    {
        // First count how many artifacts match the status
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (metadata[i].status == _status) {
                matchCount++;
            }
        }

        if (matchCount == 0 || offset >= matchCount) {
            return new uint256[](0);
        }

        uint256 end = offset + limit;
        if (end > matchCount) end = matchCount;
        uint256 resultSize = end - offset;

        ids = new uint256[](resultSize);
        uint256 currentMatch = 0;
        uint256 resultIndex = 0;

        for (uint256 i = 1; i < _nextId && resultIndex < resultSize; i++) {
            if (metadata[i].status == _status) {
                if (currentMatch >= offset) {
                    ids[resultIndex] = i;
                    resultIndex++;
                }
                currentMatch++;
            }
        }
    }

    /// @notice Get artifact IDs by submitter (lighter than full metadata)
    function getArtifactIdsBySubmitter(address _submitter, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids) 
    {
        // First count how many artifacts match the submitter
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (metadata[i].submitter == _submitter) {
                matchCount++;
            }
        }

        if (matchCount == 0 || offset >= matchCount) {
            return new uint256[](0);
        }

        uint256 end = offset + limit;
        if (end > matchCount) end = matchCount;
        uint256 resultSize = end - offset;

        ids = new uint256[](resultSize);
        uint256 currentMatch = 0;
        uint256 resultIndex = 0;

        for (uint256 i = 1; i < _nextId && resultIndex < resultSize; i++) {
            if (metadata[i].submitter == _submitter) {
                if (currentMatch >= offset) {
                    ids[resultIndex] = i;
                    resultIndex++;
                }
                currentMatch++;
            }
        }
    }

    /// @notice Search artifacts by title (case-sensitive substring match)
    function searchArtifacts(string calldata _searchTerm, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        require(bytes(_searchTerm).length > 0, "Archive: empty search term");
        
        // First count matches
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (_contains(metadata[i].title, _searchTerm)) {
                matchCount++;
            }
        }

        if (matchCount == 0 || offset >= matchCount) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 end = offset + limit;
        if (end > matchCount) end = matchCount;
        uint256 resultSize = end - offset;

        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);
        
        uint256 currentMatch = 0;
        uint256 resultIndex = 0;

        for (uint256 i = 1; i < _nextId && resultIndex < resultSize; i++) {
            if (_contains(metadata[i].title, _searchTerm)) {
                if (currentMatch >= offset) {
                    ids[resultIndex] = i;
                    artifacts[resultIndex] = metadata[i];
                    resultIndex++;
                }
                currentMatch++;
            }
        }
    }

    /// @notice Get artifacts by date range
    function getArtifactsByDateRange(uint256 _startTimestamp, uint256 _endTimestamp, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        require(_startTimestamp <= _endTimestamp, "Archive: invalid date range");
        
        // First count matches in date range
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (metadata[i].timestamp >= _startTimestamp && metadata[i].timestamp <= _endTimestamp) {
                matchCount++;
            }
        }

        if (matchCount == 0 || offset >= matchCount) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 end = offset + limit;
        if (end > matchCount) end = matchCount;
        uint256 resultSize = end - offset;

        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);
        
        uint256 currentMatch = 0;
        uint256 resultIndex = 0;

        for (uint256 i = 1; i < _nextId && resultIndex < resultSize; i++) {
            if (metadata[i].timestamp >= _startTimestamp && metadata[i].timestamp <= _endTimestamp) {
                if (currentMatch >= offset) {
                    ids[resultIndex] = i;
                    artifacts[resultIndex] = metadata[i];
                    resultIndex++;
                }
                currentMatch++;
            }
        }
    }

    /// @notice Get artifacts sorted by timestamp (newest or oldest first)
    function getArtifactsSortedByDate(bool _newestFirst, uint256 offset, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        uint256 total = _nextId - 1;
        if (total == 0 || offset >= total) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 resultSize = end - offset;

        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);

        if (_newestFirst) {
            // Start from latest and work backwards
            for (uint256 i = 0; i < resultSize; i++) {
                uint256 artifactId = total - offset - i;
                ids[i] = artifactId;
                artifacts[i] = metadata[artifactId];
            }
        } else {
            // Start from oldest and work forwards
            for (uint256 i = 0; i < resultSize; i++) {
                uint256 artifactId = offset + i + 1;
                ids[i] = artifactId;
                artifacts[i] = metadata[artifactId];
            }
        }
    }

    /// @notice Get artifact summaries (lightweight - just title, ID, status, timestamp)
    struct ArtifactSummary {
        uint256 id;
        string title;
        Status status;
        uint256 timestamp;
        address submitter;
    }

    function getArtifactSummaries(uint256 offset, uint256 limit) 
        external 
        view 
        returns (ArtifactSummary[] memory summaries) 
    {
        uint256 total = _nextId - 1;
        if (total == 0 || offset >= total) {
            return new ArtifactSummary[](0);
        }

        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 resultSize = end - offset;

        summaries = new ArtifactSummary[](resultSize);
        for (uint256 i = 0; i < resultSize; i++) {
            uint256 artifactId = offset + i + 1;
            ArtifactMetadata memory meta = metadata[artifactId];
            summaries[i] = ArtifactSummary({
                id: artifactId,
                title: meta.title,
                status: meta.status,
                timestamp: meta.timestamp,
                submitter: meta.submitter
            });
        }
    }

    /// @notice Get top donors (sorted by total donated)
    function getTopDonors(uint256 limit) external view returns (Donor[] memory topDonors) {
        uint256 total = donors.length;
        if (total == 0) {
            return new Donor[](0);
        }

        uint256 resultSize = limit > total ? total : limit;
        topDonors = new Donor[](resultSize);

        // Simple selection sort for top donors (gas-expensive but view-only)
        address[] memory sortedDonors = new address[](total);
        for (uint256 i = 0; i < total; i++) {
            sortedDonors[i] = donors[i];
        }

        // Sort by totalDonated (descending)
        for (uint256 i = 0; i < total - 1; i++) {
            for (uint256 j = i + 1; j < total; j++) {
                if (donorInfo[sortedDonors[i]].totalDonated < donorInfo[sortedDonors[j]].totalDonated) {
                    address temp = sortedDonors[i];
                    sortedDonors[i] = sortedDonors[j];
                    sortedDonors[j] = temp;
                }
            }
        }

        // Return top donors
        for (uint256 i = 0; i < resultSize; i++) {
            topDonors[i] = donorInfo[sortedDonors[i]];
        }
    }

    /// @notice Get submission statistics for a user in this archive
    function getUserStats(address _user) 
        external 
        view 
        returns (
            uint256 totalSubmissions,
            uint256 pendingSubmissions,
            uint256 acceptedSubmissions,
            uint256 rejectedSubmissions
        ) 
    {
        for (uint256 i = 1; i < _nextId; i++) {
            if (metadata[i].submitter == _user) {
                totalSubmissions++;
                if (metadata[i].status == Status.Pending) {
                    pendingSubmissions++;
                } else if (metadata[i].status == Status.Accepted) {
                    acceptedSubmissions++;
                } else if (metadata[i].status == Status.Rejected) {
                    rejectedSubmissions++;
                }
            }
        }
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

    /// @notice Get comprehensive archive statistics
    function getArchiveStats() 
        external 
        view 
        returns (
            uint256 totalArtifacts,
            uint256 pendingCount,
            uint256 acceptedCount,
            uint256 rejectedCount,
            uint256 totalDonationsWei,
            uint256 totalDonorCount
        ) 
    {
        totalArtifacts = _nextId - 1;
        totalDonationsWei = address(this).balance;
        totalDonorCount = donors.length;

        // Count artifacts by status
        for (uint256 i = 1; i < _nextId; i++) {
            if (metadata[i].status == Status.Pending) {
                pendingCount++;
            } else if (metadata[i].status == Status.Accepted) {
                acceptedCount++;
            } else if (metadata[i].status == Status.Rejected) {
                rejectedCount++;
            }
        }
    }

    /// @notice Anyone can donate ETH to fund future rewards
    receive() external payable {
        require(msg.value > 0, "Archive: zero donation");
        _addDonor(msg.sender, msg.value);
        emit DonationReceived(msg.sender, msg.value);
    }

    /// @notice Transfer admin rights to another address
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Archive: zero address");
        emit AdminTransferred(admin, _newAdmin);
        admin = _newAdmin;
    }

    /// @notice Get artifacts by same submitter (excluding current artifact)
    function getRelatedArtifactsBySubmitter(uint256 _currentArtifactId, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        require(_currentArtifactId > 0 && _currentArtifactId < _nextId, "Archive: artifact does not exist");
        
        address submitter = metadata[_currentArtifactId].submitter;
        
        // Count related artifacts (excluding current one)
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (i != _currentArtifactId && metadata[i].submitter == submitter) {
                matchCount++;
            }
        }

        if (matchCount == 0) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 resultSize = limit > matchCount ? matchCount : limit;
        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);

        uint256 resultIndex = 0;
        for (uint256 i = 1; i < _nextId && resultIndex < resultSize; i++) {
            if (i != _currentArtifactId && metadata[i].submitter == submitter) {
                ids[resultIndex] = i;
                artifacts[resultIndex] = metadata[i];
                resultIndex++;
            }
        }
    }

    /// @notice Get artifacts with same mime type (excluding current artifact)
    function getSimilarArtifactsByType(uint256 _currentArtifactId, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        require(_currentArtifactId > 0 && _currentArtifactId < _nextId, "Archive: artifact does not exist");
        
        string memory mimeType = metadata[_currentArtifactId].mimeType;
        
        // Count similar artifacts (same mime type, excluding current)
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (i != _currentArtifactId && _stringsEqual(metadata[i].mimeType, mimeType)) {
                matchCount++;
            }
        }

        if (matchCount == 0) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 resultSize = limit > matchCount ? matchCount : limit;
        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);

        uint256 resultIndex = 0;
        for (uint256 i = 1; i < _nextId && resultIndex < resultSize; i++) {
            if (i != _currentArtifactId && _stringsEqual(metadata[i].mimeType, mimeType)) {
                ids[resultIndex] = i;
                artifacts[resultIndex] = metadata[i];
                resultIndex++;
            }
        }
    }

    /// @notice Get next and previous artifacts for navigation
    function getNextPreviousArtifacts(uint256 _currentArtifactId) 
        external 
        view 
        returns (
            uint256 previousId, 
            uint256 nextId,
            bool hasPrevious,
            bool hasNext
        ) 
    {
        require(_currentArtifactId > 0 && _currentArtifactId < _nextId, "Archive: artifact does not exist");
        
        // Previous artifact (lower ID that exists)
        if (_currentArtifactId > 1) {
            previousId = _currentArtifactId - 1;
            hasPrevious = true;
        }
        
        // Next artifact (higher ID that exists)
        if (_currentArtifactId < _nextId - 1) {
            nextId = _currentArtifactId + 1;
            hasNext = true;
        }
    }

    /// @notice Get artifact context and position in archive
    function getArtifactContext(uint256 _artifactId) 
        external 
        view 
        returns (
            uint256 position,
            uint256 totalArtifacts,
            uint256 acceptedPosition, // position among accepted artifacts only
            uint256 totalAccepted,
            bool isLatest,
            bool isFirst
        ) 
    {
        require(_artifactId > 0 && _artifactId < _nextId, "Archive: artifact does not exist");
        
        totalArtifacts = _nextId - 1;
        position = _artifactId;
        isFirst = (_artifactId == 1);
        isLatest = (_artifactId == totalArtifacts);
        
        // Count accepted artifacts and find position among accepted
        if (metadata[_artifactId].status == Status.Accepted) {
            uint256 acceptedCount = 0;
            uint256 acceptedPos = 0;
            
            for (uint256 i = 1; i <= _artifactId; i++) {
                if (metadata[i].status == Status.Accepted) {
                    acceptedCount++;
                    if (i == _artifactId) {
                        acceptedPos = acceptedCount;
                    }
                }
            }
            
            // Count total accepted
            for (uint256 i = _artifactId + 1; i < _nextId; i++) {
                if (metadata[i].status == Status.Accepted) {
                    acceptedCount++;
                }
            }
            
            acceptedPosition = acceptedPos;
            totalAccepted = acceptedCount;
        }
    }

    /// @notice Get submitter's profile within this archive
    function getSubmitterProfile(address _submitter) 
        external 
        view 
        returns (
            uint256 totalSubmissions,
            uint256 acceptedCount,
            uint256 pendingCount, 
            uint256 rejectedCount,
            uint256 firstSubmissionTimestamp,
            uint256 lastSubmissionTimestamp,
            uint256[] memory recentArtifactIds
        ) 
    {
        uint256[] memory allIds = new uint256[](_nextId);
        uint256 count = 0;
        
        // Collect all artifact IDs by this submitter
        for (uint256 i = 1; i < _nextId; i++) {
            if (metadata[i].submitter == _submitter) {
                allIds[count] = i;
                count++;
                
                // Track timestamps
                if (firstSubmissionTimestamp == 0 || metadata[i].timestamp < firstSubmissionTimestamp) {
                    firstSubmissionTimestamp = metadata[i].timestamp;
                }
                if (metadata[i].timestamp > lastSubmissionTimestamp) {
                    lastSubmissionTimestamp = metadata[i].timestamp;
                }
                
                // Count by status
                if (metadata[i].status == Status.Accepted) {
                    acceptedCount++;
                } else if (metadata[i].status == Status.Pending) {
                    pendingCount++;
                } else if (metadata[i].status == Status.Rejected) {
                    rejectedCount++;
                }
            }
        }
        
        totalSubmissions = count;
        
        // Return up to 5 most recent artifact IDs
        uint256 recentCount = count > 5 ? 5 : count;
        recentArtifactIds = new uint256[](recentCount);
        
        // Get the most recent ones (highest IDs)
        uint256 recentIndex = 0;
        for (uint256 i = count; i > 0 && recentIndex < recentCount; i--) {
            recentArtifactIds[recentIndex] = allIds[i - 1];
            recentIndex++;
        }
    }

    /// @notice Get artifacts from similar time period (within 30 days)
    function getArtifactsFromSimilarPeriod(uint256 _artifactId, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        require(_artifactId > 0 && _artifactId < _nextId, "Archive: artifact does not exist");
        
        uint256 targetTimestamp = metadata[_artifactId].timestamp;
        uint256 timePeriod = 30 days; // 30 days before and after
        uint256 startTime = targetTimestamp > timePeriod ? targetTimestamp - timePeriod : 0;
        uint256 endTime = targetTimestamp + timePeriod;
        
        // Count artifacts in similar time period (excluding current)
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (i != _artifactId && 
                metadata[i].timestamp >= startTime && 
                metadata[i].timestamp <= endTime) {
                matchCount++;
            }
        }

        if (matchCount == 0) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 resultSize = limit > matchCount ? matchCount : limit;
        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);

        uint256 resultIndex = 0;
        for (uint256 i = 1; i < _nextId && resultIndex < resultSize; i++) {
            if (i != _artifactId && 
                metadata[i].timestamp >= startTime && 
                metadata[i].timestamp <= endTime) {
                ids[resultIndex] = i;
                artifacts[resultIndex] = metadata[i];
                resultIndex++;
            }
        }
    }

    /// @notice Get recently accepted artifacts (for "More from this archive" section)
    function getRecentlyAcceptedArtifacts(uint256 _excludeId, uint256 limit) 
        external 
        view 
        returns (uint256[] memory ids, ArtifactMetadata[] memory artifacts) 
    {
        // Count accepted artifacts excluding the current one
        uint256 matchCount = 0;
        for (uint256 i = 1; i < _nextId; i++) {
            if (i != _excludeId && metadata[i].status == Status.Accepted) {
                matchCount++;
            }
        }

        if (matchCount == 0) {
            return (new uint256[](0), new ArtifactMetadata[](0));
        }

        uint256 resultSize = limit > matchCount ? matchCount : limit;
        ids = new uint256[](resultSize);
        artifacts = new ArtifactMetadata[](resultSize);

        uint256 resultIndex = 0;
        // Start from the end (most recent) and work backwards
        for (uint256 i = _nextId - 1; i >= 1 && resultIndex < resultSize; i--) {
            if (i != _excludeId && metadata[i].status == Status.Accepted) {
                ids[resultIndex] = i;
                artifacts[resultIndex] = metadata[i];
                resultIndex++;
            }
        }
    }

    /// @dev Helper function to compare strings
    function _stringsEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
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
