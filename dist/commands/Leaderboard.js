"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../internals/Command"));
const Leaderboard_1 = require("../internals/Leaderboard");
const monthlyChallenge_1 = require("../db/monthlyChallenge");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'leaderboard';
    }
    async exec(msg, args) {
        const challenge = await (0, monthlyChallenge_1.getChallengeByChannelID)(msg.channel.id);
        if (!challenge)
            return;
        const leaderboard = new Leaderboard_1.Leaderboard();
        await leaderboard.init(challenge);
        const images = await leaderboard.generateImage();
        await Promise.all(images.map((image, i) => {
            const embed = new discord_js_1.MessageEmbed();
            embed.attachFiles([image]);
            embed.setImage(`attachment://page${i + 1}.jpg`);
            return msg.channel.send(embed);
        }));
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGVhZGVyYm9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvTGVhZGVyYm9hcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FBbUQ7QUFDbkQsbUVBQTJDO0FBQzNDLDBEQUF1RDtBQUN2RCw2REFBaUU7QUFHakUsZUFBcUIsU0FBUSxpQkFBTztJQUFwQzs7UUFFSSxTQUFJLEdBQUcsYUFBYSxDQUFDO0lBMEJ6QixDQUFDO0lBekJHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLElBQWM7UUFFbkMsTUFBTSxTQUFTLEdBQUcsTUFBTSxJQUFBLDBDQUF1QixFQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFaEUsSUFBSSxDQUFDLFNBQVM7WUFBRSxPQUFPO1FBRXZCLE1BQU0sV0FBVyxHQUFHLElBQUkseUJBQVcsRUFBRSxDQUFBO1FBQ3JDLE1BQU0sV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVqRCxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUV0QyxNQUFNLEtBQUssR0FBRyxJQUFJLHlCQUFZLEVBQUUsQ0FBQTtZQUNoQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMzQixLQUFLLENBQUMsUUFBUSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoRCxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRWxDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFJUCxDQUFDO0NBR0o7QUE1QkQsNEJBNEJDIn0=