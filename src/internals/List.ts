import { client } from '../main';

interface Identifiable {
  id: string;
}

/** Utility array like data structure which provides extra helper methods */
export class List<T extends Identifiable> {
  private values: T[];

  constructor(values: T[] = []) {
    this.values = values;
  }

  /** finds first item from the array by id.
   *  if number is passed, it will find by index */
  get(id: string | number) {
    if (typeof id === 'number') return this.values[id];

    return this.values.find((x) => x.id === id);
  }

  /** counts item based on id */
  count(id: string) {
    return this.values.reduce((acc, item) => (item.id === id ? acc + 1 : acc), 0);
  }

  countBy(filter: (item: T) => boolean) {
    return this.values.reduce((acc, item) => (filter(item) ? acc + 1 : acc), 0);
  }

  includes(id: string) {
    return this.values.map((x) => x.id).includes(id);
  }

  find(pred: (x: T, i: number) => boolean) {
    return this.values.find(pred);
  }

  every(pred: (x: T, i: number) => boolean) {
    return this.values.every(pred);
  }

  random() {
    if (this.values.length === 0) return;
    return client.random.pick(this.values);
  }

  /** @param {fn} fn callback that returns the weight of item
   *  @returns selected sample based on weight
   *
   *  NOTE that weight of the item must be integer
   * */
  weightedRandom(fn: (id: T) => number) {
    const items: { value: T, weight: number }[] = [];

    for (const item of this) {
      const weight = fn(item);

      if (!Number.isInteger(weight)) throw new Error('weight must only be integer value');

      items.push({ value: item, weight });
    }

    const samples = items.flatMap<T>((x) => Array(x.weight).fill(x.value));
    return client.random.pick(samples);
  }

  map<V>(fn: (x: T, i: number) => V) {
    return this.values.map(fn);
  }

  /** same as Array#map but returns List instance back instead of Array */
  mapList<V extends Identifiable>(fn: (x: T, i: number) => V) {
    return List.from(this.values.map(fn));
  }

  toArray() {
    return this.values;
  }

  filter(fn: (x: T, i: number) => boolean) {
    return this.values.filter(fn);
  }

  forEach(fn: (x: T, i: number) => void) {
    this.values.forEach(fn);
  }

  push(x: T) {
    this.values.push(x);
  }

  reduce(fn: (acc: T, current: T, i: number) => T, acc?: T) {
    if (acc) return this.values.reduce(fn, acc);
    return this.values.reduce(fn);
  }

  sort(fn: (a: T, b: T) => number) {
    return this.values.sort(fn);
  }

  remove(id: string, count = 1) {
    const index = this.values.findIndex((x) => x.id === id);
    if (index) {
      this.values.splice(index, count);
    }
  }

  removeBy(fn: (x: T) => boolean, count = 1) {
    const index = this.values.findIndex(fn);
    if (index) {
      this.values.splice(index, count);
    }
  }

  /** aggregates values inside List */
  aggregate() {
    const aggregate = new Map<string, { value: T, count: number }>();

    this.forEach((v) => {
      const acc = aggregate.get(v.id);
      if (acc) {
        aggregate.set(v.id, {
          value: v,
          count: acc.count + 1,
        });

        return;
      }

      aggregate.set(v.id, { value: v, count: 1 });
    });

    return [...aggregate.values()];
  }

  /** aggregates values inside List by other identifier */
  aggregateBy(fn: (value: T) => string) {
    const aggregate = new Map<string, { value: T, count: number }>();

    this.forEach((v) => {
      const id = fn(v);
      const acc = aggregate.get(id);
      if (acc) {
        aggregate.set(id, {
          value: v,
          count: acc.count + 1,
        });

        return;
      }

      aggregate.set(id, { value: v, count: 1 });
    });

    return [...aggregate.values()];
  }

  [Symbol.iterator]() {
    return this.values[Symbol.iterator]();
  }

  get length() {
    return this.values.length;
  }

  static from<T extends Identifiable>(arr: T[]) {
    return new List(arr);
  }
}
