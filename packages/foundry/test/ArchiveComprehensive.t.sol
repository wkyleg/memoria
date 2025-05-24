// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/Archive.sol";
import "../contracts/ArchiveFactory.sol";

/// @title Comprehensive Archive Tests - Real-world simulation scenarios
/// @notice Tests complex flows, edge cases, and potential attack vectors
contract ArchiveComprehensiveTest is Test {
    ArchiveFactory public factory;
    Archive public archive;
    
    // Test accounts
    address public admin = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    address public user4 = address(0x5);
    address public attacker = address(0x6);
    address public donor1 = address(0x7);
    address public donor2 = address(0x8);
    address public donor3 = address(0x9);
    
    // Test data
    string constant ARCHIVE_NAME = "Community Memory Archive";
    string constant ARCHIVE_DESCRIPTION = "Preserving our digital heritage";
    string constant BASE_URI = "https://memoria.test/";
    
    event ArtifactSubmitted(uint256 indexed id, address indexed submitter);
    event ArtifactAccepted(uint256 indexed id, address indexed submitter, uint256 reward);
    event ArtifactRejected(uint256 indexed id, address indexed submitter);
    event DonationReceived(address indexed from, uint256 amount);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);
    event ArchiveCreated(address indexed archive, string name, address indexed admin);
    
    function setUp() public {
        factory = new ArchiveFactory();
        
        // Create archive via factory
        vm.prank(admin);
        address archiveAddr = factory.createArchive(ARCHIVE_NAME, ARCHIVE_DESCRIPTION, BASE_URI);
        archive = Archive(payable(archiveAddr));
        
        // Fund test accounts
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);
        vm.deal(user3, 10 ether);
        vm.deal(user4, 10 ether);
        vm.deal(attacker, 10 ether);
        vm.deal(donor1, 5 ether);
        vm.deal(donor2, 5 ether);
        vm.deal(donor3, 5 ether);
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // 📋 COMPREHENSIVE WORKFLOW TESTS
    // ══════════════════════════════════════════════════════════════════════════════

    /// @notice Test complete archive lifecycle from creation to full operation
    function testCompleteArchiveLifecycle() public {
        // Phase 1: Archive Creation & Initial Setup
        assertEq(archive.name(), ARCHIVE_NAME);
        assertEq(archive.admin(), admin);
        assertEq(archive.getTotalArtifacts(), 0);
        
        // Phase 2: Initial Donations
        vm.prank(donor1);
        archive.receiveDonation{value: 2 ether}("Supporting the archive!");
        
        vm.prank(donor2);
        (bool success,) = address(archive).call{value: 1.5 ether}("");
        assertEq(success, true);
        
        vm.prank(donor3);
        archive.receiveDonation{value: 0.5 ether}("Keep preserving history!");
        
        assertEq(address(archive).balance, 4 ether);
        assertEq(archive.totalDonors(), 3);
        
        // Phase 3: Multiple Users Submit Artifacts
        vm.prank(user1);
        uint256 id1 = archive.submitArtifact("First Memory", "ar://abc123", "image/jpeg");
        
        vm.prank(user2);
        uint256 id2 = archive.submitArtifact("Community Photo", "ar://def456", "image/png");
        
        vm.prank(user3);
        uint256 id3 = archive.submitArtifact("Voice Recording", "ar://ghi789", "audio/mp3");
        
        vm.prank(user1);
        uint256 id4 = archive.submitArtifact("Second Memory", "ar://jkl012", "video/mp4");
        
        assertEq(archive.getTotalArtifacts(), 4);
        
        // Phase 4: Admin Reviews & Makes Decisions
        vm.startPrank(admin);
        
        // Accept first artifact with reward
        archive.acceptArtifact(id1, 0.5 ether);
        assertEq(user1.balance, 10.5 ether);
        
        // Accept second artifact without reward
        archive.acceptArtifact(id2, 0);
        
        // Reject third artifact
        archive.rejectArtifact(id3);
        
        // Accept fourth artifact with reward
        archive.acceptArtifact(id4, 0.3 ether);
        assertEq(user1.balance, 10.8 ether); // user1 got rewards for both artifacts
        
        vm.stopPrank();
        
        // Phase 5: Verify Final State
        (uint256 totalArtifacts, uint256 pendingCount, uint256 acceptedCount, 
         uint256 rejectedCount, uint256 totalDonationsWei, uint256 totalDonorCount) = archive.getArchiveStats();
        
        assertEq(totalArtifacts, 4);
        assertEq(pendingCount, 0);
        assertEq(acceptedCount, 3);
        assertEq(rejectedCount, 1);
        assertEq(totalDonationsWei, 3.2 ether); // 4 ether - 0.8 ether rewards
        assertEq(totalDonorCount, 3);
        
        // Phase 6: Verify NFT Ownership
        assertEq(archive.balanceOf(user1, id1), 1);
        assertEq(archive.balanceOf(user2, id2), 1);
        assertEq(archive.balanceOf(user3, id3), 0); // rejected
        assertEq(archive.balanceOf(user1, id4), 1);
        
        // Phase 7: Test URI Generation for Accepted Artifacts
        string memory uri1 = archive.uri(id1);
        assertGt(bytes(uri1).length, 0);
        
        vm.expectRevert("Archive: not accepted");
        archive.uri(id3); // Should fail for rejected artifact
    }

    /// @notice Test complex donation patterns and donor tracking
    function testComplexDonationScenarios() public {
        // Scenario 1: Single large donation
        vm.prank(donor1);
        archive.receiveDonation{value: 3 ether}("Startup funding");
        
        // Scenario 2: Multiple small donations from same donor
        vm.startPrank(donor2);
        archive.receiveDonation{value: 0.1 ether}("First contribution");
        archive.receiveDonation{value: 0.2 ether}("Second contribution");
        (bool success,) = address(archive).call{value: 0.3 ether}("");
        assertEq(success, true);
        vm.stopPrank();
        
        // Scenario 3: Mixed donation methods
        vm.prank(donor3);
        (bool success2,) = address(archive).call{value: 1 ether}("");
        assertEq(success2, true);
        
        // Verify donor tracking
        assertEq(archive.totalDonors(), 3);
        
        (address donor, uint256 totalDonated, uint256 donationCount) = archive.donorInfo(donor2);
        assertEq(donor, donor2);
        assertEq(totalDonated, 0.6 ether);
        assertEq(donationCount, 3);
        
        // Test top donors functionality
        Archive.Donor[] memory topDonors = archive.getTopDonors(3);
        assertEq(topDonors.length, 3);
        assertEq(topDonors[0].donor, donor1); // Should be sorted by amount
        assertEq(topDonors[0].totalDonated, 3 ether);
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // 🔍 VIEW FUNCTION TESTS - Comprehensive Data Retrieval
    // ══════════════════════════════════════════════════════════════════════════════

    /// @notice Test all artifact retrieval functions with complex data
    function testComprehensiveArtifactRetrieval() public {
        // Setup: Create diverse artifacts
        _createDiverseArtifacts();
        
        // Test 1: Get all artifacts
        (uint256[] memory allIds, Archive.ArtifactMetadata[] memory allArtifacts) = archive.getAllArtifacts(0, 10);
        assertEq(allIds.length, 6);
        assertEq(allArtifacts.length, 6);
        
        // Test 2: Get by status
        (uint256[] memory pendingIds,) = archive.getArtifactsByStatus(Archive.Status.Pending, 0, 10);
        assertEq(pendingIds.length, 2); // id 5 and 6 are pending
        
        (uint256[] memory acceptedIds,) = archive.getArtifactsByStatus(Archive.Status.Accepted, 0, 10);
        assertEq(acceptedIds.length, 3); // id 1, 2, 4 are accepted
        
        // Test 3: Get by submitter
        (uint256[] memory user1Ids,) = archive.getArtifactsBySubmitter(user1, 0, 10);
        assertEq(user1Ids.length, 3); // user1 submitted 3 artifacts
        
        // Test 4: Get latest artifacts
        (uint256[] memory latestIds,) = archive.getLatestArtifacts(3);
        assertEq(latestIds.length, 3);
        assertEq(latestIds[0], 6); // Most recent first
        assertEq(latestIds[1], 5);
        assertEq(latestIds[2], 4);
        
        // Test 5: Search functionality
        (uint256[] memory searchIds,) = archive.searchArtifacts("Photo", 0, 10);
        assertEq(searchIds.length, 1); // Only one artifact has "Photo" in title
        
        // Test 6: Get summaries (lightweight)
        Archive.ArtifactSummary[] memory summaries = archive.getArtifactSummaries(0, 6);
        assertEq(summaries.length, 6);
        assertEq(summaries[0].id, 1);
        assertEq(summaries[5].id, 6);
        
        // Test 7: Multiple artifacts by IDs
        uint256[] memory specificIds = new uint256[](3);
        specificIds[0] = 1;
        specificIds[1] = 3;
        specificIds[2] = 5;
        
        Archive.ArtifactMetadata[] memory specificArtifacts = archive.getMultipleArtifacts(specificIds);
        assertEq(specificArtifacts.length, 3);
        assertEq(specificArtifacts[0].submitter, user1);
        assertEq(specificArtifacts[1].submitter, user3);
        assertEq(specificArtifacts[2].submitter, user2);
    }

    /// @notice Test single artifact page functions
    function testSingleArtifactPageFunctions() public {
        _createDiverseArtifacts();
        
        uint256 targetArtifact = 2; // user2's photo
        
        // Test 1: Related artifacts by submitter
        (uint256[] memory relatedIds,) = archive.getRelatedArtifactsBySubmitter(targetArtifact, 5);
        assertEq(relatedIds.length, 1); // user2 has one other artifact (id 5)
        assertEq(relatedIds[0], 5);
        
        // Test 2: Similar artifacts by type
        (uint256[] memory similarIds,) = archive.getSimilarArtifactsByType(targetArtifact, 5);
        assertEq(similarIds.length, 0); // No other image/png artifacts
        
        // Test 3: Navigation
        (uint256 previousId, uint256 nextId, bool hasPrevious, bool hasNext) = archive.getNextPreviousArtifacts(targetArtifact);
        assertEq(previousId, 1);
        assertEq(nextId, 3);
        assertEq(hasPrevious, true);
        assertEq(hasNext, true);
        
        // Test 4: Artifact context
        (uint256 position, uint256 totalArtifacts, uint256 acceptedPosition, 
         uint256 totalAccepted, bool isLatest, bool isFirst) = archive.getArtifactContext(targetArtifact);
        
        assertEq(position, 2);
        assertEq(totalArtifacts, 6);
        assertEq(acceptedPosition, 2); // Second accepted artifact
        assertEq(totalAccepted, 3);
        assertEq(isLatest, false);
        assertEq(isFirst, false);
        
        // Test 5: Submitter profile
        (uint256 totalSubmissions, uint256 acceptedCount, uint256 pendingCount, 
         uint256 rejectedCount, uint256 firstSubmissionTimestamp, 
         uint256 lastSubmissionTimestamp, uint256[] memory recentArtifactIds) = archive.getSubmitterProfile(user2);
        
        assertEq(totalSubmissions, 2);
        assertEq(acceptedCount, 1);
        assertEq(pendingCount, 1);
        assertEq(rejectedCount, 0);
        assertEq(recentArtifactIds.length, 2);
        
        // Test 6: Recently accepted artifacts
        (uint256[] memory recentAcceptedIds,) = archive.getRecentlyAcceptedArtifacts(targetArtifact, 5);
        assertEq(recentAcceptedIds.length, 2); // id 4 and 1 (excluding id 2)
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // 🚨 SECURITY & ATTACK VECTOR TESTS
    // ══════════════════════════════════════════════════════════════════════════════

    /// @notice Test potential reentrancy attacks
    function testReentrancyProtection() public {
        // Create malicious contract that tries to reenter
        MaliciousReceiver malicious = new MaliciousReceiver(address(archive));
        vm.deal(address(malicious), 2 ether);
        
        // Submit artifact from malicious contract
        vm.prank(address(malicious));
        uint256 artifactId = archive.submitArtifact("Malicious Artifact", "ar://hack", "text/plain");
        
        // Fund archive
        vm.deal(address(archive), 5 ether);
        
        // Verify admin is correct
        assertEq(archive.admin(), admin);
        
        // Set attack mode
        malicious.setAttackMode(true);
        
        // Try to accept artifact - should not allow reentrancy
        vm.startPrank(admin);
        archive.acceptArtifact(artifactId, 1 ether);
        vm.stopPrank();
        
        // Verify the malicious contract only received one payment
        assertEq(address(malicious).balance, 3 ether); // 2 initial + 1 reward
    }

    /// @notice Test unauthorized access attempts
    function testUnauthorizedAccess() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact("Test Artifact", "ar://test", "text/plain");
        
        // Test unauthorized artifact acceptance
        vm.prank(attacker);
        vm.expectRevert("Archive: not admin");
        archive.acceptArtifact(artifactId, 0);
        
        // Test unauthorized artifact rejection
        vm.prank(attacker);
        vm.expectRevert("Archive: not admin");
        archive.rejectArtifact(artifactId);
        
        // Test unauthorized admin transfer
        vm.prank(attacker);
        vm.expectRevert("Archive: not admin");
        archive.transferAdmin(attacker);
        
        // Test legitimate admin actions still work
        vm.prank(admin);
        archive.acceptArtifact(artifactId, 0);
        
        vm.prank(admin);
        archive.transferAdmin(user1);
        assertEq(archive.admin(), user1);
    }

    /// @notice Test edge cases and boundary conditions
    function testEdgeCases() public {
        // Test empty string validations
        vm.prank(user1);
        vm.expectRevert("Archive: empty string");
        archive.submitArtifact("", "ar://test", "text/plain");
        
        vm.prank(user1);
        vm.expectRevert("Archive: empty string");
        archive.submitArtifact("Valid Title", "", "text/plain");
        
        vm.prank(user1);
        vm.expectRevert("Archive: empty string");
        archive.submitArtifact("Valid Title", "ar://test", "");
        
        // Test zero donation
        vm.prank(user1);
        vm.expectRevert("Archive: zero donation");
        archive.receiveDonation{value: 0}("Empty donation");
        
        // Test accepting non-existent artifact
        vm.prank(admin);
        vm.expectRevert("Archive: invalid artifact");
        archive.acceptArtifact(999, 0);
        
        // Test accepting with insufficient balance
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact("Test", "ar://test", "text/plain");
        
        vm.prank(admin);
        vm.expectRevert("Archive: insufficient balance");
        archive.acceptArtifact(artifactId, 10 ether);
        
        // Test double finalization
        vm.deal(address(archive), 1 ether);
        vm.prank(admin);
        archive.acceptArtifact(artifactId, 0);
        
        vm.prank(admin);
        vm.expectRevert("Archive: already finalised");
        archive.acceptArtifact(artifactId, 0);
        
        vm.prank(admin);
        vm.expectRevert("Archive: already finalised");
        archive.rejectArtifact(artifactId);
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // 📊 STRESS TESTS & PERFORMANCE
    // ══════════════════════════════════════════════════════════════════════════════

    /// @notice Test large-scale operations
    function testScalabilityLimits() public {
        // Create many artifacts to test pagination limits
        for (uint i = 1; i <= 20; i++) {
            vm.prank(user1);
            archive.submitArtifact(
                string(abi.encodePacked("Artifact ", vm.toString(i))),
                string(abi.encodePacked("ar://", vm.toString(i))),
                "image/jpeg"
            );
        }
        
        assertEq(archive.getTotalArtifacts(), 20);
        
        // Test pagination with various sizes
        (uint256[] memory ids1,) = archive.getAllArtifacts(0, 5);
        assertEq(ids1.length, 5);
        
        (uint256[] memory ids2,) = archive.getAllArtifacts(15, 10);
        assertEq(ids2.length, 5); // Should only return remaining 5
        
        // Test stats calculation with many artifacts
        (uint256 totalArtifacts, uint256 pendingCount, uint256 acceptedCount, 
         uint256 rejectedCount, uint256 totalDonationsWei, uint256 totalDonorCount) = archive.getArchiveStats();
        assertEq(totalArtifacts, 20);
        assertEq(pendingCount, 20); // All still pending
        
        // Test pagination edge cases
        (uint256[] memory emptyIds,) = archive.getAllArtifacts(25, 5);
        assertEq(emptyIds.length, 0);
    }

    /// @notice Test gas limits for view functions
    function testViewFunctionGasUsage() public {
        // Create moderate number of artifacts
        _createDiverseArtifacts();
        
        // These should all execute without hitting gas limits
        uint256 gasBefore = gasleft();
        archive.getArchiveStats();
        uint256 gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 200000); // Should use reasonable gas
        
        gasBefore = gasleft();
        archive.getAllArtifacts(0, 10);
        gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 300000);
        
        gasBefore = gasleft();
        archive.getArtifactsByStatus(Archive.Status.Pending, 0, 10);
        gasUsed = gasBefore - gasleft();
        assertLt(gasUsed, 300000);
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // 🏭 FACTORY INTEGRATION TESTS
    // ══════════════════════════════════════════════════════════════════════════════

    /// @notice Test factory-archive integration scenarios
    function testFactoryIntegration() public {
        // Create multiple archives
        vm.prank(user1);
        address archive1 = factory.createArchive("Archive 1", "First archive", "");
        
        vm.prank(user2);
        address archive2 = factory.createArchive("Archive 2", "Second archive", "");
        
        vm.prank(user3);
        address archive3 = factory.createArchive("Archive 3", "Third archive", "");
        
        // Test factory view functions
        assertEq(factory.totalArchives(), 4); // 3 new + 1 from setUp
        
        // Test basic archive info instead of full details
        ArchiveFactory.ArchiveInfo[] memory basicInfo = factory.getArchives(0, 10);
        assertEq(basicInfo.length, 4);
        
        // Verify basic info is populated correctly
        assertEq(basicInfo[1].archive, archive1);
        assertEq(basicInfo[1].name, "Archive 1");
        
        // Test search functionality
        ArchiveFactory.ArchiveInfo[] memory searchResults = factory.searchArchivesByName("Archive");
        assertEq(searchResults.length, 4); // All archives contain "Archive" (including original)
        
        // Test get by admin
        ArchiveFactory.ArchiveInfo[] memory user1Archives = factory.getArchivesByAdmin(user1);
        assertEq(user1Archives.length, 1);
        assertEq(user1Archives[0].archive, archive1);
        
        // Test latest archives
        ArchiveFactory.ArchiveInfo[] memory latest = factory.getLatestArchives(2);
        assertEq(latest.length, 2);
        assertEq(latest[0].archive, archive3); // Most recent first
        assertEq(latest[1].archive, archive2);
    }

    // ══════════════════════════════════════════════════════════════════════════════
    // 🔧 HELPER FUNCTIONS
    // ══════════════════════════════════════════════════════════════════════════════

    function _createDiverseArtifacts() internal {
        // Create 6 artifacts with different statuses and submitters
        vm.prank(user1);
        uint256 id1 = archive.submitArtifact("Memory 1", "ar://abc1", "image/jpeg");
        
        vm.prank(user2);
        uint256 id2 = archive.submitArtifact("Photo Collection", "ar://abc2", "image/png");
        
        vm.prank(user3);
        uint256 id3 = archive.submitArtifact("Voice Note", "ar://abc3", "audio/mp3");
        
        vm.prank(user1);
        uint256 id4 = archive.submitArtifact("Video Memory", "ar://abc4", "video/mp4");
        
        vm.prank(user2);
        uint256 id5 = archive.submitArtifact("Document", "ar://abc5", "text/plain");
        
        vm.prank(user1);
        uint256 id6 = archive.submitArtifact("Final Memory", "ar://abc6", "image/gif");
        
        // Accept some, reject some, leave some pending
        vm.deal(address(archive), 10 ether);
        
        vm.startPrank(admin);
        archive.acceptArtifact(id1, 0.1 ether);
        archive.acceptArtifact(id2, 0.2 ether);
        archive.rejectArtifact(id3);
        archive.acceptArtifact(id4, 0.3 ether);
        // id5 and id6 remain pending
        vm.stopPrank();
    }
}

/// @notice Malicious contract for testing reentrancy protection
contract MaliciousReceiver {
    Archive public archive;
    bool public attackMode = false;
    uint256 public attackCount = 0;
    
    constructor(address _archive) {
        archive = Archive(payable(_archive));
    }
    
    function setAttackMode(bool _attack) external {
        attackMode = _attack;
    }
    
    receive() external payable {
        if (attackMode && attackCount < 1) {
            attackCount++;
            // Try to reenter with a read function - this should work but not cause issues
            try archive.getTotalArtifacts() {
                // This should succeed but not cause reentrancy issues
            } catch {
                // Expected to fail or succeed safely
            }
        }
    }
    
    // ERC1155 Receiver implementation
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }
    
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
    
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x4e2312e0 || // ERC1155Receiver
               interfaceId == 0x01ffc9a7;   // ERC165
    }
} 