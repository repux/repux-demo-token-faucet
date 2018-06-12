const express = require('express');
const config = require('./../../config/config.js');
const bodyParser = require('body-parser');
const HttpStatusCode = require('http-status-codes');
const contract = require('truffle-contract');
const Web3 = require("web3");
const winston = require('winston');
const path = require('path');

const myFormat = winston.format.printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logPath = path.join(__dirname, '../../', 'logs');
logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.label({ label: 'server' }),
        winston.format.timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logPath, 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(logPath, 'info.log')
        }),
        new winston.transports.Console()
    ]
});

logger.info('DemoToken address set to: ' + config.demoTokenAddress);
logger.info('Connecting to: ' + config.ethereumHost);

let web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));

let DemoToken_artifacts = require('./../../contracts/DemoToken.json');
const DemoToken = contract(DemoToken_artifacts);
DemoToken.setProvider(web3.currentProvider);
var tokenInstance = null;

logger.info('Getting demo token: ' + config.demoTokenAddress);

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.send('version: 0.1');
});

app.post('/issue-demo-token', async (req, res) => {
    const data = req.body;
    if (!web3.isAddress(data.recipientAddress)) {
        logger.error('Wrong recipient address: ' + data.recipientAddress);
        res.sendStatus(HttpStatusCode.UNPROCESSABLE_ENTITY);
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
});

DemoToken.at(config.demoTokenAddress)
    .then(async response => {
        tokenInstance = response;
        app.listen(
            config.serverPort,
            () => logger.info('Server started at port ' + config.serverPort)
        );
    })