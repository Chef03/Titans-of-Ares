import { oneLine } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { client } from '../main';
import { ApprenticeGear } from './ApprenticeGear';
import { Challenger } from './Challenger';
import { Fighter } from './Fighter';
import { Gear } from './Gear';
import {
  Dragon, Golem, Gryphon, Manticore, Minotaur, Wisp,
} from './Pet';
import { Player } from './Player';
import {
  CHALLENGER_CRIT_GIF, GOLD,
  PLAYER_CRIT_GIF, RED, roundTo, sleep,
} from './utils';

export class Battle {
  private round = 0;

  private playerRound = 0;

  private challengerRound = 0;

  private PET_INTERCEPT = 6_000; // 6 seconds

  private battleMsg?: Message;

  private battleEmbed?: MessageEmbed;

  private playerMaxHP: number;

  private challengerMaxHP: number;

  verbose = false;

  constructor(
    private msg: Message,
    private player: Player,
    private challenger: Player | Challenger,
  ) {
    this.playerMaxHP = this.player.hp;
    this.challengerMaxHP = this.challenger.hp;
  }

  private isEven(num: number) {
    return num % 2 === 0;
  }

  static bar(progress: number, maxProgress: number) {
    if (progress < 0) progress = 0;

    const maxFill = 20;
    const fill = '█';
    const path = ' ';
    const fillProgress = Math.round((progress * maxFill) / maxProgress);

    return Array(maxFill)
      .fill(fill)
      .map((v, i) => (fillProgress > i ? v : path))
      .join('');
  }

  /** adds progress bar to battleEmbed */
  private progressBar(name: string, hp: number, maxHP: number) {
    const maxHPStr = Math.round(maxHP);
    const healthBar = Battle.bar(hp, maxHP);
    const remainingHP = hp >= 0 ? Math.round(hp) : 0;

    this.battleEmbed?.addField(
      `${name}'s remaining HP`,
      `\`${healthBar}\` \`${remainingHP}/${maxHPStr}\``,
    );
  }

  private async critAttack(fighter: Fighter) {
    const critGIF = fighter instanceof Player
      ? PLAYER_CRIT_GIF : CHALLENGER_CRIT_GIF;

    const critEmbed = new MessageEmbed()
      .setTitle(`${fighter.name} Critical Attack`)
      .setColor(RED)
      .setImage(critGIF);

    await this.battleMsg?.edit(critEmbed);
    await sleep(4000);
  }

  private async attack(p1: Fighter, p2: Fighter, p1Round: number, p2Round: number) {
    let isCrit = p1.isCriticalHit();
    let reflected = false;
    let reflection = 0;
    let goneThrough = 0;
    let isCritShown = false;

    let pet = p1 instanceof Player && p1.activePet;

    // offensive
    if (pet) {
      if (pet instanceof Wisp) {
        const isSpawn = pet.isSpawn(p1Round);
        if (isSpawn) {
          const maxHP = p1 === this.player ? this.playerMaxHP : this.challengerMaxHP;
          let healed = maxHP * 0.4;
          const isOverHeal = healed + p1.hp > maxHP;
          if (isOverHeal) {
            healed = maxHP - p1.hp;
          }

          p1.hp += healed;
          const petText = `${p1.name} is being healed \`(+${Math.round(healed)} hp)\``;
          const interceptCard = pet.interceptCard(petText);

          await this.battleMsg?.edit(interceptCard);
          await sleep(this.PET_INTERCEPT);
        }
      } else if (pet instanceof Minotaur) {
        const isSpawn = pet.isSpawn(p1Round);
        if (isSpawn) {
          const dmg = p1.strength * 0.5;
          const damageReduction = p2.getArmorReduction(dmg, p1.armorPenetration);
          p2.hp -= dmg - damageReduction;

          const petText = `${p1.name}'s ${pet.name} attacks for \`${Math.round(dmg)}\` damage!`;
          const interceptCard = pet.interceptCard(petText);

          await this.battleMsg?.edit(interceptCard);
          await sleep(this.PET_INTERCEPT);
        }
      } else if (pet instanceof Manticore) {
        const isSpawn = pet.isSpawn(p1Round);
        if (isSpawn) {
          const petText = `${p1.name}'s ${pet.name} has scared the opponent! \`100%\` critical hit`;
          const interceptCard = pet.interceptCard(petText);

          await this.battleMsg?.edit(interceptCard);
          await sleep(this.PET_INTERCEPT);
          isCrit = true;
        }
      } else if (pet instanceof Dragon) {
        
        const isSpawn = pet.isSpawn(p1Round);
        if (isSpawn) {
          const burn = this.challengerMaxHP * pet.burn;
          const { damage } = pet;
          p2.hp -= burn;
          p2.hp -= damage;

          const petText = oneLine`${p1.name}'s Dragon is using Flame Breath dealing
            \`${Math.round(damage)}\` damage and burns 
            \`${pet.burn * 100}% (${Math.round(burn)})\` of ${p2.name}'s hp`;

          const interceptCard = pet.interceptCard(petText);

          await this.battleMsg?.edit(interceptCard);
          await sleep(this.PET_INTERCEPT);
        }
      }
    }

    pet = p2 instanceof Player && p2.activePet;
    // defensive
    if (pet) {
      if (pet instanceof Golem) {
        if (isCrit) {
          const isSpawn = pet.isSpawn(p2Round);

          if (isSpawn) {
            await this.critAttack(p1);
            isCrit = false;
            isCritShown = true;

            const petText = `${p1.name}'s Critical hit has been blocked by ${p2.name} Golem!`;
            const interceptCard = pet.interceptCard(petText);

            await this.battleMsg?.edit(interceptCard);
            await sleep(this.PET_INTERCEPT);
          }
        }
      } else if (pet instanceof Gryphon) {
        const isSpawn = pet.isSpawn(p1Round);

        if (isSpawn) {
          if (isCrit) {
            await this.critAttack(p1);
            isCrit = false;
            isCritShown = false;
          }

          const petText = `${p2.name} has been saved from ${p1.name}'s attack!`;
          const interceptCard = pet.interceptCard(petText);

          await this.battleMsg?.edit(interceptCard);
          await sleep(this.PET_INTERCEPT);
          return;
        }
      }
    }

    if (p2 instanceof Player && p1Round === 1) {
      const { equippedGears } = p2;
      const setBonus = Gear.getBonus(equippedGears);
      const gear = equippedGears.random();

      if (setBonus && gear instanceof ApprenticeGear) {
        const attackRate = isCrit ? p1.critDamage * p1.strength : p1.strength;
        this.verbose && await this.msg.channel.send(`Attack Rate: ${attackRate}`);

        reflection = attackRate * setBonus.bonus;
        this.verbose && await this.msg.channel.send(`Reflected: ${reflection}`);

        const damageReduction = p1.getArmorReduction(reflection, p2.penetration);
        this.verbose && await this.msg.channel.send(`Damage Reduction: ${damageReduction}`);

        goneThrough = attackRate * (1 - setBonus.bonus);
        this.verbose && await this.msg.channel.send(`Damage Gone Through: ${goneThrough}`);

        const damageDone = reflection - damageReduction;
        this.verbose && await this.msg.channel.send(`Damage Done: ${damageDone}`);

        p1.hp -= damageDone;
        reflected = true;

        if (isCrit) {
          await this.critAttack(p1);
          isCritShown = true;
        }

        const reflectAnimation = gear.reflectAnimation(p2.name, damageDone, setBonus.bonus);
        await this.battleMsg?.edit(reflectAnimation);
        await sleep(6000);
      }
    }

    const attackRate = reflected ? goneThrough
      : isCrit ? p1.critDamage * p1.strength : p1.strength;

    const damageReduction = p2.getArmorReduction(attackRate, p1.armorPenetration);
    const damageDone = attackRate - damageReduction;
    p2.hp -= damageDone;

    const critText = isCrit ? ` (x${roundTo(p1.critDamage, 2)} critical hit)` : '';

    this.battleEmbed = new MessageEmbed()
      .setColor(RED)
      .setThumbnail(p1.imageUrl)
      .addField('Attacking Player', p1.name)
      .addField('Attack Rate', `\`${Math.round(attackRate)}${critText}\``, true)
      .addField('Damage Reduction', `\`${Math.round(damageReduction)}\``, true)
      .addField('Damage Done', `\`${Math.round(damageDone)}\``, true)
      .addField('Round', this.round + 1, true);

    const player = p1 === this.player ? p1 : p2;
    const challenger = p2 === this.challenger ? p2 : p1;

    this.progressBar(player.name, player.hp, this.playerMaxHP);
    this.progressBar(challenger.name, challenger.hp, this.challengerMaxHP);

    if (isCrit && !isCritShown) {
      await this.critAttack(p1);
    }

    await this.battleMsg?.edit(this.battleEmbed);
  }

  async run() {
    this.battleEmbed = new MessageEmbed();
    this.battleMsg = await this.msg.channel.send('Battle start');
    this.playerMaxHP = this.player.hp;
    this.challengerMaxHP = this.challenger.hp;

    // This determines whichever moves first. If the player has higher speed, it
    // returns 0, i.e, player moves first by default. Otherwise, it returns 1
    // which flips the value of isEven that makes the player move second. If both
    // has the same speed, it will be chosen randomly.
    const moveFirst = this.player.speed === this.challenger.speed
      ? client.random.pick([0, 1])
      : this.player.speed > this.challenger.speed
        ? 0
        : 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.isEven(this.round + moveFirst)) {
        this.playerRound++;
        await this.attack(this.player, this.challenger, this.playerRound, this.challengerRound);
      } else {
        this.challengerRound++;
        await this.attack(this.challenger, this.player, this.challengerRound, this.playerRound);
      }

      if (this.player.hp <= 0 || this.challenger.hp <= 0) break;

      await sleep(2000);

      this.round++;
    }

    const isWon = this.player.hp > 0;
    this.battleEmbed.setColor(GOLD);
    await this.battleMsg.edit(this.battleEmbed);

    return isWon;
  }
}
