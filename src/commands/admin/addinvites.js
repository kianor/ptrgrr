const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;

module.exports = {
    name: 'addinvites',
    run: async (bot, messageOrInteraction, args, { prefixUsed, reply }) => {
        return new Promise(async resolve => {
            let user = Utils.ResolveUser(messageOrInteraction, 0);
            let amount = +args[1];
    
            if (!user || !amount || amount < 1) {
                reply(Embed({
                    preset: "invalidargs",
                    usage: module.exports.usage
                }, { prefixUsed }), {
                    ephemeral: true
                });

                return resolve();
            }
    
            let inviteData = await Utils.variables.db.get.getInviteData(user);
            inviteData.bonus += amount;
    
            await Utils.variables.db.update.invites.updateData(user, inviteData);
            reply(Embed({
                title: Utils.variables.lang.AdminModule.Commands.Addinvites.Title,
                description: Utils.variables.lang.AdminModule.Commands.Addinvites.Description.replace(/{amount}/g, amount).replace(/{user}/g, `<@${user.id}>`),
                timestamp: new Date()
            }));

            resolve(true);
        });
    },
    description: "Add bonus invites to a user",
    usage: 'addinvites <@user> <amount>',
    aliases: [],
    arguments: [
        {
            name: "user",
            description: "The user to add invites to",
            required: true,
            type: "USER"
        },
        {
            name: "amount",
            description: "The amount of invites to add",
            required: true,
            type: "INTEGER",
            minValue: 1
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%