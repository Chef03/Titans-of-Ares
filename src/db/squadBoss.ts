import { DateTime } from 'luxon';
import { dbAll, dbGet, dbRun } from './promiseWrapper';

export interface SquadBossDB {
    ID: number;
    Created: string;
    Phase: string;
    MessageID: string;
}

export function createSquadBoss($dateISO: string) {
  const sql = `
      INSERT INTO squadboss (Created)
      VALUES ($dateISO)
    `;

  return dbRun(sql, { $dateISO });
}

export function setPhase($squadbossID: number, $phase: string) {
  const sql = `
    UPDATE squadboss
    SET Phase = $phase
    WHERE ID = $squadbossID
    `;

  return dbRun(sql, { $squadbossID, $phase });
}

export function getSquadBoss() {
  const sql = `
      SELECT * FROM squadboss ORDER BY ID DESC LIMIT 1
    `;

  return dbGet<SquadBossDB>(sql);
}
