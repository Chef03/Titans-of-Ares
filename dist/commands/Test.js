"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gem_1 = require("../db/gem");
const xp_1 = require("../db/xp");
const Command_1 = __importDefault(require("../internals/Command"));
const Mining_1 = require("../internals/Mining");
const MiningPickReward_1 = require("../internals/MiningPickReward");
const Player_1 = require("../internals/Player");
const main_1 = require("../main");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'test';
        this.aliases = ['t'];
    }
    async exec(msg, args) {
        const [arg1, arg2] = args;
        // reset MiningPickReward column
        if (arg1 === 'db' && msg.author.id === main_1.client.devID) {
            main_1.client.runEveryPlayer(async (player) => {
                const limit = MiningPickReward_1.MiningPickReward.upperLimit(player.xp);
                console.log(player.id, player.xp, limit);
                await (0, gem_1.setMiningPickReward)(player.id, limit);
            });
            return;
        }
        if (!main_1.client.isDev)
            return;
        const player = await Player_1.Player.getPlayer(msg.member);
        if (arg1 === 'xp') {
            (0, xp_1.addXP)(player.id, parseInt(arg2));
            msg.channel.send(`Added ${arg2} xp`);
        }
        else if (arg1 === 'gem') {
            for (let i = 0; i < 10; i++) {
                const gem = Mining_1.Common.random();
                await (0, gem_1.addGem)(player.id, gem.id);
                await msg.channel.send(`You got ${gem.name}!`);
                await msg.channel.send(gem.show(-1));
            }
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9UZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsbUNBQXdEO0FBQ3hELGlDQUFpQztBQUNqQyxtRUFBMkM7QUFDM0MsZ0RBQTZDO0FBQzdDLG9FQUFpRTtBQUNqRSxnREFBNkM7QUFDN0Msa0NBQWlDO0FBRWpDLGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0UsU0FBSSxHQUFHLE1BQU0sQ0FBQztRQUVkLFlBQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBZ0NsQixDQUFDO0lBOUJDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLElBQWM7UUFDckMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFMUIsZ0NBQWdDO1FBQ2hDLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxhQUFNLENBQUMsS0FBSyxFQUFFO1lBQ25ELGFBQU0sQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNyQyxNQUFNLEtBQUssR0FBRyxtQ0FBZ0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNyRCxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDekMsTUFBTSxJQUFBLHlCQUFtQixFQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDOUMsQ0FBQyxDQUFDLENBQUM7WUFFSCxPQUFPO1NBQ1I7UUFFRCxJQUFJLENBQUMsYUFBTSxDQUFDLEtBQUs7WUFBRSxPQUFPO1FBRTFCLE1BQU0sTUFBTSxHQUFHLE1BQU0sZUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTyxDQUFDLENBQUM7UUFFbkQsSUFBSSxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ2pCLElBQUEsVUFBSyxFQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQyxDQUFDO1NBQ3RDO2FBQU0sSUFBSSxJQUFJLEtBQUssS0FBSyxFQUFFO1lBQ3pCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzNCLE1BQU0sR0FBRyxHQUFHLGVBQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxJQUFBLFlBQU0sRUFBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDaEMsTUFBTSxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3RDO1NBQ0Y7SUFDSCxDQUFDO0NBQ0Y7QUFuQ0QsNEJBbUNDIn0=