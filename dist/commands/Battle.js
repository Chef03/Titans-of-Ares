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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const luxon_1 = require("luxon");
const challenger_1 = require("../db/challenger");
const timer_1 = require("../db/timer");
const Battle_1 = require("../internals/Battle");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Challenger_1 = require("../internals/Challenger");
const Command_1 = __importDefault(require("../internals/Command"));
const energy_1 = require("../internals/energy");
const Player_1 = require("../internals/Player");
const utils = __importStar(require("../internals/utils"));
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
const emojis = [
    utils.LEFT_ARROW_BUTTON,
    utils.CURRENT_BUTTON,
    utils.RIGHT_ARROW_BUTTON,
];
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'battle';
        this.aliases = ['b', 'bat'];
        this.block = true;
    }
    async exec(msg, args) {
        let question;
        try {
            const opponentID = args[0];
            const player = await Player_1.Player.getPlayer(msg.member);
            if (opponentID) {
                const memberOpponent = await msg.guild?.members.fetch(opponentID);
                if (!memberOpponent)
                    return msg.channel.send('member not found');
                const opponent = await Player_1.Player.getPlayer(memberOpponent);
                const battle = new Battle_1.Battle(msg, player, opponent);
                await battle.run();
                return;
            }
            if (player.energy <= 0) {
                const timeText = await (0, energy_1.showTimeLeft)(timer_1.TimerType.Energy, player.id);
                return msg.channel.send(`You have 0 energy left. Please wait for ${timeText}`);
            }
            const maxLevel = player.challengerMaxLevel;
            let validEmojis = [];
            if (player.challengerMaxLevel === 0) {
                validEmojis = [emojis[2]];
            }
            else if (player.challengerMaxLevel === 1) {
                validEmojis = [emojis[1], emojis[2]];
            }
            else if (player.challengerMaxLevel === 50) {
                validEmojis = [emojis[0], emojis[1]];
            }
            else {
                validEmojis = emojis;
            }
            const levelHint = validEmojis
                .map((emoji) => (emoji === emojis[0]
                ? `${emojis[0]} ${maxLevel - 1}`
                : emoji === emojis[1]
                    ? `${emojis[1]} ${maxLevel}`
                    : `${emojis[2]} ${maxLevel + 1}`))
                .join(' ');
            question = await msg.channel.send(`Which level you want to challenge? ${levelHint}`);
            for (const validEmoji of validEmojis) {
                await question.react(validEmoji);
            }
            const filter = (reaction, user) => (validEmojis.includes(reaction.emoji.name) && user.id === msg.author.id);
            const colllected = await question.awaitReactions(filter, {
                max: 1,
                time: 30 * 1000,
                errors: ['time'],
            });
            await question.delete();
            const reacted = colllected.first();
            const index = emojis.findIndex((e) => e === reacted.emoji.name) - 1;
            const expireDate = luxon_1.DateTime.now().plus(energy_1.ENERGY_TIMEOUT).toISO();
            const prevEnergyTimer = await (0, timer_1.hasTimer)(timer_1.TimerType.Energy, player.id);
            if (!prevEnergyTimer)
                await (0, timer_1.setTimer)(timer_1.TimerType.Energy, player.id, expireDate);
            const selectedLevel = player.challengerMaxLevel + index;
            await msg.channel.send(`Starting challenge level ${selectedLevel}`);
            const challenger = await Challenger_1.Challenger.getChallenger(selectedLevel);
            const embed = new discord_js_1.MessageEmbed()
                .setTitle('Daily Challenge')
                .setDescription('Please select how many times you want to battle this level.');
            const safeFnID = `multi_battle_${player.id}`;
            const menu = new ButtonHandler_1.ButtonHandler(msg, embed, player.id);
            const battle = (count) => async () => {
                main_1.client.safeFn.add(safeFnID, () => this.battleMultiple(msg, player, challenger, count));
                try {
                    await main_1.client.safeFn.exec(safeFnID);
                }
                catch {
                    msg.channel.send('There is already another battle command running');
                }
            };
            menu.addButton(utils.BLUE_BUTTON, 'battle 1 time', battle(1));
            menu.addButton(utils.RED_BUTTON, 'battle 5 times', battle(5));
            menu.addButton(utils.ATTOM_BUTTON, 'use all energy', battle(player.energy));
            menu.addCloseButton();
            await menu.run();
        }
        catch (e) {
            if (e instanceof discord_js_1.Collection) {
                await question?.reactions.removeAll();
                await msg.channel.send('No level was chosen');
            }
            else {
                console.log(e);
            }
        }
    }
    async battleMultiple(msg, player, challenger, count) {
        let { energy } = player;
        if (energy < count) {
            msg.channel.send('Insufficient energy');
            return;
        }
        while (energy > 0 && count > 0) {
            const battle = new Battle_1.Battle(msg, player, challenger);
            const isWon = await battle.run();
            const battleResult = isWon ? 'won over' : 'lost to';
            await msg.channel.send(`${player.name} has ${battleResult} ${challenger.name}!`);
            if (isWon) {
                const { loot } = challenger;
                await player.addCoin(loot);
                await (0, challenger_1.setMaxChallenger)(player.id, challenger.level);
                player.challengerMaxLevel = challenger.level;
                await msg.channel.send(`${player.name} has earned **${loot}** coins!`);
            }
            player = await Player_1.Player.getPlayer(player.member);
            challenger = await Challenger_1.Challenger.getChallenger(challenger.level);
            await (0, timer_1.setEnergy)(player.id, -1);
            energy--;
            count--;
            await (0, utils_1.sleep)(1000);
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmF0dGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL0JhdHRsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkNBRW9CO0FBQ3BCLGlDQUFpQztBQUNqQyxpREFBb0Q7QUFDcEQsdUNBRXFCO0FBQ3JCLGdEQUE2QztBQUM3Qyw4REFBMkQ7QUFDM0Qsd0RBQXFEO0FBQ3JELG1FQUEyQztBQUMzQyxnREFBbUU7QUFDbkUsZ0RBQTZDO0FBQzdDLDBEQUE0QztBQUM1Qyw4Q0FBMkM7QUFDM0Msa0NBQWlDO0FBRWpDLE1BQU0sTUFBTSxHQUFHO0lBQ2IsS0FBSyxDQUFDLGlCQUFpQjtJQUN2QixLQUFLLENBQUMsY0FBYztJQUNwQixLQUFLLENBQUMsa0JBQWtCO0NBQ3pCLENBQUM7QUFFRixlQUFxQixTQUFRLGlCQUFPO0lBQXBDOztRQUNFLFNBQUksR0FBRyxRQUFRLENBQUM7UUFFaEIsWUFBTyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZCLFVBQUssR0FBRyxJQUFJLENBQUM7SUErSmYsQ0FBQztJQTdKQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxJQUFjO1FBQ3JDLElBQUksUUFBUSxDQUFDO1FBRWIsSUFBSTtZQUNGLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQixNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU8sQ0FBQyxDQUFDO1lBRW5ELElBQUksVUFBVSxFQUFFO2dCQUNkLE1BQU0sY0FBYyxHQUFHLE1BQU0sR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUVsRSxJQUFJLENBQUMsY0FBYztvQkFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtC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