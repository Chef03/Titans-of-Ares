"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const luxon_1 = require("luxon");
const promiseWrapper_1 = require("../db/promiseWrapper");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Command_1 = __importDefault(require("../internals/Command"));
const Pagination_1 = require("../internals/Pagination");
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
const TeamArena_1 = require("../internals/TeamArena");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'join';
    }
    async exec(msg, args) {
        if (msg.channel.type === 'dm')
            return;
        const player = await Player_1.Player.getPlayer(msg.member);
        const now = luxon_1.DateTime.now().plus({ days: 7 });
        const date = TeamArena_1.TeamArena.getMondayDate(now).toISO();
        const done = luxon_1.DateTime.fromISO(date);
        let nextMonday = TeamArena_1.TeamArena.getMondayDate(done).set({ hour: 7, minute: 0 });
        const timeLeft = nextMonday.diffNow(['hour', 'minute', 'second']);
        const formattedTime = timeLeft.toFormat('hh:mm:ss');
        if (player.squadBossEnergy < 1) {
            return msg.channel.send(`No squad boss energy! Squad boss energy gets replenished in: \`${formattedTime}\` (Hours:Minutes:Seconds)`);
        }
        const squadId = args[0];
        const squad = await (0, promiseWrapper_1.dbGet)('SELECT * FROM squads WHERE id = $id', { $id: squadId });
        if (!squad)
            return msg.channel.send('Squad was not found.');
        if (squad.memberCount >= 5)
            return msg.channel.send('This squad is full.');
        const squadMember = await (0, promiseWrapper_1.dbGet)('SELECT * FROM squadMembers WHERE discordID = $id', { $id: msg.author.id });
        if (squadMember)
            return msg.channel.send('You are already a part of a squad.');
        const handler = new ButtonHandler_1.ButtonHandler(msg, new discord_js_1.MessageEmbed().setTitle(`Application for \`${squad.name}\``).setDescription('Choose a position for squadboss, you can always change this later.'), msg.author.id);
        handler.addButton(utils_1.BLUE_BUTTON, 'Front Row', async () => {
            // const valid = await checkPositions(squadName, 'front')
            // if (!valid) return this.msg.channel.send(`All front slots are currently taken, consider picking back or contact the team leader`)
            await (0, promiseWrapper_1.dbRun)('INSERT INTO applications (discordID, position, squadName) VALUES ($userID, $position, $squadName)', {
                $userID: msg.author.id,
                $position: 'front',
                $squadName: squad.name,
            });
            const sql = 'UPDATE Player SET SquadBossEnergy = 0 WHERE DiscordID = $userID';
            await (0, promiseWrapper_1.dbRun)(sql, { $userID: msg.author.id });
            await (0, Pagination_1.dmOwner)({
                id: msg.author.id,
                squadName: squad.name,
            }, `\`${msg.author.username}\` has applied for your squad! Please use $squadboss in the daily-commands channel to accept or reject this applicant.`);
            main_1.client.squadBossChannel.send(`${msg.author.username} has applied to \`${squad.name}\``);
            msg.channel.send(`You have succesfully applied for \`${squad.name}\`! The squad leader will have the option to accept or reject your application.`);
            //
        });
        handler.addButton(utils_1.WHITE_BUTTON, 'Back Row', async () => {
            await (0, promiseWrapper_1.dbRun)('INSERT INTO applications (discordID, position, squadName) VALUES ($userID, $position, $squadName)', {
                $userID: msg.author.id,
                $position: 'back',
                $squadName: squad.name,
            });
            const sql = 'UPDATE Player SET SquadBossEnergy = 0 WHERE DiscordID = $userID';
            await (0, promiseWrapper_1.dbRun)(sql, { $userID: msg.author.id });
            await (0, Pagination_1.dmOwner)({
                id: msg.author.id,
                squadName: squad.name,
            }, `\`${msg.author.username}\` has applied to your squad! Please use $squadboss to accept or reject this applicant.`);
            main_1.client.squadBossChannel.send(`${msg.author.username} has applied to \`${squad.name}\``);
            msg.channel.send(`You have succesfully applied to \`${squad.name}\`! The squad leader will have the option to accept or reject your application.`);
            //
        });
        handler.addCloseButton();
        handler.run();
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSm9pbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9Kb2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBQW1EO0FBQ25ELGlDQUFpQztBQUNqQyx5REFBb0Q7QUFFcEQsOERBQTJEO0FBQzNELG1FQUEyQztBQUMzQyx3REFBa0Q7QUFDbEQsZ0RBQTZDO0FBQzdDLDhDQUErRDtBQUMvRCxrQ0FBaUM7QUFFakMsc0RBQW1EO0FBRW5ELGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0UsU0FBSSxHQUFHLE1BQU0sQ0FBQztJQTJGaEIsQ0FBQztJQXpGQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxJQUFjO1FBR3JDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSTtZQUFFLE9BQU87UUFHdEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUMsQ0FBQztRQUNuRCxNQUFNLEdBQUcsR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sSUFBSSxHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xELE1BQU0sSUFBSSxHQUFHLGdCQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBRW5DLElBQUksVUFBVSxHQUFHLHFCQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0UsTUFBTSxRQUFRLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxDQUFDLENB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