"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const luxon_1 = require("luxon");
const promiseWrapper_1 = require("../db/promiseWrapper");
const squad_1 = require("../db/squad");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Command_1 = __importDefault(require("../internals/Command"));
const Pagination_1 = require("../internals/Pagination");
const Player_1 = require("../internals/Player");
const SquadBattle_1 = require("../internals/SquadBattle");
const TeamArena_1 = require("../internals/TeamArena");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
const CreateSquad_1 = __importDefault(require("./CreateSquad"));
class Squad extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'squadboss';
        this.aliases = ['sq', 'squad'];
    }
    async exec(message, _args) {
        if (message.channel.type === 'dm')
            return;
        const player = await Player_1.Player.getPlayer(message.member);
        const isMember = await (0, promiseWrapper_1.dbGet)('SELECT * FROM squadMembers WHERE discordID = $userID', {
            $userID: message.author.id,
        });
        const existingApplication = await (0, promiseWrapper_1.dbGet)('SELECT * FROM applications WHERE discordID = $userID', { $userID: message.author.id });
        const now = luxon_1.DateTime.now().plus({ days: 7 });
        const date = TeamArena_1.TeamArena.getMondayDate(now).toISO();
        const done = luxon_1.DateTime.fromISO(date);
        let nextMonday = TeamArena_1.TeamArena.getMondayDate(done).set({ hour: 7, minute: 0 });
        const timeLeft = nextMonday.diffNow(['hour', 'minute', 'second']);
        const formattedTime = timeLeft.toFormat('hh:mm:ss');
        if (player.squadBossEnergy < 1 && !isMember && !existingApplication) {
            return message.channel.send(`No squad boss energy! Squad boss energy gets replenished in: \`${formattedTime}\` (Hours:Minutes:Seconds)`);
        }
        const ownerSql = 'SELECT * FROM squads WHERE owner = $owner';
        const existingSquad = await (0, promiseWrapper_1.dbGet)(ownerSql, { $owner: message.author.id });
        if (existingSquad) {
            const grabSql = 'SELECT * FROM squadMembers WHERE squadName = $squadName';
            const members = await (0, promiseWrapper_1.dbAll)(grabSql, { $squadName: existingSquad.name });
            const embed = new discord_js_1.MessageEmbed()
                .setTitle(existingSquad.name);
            embed.description = '';
            let discordMembers = await Promise.all(members.map(async (member) => {
                try {
                    const fetchedMember = await message.guild?.members.fetch(member.discordID);
                    return { ...fetchedMember, position: member.position };
                }
                catch {
                }
            }));
            discordMembers = discordMembers.filter(member => member);
            discordMembers.map((member, i) => {
                embed.description += `\n${i + 1} - ${member.user?.username} | ${member.position}`;
            });
            if (!discordMembers.length) {
                embed.description = 'Squad is empty';
            }
            embed.setFooter(`Time to for next squad boss reset: ${formattedTime} (Hours:Minutes:Seconds)`);
            const menu = new ButtonHandler_1.ButtonHandler(message, embed, message.author.id);
            menu.addButton(utils_1.BLUE_BUTTON, 'applications', async () => {
                const applications = await (0, promiseWrapper_1.dbAll)('SELECT * FROM applications WHERE squadName = $squadName', {
                    $squadName: existingSquad.name,
                });
                if (!applications.length)
                    return message.channel.send('Your squad has no applications.');
                const embeds = await Promise.all(applications.map(async (application) => {
                    const user = await main_1.client.bot.users.fetch(application.discordID);
                    const embed = new discord_js_1.MessageEmbed();
                    embed.addField('User', `<@${user.id}>`);
                    embed.addField('Position', application.position);
                    return embed;
                }));
                const pagination = new Pagination_1.Pagination(message, embeds, message.author.id, 0, false, true);
                pagination.run();
                // const createSquad = new CreateSquad()
                // await createSquad.exec(message)
            });
            menu.addButton(utils_1.BLACK_BUTTON, 're-arrange', async () => {
                const arrangeEmbed = embed.setTitle('Re-Arrange');
                const handler = new ButtonHandler_1.ButtonHandler(message, arrangeEmbed, message.author.id);
                const buttons = [utils_1.WHITE_BUTTON, utils_1.BLACK_BUTTON, utils_1.RED_BUTTON, utils_1.BLUE_BUTTON, '🟢'];
                const discordMembers = await Promise.all(members.map(async (member) => {
                    const fetchedMember = await message.guild?.members.fetch(member.discordID);
                    return { ...fetchedMember, position: member.position };
                }));
                discordMembers.map((member, i) => {
                    handler.addButton(buttons[i], member.user.username, () => {
                        const handler = new ButtonHandler_1.ButtonHandler(message, embed, message.author.id);
                        handler.addButton(utils_1.BLUE_BUTTON, 'front', async () => {
                            const fronts = await (0, promiseWrapper_1.dbAll)('SELECT * FROM squadMembers WHERE squadName = $squadName AND position = $position', { $squadName: existingSquad.name, $position: 'front' });
                            if (fronts.length >= 4)
                                return message.channel.send('You have maxed out your front row, please free up a slot.');
                            await (0, promiseWrapper_1.dbRun)('UPDATE squadMembers SET position = \'front\' WHERE discordID = $userID', {
                                $userID: member.user.id,
                            });
                            message.channel.send(`${member.user?.username} was set to \`front\``);
                        });
                        handler.addButton(utils_1.RED_BUTTON, 'back', async () => {
                            const back = await (0, promiseWrapper_1.dbAll)('SELECT * FROM squadMembers WHERE squadName = $squadName AND position = $position', { $squadName: existingSquad.name, $position: 'back' });
                            if (back.length >= 4)
                                return message.channel.send('You have maxed out your back row, please free up a slot.');
                            await (0, promiseWrapper_1.dbRun)('UPDATE squadMembers SET position = \'back\' WHERE discordID = $userID', {
                                $userID: member.user.id,
                            });
                            message.channel.send(`${member.user?.username} was set to \`back\``);
                        });
                        handler.addCloseButton();
                        handler.run();
                    });
                });
                handler.addCloseButton();
                handler.run();
            });
            menu.addButton(utils_1.RED_BUTTON, 'remove squad', async () => {
                await (0, promiseWrapper_1.dbRun)('DELETE FROM squads WHERE name = $name AND owner = $owner', {
                    $name: existingSquad.name,
                    $owner: existingSquad.owner,
                });
                await (0, promiseWrapper_1.dbRun)('DELETE FROM squadMembers WHERE squadName = $name', {
                    $name: existingSquad.name,
                });
                const applications = await (0, promiseWrapper_1.dbAll)('SELECT * FROM applications WHERE squadName = $squadName', {
                    $squadName: existingSquad.name,
                });
                await Promise.all(applications.map(application => {
                    return (0, promiseWrapper_1.dbRun)(`UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID`, { $userID: application.discordID });
                }));
                await (0, promiseWrapper_1.dbRun)(`DELETE FROM applications WHERE squadName=$squadName`, { $squadName: existingSquad.name });
                await Promise.all(discordMembers.map(member => {
                    return (0, promiseWrapper_1.dbRun)(`UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID=$userID`, { $userID: member?.user?.id });
                }));
                discordMembers.map((member) => {
                    member.user.send(`\`${message.author.username}\` has removed squad: \`${existingSquad.name}\` from squadboss`);
                });
                message.channel.send(`Removed squad \`${existingSquad.name}\` from squadboss.`);
                // const createSquad = new CreateSquad()
                // await createSquad.exec(message)
            });
            menu.addButton(utils_1.WHITE_BUTTON, 'remove squad member', async () => {
                const arrangeEmbed = embed.setTitle('Squad Members');
                const handler = new ButtonHandler_1.ButtonHandler(message, arrangeEmbed, message.author.id);
                const buttons = [utils_1.WHITE_BUTTON, utils_1.BLACK_BUTTON, utils_1.RED_BUTTON, utils_1.BLUE_BUTTON, '🟢'];
                const discordMembers = await Promise.all(members.map(async (member) => {
                    const fetchedMember = await message.guild?.members.fetch(member.discordID);
                    return { ...fetchedMember, position: member.position };
                }));
                discordMembers.map((member, i) => {
                    if (member.user?.id === message.author.id)
                        return;
                    handler.addButton(buttons[i], member.user.username, async () => {
                        await (0, promiseWrapper_1.dbRun)('DELETE FROM squadMembers WHERE discordID = $userID AND squadName=$squadName', {
                            $userID: member.user.id,
                            $squadName: existingSquad.name
                        });
                        await (0, promiseWrapper_1.dbRun)(`UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID`, { $userID: member.user?.id });
                        message.channel.send(`${member.user?.username} has been removed from \`${existingSquad.name}\``);
                        main_1.client.squadBossChannel.send(`${member.user?.username} has been removed from \`${existingSquad.name}\``);
                        member.user?.send(`You have been removed from \`${existingSquad.name}\``);
                    });
                });
                handler.addCloseButton();
                handler.run();
            });
            menu.addButton('⚔️', 'Battle', () => {
                const front = members.filter((member) => member.position === 'front');
                const back = members.filter((member) => member.position === 'back');
                if (!front.length || !back.length) {
                    return message.channel.send('Your squad needs to at-least have 1 front and 1 back players.');
                }
                (0, SquadBattle_1.chooseBoss)(message);
            });
            menu.addCloseButton();
            return menu.run();
        }
        if (isMember) {
            const grabSql = 'SELECT * FROM squadMembers WHERE squadName = $squadName';
            const members = await (0, promiseWrapper_1.dbAll)(grabSql, { $squadName: isMember.squadName });
            const embed = new discord_js_1.MessageEmbed();
            embed.description = 'You can switch your squadboss position using the buttons below.\n';
            const discordMembers = await Promise.all(members.map(async (member) => {
                embed.setTitle(member.squadName);
                const fetchedMember = await message.guild?.members.fetch(member.discordID);
                return { ...fetchedMember, position: member.position };
            }));
            discordMembers.map((member, i) => {
                embed.description += `\n${i + 1} - ${member.user?.username} | ${member.position}`;
            });
            const handler = new ButtonHandler_1.ButtonHandler(message, embed, message.author.id);
            handler.addButton(utils_1.RED_BUTTON, 'leave squad', async () => {
                await (0, promiseWrapper_1.dbRun)(`DELETE FROM squadMembers WHERE squadName = $squadName AND discordID = $discordID`, {
                    $squadName: isMember.squadName,
                    $discordID: isMember.discordID
                });
                await (0, promiseWrapper_1.dbRun)('UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID', { $userID: message.author.id });
                message.channel.send(`left squad \`${isMember.squadName}\``);
                const squad = await (0, promiseWrapper_1.dbGet)(`SELECT * FROM squads WHERE name=$squadName`, { $squadName: isMember.squadName });
                const owner = await main_1.client.bot.users.fetch(squad.owner);
                owner.send(`${message.author.username} has decided to leave your squad \`${isMember.squadName}\``);
                main_1.client.squadBossChannel.send(`${message.author.username} has left \`${isMember.squadName}\``);
            });
            handler.addButton(utils_1.BLACK_BUTTON, 'switch position', () => {
                const handler = new ButtonHandler_1.ButtonHandler(message, embed, message.author.id);
                handler.addButton(utils_1.BLUE_BUTTON, 'front', async () => {
                    const fronts = await (0, promiseWrapper_1.dbAll)('SELECT * FROM squadMembers WHERE squadName = $squadName AND position = $position', { $squadName: isMember.squadName, $position: 'front' });
                    if (fronts.length >= 4)
                        return message.channel.send('You have maxed out your front row, please free up a slot.');
                    await (0, promiseWrapper_1.dbRun)('UPDATE squadMembers SET position = \'front\' WHERE discordID = $userID', {
                        $userID: message.author.id,
                    });
                    message.channel.send(`${message.author.username} was set to \`front\``);
                });
                handler.addButton(utils_1.RED_BUTTON, 'back', async () => {
                    const back = await (0, promiseWrapper_1.dbAll)('SELECT * FROM squadMembers WHERE squadName = $squadName AND position = $position', { $squadName: isMember.squadName, $position: 'back' });
                    if (back.length >= 4)
                        return message.channel.send('You have maxed out your back row, please free up a slot.');
                    await (0, promiseWrapper_1.dbRun)('UPDATE squadMembers SET position = \'back\' WHERE discordID = $userID', {
                        $userID: message.author.id,
                    });
                    message.channel.send(`${message.author.username} was set to \`back\``);
                });
                handler.addCloseButton();
                handler.run();
            });
            handler.addCloseButton();
            return handler.run();
        }
        if (existingApplication) {
            const embed = new discord_js_1.MessageEmbed().setDescription('You have already applied for a squad. Do you want to cancel this application?');
            const handler = new ButtonHandler_1.ButtonHandler(message, embed, message.author.id);
            handler.addButton(utils_1.BLUE_BUTTON, 'Yes', async () => {
                await (0, promiseWrapper_1.dbRun)('DELETE FROM applications WHERE discordID = $userID', { $userID: message.author.id });
                await (0, promiseWrapper_1.dbRun)('UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID', { $userID: message.author.id });
                await (0, Pagination_1.dmOwner)({
                    id: message.author.id,
                    squadName: existingApplication.squadName,
                }, `${message.author.username} has withdrawn their application from your squad.`);
                message.channel.send(`Your application for \`${existingApplication.squadName}\` has been withdrawn! `);
            });
            handler.addButton(utils_1.RED_BUTTON, 'No', () => null);
            handler.run();
        }
        else {
            if (player.squadBossEnergy < 1) {
                return message.channel.send(`You have no Squad Boss Energy left. It will be recharged in \`${formattedTime}\` (Hours:Minutes:Seconds)`);
            }
            const embed = new discord_js_1.MessageEmbed();
            embed.setTitle('Squad Boss');
            embed.setDescription('Welcome to the Squad Boss menu! Here you can fight an Ares Boss with your squad for loot. Do you want to create or join a squad?');
            embed.setFooter(`The remaining time for this week's squad boss is ${formattedTime} (Hours:Minutes:Seconds)`);
            const menu = new ButtonHandler_1.ButtonHandler(message, embed, message.author.id);
            menu.addButton(utils_1.BLUE_BUTTON, 'create squad', async () => {
                const createSquad = new CreateSquad_1.default();
                await createSquad.exec(message);
            });
            menu.addButton(utils_1.WHITE_BUTTON, 'join squad', async () => {
                const squads = await (0, squad_1.getSquads)();
                if (!squads.length) {
                    return message.channel.send('There are currently no squads');
                }
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle('Squads')
                    .setDescription('');
                squads.map((squad) => {
                    embed.description += `\n${squad.id} - ${squad.name}`;
                });
                embed.setFooter('use $join <squad-number> to join a squad');
                message.channel.send(embed);
            });
            menu.addCloseButton();
            menu.run();
        }
    }
}
exports.default = Squad;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3F1YWRCb3NzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL1NxdWFkQm9zcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUF5RDtBQUN6RCxpQ0FBaUM7QUFDakMseURBQTJEO0FBQzNELHVDQUF3QztBQUN4Qyw4REFBMkQ7QUFDM0QsbUVBQTJDO0FBQzNDLHdEQUE4RDtBQUM5RCxnREFBNkM7QUFDN0MsMERBQThEO0FBQzlELHNEQUFtRDtBQUNuRCw4Q0FFNEI7QUFDNUIsa0NBQWlDO0FBQ2pDLGdFQUF3QztBQXFCeEMsTUFBcUIsS0FBTSxTQUFRLGlCQUFPO0lBQTFDOztRQUNFLFNBQUksR0FBRyxXQUFXLENBQUM7UUFDbkIsWUFBTyxHQUFHLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBeVo1QixDQUFDO0lBdlpDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBZ0IsRUFBRSxLQUFlO1FBRTFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSTtZQUFFLE9BQU87UUFFMUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFPLENBQUMsQ0FBQztRQUV2RCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsc0JBQUssRUFBYyxzREFBc0QsRUFBRTtZQUNoRyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1NBQzNCLENBQUMsQ0FBQztRQUVILE1BQU0sbUJBQW1CLEdBQWdCLE1BQU0sSUFBQSxzQkFBSyxFQUFDLHNEQUFzRCxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUc3SSxNQUFNLEdBQUcsR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdD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