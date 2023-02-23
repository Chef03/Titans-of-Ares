import { Message, MessageEmbed, User } from 'discord.js';
import { DateTime } from 'luxon';
import { dbAll, dbGet, dbRun } from '../db/promiseWrapper';
import { getSquads } from '../db/squad';
import { ButtonHandler } from '../internals/ButtonHandler';
import Command from '../internals/Command';
import { dmOwner, Pagination } from '../internals/Pagination';
import { Player } from '../internals/Player';
import Battle, { chooseBoss } from '../internals/SquadBattle';
import { TeamArena } from '../internals/TeamArena';
import {
  BLACK_BUTTON, BLUE_BUTTON, RED_BUTTON, WHITE_BUTTON,
} from '../internals/utils';
import { client } from '../main';
import CreateSquad from './CreateSquad';

export interface dbSquad {
  name: string;
  owner: string;
  memberCount: number;
}

export interface squadMember {
  discordID: string;
  position: string;
  squadName: number;
}

export interface application {
  username: string,
  discordID: string;
  position: string;
  squadName: string;
}

export default class Squad extends Command {
  name = 'squadboss';
  aliases = ['sq', 'squad'];

  async exec(message: Message, _args: string[]) {

    if(message.channel.type === 'dm') return;

    const player = await Player.getPlayer(message.member!);

    const isMember = await dbGet<squadMember>('SELECT * FROM squadMembers WHERE discordID = $userID', {
      $userID: message.author.id,
    });

    const existingApplication: application = await dbGet('SELECT * FROM applications WHERE discordID = $userID', { $userID: message.author.id });


    const now = DateTime.now().plus({ days: 7 });
    const date = TeamArena.getMondayDate(now).toISO();
    const done = DateTime.fromISO(date)

    let nextMonday = TeamArena.getMondayDate(done).set({ hour: 7, minute: 0 });
    const timeLeft = nextMonday.diffNow(['hour', 'minute', 'second']);
    const formattedTime = timeLeft.toFormat('hh:mm:ss');



    if (player.squadBossEnergy < 1 && !isMember && !existingApplication) {

      return message.channel.send(`No squad boss energy! Squad boss energy gets replenished in: \`${formattedTime}\` (Hours:Minutes:Seconds)`)

    }


    const ownerSql = 'SELECT * FROM squads WHERE owner = $owner';
    const existingSquad = await dbGet<dbSquad>(ownerSql, { $owner: message.author.id });





    if (existingSquad) {

      const grabSql = 'SELECT * FROM squadMembers WHERE squadName = $squadName';
      const members = await dbAll<squadMember>(grabSql, { $squadName: existingSquad.name });

      const embed = new MessageEmbed()
        .setTitle(existingSquad.name);

      embed.description = '';

      let discordMembers = await Promise.all(members.map(async (member) => {

        try {
          const fetchedMember = await message.guild?.members.fetch(member.discordID);
          return { ...fetchedMember, position: member.position };
        }

        catch {

        }

      }));

      discordMembers = discordMembers.filter(member => member);

      discordMembers.map((member, i) => {
        embed.description += `\n${i + 1} - ${member!.user?.username} | ${member!.position}`;
      });

      if (!discordMembers.length) {
        embed.description = 'Squad is empty';
      }

      embed.setFooter(`Time to for next squad boss reset: ${formattedTime} (Hours:Minutes:Seconds)`);

      const menu = new ButtonHandler(message, embed, message.author.id);

      menu.addButton(BLUE_BUTTON, 'applications', async () => {
        const applications = await dbAll<application>('SELECT * FROM applications WHERE squadName = $squadName', {
          $squadName: existingSquad.name,
        });

        if (!applications.length) return message.channel.send('Your squad has no applications.');

        const embeds = await Promise.all(applications.map(async (application) => {
          const user = await client.bot.users.fetch(application.discordID);
          const embed = new MessageEmbed();
          embed.addField('User', `<@${user.id}>`);
          embed.addField('Position', application.position);
          return embed;
        }));

        const pagination = new Pagination(message, embeds, message.author.id, 0, false, true);

        pagination.run();

        // const createSquad = new CreateSquad()
        // await createSquad.exec(message)
      });

      menu.addButton(BLACK_BUTTON, 're-arrange', async () => {

        const arrangeEmbed = embed.setTitle('Re-Arrange');

        const handler = new ButtonHandler(message, arrangeEmbed, message.author.id);

        const buttons = [WHITE_BUTTON, BLACK_BUTTON, RED_BUTTON, BLUE_BUTTON, '🟢'];

        const discordMembers = await Promise.all(members.map(async (member) => {
          const fetchedMember = await message.guild?.members.fetch(member.discordID);
          return { ...fetchedMember, position: member.position };
        }));

        discordMembers.map((member, i) => {
          handler.addButton(buttons[i], member.user!.username!, () => {
            const handler = new ButtonHandler(message, embed, message.author.id);

            handler.addButton(BLUE_BUTTON, 'front', async () => {
              const fronts = await dbAll<squadMember>('SELECT * FROM squadMembers WHERE squadName = $squadName AND position = $position', { $squadName: existingSquad.name, $position: 'front' });

              if (fronts.length >= 4) return message.channel.send('You have maxed out your front row, please free up a slot.');

              await dbRun('UPDATE squadMembers SET position = \'front\' WHERE discordID = $userID', {

                $userID: member.user!.id,
              });

              message.channel.send(`${member.user?.username} was set to \`front\``);
            });

            handler.addButton(RED_BUTTON, 'back', async () => {
              const back = await dbAll<squadMember>('SELECT * FROM squadMembers WHERE squadName = $squadName AND position = $position', { $squadName: existingSquad.name, $position: 'back' });

              if (back.length >= 4) return message.channel.send('You have maxed out your back row, please free up a slot.');

              await dbRun('UPDATE squadMembers SET position = \'back\' WHERE discordID = $userID', {
                $userID: member.user!.id,
              });

              message.channel.send(`${member.user?.username} was set to \`back\``);
            });

            handler.addCloseButton();

            handler.run();
          });
        });

        handler.addCloseButton();
        handler.run();
      });

      menu.addButton(RED_BUTTON, 'remove squad', async () => {

        await dbRun('DELETE FROM squads WHERE name = $name AND owner = $owner', {
          $name: existingSquad.name,
          $owner: existingSquad.owner,
        });

        await dbRun('DELETE FROM squadMembers WHERE squadName = $name', {
          $name: existingSquad.name,
        });


        const applications = await dbAll<application>('SELECT * FROM applications WHERE squadName = $squadName', {
          $squadName: existingSquad.name,
        });


        await Promise.all(applications.map(application => {

          return dbRun(`UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID`, { $userID: application.discordID })

        }))

        await dbRun(`DELETE FROM applications WHERE squadName=$squadName`, { $squadName: existingSquad.name });



        await Promise.all(discordMembers.map(member => {

          return dbRun(`UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID=$userID`, { $userID: member?.user?.id });


        }))




        discordMembers.map((member) => {
          member!.user!.send!(`\`${message.author.username}\` has removed squad: \`${existingSquad.name}\` from squadboss`);
        });


        message.channel.send(`Removed squad \`${existingSquad.name}\` from squadboss.`);
        // const createSquad = new CreateSquad()
        // await createSquad.exec(message)
      });


      menu.addButton(WHITE_BUTTON, 'remove squad member', async () => {


        const arrangeEmbed = embed.setTitle('Squad Members');

        const handler = new ButtonHandler(message, arrangeEmbed, message.author.id);

        const buttons = [WHITE_BUTTON, BLACK_BUTTON, RED_BUTTON, BLUE_BUTTON, '🟢'];

        const discordMembers = await Promise.all(members.map(async (member) => {
          const fetchedMember = await message.guild?.members.fetch(member.discordID);
          return { ...fetchedMember, position: member.position };
        }));

        discordMembers.map((member, i) => {


          if (member.user?.id === message.author.id) return;

          handler.addButton(buttons[i], member.user!.username!, async () => {




            await dbRun('DELETE FROM squadMembers WHERE discordID = $userID AND squadName=$squadName', {

              $userID: member.user!.id,
              $squadName: existingSquad.name

            });

            await dbRun(`UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID`, { $userID: member.user?.id })

            message.channel.send(`${member.user?.username} has been removed from \`${existingSquad.name}\``);
            client.squadBossChannel.send(`${member.user?.username} has been removed from \`${existingSquad.name}\``);
            member.user?.send(`You have been removed from \`${existingSquad.name}\``)


          });
        });

        handler.addCloseButton();
        handler.run();


      });





      menu.addButton('⚔️', 'Battle', () => {
        const front = members.filter((member) => member.position === 'front');
        const back = members.filter((member) => member.position === 'back');

        if (!front.length || !back.length) {
          return message.channel.send('Your squad needs to at-least have 1 front and 1 back players.');
        }

        chooseBoss(message)
      });

      menu.addCloseButton();

      return menu.run();
    }


    if (isMember) {


      const grabSql = 'SELECT * FROM squadMembers WHERE squadName = $squadName';

      const members = await dbAll<squadMember>(grabSql, { $squadName: isMember.squadName });

      const embed = new MessageEmbed();
      embed.description = 'You can switch your squadboss position using the buttons below.\n';

      const discordMembers = await Promise.all(members.map(async (member) => {
        embed.setTitle(member.squadName);
        const fetchedMember = await message.guild?.members.fetch(member.discordID);
        return { ...fetchedMember, position: member.position };
      }));

      discordMembers.map((member, i) => {
        embed.description += `\n${i + 1} - ${member.user?.username} | ${member.position}`;
      });

      const handler = new ButtonHandler(message, embed, message.author.id);

      handler.addButton(RED_BUTTON, 'leave squad', async () => {

        await dbRun(`DELETE FROM squadMembers WHERE squadName = $squadName AND discordID = $discordID`, {
          $squadName: isMember.squadName,
          $discordID: isMember.discordID
        });

        await dbRun('UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID', { $userID: message.author.id });
        message.channel.send(`left squad \`${isMember.squadName}\``)


        const squad: any = await dbGet(`SELECT * FROM squads WHERE name=$squadName`, { $squadName: isMember.squadName })
        const owner: User = await client.bot.users.fetch(squad!.owner);

        owner.send(`${message.author.username} has decided to leave your squad \`${isMember.squadName}\``)

        client.squadBossChannel.send(`${message.author.username} has left \`${isMember.squadName}\``)



      })

      handler.addButton(BLACK_BUTTON, 'switch position', () => {


        const handler = new ButtonHandler(message, embed, message.author.id);

        handler.addButton(BLUE_BUTTON, 'front', async () => {

          const fronts = await dbAll<squadMember>('SELECT * FROM squadMembers WHERE squadName = $squadName AND position = $position', { $squadName: isMember.squadName, $position: 'front' });

          if (fronts.length >= 4) return message.channel.send('You have maxed out your front row, please free up a slot.');

          await dbRun('UPDATE squadMembers SET position = \'front\' WHERE discordID = $userID', {

            $userID: message.author!.id,

          });

          message.channel.send(`${message.author.username} was set to \`front\``);

        });

        handler.addButton(RED_BUTTON, 'back', async () => {

          const back = await dbAll<squadMember>('SELECT * FROM squadMembers WHERE squadName = $squadName AND position = $position', { $squadName: isMember.squadName, $position: 'back' });

          if (back.length >= 4) return message.channel.send('You have maxed out your back row, please free up a slot.');

          await dbRun('UPDATE squadMembers SET position = \'back\' WHERE discordID = $userID', {

            $userID: message.author!.id,

          });

          message.channel.send(`${message.author.username} was set to \`back\``);



        });

        handler.addCloseButton();

        handler.run();


      })

      handler.addCloseButton();
      return handler.run();
    }


    if (existingApplication) {
      const embed = new MessageEmbed().setDescription('You have already applied for a squad. Do you want to cancel this application?');
      const handler = new ButtonHandler(message, embed, message.author.id);
      handler.addButton(BLUE_BUTTON, 'Yes', async () => {
        await dbRun('DELETE FROM applications WHERE discordID = $userID', { $userID: message.author.id });
        await dbRun('UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID', { $userID: message.author.id });
        await dmOwner({
          id: message.author.id,
          squadName: existingApplication.squadName,
        }, `${message.author.username} has withdrawn their application from your squad.`);
        message.channel.send(`Your application for \`${existingApplication.squadName}\` has been withdrawn! `);
      });

      handler.addButton(RED_BUTTON, 'No', () => null);
      handler.run();
    } else {

      if (player.squadBossEnergy < 1) {
        return message.channel.send(`You have no Squad Boss Energy left. It will be recharged in \`${formattedTime}\` (Hours:Minutes:Seconds)`);
      }

      const embed = new MessageEmbed();
      embed.setTitle('Squad Boss');
      embed.setDescription('Welcome to the Squad Boss menu! Here you can fight an Ares Boss with your squad for loot. Do you want to create or join a squad?');
      embed.setFooter(`The remaining time for this week's squad boss is ${formattedTime} (Hours:Minutes:Seconds)`);

      const menu = new ButtonHandler(message, embed, message.author.id);

      menu.addButton(BLUE_BUTTON, 'create squad', async () => {
        const createSquad = new CreateSquad();
        await createSquad.exec(message);
      });
      menu.addButton(WHITE_BUTTON, 'join squad', async () => {
        const squads = await getSquads();

        if (!squads.length) {
          return message.channel.send('There are currently no squads');
        }

        const embed = new MessageEmbed()
          .setTitle('Squads')
          .setDescription('');

        squads.map((squad) => {
          embed.description += `\n${squad.id} - ${squad.name}`;
        });

        embed.setFooter('use $join <squad-number> to join a squad');

        message.channel.send(embed);
      });

      menu.addCloseButton();

      menu.run();
    }
  }
}
