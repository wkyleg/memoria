// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../contracts/ArchiveFactory.sol";
import "../contracts/Archive.sol";

contract ArchiveFactoryTest is Test {
    ArchiveFactory public factory;
    
    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public user3 = address(0x3);
    
    event ArchiveCreated(address indexed archive, string name, address indexed admin);
    
    function setUp() public {
        factory = new ArchiveFactory();
    }
    
    function testCreateArchive() public {
        string memory name = "Test Archive";
        string memory description = "A test archive for testing";
        string memory baseUri = "https://test.example.com/";
        
        vm.prank(user1);
        vm.expectEmit(false, false, true, true);
        emit ArchiveCreated(address(0), name, user1); // address will be different
        
        address archiveAddr = factory.createArchive(name, description, baseUri);
        
        // Verify the archive was created
        assertTrue(archiveAddr != address(0));
        
        // Verify the archive contract is properly initialized
        Archive archive = Archive(payable(archiveAddr));
        assertEq(archive.name(), name);
        assertEq(archive.description(), description);
        assertEq(archive.admin(), user1);
        
        // Verify it was added to the archives array
        assertEq(factory.totalArchives(), 1);
        
        (address storedAddr, string memory storedName) = factory.archives(0);
        assertEq(storedAddr, archiveAddr);
        assertEq(storedName, name);
    }
    
    function testCreateArchiveValidation() public {
        vm.prank(user1);
        vm.expectRevert("ArchiveFactory: empty name");
        factory.createArchive("", "Valid description", "https://test.com/");
    }
    
    function testCreateMultipleArchives() public {
        // Create first archive
        vm.prank(user1);
        address archive1 = factory.createArchive("Archive 1", "First archive", "https://test1.com/");
        
        // Create second archive
        vm.prank(user2);
        address archive2 = factory.createArchive("Archive 2", "Second archive", "https://test2.com/");
        
        // Create third archive
        vm.prank(user3);
        address archive3 = factory.createArchive("Archive 3", "Third archive", "https://test3.com/");
        
        // Verify total count
        assertEq(factory.totalArchives(), 3);
        
        // Verify each archive
        (address addr1, string memory name1) = factory.archives(0);
        (address addr2, string memory name2) = factory.archives(1);
        (address addr3, string memory name3) = factory.archives(2);
        
        assertEq(addr1, archive1);
        assertEq(name1, "Archive 1");
        assertEq(addr2, archive2);
        assertEq(name2, "Archive 2");
        assertEq(addr3, archive3);
        assertEq(name3, "Archive 3");
        
        // Verify admins are set correctly
        assertEq(Archive(payable(archive1)).admin(), user1);
        assertEq(Archive(payable(archive2)).admin(), user2);
        assertEq(Archive(payable(archive3)).admin(), user3);
    }
    
    function testGetArchivesPagination() public {
        // Create 5 archives
        vm.prank(user1);
        factory.createArchive("Archive 1", "Desc 1", "");
        factory.createArchive("Archive 2", "Desc 2", "");
        factory.createArchive("Archive 3", "Desc 3", "");
        factory.createArchive("Archive 4", "Desc 4", "");
        factory.createArchive("Archive 5", "Desc 5", "");
        
        // Test getting first 3
        ArchiveFactory.ArchiveInfo[] memory page1 = factory.getArchives(0, 3);
        assertEq(page1.length, 3);
        assertEq(page1[0].name, "Archive 1");
        assertEq(page1[1].name, "Archive 2");
        assertEq(page1[2].name, "Archive 3");
        
        // Test getting next 2
        ArchiveFactory.ArchiveInfo[] memory page2 = factory.getArchives(3, 3);
        assertEq(page2.length, 2);
        assertEq(page2[0].name, "Archive 4");
        assertEq(page2[1].name, "Archive 5");
        
        // Test getting middle slice
        ArchiveFactory.ArchiveInfo[] memory page3 = factory.getArchives(1, 2);
        assertEq(page3.length, 2);
        assertEq(page3[0].name, "Archive 2");
        assertEq(page3[1].name, "Archive 3");
    }
    
    function testGetArchivesPaginationEdgeCases() public {
        // Create 3 archives
        vm.prank(user1);
        factory.createArchive("Archive 1", "Desc 1", "");
        factory.createArchive("Archive 2", "Desc 2", "");
        factory.createArchive("Archive 3", "Desc 3", "");
        
        // Test offset beyond total
        ArchiveFactory.ArchiveInfo[] memory emptyResult = factory.getArchives(10, 5);
        assertEq(emptyResult.length, 0);
        
        // Test limit beyond remaining items
        ArchiveFactory.ArchiveInfo[] memory partialResult = factory.getArchives(2, 5);
        assertEq(partialResult.length, 1);
        assertEq(partialResult[0].name, "Archive 3");
        
        // Test getting all archives
        ArchiveFactory.ArchiveInfo[] memory allArchives = factory.getArchives(0, 100);
        assertEq(allArchives.length, 3);
        
        // Test zero limit
        ArchiveFactory.ArchiveInfo[] memory zeroLimit = factory.getArchives(0, 0);
        assertEq(zeroLimit.length, 0);
    }
    
    function testGetArchivesEmptyFactory() public {
        // Test pagination on empty factory
        ArchiveFactory.ArchiveInfo[] memory empty = factory.getArchives(0, 10);
        assertEq(empty.length, 0);
        assertEq(factory.totalArchives(), 0);
    }
    
    function testArchiveCreatedEventData() public {
        string memory name = "Test Event Archive";
        string memory description = "Testing event emission";
        string memory baseUri = "https://event.test.com/";
        
        vm.prank(user1);
        
        // Capture the event
        vm.recordLogs();
        address archiveAddr = factory.createArchive(name, description, baseUri);
        
        Vm.Log[] memory entries = vm.getRecordedLogs();
        
        // Should have one log entry
        assertEq(entries.length, 1);
        
        // Verify event signature (ArchiveCreated)
        assertEq(entries[0].topics[0], keccak256("ArchiveCreated(address,string,address)"));
        
        // Verify indexed parameters
        assertEq(address(uint160(uint256(entries[0].topics[1]))), archiveAddr); // archive address
        assertEq(address(uint160(uint256(entries[0].topics[2]))), user1); // admin address
        
        // Verify non-indexed parameter (name)
        (string memory eventName) = abi.decode(entries[0].data, (string));
        assertEq(eventName, name);
    }
    
    function testCreateArchiveWithEmptyStrings() public {
        // This test should now fail because we added validation
        vm.prank(user1);
        vm.expectRevert("ArchiveFactory: empty name");
        factory.createArchive("", "", "");
    }
    
    function testCreateArchiveWithValidEmptyOptionalFields() public {
        // Test that description and baseUri can be empty, but name cannot
        vm.prank(user1);
        address archiveAddr = factory.createArchive("Valid Name", "", "");
        
        Archive archive = Archive(payable(archiveAddr));
        assertEq(archive.name(), "Valid Name");
        assertEq(archive.description(), "");
        assertEq(archive.admin(), user1);
    }
    
    function testCreateArchiveWithLongStrings() public {
        string memory longName = "This is a very long archive name that contains many characters to test if the contract can handle long strings properly without any issues";
        string memory longDescription = "This is an extremely long description that goes on and on to test the contract's ability to handle large amounts of text data without running into any gas or storage limitations that might cause problems";
        string memory longBaseUri = "https://this-is-a-very-long-base-uri-that-might-be-used-for-some-advanced-metadata-storage-system.example.com/api/v1/metadata/";
        
        vm.prank(user1);
        address archiveAddr = factory.createArchive(longName, longDescription, longBaseUri);
        
        Archive archive = Archive(payable(archiveAddr));
        assertEq(archive.name(), longName);
        assertEq(archive.description(), longDescription);
        assertEq(archive.admin(), user1);
    }
    
    function testGasUsageForArchiveCreation() public {
        vm.prank(user1);
        uint256 gasBefore = gasleft();
        factory.createArchive("Gas Test Archive", "Testing gas usage", "https://gas.test.com/");
        uint256 gasUsed = gasBefore - gasleft();
        
        // Archive creation should use reasonable amount of gas (less than 4.5M gas)
        // This includes deploying the full Archive contract with OpenZeppelin dependencies and donor tracking
        assertLt(gasUsed, 4500000);
    }
} 