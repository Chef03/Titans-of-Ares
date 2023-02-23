import { dbAll, dbRun } from "./promiseWrapper"

interface GoalRaw {
    ID: number;
    DiscordID: string;
    goal: string;
    finished: number;
}

export type Goal = Omit<GoalRaw, "Finished"> & { Finished: boolean };


export async function getAllGoals($userID: string): Promise<Goal[]> {
    const sql = `
    SELECT * FROM Goals 
    WHERE DiscordID = $userID
  `

    const goals = await dbAll<GoalRaw>(sql, { $userID });
    return goals.map(x => ({ ...x, Finished: Boolean(x.finished) })) as Goal[];
}

export class UnfinishedGoalError extends Error {
    goal: Goal;

    constructor(message: string, goal: Goal) {
        super(message);
        this.name = "UnfinishedGoalError";
        this.goal = goal;
    }
}

export interface GoalOptions {
    $userID: string;
    $goal: string;
}

export async function registerGoal(options: GoalOptions) {

    const goals = await getAllGoals(options.$userID);

    for (const goal of goals) {
        if (!goal.finished) {
            throw new UnfinishedGoalError("unfinished goal", goal);
        }
    }

    const sql = `
    INSERT INTO Goals (DiscordID, goal)
    VALUES ($userID, $goal)
  `

    return dbRun(sql, { ...options });
}

export async function removeGoal($goalID: number) {
    const sql = `
    DELETE FROM Goals WHERE ID = $goalID
  `

    return dbRun(sql, { $goalID });
}

export async function finishGoal($goalID: number) {
    const sql = `
    UPDATE Goals
    SET finished = 1 WHERE ID = $goalID
  `

    return dbRun(sql, { $goalID});
}