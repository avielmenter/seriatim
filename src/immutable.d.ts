import { Map, List, Iterable } from 'immutable';

declare module "immutable" {
	export interface Iterable<K, V> {
		// Sequence algorithms

		/**
		 * Returns a new Iterable of the same type with values passed through a
		 * `mapper` function.
		 *
		 *	 Seq({ a: 1, b: 2 }).map(x => 10 * x)
		 *	 // Seq { a: 10, b: 20 }
		 *
		 */
		map<M>(
			mapper: (value: V, key: K, iter: /*this*/Iterable<K, V>) => M,
			context?: any
		): /*this*/Iterable<K, M>;

	  /**
	   * Returns a new Iterable of the same type with only the entries for which
	   * the `predicate` function returns true.
	   *
	   *	 Seq({a:1,b:2,c:3,d:4}).filter(x => x % 2 === 0)
	   *	 // Seq { b: 2, d: 4 }
	   *
	   */
		filter(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any
		): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type with only the entries for which
	   * the `predicate` function returns false.
	   *
	   *	 Seq({a:1,b:2,c:3,d:4}).filterNot(x => x % 2 === 0)
	   *	 // Seq { a: 1, c: 3 }
	   *
	   */
		filterNot(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any
		): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type in reverse order.
	   */
		reverse(): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type which includes the same entries,
	   * stably sorted by using a `comparator`.
	   *
	   * If a `comparator` is not provided, a default comparator uses `<` and `>`.
	   *
	   * `comparator(valueA, valueB)`:
	   *
	   *   * Returns `0` if the elements should not be swapped.
	   *   * Returns `-1` (or any negative number) if `valueA` comes before `valueB`
	   *   * Returns `1` (or any positive number) if `valueA` comes after `valueB`
	   *   * Is pure, i.e. it must always return the same value for the same pair
	   *	 of values.
	   *
	   * When sorting collections which have no defined order, their ordered
	   * equivalents will be returned. e.g. `map.sort()` returns OrderedMap.
	   */
		sort(comparator?: (valueA: V, valueB: V) => number): /*this*/Iterable<K, V>;

	  /**
	   * Like `sort`, but also accepts a `comparatorValueMapper` which allows for
	   * sorting by more sophisticated means:
	   *
	   *	 hitters.sortBy(hitter => hitter.avgHits);
	   *
	   */
		sortBy<C>(
			comparatorValueMapper: (value: V, key: K, iter: /*this*/Iterable<K, V>) => C,
			comparator?: (valueA: C, valueB: C) => number
		): /*this*/Iterable<K, V>;

	  /**
	   * Returns a `Iterable.Keyed` of `Iterable.Keyeds`, grouped by the return
	   * value of the `grouper` function.
	   *
	   * Note: This is always an eager operation.
	   */
		groupBy<G>(
			grouper: (value: V, key: K, iter: /*this*/Iterable<K, V>) => G,
			context?: any
		): /*Map*/Seq.Keyed<G, /*this*/Iterable<K, V>>;


		// Side effects

	  /**
	   * The `sideEffect` is executed for every entry in the Iterable.
	   *
	   * Unlike `Array#forEach`, if any call of `sideEffect` returns
	   * `false`, the iteration will stop. Returns the number of entries iterated
	   * (including the last iteration which returned false).
	   */
		forEach(
			sideEffect: (value: V, key: K, iter: /*this*/Iterable<K, V>) => any,
			context?: any
		): number;


		// Creating subsets

	  /**
	   * Returns a new Iterable of the same type representing a portion of this
	   * Iterable from start up to but not including end.
	   *
	   * If begin is negative, it is offset from the end of the Iterable. e.g.
	   * `slice(-2)` returns a Iterable of the last two entries. If it is not
	   * provided the new Iterable will begin at the beginning of this Iterable.
	   *
	   * If end is negative, it is offset from the end of the Iterable. e.g.
	   * `slice(0, -1)` returns an Iterable of everything but the last entry. If
	   * it is not provided, the new Iterable will continue through the end of
	   * this Iterable.
	   *
	   * If the requested slice is equivalent to the current Iterable, then it
	   * will return itself.
	   */
		slice(begin?: number, end?: number): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type containing all entries except
	   * the first.
	   */
		rest(): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type containing all entries except
	   * the last.
	   */
		butLast(): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type which excludes the first `amount`
	   * entries from this Iterable.
	   */
		skip(amount: number): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type which excludes the last `amount`
	   * entries from this Iterable.
	   */
		skipLast(amount: number): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type which includes entries starting
	   * from when `predicate` first returns false.
	   *
	   *	 Seq.of('dog','frog','cat','hat','god')
	   *	   .skipWhile(x => x.match(/g/))
	   *	 // Seq [ 'cat', 'hat', 'god' ]
	   *
	   */
		skipWhile(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any
		): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type which includes entries starting
	   * from when `predicate` first returns true.
	   *
	   *	 Seq.of('dog','frog','cat','hat','god')
	   *	   .skipUntil(x => x.match(/hat/))
	   *	 // Seq [ 'hat', 'god' ]
	   *
	   */
		skipUntil(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any
		): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type which includes the first `amount`
	   * entries from this Iterable.
	   */
		take(amount: number): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type which includes the last `amount`
	   * entries from this Iterable.
	   */
		takeLast(amount: number): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type which includes entries from this
	   * Iterable as long as the `predicate` returns true.
	   *
	   *	 Seq.of('dog','frog','cat','hat','god')
	   *	   .takeWhile(x => x.match(/o/))
	   *	 // Seq [ 'dog', 'frog' ]
	   *
	   */
		takeWhile(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any
		): /*this*/Iterable<K, V>;

	  /**
	   * Returns a new Iterable of the same type which includes entries from this
	   * Iterable as long as the `predicate` returns false.
	   *
	   *	 Seq.of('dog','frog','cat','hat','god').takeUntil(x => x.match(/at/))
	   *	 // ['dog', 'frog']
	   *
	   */
		takeUntil(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any
		): /*this*/Iterable<K, V>;


		// Combination

	  /**
	   * Returns a new Iterable of the same type with other values and
	   * iterable-like concatenated to this one.
	   *
	   * For Seqs, all entries will be present in
	   * the resulting iterable, even if they have the same key.
	   */
		concat(...valuesOrIterables: /*Array<Iterable<K, V>|V*/any[]): /*this*/Iterable<K, V>;

	  /**
	   * Flattens nested Iterables.
	   *
	   * Will deeply flatten the Iterable by default, returning an Iterable of the
	   * same type, but a `depth` can be provided in the form of a number or
	   * boolean (where true means to shallowly flatten one level). A depth of 0
	   * (or shallow: false) will deeply flatten.
	   *
	   * Flattens only others Iterable, not Arrays or Objects.
	   *
	   * Note: `flatten(true)` operates on Iterable<any, Iterable<K, V>> and
	   * returns Iterable<K, V>
	   */
		flatten(depth?: number): /*this*/Iterable<any, any>;
		flatten(shallow?: boolean): /*this*/Iterable<any, any>;

	  /**
	   * Flat-maps the Iterable, returning an Iterable of the same type.
	   *
	   * Similar to `iter.map(...).flatten(true)`.
	   */
		flatMap<MK, MV>(
			mapper: (value: V, key: K, iter: /*this*/Iterable<K, V>) => Iterable<MK, MV>,
			context?: any
		): /*this*/Iterable<MK, MV>;
		flatMap<MK, MV>(
			mapper: (value: V, key: K, iter: /*this*/Iterable<K, V>) => /*iterable-like*/any,
			context?: any
		): /*this*/Iterable<MK, MV>;


		// Reducing a value

	  /**
	   * Reduces the Iterable to a value by calling the `reducer` for every entry
	   * in the Iterable and passing along the reduced value.
	   *
	   * If `initialReduction` is not provided, or is null, the first item in the
	   * Iterable will be used.
	   *
	   * @see `Array#reduce`.
	   */
		reduce<R>(
			reducer: (reduction: R, value: V, key: K, iter: /*this*/Iterable<K, V>) => R,
			initialReduction?: R,
			context?: any
		): R;

	  /**
	   * Reduces the Iterable in reverse (from the right side).
	   *
	   * Note: Similar to this.reverse().reduce(), and provided for parity
	   * with `Array#reduceRight`.
	   */
		reduceRight<R>(
			reducer: (reduction: R, value: V, key: K, iter: /*this*/Iterable<K, V>) => R,
			initialReduction?: R,
			context?: any
		): R;

	  /**
	   * True if `predicate` returns true for all entries in the Iterable.
	   */
		every(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any
		): boolean;

	  /**
	   * True if `predicate` returns true for any entry in the Iterable.
	   */
		some(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any
		): boolean;

	  /**
	   * Joins values together as a string, inserting a separator between each.
	   * The default separator is `","`.
	   */
		join(separator?: string): string;

	  /**
	   * Returns true if this Iterable includes no values.
	   *
	   * For some lazy `Seq`, `isEmpty` might need to iterate to determine
	   * emptiness. At most one iteration will occur.
	   */
		isEmpty(): boolean;

	  /**
	   * Returns the size of this Iterable.
	   *
	   * Regardless of if this Iterable can describe its size lazily (some Seqs
	   * cannot), this method will always return the correct size. E.g. it
	   * evaluates a lazy `Seq` if necessary.
	   *
	   * If `predicate` is provided, then this returns the count of entries in the
	   * Iterable for which the `predicate` returns true.
	   */
		count(): number;
		count(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any
		): number;

	  /**
	   * Returns a `Seq.Keyed` of counts, grouped by the return value of
	   * the `grouper` function.
	   *
	   * Note: This is not a lazy operation.
	   */
		countBy<G>(
			grouper: (value: V, key: K, iter: /*this*/Iterable<K, V>) => G,
			context?: any
		): Map<G, number>;


		// Search for value

	  /**
	   * Returns the first value for which the `predicate` returns true.
	   */
		find(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any,
			notSetValue?: V
		): V;

	  /**
	   * Returns the last value for which the `predicate` returns true.
	   *
	   * Note: `predicate` will be called for each entry in reverse.
	   */
		findLast(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any,
			notSetValue?: V
		): V;

	  /**
	   * Returns the first [key, value] entry for which the `predicate` returns true.
	   */
		findEntry(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any,
			notSetValue?: V
		): /*[K, V]*/Array<any>;

	  /**
	   * Returns the last [key, value] entry for which the `predicate`
	   * returns true.
	   *
	   * Note: `predicate` will be called for each entry in reverse.
	   */
		findLastEntry(
			predicate: (value: V, key: K, iter: /*this*/Iterable<K, V>) => boolean,
			context?: any,
			notSetValue?: V
		): /*[K, V]*/Array<any>;

	  /**
	   * Returns the key for which the `predicate` returns true.
	   */
		findKey(
			predicate: (value: V, key: K, iter: /*this*/Iterable.Keyed<K, V>) => boolean,
			context?: any
		): K;

	  /**
	   * Returns the last key for which the `predicate` returns true.
	   *
	   * Note: `predicate` will be called for each entry in reverse.
	   */
		findLastKey(
			predicate: (value: V, key: K, iter: /*this*/Iterable.Keyed<K, V>) => boolean,
			context?: any
		): K;

	  /**
	   * Returns the key associated with the search value, or undefined.
	   */
		keyOf(searchValue: V): K;

	  /**
	   * Returns the last key associated with the search value, or undefined.
	   */
		lastKeyOf(searchValue: V): K;

	  /**
	   * Returns the maximum value in this collection. If any values are
	   * comparatively equivalent, the first one found will be returned.
	   *
	   * The `comparator` is used in the same way as `Iterable#sort`. If it is not
	   * provided, the default comparator is `>`.
	   *
	   * When two values are considered equivalent, the first encountered will be
	   * returned. Otherwise, `max` will operate independent of the order of input
	   * as long as the comparator is commutative. The default comparator `>` is
	   * commutative *only* when types do not differ.
	   *
	   * If `comparator` returns 0 and either value is NaN, undefined, or null,
	   * that value will be returned.
	   */
		max(comparator?: (valueA: V, valueB: V) => number): V;

	  /**
	   * Like `max`, but also accepts a `comparatorValueMapper` which allows for
	   * comparing by more sophisticated means:
	   *
	   *	 hitters.maxBy(hitter => hitter.avgHits);
	   *
	   */
		maxBy<C>(
			comparatorValueMapper: (value: V, key: K, iter: /*this*/Iterable<K, V>) => C,
			comparator?: (valueA: C, valueB: C) => number
		): V;

	  /**
	   * Returns the minimum value in this collection. If any values are
	   * comparatively equivalent, the first one found will be returned.
	   *
	   * The `comparator` is used in the same way as `Iterable#sort`. If it is not
	   * provided, the default comparator is `<`.
	   *
	   * When two values are considered equivalent, the first encountered will be
	   * returned. Otherwise, `min` will operate independent of the order of input
	   * as long as the comparator is commutative. The default comparator `<` is
	   * commutative *only* when types do not differ.
	   *
	   * If `comparator` returns 0 and either value is NaN, undefined, or null,
	   * that value will be returned.
	   */
		min(comparator?: (valueA: V, valueB: V) => number): V;

	  /**
	   * Like `min`, but also accepts a `comparatorValueMapper` which allows for
	   * comparing by more sophisticated means:
	   *
	   *	 hitters.minBy(hitter => hitter.avgHits);
	   *
	   */
		minBy<C>(
			comparatorValueMapper: (value: V, key: K, iter: /*this*/Iterable<K, V>) => C,
			comparator?: (valueA: C, valueB: C) => number
		): V;
	}
}