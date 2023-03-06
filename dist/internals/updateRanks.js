"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const player_1 = require("../db/player");
const Player_1 = require("./Player");
const utils_1 = require("./utils");
const main_1 = require("../main");
async function updateRanks() {
    const channel = main_1.client.mainGuild.channels.resolve(main_1.client.rankChannelID);
    if (!channel)
        throw Error('No rank channel');
    if (!(channel instanceof discord_js_1.TextChannel)) {
        return;
    }
    const messages = await channel.messages.fetch();
    let count = 100;
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
    await (0, utils_1.nukeChannel)(channel);
    for (const file of files) {
        await channel.send({ files: [file] });
    }
}
exports.default = updateRanks;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBkYXRlUmFua3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL3VwZGF0ZVJhbmtzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQXlDO0FBQ3pDLHlDQUF3QztBQUN4QyxxQ0FBa0M7QUFDbEMsbUNBQXNDO0FBQ3RDLGtDQUFpQztBQUVsQixLQUFLLFVBQVUsV0FBVztJQUVyQyxNQUFNLE9BQU8sR0FBRyxhQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsYUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3hFLElBQUksQ0FBQyxPQUFPO1FBQUUsTUFBTSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUU3QyxJQUFJLENBQUMsQ0FBQyxPQUFPLFlBQVksd0JBQVcsQ0FBQyxFQUFFO1FBQ25DLE9BQU87S0FDVjtJQUVELE1BQU0sUUFBUSxHQUFHLE1BQU0sT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNoRCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUM7SUFFaEIsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3RCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSxpQkFBUSxHQUFFLENBQUM7SUFFL0IsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUVwQyxNQUFNLGNBQWMsR0FBRyxLQUFLO1NBQ3ZCLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUM7U0FDL0QsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1NBQzVCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsZUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBRS9DLElBQUksT0FBTyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUVoRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRWxDLE1BQU0sS0FBSyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXBFLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUVyQixNQUFNLElBQUEsbUJBQVcsRUFBQyxPQUFPLENBQUMsQ0FBQztJQUUzQixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN0QixNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDekM7QUFHTCxDQUFDO0FBdENELDhCQXNDQyJ9