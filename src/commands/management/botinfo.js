/* eslint-disable no-undef */
const Utils = require("../../modules/utils.js");
const { Embed } = Utils;
const { config } = Utils.variables;

module.exports = {
    name: 'botinfo',
    run: async (bot, messageOrInteraction, args, { reply }) => {
        return new Promise(resolve => {
            const packages = require('../../../package.json');

            const os = process.platform;

            let os_name = "";
            if (os == "win32")
                os_name = "Windows";
            else if (os == "darwin")
                os_name = "MacOS";
            else os_name = os.charAt(0).toUpperCase() + os.slice(1);

            const totalMemory = (process.memoryUsage().heapTotal / 1024 / 1024).toFixed(0);
            const usedMemory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0);

            const usedMemoryPercent = usedMemory / totalMemory * 100;

            const memoryEmoji = usedMemoryPercent < 50 ? ":green_circle:" : (usedMemoryPercent < 90 ? ":yellow_circle:" : ":red_circle:");

            const embed = Embed({
                title: bot.user.username,
                fields: [
                    {
                        name: "Corebot Version",
                        value: config.BotVersion,
                        inline: true
                    },
                    {
                        name: "Discord.js Version",
                        value: packages.dependencies['discord.js'],
                        inline: true
                    },
                    {
                        name: "Node.js Version",
                        value: process.version,
                        inline: true
                    },
                    {
                        name: "Operating System",
                        value: os_name,
                        inline: true
                    },
                    {
                        name: "Memory Usage",
                        value: `${memoryEmoji} **${usedMemory}**/**${totalMemory}mb**`,
                        inline: true
                    },
                    {
                        name: "Servers",
                        value: bot.guilds.cache.size,
                        inline: true
                    },
                    {
                        name: "Users",
                        value: bot.users.cache.size,
                        inline: true
                    }
                ]
            });

            reply(embed);
            resolve(true);
        });
    },
    description: "View info about Corebot",
    usage: "botinfo",
    aliases: [],
    arguments: []
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%