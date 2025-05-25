// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/Archive.sol";

contract ArchiveTest is Test {
    Archive public archive;
    
    address public admin = address(0x1);
    address public user1 = address(0x2);
    address public user2 = address(0x3);
    address public user3 = address(0x4);
    
    string constant ARCHIVE_NAME = "Test Community Archive";
    string constant ARCHIVE_DESCRIPTION = "A test archive for our community memories";
    string constant BASE_URI = "https://test.example.com/";
    
    string constant ARTIFACT_TITLE = "My First Memory";
    string constant ARTIFACT_ARWEAVE_URI = "ar://test123456789";
    string constant ARTIFACT_MIME_TYPE = "image/jpeg";
    
    event ArtifactSubmitted(uint256 indexed id, address indexed submitter);
    event ArtifactAccepted(uint256 indexed id, address indexed submitter, uint256 reward);
    event ArtifactRejected(uint256 indexed id, address indexed submitter);
    event DonationReceived(address indexed from, uint256 amount);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);
    
    function setUp() public {
        vm.prank(admin);
        archive = new Archive(ARCHIVE_NAME, ARCHIVE_DESCRIPTION, BASE_URI, admin);
    }
    
    function testInitialState() public view {
        assertEq(archive.name(), ARCHIVE_NAME);
        assertEq(archive.description(), ARCHIVE_DESCRIPTION);
        assertEq(archive.admin(), admin);
        (, , uint256 totalDonorCount) = archive.getArchiveInfo();
        assertEq(totalDonorCount, 0);
    }
    
    function testConstructorValidation() public {
        // Test zero admin address
        vm.expectRevert("Archive: zero admin address");
        new Archive(ARCHIVE_NAME, ARCHIVE_DESCRIPTION, BASE_URI, address(0));
        
        // Test empty name
        vm.expectRevert("Archive: empty name");
        new Archive("", ARCHIVE_DESCRIPTION, BASE_URI, admin);
    }
    
    function testSubmitArtifactValidation() public {
        // Test empty title
        vm.prank(user1);
        vm.expectRevert("Archive: empty string");
        archive.submitArtifact("", ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        // Test empty arweave URI
        vm.prank(user1);
        vm.expectRevert("Archive: empty string");
        archive.submitArtifact(ARTIFACT_TITLE, "", ARTIFACT_MIME_TYPE);
        
        // Test empty mime type
        vm.prank(user1);
        vm.expectRevert("Archive: empty string");
        archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, "");
    }
    
    function testSubmitArtifact() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit ArtifactSubmitted(1, user1);
        
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        assertEq(artifactId, 1);
        
        (string memory title, string memory arweaveURI, string memory mimeType, uint256 timestamp, address submitter, Archive.Status status) = archive.metadata(artifactId);
        
        assertEq(title, ARTIFACT_TITLE);
        assertEq(arweaveURI, ARTIFACT_ARWEAVE_URI);
        assertEq(mimeType, ARTIFACT_MIME_TYPE);
        assertEq(submitter, user1);
        assertEq(uint8(status), uint8(Archive.Status.Pending));
        assertGt(timestamp, 0);
    }
    
    function testReceiveDonation() public {
        uint256 donationAmount = 0.5 ether;
        string memory message = "Supporting the community!";
        
        vm.deal(user1, donationAmount);
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit DonationReceived(user1, donationAmount);
        
        archive.receiveDonation{value: donationAmount}(message);
        
        assertEq(address(archive).balance, donationAmount);
        (, , uint256 totalDonorCount) = archive.getArchiveInfo();
        assertEq(totalDonorCount, 1);
        
        (address donor, uint256 totalDonated, uint256 donationCount) = archive.donorInfo(user1);
        assertEq(donor, user1);
        assertEq(totalDonated, donationAmount);
        assertEq(donationCount, 1);
    }
    
    function testReceiveDonationZeroValue() public {
        vm.prank(user1);
        vm.expectRevert("Archive: zero donation");
        archive.receiveDonation{value: 0}("test");
    }
    
    function testReceiveFunction() public {
        uint256 donationAmount = 0.3 ether;
        
        vm.deal(user2, donationAmount);
        vm.prank(user2);
        vm.expectEmit(true, false, false, true);
        emit DonationReceived(user2, donationAmount);
        
        (bool success,) = address(archive).call{value: donationAmount}("");
        assertEq(success, true);
        
        assertEq(address(archive).balance, donationAmount);
        (, , uint256 totalDonorCount) = archive.getArchiveInfo();
        assertEq(totalDonorCount, 1);
        
        (address donor, uint256 totalDonated, uint256 donationCount) = archive.donorInfo(user2);
        assertEq(donor, user2);
        assertEq(totalDonated, donationAmount);
        assertEq(donationCount, 1);
    }
    
    function testReceiveZeroValue() public {
        vm.prank(user1);
        // The call will succeed but the contract will revert internally
        // This results in success=false and we don't get the revert reason
        (bool success,) = address(archive).call{value: 0}("");
        assertEq(success, false);
    }
    
    function testMultipleDonationsFromSameDonor() public {
        vm.deal(user1, 2 ether);
        
        // First donation
        vm.prank(user1);
        archive.receiveDonation{value: 0.5 ether}("First donation");
        
        // Second donation
        vm.prank(user1);
        archive.receiveDonation{value: 0.3 ether}("Second donation");
        
        assertEq(address(archive).balance, 0.8 ether);
        (, , uint256 totalDonorCount) = archive.getArchiveInfo();
        assertEq(totalDonorCount, 1);
        
        (address donor, uint256 totalDonated, uint256 donationCount) = archive.donorInfo(user1);
        assertEq(donor, user1);
        assertEq(totalDonated, 0.8 ether);
        assertEq(donationCount, 2);
    }
    
    function testMultipleDonorsTracking() public {
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.deal(user3, 1 ether);
        
        // User1 donates
        vm.prank(user1);
        archive.receiveDonation{value: 0.5 ether}("From user1");
        
        // User2 donates
        vm.prank(user2);
        archive.receiveDonation{value: 0.3 ether}("From user2");
        
        // User3 donates via receive
        vm.prank(user3);
        (bool success,) = address(archive).call{value: 0.2 ether}("");
        assertEq(success, true);
        
        assertEq(address(archive).balance, 1.0 ether);
        (, , uint256 totalDonorCount) = archive.getArchiveInfo();
        assertEq(totalDonorCount, 3);
        
        // Check individual donor info
        (address donor1, uint256 total1, uint256 count1) = archive.donorInfo(user1);
        assertEq(donor1, user1);
        assertEq(total1, 0.5 ether);
        assertEq(count1, 1);
        
        (address donor2, uint256 total2, uint256 count2) = archive.donorInfo(user2);
        assertEq(donor2, user2);
        assertEq(total2, 0.3 ether);
        assertEq(count2, 1);
        
        (address donor3, uint256 total3, uint256 count3) = archive.donorInfo(user3);
        assertEq(donor3, user3);
        assertEq(total3, 0.2 ether);
        assertEq(count3, 1);
    }
    
    function testGetDonorsPagination() public {
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.deal(user3, 1 ether);
        
        // Add donations
        vm.prank(user1);
        archive.receiveDonation{value: 0.5 ether}("Donor 1");
        
        vm.prank(user2);
        archive.receiveDonation{value: 0.3 ether}("Donor 2");
        
        vm.prank(user3);
        archive.receiveDonation{value: 0.2 ether}("Donor 3");
        
        // Test getting all donors
        Archive.Donor[] memory allDonors = archive.getDonors(0, 10);
        assertEq(allDonors.length, 3);
        
        // Test pagination
        Archive.Donor[] memory firstTwo = archive.getDonors(0, 2);
        assertEq(firstTwo.length, 2);
        assertEq(firstTwo[0].donor, user1);
        assertEq(firstTwo[1].donor, user2);
        
        Archive.Donor[] memory lastOne = archive.getDonors(2, 2);
        assertEq(lastOne.length, 1);
        assertEq(lastOne[0].donor, user3);
        
        // Test offset beyond total
        Archive.Donor[] memory empty = archive.getDonors(10, 5);
        assertEq(empty.length, 0);
    }
    
    function testAcceptArtifact() public {
        // First submit an artifact
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        // Fund the archive
        vm.deal(address(archive), 1 ether);
        
        // Accept the artifact with reward
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit ArtifactAccepted(artifactId, user1, 0.1 ether);
        
        archive.acceptArtifact(artifactId, 0.1 ether);
        
        // Check status
        (, , , , , Archive.Status status) = archive.metadata(artifactId);
        assertEq(uint8(status), uint8(Archive.Status.Accepted));
        
        // Check NFT was minted
        assertEq(archive.balanceOf(user1, artifactId), 1);
        
        // Check user received reward
        assertEq(user1.balance, 0.1 ether);
    }
    
    function testAcceptArtifactWithoutReward() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit ArtifactAccepted(artifactId, user1, 0);
        
        archive.acceptArtifact(artifactId, 0);
        
        (, , , , , Archive.Status status) = archive.metadata(artifactId);
        assertEq(uint8(status), uint8(Archive.Status.Accepted));
        assertEq(archive.balanceOf(user1, artifactId), 1);
        assertEq(user1.balance, 0);
    }
    
    function testRejectArtifact() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit ArtifactRejected(artifactId, user1);
        
        archive.rejectArtifact(artifactId);
        
        (, , , , , Archive.Status status) = archive.metadata(artifactId);
        assertEq(uint8(status), uint8(Archive.Status.Rejected));
        assertEq(archive.balanceOf(user1, artifactId), 0);
    }
    
    function testOnlyAdminCanAcceptArtifact() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        vm.prank(user2);
        vm.expectRevert("Archive: not admin");
        archive.acceptArtifact(artifactId, 0);
    }
    
    function testOnlyAdminCanRejectArtifact() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        vm.prank(user2);
        vm.expectRevert("Archive: not admin");
        archive.rejectArtifact(artifactId);
    }
    
    function testCannotAcceptAlreadyFinalizedArtifact() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        vm.prank(admin);
        archive.acceptArtifact(artifactId, 0);
        
        vm.prank(admin);
        vm.expectRevert("Archive: already finalised");
        archive.acceptArtifact(artifactId, 0);
    }
    
    function testCannotRejectAlreadyFinalizedArtifact() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        vm.prank(admin);
        archive.acceptArtifact(artifactId, 0);
        
        vm.prank(admin);
        vm.expectRevert("Archive: already finalised");
        archive.rejectArtifact(artifactId);
    }
    
    function testInsufficientBalanceForReward() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        vm.prank(admin);
        vm.expectRevert("Archive: insufficient balance");
        archive.acceptArtifact(artifactId, 1 ether);
    }
    
    function testTransferAdmin() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, false);
        emit AdminTransferred(admin, user1);
        
        archive.transferAdmin(user1);
        assertEq(archive.admin(), user1);
    }
    
    function testCannotTransferAdminToZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert("Archive: zero address");
        archive.transferAdmin(address(0));
    }
    
    function testOnlyAdminCanTransferAdmin() public {
        vm.prank(user1);
        vm.expectRevert("Archive: not admin");
        archive.transferAdmin(user2);
    }
    
    function testUriForAcceptedArtifact() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        vm.prank(admin);
        archive.acceptArtifact(artifactId, 0);
        
        string memory uri = archive.uri(artifactId);
        
        // The URI should be the Arweave URI directly
        assertEq(uri, ARTIFACT_ARWEAVE_URI);
    }
    
    function testUriForNonAcceptedArtifact() public {
        vm.prank(user1);
        uint256 artifactId = archive.submitArtifact(ARTIFACT_TITLE, ARTIFACT_ARWEAVE_URI, ARTIFACT_MIME_TYPE);
        
        vm.expectRevert("Archive: not accepted");
        archive.uri(artifactId);
    }
    
    function testMultipleArtifacts() public {
        // Submit multiple artifacts
        vm.prank(user1);
        uint256 id1 = archive.submitArtifact("Artifact 1", "ar://123", "image/jpeg");
        
        vm.prank(user2);
        uint256 id2 = archive.submitArtifact("Artifact 2", "ar://456", "image/png");
        
        assertEq(id1, 1);
        assertEq(id2, 2);
        
        // Accept one, reject the other
        vm.prank(admin);
        archive.acceptArtifact(id1, 0);
        
        vm.prank(admin);
        archive.rejectArtifact(id2);
        
        // Check final states
        (, , , , , Archive.Status status1) = archive.metadata(id1);
        (, , , , , Archive.Status status2) = archive.metadata(id2);
        
        assertEq(uint8(status1), uint8(Archive.Status.Accepted));
        assertEq(uint8(status2), uint8(Archive.Status.Rejected));
        
        assertEq(archive.balanceOf(user1, id1), 1);
        assertEq(archive.balanceOf(user2, id2), 0);
    }
} 