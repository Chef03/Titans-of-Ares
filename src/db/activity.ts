import { dbAll } from './promiseWrapper';

interface Row {
  Day: number;
  Value: number;
  ValueType: string;
  XP: number;
  ChallengeID: number;
}

export function getActivity($userId: string) {
  const sql = `
  SELECT ChallengeEntry.ChallengeID,
         DayEntry.Day, 
         DayEntry.Value, 
         DayEntry.ValueType 
  FROM DayEntry 
  INNER JOIN ChallengeEntry ON DayEntry.EntryID = ChallengeEntry.ID 
    WHERE ChallengeEntry.DiscordID = $userId
  `;
  return dbAll<Row>(sql, { $userId });
}

interface Row1 extends Row {
  DiscordID: string;
}

export function getActivities() {
  const sql = `
  SELECT ChallengeEntry.ChallengeID,
         CAST(ChallengeEntry.DiscordID AS text) as DiscordID,
         DayEntry.Day, 
         DayEntry.Value, 
         DayEntry.ValueType 
  FROM DayEntry 
  INNER JOIN ChallengeEntry ON DayEntry.EntryID = ChallengeEntry.ID 
  WHERE ChallengeEntry.ChallengeID != 1
  `;

  return dbAll<Row1>(sql);
}
