"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sword = exports.RightRing = exports.LeftRing = exports.Wrist = exports.Belt = exports.Gauntlets = exports.Boots = exports.Pants = exports.Chest = exports.Amulet = exports.Helmet = exports.ApprenticeGear = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const Attributes_1 = require("./Attributes");
const Gear_1 = require("./Gear");
const List_1 = require("./List");
const utils_1 = require("./utils");
class ApprenticeGear extends Gear_1.Gear {
    constructor() {
        super(...arguments);
        this.set = 'Apprentice';
        this.reflectAnimationUrl = `${utils_1.CDN_LINK}852530378916888626/868442912294309898/3o7WTqRKlVRj0wsYQo.gif`;
    }
    get name() {
        return `${this.set} ${this.constructor.name}`;
    }
    static get all() {
        return List_1.List.from([
            new Helmet(),
            new Amulet(),
            new Chest(),
            new Pants(),
            new Boots(),
            new Gauntlets(),
            new Belt(),
            new Wrist(),
            new LeftRing(),
            new RightRing(),
            new Sword(),
        ]);
    }
    bonus(gears) {
        let bonus = 0;
        switch (true) {
            case this.isBonus(gears, 10):
                bonus = 0.5;
                break;
            case this.isBonus(gears, 5):
                bonus = 0.3;
                break;
            case this.isBonus(gears, 0):
                bonus = 0.1;
                break;
            default: return;
        }
        const description = (0, common_tags_1.oneLine) `${this.set} Set Reflect Skill \`Reflect ${bonus * 100}% of
      opponents first attack\``;
        return { bonus, description };
    }
    reflectAnimation(playerName, damage, bonus) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .setTitle(`${this.set} Set Reflect Skill`)
            .setImage(this.reflectAnimationUrl)
            .setDescription((0, common_tags_1.oneLine) `${playerName} reflected \`${Math.round(damage)} damage (${bonus * 100}%)\``);
        return embed;
    }
    get id() {
        const pieceName = this.constructor.name.toLowerCase();
        return `${super.id}_apprentice_${pieceName}`;
    }
}
exports.ApprenticeGear = ApprenticeGear;
class Helmet extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.socketable = true;
        this.baseStat = 1;
        this.price = 150;
    }
}
exports.Helmet = Helmet;
class Amulet extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.hp;
        this.baseStat = 100;
        this.price = 200;
    }
}
exports.Amulet = Amulet;
class Chest extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.socketable = true;
        this.baseStat = 1.2;
        this.price = 250;
    }
}
exports.Chest = Chest;
class Pants extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.socketable = true;
        this.baseStat = 1.15;
        this.price = 225;
    }
}
exports.Pants = Pants;
class Boots extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.speed;
        this.baseStat = 20;
        this.price = 125;
    }
}
exports.Boots = Boots;
class Gauntlets extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.baseStat = 0.5;
        this.price = 125;
    }
}
exports.Gauntlets = Gauntlets;
class Belt extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.baseStat = 0.3;
        this.price = 75;
    }
}
exports.Belt = Belt;
class Wrist extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.baseStat = 0.3;
        this.price = 75;
    }
}
exports.Wrist = Wrist;
class LeftRing extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.critRate;
        this.baseStat = 0.01;
        this.price = 200;
    }
    get name() {
        return `${this.set} Left Ring`;
    }
}
exports.LeftRing = LeftRing;
class RightRing extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.critDamage;
        this.baseStat = 0.1;
        this.price = 200;
    }
    get name() {
        return `${this.set} Right Ring`;
    }
}
exports.RightRing = RightRing;
class Sword extends ApprenticeGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.strength;
        this.baseStat = 20;
        this.price = 500;
    }
}
exports.Sword = Sword;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXBwcmVudGljZUdlYXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL0FwcHJlbnRpY2VHZWFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFzQztBQUN0QywyQ0FBMEM7QUFDMUMsNkNBQTBDO0FBQzFDLGlDQUE4QjtBQUM5QixpQ0FBOEI7QUFDOUIsbUNBQXlDO0FBRXpDLE1BQXNCLGNBQWUsU0FBUSxXQUFJO0lBQWpEOztRQUNFLFFBQUcsR0FBRyxZQUFZLENBQUM7UUFFbkIsd0JBQW1CLEdBQUcsR0FBRyxnQkFDekIsOERBQThELENBQUM7SUFxRGpFLENBQUM7SUFuREMsSUFBSSxJQUFJO1FBQ04sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoRCxDQUFDO0lBRUQsTUFBTSxLQUFLLEdBQUc7UUFDWixPQUFPLFdBQUksQ0FBQyxJQUFJLENBQUM7WUFDZixJQUFJLE1BQU0sRUFBRTtZQUNaLElBQUksTUFBTSxFQUFFO1lBQ1osSUFBSSxLQUFLLEVBQUU7WUFDWCxJQUFJLEtBQUssRUFBRTtZQUNYLElBQUksS0FBSyxFQUFFO1lBQ1gsSUFBSSxTQUFTLEVBQUU7WUFDZixJQUFJLElBQUksRUFBRTtZQUNWLElBQUksS0FBSyxFQUFFO1lBQ1gsSUFBSSxRQUFRLEVBQUU7WUFDZCxJQUFJLFNBQVMsRUFBRTtZQUNmLElBQUksS0FBSyxFQUFFO1NBQ1osQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELEtBQUssQ0FBQyxLQUFpQjtRQUNyQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDZCxRQUFRLElBQUksRUFBRTtZQUNaLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUFFLEtBQUssR0FBRyxHQUFHLENBQUM7Z0JBQUMsTUFBTTtZQUNqRCxLQUFLLElBQUksQ0FBQyxPQUFP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