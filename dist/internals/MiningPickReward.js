"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiningPickReward = void 0;
const gem_1 = require("../db/gem");
const inventory_1 = require("../db/inventory");
const Mining_1 = require("./Mining");
const utils_1 = require("./utils");
class MiningPickReward {
    static upperLimit(xp) {
        return (0, utils_1.upperLimit)(xp, this.XP_REWARD);
    }
    static totalLevelPassed(xp) {
        return (0, utils_1.totalLevelPassed)(xp, this.XP_REWARD);
    }
    static async reward(player) {
        const pick = new Mining_1.MiningPick();
        await (0, inventory_1.addInventory)(player.id, pick.id);
    }
    static setUpperLimit(player) {
        return (0, gem_1.setMiningPickReward)(player.id, MiningPickReward.upperLimit(player.xp));
    }
}
exports.MiningPickReward = MiningPickReward;
/** reward every 10 xp */
MiningPickReward.XP_REWARD = 10;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWluaW5nUGlja1Jld2FyZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvTWluaW5nUGlja1Jld2FyZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxtQ0FBZ0Q7QUFDaEQsK0NBQStDO0FBQy9DLHFDQUFzQztBQUV0QyxtQ0FBdUQ7QUFFdkQsTUFBYSxnQkFBZ0I7SUFJM0IsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFVO1FBQzFCLE9BQU8sSUFBQSxrQkFBVSxFQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFVO1FBQ2hDLE9BQU8sSUFBQSx3QkFBZ0IsRUFBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFjO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksbUJBQVUsRUFBRSxDQUFDO1FBQzlCLE1BQU0sSUFBQSx3QkFBWSxFQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRCxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQWM7UUFDakMsT0FBTyxJQUFBLHlCQUFtQixFQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7O0FBbkJILDRDQW9CQztBQW5CQyx5QkFBeUI7QUFDbEIsMEJBQVMsR0FBRyxFQUFFLENBQUMifQ==