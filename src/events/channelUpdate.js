const Utils = require('../modules/utils');
const Embed = Utils.Embed;
const { lang, config } = Utils.variables;

module.exports = async (bot, oldChannel, newChannel) => {
    if (require('../modules/handlers/CommandHandler.js').commands.length > 0) {
        if (!newChannel.guild || !config.Logs.Enabled.includes("ChannelUpdated")) return;
        if (config.Other.IgnoredGuilds.includes(oldChannel.guild.id)) return;
        if (config.Logs.ChannelBlacklist.some(name => oldChannel.name.toLowerCase().startsWith(name.toLowerCase()) || newChannel.name.toLowerCase().startsWith(name.toLowerCase()) || oldChannel.id == name)) return;

        const logs = Utils.findChannel(config.Logs.Channels.ChannelUpdated, newChannel.guild);

        let Tickets = await Utils.getOpenTickets(newChannel.guild);
        let Applications = await Utils.getOpenApplications(newChannel.guild);
        let IDs = [...Tickets.map(channel => channel.id), ...Applications.map(channel => channel.id)];

        if (IDs.includes(newChannel.id) ||
            Utils.variables.channelLogBlacklist.has(oldChannel.id) ||
            Utils.variables.channelLogBlacklist.has(oldChannel.name) ||
            Utils.variables.channelLogBlacklist.has(newChannel.name) || !logs ||
            (Utils.variables.tempChannels && Array.from(Utils.variables.tempChannels.values()).find(tc => tc.channel.id == oldChannel.id))) return;

        if (oldChannel.name !== newChannel.name) {
            logs.send(Embed({
                author: lang.LogSystem.ChannelUpdated.NameUpdated.Author,
                description: lang.LogSystem.ChannelUpdated.NameUpdated.Description
                    .replace(/{channel}/g, `<#${newChannel.id}>`)
                    .replace(/{old}/g, oldChannel.name)
                    .replace(/{new}/g, newChannel.name)
                    .replace(/{time}/g, ~~(Date.now() / 1000))
            }));
        }

        const stringify = require("safe-stable-stringify");
        const same = () => {
            return oldChannel.permissionOverwrites.cache.every(overwrite => {
                return !!newChannel.permissionOverwrites.cache.find(o => stringify(o) == stringify(overwrite));
            });
        };

        if (oldChannel.permissionOverwrites.cache.size !== newChannel.permissionOverwrites.cache.size || !same()) {
            logs.send(Embed({
                author: lang.LogSystem.ChannelUpdated.PermsUpdated.Author,
                description: lang.LogSystem.ChannelUpdated.PermsUpdated.Description
                    .replace(/{channel}/g, `<#${newChannel.id}>`)
                    .replace(/{time}/g, ~~(Date.now() / 1000))
            }));
        }

        if (oldChannel.parentId !== newChannel.parentId) {
            logs.send(Embed({
                author: lang.LogSystem.ChannelUpdated.ParentUpdated.Author,
                description: lang.LogSystem.ChannelUpdated.ParentUpdated.Description
                    .replace(/{channel}/g, `<#${newChannel.id}>`)
                    .replace(/{old}/g, oldChannel.parent ? oldChannel.parent.name : lang.Global.None)
                    .replace(/{new}/g, newChannel.parent ? newChannel.parent.name : lang.Global.None)
                    .replace(/{time}/g, ~~(Date.now() / 1000))
            }));
        }

        if (oldChannel.topic !== newChannel.topic) {
            logs.send(Embed({
                author: lang.LogSystem.ChannelUpdated.TopicUpdated.Author,
                description: lang.LogSystem.ChannelUpdated.TopicUpdated.Description
                    .replace(/{channel}/g, `<#${newChannel.id}>`)
                    .replace(/{old}/g, oldChannel.topic ? oldChannel.topic : lang.Global.None)
                    .replace(/{new}/g, newChannel.topic ? newChannel.topic : lang.Global.None)
                    .replace(/{time}/g, ~~(Date.now() / 1000))
            }));
        }
    }
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%