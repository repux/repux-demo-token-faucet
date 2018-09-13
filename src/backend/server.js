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
    res.send('version: 0.2');
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
        logger.info(message);
        res.status(HttpStatusCode.TOO_MANY_REQUESTS).send(message);
        return;
    }

    const value = web3.toWei(config.giveawayTokenAmounts, 'ether');
    logger.info(`[blockchain] Issue demo token. Recipient: ${data.recipientAddress} value ${value} `);
    try {
        await tokenInstance.issue(data.recipientAddress, value, { from: config.account });
        let issue = new Issue.model({
            address: data.recipientAddress,
            tokensAmount: config.giveawayTokenAmounts
        });
        await issue.save()
            .catch(e => {
                logger.error(`[mongodb][save] ${e.message}`);
            });
        res
          .status(HttpStatusCode.OK)
          .send(JSON.stringify({ result: 'OK' }));;
    }
    catch (e) {
        logger.error(data.recipientAddress + ' ' + e.message);
        res.sendStatus(HttpStatusCode.BAD_REQUEST);
    }
}

function secondsToFormattedTime(timeInSeconds) {
  let seconds = timeInSeconds;

  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;

  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }


  return `${seconds} second${seconds > 1 ? 's' : ''}`;
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
