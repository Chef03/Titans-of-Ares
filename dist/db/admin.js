"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminRoles = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
async function default_1($userId) {
    const sql = `
    SELECT 1
    FROM AdminRole
    WHERE ID = $userId
  `;
    const result = await (0, promiseWrapper_1.dbAll)(sql, { $userId });
    return result.length > 0;
}
exports.default = default_1;
async function getAdminRoles() {
    const sql = `
    SELECT CAST(ID AS TEXT) as ID
    FROM AdminRole
  `;
    return (0, promiseWrapper_1.dbAll)(sql)
        .then((roles) => roles.map((x) => x.ID));
}
exports.getAdminRoles = getAdminRoles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRtaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvYWRtaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQXlDO0FBRTFCLEtBQUssb0JBQVcsT0FBZTtJQUM1QyxNQUFNLEdBQUcsR0FBRzs7OztHQUlYLENBQUM7SUFFRixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDM0IsQ0FBQztBQVRELDRCQVNDO0FBRU0sS0FBSyxVQUFVLGFBQWE7SUFDakMsTUFBTSxHQUFHLEdBQUc7OztHQUdYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBaUIsR0FBRyxDQUFDO1NBQzlCLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQVJELHNDQVFDIn0=