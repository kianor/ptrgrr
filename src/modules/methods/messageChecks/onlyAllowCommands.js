const Utils = require("../../utils");
const { variables: { config, lang }, Embed } = Utils;

module.exports = async (messageOrInteraction, type, message, interaction, user, channel, guild, reply, member, validPrefixes, prefixFound, commandName, command) => {
    return new Promise(async (resolve, reject) => {
        if (type == "interaction") return resolve();
        if (config.Commands.OnlyAllowCommands && !command && (config.Commands.AllowedChannels.includes(channel.name) || config.Commands.AllowedChannels.includes(channel.id))) {
            message.delete();
            reply(Embed({
                preset: "error",
                description: lang.Other.NormalMessageInCommandsChannel
            })).then(m => Utils.delete(m, 2500));

            return reject();
        }

        return resolve();
    });
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%