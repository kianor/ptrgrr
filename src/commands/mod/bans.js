const Utils = require('../../modules/utils');
const Embed = Utils.Embed;
const { lang } = Utils.variables;

module.exports = {
    name: "bans",
    run: async (bot, messageOrInteraction, args, { guild, reply }) => {
        return new Promise(async resolve => {
            let b = await guild.bans.fetch();
            let bans = Array.from(b.values());
            let idBans = await Utils.variables.db.get.getIDBans(guild);

            bans.push(...idBans.map(b => {
                b.idban = true;
                return b;
            }));

            if (bans.length) {
                let page = +args[0] || 1;
                let display = await Promise.all(bans.map(async ban => {
                    if (ban.idban) {
                        let user = await bot.users.fetch(ban.id);
                        return lang.ModerationModule.Commands.Bans.List.IDBan.replace(/{user}/g, user ? user.tag : ban.id).replace(/{id}/g, ban.id).replace(/{reason}/g, ban.reason);
                    } else {
                        let info = lang.ModerationModule.Commands.Bans.List.Info.replace(/{user}/g, ban.user.tag).replace(/{id}/g, ban.user.id).replace(/{reason}/g, ban.reason ? ban.reason : lang.Global.None);
                        let punishmentData = await Utils.variables.db.get.getPunishmentsForUser(ban.user.id);
                        punishmentData = punishmentData ? punishmentData.filter(punishment => punishment.type == 'ban') : [];

                        if (!punishmentData.length) return info;
                        else {
                            let latestBan = punishmentData.find(punishment => punishment.time == Math.max(...punishmentData.map(punishment => punishment.time)));
                            let executor = guild.members.cache.get(latestBan.executor);

                            return info + (latestBan ? lang.ModerationModule.Commands.Bans.List.ExtraInfo.replace(/{date}/g, (new Date(latestBan.time).toLocaleString())).replace(/{executor}/g, executor ? executor : latestBan.executor).replace(/{id}/g, latestBan.id) : "");
                        }
                    }
                }));

                if (page > Math.ceil(display.length / 10)) page = 1;

                reply(Embed({
                    title: lang.ModerationModule.Commands.Bans.List.Title.replace(/{current-page}/g, page).replace(/{max-pages}/g, Math.ceil(display.length / 10)),
                    description: display.slice((page - 1) * 10, page * 10).join("\n\n"),
                    timestamp: new Date()
                }));

                return resolve(true);
            } else {
                reply(Embed({
                    title: lang.ModerationModule.Commands.Bans.NoBans.Title,
                    description: lang.ModerationModule.Commands.Bans.NoBans.Description,
                    timestamp: new Date()
                }));

                return resolve(true);
            }
        });
    },
    description: "View a list of currently banned users",
    usage: "bans [page number]",
    aliases: ["banlist"],
    arguments: [
        {
            name: "page",
            description: "The page number to view",
            required: false,
            type: "INTEGER",
            minValue: 1
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%