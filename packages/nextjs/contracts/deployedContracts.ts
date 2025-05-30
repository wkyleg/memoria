/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import type { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  11155111: {
    ArchiveFactory: {
      address: "0x371cb38b81ae204a7950ff31b3caa1a5b563b1de",
      abi: [
        {
          type: "function",
          name: "archives",
          inputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "createArchive",
          inputs: [
            {
              name: "_name",
              type: "string",
              internalType: "string",
            },
            {
              name: "_description",
              type: "string",
              internalType: "string",
            },
            {
              name: "_baseUri",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [
            {
              name: "archiveAddr",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "totalArchives",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "ArchiveCreated",
          inputs: [
            {
              name: "archive",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "name",
              type: "string",
              indexed: false,
              internalType: "string",
            },
            {
              name: "admin",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1748134320.json",
      deploymentScript: "Deploy.s.sol",
    },
    Archive: {
      address: "0x641852f2fcDE504E3A5E838fE54f92a498a6e197",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_name",
              type: "string",
              internalType: "string",
            },
            {
              name: "_description",
              type: "string",
              internalType: "string",
            },
            {
              name: "_baseUri",
              type: "string",
              internalType: "string",
            },
            {
              name: "_admin",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "receive",
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "acceptArtifact",
          inputs: [
            {
              name: "_id",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_rewardWei",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "admin",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "description",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getArchiveInfo",
          inputs: [],
          outputs: [
            {
              name: "nextArtifactId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "balance",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "totalDonorCount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getArtifact",
          inputs: [
            {
              name: "_id",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "title",
              type: "string",
              internalType: "string",
            },
            {
              name: "arweaveURI",
              type: "string",
              internalType: "string",
            },
            {
              name: "mimeType",
              type: "string",
              internalType: "string",
            },
            {
              name: "timestamp",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "submitter",
              type: "address",
              internalType: "address",
            },
            {
              name: "status",
              type: "uint8",
              internalType: "enum Archive.Status",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getDonors",
          inputs: [
            {
              name: "offset",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "limit",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "slice",
              type: "tuple[]",
              internalType: "struct Archive.Donor[]",
              components: [
                {
                  name: "donor",
                  type: "address",
                  internalType: "address",
                },
                {
                  name: "totalDonated",
                  type: "uint256",
                  internalType: "uint256",
                },
                {
                  name: "donationCount",
                  type: "uint256",
                  internalType: "uint256",
                },
              ],
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getTotalArtifacts",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "name",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "receiveDonation",
          inputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "rejectArtifact",
          inputs: [
            {
              name: "_id",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "submitArtifact",
          inputs: [
            {
              name: "_title",
              type: "string",
              internalType: "string",
            },
            {
              name: "_arweaveURI",
              type: "string",
              internalType: "string",
            },
            {
              name: "_mimeType",
              type: "string",
              internalType: "string",
            },
          ],
          outputs: [
            {
              name: "id",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferAdmin",
          inputs: [
            {
              name: "_newAdmin",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "uri",
          inputs: [
            {
              name: "_id",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "AdminTransferred",
          inputs: [
            {
              name: "oldAdmin",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "newAdmin",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "ArtifactAccepted",
          inputs: [
            {
              name: "id",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "submitter",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "reward",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "ArtifactRejected",
          inputs: [
            {
              name: "id",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "submitter",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "ArtifactSubmitted",
          inputs: [
            {
              name: "id",
              type: "uint256",
              indexed: true,
              internalType: "uint256",
            },
            {
              name: "submitter",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "DonationReceived",
          inputs: [
            {
              name: "from",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
      ],
      inheritedFunctions: {},
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
