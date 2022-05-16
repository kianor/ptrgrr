const Utils = require('../modules/utils');
const { config, lang } = Utils.variables;

module.exports = async (bot, oldRole, newRole) => {
    if (require('../modules/handlers/CommandHandler.js').commands.length > 0) {
        if (config.Logs.Enabled.includes("RoleUpdated")) {
            if (config.Other.IgnoredGuilds.includes(oldRole.guild.id)) return;

            let logs = Utils.findChannel(config.Logs.Channels.RoleUpdated, newRole.guild);

            if (!logs) return;

            let embed = Utils.Embed({
                author: lang.LogSystem.RoleUpdated.Author,
                description: lang.LogSystem.RoleUpdated.Description[0].replace(/{role}/g, newRole)
            });

            if (oldRole.name !== newRole.name) {
                embed.embeds[0].description += lang.LogSystem.RoleUpdated.Description[1].replace(/{old}/g, oldRole.name).replace(/{new}/g, newRole.name);
            }

            if (oldRole.color !== newRole.color) {
                embed.embeds[0].description += lang.LogSystem.RoleUpdated.Description[2].replace(/{old}/g, oldRole.hexColor).replace(/{new}/g, newRole.hexColor);
            }

            if (oldRole.hoist !== newRole.hoist) {
                let oldH = oldRole.hoist ? lang.LogSystem.RoleUpdated.Hoisted : lang.LogSystem.RoleUpdated.NotHoisted;
                let newH = newRole.hoist ? lang.LogSystem.RoleUpdated.Hoisted : lang.LogSystem.RoleUpdated.NotHoisted;
                embed.embeds[0].description += lang.LogSystem.RoleUpdated.Description[3].replace(/{old}/g, oldH).replace(/{new}/g, newH);
            }

            if (oldRole.mentionable !== newRole.mentionable) {
                let oldM = oldRole.mentionable ? lang.LogSystem.RoleUpdated.Mentionable : lang.LogSystem.RoleUpdated.NotMentionable;
                let newM = newRole.mentionable ? lang.LogSystem.RoleUpdated.Mentionable : lang.LogSystem.RoleUpdated.NotMentionable;
                embed.embeds[0].description += lang.LogSystem.RoleUpdated.Description[4].replace(/{old}/g, oldM).replace(/{new}/g, newM);
            }

            if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
                embed.embeds[0].description += lang.LogSystem.RoleUpdated.Description[5].replace(/{old}/g, oldRole.permissions.toArray().map(perm => '`' + perm.toLowerCase() + '`').join(", ")).replace(/{new}/g, newRole.permissions.toArray().map(perm => '`' + perm.toLowerCase() + '`').join(", "));
            }

            if (embed.embeds[0].description == `${newRole}: `) return;
            else embed.embeds[0].description += lang.LogSystem.RoleUpdated.Description[6].replace(/{time}/g, ~~(Date.now() / 1000));

            logs.send(embed);
        }
    }
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%