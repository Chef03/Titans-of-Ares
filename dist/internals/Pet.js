"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dragon = exports.Manticore = exports.Minotaur = exports.Gryphon = exports.Golem = exports.Wisp = exports.Pet = exports.PetID = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const luxon_1 = require("luxon");
const Fragment_1 = require("./Fragment");
const utils_1 = require("./utils");
const List_1 = require("./List");
const main_1 = require("../main");
var PetID;
(function (PetID) {
    PetID["Wisp"] = "pet_wisp";
    PetID["Golem"] = "pet_golem";
    PetID["Gryphon"] = "pet_gryphon";
    PetID["Minotaur"] = "pet_minotaur";
    PetID["Manticore"] = "pet_manticore";
    PetID["Dragon"] = "pet_dragon";
})(PetID = exports.PetID || (exports.PetID = {}));
class Pet {
    constructor() {
        /** represents pet level.
         * -1 represents this pet has not been obtained yet
         * */
        this.star = -1;
        this.active = false;
        this.createdAt = luxon_1.DateTime.now();
    }
    static fromPetID(id) {
        switch (id) {
            case PetID.Wisp: return new Wisp();
            case PetID.Golem: return new Golem();
            case PetID.Gryphon: return new Gryphon();
            case PetID.Minotaur: return new Minotaur();
            case PetID.Manticore: return new Manticore();
            case PetID.Dragon: return new Dragon();
        }
    }
    static get all() {
        return List_1.List.from([
            new Wisp(),
            new Golem(),
            new Gryphon(),
            new Minotaur(),
            new Manticore(),
            new Dragon(),
        ]);
    }
    static fromDB(petDB) {
        const pet = Pet.fromPetID(petDB.PetID);
        pet.star = petDB.Star;
        pet.active = petDB.Active === 1;
        pet.createdAt = luxon_1.DateTime.fromSQL(petDB.Created, { zone: 'gmt' });
        return pet;
    }
    /** gets random pet based off weightage
     *  dragon - 5%
     *  others - 19%
     * */
    static random() {
        return Pet.all.weightedRandom((x) => (x.id === PetID.Dragon ? 5 : 19));
    }
    get fragment() {
        return Fragment_1.Fragment.fromPetID(this.id);
    }
    fragmentCard(fragmentCount) {
        const action = this.star === -1 ? 'summon' : 'upgrade';
        const requiredFragment = action === 'summon'
            ? Fragment_1.Fragment.minFragments : this.upgradeCost;
        const footerText = (0, common_tags_1.oneLine) `You currently have 
    ${fragmentCount}/${requiredFragment} fragments to ${action} this pet`;
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .setTitle(`${this.name}'s Fragment`)
            .setThumbnail(this.fragmentImageUrl)
            .addField('Active Skill', this.description)
            .addField('\u200b', '\u200b')
            .setFooter(footerText);
        return embed;
    }
    card(fragmentCount, showPossession = false) {
        const action = this.star === -1 ? 'summon' : 'upgrade';
        const fragmentCostText = this.star === 5
            ? 'Max level' : `\`${fragmentCount}/${this.upgradeCost}\``;
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle(this.name)
            .setThumbnail(this.imageUrl)
            .addField('Active Skill', this.description)
            .addField(`Fragments to ${action}`, fragmentCostText, true);
        if (this.star !== -1) {
            embed.addField('Level', `\`${this.star}\` ${utils_1.STAR}`, true);
            if (showPossession) {
                embed.addField('Summoned', this.star !== -1 ? 'yes' : 'no', true);
            }
            embed.addField('Passive Stat', this.passiveStatDescription, true);
            embed.addField('Status', this.active ? 'active' : 'inactive', true);
            embed.addField('Summoned On', this.createdAt.toLocaleString(luxon_1.DateTime.DATE_MED), true);
        }
        return embed;
    }
    interceptCard(message) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .setTitle('Pet Interception')
            .setDescription(message)
            .setImage(this.petInterceptionUrl);
        return embed;
    }
    /** the cost of upgrading pet (+1) in form of fragments */
    get upgradeCost() {
        switch (this.star) {
            case 0: return 6;
            case 1: return 6;
            case 2: return 8;
            case 3: return 8;
            case 4: return 10;
            default: return 5;
        }
    }
}
exports.Pet = Pet;
class Wisp extends Pet {
    constructor() {
        super(...arguments);
        this.id = PetID.Wisp;
        this.name = "Will-O'-Wisp";
        this.description = (0, common_tags_1.oneLine) `Heals 40% of your max HP in round 2-5 randomly. Can only
  happen once each battle`;
        this.imageUrl = `${utils_1.CDN_LINK}574852830125359126/862540067432431617/unknown.png`;
        this.fragmentImageUrl = `${utils_1.CDN_LINK}574852830125359126/862656523531321344/wisp.png`;
        this.petInterceptionUrl = `${utils_1.CDN_LINK}852530378916888626/863778345182429214/Blue-Flame-Illustration.gif`;
        this.hasSpawn = false;
        this.spawnAt = main_1.client.random.integer(2, 5);
    }
    get passiveStatDescription() {
        return `\`+${Math.round(this.multiplier * 100)}%\` HP from base stats`;
    }
    get multiplier() {
        return this.star * 0.1;
    }
    isSpawn(round) {
        if (this.hasSpawn)
            return false;
        if (this.spawnAt === round) {
            this.hasSpawn = true;
            return true;
        }
        return false;
    }
    use(player) {
        const amount = player.baseStats.hp * this.multiplier;
        player.hp += amount;
        return `\`+${Math.round(amount)}\` HP`;
    }
}
exports.Wisp = Wisp;
class Golem extends Pet {
    constructor() {
        super(...arguments);
        this.id = PetID.Golem;
        this.name = 'Golem';
        this.description = (0, common_tags_1.oneLine) `Critical hits get blocked and do normal damage to you`;
        this.imageUrl = `${utils_1.CDN_LINK}574852830125359126/862541338754809886/unknown.png`;
        this.fragmentImageUrl = `${utils_1.CDN_LINK}574852830125359126/862667634313920512/golem.png`;
        this.petInterceptionUrl = `${utils_1.CDN_LINK}852530378916888626/864139662870970388/ezgif-7-4cc290f06da8.gif`;
    }
    get passiveStatDescription() {
        return `\`+${Math.round(this.multiplier * 100)}%\` armor from gear`;
    }
    get multiplier() {
        return this.star * 0.1;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSpawn(_round) {
        return true;
    }
    use(player) {
        const amount = this.multiplier * player.armor;
        player.armor += amount;
        return `\`+${(0, utils_1.roundTo)(amount, 1)}\` Armor`;
    }
}
exports.Golem = Golem;
class Gryphon extends Pet {
    constructor() {
        super(...arguments);
        this.id = PetID.Gryphon;
        this.name = 'Gryphon';
        this.description = (0, common_tags_1.oneLine) `Saves you from 1 attack randomly round 1-5. Can only
  happen once each battle`;
        this.imageUrl = `${utils_1.CDN_LINK}574852830125359126/862541562022068264/unknown.png`;
        this.fragmentImageUrl = `${utils_1.CDN_LINK}574852830125359126/862655845447630888/gryphon.png`;
        this.petInterceptionUrl = `${utils_1.CDN_LINK}852530378916888626/864399592762114078/GryphonCompressed.gif`;
        this.hasSpawn = false;
        this.spawnAt = main_1.client.random.integer(1, 5);
    }
    get passiveStatDescription() {
        return `\`+${Math.round(this.multiplier * 100)}%\` speed from base stats`;
    }
    get multiplier() {
        return this.star * 0.2;
    }
    isSpawn(round) {
        if (this.hasSpawn)
            return false;
        if (this.spawnAt === round) {
            this.hasSpawn = true;
            return true;
        }
        return false;
    }
    use(player) {
        const amount = player.baseStats.speed * this.multiplier;
        player.speed += amount;
        return `\`+${Math.round(amount)}\` Speed`;
    }
}
exports.Gryphon = Gryphon;
class Minotaur extends Pet {
    constructor() {
        super(...arguments);
        this.id = PetID.Minotaur;
        this.name = 'Minotaur';
        this.description = (0, common_tags_1.oneLine) `Has a 20% chance every round to attack the opponent for
  50% of total strength`;
        this.imageUrl = `${utils_1.CDN_LINK}574852830125359126/862541876804059146/unknown.png`;
        this.fragmentImageUrl = `${utils_1.CDN_LINK}574852830125359126/862669333775777832/minotaur.png`;
        this.petInterceptionUrl = `${utils_1.CDN_LINK}852530378916888626/864399618660892682/Minotaurcompressed.gif`;
    }
    get passiveStatDescription() {
        return `\`+${Math.round(this.multiplier * 100)}%\` strength from base stats`;
    }
    get multiplier() {
        return this.star * 0.1;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSpawn(_round) {
        return main_1.client.random.bool(0.2);
    }
    use(player) {
        const { strength } = player.baseStats;
        const amount = strength * this.multiplier;
        player.strength += amount;
        return `\`+${Math.round(amount)}\` Strength`;
    }
}
exports.Minotaur = Minotaur;
class Manticore extends Pet {
    constructor() {
        super(...arguments);
        this.id = PetID.Manticore;
        this.name = 'Manticore';
        this.description = 'Your first attack will 100% crit';
        this.imageUrl = `${utils_1.CDN_LINK}574852830125359126/862542055674216448/unknown.png`;
        this.fragmentImageUrl = `${utils_1.CDN_LINK}574852830125359126/862671084717604874/manticore.png`;
        this.petInterceptionUrl = `${utils_1.CDN_LINK}852530378916888626/864399340067880960/ManticoreCompressed.gif`;
    }
    get passiveStatDescription() {
        return `\`+${this.multiplier}\` Crit Damage`;
    }
    get multiplier() {
        return this.star * 0.2;
    }
    isSpawn(round) {
        return round === 1;
    }
    use(player) {
        const amount = this.multiplier;
        player.critDamage += amount;
        return `\`+${(0, utils_1.numberFormat)(amount)}\` Crit Damage`;
    }
}
exports.Manticore = Manticore;
class Dragon extends Pet {
    constructor() {
        super(...arguments);
        this.id = PetID.Dragon;
        this.name = 'Dragon';
        this.description = (0, common_tags_1.oneLine) `Has a 20% chance for a flame breath every round, dealing
  \`50/100/200/500/1000/2000\` damage regardless of armor and burns the enemy for
  \`2%/4%/6%/10%/20%/40%\` of their max HP.  Can only happen once each battle.` + '\nBurn damage is reduced on bosses (divided by 4)';
        this.imageUrl = `${utils_1.CDN_LINK}574852830125359126/863997311532007475/8edc1273be7f8b1c4be3d72af3358e9b.png`;
        this.fragmentImageUrl = `${utils_1.CDN_LINK}574852830125359126/863999076475469834/dragon.png`;
        this.petInterceptionUrl = `${utils_1.CDN_LINK}574852830125359126/864027308796805120/dragon.gif`;
        this.hasSpawn = false;
    }
    get passiveStatDescription() {
        return `\`+${Math.round(this.multiplier * 100)}%\` all stats\n(Strength, HP, Armor, Speed)`;
    }
    get multiplier() {
        switch (this.star) {
            case 1: return 0.01;
            case 2: return 0.03;
            case 3: return 0.1;
            case 4: return 0.3;
            case 5: return 0.5;
            default: return 0;
        }
    }
    /** damage done during battle */
    get damage() {
        switch (this.star) {
            case 1: return 100;
            case 2: return 200;
            case 3: return 500;
            case 4: return 1000;
            case 5: return 2000;
            default: return 50;
        }
    }
    /** burn damage percentage */
    get burn() {
        switch (this.star) {
            case 1: return 0.04;
            case 2: return 0.06;
            case 3: return 0.1;
            case 4: return 0.2;
            case 5: return 0.4;
            default: return 0.02;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSpawn(_round) {
        if (this.hasSpawn)
            return false;
        const spawn = main_1.client.random.bool(0.2);
        if (spawn) {
            this.hasSpawn = spawn;
            return spawn;
        }
        return false;
    }
    use(player) {
        const strengthAmount = player.strength * this.multiplier;
        const hpAmount = player.hp * this.multiplier;
        const armorAmount = player.armor * this.multiplier;
        const speedAmount = player.speed * this.multiplier;
        player.strength += strengthAmount;
        player.hp += hpAmount;
        player.armor += armorAmount;
        player.speed += speedAmount;
        return (0, common_tags_1.stripIndents) `
    \`+${Math.round(strengthAmount)}\` Strength
    \`+${Math.round(hpAmount)}\` HP
    \`+${(0, utils_1.numberFormat)(armorAmount)}\` Armor
    \`+${Math.round(speedAmount)}\` Speed
    `;
    }
}
exports.Dragon = Dragon;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9QZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQW9EO0FBQ3BELDJDQUEwQztBQUMxQyxpQ0FBaUM7QUFDakMseUNBQXNDO0FBQ3RDLG1DQUVpQjtBQUdqQixpQ0FBOEI7QUFDOUIsa0NBQWlDO0FBSWpDLElBQVksS0FPWDtBQVBELFdBQVksS0FBSztJQUNmLDBCQUFpQixDQUFBO0lBQ2pCLDRCQUFtQixDQUFBO0lBQ25CLGdDQUF1QixDQUFBO0lBQ3ZCLGtDQUF5QixDQUFBO0lBQ3pCLG9DQUEyQixDQUFBO0lBQzNCLDhCQUFxQixDQUFBO0FBQ3ZCLENBQUMsRUFQVyxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUFPaEI7QUFFRCxNQUFzQixHQUFHO0lBQXpCO1FBeUJFOzthQUVLO1FBQ0wsU0FBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRVYsV0FBTSxHQUFHLEtBQUssQ0FBQztRQUVmLGNBQVMsR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBbUg3QixDQUFDO0lBakhDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBUztRQUN4QixRQUFRLEVBQUUsRUFBRTtZQUNWLEtBQUssS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNuQyxLQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLElBQUksS0FBSyxFQUFFLENBQUM7WUFDckMsS0FBSyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQ3pDLEtBQUssS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUMzQyxLQUFLLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7WUFDN0MsS0FBSyxLQUFL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