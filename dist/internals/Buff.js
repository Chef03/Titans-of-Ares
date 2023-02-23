"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buff = exports.XP_THRESHOLD = exports.BUFF_LIMIT = exports.BUFF_ACTIVE_LIMIT = void 0;
const luxon_1 = require("luxon");
const player_1 = require("../db/player");
const timer_1 = require("../db/timer");
const energy_1 = require("./energy");
const main_1 = require("../main");
const commonPercentage = [0.1, 0.15, 0.2, 0.25, 0.5];
const buffs = {
    hp: commonPercentage,
    critRate: [0.03, 0.05, 0.1, 0.15, 0.30],
    critDamage: [0.1, 0.2, 0.3, 0.7, 1.5],
    strength: commonPercentage,
    speed: commonPercentage,
};
const chances = [400, 300, 150, 100, 50];
exports.BUFF_ACTIVE_LIMIT = { hours: 2 };
exports.BUFF_LIMIT = { hours: 2 };
exports.XP_THRESHOLD = 20;
class Buff {
    constructor(id) {
        const args = id.split('_');
        const type = args[0];
        const level = parseInt(args[1]);
        if (!args[0] || !args[1])
            throw new Error('invalid buff id');
        this.type = type;
        this.level = level;
    }
    get id() {
        return `${this.type}_${this.level}`;
    }
    get name() {
        const buffLevelName = [
            'Common',
            'Uncommon',
            'Rare',
            'Epic',
            'Legendary',
        ];
        const buffTypeName = {
            hp: 'HP',
            critRate: 'Crit Rate',
            critDamage: 'Crit Damage',
            strength: 'Strength',
            speed: 'Speed',
        };
        const typeName = buffTypeName[this.type];
        const levelName = buffLevelName[this.level - 1];
        if (this.type === 'critDamage') {
            return `${levelName} ${typeName} buff \`+x${this.value}\``;
        }
        return `${levelName} ${typeName} buff \`+${this.value * 100}%\``;
    }
    // returns buff value based on type
    get value() {
        return buffs[this.type][this.level - 1];
    }
    use(player) {
        switch (this.type) {
            case 'critDamage':
                player.critDamage += this.value;
                break;
            case 'critRate':
                player.critRate += this.value;
                break;
            case 'speed':
                player.speed += this.value * player.speed;
                break;
            case 'strength':
                player.strength += this.value * player.strength;
                break;
            case 'hp':
                player.hp += this.value * player.hp;
                break;
        }
    }
    async getTimeLeft(player) {
        const id = player.buff?.id;
        if (!id)
            return '';
        const timer = await (0, timer_1.getTimer)(timer_1.TimerType.Buff, player.id);
        if (!timer)
            return '';
        const expireDate = luxon_1.DateTime.fromISO(timer.Expires);
        const diff = expireDate.diffNow();
        return diff.toFormat('`(hh:mm:ss)`');
    }
    static async mainLoop() {
        const timers = await (0, timer_1.getAllTimers)(timer_1.TimerType.Buff);
        for (const timer of timers) {
            if ((0, energy_1.isExpired)(timer.Expires)) {
                (0, timer_1.deleteTimer)(timer_1.TimerType.Buff, timer.DiscordID);
                (0, player_1.deleteBuff)(timer.DiscordID);
            }
        }
    }
    // randomly picks level according to its rarity
    static pickBuffLevel() {
        const samples = chances
            .map((count, index) => Array(count).fill(index + 1))
            .flat();
        const randomizedSample = main_1.client.random.shuffle(samples);
        return main_1.client.random.pick(randomizedSample);
    }
    // randomly choses buff according to its rarity
    static random() {
        const buffTypes = Object.keys(buffs);
        const buffType = main_1.client.random.pick(buffTypes);
        const buffLevel = this.pickBuffLevel();
        return new Buff(`${buffType}_${buffLevel}`);
    }
}
exports.Buff = Buff;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnVmZi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvQnVmZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBZ0Q7QUFDaEQseUNBQTBDO0FBQzFDLHVDQUtxQjtBQUNyQixxQ0FBcUM7QUFFckMsa0NBQWlDO0FBRWpDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFckQsTUFBTSxLQUFLLEdBQUc7SUFDWixFQUFFLEVBQUUsZ0JBQWdCO0lBQ3BCLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7SUFDdkMsVUFBVSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztJQUNyQyxRQUFRLEVBQUUsZ0JBQWdCO0lBQzFCLEtBQUssRUFBRSxnQkFBZ0I7Q0FDeEIsQ0FBQztBQUVGLE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBRTVCLFFBQUEsaUJBQWlCLEdBQWtCLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hELFFBQUEsVUFBVSxHQUFrQixFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUN6QyxRQUFBLFlBQVksR0FBRyxFQUFFLENBQUM7QUFPL0IsTUFBYSxJQUFJO0lBS2YsWUFBWSxFQUFVO1FBQ3BCLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDM0IsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBYSxDQUFDO1FBQ2pDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQWMsQ0FBQztRQUU3QyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUU3RCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0osT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssRUFBWSxDQUFDO0lBQ2hELENBQUM7SUFFRCxJQUFJLElBQUk7UUFDTixNQUFNLGFBQWEsR0FBRztZQUNwQixRQUFRO1lBQ1IsVUFBVTtZQUNWLE1BQU07WUFDTixNQUFNO1lBQ04sV0FBVztTQUNaLENBQUM7UUFFRixNQUFNLFlBQVksR0FBRztZQUNuQixFQUFFLEVBQUUsSUFBSTtZQUNSLFFBQVEsRUFBRSxXQUFXO1lBQ3JCLFVBQVUsRUFBRSxhQUFhO1lBQ3pCLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLEtBQUssRUFBRSxPQUFPO1NBQ2YsQ0FBQztRQUVGLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekMsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFaEQsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFlBQVksRUFBRTtZQUM5QixPQUFPLEdBQUcsU0FBUyxJQUFJLFFBQVEsYUFBYSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUM7U0FDNUQ7UUFDRCxPQUFPLEdBQUcsU0FBUyxJQUFJLFFBQVEsWUFBWSxJQUFJLENBQUMsS0FBSyxHQUFHLEdBQUcsS0FBSyxDQUFDO0lBQ25FLENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMsSUFBWSxLQUFLO1FBQ2YsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELEdBQUcsQ0FBQyxNQUFjO1FBQ2hCLFFBQVEsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNqQixLQUFLLFlBQVk7Z0JBQ2YsTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUNoQyxNQUFNO1lBQ1IsS0FBSyxVQUFVO2dCQUNiLE1BQU0sQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztnQkFDOUIsTUFBTTtZQUNSLEtBQUssT0FBTztnQkFDVixNQUFNLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztnQkFDMUMsTUFBTTtZQUNSLEtBQUssVUFBVTtnQkFDYixNQUFNLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDaEQsTUFBTTtZQUNSLEtBQUssSUFBSTtnQkFDUCxNQUFNLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDcEMsTUFBTTtTQUNUO0lBQ0gsQ0FBQztJQUVELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBYztRQUM5QixNQUFNLEVBQUUsR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRW5CLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSxnQkFBUSxFQUFDLGlCQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsS0FBSztZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRXRCLE1BQU0sVUFBVSxHQUFHLGdCQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRCxNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFbEMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVE7UUFDbkIsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLG9CQUFZLEVBQUMsaUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVsRCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtZQUMxQixJQUFJLElBQUEsa0JBQVMsRUFBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQzVCLElBQUEsbUJBQVcsRUFBQyxpQkFBUyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQzdDLElBQUEsbUJBQVUsRUFBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDN0I7U0FDRjtJQUNILENBQUM7SUFFRCwrQ0FBK0M7SUFDdkMsTUFBTSxDQUFDLGFBQWE7UUFDMUIsTUFBTSxPQUFPLEdBQUcsT0FBTzthQUNwQixHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQzthQUNuRCxJQUFJLEVBQUUsQ0FBQztRQUNWLE1BQU0sZ0JBQWdCLEdBQUcsYUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQVksT0FBTyxDQUFDLENBQUM7UUFDbkUsT0FBTyxhQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCwrQ0FBK0M7SUFDL0MsTUFBTSxDQUFDLE1BQU07UUFDWCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JDLE1BQU0sUUFBUSxHQUFHLGFBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBYSxDQUFDO1FBQzNELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QyxPQUFPLElBQUksSUFBSSxDQUFDLEdBQUcsUUFBUSxJQUFJLFNBQVMsRUFBWSxDQUFDLENBQUM7SUFDeEQsQ0FBQztDQUNGO0FBL0dELG9CQStHQyJ9