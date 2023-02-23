"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Battle = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const main_1 = require("../main");
const ApprenticeGear_1 = require("./ApprenticeGear");
const Gear_1 = require("./Gear");
const Pet_1 = require("./Pet");
const Player_1 = require("./Player");
const utils_1 = require("./utils");
class Battle {
    constructor(msg, player, challenger) {
        this.msg = msg;
        this.player = player;
        this.challenger = challenger;
        this.round = 0;
        this.playerRound = 0;
        this.challengerRound = 0;
        this.PET_INTERCEPT = 6000; // 6 seconds
        this.verbose = false;
        this.playerMaxHP = this.player.hp;
        this.challengerMaxHP = this.challenger.hp;
    }
    isEven(num) {
        return num % 2 === 0;
    }
    static bar(progress, maxProgress) {
        if (progress < 0)
            progress = 0;
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
    progressBar(name, hp, maxHP) {
        const maxHPStr = Math.round(maxHP);
        const healthBar = Battle.bar(hp, maxHP);
        const remainingHP = hp >= 0 ? Math.round(hp) : 0;
        this.battleEmbed?.addField(`${name}'s remaining HP`, `\`${healthBar}\` \`${remainingHP}/${maxHPStr}\``);
    }
    async critAttack(fighter) {
        const critGIF = fighter instanceof Player_1.Player
            ? utils_1.PLAYER_CRIT_GIF : utils_1.CHALLENGER_CRIT_GIF;
        const critEmbed = new discord_js_1.MessageEmbed()
            .setTitle(`${fighter.name} Critical Attack`)
            .setColor(utils_1.RED)
            .setImage(critGIF);
        await this.battleMsg?.edit(critEmbed);
        await (0, utils_1.sleep)(4000);
    }
    async attack(p1, p2, p1Round, p2Round) {
        let isCrit = p1.isCriticalHit();
        let reflected = false;
        let reflection = 0;
        let goneThrough = 0;
        let isCritShown = false;
        let pet = p1 instanceof Player_1.Player && p1.activePet;
        // offensive
        if (pet) {
            if (pet instanceof Pet_1.Wisp) {
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
                    await (0, utils_1.sleep)(this.PET_INTERCEPT);
                }
            }
            else if (pet instanceof Pet_1.Minotaur) {
                const isSpawn = pet.isSpawn(p1Round);
                if (isSpawn) {
                    const dmg = p1.strength * 0.5;
                    const damageReduction = p2.getArmorReduction(dmg, p1.armorPenetration);
                    p2.hp -= dmg - damageReduction;
                    const petText = `${p1.name}'s ${pet.name} attacks for \`${Math.round(dmg)}\` damage!`;
                    const interceptCard = pet.interceptCard(petText);
                    await this.battleMsg?.edit(interceptCard);
                    await (0, utils_1.sleep)(this.PET_INTERCEPT);
                }
            }
            else if (pet instanceof Pet_1.Manticore) {
                const isSpawn = pet.isSpawn(p1Round);
                if (isSpawn) {
                    const petText = `${p1.name}'s ${pet.name} has scared the opponent! \`100%\` critical hit`;
                    const interceptCard = pet.interceptCard(petText);
                    await this.battleMsg?.edit(interceptCard);
                    await (0, utils_1.sleep)(this.PET_INTERCEPT);
                    isCrit = true;
                }
            }
            else if (pet instanceof Pet_1.Dragon) {
                const isSpawn = pet.isSpawn(p1Round);
                if (isSpawn) {
                    const burn = this.challengerMaxHP * pet.burn;
                    const { damage } = pet;
                    p2.hp -= burn;
                    p2.hp -= damage;
                    const petText = (0, common_tags_1.oneLine) `${p1.name}'s Dragon is using Flame Breath dealing
            \`${Math.round(damage)}\` damage and burns 
            \`${pet.burn * 100}% (${Math.round(burn)})\` of ${p2.name}'s hp`;
                    const interceptCard = pet.interceptCard(petText);
                    await this.battleMsg?.edit(interceptCard);
                    await (0, utils_1.sleep)(this.PET_INTERCEPT);
                }
            }
        }
        pet = p2 instanceof Player_1.Player && p2.activePet;
        // defensive
        if (pet) {
            if (pet instanceof Pet_1.Golem) {
                if (isCrit) {
                    const isSpawn = pet.isSpawn(p2Round);
                    if (isSpawn) {
                        await this.critAttack(p1);
                        isCrit = false;
                        isCritShown = true;
                        const petText = `${p1.name}'s Critical hit has been blocked by ${p2.name} Golem!`;
                        const interceptCard = pet.interceptCard(petText);
                        await this.battleMsg?.edit(interceptCard);
                        await (0, utils_1.sleep)(this.PET_INTERCEPT);
                    }
                }
            }
            else if (pet instanceof Pet_1.Gryphon) {
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
                    await (0, utils_1.sleep)(this.PET_INTERCEPT);
                    return;
                }
            }
        }
        if (p2 instanceof Player_1.Player && p1Round === 1) {
            const { equippedGears } = p2;
            const setBonus = Gear_1.Gear.getBonus(equippedGears);
            const gear = equippedGears.random();
            if (setBonus && gear instanceof ApprenticeGear_1.ApprenticeGear) {
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
                await (0, utils_1.sleep)(6000);
            }
        }
        const attackRate = reflected ? goneThrough
            : isCrit ? p1.critDamage * p1.strength : p1.strength;
        const damageReduction = p2.getArmorReduction(attackRate, p1.armorPenetration);
        const damageDone = attackRate - damageReduction;
        p2.hp -= damageDone;
        const critText = isCrit ? ` (x${(0, utils_1.roundTo)(p1.critDamage, 2)} critical hit)` : '';
        this.battleEmbed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.RED)
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
        this.battleEmbed = new discord_js_1.MessageEmbed();
        this.battleMsg = await this.msg.channel.send('Battle start');
        this.playerMaxHP = this.player.hp;
        this.challengerMaxHP = this.challenger.hp;
        // This determines whichever moves first. If the player has higher speed, it
        // returns 0, i.e, player moves first by default. Otherwise, it returns 1
        // which flips the value of isEven that makes the player move second. If both
        // has the same speed, it will be chosen randomly.
        const moveFirst = this.player.speed === this.challenger.speed
            ? main_1.client.random.pick([0, 1])
            : this.player.speed > this.challenger.speed
                ? 0
                : 1;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (this.isEven(this.round + moveFirst)) {
                this.playerRound++;
                await this.attack(this.player, this.challenger, this.playerRound, this.challengerRound);
            }
            else {
                this.challengerRound++;
                await this.attack(this.challenger, this.player, this.challengerRound, this.playerRound);
            }
            if (this.player.hp <= 0 || this.challenger.hp <= 0)
                break;
            await (0, utils_1.sleep)(2000);
            this.round++;
        }
        const isWon = this.player.hp > 0;
        this.battleEmbed.setColor(utils_1.GOLD);
        await this.battleMsg.edit(this.battleEmbed);
        return isWon;
    }
}
exports.Battle = Battle;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF0dGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9CYXR0bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQXNDO0FBQ3RDLDJDQUFtRDtBQUNuRCxrQ0FBaUM7QUFDakMscURBQWtEO0FBR2xELGlDQUE4QjtBQUM5QiwrQkFFZTtBQUNmLHFDQUFrQztBQUNsQyxtQ0FHaUI7QUFFakIsTUFBYSxNQUFNO0lBbUJqQixZQUNVLEdBQVksRUFDWixNQUFjLEVBQ2QsVUFBK0I7UUFGL0IsUUFBRyxHQUFILEdBQUcsQ0FBUztRQUNaLFdBQU0sR0FBTixNQUFNLENBQVE7UUFDZCxlQUFVLEdBQVYsVUFBVSxDQUFxQjtRQXJCakMsVUFBSyxHQUFHLENBQUMsQ0FBQztRQUVWLGdCQUFXLEdBQUcsQ0FBQyxDQUFDO1FBRWhCLG9CQUFlLEdBQUcsQ0FBQyxDQUFDO1FBRXBCLGtCQUFhLEdBQUcsSUFBSyxDQUFDLENBQUMsWUFBWTtRQVUzQyxZQUFPLEdBQUcsS0FBSyxDQUFDO1FBT2QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO0lBQzVDLENBQUM7SUFFTyxNQUFNLENBQUMsR0FBVztRQUN4QixPQUFPLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxDQUFDLFFBQWdCLEVBQUUsV0FBbUI7UUFDOUMsSUFBSSxRQUFRLEdBQUcsQ0FBQztZQUFFLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFL0IsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQztRQUNqQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUM7UUFDakIsTUFBTSxZQUFZLEdBQUcsSUFBSSxD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