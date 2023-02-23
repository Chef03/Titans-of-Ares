"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const gear_1 = require("../db/gear");
const inventory_1 = require("../db/inventory");
const ArenaGear_1 = require("../internals/ArenaGear");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Command_1 = __importDefault(require("../internals/Command"));
const Fragment_1 = require("../internals/Fragment");
const Gear_1 = require("../internals/Gear");
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'arenashop';
        this.aliases = ['ash'];
    }
    async exec(msg, args) {
        const index = args[0];
        const indexInt = parseInt(index);
        const player = await Player_1.Player.getPlayer(msg.member);
        const fragments = Fragment_1.Fragment.all;
        const items = [...ArenaGear_1.ArenaGear.all, ...Fragment_1.Fragment.all];
        if (index && indexInt) {
            const item = items[indexInt - 1];
            if (!item)
                return msg.channel.send('Item does not exist');
            const count = player.inventory.all.count(item.id);
            const isEquipped = player.equippedGears.get(item.id);
            let embed = item.show(count + (isEquipped ? 1 : 0));
            if (item instanceof Fragment_1.Fragment) {
                embed = item.show(count, { price: true });
            }
            const menu = new ButtonHandler_1.ButtonHandler(msg, embed, player.id);
            // only show if player does not have the item
            if (!isEquipped && count === 0 && item instanceof Gear_1.Gear) {
                menu.addButton(utils_1.BLUE_BUTTON, 'buy item', async () => {
                    if (player.arenaCoins < item.price) {
                        return msg.channel.send('Insufficient amount of arena coins');
                    }
                    player.addArenaCoin(-item.price);
                    const inventoryID = await (0, inventory_1.addInventory)(player.id, item.id);
                    (0, gear_1.addGear)(inventoryID);
                    msg.channel.send(`Successfully purchased **${item.name}**!`);
                });
            }
            else if (item instanceof Fragment_1.Fragment) {
                const buyMany = (count) => async () => {
                    const totalPrice = item.price * count;
                    if (player.arenaCoins < totalPrice) {
                        return msg.channel.send('Insufficient amount of coins');
                    }
                    await player.addArenaCoin(-totalPrice);
                    await (0, inventory_1.addInventory)(player.id, item.id, count);
                    msg.channel.send(`Successfully purchased **x${count} ${item.name}**!`);
                };
                menu.addButton(utils_1.BLUE_BUTTON, 'buy 1 fragment', buyMany(1));
                menu.addButton(utils_1.RED_BUTTON, 'buy 5 fragments', buyMany(5));
                menu.addButton(utils_1.WHITE_BUTTON, 'buy 10 fragments', buyMany(10));
            }
            menu.addButton(utils_1.RETURN_BUTTON, 'return back to menu', () => {
                this.exec(msg, []);
            });
            menu.addCloseButton();
            menu.run();
            return;
        }
        let list = ArenaGear_1.ArenaGear.all
            .map((x, i) => `${i + 1}. ${x.name} \`${x.description}\` | \`${x.price}\``)
            .join('\n');
        list += '\n';
        let i = 12;
        for (const fragment of fragments) {
            list += `\n${i}. ${fragment.name} | \`${fragment.price}\``;
            i++;
        }
        const description = (0, common_tags_1.oneLine) `Arena full set bonus penetrates +20%/40%/60% of
                    armor (Full set +0, +5 or +10)`;
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle('Arena Shop')
            .setDescription(description)
            .addField('---', list)
            .addField('\u200b', (0, common_tags_1.stripIndents) `
      Current arena coins: \`${player.arenaCoins}\`
      You can inspect an item by using \`${main_1.client.prefix}arenashop <number>\``);
        msg.channel.send(embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXJlbmFTaG9wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL0FyZW5hU2hvcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFvRDtBQUNwRCwyQ0FBbUQ7QUFDbkQscUNBQXFDO0FBQ3JDLCtDQUErQztBQUMvQyxzREFBbUQ7QUFDbkQsOERBQTJEO0FBQzNELG1FQUEyQztBQUMzQyxvREFBaUQ7QUFDakQsNENBQXlDO0FBQ3pDLGdEQUE2QztBQUM3Qyw4Q0FFNEI7QUFDNUIsa0NBQWlDO0FBRWpDLGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0UsU0FBSSxHQUFHLFdBQVcsQ0FBQztRQUVuQixZQUFPLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQThGcEIsQ0FBQztJQTVGQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxJQUFjO1FBQ3JDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakMsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUMsQ0FBQztRQUNuRCxNQUFNLFNBQVMsR0FBRyxtQkFBUSxDQUFDLEdBQUcsQ0FBQztRQUMvQixNQUFNLEtBQUssR0FBRyxDQUFDLEdBQUcscUJBQVMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxtQkFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWxELElBQUksS0FBSyxJQUFJLFFBQVEsRUFBRTtZQUNyQixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUUxRCxNQUFNLEtBQUssR0FBRyxN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