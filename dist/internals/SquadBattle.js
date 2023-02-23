"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseBoss = exports.bosses = exports.skills = void 0;
const discord_js_1 = require("discord.js");
const progressBar = __importStar(require("string-progressbar"));
const promiseWrapper_1 = require("../db/promiseWrapper");
const ButtonHandler_1 = require("./ButtonHandler");
const utils_1 = require("./utils");
const FightBoss_1 = require("./FightBoss");
const Reward_1 = require("./Reward");
exports.skills = {
    ferociousBite: (boss, fightMessage, embed, alivePlayers) => {
        if (!(Math.random() <= 0.2))
            return;
        const randomIndex = (0, FightBoss_1.randomIntFromInterval)(0, alivePlayers.length - 1);
        const targetPlayer = alivePlayers[randomIndex];
        targetPlayer.realHP -= boss.strength * 2.5;
        targetPlayer.rawDamageTaken += boss.strength * 2.5;
        boss.realHP += boss.strength * 2.5;
        const biteEmbed = new discord_js_1.MessageEmbed();
        biteEmbed.setTitle('Ferocious Bite');
        biteEmbed.setColor(utils_1.GOLD);
        biteEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001420237427724318/Ferocious_bite.gif');
        //Small Rat has used ferocious bite on a random player, inflicting 2.5 times damage (12.5 dmg) on Sai Vashoon
        biteEmbed.setDescription(`${boss.name} has used ferocious bite on a random player, inflicting 2,5 times damage (\`${boss.strength * 2.5} dmg\`) on ${targetPlayer.member.displayName}`);
        fightMessage.edit(biteEmbed);
        return (0, utils_1.sleep)(6000);
    },
    featherBlade: (boss, fightMessage, embed, alivePlayers) => {
        if (!(Math.random() <= 0.15))
            return;
        alivePlayers.map((player) => {
            player.realHP -= boss.strength * 2.5;
            player.rawDamageTaken += boss.strength * 2.5;
        });
        const featherEmbed = new discord_js_1.MessageEmbed();
        featherEmbed.setTitle('Feather blade flurry');
        featherEmbed.setColor(utils_1.GOLD);
        featherEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001421646097285180/Featherblade2.gif');
        featherEmbed.setDescription(`${boss.name} has used feather blade flurry inflicting \`${boss.strength * 2.5} dmg\` on all players`);
        fightMessage.edit(featherEmbed);
        return (0, utils_1.sleep)(6000);
    },
    pounce: (boss, fightMessage, embed, target, damageDone) => {
        // if (boss.realHP! > (boss.hp * 0.25)) return;
        if (!(Math.random() <= 0.15))
            return;
        const pounceDamage = Math.round((0, FightBoss_1.getReducedDamage)(target.armor, damageDone, target) * (2 + (0.3 * target.pounces)));
        target.realHP -= pounceDamage;
        target.rawDamageTaken += pounceDamage;
        target.pounces += 1;
        const pounceEmbed = new discord_js_1.MessageEmbed();
        pounceEmbed.setTitle('Pounce');
        pounceEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001427835799482428/giphy.gif');
        pounceEmbed.setDescription(`${boss.name} pounces ${target.member.displayName} for \`${Math.round((2 + (0.3 * target.pounces)) * 10) / 10}x (${pounceDamage})\`\nThe damage from pounce increases every time a player gets pounced!\n${target.member.displayName} is now \`${target.pounces}\` times pounced!`);
        fightMessage.edit(pounceEmbed);
        return (0, utils_1.sleep)(6000);
    },
    clubSmash: (boss, fightMessage, embed, alivePlayers) => {
        if (Math.random() > 0.25)
            return;
        const randomIndex = (0, FightBoss_1.randomIntFromInterval)(0, alivePlayers.length - 1);
        if (alivePlayers[randomIndex].stuns > 0)
            return; //cant stun a player thats already stunned
        alivePlayers[randomIndex].stuns = 5;
        const smashEmbed = new discord_js_1.MessageEmbed();
        smashEmbed.setTitle('Club Smash');
        smashEmbed.setColor(utils_1.GOLD);
        smashEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001431365767667722/hammer.gif');
        smashEmbed.setDescription(`${boss.name} has stunned ${alivePlayers[randomIndex].member.displayName} for 5 rounds`);
        fightMessage.edit(smashEmbed);
        return (0, utils_1.sleep)(6000);
    },
    noxiousBreath: (players, message, armorHits) => {
        if (!(Math.random() <= 0.05))
            return;
        players.map(player => {
            player.realHP = player.realHP - 200 < 0 ? 0 : player.realHP - 200;
            player.rawDamageTaken += 200;
            if (armorHits > 5)
                return;
            player.armor = player.armor - (player.initialArmor * 0.2) < 0 ? 0 : player.armor - (player.initialArmor * 0.2);
        });
        const skillEmbed = new discord_js_1.MessageEmbed();
        skillEmbed.setColor('#DE3163');
        skillEmbed.setTitle('Cerberus has used Noxious Breath');
        skillEmbed.setDescription('Dealt \`200\` damage to all squad members, ignoring armor.\n');
        if (armorHits < 5)
            skillEmbed.description += `The armor of the players has been decreased by \`20%\``;
        skillEmbed.setImage('https://cdn.discordapp.com/attachments/1001419762405998692/1001433377901125702/Noxiousbreath.gif');
        message.edit(skillEmbed);
        return true;
    },
};
exports.bosses = [{
        name: 'Small Rat',
        hp: 2500,
        speed: 25,
        strength: 5,
        armor: 0,
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001419966186258432/small-rat.jpg',
        critChance: 0.05,
        reward: new Reward_1.SmallRat(),
        skills: [{ name: 'Ferocious Bite', run: exports.skills.ferociousBite }],
    },
    {
        name: 'Medium Rat',
        hp: 3500,
        speed: 35,
        strength: 7,
        armor: 0,
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001420557079822496/Medrat.jpg',
        critChance: 0.05,
        reward: new Reward_1.MediumRat(),
        skills: [{ name: 'Ferocious Bite', run: exports.skills.ferociousBite }],
    }, {
        name: 'Giant Rat',
        hp: 5000,
        speed: 50,
        strength: 10,
        critChance: 0.05,
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001421096924495872/Giantrat2.png',
        armor: 5,
        skills: [{ name: 'Ferocious Bite', run: exports.skills.ferociousBite }],
        reward: new Reward_1.GiantRat()
    }, {
        name: 'Small Harpy',
        hp: 7000,
        speed: 70,
        strength: 14,
        armor: 5,
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001424188520800327/Harpy.png',
        critChance: 0.05,
        reward: new Reward_1.SmallHarpy(),
        skills: [{ name: 'Feather Blade Flurry', run: exports.skills.featherBlade }],
    }, {
        name: 'Medium Harpy',
        hp: 10000,
        speed: 100,
        strength: 20,
        armor: 10,
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001425113079627816/Harpy-1.png',
        critChance: 0.1,
        reward: new Reward_1.MediumHarpy(),
        skills: [{ name: 'Feather Blade Flurry', run: exports.skills.featherBlade }],
    }, {
        name: 'Angry Harpy',
        hp: 12500,
        speed: 125,
        strength: 25,
        armor: 15,
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001424827703382097/angry-harpy.png',
        critChance: 0.1,
        reward: new Reward_1.AngryHarpy(),
        skills: [{ name: 'Feather Blade Flurry', run: exports.skills.featherBlade }, { name: 'Angry State' }],
    }, {
        name: 'Small Werewolf',
        hp: 16000,
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001426695456313364/Smallwerewolf.JPG',
        speed: 160,
        strength: 40,
        armor: 15,
        critChance: 0.1,
        reward: new Reward_1.SmallWerewolf(),
        skills: [{ name: 'Pounce', run: exports.skills.pounce }],
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
                run: exports.skills.pounce
            }],
        reward: new Reward_1.MatureWerewolf()
    }, {
        name: 'Berserker Werewolf',
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001427648351842404/Beserkerwerewolf3.JPG',
        hp: 18000,
        speed: 180,
        strength: 45,
        armor: 20,
        critChance: 0.15,
        reward: new Reward_1.BerserkerWerewolf(),
        skills: [{ name: 'Pounce', run: exports.skills.pounce }, { name: 'Berserker State' }]
    }, {
        name: 'Young Giant',
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001429479475916862/Smallgiant-removebg-preview.png',
        hp: 20000,
        speed: 180,
        strength: 45,
        armor: 25,
        reward: new Reward_1.YoungGiant(),
        skills: [{ name: 'Club Smash', run: exports.skills.clubSmash }],
        critChance: 0.15
    },
    {
        name: 'Medium Sized Giant',
        hp: 22500,
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001429566973296650/Medgiant2.JPG',
        speed: 200,
        strength: 90,
        armor: 30,
        reward: new Reward_1.MediumGiant(),
        skills: [{ name: 'Club Smash', run: exports.skills.clubSmash }],
        critChance: 0.15
    },
    {
        name: 'Adult Giant',
        skills: [{ name: 'Club Smash', run: exports.skills.clubSmash }, { name: 'State of Toughness' }],
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001429646367272980/Adultgiant.jpg',
        hp: 25000,
        armor: 30,
        speed: 225,
        reward: new Reward_1.AdultGiant(),
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
        reward: new Reward_1.SmallCerberus(),
        skills: [{ name: 'Noxious Breath', run: exports.skills.noxiousBreath }],
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
        skills: [{ name: 'Noxious Breath', run: exports.skills.noxiousBreath }],
        reward: new Reward_1.MediumCerberus()
    },
    {
        name: 'Adult Cerberus',
        imageURL: 'https://cdn.discordapp.com/attachments/1001419762405998692/1001433096152940604/adult.png',
        hp: 32500,
        speed: 300,
        strength: 110,
        armor: 30,
        critChance: 0.15,
        skills: [{ name: 'Noxious Breath', run: exports.skills.noxiousBreath }, { name: 'Lava Spit' }],
        reward: new Reward_1.AdultCerberus()
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
        reward: new Reward_1.Medusa()
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
        reward: new Reward_1.Siren()
    }];
async function Battle(message, boss) {
    const squad = await (0, promiseWrapper_1.dbGet)('SELECT * FROM squads WHERE owner = $userID', { $userID: message.author.id });
    const squadMembers = await (0, promiseWrapper_1.dbAll)('SELECT * from squadMembers where squadName = $name', { $name: squad.name });
    const embed = new discord_js_1.MessageEmbed();
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
    const handler = new ButtonHandler_1.ButtonHandler(message, embed, message.author.id);
    handler.addButton(utils_1.BLUE_BUTTON, 'confirm', async () => {
        await (0, promiseWrapper_1.dbRun)(`DELETE FROM squadMembers WHERE squadName=$squadName`, { $squadName: squad.name });
        await (0, promiseWrapper_1.dbRun)(`DELETE FROM squads WHERE name=$squadName AND owner=$userID`, { $squadName: squad.name, $userID: message.author.id });
        (0, FightBoss_1.FightBoss)(message, boss, squadMembers);
    });
    handler.addCloseButton();
    handler.run();
}
exports.default = Battle;
async function chooseBoss(message) {
    const [bar, amount] = progressBar.filledBar(100, 30);
    const embed = new discord_js_1.MessageEmbed();
    embed.description = '';
    exports.bosses.map((boss, i) => {
        embed.description += `\nLevel \`${i + 1}\` - **${boss.name}** | \`Skills\`: **${boss.skills.map(skill => skill.name).join(' and ') || 'None'}**`;
    });
    embed.setFooter('Use $fight <level> to fight a boss');
    const handler = new ButtonHandler_1.ButtonHandler(message, embed);
    handler.addCloseButton();
    handler.run();
}
exports.chooseBoss = chooseBoss;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3F1YWRCYXR0bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL1NxdWFkQmF0dGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBQWdFO0FBQ2hFLGdFQUFrRDtBQUVsRCx5REFBMkQ7QUFFM0QsbURBQWdEO0FBQ2hELG1DQUFtRDtBQUNuRCwyQ0FBaUY7QUFDakYscUNBQStQO0FBcUNsUCxRQUFBLE1BQU0sR0FBRztJQUVwQixhQUFhLEVBQUUsQ0FBQyxJQUFXLEVBQUUsWUFBcUIsRUFBRSxLQUFtQixFQUFFLFlBQXNCLEVBQUUsRUFBRTtRQUVqRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksR0FBRyxDQUFDO1lBQUUsT0FBTztRQUdwQyxNQUFNLFdBQVcsR0FBRyxJQUFBLGlDQUFxQixFQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUvQyxZQUFZLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFTLEdBQUcsR0FBRyxDQUFDO1FBRTVDLFlBQVksQ0FBQyxjQUFlLElBQUksSUFBSSxDQUFDLFFBQVMsR0FBRyxHQUFHLENBQUM7UUFFckQsSUFBSSxDQUFDLE1BQU8sSUFBSSxJQUFJLENBQUMsUUFBUyxHQUFHLEdBQUcsQ0FBQztRQUVyQyxNQUFNLFNBQVMsR0FBRyxJQUFJLHlCQUFZLEVBQUUsQ0FBQTtRQUNwQyxTQUFTLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDckMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxZQUFJLENBQUMsQ0FBQztRQUN6QixTQUFTLENBQUMsUUFBUSxDQUFDLG1HQUFtRyxDQUFDLENBQUM7UUFFeEgsNkdBQTZHO1FBQzdHLFNBQVMsQ0FBQyxjQUFjLENB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