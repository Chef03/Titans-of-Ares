"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setProfile = exports.getProfile = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
function getProfile($userID) {
    const sql = `
  SELECT *
  FROM Profile
  WHERE DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $userID });
}
exports.getProfile = getProfile;
function setProfile($userID, $checksum, $data) {
    const sql = `
  INSERT OR REPLACE INTO Profile (DiscordID, Checksum, Data)
  VALUES ($userID, $checksum, $data) 
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $checksum, $data });
}
exports.setProfile = setProfile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYi9wcm9maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUFnRDtBQVFoRCxTQUFnQixVQUFVLENBQUMsT0FBZTtJQUN4QyxNQUFNLEdBQUcsR0FBRzs7OztHQUlYLENBQUM7SUFDRixPQUFPLElBQUEsc0JBQUssRUFBVSxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFQRCxnQ0FPQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxPQUFlLEVBQUUsU0FBaUIsRUFBRSxLQUFhO0lBQzFFLE1BQU0sR0FBRyxHQUFHOzs7R0FHWCxDQUFDO0lBQ0YsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ25ELENBQUM7QUFORCxnQ0FNQyJ9