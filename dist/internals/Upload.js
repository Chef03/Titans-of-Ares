"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Upload = void 0;
const luxon_1 = require("luxon");
const updateRanks_1 = __importDefault(require("./updateRanks"));
class Upload {
    static async mainLoop() {
        const now = luxon_1.DateTime.now();
        if (now.hour == 7 && now.minute == 0) {
            await (0, updateRanks_1.default)();
        }
    }
}
exports.Upload = Upload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9VcGxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsaUNBQWdDO0FBQ2hDLGdFQUF3QztBQUV4QyxNQUFhLE1BQU07SUFFZixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVE7UUFFakIsTUFBTSxHQUFHLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMzQixJQUFJLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBRWxDLE1BQU0sSUFBQSxxQkFBVyxHQUFFLENBQUM7U0FFdkI7SUFFTCxDQUFDO0NBRUo7QUFiRCx3QkFhQyJ9