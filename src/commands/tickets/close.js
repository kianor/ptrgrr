const closeTicket = require("../../modules/methods/closeTicket");

module.exports = {
    name: "close",
    run: async (bot, messageOrInteraction, args, { member, channel, reply }) => {
        return new Promise(async resolve => {
            const response = await closeTicket(bot, args, member, channel, undefined, reply);

            if (response) return resolve(true);
            else return resolve();
        });
    },
    description: "Close the ticket you are typing in",
    usage: "close [reason]",
    aliases: [
        "ticketclose",
        "closeticket"
    ],
    arguments: [
        {
            name: "reason",
            description: "The reason for closing the ticket",
            required: false,
            type: "STRING"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%