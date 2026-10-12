# fast-multisort

Stable multi-key sort for arrays of records with the ordering semantics of lodash `sortBy`/`orderBy`, several times faster.

- Keys are computed once per item per column, never inside a comparator.
- Numeric columns are sorted with a stable LSD radix sort on the float64 bits. String columns are bucketed by key; a few distinct keys are sorted natively, many distinct keys go through an MSD radix sort over 8-character windows after the common prefix. Ties recurse into the next column inside their bucket. Already ordered columns are detected and passed through.
- Columns with anything else (`NaN`, booleans, objects, symbols, mixed numbers and strings) fall back to the exact lodash comparator chain over the whole range, so the resulting permutation is identical to lodash even where its comparator is not transitive.
- `null`, `undefined` and symbols sort like lodash: after values ascending, before them descending. `multisort` lets each rule choose `nulls: "first" | "last"` instead.
- Zero dependencies, ESM and CJS, TypeScript types included.

## Usage

```ts
import {multisort, orderBy, sortBy} from "fast-multisort";

multisort(tasks, [
  {by: "dueDate", nulls: "last"},
  {by: (task) => task.priority, order: "desc", nulls: "first"},
  {by: "title"},
]);

sortBy(users, (user) => user.lastName);
sortBy(users, "lastName", "firstName");
orderBy(users, [(user) => user.age, "lastName"], ["desc", "asc"]);
```

All three return a new array and never mutate the input. An iteratee (`by`) is a function or a property name.

### multisort

`multisort(items, rules)` is the API this package exists for. Each rule has `by`, an optional `order` (`"asc"` by default) and an optional `nulls` (`"first"` or `"last"`). `null` and `undefined` are the same null and keep their input order among themselves. When `nulls` is omitted a rule behaves like lodash and SQL: nulls last ascending, nulls first descending.

### sortBy and orderBy

Drop-in for lodash. `sortBy` takes iteratees as rest arguments or as one array; `orderBy` takes an array of iteratees and an array of `"asc" | "desc"` (missing entries mean `"asc"`). Unlike `multisort`, these keep every lodash quirk, including `undefined` sorting after `null`.

### Columns with your own contract

`orderByColumns(items, columns)` is the engine underneath. Each column declares its keys, direction, which keys count as *special* (and in which class) and whether specials come first; an optional `compare` replaces the value comparator for that column.

```ts
import {orderByColumns} from "fast-multisort";

const nullsFirst = orderByColumns(rows, [
  {
    keys: rows.map((row) => row.dueDate),
    desc: false,
    specialClass: (key) => (key == null ? 1 : 0),
    specialsFirst: true,
  },
]);
```

Specials of the same class keep their input order; different classes are ordered by class number (reversed when `specialsFirst`).

## Semantics kept from lodash

| input | lodash | fast-multisort |
|---|---|---|
| stable for equal keys | yes | yes |
| `null` / `undefined` | after values asc, before desc, `null` before `undefined` | same |
| symbols | before `null` | same |
| `NaN` | greatest, non-transitive with itself | same permutation (same comparator, same engine sort) |
| mixed number and string column | lodash's `>`/`<` on mixed types | same |
| `sortBy(null)` | `[]` | not accepted: pass an array |
| string path iteratee `"a.b"` | supported | not supported: pass a function |

The test suite is a [fast-check](https://github.com/dubzzz/fast-check) oracle against lodash over numbers, strings, booleans, dates and a chaos pool mixing all of them with `NaN`, symbols and objects, across multi-key iteratees and directions.

## Benchmarks

Apple Silicon laptop, Node v24.21.0, tinybench, 500 ms per task. Ops/sec, higher is better.

```
10,000 rows, single string key
┌─────────────────────────────────────────────────────────────────────┬───────────┬─────────┐
│ Name                                                                │ Ops / sec │ Mean ms │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ fast-multisort (same order as lodash)                               │ 3263.1    │ 0.309   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ fast-sort (same order as lodash)                                    │ 378.3     │ 2.645   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ es-toolkit.orderBy (same order as lodash)                           │ 361.9     │ 2.767   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ Array.prototype.sort (decorated, nulls last) (same order as lodash) │ 347.9     │ 2.876   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ lodash.orderBy (same order as lodash)                               │ 309.8     │ 3.236   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ sort-array (same order as lodash)                                   │ 198.7     │ 5.033   │
└─────────────────────────────────────────────────────────────────────┴───────────┴─────────┘

10,000 rows, single number key, 10% null
┌─────────────────────────────────────────────────────────────────────┬───────────┬─────────┐
│ Name                                                                │ Ops / sec │ Mean ms │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ fast-multisort (same order as lodash)                               │ 3815.9    │ 0.265   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ fast-sort (same order as lodash)                                    │ 518.4     │ 1.947   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ es-toolkit.orderBy (same order as lodash)                           │ 507.9     │ 1.971   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ lodash.orderBy (same order as lodash)                               │ 465.6     │ 2.151   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ Array.prototype.sort (decorated, nulls last) (same order as lodash) │ 442.1     │ 2.299   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ sort-array (same order as lodash)                                   │ 234.5     │ 4.289   │
└─────────────────────────────────────────────────────────────────────┴───────────┴─────────┘

10,000 rows, single float key
┌─────────────────────────────────────────────────────────────────────┬───────────┬─────────┐
│ Name                                                                │ Ops / sec │ Mean ms │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ fast-multisort (same order as lodash)                               │ 1900.2    │ 0.761   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ fast-sort (same order as lodash)                                    │ 321.0     │ 3.226   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ Array.prototype.sort (decorated, nulls last) (same order as lodash) │ 298.1     │ 3.418   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ es-toolkit.orderBy (same order as lodash)                           │ 279.5     │ 3.912   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ lodash.orderBy (same order as lodash)                               │ 197.4     │ 5.613   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ sort-array (same order as lodash)                                   │ 157.0     │ 6.505   │
└─────────────────────────────────────────────────────────────────────┴───────────┴─────────┘

10,000 rows, three keys, mixed directions
┌─────────────────────────────────────────────────────────────────────┬───────────┬─────────┐
│ Name                                                                │ Ops / sec │ Mean ms │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ fast-multisort (same order as lodash)                               │ 1045.6    │ 0.997   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ Array.prototype.sort (decorated, nulls last) (same order as lodash) │ 247.0     │ 4.157   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ es-toolkit.orderBy (same order as lodash)                           │ 220.1     │ 4.740   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ lodash.orderBy (same order as lodash)                               │ 205.8     │ 4.949   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ fast-sort (different order)                                         │ 204.9     │ 4.927   │
├─────────────────────────────────────────────────────────────────────┼───────────┼─────────┤
│ sort-array (different order)                                        │ 140.4     │ 7.154   │
└─────────────────────────────────────────────────────────────────────┴───────────┴─────────┘
```

Run `pnpm bench` to reproduce. Competitors are called with their own multi-key API where they have one; `(different order)` marks libraries whose result is not the lodash permutation on that input (mostly `null` placement).

## Why not just `Array.prototype.sort` with a comparator

A comparator runs O(n log n) times and has to recompute or look up keys on every call. For 10k rows and three keys that is about 400k comparator calls. Computing keys once and sorting indices by column turns most of the work into linear passes, and the engine's own `sort` only ever sees arrays of unique primitive strings.

## License

MIT
