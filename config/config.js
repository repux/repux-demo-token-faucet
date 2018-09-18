const config = {
    server: {
        protocol: process.env.FAUCET_SERVER_PROTOCOL || 'http',
        port: process.env.FAUCET_SERVER_PORT || 3000,
        host: process.env.FAUCET_SERVER_HOST || 'localhost'
    },
    ssl: {
        keyPath: process.env.FAUCET_SSL_KEY_PATH || './ssl/cert.key',
        certPath: process.env.FAUCET_SSL_CERT_PATH || './ssl/cert.pem'
    },

    demoTokenAddress: process.env.FAUCET_DEMO_TOKEN_ADDRESS || '0xbd83c21e6f0a9547abe908c6faa02a55512d57b4',
    freeEthSourceAddress: process.env.FAUCET_FREE_ETH_SOURCE_ADDRESS || '0x107a1dc2a74adb3c0fdddb20614b1bdabf35a8a8',
    freeEthAmount: process.env.FAUCET_FREE_ETH_AMOUNT || 0.1,
    account: process.env.FAUCET_ACCOUNT || '0x107a1dc2a74adb3c0fdddb20614b1bdabf35a8a8',
    giveawayTokenAmounts: process.env.FAUCET_GIVEAWAY_TOKENS_AMOUNT || 100, // in ether
    throttleTimeInSeconds: process.env.FAUCET_THROTTLE_TIME_IN_SECONDS || 60,
    ethereumHost: process.env.FAUCET_ETHEREUM_HOST || 'http://localhost:8545',
    serverApiUrl: process.env.FAUCET_SERVER_API_URL || 'http://localhost:3000',
    mongodbUri: process.env.FAUCET_SERVER_MONGODB_URI || 'mongodb://localhost:27017/repux_demo_token_faucet'
}

module.exports = config;
