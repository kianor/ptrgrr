const Utils = require("../../utils");
const { variables: { config, embeds } } = Utils;

module.exports = async (messageOrInteraction, type, message, interaction, user, channel, guild, reply, member, validPrefixes, prefixFound, commandName, command) => {
    return new Promise(async (resolve) => {
        // Updates
        if (message && [channel.name, channel.id].includes(config.Channels.DefaultUpdates) && config.Other.PostUpdatesByMessagingInChannel && !command) {
            message.delete();
            message.channel.send(Utils.setupMessage({
                configPath: embeds.Embeds.Update,
                variables: [
                    ...Utils.userVariables(member, "user"),
                    { searchFor: /{update}/g, replaceWith: message.content },
                    { searchFor: /{update-version}/g, replaceWith: "" }
                ]
            }));
        }

        return resolve();
    });
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%