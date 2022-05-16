const Utils = require("../../modules/utils");

module.exports = {
    name: "embed",
    run: async (bot, messageOrInteraction, args, { member, guild, reply }) => {
        return new Promise(async resolve => {
            if (!args.length) {
                reply(Utils.Embed({ preset: "invalidargs", usage: "embed <embed name>" }));
                return resolve();
            }

            let embed = Utils.variables.embeds.Embeds[args.join(" ")];

            if (!embed) {
                reply(Utils.Embed({ preset: "error", description: Utils.variables.lang.ManagementModule.Commands.Embed.NotFound.replace(/{name}/g, args.join(" ")) }));
                return resolve();
            }

            reply(Utils.setupMessage({
                configPath: embed,
                variables: [
                    ...Utils.userVariables(member, "user"),
                    ...Utils.userVariables(member, "executor"),
                    { searchFor: /{server-name}/g, replaceWith: guild.name },
                    { searchFor: /{prefix}/g, replaceWith: await Utils.variables.db.get.getPrefixes(guild.id) },
                    { searchFor: /{total}/g, replaceWith: guild.memberCount },
                    { searchFor: /{timestamp}/g, replaceWith: Math.floor((Date.now() + (Math.random() * 5000000)) / 1000) }
                ]
            }));

            resolve(true);
        });
    },
    usage: "embed <embed name>",
    description: "Test out an embed from the embeds.yml",
    aliases: [],
    arguments: [
        {
            name: "embed",
            description: "The name of the embed",
            required: true,
            type: "STRING"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%