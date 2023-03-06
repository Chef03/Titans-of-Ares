import { Message, MessageEmbed } from 'discord.js';
import Command from '../internals/Command';
import { Leaderboard } from '../internals/Leaderboard';
import { getChallengeByChannelID } from '../db/monthlyChallenge';


export default class extends Command {

    name = 'leaderboard';
    async exec(msg: Message, args: string[]) {

        const challenge = await getChallengeByChannelID(msg.channel.id);

        if (!challenge) return;

        const leaderboard = new Leaderboard()
        await leaderboard.init(challenge);

        const images = await leaderboard.generateImage();

        await Promise.all(images.map((image, i) => {

            const embed = new MessageEmbed()
            embed.attachFiles([image]);
            embed.setImage(`attachment://page${i + 1}.jpg`);
            return msg.channel.send(embed)

        }))



    }


}
