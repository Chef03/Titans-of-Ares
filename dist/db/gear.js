"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGears = exports.addGear = exports.levelupGear = exports.unequipGear = exports.equipGear = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
const update = (stmt) => `
  UPDATE Gear
  SET ${stmt}
  WHERE InventoryID = (
    SELECT ID 
    FROM Inventory 
    WHERE OwnerID = $userID AND ItemID = $itemID
    LIMIT 1
  )
  `;
function equipGear($userID, $itemID) {
    const sql = update('Equipped = TRUE');
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $itemID });
}
exports.equipGear = equipGear;
function unequipGear($userID, $itemID) {
    const sql = update('Equipped = FALSE');
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $itemID });
}
exports.unequipGear = unequipGear;
function levelupGear($userID, $itemID) {
    const sql = update('Level = Level + 1');
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $itemID });
}
exports.levelupGear = levelupGear;
async function addGear($inventoryID) {
    const sql = `
  INSERT INTO Gear (InventoryID)
  VALUES ($inventoryID)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $inventoryID });
}
exports.addGear = addGear;
async function getGears($userID) {
    const sql = `
  SELECT * FROM Gear
  INNER JOIN Inventory
  ON Gear.InventoryID = Inventory.ID
  WHERE Inventory.OwnerID = $userID
  `;
    const gears = await (0, promiseWrapper_1.dbAll)(sql, { $userID });
    return gears.map((x) => ({ ...x, Equipped: !!x.Equipped }));
}
exports.getGears = getGears;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2Vhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYi9nZWFyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFEQUFnRDtBQVloRCxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFLENBQUM7O1FBRXpCLElBQUk7Ozs7Ozs7R0FPVCxDQUFDO0FBRUosU0FBZ0IsU0FBUyxDQUFDLE9BQWUsRUFBRSxPQUFlO0lBQ3hELE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBRXRDLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFKRCw4QkFJQztBQUVELFNBQWdCLFdBQVcsQ0FBQyxPQUFlLEVBQUUsT0FBZTtJQUMxRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUV2QyxPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBSkQsa0NBSUM7QUFFRCxTQUFnQixXQUFXLENBQUMsT0FBZSxFQUFFLE9BQWU7SUFDMUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFFeEMsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUpELGtDQUlDO0FBRU0sS0FBSyxVQUFVLE9BQU8sQ0FBQyxZQUFvQjtJQUNoRCxNQUFNLEdBQUcsR0FBRzs7O0dBR1gsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDdEMsQ0FBQztBQVBELDBCQU9DO0FBR00sS0FBSyxVQUFVLFFBQVEsQ0FBQyxPQUFlO0lBQzVDLE1BQU0sR0FBRyxHQUFHOzs7OztHQUtYLENBQUM7SUFFRixNQUFNLEtBQUssR0FBRyxNQUFNLElBQUEsc0JBQUssRUFBVSxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQVcsQ0FBQztBQUNqRixDQUFDO0FBVkQsNEJBVUMifQ==