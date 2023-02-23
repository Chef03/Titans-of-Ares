"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventory = exports.removeInventory = exports.addInventory = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
async function addInventory($userID, $itemID, count = 1) {
    const sql = `
  INSERT INTO Inventory (OwnerID, ItemID)
  VALUES ($userID, $itemID)
  `;
    let result;
    await (0, promiseWrapper_1.dbRun)('BEGIN TRANSACTION');
    for (let i = 0; i < count; i++) {
        result = await (0, promiseWrapper_1.dbRun)(sql, { $userID, $itemID });
    }
    await (0, promiseWrapper_1.dbRun)('COMMIT');
    return result;
}
exports.addInventory = addInventory;
async function removeInventory($ownerID, $itemID, count = 1) {
    const sql = `
  DELETE FROM Inventory
  WHERE ID = (
    SELECT ID 
    FROM Inventory 
    WHERE OwnerID = $ownerID AND ItemID = $itemID 
    LIMIT 1)
  `;
    await (0, promiseWrapper_1.dbRun)('BEGIN TRANSACTION');
    for (let i = 0; i < count; i++) {
        await (0, promiseWrapper_1.dbRun)(sql, { $ownerID, $itemID });
    }
    await (0, promiseWrapper_1.dbRun)('COMMIT');
}
exports.removeInventory = removeInventory;
function getInventory($userID) {
    const sql = `
  SELECT
    Inventory.ID as ID,
    OwnerID,
    Created,
    ItemID,
    Gear.Level,
    Gear.Equipped
  FROM Inventory 
  LEFT JOIN Gear
  ON Gear.InventoryID = Inventory.ID
  LEFT JOIN Rewards 
  ON Rewards.InventoryID = Inventory.ID
  WHERE 
    IIF(Gear.Equipped = 0 OR Gear.Equipped = 1, 
      Gear.Equipped = 0 AND Inventory.OwnerID = $userID, 
      Inventory.OwnerID = $userID)
  `;
    return (0, promiseWrapper_1.dbAll)(sql, { $userID });
}
exports.getInventory = getInventory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52ZW50b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RiL2ludmVudG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxREFBZ0Q7QUFTekMsS0FBSyxVQUFVLFlBQVksQ0FBQyxPQUFlLEVBQUUsT0FBZSxFQUFFLEtBQUssR0FBRyxDQUFDO0lBQzVFLE1BQU0sR0FBRyxHQUFHOzs7R0FHWCxDQUFDO0lBRUYsSUFBSSxNQUFjLENBQUM7SUFFbkIsTUFBTSxJQUFBLHNCQUFLLEVBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzlCLE1BQU0sR0FBRyxNQUFNLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztLQUNqRDtJQUNELE1BQU0sSUFBQSxzQkFBSyxFQUFDLFFBQVEsQ0FBQyxDQUFDO0lBRXRCLE9BQU8sTUFBTyxDQUFDO0FBQ2pCLENBQUM7QUFmRCxvQ0FlQztBQUVNLEtBQUssVUFBVSxlQUFlLENBQUMsUUFBZ0IsRUFBRSxPQUFlLEVBQUUsS0FBSyxHQUFHLENBQUM7SUFDaEYsTUFBTSxHQUFHLEdBQUc7Ozs7Ozs7R0FPWCxDQUFDO0lBRUYsTUFBTSxJQUFBLHNCQUFLLEVBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNqQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzlCLE1BQU0sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQ3pDO0lBQ0QsTUFBTSxJQUFBLHNCQUFLLEVBQUMsUUFBUSxDQUFDLENBQUM7QUFDeEIsQ0FBQztBQWZELDBDQWVDO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLE9BQWU7SUFDMUMsTUFBTSxHQUFHLEdBQUc7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUJYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBTyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFyQkQsb0NBcUJDIn0=