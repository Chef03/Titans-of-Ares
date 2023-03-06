import { Message } from 'discord.js';
import Command from '../internals/Command';
import { MiningPickReward } from '../internals/MiningPickReward';
import { Player } from '../internals/Player';
import { client } from '../main';

export default class extends Command {
    name = 'addpick';

    async exec(msg: Message, args: string[]) {

        if (msg.author.id != '852610602387111948' && msg.author.id != '213585600098467841') return;

        const [discordID, count] = args;
        const member = await msg.guild?.members.resolve(discordID)
        const player = await Player.getPlayer(member!);

        for (let i = 0; i < parseInt(count); i++) {
            await MiningPickReward.reward(player);
        }

        await MiningPickReward.setUpperLimit(player);
        const announce = `Ares awarded <@${player.id}> with ${count} mining picks!`;

        msg.channel.send(`Added ${count} picks to ${player.name}`)
        client.logChannel.send(announce)

    }
}
