const Utils = require("../../modules/utils.js");
const lang = Utils.variables.lang;
const config = Utils.variables.config;
const Embed = Utils.Embed;

module.exports = {
    name: 'setprefix',
    run: async (bot, messageOrInteraction, args, { guild, reply }) => {
        return new Promise(async resolve => {
            if (args.length == 0) {
                reply(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
                return resolve();
            }

            await Utils.variables.db.update.prefixes.updatePrefix(guild.id, args[0]);

            reply(Embed({
                title: lang.ManagementModule.Commands.Setprefix.Title,
                description: lang.ManagementModule.Commands.Setprefix.Description.replace(/{prefix}/g, args[0]),
                color: config.EmbedColors.Success
            }));

            return resolve(true);
        });
    },
    description: "Set the bot's prefix",
    usage: 'setprefix <prefix>',
    aliases: [],
    arguments: [
        {
            name: "prefix",
            description: "The new prefix for the server",
            type: "STRING",
            required: true
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%