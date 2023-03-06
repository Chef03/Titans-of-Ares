"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpLog = void 0;
const assert_1 = __importDefault(require("assert"));
const common_tags_1 = require("common-tags");
const luxon_1 = require("luxon");
const monthlyChallenge_1 = require("../db/monthlyChallenge");
const player_1 = require("../db/player");
const timer_1 = require("../db/timer");
const xpEntry_1 = require("../db/xpEntry");
const FragmentReward_1 = require("./FragmentReward");
const main_1 = require("../main");
const Buff_1 = require("../internals/Buff");
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
const MiningPickReward_1 = require("./MiningPickReward");
const Rank_1 = require("./Rank");
const inventory_1 = require("../db/inventory");
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
    const matches = lines[i].match(rgx);
    const { value, valueType } = matches.groups;
    assert_1.default.strictEqual(value, result[i].value);
    assert_1.default.strictEqual(valueType, result[i].valueType);
}
async function xpLog(msg, content) {
    const member = msg.guild?.members.cache.get(main_1.client.xpLogTriggers);
    if (!member)
        return;
    const lines = content?.split('\n') || msg.content.split('\n');
    let accXP = 0;
    for (const line of lines) {
        const matches = line.match(rgx);
        if (!matches || !matches.groups)
            return;
        const { value, valueType } = matches.groups;
        const channelID = process.env.ENV === 'DEV'
            ? '859483633534238762' : msg.channel.id;
        const challengeId = await (0, monthlyChallenge_1.getChallengeId)(channelID);
        const tag = `${valueType}-${challengeId}`;
        const convertTable = await (0, monthlyChallenge_1.getConvertTable)();
        const multiplier = convertTable.get(tag);
        if (!multiplier)
            return;
        const point = parseInt(value) * multiplier;
        const xp = Math.round((0, utils_1.getXp)(point));
        const player = await Player_1.Player.getPlayer(member);
        const totalXp = player.xp;
        const currentLevel = player.level;
        const prevXp = totalXp - Math.max(0, xp);
        const prevLevel = (0, utils_1.getLevel)(prevXp);
        const { name } = player;
        main_1.client.logChannel.send(`${name} has earned \`${xp} xp\`!`);
        //remove mining picks
        if (xp < 0) {
            const pickCount = Math.floor(Math.abs(xp) / 10);
            for (let i = 0; i < pickCount; i++) {
                await (0, inventory_1.removeInventory)(member.id, 'pick_mining');
                await MiningPickReward_1.MiningPickReward.setUpperLimit(player);
            }
            msg.channel.send(`You have lost ${(0, utils_1.bold)(pickCount)} mining picks.`);
            return;
        }
        accXP += xp;
        // workout buff
        const timer = await (0, timer_1.getTimer)(timer_1.TimerType.Buff, member.id);
        const day = parseInt(matches.groups.day);
        let xpEntry = await (0, xpEntry_1.getXPEntry)(challengeId, day, member.id);
        if (xpEntry) {
            !timer && await (0, xpEntry_1.setXPEntry)(xpEntry.ID, xp);
        }
        else {
            await (0, xpEntry_1.createEntry)(challengeId, day, member.id, xp);
        }
        xpEntry = await (0, xpEntry_1.getXPEntry)(challengeId, day, member.id);
        if (xpEntry.XP >= Buff_1.XP_THRESHOLD && !timer) {
            await (0, xpEntry_1.resetXPEntry)(challengeId, day, member.id);
            const buff = Buff_1.Buff.random();
            const expireDate = luxon_1.DateTime.now().plus(Buff_1.BUFF_LIMIT).toISO();
            (0, timer_1.setTimer)(timer_1.TimerType.Buff, player.id, expireDate);
            (0, player_1.addBuff)(player.id, buff.id);
            main_1.client.logChannel.send((0, common_tags_1.oneLine) `Ares has granted ${member} a 2 hour ${buff.name}
        for getting 10 points in the monthly challenge today!`);
            msg.channel.send((0, common_tags_1.oneLine) `Ares has granted you a **2 hour** ${(0, utils_1.bold)(buff.name)}
      for getting **10 points** in the monthly challenge today!`);
        }
        if (currentLevel !== prevLevel) {
            main_1.client.logChannel.send(`${name} is now on **level ${currentLevel}**`);
            msg.channel.send(`You are now on **level ${currentLevel}**`);
            await main_1.client.mainGuild.roles.fetch();
            const rank = new Rank_1.RankRole();
            const newRankRole = rank.getRankRole(player.level);
            const currentRankRole = rank.getCurrentRole(player.member);
            if (currentRankRole !== newRankRole) {
                if (currentRankRole) {
                    player.member.roles.remove(currentRankRole);
                }
                player.member.roles.add(newRankRole);
                main_1.client.logChannel.send(`Ares has promoted ${player.member} to ${(0, utils_1.bold)(newRankRole.name)}!`);
                msg.channel.send(`Ares has promoted you to ${(0, utils_1.bold)(newRankRole.name)}!`);
            }
        }
    }
    const player = await Player_1.Player.getPlayer(member);
    // fragment reward
    if (player.xp >= player.fragmentReward) {
        if (FragmentReward_1.FragmentReward.random()) {
            const fragment = await FragmentReward_1.FragmentReward.reward(player);
            main_1.client.logChannel.send((0, common_tags_1.oneLine) `${player.member} has been awarded a **${fragment.name}** by Ares
        himself for great effort in working out.  Keep up the good work!`);
            msg.channel.send((0, common_tags_1.oneLine) `You have been awarded a **${fragment.name}** by Ares
        himself for great effort in working out.  Keep up the good work!`);
        }
        // set new upper limit
        FragmentReward_1.FragmentReward.setUpperLimit(player);
    }
    // mining pick reward
    if (player.xp >= player.miningPickReward) {
        const rewardBefore = MiningPickReward_1.MiningPickReward.totalLevelPassed(player.xp - accXP);
        const rewardAfter = MiningPickReward_1.MiningPickReward.totalLevelPassed(player.xp);
        const rewardCount = rewardAfter - rewardBefore;
        if (rewardCount < 1)
            return;
        for (let i = 0; i < rewardCount; i++) {
            await MiningPickReward_1.MiningPickReward.reward(player);
        }
        main_1.client.logChannel.send(`${player.member} has found **x${rewardCount} Mining Pick** by working out!`);
        msg.channel.send(`You have found **x${rewardCount} Mining Pick** by working out!`);
        await MiningPickReward_1.MiningPickReward.setUpperLimit(player);
    }
}
exports.xpLog = xpLog;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBMb2cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL3hwTG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9EQUE0QjtBQUM1Qiw2Q0FBc0M7QUFFdEMsaUNBQWlDO0FBQ2pDLDZEQUF5RTtBQUN6RSx5Q0FBdUM7QUFDdkMsdUNBQTREO0FBQzVELDJDQUV1QjtBQUN2QixxREFBa0Q7QUFDbEQsa0NBQWlDO0FBQ2pDLDRDQUFtRTtBQUNuRSxnREFBNkM7QUFDN0MsOENBQTJEO0FBQzNELHlEQUFzRDtBQUN0RCxpQ0FBa0M7QUFDbEMsK0NBQWtEO0FBRWxELE1BQU0sR0FBRyxHQUFHLDZGQUE2RixDQUFDO0FBRTFHLHdDQUF3QztBQUN4QyxNQUFNLEtBQUssR0FBRzs7Ozs7Ozs7O0NBU2IsQ0FBQztBQUVGLE1BQU0sTUFBTSxHQUFHO0lBQ2IsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUU7SUFDckMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUU7SUFDakMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUU7SUFDckMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUU7SUFDekMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUU7SUFDOUMsRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUU7SUFDOUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUU7SUFDeEMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUU7Q0FDekMsQ0FBQztBQUVGLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFD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