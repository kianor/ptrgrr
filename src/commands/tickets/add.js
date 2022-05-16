const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const lang = Utils.variables.lang;

module.exports = {
    name: "add",
    run: async (bot, messageOrInteraction, args, { prefixUsed, member, user, channel, reply }) => {
        return new Promise(async resolve => {
            const ticket = await Utils.variables.db.get.getTickets(channel.id);
            if (!ticket) {
                reply(Embed({ 
                    preset: "error", 
                    description: lang.TicketModule.Errors.TicketNotExist 
                }), { ephemeral: true });

                return resolve();
            }
    
            const targetUser = Utils.ResolveUser(messageOrInteraction, 0, true);
    
            if (args.length == 0 || !targetUser) {
                reply(Embed({ 
                    preset: "invalidargs", 
                    usage: module.exports.usage 
                }, { prefixUsed }), { ephemeral: true });

                return resolve();
            }

            if (targetUser.id == user.id) {
                reply(Embed({ 
                    preset: "error", 
                    description: lang.TicketModule.Commands.Add.Errors.AddSelf 
                }), { ephemeral: true });

                return resolve();
            }
    
            const AddedUsers = await Utils.variables.db.get.getAddedUsers(channel.id);
            if (channel.members.get(targetUser.id) && AddedUsers.map(u => u.user).includes(targetUser.id)) {
                reply(Embed({ 
                    preset: "error", 
                    description: lang.TicketModule.Commands.Add.Errors.UserAlreadyHaveAccess 
                }), { ephemeral: true });

                return resolve();
            }
    
            await Utils.variables.db.update.tickets.addedUsers.add(channel.id, targetUser.id);
    
            await channel.permissionOverwrites.create(targetUser.id, {
                VIEW_CHANNEL: true, SEND_MESSAGES: true, ADD_REACTIONS: true, READ_MESSAGE_HISTORY: true, ATTACH_FILES: true, EMBED_LINKS: true, USE_EXTERNAL_EMOJIS: true
            });
    
            reply(Embed({ 
                title: lang.TicketModule.Commands.Add.Embeds.UserAdded.Title, 
                description: lang.TicketModule.Commands.Add.Embeds.UserAdded.Description.replace(/{user}/g, `<@${targetUser.id}>`) 
            }));
            
            bot.emit("ticketUserAdded", ticket, member, targetUser);

            return resolve(true);
        });
    },
    description: "Add a user to a ticket.",
    usage: "add <@user>",
    aliases: [
        "adduser"
    ],
    arguments: [
        {
            name: "user",
            description: "The user to add to the ticket",
            required: true,
            type: "USER"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%