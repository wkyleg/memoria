// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/ArchiveFactory.sol";

/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */
contract DeployScript is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy ArchiveFactory
        ArchiveFactory factory = new ArchiveFactory();
        console.log("ArchiveFactory deployed to:", address(factory));
        
        // Create a test archive for demo purposes
        address testArchive = factory.createArchive(
            "Memoria Test Archive",
            "A test archive for demonstrating the Memoria platform",
            "https://memoria.test/"
        );
        console.log("Test Archive deployed to:", testArchive);
        
        vm.stopBroadcast();
        
        // Summary
        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("ArchiveFactory:", address(factory));
        console.log("Test Archive:", testArchive);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("=============================");
    }
}
