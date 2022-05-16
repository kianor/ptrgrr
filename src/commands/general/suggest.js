const Utils = require("../../modules/utils.js");
const { config, embeds } = Utils.variables;
const Embed = Utils.Embed;

module.exports = {
    name: 'suggest',
    run: async (bot, messageOrInteraction, args, { prefixUsed, type, member, guild, reply, commandUsed }) => {
        return new Promise(async resolve => {
            if (config.Suggestions.Type.toLowerCase() == 'both' && [channel.name, channel.id].includes(config.Suggestions.Channels.Suggestions)) return;
            let channel = Utils.findChannel(config.Suggestions.Channels.Suggestions, guild);

            if (!channel) {
                reply(Embed({ preset: 'console' }));
                return resolve();
            }
            if (!args.length) {
                reply(Embed({ preset: 'invalidargs', usage: module.exports.usage }));
                return resolve();
            }

            let imageLogs = Utils.findChannel(config.Channels.ImageLogs, guild, 'GUILD_TEXT');
            let attachment = type == "message" ? messageOrInteraction.attachments.first() : undefined;

            if (attachment) await imageLogs.send({ files: [attachment] })
                .then(async msg => {
                    attachment = msg.attachments.first();
                });

            let content = type == "message" ? messageOrInteraction.content : messageOrInteraction.options.get("idea").value;
            require("../../modules/methods/createSuggestion")(content.replace(prefixUsed + commandUsed, "").trim(), member, attachment)
                .then((data) => {
                    reply(Utils.setupMessage({
                        configPath: embeds.Embeds.SuggestionSent,
                        variables: [
                            { searchFor: /{link}/g, replaceWith: data.msg.url }
                        ]
                    }));
                    resolve(true);
                })
                .catch(err => {
                    Utils.error(err.message, err.stack);
                    reply(Embed({ preset: "console" }));
                    resolve();
                });
        });
    },
    description: "Suggest something for the Discord server",
    usage: 'suggest <idea>',
    aliases: [],
    arguments: [
        {
            name: "idea",
            description: "The idea you would like to suggest",
            required: true,
            type: "STRING"
        },
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%