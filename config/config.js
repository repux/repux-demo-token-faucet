const config = {
    server: {
        protocol: process.env.FAUCET_SERVER_PROTOCOL || 'https',
        port: process.env.FAUCET_SERVER_PORT || 3000,
        host: process.env.FAUCET_SERVER_HOST || 'localhost'
    },
    ssl: {
        keyPath: process.env.FAUCET_SSL_KEY_PATH || './ssl/cert.key',
        certPath: process.env.FAUCET_SSL_CERT_PATH || './ssl/cert.pem'
    },

    demoTokenAddress: process.env.FAUCET_DEMO_TOKEN_ADDRESS || '0x618231c15b548292abc0013da5e24bab350c86d2',
    account: process.env.FAUCET_ACCOUNT || '0x07f486c4ec2ade092abfe3261d0fc891e737e689',
    giveawayTokenAmounts: process.env.FAUCET_GIVEAWAY_TOKENS_AMOUNT || 100, // in ether
    ethereumHost: process.env.FAUCET_ETHEREUM_HOST || 'http://127.0.0.1:8545',
    serverApiUrl: process.env.FAUCET_SERVER_API_URL || 'https://localhost:3000'
}

module.exports = config;