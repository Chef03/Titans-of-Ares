"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalXp = exports.getXpFromTable = exports.getTotalPoints = exports.deleteBuff = exports.addBuff = exports.createUser = exports.getUser = exports.getUsers = void 0;
const utils_1 = require("../internals/utils");
const activity_1 = require("./activity");
const monthlyChallenge_1 = require("./monthlyChallenge");
const promiseWrapper_1 = require("./promiseWrapper");
function getUsers() {
    const sql = `
  SELECT DISTINCT CAST (DiscordID AS text) as DiscordID
  FROM ChallengeEntry
  UNION
  SELECT DiscordID
  FROM Player;
  `;
    return (0, promiseWrapper_1.dbAll)(sql);
}
exports.getUsers = getUsers;
function getUser($userID) {
    const sql = `
  SELECT * FROM Player WHERE DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $userID });
}
exports.getUser = getUser;
async function createUser($userID) {
    const sql = `
  INSERT OR IGNORE INTO Player (DiscordID)
  VALUES ($userID)
  `;
    await (0, promiseWrapper_1.dbRun)(sql, { $userID });
    const user = await getUser($userID);
    return user;
}
exports.createUser = createUser;
function addBuff($userID, $buffID) {
    const sql = `
  UPDATE Player
  SET Buff = $buffID
  WHERE DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $buffID });
}
exports.addBuff = addBuff;
function deleteBuff($userID) {
    const sql = `
  UPDATE Player
  SET Buff = NULL
  WHERE DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userID });
}
exports.deleteBuff = deleteBuff;
async function default_1($userId) {
    const sql = `
    SELECT 1
    FROM ChallengeEntry
    WHERE DiscordID = $userId
  `;
    const result = await (0, promiseWrapper_1.dbAll)(sql, { $userId });
    return result.length > 0;
}
exports.default = default_1;
async function getTotalPoints(userId) {
    const activities = await (0, activity_1.getActivity)(userId);
    const convertTable = await (0, monthlyChallenge_1.getConvertTable)();
    let totalPoints = 0;
    activities.forEach((activity) => {
        const tag = `${activity.ValueType}-${activity.ChallengeID}`;
        const multiplier = convertTable.get(tag);
        if (multiplier) {
            totalPoints += multiplier * activity.Value;
        }
    });
    return Math.round(totalPoints);
}
exports.getTotalPoints = getTotalPoints;
async function getXpFromTable($userId) {
    const sql = `
    SELECT XP
    FROM Player
    WHERE DiscordID = $userId
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $userId })
        .then((row) => row?.XP || 0);
}
exports.getXpFromTable = getXpFromTable;
async function getTotalXp(userId) {
    const xp = await getXpFromTable(userId);
    return getTotalPoints(userId)
        .then((points) => (0, utils_1.getXp)(points) + xp);
}
exports.getTotalXp = getTotalXp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RiL3BsYXllci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSw4Q0FBMkM7QUFDM0MseUNBQXlDO0FBQ3pDLHlEQUFxRDtBQUNyRCxxREFBdUQ7QUFtQnZELFNBQWdCLFFBQVE7SUFDdEIsTUFBTSxHQUFHLEdBQUc7Ozs7OztHQU1YLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBd0IsR0FBRyxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQVZELDRCQVVDO0FBRUQsU0FBZ0IsT0FBTyxDQUFDLE9BQWU7SUFDckMsTUFBTSxHQUFHLEdBQUc7O0dBRVgsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFxQixHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELENBQUM7QUFORCwwQkFNQztBQUVNLEtBQUssVUFBVSxVQUFVLENBQUMsT0FBZTtJQUM5QyxNQUFNLEdBQUcsR0FBRzs7O0dBR1gsQ0FBQztJQUVGLE1BQU0sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDOUIsTUFBTSxJQUFJLEdBQUcsTUFBTSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDcEMsT0FBTyxJQUFLLENBQUM7QUFDZixDQUFDO0FBVEQsZ0NBU0M7QUFFRCxTQUFnQixPQUFPLENBQUMsT0FBZSxFQUFFLE9BQWU7SUFDdEQsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBQ0YsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQVBELDBCQU9DO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLE9BQWU7SUFDeEMsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBUkQsZ0NBUUM7QUFFYyxLQUFLLG9CQUFXLE9BQWU7SUFDNUMsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM3QyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFSRCw0QkFRQztBQUVNLEtBQUssVUFBVSxjQUFjLENBQUMsTUFBYztJQUNqRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEsc0JBQVcsRUFBQyxNQUFNLENBQUMsQ0FBQztJQUM3QyxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUEsa0NBQWUsR0FBRSxDQUFDO0lBRTdDLElBQUksV0FBVyxHQUFHLENBQUMsQ0FBQztJQUVwQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7UUFDOUIsTUFBTSxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUM1RCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3pDLElBQUksVUFBVSxFQUFFO1lBQ2QsV0FBVyxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDO1NBQzVDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQWZELHdDQWVDO0FBRU0sS0FBSyxVQUFVLGNBQWMsQ0FBQyxPQUFlO0lBQ2xELE1BQU0sR0FBRyxHQUFHOzs7O0dBSVgsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFpQixHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQztTQUMzQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQVRELHdDQVNDO0FBRU0sS0FBSyxVQUFVLFVBQVUsQ0FBQyxNQUFjO0lBQzdDLE1BQU0sRUFBRSxHQUFHLE1BQU0sY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sY0FBYyxDQUFDLE1BQU0sQ0FBQztTQUMxQixJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLElBQUEsYUFBSyxFQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFKRCxnQ0FJQyJ9