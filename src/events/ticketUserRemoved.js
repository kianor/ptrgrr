const Utils = require('../modules/utils');
const { config, lang } = Utils.variables;

module.exports = async (bot, ticket, executor, removedUser) => {

    if (!config.Tickets.Logs.Enabled) return;

    let guild = bot.guilds.cache.get(ticket.guild);
    let logs = Utils.findChannel(config.Tickets.Logs.Channel, guild);

    if (!logs) return;

    logs.send(Utils.Embed({
        author: lang.TicketModule.Logs.Tickets.UserRemoved.Author,
        description: lang.TicketModule.Logs.Tickets.UserRemoved.Description
            .replace(/{executor}/g, executor)
            .replace(/{user}/g, removedUser)
            .replace(/{ticket}/g, ticket.channel_name)
            .replace(/{channel}/g, `<#${ticket.channel_id}>`)
            .replace(/{time}/g, ~~(Date.now() / 1000))
    }));
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%