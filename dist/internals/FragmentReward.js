"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rewardAll = exports.FragmentReward = void 0;
const fragmentReward_1 = require("../db/fragmentReward");
const inventory_1 = require("../db/inventory");
const Pet_1 = require("./Pet");
const Player_1 = require("./Player");
const utils_1 = require("../internals/utils");
const player_1 = require("../db/player");
const main_1 = require("../main");
class FragmentReward {
    static upperLimit(xp) {
        return (0, utils_1.upperLimit)(xp, this.XP_REWARD);
    }
    static totalLevelPassed(xp) {
        return (0, utils_1.totalLevelPassed)(xp, this.XP_REWARD);
    }
    static async reward(player) {
        const { fragment } = Pet_1.Pet.random();
        await (0, inventory_1.addInventory)(player.id, fragment.id);
        return fragment;
    }
    /** sets new upper limit based of player's xp */
    static setUpperLimit(player) {
        return (0, fragmentReward_1.setFragmentReward)(player.id, FragmentReward.upperLimit(player.xp));
    }
    /** 20% chance to earn fragment reward */
    static random() {
        return main_1.client.random.bool(0.2);
    }
}
exports.FragmentReward = FragmentReward;
FragmentReward.XP_REWARD = 500;
async function rewardAll() {
    const users = await (0, player_1.getUsers)();
    const guild = await main_1.client.bot.guilds.fetch(main_1.client.serverID);
    const members = await guild.members.fetch();
    let rewardedUser = 0;
    main_1.client.db.exec('BEGIN TRANSACTION');
    for (const user of users) {
        const member = members.get(user.DiscordID);
        if (!member) {
            console.log(`Skipping ${user.DiscordID}, member no longer in the server`);
            continue;
        }
        const player = await Player_1.Player.getPlayer(member);
        const rewards = FragmentReward.totalLevelPassed(player.xp);
        for (let i = 0; i < rewards; i++) {
            const getsReward = FragmentReward.random();
            if (getsReward) {
                const fragment = await FragmentReward.reward(player);
                console.log(`${player.name} received ${fragment.name}`);
            }
            else {
                console.log(`${player.name} missed the fragment reward`);
            }
        }
        await FragmentReward.setUpperLimit(player);
        await player.sync();
        console.log(`${player.name} xp: ${player.xp} fragmentReward: ${player.fragmentReward}`);
        rewardedUser++;
    }
    main_1.client.db.exec('COMMIT');
    console.log(`Total ${rewardedUser} players have been rewarded`);
}
exports.rewardAll = rewardAll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJhZ21lbnRSZXdhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL0ZyYWdtZW50UmV3YXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHlEQUF5RDtBQUN6RCwrQ0FBK0M7QUFDL0MsK0JBQTRCO0FBQzVCLHFDQUFrQztBQUNsQyw4Q0FBa0U7QUFDbEUseUNBQXdDO0FBQ3hDLGtDQUFpQztBQUVqQyxNQUFhLGNBQWM7SUFHekIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFVO1FBQzFCLE9BQU8sSUFBQSxrQkFBVSxFQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFVO1FBQ2hDLE9BQU8sSUFBQSx3QkFBZ0IsRUFBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFjO1FBQ2hDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxTQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEMsTUFBTSxJQUFBLHdCQUFZLEVBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0MsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVELGdEQUFnRDtJQUNoRCxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQWM7UUFDakMsT0FBTyxJQUFBLGtDQUFpQixFQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsY0FBYyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBRUQseUNBQXlDO0lBQ3pDLE1BQU0sQ0FBQyxNQUFNO1FBQ1gsT0FBTyxhQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDOztBQXpCSCx3Q0EwQkM7QUF6QlEsd0JBQVMsR0FBRyxHQUFHLENBQUM7QUEyQmxCLEtBQUssVUFBVSxTQUFTO0lBQzdCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSxpQkFBUSxHQUFFLENBQUM7SUFDL0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxhQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsYUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzdELE1BQU0sT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM1QyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7SUFFckIsYUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNwQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN4QixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksQ0FBQyxTQUFTLGtDQUFrQyxDQUFDLENBQUM7WUFDMUUsU0FBUztTQUNWO1FBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzlDLE1BQU0sT0FBTyxHQUFHLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoQyxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDM0MsSUFBSSxVQUFVLEVBQUU7Z0JBQ2QsTUFBTSxRQUFRLEdBQUcsTUFBTSxjQUFjLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksYUFBYSxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUN6RDtpQkFBTTtnQkFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksNkJBQTZCLENBQUMsQ0FBQzthQUMxRDtTQUNGO1FBRUQsTUFBTSxjQUFjLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzNDLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXBCLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxRQUFRLE1BQU0sQ0FBQyxFQUFFLG9CQUFvQixNQUFNLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztRQUN4RixZQUFZLEVBQUUsQ0FBQztLQUNoQjtJQUVELGFBQU0sQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXpCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxZQUFZLDZCQUE2QixDQUFDLENBQUM7QUFDbEUsQ0FBQztBQXBDRCw4QkFvQ0MifQ==