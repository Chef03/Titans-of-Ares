"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const gem_1 = require("../db/gem");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Command_1 = __importDefault(require("../internals/Command"));
const List_1 = require("../internals/List");
const Mining_1 = require("../internals/Mining");
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
class Socket extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'socket';
    }
    async exec(msg, args) {
        const [quality, arg2] = args;
        const index = parseInt(arg2);
        if (!Mining_1.Gem.isValidQuality(quality))
            return msg.channel.send('invalid Gem quality');
        if (!index)
            return msg.channel.send('invalid index');
        if (Number.isNaN(index))
            return msg.channel.send('invalid index');
        const player = await Player_1.Player.getPlayer(msg.member);
        const gems = player.inventory.gems.filter((x) => x.quality === quality);
        if (gems.length <= 0)
            return msg.channel.send(`You don't have any gem of ${quality} quality`);
        const gemList = List_1.List.from(gems).aggregate();
        const selected = gemList[index - 1];
        if (!selected)
            return msg.channel.send('Cannot find gem');
        const gem = selected.value;
        const menu = new discord_js_1.MessageEmbed()
            .setColor(utils_1.GREEN)
            .setTitle('Gem Socket')
            .setDescription(`Where do you want to socket ${(0, utils_1.inlineCode)(gem.name)} in?`);
        const button = new ButtonHandler_1.ButtonHandler(msg, menu, player.id);
        const buttonHandler = async (btn) => {
            if (!btn)
                return;
            let pieceName = '';
            switch (btn) {
                case utils_1.BLUE_BUTTON:
                    pieceName = 'helmet';
                    break;
                case utils_1.RED_BUTTON:
                    pieceName = 'chest';
                    break;
                case utils_1.WHITE_BUTTON:
                    pieceName = 'pants';
                    break;
            }
            const piece = player.equippedGears.find((gear) => gear.piece === pieceName);
            if (!piece)
                return msg.channel.send('The selected piece must be equipped first');
            if (piece.gem)
                return msg.channel.send('Selected gear has already gem socketed');
            await (0, gem_1.socketGem)(gem.inventoryID, piece.id);
            msg.channel.send(`Successfully socketed ${(0, utils_1.bold)(gem.name)} into ${(0, utils_1.bold)(piece.name)}!`);
        };
        button.addButton(utils_1.BLUE_BUTTON, 'Helmet', buttonHandler);
        button.addButton(utils_1.RED_BUTTON, 'Chest', buttonHandler);
        button.addButton(utils_1.WHITE_BUTTON, 'Pants', buttonHandler);
        button.addCloseButton();
        await button.run();
    }
}
exports.default = Socket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL1NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUFtRDtBQUNuRCxtQ0FBc0M7QUFDdEMsOERBQTJEO0FBQzNELG1FQUEyQztBQUMzQyw0Q0FBeUM7QUFDekMsZ0RBQTBDO0FBQzFDLGdEQUE2QztBQUM3Qyw4Q0FFNEI7QUFFNUIsTUFBcUIsTUFBTyxTQUFRLGlCQUFPO0lBQTNDOztRQUNFLFNBQUksR0FBRyxRQUFRLENBQUM7SUF3RGxCLENBQUM7SUF0REMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFZLEVBQUUsSUFBYztRQUNyQyxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUM3QixNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLFlBQUcsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDO1lBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxLQUFLO1lBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNyRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUVsRSxNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU8sQ0FBQyxDQUFDO1FBQ25ELE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sS0FBSyxPQUFPLENBQUMsQ0FBQztR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