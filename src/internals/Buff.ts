import { DateTime, DurationInput } from 'luxon';
import { deleteBuff } from '../db/player';
import {
  deleteTimer,
  getAllTimers,
  getTimer,
  TimerType,
} from '../db/timer';
import { isExpired } from './energy';
import { Player } from './Player';
import { client } from '../main';

const commonPercentage = [0.1, 0.15, 0.2, 0.25, 0.5];

const buffs = {
  hp: commonPercentage,
  critRate: [0.03, 0.05, 0.1, 0.15, 0.30],
  critDamage: [0.1, 0.2, 0.3, 0.7, 1.5],
  strength: commonPercentage,
  speed: commonPercentage,
};

const chances = [400, 300, 150, 100, 50];

export const BUFF_ACTIVE_LIMIT: DurationInput = { hours: 2 };
export const BUFF_LIMIT: DurationInput = { hours: 2 };
export const XP_THRESHOLD = 20;

type BuffRaw = typeof buffs;
type BuffType = keyof BuffRaw;
type BuffLevel = 1 | 2 | 3 | 4 | 5;
export type BuffID = `${BuffType}_${BuffLevel}`;

export class Buff {
  readonly type: BuffType;

  readonly level: BuffLevel;

  constructor(id: BuffID) {
    const args = id.split('_');
    const type = args[0] as BuffType;
    const level = parseInt(args[1]) as BuffLevel;

    if (!args[0] || !args[1]) throw new Error('invalid buff id');

    this.type = type;
    this.level = level;
  }

  get id(): BuffID {
    return `${this.type}_${this.level}` as BuffID;
  }

  get name() {
    const buffLevelName = [
      'Common',
      'Uncommon',
      'Rare',
      'Epic',
      'Legendary',
    ];

    const buffTypeName = {
      hp: 'HP',
      critRate: 'Crit Rate',
      critDamage: 'Crit Damage',
      strength: 'Strength',
      speed: 'Speed',
    };

    const typeName = buffTypeName[this.type];
    const levelName = buffLevelName[this.level - 1];

    if (this.type === 'critDamage') {
      return `${levelName} ${typeName} buff \`+x${this.value}\``;
    }
    return `${levelName} ${typeName} buff \`+${this.value * 100}%\``;
  }

  // returns buff value based on type
  private get value() {
    return buffs[this.type][this.level - 1];
  }

  use(player: Player) {
    switch (this.type) {
      case 'critDamage':
        player.critDamage += this.value;
        break;
      case 'critRate':
        player.critRate += this.value;
        break;
      case 'speed':
        player.speed += this.value * player.speed;
        break;
      case 'strength':
        player.strength += this.value * player.strength;
        break;
      case 'hp':
        player.hp += this.value * player.hp;
        break;
    }
  }

  async getTimeLeft(player: Player) {
    const id = player.buff?.id;
    if (!id) return '';

    const timer = await getTimer(TimerType.Buff, player.id);
    if (!timer) return '';

    const expireDate = DateTime.fromISO(timer.Expires);
    const diff = expireDate.diffNow();

    return diff.toFormat('`(hh:mm:ss)`');
  }

  static async mainLoop() {
    const timers = await getAllTimers(TimerType.Buff);

    for (const timer of timers) {
      if (isExpired(timer.Expires)) {
        deleteTimer(TimerType.Buff, timer.DiscordID);
        deleteBuff(timer.DiscordID);
      }
    }
  }

  // randomly picks level according to its rarity
  private static pickBuffLevel() {
    const samples = chances
      .map((count, index) => Array(count).fill(index + 1))
      .flat();
    const randomizedSample = client.random.shuffle<BuffLevel>(samples);
    return client.random.pick(randomizedSample);
  }

  // randomly choses buff according to its rarity
  static random() {
    const buffTypes = Object.keys(buffs);
    const buffType = client.random.pick(buffTypes) as BuffType;
    const buffLevel = this.pickBuffLevel();
    return new Buff(`${buffType}_${buffLevel}` as BuffID);
  }
}
