const Utils = require("../modules/utils");

module.exports = async (bot, invite) => {
    if (Utils.variables.config.Other.IgnoredGuilds.includes(invite.guild.id)) return;
    Utils.updateInviteCache(bot);
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%