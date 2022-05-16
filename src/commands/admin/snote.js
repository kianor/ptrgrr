const Utils = require('../../modules/utils');
const { config, lang } = Utils.variables;

module.exports = {
    name: "snote",
    run: async (bot, messageOrInteraction, args, { prefixUsed, commandUsed, type, member, channel, reply }) => {
        return new Promise(async resolve => {
            if (type == "message") messageOrInteraction.delete().catch(() => { });

            let channels = Object.values(config.Suggestions.Channels);
            let note = type == "message" ? messageOrInteraction.content.substring((prefixUsed + commandUsed).length) : args[0];

            if (!channels.includes(channel.id) && !channels.includes(channel.name)) {
                reply(Utils.Embed({
                    preset: "error",
                    description: lang.AdminModule.Commands.Snote.NotSuggestionChannel
                }), { ephemeral: true }).then(m => {
                    if (type == "message") Utils.delete(m, 3000).catch(() => { });
                });

                return resolve();
            }
            if (!note.length) {
                reply(Utils.Embed({
                    preset: 'invalidargs',
                    usage: module.exports.usage
                }, { prefixUsed }), { ephemeral: true })
                    .then(m => {
                        if (type == "message") Utils.delete(m, 3000).catch(() => { });
                    });

                return resolve();
            }

            let webhook = (await channel.fetchWebhooks()).find(webhook => webhook.name.toLowerCase() == "suggestions");

            if (!webhook) webhook = await channel.createWebhook("Suggestions");

            let username = config.Suggestions.Notes.Account.Username;
            let avatar = config.Suggestions.Notes.Account.Avatar;
            let text = config.Suggestions.Notes.Message.Text;

            Utils.userVariables(member, "user").forEach(variable => {
                username = username.replace(variable.searchFor, variable.replaceWith);
                avatar = avatar.replace(variable.searchFor, variable.replaceWith);
                text = text.replace(variable.searchFor, variable.replaceWith);
            });

            if (config.Suggestions.Notes.Message.Type == "text") {
                webhook.send({
                    content: text.replace(/{note}/g, note),
                    username: username,
                    avatarURL: avatar
                });

                if (type == "interaction") reply(Utils.Embed({
                    color: config.EmbedColors.Success,
                    title: lang.AdminModule.Commands.Snote.Sent
                }), { ephemeral: true });

                return resolve(true);
            } else {
                webhook.send({
                    embeds: [Utils.setupMessage({
                        configPath: config.Suggestions.Notes.Message.Embed,
                        variables: [
                            ...Utils.userVariables(member, "user"),
                            { searchFor: /{note}/g, replaceWith: note }
                        ]
                    })],
                    username: username,
                    avatarURL: avatar
                });

                if (type == "interaction") reply(Utils.Embed({
                    color: config.EmbedColors.Success,
                    title: lang.AdminModule.Commands.Snote.Sent
                }), { ephemeral: true });

                return resolve(true);
            }
        });
    },
    description: "Send a message in a suggestion channel",
    usage: "snote <message>",
    aliases: ['suggestionnote', 'smsg', 'suggestionmessage'],
    arguments: [
        {
            name: "message",
            description: "The message to send",
            required: true,
            type: "STRING"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%