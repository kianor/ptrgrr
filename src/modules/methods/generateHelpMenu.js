const Utils = require('../utils');
const { config, commands } = Utils.variables;
const commandHandler = require('../handlers/CommandHandler').commands;

module.exports = {
    setup: async function () {
        let modules = await Utils.variables.db.get.getModules();
        let alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

        modules = modules.filter(m => m.enabled).map(m => m.name);

        modules.forEach(type => {
            module.exports[type] = commandHandler
                .filter(c => c.type == type && commands.Enabled[c.command] !== false && c.enabled)
                .sort((a, b) => alphabet.indexOf(a.command.charAt(0).toLowerCase()) - alphabet.indexOf(b.command.charAt(0).toLowerCase()))
                .map(command => config.Help.Type == 'categorized' ? `**{prefix}${command.command}** - ${command.description}` : `\`${command.command}\``).join(config.Help.Type == 'categorized' ? "\n" : ", ");
        });
    }
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%