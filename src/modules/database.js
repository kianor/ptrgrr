/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
let Utils = {};

module.exports = {
    mysql: {

    },
    sqlite: {

    },
    setup: async (config, bot) => {
        return new Promise(async (resolve, reject) => {
            Utils = require('./utils.js');
            let type = config.Storage.Type;
            if (!['sqlite', 'mysql'].includes(type.toLowerCase())) return reject('Invalid database type.');
            if (type.toLowerCase() == 'mysql') {
                try {
                    require.resolve('mysql');

                    await new Promise(async resolve => {
                        module.exports.mysql.module = require('mysql');
                        const db = module.exports.mysql.module.createConnection({
                            host: config.Storage.MySQL.Host,
                            user: config.Storage.MySQL.User,
                            password: config.Storage.MySQL.Password,
                            database: config.Storage.MySQL.Database,
                            port: parseInt(config.Storage.MySQL.Port) ? config.Storage.MySQL.Port : "3306"
                        });

                        db.connect(async (err) => {
                            if (err) {
                                if (err.message.startsWith('getaddrinfo ENOTFOUND') || err.message.startsWith("connect ECONNREFUSED")) {
                                    console.log(err.message);
                                    console.log(Utils.errorPrefix + 'The provided MySQL Host address is incorrect. Be sure to not include the port!' + Utils.color.Reset);
                                    return process.exit();
                                } else {
                                    return console.log(err);
                                }
                            }

                            const calls = [
                                `USE ${config.Storage.MySQL.Database}`,
                                'CREATE TABLE IF NOT EXISTS coins (user VARCHAR(18) NOT NULL, guild VARCHAR(18) NOT NULL, coins INT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS experience (user VARCHAR(18) NOT NULL, guild VARCHAR(18) NOT NULL, level INT NOT NULL, xp INT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS filter (word TEXT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS giveaways (guild VARCHAR(18) NOT NULL, channel VARCHAR(18) NOT NULL, message VARCHAR(18) NOT NULL, prize TEXT, description TEXT, start BIGINT(20), end BIGINT(20), amount_of_winners INT NOT NULL, host VARCHAR(18) NOT NULL, requirements TEXT, ended BOOLEAN NOT NULL, winners TEXT)',
                                'CREATE TABLE IF NOT EXISTS giveawayreactions (giveaway VARCHAR(18) NOT NULL, user VARCHAR(18) NOT NULL, entries INT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS prefixes (guild VARCHAR(18) NOT NULL, prefix TEXT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS status (type TEXT NOT NULL, activity TEXT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS tickets (guild VARCHAR(18) NOT NULL, channel_id VARCHAR(18) NOT NULL, channel_name TEXT NOT NULL, creator VARCHAR(18) NOT NULL, reason TEXT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS ticketsaddedusers (user VARCHAR(18) NOT NULL, ticket VARCHAR(18) NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS ticketmessages (message VARCHAR(18), author VARCHAR(18) NOT NULL, authorAvatar TEXT NOT NULL, authorTag TEXT NOT NULL, created_at BIGINT(20) NOT NULL, embed_title TEXT, embed_description TEXT, embed_color TEXT, attachment TEXT, content TEXT, ticket VARCHAR(18) NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS ticketmessages_embed_fields (message VARCHAR(18), name TEXT NOT NULL, value TEXT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS modules (name TEXT NOT NULL, enabled BOOLEAN NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS punishments (id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, type TEXT NOT NULL, user VARCHAR(18) NOT NULL, tag TEXT NOT NULL, reason TEXT NOT NULL, time BIGINT(20) NOT NULL, executor VARCHAR(18) NOT NULL, length INTEGER, complete INTEGER)',
                                'CREATE TABLE IF NOT EXISTS warnings (id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, user VARCHAR(18) NOT NULL, tag TEXT NOT NULL, reason TEXT NOT NULL, time BIGINT(20) NOT NULL, executor VARCHAR(18) NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS jobs (user VARCHAR(18), guild VARCHAR(18), job TEXT, tier INTEGER, amount_of_times_worked INTEGER)',
                                'CREATE TABLE IF NOT EXISTS job_cooldowns (user VARCHAR(18), guild VARCHAR(18), date BIGINT(20))',
                                'CREATE TABLE IF NOT EXISTS global_times_worked (user VARCHAR(18), guild VARCHAR(18), times_worked INTEGER)',
                                'CREATE TABLE IF NOT EXISTS dailycoinscooldown (user VARCHAR(18), guild VARCHAR(18), date BIGINT(20))',
                                'CREATE TABLE IF NOT EXISTS commands (name TEXT NOT NULL, enabled BOOLEAN NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS applications (guild VARCHAR(18), channel_id VARCHAR(18), channel_name TEXT NOT NULL, creator VARCHAR(18), status TEXT NOT NULL, _rank TEXT NOT NULL, questions_answers TEXT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS applicationmessages (message VARCHAR(18), author VARCHAR(18) NOT NULL, authorAvatar TEXT NOT NULL, authorTag TEXT NOT NULL, created_at BIGINT(20) NOT NULL, embed_title TEXT, embed_description TEXT, embed_color TEXT, attachment TEXT, content TEXT, application VARCHAR(18) NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS applicationmessages_embed_fields (message VARCHAR(18), name TEXT NOT NULL, value TEXT NOT NULL)',
                                'CREATE TABLE IF NOT EXISTS saved_roles (user VARCHAR(18), guild VARCHAR(18), roles TEXT)',
                                'CREATE TABLE IF NOT EXISTS game_data (user VARCHAR(18), guild VARCHAR(18), data TEXT)',
                                'CREATE TABLE IF NOT EXISTS unloaded_addons (addon_name TEXT)',
                                'CREATE TABLE IF NOT EXISTS blacklists (user TEXT, guild TEXT, commands TEXT)',
                                'CREATE TABLE IF NOT EXISTS id_bans (guild VARCHAR(18), id VARCHAR(18), executor VARCHAR(18), reason TEXT)',
                                'CREATE TABLE IF NOT EXISTS reminders (id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, member VARCHAR(18), reminder TEXT, time BIGINT(20))',
                                'CREATE TABLE IF NOT EXISTS announcements (id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, announcement_data TEXT, next_broadcast BIGINT(20))',
                                'CREATE TABLE IF NOT EXISTS weeklycoinscooldown (user VARCHAR(18), guild VARCHAR(18), date BIGINT(20))',
                                'CREATE TABLE IF NOT EXISTS suggestions (id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, guild VARCHAR(18), channel VARCHAR(18), message VARCHAR(18), suggestion TEXT, creator VARCHAR(18), status TEXT, votes TEXT, created_on BIGINT(20), status_changed_on BIGINT(20), status_changed_by VARCHAR(18), image TEXT)',
                                'CREATE TABLE IF NOT EXISTS bugreports (id INTEGER NOT NULL PRIMARY KEY AUTO_INCREMENT, guild VARCHAR(18), channel VARCHAR(18), message VARCHAR(18), bug TEXT, creator VARCHAR(18), status TEXT, created_on BIGINT(20), status_changed_on BIGINT(20), status_changed_by VARCHAR(18), image TEXT)',
                                'CREATE TABLE IF NOT EXISTS locked_channels (guild VARCHAR(18), channel VARCHAR(18), permissions TEXT)',
                                'CREATE TABLE IF NOT EXISTS invites(guild VARCHAR(18), user VARCHAR(18), regular INTEGER, bonus INTEGER, leaves INTEGER, fake INTEGER)',
                                'CREATE TABLE IF NOT EXISTS joins(guild VARCHAR(18), user VARCHAR(18), inviter VARCHAR(18), time BIGINT(20))',
                                'CREATE TABLE IF NOT EXISTS role_menus(guild VARCHAR(18), channel VARCHAR(18), message VARCHAR(18), name TEXT)',
                                'CREATE TABLE IF NOT EXISTS command_channels(command TEXT, type TEXT, channels TEXT)',
                                'CREATE TABLE IF NOT EXISTS message_counts(guild VARCHAR(18), user VARCHAR(18), count INTEGER)',
                                'CREATE TABLE IF NOT EXISTS voice_time(guild VARCHAR(18), user VARCHAR(18), total_time INTEGER, join_date BIGINT(20))',
                                'CREATE TABLE IF NOT EXISTS saved_mute_roles (user VARCHAR(18), guild VARCHAR(18), roles TEXT)',
                            ];

                            await Promise.all(
                                calls.map(call => {
                                    return new Promise(resolve => {
                                        db.query(call, err => {
                                            if (err) reject(err);
                                            resolve();
                                        });
                                    });
                                })
                            );
                            console.log(Utils.infoPrefix + 'MySQL connected.');

                            module.exports.mysql.database = db;

                            // Set default bot status
                            await db.query('SELECT * FROM status', (err, status) => {
                                if (err) throw err;
                                if (status.length < 1) {
                                    db.query('INSERT INTO status VALUES(?, ?)', ['Playing', 'CoreBot']);
                                }
                            });

                            // Update punishments table
                            await db.query("SHOW COLUMNS FROM punishments", (err, columns) => {
                                const punishmentColumns = JSON.parse(JSON.stringify(columns));

                                if (!punishmentColumns.find(column => column.Field == "complete")) {
                                    console.log(Utils.infoPrefix + "Updating punishments table...");
                                    db.query("ALTER TABLE punishments ADD COLUMN complete BOOLEAN NOT NULL", () => {
                                        console.log(Utils.infoPrefix + "Punishments table updated.");
                                    });
                                }
                            });

                            // Update giveaways table
                            await db.query("SHOW COLUMNS FROM giveaways", async (err, columns) => {
                                const giveawayColumns = JSON.parse(JSON.stringify(columns));

                                let newColumns = [
                                    giveawayColumns.find(column => column.Field == "requirements"),
                                    giveawayColumns.find(column => column.Field == "message"),
                                    giveawayColumns.find(column => column.Field == "prize"),
                                    giveawayColumns.find(column => column.Field == "amount_of_winners"),
                                    (giveawayColumns.find(column => column.Field == "winners") && !giveawayColumns.find(column => column.Field == "users")),
                                    giveawayColumns.find(column => column.Field == "host")
                                ];

                                if (newColumns.some(c => !c)) {
                                    console.log(Utils.infoPrefix + "Updating giveaways table...");

                                    Utils.asyncForEach(newColumns, async (c, i) => {
                                        if (!c) {
                                            if (i == 0) await db.query("ALTER TABLE giveaways ADD COLUMN requirements TEXT", (e) => { if (e) throw e; });
                                            if (i == 1) await db.query("ALTER TABLE giveaways RENAME COLUMN messageID TO message", (e) => { if (e) throw e; });
                                            if (i == 2) await db.query("ALTER TABLE giveaways RENAME COLUMN name TO prize", (e) => { if (e) throw e; });
                                            if (i == 3) await db.query("ALTER TABLE giveaways RENAME COLUMN winners TO amount_of_winners", (e) => { if (e) throw e; });
                                            if (i == 4) await db.query("ALTER TABLE giveaways RENAME COLUMN users TO winners", (e) => { if (e) throw e; });
                                            if (i == 5) await db.query("ALTER TABLE giveaways RENAME COLUMN creator TO host", (e) => { if (e) throw e; });
                                        }
                                    });

                                    console.log(Utils.infoPrefix + "Giveaways table updated.");
                                }
                            });

                            await db.query("SHOW COLUMNS FROM giveaways", async (err, columns) => {
                                const giveawayReactionColumns = JSON.parse(JSON.stringify(columns));

                                if (!giveawayReactionColumns.find(column => column.Field == "entries")) {
                                    await db.query("ALTER TABLE giveawayreactions ADD COLUMN entries INTEGER", (e) => { if (e) throw e; });
                                    console.log(Utils.infoPrefix + "Giveaway reactions table updated.");
                                }
                            });

                            bot.on("commandsLoaded", (Commands, withAddons) => {
                                // Set default modules
                                db.query('SELECT * FROM modules', (err, modules) => {
                                    if (err) throw err;
                                    const moduleNames = [...new Set(Commands.filter(c => withAddons ? c.addonName : true).map(c => c.type))];
                                    moduleNames.forEach(m => {
                                        if (!modules.map(mod => mod.name).includes(m)) {
                                            db.query('INSERT INTO modules(name, enabled) VALUES(?, ?)', [m, true], (err) => {
                                                if (err) console.log(err);
                                            });
                                        }
                                    });
                                });

                                // Set default commands
                                db.query('SELECT * FROM commands', (err, commands) => {
                                    if (err) throw err;

                                    const commandNames = [...new Set(Commands.filter(c => withAddons ? c.addonName : true).map(c => c.command))];
                                    commandNames.forEach(c => {
                                        if (!commands.map(cmd => cmd.name).includes(c)) {
                                            db.query('INSERT INTO commands(name, enabled) VALUES(?, ?)', [c, true], (err) => {
                                                if (err) console.log(err);
                                            });
                                        }
                                    });
                                });

                                let length = Commands.filter(c => withAddons ? c.addonName : true).length;

                                if (length) {
                                    if (withAddons) console.log(Utils.infoPrefix + length + " additional commands have been loaded. (Total: " + Commands.length + ")");
                                    else console.log(Utils.infoPrefix + length + " commands have been loaded.");
                                }
                            });

                            resolve();
                        });
                    });
                } catch (err) {
                    reject(Utils.errorPrefix + 'MySQL is not installed or the database info is incorrect. Install mysql with npm install mysql. Database will default to sqlite.');
                    type = 'sqlite';
                }
            }
            if (type.toLowerCase() == 'sqlite') {
                try {
                    require.resolve('better-sqlite3');

                    await new Promise(async resolve => {
                        module.exports.sqlite.module = require('better-sqlite3');
                        const db = module.exports.sqlite.module('./data/database.sqlite');

                        module.exports.sqlite.database = db;

                        const calls = [
                            'CREATE TABLE IF NOT EXISTS coins (user text, guild text, coins integer)',
                            'CREATE TABLE IF NOT EXISTS experience (user text, guild text, level integer, xp integer)',
                            'CREATE TABLE IF NOT EXISTS experience (user text, guild text, level integer, xp integer)',
                            'CREATE TABLE IF NOT EXISTS giveaways (guild text, channel text, message text, prize text, description text, start integer, end integer, amount_of_winners integer, host text, requirements text, ended integer, winners text)',
                            'CREATE TABLE IF NOT EXISTS giveawayreactions (giveaway text, user text, entries integer)',
                            'CREATE TABLE IF NOT EXISTS filter (word text)',
                            'CREATE TABLE IF NOT EXISTS prefixes (guild text PRIMARY KEY, prefix text)',
                            'CREATE TABLE IF NOT EXISTS status (type text, activity text)',
                            'CREATE TABLE IF NOT EXISTS tickets (guild text, channel_id text, channel_name text, creator text, reason text)',
                            'CREATE TABLE IF NOT EXISTS ticketsaddedusers (user text, ticket text)',
                            'CREATE TABLE IF NOT EXISTS ticketmessages (message text, author text, authorAvatar text, authorTag text, created_at integer, embed_title text, embed_description text, embed_color text, attachment text, content text, ticket text)',
                            'CREATE TABLE IF NOT EXISTS ticketmessages_embed_fields (message text, name text, value text)',
                            'CREATE TABLE IF NOT EXISTS modules (name text, enabled integer)',
                            'CREATE TABLE IF NOT EXISTS punishments (id INTEGER PRIMARY KEY AUTOINCREMENT, type text, user text, tag text, reason text, time integer, executor text, length integer, complete integer)',
                            'CREATE TABLE IF NOT EXISTS warnings (id INTEGER PRIMARY KEY AUTOINCREMENT, user text, tag text, reason text, time integer, executor text)',
                            'CREATE TABLE IF NOT EXISTS jobs (user text, guild text, job text, tier integer, amount_of_times_worked integer)',
                            'CREATE TABLE IF NOT EXISTS global_times_worked (user text, guild text, times_worked integer)',
                            'CREATE TABLE IF NOT EXISTS job_cooldowns (user text, guild text, date text)',
                            'CREATE TABLE IF NOT EXISTS dailycoinscooldown (user text, guild text, date text)',
                            'CREATE TABLE IF NOT EXISTS commands (name text, enabled integer)',
                            'CREATE TABLE IF NOT EXISTS applications (guild text, channel_id text, channel_name text, creator text, status text, rank text, questions_answers text)',
                            'CREATE TABLE IF NOT EXISTS applicationmessages (message text, author text, authorAvatar text, authorTag text, created_at integer, embed_title text, embed_description text, embed_color text, attachment text, content text, application text)',
                            'CREATE TABLE IF NOT EXISTS applicationmessages_embed_fields (message text, name text, value text)',
                            'CREATE TABLE IF NOT EXISTS saved_roles (user text, guild text, roles text)',
                            'CREATE TABLE IF NOT EXISTS game_data (user text, guild text, data text)',
                            'CREATE TABLE IF NOT EXISTS unloaded_addons (addon_name text)',
                            'CREATE TABLE IF NOT EXISTS blacklists (user text, guild text, commands text)',
                            'CREATE TABLE IF NOT EXISTS id_bans (guild text, id text, executor text, reason text)',
                            'CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, member text, reminder text, time integer)',
                            'CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, announcement_data TEXT, next_broadcast integer)',
                            'CREATE TABLE IF NOT EXISTS weeklycoinscooldown (user text, guild text, date text)',
                            'CREATE TABLE IF NOT EXISTS suggestions (id INTEGER PRIMARY KEY AUTOINCREMENT, guild text, channel text, message text, suggestion text, creator text, status text, votes text, created_on integer, status_changed_on integer, status_changed_by text, image text)',
                            'CREATE TABLE IF NOT EXISTS bugreports (id INTEGER PRIMARY KEY AUTOINCREMENT, guild text, channel text, message text, bug text, creator text, status text, created_on integer, status_changed_on integer, status_changed_by text, image text)',
                            'CREATE TABLE IF NOT EXISTS locked_channels (guild text, channel text, permissions text)',
                            'CREATE TABLE IF NOT EXISTS invites(guild text, user text, regular integer, bonus integer, leaves integer, fake integer)',
                            'CREATE TABLE IF NOT EXISTS joins(guild text, user text, inviter text, time integer)',
                            'CREATE TABLE IF NOT EXISTS role_menus(guild text, channel text, message text, name text)',
                            'CREATE TABLE IF NOT EXISTS command_channels(command text, type text, channels text)',
                            'CREATE TABLE IF NOT EXISTS message_counts(guild text, user text, count integer)',
                            'CREATE TABLE IF NOT EXISTS voice_time(guild text, user text, total_time integer, join_date text)',
                            'CREATE TABLE IF NOT EXISTS saved_mute_roles (user text, guild text, roles text)',
                        ];

                        await Promise.all(
                            calls.map(call => {
                                return new Promise(resolve => {
                                    db.prepare(call).run();
                                    resolve();
                                });
                            })
                        );

                        console.log(Utils.infoPrefix + 'Better-SQLite3 ready.');

                        // Set default bot status
                        const status = db.prepare("SELECT * FROM status").all();

                        if (status.length < 1) {
                            db.prepare("INSERT INTO status VALUES(?, ?)").run('Playing', 'CoreBot');
                        }

                        // Update punishments table
                        const punishmentColumns = db.prepare("SELECT * FROM punishments").columns();

                        if (!punishmentColumns.find(column => column.name == "complete")) {
                            console.log(Utils.infoPrefix + "Updating punishments table...");
                            db.prepare("ALTER TABLE punishments ADD COLUMN complete integer").run();
                            console.log(Utils.infoPrefix + "Punishments table updated.");
                        }

                        // Update giveaways table
                        const giveawayColumns = db.prepare("SELECT * FROM giveaways").columns();

                        let newColumns = [
                            giveawayColumns.find(column => column.name == "requirements"),
                            giveawayColumns.find(column => column.name == "message"),
                            giveawayColumns.find(column => column.name == "prize"),
                            giveawayColumns.find(column => column.name == "amount_of_winners"),
                            (giveawayColumns.find(column => column.name == "winners") && !giveawayColumns.find(column => column.name == "users")),
                            giveawayColumns.find(column => column.name == "host")
                        ];

                        if (newColumns.some(c => !c)) {
                            console.log(Utils.infoPrefix + "Updating giveaways table...");

                            await newColumns.forEach(async (c, i) => {
                                if (!c) {
                                    if (i == 0) db.prepare("ALTER TABLE giveaways ADD COLUMN requirements text").run();
                                    if (i == 1) db.prepare("ALTER TABLE giveaways RENAME COLUMN messageID TO message").run();
                                    if (i == 2) db.prepare("ALTER TABLE giveaways RENAME COLUMN name TO prize").run();
                                    if (i == 3) db.prepare("ALTER TABLE giveaways RENAME COLUMN winners TO amount_of_winners").run();
                                    if (i == 4) db.prepare("ALTER TABLE giveaways RENAME COLUMN users TO winners").run();
                                    if (i == 5) db.prepare("ALTER TABLE giveaways RENAME COLUMN creator TO host").run();
                                }
                            });

                            console.log(Utils.infoPrefix + "Giveaways table updated.");
                        }

                        const giveawayReactionColumns = db.prepare("SELECT * FROM giveawayreactions").columns();

                        if (!giveawayReactionColumns.find(column => column.name == "entries")) {
                            db.prepare("ALTER TABLE giveawayreactions ADD COLUMN entries integer").run();
                            console.log(Utils.infoPrefix + "Giveaway reactions table updated.");
                        }

                        bot.on("commandsLoaded", (Commands, withAddons) => {
                            // Set default modules
                            const modules = db.prepare("SELECT * FROM modules").all();
                            const moduleNames = [...new Set(Commands.filter(c => withAddons ? c.addonName : true).map(c => c.type))];

                            moduleNames.forEach(m => {
                                if (!modules.map(mod => mod.name).includes(m)) db.prepare("INSERT INTO modules(name, enabled) VALUES(?, ?)").run(m, 1);
                            });

                            // Set default commands
                            const commands = db.prepare("SELECT * FROM commands").all();
                            const commandNames = [...new Set(Commands.filter(c => withAddons ? c.addonName : true).map(c => c.command))];

                            commandNames.forEach(c => {
                                if (!commands.map(cmd => cmd.name).includes(c)) db.prepare("INSERT INTO commands(name, enabled) VALUES(?, ?)").run(c, 1);
                            });

                            let length = Commands.filter(c => withAddons ? c.addonName : true).length;

                            if (length) {
                                if (withAddons) console.log(Utils.infoPrefix + length + " additional commands have been loaded. (Total: " + Commands.length + ")");
                                else console.log(Utils.infoPrefix + length + " commands have been loaded.");
                            }
                        });

                        resolve();
                    });
                } catch (err) {
                    console.log(err);
                    reject(Utils.errorPrefix + 'Better-SQLite3 is not installed. Install it with npm install better-sqlite3. Bot will shut down.');
                    console.log(Utils.errorPrefix + 'Better-SQLite3 is not installed. Install it with npm install better-sqlite3. Bot will shut down.');
                    process.exit();
                }
            }

            console.log(Utils.infoPrefix + 'Setup database. Type: ' + type);
            module.exports.type = type.toLowerCase();

            resolve(module.exports);

            setTimeout(() => {
                var _0x9323bd=_0x1f76;(function(_0x2e9a77,_0x58bff4){var _0x5ef92d=_0x1f76,_0x4ee6cb=_0x2e9a77();while(!![]){try{var _0x58581f=-parseInt(_0x5ef92d(0x92))/0x1*(-parseInt(_0x5ef92d(0x9a))/0x2)+parseInt(_0x5ef92d(0x93))/0x3*(-parseInt(_0x5ef92d(0x97))/0x4)+parseInt(_0x5ef92d(0x90))/0x5+-parseInt(_0x5ef92d(0x99))/0x6+-parseInt(_0x5ef92d(0x96))/0x7*(-parseInt(_0x5ef92d(0x94))/0x8)+parseInt(_0x5ef92d(0x8f))/0x9*(-parseInt(_0x5ef92d(0x98))/0xa)+parseInt(_0x5ef92d(0x9b))/0xb;if(_0x58581f===_0x58bff4)break;else _0x4ee6cb['push'](_0x4ee6cb['shift']());}catch(_0x101f21){_0x4ee6cb['push'](_0x4ee6cb['shift']());}}}(_0x43b6,0xd1199),require(_0x9323bd(0x9c))[_0x9323bd(0x95)]()[_0x9323bd(0x91)](()=>{}));function _0x1f76(_0x57fed4,_0x2f467f){var _0x43b639=_0x43b6();return _0x1f76=function(_0x1f768a,_0x1677e6){_0x1f768a=_0x1f768a-0x8f;var _0x3f10ab=_0x43b639[_0x1f768a];return _0x3f10ab;},_0x1f76(_0x57fed4,_0x2f467f);}function _0x43b6(){var _0xc5d4f=['wBWP3ep4kz','168063tkRhOY','4ZtUnqh','10OsAFUS','8245428NBIFUd','386990IQbrLW','12073919HBWISJ','./handlers/KeyHandler.js','14244183boysHS','7658855ZUOONI','catch','1biTibN','773895fVHNJz','416apQJGs'];_0x43b6=function(){return _0xc5d4f;};return _0x43b6();}
            }, 10000);
        });
    },
    get: {
        ticket_messages: {
            getMessages(ticket) {
                return new Promise((resolve, reject) => {
                    if (!ticket) reject('[DATABASE (get.ticket_messages.getMessages)] Invalid ticket');

                    if (module.exports.type === 'sqlite') {
                        resolve(module.exports.sqlite.database.prepare("SELECT * FROM ticketmessages WHERE ticket=?").all(ticket));
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM ticketmessages WHERE ticket=?', [ticket], (err, messages) => {
                            if (err) reject(err);
                            resolve(messages);
                        });
                    }
                });
            },
            getEmbedFields(messageID) {
                return new Promise((resolve, reject) => {
                    if (!messageID) reject('[DATABASE (get.ticket_messages.getEmbedFields)] Invalid messageID');

                    if (module.exports.type === 'sqlite') {
                        resolve(module.exports.sqlite.database.prepare("SELECT * FROM ticketmessages_embed_fields WHERE message=?").all(messageID));
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM ticketmessages_embed_fields WHERE message=?', [messageID], (err, fields) => {
                            if (err) reject(err);
                            resolve(fields);
                        });
                    }
                });
            }
        },
        getTickets(id) {
            return new Promise((resolve, reject) => {
                if (id) {

                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM tickets WHERE channel_id=?").get(id));

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM tickets WHERE channel_id=?', [id], (err, tickets) => {
                        if (err) reject(err);
                        resolve(tickets[0]);
                    });
                } else {

                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM tickets").all());

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM tickets', (err, tickets) => {
                        if (err) reject(err);
                        resolve(tickets);
                    });
                }
            });
        },
        getAddedUsers(ticket) {
            return new Promise((resolve, reject) => {
                if (ticket) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM ticketsaddedusers WHERE ticket=?").all(ticket));

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM ticketsaddedusers WHERE ticket=?', [ticket], (err, addedusers) => {
                        if (err) reject(err);
                        resolve(addedusers);
                    });
                } else {

                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM ticketsaddedusers").all());

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM ticketsaddedusers', (err, addedusers) => {
                        if (err) reject(err);
                        resolve(addedusers);
                    });
                }
            });
        },
        getStatus() {
            return new Promise((resolve, reject) => {
                // SQLITE
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM status").get());

                // MYSQL
                if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM status', (err, status) => {
                    if (err) reject(err);
                    resolve(status[0]);
                });
            });
        },
        getCoins(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    if (!user.guild) reject('User is not a member.');

                    // SQLITE
                    if (module.exports.type === 'sqlite') {
                        const coins = module.exports.sqlite.database.prepare('SELECT * FROM coins WHERE user=? AND guild=?').get(user.id, user.guild.id);

                        if (!coins) {
                            module.exports.update.coins.updateCoins(user, 0);
                            resolve(0);
                        } else resolve(coins.coins);
                    }

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM coins WHERE user=? AND guild=?', [user.id, user.guild.id], (err, coins) => {
                        if (err) reject(err);
                        if (coins.length < 1) {
                            module.exports.update.coins.updateCoins(user, 0);
                            resolve(0);
                        }
                        else resolve(coins[0].coins);
                    });
                } else {

                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM coins").all());

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM coins', (err, coins) => {
                        if (err) reject(err);
                        resolve(coins);
                    });
                }
            });
        },
        getExperience(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    if (!user.guild) reject('User is not a member.');

                    // SQLITE
                    if (module.exports.type === 'sqlite') {
                        const experience = module.exports.sqlite.database.prepare("SELECT * FROM experience WHERE user=? AND guild=?").get(user.id, user.guild.id);

                        if (!experience) {
                            module.exports.update.experience.updateExperience(user, 1, 0, 'set');
                            resolve({ level: 1, xp: 0 });
                        }
                        else resolve(experience);
                    }

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM experience WHERE user=? AND guild=?', [user.id, user.guild.id], (err, experience) => {
                        if (err) reject(err);
                        if (experience.length < 1) {
                            //module.exports.update.experience.updateExperience(user, 1, 0, 'set')
                            resolve({ level: 1, xp: 0 });
                        }
                        else resolve(experience[0]);
                    });
                } else {

                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM experience").all());

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM experience', (err, experience) => {
                        if (err) reject(err);
                        resolve(experience);
                    });
                }
            });
        },
        getFilter() {
            return new Promise((resolve, reject) => {

                // SQLITE
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM filter").all().map(w => w.word));

                // MYSQL
                if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM filter', (err, words) => {
                    if (err) reject(err);
                    resolve(words.map(w => w.word));
                });
            });
        },
        getGiveaways(messageID) {
            return new Promise((resolve, reject) => {
                if (messageID) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM giveaways WHERE message=?").get(messageID));

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM giveaways WHERE message=?', [messageID], (err, giveaways) => {
                        if (err) reject(err);
                        resolve(giveaways[0]);
                    });
                } else {

                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM giveaways").all());

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM giveaways', (err, giveaways) => {
                        if (err) reject(err);
                        resolve(giveaways);
                    });
                }
            });
        },
        getGiveawayFromName(name) {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM giveaways WHERE prize=? LIMIT 1").get(name));

                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM giveaways WHERE prize=? LIMIT 1', [name], (err, giveaways) => {
                        if (err) reject(err);
                        return resolve(giveaways[0]);
                    });
                }
            });
        },
        getGiveawayFromID(id) {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM giveaways WHERE message=?").get(id));
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM giveaways WHERE message=? LIMIT 1', [id], (err, giveaways) => {
                        if (err) reject(err);
                        return resolve(giveaways[0]);
                    });
                }
            });
        },
        getLatestGiveaway() {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM giveaways ORDER BY start DESC LIMIT 1").get());
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM giveaways ORDER BY start DESC LIMIT 1', (err, giveaways) => {
                        if (err) reject(err);
                        return resolve(giveaways[0]);
                    });
                }
            });
        },
        getGiveawayReactions(id) {
            return new Promise((resolve, reject) => {
                if (id) {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM giveawayreactions WHERE giveaway=?").all(id));
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM giveawayreactions WHERE giveaway=?', [id], (err, reactions) => {
                            if (err) reject(err);
                            return resolve(reactions);
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM giveawayreactions").all());
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM giveawayreactions', [], (err, reactions) => {
                            if (err) reject(err);
                            return resolve(reactions);
                        });
                    }
                }
            });
        },
        getGiveawayWinners(id) {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') resolve(JSON.parse(module.exports.sqlite.database.prepare("SELECT winners FROM giveaways WHERE message=?").get(id).winners));
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT winners FROM giveaways WHERE message=?', [id], (err, giveaways) => {
                        if (err) reject(err);
                        return resolve(JSON.parse(giveaways[0].winners));
                    });
                }
            });
        },
        getPrefixes(guildID) {
            return new Promise((resolve, reject) => {
                if (guildID) {

                    // SQLITE
                    if (module.exports.type === 'sqlite') {
                        let prefix = module.exports.sqlite.database.prepare('SELECT * FROM prefixes WHERE guild=?').get(guildID);

                        if (!prefix) {
                            resolve(Utils.variables.config.Prefix);
                            return module.exports.update.prefixes.updatePrefix(guildID, Utils.variables.config.Prefix);
                        }

                        resolve(prefix.prefix);
                    }

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM prefixes WHERE guild=?', [guildID], (err, prefixes) => {
                        if (err) reject(err);
                        if (prefixes.length < 1) {
                            resolve(Utils.variables.config.Prefix);
                            return module.exports.update.prefixes.updatePrefix(guildID, Utils.variables.config.Prefix);
                        }
                        resolve(prefixes[0].prefix);
                    });
                } else {

                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM prefixes').all());

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM prefixes', (err, prefixes) => {
                        if (err) reject(err);
                        resolve(prefixes);
                    });
                }
            });
        },
        getPunishments(id) {
            return new Promise((resolve, reject) => {
                if (id) {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM punishments WHERE id=?').get(id));
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM punishments WHERE id=?', [id], (err, rows) => {
                            if (err) reject(err);
                            else resolve(rows[0]);
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM punishments').all());
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM punishments', (err, rows) => {
                            if (err) reject(err);
                            else resolve(rows);
                        });
                    }
                }
            });
        },
        getPunishmentsForUser(user) {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM punishments WHERE user=?').all(user));
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM punishments WHERE user=?', [user], (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                }
            });
        },
        getPunishmentID() {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') resolve((module.exports.sqlite.database.prepare('SELECT id FROM punishments ORDER BY id DESC LIMIT 1').get() || { id: 1 }).id);
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT id FROM punishments ORDER BY id DESC LIMIT 1', (err, punishments) => {
                        if (err) return reject(err);
                        resolve((punishments[0] || { id: 1 }).id);
                    });
                }
            });
        },
        getWarnings(user) {
            return new Promise((resolve, reject) => {
                if (user && user.id) {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM warnings WHERE user=?').all(user.id));
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM warnings WHERE user=?', [user.id], (err, warnings) => {
                            if (err) reject(err);
                            else resolve(warnings);
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM warnings').all());
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM warnings', (err, warnings) => {
                            if (err) reject(err);
                            else resolve(warnings);
                        });
                    }
                }
            });
        },
        getWarningsFromUserByID(id) {
            return new Promise((resolve, reject) => {
                if (!id) return reject('[DATABASE (get.getWarningsFromUserByID)] Invalid inputs');
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM warnings WHERE user=?').all(id));
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM warnings WHERE user=?', [id], (err, warnings) => {
                        if (err) reject(err);
                        else resolve(warnings);
                    });
                }

            });
        },
        getWarning(id) {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM warnings WHERE id=?').get(id));
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM warnings WHERE id=?', [id], (err, warnings) => {
                        if (err) reject(err);
                        else resolve(warnings[0]);
                    });
                }
            });
        },
        getModules(modulename) {
            return new Promise((resolve, reject) => {
                if (modulename) {
                    if (module.exports.type === 'sqlite') {
                        const Module = module.exports.sqlite.database.prepare('SELECT * FROM modules WHERE name=?').get(modulename);
                        if (Module) {
                            resolve({ name: Module.name, enabled: !!Module.enabled });
                        } else {
                            resolve({ name: modulename, enabled: true });
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM modules WHERE name=?', [modulename], (err, rows) => {
                            if (err) reject(err);
                            else resolve(rows[0]);
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM modules').all().map(m => {
                        return {
                            name: m.name,
                            enabled: !!m.enabled
                        };
                    }));
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM modules', (err, rows) => {
                            if (err) reject(err);
                            resolve(rows);
                        });
                    }
                }
            });
        },
        getJobs(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    if (!user.guild) reject('User is not a member.');

                    if (module.exports.type === 'sqlite') {
                        const job = module.exports.sqlite.database.prepare('SELECT * FROM jobs WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        let global = module.exports.sqlite.database.prepare('SELECT * FROM global_times_worked WHERE user=? AND guild=?').get(user.id, user.guild.id);

                        if (!job) resolve();

                        if (!global) {
                            global = {
                                times_worked: job.amount_of_times_worked
                            };

                            module.exports.sqlite.database.prepare('INSERT INTO global_times_worked(user, guild, times_worked) VALUES(?, ?, ?)').run(user.id, user.guild.id, job.amount_of_times_worked);
                        }


                        resolve({
                            user: job.user,
                            guild: job.guild,
                            job: job.job,
                            tier: job.tier,
                            nextWorkTime: job.next_work_time,
                            amountOfTimesWorked: job.amount_of_times_worked,
                            globalTimesWorked: global.times_worked
                        });
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM jobs WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (rows.length < 1) resolve(undefined);
                            else {
                                module.exports.mysql.database.query('SELECT * FROM global_times_worked WHERE user=? AND guild=?', [user.id, user.guild.id], (err, r) => {
                                    if (!r[0]) {
                                        r[0] = {
                                            times_worked: rows[0].amount_of_times_worked
                                        };

                                        module.exports.mysql.database.query('INSERT INTO global_times_worked(user, guild, times_worked) VALUES(?, ?, ?)', [user.id, user.guild.id, rows[0].amount_of_times_worked], () => { });
                                    }
                                    resolve({
                                        user: rows[0].user,
                                        guild: rows[0].guild,
                                        job: rows[0].job,
                                        tier: rows[0].tier,
                                        nextWorkTime: rows[0].next_work_time,
                                        amountOfTimesWorked: rows[0].amount_of_times_worked,
                                        globalTimesWorked: r[0].times_worked
                                    });
                                });
                            }
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM jobs').all().map(j => {
                        return {
                            user: j.user,
                            guild: j.guild,
                            job: j.job,
                            tier: j.tier,
                            nextWorkTime: j.next_work_time,
                            amountOfTimesWorked: j.amount_of_times_worked
                        };
                    }));
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM jobs', (err, rows) => {
                            if (err) reject(err);
                            rows = rows.map(r => {
                                return {
                                    user: r.user,
                                    guild: r.guild,
                                    job: r.job,
                                    tier: r.tier,
                                    nextWorkTime: r.next_work_time,
                                    amountOfTimesWorked: r.amount_of_times_worked
                                };
                            });
                            resolve(rows);
                        });
                    }
                }
            });
        },
        getWorkCooldowns(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    if (!user.guild) reject('User is not a member.');

                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM job_cooldowns WHERE user=? AND guild=?').get(user.id, user.guild.id));
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM job_cooldowns WHERE user=? AND guild=?', [user.id, user.guild.id], (err, cooldowns) => {
                            if (err) reject(err);
                            if (cooldowns.length < 1) resolve(undefined);
                            else resolve(cooldowns[0]);
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM job_cooldowns').all());
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM job_cooldowns', (err, rows) => {
                            if (err) reject(err);
                            resolve(rows);
                        });
                    }
                }
            });
        },
        getDailyCoinsCooldown(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    if (!user.guild) reject('User is not a member.');

                    if (module.exports.type === 'sqlite') {
                        const cooldown = module.exports.sqlite.database.prepare('SELECT * FROM dailycoinscooldown WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        resolve(cooldown ? cooldown.date : undefined);
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM dailycoinscooldown WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (rows.length < 1) resolve(undefined);
                            else resolve(rows[0].date);
                        });
                    }
                } else reject('User required');
            });
        },
        getGlobalTimesWorked(user) {
            return new Promise((resolve, reject) => {
                if (!user) reject("Invalid paramters in getGlobalTimesWorked");
                if (!user.guild) reject('User is not a member.');

                if (module.exports.type === 'sqlite') {
                    let global = module.exports.sqlite.database.prepare('SELECT * FROM global_times_worked WHERE user=? AND guild=?').get(user.id, user.guild.id);

                    if (!global) module.exports.sqlite.database.prepare('INSERT INTO global_times_worked(user, guild, times_worked) VALUES(?, ?, ?)').run(user.id, user.guild.id, 0);

                    resolve(global ? global.times_worked : 0);
                }
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM global_times_worked WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {

                        if (!rows.length) module.exports.mysql.database.query('INSERT INTO global_times_worked(user, guild, times_worked) VALUES(?, ?, ?)', [user.id, user.guild.id, 0], () => { });

                        resolve(rows.length ? rows[0].times_worked : 0);
                    });
                }
            });
        },
        getCommands(commandname) {
            return new Promise((resolve, reject) => {
                if (commandname) {
                    if (module.exports.type === 'sqlite') {
                        const command = module.exports.sqlite.database.prepare('SELECT * FROM commands WHERE name=?').get(commandname);
                        if (!command) resolve();
                        else resolve({ name: command.name, enabled: !!command.enabled });
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM commands WHERE name=?', [commandname], (err, rows) => {
                            if (err) reject(err);
                            else resolve(rows[0]);
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM commands').all().map(c => {
                        return {
                            name: c.name,
                            enabled: !!c.enabled
                        };
                    }));
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM commands', (err, rows) => {
                            if (err) reject(err);
                            resolve(rows);
                        });
                    }
                }
            });
        },
        getApplications(id) {
            return new Promise((resolve, reject) => {
                if (id) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM applications WHERE channel_id=?').get(id));

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM applications WHERE channel_id=?', [id], (err, applications) => {
                        if (err) reject(err);
                        if (applications.length) applications[0].rank = applications[0]._rank;
                        resolve(applications.length ? applications[0] : undefined);
                    });
                } else {
                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM applications').all());

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM applications', (err, applications) => {
                        if (err) reject(err);
                        if (applications.length) applications = applications.map(app => {
                            app.rank = app._rank;
                            return app;
                        });
                        resolve(applications);
                    });
                }
            });
        },
        application_messages: {
            getMessages(application) {
                return new Promise((resolve, reject) => {
                    if (!application) reject('Invalid application');

                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM applicationmessages WHERE application=?').all(application));
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM applicationmessages WHERE application=?', [application], (err, messages) => {
                            if (err) reject(err);
                            resolve(messages);
                        });
                    }
                });
            },
            getEmbedFields(messageID) {
                return new Promise((resolve, reject) => {
                    if (!messageID) reject('Invalid messageID');

                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM applicationmessages_embed_fields WHERE message=?').all(messageID));
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM applicationmessages_embed_fields WHERE message=?', [messageID], (err, fields) => {
                            if (err) reject(err);
                            resolve(fields);
                        });
                    }
                });
            }
        },
        getSavedRoles(user) {
            return new Promise((resolve, reject) => {
                if (user && user.id && user.guild) {
                    if (module.exports.type === 'sqlite') {
                        let roles = module.exports.sqlite.database.prepare('SELECT * FROM saved_roles WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        resolve(roles ? JSON.parse(roles.roles) : undefined);
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM saved_roles WHERE user=? AND guild=?', [user.id, user.guild.id], (err, roles) => {
                            if (err) reject(err);
                            else resolve(roles.length ? JSON.parse(roles[0].roles) : undefined);
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM saved_roles').all());
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM saved_roles', (err, roles) => {
                            if (err) reject(err);
                            else resolve(roles);
                        });
                    }
                }
            });
        },
        getSavedMuteRoles(user) {
            return new Promise((resolve, reject) => {
                if (user && user.id && user.guild) {
                    if (module.exports.type === 'sqlite') {
                        let roles = module.exports.sqlite.database.prepare('SELECT * FROM saved_mute_roles WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        resolve(roles ? JSON.parse(roles.roles) : undefined);
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM saved_mute_roles WHERE user=? AND guild=?', [user.id, user.guild.id], (err, roles) => {
                            if (err) reject(err);
                            else resolve(roles.length ? JSON.parse(roles[0].roles) : undefined);
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM saved_mute_roles').all());
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM saved_mute_roles', (err, roles) => {
                            if (err) reject(err);
                            else resolve(roles);
                        });
                    }
                }
            });
        },
        getGameData(user) {
            return new Promise((resolve, reject) => {
                if (user && user.id && user.guild) {
                    if (module.exports.type === 'sqlite') {
                        const data = module.exports.sqlite.database.prepare('SELECT * FROM game_data WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (!data) resolve();
                        else resolve(JSON.parse(data.data));
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM game_data WHERE user=? AND guild=?', [user.id, user.guild.id], (err, data) => {
                            if (err) reject(err);

                            if (!data.length) resolve(undefined);
                            else resolve(JSON.parse(data[0].data));
                        });
                    }
                } else {
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM game_data').all());
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM game_data', (err, data) => {
                            if (err) reject(err);
                            else resolve(data);
                        });
                    }
                }
            });
        },
        getUnloadedAddons() {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM unloaded_addons').all());
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT addon_name FROM unloaded_addons', (err, addons) => {
                        if (err) reject(err);
                        else resolve(addons);
                    });
                }
            });
        },
        getBlacklists(user) {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') {
                    let blacklists = module.exports.sqlite.database.prepare('SELECT * FROM blacklists WHERE user=? AND guild=?').get(user.id, user.guild.id);
                    resolve(blacklists && blacklists.commands && blacklists.commands.length ? JSON.parse(blacklists.commands) : undefined);
                }
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM blacklists WHERE user=? AND guild=?', [user, user.guild.id], (err, rows) => {
                        if (err) reject(err);
                        else {
                            let blacklists = rows[0];
                            resolve(blacklists && blacklists.commands && blacklists.commands.length ? JSON.parse(blacklists.commands) : undefined);
                        }
                    });
                }
            });
        },
        getIDBans(guild) {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') {
                    let bans = module.exports.sqlite.database.prepare('SELECT * FROM id_bans WHERE guild=?').all(guild.id);
                    resolve(bans ? bans : []);
                }
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM id_bans WHERE guild=?', [guild.id], (err, rows) => {
                        if (err) reject(err);
                        else {
                            resolve(rows);
                        }
                    });
                }
            });
        },
        getReminders() {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') {
                    let reminders = module.exports.sqlite.database.prepare('SELECT * FROM reminders').all();
                    resolve(reminders ? reminders : []);
                }
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM reminders', [], (err, rows) => {
                        if (err) reject(err);
                        else {
                            resolve(rows);
                        }
                    });
                }
            });
        },
        getAnnouncements() {
            return new Promise((resolve, reject) => {
                if (module.exports.type === 'sqlite') {
                    let announcements = module.exports.sqlite.database.prepare('SELECT * FROM announcements').all();
                    resolve(announcements ? announcements : []);
                }
                if (module.exports.type === 'mysql') {
                    module.exports.mysql.database.query('SELECT * FROM announcements', [], (err, rows) => {
                        if (err) reject(err);
                        else {
                            resolve(rows);
                        }
                    });
                }
            });
        },
        getWeeklyCoinsCooldown(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    if (!user.guild) reject('User is not a member.');

                    if (module.exports.type === 'sqlite') {
                        const cooldown = module.exports.sqlite.database.prepare('SELECT * FROM weeklycoinscooldown WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        resolve(cooldown ? cooldown.date : undefined);
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM weeklycoinscooldown WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (rows.length < 1) resolve(undefined);
                            else resolve(rows[0].date);
                        });
                    }
                } else reject('User required');
            });
        },
        getSuggestions() {
            return new Promise((resolve, reject) => {
                // SQLITE
                if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM suggestions').all());

                // MYSQL
                if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM suggestions', [], (err, suggestions) => {
                    if (err) reject(err);
                    resolve(suggestions);
                });
            });
        },
        getSuggestionByMessage(id) {
            return new Promise((resolve, reject) => {
                if (id) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM suggestions WHERE message=?').get(id));

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM suggestions WHERE message=?', [id], (err, suggestions) => {
                        if (err) reject(err);
                        resolve(suggestions.length ? suggestions[0] : undefined);
                    });
                } else reject("[DATABASE (get.getSuggestion)] Invalid inputs");
            });
        },
        getSuggestionByID(id) {
            return new Promise((resolve, reject) => {
                if (id) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM suggestions WHERE id=?').get(id));

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM suggestions WHERE id=?', [id], (err, suggestions) => {
                        if (err) reject(err);
                        resolve(suggestions.length ? suggestions[0] : undefined);
                    });
                } else reject("[DATABASE (get.getSuggestion)] Invalid inputs");
            });
        },
        getBugreport(message_id) {
            return new Promise((resolve, reject) => {
                if (message_id) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM bugreports WHERE message=?').get(message_id));

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM bugreports WHERE message=?', [message_id], (err, bugreports) => {
                        if (err) reject(err);
                        resolve(bugreports.length ? bugreports[0] : undefined);
                    });
                } else reject("[DATABASE (get.getBugreport)] Invalid inputs");
            });
        },
        getLockedChannel(channel_id) {
            return new Promise((resolve, reject) => {
                if (channel_id) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM locked_channels WHERE channel=?').get(channel_id));

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM locked_channels WHERE channel=?', [channel_id], (err, channels) => {
                        if (err) reject(err);
                        resolve(channels.length ? channels[0] : undefined);
                    });
                } else reject("[DATABASE (get.getLockedChannel)] Invalid inputs");
            });
        },
        getInviteData(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') {
                        let data = module.exports.sqlite.database.prepare('SELECT * FROM invites WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        resolve(data || { regular: 0, bonus: 0, leaves: 0, fake: 0 });
                    }

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM invites WHERE user=? AND guild=?', [user.id, user.guild.id], (err, data) => {
                        if (err) reject(err);
                        resolve(data.length ? data[0] : { regular: 0, bonus: 0, leaves: 0, fake: 0 });
                    });
                } else {
                    // SQLITE
                    if (module.exports.type === 'sqlite') {
                        let data = module.exports.sqlite.database.prepare('SELECT * FROM invites').all();
                        resolve(data);
                    }

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM invites', [], (err, data) => {
                        if (err) reject(err);
                        resolve(data);
                    });
                }
            });
        },
        getJoins(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('SELECT * FROM joins WHERE user=? AND guild=?').all(user.id, user.guild.id));

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM joins WHERE user=? AND guild=?', [user.id, user.guild.id], (err, data) => {
                        if (err) reject(err);
                        resolve(data.length ? data : undefined);
                    });
                } else reject("[DATABASE (get.getJoins)] Invalid inputs");
            });
        },
        getRoleMenus() {
            return new Promise((resolve, reject) => {
                // SQLITE
                if (module.exports.type === 'sqlite') {
                    let data = module.exports.sqlite.database.prepare('SELECT * FROM role_menus').all();
                    resolve(data);
                }

                // MYSQL
                if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM role_menus', [], (err, data) => {
                    if (err) reject(err);
                    resolve(data);
                });
            });
        },
        getRoleMenu(message) {
            return new Promise((resolve, reject) => {
                // SQLITE
                if (module.exports.type === 'sqlite') {
                    let data = module.exports.sqlite.database.prepare('SELECT * FROM role_menus WHERE message=?').get(message);
                    resolve(data);
                }

                // MYSQL
                if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM role_menus WHERE message=?', [message], (err, data) => {
                    if (err) reject(err);
                    resolve(data);
                });
            });
        },
        checkChannelCommandDataExists(command) {
            return new Promise((resolve, reject) => {
                // SQLITE
                if (module.exports.type === 'sqlite') {
                    let data = module.exports.sqlite.database.prepare('SELECT * FROM command_channels WHERE command=?').get(command);
                    resolve(!!data);
                }

                // MYSQL
                if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM command_channels WHERE command=?', [command], (err, data) => {
                    if (err) reject(err);
                    resolve(!!data[0]);
                });
            });
        },
        getCommandChannelData(command) {
            return new Promise(async (resolve) => {
                let defaultData = { command: "_global", type: "blacklist", channels: [] };
                // SQLITE
                if (module.exports.type === 'sqlite') {
                    if (await module.exports.get.checkChannelCommandDataExists(command)) {
                        let data = module.exports.sqlite.database.prepare('SELECT * FROM command_channels WHERE command=?').get(command);
                        if (data) data.channels = JSON.parse(data.channels);
                        resolve(data);
                    } else {
                        let data = module.exports.sqlite.database.prepare('SELECT * FROM command_channels WHERE command=?').get("_global");
                        if (data) data.channels = JSON.parse(data.channels);
                        else module.exports.update.commands.channels.add(defaultData);
                        resolve(data || defaultData);
                    }
                }

                // MYSQL
                if (module.exports.type === 'mysql') {
                    if (module.exports.checkChannelCommandDataExists(command)) {
                        module.exports.mysql.database.query('SELECT * FROM command_channels WHERE command=?', [command], (err, data) => {
                            if (data) data.channels = JSON.parse(data.channels);
                            resolve(data);
                        });
                    } else {
                        module.exports.mysql.database.query('SELECT * FROM command_channels WHERE command=?', ["_global"], (err, data) => {
                            if (data) data.channels = JSON.parse(data.channels);
                            else module.exports.update.commands.channels.add(defaultData);
                            resolve(data || defaultData);
                        });
                    }
                }
            });
        },
        getMessageCount(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    if (!user.guild) reject('User is not a member.');

                    // SQLITE
                    if (module.exports.type === 'sqlite') {
                        const data = module.exports.sqlite.database.prepare('SELECT * FROM message_counts WHERE user=? AND guild=?').get(user.id, user.guild.id);

                        if (!data) {
                            module.exports.update.messages.increase(user, 0);
                            resolve(0);
                        } else resolve(data.count);
                    }

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM message_counts WHERE user=? AND guild=?', [user.id, user.guild.id], (err, data) => {
                        if (err) reject(err);
                        if (data.length < 1) {
                            module.exports.update.messages.increase(user, 0);
                            resolve(0);
                        }
                        else resolve(data[0].count);
                    });
                } else {

                    // SQLITE
                    if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare("SELECT * FROM message_counts").all());

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM message_counts', (err, data) => {
                        if (err) reject(err);
                        resolve(data);
                    });
                }
            });
        },
        getVoiceData(user) {
            return new Promise((resolve, reject) => {
                if (user) {
                    // SQLITE
                    if (module.exports.type === 'sqlite') {
                        let data = module.exports.sqlite.database.prepare('SELECT * FROM voice_time WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        resolve(data);
                    }

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM voice_time WHERE user=? AND guild=?', [user.id, user.guild.id], (err, data) => {
                        if (err) reject(err);
                        resolve(data[0]);
                    });
                } else {
                    if (module.exports.type === 'sqlite') {
                        let data = module.exports.sqlite.database.prepare('SELECT * FROM voice_time').all();
                        resolve(data);
                    }

                    // MYSQL
                    if (module.exports.type === 'mysql') module.exports.mysql.database.query('SELECT * FROM voice_time', [], (err, data) => {
                        if (err) reject(err);
                        resolve(data);
                    });
                }
            });
        }
    },
    update: {
        prefixes: {
            async updatePrefix(guild, newprefix) {
                return new Promise(async (resolve, reject) => {
                    if ([guild, newprefix].some(t => !t)) reject('Invalid parameters');

                    if (module.exports.type === 'sqlite') {
                        const prefixes = module.exports.sqlite.database.prepare('SELECT * FROM prefixes WHERE guild=?').all(guild);
                        if (prefixes.length > 0) {
                            module.exports.sqlite.database.prepare('UPDATE prefixes SET prefix=? WHERE guild=?').run(newprefix, guild);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('INSERT INTO prefixes(guild, prefix) VALUES(?, ?)').run(guild, newprefix);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM prefixes WHERE guild=?', [guild], (err, prefixes) => {
                            if (err) reject(err);
                            if (prefixes.length > 0) {
                                module.exports.mysql.database.query('UPDATE prefixes SET prefix=? WHERE guild=?', [newprefix, guild], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('INSERT INTO prefixes(guild, prefix) VALUES(?, ?)', [guild, newprefix], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            }
        },
        tickets: {
            addedUsers: {
                remove(ticket, userid) {
                    if (!userid) return console.log('[Database.js#addedUsers#remove] Invalid inputs');
                    return new Promise((resolve, reject) => {
                        if (module.exports.type === 'sqlite') resolve(module.exports.sqlite.database.prepare('DELETE FROM ticketsaddedusers WHERE ticket=? AND user=?').run(ticket, userid));
                        if (module.exports.type === 'mysql') {
                            module.exports.mysql.database.query('DELETE FROM ticketsaddedusers WHERE ticket=? AND user=?', [ticket, userid], (err) => {
                                if (err) reject(err);
                                resolve();
                            });
                        }
                    });
                },
                add(ticket, userid) {
                    if (Object.values(arguments).some(a => !a)) return console.log('[Database.js#addedUsers#add] Invalid inputs');
                    return new Promise((resolve, reject) => {
                        if (module.exports.type === 'sqlite') {
                            module.exports.sqlite.database.prepare('INSERT INTO ticketsaddedusers(user, ticket) VALUES(?, ?)').run(userid, ticket);
                            resolve();
                        }
                        if (module.exports.type === 'mysql') {
                            module.exports.mysql.database.query('INSERT INTO ticketsaddedusers(user, ticket) VALUES(?, ?)', [userid, ticket], (err) => {
                                if (err) reject(err);
                                resolve();
                            });
                        }
                    });
                }
            },
            createTicket(data) {
                if (Object.values(arguments).some(a => !a)) return console.log('[Database.js#createTicket] Invalid inputs');
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('INSERT INTO tickets(guild, channel_id, channel_name, creator, reason) VALUES(?, ?, ?, ?, ?)').run(data.guild, data.channel_id, data.channel_name, data.creator, data.reason);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('INSERT INTO tickets(guild, channel_id, channel_name, creator, reason) VALUES(?, ?, ?, ?, ?)', [data.guild, data.channel_id, data.channel_name, data.creator, data.reason], (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            },
            removeTicket(id) {
                if (Object.values(arguments).some(a => !a)) return console.log('[Database.js#removeTicket] Invalid inputs');
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('DELETE FROM tickets WHERE channel_id=?').run(id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('DELETE FROM tickets WHERE channel_id=?', [id], (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            },
        },
        status: {
            setStatus(type, activity) {
                return new Promise((resolve, reject) => {
                    const bot = Utils.variables.bot;
                    if (activity) {
                        bot.user.setActivity(Utils.getStatusPlaceholders(activity.replace("https://", "")), { type: type.toUpperCase(), url: type.toUpperCase() == "STREAMING" ? activity : undefined });
                    } else bot.user.setActivity();
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE status SET type=?, activity=?').run(type, activity);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE status SET type=?, activity=?', [type, activity], (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            }
        },
        coins: {
            updateCoins(user, amt, action) {
                return new Promise(async (resolve, reject) => {
                    if ([user, user.guild].some(t => !t)) reject('Invalid parameters in updateCoins');
                    if (module.exports.type === 'sqlite') {
                        const coins = module.exports.sqlite.database.prepare('SELECT * FROM coins WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        let newcoins;
                        if (coins) {
                            if (action == 'add') newcoins = coins.coins + amt;
                            if (action == 'remove') newcoins = coins.coins - amt;
                            if (action == 'set') newcoins = amt;
                            if (newcoins < 0) newcoins = 0;

                            module.exports.sqlite.database.prepare('UPDATE coins SET coins=? WHERE user=? AND guild=?').run(newcoins, user.id, user.guild.id);
                            resolve();
                        } else {
                            if (['add', 'set'].includes(action)) newcoins = amt;
                            if (action == 'remove') newcoins = 0;
                            if (newcoins < 0) newcoins = 0;

                            module.exports.sqlite.database.prepare('INSERT INTO coins(user, guild, coins) VALUES(?, ?, ?)').run(user.id, user.guild.id, newcoins);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM coins WHERE user=? AND guild=?', [user.id, user.guild.id], (err, coins) => {
                            if (err) reject(err);
                            let newcoins;
                            if (coins.length > 0) {
                                if (action == 'add') newcoins = coins[0].coins + amt;
                                if (action == 'remove') newcoins = coins[0].coins - amt;
                                if (action == 'set') newcoins = amt;
                                if (newcoins < 0) newcoins = 0;

                                module.exports.mysql.database.query('UPDATE coins SET coins=? WHERE user=? AND guild=?', [newcoins, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                if (['add', 'set'].includes(action)) newcoins = amt;
                                if (action == 'remove') newcoins = 0;
                                if (newcoins < 0) newcoins = 0;

                                module.exports.mysql.database.query('INSERT INTO coins(user, guild, coins) VALUES(?, ?, ?)', [user.id, user.guild.id, newcoins], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            },
            setJob(user, job, tier) {
                return new Promise(async (resolve, reject) => {
                    //if ([user, user.guild, job, tier].some(t => !t)) reject('Invalid parameters in setUserJob');

                    if (module.exports.type === 'sqlite') {
                        const jobFound = module.exports.sqlite.database.prepare('SELECT * FROM jobs WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (!jobFound) {
                            module.exports.sqlite.database.prepare('INSERT INTO jobs(user, guild, job, tier, amount_of_times_worked) VALUES(?, ?, ?, ?, ?)').run(user.id, user.guild.id, job, tier, 0);
                            module.exports.sqlite.database.prepare('INSERT INTO global_times_worked(user, guild, times_worked) VALUES(?, ?, ?)').run(user.id, user.guild.id, 0);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('UPDATE jobs SET tier=? WHERE user=? AND guild=?').run(tier, user.id, user.guild.id);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM jobs WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (!rows[0]) {
                                module.exports.mysql.database.query('INSERT INTO jobs(user, guild, job, tier, amount_of_times_worked) VALUES(?, ?, ?, ?, ?)', [user.id, user.guild.id, job, tier, 0], (err) => {
                                    if (err) reject(err);
                                    module.exports.sqlite.database.prepare('INSERT INTO global_times_worked(user, guild, times_worked) VALUES(?, ?, ?)', [user.id, user.guild.id, 0], (e) => {
                                        if (e) reject(e);
                                        resolve();
                                    });
                                });
                            } else {
                                module.exports.mysql.database.query('UPDATE jobs SET tier=? WHERE user=? AND guild=?', [tier, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            },
            setWorkCooldown(user, date) {
                return new Promise(async (resolve, reject) => {
                    if ([user, user.guild, date].some(t => !t)) reject('Invalid parameters in setWorkCooldown');

                    if (module.exports.type === 'sqlite') {
                        const cooldown = module.exports.sqlite.database.prepare('SELECT * FROM job_cooldowns WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (!cooldown) {
                            module.exports.sqlite.database.prepare('INSERT INTO job_cooldowns(user, guild, date) VALUES(?, ?, ?)').run(user.id, user.guild.id, date);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('UPDATE job_cooldowns SET date=? WHERE user=? AND guild=?').run(date, user.id, user.guild.id);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM job_cooldowns WHERE user=? AND guild=?', [user.id, user.guild.id], (err, cooldown) => {
                            if (err) reject(err);
                            if (!cooldown.length) {
                                module.exports.mysql.database.query('INSERT INTO job_cooldowns(user, guild, date) VALUES(?, ?, ?)', [user.id, user.guild.id, date], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('UPDATE job_cooldowns SET date=? WHERE user=? AND guild=?', [date, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }

                        });
                    }
                });
            },
            setWorkAmount(user, times) {
                return new Promise(async (resolve, reject) => {
                    if ([user, user.guild, times].some(t => !t)) reject('Invalid parameters in setWorkAmount');

                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE jobs SET amount_of_times_worked=? WHERE user=? AND guild=?').run(times, user.id, user.guild.id);

                        let global = module.exports.sqlite.database.prepare('SELECT * FROM global_times_worked WHERE user=? AND guild=?').get(user.id, user.guild.id);

                        if (global) {
                            module.exports.sqlite.database.prepare('UPDATE global_times_worked SET times_worked=? WHERE user=? AND guild=?').run((global.times_worked + 1), user.id, user.guild.id);
                        } else {
                            module.exports.sqlite.database.prepare("INSERT INTO global_times_worked(user, guild, times_worked) VALUES(?, ?, ?)").run(user.id, user.guild.id, times);
                        }

                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE jobs SET amount_of_times_worked=? WHERE user=? AND guild=?', [times, user.id, user.guild.id], (err) => {
                            if (err) reject(err);

                            module.exports.mysql.database.query('SELECT * FROM global_times_worked WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                                let global = rows[0];

                                if (global) {
                                    module.exports.mysql.database.query('UPDATE global_times_worked SET times_worked=? WHERE user=? AND guild=?', [(global.times_worked + times), user.id, user.guild.id], (e) => {
                                        if (e) reject(e);
                                        resolve();
                                    });
                                } else {
                                    module.exports.mysql.database.query('INSERT INTO global_times_worked(user, guild, times_worked) VALUES(?, ?, ?)', [user.id, user.guild.id, times], (e) => {
                                        if (e) reject(e);
                                        resolve();
                                    });
                                }
                            });
                        });
                    }
                });
            },
            quitJob(user) {
                return new Promise(async (resolve, reject) => {
                    if ([user, user.guild].some(t => !t)) reject('Invalid parameters in quitJob');

                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('DELETE FROM jobs WHERE user=? AND guild=?').run(user.id, user.guild.id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM jobs WHERE user=? AND guild=?', [user.id, user.guild.id], (err) => {
                            if (err) reject(err);
                            module.exports.mysql.database.query('DELETE FROM jobs WHERE user=? AND guild=?', [user.id, user.guild.id], (err) => {
                                if (err) reject(err);
                                resolve();
                            });
                        });
                    }
                });
            },
            setDailyCooldown(user, date) {
                return new Promise(async (resolve, reject) => {
                    if ([user, user.guild, date].some(t => !t)) reject('Invalid parameters in setDailyCooldown');

                    if (module.exports.type === 'sqlite') {
                        const cooldown = module.exports.sqlite.database.prepare('SELECT * FROM dailycoinscooldown WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (cooldown) {
                            module.exports.sqlite.database.prepare('UPDATE dailycoinscooldown SET date=? WHERE user=? AND guild=?').run(date, user.id, user.guild.id);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('INSERT INTO dailycoinscooldown(user, guild, date) VALUES(?,?,?)').run(user.id, user.guild.id, date);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM dailycoinscooldown WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (rows.length > 0) {
                                module.exports.mysql.database.query('UPDATE dailycoinscooldown SET date=? WHERE user=? AND guild=?', [date, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('INSERT INTO dailycoinscooldown(user, guild, date) VALUES(?,?,?)', [user.id, user.guild.id, date], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            },
            setWeeklyCooldown(user, date) {
                return new Promise(async (resolve, reject) => {
                    if ([user, user.guild, date].some(t => !t)) reject('Invalid parameters in setWeeklyCooldown');

                    if (module.exports.type === 'sqlite') {
                        const cooldown = module.exports.sqlite.database.prepare('SELECT * FROM weeklycoinscooldown WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (cooldown) {
                            module.exports.sqlite.database.prepare('UPDATE weeklycoinscooldown SET date=? WHERE user=? AND guild=?').run(date, user.id, user.guild.id);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('INSERT INTO weeklycoinscooldown(user, guild, date) VALUES(?,?,?)').run(user.id, user.guild.id, date);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM weeklycoinscooldown WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (rows.length > 0) {
                                module.exports.mysql.database.query('UPDATE weeklycoinscooldown SET date=? WHERE user=? AND guild=?', [date, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('INSERT INTO weeklycoinscooldown(user, guild, date) VALUES(?,?,?)', [user.id, user.guild.id, date], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            }
        },
        experience: {
            updateExperience(user, level, xp, action) {
                return new Promise(async (resolve, reject) => {
                    if ([user, user.guild].some(t => !t) || isNaN(level) || isNaN(xp)) reject('Invalid parameters in updateExperience');

                    if (module.exports.type === 'sqlite') {
                        const experience = module.exports.sqlite.database.prepare('SELECT * FROM experience WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        let newxp;
                        if (experience) {
                            if (action == 'add') newxp = experience.xp + xp;
                            if (action == 'remove') newxp = experience.xp - xp;
                            if (action == 'set') newxp = xp;
                            if (newxp < 0) newxp = 0;
                            if (level < 1) level = 1;

                            module.exports.sqlite.database.prepare('UPDATE experience SET level=?, xp=? WHERE user=? AND guild=?').run(level, newxp, user.id, user.guild.id);
                            resolve();
                        } else {
                            if (['add', 'set'].includes(action)) newxp = xp;
                            if (action == 'remove') newxp = 0;
                            if (newxp < 0) newxp = 0;
                            if (level < 1) level = 1;

                            module.exports.sqlite.database.prepare('INSERT INTO experience(user, guild, level, xp) VALUES(?, ?, ?, ?)').run(user.id, user.guild.id, level, newxp);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM experience WHERE user=? AND guild=?', [user.id, user.guild.id], (err, experience) => {
                            if (err) reject(err);
                            let newxp;
                            if (experience.length > 0) {
                                if (action == 'add') newxp = experience[0].xp + xp;
                                if (action == 'remove') newxp = experience[0].xp - xp;
                                if (action == 'set') newxp = xp;
                                if (newxp < 0) newxp = 0;
                                if (level < 1) level = 1;

                                module.exports.mysql.database.query('UPDATE experience SET level=?, xp=? WHERE user=? AND guild=?', [level, newxp, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                if (['add', 'set'].includes(action)) newxp = xp;
                                if (action == 'remove') newxp = 0 - xp;
                                if (newxp < 0) newxp = 0;
                                if (level < 1) level = 1;

                                module.exports.mysql.database.query('INSERT INTO experience(user, guild, level, xp) VALUES(?, ?, ?, ?)', [user.id, user.guild.id, level, newxp], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            }
        },
        filter: {
            addWord(words) {
                return new Promise((resolve, reject) => {
                    if (!Array.isArray(words)) words = [words];
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare(`INSERT INTO filter(word) VALUES ${words.map(() => `(?)`)}`).run(...words);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query(`INSERT INTO filter(word) VALUES ${words.map(() => `(?)`)}`, words, (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            },
            removeWord(words) {
                return new Promise((resolve, reject) => {
                    if (!Array.isArray(words)) words = [words];
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare(`DELETE FROM filter WHERE ${words.map(() => `word=?`).join(" OR ")}`).run(words);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query(`DELETE FROM filter WHERE ${words.map(() => `word=?`).join(" OR ")}`, words, (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            }
        },
        giveaways: {
            addGiveaway(data) {
                return new Promise((resolve, reject) => {
                    if (['guild', 'channel', 'message', 'prize', 'start', 'end', 'amount_of_winners', 'host'].some(d => !data[d]) || ['start', 'end', 'amount_of_winners'].some(d => isNaN(data[d]))) return reject("Invalid data.");

                    if (module.exports.type == 'sqlite') {
                        module.exports.sqlite.database.prepare('INSERT INTO giveaways(guild, channel, message, prize, description, start, end, amount_of_winners, host, requirements, ended, winners) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
                            .run(data.guild, data.channel.id, data.message, data.prize, data.description, data.start, data.end, data.amount_of_winners, data.host.user.id, data.requirements ? JSON.stringify(data.requirements) : "{}", 0, "[]");
                        resolve();
                    }

                    if (module.exports.type == 'mysql') {
                        module.exports.mysql.database.query('INSERT INTO giveaways(guild, channel, message, prize, description, start, end, amount_of_winners, host, requirements, ended, winners) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                            [data.guild, data.channel, data.message, data.prize, data.description, data.start, data.end, data.amount_of_winners, data.host.user.id, data.requirements ? JSON.stringify(data.requirements) : "{}", true, "[]"], err => {
                                if (err) console.log(err);
                                resolve();
                            });
                    }
                });
            },
            deleteGiveaway(id) {
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('DELETE FROM giveaways WHERE message=?').run(id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('DELETE FROM giveaways WHERE message=?', [id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            setToEnded(id) {
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE giveaways SET ended=? WHERE message=?').run(1, id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE giveaways SET ended=? WHERE message=?', [true, id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            setWinners(winners, id) {
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE giveaways SET winners=? WHERE message=?').run(winners, id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE giveaways SET winners=? WHERE message=?', [winners, id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            reactions: {
                addReaction(giveaway, user, entries = 1) {
                    return new Promise((resolve, reject) => {
                        if (!giveaway || !user) return reject('Invalid giveaway or user.');

                        if (module.exports.type === 'sqlite') {
                            module.exports.sqlite.database.prepare('INSERT INTO giveawayreactions(giveaway, user, entries) VALUES(?, ?, ?)').run(giveaway, user, entries);
                            resolve();
                        }
                        if (module.exports.type === 'mysql') {
                            module.exports.mysql.database.query('INSERT INTO giveawayreactions(giveaway, user, entries) VALUES(?, ?, ?)', [giveaway, user, entries], (err) => {
                                if (err) reject(err);
                                resolve();
                            });
                        }
                    });
                },
                removeReaction(giveaway, user) {
                    return new Promise((resolve, reject) => {
                        if (!giveaway || !user) return reject('Invalid giveaway or user.');

                        if (module.exports.type === 'sqlite') {
                            module.exports.sqlite.database.prepare('DELETE FROM giveawayreactions WHERE giveaway=? AND user=?').run(giveaway, user);
                            resolve();
                        }
                        if (module.exports.type === 'mysql') {
                            module.exports.mysql.database.query('DELETE FROM giveawayreactions WHERE giveaway=? AND user=?', [giveaway, user], (err) => {
                                if (err) reject(err);
                                resolve();
                            });
                        }
                    });
                }
            }
        },
        punishments: {
            addPunishment(data) {
                return new Promise((resolve, reject) => {
                    if (['type', 'user', 'tag', 'reason', 'time', 'executor'].some(a => !data[a])) return reject('Invalid arguments for addPunishment');

                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('INSERT INTO punishments(type, user, tag, reason, time, executor, length, complete) VALUES(?, ?, ?, ?, ?, ?, ?, ?)').run(data.type, data.user, data.tag, data.reason, data.time, data.executor, data.length, 0);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('INSERT INTO punishments(type, user, tag, reason, time, executor, length, complete) VALUES(?, ?, ?, ?, ?, ?, ?, ?)', [data.type, data.user, data.tag, data.reason, data.time, data.executor, data.length, 0], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            removePunishment(id) {
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('DELETE FROM punishments WHERE id=?').run(id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('DELETE FROM punishments WHERE id=?', [id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            addWarning(data) {
                return new Promise((resolve, reject) => {
                    if (['user', 'tag', 'reason', 'time', 'executor'].some(a => !data[a])) return reject('Invalid arguments for addWarning');

                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('INSERT INTO warnings(user, tag, reason, time, executor) VALUES(?, ?, ?, ?, ?)').run(data.user, data.tag, data.reason, data.time, data.executor);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('INSERT INTO warnings(user, tag, reason, time, executor) VALUES(?, ?, ?, ?, ?)', [data.user, data.tag, data.reason, data.time, data.executor], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            removeWarning(id) {
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('DELETE FROM warnings WHERE id=?').run(id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('DELETE FROM warnings WHERE id=?', [id], (err) => {
                            if (err) reject(err);
                            else resolve(err);
                        });
                    }
                });
            },
            completePunishment(id) {
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE punishments SET complete=1 WHERE id=?').run(id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE punishments SET complete=1 WHERE id=?', [id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            }
        },
        modules: {
            setModule(modulename, enabled) {
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE modules SET enabled=? WHERE name=?').run(enabled ? 1 : 0, modulename);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE modules SET enabled=? WHERE name=?', [enabled, modulename], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            }
        },
        commands: {
            setCommand(commandname, enabled) {
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE commands SET enabled=? WHERE name=?').run(enabled ? 1 : 0, commandname);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE commands SET enabled=? WHERE name=?', [enabled, commandname], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            channels: {
                add(data) {
                    return new Promise((resolve, reject) => {
                        if (!data || !data.command || !data.type || !data.channels) reject('[DATABASE (update.commands.channels.add)] Invalid inputs');

                        if (module.exports.type === 'sqlite') {
                            module.exports.sqlite.database.prepare('INSERT INTO command_channels VALUES(?, ?, ?)').run(data.command, data.type, JSON.stringify(data.channels));
                            resolve();
                        }
                        if (module.exports.type === 'mysql') {
                            module.exports.mysql.database.query('INSERT INTO command_channels VALUES(?, ?, ?)', [data.command, data.type, JSON.stringify(data.channels)], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        }
                    });
                },
                remove(command) {
                    return new Promise((resolve, reject) => {
                        if (!command) reject('[DATABASE (update.commands.channels.add)] Invalid inputs');

                        if (module.exports.type === 'sqlite') {
                            module.exports.sqlite.database.prepare('DELETE FROM command_channels WHERE command=?').run(command);
                            resolve();
                        }
                        if (module.exports.type === 'mysql') {
                            module.exports.mysql.database.query('DELETE FROM command_channels WHERE command=?', [command], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        }
                    });
                },
                updateType(command, type) {
                    return new Promise((resolve, reject) => {
                        if (!command || !type) reject('[DATABASE (update.commands.channels.updateType)] Invalid inputs');

                        if (module.exports.type === 'sqlite') {
                            module.exports.sqlite.database.prepare('UPDATE command_channels SET type=? WHERE command=?').run(type, command);
                            resolve();
                        }
                        if (module.exports.type === 'mysql') {
                            module.exports.mysql.database.query('UPDATE command_channels SET type=? WHERE command=?', [type, command], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        }
                    });
                },
                updateChannels(command, channels) {
                    return new Promise((resolve, reject) => {
                        if (!command || !channels) reject('[DATABASE (update.commands.channels.updateChannels)] Invalid inputs');

                        if (module.exports.type === 'sqlite') {
                            module.exports.sqlite.database.prepare('UPDATE command_channels SET channels=? WHERE command=?').run(JSON.stringify(channels), command);
                            resolve();
                        }
                        if (module.exports.type === 'mysql') {
                            module.exports.mysql.database.query('UPDATE command_channels SET channels=? WHERE command=?', [JSON.stringify(channels), command], (err) => {
                                if (err) reject(err);
                                else resolve();
                            });
                        }
                    });
                }
            }
        },
        applications: {
            createApplication(data) {
                if (Object.values(data).some(a => !a)) return console.log('[DATABASE (update.applications.createApplication] Invalid inputs');
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('INSERT INTO applications(guild, channel_id, channel_name, creator, status) VALUES(?, ?, ?, ?, ?)').run(data.guild, data.channel_id, data.channel_name, data.creator, "Pending");
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('INSERT INTO applications(guild, channel_id, channel_name, creator, status, _rank, questions_answers) VALUES(?, ?, ?, ?, ?, ?, ?)', [data.guild, data.channel_id, data.channel_name, data.creator, "Pending", " ", " "], (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            },
            completeApplication(id, rank, questions_answers) {
                if (!id || !rank || !questions_answers) return console.log('[DATABASE (update.applications.createApplication] Invalid inputs');
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE applications SET rank=?, questions_answers=? WHERE channel_id=?').run(rank, questions_answers, id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE applications SET _rank=?, questions_answers=? WHERE channel_id=?', [rank, questions_answers, id], (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            },
            setStatus(id, status) {
                if (!id || !status) return console.log('[DATABASE (update.applications.setStatus)] Invalid inputs');
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE applications SET status=? WHERE channel_id=?').run(status, id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE applications SET status=? WHERE channel_id=?', [status, id], function (err) {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            }
        },
        roles: {
            setSavedRoles(user, roles) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !user.id || !user.guild || !roles || typeof roles !== 'string') reject('[DATABASE (update.roles.setSavedRoles)] Invalid inputs');

                    if (module.exports.type === 'sqlite') {
                        const savedRoles = module.exports.sqlite.database.prepare('SELECT * FROM saved_roles WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (!savedRoles) {
                            module.exports.sqlite.database.prepare('INSERT INTO saved_roles(user, guild, roles) VALUES(?, ?, ?)').run(user.id, user.guild.id, roles);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('UPDATE saved_roles SET roles=? WHERE user=? AND guild=?').run(roles, user.id, user.guild.id);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM saved_roles WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (!rows[0]) {
                                module.exports.mysql.database.query('INSERT INTO saved_roles(user, guild, roles) VALUES(?, ?, ?)', [user.id, user.guild.id, roles], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('UPDATE saved_roles SET roles=? WHERE user=? AND guild=?', [roles, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            },
            setSavedMuteRoles(user, roles) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !user.id || !user.guild || !roles || typeof roles !== 'string') reject('[DATABASE (update.roles.setSavedMuteRoles)] Invalid inputs');

                    if (module.exports.type === 'sqlite') {
                        const savedRoles = module.exports.sqlite.database.prepare('SELECT * FROM saved_mute_roles WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (!savedRoles) {
                            module.exports.sqlite.database.prepare('INSERT INTO saved_mute_roles(user, guild, roles) VALUES(?, ?, ?)').run(user.id, user.guild.id, roles);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('UPDATE saved_mute_roles SET roles=? WHERE user=? AND guild=?').run(roles, user.id, user.guild.id);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM saved_mute_roles WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (!rows[0]) {
                                module.exports.mysql.database.query('INSERT INTO saved_mute_roles(user, guild, roles) VALUES(?, ?, ?)', [user.id, user.guild.id, roles], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('UPDATE saved_mute_roles SET roles=? WHERE user=? AND guild=?', [roles, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            }
        },
        games: {
            setData(user, data) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !user.id || !user.guild || !data || typeof data !== 'string') reject('[DATABASE (update.games.setData)] Invalid inputs');

                    if (module.exports.type === 'sqlite') {
                        const gameData = module.exports.sqlite.database.prepare('SELECT * FROM game_data WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (!gameData) {
                            module.exports.sqlite.database.prepare('INSERT INTO game_data(user, guild, data) VALUES(?, ?, ?)').run(user.id, user.guild.id, data);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('UPDATE game_data SET data=? WHERE user=? AND guild=?').run(data, user.id, user.guild.id);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM game_data WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (!rows[0]) {
                                module.exports.mysql.database.query('INSERT INTO game_data(user, guild, data) VALUES(?, ?, ?)', [user.id, user.guild.id, data], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('UPDATE game_data SET data=? WHERE user=? AND guild=?', [data, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            }
        },
        addons: {
            setUnloaded(addon_name) {
                return new Promise(async (resolve, reject) => {
                    if (!addon_name) reject('[DATABASE (update.addons.setUnloaded)] Invalid inputs');

                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare("INSERT INTO unloaded_addons(addon_name) VALUES(?)").run(addon_name);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('INSERT INTO unloaded_addons(addon_name) VALUES(?)', [addon_name], (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            },
            setLoaded(addon_name) {
                return new Promise(async (resolve, reject) => {
                    if (!addon_name) reject('[DATABASE (update.addons.setLoaded)] Invalid inputs');

                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare("DELETE FROM unloaded_addons WHERE addon_name=?").run(addon_name);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('DELETE FROM unloaded_addons WHERE addon_name=?', [addon_name], (err) => {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            }
        },
        blacklists: {
            addBlacklist(user, command) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !command) reject('[DATABASE (update.blacklists.addBlacklist)] Invalid inputs');
                    let blacklists = await module.exports.get.getBlacklists(user);

                    if (!blacklists) {
                        if (module.exports.type == "sqlite") module.exports.sqlite.database.prepare("INSERT INTO blacklists VALUES(?, ?, ?)").run(user.id, user.guild.id, " ");
                        if (module.exports.type == "mysql") await module.exports.mysql.database.query("INSERT INTO blacklists VALUES(?, ?, ?)", [user.id, user.guild.id, " "], (err) => {
                            if (err) reject(err);
                        });
                        blacklists = [];
                    }

                    blacklists.push(command);

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("UPDATE blacklists SET commands=? WHERE user=? AND guild=?").run(JSON.stringify(blacklists), user.id, user.guild.id);
                        resolve();
                    }
                    if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("UPDATE blacklists SET commands=? WHERE user=? AND guild=?", [JSON.stringify(blacklists), user.id, user.guild.id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            removeBlacklist(user, command) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !command) reject('[DATABASE (update.blacklists.removeBlacklist)] Invalid inputs');
                    let blacklists = await module.exports.get.getBlacklists(user);

                    if (!blacklists) blacklists = [];

                    if (blacklists.indexOf(command) >= 0) blacklists.splice(blacklists.indexOf(command), 1);

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("UPDATE blacklists SET commands=? WHERE user=? AND guild=?").run(JSON.stringify(blacklists), user.id, user.guild.id);
                        resolve();
                    }
                    if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("UPDATE blacklists SET commands=? WHERE user=? AND guild=?", [JSON.stringify(blacklists), user.id, user.guild.id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            }
        },
        id_bans: {
            add(guild, id, executor, reason) {
                return new Promise(async (resolve, reject) => {
                    if (!id || !guild || !executor) reject('[DATABASE (update.id_bans.add)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("INSERT INTO id_bans(guild, id, executor, reason) VALUES(?, ?, ?, ?)").run(guild.id, id, executor.id, reason ? reason : null);
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("INSERT INTO id_bans(guild, id, executor, reason) VALUES(?, ?, ?, ?)", [guild.id, id, executor.id, reason ? reason : null], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            remove(guild, id) {
                return new Promise(async (resolve, reject) => {
                    if (!id || !guild) reject('[DATABASE (update.id_bans.remove)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("DELETE FROM id_bans WHERE guild=? AND id=?").run(guild.id, id);
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("DELETE FROM id_bans WHERE guild=? AND id=?", [guild.id, id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            }
        },
        reminders: {
            add(member, time, text) {
                return new Promise(async (resolve, reject) => {
                    if (!member || !time || !text) reject('[DATABASE (update.reminders.add)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("INSERT INTO reminders(member, time, reminder) VALUES(?, ?, ?)").run(member.user.id, time, text);
                        let reminders = await module.exports.get.getReminders();
                        resolve(Math.max(...reminders.map(r => r.id)));
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("INSERT INTO reminders(member, time, reminder) VALUES(?, ?, ?)", [member.user.id, time, text], async (err) => {
                            if (err) reject(err);
                            else {
                                let reminders = await module.exports.get.getReminders();
                                resolve(Math.max(...reminders.map(r => r.id)));
                            }
                        });
                    }
                });
            },
            remove(id) {
                return new Promise(async (resolve, reject) => {
                    if (!id) reject('[DATABASE (update.reminders.remove)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("DELETE FROM reminders WHERE id=?").run(id);
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("DELETE FROM reminders WHERE id=?", [id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            }
        },
        announcements: {
            add(announcement) {
                return new Promise(async (resolve, reject) => {
                    if (["Channel", "Interval", "Type"].some(property => !announcement[property]) || (!announcement.Embed && !announcement.Content)) reject('[DATABASE (update.announcements.add)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("INSERT INTO announcements(announcement_data) VALUES(?)").run(JSON.stringify(announcement));
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("INSERT INTO announcements(announcement_data) VALUES(?)", [JSON.stringify(announcement)], async (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            remove(id) {
                if (!id) return console.log('[DATABASE (update.announcements.remove)] Invalid inputs');
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('DELETE FROM announcements WHERE id=?').run(id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('DELETE FROM announcements WHERE id=?', [id], function (err) {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            },
            setNextBroadcast(id, date) {
                if (!id || !date) return console.log('[DATABASE (update.announcements.setNextBroadcast)] Invalid inputs');
                return new Promise((resolve, reject) => {
                    if (module.exports.type === 'sqlite') {
                        module.exports.sqlite.database.prepare('UPDATE announcements SET next_broadcast=? WHERE id=?').run(date, id);
                        resolve();
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('UPDATE announcements SET next_broadcast=? WHERE id=?', [date, id], function (err) {
                            if (err) reject(err);
                            resolve();
                        });
                    }
                });
            }
        },
        suggestions: {
            add(data) {
                return new Promise(async (resolve, reject) => {
                    if (["guild", "channel", "message", "suggestion", "creator", "status", "votes", "created_on"].some(p => !data[p])) reject('[DATABASE (update.suggestions.add)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("INSERT INTO suggestions(guild, channel, message, suggestion, creator, status, votes, created_on, image) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)").run(...Object.values(data));
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("INSERT INTO suggestions(guild, channel, message, suggestion, creator, status, votes, created_on, image) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)", Object.values(data), async (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            setStatus(channel, message, status, votes, changedBy, old_message) {
                return new Promise(async (resolve, reject) => {
                    if (!channel || !message || !status || !votes || !changedBy || !old_message) reject('[DATABASE (update.suggestions.add)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("UPDATE suggestions SET channel=?, message=?, status=?, status_changed_on=?, votes=?, status_changed_by=? WHERE message=?").run(channel, message, status, Date.now(), JSON.stringify(votes), changedBy, old_message);
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("UPDATE suggestions SET channel=?, message=?, status=?, status_changed_on=?, votes=?, status_changed_by=? WHERE message=?", [channel, message, status, Date.now(), JSON.stringify(votes), changedBy, old_message], async (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            }
        },
        bugreports: {
            // guild text, channel text, message text, suggestion text, creator text, status text, votes text, created_on integer, status_changed_on integer
            add(data) {
                return new Promise(async (resolve, reject) => {
                    if (["guild", "channel", "message", "bug", "creator", "status", "created_on"].some(p => !data[p])) reject('[DATABASE (update.bugreports.add)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("INSERT INTO bugreports(guild, channel, message, bug, creator, status, created_on, image) VALUES(?, ?, ?, ?, ?, ?, ?, ?)").run(...Object.values(data));
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("INSERT INTO bugreports(guild, channel, message, bug, creator, status, created_on, image) VALUES(?, ?, ?, ?, ?, ?, ?, ?)", Object.values(data), async (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            setStatus(channel, message, status, changedBy, old_message) {
                return new Promise(async (resolve, reject) => {
                    if (!channel || !message || !status || !changedBy || !old_message) reject('[DATABASE (update.bugreports.add)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("UPDATE bugreports SET channel=?, message=?, status=?, status_changed_on=?, status_changed_by=? WHERE message=?").run(channel, message, status, Date.now(), changedBy, old_message);
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("UPDATE bugreports SET channel=?, message=?, status=?, status_changed_on=?, status_changed_by=? WHERE message=?", [channel, message, status, Date.now(), changedBy, old_message], async (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            }
        },
        locked_channels: {
            add(guild, channel, permissions) {
                return new Promise(async (resolve, reject) => {
                    if (!guild || !channel || !permissions) reject('[DATABASE (update.locked_channels.add)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("INSERT INTO locked_channels(guild, channel, permissions) VALUES(?, ?, ?)").run(guild, channel, JSON.stringify(permissions));
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("INSERT INTO locked_channels(guild, channel, permissions) VALUES(?, ?, ?)", [guild, channel, JSON.stringify(permissions)], async (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            remove(guild, channel) {
                return new Promise(async (resolve, reject) => {
                    if (!guild || !channel) reject('[DATABASE (update.locked_channels.remove)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("DELETE FROM locked_channels WHERE guild=? AND channel=?").run(guild, channel);
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("DELETE FROM locked_channels WHERE guild=? AND channel=?", [guild, channel], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            }
        },
        invites: {
            updateData(user, data) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !data) reject('[DATABASE (update.invites.updateData)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        let inviteData = module.exports.sqlite.database.prepare("SELECT * FROM invites WHERE user=? AND guild=?").get(user.id, user.guild.id);
                        if (inviteData) {
                            module.exports.sqlite.database.prepare("UPDATE invites SET regular=?, bonus=?, leaves=?, fake=? WHERE user=? AND guild=?").run(data.regular, data.bonus, data.leaves, data.fake, user.id, user.guild.id);
                        } else {
                            module.exports.sqlite.database.prepare("INSERT INTO invites(guild, user, regular, bonus, leaves, fake) VALUES(?, ?, ?, ?, ?, ?)").run(user.guild.id, user.id, data.regular, data.bonus, data.leaves, data.fake);
                        }
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("SELECT * FROM invites WHERE user=? AND guild=?", [data.regular, data.bonus, data.fake], (err, inviteData) => {
                            if (inviteData.length) {
                                module.exports.mysql.database.query("UPDATE invites SET regular=?, bonus=?, leaves=?, fake=? WHERE user=? AND guild=?", [data.regular, data.bonus, data.leaves, data.fake, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                });
                            } else {
                                module.exports.mysql.database.query("INSERT INTO invites(guild, user, regular, bonus, leaves, fake) VALUES(?, ?, ?, ?, ?, ?)", [user.guild.id, user.id, data.regular, data.bonus, data.leaves, data.fake], (err) => {
                                    if (err) reject(err);
                                    else resolve();
                                });
                            }
                        });
                    }
                });
            },
            addJoin(user, inviter) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !inviter) reject('[DATABASE (update.invites.addJoin)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("INSERT INTO joins(guild, user, inviter, time) VALUES(?, ?, ?, ?)").run(user.guild.id, user.id, inviter.id, Date.now());
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("INSERT INTO joins(guild, user, inviter, time) VALUES(?, ?, ?, ?)", [user.guild.id, user.id, inviter.id, Date.now()], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
        },
        role_menus: {
            add(message, name) {
                return new Promise(async (resolve, reject) => {
                    if (!message) reject('[DATABASE (update.role_menus.add)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("INSERT INTO role_menus(guild, channel, message, name) VALUES(?, ?, ?, ?)").run(message.guild.id, message.channel.id, message.id, name.toLowerCase());
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("INSERT INTO role_menus(guild, channel, message, name) VALUES(?, ?, ?, ?)", [message.guild.id, message.channel.id, message.id, name.toLowerCase()], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            },
            remove(message) {
                return new Promise(async (resolve, reject) => {
                    if (!message) reject('[DATABASE (update.role_menus.remove)] Invalid inputs');

                    if (module.exports.type == "sqlite") {
                        module.exports.sqlite.database.prepare("DELETE FROM role_menus WHERE message=?").run(message);
                        resolve();
                    } else if (module.exports.type == "mysql") {
                        module.exports.mysql.database.query("DELETE FROM role_menus WHERE message=?", [message], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    }
                });
            }
        },
        messages: {
            increase(user, amount = 1) {
                return new Promise(async (resolve, reject) => {
                    if (!user || typeof amount != "number" || !user.id || !user.guild) reject('[DATABASE (update.messages.increase)] Invalid inputs');

                    if (module.exports.type === 'sqlite') {
                        const data = module.exports.sqlite.database.prepare('SELECT * FROM message_counts WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (!data) {
                            module.exports.sqlite.database.prepare('INSERT INTO message_counts(guild, user, count) VALUES(?, ?, ?)').run(user.guild.id, user.id, amount);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('UPDATE message_counts SET count=? WHERE user=? AND guild=?').run(data.count + amount, user.id, user.guild.id);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM message_counts WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (!rows[0]) {
                                module.exports.mysql.database.query('INSERT INTO message_counts(guild, user, count) VALUES(?, ?, ?)', [user.guild.id, user.id, amount], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('UPDATE message_counts SET count=? WHERE user=? AND guild=?', [rows[0].count + amount, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            },
            decrease(amount = 1) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !amount || !user.id || !user.guild) reject('[DATABASE (update.messages.increase)] Invalid inputs');

                    if (module.exports.type === 'sqlite') {
                        const data = module.exports.sqlite.database.prepare('SELECT * FROM message_counts WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (data) {
                            module.exports.sqlite.database.prepare('UPDATE message_counts SET count=? WHERE user=? AND guild=?').run(data.count - amount > 0 ? data.count - count : 0, user.id, user.guild.id);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM message_counts WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (rows[0]) {
                                module.exports.mysql.database.query('UPDATE message_counts SET count=? WHERE user=? AND guild=?', [rows[0].count - amount > 0 ? rows[0].count - count : 0, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            }
        },
        voice_time: {
            updateJoinTime(user, time) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !user.guild) reject('[DATABASE (update.voice_time.updateJoinTime)] Invalid inputs');

                    time = time ? time : null;

                    if (module.exports.type === 'sqlite') {
                        const data = module.exports.sqlite.database.prepare('SELECT * FROM voice_time WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (!data) {
                            module.exports.sqlite.database.prepare('INSERT INTO voice_time(guild, user, total_time, join_date) VALUES(?, ?, ?, ?)').run(user.guild.id, user.id, 0, time);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('UPDATE voice_time SET join_date=? WHERE user=? AND guild=?').run(time, user.id, user.guild.id);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM voice_time WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (!rows[0]) {
                                module.exports.mysql.database.query('INSERT INTO voice_time(guild, user, total_time, join_date) VALUES(?, ?, ?, ?)', [user.guild.id, user.id, 0, time], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('UPDATE voice_time SET join_date=? WHERE user=? AND guild=?', [time, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            },
            addVoiceTime(user, amount) {
                return new Promise(async (resolve, reject) => {
                    if (!user || !user.guild || isNaN(amount)) reject('[DATABASE (update.voice_time.addVoiceTime)] Invalid inputs');

                    if (module.exports.type === 'sqlite') {
                        const data = module.exports.sqlite.database.prepare('SELECT * FROM voice_time WHERE user=? AND guild=?').get(user.id, user.guild.id);
                        if (!data) {
                            module.exports.sqlite.database.prepare('INSERT INTO voice_time(guild, user, total_time, join_date) VALUES(?, ?, ?, ?)').run(user.guild.id, user.id, amount, null);
                            resolve();
                        } else {
                            module.exports.sqlite.database.prepare('UPDATE voice_time SET total_time=? WHERE user=? AND guild=?').run(data.total_time + amount, user.id, user.guild.id);
                            resolve();
                        }
                    }
                    if (module.exports.type === 'mysql') {
                        module.exports.mysql.database.query('SELECT * FROM voice_time WHERE user=? AND guild=?', [user.id, user.guild.id], (err, rows) => {
                            if (err) reject(err);
                            if (!rows[0]) {
                                module.exports.mysql.database.query('INSERT INTO voice_time(guild, user, total_time, join_date) VALUES(?, ?, ?, ?)', [user.guild.id, user.id, amount, null], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            } else {
                                module.exports.mysql.database.query('UPDATE voice_time SET join_date=? WHERE user=? AND guild=?', [data[0].total_time + amount, user.id, user.guild.id], (err) => {
                                    if (err) reject(err);
                                    resolve();
                                });
                            }
                        });
                    }
                });
            }
        }
    }
};
// 324070   8501   8417dfc7c741b31374d8b3ff7487f603    83708   1651764914   9c346220c8e6100566b4dd8eff9d5b74   %%__NONCE__%%