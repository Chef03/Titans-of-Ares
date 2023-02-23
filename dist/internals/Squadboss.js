"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SquadBoss = exports.SquadPhase = void 0;
const common_tags_1 = require("common-tags");
const luxon_1 = require("luxon");
const promiseWrapper_1 = require("../db/promiseWrapper");
const squadBoss_1 = require("../db/squadBoss");
const main_1 = require("../main");
const TeamArena_1 = require("./TeamArena");
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
var SquadPhase;
(function (SquadPhase) {
    SquadPhase["REPLENISH"] = "replenish_1";
    SquadPhase["BATTLE"] = "battle_1";
})(SquadPhase = exports.SquadPhase || (exports.SquadPhase = {}));
class SquadBoss {
    constructor(squadBoss) {
        this.id = squadBoss.ID;
        this.created = luxon_1.DateTime.fromISO(squadBoss.Created);
        this.phase = squadBoss.Phase;
        this.monday = TeamArena_1.TeamArena.getMondayDate(this.created).set({
            hour: 7,
            minute: 0,
        });
        this.messageID = squadBoss.MessageID;
    }
    static isReplenishingPhase(time) {
        return time.weekday == Days.MONDAY && time.hour >= 7;
    }
    static isBattlePhase(time) {
        return time.weekday == Days.MONDAY && time.hour >= 8;
    }
    static getPhase(now) {
        switch (true) {
            case SquadBoss.isBattlePhase(now):
                return SquadPhase.BATTLE;
            case SquadBoss.isReplenishingPhase(now):
                return SquadPhase.REPLENISH;
        }
    }
    static currentPhase() {
        return SquadBoss.getPhase(luxon_1.DateTime.now());
    }
    static async getCurrentSquadBoss() {
        let sb = await (0, squadBoss_1.getSquadBoss)();
        if (!sb) {
            const now = luxon_1.DateTime.now().plus({ days: 7 });
            await (0, squadBoss_1.createSquadBoss)(TeamArena_1.TeamArena.getMondayDate(now).toISO());
            sb = await (0, squadBoss_1.getSquadBoss)();
        }
        return new SquadBoss(sb);
    }
    static async mainLoop() {
        const squadboss = await SquadBoss.getCurrentSquadBoss();
        // const currentPhase = client.isDev ? client.squadBossPhase : SquadBoss.currentPhase();
        const currentPhase = SquadBoss.currentPhase();
        const mention = main_1.client.isDev ? '@all' : '@everyone';
        const { prefix } = main_1.client;
        if (!currentPhase || currentPhase === squadboss.phase)
            return;
        switch (currentPhase) {
            case SquadPhase.REPLENISH:
                await SquadBoss.onReplenish();
                try {
                    const { squadBossChannelID } = main_1.client;
                    const teamArenaChannel = await main_1.client.bot.channels.fetch(squadBossChannelID);
                    await (0, utils_1.nukeChannel)(teamArenaChannel);
                    // eslint-disable-next-line no-empty
                }
                catch { }
                await main_1.client.squadBossChannel.send((0, common_tags_1.oneLine) `${mention} Notice: Squad Boss Energy has been replenished. You can now participate in 1 Squad Boss fight this week! Use the ${prefix}squadboss command to create a squad or join one!`);
                break;
            case SquadPhase.BATTLE:
                break;
        }
        await (0, squadBoss_1.setPhase)(squadboss.id, currentPhase);
    }
    static async onReplenish() {
        await (0, promiseWrapper_1.dbRun)(`DELETE FROM squads`);
        await (0, promiseWrapper_1.dbRun)(`DELETE FROM squadMembers`);
        await (0, promiseWrapper_1.dbRun)(`DELETE FROM sqlite_sequence WHERE name = 'squads'`);
        const sql = `
        UPDATE PLAYER 
        SET SquadBossEnergy=1
      `;
        (0, promiseWrapper_1.dbRun)(sql);
    }
}
exports.SquadBoss = SquadBoss;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3F1YWRib3NzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9TcXVhZGJvc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQXNDO0FBRXRDLGlDQUFpQztBQUNqQyx5REFBNkM7QUFDN0MsK0NBRXlCO0FBQ3pCLGtDQUFpQztBQUNqQywyQ0FBd0M7QUFDeEMsbUNBRWlCO0FBRWpCLElBQUssSUFRSjtBQVJELFdBQUssSUFBSTtJQUNQLG1DQUFVLENBQUE7SUFDVixxQ0FBTyxDQUFBO0lBQ1AseUNBQVMsQ0FBQTtJQUNULHVDQUFRLENBQUE7SUFDUixtQ0FBTSxDQUFBO0lBQ04sdUNBQVEsQ0FBQTtJQUNSLG1DQUFNLENBQUE7QUFDUixDQUFDLEVBUkksSUFBSSxLQUFKLElBQUksUUFRUjtBQUVELElBQVksVUFLWDtBQUxELFdBQVksVUFBVTtJQUVwQix1Q0FBeUIsQ0FBQTtJQUN6QixpQ0FBbUIsQ0FBQTtBQUVyQixDQUFDLEVBTFcsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFLckI7QUFFRCxNQUFhLFNBQVM7SUFZcEIsWUFBWSxTQUFzQjtRQUNoQyxJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxnQkFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBbUIsQ0FBQztRQUMzQyxJQUFJLENBQUMsTUFBTSxHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFDdEQsSUFBSSxFQUFFLENBQUM7WUFDUCxNQUFNLEVBQUUsQ0FBQztTQUNWLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztJQUN2QyxDQUFDO0lB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