const Utils = require("../../modules/utils");
const config = Utils.variables.config;
const createTicket = require("../../modules/methods/createTicket");

module.exports = {
    name: "new",
    run: async (bot, messageOrInteraction, args, { type, member, channel, reply }) => {
        return new Promise(async resolve => {
            let autoDelete = parseInt(config.Tickets.TicketCreatedMessage.AutoDelete);
            if (autoDelete && type == "message") Utils.delete(messageOrInteraction, autoDelete * 1000);
            const response = await createTicket(bot, args, member, channel, !!autoDelete, autoDelete ? autoDelete * 1000 : undefined, undefined, undefined, undefined, reply, type == "interaction");

            if (response) return resolve(true);
            else return resolve();
        });
    },
    description: "Create a ticket",
    usage: config.Tickets.RequireReason ? "new <reason>" : "new [reason]",
    aliases: [
        "ticket"
    ],
    arguments: [
        {
            name: "reason",
            description: "The reason for the ticket",
            required: config.Tickets.RequireReason,
            type: "STRING"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%