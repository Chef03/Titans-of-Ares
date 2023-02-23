"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimer = exports.setTimer = exports.hasTimer = exports.setEnergy = exports.getAllTimers = exports.deleteTimer = exports.TimerType = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
var TimerType;
(function (TimerType) {
    TimerType["Energy"] = "charge";
    TimerType["Buff"] = "buff";
})(TimerType = exports.TimerType || (exports.TimerType = {}));
function deleteTimer($name, $userID) {
    const sql = `
  DELETE FROM Timer
  WHERE Name = $name AND DiscordID = $userID
  `;
    (0, promiseWrapper_1.dbRun)(sql, { $name, $userID });
}
exports.deleteTimer = deleteTimer;
function getAllTimers($name) {
    const sql = `
  SELECT * FROM Timer WHERE Name = $name
  `;
    return (0, promiseWrapper_1.dbAll)(sql, { $name });
}
exports.getAllTimers = getAllTimers;
// increments user energy and returns total energy a user has
async function setEnergy($userID, $amount) {
    const sql = `
  UPDATE Player
  SET Energy = Energy + $amount
  WHERE DiscordID = $userID
  `;
    await (0, promiseWrapper_1.dbRun)(sql, { $amount, $userID });
    const energySql = `
  SELECT Energy
  FROM Player
  WHERE DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbGet)(energySql, { $userID })
        .then((x) => x.Energy);
}
exports.setEnergy = setEnergy;
async function hasTimer($name, $userID) {
    const sql = `
  SELECT COUNT(*) AS Count
  FROM Timer
  WHERE DiscordID = $userID AND Name = $name
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $name, $userID })
        .then((x) => x.Count > 0);
}
exports.hasTimer = hasTimer;
// Sets a timer in database. $expires is the expiry date in ISO string
function setTimer($name, $userID, $expires) {
    const sql = `
  INSERT INTO Timer (DiscordID, Name, Expires)
  VALUES ($userID, $name, $expires)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $name, $userID, $expires });
}
exports.setTimer = setTimer;
function getTimer($name, $userID) {
    const sql = `
  SELECT *
  FROM Timer 
  WHERE Name = $name AND DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $name, $userID });
}
exports.getTimer = getTimer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvdGltZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQXVEO0FBRXZELElBQVksU0FHWDtBQUhELFdBQVksU0FBUztJQUNuQiw4QkFBaUIsQ0FBQTtJQUNqQiwwQkFBYSxDQUFBO0FBQ2YsQ0FBQyxFQUhXLFNBQVMsR0FBVCxpQkFBUyxLQUFULGlCQUFTLFFBR3BCO0FBU0QsU0FBZ0IsV0FBVyxDQUFDLEtBQWdCLEVBQUUsT0FBZTtJQUMzRCxNQUFNLEdBQUcsR0FBRzs7O0dBR1gsQ0FBQztJQUVGLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBUEQsa0NBT0M7QUFFRCxTQUFnQixZQUFZLENBQUMsS0FBZ0I7SUFDM0MsTUFBTSxHQUFHLEdBQUc7O0dBRVgsQ0FBQztJQUNGLE9BQU8sSUFBQSxzQkFBSyxFQUFRLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQUxELG9DQUtDO0FBRUQsNkRBQTZEO0FBQ3RELEtBQUssVUFBVSxTQUFTLENBQUMsT0FBZSxFQUFFLE9BQWU7SUFDOUQsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsTUFBTSxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFFdkMsTUFBTSxTQUFTLEdBQUc7Ozs7R0FJakIsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFxQixTQUFTLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQztTQUNyRCxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUMzQixDQUFDO0FBakJELDhCQWlCQztBQUVNLEtBQUssVUFBVSxRQUFRLENBQUMsS0FBZ0IsRUFBRSxPQUFlO0lBQzlELE1BQU0sR0FBRyxHQUFHOzs7O0dBSVgsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFvQixHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7U0FDckQsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQzlCLENBQUM7QUFURCw0QkFTQztBQUVELHNFQUFzRTtBQUN0RSxTQUFnQixRQUFRLENBQUMsS0FBZ0IsRUFBRSxPQUFlLEVBQUUsUUFBZ0I7SUFDMUUsTUFBTSxHQUFHLEdBQUc7OztHQUdYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQVBELDRCQU9DO0FBRUQsU0FBZ0IsUUFBUSxDQUFDLEtBQWdCLEVBQUUsT0FBZTtJQUN4RCxNQUFNLEdBQUcsR0FBRzs7OztHQUlYLENBQUM7SUFDRixPQUFPLElBQUEsc0JBQUssRUFBUSxHQUFHLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUMvQyxDQUFDO0FBUEQsNEJBT0MifQ==