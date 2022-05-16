const Utils = require("../../utils");
const { variables: { config, lang }, Embed } = Utils;

module.exports = async (messageOrInteraction, type, message, interaction, user, channel, guild, reply, member, validPrefixes, prefixFound, commandName, command) => {
    return new Promise(async (resolve, reject) => {
        if (!Utils.hasPermission(member, config.Moderation.CommandBlacklistBypass)) {
            let blacklists = await Utils.variables.db.get.getBlacklists(member) || [];
            if (blacklists.includes(command?.command) || blacklists.includes("all")) {
                reply(Embed({
                    color: config.EmbedColors.Error,
                    title: blacklists.includes("all") ? lang.ModerationModule.Commands.Blacklist.Embeds.Blacklist.Title[0] : lang.ModerationModule.Commands.Blacklist.Embeds.Blacklist.Title[1],
                }));
                return reject();
            }
        }

        return resolve();
    });
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%