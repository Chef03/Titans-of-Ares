"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const xp_1 = require("../db/xp");
const player_1 = require("../db/player");
const admin_1 = require("../db/admin");
const Rank_1 = __importDefault(require("./Rank"));
const utils_1 = require("../internals/utils");
const Medal_1 = require("../internals/Medal");
const Player_1 = require("../internals/Player");
const main_1 = require("../main");
const Pet_1 = require("../internals/Pet");
const inventory_1 = require("../db/inventory");
const Fragment_1 = require("../internals/Fragment");
const Command_1 = __importDefault(require("../internals/Command"));
// award <id> <xp|medal|fragment> <amount|medalType> <reason | revert>
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'award';
    }
    async exec(msg, args) {
        const { logChannel } = main_1.client;
        const userId = args[0];
        if (!userId)
            return msg.channel.send('You need to specify user id');
        const awardType = args[1];
        if (!awardType)
            return msg.channel.send('You need to give award type');
        const amount = args[2];
        if (!amount)
            return msg.channel.send('You need to give valid amount or medal type');
        const reason = args.slice(3).join(' ');
        const member = msg.guild?.members.cache.get(userId);
        if (!member) {
            return msg.channel.send('member does not exist');
        }
        const adminRoles = await (0, admin_1.getAdminRoles)();
        const authorMember = msg.member;
        const isAdmin = authorMember?.roles.cache
            .some((role) => adminRoles.includes(role.id));
        if (!isAdmin)
            return msg.channel.send('Only admin can use this command');
        const player = await Player_1.Player.getPlayer(member);
        if (awardType === 'medal') {
            if (!Medal_1.Medal.isValidMedal(amount)) {
                return msg.channel.send('invalid medal type');
            }
            const medal = new Medal_1.Medal(amount);
            const prevLevel = player.level;
            const isRevert = args[3]?.toLowerCase() === 'revert';
            if (isRevert) {
                await medal.revert(player);
                msg.channel.send('Executed successfully');
                return;
            }
            await medal.give(player);
            await player.sync();
            logChannel.send((0, common_tags_1.oneLine) `${member} has been awarded a **${medal.chest.name}** 
        and **${medal.xp} bonus xp** for getting a **${medal.name}**
        in the Monthly Challenge!`);
            if (player.level > prevLevel) {
                logChannel.send(`${player.name} is now on **level ${player.level}**`);
            }
            return;
        }
        if (awardType === 'xp') {
            if (!reason)
                return msg.channel.send('You need to give a reason');
            const amountInt = parseInt(amount);
            if (!amountInt)
                return msg.channel.send('Please give valid amount');
            const { name } = player;
            await (0, xp_1.addXP)(userId, amountInt);
            const action = amountInt >= 0 ? 'Added' : 'Deducted';
            const prePosition = amountInt >= 0 ? 'to' : 'from';
            const totalXp = await (0, player_1.getTotalXp)(userId);
            const prevXp = totalXp - amountInt;
            const prevLevel = (0, utils_1.getLevel)(prevXp);
            const currentLevel = (0, utils_1.getLevel)(totalXp);
            logChannel.send(`${action} \`${amount} xp\` ${prePosition} ${name}! Reason: ${reason}`);
            if (currentLevel > prevLevel) {
                logChannel.send(`${name} is now on **level ${currentLevel}**`);
            }
            const rank = new Rank_1.default();
            rank.exec(msg, ['10']);
            return;
        }
        if (awardType === 'fragment') {
            const amountInt = parseInt(amount);
            if (!amountInt)
                return msg.channel.send('Please give valid amount');
            const isRevert = args[4]?.toLowerCase() === 'revert';
            if (isRevert) {
                const pet = args[3];
                const fragment = new Fragment_1.Fragment(`fragment_pet_${pet}`);
                if (!fragment.pet) {
                    return msg.channel.send('invalid pet name');
                }
                for (let i = 0; i < amountInt; i++) {
                    (0, inventory_1.removeInventory)(player.id, fragment.id);
                }
                msg.channel.send('Executed successfully');
                return;
            }
            if (!reason)
                return msg.channel.send('You need to give a reason');
            for (let i = 0; i < amountInt; i++) {
                const { fragment } = Pet_1.Pet.random();
                (0, inventory_1.addInventory)(player.id, fragment.id);
                logChannel.send(`${player.member} has received **${fragment.name}**! Reason: ${reason}`);
            }
            return;
        }
        msg.channel.send('Executed successfully');
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXdhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvQXdhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSw2Q0FBc0M7QUFDdEMsaUNBQWlDO0FBQ2pDLHlDQUEwQztBQUMxQyx1Q0FBNEM7QUFDNUMsa0RBQTBCO0FBQzFCLDhDQUE4QztBQUM5Qyw4Q0FBc0Q7QUFDdEQsZ0RBQTZDO0FBQzdDLGtDQUFpQztBQUNqQywwQ0FBdUM7QUFDdkMsK0NBQWdFO0FBQ2hFLG9EQUE2RDtBQUM3RCxtRUFBMkM7QUFFM0Msc0VBQXNFO0FBRXRFLGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0UsU0FBSSxHQUFHLE9BQU8sQ0FBQztJQXdIakIsQ0FBQztJQXRIQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQVksRUFBRSxJQUFjO1FBQ3JDLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxhQUFNLENBQUM7UUFFOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNO1lBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBRXBFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxQixJQUFJLENBQUMsU0FBUztZQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztRQUV2RSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFFcEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdkMsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ1gsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1NBQ2xEO1FBRUQsTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFBLHFCQUFhLEdBQUUsQ0FBQztRQUN6QyxNQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDO1FBQ2hDLE1BQU0sT0FBTyxHQUFHLFlBQVksRUFBRSxLQUFLLENBQUMsS0FBSzthQUN0QyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFaEQsSUFBSSxDQUFDLE9BQU87WUFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFFekUsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRTlDLElBQUksU0FBUyxLQUFLLE9BQU8sRUFBRTtZQUN6QixJQUFJLENBQUMsYUFBSyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDL0IsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQy9DO1lBRUQsTUFBTSxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsTUFBbUIsQ0FBQyxDQUFDO1lBQzdDLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDL0IsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLFFBQVEsQ0FBQztZQUVyRCxJQUFJLFFBQVEsRUFBRTtnQkFDWixNQUFNLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzNCLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBQzFDLE9BQU87YUFDUjtZQUVELE1BQU0sS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QixNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVwQixVQUFVLENBQUMsSUFBSSxDQUFDLElBQUEscUJBQU8sRUFBQSxHQUFHLE1BQU0seUJBQXlCLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSTtnQkFDL0QsS0FBSyxDQUFDLEVBQUUsK0JBQStCLEtBQUssQ0FBQyxJQUFJO2tDQUMvQixDQUFDLENBQUM7WUFFOUIsSUFBSSxNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsRUFBRTtnQkFDNUIsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHNCQUFzQixNQUFNLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQzthQUN2RTtZQUVELE9BQU87U0FDUjtRQUFDLElBQUksU0FBUyxLQUFLLElBQUksRUFBRTtZQUN4QixJQUFJLENBQUMsTUFBTTtnQkFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFFbEUsTUFBTSxTQUFTLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxTQUFTO2dCQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUVwRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQ3hCLE1BQU0sSUFBQSxVQUFLLEVBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sTUFBTSxHQUFHLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDO1lBQ3JELE1BQU0sV0FBVyxHQUFHLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBRW5ELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBQSxtQkFBVSxFQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pDLE1BQU0sTUFBTSxHQUFHLE9BQU8sR0FBRyxTQUFTLENBQUM7WUFDbkMsTUFBTSxTQUFTLEdBQUcsSUFBQSxnQkFBUSxFQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25DLE1BQU0sWUFBWSxHQUFHLElBQUEsZ0JBQVEsRUFBQyxPQUFPLENBQUMsQ0FBQztZQUV2QyxVQUFVLENBQUMsSUFBSSxDQUNiLEdBQUcsTUFBTSxNQUFNLE1BQU0sU0FBUyxXQUFXLElBQUksSUFBSSxhQUFhLE1BQU0sRUFBRSxDQUN2RSxDQUFDO1lBRUYsSUFBSSxZQUFZLEdBQUcsU0FBUyxFQUFFO2dCQUM1QixVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxzQkFBc0IsWUFBWSxJQUFJLENBQUMsQ0FBQzthQUNoRTtZQUVELE1BQU0sSUFBSSxHQUFHLElBQUksY0FBSSxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZCLE9BQU87U0FDUjtRQUFDLElBQUksU0FBUyxLQUFLLFVBQVUsRUFBRTtZQUM5QixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBRXBFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUM7WUFFckQsSUFBSSxRQUFRLEVBQUU7Z0JBQ1osTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixNQUFNLFFBQVEsR0FBRyxJQUFJLG1CQUFRLENBQUMsZ0JBQWdCLEdBQUcsRUFBZ0IsQ0FBQyxDQUFDO2dCQUNuRSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtvQkFDakIsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2lCQUM3QztnQkFFRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO29CQUNsQyxJQUFBLDJCQUFlLEVBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQ3pDO2dCQUVELEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Z0JBQzFDLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxNQUFNO2dCQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUVsRSxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNsQyxNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsU0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNsQyxJQUFBLHdCQUFZLEVBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBRXJDLFVBQVUsQ0FBQyxJQUFJLENBQ2IsR0FBRyxNQUFNLENBQUMsTUFBTSxtQkFBbUIsUUFBUSxDQUFDLElBQUksZUFBZSxNQUFNLEVBQUUsQ0FDeEUsQ0FBQzthQUNIO1lBRUQsT0FBTztTQUNSO1FBQ0QsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUM1QyxDQUFDO0NBQ0Y7QUF6SEQsNEJBeUhDIn0=