import { stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed } from 'discord.js';
import { setArenaCoin, updateCoin } from '../db/coin';
import { getGears, Gear as GearDB } from '../db/gear';
import { RewardDB } from '../db/reward';

import { GemDB, getAllGems } from '../db/gem';
import { getInventory, Item as ItemDB } from '../db/inventory';
import { getAllPets } from '../db/pet';
import {
  createUser, getTotalPoints, getTotalXp, getUser, getUsers,
} from '../db/player';
import { TimerType } from '../db/timer';
import { client } from '../main';
import { ArenaGear } from './ArenaGear';
import { Attribute, Attributes } from './Attributes';
import { Buff, BuffID } from './Buff';
import { MAX_ENERGY, MAX_SQUAD_BOSS_ENERGY, showTimeLeft } from './energy';
import { BaseStats, Fighter, IFighter } from './Fighter';
import { Gear } from './Gear';
import { Inventory } from './Inventory';
import { List } from './List';
import { Gem, MiningPick, RoughStone } from './Mining';
import { Manticore, Pet } from './Pet';
import { Profile } from './Profile';
import { Phase, TeamArena } from './TeamArena';
import {
  getLevel, getStats, GOLD, STAR,
} from './utils';
import { Item } from './Item';
import { Chest, ChestID } from './Chest';
import { Fragment, FragmentID } from './Fragment';
import { ArenaScroll, Scroll } from './Scroll';
import { Reward } from './Reward';
import { DateTime } from 'luxon';

export const CRIT_RATE = 0.1;
export const CRIT_DAMAGE = 2;

export interface IPlayer extends IFighter {
  xp: number;
  points: number;
  energy: number;
  squadBossEnergy: number;
  coins: number;
  arenaCoins: number;
  userID: string;
  challengerMaxLevel: number;
  member: GuildMember;
  buff: BuffID | null;
  inventory: Inventory;
  goldMedal: number;
  silverMedal: number;
  bronzeMedal: number;
  fragmentReward: number;
  miningPickReward: number;
  pets: List<Pet>;
  equippedPet: Pet | undefined;
  equippedGears: List<Gear>;
}

export class Player extends Fighter {
  xp: number;

  points: number;

  coins: number;

  arenaCoins: number;

  energy: number;

  squadBossEnergy: number;

  challengerMaxLevel: number;

  buff: Buff | null;

  inventory: Inventory;

  goldMedal: number;

  silverMedal: number;

  bronzeMedal: number;

  pets: List<Pet>;
  equippedPet: Pet | undefined;

  baseStats: BaseStats;

  /** Represents upper xp limit the user needed to passed in order to get
   *  rewarded for a fragment. If for example the player's xp decrements, the
   *  fragmentReward will remain the same so that the player cannot get rewarded
   *  for the same limit again. This prevents from user to earn multiple reward.
   * */
  fragmentReward: number;

  miningPickReward: number;

  equippedGears: List<Gear>;

  readonly id: string;

  readonly member: GuildMember;

  petStat?: string;

  gearStat?: string;

  setBonusActive: boolean;

  constructor(data: IPlayer) {

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
    this.buff = data.buff && new Buff(data.buff);
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

    const attribs: [Attribute, number][] = [];
    for (const gear of this.equippedGears) {
      attribs.push([gear.attribute, gear.attributeValue]);

      if (gear.gem) {
        attribs.push([gear.gem.attribute, gear.gem.attributeValue]);
      }
    }
    const aggregatedStats = Attributes.aggregate(attribs);
    const stats = Attributes.toStats(aggregatedStats);

    this.gearStat = stats.join('\n');
    this.setBonusActive = this.equippedGears.length === 11;
    this.petStat = this.activePet?.use(this);

    if (this.setBonusActive) {
      const armor = this.equippedGears.random()!;
      const bonus = Gear.getBonus(this.equippedGears);

      if (armor instanceof ArenaGear && bonus) {
        this.armorPenetration += bonus.bonus;
        this.baseStats.armorPenetration += bonus.bonus;
      }
    }
  }

  private static toItem(items: (ItemDB | GemDB | RewardDB)[]) {
    return items.map((item) => {
      const itemID = item.ItemID;
      const category = itemID.split('_')[0];
      switch (category) {
        case 'chest': return Chest.fromChestID(itemID as ChestID);
        case 'fragment': return new Fragment(itemID as FragmentID);
        case 'gear': return Gear.fromDB(item as GearDB);
        case 'reward': return Reward.fromDB(item as RewardDB);

        case 'scroll':
          if (itemID === 'scroll_arena') {
            return new ArenaScroll();
          }
          return new Scroll();

        case 'pick': return new MiningPick();
        case 'stone': return new RoughStone();
        case 'gem': return Gem.fromDB(item as GemDB);
      }
    }) as Item[];
  }

  static async getPlayer(member: GuildMember): Promise<Player> {
    const userId = member.user.id;
    const totalXp = await getTotalXp(userId);
    const totalPoints = await getTotalPoints(userId);
    const level = getLevel(totalXp);
    const stats = getStats(level);
    const inventory = new Inventory(this.toItem(await getInventory(userId)));

    const pets = (await getAllPets(userId)).map((x) => Pet.fromDB(x));
    const gears = (await getGears(userId)).map((gearDB) => Gear.fromDB(gearDB));
    const equippedGears = gears.filter((x) => x.equipped);
    const gems = await getAllGems(userId);

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

    inventory.gems = new List(inventory.gems.filter((x) => x.gearID === null));

    let player = await getUser(userId);
    if (!player) {
      player = await createUser(userId);
    }

    return new Player({
      name: member.displayName,
      member,
      level,
      hp: stats.hp,
      strength: stats.strength,
      speed: stats.speed,
      armor: stats.armor,
      critRate: CRIT_RATE,
      critDamage: CRIT_DAMAGE,
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
      pets: List.from(pets),
      equippedGears: List.from(equippedGears),
      fragmentReward: player.FragmentReward,
      miningPickReward: player.MiningPickReward,
    });
  }

  get activePet() {
    return this.pets.find((x) => x.active);
  }

  get penetration() {
    const { equippedGears } = this;
    const setBonus = Gear.getBonus(equippedGears);
    const gear = equippedGears.random();

    if (setBonus && gear instanceof ArenaGear) {
      return setBonus.bonus;
    }

    return 0;
  }

  async sync() {
    const player = await Player.getPlayer(this.member);
    Object.assign(this, player);
  }

  async getRank() {
    const users = await getUsers();
    const cards: {
      id: string,
      xp: number,
    }[] = [];

    client.logChannel.guild.members.fetch();
    for (const user of users) {
      const xp = await getTotalXp(user.DiscordID);
      const inServer = client.logChannel.guild.members.cache.has(user.DiscordID);

      if (inServer) {
        cards.push({ id: user.DiscordID, xp });
      }
    }

    cards.sort((a, b) => b.xp - a.xp);

    const rank = cards.findIndex((x) => x.id === this.id);
    return rank + 1;
  }

  async getProfile() {
    const profile = new Profile({
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


    const energyTimer = await showTimeLeft(TimerType.Energy, this.id);
    const buffTimer = await this.buff?.getTimeLeft(this);

    const xp = Math.round(this.xp);

    const formatOpt = { highlight: true };
    const hp = Attributes.hp.format(this.hp, formatOpt);
    const strength = Attributes.strength.format(this.strength, formatOpt);
    const speed = Attributes.speed.format(this.speed, formatOpt);
    const armor = Attributes.armor.format(this.armor, formatOpt);
    const critRate = Attributes.critRate.format(this.critRate, formatOpt);
    const critDamage = Attributes.critDamage.format(this.critDamage, formatOpt);
    const armorPenetration = Attributes.armorPenetration
      .format(this.armorPenetration, formatOpt);

    const petName = this.activePet
      ? `${this.activePet.name} \`${this.activePet.star} ${STAR}\`` : 'None';
    const petPassiveDesc = this.activePet instanceof Manticore ? ''
      : this.activePet?.passiveStatDescription;
    const { equippedGears } = this;
    const setBonus = Gear.getBonus(equippedGears);
    const armorBonusSetDesc = setBonus?.description || '';
    const gemAndMiningCount = this.inventory.stones.length
      + this.inventory.gems.length
      + this.inventory.picks.length;

    const arena = await TeamArena.getCurrentArena();

    const teamArenaMember = arena.candidates
      .find((member) => member.player.id === this.id);
    const isBattlePhase = arena.phase === Phase.BATTLE_1;

    const teamArenaEnergyText = teamArenaMember && isBattlePhase
      ? `${teamArenaMember.charge}/${TeamArena.MAX_ENERGY} Team Arena Energy`
      : '';


    const now = DateTime.now().plus({ days: 7 });
    const date = TeamArena.getMondayDate(now).toISO();
    const done = DateTime.fromISO(date)

    let nextMonday = TeamArena.getMondayDate(done).set({ hour: 7, minute: 0 });
    const timeLeft = nextMonday.diffNow(['hour', 'minute', 'second']);
    const formattedTime = timeLeft.toFormat('hh:mm:ss');



    const embed = new MessageEmbed()
      .setColor(GOLD)
      .setTitle(this.name)
      .addField('-----', stripIndents`
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
        ${this.energy}/${MAX_ENERGY} Battle Energy ${energyTimer}
        ${teamArenaEnergyText}

        **Squad Boss Energy**
        ${this.squadBossEnergy}/${MAX_SQUAD_BOSS_ENERGY} Squad Boss Energy ${!this.squadBossEnergy ? `\`(${formattedTime})\`` : ''}

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
  async addCoin(amount: number) {
    await updateCoin(this.id, amount);
    this.coins += amount;
  }

  async addArenaCoin(amount: number) {
    await setArenaCoin(this.id, this.arenaCoins + amount);
    this.arenaCoins += amount;
  }
}
