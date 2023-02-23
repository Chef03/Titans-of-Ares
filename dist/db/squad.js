"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSquads = exports.saveSquad = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
function saveSquad(name, owner) {
    const sql = `INSERT INTO squads (name, owner, memberCount) VALUES
    ($name, $owner, $memberCount)`;
    return (0, promiseWrapper_1.dbRun)(sql, { $name: name, $owner: owner.id, $memberCount: 1 });
}
exports.saveSquad = saveSquad;
function getSquads() {
    const sql = 'SELECT * FROM squads WHERE memberCount < 7';
    return (0, promiseWrapper_1.dbAll)(sql);
}
exports.getSquads = getSquads;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3F1YWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvc3F1YWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscURBQXVEO0FBU3ZELFNBQWdCLFNBQVMsQ0FBQyxJQUFZLEVBQUUsS0FBa0I7SUFDeEQsTUFBTSxHQUFHLEdBQUc7a0NBQ29CLENBQUM7SUFFakMsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN4RSxDQUFDO0FBTEQsOEJBS0M7QUFFRCxTQUFnQixTQUFTO0lBQ3ZCLE1BQU0sR0FBRyxHQUFHLDRDQUE0QyxDQUFDO0lBQ3pELE9BQU8sSUFBQSxzQkFBSyxFQUFRLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFIRCw4QkFHQyJ9