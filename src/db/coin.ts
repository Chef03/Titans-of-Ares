import { dbGet, dbRun } from './promiseWrapper';

export async function getCoin($userId: string) {
  const sql = `
    SELECT Coin
    FROM Player
    WHERE DiscordID = $userId
  `;

  return dbGet<{ Coin?: number }>(sql, { $userId })
    .then((x) => x?.Coin || 0);
}

export async function setCoin($userId: string, $amount: number) {
  const sql = `
    UPDATE Player
    SET Coin = $amount
    WHERE DiscordID = $userId
  `;
  return dbRun(sql, { $userId, $amount });
}

export async function updateCoin($userId: string, $amount: number) {
  const sql = `
    UPDATE Player
    SET Coin = Coin + $amount
    WHERE DiscordID = $userId
  `;
  return dbRun(sql, { $userId, $amount });
}

export async function setArenaCoin($userId: string, $amount: number) {

  console.log($amount)
  const sql = `
    UPDATE Player
    SET ArenaCoin = $amount
    WHERE DiscordID = $userId
  `;
  return dbRun(sql, { $userId, $amount });
}
