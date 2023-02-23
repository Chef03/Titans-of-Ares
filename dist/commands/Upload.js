"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../internals/Command"));
const Prompt_1 = require("../internals/Prompt");
const utils_1 = require("../internals/utils");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const common_tags_1 = require("common-tags");
const main_1 = require("../main");
const monthlyChallenge_1 = require("../db/monthlyChallenge");
const luxon_1 = require("luxon");
const book_1 = require("../db/book");
const goals_1 = require("../db/goals");
class Upload extends Command_1.default {
    constructor() {
        super(...arguments);
        this.name = "upload";
        this.aliases = ["up"];
    }
    async exec(msg, args) {
        const channelID = main_1.client.isDev ? "859483633534238762" : msg.channel.id;
        this.msg = msg;
        this.challenge = await (0, monthlyChallenge_1.getChallengeByChannelID)(channelID);
        this.prompt = new Prompt_1.Prompt(this.msg, { cancelKeyword: ["cancel", "Cancel"] });
        this.convertTable = await (0, monthlyChallenge_1.getConvertTable)();
        if (!this.challenge) {
            return msg.channel.send("wrong channel");
        }
        this.date = luxon_1.DateTime.local(this.challenge.Year, this.challenge.Month - 1);
        this.maxDay = this.date.daysInMonth;
        this.month = this.date.monthLong;
        const categoryHandler = new Map();
        categoryHandler.set("steps", () => this.handleSteps());
        categoryHandler.set("cycling", () => this.handleCycling());
        categoryHandler.set("strength", () => this.handleStrength());
        categoryHandler.set("yoga", () => this.handleYogaAndMeditation("yoga"));
        categoryHandler.set("meditation", () => this.handleYogaAndMeditation("meditation"));
        categoryHandler.set("rowing", () => this.handleRowing());
        categoryHandler.set("other cardio", () => this.handleOtherCardio());
        categoryHandler.set("bonus challenges", () => this.handleBonusChallenges());
        categoryHandler.set("remove previous upload", () => this.handleUploadRemove());
        let handler;
        if (args[0]) {
            let category = args[0];
            if (category === "bonus") {
                category = "bonus challenges";
            }
            else if (category === "othercardio") {
                category = "other cardio";
            }
            const cb = categoryHandler.get(category);
            if (!cb) {
                const categories = [...categoryHandler.keys()]
                    .map((x) => {
                    if (x === "bonus challenges") {
                        x = "bonus";
                    }
                    else if (x === "other cardio") {
                        x = "othercardio";
                    }
                    return (0, utils_1.inlineCode)(x);
                })
                    .join(", ");
                return msg.channel.send((0, common_tags_1.oneLine) `Invalid category. Valid categories are ${categories}.`);
            }
            handler = cb;
        }
        const question = "Please select a category to upload for points";
        const menu = new ButtonHandler_1.ButtonHandler(msg, question);
        let i = 1;
        for (const [category, handler] of categoryHandler) {
            menu.addButton(utils_1.NUMBER_BUTTONS[i], category, handler);
            i++;
        }
        menu.addCloseButton();
        try {
            handler ? await handler() : await menu.run();
            msg.channel.send((0, common_tags_1.oneLine) `For a total overview of your uploads this month, use
        \`${main_1.client.prefix}progress\`.`);
        }
        catch (err) {
            console.error(err);
            msg.channel.send(err.message);
            msg.channel.send(`Upload process failed. Please rerun \`${main_1.client.prefix}${this.name}\``);
        }
    }
    getConversionRate(challengeName) {
        const lookupID = `${challengeName}-${this.challenge.ID}`;
        const conversionRate = this.convertTable.get(lookupID);
        if (!conversionRate)
            throw new Error(`conversion rate does not exists for "${lookupID}"`);
        return conversionRate;
    }
    validateDays(days) {
        for (const day of days) {
            this.validateDay(day);
        }
    }
    validateNumber(num) {
        if (Number.isNaN(num)) {
            throw new Error(`${(0, utils_1.inlineCode)(num)} is not valid number type`);
        }
    }
    showSuccessMessage(data) {
        const conversionRate = this.getConversionRate(data.challengeName);
        const points = Math.round(conversionRate * data.value);
        const xp = (0, utils_1.getXp)(points);
        let amount;
        if (data.challengeName == "yoga10" || data.challengeName == "yoga30" || data.challengeName == "meditation10" || data.challengeName == "meditation30"
            || data.challengeName == "get10walks" || data.challengeName == "get10cycling") {
            if (data.value === 1) {
                amount = "a";
            }
        }
        else {
            amount = (0, utils_1.bold)(data.value);
        }
        const text = (0, common_tags_1.oneLine) `You have registered ${amount} ${data.activityName} on
      ${(0, utils_1.bold)(this.month)} ${(0, utils_1.bold)(data.day)} and earned ${(0, utils_1.bold)(points)} monthly
      points + ${(0, utils_1.bold)(xp)} permanent XP!`;
        this.msg.channel.send(text);
    }
    showAddMessage(data) {
        const conversionRate = this.getConversionRate(data.challengeName);
        const points = Math.round(conversionRate * data.value);
        const xp = (0, utils_1.getXp)(points);
        const amount = data.value === 1 ? "a" : (0, utils_1.bold)(data.value);
        const text = (0, common_tags_1.oneLine) `You have registered ${amount} additional
      ${data.activityName} on ${(0, utils_1.bold)(this.month)} ${(0, utils_1.bold)(data.day)} and earned
      ${(0, utils_1.bold)(points)} monthly points + ${(0, utils_1.bold)(xp)} permanent XP!`;
        this.msg.channel.send(text);
    }
    showReplaceMessage(data) {
        const conversionRate = this.getConversionRate(data.challengeName);
        const points = Math.round(conversionRate * data.value);
        const xp = (0, utils_1.getXp)(points);
        const amount = data.value === 1 ? "a" : (0, utils_1.bold)(data.value);
        const text = (0, common_tags_1.oneLine) `You have registered ${amount} ${data.activityName} on
      ${(0, utils_1.bold)(this.month)} ${(0, utils_1.bold)(data.day)} and earned ${(0, utils_1.bold)(points)} monthly
      points + ${(0, utils_1.bold)(xp)} permanent XP! Your previous gained points for this
      day have been removed.`;
        this.msg.channel.send(text);
    }
    validateDay(day) {
        if (Number.isNaN(day) || day > this.maxDay || day <= 0) {
            throw new Error((0, common_tags_1.oneLine) `Please only write the day of the the month (Example: use "5"
          for the 5th day in the month).`);
        }
    }
    async getProof(value, activityName, day, question) {
        try {
            const collected = await this.prompt.collect(question ||
                (0, common_tags_1.oneLine) `Please upload a single screenshot of your wearable showing ${(0, utils_1.bold)(value)} ${activityName} on ${(0, utils_1.bold)(this.month)} ${(0, utils_1.bold)(day)}.`, { max: 1 });
            if (collected.attachments.size <= 0) {
                throw new Error("At least one screenshot is needed");
            }
            return collected.attachments.first();
        }
        catch (e) {
            const err = e;
            if (err.keyword === "cancel") {
                throw new Error("Cancelled");
            }
            else {
                throw err;
            }
        }
    }
    async getMultiProof(activity, sentence) {
        sentence = !sentence ? (0, common_tags_1.oneLine) `Please upload one or more screenshots proving your ${activity}
     for these days of the month. When done, please write 'done' in the
     channel.` : sentence;
        const images = [];
        try {
            /*
      
            Please upload one of more screenshots of your wearable showing the right amount of other cardio minutes for these days of the month. Remember that the average heartrate should be 125+. When done, please write 'done' in the channel.
            */
            const collected = await this.prompt.collect(sentence, {
                max: Number.MAX_SAFE_INTEGER,
                cancelKeyword: ["done", "Done", "cancel"],
                images: images
            });
            if (collected.attachments.size <= 0) {
                throw new Error("At least one screenshot is needed");
            }
        }
        catch (e) {
            const err = e;
            if (err.keyword !== "done" && err.keyword !== "Done") {
                throw err;
            }
        }
        return images;
    }
    async registerDay(options) {
        try {
            await (0, monthlyChallenge_1.registerDayEntry)(this.msg.author.id, options.day, this.challenge.ID, options.challengeName, options.value);
            this.showSuccessMessage(options);
        }
        catch (e) {
            console.error(e);
            const { day, activityName, value } = options;
            const err = e;
            const amount = value === 1 ? "a" : (0, utils_1.bold)(err.dayEntry.Value);
            const question = (0, common_tags_1.oneLine) `You already registered ${amount} ${activityName} on
        ${(0, utils_1.bold)(this.month)} ${(0, utils_1.bold)(day)}. Do you want to
        replace ${options?.replaceOnly ? "" : "or add"}
        points on this day?`;
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
            menu.addButton(utils_1.BLUE_BUTTON, "replace", () => {
                (0, monthlyChallenge_1.replaceDayEntry)(this.msg.author.id, options.day, this.challenge.ID, options.challengeName, options.value);
                this.msg.channel.send(`Successfully replaced`);
                this.showReplaceMessage(options);
            });
            if (!options?.replaceOnly) {
                menu.addButton(utils_1.RED_BUTTON, "add points", () => {
                    (0, monthlyChallenge_1.addDayEntry)(this.msg.author.id, options.day, this.challenge.ID, options.challengeName, options.value);
                    this.msg.channel.send(`Successfully added`);
                    this.showAddMessage(options);
                });
            }
            menu.addCloseButton();
            await menu.run();
        }
    }
    async registerDays(days, values, messageOptions) {
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            const value = values[i];
            const successOptions = {
                ...messageOptions,
                day,
                value,
            };
            await this.registerDay(successOptions);
        }
    }
    validateMultiRegister(days, values, activityName) {
        if (days.length !== values.length) {
            throw new Error((0, common_tags_1.oneLine) `You are uploading for ${days.length} days but only
        ${values.length} ${activityName} are given.`);
        }
    }
    confirmation(text) {
        return new ButtonHandler_1.ButtonConfirmation(this.msg, text).confirm();
    }
    async handleUploadRemove() {
        const day = await this.prompt.ask('What day would you like to remove a workout on?');
        // What kind of workout do you want to remove from this day?
        const entries = await (0, monthlyChallenge_1.getDayEntries)(this.msg.author.id, this.challenge.ID);
        const dayEntry = entries.filter(entry => entry.Day == parseInt(day));
        if (!dayEntry.length) {
            this.msg.channel.send((0, common_tags_1.oneLine) `You have no workouts on ${(0, utils_1.bold)(day + " " + this.date.toFormat("MMMM"))}`);
        }
        else {
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, (0, common_tags_1.oneLine) `What kind of workout do you want to remove from this day?`);
            dayEntry.map((entry, i) => {
                menu.addButton(utils_1.NUMBER_BUTTONS[i], entry.ValueType, async () => {
                    await (0, monthlyChallenge_1.deleteDayEntry)(this.msg.author.id, entry.Day, this.challenge.ID, entry.ValueType);
                    await this.msg.channel.send((0, common_tags_1.oneLine) `Your ${(0, utils_1.bold)(entry.ValueType)} workout has been removed from day ${(0, utils_1.bold)(day + " " + this.date.toFormat("MMMM"))}.Your previous gained points for this workout have been removed.`);
                });
            });
            menu.addCloseButton();
            await menu.run();
        }
    }
    async handleBonusChallenges() {
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, (0, common_tags_1.oneLine) `There are multiple bonus challenges every month. Click on one to
      get more details or if you want to upload a bonus challenge.`);
        menu.addButton(utils_1.NUMBER_BUTTONS[1], "Get a 5 point weekstreak", () => {
            this.msg.channel.send((0, common_tags_1.oneLine) `You can obtain 10 additional monthly points (and 20 permanent
        XP) every week by earning 5 points daily Monday to Sunday. The bot will
        let you know when you have earned this bonus and will add the points
        automatically!`);
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[2], "Get 10 walks over 5km/3,1mi", async () => {
            await this.handleBonusWalkAndCycle("walking");
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[3], "Get 10 cycling sessions over 15km/9,32mi", async () => {
            await this.handleBonusWalkAndCycle("cycling");
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[4], "Read an educational book", async () => {
            await this.handleBook();
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[5], "Food diary", async () => {
            await this.handleFoodDiary();
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[6], "Set a monthly personal goal", async () => {
            const goals = await (0, goals_1.getAllGoals)(this.msg.author.id);
            const unfinishedGoal = goals.find(goal => !goal.Finished);
            if ((this.date.day <= 5 || this.date.day >= 28)) {
                if (unfinishedGoal) {
                    const question = (0, common_tags_1.oneLine) `You are early! Your personal goal is the following:
            \n**${unfinishedGoal.goal}**\n
            You can claim bonus points after the 5th of this month. Or do you want to 
            remove your current personal challenge? 
            `;
                    const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
                    menu.addButton(utils_1.RED_BUTTON, "Remove Challenge", async () => {
                        await (0, goals_1.removeGoal)(unfinishedGoal.ID);
                        await this.msg.channel.send("You removed your personal goal. Rerun $upload to set a new goal!");
                    });
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
                    await this.msg.channel.send("You can only submit a new challenge between the 28th and the 5th of next month");
                }
            }
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[7], "Share a workout selfie", async () => {
            await this.handleWorkoutSelfie();
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[8], "Share a personal photo", async () => {
            await this.handlePersonalPhoto();
        });
        menu.addCloseButton();
        await menu.run();
    }
    async viewPersonalGoal(goal) {
        const question = (0, common_tags_1.oneLine) `You have submitted the following personal goal
     this month: **${goal?.goal}**. Did you complete your personal challenge?
      If you are not going to finish your personal goal you can just leave it here
       and you can pick a new goal next month!`;
        const mainMenu = new ButtonHandler_1.ButtonHandler(this.msg, question);
        mainMenu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
            await this.confirmSummary(goal);
        });
        mainMenu.addCloseButton();
        await mainMenu.run();
    }
    async addPersonalGoal() {
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, (0, common_tags_1.oneLine) `You can pick (until the 5th of the month) 
      a personal goal for this month and share it with others.
       Upon finishing the personal goal you can return to this menu and claim your bonus points
        (25 points) by sharing your experience and
         proving the completing of the goal by screenshots/pictures. Do you want to pick a personal goal now?`);
        menu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
            const prompt = `Please type your personal challenge for the month. Please make it as SMART as possible. Meaning it has to be Specific, Measurable, Attainable, Relevant, Timely. Please answer in 1 message.`;
            const challenge = await this.confirm(prompt, `Your personal challenge is the following: %s, is that right? Please note that this will be shared with the other Titans so they can keep you motivated!`);
            await this.msg.channel.send("Excellent! Your personal goal is registered and you can return here once you have finished it to claim the bonus points! Please note this is only possible after the 5th of the month.");
            await (0, goals_1.registerGoal)({ $userID: this.msg.author.id, $goal: challenge });
            await main_1.client.mainTextChannel.send(`<@${this.msg.author.id}> has submitted a new personal goal for this month!\n${(0, utils_1.bold)(challenge)}`);
        });
        menu.addCloseButton();
        await menu.run();
    }
    async handlePersonalPhoto() {
        const challengeName = "personalphoto";
        const activity = "share a personal photo";
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, (0, common_tags_1.oneLine) `You can earn 5 points for sharing a personal photo with text.
      These points can be earned once a month. You can share a photo of
      yourself, with your friends, with your pet or family. Do you want to share
      a personal photo now?`);
        menu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
            const image = await this.getProof(1, activity, this.date.day, "Please upload your personal photo now.");
            const title = (0, common_tags_1.oneLine) `Please write text to be posted with your personal photo, please
        write it in 1 message.`;
            const confirmation = await this.confirm(title, (0, common_tags_1.oneLine) `Your text with your personal photo is the following:%s, this will be shared with your photo. Is this
        correct?`);
            if (confirmation) {
                await this.registerDay({
                    value: 1,
                    challengeName,
                    activityName: activity,
                    day: this.date.day,
                    replaceOnly: true
                });
                main_1.client.mainTextChannel.send((0, common_tags_1.oneLine) `<@${this.msg.author.id}> has uploaded a personal photo!
          ${(0, utils_1.bold)(confirmation)} `, {
                    files: image ? [image] : []
                });
            }
        });
        menu.addCloseButton();
        await menu.run();
    }
    async handleWorkoutSelfie() {
        const challengeName = "workoutselfie";
        const activity = "share a workout selfie";
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, (0, common_tags_1.oneLine) `You can earn 5 points for sharing a workout selfie (or post
      workout). These points can be earned 4 times a month. Do you want to
      share a workout selfie now?`);
        menu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
            const image = await this.getProof(1, activity, this.date.day, "Please upload your workout selfie now.");
            const title = (0, common_tags_1.oneLine) `Please give a title or text to your workout selfie, please write
        it in 1 message.`;
            const confirmation = await this.confirm(title, (0, common_tags_1.oneLine) `Your title/text with your workout selfie is the following:%s, this will be shared with your workout selfie. Is
        this correct?`);
            if (confirmation) {
                await this.registerDay({
                    value: 1,
                    challengeName,
                    activityName: activity,
                    day: this.date.day,
                    replaceOnly: true
                });
                main_1.client.mainTextChannel.send((0, common_tags_1.oneLine) `<@${this.msg.author.id}> has uploaded a workoutselfie with the following text: 
          ${(0, utils_1.bold)(confirmation)}`, { files: image ? [image] : [] });
            }
        });
        menu.addCloseButton();
        await menu.run();
    }
    async handleFoodDiary() {
        const challengeName = "diary";
        const activity = "food diary logging";
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, (0, common_tags_1.oneLine) `You can earn 10 points for counting your food and calories for at
      least 5 days in 1 week (Monday to Sunday). These points can be earned
      every week. Do you want to upload a week of food logging now?`);
        menu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
            const day = parseInt(await this.prompt.ask((0, common_tags_1.oneLine) `Please write the day of the month of the last food logging that
        you did to complete this challenge.`));
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
    async handleBook() {
        const challengeName = "readabook";
        const books = await (0, book_1.getAllBooks)(this.msg.author.id);
        // finds unfinished book
        const book = books.find((x) => !x.Finished);
        if (book) {
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, `Did you finish reading ${(0, utils_1.bold)(book.Name)}?`);
            // eslint-disable-next-line
            menu.addButton(utils_1.BLUE_BUTTON, "Continue reading", () => { });
            menu.addButton(utils_1.RED_BUTTON, "I finished my book", async () => {
                const evaluation = (0, common_tags_1.oneLine) `Excellent! Please share us your thoughts in one message. Did
            you learn something? What was it about? Let others know if the book
            is worth to pick up or not!`;
                const confirmation = await this.confirm(evaluation, (0, common_tags_1.oneLine) `The following message will be shared with the other Titans:
            %s. Is the text correct?`);
                if (confirmation) {
                    await this.registerDay({
                        value: 1,
                        activityName: "book",
                        challengeName,
                        day: this.date.day,
                    });
                    await (0, book_1.finishBook)(book.ID, confirmation);
                    main_1.client.mainTextChannel.send((0, common_tags_1.oneLine) `<@${this.msg.author.id}> has finished the book
              ${(0, utils_1.bold)(book.Name)}! The evaluation is the following:
              ${(0, utils_1.bold)(confirmation)}.  Hopefully this also helps you to consider
              picking the book up or not!`);
                }
            });
            menu.addButton(utils_1.WHITE_BUTTON, "I want to remove my current book", async () => {
                const confirmation = await this.confirmation((0, common_tags_1.oneLine) `You are about to remove your current book
              ${(0, utils_1.bold)(book.Name)}, are you sure?`);
                if (confirmation) {
                    await (0, book_1.removeBook)(book.ID);
                    this.msg.channel.send((0, common_tags_1.oneLine) `You have removed ${(0, utils_1.bold)(book.Name)} from the read a
                book challenge!`);
                }
            });
            await menu.run();
            return;
        }
        else {
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, (0, common_tags_1.oneLine) `You can pick an educational book to read and share it with others.
      The goal generally is to finish the book within a month, but you are
      allowed to read it over a longer period. Upon finishing the book you can
      return to this menu and claim your 25 bonus points by sharing your
      experience with reading the book. You can claim read a book bonus points
      once a month.`);
            menu.addButton(utils_1.BLUE_BUTTON, "register book", async () => {
                const bookName = `Please type the name of the book you are going to read`;
                const bookNameConfirmation = await this.confirm(bookName, `Ah, I see you are reading %s! Is that correct?`);
                if (!bookNameConfirmation) {
                    throw new Error("cancelled book name");
                }
                const bookLesson = (0, common_tags_1.oneLine) `What do you expect to learn about in this book? Please answer in
        1 message. Please note that this will be shared with the other Titans so
        they can also learn from your book choice!`;
                const bookLessonConfirmation = await this.confirm(bookLesson, `You expect to learn the following: %s, is that correct?`);
                if (!bookLessonConfirmation) {
                    throw new Error("cancelled book lesson");
                }
                const confirmMenu = new ButtonHandler_1.ButtonHandler(this.msg, `Do you want to add a picture/screenshot/photo of your book?`);
                let image;
                confirmMenu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
                    image = await this.getProof(1, challengeName, this.date.day, "Please upload 1 picture of your book in the chat");
                });
                confirmMenu.addButton(utils_1.RED_BUTTON, "no", async () => {
                });
                await confirmMenu.run();
                await (0, book_1.registerBook)({
                    $userID: this.msg.author.id,
                    $challengeID: this.challenge.ID,
                    $day: this.date.day,
                    $name: bookNameConfirmation,
                    $lesson: bookLessonConfirmation,
                });
                const succesMessage = (0, common_tags_1.oneLine) `Excellent! Your book is registered and you
        can return here once you have finished it to claim the bonus points!`;
                const announcementMessage = (0, common_tags_1.oneLine) `<@${this.msg.author.id}> has submitted a new educational book to read.
       The book is called: ${(0, utils_1.bold)(bookNameConfirmation)} and ${this.msg.author.username} expects to learn the following: ${(0, utils_1.bold)(bookLessonConfirmation)}`;
                if (main_1.client.isDev) {
                    await this.msg.channel.send(succesMessage, { files: image ? [image] : [] });
                }
                else {
                    await this.msg.channel.send(succesMessage);
                    await main_1.client.mainTextChannel.send(announcementMessage, { files: image ? [image] : [] });
                }
            });
            menu.addCloseButton();
            await menu.run();
        }
    }
    async handleBonusWalkAndCycle(activity) {
        const conversionRate = activity == "walking" ? "5km/3,1mi" : "15km/9,32mi";
        const challengeName = activity == "walking"
            ? "get10walks"
            : "get10cycling";
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, (0, common_tags_1.oneLine) `You can earn 25 points for completing 10 ${activity} sessions over
      ${conversionRate} this month. Do you want to upload 10 ${activity} session
      now?`);
        menu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
            const day = parseInt(await this.prompt.ask((0, common_tags_1.oneLine) `Please write the day of the month of the last ${activity}
        session that you did to complete this challenge.`));
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
    async handleOtherCardio() {
        const challengeName = "othercardio";
        const question = (0, common_tags_1.oneLine) `You can earn 0,2 points for every minute of other
    cardio. Only cardio with average heartrate of 125+ can be uploaded. The
    cardio should not fit other categories or already award steps in a
    reasonable way (running is already awarded by steps).`;
        const activityName = " minutes other cardio";
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
        menu.addButton(utils_1.BLUE_BUTTON, "single", async () => {
            const answer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write the day of the month you want to upload other
        cardio for.`);
            const month = this.month;
            const day = parseInt(answer);
            this.validateDay(day);
            const minutes = parseInt(await this.prompt.ask((0, common_tags_1.oneLine) `Please write how many full minutes of other cardio (no decimals)
        you want to upload for **${month} ${day}.**`));
            this.validateNumber(minutes);
            await this.getProof(minutes, activityName, day, (0, common_tags_1.oneLine) `Please upload a single screenshot of your wearable showing ${(0, utils_1.bold)(minutes)} minutes of other cardio with average heartrate above 125+ on
        ${(0, utils_1.bold)(month)} ${(0, utils_1.bold)(day)}.`);
            await this.registerDay({
                value: minutes,
                activityName,
                challengeName: challengeName,
                day,
            });
        });
        menu.addButton(utils_1.RED_BUTTON, "multiple", async () => {
            const answer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write the days of the month you want to upload other
        cardio for and seperate them with a space (example: 1 2 3 4 ….)`);
            const days = (0, utils_1.split)(answer).map((x) => parseInt(x));
            this.validateDays(days);
            const minutesAnswer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write how many full minutes of other cardio (no decimals)
        you want to upload for days ${(0, utils_1.bold)(days.join(", "))} in the right order,
        please seperate them with a space \`(example: 60 90 42 30 …)\``);
            const sessions = (0, utils_1.split)(minutesAnswer).map((x) => parseInt(x));
            this.validateMultiRegister(days, sessions, activityName);
            const sentence = `Please upload one or more screenshots of your wearable showing the right amount of other cardio minutes for these days of the month. Remember that the average heartrate should be 125+. When done, please write 'done' in the channel.`;
            await this.getMultiProof(activityName, sentence);
            await this.registerDays(days, sessions, {
                challengeName: "othercardio",
                activityName,
            });
        });
        menu.addCloseButton();
        await menu.run();
    }
    async handleRowing() {
        const question = (0, common_tags_1.oneLine) `You can earn 1 point for every 1km or 0,62mi rowed.
      Do you want to upload a single day or multiple days?`;
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
        let unit = "km";
        let challengeName = "rowingkm";
        const activityName = ` ${unit} rowed`;
        menu.addButton(utils_1.BLUE_BUTTON, "single", async () => {
            const question = "Do you want to upload rowing distance in km or mi?";
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
            menu.addButton(utils_1.BLUE_BUTTON, "km", () => {
                challengeName = "rowingkm";
                unit = "km";
            });
            menu.addButton(utils_1.RED_BUTTON, "mi", () => {
                challengeName = "rowingmi";
                unit = "mi";
            });
            menu.addCloseButton();
            await menu.run();
            const day = parseInt(await this.prompt.ask((0, common_tags_1.oneLine) `Please write the day of the month you want to upload rowing
        (${unit}) for.`));
            const month = this.month;
            this.validateDay(day);
            const distance = (0, utils_1.parseDecimal)(await this.prompt.ask((0, common_tags_1.oneLine) `Please write the distance (${unit}) you have rowed on
        ${(0, utils_1.bold)(day)} ${(0, utils_1.bold)(month)}`));
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
        menu.addButton(utils_1.RED_BUTTON, "multiple", async () => {
            const question = "Do you want to upload rowing distance in km or mi?";
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
            menu.addButton(utils_1.BLUE_BUTTON, "km", () => {
                challengeName = "rowingkm";
                unit = "km";
            });
            menu.addButton(utils_1.RED_BUTTON, "mi", () => {
                challengeName = "rowingmi";
                unit = "mi";
            });
            menu.addCloseButton();
            await menu.run();
            const answer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write the days of the month you want to rowing ${unit}
        steps for and seperate them with a space \`(example: 1 2 3 4 ….)\``);
            const days = (0, utils_1.split)(answer).map((x) => (0, utils_1.parseDecimal)(x));
            this.validateDays(days);
            const rowsRespond = await this.prompt.ask((0, common_tags_1.oneLine) `Please write how many rowing ${unit} you want to upload for days
        ${days.join(" ")} in the right order, please seperate them with a space
        \`(example: 5,27 20,54 7,25 8,55 …)\``);
            const rows = (0, utils_1.split)(rowsRespond).map((x) => (0, utils_1.parseDecimal)(x));
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
    async handleYogaAndMeditation(activity) {
        const id = this.challenge.ID;
        const yoga10points = this.convertTable.get(`yoga10-${id}`);
        const yoga30points = this.convertTable.get(`yoga30-${id}`);
        const meditation10points = this.convertTable.get(`meditation10-${id}`);
        const meditation30points = this.convertTable.get(`meditation30-${id}`);
        const [session10points, session30points] = activity === "yoga"
            ? [yoga10points, yoga30points]
            : [meditation10points, meditation30points];
        const question = (0, common_tags_1.oneLine) `You can earn ${session10points} points for
    ${activity} over 10 minutes. You can earn ${session30points} points for
    ${activity} over 30 minutes. Do you want to upload a single day or multiple
    days?`;
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
        menu.addButton(utils_1.BLUE_BUTTON, "single", async () => {
            const answer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write the day of the month you want to upload a
        ${activity} session for.`);
            const month = this.month;
            const day = parseInt(answer);
            let session = 10;
            this.validateDay(day);
            const sessionQuestion = "Was your session over 10 minutes or 30 minutes?";
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, sessionQuestion);
            menu.addButton(utils_1.BLUE_BUTTON, "10 minutes", () => {
                session = 10;
            });
            menu.addButton(utils_1.RED_BUTTON, "30 minutes", () => {
                session = 30;
            });
            menu.addCloseButton();
            await menu.run();
            const challengeName = `${activity}${session}`;
            await this.getProof(1, `${activity} session`, day, (0, common_tags_1.oneLine) `Please upload a single screenshot of your wearable showing the
        date, duration of workout and heartrate. Alternatively, a photo of the
        ${activity} spot with mentioned elapsed time and/or additional
        information can be accepted.`);
            const options = {
                value: 1,
                challengeName: challengeName,
                activityName: `${session} minutes ${activity} session`,
                day,
            };
            const dayEntries = await (0, monthlyChallenge_1.getDayEntries)(this.msg.author.id, this.challenge.ID);
            const dayEntry = dayEntries.filter((x) => x.Day === day);
            const activityEntry = dayEntry.find((x) => x.ValueType.includes(activity));
            if (activityEntry) {
                const valueType = activityEntry.ValueType;
                const amount = valueType.includes("10") ? "10min+" : "30min+";
                const question = (0, common_tags_1.oneLine) `You already registered ${amount} ${activity} session on
          ${(0, utils_1.bold)(month)} ${(0, utils_1.bold)(day)}. Do you want to replace points on this
          day?`;
                const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
                menu.addButton(utils_1.BLUE_BUTTON, "replace", async () => {
                    await (0, monthlyChallenge_1.deleteDayEntry)(this.msg.author.id, options.day, this.challenge.ID, activityEntry.ValueType);
                    await (0, monthlyChallenge_1.registerDayEntry)(this.msg.author.id, options.day, this.challenge.ID, options.challengeName, 1);
                    this.msg.channel.send(`Successfully replaced`);
                    this.showReplaceMessage(options);
                });
                menu.addCloseButton();
                await menu.run();
            }
            else {
                await this.registerDay(options);
            }
        });
        menu.addButton(utils_1.RED_BUTTON, "multiple", async () => {
            const answer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write the days of the month you want to upload
        yoga/meditation sessions for and seperate them with a space (example: 1
        2 3 4 ….)`);
            const month = this.month;
            const days = (0, utils_1.split)(answer).map((x) => parseInt(x));
            this.validateDays(days);
            const sessionAnswer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write from left to right if the session was over 10
        minutes or 30 minutes for every day and seperate them with a space
        (example: 10 30 10 30 …)`);
            const sessions = (0, utils_1.split)(sessionAnswer).map((x) => parseInt(x));
            this.validateMultiRegister(days, sessions, `${activity} session`);
            for (const session of sessions) {
                if (session !== 30 && session !== 10) {
                    throw new Error("only `30` or `10` session is allowed");
                }
            }
            await this.getMultiProof(`${activity} session`);
            for (let i = 0; i < days.length; i++) {
                const day = days[i];
                const session = sessions[i];
                const challengeName = `${activity}${session}`;
                const options = {
                    value: 1,
                    challengeName: challengeName,
                    activityName: `${session}min+ ${activity} session`,
                    day,
                };
                const dayEntries = await (0, monthlyChallenge_1.getDayEntries)(this.msg.author.id, this.challenge.ID);
                const dayEntry = dayEntries.filter((x) => x.Day === day);
                const activityEntry = dayEntry.find((x) => x.ValueType.includes(activity));
                if (activityEntry) {
                    const valueType = activityEntry.ValueType;
                    const amount = valueType.includes("10") ? "10min+" : "30min+";
                    const question = (0, common_tags_1.oneLine) `You already registered ${amount} ${activity} session on
            ${(0, utils_1.bold)(month)} ${(0, utils_1.bold)(day)}. Do you want to replace points on this
            day?`;
                    const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
                    menu.addButton(utils_1.BLUE_BUTTON, "replace", async () => {
                        await (0, monthlyChallenge_1.deleteDayEntry)(this.msg.author.id, options.day, this.challenge.ID, activityEntry.ValueType);
                        await (0, monthlyChallenge_1.registerDayEntry)(this.msg.author.id, options.day, this.challenge.ID, options.challengeName, 1);
                        this.msg.channel.send(`Successfully replaced`);
                        this.showReplaceMessage(options);
                    });
                    menu.addCloseButton();
                    await menu.run();
                }
                else {
                    await this.registerDay(options);
                }
            }
        });
        menu.addCloseButton();
        await menu.run();
    }
    async handleStrength() {
        const challengeName = "strength";
        const question = (0, common_tags_1.oneLine) `You can earn 12 point for 1 strength training over 30 minutes. You
      can upload 1 strength training every day. Do you want to upload a single
      day or multiple days?`;
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
        const activityName = "strength training";
        menu.addButton(utils_1.BLUE_BUTTON, "single", async () => {
            const answer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write the day of the month you want to upload a strength
        training for.`);
            const day = parseInt(answer);
            const count = 1;
            this.validateDay(day);
            await this.getProof(count, activityName, day, (0, common_tags_1.oneLine) `Please upload a single screenshot of your wearable showing the
        date, duration of workout and heartrate.`);
            await this.registerDay({
                value: count,
                challengeName: challengeName,
                activityName: activityName,
                day,
                replaceOnly: true,
            });
        });
        menu.addButton(utils_1.RED_BUTTON, "multiple", async () => {
            const answer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write the days of the month you want to upload strength
        training for and seperate them with a space \`(example: 1 2 3 4 ….)\``);
            const days = (0, utils_1.split)(answer).map((x) => parseInt(x));
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
    async handleSteps() {
        const question = (0, common_tags_1.oneLine) `You can earn 1 point for every 1000 steps taken. Do you want to
      upload a single day or multiple days?`;
        const challengeName = "steps";
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
        const activityName = "steps";
        menu.addButton(utils_1.BLUE_BUTTON, "single", async () => {
            const answer = await this.prompt.ask("Please write the day of the month you want to upload steps for.");
            const month = this.month;
            const day = parseInt(answer);
            this.validateDay(day);
            const stepsRespond = await this.prompt.ask((0, common_tags_1.oneLine) `Please write how many steps you want to upload for
        ${(0, utils_1.bold)(month)} ${(0, utils_1.bold)(day)}.`);
            const steps = parseInt(stepsRespond);
            if (Number.isNaN(steps)) {
                throw new Error(`Please only write the number of steps without any text.`);
            }
            else if (steps > 250000) {
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
        menu.addButton(utils_1.RED_BUTTON, "multiple", async () => {
            const answer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write the days of the month you want to upload steps for
        and seperate them with a space \`(example: 1 2 3 4 ….)\``);
            const days = (0, utils_1.split)(answer).map((x) => parseInt(x));
            this.validateDays(days);
            const stepsResponds = await this.prompt.ask((0, common_tags_1.oneLine) `Please write how many steps you want to upload for days
        ${days.join(" ")} in the right order, please seperate them with a space
        \`(example: 1456 2583 2847 8582 …)\``);
            const allSteps = (0, utils_1.split)(stepsResponds).map((x) => parseInt(x));
            this.validateMultiRegister(days, allSteps, "steps");
            for (const steps of allSteps) {
                if (Number.isNaN(steps)) {
                    throw new Error(`invalid format "${steps}"`);
                }
                else if (steps > 250000) {
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
    async handleCycling() {
        let challengeName = "cyclingkm";
        let unit = "km";
        const question = (0, common_tags_1.oneLine) `You can earn 1 point for every 2km or 1,24mi cycled. Do you want
      to upload a single day or multiple days?`;
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
        const activityName = `${unit} cycled`;
        menu.addButton(utils_1.BLUE_BUTTON, "single", async () => {
            const question = "Do you want to upload cycling distance in km or mi?";
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
            menu.addButton(utils_1.BLUE_BUTTON, "km", () => {
                challengeName = "cyclingkm";
                unit = "km";
            });
            menu.addButton(utils_1.RED_BUTTON, "mi", () => {
                challengeName = "cyclingmi";
                unit = "mi";
            });
            menu.addCloseButton();
            await menu.run();
            const day = parseInt(await this.prompt.ask((0, common_tags_1.oneLine) `Please write the day of the month you want to upload cycling
        (${unit}) for.`));
            const month = this.month;
            this.validateDay(day);
            const distance = (0, utils_1.parseDecimal)(await this.prompt.ask((0, common_tags_1.oneLine) `Please write the distance (${unit}) you have cycled on
        ${(0, utils_1.bold)(day)} ${(0, utils_1.bold)(month)}`));
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
        menu.addButton(utils_1.RED_BUTTON, "multiple", async () => {
            const question = "Do you want to upload cycling distance in km or mi?";
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
            menu.addButton(utils_1.BLUE_BUTTON, "km", () => {
                challengeName = "cyclingkm";
                unit = "km";
            });
            menu.addButton(utils_1.RED_BUTTON, "mi", () => {
                challengeName = "cyclingmi";
                unit = "mi";
            });
            menu.addCloseButton();
            await menu.run();
            const answer = await this.prompt.ask((0, common_tags_1.oneLine) `Please write the days of the month you want to upload cycling
        (${unit}) for and seperate them with a space \`(example: 1 2 3 4 ….)\``);
            const days = (0, utils_1.split)(answer).map((x) => parseInt(x));
            this.validateDays(days);
            const cyclingResponds = await this.prompt.ask((0, common_tags_1.oneLine) `Please write how many cycling (${(0, utils_1.bold)(unit)}) you want to upload
        for days ${days.join(" ")} in the right order, please seperate them with
        a space \`(example: 5,27 20,54 7,25 8,55 …)\``);
            const allCycling = (0, utils_1.split)(cyclingResponds).map((x) => (0, utils_1.parseDecimal)(x));
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
    async confirm(prompt, confirmation_msg) {
        const promise = new Promise(async (resolve, reject) => {
            const answer = await this.prompt.ask(prompt);
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, confirmation_msg.replace('%s', (0, utils_1.bold)(answer)));
            menu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
                resolve(answer);
            });
            menu.addButton(utils_1.RED_BUTTON, "no", async () => {
                resolve(this.confirm(prompt, confirmation_msg));
            });
            menu.addCloseButton();
            await menu.run();
        });
        return promise;
    }
    async confirmSummary(goal) {
        const reply = (0, common_tags_1.oneLine) `Excellent! Please share us your summary of achieving the personal goal in one message. Let us know how it went!`;
        const confirmation_msg = (0, common_tags_1.oneLine) `The following message will be shared with the other Titans: %s Is that correct?`;
        const summary = await this.confirm(reply, confirmation_msg);
        const images = await this.getMultiProof("personal goal");
        await (0, goals_1.finishGoal)(goal.ID);
        await this.registerDay({
            value: 1,
            challengeName: "personalgoal",
            activityName: goal.goal,
            day: this.date.day,
            replaceOnly: true
        });
        await main_1.client.mainTextChannel.send(`<@${this.msg.author.id}> has finished his or her personal goal! ${(0, utils_1.bold)(goal.goal)}`);
        await Promise.all(images.map(async (image) => {
            return main_1.client.mainTextChannel.send('', { files: [image] });
        }));
        await main_1.client.mainTextChannel.send(`Summary: ${(0, utils_1.bold)(summary)}`);
    }
}
exports.default = Upload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL1VwbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG1FQUEyQztBQUUzQyxnREFBa0U7QUFDbEUsOENBVzRCO0FBQzVCLDhEQUErRTtBQUMvRSw2Q0FBc0M7QUFDdEMsa0NBQWlDO0FBQ2pDLDZEQVdnQztBQUNoQyxpQ0FBaUM7QUFDakMscUNBQStFO0FBQy9FLHVDQUFzRjtBQVV0RixNQUFxQixNQUFPLFNBQVEsaUJBQU87SUFBM0M7O1FBQ0UsU0FBSSxHQUFHLFFBQVEsQ0FBQztRQUNoQixZQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQXlpRG5CLENBQUM7SUFoaURDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBWSxFQUFFLElBQWM7UUFDckMsTUFBTSxTQUFTLEdBQUcsYUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQ3ZFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLElBQUEsMENBQXVCLEVBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1RSxJQUFJLENBQUMsWUFBWSxHQUFHLE1BQU0sSUFBQSxrQ0FBZSxHQUFFLENBQUM7UUFFNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDbkIsT0FBTyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUMxQztRQUVELElBQUksQ0FBQyxJQUFJLEdBQUcsZ0JBQVEsQ0FB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