"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Challenger = void 0;
const Fighter_1 = require("./Fighter");
const challenger_1 = require("../db/challenger");
const imageUrl = 'https://cdn.discordapp.com/attachments/607917288527626250/857580537131958282/unknown.png';
const CRIT_DAMAGE = 2;
class Challenger extends Fighter_1.Fighter {
    constructor(data) {
        super(data);
        this.loot = data.loot;
    }
    static async getChallenger(level) {
        const challenger = await (0, challenger_1.getChallenger)(level || 1);
        return new Challenger({
            name: challenger.Name,
            level: challenger.ID,
            hp: challenger.HP,
            strength: challenger.Strength,
            speed: challenger.Speed,
            armor: challenger.Armor,
            critRate: challenger.CritChance,
            critDamage: CRIT_DAMAGE,
            imageUrl,
            loot: challenger.Loot,
        });
    }
}
exports.Challenger = Challenger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hhbGxlbmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvQ2hhbGxlbmdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBOEM7QUFDOUMsaURBQW9FO0FBRXBFLE1BQU0sUUFBUSxHQUFHLDBGQUEwRixDQUFDO0FBRTVHLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQztBQU10QixNQUFhLFVBQVcsU0FBUSxpQkFBTztJQUdyQyxZQUFZLElBQWlCO1FBQzNCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNaLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztJQUN4QixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsS0FBYTtRQUN0QyxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEsMEJBQWUsRUFBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDckQsT0FBTyxJQUFJLFVBQVUsQ0FBQztZQUNwQixJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUk7WUFDckIsS0FBSyxFQUFFLFVBQVUsQ0FBQyxFQUFFO1lBQ3BCLEVBQUUsRUFBRSxVQUFVLENBQUMsRUFBRTtZQUNqQixRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7WUFDN0IsS0FBSyxFQUFFLFVBQVUsQ0FBQyxLQUFLO1lBQ3ZCLEtBQUssRUFBRSxVQUFVLENBQUMsS0FBSztZQUN2QixRQUFRLEVBQUUsVUFBVSxDQUFDLFVBQVU7WUFDL0IsVUFBVSxFQUFFLFdBQVc7WUFDdkIsUUFBUTtZQUNSLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSTtTQUN0QixDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUF2QkQsZ0NBdUJDIn0=