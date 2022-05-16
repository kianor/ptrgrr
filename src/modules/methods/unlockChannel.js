const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const { config, lang } = Utils.variables;

module.exports = async (channel, executor, announceUnlockdown = true, reply, type) => {
    return new Promise(async resolve => {
        const replyToUser = (content, ephemeral = false) => {
            if (reply) reply(content, { ephemeral });
            else channel.send(content);
        };

        if (config.Moderation.Logs.Enabled && !Utils.findChannel(config.Moderation.Logs.Channel, channel.guild)) {
            replyToUser(Embed({ preset: "console" }), true);
            return resolve();
        }

        let lockedChannel = await Utils.variables.db.get.getLockedChannel(channel.id);
        if (!lockedChannel) {
            replyToUser(Embed({
                preset: "error",
                description: lang.ModerationModule.Commands.Unlock.NotLocked
            }), true);
            return resolve();
        }

        let oldPermissions = JSON.parse(lockedChannel.permissions);

        await channel.permissionOverwrites.set(oldPermissions);

        Utils.variables.db.update.locked_channels.remove(channel.guild.id, channel.id);

        if (type == "message" ? announceUnlockdown : true) replyToUser(Embed({
            color: config.EmbedColors.Error,
            title: lang.ModerationModule.Commands.Unlock.Unlocked
        }), !announceUnlockdown);

        if (announceUnlockdown && config.Moderation.Logs.Enabled) {
            Utils.findChannel(config.Moderation.Logs.Channel, channel.guild).send(Embed({
                author: lang.ModerationModule.Commands.Unlock.Log.Author,
                description: lang.ModerationModule.Commands.Unlock.Log.Description
                    .replace(/{executor}/g, executor)
                    .replace(/{channel}/g, channel)
                    .replace(/{time}/g, ~~(Date.now() / 1000))
            }));
        }

        return resolve(true);
    });
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%