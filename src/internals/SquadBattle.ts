import { GuildMember, Message, MessageEmbed } from 'discord.js';
import * as progressBar from 'string-progressbar';
import { squadMember } from '../commands/SquadBoss';
import { dbAll, dbGet, dbRun } from '../db/promiseWrapper';
import { Squad } from '../db/squad';
import { ButtonHandler } from './ButtonHandler';
import { BLUE_BUTTON, GOLD, sleep } from './utils';
import { FightBoss, getReducedDamage, randomIntFromInterval } from './FightBoss';
import { BossReward, SmallRat, MediumRat, AdultCerberus, AdultGiant, AngryHarpy, SmallWerewolf, BerserkerWerewolf, GiantRat, MatureWerewolf, MediumCerberus, MediumGiant, MediumHarpy, Medusa, Siren, SmallCerberus, SmallHarpy, YoungGiant, } from './Reward';


export interface skill {
  name: string,
  run?: any;
}

export interface Iboss {
  name: string,
  skill?: string,
  realHP?: number,
  hp: number,
  speed: number,
  strength?: number,
  critChance?: number,
  armor?: number,
  reward?: BossReward,
  imageURL?: string,
  skills?: skill[]
  rawDamage?: number
}

export interface player extends squadMember {

  member: GuildMember,
  stuns: number,
  armor: number,
  realHP: number,
  initialArmor: number,
  rawDamageTaken?: number,
  position: string,
  damageDone: number,
  pounces: number

}

export const skills = {

  ferociousBite: (boss: Iboss, fightMessage: Message, embed: MessageEmbed, alivePlayers: player[]) => {

    if (!(Math.random() <= 0.2)) return;


    const randomIndex = randomIntFromInterval(0, alivePlayers.length - 1);
    const targetPlayer = alivePlayers[randomIndex];

    targetPlayer.realHP -= boss.strength! * 2.5;

    targetPlayer.rawDamageTaken! += boss.strength! * 2.5;

    boss.realHP! += boss.strength! * 2.5;

    const biteEmbed = new MessageEmbed()
    biteEmbed.setTitle('Ferocious Bite');
    biteEmbed.setColor(GOLD);
    biteEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001420237427724318/Ferocious_bite.gif');

    //Small Rat has used ferocious bite on a random player, inflicting 2.5 times damage (12.5 dmg) on Sai Vashoon
    biteEmbed.setDescription(`${boss.name} has used ferocious bite on a random player, inflicting 2,5 times damage (\`${boss.strength! * 2.5} dmg\`) on ${targetPlayer.member.displayName}`);
    fightMessage.edit(biteEmbed);
    return sleep(6000);

  },

  featherBlade: (boss: Iboss, fightMessage: Message, embed: MessageEmbed, alivePlayers: player[]) => {

    if (!(Math.random() <= 0.15)) return;
    alivePlayers.map((player) => {

      player.realHP -= boss.strength! * 2.5
      player.rawDamageTaken! += boss.strength! * 2.5;

    });

    const featherEmbed = new MessageEmbed()
    featherEmbed.setTitle('Feather blade flurry');
    featherEmbed.setColor(GOLD)
    featherEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001421646097285180/Featherblade2.gif');
    featherEmbed.setDescription(`${boss.name} has used feather blade flurry inflicting \`${boss.strength! * 2.5} dmg\` on all players`);
    fightMessage.edit(featherEmbed);
    return sleep(6000);
  },


  pounce: (boss: Iboss, fightMessage: Message, embed: MessageEmbed, target: player, damageDone: number) => {
    // if (boss.realHP! > (boss.hp * 0.25)) return;

    if (!(Math.random() <= 0.15)) return;


    const pounceDamage = Math.round(getReducedDamage(target.armor, damageDone, target) * (2 + (0.3 * target.pounces)));


    target.realHP -= pounceDamage;
    target.rawDamageTaken! += pounceDamage;
    target.pounces += 1;

    const pounceEmbed = new MessageEmbed()
    pounceEmbed.setTitle('Pounce');
    pounceEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001427835799482428/giphy.gif');

    pounceEmbed.setDescription(`${boss.name} pounces ${target.member.displayName} for \`${Math.round((2 + (0.3 * target.pounces)) * 10) / 10}x (${pounceDamage})\`\nThe damage from pounce increases every time a player gets pounced!\n${target.member.displayName} is now \`${target.pounces}\` times pounced!`);
    fightMessage.edit(pounceEmbed);
    return sleep(6000);
  },



  clubSmash: (boss: Iboss, fightMessage: Message, embed: MessageEmbed, alivePlayers: player[]) => {



    if (Math.random() > 0.25) return;

    const randomIndex = randomIntFromInterval(0, alivePlayers.length - 1);
    if (alivePlayers[randomIndex].stuns > 0) return; //cant stun a player thats already stunned

    alivePlayers[randomIndex].stuns = 5;

    const smashEmbed = new MessageEmbed()
    smashEmbed.setTitle('Club Smash');
    smashEmbed.setColor(GOLD);
    smashEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001431365767667722/hammer.gif');
    smashEmbed.setDescription(`${boss.name} has stunned ${alivePlayers[randomIndex].member.displayName} for 5 rounds`);
    fightMessage.edit(smashEmbed);
    return sleep(6000);


  },



  noxiousBreath: (players: player[], message: Message, armorHits: number) => {


    if (!(Math.random() <= 0.05)) return;


    players.map(player => {


      player.realHP = player.realHP - 200 < 0 ? 0 : player.realHP - 200;
      player.rawDamageTaken! += 200;

      if (armorHits > 5) return;
      player.armor = player.armor - (player.initialArmor * 0.2) < 0 ? 0 : player.armor - (player.initialArmor * 0.2);


    })

    const skillEmbed = new MessageEmbed();
    skillEmbed.setColor('#DE3163')
    skillEmbed.setTitle('Cerberus has used Noxious Breath');

    skillEmbed.setDescription('Dealt \`200\` damage to all squad members, ignoring armor.\n')

    if (armorHits < 5) skillEmbed.description += `The armor of the players has been decreased by \`20%\``

    skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001433377901125702/Noxiousbreath.gif')
    message.edit(skillEmbed);


    return true;




  },

};

export const bosses: Iboss[] = [{
  name: 'Small Rat',
  hp: 2500,
  speed: 25,
  strength: 5,
  armor: 0,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001419966186258432/small-rat.jpg',
  critChance: 0.05,
  reward: new SmallRat(),
  skills: [{ name: 'Ferocious Bite', run: skills.ferociousBite }],
},
{
  name: 'Medium Rat',
  hp: 3500,
  speed: 35,
  strength: 7,
  armor: 0,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001420557079822496/Medrat.jpg',
  critChance: 0.05,
  reward: new MediumRat(),
  skills: [{ name: 'Ferocious Bite', run: skills.ferociousBite }],

}, {
  name: 'Giant Rat',
  hp: 5000,
  speed: 50,
  strength: 10,
  critChance: 0.05,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001421096924495872/Giantrat2.png',
  armor: 5,
  skills: [{ name: 'Ferocious Bite', run: skills.ferociousBite }],
  reward: new GiantRat()

}, {
  name: 'Small Harpy',
  hp: 7000,
  speed: 70,
  strength: 14,
  armor: 5,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001424188520800327/Harpy.png',
  critChance: 0.05,
  reward: new SmallHarpy(),
  skills: [{ name: 'Feather Blade Flurry', run: skills.featherBlade }],

}, {
  name: 'Medium Harpy',
  hp: 10000,
  speed: 100,
  strength: 20,
  armor: 10,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001425113079627816/Harpy-1.png',
  critChance: 0.1,
  reward: new MediumHarpy(),
  skills: [{ name: 'Feather Blade Flurry', run: skills.featherBlade }],

}, {
  name: 'Angry Harpy',
  hp: 12500,
  speed: 125,
  strength: 25,
  armor: 15,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001424827703382097/angry-harpy.png',
  critChance: 0.1,
  reward: new AngryHarpy(),
  skills: [{ name: 'Feather Blade Flurry', run: skills.featherBlade }, { name: 'Angry State' }],
}, {
  name: 'Small Werewolf',
  hp: 16000,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001426695456313364/Smallwerewolf.JPG',
  speed: 160,
  strength: 40,
  armor: 15,
  critChance: 0.1,
  reward: new SmallWerewolf(),
  skills: [{ name: 'Pounce', run: skills.pounce }],

}, {
  name: 'Mature Werewolf',
  hp: 17000,
  speed: 170,
  strength: 43,
  critChance: 0.15,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001427685895061574/Beserkerwerewolf.jpg',
  armor: 20,
  skills: [{
    name: 'Pounce',
    run: skills.pounce
  }],
  reward: new MatureWerewolf()

}, {
  name: 'Berserker Werewolf',
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001427648351842404/Beserkerwerewolf3.JPG',
  hp: 18000,
  speed: 180,
  strength: 45,
  armor: 20,
  critChance: 0.15,
  reward: new BerserkerWerewolf(),
  skills: [{ name: 'Pounce', run: skills.pounce }, { name: 'Berserker State' }]

}, {
  name: 'Young Giant',
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001429479475916862/Smallgiant-removebg-preview.png',
  hp: 20000,
  speed: 180,
  strength: 45,
  armor: 25,
  reward: new YoungGiant(),
  skills: [{ name: 'Club Smash', run: skills.clubSmash }],
  critChance: 0.15

},
{
  name: 'Medium Sized Giant',
  hp: 22500,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001429566973296650/Medgiant2.JPG',
  speed: 200,
  strength: 90,
  armor: 30,
  reward: new MediumGiant(),
  skills: [{ name: 'Club Smash', run: skills.clubSmash }],
  critChance: 0.15


},
{
  name: 'Adult Giant',
  skills: [{ name: 'Club Smash', run: skills.clubSmash }, { name: 'State of Toughness' }],
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001429646367272980/Adultgiant.jpg',
  hp: 25000,
  armor: 30,
  speed: 225,
  reward: new AdultGiant(),
  strength: 95,
  critChance: 0.15
},
{

  name: 'Small Cerberus',
  hp: 27500,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001432484896063498/Smallcerebrus2.jpg',
  speed: 250,
  strength: 100,
  armor: 30,
  reward: new SmallCerberus(),
  skills: [{ name: 'Noxious Breath', run: skills.noxiousBreath }],
  critChance: 0.15

},
{
  name: 'Medium Cerberus',
  hp: 30000,
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001433088439632023/medium.jpg',
  speed: 275,
  strength: 105,
  armor: 30,
  critChance: 0.15,
  skills: [{ name: 'Noxious Breath', run: skills.noxiousBreath }],
  reward: new MediumCerberus()

},
{
  name: 'Adult Cerberus',
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001433096152940604/adult.png',
  hp: 32500,
  speed: 300,
  strength: 110,
  armor: 30,
  critChance: 0.15,
  skills: [{ name: 'Noxious Breath', run: skills.noxiousBreath }, { name: 'Lava Spit' }],
  reward: new AdultCerberus()

},
{
  name: 'Medusa',
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001437496338546718/Medusa2.jpg',
  skills: [{ name: 'Stone Gaze' }],
  hp: 35000,
  speed: 325,
  strength: 115,
  armor: 35,
  critChance: 0.16,
  reward: new Medusa()

},
{
  name: 'Siren',
  imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001439638461882448/siren.jpg',
  skills: [{ name: 'Charm' }],
  hp: 37500,
  speed: 350,
  strength: 120,
  armor: 35,
  critChance: 0.16,
  reward: new Siren()

}];

export default async function Battle(message: Message, boss: string) {


  const squad = await dbGet<Squad>('SELECT * FROM squads WHERE owner = $userID', { $userID: message.author.id });
  const squadMembers = await dbAll<squadMember>('SELECT * from squadMembers where squadName = $name', { $name: squad.name });
  const embed = new MessageEmbed();

  embed.setTitle(squad.name);
  embed.setFooter(`Boss: ${boss}`);

  embed.description = '';

  const discordMembers = await Promise.all(squadMembers.map(async (member) => {
    const fetchedMember = await message.guild?.members.fetch(member.discordID);
    return { ...fetchedMember, position: member.position };
  }));

  discordMembers.map((member, i) => {
    embed.description += `\n${i + 1} - ${member.user?.username} | ${member.position}`;
  });

  const handler = new ButtonHandler(message, embed, message.author.id);

  handler.addButton(BLUE_BUTTON, 'confirm', async () => {


    await dbRun(`DELETE FROM squadMembers WHERE squadName=$squadName`, { $squadName: squad.name })
    await dbRun(`DELETE FROM squads WHERE name=$squadName AND owner=$userID`, { $squadName: squad.name, $userID: message.author.id })


    FightBoss(message, boss, squadMembers);

  });

  handler.addCloseButton();
  handler.run();
}

export async function chooseBoss(message: Message) {

  const [bar, amount] = progressBar.filledBar(100, 30);
  const embed = new MessageEmbed();
  embed.description = '';
  bosses.map((boss, i) => {

    embed.description += `\nLevel \`${i + 1}\` - **${boss.name}** | \`Skills\`: **${boss.skills!.map(skill => skill.name).join(' and ') || 'None'}**`;


  });

  embed.setFooter('Use $fight <level> to fight a boss')

  const handler = new ButtonHandler(message, embed);
  handler.addCloseButton();
  handler.run();



}
