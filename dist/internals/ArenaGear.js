"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sword = exports.RightRing = exports.LeftRing = exports.Wrist = exports.Belt = exports.Gauntlets = exports.Boots = exports.Pants = exports.Chest = exports.Amulet = exports.Helmet = exports.ArenaGear = void 0;
const common_tags_1 = require("common-tags");
const Attributes_1 = require("./Attributes");
const Gear_1 = require("./Gear");
const List_1 = require("./List");
const Scroll_1 = require("./Scroll");
class ArenaGear extends Gear_1.Gear {
    constructor() {
        super(...arguments);
        this.set = 'Arena';
        this.scroll = new Scroll_1.ArenaScroll();
    }
    get name() {
        return `${this.set} ${this.constructor.name}`;
    }
    get id() {
        const pieceName = this.constructor.name.toLowerCase();
        return `${super.id}_arena_${pieceName}`;
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
                bonus = 0.6;
                break;
            case this.isBonus(gears, 5):
                bonus = 0.4;
                break;
            case this.isBonus(gears, 0):
                bonus = 0.2;
                break;
            default: return;
        }
        const description = (0, common_tags_1.oneLine) `${this.set} Set Armor Penetration \`Armor Penetration +${bonus * 100}%\``;
        return { bonus, description };
    }
}
exports.ArenaGear = ArenaGear;
class Helmet extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.socketable = true;
        this.baseStat = 1.5;
        this.price = 30;
    }
}
exports.Helmet = Helmet;
class Amulet extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.hp;
        this.baseStat = 150;
        this.price = 40;
    }
}
exports.Amulet = Amulet;
class Chest extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.socketable = true;
        this.baseStat = 1.8;
        this.price = 50;
    }
}
exports.Chest = Chest;
class Pants extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.socketable = true;
        this.baseStat = 1.7;
        this.price = 46;
    }
}
exports.Pants = Pants;
class Boots extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.speed;
        this.baseStat = 30;
        this.price = 26;
    }
}
exports.Boots = Boots;
class Gauntlets extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.baseStat = 0.7;
        this.price = 26;
    }
}
exports.Gauntlets = Gauntlets;
class Belt extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.baseStat = 0.5;
        this.price = 16;
    }
}
exports.Belt = Belt;
class Wrist extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.armor;
        this.baseStat = 0.5;
        this.price = 16;
    }
}
exports.Wrist = Wrist;
class LeftRing extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.critRate;
        this.baseStat = 0.015;
        this.price = 40;
    }
}
exports.LeftRing = LeftRing;
class RightRing extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.critDamage;
        this.baseStat = 0.15;
        this.price = 40;
    }
}
exports.RightRing = RightRing;
class Sword extends ArenaGear {
    constructor() {
        super(...arguments);
        this.attribute = Attributes_1.Attributes.strength;
        this.baseStat = 30;
        this.price = 100;
    }
}
exports.Sword = Sword;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJlbmFHZWFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9BcmVuYUdlYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQXNDO0FBQ3RDLDZDQUEwQztBQUMxQyxpQ0FBOEI7QUFDOUIsaUNBQThCO0FBQzlCLHFDQUF1QztBQUV2QyxNQUFzQixTQUFVLFNBQVEsV0FBSTtJQUE1Qzs7UUFDRSxRQUFHLEdBQUcsT0FBTyxDQUFDO1FBRWQsV0FBTSxHQUFHLElBQUksb0JBQVcsRUFBRSxDQUFDO0lBd0M3QixDQUFDO0lBdENDLElBQUksSUFBSTtRQUNOLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEQsQ0FBQztJQUVELElBQUksRUFBRTtRQUNKLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3RELE9BQU8sR0FBRyxLQUFLLENBQUMsRUFBRSxVQUFVLFNBQVMsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCxNQUFNLEtBQUssR0FBRztRQUNaLE9BQU8sV0FBSSxDQUFDLElBQUksQ0FBQztZQUNmLElBQUksTUFBTSxFQUFFO1lBQ1osSUFBSSxNQUFNLEVBQUU7WUFDWixJQUFJLEtBQUssRUFBRTtZQUNYLElBQUksS0FBSyxFQUFFO1lBQ1gsSUFBSSxLQUFLLEVBQUU7WUFDWCxJQUFJLFNBQVMsRUFBRTtZQUNmLElBQUksSUFBSSxFQUFFO1lBQ1YsSUFBSSxLQUFLLEVBQUU7WUFDWCxJQUFJLFFBQVEsRUFBRTtZQUNkLElBQUksU0FBUyxFQUFFO1lBQ2YsSUFBSSxLQUFLLEVBQUU7U0FDWixDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQWlCO1FBQ3JCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLFFBQVEsSUFBSSxFQUFF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