const express = require('express');
const config = require('./../../config/config.js');
const bodyParser = require('body-parser');
const HttpStatusCode = require('http-status-codes');
const logger = require('./logger');
const { DemoToken, web3 } = require('./demo-token');

let tokenInstance = null;

logger.info('DemoToken address set to: ' + config.demoTokenAddress);
logger.info('Connecting to: ' + config.ethereumHost);
logger.info('Getting demo token: ' + config.demoTokenAddress);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(headerSetup);
app.get('/', appVersionHandler);
app.post('/issue-demo-token', issueDemoTokenHandler);

DemoToken.at(config.demoTokenAddress)
    .then(async response => {
        tokenInstance = response;
        app.listen(
            config.serverPort,
            () => logger.info('Server started at port ' + config.serverPort)
        );
    })

function headerSetup(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}

function appVersionHandler(req, res) {
    res.send('version: 0.1');
};

async function issueDemoTokenHandler(req, res) {
    const data = req.body;
    if (!web3.isAddress(data.recipientAddress)) {
        let message = 'Wrong recipient address: ' + data.recipientAddress;
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