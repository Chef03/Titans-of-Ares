import { oneLine } from 'common-tags';
import { Message, MessageEmbed, Snowflake } from 'discord.js';
import { squadMember } from '../commands/SquadBoss';
import { addInventory } from '../db/inventory';
import { client } from '../main';
import { Dragon, Golem, Gryphon, Manticore, Minotaur, Wisp } from './Pet';
import { Player } from './Player';
import { bosses, Iboss } from './SquadBattle';
import { CHALLENGER_CRIT_GIF, GOLD, PLAYER_CRIT_GIF, RED, sleep } from './utils';



export function randomIntFromInterval(min: number, max: number) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function bar(progress: number, maxProgress: number) {
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
function progressBar(hp: number, maxHP: number) {
    const maxHPStr = Math.round(maxHP);
    const healthBar = bar(hp, maxHP);
    const remainingHP = hp >= 0 ? Math.round(hp) : 0;
    return `\`${healthBar}\` \`${remainingHP}/${maxHPStr}\``;
}

export function getReducedDamage(armor: number, damageDone: number, player: any) {
    const multiplier = 100 / (100 + armor!);
    const reducedDamage = Math.round(damageDone! * multiplier);
    if (player) player.hitsTanked += damageDone - reducedDamage;
    return reducedDamage;
}

export type fullPlayer = typeof Player & {
    position?: string,
    realHP?: number,
    initialArmor?: number,
    damageDone?: number,
    pounces?: number,
    stuns?: number
}


function addDamage(players: any[], playerID: Snowflake, damage: number) {

    const player: any = players.find((player: any) => player.id === playerID);
    player!.damageDone += damage;

}


export async function FightBoss(message: Message, boss: string, team: squadMember[]) {

    let ping = '';

    team.map((player) => { if (player.discordID !== message.author.id) ping += `<@${player.discordID}>`; });
    client.squadBossChannel.send(`<@${message.author.id}> has started a squad battle!\n${ping}`);

    let players = await Promise.all(team.map(async (player) => {

        const discordUser = await message.guild?.members.fetch(player.discordID);
        const fetchedPlayer = await Player.getPlayer(discordUser!);
        return {
            ...fetchedPlayer, position: player.position, realHP: fetchedPlayer.hp, initialArmor: fetchedPlayer.armor, damageDone: 0, pounces: 0, stuns: 0, hasHealed: false, hasBeenSaved: false,
            usedDragon: false, hitsTanked: 0, rawDamageTaken: 0, charmed: false
        };


    }))



    players = players.sort((a, b) => {
        if (!b?.speed || !a?.speed) return 0;
        return b?.speed - a?.speed;
    });


    if (!players[0]) return;

    let fullBoss: Iboss = bosses.find((foundBoss) => foundBoss.name.toLowerCase() == boss.toLowerCase())!;




    let healthSum = 0;
    players.map((player) => {

        if (!player) return;
        healthSum += player?.hp;
        const pet = player.equippedPet;

        if (pet instanceof Wisp) {

            const amount = player.baseStats.hp * pet.multiplier;
            player.hp += amount;
            player.realHP += amount;


        }

        if (pet instanceof Golem) {

            const amount = pet.multiplier * player.armor;
            player.armor += amount;
            player.initialArmor += amount;


        }

        if (pet instanceof Gryphon) {

            const amount = player.baseStats.speed * pet.multiplier;
            player.speed += amount;

        }


        if (pet instanceof Manticore) {

            const amount = pet.multiplier;
            player.critDamage += amount;

        }

        if (pet instanceof Minotaur) {

            const { strength } = player.baseStats;
            const amount = strength * pet.multiplier;
            player.strength += amount;

        }



        if (pet instanceof Dragon) {

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
    let focusedTarget: any;

    let hasIncreasedArmor = false;
    let skipTurnIncrement = false;
    let armorHits = 0;
    let lavaPool = 0;
    let hasFainted = false;
    let hasCharmed = false;
    //players
    let alivePlayers = players.filter((player) => player!.realHP > 0);
    let frontRow = alivePlayers.filter((player) => player!.position === 'front');
    let backRow = alivePlayers.filter((player) => player!.position !== 'front');


    let alert = '';
    let fighterImage = '';



    const embed = new MessageEmbed();
    embed.setTitle('Squad Boss is starting...');
    embed.setColor(GOLD);
    embed.setImage('https://i.pinimg.com/originals/42/a8/d4/42a8d4625aeb088c45eba5a84ca36325.gif')
    // embed.description = `**Boss HP**\n ${progressBar(fullBoss.realHP, fullBoss.hp)}`
    // players.map(player => embed.description += `\n**${player?.name} HP**\n ${progressBar(player?.hp || 0, player?.hp || 0)}`)
    const fightMessage = await client.squadBossChannel.send(embed);
    await sleep(2000);


    function updateHealth() {

        let newHealth = 0;
        players.map((player) => {

            player.realHP = Math.round(player.realHP) < 0 ? 0 : Math.round(player.realHP);
            newHealth += Math.round(player.realHP);

        })

        healthSum = Math.round(newHealth);
        alivePlayers = players.filter((player) => Math.round(player!.realHP) > 0);
        frontRow = alivePlayers.filter((player) => player!.position === 'front');
        backRow = alivePlayers.filter((player) => player!.position !== 'front');

    }


    function updateEmbed() {

        embed.setTitle(alert);
        embed.setThumbnail(fighterImage!);
        embed.addField('Round', `${round}`);
        embed.description = `\n**Boss HP**\n ${progressBar(fullBoss.realHP!, fullBoss.hp)}`;

        const front = players.filter(player => player.position === 'front');
        const back = players.filter(player => player.position !== 'front');

        embed.description += '\n\nFront Row:'
        front.map((player) => embed.description += `\n**${player?.name} HP**\n ${progressBar(player?.realHP || 0, player?.hp || 0)}`);
        embed.description += '\n\nBack Row:'
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

        if (!alivePlayers.length) break;


        if (plays >= alivePlayers.length * 2) {
            plays = 0;
            round++;
        }

        plays++;

        if (!skipTurnIncrement) {

            (turn + 1 > alivePlayers.length) ? turn = 0 : null;

        }

        else {

            if (!alivePlayers[turn]) turn = 0;

        }




        if (status === 'boss') {



            embed.setColor('#DE3163')
            embed.addField('Attacker', `${fullBoss.name}`);
            fighterImage = fullBoss.imageURL!;



            if (fullBoss.name.toLowerCase() === 'berserker werewolf' && critCount == 12) {


                currentState = 'berserker';
                const skillEmbed = new MessageEmbed();
                skillEmbed.setColor('#DE3163')
                skillEmbed.setTitle('Berserker Wolf is now in berserker state!');
                skillEmbed.setDescription('Critical hits of Berserker Wolf will be multiplied by 5.\nIn addition crit chance is increased by 10%')
                skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001428520104374332/giphy_2.gif')
                await fightMessage.edit(skillEmbed);
                await sleep(6000);



            }





            // angry state
            if (fullBoss.name.toLowerCase() === 'angry harpy' && fullBoss.realHP / fullBoss.hp * 100 <= 25 && currentState !== 'angry') {

                //then activate angry state


                backRow = backRow.filter(player => Math.round(player.realHP) > 0);
                if (backRow.length) {

                    const randomIndex = randomIntFromInterval(0, backRow.length - 1);
                    currentState = 'angry';
                    focusedTarget = backRow[randomIndex];
                    const angryEmbed = new MessageEmbed();
                    angryEmbed.setColor(RED);
                    angryEmbed.setTitle('Harpy is now angry!')
                    angryEmbed.setDescription(`Harpy will focus \`${focusedTarget.name}\` and now deals double damage!`)
                    angryEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001426026267676702/Angryfocusstate.gif');
                    await fightMessage.edit(angryEmbed);
                    await sleep(7500);

                }





            }

            // state of toughness

            if (!hasIncreasedArmor && fullBoss.name.toLowerCase() === 'adult giant' && fullBoss.realHP / fullBoss.hp * 100 <= 50) {

                const skillEmbed = new MessageEmbed();
                skillEmbed.setColor('#DE3163')
                skillEmbed.setTitle('Adult Giant is now in state of toughness!');
                skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001430957427019828/giphy_3.gif')
                const oldArmor = fullBoss.armor;
                fullBoss.armor = (0.50 * fullBoss.armor!) + fullBoss.armor!;
                skillEmbed.setDescription(`The giant has increased his armor by 50%\n (from \`${oldArmor}\` to \`${fullBoss.armor}\`)`)
                hasIncreasedArmor = true;
                await fightMessage.edit(skillEmbed);
                await sleep(6000);

            }
            // lava spit


            if (!lavaPool && fullBoss.name.toLowerCase() === 'adult cerberus' && fullBoss.realHP / fullBoss.hp * 100 <= 75) {

                lavaPool = 1;

            }




            if (fullBoss.name.toLowerCase() === 'medusa' && !hasFainted) {


                const targetPlayer = players[players.length - 1];
                const skillEmbed = new MessageEmbed();
                skillEmbed.setColor('#DE3163')
                skillEmbed.setTitle(`Medusa looked ${targetPlayer?.name} in the eye`);
                skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001437519214288978/Stonegaze2.gif')
                skillEmbed.setDescription(`\`${targetPlayer?.name}\` has turned to stone and fainted`);
                targetPlayer!.realHP = 0;
                targetPlayer.rawDamageTaken = targetPlayer.hp;
                hasFainted = true;

                await fightMessage.edit(skillEmbed);
                await sleep(7500);

            }


            //charm

            if (fullBoss.name.toLowerCase() === 'siren' && alivePlayers.length >= 2 && !hasCharmed) {


                const sortedPlayers = players.sort((a, b) => b!.strength - a!.strength)
                const targetPlayer = sortedPlayers[0];



                sortedPlayers[0].charmed = true;

                const skillEmbed = new MessageEmbed();
                skillEmbed.setColor(GOLD)
                skillEmbed.setTitle(`Siren has charmed ${targetPlayer?.name} to attack fellow squad members!`);
                skillEmbed.setThumbnail(targetPlayer.imageUrl)
                skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001439536326397953/ezgif.com-gif-maker.gif')

                hasCharmed = true;

                await fightMessage.edit(skillEmbed);
                await sleep(6000);


            }


            updateHealth()




            if (frontRow.length && currentState != 'angry') {



                const randomIndex = randomIntFromInterval(0, frontRow.length - 1);
                let crit = Math.random() <= (currentState === 'berserker' ? fullBoss.critChance! + 0.10 : fullBoss.critChance!);
                const pet = frontRow[randomIndex]?.equippedPet;

                if (pet instanceof Golem) {


                    if (crit) {
                        const petText = `${fullBoss.name}'s Critical hit has been blocked by ${frontRow[randomIndex]?.name}'s Golem!`;
                        await fightMessage.edit(pet.interceptCard(petText))
                        await sleep(6000);
                        crit = false;
                    }


                }


                if (pet instanceof Gryphon) {


                    if (round === pet.spawnAt && !frontRow[randomIndex]!.hasBeenSaved) {

                        const petText = `${frontRow[randomIndex]!.name} has been saved from ${fullBoss.name}'s attack!`;
                        const interceptCard = pet.interceptCard(petText);
                        await fightMessage.edit(interceptCard);
                        status = 'player';
                        frontRow[randomIndex]!.hasBeenSaved = true;
                        await sleep(6000);
                        continue;

                    }



                }




                crit ? critCount++ : null;
                let damageDone = crit ? fullBoss.strength! * 2 : fullBoss.strength;

                const pounceRawDamage = Math.round(crit ? damageDone! / 2 : damageDone!);

                if (currentState === 'berserker' && crit) damageDone = damageDone! * 5 / 2;
                let reducedDamage = damageDone;



                if (frontRow[randomIndex]!.armor >= 0) {
                    reducedDamage = getReducedDamage(frontRow[randomIndex]!.armor, damageDone!, frontRow[randomIndex]);
                }


                frontRow[randomIndex]!.realHP = frontRow[randomIndex]!.realHP - reducedDamage! < 0 ? 0 : frontRow[randomIndex]!.realHP - reducedDamage!;

                frontRow[randomIndex]!.rawDamageTaken += reducedDamage!;

                alert = `${fullBoss.name} dealt ${reducedDamage} damage to ${frontRow[randomIndex]!.name}`;
                let multiplier = 0;
                if (currentState === 'berserker') multiplier = 5;
                else multiplier = 2;

                if (crit) {
                    const critEmbed = new MessageEmbed()
                        .setColor(RED)
                        .setImage(CHALLENGER_CRIT_GIF)
                        .setTitle(`${fullBoss.name} Critical Attack`)
                    await fightMessage.edit(critEmbed)
                    await sleep(4000)
                }


                embed.addField('Attack Rate', `\`${damageDone}${crit ? `(x${Math.round(multiplier)} critical hit)` : ''}\``, true);
                embed.addField('Damage Reduction', `\`${damageDone! - reducedDamage!}\``, true);
                embed.addField('Damage Done', `\`${reducedDamage}\``, true);
                await updateEmbed()
                await sleep(3000);
                updateHealth();


                if (lavaPool > 0 && frontRow.length) {

                    frontRow.map(player => {
                        player!.realHP = player!.realHP - 100 < 0 ? 0 : player!.realHP - 100,
                            player.rawDamageTaken! += 100;
                    })

                    const skillEmbed = new MessageEmbed();
                    skillEmbed.setColor('#DE3163')
                    skillEmbed.setTitle(lavaPool === 1 ? 'Cerberus has dropped a lava pool at the front row!' : 'Front row players are standing in lava!');

                    if (lavaPool == 1) {

                        skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001434076328231032/Lava2.gif')

                    }
                    else {
                        skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001434231496523786/Lava3.gif')
                    }
                    skillEmbed.setDescription(lavaPool === 1 ? `Front row players will now receive 100 damage every turn Cerberus attacks` : 'All front row players receive 100 damage')
                    lavaPool = 2;

                    await fightMessage.edit(skillEmbed)

                    if (lavaPool === 1) await sleep(6000);
                    if (lavaPool === 2) await sleep(3500);


                }

                updateHealth();
                if (!alivePlayers.length) break;
                //wait for boss skills
                await Promise.all(fullBoss.skills!.map((skill: any) => {


                    if (skill.name.toLowerCase() == 'pounce') {
                        return skill.run(fullBoss, fightMessage, embed, frontRow[randomIndex] || backRow[randomIntFromInterval(0, backRow.length - 1)], pounceRawDamage);
                    }

                    if (skill.name.toLowerCase() == 'noxious breath') {


                        if (skill.run(alivePlayers, fightMessage, armorHits)) {

                            armorHits < 5 ? armorHits++ : null;
                            return sleep(6000);

                        }

                        return null;


                    }



                    if (skill.run) {

                        return skill.run(fullBoss, fightMessage, embed, alivePlayers);

                    }


                }));



            } else {


                const randomIndex = randomIntFromInterval(0, alivePlayers.length - 1);
                let targetPlayer = focusedTarget || alivePlayers[randomIndex];


                if (focusedTarget && Math.round(focusedTarget.realHP) <= 0) {

                    const deadPlayer = focusedTarget.name;

                    backRow = backRow.filter(player => Math.round(player.realHP) > 0);
                    if (backRow.length) {
                        focusedTarget = backRow[randomIntFromInterval(0, backRow.length - 1)]
                    }
                    else {
                        frontRow = frontRow.filter(player => Math.round(player.realHP) > 0);
                        focusedTarget = alivePlayers[randomIntFromInterval(0, frontRow.length - 1)]
                    }

                    targetPlayer = focusedTarget;

                    const angryEmbed = new MessageEmbed();
                    angryEmbed.setColor(RED);
                    angryEmbed.setTitle(`Harpy has killed ${deadPlayer}!`)
                    angryEmbed.setDescription(`Harpy will focus ${targetPlayer.name} and now deals double damage!`)
                    angryEmbed.setImage('https://i.gifer.com/5P1l.gif');
                    await fightMessage.edit(angryEmbed);
                    await sleep(6000);



                }

                let crit = Math.random() <= (currentState === 'berserker' ? fullBoss.critChance! + 0.10 : fullBoss.critChance!);
                const pet = targetPlayer!.equippedPet;

                if (pet instanceof Golem) {


                    if (crit) {
                        const petText = `${fullBoss.name}'s Critical hit has been blocked by ${targetPlayer!.name}'s Golem!`;
                        await fightMessage.edit(pet.interceptCard(petText))
                        await sleep(4000);
                        crit = false;
                    }

                }



                if (pet instanceof Gryphon) {


                    if (round === pet.spawnAt && targetPlayer.hasBeenSaved) {

                        const petText = `${targetPlayer!.name} has been saved from ${fullBoss.name}'s attack!`;
                        const interceptCard = pet.interceptCard(petText);
                        await fightMessage.edit(interceptCard);
                        status = 'player';
                        targetPlayer.hasBeenSaved = true;
                        await sleep(6000);

                        continue;

                    }



                }

                crit ? critCount++ : null;
                let damageDone = crit ? fullBoss.strength! * 2 : fullBoss.strength;
                const pounceRawDamage = Math.round(crit ? damageDone! / 2 : damageDone!);
                if (currentState === 'berserker' && crit) damageDone = Math.round(damageDone! * 5 / 2);
                else if (currentState === 'angry') damageDone = Math.round(damageDone! * 2);
                let reducedDamage = damageDone;



                if (targetPlayer!.armor >= 0) {
                    reducedDamage = getReducedDamage(targetPlayer!.armor, damageDone!, targetPlayer);
                }

                targetPlayer!.realHP = targetPlayer!.realHP - reducedDamage! < 0 ? 0 : targetPlayer!.realHP - reducedDamage!;

                targetPlayer!.rawDamageTaken += reducedDamage!;

                alert = `${fullBoss.name} dealt ${reducedDamage} damage to ${targetPlayer!.name}`;


                let multiplier = 0;
                if (currentState === 'berserker') multiplier = 5;
                else multiplier = 2;
                updateHealth();

                if (crit) {
                    const critEmbed = new MessageEmbed()
                        .setColor(RED)
                        .setImage(CHALLENGER_CRIT_GIF)
                        .setTitle(`${fullBoss.name} Critical Attack`)
                    await fightMessage.edit(critEmbed)
                    await sleep(4000)
                }




                embed.addField('Attack Rate', `\`${damageDone}${crit ? `(x${Math.round(multiplier)} critical hit)` : ''}\``, true);
                embed.addField('Damage Reduction', `\`${damageDone! - reducedDamage!}\``, true);
                embed.addField('Damage Done', `\`${reducedDamage}\``, true);
                await updateEmbed()
                await sleep(3000);
                if (!alivePlayers.length) break;

                await Promise.all(fullBoss.skills!.map((skill: any) => {


                    if (skill.name.toLowerCase() == 'pounce') {
                        return skill.run(fullBoss, fightMessage, embed, frontRow[randomIndex] || backRow[randomIntFromInterval(0, backRow.length - 1)], pounceRawDamage);
                    }


                    if (skill.name.toLowerCase() == 'noxious breath') {


                        if (skill.run(players, fightMessage, armorHits)) {

                            armorHits < 5 ? armorHits++ : null;
                            return sleep(6000);

                        }

                        return null;


                    }


                    if (skill.run) {

                        return skill.run(fullBoss, fightMessage, embed, alivePlayers);

                    }


                }));







            }




        } else if (status === 'player') {





            embed.setColor('#6495ED');
            fighterImage = alivePlayers[turn]!.imageUrl;



            if (alivePlayers[turn]!.stuns > 0) {

                //turn 1 length 1 shouldnt work cuz turn 1 implies there is over 1 in length

                let previousPlayer = alivePlayers[turn]!;
                turn + 1 >= alivePlayers.length ? turn = 0 : turn++;
                skipTurnIncrement = true;


                const stunEmbed = new MessageEmbed().setColor(GOLD)
                    .setThumbnail(fighterImage)
                    .setTitle(`${previousPlayer.name} is stunned`)
                    .addField('Remaining Turns Stunned', previousPlayer.stuns - 1)
                    .setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001431365390188655/stunned.gif');

                await fightMessage.edit(stunEmbed);

                status = 'boss';
                previousPlayer.stuns -= 1;

                await sleep(6000)

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

                const damageDone = crit ? alivePlayers[turn].strength! * alivePlayers[turn].critDamage : alivePlayers[turn].strength;

                let reducedDamage = damageDone;

                const everybodyElse = alivePlayers.filter(player => player.id !== alivePlayers[turn].id);
                const attackedPlayer = everybodyElse[randomIntFromInterval(0, everybodyElse.length - 1)]

                if (attackedPlayer!.armor >= 0) {
                    reducedDamage = getReducedDamage(attackedPlayer!.armor, damageDone, attackedPlayer);
                }

                attackedPlayer!.realHP -= reducedDamage;
                attackedPlayer.rawDamageTaken += reducedDamage;

                if (Math.round(attackedPlayer!.realHP) < 0) attackedPlayer!.realHP = 0;

                updateHealth()

                if (crit) {

                    const critEmbed = new MessageEmbed()
                        .setColor(RED)
                        .setImage(PLAYER_CRIT_GIF)
                        .setTitle(`${alivePlayers[turn].name} Critical Attack`)
                    await fightMessage.edit(critEmbed)
                    await sleep(4000)

                }

                const charmEmbed = new MessageEmbed()
                charmEmbed.setColor(GOLD);
                charmEmbed.setThumbnail(alivePlayers[turn].imageUrl)
                charmEmbed.setDescription(`\`${alivePlayers[turn]?.name}\` has attacked \`${attackedPlayer?.name}\` dealing \`${reducedDamage}\` damage`);
                charmEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001439536326397953/ezgif.com-gif-maker.gif')

                await fightMessage.edit(charmEmbed);
                await sleep(3500);
                turn++;
                status = 'boss';
                continue;

            }






            const pet = alivePlayers[turn]!.equippedPet;


            if (pet instanceof Wisp && Math.round(alivePlayers[turn]!.realHP) < alivePlayers[turn]!.hp) {


                if (pet.spawnAt === round && !alivePlayers[turn]!.hasHealed) {


                    let amountHealed = 0;
                    alivePlayers[turn]!.realHP += (0.4 * alivePlayers[turn]!.hp);
                    amountHealed = Math.round((0.4 * alivePlayers[turn]!.hp))


                    if (alivePlayers[turn].realHP > alivePlayers[turn].hp) {

                        amountHealed = Math.round((0.4 * alivePlayers[turn]!.hp) - (alivePlayers[turn].realHP - alivePlayers[turn].hp));
                        alivePlayers[turn].realHP = alivePlayers[turn].hp;

                    }

                    alivePlayers[turn]!.hasHealed = true; //Neverlight is being healed (+774 hp)
                    await fightMessage.edit(pet.interceptCard(`${alivePlayers[turn]?.name} is being healed (+\`${amountHealed}\`)`))
                    await sleep(6000);

                }

            }



            if (pet instanceof Minotaur && Math.random() <= 0.2) {


                const damageDone = alivePlayers[turn].strength * 0.5;
                const reducedDamage = getReducedDamage(fullBoss.armor!, damageDone, alivePlayers[turn]);
                fullBoss.realHP -= reducedDamage;
                addDamage(alivePlayers, alivePlayers[turn].id, reducedDamage)
                await fightMessage.edit(pet.interceptCard(`${alivePlayers[turn].name}'s Minotaur attacks for \`${reducedDamage}\` damage!`));
                await sleep(6000);



            }


            if (pet instanceof Dragon && !alivePlayers[turn].usedDragon && Math.random() <= 0.8) {



                const burn = (fullBoss.hp * pet.burn) / 4;
                const { damage } = pet;
                fullBoss.realHP -= burn;
                fullBoss.realHP -= damage;
                alivePlayers[turn].usedDragon = true;
                addDamage(alivePlayers, alivePlayers[turn].id, damage + burn)

                const petText = oneLine`${alivePlayers[turn].name}'s Dragon is using Flame Breath dealing
                \`${Math.round(damage)}\` damage and burns 
                \`${(pet.burn * 100) / 4}% (${Math.round(burn)})\` of ${fullBoss.name}'s hp`;

                const interceptCard = pet.interceptCard(petText);
                await fightMessage.edit(interceptCard);
                await sleep(6000);



            }

            if (fullBoss.realHP! <= 0) break;


            embed.addField('Attacker', alivePlayers[turn]?.name);

            let crit = Math.random() <= alivePlayers[turn]!.critRate;

            if (pet instanceof Manticore && round == 1) {

                crit = true;
                const petText = `${alivePlayers[turn]?.name}'s Manticore has scared the opponent! \`100%\` critical hit`;
                await fightMessage.edit(pet.interceptCard(petText))
                await sleep(6000);




            }

            const damageDone = crit ? alivePlayers[turn]!.strength! * alivePlayers[turn]!.critDamage : alivePlayers[turn]!.strength;
            let reducedDamage = Math.round(damageDone);

            if (fullBoss.armor! >= 0) {
                reducedDamage = getReducedDamage(fullBoss.armor!, damageDone, null);
            }


            if (crit) {

                const critEmbed = new MessageEmbed()
                    .setColor(RED)
                    .setImage(PLAYER_CRIT_GIF)
                    .setTitle(`${alivePlayers[turn].name} Critical Attack`)
                await fightMessage.edit(critEmbed)
                await sleep(4000)

            }


            embed.addField('Attack Rate', `\`${Math.round(damageDone)}${crit ? `(x${Math.round(alivePlayers[turn]!.critDamage)} critical hit)` : ''}\``, true);
            embed.addField('Damage Reduction', `\`${Math.round(damageDone) - Math.round(reducedDamage!)}\``, true);
            embed.addField('Damage Done', `\`${Math.round(reducedDamage)}\``, true);



            addDamage(alivePlayers, alivePlayers[turn].id, reducedDamage);


            fullBoss.realHP -= reducedDamage;
            alert = `${alivePlayers[turn]!.name} dealt ${reducedDamage} damage to ${fullBoss.name}`;
            turn++;
            skipTurnIncrement = false;

            await updateEmbed()
            await sleep(3000);

        }




        updateHealth()
        status = status === 'boss' ? 'player' : 'boss';


    }




    const bossLevel = bosses.findIndex(boss => boss.name === fullBoss.name) + 1;
    const win = Math.round(fullBoss.realHP) <= 0;




    if (win) {


        const announcementEmbed = new MessageEmbed();
        announcementEmbed.setColor(GOLD);

        const announcement = `Your team has defeated ${fullBoss.name} (Level ${bossLevel})`;
        announcementEmbed.setTitle(announcement);
        announcementEmbed.setDescription(`You all receive \`${fullBoss.name} Emblem\` (Level ${bossLevel})`)

        for (let i = 0; i < players.length; i++) {

            await addInventory(players[i]!.id, fullBoss.reward?.id!)


        }


        await client.squadBossChannel.send(announcementEmbed);


    } else {


        const announcementEmbed = new MessageEmbed();
        announcementEmbed.setColor(GOLD);
        const announcement = `Your team has lost against ${fullBoss.name} (Level ${bossLevel})`;
        announcementEmbed.setTitle(announcement);
        await client.squadBossChannel.send(announcementEmbed);


    }

    const scoreBoard = new MessageEmbed()
    scoreBoard.setTitle('Scoreboard');
    scoreBoard.setColor(GOLD);

    players = players.sort((a, b) => b.damageDone - a.damageDone);
    scoreBoard.description = players.map(player => `${player.name}: \`${player.damageDone}\` damage done | damage taken \`${Math.round(player.rawDamageTaken)}\` (\`${Math.round(player.hitsTanked)}\` tanked)`).join('\n');
    await client.squadBossChannel.send(scoreBoard);
    if (win) client.squadBossChannel.send(`Last hit done by: ${alivePlayers[turn - 1].name}`);


    if (win) {

        const congrats = `@everyone ${team[0].squadName} has defeated ${fullBoss.name} (Level ${bossLevel})\nFeel free to congratulate <allplayernames> on their victory!`.replace('<allplayernames>', players.map(player => player.name).join(', '));
        await client.squadBossChannel.send(congrats);

    }

    else {

        const congrats = `@everyone ${team[0].squadName} has been defeated by ${fullBoss.name} (Level ${bossLevel})\nFeel free to shame <allplayernames> on their defeat!`.replace('<allplayernames>', players.map(player => player.name).join(', '));
        await client.squadBossChannel.send(congrats);


    }





}
