// init vars
var notifyInterval;
var pool;
var intervalId;

// literally all this thing really does
const rollD6 = () => {
    return String.fromCodePoint(9856 + Math.floor(Math.random() * 6));
};

const isNumeric = (n) => {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

const poolNotify = (message) => {
    let plural = pool == 1 ? "die" : "dice";
    message.channel.send("_Tension pool currently contains " + pool + " " + plural + "._");
}

// Load up the discord.js library
const Discord = require("discord.js");

// This is your client. Some people call it `bot`, some people call it `self`, 
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();
console.log("Client initialized");

// Here we load the config.json file that contains our token and our prefix values. 
const config = require("./config.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    notifyInterval = config.notifyInterval;
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    // Example of changing the bot's playing game to something useful. `client.user` is what the
    // docs refer to as the "ClientUser".
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("message", async message => {
    if( message.author.bot ) return;
    if( !message.member.roles.some(r=>["Administrator"].includes(r.name)) )return;
    if( message.content.indexOf(config.prefix) !== 0 ) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    switch(command) {
        // start and stop
        case "tense":
            // set pool to 0, notify of pool contents every notifyInterval seconds
            pool = 0;
            message.channel.send("_Tension rising_");
            intervalId = setInterval(poolNotify, notifyInterval * 1e3, message);
            break;
        case "relax":
            // clear pool and notify interval
            pool = null;
            clearInterval(intervalId);
            intervalId = null;
            message.channel.send("_Tension cleared_");
            break;

        // change notify interval 
        case "set-interval":
            if (args[0] && isNumeric(args[0]) && parseInt(args[0]) > 5) {
                notifyInterval = parseInt(args[0]);
                // if interval already set, clear it and re-set with the new time
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = setInterval(poolNotify, notifyInterval * 1e3, message);
                    message.channel.send("_Notify interval set to " + notifyInterval + " seconds_");
                }
            } else {
                message.channel.send("_Bad or missing argument_");
            }
            break;

        // described functions
        case "add":
            pool++;
            message.channel.send("_Tension increased_");
            // check for full pool
            if (pool == 6) {
                let text = "";
                for (let i = 0; i < pool; i++) {
                    text = text + rollD6() + " ";
                }
                message.channel.send("_Vibe check_");
                message.channel.send(text);
                pool = 0;
                message.channel.send("_Pool cleared_");
            }
            break;
        case "roll":
            // check for no pool
            if (pool > 0) {
                let text = "";
                for (let i = 0; i < pool; i++) {
                    text = text + rollD6() + " ";
                }
                message.channel.send("_Vibe check_");
                message.channel.send(text);
            } else {
                message.channel.send("_Pool is empty, rolling one die_");
                message.channel.send(rollD6());
            }
            break;
        case "add-roll":
            pool++;
            message.channel.send("_Tension increased_");
            let text = "";
            for (let i = 0; i < pool; i++) {
                text = text + rollD6() + " ";
            }
            message.channel.send("_Vibe check_");
            message.channel.send(text);
            // check for full pool
            // this means if you add+roll when the pool is at 5 you're rolling the full pool 2x
            if (pool == 6) {
                let text = "";
                for (let i = 0; i < pool; i++) {
                    text = text + rollD6() + " ";
                }
                message.channel.send("_Vibe check_");
                message.channel.send(text);
                pool = 0;
                message.channel.send("_Pool cleared_");
            }
            break;
    }
});

let token = Buffer(config.token, 'base64').toString('ascii');
console.log(token);
client.login(token);