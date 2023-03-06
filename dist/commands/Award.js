"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const xp_1 = require("../db/xp");
const player_1 = require("../db/player");
const admin_1 = require("../db/admin");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXdhcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tbWFuZHMvQXdhcmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFDQSw2Q0FBc0M7QUFDdEMsaUNBQWlDO0FBQ2pDLHlDQUEwQztBQUMxQyx1Q0FBNEM7QUFFNUMsOENBQThDO0FBQzlDLDhDQUFzRDtBQUN0RCxnREFBNkM7QUFDN0Msa0NBQWlDO0FBQ2pDLDBDQUF1QztBQUN2QywrQ0FBZ0U7QUFDaEUsb0RBQTZEO0FBQzdELG1FQUEyQztBQUUzQyxzRUFBc0U7QUFFdEUsZUFBcUIsU0FBUSxpQkFBTztJQUFwQzs7UUFDRSxTQUFJLEdBQUcsT0FBTyxDQUFDO0lBc0hqQixDQUFDO0lBcEhDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLElBQWM7UUFDckMsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLGFBQU0sQ0FBQztRQUU5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFFcEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxTQUFTO1lBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO1FBRXZFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsNkNBQTZDLENBQUMsQ0FBQztRQUVwRixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV2QyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDWCxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7U0FDbEQ7UUFFRCxNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUEscUJBQWEsR0FBRSxDQUFDO1FBQ3pDLE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDaEMsTUFBTSxPQUFPLEdBQUcsWUFBWSxFQUFFLEtBQUssQ0FBQyxLQUFLO2FBQ3RDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUV6RSxNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFOUMsSUFBSSxTQUFTLEtBQUssT0FBTyxFQUFFO1lBQ3pCLElBQUksQ0FBQyxhQUFLLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMvQixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7YUFDL0M7WUFFRCxNQUFNLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxNQUFtQixDQUFDLENBQUM7WUFDN0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxFQUFFLEtBQUssUUFBUSxDQUFDO1lBRXJELElBQUksUUFBUSxFQUFFO2dCQUNaLE1BQU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDM0IsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFDMUMsT0FBTzthQUNSO1lBRUQsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBRXBCLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBQSxxQkFBTyxFQUFBLEdBQUcsTUFBTSx5QkFBeUIsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJO2dCQUMvRCxLQUFLLENBQUMsRUFBRSwrQkFBK0IsS0FBSyxDQUFDLElBQUk7a0NBQy9CLENBQUMsQ0FBQztZQUU5QixJQUFJLE1BQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxFQUFFO2dCQUM1QixVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksc0JBQXNCLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO2FBQ3ZFO1lBRUQsT0FBTztTQUNSO1FBQUMsSUFBSSxTQUFTLEtBQUssSUFBSSxFQUFFO1lBQ3hCLElBQUksQ0FBQyxNQUFNO2dCQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUVsRSxNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLFNBQVM7Z0JBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBRXBFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLENBQUM7WUFDeEIsTUFBTSxJQUFBLFVBQUssRUFBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDL0IsTUFBTSxNQUFNLEdBQUcsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUM7WUFDckQsTUFBTSxXQUFXLEdBQUcsU0FBUyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFFbkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLG1CQUFVLEVBQUMsTUFBTSxDQUFDLENBQUM7WUFDekMsTUFBTSxNQUFNLEdBQUcsT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUNuQyxNQUFNLFNBQVMsR0FBRyxJQUFBLGdCQUFRLEVBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkMsTUFBTSxZQUFZLEdBQUcsSUFBQSxnQkFBUSxFQUFDLE9BQU8sQ0FBQyxDQUFDO1lBRXZDLFVBQVUsQ0FBQyxJQUFJLENBQ2IsR0FBRyxNQUFNLE1BQU0sTUFBTSxTQUFTLFdBQVcsSUFBSSxJQUFJLGFBQWEsTUFBTSxFQUFFLENBQ3ZFLENBQUM7WUFFRixJQUFJLFlBQVksR0FBRyxTQUFTLEVBQUU7Z0JBQzVCLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLHNCQUFzQixZQUFZLElBQUksQ0FBQyxDQUFDO2FBQ2hFO1lBRUQsT0FBTztTQUNSO1FBQUMsSUFBSSxTQUFTLEtBQUssVUFBVSxFQUFFO1lBQzlCLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsU0FBUztnQkFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLENBQUM7WUFFcEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxLQUFLLFFBQVEsQ0FBQztZQUVyRCxJQUFJLFFBQVEsRUFBRTtnQkFDWixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxnQkFBZ0IsR0FBRyxFQUFnQixDQUFDLENBQUM7Z0JBQ25FLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFO29CQUNqQixPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7aUJBQzdDO2dCQUVELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7b0JBQ2xDLElBQUEsMkJBQWUsRUFBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDekM7Z0JBRUQsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztnQkFDMUMsT0FBTzthQUNSO1lBRUQsSUFBSSxDQUFDLE1BQU07Z0JBQUUsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBRWxFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2xDLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxTQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xDLElBQUEsd0JBQVksRUFBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFFckMsVUFBVSxDQUFDLElBQUksQ0FDYixHQUFHLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixRQUFRLENBQUMsSUFBSSxlQUFlLE1BQU0sRUFBRSxDQUN4RSxDQUFDO2FBQ0g7WUFFRCxPQUFPO1NBQ1I7UUFDRCxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0lBQzVDLENBQUM7Q0FDRjtBQXZIRCw0QkF1SEMifQ==