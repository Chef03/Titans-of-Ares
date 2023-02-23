"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDecimal = exports.split = exports.italic = exports.bold = exports.inlineCode = exports.toNList = exports.toList = exports.sha1 = exports.nukeBotMessages = exports.nukeChannel = exports.roundTo = exports.totalLevelPassed = exports.upperLimit = exports.aggregateBy = exports.aggregate = exports.absoluteXP = exports.capitalize = exports.hash = exports.numberFormat = exports.getStats = exports.getLevel = exports.sleep = exports.getXp = exports.getLevelThreshold = exports.NUMBER_BUTTONS = exports.CROWN = exports.RIGHTMOST_ARROW_BUTTON = exports.RIGHT_ARROW_BUTTON = exports.CURRENT_BUTTON = exports.LEFT_ARROW_BUTTON = exports.LEFTMOST_ARROW_BUTTON = exports.RETURN_BUTTON = exports.ATTOM_BUTTON = exports.BLACK_BUTTON = exports.RED_BUTTON = exports.WHITE_BUTTON = exports.BLUE_BUTTON = exports.STAR = exports.CDN_LINK = exports.CHALLENGER_CRIT_GIF = exports.PLAYER_CRIT_GIF = exports.SILVER = exports.BROWN = exports.GOLD = exports.GREEN = exports.RED = void 0;
const crypto_1 = __importStar(require("crypto"));
exports.RED = "#FF0000";
exports.GREEN = "#008000";
exports.GOLD = "#ffd700";
exports.BROWN = "#c66a10";
exports.SILVER = "#c0c0c0";
exports.PLAYER_CRIT_GIF = "https://i.gifer.com/FSka.gif";
exports.CHALLENGER_CRIT_GIF = "https://i.pinimg.com/originals/40/96/d1/4096d1659e8c58bb51375133ab5f459e.gif";
exports.CDN_LINK = "https://cdn.discordapp.com/attachments/";
exports.STAR = "⭐";
exports.BLUE_BUTTON = "🔵";
exports.WHITE_BUTTON = "⚪";
exports.RED_BUTTON = "🔴";
exports.BLACK_BUTTON = "⚫";
exports.ATTOM_BUTTON = "⚛️";
exports.RETURN_BUTTON = "↩️";
exports.LEFTMOST_ARROW_BUTTON = "⏮️";
exports.LEFT_ARROW_BUTTON = "◀️";
exports.CURRENT_BUTTON = "⏺️";
exports.RIGHT_ARROW_BUTTON = "▶️";
exports.RIGHTMOST_ARROW_BUTTON = "⏭️";
exports.CROWN = "👑";
exports.NUMBER_BUTTONS = [
    "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣",
];
// returns xp needed to get to the next level
function getLevelThreshold(level) {
    return (10 + (level * 0.5));
}
exports.getLevelThreshold = getLevelThreshold;
function getXp(point) {
    return point * 2;
}
exports.getXp = getXp;
function sleep(ms) {
    return new Promise((resolve) => {
        return setTimeout(() => resolve(), ms);
    });
}
exports.sleep = sleep;
function getLevel(xp) {
    let level = 1;
    let nextLevelThreshold = getLevelThreshold(level);
    while (xp > nextLevelThreshold) {
        xp -= nextLevelThreshold;
        nextLevelThreshold = getLevelThreshold(++level);
    }
    return level;
}
exports.getLevel = getLevel;
function getStats(level) {
    const hp = level * 5;
    const strength = level * 1;
    const speed = level * 1;
    const armor = level * 0;
    return { hp, strength, speed, armor };
}
exports.getStats = getStats;
function numberFormat(value) {
    if (Number.isInteger(value)) {
        return value;
    }
    return value.toFixed(2);
}
exports.numberFormat = numberFormat;
function hash(data) {
    return crypto_1.default.createHash("sha256").update(data).digest("hex");
}
exports.hash = hash;
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.capitalize = capitalize;
/** total xp needed to reach given level */
function absoluteXP(level) {
    let accXP = 0;
    let lvl = level;
    while (lvl > 1)
        accXP += getLevelThreshold(--lvl);
    return accXP;
}
exports.absoluteXP = absoluteXP;
function aggregate(items) {
    const result = {};
    for (const item of items) {
        if (result[item]) {
            result[item]++;
            continue;
        }
        result[item] = 1;
    }
    return result;
}
exports.aggregate = aggregate;
function aggregateBy(items, pred) {
    return aggregate(items.map(pred));
}
exports.aggregateBy = aggregateBy;
/** To determine the upper limit of step based levelling
 *
 *  For example, user will be rewarded for every 500 xp (step).
 *  If a user has a total xp of 7599 (current). We can determine
 *  the upper limit (threshold) that a user needed in order to get rewarded.
 *  In this example, the user needs 8000 xp to get their next reward.
 * */
function upperLimit(current, step) {
    let acc = step;
    for (let i = step; i <= current; i += step)
        acc += step;
    return acc;
}
exports.upperLimit = upperLimit;
/** To determine how many upper limits have been passed.
 *
 *  For example, user will be rewarded for every 500 xp (step).
 *  If a user has a total xp of 7599 (current). We can determine
 *  how many limits have the user passed based on the total xp and the
 *  step. In this example, the user has passed the limit of 15 times.
 * */
function totalLevelPassed(current, step) {
    const threshold = upperLimit(current, step) - step;
    return threshold / step;
}
exports.totalLevelPassed = totalLevelPassed;
function roundTo(num, decimalPlace) {
    if (Number.isInteger(num))
        return num.toString();
    return num.toFixed(decimalPlace);
}
exports.roundTo = roundTo;
async function nukeChannel(channel) {
    let deleted = 0;
    do {
        const messages = await channel.messages.fetch({ limit: 100 });
        for (const message of messages.values()) {
            await message.delete();
        }
        deleted = messages.size;
    } while (deleted > 0);
}
exports.nukeChannel = nukeChannel;
async function nukeBotMessages(channel) {
    const messages = await channel.messages.fetch({ limit: 100 });
    for (const message of messages.values()) {
        if (message.author.id === '852545520118792202') {
            try {
                await message.delete();
            }
            catch (e) {
                //
            }
        }
    }
}
exports.nukeBotMessages = nukeBotMessages;
function sha1(data) {
    return (0, crypto_1.createHash)("sha1")
        .update(data)
        .digest('hex');
}
exports.sha1 = sha1;
/** Converts array to list form. If the list is empty, it will return "none"
 * @example toList(["a", "b"])
 * -> "a"
 *    "b"
 * @example toList([]) -> "none"
 * */
function toList(items) {
    if (items.length <= 0)
        return "none";
    return items.join("\n");
}
exports.toList = toList;
function toNList(items, start = 1) {
    if (items.length < 0)
        return "none";
    return items.map((x, i) => `${i + start}. ${x}`).join("\n");
}
exports.toNList = toNList;
function inlineCode(str) {
    return `\`${str}\``;
}
exports.inlineCode = inlineCode;
function bold(str) {
    return `**${str}**`;
}
exports.bold = bold;
function italic(str) {
    return `_${str}_`;
}
exports.italic = italic;
function split(str) {
    return str.split(/\s+/);
}
exports.split = split;
function parseDecimal(str) {
    return parseFloat(str.replace(",", "."));
}
exports.parseDecimal = parseDecimal;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJuYWxzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaURBQTRDO0FBRy9CLFFBQUEsR0FBRyxHQUFHLFNBQVMsQ0FBQztBQUNoQixRQUFBLEtBQUssR0FBRyxTQUFTLENBQUM7QUFDbEIsUUFBQSxJQUFJLEdBQUcsU0FBUyxDQUFDO0FBQ2pCLFFBQUEsS0FBSyxHQUFHLFNBQVMsQ0FBQztBQUNsQixRQUFBLE1BQU0sR0FBRyxTQUFTLENBQUM7QUFDbkIsUUFBQSxlQUFlLEdBQUcsOEJBQThCLENBQUM7QUFDakQsUUFBQSxtQkFBbUIsR0FBRyw4RUFBOEUsQ0FBQztBQUNyRyxRQUFBLFFBQVEsR0FBRyx5Q0FBeUMsQ0FBQztBQUNyRCxRQUFBLElBQUksR0FBRyxHQUFHLENBQUM7QUFDWCxRQUFBLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDbkIsUUFBQSxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQ25CLFFBQUEsVUFBVSxHQUFHLElBQUksQ0FBQztBQUNsQixRQUFBLFlBQVksR0FBRyxHQUFHLENBQUM7QUFDbkIsUUFBQSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFFBQUEsYUFBYSxHQUFHLElBQUksQ0FBQztBQUNyQixRQUFBLHFCQUFxQixHQUFHLElBQUksQ0FBQztBQUM3QixRQUFBLGlCQUFpQixHQUFHLElBQUksQ0FBQztBQUN6QixRQUFBLGNBQWMsR0FBRyxJQUFJLENBQUM7QUFDdEIsUUFBQSxrQkFBa0IsR0FBRyxJQUFJLENBQUM7QUFDMUIsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLENBQUM7QUFDOUIsUUFBQSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBRWIsUUFBQSxjQUFjLEdBQUc7SUFDNUIsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVB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