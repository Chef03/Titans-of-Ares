"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chest = void 0;
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const Item_1 = require("./Item");
const utils_1 = require("./utils");
const Pet_1 = require("./Pet");
const inventory_1 = require("../db/inventory");
const main_1 = require("../main");
const openingChestGif = `${utils_1.CDN_LINK}574852830125359126/862679388146368582/chest-open.gif`;
class Chest extends Item_1.Item {
    get id() {
        return `chest_${this.level}`;
    }
    get name() {
        return `${(0, utils_1.capitalize)(this.level)} Treasure Chest`;
    }
    get description() {
        return (0, common_tags_1.oneLine) `This is a ${(0, utils_1.capitalize)(this.level)} Treasure Chest awarded by
    the Monthly Challenge. You can open it for Pet Fragments.`;
    }
    static fromChestID(chestID) {
        switch (chestID) {
            case 'chest_gold':
                return new GoldChest();
            case 'chest_silver':
                return new SilverChest();
            case 'chest_bronze':
                return new BronzeChest();
        }
    }
    static fromMedal(medal) {
        switch (medal) {
            case 'GoldMedal':
                return new GoldChest();
            case 'SilverMedal':
                return new SilverChest();
            case 'BronzeMedal':
                return new BronzeChest();
            default:
                throw Error('invalid medal');
        }
    }
    openChestAnimation() {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GREEN)
            .setImage(openingChestGif)
            .setTitle(`Opening ${this.name}`);
        return embed;
    }
    show(count) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setThumbnail(this.imageUrl)
            .setTitle(this.name)
            .setDescription(this.description)
            .addField('Count', `\`x${count}\``);
        return embed;
    }
    /** open up the chest and add the fragments to the player's inventory */
    async use(player) {
        const fragments = [];
        const fragmentCount = this.getFragmentCount();
        for (let i = 0; i < fragmentCount; i++) {
            const pet = Pet_1.Pet.random();
            const { fragment } = pet;
            fragments.push(fragment);
            await fragment.save(player);
        }
        await (0, inventory_1.removeInventory)(player.id, this.id);
        return fragments;
    }
}
exports.Chest = Chest;
class GoldChest extends Chest {
    constructor() {
        super(...arguments);
        this.level = 'gold';
        this.imageUrl = `${utils_1.CDN_LINK}768053872400007218/863093260175540234/c8zixtnh-900.jpg`;
    }
    getFragmentCount() {
        return 3;
    }
}
class SilverChest extends Chest {
    constructor() {
        super(...arguments);
        this.level = 'silver';
        this.imageUrl = `${utils_1.CDN_LINK}768053872400007218/863093874058592286/magic-chest-3d-model-low-poly-max-obj-mtl-3ds-fbx-tga_1.png`;
    }
    getFragmentCount() {
        return main_1.client.random.pick([2, 3]);
    }
}
class BronzeChest extends Chest {
    constructor() {
        super(...arguments);
        this.level = 'bronze';
        this.imageUrl = `${utils_1.CDN_LINK}768053872400007218/863093260418416670/magic-chest-3d-model-low-poly-max-obj-mtl-3ds-fbx-tga.png`;
    }
    getFragmentCount() {
        return main_1.client.random.pick([1, 2]);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2hlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL0NoZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUEwQztBQUMxQyw2Q0FBc0M7QUFFdEMsaUNBQThCO0FBQzlCLG1DQUVpQjtBQUVqQiwrQkFBNEI7QUFFNUIsK0NBQWtEO0FBQ2xELGtDQUFpQztBQUtqQyxNQUFNLGVBQWUsR0FBRyxHQUFHLGdCQUFRLHNEQUFzRCxDQUFDO0FBRTFGLE1BQXNCLEtBQU0sU0FBUSxXQUFJO0lBT3RDLElBQUksRUFBRTtRQUNKLE9BQU8sU0FBUyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksSUFBSTtRQUNOLE9BQU8sR0FBRyxJQUFBLGtCQUFVLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztJQUNwRCxDQUFDO0lBRUQsSUFBSSxXQUFXO1FBQ2IsT0FBTyxJQUFBLHFCQUFPLEVBQUEsYUFBYSxJQUFBLGtCQUFVLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQzs4REFDUyxDQUFDO0lBQzdELENBQUM7SUFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQWdCO1FBQ2pDLFFBQVEsT0FBTyxFQUFFO1lBQ2YsS0FBSyxZQUFZO2dCQUNmLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUN6QixLQUFLLGNBQWM7Z0JBQ2pCLE9BQU8sSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUMzQixLQUFLLGNBQWM7Z0JBQ2pCLE9BQU8sSUFBSSxXQUFXLEVBQUUsQ0FBQztTQUM1QjtJQUNILENBQUM7SUFFRCxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQWdCO1FBQy9CLFFBQVEsS0FBSyxFQUFFO1lBQ2IsS0FBSyxXQUFXO2dCQUNkLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUN6QixLQUFLLGFBQWE7Z0JBQ2hCLE9BQU8sSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUMzQixL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