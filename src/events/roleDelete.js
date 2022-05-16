const Utils = require('../modules/utils');
const { config, lang } = Utils.variables;

module.exports = async (bot, role) => {
    if (require('../modules/handlers/CommandHandler.js').commands.length > 0) {
        if (!config.Logs.Enabled.includes("RoleDeleted")) return;
        if (config.Other.IgnoredGuilds.includes(role.guild.id)) return;

        const logs = Utils.findChannel(config.Logs.Channels.RoleDeleted, role.guild);
        if (!logs) return;
        if (logs) logs.send(Utils.Embed({
            author: lang.LogSystem.RoleDeleted.Author,
            description: lang.LogSystem.RoleCreated.Description
                .replace(/{role}/g, role.name)
                .replace(/{time}/g, ~~(Date.now() / 1000))
        }));
    }
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%