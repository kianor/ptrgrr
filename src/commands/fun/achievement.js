const Utils = require("../../modules/utils");
const Embed = Utils.Embed;

module.exports = {
    name: "achievement",
    run: async (bot, messageOrInteraction, args, { prefixUsed, reply }) => {
        return new Promise(async resolve => {
            if (args.length < 1) {
                reply(Embed({
                    preset: "invalidargs",
                    usage: module.exports.usage
                }, { prefixUsed }), { ephemeral: true });

                return resolve();
            }
    
            reply(Embed({
                image: "https://minecraftskinstealer.com/achievement/1/Achievement+get%21/" + encodeURIComponent(args.join(" "))
            }));

            return resolve(true);
        });
    },
    description: "Generate a minecraft achievement message",
    usage: "achievement <message>",
    aliases: [],
    arguments: [
        {
            name: "message",
            description: "The message you want to generate",
            required: true,
            type: "STRING"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%