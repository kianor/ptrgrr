const Utils = require("../../modules/utils.js");
const { config, embeds } = Utils.variables;

module.exports = {
    name: 'links',
    run: async (bot, messageOrInteraction, args, { reply }) => {
        return new Promise(resolve => {
            let fields = Object.keys(config.Links).map(name => {
                return { name: name, value: config.Links[name] };
            });

            reply(Utils.setupMessage({
                configPath: embeds.Embeds.Links,
                fields: fields
            }));
            return resolve(true);
        });
    },
    description: "View links related to the Discord server",
    usage: 'links',
    aliases: [],
    arguments: []
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%