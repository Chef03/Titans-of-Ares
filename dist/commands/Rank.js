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
const third = 'https://cdn.discordapp.com/attachments/972783695666774046/1058427316092538890/2e2dff03032ba2567b01443713cba402_1.jpg';
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
        let count = 100;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmFuay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9SYW5rLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLDJDQUFrRDtBQUNsRCx5Q0FBd0M7QUFDeEMsbUVBQTJDO0FBQzNDLGdEQUE2QztBQUM3Qyw4Q0FBa0U7QUFDbEUsa0NBQWlDO0FBRWpDLE1BQU0sS0FBSyxHQUFHLHlGQUF5RixDQUFDO0FBQ3hHLE1BQU0sTUFBTSxHQUFHLDBGQUEwRixDQUFDO0FBQzFHLE1BQU0sS0FBSyxHQUFHLHNIQUFzSCxDQUFDO0FBRXhILFFBQUEsV0FBVyxHQUFHO0lBQ3pCLEtBQUs7SUFDTCxNQUFNO0lBQ04sTUFBTTtJQUNOLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7Q0FDTixDQUFDO0FBRUYsZUFBcUIsU0FBUSxpQkFBTztJQUFwQzs7UUFDRSxTQUFJLEdBQUcsTUFBTSxDQUFDO1FBRWQsVUFBSyxHQUFHLElBQUksQ0FBQztJQStEZixDQUFDO0lBN0RDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLElBQWM7UUFDckMsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUN2QixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxPQUFPO1lBQUUsTUFBTSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUU3QyxJQUFJLENBQUMsQ0FBQyxPQUFPLFlBQVksd0JBQVcsQ0FBQyxFQUFFO1lBQ3JDLE9BQU87U0FDUjtRQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoRCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUM7UUFFaEIsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRXBDLElBQUksU0FBUyxFQUFFO1lBQ2IsS0FBSyxHQUFHLFNBQVMsQ0FBQztTQUNuQjtRQUVELE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN0QixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsaUJBQVEsR0FBRSxDQUFDO1FBRS9CLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFcEMsTUFBTSxjQUFjLEdBQUcsS0FBSzthQUN6QixHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDO2FBQy9ELE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQzthQUM1QixHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGVBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUU3QyxJQUFJLE9BQU8sR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUVsQyxNQUFNLEtBQUssR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVwRSxPQUFPLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFckIsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNyQixNQUFNLElBQUEsbUJBQVcsRUFBQyxPQUFPLENBQUMsQ0FBQztZQUUzQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtnQkFDeEIsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZDO1NBQ0Y7YUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzFCLElBQUk7Z0JBQ0YsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQzFDLE1BQU0sSUFBQSx1QkFBZSxFQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUVqQyxvQ0FBb0M7YUFDckM7WUFBQyxPQUFPLENBQUMsRUFBRTthQUlYO1lBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7Z0JBQ3hCLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUN6QjtTQUVGO0lBQ0gsQ0FBQztDQUNGO0FBbEVELDRCQWtFQyJ9