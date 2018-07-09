const fs = require('fs');
const http = require('http');
const https = require('https');
const express = require('express');
const config = require('./../../config/config.js');
const bodyParser = require('body-parser');
const HttpStatusCode = require('http-status-codes');
const logger = require('./logger');
const { DemoToken, web3 } = require('./demo-token');

logger.info('DemoToken address set to: ' + config.demoTokenAddress);
logger.info('Connecting to: ' + config.ethereumHost);
logger.info('Getting demo token: ' + config.demoTokenAddress);

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

DemoToken.at(config.demoTokenAddress)
    .then(async response => {
        tokenInstance = response;
        if (useSSL) {
            runHttpsServer();
        }
        else {
            runHttpServer();
        }
    })
    .catch((e) => {
        logger.error(`DemoToken connection: ${e.message}`);
    });

function headerSetup(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    next();
}

function appVersionHandler(req, res) {
    res.send('version: 0.2');
};

async function issueDemoTokenHandler(req, res) {
    const data = req.body;
    if (!web3.isAddress(data.recipientAddress)) {
        let message = 'Wrong recipient address: ' + data.recipientAddress;
        logger.info(message);
        res.status(HttpStatusCode.UNPROCESSABLE_ENTITY).send(message);
        return;
    }

    const value = web3.toWei(config.giveawayTokenAmounts, "ether");
    logger.info('Issue demo token. Recipient: ' + data.recipientAddress + ' value: ' + value);
    try {
        await tokenInstance.issue(data.recipientAddress, value, {
            from: config.account
        });
        res.sendStatus(HttpStatusCode.OK);
    }
    catch (e) {
        logger.error(data.recipientAddress + ' ' + e.message);
        res.sendStatus(HttpStatusCode.BAD_REQUEST);
    }
}

function runHttpsServer() {
    const httpsConfig = {
        key: fs.readFileSync(config.ssl.keyPath),
        cert: fs.readFileSync(config.ssl.certPath)
    };
    https.createServer(httpsConfig, app).listen(serverConfig, () => {
        logger.info(`Listening on https://${config.server.host}:${config.server.port}. Loaded certs: ${config.ssl.keyPath}, ${config.ssl.certPath}`);
    });
}

function runHttpServer() {
    http.createServer(app).listen(serverConfig, () => {
        logger.info(`Listening on http://${config.server.host}:${config.server.port}`);
    });
}
