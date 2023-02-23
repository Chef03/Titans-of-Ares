"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FightBoss = exports.getReducedDamage = exports.randomIntFromInterval = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const inventory_1 = require("../db/inventory");
const main_1 = require("../main");
const Pet_1 = require("./Pet");
const Player_1 = require("./Player");
const SquadBattle_1 = require("./SquadBattle");
const utils_1 = require("./utils");
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
exports.randomIntFromInterval = randomIntFromInterval;
function bar(progress, maxProgress) {
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
function progressBar(hp, maxHP) {
    const maxHPStr = Math.round(maxHP);
    const healthBar = bar(hp, maxHP);
    const remainingHP = hp >= 0 ? Math.round(hp) : 0;
    return `\`${healthBar}\` \`${remainingHP}/${maxHPStr}\``;
}
function getReducedDamage(armor, damageDone, player) {
    const multiplier = 100 / (100 + armor);
    const reducedDamage = Math.round(damageDone * multiplier);
    if (player)
        player.hitsTanked += damageDone - reducedDamage;
    return reducedDamage;
}
exports.getReducedDamage = getReducedDamage;
function addDamage(players, playerID, damage) {
    const player = players.find((player) => player.id === playerID);
    player.damageDone += damage;
}
async function FightBoss(message, boss, team) {
    let ping = '';
    team.map((player) => { if (player.discordID !== message.author.id)
        ping += `<@${player.discordID}>`; });
    main_1.client.squadBossChannel.send(`<@${message.author.id}> has started a squad battle!\n${ping}`);
    let players = await Promise.all(team.map(async (player) => {
        const discordUser = await message.guild?.members.fetch(player.discordID);
        const fetchedPlayer = await Player_1.Player.getPlayer(discordUser);
        return {
            ...fetchedPlayer, position: player.position, realHP: fetchedPlayer.hp, initialArmor: fetchedPlayer.armor, damageDone: 0, pounces: 0, stuns: 0, hasHealed: false, hasBeenSaved: false,
            usedDragon: false, hitsTanked: 0, rawDamageTaken: 0, charmed: false
        };
    }));
    players = players.sort((a, b) => {
        if (!b?.speed || !a?.speed)
            return 0;
        return b?.speed - a?.speed;
    });
    if (!players[0])
        return;
    let fullBoss = SquadBattle_1.bosses.find((foundBoss) => foundBoss.name.toLowerCase() == boss.toLowerCase());
    let healthSum = 0;
    players.map((player) => {
        if (!player)
            return;
        healthSum += player?.hp;
        const pet = player.equippedPet;
        if (pet instanceof Pet_1.Wisp) {
            const amount = player.baseStats.hp * pet.multiplier;
            player.hp += amount;
            player.realHP += amount;
        }
        if (pet instanceof Pet_1.Golem) {
            const amount = pet.multiplier * player.armor;
            player.armor += amount;
            player.initialArmor += amount;
        }
        if (pet instanceof Pet_1.Gryphon) {
            const amount = player.baseStats.speed * pet.multiplier;
            player.speed += amount;
        }
        if (pet instanceof Pet_1.Manticore) {
            const amount = pet.multiplier;
            player.critDamage += amount;
        }
        if (pet instanceof Pet_1.Minotaur) {
            const { strength } = player.baseStats;
            const amount = strength * pet.multiplier;
            player.strength += amount;
        }
        if (pet instanceof Pet_1.Dragon) {
            const strengthAmount = player.strength * pet.multiplier;
            const hpAmount = player.hp * pet.multiplier;
            const armorAmount = player.armor * pet.multiplier;
            const speedAmount = player.speed * pet.multiplier;
            player.strength += strengthAmount;
            player.hp += hpAmount;
            player.realHP += hpAmount;
            player.armor += armorAmount;
            player.initialArmor += armorAmount;
            player.speed += speedAmount;
        }
    });
    fullBoss.realHP = fullBoss.hp;
    const initiator = players[0]?.speed > fullBoss.speed ? 'player' : 'boss';
    let turn = 0;
    let plays = 0;
    let round = 1;
    let status = initiator;
    let critCount = 0;
    let currentState = '';
    let focusedTarget;
    let hasIncreasedArmor = false;
    let skipTurnIncrement = false;
    let armorHits = 0;
    let lavaPool = 0;
    let hasFainted = false;
    let hasCharmed = false;
    //players
    let alivePlayers = players.filter((player) => player.realHP > 0);
    let frontRow = alivePlayers.filter((player) => player.position === 'front');
    let backRow = alivePlayers.filter((player) => player.position !== 'front');
    let alert = '';
    let fighterImage = '';
    const embed = new discord_js_1.MessageEmbed();
    embed.setTitle('Squad Boss is starting...');
    embed.setColor(utils_1.GOLD);
    embed.setImage('https://i.pinimg.com/originals/42/a8/d4/42a8d4625aeb088c45eba5a84ca36325.gif');
    // embed.description = `**Boss HP**\n ${progressBar(fullBoss.realHP, fullBoss.hp)}`
    // players.map(player => embed.description += `\n**${player?.name} HP**\n ${progressBar(player?.hp || 0, player?.hp || 0)}`)
    const fightMessage = await main_1.client.squadBossChannel.send(embed);
    await (0, utils_1.sleep)(2000);
    function updateHealth() {
        let newHealth = 0;
        players.map((player) => {
            player.realHP = Math.round(player.realHP) < 0 ? 0 : Math.round(player.realHP);
            newHealth += Math.round(player.realHP);
        });
        healthSum = Math.round(newHealth);
        alivePlayers = players.filter((player) => Math.round(player.realHP) > 0);
        frontRow = alivePlayers.filter((player) => player.position === 'front');
        backRow = alivePlayers.filter((player) => player.position !== 'front');
    }
    function updateEmbed() {
        embed.setTitle(alert);
        embed.setThumbnail(fighterImage);
        embed.addField('Round', `${round}`);
        embed.description = `\n**Boss HP**\n ${progressBar(fullBoss.realHP, fullBoss.hp)}`;
        const front = players.filter(player => player.position === 'front');
        const back = players.filter(player => player.position !== 'front');
        embed.description += '\n\nFront Row:';
        front.map((player) => embed.description += `\n**${player?.name} HP**\n ${progressBar(player?.realHP || 0, player?.hp || 0)}`);
        embed.description += '\n\nBack Row:';
        back.map((player) => embed.description += `\n**${player?.name} HP**\n ${progressBar(player?.realHP || 0, player?.hp || 0)}`);
        embed.description += '\n\u200B';
        return fightMessage.edit(embed);
    }
    function resetEmbed() {
        embed.setTitle('');
        embed.setThumbnail('');
        embed.setImage('');
        embed.setFooter('');
        embed.fields = [];
    }
    while (healthSum > 0 && fullBoss.realHP > 0) {
        resetEmbed();
        updateHealth();
        if (!alivePlayers.length)
            break;
        if (plays >= alivePlayers.length * 2) {
            plays = 0;
            round++;
        }
        plays++;
        if (!skipTurnIncrement) {
            (turn + 1 > alivePlayers.length) ? turn = 0 : null;
        }
        else {
            if (!alivePlayers[turn])
                turn = 0;
        }
        if (status === 'boss') {
            embed.setColor('#DE3163');
            embed.addField('Attacker', `${fullBoss.name}`);
            fighterImage = fullBoss.imageURL;
            if (fullBoss.name.toLowerCase() === 'berserker werewolf' && critCount == 12) {
                currentState = 'berserker';
                const skillEmbed = new discord_js_1.MessageEmbed();
                skillEmbed.setColor('#DE3163');
                skillEmbed.setTitle('Berserker Wolf is now in berserker state!');
                skillEmbed.setDescription('Critical hits of Berserker Wolf will be multiplied by 5.\nIn addition crit chance is increased by 10%');
                skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001428520104374332/giphy_2.gif');
                await fightMessage.edit(skillEmbed);
                await (0, utils_1.sleep)(6000);
            }
            // angry state
            if (fullBoss.name.toLowerCase() === 'angry harpy' && fullBoss.realHP / fullBoss.hp * 100 <= 25 && currentState !== 'angry') {
                //then activate angry state
                backRow = backRow.filter(player => Math.round(player.realHP) > 0);
                if (backRow.length) {
                    const randomIndex = randomIntFromInterval(0, backRow.length - 1);
                    currentState = 'angry';
                    focusedTarget = backRow[randomIndex];
                    const angryEmbed = new discord_js_1.MessageEmbed();
                    angryEmbed.setColor(utils_1.RED);
                    angryEmbed.setTitle('Harpy is now angry!');
                    angryEmbed.setDescription(`Harpy will focus \`${focusedTarget.name}\` and now deals double damage!`);
                    angryEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001426026267676702/Angryfocusstate.gif');
                    await fightMessage.edit(angryEmbed);
                    await (0, utils_1.sleep)(7500);
                }
            }
            // state of toughness
            if (!hasIncreasedArmor && fullBoss.name.toLowerCase() === 'adult giant' && fullBoss.realHP / fullBoss.hp * 100 <= 50) {
                const skillEmbed = new discord_js_1.MessageEmbed();
                skillEmbed.setColor('#DE3163');
                skillEmbed.setTitle('Adult Giant is now in state of toughness!');
                skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001430957427019828/giphy_3.gif');
                const oldArmor = fullBoss.armor;
                fullBoss.armor = (0.50 * fullBoss.armor) + fullBoss.armor;
                skillEmbed.setDescription(`The giant has increased his armor by 50%\n (from \`${oldArmor}\` to \`${fullBoss.armor}\`)`);
                hasIncreasedArmor = true;
                await fightMessage.edit(skillEmbed);
                await (0, utils_1.sleep)(6000);
            }
            // lava spit
            if (!lavaPool && fullBoss.name.toLowerCase() === 'adult cerberus' && fullBoss.realHP / fullBoss.hp * 100 <= 75) {
                lavaPool = 1;
            }
            if (fullBoss.name.toLowerCase() === 'medusa' && !hasFainted) {
                const targetPlayer = players[players.length - 1];
                const skillEmbed = new discord_js_1.MessageEmbed();
                skillEmbed.setColor('#DE3163');
                skillEmbed.setTitle(`Medusa looked ${targetPlayer?.name} in the eye`);
                skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001437519214288978/Stonegaze2.gif');
                skillEmbed.setDescription(`\`${targetPlayer?.name}\` has turned to stone and fainted`);
                targetPlayer.realHP = 0;
                targetPlayer.rawDamageTaken = targetPlayer.hp;
                hasFainted = true;
                await fightMessage.edit(skillEmbed);
                await (0, utils_1.sleep)(7500);
            }
            //charm
            if (fullBoss.name.toLowerCase() === 'siren' && alivePlayers.length >= 2 && !hasCharmed) {
                const sortedPlayers = players.sort((a, b) => b.strength - a.strength);
                const targetPlayer = sortedPlayers[0];
                sortedPlayers[0].charmed = true;
                const skillEmbed = new discord_js_1.MessageEmbed();
                skillEmbed.setColor(utils_1.GOLD);
                skillEmbed.setTitle(`Siren has charmed ${targetPlayer?.name} to attack fellow squad members!`);
                skillEmbed.setThumbnail(targetPlayer.imageUrl);
                skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001439536326397953/ezgif.com-gif-maker.gif');
                hasCharmed = true;
                await fightMessage.edit(skillEmbed);
                await (0, utils_1.sleep)(6000);
            }
            updateHealth();
            if (frontRow.length && currentState != 'angry') {
                const randomIndex = randomIntFromInterval(0, frontRow.length - 1);
                let crit = Math.random() <= (currentState === 'berserker' ? fullBoss.critChance + 0.10 : fullBoss.critChance);
                const pet = frontRow[randomIndex]?.equippedPet;
                if (pet instanceof Pet_1.Golem) {
                    if (crit) {
                        const petText = `${fullBoss.name}'s Critical hit has been blocked by ${frontRow[randomIndex]?.name}'s Golem!`;
                        await fightMessage.edit(pet.interceptCard(petText));
                        await (0, utils_1.sleep)(6000);
                        crit = false;
                    }
                }
                if (pet instanceof Pet_1.Gryphon) {
                    if (round === pet.spawnAt && !frontRow[randomIndex].hasBeenSaved) {
                        const petText = `${frontRow[randomIndex].name} has been saved from ${fullBoss.name}'s attack!`;
                        const interceptCard = pet.interceptCard(petText);
                        await fightMessage.edit(interceptCard);
                        status = 'player';
                        frontRow[randomIndex].hasBeenSaved = true;
                        await (0, utils_1.sleep)(6000);
                        continue;
                    }
                }
                crit ? critCount++ : null;
                let damageDone = crit ? fullBoss.strength * 2 : fullBoss.strength;
                const pounceRawDamage = Math.round(crit ? damageDone / 2 : damageDone);
                if (currentState === 'berserker' && crit)
                    damageDone = damageDone * 5 / 2;
                let reducedDamage = damageDone;
                if (frontRow[randomIndex].armor >= 0) {
                    reducedDamage = getReducedDamage(frontRow[randomIndex].armor, damageDone, frontRow[randomIndex]);
                }
                frontRow[randomIndex].realHP = frontRow[randomIndex].realHP - reducedDamage < 0 ? 0 : frontRow[randomIndex].realHP - reducedDamage;
                frontRow[randomIndex].rawDamageTaken += reducedDamage;
                alert = `${fullBoss.name} dealt ${reducedDamage} damage to ${frontRow[randomIndex].name}`;
                let multiplier = 0;
                if (currentState === 'berserker')
                    multiplier = 5;
                else
                    multiplier = 2;
                if (crit) {
                    const critEmbed = new discord_js_1.MessageEmbed()
                        .setColor(utils_1.RED)
                        .setImage(utils_1.CHALLENGER_CRIT_GIF)
                        .setTitle(`${fullBoss.name} Critical Attack`);
                    await fightMessage.edit(critEmbed);
                    await (0, utils_1.sleep)(4000);
                }
                embed.addField('Attack Rate', `\`${damageDone}${crit ? `(x${Math.round(multiplier)} critical hit)` : ''}\``, true);
                embed.addField('Damage Reduction', `\`${damageDone - reducedDamage}\``, true);
                embed.addField('Damage Done', `\`${reducedDamage}\``, true);
                await updateEmbed();
                await (0, utils_1.sleep)(3000);
                updateHealth();
                if (lavaPool > 0 && frontRow.length) {
                    frontRow.map(player => {
                        player.realHP = player.realHP - 100 < 0 ? 0 : player.realHP - 100,
                            player.rawDamageTaken += 100;
                    });
                    const skillEmbed = new discord_js_1.MessageEmbed();
                    skillEmbed.setColor('#DE3163');
                    skillEmbed.setTitle(lavaPool === 1 ? 'Cerberus has dropped a lava pool at the front row!' : 'Front row players are standing in lava!');
                    if (lavaPool == 1) {
                        skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001434076328231032/Lava2.gif');
                    }
                    else {
                        skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001434231496523786/Lava3.gif');
                    }
                    skillEmbed.setDescription(lavaPool === 1 ? `Front row players will now receive 100 damage every turn Cerberus attacks` : 'All front row players receive 100 damage');
                    lavaPool = 2;
                    await fightMessage.edit(skillEmbed);
                    if (lavaPool === 1)
                        await (0, utils_1.sleep)(6000);
                    if (lavaPool === 2)
                        await (0, utils_1.sleep)(3500);
                }
                updateHealth();
                if (!alivePlayers.length)
                    break;
                //wait for boss skills
                await Promise.all(fullBoss.skills.map((skill) => {
                    if (skill.name.toLowerCase() == 'pounce') {
                        return skill.run(fullBoss, fightMessage, embed, frontRow[randomIndex] || backRow[randomIntFromInterval(0, backRow.length - 1)], pounceRawDamage);
                    }
                    if (skill.name.toLowerCase() == 'noxious breath') {
                        if (skill.run(alivePlayers, fightMessage, armorHits)) {
                            armorHits < 5 ? armorHits++ : null;
                            return (0, utils_1.sleep)(6000);
                        }
                        return null;
                    }
                    if (skill.run) {
                        return skill.run(fullBoss, fightMessage, embed, alivePlayers);
                    }
                }));
            }
            else {
                const randomIndex = randomIntFromInterval(0, alivePlayers.length - 1);
                let targetPlayer = focusedTarget || alivePlayers[randomIndex];
                if (focusedTarget && Math.round(focusedTarget.realHP) <= 0) {
                    const deadPlayer = focusedTarget.name;
                    backRow = backRow.filter(player => Math.round(player.realHP) > 0);
                    if (backRow.length) {
                        focusedTarget = backRow[randomIntFromInterval(0, backRow.length - 1)];
                    }
                    else {
                        frontRow = frontRow.filter(player => Math.round(player.realHP) > 0);
                        focusedTarget = alivePlayers[randomIntFromInterval(0, frontRow.length - 1)];
                    }
                    targetPlayer = focusedTarget;
                    const angryEmbed = new discord_js_1.MessageEmbed();
                    angryEmbed.setColor(utils_1.RED);
                    angryEmbed.setTitle(`Harpy has killed ${deadPlayer}!`);
                    angryEmbed.setDescription(`Harpy will focus ${targetPlayer.name} and now deals double damage!`);
                    angryEmbed.setImage('https://i.gifer.com/5P1l.gif');
                    await fightMessage.edit(angryEmbed);
                    await (0, utils_1.sleep)(6000);
                }
                let crit = Math.random() <= (currentState === 'berserker' ? fullBoss.critChance + 0.10 : fullBoss.critChance);
                const pet = targetPlayer.equippedPet;
                if (pet instanceof Pet_1.Golem) {
                    if (crit) {
                        const petText = `${fullBoss.name}'s Critical hit has been blocked by ${targetPlayer.name}'s Golem!`;
                        await fightMessage.edit(pet.interceptCard(petText));
                        await (0, utils_1.sleep)(4000);
                        crit = false;
                    }
                }
                if (pet instanceof Pet_1.Gryphon) {
                    if (round === pet.spawnAt && targetPlayer.hasBeenSaved) {
                        const petText = `${targetPlayer.name} has been saved from ${fullBoss.name}'s attack!`;
                        const interceptCard = pet.interceptCard(petText);
                        await fightMessage.edit(interceptCard);
                        status = 'player';
                        targetPlayer.hasBeenSaved = true;
                        await (0, utils_1.sleep)(6000);
                        continue;
                    }
                }
                crit ? critCount++ : null;
                let damageDone = crit ? fullBoss.strength * 2 : fullBoss.strength;
                const pounceRawDamage = Math.round(crit ? damageDone / 2 : damageDone);
                if (currentState === 'berserker' && crit)
                    damageDone = Math.round(damageDone * 5 / 2);
                else if (currentState === 'angry')
                    damageDone = Math.round(damageDone * 2);
                let reducedDamage = damageDone;
                if (targetPlayer.armor >= 0) {
                    reducedDamage = getReducedDamage(targetPlayer.armor, damageDone, targetPlayer);
                }
                targetPlayer.realHP = targetPlayer.realHP - reducedDamage < 0 ? 0 : targetPlayer.realHP - reducedDamage;
                targetPlayer.rawDamageTaken += reducedDamage;
                alert = `${fullBoss.name} dealt ${reducedDamage} damage to ${targetPlayer.name}`;
                let multiplier = 0;
                if (currentState === 'berserker')
                    multiplier = 5;
                else
                    multiplier = 2;
                updateHealth();
                if (crit) {
                    const critEmbed = new discord_js_1.MessageEmbed()
                        .setColor(utils_1.RED)
                        .setImage(utils_1.CHALLENGER_CRIT_GIF)
                        .setTitle(`${fullBoss.name} Critical Attack`);
                    await fightMessage.edit(critEmbed);
                    await (0, utils_1.sleep)(4000);
                }
                embed.addField('Attack Rate', `\`${damageDone}${crit ? `(x${Math.round(multiplier)} critical hit)` : ''}\``, true);
                embed.addField('Damage Reduction', `\`${damageDone - reducedDamage}\``, true);
                embed.addField('Damage Done', `\`${reducedDamage}\``, true);
                await updateEmbed();
                await (0, utils_1.sleep)(3000);
                if (!alivePlayers.length)
                    break;
                await Promise.all(fullBoss.skills.map((skill) => {
                    if (skill.name.toLowerCase() == 'pounce') {
                        return skill.run(fullBoss, fightMessage, embed, frontRow[randomIndex] || backRow[randomIntFromInterval(0, backRow.length - 1)], pounceRawDamage);
                    }
                    if (skill.name.toLowerCase() == 'noxious breath') {
                        if (skill.run(players, fightMessage, armorHits)) {
                            armorHits < 5 ? armorHits++ : null;
                            return (0, utils_1.sleep)(6000);
                        }
                        return null;
                    }
                    if (skill.run) {
                        return skill.run(fullBoss, fightMessage, embed, alivePlayers);
                    }
                }));
            }
        }
        else if (status === 'player') {
            embed.setColor('#6495ED');
            fighterImage = alivePlayers[turn].imageUrl;
            if (alivePlayers[turn].stuns > 0) {
                //turn 1 length 1 shouldnt work cuz turn 1 implies there is over 1 in length
                let previousPlayer = alivePlayers[turn];
                turn + 1 >= alivePlayers.length ? turn = 0 : turn++;
                skipTurnIncrement = true;
                const stunEmbed = new discord_js_1.MessageEmbed().setColor(utils_1.GOLD)
                    .setThumbnail(fighterImage)
                    .setTitle(`${previousPlayer.name} is stunned`)
                    .addField('Remaining Turns Stunned', previousPlayer.stuns - 1)
                    .setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001431365390188655/stunned.gif');
                await fightMessage.edit(stunEmbed);
                status = 'boss';
                previousPlayer.stuns -= 1;
                await (0, utils_1.sleep)(6000);
                continue;
            }
            if (alivePlayers[turn].charmed && alivePlayers.length <= 1) {
                alivePlayers[turn].charmed = false;
            }
            if (alivePlayers[turn].charmed) {
                if (alivePlayers.length <= 1) {
                    alivePlayers[turn].charmed = false;
                    return status = 'boss';
                }
                const crit = Math.random() <= alivePlayers[turn].critRate;
                const damageDone = crit ? alivePlayers[turn].strength * alivePlayers[turn].critDamage : alivePlayers[turn].strength;
                let reducedDamage = damageDone;
                const everybodyElse = alivePlayers.filter(player => player.id !== alivePlayers[turn].id);
                const attackedPlayer = everybodyElse[randomIntFromInterval(0, everybodyElse.length - 1)];
                if (attackedPlayer.armor >= 0) {
                    reducedDamage = getReducedDamage(attackedPlayer.armor, damageDone, attackedPlayer);
                }
                attackedPlayer.realHP -= reducedDamage;
                attackedPlayer.rawDamageTaken += reducedDamage;
                if (Math.round(attackedPlayer.realHP) < 0)
                    attackedPlayer.realHP = 0;
                updateHealth();
                if (crit) {
                    const critEmbed = new discord_js_1.MessageEmbed()
                        .setColor(utils_1.RED)
                        .setImage(utils_1.PLAYER_CRIT_GIF)
                        .setTitle(`${alivePlayers[turn].name} Critical Attack`);
                    await fightMessage.edit(critEmbed);
                    await (0, utils_1.sleep)(4000);
                }
                const charmEmbed = new discord_js_1.MessageEmbed();
                charmEmbed.setColor(utils_1.GOLD);
                charmEmbed.setThumbnail(alivePlayers[turn].imageUrl);
                charmEmbed.setDescription(`\`${alivePlayers[turn]?.name}\` has attacked \`${attackedPlayer?.name}\` dealing \`${reducedDamage}\` damage`);
                charmEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001439536326397953/ezgif.com-gif-maker.gif');
                await fightMessage.edit(charmEmbed);
                await (0, utils_1.sleep)(3500);
                turn++;
                status = 'boss';
                continue;
            }
            const pet = alivePlayers[turn].equippedPet;
            if (pet instanceof Pet_1.Wisp && Math.round(alivePlayers[turn].realHP) < alivePlayers[turn].hp) {
                if (pet.spawnAt === round && !alivePlayers[turn].hasHealed) {
                    let amountHealed = 0;
                    alivePlayers[turn].realHP += (0.4 * alivePlayers[turn].hp);
                    amountHealed = Math.round((0.4 * alivePlayers[turn].hp));
                    if (alivePlayers[turn].realHP > alivePlayers[turn].hp) {
                        amountHealed = Math.round((0.4 * alivePlayers[turn].hp) - (alivePlayers[turn].realHP - alivePlayers[turn].hp));
                        alivePlayers[turn].realHP = alivePlayers[turn].hp;
                    }
                    alivePlayers[turn].hasHealed = true; //Neverlight is being healed (+774 hp)
                    await fightMessage.edit(pet.interceptCard(`${alivePlayers[turn]?.name} is being healed (+\`${amountHealed}\`)`));
                    await (0, utils_1.sleep)(6000);
                }
            }
            if (pet instanceof Pet_1.Minotaur && Math.random() <= 0.2) {
                const damageDone = alivePlayers[turn].strength * 0.5;
                const reducedDamage = getReducedDamage(fullBoss.armor, damageDone, alivePlayers[turn]);
                fullBoss.realHP -= reducedDamage;
                addDamage(alivePlayers, alivePlayers[turn].id, reducedDamage);
                await fightMessage.edit(pet.interceptCard(`${alivePlayers[turn].name}'s Minotaur attacks for \`${reducedDamage}\` damage!`));
                await (0, utils_1.sleep)(6000);
            }
            if (pet instanceof Pet_1.Dragon && !alivePlayers[turn].usedDragon && Math.random() <= 0.8) {
                const burn = (fullBoss.hp * pet.burn) / 4;
                const { damage } = pet;
                fullBoss.realHP -= burn;
                fullBoss.realHP -= damage;
                alivePlayers[turn].usedDragon = true;
                addDamage(alivePlayers, alivePlayers[turn].id, damage + burn);
                const petText = (0, common_tags_1.oneLine) `${alivePlayers[turn].name}'s Dragon is using Flame Breath dealing
                \`${Math.round(damage)}\` damage and burns 
                \`${(pet.burn * 100) / 4}% (${Math.round(burn)})\` of ${fullBoss.name}'s hp`;
                const interceptCard = pet.interceptCard(petText);
                await fightMessage.edit(interceptCard);
                await (0, utils_1.sleep)(6000);
            }
            if (fullBoss.realHP <= 0)
                break;
            embed.addField('Attacker', alivePlayers[turn]?.name);
            let crit = Math.random() <= alivePlayers[turn].critRate;
            if (pet instanceof Pet_1.Manticore && round == 1) {
                crit = true;
                const petText = `${alivePlayers[turn]?.name}'s Manticore has scared the opponent! \`100%\` critical hit`;
                await fightMessage.edit(pet.interceptCard(petText));
                await (0, utils_1.sleep)(6000);
            }
            const damageDone = crit ? alivePlayers[turn].strength * alivePlayers[turn].critDamage : alivePlayers[turn].strength;
            let reducedDamage = Math.round(damageDone);
            if (fullBoss.armor >= 0) {
                reducedDamage = getReducedDamage(fullBoss.armor, damageDone, null);
            }
            if (crit) {
                const critEmbed = new discord_js_1.MessageEmbed()
                    .setColor(utils_1.RED)
                    .setImage(utils_1.PLAYER_CRIT_GIF)
                    .setTitle(`${alivePlayers[turn].name} Critical Attack`);
                await fightMessage.edit(critEmbed);
                await (0, utils_1.sleep)(4000);
            }
            embed.addField('Attack Rate', `\`${Math.round(damageDone)}${crit ? `(x${Math.round(alivePlayers[turn].critDamage)} critical hit)` : ''}\``, true);
            embed.addField('Damage Reduction', `\`${Math.round(damageDone) - Math.round(reducedDamage)}\``, true);
            embed.addField('Damage Done', `\`${Math.round(reducedDamage)}\``, true);
            addDamage(alivePlayers, alivePlayers[turn].id, reducedDamage);
            fullBoss.realHP -= reducedDamage;
            alert = `${alivePlayers[turn].name} dealt ${reducedDamage} damage to ${fullBoss.name}`;
            turn++;
            skipTurnIncrement = false;
            await updateEmbed();
            await (0, utils_1.sleep)(3000);
        }
        updateHealth();
        status = status === 'boss' ? 'player' : 'boss';
    }
    const bossLevel = SquadBattle_1.bosses.findIndex(boss => boss.name === fullBoss.name) + 1;
    const win = Math.round(fullBoss.realHP) <= 0;
    if (win) {
        const announcementEmbed = new discord_js_1.MessageEmbed();
        announcementEmbed.setColor(utils_1.GOLD);
        const announcement = `Your team has defeated ${fullBoss.name} (Level ${bossLevel})`;
        announcementEmbed.setTitle(announcement);
        announcementEmbed.setDescription(`You all receive \`${fullBoss.name} Emblem\` (Level ${bossLevel})`);
        for (let i = 0; i < players.length; i++) {
            await (0, inventory_1.addInventory)(players[i].id, fullBoss.reward?.id);
        }
        await main_1.client.squadBossChannel.send(announcementEmbed);
    }
    else {
        const announcementEmbed = new discord_js_1.MessageEmbed();
        announcementEmbed.setColor(utils_1.GOLD);
        const announcement = `Your team has lost against ${fullBoss.name} (Level ${bossLevel})`;
        announcementEmbed.setTitle(announcement);
        await main_1.client.squadBossChannel.send(announcementEmbed);
    }
    const scoreBoard = new discord_js_1.MessageEmbed();
    scoreBoard.setTitle('Scoreboard');
    scoreBoard.setColor(utils_1.GOLD);
    players = players.sort((a, b) => b.damageDone - a.damageDone);
    scoreBoard.description = players.map(player => `${player.name}: \`${player.damageDone}\` damage done | damage taken \`${Math.round(player.rawDamageTaken)}\` (\`${Math.round(player.hitsTanked)}\` tanked)`).join('\n');
    await main_1.client.squadBossChannel.send(scoreBoard);
    if (win)
        main_1.client.squadBossChannel.send(`Last hit done by: ${alivePlayers[turn - 1].name}`);
    if (win) {
        const congrats = `@everyone ${team[0].squadName} has defeated ${fullBoss.name} (Level ${bossLevel})\nFeel free to congratulate <allplayernames> on their victory!`.replace('<allplayernames>', players.map(player => player.name).join(', '));
        await main_1.client.squadBossChannel.send(congrats);
    }
    else {
        const congrats = `@everyone ${team[0].squadName} has been defeated by ${fullBoss.name} (Level ${bossLevel})\nFeel free to shame <allplayernames> on their defeat!`.replace('<allplayernames>', players.map(player => player.name).join(', '));
        await main_1.client.squadBossChannel.send(congrats);
    }
}
exports.FightBoss = FightBoss;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlnaHRCb3NzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9GaWdodEJvc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQXNDO0FBQ3RDLDJDQUE4RDtBQUU5RCwrQ0FBK0M7QUFDL0Msa0NBQWlDO0FBQ2pDLCtCQUEwRTtBQUMxRSxxQ0FBa0M7QUFDbEMsK0NBQThDO0FBQzlDLG1DQUFpRjtBQUlqRixTQUFnQixxQkFBcUIsQ0FBQyxHQUFXLEVBQUUsR0FBVztJQUMxRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRkQsc0RBRUM7QUFFRCxTQUFTLEdBQUcsQ0FBQyxRQUFnQixFQUFFLFdBQW1CO0lBQzlDLElBQUksUUFBUSxHQUFHLENBQUM7UUFBRSxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBRS9CLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztJQUNuQixNQUFNLElBQUksR0FBRyxHQUFHLENBQUM7SUFDakIsTUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBQ2pCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUM7SUFFcEUsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDO1NBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUM7U0FDVixHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDNUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ2xCLENBQUM7QUFFRCx1Q0FBdUM7QUFD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