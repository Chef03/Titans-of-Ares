"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const events_1 = __importDefault(require("events"));
var Level;
(function (Level) {
    Level["INFO"] = "INFO";
    Level["DEBUG"] = "DEBUG";
    Level["WARN"] = "WARN";
    Level["ERROR"] = "ERROR";
})(Level || (Level = {}));
class Log extends events_1.default {
    log(level, msg, info) {
        const logText = `[${Level}] ${msg}: ${info || ''}`;
        this.emit(level, logText, info);
    }
    logInfo(msg, info) {
        this.log(Level.INFO, msg, info);
    }
    logDebug(msg, info) {
        this.log(Level.DEBUG, msg, info);
    }
    logWarn(msg, info) {
        this.log(Level.WARN, msg, info);
    }
    logError(msg, info) {
        this.log(Level.ERROR, msg, info);
    }
}
exports.Log = Log;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9Mb2cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsb0RBQWtDO0FBR2xDLElBQUssS0FLSjtBQUxELFdBQUssS0FBSztJQUNSLHNCQUFhLENBQUE7SUFDYix3QkFBZSxDQUFBO0lBQ2Ysc0JBQWEsQ0FBQTtJQUNiLHdCQUFlLENBQUE7QUFDakIsQ0FBQyxFQUxJLEtBQUssS0FBTCxLQUFLLFFBS1Q7QUFTRCxNQUFhLEdBQUksU0FBUSxnQkFBWTtJQUNuQyxHQUFHLENBQUMsS0FBWSxFQUFFLEdBQVcsRUFBRSxJQUE4QjtRQUMzRCxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssS0FBSyxHQUFHLEtBQUssSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsT0FBTyxDQUFDLEdBQVcsRUFBRSxJQUE4QjtRQUNqRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBVyxFQUFFLElBQThCO1FBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVELE9BQU8sQ0FBQyxHQUFXLEVBQUUsSUFBOEI7UUFDakQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQVcsRUFBRSxJQUE4QjtRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7Q0FDRjtBQXJCRCxrQkFxQkMifQ==