const Utils = require("../modules/utils");

module.exports = async (bot, ban) => {
    if (Utils.variables.config.Other.IgnoredGuilds.includes(ban.guild.id)) return;

    await Utils.delay(2);
    ban.guild.fetchAuditLogs({ type: "MEMBER_BAN_REMOVE" })
        .then(async logs => {
            if (!logs.entries.first()) return;

            let executor = logs.entries.first().executor;

            if (executor.id == bot.user.id) return;

            executor.guild = ban.guild;
            ban.user.guild = ban.guild;

            bot.emit('userUnpunished', "unban", ban.user, executor);
        });
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%