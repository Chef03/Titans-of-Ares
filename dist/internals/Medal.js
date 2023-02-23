"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Medal = exports.medals = void 0;
const inventory_1 = require("../db/inventory");
const medal_1 = require("../db/medal");
const xp_1 = require("../db/xp");
const Chest_1 = require("./Chest");
exports.medals = ['BronzeMedal', 'SilverMedal', 'GoldMedal'];
const medalInfo = {
    GoldMedal: {
        name: 'Gold Medal',
        xp: 175,
    },
    SilverMedal: {
        name: 'Silver Medal',
        xp: 125,
    },
    BronzeMedal: {
        name: 'Bronze Medal',
        xp: 75,
    },
};
class Medal {
    constructor(medal) {
        this.medal = medal;
        this.data = medalInfo[this.medal];
    }
    static isValidMedal(medal) {
        return exports.medals.includes(medal);
    }
    // returns text friendly alternate name
    get name() {
        return this.data.name;
    }
    get xp() {
        return this.data.xp;
    }
    get chest() {
        return Chest_1.Chest.fromMedal(this.medal);
    }
    async give(player) {
        await (0, medal_1.addMedal)(player.id, this.medal, 1);
        await (0, xp_1.addXP)(player.id, this.xp);
        await (0, inventory_1.addInventory)(player.id, this.chest.id);
    }
    async revert(player) {
        await (0, medal_1.addMedal)(player.id, this.medal, -1);
        await (0, xp_1.addXP)(player.id, -this.xp);
        await (0, inventory_1.removeInventory)(player.id, this.chest.id);
    }
}
exports.Medal = Medal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWVkYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL01lZGFsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUFnRTtBQUNoRSx1Q0FBdUM7QUFDdkMsaUNBQWlDO0FBQ2pDLG1DQUFnQztBQUduQixRQUFBLE1BQU0sR0FBRyxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFHbEUsTUFBTSxTQUFTLEdBQUc7SUFDaEIsU0FBUyxFQUFFO1FBQ1QsSUFBSSxFQUFFLFlBQVk7UUFDbEIsRUFBRSxFQUFFLEdBQUc7S0FDUjtJQUNELFdBQVcsRUFBRTtRQUNYLElBQUksRUFBRSxjQUFjO1FBQ3BCLEVBQUUsRUFBRSxHQUFHO0tBQ1I7SUFDRCxXQUFXLEVBQUU7UUFDWCxJQUFJLEVBQUUsY0FBYztRQUNwQixFQUFFLEVBQUUsRUFBRTtLQUNQO0NBQ0YsQ0FBQztBQUVGLE1BQWEsS0FBSztJQUtoQixZQUFZLEtBQWdCO1FBQzFCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBRUQsTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFhO1FBQy9CLE9BQU8sY0FBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsdUNBQXVDO0lBQ3ZDLElBQUksSUFBSTtRQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDeEIsQ0FBQztJQUVELElBQUksRUFBRTtRQUNKLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVELElBQUksS0FBSztRQUNQLE9BQU8sYUFBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBYztRQUN2QixNQUFNLElBQUEsZ0JBQVEsRUFBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekMsTUFBTSxJQUFBLFVBQUssRUFBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQyxNQUFNLElBQUEsd0JBQVksRUFBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBYztRQUN6QixNQUFNLElBQUEsZ0JBQVEsRUFBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQyxNQUFNLElBQUEsVUFBSyxFQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsTUFBTSxJQUFBLDJCQUFlLEVBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELENBQUM7Q0FDRjtBQXRDRCxzQkFzQ0MifQ==