"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Gear = void 0;
const discord_js_1 = require("discord.js");
const Item_1 = require("./Item");
const List_1 = require("./List");
const Scroll_1 = require("./Scroll");
const utils_1 = require("./utils");
const main_1 = require("../main");
class Gear extends Item_1.Item {
    constructor() {
        super(...arguments);
        this.socketable = false;
        this.scroll = new Scroll_1.Scroll();
        this.equipped = false;
        this.upgradeAnimationUrl = `${utils_1.CDN_LINK}852530378916888626/867765847312826398/image0.gif`;
        this.level = 0;
    }
    get id() {
        return `gear`;
    }
    get multiplier() {
        return 0.2 * this.level;
    }
    get attributeValue() {
        return this.baseStat + this.baseStat * this.multiplier;
    }
    get description() {
        const formatOpt = {
            prefix: true,
            suffix: true,
        };
        const desc = this.attribute.format(this.attributeValue, formatOpt);
        if (this.gem) {
            const gemStat = this.gem.attribute.format(this.gem.attributeValue, formatOpt);
            return `${desc}\n${Gear.socketEmoji} ${gemStat}`;
        }
        return desc;
    }
    static get all() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { ApprenticeGear } = require('./ApprenticeGear');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { ArenaGear } = require('./ArenaGear');
        return List_1.List.from([
            ...ApprenticeGear.all,
            ...ArenaGear.all,
        ]);
    }
    static fromID(id) {
        return Gear.all.get(id);
    }
    static fromDB(gear) {
        const g = Gear.fromID(gear.ItemID);
        g.level = gear.Level;
        g.equipped = gear.Equipped;
        return g;
    }
    get upgradeChance() {
        switch (this.level) {
            case 0: return 1;
            case 1: return 0.9;
            case 2: return 0.8;
            case 3: return 0.7;
            case 4: return 0.5;
            case 5: return 0.45;
            case 6: return 0.2;
            case 7: return 0.05;
            case 8: return 0.02;
            case 9: return 0.005;
            default: return 0;
        }
    }
    use(fighter) {
        fighter[this.attribute.key] += this.attributeValue;
        if (this.gem) {
            fighter[this.gem.attribute.key] += this.gem.attributeValue;
        }
    }
    show(count) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle(this.name)
            .setDescription(`\`${this.description}\``)
            .addField('Price', this.price, true)
            .addField('Owned', count > 0 ? 'yes' : 'no', true)
            .addField('Level', this.level, true);
        return embed;
    }
    inspect(scroll) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle(this.name)
            .setDescription(`\`${this.description}\``)
            .addField('Upgrade Scrolls', scroll, true)
            .addField('Level', this.level == 10 ? 'max' : this.level, true);
        if (this.socketable) {
            const gemName = this.gem?.name || 'No gem socketed';
            embed.addField('Socketed Gem', (0, utils_1.inlineCode)(gemName), true);
        }
        return embed;
    }
    upgradeAnimation() {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .setTitle(`Upgrading ${this.name}`)
            .setImage(this.upgradeAnimationUrl);
        return embed;
    }
    /** returns true if upgrade successfull */
    upgrade() {
        return main_1.client.random.bool(this.upgradeChance);
    }
    /**
     * gets the piece name
     * @example "Arena Helmet" -> "helmet"
     * */
    get piece() {
        return this.constructor.name.toLowerCase();
    }
    isBonus(gears, minLevel) {
        const { set } = this;
        return gears.length === 11
            && gears.every((gear) => {
                const passMinGear = gear.level >= minLevel;
                const sameGearSet = gear.set === set;
                return passMinGear && sameGearSet;
            });
    }
    /** returns magnitude of bonus */
    static getBonus(gears) {
        const gear = gears.get(0);
        return gear?.bonus(gears);
    }
}
exports.Gear = Gear;
Gear.socketEmoji = '💠';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2Vhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvR2Vhci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBMEM7QUFJMUMsaUNBQThCO0FBQzlCLGlDQUE4QjtBQUU5QixxQ0FBa0M7QUFDbEMsbUNBRWlCO0FBQ2pCLGtDQUFpQztBQVlqQyxNQUFzQixJQUFLLFNBQVEsV0FBSTtJQUF2Qzs7UUFpQkUsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUVuQixXQUFNLEdBQUcsSUFBSSxlQUFNLEVBQUUsQ0FBQztRQUV0QixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBRWpCLHdCQUFtQixHQUFHLEdBQUcsZ0JBQVEsa0RBQWtELENBQUM7UUFFcEYsVUFBSyxHQUFHLENBQUMsQ0FBQztJQStJWixDQUFDO0lBN0lDLElBQUksRUFBRTtRQUNKLE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDWixPQUFPLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQzFCLENBQUM7SUFFRCxJQUFJLGNBQWM7UUFDaEIsT0FBTyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6RCxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ2IsTUFBTSxTQUFTLEdBQUc7WUFDaEIsTUFBTSxFQUFFLElBQUk7WUFDWixNQUFNLEVBQUUsSUFBSTtTQUNiLENBQUM7UUFFRixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRW5FLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNaLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxTQUFTLENB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