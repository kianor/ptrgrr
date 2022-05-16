const Utils = require('../modules/utils');
const Embed = Utils.Embed;
const { lang, config } = Utils.variables;

module.exports = (bot, channel) => {
    if (require('../modules/handlers/CommandHandler.js').commands.length > 0) {
        if (!channel.guild || !config.Logs.Enabled.includes("ChannelPinsUpdated")) return;
        if (config.Other.IgnoredGuilds.includes(channel.guild.id)) return;

        const logs = Utils.findChannel(config.Logs.Channels.ChannelPinsUpdated, channel.guild);

        if (!logs || Utils.variables.channelLogBlacklist.has(channel.name) || config.Logs.ChannelBlacklist.includes(channel.name) || config.Logs.ChannelBlacklist.includes(channel.id)) return;

        logs.send(Embed({
            author: lang.LogSystem.ChannelPinsUpdated.Author,
            description: lang.LogSystem.ChannelPinsUpdated.Description
                .replace(/{channel}/g, channel)
                .replace(/{time}/g, ~~(Date.now() / 1000))
        }));
    }
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%