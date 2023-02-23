"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = exports.getActivity = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
function getActivity($userId) {
    const sql = `
  SELECT ChallengeEntry.ChallengeID,
         DayEntry.Day, 
         DayEntry.Value, 
         DayEntry.ValueType 
  FROM DayEntry 
  INNER JOIN ChallengeEntry ON DayEntry.EntryID = ChallengeEntry.ID 
    WHERE ChallengeEntry.DiscordID = $userId
  `;
    return (0, promiseWrapper_1.dbAll)(sql, { $userId });
}
exports.getActivity = getActivity;
function getActivities() {
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
    return (0, promiseWrapper_1.dbAll)(sql);
}
exports.getActivities = getActivities;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvYWN0aXZpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQXlDO0FBVXpDLFNBQWdCLFdBQVcsQ0FBQyxPQUFlO0lBQ3pDLE1BQU0sR0FBRyxHQUFHOzs7Ozs7OztHQVFYLENBQUM7SUFDRixPQUFPLElBQUEsc0JBQUssRUFBTSxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFYRCxrQ0FXQztBQU1ELFNBQWdCLGFBQWE7SUFDM0IsTUFBTSxHQUFHLEdBQUc7Ozs7Ozs7OztHQVNYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBTyxHQUFHLENBQUMsQ0FBQztBQUMxQixDQUFDO0FBYkQsc0NBYUMifQ==