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
const Rank_1 = __importDefault(require("./commands/Rank"));
const Client_1 = __importDefault(require("./internals/Client"));
const TeamArena_1 = require("./internals/TeamArena");
const Squadboss_1 = require("./internals/Squadboss");
exports.client = new Client_1.default(path_1.default.resolve(__dirname, process.env.DB));
exports.client.commandManager.verbose = true;
exports.client.addBlockingPollHandler(energy_1.energyMainLoop);
exports.client.addBlockingPollHandler(Buff_1.Buff.mainLoop);
exports.client.addBlockingPollHandler(TeamArena_1.TeamArena.mainLoop);
exports.client.addBlockingPollHandler(Squadboss_1.SquadBoss.mainLoop);
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
        const rank = new Rank_1.default();
        rank.exec(msg, []);
        (0, xpLog_1.xpLog)(msg);
    }
    else if (command.startsWith('!') && !msg.author.bot) {
        exports.client.xpLogTriggers = authorID;
    }
    else if (!command.startsWith(exports.client.prefix) || msg.author.bot) {
        return;
    }
    if (exports.client.activePlayers.has(authorID)) {
        return msg.channel.send('There is already another command running');
    }
    exports.client.activePlayers.add(authorID);
    await exports.client.commandManager.handleMessage(msg);
    exports.client.activePlayers.delete(authorID);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLGdEQUF3QjtBQUN4Qiw2Q0FBMEM7QUFDMUMsK0NBQW9EO0FBQ3BELDJDQUF3QztBQUN4QywyREFBbUM7QUFDbkMsZ0VBQXdDO0FBQ3hDLHFEQUFrRDtBQUNsRCxxREFBa0Q7QUFFckMsUUFBQSxNQUFNLEdBQUcsSUFBSSxnQkFBTSxDQUFDLGNBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLENBQUMsQ0FBQztBQUUzRSxjQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFFckMsY0FBTSxDQUFDLHNCQUFzQixDQUFDLHVCQUFjLENBQUMsQ0FBQztBQUM5QyxjQUFNLENBQUMsc0JBQXNCLENBQUMsV0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzdDLGNBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxxQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2xELGNBQU0sQ0FBQyxzQkFBc0IsQ0FBQyxxQkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRWxELGNBQU0sQ0FBQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUU5RSxjQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxJQUFJLEVBQUU7SUFDbEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUM1QixNQUFNLEtBQUssR0FBRyxNQUFNLGNBQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0QsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7SUFDdEMsY0FBTSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7SUFDekIsY0FBTSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLGNBQU0sQ0FBQyxjQUFjLENBQWdCLENBQUM7SUFDdkUsY0FBTSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBTSxDQUFDLGtCQUFrQixDQUFnQixDQUFDO0lBQ2pGLGNBQU0sQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxjQUFNLENBQUMsaUJBQWlCLENBQWdCLENBQUM7SUFDL0UsY0FBTSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBTSxDQUFDLGtCQUFrQixDQUFnQixDQUFDO0lBQ2pGLGNBQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUMxQixDQUFDLENBQUMsQ0FBQztBQUVILGNBQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDckMsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO0lBRS9CLElBQ0UsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDO1dBQ2pDLENBQUMsUUFBUSxLQUFLLGNBQU0sQ0FBQyxRQUFRLElBQUksUUFBUSxLQUFLLGNBQU0sQ0FBQyxLQUFLLENBQUMsRUFDOUQ7UUFDQSxNQUFNLElBQUksR0FBRyxJQUFJLGNBQUksRUFBRSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLElBQUEsYUFBSyxFQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ1o7U0FBTSxJQUFJLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUNyRCxjQUFNLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztLQUNqQztTQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGNBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUMvRCxPQUFPO0tBQ1I7SUFFRCxJQUFJLGNBQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ3RDLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMENBQTBDLENBQUMsQ0FBQztLQUNyRTtJQUNELGNBQU0sQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ25DLE1BQU0sY0FBTSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0MsY0FBTSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDLENBQUMifQ==