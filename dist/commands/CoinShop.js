"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const gear_1 = require("../db/gear");
const inventory_1 = require("../db/inventory");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Gear_1 = require("../internals/Gear");
const Player_1 = require("../internals/Player");
const Scroll_1 = require("../internals/Scroll");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
const ApprenticeGear_1 = require("../internals/ApprenticeGear");
const Command_1 = __importDefault(require("../internals/Command"));
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'coinshop';
        this.aliases = ['csh'];
    }
    async exec(msg, args) {
        const index = args[0];
        const indexInt = parseInt(index);
        const player = await Player_1.Player.getPlayer(msg.member);
        if (index && indexInt) {
            const scroll = new Scroll_1.Scroll();
            const arenaScroll = new Scroll_1.ArenaScroll();
            const item = [...ApprenticeGear_1.ApprenticeGear.all, scroll, arenaScroll][indexInt - 1];
            if (!item)
                return msg.channel.send('Item does not exist');
            const count = player.inventory.all.count(item.id);
            const isEquipped = player.equippedGears.get(item.id);
            const embed = item.show(count + (isEquipped ? 1 : 0));
            const menu = new ButtonHandler_1.ButtonHandler(msg, embed, player.id);
            // only show if player does not have the item
            if (!isEquipped && count === 0 && item instanceof Gear_1.Gear) {
                menu.addButton(utils_1.BLUE_BUTTON, 'buy item', async () => {
                    if (player.coins < item.price) {
                        return msg.channel.send('Insufficient amount of coins');
                    }
                    player.addCoin(-item.price);
                    const inventoryID = await (0, inventory_1.addInventory)(player.id, item.id);
                    (0, gear_1.addGear)(inventoryID);
                    msg.channel.send(`Successfully purchased **${item.name}**!`);
                });
            }
            else if (item instanceof Scroll_1.Scroll) {
                const buyMany = (count) => async () => {
                    const totalPrice = item.price * count;
                    if (player.coins < totalPrice) {
                        return msg.channel.send('Insufficient amount of coins');
                    }
                    await player.addCoin(-totalPrice);
                    await (0, inventory_1.addInventory)(player.id, item.id, count);
                    msg.channel.send(`Successfully purchased **x${count} ${item.name}**!`);
                };
                menu.addButton(utils_1.BLUE_BUTTON, 'buy 1 scroll', buyMany(1));
                menu.addButton(utils_1.RED_BUTTON, 'buy 10 scrolls', buyMany(10));
                menu.addButton(utils_1.WHITE_BUTTON, 'buy 100 scrolls', buyMany(100));
            }
            menu.addButton(utils_1.RETURN_BUTTON, 'return back to menu', () => {
                this.exec(msg, []);
            });
            menu.addCloseButton();
            menu.run();
            return;
        }
        const items = ApprenticeGear_1.ApprenticeGear.all;
        let list = items
            .map((x, i) => `${i + 1}. ${x.name} \`${x.description}\` | \`${x.price}\``)
            .join('\n');
        const scroll = new Scroll_1.Scroll();
        const arenaScroll = new Scroll_1.ArenaScroll();
        list += `\n\n12. ${scroll.name} | \`${scroll.price}\``;
        list += `\n13. ${arenaScroll.name} | \`${arenaScroll.price}\``;
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle('Coin Shop')
            .setDescription((0, common_tags_1.oneLine) `Apprentice full set bonus reflects 10%/30%/50% of
        opponents first hit (Full set +0, +5 or +10)`)
            .addField('---', list)
            .addField('\u200b', (0, common_tags_1.stripIndents) `
        Current coins: \`${player.coins}\`
        You can inspect an item by using \`${main_1.client.prefix}coinshop <number>\``);
        msg.channel.send(embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29pblNob3AuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvQ29pblNob3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSw2Q0FBb0Q7QUFDcEQsMkNBQW1EO0FBQ25ELHFDQUFxQztBQUNyQywrQ0FBK0M7QUFDL0MsOERBQTJEO0FBQzNELDRDQUF5QztBQUN6QyxnREFBNkM7QUFDN0MsZ0RBQTBEO0FBQzFELDhDQUU0QjtBQUM1QixrQ0FBaUM7QUFDakMsZ0VBQTZEO0FBQzdELG1FQUEyQztBQUUzQyxlQUFxQixTQUFRLGlCQUFPO0lBQXBDOztRQUNFLFNBQUksR0FBRyxVQUFVLENBQUM7UUFFbEIsWUFBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7SUF1RnBCLENBQUM7SUFyRkMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFZLEVBQUUsSUFBYztRQUNyQyxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLE1BQU0sZUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTyxDQUFDLENBQUM7UUFFbkQsSUFBSSxLQUFLLElBQUksUUFBUSxFQUFFO1lBQ3JCLE1BQU0sTUFBTSxHQUFHLElBQUksZUFBTSxFQUFFLENBQUM7WUFDNUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxvQkFBVyxFQUFFLENBQUM7WUFDdEMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxHQUFHLCtCQUFjLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDeEUsSUFBSSxDQUFDLElBQUk7Z0JBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1lBRTFELE1BQU0sS0FBSyxHQUFH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