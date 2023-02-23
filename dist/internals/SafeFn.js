"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeFn = void 0;
/** SafeFn prevents same async function to be executed while other is running */
class SafeFn {
    constructor() {
        this.fn = new Map();
        this.running = new Set();
    }
    add(id, fn) {
        this.fn.set(id, fn);
    }
    async exec(id) {
        if (!this.fn.has(id)) {
            throw new Error(`cannot find "${id}"`);
        }
        if (this.running.has(id)) {
            throw new Error(`"${id}" is already running`);
        }
        const fn = this.fn.get(id);
        try {
            this.running.add(id);
            const result = await fn();
            return result;
        }
        finally {
            this.running.delete(id);
        }
    }
}
exports.SafeFn = SafeFn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2FmZUZuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9TYWZlRm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsZ0ZBQWdGO0FBQ2hGLE1BQWEsTUFBTTtJQUFuQjtRQUNVLE9BQUUsR0FBRyxJQUFJLEdBQUcsRUFBYyxDQUFDO1FBRTNCLFlBQU8sR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO0lBeUJ0QyxDQUFDO0lBdkJDLEdBQUcsQ0FBQyxFQUFVLEVBQUUsRUFBTTtRQUNwQixJQUFJLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBVTtRQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN4QztRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztTQUMvQztRQUVELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBRSxDQUFDO1FBRTVCLElBQUk7WUFDRixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNyQixNQUFNLE1BQU0sR0FBRyxNQUFNLEVBQUUsRUFBRSxDQUFDO1lBQzFCLE9BQU8sTUFBTSxDQUFDO1NBQ2Y7Z0JBQVM7WUFDUixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUN6QjtJQUNILENBQUM7Q0FDRjtBQTVCRCx3QkE0QkMifQ==