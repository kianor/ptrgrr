const Utils = require('./utils.js');

String.prototype.replaceText = function replace(replace, value) {
    return this.String.replace(new RegExp(replace, 'g'), value);
};
module.exports = function (guild, text, customPlaceholders = []) {
    customPlaceholders.forEach(placeholder => {
        text = text.replaceText(placeholder['replace'], placeholder['value']);
    });
    return text.replace('%members%', guild.memberCount)
        .replace('%botcount%', guild.members.filter(m => m.user.bot).size)
        .replace('%humancount%', guild.members.filter(m => !m.user.bot).size)
        .replace('%channels%', guild.channels.size)
        .replace('%textchannels%', guild.channels.filter(c => c.type == 'GUILD_TEXT').size)
        .replace('%categories%', guild.channels.filter(c => c.type == 'GUILD_CATEGORY').size)
        .replace('%voicechannels%', guild.channels.filter(c => c.type == 'GUILD_VOICE').size);
        //.replace('%tickets%', await Utils.getOpenTickets(message.guild).size)
    // LIST: https://paste.thislightman.com/epajuhetom.shell
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%