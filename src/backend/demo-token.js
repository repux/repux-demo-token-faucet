
const config = require('./../../config/config.js');
const contract = require('truffle-contract');
const Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));

let DemoToken_artifacts = require('./../../contracts/DemoToken.json');
const DemoToken = contract(DemoToken_artifacts);
DemoToken.setProvider(web3.currentProvider);

module.exports = {
    DemoToken,
    web3
};