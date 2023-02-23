"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMaxChallenger = exports.getChallenger = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
async function getChallenger($level) {
    const sql = `
    SELECT *
    FROM Challenger
    WHERE ID = $level
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $level });
}
exports.getChallenger = getChallenger;
function setMaxChallenger($userID, $level) {
    const sql = `
    UPDATE Player
    SET ChallengerMaxLevel = $level
    WHERE DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $level });
}
exports.setMaxChallenger = setMaxChallenger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbGxlbmdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYi9jaGFsbGVuZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUFnRDtBQWF6QyxLQUFLLFVBQVUsYUFBYSxDQUFDLE1BQWM7SUFDaEQsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQWEsR0FBRyxFQUFFLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUM1QyxDQUFDO0FBUkQsc0NBUUM7QUFFRCxTQUFnQixnQkFBZ0IsQ0FBQyxPQUFlLEVBQUUsTUFBYztJQUM5RCxNQUFNLEdBQUcsR0FBRzs7OztHQUlYLENBQUM7SUFDRixPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBUEQsNENBT0MifQ==