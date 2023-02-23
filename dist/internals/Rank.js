"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RankRole = void 0;
const main_1 = require("../main");
class RankRole {
    constructor() {
        this.rankNames = [
            'Titan Apprentice',
            'Titan Private',
            'Titan Corporal',
            'Titan Sergeant',
            'Titan Lieutenant',
            'Titan Captain',
            'Titan Major',
            'Titan Colonel',
        ];
    }
    getRankRole(level) {
        let rankName = '';
        switch (true) {
            case level <= 50:
                rankName = 'Titan Apprentice';
                break;
            case level <= 100:
                rankName = 'Titan Private';
                break;
            case level <= 150:
                rankName = 'Titan Corporal';
                break;
            case level <= 200:
                rankName = 'Titan Sergeant';
                break;
            case level <= 250:
                rankName = 'Titan Lieutenant';
                break;
            case level <= 300:
                rankName = 'Titan Captain';
                break;
            case level <= 350:
                rankName = 'Titan Major';
                break;
            case level <= 450:
                rankName = 'Titan Colonel';
                break;
            default:
                rankName = 'Titan General';
                break;
        }
        return main_1.client.mainGuild.roles.cache.find((x) => x.name === rankName);
    }
    getCurrentRole(member) {
        return member.roles.cache
            .find((x) => this.rankNames.includes(x.name));
    }
    createRoles() {
        const roles = main_1.client.mainGuild.roles.cache;
        for (const rankName of this.rankNames) {
            if (!roles.find((role) => role.name === rankName)) {
                main_1.client.mainGuild.roles.create({ data: { name: rankName } });
            }
        }
    }
}
exports.RankRole = RankRole;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmFuay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvUmFuay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxrQ0FBaUM7QUFlakMsTUFBYSxRQUFRO0lBQXJCO1FBQ0UsY0FBUyxHQUFZO1lBQ25CLGtCQUFrQjtZQUNsQixlQUFlO1lBQ2YsZ0JBQWdCO1lBQ2hCLGdCQUFnQjtZQUNoQixrQkFBa0I7WUFDbEIsZUFBZTtZQUNmLGFBQWE7WUFDYixlQUFlO1NBQ2hCLENBQUM7SUFpQ0osQ0FBQztJQS9CQyxXQUFXLENBQUMsS0FBYTtRQUN2QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDbEIsUUFBUSxJQUFJLEVBQUU7WUFDWixLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUFFLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQztnQkFBQyxNQUFNO1lBQ3ZELEtBQUssS0FBSyxJQUFJLEdBQUc7Z0JBQUUsUUFBUSxHQUFHLGVBQWUsQ0FBQztnQkFBQyxNQUFNO1lBQ3JELEtBQUssS0FBSyxJQUFJLEdBQUc7Z0JBQUUsUUFBUSxHQUFHLGdCQUFnQixDQUFDO2dCQUFDLE1BQU07WUFDdEQsS0FBSyxLQUFLLElBQUksR0FBRztnQkFBRSxRQUFRLEdBQUcsZ0JBQWdCLENBQUM7Z0JBQUMsTUFBTTtZQUN0RCxLQUFLLEtBQUssSUFBSSxHQUFHO2dCQUFFLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQztnQkFBQyxNQUFNO1lBQ3hELEtBQUssS0FBSyxJQUFJLEdBQUc7Z0JBQUUsUUFBUSxHQUFHLGVBQWUsQ0FBQztnQkFBQyxNQUFNO1lBQ3JELEtBQUssS0FBSyxJQUFJLEdBQUc7Z0JBQUUsUUFBUSxHQUFHLGFBQWEsQ0FBQztnQkFBQyxNQUFNO1lBQ25ELEtBQUssS0FBSyxJQUFJLEdBQUc7Z0JBQUUsUUFBUSxHQUFHLGVBQWUsQ0FBQztnQkFBQyxNQUFNO1lBQ3JEO2dCQUFTLFFBQVEsR0FBRyxlQUFlLENBQUM7Z0JBQUMsTUFBTTtTQUM1QztRQUVELE9BQU8sYUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUUsQ0FBQztJQUN4RSxDQUFDO0lBRUQsY0FBYyxDQUFDLE1BQW1CO1FBQ2hDLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLO2FBQ3RCLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQWEsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVELFdBQVc7UUFDVCxNQUFNLEtBQUssR0FBRyxhQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFFM0MsS0FBSyxNQUFNLFFBQVEsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ3JDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxFQUFFO2dCQUNqRCxhQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQzdEO1NBQ0Y7SUFDSCxDQUFDO0NBQ0Y7QUEzQ0QsNEJBMkNDIn0=