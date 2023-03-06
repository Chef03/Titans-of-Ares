import { TextChannel } from 'discord.js';
import path from 'path';
import { xpLog } from './internals/xpLog';
import { energyMainLoop } from './internals/energy';
import { Buff } from './internals/Buff';
import Client from './internals/Client';
import { TeamArena } from './internals/TeamArena';
import { SquadBoss } from './internals/Squadboss';
import { Upload } from './internals/Upload';

export const client = new Client(path.resolve(__dirname, process.env.DB!));

client.commandManager.verbose = true;

client.addBlockingPollHandler(energyMainLoop);
client.addBlockingPollHandler(Buff.mainLoop);
client.addBlockingPollHandler(TeamArena.mainLoop);
client.addBlockingPollHandler(SquadBoss.mainLoop);
client.addBlockingPollHandler(Upload.mainLoop);


client.commandManager.registerCommands(path.resolve(__dirname, './commands'));

client.bot.once('ready', async () => {
  console.log('Bot is ready');
  const guild = await client.bot.guilds.fetch(client.serverID);
  const channels = guild.channels.cache;
  client.mainGuild = guild;
  client.logChannel = channels.get(client.xpLogChannelID) as TextChannel;
  client.squadBossChannel = channels.get(client.squadBossChannelID) as TextChannel;
  client.mainTextChannel = channels.get(client.mainTextChannelID) as TextChannel;
  client.teamArenaChannel = channels.get(client.teamArenaChannelID) as TextChannel;
  client.startPollEvent();

});


client.bot.on('message', async (msg) => {
  const words = msg.content.split(' ');
  const command = words[0];
  const authorID = msg.author.id;

  if (
    msg.content.startsWith('Registered')
    && (authorID === client.oldBotID || authorID === client.devID)
  ) {
    xpLog(msg);
  } else if ((command.startsWith('!') || command.startsWith('$upload')) && !msg.author.bot) {
    client.xpLogTriggers = authorID;
  }
  if (!command.startsWith(client.prefix) || msg.author.bot) {
    return;
  }

  if (client.activePlayers.has(authorID)) {
    return msg.channel.send('There is already another command running');
  }
  if (!command.startsWith('$upload')) {
    client.activePlayers.add(authorID);
  }
  await client.commandManager.handleMessage(msg);
  client.activePlayers.delete(authorID);
});
