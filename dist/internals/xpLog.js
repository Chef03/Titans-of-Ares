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
const rgx = /^Registered\sDay:\s(?<day>\d+)\s.*Progress:\s(?<value>\d+[,|.]?\d*)\s(?<valueType>\w+).*$/;
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
async function xpLog(msg) {
    const member = msg.guild?.members.cache.get(main_1.client.xpLogTriggers);
    if (!member)
        return;
    const lines = msg.content.split('\n');
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
        const prevXp = totalXp - xp;
        const prevLevel = (0, utils_1.getLevel)(prevXp);
        const { name } = player;
        main_1.client.logChannel.send(`${name} has earned \`${xp} xp\`!`);
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
        }
        if (currentLevel !== prevLevel) {
            main_1.client.logChannel.send(`${name} is now on **level ${currentLevel}**`);
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
        MiningPickReward_1.MiningPickReward.setUpperLimit(player);
    }
}
exports.xpLog = xpLog;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBMb2cuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL3hwTG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLG9EQUE0QjtBQUM1Qiw2Q0FBc0M7QUFFdEMsaUNBQWlDO0FBQ2pDLDZEQUF5RTtBQUN6RSx5Q0FBdUM7QUFDdkMsdUNBQTREO0FBQzVELDJDQUV1QjtBQUN2QixxREFBa0Q7QUFDbEQsa0NBQWlDO0FBQ2pDLDRDQUFtRTtBQUNuRSxnREFBNkM7QUFDN0MsOENBQTJEO0FBQzNELHlEQUFzRDtBQUN0RCxpQ0FBa0M7QUFFbEMsTUFBTSxHQUFHLEdBQUcsMkZBQTJGLENBQUM7QUFFeEcsTUFBTSxLQUFLLEdBQUc7Ozs7Ozs7OztDQVNiLENBQUM7QUFFRixNQUFNLE1BQU0sR0FBRztJQUNiLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFO0lBQ3JDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO0lBQ2pDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFO0lBQ3JDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFO0lBQ3pDLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFO0lBQzlDLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFO0lBQzlDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFO0lBQ3hDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFO0NBQ3pDLENBQUM7QUFFRixNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMs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