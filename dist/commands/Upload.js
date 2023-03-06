"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("../internals/Command"));
const discord_js_1 = require("discord.js");
const Prompt_1 = require("../internals/Prompt");
const utils_1 = require("../internals/utils");
const ButtonHandler_1 = require("../internals/ButtonHandler");
const common_tags_1 = require("common-tags");
const main_1 = require("../main");
const monthlyChallenge_1 = require("../db/monthlyChallenge");
const luxon_1 = require("luxon");
const book_1 = require("../db/book");
const goals_1 = require("../db/goals");
const lodash_groupby_1 = __importDefault(require("lodash.groupby"));
const xpLog_1 = require("../internals/xpLog");
const Player_1 = require("../internals/Player");
const inventory_1 = require("../db/inventory");
const MiningPickReward_1 = require("../internals/MiningPickReward");
const Leaderboard_1 = require("../internals/Leaderboard");
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
        const tokens = this.challenge.Name.split(' ');
        const parsed_string = `${tokens[3] + " " + tokens[4]}`;
        this.date = luxon_1.DateTime.fromFormat(parsed_string, 'LLLL y', { locale: 'en-US' });
        this.maxDay = this.date.daysInMonth;
        this.month = this.date.monthLong;
        this.today = luxon_1.DateTime.now().day;
        const categoryHandler = new Map();
        categoryHandler.set("steps", { handler: () => this.handleSteps() });
        categoryHandler.set("cycling", { handler: () => this.handleCycling() });
        categoryHandler.set("strength", { handler: () => this.handleStrength() });
        categoryHandler.set("yoga", { handler: () => this.handleYogaAndMeditation('yoga') });
        categoryHandler.set("meditation", {
            handler: () => this.handleYogaAndMeditation("meditation")
        });
        categoryHandler.set("rowing", { handler: () => this.handleRowing() });
        categoryHandler.set("other cardio", { handler: () => this.handleOtherCardio() });
        categoryHandler.set("bonus challenges", { handler: () => this.handleBonusChallenges() });
        categoryHandler.set("remove previous upload", { handler: () => this.handleUploadRemove() });
        const question = "Please select a category to upload for points";
        const menu = new ButtonHandler_1.ButtonHandler(msg, question);
        let i = 1;
        for (const [category, { handler }] of categoryHandler) {
            const handleMethod = async () => {
                if (handler) {
                    await handler();
                    const leaderboard = new Leaderboard_1.Leaderboard();
                    await leaderboard.init(this.challenge);
                    const images = await leaderboard.generateImage();
                    await (0, utils_1.nukeChannel)(leaderboard.channel);
                    await Promise.all(images.map((image, i) => {
                        const embed = new discord_js_1.MessageEmbed();
                        embed.attachFiles([image]);
                        embed.setImage(`attachment://page${i + 1}.jpg`);
                        return leaderboard.channel.send(embed);
                    }));
                }
            };
            menu.addButton(utils_1.NUMBER_BUTTONS[i], category, handleMethod);
            i++;
        }
        menu.addCloseButton();
        try {
            await menu.run();
            msg.channel.send((0, common_tags_1.oneLine) `For a total overview of your uploads this month, use
        \`${main_1.client.prefix}progress\`.`);
        }
        catch (err) {
            console.error(err);
            msg.channel.send(err.message);
            msg.channel.send(`Upload process failed. Please rerun \`${main_1.client.prefix}${this.name}\``);
        }
    }
    getConversionRate(challengeName, challengeID = this.challenge.ID) {
        const lookupID = `${challengeName}-${challengeID}`;
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
    async showSuccessMessage(data) {
        const conversionRate = this.getConversionRate(data.challengeName);
        const points = Math.round(conversionRate * data.value);
        const xp = (0, utils_1.getXp)(points);
        let amount = '';
        if (data.challengeName == "yoga10" || data.challengeName == "yoga30" || data.challengeName == "meditation10" || data.challengeName == "meditation30"
            || data.challengeName == "get10walks" || data.challengeName == "get10cycling") {
            if (data.value === 1) {
                amount = "a";
            }
        }
        else {
            amount = data.value;
        }
        const text = (0, common_tags_1.oneLine) `You have registered ${(0, utils_1.bold)(amount)} ${data.activityName} on
      ${(0, utils_1.bold)(this.month)} ${(0, utils_1.bold)(data.day)} and earned ${(0, utils_1.bold)(points)} monthly
      points + ${(0, utils_1.bold)(xp)} permanent XP!`;
        await this.msg.channel.send(text);
        await this.weekstreakCheck(data.day);
        await (0, xpLog_1.xpLog)(this.msg, `Registered Day: ${data.day} Progress: ${data.value} ${data.challengeName}`);
    }
    async weekstreakCheck(monthDay) {
        const currentDate = luxon_1.DateTime.fromObject({ year: this.date.year, month: this.date.month, day: monthDay });
        let nextSundayIsNextMonth = false;
        const todayIndex = currentDate.weekday - 1; //make monday start at 0
        let previousMonday = currentDate.minus({ days: todayIndex }); // correct
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
        let currentWeek = [];
        if (nextSunday.month == currentDate.month && previousMonday.month == currentDate.month) {
            let entries = await (0, monthlyChallenge_1.getDayEntries)(this.msg.author.id, this.challenge.ID);
            entries = entries.map(entry => ({ ...entry, challengeID: this.challenge.ID }));
            const dayEntries = Object.entries((0, lodash_groupby_1.default)(entries, (x) => x.Day));
            const filtered_entries = dayEntries.filter(([day, data]) => parseInt(day) >= previousMonday.day && parseInt(day) <= nextSunday.day);
            currentWeek = filtered_entries;
        }
        if (previousMonday.month != currentDate.month) {
            //old month entries
            let priorEntries = await (0, monthlyChallenge_1.getDayEntries)(this.msg.author.id, this.challenge.ID - 1);
            priorEntries = priorEntries.map(entry => ({ ...entry, challengeID: this.challenge.ID - 1 }));
            const parsedPriorEntries = Object.entries((0, lodash_groupby_1.default)(priorEntries, (x) => x.Day));
            const filtered_prior = parsedPriorEntries.filter(([day, data]) => parseInt(day) >= previousMonday.day && parseInt(day) <= previousMonday.daysInMonth);
            // new month entries
            let entries = await (0, monthlyChallenge_1.getDayEntries)(this.msg.author.id, this.challenge.ID);
            entries = entries.map(entry => ({ ...entry, challengeID: this.challenge.ID }));
            const dayEntries = Object.entries((0, lodash_groupby_1.default)(entries, (x) => x.Day));
            const filtered_entries = dayEntries.filter(([day, data]) => parseInt(day) >= 1 && parseInt(day) <= nextSunday.day);
            currentWeek = [...filtered_prior, ...filtered_entries];
            ;
        }
        if (nextSunday.month != currentDate.month) {
            //this month entries
            let priorEntries = await (0, monthlyChallenge_1.getDayEntries)(this.msg.author.id, this.challenge.ID);
            priorEntries = priorEntries.map(entry => ({ ...entry, challengeID: this.challenge.ID }));
            const parsedPriorEntries = Object.entries((0, lodash_groupby_1.default)(priorEntries, (x) => x.Day));
            const filtered_prior = parsedPriorEntries.filter(([day, data]) => parseInt(day) >= previousMonday.day && parseInt(day) <= previousMonday.daysInMonth);
            // next month entries
            let entries = await (0, monthlyChallenge_1.getDayEntries)(this.msg.author.id, this.challenge.ID + 1);
            entries = entries.map(entry => ({ ...entry, challengeID: this.challenge.ID + 1 }));
            const dayEntries = Object.entries((0, lodash_groupby_1.default)(entries, (x) => x.Day));
            const filtered_entries = dayEntries.filter(([day, data]) => parseInt(day) >= 1 && parseInt(day) <= nextSunday.day);
            currentWeek = [...filtered_prior, ...filtered_entries];
            ;
            nextSundayIsNextMonth = true;
        }
        const has_streak = currentWeek.find(([day, data]) => parseInt(day) == nextSunday.day && data.find(entry => entry.ValueType == "weekstreak"));
        if (has_streak)
            return;
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
            });
        });
        if (pointData.size < 7)
            return;
        let isValid = true;
        pointData.forEach((val, key) => {
            if (val < 5) {
                isValid = false;
            }
        });
        if (!isValid)
            return;
        // await addXP(this.msg.author.id, 20);
        // uploading on start of next challenge
        if (nextSundayIsNextMonth) {
            await (0, monthlyChallenge_1.registerDayEntry)(this.msg.author.id, nextSunday.day, this.challenge.ID + 1, 'weekstreak', 1);
        }
        else {
            await (0, monthlyChallenge_1.registerDayEntry)(this.msg.author.id, nextSunday.day, this.challenge.ID, 'weekstreak', 1);
        }
        await this.msg.channel.send(`You have earned a weekstreak bonus for getting **5** points every day of the week! Earned **10** monthly points + **20** permanent XP!`);
        await main_1.client.logChannel.send(`<@${this.msg.member?.id}> has earned a weekstreak bonus for getting **5** points every day of the week! (+20 xp)`);
    }
    async showAddMessage(data) {
        const conversionRate = this.getConversionRate(data.challengeName);
        const points = Math.round(conversionRate * data.value);
        const xp = (0, utils_1.getXp)(points);
        const amount = data.value === 1 ? "a" : data.value;
        const text = (0, common_tags_1.oneLine) `You have registered ${(0, utils_1.bold)(amount)} additional
      ${data.activityName} on ${(0, utils_1.bold)(this.month)} ${(0, utils_1.bold)(data.day)} and earned
      ${(0, utils_1.bold)(points)} monthly points + ${(0, utils_1.bold)(xp)} permanent XP!`;
        await this.msg.channel.send(text);
        await this.weekstreakCheck(data.day);
        await (0, xpLog_1.xpLog)(this.msg, `Registered Day: ${data.day} Progress: ${data.value} ${data.challengeName}`);
    }
    async showReplaceMessage(data, originalValue) {
        const conversionRate = this.getConversionRate(data.challengeName);
        const points = Math.round(conversionRate * data.value);
        const xp = (0, utils_1.getXp)(points);
        const amount = data.value === 1 ? "a" : data.value;
        const difference = data.value - originalValue;
        let xp_warning = '';
        if (difference >= 0) {
            const added_points = Math.round(conversionRate * difference);
            const added_xp = (0, utils_1.getXp)(added_points);
            xp_warning = `and earned additional ${(0, utils_1.bold)(added_points)} monthly
      points + ${(0, utils_1.bold)(added_xp)} permanent XP!`;
        }
        else {
            const removed_points = Math.round(conversionRate * Math.abs(difference));
            const removed_xp = (0, utils_1.getXp)(removed_points);
            xp_warning = `. ${(0, utils_1.bold)(removed_points)} monthly points and ${(0, utils_1.bold)(removed_xp)} permanent XP has been removed.`;
        }
        //You have replaced x steps with x steps and earned x additional points + x permanent XP!
        const text = (0, common_tags_1.oneLine) `You have replaced ${(0, utils_1.bold)(originalValue)} with ${(0, utils_1.bold)(amount)} ${(0, utils_1.bold)(data.activityName)} on
      ${(0, utils_1.bold)(this.month)} ${(0, utils_1.bold)(data.day)} ${xp_warning}`;
        await this.msg.channel.send(text);
        await this.weekstreakCheck(data.day);
        await (0, xpLog_1.xpLog)(this.msg, `Registered Day: ${data.day} Progress: ${data.value - originalValue} ${data.challengeName}`);
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
            if (options.cb) {
                await options.cb();
            }
            await this.showSuccessMessage(options);
        }
        catch (e) {
            console.error(e);
            const { day, activityName, value } = options;
            const err = e;
            const amount = err.dayEntry.Value == 1 ? "a" : err.dayEntry.Value;
            const question = (0, common_tags_1.oneLine) `You already registered ${(0, utils_1.bold)(amount)} ${activityName} on
        ${(0, utils_1.bold)(this.month)} ${(0, utils_1.bold)(day)}. Do you want to
        replace ${options?.replaceOnly ? "" : "or add"}
        points on this day?`;
            const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
            menu.addButton(utils_1.BLUE_BUTTON, "replace", async () => {
                await (0, monthlyChallenge_1.replaceDayEntry)(this.msg.author.id, options.day, this.challenge.ID, options.challengeName, value);
                await this.msg.channel.send(`Successfully replaced`);
                await this.showReplaceMessage(options, err.dayEntry.Value);
            });
            if (!options?.replaceOnly) {
                menu.addButton(utils_1.RED_BUTTON, "add points", async () => {
                    await (0, monthlyChallenge_1.addDayEntry)(this.msg.author.id, options.day, this.challenge.ID, options.challengeName, options.value);
                    this.msg.channel.send(`Successfully added`);
                    await this.showAddMessage(options);
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
        this.validateDay(parseInt(day));
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
                    const player = await Player_1.Player.getPlayer(this.msg.member);
                    const point = entry.Value * this.getConversionRate(entry.ValueType);
                    const xp = Math.round((0, utils_1.getXp)(point));
                    const pickCount = Math.floor(Math.abs(xp) / 10);
                    for (let i = 0; i < pickCount; i++) {
                        await (0, inventory_1.removeInventory)(this.msg.member.id, 'pick_mining');
                        await MiningPickReward_1.MiningPickReward.setUpperLimit(player);
                    }
                    await this.msg.channel.send(`You have lost ${(0, utils_1.bold)(pickCount)} mining picks.`);
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
            await this.handleBonus("get10walks", 1, () => this.handleBonusWalkAndCycle("walking"));
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[3], "Get 10 cycling sessions over 15km/9,32mi", async () => {
            await this.handleBonus("get10cycling", 1, () => this.handleBonusWalkAndCycle("cycling"));
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[4], "Read an educational book", async () => {
            await this.handleBonus("readabook", 1, () => this.handleBook());
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[5], "Food diary", async () => {
            await this.handleBonus("diary", 5, () => this.handleFoodDiary());
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[6], "Set a monthly personal goal", async () => {
            try {
                const goals = await (0, goals_1.getAllGoals)(this.msg.author.id);
                const unfinishedGoal = goals.find(goal => !goal.Finished);
                if ((this.today <= 5 || this.today >= 28)) {
                    if (unfinishedGoal) {
                        const question = (0, common_tags_1.oneLine) `Your personal goal is the following:
            \n**${unfinishedGoal.goal}**\n
            Have you completed your goal? Or do you want to 
            remove your current personal challenge? 
            `;
                        const menu = new ButtonHandler_1.ButtonHandler(this.msg, question);
                        menu.addButton(utils_1.RED_BUTTON, "Remove Challenge", async () => {
                            await (0, goals_1.removeGoal)(unfinishedGoal.ID);
                            await this.msg.channel.send("You removed your personal goal. Rerun $upload to set a new goal!");
                        });
                        await menu.addButton(utils_1.BLUE_BUTTON, "Complete Challenge", async () => {
                            await this.confirmSummary(unfinishedGoal);
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
            }
            catch (e) {
            }
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[7], "Share a workout selfie", async () => {
            await this.handleBonus("workoutselfie", 4, () => this.handleWorkoutSelfie());
        });
        menu.addButton(utils_1.NUMBER_BUTTONS[8], "Share a personal photo", async () => {
            await this.handleBonus("personalphoto", 1, () => this.handlePersonalPhoto());
        });
        menu.addCloseButton();
        try {
            await menu.run();
        }
        catch (e) {
            console.log('error caught: ' + e);
        }
    }
    async handleBonus(type, limit, cb) {
        try {
            const count = await (0, monthlyChallenge_1.getEntryCount)(type, this.msg.author.id);
            if (count >= limit)
                throw new Error(`You can't have more than ${(0, utils_1.bold)(limit)} ${type} per month.`);
            await cb();
        }
        catch (err) {
            console.error(err);
            this.msg.channel.send(err.message);
            this.msg.channel.send(`Upload process failed. Please rerun \`${main_1.client.prefix}${this.name}\``);
        }
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
        try {
            await menu.run();
        }
        catch (e) {
            console.error(e);
        }
    }
    async handlePersonalPhoto() {
        const challengeName = "personalphoto";
        const activity = "share a personal photo";
        const menu = new ButtonHandler_1.ButtonHandler(this.msg, (0, common_tags_1.oneLine) `You can earn 5 points for sharing a personal photo with text.
      These points can be earned once a month. You can share a photo of
      yourself, with your friends, with your pet or family. Do you want to share
      a personal photo now?`);
        menu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
            const image = await this.getProof(1, activity, this.today, "Please upload your personal photo now.");
            const title = (0, common_tags_1.oneLine) `Please write text to be posted with your personal photo, please
        write it in 1 message.`;
            const confirmation = await this.confirm(title, (0, common_tags_1.oneLine) `Your text with your personal photo is the following: %s, this will be shared with your photo. Is this
        correct?`);
            if (confirmation) {
                await this.registerDay({
                    value: 1,
                    challengeName,
                    activityName: activity,
                    day: this.today,
                    replaceOnly: true,
                    cb: () => {
                        main_1.client.mainTextChannel.send((0, common_tags_1.oneLine) `<@${this.msg.author.id}> has uploaded a personal photo!
              ${(0, utils_1.bold)(confirmation)} `, {
                            files: image ? [image] : []
                        });
                    }
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
            const image = await this.getProof(1, activity, this.today, "Please upload your workout selfie now.");
            const title = (0, common_tags_1.oneLine) `Please give a title or text to your workout selfie, please write
        it in 1 message.`;
            const confirmation = await this.confirm(title, (0, common_tags_1.oneLine) `Your title/text with your workout selfie is the following: %s, this will be shared with your workout selfie. Is
        this correct?`);
            if (confirmation) {
                await this.registerDay({
                    value: 1,
                    challengeName,
                    activityName: 'workout selfie',
                    day: this.today,
                    replaceOnly: true,
                    cb: () => {
                        main_1.client.mainTextChannel.send((0, common_tags_1.oneLine) `<@${this.msg.author.id}> has uploaded a workoutselfie with the following text: 
              ${(0, utils_1.bold)(confirmation)}`, { files: image ? [image] : [] });
                    }
                });
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
                        day: this.today,
                        cb: async () => {
                            await (0, book_1.finishBook)(book.ID, confirmation);
                            await main_1.client.mainTextChannel.send((0, common_tags_1.oneLine) `<@${this.msg.author.id}> has finished the book
                  ${(0, utils_1.bold)(book.Name)}! The evaluation is the following:
                  ${(0, utils_1.bold)(confirmation)}.  Hopefully this also helps you to consider
                  picking the book up or not!`);
                            if (book.image) {
                                main_1.client.mainTextChannel.send(book.image);
                            }
                        }
                    });
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
                    image = await this.getProof(1, challengeName, this.today, "Please upload 1 picture of your book in the chat");
                });
                confirmMenu.addButton(utils_1.RED_BUTTON, "no", async () => {
                });
                await confirmMenu.run();
                await (0, book_1.registerBook)({
                    $userID: this.msg.author.id,
                    $challengeID: this.challenge.ID,
                    $day: this.today,
                    $name: bookNameConfirmation,
                    $lesson: bookLessonConfirmation,
                    $image: image ? image.url : ""
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
            try {
                const answer = await this.prompt.ask(prompt);
                const menu = new ButtonHandler_1.ButtonHandler(this.msg, confirmation_msg.replace('%s', (0, utils_1.bold)(answer)));
                menu.addButton(utils_1.BLUE_BUTTON, "yes", async () => {
                    resolve(answer);
                });
                menu.addButton(utils_1.RED_BUTTON, "no", async () => {
                    resolve(this.confirm(prompt, confirmation_msg));
                });
                await menu.run();
            }
            catch (e) {
                reject(e);
            }
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
            activityName: "personalgoal",
            day: this.today,
            replaceOnly: true
        });
        await main_1.client.mainTextChannel.send(`<@${this.msg.author.id}> has finished his or her personal goal! ${(0, utils_1.bold)(goal.goal)}`);
        await Promise.all(images.map(async (image) => {
            return main_1.client.mainTextChannel.send({ files: [image] });
        }));
        await main_1.client.mainTextChannel.send(`Summary: ${(0, utils_1.bold)(summary)}`);
    }
}
exports.default = Upload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVXBsb2FkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbW1hbmRzL1VwbG9hZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG1FQUEyQztBQUMzQywyQ0FBc0U7QUFDdEUsZ0RBQWtFO0FBQ2xFLDhDQVk0QjtBQUM1Qiw4REFBK0U7QUFDL0UsNkNBQXNDO0FBQ3RDLGtDQUFpQztBQUNqQyw2REFhZ0M7QUFDaEMsaUNBQWlDO0FBQ2pDLHFDQUErRTtBQUMvRSx1Q0FBc0Y7QUFDdEYsb0VBQXFDO0FBR3JDLDhDQUEyQztBQUMzQyxnREFBNkM7QUFDN0MsK0NBQWtEO0FBQ2xELG9FQUFpRTtBQUNqRSwwREFBdUQ7QUF3QnZELE1BQXFCLE1BQU8sU0FBUSxpQkFBTztJQUEzQzs7UUFDRSxTQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ2hCLFlBQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBZzJEbkIsQ0FBQztJQXQxREMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFZLEVBQUUsSUFBYztRQUNyQyxNQUFNLFNBQVMsR0FBRyxhQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDdkUsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sSUFBQSwwQ0FBdUIsRUFBQyxTQUFTLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksZUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVFLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxJQUFBLGtDQUFlLEdBQUUsQ0FBQztRQUU1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNu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