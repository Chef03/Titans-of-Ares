"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Siren = exports.Medusa = exports.AdultCerberus = exports.MediumCerberus = exports.SmallCerberus = exports.AdultGiant = exports.MediumGiant = exports.YoungGiant = exports.BerserkerWerewolf = exports.MatureWerewolf = exports.SmallWerewolf = exports.AngryHarpy = exports.MediumHarpy = exports.SmallHarpy = exports.GiantRat = exports.MediumRat = exports.SmallRat = exports.Reward = void 0;
const Item_1 = require("./Item");
const List_1 = require("./List");
const discord_js_1 = require("discord.js");
const utils_1 = require("./utils");
class Reward extends Item_1.Item {
    static get all() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return List_1.List.from([
            new SmallRat(),
            new MediumRat(),
            new GiantRat(),
            new YoungGiant(),
            new MediumGiant(),
            new AdultGiant(),
            new SmallWerewolf(),
            new MatureWerewolf(),
            new BerserkerWerewolf(),
            new SmallCerberus(),
            new MediumCerberus(),
            new AdultCerberus(),
            new SmallHarpy(),
            new MediumHarpy(),
            new AngryHarpy(),
            new Medusa(),
            new Siren()
        ]);
    }
    show(count) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle(this.name);
        return embed;
    }
    static fromID(id) {
        return Reward.all.get(id);
    }
    static fromDB(reward) {
        const r = Reward.fromID(reward.ItemID.toString());
        return r;
    }
    get id() {
        return `reward_${this.name}`;
    }
}
exports.Reward = Reward;
class SmallRat extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Small Rat';
        this.name = this.boss + ' Emblem';
    }
}
exports.SmallRat = SmallRat;
class MediumRat extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Medium Rat';
        this.name = this.boss + ' Emblem';
    }
}
exports.MediumRat = MediumRat;
class GiantRat extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Giant Rat';
        this.name = this.boss + ' Emblem';
    }
}
exports.GiantRat = GiantRat;
class SmallHarpy extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Small Harpy';
        this.name = this.boss + ' Emblem';
    }
}
exports.SmallHarpy = SmallHarpy;
class MediumHarpy extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Medium Harpy';
        this.name = this.boss + ' Emblem';
    }
}
exports.MediumHarpy = MediumHarpy;
class AngryHarpy extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Angry Harpy';
        this.name = this.boss + ' Emblem';
    }
}
exports.AngryHarpy = AngryHarpy;
class SmallWerewolf extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Small Werewolf';
        this.name = this.boss + ' Emblem';
    }
}
exports.SmallWerewolf = SmallWerewolf;
class MatureWerewolf extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Mature Werewolf';
        this.name = this.boss + ' Emblem';
    }
}
exports.MatureWerewolf = MatureWerewolf;
class BerserkerWerewolf extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Berserker Werewolf';
        this.name = this.boss + ' Emblem';
    }
}
exports.BerserkerWerewolf = BerserkerWerewolf;
class YoungGiant extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Young Giant';
        this.name = this.boss + ' Emblem';
    }
}
exports.YoungGiant = YoungGiant;
class MediumGiant extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Medium Sized Giant';
        this.name = this.boss + ' Emblem';
    }
}
exports.MediumGiant = MediumGiant;
class AdultGiant extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Adult Giant';
        this.name = this.boss + ' Emblem';
    }
}
exports.AdultGiant = AdultGiant;
class SmallCerberus extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Small Cerberus';
        this.name = this.boss + ' Emblem';
    }
}
exports.SmallCerberus = SmallCerberus;
class MediumCerberus extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Medium Cerberus';
        this.name = this.boss + ' Emblem';
    }
}
exports.MediumCerberus = MediumCerberus;
class AdultCerberus extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Adult Cerberus';
        this.name = this.boss + ' Emblem';
    }
}
exports.AdultCerberus = AdultCerberus;
class Medusa extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Medusa';
        this.name = this.boss + ' Emblem';
    }
}
exports.Medusa = Medusa;
class Siren extends Reward {
    constructor() {
        super(...arguments);
        this.boss = 'Siren';
        this.name = this.boss + ' Emblem';
    }
}
exports.Siren = Siren;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmV3YXJkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9SZXdhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQThCO0FBQzlCLGlDQUE4QjtBQUU5QiwyQ0FBMEM7QUFDMUMsbUNBQWdDO0FBUWhDLE1BQXNCLE1BQU8sU0FBUSxXQUFJO0lBS3JDLE1BQU0sS0FBSyxHQUFHO1FBQ1YsOERBQThEO1FBQzlELE9BQU8sV0FBSSxDQUFDLElBQUksQ0FBQztZQUNiLElBQUksUUFBUSxFQUFFO1lBQ2QsSUFBSSxTQUFTLEVBQUU7WUFDZixJQUFJLFFBQVEsRUFBRTtZQUNkLElBQUksVUFBVSxFQUFFO1lBQ2hCLElBQUksV0FBVyxFQUFFO1lBQ2pCLElBQUksVUFBVSxFQUFFO1lBQ2hCLElBQUksYUFBYSxFQUFFO1lBQ25CLElBQUksY0FBYyxFQUFFO1lBQ3BCLElBQUksaUJBQWlCLEVBQUU7WUFDdkIsSUFBSSxhQUFhLEVBQUU7WUFDbkIsSUFBSSxjQUFjLEVBQUU7WUFDcEIsSUFBSSxhQUFhLEVBQUU7WUFDbkIsSUFBSSxVQUFVLEVBQUU7WUFDaEIsSUFBSSxXQUFXLEVBQUU7WUFDakIsSUFBSSxVQUFVLEVBQUU7WUFDaEIsSUFBSSxNQUFNLEVBQUU7WUFDWixJQUFJLEtBQUssRUFBRTtTQUNkLENBQUMsQ0FBQztJQUNQLENBQUM7SUFJRCxJQUFJLENBQUMsS0FBYTtRQUNkLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUMzQixRQUFRLENBQUMsYUFBSyxDQUFDO2FBQ2YsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUV4QixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBR0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFVO1FBQ3BCLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFFLENBQUM7SUFDL0IsQ0FBQztJQUlELE1BQU0s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