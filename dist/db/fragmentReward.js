"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFragmentReward = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
function setFragmentReward($userID, $upperLimit) {
    const sql = `
  UPDATE Player
  SET FragmentReward = $upperLimit
  WHERE DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $upperLimit });
}
exports.setFragmentReward = setFragmentReward;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhZ21lbnRSZXdhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvZnJhZ21lbnRSZXdhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQXlDO0FBRXpDLFNBQWdCLGlCQUFpQixDQUFDLE9BQWUsRUFBRSxXQUFtQjtJQUNwRSxNQUFNLEdBQUcsR0FBRzs7OztHQUlYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUM5QyxDQUFDO0FBUkQsOENBUUMifQ==