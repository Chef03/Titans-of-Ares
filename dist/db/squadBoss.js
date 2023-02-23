"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSquadBoss = exports.setPhase = exports.createSquadBoss = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
function createSquadBoss($dateISO) {
    const sql = `
      INSERT INTO squadboss (Created)
      VALUES ($dateISO)
    `;
    return (0, promiseWrapper_1.dbRun)(sql, { $dateISO });
}
exports.createSquadBoss = createSquadBoss;
function setPhase($squadbossID, $phase) {
    const sql = `
    UPDATE squadboss
    SET Phase = $phase
    WHERE ID = $squadbossID
    `;
    return (0, promiseWrapper_1.dbRun)(sql, { $squadbossID, $phase });
}
exports.setPhase = setPhase;
function getSquadBoss() {
    const sql = `
      SELECT * FROM squadboss ORDER BY ID DESC LIMIT 1
    `;
    return (0, promiseWrapper_1.dbGet)(sql);
}
exports.getSquadBoss = getSquadBoss;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3F1YWRCb3NzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RiL3NxdWFkQm9zcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxREFBdUQ7QUFTdkQsU0FBZ0IsZUFBZSxDQUFDLFFBQWdCO0lBQzlDLE1BQU0sR0FBRyxHQUFHOzs7S0FHVCxDQUFDO0lBRUosT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBUEQsMENBT0M7QUFFRCxTQUFnQixRQUFRLENBQUMsWUFBb0IsRUFBRSxNQUFjO0lBQzNELE1BQU0sR0FBRyxHQUFHOzs7O0tBSVQsQ0FBQztJQUVKLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFSRCw0QkFRQztBQUVELFNBQWdCLFlBQVk7SUFDMUIsTUFBTSxHQUFHLEdBQUc7O0tBRVQsQ0FBQztJQUVKLE9BQU8sSUFBQSxzQkFBSyxFQUFjLEdBQUcsQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFORCxvQ0FNQyJ9