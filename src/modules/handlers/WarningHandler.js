const Utils = require("../utils");
const CommandHandler = require("./CommandHandler");
const { config, db } = Utils.variables;
module.exports = async (bot) => {
    let module = await db.get.getModules("mod");
    let command = CommandHandler.commands.find(c => c.command == "warn");

    if (module && command && module.enabled && command.enabled && config.Moderation.WarnDecay.Enabled) {
        let guild = bot.guilds.cache.first();
        let botMember = await guild.members.fetch(bot.user.id);

        async function decay() {
            let warnings = await db.get.getWarnings();

            warnings.forEach(async warning => {
                let time = warning.time + (config.Moderation.WarnDecay.Time * 60 * 1000);

                if (Date.now() >= time) {
                    db.update.punishments.removeWarning(warning.id);
                    await guild.members.fetch(warning.user)
                        .then(user => {
                            bot.emit('userUnpunished', "warn", user, botMember, warning);
                        })
                        .catch(() => {
                            bot.users.fetch(warning.user)
                                .then(user => {
                                    bot.emit('userUnpunished', "warn", user, botMember, warning);
                                })
                                .catch(() => {
                                    bot.emit('userUnpunished', "warn", warning.user, botMember, warning);
                                });
                        });
                }
            });
        }

        decay();
        setInterval(decay, 60);
    }
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%