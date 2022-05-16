const Utils = require("../utils");
const sendWelcomeMessage = require("./sendWelcomeMessage");
const { config } = Utils.variables;

module.exports = async (bot, member) => {
    if (config.Verification.WelcomeMessage == "after-verified" && config.Join.Messages.Enabled) {
        let joins = await Utils.variables.db.get.getJoins(member);
        let inviter;

        if (joins && joins.length) {
            let mostRecent = Math.max(...joins.map(i => i.time));
            inviter = joins.find(i => i.time == mostRecent);
        }

        inviter = inviter && inviter.inviter ? await member.guild.members.fetch(inviter.inviter) : undefined;
        sendWelcomeMessage(bot, member, inviter);
    }

    if (config.Join.Roles) {
        config.Join.Roles.forEach(roleName => {
            let role = Utils.findRole(roleName, member.guild);
            if (role) member.roles.remove(role);
        });
    }

    config.Verification.VerifiedRoles.forEach(roleName => {
        let role = Utils.findRole(roleName, member.guild);
        if (role) member.roles.add(role);
    });

    bot.emit("userVerified", member);
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%