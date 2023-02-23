"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const List_1 = require("./List");
/** manage items to be easily filtered and accessed */
class Inventory {
    constructor(items) {
        this.chests = new List_1.List();
        this.fragments = new List_1.List();
        this.gears = new List_1.List();
        this.rewards = new List_1.List();
        this.scrolls = new List_1.List();
        this.picks = new List_1.List();
        this.stones = new List_1.List();
        this.gems = new List_1.List();
        for (const item of items) {
            const itemID = item.id;
            const category = itemID.split('_')[0];
            switch (category) {
                case 'chest':
                    this.chests.push(item);
                    break;
                case 'fragment':
                    this.fragments.push(item);
                    break;
                case 'gear':
                    this.gears.push(item);
                    break;
                case 'reward':
                    this.rewards.push(item);
                    break;
                case 'scroll':
                    if (itemID === 'scroll_arena') {
                        this.scrolls.push(item);
                    }
                    else {
                        this.scrolls.push(item);
                    }
                    break;
                case 'pick':
                    this.picks.push(item);
                    break;
                case 'stone':
                    this.stones.push(item);
                    break;
                case 'gem':
                    this.gems.push(item);
                    break;
            }
        }
        // sort gems
        this.gems.sort((a, b) => b.rarity - a.rarity);
    }
    get all() {
        return List_1.List.from([
            ...this.chests,
            ...this.fragments,
            ...this.gears,
            ...this.scrolls,
            ...this.stones,
            ...this.gems,
            ...this.picks,
        ]);
    }
}
exports.Inventory = Inventory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9JbnZlbnRvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsaUNBQThCO0FBUTlCLHNEQUFzRDtBQUN0RCxNQUFhLFNBQVM7SUFpQnBCLFlBQVksS0FBYTtRQWhCekIsV0FBTSxHQUFHLElBQUksV0FBSSxFQUFTLENBQUM7UUFFM0IsY0FBUyxHQUFHLElBQUksV0FBSSxFQUFZLENBQUM7UUFFakMsVUFBSyxHQUFHLElBQUksV0FBSSxFQUFRLENBQUM7UUFFekIsWUFBTyxHQUFHLElBQUksV0FBSSxFQUFVLENBQUM7UUFFN0IsWUFBTyxHQUFHLElBQUksV0FBSSxFQUFVLENBQUM7UUFFN0IsVUFBSyxHQUFHLElBQUksV0FBSSxFQUFjLENBQUM7UUFFL0IsV0FBTSxHQUFHLElBQUksV0FBSSxFQUFTLENBQUM7UUFFM0IsU0FBSSxHQUFHLElBQUksV0FBSSxFQUFPLENBQUM7UUFHckIsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUU7WUFDeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN2QixNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLFFBQVEsUUFBUSxFQUFFO2dCQUNoQixLQUFLLE9BQU87b0JBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBYSxDQUFDLENBQUM7b0JBQ2hDLE1BQU07Z0JBQ1IsS0FBSyxVQUFVO29CQUNiLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQWdCLENBQUMsQ0FBQztvQkFDdEMsTUFBTTtnQkFDUixLQUFLLE1BQU07b0JBQ1QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBWSxDQUFDLENBQUM7b0JBQzlCLE1BQU07Z0JBQ1IsS0FBSyxRQUFRO29CQUNYLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQWMsQ0FBQyxDQUFDO29CQUNsQyxNQUFNO2dCQUNSLEtBQUssUUFBUTtvQkFDWCxJQUFJLE1BQU0sS0FBSyxjQUFjLEVBQUU7d0JBQzdCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQW1CLENBQUMsQ0FBQztxQkFDeEM7eUJBQU07d0JBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBYyxDQUFDLENBQUM7cUJBQ25DO29CQUNELE1BQU07Z0JBQ1IsS0FBSyxNQUFNO29CQUNULElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQWtCLENBQUMsQ0FBQztvQkFDcEMsTUFBTTtnQkFDUixLQUFLLE9BQU87b0JBQ1YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBa0IsQ0FBQyxDQUFDO29CQUNyQyxNQUFNO2dCQUNSLEtBQUssS0FBSztvQkFDUixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFXLENBQUMsQ0FBQztvQkFDNUIsTUFBTTthQUNUO1NBQ0Y7UUFFRCxZQUFZO1FBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoRCxDQUFDO0lBRUQsSUFBSSxHQUFHO1FBQ0wsT0FBTyxXQUFJLENBQUMsSUFBSSxDQUFDO1lBQ2YsR0FBRyxJQUFJLENBQUMsTUFBTTtZQUNkLEdBQUcsSUFBSSxDQUFDLFNBQVM7WUFDakIsR0FBRyxJQUFJLENBQUMsS0FBSztZQUNiLEdBQUcsSUFBSSxDQUFDLE9BQU87WUFDZixHQUFHLElBQUksQ0FBQyxNQUFNO1lBQ2QsR0FBRyxJQUFJLENBQUMsSUFBSTtZQUNaLEdBQUcsSUFBSSxDQUFDLEtBQUs7U0FDZCxDQUFDLENBQUM7SUFDTCxDQUFDO0NBQ0Y7QUFwRUQsOEJBb0VDIn0=