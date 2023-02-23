"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showTimeLeft = exports.isExpired = exports.energyMainLoop = exports.MAX_SQUAD_BOSS_ENERGY = exports.MAX_ENERGY = exports.ENERGY_TIMEOUT = void 0;
const luxon_1 = require("luxon");
const timer_1 = require("../db/timer");
exports.ENERGY_TIMEOUT = { hours: 8 };
exports.MAX_ENERGY = 5;
exports.MAX_SQUAD_BOSS_ENERGY = 1;
async function energyMainLoop() {
    const timers = await (0, timer_1.getAllTimers)(timer_1.TimerType.Energy);
    for (const timer of timers) {
        const now = luxon_1.DateTime.now();
        // if the timer is expired
        if (isExpired(timer.Expires)) {
            (0, timer_1.deleteTimer)(timer_1.TimerType.Energy, timer.DiscordID);
            const energy = await (0, timer_1.setEnergy)(timer.DiscordID, 1);
            if (energy < exports.MAX_ENERGY) {
                const expiryDate = now.plus(exports.ENERGY_TIMEOUT).toISO();
                (0, timer_1.setTimer)(timer_1.TimerType.Energy, timer.DiscordID, expiryDate);
            }
        }
    }
}
exports.energyMainLoop = energyMainLoop;
// Check if the date is expired. Accepts ISO date string as the only argument.
function isExpired(expiryDate) {
    const expire = luxon_1.DateTime.fromISO(expiryDate);
    return expire.diffNow(['seconds']).seconds <= 0;
}
exports.isExpired = isExpired;
async function showTimeLeft(timerType, userID) {
    const timer = await (0, timer_1.getTimer)(timerType, userID);
    if (!timer)
        return '';
    const expiryDate = luxon_1.DateTime.fromISO(timer.Expires);
    const diff = expiryDate.diffNow();
    return diff.toFormat('`(hh:mm:ss)`');
}
exports.showTimeLeft = showTimeLeft;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5lcmd5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9lbmVyZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsaUNBQWdEO0FBQ2hELHVDQU9xQjtBQUVSLFFBQUEsY0FBYyxHQUFrQixFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUM3QyxRQUFBLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDZixRQUFBLHFCQUFxQixHQUFHLENBQUMsQ0FBQztBQUVoQyxLQUFLLFVBQVUsY0FBYztJQUNsQyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsb0JBQVksRUFBQyxpQkFBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXBELEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1FBQzFCLE1BQU0sR0FBRyxHQUFHLGdCQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFM0IsMEJBQTBCO1FBQzFCLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM1QixJQUFBLG1CQUFXLEVBQUMsaUJBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBQSxpQkFBUyxFQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkQsSUFBSSxNQUFNLEdBQUcsa0JBQVUsRUFBRTtnQkFDdkIsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxzQkFBYyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3BELElBQUEsZ0JBQVEsRUFBQyxpQkFBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ3pEO1NBQ0Y7S0FDRjtBQUNILENBQUM7QUFoQkQsd0NBZ0JDO0FBRUQsOEVBQThFO0FBQzlFLFNBQWdCLFNBQVMsQ0FBQyxVQUFrQjtJQUMxQyxNQUFNLE1BQU0sR0FBRyxnQkFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUM1QyxPQUFPLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7QUFDbEQsQ0FBQztBQUhELDhCQUdDO0FBRU0sS0FBSyxVQUFVLFlBQVksQ0FBQyxTQUFvQixFQUFFLE1BQWM7SUFDckUsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFBLGdCQUFRLEVBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2hELElBQUksQ0FBQyxLQUFLO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFDdEIsTUFBTSxVQUFVLEdBQUcsZ0JBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ25ELE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNsQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDdkMsQ0FBQztBQU5ELG9DQU1DIn0=