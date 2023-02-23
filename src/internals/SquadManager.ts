import { GuildMember } from 'discord.js';
import { dbGet } from '../db/promiseWrapper';

export class SquadManager {
  isOwner = 0;

  constructor(owner: GuildMember) {
    (async () => {
      const fetchedSquad = await dbGet('SELECT * FROM squads WHERE OWNER = $userID', { $userID: owner.id });
      this.isOwner = fetchedSquad ? 1 : 0;
    })();
  }
}
