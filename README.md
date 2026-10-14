# fast-multisort

Sorts arrays of records by several keys, puts nulls where you tell it to, and tries very hard not to call a comparator. Stable, lodash-compatible where you want it to be, and the fastest thing on this side of the canyon as far as the benchmarks below can see.

The ambition is simple: be for sorting what [fast-equals](https://github.com/planttheidea/fast-equals) is for equality.

- Stable. Keys are read once per item, never inside a comparator.
- `multisort` puts nulls first or last per rule; `sortBy`/`orderBy` are drop-ins for lodash down to its quirks.
- Zero dependencies, ESM and CJS, types included. Needs `Array.prototype.toSorted` (ES2023: Node 20, Chrome 110, Safari 16, Firefox 115).

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

Specials of the same class keep their input order; different classes are ordered by class number (reversed when `specialsFirst`). A column whose `keys` length differs from `items` throws a `RangeError`.

### Contract

- Iteratees are called with the item only, never an index, so `sortBy(strings, parseInt)` means what it says. Holes in a sparse input are read as `undefined`.
- Empty rules return a copy in input order.
- A custom `compare` is always honoured; a result that is not below or above zero (`NaN` included) is a tie and falls through to the next column.
- Sorting is safe to start from inside an iteratee, `specialClass` or `compare`: every call owns its scratch memory.
- Every path returns the same elements, once each, and each iteratee is called exactly once per item. For a consistent comparator (the built-in ones, or a `compare` that is a total order) the result never depends on which internal path ran; a `compare` that contradicts itself, for example by returning `NaN` for some pairs, has no single right answer and may order differently at different sizes.

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

The test suite is a [fast-check](https://github.com/dubzzz/fast-check) oracle against lodash over numbers, strings, booleans, dates and a chaos pool mixing all of them with `NaN`, symbols and objects, across multi-key iteratees, directions and sizes on both sides of every internal threshold; a second oracle checks `orderByColumns` against a record-sort specification (lower-cased text, decimal strings under a custom comparator, nested nullable dates, nulls first or last per column) for permutation, order and stability; and a regression file pins every finding of an independent correctness audit, from lost rows after a sorted run to nested sorts from inside a comparator.

## Benchmarks

Every competitor is run with its own multi-key API where it has one and checked against the lodash permutation first; `(different order)` marks results that differ (mostly where `null` lands), and the run aborts if `fast-multisort` itself differs. `inline comparator chain` is the hand-written baseline, `(a, b) => str(a.name, b.name) || rankDesc(a.rank, b.rank) || str(a.created, b.created)` passed to `rows.slice().sort()` and to `rows.toSorted()`, relying on the native sort's stability. Sizes run from 1 row to 1 million, every case and every library at every size. Each library is calibrated to a batch of at least 20 ms, then the libraries of a case take turns batch by batch, up to 25 rounds within half a second per library, and the median batch is reported. The same code runs in node and in the browsers, one engine at a time. Numbers below are from `pnpm bench`, Apple M5 Max, Node 24. Ops/sec, higher is better; the last column is how many times slower than `fast-multisort`.

<!-- bench:start -->

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, slice().sort() | 0.48× | 1.13× | 7.64× | 63 | 0 |
| inline comparator chain, toSorted() | 0.45× | 1.30× | 7.63× | 63 | 0 |
| just-sort-by | 0.50× | 1.80× | 22.51× | 56 | 17 |
| es-toolkit.orderBy | 0.93× | 2.17× | 21.01× | 63 | 0 |
| thenby | 0.88× | 2.17× | 12.18× | 63 | 12 |
| fast-sort | 1.16× | 2.44× | 24.17× | 63 | 6 |
| remeda.sortBy | 0.93× | 2.65× | 24.41× | 63 | 12 |
| Array.prototype.sort, decorated | 0.91× | 2.78× | 31.23× | 63 | 0 |
| underscore.sortBy | 1.04× | 3.16× | 13.55× | 56 | 6 |
| ramda.sortWith | 1.84× | 3.93× | 25.58× | 63 | 12 |
| lodash.orderBy | 1.33× | 4.14× | 39.67× | 63 | 0 |
| sort-array | 1.24× | 4.61× | 27.80× | 63 | 6 |
| sort-on | 1.62× | 24.33× | 111.23× | 63 | 17 |
| natural-orderby | 4.81× | 25.30× | 133.99× | 63 | 17 |
| sort-by | 4.18× | 182.53× | 773.83× | 63 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 258170260 | 0.000 | 0.50× |
| fast-multisort | 129761711 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 110250214 | 0.000 | 1.18× |
| es-toolkit.orderBy | 82998823 | 0.000 | 1.56× |
| sort-on | 72661039 | 0.000 | 1.79× |
| Array.prototype.sort, decorated | 61606801 | 0.000 | 2.11× |
| thenby | 41733745 | 0.000 | 3.11× |
| inline comparator chain, toSorted() | 37174428 | 0.000 | 3.49× |
| ramda.sortWith | 34794315 | 0.000 | 3.73× |
| remeda.sortBy | 29402074 | 0.000 | 4.41× |
| fast-sort | 28312918 | 0.000 | 4.58× |
| sort-array | 27884663 | 0.000 | 4.65× |
| sort-by | 27259046 | 0.000 | 4.76× |
| underscore.sortBy | 23775751 | 0.000 | 5.46× |
| lodash.orderBy | 23248777 | 0.000 | 5.58× |
| natural-orderby | 3562352 | 0.000 | 36.43× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 220629945 | 0.000 | 0.53× |
| fast-multisort | 115963657 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103357409 | 0.000 | 1.12× |
| es-toolkit.orderBy | 78899003 | 0.000 | 1.47× |
| sort-on | 70354359 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 60095841 | 0.000 | 1.93× |
| thenby | 39646579 | 0.000 | 2.92× |
| inline comparator chain, toSorted() | 36286987 | 0.000 | 3.20× |
| ramda.sortWith | 34053427 | 0.000 | 3.41× |
| remeda.sortBy | 30000636 | 0.000 | 3.87× |
| fast-sort | 28765972 | 0.000 | 4.03× |
| sort-array | 28135560 | 0.000 | 4.12× |
| sort-by | 27613453 | 0.000 | 4.20× |
| underscore.sortBy | 21665912 | 0.000 | 5.35× |
| lodash.orderBy | 18919226 | 0.000 | 6.13× |
| natural-orderby | 1649354 | 0.001 | 70.31× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 221092720 | 0.000 | 0.53× |
| fast-multisort | 116286505 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 102545627 | 0.000 | 1.13× |
| es-toolkit.orderBy | 78987163 | 0.000 | 1.47× |
| sort-on | 70377674 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 60301037 | 0.000 | 1.93× |
| thenby | 39894587 | 0.000 | 2.91× |
| inline comparator chain, toSorted() | 36356343 | 0.000 | 3.20× |
| ramda.sortWith | 33929008 | 0.000 | 3.43× |
| remeda.sortBy | 29845191 | 0.000 | 3.90× |
| fast-sort | 28612386 | 0.000 | 4.06× |
| sort-array | 28077394 | 0.000 | 4.14× |
| sort-by | 27470938 | 0.000 | 4.23× |
| underscore.sortBy | 22185825 | 0.000 | 5.24× |
| lodash.orderBy | 18778700 | 0.000 | 6.19× |
| natural-orderby | 2867511 | 0.000 | 40.55× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 218447645 | 0.000 | 0.53× |
| fast-multisort | 115927599 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103251817 | 0.000 | 1.12× |
| es-toolkit.orderBy | 79068315 | 0.000 | 1.47× |
| sort-on | 70199514 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 60465555 | 0.000 | 1.92× |
| thenby | 39566853 | 0.000 | 2.93× |
| inline comparator chain, toSorted() | 36098717 | 0.000 | 3.21× |
| ramda.sortWith | 34040531 | 0.000 | 3.41× |
| remeda.sortBy | 29843210 | 0.000 | 3.88× |
| fast-sort | 28753647 | 0.000 | 4.03× |
| sort-array | 28014289 | 0.000 | 4.14× |
| sort-by | 27469649 | 0.000 | 4.22× |
| underscore.sortBy | 21850796 | 0.000 | 5.31× |
| lodash.orderBy | 18588751 | 0.000 | 6.24× |
| natural-orderby | 2576126 | 0.000 | 45.00× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 222903669 | 0.000 | 0.52× |
| fast-multisort | 116578336 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103051413 | 0.000 | 1.13× |
| es-toolkit.orderBy | 79128232 | 0.000 | 1.47× |
| sort-on | 70131728 | 0.000 | 1.66× |
| Array.prototype.sort, decorated | 60502333 | 0.000 | 1.93× |
| thenby | 39882638 | 0.000 | 2.92× |
| inline comparator chain, toSorted() | 36168966 | 0.000 | 3.22× |
| ramda.sortWith | 33963534 | 0.000 | 3.43× |
| remeda.sortBy | 29849936 | 0.000 | 3.91× |
| fast-sort | 28675930 | 0.000 | 4.07× |
| sort-array | 28122072 | 0.000 | 4.15× |
| sort-by | 27633707 | 0.000 | 4.22× |
| underscore.sortBy | 22224186 | 0.000 | 5.25× |
| lodash.orderBy | 18889688 | 0.000 | 6.17× |
| natural-orderby | 1796764 | 0.001 | 64.88× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 221899079 | 0.000 | 0.52× |
| fast-multisort | 115613643 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 102739457 | 0.000 | 1.13× |
| es-toolkit.orderBy | 78569784 | 0.000 | 1.47× |
| sort-on | 70836766 | 0.000 | 1.63× |
| Array.prototype.sort, decorated | 60633161 | 0.000 | 1.91× |
| thenby | 40033827 | 0.000 | 2.89× |
| inline comparator chain, toSorted() | 36384885 | 0.000 | 3.18× |
| ramda.sortWith | 33995650 | 0.000 | 3.40× |
| remeda.sortBy | 29605980 | 0.000 | 3.91× |
| fast-sort | 28619708 | 0.000 | 4.04× |
| sort-array | 28031545 | 0.000 | 4.12× |
| sort-by | 27672876 | 0.000 | 4.18× |
| underscore.sortBy | 22472856 | 0.000 | 5.14× |
| lodash.orderBy | 18916211 | 0.000 | 6.11× |
| natural-orderby | 3463211 | 0.000 | 33.38× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 222876770 | 0.000 | 0.52× |
| fast-multisort | 116204888 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103014501 | 0.000 | 1.13× |
| es-toolkit.orderBy | 79099381 | 0.000 | 1.47× |
| sort-on | 70984723 | 0.000 | 1.64× |
| Array.prototype.sort, decorated | 60191497 | 0.000 | 1.93× |
| thenby | 39693289 | 0.000 | 2.93× |
| inline comparator chain, toSorted() | 36198516 | 0.000 | 3.21× |
| ramda.sortWith | 33978346 | 0.000 | 3.42× |
| remeda.sortBy | 29874846 | 0.000 | 3.89× |
| fast-sort | 28706973 | 0.000 | 4.05× |
| sort-array | 28021338 | 0.000 | 4.15× |
| sort-by | 27785067 | 0.000 | 4.18× |
| underscore.sortBy | 22362664 | 0.000 | 5.20× |
| lodash.orderBy | 18710316 | 0.000 | 6.21× |
| natural-orderby | 3426697 | 0.000 | 33.91× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 217779154 | 0.000 | 0.52× |
| fast-multisort | 113574952 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 101298845 | 0.000 | 1.12× |
| es-toolkit.orderBy | 76729049 | 0.000 | 1.48× |
| sort-on | 69631859 | 0.000 | 1.63× |
| Array.prototype.sort, decorated | 59178266 | 0.000 | 1.92× |
| thenby | 39272448 | 0.000 | 2.89× |
| inline comparator chain, toSorted() | 35447968 | 0.000 | 3.20× |
| ramda.sortWith | 33275934 | 0.000 | 3.41× |
| remeda.sortBy | 28978295 | 0.000 | 3.92× |
| fast-sort | 28240256 | 0.000 | 4.02× |
| sort-array | 27237833 | 0.000 | 4.17× |
| sort-by | 26669589 | 0.000 | 4.26× |
| underscore.sortBy | 21323247 | 0.000 | 5.33× |
| lodash.orderBy | 18208581 | 0.000 | 6.24× |
| natural-orderby | 2630225 | 0.000 | 43.18× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 112939859 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 101665718 | 0.000 | 1.11× |
| es-toolkit.orderBy | 77521918 | 0.000 | 1.46× |
| sort-on | 69695786 | 0.000 | 1.62× |
| Array.prototype.sort, decorated | 58817069 | 0.000 | 1.92× |
| inline comparator chain, toSorted() | 35992877 | 0.000 | 3.14× |
| sort-array | 27651986 | 0.000 | 4.08× |
| sort-by | 24197862 | 0.000 | 4.67× |
| ramda.sortWith | 20793115 | 0.000 | 5.43× |
| remeda.sortBy | 16062704 | 0.000 | 7.03× |
| lodash.orderBy | 14555368 | 0.000 | 7.76× |
| thenby | 11298072 | 0.000 | 10.00× |
| fast-sort | 4672826 | 0.000 | 24.17× |
| natural-orderby | 842920 | 0.001 | 133.99× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4466670 | 0.000 | 0.76× |
| inline comparator chain, slice().sort() | 4294585 | 0.000 | 0.79× |
| thenby | 3849464 | 0.000 | 0.88× |
| Array.prototype.sort, decorated | 3710141 | 0.000 | 0.91× |
| remeda.sortBy | 3633403 | 0.000 | 0.93× |
| es-toolkit.orderBy | 3628487 | 0.000 | 0.93× |
| fast-multisort | 3388077 | 0.000 | 1.00× |
| fast-sort | 2852435 | 0.000 | 1.19× |
| sort-array | 2734688 | 0.000 | 1.24× |
| underscore.sortBy | 2614955 | 0.000 | 1.30× |
| lodash.orderBy | 2096621 | 0.000 | 1.62× |
| ramda.sortWith | 1677994 | 0.001 | 2.02× |
| just-sort-by (different order) | 1084207 | 0.001 | 3.12× |
| natural-orderby (different order) | 300741 | 0.003 | 11.27× |
| sort-on (different order) | 211896 | 0.005 | 15.99× |
| sort-by | 26765 | 0.037 | 126.58× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 3701057 | 0.000 | 0.67× |
| inline comparator chain, slice().sort() | 3589493 | 0.000 | 0.69× |
| thenby | 2494313 | 0.000 | 0.99× |
| remeda.sortBy | 2476721 | 0.000 | 1.00× |
| fast-multisort | 2470567 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2401378 | 0.000 | 1.03× |
| fast-sort | 2135268 | 0.000 | 1.16× |
| underscore.sortBy | 2123354 | 0.000 | 1.16× |
| Array.prototype.sort, decorated | 1853151 | 0.001 | 1.33× |
| lodash.orderBy | 1743676 | 0.001 | 1.42× |
| ramda.sortWith | 1310277 | 0.001 | 1.89× |
| sort-array | 1146030 | 0.001 | 2.16× |
| just-sort-by | 839077 | 0.001 | 2.94× |
| sort-on | 174134 | 0.006 | 14.19× |
| natural-orderby | 119363 | 0.008 | 20.70× |
| sort-by | 25775 | 0.039 | 95.85× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6351657 | 0.000 | 0.50× |
| inline comparator chain, slice().sort() | 6008308 | 0.000 | 0.53× |
| just-sort-by (different order) | 3919925 | 0.000 | 0.81× |
| thenby (different order) | 3250471 | 0.000 | 0.98× |
| fast-multisort | 3175316 | 0.000 | 1.00× |
| es-toolkit.orderBy | 3157632 | 0.000 | 1.01× |
| remeda.sortBy (different order) | 3126525 | 0.000 | 1.02× |
| underscore.sortBy (different order) | 2780007 | 0.000 | 1.14× |
| Array.prototype.sort, decorated | 2572313 | 0.000 | 1.23× |
| fast-sort | 2559842 | 0.000 | 1.24× |
| lodash.orderBy | 2132341 | 0.000 | 1.49× |
| ramda.sortWith (different order) | 1641392 | 0.001 | 1.93× |
| sort-array | 1440418 | 0.001 | 2.20× |
| natural-orderby | 302542 | 0.003 | 10.50× |
| sort-on | 261449 | 0.004 | 12.15× |
| sort-by (different order) | 31826 | 0.031 | 99.77× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4820286 | 0.000 | 0.54× |
| inline comparator chain, slice().sort() | 4578448 | 0.000 | 0.57× |
| just-sort-by | 2781610 | 0.000 | 0.94× |
| fast-multisort | 2623569 | 0.000 | 1.00× |
| thenby | 2565566 | 0.000 | 1.02× |
| remeda.sortBy | 2478864 | 0.000 | 1.06× |
| underscore.sortBy | 2392167 | 0.000 | 1.10× |
| es-toolkit.orderBy | 2342771 | 0.000 | 1.12× |
| fast-sort | 1965004 | 0.001 | 1.34× |
| Array.prototype.sort, decorated | 1843000 | 0.001 | 1.42× |
| lodash.orderBy | 1714545 | 0.001 | 1.53× |
| ramda.sortWith | 1223952 | 0.001 | 2.14× |
| sort-array | 994077 | 0.001 | 2.64× |
| natural-orderby | 250797 | 0.004 | 10.46× |
| sort-on | 174156 | 0.006 | 15.06× |
| sort-by | 23513 | 0.043 | 111.58× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4000997 | 0.000 | 0.59× |
| inline comparator chain, slice().sort() | 3779061 | 0.000 | 0.62× |
| thenby | 2357551 | 0.000 | 0.99× |
| fast-multisort | 2344339 | 0.000 | 1.00× |
| remeda.sortBy | 2303415 | 0.000 | 1.02× |
| es-toolkit.orderBy | 2220211 | 0.000 | 1.06× |
| underscore.sortBy | 1938271 | 0.001 | 1.21× |
| fast-sort | 1852346 | 0.001 | 1.27× |
| Array.prototype.sort, decorated | 1768736 | 0.001 | 1.33× |
| lodash.orderBy | 1556564 | 0.001 | 1.51× |
| just-sort-by | 1411838 | 0.001 | 1.66× |
| ramda.sortWith | 1275299 | 0.001 | 1.84× |
| sort-array | 1072809 | 0.001 | 2.19× |
| sort-on | 173288 | 0.006 | 13.53× |
| natural-orderby | 171718 | 0.006 | 13.65× |
| sort-by | 26667 | 0.037 | 87.91× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12067069 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 11892302 | 0.000 | 1.01× |
| inline comparator chain, slice().sort() | 10117109 | 0.000 | 1.19× |
| just-sort-by | 6400352 | 0.000 | 1.89× |
| thenby | 5351143 | 0.000 | 2.26× |
| es-toolkit.orderBy | 5327507 | 0.000 | 2.27× |
| remeda.sortBy | 5183742 | 0.000 | 2.33× |
| Array.prototype.sort, decorated | 4502587 | 0.000 | 2.68× |
| fast-sort | 3774884 | 0.000 | 3.20× |
| underscore.sortBy | 3754627 | 0.000 | 3.21× |
| ramda.sortWith | 3131548 | 0.000 | 3.85× |
| lodash.orderBy | 3040996 | 0.000 | 3.97× |
| sort-array | 2896261 | 0.000 | 4.17× |
| sort-on | 501373 | 0.002 | 24.07× |
| natural-orderby | 368307 | 0.003 | 32.76× |
| sort-by | 66110 | 0.015 | 182.53× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12395199 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 11267862 | 0.000 | 1.10× |
| inline comparator chain, slice().sort() | 9799455 | 0.000 | 1.26× |
| just-sort-by | 6277620 | 0.000 | 1.97× |
| thenby | 5309281 | 0.000 | 2.33× |
| es-toolkit.orderBy | 5164364 | 0.000 | 2.40× |
| remeda.sortBy | 4670565 | 0.000 | 2.65× |
| Array.prototype.sort, decorated | 4491895 | 0.000 | 2.76× |
| fast-sort | 3757004 | 0.000 | 3.30× |
| underscore.sortBy | 3531312 | 0.000 | 3.51× |
| ramda.sortWith | 3151880 | 0.000 | 3.93× |
| sort-array | 2978768 | 0.000 | 4.16× |
| lodash.orderBy | 2865113 | 0.000 | 4.33× |
| sort-on | 453413 | 0.002 | 27.34× |
| natural-orderby | 361792 | 0.003 | 34.26× |
| sort-by | 65018 | 0.015 | 190.64× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6471799 | 0.000 | 0.45× |
| inline comparator chain, slice().sort() | 6010042 | 0.000 | 0.48× |
| just-sort-by | 3011805 | 0.000 | 0.96× |
| fast-multisort | 2896315 | 0.000 | 1.00× |
| underscore.sortBy | 2788474 | 0.000 | 1.04× |
| thenby | 2753705 | 0.000 | 1.05× |
| remeda.sortBy | 2674084 | 0.000 | 1.08× |
| es-toolkit.orderBy | 2526178 | 0.000 | 1.15× |
| Array.prototype.sort, decorated | 2164461 | 0.000 | 1.34× |
| fast-sort | 2135680 | 0.000 | 1.36× |
| lodash.orderBy | 1974868 | 0.001 | 1.47× |
| ramda.sortWith | 1428189 | 0.001 | 2.03× |
| sort-array | 1251017 | 0.001 | 2.32× |
| natural-orderby | 302598 | 0.003 | 9.57× |
| sort-on | 214479 | 0.005 | 13.50× |
| sort-by | 26226 | 0.038 | 110.44× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4224960 | 0.000 | 0.48× |
| inline comparator chain, slice().sort() | 4062332 | 0.000 | 0.50× |
| es-toolkit.orderBy | 2052284 | 0.000 | 0.98× |
| fast-multisort | 2016531 | 0.000 | 1.00× |
| remeda.sortBy (different order) | 1792411 | 0.001 | 1.13× |
| Array.prototype.sort, decorated | 1728511 | 0.001 | 1.17× |
| thenby (different order) | 1519713 | 0.001 | 1.33× |
| lodash.orderBy | 1410233 | 0.001 | 1.43× |
| fast-sort (different order) | 1125606 | 0.001 | 1.79× |
| ramda.sortWith (different order) | 1057311 | 0.001 | 1.91× |
| sort-array (different order) | 829032 | 0.001 | 2.43× |
| sort-on (different order) | 170617 | 0.006 | 11.82× |
| natural-orderby (different order) | 79708 | 0.013 | 25.30× |
| sort-by (different order) | 22449 | 0.045 | 89.83× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 387984 | 0.003 | 1.00× |
| inline comparator chain, toSorted() | 230621 | 0.004 | 1.68× |
| inline comparator chain, slice().sort() | 228117 | 0.004 | 1.70× |
| underscore.sortBy | 135324 | 0.007 | 2.87× |
| thenby | 115121 | 0.009 | 3.37× |
| fast-sort | 101201 | 0.010 | 3.83× |
| lodash.orderBy | 99670 | 0.010 | 3.89× |
| es-toolkit.orderBy | 99542 | 0.010 | 3.90× |
| Array.prototype.sort, decorated | 86545 | 0.012 | 4.48× |
| remeda.sortBy | 83630 | 0.012 | 4.64× |
| ramda.sortWith | 52060 | 0.019 | 7.45× |
| sort-array | 44770 | 0.022 | 8.67× |
| just-sort-by (different order) | 40069 | 0.025 | 9.68× |
| natural-orderby (different order) | 23978 | 0.042 | 16.18× |
| sort-on (different order) | 9151 | 0.109 | 42.40× |
| sort-by | 1163 | 0.860 | 333.67× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 169219 | 0.006 | 0.98× |
| fast-multisort | 166430 | 0.006 | 1.00× |
| inline comparator chain, slice().sort() | 163265 | 0.006 | 1.02× |
| thenby | 97073 | 0.010 | 1.71× |
| underscore.sortBy | 92706 | 0.011 | 1.80× |
| es-toolkit.orderBy | 86977 | 0.011 | 1.91× |
| fast-sort | 83612 | 0.012 | 1.99× |
| remeda.sortBy | 77097 | 0.013 | 2.16× |
| lodash.orderBy | 72049 | 0.014 | 2.31× |
| Array.prototype.sort, decorated | 67636 | 0.015 | 2.46× |
| ramda.sortWith | 46750 | 0.021 | 3.56× |
| sort-array | 35499 | 0.028 | 4.69× |
| just-sort-by (different order) | 33507 | 0.030 | 4.97× |
| natural-orderby (different order) | 9245 | 0.108 | 18.00× |
| sort-on (different order) | 7458 | 0.134 | 22.32× |
| sort-by | 1111 | 0.900 | 149.78× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 269852 | 0.004 | 0.86× |
| inline comparator chain, slice().sort() | 259067 | 0.004 | 0.90× |
| fast-multisort | 232838 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 158299 | 0.006 | 1.47× |
| just-sort-by (different order) | 144550 | 0.007 | 1.61× |
| fast-sort | 122153 | 0.008 | 1.91× |
| thenby (different order) | 119873 | 0.008 | 1.94× |
| es-toolkit.orderBy | 114705 | 0.009 | 2.03× |
| lodash.orderBy | 102110 | 0.010 | 2.28× |
| remeda.sortBy (different order) | 99926 | 0.010 | 2.33× |
| Array.prototype.sort, decorated | 94075 | 0.011 | 2.48× |
| ramda.sortWith (different order) | 55648 | 0.018 | 4.18× |
| sort-array | 48816 | 0.020 | 4.77× |
| natural-orderby | 26422 | 0.038 | 8.81× |
| sort-on | 9338 | 0.107 | 24.93× |
| sort-by (different order) | 1141 | 0.876 | 204.03× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 249626 | 0.004 | 0.80× |
| inline comparator chain, slice().sort() | 235633 | 0.004 | 0.85× |
| fast-multisort | 199863 | 0.005 | 1.00× |
| underscore.sortBy | 147018 | 0.007 | 1.36× |
| thenby | 112600 | 0.009 | 1.77× |
| just-sort-by | 111745 | 0.009 | 1.79× |
| fast-sort | 100750 | 0.010 | 1.98× |
| es-toolkit.orderBy | 97731 | 0.010 | 2.05× |
| remeda.sortBy | 93119 | 0.011 | 2.15× |
| lodash.orderBy | 91174 | 0.011 | 2.19× |
| Array.prototype.sort, decorated | 82267 | 0.012 | 2.43× |
| ramda.sortWith | 52505 | 0.019 | 3.81× |
| sort-array | 43323 | 0.023 | 4.61× |
| natural-orderby | 22006 | 0.045 | 9.08× |
| sort-on | 8231 | 0.121 | 24.28× |
| sort-by | 1088 | 0.919 | 183.72× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 190155 | 0.005 | 0.67× |
| inline comparator chain, slice().sort() | 185590 | 0.005 | 0.69× |
| fast-multisort | 127422 | 0.008 | 1.00× |
| thenby | 98985 | 0.010 | 1.29× |
| underscore.sortBy | 93616 | 0.011 | 1.36× |
| es-toolkit.orderBy | 89468 | 0.011 | 1.42× |
| fast-sort | 87468 | 0.011 | 1.46× |
| remeda.sortBy | 77946 | 0.013 | 1.63× |
| lodash.orderBy | 73838 | 0.014 | 1.73× |
| Array.prototype.sort, decorated | 73102 | 0.014 | 1.74× |
| just-sort-by | 54039 | 0.019 | 2.36× |
| ramda.sortWith | 47934 | 0.021 | 2.66× |
| sort-array | 38863 | 0.026 | 3.28× |
| natural-orderby | 15603 | 0.064 | 8.17× |
| sort-on | 7021 | 0.142 | 18.15× |
| sort-by | 1047 | 0.956 | 121.76× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1773032 | 0.001 | 0.83× |
| fast-multisort | 1466171 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1462096 | 0.001 | 1.00× |
| just-sort-by | 830842 | 0.001 | 1.76× |
| thenby | 736131 | 0.001 | 1.99× |
| fast-sort | 646368 | 0.002 | 2.27× |
| remeda.sortBy | 645220 | 0.002 | 2.27× |
| es-toolkit.orderBy | 634005 | 0.002 | 2.31× |
| Array.prototype.sort, decorated | 525858 | 0.002 | 2.79× |
| underscore.sortBy | 469704 | 0.002 | 3.12× |
| lodash.orderBy | 365949 | 0.003 | 4.01× |
| ramda.sortWith | 327238 | 0.003 | 4.48× |
| sort-array | 292044 | 0.003 | 5.02× |
| sort-on | 46391 | 0.022 | 31.60× |
| natural-orderby | 33823 | 0.030 | 43.35× |
| sort-by | 6007 | 0.166 | 244.06× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1667710 | 0.001 | 0.87× |
| fast-multisort | 1450187 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1374908 | 0.001 | 1.05× |
| just-sort-by | 806309 | 0.001 | 1.80× |
| thenby | 734777 | 0.001 | 1.97× |
| fast-sort | 667586 | 0.001 | 2.17× |
| es-toolkit.orderBy | 633013 | 0.002 | 2.29× |
| remeda.sortBy | 527601 | 0.002 | 2.75× |
| Array.prototype.sort, decorated | 522545 | 0.002 | 2.78× |
| underscore.sortBy | 437724 | 0.002 | 3.31× |
| lodash.orderBy | 338180 | 0.003 | 4.29× |
| ramda.sortWith | 318713 | 0.003 | 4.55× |
| sort-array | 298963 | 0.003 | 4.85× |
| sort-on | 41416 | 0.024 | 35.01× |
| natural-orderby | 33498 | 0.030 | 43.29× |
| sort-by | 5902 | 0.169 | 245.72× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1042723 | 0.001 | 0.75× |
| inline comparator chain, slice().sort() | 930430 | 0.001 | 0.84× |
| fast-multisort | 784713 | 0.001 | 1.00× |
| just-sort-by | 499646 | 0.002 | 1.57× |
| thenby | 421443 | 0.002 | 1.86× |
| fast-sort | 374821 | 0.003 | 2.09× |
| remeda.sortBy | 374150 | 0.003 | 2.10× |
| underscore.sortBy | 372443 | 0.003 | 2.11× |
| es-toolkit.orderBy | 362825 | 0.003 | 2.16× |
| Array.prototype.sort, decorated | 306745 | 0.003 | 2.56× |
| lodash.orderBy | 272080 | 0.004 | 2.88× |
| ramda.sortWith | 188738 | 0.005 | 4.16× |
| sort-array | 160524 | 0.006 | 4.89× |
| natural-orderby | 31859 | 0.031 | 24.63× |
| sort-on | 28046 | 0.036 | 27.98× |
| sort-by | 3563 | 0.281 | 220.25× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 193571 | 0.005 | 0.52× |
| inline comparator chain, slice().sort() | 181966 | 0.005 | 0.55× |
| fast-multisort | 100213 | 0.010 | 1.00× |
| lodash.orderBy | 75215 | 0.013 | 1.33× |
| es-toolkit.orderBy | 69087 | 0.014 | 1.45× |
| remeda.sortBy (different order) | 60139 | 0.017 | 1.67× |
| Array.prototype.sort, decorated | 58957 | 0.017 | 1.70× |
| thenby (different order) | 54393 | 0.018 | 1.84× |
| fast-sort (different order) | 49228 | 0.020 | 2.04× |
| ramda.sortWith (different order) | 38270 | 0.026 | 2.62× |
| sort-array (different order) | 28865 | 0.035 | 3.47× |
| natural-orderby (different order) | 6338 | 0.158 | 15.81× |
| sort-on (different order) | 5273 | 0.190 | 19.01× |
| sort-by (different order) | 644 | 1.552 | 155.57× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 38709 | 0.026 | 1.00× |
| inline comparator chain, slice().sort() | 14183 | 0.071 | 2.73× |
| inline comparator chain, toSorted() | 13921 | 0.072 | 2.78× |
| underscore.sortBy | 8557 | 0.117 | 4.52× |
| thenby | 7304 | 0.137 | 5.30× |
| es-toolkit.orderBy | 6681 | 0.150 | 5.79× |
| fast-sort | 6568 | 0.152 | 5.89× |
| lodash.orderBy | 6182 | 0.162 | 6.26× |
| Array.prototype.sort, decorated | 6139 | 0.163 | 6.31× |
| remeda.sortBy | 5118 | 0.195 | 7.56× |
| ramda.sortWith | 3593 | 0.278 | 10.77× |
| sort-array | 3177 | 0.315 | 12.19× |
| just-sort-by (different order) | 2842 | 0.352 | 13.62× |
| natural-orderby (different order) | 1902 | 0.526 | 20.36× |
| sort-on (different order) | 634 | 1.578 | 61.07× |
| sort-by | 84 | 11.867 | 459.35× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11180 | 0.089 | 1.00× |
| inline comparator chain, toSorted() | 8048 | 0.124 | 1.39× |
| inline comparator chain, slice().sort() | 7859 | 0.127 | 1.42× |
| underscore.sortBy | 5238 | 0.191 | 2.13× |
| thenby | 5145 | 0.194 | 2.17× |
| fast-sort | 4740 | 0.211 | 2.36× |
| es-toolkit.orderBy | 4720 | 0.212 | 2.37× |
| remeda.sortBy | 4288 | 0.233 | 2.61× |
| lodash.orderBy | 4070 | 0.246 | 2.75× |
| Array.prototype.sort, decorated | 3974 | 0.252 | 2.81× |
| ramda.sortWith | 2806 | 0.356 | 3.98× |
| sort-array | 2220 | 0.450 | 5.04× |
| just-sort-by (different order) | 2134 | 0.469 | 5.24× |
| natural-orderby (different order) | 679 | 1.472 | 16.46× |
| sort-on (different order) | 459 | 2.176 | 24.33× |
| sort-by | 69 | 14.591 | 163.12× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30106 | 0.033 | 1.00× |
| inline comparator chain, slice().sort() | 14956 | 0.067 | 2.01× |
| inline comparator chain, toSorted() | 14792 | 0.068 | 2.04× |
| underscore.sortBy (different order) | 9551 | 0.105 | 3.15× |
| just-sort-by (different order) | 7891 | 0.127 | 3.82× |
| fast-sort | 7350 | 0.136 | 4.10× |
| thenby (different order) | 7151 | 0.140 | 4.21× |
| es-toolkit.orderBy | 6900 | 0.145 | 4.36× |
| lodash.orderBy | 6400 | 0.156 | 4.70× |
| remeda.sortBy (different order) | 6158 | 0.162 | 4.89× |
| Array.prototype.sort, decorated | 6097 | 0.164 | 4.94× |
| ramda.sortWith (different order) | 3545 | 0.282 | 8.49× |
| sort-array | 3150 | 0.317 | 9.56× |
| natural-orderby | 2113 | 0.473 | 14.25× |
| sort-on | 591 | 1.693 | 50.96× |
| sort-by (different order) | 72 | 13.864 | 417.39× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 25904 | 0.039 | 1.00× |
| inline comparator chain, toSorted() | 10557 | 0.095 | 2.45× |
| inline comparator chain, slice().sort() | 10150 | 0.099 | 2.55× |
| underscore.sortBy | 7164 | 0.140 | 3.62× |
| fast-sort | 5467 | 0.183 | 4.74× |
| es-toolkit.orderBy | 5371 | 0.186 | 4.82× |
| just-sort-by | 5339 | 0.187 | 4.85× |
| thenby | 5243 | 0.191 | 4.94× |
| lodash.orderBy | 5098 | 0.196 | 5.08× |
| remeda.sortBy | 5058 | 0.198 | 5.12× |
| Array.prototype.sort, decorated | 4508 | 0.222 | 5.75× |
| ramda.sortWith | 2945 | 0.340 | 8.79× |
| sort-array | 2330 | 0.429 | 11.12× |
| natural-orderby | 1355 | 0.738 | 19.11× |
| sort-on | 430 | 2.326 | 60.25× |
| sort-by | 60 | 16.777 | 434.59× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11304 | 0.088 | 1.00× |
| inline comparator chain, toSorted() | 9386 | 0.107 | 1.20× |
| inline comparator chain, slice().sort() | 8929 | 0.112 | 1.27× |
| underscore.sortBy | 5588 | 0.179 | 2.02× |
| thenby | 5531 | 0.181 | 2.04× |
| fast-sort | 5045 | 0.198 | 2.24× |
| es-toolkit.orderBy | 5000 | 0.200 | 2.26× |
| remeda.sortBy | 4567 | 0.219 | 2.48× |
| Array.prototype.sort, decorated | 4394 | 0.228 | 2.57× |
| lodash.orderBy | 4363 | 0.229 | 2.59× |
| just-sort-by | 3385 | 0.295 | 3.34× |
| ramda.sortWith | 2923 | 0.342 | 3.87× |
| sort-array | 2422 | 0.413 | 4.67× |
| natural-orderby | 1362 | 0.734 | 8.30× |
| sort-on | 443 | 2.259 | 25.53× |
| sort-by | 66 | 15.050 | 170.12× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 185263 | 0.005 | 0.78× |
| inline comparator chain, slice().sort() | 151601 | 0.007 | 0.95× |
| fast-multisort | 144441 | 0.007 | 1.00× |
| just-sort-by | 86076 | 0.012 | 1.68× |
| thenby | 76396 | 0.013 | 1.89× |
| fast-sort | 70082 | 0.014 | 2.06× |
| es-toolkit.orderBy | 65079 | 0.015 | 2.22× |
| remeda.sortBy | 64980 | 0.015 | 2.22× |
| Array.prototype.sort, decorated | 52742 | 0.019 | 2.74× |
| underscore.sortBy | 48151 | 0.021 | 3.00× |
| lodash.orderBy | 38145 | 0.026 | 3.79× |
| ramda.sortWith | 33134 | 0.030 | 4.36× |
| sort-array | 29214 | 0.034 | 4.94× |
| sort-on | 4655 | 0.215 | 31.03× |
| natural-orderby | 3347 | 0.299 | 43.16× |
| sort-by | 605 | 1.653 | 238.78× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 171637 | 0.006 | 0.80× |
| inline comparator chain, slice().sort() | 140502 | 0.007 | 0.98× |
| fast-multisort | 137983 | 0.007 | 1.00× |
| just-sort-by | 82041 | 0.012 | 1.68× |
| thenby | 74748 | 0.013 | 1.85× |
| fast-sort | 67501 | 0.015 | 2.04× |
| es-toolkit.orderBy | 63373 | 0.016 | 2.18× |
| Array.prototype.sort, decorated | 51863 | 0.019 | 2.66× |
| remeda.sortBy | 51455 | 0.019 | 2.68× |
| underscore.sortBy | 43719 | 0.023 | 3.16× |
| lodash.orderBy | 33799 | 0.030 | 4.08× |
| sort-array | 30333 | 0.033 | 4.55× |
| ramda.sortWith | 30294 | 0.033 | 4.55× |
| sort-on | 3978 | 0.251 | 34.69× |
| natural-orderby | 3222 | 0.310 | 42.83× |
| sort-by | 569 | 1.758 | 242.59× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 160120 | 0.006 | 0.63× |
| inline comparator chain, slice().sort() | 131933 | 0.008 | 0.77× |
| fast-multisort | 101465 | 0.010 | 1.00× |
| just-sort-by | 78144 | 0.013 | 1.30× |
| thenby | 69297 | 0.014 | 1.46× |
| fast-sort | 65558 | 0.015 | 1.55× |
| es-toolkit.orderBy | 60332 | 0.017 | 1.68× |
| remeda.sortBy | 59837 | 0.017 | 1.70× |
| Array.prototype.sort, decorated | 48409 | 0.021 | 2.10× |
| underscore.sortBy | 45291 | 0.022 | 2.24× |
| lodash.orderBy | 36355 | 0.028 | 2.79× |
| ramda.sortWith | 31372 | 0.032 | 3.23× |
| sort-array | 26739 | 0.037 | 3.79× |
| sort-on | 4682 | 0.214 | 21.67× |
| natural-orderby | 3310 | 0.302 | 30.65× |
| sort-by | 598 | 1.673 | 169.80× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12091 | 0.083 | 1.00× |
| inline comparator chain, toSorted() | 11439 | 0.087 | 1.06× |
| inline comparator chain, slice().sort() | 11389 | 0.088 | 1.06× |
| lodash.orderBy | 5079 | 0.197 | 2.38× |
| es-toolkit.orderBy | 4118 | 0.243 | 2.94× |
| Array.prototype.sort, decorated | 3882 | 0.258 | 3.11× |
| thenby (different order) | 3699 | 0.270 | 3.27× |
| remeda.sortBy (different order) | 3654 | 0.274 | 3.31× |
| fast-sort (different order) | 3077 | 0.325 | 3.93× |
| ramda.sortWith (different order) | 2328 | 0.429 | 5.19× |
| sort-array (different order) | 1832 | 0.546 | 6.60× |
| natural-orderby (different order) | 693 | 1.444 | 17.46× |
| sort-on (different order) | 378 | 2.644 | 31.97× |
| sort-by (different order) | 42 | 23.749 | 287.17× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4245 | 0.236 | 1.00× |
| inline comparator chain, toSorted() | 1208 | 0.828 | 3.51× |
| inline comparator chain, slice().sort() | 1199 | 0.834 | 3.54× |
| underscore.sortBy | 823 | 1.215 | 5.16× |
| thenby | 757 | 1.320 | 5.60× |
| fast-sort | 699 | 1.430 | 6.07× |
| es-toolkit.orderBy | 679 | 1.473 | 6.26× |
| lodash.orderBy | 624 | 1.601 | 6.80× |
| Array.prototype.sort, decorated | 613 | 1.631 | 6.93× |
| remeda.sortBy | 563 | 1.776 | 7.54× |
| ramda.sortWith | 385 | 2.596 | 11.02× |
| sort-array | 341 | 2.933 | 12.45× |
| just-sort-by (different order) | 284 | 3.519 | 14.94× |
| natural-orderby (different order) | 201 | 4.964 | 21.08× |
| sort-on (different order) | 68 | 14.615 | 62.05× |
| sort-by | 9 | 114.401 | 485.69× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 763 | 1.310 | 1.00× |
| inline comparator chain, toSorted() | 436 | 2.293 | 1.75× |
| inline comparator chain, slice().sort() | 429 | 2.333 | 1.78× |
| thenby | 329 | 3.035 | 2.32× |
| underscore.sortBy | 327 | 3.062 | 2.34× |
| fast-sort | 313 | 3.194 | 2.44× |
| es-toolkit.orderBy | 306 | 3.264 | 2.49× |
| remeda.sortBy | 281 | 3.557 | 2.72× |
| Array.prototype.sort, decorated | 264 | 3.788 | 2.89× |
| lodash.orderBy | 255 | 3.922 | 2.99× |
| ramda.sortWith | 192 | 5.206 | 3.97× |
| sort-array | 161 | 6.196 | 4.73× |
| just-sort-by (different order) | 151 | 6.635 | 5.06× |
| natural-orderby (different order) | 52 | 19.114 | 14.59× |
| sort-on (different order) | 33 | 30.243 | 23.09× |
| sort-by | 5 | 203.562 | 155.38× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3251 | 0.308 | 1.00× |
| inline comparator chain, slice().sort() | 864 | 1.158 | 3.76× |
| inline comparator chain, toSorted() | 826 | 1.210 | 3.93× |
| underscore.sortBy (different order) | 653 | 1.531 | 4.98× |
| just-sort-by (different order) | 543 | 1.843 | 5.99× |
| thenby (different order) | 536 | 1.865 | 6.06× |
| fast-sort | 503 | 1.988 | 6.46× |
| es-toolkit.orderBy | 467 | 2.139 | 6.95× |
| remeda.sortBy (different order) | 448 | 2.231 | 7.25× |
| Array.prototype.sort, decorated | 417 | 2.396 | 7.79× |
| lodash.orderBy | 384 | 2.603 | 8.46× |
| ramda.sortWith (different order) | 252 | 3.970 | 12.91× |
| sort-array | 218 | 4.577 | 14.88× |
| natural-orderby | 143 | 6.972 | 22.67× |
| sort-on | 41 | 24.636 | 80.09× |
| sort-by (different order) | 5 | 196.625 | 639.20× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3163 | 0.316 | 1.00× |
| inline comparator chain, toSorted() | 638 | 1.568 | 4.96× |
| inline comparator chain, slice().sort() | 636 | 1.572 | 4.97× |
| underscore.sortBy | 576 | 1.736 | 5.49× |
| just-sort-by | 427 | 2.343 | 7.41× |
| thenby | 426 | 2.347 | 7.42× |
| fast-sort | 417 | 2.397 | 7.58× |
| remeda.sortBy | 384 | 2.602 | 8.23× |
| es-toolkit.orderBy | 372 | 2.690 | 8.51× |
| lodash.orderBy | 330 | 3.030 | 9.58× |
| Array.prototype.sort, decorated | 322 | 3.107 | 9.83× |
| ramda.sortWith | 219 | 4.569 | 14.45× |
| sort-array | 192 | 5.212 | 16.49× |
| natural-orderby | 115 | 8.671 | 27.43× |
| sort-on | 34 | 29.027 | 91.82× |
| sort-by | 5 | 209.103 | 661.45× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 720 | 1.389 | 1.00× |
| inline comparator chain, toSorted() | 474 | 2.108 | 1.52× |
| inline comparator chain, slice().sort() | 471 | 2.124 | 1.53× |
| underscore.sortBy | 364 | 2.750 | 1.98× |
| thenby | 350 | 2.856 | 2.06× |
| fast-sort | 330 | 3.034 | 2.18× |
| es-toolkit.orderBy | 326 | 3.071 | 2.21× |
| remeda.sortBy | 297 | 3.365 | 2.42× |
| Array.prototype.sort, decorated | 287 | 3.483 | 2.51× |
| lodash.orderBy | 245 | 4.075 | 2.93× |
| just-sort-by | 233 | 4.284 | 3.08× |
| ramda.sortWith | 192 | 5.216 | 3.76× |
| sort-array | 174 | 5.736 | 4.13× |
| natural-orderby | 92 | 10.844 | 7.81× |
| sort-on | 31 | 32.666 | 23.52× |
| sort-by | 5 | 208.233 | 149.94× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 18524 | 0.054 | 0.78× |
| inline comparator chain, slice().sort() | 14714 | 0.068 | 0.98× |
| fast-multisort | 14398 | 0.069 | 1.00× |
| just-sort-by | 8142 | 0.123 | 1.77× |
| thenby | 7481 | 0.134 | 1.92× |
| fast-sort | 7030 | 0.142 | 2.05× |
| es-toolkit.orderBy | 6518 | 0.153 | 2.21× |
| remeda.sortBy | 6429 | 0.156 | 2.24× |
| Array.prototype.sort, decorated | 5152 | 0.194 | 2.79× |
| underscore.sortBy | 4651 | 0.215 | 3.10× |
| lodash.orderBy | 3475 | 0.288 | 4.14× |
| ramda.sortWith | 3250 | 0.308 | 4.43× |
| sort-array | 2867 | 0.349 | 5.02× |
| sort-on | 456 | 2.194 | 31.59× |
| natural-orderby | 272 | 3.673 | 52.89× |
| sort-by | 59 | 16.888 | 243.16× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 17339 | 0.058 | 0.80× |
| inline comparator chain, slice().sort() | 13953 | 0.072 | 0.99× |
| fast-multisort | 13826 | 0.072 | 1.00× |
| just-sort-by | 8073 | 0.124 | 1.71× |
| thenby | 7484 | 0.134 | 1.85× |
| fast-sort | 7159 | 0.140 | 1.93× |
| es-toolkit.orderBy | 6357 | 0.157 | 2.17× |
| remeda.sortBy | 5291 | 0.189 | 2.61× |
| Array.prototype.sort, decorated | 5006 | 0.200 | 2.76× |
| underscore.sortBy | 4303 | 0.232 | 3.21× |
| lodash.orderBy | 3142 | 0.318 | 4.40× |
| ramda.sortWith | 3139 | 0.319 | 4.40× |
| sort-array | 2984 | 0.335 | 4.63× |
| sort-on | 408 | 2.452 | 33.90× |
| natural-orderby | 275 | 3.631 | 50.21× |
| sort-by | 58 | 17.268 | 238.76× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 15619 | 0.064 | 0.62× |
| inline comparator chain, slice().sort() | 12212 | 0.082 | 0.79× |
| fast-multisort | 9650 | 0.104 | 1.00× |
| just-sort-by | 7312 | 0.137 | 1.32× |
| thenby | 6636 | 0.151 | 1.45× |
| fast-sort | 6325 | 0.158 | 1.53× |
| es-toolkit.orderBy | 5949 | 0.168 | 1.62× |
| remeda.sortBy | 5945 | 0.168 | 1.62× |
| Array.prototype.sort, decorated | 4471 | 0.224 | 2.16× |
| underscore.sortBy | 4127 | 0.242 | 2.34× |
| lodash.orderBy | 3087 | 0.324 | 3.13× |
| ramda.sortWith | 3075 | 0.325 | 3.14× |
| sort-array | 2614 | 0.383 | 3.69× |
| sort-on | 457 | 2.187 | 21.10× |
| natural-orderby | 259 | 3.868 | 37.32× |
| sort-by | 59 | 17.084 | 164.86× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1301 | 0.769 | 1.00× |
| inline comparator chain, toSorted() | 604 | 1.655 | 2.15× |
| inline comparator chain, slice().sort() | 594 | 1.684 | 2.19× |
| lodash.orderBy | 272 | 3.677 | 4.78× |
| es-toolkit.orderBy | 266 | 3.755 | 4.88× |
| Array.prototype.sort, decorated | 252 | 3.968 | 5.16× |
| thenby (different order) | 243 | 4.109 | 5.34× |
| remeda.sortBy (different order) | 235 | 4.249 | 5.53× |
| fast-sort (different order) | 200 | 4.988 | 6.49× |
| ramda.sortWith (different order) | 152 | 6.599 | 8.58× |
| sort-array (different order) | 119 | 8.401 | 10.93× |
| natural-orderby (different order) | 48 | 20.753 | 27.00× |
| sort-on (different order) | 24 | 40.872 | 53.17× |
| sort-by (different order) | 3 | 372.773 | 484.90× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 355 | 2.815 | 1.00× |
| inline comparator chain, toSorted() | 103 | 9.679 | 3.44× |
| inline comparator chain, slice().sort() | 100 | 9.961 | 3.54× |
| thenby | 69 | 14.406 | 5.12× |
| fast-sort | 62 | 16.002 | 5.69× |
| es-toolkit.orderBy | 62 | 16.119 | 5.73× |
| underscore.sortBy | 62 | 16.132 | 5.73× |
| remeda.sortBy | 51 | 19.478 | 6.92× |
| lodash.orderBy | 51 | 19.718 | 7.01× |
| Array.prototype.sort, decorated | 42 | 23.695 | 8.42× |
| ramda.sortWith | 34 | 29.432 | 10.46× |
| sort-array | 32 | 31.002 | 11.01× |
| just-sort-by (different order) | 24 | 41.237 | 14.65× |
| natural-orderby (different order) | 16 | 62.436 | 22.18× |
| sort-on (different order) | 7 | 153.121 | 54.40× |
| sort-by | 1 | 1339.547 | 475.93× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 39 | 25.743 | 1.00× |
| inline comparator chain, toSorted() | 23 | 43.883 | 1.70× |
| inline comparator chain, slice().sort() | 22 | 44.584 | 1.73× |
| underscore.sortBy | 19 | 53.407 | 2.07× |
| thenby | 16 | 62.098 | 2.41× |
| fast-sort | 15 | 64.984 | 2.52× |
| es-toolkit.orderBy | 14 | 73.823 | 2.87× |
| remeda.sortBy | 13 | 75.724 | 2.94× |
| lodash.orderBy | 12 | 84.405 | 3.28× |
| Array.prototype.sort, decorated | 11 | 90.143 | 3.50× |
| ramda.sortWith | 11 | 94.364 | 3.67× |
| just-sort-by (different order) | 8 | 122.022 | 4.74× |
| sort-array | 8 | 126.947 | 4.93× |
| sort-on (different order) | 2 | 450.289 | 17.49× |
| natural-orderby (different order) | 2 | 521.660 | 20.26× |
| sort-by | 0 | 2951.585 | 114.66× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 291 | 3.439 | 1.00× |
| inline comparator chain, toSorted() | 62 | 16.239 | 4.72× |
| inline comparator chain, slice().sort() | 60 | 16.667 | 4.85× |
| underscore.sortBy (different order) | 50 | 19.876 | 5.78× |
| thenby (different order) | 40 | 25.157 | 7.31× |
| just-sort-by (different order) | 38 | 26.212 | 7.62× |
| fast-sort | 36 | 27.567 | 8.02× |
| es-toolkit.orderBy | 33 | 30.277 | 8.80× |
| remeda.sortBy (different order) | 32 | 30.979 | 9.01× |
| lodash.orderBy | 27 | 37.110 | 10.79× |
| Array.prototype.sort, decorated | 24 | 41.751 | 12.14× |
| ramda.sortWith (different order) | 18 | 56.828 | 16.52× |
| sort-array | 17 | 60.228 | 17.51× |
| natural-orderby | 12 | 80.955 | 23.54× |
| sort-on | 3 | 304.516 | 88.55× |
| sort-by (different order) | 0 | 2310.752 | 671.91× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 294 | 3.406 | 1.00× |
| inline comparator chain, toSorted() | 46 | 21.675 | 6.36× |
| inline comparator chain, slice().sort() | 45 | 22.017 | 6.46× |
| underscore.sortBy | 43 | 23.384 | 6.87× |
| thenby | 29 | 34.216 | 10.05× |
| fast-sort | 29 | 35.036 | 10.29× |
| just-sort-by | 27 | 37.227 | 10.93× |
| es-toolkit.orderBy | 26 | 38.950 | 11.44× |
| remeda.sortBy | 25 | 40.094 | 11.77× |
| lodash.orderBy | 22 | 44.624 | 13.10× |
| Array.prototype.sort, decorated | 17 | 57.372 | 16.84× |
| ramda.sortWith | 15 | 65.684 | 19.28× |
| sort-array | 13 | 74.469 | 21.86× |
| natural-orderby | 9 | 109.315 | 32.09× |
| sort-on | 3 | 378.865 | 111.23× |
| sort-by | 0 | 2521.040 | 740.16× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 44 | 22.941 | 1.00× |
| inline comparator chain, slice().sort() | 27 | 37.557 | 1.64× |
| inline comparator chain, toSorted() | 25 | 40.122 | 1.75× |
| underscore.sortBy | 22 | 44.858 | 1.96× |
| thenby | 21 | 48.743 | 2.12× |
| es-toolkit.orderBy | 18 | 55.485 | 2.42× |
| fast-sort | 18 | 56.638 | 2.47× |
| remeda.sortBy | 17 | 59.311 | 2.59× |
| Array.prototype.sort, decorated | 14 | 69.041 | 3.01× |
| just-sort-by | 13 | 75.165 | 3.28× |
| lodash.orderBy | 13 | 77.175 | 3.36× |
| ramda.sortWith | 11 | 88.049 | 3.84× |
| sort-array | 10 | 99.020 | 4.32× |
| natural-orderby | 7 | 136.625 | 5.96× |
| sort-on | 2 | 438.801 | 19.13× |
| sort-by | 0 | 2602.055 | 113.42× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1627 | 0.615 | 0.74× |
| inline comparator chain, slice().sort() | 1260 | 0.794 | 0.96× |
| fast-multisort | 1209 | 0.827 | 1.00× |
| just-sort-by | 793 | 1.260 | 1.52× |
| thenby | 719 | 1.391 | 1.68× |
| fast-sort | 683 | 1.464 | 1.77× |
| es-toolkit.orderBy | 620 | 1.614 | 1.95× |
| remeda.sortBy | 543 | 1.840 | 2.22× |
| underscore.sortBy | 423 | 2.366 | 2.86× |
| ramda.sortWith | 323 | 3.096 | 3.74× |
| Array.prototype.sort, decorated | 322 | 3.102 | 3.75× |
| lodash.orderBy | 292 | 3.426 | 4.14× |
| sort-array | 271 | 3.691 | 4.46× |
| sort-on | 45 | 22.349 | 27.02× |
| natural-orderby | 27 | 37.313 | 45.11× |
| sort-by | 6 | 162.875 | 196.90× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1448 | 0.691 | 0.79× |
| fast-multisort | 1140 | 0.877 | 1.00× |
| inline comparator chain, slice().sort() | 1102 | 0.907 | 1.03× |
| just-sort-by | 743 | 1.345 | 1.53× |
| thenby | 712 | 1.405 | 1.60× |
| fast-sort | 662 | 1.511 | 1.72× |
| es-toolkit.orderBy | 595 | 1.681 | 1.92× |
| remeda.sortBy | 440 | 2.275 | 2.59× |
| Array.prototype.sort, decorated | 365 | 2.739 | 3.12× |
| underscore.sortBy | 343 | 2.916 | 3.33× |
| ramda.sortWith | 306 | 3.269 | 3.73× |
| sort-array | 274 | 3.655 | 4.17× |
| lodash.orderBy | 265 | 3.776 | 4.31× |
| sort-on | 39 | 25.578 | 29.17× |
| natural-orderby | 26 | 38.040 | 43.38× |
| sort-by | 6 | 172.604 | 196.83× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1321 | 0.757 | 0.70× |
| inline comparator chain, slice().sort() | 1232 | 0.812 | 0.75× |
| fast-multisort | 920 | 1.087 | 1.00× |
| just-sort-by | 764 | 1.309 | 1.20× |
| thenby | 679 | 1.472 | 1.35× |
| fast-sort | 644 | 1.552 | 1.43× |
| es-toolkit.orderBy | 591 | 1.691 | 1.56× |
| remeda.sortBy | 509 | 1.963 | 1.81× |
| underscore.sortBy | 418 | 2.391 | 2.20× |
| ramda.sortWith | 318 | 3.149 | 2.90× |
| lodash.orderBy | 294 | 3.404 | 3.13× |
| Array.prototype.sort, decorated | 279 | 3.583 | 3.30× |
| sort-array | 255 | 3.920 | 3.61× |
| sort-on | 46 | 21.914 | 20.17× |
| natural-orderby | 26 | 38.396 | 35.34× |
| sort-by | 6 | 158.657 | 146.01× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 114 | 8.768 | 1.00× |
| inline comparator chain, toSorted() | 43 | 23.307 | 2.66× |
| inline comparator chain, slice().sort() | 43 | 23.314 | 2.66× |
| lodash.orderBy | 20 | 49.091 | 5.60× |
| es-toolkit.orderBy | 20 | 51.073 | 5.82× |
| thenby (different order) | 18 | 56.469 | 6.44× |
| remeda.sortBy (different order) | 17 | 58.207 | 6.64× |
| Array.prototype.sort, decorated | 16 | 63.270 | 7.22× |
| fast-sort (different order) | 14 | 70.369 | 8.03× |
| ramda.sortWith (different order) | 11 | 90.947 | 10.37× |
| sort-array (different order) | 9 | 115.282 | 13.15× |
| natural-orderby (different order) | 5 | 214.235 | 24.43× |
| sort-on (different order) | 2 | 526.580 | 60.05× |
| sort-by (different order) | 0 | 4583.495 | 522.73× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 36 | 27.405 | 1.00× |
| inline comparator chain, toSorted() | 10 | 102.017 | 3.72× |
| inline comparator chain, slice().sort() | 10 | 103.093 | 3.76× |
| thenby | 7 | 145.117 | 5.30× |
| fast-sort | 6 | 156.208 | 5.70× |
| underscore.sortBy | 6 | 156.792 | 5.72× |
| es-toolkit.orderBy | 6 | 166.350 | 6.07× |
| remeda.sortBy | 5 | 195.295 | 7.13× |
| lodash.orderBy | 5 | 206.592 | 7.54× |
| Array.prototype.sort, decorated | 4 | 269.483 | 9.83× |
| ramda.sortWith | 4 | 283.302 | 10.34× |
| sort-array | 3 | 303.273 | 11.07× |
| just-sort-by (different order) | 3 | 391.598 | 14.29× |
| natural-orderby (different order) | 1 | 711.999 | 25.98× |
| sort-on (different order) | 1 | 1583.027 | 57.76× |
| sort-by | 0 | 11766.561 | 429.36× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 506.133 | 1.00× |
| inline comparator chain, slice().sort() | 1 | 886.619 | 1.75× |
| inline comparator chain, toSorted() | 1 | 886.699 | 1.75× |
| underscore.sortBy | 1 | 1230.777 | 2.43× |
| es-toolkit.orderBy | 1 | 1308.590 | 2.59× |
| thenby | 1 | 1313.521 | 2.60× |
| remeda.sortBy | 1 | 1433.904 | 2.83× |
| fast-sort | 1 | 1552.830 | 3.07× |
| lodash.orderBy | 1 | 1882.789 | 3.72× |
| Array.prototype.sort, decorated | 1 | 1883.782 | 3.72× |
| ramda.sortWith | 0 | 2022.273 | 4.00× |
| sort-array | 0 | 2625.639 | 5.19× |
| just-sort-by (different order) | 0 | 2646.222 | 5.23× |
| sort-on (different order) | 0 | 6750.424 | 13.34× |
| natural-orderby (different order) | 0 | 6766.185 | 13.37× |
| sort-by | 0 | 34725.420 | 68.61× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14 | 73.527 | 1.00× |
| inline comparator chain, toSorted() | 3 | 395.596 | 5.38× |
| inline comparator chain, slice().sort() | 2 | 400.131 | 5.44× |
| thenby (different order) | 2 | 527.555 | 7.18× |
| underscore.sortBy (different order) | 2 | 543.057 | 7.39× |
| fast-sort | 2 | 587.911 | 8.00× |
| just-sort-by (different order) | 2 | 621.661 | 8.45× |
| remeda.sortBy (different order) | 2 | 651.725 | 8.86× |
| es-toolkit.orderBy | 2 | 660.901 | 8.99× |
| lodash.orderBy | 1 | 985.584 | 13.40× |
| ramda.sortWith (different order) | 1 | 1080.232 | 14.69× |
| Array.prototype.sort, decorated | 1 | 1322.618 | 17.99× |
| sort-array | 1 | 1425.939 | 19.39× |
| natural-orderby | 1 | 1561.443 | 21.24× |
| sort-on | 0 | 4466.529 | 60.75× |
| sort-by (different order) | 0 | 30656.307 | 416.94× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 17 | 58.841 | 1.00× |
| inline comparator chain, toSorted() | 2 | 448.688 | 7.63× |
| inline comparator chain, slice().sort() | 2 | 449.716 | 7.64× |
| thenby | 1 | 716.638 | 12.18× |
| fast-sort | 1 | 741.388 | 12.60× |
| underscore.sortBy | 1 | 797.449 | 13.55× |
| es-toolkit.orderBy | 1 | 1236.481 | 21.01× |
| just-sort-by | 1 | 1324.235 | 22.51× |
| remeda.sortBy | 1 | 1436.136 | 24.41× |
| ramda.sortWith | 1 | 1505.014 | 25.58× |
| sort-array | 1 | 1635.606 | 27.80× |
| Array.prototype.sort, decorated | 1 | 1837.712 | 31.23× |
| lodash.orderBy | 0 | 2334.117 | 39.67× |
| natural-orderby | 0 | 2784.280 | 47.32× |
| sort-on | 0 | 5568.155 | 94.63× |
| sort-by | 0 | 45532.935 | 773.83× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 566.203 | 1.00× |
| inline comparator chain, toSorted() | 1 | 736.906 | 1.30× |
| inline comparator chain, slice().sort() | 1 | 744.263 | 1.31× |
| underscore.sortBy | 1 | 878.600 | 1.55× |
| thenby | 1 | 960.431 | 1.70× |
| fast-sort | 1 | 1051.946 | 1.86× |
| es-toolkit.orderBy | 1 | 1085.394 | 1.92× |
| remeda.sortBy | 1 | 1108.784 | 1.96× |
| ramda.sortWith | 1 | 1532.101 | 2.71× |
| Array.prototype.sort, decorated | 1 | 1573.598 | 2.78× |
| lodash.orderBy | 1 | 1595.705 | 2.82× |
| just-sort-by | 1 | 1650.214 | 2.91× |
| sort-array | 1 | 1854.706 | 3.28× |
| natural-orderby | 0 | 2724.966 | 4.81× |
| sort-on | 0 | 6162.460 | 10.88× |
| sort-by | 0 | 33759.723 | 59.62× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 151 | 6.625 | 0.81× |
| fast-multisort | 122 | 8.211 | 1.00× |
| just-sort-by | 76 | 13.227 | 1.61× |
| inline comparator chain, slice().sort() | 73 | 13.690 | 1.67× |
| thenby | 67 | 14.901 | 1.81× |
| fast-sort | 61 | 16.336 | 1.99× |
| es-toolkit.orderBy | 58 | 17.245 | 2.10× |
| remeda.sortBy | 48 | 21.029 | 2.56× |
| ramda.sortWith | 31 | 32.341 | 3.94× |
| underscore.sortBy | 29 | 34.765 | 4.23× |
| sort-array | 27 | 37.595 | 4.58× |
| Array.prototype.sort, decorated | 26 | 38.157 | 4.65× |
| lodash.orderBy | 16 | 63.954 | 7.79× |
| sort-on | 4 | 234.765 | 28.59× |
| natural-orderby | 2 | 422.699 | 51.48× |
| sort-by | 0 | 2299.503 | 280.05× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 144 | 6.949 | 0.82× |
| fast-multisort | 118 | 8.508 | 1.00× |
| inline comparator chain, slice().sort() | 96 | 10.470 | 1.23× |
| just-sort-by | 74 | 13.509 | 1.59× |
| thenby | 69 | 14.526 | 1.71× |
| fast-sort | 67 | 15.007 | 1.76× |
| es-toolkit.orderBy | 59 | 16.870 | 1.98× |
| remeda.sortBy | 45 | 22.368 | 2.63× |
| underscore.sortBy | 29 | 34.432 | 4.05× |
| ramda.sortWith | 28 | 35.109 | 4.13× |
| Array.prototype.sort, decorated | 28 | 35.410 | 4.16× |
| sort-array | 28 | 36.087 | 4.24× |
| lodash.orderBy | 17 | 58.036 | 6.82× |
| sort-on | 4 | 247.821 | 29.13× |
| natural-orderby | 3 | 392.482 | 46.13× |
| sort-by | 1 | 1650.419 | 193.98× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 117 | 8.579 | 0.82× |
| inline comparator chain, toSorted() | 104 | 9.644 | 0.92× |
| fast-multisort | 95 | 10.514 | 1.00× |
| just-sort-by | 72 | 13.871 | 1.32× |
| thenby | 64 | 15.531 | 1.48× |
| fast-sort | 61 | 16.386 | 1.56× |
| es-toolkit.orderBy | 55 | 18.116 | 1.72× |
| remeda.sortBy | 51 | 19.623 | 1.87× |
| ramda.sortWith | 28 | 36.243 | 3.45× |
| underscore.sortBy | 25 | 40.322 | 3.84× |
| sort-array | 23 | 42.710 | 4.06× |
| lodash.orderBy | 18 | 56.509 | 5.37× |
| Array.prototype.sort, decorated | 15 | 68.351 | 6.50× |
| sort-on | 5 | 215.475 | 20.49× |
| natural-orderby | 2 | 412.841 | 39.27× |
| sort-by | 1 | 1658.750 | 157.77× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 8 | 118.855 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 527.927 | 4.44× |
| inline comparator chain, toSorted() | 2 | 542.424 | 4.56× |
| es-toolkit.orderBy | 1 | 1015.435 | 8.54× |
| thenby (different order) | 1 | 1146.603 | 9.65× |
| remeda.sortBy (different order) | 1 | 1153.367 | 9.70× |
| fast-sort (different order) | 1 | 1336.574 | 11.25× |
| lodash.orderBy | 1 | 1380.906 | 11.62× |
| Array.prototype.sort, decorated | 1 | 1551.529 | 13.05× |
| ramda.sortWith (different order) | 1 | 1566.115 | 13.18× |
| sort-array (different order) | 1 | 1924.110 | 16.19× |
| natural-orderby (different order) | 0 | 3587.301 | 30.18× |
| sort-on (different order) | 0 | 7985.590 | 67.19× |
| sort-by (different order) | 0 | 67030.958 | 563.97× |

</details>

<!-- bench:end -->

### Browsers

Same data, sizes, cases and libraries as above, each result checked against lodash before timing, best competitor per case (`pnpm bench:browsers`). Chromium and WebKit are Playwright's builds; Firefox is the installed `/Applications/Firefox.app` driven over WebDriver BiDi (Playwright's own Firefox build does not start on macOS 27), with Playwright's Firefox as the fallback. Firefox stops at 100k rows: at a million, sort-by and sort-on take minutes per call in SpiderMonkey and one case ran for 44 minutes, while fast-multisort sorts a million rows there in 11 to 674 ms. Apple M5 Max.

<!-- browsers:start -->

#### Chromium 156.0.8078.4

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, slice().sort() | 0.46× | 0.98× | 8.02× | 63 | 0 |
| inline comparator chain, toSorted() | 0.45× | 1.60× | 7.91× | 63 | 0 |
| just-sort-by | 0.32× | 1.92× | 12.54× | 56 | 17 |
| es-toolkit.orderBy | 0.91× | 2.07× | 13.63× | 63 | 0 |
| thenby | 0.92× | 2.20× | 11.94× | 63 | 12 |
| Array.prototype.sort, decorated | 0.95× | 2.81× | 20.80× | 63 | 0 |
| fast-sort | 1.09× | 2.91× | 12.93× | 63 | 6 |
| remeda.sortBy | 0.96× | 2.96× | 14.16× | 63 | 12 |
| ramda.sortWith | 1.27× | 2.98× | 15.16× | 63 | 12 |
| underscore.sortBy | 1.02× | 3.14× | 8.49× | 56 | 6 |
| lodash.orderBy | 1.35× | 4.18× | 20.02× | 63 | 0 |
| sort-array | 1.40× | 4.83× | 23.38× | 63 | 6 |
| natural-orderby | 4.44× | 21.88× | 89.18× | 63 | 17 |
| sort-on | 1.14× | 23.03× | 86.90× | 63 | 17 |
| sort-by | 3.12× | 152.89× | 602.26× | 63 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 346636694 | 0.000 | 0.32× |
| fast-multisort | 111254748 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105916768 | 0.000 | 1.05× |
| sort-on | 87381333 | 0.000 | 1.27× |
| es-toolkit.orderBy | 87018755 | 0.000 | 1.28× |
| Array.prototype.sort, decorated | 65331838 | 0.000 | 1.70× |
| thenby | 47021345 | 0.000 | 2.37× |
| inline comparator chain, toSorted() | 37583369 | 0.000 | 2.96× |
| ramda.sortWith | 36535749 | 0.000 | 3.05× |
| underscore.sortBy | 32870721 | 0.000 | 3.38× |
| fast-sort | 32665919 | 0.000 | 3.41× |
| remeda.sortBy | 32665919 | 0.000 | 3.41× |
| sort-by | 31968780 | 0.000 | 3.48× |
| sort-array | 31300776 | 0.000 | 3.55× |
| lodash.orderBy | 24049908 | 0.000 | 4.63× |
| natural-orderby | 4766255 | 0.000 | 23.34× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 281496913 | 0.000 | 0.35× |
| inline comparator chain, slice().sort() | 101311691 | 0.000 | 0.97× |
| fast-multisort | 97997757 | 0.000 | 1.00× |
| sort-on | 83220317 | 0.000 | 1.18× |
| es-toolkit.orderBy | 80350651 | 0.000 | 1.22× |
| Array.prototype.sort, decorated | 61862891 | 0.000 | 1.58× |
| thenby | 44620255 | 0.000 | 2.20× |
| inline comparator chain, toSorted() | 36157793 | 0.000 | 2.71× |
| ramda.sortWith | 35424865 | 0.000 | 2.77× |
| remeda.sortBy | 32665919 | 0.000 | 3.00× |
| fast-sort | 31022959 | 0.000 | 3.16× |
| sort-array | 30393507 | 0.000 | 3.22× |
| sort-by | 30305665 | 0.000 | 3.23× |
| underscore.sortBy | 29371877 | 0.000 | 3.34× |
| lodash.orderBy | 19636255 | 0.000 | 4.99× |
| natural-orderby | 1956299 | 0.001 | 50.09× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 280555451 | 0.000 | 0.36× |
| inline comparator chain, slice().sort() | 101311691 | 0.000 | 1.00× |
| fast-multisort | 100824615 | 0.000 | 1.00× |
| sort-on | 83551872 | 0.000 | 1.21× |
| es-toolkit.orderBy | 80659692 | 0.000 | 1.25× |
| Array.prototype.sort, decorated | 62230030 | 0.000 | 1.62× |
| thenby | 44810940 | 0.000 | 2.25× |
| inline comparator chain, toSorted() | 36157793 | 0.000 | 2.79× |
| ramda.sortWith | 35544949 | 0.000 | 2.84× |
| remeda.sortBy | 32564472 | 0.000 | 3.10× |
| fast-sort | 31022959 | 0.000 | 3.25× |
| sort-by | 30570729 | 0.000 | 3.30× |
| sort-array | 30481860 | 0.000 | 3.31× |
| underscore.sortBy | 29454382 | 0.000 | 3.42× |
| lodash.orderBy | 20010992 | 0.000 | 5.04× |
| natural-orderby | 3552087 | 0.000 | 28.38× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 272357402 | 0.000 | 0.35× |
| inline comparator chain, slice().sort() | 99864381 | 0.000 | 0.94× |
| fast-multisort | 94042691 | 0.000 | 1.00× |
| sort-on | 80971120 | 0.000 | 1.16× |
| es-toolkit.orderBy | 79739620 | 0.000 | 1.18× |
| Array.prototype.sort, decorated | 61680941 | 0.000 | 1.52× |
| thenby | 44243713 | 0.000 | 2.13× |
| inline comparator chain, toSorted() | 35910137 | 0.000 | 2.62× |
| ramda.sortWith | 35305589 | 0.000 | 2.66× |
| remeda.sortBy | 31775030 | 0.000 | 2.96× |
| fast-sort | 30840471 | 0.000 | 3.05× |
| sort-array | 30218329 | 0.000 | 3.11× |
| sort-by | 30131494 | 0.000 | 3.12× |
| underscore.sortBy | 28807033 | 0.000 | 3.26× |
| lodash.orderBy | 19134599 | 0.000 | 4.91× |
| natural-orderby | 3181359 | 0.000 | 29.56× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 264624858 | 0.000 | 0.35× |
| inline comparator chain, slice().sort() | 96642949 | 0.000 | 0.95× |
| fast-multisort | 91980351 | 0.000 | 1.00× |
| sort-on | 79137811 | 0.000 | 1.16× |
| es-toolkit.orderBy | 77101177 | 0.000 | 1.19× |
| Array.prototype.sort, decorated | 61141458 | 0.000 | 1.50× |
| thenby | 43151276 | 0.000 | 2.13× |
| ramda.sortWith | 34721060 | 0.000 | 2.65× |
| inline comparator chain, toSorted() | 33934498 | 0.000 | 2.71× |
| remeda.sortBy | 31022959 | 0.000 | 2.96× |
| fast-sort | 30840471 | 0.000 | 2.98× |
| sort-by | 29454382 | 0.000 | 3.12× |
| sort-array | 29454382 | 0.000 | 3.12× |
| underscore.sortBy | 28493913 | 0.000 | 3.23× |
| lodash.orderBy | 18995942 | 0.000 | 4.84× |
| natural-orderby | 2162904 | 0.000 | 42.53× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 262144000 | 0.000 | 0.35× |
| inline comparator chain, slice().sort() | 96642949 | 0.000 | 0.95× |
| fast-multisort | 91578690 | 0.000 | 1.00× |
| sort-on | 80043969 | 0.000 | 1.14× |
| es-toolkit.orderBy | 75709458 | 0.000 | 1.21× |
| Array.prototype.sort, decorated | 60611329 | 0.000 | 1.51× |
| thenby | 43329587 | 0.000 | 2.11× |
| ramda.sortWith | 34606469 | 0.000 | 2.65× |
| inline comparator chain, toSorted() | 34155570 | 0.000 | 2.68× |
| remeda.sortBy | 31207619 | 0.000 | 2.93× |
| fast-sort | 30660117 | 0.000 | 2.99× |
| sort-by | 29289832 | 0.000 | 3.13× |
| sort-array | 29046427 | 0.000 | 3.15× |
| underscore.sortBy | 28649617 | 0.000 | 3.20× |
| lodash.orderBy | 18859281 | 0.000 | 4.86× |
| natural-orderby | 3821341 | 0.000 | 23.97× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 282444714 | 0.000 | 0.36× |
| inline comparator chain, slice().sort() | 102300098 | 0.000 | 0.98× |
| fast-multisort | 100342201 | 0.000 | 1.00× |
| sort-on | 84562581 | 0.000 | 1.19× |
| es-toolkit.orderBy | 81920000 | 0.000 | 1.22× |
| Array.prototype.sort, decorated | 63167229 | 0.000 | 1.59× |
| thenby | 45590261 | 0.000 | 2.20× |
| inline comparator chain, toSorted() | 36408889 | 0.000 | 2.76× |
| ramda.sortWith | 36282907 | 0.000 | 2.77× |
| remeda.sortBy | 33182785 | 0.000 | 3.02× |
| fast-sort | 31871611 | 0.000 | 3.15× |
| sort-by | 30660117 | 0.000 | 3.27× |
| sort-array | 30481860 | 0.000 | 3.29× |
| underscore.sortBy | 30045158 | 0.000 | 3.34× |
| lodash.orderBy | 20164923 | 0.000 | 4.98× |
| natural-orderby | 4020613 | 0.000 | 24.96× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 283398919 | 0.000 | 0.36× |
| fast-multisort | 103307980 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103307980 | 0.000 | 1.00× |
| sort-on | 84904939 | 0.000 | 1.22× |
| es-toolkit.orderBy | 82241255 | 0.000 | 1.26× |
| Array.prototype.sort, decorated | 63358066 | 0.000 | 1.63× |
| thenby | 45590261 | 0.000 | 2.27× |
| inline comparator chain, toSorted() | 36663496 | 0.000 | 2.82× |
| ramda.sortWith | 36282907 | 0.000 | 2.85× |
| remeda.sortBy | 33288127 | 0.000 | 3.10× |
| fast-sort | 31871611 | 0.000 | 3.24× |
| sort-by | 30931445 | 0.000 | 3.34× |
| sort-array | 30750029 | 0.000 | 3.36× |
| underscore.sortBy | 29704703 | 0.000 | 3.48× |
| lodash.orderBy | 19934905 | 0.000 | 5.18× |
| natural-orderby | 3369460 | 0.000 | 30.66× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 101803495 | 0.000 | 0.98× |
| fast-multisort | 99391090 | 0.000 | 1.00× |
| sort-on | 83551873 | 0.000 | 1.19× |
| es-toolkit.orderBy | 81920000 | 0.000 | 1.21× |
| Array.prototype.sort, decorated | 62977538 | 0.000 | 1.58× |
| inline comparator chain, toSorted() | 36282907 | 0.000 | 2.74× |
| sort-array | 30660117 | 0.000 | 3.24× |
| sort-by | 27094987 | 0.000 | 3.67× |
| ramda.sortWith | 21487213 | 0.000 | 4.63× |
| remeda.sortBy | 17893788 | 0.000 | 5.55× |
| lodash.orderBy | 15603810 | 0.000 | 6.37× |
| thenby | 13943830 | 0.000 | 7.13× |
| fast-sort | 7687507 | 0.000 | 12.93× |
| natural-orderby | 1114558 | 0.001 | 89.18× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 5221992 | 0.000 | 0.78× |
| inline comparator chain, slice().sort() | 5080310 | 0.000 | 0.80× |
| thenby | 4443119 | 0.000 | 0.92× |
| Array.prototype.sort, decorated | 4283399 | 0.000 | 0.95× |
| remeda.sortBy | 4228129 | 0.000 | 0.96× |
| es-toolkit.orderBy | 4187604 | 0.000 | 0.97× |
| fast-multisort | 4070559 | 0.000 | 1.00× |
| fast-sort | 3723636 | 0.000 | 1.09× |
| underscore.sortBy | 3181359 | 0.000 | 1.28× |
| sort-array | 2899823 | 0.000 | 1.40× |
| ramda.sortWith | 2887048 | 0.000 | 1.41× |
| lodash.orderBy | 2267682 | 0.000 | 1.80× |
| just-sort-by (different order) | 1552986 | 0.001 | 2.62× |
| natural-orderby (different order) | 388246 | 0.003 | 10.48× |
| sort-on (different order) | 298978 | 0.003 | 13.61× |
| sort-by | 38067 | 0.026 | 106.93× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 3971879 | 0.000 | 0.71× |
| inline comparator chain, slice().sort() | 3877870 | 0.000 | 0.73× |
| thenby | 2824828 | 0.000 | 1.00× |
| fast-multisort | 2812704 | 0.000 | 1.00× |
| remeda.sortBy | 2753613 | 0.000 | 1.02× |
| es-toolkit.orderBy | 2664065 | 0.000 | 1.06× |
| fast-sort | 2580157 | 0.000 | 1.09× |
| underscore.sortBy | 2427259 | 0.000 | 1.16× |
| ramda.sortWith | 2087134 | 0.000 | 1.35× |
| Array.prototype.sort, decorated | 2054420 | 0.000 | 1.37× |
| lodash.orderBy | 1830615 | 0.001 | 1.54× |
| just-sort-by | 1250687 | 0.001 | 2.25× |
| sort-array | 1200293 | 0.001 | 2.34× |
| sort-on | 240235 | 0.004 | 11.71× |
| natural-orderby | 147338 | 0.007 | 19.09× |
| sort-by | 36571 | 0.027 | 76.91× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6271388 | 0.000 | 0.55× |
| inline comparator chain, slice().sort() | 6153615 | 0.000 | 0.56× |
| just-sort-by (different order) | 4214534 | 0.000 | 0.82× |
| thenby (different order) | 3552087 | 0.000 | 0.97× |
| fast-multisort | 3458364 | 0.000 | 1.00× |
| es-toolkit.orderBy | 3449263 | 0.000 | 1.00× |
| remeda.sortBy (different order) | 3268628 | 0.000 | 1.06× |
| fast-sort | 3105972 | 0.000 | 1.11× |
| underscore.sortBy (different order) | 3062430 | 0.000 | 1.13× |
| Array.prototype.sort, decorated | 2719336 | 0.000 | 1.27× |
| ramda.sortWith (different order) | 2590356 | 0.000 | 1.34× |
| lodash.orderBy | 2148721 | 0.000 | 1.61× |
| sort-array | 1545660 | 0.001 | 2.24× |
| natural-orderby | 381023 | 0.003 | 9.08× |
| sort-on | 334367 | 0.003 | 10.34× |
| sort-by (different order) | 41457 | 0.024 | 83.42× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 5625408 | 0.000 | 0.54× |
| inline comparator chain, slice().sort() | 5221992 | 0.000 | 0.58× |
| just-sort-by | 3150769 | 0.000 | 0.97× |
| fast-multisort | 3048186 | 0.000 | 1.00× |
| thenby | 2824828 | 0.000 | 1.08× |
| remeda.sortBy | 2788766 | 0.000 | 1.09× |
| underscore.sortBy | 2788766 | 0.000 | 1.09× |
| es-toolkit.orderBy | 2685902 | 0.000 | 1.13× |
| fast-sort | 2374493 | 0.000 | 1.28× |
| Array.prototype.sort, decorated | 2162904 | 0.000 | 1.41× |
| ramda.sortWith | 1998049 | 0.001 | 1.53× |
| lodash.orderBy | 1800440 | 0.001 | 1.69× |
| sort-array | 1133841 | 0.001 | 2.69× |
| natural-orderby | 321255 | 0.003 | 9.49× |
| sort-on | 239532 | 0.004 | 12.73× |
| sort-by | 33684 | 0.030 | 90.49× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4748986 | 0.000 | 0.58× |
| inline comparator chain, slice().sort() | 4535363 | 0.000 | 0.61× |
| thenby | 2874386 | 0.000 | 0.97× |
| fast-multisort | 2776949 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2730667 | 0.000 | 1.02× |
| remeda.sortBy | 2600635 | 0.000 | 1.07× |
| fast-sort | 2400586 | 0.000 | 1.16× |
| underscore.sortBy | 2348961 | 0.000 | 1.18× |
| Array.prototype.sort, decorated | 2267682 | 0.000 | 1.22× |
| ramda.sortWith | 2191839 | 0.000 | 1.27× |
| just-sort-by | 1933215 | 0.001 | 1.44× |
| lodash.orderBy | 1697824 | 0.001 | 1.64× |
| sort-array | 1280000 | 0.001 | 2.17× |
| sort-on | 235402 | 0.004 | 11.80× |
| natural-orderby | 219625 | 0.005 | 12.64× |
| sort-by | 37786 | 0.026 | 73.49× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12725437 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 9198035 | 0.000 | 1.38× |
| inline comparator chain, slice().sort() | 8826397 | 0.000 | 1.44× |
| just-sort-by | 4369067 | 0.000 | 2.91× |
| thenby | 3600879 | 0.000 | 3.53× |
| underscore.sortBy | 3571444 | 0.000 | 3.56× |
| es-toolkit.orderBy | 3485957 | 0.000 | 3.65× |
| remeda.sortBy | 3268628 | 0.000 | 3.89× |
| Array.prototype.sort, decorated | 2992511 | 0.000 | 4.25× |
| fast-sort | 2824828 | 0.000 | 4.50× |
| ramda.sortWith | 2550039 | 0.000 | 4.99× |
| lodash.orderBy | 2436283 | 0.000 | 5.22× |
| sort-array | 1689072 | 0.001 | 7.53× |
| natural-orderby | 426667 | 0.002 | 29.83× |
| sort-on | 320000 | 0.003 | 39.77× |
| sort-by | 43025 | 0.023 | 295.77× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13173065 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 6068148 | 0.000 | 2.17× |
| inline comparator chain, slice().sort() | 5877668 | 0.000 | 2.24× |
| just-sort-by | 3610799 | 0.000 | 3.65× |
| thenby | 3091321 | 0.000 | 4.26× |
| es-toolkit.orderBy | 2938834 | 0.000 | 4.48× |
| remeda.sortBy | 2742092 | 0.000 | 4.80× |
| underscore.sortBy | 2742092 | 0.000 | 4.80× |
| fast-sort | 2463759 | 0.000 | 5.35× |
| Array.prototype.sort, decorated | 2409412 | 0.000 | 5.47× |
| ramda.sortWith | 2035280 | 0.000 | 6.47× |
| lodash.orderBy | 1805399 | 0.001 | 7.30× |
| sort-array | 1342951 | 0.001 | 9.81× |
| natural-orderby | 410627 | 0.002 | 32.08× |
| sort-on | 219037 | 0.005 | 60.14× |
| sort-by | 31900 | 0.031 | 412.94× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 7241547 | 0.000 | 0.45× |
| inline comparator chain, slice().sort() | 6971915 | 0.000 | 0.46× |
| just-sort-by | 3620773 | 0.000 | 0.89× |
| fast-multisort | 3228374 | 0.000 | 1.00× |
| underscore.sortBy | 3150769 | 0.000 | 1.02× |
| remeda.sortBy | 3034074 | 0.000 | 1.06× |
| thenby | 3006239 | 0.000 | 1.07× |
| es-toolkit.orderBy | 2952072 | 0.000 | 1.09× |
| fast-sort | 2570039 | 0.000 | 1.26× |
| Array.prototype.sort, decorated | 2570039 | 0.000 | 1.26× |
| ramda.sortWith | 2307606 | 0.000 | 1.40× |
| lodash.orderBy | 2073924 | 0.000 | 1.56× |
| sort-array | 1365333 | 0.001 | 2.36× |
| natural-orderby | 405545 | 0.002 | 7.96× |
| sort-on | 304535 | 0.003 | 10.60× |
| sort-by | 39084 | 0.026 | 82.60× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4872565 | 0.000 | 0.46× |
| inline comparator chain, slice().sort() | 4854519 | 0.000 | 0.46× |
| es-toolkit.orderBy | 2463759 | 0.000 | 0.91× |
| fast-multisort | 2252096 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 2048000 | 0.000 | 1.10× |
| remeda.sortBy (different order) | 2004159 | 0.000 | 1.12× |
| thenby (different order) | 1820444 | 0.001 | 1.24× |
| ramda.sortWith (different order) | 1747627 | 0.001 | 1.29× |
| fast-sort (different order) | 1510046 | 0.001 | 1.49× |
| lodash.orderBy | 1496256 | 0.001 | 1.51× |
| sort-array (different order) | 955335 | 0.001 | 2.36× |
| sort-on (different order) | 243086 | 0.004 | 9.26× |
| natural-orderby (different order) | 106667 | 0.009 | 21.11× |
| sort-by (different order) | 32201 | 0.031 | 69.94× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 395749 | 0.003 | 1.00× |
| inline comparator chain, toSorted() | 247492 | 0.004 | 1.60× |
| inline comparator chain, slice().sort() | 240235 | 0.004 | 1.65× |
| underscore.sortBy | 146810 | 0.007 | 2.70× |
| thenby | 120826 | 0.008 | 3.28× |
| fast-sort | 107225 | 0.009 | 3.69× |
| es-toolkit.orderBy | 105026 | 0.010 | 3.77× |
| lodash.orderBy | 100887 | 0.010 | 3.92× |
| Array.prototype.sort, decorated | 97062 | 0.010 | 4.08× |
| remeda.sortBy | 83252 | 0.012 | 4.75× |
| ramda.sortWith | 76704 | 0.013 | 5.16× |
| just-sort-by (different order) | 54180 | 0.018 | 7.30× |
| sort-array | 47407 | 0.021 | 8.35× |
| natural-orderby (different order) | 28603 | 0.035 | 13.84× |
| sort-on (different order) | 12308 | 0.081 | 32.15× |
| sort-by | 1546 | 0.647 | 256.00× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 174298 | 0.006 | 1.00× |
| inline comparator chain, toSorted() | 161897 | 0.006 | 1.08× |
| inline comparator chain, slice().sort() | 160627 | 0.006 | 1.09× |
| thenby | 96150 | 0.010 | 1.81× |
| underscore.sortBy | 91022 | 0.011 | 1.91× |
| es-toolkit.orderBy | 87897 | 0.011 | 1.98× |
| fast-sort | 86780 | 0.012 | 2.01× |
| remeda.sortBy | 73405 | 0.014 | 2.37× |
| Array.prototype.sort, decorated | 73405 | 0.014 | 2.37× |
| lodash.orderBy | 66710 | 0.015 | 2.61× |
| ramda.sortWith | 63801 | 0.016 | 2.73× |
| just-sort-by (different order) | 44138 | 0.023 | 3.95× |
| sort-array | 37647 | 0.027 | 4.63× |
| natural-orderby (different order) | 10449 | 0.096 | 16.68× |
| sort-on (different order) | 9275 | 0.108 | 18.79× |
| sort-by | 1397 | 0.716 | 124.73× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 266840 | 0.004 | 0.94× |
| inline comparator chain, toSorted() | 265974 | 0.004 | 0.94× |
| fast-multisort | 249756 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 160627 | 0.006 | 1.55× |
| just-sort-by (different order) | 147870 | 0.007 | 1.69× |
| fast-sort | 126031 | 0.008 | 1.98× |
| thenby (different order) | 124878 | 0.008 | 2.00× |
| es-toolkit.orderBy | 116364 | 0.009 | 2.15× |
| remeda.sortBy (different order) | 104490 | 0.010 | 2.39× |
| Array.prototype.sort, decorated | 100887 | 0.010 | 2.48× |
| lodash.orderBy | 99417 | 0.010 | 2.51× |
| ramda.sortWith (different order) | 80949 | 0.012 | 3.09× |
| sort-array | 50196 | 0.020 | 4.98× |
| natural-orderby | 32303 | 0.031 | 7.73× |
| sort-on | 12673 | 0.079 | 19.71× |
| sort-by (different order) | 1569 | 0.637 | 159.22× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 262564 | 0.004 | 0.79× |
| inline comparator chain, slice().sort() | 243086 | 0.004 | 0.85× |
| fast-multisort | 206348 | 0.005 | 1.00× |
| underscore.sortBy | 151704 | 0.007 | 1.36× |
| thenby | 107789 | 0.009 | 1.91× |
| just-sort-by | 107225 | 0.009 | 1.92× |
| fast-sort | 99417 | 0.010 | 2.08× |
| es-toolkit.orderBy | 96604 | 0.010 | 2.14× |
| remeda.sortBy | 94815 | 0.011 | 2.18× |
| lodash.orderBy | 89043 | 0.011 | 2.32× |
| Array.prototype.sort, decorated | 87149 | 0.011 | 2.37× |
| ramda.sortWith | 72367 | 0.014 | 2.85× |
| sort-array | 46545 | 0.021 | 4.43× |
| natural-orderby | 27453 | 0.036 | 7.52× |
| sort-on | 10894 | 0.092 | 18.94× |
| sort-by | 1517 | 0.659 | 136.06× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 206869 | 0.005 | 0.63× |
| inline comparator chain, slice().sort() | 201773 | 0.005 | 0.64× |
| fast-multisort | 130032 | 0.008 | 1.00× |
| thenby | 112219 | 0.009 | 1.16× |
| underscore.sortBy | 110703 | 0.009 | 1.17× |
| fast-sort | 100392 | 0.010 | 1.30× |
| es-toolkit.orderBy | 98937 | 0.010 | 1.31× |
| Array.prototype.sort, decorated | 88276 | 0.011 | 1.47× |
| remeda.sortBy | 85333 | 0.012 | 1.52× |
| lodash.orderBy | 76704 | 0.013 | 1.70× |
| ramda.sortWith | 72367 | 0.014 | 1.80× |
| just-sort-by | 66494 | 0.015 | 1.96× |
| sort-array | 43574 | 0.023 | 2.98× |
| natural-orderby | 19692 | 0.051 | 6.60× |
| sort-on | 9377 | 0.107 | 13.87× |
| sort-by | 1481 | 0.675 | 87.77× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2236724 | 0.000 | 0.71× |
| inline comparator chain, slice().sort() | 1861818 | 0.001 | 0.86× |
| fast-multisort | 1598439 | 0.001 | 1.00× |
| just-sort-by | 905193 | 0.001 | 1.77× |
| thenby | 815124 | 0.001 | 1.96× |
| fast-sort | 762047 | 0.001 | 2.10× |
| es-toolkit.orderBy | 755023 | 0.001 | 2.12× |
| remeda.sortBy | 731429 | 0.001 | 2.19× |
| Array.prototype.sort, decorated | 568889 | 0.002 | 2.81× |
| underscore.sortBy | 540726 | 0.002 | 2.96× |
| ramda.sortWith | 523450 | 0.002 | 3.05× |
| lodash.orderBy | 409600 | 0.002 | 3.90× |
| sort-array | 307970 | 0.003 | 5.19× |
| sort-on | 63210 | 0.016 | 25.29× |
| natural-orderby | 43761 | 0.023 | 36.53× |
| sort-by | 8339 | 0.120 | 191.69× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2048000 | 0.000 | 0.76× |
| inline comparator chain, slice().sort() | 1702234 | 0.001 | 0.91× |
| fast-multisort | 1552986 | 0.001 | 1.00× |
| just-sort-by | 941609 | 0.001 | 1.65× |
| thenby | 842365 | 0.001 | 1.84× |
| fast-sort | 776493 | 0.001 | 2.00× |
| es-toolkit.orderBy | 772830 | 0.001 | 2.01× |
| remeda.sortBy | 591480 | 0.002 | 2.63× |
| Array.prototype.sort, decorated | 566920 | 0.002 | 2.74× |
| ramda.sortWith | 525128 | 0.002 | 2.96× |
| underscore.sortBy | 494985 | 0.002 | 3.14× |
| lodash.orderBy | 381023 | 0.003 | 4.08× |
| sort-array | 322520 | 0.003 | 4.82× |
| sort-on | 56731 | 0.018 | 27.37× |
| natural-orderby | 43390 | 0.023 | 35.79× |
| sort-by | 8127 | 0.123 | 191.09× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1191564 | 0.001 | 0.55× |
| inline comparator chain, slice().sort() | 1085033 | 0.001 | 0.60× |
| fast-multisort | 652749 | 0.002 | 1.00× |
| just-sort-by | 549799 | 0.002 | 1.19× |
| thenby | 440430 | 0.002 | 1.48× |
| underscore.sortBy | 419028 | 0.002 | 1.56× |
| remeda.sortBy | 409600 | 0.002 | 1.59× |
| fast-sort | 409600 | 0.002 | 1.59× |
| es-toolkit.orderBy | 401569 | 0.002 | 1.63× |
| Array.prototype.sort, decorated | 338512 | 0.003 | 1.93× |
| lodash.orderBy | 297891 | 0.003 | 2.19× |
| ramda.sortWith | 288451 | 0.003 | 2.26× |
| sort-array | 171381 | 0.006 | 3.81× |
| natural-orderby | 41967 | 0.024 | 15.55× |
| sort-on | 39084 | 0.026 | 16.70× |
| sort-by | 4904 | 0.204 | 133.10× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 219625 | 0.005 | 0.50× |
| inline comparator chain, toSorted() | 219625 | 0.005 | 0.50× |
| fast-multisort | 110404 | 0.009 | 1.00× |
| es-toolkit.orderBy | 85690 | 0.012 | 1.29× |
| lodash.orderBy | 81594 | 0.012 | 1.35× |
| Array.prototype.sort, decorated | 76134 | 0.013 | 1.45× |
| remeda.sortBy (different order) | 66494 | 0.015 | 1.66× |
| thenby (different order) | 66278 | 0.015 | 1.67× |
| ramda.sortWith (different order) | 62822 | 0.016 | 1.76× |
| fast-sort (different order) | 59191 | 0.017 | 1.87× |
| sort-array (different order) | 33684 | 0.030 | 3.28× |
| natural-orderby (different order) | 9846 | 0.102 | 11.21× |
| sort-on (different order) | 9176 | 0.109 | 12.03× |
| sort-by (different order) | 1070 | 0.934 | 103.16× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 40474 | 0.025 | 1.00× |
| inline comparator chain, toSorted() | 17840 | 0.056 | 2.27× |
| inline comparator chain, slice().sort() | 17356 | 0.058 | 2.33× |
| underscore.sortBy | 10756 | 0.093 | 3.76× |
| thenby | 8737 | 0.114 | 4.63× |
| fast-sort | 8000 | 0.125 | 5.06× |
| es-toolkit.orderBy | 7711 | 0.130 | 5.25× |
| lodash.orderBy | 7378 | 0.136 | 5.49× |
| Array.prototype.sort, decorated | 7091 | 0.141 | 5.71× |
| remeda.sortBy | 6169 | 0.162 | 6.56× |
| ramda.sortWith | 5899 | 0.170 | 6.86× |
| just-sort-by (different order) | 4156 | 0.241 | 9.74× |
| sort-array | 3721 | 0.269 | 10.88× |
| natural-orderby (different order) | 2530 | 0.395 | 16.00× |
| sort-on (different order) | 970 | 1.031 | 41.74× |
| sort-by | 124 | 8.075 | 326.83× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13690 | 0.073 | 1.00× |
| inline comparator chain, toSorted() | 9242 | 0.108 | 1.48× |
| inline comparator chain, slice().sort() | 9046 | 0.111 | 1.51× |
| underscore.sortBy | 5872 | 0.170 | 2.33× |
| thenby | 5447 | 0.184 | 2.51× |
| fast-sort | 5120 | 0.195 | 2.67× |
| es-toolkit.orderBy | 5039 | 0.198 | 2.72× |
| remeda.sortBy | 4555 | 0.220 | 3.01× |
| Array.prototype.sort, decorated | 4491 | 0.223 | 3.05× |
| lodash.orderBy | 4224 | 0.237 | 3.24× |
| ramda.sortWith | 3975 | 0.252 | 3.44× |
| just-sort-by (different order) | 2795 | 0.358 | 4.90× |
| sort-array | 2443 | 0.409 | 5.60× |
| natural-orderby (different order) | 836 | 1.197 | 16.39× |
| sort-on (different order) | 595 | 1.681 | 23.02× |
| sort-by | 93 | 10.750 | 147.17× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30937 | 0.032 | 1.00× |
| inline comparator chain, toSorted() | 14066 | 0.071 | 2.20× |
| inline comparator chain, slice().sort() | 13875 | 0.072 | 2.23× |
| underscore.sortBy (different order) | 9176 | 0.109 | 3.37× |
| just-sort-by (different order) | 7688 | 0.130 | 4.02× |
| fast-sort | 7596 | 0.132 | 4.07× |
| thenby (different order) | 7314 | 0.137 | 4.23× |
| es-toolkit.orderBy | 6995 | 0.143 | 4.42× |
| remeda.sortBy (different order) | 6400 | 0.156 | 4.83× |
| Array.prototype.sort, decorated | 6244 | 0.160 | 4.95× |
| lodash.orderBy | 6214 | 0.161 | 4.98× |
| ramda.sortWith (different order) | 5141 | 0.195 | 6.02× |
| sort-array | 3200 | 0.313 | 9.67× |
| natural-orderby | 2612 | 0.383 | 11.84× |
| sort-on | 827 | 1.209 | 37.41× |
| sort-by (different order) | 99 | 10.150 | 314.01× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 29681 | 0.034 | 1.00× |
| inline comparator chain, toSorted() | 11130 | 0.090 | 2.67× |
| inline comparator chain, slice().sort() | 10407 | 0.096 | 2.85× |
| underscore.sortBy | 8366 | 0.120 | 3.55× |
| thenby | 6275 | 0.159 | 4.73× |
| just-sort-by | 6275 | 0.159 | 4.73× |
| fast-sort | 6038 | 0.166 | 4.92× |
| es-toolkit.orderBy | 5818 | 0.172 | 5.10× |
| remeda.sortBy | 5792 | 0.173 | 5.12× |
| lodash.orderBy | 5424 | 0.184 | 5.47× |
| Array.prototype.sort, decorated | 5401 | 0.185 | 5.50× |
| ramda.sortWith | 4369 | 0.229 | 6.79× |
| sort-array | 2922 | 0.342 | 10.16× |
| natural-orderby | 2238 | 0.447 | 13.26× |
| sort-on | 699 | 1.431 | 42.48× |
| sort-by | 94 | 10.600 | 314.62× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14222 | 0.070 | 1.00× |
| inline comparator chain, toSorted() | 10364 | 0.096 | 1.37× |
| inline comparator chain, slice().sort() | 9846 | 0.102 | 1.44× |
| underscore.sortBy | 6465 | 0.155 | 2.20× |
| thenby | 5714 | 0.175 | 2.49× |
| fast-sort | 5333 | 0.188 | 2.67× |
| es-toolkit.orderBy | 5289 | 0.189 | 2.69× |
| Array.prototype.sort, decorated | 5203 | 0.192 | 2.73× |
| remeda.sortBy | 4776 | 0.209 | 2.98× |
| lodash.orderBy | 4655 | 0.215 | 3.06× |
| ramda.sortWith | 4156 | 0.241 | 3.42× |
| just-sort-by | 3891 | 0.257 | 3.66× |
| sort-array | 2712 | 0.369 | 5.24× |
| natural-orderby | 1711 | 0.584 | 8.31× |
| sort-on | 595 | 1.681 | 23.91× |
| sort-by | 93 | 10.750 | 152.89× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 244537 | 0.004 | 0.68× |
| inline comparator chain, slice().sort() | 196923 | 0.005 | 0.84× |
| fast-multisort | 165161 | 0.006 | 1.00× |
| just-sort-by | 98937 | 0.010 | 1.67× |
| thenby | 87521 | 0.011 | 1.89× |
| fast-sort | 80630 | 0.012 | 2.05× |
| es-toolkit.orderBy | 77871 | 0.013 | 2.12× |
| remeda.sortBy | 75018 | 0.013 | 2.20× |
| Array.prototype.sort, decorated | 56889 | 0.018 | 2.90× |
| underscore.sortBy | 55804 | 0.018 | 2.96× |
| ramda.sortWith | 55202 | 0.018 | 2.99× |
| lodash.orderBy | 42140 | 0.024 | 3.92× |
| sort-array | 31411 | 0.032 | 5.26× |
| sort-on | 6337 | 0.158 | 26.06× |
| natural-orderby | 4339 | 0.230 | 38.06× |
| sort-by | 829 | 1.206 | 199.23× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 222609 | 0.004 | 0.71× |
| inline comparator chain, slice().sort() | 180441 | 0.006 | 0.87× |
| fast-multisort | 157538 | 0.006 | 1.00× |
| just-sort-by | 96604 | 0.010 | 1.63× |
| thenby | 88276 | 0.011 | 1.78× |
| fast-sort | 82915 | 0.012 | 1.90× |
| es-toolkit.orderBy | 79380 | 0.013 | 1.98× |
| remeda.sortBy | 60772 | 0.016 | 2.59× |
| Array.prototype.sort, decorated | 56731 | 0.018 | 2.78× |
| ramda.sortWith | 55956 | 0.018 | 2.82× |
| underscore.sortBy | 51200 | 0.020 | 3.08× |
| lodash.orderBy | 38642 | 0.026 | 4.08× |
| sort-array | 32611 | 0.031 | 4.83× |
| sort-on | 5614 | 0.178 | 28.06× |
| natural-orderby | 4339 | 0.230 | 36.31× |
| sort-by | 804 | 1.244 | 195.94× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 198835 | 0.005 | 0.48× |
| inline comparator chain, slice().sort() | 165161 | 0.006 | 0.58× |
| fast-multisort | 95701 | 0.010 | 1.00× |
| just-sort-by | 88658 | 0.011 | 1.08× |
| thenby | 76992 | 0.013 | 1.24× |
| fast-sort | 72624 | 0.014 | 1.32× |
| es-toolkit.orderBy | 70137 | 0.014 | 1.36× |
| remeda.sortBy | 66928 | 0.015 | 1.43× |
| Array.prototype.sort, decorated | 52112 | 0.019 | 1.84× |
| underscore.sortBy | 51717 | 0.019 | 1.85× |
| ramda.sortWith | 49951 | 0.020 | 1.92× |
| lodash.orderBy | 39234 | 0.025 | 2.44× |
| sort-array | 28209 | 0.035 | 3.39× |
| sort-on | 6514 | 0.154 | 14.69× |
| natural-orderby | 4281 | 0.234 | 22.36× |
| sort-by | 800 | 1.250 | 119.63× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 11636 | 0.086 | 0.98× |
| inline comparator chain, slice().sort() | 11584 | 0.086 | 0.99× |
| fast-multisort | 11429 | 0.087 | 1.00× |
| lodash.orderBy | 4942 | 0.202 | 2.31× |
| es-toolkit.orderBy | 4638 | 0.216 | 2.46× |
| Array.prototype.sort, decorated | 4103 | 0.244 | 2.79× |
| thenby (different order) | 3732 | 0.268 | 3.06× |
| remeda.sortBy (different order) | 3699 | 0.270 | 3.09× |
| ramda.sortWith (different order) | 3575 | 0.280 | 3.20× |
| fast-sort (different order) | 3282 | 0.305 | 3.48× |
| sort-array (different order) | 1934 | 0.517 | 5.91× |
| natural-orderby (different order) | 872 | 1.147 | 13.11× |
| sort-on (different order) | 518 | 1.931 | 22.07× |
| sort-by (different order) | 57 | 17.550 | 200.57× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4183 | 0.239 | 1.00× |
| inline comparator chain, toSorted() | 1203 | 0.831 | 3.48× |
| inline comparator chain, slice().sort() | 1181 | 0.847 | 3.54× |
| underscore.sortBy | 847 | 1.181 | 4.94× |
| thenby | 773 | 1.294 | 5.41× |
| fast-sort | 737 | 1.356 | 5.67× |
| es-toolkit.orderBy | 705 | 1.419 | 5.93× |
| Array.prototype.sort, decorated | 623 | 1.606 | 6.72× |
| lodash.orderBy | 606 | 1.650 | 6.90× |
| remeda.sortBy | 578 | 1.731 | 7.24× |
| ramda.sortWith | 552 | 1.813 | 7.58× |
| just-sort-by (different order) | 385 | 2.600 | 10.88× |
| sort-array | 349 | 2.862 | 11.97× |
| natural-orderby (different order) | 232 | 4.313 | 18.04× |
| sort-on (different order) | 91 | 10.950 | 45.80× |
| sort-by | 12 | 85.800 | 358.90× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1107 | 0.903 | 1.00× |
| inline comparator chain, toSorted() | 453 | 2.206 | 2.44× |
| inline comparator chain, slice().sort() | 448 | 2.231 | 2.47× |
| underscore.sortBy | 369 | 2.713 | 3.00× |
| thenby | 342 | 2.925 | 3.24× |
| fast-sort | 336 | 2.975 | 3.29× |
| es-toolkit.orderBy | 329 | 3.037 | 3.36× |
| remeda.sortBy | 309 | 3.238 | 3.58× |
| Array.prototype.sort, decorated | 291 | 3.438 | 3.81× |
| lodash.orderBy | 275 | 3.637 | 4.03× |
| ramda.sortWith | 272 | 3.675 | 4.07× |
| just-sort-by (different order) | 197 | 5.075 | 5.62× |
| sort-array | 175 | 5.700 | 6.31× |
| natural-orderby (different order) | 62 | 16.100 | 17.83× |
| sort-on (different order) | 43 | 23.500 | 26.02× |
| sort-by | 7 | 150.500 | 166.64× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3469 | 0.288 | 1.00× |
| inline comparator chain, slice().sort() | 877 | 1.141 | 3.96× |
| inline comparator chain, toSorted() | 877 | 1.141 | 3.96× |
| underscore.sortBy (different order) | 684 | 1.463 | 5.07× |
| fast-sort | 550 | 1.819 | 6.31× |
| just-sort-by (different order) | 550 | 1.819 | 6.31× |
| thenby (different order) | 544 | 1.837 | 6.37× |
| es-toolkit.orderBy | 500 | 2.000 | 6.94× |
| remeda.sortBy (different order) | 485 | 2.063 | 7.15× |
| Array.prototype.sort, decorated | 469 | 2.131 | 7.39× |
| lodash.orderBy | 456 | 2.194 | 7.61× |
| ramda.sortWith (different order) | 377 | 2.650 | 9.19× |
| sort-array | 238 | 4.200 | 14.57× |
| natural-orderby | 208 | 4.813 | 16.69× |
| sort-on | 60 | 16.600 | 57.58× |
| sort-by (different order) | 7 | 138.300 | 479.74× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3342 | 0.299 | 1.00× |
| inline comparator chain, toSorted() | 648 | 1.544 | 5.16× |
| inline comparator chain, slice().sort() | 632 | 1.581 | 5.28× |
| underscore.sortBy | 599 | 1.669 | 5.58× |
| just-sort-by | 440 | 2.275 | 7.60× |
| thenby | 437 | 2.287 | 7.64× |
| fast-sort | 437 | 2.288 | 7.64× |
| remeda.sortBy | 418 | 2.394 | 8.00× |
| es-toolkit.orderBy | 417 | 2.400 | 8.02× |
| lodash.orderBy | 390 | 2.563 | 8.56× |
| Array.prototype.sort, decorated | 379 | 2.637 | 8.81× |
| ramda.sortWith | 321 | 3.112 | 10.40× |
| sort-array | 211 | 4.737 | 15.83× |
| natural-orderby | 172 | 5.825 | 19.47× |
| sort-on | 50 | 20.100 | 67.17× |
| sort-by | 7 | 148.200 | 495.29× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1029 | 0.972 | 1.00× |
| inline comparator chain, toSorted() | 500 | 2.000 | 2.06× |
| inline comparator chain, slice().sort() | 494 | 2.025 | 2.08× |
| underscore.sortBy | 412 | 2.425 | 2.50× |
| thenby | 369 | 2.713 | 2.79× |
| fast-sort | 354 | 2.825 | 2.91× |
| es-toolkit.orderBy | 348 | 2.875 | 2.96× |
| Array.prototype.sort, decorated | 327 | 3.063 | 3.15× |
| remeda.sortBy | 321 | 3.112 | 3.20× |
| lodash.orderBy | 300 | 3.338 | 3.43× |
| ramda.sortWith | 281 | 3.563 | 3.67× |
| just-sort-by | 275 | 3.637 | 3.74× |
| sort-array | 193 | 5.175 | 5.32× |
| natural-orderby | 135 | 7.400 | 7.61× |
| sort-on | 42 | 23.800 | 24.49× |
| sort-by | 7 | 152.000 | 156.40× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 24498 | 0.041 | 0.65× |
| inline comparator chain, slice().sort() | 19617 | 0.051 | 0.82× |
| fast-multisort | 16000 | 0.063 | 1.00× |
| just-sort-by | 9961 | 0.100 | 1.61× |
| thenby | 8828 | 0.113 | 1.81× |
| fast-sort | 8339 | 0.120 | 1.92× |
| es-toolkit.orderBy | 7877 | 0.127 | 2.03× |
| remeda.sortBy | 7665 | 0.130 | 2.09× |
| Array.prototype.sort, decorated | 5714 | 0.175 | 2.80× |
| underscore.sortBy | 5590 | 0.179 | 2.86× |
| ramda.sortWith | 5565 | 0.180 | 2.88× |
| lodash.orderBy | 4116 | 0.243 | 3.89× |
| sort-array | 3153 | 0.317 | 5.07× |
| sort-on | 635 | 1.575 | 25.20× |
| natural-orderby | 398 | 2.513 | 40.20× |
| sort-by | 82 | 12.150 | 194.40× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 22456 | 0.045 | 0.70× |
| inline comparator chain, slice().sort() | 18092 | 0.055 | 0.87× |
| fast-multisort | 15754 | 0.063 | 1.00× |
| just-sort-by | 9697 | 0.103 | 1.62× |
| thenby | 8889 | 0.112 | 1.77× |
| fast-sort | 8285 | 0.121 | 1.90× |
| es-toolkit.orderBy | 7975 | 0.125 | 1.98× |
| remeda.sortBy | 6009 | 0.166 | 2.62× |
| Array.prototype.sort, decorated | 5689 | 0.176 | 2.77× |
| ramda.sortWith | 5541 | 0.180 | 2.84× |
| underscore.sortBy | 5059 | 0.198 | 3.11× |
| lodash.orderBy | 3787 | 0.264 | 4.16× |
| sort-array | 3307 | 0.302 | 4.76× |
| sort-on | 563 | 1.775 | 27.96× |
| natural-orderby | 381 | 2.625 | 41.35× |
| sort-by | 80 | 12.450 | 196.14× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 21333 | 0.047 | 0.50× |
| inline comparator chain, slice().sort() | 17534 | 0.057 | 0.61× |
| fast-multisort | 10622 | 0.094 | 1.00× |
| just-sort-by | 9377 | 0.107 | 1.13× |
| thenby | 7901 | 0.127 | 1.34× |
| fast-sort | 7688 | 0.130 | 1.38× |
| es-toolkit.orderBy | 7335 | 0.136 | 1.45× |
| remeda.sortBy | 7151 | 0.140 | 1.49× |
| Array.prototype.sort, decorated | 5447 | 0.184 | 1.95× |
| underscore.sortBy | 5333 | 0.188 | 1.99× |
| ramda.sortWith | 5246 | 0.191 | 2.02× |
| lodash.orderBy | 3951 | 0.253 | 2.69× |
| sort-array | 2949 | 0.339 | 3.60× |
| sort-on | 669 | 1.494 | 15.87× |
| natural-orderby | 386 | 2.587 | 27.49× |
| sort-by | 82 | 12.150 | 129.06× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1410 | 0.709 | 1.00× |
| inline comparator chain, toSorted() | 656 | 1.525 | 2.15× |
| inline comparator chain, slice().sort() | 650 | 1.537 | 2.17× |
| lodash.orderBy | 338 | 2.963 | 4.18× |
| es-toolkit.orderBy | 320 | 3.125 | 4.41× |
| Array.prototype.sort, decorated | 285 | 3.512 | 4.95× |
| thenby (different order) | 266 | 3.762 | 5.30× |
| remeda.sortBy (different order) | 261 | 3.838 | 5.41× |
| ramda.sortWith (different order) | 246 | 4.063 | 5.73× |
| fast-sort (different order) | 230 | 4.350 | 6.13× |
| sort-array (different order) | 136 | 7.375 | 10.40× |
| natural-orderby (different order) | 74 | 13.600 | 19.17× |
| sort-on (different order) | 35 | 28.200 | 39.75× |
| sort-by (different order) | 4 | 260.900 | 367.79× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 406 | 2.463 | 1.00× |
| inline comparator chain, toSorted() | 104 | 9.575 | 3.89× |
| inline comparator chain, slice().sort() | 104 | 9.650 | 3.92× |
| underscore.sortBy | 77 | 12.950 | 5.26× |
| thenby | 72 | 13.950 | 5.66× |
| fast-sort | 70 | 14.350 | 5.83× |
| es-toolkit.orderBy | 66 | 15.250 | 6.19× |
| lodash.orderBy | 56 | 17.850 | 7.25× |
| remeda.sortBy | 55 | 18.200 | 7.39× |
| Array.prototype.sort, decorated | 55 | 18.250 | 7.41× |
| ramda.sortWith | 53 | 19.000 | 7.72× |
| just-sort-by (different order) | 35 | 28.200 | 11.45× |
| sort-array | 34 | 29.500 | 11.98× |
| natural-orderby (different order) | 20 | 50.200 | 20.39× |
| sort-on (different order) | 9 | 112.600 | 45.73× |
| sort-by | 1 | 871.100 | 353.75× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 62 | 16.050 | 1.00× |
| inline comparator chain, slice().sort() | 21 | 46.600 | 2.90× |
| inline comparator chain, toSorted() | 21 | 47.600 | 2.97× |
| underscore.sortBy | 18 | 55.500 | 3.46× |
| thenby | 16 | 63.700 | 3.97× |
| es-toolkit.orderBy | 15 | 66.400 | 4.14× |
| fast-sort | 15 | 68.000 | 4.24× |
| remeda.sortBy | 14 | 69.300 | 4.32× |
| ramda.sortWith | 13 | 78.200 | 4.87× |
| lodash.orderBy | 12 | 84.100 | 5.24× |
| Array.prototype.sort, decorated | 11 | 88.200 | 5.50× |
| sort-array | 8 | 121.900 | 7.60× |
| just-sort-by (different order) | 8 | 123.200 | 7.68× |
| natural-orderby (different order) | 3 | 351.100 | 21.88× |
| sort-on (different order) | 3 | 369.600 | 23.03× |
| sort-by | 0 | 2125.500 | 132.43× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 338 | 2.962 | 1.00× |
| inline comparator chain, toSorted() | 63 | 15.750 | 5.32× |
| inline comparator chain, slice().sort() | 63 | 15.900 | 5.37× |
| underscore.sortBy (different order) | 52 | 19.050 | 6.43× |
| fast-sort | 41 | 24.400 | 8.24× |
| just-sort-by (different order) | 40 | 24.700 | 8.34× |
| thenby (different order) | 40 | 25.100 | 8.47× |
| es-toolkit.orderBy | 37 | 27.300 | 9.22× |
| remeda.sortBy (different order) | 36 | 27.800 | 9.38× |
| lodash.orderBy | 30 | 32.900 | 11.11× |
| Array.prototype.sort, decorated | 30 | 33.600 | 11.34× |
| ramda.sortWith (different order) | 28 | 36.100 | 12.19× |
| sort-array | 18 | 54.900 | 18.53× |
| natural-orderby | 15 | 66.400 | 22.41× |
| sort-on | 5 | 212.400 | 71.70× |
| sort-by (different order) | 1 | 1784.200 | 602.26× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 307 | 3.263 | 1.00× |
| underscore.sortBy | 44 | 22.700 | 6.96× |
| inline comparator chain, toSorted() | 39 | 25.800 | 7.91× |
| inline comparator chain, slice().sort() | 38 | 26.100 | 8.00× |
| thenby | 27 | 36.900 | 11.31× |
| just-sort-by | 27 | 37.500 | 11.49× |
| lodash.orderBy | 26 | 38.000 | 11.65× |
| fast-sort | 25 | 39.300 | 12.05× |
| es-toolkit.orderBy | 25 | 40.300 | 12.35× |
| remeda.sortBy | 24 | 40.900 | 12.54× |
| ramda.sortWith | 20 | 49.300 | 15.11× |
| Array.prototype.sort, decorated | 18 | 56.400 | 17.29× |
| sort-array | 13 | 75.900 | 23.26× |
| natural-orderby | 12 | 83.200 | 25.50× |
| sort-on | 4 | 283.500 | 86.90× |
| sort-by | 1 | 1936.600 | 593.59× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 59 | 16.950 | 1.00× |
| inline comparator chain, slice().sort() | 33 | 30.500 | 1.80× |
| inline comparator chain, toSorted() | 31 | 32.000 | 1.89× |
| underscore.sortBy | 29 | 34.500 | 2.04× |
| thenby | 25 | 40.800 | 2.41× |
| es-toolkit.orderBy | 24 | 41.000 | 2.42× |
| fast-sort | 23 | 42.900 | 2.53× |
| remeda.sortBy | 22 | 44.500 | 2.63× |
| Array.prototype.sort, decorated | 20 | 51.100 | 3.01× |
| ramda.sortWith | 20 | 51.200 | 3.02× |
| lodash.orderBy | 19 | 52.300 | 3.09× |
| just-sort-by | 19 | 53.700 | 3.17× |
| sort-array | 14 | 73.500 | 4.34× |
| natural-orderby | 10 | 97.600 | 5.76× |
| sort-on | 3 | 324.500 | 19.14× |
| sort-by | 1 | 1980.900 | 116.87× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2406 | 0.416 | 0.66× |
| inline comparator chain, slice().sort() | 1922 | 0.520 | 0.83× |
| fast-multisort | 1596 | 0.627 | 1.00× |
| just-sort-by | 1003 | 0.997 | 1.59× |
| thenby | 870 | 1.150 | 1.84× |
| fast-sort | 796 | 1.256 | 2.00× |
| es-toolkit.orderBy | 784 | 1.275 | 2.03× |
| remeda.sortBy | 762 | 1.313 | 2.09× |
| underscore.sortBy | 544 | 1.838 | 2.93× |
| ramda.sortWith | 542 | 1.844 | 2.94× |
| Array.prototype.sort, decorated | 434 | 2.306 | 3.68× |
| lodash.orderBy | 379 | 2.638 | 4.21× |
| sort-array | 314 | 3.188 | 5.09× |
| sort-on | 63 | 15.950 | 25.46× |
| natural-orderby | 34 | 29.700 | 47.40× |
| sort-by | 8 | 121.600 | 194.07× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2169 | 0.461 | 0.76× |
| inline comparator chain, slice().sort() | 1763 | 0.567 | 0.94× |
| fast-multisort | 1658 | 0.603 | 1.00× |
| just-sort-by | 936 | 1.069 | 1.77× |
| thenby | 874 | 1.144 | 1.90× |
| es-toolkit.orderBy | 800 | 1.250 | 2.07× |
| fast-sort | 800 | 1.250 | 2.07× |
| remeda.sortBy | 611 | 1.637 | 2.72× |
| ramda.sortWith | 556 | 1.800 | 2.98× |
| underscore.sortBy | 505 | 1.981 | 3.28× |
| Array.prototype.sort, decorated | 428 | 2.337 | 3.88× |
| lodash.orderBy | 354 | 2.825 | 4.68× |
| sort-array | 327 | 3.063 | 5.08× |
| sort-on | 56 | 17.900 | 29.68× |
| natural-orderby | 34 | 29.500 | 48.91× |
| sort-by | 8 | 124.800 | 206.92× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2025 | 0.494 | 0.52× |
| inline comparator chain, slice().sort() | 1608 | 0.622 | 0.66× |
| fast-multisort | 1056 | 0.947 | 1.00× |
| just-sort-by | 917 | 1.091 | 1.15× |
| thenby | 812 | 1.231 | 1.30× |
| fast-sort | 741 | 1.350 | 1.43× |
| es-toolkit.orderBy | 727 | 1.375 | 1.45× |
| remeda.sortBy | 708 | 1.413 | 1.49× |
| ramda.sortWith | 510 | 1.963 | 2.07× |
| underscore.sortBy | 494 | 2.025 | 2.14× |
| Array.prototype.sort, decorated | 386 | 2.588 | 2.73× |
| lodash.orderBy | 357 | 2.800 | 2.96× |
| sort-array | 293 | 3.413 | 3.60× |
| sort-on | 66 | 15.150 | 16.00× |
| natural-orderby | 33 | 30.300 | 32.00× |
| sort-by | 8 | 120.700 | 127.47× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 141 | 7.100 | 1.00× |
| inline comparator chain, toSorted() | 46 | 21.700 | 3.06× |
| inline comparator chain, slice().sort() | 45 | 22.000 | 3.10× |
| es-toolkit.orderBy | 23 | 43.300 | 6.10× |
| lodash.orderBy | 23 | 43.400 | 6.11× |
| thenby (different order) | 20 | 50.900 | 7.17× |
| Array.prototype.sort, decorated | 19 | 51.400 | 7.24× |
| ramda.sortWith (different order) | 19 | 53.600 | 7.55× |
| remeda.sortBy (different order) | 19 | 53.800 | 7.58× |
| fast-sort (different order) | 16 | 60.700 | 8.55× |
| sort-array (different order) | 10 | 100.800 | 14.20× |
| natural-orderby (different order) | 6 | 161.700 | 22.77× |
| sort-on (different order) | 3 | 374.800 | 52.79× |
| sort-by (different order) | 0 | 3478.100 | 489.87× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 40 | 25.200 | 1.00× |
| inline comparator chain, slice().sort() | 10 | 100.800 | 4.00× |
| inline comparator chain, toSorted() | 10 | 102.400 | 4.06× |
| underscore.sortBy | 7 | 136.700 | 5.42× |
| thenby | 7 | 143.300 | 5.69× |
| fast-sort | 7 | 147.800 | 5.87× |
| es-toolkit.orderBy | 6 | 155.000 | 6.15× |
| remeda.sortBy | 5 | 187.200 | 7.43× |
| Array.prototype.sort, decorated | 5 | 192.400 | 7.63× |
| lodash.orderBy | 5 | 194.700 | 7.73× |
| ramda.sortWith | 5 | 198.100 | 7.86× |
| just-sort-by (different order) | 3 | 286.800 | 11.38× |
| sort-array | 3 | 293.800 | 11.66× |
| natural-orderby (different order) | 2 | 568.100 | 22.54× |
| sort-on (different order) | 1 | 1133.100 | 44.96× |
| sort-by | 0 | 8704.000 | 345.40× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4 | 230.000 | 1.00× |
| underscore.sortBy | 1 | 813.000 | 3.53× |
| inline comparator chain, slice().sort() | 1 | 859.400 | 3.74× |
| inline comparator chain, toSorted() | 1 | 868.000 | 3.77× |
| thenby | 1 | 1182.200 | 5.14× |
| es-toolkit.orderBy | 1 | 1290.800 | 5.61× |
| remeda.sortBy | 1 | 1337.800 | 5.82× |
| fast-sort | 1 | 1359.300 | 5.91× |
| Array.prototype.sort, decorated | 1 | 1406.100 | 6.11× |
| ramda.sortWith | 1 | 1534.200 | 6.67× |
| lodash.orderBy | 1 | 1798.900 | 7.82× |
| just-sort-by (different order) | 1 | 1938.100 | 8.43× |
| sort-array | 0 | 2272.700 | 9.88× |
| natural-orderby (different order) | 0 | 5018.300 | 21.82× |
| sort-on (different order) | 0 | 5319.900 | 23.13× |
| sort-by | 0 | 25174.900 | 109.46× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 17 | 58.800 | 1.00× |
| inline comparator chain, slice().sort() | 4 | 261.200 | 4.44× |
| inline comparator chain, toSorted() | 4 | 264.300 | 4.49× |
| underscore.sortBy (different order) | 4 | 271.400 | 4.62× |
| just-sort-by (different order) | 3 | 381.700 | 6.49× |
| thenby (different order) | 3 | 387.700 | 6.59× |
| fast-sort | 3 | 390.000 | 6.63× |
| es-toolkit.orderBy | 2 | 415.200 | 7.06× |
| remeda.sortBy (different order) | 2 | 446.600 | 7.60× |
| ramda.sortWith (different order) | 2 | 542.900 | 9.23× |
| lodash.orderBy | 2 | 590.500 | 10.04× |
| Array.prototype.sort, decorated | 2 | 660.000 | 11.22× |
| sort-array | 1 | 877.900 | 14.93× |
| natural-orderby | 1 | 1019.500 | 17.34× |
| sort-on | 0 | 2864.100 | 48.71× |
| sort-by (different order) | 0 | 21917.300 | 372.74× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 23 | 44.100 | 1.00× |
| inline comparator chain, toSorted() | 3 | 347.600 | 7.88× |
| inline comparator chain, slice().sort() | 3 | 353.500 | 8.02× |
| underscore.sortBy | 3 | 374.600 | 8.49× |
| thenby | 2 | 526.600 | 11.94× |
| fast-sort | 2 | 552.600 | 12.53× |
| just-sort-by | 2 | 553.200 | 12.54× |
| es-toolkit.orderBy | 2 | 600.900 | 13.63× |
| remeda.sortBy | 2 | 624.500 | 14.16× |
| ramda.sortWith | 1 | 668.600 | 15.16× |
| lodash.orderBy | 1 | 882.800 | 20.02× |
| Array.prototype.sort, decorated | 1 | 917.200 | 20.80× |
| sort-array | 1 | 1030.900 | 23.38× |
| natural-orderby | 1 | 1467.900 | 33.29× |
| sort-on | 0 | 3586.300 | 81.32× |
| sort-by | 0 | 23754.900 | 538.66× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 357.900 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 569.700 | 1.59× |
| inline comparator chain, toSorted() | 2 | 576.100 | 1.61× |
| underscore.sortBy | 1 | 669.700 | 1.87× |
| thenby | 1 | 748.500 | 2.09× |
| es-toolkit.orderBy | 1 | 814.200 | 2.27× |
| remeda.sortBy | 1 | 818.600 | 2.29× |
| fast-sort | 1 | 825.000 | 2.31× |
| ramda.sortWith | 1 | 915.000 | 2.56× |
| just-sort-by | 1 | 960.200 | 2.68× |
| lodash.orderBy | 1 | 1141.800 | 3.19× |
| Array.prototype.sort, decorated | 1 | 1220.100 | 3.41× |
| sort-array | 1 | 1394.200 | 3.90× |
| natural-orderby | 1 | 1589.200 | 4.44× |
| sort-on | 0 | 4561.600 | 12.75× |
| sort-by | 0 | 24564.000 | 68.63× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 217 | 4.600 | 0.56× |
| inline comparator chain, slice().sort() | 151 | 6.625 | 0.81× |
| fast-multisort | 122 | 8.200 | 1.00× |
| just-sort-by | 95 | 10.500 | 1.28× |
| thenby | 83 | 12.000 | 1.46× |
| es-toolkit.orderBy | 76 | 13.200 | 1.61× |
| fast-sort | 74 | 13.450 | 1.64× |
| remeda.sortBy | 73 | 13.700 | 1.67× |
| ramda.sortWith | 53 | 18.950 | 2.31× |
| underscore.sortBy | 35 | 28.300 | 3.45× |
| Array.prototype.sort, decorated | 33 | 30.000 | 3.66× |
| sort-array | 31 | 32.200 | 3.93× |
| lodash.orderBy | 23 | 43.200 | 5.27× |
| sort-on | 6 | 161.800 | 19.73× |
| natural-orderby | 3 | 303.500 | 37.01× |
| sort-by | 1 | 1236.100 | 150.74× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 202 | 4.950 | 0.63× |
| inline comparator chain, slice().sort() | 159 | 6.300 | 0.81× |
| fast-multisort | 128 | 7.825 | 1.00× |
| just-sort-by | 92 | 10.900 | 1.39× |
| fast-sort | 81 | 12.300 | 1.57× |
| thenby | 80 | 12.450 | 1.59× |
| es-toolkit.orderBy | 76 | 13.200 | 1.69× |
| remeda.sortBy | 57 | 17.450 | 2.23× |
| ramda.sortWith | 52 | 19.300 | 2.47× |
| Array.prototype.sort, decorated | 33 | 30.600 | 3.91× |
| sort-array | 32 | 31.200 | 3.99× |
| underscore.sortBy | 29 | 34.600 | 4.42× |
| lodash.orderBy | 22 | 45.200 | 5.78× |
| sort-on | 6 | 181.100 | 23.14× |
| natural-orderby | 3 | 302.600 | 38.67× |
| sort-by | 1 | 1267.600 | 161.99× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 199 | 5.025 | 0.45× |
| inline comparator chain, slice().sort() | 157 | 6.350 | 0.56× |
| just-sort-by | 90 | 11.100 | 0.99× |
| fast-multisort | 89 | 11.250 | 1.00× |
| thenby | 81 | 12.350 | 1.10× |
| fast-sort | 73 | 13.650 | 1.21× |
| es-toolkit.orderBy | 72 | 13.950 | 1.24× |
| remeda.sortBy | 65 | 15.300 | 1.36× |
| ramda.sortWith | 51 | 19.500 | 1.73× |
| underscore.sortBy | 34 | 29.400 | 2.61× |
| sort-array | 28 | 36.200 | 3.22× |
| lodash.orderBy | 23 | 43.800 | 3.89× |
| Array.prototype.sort, decorated | 12 | 83.400 | 7.41× |
| sort-on | 7 | 150.200 | 13.35× |
| natural-orderby | 3 | 302.900 | 26.92× |
| sort-by | 1 | 1215.400 | 108.04× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10 | 102.300 | 1.00× |
| inline comparator chain, slice().sort() | 3 | 373.300 | 3.65× |
| inline comparator chain, toSorted() | 3 | 377.000 | 3.69× |
| es-toolkit.orderBy | 1 | 697.900 | 6.82× |
| ramda.sortWith (different order) | 1 | 829.800 | 8.11× |
| thenby (different order) | 1 | 848.000 | 8.29× |
| remeda.sortBy (different order) | 1 | 855.500 | 8.36× |
| lodash.orderBy | 1 | 897.500 | 8.77× |
| fast-sort (different order) | 1 | 1005.700 | 9.83× |
| Array.prototype.sort, decorated | 1 | 1066.300 | 10.42× |
| sort-array (different order) | 1 | 1511.000 | 14.77× |
| natural-orderby (different order) | 0 | 2430.000 | 23.75× |
| sort-on (different order) | 0 | 5066.400 | 49.52× |
| sort-by (different order) | 0 | 44050.000 | 430.60× |

</details>

#### WebKit 27.2

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, toSorted() | 0.41× | 1.35× | 6.67× | 63 | 0 |
| inline comparator chain, slice().sort() | 0.40× | 1.62× | 6.56× | 63 | 0 |
| es-toolkit.orderBy | 0.54× | 2.44× | 11.18× | 63 | 0 |
| just-sort-by | 0.33× | 2.52× | 17.50× | 56 | 17 |
| thenby | 0.44× | 2.57× | 11.13× | 63 | 12 |
| fast-sort | 0.50× | 2.80× | 10.53× | 63 | 6 |
| remeda.sortBy | 0.67× | 2.96× | 10.49× | 63 | 12 |
| underscore.sortBy | 1.04× | 3.38× | 8.79× | 56 | 6 |
| Array.prototype.sort, decorated | 1.00× | 3.54× | 21.88× | 63 | 0 |
| ramda.sortWith | 1.00× | 3.56× | 14.19× | 63 | 12 |
| sort-array | 1.63× | 4.80× | 21.31× | 63 | 6 |
| lodash.orderBy | 1.79× | 6.04× | 29.69× | 63 | 0 |
| natural-orderby | 8.67× | 27.56× | 170.67× | 63 | 19 |
| sort-on | 1.29× | 29.33× | 117.45× | 63 | 17 |
| sort-by | 4.98× | 104.30× | 768.00× | 63 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 270600258 | 0.000 | 0.34× |
| fast-multisort | 93206756 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.20× |
| inline comparator chain, slice().sort() | 67650065 | 0.000 | 1.38× |
| sort-on | 63550061 | 0.000 | 1.47× |
| es-toolkit.orderBy | 58254222 | 0.000 | 1.60× |
| thenby | 36157793 | 0.000 | 2.58× |
| Array.prototype.sort, decorated | 30840471 | 0.000 | 3.02× |
| ramda.sortWith | 26214400 | 0.000 | 3.56× |
| fast-sort | 24966095 | 0.000 | 3.73× |
| sort-array | 21845333 | 0.000 | 4.27× |
| underscore.sortBy | 20164923 | 0.000 | 4.62× |
| sort-by | 18724571 | 0.000 | 4.98× |
| remeda.sortBy | 18078897 | 0.000 | 5.16× |
| lodash.orderBy | 15420235 | 0.000 | 6.04× |
| natural-orderby | 4681143 | 0.000 | 19.91× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 289262345 | 0.000 | 0.36× |
| fast-multisort | 104857600 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.35× |
| sort-on | 77672296 | 0.000 | 1.35× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.65× |
| es-toolkit.orderBy | 56679784 | 0.000 | 1.85× |
| thenby | 38836148 | 0.000 | 2.70× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.20× |
| ramda.sortWith | 26214400 | 0.000 | 4.00× |
| fast-sort | 24966095 | 0.000 | 4.20× |
| underscore.sortBy | 21845333 | 0.000 | 4.80× |
| sort-array | 20971520 | 0.000 | 5.00× |
| remeda.sortBy | 18078897 | 0.000 | 5.80× |
| sort-by | 18078897 | 0.000 | 5.80× |
| lodash.orderBy | 14979657 | 0.000 | 7.00× |
| natural-orderby | 2184533 | 0.000 | 48.00× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 289262345 | 0.000 | 0.35× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.29× |
| sort-on | 77672296 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.57× |
| es-toolkit.orderBy | 56679784 | 0.000 | 1.76× |
| thenby | 38836148 | 0.000 | 2.57× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.05× |
| ramda.sortWith | 26214400 | 0.000 | 3.81× |
| fast-sort | 24966095 | 0.000 | 4.00× |
| underscore.sortBy | 22795130 | 0.000 | 4.38× |
| sort-array | 21845333 | 0.000 | 4.57× |
| remeda.sortBy | 18078897 | 0.000 | 5.52× |
| sort-by | 18078897 | 0.000 | 5.52× |
| lodash.orderBy | 14979657 | 0.000 | 6.67× |
| natural-orderby | 3120762 | 0.000 | 32.00× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 289262345 | 0.000 | 0.35× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.29× |
| sort-on | 77672296 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.62× |
| es-toolkit.orderBy | 56679784 | 0.000 | 1.76× |
| thenby | 38836148 | 0.000 | 2.57× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.05× |
| ramda.sortWith | 26214400 | 0.000 | 3.81× |
| fast-sort | 24966095 | 0.000 | 4.00× |
| underscore.sortBy | 22795130 | 0.000 | 4.38× |
| sort-array | 21845333 | 0.000 | 4.57× |
| remeda.sortBy | 18078897 | 0.000 | 5.52× |
| sort-by | 18078897 | 0.000 | 5.52× |
| lodash.orderBy | 14563556 | 0.000 | 6.86× |
| natural-orderby | 2849391 | 0.000 | 35.05× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.33× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.29× |
| sort-on | 77672296 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.62× |
| es-toolkit.orderBy | 55188211 | 0.000 | 1.81× |
| thenby | 38836148 | 0.000 | 2.57× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.05× |
| ramda.sortWith | 26214400 | 0.000 | 3.81× |
| fast-sort | 24966095 | 0.000 | 4.00× |
| underscore.sortBy | 21845333 | 0.000 | 4.57× |
| sort-array | 20971520 | 0.000 | 4.76× |
| remeda.sortBy | 18078897 | 0.000 | 5.52× |
| sort-by | 18078897 | 0.000 | 5.52× |
| lodash.orderBy | 14563556 | 0.000 | 6.86× |
| natural-orderby | 910222 | 0.001 | 109.71× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.33× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.29× |
| sort-on | 77672296 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.62× |
| es-toolkit.orderBy | 55188211 | 0.000 | 1.81× |
| thenby | 38836148 | 0.000 | 2.57× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.05× |
| ramda.sortWith | 26214400 | 0.000 | 3.81× |
| fast-sort | 24966095 | 0.000 | 4.00× |
| underscore.sortBy | 21845333 | 0.000 | 4.57× |
| sort-array | 20971520 | 0.000 | 4.76× |
| remeda.sortBy | 18078897 | 0.000 | 5.52× |
| sort-by | 18078897 | 0.000 | 5.52× |
| lodash.orderBy | 14563556 | 0.000 | 6.86× |
| natural-orderby | 3971879 | 0.000 | 25.14× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 289262345 | 0.000 | 0.35× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.29× |
| sort-on | 77672296 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.57× |
| es-toolkit.orderBy | 55188211 | 0.000 | 1.81× |
| thenby | 38836148 | 0.000 | 2.57× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.05× |
| ramda.sortWith | 26214400 | 0.000 | 3.81× |
| fast-sort | 24966095 | 0.000 | 4.00× |
| sort-array | 21845333 | 0.000 | 4.57× |
| underscore.sortBy | 21845333 | 0.000 | 4.57× |
| remeda.sortBy | 18078897 | 0.000 | 5.52× |
| sort-by | 18078897 | 0.000 | 5.52× |
| lodash.orderBy | 14563556 | 0.000 | 6.86× |
| natural-orderby | 3971879 | 0.000 | 25.14× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 289262345 | 0.000 | 0.35× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.29× |
| sort-on | 77672296 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.62× |
| es-toolkit.orderBy | 55188211 | 0.000 | 1.81× |
| thenby | 38836148 | 0.000 | 2.57× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.05× |
| ramda.sortWith | 26214400 | 0.000 | 3.81× |
| fast-sort | 23831273 | 0.000 | 4.19× |
| underscore.sortBy | 21845333 | 0.000 | 4.57× |
| sort-array | 20971520 | 0.000 | 4.76× |
| remeda.sortBy | 18078897 | 0.000 | 5.52× |
| sort-by | 18078897 | 0.000 | 5.52× |
| lodash.orderBy | 14563556 | 0.000 | 6.86× |
| natural-orderby | 3120762 | 0.000 | 32.00× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.29× |
| sort-on | 74898286 | 0.000 | 1.33× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.57× |
| es-toolkit.orderBy | 55188211 | 0.000 | 1.81× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.05× |
| fast-sort | 21845333 | 0.000 | 4.57× |
| sort-array | 21845333 | 0.000 | 4.57× |
| ramda.sortWith | 19418074 | 0.000 | 5.14× |
| sort-by | 16384000 | 0.000 | 6.10× |
| thenby | 15887515 | 0.000 | 6.29× |
| lodash.orderBy | 15420235 | 0.000 | 6.48× |
| remeda.sortBy | 10485760 | 0.000 | 9.52× |
| natural-orderby | 585143 | 0.002 | 170.67× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 6898526 | 0.000 | 0.76× |
| thenby | 5461333 | 0.000 | 0.96× |
| fast-multisort | 5242880 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4854519 | 0.000 | 1.08× |
| es-toolkit.orderBy | 4854519 | 0.000 | 1.08× |
| Array.prototype.sort, decorated | 4854519 | 0.000 | 1.08× |
| fast-sort | 4228129 | 0.000 | 1.24× |
| underscore.sortBy | 3855059 | 0.000 | 1.36× |
| remeda.sortBy | 3276800 | 0.000 | 1.60× |
| ramda.sortWith | 3120762 | 0.000 | 1.68× |
| lodash.orderBy | 2184533 | 0.000 | 2.40× |
| sort-array | 1927529 | 0.001 | 2.72× |
| just-sort-by (different order) | 1057032 | 0.001 | 4.96× |
| natural-orderby (different order) | 356174 | 0.003 | 14.72× |
| sort-on (different order) | 256000 | 0.004 | 20.48× |
| sort-by | 66065 | 0.015 | 79.36× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5957818 | 0.000 | 0.73× |
| thenby | 5242880 | 0.000 | 0.83× |
| inline comparator chain, toSorted() | 4681143 | 0.000 | 0.93× |
| es-toolkit.orderBy | 4681143 | 0.000 | 0.93× |
| fast-multisort | 4369067 | 0.000 | 1.00× |
| fast-sort | 4228129 | 0.000 | 1.03× |
| Array.prototype.sort, decorated | 3855059 | 0.000 | 1.13× |
| underscore.sortBy | 3542486 | 0.000 | 1.23× |
| remeda.sortBy | 3120762 | 0.000 | 1.40× |
| ramda.sortWith | 3120762 | 0.000 | 1.40× |
| lodash.orderBy | 2114065 | 0.000 | 2.07× |
| sort-array | 1638400 | 0.001 | 2.67× |
| just-sort-by | 1024000 | 0.001 | 4.27× |
| sort-on | 215579 | 0.005 | 20.27× |
| natural-orderby | 157538 | 0.006 | 27.73× |
| sort-by | 66065 | 0.015 | 66.13× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 13107200 | 0.000 | 0.45× |
| just-sort-by (different order) | 11915636 | 0.000 | 0.50× |
| inline comparator chain, toSorted() | 8456258 | 0.000 | 0.70× |
| es-toolkit.orderBy | 8192000 | 0.000 | 0.73× |
| thenby (different order) | 7943758 | 0.000 | 0.75× |
| fast-sort | 6721641 | 0.000 | 0.89× |
| fast-multisort | 5957818 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 5461333 | 0.000 | 1.09× |
| remeda.sortBy (different order) | 4519724 | 0.000 | 1.32× |
| underscore.sortBy (different order) | 4369067 | 0.000 | 1.36× |
| ramda.sortWith (different order) | 3855059 | 0.000 | 1.55× |
| sort-array | 2978909 | 0.000 | 2.00× |
| lodash.orderBy | 2427259 | 0.000 | 2.45× |
| natural-orderby | 390095 | 0.003 | 15.27× |
| sort-on | 327680 | 0.003 | 18.18× |
| sort-by (different order) | 66065 | 0.015 | 90.18× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 6898526 | 0.000 | 0.40× |
| inline comparator chain, toSorted() | 6721641 | 0.000 | 0.41× |
| thenby | 6241524 | 0.000 | 0.44× |
| just-sort-by | 5957818 | 0.000 | 0.46× |
| fast-sort | 5461333 | 0.000 | 0.50× |
| es-toolkit.orderBy | 5041231 | 0.000 | 0.54× |
| remeda.sortBy | 4096000 | 0.000 | 0.67× |
| fast-multisort | 2730667 | 0.000 | 1.00× |
| ramda.sortWith | 2730667 | 0.000 | 1.00× |
| underscore.sortBy | 2520615 | 0.000 | 1.08× |
| Array.prototype.sort, decorated | 2340571 | 0.000 | 1.17× |
| sort-array | 1680410 | 0.001 | 1.63× |
| lodash.orderBy | 1170286 | 0.001 | 2.33× |
| natural-orderby | 315077 | 0.003 | 8.67× |
| sort-on | 204800 | 0.005 | 13.33× |
| sort-by | 44522 | 0.022 | 61.33× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4519724 | 0.000 | 0.60× |
| inline comparator chain, toSorted() | 4369067 | 0.000 | 0.63× |
| thenby | 4369067 | 0.000 | 0.63× |
| es-toolkit.orderBy | 4096000 | 0.000 | 0.67× |
| fast-sort | 3640889 | 0.000 | 0.75× |
| remeda.sortBy | 2978909 | 0.000 | 0.92× |
| fast-multisort | 2730667 | 0.000 | 1.00× |
| ramda.sortWith | 2340571 | 0.000 | 1.17× |
| Array.prototype.sort, decorated | 2340571 | 0.000 | 1.17× |
| underscore.sortBy | 2048000 | 0.000 | 1.33× |
| just-sort-by | 1638400 | 0.001 | 1.67× |
| sort-array | 1560381 | 0.001 | 1.75× |
| lodash.orderBy | 1310720 | 0.001 | 2.08× |
| sort-on | 215579 | 0.005 | 12.67× |
| natural-orderby | 85333 | 0.012 | 32.00× |
| sort-by | 56889 | 0.018 | 48.00× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30840471 | 0.000 | 1.00× |
| es-toolkit.orderBy | 15420235 | 0.000 | 2.00× |
| thenby | 14979657 | 0.000 | 2.06× |
| inline comparator chain, slice().sort() | 13107200 | 0.000 | 2.35× |
| inline comparator chain, toSorted() | 12483048 | 0.000 | 2.47× |
| fast-sort | 11915636 | 0.000 | 2.59× |
| just-sort-by | 11915636 | 0.000 | 2.59× |
| Array.prototype.sort, decorated | 8192000 | 0.000 | 3.76× |
| underscore.sortBy | 7281778 | 0.000 | 4.24× |
| ramda.sortWith | 6898526 | 0.000 | 4.47× |
| remeda.sortBy | 5461333 | 0.000 | 5.65× |
| sort-array | 4681143 | 0.000 | 6.59× |
| lodash.orderBy | 3120762 | 0.000 | 9.88× |
| sort-on | 585143 | 0.002 | 52.71× |
| natural-orderby | 496485 | 0.002 | 62.12× |
| sort-by | 157538 | 0.006 | 195.76× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 23831273 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 13107200 | 0.000 | 1.82× |
| inline comparator chain, toSorted() | 11915636 | 0.000 | 2.00× |
| just-sort-by | 11915636 | 0.000 | 2.00× |
| remeda.sortBy | 5461333 | 0.000 | 4.36× |
| thenby | 5041231 | 0.000 | 4.73× |
| underscore.sortBy | 4854519 | 0.000 | 4.91× |
| sort-array | 4681143 | 0.000 | 5.09× |
| fast-sort | 4519724 | 0.000 | 5.27× |
| es-toolkit.orderBy | 3971879 | 0.000 | 6.00× |
| Array.prototype.sort, decorated | 2730667 | 0.000 | 8.73× |
| ramda.sortWith | 1724632 | 0.001 | 13.82× |
| lodash.orderBy | 1489455 | 0.001 | 16.00× |
| sort-on | 512000 | 0.002 | 46.55× |
| natural-orderby | 409600 | 0.002 | 58.18× |
| sort-by | 31030 | 0.032 | 768.00× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| thenby | 10485760 | 0.000 | 0.50× |
| es-toolkit.orderBy | 9362286 | 0.000 | 0.56× |
| fast-sort | 8738133 | 0.000 | 0.60× |
| inline comparator chain, slice().sort() | 6721641 | 0.000 | 0.78× |
| inline comparator chain, toSorted() | 6553600 | 0.000 | 0.80× |
| just-sort-by | 6241524 | 0.000 | 0.84× |
| fast-multisort | 5242880 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 5242880 | 0.000 | 1.00× |
| underscore.sortBy | 5041231 | 0.000 | 1.04× |
| ramda.sortWith | 4228129 | 0.000 | 1.24× |
| remeda.sortBy | 3971879 | 0.000 | 1.32× |
| lodash.orderBy | 2340571 | 0.000 | 2.24× |
| sort-array | 2340571 | 0.000 | 2.24× |
| natural-orderby | 420103 | 0.002 | 12.48× |
| sort-on | 248242 | 0.004 | 21.12× |
| sort-by | 97524 | 0.010 | 53.76× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4369067 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 4228129 | 0.000 | 0.65× |
| es-toolkit.orderBy | 2978909 | 0.000 | 0.92× |
| fast-multisort | 2730667 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 2621440 | 0.000 | 1.04× |
| ramda.sortWith (different order) | 2520615 | 0.000 | 1.08× |
| remeda.sortBy (different order) | 2184533 | 0.000 | 1.25× |
| thenby (different order) | 2114065 | 0.000 | 1.29× |
| fast-sort (different order) | 1638400 | 0.001 | 1.67× |
| sort-array (different order) | 1424696 | 0.001 | 1.92× |
| lodash.orderBy | 1365333 | 0.001 | 2.00× |
| sort-on (different order) | 204800 | 0.005 | 13.33× |
| natural-orderby (different order) | 56889 | 0.018 | 48.00× |
| sort-by (different order) | 46545 | 0.021 | 58.67× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 546133 | 0.002 | 1.00× |
| inline comparator chain, slice().sort() | 256000 | 0.004 | 2.13× |
| inline comparator chain, toSorted() | 256000 | 0.004 | 2.13× |
| thenby | 151704 | 0.007 | 3.60× |
| underscore.sortBy | 146286 | 0.007 | 3.73× |
| Array.prototype.sort, decorated | 136533 | 0.007 | 4.00× |
| fast-sort | 120471 | 0.008 | 4.53× |
| es-toolkit.orderBy | 110703 | 0.009 | 4.93× |
| remeda.sortBy | 107789 | 0.009 | 5.07× |
| lodash.orderBy | 93091 | 0.011 | 5.87× |
| sort-array | 89043 | 0.011 | 6.13× |
| ramda.sortWith | 85333 | 0.012 | 6.40× |
| just-sort-by (different order) | 40960 | 0.024 | 13.33× |
| natural-orderby (different order) | 25600 | 0.039 | 21.33× |
| sort-on (different order) | 11130 | 0.090 | 49.07× |
| sort-by | 2667 | 0.375 | 204.80× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 240941 | 0.004 | 0.89× |
| inline comparator chain, slice().sort() | 234057 | 0.004 | 0.92× |
| fast-multisort | 215579 | 0.005 | 1.00× |
| thenby | 124121 | 0.008 | 1.74× |
| underscore.sortBy | 110703 | 0.009 | 1.95× |
| fast-sort | 107789 | 0.009 | 2.00× |
| remeda.sortBy | 102400 | 0.010 | 2.11× |
| es-toolkit.orderBy | 97524 | 0.010 | 2.21× |
| Array.prototype.sort, decorated | 97524 | 0.010 | 2.21× |
| ramda.sortWith | 78769 | 0.013 | 2.74× |
| lodash.orderBy | 73143 | 0.014 | 2.95× |
| sort-array | 66065 | 0.015 | 3.26× |
| just-sort-by (different order) | 34133 | 0.029 | 6.32× |
| natural-orderby (different order) | 11130 | 0.090 | 19.37× |
| sort-on (different order) | 9143 | 0.109 | 23.58× |
| sort-by | 2560 | 0.391 | 84.21× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 442811 | 0.002 | 0.77× |
| inline comparator chain, toSorted() | 442811 | 0.002 | 0.77× |
| fast-multisort | 341333 | 0.003 | 1.00× |
| underscore.sortBy (different order) | 264258 | 0.004 | 1.29× |
| just-sort-by (different order) | 195048 | 0.005 | 1.75× |
| thenby (different order) | 186182 | 0.005 | 1.83× |
| fast-sort | 178087 | 0.006 | 1.92× |
| Array.prototype.sort, decorated | 178087 | 0.006 | 1.92× |
| es-toolkit.orderBy | 157538 | 0.006 | 2.17× |
| remeda.sortBy (different order) | 157538 | 0.006 | 2.17× |
| lodash.orderBy | 128000 | 0.008 | 2.67× |
| ramda.sortWith (different order) | 107789 | 0.009 | 3.17× |
| sort-array | 107789 | 0.009 | 3.17× |
| natural-orderby | 34133 | 0.029 | 10.00× |
| sort-on | 11636 | 0.086 | 29.33× |
| sort-by (different order) | 2783 | 0.359 | 122.67× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 390095 | 0.003 | 0.81× |
| inline comparator chain, toSorted() | 390095 | 0.003 | 0.81× |
| fast-multisort | 315077 | 0.003 | 1.00× |
| underscore.sortBy | 178087 | 0.006 | 1.77× |
| just-sort-by | 157538 | 0.006 | 2.00× |
| thenby | 136533 | 0.007 | 2.31× |
| Array.prototype.sort, decorated | 136533 | 0.007 | 2.31× |
| fast-sort | 124121 | 0.008 | 2.54× |
| remeda.sortBy | 120471 | 0.008 | 2.62× |
| es-toolkit.orderBy | 113778 | 0.009 | 2.77× |
| ramda.sortWith | 89043 | 0.011 | 3.54× |
| sort-array | 81920 | 0.012 | 3.85× |
| lodash.orderBy | 73143 | 0.014 | 4.31× |
| natural-orderby | 27676 | 0.036 | 11.38× |
| sort-on | 9481 | 0.105 | 33.23× |
| sort-by | 2667 | 0.375 | 118.15× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 215579 | 0.005 | 0.66× |
| inline comparator chain, toSorted() | 215579 | 0.005 | 0.66× |
| fast-multisort | 141241 | 0.007 | 1.00× |
| thenby | 102400 | 0.010 | 1.38× |
| Array.prototype.sort, decorated | 102400 | 0.010 | 1.38× |
| underscore.sortBy | 102400 | 0.010 | 1.38× |
| remeda.sortBy | 93091 | 0.011 | 1.52× |
| fast-sort | 93091 | 0.011 | 1.52× |
| es-toolkit.orderBy | 89043 | 0.011 | 1.59× |
| ramda.sortWith | 75852 | 0.013 | 1.86× |
| lodash.orderBy | 73143 | 0.014 | 1.93× |
| sort-array | 68267 | 0.015 | 2.07× |
| just-sort-by | 58514 | 0.017 | 2.41× |
| sort-on | 8533 | 0.117 | 16.55× |
| natural-orderby | 7758 | 0.129 | 18.21× |
| sort-by | 2560 | 0.391 | 55.17× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1985939 | 0.001 | 0.89× |
| inline comparator chain, toSorted() | 1985939 | 0.001 | 0.89× |
| fast-multisort | 1771243 | 0.001 | 1.00× |
| just-sort-by | 1170286 | 0.001 | 1.51× |
| fast-sort | 963765 | 0.001 | 1.84× |
| thenby | 862316 | 0.001 | 2.05× |
| es-toolkit.orderBy | 840205 | 0.001 | 2.11× |
| remeda.sortBy | 744727 | 0.001 | 2.38× |
| Array.prototype.sort, decorated | 712348 | 0.001 | 2.49× |
| underscore.sortBy | 712348 | 0.001 | 2.49× |
| ramda.sortWith | 655360 | 0.002 | 2.70× |
| sort-array | 630154 | 0.002 | 2.81× |
| lodash.orderBy | 341333 | 0.003 | 5.19× |
| sort-on | 53895 | 0.019 | 32.86× |
| natural-orderby | 40960 | 0.024 | 43.24× |
| sort-by | 14629 | 0.068 | 121.08× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1985939 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1927529 | 0.001 | 1.03× |
| inline comparator chain, toSorted() | 1927529 | 0.001 | 1.03× |
| just-sort-by | 1129931 | 0.001 | 1.76× |
| thenby | 992970 | 0.001 | 2.00× |
| fast-sort | 936229 | 0.001 | 2.12× |
| es-toolkit.orderBy | 819200 | 0.001 | 2.42× |
| remeda.sortBy | 712348 | 0.001 | 2.79× |
| Array.prototype.sort, decorated | 712348 | 0.001 | 2.79× |
| underscore.sortBy | 682667 | 0.001 | 2.91× |
| ramda.sortWith | 630154 | 0.002 | 3.15× |
| sort-array | 630154 | 0.002 | 3.15× |
| lodash.orderBy | 327680 | 0.003 | 6.06× |
| sort-on | 46545 | 0.021 | 42.67× |
| natural-orderby | 40960 | 0.024 | 48.48× |
| sort-by | 13838 | 0.072 | 143.52× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1057032 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 862316 | 0.001 | 1.23× |
| just-sort-by | 840205 | 0.001 | 1.26× |
| inline comparator chain, slice().sort() | 819200 | 0.001 | 1.29× |
| thenby | 712348 | 0.001 | 1.48× |
| fast-sort | 682667 | 0.001 | 1.55× |
| es-toolkit.orderBy | 606815 | 0.002 | 1.74× |
| Array.prototype.sort, decorated | 564966 | 0.002 | 1.87× |
| underscore.sortBy | 564966 | 0.002 | 1.87× |
| remeda.sortBy | 546133 | 0.002 | 1.94× |
| ramda.sortWith | 468114 | 0.002 | 2.26× |
| sort-array | 455111 | 0.002 | 2.32× |
| lodash.orderBy | 282483 | 0.004 | 3.74× |
| sort-on | 42667 | 0.023 | 24.77× |
| natural-orderby | 39385 | 0.025 | 26.84× |
| sort-by | 10667 | 0.094 | 99.10× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 215579 | 0.005 | 0.68× |
| inline comparator chain, toSorted() | 215579 | 0.005 | 0.68× |
| fast-multisort | 146286 | 0.007 | 1.00× |
| Array.prototype.sort, decorated | 117029 | 0.009 | 1.25× |
| es-toolkit.orderBy | 107789 | 0.009 | 1.36× |
| remeda.sortBy (different order) | 102400 | 0.010 | 1.43× |
| thenby (different order) | 85333 | 0.012 | 1.71× |
| lodash.orderBy | 81920 | 0.012 | 1.79× |
| fast-sort (different order) | 78769 | 0.013 | 1.86× |
| ramda.sortWith (different order) | 66065 | 0.015 | 2.21× |
| sort-array (different order) | 60235 | 0.017 | 2.43× |
| sort-on (different order) | 7758 | 0.129 | 18.86× |
| natural-orderby (different order) | 5818 | 0.172 | 25.14× |
| sort-by (different order) | 1778 | 0.563 | 82.29× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 46545 | 0.021 | 1.00× |
| inline comparator chain, slice().sort() | 18963 | 0.053 | 2.45× |
| inline comparator chain, toSorted() | 18286 | 0.055 | 2.55× |
| thenby | 11130 | 0.090 | 4.18× |
| underscore.sortBy | 11130 | 0.090 | 4.18× |
| Array.prototype.sort, decorated | 9846 | 0.102 | 4.73× |
| fast-sort | 8533 | 0.117 | 5.45× |
| es-toolkit.orderBy | 7758 | 0.129 | 6.00× |
| remeda.sortBy | 7529 | 0.133 | 6.18× |
| lodash.orderBy | 7314 | 0.137 | 6.36× |
| ramda.sortWith | 6400 | 0.156 | 7.27× |
| sort-array | 6400 | 0.156 | 7.27× |
| just-sort-by (different order) | 3200 | 0.313 | 14.55× |
| natural-orderby (different order) | 2370 | 0.422 | 19.64× |
| sort-on (different order) | 865 | 1.156 | 53.82× |
| sort-by | 211 | 4.750 | 221.09× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14222 | 0.070 | 1.00× |
| inline comparator chain, slice().sort() | 10667 | 0.094 | 1.33× |
| inline comparator chain, toSorted() | 10667 | 0.094 | 1.33× |
| underscore.sortBy | 6737 | 0.148 | 2.11× |
| thenby | 6400 | 0.156 | 2.22× |
| Array.prototype.sort, decorated | 6400 | 0.156 | 2.22× |
| remeda.sortBy | 6095 | 0.164 | 2.33× |
| fast-sort | 6095 | 0.164 | 2.33× |
| es-toolkit.orderBy | 5818 | 0.172 | 2.44× |
| ramda.sortWith | 4741 | 0.211 | 3.00× |
| lodash.orderBy | 4571 | 0.219 | 3.11× |
| sort-array | 4267 | 0.234 | 3.33× |
| just-sort-by (different order) | 2000 | 0.500 | 7.11× |
| natural-orderby (different order) | 800 | 1.250 | 17.78× |
| sort-on (different order) | 593 | 1.688 | 24.00× |
| sort-by | 167 | 6.000 | 85.33× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 36571 | 0.027 | 1.00× |
| inline comparator chain, slice().sort() | 22261 | 0.045 | 1.64× |
| inline comparator chain, toSorted() | 21333 | 0.047 | 1.71× |
| underscore.sortBy (different order) | 18286 | 0.055 | 2.00× |
| just-sort-by (different order) | 12190 | 0.082 | 3.00× |
| fast-sort | 11130 | 0.090 | 3.29× |
| Array.prototype.sort, decorated | 11130 | 0.090 | 3.29× |
| thenby (different order) | 10667 | 0.094 | 3.43× |
| es-toolkit.orderBy | 9846 | 0.102 | 3.71× |
| remeda.sortBy (different order) | 9846 | 0.102 | 3.71× |
| lodash.orderBy | 8000 | 0.125 | 4.57× |
| ramda.sortWith (different order) | 6919 | 0.145 | 5.29× |
| sort-array | 6919 | 0.145 | 5.29× |
| natural-orderby | 2783 | 0.359 | 13.14× |
| sort-on | 744 | 1.344 | 49.14× |
| sort-by (different order) | 174 | 5.750 | 210.29× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 32000 | 0.031 | 1.00× |
| inline comparator chain, slice().sort() | 17655 | 0.057 | 1.81× |
| inline comparator chain, toSorted() | 17655 | 0.057 | 1.81× |
| underscore.sortBy | 9481 | 0.105 | 3.38× |
| just-sort-by | 8828 | 0.113 | 3.63× |
| thenby | 8000 | 0.125 | 4.00× |
| fast-sort | 7758 | 0.129 | 4.13× |
| Array.prototype.sort, decorated | 7758 | 0.129 | 4.13× |
| remeda.sortBy | 7529 | 0.133 | 4.25× |
| es-toolkit.orderBy | 7111 | 0.141 | 4.50× |
| ramda.sortWith | 5818 | 0.172 | 5.50× |
| sort-array | 5120 | 0.195 | 6.25× |
| lodash.orderBy | 4571 | 0.219 | 7.00× |
| natural-orderby | 2370 | 0.422 | 13.50× |
| sort-on | 593 | 1.688 | 54.00× |
| sort-by | 167 | 6.000 | 192.00× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14222 | 0.070 | 1.00× |
| inline comparator chain, slice().sort() | 9846 | 0.102 | 1.44× |
| inline comparator chain, toSorted() | 9846 | 0.102 | 1.44× |
| underscore.sortBy | 6400 | 0.156 | 2.22× |
| thenby | 6095 | 0.164 | 2.33× |
| remeda.sortBy | 5818 | 0.172 | 2.44× |
| fast-sort | 5818 | 0.172 | 2.44× |
| Array.prototype.sort, decorated | 5818 | 0.172 | 2.44× |
| es-toolkit.orderBy | 5565 | 0.180 | 2.56× |
| ramda.sortWith | 4741 | 0.211 | 3.00× |
| lodash.orderBy | 4571 | 0.219 | 3.11× |
| sort-array | 4000 | 0.250 | 3.56× |
| just-sort-by | 3556 | 0.281 | 4.00× |
| natural-orderby | 696 | 1.438 | 20.44× |
| sort-on | 533 | 1.875 | 26.67× |
| sort-by | 160 | 6.250 | 88.89× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 204800 | 0.005 | 0.74× |
| inline comparator chain, slice().sort() | 195048 | 0.005 | 0.78× |
| fast-multisort | 151704 | 0.007 | 1.00× |
| just-sort-by | 117029 | 0.009 | 1.30× |
| thenby | 107789 | 0.009 | 1.41× |
| fast-sort | 97524 | 0.010 | 1.56× |
| es-toolkit.orderBy | 85333 | 0.012 | 1.78× |
| remeda.sortBy | 75852 | 0.013 | 2.00× |
| underscore.sortBy | 75852 | 0.013 | 2.00× |
| Array.prototype.sort, decorated | 73143 | 0.014 | 2.07× |
| ramda.sortWith | 66065 | 0.015 | 2.30× |
| sort-array | 60235 | 0.017 | 2.52× |
| lodash.orderBy | 36571 | 0.027 | 4.15× |
| sort-on | 5333 | 0.188 | 28.44× |
| natural-orderby | 4129 | 0.242 | 36.74× |
| sort-by | 1455 | 0.688 | 104.30× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 195048 | 0.005 | 0.64× |
| inline comparator chain, slice().sort() | 186182 | 0.005 | 0.67× |
| fast-multisort | 124121 | 0.008 | 1.00× |
| just-sort-by | 117029 | 0.009 | 1.06× |
| thenby | 105026 | 0.010 | 1.18× |
| fast-sort | 97524 | 0.010 | 1.27× |
| es-toolkit.orderBy | 85333 | 0.012 | 1.45× |
| remeda.sortBy | 73143 | 0.014 | 1.70× |
| Array.prototype.sort, decorated | 73143 | 0.014 | 1.70× |
| underscore.sortBy | 73143 | 0.014 | 1.70× |
| ramda.sortWith | 66065 | 0.015 | 1.88× |
| sort-array | 60235 | 0.017 | 2.06× |
| lodash.orderBy | 35310 | 0.028 | 3.52× |
| sort-on | 4571 | 0.219 | 27.15× |
| natural-orderby | 4129 | 0.242 | 30.06× |
| sort-by | 1391 | 0.719 | 89.21× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 113778 | 0.009 | 1.00× |
| just-sort-by | 110703 | 0.009 | 1.03× |
| thenby | 97524 | 0.010 | 1.17× |
| inline comparator chain, toSorted() | 93091 | 0.011 | 1.22× |
| fast-sort | 93091 | 0.011 | 1.22× |
| inline comparator chain, slice().sort() | 89043 | 0.011 | 1.28× |
| es-toolkit.orderBy | 81920 | 0.012 | 1.39× |
| remeda.sortBy | 70621 | 0.014 | 1.61× |
| underscore.sortBy | 70621 | 0.014 | 1.61× |
| ramda.sortWith | 64000 | 0.016 | 1.78× |
| Array.prototype.sort, decorated | 64000 | 0.016 | 1.78× |
| sort-array | 46545 | 0.021 | 2.44× |
| lodash.orderBy | 35310 | 0.028 | 3.22× |
| sort-on | 5333 | 0.188 | 21.33× |
| natural-orderby | 4129 | 0.242 | 27.56× |
| sort-by | 1391 | 0.719 | 81.78× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14222 | 0.070 | 1.00× |
| inline comparator chain, slice().sort() | 11130 | 0.090 | 1.28× |
| inline comparator chain, toSorted() | 10667 | 0.094 | 1.33× |
| es-toolkit.orderBy | 5818 | 0.172 | 2.44× |
| remeda.sortBy (different order) | 5565 | 0.180 | 2.56× |
| lodash.orderBy | 5333 | 0.188 | 2.67× |
| thenby (different order) | 4741 | 0.211 | 3.00× |
| fast-sort (different order) | 4414 | 0.227 | 3.22× |
| ramda.sortWith (different order) | 3657 | 0.273 | 3.89× |
| Array.prototype.sort, decorated | 3657 | 0.273 | 3.89× |
| sort-array (different order) | 2133 | 0.469 | 6.67× |
| natural-orderby (different order) | 533 | 1.875 | 26.67× |
| sort-on (different order) | 421 | 2.375 | 33.78× |
| sort-by (different order) | 100 | 10.000 | 142.22× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4923 | 0.203 | 1.00× |
| inline comparator chain, slice().sort() | 1280 | 0.781 | 3.85× |
| inline comparator chain, toSorted() | 1280 | 0.781 | 3.85× |
| underscore.sortBy | 970 | 1.031 | 5.08× |
| thenby | 941 | 1.063 | 5.23× |
| fast-sort | 762 | 1.313 | 6.46× |
| es-toolkit.orderBy | 727 | 1.375 | 6.77× |
| remeda.sortBy | 696 | 1.438 | 7.08× |
| lodash.orderBy | 640 | 1.563 | 7.69× |
| ramda.sortWith | 593 | 1.688 | 8.31× |
| Array.prototype.sort, decorated | 593 | 1.688 | 8.31× |
| sort-array | 400 | 2.500 | 12.31× |
| just-sort-by (different order) | 286 | 3.500 | 17.23× |
| natural-orderby (different order) | 222 | 4.500 | 22.15× |
| sort-on (different order) | 87 | 11.500 | 56.62× |
| sort-by | 21 | 47.000 | 231.38× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1185 | 0.844 | 1.00× |
| inline comparator chain, slice().sort() | 571 | 1.750 | 2.07× |
| inline comparator chain, toSorted() | 571 | 1.750 | 2.07× |
| underscore.sortBy | 444 | 2.250 | 2.67× |
| fast-sort | 410 | 2.438 | 2.89× |
| thenby | 410 | 2.438 | 2.89× |
| remeda.sortBy | 400 | 2.500 | 2.96× |
| es-toolkit.orderBy | 381 | 2.625 | 3.11× |
| ramda.sortWith | 320 | 3.125 | 3.70× |
| lodash.orderBy | 296 | 3.375 | 4.00× |
| Array.prototype.sort, decorated | 296 | 3.375 | 4.00× |
| sort-array | 200 | 5.000 | 5.93× |
| just-sort-by (different order) | 138 | 7.250 | 8.59× |
| natural-orderby (different order) | 61 | 16.500 | 19.56× |
| sort-on (different order) | 38 | 26.000 | 30.81× |
| sort-by | 12 | 86.000 | 101.93× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4000 | 0.250 | 1.00× |
| inline comparator chain, slice().sort() | 1185 | 0.844 | 3.38× |
| inline comparator chain, toSorted() | 1185 | 0.844 | 3.38× |
| underscore.sortBy (different order) | 970 | 1.031 | 4.13× |
| fast-sort | 762 | 1.313 | 5.25× |
| just-sort-by (different order) | 762 | 1.313 | 5.25× |
| remeda.sortBy (different order) | 696 | 1.438 | 5.75× |
| thenby (different order) | 696 | 1.438 | 5.75× |
| es-toolkit.orderBy | 667 | 1.500 | 6.00× |
| lodash.orderBy | 533 | 1.875 | 7.50× |
| ramda.sortWith (different order) | 485 | 2.063 | 8.25× |
| Array.prototype.sort, decorated | 432 | 2.313 | 9.25× |
| sort-array | 296 | 3.375 | 13.50× |
| natural-orderby | 216 | 4.625 | 18.50× |
| sort-on | 53 | 19.000 | 76.00× |
| sort-by (different order) | 13 | 78.000 | 312.00× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3657 | 0.273 | 1.00× |
| inline comparator chain, slice().sort() | 865 | 1.156 | 4.23× |
| inline comparator chain, toSorted() | 865 | 1.156 | 4.23× |
| underscore.sortBy | 615 | 1.625 | 5.94× |
| just-sort-by | 593 | 1.688 | 6.17× |
| fast-sort | 552 | 1.813 | 6.63× |
| remeda.sortBy | 533 | 1.875 | 6.86× |
| thenby | 533 | 1.875 | 6.86× |
| es-toolkit.orderBy | 500 | 2.000 | 7.31× |
| ramda.sortWith | 410 | 2.438 | 8.91× |
| Array.prototype.sort, decorated | 348 | 2.875 | 10.51× |
| lodash.orderBy | 320 | 3.125 | 11.43× |
| sort-array | 235 | 4.250 | 15.54× |
| natural-orderby | 174 | 5.750 | 21.03× |
| sort-on | 43 | 23.000 | 84.11× |
| sort-by | 12 | 85.000 | 310.86× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1067 | 0.938 | 1.00× |
| inline comparator chain, slice().sort() | 516 | 1.938 | 2.07× |
| inline comparator chain, toSorted() | 516 | 1.938 | 2.07× |
| underscore.sortBy | 400 | 2.500 | 2.67× |
| remeda.sortBy | 381 | 2.625 | 2.80× |
| fast-sort | 381 | 2.625 | 2.80× |
| thenby | 381 | 2.625 | 2.80× |
| es-toolkit.orderBy | 364 | 2.750 | 2.93× |
| ramda.sortWith | 308 | 3.250 | 3.47× |
| lodash.orderBy | 286 | 3.500 | 3.73× |
| Array.prototype.sort, decorated | 286 | 3.500 | 3.73× |
| just-sort-by | 250 | 4.000 | 4.27× |
| sort-array | 200 | 5.000 | 5.33× |
| natural-orderby | 54 | 18.500 | 19.73× |
| sort-on | 38 | 26.000 | 27.73× |
| sort-by | 11 | 89.000 | 94.93× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 21333 | 0.047 | 0.77× |
| inline comparator chain, slice().sort() | 20480 | 0.049 | 0.81× |
| fast-multisort | 16516 | 0.061 | 1.00× |
| just-sort-by | 11636 | 0.086 | 1.42× |
| thenby | 10667 | 0.094 | 1.55× |
| fast-sort | 10240 | 0.098 | 1.61× |
| es-toolkit.orderBy | 8828 | 0.113 | 1.87× |
| remeda.sortBy | 8828 | 0.113 | 1.87× |
| underscore.sortBy | 7529 | 0.133 | 2.19× |
| ramda.sortWith | 6737 | 0.148 | 2.45× |
| Array.prototype.sort, decorated | 4741 | 0.211 | 3.48× |
| lodash.orderBy | 3556 | 0.281 | 4.65× |
| sort-array | 3200 | 0.313 | 5.16× |
| sort-on | 533 | 1.875 | 30.97× |
| natural-orderby | 381 | 2.625 | 43.35× |
| sort-by | 143 | 7.000 | 115.61× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 22261 | 0.045 | 1.00× |
| inline comparator chain, toSorted() | 21333 | 0.047 | 1.04× |
| inline comparator chain, slice().sort() | 19692 | 0.051 | 1.13× |
| just-sort-by | 12190 | 0.082 | 1.83× |
| thenby | 10667 | 0.094 | 2.09× |
| fast-sort | 9846 | 0.102 | 2.26× |
| es-toolkit.orderBy | 8828 | 0.113 | 2.52× |
| remeda.sortBy | 8533 | 0.117 | 2.61× |
| underscore.sortBy | 7314 | 0.137 | 3.04× |
| ramda.sortWith | 6737 | 0.148 | 3.30× |
| Array.prototype.sort, decorated | 4923 | 0.203 | 4.52× |
| lodash.orderBy | 3459 | 0.289 | 6.43× |
| sort-array | 3459 | 0.289 | 6.43× |
| sort-on | 444 | 2.250 | 50.09× |
| natural-orderby | 381 | 2.625 | 58.43× |
| sort-by | 138 | 7.250 | 161.39× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14629 | 0.068 | 1.00× |
| inline comparator chain, toSorted() | 11636 | 0.086 | 1.26× |
| inline comparator chain, slice().sort() | 10667 | 0.094 | 1.37× |
| just-sort-by | 8258 | 0.121 | 1.77× |
| fast-sort | 8000 | 0.125 | 1.83× |
| thenby | 8000 | 0.125 | 1.83× |
| remeda.sortBy | 7529 | 0.133 | 1.94× |
| es-toolkit.orderBy | 6919 | 0.145 | 2.11× |
| underscore.sortBy | 6095 | 0.164 | 2.40× |
| ramda.sortWith | 5565 | 0.180 | 2.63× |
| Array.prototype.sort, decorated | 4129 | 0.242 | 3.54× |
| sort-array | 3048 | 0.328 | 4.80× |
| lodash.orderBy | 2909 | 0.344 | 5.03× |
| sort-on | 552 | 1.813 | 26.51× |
| natural-orderby | 381 | 2.625 | 38.40× |
| sort-by | 143 | 7.000 | 102.40× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1829 | 0.547 | 1.00× |
| inline comparator chain, toSorted() | 615 | 1.625 | 2.97× |
| inline comparator chain, slice().sort() | 593 | 1.688 | 3.09× |
| lodash.orderBy | 381 | 2.625 | 4.80× |
| es-toolkit.orderBy | 381 | 2.625 | 4.80× |
| remeda.sortBy (different order) | 381 | 2.625 | 4.80× |
| fast-sort (different order) | 308 | 3.250 | 5.94× |
| thenby (different order) | 308 | 3.250 | 5.94× |
| Array.prototype.sort, decorated | 258 | 3.875 | 7.09× |
| ramda.sortWith (different order) | 250 | 4.000 | 7.31× |
| sort-array (different order) | 148 | 6.750 | 12.34× |
| natural-orderby (different order) | 42 | 24.000 | 43.89× |
| sort-on (different order) | 27 | 37.000 | 67.66× |
| sort-by (different order) | 7 | 153.000 | 279.77× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 500 | 2.000 | 1.00× |
| inline comparator chain, slice().sort() | 111 | 9.000 | 4.50× |
| inline comparator chain, toSorted() | 111 | 9.000 | 4.50× |
| thenby | 87 | 11.500 | 5.75× |
| underscore.sortBy | 83 | 12.000 | 6.00× |
| fast-sort | 71 | 14.000 | 7.00× |
| es-toolkit.orderBy | 69 | 14.500 | 7.25× |
| remeda.sortBy | 67 | 15.000 | 7.50× |
| lodash.orderBy | 61 | 16.500 | 8.25× |
| ramda.sortWith | 57 | 17.500 | 8.75× |
| Array.prototype.sort, decorated | 57 | 17.500 | 8.75× |
| sort-array | 38 | 26.000 | 13.00× |
| just-sort-by (different order) | 29 | 35.000 | 17.50× |
| natural-orderby (different order) | 21 | 47.000 | 23.50× |
| sort-on (different order) | 8 | 126.000 | 63.00× |
| sort-by | 2 | 483.000 | 241.50× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 63 | 16.000 | 1.00× |
| inline comparator chain, slice().sort() | 32 | 31.000 | 1.94× |
| inline comparator chain, toSorted() | 31 | 32.000 | 2.00× |
| underscore.sortBy | 26 | 38.000 | 2.38× |
| remeda.sortBy | 23 | 44.000 | 2.75× |
| fast-sort | 23 | 44.000 | 2.75× |
| thenby | 23 | 44.000 | 2.75× |
| es-toolkit.orderBy | 21 | 47.000 | 2.94× |
| ramda.sortWith | 19 | 54.000 | 3.38× |
| Array.prototype.sort, decorated | 15 | 68.000 | 4.25× |
| lodash.orderBy | 14 | 73.000 | 4.56× |
| sort-array | 12 | 82.000 | 5.13× |
| just-sort-by (different order) | 8 | 120.000 | 7.50× |
| natural-orderby (different order) | 3 | 349.000 | 21.81× |
| sort-on (different order) | 3 | 367.000 | 22.94× |
| sort-by | 1 | 1126.000 | 70.38× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 432 | 2.313 | 1.00× |
| inline comparator chain, slice().sort() | 80 | 12.500 | 5.41× |
| inline comparator chain, toSorted() | 80 | 12.500 | 5.41× |
| underscore.sortBy (different order) | 69 | 14.500 | 6.27× |
| fast-sort | 56 | 18.000 | 7.78× |
| just-sort-by (different order) | 56 | 18.000 | 7.78× |
| remeda.sortBy (different order) | 51 | 19.500 | 8.43× |
| thenby (different order) | 50 | 20.000 | 8.65× |
| es-toolkit.orderBy | 48 | 21.000 | 9.08× |
| ramda.sortWith (different order) | 37 | 27.000 | 11.68× |
| lodash.orderBy | 34 | 29.000 | 12.54× |
| Array.prototype.sort, decorated | 29 | 34.000 | 14.70× |
| sort-array | 22 | 45.000 | 19.46× |
| natural-orderby | 14 | 73.000 | 31.57× |
| sort-on | 4 | 244.000 | 105.51× |
| sort-by (different order) | 1 | 984.000 | 425.51× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 364 | 2.750 | 1.00× |
| inline comparator chain, slice().sort() | 59 | 17.000 | 6.18× |
| inline comparator chain, toSorted() | 59 | 17.000 | 6.18× |
| underscore.sortBy | 45 | 22.000 | 8.00× |
| just-sort-by | 42 | 24.000 | 8.73× |
| remeda.sortBy | 40 | 25.000 | 9.09× |
| fast-sort | 40 | 25.000 | 9.09× |
| thenby | 38 | 26.000 | 9.45× |
| es-toolkit.orderBy | 37 | 27.000 | 9.82× |
| ramda.sortWith | 30 | 33.000 | 12.00× |
| Array.prototype.sort, decorated | 23 | 44.000 | 16.00× |
| lodash.orderBy | 20 | 51.000 | 18.55× |
| sort-array | 18 | 56.000 | 20.36× |
| natural-orderby | 10 | 100.000 | 36.36× |
| sort-on | 3 | 323.000 | 117.45× |
| sort-by | 1 | 1084.000 | 394.18× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 59 | 17.000 | 1.00× |
| inline comparator chain, toSorted() | 32 | 31.000 | 1.82× |
| inline comparator chain, slice().sort() | 31 | 32.000 | 1.88× |
| underscore.sortBy | 26 | 39.000 | 2.29× |
| remeda.sortBy | 23 | 44.000 | 2.59× |
| thenby | 23 | 44.000 | 2.59× |
| fast-sort | 21 | 47.000 | 2.76× |
| es-toolkit.orderBy | 21 | 48.000 | 2.82× |
| ramda.sortWith | 19 | 54.000 | 3.18× |
| Array.prototype.sort, decorated | 15 | 65.000 | 3.82× |
| just-sort-by | 15 | 67.000 | 3.94× |
| lodash.orderBy | 15 | 68.000 | 4.00× |
| sort-array | 12 | 81.000 | 4.76× |
| natural-orderby (different order) | 3 | 341.000 | 20.06× |
| sort-on | 3 | 387.000 | 22.76× |
| sort-by | 1 | 1161.000 | 68.29× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3048 | 0.328 | 1.00× |
| inline comparator chain, slice().sort() | 1455 | 0.688 | 2.10× |
| inline comparator chain, toSorted() | 1103 | 0.906 | 2.76× |
| just-sort-by | 941 | 1.063 | 3.24× |
| thenby | 889 | 1.125 | 3.43× |
| fast-sort | 865 | 1.156 | 3.52× |
| remeda.sortBy | 800 | 1.250 | 3.81× |
| es-toolkit.orderBy | 762 | 1.313 | 4.00× |
| ramda.sortWith | 593 | 1.688 | 5.14× |
| underscore.sortBy | 593 | 1.688 | 5.14× |
| Array.prototype.sort, decorated | 432 | 2.313 | 7.05× |
| sort-array | 308 | 3.250 | 9.90× |
| lodash.orderBy | 296 | 3.375 | 10.29× |
| sort-on | 51 | 19.500 | 59.43× |
| natural-orderby | 36 | 28.000 | 85.33× |
| sort-by | 14 | 69.000 | 210.29× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2370 | 0.422 | 1.00× |
| inline comparator chain, slice().sort() | 1391 | 0.719 | 1.70× |
| inline comparator chain, toSorted() | 1103 | 0.906 | 2.15× |
| just-sort-by | 941 | 1.063 | 2.52× |
| thenby | 889 | 1.125 | 2.67× |
| fast-sort | 842 | 1.188 | 2.81× |
| es-toolkit.orderBy | 727 | 1.375 | 3.26× |
| remeda.sortBy | 727 | 1.375 | 3.26× |
| ramda.sortWith | 593 | 1.688 | 4.00× |
| underscore.sortBy | 533 | 1.875 | 4.44× |
| Array.prototype.sort, decorated | 432 | 2.313 | 5.48× |
| sort-array | 320 | 3.125 | 7.41× |
| lodash.orderBy | 276 | 3.625 | 8.59× |
| sort-on | 43 | 23.000 | 54.52× |
| natural-orderby | 34 | 29.000 | 68.74× |
| sort-by | 14 | 72.000 | 170.67× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1829 | 0.547 | 1.00× |
| just-sort-by | 821 | 1.219 | 2.23× |
| thenby | 800 | 1.250 | 2.29× |
| fast-sort | 762 | 1.313 | 2.40× |
| inline comparator chain, slice().sort() | 727 | 1.375 | 2.51× |
| inline comparator chain, toSorted() | 696 | 1.438 | 2.63× |
| es-toolkit.orderBy | 696 | 1.438 | 2.63× |
| remeda.sortBy | 696 | 1.438 | 2.63× |
| ramda.sortWith | 552 | 1.813 | 3.31× |
| underscore.sortBy | 533 | 1.875 | 3.43× |
| Array.prototype.sort, decorated | 410 | 2.438 | 4.46× |
| sort-array | 308 | 3.250 | 5.94× |
| lodash.orderBy | 286 | 3.500 | 6.40× |
| sort-on | 54 | 18.500 | 33.83× |
| natural-orderby | 36 | 28.000 | 51.20× |
| sort-by | 15 | 68.000 | 124.34× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 160 | 6.250 | 1.00× |
| inline comparator chain, toSorted() | 42 | 24.000 | 3.84× |
| inline comparator chain, slice().sort() | 40 | 25.000 | 4.00× |
| es-toolkit.orderBy | 27 | 37.000 | 5.92× |
| remeda.sortBy (different order) | 26 | 39.000 | 6.24× |
| lodash.orderBy | 22 | 45.000 | 7.20× |
| thenby (different order) | 22 | 46.000 | 7.36× |
| fast-sort (different order) | 21 | 47.000 | 7.52× |
| ramda.sortWith (different order) | 18 | 57.000 | 9.12× |
| Array.prototype.sort, decorated | 17 | 59.000 | 9.44× |
| sort-array (different order) | 11 | 93.000 | 14.88× |
| natural-orderby (different order) | 3 | 289.000 | 46.24× |
| sort-on (different order) | 2 | 526.000 | 84.16× |
| sort-by (different order) | 0 | 2033.000 | 325.28× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42 | 24.000 | 1.00× |
| inline comparator chain, toSorted() | 11 | 92.000 | 3.83× |
| inline comparator chain, slice().sort() | 11 | 93.000 | 3.88× |
| thenby | 9 | 116.000 | 4.83× |
| underscore.sortBy | 8 | 125.000 | 5.21× |
| fast-sort | 7 | 137.000 | 5.71× |
| es-toolkit.orderBy | 7 | 148.000 | 6.17× |
| remeda.sortBy | 7 | 153.000 | 6.38× |
| lodash.orderBy | 6 | 173.000 | 7.21× |
| ramda.sortWith | 6 | 175.000 | 7.29× |
| Array.prototype.sort, decorated | 6 | 176.000 | 7.33× |
| sort-array | 4 | 255.000 | 10.63× |
| just-sort-by (different order) | 3 | 345.000 | 14.38× |
| natural-orderby (different order) | 2 | 522.000 | 21.75× |
| sort-on (different order) | 1 | 1400.000 | 58.33× |
| sort-by | 0 | 5046.000 | 210.25× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 381.000 | 1.00× |
| inline comparator chain, toSorted() | 2 | 648.000 | 1.70× |
| inline comparator chain, slice().sort() | 2 | 666.000 | 1.75× |
| underscore.sortBy | 1 | 842.000 | 2.21× |
| fast-sort | 1 | 951.000 | 2.50× |
| remeda.sortBy | 1 | 965.000 | 2.53× |
| thenby | 1 | 984.000 | 2.58× |
| es-toolkit.orderBy | 1 | 1030.000 | 2.70× |
| ramda.sortWith | 1 | 1143.000 | 3.00× |
| Array.prototype.sort, decorated | 1 | 1472.000 | 3.86× |
| sort-array | 1 | 1701.000 | 4.46× |
| lodash.orderBy | 1 | 1836.000 | 4.82× |
| just-sort-by (different order) | 0 | 2356.000 | 6.18× |
| sort-on (different order) | 0 | 5509.000 | 14.46× |
| natural-orderby (different order) | 0 | 6578.000 | 17.27× |
| sort-by | 0 | 14639.000 | 38.42× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 31 | 32.000 | 1.00× |
| inline comparator chain, toSorted() | 5 | 193.000 | 6.03× |
| inline comparator chain, slice().sort() | 5 | 194.000 | 6.06× |
| underscore.sortBy (different order) | 5 | 213.000 | 6.66× |
| just-sort-by (different order) | 3 | 301.000 | 9.41× |
| fast-sort | 3 | 310.000 | 9.69× |
| remeda.sortBy (different order) | 3 | 318.000 | 9.94× |
| thenby (different order) | 3 | 322.000 | 10.06× |
| es-toolkit.orderBy | 3 | 338.000 | 10.56× |
| ramda.sortWith (different order) | 2 | 454.000 | 14.19× |
| lodash.orderBy | 2 | 617.000 | 19.28× |
| sort-array | 1 | 672.000 | 21.00× |
| Array.prototype.sort, decorated | 1 | 700.000 | 21.88× |
| natural-orderby | 1 | 1331.000 | 41.59× |
| sort-on | 0 | 3276.000 | 102.38× |
| sort-by (different order) | 0 | 12231.000 | 382.22× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 26 | 39.000 | 1.00× |
| inline comparator chain, slice().sort() | 4 | 256.000 | 6.56× |
| inline comparator chain, toSorted() | 4 | 260.000 | 6.67× |
| underscore.sortBy | 3 | 343.000 | 8.79× |
| just-sort-by | 3 | 372.000 | 9.54× |
| fast-sort | 2 | 402.000 | 10.31× |
| remeda.sortBy | 2 | 409.000 | 10.49× |
| thenby | 2 | 434.000 | 11.13× |
| es-toolkit.orderBy | 2 | 436.000 | 11.18× |
| ramda.sortWith | 2 | 532.000 | 13.64× |
| Array.prototype.sort, decorated | 1 | 816.000 | 20.92× |
| sort-array | 1 | 831.000 | 21.31× |
| lodash.orderBy | 1 | 1158.000 | 29.69× |
| natural-orderby | 1 | 1661.000 | 42.59× |
| sort-on | 0 | 4305.000 | 110.38× |
| sort-by | 0 | 13551.000 | 347.46× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 472.000 | 1.00× |
| inline comparator chain, slice().sort() | 1 | 674.000 | 1.43× |
| inline comparator chain, toSorted() | 1 | 676.000 | 1.43× |
| remeda.sortBy | 1 | 1008.000 | 2.14× |
| thenby | 1 | 1034.000 | 2.19× |
| fast-sort | 1 | 1038.000 | 2.20× |
| es-toolkit.orderBy | 1 | 1065.000 | 2.26× |
| underscore.sortBy | 1 | 1147.000 | 2.43× |
| ramda.sortWith | 1 | 1299.000 | 2.75× |
| lodash.orderBy | 1 | 1660.000 | 3.52× |
| sort-array | 1 | 1813.000 | 3.84× |
| Array.prototype.sort, decorated | 1 | 1898.000 | 4.02× |
| just-sort-by | 0 | 2235.000 | 4.74× |
| sort-on | 0 | 5633.000 | 11.93× |
| natural-orderby (different order) | 0 | 8792.000 | 18.63× |
| sort-by | 0 | 15356.000 | 32.53× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 229 | 4.375 | 1.00× |
| inline comparator chain, slice().sort() | 100 | 10.000 | 2.29× |
| inline comparator chain, toSorted() | 100 | 10.000 | 2.29× |
| just-sort-by | 87 | 11.500 | 2.63× |
| fast-sort | 77 | 13.000 | 2.97× |
| es-toolkit.orderBy | 71 | 14.000 | 3.20× |
| thenby | 69 | 14.500 | 3.31× |
| remeda.sortBy | 65 | 15.500 | 3.54× |
| ramda.sortWith | 56 | 18.000 | 4.11× |
| underscore.sortBy | 50 | 20.000 | 4.57× |
| Array.prototype.sort, decorated | 38 | 26.000 | 5.94× |
| sort-array | 29 | 35.000 | 8.00× |
| lodash.orderBy | 24 | 41.000 | 9.37× |
| sort-on | 5 | 217.000 | 49.60× |
| natural-orderby | 3 | 312.000 | 71.31× |
| sort-by | 1 | 729.000 | 166.63× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 182 | 5.500 | 1.00× |
| inline comparator chain, slice().sort() | 125 | 8.000 | 1.45× |
| inline comparator chain, toSorted() | 95 | 10.500 | 1.91× |
| just-sort-by | 91 | 11.000 | 2.00× |
| thenby | 80 | 12.500 | 2.27× |
| fast-sort | 77 | 13.000 | 2.36× |
| es-toolkit.orderBy | 69 | 14.500 | 2.64× |
| remeda.sortBy | 61 | 16.500 | 3.00× |
| ramda.sortWith | 56 | 18.000 | 3.27× |
| underscore.sortBy | 45 | 22.000 | 4.00× |
| Array.prototype.sort, decorated | 38 | 26.000 | 4.73× |
| sort-array | 29 | 35.000 | 6.36× |
| lodash.orderBy | 22 | 45.000 | 8.18× |
| sort-on | 4 | 261.000 | 47.45× |
| natural-orderby | 3 | 293.000 | 53.27× |
| sort-by | 1 | 742.000 | 134.91× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 182 | 5.500 | 1.00× |
| just-sort-by | 87 | 11.500 | 2.09× |
| fast-sort | 77 | 13.000 | 2.36× |
| es-toolkit.orderBy | 69 | 14.500 | 2.64× |
| thenby | 67 | 15.000 | 2.73× |
| remeda.sortBy | 65 | 15.500 | 2.82× |
| inline comparator chain, slice().sort() | 63 | 16.000 | 2.91× |
| inline comparator chain, toSorted() | 56 | 18.000 | 3.27× |
| ramda.sortWith | 54 | 18.500 | 3.36× |
| underscore.sortBy | 50 | 20.000 | 3.64× |
| Array.prototype.sort, decorated | 38 | 26.000 | 4.73× |
| sort-array | 28 | 36.000 | 6.55× |
| lodash.orderBy | 22 | 45.000 | 8.18× |
| sort-on | 5 | 211.000 | 38.36× |
| natural-orderby | 3 | 303.000 | 55.09× |
| sort-by | 1 | 696.000 | 126.55× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13 | 78.000 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 435.000 | 5.58× |
| inline comparator chain, toSorted() | 2 | 442.000 | 5.67× |
| es-toolkit.orderBy | 2 | 648.000 | 8.31× |
| remeda.sortBy (different order) | 2 | 661.000 | 8.47× |
| thenby (different order) | 1 | 728.000 | 9.33× |
| fast-sort (different order) | 1 | 821.000 | 10.53× |
| ramda.sortWith (different order) | 1 | 928.000 | 11.90× |
| lodash.orderBy | 1 | 929.000 | 11.91× |
| Array.prototype.sort, decorated | 1 | 1278.000 | 16.38× |
| sort-array (different order) | 1 | 1363.000 | 17.47× |
| natural-orderby (different order) | 0 | 4285.000 | 54.94× |
| sort-on (different order) | 0 | 7080.000 | 90.77× |
| sort-by (different order) | 0 | 25925.000 | 332.37× |

</details>

#### Firefox 158.0

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, toSorted() | 0.43× | 1.18× | 5.39× | 54 | 0 |
| inline comparator chain, slice().sort() | 0.43× | 1.36× | 5.39× | 54 | 0 |
| es-toolkit.orderBy | 0.79× | 2.28× | 16.00× | 54 | 0 |
| just-sort-by | 0.44× | 2.71× | 20.87× | 48 | 14 |
| thenby | 0.69× | 2.80× | 13.94× | 54 | 10 |
| Array.prototype.sort, decorated | 0.79× | 3.00× | 13.94× | 54 | 0 |
| underscore.sortBy | 1.10× | 3.31× | 10.06× | 48 | 5 |
| fast-sort | 0.69× | 3.41× | 12.90× | 54 | 9 |
| remeda.sortBy | 0.97× | 4.00× | 12.90× | 54 | 10 |
| ramda.sortWith | 1.25× | 4.64× | 21.68× | 54 | 10 |
| sort-array | 1.17× | 4.80× | 21.68× | 54 | 5 |
| lodash.orderBy | 1.66× | 6.26× | 23.74× | 54 | 0 |
| sort-on | 1.68× | 21.94× | 207.48× | 54 | 14 |
| natural-orderby | 7.17× | 29.71× | 192.00× | 54 | 15 |
| sort-by | 2.80× | 220.69× | 2119.23× | 54 | 10 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.45× |
| inline comparator chain, toSorted() | 119837257 | 0.000 | 0.71× |
| fast-multisort | 85598041 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.39× |
| es-toolkit.orderBy | 49932190 | 0.000 | 1.71× |
| sort-on | 49932190 | 0.000 | 1.71× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 2.69× |
| thenby | 29959314 | 0.000 | 2.86× |
| sort-by | 29127111 | 0.000 | 2.94× |
| fast-sort | 20971520 | 0.000 | 4.08× |
| ramda.sortWith | 18078897 | 0.000 | 4.73× |
| sort-array | 17476267 | 0.000 | 4.90× |
| remeda.sortBy | 15420235 | 0.000 | 5.55× |
| underscore.sortBy | 13797053 | 0.000 | 6.20× |
| lodash.orderBy | 9362286 | 0.000 | 9.14× |
| natural-orderby | 3744914 | 0.000 | 22.86× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.44× |
| inline comparator chain, toSorted() | 119837257 | 0.000 | 0.70× |
| fast-multisort | 83886080 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.36× |
| es-toolkit.orderBy | 49932190 | 0.000 | 1.68× |
| sort-on | 49932190 | 0.000 | 1.68× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 2.56× |
| thenby | 29959314 | 0.000 | 2.80× |
| sort-by | 29127111 | 0.000 | 2.88× |
| fast-sort | 20971520 | 0.000 | 4.00× |
| ramda.sortWith | 18724571 | 0.000 | 4.48× |
| sort-array | 17476267 | 0.000 | 4.80× |
| remeda.sortBy | 14169946 | 0.000 | 5.92× |
| underscore.sortBy | 13443282 | 0.000 | 6.24× |
| lodash.orderBy | 9362286 | 0.000 | 8.96× |
| natural-orderby | 1560381 | 0.001 | 53.76× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.44× |
| inline comparator chain, toSorted() | 119837257 | 0.000 | 0.70× |
| fast-multisort | 83886080 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.36× |
| es-toolkit.orderBy | 49932190 | 0.000 | 1.68× |
| sort-on | 49932190 | 0.000 | 1.68× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 2.56× |
| thenby | 29959314 | 0.000 | 2.80× |
| sort-by | 29127111 | 0.000 | 2.88× |
| fast-sort | 20971520 | 0.000 | 4.00× |
| ramda.sortWith | 18078897 | 0.000 | 4.64× |
| sort-array | 17476267 | 0.000 | 4.80× |
| remeda.sortBy | 14169946 | 0.000 | 5.92× |
| underscore.sortBy | 13797053 | 0.000 | 6.08× |
| lodash.orderBy | 9362286 | 0.000 | 8.96× |
| natural-orderby | 2520615 | 0.000 | 33.28× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.44× |
| inline comparator chain, toSorted() | 116508444 | 0.000 | 0.72× |
| fast-multisort | 83886080 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.36× |
| sort-on | 49932190 | 0.000 | 1.68× |
| es-toolkit.orderBy | 47662545 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 2.64× |
| thenby | 29959314 | 0.000 | 2.80× |
| sort-by | 28339892 | 0.000 | 2.96× |
| fast-sort | 20164923 | 0.000 | 4.16× |
| ramda.sortWith | 18078897 | 0.000 | 4.64× |
| sort-array | 17476267 | 0.000 | 4.80× |
| remeda.sortBy | 13797053 | 0.000 | 6.08× |
| underscore.sortBy | 13107200 | 0.000 | 6.40× |
| lodash.orderBy | 9039448 | 0.000 | 9.28× |
| natural-orderby | 2259862 | 0.000 | 37.12× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.44× |
| inline comparator chain, toSorted() | 119837257 | 0.000 | 0.70× |
| fast-multisort | 83886080 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.36× |
| es-toolkit.orderBy | 49932190 | 0.000 | 1.68× |
| sort-on | 49932190 | 0.000 | 1.68× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 2.56× |
| thenby | 29127111 | 0.000 | 2.88× |
| sort-by | 29127111 | 0.000 | 2.88× |
| fast-sort | 20164923 | 0.000 | 4.16× |
| ramda.sortWith | 18078897 | 0.000 | 4.64× |
| sort-array | 17476267 | 0.000 | 4.80× |
| remeda.sortBy | 13797053 | 0.000 | 6.08× |
| underscore.sortBy | 13107200 | 0.000 | 6.40× |
| lodash.orderBy | 9362286 | 0.000 | 8.96× |
| natural-orderby | 585143 | 0.002 | 143.36× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.44× |
| inline comparator chain, toSorted() | 119837257 | 0.000 | 0.70× |
| fast-multisort | 83886080 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.36× |
| es-toolkit.orderBy | 49932190 | 0.000 | 1.68× |
| sort-on | 43690667 | 0.000 | 1.92× |
| thenby | 29959314 | 0.000 | 2.80× |
| sort-by | 29127111 | 0.000 | 2.88× |
| Array.prototype.sort, decorated | 24966095 | 0.000 | 3.36× |
| fast-sort | 20971520 | 0.000 | 4.00× |
| ramda.sortWith | 16912516 | 0.000 | 4.96× |
| remeda.sortBy | 15887515 | 0.000 | 5.28× |
| sort-array | 15887515 | 0.000 | 5.28× |
| underscore.sortBy | 13443282 | 0.000 | 6.24× |
| lodash.orderBy | 9362286 | 0.000 | 8.96× |
| natural-orderby | 2730667 | 0.000 | 30.72× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.46× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.71× |
| fast-multisort | 87381333 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.42× |
| es-toolkit.orderBy | 49932190 | 0.000 | 1.75× |
| sort-on | 43690667 | 0.000 | 2.00× |
| thenby | 30840471 | 0.000 | 2.83× |
| sort-by | 29959314 | 0.000 | 2.92× |
| Array.prototype.sort, decorated | 24966095 | 0.000 | 3.50× |
| fast-sort | 20971520 | 0.000 | 4.17× |
| ramda.sortWith | 16912516 | 0.000 | 5.17× |
| remeda.sortBy | 15887515 | 0.000 | 5.50× |
| sort-array | 15887515 | 0.000 | 5.50× |
| underscore.sortBy | 13797053 | 0.000 | 6.33× |
| lodash.orderBy | 9362286 | 0.000 | 9.33× |
| natural-orderby | 2730667 | 0.000 | 32.00× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.44× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.68× |
| fast-multisort | 83886080 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.36× |
| es-toolkit.orderBy | 49932190 | 0.000 | 1.68× |
| sort-on | 43690667 | 0.000 | 1.92× |
| thenby | 30840471 | 0.000 | 2.72× |
| sort-by | 29959314 | 0.000 | 2.80× |
| Array.prototype.sort, decorated | 24385488 | 0.000 | 3.44× |
| fast-sort | 20971520 | 0.000 | 4.00× |
| ramda.sortWith | 16912516 | 0.000 | 4.96× |
| remeda.sortBy | 15887515 | 0.000 | 5.28× |
| sort-array | 15887515 | 0.000 | 5.28× |
| underscore.sortBy | 13107200 | 0.000 | 6.40× |
| lodash.orderBy | 9362286 | 0.000 | 8.96× |
| natural-orderby | 2621440 | 0.000 | 32.00× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.71× |
| fast-multisort | 87381333 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.42× |
| es-toolkit.orderBy | 49932190 | 0.000 | 1.75× |
| sort-on | 49932190 | 0.000 | 1.75× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 2.67× |
| sort-by | 26214400 | 0.000 | 3.33× |
| sort-array | 18078897 | 0.000 | 4.83× |
| fast-sort | 15887515 | 0.000 | 5.50× |
| thenby | 12483048 | 0.000 | 7.00× |
| ramda.sortWith | 9362286 | 0.000 | 9.33× |
| remeda.sortBy | 6898526 | 0.000 | 12.67× |
| lodash.orderBy | 6553600 | 0.000 | 13.33× |
| natural-orderby | 455111 | 0.002 | 192.00× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 3640889 | 0.000 | 0.62× |
| inline comparator chain, toSorted() | 3542486 | 0.000 | 0.64× |
| thenby | 3276800 | 0.000 | 0.69× |
| fast-sort | 2730667 | 0.000 | 0.83× |
| es-toolkit.orderBy | 2340571 | 0.000 | 0.97× |
| remeda.sortBy | 2340571 | 0.000 | 0.97× |
| Array.prototype.sort, decorated | 2340571 | 0.000 | 0.97× |
| fast-multisort | 2259862 | 0.000 | 1.00× |
| underscore.sortBy | 1985939 | 0.001 | 1.14× |
| sort-array | 1820444 | 0.001 | 1.24× |
| ramda.sortWith | 1638400 | 0.001 | 1.38× |
| lodash.orderBy | 1310720 | 0.001 | 1.72× |
| just-sort-by (different order) | 1260308 | 0.001 | 1.79× |
| natural-orderby (different order) | 315077 | 0.003 | 7.17× |
| sort-on (different order) | 215579 | 0.005 | 10.48× |
| sort-by | 22261 | 0.045 | 101.52× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 3542486 | 0.000 | 0.64× |
| inline comparator chain, toSorted() | 3276800 | 0.000 | 0.69× |
| thenby | 2621440 | 0.000 | 0.86× |
| fast-sort | 2427259 | 0.000 | 0.93× |
| Array.prototype.sort, decorated | 2340571 | 0.000 | 0.97× |
| fast-multisort | 2259862 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2184533 | 0.000 | 1.03× |
| remeda.sortBy | 2184533 | 0.000 | 1.03× |
| underscore.sortBy | 1927529 | 0.001 | 1.17× |
| sort-array | 1872457 | 0.001 | 1.21× |
| ramda.sortWith | 1638400 | 0.001 | 1.38× |
| lodash.orderBy | 1365333 | 0.001 | 1.66× |
| just-sort-by | 1057032 | 0.001 | 2.14× |
| sort-on | 215579 | 0.005 | 10.48× |
| natural-orderby | 128000 | 0.008 | 17.66× |
| sort-by | 25600 | 0.039 | 88.28× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5041231 | 0.000 | 0.45× |
| inline comparator chain, toSorted() | 4854519 | 0.000 | 0.47× |
| fast-sort | 3276800 | 0.000 | 0.69× |
| just-sort-by (different order) | 3276800 | 0.000 | 0.69× |
| es-toolkit.orderBy | 2849391 | 0.000 | 0.79× |
| Array.prototype.sort, decorated | 2849391 | 0.000 | 0.79× |
| thenby (different order) | 2621440 | 0.000 | 0.86× |
| fast-multisort | 2259862 | 0.000 | 1.00× |
| remeda.sortBy (different order) | 2184533 | 0.000 | 1.03× |
| underscore.sortBy (different order) | 2048000 | 0.000 | 1.10× |
| sort-array | 1927529 | 0.001 | 1.17× |
| ramda.sortWith (different order) | 1489455 | 0.001 | 1.52× |
| lodash.orderBy | 1310720 | 0.001 | 1.72× |
| sort-on | 303407 | 0.003 | 7.45× |
| natural-orderby | 292571 | 0.003 | 7.72× |
| sort-by (different order) | 20480 | 0.049 | 110.34× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5698783 | 0.000 | 0.50× |
| inline comparator chain, toSorted() | 5461333 | 0.000 | 0.52× |
| just-sort-by | 3855059 | 0.000 | 0.74× |
| fast-sort | 3120762 | 0.000 | 0.91× |
| thenby | 3120762 | 0.000 | 0.91× |
| fast-multisort | 2849391 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 2849391 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2621440 | 0.000 | 1.09× |
| remeda.sortBy | 2520615 | 0.000 | 1.13× |
| sort-array | 2259862 | 0.000 | 1.26× |
| underscore.sortBy | 2259862 | 0.000 | 1.26× |
| ramda.sortWith | 1927529 | 0.001 | 1.48× |
| lodash.orderBy | 1560381 | 0.001 | 1.83× |
| sort-on | 221405 | 0.005 | 12.87× |
| natural-orderby | 215579 | 0.005 | 13.22× |
| sort-by | 23273 | 0.043 | 122.43× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 2849391 | 0.000 | 0.57× |
| inline comparator chain, toSorted() | 2730667 | 0.000 | 0.60× |
| thenby | 2048000 | 0.000 | 0.80× |
| fast-sort | 1820444 | 0.001 | 0.90× |
| es-toolkit.orderBy | 1724632 | 0.001 | 0.95× |
| fast-multisort | 1638400 | 0.001 | 1.00× |
| remeda.sortBy | 1638400 | 0.001 | 1.00× |
| Array.prototype.sort, decorated | 1638400 | 0.001 | 1.00× |
| underscore.sortBy | 1365333 | 0.001 | 1.20× |
| ramda.sortWith | 1310720 | 0.001 | 1.25× |
| sort-array | 1260308 | 0.001 | 1.30× |
| just-sort-by | 936229 | 0.001 | 1.75× |
| lodash.orderBy | 819200 | 0.001 | 2.00× |
| sort-on | 163840 | 0.006 | 10.00× |
| natural-orderby | 56889 | 0.018 | 28.80× |
| sort-by | 19692 | 0.051 | 83.20× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11397565 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 10082462 | 0.000 | 1.13× |
| inline comparator chain, toSorted() | 9362286 | 0.000 | 1.22× |
| just-sort-by | 6898526 | 0.000 | 1.65× |
| thenby | 6241524 | 0.000 | 1.83× |
| es-toolkit.orderBy | 5461333 | 0.000 | 2.09× |
| fast-sort | 5242880 | 0.000 | 2.17× |
| Array.prototype.sort, decorated | 4096000 | 0.000 | 2.78× |
| remeda.sortBy | 3744914 | 0.000 | 3.04× |
| sort-array | 3744914 | 0.000 | 3.04× |
| ramda.sortWith | 3640889 | 0.000 | 3.13× |
| underscore.sortBy | 2849391 | 0.000 | 4.00× |
| lodash.orderBy | 1820444 | 0.001 | 6.26× |
| sort-on | 546133 | 0.002 | 20.87× |
| natural-orderby | 341333 | 0.003 | 33.39× |
| sort-by | 60235 | 0.017 | 189.22× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9362286 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 6553600 | 0.000 | 1.43× |
| inline comparator chain, toSorted() | 5957818 | 0.000 | 1.57× |
| just-sort-by | 3449263 | 0.000 | 2.71× |
| thenby | 2849391 | 0.000 | 3.29× |
| fast-sort | 2621440 | 0.000 | 3.57× |
| es-toolkit.orderBy | 2520615 | 0.000 | 3.71× |
| remeda.sortBy | 2427259 | 0.000 | 3.86× |
| Array.prototype.sort, decorated | 2259862 | 0.000 | 4.14× |
| underscore.sortBy | 2259862 | 0.000 | 4.14× |
| ramda.sortWith | 1771243 | 0.001 | 5.29× |
| sort-array | 1724632 | 0.001 | 5.43× |
| lodash.orderBy | 1365333 | 0.001 | 6.86× |
| natural-orderby | 315077 | 0.003 | 29.71× |
| sort-on | 204800 | 0.005 | 45.71× |
| sort-by | 24381 | 0.041 | 384.00× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5242880 | 0.000 | 0.46× |
| inline comparator chain, toSorted() | 5041231 | 0.000 | 0.48× |
| just-sort-by | 2978909 | 0.000 | 0.81× |
| thenby | 2621440 | 0.000 | 0.93× |
| fast-multisort | 2427259 | 0.000 | 1.00× |
| fast-sort | 2259862 | 0.000 | 1.07× |
| es-toolkit.orderBy | 2114065 | 0.000 | 1.15× |
| remeda.sortBy | 2114065 | 0.000 | 1.15× |
| underscore.sortBy | 2114065 | 0.000 | 1.15× |
| Array.prototype.sort, decorated | 1927529 | 0.001 | 1.26× |
| ramda.sortWith | 1560381 | 0.001 | 1.56× |
| sort-array | 1489455 | 0.001 | 1.63× |
| lodash.orderBy | 1170286 | 0.001 | 2.07× |
| natural-orderby | 303407 | 0.003 | 8.00× |
| sort-on | 227556 | 0.004 | 10.67× |
| sort-by | 22261 | 0.045 | 109.04× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 3449263 | 0.000 | 0.43× |
| inline comparator chain, toSorted() | 3449263 | 0.000 | 0.43× |
| fast-multisort | 1489455 | 0.001 | 1.00× |
| es-toolkit.orderBy | 1489455 | 0.001 | 1.00× |
| Array.prototype.sort, decorated | 1489455 | 0.001 | 1.00× |
| thenby (different order) | 1424696 | 0.001 | 1.05× |
| remeda.sortBy (different order) | 1310720 | 0.001 | 1.14× |
| sort-array (different order) | 1213630 | 0.001 | 1.23× |
| ramda.sortWith (different order) | 1129931 | 0.001 | 1.32× |
| fast-sort (different order) | 1092267 | 0.001 | 1.36× |
| lodash.orderBy | 630154 | 0.002 | 2.36× |
| sort-on (different order) | 178087 | 0.006 | 8.36× |
| natural-orderby (different order) | 44522 | 0.022 | 33.45× |
| sort-by (different order) | 20480 | 0.049 | 72.73× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 399610 | 0.003 | 1.00× |
| inline comparator chain, slice().sort() | 204800 | 0.005 | 1.95× |
| inline comparator chain, toSorted() | 195048 | 0.005 | 2.05× |
| underscore.sortBy | 136533 | 0.007 | 2.93× |
| thenby | 102400 | 0.010 | 3.90× |
| remeda.sortBy | 89043 | 0.011 | 4.49× |
| fast-sort | 85333 | 0.012 | 4.68× |
| Array.prototype.sort, decorated | 85333 | 0.012 | 4.68× |
| es-toolkit.orderBy | 75852 | 0.013 | 5.27× |
| sort-array | 66065 | 0.015 | 6.05× |
| ramda.sortWith | 60235 | 0.017 | 6.63× |
| just-sort-by (different order) | 53895 | 0.019 | 7.41× |
| lodash.orderBy | 51200 | 0.020 | 7.80× |
| natural-orderby (different order) | 21333 | 0.047 | 18.73× |
| sort-on (different order) | 10667 | 0.094 | 37.46× |
| sort-by | 970 | 1.031 | 412.10× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 151704 | 0.007 | 0.90× |
| inline comparator chain, toSorted() | 141241 | 0.007 | 0.97× |
| fast-multisort | 136533 | 0.007 | 1.00× |
| underscore.sortBy | 89043 | 0.011 | 1.53× |
| thenby | 78769 | 0.013 | 1.73× |
| remeda.sortBy | 68267 | 0.015 | 2.00× |
| fast-sort | 68267 | 0.015 | 2.00× |
| Array.prototype.sort, decorated | 64000 | 0.016 | 2.13× |
| es-toolkit.orderBy | 60235 | 0.017 | 2.27× |
| ramda.sortWith | 46545 | 0.021 | 2.93× |
| sort-array | 46545 | 0.021 | 2.93× |
| just-sort-by (different order) | 34133 | 0.029 | 4.00× |
| lodash.orderBy | 33032 | 0.030 | 4.13× |
| natural-orderby (different order) | 8000 | 0.125 | 17.07× |
| sort-on (different order) | 7314 | 0.137 | 18.67× |
| sort-by | 842 | 1.188 | 162.13× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 234057 | 0.004 | 1.00× |
| inline comparator chain, slice().sort() | 234057 | 0.004 | 1.00× |
| inline comparator chain, toSorted() | 227556 | 0.004 | 1.03× |
| underscore.sortBy (different order) | 136533 | 0.007 | 1.71× |
| just-sort-by (different order) | 136533 | 0.007 | 1.71× |
| fast-sort (different order) | 107789 | 0.009 | 2.17× |
| thenby (different order) | 102400 | 0.010 | 2.29× |
| Array.prototype.sort, decorated | 93091 | 0.011 | 2.51× |
| es-toolkit.orderBy | 85333 | 0.012 | 2.74× |
| remeda.sortBy (different order) | 85333 | 0.012 | 2.74× |
| sort-array | 68267 | 0.015 | 3.43× |
| ramda.sortWith (different order) | 62061 | 0.016 | 3.77× |
| lodash.orderBy | 60235 | 0.017 | 3.89× |
| natural-orderby | 23273 | 0.043 | 10.06× |
| sort-on | 10667 | 0.094 | 21.94× |
| sort-by (different order) | 889 | 1.125 | 263.31× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 256000 | 0.004 | 0.89× |
| inline comparator chain, toSorted() | 248242 | 0.004 | 0.92× |
| fast-multisort | 227556 | 0.004 | 1.00× |
| underscore.sortBy | 132129 | 0.008 | 1.72× |
| just-sort-by | 120471 | 0.008 | 1.89× |
| fast-sort | 102400 | 0.010 | 2.22× |
| thenby | 102400 | 0.010 | 2.22× |
| remeda.sortBy | 89043 | 0.011 | 2.56× |
| Array.prototype.sort, decorated | 89043 | 0.011 | 2.56× |
| es-toolkit.orderBy | 85333 | 0.012 | 2.67× |
| sort-array | 68267 | 0.015 | 3.33× |
| lodash.orderBy | 62061 | 0.016 | 3.67× |
| ramda.sortWith | 62061 | 0.016 | 3.67× |
| natural-orderby | 18963 | 0.053 | 12.00× |
| sort-on | 8533 | 0.117 | 26.67× |
| sort-by | 889 | 1.125 | 256.00× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 124121 | 0.008 | 0.69× |
| inline comparator chain, toSorted() | 124121 | 0.008 | 0.69× |
| fast-multisort | 85333 | 0.012 | 1.00× |
| underscore.sortBy | 73143 | 0.014 | 1.17× |
| thenby | 70621 | 0.014 | 1.21× |
| fast-sort | 66065 | 0.015 | 1.29× |
| remeda.sortBy | 62061 | 0.016 | 1.38× |
| es-toolkit.orderBy | 58514 | 0.017 | 1.46× |
| Array.prototype.sort, decorated | 55351 | 0.018 | 1.54× |
| ramda.sortWith | 44522 | 0.022 | 1.92× |
| sort-array | 40960 | 0.024 | 2.08× |
| just-sort-by | 36571 | 0.027 | 2.33× |
| lodash.orderBy | 33032 | 0.030 | 2.58× |
| sort-on | 6919 | 0.145 | 12.33× |
| natural-orderby | 5120 | 0.195 | 16.67× |
| sort-by | 842 | 1.188 | 101.33× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1638400 | 0.001 | 0.69× |
| inline comparator chain, toSorted() | 1310720 | 0.001 | 0.86× |
| fast-multisort | 1129931 | 0.001 | 1.00× |
| just-sort-by | 840205 | 0.001 | 1.34× |
| thenby | 712348 | 0.001 | 1.59× |
| fast-sort | 655360 | 0.002 | 1.72× |
| es-toolkit.orderBy | 585143 | 0.002 | 1.93× |
| Array.prototype.sort, decorated | 409600 | 0.002 | 2.76× |
| ramda.sortWith | 390095 | 0.003 | 2.90× |
| underscore.sortBy | 390095 | 0.003 | 2.90× |
| sort-array | 372364 | 0.003 | 3.03× |
| remeda.sortBy | 356174 | 0.003 | 3.17× |
| lodash.orderBy | 227556 | 0.004 | 4.97× |
| sort-on | 48762 | 0.021 | 23.17× |
| natural-orderby | 35310 | 0.028 | 32.00× |
| sort-by | 5120 | 0.195 | 220.69× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1024000 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 512000 | 0.002 | 2.00× |
| inline comparator chain, toSorted() | 468114 | 0.002 | 2.19× |
| just-sort-by | 234057 | 0.004 | 4.38× |
| underscore.sortBy | 221405 | 0.005 | 4.63× |
| fast-sort | 178087 | 0.006 | 5.75× |
| remeda.sortBy | 163840 | 0.006 | 6.25× |
| thenby | 163840 | 0.006 | 6.25× |
| Array.prototype.sort, decorated | 151704 | 0.007 | 6.75× |
| es-toolkit.orderBy | 141241 | 0.007 | 7.25× |
| sort-array | 105026 | 0.010 | 9.75× |
| ramda.sortWith | 102400 | 0.010 | 10.00× |
| lodash.orderBy | 97524 | 0.010 | 10.50× |
| natural-orderby | 30118 | 0.033 | 34.00× |
| sort-on | 11636 | 0.086 | 88.00× |
| sort-by | 1280 | 0.781 | 800.00× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 819200 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 712348 | 0.001 | 1.15× |
| inline comparator chain, toSorted() | 655360 | 0.002 | 1.25× |
| just-sort-by | 390095 | 0.003 | 2.10× |
| fast-sort | 315077 | 0.003 | 2.60× |
| thenby | 315077 | 0.003 | 2.60× |
| underscore.sortBy | 282483 | 0.004 | 2.90× |
| es-toolkit.orderBy | 264258 | 0.004 | 3.10× |
| Array.prototype.sort, decorated | 234057 | 0.004 | 3.50× |
| remeda.sortBy | 204800 | 0.005 | 4.00× |
| ramda.sortWith | 178087 | 0.006 | 4.60× |
| sort-array | 178087 | 0.006 | 4.60× |
| lodash.orderBy | 141241 | 0.007 | 5.80× |
| natural-orderby | 33032 | 0.030 | 24.80× |
| sort-on | 25600 | 0.039 | 32.00× |
| sort-by | 2286 | 0.438 | 358.40× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 186182 | 0.005 | 0.48× |
| inline comparator chain, toSorted() | 178087 | 0.006 | 0.50× |
| fast-multisort | 89043 | 0.011 | 1.00× |
| Array.prototype.sort, decorated | 64000 | 0.016 | 1.39× |
| remeda.sortBy (different order) | 60235 | 0.017 | 1.48× |
| thenby (different order) | 60235 | 0.017 | 1.48× |
| es-toolkit.orderBy | 58514 | 0.017 | 1.52× |
| sort-array (different order) | 46545 | 0.021 | 1.91× |
| ramda.sortWith (different order) | 44522 | 0.022 | 2.00× |
| fast-sort (different order) | 40960 | 0.024 | 2.17× |
| lodash.orderBy | 39385 | 0.025 | 2.26× |
| sort-on (different order) | 7314 | 0.137 | 12.17× |
| natural-orderby (different order) | 4129 | 0.242 | 21.57× |
| sort-by (different order) | 667 | 1.500 | 133.57× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42667 | 0.023 | 1.00× |
| inline comparator chain, slice().sort() | 12800 | 0.078 | 3.33× |
| inline comparator chain, toSorted() | 12190 | 0.082 | 3.50× |
| underscore.sortBy | 9846 | 0.102 | 4.33× |
| thenby | 6564 | 0.152 | 6.50× |
| remeda.sortBy | 6095 | 0.164 | 7.00× |
| fast-sort | 5818 | 0.172 | 7.33× |
| Array.prototype.sort, decorated | 5818 | 0.172 | 7.33× |
| es-toolkit.orderBy | 5120 | 0.195 | 8.33× |
| sort-array | 4571 | 0.219 | 9.33× |
| ramda.sortWith | 3879 | 0.258 | 11.00× |
| lodash.orderBy | 3765 | 0.266 | 11.33× |
| just-sort-by (different order) | 3459 | 0.289 | 12.33× |
| natural-orderby (different order) | 1684 | 0.594 | 25.33× |
| sort-on (different order) | 696 | 1.438 | 61.33× |
| sort-by | 65 | 15.500 | 661.33× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 8533 | 0.117 | 1.00× |
| inline comparator chain, slice().sort() | 8000 | 0.125 | 1.07× |
| inline comparator chain, toSorted() | 8000 | 0.125 | 1.07× |
| underscore.sortBy | 5120 | 0.195 | 1.67× |
| thenby | 4741 | 0.211 | 1.80× |
| fast-sort | 4414 | 0.227 | 1.93× |
| remeda.sortBy | 4267 | 0.234 | 2.00× |
| es-toolkit.orderBy | 3879 | 0.258 | 2.20× |
| Array.prototype.sort, decorated | 3879 | 0.258 | 2.20× |
| ramda.sortWith | 3200 | 0.313 | 2.67× |
| sort-array | 3048 | 0.328 | 2.80× |
| lodash.orderBy | 2207 | 0.453 | 3.87× |
| just-sort-by (different order) | 2207 | 0.453 | 3.87× |
| natural-orderby (different order) | 615 | 1.625 | 13.87× |
| sort-on (different order) | 500 | 2.000 | 17.07× |
| sort-by | 59 | 17.000 | 145.07× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 23273 | 0.043 | 1.00× |
| inline comparator chain, slice().sort() | 13474 | 0.074 | 1.73× |
| inline comparator chain, toSorted() | 13474 | 0.074 | 1.73× |
| underscore.sortBy (different order) | 9143 | 0.109 | 2.55× |
| just-sort-by (different order) | 7758 | 0.129 | 3.00× |
| fast-sort (different order) | 7111 | 0.141 | 3.27× |
| thenby (different order) | 6919 | 0.145 | 3.36× |
| Array.prototype.sort, decorated | 6400 | 0.156 | 3.64× |
| remeda.sortBy (different order) | 6095 | 0.164 | 3.82× |
| es-toolkit.orderBy | 5818 | 0.172 | 4.00× |
| sort-array | 4571 | 0.219 | 5.09× |
| lodash.orderBy | 4129 | 0.242 | 5.64× |
| ramda.sortWith (different order) | 4129 | 0.242 | 5.64× |
| natural-orderby | 1939 | 0.516 | 12.00× |
| sort-on | 727 | 1.375 | 32.00× |
| sort-by (different order) | 63 | 16.000 | 372.36× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 23273 | 0.043 | 1.00× |
| inline comparator chain, slice().sort() | 12190 | 0.082 | 1.91× |
| inline comparator chain, toSorted() | 12190 | 0.082 | 1.91× |
| underscore.sortBy | 8828 | 0.113 | 2.64× |
| just-sort-by | 7758 | 0.129 | 3.00× |
| thenby | 6737 | 0.148 | 3.45× |
| fast-sort | 6400 | 0.156 | 3.64× |
| Array.prototype.sort, decorated | 6095 | 0.164 | 3.82× |
| remeda.sortBy | 5818 | 0.172 | 4.00× |
| es-toolkit.orderBy | 5565 | 0.180 | 4.18× |
| sort-array | 4571 | 0.219 | 5.09× |
| ramda.sortWith | 4267 | 0.234 | 5.45× |
| lodash.orderBy | 4129 | 0.242 | 5.64× |
| natural-orderby | 1524 | 0.656 | 15.27× |
| sort-on | 571 | 1.750 | 40.73× |
| sort-by | 59 | 17.000 | 395.64× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7529 | 0.133 | 1.00× |
| inline comparator chain, toSorted() | 6400 | 0.156 | 1.18× |
| inline comparator chain, slice().sort() | 6095 | 0.164 | 1.24× |
| underscore.sortBy | 4267 | 0.234 | 1.76× |
| thenby | 4129 | 0.242 | 1.82× |
| fast-sort | 4000 | 0.250 | 1.88× |
| remeda.sortBy | 3879 | 0.258 | 1.94× |
| es-toolkit.orderBy | 3556 | 0.281 | 2.12× |
| Array.prototype.sort, decorated | 3556 | 0.281 | 2.12× |
| ramda.sortWith | 2909 | 0.344 | 2.59× |
| sort-array | 2783 | 0.359 | 2.71× |
| just-sort-by | 2370 | 0.422 | 3.18× |
| lodash.orderBy | 2133 | 0.469 | 3.53× |
| sort-on | 471 | 2.125 | 16.00× |
| natural-orderby | 432 | 2.313 | 17.41× |
| sort-by | 56 | 18.000 | 135.53× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 170667 | 0.006 | 0.69× |
| inline comparator chain, toSorted() | 136533 | 0.007 | 0.86× |
| fast-multisort | 117029 | 0.009 | 1.00× |
| just-sort-by | 89043 | 0.011 | 1.31× |
| thenby | 75852 | 0.013 | 1.54× |
| fast-sort | 73143 | 0.014 | 1.60× |
| es-toolkit.orderBy | 60235 | 0.017 | 1.94× |
| ramda.sortWith | 42667 | 0.023 | 2.74× |
| Array.prototype.sort, decorated | 42667 | 0.023 | 2.74× |
| underscore.sortBy | 40960 | 0.024 | 2.86× |
| sort-array | 39385 | 0.025 | 2.97× |
| remeda.sortBy | 37926 | 0.026 | 3.09× |
| lodash.orderBy | 22261 | 0.045 | 5.26× |
| sort-on | 5120 | 0.195 | 22.86× |
| natural-orderby | 3368 | 0.297 | 34.74× |
| sort-by | 533 | 1.875 | 219.43× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 107789 | 0.009 | 1.00× |
| inline comparator chain, slice().sort() | 37926 | 0.026 | 2.84× |
| inline comparator chain, toSorted() | 35310 | 0.028 | 3.05× |
| underscore.sortBy | 17655 | 0.057 | 6.11× |
| just-sort-by | 17067 | 0.059 | 6.32× |
| remeda.sortBy | 12800 | 0.078 | 8.42× |
| fast-sort | 12800 | 0.078 | 8.42× |
| thenby | 11636 | 0.086 | 9.26× |
| Array.prototype.sort, decorated | 11636 | 0.086 | 9.26× |
| es-toolkit.orderBy | 9846 | 0.102 | 10.95× |
| lodash.orderBy | 7529 | 0.133 | 14.32× |
| ramda.sortWith | 7529 | 0.133 | 14.32× |
| sort-array | 7529 | 0.133 | 14.32× |
| natural-orderby | 2560 | 0.391 | 42.11× |
| sort-on | 821 | 1.219 | 131.37× |
| sort-by | 87 | 11.500 | 1239.58× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 89043 | 0.011 | 1.00× |
| inline comparator chain, slice().sort() | 85333 | 0.012 | 1.04× |
| inline comparator chain, toSorted() | 73143 | 0.014 | 1.22× |
| just-sort-by | 44522 | 0.022 | 2.00× |
| fast-sort | 36571 | 0.027 | 2.43× |
| thenby | 36571 | 0.027 | 2.43× |
| underscore.sortBy | 31030 | 0.032 | 2.87× |
| es-toolkit.orderBy | 30118 | 0.033 | 2.96× |
| Array.prototype.sort, decorated | 25600 | 0.039 | 3.48× |
| remeda.sortBy | 23273 | 0.043 | 3.83× |
| ramda.sortWith | 20480 | 0.049 | 4.35× |
| sort-array | 19692 | 0.051 | 4.52× |
| lodash.orderBy | 15059 | 0.066 | 5.91× |
| natural-orderby | 3048 | 0.328 | 29.22× |
| sort-on | 2783 | 0.359 | 32.00× |
| sort-by | 258 | 3.875 | 345.04× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 10240 | 0.098 | 0.86× |
| inline comparator chain, toSorted() | 9846 | 0.102 | 0.90× |
| fast-multisort | 8828 | 0.113 | 1.00× |
| Array.prototype.sort, decorated | 4000 | 0.250 | 2.21× |
| thenby (different order) | 3765 | 0.266 | 2.34× |
| remeda.sortBy (different order) | 3657 | 0.273 | 2.41× |
| es-toolkit.orderBy | 3459 | 0.289 | 2.55× |
| lodash.orderBy | 2783 | 0.359 | 3.17× |
| sort-array (different order) | 2783 | 0.359 | 3.17× |
| ramda.sortWith (different order) | 2667 | 0.375 | 3.31× |
| fast-sort (different order) | 2462 | 0.406 | 3.59× |
| sort-on (different order) | 421 | 2.375 | 20.97× |
| natural-orderby (different order) | 348 | 2.875 | 25.38× |
| sort-by (different order) | 37 | 27.000 | 238.34× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3879 | 0.258 | 1.00× |
| inline comparator chain, slice().sort() | 889 | 1.125 | 4.36× |
| inline comparator chain, toSorted() | 865 | 1.156 | 4.48× |
| underscore.sortBy | 727 | 1.375 | 5.33× |
| thenby | 500 | 2.000 | 7.76× |
| remeda.sortBy | 457 | 2.188 | 8.48× |
| fast-sort | 444 | 2.250 | 8.73× |
| Array.prototype.sort, decorated | 444 | 2.250 | 8.73× |
| es-toolkit.orderBy | 381 | 2.625 | 10.18× |
| sort-array | 320 | 3.125 | 12.12× |
| ramda.sortWith | 286 | 3.500 | 13.58× |
| lodash.orderBy | 267 | 3.750 | 14.55× |
| just-sort-by (different order) | 242 | 4.125 | 16.00× |
| natural-orderby (different order) | 118 | 8.500 | 32.97× |
| sort-on (different order) | 53 | 19.000 | 73.70× |
| sort-by | 4 | 227.000 | 880.48× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 615 | 1.625 | 1.00× |
| inline comparator chain, slice().sort() | 444 | 2.250 | 1.38× |
| inline comparator chain, toSorted() | 444 | 2.250 | 1.38× |
| thenby | 308 | 3.250 | 2.00× |
| underscore.sortBy | 308 | 3.250 | 2.00× |
| fast-sort | 296 | 3.375 | 2.08× |
| remeda.sortBy | 286 | 3.500 | 2.15× |
| es-toolkit.orderBy | 267 | 3.750 | 2.31× |
| Array.prototype.sort, decorated | 250 | 4.000 | 2.46× |
| ramda.sortWith | 216 | 4.625 | 2.85× |
| sort-array | 205 | 4.875 | 3.00× |
| lodash.orderBy | 143 | 7.000 | 4.31× |
| just-sort-by (different order) | 133 | 7.500 | 4.62× |
| sort-on (different order) | 34 | 29.000 | 17.85× |
| natural-orderby (different order) | 34 | 29.000 | 17.85× |
| sort-by | 4 | 249.000 | 153.23× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2667 | 0.375 | 1.00× |
| inline comparator chain, toSorted() | 889 | 1.125 | 3.00× |
| inline comparator chain, slice().sort() | 865 | 1.156 | 3.08× |
| underscore.sortBy (different order) | 640 | 1.563 | 4.17× |
| just-sort-by (different order) | 571 | 1.750 | 4.67× |
| fast-sort (different order) | 500 | 2.000 | 5.33× |
| thenby (different order) | 485 | 2.063 | 5.50× |
| remeda.sortBy (different order) | 432 | 2.313 | 6.17× |
| es-toolkit.orderBy | 421 | 2.375 | 6.33× |
| Array.prototype.sort, decorated | 421 | 2.375 | 6.33× |
| sort-array | 333 | 3.000 | 8.00× |
| ramda.sortWith (different order) | 296 | 3.375 | 9.00× |
| lodash.orderBy | 276 | 3.625 | 9.67× |
| natural-orderby | 138 | 7.250 | 19.33× |
| sort-on | 53 | 19.000 | 50.67× |
| sort-by (different order) | 4 | 232.000 | 618.67× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2560 | 0.391 | 1.00× |
| inline comparator chain, slice().sort() | 762 | 1.313 | 3.36× |
| inline comparator chain, toSorted() | 727 | 1.375 | 3.52× |
| underscore.sortBy | 640 | 1.563 | 4.00× |
| just-sort-by | 533 | 1.875 | 4.80× |
| thenby | 471 | 2.125 | 5.44× |
| fast-sort | 457 | 2.188 | 5.60× |
| remeda.sortBy | 432 | 2.313 | 5.92× |
| Array.prototype.sort, decorated | 421 | 2.375 | 6.08× |
| es-toolkit.orderBy | 400 | 2.500 | 6.40× |
| sort-array | 333 | 3.000 | 7.68× |
| ramda.sortWith | 296 | 3.375 | 8.64× |
| lodash.orderBy | 276 | 3.625 | 9.28× |
| natural-orderby | 114 | 8.750 | 22.40× |
| sort-on | 40 | 25.000 | 64.00× |
| sort-by | 4 | 243.000 | 622.08× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 533 | 1.875 | 1.00× |
| inline comparator chain, slice().sort() | 364 | 2.750 | 1.47× |
| inline comparator chain, toSorted() | 364 | 2.750 | 1.47× |
| underscore.sortBy | 286 | 3.500 | 1.87× |
| thenby | 276 | 3.625 | 1.93× |
| remeda.sortBy | 258 | 3.875 | 2.07× |
| fast-sort | 258 | 3.875 | 2.07× |
| es-toolkit.orderBy | 235 | 4.250 | 2.27× |
| Array.prototype.sort, decorated | 235 | 4.250 | 2.27× |
| ramda.sortWith | 200 | 5.000 | 2.67× |
| sort-array | 190 | 5.250 | 2.80× |
| just-sort-by | 154 | 6.500 | 3.47× |
| lodash.orderBy | 138 | 7.250 | 3.87× |
| sort-on | 32 | 31.000 | 16.53× |
| natural-orderby | 24 | 42.000 | 22.40× |
| sort-by | 4 | 265.000 | 141.33× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 14629 | 0.068 | 0.80× |
| fast-multisort | 11636 | 0.086 | 1.00× |
| inline comparator chain, toSorted() | 11130 | 0.090 | 1.05× |
| just-sort-by | 7758 | 0.129 | 1.50× |
| thenby | 6919 | 0.145 | 1.68× |
| fast-sort | 6737 | 0.148 | 1.73× |
| es-toolkit.orderBy | 5565 | 0.180 | 2.09× |
| ramda.sortWith | 4000 | 0.250 | 2.91× |
| underscore.sortBy | 4000 | 0.250 | 2.91× |
| sort-array | 3879 | 0.258 | 3.00× |
| Array.prototype.sort, decorated | 3879 | 0.258 | 3.00× |
| remeda.sortBy | 3765 | 0.266 | 3.09× |
| lodash.orderBy | 2065 | 0.484 | 5.64× |
| sort-on | 500 | 2.000 | 23.27× |
| natural-orderby | 286 | 3.500 | 40.73× |
| sort-by | 53 | 19.000 | 221.09× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10667 | 0.094 | 1.00× |
| inline comparator chain, slice().sort() | 2909 | 0.344 | 3.67× |
| inline comparator chain, toSorted() | 2783 | 0.359 | 3.83× |
| underscore.sortBy | 1524 | 0.656 | 7.00× |
| just-sort-by | 1333 | 0.750 | 8.00× |
| remeda.sortBy | 1032 | 0.969 | 10.33× |
| fast-sort | 1000 | 1.000 | 10.67× |
| thenby | 941 | 1.063 | 11.33× |
| Array.prototype.sort, decorated | 914 | 1.094 | 11.67× |
| es-toolkit.orderBy | 821 | 1.219 | 13.00× |
| lodash.orderBy | 593 | 1.688 | 18.00× |
| ramda.sortWith | 593 | 1.688 | 18.00× |
| sort-array | 593 | 1.688 | 18.00× |
| natural-orderby | 200 | 5.000 | 53.33× |
| sort-on | 63 | 16.000 | 170.67× |
| sort-by | 7 | 145.000 | 1546.67× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9481 | 0.105 | 1.00× |
| inline comparator chain, slice().sort() | 6400 | 0.156 | 1.48× |
| inline comparator chain, toSorted() | 5818 | 0.172 | 1.63× |
| just-sort-by | 3459 | 0.289 | 2.74× |
| fast-sort | 2783 | 0.359 | 3.41× |
| thenby | 2783 | 0.359 | 3.41× |
| underscore.sortBy | 2560 | 0.391 | 3.70× |
| es-toolkit.orderBy | 2286 | 0.438 | 4.15× |
| Array.prototype.sort, decorated | 2133 | 0.469 | 4.44× |
| remeda.sortBy | 1882 | 0.531 | 5.04× |
| ramda.sortWith | 1600 | 0.625 | 5.93× |
| sort-array | 1600 | 0.625 | 5.93× |
| lodash.orderBy | 1185 | 0.844 | 8.00× |
| natural-orderby | 250 | 4.000 | 37.93× |
| sort-on | 222 | 4.500 | 42.67× |
| sort-by | 20 | 51.000 | 483.56× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1231 | 0.813 | 1.00× |
| inline comparator chain, slice().sort() | 615 | 1.625 | 2.00× |
| inline comparator chain, toSorted() | 615 | 1.625 | 2.00× |
| Array.prototype.sort, decorated | 276 | 3.625 | 4.46× |
| thenby (different order) | 267 | 3.750 | 4.62× |
| remeda.sortBy (different order) | 250 | 4.000 | 4.92× |
| es-toolkit.orderBy | 235 | 4.250 | 5.23× |
| lodash.orderBy | 200 | 5.000 | 6.15× |
| sort-array (different order) | 190 | 5.250 | 6.46× |
| ramda.sortWith (different order) | 182 | 5.500 | 6.77× |
| fast-sort (different order) | 167 | 6.000 | 7.38× |
| natural-orderby (different order) | 29 | 34.000 | 41.85× |
| sort-on (different order) | 28 | 36.000 | 44.31× |
| sort-by (different order) | 2 | 482.000 | 593.23× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 348 | 2.875 | 1.00× |
| inline comparator chain, slice().sort() | 65 | 15.500 | 5.39× |
| inline comparator chain, toSorted() | 65 | 15.500 | 5.39× |
| underscore.sortBy | 59 | 17.000 | 5.91× |
| remeda.sortBy | 36 | 28.000 | 9.74× |
| thenby | 36 | 28.000 | 9.74× |
| Array.prototype.sort, decorated | 31 | 32.000 | 11.13× |
| fast-sort | 30 | 33.000 | 11.48× |
| es-toolkit.orderBy | 28 | 36.000 | 12.52× |
| sort-array | 24 | 41.000 | 14.26× |
| ramda.sortWith | 20 | 49.000 | 17.04× |
| just-sort-by (different order) | 17 | 60.000 | 20.87× |
| lodash.orderBy | 15 | 68.000 | 23.65× |
| natural-orderby (different order) | 7 | 136.000 | 47.30× |
| sort-on (different order) | 4 | 270.000 | 93.91× |
| sort-by | 0 | 3335.000 | 1160.00× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42 | 24.000 | 1.00× |
| inline comparator chain, toSorted() | 26 | 38.000 | 1.58× |
| inline comparator chain, slice().sort() | 25 | 40.000 | 1.67× |
| fast-sort | 19 | 52.000 | 2.17× |
| thenby | 19 | 54.000 | 2.25× |
| underscore.sortBy | 18 | 55.000 | 2.29× |
| remeda.sortBy | 17 | 58.000 | 2.42× |
| es-toolkit.orderBy | 16 | 63.000 | 2.63× |
| sort-array | 14 | 73.000 | 3.04× |
| Array.prototype.sort, decorated | 14 | 73.000 | 3.04× |
| ramda.sortWith | 13 | 75.000 | 3.13× |
| just-sort-by (different order) | 8 | 119.000 | 4.96× |
| lodash.orderBy | 7 | 145.000 | 6.04× |
| natural-orderby (different order) | 3 | 398.000 | 16.58× |
| sort-on (different order) | 2 | 421.000 | 17.54× |
| sort-by | 0 | 3626.000 | 151.08× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 258 | 3.875 | 1.00× |
| inline comparator chain, slice().sort() | 61 | 16.500 | 4.26× |
| inline comparator chain, toSorted() | 59 | 17.000 | 4.39× |
| underscore.sortBy (different order) | 43 | 23.000 | 5.94× |
| just-sort-by (different order) | 40 | 25.000 | 6.45× |
| fast-sort (different order) | 37 | 27.000 | 6.97× |
| thenby (different order) | 36 | 28.000 | 7.23× |
| remeda.sortBy (different order) | 30 | 33.000 | 8.52× |
| es-toolkit.orderBy | 28 | 36.000 | 9.29× |
| Array.prototype.sort, decorated | 25 | 40.000 | 10.32× |
| sort-array | 24 | 41.000 | 10.58× |
| ramda.sortWith (different order) | 22 | 45.000 | 11.61× |
| lodash.orderBy | 14 | 72.000 | 18.58× |
| natural-orderby | 7 | 142.000 | 36.65× |
| sort-on | 4 | 265.000 | 68.39× |
| sort-by (different order) | 0 | 3404.000 | 878.45× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 229 | 4.375 | 1.00× |
| inline comparator chain, toSorted() | 53 | 19.000 | 4.34× |
| inline comparator chain, slice().sort() | 49 | 20.500 | 4.69× |
| underscore.sortBy | 45 | 22.000 | 5.03× |
| just-sort-by | 38 | 26.000 | 5.94× |
| thenby | 33 | 30.000 | 6.86× |
| fast-sort | 30 | 33.000 | 7.54× |
| remeda.sortBy | 29 | 35.000 | 8.00× |
| Array.prototype.sort, decorated | 26 | 38.000 | 8.69× |
| es-toolkit.orderBy | 26 | 39.000 | 8.91× |
| sort-array | 24 | 42.000 | 9.60× |
| ramda.sortWith | 22 | 46.000 | 10.51× |
| lodash.orderBy | 11 | 87.000 | 19.89× |
| natural-orderby | 6 | 157.000 | 35.89× |
| sort-on | 3 | 347.000 | 79.31× |
| sort-by | 0 | 3520.000 | 804.57× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 29 | 34.000 | 1.00× |
| inline comparator chain, slice().sort() | 21 | 47.000 | 1.38× |
| inline comparator chain, toSorted() | 21 | 47.000 | 1.38× |
| underscore.sortBy | 18 | 55.000 | 1.62× |
| thenby | 16 | 61.000 | 1.79× |
| fast-sort | 16 | 64.000 | 1.88× |
| remeda.sortBy | 14 | 69.000 | 2.03× |
| es-toolkit.orderBy | 14 | 71.000 | 2.09× |
| Array.prototype.sort, decorated | 14 | 73.000 | 2.15× |
| sort-array | 13 | 80.000 | 2.35× |
| ramda.sortWith | 12 | 85.000 | 2.50× |
| just-sort-by | 9 | 109.000 | 3.21× |
| lodash.orderBy | 6 | 158.000 | 4.65× |
| sort-on | 2 | 444.000 | 13.06× |
| natural-orderby (different order) | 2 | 526.000 | 15.47× |
| sort-by | 0 | 3696.000 | 108.71× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1103 | 0.906 | 1.00× |
| inline comparator chain, slice().sort() | 1067 | 0.938 | 1.03× |
| inline comparator chain, toSorted() | 941 | 1.063 | 1.17× |
| just-sort-by | 640 | 1.563 | 1.72× |
| thenby | 593 | 1.688 | 1.86× |
| fast-sort | 571 | 1.750 | 1.93× |
| es-toolkit.orderBy | 485 | 2.063 | 2.28× |
| ramda.sortWith | 364 | 2.750 | 3.03× |
| sort-array | 348 | 2.875 | 3.17× |
| remeda.sortBy | 333 | 3.000 | 3.31× |
| underscore.sortBy | 333 | 3.000 | 3.31× |
| Array.prototype.sort, decorated | 229 | 4.375 | 4.83× |
| lodash.orderBy | 129 | 7.750 | 8.55× |
| sort-on | 48 | 21.000 | 23.17× |
| natural-orderby | 22 | 45.000 | 49.66× |
| sort-by | 5 | 205.000 | 226.21× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1032 | 0.969 | 1.00× |
| inline comparator chain, slice().sort() | 229 | 4.375 | 4.52× |
| inline comparator chain, toSorted() | 222 | 4.500 | 4.65× |
| just-sort-by | 108 | 9.250 | 9.55× |
| underscore.sortBy | 103 | 9.750 | 10.06× |
| remeda.sortBy | 80 | 12.500 | 12.90× |
| fast-sort | 80 | 12.500 | 12.90× |
| thenby | 74 | 13.500 | 13.94× |
| Array.prototype.sort, decorated | 74 | 13.500 | 13.94× |
| es-toolkit.orderBy | 65 | 15.500 | 16.00× |
| ramda.sortWith | 48 | 21.000 | 21.68× |
| sort-array | 48 | 21.000 | 21.68× |
| lodash.orderBy | 43 | 23.000 | 23.74× |
| natural-orderby | 13 | 77.000 | 79.48× |
| sort-on | 5 | 201.000 | 207.48× |
| sort-by | 0 | 2053.000 | 2119.23× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 941 | 1.063 | 1.00× |
| inline comparator chain, slice().sort() | 571 | 1.750 | 1.65× |
| inline comparator chain, toSorted() | 552 | 1.813 | 1.71× |
| just-sort-by | 333 | 3.000 | 2.82× |
| fast-sort | 286 | 3.500 | 3.29× |
| thenby | 286 | 3.500 | 3.29× |
| es-toolkit.orderBy | 235 | 4.250 | 4.00× |
| underscore.sortBy | 229 | 4.375 | 4.12× |
| remeda.sortBy | 190 | 5.250 | 4.94× |
| Array.prototype.sort, decorated | 182 | 5.500 | 5.18× |
| ramda.sortWith | 167 | 6.000 | 5.65× |
| sort-array | 167 | 6.000 | 5.65× |
| lodash.orderBy | 91 | 11.000 | 10.35× |
| sort-on | 23 | 44.000 | 41.41× |
| natural-orderby | 20 | 49.000 | 46.12× |
| sort-by | 2 | 502.000 | 472.47× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 87 | 11.500 | 1.00× |
| inline comparator chain, slice().sort() | 42 | 24.000 | 2.09× |
| inline comparator chain, toSorted() | 42 | 24.000 | 2.09× |
| thenby (different order) | 18 | 57.000 | 4.96× |
| remeda.sortBy (different order) | 17 | 59.000 | 5.13× |
| es-toolkit.orderBy | 17 | 60.000 | 5.22× |
| Array.prototype.sort, decorated | 16 | 61.000 | 5.30× |
| ramda.sortWith (different order) | 13 | 75.000 | 6.52× |
| sort-array (different order) | 13 | 76.000 | 6.61× |
| lodash.orderBy | 11 | 93.000 | 8.09× |
| fast-sort (different order) | 10 | 96.000 | 8.35× |
| natural-orderby (different order) | 2 | 442.000 | 38.43× |
| sort-on (different order) | 2 | 509.000 | 44.26× |
| sort-by (different order) | 0 | 6272.000 | 545.39× |

</details>

<!-- browsers:end -->

Run `pnpm bench` (or `pnpm bench --sizes=100,10000` for a subset) and `pnpm bench:browsers` to reproduce; `pnpm bench:readme` rewrites the tables above. What each competitor does and which of their ideas ended up in here: [benchmark/COMPETITORS.md](benchmark/COMPETITORS.md).

The honest footnote: a hand-written comparator chain passed to the native sort is the thing to beat. It wins at ten rows by up to 2.5×, where a sort takes a few hundred nanoseconds and our key pass is most of it, and at a hundred rows by up to 2× on three keys. It also wins on input that is already in order or has one row moved, in V8 at every size (up to 2.2× in Chromium, 1.6× in node) and in WebKit and Firefox up to ten thousand rows, because the native sort is linear there too and skips our key pass. At ten rows some libraries are ahead as well, by up to 2.3× in WebKit, 1.4× in Firefox and 1.1× in V8: a couple of hundred nanoseconds that move with the JIT's state. From a hundred rows up no library beats us in any engine. From a thousand rows up on data that needs sorting we lead the inline chain by up to 8× and are within 15% of it at worst (three keys, a thousand rows, Firefox), and we lead the closest library by 1.6 to 12×. The tables are the only argument, and the scripts above regenerate them from scratch.

## How

Numbers go through a stable radix sort on their float64 bits, strings through buckets and a radix sort over the characters that actually differ, ties recurse into the next rule, and anything exotic falls back to the lodash comparator so the order stays identical to lodash. Inputs that are already in order are passed through, and inputs that are nearly in order (a list that came back sorted from the server, then had a few rows edited) are cut into their ordered runs and merged with galloping, the way TimSort does it, but on the extracted keys instead of through a comparator callback. The rest is bookkeeping.

## License

MIT
