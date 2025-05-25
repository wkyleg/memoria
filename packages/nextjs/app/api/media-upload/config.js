// Arweave network configuration
const NETWORKS = {
    mainnet: {
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        name: 'Mainnet'
    },
    testnet: {
        host: 'testnet.arweave.net',
        port: 443,
        protocol: 'https',
        name: 'Testnet'
    },
    devnet: {
        host: 'testnet.redstone.tools',
        port: 443,
        protocol: 'https',
        name: 'Devnet'
    },
    local: {
        host: 'localhost',
        port: 1984,
        protocol: 'http',
        name: 'Local'
    }
};

// Change this to 'mainnet' for production, 'testnet' for testing
const CURRENT_NETWORK = 'mainnet'; // Using mainnet since testnet is broken

module.exports = {
    NETWORKS,
    CURRENT_NETWORK,
    getNetworkConfig: () => NETWORKS[CURRENT_NETWORK]
};
