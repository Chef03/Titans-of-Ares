"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const path_1 = __importDefault(require("path"));
const xpLog_1 = require("./internals/xpLog");
const energy_1 = require("./internals/energy");
const Buff_1 = require("./internals/Buff");
const Client_1 = __importDefault(require("./internals/Client"));
const TeamArena_1 = require("./internals/TeamArena");
const Squadboss_1 = require("./internals/Squadboss");
const Upload_1 = require("./internals/Upload");
exports.client = new Client_1.default(path_1.default.resolve(__dirname, process.env.DB));
exports.client.commandManager.verbose = true;
exports.client.addBlockingPollHandler(energy_1.energyMainLoop);
exports.client.addBlockingPollHandler(Buff_1.Buff.mainLoop);
exports.client.addBlockingPollHandler(TeamArena_1.TeamArena.mainLoop);
exports.client.addBlockingPollHandler(Squadboss_1.SquadBoss.mainLoop);
exports.client.addBlockingPollHandler(Upload_1.Upload.mainLoop);
exports.client.commandManager.registerCommands(path_1.default.resolve(__dirname, './commands'));
exports.client.bot.once('ready', async () => {
    console.log('Bot is ready');
    const guild = await exports.client.bot.guilds.fetch(exports.client.serverID);
    const channels = guild.channels.cache;
    exports.client.mainGuild = guild;
    exports.client.logChannel = channels.get(exports.client.xpLogChannelID);
    exports.client.squadBossChannel = channels.get(exports.client.squadBossChannelID);
    exports.client.mainTextChannel = channels.get(exports.client.mainTextChannelID);
    exports.client.teamArenaChannel = channels.get(exports.client.teamArenaChannelID);
    exports.client.startPollEvent();
});
exports.client.bot.on('message', async (msg) => {
    const words = msg.content.split(' ');
    const command = words[0];
    const authorID = msg.author.id;
    if (msg.content.startsWith('Registered')
        && (authorID === exports.client.oldBotID || authorID === exports.client.devID)) {
        (0, xpLog_1.xpLog)(msg);
    }
    else if ((command.startsWith('!') || command.startsWith('$upload')) && !msg.author.bot) {
        exports.client.xpLogTriggers = authorID;
    }
    if (!command.startsWith(exports.client.prefix) || msg.author.bot) {
        return;
    }
    if (exports.client.activePlayers.has(authorID)) {
        return msg.channel.send('There is already another command running');
    }
    if (!command.startsWith('$upload')) {
        exports.client.activePlayers.add(authorID);
    }
    await exports.client.commandManager.handleMessage(msg);
    exports.client.activePlayers.delete(authorID);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLGdEQUF3QjtBQUN4Qiw2Q0FBMEM7QUFDMUMsK0NBQW9EO0FBQ3BELDJDQUF3QztBQUN4QyxnRUFBd0M7QUFDeEMscURBQWtEO0FBQ2xELHFEQUFrRDtBQUNsRCwrQ0FBNEM7QUFFL0IsUUFBQSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztBQUUzRSxjQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFFckMsY0FBTSxDQUFDLHNCQUFzQixDQUFDLHVCQUFjLENBQUMsQ0FBQztBQUM5QyxjQUFNLENBQUMsc0JBQXNCLENBQUMsV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLGNBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxxQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2xELGNBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxxQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2xELGNBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxlQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFHL0MsY0FBTSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO0FBRTlFLGNBQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLElBQUksRUFBRTtJQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzVCLE1BQU0sS0FBSyxHQUFHLE1BQU0sY0FBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3RCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUN0QyxjQUFNLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN6QixjQUFNLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBTSxDQUFDLGNBQWMsQ0FBZ0IsQ0FBQztJQUN2RSxjQUFNLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxjQUFNLENBQUMsa0JBQWtCLENBQWdCLENBQUM7SUFDakYsY0FBTSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGNBQU0sQ0FBQyxpQkFBaUIsQ0FBZ0IsQ0FBQztJQUMvRSxjQUFNLENBQUMsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxjQUFNLENBQUMsa0JBQWtCLENBQWdCLENBQUM7SUFDakYsY0FBTSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBRTFCLENBQUMsQ0FBQyxDQUFDO0FBR0gsY0FBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsRUFBRTtJQUNyQyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNyQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFFL0IsSUFDRSxHQUFHLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUM7V0FDakMsQ0FBQyxRQUFRLEtBQUssY0FBTSxDQUFDLFFBQVEsSUFBSSxRQUFRLEtBQUssY0FBTSxDQUFDLEtBQUssQ0FBQyxFQUM5RDtRQUNBLElBQUEsYUFBSyxFQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ1o7U0FBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUN4RixjQUFNLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztLQUNqQztJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGNBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUN4RCxPQUFPO0tBQ1I7SUFFRCxJQUFJLGNBQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3RDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMENBQTBDLENBQUMsQ0FBQztLQUNyRTtJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ2xDLGNBQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3BDO0lBQ0QsTUFBTSxjQUFNLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQyxjQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUMsQ0FBQyJ9