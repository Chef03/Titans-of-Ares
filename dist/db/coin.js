"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setArenaCoin = exports.updateCoin = exports.setCoin = exports.getCoin = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
async function getCoin($userId) {
    const sql = `
    SELECT Coin
    FROM Player
    WHERE DiscordID = $userId
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $userId })
        .then((x) => x?.Coin || 0);
}
exports.getCoin = getCoin;
async function setCoin($userId, $amount) {
    const sql = `
    UPDATE Player
    SET Coin = $amount
    WHERE DiscordID = $userId
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userId, $amount });
}
exports.setCoin = setCoin;
async function updateCoin($userId, $amount) {
    const sql = `
    UPDATE Player
    SET Coin = Coin + $amount
    WHERE DiscordID = $userId
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userId, $amount });
}
exports.updateCoin = updateCoin;
async function setArenaCoin($userId, $amount) {
    console.log($amount);
    const sql = `
    UPDATE Player
    SET ArenaCoin = $amount
    WHERE DiscordID = $userId
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userId, $amount });
}
exports.setArenaCoin = setArenaCoin;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29pbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYi9jb2luLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUFnRDtBQUV6QyxLQUFLLFVBQVUsT0FBTyxDQUFDLE9BQWU7SUFDM0MsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQW9CLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDO1NBQzlDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBVEQsMEJBU0M7QUFFTSxLQUFLLFVBQVUsT0FBTyxDQUFDLE9BQWUsRUFBRSxPQUFlO0lBQzVELE1BQU0sR0FBRyxHQUFHOzs7O0dBSVgsQ0FBQztJQUNGLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFQRCwwQkFPQztBQUVNLEtBQUssVUFBVSxVQUFVLENBQUMsT0FBZSxFQUFFLE9BQWU7SUFDL0QsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBQ0YsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQVBELGdDQU9DO0FBRU0sS0FBSyxVQUFVLFlBQVksQ0FBQyxPQUFlLEVBQUUsT0FBZTtJQUVqRSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQ3BCLE1BQU0sR0FBRyxHQUFHOzs7O0dBSVgsQ0FBQztJQUNGLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFURCxvQ0FTQyJ9