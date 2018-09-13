const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    address: { type: String, index: true },
    tokensAmount: { type: Number },
    date: { type: Date, default: Date.now }
});

const IssueModel = mongoose.model('Issue', issueSchema);

const methods = {
    isAddressThrottled: (sender, blockedTimeInSeconds) => {
        return new Promise((resolve, reject) => {
            IssueModel.findOne({ address: sender }).sort('-date').exec((err, issue) => {
                if (err) {
                    return reject(err);
                }

                if (!issue) {
                    return resolve({
                      result: false
                    });
                }

                const dateDiffInSeconds = Math.round((Date.now() - issue.date) / 1000);
                if (dateDiffInSeconds > blockedTimeInSeconds) {
                    return resolve({
                      result: false
                    });
                }

                return resolve({
                  result: true,
                  secondsUntilUnblock: blockedTimeInSeconds - dateDiffInSeconds
                });
            })
        })
    }
}

module.exports = {
    model: IssueModel,
    method: methods
};
