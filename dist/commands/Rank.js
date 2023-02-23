"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backgrounds = void 0;
const discord_js_1 = require("discord.js");
const player_1 = require("../db/player");
const Command_1 = __importDefault(require("../internals/Command"));
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
const first = 'https://cdn.discordapp.com/attachments/852546444086214676/860427588589846568/image0.jpg';
const second = 'https://cdn.discordapp.com/attachments/574852830125359126/860430411423416360/unknown.png';
const third = 'https://cdn.discordapp.com/attachments/576986467084140557/852846797041696798/iu.png';
exports.backgrounds = [
    first,
    second,
    second,
    third,
    third,
    third,
    third,
    third,
    third,
    third,
];
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'rank';
        this.block = true;
    }
    async exec(msg, args) {
        const { author } = msg;
        const channel = msg.guild?.channels.resolve(main_1.client.rankChannelID);
        if (!channel)
            throw Error('No rank channel');
        if (!(channel instanceof discord_js_1.TextChannel)) {
            return;
        }
        const messages = await channel.messages.fetch();
        let count = 10;
        const rankCount = parseInt(args[0]);
        if (rankCount) {
            count = rankCount;
        }
        channel.startTyping();
        const users = await (0, player_1.getUsers)();
        await channel.guild.members.fetch();
        const playersPromise = users
            .map((user) => channel.guild.members.cache.get(user.DiscordID))
            .filter((member) => !!member)
            .map((member) => Player_1.Player.getPlayer(member));
        let players = await Promise.all(playersPromise);
        players.sort((a, b) => b.xp - a.xp);
        players = players.slice(0, count);
        const files = await Promise.all(players.map((x) => x.getProfile()));
        channel.stopTyping();
        if (args.length === 0) {
            await (0, utils_1.nukeChannel)(channel);
            for (const file of files) {
                await channel.send({ files: [file] });
            }
        }
        else if (args.length > 0) {
            try {
                const dmChannel = await author.createDM();
                await (0, utils_1.nukeBotMessages)(dmChannel);
                // eslint-disable-next-line no-empty
            }
            catch (e) {
            }
            for (const file of files) {
                await author.send(file);
            }
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmFuay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9SYW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDJDQUFrRDtBQUNsRCx5Q0FBd0M7QUFDeEMsbUVBQTJDO0FBQzNDLGdEQUE2QztBQUM3Qyw4Q0FBa0U7QUFDbEUsa0NBQWlDO0FBRWpDLE1BQU0sS0FBSyxHQUFHLHlGQUF5RixDQUFDO0FBQ3hHLE1BQU0sTUFBTSxHQUFHLDBGQUEwRixDQUFDO0FBQzFHLE1BQU0sS0FBSyxHQUFHLHFGQUFxRixDQUFDO0FBRXZGLFFBQUEsV0FBVyxHQUFHO0lBQ3pCLEtBQUs7SUFDTCxNQUFNO0lBQ04sTUFBTTtJQUNOLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7Q0FDTixDQUFDO0FBRUYsZUFBcUIsU0FBUSxpQkFBTztJQUFwQzs7UUFDRSxTQUFJLEdBQUcsTUFBTSxDQUFDO1FBRWQsVUFBSyxHQUFHLElBQUksQ0FBQztJQThEZixDQUFDO0lBNURDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLElBQWM7UUFDckMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUN2QixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxPQUFPO1lBQUUsTUFBTSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsQ0FBQyxPQUFPLFlBQVksd0JBQVcsQ0FBQyxFQUFFO1lBQ3JDLE9BQU87U0FDUjtRQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoRCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7UUFFZixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFcEMsSUFBSSxTQUFTLEVBQUU7WUFDYixLQUFLLEdBQUcsU0FBUyxDQUFDO1NBQ25CO1FBRUQsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSxpQkFBUSxHQUFFLENBQUM7UUFFL0IsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUVwQyxNQUFNLGNBQWMsR0FBRyxLQUFLO2FBQ3pCLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUM7YUFDL0QsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO2FBQzVCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsZUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBRTdDLElBQUksT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVoRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDcEMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRWxDLE1BQU0sS0FBSyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUVyQixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3JCLE1BQU0sSUFBQSxtQkFBVyxFQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRTNCLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO2dCQUN4QixNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDdkM7U0FDRjthQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDMUIsSUFBSTtnQkFDRixNQUFNLFNBQVMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDMUMsTUFBTSxJQUFBLHVCQUFlLEVBQUMsU0FBUyxDQUFDLENBQUM7Z0JBRW5DLG9DQUFvQzthQUNuQztZQUFDLE9BQU0sQ0FBQyxFQUFFO2FBSVY7WUFFQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDeEIsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3pCO1NBRUo7SUFDSCxDQUFDO0NBQ0Y7QUFqRUQsNEJBaUVDIn0=