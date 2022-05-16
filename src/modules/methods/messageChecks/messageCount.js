const Utils = require("../../utils");
const { variables: { config } } = Utils;

module.exports = async (messageOrInteraction, type, message, interaction, user, channel, guild, reply, member, validPrefixes, prefixFound, commandName, command) => {
    return new Promise(async (resolve) => {
        if (type == "interaction") return resolve();
        if (config.Other.MessageCount.Blacklist.Channels.includes(channel.name) || config.Other.MessageCount.Blacklist.Channels.includes(channel.id)) return resolve();

        let roles = [...member.roles.cache.map(r => r.name), ...member.roles.cache.map(r => r.id)];
        if (roles.some(r => config.Other.MessageCount.Blacklist.Roles.includes(r))) return resolve();

        if (command) {
            if (config.Other.MessageCount.IncludeCommands) await Utils.variables.db.update.messages.increase(message.member);
        } else {
            await Utils.variables.db.update.messages.increase(message.member);
        }

        return resolve();
    });
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%