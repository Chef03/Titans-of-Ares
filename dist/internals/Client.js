"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = require("sqlite3");
const commandment_1 = require("@jiman24/commandment");
const discord_js_1 = __importDefault(require("discord.js"));
const random_js_1 = require("random-js");
const schema_1 = require("../db/schema");
const TeamArena_1 = require("./TeamArena");
const SafeFn_1 = require("./SafeFn");
const Player_1 = require("./Player");
const player_1 = require("../db/player");
const Squadboss_1 = require("./Squadboss");
class Client {
    constructor(dbPath) {
        this.prefix = process.env.PREFIX;
        this.oldBotID = process.env.OLD_BOT_ID;
        this.rankChannelID = process.env.RANK_CHANNEL;
        this.xpLogChannelID = process.env.XP_LOG_CHANNEL;
        this.squadBossChannelID = process.env.SQUAD_BOSS_CHANNEL;
        this.teamArenaChannelID = process.env.TEAM_ARENA_CHANNEL;
        this.mainTextChannelID = process.env.MAIN_TEXT_CHANNEL;
        this.dbPath = process.env.DB;
        this.serverID = process.env.SERVER_ID;
        this.devID = process.env.DEV_ID;
        this.isDev = process.env.ENV === 'DEV';
        this.commandManager = new commandment_1.CommandManager(this.prefix);
        this.safeFn = new SafeFn_1.SafeFn();
        this.blockingPoll = new Set();
        this.bot = new discord_js_1.default.Client();
        this.random = new random_js_1.Random(random_js_1.MersenneTwister19937.autoSeed());
        /** holds user id of player which command is running */
        this.activePlayers = new Set();
        /** functions to be run every 1 seconds interval */
        this.pollHandlers = [];
        this.blockingPollHandlers = [];
        /** stores discord id of user that triggers the xp log */
        this.xpLogTriggers = '';
        /** variable to only be changed in dev environment for testing purposes.
         * For production, please avoid using this to update the team arena phase and
         * use poll event instead */
        this.arenaPhase = TeamArena_1.Phase.SIGNUP_1;
        this.squadBossPhase = Squadboss_1.SquadPhase.REPLENISH;
        (0, sqlite3_1.verbose)();
        this.db = new sqlite3_1.Database(dbPath);
    }
    addPollHandler(fn) {
        this.pollHandlers.push(fn);
    }
    addBlockingPollHandler(fn) {
        this.blockingPollHandlers.push(fn);
    }
    async runEveryPlayer(fn) {
        const users = await (0, player_1.getUsers)();
        const guild = await this.bot.guilds.fetch(this.serverID);
        const members = await guild.members.fetch();
        let alteredUsers = 0;
        this.db.exec('BEGIN TRANSACTION');
        for (const user of users) {
            const member = members.get(user.DiscordID);
            if (!member) {
                console.log(`Skipping ${user.DiscordID}, member no longer in the server`);
                continue;
            }
            const player = await Player_1.Player.getPlayer(member);
            await fn(player);
            alteredUsers++;
        }
        this.db.exec('COMMIT');
        console.log(`Total ${alteredUsers} players have been altered`);
    }
    startPollEvent() {
        setInterval(() => {
            // runs all normal poll without having to wait if previous poll handler
            // not finished
            this.pollHandlers.forEach((fn) => fn());
            // does not run poll handlers which have not finished running yet
            this.blockingPollHandlers.forEach((fn) => {
                if (this.blockingPoll.has(fn)) {
                    return;
                }
                this.blockingPoll.add(fn);
                fn().then(() => this.blockingPoll.delete(fn));
            });
        }, 1000);
    }
    start() {
        // create necessary tables if not exist
        this.db.exec(schema_1.schema);
        this.bot.login(process.env.BOT_TOKEN);
    }
}
exports.default = Client;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9DbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxxQ0FBNEM7QUFDNUMsc0RBQXNEO0FBQ3RELDREQUF5RDtBQUN6RCx5Q0FBeUQ7QUFDekQseUNBQXNDO0FBQ3RDLDJDQUFvQztBQUNwQyxxQ0FBa0M7QUFDbEMscUNBQWtDO0FBQ2xDLHlDQUF3QztBQUN4QywyQ0FBeUM7QUFLekMsTUFBcUIsTUFBTTtJQStEekIsWUFBWSxNQUFjO1FBOURqQixXQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFPLENBQUM7UUFFN0IsYUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVyxDQUFDO1FBRW5DLGtCQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFhLENBQUM7UUFFMUMsbUJBQWMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWUsQ0FBQztRQUU3Qyx1QkFBa0IsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLGtCQUFtQixDQUFDO1FBRXJELHVCQUFrQixHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQW1CLENBQUM7UUFFckQsc0JBQWlCLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBa0IsQ0FBQztRQUVuRCxXQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUM7UUFFekIsYUFBUSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBVSxDQUFDO1FBRWxDLFVBQUssR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU8sQ0FBQztRQUU1QixVQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDO1FBRWxDLG1CQUFjLEdBQUcsSUFBSSw0QkFBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVqRCxXQUFNLEdBQUcsSUFBSSxlQUFNLEVBQUUsQ0FBQztRQUV0QixpQkFBWSxHQUFHLElBQUksR0FBRyxFQUF1QixDQUFDO1FBRTlDLFFBQUcsR0FBRyxJQUFJLG9CQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFM0IsV0FBTSxHQUFHLElBQUksa0JBQU0sQ0FBQyxnQ0FBb0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRTlELHVEQUF1RDtRQUM5QyxrQkFBYSxHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFjM0MsbURBQW1EO1FBQ25ELGlCQUFZLEdBQWtCLEVBQUUsQ0FBQztRQUVqQyx5QkFBb0IsR0FBMEIsRUFBRSxDQUFDO1FBRWpELHlEQUF5RDtRQUN6RCxrQkFBYSxHQUFHLEVBQUUsQ0FBQztRQUVuQjs7b0NBRTRCO1FBQzVCLGVBQVUsR0FBRyxpQkFBSyxDQUFDLFFBQVEsQ0FBQztRQUU1QixtQkFBYyxHQUFHLHNCQUFVLENBQUMsU0FBUyxDQUFDO1FBR3BDLElBQUEsaUJBQU8sR0FBRSxDQUFDO1FBQ1YsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLGtCQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELGNBQWMsQ0FBQyxFQUFlO1FBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxFQUF1QjtRQUM1QyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQTRDO1FBQy9ELE1BQU0sS0FBSyxHQUFHLE1BQU0sSUFBQSxpQkFBUSxHQUFFLENBQUM7UUFDL0IsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sT0FBTyxHQUFHLE1BQU0sS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QyxJQUFJLFlBQVksR0FBRyxDQUFDLENBQUM7UUFFckIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztRQUNsQyxLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssRUFBRTtZQUN4QixNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLENBQUMsU0FBUyxrQ0FBa0MsQ0FBQyxDQUFDO2dCQUMxRSxTQUFTO2FBQ1Y7WUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLGVBQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDOUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFakIsWUFBWSxFQUFFLENBQUM7U0FDaEI7UUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV2QixPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsWUFBWSw0QkFBNEIsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFRCxjQUFjO1FBQ1osV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUNmLHVFQUF1RTtZQUN2RSxlQUFlO1lBQ2YsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFeEMsaUVBQWlFO1lBQ2pFLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDN0IsT0FBTztpQkFDUjtnQkFFRCxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDMUIsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsS0FBSztRQUNILHVDQUF1QztRQUN2QyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFNLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7Q0FDRjtBQTNIRCx5QkEySEMifQ==