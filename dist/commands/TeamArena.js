"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const teamArena_1 = require("../db/teamArena");
const Battle_1 = require("../internals/Battle");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Command_1 = __importDefault(require("../internals/Command"));
const Player_1 = require("../internals/Player");
const TeamArena_1 = require("../internals/TeamArena");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'teamarena';
        this.aliases = ['ta'];
        this.block = true;
    }
    async signUp(msg, player, arena) {
        const candidates = await (0, teamArena_1.getCandidates)(arena.id);
        const candidate = candidates.find((x) => x.DiscordID === player.id);
        if (!candidate) {
            const embed = new discord_js_1.MessageEmbed().setTitle('Team Arena').setDescription((0, common_tags_1.oneLine) `You can currently sign up for the weekly Team Arena! Do you
            want to sign up now? `);
            const menu = new ButtonHandler_1.ButtonHandler(msg, embed, player.id);
            menu.addButton(utils_1.BLUE_BUTTON, 'yes', () => {
                (0, teamArena_1.joinArena)(arena.id, player.id);
                msg.channel.send((0, common_tags_1.oneLine) `You have signed up for this weeks Team Arena and will be
          assigned to either Team ${utils_1.RED_BUTTON} or Team ${utils_1.BLUE_BUTTON} when the
          sign up closes!`);
            });
            menu.addButton(utils_1.RED_BUTTON, 'no', () => {
                msg.channel.send('You did not sign up for the Team Arena this week!');
            });
            menu.addCloseButton();
            menu.run();
        }
        else {
            const embed = new discord_js_1.MessageEmbed().setTitle('Team Arena').setDescription((0, common_tags_1.oneLine) `You already signed in for the Team Arena, it will start in
          \`(${arena.timerUntilBattle})\`. Do you want to keep being signed in?`);
            const menu = new ButtonHandler_1.ButtonHandler(msg, embed, player.id);
            menu.addButton(utils_1.BLUE_BUTTON, 'yes', () => {
                msg.channel.send((0, common_tags_1.oneLine) `You are still signed in for this weeks Team Arena!`);
            });
            menu.addButton(utils_1.RED_BUTTON, 'no', () => {
                (0, teamArena_1.leaveArena)(arena.id, player.id);
                msg.channel.send('You did not sign up for the Team Arena this week!');
            });
            menu.addCloseButton();
            menu.run();
        }
    }
    async battleMultiple(msg, candidate, arena, count) {
        let { player } = candidate;
        let energy = candidate.charge;
        if (energy < count) {
            msg.channel.send('Insufficient energy');
            return;
        }
        while (energy > 0 && count > 0) {
            const opponents = arena.candidates.filter((x) => x.team !== candidate.team);
            const opponent = main_1.client.random.pick(opponents);
            await msg.channel.send(`You are battling ${opponent.player.name} of the opponents team!`);
            const profileImage = await opponent.player.getProfile();
            const opponentBanner = await msg.channel.send(profileImage);
            await (0, utils_1.sleep)(6000);
            await opponentBanner.delete();
            await (0, teamArena_1.deduceCharge)(arena.id, player.id);
            const battle = new Battle_1.Battle(msg, player, opponent.player);
            const isWon = await battle.run();
            const mentionPlayer = main_1.client.isDev ? player.name : player.member;
            const mentionOpponent = main_1.client.isDev
                ? opponent.player.name
                : opponent.player.member;
            if (isWon) {
                candidate.score++;
                await (0, teamArena_1.updatePoint)(arena.id, player.id, 1);
                const team = candidate.team === 'RED' ? utils_1.RED_BUTTON : utils_1.BLUE_BUTTON;
                await msg.channel.send(`${player.name} has earned 1 point for Team ${team}!`);
                await main_1.client.logChannel.send((0, common_tags_1.oneLine) `${mentionPlayer} has scored 1 point for Team ${team} by
            defeating ${mentionOpponent}`);
            }
            else {
                await msg.channel.send(`You have lost the battle against ${opponent.player.name}!`);
                await main_1.client.logChannel.send((0, common_tags_1.oneLine) `${mentionOpponent} has succesfully defended against
            ${mentionPlayer} in the Team Arena!`);
            }
            arena = await TeamArena_1.TeamArena.getCurrentArena();
            player = arena.candidates.find((x) => x.id === candidate.player.id).player;
            count--;
            energy--;
            await (0, utils_1.sleep)(1000);
        }
        // update score board
        await arena.updateScoreboard();
    }
    async battle(msg, player, arena) {
        const { candidates } = arena;
        const candidate = candidates.find((x) => x.player.id === player.id);
        if (!candidate) {
            return msg.channel.send('You are not registered for this week Team Arena');
        }
        if (candidate.charge <= 0) {
            return msg.channel.send((0, common_tags_1.oneLine) `You are out of arena tries, thanks for participating! The
        winning team will be announced in \`(${arena.timerUntilReward})\``);
        }
        const embed = new discord_js_1.MessageEmbed()
            .setTitle('Team Arena')
            .setColor(utils_1.BROWN)
            .setDescription((0, common_tags_1.oneLine) `Welcome to the Team Arena! You have
        \`${candidate.charge}/10\`. Do you want to battle now?`);
        const menu = new ButtonHandler_1.ButtonHandler(msg, embed, player.id);
        const battle = (count) => () => this.battleMultiple(msg, candidate, arena, count);
        menu.addButton(utils_1.BLUE_BUTTON, 'battle 1 time', battle(1));
        menu.addButton(utils_1.RED_BUTTON, 'battle 5 times', battle(5));
        menu.addButton(utils_1.WHITE_BUTTON, 'battle 10 times', battle(10));
        menu.addButton(utils_1.ATTOM_BUTTON, 'use all Team Arena energy', battle(candidate.charge));
        menu.addCloseButton();
        await menu.run();
    }
    async exec(msg, args) {
        const player = await Player_1.Player.getPlayer(msg.member);
        const arena = await TeamArena_1.TeamArena.getCurrentArena();
        const { phase } = arena;
        if (main_1.client.isDev && args.length > 0) {
            const [phase] = args;
            if (Object.values(TeamArena_1.Phase).some((x) => x === phase)) {
                main_1.client.arenaPhase = phase;
                msg.channel.send(`Successfully updated Team Arena Phase to \`${phase}\``);
            }
            else {
                msg.channel.send('invalid phase');
            }
            return;
        }
        switch (phase) {
            case TeamArena_1.Phase.SIGNUP_1:
            case TeamArena_1.Phase.SIGNUP_2:
            case TeamArena_1.Phase.SIGNUP_3:
                return this.signUp(msg, player, arena);
            case TeamArena_1.Phase.PREPARING:
                return msg.channel.send((0, common_tags_1.oneLine) `Registration for this week Team Arena has been closed and
          teams have been formed. The battles will start in
          \`${arena.timerUntilBattle}\``);
            case TeamArena_1.Phase.BATTLE_1:
            case TeamArena_1.Phase.BATTLE_2:
            case TeamArena_1.Phase.BATTLE_3:
                return await this.battle(msg, player, arena);
            case TeamArena_1.Phase.REWARD:
                return msg.channel.send('This week Team Arena has ended');
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVhbUFyZW5hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL1RlYW1BcmVuYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFzQztBQUN0QywyQ0FBbUQ7QUFDbkQsK0NBTXlCO0FBQ3pCLGdEQUE2QztBQUM3Qyw4REFBMkQ7QUFDM0QsbUVBQTJDO0FBQzNDLGdEQUE2QztBQUM3QyxzREFBMkU7QUFDM0UsOENBTzRCO0FBQzVCLGtDQUFpQztBQUVqQyxlQUFxQixTQUFRLGlCQUFPO0lBQXBDOztRQUNFLFNBQUksR0FBRyxXQUFXLENBQUM7UUFFbkIsWUFBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFakIsVUFBSyxHQUFHLElBQUksQ0FBQztJQTBNZixDQUFDO0lBeE1TLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBWSxFQUFFLE1BQWMsRUFBRSxLQUFnQjtRQUNqRSxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEseUJBQWEsRUFBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakQsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFcEUsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUVkLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxjQUFjLENBQ3BFLElBQUEscUJBQU8sRUFBQTtrQ0FDbUIsQ0FDM0IsQ0FBQztZQUVGLE1BQU0sSUFBSSxHQUFHLElBQUksNkJBQWEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUV0RCxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFXLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRTtnQkFDdEMsSUFBQSxx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