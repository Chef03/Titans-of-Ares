"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Prompt = exports.CancelledInputError = exports.EmptyInputError = void 0;
const discord_js_1 = require("discord.js");
class EmptyInputError extends Error {
    constructor() {
        super("no input was given");
    }
}
exports.EmptyInputError = EmptyInputError;
class CancelledInputError extends Error {
    constructor(keyword) {
        super("cancelled input");
        this.keyword = keyword;
    }
}
exports.CancelledInputError = CancelledInputError;
class Prompt {
    constructor(msg, options) {
        this.msg = msg;
        this.options = options;
        this.asked_question = null;
    }
    async collect(question, options) {
        options = { ...this.options, ...options };
        this.asked_question = await this.msg.channel.send(question);
        const filter = (response) => response.author.id === this.msg.author.id;
        const collector = new discord_js_1.MessageCollector(this.msg.channel, filter, { max: 1, time: 120 * 1000, ...options });
        return new Promise((resolve, reject) => {
            collector.on("collect", (result) => {
                result.attachments.map(attachment => {
                    options?.images?.push(attachment);
                });
                if (options && options.cancelKeyword?.includes(result.content)) {
                    reject(new CancelledInputError(result.content));
                }
            });
            collector.on("end", async (results) => {
                const result = results.first();
                if (!result) {
                    await this.asked_question.delete();
                    reject(new EmptyInputError());
                    return;
                }
                resolve(result);
            });
        });
    }
    async ask(question, option) {
        const respond = await this.collect(question, option);
        return respond.content;
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvbXB0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVybmFscy9Qcm9tcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBT29CO0FBT3BCLE1BQWEsZUFBZ0IsU0FBUSxLQUFLO0lBQ3hDO1FBQ0UsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDOUIsQ0FBQztDQUNGO0FBSkQsMENBSUM7QUFFRCxNQUFhLG1CQUFvQixTQUFRLEtBQUs7SUFFNUMsWUFBWSxPQUFlO1FBQ3pCLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ3pCLENBQUM7Q0FDRjtBQU5ELGtEQU1DO0FBRUQsTUFBYSxNQUFNO0lBR2pCLFlBQW9CLEdBQVksRUFBVSxPQUF1QjtRQUE3QyxRQUFHLEdBQUgsR0FBRyxDQUFTO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBZ0I7UUFGakUsbUJBQWMsR0FBbUIsSUFBSSxDQUFDO0lBRStCLENBQUM7SUFFdEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUErQixFQUFFLE9BQXVCO1FBQ3BFLE9BQU8sR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFNUQsTUFBTSxNQUFNLEdBQUcsQ0FBQyxRQUFpQixFQUFFLEVBQUUsQ0FDbkMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBRTVDLE1BQU0sU0FBUyxHQUFHLElBQUksNkJBQWdCLENBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBc0IsRUFDL0IsTUFBTSxFQUNOLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxHQUFHLElBQUksRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUN6QyxDQUFDO1FBRUYsT0FBTyxJQUFJLE9BQU8sQ0FBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUM5QyxTQUFTLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLE1BQWUsRUFBRSxFQUFFO2dCQUUxQyxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRTtvQkFDbEMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7Z0JBQ25DLENBQUMsQ0FBQyxDQUFBO2dCQUVGLElBQUksT0FBTyxJQUFJLE9BQU8sQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDOUQsTUFBTSxDQUFDLElBQUksbUJBQW1CLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7aUJBQ2pEO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFFSCxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7Z0JBQ3BDLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLE1BQU0sRUFBRTtvQkFDWCxNQUFNLElBQUksQ0FBQyxjQUFlLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3BDLE1BQU0sQ0FBQyxJQUFJLGVBQWUsRUFBRSxDQUFDLENBQUM7b0JBQzlCLE9BQU87aUJBQ1I7Z0JBRUQsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUErQixFQUFFLE1BQXNCO1FBQy9ELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDO0lBQ3pCLENBQUM7Q0FDRjtBQS9DRCx3QkErQ0MifQ==