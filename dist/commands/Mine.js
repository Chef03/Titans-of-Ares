"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Command_1 = __importDefault(require("../internals/Command"));
const Player_1 = require("../internals/Player");
const Inventory_1 = __importDefault(require("./Inventory"));
class Mine extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'mine';
        this.aliases = ['mining'];
    }
    // eslint-disable-next-line
    async exec(msg, _args) {
        const player = await Player_1.Player.getPlayer(msg.member);
        const miningPick = player.inventory.picks.get(0);
        if (!miningPick) {
            return msg.channel.send("You don't have any mining pick");
        }
        const miningPickCount = player.inventory.all.count(miningPick.id);
        const info = miningPick.show(miningPickCount);
        const menu = new ButtonHandler_1.ButtonHandler(msg, info, player.id);
        const inventoryCommand = new Inventory_1.default();
        inventoryCommand.handlePick(menu, miningPick, player, msg);
        menu.addCloseButton();
        await menu.run();
    }
}
exports.default = Mine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9NaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0EsOERBQTJEO0FBQzNELG1FQUEyQztBQUMzQyxnREFBNkM7QUFDN0MsNERBQW9DO0FBRXBDLE1BQXFCLElBQUssU0FBUSxpQkFBTztJQUF6Qzs7UUFDRSxTQUFJLEdBQUcsTUFBTSxDQUFDO1FBRWQsWUFBTyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFzQnZCLENBQUM7SUFwQkMsMkJBQTJCO0lBQzNCLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLEtBQWU7UUFFdEMsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUMsQ0FBQztRQUNuRCxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFakQsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztTQUMzRDtRQUVELE1BQU0sZUFBZSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEUsTUFBTSxJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM5QyxNQUFNLElBQUksR0FBRyxJQUFJLDZCQUFhLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLG1CQUFTLEVBQUUsQ0FBQztRQUV6QyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFM0QsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3RCLE1BQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ25CLENBQUM7Q0FDRjtBQXpCRCx1QkF5QkMifQ==