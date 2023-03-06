"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lodash_groupby_1 = __importDefault(require("lodash.groupby"));
const monthlyChallenge_1 = require("../db/monthlyChallenge");
const Command_1 = __importDefault(require("../internals/Command"));
const main_1 = require("../main");
const utils_1 = require("../internals/utils");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'progress';
    }
    async exec(msg) {
        const channelID = main_1.client.isDev ? '859483633534238762' : msg.channel.id;
        const challenge = await (0, monthlyChallenge_1.getChallengeByChannelID)(channelID);
        if (!challenge)
            return;
        const challengeID = challenge.ID;
        const entries = await (0, monthlyChallenge_1.getDayEntries)(msg.author.id, challengeID);
        const dayEntries = Object.entries((0, lodash_groupby_1.default)(entries, (x) => x.Day));
        const dayList = dayEntries
            .sort((b, a) => parseInt(b[0]) - parseInt(a[0]))
            .map(([day, dayEntry]) => `Day ${day} - ${dayEntry.map((x) => `${x.Value} ${x.ValueType}`).join(' | ')}`);
        const embed = new discord_js_1.MessageEmbed()
            .setTitle('Progress by day')
            .setDescription((0, utils_1.toList)(dayList));
        msg.channel.send(embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3Jlc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvUHJvZ3Jlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FBbUQ7QUFDbkQsb0VBQXFDO0FBQ3JDLDZEQUFnRjtBQUNoRixtRUFBMkM7QUFDM0Msa0NBQWlDO0FBQ2pDLDhDQUE0QztBQUU1QyxlQUFxQixTQUFRLGlCQUFPO0lBQXBDOztRQUNFLFNBQUksR0FBRyxVQUFVLENBQUM7SUFzQnBCLENBQUM7SUFwQkMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFZO1FBRXJCLE1BQU0sU0FBUyxHQUFHLGFBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUN2RSxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUEsMENBQXVCLEVBQUMsU0FBUyxDQUFDLENBQUM7UUFDM0QsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxFQUFFLENBQUM7UUFDakMsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLGdDQUFhLEVBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFaEUsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFBLHdCQUFPLEVBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNsRSxNQUFNLE9BQU8sR0FBRyxVQUFVO2FBQ3ZCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDL0MsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTVHLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUM3QixRQUFRLENBQUMsaUJBQWlCLENBQUM7YUFDM0IsY0FBYyxDQUFDLElBQUEsY0FBTSxFQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFFbkMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUIsQ0FBQztDQUNGO0FBdkJELDRCQXVCQyJ9