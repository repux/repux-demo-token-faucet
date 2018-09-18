
const config = require('./../../config/config.js');
const contract = require('truffle-contract');
const Web3 = require('web3');

let web3 = new Web3(new Web3.providers.HttpProvider(config.ethereumHost));

let DemoTokenArtifacts = require('./../../contracts/DemoToken.json');
const DemoToken = contract(DemoTokenArtifacts);
DemoToken.setProvider(web3.currentProvider);

module.exports = {
    DemoToken,
    web3
};
