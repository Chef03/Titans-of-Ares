import {
  Message,
  MessageAttachment,
  MessageCollector,
  MessageCollectorOptions,
  MessageEmbed,
  TextChannel,
} from "discord.js";

type PromptOptions = MessageCollectorOptions & {
  cancelKeyword?: string[];
  images?: MessageAttachment[];
};

export class EmptyInputError extends Error {
  constructor() {
    super("no input was given");
  }
}

export class CancelledInputError extends Error {
  keyword: string;
  constructor(keyword: string) {
    super("cancelled input");
    this.keyword = keyword;
  }
}

export class Prompt {
  asked_question: Message | null = null;

  constructor(private msg: Message, private options?: PromptOptions) { }

  async collect(question: string | MessageEmbed, options?: PromptOptions) {
    options = { ...this.options, ...options };
    this.asked_question = await this.msg.channel.send(question);

    const filter = (response: Message) =>
      response.author.id === this.msg.author.id;

    const collector = new MessageCollector(
      this.msg.channel as TextChannel,
      filter,
      { max: 1, time: 120 * 1000, ...options }
    );

    return new Promise<Message>((resolve, reject) => {
      collector.on("collect", (result: Message) => {

        result.attachments.map(attachment => {
          options?.images?.push(attachment)
        })

        if (options && options.cancelKeyword?.includes(result.content)) {
          reject(new CancelledInputError(result.content));
        }
      });

      collector.on("end", async (results) => {
        const result = results.first();
        if (!result) {
          await this.asked_question!.delete();
          reject(new EmptyInputError());
          return;
        }

        resolve(result);
      });
    });
  }

  async ask(question: string | MessageEmbed, option?: PromptOptions) {
    const respond = await this.collect(question, option);
    return respond.content;
  }
}
