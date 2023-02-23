"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const rankcard_1 = __importDefault(require("@jiman24/rankcard"));
const discord_js_1 = require("discord.js");
const Rank_1 = require("../commands/Rank");
const utils_1 = require("./utils");
const profile_1 = require("../db/profile");
class Profile {
    constructor(data) {
        this.xp = data.xp;
        this.level = data.level;
        this.rank = data.rank;
        this.imageUrl = data.imageUrl;
        this.name = data.name;
        this.userID = data.userID;
        this.gold = data.gold;
        this.silver = data.silver;
        this.bronze = data.bronze;
    }
    get id() {
        let tmp = '';
        for (const attribute in this) {
            const val = this[attribute];
            tmp += `_${val}`;
        }
        return (0, utils_1.hash)(tmp);
    }
    async build(force) {
        const cache = await (0, profile_1.getProfile)(this.userID);
        if (!force && cache?.Checksum === this.id)
            return new discord_js_1.MessageAttachment(cache.Data, `${this.id}.png`);
        const { xp } = this;
        const { level } = this;
        const levelThreshold = (0, utils_1.getLevelThreshold)(level);
        const { rank } = this;
        const color = '#23272a';
        const image = Rank_1.backgrounds[rank - 1];
        const rankCard = await new rankcard_1.default.Rank()
            .setAvatar(this.imageUrl)
            .setCurrentXP(Math.round(xp - (0, utils_1.absoluteXP)(level)))
            .setRequiredXP(Math.round(levelThreshold))
            .setLevel(level)
            .setRank(rank, '')
            .setProgressBar('#ff0800', 'COLOR', false)
            .setOverlay(image ? '#000' : '#fff', image ? 0.5 : 0.05)
            .setUsername(this.name)
            .setBackground(image ? 'IMAGE' : 'COLOR', image || color)
            .setBronze(this.bronze)
            .setSilver(this.silver)
            .setGold(this.gold)
            .build();
        (0, profile_1.setProfile)(this.userID, this.id, rankCard);
        return new discord_js_1.MessageAttachment(rankCard, `${this.id}.png`);
    }
}
exports.Profile = Profile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvUHJvZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxpRUFBeUM7QUFDekMsMkNBQStDO0FBQy9DLDJDQUErQztBQUMvQyxtQ0FBOEQ7QUFDOUQsMkNBQXVEO0FBY3ZELE1BQWEsT0FBTztJQW1CbEIsWUFBWSxJQUFpQjtRQUMzQixJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDOUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM1QixDQUFDO0lBRUQsSUFBSSxFQUFFO1FBQ0osSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO1FBQ2IsS0FBSyxNQUFNLFNBQVMsSUFBSSxJQUFJLEVBQUU7WUFDNUIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQzVCLEdBQUcsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1NBQ2xCO1FBRUQsT0FBTyxJQUFBLFlBQUksRUFBQyxHQUFHLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFlO1FBQ3pCLE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSxvQkFBVSxFQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsS0FBSyxJQUFJLEtBQUssRUFBRSxRQUFRLEtBQUssSUFBSSxDQUFDLEVBQUU7WUFBRSxPQUFPLElBQUksOEJBQWlCLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXRHLE1BQU0sRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDcEIsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLElBQUksQ0FBQztRQUN2QixNQUFNLGNBQWMsR0FBRyxJQUFBLHlCQUFpQixFQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDdEIsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ3hCLE1BQU0sS0FBSyxHQUFHLGtCQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXBDLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxrQkFBUSxDQUFDLElBQUksRUFBRTthQUN2QyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQzthQUN4QixZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsSUFBQSxrQkFBVSxFQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7YUFDaEQsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDekMsUUFBUSxDQUFDLEtBQUssQ0FBQzthQUNmLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO2FBQ2pCLGNBQWMsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQzthQUN6QyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2FBQ3ZELFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ3RCLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxLQUFLLENBQUM7YUFDeEQsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDdEIsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDdEIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDbEIsS0FBSyxFQUFFLENBQUM7UUFFWCxJQUFBLG9CQUFVLEVBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLE9BQU8sSUFBSSw4QkFBaUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMzRCxDQUFDO0NBQ0Y7QUF0RUQsMEJBc0VDIn0=