"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inventory_1 = require("../db/inventory");
const Command_1 = __importDefault(require("../internals/Command"));
const Mining_1 = require("../internals/Mining");
const main_1 = require("../main");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'give';
    }
    async exec(msg, args) {
        if (msg.author.id !== '213585600098467841'
            && msg.author.id !== main_1.client.devID) {
            return;
        }
        const userID = args[0];
        const amount = parseInt(args[1]);
        if (!amount) {
            return msg.channel.send('invalid amount');
        }
        const member = main_1.client.mainGuild.members.cache.get(userID);
        if (!member) {
            return msg.channel.send('member not found');
        }
        const pick = new Mining_1.MiningPick();
        await (0, inventory_1.addInventory)(member.id, pick.id, amount);
        msg.channel.send(`Successfully gave ${amount} mining picks to ${member.displayName}`);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2l2ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9HaXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsK0NBQStDO0FBQy9DLG1FQUEyQztBQUMzQyxnREFBaUQ7QUFDakQsa0NBQWlDO0FBRWpDLGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0UsU0FBSSxHQUFHLE1BQU0sQ0FBQztJQThCaEIsQ0FBQztJQTVCQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxJQUFjO1FBQ3JDLElBQ0UsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssb0JBQW9CO2VBQ25DLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxLQUFLLGFBQU0sQ0FBQyxLQUFLLEVBQ2pDO1lBQ0EsT0FBTztTQUNSO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVqQyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1NBQzNDO1FBRUQsTUFBTSxNQUFNLEdBQUcsYUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUUxRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1NBQzdDO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxtQkFBVSxFQUFFLENBQUM7UUFDOUIsTUFBTSxJQUFBLHdCQUFZLEVBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRS9DLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNkLHFCQUFxQixNQUFNLG9CQUFvQixNQUFNLENBQUMsV0FBVyxFQUFFLENBQ3BFLENBQUM7SUFDSixDQUFDO0NBQ0Y7QUEvQkQsNEJBK0JDIn0=