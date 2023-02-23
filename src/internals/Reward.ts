import { Item } from "./Item";
import { List } from "./List";
import { RewardDB } from '../db/reward';
import { MessageEmbed } from "discord.js";
import { BROWN } from "./utils";

export interface BossReward {
    name: string,
    boss: string,
    id: string
}

export abstract class Reward extends Item {

    abstract name: string;
    abstract boss: string;

    static get all() {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return List.from([
            new SmallRat(),
            new MediumRat(),
            new GiantRat(),
            new YoungGiant(),
            new MediumGiant(),
            new AdultGiant(),
            new SmallWerewolf(),
            new MatureWerewolf(),
            new BerserkerWerewolf(),
            new SmallCerberus(),
            new MediumCerberus(),
            new AdultCerberus(),
            new SmallHarpy(),
            new MediumHarpy(),
            new AngryHarpy(),
            new Medusa(),
            new Siren()
        ]);
    }



    show(count: number): MessageEmbed {
        const embed = new MessageEmbed()
            .setColor(BROWN)
            .setTitle(this.name)

        return embed;
    }


    static fromID(id: string) {
        return Reward.all.get(id)!;
    }



    static fromDB(reward: RewardDB): BossReward {
        const r = Reward.fromID(reward.ItemID.toString())!;
        return r;
    }

    get id() {
        return `reward_${this.name}`;
    }


}





export class SmallRat extends Reward {


    public boss = 'Small Rat'
    public name = this.boss + ' Emblem';



}

export class MediumRat extends Reward {

    boss = 'Medium Rat'
    name = this.boss + ' Emblem';

}


export class GiantRat extends Reward {


    boss = 'Giant Rat'
    name = this.boss + ' Emblem';

}


export class SmallHarpy extends Reward {


    boss = 'Small Harpy'
    name = this.boss + ' Emblem';

}


export class MediumHarpy extends Reward {


    boss = 'Medium Harpy'
    name = this.boss + ' Emblem';

}


export class AngryHarpy extends Reward {


    boss = 'Angry Harpy'
    name = this.boss + ' Emblem';

}


export class SmallWerewolf extends Reward {


    boss = 'Small Werewolf'
    name = this.boss + ' Emblem';

}


export class MatureWerewolf extends Reward {


    boss = 'Mature Werewolf'
    name = this.boss + ' Emblem';

}


export class BerserkerWerewolf extends Reward {


    boss = 'Berserker Werewolf'
    name = this.boss + ' Emblem';

}



export class YoungGiant extends Reward {


    boss = 'Young Giant'
    name = this.boss + ' Emblem';

}


export class MediumGiant extends Reward {


    boss = 'Medium Sized Giant'
    name = this.boss + ' Emblem';

}


export class AdultGiant extends Reward {


    boss = 'Adult Giant'
    name = this.boss + ' Emblem';

}


export class SmallCerberus extends Reward {


    boss = 'Small Cerberus'
    name = this.boss + ' Emblem';

}


export class MediumCerberus extends Reward {


    boss = 'Medium Cerberus'
    name = this.boss + ' Emblem';

}


export class AdultCerberus extends Reward {


    boss = 'Adult Cerberus'
    name = this.boss + ' Emblem';

}


export class Medusa extends Reward {


    boss = 'Medusa'
    name = this.boss + ' Emblem';

}


export class Siren extends Reward {


    boss = 'Siren'
    name = this.boss + ' Emblem';

}

