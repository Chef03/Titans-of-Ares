import { Message, MessageEmbed } from 'discord.js';
import { squadMember } from '../commands/SquadBoss';
import { dbAll, dbGet, dbRun } from '../db/promiseWrapper';
import { Squad } from '../db/squad';
import { client } from '../main';
import { ButtonHandler } from './ButtonHandler';
import { FightBoss } from './FightBoss';
import { IPlayer } from './Player';
import {
  BLUE_BUTTON, LEFTMOST_ARROW_BUTTON, LEFT_ARROW_BUTTON, RED_BUTTON, RIGHTMOST_ARROW_BUTTON, RIGHT_ARROW_BUTTON, WHITE_BUTTON,
} from './utils';

export interface applicant {
  id: string,
  squadName: string

}

export async function dmOwner(applicant: applicant, message: string) {
  const squad: Squad = await dbGet('SELECT * FROM squads WHERE name = $name', { $name: applicant.squadName });
  const discordOwner = await client.bot.users.fetch(squad.owner);
  discordOwner.send(message);
}

export async function checkPositions(squadName: string, position: string) {
  const allMembers: squadMember[] = await dbAll('SELECT * FROM squadMembers WHERE squadName = $squadName', { $squadName: squadName });

  const front = allMembers.filter((member) => member.position === 'front');
  const back = allMembers.filter((member) => member.position === 'back');

  if (front.length === 4 && position === 'front') return false;
  if (back.length === 4 && position === 'back') return false;

  return true;
}

export class Pagination {
  constructor(
    private msg: Message,
    private pages: MessageEmbed[],
    private userID: string,
    private index = 0,
    private actionated = false,
    private applications = false,
    private battling = false,
  ) { }

  async run() {
    if (this.pages.length <= 0) throw new Error('cannot paginate with zero pages');

    const currentPage = this.pages[this.index];
    const menu = new ButtonHandler(this.msg, currentPage, this.userID);

    const prevPage = this.pages[this.index - 1];
    const nextPage = this.pages[this.index + 1];

    const pageHandler = (index: number) => async () => {
      const menu = new Pagination(this.msg, this.pages, this.userID, index, this.actionated, this.applications, this.battling);
      await menu.run();
    };

    if (prevPage) {
      if (this.pages.length > 2) {
        menu.addButton(
          LEFTMOST_ARROW_BUTTON,
          'go to first page',
          pageHandler(0),
        );
      }

      menu.addButton(
        LEFT_ARROW_BUTTON,
        'go to previous page',
        pageHandler(this.index - 1),
      );
    }

    if (nextPage) {
      menu.addButton(
        RIGHT_ARROW_BUTTON,
        'go to next page',
        pageHandler(this.index + 1),
      );

      if (this.pages.length > 2) {
        menu.addButton(
          RIGHTMOST_ARROW_BUTTON,
          'go to last page',
          pageHandler(this.pages.length - 1),
        );
      }
    }

    if (this.applications) {
      const squad: Squad = await dbGet('SELECT * FROM squads WHERE owner=$userID', { $userID: this.msg.author.id });
      const applicantID = this.pages[this.index].fields[0].value.replace(/[\\<>@#&!]/g, '');
      const position = this.pages[this.index].fields[1].value;
      const applicantDiscord = await client.bot.users.fetch(applicantID);

      menu.addButton(BLUE_BUTTON, 'Accept Application', async () => {
        await dbRun('DELETE FROM applications WHERE discordID = $userID', {
          $userID: applicantID,
        });

        await dbRun('INSERT INTO squadMembers (discordID, squadName, position) VALUES ($userID, $squadName, $position)', {
          $userID: applicantID,
          $squadName: squad.name,
          $position: position,

        });

        const discordUser = await client.bot.users.fetch(applicantID);
        discordUser.send(`Your application for squad \`${squad.name}\` has been accepted`);

        this.msg.channel.send(`You have accepted ${applicantDiscord.username}'s application`)

        client.squadBossChannel.send(`${applicantDiscord.username} has been accepted to \`${squad.name}\``);
      });

      menu.addButton(RED_BUTTON, 'Reject Application', async () => {

        await dbRun('DELETE FROM applications WHERE discordID = $userID', {
          $userID: applicantID,
        });

        await dbRun('UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID', { $userID: applicantDiscord.id });
        const discordUser = await client.bot.users.fetch(applicantID);

        this.msg.channel.send(`You have rejected ${applicantDiscord.username}'s application`)


        discordUser.send(`Your application for squad \`${squad.name}\` has been rejected`);

        applicantDiscord.send(`Sadly, the Squad leader has rejected ${applicantDiscord.username} to join \`${squad.name}\`. Find an other Squad with the $squadboss command!`);
      });
    }

    if (this.actionated) {
      menu.addButton(WHITE_BUTTON, 'Join', async () => {
        const squadName = this.pages[this.index].fields[0].value;

        const prompt = await this.msg.channel.send('Choose a position');

        const embed = new MessageEmbed()
          .setDescription(`Squad Name: \`${squadName}\` \n Choose your position in the formation of the squad when fighting the boss. You can always change this later.`);

        const discordApplicant = await client.bot.users.fetch(this.userID);

        const PositionMenu = new ButtonHandler(prompt, embed, this.userID);

        PositionMenu.addButton(BLUE_BUTTON, 'Front Row', async () => {
          // const valid = await checkPositions(squadName, 'front')

          // if (!valid) return this.msg.channel.send(`All front slots are currently taken, consider picking back or contact the team leader`)

          await dbRun('INSERT INTO applications (discordID, position, squadName) VALUES ($userID, $position, $squadName)', {
            $userID: this.userID,
            $position: 'front',
            $squadName: squadName,
          });

          const sql = 'UPDATE Player SET SquadBossEnergy = 0 WHERE DiscordID = $userID';
          await dbRun(sql, { $userID: this.userID });

          await dmOwner({
            id: this.userID,
            squadName,
          }, `\`${discordApplicant.username}\` has applied for your squad! Please use $squadboss to accept or reject this applicant.`);

          this.msg.channel.send(`You have succesfully applied for \`${squadName}\`! The squad leader will have the option to accept or reject your application.`);

          //
        });

        PositionMenu.addButton(WHITE_BUTTON, 'Back Row', async () => {
          const valid = await checkPositions(squadName, 'back');

          if (!valid) return this.msg.channel.send('All back slots are currently taken, consider picking back or contact the team leader');

          await dbRun('INSERT INTO applications (discordID, position, squadName) VALUES ($userID, $position, $squadName)', {
            $userID: this.userID,
            $position: 'back',
            $squadName: squadName,
          });

          await dmOwner({
            id: this.userID,
            squadName,
          }, `\`${discordApplicant.username}\` has applied for your squad! Please use $squadboss to accept or reject this applicant.`);

          this.msg.channel.send(`You have succesfully applied for \`${squadName}\`! The squad leader will have the option to accept or reject your application.`);

          //
        });

        PositionMenu.addCloseButton();

        PositionMenu.run();
      });
    }

    if (this.battling) {
      menu.addButton('⚔️', 'Battle', async () => {
        const bossName = this.pages[this.index].fields[0].value;
        const squad = await dbGet<Squad>('SELECT * FROM squads WHERE owner = $owner', { $owner: this.msg.author.id });
        const team = await dbAll<squadMember>('SELECT * FROM squadMembers WHERE squadName = $name', { $name: squad.name });
        FightBoss(this.msg, bossName, team);
      });
    }

    menu.addCloseButton();
    await menu.run();
  }
}
