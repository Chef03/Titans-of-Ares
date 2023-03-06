import { oneLine } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { DateTime } from 'luxon';
import { addDayEntry, ChallengeName, getCurrentChallenge, OverlapError, registerDayEntry, replaceDayEntry } from '../db/monthlyChallenge';
import { ButtonHandler } from '../internals/ButtonHandler';
import Command from '../internals/Command';
import { Leaderboard } from '../internals/Leaderboard';
import { Player } from '../internals/Player';
import { BLUE_BUTTON, bold, nukeChannel, RED_BUTTON } from '../internals/utils';
import { client } from '../main';

export function getActivityName(name: string): ChallengeName | null {

    const names: ChallengeName[] = ["steps"
        , "cyclingkm"
        , "cyclingmi"
        , "meditation"
        , "weightlift"
        , "ringbonus"
        , "weekstreak"
        , "levelup"
        , "rankup"
        , "workout"
        , "othercardio"
        , "strength"
        , "yoga10"
        , "yoga30"
        , "meditation10"
        , "meditation30"
        , "rowingkm"
        , "rowingmi"
        , "get10walks"
        , "get10cycling"
        , "readabook"
        , "diary"
        , "workoutselfie"
        , "personalphoto"
        , "personalgoal"
        , "points"
        , "weekstreak"]

    let parsedName: ChallengeName = "points";
    names.map(existing => {
        if (existing == name) {
            parsedName = existing;
        }
    })
    return parsedName;

}

export default class extends Command {
    name = 'add';

    async exec(msg: Message, args: string[]) {

        if (msg.author.id != '852610602387111948' && msg.author.id != '213585600098467841') return;

        const date = DateTime.now().setLocale('en-US');

        const challenge = await getCurrentChallenge();
        const [discordID, day, activityName, rewardAmount] = args;
        const member = await msg.guild?.members.resolve(discordID)
        const player = await Player.getPlayer(member!);
        const challengeName: ChallengeName = getActivityName(activityName)!;

        try {

            await registerDayEntry(
                player.id,
                parseInt(day),
                challenge.ID,
                challengeName,
                parseInt(rewardAmount)
            );

            msg.channel.send(`Added **${rewardAmount} ${challengeName}** to **${player.name}** on **${day} ${date.monthLong}**`)
            client.logChannel.send(`Ares awarded <@${player.id}> with **${rewardAmount} ${challengeName}**`)

        }



        catch (e: unknown) {

            console.error(e);

            const err = e as OverlapError;
            const amount = err.dayEntry.Value == 1 ? "a" : err.dayEntry.Value;

            const question = oneLine`Player already registered ${bold(amount)} ${activityName} on
        ${bold(date.monthLong)} ${bold(day)}. Do you want to
        replace or add points on this day?`;

            const menu = new ButtonHandler(msg, question);

            menu.addButton(BLUE_BUTTON, "replace", async () => {

                await replaceDayEntry(
                    player.id,
                    parseInt(day),
                    challenge.ID,
                    challengeName,
                    parseInt(rewardAmount)
                );

                await msg.channel.send(`Successfully replaced`);
                await client.logChannel.send(`Ares awarded <@${player.id}> with **${rewardAmount} ${challengeName}**`)

            });

            menu.addButton(RED_BUTTON, "add points", async () => {

                await addDayEntry(
                    player.id,
                    parseInt(day),
                    challenge.ID,
                    challengeName,
                    parseInt(rewardAmount)
                );

                msg.channel.send(`Successfully added`);
                await client.logChannel.send(`Ares awarded <@${player.id}> with **${rewardAmount} ${challengeName}**`)

            });

            menu.addCloseButton();
            await menu.run();
        }

        const leaderboard = new Leaderboard()
        await leaderboard.init(challenge);

        const images = await leaderboard.generateImage()

        await nukeChannel(leaderboard.channel);

        await Promise.all(images.map((image, i) => {

            const embed = new MessageEmbed()
            embed.attachFiles([image]);
            embed.setImage(`attachment://page${i + 1}.jpg`);
            return leaderboard.channel.send(embed)

        }))


    }
}
