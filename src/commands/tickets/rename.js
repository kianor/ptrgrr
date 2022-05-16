const Utils = require("../../modules/utils.js");
const Embed = Utils.Embed;
const { lang } = Utils.variables;

module.exports = {
    name: "rename",
    run: async (bot, messageOrInteraction, args, { prefixUsed, member, channel, reply }) => {
        return new Promise(async resolve => {
            const ticket = await Utils.variables.db.get.getTickets(channel.id);
            const oldName = channel.name;
            const newName = args.join(" ");
    
            if (!ticket) {
                reply(Embed({ 
                    preset: "error", 
                    description: lang.TicketModule.Errors.TicketNotExist 
                }), { ephemeral: true });

                return resolve();
            }

            if (!newName.length) {
                reply(Embed({ 
                    preset: "invalidargs", 
                    usage: module.exports.usage 
                }, { prefixUsed }), { ephemeral: true });

                return resolve();
            }
            
            await channel.setName(newName);
    
            reply(Embed({
                title: lang.TicketModule.Commands.Rename.Title,
                description: lang.TicketModule.Commands.Rename.Description.replace(/{old-name}/g, oldName).replace(/{new-name}/g, newName.toLowerCase())
            }));
    
            bot.emit("ticketRenamed", ticket, member, oldName, newName.toLowerCase());
        });
    },
    description: "Rename a ticket channel",
    usage: "rename <new name>",
    aliases: [
        "renameticket"
    ],
    arguments: [
        {
            name: "new-name",
            description: "The new name of the ticket channel",
            required: true,
            type: "STRING"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%