// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/ArchiveFactory.sol";

contract DeployLocal is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy the ArchiveFactory
        ArchiveFactory factory = new ArchiveFactory();
        
        console.log("ArchiveFactory deployed to:", address(factory));
        
        vm.stopBroadcast();
    }
} 