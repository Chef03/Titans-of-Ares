import { oneLine, stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { equipGear, unequipGear } from '../db/gear';
import { addGem } from '../db/gem';
import { addInventory, removeInventory } from '../db/inventory';
import { ButtonHandler } from '../internals/ButtonHandler';
import { Chest } from '../internals/Chest';
import Command from '../internals/Command';
import { Fragment, FragmentID } from '../internals/Fragment';
import { Gear } from '../internals/Gear';
import { Inventory } from '../internals/Inventory';
import { List } from '../internals/List';
import {
  Gem, Legendary, MiningPick, RoughStone, Stone,
} from '../internals/Mining';
import { upgrade } from '../internals/multipleUpgrade';
import { Pet, PetID } from '../internals/Pet';
import { Player } from '../internals/Player';
import { Reward } from '../internals/Reward';
import { bosses } from '../internals/SquadBattle';
import {
  aggregateBy,
  ATTOM_BUTTON,
  BLACK_BUTTON,
  BLUE_BUTTON,
  bold,
  BROWN,
  capitalize,
  GOLD,
  NUMBER_BUTTONS,
  RED_BUTTON,
  RETURN_BUTTON,
  sleep,
  STAR,
  toList,
  WHITE_BUTTON,
} from '../internals/utils';
import { client } from '../main';

export default class extends Command {
  name = 'inventory';

  aliases = ['inv'];

  private inventory!: Inventory;

  async exec(msg: Message, args: string[]) {
    const player = await Player.getPlayer(msg.member!);
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


    const rewards = [...inv.rewards.aggregate(),]

    const [index] = args;

    if (index) {
      const i = parseInt(index) - 1;
      if (Number.isNaN(i)) return msg.channel.send('Please give valid index');

      const accItem = itemsList[i];

      if (!accItem) return msg.channel.send(`No item found at index ${index}`);

      const item = inv.all.get(accItem.value.id)!;
      const itemCount = accItem.count;

      if (item instanceof Fragment) {
        const pet = player.pets.get(item.pet.id);
        if (pet) {
          item.pet = pet;
        }
      }

      let button = new ButtonHandler(msg, item.show(itemCount), player.id);

      // attach handlers to every types of item
      if (item instanceof Chest) {
        this.handleChest(button, item, player, msg);
      } else if (item instanceof Fragment) {
        this.handleFragment(button, item, player, msg);
      } else if (item instanceof Gear) {
        const scrollCount = player.inventory.all.count(item.scroll.id);
        button = new ButtonHandler(msg, item.inspect(scrollCount), player.id);

        this.handleGear(button, item, player, msg);
      } else if (item instanceof MiningPick) {
        this.handlePick(button, item, player, msg);
      } else if (item instanceof Gem) {
        this.handleGem(item, msg);
        return;
      } else if (item instanceof RoughStone) {
        this.handleStone(button, item, player, msg);
      }

      button.addButton(RETURN_BUTTON, 'return to inventory list', () => {
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
        case item instanceof Chest:
          chestList.push(line);
          break;
        case item instanceof Fragment:
          fragmentList.push(line);
          break;
        case item instanceof Gear:
          line = `${i}. \`x${count} ${item.name} Lvl ${(item as Gear).level}\``;
          gearList.push(line);
          break;




        case item instanceof RoughStone:
          stoneList.push(line);
          break;
        case item instanceof Gem: {
          const rarity = capitalize((item as Gem).quality);
          line = `${i}. \`x${count} ${rarity} Gem\``;
          stoneList.push(line);
        }
          break;
        case item instanceof MiningPick:
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

        case item instanceof Reward:
          line = `\`x${count} ${item.name} (Level ${bosses.findIndex(boss => boss.name === item.boss) + 1})\``;
          rewardList.push(line);
          break;


      }
      i++;
    }



    const list = stripIndents`
    **Treasure Chests**
    ${toList(chestList)}

    **Pet Fragments**
    ${toList(fragmentList)}

    **Gear**
    ${toList(gearList)}
    
    **Rewards**
    ${toList(rewardList)}`;




    const list2 = stripIndents`
      ** Gems and Mining Equipment **
        ${toList([...pickList, ...stoneList])}

    ** Other Materials **
      ${toList(othersList)}

    ** Coins **
    \`${player.coins}\` Coins
    \`${player.arenaCoins}\` Arena Coins
    `;

    const embed = new MessageEmbed()
      .setColor(GOLD)
      .addField('Inventory', list);

    const embed2 = new MessageEmbed()
      .setColor(GOLD)
      .addField('\u200b', list2)
      .addField(
        '\u200b',
        stripIndents`
        Use command \`${client.prefix}inventory <number>\` to inspect item in the inventory.
        Use command \`${client.prefix}gear\` to see your current equipped gear.
        `,
      );

    await msg.channel.send(embed);
    await msg.channel.send(embed2);
  }

  private async handleGem(
    item: Gem,
    msg: Message,
  ) {
    const { quality, attribute } = item;
    const gems = this.inventory.gems.filter((x) => x.quality === quality);
    const gemList = List.from(gems).aggregate();

    let i = 0;
    for (const { value: gem, count } of gemList) {
      i++;
      const info = gem.inspect(count, i);
      await msg.channel.send(info);
    }

    let descText = oneLine`You can combine 5 ${quality} gems into a random
    higher quality gem. To combine, use command \`${client.prefix}combine
    ${quality} <number> <number> <number> <number> <number>\``;

    descText
      += `\nExample command: \`${client.prefix}combine ${quality} 1 1 2 2 3\``;

    const legendary = new Legendary(attribute);

    if (quality === legendary.quality) {
      descText = oneLine`You can combine 3 legendary gems into a legendary gem
      of choice. To combine, use command \`${client.prefix}combine legendary
      <number> <number> <number>\``;

      descText
        += `\nExample command: \`${client.prefix}combine legendary 1 1 2\``;
    }

    const helperText1 = new MessageEmbed()
      .setColor(BROWN)
      .setDescription(descText);

    const helperText2 = new MessageEmbed(helperText1)
      .setDescription(
        oneLine`You can socket a gem in your equipped helmet, chest piece or
      pants. You can do this by using the command: \`${client.prefix}socket
      ${quality} <number>\``,
      );

    await msg.channel.send(helperText1);
    await msg.channel.send(helperText2);
  }

  handlePick(
    button: ButtonHandler,
    item: MiningPick,
    player: Player,
    msg: Message,
  ) {
    const mineHandler = async () => {
      const gem = Stone.random();
      const miningMsg = await msg.channel.send(item.showMiningAnimation());
      await sleep(4000);

      await addGem(player.id, gem.id);
      await removeInventory(player.id, item.id);

      miningMsg.edit(`You obtained ${bold(gem.name)}!`);
      const gemShow = new MessageEmbed(gem.show(-1));

      const newDesc = oneLine`${gemShow.description} You can do this by
      inspecting a group of gems in your inventory.`;

      gemShow.setDescription(newDesc);
      msg.channel.send(gem.show(-1));
    };

    const itemCount = player.inventory.all.count(item.id);
    const multiMine = (count: number) => async () => {
      if (itemCount < count) {
        msg.channel.send('Insufficient mining pick');
        return;
      }

      const safeFnID = `handle_pick_${count}_${player.id}`;
      client.safeFn.add(safeFnID, mineHandler);

      try {
        for (let i = 0; i < count; i++) {
          await client.safeFn.exec(safeFnID);
        }
      } catch {
        msg.channel.send('There is already instance of mining command running');
      }
    };

    const pickCount = player.inventory.all.count(item.id);

    button.addButton(BLUE_BUTTON, 'mine', multiMine(1));
    button.addButton(RED_BUTTON, 'mine 5', multiMine(5));
    button.addButton(WHITE_BUTTON, 'mine 10', multiMine(10));
    button.addButton(ATTOM_BUTTON, 'use all picks', multiMine(pickCount));
  }

  private handleChest(
    button: ButtonHandler,
    item: Chest,
    player: Player,
    msg: Message,
  ) {
    button.addButton(BLUE_BUTTON, 'use the item', async () => {
      const result = await item.use(player);
      await player.sync();

      const chestOpening = await msg.channel.send(item.openChestAnimation());
      await sleep(6000);
      await chestOpening.delete();

      const cards: MessageEmbed[] = [];
      const aggregated = aggregateBy(result, (x) => x.id);
      const fragment = Object.entries(aggregated)
        .map(([id, count]) => {
          const fragment = new Fragment(id as FragmentID);
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

  private handleStone(
    button: ButtonHandler,
    item: RoughStone,
    player: Player,
    msg: Message,
  ) {
    button.addButton(BLUE_BUTTON, 'combine 12 rough stones', async () => {
      const gem = item;

      // check for gem upgrade requirement
      const count = player.inventory.all.count(gem.id);
      if (count < gem.requirement) {
        const errMsg = oneLine`${gem.requirement} Rough Stones are required to
        upgrade to 1 ${capitalize(gem.product.quality)} Gem`;

        msg.channel.send(errMsg);
        return;
      }

      await removeInventory(player.id, gem.id, gem.requirement);

      const combineAnimation = gem.showCombineAnimation();
      const animation = await msg.channel.send(combineAnimation);
      await sleep(4000);

      await animation.delete();

      const upgrade = gem.product;

      await addGem(player.id, upgrade.id);
      await msg.channel.send(`You obtained ${upgrade.name}!`);
      await msg.channel.send(upgrade.show(-1));
    });
  }

  private handleFragment(
    button: ButtonHandler,
    item: Fragment,
    player: Player,
    msg: Message,
  ) {
    const ownedPet = player.pets.get(item.pet.id);
    if (!ownedPet || ownedPet.star < 5) {
      button.addButton(BLUE_BUTTON, 'use the item', async () => {
        const { pet } = item;
        const ownedFragmentCount = this.inventory.all.count(item.id);
        let ownedPet = player.pets.get(pet.id);

        // if own the pet but does not have enough fragment to upgrade
        if (ownedPet && ownedFragmentCount < ownedPet.upgradeCost) {
          return msg.channel.send(oneLine`Insufficient fragments to upgrade
                                  ${ownedPet.name} \`${ownedFragmentCount}/${ownedPet.upgradeCost}\``);

          // if player does not own the pet but has less fragments than required
          // fragment in order to obtain the pet
        } if (ownedFragmentCount < Fragment.minFragments) {
          return msg.channel.send(oneLine`Insufficient fragments to summon
                                  ${pet.name} \`${ownedFragmentCount}/${Fragment.minFragments}\``);
        } if (ownedPet && ownedPet.star >= 5) {
          return msg.channel.send('Your pet is already at max star');
        }

        const result = await item.use(player);
        await player.sync();

        ownedPet = player.pets.get(pet.id)!;
        const fragmentCount = player.inventory.all.count(item.id);

        if (result === 'obtain') {
          const summonAnimation = await msg.channel.send(
            item.summonAnimation(),
          );
          await sleep(8000);
          await summonAnimation.delete();
          msg.channel.send(`${player.name} has obtained **${pet.name}**!`);
          msg.channel.send(ownedPet.card(fragmentCount, true));
        } else if (result === 'upgrade') {
          const ownedPet = player.pets.get(pet.id)!;
          const upgradeAnimation = await msg.channel.send(
            item.upgradeAnimation(),
          );
          await sleep(8000);
          await upgradeAnimation.delete();
          msg.channel.send(`${pet.name} is now **${ownedPet.star}** ${STAR}!`);
          msg.channel.send(ownedPet.card(fragmentCount, true));
        }
      });
    }

    button.addButton(
      WHITE_BUTTON,
      'convert this fragment to other fragment of choice',
      () => {
        const ownedFragmentCount = this.inventory.all.count(item.id);
        if (ownedFragmentCount < 2) {
          return msg.channel.send(
            'Two fragments needed to convert to another pet fragment',
          );
        }

        const embed = new MessageEmbed().setColor(BROWN).addField(
          'Select which pet fragments you want to convert to',
          oneLine`This will replace \`x2\` or \`x3\` ${item.pet.name}'s fragment with
          the selected fragment depending on the ratio`,
        );

        const choiceButton = new ButtonHandler(msg, embed, player.id);

        Pet.all.forEach((pet, i) => {
          const isDragon = pet.id === PetID.Dragon;
          const button = NUMBER_BUTTONS[i + 1];
          const label = isDragon
            ? `${pet.fragment.name} - Ratio 3:1`
            : `${pet.fragment.name} - Ratio 2:1`;
          choiceButton.addButton(button, label, async () => {
            if (isDragon && ownedFragmentCount < 3) {
              return msg.channel.send('Dragon requires 3 fragments');
            }

            await removeInventory(player.id, item.id);
            await removeInventory(player.id, item.id);

            if (isDragon) {
              await removeInventory(player.id, item.id);
            }

            const convertAnimation = item.convertAnimation(pet.fragment.name);
            const animation = await msg.channel.send(convertAnimation);

            await sleep(8000);
            await animation.delete();

            await addInventory(player.id, pet.fragment.id);
            msg.channel.send(oneLine`
                               Successfully converted \`x${isDragon ? 3 : 2
              }\` **${item.name}**
                               into \`x1\` **${pet.fragment.name}**!`);
          });
        });

        choiceButton.addCloseButton();
        choiceButton.run();
      },
    );
  }

  private handleGear(button: ButtonHandler, item: Gear, player: Player, msg: Message) {
    button.addButton(BLUE_BUTTON, 'equip gear', async () => {
      const currentPiece = player.equippedGears.find(
        (x) => x.constructor.name === item.constructor.name,
      );

      // unequip gear if piece is the same for example Arena Armor and
      // Apprentice Armor
      if (currentPiece) {
        await unequipGear(player.id, currentPiece.id);
      }

      await equipGear(player.id, item.id);
      msg.channel.send(`Successfully equipped **${item.name}**!`);
    });

    if (item.level < 10) {
      button.addButton(
        WHITE_BUTTON,
        'upgrade item using 1 scroll',
        upgrade(item, msg, player, 1),
      );

      button.addButton(
        RED_BUTTON,
        'upgrade item using 10 scroll',
        upgrade(item, msg, player, 10),
      );

      button.addButton(
        BLACK_BUTTON,
        'upgrade item using 50 scrolls',
        upgrade(item, msg, player, 50),
      );
    }
  }
}
