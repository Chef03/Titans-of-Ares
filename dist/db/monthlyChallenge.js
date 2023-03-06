"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDayEntry = exports.OverlapError = exports.getDayEntries = exports.addDayEntry = exports.replaceDayEntry = exports.deleteDayEntry = exports.registerChallenge = exports.getEntryCount = exports.getEntryID = exports.getConversionRate = exports.getConvertTable = exports.getConversions = exports.getCurrentChallenge = exports.getChallengeByChannelID = exports.getChallengeId = void 0;
const promiseWrapper_1 = require("./promiseWrapper");
async function getChallengeId($channelId) {
    const sql = `
    SELECT ID
    FROM Challenge
    WHERE ProofChannel = $channelId
  `;
    const result = await (0, promiseWrapper_1.dbAll)(sql, { $channelId });
    return result[0]?.ID;
}
exports.getChallengeId = getChallengeId;
async function getChallengeByChannelID($channelId) {
    const sql = `
    SELECT *
    FROM Challenge
    WHERE ProofChannel = $channelId
  `;
    return (0, promiseWrapper_1.dbGet)(sql, { $channelId });
}
exports.getChallengeByChannelID = getChallengeByChannelID;
async function getCurrentChallenge() {
    const sql = `
  SELECT
    ID,
    Name,
    Days,
    Goal,
    CAST(ProofChannel AS TEXT) AS ProofChannel,
    CAST(LeaderBoardChannel AS TEXT) AS LeaderBoardChannel,
    Active,
    GoldCutoff,
    SilverCutoff,
    BronzeCutoff
  FROM Challenge
  ORDER BY ID DESC LIMIT 1
  `;
    return (0, promiseWrapper_1.dbGet)(sql);
}
exports.getCurrentChallenge = getCurrentChallenge;
async function getConversions() {
    const sql = `
  SELECT ChallengeId, Name, PointsValue, DailyLimit
  FROM Conversion
  `;
    return (0, promiseWrapper_1.dbAll)(sql);
}
exports.getConversions = getConversions;
async function getConvertTable() {
    const conversions = await getConversions();
    const convertTable = new Map();
    conversions.forEach(convert => {
        const tag = `${convert.Name}-${convert.ChallengeID}`;
        convertTable.set(tag, convert.PointsValue);
    });
    return convertTable;
}
exports.getConvertTable = getConvertTable;
async function getConversionRate(lookupID) {
    const convertTable = await getConvertTable();
    const conversionRate = convertTable.get(lookupID);
    // throw new Error(`conversion rate does not exists for "${lookupID}"`);
    return conversionRate || 0;
}
exports.getConversionRate = getConversionRate;
async function getEntryID($userID, $challengeID) {
    const sql = `
    SELECT ID
    FROM ChallengeEntry
    WHERE DiscordID = $userID AND ChallengeID = $challengeID
  `;
    const result = await (0, promiseWrapper_1.dbGet)(sql, { $userID, $challengeID });
    return result?.ID;
}
exports.getEntryID = getEntryID;
async function getEntryCount(category, userID) {
    const challenge = await getCurrentChallenge();
    const result = await getDayEntries(userID, challenge.ID);
    const parsedData = result.filter(entry => entry.ValueType === category);
    return parsedData.length;
}
exports.getEntryCount = getEntryCount;
async function registerChallenge($userID, $challengeID) {
    const sql = `
    INSERT INTO ChallengeEntry (DiscordID, ChallengeID)
    VALUES ($userID, $challengeID)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $userID, $challengeID });
}
exports.registerChallenge = registerChallenge;
async function deleteDayEntry($userID, $day, $challengeID, $challengeName) {
    const sql = `
    DELETE FROM DayEntry WHERE EntryID = $entryID AND Day = $day AND ValueType = $challengeName
  `;
    const $entryID = await getEntryID($userID, $challengeID);
    return (0, promiseWrapper_1.dbRun)(sql, { $entryID, $day, $challengeName });
}
exports.deleteDayEntry = deleteDayEntry;
async function replaceDayEntry($userID, $day, $challengeID, $challengeName, $value) {
    const sql = `
    UPDATE DayEntry
    SET Value = $value
    WHERE EntryID = $entryID AND Day = $day AND ValueType = $challengeName
  `;
    const $entryID = await getEntryID($userID, $challengeID);
    return (0, promiseWrapper_1.dbRun)(sql, { $entryID, $day, $challengeName, $value });
}
exports.replaceDayEntry = replaceDayEntry;
async function addDayEntry($userID, $day, $challengeID, $challengeName, $value) {
    const sql = `
    UPDATE DayEntry
    SET Value = Value + $value
    WHERE EntryID = $entryID AND Day = $day AND ValueType = $challengeName
  `;
    const $entryID = await getEntryID($userID, $challengeID);
    return (0, promiseWrapper_1.dbRun)(sql, { $entryID, $day, $challengeName, $value });
}
exports.addDayEntry = addDayEntry;
async function getDayEntries($userID, $challengeID) {
    const sql = `
    SELECT *
    FROM DayEntry
    WHERE EntryID = $entryID
  `;
    const $entryID = await getEntryID($userID, $challengeID);
    return (0, promiseWrapper_1.dbAll)(sql, { $entryID });
}
exports.getDayEntries = getDayEntries;
class OverlapError extends Error {
    constructor(dayEntry) {
        super("overlap error");
        this.dayEntry = dayEntry;
    }
}
exports.OverlapError = OverlapError;
/**
 * Adds point for a particular challenge, day and challenge type.
 * Throws DayEntry there is conflict. Conflict should be handled.
 * */
async function registerDayEntry($userID, $day, $challengeID, $valueType, $value) {
    let $entryID = await getEntryID($userID, $challengeID);
    if ($entryID === undefined) {
        $entryID = await registerChallenge($userID, $challengeID);
    }
    let sql = `
    SELECT * FROM DayEntry
    WHERE EntryID = $entryID AND Day = $day AND ValueType = '${$valueType}'
  `;
    const conflict = await (0, promiseWrapper_1.dbGet)(sql, { $entryID, $day });
    if (conflict !== undefined) {
        throw new OverlapError(conflict);
    }
    sql = `
    INSERT INTO DayEntry (EntryID, Day, ValueType, Value)
    VALUES ($entryID, $day, '${$valueType}', $value)
  `;
    return (0, promiseWrapper_1.dbRun)(sql, { $entryID, $day, $value });
}
exports.registerDayEntry = registerDayEntry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9udGhseUNoYWxsZW5nZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9kYi9tb250aGx5Q2hhbGxlbmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHFEQUF1RDtBQWdDaEQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxVQUFrQjtJQUVyRCxNQUFNLEdBQUcsR0FBRzs7OztHQUlYLENBQUE7SUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsc0JBQUssRUFBaUIsR0FBRyxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQztJQUNoRSxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDdkIsQ0FBQztBQVZELHdDQVVDO0FBRU0sS0FBSyxVQUFVLHVCQUF1QixDQUFDLFVBQWtCO0lBRTlELE1BQU0sR0FBRyxHQUFHOzs7O0dBSVgsQ0FBQTtJQUVELE9BQU8sSUFBQSxzQkFBSyxFQUFZLEdBQUcsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQVRELDBEQVNDO0FBK0JNLEtBQUssVUFBVSxtQkFBbUI7SUFDdkMsTUFBTSxHQUFHLEdBQUc7Ozs7Ozs7Ozs7Ozs7O0dBY1gsQ0FBQTtJQUVELE9BQU8sSUFBQSxzQkFBSyxFQUFZLEdBQUcsQ0FBQyxDQUFDO0FBQy9CLENBQUM7QUFsQkQsa0RBa0JDO0FBU00sS0FBSyxVQUFVLGNBQWM7SUFFbEMsTUFBTSxHQUFHLEdBQUc7OztHQUdYLENBQUE7SUFFRCxPQUFPLElBQUEsc0JBQUssRUFBYSxHQUFHLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBUkQsd0NBUUM7QUFFTSxLQUFLLFVBQVUsZUFBZTtJQUVuQyxNQUFNLFdBQVcsR0FBRyxNQUFNLGNBQWMsRUFBRSxDQUFDO0lBQzNDLE1BQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBRS9DLFdBQVcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7UUFD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