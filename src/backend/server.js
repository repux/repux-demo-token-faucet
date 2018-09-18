const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const mongoose = require('mongoose');
const config = require('./../../config/config.js');
const bodyParser = require('body-parser');
const HttpStatusCode = require('http-status-codes');
const logger = require('./logger');
const Issue = require('./models/issue-model');
const { DemoToken, web3 } = require('./demo-token');
const sendEth = require('./utils/send-eth');
const secondsToFormattedTime = require('./utils/seconds-to-formatted-time');

logger.info('[init] DemoToken address set to: ' + config.demoTokenAddress);
logger.info('[init] Connecting to: ' + config.ethereumHost);
logger.info('[init] Getting demo token: ' + config.demoTokenAddress);
logger.info('[init] Connecting to mongodb: ' + config.mongodbUri);

let tokenInstance = null;
const useSSL = config.server.protocol === 'https';
const serverConfig = {
    host: config.server.host,
    port: config.server.port
};

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(headerSetup);
app.get('/', appVersionHandler);
app.post('/issue-demo-token', issueDemoTokenHandler);

Promise.resolve()
    .then(() => DemoToken.at(config.demoTokenAddress))
    .then(response => {
        tokenInstance = response;
        useSSL === true ? runHttpsServer() : runHttpServer();
    })
    .then(() => mongoose.connect(config.mongodbUri, {
        useNewUrlParser: true,
        useCreateIndex: true
    }))
    .then(() => logger.info('[init] initialization success.'))
    .catch((e) => {
        logger.error(`[init] initialization failed: ${e.message}`);
        process.exit();
    });

function headerSetup(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Content-Type', 'application/json');

    next();
}

function appVersionHandler(req, res) {
    res.send('version: 0.3');
};

async function issueDemoTokenHandler(req, res) {
    const data = req.body;
    if (!web3.isAddress(data.recipientAddress)) {
        let message = `Incorrect wallet address`;
        logger.info(message);
        res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).send(message);
        return;
    }

    const isThrottled = await Issue.method.isAddressThrottled(data.recipientAddress, config.throttleTimeInSeconds);
    if (isThrottled.result) {
        const remainingTime = secondsToFormattedTime(isThrottled.secondsUntilUnblock);
        let message = `You have already requested for a free demo tokens. You can request for 100 demo tokens in next ${remainingTime}`;
        res.status(HttpStatusCode.TOO_MANY_REQUESTS).send(message);
        return;
    }

    let issue = new Issue.model({
        address: data.recipientAddress,
        tokensAmount: config.giveawayTokenAmounts
    });

    try {
        await issue.save();
    }
    catch (e) {
        logger.error(`[mongodb][save] ${e.message}`);
        res.sendStatus(HttpStatusCode.BAD_REQUEST);
        return;
    }

    const value = web3.toWei(config.giveawayTokenAmounts, 'ether');
    try {
        logger.info(`[blockchain] Issue demo token. Recipient: ${data.recipientAddress} value ${value} `);
        await tokenInstance.issue(data.recipientAddress, value, { from: config.account });
        await executeSendEthTransaction(data.recipientAddress);

        res
            .status(HttpStatusCode.OK)
            .send(JSON.stringify({ result: 'OK' }));
    }
    catch (e) {
        issue.remove();
        logger.error(`recipient: ${data.recipientAddress} have same errors.${e.message}`);
        res.sendStatus(HttpStatusCode.BAD_REQUEST);
    }
}

function runHttpsServer() {
    const httpsConfig = {
        key: fs.readFileSync(config.ssl.keyPath),
        cert: fs.readFileSync(config.ssl.certPath)
    };
    https.createServer(httpsConfig, app).listen(serverConfig, () => {
        logger.info(`[init] Listening on https://${config.server.host}:${config.server.port}. Loaded certs: ${config.ssl.keyPath}, ${config.ssl.certPath}`);
    });
}

function runHttpServer() {
    http.createServer(app).listen(serverConfig, () => {
        logger.info(`[init] Listening on http://${config.server.host}:${config.server.port}`);
    });
}

async function executeSendEthTransaction(recipientAddress) {
    try {
        logger.info(`[blockchain][eth] Sending ${config.freeEthAmount} eth to ${recipientAddress}`);
        const hash = await sendEth(config.freeEthSourceAddress, recipientAddress, web3.toWei(config.freeEthAmount, 'ether'), web3);
        logger.info(`[blockchain][eth] Ether send to ${recipientAddress}. hash: ${hash}`);
    }
    catch (e) {
        logger.error(`[blockchain][eth] Ether not send to ${recipientAddress}. Message: ${e.message}`);
    }
}
