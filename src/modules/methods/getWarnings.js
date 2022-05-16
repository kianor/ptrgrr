const Utils = require("../utils");

module.exports = async (bot) => {
    return new Promise(async resolve => {
        let warnings = [];

        if (bot.guilds.cache.filter(g => !Utils.variables.config.Other.IgnoredGuilds.includes(g.id)).size > 1) {
            warnings.push("Your bot is in more than 1 server. Corebot does not support this and you may encounter issues.");
        }

        await Promise.all(
            bot.guilds.cache.filter(g => !Utils.variables.config.Other.IgnoredGuilds.includes(g.id)).map(async guild => {
                return new Promise(async resolve => {
                    const missing = await require('./getMissingRolesAndChannels')(bot, guild);

                    if (missing.roles.length > 0) {
                        warnings = [...warnings, ...missing.roles.map(r => `GUILD: ${guild.name} (${guild.id}) | The ${r.name} role does not exist in your server. Setting: ${r.setting}`)];
                    }

                    if (missing.channels.text.length > 0) {
                        warnings = [...warnings, ...missing.channels.text.map(c => `GUILD: ${guild.name} (${guild.id}) | The ${c.name} Text Channel does not exist in your server. Setting: ${c.setting}`)];
                    }

                    if (missing.channels.voice.length > 0) {
                        warnings = [...warnings, ...missing.channels.voice.map(c => `GUILD: ${guild.name} (${guild.id}) | The ${c.name} Voice Channel does not exist in your server. Setting: ${c.setting}`)];
                    }

                    if (missing.channels.categories.length > 0) {
                        warnings = [...warnings, ...missing.channels.categories.map(c => `GUILD: ${guild.name} (${guild.id}) | The ${c.name} Category does not exist in your server. Setting: ${c.setting}`)];
                    }

                    resolve();
                });
            })
        );

        resolve(warnings);
    });
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%