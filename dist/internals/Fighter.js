"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fighter = exports.CRIT_RATE = void 0;
const main_1 = require("../main");
exports.CRIT_RATE = 2;
// Fighter implements battle fight
class Fighter {
    constructor(data) {
        this.name = data.name;
        this.level = data.level;
        this.hp = data.hp;
        this.strength = data.strength;
        this.speed = data.speed;
        this.armor = data.armor;
        this.critRate = data.critRate;
        this.critDamage = data.critDamage;
        this.armorPenetration = 0;
        this.imageUrl = data.imageUrl;
    }
    isCriticalHit() {
        return main_1.client.random.bool(this.critRate);
    }
    getArmorReduction(attack, penetrate) {
        const penetrated = this.armor * (1 - penetrate);
        const armor = 100 / (100 + penetrated);
        const damageDone = attack * armor;
        return attack - damageDone;
    }
}
exports.Fighter = Fighter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlnaHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvRmlnaHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrQ0FBaUM7QUFFcEIsUUFBQSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBeUIzQixrQ0FBa0M7QUFDbEMsTUFBYSxPQUFPO0lBcUJsQixZQUFZLElBQWM7UUFDeEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNsQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUNoQyxDQUFDO0lBRUQsYUFBYTtRQUNYLE9BQU8sYUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxNQUFjLEVBQUUsU0FBaUI7UUFDakQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztRQUNoRCxNQUFNLEtBQUssR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFDdkMsTUFBTSxVQUFVLEdBQUcsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNsQyxPQUFPLE1BQU0sR0FBRyxVQUFVLENBQUM7SUFDN0IsQ0FBQztDQUNGO0FBNUNELDBCQTRDQyJ9