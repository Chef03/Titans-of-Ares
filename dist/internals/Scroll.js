"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArenaScroll = exports.Scroll = void 0;
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const main_1 = require("../main");
const inventory_1 = require("../db/inventory");
const Item_1 = require("./Item");
const utils_1 = require("./utils");
class Scroll extends Item_1.Item {
    constructor() {
        super(...arguments);
        this.id = 'scroll';
        this.name = 'Upgrade Scroll';
        this.description = (0, common_tags_1.stripIndents) `
  Upgrade scroll is used to upgrade normal gear up to level 10

  To upgrade gear, inspect the item in the \`${main_1.client.prefix}inventory\` or \`${main_1.client.prefix}gear\` menu`;
        this.price = 25;
        this.imageUrl = `${utils_1.CDN_LINK}852530378916888626/868333533951840286/704a20ac63fa90bb65cbc06a40e2b452.jpg`;
    }
    show(count) {
        const embed = new discord_js_1.MessageEmbed()
            .setColor(utils_1.BROWN)
            .setTitle('Upgrade Scroll')
            .setThumbnail(this.imageUrl)
            .setDescription(this.description)
            .addField('Price', `${this.price} Coins`, true)
            .addField('Owned', count, true);
        return embed;
    }
    use(player) {
        return (0, inventory_1.removeInventory)(player.id, this.id);
    }
}
exports.Scroll = Scroll;
class ArenaScroll extends Scroll {
    constructor() {
        super(...arguments);
        this.id = 'scroll_arena';
        this.name = 'Arena Upgrade Scroll';
        this.description = (0, common_tags_1.stripIndents) `
  Arena upgrade scroll is used to upgrade arena gear up to level 10

  To upgrade gear, inspect the item in the \`${main_1.client.prefix}inventory\` or \`${main_1.client.prefix}gear\` menu`;
        this.price = 250;
    }
}
exports.ArenaScroll = ArenaScroll;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Nyb2xsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9TY3JvbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsNkNBQTJDO0FBQzNDLDJDQUEwQztBQUMxQyxrQ0FBaUM7QUFDakMsK0NBQWtEO0FBQ2xELGlDQUE4QjtBQUU5QixtQ0FBMEM7QUFFMUMsTUFBYSxNQUFPLFNBQVEsV0FBSTtJQUFoQzs7UUFDRSxPQUFFLEdBQUcsUUFBUSxDQUFDO1FBRWQsU0FBSSxHQUFHLGdCQUFnQixDQUFDO1FBRXhCLGdCQUFXLEdBQUcsSUFBQSwwQkFBWSxFQUFBOzs7K0NBR21CLGFBQU0sQ0FBQyxNQUFNLG9CQUFvQixhQUFNLENBQUMsTUFBTSxhQUFhLENBQUM7UUFFekcsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUVYLGFBQVEsR0FBRyxHQUFHLGdCQUNkLDRFQUE0RSxDQUFDO0lBaUIvRSxDQUFDO0lBZkMsSUFBSSxDQUFDLEtBQWE7UUFDaEIsTUFBTSxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFO2FBQzdCLFFBQVEsQ0FBQyxhQUFLLENBQUM7YUFDZixRQUFRLENBQUMsZ0JBQWdCLENBQUM7YUFDMUIsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDM0IsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUM7YUFDaEMsUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRSxJQUFJLENBQUM7YUFDOUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFbEMsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBRUQsR0FBRyxDQUFDLE1BQWM7UUFDaEIsT0FBTyxJQUFBLDJCQUFlLEVBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNGO0FBOUJELHdCQThCQztBQUVELE1BQWEsV0FBWSxTQUFRLE1BQU07SUFBdkM7O1FBQ0UsT0FBRSxHQUFHLGNBQWMsQ0FBQztRQUVwQixTQUFJLEdBQUcsc0JBQXNCLENBQUM7UUFFOUIsZ0JBQVcsR0FBRyxJQUFBLDBCQUFZLEVBQUE7OzsrQ0FHbUIsYUFBTSxDQUFDLE1BQU0sb0JBQW9CLGFBQU0sQ0FBQyxNQUFNLGFBQWEsQ0FBQztRQUV6RyxVQUFLLEdBQUcsR0FBRyxDQUFDO0lBQ2QsQ0FBQztDQUFBO0FBWEQsa0NBV0MifQ==