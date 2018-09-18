const sendEth = function (sender, receiver, amount, web3) {
    return new Promise((resolve, reject) => {
        web3.eth.sendTransaction({ from: sender, to: receiver, value: amount }, (err, transactionHash) => {
            if (err) {
                reject(err);
            } else {
                resolve(transactionHash);
            }
        });
    });
}

module.exports = sendEth;
