"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMedal = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
// increments the medal of user by the given amount
// use negative value to decrement
function addMedal($userID, medalType, $amount) {
    const sql = `
  UPDATE Player
  SET ${medalType} = ${medalType} + $amount
  WHERE DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $amount });
}
exports.addMedal = addMedal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkYWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvbWVkYWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQXlDO0FBR3pDLG1EQUFtRDtBQUNuRCxrQ0FBa0M7QUFDbEMsU0FBZ0IsUUFBUSxDQUN0QixPQUFlLEVBQ2YsU0FBb0IsRUFDcEIsT0FBZTtJQUVmLE1BQU0sR0FBRyxHQUFHOztRQUVOLFNBQVMsTUFBTSxTQUFTOztHQUU3QixDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQVpELDRCQVlDIn0=