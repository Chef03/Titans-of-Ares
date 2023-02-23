"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMessage = exports.setTeam = exports.setPhase = exports.addArenaCoin = exports.leaveArena = exports.joinArena = exports.updatePoint = exports.deduceCharge = exports.getCandidates = exports.getCurrentArena = exports.createArena = void 0;
const luxon_1 = require("luxon");
const promiseWrapper_1 = require("./promiseWrapper");
function createArena($dateISO) {
    const sql = `
    INSERT INTO TeamArena (Created)
    VALUES ($dateISO)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $dateISO });
}
exports.createArena = createArena;
function getCurrentArena() {
    const sql = `
    SELECT * FROM TeamArena ORDER BY ID DESC LIMIT 1
  `;
    return (0, promiseWrapper_1.dbGet)(sql);
}
exports.getCurrentArena = getCurrentArena;
function getCandidates($arenaID) {
    const sql = `
    SELECT * FROM TeamArenaMember WHERE TeamArenaID = $arenaID
  `;
    return (0, promiseWrapper_1.dbAll)(sql, { $arenaID });
}
exports.getCandidates = getCandidates;
function deduceCharge($arenaID, $discordID) {
    const sql = `
  UPDATE TeamArenaMember
  SET Charge = Charge - 1
  WHERE TeamArenaID = $arenaID AND DiscordID = $discordID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $arenaID, $discordID });
}
exports.deduceCharge = deduceCharge;
function updatePoint($arenaID, $discordID, $amount) {
    const sql = `
  UPDATE TeamArenaMember
  SET Score = Score + $amount
  WHERE TeamArenaID = $arenaID AND DiscordID = $discordID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $arenaID, $discordID, $amount });
}
exports.updatePoint = updatePoint;
function joinArena($arenaID, $discordID) {
    const $now = luxon_1.DateTime.now().toISO();
    const sql = `
    INSERT INTO TeamArenaMember (Created, TeamArenaID, DiscordID)
    VALUES ($now, $arenaID, $discordID)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $now, $arenaID, $discordID });
}
exports.joinArena = joinArena;
function leaveArena($arenaID, $discordID) {
    const sql = `
    DELETE FROM TeamArenaMember
    WHERE TeamArenaID = $arenaID AND DiscordID = $discordID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $arenaID, $discordID });
}
exports.leaveArena = leaveArena;
function addArenaCoin($discordID, $amount) {
    const sql = `
  UPDATE Player
  SET ArenaCoin = ArenaCoin + $amount
  WHERE DiscordID = $discordID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $discordID, $amount });
}
exports.addArenaCoin = addArenaCoin;
function setPhase($arenaID, $phase) {
    const sql = `
  UPDATE TeamArena
  SET Phase = $phase
  WHERE ID = $arenaID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $arenaID, $phase });
}
exports.setPhase = setPhase;
function setTeam($arenaID, $discordID, $team) {
    const sql = `
  UPDATE TeamArenaMember
  SET Team = $team
  WHERE TeamArenaID = $arenaID AND DiscordID = $discordID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $arenaID, $discordID, $team });
}
exports.setTeam = setTeam;
function setMessage($arenaID, $messageID) {
    const sql = `
  UPDATE TeamArena
  SET MessageID = $messageID
  WHERE ID = $arenaID
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $arenaID, $messageID });
}
exports.setMessage = setMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVhbUFyZW5hLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2RiL3RlYW1BcmVuYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBaUM7QUFDakMscURBQXVEO0FBbUJ2RCxTQUFnQixXQUFXLENBQUMsUUFBZ0I7SUFDMUMsTUFBTSxHQUFHLEdBQUc7OztHQUdYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFQRCxrQ0FPQztBQUVELFNBQWdCLGVBQWU7SUFDN0IsTUFBTSxHQUFHLEdBQUc7O0dBRVgsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFORCwwQ0FNQztBQUVELFNBQWdCLGFBQWEsQ0FBQyxRQUFnQjtJQUM1QyxNQUFNLEdBQUcsR0FBRzs7R0FFWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQWtCLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7QUFDbkQsQ0FBQztBQU5ELHNDQU1DO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLFFBQWdCLEVBQUUsVUFBa0I7SUFDL0QsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQVJELG9DQVFDO0FBRUQsU0FBZ0IsV0FBVyxDQUFDLFFBQWdCLEVBQUUsVUFBa0IsRUFBRSxPQUFlO0lBQy9FLE1BQU0sR0FBRyxHQUFHOzs7O0dBSVgsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUN2RCxDQUFDO0FBUkQsa0NBUUM7QUFFRCxTQUFnQixTQUFTLENBQUMsUUFBZ0IsRUFBRSxVQUFrQjtJQUM1RCxNQUFNLElBQUksR0FBRyxnQkFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3BDLE1BQU0sR0FBRyxHQUFHOzs7R0FHWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFSRCw4QkFRQztBQUVELFNBQWdCLFVBQVUsQ0FBQyxRQUFnQixFQUFFLFVBQWtCO0lBQzdELE1BQU0sR0FBRyxHQUFHOzs7R0FHWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQVBELGdDQU9DO0FBRUQsU0FBZ0IsWUFBWSxDQUFDLFVBQWtCLEVBQUUsT0FBZTtJQUM5RCxNQUFNLEdBQUcsR0FBRzs7OztHQUlYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBUkQsb0NBUUM7QUFFRCxTQUFnQixRQUFRLENBQUMsUUFBZ0IsRUFBRSxNQUFjO0lBQ3ZELE1BQU0sR0FBRyxHQUFHOzs7O0dBSVgsQ0FBQztJQUVGLE9BQU8sSUFBQSxzQkFBSyxFQUFDLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFSRCw0QkFRQztBQUVELFNBQWdCLE9BQU8sQ0FBQyxRQUFnQixFQUFFLFVBQWtCLEVBQUUsS0FBYTtJQUN6RSxNQUFNLEdBQUcsR0FBRzs7OztHQUlYLENBQUM7SUFFRixPQUFPLElBQUEsc0JBQUssRUFBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7QUFDckQsQ0FBQztBQVJELDBCQVFDO0FBRUQsU0FBZ0IsVUFBVSxDQUFDLFFBQWdCLEVBQUUsVUFBa0I7SUFDN0QsTUFBTSxHQUFHLEdBQUc7Ozs7R0FJWCxDQUFDO0lBRUYsT0FBTyxJQUFBLHNCQUFLLEVBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQVJELGdDQVFDIn0=