"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const utils_1 = require("../internals/utils");
const CoinShop_1 = __importDefault(require("./CoinShop"));
const ArenaShop_1 = __importDefault(require("./ArenaShop"));
const Command_1 = __importDefault(require("../internals/Command"));
const main_1 = require("../main");
class Shop extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'shop';
        this.aliases = ['sh'];
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async exec(msg, _args) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle('Shop')
            .setDescription('Please select shop you want to open')
            .addField('\u200b', (0, common_tags_1.oneLine) `This will open all the possible shops. You can buy gear
        and upgrade scrolls here. When you buy items from the shop, they
        will appear in the \`${main_1.client.prefix}inventory\``);
        const menu = new ButtonHandler_1.ButtonHandler(msg, embed, msg.author.id);
        const coinShop = new CoinShop_1.default();
        const arenaShop = new ArenaShop_1.default();
        menu.addButton(utils_1.BLUE_BUTTON, 'coin shop', () => coinShop.exec(msg, []));
        menu.addButton(utils_1.WHITE_BUTTON, 'arena coin shop', () => arenaShop.exec(msg, []));
        menu.addCloseButton();
        menu.run();
    }
}
exports.default = Shop;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2hvcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9TaG9wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBQW1EO0FBQ25ELDZDQUFzQztBQUN0Qyw4REFBMkQ7QUFDM0QsOENBSTRCO0FBQzVCLDBEQUFrQztBQUNsQyw0REFBb0M7QUFDcEMsbUVBQTJDO0FBQzNDLGtDQUFpQztBQUVqQyxNQUFxQixJQUFLLFNBQVEsaUJBQU87SUFBekM7O1FBQ0UsU0FBSSxHQUFHLE1BQU0sQ0FBQztRQUVkLFlBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBeUJuQixDQUFDO0lBdkJDLDZEQUE2RDtJQUM3RCxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxLQUFlO1FBQ3RDLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUM3QixRQUFRLENBQUMsYUFBSyxDQUFDO2FBQ2YsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUNoQixjQUFjLENBQUMscUNBQXFDLENBQUM7YUFDckQsUUFBUSxDQUNQLFFBQVEsRUFDUixJQUFBLHFCQUFPLEVBQUE7OytCQUVnQixhQUFNLENBQUMsTUFBTSxhQUFhLENBQ2xELENBQUM7UUFFSixNQUFNLElBQUksR0FBRyxJQUFJLDZCQUFhLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzFELE1BQU0sUUFBUSxHQUFHLElBQUksa0JBQVEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sU0FBUyxHQUFHLElBQUksbUJBQVMsRUFBRSxDQUFDO1FBRWxDLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQVcsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFZLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUUvRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2IsQ0FBQztDQUNGO0FBNUJELHVCQTRCQyJ9