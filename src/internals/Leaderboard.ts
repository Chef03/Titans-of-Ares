import { Collection, GuildMember, MessageAttachment, Snowflake, TextChannel } from "discord.js";
import { Challenge, ChallengeEntry, DayEntry, getConversionRate } from "../db/monthlyChallenge";
import { loadImage, createCanvas, Canvas, Image } from "canvas";
import { dbAll } from "../db/promiseWrapper";
import { client } from "../main";
import { chunk } from "lodash";

const colors = ["#FF0000", "#8D8000", "#66AA00", "#40D500", "#1AFF00"].reverse()

interface RankedUser extends GuildMember {
    points?: number
}

export class Leaderboard {

    image!: Image;
    challenge!: Challenge;
    channel!: TextChannel;

    public async init(challenge: Challenge): Promise<void> {

        this.challenge = challenge;
        this.channel = await client.bot.channels.fetch(this.challenge.LeaderBoardChannel) as TextChannel;
        this.image = await loadImage("src/assets/template.png");

    }

    private async getMembers() {

        const entries = await this.getEntries()
        const members = await client.mainGuild.members.fetch({ user: entries.keyArray() })
        const rankedMembers: Collection<Snowflake, RankedUser> = members.mapValues(member => {

            const entry = entries.get(member.id)
            const rankedUser: RankedUser = member;
            rankedUser.points = entry;
            return rankedUser;

        })

        return rankedMembers.sort((member1, member2) => member2.points! - member1.points!);

    }

    public async generateImage(): Promise<MessageAttachment[]> {

        const canvases = await this.mapMembers();

        const attachments = canvases!.map((canvas, i) => {

            return new MessageAttachment(canvas.toBuffer(), `page${i + 1}.jpg`);

        })

        return attachments;

    }

    private async getEntries(): Promise<Collection<string, number>> {

        const users: Collection<Snowflake, number> = new Collection();
        const challengeEntries = await dbAll<ChallengeEntry>(`SELECT * FROM ChallengeEntry WHERE ChallengeID=$ChallengeID`, { $ChallengeID: this.challenge.ID })

        await Promise.all(challengeEntries.map(async challengeEntry => {

            const dayEntry = await dbAll<DayEntry>(`SELECT * FROM DayEntry WHERE EntryID=$EntryID`, { $EntryID: challengeEntry.ID })

            await Promise.all(dayEntry.map(async entry => {

                const rate = await getConversionRate(`${entry.ValueType}-${this.challenge.ID}`)
                let previousXP = users.get(challengeEntry.DiscordID) || 0;
                users.set(challengeEntry.DiscordID, previousXP + (entry.Value * rate));

            }))

        }))
        users.forEach((value, key) => users.set(key, Math.floor(value)))
        return users;

    }

    private async mapMembers(): Promise<Canvas[] | undefined> {

        const canvases = [];
        const members: Collection<Snowflake, RankedUser> = await this.getMembers();

        const chunks = chunk(Array.from(members.values()), 6);

        let rank = 1;

        const bronzeRatio = this.challenge.BronzeCutoff / this.challenge.Goal;
        const silverRatio = this.challenge.SilverCutoff / this.challenge.Goal;
        const goldRatio = this.challenge.GoldCutoff / this.challenge.Goal;

        const bronzeX = 5 + (bronzeRatio * this.image.width - 10);
        const silverX = 5 + (silverRatio * this.image.width - 10);
        const goldX = 5 + (goldRatio * this.image.width - 10);

        for (let i = 0; i < chunks.length; i++) {

            let y = 1;
            const canvas = createCanvas(983, 800);
            const ctx = canvas.getContext('2d')
            ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height);

            for (let j = 0; j < chunks[i].length; j++) {

                const member = chunks[i][j];
                ctx.fillStyle = '#ffffff'
                ctx.font = "40px Arial"

                //progress bar
                ctx.fillStyle = colors[Math.min(colors.length - 1, rank - 1)]
                ctx.fillRect(5, 70 * y, (member.points! / this.challenge.Goal) * this.image.width, 55)

                if (member.points! < this.challenge.BronzeCutoff) {

                    //fill bronze
                    ctx.fillStyle = '#CD7F32'
                    ctx.fillRect(bronzeX, 70 * y, 5, 55)

                    //fill silver
                    ctx.fillStyle = '#C0C0C0'
                    ctx.fillRect(silverX, 70 * y, 5, 55)

                    //fill gold
                    ctx.fillStyle = '#FFD700'
                    ctx.fillRect(goldX, 70 * y, 5, 55)

                    ctx.fillStyle = '#ffffff'

                }

                if (member.points! >= this.challenge.BronzeCutoff && member.points! < this.challenge.SilverCutoff) {

                    //fill silver
                    ctx.fillStyle = '#C0C0C0'
                    ctx.fillRect(silverX, 70 * y, 5, 55)

                    //fill gold
                    ctx.fillStyle = '#FFD700'
                    ctx.fillRect(goldX, 70 * y, 5, 55)

                    ctx.fillStyle = '#CD7F32'

                }

                if (member.points! >= this.challenge.SilverCutoff && member.points! < this.challenge.GoldCutoff) {

                    //fill gold
                    ctx.fillStyle = '#FFD700'
                    ctx.fillRect(goldX, 70 * y, 5, 55)

                    ctx.fillStyle = '#C0C0C0'

                }

                if (member.points! >= this.challenge.GoldCutoff) {

                    ctx.fillStyle = '#FFD700'

                }

                ctx.fillText(`${member.user.username} #${rank} - ${member.points} / ${this.challenge.Goal}`, 5, 50 + (j * 130), this.image.width - 200)

                y += 1.85;
                rank++;

            }

            canvases.push(canvas);

        }

        return canvases;

    }



}