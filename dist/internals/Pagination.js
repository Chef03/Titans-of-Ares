"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pagination = exports.checkPositions = exports.dmOwner = void 0;
const discord_js_1 = require("discord.js");
const promiseWrapper_1 = require("../db/promiseWrapper");
const main_1 = require("../main");
const ButtonHandler_1 = require("./ButtonHandler");
const FightBoss_1 = require("./FightBoss");
const utils_1 = require("./utils");
async function dmOwner(applicant, message) {
    const squad = await (0, promiseWrapper_1.dbGet)('SELECT * FROM squads WHERE name = $name', { $name: applicant.squadName });
    const discordOwner = await main_1.client.bot.users.fetch(squad.owner);
    discordOwner.send(message);
}
exports.dmOwner = dmOwner;
async function checkPositions(squadName, position) {
    const allMembers = await (0, promiseWrapper_1.dbAll)('SELECT * FROM squadMembers WHERE squadName = $squadName', { $squadName: squadName });
    const front = allMembers.filter((member) => member.position === 'front');
    const back = allMembers.filter((member) => member.position === 'back');
    if (front.length === 4 && position === 'front')
        return false;
    if (back.length === 4 && position === 'back')
        return false;
    return true;
}
exports.checkPositions = checkPositions;
class Pagination {
    constructor(msg, pages, userID, index = 0, actionated = false, applications = false, battling = false) {
        this.msg = msg;
        this.pages = pages;
        this.userID = userID;
        this.index = index;
        this.actionated = actionated;
        this.applications = applications;
        this.battling = battling;
    }
    async run() {
        if (this.pages.length <= 0)
            throw new Error('cannot paginate with zero pages');
        const currentPage = this.pages[this.index];
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, currentPage, this.userID);
        const prevPage = this.pages[this.index - 1];
        const nextPage = this.pages[this.index + 1];
        const pageHandler = (index) => async () => {
            const menu = new Pagination(this.msg, this.pages, this.userID, index, this.actionated, this.applications, this.battling);
            await menu.run();
        };
        if (prevPage) {
            if (this.pages.length > 2) {
                menu.addButton(utils_1.LEFTMOST_ARROW_BUTTON, 'go to first page', pageHandler(0));
            }
            menu.addButton(utils_1.LEFT_ARROW_BUTTON, 'go to previous page', pageHandler(this.index - 1));
        }
        if (nextPage) {
            menu.addButton(utils_1.RIGHT_ARROW_BUTTON, 'go to next page', pageHandler(this.index + 1));
            if (this.pages.length > 2) {
                menu.addButton(utils_1.RIGHTMOST_ARROW_BUTTON, 'go to last page', pageHandler(this.pages.length - 1));
            }
        }
        if (this.applications) {
            const squad = await (0, promiseWrapper_1.dbGet)('SELECT * FROM squads WHERE owner=$userID', { $userID: this.msg.author.id });
            const applicantID = this.pages[this.index].fields[0].value.replace(/[\\<>@#&!]/g, '');
            const position = this.pages[this.index].fields[1].value;
            const applicantDiscord = await main_1.client.bot.users.fetch(applicantID);
            menu.addButton(utils_1.BLUE_BUTTON, 'Accept Application', async () => {
                await (0, promiseWrapper_1.dbRun)('DELETE FROM applications WHERE discordID = $userID', {
                    $userID: applicantID,
                });
                await (0, promiseWrapper_1.dbRun)('INSERT INTO squadMembers (discordID, squadName, position) VALUES ($userID, $squadName, $position)', {
                    $userID: applicantID,
                    $squadName: squad.name,
                    $position: position,
                });
                const discordUser = await main_1.client.bot.users.fetch(applicantID);
                discordUser.send(`Your application for squad \`${squad.name}\` has been accepted`);
                this.msg.channel.send(`You have accepted ${applicantDiscord.username}'s application`);
                main_1.client.squadBossChannel.send(`${applicantDiscord.username} has been accepted to \`${squad.name}\``);
            });
            menu.addButton(utils_1.RED_BUTTON, 'Reject Application', async () => {
                await (0, promiseWrapper_1.dbRun)('DELETE FROM applications WHERE discordID = $userID', {
                    $userID: applicantID,
                });
                await (0, promiseWrapper_1.dbRun)('UPDATE Player SET SquadBossEnergy = 1 WHERE DiscordID = $userID', { $userID: applicantDiscord.id });
                const discordUser = await main_1.client.bot.users.fetch(applicantID);
                this.msg.channel.send(`You have rejected ${applicantDiscord.username}'s application`);
                discordUser.send(`Your application for squad \`${squad.name}\` has been rejected`);
                applicantDiscord.send(`Sadly, the Squad leader has rejected ${applicantDiscord.username} to join \`${squad.name}\`. Find an other Squad with the $squadboss command!`);
            });
        }
        if (this.actionated) {
            menu.addButton(utils_1.WHITE_BUTTON, 'Join', async () => {
                const squadName = this.pages[this.index].fields[0].value;
                const prompt = await this.msg.channel.send('Choose a position');
                const embed = new discord_js_1.MessageEmbed()
                    .setDescription(`Squad Name: \`${squadName}\` \n Choose your position in the formation of the squad when fighting the boss. You can always change this later.`);
                const discordApplicant = await main_1.client.bot.users.fetch(this.userID);
                const PositionMenu = new ButtonHandler_1.ButtonHandler(prompt, embed, this.userID);
                PositionMenu.addButton(utils_1.BLUE_BUTTON, 'Front Row', async () => {
                    // const valid = await checkPositions(squadName, 'front')
                    // if (!valid) return this.msg.channel.send(`All front slots are currently taken, consider picking back or contact the team leader`)
                    await (0, promiseWrapper_1.dbRun)('INSERT INTO applications (discordID, position, squadName) VALUES ($userID, $position, $squadName)', {
                        $userID: this.userID,
                        $position: 'front',
                        $squadName: squadName,
                    });
                    const sql = 'UPDATE Player SET SquadBossEnergy = 0 WHERE DiscordID = $userID';
                    await (0, promiseWrapper_1.dbRun)(sql, { $userID: this.userID });
                    await dmOwner({
                        id: this.userID,
                        squadName,
                    }, `\`${discordApplicant.username}\` has applied for your squad! Please use $squadboss to accept or reject this applicant.`);
                    this.msg.channel.send(`You have succesfully applied for \`${squadName}\`! The squad leader will have the option to accept or reject your application.`);
                    //
                });
                PositionMenu.addButton(utils_1.WHITE_BUTTON, 'Back Row', async () => {
                    const valid = await checkPositions(squadName, 'back');
                    if (!valid)
                        return this.msg.channel.send('All back slots are currently taken, consider picking back or contact the team leader');
                    await (0, promiseWrapper_1.dbRun)('INSERT INTO applications (discordID, position, squadName) VALUES ($userID, $position, $squadName)', {
                        $userID: this.userID,
                        $position: 'back',
                        $squadName: squadName,
                    });
                    await dmOwner({
                        id: this.userID,
                        squadName,
                    }, `\`${discordApplicant.username}\` has applied for your squad! Please use $squadboss to accept or reject this applicant.`);
                    this.msg.channel.send(`You have succesfully applied for \`${squadName}\`! The squad leader will have the option to accept or reject your application.`);
                    //
                });
                PositionMenu.addCloseButton();
                PositionMenu.run();
            });
        }
        if (this.battling) {
            menu.addButton('⚔️', 'Battle', async () => {
                const bossName = this.pages[this.index].fields[0].value;
                const squad = await (0, promiseWrapper_1.dbGet)('SELECT * FROM squads WHERE owner = $owner', { $owner: this.msg.author.id });
                const team = await (0, promiseWrapper_1.dbAll)('SELECT * FROM squadMembers WHERE squadName = $name', { $name: squad.name });
                (0, FightBoss_1.FightBoss)(this.msg, bossName, team);
            });
        }
        menu.addCloseButton();
        await menu.run();
    }
}
exports.Pagination = Pagination;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGFnaW5hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvUGFnaW5hdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBbUQ7QUFFbkQseURBQTJEO0FBRTNELGtDQUFpQztBQUNqQyxtREFBZ0Q7QUFDaEQsMkNBQXdDO0FBRXhDLG1DQUVpQjtBQVFWLEtBQUssVUFBVSxPQUFPLENBQUMsU0FBb0IsRUFBRSxPQUFlO0lBQ2pFLE1BQU0sS0FBSyxHQUFVLE1BQU0sSUFBQSxzQkFBSyxFQUFDLHlDQUF5QyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQzVHLE1BQU0sWUFBWSxHQUFHLE1BQU0sYUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvRCxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFKRCwwQkFJQztBQUVNLEtBQUssVUFBVSxjQUFjLENBQUMsU0FBaUIsRUFBRSxRQUFnQjtJQUN0RSxNQUFNLFVBQVUsR0FBa0IsTUFBTSxJQUFBLHNCQUFLLEVBQUMseURBQXlELEVBQUUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztJQUVwSSxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxLQUFLLE9BQU8sQ0FBQyxDQUFDO0lBQ3pFLE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssTUFBTSxDQUFDLENBQUM7SUFFdkUsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxRQUFRLEtBQUssT0FBTztRQUFFLE9BQU8sS0FB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