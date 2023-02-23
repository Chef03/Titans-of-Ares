import { GuildMember } from 'discord.js';
import { dbAll, dbGet, dbRun } from './promiseWrapper';

export interface Squad {
    name: string;
    owner: string;
    memberCount: number;
    id:number;
}

export function saveSquad(name: string, owner: GuildMember) {
  const sql = `INSERT INTO squads (name, owner, memberCount) VALUES
    ($name, $owner, $memberCount)`;

  return dbRun(sql, { $name: name, $owner: owner.id, $memberCount: 1 });
}

export function getSquads() {
  const sql = 'SELECT * FROM squads WHERE memberCount < 7';
  return dbAll<Squad>(sql);
}
