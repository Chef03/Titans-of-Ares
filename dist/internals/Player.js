"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.CRIT_DAMAGE = exports.CRIT_RATE = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const coin_1 = require("../db/coin");
const gear_1 = require("../db/gear");
const gem_1 = require("../db/gem");
const inventory_1 = require("../db/inventory");
const pet_1 = require("../db/pet");
const player_1 = require("../db/player");
const timer_1 = require("../db/timer");
const main_1 = require("../main");
const ArenaGear_1 = require("./ArenaGear");
const Attributes_1 = require("./Attributes");
const Buff_1 = require("./Buff");
const energy_1 = require("./energy");
const Fighter_1 = require("./Fighter");
const Gear_1 = require("./Gear");
const Inventory_1 = require("./Inventory");
const List_1 = require("./List");
const Mining_1 = require("./Mining");
const Pet_1 = require("./Pet");
const Profile_1 = require("./Profile");
const TeamArena_1 = require("./TeamArena");
const utils_1 = require("./utils");
const Chest_1 = require("./Chest");
const Fragment_1 = require("./Fragment");
const Scroll_1 = require("./Scroll");
const Reward_1 = require("./Reward");
const luxon_1 = require("luxon");
exports.CRIT_RATE = 0.1;
exports.CRIT_DAMAGE = 2;
class Player extends Fighter_1.Fighter {
    constructor(data) {
        super(data);
        this.xp = data.xp;
        this.points = data.points;
        this.coins = data.coins;
        this.arenaCoins = data.arenaCoins;
        this.id = data.userID;
        this.member = data.member;
        this.energy = data.energy;
        this.squadBossEnergy = data.squadBossEnergy;
        this.challengerMaxLevel = data.challengerMaxLevel;
        this.inventory = data.inventory;
        this.goldMedal = data.goldMedal;
        this.silverMedal = data.silverMedal;
        this.bronzeMedal = data.bronzeMedal;
        this.fragmentReward = data.fragmentReward;
        this.miningPickReward = data.miningPickReward;
        this.pets = data.pets;
        this.equippedPet = data.pets.find(pet => pet.active);
        this.equippedGears = data.equippedGears;
        this.buff = data.buff && new Buff_1.Buff(data.buff);
        this.baseStats = {
            hp: this.hp,
            strength: this.strength,
            speed: this.speed,
            armor: this.armor,
            critRate: this.critRate,
            critDamage: this.critDamage,
            armorPenetration: 0,
        };
        this.buff?.use(this);
        this.equippedGears.forEach((gear) => gear.use(this));
        const attribs = [];
        for (const gear of this.equippedGears) {
            attribs.push([gear.attribute, gear.attributeValue]);
            if (gear.gem) {
                attribs.push([gear.gem.attribute, gear.gem.attributeValue]);
            }
        }
        const aggregatedStats = Attributes_1.Attributes.aggregate(attribs);
        const stats = Attributes_1.Attributes.toStats(aggregatedStats);
        this.gearStat = stats.join('\n');
        this.setBonusActive = this.equippedGears.length === 11;
        this.petStat = this.activePet?.use(this);
        if (this.setBonusActive) {
            const armor = this.equippedGears.random();
            const bonus = Gear_1.Gear.getBonus(this.equippedGears);
            if (armor instanceof ArenaGear_1.ArenaGear && bonus) {
                this.armorPenetration += bonus.bonus;
                this.baseStats.armorPenetration += bonus.bonus;
            }
        }
    }
    static toItem(items) {
        return items.map((item) => {
            const itemID = item.ItemID;
            const category = itemID.split('_')[0];
            switch (category) {
                case 'chest': return Chest_1.Chest.fromChestID(itemID);
                case 'fragment': return new Fragment_1.Fragment(itemID);
                case 'gear': return Gear_1.Gear.fromDB(item);
                case 'reward': return Reward_1.Reward.fromDB(item);
                case 'scroll':
                    if (itemID === 'scroll_arena') {
                        return new Scroll_1.ArenaScroll();
                    }
                    return new Scroll_1.Scroll();
                case 'pick': return new Mining_1.MiningPick();
                case 'stone': return new Mining_1.RoughStone();
                case 'gem': return Mining_1.Gem.fromDB(item);
            }
        });
    }
    static async getPlayer(member) {
        const userId = member.user.id;
        const totalXp = await (0, player_1.getTotalXp)(userId);
        const totalPoints = await (0, player_1.getTotalPoints)(userId);
        const level = (0, utils_1.getLevel)(totalXp);
        const stats = (0, utils_1.getStats)(level);
        const inventory = new Inventory_1.Inventory(this.toItem(await (0, inventory_1.getInventory)(userId)));
        const pets = (await (0, pet_1.getAllPets)(userId)).map((x) => Pet_1.Pet.fromDB(x));
        const gears = (await (0, gear_1.getGears)(userId)).map((gearDB) => Gear_1.Gear.fromDB(gearDB));
        const equippedGears = gears.filter((x) => x.equipped);
        const gems = await (0, gem_1.getAllGems)(userId);
        for (const gemDB of gems) {
            const gem = inventory.gems.find((x) => x.inventoryID === gemDB.InventoryID);
            if (gem) {
                gem.gearID = gemDB.GearID;
                gem.gemID = gemDB.ID;
                const gear = equippedGears.find((x) => x.id === gem.gearID);
                if (gear) {
                    gear.gem = gem;
                }
            }
        }
        inventory.gems = new List_1.List(inventory.gems.filter((x) => x.gearID === null));
        let player = await (0, player_1.getUser)(userId);
        if (!player) {
            player = await (0, player_1.createUser)(userId);
        }
        return new Player({
            name: member.displayName,
            member,
            level,
            hp: stats.hp,
            strength: stats.strength,
            speed: stats.speed,
            armor: stats.armor,
            critRate: exports.CRIT_RATE,
            critDamage: exports.CRIT_DAMAGE,
            imageUrl: member.user.displayAvatarURL({ format: 'jpg' }),
            points: totalPoints,
            xp: totalXp,
            coins: player.Coin,
            arenaCoins: player.ArenaCoin,
            userID: member.user.id,
            energy: player.Energy,
            squadBossEnergy: player.SquadBossEnergy,
            challengerMaxLevel: player.ChallengerMaxLevel,
            buff: player.Buff,
            inventory,
            goldMedal: player.GoldMedal,
            silverMedal: player.SilverMedal,
            bronzeMedal: player.BronzeMedal,
            equippedPet: pets.find(pet => pet.active),
            pets: List_1.List.from(pets),
            equippedGears: List_1.List.from(equippedGears),
            fragmentReward: player.FragmentReward,
            miningPickReward: player.MiningPickReward,
        });
    }
    get activePet() {
        return this.pets.find((x) => x.active);
    }
    get penetration() {
        const { equippedGears } = this;
        const setBonus = Gear_1.Gear.getBonus(equippedGears);
        const gear = equippedGears.random();
        if (setBonus && gear instanceof ArenaGear_1.ArenaGear) {
            return setBonus.bonus;
        }
        return 0;
    }
    async sync() {
        const player = await Player.getPlayer(this.member);
        Object.assign(this, player);
    }
    async getRank() {
        const users = await (0, player_1.getUsers)();
        const cards = [];
        main_1.client.logChannel.guild.members.fetch();
        for (const user of users) {
            const xp = await (0, player_1.getTotalXp)(user.DiscordID);
            const inServer = main_1.client.logChannel.guild.members.cache.has(user.DiscordID);
            if (inServer) {
                cards.push({ id: user.DiscordID, xp });
            }
        }
        cards.sort((a, b) => b.xp - a.xp);
        const rank = cards.findIndex((x) => x.id === this.id);
        return rank + 1;
    }
    async getProfile() {
        const profile = new Profile_1.Profile({
            name: this.name,
            xp: this.xp,
            level: this.level,
            rank: await this.getRank(),
            imageUrl: this.imageUrl,
            userID: this.id,
            gold: this.goldMedal,
            silver: this.silverMedal,
            bronze: this.bronzeMedal,
        });
        return profile.build();
    }
    async getStats() {
        const energyTimer = await (0, energy_1.showTimeLeft)(timer_1.TimerType.Energy, this.id);
        const buffTimer = await this.buff?.getTimeLeft(this);
        const xp = Math.round(this.xp);
        const formatOpt = { highlight: true };
        const hp = Attributes_1.Attributes.hp.format(this.hp, formatOpt);
        const strength = Attributes_1.Attributes.strength.format(this.strength, formatOpt);
        const speed = Attributes_1.Attributes.speed.format(this.speed, formatOpt);
        const armor = Attributes_1.Attributes.armor.format(this.armor, formatOpt);
        const critRate = Attributes_1.Attributes.critRate.format(this.critRate, formatOpt);
        const critDamage = Attributes_1.Attributes.critDamage.format(this.critDamage, formatOpt);
        const armorPenetration = Attributes_1.Attributes.armorPenetration
            .format(this.armorPenetration, formatOpt);
        const petName = this.activePet
            ? `${this.activePet.name} \`${this.activePet.star} ${utils_1.STAR}\`` : 'None';
        const petPassiveDesc = this.activePet instanceof Pet_1.Manticore ? ''
            : this.activePet?.passiveStatDescription;
        const { equippedGears } = this;
        const setBonus = Gear_1.Gear.getBonus(equippedGears);
        const armorBonusSetDesc = setBonus?.description || '';
        const gemAndMiningCount = this.inventory.stones.length
            + this.inventory.gems.length
            + this.inventory.picks.length;
        const arena = await TeamArena_1.TeamArena.getCurrentArena();
        const teamArenaMember = arena.candidates
            .find((member) => member.player.id === this.id);
        const isBattlePhase = arena.phase === TeamArena_1.Phase.BATTLE_1;
        const teamArenaEnergyText = teamArenaMember && isBattlePhase
            ? `${teamArenaMember.charge}/${TeamArena_1.TeamArena.MAX_ENERGY} Team Arena Energy`
            : '';
        const now = luxon_1.DateTime.now().plus({ days: 7 });
        const date = TeamArena_1.TeamArena.getMondayDate(now).toISO();
        const done = luxon_1.DateTime.fromISO(date);
        let nextMonday = TeamArena_1.TeamArena.getMondayDate(done).set({ hour: 7, minute: 0 });
        const timeLeft = nextMonday.diffNow(['hour', 'minute', 'second']);
        const formattedTime = timeLeft.toFormat('hh:mm:ss');
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .setTitle(this.name)
            .addField('-----', (0, common_tags_1.stripIndents) `
        **Stats**
        XP: \`${xp}\` HP: ${hp} Strength: ${strength}
        Speed: ${speed} Armor: ${armor}
        Crit Rate: ${critRate} Crit Damage: ${critDamage}
        Armor Penetration: ${armorPenetration}

        **Inventory**
        \`${this.inventory.chests.length}\` Treasure Chests
        \`${this.inventory.fragments.length}\` Pet Fragments
        \`${this.inventory.gears.length}\` Gear Pieces
        \`${this.inventory.rewards.length}\` Squad Boss Emblems
        \`${gemAndMiningCount}\` Gems and Mining Equipment
        \`${this.inventory.scrolls.length}\` Scrolls
        \`${this.coins}\` Coins
        \`${this.arenaCoins}\` Arena Coins

        **Energy**
        ${this.energy}/${energy_1.MAX_ENERGY} Battle Energy ${energyTimer}
        ${teamArenaEnergyText}

        **Squad Boss Energy**
        ${this.squadBossEnergy}/${energy_1.MAX_SQUAD_BOSS_ENERGY} Squad Boss Energy ${!this.squadBossEnergy ? `\`(${formattedTime})\`` : ''}

        **Buffs**
        ${this.buff?.name || 'None'} ${buffTimer || ''}

        **Pet**
        ${petName}
        ${this.petStat || ''} ${petPassiveDesc ? `(${petPassiveDesc})` : ''}

        **Gear**
        ${this.gearStat || ''}
        ${armorBonusSetDesc}
      `);
        return embed;
    }
    // this adds or deduces the amount of coins of a player
    async addCoin(amount) {
        await (0, coin_1.updateCoin)(this.id, amount);
        this.coins += amount;
    }
    async addArenaCoin(amount) {
        await (0, coin_1.setArenaCoin)(this.id, this.arenaCoins + amount);
        this.arenaCoins += amount;
    }
}
exports.Player = Player;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQTJDO0FBQzNDLDJDQUF1RDtBQUN2RCxxQ0FBc0Q7QUFDdEQscUNBQXNEO0FBR3RELG1DQUE4QztBQUM5QywrQ0FBK0Q7QUFDL0QsbUNBQXVDO0FBQ3ZDLHlDQUVzQjtBQUN0Qix1Q0FBd0M7QUFDeEMsa0NBQWlDO0FBQ2pDLDJDQUF3QztBQUN4Qyw2Q0FBcUQ7QUFDckQsaUNBQXNDO0FBQ3RDLHFDQUEyRTtBQUMzRSx1Q0FBeUQ7QUFDekQsaUNBQThCO0FBQzlCLDJDQUF3QztBQUN4QyxpQ0FBOEI7QUFDOUIscUNBQXVEO0FBQ3ZELCtCQUF1QztBQUN2Qyx1Q0FBb0M7QUFDcEMsMkNBQStDO0FBQy9DLG1DQUVpQjtBQUVqQixtQ0FBeUM7QUFDekMseUNBQWtEO0FBQ2xELHFDQUErQztBQUMvQyxxQ0FBa0M7QUFDbEMsaUNBQWlDO0FBRXBCLFFBQUEsU0FBUyxHQUFHLEdBQUcsQ0FBQztBQUNoQixRQUFBLFdBQVcsR0FBRyxDQUFDLENBQUM7QUF3QjdCLE1BQWEsTUFBTyxTQUFRLGlCQUFPO0lBbURqQyxZQUFZLElBQWE7UUFFdkIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ1osSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUN0QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIs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