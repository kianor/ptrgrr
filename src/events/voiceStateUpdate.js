const Utils = require('../modules/utils.js');
const { config, usersInVoiceChannel, channelLogBlacklist, embeds } = Utils.variables;

let checkState = state => {
    let roles = [...state.member.roles.cache.map(r => r.name), ...state.member.roles.cache.map(r => r.id)];

    if (config.Other.VoiceTime.Ignore.DeafenedUsers && state.deaf) return false;
    if (config.Other.VoiceTime.Ignore.MutedUsers && state.mute) return false;
    if (state.channel.members.size < config.Other.VoiceTime.MinUsersInVC) return false;
    if (config.Other.VoiceTime.Blacklist.Channels.includes(state.channel.id) || config.Other.VoiceTime.Blacklist.Channels.includes(state.channel.name)) return false;
    if (roles.some(r => config.Other.VoiceTime.Blacklist.Roles.includes(r))) return false;

    return true;
};

let endVoiceTime = async state => {
    let voiceData = await Utils.variables.db.get.getVoiceData(state.member);

    if (voiceData && voiceData.join_date) {
        let leaveDate = Date.now();
        let timeInVC = leaveDate - voiceData.join_date;

        await Utils.variables.db.update.voice_time.updateJoinTime(state.member, null);
        await Utils.variables.db.update.voice_time.addVoiceTime(state.member, timeInVC);
    }
};

let startVoiceTime = async state => {
    await Utils.variables.db.update.voice_time.updateJoinTime(state.member, Date.now());
};

module.exports = async (bot, oldState, newState) => {
    if (require('../modules/handlers/CommandHandler.js').commands.length > 0) {
        if (config.Other.IgnoredGuilds.includes(oldState.guild.id) || newState.member.user.bot) return;

        const variables = [
            ...Utils.userVariables(oldState.member, "user"),
            { searchFor: /{time}/g, replaceWith: new Date().toLocaleString() }
        ];

        if (!oldState.channel && newState.channel) { // Joined voice channel
            let countTime = checkState(newState);

            if (countTime) startVoiceTime(newState);

            // Enough users joined for voice time to begin being counted for other users
            if (newState.channel.members.size == config.Other.VoiceTime.MinUsersInVC) {
                newState.channel.members.filter(m => m.user.id != newState.member.user.id && checkState(m.voice)).forEach(member => {
                    startVoiceTime(member.voice);
                });
            }

            if (config.Logs.Enabled.includes("JoinVoiceChannel")) {
                const channel = Utils.findChannel(config.Logs.Channels.JoinVoiceChannel, oldState.guild);

                if (channel) channel.send(Utils.setupMessage({
                    configPath: embeds.Embeds.JoinVoiceChannel,
                    variables: [
                        ...variables,
                        { searchFor: /{channel-name}/g, replaceWith: newState.channel.name },
                        { searchFor: /{channel-id}/g, replaceWith: newState.channel.id },
                        { searchFor: /{channel-mention}/g, replaceWith: newState.channel.toString() },
                    ]
                }));
            }

        } else if (oldState.channel && !newState.channel) { // Left voice channel
            endVoiceTime(newState);

            // Ends voice time for users still in the VC if there is no longer the required amount 
            if (oldState.channel.members.size < config.Other.VoiceTime.MinUsersInVC) {
                oldState.channel.members.forEach(member => {
                    endVoiceTime(member.voice);
                });
            }

            if (config.Logs.Enabled.includes("LeaveVoiceChannel")) {
                const channel = Utils.findChannel(config.Logs.Channels.LeaveVoiceChannel, oldState.guild);

                if (channel) channel.send(Utils.setupMessage({
                    configPath: embeds.Embeds.LeaveVoiceChannel,
                    variables: [
                        ...variables,
                        { searchFor: /{channel-name}/g, replaceWith: oldState.channel.name },
                        { searchFor: /{channel-id}/g, replaceWith: oldState.channel.id },
                        { searchFor: /{channel-mention}/g, replaceWith: oldState.channel.toString() },
                    ]
                }));
            }
        } else if (config.Logs.Enabled.includes("SwitchVoiceChannel") && oldState.channel && newState.channel && oldState.channel.id != newState.channel.id) { // Switched voice channels
            endVoiceTime(newState);
            if (checkState(newState)) startVoiceTime(newState);

            if (oldState.channel.members.size < config.Other.VoiceTime.MinUsersInVC) {
                oldState.channel.members.forEach(member => {
                    endVoiceTime(member.voice);
                });
            }

            // Enough users joined for voice time to begin being counted for other users
            if (newState.channel.members.size == config.Other.VoiceTime.MinUsersInVC) {
                newState.channel.members.filter(m => m.user.id != newState.member.user.id && checkState(m.voice)).forEach(member => {
                    startVoiceTime(member.voice);
                });
            }

            const channel = Utils.findChannel(config.Logs.Channels.SwitchVoiceChannel, oldState.guild);

            if (channel) channel.send(Utils.setupMessage({
                configPath: embeds.Embeds.SwitchVoiceChannel,
                variables: [
                    ...variables,
                    { searchFor: /{old-channel-name}/g, replaceWith: oldState.channel.name },
                    { searchFor: /{old-channel-id}/g, replaceWith: oldState.channel.id },
                    { searchFor: /{old-channel-mention}/g, replaceWith: oldState.channel.toString() },
                    { searchFor: /{new-channel-name}/g, replaceWith: newState.channel.name },
                    { searchFor: /{new-channel-id}/g, replaceWith: newState.channel.id },
                    { searchFor: /{new-channel-mention}/g, replaceWith: newState.channel.toString() },
                ]
            }));
        } else if (oldState.channel && newState.channel && oldState.channel.id == newState.channel.id) {
            let o = checkState(oldState);
            let n = checkState(newState);

            if (o && !n) endVoiceTime(newState);
            if (!o && n) startVoiceTime(newState);
        }

        if (config.TempChannels.Enabled) {
            if (!oldState.channel && newState.channel) {
                usersInVoiceChannel.push({ user: newState.member.id, joinedAt: Date.now() });
            } else if (oldState.channel && newState.channel && oldState.channelId !== newState.channelId && usersInVoiceChannel.map(u => u.user).includes(oldState.member.id)) {
                usersInVoiceChannel.splice(usersInVoiceChannel.indexOf(usersInVoiceChannel.find(u => u.user == oldState.member.id)), 1);
                usersInVoiceChannel.push({ user: newState.member.id, joinedAt: Date.now() });
            } else if (oldState.channel && !newState.channel && usersInVoiceChannel.map(u => u.user).includes(oldState.member.id)) {
                usersInVoiceChannel.splice(usersInVoiceChannel.indexOf(usersInVoiceChannel.find(u => u.user == oldState.member.id)), 1);
            }

            let tempVC = Utils.findChannel(config.TempChannels.VoiceChannel, oldState.guild, 'GUILD_VOICE');
            let tempCategory = Utils.findChannel(config.TempChannels.Category, oldState.guild, 'GUILD_CATEGORY');
            if (!tempVC || !tempCategory) return;

            if (tempCategory) {
                if (newState.channelId == tempVC.id) {
                    const name = config.TempChannels.ChannelNameFormat
                        .replace(/{user-username}/g, oldState.member.user.username)
                        .replace(/{user-tag}/g, oldState.member.user.tag)
                        .replace(/{user-id}/g, oldState.member.user.id)
                        .replace(/{user-displayname}/g, oldState.member.displayName);

                    channelLogBlacklist.add(name);
                    oldState.guild.channels.create(name
                        , { type: 'GUILD_VOICE', parent: tempCategory }).then(channel => {
                            Utils.variables.tempChannels.set(oldState.id, {
                                channel: {
                                    id: channel.id,
                                    name: channel.name
                                },
                                public: true,
                                allowedUsers: [oldState.id],
                                maxMembers: undefined,
                                bitrate: config.TempChannels.DefaultBitrate
                            });
                            oldState.setChannel(channel.id);
                            channelLogBlacklist.delete(name);
                        });
                }
            }

            if (oldState.channel && oldState.channel !== newState.channel && oldState.channel.parentId == tempCategory.id) {
                if (oldState.channel.members.size == 0 && oldState.channelId !== tempVC.id) {
                    if (Utils.variables.tempChannels.get(oldState.id)) {
                        setTimeout(() => {
                            Utils.variables.tempChannels.delete(oldState.id);
                        }, 3000);
                    }

                    oldState.channel.delete().catch(() => { });
                }
            }
        }
    }
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%