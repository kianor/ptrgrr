const Utils = require("../../modules/utils.js");
const { embeds } = Utils.variables;

module.exports = {
    name: "ip",
    run: async (bot, messageOrInteraction, args, { reply }) => {
        return new Promise(async resolve => {
            reply(Utils.setupMessage({
                configPath: embeds.Embeds.IP
            }));

            return resolve(true);
        });
    },
    description: "View the Minecraft server's IP",
    usage: "ip",
    aliases: [
        "serverip"
    ],
    arguments: []
};

// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%