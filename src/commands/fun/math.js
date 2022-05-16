const Utils = require('../../modules/utils');
const Embed = Utils.Embed;
const lang = Utils.variables.lang;

const { Parser } = require('expr-eval');

module.exports = {
    name: "math",
    run: async (bot, messageOrInteraction, args, { prefixUsed, reply }) => {
        return new Promise(async resolve => {
            if (args.length < 1) {
                reply(Embed({
                    preset: "invalidargs",
                    usage: module.exports.usage
                }, { prefixUsed }), { ephemeral: true });

                return resolve();
            }

            try {
                const parser = new Parser();
                const expr = parser.evaluate(args.join(" "));

                reply(Embed({
                    title: lang.FunModule.Commands.Math.Embed.Title,
                    fields: [
                        {
                            name: lang.FunModule.Commands.Math.Embed.Fields[0],
                            value: args.join(" ")
                        },
                        {
                            name: lang.FunModule.Commands.Math.Embed.Fields[1],
                            value: expr
                        }
                    ]
                }));

                return resolve(true);
            } catch (err) {
                reply(Embed({
                    preset: "error",
                    description: lang.FunModule.Commands.Math.Error
                }));

                return resolve();
            }
        });
    },
    description: "Evaluate a math equation",
    usage: "math <equation>",
    aliases: [],
    arguments: [
        {
            name: "equation",
            description: "The equation to evaluate",
            required: true,
            type: "STRING"
        }
    ]
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%