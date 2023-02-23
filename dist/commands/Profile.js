"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../internals/Command"));
const Player_1 = require("../internals/Player");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'profile';
        this.aliases = ['p'];
    }
    async exec(msg, args) {
        const userId = args[0] || msg.author.id;
        const member = await msg.guild?.members.fetch(userId);
        const { guild } = msg;
        if (!member)
            return msg.channel.send('Member does not exist');
        if (!guild)
            return;
        msg.channel.startTyping();
        const player = await Player_1.Player.getPlayer(member);
        const card = await player.getProfile();
        const stats = await player.getStats();
        msg.channel.stopTyping();
        await msg.channel.send(card);
        await msg.channel.send(stats);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9Qcm9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsbUVBQTJDO0FBQzNDLGdEQUE2QztBQUU3QyxlQUFxQixTQUFRLGlCQUFPO0lBQXBDOztRQUNFLFNBQUksR0FBRyxTQUFTLENBQUM7UUFFakIsWUFBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUF1QmxCLENBQUM7SUFyQkMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFZLEVBQUUsSUFBYztRQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDeEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdEQsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQztRQUV0QixJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsS0FBSztZQUFFLE9BQU87UUFFbkIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUUxQixNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFOUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7UUFFdkMsTUFBTSxLQUFLLEdBQUcsTUFBTSxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFdEMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUV6QixNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzdCLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNGO0FBMUJELDRCQTBCQyJ9