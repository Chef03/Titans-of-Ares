"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Legendary = exports.Epic = exports.Rare = exports.Uncommon = exports.Common = exports.RoughStone = exports.Gem = exports.Stone = exports.MiningPick = void 0;
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const Attributes_1 = require("./Attributes");
const utils_1 = require("./utils");
const List_1 = require("./List");
const Item_1 = require("./Item");
const main_1 = require("../main");
class MiningPick extends Item_1.Item {
    constructor() {
        super(...arguments);
        this.name = 'Mining Pick';
        this.id = 'pick_mining';
        this.description = 'This is a mining pick. You can use it to mine gems.';
        this.imageUrl = `${utils_1.CDN_LINK}853949658795081738/879066526790082570/Pickaxe.jpg`;
        this.miningAnimationUrl = `${utils_1.CDN_LINK}574852830125359126/882898676111003658/mining.gif`;
    }
    show(count) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle(this.name)
            .setThumbnail(this.imageUrl)
            .setDescription(this.description)
            .addField('Count', count, true);
        return embed;
    }
    showMiningAnimation() {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle('Mining for gems')
            .setImage(this.miningAnimationUrl);
        return embed;
    }
}
exports.MiningPick = MiningPick;
class Stone extends Item_1.Item {
    constructor() {
        super(...arguments);
        this.combineAnimationUrl = `${utils_1.CDN_LINK}574852830125359126/884774042899447838/ezgif.com-gif-maker.gif`;
    }
    static random() {
        const stones = [
            Legendary.random(),
            Epic.random(),
            Rare.random(),
            Common.random(),
            Uncommon.random(),
            new RoughStone(),
        ];
        for (const stone of stones) {
            if (main_1.client.random.bool(stone.rarity)) {
                return stone;
            }
        }
        return new RoughStone();
    }
    static get all() {
        return List_1.List.from([
            new RoughStone(),
            ...Gem.all,
        ]);
    }
    showCombineAnimation() {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle('Combining gems')
            .setImage(this.combineAnimationUrl);
        return embed;
    }
}
exports.Stone = Stone;
class Gem extends Stone {
    constructor(attribute) {
        super();
        this.attribute = attribute;
        const gem = this.constructor;
        this.attributeValue = gem.baseStats[this.attribute.key];
    }
    static fromID(stoneID) {
        const [, rarity, attribID] = stoneID.split('_');
        const attribute = Attributes_1.Attributes.fromString(attribID);
        return Gem.fromRarity(rarity, attribute);
    }
    static fromDB(stoneDB) {
        const gem = Gem.fromID(stoneDB.ItemID);
        gem.inventoryID = stoneDB.ID;
        gem.gearID = stoneDB.GearID;
        return gem;
    }
    static fromRarity(name, attribute) {
        switch (name) {
            case 'common': return new Common(attribute);
            case 'uncommon': return new Uncommon(attribute);
            case 'rare': return new Rare(attribute);
            case 'epic': return new Epic(attribute);
            case 'legendary': return new Legendary(attribute);
        }
        throw new Error(`invalid rarity "${name}"`);
    }
    static random() {
        const { name } = this;
        // subclass
        if (name !== 'Gem') {
            const attributes = Object.entries(this.baseStats);
            const [attributeName, attributeValue] = main_1.client.random.pick(attributes);
            const attribute = Attributes_1.Attributes.fromString(attributeName);
            // eslint-disable-next-line
            // @ts-ignore
            return new this.prototype.constructor(attribute, attributeValue);
        }
        const allGems = List_1.List.from([
            Common.random(),
            Uncommon.random(),
            Rare.random(),
            Epic.random(),
            Legendary.random(),
        ]);
        return allGems.weightedRandom((gem) => gem.rarity * 1000);
    }
    static get all() {
        const { name } = this;
        // subclass
        if (name !== 'Gem') {
            const attributes = Object.entries(this.baseStats);
            const gems = attributes.map(([attributeName, attributeValue]) => {
                const attribute = Attributes_1.Attributes.fromString(attributeName);
                // eslint-disable-next-line
                // @ts-ignore
                return new this.prototype.constructor(attribute, attributeValue);
            });
            return List_1.List.from(gems);
        }
        return List_1.List.from([
            ...Common.all,
            ...Uncommon.all,
            ...Rare.all,
            ...Epic.all,
            ...Legendary.all,
        ]);
    }
    static isValidQuality(quality) {
        return this.all.map((x) => x.quality).some((x) => x === quality);
    }
    get name() {
        const gemName = this.constructor.name;
        return `${gemName} ${this.attribute.name} Gem`;
    }
    get quality() {
        return this.constructor.name.toLowerCase();
    }
    get id() {
        const rarityName = this.constructor.name.toLowerCase();
        const attribID = this.attribute.key;
        return `gem_${rarityName}_${attribID}`;
    }
    get description() {
        return (0, common_tags_1.oneLine) `This is a ${this.name}. You can combine multiple gems of the
    same quality to craft a better gem.`;
    }
    get imageUrl() {
        const gem = this.constructor;
        const shortUrl = gem.imagesUrl[this.attribute.key];
        return utils_1.CDN_LINK + shortUrl;
    }
    get stat() {
        switch (this.attribute.key) {
            case Attributes_1.Attributes.critRate.key:
            case Attributes_1.Attributes.armorPenetration.key:
                return `+${Math.round(this.attributeValue * 100)}% ${this.attribute.name}`;
            default:
                return `+${this.attributeValue} ${this.attribute.name}`;
        }
    }
    show(count) {
        // gems required to upgrade text
        const gems = `x${this.requirement} ${(0, utils_1.capitalize)(this.quality)} Gem`;
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle(this.name)
            .setThumbnail(this.imageUrl)
            .setDescription(this.description);
        if (count !== -1)
            embed.addField('Count', count, true);
        embed
            .addField('Stat', (0, utils_1.inlineCode)(this.stat), true)
            .addField('Gems required to combine', (0, utils_1.inlineCode)(gems), true);
        return embed;
    }
    inspect(count, index) {
        const gemInfo = this.show(count);
        if (index) {
            gemInfo.setTitle(`${index}. ${gemInfo.title}`);
        }
        return gemInfo;
    }
}
exports.Gem = Gem;
class RoughStone extends Stone {
    constructor() {
        super(...arguments);
        this.rarity = 0.85;
        this.name = 'Rough Stone';
        this.id = 'stone_rough';
        this.requirement = 12;
        this.imageUrl = `${utils_1.CDN_LINK}852530378916888626/883343839006457856/68.png`;
        this.description = (0, common_tags_1.oneLine) `These are rough stones.  You can combine 12 of them to
  make a common gem.`;
    }
    get product() {
        return Common.random();
    }
    show(count) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle(this.name)
            .setThumbnail(this.imageUrl)
            .setDescription(this.description);
        if (count !== -1)
            embed.addField('Count', count, true);
        return embed;
    }
    // eslint-disable-next-line
    inspect(count, _) {
        return this.show(count);
    }
}
exports.RoughStone = RoughStone;
class Common extends Gem {
    constructor() {
        super(...arguments);
        this.rarity = 0.1;
        this.requirement = 5;
    }
    get product() {
        return Uncommon.random();
    }
}
exports.Common = Common;
Common.baseStats = {
    hp: 50,
    strength: 10,
    armor: 1,
    speed: 10,
    critRate: 0.04,
    critDamage: 0.2,
    armorPenetration: 0.04,
};
Common.imagesUrl = {
    hp: '852530378916888626/883344119517282314/Common_HP_Gem.png',
    strength: '852530378916888626/883346582546837564/Common_Strength_Gem.png',
    armor: '852530378916888626/883344368344391730/Common_Armor_Gem.png',
    speed: '852530378916888626/883346343643471922/Common_Speed_Gem.png',
    critRate: '852530378916888626/883345606096068638/Common_Crit_Chance_Gem.png',
    critDamage: '852530378916888626/883345926213759037/Common_Crit_Damage_Gem.png',
    armorPenetration: '852530378916888626/883344730564485150/Common_Armor_Pen_Gem.png',
};
class Uncommon extends Gem {
    constructor() {
        super(...arguments);
        this.rarity = 0.04;
        this.requirement = 5;
    }
    get product() {
        return Rare.random();
    }
}
exports.Uncommon = Uncommon;
Uncommon.baseStats = {
    hp: 80,
    strength: 16,
    armor: 1.6,
    speed: 16,
    critRate: 0.064,
    critDamage: 0.3,
    armorPenetration: 0.06,
};
Uncommon.imagesUrl = {
    hp: '852530378916888626/883344155261161552/Uncommon_HP_Gem.png',
    strength: '852530378916888626/883346601614147634/Uncommon_Strength_Gem.png',
    armor: '852530378916888626/883344391262048287/Uncommon_Armor_Gem.png',
    speed: '852530378916888626/883346390825185330/Rare_Speed_Gem.png',
    critRate: '852530378916888626/883348525138706452/76_1.png',
    critDamage: '852530378916888626/883345951798984714/Uncommon_crit_Damage_Gem.png',
    armorPenetration: '852530378916888626/883357018533007370/Uncommon_Armor_Pen.png',
};
class Rare extends Gem {
    constructor() {
        super(...arguments);
        this.rarity = 0.007;
        this.requirement = 5;
    }
    get product() {
        return Epic.random();
    }
}
exports.Rare = Rare;
Rare.baseStats = {
    hp: 120,
    strength: 24,
    armor: 2.4,
    speed: 24,
    critRate: 0.096,
    critDamage: 0.3,
    armorPenetration: 0.06,
};
Rare.imagesUrl = {
    hp: '852530378916888626/883344178652786708/Rare_HP_Gem.png',
    strength: '852530378916888626/883346625391648778/Rare_Strength_Gem.png',
    armor: '852530378916888626/883344438317953165/Rare_Armor_Gem.png',
    speed: '852530378916888626/883346375109148702/Uncommon_Speed_Gem.png',
    critRate: '852530378916888626/883348690021015552/Uncommon_Crit_Gem.png',
    critDamage: '852530378916888626/883345971902296114/Rare_crit_Damage_Gem.png',
    armorPenetration: '852530378916888626/883344798784835584/Rare_Armor_Pen_Gem.png',
};
class Epic extends Gem {
    constructor() {
        super(...arguments);
        this.rarity = 0.002;
        this.requirement = 5;
    }
    get product() {
        return Legendary.random();
    }
}
exports.Epic = Epic;
Epic.baseStats = {
    hp: 150,
    strength: 30,
    armor: 3,
    speed: 30,
    critRate: 0.12,
    critDamage: 0.6,
    armorPenetration: 0.12,
};
Epic.imagesUrl = {
    hp: '852530378916888626/883344209296392232/Epic_HP_Gem.png',
    strength: '852530378916888626/883346640222687322/Epic_Strength_Gem.png',
    armor: '852530378916888626/883344463538323576/Epic_Armor_Gem.png',
    speed: '852530378916888626/883346412220350484/Epic_Speed_Gem.png',
    critRate: '852530378916888626/883348573616480317/48.png',
    critDamage: '852530378916888626/883346000826224730/Epic_Crit_damage_Gem.png',
    armorPenetration: '852530378916888626/883344859564490763/Epic_Armor_Pen_Gem.png',
};
class Legendary extends Gem {
    constructor() {
        super(...arguments);
        this.rarity = 0.001;
        this.requirement = 3;
    }
    get product() {
        return Legendary.random();
    }
}
exports.Legendary = Legendary;
Legendary.baseStats = {
    hp: 200,
    strength: 40,
    armor: 4,
    speed: 40,
    critRate: 0.16,
    critDamage: 0.8,
    armorPenetration: 0.15,
};
Legendary.imagesUrl = {
    hp: '852530378916888626/883344236035047454/Legendary_HP_Gem.png',
    strength: '852530378916888626/883346658342084629/Legendary_Strength_Gem.png',
    armor: '852530378916888626/883344490046308382/Legendary_Armor_Gem.png',
    speed: '852530378916888626/883346432965365790/Legendary_Speed_Gem.png',
    critRate: '852530378916888626/883348762603454514/Epic_Crit_chance_Gem.png',
    critDamage: '852530378916888626/883346028798046258/Legendary_Crit_Damage_Gem.png',
    armorPenetration: '852530378916888626/883344881634914355/Legendary_Armor_Pen_Gem.png',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWluaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9NaW5pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQTBDO0FBQzFDLDZDQUFzQztBQUV0Qyw2Q0FBcUQ7QUFDckQsbUNBRWlCO0FBQ2pCLGlDQUE4QjtBQUU5QixpQ0FBOEI7QUFDOUIsa0NBQWlDO0FBRWpDLE1BQWEsVUFBVyxTQUFRLFdBQUk7SUFBcEM7O1FBQ0UsU0FBSSxHQUFHLGFBQWEsQ0FBQztRQUVyQixPQUFFLEdBQUcsYUFBYSxDQUFDO1FBRW5CLGdCQUFXLEdBQUcscURBQXFELENBQUM7UUFFcEUsYUFBUSxHQUFHLEdBQUcsZ0JBQVEsbURBQW1ELENBQUM7UUFFMUUsdUJBQWtCLEdBQUcsR0FBRyxnQkFBUSxrREFBa0QsQ0FBQztJQXFCckYsQ0FBQztJQW5CQyxJQUFJLENBQUMsS0FBYTtRQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDN0IsUUFBUSxDQUFDLGFBQUssQ0FBQzthQUNmLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ25CLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO2FBQzNCLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO2FBQ2hDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWxDLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELG1CQUFtQjtRQUNqQixNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUU7YUFDN0IsUUFBUSxDQUFDLGFBQUssQ0FBQzthQUNmLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQzthQUMzQixRQUFRLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFckMsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQ0Y7QUE5QkQsZ0NBOEJDO0FBRUQsTUFBc0IsS0FBTSxTQUFR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