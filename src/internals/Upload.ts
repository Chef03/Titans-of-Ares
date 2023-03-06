import { DateTime } from "luxon"
import updateRanks from "./updateRanks";

export class Upload {

    static async mainLoop() {

        const now = DateTime.now();
        if (now.hour == 7 && now.minute == 0) {

            await updateRanks();

        }

    }

}