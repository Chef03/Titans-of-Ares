"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const inventory_1 = require("../db/inventory");
class Item {
    async save(player) {
        await (0, inventory_1.addInventory)(player.id, this.id);
    }
}
exports.Item = Item;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSXRlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvSXRlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSwrQ0FBK0M7QUFFL0MsTUFBc0IsSUFBSTtJQU94QixLQUFLLENBQUMsSUFBSSxDQUFDLE1BQWM7UUFDdkIsTUFBTSxJQUFBLHdCQUFZLEVBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekMsQ0FBQztDQUNGO0FBVkQsb0JBVUMifQ==