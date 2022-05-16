const Utils = require("../../modules/utils");
const Commands = require('../../modules/handlers/CommandHandler').commands;
const { capitalize } = require("lodash");
const { config, lang } = Utils.variables;

module.exports = {
    name: "staffhelp",
    run: async (bot, messageOrInteraction, args, { slashCommand, prefixUsed, type, member, guild, reply }) => {
        return new Promise(async resolve => {
            let prefix = prefixUsed == "/" ? "/" : await Utils.variables.db.get.getPrefixes(guild.id);
            let CommandList = require("../../modules/methods/generateHelpMenu");
            if (!CommandList.staff) await CommandList.setup();

            const subcommand = type == "interaction" ? slashCommand.subcommand : args[0];
            const commandOrCategoryName = type == "interaction" ? args[0] : args[1]; 

            let command = commandOrCategoryName ? Commands
                .filter(c => !['general', 'tickets', 'coins', 'exp', 'other'].includes(c.type))
                .find(c => c.command == commandOrCategoryName.toLowerCase() || c.aliases.find(a => a == commandOrCategoryName.toLowerCase())) : undefined;

            if (subcommand == "command" && command && (config.Help.Type.toLowerCase() == "categorized" ? !["giveaway", "giveaways"].includes(subcommand) : true)) {
                reply(Utils.Embed({
                    title: config.Help.Command.Title.replace(/{name}/g, capitalize(command.command)),
                    fields: [
                        { name: config.Help.Command.Fields[0], value: command.description },
                        { name: config.Help.Command.Fields[1], value: command.aliases.map(a => prefix + a).join('\n').length < 1 ? lang.Global.None : command.aliases.map(a => prefix + a).join('\n') },
                        { name: config.Help.Command.Fields[2], value: prefix + command.usage },
                        { name: config.Help.Command.Fields[3], value: capitalize(command.type) }
                    ]
                }));

                return resolve(true);
            }

            let categories = config.Help.Categories.filter(category => { // Remove non staff categories & categories with modules that are all disabled
                let modules = category.Modules.filter(module => CommandList[module]);
                return modules.length && category.Staff;
            });

            if (config.Help.Type.toLowerCase() == "categorized") {
                let category = commandOrCategoryName ? categories.find(c => c.Names.includes(commandOrCategoryName.toLowerCase())) : undefined;

                if (commandOrCategoryName && category) {
                    let commands = category.Modules.filter(module => CommandList[module]).map(module => CommandList[module]).join("\n");

                    if (commands.length) {
                        let pages = Math.ceil(commands.split("\n").length / 20);
                        let page = +args[1] || 1;

                        if (page > pages) page = 1;

                        reply(Utils.Embed({
                            title: `${category.Emoji} ${category.DisplayNames[1]} (Page ${page}/${pages})`,
                            description: commands.split("\n").slice((page - 1) * 20, page * 20).join("\n").replace(/{prefix}/g, prefix),
                            footer: {
                                text: guild.me.displayName,
                                icon: bot.user.displayAvatarURL({ dynamic: true })
                            },
                            timestamp: new Date()
                        })).then(async m => {
                            if (pages > 1) {
                                await m.react("◀️");
                                m.react("▶️");
                            }
                        });

                        return resolve(true);
                    }
                }

                reply(Utils.setupMessage({
                    title: config.Help.StaffTitle,
                    configPath: Utils.variables.embeds.Embeds.CategorizedStaffHelp,
                    variables: [
                        ...Utils.userVariables(guild.me, "bot"),
                        { searchFor: /{prefix}/g, replaceWith: prefix }
                    ]
                })).then(async m => {
                    categories.forEach(async category => {
                        await m.react(Utils.findEmoji(category.Emoji, bot, false) || category.Emoji);
                    });
                });

                return resolve(true);
            } else {
                let embed = Utils.Embed({
                    title: config.Help.StaffTitle,
                    fields: [],
                    footer: {
                        text: guild.me.displayName,
                        icon: bot.user.displayAvatarURL({ dynamic: true })
                    },
                    timestamp: new Date()
                });

                categories.forEach(category => {
                    embed.embeds[0].fields.push({
                        name: category.DisplayNames[0],
                        value: category.Modules.filter(module => CommandList[module]).map(module => CommandList[module]).join("\n")
                    });
                });

                if (config.Help.Type == "dm") { 
                    member.send(embed)
                    .then(() => {
                        reply(Utils.Embed({ title: config.Help.SentToDMs }), { ephemeral: true });

                        return resolve(true);
                    })
                    .catch(() => {
                        reply(Utils.Embed({ title: config.Help.DMsLocked }), { ephemeral: true });

                        return resolve();
                    });
                } else {
                    reply(embed);
                    return resolve(true);
                }
            }
        });
    },
    description: "View the staff help menu",
    aliases: ["shelp"],
    usage: "staffhelp [command|module name] [command name]",
    arguments: [
        {
            name: "help",
            description: "View the help menu",
            type: "SUB_COMMAND"
        },
        {
            name: "command",
            description: "View a specific command's help menu",
            options: [
                {
                    name: "command",
                    description: "The command to get help with",
                    required: true,
                    type: "STRING"
                }
            ],
            type: "SUB_COMMAND"
        },
        {
            name: "module",
            description: "View a specific module's help menu",
            options: [
                {
                    name: "module",
                    description: "The module to get help with",
                    required: true,
                    type: "STRING"
                }
            ],
            type: "SUB_COMMAND"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%