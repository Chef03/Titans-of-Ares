"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attributes = exports.Attribute = void 0;
const utils_1 = require("./utils");
class Attribute {
    format(attribValue, opt = {}) {
        let stat = '';
        if (opt.prefix) {
            stat += '+';
        }
        switch (this.key) {
            case 'armor':
                stat += `${(0, utils_1.roundTo)(attribValue, 1)}`;
                break;
            case 'critRate':
                stat += `${(0, utils_1.roundTo)(attribValue * 100, 1)}%`;
                break;
            case 'critDamage':
                stat += `x${(0, utils_1.roundTo)(attribValue, 2)}`;
                break;
            case 'armorPenetration':
                stat += `${Math.round(attribValue * 100)}%`;
                break;
            default:
                stat += `${Math.round(attribValue)}`;
        }
        if (opt.highlight) {
            stat = (0, utils_1.inlineCode)(stat);
        }
        if (opt.suffix) {
            stat += ` ${this.name}`;
        }
        return stat;
    }
}
exports.Attribute = Attribute;
class HP extends Attribute {
    constructor() {
        super(...arguments);
        this.name = 'HP';
        this.id = 'hp';
        this.key = 'hp';
    }
}
class Strength extends Attribute {
    constructor() {
        super(...arguments);
        this.name = 'Strength';
        this.id = 'strength';
        this.key = 'strength';
    }
}
class Speed extends Attribute {
    constructor() {
        super(...arguments);
        this.name = 'Speed';
        this.id = 'speed';
        this.key = 'speed';
    }
}
class Armor extends Attribute {
    constructor() {
        super(...arguments);
        this.name = 'Armor';
        this.id = 'armor';
        this.key = 'armor';
    }
}
class CritRate extends Attribute {
    constructor() {
        super(...arguments);
        this.name = 'Crit Rate';
        this.id = 'crit_rate';
        this.key = 'critRate';
    }
}
class CritDamage extends Attribute {
    constructor() {
        super(...arguments);
        this.name = 'Crit Damage';
        this.id = 'crit_damage';
        this.key = 'critDamage';
    }
}
class ArmorPenetration extends Attribute {
    constructor() {
        super(...arguments);
        this.name = 'Armor Penetration';
        this.id = 'armor_penetration';
        this.key = 'armorPenetration';
    }
}
class Attributes {
    static fromString(identifier) {
        for (const attr of this.all) {
            let isEqual = attr.id === identifier;
            isEqual || (isEqual = attr.key === identifier);
            isEqual || (isEqual = attr.name === identifier);
            if (isEqual)
                return attr;
        }
        throw new Error(`${identifier} is not a valid attribute`);
    }
    static aggregate(attribs) {
        const acc = {};
        for (const [attrib, attribValue] of attribs) {
            const { key } = attrib;
            const value = acc[key];
            if (value !== undefined) {
                acc[key] = value + attribValue;
            }
            else {
                acc[attrib.key] = attribValue;
            }
        }
        return acc;
    }
    static toStats(stats, formatOpts) {
        const result = [];
        for (const [key, value] of Object.entries(stats)) {
            const attribute = Attributes.fromString(key);
            const opts = {
                ...{
                    highlight: true,
                    suffix: true,
                    prefix: true,
                },
                ...formatOpts,
            };
            result.push(attribute.format(value, opts));
        }
        return result;
    }
}
exports.Attributes = Attributes;
Attributes.hp = new HP();
Attributes.strength = new Strength();
Attributes.speed = new Speed();
Attributes.armor = new Armor();
Attributes.critRate = new CritRate();
Attributes.critDamage = new CritDamage();
Attributes.armorPenetration = new ArmorPenetration();
Attributes.all = [
    Attributes.hp,
    Attributes.strength,
    Attributes.speed,
    Attributes.armor,
    Attributes.critRate,
    Attributes.critDamage,
    Attributes.armorPenetration,
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXR0cmlidXRlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvQXR0cmlidXRlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxtQ0FBOEM7QUFnQjlDLE1BQXNCLFNBQVM7SUFPN0IsTUFBTSxDQUFDLFdBQW1CLEVBQUUsTUFBcUIsRUFBRTtRQUNqRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFFZCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDZCxJQUFJLElBQUksR0FBRyxDQUFDO1NBQ2I7UUFFRCxRQUFRLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDaEIsS0FBSyxPQUFPO2dCQUNWLElBQUksSUFBSSxHQUFHLElBQUEsZUFBTyxFQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxNQUFNO1lBQ1IsS0FBSyxVQUFVO2dCQUNiLElBQUksSUFBSSxHQUFHLElBQUEsZUFBTyxFQUFDLFdBQVcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQztnQkFDNUMsTUFBTTtZQUNSLEtBQUssWUFBWTtnQkFDZixJQUFJLElBQUksSUFBSSxJQUFBLGVBQU8sRUFBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDdEMsTUFBTTtZQUNSLEtBQUssa0JBQWtCO2dCQUNyQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO2dCQUM1QyxNQUFNO1lBQ1I7Z0JBQ0UsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO1NBQ3hDO1FBRUQsSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFO1lBQ2pCLElBQUksR0FBRyxJQUFBLGtCQUFVLEVBQUMsSUFBSSxDQUFDLENBQUM7U0FDekI7UUFFRCxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDZCxJQUFJ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