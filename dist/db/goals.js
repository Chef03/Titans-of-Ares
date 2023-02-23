"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishGoal = exports.removeGoal = exports.registerGoal = exports.UnfinishedGoalError = exports.getAllGoals = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
async function getAllGoals($userID) {
    const sql = `
    SELECT * FROM Goals 
    WHERE DiscordID = $userID
  `;
    const goals = await (0, promiseWrapper_1.dbAll)(sql, { $userID });
    return goals.map(x => ({ ...x, Finished: Boolean(x.finished) }));
}
exports.getAllGoals = getAllGoals;
class UnfinishedGoalError extends Error {
    constructor(message, goal) {
        super(message);
        this.name = "UnfinishedGoalError";
        this.goal = goal;
    }
}
exports.UnfinishedGoalError = UnfinishedGoalError;
async function registerGoal(options) {
    const goals = await getAllGoals(options.$userID);
    for (const goal of goals) {
        if (!goal.finished) {
            throw new UnfinishedGoalError("unfinished goal", goal);
        }
    }
    const sql = `
    INSERT INTO Goals (DiscordID, goal)
    VALUES ($userID, $goal)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { ...options });
}
exports.registerGoal = registerGoal;
async function removeGoal($goalID) {
    const sql = `
    DELETE FROM Goals WHERE ID = $goalID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $goalID });
}
exports.removeGoal = removeGoal;
async function finishGoal($goalID) {
    const sql = `
    UPDATE Goals
    SET finished = 1 WHERE ID = $goalID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $goalID });
}
exports.finishGoal = finishGoal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29hbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvZGIvZ29hbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscURBQStDO0FBWXhDLEtBQUssVUFBVSxXQUFXLENBQUMsT0FBZTtJQUM3QyxNQUFNLEdBQUcsR0FBRzs7O0dBR2IsQ0FBQTtJQUVDLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSxzQkFBSyxFQUFVLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDckQsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBVyxDQUFDO0FBQy9FLENBQUM7QUFSRCxrQ0FRQztBQUVELE1BQWEsbUJBQW9CLFNBQVEsS0FBSztJQUcxQyxZQUFZLE9BQWUsRUFBRSxJQUFVO1FBQ25DLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNmLElBQUksQ0FBQyxJQUFJLEdBQUcscUJBQXFCLENBQUM7UUFDbEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckIsQ0FBQztDQUNKO0FBUkQsa0RBUUM7QUFPTSxLQUFLLFVBQVUsWUFBWSxDQUFDLE9BQW9CO0lBRW5ELE1BQU0sS0FBSyxHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVqRCxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtRQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNoQixNQUFNLElBQUksbUJBQW1CLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDMUQ7S0FDSjtJQUVELE1BQU0sR0FBRyxHQUFHOzs7R0FHYixDQUFBO0lBRUMsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFoQkQsb0NBZ0JDO0FBRU0sS0FBSyxVQUFVLFVBQVUsQ0FBQyxPQUFlO0lBQzVDLE1BQU0sR0FBRyxHQUFHOztHQUViLENBQUE7SUFFQyxPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ25DLENBQUM7QUFORCxnQ0FNQztBQUVNLEtBQUssVUFBVSxVQUFVLENBQUMsT0FBZTtJQUM1QyxNQUFNLEdBQUcsR0FBRzs7O0dBR2IsQ0FBQTtJQUVDLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQVBELGdDQU9DIn0=