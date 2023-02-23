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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promiseWrapper_1 = require("../db/promiseWrapper");
const Command_1 = __importDefault(require("../internals/Command"));
const SquadBattle_1 = __importStar(require("../internals/SquadBattle"));
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'fight';
        this.aliases = [];
    }
    async exec(msg, _args) {
        if (msg.channel.type === 'dm')
            return;
        const boss = SquadBattle_1.bosses[parseInt(_args[0]) - 1];
        if (!boss)
            return msg.channel.send(`Boss was not found.`);
        const ownerSql = 'SELECT * FROM squads WHERE owner = $owner';
        const existingSquad = await (0, promiseWrapper_1.dbGet)(ownerSql, { $owner: msg.author.id });
        if (!existingSquad)
            return msg.channel.send('You are not a squad owner.');
        const grabSql = 'SELECT * FROM squadMembers WHERE squadName = $squadName';
        const members = await (0, promiseWrapper_1.dbAll)(grabSql, { $squadName: existingSquad.name });
        const front = members.filter((member) => member.position === 'front');
        const back = members.filter((member) => member.position === 'back');
        if (!front.length || !back.length) {
            return msg.channel.send('Your squad needs to at-least have 1 front and 1 back players.');
        }
        (0, SquadBattle_1.default)(msg, boss.name);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmlnaHQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvRmlnaHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUNBLHlEQUFvRDtBQUNwRCxtRUFBMkM7QUFFM0Msd0VBQTBEO0FBRzFELGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0ksU0FBSSxHQUFHLE9BQU8sQ0FBQztRQUNmLFlBQU8sR0FBRyxFQUFFLENBQUM7SUErQmpCLENBQUM7SUE1QkcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFZLEVBQUUsS0FBZTtRQUVwQyxJQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLElBQUk7WUFBRSxPQUFPO1FBRXJDLE1BQU0sSUFBSSxHQUFHLG9CQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQzNDLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBRzFELE1BQU0sUUFBUSxHQUFHLDJDQUEyQyxDQUFDO1FBQzdELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBQSxzQkFBSyxFQUFVLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDaEYsSUFBSSxDQUFDLGFBQWE7WUFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDMUUsTUFBTSxPQUFPLEdBQUcseURBQXlELENBQUM7UUFDMUUsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLHNCQUFLLEVBQWMsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEtBQUssT0FBTyxDQUFDLENBQUM7UUFDdEUsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsS0FBSyxNQUFNLENBQUMsQ0FBQztRQUVwRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDL0IsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywrREFBK0QsQ0FBQyxDQUFDO1NBQzVGO1FBRUQsSUFBQSxxQkFBTSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFPM0IsQ0FBQztDQUNKO0FBakNELDRCQWlDQyJ9