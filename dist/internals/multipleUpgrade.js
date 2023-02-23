"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgrade = void 0;
const gear_1 = require("../db/gear");
const inventory_1 = require("../db/inventory");
const utils_1 = require("./utils");
const main_1 = require("../main");
function upgrade(item, msg, player, count) {
    const safeFnID = `multi_upgrade_${player.id}_${count}`;
    const handler = async () => {
        const { scroll } = item;
        let scrollCount = player.inventory.all.count(scroll.id);
        let scrollLost = 0;
        let upgradeSuccess = false;
        for (let i = 0; i < count; i++) {
            if (item.level >= 10) {
                return msg.channel.send('Gear is on max level');
            }
            if (scrollCount === 0) {
                // bulk remove on failed upgrade midway
                await (0, inventory_1.removeInventory)(player.id, scroll.id, scrollLost);
                return msg.channel.send('Insufficient scroll');
            }
            scrollLost++;
            scrollCount--;
            const animation = await msg.channel.send(item.upgradeAnimation());
            await (0, utils_1.sleep)(5000);
            upgradeSuccess = item.upgrade();
            if (upgradeSuccess) {
                await animation.edit(`Successfully upgraded **${item.name}** to level ${item.level + 1}!`);
                break;
            }
            else {
                await animation.edit(`Upgrade process for ${item.name} failed`);
            }
        }
        try {
            // bulk remove on finish
            await (0, inventory_1.removeInventory)(player.id, scroll.id, scrollLost);
            if (upgradeSuccess) {
                await (0, gear_1.levelupGear)(player.id, item.id);
            }
        }
        catch (err) {
            console.error(err);
        }
    };
    main_1.client.safeFn.add(safeFnID, handler);
    return async () => {
        try {
            await main_1.client.safeFn.exec(safeFnID);
        }
        catch {
            msg.channel.send('There is already multiple upgrade running');
        }
    };
}
exports.upgrade = upgrade;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlwbGVVcGdyYWRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9tdWx0aXBsZVVwZ3JhZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUNBQXlDO0FBQ3pDLCtDQUFrRDtBQUdsRCxtQ0FBZ0M7QUFDaEMsa0NBQWlDO0FBRWpDLFNBQWdCLE9BQU8sQ0FDckIsSUFBVSxFQUNWLEdBQVksRUFDWixNQUFjLEVBQ2QsS0FBYTtJQUViLE1BQU0sUUFBUSxHQUFHLGlCQUFpQixNQUFNLENBQUMsRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDO0lBQ3ZELE1BQU0sT0FBTyxHQUFHLEtBQUssSUFBSSxFQUFFO1FBQ3pCLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDeEIsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBRTNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUIsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsRUFBRTtnQkFDcEIsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO2FBQ2pEO1lBQUMsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFO2dCQUN2Qix1Q0FBdUM7Z0JBQ3ZDLE1BQU0sSUFBQSwyQkFBZSxFQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztnQkFDeEQsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO2FBQ2hEO1lBRUQsVUFBVSxFQUFFLENBQUM7WUFDYixXQUFXLEVBQUUsQ0FBQztZQUNkLE1BQU0sU0FBUyxHQUFHLE1BQU0sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztZQUNsRSxNQUFNLElBQUEsYUFBSyxFQUFDLElBQUksQ0FBQyxDQUFDO1lBRWxCLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFFaEMsSUFBSSxjQUFjLEVBQUU7Z0JBQ2xCLE1BQU0sU0FBUyxDQUFDLElBQUksQ0FDbEIsMkJBQTJCLElBQUksQ0FBQyxJQUFJLGVBQWUsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FDckUsQ0FBQztnQkFDRixNQUFNO2FBQ1A7aUJBQU07Z0JBQ0wsTUFBTSxTQUFTLENBQUMsSUFBSSxDQUFDLHVCQUF1QixJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQzthQUNqRTtTQUNGO1FBRUQsSUFBSTtZQUNGLHdCQUF3QjtZQUN4QixNQUFNLElBQUEsMkJBQWUsRUFBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDeEQsSUFBSSxjQUFjLEVBQUU7Z0JBQ2xCLE1BQU0sSUFBQSxrQkFBVyxFQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3ZDO1NBQ0Y7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDcEI7SUFDSCxDQUFDLENBQUM7SUFFRixhQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFckMsT0FBTyxLQUFLLElBQUksRUFBRTtRQUNoQixJQUFJO1lBQ0YsTUFBTSxhQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNwQztRQUFDLE1BQU07WUFDTixHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1NBQy9EO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQTNERCwwQkEyREMifQ==