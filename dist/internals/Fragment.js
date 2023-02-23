"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Fragment = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const inventory_1 = require("../db/inventory");
const pet_1 = require("../db/pet");
const Item_1 = require("./Item");
const Pet_1 = require("./Pet");
const utils_1 = require("./utils");
class Fragment extends Item_1.Item {
    constructor(id) {
        super();
        this.id = id;
        this.summonGif = `${utils_1.CDN_LINK}852546444086214676/863007776983613460/giphy_1.gif`;
        this.upgradeGif = `${utils_1.CDN_LINK}852546444086214676/863011578663272448/giphy_5.gif`;
        this.convertAnimationGif = `${utils_1.CDN_LINK}852530378916888626/864407783918403624/ezgif-3-cce177c40b9b.gif`;
        const petID = this.id.split('_').slice(1).join('_');
        this.pet = Pet_1.Pet.fromPetID(petID);
        this.price = this.pet instanceof Pet_1.Dragon ? 45 : 30;
    }
    static fromPetID(petID) {
        return new Fragment(`fragment_${petID}`);
    }
    static fromPet(pet) {
        const fragment = Fragment.fromPetID(pet.id);
        fragment.pet = pet;
        return fragment;
    }
    /** mininum fragments in order to obtain the pet */
    static get minFragments() {
        return 5;
    }
    get name() {
        return `${this.pet.name}'s fragment`;
    }
    get description() {
        return (0, common_tags_1.oneLine) `This is a fragment for the ${this.pet.name}. If you have
    enough fragments you can summon this pet or upgrade it.`;
    }
    static get all() {
        return Pet_1.Pet.all.mapList((pet) => pet.fragment);
    }
    summonAnimation() {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .setImage(this.summonGif)
            .setTitle(`Summoning ${this.pet.name}`);
        return embed;
    }
    upgradeAnimation() {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .setImage(this.upgradeGif)
            .setTitle(`Upgrading ${this.pet.name}`);
        return embed;
    }
    convertAnimation(name) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .setImage(this.convertAnimationGif)
            .setTitle(`Converting ${this.name} to ${name}`);
        return embed;
    }
    show(count, opt) {
        const action = this.pet.star === -1 ? 'summon' : 'upgrade';
        const required = this.pet.upgradeCost;
        const upgradeAmount = this.pet.star >= 5
            ? 'max level' : `\`${count}/${required}\``;
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle(this.name)
            .setThumbnail(this.pet.fragmentImageUrl)
            .setDescription(this.description)
            .addField(`Fragments to ${action}`, upgradeAmount, true);
        if (opt?.price) {
            embed.addField('Price', this.price, true);
        }
        return embed;
    }
    /** Merges fragments and remove the fragments from player's inventory. Adds
     * obtained pet to user's pet collection. If pet already exists, it will
     * upgrade the pet.
     * */
    async use(player) {
        const playerOwnedPet = player.pets.find((x) => x.id === this.pet.id);
        const fragmentCost = playerOwnedPet?.upgradeCost || Fragment.minFragments;
        for (let i = 0; i < fragmentCost; i++)
            await (0, inventory_1.removeInventory)(player.id, this.id);
        if (playerOwnedPet) {
            await (0, pet_1.upgradePet)(player.id, playerOwnedPet.id);
            return 'upgrade';
        }
        await (0, pet_1.addPet)(player.id, this.pet.id);
        return 'obtain';
    }
}
exports.Fragment = Fragment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnJhZ21lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL0ZyYWdtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDZDQUFzQztBQUN0QywyQ0FBMEM7QUFDMUMsK0NBQWtEO0FBQ2xELG1DQUErQztBQUMvQyxpQ0FBOEI7QUFDOUIsK0JBQTJDO0FBRTNDLG1DQUFnRDtBQUloRCxNQUFhLFFBQVMsU0FBUSxXQUFJO0lBV2hDLFlBQW1CLEVBQWM7UUFDL0IsS0FBSyxFQUFFLENBQUM7UUFEUyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBTnpCLGNBQVMsR0FBRyxHQUFHLGdCQUFRLG1EQUFtRCxDQUFDO1FBRTNFLGVBQVUsR0FBRyxHQUFHLGdCQUFRLG1EQUFtRCxDQUFDO1FBRTVFLHdCQUFtQixHQUFHLEdBQUcsZ0JBQVEsZ0VBQWdFLENBQUM7UUFJeEcsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsR0FBRyxHQUFHLFNBQUcsQ0FBQyxTQUFTLENBQUMsS0FBYyxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxZQUFZLFlBQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVELE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBWTtRQUMzQixPQUFPLElBQUksUUFBUSxDQUFDLFlBQVksS0FBSyxFQUFnQixDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBUTtRQUNyQixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QyxR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