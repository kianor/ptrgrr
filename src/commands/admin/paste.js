const Utils = require("../../modules/utils");
const { lang } = Utils.variables;
module.exports = {
    name: "paste",
    run: async (bot, messageOrInteraction, args, { prefixUsed, type, reply }) => {
        return new Promise(async resolve => {
            if (!args.length) {
                reply(Utils.Embed({
                    preset: "invalidargs",
                    usage: module.exports.usage
                }, { prefixUsed }), { ephemeral: true });

                return resolve();
            }
    
            const text = type == "message" ? args.join(" ").trim() : args[0];
            const link = await Utils.paste(text);
    
            reply(Utils.Embed({
                title: lang.AdminModule.Commands.Paste.Title,
                description: lang.AdminModule.Commands.Paste.Description.replace(/{link}/g, link),
                timestamp: new Date()
            }));
    
            return resolve(true);
        });
    },
    description: "Upload text to the paste site",
    usage: "paste <text>",
    aliases: ["haste"],
    arguments: [
        {
            name: "text",
            description: "The text to send to the paste site",
            required: true,
            type: "STRING"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%