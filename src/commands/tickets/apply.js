const createApplication = require("../../modules/methods/createApplication.js");

module.exports = {
    name: "apply",
    run: async (bot, messageOrInteraction, args, { member, channel, reply }) => {
        return new Promise(async resolve => {
            const response = await createApplication(bot, member, channel, false, 10000, reply);

            if (!response) return resolve();
            else return resolve(true);
        });
    },
    description: "Create an application",
    usage: "apply",
    aliases: [
        "application"
    ],
    arguments: []
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%