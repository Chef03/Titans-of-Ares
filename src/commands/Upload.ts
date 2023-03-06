import Command from "../internals/Command";
import { Message, MessageAttachment, MessageEmbed } from "discord.js";
import { CancelledInputError, Prompt } from "../internals/Prompt";
import {
  BLUE_BUTTON,
  bold,
  getXp,
  RED_BUTTON,
  split,
  NUMBER_BUTTONS as NB,
  inlineCode,
  parseDecimal,
  WHITE_BUTTON,
  NUMBER_BUTTONS,
  nukeChannel,
} from "../internals/utils";
import { ButtonConfirmation, ButtonHandler } from "../internals/ButtonHandler";
import { oneLine } from "common-tags";
import { client } from "../main";
import {
  registerDayEntry,
  ChallengeName,
  getChallengeByChannelID,
  getConvertTable,
  replaceDayEntry,
  deleteDayEntry,
  addDayEntry,
  Challenge,
  OverlapError,
  getDayEntries,
  getEntryCount,
  DayEntry,
} from "../db/monthlyChallenge";
import { DateTime } from "luxon";
import { registerBook, getAllBooks, removeBook, finishBook } from "../db/book";
import { finishGoal, getAllGoals, Goal, registerGoal, removeGoal } from "../db/goals";
import groupBy from "lodash.groupby";
import { getTotalPoints } from "../db/player";
import { addXP } from "../db/xp";
import { xpLog } from "../internals/xpLog";
import { Player } from "../internals/Player";
import { removeInventory } from "../db/inventory";
import { MiningPickReward } from "../internals/MiningPickReward";
import { Leaderboard } from "../internals/Leaderboard";

type RegisterOptions = {
  value: number;
  challengeName: ChallengeName;
  activityName: string;
  day: number;
  replaceOnly?: boolean;
  cb?: () => void | Promise<void>;
};

interface categoryData {

  handler: undefined | (() => Promise<void>),
  limit?: number

}

interface entryData extends DayEntry {

  challengeID: number

}

export default class Upload extends Command {
  name = "upload";
  aliases = ["up"];
  msg!: Message;
  convertTable!: Map<string, number>;
  challenge!: Challenge;
  date!: DateTime;
  maxDay!: number;
  today!: number;
  month!: string;
  prompt!: Prompt;

  async exec(msg: Message, args: string[]) {
    const channelID = client.isDev ? "859483633534238762" : msg.channel.id;
    this.msg = msg;
    this.challenge = await getChallengeByChannelID(channelID);
    this.prompt = new Prompt(this.msg, { cancelKeyword: ["cancel", "Cancel"] });
    this.convertTable = await getConvertTable();

    if (!this.challenge) {
      return msg.channel.send("wrong channel");
    }

    const tokens = this.challenge.Name.split(' ');
    const parsed_string = `${tokens[3] + " " + tokens[4]}`

    this.date = DateTime.fromFormat(parsed_string, 'LLLL y', { locale: 'en-US' })
    this.maxDay = this.date.daysInMonth;
    this.month = this.date.monthLong;
    this.today = DateTime.now().day;

    const categoryHandler = new Map<string, categoryData>();
    categoryHandler.set("steps", { handler: () => this.handleSteps() });
    categoryHandler.set("cycling", { handler: () => this.handleCycling() });
    categoryHandler.set("strength", { handler: () => this.handleStrength() });
    categoryHandler.set("yoga", { handler: () => this.handleYogaAndMeditation('yoga') });
    categoryHandler.set("meditation", {
      handler: () =>
        this.handleYogaAndMeditation("meditation")
    });
    categoryHandler.set("rowing", { handler: () => this.handleRowing() });
    categoryHandler.set("other cardio", { handler: () => this.handleOtherCardio() });
    categoryHandler.set("bonus challenges", { handler: () => this.handleBonusChallenges() });
    categoryHandler.set("remove previous upload", { handler: () => this.handleUploadRemove() })

    const question = "Please select a category to upload for points";
    const menu = new ButtonHandler(msg, question);

    let i = 1;
    for (const [category, { handler }] of categoryHandler) {

      const handleMethod = async () => {

        if (handler) {

          await handler();
          const leaderboard = new Leaderboard()
          await leaderboard.init(this.challenge);

          const images = await leaderboard.generateImage()

          await nukeChannel(leaderboard.channel);

          await Promise.all(images.map((image, i) => {

            const embed = new MessageEmbed()
            embed.attachFiles([image]);
            embed.setImage(`attachment://page${i + 1}.jpg`);
            return leaderboard.channel.send(embed)

          }))


        }

      }
      menu.addButton(NB[i], category, handleMethod!);
      i++;
    }

    menu.addCloseButton();

    try {

      await menu.run();
      msg.channel.send(
        oneLine`For a total overview of your uploads this month, use
        \`${client.prefix}progress\`.`
      );

    } catch (err) {

      console.error(err);
      msg.channel.send((err as Error).message);
      msg.channel.send(
        `Upload process failed. Please rerun \`${client.prefix}${this.name}\``
      );
    }
  }

  private getConversionRate(challengeName: ChallengeName, challengeID = this.challenge.ID) {

    const lookupID = `${challengeName}-${challengeID}`;
    const conversionRate = this.convertTable.get(lookupID);

    if (!conversionRate)
      throw new Error(`conversion rate does not exists for "${lookupID}"`);

    return conversionRate;
  }

  private validateDays(days: number[]) {
    for (const day of days) {
      this.validateDay(day);
    }
  }

  private validateNumber(num: number) {
    if (Number.isNaN(num)) {
      throw new Error(`${inlineCode(num)} is not valid number type`);
    }
  }

  private async showSuccessMessage(data: RegisterOptions) {

    const conversionRate = this.getConversionRate(data.challengeName);
    const points = Math.round(conversionRate * data.value);
    const xp = getXp(points);

    let amount: number | string = '';

    if (data.challengeName == "yoga10" || data.challengeName == "yoga30" || data.challengeName == "meditation10" || data.challengeName == "meditation30"
      || data.challengeName == "get10walks" || data.challengeName == "get10cycling"
    ) {

      if (data.value === 1) {
        amount = "a";
      }

    }

    else {
      amount = data.value;
    }


    const text = oneLine`You have registered ${bold(amount)} ${data.activityName} on
      ${bold(this.month)} ${bold(data.day)} and earned ${bold(points)} monthly
      points + ${bold(xp)} permanent XP!`;

    await this.msg.channel.send(text);
    await this.weekstreakCheck(data.day);
    await xpLog(this.msg, `Registered Day: ${data.day} Progress: ${data.value} ${data.challengeName}`);

  }

  private async weekstreakCheck(monthDay: number) {


    const currentDate = DateTime.fromObject({ year: this.date.year, month: this.date.month, day: monthDay });

    let nextSundayIsNextMonth = false;

    const todayIndex = currentDate.weekday - 1; //make monday start at 0
    let previousMonday = currentDate.minus({ days: todayIndex }) // correct
    let nextSunday = currentDate.plus({ days: 6 - todayIndex });

    //set monday to previous month
    // uploading on start of next challenge
    // if (currentDate.daysInMonth - currentDate.day > currentDate.daysInMonth - 7) {

    //   previousMonday = currentDate.set(
    //     {
    //       year: this.date.month == 1 ? this.date.year - 1 : this.date.year,
    //       month: this.date.month - 1,
    //       weekday: 1
    //     }
    //   );
    //   isOverlappingStart = true;

    // }

    // //set sunday to next month
    // //uploading on end of current challenge
    // if (currentDate.daysInMonth - currentDate.day < 7) {

    //   nextSunday = currentDate.set(
    //     {
    //       year: this.date.month == 12 ? this.date.year + 1 : this.date.year,
    //       month: this.date.month + 1,
    //       weekday: 7
    //     }
    //   );
    //   isOverlappingEnd = true;

    // }


    let currentWeek: [string, entryData[]][] = [];

    if (nextSunday.month == currentDate.month && previousMonday.month == currentDate.month) {

      let entries = await getDayEntries(this.msg.author.id, this.challenge.ID);
      entries = entries.map(entry => ({ ...entry, challengeID: this.challenge.ID }));

      const dayEntries = Object.entries(groupBy(entries, (x) => x.Day));
      const filtered_entries = dayEntries.filter(([day, data]) => parseInt(day) >= previousMonday.day && parseInt(day) <= nextSunday.day);
      currentWeek = filtered_entries as [string, entryData[]][];

    }

    if (previousMonday.month != currentDate.month) {

      //old month entries
      let priorEntries = await getDayEntries(this.msg.author.id, this.challenge.ID - 1);
      priorEntries = priorEntries.map(entry => ({ ...entry, challengeID: this.challenge.ID - 1 }));

      const parsedPriorEntries = Object.entries(groupBy(priorEntries, (x) => x.Day));
      const filtered_prior = parsedPriorEntries.filter(([day, data]) => parseInt(day) >= previousMonday.day && parseInt(day) <= previousMonday.daysInMonth);

      // new month entries
      let entries = await getDayEntries(this.msg.author.id, this.challenge.ID);
      entries = entries.map(entry => ({ ...entry, challengeID: this.challenge.ID }));

      const dayEntries = Object.entries(groupBy(entries, (x) => x.Day));
      const filtered_entries = dayEntries.filter(([day, data]) => parseInt(day) >= 1 && parseInt(day) <= nextSunday.day);

      currentWeek = [...filtered_prior, ...filtered_entries] as [string, entryData[]][];;

    }

    if (nextSunday.month != currentDate.month) {

      //this month entries
      let priorEntries = await getDayEntries(this.msg.author.id, this.challenge.ID);
      priorEntries = priorEntries.map(entry => ({ ...entry, challengeID: this.challenge.ID }));

      const parsedPriorEntries = Object.entries(groupBy(priorEntries, (x) => x.Day));
      const filtered_prior = parsedPriorEntries.filter(([day, data]) => parseInt(day) >= previousMonday.day && parseInt(day) <= previousMonday.daysInMonth);

      // next month entries
      let entries = await getDayEntries(this.msg.author.id, this.challenge.ID + 1);
      entries = entries.map(entry => ({ ...entry, challengeID: this.challenge.ID + 1 }));

      const dayEntries = Object.entries(groupBy(entries, (x) => x.Day));
      const filtered_entries = dayEntries.filter(([day, data]) => parseInt(day) >= 1 && parseInt(day) <= nextSunday.day);

      currentWeek = [...filtered_prior, ...filtered_entries] as [string, entryData[]][];;
      nextSundayIsNextMonth = true;

    }

    const has_streak = currentWeek.find(([day, data]) => parseInt(day) == nextSunday.day && data.find(entry => entry.ValueType == "weekstreak"));

    if (has_streak) return;

    const pointData = new Map();

    currentWeek.map(([day, data]) => {

      data.map(entry => {

        const conversionRate = this.getConversionRate(entry.ValueType, entry.challengeID);
        const points = Math.round(conversionRate * entry.Value);

        if (pointData.get(entry.Day)) {

          pointData.set(entry.Day, pointData.get(entry.Day) + points);

        }

        else {

          pointData.set(entry.Day, points);

        }

      })

    })

    if (pointData.size < 7) return;

    let isValid = true;
    pointData.forEach((val, key) => {

      if (val < 5) {
        isValid = false;
      }

    })

    if (!isValid) return;

    // await addXP(this.msg.author.id, 20);

    // uploading on start of next challenge
    if (nextSundayIsNextMonth) {

      await registerDayEntry(
        this.msg.author.id,
        nextSunday.day,
        this.challenge.ID + 1,
        'weekstreak',
        1
      );

    }

    else {

      await registerDayEntry(
        this.msg.author.id,
        nextSunday.day,
        this.challenge.ID,
        'weekstreak',
        1
      );

    }

    await this.msg.channel.send(`You have earned a weekstreak bonus for getting **5** points every day of the week! Earned **10** monthly points + **20** permanent XP!`)
    await client.logChannel.send(`<@${this.msg.member?.id}> has earned a weekstreak bonus for getting **5** points every day of the week! (+20 xp)`)

  }

  private async showAddMessage(data: RegisterOptions) {

    const conversionRate = this.getConversionRate(data.challengeName);
    const points = Math.round(conversionRate * data.value);
    const xp = getXp(points);
    const amount = data.value === 1 ? "a" : data.value;

    const text = oneLine`You have registered ${bold(amount)} additional
      ${data.activityName} on ${bold(this.month)} ${bold(data.day)} and earned
      ${bold(points)} monthly points + ${bold(xp)} permanent XP!`;

    await this.msg.channel.send(text);
    await this.weekstreakCheck(data.day);
    await xpLog(this.msg, `Registered Day: ${data.day} Progress: ${data.value} ${data.challengeName}`);

  }

  private async showReplaceMessage(data: RegisterOptions, originalValue?: number) {

    const conversionRate = this.getConversionRate(data.challengeName);
    const points = Math.round(conversionRate * data.value);
    const xp = getXp(points);
    const amount = data.value === 1 ? "a" : data.value;

    const difference = data.value - originalValue!;

    let xp_warning = '';

    if (difference >= 0) {

      const added_points = Math.round(conversionRate * difference);
      const added_xp = getXp(added_points);
      xp_warning = `and earned additional ${bold(added_points)} monthly
      points + ${bold(added_xp)} permanent XP!`;

    }
    else {

      const removed_points = Math.round(conversionRate * Math.abs(difference));
      const removed_xp = getXp(removed_points);
      xp_warning = `. ${bold(removed_points)} monthly points and ${bold(removed_xp)} permanent XP has been removed.`

    }

    //You have replaced x steps with x steps and earned x additional points + x permanent XP!
    const text = oneLine`You have replaced ${bold(originalValue!)} with ${bold(amount)} ${bold(data.activityName)} on
      ${bold(this.month)} ${bold(data.day)} ${xp_warning}`;

    await this.msg.channel.send(text);
    await this.weekstreakCheck(data.day);

    await xpLog(this.msg, `Registered Day: ${data.day} Progress: ${data.value - originalValue!} ${data.challengeName}`);


  }

  private validateDay(day: number) {
    if (Number.isNaN(day) || day > this.maxDay || day <= 0) {
      throw new Error(
        oneLine`Please only write the day of the the month (Example: use "5"
          for the 5th day in the month).`
      );
    }
  }

  private async getProof(
    value: number,
    activityName: string,
    day: number,
    question?: string
  ): Promise<MessageAttachment | undefined> {
    try {
      const collected = await this.prompt.collect(
        question ||
        oneLine`Please upload a single screenshot of your wearable showing ${bold(value)} ${activityName} on ${bold(this.month)} ${bold(day)}.`,
        { max: 1 }
      );

      if (collected.attachments.size <= 0) {
        throw new Error("At least one screenshot is needed");
      }

      return collected.attachments.first();

    } catch (e: unknown) {
      const err = e as CancelledInputError;

      if (err.keyword === "cancel") {
        throw new Error("Cancelled");
      } else {
        throw err;
      }
    }
  }

  private async getMultiProof(activity: string, sentence?: string): Promise<MessageAttachment[]> {

    sentence = !sentence ? oneLine`Please upload one or more screenshots proving your ${activity}
     for these days of the month. When done, please write 'done' in the
     channel.` : sentence;

    const images: MessageAttachment[] = [];

    try {

      /*

      Please upload one of more screenshots of your wearable showing the right amount of other cardio minutes for these days of the month. Remember that the average heartrate should be 125+. When done, please write 'done' in the channel.
      */
      const collected = await this.prompt.collect(sentence,
        {
          max: Number.MAX_SAFE_INTEGER,
          cancelKeyword: ["done", "Done", "cancel"],
          images: images
        }
      );

      if (collected.attachments.size <= 0) {
        throw new Error("At least one screenshot is needed");
      }


    } catch (e: unknown) {

      const err = e as CancelledInputError;
      if (err.keyword !== "done" && err.keyword !== "Done") {
        throw err;
      }

    }

    return images;

  }

  private async registerDay(options: RegisterOptions) {
    try {
      await registerDayEntry(
        this.msg.author.id,
        options.day,
        this.challenge.ID,
        options.challengeName,
        options.value
      );

      if (options.cb) {
        await options.cb();
      }

      await this.showSuccessMessage(options);

    } catch (e: unknown) {

      console.error(e);

      const { day, activityName, value } = options;
      const err = e as OverlapError;
      const amount = err.dayEntry.Value == 1 ? "a" : err.dayEntry.Value;

      const question = oneLine`You already registered ${bold(amount)} ${activityName} on
        ${bold(this.month)} ${bold(day)}. Do you want to
        replace ${options?.replaceOnly ? "" : "or add"}
        points on this day?`;

      const menu = new ButtonHandler(this.msg, question);

      menu.addButton(BLUE_BUTTON, "replace", async () => {

        await replaceDayEntry(
          this.msg.author.id,
          options.day,
          this.challenge.ID,
          options.challengeName,
          value
        );

        await this.msg.channel.send(`Successfully replaced`);
        await this.showReplaceMessage(options, err.dayEntry.Value);

      });

      if (!options?.replaceOnly) {
        menu.addButton(RED_BUTTON, "add points", async () => {

          await addDayEntry(
            this.msg.author.id,
            options.day,
            this.challenge.ID,
            options.challengeName,
            options.value
          );

          this.msg.channel.send(`Successfully added`);
          await this.showAddMessage(options);
        });
      }

      menu.addCloseButton();
      await menu.run();
    }
  }

  private async registerDays(
    days: number[],
    values: number[],
    messageOptions: Omit<RegisterOptions, "value" | "day">
  ) {
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const value = values[i];
      const successOptions: RegisterOptions = {
        ...messageOptions,
        day,
        value,
      };

      await this.registerDay(successOptions);
    }
  }

  private validateMultiRegister<T>(
    days: number[],
    values: T[],
    activityName: string
  ) {
    if (days.length !== values.length) {
      throw new Error(
        oneLine`You are uploading for ${days.length} days but only
        ${values.length} ${activityName} are given.`
      );
    }
  }

  private confirmation(text: string) {
    return new ButtonConfirmation(this.msg, text).confirm();
  }

  private async handleUploadRemove() {

    const day = await this.prompt.ask('What day would you like to remove a workout on?')
    // What kind of workout do you want to remove from this day?


    this.validateDay(parseInt(day))

    const entries = await getDayEntries(this.msg.author.id, this.challenge.ID);
    const dayEntry = entries.filter(entry => entry.Day == parseInt(day));
    if (!dayEntry.length) {
      this.msg.channel.send(oneLine`You have no workouts on ${bold(day + " " + this.date.toFormat("MMMM"))}`)
    }


    else {
      const menu = new ButtonHandler(this.msg, oneLine`What kind of workout do you want to remove from this day?`)
      dayEntry.map((entry, i) => {

        menu.addButton(NUMBER_BUTTONS[i], entry.ValueType, async () => {

          await deleteDayEntry(this.msg.author.id, entry.Day, this.challenge.ID, entry.ValueType)
          await this.msg.channel.send(oneLine`Your ${bold(entry.ValueType)} workout has been removed from day ${bold(day + " " + this.date.toFormat("MMMM"))}.Your previous gained points for this workout have been removed.`)
          const player = await Player.getPlayer(this.msg.member!);

          const point = entry.Value * this.getConversionRate(entry.ValueType)!;

          const xp = Math.round(getXp(point));

          const pickCount = Math.floor(Math.abs(xp) / 10);

          for (let i = 0; i < pickCount; i++) {

            await removeInventory(this.msg.member!.id, 'pick_mining')
            await MiningPickReward.setUpperLimit(player);

          }

          await this.msg.channel.send(`You have lost ${bold(pickCount)} mining picks.`)


        })

      })

      menu.addCloseButton()
      await menu.run()
    }


  }

  private async handleBonusChallenges() {
    const menu = new ButtonHandler(
      this.msg,
      oneLine`There are multiple bonus challenges every month. Click on one to
      get more details or if you want to upload a bonus challenge.`
    );

    menu.addButton(NB[1], "Get a 5 point weekstreak", () => {
      this.msg.channel.send(
        oneLine`You can obtain 10 additional monthly points (and 20 permanent
        XP) every week by earning 5 points daily Monday to Sunday. The bot will
        let you know when you have earned this bonus and will add the points
        automatically!`
      );
    });

    menu.addButton(NB[2], "Get 10 walks over 5km/3,1mi", async () => {
      await this.handleBonus("get10walks", 1, () => this.handleBonusWalkAndCycle("walking"))
    });

    menu.addButton(
      NB[3],
      "Get 10 cycling sessions over 15km/9,32mi",
      async () => {
        await this.handleBonus("get10cycling", 1, () => this.handleBonusWalkAndCycle("cycling"))
      }

    );

    menu.addButton(NB[4], "Read an educational book", async () => {

      await this.handleBonus("readabook", 1, () => this.handleBook())

    });

    menu.addButton(NB[5], "Food diary", async () => {

      await this.handleBonus("diary", 5, () => this.handleFoodDiary())

    });


    menu.addButton(NB[6], "Set a monthly personal goal", async () => {

      try {

        const goals = await getAllGoals(this.msg.author.id);
        const unfinishedGoal = goals.find(goal => !goal.Finished);

        if ((this.today <= 5 || this.today >= 28)) {

          if (unfinishedGoal) {

            const question = oneLine`Your personal goal is the following:
            \n**${unfinishedGoal.goal}**\n
            Have you completed your goal? Or do you want to 
            remove your current personal challenge? 
            `
            const menu = new ButtonHandler(this.msg, question);
            menu.addButton(RED_BUTTON, "Remove Challenge", async () => {

              await removeGoal(unfinishedGoal.ID);
              await this.msg.channel.send("You removed your personal goal. Rerun $upload to set a new goal!")

            })

            await menu.addButton(BLUE_BUTTON, "Complete Challenge", async () => {

              await this.confirmSummary(unfinishedGoal);

            })

            menu.addCloseButton();
            await menu.run();

          }

          else {

            await this.addPersonalGoal();

          }

        }

        else {

          if (unfinishedGoal) {

            await this.viewPersonalGoal(unfinishedGoal);

          }

          else {

            await this.msg.channel.send("You can only submit a new challenge between the 28th and the 5th of next month")

          }

        }

      }

      catch (e) {



      }


    });


    menu.addButton(NB[7], "Share a workout selfie", async () => {

      await this.handleBonus("workoutselfie", 4, () => this.handleWorkoutSelfie())

    });

    menu.addButton(NB[8], "Share a personal photo", async () => {

      await this.handleBonus("personalphoto", 1, () => this.handlePersonalPhoto())

    });

    menu.addCloseButton();
    try {
      await menu.run();
    }
    catch (e) {
      console.log('error caught: ' + e)
    }
  }

  private async handleBonus(type: ChallengeName, limit: number, cb: () => Promise<void>) {

    try {
      const count = await getEntryCount(type, this.msg.author.id);
      if (count >= limit) throw new Error(`You can't have more than ${bold(limit)} ${type} per month.`)
      await cb()

    }
    catch (err) {

      console.error(err);
      this.msg.channel.send((err as Error).message);
      this.msg.channel.send(
        `Upload process failed. Please rerun \`${client.prefix}${this.name}\``
      );

    }

  }

  private async viewPersonalGoal(goal: Goal) {

    const question = oneLine`You have submitted the following personal goal
     this month: **${goal?.goal}**. Did you complete your personal challenge?
      If you are not going to finish your personal goal you can just leave it here
       and you can pick a new goal next month!`

    const mainMenu = new ButtonHandler(this.msg, question)
    mainMenu.addButton(BLUE_BUTTON, "yes", async () => {

      await this.confirmSummary(goal)

    })
    mainMenu.addCloseButton();
    await mainMenu.run();

  }


  private async addPersonalGoal() {

    const menu = new ButtonHandler(
      this.msg,
      oneLine`You can pick (until the 5th of the month) 
      a personal goal for this month and share it with others.
       Upon finishing the personal goal you can return to this menu and claim your bonus points
        (25 points) by sharing your experience and
         proving the completing of the goal by screenshots/pictures. Do you want to pick a personal goal now?`
    );

    menu.addButton(BLUE_BUTTON, "yes", async () => {

      const prompt = `Please type your personal challenge for the month. Please make it as SMART as possible. Meaning it has to be Specific, Measurable, Attainable, Relevant, Timely. Please answer in 1 message.`

      const challenge = await this.confirm(prompt, `Your personal challenge is the following: %s, is that right? Please note that this will be shared with the other Titans so they can keep you motivated!`)

      await this.msg.channel.send("Excellent! Your personal goal is registered and you can return here once you have finished it to claim the bonus points! Please note this is only possible after the 5th of the month.")

      await registerGoal({ $userID: this.msg.author.id, $goal: challenge })
      await client.mainTextChannel.send(`<@${this.msg.author.id}> has submitted a new personal goal for this month!\n${bold(challenge)}`)


    });

    menu.addCloseButton();
    try {
      await menu.run();
    }
    catch (e) {
      console.error(e);

    }

  }


  private async handlePersonalPhoto() {
    const challengeName: ChallengeName = "personalphoto";
    const activity = "share a personal photo";
    const menu = new ButtonHandler(
      this.msg,
      oneLine`You can earn 5 points for sharing a personal photo with text.
      These points can be earned once a month. You can share a photo of
      yourself, with your friends, with your pet or family. Do you want to share
      a personal photo now?`
    );

    menu.addButton(BLUE_BUTTON, "yes", async () => {
      const image = await this.getProof(
        1,
        activity,
        this.today,
        "Please upload your personal photo now."
      );

      const title = oneLine`Please write text to be posted with your personal photo, please
        write it in 1 message.`


      const confirmation = await this.confirm(title, oneLine`Your text with your personal photo is the following: %s, this will be shared with your photo. Is this
        correct?`)

      if (confirmation) {

        await this.registerDay({
          value: 1,
          challengeName,
          activityName: activity,
          day: this.today,
          replaceOnly: true,
          cb: () => {

            client.mainTextChannel.send(
              oneLine`<@${this.msg.author.id}> has uploaded a personal photo!
              ${bold(confirmation)} `
              , {
                files: image ? [image] : []
              });

          }
        });


      }
    });

    menu.addCloseButton();
    await menu.run();
  }

  private async handleWorkoutSelfie() {

    const challengeName: ChallengeName = "workoutselfie";
    const activity = "share a workout selfie";
    const menu = new ButtonHandler(
      this.msg,
      oneLine`You can earn 5 points for sharing a workout selfie (or post
      workout). These points can be earned 4 times a month. Do you want to
      share a workout selfie now?`
    );

    menu.addButton(BLUE_BUTTON, "yes", async () => {
      const image = await this.getProof(
        1,
        activity,
        this.today,
        "Please upload your workout selfie now."
      );

      const title = oneLine`Please give a title or text to your workout selfie, please write
        it in 1 message.`

      const confirmation = await this.confirm(title,
        oneLine`Your title/text with your workout selfie is the following: %s, this will be shared with your workout selfie. Is
        this correct?`
      );

      if (confirmation) {
        await this.registerDay({
          value: 1,
          challengeName,
          activityName: 'workout selfie',
          day: this.today,
          replaceOnly: true,
          cb: () => {
            client.mainTextChannel.send(
              oneLine`<@${this.msg.author.id}> has uploaded a workoutselfie with the following text: 
              ${bold(confirmation)}`
              , { files: image ? [image] : [] });
          }
        });


      }
    });

    menu.addCloseButton();
    await menu.run();
  }

  private async handleFoodDiary() {
    const challengeName: ChallengeName = "diary";
    const activity = "food diary logging";
    const menu = new ButtonHandler(
      this.msg,
      oneLine`You can earn 10 points for counting your food and calories for at
      least 5 days in 1 week (Monday to Sunday). These points can be earned
      every week. Do you want to upload a week of food logging now?`
    );

    menu.addButton(BLUE_BUTTON, "yes", async () => {
      const day = parseInt(
        await this.prompt.ask(
          oneLine`Please write the day of the month of the last food logging that
        you did to complete this challenge.`
        )
      );

      this.validateDay(day);

      await this.getMultiProof(activity);

      await this.registerDay({
        value: 1,
        challengeName,
        activityName: activity,
        day,
      });
    });

    menu.addCloseButton();
    await menu.run();
  }

  private async handleBook() {

    const challengeName: ChallengeName = "readabook";
    const books = await getAllBooks(this.msg.author.id);
    // finds unfinished book
    const book = books.find((x) => !x.Finished);

    if (book) {
      const menu = new ButtonHandler(
        this.msg,
        `Did you finish reading ${bold(book.Name)}?`
      );

      // eslint-disable-next-line
      menu.addButton(BLUE_BUTTON, "Continue reading", () => { });

      menu.addButton(RED_BUTTON, "I finished my book", async () => {

        const evaluation = oneLine`Excellent! Please share us your thoughts in one message. Did
            you learn something? What was it about? Let others know if the book
            is worth to pick up or not!`

        const confirmation = await this.confirm(evaluation,
          oneLine`The following message will be shared with the other Titans:
            %s. Is the text correct?`
        );

        if (confirmation) {
          await this.registerDay({
            value: 1,
            activityName: "book",
            challengeName,
            day: this.today,
            cb: async () => {

              await finishBook(book.ID, confirmation);
              await client.mainTextChannel.send(
                oneLine`<@${this.msg.author.id}> has finished the book
                  ${bold(book.Name)}! The evaluation is the following:
                  ${bold(confirmation)}.  Hopefully this also helps you to consider
                  picking the book up or not!`
              );
              if (book.image) {
                client.mainTextChannel.send(book.image)
              }

            }
          });

        }
      });

      menu.addButton(
        WHITE_BUTTON,
        "I want to remove my current book",
        async () => {
          const confirmation = await this.confirmation(
            oneLine`You are about to remove your current book
              ${bold(book.Name)}, are you sure?`
          );

          if (confirmation) {
            await removeBook(book.ID);
            this.msg.channel.send(
              oneLine`You have removed ${bold(book.Name)} from the read a
                book challenge!`
            );
          }
        }
      );

      await menu.run();
      return;

    }

    else {

      const menu = new ButtonHandler(
        this.msg,
        oneLine`You can pick an educational book to read and share it with others.
      The goal generally is to finish the book within a month, but you are
      allowed to read it over a longer period. Upon finishing the book you can
      return to this menu and claim your 25 bonus points by sharing your
      experience with reading the book. You can claim read a book bonus points
      once a month.`
      );

      menu.addButton(BLUE_BUTTON, "register book", async () => {

        const bookName = `Please type the name of the book you are going to read`;

        const bookNameConfirmation = await this.confirm(bookName,
          `Ah, I see you are reading %s! Is that correct?`
        );

        if (!bookNameConfirmation) {
          throw new Error("cancelled book name");
        }

        const bookLesson = oneLine`What do you expect to learn about in this book? Please answer in
        1 message. Please note that this will be shared with the other Titans so
        they can also learn from your book choice!`


        const bookLessonConfirmation = await this.confirm(bookLesson,
          `You expect to learn the following: %s, is that correct?`
        );

        if (!bookLessonConfirmation) {
          throw new Error("cancelled book lesson");
        }

        const confirmMenu = new ButtonHandler(this.msg, `Do you want to add a picture/screenshot/photo of your book?`);

        let image: MessageAttachment | undefined;

        confirmMenu.addButton(BLUE_BUTTON, "yes", async () => {

          image = await this.getProof(
            1,
            challengeName,
            this.today,
            "Please upload 1 picture of your book in the chat"
          );


        })

        confirmMenu.addButton(RED_BUTTON, "no", async () => {

        })

        await confirmMenu.run();

        await registerBook({
          $userID: this.msg.author.id,
          $challengeID: this.challenge.ID,
          $day: this.today,
          $name: bookNameConfirmation,
          $lesson: bookLessonConfirmation,
          $image: image ? image!.url : ""
        });

        const succesMessage = oneLine`Excellent! Your book is registered and you
        can return here once you have finished it to claim the bonus points!`;

        const announcementMessage = oneLine`<@${this.msg.author.id}> has submitted a new educational book to read.
       The book is called: ${bold(bookNameConfirmation)} and ${this.msg.author.username} expects to learn the following: ${bold(bookLessonConfirmation)}`

        if (client.isDev) {
          await this.msg.channel.send(succesMessage, { files: image ? [image] : [] });
        } else {
          await this.msg.channel.send(succesMessage);
          await client.mainTextChannel.send(announcementMessage, { files: image ? [image] : [] });

        }
      });

      menu.addCloseButton();
      await menu.run();

    }

  }

  private async handleBonusWalkAndCycle(activity: "walking" | "cycling") {

    const conversionRate = activity == "walking" ? "5km/3,1mi" : "15km/9,32mi";
    const challengeName: ChallengeName = activity == "walking"
      ? "get10walks"
      : "get10cycling";
    const menu = new ButtonHandler(
      this.msg,
      oneLine`You can earn 25 points for completing 10 ${activity} sessions over
      ${conversionRate} this month. Do you want to upload 10 ${activity} session
      now?`
    );

    menu.addButton(BLUE_BUTTON, "yes", async () => {
      const day = parseInt(
        await this.prompt.ask(
          oneLine`Please write the day of the month of the last ${activity}
        session that you did to complete this challenge.`
        )
      );

      this.validateDay(day);

      await this.getMultiProof(activity);

      await this.registerDay({
        value: 1,
        challengeName,
        activityName: `10 ${activity} session`,
        day,
        replaceOnly: true
      });
    });

    menu.addCloseButton();
    await menu.run();
  }

  private async handleOtherCardio() {
    const challengeName = "othercardio";
    const question = oneLine`You can earn 0,2 points for every minute of other
    cardio. Only cardio with average heartrate of 125+ can be uploaded. The
    cardio should not fit other categories or already award steps in a
    reasonable way (running is already awarded by steps).`;

    const activityName = " minutes other cardio";

    const menu = new ButtonHandler(this.msg, question);

    menu.addButton(BLUE_BUTTON, "single", async () => {
      const answer = await this.prompt.ask(
        oneLine`Please write the day of the month you want to upload other
        cardio for.`
      );

      const month = this.month;
      const day = parseInt(answer);

      this.validateDay(day);

      const minutes = parseInt(
        await this.prompt.ask(
          oneLine`Please write how many full minutes of other cardio (no decimals)
        you want to upload for **${month} ${day}.**`
        )
      );

      this.validateNumber(minutes);

      await this.getProof(
        minutes,
        activityName,
        day,
        oneLine`Please upload a single screenshot of your wearable showing ${bold(
          minutes
        )} minutes of other cardio with average heartrate above 125+ on
        ${bold(month)} ${bold(day)}.`
      );

      await this.registerDay({
        value: minutes,
        activityName,
        challengeName: challengeName,
        day,
      });
    });

    menu.addButton(RED_BUTTON, "multiple", async () => {
      const answer = await this.prompt.ask(
        oneLine`Please write the days of the month you want to upload other
        cardio for and seperate them with a space (example: 1 2 3 4 ….)`
      );

      const days = split(answer).map((x) => parseInt(x));

      this.validateDays(days);

      const minutesAnswer = await this.prompt.ask(
        oneLine`Please write how many full minutes of other cardio (no decimals)
        you want to upload for days ${bold(days.join(", "))} in the right order,
        please seperate them with a space \`(example: 60 90 42 30 …)\``
      );

      const sessions = split(minutesAnswer).map((x) => parseInt(x));

      this.validateMultiRegister(days, sessions, activityName);

      const sentence = `Please upload one or more screenshots of your wearable showing the right amount of other cardio minutes for these days of the month. Remember that the average heartrate should be 125+. When done, please write 'done' in the channel.`
      await this.getMultiProof(activityName, sentence);

      await this.registerDays(days, sessions, {
        challengeName: "othercardio",
        activityName,
      });
    });

    menu.addCloseButton();
    await menu.run();
  }

  private async handleRowing() {
    const question = oneLine`You can earn 1 point for every 1km or 0,62mi rowed.
      Do you want to upload a single day or multiple days?`;

    const menu = new ButtonHandler(this.msg, question);
    let unit: "km" | "mi" = "km";
    let challengeName: ChallengeName = "rowingkm";
    const activityName = ` ${unit} rowed`;

    menu.addButton(BLUE_BUTTON, "single", async () => {
      const question = "Do you want to upload rowing distance in km or mi?";
      const menu = new ButtonHandler(this.msg, question);

      menu.addButton(BLUE_BUTTON, "km", () => {
        challengeName = "rowingkm";
        unit = "km";
      });

      menu.addButton(RED_BUTTON, "mi", () => {
        challengeName = "rowingmi";
        unit = "mi";
      });

      menu.addCloseButton();
      await menu.run();

      const day = parseInt(
        await this.prompt.ask(
          oneLine`Please write the day of the month you want to upload rowing
        (${unit}) for.`
        )
      );

      const month = this.month;

      this.validateDay(day);

      const distance = parseDecimal(
        await this.prompt.ask(
          oneLine`Please write the distance (${unit}) you have rowed on
        ${bold(day)} ${bold(month)}`
        )
      );

      if (Number.isNaN(distance) || distance <= 0) {
        throw new Error("invalid distance");
      }


      await this.getProof(distance, `${unit} rowed`, day);

      await this.registerDay({
        value: distance,
        challengeName: challengeName,
        activityName: `${unit} rowed`,
        day,
      });
    });

    menu.addButton(RED_BUTTON, "multiple", async () => {
      const question = "Do you want to upload rowing distance in km or mi?";
      const menu = new ButtonHandler(this.msg, question);

      menu.addButton(BLUE_BUTTON, "km", () => {
        challengeName = "rowingkm";
        unit = "km";
      });

      menu.addButton(RED_BUTTON, "mi", () => {
        challengeName = "rowingmi";
        unit = "mi";
      });

      menu.addCloseButton();
      await menu.run();

      const answer = await this.prompt.ask(
        oneLine`Please write the days of the month you want to rowing ${unit}
        steps for and seperate them with a space \`(example: 1 2 3 4 ….)\``
      );

      const days = split(answer).map((x) => parseDecimal(x));

      this.validateDays(days);

      const rowsRespond = await this.prompt.ask(
        oneLine`Please write how many rowing ${unit} you want to upload for days
        ${days.join(" ")} in the right order, please seperate them with a space
        \`(example: 5,27 20,54 7,25 8,55 …)\``
      );

      const rows = split(rowsRespond).map((x) => parseDecimal(x));

      this.validateMultiRegister(days, rows, `${unit} rowed`);

      for (const row of rows) {
        if (Number.isNaN(row)) {
          throw new Error(`invalid format "${row}"`);
        }
      }

      await this.getMultiProof(`${unit} rowed`);

      await this.registerDays(days, rows, {
        challengeName: challengeName,
        activityName: `${unit} rowed`,
      });
    });

    menu.addCloseButton();
    await menu.run();
  }

  private async handleYogaAndMeditation(activity: "yoga" | "meditation") {
    const id = this.challenge.ID;
    const yoga10points = this.convertTable.get(`yoga10-${id}`);
    const yoga30points = this.convertTable.get(`yoga30-${id}`);
    const meditation10points = this.convertTable.get(`meditation10-${id}`);
    const meditation30points = this.convertTable.get(`meditation30-${id}`);

    const [session10points, session30points] =
      activity === "yoga"
        ? [yoga10points, yoga30points]
        : [meditation10points, meditation30points];

    const question = oneLine`You can earn ${session10points} points for
    ${activity} over 10 minutes. You can earn ${session30points} points for
    ${activity} over 30 minutes. Do you want to upload a single day or multiple
    days?`;

    const menu = new ButtonHandler(this.msg, question);

    menu.addButton(BLUE_BUTTON, "single", async () => {
      const answer = await this.prompt.ask(
        oneLine`Please write the day of the month you want to upload a
        ${activity} session for.`
      );

      const month = this.month;
      const day = parseInt(answer);
      let session: 10 | 30 = 10;

      this.validateDay(day);

      const sessionQuestion = "Was your session over 10 minutes or 30 minutes?";
      const menu = new ButtonHandler(this.msg, sessionQuestion);

      menu.addButton(BLUE_BUTTON, "10 minutes", () => {
        session = 10;
      });
      menu.addButton(RED_BUTTON, "30 minutes", () => {
        session = 30;
      });

      menu.addCloseButton();
      await menu.run();

      const challengeName: ChallengeName = `${activity}${session}`;

      await this.getProof(
        1,
        `${activity} session`,
        day,
        oneLine`Please upload a single screenshot of your wearable showing the
        date, duration of workout and heartrate. Alternatively, a photo of the
        ${activity} spot with mentioned elapsed time and/or additional
        information can be accepted.`
      );

      const options: RegisterOptions = {
        value: 1,
        challengeName: challengeName,
        activityName: `${session} minutes ${activity} session`,
        day,
      };

      const dayEntries = await getDayEntries(
        this.msg.author.id,
        this.challenge.ID
      );
      const dayEntry = dayEntries.filter((x) => x.Day === day);
      const activityEntry = dayEntry.find((x) =>
        x.ValueType.includes(activity)
      );

      if (activityEntry) {
        const valueType = activityEntry.ValueType;
        const amount = valueType.includes("10") ? "10min+" : "30min+";

        const question = oneLine`You already registered ${amount} ${activity} session on
          ${bold(month)} ${bold(day)}. Do you want to replace points on this
          day?`;

        const menu = new ButtonHandler(this.msg, question);

        menu.addButton(BLUE_BUTTON, "replace", async () => {
          await deleteDayEntry(
            this.msg.author.id,
            options.day,
            this.challenge.ID,
            activityEntry.ValueType
          );

          await registerDayEntry(
            this.msg.author.id,
            options.day,
            this.challenge.ID,
            options.challengeName,
            1
          );

          this.msg.channel.send(`Successfully replaced`);
          this.showReplaceMessage(options);

        });

        menu.addCloseButton();
        await menu.run();
      } else {
        await this.registerDay(options);
      }
    });

    menu.addButton(RED_BUTTON, "multiple", async () => {
      const answer = await this.prompt.ask(
        oneLine`Please write the days of the month you want to upload
        yoga/meditation sessions for and seperate them with a space (example: 1
        2 3 4 ….)`
      );

      const month = this.month;
      const days = split(answer).map((x) => parseInt(x));

      this.validateDays(days);

      const sessionAnswer = await this.prompt.ask(
        oneLine`Please write from left to right if the session was over 10
        minutes or 30 minutes for every day and seperate them with a space
        (example: 10 30 10 30 …)`
      );

      const sessions = split(sessionAnswer).map((x) => parseInt(x));

      this.validateMultiRegister(days, sessions, `${activity} session`);

      for (const session of sessions) {
        if (session !== 30 && session !== 10) {
          throw new Error("only `30` or `10` session is allowed");
        }
      }

      await this.getMultiProof(`${activity} session`);

      for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const session = sessions[i] as 10 | 30;
        const challengeName: ChallengeName = `${activity}${session}`;

        const options: RegisterOptions = {
          value: 1,
          challengeName: challengeName,
          activityName: `${session}min+ ${activity} session`,
          day,
        };

        const dayEntries = await getDayEntries(
          this.msg.author.id,
          this.challenge.ID
        );
        const dayEntry = dayEntries.filter((x) => x.Day === day);
        const activityEntry = dayEntry.find((x) =>
          x.ValueType.includes(activity)
        );

        if (activityEntry) {
          const valueType = activityEntry.ValueType;
          const amount = valueType.includes("10") ? "10min+" : "30min+";

          const question = oneLine`You already registered ${amount} ${activity} session on
            ${bold(month)} ${bold(day)}. Do you want to replace points on this
            day?`;

          const menu = new ButtonHandler(this.msg, question);

          menu.addButton(BLUE_BUTTON, "replace", async () => {
            await deleteDayEntry(
              this.msg.author.id,
              options.day,
              this.challenge.ID,
              activityEntry.ValueType
            );

            await registerDayEntry(
              this.msg.author.id,
              options.day,
              this.challenge.ID,
              options.challengeName,
              1
            );

            this.msg.channel.send(`Successfully replaced`);
            this.showReplaceMessage(options);
          });

          menu.addCloseButton();
          await menu.run();
        } else {
          await this.registerDay(options);
        }
      }
    });

    menu.addCloseButton();
    await menu.run();
  }

  private async handleStrength() {
    const challengeName: ChallengeName = "strength";
    const question = oneLine`You can earn 12 point for 1 strength training over 30 minutes. You
      can upload 1 strength training every day. Do you want to upload a single
      day or multiple days?`;

    const menu = new ButtonHandler(this.msg, question);
    const activityName = "strength training";

    menu.addButton(BLUE_BUTTON, "single", async () => {
      const answer = await this.prompt.ask(
        oneLine`Please write the day of the month you want to upload a strength
        training for.`
      );

      const day = parseInt(answer);
      const count = 1;

      this.validateDay(day);

      await this.getProof(
        count,
        activityName,
        day,
        oneLine`Please upload a single screenshot of your wearable showing the
        date, duration of workout and heartrate.`
      );

      await this.registerDay({
        value: count,
        challengeName: challengeName,
        activityName: activityName,
        day,
        replaceOnly: true,
      });
    });

    menu.addButton(RED_BUTTON, "multiple", async () => {
      const answer = await this.prompt.ask(
        oneLine`Please write the days of the month you want to upload strength
        training for and seperate them with a space \`(example: 1 2 3 4 ….)\``
      );

      const days = split(answer).map((x) => parseInt(x));
      const count = 1;

      this.validateDays(days);

      await this.getMultiProof(activityName);

      const trainings = days.map(() => count);

      await this.registerDays(days, trainings, {
        challengeName: challengeName,
        activityName: activityName,
        replaceOnly: true,
      });
    });

    menu.addCloseButton();
    await menu.run();
  }

  private async handleSteps() {
    const question = oneLine`You can earn 1 point for every 1000 steps taken. Do you want to
      upload a single day or multiple days?`;

    const challengeName: ChallengeName = "steps";
    const menu = new ButtonHandler(this.msg, question);
    const activityName = "steps";

    menu.addButton(BLUE_BUTTON, "single", async () => {
      const answer = await this.prompt.ask(
        "Please write the day of the month you want to upload steps for."
      );

      const month = this.month;
      const day = parseInt(answer);

      this.validateDay(day);

      const stepsRespond = await this.prompt.ask(
        oneLine`Please write how many steps you want to upload for
        ${bold(month)} ${bold(day)}.`
      );
      const steps = parseInt(stepsRespond);

      if (Number.isNaN(steps)) {
        throw new Error(
          `Please only write the number of steps without any text.`
        );
      } else if (steps > 250_000) {
        throw new Error("This challenge capped at 250k steps");
      }

      await this.getProof(steps, "steps", day);

      await this.registerDay({
        value: steps,
        activityName: activityName,
        challengeName: challengeName,
        day,
      });
    });

    menu.addButton(RED_BUTTON, "multiple", async () => {
      const answer = await this.prompt.ask(
        oneLine`Please write the days of the month you want to upload steps for
        and seperate them with a space \`(example: 1 2 3 4 ….)\``
      );

      const days = split(answer).map((x) => parseInt(x));

      this.validateDays(days);

      const stepsResponds = await this.prompt.ask(
        oneLine`Please write how many steps you want to upload for days
        ${days.join(" ")} in the right order, please seperate them with a space
        \`(example: 1456 2583 2847 8582 …)\``
      );

      const allSteps = split(stepsResponds).map((x) => parseInt(x));

      this.validateMultiRegister(days, allSteps, "steps");

      for (const steps of allSteps) {
        if (Number.isNaN(steps)) {
          throw new Error(`invalid format "${steps}"`);
        } else if (steps > 250_000) {
          throw new Error("This challenge capped at 250k steps");
        }
      }

      await this.getMultiProof("steps");

      await this.registerDays(days, allSteps, {
        challengeName: challengeName,
        activityName: "steps",
      });
    });

    menu.addCloseButton();
    await menu.run();
  }

  private async handleCycling() {
    let challengeName: ChallengeName = "cyclingkm";
    let unit = "km";
    const question = oneLine`You can earn 1 point for every 2km or 1,24mi cycled. Do you want
      to upload a single day or multiple days?`;
    const menu = new ButtonHandler(this.msg, question);
    const activityName = `${unit} cycled`;

    menu.addButton(BLUE_BUTTON, "single", async () => {
      const question = "Do you want to upload cycling distance in km or mi?";
      const menu = new ButtonHandler(this.msg, question);

      menu.addButton(BLUE_BUTTON, "km", () => {
        challengeName = "cyclingkm";
        unit = "km";
      });

      menu.addButton(RED_BUTTON, "mi", () => {
        challengeName = "cyclingmi";
        unit = "mi";
      });

      menu.addCloseButton();
      await menu.run();

      const day = parseInt(
        await this.prompt.ask(
          oneLine`Please write the day of the month you want to upload cycling
        (${unit}) for.`
        )
      );

      const month = this.month;

      this.validateDay(day);

      const distance = parseDecimal(
        await this.prompt.ask(
          oneLine`Please write the distance (${unit}) you have cycled on
        ${bold(day)} ${bold(month)}`
        )
      );

      if (Number.isNaN(distance) || distance <= 0) {
        throw new Error("invalid distance");
      }

      await this.getProof(distance, `${unit} cycled`, day);

      await this.registerDay({
        value: distance,
        challengeName,
        activityName: `${unit} cycled`,
        day,
      });
    });

    menu.addButton(RED_BUTTON, "multiple", async () => {
      const question = "Do you want to upload cycling distance in km or mi?";
      const menu = new ButtonHandler(this.msg, question);

      menu.addButton(BLUE_BUTTON, "km", () => {
        challengeName = "cyclingkm";
        unit = "km";
      });

      menu.addButton(RED_BUTTON, "mi", () => {
        challengeName = "cyclingmi";
        unit = "mi";
      });

      menu.addCloseButton();
      await menu.run();

      const answer = await this.prompt.ask(
        oneLine`Please write the days of the month you want to upload cycling
        (${unit}) for and seperate them with a space \`(example: 1 2 3 4 ….)\``
      );

      const days = split(answer).map((x) => parseInt(x));

      this.validateDays(days);

      const cyclingResponds = await this.prompt.ask(
        oneLine`Please write how many cycling (${bold(unit)}) you want to upload
        for days ${days.join(" ")} in the right order, please seperate them with
        a space \`(example: 5,27 20,54 7,25 8,55 …)\``
      );

      const allCycling = split(cyclingResponds).map((x) => parseDecimal(x));

      this.validateMultiRegister(days, allCycling, "cycling");

      for (const cycling of allCycling) {
        if (Number.isNaN(cycling)) {
          throw new Error(`invalid format "${cycling}"`);
        }
      }

      await this.getMultiProof("cycling");

      await this.registerDays(days, allCycling, {
        challengeName: challengeName,
        activityName: `${unit} cycled`,
      });
    });

    menu.addCloseButton();
    await menu.run();
  }


  private async confirm(prompt: string, confirmation_msg: string): Promise<string> {

    const promise = new Promise<string>(async (resolve, reject) => {

      try {

        const answer = await this.prompt.ask(prompt)
        const menu = new ButtonHandler(this.msg, confirmation_msg.replace('%s', bold(answer)))

        menu.addButton(BLUE_BUTTON, "yes", async () => {

          resolve(answer);

        })

        menu.addButton(RED_BUTTON, "no", async () => {

          resolve(this.confirm(prompt, confirmation_msg));

        })

        await menu.run()

      }

      catch (e) {
        reject(e)
      }

    })

    return promise;

  }

  private async confirmSummary(goal: Goal) {

    const reply = oneLine`Excellent! Please share us your summary of achieving the personal goal in one message. Let us know how it went!`;
    const confirmation_msg = oneLine`The following message will be shared with the other Titans: %s Is that correct?`

    const summary = await this.confirm(reply, confirmation_msg);

    const images = await this.getMultiProof("personal goal");

    await finishGoal(goal!.ID)

    await this.registerDay({
      value: 1,
      challengeName: "personalgoal",
      activityName: "personalgoal",
      day: this.today,
      replaceOnly: true
    });


    await client.mainTextChannel.send(`<@${this.msg.author.id}> has finished his or her personal goal! ${bold(goal.goal)}`)

    await Promise.all(images.map(async image => {

      return client.mainTextChannel.send({ files: [image] })

    }))

    await client.mainTextChannel.send(`Summary: ${bold(summary)}`)


  }

}
