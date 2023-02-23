"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const gear_1 = require("../db/gear");
const gem_1 = require("../db/gem");
const inventory_1 = require("../db/inventory");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Chest_1 = require("../internals/Chest");
const Command_1 = __importDefault(require("../internals/Command"));
const Fragment_1 = require("../internals/Fragment");
const Gear_1 = require("../internals/Gear");
const List_1 = require("../internals/List");
const Mining_1 = require("../internals/Mining");
const multipleUpgrade_1 = require("../internals/multipleUpgrade");
const Pet_1 = require("../internals/Pet");
const Player_1 = require("../internals/Player");
const Reward_1 = require("../internals/Reward");
const SquadBattle_1 = require("../internals/SquadBattle");
const utils_1 = require("../internals/utils");
const main_1 = require("../main");
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'inventory';
        this.aliases = ['inv'];
    }
    async exec(msg, args) {
        const player = await Player_1.Player.getPlayer(msg.member);
        const inv = player.inventory;
        this.inventory = inv;
        const itemsList = [
            ...inv.chests.aggregate(),
            ...inv.fragments.aggregate(),
            ...inv.gears.aggregate(),
            ...inv.picks.aggregate(),
            ...inv.stones.aggregate(),
            ...inv.gems.aggregateBy((x) => x.quality),
            ...inv.scrolls.aggregate(),
        ];
        const rewards = [...inv.rewards.aggregate(),];
        const [index] = args;
        if (index) {
            const i = parseInt(index) - 1;
            if (Number.isNaN(i))
                return msg.channel.send('Please give valid index');
            const accItem = itemsList[i];
            if (!accItem)
                return msg.channel.send(`No item found at index ${index}`);
            const item = inv.all.get(accItem.value.id);
            const itemCount = accItem.count;
            if (item instanceof Fragment_1.Fragment) {
                const pet = player.pets.get(item.pet.id);
                if (pet) {
                    item.pet = pet;
                }
            }
            let button = new ButtonHandler_1.ButtonHandler(msg, item.show(itemCount), player.id);
            // attach handlers to every types of item
            if (item instanceof Chest_1.Chest) {
                this.handleChest(button, item, player, msg);
            }
            else if (item instanceof Fragment_1.Fragment) {
                this.handleFragment(button, item, player, msg);
            }
            else if (item instanceof Gear_1.Gear) {
                const scrollCount = player.inventory.all.count(item.scroll.id);
                button = new ButtonHandler_1.ButtonHandler(msg, item.inspect(scrollCount), player.id);
                this.handleGear(button, item, player, msg);
            }
            else if (item instanceof Mining_1.MiningPick) {
                this.handlePick(button, item, player, msg);
            }
            else if (item instanceof Mining_1.Gem) {
                this.handleGem(item, msg);
                return;
            }
            else if (item instanceof Mining_1.RoughStone) {
                this.handleStone(button, item, player, msg);
            }
            button.addButton(utils_1.RETURN_BUTTON, 'return to inventory list', () => {
                this.exec(msg, []);
            });
            button.addCloseButton();
            await button.run();
            return;
        }
        const chestList = [];
        const fragmentList = [];
        const gearList = [];
        const rewardList = [];
        const stoneList = [];
        const pickList = [];
        const othersList = [];
        let i = 1;
        for (const { value: item, count } of itemsList) {
            let line = `${i}. \`x${count} ${item.name}\``;
            switch (true) {
                case item instanceof Chest_1.Chest:
                    chestList.push(line);
                    break;
                case item instanceof Fragment_1.Fragment:
                    fragmentList.push(line);
                    break;
                case item instanceof Gear_1.Gear:
                    line = `${i}. \`x${count} ${item.name} Lvl ${item.level}\``;
                    gearList.push(line);
                    break;
                case item instanceof Mining_1.RoughStone:
                    stoneList.push(line);
                    break;
                case item instanceof Mining_1.Gem:
                    {
                        const rarity = (0, utils_1.capitalize)(item.quality);
                        line = `${i}. \`x${count} ${rarity} Gem\``;
                        stoneList.push(line);
                    }
                    break;
                case item instanceof Mining_1.MiningPick:
                    pickList.push(line);
                    break;
                default:
                    othersList.push(line);
            }
            i++;
        }
        for (const { value: item, count } of rewards) {
            let line = `${i}. \`x${count} ${item.name}\``;
            switch (true) {
                case item instanceof Reward_1.Reward:
                    line = `\`x${count} ${item.name} (Level ${SquadBattle_1.bosses.findIndex(boss => boss.name === item.boss) + 1})\``;
                    rewardList.push(line);
                    break;
            }
            i++;
        }
        const list = (0, common_tags_1.stripIndents) `
    **Treasure Chests**
    ${(0, utils_1.toList)(chestList)}

    **Pet Fragments**
    ${(0, utils_1.toList)(fragmentList)}

    **Gear**
    ${(0, utils_1.toList)(gearList)}
    
    **Rewards**
    ${(0, utils_1.toList)(rewardList)}`;
        const list2 = (0, common_tags_1.stripIndents) `
      ** Gems and Mining Equipment **
        ${(0, utils_1.toList)([...pickList, ...stoneList])}

    ** Other Materials **
      ${(0, utils_1.toList)(othersList)}

    ** Coins **
    \`${player.coins}\` Coins
    \`${player.arenaCoins}\` Arena Coins
    `;
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .addField('Inventory', list);
        const embed2 = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GOLD)
            .addField('\u200b', list2)
            .addField('\u200b', (0, common_tags_1.stripIndents) `
        Use command \`${main_1.client.prefix}inventory <number>\` to inspect item in the inventory.
        Use command \`${main_1.client.prefix}gear\` to see your current equipped gear.
        `);
        await msg.channel.send(embed);
        await msg.channel.send(embed2);
    }
    async handleGem(item, msg) {
        const { quality, attribute } = item;
        const gems = this.inventory.gems.filter((x) => x.quality === quality);
        const gemList = List_1.List.from(gems).aggregate();
        let i = 0;
        for (const { value: gem, count } of gemList) {
            i++;
            const info = gem.inspect(count, i);
            await msg.channel.send(info);
        }
        let descText = (0, common_tags_1.oneLine) `You can combine 5 ${quality} gems into a random
    higher quality gem. To combine, use command \`${main_1.client.prefix}combine
    ${quality} <number> <number> <number> <number> <number>\``;
        descText
            += `\nExample command: \`${main_1.client.prefix}combine ${quality} 1 1 2 2 3\``;
        const legendary = new Mining_1.Legendary(attribute);
        if (quality === legendary.quality) {
            descText = (0, common_tags_1.oneLine) `You can combine 3 legendary gems into a legendary gem
      of choice. To combine, use command \`${main_1.client.prefix}combine legendary
      <number> <number> <number>\``;
            descText
                += `\nExample command: \`${main_1.client.prefix}combine legendary 1 1 2\``;
        }
        const helperText1 = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setDescription(descText);
        const helperText2 = new discord_js_1.MessageEmbed(helperText1)
            .setDescription((0, common_tags_1.oneLine) `You can socket a gem in your equipped helmet, chest piece or
      pants. You can do this by using the command: \`${main_1.client.prefix}socket
      ${quality} <number>\``);
        await msg.channel.send(helperText1);
        await msg.channel.send(helperText2);
    }
    handlePick(button, item, player, msg) {
        const mineHandler = async () => {
            const gem = Mining_1.Stone.random();
            const miningMsg = await msg.channel.send(item.showMiningAnimation());
            await (0, utils_1.sleep)(4000);
            await (0, gem_1.addGem)(player.id, gem.id);
            await (0, inventory_1.removeInventory)(player.id, item.id);
            miningMsg.edit(`You obtained ${(0, utils_1.bold)(gem.name)}!`);
            const gemShow = new discord_js_1.MessageEmbed(gem.show(-1));
            const newDesc = (0, common_tags_1.oneLine) `${gemShow.description} You can do this by
      inspecting a group of gems in your inventory.`;
            gemShow.setDescription(newDesc);
            msg.channel.send(gem.show(-1));
        };
        const itemCount = player.inventory.all.count(item.id);
        const multiMine = (count) => async () => {
            if (itemCount < count) {
                msg.channel.send('Insufficient mining pick');
                return;
            }
            const safeFnID = `handle_pick_${count}_${player.id}`;
            main_1.client.safeFn.add(safeFnID, mineHandler);
            try {
                for (let i = 0; i < count; i++) {
                    await main_1.client.safeFn.exec(safeFnID);
                }
            }
            catch {
                msg.channel.send('There is already instance of mining command running');
            }
        };
        const pickCount = player.inventory.all.count(item.id);
        button.addButton(utils_1.BLUE_BUTTON, 'mine', multiMine(1));
        button.addButton(utils_1.RED_BUTTON, 'mine 5', multiMine(5));
        button.addButton(utils_1.WHITE_BUTTON, 'mine 10', multiMine(10));
        button.addButton(utils_1.ATTOM_BUTTON, 'use all picks', multiMine(pickCount));
    }
    handleChest(button, item, player, msg) {
        button.addButton(utils_1.BLUE_BUTTON, 'use the item', async () => {
            const result = await item.use(player);
            await player.sync();
            const chestOpening = await msg.channel.send(item.openChestAnimation());
            await (0, utils_1.sleep)(6000);
            await chestOpening.delete();
            const cards = [];
            const aggregated = (0, utils_1.aggregateBy)(result, (x) => x.id);
            const fragment = Object.entries(aggregated)
                .map(([id, count]) => {
                const fragment = new Fragment_1.Fragment(id);
                const ownedPet = player.pets.get(fragment.pet.id);
                const pet = ownedPet || fragment.pet;
                const ownedFragmentCount = player.inventory.all.count(id);
                cards.push(pet.fragmentCard(ownedFragmentCount));
                return `\`x${count}\` **${fragment.name}**`;
            })
                .join(' ');
            msg.channel.send(`You got ${fragment}!`);
            cards.forEach((x) => msg.channel.send(x));
        });
    }
    handleStone(button, item, player, msg) {
        button.addButton(utils_1.BLUE_BUTTON, 'combine 12 rough stones', async () => {
            const gem = item;
            // check for gem upgrade requirement
            const count = player.inventory.all.count(gem.id);
            if (count < gem.requirement) {
                const errMsg = (0, common_tags_1.oneLine) `${gem.requirement} Rough Stones are required to
        upgrade to 1 ${(0, utils_1.capitalize)(gem.product.quality)} Gem`;
                msg.channel.send(errMsg);
                return;
            }
            await (0, inventory_1.removeInventory)(player.id, gem.id, gem.requirement);
            const combineAnimation = gem.showCombineAnimation();
            const animation = await msg.channel.send(combineAnimation);
            await (0, utils_1.sleep)(4000);
            await animation.delete();
            const upgrade = gem.product;
            await (0, gem_1.addGem)(player.id, upgrade.id);
            await msg.channel.send(`You obtained ${upgrade.name}!`);
            await msg.channel.send(upgrade.show(-1));
        });
    }
    handleFragment(button, item, player, msg) {
        const ownedPet = player.pets.get(item.pet.id);
        if (!ownedPet || ownedPet.star < 5) {
            button.addButton(utils_1.BLUE_BUTTON, 'use the item', async () => {
                const { pet } = item;
                const ownedFragmentCount = this.inventory.all.count(item.id);
                let ownedPet = player.pets.get(pet.id);
                // if own the pet but does not have enough fragment to upgrade
                if (ownedPet && ownedFragmentCount < ownedPet.upgradeCost) {
                    return msg.channel.send((0, common_tags_1.oneLine) `Insufficient fragments to upgrade
                                  ${ownedPet.name} \`${ownedFragmentCount}/${ownedPet.upgradeCost}\``);
                    // if player does not own the pet but has less fragments than required
                    // fragment in order to obtain the pet
                }
                if (ownedFragmentCount < Fragment_1.Fragment.minFragments) {
                    return msg.channel.send((0, common_tags_1.oneLine) `Insufficient fragments to summon
                                  ${pet.name} \`${ownedFragmentCount}/${Fragment_1.Fragment.minFragments}\``);
                }
                if (ownedPet && ownedPet.star >= 5) {
                    return msg.channel.send('Your pet is already at max star');
                }
                const result = await item.use(player);
                await player.sync();
                ownedPet = player.pets.get(pet.id);
                const fragmentCount = player.inventory.all.count(item.id);
                if (result === 'obtain') {
                    const summonAnimation = await msg.channel.send(item.summonAnimation());
                    await (0, utils_1.sleep)(8000);
                    await summonAnimation.delete();
                    msg.channel.send(`${player.name} has obtained **${pet.name}**!`);
                    msg.channel.send(ownedPet.card(fragmentCount, true));
                }
                else if (result === 'upgrade') {
                    const ownedPet = player.pets.get(pet.id);
                    const upgradeAnimation = await msg.channel.send(item.upgradeAnimation());
                    await (0, utils_1.sleep)(8000);
                    await upgradeAnimation.delete();
                    msg.channel.send(`${pet.name} is now **${ownedPet.star}** ${utils_1.STAR}!`);
                    msg.channel.send(ownedPet.card(fragmentCount, true));
                }
            });
        }
        button.addButton(utils_1.WHITE_BUTTON, 'convert this fragment to other fragment of choice', () => {
            const ownedFragmentCount = this.inventory.all.count(item.id);
            if (ownedFragmentCount < 2) {
                return msg.channel.send('Two fragments needed to convert to another pet fragment');
            }
            const embed = new discord_js_1.MessageEmbed().setColor(utils_1.BROWN).addField('Select which pet fragments you want to convert to', (0, common_tags_1.oneLine) `This will replace \`x2\` or \`x3\` ${item.pet.name}'s fragment with
          the selected fragment depending on the ratio`);
            const choiceButton = new ButtonHandler_1.ButtonHandler(msg, embed, player.id);
            Pet_1.Pet.all.forEach((pet, i) => {
                const isDragon = pet.id === Pet_1.PetID.Dragon;
                const button = utils_1.NUMBER_BUTTONS[i + 1];
                const label = isDragon
                    ? `${pet.fragment.name} - Ratio 3:1`
                    : `${pet.fragment.name} - Ratio 2:1`;
                choiceButton.addButton(button, label, async () => {
                    if (isDragon && ownedFragmentCount < 3) {
                        return msg.channel.send('Dragon requires 3 fragments');
                    }
                    await (0, inventory_1.removeInventory)(player.id, item.id);
                    await (0, inventory_1.removeInventory)(player.id, item.id);
                    if (isDragon) {
                        await (0, inventory_1.removeInventory)(player.id, item.id);
                    }
                    const convertAnimation = item.convertAnimation(pet.fragment.name);
                    const animation = await msg.channel.send(convertAnimation);
                    await (0, utils_1.sleep)(8000);
                    await animation.delete();
                    await (0, inventory_1.addInventory)(player.id, pet.fragment.id);
                    msg.channel.send((0, common_tags_1.oneLine) `
                               Successfully converted \`x${isDragon ? 3 : 2}\` **${item.name}**
                               into \`x1\` **${pet.fragment.name}**!`);
                });
            });
            choiceButton.addCloseButton();
            choiceButton.run();
        });
    }
    handleGear(button, item, player, msg) {
        button.addButton(utils_1.BLUE_BUTTON, 'equip gear', async () => {
            const currentPiece = player.equippedGears.find((x) => x.constructor.name === item.constructor.name);
            // unequip gear if piece is the same for example Arena Armor and
            // Apprentice Armor
            if (currentPiece) {
                await (0, gear_1.unequipGear)(player.id, currentPiece.id);
            }
            await (0, gear_1.equipGear)(player.id, item.id);
            msg.channel.send(`Successfully equipped **${item.name}**!`);
        });
        if (item.level < 10) {
            button.addButton(utils_1.WHITE_BUTTON, 'upgrade item using 1 scroll', (0, multipleUpgrade_1.upgrade)(item, msg, player, 1));
            button.addButton(utils_1.RED_BUTTON, 'upgrade item using 10 scroll', (0, multipleUpgrade_1.upgrade)(item, msg, player, 10));
            button.addButton(utils_1.BLACK_BUTTON, 'upgrade item using 50 scrolls', (0, multipleUpgrade_1.upgrade)(item, msg, player, 50));
        }
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL0ludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUFvRDtBQUNwRCwyQ0FBbUQ7QUFDbkQscUNBQW9EO0FBQ3BELG1DQUFtQztBQUNuQywrQ0FBZ0U7QUFDaEUsOERBQTJEO0FBQzNELDhDQUEyQztBQUMzQyxtRUFBMkM7QUFDM0Msb0RBQTZEO0FBQzdELDRDQUF5QztBQUV6Qyw0Q0FBeUM7QUFDekMsZ0RBRTZCO0FBQzdCLGtFQUF1RDtBQUN2RCwwQ0FBOEM7QUFDOUMsZ0RBQTZDO0FBQzdDLGdEQUE2QztBQUM3QywwREFBa0Q7QUFDbEQsOENBZ0I0QjtBQUM1QixrQ0FBaUM7QUFFakMsZUFBcUIsU0FBUSxpQkFBTztJQUFwQzs7UUFDRSxTQUFJLEdBQUcsV0FBVyxDQUFDO1FBRW5CLFlBQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBZ2ZwQixDQUFDO0lBNWVDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLElBQWM7UUFDckMsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUMsQ0FBQztRQUNuRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDO1FBRXJCLE1BQU0sU0FBUyxHQUFHO1lBQ2hCLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDekIsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRTtZQUM1QixHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFO1lBQ3hCLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUU7WUFDeEIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRTtZQUN6QixHQUFH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