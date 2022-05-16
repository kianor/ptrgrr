const lock = require("../../modules/methods/lockChannel");

module.exports = {
    name: "lock",
    run: async (bot, messageOrInteraction, args, { type, member, channel, reply }) => {
        return new Promise(async resolve => {
            resolve(await lock(channel, member, true, reply, type));
        });
    },
    description: "Lock the channel so users cannot send messages",
    usage: "lock",
    aliases: [],
    arguments: []
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%