"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const main_1 = require("../main");
const gear_1 = require("../db/gear");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Gear_1 = require("../internals/Gear");
const ApprenticeGear_1 = require("../internals/ApprenticeGear");
const multipleUpgrade_1 = require("../internals/multipleUpgrade");
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
const Command_1 = __importDefault(require("../internals/Command"));
const ArenaGear_1 = require("../internals/ArenaGear");
const gem_1 = require("../db/gem");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'gear';
    }
    async exec(msg, args) {
        const player = await Player_1.Player.getPlayer(msg.member);
        const [index] = args;
        const gears = player.equippedGears;
        const gear = gears.get(parseInt(index) - 1);
        if (gear) {
            const scrollCount = player.inventory.all.count(gear.scroll.id);
            const menu = new ButtonHandler_1.ButtonHandler(msg, gear.inspect(scrollCount), player.id);
            menu.addButton(utils_1.BLUE_BUTTON, 'unequip gear', () => {
                (0, gear_1.unequipGear)(player.id, gear.id);
                msg.channel.send(`Successfully unequip **${gear.name}**!`);
                if (gear.gem) {
                    (0, gem_1.desocketGem)(gear.gem.inventoryID);
                    msg.channel.send(`Successfully desocket ${(0, utils_1.bold)(gear.gem.name)}!`);
                }
            });
            if (gear.level < 10) {
                menu.addButton(utils_1.WHITE_BUTTON, 'upgrade item using 1 scroll', (0, multipleUpgrade_1.upgrade)(gear, msg, player, 1));
                menu.addButton(utils_1.RED_BUTTON, 'upgrade item using 10 scrolls', (0, multipleUpgrade_1.upgrade)(gear, msg, player, 10));
                menu.addButton(utils_1.BLACK_BUTTON, 'upgrade item using 50 scrolls', (0, multipleUpgrade_1.upgrade)(gear, msg, player, 50));
            }
            const { gem } = gear;
            if (gem) {
                menu.addButton(utils_1.ATTOM_BUTTON, 'desocket gem', () => {
                    (0, gem_1.desocketGem)(gem.inventoryID);
                    msg.channel.send(`Successfully desocket ${(0, utils_1.bold)(gem.name)}!`);
                });
            }
            menu.addButton(utils_1.RETURN_BUTTON, 'return to menu', () => {
                this.exec(msg, []);
            });
            menu.addCloseButton();
            await menu.run();
            return;
        }
        if (index === 'bonus') {
            // TODO remove code duplication
            let equipped = player.equippedGears.filter((x) => x instanceof ApprenticeGear_1.ApprenticeGear);
            let lvl1 = equipped.length;
            let lvl2 = equipped.filter((x) => x.level >= 5).length;
            let lvl3 = equipped.filter((x) => x.level >= 10).length;
            let active = 0;
            for (const lvl of [lvl1, lvl2, lvl3]) {
                if (lvl === 11) {
                    active++;
                }
            }
            const apprenticeBonus = (0, common_tags_1.stripIndents) `
      Full Apprentice Set +0  | 10% reflect | \`${lvl1}/11\` ${active === 1 ? 'Active' : ''}
      Full Apprentice Set +5  | 30% reflect | \`${lvl2}/11\` ${active === 2 ? 'Active' : ''}
      Full Apprentice Set +10 | 50% reflect | \`${lvl3}/11\` ${active === 3 ? 'Active' : ''}`;
            equipped = player.equippedGears.filter((x) => x instanceof ArenaGear_1.ArenaGear);
            lvl1 = equipped.length;
            lvl2 = equipped.filter((x) => x.level >= 5).length;
            lvl3 = equipped.filter((x) => x.level >= 10).length;
            active = 0;
            for (const lvl of [lvl1, lvl2, lvl3]) {
                if (lvl === 11) {
                    active++;
                }
            }
            const arenaBonus = (0, common_tags_1.stripIndents) `
      Full Arena Set +0  | +20% armor penetration | \`${lvl1}/11\` ${active === 1 ? 'Active' : ''}
      Full Arena Set +5  | +40% armor penetration | \`${lvl2}/11\` ${active === 2 ? 'Active' : ''}
      Full Arena Set +10 | +60% armor penetration | \`${lvl3}/11\` ${active === 3 ? 'Active' : ''}`;
            const embed = new discord_js_1.MessageEmbed()
                .setColor(utils_1.SILVER)
                .addField('Apprentice Set Reflect Skill', apprenticeBonus)
                .addField('Arena Set Penetrate Skill', arenaBonus);
            msg.channel.send(embed);
            return;
        }
        const list = gears
            .map((gear, i) => {
            const socketable = gear.socketable ? `${Gear_1.Gear.socketEmoji} ` : '';
            const socketed = gear.gem
                ? `${gear.gem.name} ${gear.gem.stat}` : 'No gem socketed';
            const socket = gear.socketable
                ? `\n${socketable}${socketed}` : '';
            const stat = gear.attribute.format(gear.attributeValue, { suffix: true, prefix: true });
            return `${i + 1}. \`Lvl ${gear.level} ${gear.name} ${stat} ${socket}\``;
        })
            .join('\n');
        const setBonus = Gear_1.Gear.getBonus(player.equippedGears);
        const armorBonusSetDesc = setBonus?.description || 'None';
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.SILVER)
            .setDescription('Showing all current equipped gear')
            .setTitle('Gear')
            .addField('\u200b', list || 'none')
            .addField('Total stats from gear', player.gearStat || 'none')
            .addField('Apprentice Set Reflect Skill', `Current active set bonus: ${armorBonusSetDesc}`)
            .addField('---', (0, common_tags_1.stripIndents) `
        Use \`${main_1.client.prefix}gear bonus\` to see more info about the set bonus
        Use \`${main_1.client.prefix}gear <number>\` to inspect and upgrade item
        To socket gems into gear pieces, inspect gems in the \`${main_1.client.prefix}inventory\``);
        msg.channel.send(embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2Vhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21tYW5kcy9HZWFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkNBQW1EO0FBQ25ELDZDQUEyQztBQUMzQyxrQ0FBaUM7QUFDakMscUNBQXlDO0FBQ3pDLDhEQUEyRDtBQUMzRCw0Q0FBeUM7QUFDekMsZ0VBQTZEO0FBQzdELGtFQUF1RDtBQUN2RCxnREFBNkM7QUFDN0MsOENBRTRCO0FBQzVCLG1FQUEyQztBQUMzQyxzREFBbUQ7QUFDbkQsbUNBQXdDO0FBRXhDLGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0UsU0FBSSxHQUFHLE1BQU0sQ0FBQztJQTZJaEIsQ0FBQztJQTNJQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxJQUFjO1FBQ3JDLE1BQU0sTUFBTSxHQUFHLE1BQU0sZUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTyxDQUFDLENBQUM7UUFFbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNyQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsYUFBYSxDQUFDO1FBQ25DLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTVDLElBQUksSUFBSSxFQUFFO1lBQ1IsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDL0QsTUFBTSxJQUFJLEdBQUcsSUFBSSw2QkFBYSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUUxRSxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFXLEVBQUUsY0FBYyxFQUFFLEdBQUcs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