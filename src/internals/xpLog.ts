import assert from 'assert';
import { oneLine } from 'common-tags';
import { Message } from 'discord.js';
import { DateTime } from 'luxon';
import { getChallengeId, getConvertTable } from '../db/monthlyChallenge';
import { addBuff } from '../db/player';
import { getTimer, setTimer, TimerType } from '../db/timer';
import {
  createEntry, getXPEntry, resetXPEntry, setXPEntry,
} from '../db/xpEntry';
import { FragmentReward } from './FragmentReward';
import { client } from '../main';
import { Buff, BUFF_LIMIT, XP_THRESHOLD } from '../internals/Buff';
import { Player } from '../internals/Player';
import { bold, getLevel, getXp } from '../internals/utils';
import { MiningPickReward } from './MiningPickReward';
import { RankRole } from './Rank';
import { removeInventory } from '../db/inventory';

const rgx = /^Registered\sDay:\s(?<day>\d+)\s.*Progress:\s(?<value>-?\d+[,|.]?\d*)\s(?<valueType>\w+).*$/;

//we need the day, value, and value type
const tests = `
Registered Day: 7 Progress: 6641 steps
Registered Day: 8 Progress: 1 yoga
Registered Day: 8 Progress: 1 strength
Registered Day: 8 Added Progress: 10,7 cyclingkm New Progress: 10,7 cyclingkm
Registered Day: 7 Added Progress: 14,81 cyclingkm New Progress: 17,810001 cyclingkm
Registered Day: 7 Added Progress: 14.81 cyclingkm New Progress: 17.810001 cyclingkm
Registered Day: 7 Added Progress: 14.81 cyclingkm New Progress: 7.8 cyclingkm
Registered Day: 7 Added Progress: 14.81 cyclingkm New Progress: 0.5 cyclingkm
`;

const result = [
  { value: '6641', valueType: 'steps' },
  { value: '1', valueType: 'yoga' },
  { value: '1', valueType: 'strength' },
  { value: '10,7', valueType: 'cyclingkm' },
  { value: '17,810001', valueType: 'cyclingkm' },
  { value: '17.810001', valueType: 'cyclingkm' },
  { value: '7.8', valueType: 'cyclingkm' },
  { value: '0.5', valueType: 'cyclingkm' },
];

const lines = tests.split('\n').filter((x) => !!x);

for (let i = 0; i < lines.length; i++) {
  const matches = lines[i].match(rgx)!;
  const { value, valueType } = matches.groups!;
  assert.strictEqual(value, result[i].value);
  assert.strictEqual(valueType, result[i].valueType);
}

export async function xpLog(msg: Message, content?: string) {

  const member = msg.guild?.members.cache.get(client.xpLogTriggers);
  if (!member) return;

  const lines = content?.split('\n') || msg.content.split('\n');
  let accXP = 0;

  for (const line of lines) {
    const matches = line.match(rgx);
    if (!matches || !matches.groups) return;

    const { value, valueType } = matches.groups;
    const channelID = process.env.ENV === 'DEV'
      ? '859483633534238762' : msg.channel.id;
    const challengeId = await getChallengeId(channelID);
    const tag = `${valueType}-${challengeId}`;
    const convertTable = await getConvertTable();
    const multiplier = convertTable.get(tag);

    if (!multiplier) return;

    const point = parseInt(value) * multiplier;
    const xp = Math.round(getXp(point));
    const player = await Player.getPlayer(member);
    const totalXp = player.xp;
    const currentLevel = player.level;
    const prevXp = totalXp - Math.max(0, xp);
    const prevLevel = getLevel(prevXp);
    const { name } = player;

    client.logChannel.send(`${name} has earned \`${xp} xp\`!`);

    //remove mining picks
    if (xp < 0) {

      const pickCount = Math.floor(Math.abs(xp) / 10);
      for (let i = 0; i < pickCount; i++) {

        await removeInventory(member.id, 'pick_mining')
        await MiningPickReward.setUpperLimit(player);

      }
      msg.channel.send(`You have lost ${bold(pickCount)} mining picks.`)
      return;

    }

    accXP += xp;

    // workout buff
    const timer = await getTimer(TimerType.Buff, member.id);
    const day = parseInt(matches.groups.day);
    let xpEntry = await getXPEntry(challengeId, day, member.id);

    if (xpEntry) {
      !timer && await setXPEntry(xpEntry.ID, xp);
    } else {
      await createEntry(challengeId, day, member.id, xp);
    }

    xpEntry = await getXPEntry(challengeId, day, member.id);

    if (xpEntry.XP >= XP_THRESHOLD && !timer) {
      await resetXPEntry(challengeId, day, member.id);

      const buff = Buff.random();
      const expireDate = DateTime.now().plus(BUFF_LIMIT).toISO();
      setTimer(TimerType.Buff, player.id, expireDate);
      addBuff(player.id, buff.id);

      client.logChannel.send(
        oneLine`Ares has granted ${member} a 2 hour ${buff.name}
        for getting 10 points in the monthly challenge today!`,
      );

      msg.channel.send(
        oneLine`Ares has granted you a **2 hour** ${bold(buff.name)}
      for getting **10 points** in the monthly challenge today!`,
      );


    }

    if (currentLevel !== prevLevel) {
      client.logChannel.send(`${name} is now on **level ${currentLevel}**`);

      msg.channel.send(`You are now on **level ${currentLevel}**`);


      await client.mainGuild.roles.fetch();

      const rank = new RankRole();
      const newRankRole = rank.getRankRole(player.level);
      const currentRankRole = rank.getCurrentRole(player.member);

      if (currentRankRole !== newRankRole) {
        if (currentRankRole) {
          player.member.roles.remove(currentRankRole);
        }

        player.member.roles.add(newRankRole);

        client.logChannel.send(
          `Ares has promoted ${player.member} to ${bold(newRankRole.name)}!`,
        );


        msg.channel.send(
          `Ares has promoted you to ${bold(newRankRole.name)}!`,
        );

      }
    }
  }

  const player = await Player.getPlayer(member);
  // fragment reward
  if (player.xp >= player.fragmentReward) {
    if (FragmentReward.random()) {
      const fragment = await FragmentReward.reward(player);
      client.logChannel.send(
        oneLine`${player.member} has been awarded a **${fragment.name}** by Ares
        himself for great effort in working out.  Keep up the good work!`,
      );

      msg.channel.send(
        oneLine`You have been awarded a **${fragment.name}** by Ares
        himself for great effort in working out.  Keep up the good work!`,
      );


    }

    // set new upper limit
    FragmentReward.setUpperLimit(player);
  }

  // mining pick reward

  if (player.xp >= player.miningPickReward) {
    const rewardBefore = MiningPickReward.totalLevelPassed(player.xp - accXP);
    const rewardAfter = MiningPickReward.totalLevelPassed(player.xp);
    const rewardCount = rewardAfter - rewardBefore;

    if (rewardCount < 1) return;

    for (let i = 0; i < rewardCount; i++) {
      await MiningPickReward.reward(player);
    }

    client.logChannel.send(
      `${player.member} has found **x${rewardCount} Mining Pick** by working out!`,
    );

    msg.channel.send(
      `You have found **x${rewardCount} Mining Pick** by working out!`,
    );


    await MiningPickReward.setUpperLimit(player);

  }
}
