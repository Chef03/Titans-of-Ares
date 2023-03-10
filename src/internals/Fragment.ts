import { oneLine } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { removeInventory } from '../db/inventory';
import { addPet, upgradePet } from '../db/pet';
import { Item } from './Item';
import { Dragon, Pet, PetID } from './Pet';
import { Player } from './Player';
import { BROWN, CDN_LINK, GOLD } from './utils';

export type FragmentID = `fragment_${PetID}`;

export class Fragment extends Item {
  pet: Pet;

  price: number;

  private summonGif = `${CDN_LINK}852546444086214676/863007776983613460/giphy_1.gif`;

  private upgradeGif = `${CDN_LINK}852546444086214676/863011578663272448/giphy_5.gif`;

  private convertAnimationGif = `${CDN_LINK}852530378916888626/864407783918403624/ezgif-3-cce177c40b9b.gif`;

  constructor(public id: FragmentID) {
    super();
    const petID = this.id.split('_').slice(1).join('_');
    this.pet = Pet.fromPetID(petID as PetID);
    this.price = this.pet instanceof Dragon ? 45 : 30;
  }

  static fromPetID(petID: PetID) {
    return new Fragment(`fragment_${petID}` as FragmentID);
  }

  static fromPet(pet: Pet) {
    const fragment = Fragment.fromPetID(pet.id);
    fragment.pet = pet;
    return fragment;
  }

  /** mininum fragments in order to obtain the pet */
  static get minFragments() {
    return 5;
  }

  get name() {
    return `${this.pet.name}'s fragment`;
  }

  get description() {
    return oneLine`This is a fragment for the ${this.pet.name}. If you have
    enough fragments you can summon this pet or upgrade it.`;
  }

  static get all() {
    return Pet.all.mapList((pet) => pet.fragment);
  }

  summonAnimation() {
    const embed = new MessageEmbed()
      .setColor(GOLD)
      .setImage(this.summonGif)
      .setTitle(`Summoning ${this.pet.name}`);

    return embed;
  }

  upgradeAnimation() {
    const embed = new MessageEmbed()
      .setColor(GOLD)
      .setImage(this.upgradeGif)
      .setTitle(`Upgrading ${this.pet.name}`);

    return embed;
  }

  convertAnimation(name: string) {
    const embed = new MessageEmbed()
      .setColor(GOLD)
      .setImage(this.convertAnimationGif)
      .setTitle(`Converting ${this.name} to ${name}`);

    return embed;
  }

  show(count: number, opt?: { price: boolean }) {
    const action = this.pet.star === -1 ? 'summon' : 'upgrade';
    const required = this.pet.upgradeCost;
    const upgradeAmount = this.pet.star >= 5
      ? 'max level' : `\`${count}/${required}\``;

    const embed = new MessageEmbed()
      .setColor(BROWN)
      .setTitle(this.name)
      .setThumbnail(this.pet.fragmentImageUrl)
      .setDescription(this.description)
      .addField(`Fragments to ${action}`, upgradeAmount, true);

    if (opt?.price) {
      embed.addField('Price', this.price, true);
    }

    return embed;
  }

  /** Merges fragments and remove the fragments from player's inventory. Adds
   * obtained pet to user's pet collection. If pet already exists, it will
   * upgrade the pet.
   * */
  async use(player: Player) {
    const playerOwnedPet = player.pets.find((x) => x.id === this.pet.id);
    const fragmentCost = playerOwnedPet?.upgradeCost || Fragment.minFragments;

    for (let i = 0; i < fragmentCost; i++) await removeInventory(player.id, this.id);

    if (playerOwnedPet) {
      await upgradePet(player.id, playerOwnedPet.id);
      return 'upgrade' as const;
    }

    await addPet(player.id, this.pet.id);
    return 'obtain' as const;
  }
}
