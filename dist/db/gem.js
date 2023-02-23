"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMiningPickReward = exports.desocketGem = exports.socketGem = exports.getAllGems = exports.getAllSocketedGem = exports.removeGem = exports.addGem = exports.getGem = void 0;
const luxon_1 = require("luxon");
const Mining_1 = require("../internals/Mining");
const inventory_1 = require("./inventory");
const promiseWrapper_1 = require("./promiseWrapper");
async function getGem($userID, $itemID) {
    const sql = `
  SELECT 
    Gem.ID,
    Gem.Created,
    InventoryID,
    Inventory.ItemID AS ItemID,
    GearID
  FROM Gem
  INNER JOIN Inventory
  ON Inventory.ID = Gem.InventoryID
  WHERE Inventory.OwnerID = $userID AND Inventory.ItemID = $itemID
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $userID, $itemID });
}
exports.getGem = getGem;
async function addGem($userID, $itemID) {
    if ($itemID === (new Mining_1.RoughStone()).id) {
        await (0, inventory_1.addInventory)($userID, $itemID);
        return;
    }
    const $inventoryID = await (0, inventory_1.addInventory)($userID, $itemID);
    const $created = luxon_1.DateTime.now().toISO();
    const sql = `
  INSERT INTO Gem (Created, InventoryID)
  VALUES ($created, $inventoryID)
  `;
    await (0, promiseWrapper_1.dbRun)(sql, { $inventoryID, $created });
}
exports.addGem = addGem;
async function removeGem($userID, $itemID) {
    const gem = await getGem($userID, $itemID);
    const $gemID = gem.ID;
    const $inventoryID = gem.InventoryID;
    let sql = `
    DELETE FROM Inventory WHERE ID = $inventoryID
  `;
    await (0, promiseWrapper_1.dbRun)(sql, { $inventoryID });
    sql = `
    DELETE FROM Gem WHERE ID = $gemID
  `;
    await (0, promiseWrapper_1.dbRun)(sql, { $gemID });
}
exports.removeGem = removeGem;
async function getAllSocketedGem($userID) {
    const sql = `
  SELECT 
    Gem.ID,
    Gem.Created,
    InventoryID,
    Inventory.ItemID AS ItemID,
    GearID
  FROM Gem
  INNER JOIN Inventory
  ON Inventory.ID = Gem.InventoryID
  WHERE Inventory.OwnerID = $userID AND GearID != ''
  `;
    return (0, promiseWrapper_1.dbAll)(sql, { $userID });
}
exports.getAllSocketedGem = getAllSocketedGem;
async function getAllGems($userID) {
    const sql = `
  SELECT 
    Gem.ID,
    Gem.Created,
    InventoryID,
    Inventory.ItemID AS ItemID,
    GearID
  FROM Gem
  INNER JOIN Inventory
  ON Inventory.ID = Gem.InventoryID
  WHERE Inventory.OwnerID = $userID
  `;
    return (0, promiseWrapper_1.dbAll)(sql, { $userID });
}
exports.getAllGems = getAllGems;
async function socketGem($gemInventoryID, $gearID) {
    const sql = `
    UPDATE Gem 
    SET GearID = $gearID
    WHERE InventoryID = $gemInventoryID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $gemInventoryID, $gearID });
}
exports.socketGem = socketGem;
async function desocketGem($gemInventoryID) {
    const sql = `
    UPDATE Gem 
    SET GearID = NULL
    WHERE InventoryID = $gemInventoryID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $gemInventoryID });
}
exports.desocketGem = desocketGem;
async function setMiningPickReward($userID, $upperLimit) {
    const sql = `
  UPDATE Player
  SET MiningPickReward = $upperLimit
  WHERE DiscordID = $userID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $upperLimit });
}
exports.setMiningPickReward = setMiningPickReward;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RiL2dlbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBaUM7QUFDakMsZ0RBQWlEO0FBQ2pELDJDQUEyQztBQUMzQyxxREFBdUQ7QUFVaEQsS0FBSyxVQUFVLE1BQU0sQ0FBQyxPQUFlLEVBQUUsT0FBZTtJQUMzRCxNQUFNLEdBQUcsR0FBRzs7Ozs7Ozs7Ozs7R0FXWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQVEsR0FBRyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQWZELHdCQWVDO0FBRU0sS0FBSyxVQUFVLE1BQU0sQ0FBQyxPQUFlLEVBQUUsT0FBZTtJQUMzRCxJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksbUJBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ3JDLE1BQU0sSUFBQSx3QkFBWSxFQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNyQyxPQUFPO0tBQ1I7SUFFRCxNQUFNLFlBQVksR0FBRyxNQUFNLElBQUEsd0JBQVksRUFBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDMUQsTUFBTSxRQUFRLEdBQUcsZ0JBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUV4QyxNQUFNLEdBQUcsR0FBRzs7O0dBR1gsQ0FBQztJQUVGLE1BQU0sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFmRCx3QkFlQztBQUVNLEtBQUssVUFBVSxTQUFTLENBQUMsT0FBZSxFQUFFLE9BQWU7SUFDOUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzNDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUM7SUFDdEIsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQztJQUVyQyxJQUFJLEdBQUcsR0FBRzs7R0FFVCxDQUFDO0lBQ0YsTUFBTSxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQztJQUVuQyxHQUFHLEdBQUc7O0dBRUwsQ0FBQztJQUVGLE1BQU0sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQWZELDhCQWVDO0FBRU0sS0FBSyxVQUFVLGlCQUFpQixDQUFDLE9BQWU7SUFDckQsTUFBTSxHQUFHLEdBQUc7Ozs7Ozs7Ozs7O0dBV1gsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFRLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDeEMsQ0FBQztBQWZELDhDQWVDO0FBRU0sS0FBSyxVQUFVLFVBQVUsQ0FBQyxPQUFlO0lBQzlDLE1BQU0sR0FBRyxHQUFHOzs7Ozs7Ozs7OztHQVdYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBUSxHQUFHLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUFmRCxnQ0FlQztBQUVNLEtBQUssVUFBVSxTQUFTLENBQUMsZUFBdUIsRUFBRSxPQUFlO0lBQ3RFLE1BQU0sR0FBRyxHQUFHOzs7O0dBSVgsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2xELENBQUM7QUFSRCw4QkFRQztBQUVNLEtBQUssVUFBVSxXQUFXLENBQUMsZUFBdUI7SUFDdkQsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQztBQUN6QyxDQUFDO0FBUkQsa0NBUUM7QUFFTSxLQUFLLFVBQVUsbUJBQW1CLENBQUMsT0FBZSxFQUFFLFdBQW1CO0lBQzVFLE1BQU0sR0FBRyxHQUFHOzs7O0dBSVgsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFSRCxrREFRQyJ9