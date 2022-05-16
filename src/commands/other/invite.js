const Utils = require("../../modules/utils");
const { Embed } = Utils;

module.exports = {
    name: "invite",
    run: async (bot, messageOrInteraction, args, { member, channel: messageChannel, reply }) => {
        return new Promise(async resolve => {
            let channel = Utils.ResolveChannel(messageOrInteraction) || messageChannel;

            channel.createInvite({ maxAge: 0, unique: true, reason: `Created by ${member.user.tag} (ID: ${member.id})` })
                .then(invite => {
                    reply(Embed({
                        title: Utils.variables.lang.Other.OtherCommands.Invite.Created.Title,
                        description: Utils.variables.lang.Other.OtherCommands.Invite.Created.Description.replace(/{channel}/g, channel.id == messageChannel.id ? Utils.variables.lang.Other.OtherCommands.Invite.ThisChannel : `<#${channel.id}>`).replace(/{invite}/g, invite.url),
                        timestamp: new Date(),
                        footer: {
                            text: bot.user.username,
                            icon: bot.user.displayAvatarURL({ dynamic: true })
                        }
                    }));

                    return resolve(true);
                })
                .catch(() => {
                    reply(Embed({
                        preset: "error",
                        description: Utils.variables.lang.Other.OtherCommands.Invite.Error.replace(/{channel}/g, channel.id == messageChannel.id ? Utils.variables.lang.Other.OtherCommands.Invite.ThisChannel : `<#${channel.id}>`)
                    }));

                    return resolve();
                });
        });
    },
    usage: "invite [#channel]",
    description: "Create an invite",
    aliases: [],
    arguments: [
        {
            name: "channel",
            description: "The channel to create the invite for",
            required: false,
            type: "CHANNEL"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%