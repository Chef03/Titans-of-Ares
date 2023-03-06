import { TextChannel } from "discord.js";
import { getUsers } from "../db/player";
import { Player } from "./Player";
import { nukeChannel } from "./utils";
import { client } from "../main";

export default async function updateRanks() {

    const channel = client.mainGuild.channels.resolve(client.rankChannelID);
    if (!channel) throw Error('No rank channel');

    if (!(channel instanceof TextChannel)) {
        return;
    }

    const messages = await channel.messages.fetch();
    let count = 100;

    channel.startTyping();
    const users = await getUsers();

    await channel.guild.members.fetch();

    const playersPromise = users
        .map((user) => channel.guild.members.cache.get(user.DiscordID)!)
        .filter((member) => !!member)
        .map((member) => Player.getPlayer(member));

    let players = await Promise.all(playersPromise);

    players.sort((a, b) => b.xp - a.xp);
    players = players.slice(0, count);

    const files = await Promise.all(players.map((x) => x.getProfile()));

    channel.stopTyping();

    await nukeChannel(channel);

    for (const file of files) {
        await channel.send({ files: [file] });
    }


}