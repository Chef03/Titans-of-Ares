"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetXPEntry = exports.getXPEntry = exports.setXPEntry = exports.createEntry = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
async function createEntry($challengeID, $day, $userID, $xp) {
    const sql = `
  INSERT INTO XPEntry (ChallengeID, Day, XP, DiscordID)
  VALUES ($challengeID, $day, $xp, $userID)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, {
        $challengeID, $day, $xp, $userID,
    });
}
exports.createEntry = createEntry;
async function setXPEntry($id, $xp) {
    const sql = `
  UPDATE XPEntry
  SET XP = XP + $xp
  WHERE ID = $id
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $id, $xp });
}
exports.setXPEntry = setXPEntry;
async function getXPEntry($challengeID, $day, $userID) {
    const sql = `
  SELECT *
  FROM XPEntry
  WHERE 
    ChallengeID = $challengeID AND
    Day = $day AND
    DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $userID, $challengeID, $day });
}
exports.getXPEntry = getXPEntry;
async function resetXPEntry($challengeID, $day, $userID) {
    const sql = `
  UPDATE XPEntry
  SET XP = 0
  WHERE 
    ChallengeID = $challengeID AND
    Day = $day AND
    DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $day, $challengeID });
}
exports.resetXPEntry = resetXPEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBFbnRyeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYi94cEVudHJ5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUFnRDtBQVV6QyxLQUFLLFVBQVUsV0FBVyxDQUMvQixZQUFvQixFQUNwQixJQUFZLEVBQ1osT0FBZSxFQUNmLEdBQVc7SUFFWCxNQUFNLEdBQUcsR0FBRzs7O0dBR1gsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRTtRQUNoQixZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxPQUFPO0tBQ2pDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFkRCxrQ0FjQztBQUVNLEtBQUssVUFBVSxVQUFVLENBQzlCLEdBQVcsRUFDWCxHQUFXO0lBRVgsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQVhELGdDQVdDO0FBRU0sS0FBSyxVQUFVLFVBQVUsQ0FDOUIsWUFBb0IsRUFDcEIsSUFBWSxFQUNaLE9BQWU7SUFFZixNQUFNLEdBQUcsR0FBRzs7Ozs7OztHQU9YLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBVSxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDOUQsQ0FBQztBQWZELGdDQWVDO0FBRU0sS0FBSyxVQUFVLFlBQVksQ0FDaEMsWUFBb0IsRUFDcEIsSUFBWSxFQUNaLE9BQWU7SUFFZixNQUFNLEdBQUcsR0FBRzs7Ozs7OztHQU9YLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDckQsQ0FBQztBQWZELG9DQWVDIn0=