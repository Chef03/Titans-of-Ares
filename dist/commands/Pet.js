"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const main_1 = require("../main");
const pet_1 = require("../db/pet");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const Pet_1 = require("../internals/Pet");
const Player_1 = require("../internals/Player");
const utils_1 = require("../internals/utils");
const Command_1 = __importDefault(require("../internals/Command"));
class default_1 extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = 'pet';
        this.aliases = ['pets'];
    }
    async exec(msg, args) {
        const player = await Player_1.Player.getPlayer(msg.member);
        const [index] = args;
        if (index === 'all') {
            const ownedPets = player.pets;
            const ownedPetsID = player.pets.map((x) => x.id);
            const notOwnedPets = Pet_1.Pet.all.filter((x) => !ownedPetsID.includes(x.id));
            const allPets = [...ownedPets, ...notOwnedPets];
            for (const pet of allPets) {
                const fragmentCount = player.inventory.all.count(`fragment_${pet.id}`);
                msg.channel.send(pet.card(fragmentCount, true));
            }
            return;
        }
        if (index) {
            if (Number.isNaN(parseInt(index)))
                return msg.channel.send('Please give valid number');
            const pet = player.pets.get(parseInt(index) - 1);
            if (!pet)
                return msg.channel.send('Please give valid index');
            const fragmentCount = player.inventory.all.count(`fragment_${pet.id}`);
            const petCard = pet.card(fragmentCount, true);
            const button = new ButtonHandler_1.ButtonHandler(msg, petCard, player.id);
            button.addButton('🔵', 'activate this pet', () => {
                (0, pet_1.setActivePet)(player.id, pet.id);
                msg.channel.send(`**${pet.name}** is now your active pet!`);
            });
            button.addButton('🔴', 'deactivate current active pet', () => {
                if (!player.activePet)
                    return msg.channel.send('You currently have no active pet');
                (0, pet_1.setInactivePet)(player.id);
                msg.channel.send(`**${player.activePet?.name}** has been removed as your active pet!`);
            });
            button.addCloseButton();
            await button.run();
            return;
        }
        const petsList = player.pets
            .map((x, i) => `${i + 1}. \`${x.name} ${x.star} ${utils_1.STAR}\``)
            .join('\n');
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle('Pet')
            .setDescription('Showing all pets you summoned')
            .addField('---', petsList || 'none')
            .addField('\u200b', (0, common_tags_1.stripIndents) `
        You can inspect your summoned pet by using \`${main_1.client.prefix}pet <number>\`
        Use command \`${main_1.client.prefix}pet all\` to show all existing pets and how many fragments you need to summon or upgrade them
        You can summon or upgrade pets from inventory using \`${main_1.client.prefix}inventory\`
        You can convert pet fragments from the inventory using \`${main_1.client.prefix}inventory\``);
        msg.channel.send(embed);
    }
}
exports.default = default_1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL1BldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDZDQUEyQztBQUMzQywyQ0FBbUQ7QUFDbkQsa0NBQWlDO0FBQ2pDLG1DQUF5RDtBQUN6RCw4REFBMkQ7QUFDM0QsMENBQXVDO0FBQ3ZDLGdEQUE2QztBQUM3Qyw4Q0FBaUQ7QUFDakQsbUVBQTJDO0FBRTNDLGVBQXFCLFNBQVEsaUJBQU87SUFBcEM7O1FBQ0UsU0FBSSxHQUFHLEtBQUssQ0FBQztRQUViLFlBQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBaUVyQixDQUFDO0lBL0RDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLElBQWM7UUFDckMsTUFBTSxNQUFNLEdBQUcsTUFBTSxlQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBRXJCLElBQUksS0FBSyxLQUFLLEtBQUssRUFBRTtZQUNuQixNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1lBQzlCLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakQsTUFBTSxZQUFZLEdBQUcsU0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN4RSxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsU0FBUyxFQUFFLEdBQUcsWUFBWSxDQUFDLENBQUM7WUFFaEQsS0FBSyxNQUFNLEdBQUcsSUFBSSxPQUFPLEVBQUU7Z0JBQ3pCLE1BQU0sYUFB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