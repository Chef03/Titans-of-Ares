"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setActivePet = exports.setInactivePet = exports.upgradePet = exports.addPet = exports.getAllPets = exports.getPet = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
async function getPet($ownerID, $petID) {
    const sql = `
  SELECT *
  FROM Pet
  WHERE OwnerID = $ownerID AND PetID = $petID
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $ownerID, $petID });
}
exports.getPet = getPet;
async function getAllPets($ownerID) {
    const sql = `
  SELECT *
  FROM PET
  WHERE OwnerID = $ownerID
  `;
    return (0, promiseWrapper_1.dbAll)(sql, { $ownerID });
}
exports.getAllPets = getAllPets;
function addPet($ownerID, $petID) {
    const sql = `
  INSERT INTO Pet (OwnerID, PetID)
  VALUES ($ownerID, $petID)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $ownerID, $petID });
}
exports.addPet = addPet;
function upgradePet($ownerID, $petID, $star = 1) {
    const sql = `
  UPDATE Pet
  SET Star = Star + $star
  WHERE OwnerID = $ownerID AND PetID = $petID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $ownerID, $petID, $star });
}
exports.upgradePet = upgradePet;
function setInactivePet($ownerID) {
    // set all pet inactive
    const sql = `
  UPDATE Pet
  SET Active = 0
  WHERE OwnerID = $ownerID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $ownerID });
}
exports.setInactivePet = setInactivePet;
async function setActivePet($ownerID, $petID) {
    await setInactivePet($ownerID);
    // set selected pet active
    const sql = `
  UPDATE Pet
  SET Active = 1
  WHERE OwnerID = $ownerID AND PetID = $petID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $ownerID, $petID });
}
exports.setActivePet = setActivePet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RiL3BldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxREFBdUQ7QUFXaEQsS0FBSyxVQUFVLE1BQU0sQ0FBQyxRQUFnQixFQUFFLE1BQWM7SUFDM0QsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQU0sR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQVJELHdCQVFDO0FBRU0sS0FBSyxVQUFVLFVBQVUsQ0FBQyxRQUFnQjtJQUMvQyxNQUFNLEdBQUcsR0FBRzs7OztHQUlYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBTSxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFSRCxnQ0FRQztBQUVELFNBQWdCLE1BQU0sQ0FBQyxRQUFnQixFQUFFLE1BQWM7SUFDckQsTUFBTSxHQUFHLEdBQUc7OztHQUdYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBUEQsd0JBT0M7QUFFRCxTQUFnQixVQUFVLENBQUMsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsS0FBSyxHQUFHLENBQUM7SUFDcEUsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFSRCxnQ0FRQztBQUVELFNBQWdCLGNBQWMsQ0FBQyxRQUFnQjtJQUM3Qyx1QkFBdUI7SUFDdkIsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBVEQsd0NBU0M7QUFFTSxLQUFLLFVBQVUsWUFBWSxDQUFDLFFBQWdCLEVBQUUsTUFBYztJQUNqRSxNQUFNLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUUvQiwwQkFBMEI7SUFDMUIsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQVhELG9DQVdDIn0=