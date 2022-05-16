const Utils = require("../utils");
const { config, embeds, lang, db } = Utils.variables;

module.exports = (bug, creator, attachment = null) => {
    return new Promise(async (resolve, reject) => {
        let channel = Utils.findChannel(config.BugReports.Channels.Pending, creator.guild);
        let bot = creator.guild.me.user;

        if (!channel) return reject("Missing pending bug reports channel");

        channel.send(Utils.setupMessage({
            configPath: embeds.Embeds.PendingBugreport,
            color: config.BugReports.Colors.Pending,
            image: attachment ? attachment.proxyURL : undefined,
            variables: [
                ...Utils.userVariables(creator, "user"),
                ...Utils.userVariables(bot, "bot"),
                { searchFor: /{bug}/g, replaceWith: bug || lang.Global.Image }
            ]
        })).then(async msg => {
            let data = {
                guild: msg.guild.id,
                channel: msg.channel.id,
                message: msg.id,
                bug: bug || lang.Global.Image,
                creator: creator.id,
                status: "pending",
                created_on: msg.createdTimestamp,
                image: attachment ? attachment.proxyURL : undefined
            };

            db.update.bugreports.add(data);

            resolve({ data, msg });

            if (config.BugReports.AddManagementReactions) {
                ["Accepted", "Denied", "Fixed", "Reset"].forEach(async type => {
                    await msg.react(Utils.findEmoji(config.BugReports.Emojis[type], bot, false) || config.BugReports.Emojis[type]);
                });
            }
        });
    });
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%