import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import Command from '../internals/Command';

export default class extends Command {
  name = 'help';

  aliases = ['h'];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exec(msg: Message, _args: string[]) {
    const message = stripIndents`
    __**Welcome to the Titans of Ares RPG game!**__
    For this RPG you can earn XP and gain levels by participating in the Monthly Challenges.

    __**Channel information**__
    #ranks - This shows the top 10 highest level Titans currently in the game
    #log - This log will show most of the activities regarding players. For
           example: when someone gains XP, gains a buff or if a player is
           awarded with items.
    #daily-commands - This channel is for all commands that you can use in the game
    #ranks-top10 - This shows the top 10 highest level Titans currently in the
                   game. To see all the Titans use the $rank 100.

    __**All commands**__
    **$profile ($p)**
    This will show your profile with all your ranking, level, stats, buffs and
    energy. This is your main overview of your character.

    **$battle ($b)**
    This will allow you to battle Ares Challengers from level 1 to level 50. You
    can only challenge 1 level higher than your maximum defeated level. Winning
    against challengers award coins. You can only battle if you have energy, it
    replenishes automatically every 8 hours to a max of 5. Check your current
    energy with $profile!

    **$inventory ($inv)**
    This command shows your items; within this command, you can also use the item.

    **$pet**
    This is where you manage your pets where you can activate/deactivate your pets.
    Pet fragments can be earned by winning medals in the Monthly Challenges and as
    a very low drop rate when uploading workouts.

    **$shop**
    This will open all the possible shops. You can buy gear and upgrade scrolls here.

    **$gear**
    This will show all your equipped gear and their stats. You can upgrade
    equipped gear by inspecting items here. To equip gear, inspect gear pieces
    in the inventory.

    **$teamarena ($ta)**
    The Team Arena is an event that will occur every week. Every Monday and
    Tuesday you can sign up for this event by using the command. You can compete
    from Thursday to Saturday and earn Arena Coins.
    `;

    msg.channel.send(message);
  }
}
