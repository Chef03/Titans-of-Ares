import { Message, MessageEmbed } from 'discord.js';
import { dbGet, dbRun } from '../db/promiseWrapper';
import { saveSquad } from '../db/squad';
import { ButtonHandler } from '../internals/ButtonHandler';
import Command from '../internals/Command';
import { Prompt } from '../internals/Prompt';
import { BLUE_BUTTON, WHITE_BUTTON } from '../internals/utils';
import { client } from '../main';

const Confirmation = async (message: Message, squadName: string, position: string) => {
  const sql = 'UPDATE Player SET SquadBossEnergy = 0 WHERE DiscordID = $userID';
  await dbRun(sql, { $userID: message.author.id });

  const memberSql = 'INSERT INTO squadMembers (discordID, squadName, position) VALUES ($userID, $squadName, $position)';

  await dbRun(memberSql, { $userID: message.author.id, $squadName: squadName, $position: position });

  message.channel.send(`\`${squadName}\` created! Other players can now apply for your Squad! To view your applications press: $squadboss`);
  client.squadBossChannel.send(`Notice: <@${message.author.id}> has created a squad named: \`${squadName}\`. Press $squadboss if you want to join!`);
};

export default class CreateSquad extends Command {
  name = 'createsquad';

  async exec(message: Message, args?: string[]) {


    if(message.channel.type === 'dm') return;


    const prompt = new Prompt(message);
    const squadName = await prompt.ask('Enter your squad\'s name:');

    const embed = new MessageEmbed()
      .setDescription(`Squad Name: \`${squadName}\` \n Choose your position in the formation of the squad when fighting the boss. You can always change this later.`);

    prompt.asked_question?.delete();

    const exists = await dbGet('SELECT * FROM squads WHERE name = $name', { $name: squadName });

    if (exists) return message.channel.send(`A squad with the name \`${squadName}\` already exists, please try again`);

    const menu = new ButtonHandler(message, embed, message.author.id);

    menu.addButton(BLUE_BUTTON, 'Front Row', async () => {
      await saveSquad(squadName, message.member!);
      Confirmation(message, squadName, 'front');
    });

    menu.addButton(WHITE_BUTTON, 'Back Row', async () => {
      await saveSquad(squadName, message.member!);
      Confirmation(message, squadName, 'back');
    });

    menu.addCloseButton();
    menu.run();
  }
}
