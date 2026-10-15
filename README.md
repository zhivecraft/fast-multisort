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
- Every path returns a new dense `Array`, whatever subclass the input is; holes come back as `undefined`.
- Empty rules (`multisort`) and empty columns (`orderByColumns`) return a copy in input order; `orderBy` and `sortBy` with no iteratees sort the items themselves, as lodash does.
- A custom `compare` is always honoured; a result that is not below or above zero (`NaN` included) is a tie and falls through to the next column.
- Sorting is safe to start from inside an iteratee, `specialClass` or `compare`: every call owns its scratch memory.
- Every path returns the same elements, once each, and each iteratee is called exactly once per item (an input of fewer than two items is copied without calling it). For a consistent comparator (the built-in ones, or a `compare` that is a total order) the result never depends on which internal path ran; a `compare` that contradicts itself, for example by returning `NaN` for some pairs, has no single right answer and may order differently at different sizes.

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

Every competitor is run with its own multi-key API where it has one and checked against the lodash permutation first; `(different order)` marks results that differ (mostly where `null` lands), and the run aborts if `fast-multisort` itself differs. `inline comparator chain` is the hand-written baseline, `(a, b) => str(a.name, b.name) || rankDesc(a.rank, b.rank) || str(a.created, b.created)` passed to `rows.slice().sort()` and to `rows.toSorted()`, relying on the native sort's stability. Sizes run from 1 row to 1 million, every case and every library at every size. Each library is calibrated to a batch of at least 20 ms, then the libraries of a case take turns batch by batch, up to 25 rounds within half a second per library, and the median batch is reported. An entry whose first call already takes two seconds (sort-by, sort-on, natural-orderby and a few others at a million rows) is timed by that call alone. The same code runs in node and in the browsers, one engine at a time. Numbers below are from `pnpm bench`, Apple M5 Max, Node 24. Ops/sec, higher is better; the last column is how many times slower than `fast-multisort`.

<!-- bench:start -->

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, slice().sort() | 0.51× | 1.27× | 8.23× | 63 | 0 |
| inline comparator chain, toSorted() | 0.49× | 1.35× | 8.21× | 63 | 0 |
| just-sort-by | 0.52× | 2.20× | 15.05× | 56 | 17 |
| thenby | 1.40× | 2.40× | 12.26× | 63 | 12 |
| es-toolkit.orderBy | 1.04× | 2.44× | 14.16× | 63 | 0 |
| fast-sort | 1.59× | 2.66× | 25.96× | 63 | 6 |
| remeda.sortBy | 1.18× | 2.90× | 14.49× | 63 | 12 |
| Array.prototype.sort, decorated | 1.18× | 2.98× | 21.75× | 63 | 0 |
| underscore.sortBy | 1.36× | 3.77× | 8.76× | 56 | 6 |
| ramda.sortWith | 2.01× | 4.35× | 21.18× | 63 | 12 |
| lodash.orderBy | 1.51× | 4.83× | 21.35× | 63 | 0 |
| sort-array | 2.48× | 4.88× | 25.35× | 63 | 6 |
| natural-orderby | 4.56× | 26.66× | 144.62× | 63 | 17 |
| sort-on | 1.75× | 29.02× | 109.98× | 63 | 17 |
| sort-by | 4.43× | 204.75× | 759.45× | 63 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 267745384 | 0.000 | 0.52× |
| fast-multisort | 138245840 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 113799127 | 0.000 | 1.21× |
| es-toolkit.orderBy | 86516618 | 0.000 | 1.60× |
| sort-on | 75106282 | 0.000 | 1.84× |
| Array.prototype.sort, decorated | 63866247 | 0.000 | 2.16× |
| thenby | 42487445 | 0.000 | 3.25× |
| inline comparator chain, toSorted() | 37647239 | 0.000 | 3.67× |
| ramda.sortWith | 36740306 | 0.000 | 3.76× |
| remeda.sortBy | 30542271 | 0.000 | 4.53× |
| fast-sort | 29769005 | 0.000 | 4.64× |
| sort-array | 28841203 | 0.000 | 4.79× |
| sort-by | 28629736 | 0.000 | 4.83× |
| underscore.sortBy | 24814597 | 0.000 | 5.57× |
| lodash.orderBy | 24055103 | 0.000 | 5.75× |
| natural-orderby | 3643634 | 0.000 | 37.94× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 223567784 | 0.000 | 0.58× |
| fast-multisort | 129404067 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105273100 | 0.000 | 1.23× |
| es-toolkit.orderBy | 81158872 | 0.000 | 1.59× |
| sort-on | 72569369 | 0.000 | 1.78× |
| Array.prototype.sort, decorated | 62461556 | 0.000 | 2.07× |
| thenby | 41111357 | 0.000 | 3.15× |
| inline comparator chain, toSorted() | 37303371 | 0.000 | 3.47× |
| ramda.sortWith | 35368456 | 0.000 | 3.66× |
| remeda.sortBy | 30357101 | 0.000 | 4.26× |
| fast-sort | 30216152 | 0.000 | 4.28× |
| sort-array | 29494218 | 0.000 | 4.39× |
| sort-by | 28741134 | 0.000 | 4.50× |
| underscore.sortBy | 22661215 | 0.000 | 5.71× |
| lodash.orderBy | 19546696 | 0.000 | 6.62× |
| natural-orderby | 1706150 | 0.001 | 75.85× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 228545703 | 0.000 | 0.57× |
| fast-multisort | 129294703 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104534197 | 0.000 | 1.24× |
| es-toolkit.orderBy | 80449672 | 0.000 | 1.61× |
| sort-on | 72329616 | 0.000 | 1.79× |
| Array.prototype.sort, decorated | 63222770 | 0.000 | 2.05× |
| thenby | 41414726 | 0.000 | 3.12× |
| inline comparator chain, toSorted() | 37190470 | 0.000 | 3.48× |
| ramda.sortWith | 34914613 | 0.000 | 3.70× |
| remeda.sortBy | 30165517 | 0.000 | 4.29× |
| fast-sort | 29668982 | 0.000 | 4.36× |
| sort-array | 29021204 | 0.000 | 4.46× |
| sort-by | 28873730 | 0.000 | 4.48× |
| underscore.sortBy | 23204616 | 0.000 | 5.57× |
| lodash.orderBy | 19390514 | 0.000 | 6.67× |
| natural-orderby | 2981461 | 0.000 | 43.37× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 226587727 | 0.000 | 0.57× |
| fast-multisort | 129014656 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104687049 | 0.000 | 1.23× |
| es-toolkit.orderBy | 80450573 | 0.000 | 1.60× |
| sort-on | 72886002 | 0.000 | 1.77× |
| Array.prototype.sort, decorated | 63406435 | 0.000 | 2.03× |
| thenby | 41531327 | 0.000 | 3.11× |
| inline comparator chain, toSorted() | 37396775 | 0.000 | 3.45× |
| ramda.sortWith | 34249421 | 0.000 | 3.77× |
| remeda.sortBy | 30261096 | 0.000 | 4.26× |
| fast-sort | 29826551 | 0.000 | 4.33× |
| sort-array | 29399534 | 0.000 | 4.39× |
| sort-by | 28925337 | 0.000 | 4.46× |
| underscore.sortBy | 22563528 | 0.000 | 5.72× |
| lodash.orderBy | 19196778 | 0.000 | 6.72× |
| natural-orderby | 2670270 | 0.000 | 48.32× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 225119720 | 0.000 | 0.58× |
| fast-multisort | 129514451 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104598718 | 0.000 | 1.24× |
| es-toolkit.orderBy | 80153468 | 0.000 | 1.62× |
| sort-on | 72458106 | 0.000 | 1.79× |
| Array.prototype.sort, decorated | 62456286 | 0.000 | 2.07× |
| thenby | 41158356 | 0.000 | 3.15× |
| inline comparator chain, toSorted() | 37120309 | 0.000 | 3.49× |
| ramda.sortWith | 35031257 | 0.000 | 3.70× |
| remeda.sortBy | 30610480 | 0.000 | 4.23× |
| fast-sort | 30264954 | 0.000 | 4.28× |
| sort-array | 29452279 | 0.000 | 4.40× |
| sort-by | 28647921 | 0.000 | 4.52× |
| underscore.sortBy | 22614745 | 0.000 | 5.73× |
| lodash.orderBy | 19505518 | 0.000 | 6.64× |
| natural-orderby | 1849116 | 0.001 | 70.04× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 229293782 | 0.000 | 0.56× |
| fast-multisort | 128763148 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104904807 | 0.000 | 1.23× |
| es-toolkit.orderBy | 80475401 | 0.000 | 1.60× |
| sort-on | 73436334 | 0.000 | 1.75× |
| Array.prototype.sort, decorated | 63132683 | 0.000 | 2.04× |
| thenby | 41243280 | 0.000 | 3.12× |
| inline comparator chain, toSorted() | 37170695 | 0.000 | 3.46× |
| ramda.sortWith | 34553963 | 0.000 | 3.73× |
| remeda.sortBy | 30403532 | 0.000 | 4.24× |
| fast-sort | 30100823 | 0.000 | 4.28× |
| sort-array | 29278587 | 0.000 | 4.40× |
| sort-by | 29097642 | 0.000 | 4.43× |
| underscore.sortBy | 22867793 | 0.000 | 5.63× |
| lodash.orderBy | 19429468 | 0.000 | 6.63× |
| natural-orderby | 3573562 | 0.000 | 36.03× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 227961110 | 0.000 | 0.56× |
| fast-multisort | 128211450 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105629796 | 0.000 | 1.21× |
| es-toolkit.orderBy | 80357579 | 0.000 | 1.60× |
| sort-on | 72515002 | 0.000 | 1.77× |
| Array.prototype.sort, decorated | 63402362 | 0.000 | 2.02× |
| thenby | 40926293 | 0.000 | 3.13× |
| inline comparator chain, toSorted() | 37586064 | 0.000 | 3.41× |
| ramda.sortWith | 34900038 | 0.000 | 3.67× |
| remeda.sortBy | 30619456 | 0.000 | 4.19× |
| fast-sort | 29988803 | 0.000 | 4.28× |
| sort-array | 29222761 | 0.000 | 4.39× |
| sort-by | 28867272 | 0.000 | 4.44× |
| underscore.sortBy | 23190417 | 0.000 | 5.53× |
| lodash.orderBy | 19528010 | 0.000 | 6.57× |
| natural-orderby | 3548396 | 0.000 | 36.13× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 227446811 | 0.000 | 0.57× |
| fast-multisort | 129256352 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 106117971 | 0.000 | 1.22× |
| es-toolkit.orderBy | 80606858 | 0.000 | 1.60× |
| sort-on | 73793144 | 0.000 | 1.75× |
| Array.prototype.sort, decorated | 62513302 | 0.000 | 2.07× |
| thenby | 41253894 | 0.000 | 3.13× |
| inline comparator chain, toSorted() | 37361466 | 0.000 | 3.46× |
| ramda.sortWith | 35115969 | 0.000 | 3.68× |
| remeda.sortBy | 30481196 | 0.000 | 4.24× |
| fast-sort | 29907261 | 0.000 | 4.32× |
| sort-array | 29589308 | 0.000 | 4.37× |
| sort-by | 28799978 | 0.000 | 4.49× |
| underscore.sortBy | 22401960 | 0.000 | 5.77× |
| lodash.orderBy | 19038797 | 0.000 | 6.79× |
| natural-orderby | 2743958 | 0.000 | 47.11× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 129401907 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105282570 | 0.000 | 1.23× |
| es-toolkit.orderBy | 80876918 | 0.000 | 1.60× |
| sort-on | 72385058 | 0.000 | 1.79× |
| Array.prototype.sort, decorated | 62282933 | 0.000 | 2.08× |
| inline comparator chain, toSorted() | 37613084 | 0.000 | 3.44× |
| sort-array | 29573937 | 0.000 | 4.38× |
| sort-by | 25606199 | 0.000 | 5.05× |
| ramda.sortWith | 21850075 | 0.000 | 5.92× |
| remeda.sortBy | 16746782 | 0.000 | 7.73× |
| lodash.orderBy | 15130148 | 0.000 | 8.55× |
| thenby | 11877328 | 0.000 | 10.89× |
| fast-sort | 4984034 | 0.000 | 25.96× |
| natural-orderby | 894784 | 0.001 | 144.62× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7069687 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4659302 | 0.000 | 1.52× |
| inline comparator chain, slice().sort() | 4471120 | 0.000 | 1.58× |
| thenby | 4015348 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 3813928 | 0.000 | 1.85× |
| remeda.sortBy | 3770676 | 0.000 | 1.87× |
| es-toolkit.orderBy | 3716549 | 0.000 | 1.90× |
| fast-sort | 3013017 | 0.000 | 2.35× |
| sort-array | 2841895 | 0.000 | 2.49× |
| underscore.sortBy | 2750354 | 0.000 | 2.57× |
| lodash.orderBy | 2188640 | 0.000 | 3.23× |
| ramda.sortWith | 1752344 | 0.001 | 4.03× |
| just-sort-by (different order) | 1102192 | 0.001 | 6.41× |
| natural-orderby (different order) | 313299 | 0.003 | 22.57× |
| sort-on (different order) | 219010 | 0.005 | 32.28× |
| sort-by | 29595 | 0.034 | 238.88× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5043073 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 3915889 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 3686773 | 0.000 | 1.37× |
| thenby | 2585361 | 0.000 | 1.95× |
| remeda.sortBy | 2526397 | 0.000 | 2.00× |
| es-toolkit.orderBy | 2444936 | 0.000 | 2.06× |
| underscore.sortBy | 2239226 | 0.000 | 2.25× |
| fast-sort | 2204283 | 0.000 | 2.29× |
| Array.prototype.sort, decorated | 1984351 | 0.001 | 2.54× |
| lodash.orderBy | 1808039 | 0.001 | 2.79× |
| ramda.sortWith | 1349086 | 0.001 | 3.74× |
| sort-array | 1225764 | 0.001 | 4.11× |
| just-sort-by | 889471 | 0.001 | 5.67× |
| sort-on | 182576 | 0.005 | 27.62× |
| natural-orderby | 125346 | 0.008 | 40.23× |
| sort-by | 28046 | 0.036 | 179.81× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7059676 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 6512315 | 0.000 | 1.08× |
| inline comparator chain, slice().sort() | 6155590 | 0.000 | 1.15× |
| just-sort-by (different order) | 3977785 | 0.000 | 1.77× |
| thenby (different order) | 3378834 | 0.000 | 2.09× |
| es-toolkit.orderBy | 3271844 | 0.000 | 2.16× |
| remeda.sortBy (different order) | 3195618 | 0.000 | 2.21× |
| underscore.sortBy (different order) | 2906489 | 0.000 | 2.43× |
| Array.prototype.sort, decorated | 2757311 | 0.000 | 2.56× |
| fast-sort | 2655515 | 0.000 | 2.66× |
| lodash.orderBy | 2285581 | 0.000 | 3.09× |
| ramda.sortWith (different order) | 1716291 | 0.001 | 4.11× |
| sort-array | 1515546 | 0.001 | 4.66× |
| natural-orderby | 313155 | 0.003 | 22.54× |
| sort-on | 276968 | 0.004 | 25.49× |
| sort-by (different order) | 35509 | 0.028 | 198.82× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5839242 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 5068245 | 0.000 | 1.15× |
| inline comparator chain, slice().sort() | 4732090 | 0.000 | 1.23× |
| just-sort-by | 2871039 | 0.000 | 2.03× |
| thenby | 2690464 | 0.000 | 2.17× |
| remeda.sortBy | 2633449 | 0.000 | 2.22× |
| underscore.sortBy | 2456495 | 0.000 | 2.38× |
| es-toolkit.orderBy | 2448468 | 0.000 | 2.38× |
| fast-sort | 2069871 | 0.000 | 2.82× |
| Array.prototype.sort, decorated | 1980466 | 0.001 | 2.95× |
| lodash.orderBy | 1768308 | 0.001 | 3.30× |
| ramda.sortWith | 1296934 | 0.001 | 4.50× |
| sort-array | 1076219 | 0.001 | 5.43× |
| natural-orderby | 261323 | 0.004 | 22.34× |
| sort-on | 185055 | 0.005 | 31.55× |
| sort-by | 26259 | 0.038 | 222.37× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4570592 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4089626 | 0.000 | 1.12× |
| inline comparator chain, slice().sort() | 3840835 | 0.000 | 1.19× |
| thenby | 2511948 | 0.000 | 1.82× |
| remeda.sortBy | 2485739 | 0.000 | 1.84× |
| es-toolkit.orderBy | 2338849 | 0.000 | 1.95× |
| underscore.sortBy | 2031093 | 0.000 | 2.25× |
| fast-sort | 1988767 | 0.001 | 2.30× |
| Array.prototype.sort, decorated | 1954305 | 0.001 | 2.34× |
| lodash.orderBy | 1630141 | 0.001 | 2.80× |
| just-sort-by | 1489528 | 0.001 | 3.07× |
| ramda.sortWith | 1369418 | 0.001 | 3.34× |
| sort-array | 1184509 | 0.001 | 3.86× |
| sort-on | 183434 | 0.005 | 24.92× |
| natural-orderby | 179795 | 0.006 | 25.42× |
| sort-by | 29583 | 0.034 | 154.50× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13844918 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 12311131 | 0.000 | 1.12× |
| inline comparator chain, slice().sort() | 10565920 | 0.000 | 1.31× |
| just-sort-by | 6609075 | 0.000 | 2.09× |
| thenby | 5647363 | 0.000 | 2.45× |
| es-toolkit.orderBy | 5466467 | 0.000 | 2.53× |
| remeda.sortBy | 5326389 | 0.000 | 2.60× |
| Array.prototype.sort, decorated | 4828313 | 0.000 | 2.87× |
| fast-sort | 4029709 | 0.000 | 3.44× |
| underscore.sortBy | 3849214 | 0.000 | 3.60× |
| ramda.sortWith | 3234569 | 0.000 | 4.28× |
| lodash.orderBy | 3167074 | 0.000 | 4.37× |
| sort-array | 3080477 | 0.000 | 4.49× |
| sort-on | 519018 | 0.002 | 26.68× |
| natural-orderby | 380175 | 0.003 | 36.42× |
| sort-by | 73523 | 0.014 | 188.31× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14558501 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 11862234 | 0.000 | 1.23× |
| inline comparator chain, slice().sort() | 10327831 | 0.000 | 1.41× |
| just-sort-by | 6495445 | 0.000 | 2.24× |
| thenby | 5478654 | 0.000 | 2.66× |
| es-toolkit.orderBy | 5357978 | 0.000 | 2.72× |
| remeda.sortBy | 5019191 | 0.000 | 2.90× |
| Array.prototype.sort, decorated | 4885422 | 0.000 | 2.98× |
| fast-sort | 4049291 | 0.000 | 3.60× |
| underscore.sortBy | 3707141 | 0.000 | 3.93× |
| ramda.sortWith | 3254298 | 0.000 | 4.47× |
| sort-array | 3144426 | 0.000 | 4.63× |
| lodash.orderBy | 2997085 | 0.000 | 4.86× |
| sort-on | 468302 | 0.002 | 31.09× |
| natural-orderby | 380111 | 0.003 | 38.30× |
| sort-by | 72290 | 0.014 | 201.39× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6963427 | 0.000 | 0.99× |
| fast-multisort | 6861076 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 6475383 | 0.000 | 1.06× |
| just-sort-by | 3269546 | 0.000 | 2.10× |
| underscore.sortBy | 3022547 | 0.000 | 2.27× |
| remeda.sortBy | 2939674 | 0.000 | 2.33× |
| thenby | 2899208 | 0.000 | 2.37× |
| es-toolkit.orderBy | 2730340 | 0.000 | 2.51× |
| Array.prototype.sort, decorated | 2472742 | 0.000 | 2.77× |
| fast-sort | 2301912 | 0.000 | 2.98× |
| lodash.orderBy | 2136875 | 0.000 | 3.21× |
| ramda.sortWith | 1555754 | 0.001 | 4.41× |
| sort-array | 1366308 | 0.001 | 5.02× |
| natural-orderby | 337465 | 0.003 | 20.33× |
| sort-on | 236443 | 0.004 | 29.02× |
| sort-by | 32173 | 0.031 | 213.25× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4600302 | 0.000 | 0.49× |
| inline comparator chain, slice().sort() | 4405220 | 0.000 | 0.51× |
| fast-multisort | 2259940 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2181119 | 0.000 | 1.04× |
| remeda.sortBy (different order) | 1913204 | 0.001 | 1.18× |
| Array.prototype.sort, decorated | 1912434 | 0.001 | 1.18× |
| thenby (different order) | 1608591 | 0.001 | 1.40× |
| lodash.orderBy | 1501469 | 0.001 | 1.51× |
| fast-sort (different order) | 1201637 | 0.001 | 1.88× |
| ramda.sortWith (different order) | 1126488 | 0.001 | 2.01× |
| sort-array (different order) | 912408 | 0.001 | 2.48× |
| sort-on (different order) | 182923 | 0.005 | 12.35× |
| natural-orderby (different order) | 84758 | 0.012 | 26.66× |
| sort-by (different order) | 25969 | 0.039 | 87.02× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 421608 | 0.002 | 1.00× |
| inline comparator chain, toSorted() | 252174 | 0.004 | 1.67× |
| inline comparator chain, slice().sort() | 241872 | 0.004 | 1.74× |
| underscore.sortBy | 141366 | 0.007 | 2.98× |
| thenby | 120322 | 0.008 | 3.50× |
| es-toolkit.orderBy | 106115 | 0.009 | 3.97× |
| lodash.orderBy | 105376 | 0.009 | 4.00× |
| fast-sort | 105345 | 0.009 | 4.00× |
| Array.prototype.sort, decorated | 94813 | 0.011 | 4.45× |
| remeda.sortBy | 89081 | 0.011 | 4.73× |
| ramda.sortWith | 55297 | 0.018 | 7.62× |
| sort-array | 48548 | 0.021 | 8.68× |
| just-sort-by (different order) | 42775 | 0.023 | 9.86× |
| natural-orderby (different order) | 25291 | 0.040 | 16.67× |
| sort-on (different order) | 9668 | 0.103 | 43.61× |
| sort-by | 1306 | 0.766 | 322.92× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 199489 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 176798 | 0.006 | 1.13× |
| inline comparator chain, slice().sort() | 170460 | 0.006 | 1.17× |
| thenby | 101643 | 0.010 | 1.96× |
| underscore.sortBy | 95928 | 0.010 | 2.08× |
| es-toolkit.orderBy | 88481 | 0.011 | 2.25× |
| fast-sort | 87308 | 0.011 | 2.28× |
| remeda.sortBy | 79574 | 0.013 | 2.51× |
| Array.prototype.sort, decorated | 74374 | 0.013 | 2.68× |
| lodash.orderBy | 73954 | 0.014 | 2.70× |
| ramda.sortWith | 48581 | 0.021 | 4.11× |
| sort-array | 38700 | 0.026 | 5.15× |
| just-sort-by (different order) | 35846 | 0.028 | 5.57× |
| natural-orderby (different order) | 9616 | 0.104 | 20.75× |
| sort-on (different order) | 7918 | 0.126 | 25.19× |
| sort-by | 1214 | 0.824 | 164.33× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 278087 | 0.004 | 0.94× |
| inline comparator chain, slice().sort() | 274044 | 0.004 | 0.95× |
| fast-multisort | 261211 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 172023 | 0.006 | 1.52× |
| just-sort-by (different order) | 157739 | 0.006 | 1.66× |
| thenby (different order) | 139149 | 0.007 | 1.88× |
| fast-sort | 127583 | 0.008 | 2.05× |
| es-toolkit.orderBy | 119704 | 0.008 | 2.18× |
| lodash.orderBy | 109312 | 0.009 | 2.39× |
| remeda.sortBy (different order) | 106927 | 0.009 | 2.44× |
| Array.prototype.sort, decorated | 101949 | 0.010 | 2.56× |
| ramda.sortWith (different order) | 58742 | 0.017 | 4.45× |
| sort-array | 53366 | 0.019 | 4.89× |
| natural-orderby | 27900 | 0.036 | 9.36× |
| sort-on | 10143 | 0.099 | 25.75× |
| sort-by (different order) | 1302 | 0.768 | 200.66× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 270853 | 0.004 | 0.79× |
| inline comparator chain, slice().sort() | 255300 | 0.004 | 0.84× |
| fast-multisort | 214947 | 0.005 | 1.00× |
| underscore.sortBy | 157574 | 0.006 | 1.36× |
| just-sort-by | 119949 | 0.008 | 1.79× |
| thenby | 119288 | 0.008 | 1.80× |
| fast-sort | 105550 | 0.009 | 2.04× |
| es-toolkit.orderBy | 104716 | 0.010 | 2.05× |
| remeda.sortBy | 100259 | 0.010 | 2.14× |
| lodash.orderBy | 96877 | 0.010 | 2.22× |
| Array.prototype.sort, decorated | 89777 | 0.011 | 2.39× |
| ramda.sortWith | 55706 | 0.018 | 3.86× |
| sort-array | 47576 | 0.021 | 4.52× |
| natural-orderby | 23538 | 0.042 | 9.13× |
| sort-on | 8787 | 0.114 | 24.46× |
| sort-by | 1249 | 0.801 | 172.16× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 200005 | 0.005 | 0.77× |
| inline comparator chain, slice().sort() | 194716 | 0.005 | 0.79× |
| fast-multisort | 153680 | 0.007 | 1.00× |
| thenby | 108689 | 0.009 | 1.41× |
| underscore.sortBy | 102440 | 0.010 | 1.50× |
| es-toolkit.orderBy | 93458 | 0.011 | 1.64× |
| fast-sort | 93056 | 0.011 | 1.65× |
| remeda.sortBy | 84592 | 0.012 | 1.82× |
| Array.prototype.sort, decorated | 81068 | 0.012 | 1.90× |
| lodash.orderBy | 78759 | 0.013 | 1.95× |
| just-sort-by | 60164 | 0.017 | 2.55× |
| ramda.sortWith | 49926 | 0.020 | 3.08× |
| sort-array | 42274 | 0.024 | 3.64× |
| natural-orderby | 16546 | 0.060 | 9.29× |
| sort-on | 7459 | 0.134 | 20.60× |
| sort-by | 1209 | 0.827 | 127.09× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1851143 | 0.001 | 0.99× |
| fast-multisort | 1838137 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1529036 | 0.001 | 1.20× |
| just-sort-by | 854026 | 0.001 | 2.15× |
| thenby | 759585 | 0.001 | 2.42× |
| fast-sort | 691349 | 0.001 | 2.66× |
| remeda.sortBy | 679418 | 0.001 | 2.71× |
| es-toolkit.orderBy | 673752 | 0.001 | 2.73× |
| Array.prototype.sort, decorated | 574767 | 0.002 | 3.20× |
| underscore.sortBy | 487411 | 0.002 | 3.77× |
| lodash.orderBy | 390387 | 0.003 | 4.71× |
| ramda.sortWith | 346956 | 0.003 | 5.30× |
| sort-array | 307795 | 0.003 | 5.97× |
| sort-on | 48757 | 0.021 | 37.70× |
| natural-orderby | 35284 | 0.028 | 52.10× |
| sort-by | 6810 | 0.147 | 269.93× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1854825 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 1721176 | 0.001 | 1.08× |
| inline comparator chain, slice().sort() | 1445987 | 0.001 | 1.28× |
| just-sort-by | 842185 | 0.001 | 2.20× |
| thenby | 774454 | 0.001 | 2.40× |
| fast-sort | 697938 | 0.001 | 2.66× |
| es-toolkit.orderBy | 651091 | 0.002 | 2.85× |
| Array.prototype.sort, decorated | 576371 | 0.002 | 3.22× |
| remeda.sortBy | 541977 | 0.002 | 3.42× |
| underscore.sortBy | 459325 | 0.002 | 4.04× |
| lodash.orderBy | 360238 | 0.003 | 5.15× |
| ramda.sortWith | 341272 | 0.003 | 5.44× |
| sort-array | 321157 | 0.003 | 5.78× |
| sort-on | 44036 | 0.023 | 42.12× |
| natural-orderby | 35278 | 0.028 | 52.58× |
| sort-by | 6575 | 0.152 | 282.11× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1089412 | 0.001 | 0.86× |
| inline comparator chain, slice().sort() | 974975 | 0.001 | 0.96× |
| fast-multisort | 932629 | 0.001 | 1.00× |
| just-sort-by | 518749 | 0.002 | 1.80× |
| thenby | 444674 | 0.002 | 2.10× |
| underscore.sortBy | 401145 | 0.002 | 2.32× |
| fast-sort | 396717 | 0.003 | 2.35× |
| remeda.sortBy | 384387 | 0.003 | 2.43× |
| es-toolkit.orderBy | 381465 | 0.003 | 2.44× |
| Array.prototype.sort, decorated | 340146 | 0.003 | 2.74× |
| lodash.orderBy | 291274 | 0.003 | 3.20× |
| ramda.sortWith | 197852 | 0.005 | 4.71× |
| sort-array | 175498 | 0.006 | 5.31× |
| natural-orderby | 33678 | 0.030 | 27.69× |
| sort-on | 29713 | 0.034 | 31.39× |
| sort-by | 3960 | 0.253 | 235.49× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 223546 | 0.004 | 0.71× |
| inline comparator chain, slice().sort() | 217679 | 0.005 | 0.73× |
| fast-multisort | 158262 | 0.006 | 1.00× |
| lodash.orderBy | 85196 | 0.012 | 1.86× |
| es-toolkit.orderBy | 77980 | 0.013 | 2.03× |
| Array.prototype.sort, decorated | 71743 | 0.014 | 2.21× |
| remeda.sortBy (different order) | 68875 | 0.015 | 2.30× |
| thenby (different order) | 66082 | 0.015 | 2.39× |
| fast-sort (different order) | 54987 | 0.018 | 2.88× |
| ramda.sortWith (different order) | 42036 | 0.024 | 3.76× |
| sort-array (different order) | 34178 | 0.029 | 4.63× |
| natural-orderby (different order) | 8033 | 0.124 | 19.70× |
| sort-on (different order) | 7213 | 0.139 | 21.94× |
| sort-by (different order) | 845 | 1.184 | 187.38× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 45197 | 0.022 | 1.00× |
| inline comparator chain, toSorted() | 17518 | 0.057 | 2.58× |
| inline comparator chain, slice().sort() | 17237 | 0.058 | 2.62× |
| underscore.sortBy | 10073 | 0.099 | 4.49× |
| thenby | 8731 | 0.115 | 5.18× |
| fast-sort | 8017 | 0.125 | 5.64× |
| lodash.orderBy | 7645 | 0.131 | 5.91× |
| es-toolkit.orderBy | 7577 | 0.132 | 5.96× |
| Array.prototype.sort, decorated | 6893 | 0.145 | 6.56× |
| remeda.sortBy | 6538 | 0.153 | 6.91× |
| ramda.sortWith | 4335 | 0.231 | 10.43× |
| sort-array | 3841 | 0.260 | 11.77× |
| just-sort-by (different order) | 3129 | 0.320 | 14.45× |
| natural-orderby (different order) | 2178 | 0.459 | 20.75× |
| sort-on (different order) | 742 | 1.348 | 60.94× |
| sort-by | 101 | 9.917 | 448.23× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11301 | 0.088 | 1.00× |
| inline comparator chain, toSorted() | 8388 | 0.119 | 1.35× |
| inline comparator chain, slice().sort() | 8278 | 0.121 | 1.37× |
| underscore.sortBy | 5564 | 0.180 | 2.03× |
| thenby | 5439 | 0.184 | 2.08× |
| fast-sort | 4966 | 0.201 | 2.28× |
| es-toolkit.orderBy | 4841 | 0.207 | 2.33× |
| remeda.sortBy | 4460 | 0.224 | 2.53× |
| Array.prototype.sort, decorated | 4291 | 0.233 | 2.63× |
| lodash.orderBy | 4260 | 0.235 | 2.65× |
| ramda.sortWith | 2915 | 0.343 | 3.88× |
| sort-array | 2431 | 0.411 | 4.65× |
| just-sort-by (different order) | 2273 | 0.440 | 4.97× |
| natural-orderby (different order) | 752 | 1.329 | 15.02× |
| sort-on (different order) | 482 | 2.076 | 23.46× |
| sort-by | 76 | 13.176 | 148.91× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 34041 | 0.029 | 1.00× |
| inline comparator chain, toSorted() | 15202 | 0.066 | 2.24× |
| inline comparator chain, slice().sort() | 15128 | 0.066 | 2.25× |
| underscore.sortBy (different order) | 10340 | 0.097 | 3.29× |
| just-sort-by (different order) | 8494 | 0.118 | 4.01× |
| thenby (different order) | 8035 | 0.124 | 4.24× |
| fast-sort | 7654 | 0.131 | 4.45× |
| es-toolkit.orderBy | 7246 | 0.138 | 4.70× |
| lodash.orderBy | 7044 | 0.142 | 4.83× |
| Array.prototype.sort, decorated | 6644 | 0.151 | 5.12× |
| remeda.sortBy (different order) | 6520 | 0.153 | 5.22× |
| ramda.sortWith (different order) | 3739 | 0.267 | 9.11× |
| sort-array | 3327 | 0.301 | 10.23× |
| natural-orderby | 2302 | 0.434 | 14.79× |
| sort-on | 629 | 1.591 | 54.16× |
| sort-by (different order) | 81 | 12.394 | 421.91× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30908 | 0.032 | 1.00× |
| inline comparator chain, toSorted() | 12149 | 0.082 | 2.54× |
| inline comparator chain, slice().sort() | 11889 | 0.084 | 2.60× |
| underscore.sortBy | 8870 | 0.113 | 3.48× |
| thenby | 6775 | 0.148 | 4.56× |
| just-sort-by | 6731 | 0.149 | 4.59× |
| fast-sort | 6250 | 0.160 | 4.95× |
| es-toolkit.orderBy | 6068 | 0.165 | 5.09× |
| lodash.orderBy | 5989 | 0.167 | 5.16× |
| remeda.sortBy | 5969 | 0.168 | 5.18× |
| Array.prototype.sort, decorated | 5618 | 0.178 | 5.50× |
| ramda.sortWith | 3387 | 0.295 | 9.13× |
| sort-array | 3032 | 0.330 | 10.19× |
| natural-orderby | 1913 | 0.523 | 16.15× |
| sort-on | 546 | 1.833 | 56.65× |
| sort-by | 77 | 12.993 | 401.58× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11885 | 0.084 | 1.00× |
| inline comparator chain, toSorted() | 9433 | 0.106 | 1.26× |
| inline comparator chain, slice().sort() | 9332 | 0.107 | 1.27× |
| thenby | 5857 | 0.171 | 2.03× |
| underscore.sortBy | 5840 | 0.171 | 2.04× |
| fast-sort | 5274 | 0.190 | 2.25× |
| es-toolkit.orderBy | 5157 | 0.194 | 2.30× |
| Array.prototype.sort, decorated | 4780 | 0.209 | 2.49× |
| remeda.sortBy | 4717 | 0.212 | 2.52× |
| lodash.orderBy | 4506 | 0.222 | 2.64× |
| just-sort-by | 3568 | 0.280 | 3.33× |
| ramda.sortWith | 3022 | 0.331 | 3.93× |
| sort-array | 2658 | 0.376 | 4.47× |
| natural-orderby | 1437 | 0.696 | 8.27× |
| sort-on | 470 | 2.128 | 25.30× |
| sort-by | 75 | 13.274 | 157.76× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 191267 | 0.005 | 0.96× |
| fast-multisort | 183595 | 0.005 | 1.00× |
| inline comparator chain, slice().sort() | 155900 | 0.006 | 1.18× |
| just-sort-by | 89057 | 0.011 | 2.06× |
| thenby | 78665 | 0.013 | 2.33× |
| fast-sort | 73689 | 0.014 | 2.49× |
| es-toolkit.orderBy | 66389 | 0.015 | 2.77× |
| remeda.sortBy | 65872 | 0.015 | 2.79× |
| Array.prototype.sort, decorated | 55271 | 0.018 | 3.32× |
| underscore.sortBy | 49594 | 0.020 | 3.70× |
| lodash.orderBy | 39575 | 0.025 | 4.64× |
| ramda.sortWith | 34030 | 0.029 | 5.40× |
| sort-array | 30988 | 0.032 | 5.92× |
| sort-on | 4817 | 0.208 | 38.11× |
| natural-orderby | 3412 | 0.293 | 53.81× |
| sort-by | 659 | 1.518 | 278.66× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 183053 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 180913 | 0.006 | 1.01× |
| inline comparator chain, slice().sort() | 146222 | 0.007 | 1.25× |
| just-sort-by | 86681 | 0.012 | 2.11× |
| thenby | 79668 | 0.013 | 2.30× |
| fast-sort | 75688 | 0.013 | 2.42× |
| es-toolkit.orderBy | 67250 | 0.015 | 2.72× |
| remeda.sortBy | 55327 | 0.018 | 3.31× |
| Array.prototype.sort, decorated | 55238 | 0.018 | 3.31× |
| underscore.sortBy | 46124 | 0.022 | 3.97× |
| lodash.orderBy | 36866 | 0.027 | 4.97× |
| ramda.sortWith | 33568 | 0.030 | 5.45× |
| sort-array | 31913 | 0.031 | 5.74× |
| sort-on | 4324 | 0.231 | 42.33× |
| natural-orderby | 3430 | 0.292 | 53.37× |
| sort-by | 651 | 1.536 | 281.24× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 160488 | 0.006 | 0.78× |
| inline comparator chain, slice().sort() | 133360 | 0.007 | 0.94× |
| fast-multisort | 125054 | 0.008 | 1.00× |
| just-sort-by | 79850 | 0.013 | 1.57× |
| thenby | 71710 | 0.014 | 1.74× |
| fast-sort | 67103 | 0.015 | 1.86× |
| es-toolkit.orderBy | 61446 | 0.016 | 2.04× |
| remeda.sortBy | 60425 | 0.017 | 2.07× |
| Array.prototype.sort, decorated | 50981 | 0.020 | 2.45× |
| underscore.sortBy | 46768 | 0.021 | 2.67× |
| lodash.orderBy | 38099 | 0.026 | 3.28× |
| ramda.sortWith | 32259 | 0.031 | 3.88× |
| sort-array | 28576 | 0.035 | 4.38× |
| sort-on | 4970 | 0.201 | 25.16× |
| natural-orderby | 3423 | 0.292 | 36.53× |
| sort-by | 659 | 1.518 | 189.82× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12711 | 0.079 | 1.00× |
| inline comparator chain, slice().sort() | 11926 | 0.084 | 1.07× |
| inline comparator chain, toSorted() | 11762 | 0.085 | 1.08× |
| lodash.orderBy | 5297 | 0.189 | 2.40× |
| es-toolkit.orderBy | 4341 | 0.230 | 2.93× |
| Array.prototype.sort, decorated | 4189 | 0.239 | 3.03× |
| thenby (different order) | 3864 | 0.259 | 3.29× |
| remeda.sortBy (different order) | 3789 | 0.264 | 3.36× |
| fast-sort (different order) | 3094 | 0.323 | 4.11× |
| ramda.sortWith (different order) | 2417 | 0.414 | 5.26× |
| sort-array (different order) | 1944 | 0.514 | 6.54× |
| natural-orderby (different order) | 733 | 1.364 | 17.34× |
| sort-on (different order) | 405 | 2.471 | 31.41× |
| sort-by (different order) | 47 | 21.497 | 273.25× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4488 | 0.223 | 1.00× |
| inline comparator chain, toSorted() | 1273 | 0.786 | 3.53× |
| inline comparator chain, slice().sort() | 1256 | 0.796 | 3.57× |
| underscore.sortBy | 861 | 1.161 | 5.21× |
| thenby | 775 | 1.291 | 5.79× |
| fast-sort | 708 | 1.411 | 6.33× |
| es-toolkit.orderBy | 708 | 1.413 | 6.34× |
| lodash.orderBy | 661 | 1.514 | 6.79× |
| Array.prototype.sort, decorated | 650 | 1.538 | 6.90× |
| remeda.sortBy | 580 | 1.724 | 7.74× |
| ramda.sortWith | 395 | 2.529 | 11.35× |
| sort-array | 355 | 2.818 | 12.64× |
| just-sort-by (different order) | 298 | 3.353 | 15.05× |
| natural-orderby (different order) | 213 | 4.700 | 21.09× |
| sort-on (different order) | 70 | 14.241 | 63.91× |
| sort-by | 10 | 104.448 | 468.71× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 830 | 1.205 | 1.00× |
| inline comparator chain, toSorted() | 458 | 2.184 | 1.81× |
| inline comparator chain, slice().sort() | 443 | 2.257 | 1.87× |
| underscore.sortBy | 355 | 2.820 | 2.34× |
| thenby | 347 | 2.886 | 2.39× |
| fast-sort | 322 | 3.110 | 2.58× |
| es-toolkit.orderBy | 320 | 3.124 | 2.59× |
| remeda.sortBy | 296 | 3.378 | 2.80× |
| Array.prototype.sort, decorated | 287 | 3.479 | 2.89× |
| lodash.orderBy | 266 | 3.755 | 3.12× |
| ramda.sortWith | 198 | 5.056 | 4.20× |
| sort-array | 171 | 5.854 | 4.86× |
| just-sort-by (different order) | 164 | 6.088 | 5.05× |
| natural-orderby (different order) | 57 | 17.505 | 14.53× |
| sort-on (different order) | 35 | 28.875 | 23.96× |
| sort-by | 5 | 184.773 | 153.33× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3750 | 0.267 | 1.00× |
| inline comparator chain, toSorted() | 934 | 1.071 | 4.02× |
| inline comparator chain, slice().sort() | 930 | 1.076 | 4.03× |
| underscore.sortBy (different order) | 720 | 1.389 | 5.21× |
| thenby (different order) | 602 | 1.661 | 6.23× |
| just-sort-by (different order) | 601 | 1.664 | 6.24× |
| fast-sort | 564 | 1.773 | 6.65× |
| es-toolkit.orderBy | 535 | 1.870 | 7.01× |
| remeda.sortBy (different order) | 495 | 2.022 | 7.58× |
| lodash.orderBy | 489 | 2.046 | 7.67× |
| Array.prototype.sort, decorated | 478 | 2.093 | 7.85× |
| ramda.sortWith (different order) | 280 | 3.574 | 13.40× |
| sort-array | 250 | 3.999 | 15.00× |
| natural-orderby | 185 | 5.403 | 20.26× |
| sort-on | 46 | 21.545 | 80.80× |
| sort-by (different order) | 6 | 170.780 | 640.44× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3540 | 0.282 | 1.00× |
| inline comparator chain, slice().sort() | 705 | 1.418 | 5.02× |
| inline comparator chain, toSorted() | 696 | 1.436 | 5.08× |
| underscore.sortBy | 618 | 1.619 | 5.73× |
| thenby | 468 | 2.135 | 7.56× |
| just-sort-by | 463 | 2.158 | 7.64× |
| fast-sort | 451 | 2.218 | 7.85× |
| remeda.sortBy | 422 | 2.371 | 8.40× |
| es-toolkit.orderBy | 420 | 2.379 | 8.42× |
| lodash.orderBy | 415 | 2.410 | 8.53× |
| Array.prototype.sort, decorated | 379 | 2.638 | 9.34× |
| ramda.sortWith | 241 | 4.142 | 14.67× |
| sort-array | 221 | 4.532 | 16.04× |
| natural-orderby | 140 | 7.129 | 25.24× |
| sort-on | 40 | 25.149 | 89.03× |
| sort-by | 6 | 180.951 | 640.62× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 784 | 1.275 | 1.00× |
| inline comparator chain, toSorted() | 498 | 2.007 | 1.57× |
| inline comparator chain, slice().sort() | 493 | 2.027 | 1.59× |
| underscore.sortBy | 403 | 2.481 | 1.95× |
| thenby | 375 | 2.668 | 2.09× |
| fast-sort | 362 | 2.761 | 2.16× |
| es-toolkit.orderBy | 349 | 2.865 | 2.25× |
| Array.prototype.sort, decorated | 332 | 3.016 | 2.37× |
| remeda.sortBy | 328 | 3.050 | 2.39× |
| lodash.orderBy | 300 | 3.334 | 2.61× |
| just-sort-by | 258 | 3.873 | 3.04× |
| ramda.sortWith | 217 | 4.612 | 3.62× |
| sort-array | 195 | 5.139 | 4.03× |
| natural-orderby | 119 | 8.403 | 6.59× |
| sort-on | 34 | 29.800 | 23.37× |
| sort-by | 5 | 184.567 | 144.73× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 19675 | 0.051 | 0.98× |
| fast-multisort | 19252 | 0.052 | 1.00× |
| inline comparator chain, slice().sort() | 15702 | 0.064 | 1.23× |
| just-sort-by | 8747 | 0.114 | 2.20× |
| thenby | 7912 | 0.126 | 2.43× |
| fast-sort | 7522 | 0.133 | 2.56× |
| remeda.sortBy | 6914 | 0.145 | 2.78× |
| es-toolkit.orderBy | 6713 | 0.149 | 2.87× |
| Array.prototype.sort, decorated | 5570 | 0.180 | 3.46× |
| underscore.sortBy | 4940 | 0.202 | 3.90× |
| lodash.orderBy | 3876 | 0.258 | 4.97× |
| ramda.sortWith | 3447 | 0.290 | 5.59× |
| sort-array | 3156 | 0.317 | 6.10× |
| sort-on | 485 | 2.060 | 39.66× |
| natural-orderby | 329 | 3.043 | 58.58× |
| sort-by | 67 | 15.029 | 289.35× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 18486 | 0.054 | 1.00× |
| inline comparator chain, toSorted() | 18395 | 0.054 | 1.00× |
| inline comparator chain, slice().sort() | 14723 | 0.068 | 1.26× |
| just-sort-by | 8666 | 0.115 | 2.13× |
| thenby | 7991 | 0.125 | 2.31× |
| fast-sort | 7669 | 0.130 | 2.41× |
| es-toolkit.orderBy | 6595 | 0.152 | 2.80× |
| remeda.sortBy | 5680 | 0.176 | 3.25× |
| Array.prototype.sort, decorated | 5632 | 0.178 | 3.28× |
| underscore.sortBy | 4651 | 0.215 | 3.97× |
| lodash.orderBy | 3559 | 0.281 | 5.19× |
| ramda.sortWith | 3464 | 0.289 | 5.34× |
| sort-array | 3241 | 0.309 | 5.70× |
| sort-on | 436 | 2.291 | 42.35× |
| natural-orderby | 321 | 3.113 | 57.54× |
| sort-by | 65 | 15.484 | 286.22× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 17471 | 0.057 | 0.78× |
| inline comparator chain, slice().sort() | 14182 | 0.071 | 0.97× |
| fast-multisort | 13705 | 0.073 | 1.00× |
| just-sort-by | 8509 | 0.118 | 1.61× |
| thenby | 7479 | 0.134 | 1.83× |
| fast-sort | 7045 | 0.142 | 1.95× |
| es-toolkit.orderBy | 6339 | 0.158 | 2.16× |
| remeda.sortBy | 6052 | 0.165 | 2.26× |
| Array.prototype.sort, decorated | 5275 | 0.190 | 2.60× |
| underscore.sortBy | 4841 | 0.207 | 2.83× |
| lodash.orderBy | 3685 | 0.271 | 3.72× |
| ramda.sortWith | 3357 | 0.298 | 4.08× |
| sort-array | 2911 | 0.344 | 4.71× |
| sort-on | 508 | 1.967 | 26.96× |
| natural-orderby | 318 | 3.145 | 43.11× |
| sort-by | 67 | 14.940 | 204.75× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1487 | 0.672 | 1.00× |
| inline comparator chain, toSorted() | 678 | 1.475 | 2.19× |
| inline comparator chain, slice().sort() | 674 | 1.484 | 2.21× |
| lodash.orderBy | 341 | 2.932 | 4.36× |
| Array.prototype.sort, decorated | 299 | 3.341 | 4.97× |
| es-toolkit.orderBy | 293 | 3.418 | 5.08× |
| thenby (different order) | 261 | 3.834 | 5.70× |
| remeda.sortBy (different order) | 256 | 3.912 | 5.82× |
| fast-sort (different order) | 217 | 4.609 | 6.86× |
| ramda.sortWith (different order) | 166 | 6.035 | 8.98× |
| sort-array (different order) | 136 | 7.361 | 10.95× |
| natural-orderby (different order) | 61 | 16.283 | 24.22× |
| sort-on (different order) | 28 | 36.123 | 53.73× |
| sort-by (different order) | 3 | 321.654 | 478.42× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 389 | 2.574 | 1.00× |
| inline comparator chain, toSorted() | 112 | 8.907 | 3.46× |
| inline comparator chain, slice().sort() | 109 | 9.204 | 3.58× |
| underscore.sortBy | 74 | 13.481 | 5.24× |
| thenby | 73 | 13.754 | 5.34× |
| fast-sort | 69 | 14.533 | 5.65× |
| es-toolkit.orderBy | 66 | 15.106 | 5.87× |
| lodash.orderBy | 59 | 16.987 | 6.60× |
| remeda.sortBy | 56 | 17.787 | 6.91× |
| Array.prototype.sort, decorated | 53 | 18.979 | 7.37× |
| ramda.sortWith | 37 | 26.940 | 10.47× |
| sort-array | 34 | 29.020 | 11.28× |
| just-sort-by (different order) | 27 | 37.029 | 14.39× |
| natural-orderby (different order) | 18 | 55.032 | 21.38× |
| sort-on (different order) | 7 | 143.707 | 55.83× |
| sort-by | 1 | 1084.044 | 421.19× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 54 | 18.350 | 1.00× |
| inline comparator chain, toSorted() | 28 | 35.748 | 1.95× |
| inline comparator chain, slice().sort() | 28 | 35.894 | 1.96× |
| underscore.sortBy | 23 | 44.092 | 2.40× |
| thenby | 22 | 45.618 | 2.49× |
| fast-sort | 21 | 46.726 | 2.55× |
| es-toolkit.orderBy | 20 | 49.803 | 2.71× |
| remeda.sortBy | 20 | 50.129 | 2.73× |
| Array.prototype.sort, decorated | 16 | 61.620 | 3.36× |
| lodash.orderBy | 15 | 64.800 | 3.53× |
| ramda.sortWith | 13 | 79.723 | 4.34× |
| sort-array | 12 | 85.166 | 4.64× |
| just-sort-by (different order) | 11 | 95.169 | 5.19× |
| natural-orderby (different order) | 4 | 280.589 | 15.29× |
| sort-on (different order) | 2 | 405.462 | 22.10× |
| sort-by | 0 | 2403.306 | 130.97× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 316 | 3.164 | 1.00× |
| inline comparator chain, slice().sort() | 66 | 15.246 | 4.82× |
| inline comparator chain, toSorted() | 65 | 15.285 | 4.83× |
| underscore.sortBy (different order) | 55 | 18.068 | 5.71× |
| just-sort-by (different order) | 44 | 22.547 | 7.13× |
| thenby (different order) | 44 | 22.798 | 7.20× |
| fast-sort | 41 | 24.571 | 7.77× |
| remeda.sortBy (different order) | 35 | 28.249 | 8.93× |
| es-toolkit.orderBy | 35 | 28.302 | 8.94× |
| lodash.orderBy | 31 | 32.645 | 10.32× |
| Array.prototype.sort, decorated | 29 | 34.245 | 10.82× |
| ramda.sortWith (different order) | 20 | 50.656 | 16.01× |
| sort-array | 19 | 53.289 | 16.84× |
| natural-orderby | 14 | 73.425 | 23.20× |
| sort-on | 3 | 285.959 | 90.37× |
| sort-by (different order) | 0 | 2163.894 | 683.83× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 321 | 3.115 | 1.00× |
| inline comparator chain, toSorted() | 49 | 20.214 | 6.49× |
| inline comparator chain, slice().sort() | 49 | 20.422 | 6.56× |
| underscore.sortBy | 45 | 22.234 | 7.14× |
| thenby | 34 | 29.750 | 9.55× |
| fast-sort | 32 | 31.117 | 9.99× |
| remeda.sortBy | 30 | 33.611 | 10.79× |
| just-sort-by | 29 | 35.087 | 11.27× |
| es-toolkit.orderBy | 27 | 36.415 | 11.69× |
| lodash.orderBy | 25 | 40.565 | 13.02× |
| Array.prototype.sort, decorated | 20 | 48.854 | 15.69× |
| ramda.sortWith | 17 | 57.219 | 18.37× |
| sort-array | 16 | 63.219 | 20.30× |
| natural-orderby | 10 | 97.837 | 31.41× |
| sort-on | 3 | 342.529 | 109.98× |
| sort-by | 0 | 2365.344 | 759.45× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 48 | 20.898 | 1.00× |
| inline comparator chain, toSorted() | 33 | 30.598 | 1.46× |
| inline comparator chain, slice().sort() | 32 | 31.255 | 1.50× |
| thenby | 26 | 38.219 | 1.83× |
| underscore.sortBy | 26 | 38.557 | 1.85× |
| fast-sort | 24 | 42.105 | 2.01× |
| es-toolkit.orderBy | 23 | 43.878 | 2.10× |
| remeda.sortBy | 23 | 44.239 | 2.12× |
| Array.prototype.sort, decorated | 19 | 52.811 | 2.53× |
| just-sort-by | 17 | 58.809 | 2.81× |
| lodash.orderBy | 17 | 59.613 | 2.85× |
| ramda.sortWith | 14 | 72.890 | 3.49× |
| sort-array | 13 | 78.261 | 3.74× |
| natural-orderby | 8 | 125.063 | 5.98× |
| sort-on | 2 | 419.595 | 20.08× |
| sort-by | 0 | 2404.542 | 115.06× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1577 | 0.634 | 0.91× |
| fast-multisort | 1428 | 0.701 | 1.00× |
| inline comparator chain, slice().sort() | 1249 | 0.800 | 1.14× |
| just-sort-by | 806 | 1.240 | 1.77× |
| thenby | 717 | 1.394 | 1.99× |
| fast-sort | 698 | 1.432 | 2.04× |
| es-toolkit.orderBy | 617 | 1.620 | 2.31× |
| remeda.sortBy | 547 | 1.828 | 2.61× |
| underscore.sortBy | 412 | 2.427 | 3.46× |
| Array.prototype.sort, decorated | 340 | 2.939 | 4.19× |
| ramda.sortWith | 328 | 3.046 | 4.35× |
| lodash.orderBy | 308 | 3.250 | 4.64× |
| sort-array | 280 | 3.571 | 5.10× |
| sort-on | 45 | 22.305 | 31.84× |
| natural-orderby | 27 | 37.098 | 52.96× |
| sort-by | 7 | 152.541 | 217.76× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1602 | 0.624 | 1.00× |
| inline comparator chain, toSorted() | 1487 | 0.672 | 1.08× |
| inline comparator chain, slice().sort() | 1212 | 0.825 | 1.32× |
| thenby | 766 | 1.305 | 2.09× |
| just-sort-by | 747 | 1.339 | 2.14× |
| fast-sort | 714 | 1.400 | 2.24× |
| es-toolkit.orderBy | 636 | 1.572 | 2.52× |
| remeda.sortBy | 479 | 2.089 | 3.35× |
| underscore.sortBy | 403 | 2.480 | 3.97× |
| ramda.sortWith | 337 | 2.968 | 4.75× |
| Array.prototype.sort, decorated | 331 | 3.024 | 4.84× |
| lodash.orderBy | 302 | 3.316 | 5.31× |
| sort-array | 292 | 3.421 | 5.48× |
| sort-on | 41 | 24.305 | 38.93× |
| natural-orderby | 27 | 36.813 | 58.96× |
| sort-by | 6 | 154.922 | 248.12× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1439 | 0.695 | 0.73× |
| inline comparator chain, slice().sort() | 1198 | 0.835 | 0.88× |
| fast-multisort | 1054 | 0.948 | 1.00× |
| just-sort-by | 775 | 1.290 | 1.36× |
| thenby | 710 | 1.409 | 1.49× |
| fast-sort | 665 | 1.504 | 1.59× |
| es-toolkit.orderBy | 593 | 1.686 | 1.78× |
| remeda.sortBy | 526 | 1.902 | 2.01× |
| underscore.sortBy | 437 | 2.286 | 2.41× |
| ramda.sortWith | 328 | 3.052 | 3.22× |
| lodash.orderBy | 315 | 3.175 | 3.35× |
| Array.prototype.sort, decorated | 295 | 3.385 | 3.57× |
| sort-array | 269 | 3.723 | 3.93× |
| sort-on | 48 | 20.789 | 21.92× |
| natural-orderby | 27 | 37.138 | 39.16× |
| sort-by | 7 | 148.263 | 156.33× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 126 | 7.935 | 1.00× |
| inline comparator chain, toSorted() | 46 | 21.757 | 2.74× |
| inline comparator chain, slice().sort() | 46 | 21.778 | 2.74× |
| es-toolkit.orderBy | 20 | 49.017 | 6.18× |
| lodash.orderBy | 20 | 49.072 | 6.18× |
| Array.prototype.sort, decorated | 19 | 52.248 | 6.58× |
| remeda.sortBy (different order) | 19 | 53.091 | 6.69× |
| thenby (different order) | 19 | 53.818 | 6.78× |
| fast-sort (different order) | 16 | 62.102 | 7.83× |
| ramda.sortWith (different order) | 11 | 88.964 | 11.21× |
| sort-array (different order) | 10 | 101.751 | 12.82× |
| natural-orderby (different order) | 5 | 205.935 | 25.95× |
| sort-on (different order) | 2 | 502.462 | 63.32× |
| sort-by (different order) | 0 | 4225.427 | 532.49× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 38 | 26.284 | 1.00× |
| inline comparator chain, slice().sort() | 11 | 92.083 | 3.50× |
| inline comparator chain, toSorted() | 11 | 92.921 | 3.54× |
| es-toolkit.orderBy | 7 | 150.428 | 5.72× |
| fast-sort | 7 | 153.799 | 5.85× |
| underscore.sortBy | 6 | 155.802 | 5.93× |
| remeda.sortBy | 6 | 181.804 | 6.92× |
| thenby | 5 | 185.581 | 7.06× |
| lodash.orderBy | 5 | 189.385 | 7.21× |
| Array.prototype.sort, decorated | 5 | 198.767 | 7.56× |
| ramda.sortWith | 4 | 261.624 | 9.95× |
| sort-array | 3 | 292.135 | 11.11× |
| just-sort-by (different order) | 3 | 370.595 | 14.10× |
| natural-orderby (different order) | 2 | 635.962 | 24.20× |
| sort-on (different order) | 1 | 1429.094 | 54.37× |
| sort-by | 0 | 10222.938 | 388.94× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 402.787 | 1.00× |
| inline comparator chain, toSorted() | 1 | 721.581 | 1.79× |
| inline comparator chain, slice().sort() | 1 | 727.780 | 1.81× |
| thenby | 1 | 959.443 | 2.38× |
| underscore.sortBy | 1 | 963.487 | 2.39× |
| fast-sort | 1 | 1010.337 | 2.51× |
| remeda.sortBy | 1 | 1044.622 | 2.59× |
| es-toolkit.orderBy | 1 | 1062.645 | 2.64× |
| Array.prototype.sort, decorated | 1 | 1442.223 | 3.58× |
| lodash.orderBy | 1 | 1519.455 | 3.77× |
| ramda.sortWith | 1 | 1528.497 | 3.79× |
| sort-array | 1 | 1803.253 | 4.48× |
| just-sort-by (different order) | 0 | 2049.194 | 5.09× |
| natural-orderby (different order) | 0 | 5353.431 | 13.29× |
| sort-on (different order) | 0 | 5636.373 | 13.99× |
| sort-by | 0 | 29580.205 | 73.44× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24 | 42.143 | 1.00× |
| inline comparator chain, toSorted() | 4 | 244.072 | 5.79× |
| inline comparator chain, slice().sort() | 4 | 274.632 | 6.52× |
| underscore.sortBy (different order) | 4 | 274.981 | 6.52× |
| just-sort-by (different order) | 3 | 373.185 | 8.86× |
| thenby (different order) | 3 | 377.093 | 8.95× |
| fast-sort | 2 | 400.040 | 9.49× |
| es-toolkit.orderBy | 2 | 413.221 | 9.81× |
| remeda.sortBy (different order) | 2 | 441.303 | 10.47× |
| lodash.orderBy | 2 | 663.457 | 15.74× |
| Array.prototype.sort, decorated | 1 | 676.337 | 16.05× |
| ramda.sortWith (different order) | 1 | 808.233 | 19.18× |
| sort-array | 1 | 844.818 | 20.05× |
| natural-orderby | 1 | 1213.017 | 28.78× |
| sort-on | 0 | 3663.427 | 86.93× |
| sort-by (different order) | 0 | 25920.190 | 615.05× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24 | 42.545 | 1.00× |
| inline comparator chain, toSorted() | 3 | 349.240 | 8.21× |
| inline comparator chain, slice().sort() | 3 | 350.095 | 8.23× |
| underscore.sortBy | 3 | 372.515 | 8.76× |
| thenby | 2 | 521.687 | 12.26× |
| fast-sort | 2 | 539.109 | 12.67× |
| just-sort-by | 2 | 569.643 | 13.39× |
| es-toolkit.orderBy | 2 | 602.392 | 14.16× |
| remeda.sortBy | 2 | 616.497 | 14.49× |
| ramda.sortWith | 1 | 901.123 | 21.18× |
| lodash.orderBy | 1 | 908.188 | 21.35× |
| Array.prototype.sort, decorated | 1 | 925.313 | 21.75× |
| sort-array | 1 | 1078.514 | 25.35× |
| natural-orderby | 1 | 1612.451 | 37.90× |
| sort-on | 0 | 4405.413 | 103.55× |
| sort-by | 0 | 28313.432 | 665.49× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 468.808 | 1.00× |
| inline comparator chain, toSorted() | 2 | 562.945 | 1.20× |
| inline comparator chain, slice().sort() | 2 | 594.233 | 1.27× |
| underscore.sortBy | 1 | 716.584 | 1.53× |
| thenby | 1 | 761.989 | 1.63× |
| es-toolkit.orderBy | 1 | 831.778 | 1.77× |
| fast-sort | 1 | 853.842 | 1.82× |
| remeda.sortBy | 1 | 878.137 | 1.87× |
| Array.prototype.sort, decorated | 1 | 1221.189 | 2.60× |
| ramda.sortWith | 1 | 1242.015 | 2.65× |
| just-sort-by | 1 | 1267.004 | 2.70× |
| lodash.orderBy | 1 | 1327.623 | 2.83× |
| sort-array | 1 | 1410.582 | 3.01× |
| natural-orderby | 0 | 2137.497 | 4.56× |
| sort-on | 0 | 5462.828 | 11.65× |
| sort-by | 0 | 29470.513 | 62.86× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 157 | 6.378 | 0.89× |
| fast-multisort | 140 | 7.139 | 1.00× |
| inline comparator chain, slice().sort() | 105 | 9.517 | 1.33× |
| just-sort-by | 75 | 13.259 | 1.86× |
| thenby | 73 | 13.793 | 1.93× |
| fast-sort | 65 | 15.360 | 2.15× |
| es-toolkit.orderBy | 62 | 16.146 | 2.26× |
| remeda.sortBy | 52 | 19.056 | 2.67× |
| ramda.sortWith | 34 | 29.764 | 4.17× |
| Array.prototype.sort, decorated | 29 | 34.741 | 4.87× |
| sort-array | 29 | 34.816 | 4.88× |
| underscore.sortBy | 25 | 40.087 | 5.62× |
| lodash.orderBy | 19 | 53.165 | 7.45× |
| sort-on | 5 | 210.870 | 29.54× |
| natural-orderby | 3 | 386.069 | 54.08× |
| sort-by | 1 | 1500.761 | 210.22× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 157 | 6.352 | 1.00× |
| inline comparator chain, toSorted() | 150 | 6.671 | 1.05× |
| inline comparator chain, slice().sort() | 98 | 10.185 | 1.60× |
| just-sort-by | 77 | 13.057 | 2.06× |
| thenby | 73 | 13.679 | 2.15× |
| fast-sort | 71 | 14.105 | 2.22× |
| es-toolkit.orderBy | 61 | 16.523 | 2.60× |
| remeda.sortBy | 47 | 21.167 | 3.33× |
| ramda.sortWith | 30 | 33.404 | 5.26× |
| sort-array | 30 | 33.801 | 5.32× |
| underscore.sortBy | 28 | 35.226 | 5.55× |
| Array.prototype.sort, decorated | 28 | 36.011 | 5.67× |
| lodash.orderBy | 16 | 61.283 | 9.65× |
| sort-on | 4 | 241.124 | 37.96× |
| natural-orderby | 3 | 395.044 | 62.19× |
| sort-by | 1 | 1541.947 | 242.75× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 149 | 6.709 | 0.75× |
| fast-multisort | 111 | 8.971 | 1.00× |
| inline comparator chain, slice().sort() | 94 | 10.669 | 1.19× |
| just-sort-by | 74 | 13.488 | 1.50× |
| thenby | 72 | 13.982 | 1.56× |
| fast-sort | 63 | 15.786 | 1.76× |
| es-toolkit.orderBy | 60 | 16.601 | 1.85× |
| remeda.sortBy | 52 | 19.164 | 2.14× |
| ramda.sortWith | 33 | 30.108 | 3.36× |
| sort-array | 26 | 37.888 | 4.22× |
| underscore.sortBy | 23 | 43.817 | 4.88× |
| lodash.orderBy | 18 | 56.263 | 6.27× |
| Array.prototype.sort, decorated | 12 | 81.941 | 9.13× |
| sort-on | 5 | 201.180 | 22.43× |
| natural-orderby | 3 | 383.028 | 42.70× |
| sort-by | 1 | 1485.559 | 165.59× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11 | 90.409 | 1.00× |
| inline comparator chain, toSorted() | 3 | 365.325 | 4.04× |
| inline comparator chain, slice().sort() | 3 | 366.682 | 4.06× |
| es-toolkit.orderBy | 1 | 782.540 | 8.66× |
| remeda.sortBy (different order) | 1 | 852.309 | 9.43× |
| lodash.orderBy | 1 | 875.056 | 9.68× |
| thenby (different order) | 1 | 891.107 | 9.86× |
| fast-sort (different order) | 1 | 1047.168 | 11.58× |
| Array.prototype.sort, decorated | 1 | 1112.355 | 12.30× |
| ramda.sortWith (different order) | 1 | 1343.803 | 14.86× |
| sort-array (different order) | 1 | 1531.652 | 16.94× |
| natural-orderby (different order) | 0 | 2783.224 | 30.78× |
| sort-on (different order) | 0 | 6372.013 | 70.48× |
| sort-by (different order) | 0 | 53010.010 | 586.34× |

</details>

<!-- bench:end -->

### Browsers

Same data, sizes, cases and libraries as above, each result checked against lodash before timing, best competitor per case (`pnpm bench:browsers`). Chromium and WebKit are Playwright's builds; Firefox is the installed `/Applications/Firefox.app` driven over WebDriver BiDi (Playwright's own Firefox build does not start on macOS 27), with Playwright's Firefox as the fallback. Firefox stops at 100k rows: at a million, sort-by and sort-on take minutes per call in SpiderMonkey and one case ran for 44 minutes, while fast-multisort sorts a million rows there in 11 to 674 ms. Apple M5 Max.

<!-- browsers:start -->

#### Chromium 156.0.8078.4

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, slice().sort() | 0.43× | 1.34× | 8.50× | 63 | 0 |
| inline comparator chain, toSorted() | 0.42× | 1.58× | 8.22× | 63 | 0 |
| just-sort-by | 0.40× | 2.26× | 12.21× | 56 | 17 |
| es-toolkit.orderBy | 0.84× | 2.29× | 13.09× | 63 | 0 |
| thenby | 1.16× | 2.86× | 12.29× | 63 | 12 |
| fast-sort | 1.35× | 2.90× | 17.54× | 63 | 6 |
| remeda.sortBy | 1.03× | 3.09× | 13.15× | 63 | 12 |
| Array.prototype.sort, decorated | 1.01× | 3.10× | 18.90× | 63 | 0 |
| underscore.sortBy | 1.32× | 3.43× | 8.71× | 56 | 6 |
| ramda.sortWith | 1.17× | 3.59× | 16.30× | 63 | 12 |
| lodash.orderBy | 1.36× | 4.59× | 18.34× | 63 | 0 |
| sort-array | 2.16× | 5.37× | 25.10× | 63 | 6 |
| natural-orderby | 4.23× | 22.56× | 121.22× | 63 | 17 |
| sort-on | 1.58× | 24.16× | 87.76× | 63 | 17 |
| sort-by | 4.36× | 177.61× | 660.15× | 63 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 371177345 | 0.000 | 0.40× |
| fast-multisort | 146653986 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 108660725 | 0.000 | 1.35× |
| es-toolkit.orderBy | 90394483 | 0.000 | 1.62× |
| sort-on | 90006524 | 0.000 | 1.63× |
| Array.prototype.sort, decorated | 68311140 | 0.000 | 2.15× |
| thenby | 48545185 | 0.000 | 3.02× |
| inline comparator chain, toSorted() | 38409377 | 0.000 | 3.82× |
| ramda.sortWith | 37991884 | 0.000 | 3.86× |
| underscore.sortBy | 33825032 | 0.000 | 4.34× |
| remeda.sortBy | 33500831 | 0.000 | 4.38× |
| fast-sort | 33288127 | 0.000 | 4.41× |
| sort-by | 33182785 | 0.000 | 4.42× |
| sort-array | 32066544 | 0.000 | 4.57× |
| lodash.orderBy | 25206154 | 0.000 | 5.82× |
| natural-orderby | 4818824 | 0.000 | 30.43× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 286300614 | 0.000 | 0.48× |
| fast-multisort | 137970526 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103563062 | 0.000 | 1.33× |
| sort-on | 86659173 | 0.000 | 1.59× |
| es-toolkit.orderBy | 84222972 | 0.000 | 1.64× |
| Array.prototype.sort, decorated | 64133089 | 0.000 | 2.15× |
| thenby | 46397168 | 0.000 | 2.97× |
| inline comparator chain, toSorted() | 38130036 | 0.000 | 3.62× |
| ramda.sortWith | 37315872 | 0.000 | 3.70× |
| remeda.sortBy | 33288127 | 0.000 | 4.14× |
| fast-sort | 32665919 | 0.000 | 4.22× |
| sort-array | 32066544 | 0.000 | 4.30× |
| sort-by | 31300776 | 0.000 | 4.41× |
| underscore.sortBy | 30131494 | 0.000 | 4.58× |
| lodash.orderBy | 20400311 | 0.000 | 6.76× |
| natural-orderby | 1998049 | 0.001 | 69.05× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 286300614 | 0.000 | 0.49× |
| fast-multisort | 139345648 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103819406 | 0.000 | 1.34× |
| sort-on | 87018755 | 0.000 | 1.60× |
| es-toolkit.orderBy | 83551873 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 65331838 | 0.000 | 2.13× |
| thenby | 46603378 | 0.000 | 2.99× |
| inline comparator chain, toSorted() | 37449143 | 0.000 | 3.72× |
| ramda.sortWith | 36921690 | 0.000 | 3.77× |
| remeda.sortBy | 33500831 | 0.000 | 4.16× |
| fast-sort | 32463653 | 0.000 | 4.29× |
| sort-array | 32164908 | 0.000 | 4.33× |
| sort-by | 31488769 | 0.000 | 4.43× |
| underscore.sortBy | 30481860 | 0.000 | 4.57× |
| lodash.orderBy | 20480000 | 0.000 | 6.80× |
| natural-orderby | 3692169 | 0.000 | 37.74× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 287281096 | 0.000 | 0.48× |
| fast-multisort | 138884238 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105384523 | 0.000 | 1.32× |
| sort-on | 87381333 | 0.000 | 1.59× |
| es-toolkit.orderBy | 83551872 | 0.000 | 1.66× |
| Array.prototype.sort, decorated | 64527754 | 0.000 | 2.15× |
| thenby | 46811429 | 0.000 | 2.97× |
| inline comparator chain, toSorted() | 38409377 | 0.000 | 3.62× |
| ramda.sortWith | 37183546 | 0.000 | 3.74× |
| remeda.sortBy | 33716270 | 0.000 | 4.12× |
| fast-sort | 32363457 | 0.000 | 4.29× |
| sort-array | 32066544 | 0.000 | 4.33× |
| sort-by | 31583614 | 0.000 | 4.40× |
| underscore.sortBy | 30131494 | 0.000 | 4.61× |
| lodash.orderBy | 20087663 | 0.000 | 6.91× |
| natural-orderby | 3343673 | 0.000 | 41.54× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 288268316 | 0.000 | 0.48× |
| fast-multisort | 139345648 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104335920 | 0.000 | 1.34× |
| sort-on | 87381333 | 0.000 | 1.59× |
| es-toolkit.orderBy | 84562581 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 64927306 | 0.000 | 2.15× |
| thenby | 46811429 | 0.000 | 2.98× |
| inline comparator chain, toSorted() | 38130036 | 0.000 | 3.65× |
| ramda.sortWith | 37583369 | 0.000 | 3.71× |
| remeda.sortBy | 33608205 | 0.000 | 4.15× |
| fast-sort | 33288127 | 0.000 | 4.19× |
| sort-array | 31968780 | 0.000 | 4.36× |
| sort-by | 31775030 | 0.000 | 4.39× |
| underscore.sortBy | 30840471 | 0.000 | 4.52× |
| lodash.orderBy | 20722846 | 0.000 | 6.72× |
| natural-orderby | 2332242 | 0.000 | 59.75× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 286300614 | 0.000 | 0.49× |
| fast-multisort | 139810133 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104335920 | 0.000 | 1.34× |
| sort-on | 88115630 | 0.000 | 1.59× |
| es-toolkit.orderBy | 85250081 | 0.000 | 1.64× |
| Array.prototype.sort, decorated | 65128944 | 0.000 | 2.15× |
| thenby | 46811429 | 0.000 | 2.99× |
| ramda.sortWith | 38130036 | 0.000 | 3.67× |
| inline comparator chain, toSorted() | 37854729 | 0.000 | 3.69× |
| remeda.sortBy | 33825032 | 0.000 | 4.13× |
| fast-sort | 32974088 | 0.000 | 4.24× |
| sort-array | 32564472 | 0.000 | 4.29× |
| sort-by | 32066544 | 0.000 | 4.36× |
| underscore.sortBy | 30750029 | 0.000 | 4.55× |
| lodash.orderBy | 20641260 | 0.000 | 6.77× |
| natural-orderby | 4108840 | 0.000 | 34.03× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 287281096 | 0.000 | 0.49× |
| fast-multisort | 139810133 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105384523 | 0.000 | 1.33× |
| sort-on | 87381333 | 0.000 | 1.60× |
| es-toolkit.orderBy | 84562581 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 64927307 | 0.000 | 2.15× |
| thenby | 47021345 | 0.000 | 2.97× |
| inline comparator chain, toSorted() | 38550588 | 0.000 | 3.63× |
| ramda.sortWith | 37991884 | 0.000 | 3.68× |
| remeda.sortBy | 33934498 | 0.000 | 4.12× |
| fast-sort | 33078107 | 0.000 | 4.23× |
| sort-array | 32564472 | 0.000 | 4.29× |
| sort-by | 31775030 | 0.000 | 4.40× |
| underscore.sortBy | 30570729 | 0.000 | 4.57× |
| lodash.orderBy | 20641260 | 0.000 | 6.77× |
| natural-orderby | 4174268 | 0.000 | 33.49× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 288268316 | 0.000 | 0.48× |
| fast-multisort | 139810133 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103819406 | 0.000 | 1.35× |
| sort-on | 87381333 | 0.000 | 1.60× |
| es-toolkit.orderBy | 84904939 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 65331838 | 0.000 | 2.14× |
| thenby | 47021345 | 0.000 | 2.97× |
| inline comparator chain, toSorted() | 38130036 | 0.000 | 3.67× |
| ramda.sortWith | 37718561 | 0.000 | 3.71× |
| remeda.sortBy | 33716270 | 0.000 | 4.15× |
| fast-sort | 32768000 | 0.000 | 4.27× |
| sort-array | 32363457 | 0.000 | 4.32× |
| sort-by | 31968780 | 0.000 | 4.37× |
| underscore.sortBy | 30750029 | 0.000 | 4.55× |
| lodash.orderBy | 20164923 | 0.000 | 6.93× |
| natural-orderby | 3458364 | 0.000 | 40.43× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 138884238 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104857600 | 0.000 | 1.32× |
| sort-on | 88115630 | 0.000 | 1.58× |
| es-toolkit.orderBy | 84904939 | 0.000 | 1.64× |
| Array.prototype.sort, decorated | 64527754 | 0.000 | 2.15× |
| inline comparator chain, toSorted() | 38130036 | 0.000 | 3.64× |
| sort-array | 32363457 | 0.000 | 4.29× |
| sort-by | 28111957 | 0.000 | 4.94× |
| ramda.sortWith | 22501631 | 0.000 | 6.17× |
| remeda.sortBy | 18526078 | 0.000 | 7.50× |
| lodash.orderBy | 16384000 | 0.000 | 8.48× |
| thenby | 14364055 | 0.000 | 9.67× |
| fast-sort | 7919758 | 0.000 | 17.54× |
| natural-orderby | 1145734 | 0.001 | 121.22× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7967903 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 5371803 | 0.000 | 1.48× |
| inline comparator chain, slice().sort() | 5242880 | 0.000 | 1.52× |
| thenby | 4647943 | 0.000 | 1.71× |
| remeda.sortBy | 4340132 | 0.000 | 1.84× |
| Array.prototype.sort, decorated | 4325809 | 0.000 | 1.84× |
| es-toolkit.orderBy | 4255584 | 0.000 | 1.87× |
| fast-sort | 3877870 | 0.000 | 2.05× |
| underscore.sortBy | 3276800 | 0.000 | 2.43× |
| ramda.sortWith | 2992511 | 0.000 | 2.66× |
| sort-array | 2952072 | 0.000 | 2.70× |
| lodash.orderBy | 2348961 | 0.000 | 3.39× |
| just-sort-by (different order) | 1590680 | 0.001 | 5.01× |
| natural-orderby (different order) | 409600 | 0.002 | 19.45× |
| sort-on (different order) | 310303 | 0.003 | 25.68× |
| sort-by | 39690 | 0.025 | 200.75× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5180711 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4020613 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 3912597 | 0.000 | 1.32× |
| thenby | 2899823 | 0.000 | 1.79× |
| remeda.sortBy | 2776949 | 0.000 | 1.87× |
| es-toolkit.orderBy | 2730667 | 0.000 | 1.90× |
| fast-sort | 2590356 | 0.000 | 2.00× |
| underscore.sortBy | 2520615 | 0.000 | 2.06× |
| ramda.sortWith | 2120906 | 0.000 | 2.44× |
| Array.prototype.sort, decorated | 2114065 | 0.000 | 2.45× |
| lodash.orderBy | 1883218 | 0.001 | 2.75× |
| just-sort-by | 1315984 | 0.001 | 3.94× |
| sort-array | 1255479 | 0.001 | 4.13× |
| sort-on | 243086 | 0.004 | 21.31× |
| natural-orderby | 151144 | 0.007 | 34.28× |
| sort-by | 37786 | 0.026 | 137.11× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7732861 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 6456749 | 0.000 | 1.20× |
| inline comparator chain, slice().sort() | 6362718 | 0.000 | 1.22× |
| just-sort-by (different order) | 4413199 | 0.000 | 1.75× |
| thenby (different order) | 3591014 | 0.000 | 2.15× |
| es-toolkit.orderBy | 3413333 | 0.000 | 2.27× |
| remeda.sortBy (different order) | 3352225 | 0.000 | 2.31× |
| fast-sort | 3196878 | 0.000 | 2.42× |
| underscore.sortBy (different order) | 3196878 | 0.000 | 2.42× |
| Array.prototype.sort, decorated | 2824828 | 0.000 | 2.74× |
| ramda.sortWith (different order) | 2685902 | 0.000 | 2.88× |
| lodash.orderBy | 2229116 | 0.000 | 3.47× |
| sort-array | 1606275 | 0.001 | 4.81× |
| natural-orderby | 390095 | 0.003 | 19.82× |
| sort-on | 345654 | 0.003 | 22.37× |
| sort-by (different order) | 43207 | 0.023 | 178.97× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 6773747 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 5825422 | 0.000 | 1.16× |
| inline comparator chain, slice().sort() | 5393909 | 0.000 | 1.26× |
| just-sort-by | 3293266 | 0.000 | 2.06× |
| thenby | 2938834 | 0.000 | 2.30× |
| remeda.sortBy | 2938834 | 0.000 | 2.30× |
| underscore.sortBy | 2925714 | 0.000 | 2.32× |
| es-toolkit.orderBy | 2753613 | 0.000 | 2.46× |
| fast-sort | 2445373 | 0.000 | 2.77× |
| Array.prototype.sort, decorated | 2267682 | 0.000 | 2.99× |
| ramda.sortWith | 2087134 | 0.000 | 3.25× |
| lodash.orderBy | 1856544 | 0.001 | 3.65× |
| sort-array | 1200293 | 0.001 | 5.64× |
| natural-orderby | 333008 | 0.003 | 20.34× |
| sort-on | 251288 | 0.004 | 26.96× |
| sort-by | 34830 | 0.029 | 194.48× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5285161 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4890746 | 0.000 | 1.08× |
| inline comparator chain, slice().sort() | 4872565 | 0.000 | 1.08× |
| thenby | 3048186 | 0.000 | 1.73× |
| es-toolkit.orderBy | 2887048 | 0.000 | 1.83× |
| remeda.sortBy | 2812704 | 0.000 | 1.88× |
| fast-sort | 2530347 | 0.000 | 2.09× |
| underscore.sortBy | 2445373 | 0.000 | 2.16× |
| Array.prototype.sort, decorated | 2374493 | 0.000 | 2.23× |
| ramda.sortWith | 2267682 | 0.000 | 2.33× |
| just-sort-by | 2022716 | 0.000 | 2.61× |
| lodash.orderBy | 1795507 | 0.001 | 2.94× |
| sort-array | 1359668 | 0.001 | 3.89× |
| sort-on | 246006 | 0.004 | 21.48× |
| natural-orderby | 228827 | 0.004 | 23.10× |
| sort-by | 39844 | 0.025 | 132.65× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 15065747 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 9532509 | 0.000 | 1.58× |
| inline comparator chain, slice().sort() | 9133937 | 0.000 | 1.65× |
| just-sort-by | 4801172 | 0.000 | 3.14× |
| remeda.sortBy | 3959879 | 0.000 | 3.80× |
| thenby | 3855059 | 0.000 | 3.91× |
| underscore.sortBy | 3821341 | 0.000 | 3.94× |
| es-toolkit.orderBy | 3630803 | 0.000 | 4.15× |
| fast-sort | 3212549 | 0.000 | 4.69× |
| Array.prototype.sort, decorated | 3135694 | 0.000 | 4.80× |
| ramda.sortWith | 2742092 | 0.000 | 5.49× |
| lodash.orderBy | 2560000 | 0.000 | 5.89× |
| sort-array | 1761720 | 0.001 | 8.55× |
| natural-orderby | 438075 | 0.002 | 34.39× |
| sort-on | 330323 | 0.003 | 45.61× |
| sort-by | 44522 | 0.022 | 338.39× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 15465723 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 6211943 | 0.000 | 2.49× |
| inline comparator chain, slice().sort() | 6068148 | 0.000 | 2.55× |
| just-sort-by | 3777291 | 0.000 | 4.09× |
| thenby | 3048186 | 0.000 | 5.07× |
| es-toolkit.orderBy | 3020092 | 0.000 | 5.12× |
| remeda.sortBy | 2978909 | 0.000 | 5.19× |
| underscore.sortBy | 2874386 | 0.000 | 5.38× |
| fast-sort | 2570039 | 0.000 | 6.02× |
| Array.prototype.sort, decorated | 2520615 | 0.000 | 6.14× |
| ramda.sortWith | 2100513 | 0.000 | 7.36× |
| lodash.orderBy | 1916257 | 0.001 | 8.07× |
| sort-array | 1406352 | 0.001 | 11.00× |
| natural-orderby | 422268 | 0.002 | 36.63× |
| sort-on | 226925 | 0.004 | 68.15× |
| sort-by | 33139 | 0.030 | 466.69× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7642682 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 7532874 | 0.000 | 1.01× |
| inline comparator chain, slice().sort() | 7241547 | 0.000 | 1.06× |
| just-sort-by | 3723636 | 0.000 | 2.05× |
| underscore.sortBy | 3335165 | 0.000 | 2.29× |
| remeda.sortBy | 3105972 | 0.000 | 2.46× |
| thenby | 3034074 | 0.000 | 2.52× |
| es-toolkit.orderBy | 2925714 | 0.000 | 2.61× |
| Array.prototype.sort, decorated | 2708099 | 0.000 | 2.82× |
| fast-sort | 2664065 | 0.000 | 2.87× |
| ramda.sortWith | 2391825 | 0.000 | 3.20× |
| lodash.orderBy | 2184533 | 0.000 | 3.50× |
| sort-array | 1400342 | 0.001 | 5.46× |
| natural-orderby | 411658 | 0.002 | 18.57× |
| sort-on | 316293 | 0.003 | 24.16× |
| sort-by | 41124 | 0.024 | 185.84× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 5180711 | 0.000 | 0.42× |
| inline comparator chain, slice().sort() | 5120000 | 0.000 | 0.43× |
| es-toolkit.orderBy | 2600635 | 0.000 | 0.84× |
| fast-multisort | 2191839 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 2177276 | 0.000 | 1.01× |
| remeda.sortBy (different order) | 2120906 | 0.000 | 1.03× |
| thenby (different order) | 1888646 | 0.001 | 1.16× |
| ramda.sortWith (different order) | 1867123 | 0.001 | 1.17× |
| lodash.orderBy | 1606275 | 0.001 | 1.36× |
| fast-sort (different order) | 1567847 | 0.001 | 1.40× |
| sort-array (different order) | 1014489 | 0.001 | 2.16× |
| sort-on (different order) | 255202 | 0.004 | 8.59× |
| natural-orderby (different order) | 112527 | 0.009 | 19.48× |
| sort-by (different order) | 34133 | 0.029 | 64.21× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 444011 | 0.002 | 1.00× |
| inline comparator chain, toSorted() | 249756 | 0.004 | 1.78× |
| inline comparator chain, slice().sort() | 247492 | 0.004 | 1.79× |
| underscore.sortBy | 156935 | 0.006 | 2.83× |
| thenby | 127601 | 0.008 | 3.48× |
| fast-sort | 116695 | 0.009 | 3.80× |
| es-toolkit.orderBy | 110108 | 0.009 | 4.03× |
| lodash.orderBy | 108360 | 0.009 | 4.10× |
| Array.prototype.sort, decorated | 100392 | 0.010 | 4.42× |
| remeda.sortBy | 91839 | 0.011 | 4.83× |
| ramda.sortWith | 82249 | 0.012 | 5.40× |
| just-sort-by (different order) | 57207 | 0.017 | 7.76× |
| sort-array | 49709 | 0.020 | 8.93× |
| natural-orderby (different order) | 30843 | 0.032 | 14.40× |
| sort-on (different order) | 12736 | 0.079 | 34.86× |
| sort-by | 1616 | 0.619 | 274.73× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 207392 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 170667 | 0.006 | 1.22× |
| inline comparator chain, slice().sort() | 168560 | 0.006 | 1.23× |
| thenby | 103959 | 0.010 | 1.99× |
| underscore.sortBy | 96604 | 0.010 | 2.15× |
| fast-sort | 95256 | 0.010 | 2.18× |
| es-toolkit.orderBy | 94378 | 0.011 | 2.20× |
| remeda.sortBy | 79380 | 0.013 | 2.61× |
| Array.prototype.sort, decorated | 79073 | 0.013 | 2.62× |
| lodash.orderBy | 72624 | 0.014 | 2.86× |
| ramda.sortWith | 69898 | 0.014 | 2.97× |
| just-sort-by (different order) | 47407 | 0.021 | 4.37× |
| sort-array | 40635 | 0.025 | 5.10× |
| natural-orderby (different order) | 11327 | 0.088 | 18.31× |
| sort-on (different order) | 10000 | 0.100 | 20.74× |
| sort-by | 1561 | 0.641 | 132.86× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 274899 | 0.004 | 0.96× |
| inline comparator chain, slice().sort() | 269474 | 0.004 | 0.98× |
| fast-multisort | 263408 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 165830 | 0.006 | 1.59× |
| just-sort-by (different order) | 152836 | 0.007 | 1.72× |
| fast-sort | 127205 | 0.008 | 2.07× |
| thenby (different order) | 124498 | 0.008 | 2.12× |
| es-toolkit.orderBy | 117701 | 0.008 | 2.24× |
| remeda.sortBy (different order) | 105296 | 0.009 | 2.50× |
| Array.prototype.sort, decorated | 103959 | 0.010 | 2.53× |
| lodash.orderBy | 103174 | 0.010 | 2.55× |
| ramda.sortWith (different order) | 81594 | 0.012 | 3.23× |
| sort-array | 51717 | 0.019 | 5.09× |
| natural-orderby | 33032 | 0.030 | 7.97× |
| sort-on | 13368 | 0.075 | 19.70× |
| sort-by (different order) | 1641 | 0.609 | 160.51× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 258423 | 0.004 | 0.85× |
| inline comparator chain, slice().sort() | 246006 | 0.004 | 0.90× |
| fast-multisort | 220809 | 0.005 | 1.00× |
| underscore.sortBy | 156935 | 0.006 | 1.41× |
| just-sort-by | 114095 | 0.009 | 1.94× |
| thenby | 109227 | 0.009 | 2.02× |
| fast-sort | 102915 | 0.010 | 2.15× |
| remeda.sortBy | 97524 | 0.010 | 2.26× |
| es-toolkit.orderBy | 96604 | 0.010 | 2.29× |
| lodash.orderBy | 92670 | 0.011 | 2.38× |
| Array.prototype.sort, decorated | 89825 | 0.011 | 2.46× |
| ramda.sortWith | 72624 | 0.014 | 3.04× |
| sort-array | 47850 | 0.021 | 4.61× |
| natural-orderby | 28444 | 0.035 | 7.76× |
| sort-on | 11378 | 0.088 | 19.41× |
| sort-by | 1588 | 0.630 | 139.04× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 212779 | 0.005 | 0.73× |
| inline comparator chain, slice().sort() | 205829 | 0.005 | 0.75× |
| fast-multisort | 154566 | 0.006 | 1.00× |
| underscore.sortBy | 116695 | 0.009 | 1.32× |
| thenby | 116034 | 0.009 | 1.33× |
| fast-sort | 105296 | 0.009 | 1.47× |
| es-toolkit.orderBy | 104224 | 0.010 | 1.48× |
| Array.prototype.sort, decorated | 91429 | 0.011 | 1.69× |
| remeda.sortBy | 90220 | 0.011 | 1.71× |
| lodash.orderBy | 80949 | 0.012 | 1.91× |
| ramda.sortWith | 75852 | 0.013 | 2.04× |
| just-sort-by | 68495 | 0.015 | 2.26× |
| sort-array | 45714 | 0.022 | 3.38× |
| natural-orderby | 20562 | 0.049 | 7.52× |
| sort-on | 9697 | 0.103 | 15.94× |
| sort-by | 1546 | 0.647 | 99.98× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2283484 | 0.000 | 0.84× |
| inline comparator chain, slice().sort() | 1916257 | 0.001 | 1.00× |
| fast-multisort | 1910671 | 0.001 | 1.00× |
| just-sort-by | 981078 | 0.001 | 1.95× |
| thenby | 853333 | 0.001 | 2.24× |
| fast-sort | 811089 | 0.001 | 2.36× |
| es-toolkit.orderBy | 772830 | 0.001 | 2.47× |
| remeda.sortBy | 755023 | 0.001 | 2.53× |
| Array.prototype.sort, decorated | 583060 | 0.002 | 3.28× |
| underscore.sortBy | 559181 | 0.002 | 3.42× |
| ramda.sortWith | 533681 | 0.002 | 3.58× |
| lodash.orderBy | 426667 | 0.002 | 4.48× |
| sort-array | 320000 | 0.003 | 5.97× |
| sort-on | 65852 | 0.015 | 29.01× |
| natural-orderby | 44138 | 0.023 | 43.29× |
| sort-by | 8649 | 0.116 | 220.92× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2100513 | 0.000 | 0.89× |
| fast-multisort | 1872457 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1752299 | 0.001 | 1.07× |
| just-sort-by | 963765 | 0.001 | 1.94× |
| thenby | 848912 | 0.001 | 2.21× |
| es-toolkit.orderBy | 811089 | 0.001 | 2.31× |
| fast-sort | 807094 | 0.001 | 2.32× |
| remeda.sortBy | 615940 | 0.002 | 3.04× |
| Array.prototype.sort, decorated | 587240 | 0.002 | 3.19× |
| ramda.sortWith | 525128 | 0.002 | 3.57× |
| underscore.sortBy | 512000 | 0.002 | 3.66× |
| lodash.orderBy | 397670 | 0.003 | 4.71× |
| sort-array | 334367 | 0.003 | 5.60× |
| sort-on | 58682 | 0.017 | 31.91× |
| natural-orderby | 44329 | 0.023 | 42.24× |
| sort-by | 8477 | 0.118 | 220.89× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1222687 | 0.001 | 0.64× |
| inline comparator chain, slice().sort() | 1118362 | 0.001 | 0.70× |
| fast-multisort | 787692 | 0.001 | 1.00× |
| just-sort-by | 566920 | 0.002 | 1.39× |
| thenby | 447650 | 0.002 | 1.76× |
| underscore.sortBy | 434589 | 0.002 | 1.81× |
| fast-sort | 428901 | 0.002 | 1.84× |
| remeda.sortBy | 423359 | 0.002 | 1.86× |
| es-toolkit.orderBy | 415838 | 0.002 | 1.89× |
| Array.prototype.sort, decorated | 350085 | 0.003 | 2.25× |
| lodash.orderBy | 311483 | 0.003 | 2.53× |
| ramda.sortWith | 291530 | 0.003 | 2.70× |
| sort-array | 179649 | 0.006 | 4.38× |
| natural-orderby | 42314 | 0.024 | 18.62× |
| sort-on | 40960 | 0.024 | 19.23× |
| sort-by | 5079 | 0.197 | 155.08× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 229468 | 0.004 | 0.64× |
| inline comparator chain, slice().sort() | 226925 | 0.004 | 0.65× |
| fast-multisort | 147870 | 0.007 | 1.00× |
| es-toolkit.orderBy | 88276 | 0.011 | 1.68× |
| lodash.orderBy | 86780 | 0.012 | 1.70× |
| Array.prototype.sort, decorated | 80000 | 0.012 | 1.85× |
| remeda.sortBy (different order) | 70137 | 0.014 | 2.11× |
| thenby (different order) | 68040 | 0.015 | 2.17× |
| ramda.sortWith (different order) | 65431 | 0.015 | 2.26× |
| fast-sort (different order) | 60413 | 0.017 | 2.45× |
| sort-array (different order) | 35433 | 0.028 | 4.17× |
| natural-orderby (different order) | 10199 | 0.098 | 14.50× |
| sort-on (different order) | 9343 | 0.107 | 15.83× |
| sort-by (different order) | 1103 | 0.906 | 134.01× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 44138 | 0.023 | 1.00× |
| inline comparator chain, toSorted() | 18551 | 0.054 | 2.38× |
| inline comparator chain, slice().sort() | 18286 | 0.055 | 2.41× |
| underscore.sortBy | 11327 | 0.088 | 3.90× |
| thenby | 9309 | 0.107 | 4.74× |
| fast-sort | 8393 | 0.119 | 5.26× |
| es-toolkit.orderBy | 7926 | 0.126 | 5.57× |
| lodash.orderBy | 7688 | 0.130 | 5.74× |
| Array.prototype.sort, decorated | 7273 | 0.137 | 6.07× |
| remeda.sortBy | 6632 | 0.151 | 6.66× |
| ramda.sortWith | 6066 | 0.165 | 7.28× |
| just-sort-by (different order) | 4238 | 0.236 | 10.41× |
| sort-array | 3855 | 0.259 | 11.45× |
| natural-orderby (different order) | 2623 | 0.381 | 16.83× |
| sort-on (different order) | 991 | 1.009 | 44.55× |
| sort-by | 127 | 7.850 | 346.48× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14587 | 0.069 | 1.00× |
| inline comparator chain, slice().sort() | 9377 | 0.107 | 1.56× |
| inline comparator chain, toSorted() | 9377 | 0.107 | 1.56× |
| underscore.sortBy | 6038 | 0.166 | 2.42× |
| thenby | 5740 | 0.174 | 2.54× |
| fast-sort | 5311 | 0.188 | 2.75× |
| es-toolkit.orderBy | 5203 | 0.192 | 2.80× |
| remeda.sortBy | 4723 | 0.212 | 3.09× |
| Array.prototype.sort, decorated | 4672 | 0.214 | 3.12× |
| lodash.orderBy | 4369 | 0.229 | 3.34× |
| ramda.sortWith | 4063 | 0.246 | 3.59× |
| just-sort-by (different order) | 2896 | 0.345 | 5.04× |
| sort-array | 2510 | 0.398 | 5.81× |
| natural-orderby (different order) | 877 | 1.141 | 16.64× |
| sort-on (different order) | 620 | 1.613 | 23.52× |
| sort-by | 98 | 10.250 | 149.52× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 33247 | 0.030 | 1.00× |
| inline comparator chain, slice().sort() | 14463 | 0.069 | 2.30× |
| inline comparator chain, toSorted() | 14382 | 0.070 | 2.31× |
| underscore.sortBy (different order) | 9734 | 0.103 | 3.42× |
| just-sort-by (different order) | 8076 | 0.124 | 4.12× |
| thenby (different order) | 7619 | 0.131 | 4.36× |
| fast-sort | 7529 | 0.133 | 4.42× |
| es-toolkit.orderBy | 7091 | 0.141 | 4.69× |
| Array.prototype.sort, decorated | 6615 | 0.151 | 5.03× |
| lodash.orderBy | 6581 | 0.152 | 5.05× |
| remeda.sortBy (different order) | 6531 | 0.153 | 5.09× |
| ramda.sortWith (different order) | 5120 | 0.195 | 6.49× |
| sort-array | 3241 | 0.309 | 10.26× |
| natural-orderby | 2712 | 0.369 | 12.26× |
| sort-on | 870 | 1.150 | 38.23× |
| sort-by (different order) | 103 | 9.700 | 322.49× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 31703 | 0.032 | 1.00× |
| inline comparator chain, toSorted() | 11429 | 0.087 | 2.77× |
| inline comparator chain, slice().sort() | 10756 | 0.093 | 2.95× |
| underscore.sortBy | 8591 | 0.116 | 3.69× |
| just-sort-by | 6465 | 0.155 | 4.90× |
| thenby | 6368 | 0.157 | 4.98× |
| fast-sort | 6124 | 0.163 | 5.18× |
| es-toolkit.orderBy | 6038 | 0.166 | 5.25× |
| remeda.sortBy | 6009 | 0.166 | 5.28× |
| lodash.orderBy | 5639 | 0.177 | 5.62× |
| Array.prototype.sort, decorated | 5447 | 0.184 | 5.82× |
| ramda.sortWith | 4655 | 0.215 | 6.81× |
| sort-array | 2991 | 0.334 | 10.60× |
| natural-orderby | 2278 | 0.439 | 13.92× |
| sort-on | 721 | 1.387 | 43.99× |
| sort-by | 97 | 10.300 | 326.54× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14713 | 0.068 | 1.00× |
| inline comparator chain, toSorted() | 10756 | 0.093 | 1.37× |
| inline comparator chain, slice().sort() | 10364 | 0.096 | 1.42× |
| underscore.sortBy | 6790 | 0.147 | 2.17× |
| thenby | 6124 | 0.163 | 2.40× |
| fast-sort | 5714 | 0.175 | 2.57× |
| es-toolkit.orderBy | 5541 | 0.180 | 2.66× |
| Array.prototype.sort, decorated | 5378 | 0.186 | 2.74× |
| remeda.sortBy | 4942 | 0.202 | 2.98× |
| lodash.orderBy | 4830 | 0.207 | 3.05× |
| ramda.sortWith | 4238 | 0.236 | 3.47× |
| just-sort-by | 4013 | 0.249 | 3.67× |
| sort-array | 2832 | 0.353 | 5.20× |
| natural-orderby | 1744 | 0.573 | 8.44× |
| sort-on | 618 | 1.619 | 23.82× |
| sort-by | 97 | 10.300 | 151.54× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 248242 | 0.004 | 0.74× |
| inline comparator chain, slice().sort() | 202272 | 0.005 | 0.91× |
| fast-multisort | 184505 | 0.005 | 1.00× |
| just-sort-by | 103434 | 0.010 | 1.78× |
| thenby | 90220 | 0.011 | 2.05× |
| fast-sort | 86414 | 0.012 | 2.14× |
| es-toolkit.orderBy | 81594 | 0.012 | 2.26× |
| remeda.sortBy | 78168 | 0.013 | 2.36× |
| Array.prototype.sort, decorated | 59883 | 0.017 | 3.08× |
| underscore.sortBy | 57853 | 0.017 | 3.19× |
| ramda.sortWith | 56889 | 0.018 | 3.24× |
| lodash.orderBy | 43948 | 0.023 | 4.20× |
| sort-array | 31900 | 0.031 | 5.78× |
| sort-on | 6598 | 0.152 | 27.96× |
| natural-orderby | 4507 | 0.222 | 40.94× |
| sort-by | 865 | 1.156 | 213.33× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 229468 | 0.004 | 0.79× |
| inline comparator chain, slice().sort() | 183677 | 0.005 | 0.99× |
| fast-multisort | 182044 | 0.005 | 1.00× |
| just-sort-by | 99902 | 0.010 | 1.82× |
| thenby | 89043 | 0.011 | 2.04× |
| fast-sort | 86414 | 0.012 | 2.11× |
| es-toolkit.orderBy | 81594 | 0.012 | 2.23× |
| remeda.sortBy | 64000 | 0.016 | 2.84× |
| Array.prototype.sort, decorated | 58682 | 0.017 | 3.10× |
| ramda.sortWith | 57207 | 0.017 | 3.18× |
| underscore.sortBy | 52648 | 0.019 | 3.46× |
| lodash.orderBy | 40635 | 0.025 | 4.48× |
| sort-array | 33907 | 0.029 | 5.37× |
| sort-on | 5792 | 0.173 | 31.43× |
| natural-orderby | 4429 | 0.226 | 41.10× |
| sort-by | 838 | 1.194 | 217.32× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 201773 | 0.005 | 0.60× |
| inline comparator chain, slice().sort() | 166504 | 0.006 | 0.72× |
| fast-multisort | 120471 | 0.008 | 1.00× |
| just-sort-by | 90619 | 0.011 | 1.33× |
| thenby | 78769 | 0.013 | 1.53× |
| fast-sort | 76704 | 0.013 | 1.57× |
| es-toolkit.orderBy | 72624 | 0.014 | 1.66× |
| remeda.sortBy | 68267 | 0.015 | 1.76× |
| Array.prototype.sort, decorated | 53895 | 0.019 | 2.24× |
| underscore.sortBy | 53057 | 0.019 | 2.27× |
| ramda.sortWith | 51717 | 0.019 | 2.33× |
| lodash.orderBy | 40960 | 0.024 | 2.94× |
| sort-array | 29595 | 0.034 | 4.07× |
| sort-on | 6719 | 0.149 | 17.93× |
| natural-orderby | 4384 | 0.228 | 27.48× |
| sort-by | 844 | 1.184 | 142.68× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11852 | 0.084 | 1.00× |
| inline comparator chain, toSorted() | 11797 | 0.085 | 1.00× |
| inline comparator chain, slice().sort() | 11743 | 0.085 | 1.01× |
| lodash.orderBy | 5120 | 0.195 | 2.31× |
| es-toolkit.orderBy | 4776 | 0.209 | 2.48× |
| Array.prototype.sort, decorated | 4295 | 0.233 | 2.76× |
| remeda.sortBy (different order) | 3879 | 0.258 | 3.06× |
| thenby (different order) | 3867 | 0.259 | 3.06× |
| ramda.sortWith (different order) | 3732 | 0.268 | 3.18× |
| fast-sort (different order) | 3478 | 0.288 | 3.41× |
| sort-array (different order) | 2013 | 0.497 | 5.89× |
| natural-orderby (different order) | 901 | 1.109 | 13.15× |
| sort-on (different order) | 535 | 1.869 | 22.15× |
| sort-by (different order) | 59 | 16.950 | 200.89× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4555 | 0.220 | 1.00× |
| inline comparator chain, slice().sort() | 1236 | 0.809 | 3.69× |
| inline comparator chain, toSorted() | 1231 | 0.813 | 3.70× |
| underscore.sortBy | 896 | 1.116 | 5.08× |
| thenby | 818 | 1.222 | 5.57× |
| fast-sort | 777 | 1.287 | 5.86× |
| es-toolkit.orderBy | 724 | 1.381 | 6.29× |
| Array.prototype.sort, decorated | 648 | 1.544 | 7.03× |
| lodash.orderBy | 623 | 1.606 | 7.32× |
| remeda.sortBy | 604 | 1.656 | 7.54× |
| ramda.sortWith | 571 | 1.750 | 7.97× |
| just-sort-by (different order) | 399 | 2.506 | 11.42× |
| sort-array | 372 | 2.688 | 12.24× |
| natural-orderby (different order) | 245 | 4.075 | 18.56× |
| sort-on (different order) | 96 | 10.450 | 47.60× |
| sort-by | 12 | 81.900 | 373.07× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1147 | 0.872 | 1.00× |
| inline comparator chain, toSorted() | 472 | 2.119 | 2.43× |
| inline comparator chain, slice().sort() | 465 | 2.150 | 2.47× |
| underscore.sortBy | 377 | 2.650 | 3.04× |
| thenby | 357 | 2.800 | 3.21× |
| fast-sort | 351 | 2.850 | 3.27× |
| es-toolkit.orderBy | 346 | 2.887 | 3.31× |
| remeda.sortBy | 323 | 3.100 | 3.56× |
| Array.prototype.sort, decorated | 301 | 3.325 | 3.81× |
| lodash.orderBy | 287 | 3.488 | 4.00× |
| ramda.sortWith | 284 | 3.525 | 4.04× |
| just-sort-by (different order) | 203 | 4.925 | 5.65× |
| sort-array | 184 | 5.425 | 6.22× |
| natural-orderby (different order) | 70 | 14.300 | 16.40× |
| sort-on (different order) | 44 | 22.500 | 25.81× |
| sort-by | 7 | 142.300 | 163.21× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3743 | 0.267 | 1.00× |
| inline comparator chain, slice().sort() | 899 | 1.113 | 4.16× |
| inline comparator chain, toSorted() | 899 | 1.113 | 4.16× |
| underscore.sortBy (different order) | 702 | 1.425 | 5.33× |
| just-sort-by (different order) | 573 | 1.744 | 6.53× |
| fast-sort | 569 | 1.756 | 6.57× |
| thenby (different order) | 535 | 1.869 | 6.99× |
| es-toolkit.orderBy | 532 | 1.881 | 7.04× |
| remeda.sortBy (different order) | 495 | 2.019 | 7.56× |
| Array.prototype.sort, decorated | 476 | 2.100 | 7.86× |
| lodash.orderBy | 471 | 2.125 | 7.95× |
| ramda.sortWith (different order) | 394 | 2.537 | 9.50× |
| sort-array | 248 | 4.038 | 15.11× |
| natural-orderby | 222 | 4.500 | 16.84× |
| sort-on | 62 | 16.150 | 60.44× |
| sort-by (different order) | 8 | 132.000 | 494.04× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3556 | 0.281 | 1.00× |
| inline comparator chain, toSorted() | 672 | 1.487 | 5.29× |
| inline comparator chain, slice().sort() | 669 | 1.494 | 5.31× |
| underscore.sortBy | 627 | 1.594 | 5.67× |
| thenby | 457 | 2.188 | 7.78× |
| just-sort-by | 457 | 2.188 | 7.78× |
| fast-sort | 441 | 2.269 | 8.07× |
| es-toolkit.orderBy | 427 | 2.344 | 8.33× |
| remeda.sortBy | 424 | 2.356 | 8.38× |
| lodash.orderBy | 412 | 2.425 | 8.62× |
| Array.prototype.sort, decorated | 390 | 2.563 | 9.11× |
| ramda.sortWith | 325 | 3.075 | 10.93× |
| sort-array | 220 | 4.538 | 16.13× |
| natural-orderby | 183 | 5.450 | 19.38× |
| sort-on | 52 | 19.100 | 67.91× |
| sort-by | 7 | 142.300 | 505.96× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1088 | 0.919 | 1.00× |
| inline comparator chain, toSorted() | 530 | 1.887 | 2.05× |
| inline comparator chain, slice().sort() | 519 | 1.925 | 2.10× |
| underscore.sortBy | 440 | 2.275 | 2.48× |
| thenby | 381 | 2.625 | 2.86× |
| fast-sort | 376 | 2.662 | 2.90× |
| es-toolkit.orderBy | 367 | 2.725 | 2.97× |
| Array.prototype.sort, decorated | 354 | 2.825 | 3.07× |
| remeda.sortBy | 340 | 2.938 | 3.20× |
| lodash.orderBy | 321 | 3.112 | 3.39× |
| ramda.sortWith | 291 | 3.438 | 3.74× |
| just-sort-by | 287 | 3.488 | 3.80× |
| sort-array | 203 | 4.938 | 5.37× |
| natural-orderby | 150 | 6.650 | 7.24× |
| sort-on | 43 | 23.000 | 25.03× |
| sort-by | 7 | 144.800 | 157.61× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 25098 | 0.040 | 0.73× |
| inline comparator chain, slice().sort() | 19922 | 0.050 | 0.92× |
| fast-multisort | 18286 | 0.055 | 1.00× |
| just-sort-by | 10407 | 0.096 | 1.76× |
| thenby | 9143 | 0.109 | 2.00× |
| fast-sort | 8649 | 0.116 | 2.11× |
| es-toolkit.orderBy | 8153 | 0.123 | 2.24× |
| remeda.sortBy | 7901 | 0.127 | 2.31× |
| Array.prototype.sort, decorated | 5926 | 0.169 | 3.09× |
| underscore.sortBy | 5872 | 0.170 | 3.11× |
| ramda.sortWith | 5740 | 0.174 | 3.19× |
| lodash.orderBy | 4384 | 0.228 | 4.17× |
| sort-array | 3265 | 0.306 | 5.60× |
| sort-on | 658 | 1.519 | 27.77× |
| natural-orderby | 423 | 2.363 | 43.20× |
| sort-by | 87 | 11.550 | 211.20× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 22756 | 0.044 | 0.80× |
| inline comparator chain, slice().sort() | 18618 | 0.054 | 0.97× |
| fast-multisort | 18092 | 0.055 | 1.00× |
| just-sort-by | 9961 | 0.100 | 1.82× |
| thenby | 9046 | 0.111 | 2.00× |
| fast-sort | 8591 | 0.116 | 2.11× |
| es-toolkit.orderBy | 8232 | 0.121 | 2.20× |
| remeda.sortBy | 6244 | 0.160 | 2.90× |
| Array.prototype.sort, decorated | 5845 | 0.171 | 3.10× |
| ramda.sortWith | 5740 | 0.174 | 3.15× |
| underscore.sortBy | 5267 | 0.190 | 3.43× |
| lodash.orderBy | 3938 | 0.254 | 4.59× |
| sort-array | 3386 | 0.295 | 5.34× |
| sort-on | 580 | 1.725 | 31.21× |
| natural-orderby | 408 | 2.450 | 44.33× |
| sort-by | 83 | 12.050 | 218.01× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 21880 | 0.046 | 0.61× |
| inline comparator chain, slice().sort() | 18028 | 0.055 | 0.74× |
| fast-multisort | 13333 | 0.075 | 1.00× |
| just-sort-by | 9660 | 0.104 | 1.38× |
| thenby | 8477 | 0.118 | 1.57× |
| fast-sort | 7926 | 0.126 | 1.68× |
| es-toolkit.orderBy | 7619 | 0.131 | 1.75× |
| remeda.sortBy | 7378 | 0.136 | 1.81× |
| Array.prototype.sort, decorated | 5590 | 0.179 | 2.39× |
| underscore.sortBy | 5541 | 0.180 | 2.41× |
| ramda.sortWith | 5356 | 0.187 | 2.49× |
| lodash.orderBy | 4116 | 0.243 | 3.24× |
| sort-array | 3062 | 0.327 | 4.35× |
| sort-on | 693 | 1.444 | 19.25× |
| natural-orderby | 419 | 2.388 | 31.83× |
| sort-by | 86 | 11.650 | 155.33× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1524 | 0.656 | 1.00× |
| inline comparator chain, toSorted() | 690 | 1.450 | 2.21× |
| inline comparator chain, slice().sort() | 678 | 1.475 | 2.25× |
| lodash.orderBy | 362 | 2.762 | 4.21× |
| es-toolkit.orderBy | 332 | 3.012 | 4.59× |
| Array.prototype.sort, decorated | 302 | 3.313 | 5.05× |
| thenby (different order) | 276 | 3.625 | 5.52× |
| remeda.sortBy (different order) | 266 | 3.762 | 5.73× |
| ramda.sortWith (different order) | 259 | 3.863 | 5.89× |
| fast-sort (different order) | 234 | 4.275 | 6.51× |
| sort-array (different order) | 141 | 7.100 | 10.82× |
| natural-orderby (different order) | 81 | 12.400 | 18.90× |
| sort-on (different order) | 36 | 27.400 | 41.75× |
| sort-by (different order) | 4 | 248.400 | 378.51× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 406 | 2.462 | 1.00× |
| inline comparator chain, toSorted() | 112 | 8.950 | 3.63× |
| inline comparator chain, slice().sort() | 110 | 9.075 | 3.69× |
| underscore.sortBy | 80 | 12.500 | 5.08× |
| thenby | 76 | 13.100 | 5.32× |
| fast-sort | 74 | 13.550 | 5.50× |
| es-toolkit.orderBy | 70 | 14.350 | 5.83× |
| remeda.sortBy | 59 | 16.850 | 6.84× |
| lodash.orderBy | 59 | 16.900 | 6.86× |
| Array.prototype.sort, decorated | 59 | 16.950 | 6.88× |
| ramda.sortWith | 55 | 18.050 | 7.33× |
| just-sort-by (different order) | 36 | 27.500 | 11.17× |
| sort-array | 35 | 28.400 | 11.53× |
| natural-orderby (different order) | 22 | 46.100 | 18.72× |
| sort-on (different order) | 9 | 107.900 | 43.82× |
| sort-by | 1 | 824.900 | 334.98× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 79 | 12.700 | 1.00× |
| inline comparator chain, toSorted() | 31 | 32.700 | 2.57× |
| inline comparator chain, slice().sort() | 29 | 34.300 | 2.70× |
| thenby | 26 | 38.700 | 3.05× |
| underscore.sortBy | 25 | 39.300 | 3.09× |
| fast-sort | 24 | 41.900 | 3.30× |
| es-toolkit.orderBy | 22 | 44.600 | 3.51× |
| remeda.sortBy | 22 | 46.000 | 3.62× |
| ramda.sortWith | 20 | 50.400 | 3.97× |
| lodash.orderBy | 18 | 54.100 | 4.26× |
| Array.prototype.sort, decorated | 18 | 55.200 | 4.35× |
| sort-array | 14 | 73.700 | 5.80× |
| just-sort-by (different order) | 13 | 76.800 | 6.05× |
| natural-orderby (different order) | 4 | 227.000 | 17.87× |
| sort-on (different order) | 3 | 303.700 | 23.91× |
| sort-by | 1 | 1884.600 | 148.39× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 370 | 2.700 | 1.00× |
| inline comparator chain, toSorted() | 69 | 14.500 | 5.37× |
| inline comparator chain, slice().sort() | 67 | 14.850 | 5.50× |
| underscore.sortBy (different order) | 56 | 17.750 | 6.57× |
| just-sort-by (different order) | 44 | 22.500 | 8.33× |
| thenby (different order) | 43 | 23.100 | 8.56× |
| fast-sort | 43 | 23.100 | 8.56× |
| es-toolkit.orderBy | 40 | 25.100 | 9.30× |
| remeda.sortBy (different order) | 37 | 27.000 | 10.00× |
| lodash.orderBy | 35 | 28.500 | 10.56× |
| Array.prototype.sort, decorated | 33 | 30.500 | 11.30× |
| ramda.sortWith (different order) | 29 | 33.900 | 12.56× |
| sort-array | 20 | 50.600 | 18.74× |
| natural-orderby | 16 | 60.900 | 22.56× |
| sort-on | 5 | 201.500 | 74.63× |
| sort-by (different order) | 1 | 1705.800 | 631.78× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 340 | 2.938 | 1.00× |
| underscore.sortBy | 47 | 21.300 | 7.25× |
| inline comparator chain, slice().sort() | 46 | 21.800 | 7.42× |
| inline comparator chain, toSorted() | 46 | 21.900 | 7.46× |
| thenby | 33 | 30.400 | 10.35× |
| fast-sort | 30 | 32.800 | 11.17× |
| just-sort-by | 29 | 33.900 | 11.54× |
| remeda.sortBy | 29 | 34.200 | 11.64× |
| lodash.orderBy | 29 | 34.400 | 11.71× |
| es-toolkit.orderBy | 29 | 34.800 | 11.85× |
| ramda.sortWith | 23 | 43.300 | 14.74× |
| Array.prototype.sort, decorated | 22 | 46.200 | 15.73× |
| sort-array | 16 | 61.900 | 21.07× |
| natural-orderby | 14 | 72.800 | 24.78× |
| sort-on | 4 | 257.800 | 87.76× |
| sort-by | 1 | 1837.000 | 625.36× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 67 | 14.850 | 1.00× |
| inline comparator chain, toSorted() | 35 | 28.700 | 1.93× |
| inline comparator chain, slice().sort() | 34 | 29.100 | 1.96× |
| underscore.sortBy | 29 | 34.100 | 2.30× |
| thenby | 28 | 35.800 | 2.41× |
| es-toolkit.orderBy | 27 | 37.200 | 2.51× |
| fast-sort | 26 | 38.400 | 2.59× |
| remeda.sortBy | 24 | 41.100 | 2.77× |
| Array.prototype.sort, decorated | 23 | 43.900 | 2.96× |
| ramda.sortWith | 21 | 46.600 | 3.14× |
| lodash.orderBy | 21 | 48.200 | 3.25× |
| just-sort-by | 20 | 50.600 | 3.41× |
| sort-array | 15 | 64.800 | 4.36× |
| natural-orderby | 11 | 88.700 | 5.97× |
| sort-on | 3 | 302.200 | 20.35× |
| sort-by | 1 | 1890.500 | 127.31× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2433 | 0.411 | 0.77× |
| inline comparator chain, slice().sort() | 1969 | 0.508 | 0.96× |
| fast-multisort | 1882 | 0.531 | 1.00× |
| just-sort-by | 1032 | 0.969 | 1.82× |
| thenby | 914 | 1.094 | 2.06× |
| fast-sort | 856 | 1.169 | 2.20× |
| es-toolkit.orderBy | 823 | 1.216 | 2.29× |
| remeda.sortBy | 796 | 1.256 | 2.36× |
| underscore.sortBy | 567 | 1.762 | 3.32× |
| ramda.sortWith | 561 | 1.781 | 3.35× |
| Array.prototype.sort, decorated | 447 | 2.238 | 4.21× |
| lodash.orderBy | 387 | 2.581 | 4.86× |
| sort-array | 319 | 3.137 | 5.91× |
| sort-on | 64 | 15.550 | 29.27× |
| natural-orderby | 34 | 29.000 | 54.59× |
| sort-by | 9 | 117.000 | 220.24× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2246 | 0.445 | 0.84× |
| fast-multisort | 1882 | 0.531 | 1.00× |
| inline comparator chain, slice().sort() | 1823 | 0.548 | 1.03× |
| just-sort-by | 964 | 1.038 | 1.95× |
| thenby | 896 | 1.116 | 2.10× |
| fast-sort | 853 | 1.172 | 2.21× |
| es-toolkit.orderBy | 825 | 1.212 | 2.28× |
| remeda.sortBy | 632 | 1.581 | 2.98× |
| ramda.sortWith | 559 | 1.787 | 3.36× |
| underscore.sortBy | 526 | 1.900 | 3.58× |
| Array.prototype.sort, decorated | 446 | 2.244 | 4.22× |
| lodash.orderBy | 364 | 2.750 | 5.18× |
| sort-array | 328 | 3.050 | 5.74× |
| sort-on | 58 | 17.200 | 32.38× |
| natural-orderby | 35 | 28.500 | 53.65× |
| sort-by | 8 | 119.400 | 224.75× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2032 | 0.492 | 0.67× |
| inline comparator chain, slice().sort() | 1680 | 0.595 | 0.81× |
| fast-multisort | 1356 | 0.737 | 1.00× |
| just-sort-by | 901 | 1.109 | 1.50× |
| thenby | 847 | 1.181 | 1.60× |
| fast-sort | 758 | 1.319 | 1.79× |
| es-toolkit.orderBy | 751 | 1.331 | 1.81× |
| remeda.sortBy | 721 | 1.387 | 1.88× |
| underscore.sortBy | 539 | 1.856 | 2.52× |
| ramda.sortWith | 535 | 1.869 | 2.53× |
| Array.prototype.sort, decorated | 400 | 2.500 | 3.39× |
| lodash.orderBy | 365 | 2.738 | 3.71× |
| sort-array | 304 | 3.288 | 4.46× |
| sort-on | 69 | 14.550 | 19.73× |
| natural-orderby | 34 | 29.100 | 39.46× |
| sort-by | 9 | 115.900 | 157.15× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 142 | 7.025 | 1.00× |
| inline comparator chain, toSorted() | 51 | 19.450 | 2.77× |
| inline comparator chain, slice().sort() | 51 | 19.550 | 2.78× |
| lodash.orderBy | 27 | 37.700 | 5.37× |
| es-toolkit.orderBy | 25 | 39.500 | 5.62× |
| Array.prototype.sort, decorated | 22 | 44.700 | 6.36× |
| remeda.sortBy (different order) | 20 | 49.900 | 7.10× |
| thenby (different order) | 20 | 50.900 | 7.25× |
| ramda.sortWith (different order) | 19 | 51.400 | 7.32× |
| fast-sort (different order) | 18 | 57.100 | 8.13× |
| sort-array (different order) | 10 | 97.200 | 13.84× |
| natural-orderby (different order) | 7 | 147.600 | 21.01× |
| sort-on (different order) | 3 | 367.900 | 52.37× |
| sort-by (different order) | 0 | 3352.900 | 477.28× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42 | 23.900 | 1.00× |
| inline comparator chain, slice().sort() | 11 | 93.900 | 3.93× |
| inline comparator chain, toSorted() | 10 | 96.400 | 4.03× |
| underscore.sortBy | 8 | 128.400 | 5.37× |
| thenby | 7 | 133.800 | 5.60× |
| fast-sort | 7 | 139.600 | 5.84× |
| es-toolkit.orderBy | 7 | 152.100 | 6.36× |
| remeda.sortBy | 6 | 178.400 | 7.46× |
| Array.prototype.sort, decorated | 5 | 183.200 | 7.67× |
| lodash.orderBy | 5 | 187.600 | 7.85× |
| ramda.sortWith | 5 | 189.600 | 7.93× |
| sort-array | 4 | 281.700 | 11.79× |
| just-sort-by (different order) | 4 | 282.200 | 11.81× |
| natural-orderby (different order) | 2 | 468.200 | 19.59× |
| sort-on (different order) | 1 | 1099.300 | 46.00× |
| sort-by | 0 | 8296.700 | 347.14× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5 | 207.500 | 1.00× |
| inline comparator chain, toSorted() | 2 | 647.000 | 3.12× |
| inline comparator chain, slice().sort() | 2 | 658.300 | 3.17× |
| underscore.sortBy | 1 | 747.600 | 3.60× |
| thenby | 1 | 797.500 | 3.84× |
| fast-sort | 1 | 867.200 | 4.18× |
| remeda.sortBy | 1 | 890.200 | 4.29× |
| es-toolkit.orderBy | 1 | 927.600 | 4.47× |
| ramda.sortWith | 1 | 1044.900 | 5.04× |
| lodash.orderBy | 1 | 1169.100 | 5.63× |
| Array.prototype.sort, decorated | 1 | 1196.800 | 5.77× |
| sort-array | 1 | 1558.400 | 7.51× |
| just-sort-by (different order) | 1 | 1633.400 | 7.87× |
| natural-orderby (different order) | 0 | 4218.700 | 20.33× |
| sort-on (different order) | 0 | 4452.100 | 21.46× |
| sort-by | 0 | 23794.300 | 114.67× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 32 | 31.600 | 1.00× |
| inline comparator chain, slice().sort() | 4 | 243.100 | 7.69× |
| inline comparator chain, toSorted() | 4 | 249.700 | 7.90× |
| underscore.sortBy (different order) | 4 | 266.700 | 8.44× |
| just-sort-by (different order) | 3 | 342.500 | 10.84× |
| thenby (different order) | 3 | 356.100 | 11.27× |
| fast-sort | 3 | 359.600 | 11.38× |
| es-toolkit.orderBy | 3 | 379.900 | 12.02× |
| remeda.sortBy (different order) | 3 | 399.300 | 12.64× |
| ramda.sortWith (different order) | 2 | 481.800 | 15.25× |
| lodash.orderBy | 2 | 506.400 | 16.03× |
| Array.prototype.sort, decorated | 2 | 567.700 | 17.97× |
| sort-array | 1 | 793.300 | 25.10× |
| natural-orderby | 1 | 859.400 | 27.20× |
| sort-on | 0 | 2646.000 | 83.73× |
| sort-by (different order) | 0 | 20860.800 | 660.15× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 26 | 38.700 | 1.00× |
| inline comparator chain, toSorted() | 3 | 318.000 | 8.22× |
| inline comparator chain, slice().sort() | 3 | 329.100 | 8.50× |
| underscore.sortBy | 3 | 337.100 | 8.71× |
| just-sort-by | 2 | 472.400 | 12.21× |
| thenby | 2 | 475.700 | 12.29× |
| fast-sort | 2 | 479.300 | 12.39× |
| es-toolkit.orderBy | 2 | 506.400 | 13.09× |
| remeda.sortBy | 2 | 508.900 | 13.15× |
| ramda.sortWith | 2 | 630.900 | 16.30× |
| lodash.orderBy | 1 | 709.600 | 18.34× |
| Array.prototype.sort, decorated | 1 | 731.400 | 18.90× |
| sort-array | 1 | 943.800 | 24.39× |
| natural-orderby | 1 | 1169.600 | 30.22× |
| sort-on | 0 | 3292.700 | 85.08× |
| sort-by | 0 | 22601.100 | 584.01× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 335.600 | 1.00× |
| inline comparator chain, toSorted() | 2 | 489.400 | 1.46× |
| inline comparator chain, slice().sort() | 2 | 513.100 | 1.53× |
| underscore.sortBy | 2 | 573.200 | 1.71× |
| thenby | 2 | 654.000 | 1.95× |
| remeda.sortBy | 1 | 699.100 | 2.08× |
| es-toolkit.orderBy | 1 | 703.000 | 2.09× |
| fast-sort | 1 | 718.000 | 2.14× |
| ramda.sortWith | 1 | 843.700 | 2.51× |
| just-sort-by | 1 | 870.100 | 2.59× |
| Array.prototype.sort, decorated | 1 | 919.300 | 2.74× |
| lodash.orderBy | 1 | 966.400 | 2.88× |
| sort-array | 1 | 1245.300 | 3.71× |
| natural-orderby | 1 | 1418.200 | 4.23× |
| sort-on | 0 | 4165.700 | 12.41× |
| sort-by | 0 | 23519.800 | 70.08× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 206 | 4.850 | 0.67× |
| inline comparator chain, slice().sort() | 186 | 5.375 | 0.74× |
| fast-multisort | 138 | 7.225 | 1.00× |
| just-sort-by | 98 | 10.200 | 1.41× |
| thenby | 88 | 11.300 | 1.56× |
| fast-sort | 80 | 12.550 | 1.74× |
| es-toolkit.orderBy | 79 | 12.650 | 1.75× |
| remeda.sortBy | 73 | 13.700 | 1.90× |
| ramda.sortWith | 54 | 18.450 | 2.55× |
| underscore.sortBy | 38 | 26.400 | 3.65× |
| Array.prototype.sort, decorated | 34 | 29.000 | 4.01× |
| sort-array | 30 | 32.800 | 4.54× |
| lodash.orderBy | 25 | 40.800 | 5.65× |
| sort-on | 6 | 154.900 | 21.44× |
| natural-orderby | 3 | 290.600 | 40.22× |
| sort-by | 1 | 1167.700 | 161.62× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 202 | 4.962 | 0.73× |
| inline comparator chain, slice().sort() | 175 | 5.700 | 0.84× |
| fast-multisort | 148 | 6.775 | 1.00× |
| just-sort-by | 95 | 10.550 | 1.56× |
| thenby | 83 | 12.000 | 1.77× |
| fast-sort | 82 | 12.200 | 1.80× |
| es-toolkit.orderBy | 79 | 12.600 | 1.86× |
| remeda.sortBy | 59 | 16.850 | 2.49× |
| ramda.sortWith | 55 | 18.050 | 2.66× |
| Array.prototype.sort, decorated | 34 | 29.600 | 4.37× |
| sort-array | 33 | 30.200 | 4.46× |
| underscore.sortBy | 29 | 34.400 | 5.08× |
| lodash.orderBy | 24 | 41.600 | 6.14× |
| sort-on | 6 | 175.300 | 25.87× |
| natural-orderby | 3 | 290.100 | 42.82× |
| sort-by | 1 | 1203.300 | 177.61× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 172 | 5.825 | 0.60× |
| inline comparator chain, slice().sort() | 167 | 5.975 | 0.62× |
| fast-multisort | 103 | 9.675 | 1.00× |
| just-sort-by | 93 | 10.800 | 1.12× |
| thenby | 84 | 11.900 | 1.23× |
| fast-sort | 76 | 13.100 | 1.35× |
| es-toolkit.orderBy | 74 | 13.450 | 1.39× |
| remeda.sortBy | 70 | 14.200 | 1.47× |
| ramda.sortWith | 52 | 19.100 | 1.97× |
| underscore.sortBy | 35 | 28.500 | 2.95× |
| sort-array | 29 | 34.700 | 3.59× |
| lodash.orderBy | 25 | 40.700 | 4.21× |
| Array.prototype.sort, decorated | 12 | 82.800 | 8.56× |
| sort-on | 7 | 147.000 | 15.19× |
| natural-orderby | 3 | 296.100 | 30.60× |
| sort-by | 1 | 1179.300 | 121.89× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12 | 80.600 | 1.00× |
| inline comparator chain, toSorted() | 3 | 329.700 | 4.09× |
| inline comparator chain, slice().sort() | 3 | 347.400 | 4.31× |
| es-toolkit.orderBy | 2 | 643.300 | 7.98× |
| lodash.orderBy | 1 | 738.500 | 9.16× |
| thenby (different order) | 1 | 757.800 | 9.40× |
| remeda.sortBy (different order) | 1 | 759.600 | 9.42× |
| ramda.sortWith (different order) | 1 | 768.200 | 9.53× |
| Array.prototype.sort, decorated | 1 | 915.100 | 11.35× |
| fast-sort (different order) | 1 | 920.000 | 11.41× |
| sort-array (different order) | 1 | 1366.500 | 16.95× |
| natural-orderby (different order) | 0 | 2085.300 | 25.87× |
| sort-on (different order) | 0 | 4756.000 | 59.01× |
| sort-by (different order) | 0 | 42194.500 | 523.50× |

</details>

#### WebKit 27.2

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, toSorted() | 0.43× | 1.37× | 6.42× | 63 | 0 |
| inline comparator chain, slice().sort() | 0.44× | 1.52× | 6.42× | 63 | 0 |
| thenby | 0.57× | 2.40× | 10.58× | 63 | 12 |
| es-toolkit.orderBy | 0.68× | 2.51× | 10.58× | 63 | 0 |
| just-sort-by | 0.31× | 2.64× | 18.76× | 56 | 17 |
| fast-sort | 0.68× | 2.85× | 10.69× | 63 | 6 |
| remeda.sortBy | 1.04× | 3.29× | 10.39× | 63 | 12 |
| Array.prototype.sort, decorated | 0.88× | 3.41× | 20.22× | 63 | 0 |
| ramda.sortWith | 1.10× | 3.44× | 12.64× | 63 | 12 |
| underscore.sortBy | 1.15× | 3.50× | 8.31× | 56 | 6 |
| sort-array | 1.69× | 4.46× | 20.89× | 63 | 6 |
| lodash.orderBy | 1.62× | 6.00× | 20.92× | 63 | 0 |
| natural-orderby | 10.43× | 26.95× | 152.38× | 63 | 19 |
| sort-on | 1.14× | 29.60× | 120.38× | 63 | 17 |
| sort-by | 4.91× | 103.62× | 862.32× | 63 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 279620267 | 0.000 | 0.35× |
| fast-multisort | 97541953 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 83886080 | 0.000 | 1.16× |
| inline comparator chain, slice().sort() | 69905067 | 0.000 | 1.40× |
| sort-on | 67650065 | 0.000 | 1.44× |
| es-toolkit.orderBy | 61680941 | 0.000 | 1.58× |
| thenby | 38836148 | 0.000 | 2.51× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 2.98× |
| ramda.sortWith | 28339892 | 0.000 | 3.44× |
| fast-sort | 26214400 | 0.000 | 3.72× |
| sort-array | 23831273 | 0.000 | 4.09× |
| underscore.sortBy | 21845333 | 0.000 | 4.47× |
| sort-by | 19418074 | 0.000 | 5.02× |
| remeda.sortBy | 18724571 | 0.000 | 5.21× |
| lodash.orderBy | 15887515 | 0.000 | 6.14× |
| natural-orderby | 4854519 | 0.000 | 20.09× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.32× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| sort-on | 83886080 | 0.000 | 1.14× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.45× |
| es-toolkit.orderBy | 58254222 | 0.000 | 1.64× |
| thenby | 40329846 | 0.000 | 2.36× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 2.82× |
| ramda.sortWith | 28339892 | 0.000 | 3.36× |
| fast-sort | 26214400 | 0.000 | 3.64× |
| underscore.sortBy | 23831273 | 0.000 | 4.00× |
| sort-array | 22795130 | 0.000 | 4.18× |
| sort-by | 19418074 | 0.000 | 4.91× |
| remeda.sortBy | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15887515 | 0.000 | 6.00× |
| natural-orderby | 2259862 | 0.000 | 42.18× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.32× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| sort-on | 83886080 | 0.000 | 1.19× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.24× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.52× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.67× |
| thenby | 41943040 | 0.000 | 2.38× |
| Array.prototype.sort, decorated | 34952533 | 0.000 | 2.86× |
| ramda.sortWith | 28339892 | 0.000 | 3.52× |
| fast-sort | 26214400 | 0.000 | 3.81× |
| underscore.sortBy | 23831273 | 0.000 | 4.19× |
| sort-array | 22795130 | 0.000 | 4.38× |
| sort-by | 19418074 | 0.000 | 5.14× |
| remeda.sortBy | 18724571 | 0.000 | 5.33× |
| lodash.orderBy | 15887515 | 0.000 | 6.29× |
| natural-orderby | 3276800 | 0.000 | 30.48× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.32× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| sort-on | 83886080 | 0.000 | 1.19× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.24× |
| inline comparator chain, slice().sort() | 67650065 | 0.000 | 1.48× |
| es-toolkit.orderBy | 58254222 | 0.000 | 1.71× |
| thenby | 41943040 | 0.000 | 2.38× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 2.95× |
| ramda.sortWith | 29127111 | 0.000 | 3.43× |
| fast-sort | 26214400 | 0.000 | 3.81× |
| underscore.sortBy | 23831273 | 0.000 | 4.19× |
| sort-array | 22795130 | 0.000 | 4.38× |
| remeda.sortBy | 18724571 | 0.000 | 5.33× |
| sort-by | 18724571 | 0.000 | 5.33× |
| lodash.orderBy | 15887515 | 0.000 | 6.29× |
| natural-orderby | 2978909 | 0.000 | 33.52× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.31× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| sort-on | 83886080 | 0.000 | 1.14× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 67650065 | 0.000 | 1.41× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.59× |
| thenby | 41943040 | 0.000 | 2.27× |
| Array.prototype.sort, decorated | 34952533 | 0.000 | 2.73× |
| ramda.sortWith | 28339892 | 0.000 | 3.36× |
| fast-sort | 26214400 | 0.000 | 3.64× |
| sort-array | 22795130 | 0.000 | 4.18× |
| underscore.sortBy | 22795130 | 0.000 | 4.18× |
| sort-by | 19418074 | 0.000 | 4.91× |
| remeda.sortBy | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15887515 | 0.000 | 6.00× |
| natural-orderby | 992970 | 0.001 | 96.00× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.31× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| sort-on | 83886080 | 0.000 | 1.14× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.45× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.59× |
| thenby | 41943040 | 0.000 | 2.27× |
| Array.prototype.sort, decorated | 34952533 | 0.000 | 2.73× |
| ramda.sortWith | 28339892 | 0.000 | 3.36× |
| fast-sort | 26214400 | 0.000 | 3.64× |
| underscore.sortBy | 23831273 | 0.000 | 4.00× |
| sort-array | 22795130 | 0.000 | 4.18× |
| remeda.sortBy | 19418074 | 0.000 | 4.91× |
| sort-by | 19418074 | 0.000 | 4.91× |
| lodash.orderBy | 15887515 | 0.000 | 6.00× |
| natural-orderby | 4228129 | 0.000 | 22.55× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.32× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| sort-on | 83886080 | 0.000 | 1.19× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.24× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.52× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.67× |
| thenby | 41943040 | 0.000 | 2.38× |
| Array.prototype.sort, decorated | 34952533 | 0.000 | 2.86× |
| ramda.sortWith | 28339892 | 0.000 | 3.52× |
| fast-sort | 26214400 | 0.000 | 3.81× |
| sort-array | 22795130 | 0.000 | 4.38× |
| underscore.sortBy | 22795130 | 0.000 | 4.38× |
| remeda.sortBy | 19418074 | 0.000 | 5.14× |
| sort-by | 19418074 | 0.000 | 5.14× |
| lodash.orderBy | 15420235 | 0.000 | 6.48× |
| natural-orderby | 4228129 | 0.000 | 23.62× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.32× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| sort-on | 83886080 | 0.000 | 1.19× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.24× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.52× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.67× |
| thenby | 41943040 | 0.000 | 2.38× |
| Array.prototype.sort, decorated | 34952533 | 0.000 | 2.86× |
| ramda.sortWith | 28339892 | 0.000 | 3.52× |
| fast-sort | 26214400 | 0.000 | 3.81× |
| sort-array | 22795130 | 0.000 | 4.38× |
| underscore.sortBy | 22795130 | 0.000 | 4.38× |
| sort-by | 19418074 | 0.000 | 5.14× |
| remeda.sortBy | 18724571 | 0.000 | 5.33× |
| lodash.orderBy | 15887515 | 0.000 | 6.29× |
| natural-orderby | 3360821 | 0.000 | 29.71× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 99864381 | 0.000 | 1.00× |
| sort-on | 83886080 | 0.000 | 1.19× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.24× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.52× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 2.95× |
| fast-sort | 22795130 | 0.000 | 4.38× |
| sort-array | 22795130 | 0.000 | 4.38× |
| ramda.sortWith | 20971520 | 0.000 | 4.76× |
| sort-by | 18078897 | 0.000 | 5.52× |
| thenby | 17476267 | 0.000 | 5.71× |
| lodash.orderBy | 16384000 | 0.000 | 6.10× |
| remeda.sortBy | 10922667 | 0.000 | 9.14× |
| natural-orderby | 655360 | 0.002 | 152.38× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 7084973 | 0.000 | 0.95× |
| fast-multisort | 6721641 | 0.000 | 1.00× |
| thenby | 5957818 | 0.000 | 1.13× |
| inline comparator chain, toSorted() | 5041231 | 0.000 | 1.33× |
| es-toolkit.orderBy | 5041231 | 0.000 | 1.33× |
| Array.prototype.sort, decorated | 5041231 | 0.000 | 1.33× |
| fast-sort | 4519724 | 0.000 | 1.49× |
| underscore.sortBy | 4096000 | 0.000 | 1.64× |
| ramda.sortWith | 3449263 | 0.000 | 1.95× |
| remeda.sortBy | 3360821 | 0.000 | 2.00× |
| lodash.orderBy | 2259862 | 0.000 | 2.97× |
| sort-array | 1985939 | 0.001 | 3.38× |
| just-sort-by (different order) | 1092267 | 0.001 | 6.15× |
| natural-orderby (different order) | 372364 | 0.003 | 18.05× |
| sort-on (different order) | 264258 | 0.004 | 25.44× |
| sort-by | 68267 | 0.015 | 98.46× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 6553600 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 6241524 | 0.000 | 1.05× |
| thenby | 5242880 | 0.000 | 1.25× |
| inline comparator chain, toSorted() | 4854519 | 0.000 | 1.35× |
| es-toolkit.orderBy | 4854519 | 0.000 | 1.35× |
| fast-sort | 4369067 | 0.000 | 1.50× |
| Array.prototype.sort, decorated | 3855059 | 0.000 | 1.70× |
| underscore.sortBy | 3640889 | 0.000 | 1.80× |
| ramda.sortWith | 3449263 | 0.000 | 1.90× |
| remeda.sortBy | 3120762 | 0.000 | 2.10× |
| lodash.orderBy | 2114065 | 0.000 | 3.10× |
| sort-array | 1724632 | 0.001 | 3.80× |
| just-sort-by | 1024000 | 0.001 | 6.40× |
| sort-on | 221405 | 0.005 | 29.60× |
| natural-orderby | 163840 | 0.006 | 40.00× |
| sort-by | 68267 | 0.015 | 96.00× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 12483048 | 0.000 | 0.84× |
| just-sort-by (different order) | 12483048 | 0.000 | 0.84× |
| fast-multisort | 10485760 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 8456258 | 0.000 | 1.24× |
| es-toolkit.orderBy | 8456258 | 0.000 | 1.24× |
| thenby (different order) | 8192000 | 0.000 | 1.28× |
| fast-sort | 6898526 | 0.000 | 1.52× |
| Array.prototype.sort, decorated | 5698783 | 0.000 | 1.84× |
| remeda.sortBy (different order) | 4681143 | 0.000 | 2.24× |
| underscore.sortBy (different order) | 4681143 | 0.000 | 2.24× |
| ramda.sortWith (different order) | 4096000 | 0.000 | 2.56× |
| sort-array | 3120762 | 0.000 | 3.36× |
| lodash.orderBy | 2427259 | 0.000 | 4.32× |
| natural-orderby | 409600 | 0.002 | 25.60× |
| sort-on | 327680 | 0.003 | 32.00× |
| sort-by (different order) | 68267 | 0.015 | 153.60× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 7084973 | 0.000 | 0.88× |
| inline comparator chain, toSorted() | 6898526 | 0.000 | 0.90× |
| thenby | 6553600 | 0.000 | 0.95× |
| fast-multisort | 6241524 | 0.000 | 1.00× |
| just-sort-by | 6241524 | 0.000 | 1.00× |
| fast-sort | 5957818 | 0.000 | 1.05× |
| es-toolkit.orderBy | 5461333 | 0.000 | 1.14× |
| remeda.sortBy | 4228129 | 0.000 | 1.48× |
| ramda.sortWith | 2849391 | 0.000 | 2.19× |
| underscore.sortBy | 2730667 | 0.000 | 2.29× |
| Array.prototype.sort, decorated | 2520615 | 0.000 | 2.48× |
| sort-array | 1724632 | 0.001 | 3.62× |
| lodash.orderBy | 1213630 | 0.001 | 5.14× |
| natural-orderby | 315077 | 0.003 | 19.81× |
| sort-on | 204800 | 0.005 | 30.48× |
| sort-by | 46545 | 0.021 | 134.10× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4854519 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 4854519 | 0.000 | 1.00× |
| thenby | 4854519 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4681143 | 0.000 | 1.04× |
| es-toolkit.orderBy | 4519724 | 0.000 | 1.07× |
| fast-sort | 3971879 | 0.000 | 1.22× |
| remeda.sortBy | 3120762 | 0.000 | 1.56× |
| ramda.sortWith | 2427259 | 0.000 | 2.00× |
| Array.prototype.sort, decorated | 2427259 | 0.000 | 2.00× |
| underscore.sortBy | 2259862 | 0.000 | 2.15× |
| just-sort-by | 1724632 | 0.001 | 2.81× |
| sort-array | 1638400 | 0.001 | 2.96× |
| lodash.orderBy | 1365333 | 0.001 | 3.56× |
| sort-on | 227556 | 0.004 | 21.33× |
| natural-orderby | 85333 | 0.012 | 56.89× |
| sort-by | 58514 | 0.017 | 82.96× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 32768000 | 0.000 | 1.00× |
| es-toolkit.orderBy | 15887515 | 0.000 | 2.06× |
| thenby | 15887515 | 0.000 | 2.06× |
| inline comparator chain, slice().sort() | 13443282 | 0.000 | 2.44× |
| inline comparator chain, toSorted() | 13107200 | 0.000 | 2.50× |
| fast-sort | 12483048 | 0.000 | 2.63× |
| just-sort-by | 12483048 | 0.000 | 2.63× |
| ramda.sortWith | 8738133 | 0.000 | 3.75× |
| Array.prototype.sort, decorated | 8738133 | 0.000 | 3.75× |
| underscore.sortBy | 8192000 | 0.000 | 4.00× |
| remeda.sortBy | 5957818 | 0.000 | 5.50× |
| sort-array | 4854519 | 0.000 | 6.75× |
| lodash.orderBy | 3276800 | 0.000 | 10.00× |
| sort-on | 630154 | 0.002 | 52.00× |
| natural-orderby | 496485 | 0.002 | 66.00× |
| sort-by | 170667 | 0.006 | 192.00× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 27594105 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 13107200 | 0.000 | 2.11× |
| inline comparator chain, toSorted() | 12483048 | 0.000 | 2.21× |
| just-sort-by | 11915636 | 0.000 | 2.32× |
| remeda.sortBy | 5698783 | 0.000 | 4.84× |
| thenby | 5242880 | 0.000 | 5.26× |
| underscore.sortBy | 5242880 | 0.000 | 5.26× |
| sort-array | 4854519 | 0.000 | 5.68× |
| fast-sort | 4681143 | 0.000 | 5.89× |
| es-toolkit.orderBy | 4096000 | 0.000 | 6.74× |
| Array.prototype.sort, decorated | 2849391 | 0.000 | 9.68× |
| ramda.sortWith | 2340571 | 0.000 | 11.79× |
| lodash.orderBy | 1560381 | 0.001 | 17.68× |
| sort-on | 528516 | 0.002 | 52.21× |
| natural-orderby | 431158 | 0.002 | 64.00× |
| sort-by | 32000 | 0.031 | 862.32× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| thenby | 11397565 | 0.000 | 0.57× |
| es-toolkit.orderBy | 9709037 | 0.000 | 0.68× |
| fast-sort | 9709037 | 0.000 | 0.68× |
| inline comparator chain, slice().sort() | 7489829 | 0.000 | 0.88× |
| inline comparator chain, toSorted() | 6898526 | 0.000 | 0.95× |
| fast-multisort | 6553600 | 0.000 | 1.00× |
| just-sort-by | 6553600 | 0.000 | 1.00× |
| ramda.sortWith | 5957818 | 0.000 | 1.10× |
| Array.prototype.sort, decorated | 5698783 | 0.000 | 1.15× |
| underscore.sortBy | 5698783 | 0.000 | 1.15× |
| remeda.sortBy | 4369067 | 0.000 | 1.50× |
| lodash.orderBy | 2520615 | 0.000 | 2.60× |
| sort-array | 2520615 | 0.000 | 2.60× |
| natural-orderby | 481882 | 0.002 | 13.60× |
| sort-on | 282483 | 0.004 | 23.20× |
| sort-by | 110703 | 0.009 | 59.20× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4681143 | 0.000 | 0.54× |
| inline comparator chain, toSorted() | 4681143 | 0.000 | 0.54× |
| es-toolkit.orderBy | 3120762 | 0.000 | 0.81× |
| Array.prototype.sort, decorated | 2849391 | 0.000 | 0.88× |
| fast-multisort | 2520615 | 0.000 | 1.00× |
| remeda.sortBy (different order) | 2259862 | 0.000 | 1.12× |
| thenby (different order) | 2259862 | 0.000 | 1.12× |
| ramda.sortWith (different order) | 2048000 | 0.000 | 1.23× |
| fast-sort (different order) | 1724632 | 0.001 | 1.46× |
| lodash.orderBy | 1560381 | 0.001 | 1.62× |
| sort-array (different order) | 1489455 | 0.001 | 1.69× |
| sort-on (different order) | 199805 | 0.005 | 12.62× |
| natural-orderby (different order) | 58514 | 0.017 | 43.08× |
| sort-by (different order) | 51200 | 0.020 | 49.23× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 585143 | 0.002 | 1.00× |
| inline comparator chain, slice().sort() | 273067 | 0.004 | 2.14× |
| inline comparator chain, toSorted() | 273067 | 0.004 | 2.14× |
| thenby | 157538 | 0.006 | 3.71× |
| underscore.sortBy | 157538 | 0.006 | 3.71× |
| Array.prototype.sort, decorated | 151704 | 0.007 | 3.86× |
| fast-sort | 128000 | 0.008 | 4.57× |
| es-toolkit.orderBy | 120471 | 0.008 | 4.86× |
| remeda.sortBy | 113778 | 0.009 | 5.14× |
| lodash.orderBy | 97524 | 0.010 | 6.00× |
| ramda.sortWith | 93091 | 0.011 | 6.29× |
| sort-array | 89043 | 0.011 | 6.57× |
| just-sort-by (different order) | 40960 | 0.024 | 14.29× |
| natural-orderby (different order) | 26256 | 0.038 | 22.29× |
| sort-on (different order) | 10667 | 0.094 | 54.86× |
| sort-by | 2783 | 0.359 | 210.29× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 273067 | 0.004 | 1.00× |
| inline comparator chain, slice().sort() | 248242 | 0.004 | 1.10× |
| inline comparator chain, toSorted() | 248242 | 0.004 | 1.10× |
| thenby | 128000 | 0.008 | 2.13× |
| underscore.sortBy | 117029 | 0.009 | 2.33× |
| fast-sort | 110703 | 0.009 | 2.47× |
| es-toolkit.orderBy | 107789 | 0.009 | 2.53× |
| remeda.sortBy | 107789 | 0.009 | 2.53× |
| Array.prototype.sort, decorated | 102400 | 0.010 | 2.67× |
| ramda.sortWith | 85333 | 0.012 | 3.20× |
| lodash.orderBy | 75852 | 0.013 | 3.60× |
| sort-array | 70621 | 0.014 | 3.87× |
| just-sort-by (different order) | 35310 | 0.028 | 7.73× |
| natural-orderby (different order) | 11636 | 0.086 | 23.47× |
| sort-on (different order) | 9481 | 0.105 | 28.80× |
| sort-by | 2667 | 0.375 | 102.40× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 455111 | 0.002 | 0.78× |
| inline comparator chain, toSorted() | 455111 | 0.002 | 0.78× |
| fast-multisort | 356174 | 0.003 | 1.00× |
| underscore.sortBy (different order) | 282483 | 0.004 | 1.26× |
| just-sort-by (different order) | 204800 | 0.005 | 1.74× |
| thenby (different order) | 186182 | 0.005 | 1.91× |
| Array.prototype.sort, decorated | 186182 | 0.005 | 1.91× |
| fast-sort | 178087 | 0.006 | 2.00× |
| es-toolkit.orderBy | 163840 | 0.006 | 2.17× |
| remeda.sortBy (different order) | 163840 | 0.006 | 2.17× |
| lodash.orderBy | 128000 | 0.008 | 2.78× |
| sort-array | 120471 | 0.008 | 2.96× |
| ramda.sortWith (different order) | 113778 | 0.009 | 3.13× |
| natural-orderby | 34133 | 0.029 | 10.43× |
| sort-on | 12190 | 0.082 | 29.22× |
| sort-by (different order) | 2909 | 0.344 | 122.43× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 420103 | 0.002 | 0.81× |
| inline comparator chain, toSorted() | 390095 | 0.003 | 0.88× |
| fast-multisort | 341333 | 0.003 | 1.00× |
| underscore.sortBy | 178087 | 0.006 | 1.92× |
| just-sort-by | 163840 | 0.006 | 2.08× |
| thenby | 141241 | 0.007 | 2.42× |
| Array.prototype.sort, decorated | 141241 | 0.007 | 2.42× |
| remeda.sortBy | 124121 | 0.008 | 2.75× |
| fast-sort | 124121 | 0.008 | 2.75× |
| es-toolkit.orderBy | 117029 | 0.009 | 2.92× |
| ramda.sortWith | 93091 | 0.011 | 3.67× |
| sort-array | 93091 | 0.011 | 3.67× |
| lodash.orderBy | 73143 | 0.014 | 4.67× |
| natural-orderby | 28444 | 0.035 | 12.00× |
| sort-on | 9481 | 0.105 | 36.00× |
| sort-by | 2667 | 0.375 | 128.00× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 234057 | 0.004 | 0.76× |
| inline comparator chain, toSorted() | 234057 | 0.004 | 0.76× |
| fast-multisort | 178087 | 0.006 | 1.00× |
| underscore.sortBy | 110703 | 0.009 | 1.61× |
| thenby | 107789 | 0.009 | 1.65× |
| Array.prototype.sort, decorated | 107789 | 0.009 | 1.65× |
| es-toolkit.orderBy | 97524 | 0.010 | 1.83× |
| remeda.sortBy | 97524 | 0.010 | 1.83× |
| fast-sort | 97524 | 0.010 | 1.83× |
| ramda.sortWith | 89043 | 0.011 | 2.00× |
| lodash.orderBy | 73143 | 0.014 | 2.43× |
| sort-array | 73143 | 0.014 | 2.43× |
| just-sort-by | 60235 | 0.017 | 2.96× |
| sort-on | 9143 | 0.109 | 19.48× |
| natural-orderby | 7758 | 0.129 | 22.96× |
| sort-by | 2667 | 0.375 | 66.78× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2114065 | 0.000 | 0.74× |
| inline comparator chain, slice().sort() | 2048000 | 0.000 | 0.76× |
| fast-multisort | 1560381 | 0.001 | 1.00× |
| just-sort-by | 1170286 | 0.001 | 1.33× |
| fast-sort | 992970 | 0.001 | 1.57× |
| es-toolkit.orderBy | 885622 | 0.001 | 1.76× |
| thenby | 885622 | 0.001 | 1.76× |
| remeda.sortBy | 744727 | 0.001 | 2.10× |
| ramda.sortWith | 712348 | 0.001 | 2.19× |
| Array.prototype.sort, decorated | 712348 | 0.001 | 2.19× |
| underscore.sortBy | 712348 | 0.001 | 2.19× |
| sort-array | 682667 | 0.001 | 2.29× |
| lodash.orderBy | 341333 | 0.003 | 4.57× |
| sort-on | 56889 | 0.018 | 27.43× |
| natural-orderby | 39385 | 0.025 | 39.62× |
| sort-by | 15059 | 0.066 | 103.62× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2048000 | 0.000 | 0.62× |
| inline comparator chain, slice().sort() | 1985939 | 0.001 | 0.63× |
| fast-multisort | 1260308 | 0.001 | 1.00× |
| just-sort-by | 1213630 | 0.001 | 1.04× |
| thenby | 1057032 | 0.001 | 1.19× |
| fast-sort | 963765 | 0.001 | 1.31× |
| es-toolkit.orderBy | 862316 | 0.001 | 1.46× |
| Array.prototype.sort, decorated | 744727 | 0.001 | 1.69× |
| remeda.sortBy | 712348 | 0.001 | 1.77× |
| ramda.sortWith | 712348 | 0.001 | 1.77× |
| sort-array | 682667 | 0.001 | 1.85× |
| underscore.sortBy | 682667 | 0.001 | 1.85× |
| lodash.orderBy | 341333 | 0.003 | 3.69× |
| sort-on | 48762 | 0.021 | 25.85× |
| natural-orderby | 40960 | 0.024 | 30.77× |
| sort-by | 14629 | 0.068 | 86.15× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 992970 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 963765 | 0.001 | 1.03× |
| inline comparator chain, toSorted() | 910222 | 0.001 | 1.09× |
| just-sort-by | 885622 | 0.001 | 1.12× |
| thenby | 744727 | 0.001 | 1.33× |
| fast-sort | 712348 | 0.001 | 1.39× |
| es-toolkit.orderBy | 655360 | 0.002 | 1.52× |
| underscore.sortBy | 585143 | 0.002 | 1.70× |
| remeda.sortBy | 564966 | 0.002 | 1.76× |
| Array.prototype.sort, decorated | 564966 | 0.002 | 1.76× |
| ramda.sortWith | 528516 | 0.002 | 1.88× |
| sort-array | 496485 | 0.002 | 2.00× |
| lodash.orderBy | 282483 | 0.004 | 3.52× |
| sort-on | 42667 | 0.023 | 23.27× |
| natural-orderby | 40960 | 0.024 | 24.24× |
| sort-by | 11130 | 0.090 | 89.21× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 227556 | 0.004 | 0.72× |
| inline comparator chain, toSorted() | 227556 | 0.004 | 0.72× |
| fast-multisort | 163840 | 0.006 | 1.00× |
| Array.prototype.sort, decorated | 124121 | 0.008 | 1.32× |
| es-toolkit.orderBy | 113778 | 0.009 | 1.44× |
| remeda.sortBy (different order) | 107789 | 0.009 | 1.52× |
| lodash.orderBy | 89043 | 0.011 | 1.84× |
| thenby (different order) | 89043 | 0.011 | 1.84× |
| fast-sort (different order) | 78769 | 0.013 | 2.08× |
| ramda.sortWith (different order) | 73143 | 0.014 | 2.24× |
| sort-array (different order) | 60235 | 0.017 | 2.72× |
| sort-on (different order) | 7758 | 0.129 | 21.12× |
| natural-orderby (different order) | 5565 | 0.180 | 29.44× |
| sort-by (different order) | 1829 | 0.547 | 89.60× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 52513 | 0.019 | 1.00× |
| inline comparator chain, slice().sort() | 18286 | 0.055 | 2.87× |
| inline comparator chain, toSorted() | 18286 | 0.055 | 2.87× |
| thenby | 11130 | 0.090 | 4.72× |
| underscore.sortBy | 11130 | 0.090 | 4.72× |
| Array.prototype.sort, decorated | 10240 | 0.098 | 5.13× |
| fast-sort | 8533 | 0.117 | 6.15× |
| es-toolkit.orderBy | 7758 | 0.129 | 6.77× |
| remeda.sortBy | 7529 | 0.133 | 6.97× |
| lodash.orderBy | 7111 | 0.141 | 7.38× |
| ramda.sortWith | 6737 | 0.148 | 7.79× |
| sort-array | 6095 | 0.164 | 8.62× |
| just-sort-by (different order) | 3048 | 0.328 | 17.23× |
| natural-orderby (different order) | 2286 | 0.438 | 22.97× |
| sort-on (different order) | 842 | 1.188 | 62.36× |
| sort-by | 216 | 4.625 | 242.87× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14629 | 0.068 | 1.00× |
| inline comparator chain, slice().sort() | 10667 | 0.094 | 1.37× |
| inline comparator chain, toSorted() | 10667 | 0.094 | 1.37× |
| underscore.sortBy | 6737 | 0.148 | 2.17× |
| fast-sort | 6400 | 0.156 | 2.29× |
| thenby | 6400 | 0.156 | 2.29× |
| Array.prototype.sort, decorated | 6400 | 0.156 | 2.29× |
| remeda.sortBy | 6095 | 0.164 | 2.40× |
| es-toolkit.orderBy | 5818 | 0.172 | 2.51× |
| ramda.sortWith | 5120 | 0.195 | 2.86× |
| lodash.orderBy | 4571 | 0.219 | 3.20× |
| sort-array | 4414 | 0.227 | 3.31× |
| just-sort-by (different order) | 2000 | 0.500 | 7.31× |
| natural-orderby (different order) | 842 | 1.188 | 17.37× |
| sort-on (different order) | 533 | 1.875 | 27.43× |
| sort-by | 167 | 6.000 | 87.77× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 40960 | 0.024 | 1.00× |
| inline comparator chain, slice().sort() | 23273 | 0.043 | 1.76× |
| inline comparator chain, toSorted() | 23273 | 0.043 | 1.76× |
| underscore.sortBy (different order) | 18286 | 0.055 | 2.24× |
| just-sort-by (different order) | 12190 | 0.082 | 3.36× |
| fast-sort | 11130 | 0.090 | 3.68× |
| thenby (different order) | 10667 | 0.094 | 3.84× |
| Array.prototype.sort, decorated | 10667 | 0.094 | 3.84× |
| remeda.sortBy (different order) | 10240 | 0.098 | 4.00× |
| es-toolkit.orderBy | 9846 | 0.102 | 4.16× |
| lodash.orderBy | 8000 | 0.125 | 5.12× |
| ramda.sortWith (different order) | 7314 | 0.137 | 5.60× |
| sort-array | 6919 | 0.145 | 5.92× |
| natural-orderby | 2560 | 0.391 | 16.00× |
| sort-on | 762 | 1.313 | 53.76× |
| sort-by (different order) | 182 | 5.500 | 225.28× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 35310 | 0.028 | 1.00× |
| inline comparator chain, toSorted() | 18286 | 0.055 | 1.93× |
| inline comparator chain, slice().sort() | 17655 | 0.057 | 2.00× |
| underscore.sortBy | 9481 | 0.105 | 3.72× |
| just-sort-by | 9143 | 0.109 | 3.86× |
| thenby | 8000 | 0.125 | 4.41× |
| remeda.sortBy | 7758 | 0.129 | 4.55× |
| fast-sort | 7758 | 0.129 | 4.55× |
| Array.prototype.sort, decorated | 7758 | 0.129 | 4.55× |
| es-toolkit.orderBy | 7314 | 0.137 | 4.83× |
| ramda.sortWith | 6095 | 0.164 | 5.79× |
| sort-array | 5120 | 0.195 | 6.90× |
| lodash.orderBy | 4571 | 0.219 | 7.72× |
| natural-orderby | 2207 | 0.453 | 16.00× |
| sort-on | 593 | 1.688 | 59.59× |
| sort-by | 167 | 6.000 | 211.86× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14629 | 0.068 | 1.00× |
| inline comparator chain, slice().sort() | 10240 | 0.098 | 1.43× |
| inline comparator chain, toSorted() | 10240 | 0.098 | 1.43× |
| underscore.sortBy | 6400 | 0.156 | 2.29× |
| fast-sort | 6095 | 0.164 | 2.40× |
| thenby | 6095 | 0.164 | 2.40× |
| Array.prototype.sort, decorated | 6095 | 0.164 | 2.40× |
| es-toolkit.orderBy | 5818 | 0.172 | 2.51× |
| remeda.sortBy | 5818 | 0.172 | 2.51× |
| ramda.sortWith | 4923 | 0.203 | 2.97× |
| lodash.orderBy | 4571 | 0.219 | 3.20× |
| sort-array | 4129 | 0.242 | 3.54× |
| just-sort-by | 3657 | 0.273 | 4.00× |
| natural-orderby | 667 | 1.500 | 21.94× |
| sort-on | 533 | 1.875 | 27.43× |
| sort-by | 160 | 6.250 | 91.43× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 292571 | 0.003 | 1.00× |
| inline comparator chain, toSorted() | 215579 | 0.005 | 1.36× |
| inline comparator chain, slice().sort() | 204800 | 0.005 | 1.43× |
| just-sort-by | 124121 | 0.008 | 2.36× |
| thenby | 110703 | 0.009 | 2.64× |
| fast-sort | 107789 | 0.009 | 2.71× |
| es-toolkit.orderBy | 89043 | 0.011 | 3.29× |
| remeda.sortBy | 78769 | 0.013 | 3.71× |
| Array.prototype.sort, decorated | 78769 | 0.013 | 3.71× |
| ramda.sortWith | 75852 | 0.013 | 3.86× |
| underscore.sortBy | 75852 | 0.013 | 3.86× |
| sort-array | 62061 | 0.016 | 4.71× |
| lodash.orderBy | 35310 | 0.028 | 8.29× |
| sort-on | 5333 | 0.188 | 54.86× |
| natural-orderby | 4000 | 0.250 | 73.14× |
| sort-by | 1455 | 0.688 | 201.14× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 256000 | 0.004 | 1.00× |
| inline comparator chain, toSorted() | 210051 | 0.005 | 1.22× |
| inline comparator chain, slice().sort() | 199805 | 0.005 | 1.28× |
| just-sort-by | 124121 | 0.008 | 2.06× |
| thenby | 110703 | 0.009 | 2.31× |
| fast-sort | 102400 | 0.010 | 2.50× |
| es-toolkit.orderBy | 89043 | 0.011 | 2.88× |
| remeda.sortBy | 75852 | 0.013 | 3.38× |
| ramda.sortWith | 75852 | 0.013 | 3.38× |
| Array.prototype.sort, decorated | 75852 | 0.013 | 3.38× |
| underscore.sortBy | 73143 | 0.014 | 3.50× |
| sort-array | 64000 | 0.016 | 4.00× |
| lodash.orderBy | 35310 | 0.028 | 7.25× |
| sort-on | 4741 | 0.211 | 54.00× |
| natural-orderby | 4000 | 0.250 | 64.00× |
| sort-by | 1455 | 0.688 | 176.00× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 117029 | 0.009 | 0.88× |
| just-sort-by | 117029 | 0.009 | 0.88× |
| fast-multisort | 102400 | 0.010 | 1.00× |
| inline comparator chain, toSorted() | 102400 | 0.010 | 1.00× |
| thenby | 102400 | 0.010 | 1.00× |
| fast-sort | 97524 | 0.010 | 1.05× |
| es-toolkit.orderBy | 85333 | 0.012 | 1.20× |
| remeda.sortBy | 75852 | 0.013 | 1.35× |
| underscore.sortBy | 73143 | 0.014 | 1.40× |
| ramda.sortWith | 70621 | 0.014 | 1.45× |
| Array.prototype.sort, decorated | 66065 | 0.015 | 1.55× |
| sort-array | 48762 | 0.021 | 2.10× |
| lodash.orderBy | 34133 | 0.029 | 3.00× |
| sort-on | 5565 | 0.180 | 18.40× |
| natural-orderby | 3879 | 0.258 | 26.40× |
| sort-by | 1455 | 0.688 | 70.40× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13474 | 0.074 | 1.00× |
| inline comparator chain, slice().sort() | 10667 | 0.094 | 1.26× |
| inline comparator chain, toSorted() | 10667 | 0.094 | 1.26× |
| es-toolkit.orderBy | 5818 | 0.172 | 2.32× |
| lodash.orderBy | 5333 | 0.188 | 2.53× |
| remeda.sortBy (different order) | 5333 | 0.188 | 2.53× |
| thenby (different order) | 4571 | 0.219 | 2.95× |
| fast-sort (different order) | 4267 | 0.234 | 3.16× |
| ramda.sortWith (different order) | 3879 | 0.258 | 3.47× |
| Array.prototype.sort, decorated | 3657 | 0.273 | 3.68× |
| sort-array (different order) | 2065 | 0.484 | 6.53× |
| natural-orderby (different order) | 500 | 2.000 | 26.95× |
| sort-on (different order) | 400 | 2.500 | 33.68× |
| sort-by (different order) | 95 | 10.500 | 141.47× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5333 | 0.188 | 1.00× |
| inline comparator chain, slice().sort() | 1280 | 0.781 | 4.17× |
| inline comparator chain, toSorted() | 1280 | 0.781 | 4.17× |
| thenby | 970 | 1.031 | 5.50× |
| underscore.sortBy | 970 | 1.031 | 5.50× |
| fast-sort | 800 | 1.250 | 6.67× |
| es-toolkit.orderBy | 727 | 1.375 | 7.33× |
| remeda.sortBy | 696 | 1.438 | 7.67× |
| lodash.orderBy | 667 | 1.500 | 8.00× |
| ramda.sortWith | 640 | 1.563 | 8.33× |
| Array.prototype.sort, decorated | 593 | 1.688 | 9.00× |
| sort-array | 421 | 2.375 | 12.67× |
| just-sort-by (different order) | 296 | 3.375 | 18.00× |
| natural-orderby (different order) | 222 | 4.500 | 24.00× |
| sort-on (different order) | 87 | 11.500 | 61.33× |
| sort-by | 21 | 47.000 | 250.67× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1280 | 0.781 | 1.00× |
| inline comparator chain, slice().sort() | 593 | 1.688 | 2.16× |
| inline comparator chain, toSorted() | 593 | 1.688 | 2.16× |
| underscore.sortBy | 444 | 2.250 | 2.88× |
| remeda.sortBy | 421 | 2.375 | 3.04× |
| fast-sort | 421 | 2.375 | 3.04× |
| thenby | 421 | 2.375 | 3.04× |
| es-toolkit.orderBy | 400 | 2.500 | 3.20× |
| ramda.sortWith | 348 | 2.875 | 3.68× |
| lodash.orderBy | 320 | 3.125 | 4.00× |
| Array.prototype.sort, decorated | 296 | 3.375 | 4.32× |
| sort-array | 211 | 4.750 | 6.08× |
| just-sort-by (different order) | 143 | 7.000 | 8.96× |
| natural-orderby (different order) | 61 | 16.500 | 21.12× |
| sort-on (different order) | 42 | 24.000 | 30.72× |
| sort-by | 12 | 84.000 | 107.52× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4414 | 0.227 | 1.00× |
| inline comparator chain, slice().sort() | 1231 | 0.813 | 3.59× |
| inline comparator chain, toSorted() | 1231 | 0.813 | 3.59× |
| underscore.sortBy (different order) | 1032 | 0.969 | 4.28× |
| just-sort-by (different order) | 800 | 1.250 | 5.52× |
| fast-sort | 762 | 1.313 | 5.79× |
| remeda.sortBy (different order) | 727 | 1.375 | 6.07× |
| thenby (different order) | 727 | 1.375 | 6.07× |
| es-toolkit.orderBy | 696 | 1.438 | 6.34× |
| lodash.orderBy | 552 | 1.813 | 8.00× |
| ramda.sortWith (different order) | 552 | 1.813 | 8.00× |
| Array.prototype.sort, decorated | 444 | 2.250 | 9.93× |
| sort-array | 308 | 3.250 | 14.34× |
| natural-orderby | 222 | 4.500 | 19.86× |
| sort-on | 57 | 17.500 | 77.24× |
| sort-by (different order) | 13 | 75.000 | 331.03× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3765 | 0.266 | 1.00× |
| inline comparator chain, slice().sort() | 889 | 1.125 | 4.24× |
| inline comparator chain, toSorted() | 889 | 1.125 | 4.24× |
| underscore.sortBy | 640 | 1.563 | 5.88× |
| just-sort-by | 593 | 1.688 | 6.35× |
| fast-sort | 571 | 1.750 | 6.59× |
| remeda.sortBy | 552 | 1.813 | 6.82× |
| thenby | 552 | 1.813 | 6.82× |
| es-toolkit.orderBy | 516 | 1.938 | 7.29× |
| ramda.sortWith | 444 | 2.250 | 8.47× |
| Array.prototype.sort, decorated | 364 | 2.750 | 10.35× |
| lodash.orderBy | 333 | 3.000 | 11.29× |
| sort-array | 250 | 4.000 | 15.06× |
| natural-orderby | 182 | 5.500 | 20.71× |
| sort-on | 43 | 23.000 | 86.59× |
| sort-by | 12 | 82.000 | 308.71× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1185 | 0.844 | 1.00× |
| inline comparator chain, slice().sort() | 552 | 1.813 | 2.15× |
| inline comparator chain, toSorted() | 552 | 1.813 | 2.15× |
| underscore.sortBy | 432 | 2.313 | 2.74× |
| remeda.sortBy | 400 | 2.500 | 2.96× |
| fast-sort | 400 | 2.500 | 2.96× |
| thenby | 400 | 2.500 | 2.96× |
| es-toolkit.orderBy | 381 | 2.625 | 3.11× |
| ramda.sortWith | 333 | 3.000 | 3.56× |
| lodash.orderBy | 296 | 3.375 | 4.00× |
| Array.prototype.sort, decorated | 296 | 3.375 | 4.00× |
| just-sort-by | 258 | 3.875 | 4.59× |
| sort-array | 211 | 4.750 | 5.63× |
| natural-orderby | 59 | 17.000 | 20.15× |
| sort-on | 40 | 25.000 | 29.63× |
| sort-by | 12 | 86.000 | 101.93× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 22261 | 0.045 | 0.43× |
| inline comparator chain, slice().sort() | 21333 | 0.047 | 0.44× |
| just-sort-by | 12190 | 0.082 | 0.78× |
| thenby | 11130 | 0.090 | 0.85× |
| fast-sort | 10667 | 0.094 | 0.89× |
| fast-multisort | 9481 | 0.105 | 1.00× |
| es-toolkit.orderBy | 9481 | 0.105 | 1.00× |
| remeda.sortBy | 9143 | 0.109 | 1.04× |
| underscore.sortBy | 8000 | 0.125 | 1.19× |
| ramda.sortWith | 7758 | 0.129 | 1.22× |
| Array.prototype.sort, decorated | 4923 | 0.203 | 1.93× |
| lodash.orderBy | 3556 | 0.281 | 2.67× |
| sort-array | 3368 | 0.297 | 2.81× |
| sort-on | 552 | 1.813 | 17.19× |
| natural-orderby | 381 | 2.625 | 24.89× |
| sort-by | 148 | 6.750 | 64.00× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 25600 | 0.039 | 1.00× |
| inline comparator chain, toSorted() | 22261 | 0.045 | 1.15× |
| inline comparator chain, slice().sort() | 21333 | 0.047 | 1.20× |
| just-sort-by | 12190 | 0.082 | 2.10× |
| thenby | 11130 | 0.090 | 2.30× |
| fast-sort | 10240 | 0.098 | 2.50× |
| es-toolkit.orderBy | 9143 | 0.109 | 2.80× |
| remeda.sortBy | 8828 | 0.113 | 2.90× |
| ramda.sortWith | 7758 | 0.129 | 3.30× |
| underscore.sortBy | 7758 | 0.129 | 3.30× |
| Array.prototype.sort, decorated | 4923 | 0.203 | 5.20× |
| sort-array | 3657 | 0.273 | 7.00× |
| lodash.orderBy | 3459 | 0.289 | 7.40× |
| sort-on | 485 | 2.063 | 52.80× |
| natural-orderby | 348 | 2.875 | 73.60× |
| sort-by | 143 | 7.000 | 179.20× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12190 | 0.082 | 1.00× |
| inline comparator chain, slice().sort() | 12190 | 0.082 | 1.00× |
| inline comparator chain, toSorted() | 12190 | 0.082 | 1.00× |
| just-sort-by | 9481 | 0.105 | 1.29× |
| fast-sort | 8000 | 0.125 | 1.52× |
| thenby | 8000 | 0.125 | 1.52× |
| remeda.sortBy | 7758 | 0.129 | 1.57× |
| es-toolkit.orderBy | 7111 | 0.141 | 1.71× |
| underscore.sortBy | 6400 | 0.156 | 1.90× |
| ramda.sortWith | 6095 | 0.164 | 2.00× |
| Array.prototype.sort, decorated | 4267 | 0.234 | 2.86× |
| sort-array | 3048 | 0.328 | 4.00× |
| lodash.orderBy | 2909 | 0.344 | 4.19× |
| sort-on | 571 | 1.750 | 21.33× |
| natural-orderby | 381 | 2.625 | 32.00× |
| sort-by | 148 | 6.750 | 82.29× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1939 | 0.516 | 1.00× |
| inline comparator chain, slice().sort() | 615 | 1.625 | 3.15× |
| inline comparator chain, toSorted() | 615 | 1.625 | 3.15× |
| lodash.orderBy | 400 | 2.500 | 4.85× |
| es-toolkit.orderBy | 400 | 2.500 | 4.85× |
| remeda.sortBy (different order) | 381 | 2.625 | 5.09× |
| thenby (different order) | 333 | 3.000 | 5.82× |
| fast-sort (different order) | 308 | 3.250 | 6.30× |
| ramda.sortWith (different order) | 286 | 3.500 | 6.79× |
| Array.prototype.sort, decorated | 267 | 3.750 | 7.27× |
| sort-array (different order) | 154 | 6.500 | 12.61× |
| natural-orderby (different order) | 45 | 22.000 | 42.67× |
| sort-on (different order) | 29 | 34.000 | 65.94× |
| sort-by (different order) | 7 | 148.000 | 287.03× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 552 | 1.813 | 1.00× |
| inline comparator chain, slice().sort() | 118 | 8.500 | 4.69× |
| inline comparator chain, toSorted() | 111 | 9.000 | 4.97× |
| thenby | 91 | 11.000 | 6.07× |
| underscore.sortBy | 91 | 11.000 | 6.07× |
| fast-sort | 77 | 13.000 | 7.17× |
| es-toolkit.orderBy | 71 | 14.000 | 7.72× |
| remeda.sortBy | 71 | 14.000 | 7.72× |
| lodash.orderBy | 65 | 15.500 | 8.55× |
| ramda.sortWith | 61 | 16.500 | 9.10× |
| Array.prototype.sort, decorated | 59 | 17.000 | 9.38× |
| sort-array | 40 | 25.000 | 13.79× |
| just-sort-by (different order) | 29 | 34.000 | 18.76× |
| natural-orderby (different order) | 21 | 47.000 | 25.93× |
| sort-on (different order) | 8 | 122.000 | 67.31× |
| sort-by | 2 | 470.000 | 259.31× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 77 | 13.000 | 1.00× |
| inline comparator chain, slice().sort() | 38 | 26.000 | 2.00× |
| inline comparator chain, toSorted() | 38 | 26.000 | 2.00× |
| thenby | 29 | 35.000 | 2.69× |
| underscore.sortBy | 29 | 35.000 | 2.69× |
| fast-sort | 27 | 37.000 | 2.85× |
| remeda.sortBy | 26 | 38.000 | 2.92× |
| es-toolkit.orderBy | 25 | 40.000 | 3.08× |
| ramda.sortWith | 22 | 46.000 | 3.54× |
| lodash.orderBy | 18 | 56.000 | 4.31× |
| Array.prototype.sort, decorated | 18 | 56.000 | 4.31× |
| sort-array | 15 | 68.000 | 5.23× |
| just-sort-by (different order) | 9 | 110.000 | 8.46× |
| natural-orderby (different order) | 3 | 296.000 | 22.77× |
| sort-on (different order) | 3 | 345.000 | 26.54× |
| sort-by | 1 | 1083.000 | 83.31× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 471 | 2.125 | 1.00× |
| inline comparator chain, slice().sort() | 87 | 11.500 | 5.41× |
| inline comparator chain, toSorted() | 87 | 11.500 | 5.41× |
| underscore.sortBy (different order) | 71 | 14.000 | 6.59× |
| just-sort-by (different order) | 61 | 16.500 | 7.76× |
| fast-sort | 59 | 17.000 | 8.00× |
| remeda.sortBy (different order) | 56 | 18.000 | 8.47× |
| thenby (different order) | 54 | 18.500 | 8.71× |
| es-toolkit.orderBy | 53 | 19.000 | 8.94× |
| ramda.sortWith (different order) | 42 | 24.000 | 11.29× |
| lodash.orderBy | 34 | 29.000 | 13.65× |
| Array.prototype.sort, decorated | 30 | 33.000 | 15.53× |
| sort-array | 24 | 41.000 | 19.29× |
| natural-orderby | 15 | 67.000 | 31.53× |
| sort-on | 4 | 240.000 | 112.94× |
| sort-by (different order) | 1 | 942.000 | 443.29× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 381 | 2.625 | 1.00× |
| inline comparator chain, slice().sort() | 65 | 15.500 | 5.90× |
| inline comparator chain, toSorted() | 63 | 16.000 | 6.10× |
| underscore.sortBy | 48 | 21.000 | 8.00× |
| just-sort-by | 45 | 22.000 | 8.38× |
| fast-sort | 43 | 23.000 | 8.76× |
| remeda.sortBy | 42 | 24.000 | 9.14× |
| thenby | 40 | 25.000 | 9.52× |
| es-toolkit.orderBy | 38 | 26.000 | 9.90× |
| ramda.sortWith | 33 | 30.000 | 11.43× |
| Array.prototype.sort, decorated | 26 | 39.000 | 14.86× |
| lodash.orderBy | 22 | 46.000 | 17.52× |
| sort-array | 19 | 54.000 | 20.57× |
| natural-orderby | 12 | 86.000 | 32.76× |
| sort-on | 3 | 316.000 | 120.38× |
| sort-by | 1 | 1041.000 | 396.57× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 69 | 14.500 | 1.00× |
| inline comparator chain, slice().sort() | 37 | 27.000 | 1.86× |
| inline comparator chain, toSorted() | 34 | 29.000 | 2.00× |
| underscore.sortBy | 27 | 37.000 | 2.55× |
| fast-sort | 26 | 39.000 | 2.69× |
| thenby | 26 | 39.000 | 2.69× |
| remeda.sortBy | 25 | 40.000 | 2.76× |
| es-toolkit.orderBy | 23 | 43.000 | 2.97× |
| ramda.sortWith | 22 | 46.000 | 3.17× |
| lodash.orderBy | 18 | 56.000 | 3.86× |
| Array.prototype.sort, decorated | 17 | 58.000 | 4.00× |
| just-sort-by | 16 | 62.000 | 4.28× |
| sort-array | 13 | 75.000 | 5.17× |
| natural-orderby (different order) | 3 | 302.000 | 20.83× |
| sort-on | 3 | 366.000 | 25.24× |
| sort-by | 1 | 1088.000 | 75.03× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3048 | 0.328 | 1.00× |
| inline comparator chain, slice().sort() | 1455 | 0.688 | 2.10× |
| inline comparator chain, toSorted() | 1143 | 0.875 | 2.67× |
| just-sort-by | 970 | 1.031 | 3.14× |
| fast-sort | 889 | 1.125 | 3.43× |
| thenby | 889 | 1.125 | 3.43× |
| es-toolkit.orderBy | 800 | 1.250 | 3.81× |
| remeda.sortBy | 800 | 1.250 | 3.81× |
| ramda.sortWith | 667 | 1.500 | 4.57× |
| underscore.sortBy | 615 | 1.625 | 4.95× |
| Array.prototype.sort, decorated | 444 | 2.250 | 6.86× |
| sort-array | 320 | 3.125 | 9.52× |
| lodash.orderBy | 308 | 3.250 | 9.90× |
| sort-on | 54 | 18.500 | 56.38× |
| natural-orderby | 37 | 27.000 | 82.29× |
| sort-by | 15 | 68.000 | 207.24× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2560 | 0.391 | 1.00× |
| inline comparator chain, slice().sort() | 1391 | 0.719 | 1.84× |
| inline comparator chain, toSorted() | 1103 | 0.906 | 2.32× |
| just-sort-by | 970 | 1.031 | 2.64× |
| thenby | 889 | 1.125 | 2.88× |
| fast-sort | 842 | 1.188 | 3.04× |
| es-toolkit.orderBy | 762 | 1.313 | 3.36× |
| remeda.sortBy | 727 | 1.375 | 3.52× |
| ramda.sortWith | 667 | 1.500 | 3.84× |
| underscore.sortBy | 615 | 1.625 | 4.16× |
| Array.prototype.sort, decorated | 457 | 2.188 | 5.60× |
| sort-array | 333 | 3.000 | 7.68× |
| lodash.orderBy | 296 | 3.375 | 8.64× |
| sort-on | 43 | 23.000 | 58.88× |
| natural-orderby | 36 | 28.000 | 71.68× |
| sort-by | 14 | 70.000 | 179.20× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1524 | 0.656 | 1.00× |
| inline comparator chain, slice().sort() | 1000 | 1.000 | 1.52× |
| just-sort-by | 821 | 1.219 | 1.86× |
| fast-sort | 800 | 1.250 | 1.90× |
| thenby | 800 | 1.250 | 1.90× |
| inline comparator chain, toSorted() | 762 | 1.313 | 2.00× |
| remeda.sortBy | 727 | 1.375 | 2.10× |
| es-toolkit.orderBy | 696 | 1.438 | 2.19× |
| ramda.sortWith | 615 | 1.625 | 2.48× |
| underscore.sortBy | 593 | 1.688 | 2.57× |
| Array.prototype.sort, decorated | 421 | 2.375 | 3.62× |
| sort-array | 320 | 3.125 | 4.76× |
| lodash.orderBy | 286 | 3.500 | 5.33× |
| sort-on | 56 | 18.000 | 27.43× |
| natural-orderby | 36 | 28.000 | 42.67× |
| sort-by | 15 | 66.000 | 100.57× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 174 | 5.750 | 1.00× |
| inline comparator chain, toSorted() | 45 | 22.000 | 3.83× |
| inline comparator chain, slice().sort() | 43 | 23.000 | 4.00× |
| es-toolkit.orderBy | 30 | 33.000 | 5.74× |
| remeda.sortBy (different order) | 28 | 36.000 | 6.26× |
| thenby (different order) | 25 | 40.000 | 6.96× |
| lodash.orderBy | 24 | 42.000 | 7.30× |
| fast-sort (different order) | 23 | 43.000 | 7.48× |
| ramda.sortWith (different order) | 21 | 47.000 | 8.17× |
| Array.prototype.sort, decorated | 18 | 57.000 | 9.91× |
| sort-array (different order) | 12 | 83.000 | 14.43× |
| natural-orderby (different order) | 4 | 270.000 | 46.96× |
| sort-on (different order) | 2 | 510.000 | 88.70× |
| sort-by (different order) | 1 | 1926.000 | 334.96× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42 | 24.000 | 1.00× |
| inline comparator chain, slice().sort() | 12 | 86.000 | 3.58× |
| inline comparator chain, toSorted() | 11 | 90.000 | 3.75× |
| thenby | 9 | 110.000 | 4.58× |
| underscore.sortBy | 8 | 120.000 | 5.00× |
| fast-sort | 8 | 129.000 | 5.38× |
| es-toolkit.orderBy | 7 | 141.000 | 5.88× |
| remeda.sortBy | 7 | 144.000 | 6.00× |
| ramda.sortWith | 6 | 157.000 | 6.54× |
| lodash.orderBy | 6 | 162.000 | 6.75× |
| Array.prototype.sort, decorated | 6 | 170.000 | 7.08× |
| sort-array | 4 | 241.000 | 10.04× |
| just-sort-by (different order) | 3 | 327.000 | 13.63× |
| natural-orderby (different order) | 2 | 505.000 | 21.04× |
| sort-on (different order) | 1 | 1303.000 | 54.29× |
| sort-by | 0 | 4602.000 | 191.75× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 323.000 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 549.000 | 1.70× |
| inline comparator chain, toSorted() | 2 | 561.000 | 1.74× |
| underscore.sortBy | 1 | 760.000 | 2.35× |
| remeda.sortBy | 1 | 799.000 | 2.47× |
| fast-sort | 1 | 819.000 | 2.54× |
| thenby | 1 | 861.000 | 2.67× |
| es-toolkit.orderBy | 1 | 896.000 | 2.77× |
| ramda.sortWith | 1 | 938.000 | 2.90× |
| Array.prototype.sort, decorated | 1 | 1255.000 | 3.89× |
| lodash.orderBy | 1 | 1419.000 | 4.39× |
| sort-array | 1 | 1440.000 | 4.46× |
| just-sort-by (different order) | 0 | 2033.000 | 6.29× |
| sort-on (different order) | 0 | 4910.000 | 15.20× |
| natural-orderby (different order) | 0 | 5311.000 | 16.44× |
| sort-by | 0 | 13743.000 | 42.55× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 33 | 30.000 | 1.00× |
| inline comparator chain, toSorted() | 6 | 177.000 | 5.90× |
| inline comparator chain, slice().sort() | 6 | 179.000 | 5.97× |
| underscore.sortBy (different order) | 5 | 192.000 | 6.40× |
| just-sort-by (different order) | 4 | 257.000 | 8.57× |
| fast-sort | 4 | 271.000 | 9.03× |
| remeda.sortBy (different order) | 4 | 277.000 | 9.23× |
| thenby (different order) | 3 | 288.000 | 9.60× |
| es-toolkit.orderBy | 3 | 292.000 | 9.73× |
| ramda.sortWith (different order) | 3 | 359.000 | 11.97× |
| lodash.orderBy | 2 | 468.000 | 15.60× |
| Array.prototype.sort, decorated | 2 | 556.000 | 18.53× |
| sort-array | 2 | 586.000 | 19.53× |
| natural-orderby | 1 | 1145.000 | 38.17× |
| sort-on | 0 | 3200.000 | 106.67× |
| sort-by (different order) | 0 | 11622.000 | 387.40× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 28 | 36.000 | 1.00× |
| inline comparator chain, slice().sort() | 4 | 231.000 | 6.42× |
| inline comparator chain, toSorted() | 4 | 231.000 | 6.42× |
| underscore.sortBy | 3 | 299.000 | 8.31× |
| just-sort-by | 3 | 339.000 | 9.42× |
| fast-sort | 3 | 345.000 | 9.58× |
| remeda.sortBy | 3 | 374.000 | 10.39× |
| es-toolkit.orderBy | 3 | 381.000 | 10.58× |
| thenby | 3 | 381.000 | 10.58× |
| ramda.sortWith | 2 | 455.000 | 12.64× |
| Array.prototype.sort, decorated | 1 | 728.000 | 20.22× |
| sort-array | 1 | 752.000 | 20.89× |
| lodash.orderBy | 1 | 753.000 | 20.92× |
| natural-orderby | 1 | 1335.000 | 37.08× |
| sort-on | 0 | 4117.000 | 114.36× |
| sort-by | 0 | 12956.000 | 359.89× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 376.000 | 1.00× |
| inline comparator chain, toSorted() | 2 | 578.000 | 1.54× |
| inline comparator chain, slice().sort() | 2 | 606.000 | 1.61× |
| underscore.sortBy | 1 | 755.000 | 2.01× |
| remeda.sortBy | 1 | 767.000 | 2.04× |
| fast-sort | 1 | 811.000 | 2.16× |
| thenby | 1 | 812.000 | 2.16× |
| es-toolkit.orderBy | 1 | 863.000 | 2.30× |
| ramda.sortWith | 1 | 930.000 | 2.47× |
| Array.prototype.sort, decorated | 1 | 1282.000 | 3.41× |
| just-sort-by | 1 | 1369.000 | 3.64× |
| lodash.orderBy | 1 | 1409.000 | 3.75× |
| sort-array | 1 | 1430.000 | 3.80× |
| sort-on | 0 | 5232.000 | 13.91× |
| natural-orderby (different order) | 0 | 5793.000 | 15.41× |
| sort-by | 0 | 14120.000 | 37.55× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 235 | 4.250 | 1.00× |
| inline comparator chain, slice().sort() | 105 | 9.500 | 2.24× |
| inline comparator chain, toSorted() | 100 | 10.000 | 2.35× |
| just-sort-by | 91 | 11.000 | 2.59× |
| fast-sort | 83 | 12.000 | 2.82× |
| es-toolkit.orderBy | 71 | 14.000 | 3.29× |
| remeda.sortBy | 71 | 14.000 | 3.29× |
| thenby | 71 | 14.000 | 3.29× |
| ramda.sortWith | 63 | 16.000 | 3.76× |
| underscore.sortBy | 56 | 18.000 | 4.24× |
| Array.prototype.sort, decorated | 42 | 24.000 | 5.65× |
| sort-array | 30 | 33.000 | 7.76× |
| lodash.orderBy | 25 | 40.000 | 9.41× |
| sort-on | 5 | 197.000 | 46.35× |
| natural-orderby | 3 | 296.000 | 69.65× |
| sort-by | 1 | 679.000 | 159.76× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 200 | 5.000 | 1.00× |
| inline comparator chain, slice().sort() | 133 | 7.500 | 1.50× |
| inline comparator chain, toSorted() | 103 | 9.750 | 1.95× |
| just-sort-by | 91 | 11.000 | 2.20× |
| thenby | 83 | 12.000 | 2.40× |
| fast-sort | 80 | 12.500 | 2.50× |
| es-toolkit.orderBy | 71 | 14.000 | 2.80× |
| remeda.sortBy | 63 | 16.000 | 3.20× |
| ramda.sortWith | 63 | 16.000 | 3.20× |
| underscore.sortBy | 48 | 21.000 | 4.20× |
| Array.prototype.sort, decorated | 42 | 24.000 | 4.80× |
| sort-array | 32 | 31.000 | 6.20× |
| lodash.orderBy | 26 | 39.000 | 7.80× |
| sort-on | 4 | 249.000 | 49.80× |
| natural-orderby | 3 | 286.000 | 57.20× |
| sort-by | 1 | 760.000 | 152.00× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 138 | 7.250 | 1.00× |
| just-sort-by | 87 | 11.500 | 1.59× |
| fast-sort | 77 | 13.000 | 1.79× |
| es-toolkit.orderBy | 69 | 14.500 | 2.00× |
| thenby | 69 | 14.500 | 2.00× |
| inline comparator chain, slice().sort() | 67 | 15.000 | 2.07× |
| remeda.sortBy | 67 | 15.000 | 2.07× |
| ramda.sortWith | 61 | 16.500 | 2.28× |
| inline comparator chain, toSorted() | 59 | 17.000 | 2.34× |
| underscore.sortBy | 54 | 18.500 | 2.55× |
| Array.prototype.sort, decorated | 42 | 24.000 | 3.31× |
| sort-array | 30 | 33.000 | 4.55× |
| lodash.orderBy | 22 | 46.000 | 6.34× |
| sort-on | 5 | 206.000 | 28.41× |
| natural-orderby | 3 | 297.000 | 40.97× |
| sort-by | 1 | 671.000 | 92.55× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14 | 72.000 | 1.00× |
| inline comparator chain, toSorted() | 3 | 385.000 | 5.35× |
| inline comparator chain, slice().sort() | 3 | 387.000 | 5.38× |
| es-toolkit.orderBy | 2 | 575.000 | 7.99× |
| remeda.sortBy (different order) | 2 | 618.000 | 8.58× |
| thenby (different order) | 1 | 725.000 | 10.07× |
| fast-sort (different order) | 1 | 770.000 | 10.69× |
| lodash.orderBy | 1 | 773.000 | 10.74× |
| ramda.sortWith (different order) | 1 | 835.000 | 11.60× |
| Array.prototype.sort, decorated | 1 | 1095.000 | 15.21× |
| sort-array (different order) | 1 | 1316.000 | 18.28× |
| natural-orderby (different order) | 0 | 3684.000 | 51.17× |
| sort-on (different order) | 0 | 6980.000 | 96.94× |
| sort-by (different order) | 0 | 25027.000 | 347.60× |

</details>

#### Firefox 158.0

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, toSorted() | 0.44× | 1.15× | 5.27× | 54 | 0 |
| inline comparator chain, slice().sort() | 0.42× | 1.57× | 5.09× | 54 | 0 |
| es-toolkit.orderBy | 0.95× | 2.47× | 16.00× | 54 | 0 |
| just-sort-by | 0.60× | 2.81× | 19.64× | 48 | 14 |
| thenby | 1.00× | 3.26× | 13.79× | 54 | 10 |
| fast-sort | 1.32× | 3.38× | 13.24× | 54 | 9 |
| Array.prototype.sort, decorated | 0.95× | 3.54× | 13.79× | 54 | 0 |
| underscore.sortBy | 1.23× | 3.54× | 10.21× | 48 | 5 |
| remeda.sortBy | 1.09× | 4.00× | 16.46× | 54 | 10 |
| sort-array | 1.23× | 4.95× | 22.07× | 54 | 5 |
| ramda.sortWith | 1.32× | 5.71× | 23.17× | 54 | 10 |
| lodash.orderBy | 2.27× | 6.40× | 24.28× | 54 | 0 |
| sort-on | 2.22× | 20.57× | 214.07× | 54 | 14 |
| natural-orderby | 9.45× | 29.63× | 256.00× | 54 | 15 |
| sort-by | 3.89× | 216.28× | 2189.24× | 54 | 10 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.61× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.94× |
| fast-multisort | 116508444 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.83× |
| sort-on | 52428800 | 0.000 | 2.22× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.33× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.56× |
| thenby | 30840471 | 0.000 | 3.78× |
| sort-by | 29959314 | 0.000 | 3.89× |
| fast-sort | 20971520 | 0.000 | 5.56× |
| ramda.sortWith | 18724571 | 0.000 | 6.22× |
| sort-array | 18078897 | 0.000 | 6.44× |
| remeda.sortBy | 17476267 | 0.000 | 6.67× |
| underscore.sortBy | 14169946 | 0.000 | 8.22× |
| lodash.orderBy | 9709037 | 0.000 | 12.00× |
| natural-orderby | 3855059 | 0.000 | 30.22× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 199728762 | 0.000 | 0.60× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.94× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.89× |
| es-toolkit.orderBy | 52428800 | 0.000 | 2.29× |
| sort-on | 52428800 | 0.000 | 2.29× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.54× |
| thenby | 30840471 | 0.000 | 3.89× |
| sort-by | 29959314 | 0.000 | 4.00× |
| fast-sort | 21845333 | 0.000 | 5.49× |
| ramda.sortWith | 19418074 | 0.000 | 6.17× |
| remeda.sortBy | 17476267 | 0.000 | 6.86× |
| sort-array | 16384000 | 0.000 | 7.31× |
| underscore.sortBy | 14563556 | 0.000 | 8.23× |
| lodash.orderBy | 9709037 | 0.000 | 12.34× |
| natural-orderby | 1638400 | 0.001 | 73.14× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.94× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.89× |
| es-toolkit.orderBy | 52428800 | 0.000 | 2.29× |
| sort-on | 52428800 | 0.000 | 2.29× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.54× |
| thenby | 30840471 | 0.000 | 3.89× |
| sort-by | 30840471 | 0.000 | 3.89× |
| fast-sort | 21845333 | 0.000 | 5.49× |
| ramda.sortWith | 18724571 | 0.000 | 6.40× |
| remeda.sortBy | 17476267 | 0.000 | 6.86× |
| sort-array | 16384000 | 0.000 | 7.31× |
| underscore.sortBy | 13797053 | 0.000 | 8.69× |
| lodash.orderBy | 9362286 | 0.000 | 12.80× |
| natural-orderby | 2621440 | 0.000 | 45.71× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.65× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.97× |
| fast-multisort | 123361882 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.94× |
| sort-on | 52428800 | 0.000 | 2.35× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.47× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.76× |
| thenby | 30840471 | 0.000 | 4.00× |
| sort-by | 29959314 | 0.000 | 4.12× |
| fast-sort | 21845333 | 0.000 | 5.65× |
| ramda.sortWith | 19418074 | 0.000 | 6.35× |
| remeda.sortBy | 17476267 | 0.000 | 7.06× |
| sort-array | 15887515 | 0.000 | 7.76× |
| underscore.sortBy | 14169946 | 0.000 | 8.71× |
| lodash.orderBy | 9362286 | 0.000 | 13.18× |
| natural-orderby | 2340571 | 0.000 | 52.71× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 199728762 | 0.000 | 0.60× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.94× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.89× |
| sort-on | 52428800 | 0.000 | 2.29× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.40× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.66× |
| thenby | 30840471 | 0.000 | 3.89× |
| sort-by | 29959314 | 0.000 | 4.00× |
| fast-sort | 21845333 | 0.000 | 5.49× |
| ramda.sortWith | 19418074 | 0.000 | 6.17× |
| remeda.sortBy | 17476267 | 0.000 | 6.86× |
| sort-array | 16384000 | 0.000 | 7.31× |
| underscore.sortBy | 14169946 | 0.000 | 8.46× |
| lodash.orderBy | 9709037 | 0.000 | 12.34× |
| natural-orderby | 630154 | 0.002 | 190.17× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.94× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 53773128 | 0.000 | 2.23× |
| sort-on | 52428800 | 0.000 | 2.29× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.40× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.66× |
| sort-by | 29127111 | 0.000 | 4.11× |
| thenby | 27594105 | 0.000 | 4.34× |
| fast-sort | 20164923 | 0.000 | 5.94× |
| ramda.sortWith | 18078897 | 0.000 | 6.63× |
| sort-array | 16912516 | 0.000 | 7.09× |
| remeda.sortBy | 15887515 | 0.000 | 7.54× |
| underscore.sortBy | 13797053 | 0.000 | 8.69× |
| lodash.orderBy | 8738133 | 0.000 | 13.71× |
| natural-orderby | 2849391 | 0.000 | 42.06× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.94× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.89× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.40× |
| sort-on | 45590261 | 0.000 | 2.63× |
| thenby | 30840471 | 0.000 | 3.89× |
| sort-by | 29959314 | 0.000 | 4.00× |
| Array.prototype.sort, decorated | 25575024 | 0.000 | 4.69× |
| fast-sort | 21845333 | 0.000 | 5.49× |
| remeda.sortBy | 17476267 | 0.000 | 6.86× |
| ramda.sortWith | 16912516 | 0.000 | 7.09× |
| sort-array | 16384000 | 0.000 | 7.31× |
| underscore.sortBy | 13797053 | 0.000 | 8.69× |
| lodash.orderBy | 9362286 | 0.000 | 12.80× |
| natural-orderby | 2849391 | 0.000 | 42.06× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.65× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.97× |
| fast-multisort | 123361882 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.94× |
| es-toolkit.orderBy | 52428800 | 0.000 | 2.35× |
| sort-on | 45590261 | 0.000 | 2.71× |
| thenby | 30840471 | 0.000 | 4.00× |
| sort-by | 29959314 | 0.000 | 4.12× |
| Array.prototype.sort, decorated | 24966095 | 0.000 | 4.94× |
| fast-sort | 21845333 | 0.000 | 5.65× |
| remeda.sortBy | 17476267 | 0.000 | 7.06× |
| ramda.sortWith | 16912516 | 0.000 | 7.29× |
| sort-array | 16384000 | 0.000 | 7.53× |
| underscore.sortBy | 14169946 | 0.000 | 8.71× |
| lodash.orderBy | 9362286 | 0.000 | 13.18× |
| natural-orderby | 2730667 | 0.000 | 45.18× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.94× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.89× |
| es-toolkit.orderBy | 52428800 | 0.000 | 2.29× |
| sort-on | 52428800 | 0.000 | 2.29× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.54× |
| sort-by | 26886564 | 0.000 | 4.46× |
| sort-array | 18724571 | 0.000 | 6.40× |
| fast-sort | 16912516 | 0.000 | 7.09× |
| thenby | 12483048 | 0.000 | 9.60× |
| ramda.sortWith | 9362286 | 0.000 | 12.80× |
| remeda.sortBy | 7281778 | 0.000 | 16.46× |
| lodash.orderBy | 6393756 | 0.000 | 18.74× |
| natural-orderby | 468114 | 0.002 | 256.00× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4519724 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 3744914 | 0.000 | 1.21× |
| inline comparator chain, toSorted() | 3542486 | 0.000 | 1.28× |
| thenby | 3276800 | 0.000 | 1.38× |
| fast-sort | 2730667 | 0.000 | 1.66× |
| remeda.sortBy | 2427259 | 0.000 | 1.86× |
| Array.prototype.sort, decorated | 2427259 | 0.000 | 1.86× |
| es-toolkit.orderBy | 2340571 | 0.000 | 1.93× |
| underscore.sortBy | 2048000 | 0.000 | 2.21× |
| sort-array | 1872457 | 0.001 | 2.41× |
| ramda.sortWith | 1638400 | 0.001 | 2.76× |
| lodash.orderBy | 1310720 | 0.001 | 3.45× |
| just-sort-by (different order) | 1260308 | 0.001 | 3.59× |
| natural-orderby (different order) | 327680 | 0.003 | 13.79× |
| sort-on (different order) | 221405 | 0.005 | 20.41× |
| sort-by | 23273 | 0.043 | 194.21× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3640889 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 3640889 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 3542486 | 0.000 | 1.03× |
| thenby | 2621440 | 0.000 | 1.39× |
| fast-sort | 2520615 | 0.000 | 1.44× |
| remeda.sortBy | 2340571 | 0.000 | 1.56× |
| Array.prototype.sort, decorated | 2340571 | 0.000 | 1.56× |
| es-toolkit.orderBy | 2259862 | 0.000 | 1.61× |
| underscore.sortBy | 2048000 | 0.000 | 1.78× |
| sort-array | 1927529 | 0.001 | 1.89× |
| ramda.sortWith | 1638400 | 0.001 | 2.22× |
| lodash.orderBy | 1365333 | 0.001 | 2.67× |
| just-sort-by | 1092267 | 0.001 | 3.33× |
| sort-on | 227556 | 0.004 | 16.00× |
| natural-orderby | 132129 | 0.008 | 27.56× |
| sort-by | 26256 | 0.038 | 138.67× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5242880 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 5242880 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 5041231 | 0.000 | 1.04× |
| fast-sort | 3276800 | 0.000 | 1.60× |
| just-sort-by (different order) | 3276800 | 0.000 | 1.60× |
| es-toolkit.orderBy | 2978909 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 2849391 | 0.000 | 1.84× |
| thenby (different order) | 2730667 | 0.000 | 1.92× |
| remeda.sortBy (different order) | 2259862 | 0.000 | 2.32× |
| underscore.sortBy (different order) | 2048000 | 0.000 | 2.56× |
| sort-array | 1985939 | 0.001 | 2.64× |
| ramda.sortWith (different order) | 1489455 | 0.001 | 3.52× |
| lodash.orderBy | 1365333 | 0.001 | 3.84× |
| sort-on | 303407 | 0.003 | 17.28× |
| natural-orderby | 303407 | 0.003 | 17.28× |
| sort-by (different order) | 21333 | 0.047 | 245.76× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5698783 | 0.000 | 0.77× |
| inline comparator chain, toSorted() | 5461333 | 0.000 | 0.80× |
| fast-multisort | 4369067 | 0.000 | 1.00× |
| just-sort-by | 3971879 | 0.000 | 1.10× |
| thenby | 3276800 | 0.000 | 1.33× |
| fast-sort | 3120762 | 0.000 | 1.40× |
| Array.prototype.sort, decorated | 2978909 | 0.000 | 1.47× |
| es-toolkit.orderBy | 2849391 | 0.000 | 1.53× |
| remeda.sortBy | 2621440 | 0.000 | 1.67× |
| underscore.sortBy | 2340571 | 0.000 | 1.87× |
| sort-array | 2259862 | 0.000 | 1.93× |
| ramda.sortWith | 1872457 | 0.001 | 2.33× |
| lodash.orderBy | 1560381 | 0.001 | 2.80× |
| sort-on | 227556 | 0.004 | 19.20× |
| natural-orderby | 227556 | 0.004 | 19.20× |
| sort-by | 24381 | 0.041 | 179.20× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3120762 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 2978909 | 0.000 | 1.05× |
| inline comparator chain, toSorted() | 2849391 | 0.000 | 1.10× |
| thenby | 2184533 | 0.000 | 1.43× |
| fast-sort | 1985939 | 0.001 | 1.57× |
| es-toolkit.orderBy | 1820444 | 0.001 | 1.71× |
| remeda.sortBy | 1820444 | 0.001 | 1.71× |
| Array.prototype.sort, decorated | 1724632 | 0.001 | 1.81× |
| ramda.sortWith | 1424696 | 0.001 | 2.19× |
| underscore.sortBy | 1424696 | 0.001 | 2.19× |
| sort-array | 1310720 | 0.001 | 2.38× |
| just-sort-by | 1024000 | 0.001 | 3.05× |
| lodash.orderBy | 862316 | 0.001 | 3.62× |
| sort-on | 178087 | 0.006 | 17.52× |
| natural-orderby | 62061 | 0.016 | 50.29× |
| sort-by | 21333 | 0.047 | 146.29× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 10485760 | 0.000 | 0.96× |
| fast-multisort | 10082462 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 9039448 | 0.000 | 1.12× |
| just-sort-by | 6898526 | 0.000 | 1.46× |
| thenby | 6241524 | 0.000 | 1.62× |
| es-toolkit.orderBy | 5698783 | 0.000 | 1.77× |
| fast-sort | 5242880 | 0.000 | 1.92× |
| Array.prototype.sort, decorated | 4228129 | 0.000 | 2.38× |
| remeda.sortBy | 3855059 | 0.000 | 2.62× |
| sort-array | 3855059 | 0.000 | 2.62× |
| ramda.sortWith | 3640889 | 0.000 | 2.77× |
| underscore.sortBy | 2849391 | 0.000 | 3.54× |
| lodash.orderBy | 1927529 | 0.001 | 5.23× |
| sort-on | 564966 | 0.002 | 17.85× |
| natural-orderby | 356174 | 0.003 | 28.31× |
| sort-by | 64000 | 0.016 | 157.54× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9709037 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 6553600 | 0.000 | 1.48× |
| inline comparator chain, toSorted() | 6241524 | 0.000 | 1.56× |
| just-sort-by | 3449263 | 0.000 | 2.81× |
| thenby | 2978909 | 0.000 | 3.26× |
| fast-sort | 2730667 | 0.000 | 3.56× |
| remeda.sortBy | 2621440 | 0.000 | 3.70× |
| es-toolkit.orderBy | 2520615 | 0.000 | 3.85× |
| underscore.sortBy | 2427259 | 0.000 | 4.00× |
| Array.prototype.sort, decorated | 2340571 | 0.000 | 4.15× |
| sort-array | 1771243 | 0.001 | 5.48× |
| ramda.sortWith | 1724632 | 0.001 | 5.63× |
| lodash.orderBy | 1424696 | 0.001 | 6.81× |
| natural-orderby | 327680 | 0.003 | 29.63× |
| sort-on | 215579 | 0.005 | 45.04× |
| sort-by | 25600 | 0.039 | 379.26× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5242880 | 0.000 | 0.96× |
| inline comparator chain, toSorted() | 5242880 | 0.000 | 0.96× |
| fast-multisort | 5041231 | 0.000 | 1.00× |
| just-sort-by | 2978909 | 0.000 | 1.69× |
| thenby | 2730667 | 0.000 | 1.85× |
| fast-sort | 2340571 | 0.000 | 2.15× |
| remeda.sortBy | 2184533 | 0.000 | 2.31× |
| underscore.sortBy | 2184533 | 0.000 | 2.31× |
| es-toolkit.orderBy | 2114065 | 0.000 | 2.38× |
| Array.prototype.sort, decorated | 2048000 | 0.000 | 2.46× |
| ramda.sortWith | 1560381 | 0.001 | 3.23× |
| sort-array | 1560381 | 0.001 | 3.23× |
| lodash.orderBy | 1170286 | 0.001 | 4.31× |
| natural-orderby | 315077 | 0.003 | 16.00× |
| sort-on | 240941 | 0.004 | 20.92× |
| sort-by | 23273 | 0.043 | 216.62× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 3542486 | 0.000 | 0.42× |
| inline comparator chain, toSorted() | 3360821 | 0.000 | 0.44× |
| es-toolkit.orderBy | 1560381 | 0.001 | 0.95× |
| Array.prototype.sort, decorated | 1560381 | 0.001 | 0.95× |
| fast-multisort | 1489455 | 0.001 | 1.00× |
| thenby (different order) | 1489455 | 0.001 | 1.00× |
| remeda.sortBy (different order) | 1365333 | 0.001 | 1.09× |
| sort-array (different order) | 1213630 | 0.001 | 1.23× |
| ramda.sortWith (different order) | 1129931 | 0.001 | 1.32× |
| fast-sort (different order) | 1129931 | 0.001 | 1.32× |
| lodash.orderBy | 655360 | 0.002 | 2.27× |
| sort-on (different order) | 186182 | 0.005 | 8.00× |
| natural-orderby (different order) | 44522 | 0.022 | 33.45× |
| sort-by (different order) | 22261 | 0.045 | 66.91× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 390095 | 0.003 | 1.00× |
| inline comparator chain, slice().sort() | 215579 | 0.005 | 1.81× |
| inline comparator chain, toSorted() | 204800 | 0.005 | 1.90× |
| underscore.sortBy | 151704 | 0.007 | 2.57× |
| thenby | 107789 | 0.009 | 3.62× |
| remeda.sortBy | 93091 | 0.011 | 4.19× |
| fast-sort | 93091 | 0.011 | 4.19× |
| Array.prototype.sort, decorated | 93091 | 0.011 | 4.19× |
| es-toolkit.orderBy | 78769 | 0.013 | 4.95× |
| sort-array | 70621 | 0.014 | 5.52× |
| ramda.sortWith | 60235 | 0.017 | 6.48× |
| just-sort-by (different order) | 56889 | 0.018 | 6.86× |
| lodash.orderBy | 53895 | 0.019 | 7.24× |
| natural-orderby (different order) | 23273 | 0.043 | 16.76× |
| sort-on (different order) | 11636 | 0.086 | 33.52× |
| sort-by | 1067 | 0.938 | 365.71× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 163840 | 0.006 | 1.00× |
| inline comparator chain, slice().sort() | 163840 | 0.006 | 1.00× |
| inline comparator chain, toSorted() | 157538 | 0.006 | 1.04× |
| underscore.sortBy | 97524 | 0.010 | 1.68× |
| thenby | 89043 | 0.011 | 1.84× |
| fast-sort | 75852 | 0.013 | 2.16× |
| remeda.sortBy | 73143 | 0.014 | 2.24× |
| Array.prototype.sort, decorated | 68267 | 0.015 | 2.40× |
| es-toolkit.orderBy | 66065 | 0.015 | 2.48× |
| ramda.sortWith | 51200 | 0.020 | 3.20× |
| sort-array | 51200 | 0.020 | 3.20× |
| lodash.orderBy | 36571 | 0.027 | 4.48× |
| just-sort-by (different order) | 36571 | 0.027 | 4.48× |
| natural-orderby (different order) | 9143 | 0.109 | 17.92× |
| sort-on (different order) | 8000 | 0.125 | 20.48× |
| sort-by | 914 | 1.094 | 179.20× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 248242 | 0.004 | 1.00× |
| inline comparator chain, slice().sort() | 248242 | 0.004 | 1.00× |
| inline comparator chain, toSorted() | 248242 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 146286 | 0.007 | 1.70× |
| just-sort-by (different order) | 146286 | 0.007 | 1.70× |
| fast-sort (different order) | 113778 | 0.009 | 2.18× |
| thenby (different order) | 110703 | 0.009 | 2.24× |
| Array.prototype.sort, decorated | 105026 | 0.010 | 2.36× |
| es-toolkit.orderBy | 93091 | 0.011 | 2.67× |
| remeda.sortBy (different order) | 89043 | 0.011 | 2.79× |
| sort-array | 73143 | 0.014 | 3.39× |
| lodash.orderBy | 66065 | 0.015 | 3.76× |
| ramda.sortWith (different order) | 64000 | 0.016 | 3.88× |
| natural-orderby | 26256 | 0.038 | 9.45× |
| sort-on | 11636 | 0.086 | 21.33× |
| sort-by (different order) | 1032 | 0.969 | 240.48× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 256000 | 0.004 | 0.89× |
| inline comparator chain, toSorted() | 248242 | 0.004 | 0.92× |
| fast-multisort | 227556 | 0.004 | 1.00× |
| underscore.sortBy | 141241 | 0.007 | 1.61× |
| just-sort-by | 128000 | 0.008 | 1.78× |
| fast-sort | 110703 | 0.009 | 2.06× |
| thenby | 110703 | 0.009 | 2.06× |
| Array.prototype.sort, decorated | 97524 | 0.010 | 2.33× |
| remeda.sortBy | 93091 | 0.011 | 2.44× |
| es-toolkit.orderBy | 89043 | 0.011 | 2.56× |
| sort-array | 73143 | 0.014 | 3.11× |
| lodash.orderBy | 64000 | 0.016 | 3.56× |
| ramda.sortWith | 64000 | 0.016 | 3.56× |
| natural-orderby | 19692 | 0.051 | 11.56× |
| sort-on | 9143 | 0.109 | 24.89× |
| sort-by | 941 | 1.063 | 241.78× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 132129 | 0.008 | 0.70× |
| inline comparator chain, toSorted() | 128000 | 0.008 | 0.73× |
| fast-multisort | 93091 | 0.011 | 1.00× |
| thenby | 75852 | 0.013 | 1.23× |
| underscore.sortBy | 75852 | 0.013 | 1.23× |
| fast-sort | 70621 | 0.014 | 1.32× |
| remeda.sortBy | 68267 | 0.015 | 1.36× |
| es-toolkit.orderBy | 62061 | 0.016 | 1.50× |
| Array.prototype.sort, decorated | 60235 | 0.017 | 1.55× |
| ramda.sortWith | 46545 | 0.021 | 2.00× |
| sort-array | 44522 | 0.022 | 2.09× |
| just-sort-by | 40960 | 0.024 | 2.27× |
| lodash.orderBy | 34133 | 0.029 | 2.73× |
| sort-on | 7529 | 0.133 | 12.36× |
| natural-orderby | 5565 | 0.180 | 16.73× |
| sort-by | 914 | 1.094 | 101.82× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1724632 | 0.001 | 0.63× |
| inline comparator chain, toSorted() | 1310720 | 0.001 | 0.83× |
| fast-multisort | 1092267 | 0.001 | 1.00× |
| just-sort-by | 862316 | 0.001 | 1.27× |
| thenby | 712348 | 0.001 | 1.53× |
| fast-sort | 682667 | 0.001 | 1.60× |
| es-toolkit.orderBy | 606815 | 0.002 | 1.80× |
| Array.prototype.sort, decorated | 431158 | 0.002 | 2.53× |
| underscore.sortBy | 409600 | 0.002 | 2.67× |
| ramda.sortWith | 390095 | 0.003 | 2.80× |
| sort-array | 390095 | 0.003 | 2.80× |
| remeda.sortBy | 372364 | 0.003 | 2.93× |
| lodash.orderBy | 234057 | 0.004 | 4.67× |
| sort-on | 53895 | 0.019 | 20.27× |
| natural-orderby | 36571 | 0.027 | 29.87× |
| sort-by | 5818 | 0.172 | 187.73× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1092267 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 528516 | 0.002 | 2.07× |
| inline comparator chain, toSorted() | 481882 | 0.002 | 2.27× |
| just-sort-by | 248242 | 0.004 | 4.40× |
| underscore.sortBy | 234057 | 0.004 | 4.67× |
| fast-sort | 186182 | 0.005 | 5.87× |
| remeda.sortBy | 170667 | 0.006 | 6.40× |
| thenby | 170667 | 0.006 | 6.40× |
| Array.prototype.sort, decorated | 157538 | 0.006 | 6.93× |
| es-toolkit.orderBy | 146286 | 0.007 | 7.47× |
| sort-array | 110703 | 0.009 | 9.87× |
| lodash.orderBy | 102400 | 0.010 | 10.67× |
| ramda.sortWith | 102400 | 0.010 | 10.67× |
| natural-orderby | 31030 | 0.032 | 35.20× |
| sort-on | 12190 | 0.082 | 89.60× |
| sort-by | 1391 | 0.719 | 785.07× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 885622 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 744727 | 0.001 | 1.19× |
| inline comparator chain, toSorted() | 655360 | 0.002 | 1.35× |
| just-sort-by | 409600 | 0.002 | 2.16× |
| thenby | 327680 | 0.003 | 2.70× |
| fast-sort | 315077 | 0.003 | 2.81× |
| underscore.sortBy | 292571 | 0.003 | 3.03× |
| es-toolkit.orderBy | 273067 | 0.004 | 3.24× |
| Array.prototype.sort, decorated | 248242 | 0.004 | 3.57× |
| remeda.sortBy | 215579 | 0.005 | 4.11× |
| sort-array | 186182 | 0.005 | 4.76× |
| ramda.sortWith | 178087 | 0.006 | 4.97× |
| lodash.orderBy | 141241 | 0.007 | 6.27× |
| natural-orderby | 34133 | 0.029 | 25.95× |
| sort-on | 26947 | 0.037 | 32.86× |
| sort-by | 2560 | 0.391 | 345.95× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 186182 | 0.005 | 0.52× |
| inline comparator chain, toSorted() | 178087 | 0.006 | 0.55× |
| fast-multisort | 97524 | 0.010 | 1.00× |
| Array.prototype.sort, decorated | 68267 | 0.015 | 1.43× |
| thenby (different order) | 62061 | 0.016 | 1.57× |
| es-toolkit.orderBy | 60235 | 0.017 | 1.62× |
| remeda.sortBy (different order) | 60235 | 0.017 | 1.62× |
| sort-array (different order) | 51200 | 0.020 | 1.90× |
| lodash.orderBy | 42667 | 0.023 | 2.29× |
| ramda.sortWith (different order) | 42667 | 0.023 | 2.29× |
| fast-sort (different order) | 40960 | 0.024 | 2.38× |
| sort-on (different order) | 7758 | 0.129 | 12.57× |
| natural-orderby (different order) | 4267 | 0.234 | 22.86× |
| sort-by (different order) | 696 | 1.438 | 140.19× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42667 | 0.023 | 1.00× |
| inline comparator chain, slice().sort() | 12800 | 0.078 | 3.33× |
| inline comparator chain, toSorted() | 12800 | 0.078 | 3.33× |
| underscore.sortBy | 10240 | 0.098 | 4.17× |
| thenby | 6919 | 0.145 | 6.17× |
| fast-sort | 6400 | 0.156 | 6.67× |
| remeda.sortBy | 6095 | 0.164 | 7.00× |
| Array.prototype.sort, decorated | 6095 | 0.164 | 7.00× |
| es-toolkit.orderBy | 5333 | 0.188 | 8.00× |
| sort-array | 4741 | 0.211 | 9.00× |
| lodash.orderBy | 3765 | 0.266 | 11.33× |
| ramda.sortWith | 3765 | 0.266 | 11.33× |
| just-sort-by (different order) | 3556 | 0.281 | 12.00× |
| natural-orderby (different order) | 1730 | 0.578 | 24.67× |
| sort-on (different order) | 727 | 1.375 | 58.67× |
| sort-by | 65 | 15.500 | 661.33× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 8828 | 0.113 | 1.00× |
| inline comparator chain, slice().sort() | 8258 | 0.121 | 1.07× |
| inline comparator chain, toSorted() | 8258 | 0.121 | 1.07× |
| underscore.sortBy | 5565 | 0.180 | 1.59× |
| thenby | 5120 | 0.195 | 1.72× |
| fast-sort | 4741 | 0.211 | 1.86× |
| remeda.sortBy | 4414 | 0.227 | 2.00× |
| es-toolkit.orderBy | 4129 | 0.242 | 2.14× |
| Array.prototype.sort, decorated | 4000 | 0.250 | 2.21× |
| sort-array | 3282 | 0.305 | 2.69× |
| ramda.sortWith | 3200 | 0.313 | 2.76× |
| lodash.orderBy | 2286 | 0.438 | 3.86× |
| just-sort-by (different order) | 2286 | 0.438 | 3.86× |
| natural-orderby (different order) | 667 | 1.500 | 13.24× |
| sort-on (different order) | 533 | 1.875 | 16.55× |
| sort-by | 61 | 16.500 | 145.66× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24381 | 0.041 | 1.00× |
| inline comparator chain, slice().sort() | 14222 | 0.070 | 1.71× |
| inline comparator chain, toSorted() | 13838 | 0.072 | 1.76× |
| underscore.sortBy (different order) | 9846 | 0.102 | 2.48× |
| just-sort-by (different order) | 8258 | 0.121 | 2.95× |
| fast-sort (different order) | 7529 | 0.133 | 3.24× |
| thenby (different order) | 7111 | 0.141 | 3.43× |
| Array.prototype.sort, decorated | 6400 | 0.156 | 3.81× |
| remeda.sortBy (different order) | 6095 | 0.164 | 4.00× |
| es-toolkit.orderBy | 5818 | 0.172 | 4.19× |
| sort-array | 4923 | 0.203 | 4.95× |
| lodash.orderBy | 4414 | 0.227 | 5.52× |
| ramda.sortWith (different order) | 4129 | 0.242 | 5.90× |
| natural-orderby | 2065 | 0.484 | 11.81× |
| sort-on | 762 | 1.313 | 32.00× |
| sort-by (different order) | 65 | 15.500 | 377.90× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24381 | 0.041 | 1.00× |
| inline comparator chain, slice().sort() | 13128 | 0.076 | 1.86× |
| inline comparator chain, toSorted() | 12800 | 0.078 | 1.90× |
| underscore.sortBy | 9481 | 0.105 | 2.57× |
| just-sort-by | 8000 | 0.125 | 3.05× |
| thenby | 7314 | 0.137 | 3.33× |
| fast-sort | 6919 | 0.145 | 3.52× |
| Array.prototype.sort, decorated | 6400 | 0.156 | 3.81× |
| remeda.sortBy | 6095 | 0.164 | 4.00× |
| es-toolkit.orderBy | 5818 | 0.172 | 4.19× |
| sort-array | 4923 | 0.203 | 4.95× |
| lodash.orderBy | 4267 | 0.234 | 5.71× |
| ramda.sortWith | 4267 | 0.234 | 5.71× |
| natural-orderby | 1641 | 0.609 | 14.86× |
| sort-on | 593 | 1.688 | 41.14× |
| sort-by | 63 | 16.000 | 390.10× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7758 | 0.129 | 1.00× |
| inline comparator chain, slice().sort() | 6400 | 0.156 | 1.21× |
| inline comparator chain, toSorted() | 6400 | 0.156 | 1.21× |
| thenby | 4571 | 0.219 | 1.70× |
| underscore.sortBy | 4571 | 0.219 | 1.70× |
| fast-sort | 4267 | 0.234 | 1.82× |
| remeda.sortBy | 4129 | 0.242 | 1.88× |
| es-toolkit.orderBy | 3765 | 0.266 | 2.06× |
| Array.prototype.sort, decorated | 3765 | 0.266 | 2.06× |
| ramda.sortWith | 2909 | 0.344 | 2.67× |
| sort-array | 2909 | 0.344 | 2.67× |
| just-sort-by | 2560 | 0.391 | 3.03× |
| lodash.orderBy | 2286 | 0.438 | 3.39× |
| sort-on | 485 | 2.063 | 16.00× |
| natural-orderby | 444 | 2.250 | 17.45× |
| sort-by | 59 | 17.000 | 131.88× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 178087 | 0.006 | 0.61× |
| inline comparator chain, toSorted() | 136533 | 0.007 | 0.79× |
| fast-multisort | 107789 | 0.009 | 1.00× |
| just-sort-by | 89043 | 0.011 | 1.21× |
| thenby | 78769 | 0.013 | 1.37× |
| fast-sort | 73143 | 0.014 | 1.47× |
| es-toolkit.orderBy | 62061 | 0.016 | 1.74× |
| Array.prototype.sort, decorated | 44522 | 0.022 | 2.42× |
| sort-array | 42667 | 0.023 | 2.53× |
| underscore.sortBy | 42667 | 0.023 | 2.53× |
| ramda.sortWith | 40960 | 0.024 | 2.63× |
| remeda.sortBy | 39385 | 0.025 | 2.74× |
| lodash.orderBy | 23273 | 0.043 | 4.63× |
| sort-on | 5333 | 0.188 | 20.21× |
| natural-orderby | 3459 | 0.289 | 31.16× |
| sort-by | 552 | 1.813 | 195.37× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 113778 | 0.009 | 1.00× |
| inline comparator chain, slice().sort() | 37926 | 0.026 | 3.00× |
| inline comparator chain, toSorted() | 36571 | 0.027 | 3.11× |
| underscore.sortBy | 18963 | 0.053 | 6.00× |
| just-sort-by | 17655 | 0.057 | 6.44× |
| fast-sort | 13474 | 0.074 | 8.44× |
| remeda.sortBy | 12800 | 0.078 | 8.89× |
| thenby | 12190 | 0.082 | 9.33× |
| Array.prototype.sort, decorated | 12190 | 0.082 | 9.33× |
| es-toolkit.orderBy | 10667 | 0.094 | 10.67× |
| sort-array | 8258 | 0.121 | 13.78× |
| lodash.orderBy | 7529 | 0.133 | 15.11× |
| ramda.sortWith | 7314 | 0.137 | 15.56× |
| natural-orderby | 2667 | 0.375 | 42.67× |
| sort-on | 842 | 1.188 | 135.11× |
| sort-by | 95 | 10.500 | 1194.67× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 93091 | 0.011 | 1.00× |
| inline comparator chain, slice().sort() | 85333 | 0.012 | 1.09× |
| inline comparator chain, toSorted() | 75852 | 0.013 | 1.23× |
| just-sort-by | 46545 | 0.021 | 2.00× |
| thenby | 37926 | 0.026 | 2.45× |
| fast-sort | 36571 | 0.027 | 2.55× |
| underscore.sortBy | 32000 | 0.031 | 2.91× |
| es-toolkit.orderBy | 30118 | 0.033 | 3.09× |
| Array.prototype.sort, decorated | 26947 | 0.037 | 3.45× |
| remeda.sortBy | 24381 | 0.041 | 3.82× |
| sort-array | 22261 | 0.045 | 4.18× |
| ramda.sortWith | 20480 | 0.049 | 4.55× |
| lodash.orderBy | 15515 | 0.064 | 6.00× |
| natural-orderby | 3200 | 0.313 | 29.09× |
| sort-on | 2909 | 0.344 | 32.00× |
| sort-by | 276 | 3.625 | 337.45× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 10240 | 0.098 | 0.89× |
| inline comparator chain, toSorted() | 10240 | 0.098 | 0.89× |
| fast-multisort | 9143 | 0.109 | 1.00× |
| Array.prototype.sort, decorated | 4129 | 0.242 | 2.21× |
| thenby (different order) | 3765 | 0.266 | 2.43× |
| remeda.sortBy (different order) | 3657 | 0.273 | 2.50× |
| es-toolkit.orderBy | 3556 | 0.281 | 2.57× |
| sort-array (different order) | 3048 | 0.328 | 3.00× |
| lodash.orderBy | 2909 | 0.344 | 3.14× |
| ramda.sortWith (different order) | 2667 | 0.375 | 3.43× |
| fast-sort (different order) | 2560 | 0.391 | 3.57× |
| sort-on (different order) | 444 | 2.250 | 20.57× |
| natural-orderby (different order) | 364 | 2.750 | 25.14× |
| sort-by (different order) | 38 | 26.000 | 237.71× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4267 | 0.234 | 1.00× |
| inline comparator chain, slice().sort() | 914 | 1.094 | 4.67× |
| inline comparator chain, toSorted() | 914 | 1.094 | 4.67× |
| underscore.sortBy | 762 | 1.313 | 5.60× |
| thenby | 516 | 1.938 | 8.27× |
| remeda.sortBy | 471 | 2.125 | 9.07× |
| fast-sort | 471 | 2.125 | 9.07× |
| Array.prototype.sort, decorated | 471 | 2.125 | 9.07× |
| es-toolkit.orderBy | 400 | 2.500 | 10.67× |
| sort-array | 348 | 2.875 | 12.27× |
| lodash.orderBy | 276 | 3.625 | 15.47× |
| ramda.sortWith | 276 | 3.625 | 15.47× |
| just-sort-by (different order) | 258 | 3.875 | 16.53× |
| natural-orderby (different order) | 129 | 7.750 | 33.07× |
| sort-on (different order) | 53 | 19.000 | 81.07× |
| sort-by | 5 | 219.000 | 934.40× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 640 | 1.563 | 1.00× |
| inline comparator chain, slice().sort() | 457 | 2.188 | 1.40× |
| inline comparator chain, toSorted() | 457 | 2.188 | 1.40× |
| thenby | 333 | 3.000 | 1.92× |
| underscore.sortBy | 333 | 3.000 | 1.92× |
| fast-sort | 320 | 3.125 | 2.00× |
| remeda.sortBy | 308 | 3.250 | 2.08× |
| es-toolkit.orderBy | 286 | 3.500 | 2.24× |
| Array.prototype.sort, decorated | 267 | 3.750 | 2.40× |
| sort-array | 229 | 4.375 | 2.80× |
| ramda.sortWith | 222 | 4.500 | 2.88× |
| lodash.orderBy | 148 | 6.750 | 4.32× |
| just-sort-by (different order) | 148 | 6.750 | 4.32× |
| natural-orderby (different order) | 42 | 24.000 | 15.36× |
| sort-on (different order) | 37 | 27.000 | 17.28× |
| sort-by | 4 | 237.000 | 151.68× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2783 | 0.359 | 1.00× |
| inline comparator chain, toSorted() | 914 | 1.094 | 3.04× |
| inline comparator chain, slice().sort() | 889 | 1.125 | 3.13× |
| underscore.sortBy (different order) | 667 | 1.500 | 4.17× |
| just-sort-by (different order) | 593 | 1.688 | 4.70× |
| fast-sort (different order) | 516 | 1.938 | 5.39× |
| thenby (different order) | 516 | 1.938 | 5.39× |
| remeda.sortBy (different order) | 444 | 2.250 | 6.26× |
| Array.prototype.sort, decorated | 444 | 2.250 | 6.26× |
| es-toolkit.orderBy | 432 | 2.313 | 6.43× |
| sort-array | 364 | 2.750 | 7.65× |
| ramda.sortWith (different order) | 296 | 3.375 | 9.39× |
| lodash.orderBy | 286 | 3.500 | 9.74× |
| natural-orderby | 148 | 6.750 | 18.78× |
| sort-on | 53 | 19.000 | 52.87× |
| sort-by (different order) | 4 | 229.000 | 637.22× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2667 | 0.375 | 1.00× |
| inline comparator chain, slice().sort() | 800 | 1.250 | 3.33× |
| inline comparator chain, toSorted() | 800 | 1.250 | 3.33× |
| underscore.sortBy | 667 | 1.500 | 4.00× |
| just-sort-by | 571 | 1.750 | 4.67× |
| thenby | 516 | 1.938 | 5.17× |
| fast-sort | 500 | 2.000 | 5.33× |
| remeda.sortBy | 444 | 2.250 | 6.00× |
| Array.prototype.sort, decorated | 432 | 2.313 | 6.17× |
| es-toolkit.orderBy | 421 | 2.375 | 6.33× |
| sort-array | 348 | 2.875 | 7.67× |
| ramda.sortWith | 296 | 3.375 | 9.00× |
| lodash.orderBy | 286 | 3.500 | 9.33× |
| natural-orderby | 121 | 8.250 | 22.00× |
| sort-on | 40 | 25.000 | 66.67× |
| sort-by | 4 | 232.000 | 618.67× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 571 | 1.750 | 1.00× |
| inline comparator chain, toSorted() | 400 | 2.500 | 1.43× |
| inline comparator chain, slice().sort() | 381 | 2.625 | 1.50× |
| underscore.sortBy | 308 | 3.250 | 1.86× |
| thenby | 296 | 3.375 | 1.93× |
| fast-sort | 286 | 3.500 | 2.00× |
| remeda.sortBy | 276 | 3.625 | 2.07× |
| es-toolkit.orderBy | 250 | 4.000 | 2.29× |
| Array.prototype.sort, decorated | 250 | 4.000 | 2.29× |
| sort-array | 211 | 4.750 | 2.71× |
| ramda.sortWith | 200 | 5.000 | 2.86× |
| just-sort-by | 174 | 5.750 | 3.29× |
| lodash.orderBy | 143 | 7.000 | 4.00× |
| sort-on | 33 | 30.000 | 17.14× |
| natural-orderby | 33 | 30.000 | 17.14× |
| sort-by | 4 | 250.000 | 142.86× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 15059 | 0.066 | 0.74× |
| inline comparator chain, toSorted() | 12190 | 0.082 | 0.91× |
| fast-multisort | 11130 | 0.090 | 1.00× |
| just-sort-by | 8258 | 0.121 | 1.35× |
| thenby | 7314 | 0.137 | 1.52× |
| fast-sort | 7111 | 0.141 | 1.57× |
| es-toolkit.orderBy | 5818 | 0.172 | 1.91× |
| sort-array | 4129 | 0.242 | 2.70× |
| underscore.sortBy | 4129 | 0.242 | 2.70× |
| remeda.sortBy | 4000 | 0.250 | 2.78× |
| ramda.sortWith | 4000 | 0.250 | 2.78× |
| Array.prototype.sort, decorated | 4000 | 0.250 | 2.78× |
| lodash.orderBy | 2207 | 0.453 | 5.04× |
| sort-on | 533 | 1.875 | 20.87× |
| natural-orderby | 308 | 3.250 | 36.17× |
| sort-by | 54 | 18.500 | 205.91× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11130 | 0.090 | 1.00× |
| inline comparator chain, slice().sort() | 3048 | 0.328 | 3.65× |
| inline comparator chain, toSorted() | 2909 | 0.344 | 3.83× |
| underscore.sortBy | 1524 | 0.656 | 7.30× |
| just-sort-by | 1391 | 0.719 | 8.00× |
| remeda.sortBy | 1032 | 0.969 | 10.78× |
| fast-sort | 1032 | 0.969 | 10.78× |
| thenby | 970 | 1.031 | 11.48× |
| Array.prototype.sort, decorated | 970 | 1.031 | 11.48× |
| es-toolkit.orderBy | 842 | 1.188 | 13.22× |
| sort-array | 640 | 1.563 | 17.39× |
| lodash.orderBy | 615 | 1.625 | 18.09× |
| ramda.sortWith | 593 | 1.688 | 18.78× |
| natural-orderby | 216 | 4.625 | 51.48× |
| sort-on | 65 | 15.500 | 172.52× |
| sort-by | 7 | 140.000 | 1558.26× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9846 | 0.102 | 1.00× |
| inline comparator chain, slice().sort() | 6400 | 0.156 | 1.54× |
| inline comparator chain, toSorted() | 5818 | 0.172 | 1.69× |
| just-sort-by | 3556 | 0.281 | 2.77× |
| fast-sort | 2909 | 0.344 | 3.38× |
| thenby | 2909 | 0.344 | 3.38× |
| underscore.sortBy | 2667 | 0.375 | 3.69× |
| es-toolkit.orderBy | 2370 | 0.422 | 4.15× |
| Array.prototype.sort, decorated | 2133 | 0.469 | 4.62× |
| remeda.sortBy | 1939 | 0.516 | 5.08× |
| sort-array | 1684 | 0.594 | 5.85× |
| ramda.sortWith | 1600 | 0.625 | 6.15× |
| lodash.orderBy | 1231 | 0.813 | 8.00× |
| natural-orderby | 276 | 3.625 | 35.69× |
| sort-on | 235 | 4.250 | 41.85× |
| sort-by | 21 | 48.000 | 472.62× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1280 | 0.781 | 1.00× |
| inline comparator chain, slice().sort() | 640 | 1.563 | 2.00× |
| inline comparator chain, toSorted() | 640 | 1.563 | 2.00× |
| Array.prototype.sort, decorated | 286 | 3.500 | 4.48× |
| thenby (different order) | 267 | 3.750 | 4.80× |
| remeda.sortBy (different order) | 250 | 4.000 | 5.12× |
| es-toolkit.orderBy | 242 | 4.125 | 5.28× |
| lodash.orderBy | 200 | 5.000 | 6.40× |
| sort-array (different order) | 200 | 5.000 | 6.40× |
| ramda.sortWith (different order) | 182 | 5.500 | 7.04× |
| fast-sort (different order) | 174 | 5.750 | 7.36× |
| natural-orderby (different order) | 33 | 30.000 | 38.40× |
| sort-on (different order) | 29 | 34.000 | 43.52× |
| sort-by (different order) | 2 | 446.000 | 570.88× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 364 | 2.750 | 1.00× |
| inline comparator chain, slice().sort() | 71 | 14.000 | 5.09× |
| inline comparator chain, toSorted() | 69 | 14.500 | 5.27× |
| underscore.sortBy | 61 | 16.500 | 6.00× |
| thenby | 42 | 24.000 | 8.73× |
| remeda.sortBy | 38 | 26.000 | 9.45× |
| fast-sort | 36 | 28.000 | 10.18× |
| Array.prototype.sort, decorated | 36 | 28.000 | 10.18× |
| es-toolkit.orderBy | 31 | 32.000 | 11.64× |
| sort-array | 28 | 36.000 | 13.09× |
| ramda.sortWith | 22 | 45.000 | 16.36× |
| just-sort-by (different order) | 19 | 54.000 | 19.64× |
| lodash.orderBy | 18 | 56.000 | 20.36× |
| natural-orderby (different order) | 8 | 118.000 | 42.91× |
| sort-on (different order) | 4 | 246.000 | 89.45× |
| sort-by | 0 | 3137.000 | 1140.73× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 48 | 21.000 | 1.00× |
| inline comparator chain, toSorted() | 32 | 31.000 | 1.48× |
| inline comparator chain, slice().sort() | 30 | 33.000 | 1.57× |
| thenby | 24 | 42.000 | 2.00× |
| underscore.sortBy | 22 | 45.000 | 2.14× |
| remeda.sortBy | 21 | 48.000 | 2.29× |
| fast-sort | 20 | 50.000 | 2.38× |
| es-toolkit.orderBy | 18 | 55.000 | 2.62× |
| sort-array | 17 | 60.000 | 2.86× |
| ramda.sortWith | 15 | 67.000 | 3.19× |
| Array.prototype.sort, decorated | 14 | 70.000 | 3.33× |
| just-sort-by (different order) | 10 | 98.000 | 4.67× |
| lodash.orderBy | 9 | 117.000 | 5.57× |
| natural-orderby (different order) | 3 | 356.000 | 16.95× |
| sort-on (different order) | 3 | 382.000 | 18.19× |
| sort-by | 0 | 3440.000 | 163.81× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 258 | 3.875 | 1.00× |
| inline comparator chain, toSorted() | 65 | 15.500 | 4.00× |
| inline comparator chain, slice().sort() | 63 | 16.000 | 4.13× |
| underscore.sortBy (different order) | 50 | 20.000 | 5.16× |
| just-sort-by (different order) | 42 | 24.000 | 6.19× |
| fast-sort (different order) | 38 | 26.000 | 6.71× |
| thenby (different order) | 37 | 27.000 | 6.97× |
| es-toolkit.orderBy | 32 | 31.000 | 8.00× |
| remeda.sortBy (different order) | 32 | 31.000 | 8.00× |
| Array.prototype.sort, decorated | 30 | 33.000 | 8.52× |
| sort-array | 27 | 37.000 | 9.55× |
| ramda.sortWith (different order) | 23 | 43.000 | 11.10× |
| lodash.orderBy | 17 | 58.000 | 14.97× |
| natural-orderby | 9 | 109.000 | 28.13× |
| sort-on | 4 | 247.000 | 63.74× |
| sort-by (different order) | 0 | 3177.000 | 819.87× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 242 | 4.125 | 1.00× |
| inline comparator chain, slice().sort() | 59 | 17.000 | 4.12× |
| inline comparator chain, toSorted() | 57 | 17.500 | 4.24× |
| underscore.sortBy | 45 | 22.000 | 5.33× |
| just-sort-by | 43 | 23.000 | 5.58× |
| thenby | 38 | 26.000 | 6.30× |
| fast-sort | 36 | 28.000 | 6.79× |
| remeda.sortBy | 34 | 29.000 | 7.03× |
| es-toolkit.orderBy | 30 | 33.000 | 8.00× |
| sort-array | 26 | 38.000 | 9.21× |
| Array.prototype.sort, decorated | 26 | 38.000 | 9.21× |
| ramda.sortWith | 23 | 44.000 | 10.67× |
| lodash.orderBy | 16 | 63.000 | 15.27× |
| natural-orderby | 8 | 127.000 | 30.79× |
| sort-on | 3 | 317.000 | 76.85× |
| sort-by | 0 | 3376.000 | 818.42× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30 | 33.000 | 1.00× |
| inline comparator chain, toSorted() | 26 | 38.000 | 1.15× |
| inline comparator chain, slice().sort() | 23 | 43.000 | 1.30× |
| underscore.sortBy | 22 | 46.000 | 1.39× |
| thenby | 20 | 50.000 | 1.52× |
| fast-sort | 19 | 53.000 | 1.61× |
| remeda.sortBy | 18 | 55.000 | 1.67× |
| es-toolkit.orderBy | 17 | 58.000 | 1.76× |
| Array.prototype.sort, decorated | 16 | 63.000 | 1.91× |
| sort-array | 15 | 67.000 | 2.03× |
| ramda.sortWith | 14 | 71.000 | 2.15× |
| just-sort-by | 12 | 85.000 | 2.58× |
| lodash.orderBy | 8 | 127.000 | 3.85× |
| sort-on | 2 | 405.000 | 12.27× |
| natural-orderby (different order) | 2 | 450.000 | 13.64× |
| sort-by | 0 | 3511.000 | 106.39× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1185 | 0.844 | 0.93× |
| fast-multisort | 1103 | 0.906 | 1.00× |
| inline comparator chain, toSorted() | 1032 | 0.969 | 1.07× |
| just-sort-by | 727 | 1.375 | 1.52× |
| thenby | 667 | 1.500 | 1.66× |
| fast-sort | 615 | 1.625 | 1.79× |
| es-toolkit.orderBy | 533 | 1.875 | 2.07× |
| ramda.sortWith | 381 | 2.625 | 2.90× |
| sort-array | 381 | 2.625 | 2.90× |
| remeda.sortBy | 348 | 2.875 | 3.17× |
| Array.prototype.sort, decorated | 333 | 3.000 | 3.31× |
| underscore.sortBy | 296 | 3.375 | 3.72× |
| lodash.orderBy | 143 | 7.000 | 7.72× |
| sort-on | 48 | 21.000 | 23.17× |
| natural-orderby | 24 | 42.000 | 46.34× |
| sort-by | 5 | 196.000 | 216.28× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1103 | 0.906 | 1.00× |
| inline comparator chain, slice().sort() | 235 | 4.250 | 4.69× |
| inline comparator chain, toSorted() | 229 | 4.375 | 4.83× |
| just-sort-by | 114 | 8.750 | 9.66× |
| underscore.sortBy | 108 | 9.250 | 10.21× |
| remeda.sortBy | 83 | 12.000 | 13.24× |
| fast-sort | 83 | 12.000 | 13.24× |
| thenby | 80 | 12.500 | 13.79× |
| Array.prototype.sort, decorated | 80 | 12.500 | 13.79× |
| es-toolkit.orderBy | 69 | 14.500 | 16.00× |
| sort-array | 50 | 20.000 | 22.07× |
| ramda.sortWith | 48 | 21.000 | 23.17× |
| lodash.orderBy | 45 | 22.000 | 24.28× |
| natural-orderby | 15 | 67.000 | 73.93× |
| sort-on | 5 | 194.000 | 214.07× |
| sort-by | 1 | 1984.000 | 2189.24× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1000 | 1.000 | 1.00× |
| inline comparator chain, slice().sort() | 593 | 1.688 | 1.69× |
| inline comparator chain, toSorted() | 593 | 1.688 | 1.69× |
| just-sort-by | 364 | 2.750 | 2.75× |
| thenby | 320 | 3.125 | 3.13× |
| fast-sort | 296 | 3.375 | 3.38× |
| es-toolkit.orderBy | 250 | 4.000 | 4.00× |
| underscore.sortBy | 229 | 4.375 | 4.38× |
| Array.prototype.sort, decorated | 211 | 4.750 | 4.75× |
| remeda.sortBy | 205 | 4.875 | 4.88× |
| sort-array | 182 | 5.500 | 5.50× |
| ramda.sortWith | 167 | 6.000 | 6.00× |
| lodash.orderBy | 77 | 13.000 | 13.00× |
| sort-on | 24 | 42.000 | 42.00× |
| natural-orderby | 22 | 45.000 | 45.00× |
| sort-by | 2 | 449.000 | 449.00× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 105 | 9.500 | 1.00× |
| inline comparator chain, toSorted() | 42 | 24.000 | 2.53× |
| inline comparator chain, slice().sort() | 40 | 25.000 | 2.63× |
| Array.prototype.sort, decorated | 21 | 48.000 | 5.05× |
| thenby (different order) | 19 | 52.000 | 5.47× |
| remeda.sortBy (different order) | 19 | 53.000 | 5.58× |
| es-toolkit.orderBy | 17 | 58.000 | 6.11× |
| sort-array (different order) | 15 | 66.000 | 6.95× |
| ramda.sortWith (different order) | 14 | 71.000 | 7.47× |
| fast-sort (different order) | 12 | 82.000 | 8.63× |
| lodash.orderBy | 12 | 86.000 | 9.05× |
| natural-orderby (different order) | 3 | 396.000 | 41.68× |
| sort-on (different order) | 2 | 484.000 | 50.95× |
| sort-by (different order) | 0 | 5990.000 | 630.53× |

</details>

<!-- browsers:end -->

Run `pnpm bench` (or `pnpm bench --sizes=100,10000` for a subset) and `pnpm bench:browsers` to reproduce; `pnpm bench:readme` rewrites the tables above, and `pnpm bench:floor` writes [benchmark/floor.md](benchmark/floor.md), the cost of the contract alone. What each competitor does and which of their ideas ended up in here: [benchmark/COMPETITORS.md](benchmark/COMPETITORS.md).

The honest footnote: a hand-written comparator chain passed to the native sort is the thing to beat. At ten rows with one key it is behind us in Chromium and at most 1% ahead in node, and ahead by up to 1.3× in Firefox and 1.2× in WebKit, mostly on numbers; with three keys it wins by up to 2.4× at ten rows and 1.9× at a hundred. At a hundred rows with one key it wins on integers with nulls, floats and ISO dates by up to 1.4× in every engine: our paths there make about as many comparisons as the native sort, through an index, and add the key pass; inserting in place, which wins at ten rows, is 2× slower than that in Firefox at a hundred. At one row it is 3–6% ahead in Firefox. It also wins on input that is already sorted, reversed or has one row moved, which the native sort handles in linear time without a key pass: in Chromium by up to 1.7× and in node by up to 1.4× at every size from a hundred rows, in Firefox by up to 1.6× on already sorted input up to a hundred thousand rows, and in WebKit by up to 1.6× at a hundred rows, 1.1× at a thousand and 2.3× on already sorted input at ten thousand. Much of both leads is the contract rather than the sort. Calling every getter once and returning a new array, with no comparison at all, is, in node, 52% of our gap on three keys at ten rows and 77–82% of the inline chain's whole time on those ordered shapes at 10,000 and 100,000 rows, because the native sort reads keys inside its comparator and has no separate pass: on one row moved at ten thousand rows that floor alone is 47 µs of the inline chain's 60 (benchmark/floor.md). At ten rows some libraries are ahead as well: thenby, es-toolkit and fast-sort on one row moved in WebKit (by up to 1.75×) and thenby on floats there (5%), and on three keys es-toolkit (1.2× in WebKit and Chromium, 5% in Firefox) and the decorated native sort (up to 1.1×); in node none is. From a hundred rows up no library beats us, except in WebKit: just-sort-by on one row moved at a thousand rows (by 12%), and just-sort-by, thenby and fast-sort on already sorted input at ten thousand (by 22%, 15% and 11%). There JavaScriptCore has specialised our key loop to the previous case's getter, exits the optimised code on entry and runs the loop in its baseline tier, so already sorted input at ten thousand rows takes 105 µs (a manual run of the same sequence under `jsc --printEachOSRExit=true` shows 889 such exits in that case). Commit ed33a0d, which read every key first and scanned the array after, measured 45 µs there in an uncommitted run of the same suite. In V8 our single read-and-check pass is 6–29% faster than that two-pass design, and reading keys in chunks through a separate function, which keeps the getter call out of the scan, is 11–31% slower than the single pass, so the single pass stays. From a thousand rows up on the six shapes that need sorting we lead the faster of the two inline chains by up to 8.2× and are within 12% of it at worst (three keys, a thousand rows, Firefox), and we lead the closest library by 1.4 to 11×. Absolute times at a million rows move by up to half between runs with the heap's state. Between the last two runs the only lead on those six shapes that changed sign was a tie (Chromium, three keys, a thousand rows, 0.99× to 1.00–1.01×); on sorted, reversed and one-row-moved input, where both sides are linear, ratios near 1× land on either side. The tables are the only argument, and the scripts above regenerate them from scratch.

## How

Numbers go through a stable radix sort on their float64 bits, strings through buckets and a radix sort over the characters that actually differ, ties recurse into the next rule, and anything exotic falls back to the lodash comparator so the order stays identical to lodash. Inputs that are already in order are passed through, and inputs that are nearly in order (a list that came back sorted from the server, then had a few rows edited) are cut into their ordered runs and merged with galloping, the way TimSort does it, but on the extracted keys instead of through a comparator callback. Up to 128 rows the radix passes cost more than they save: a single string column with a repeat among its first 16 keys is ranked by its distinct keys and placed by counting, other leading string columns are bucketed by the first character that differs and each bucket is sorted in place by binary insertion, and numbers, or several columns led by a number, go to the engine's sort. Up to 16 rows, `orderBy` and `multisort` with one key of numbers or strings (nullish allowed) sort by inserting each key and its item into place with the comparisons written out, with no index array and no comparator call; several columns whose keys compare consistently are sorted by binary insertion over their indices. The rest is bookkeeping.

## License

MIT
