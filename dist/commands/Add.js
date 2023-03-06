"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivityName = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const luxon_1 = require("luxon");
const monthlyChallenge_1 = require("../db/monthlyChallenge");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Command_1 = __importDefault(require("../internals/Command"));
const Leaderboard_1 = require("../internals/Leaderboard");
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
function getActivityName(name) {
    const names = ["steps",
        "cyclingkm",
        "cyclingmi",
        "meditation",
        "weightlift",
        "ringbonus",
        "weekstreak",
        "levelup",
        "rankup",
        "workout",
        "othercardio",
        "strength",
        "yoga10",
        "yoga30",
        "meditation10",
        "meditation30",
        "rowingkm",
        "rowingmi",
        "get10walks",
        "get10cycling",
        "readabook",
        "diary",
        "workoutselfie",
        "personalphoto",
        "personalgoal",
        "points",
        "weekstreak"];
    let parsedName = "points";
    names.map(existing => {
        if (existing == name) {
            parsedName = existing;
        }
    });
    return parsedName;
}
exports.getActivityName = getActivityName;
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'add';
    }
    async exec(msg, args) {
        if (msg.author.id != '852610602387111948' && msg.author.id != '213585600098467841')
            return;
        const date = luxon_1.DateTime.now().setLocale('en-US');
        const challenge = await (0, monthlyChallenge_1.getCurrentChallenge)();
        const [discordID, day, activityName, rewardAmount] = args;
        const member = await msg.guild?.members.resolve(discordID);
        const player = await Player_1.Player.getPlayer(member);
        const challengeName = getActivityName(activityName);
        try {
            await (0, monthlyChallenge_1.registerDayEntry)(player.id, parseInt(day), challenge.ID, challengeName, parseInt(rewardAmount));
            msg.channel.send(`Added **${rewardAmount} ${challengeName}** to **${player.name}** on **${day} ${date.monthLong}**`);
            main_1.client.logChannel.send(`Ares awarded <@${player.id}> with **${rewardAmount} ${challengeName}**`);
        }
        catch (e) {
            console.error(e);
            const err = e;
            const amount = err.dayEntry.Value == 1 ? "a" : err.dayEntry.Value;
            const question = (0, common_tags_1.oneLine) `Player already registered ${(0, utils_1.bold)(amount)} ${activityName} on
        ${(0, utils_1.bold)(date.monthLong)} ${(0, utils_1.bold)(day)}. Do you want to
        replace or add points on this day?`;
            const menu = new ButtonHandler_1.ButtonHandler(msg, question);
            menu.addButton(utils_1.BLUE_BUTTON, "replace", async () => {
                await (0, monthlyChallenge_1.replaceDayEntry)(player.id, parseInt(day), challenge.ID, challengeName, parseInt(rewardAmount));
                await msg.channel.send(`Successfully replaced`);
                await main_1.client.logChannel.send(`Ares awarded <@${player.id}> with **${rewardAmount} ${challengeName}**`);
            });
            menu.addButton(utils_1.RED_BUTTON, "add points", async () => {
                await (0, monthlyChallenge_1.addDayEntry)(player.id, parseInt(day), challenge.ID, challengeName, parseInt(rewardAmount));
                msg.channel.send(`Successfully added`);
                await main_1.client.logChannel.send(`Ares awarded <@${player.id}> with **${rewardAmount} ${challengeName}**`);
            });
            menu.addCloseButton();
            await menu.run();
        }
        const leaderboard = new Leaderboard_1.Leaderboard();
        await leaderboard.init(challenge);
        const images = await leaderboard.generateImage();
        await (0, utils_1.nukeChannel)(leaderboard.channel);
        await Promise.all(images.map((image, i) => {
            const embed = new discord_js_1.MessageEmbed();
            embed.attachFiles([image]);
            embed.setImage(`attachment://page${i + 1}.jpg`);
            return leaderboard.channel.send(embed);
        }));
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL0FkZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSw2Q0FBc0M7QUFDdEMsMkNBQW1EO0FBQ25ELGlDQUFpQztBQUNqQyw2REFBMEk7QUFDMUksOERBQTJEO0FBQzNELG1FQUEyQztBQUMzQywwREFBdUQ7QUFDdkQsZ0RBQTZDO0FBQzdDLDhDQUFnRjtBQUNoRixrQ0FBaUM7QUFFakMsU0FBZ0IsZUFBZSxDQUFDLElBQVk7SUFFeEMsTUFBTSxLQUFLLEdBQW9CLENBQUMsT0FBTztRQUNqQyxXQUFXO1FBQ1gsV0FBVztRQUNYLFlBQVk7UUFDWixZQUFZO1FBQ1osV0FBVztRQUNYLFlBQVk7UUFDWixTQUFTO1FBQ1QsUUFBUTtRQUNSLFNBQVM7UUFDVCxhQUFhO1FBQ2IsVUFBVTtRQUNWLFFBQVE7UUFDUixRQUFRO1FBQ1IsY0FBYztRQUNkLGNBQWM7UUFDZCxVQUFVO1FBQ1YsVUFBVTtRQUNWLFlBQVk7UUFDWixjQUFjO1FBQ2QsV0FBVztRQUNYLE9BQU87UUFDUCxlQUFlO1FBQ2YsZUFBZTtRQUNmLGNBQWM7UUFDZCxRQUFRO1FBQ1IsWUFBWSxDQUFDLENBQUE7SUFFbkIsSUFBSSxVQUFVLEdBQWtCLFFBQVEsQ0FBQztJQUN6QyxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxFQUFFO1FBQ2pCLElBQUksUUFBUSxJQUFJLElBQUksRUFBRTtZQUNsQixVQUFVLEdBQUcsUUFBUSxDQUFDO1NBQ3pCO0lBQ0wsQ0FBQyxDQUFDLENBQUE7SUFDRixPQUFPLFVBQVUsQ0FBQztBQUV0QixDQUFDO0FBdENELDBDQXNDQztBQUVELGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0ksU0FBSSxHQUFHLEtBQUssQ0FBQztJQWdHakIsQ0FBQztJQTlGRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxJQUFjO1FBRW5DLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksb0JBQW9CLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksb0JBQW9CO1lBQUUsT0FBTztRQUUzRixNQUFNLElBQUksR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUUvQyxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsc0NBQW1CLEdBQUUsQ0FBQztRQUM5QyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzFELE1BQU0sTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQzFELE1BQU0sTUFBTSxHQUFHLE1BQU0sZUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFPLENBQUMsQ0FBQztRQUMvQyxNQUFNLGFBQWEsR0FBa0IsZUFBZSxDQUFDLFlBQVksQ0FBRSxDQUFDO1FBRXBFLElBQUk7WUFFQSxNQUFNLElBQUEsbUNBQWdCLEVBQ2xCLE1BQU0sQ0FBQyxFQUFFLEVBQ1QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUNiLFNBQVMsQ0FBQyxFQUFFLEVBQ1osYUFBYSxFQUNiLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FDekIsQ0FBQztZQUVGLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsWUFBWSxJQUFJLGFBQWEsV0FBVyxNQUFNLENBQUMsSUFBSSxXQUFXLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQTtZQUNwSCxhQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsTUFBTSxDQUFDLEVBQUUsWUFBWSxZQUFZLElBQUksYUFBYSxJQUFJLENBQUMsQ0FBQTtTQUVuRztRQUlELE9BQU8sQ0FBVSxFQUFFO1lBRWYsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVqQixNQUFNLEdBQUcsR0FBRyxDQUFpQixDQUFDO1lBQzlCLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUVsRSxNQUFNLFFBQVEsR0FBRyxJQUFBLHFCQUFPLEVBQUEsNkJBQTZCLElBQUEsWUFBSSxFQUFDLE1BQU0sQ0FBQyxJQUFJLFlBQVk7VUFDbkYsSUFBQSxZQUFJLEVBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUEsWUFBSSxFQUFDLEdBQUcsQ0FBQzsyQ0FDQSxDQUFDO1lBRWhDLE1BQU0sSUFBSSxHQUFHLElBQUksNkJBQWEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFFOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBVyxFQUFFLFNBQVMsRUFBRSxLQUFLLElBQUksRUFBRTtnQkFFOUMsTUFBTSxJQUFBLGtDQUFlLEVBQ2pCLE1BQU0sQ0FBQyxFQUFFLEVBQ1QsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUNiLFNBQVMsQ0FBQyxFQUFFLEVBQ1osYUFBYSxFQUNiLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FDekIsQ0FBQztnQkFFRixNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBQ2hELE1BQU0sYUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLE1BQU0sQ0FBQyxFQUFFLFlBQVksWUFBWSxJQUFJLGFBQWEsSUFBSSxDQUFDLENBQUE7WUFFMUcsQ0FBQyxDQUFDLENBQUM7WUFFSCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFVLEVBQUUsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFO2dCQUVoRCxNQUFNLElBQUEsOEJBQVcsRUFDYixNQUFNLENBQUMsRUFBRSxFQUNULFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFDYixTQUFTLENBQUMsRUFBRSxFQUNaLGFBQWEsRUFDYixRQUFRLENBQUMsWUFBWSxDQUFDLENBQ3pCLENBQUM7Z0JBRUYsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDdkMsTUFBTSxhQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsTUFBTSxDQUFDLEVBQUUsWUFBWSxZQUFZLElBQUksYUFBYSxJQUFJLENBQUMsQ0FBQTtZQUUxRyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixNQUFNLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNwQjtRQUVELE1BQU0sV0FBVyxHQUFHLElBQUkseUJBQVcsRUFBRSxDQUFBO1FBQ3JDLE1BQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUVoRCxNQUFNLElBQUEsbUJBQVcsRUFBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFdkMsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFFdEMsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFLENBQUE7WUFDaEMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDM0IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEQsT0FBTyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUUxQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBR1AsQ0FBQztDQUNKO0FBakdELDRCQWlHQyJ9