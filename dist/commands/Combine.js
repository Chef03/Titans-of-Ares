"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const gem_1 = require("../db/gem");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Command_1 = __importDefault(require("../internals/Command"));
const List_1 = require("../internals/List");
const Mining_1 = require("../internals/Mining");
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
class Combine extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'combine';
        this.aliases = ['comb'];
    }
    async exec(msg, args) {
        const [arg1, ...args2] = args;
        const quality = arg1.toLowerCase();
        const indexes = args2.map((x) => parseInt(x));
        if (!Mining_1.Gem.isValidQuality(quality))
            return msg.channel.send('invalid Gem quality');
        if (indexes.some((x) => Number.isNaN(x)))
            return msg.channel.send('invalid index was given');
        if (indexes.length === 0)
            return msg.channel.send('you need to pick gems you want to combine');
        const player = await Player_1.Player.getPlayer(msg.member);
        const gems = player.inventory.gems.filter((x) => x.quality === quality);
        if (gems.length <= 0)
            return msg.channel.send(`You don't have any gem of ${quality} quality`);
        const gemList = List_1.List.from(gems).aggregate();
        const selected = new List_1.List();
        for (const index of indexes) {
            const gem = gemList[index - 1];
            if (!gem) {
                return msg.channel.send(`cannot find gem on index ${index}`);
            }
            selected.push(gem.value);
        }
        const aggregatedSelectedGem = selected.aggregate();
        // check for owned gem quantity
        for (const { value: gem, count } of aggregatedSelectedGem) {
            const ownedGemCount = player.inventory.all.count(gem.id);
            if (count > ownedGemCount) {
                return msg.channel.send('insufficient gem');
            }
        }
        // check for gem upgrade requirement
        const gem = selected.get(0);
        if (selected.length !== gem.requirement) {
            const errMsg = (0, common_tags_1.oneLine) `${gem.requirement} ${(0, utils_1.capitalize)(gem.quality)} Gems
      are required to upgrade to 1 ${(0, utils_1.capitalize)(gem.product.quality)} Gem`;
            msg.channel.send(errMsg);
            return;
        }
        const gemListText = aggregatedSelectedGem
            .map((x) => (0, utils_1.inlineCode)(`${x.count}x ${x.value.name}`))
            .join(', ');
        const confirmationText = `You are about to combine ${gemListText}, do you want to continue?`;
        const embed = new discord_js_1.MessageEmbed()
            .setTitle('Gem Combine')
            .setColor(utils_1.BROWN)
            .setDescription(confirmationText);
        const confirmMenu = new ButtonHandler_1.ButtonHandler(msg, embed, player.id);
        confirmMenu.addButton(utils_1.BLUE_BUTTON, 'yes', async () => {
            const gem = gemList[0].value;
            for (const gem of selected) {
                await (0, gem_1.removeGem)(player.id, gem.id);
            }
            let upgrade = gem.product;
            if (gem instanceof Mining_1.Legendary) {
                const embed = new discord_js_1.MessageEmbed()
                    .setTitle('Legendary Upgrade')
                    .setColor(utils_1.GREEN)
                    .setDescription('Which type of gem you want to cast into?');
                const menu = new ButtonHandler_1.ButtonHandler(msg, embed, player.id);
                for (let i = 0; i < Mining_1.Legendary.all.length; i++) {
                    const gem = Mining_1.Legendary.all.get(i);
                    menu.addButton(utils_1.NUMBER_BUTTONS[i + 1], gem.name, () => {
                        upgrade = gem;
                    });
                }
                await menu.run();
            }
            const combineAnimation = gem.showCombineAnimation();
            const animation = await msg.channel.send(combineAnimation);
            await (0, utils_1.sleep)(6000);
            await animation.delete();
            await (0, gem_1.addGem)(player.id, upgrade.id);
            await msg.channel.send(`You obtained ${(0, utils_1.bold)(upgrade.name)}!`);
            await msg.channel.send(upgrade.show(-1));
        });
        confirmMenu.addCloseButton();
        await confirmMenu.run();
    }
}
exports.default = Combine;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29tYmluZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9Db21iaW5lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsNkNBQXNDO0FBQ3RDLDJDQUFtRDtBQUNuRCxtQ0FBOEM7QUFDOUMsOERBQTJEO0FBQzNELG1FQUEyQztBQUMzQyw0Q0FBeUM7QUFDekMsZ0RBQXFEO0FBQ3JELGdEQUE2QztBQUM3Qyw4Q0FFNEI7QUFFNUIsTUFBcUIsT0FBUSxTQUFRLGlCQUFPO0lBQTVDOztRQUNFLFNBQUksR0FBRyxTQUFTLENBQUM7UUFFakIsWUFBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFvR3JCLENBQUM7SUFsR0MsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFZLEVBQUUsSUFBYztRQUNyQyxNQUFNLENBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzlCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsWUFBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUM7WUFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDakYsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzdGLElBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFD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