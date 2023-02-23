import { Message } from 'discord.js';
import { dbAll, dbGet } from '../db/promiseWrapper';
import Command from '../internals/Command';
import { FightBoss } from '../internals/FightBoss';
import Battle, { bosses } from '../internals/SquadBattle';
import { dbSquad, squadMember } from './SquadBoss';

export default class extends Command {
    name = 'fight';
    aliases = [];


    async exec(msg: Message, _args: string[]) {

        if(msg.channel.type === 'dm') return;

        const boss = bosses[parseInt(_args[0]) - 1]
        if (!boss) return msg.channel.send(`Boss was not found.`);


        const ownerSql = 'SELECT * FROM squads WHERE owner = $owner';
        const existingSquad = await dbGet<dbSquad>(ownerSql, { $owner: msg.author.id });
        if (!existingSquad) return msg.channel.send('You are not a squad owner.');
        const grabSql = 'SELECT * FROM squadMembers WHERE squadName = $squadName';
        const members = await dbAll<squadMember>(grabSql, { $squadName: existingSquad.name });
        const front = members.filter((member) => member.position === 'front');
        const back = members.filter((member) => member.position === 'back');

        if (!front.length || !back.length) {
            return msg.channel.send('Your squad needs to at-least have 1 front and 1 back players.');
        }

        Battle(msg, boss.name);






    }
}
