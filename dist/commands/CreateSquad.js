"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const promiseWrapper_1 = require("../db/promiseWrapper");
const squad_1 = require("../db/squad");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Command_1 = __importDefault(require("../internals/Command"));
const Prompt_1 = require("../internals/Prompt");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
const Confirmation = async (message, squadName, position) => {
    const sql = 'UPDATE Player SET SquadBossEnergy = 0 WHERE DiscordID = $userID';
    await (0, promiseWrapper_1.dbRun)(sql, { $userID: message.author.id });
    const memberSql = 'INSERT INTO squadMembers (discordID, squadName, position) VALUES ($userID, $squadName, $position)';
    await (0, promiseWrapper_1.dbRun)(memberSql, { $userID: message.author.id, $squadName: squadName, $position: position });
    message.channel.send(`\`${squadName}\` created! Other players can now apply for your Squad! To view your applications press: $squadboss`);
    main_1.client.squadBossChannel.send(`Notice: <@${message.author.id}> has created a squad named: \`${squadName}\`. Press $squadboss if you want to join!`);
};
class CreateSquad extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'createsquad';
    }
    async exec(message, args) {
        if (message.channel.type === 'dm')
            return;
        const prompt = new Prompt_1.Prompt(message);
        const squadName = await prompt.ask('Enter your squad\'s name:');
        const embed = new discord_js_1.MessageEmbed()
            .setDescription(`Squad Name: \`${squadName}\` \n Choose your position in the formation of the squad when fighting the boss. You can always change this later.`);
        prompt.asked_question?.delete();
        const exists = await (0, promiseWrapper_1.dbGet)('SELECT * FROM squads WHERE name = $name', { $name: squadName });
        if (exists)
            return message.channel.send(`A squad with the name \`${squadName}\` already exists, please try again`);
        const menu = new ButtonHandler_1.ButtonHandler(message, embed, message.author.id);
        menu.addButton(utils_1.BLUE_BUTTON, 'Front Row', async () => {
            await (0, squad_1.saveSquad)(squadName, message.member);
            Confirmation(message, squadName, 'front');
        });
        menu.addButton(utils_1.WHITE_BUTTON, 'Back Row', async () => {
            await (0, squad_1.saveSquad)(squadName, message.member);
            Confirmation(message, squadName, 'back');
        });
        menu.addCloseButton();
        menu.run();
    }
}
exports.default = CreateSquad;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRlU3F1YWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvQ3JlYXRlU3F1YWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FBbUQ7QUFDbkQseURBQW9EO0FBQ3BELHVDQUF3QztBQUN4Qyw4REFBMkQ7QUFDM0QsbUVBQTJDO0FBQzNDLGdEQUE2QztBQUM3Qyw4Q0FBK0Q7QUFDL0Qsa0NBQWlDO0FBRWpDLE1BQU0sWUFBWSxHQUFHLEtBQUssRUFBRSxPQUFnQixFQUFFLFNBQWlCLEVBQUUsUUFBZ0IsRUFBRSxFQUFFO0lBQ25GLE1BQU0sR0FBRyxHQUFHLGlFQUFpRSxDQUFDO0lBQzlFLE1BQU0sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFakQsTUFBTSxTQUFTLEdBQUcsbUdBQW1HLENBQUM7SUFFdEgsTUFBTSxJQUFBLHNCQUFLLEVBQUMsU0FBUyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFFbkcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLHFHQUFxRyxDQUFDLENBQUM7SUFDMUksYUFBTSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxhQUFhLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxrQ0FBa0MsU0FBUywyQ0FBMkMsQ0FBQyxDQUFDO0FBQ3JKLENBQUMsQ0FBQztBQUVGLE1BQXFCLFdBQVksU0FBUSxpQkFBTztJQUFoRDs7UUFDRSxTQUFJLEdBQUcsYUFBYSxDQUFDO0lBbUN2QixDQUFDO0lBakNDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBZ0IsRUFBRSxJQUFlO1FBRzFDLElBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSTtZQUFFLE9BQU87UUFHekMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFFaEUsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzdCLGNBQWMsQ0FBQyxpQkFBaUIsU0FBUyxvSEFBb0gsQ0FBQyxDQUFDO1FBRWxLLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFFaEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLHNCQUFLLEVBQUMseUNBQXlDLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUU1RixJQUFJLE1BQU07WUFBRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixTQUFTLHFDQUFxQyxDQUFDLENBQUM7UUFFbkgsTUFBTSxJQUFJLEdBQUcsSUFBSSw2QkFBYSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVsRSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFXLEVBQUUsV0FBVyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2xELE1BQU0sSUFBQSxpQkFBUyxFQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsTUFBTyxDQUFDLENBQUM7WUFDNUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFZLEVBQUUsVUFBVSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2xELE1BQU0sSUFBQSxpQkFBUyxFQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsTUFBTyxDQUFDLENBQUM7WUFDNUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2IsQ0FBQztDQUNGO0FBcENELDhCQW9DQyJ9