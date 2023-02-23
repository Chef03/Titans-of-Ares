"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const Command_1 = __importDefault(require("../internals/Command"));
const Mining_1 = require("../internals/Mining");
const Pagination_1 = require("../internals/Pagination");
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'gemcrafting';
        this.aliases = ['gc'];
    }
    async exec(msg, args) {
        const player = await Player_1.Player.getPlayer(msg.member);
        const itemList = player.inventory.stones.aggregate();
        const [index] = args;
        if (index === 'all' && main_1.client.isDev) {
            this.showAll(player, msg);
            return;
        }
        if (index) {
            const i = parseInt(index) - 1;
            if (Number.isNaN(i))
                return msg.channel.send('Please give valid index');
            const accItem = itemList[i];
            if (!accItem)
                return msg.channel.send(`No item found at index ${index}`);
            const stone = player.inventory.stones.get(accItem.value.id);
            this.inspect(stone, player, msg);
            return;
        }
        const displayList = (0, utils_1.toNList)(itemList.map((x) => `${x.value.name} \`x${x.count}\``));
        const embed = new discord_js_1.MessageEmbed()
            .setTitle('Gem Crafting')
            .setColor(utils_1.BROWN)
            .addField('---', displayList);
        msg.channel.send(embed);
    }
    showAll(player, msg) {
        const stones = Mining_1.Stone.all.map((x) => x.show(0));
        const pagination = new Pagination_1.Pagination(msg, stones, player.id);
        pagination.run();
    }
    inspect(gem, player, msg) {
        const sameRarityGemCount = player.inventory.stones.countBy((x) => x.rarity === gem.rarity);
        const gemCount = player.inventory.stones.count(gem.id);
        const gemInfo = gem.inspect(gemCount, sameRarityGemCount);
        msg.channel.send(gemInfo);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2VtQ3JhZnRpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvR2VtQ3JhZnRpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyQ0FBbUQ7QUFDbkQsbUVBQTJDO0FBQzNDLGdEQUE0QztBQUM1Qyx3REFBcUQ7QUFDckQsZ0RBQTZDO0FBQzdDLDhDQUFvRDtBQUNwRCxrQ0FBaUM7QUFFakMsZUFBcUIsU0FBUSxpQkFBTztJQUFwQzs7UUFDRSxTQUFJLEdBQUcsYUFBYSxDQUFDO1FBRXJCLFlBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBNkNuQixDQUFDO0lBM0NDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLElBQWM7UUFDckMsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUMsQ0FBQztRQUNuRCxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUVyRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksS0FBSyxLQUFLLEtBQUssSUFBSSxhQUFNLENBQUMsS0FBSyxFQUFFO1lBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzFCLE9BQU87U0FDUjtRQUFDLElBQUksS0FBSyxFQUFFO1lBQ1gsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUV4RSxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLE9BQU87Z0JBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsS0FBSyxFQUFFLENBQUMsQ0FBQztZQUV6RSxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUUsQ0FBQztZQUM3RCxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDakMsT0FBTztTQUNSO1FBRUQsTUFBTSxXQUFXLEdBQUcsSUFBQSxlQUFPLEVBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBRXBGLE1BQU0sS0FBSyxHQUFHLElBQUkseUJBQVksRUFBRTthQUM3QixRQUFRLENBQUMsY0FBYyxDQUFDO2FBQ3hCLFFBQVEsQ0FBQyxhQUFLLENBQUM7YUFDZixRQUFRLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRWhDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFTyxPQUFPLENBQUMsTUFBYyxFQUFFLEdBQVk7UUFDMUMsTUFBTSxNQUFNLEdBQUcsY0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQyxNQUFNLFVBQVUsR0FBRyxJQUFJLHVCQUFVLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFMUQsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFFTyxPQUFPLENBQUMsR0FBVSxFQUFFLE1BQWMsRUFBRSxHQUFZO1FBQ3RELE1BQU0sa0JBQWtCLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzRixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDMUQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUIsQ0FBQztDQUNGO0FBaERELDRCQWdEQyJ9