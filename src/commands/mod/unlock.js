const unlock = require("../../modules/methods/unlockChannel");

module.exports = {
    name: "unlock",
    run: async (bot, messageOrInteraction, args, { type, member, channel, reply }) => {
        return new Promise(async resolve => {
            resolve(await unlock(channel, member, true, reply, type));
        });
    },
    description: "Unlock the channel you are typing in",
    usage: "unlock",
    aliases: [],
    arguments: []
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%