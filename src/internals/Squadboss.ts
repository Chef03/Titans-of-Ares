import { oneLine } from 'common-tags';
import { TextChannel } from 'discord.js';
import { DateTime } from 'luxon';
import { dbRun } from '../db/promiseWrapper';
import {
  createSquadBoss, getSquadBoss, setPhase, SquadBossDB,
} from '../db/squadBoss';
import { client } from '../main';
import { TeamArena } from './TeamArena';
import {
  nukeChannel
} from './utils';

enum Days {
  MONDAY = 1,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY,
}

export enum SquadPhase {

  REPLENISH = 'replenish_1',
  BATTLE = 'battle_1'

}

export class SquadBoss {
  id: number;

  created: DateTime;

  /** monday date of the week */
  monday: DateTime;

  phase: SquadPhase;

  messageID: string;

  constructor(squadBoss: SquadBossDB) {
    this.id = squadBoss.ID;
    this.created = DateTime.fromISO(squadBoss.Created);
    this.phase = squadBoss.Phase as SquadPhase;
    this.monday = TeamArena.getMondayDate(this.created).set({
      hour: 7,
      minute: 0,
    });
    this.messageID = squadBoss.MessageID;
  }

  private static isReplenishingPhase(time: DateTime) {

    return time.weekday == Days.MONDAY && time.hour >= 7;

  }


  private static isBattlePhase(time: DateTime) {
    return time.weekday == Days.MONDAY && time.hour >= 8;
  }



  static getPhase(now: DateTime) {
    switch (true) {


      case SquadBoss.isBattlePhase(now):
        return SquadPhase.BATTLE;


      case SquadBoss.isReplenishingPhase(now):
        return SquadPhase.REPLENISH;



    }
  }

  static currentPhase() {
    return SquadBoss.getPhase(DateTime.now());
  }

  static async getCurrentSquadBoss() {

    let sb = await getSquadBoss();

    if (!sb) {
      const now = DateTime.now().plus({ days: 7 });
      await createSquadBoss(TeamArena.getMondayDate(now).toISO());
      sb = await getSquadBoss();
    }
    return new SquadBoss(sb);

  }

  static async mainLoop() {




    const squadboss = await SquadBoss.getCurrentSquadBoss();

    // const currentPhase = client.isDev ? client.squadBossPhase : SquadBoss.currentPhase();

    const currentPhase = SquadBoss.currentPhase();


    const mention = client.isDev ? '@all' : '@everyone';

    const { prefix } = client;


    if (!currentPhase || currentPhase === squadboss.phase) return;



    switch (currentPhase) {


      case SquadPhase.REPLENISH:


        await SquadBoss.onReplenish();
        try {
          const { squadBossChannelID } = client;
          const teamArenaChannel = await client.bot.channels.fetch(squadBossChannelID);
          await nukeChannel(teamArenaChannel as TextChannel);
          // eslint-disable-next-line no-empty
        } catch { }
        await client.squadBossChannel.send(
          oneLine`${mention} Notice: Squad Boss Energy has been replenished. You can now participate in 1 Squad Boss fight this week! Use the ${prefix}squadboss command to create a squad or join one!`,
        );

        break;

      case SquadPhase.BATTLE:


        break;


    }

    await setPhase(squadboss.id, currentPhase);
  }

  static async onReplenish() {

    await dbRun(`DELETE FROM squads`);
    await dbRun(`DELETE FROM squadMembers`)
    await dbRun(`DELETE FROM sqlite_sequence WHERE name = 'squads'`)

    const sql = `
        UPDATE PLAYER 
        SET SquadBossEnergy=1
      `;

    dbRun(sql);


  }
}
