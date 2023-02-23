"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.List = void 0;
const main_1 = require("../main");
/** Utility array like data structure which provides extra helper methods */
class List {
    constructor(values = []) {
        this.values = values;
    }
    /** finds first item from the array by id.
     *  if number is passed, it will find by index */
    get(id) {
        if (typeof id === 'number')
            return this.values[id];
        return this.values.find((x) => x.id === id);
    }
    /** counts item based on id */
    count(id) {
        return this.values.reduce((acc, item) => (item.id === id ? acc + 1 : acc), 0);
    }
    countBy(filter) {
        return this.values.reduce((acc, item) => (filter(item) ? acc + 1 : acc), 0);
    }
    includes(id) {
        return this.values.map((x) => x.id).includes(id);
    }
    find(pred) {
        return this.values.find(pred);
    }
    every(pred) {
        return this.values.every(pred);
    }
    random() {
        if (this.values.length === 0)
            return;
        return main_1.client.random.pick(this.values);
    }
    /** @param {fn} fn callback that returns the weight of item
     *  @returns selected sample based on weight
     *
     *  NOTE that weight of the item must be integer
     * */
    weightedRandom(fn) {
        const items = [];
        for (const item of this) {
            const weight = fn(item);
            if (!Number.isInteger(weight))
                throw new Error('weight must only be integer value');
            items.push({ value: item, weight });
        }
        const samples = items.flatMap((x) => Array(x.weight).fill(x.value));
        return main_1.client.random.pick(samples);
    }
    map(fn) {
        return this.values.map(fn);
    }
    /** same as Array#map but returns List instance back instead of Array */
    mapList(fn) {
        return List.from(this.values.map(fn));
    }
    toArray() {
        return this.values;
    }
    filter(fn) {
        return this.values.filter(fn);
    }
    forEach(fn) {
        this.values.forEach(fn);
    }
    push(x) {
        this.values.push(x);
    }
    reduce(fn, acc) {
        if (acc)
            return this.values.reduce(fn, acc);
        return this.values.reduce(fn);
    }
    sort(fn) {
        return this.values.sort(fn);
    }
    remove(id, count = 1) {
        const index = this.values.findIndex((x) => x.id === id);
        if (index) {
            this.values.splice(index, count);
        }
    }
    removeBy(fn, count = 1) {
        const index = this.values.findIndex(fn);
        if (index) {
            this.values.splice(index, count);
        }
    }
    /** aggregates values inside List */
    aggregate() {
        const aggregate = new Map();
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
    aggregateBy(fn) {
        const aggregate = new Map();
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
    static from(arr) {
        return new List(arr);
    }
}
exports.List = List;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTGlzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnRlcm5hbHMvTGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxrQ0FBaUM7QUFNakMsNEVBQTRFO0FBQzVFLE1BQWEsSUFBSTtJQUdmLFlBQVksU0FBYyxFQUFFO1FBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFRDtxREFDaUQ7SUFDakQsR0FBRyxDQUFDLEVBQW1CO1FBQ3JCLElBQUksT0FBTyxFQUFFLEtBQUssUUFBUTtZQUFFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVuRCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCw4QkFBOEI7SUFDOUIsS0FBSyxDQUFDLEVBQVU7UUFDZCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDaEYsQ0FBQztJQUVELE9BQU8sQ0FBQyxNQUE0QjtRQUNsQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlFLENBQUM7SUFFRCxRQUFRLENBQUMsRUFBVTtRQUNq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