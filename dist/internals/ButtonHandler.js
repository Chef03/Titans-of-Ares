"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ButtonConfirmation = exports.ButtonHandler = void 0;
const discord_js_1 = require("discord.js");
const utils_1 = require("./utils");
class ButtonHandler {
    constructor(msg, embed, userID) {
        this.buttons = [];
        this.msg = msg;
        this.userID = userID || msg.author.id;
        this.embed = new discord_js_1.MessageEmbed();
        if (embed instanceof discord_js_1.MessageEmbed) {
            this.embed = new discord_js_1.MessageEmbed(embed);
        }
        else if (typeof embed === "string") {
            const newEmbed = new discord_js_1.MessageEmbed()
                .setColor(utils_1.BROWN)
                .setDescription(embed);
            this.embed = newEmbed;
        }
    }
    get emojis() {
        return this.buttons.map(x => x.emoji);
    }
    getCB(key) {
        return this.buttons.find(x => x.emoji === key).callback;
    }
    async react() {
        try {
            for (const emoji of this.emojis) {
                await this.msgCollector?.react(emoji);
            }
            // eslint-disable-next-line no-empty
        }
        catch { }
    }
    createLabel() {
        return this.buttons.map(x => {
            return `\`${x.emoji} ${x.label}\``;
        }).join("\n");
    }
    addButton(emoji, label, cb) {
        this.buttons.push({
            emoji,
            label,
            callback: cb,
        });
        return this;
    }
    addCloseButton() {
        this.buttons.push({
            emoji: "❌",
            label: "close this menu",
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            callback: () => { },
        });
    }
    async run() {
        const filter = (reaction, user) => {
            return this.emojis.includes(reaction.emoji.name)
                && user.id === this.userID;
        };
        const options = { max: 1, time: 30000, errors: ['time'] };
        this.embed.addField("---------", this.createLabel());
        this.msgCollector = await this.msg.channel.send(this.embed);
        this.react();
        const collected = await this.msgCollector.awaitReactions(filter, options)
            .catch(() => this.msgCollector?.delete());
        if (collected instanceof discord_js_1.Collection) {
            const reaction = collected.first();
            if (reaction) {
                const cb = this.getCB(reaction.emoji.name);
                await this.msgCollector.delete();
                await cb(reaction.emoji.name);
            }
        }
    }
}
exports.ButtonHandler = ButtonHandler;
class ButtonConfirmation extends ButtonHandler {
    constructor(msg, embed) {
        super(msg, embed);
        this.result = false;
        this.addButton(utils_1.BLUE_BUTTON, "yes", () => this.result = true);
        this.addCloseButton();
    }
    async confirm() {
        await this.run();
        return this.result;
    }
}
exports.ButtonConfirmation = ButtonConfirmation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQnV0dG9uSGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvQnV0dG9uSGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwyQ0FBc0Y7QUFDdEYsbUNBQTZDO0FBUTdDLE1BQWEsYUFBYTtJQU94QixZQUFZLEdBQVksRUFBRSxLQUE0QixFQUFFLE1BQWU7UUFOL0QsWUFBTyxHQUFhLEVBQUUsQ0FBQztRQU83QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSx5QkFBWSxFQUFFLENBQUM7UUFFaEMsSUFBSSxLQUFLLFlBQVkseUJBQVksRUFBRTtZQUNqQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUkseUJBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN0QzthQUFNLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBRXBDLE1BQU0sUUFBUSxHQUFHLElBQUkseUJBQVksRUFBRTtpQkFDaEMsUUFBUSxDQUFDLGFBQUssQ0FBQztpQkFDZixjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFekIsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUM7U0FDdkI7SUFDSCxDQUFDO0lBRUQsSUFBWSxNQUFNO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVPLEtBQUssQ0FBQyxHQUFXO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLEdBQUcsQ0FBRSxDQUFDLFFBQVEsQ0FBQztJ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