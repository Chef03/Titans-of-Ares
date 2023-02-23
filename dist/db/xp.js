"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addXP = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
function addXP($userId, $amount) {
    const sql = `
    INSERT INTO Player(DiscordID, XP)
    VALUES ($userId, $amount)
    ON CONFLICT(DiscordID)
    DO UPDATE SET XP = XP + $amount
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userId, $amount });
}
exports.addXP = addXP;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIveHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQXlDO0FBRXpDLFNBQWdCLEtBQUssQ0FBQyxPQUFlLEVBQUUsT0FBZTtJQUNwRCxNQUFNLEdBQUcsR0FBRzs7Ozs7R0FLWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQVRELHNCQVNDIn0=