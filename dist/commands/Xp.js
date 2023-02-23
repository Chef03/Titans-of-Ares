"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const player_1 = require("../db/player");
const Command_1 = __importDefault(require("../internals/Command"));
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'xp';
    }
    async exec(msg, args) {
        const [userId] = args;
        const member = msg.guild?.members.cache.get(userId);
        if (!userId)
            return msg.channel.send('You need to give user id');
        if (!member)
            return msg.channel.send('Member does not exists');
        const totalXp = await (0, player_1.getTotalXp)(userId);
        msg.channel.send(`${member.displayName} has \`${totalXp}xp\``);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiWHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvWHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSx5Q0FBMEM7QUFDMUMsbUVBQTJDO0FBRTNDLGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0UsU0FBSSxHQUFHLElBQUksQ0FBQztJQVlkLENBQUM7SUFWQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxJQUFjO1FBQ3JDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDdEIsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVwRCxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUUvRCxNQUFNLE9BQU8sR0FBRyxNQUFNLElBQUEsbUJBQVUsRUFBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLFVBQVUsT0FBTyxNQUFNLENBQUMsQ0FBQztJQUNqRSxDQUFDO0NBQ0Y7QUFiRCw0QkFhQyJ9