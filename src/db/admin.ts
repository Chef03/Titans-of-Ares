import { dbAll } from './promiseWrapper';

export default async function ($userId: string) {
  const sql = `
    SELECT 1
    FROM AdminRole
    WHERE ID = $userId
  `;

  const result = await dbAll(sql, { $userId });
  return result.length > 0;
}

export async function getAdminRoles() {
  const sql = `
    SELECT CAST(ID AS TEXT) as ID
    FROM AdminRole
  `;

  return dbAll<{ ID: string }>(sql)
    .then((roles) => roles.map((x) => x.ID));
}
