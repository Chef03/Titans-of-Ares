import { Message, MessageEmbed } from 'discord.js';
import { DateTime } from 'luxon';
import { dbGet, dbRun } from '../db/promiseWrapper';
import { Squad } from '../db/squad';
import { ButtonHandler } from '../internals/ButtonHandler';
import Command from '../internals/Command';
import { dmOwner } from '../internals/Pagination';
import { Player } from '../internals/Player';
import { BLUE_BUTTON, WHITE_BUTTON } from '../internals/utils';
import { client } from '../main';
import { squadMember } from './SquadBoss';
import { TeamArena } from '../internals/TeamArena';

export default class extends Command {
  name = 'join';

  async exec(msg: Message, args: string[]) {


    if (msg.channel.type === 'dm') return;


    const player = await Player.getPlayer(msg.member!);
    const now = DateTime.now().plus({ days: 7 });
    const date = TeamArena.getMondayDate(now).toISO();
    const done = DateTime.fromISO(date)

    let nextMonday = TeamArena.getMondayDate(done).set({ hour: 7, minute: 0 });
    const timeLeft = nextMonday.diffNow(['hour', 'minute', 'second']);
    const formattedTime = timeLeft.toFormat('hh:mm:ss');


    if (player.squadBossEnergy < 1) {

      return msg.channel.send(`No squad boss energy! Squad boss energy gets replenished in: \`${formattedTime}\` (Hours:Minutes:Seconds)`)

    }


    const squadId = args[0];
    const squad = await dbGet<Squad>('SELECT * FROM squads WHERE id = $id', { $id: squadId });
    if (!squad) return msg.channel.send('Squad was not found.');
    if (squad.memberCount >= 5) return msg.channel.send('This squad is full.');

    const squadMember = await dbGet<squadMember>('SELECT * FROM squadMembers WHERE discordID = $id', { $id: msg.author.id });

    if (squadMember) return msg.channel.send('You are already a part of a squad.');

    const handler = new ButtonHandler(msg, new MessageEmbed().setTitle(`Application for \`${squad.name}\``).setDescription('Choose a position for squadboss, you can always change this later.'), msg.author.id);

    handler.addButton(BLUE_BUTTON, 'Front Row', async () => {
      // const valid = await checkPositions(squadName, 'front')

      // if (!valid) return this.msg.channel.send(`All front slots are currently taken, consider picking back or contact the team leader`)

      await dbRun('INSERT INTO applications (discordID, position, squadName) VALUES ($userID, $position, $squadName)', {
        $userID: msg.author.id,
        $position: 'front',
        $squadName: squad.name,
      });

      const sql = 'UPDATE Player SET SquadBossEnergy = 0 WHERE DiscordID = $userID';
      await dbRun(sql, { $userID: msg.author.id });

      await dmOwner({
        id: msg.author.id,
        squadName: squad.name,
      }, `\`${msg.author.username}\` has applied for your squad! Please use $squadboss in the daily-commands channel to accept or reject this applicant.`);


      client.squadBossChannel.send(`${msg.author.username} has applied to \`${squad.name}\``)
      msg.channel.send(`You have succesfully applied for \`${squad.name}\`! The squad leader will have the option to accept or reject your application.`);

      //
    });

    handler.addButton(WHITE_BUTTON, 'Back Row', async () => {

      await dbRun('INSERT INTO applications (discordID, position, squadName) VALUES ($userID, $position, $squadName)', {
        $userID: msg.author.id,
        $position: 'back',
        $squadName: squad.name,
      });

      const sql = 'UPDATE Player SET SquadBossEnergy = 0 WHERE DiscordID = $userID';
      await dbRun(sql, { $userID: msg.author.id });



      await dmOwner({
        id: msg.author.id,
        squadName: squad.name,
      }, `\`${msg.author.username}\` has applied to your squad! Please use $squadboss to accept or reject this applicant.`);


      client.squadBossChannel.send(`${msg.author.username} has applied to \`${squad.name}\``)
      msg.channel.send(`You have succesfully applied to \`${squad.name}\`! The squad leader will have the option to accept or reject your application.`);

      //
    });

    handler.addCloseButton();

    handler.run();
  }
}
