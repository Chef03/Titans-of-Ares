"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SquadManager = void 0;
const promiseWrapper_1 = require("../db/promiseWrapper");
class SquadManager {
    constructor(owner) {
        this.isOwner = 0;
        (async () => {
            const fetchedSquad = await (0, promiseWrapper_1.dbGet)('SELECT * FROM squads WHERE OWNER = $userID', { $userID: owner.id });
            this.isOwner = fetchedSquad ? 1 : 0;
        })();
    }
}
exports.SquadManager = SquadManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3F1YWRNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9TcXVhZE1hbmFnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EseURBQTZDO0FBRTdDLE1BQWEsWUFBWTtJQUd2QixZQUFZLEtBQWtCO1FBRjlCLFlBQU8sR0FBRyxDQUFDLENBQUM7UUFHVixDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ1YsTUFBTSxZQUFZLEdBQUcsTUFBTSxJQUFBLHNCQUFLLEVBQUMsNENBQTRDLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdEcsSUFBSSxDQUFDLE9BQU8sR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDUCxDQUFDO0NBQ0Y7QUFURCxvQ0FTQyJ9