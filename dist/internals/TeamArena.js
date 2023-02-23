"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamArena = exports.TeamArenaMember = exports.Phase = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const luxon_1 = require("luxon");
const promiseWrapper_1 = require("../db/promiseWrapper");
const teamArena_1 = require("../db/teamArena");
const main_1 = require("../main");
const List_1 = require("./List");
const Player_1 = require("./Player");
const utils_1 = require("./utils");
var Days;
(function (Days) {
    Days[Days["MONDAY"] = 1] = "MONDAY";
    Days[Days["TUESDAY"] = 2] = "TUESDAY";
    Days[Days["WEDNESDAY"] = 3] = "WEDNESDAY";
    Days[Days["THURSDAY"] = 4] = "THURSDAY";
    Days[Days["FRIDAY"] = 5] = "FRIDAY";
    Days[Days["SATURDAY"] = 6] = "SATURDAY";
    Days[Days["SUNDAY"] = 7] = "SUNDAY";
})(Days || (Days = {}));
var Phase;
(function (Phase) {
    Phase["SIGNUP_1"] = "signup_1";
    Phase["SIGNUP_2"] = "signup_2";
    Phase["SIGNUP_3"] = "signup_3";
    Phase["PREPARING"] = "preparing";
    Phase["BATTLE_1"] = "battle_1";
    Phase["BATTLE_2"] = "battle_2";
    Phase["BATTLE_3"] = "battle_3";
    Phase["REWARD"] = "reward";
})(Phase = exports.Phase || (exports.Phase = {}));
class TeamArenaMember {
    constructor(member, player) {
        this.id = member.DiscordID;
        this.created = luxon_1.DateTime.fromISO(member.Created);
        this.teamArenaID = member.TeamArenaID;
        this.team = member.Team;
        this.charge = member.Charge;
        this.score = member.Score;
        this.player = player;
    }
}
exports.TeamArenaMember = TeamArenaMember;
class TeamArena {
    constructor(teamArena, candidates) {
        this.teamArenaBanner = `${utils_1.CDN_LINK}852530378916888626/876009234918158347/red-team-vs-blue-team.jpg`;
        this.id = teamArena.ID;
        this.created = luxon_1.DateTime.fromISO(teamArena.Created);
        this.phase = teamArena.Phase;
        this.monday = TeamArena.getMondayDate(this.created).set({
            hour: 7,
            minute: 0,
        });
        this.messageID = teamArena.MessageID;
        this.candidates = candidates;
    }
    static async getCurrentArena() {
        let arena = await (0, teamArena_1.getCurrentArena)();
        if (!arena) {
            const now = luxon_1.DateTime.now().plus({ days: 7 });
            await (0, teamArena_1.createArena)(TeamArena.getMondayDate(now).toISO());
            arena = await (0, teamArena_1.getCurrentArena)();
        }
        await main_1.client.teamArenaChannel.guild.members.fetch();
        const members = await (0, teamArena_1.getCandidates)(arena.ID);
        const candidates = members
            .map((member) => {
            const guildMember = main_1.client.teamArenaChannel.guild.members.cache.get(member.DiscordID);
            return guildMember;
        })
            .filter((member) => Boolean(member))
            .map((member) => Player_1.Player.getPlayer(member));
        const players = (await Promise.all(candidates)).map((player) => new TeamArenaMember(members.find((x) => x.DiscordID === player.id), player));
        return new TeamArena(arena, List_1.List.from(players));
    }
    get timerUntilBattle() {
        const battleDate = this.monday.plus({ day: 3 });
        const timeLeft = battleDate.diffNow(['hour', 'minute', 'second']);
        return timeLeft.toFormat('hh:mm:ss');
    }
    get timerUntilReward() {
        const battleDate = this.monday.plus({ day: 5 });
        const timeLeft = battleDate.diffNow(['hour', 'minute', 'second']);
        return timeLeft.toFormat('hh:mm:ss');
    }
    static isSignUpPhase1(time) {
        return time.weekday >= Days.MONDAY && time.hour >= 7;
    }
    static isSignUpPhase2(time) {
        return time.weekday >= Days.TUESDAY && time.hour >= 7;
    }
    static isSignUpPhase3(time) {
        return time.weekday >= Days.TUESDAY && time.hour >= 19;
    }
    static isPreparingPhase(time) {
        return time.weekday >= Days.WEDNESDAY && time.hour >= 7;
    }
    static isBattlePhase1(time) {
        return time.weekday >= Days.THURSDAY && time.hour >= 7;
    }
    static isBattlePhase2(time) {
        return time.weekday >= Days.FRIDAY && time.hour >= 7;
    }
    static isBattlePhase3(time) {
        return time.weekday >= Days.FRIDAY && time.hour >= 19;
    }
    static isRewardPhase(time) {
        return time.weekday >= Days.SATURDAY && time.hour >= 7;
    }
    static getPhase(now) {
        switch (true) {
            case TeamArena.isRewardPhase(now):
                return Phase.REWARD;
            case TeamArena.isBattlePhase3(now):
                return Phase.BATTLE_3;
            case TeamArena.isBattlePhase2(now):
                return Phase.BATTLE_2;
            case TeamArena.isBattlePhase1(now):
                return Phase.BATTLE_1;
            case TeamArena.isPreparingPhase(now):
                return Phase.PREPARING;
            case TeamArena.isSignUpPhase3(now):
                return Phase.SIGNUP_3;
            case TeamArena.isSignUpPhase2(now):
                return Phase.SIGNUP_2;
            case TeamArena.isSignUpPhase1(now):
                return Phase.SIGNUP_1;
        }
    }
    static sortMembers(candidates) {
        candidates = main_1.client.random.shuffle(candidates);
        // uneven players
        if (candidates.length % 2 !== 0) {
            // determine strongest player
            const strongestPlayer = candidates.reduce((acc, candidate) => {
                if (candidate.player.level > acc.player.level) {
                    return candidate;
                }
                return acc;
            });
            candidates = candidates.filter((player) => strongestPlayer.id !== player.id);
            const half = Math.ceil(candidates.length / 2);
            // split into two teams
            const teamRed = candidates.slice(0, half);
            let teamBlue = candidates.slice(-half);
            // pick random blue member to be changed to red team
            const randomPlayer = main_1.client.random.pick(teamBlue);
            teamBlue = teamBlue.filter((player) => player.id !== randomPlayer.id);
            teamRed.push(randomPlayer);
            // add strongest player to team blue
            teamBlue.push(strongestPlayer);
            return main_1.client.random.shuffle([teamRed, teamBlue]);
        }
        const half = Math.ceil(candidates.length / 2);
        // split into two teams
        const teamRed = candidates.slice(0, half);
        const teamBlue = candidates.slice(-half);
        return main_1.client.random.shuffle([teamRed, teamBlue]);
    }
    static currentPhase() {
        return TeamArena.getPhase(luxon_1.DateTime.now());
    }
    /** returns the monday date of the week */
    static getMondayDate(now) {
        let date = now;
        while (date.weekday !== Days.MONDAY) {
            date = date.minus({ day: 1 });
        }
        return date;
    }
    scoreBoard() {
        const redTeam = this.candidates.filter((x) => x.team === 'RED');
        const blueTeam = this.candidates.filter((x) => x.team === 'BLUE');
        redTeam.sort((a, b) => b.score - a.score);
        blueTeam.sort((a, b) => b.score - a.score);
        const score = (team) => team.reduce((acc, v) => acc + v.score, 0);
        const makeList = (team) => team
            .map((x, i) => `${i + 1}. ${x.player.name} \`${x.score} points\``)
            .join('\n');
        const redTeamList = makeList(redTeam);
        const redTeamScore = score(redTeam);
        const blueTeamList = makeList(blueTeam);
        const blueTeamScore = score(blueTeam);
        const redCrown = redTeamScore > blueTeamScore ? utils_1.CROWN : '';
        const blueCrown = blueTeamScore > redTeamScore ? utils_1.CROWN : '';
        const embed = new discord_js_1.MessageEmbed()
            .setTitle('Team Arena Scoreboard')
            .addField(`Team ${utils_1.RED_BUTTON} (${redTeamScore} points) ${redCrown}`, redTeamList)
            .addField(`Team ${utils_1.BLUE_BUTTON} (${blueTeamScore} points) ${blueCrown}`, blueTeamList);
        return embed;
    }
    async updateScoreboard() {
        try {
            const scoreBoard = this.scoreBoard();
            const { messages } = main_1.client.teamArenaChannel;
            await messages.fetch();
            const oldScoreboard = messages.cache.get(this.messageID);
            // delete old scoreboard
            oldScoreboard?.delete();
            // send a new one
            const newScoreBoard = await main_1.client.teamArenaChannel.send(scoreBoard);
            this.messageID = newScoreBoard.id;
            await (0, teamArena_1.setMessage)(this.id, this.messageID);
            // eslint-disable-next-line no-empty
        }
        catch { }
    }
    async onSignUp() {
        // monday at 7.00 a.m.
        const now = luxon_1.DateTime.now().set({ hour: 7, minute: 0 });
        await (0, teamArena_1.createArena)(now.toISO());
    }
    async onBattle() {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .setImage(this.teamArenaBanner)
            .setTitle('Team Arena Battle');
        await main_1.client.teamArenaChannel.send(embed);
    }
    async onPrepare() {
        let teamRed = [];
        let teamBlue = [];
        try {
            [teamRed, teamBlue] = TeamArena.sortMembers(this.candidates.toArray());
        }
        catch {
            main_1.client.teamArenaChannel.send('Cannot start arena with only one candidate');
            return;
        }
        await (0, promiseWrapper_1.dbRun)('BEGIN TRANSACTION');
        for (const candidate of teamRed) {
            await (0, teamArena_1.setTeam)(this.id, candidate.id, 'RED');
        }
        for (const candidate of teamBlue) {
            await (0, teamArena_1.setTeam)(this.id, candidate.id, 'BLUE');
        }
        await (0, promiseWrapper_1.dbRun)('COMMIT');
        const arena = await TeamArena.getCurrentArena();
        await arena.updateScoreboard();
    }
    async rewardUser(teamArenaMember, teamReward) {
        const { score } = teamArenaMember;
        const totalReward = teamReward + score;
        const { member } = teamArenaMember.player;
        if (totalReward === 0)
            return;
        if (teamReward === 5) {
            main_1.client.logChannel.send((0, common_tags_1.oneLine) `${member} has been rewarded ${score} Arena Coins for individual
        effort and ${teamReward} Arena Coins for being part of the winning team
        in Team Arena!`);
        }
        else if (teamReward === 0) {
            main_1.client.logChannel.send((0, common_tags_1.oneLine) `${member} has been rewarded ${score} Arena Coins for individual
        effort in Team Arena!`);
        }
        else if (teamReward === 2) {
            main_1.client.logChannel.send((0, common_tags_1.oneLine) `has been rewarded ${score} Arena Coins for individual effort and
        ${teamReward} Arena Coins for team effort in Team Arena!`);
        }
        await teamArenaMember.player.addArenaCoin(totalReward);
    }
    async rewardTeam(teamArenaMembers, result) {
        for (const member of teamArenaMembers) {
            const reward = result === 'win' ? 5 : result === 'draw' ? 2 : 0;
            await this.rewardUser(member, reward);
        }
    }
    async onReward() {
        const { teamRed, teamBlue } = this.candidates.toArray().reduce((acc, member) => {
            if (member.team === 'RED') {
                acc.teamRed.push(member);
            }
            else {
                acc.teamBlue.push(member);
            }
            return acc;
        }, { teamRed: [], teamBlue: [] });
        const teamRedScore = teamRed.reduce((acc, member) => acc + member.score, 0);
        const teamBlueScore = teamBlue.reduce((acc, member) => acc + member.score, 0);
        const isDraw = teamRedScore === teamBlueScore;
        const winningTeam = teamRedScore > teamBlueScore
            ? `Team ${utils_1.RED_BUTTON}` : `Team ${utils_1.BLUE_BUTTON}`;
        if (isDraw) {
            main_1.client.teamArenaChannel.send((0, common_tags_1.oneLine) `It's a draw between team ${utils_1.RED_BUTTON} and team ${utils_1.BLUE_BUTTON}
        for this week's Team Arena!`);
            this.rewardTeam(teamRed, 'draw');
            this.rewardTeam(teamBlue, 'draw');
        }
        else {
            main_1.client.teamArenaChannel.send(`${winningTeam} has won this week's Team Arena!`);
            // team red wins
            if (teamRedScore > teamBlueScore) {
                this.rewardTeam(teamRed, 'win');
                this.rewardTeam(teamBlue, 'lose');
            }
            else { // team blue wins
                this.rewardTeam(teamRed, 'lose');
                this.rewardTeam(teamBlue, 'win');
            }
        }
        await this.updateScoreboard();
    }
    /** updates phase upon every second */
    static async mainLoop() {
        const arena = await TeamArena.getCurrentArena();
        const currentPhase = main_1.client.isDev
            ? main_1.client.arenaPhase : TeamArena.currentPhase();
        const mention = main_1.client.isDev ? '@all' : '@everyone';
        const { prefix } = main_1.client;
        if (!currentPhase || arena.phase === currentPhase) {
            return;
        }
        try {
            const { teamArenaChannelID } = main_1.client;
            const teamArenaChannel = await main_1.client.bot.channels.fetch(teamArenaChannelID);
            await (0, utils_1.nukeChannel)(teamArenaChannel);
            // eslint-disable-next-line no-empty
        }
        catch { }
        switch (currentPhase) {
            case Phase.SIGNUP_1:
                await main_1.client.teamArenaChannel.send((0, common_tags_1.oneLine) `${mention} Notice: You can now sign up for the Team Arena
          battles of this week! Use the \`${prefix}TeamArena\` command to
          participate. You have 48 hours to sign up!`);
                await arena.onSignUp();
                break;
            case Phase.SIGNUP_2:
                await main_1.client.teamArenaChannel.send((0, common_tags_1.oneLine) `${mention} Notice: You can now sign up for the Team Arena
          battles of this week! Use the \`${prefix}TeamArena\` command to
          participate. You have 24 hours to sign up!`);
                break;
            case Phase.SIGNUP_3:
                await main_1.client.teamArenaChannel.send((0, common_tags_1.oneLine) `${mention} Notice: You can now sign up for the Team Arena
          battles of this week! Use the \`${prefix}TeamArena\` command to
          participate. You have 12 hours to sign up!`);
                break;
            case Phase.PREPARING:
                await main_1.client.teamArenaChannel.send((0, common_tags_1.oneLine) `${mention} The teams for the Team Arena have been formed! You
          can no longer sign up for Team Arena this week. Battles will start in
          24 hours!`);
                await arena.onPrepare();
                break;
            case Phase.BATTLE_1:
                await main_1.client.teamArenaChannel.send((0, common_tags_1.oneLine) `${mention} You can now battle the opponents team by using
          \`${prefix}TeamArena\` and earn points for your team!`);
                await arena.onBattle();
                break;
            case Phase.BATTLE_2:
                await main_1.client.teamArenaChannel.send((0, common_tags_1.oneLine) `${mention} Notice: You have 24 hours left to battle in the
          Team Arena by using \`${prefix}TeamArena\`!`);
                await arena.updateScoreboard();
                break;
            case Phase.BATTLE_3:
                await main_1.client.teamArenaChannel.send((0, common_tags_1.oneLine) `${mention} Notice: You have 12 hours left to battle in the
          Team Arena by using \`${prefix}TeamArena\`!`);
                await arena.updateScoreboard();
                break;
            case Phase.REWARD:
                await arena.onReward();
                break;
        }
        await (0, teamArena_1.setPhase)(arena.id, currentPhase);
    }
}
exports.TeamArena = TeamArena;
TeamArena.MAX_ENERGY = 10;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVhbUFyZW5hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9UZWFtQXJlbmEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQXNDO0FBQ3RDLDJDQUF1RDtBQUN2RCxpQ0FBaUM7QUFDakMseURBQTZDO0FBQzdDLCtDQU95QjtBQUN6QixrQ0FBaUM7QUFDakMsaUNBQThCO0FBQzlCLHFDQUFrQztBQUNsQyxtQ0FFaUI7QUFFakIsSUFBSyxJQVFKO0FBUkQsV0FBSyxJQUFJO0lBQ1AsbUNBQVUsQ0FBQTtJQUNWLHFDQUFPLENBQUE7SUFDUCx5Q0FBUyxDQUFBO0lBQ1QsdUNBQVEsQ0FBQTtJQUNSLG1DQUFNLENBQUE7SUFDTix1Q0FBUSxDQUFBO0lBQ1IsbUNBQU0sQ0FBQTtBQUNSLENBQUMsRUFSSSxJQUFJLEtBQUosSUFBSSxRQVFSO0FBRUQsSUFBWSxLQVNYO0FBVEQsV0FBWSxLQUFLO0lBQ2YsOEJBQXFCLENBQUE7SUFDckIsOEJBQXFCLENBQUE7SUFDckIsOEJBQXFCLENBQUE7SUFDckIsZ0NBQXVCLENBQUE7SUFDdkIsOEJBQXFCLENBQUE7SUFDckIsOEJBQXFCLENBQUE7SUFDckIsOEJBQXFCLENBQUE7SUFDckIsMEJBQWlCLENBQUE7QUFDbkIsQ0FBQyxFQVRXLEtBQUssR0FBTCxhQUFLLEtBQUwsYUFBSyxRQVNoQjtBQUVELE1BQWEsZUFBZTtJQWUxQixZQUFZLE1BQXlCLEVBQUUsTUFBYztRQUNuRCxJQUFJLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxnQkFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQStCLENBQUM7UUFDbkQsSUFB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R0FBRyxHQUFHLENBQUM7UUFDZixPQUFPLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNuQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQy9CO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsVUFBVTtRQUNSLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDO1FBRWxFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0MsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUF1QixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFckYsTUFBTSxRQUFRLEdBQUcsQ0FBQyxJQUF1QixFQUFFLEVBQUUsQ0FBQyxJQUFJO2FBQy9DLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMs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