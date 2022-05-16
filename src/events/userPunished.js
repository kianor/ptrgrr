const Utils = require("../modules/utils.js");
const { config, lang } = Utils.variables;

module.exports = async (bot, punishment, user, executor) => {
    if (!config.Moderation.Logs.Enabled) return;

    let logs = Utils.findChannel(config.Moderation.Logs.Channel, user.guild);
    let id = await Utils.variables.db.get.getPunishmentID();
    let type = punishment.type;
    if (!logs) return;

    if (punishment.type.startsWith("temp")) {
        logs.send(Utils.Embed({
            author: lang.ModerationModule.Logs.UserTempPunished.Author,
            description: lang.ModerationModule.Logs.UserTempPunished.Description
                .replace(/{executor}/g, executor)
                .replace(/{punishment-type}/g, punishment.type.replace("temp", "") == "ban" ? "banned" : "muted")
                .replace(/{user}/g, user)
                .replace(/{reason}/g, punishment.reason)
                .replace(/{id}/g, id)
                .replace(/{length}/g, Utils.DDHHMMSSfromMS(punishment.length))
                .replace(/{time}/g, ~~(punishment.time / 1000))
        }));
    } else if (punishment.type == "warn") {
        logs.send(Utils.Embed({
            author: lang.ModerationModule.Logs.UserWarned.Author,
            description: lang.ModerationModule.Logs.UserWarned.Description
            .replace(/{executor}/g, executor)
            .replace(/{user}/g, user)
            .replace(/{reason}/g, punishment.reason)
            .replace(/{id}/g, id)
            .replace(/{count}/g, punishment.warnCount)
            .replace(/{time}/g, ~~(punishment.time / 1000))
        }));
    } else {
        logs.send(Utils.Embed({
            author: lang.ModerationModule.Logs.UserPunished.Author,
            description: lang.ModerationModule.Logs.UserPunished.Description
            .replace(/{executor}/g, executor)
            .replace(/{punishment-type}/g, type.endsWith("e") ? type + "d" : type.endsWith("n") ? type + "ned" : type + "ed")
            .replace(/{user}/g, user)
            .replace(/{reason}/g, punishment.reason)
            .replace(/{id}/g, id)
            .replace(/{time}/g, ~~(punishment.time / 1000))
        }));
    }
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%