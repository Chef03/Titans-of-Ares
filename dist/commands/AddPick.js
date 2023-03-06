"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../internals/Command"));
const MiningPickReward_1 = require("../internals/MiningPickReward");
const Player_1 = require("../internals/Player");
const main_1 = require("../main");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'addpick';
    }
    async exec(msg, args) {
        if (msg.author.id != '852610602387111948' && msg.author.id != '213585600098467841')
            return;
        const [discordID, count] = args;
        const member = await msg.guild?.members.resolve(discordID);
        const player = await Player_1.Player.getPlayer(member);
        for (let i = 0; i < parseInt(count); i++) {
            await MiningPickReward_1.MiningPickReward.reward(player);
        }
        await MiningPickReward_1.MiningPickReward.setUpperLimit(player);
        const announce = `Ares awarded <@${player.id}> with ${count} mining picks!`;
        msg.channel.send(`Added ${count} picks to ${player.name}`);
        main_1.client.logChannel.send(announce);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRkUGljay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9BZGRQaWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsbUVBQTJDO0FBQzNDLG9FQUFpRTtBQUNqRSxnREFBNkM7QUFDN0Msa0NBQWlDO0FBRWpDLGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0ksU0FBSSxHQUFHLFNBQVMsQ0FBQztJQXFCckIsQ0FBQztJQW5CRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxJQUFjO1FBRW5DLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksb0JBQW9CLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksb0JBQW9CO1lBQUUsT0FBTztRQUUzRixNQUFNLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNoQyxNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUMxRCxNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTyxDQUFDLENBQUM7UUFFL0MsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxNQUFNLG1DQUFnQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN6QztRQUVELE1BQU0sbUNBQWdCLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdDLE1BQU0sUUFBUSxHQUFHLGtCQUFrQixNQUFNLENBQUMsRUFBRSxVQUFVLEtBQUssZ0JBQWdCLENBQUM7UUFFNUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxLQUFLLGFBQWEsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUE7UUFDMUQsYUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7SUFFcEMsQ0FBQztDQUNKO0FBdEJELDRCQXNCQyJ9