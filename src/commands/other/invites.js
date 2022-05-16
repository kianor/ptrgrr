const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const lang = Utils.variables.lang;

module.exports = {
    name: "invites",
    run: async (bot, messageOrInteraction, args, { member, reply }) => {
        return new Promise(async resolve => {
            const targetUser = Utils.ResolveUser(messageOrInteraction) || member;
            const invites = await Utils.variables.db.get.getInviteData(targetUser);

            reply(Embed({
                author: {
                    text: targetUser.displayName,
                    icon: targetUser.user.displayAvatarURL({ dynamic: true })
                },
                timestamp: new Date(),
                title: lang.Other.OtherCommands.Invites.Title,
                description: lang.Other.OtherCommands.Invites.Description
                    .replace(/{user}/g, targetUser.user)
                    .replace(/{amount}/g, invites.regular + invites.bonus - invites.leaves)
                    .replace(/{regular}/g, invites.regular + invites.fake)
                    .replace(/{bonus}/g, invites.bonus)
                    .replace(/{leaves}/g, invites.leaves ? `-` + invites.leaves : 0)
                    .replace(/{fake}/g, invites.fake ? `-` + invites.fake : 0)
                    .replace(/{form}/g, (invites.regular + invites.bonus - invites.leaves) == 1 ? lang.Other.OtherCommands.Invites.Person : lang.Other.OtherCommands.Invites.People)
            }));

            return resolve(true);
        });
    },
    description: "View your invites",
    usage: "invites [@user]",
    aliases: [],
    arguments: [
        {
            name: "user",
            description: "The user to view the invites of",
            required: false,
            type: "USER"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%