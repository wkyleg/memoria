// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/ArchiveFactory.sol";

contract DeployMemoria is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the ArchiveFactory
        ArchiveFactory factory = new ArchiveFactory();
        
        console.log("ArchiveFactory deployed to:", address(factory));
        
        vm.stopBroadcast();
    }
} 