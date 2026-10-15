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
| inline comparator chain, slice().sort() | 0.50× | 1.23× | 7.92× | 63 | 0 |
| inline comparator chain, toSorted() | 0.48× | 1.29× | 7.88× | 63 | 0 |
| just-sort-by | 0.52× | 2.16× | 15.63× | 56 | 17 |
| thenby | 1.17× | 2.38× | 11.46× | 63 | 12 |
| es-toolkit.orderBy | 1.02× | 2.45× | 13.43× | 63 | 0 |
| fast-sort | 1.46× | 2.65× | 26.66× | 63 | 6 |
| Array.prototype.sort, decorated | 1.14× | 2.94× | 20.59× | 63 | 0 |
| remeda.sortBy | 1.14× | 3.20× | 13.22× | 63 | 12 |
| underscore.sortBy | 1.38× | 3.78× | 7.78× | 56 | 6 |
| ramda.sortWith | 1.94× | 4.31× | 20.06× | 63 | 12 |
| lodash.orderBy | 1.48× | 4.80× | 18.71× | 63 | 0 |
| sort-array | 1.69× | 4.91× | 23.45× | 63 | 6 |
| sort-on | 1.73× | 25.54× | 106.20× | 63 | 17 |
| natural-orderby | 4.63× | 26.48× | 144.87× | 63 | 17 |
| sort-by | 4.39× | 188.88× | 721.00× | 63 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 271157145 | 0.000 | 0.52× |
| fast-multisort | 140142580 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 114289457 | 0.000 | 1.23× |
| es-toolkit.orderBy | 87472297 | 0.000 | 1.60× |
| sort-on | 74152237 | 0.000 | 1.89× |
| Array.prototype.sort, decorated | 64157694 | 0.000 | 2.18× |
| thenby | 42686351 | 0.000 | 3.28× |
| inline comparator chain, toSorted() | 38076902 | 0.000 | 3.68× |
| ramda.sortWith | 35855851 | 0.000 | 3.91× |
| remeda.sortBy | 30488508 | 0.000 | 4.60× |
| fast-sort | 29068403 | 0.000 | 4.82× |
| sort-by | 28631755 | 0.000 | 4.89× |
| sort-array | 28569704 | 0.000 | 4.91× |
| underscore.sortBy | 24207311 | 0.000 | 5.79× |
| lodash.orderBy | 23933671 | 0.000 | 5.86× |
| natural-orderby | 3742544 | 0.000 | 37.45× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 224898171 | 0.000 | 0.57× |
| fast-multisort | 128840938 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104824732 | 0.000 | 1.23× |
| es-toolkit.orderBy | 80220792 | 0.000 | 1.61× |
| sort-on | 72979955 | 0.000 | 1.77× |
| Array.prototype.sort, decorated | 63252805 | 0.000 | 2.04× |
| thenby | 40868604 | 0.000 | 3.15× |
| inline comparator chain, toSorted() | 37065525 | 0.000 | 3.48× |
| ramda.sortWith | 35206115 | 0.000 | 3.66× |
| remeda.sortBy | 30534600 | 0.000 | 4.22× |
| fast-sort | 30077296 | 0.000 | 4.28× |
| sort-array | 28802220 | 0.000 | 4.47× |
| sort-by | 28438273 | 0.000 | 4.53× |
| underscore.sortBy | 22565227 | 0.000 | 5.71× |
| lodash.orderBy | 18598368 | 0.000 | 6.93× |
| natural-orderby | 1717050 | 0.001 | 75.04× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 223770057 | 0.000 | 0.57× |
| fast-multisort | 127650857 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 106039050 | 0.000 | 1.20× |
| es-toolkit.orderBy | 80283364 | 0.000 | 1.59× |
| sort-on | 72480018 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 62613234 | 0.000 | 2.04× |
| thenby | 40881018 | 0.000 | 3.12× |
| inline comparator chain, toSorted() | 37233004 | 0.000 | 3.43× |
| ramda.sortWith | 35107689 | 0.000 | 3.64× |
| remeda.sortBy | 30488951 | 0.000 | 4.19× |
| fast-sort | 29693767 | 0.000 | 4.30× |
| sort-array | 29146002 | 0.000 | 4.38× |
| sort-by | 28675636 | 0.000 | 4.45× |
| underscore.sortBy | 22458978 | 0.000 | 5.68× |
| lodash.orderBy | 19220266 | 0.000 | 6.64× |
| natural-orderby | 2957034 | 0.000 | 43.17× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 228955579 | 0.000 | 0.55× |
| fast-multisort | 126887039 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105227211 | 0.000 | 1.21× |
| es-toolkit.orderBy | 81084735 | 0.000 | 1.56× |
| sort-on | 72784817 | 0.000 | 1.74× |
| Array.prototype.sort, decorated | 63248034 | 0.000 | 2.01× |
| thenby | 40789248 | 0.000 | 3.11× |
| inline comparator chain, toSorted() | 37570352 | 0.000 | 3.38× |
| ramda.sortWith | 35365425 | 0.000 | 3.59× |
| remeda.sortBy | 30367504 | 0.000 | 4.18× |
| fast-sort | 29932731 | 0.000 | 4.24× |
| sort-array | 29113363 | 0.000 | 4.36× |
| sort-by | 28640194 | 0.000 | 4.43× |
| underscore.sortBy | 22107126 | 0.000 | 5.74× |
| lodash.orderBy | 18952737 | 0.000 | 6.69× |
| natural-orderby | 2665465 | 0.000 | 47.60× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 224528712 | 0.000 | 0.56× |
| fast-multisort | 126509903 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104167703 | 0.000 | 1.21× |
| es-toolkit.orderBy | 81032388 | 0.000 | 1.56× |
| sort-on | 73061209 | 0.000 | 1.73× |
| Array.prototype.sort, decorated | 62223028 | 0.000 | 2.03× |
| thenby | 41311049 | 0.000 | 3.06× |
| inline comparator chain, toSorted() | 37215384 | 0.000 | 3.40× |
| ramda.sortWith | 35699546 | 0.000 | 3.54× |
| remeda.sortBy | 30632537 | 0.000 | 4.13× |
| fast-sort | 30180892 | 0.000 | 4.19× |
| sort-array | 29436156 | 0.000 | 4.30× |
| sort-by | 28799978 | 0.000 | 4.39× |
| underscore.sortBy | 22376941 | 0.000 | 5.65× |
| lodash.orderBy | 19416875 | 0.000 | 6.52× |
| natural-orderby | 1857324 | 0.001 | 68.11× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 226696159 | 0.000 | 0.56× |
| fast-multisort | 126494637 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104402364 | 0.000 | 1.21× |
| es-toolkit.orderBy | 79328274 | 0.000 | 1.59× |
| sort-on | 72037581 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 62766822 | 0.000 | 2.02× |
| thenby | 41250445 | 0.000 | 3.07× |
| inline comparator chain, toSorted() | 37408228 | 0.000 | 3.38× |
| ramda.sortWith | 34898199 | 0.000 | 3.62× |
| remeda.sortBy | 30220650 | 0.000 | 4.19× |
| fast-sort | 29469903 | 0.000 | 4.29× |
| sort-array | 29041231 | 0.000 | 4.36× |
| sort-by | 28508826 | 0.000 | 4.44× |
| underscore.sortBy | 22562475 | 0.000 | 5.61× |
| lodash.orderBy | 18947087 | 0.000 | 6.68× |
| natural-orderby | 3551762 | 0.000 | 35.61× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 229607328 | 0.000 | 0.56× |
| fast-multisort | 127498880 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 106174385 | 0.000 | 1.20× |
| es-toolkit.orderBy | 80427430 | 0.000 | 1.59× |
| sort-on | 72621201 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 63418659 | 0.000 | 2.01× |
| thenby | 40857855 | 0.000 | 3.12× |
| inline comparator chain, toSorted() | 37572652 | 0.000 | 3.39× |
| ramda.sortWith | 35352905 | 0.000 | 3.61× |
| remeda.sortBy | 30668561 | 0.000 | 4.16× |
| fast-sort | 29774535 | 0.000 | 4.28× |
| sort-array | 29371019 | 0.000 | 4.34× |
| sort-by | 28800934 | 0.000 | 4.43× |
| underscore.sortBy | 22748726 | 0.000 | 5.60× |
| lodash.orderBy | 19374750 | 0.000 | 6.58× |
| natural-orderby | 3583830 | 0.000 | 35.58× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 228705367 | 0.000 | 0.56× |
| fast-multisort | 127359181 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104964969 | 0.000 | 1.21× |
| es-toolkit.orderBy | 80876529 | 0.000 | 1.57× |
| sort-on | 73094313 | 0.000 | 1.74× |
| Array.prototype.sort, decorated | 63280957 | 0.000 | 2.01× |
| thenby | 41174450 | 0.000 | 3.09× |
| inline comparator chain, toSorted() | 37411953 | 0.000 | 3.40× |
| ramda.sortWith | 35286035 | 0.000 | 3.61× |
| remeda.sortBy | 30902200 | 0.000 | 4.12× |
| fast-sort | 29652586 | 0.000 | 4.30× |
| sort-array | 29522175 | 0.000 | 4.31× |
| sort-by | 29017122 | 0.000 | 4.39× |
| underscore.sortBy | 22111282 | 0.000 | 5.76× |
| lodash.orderBy | 19338928 | 0.000 | 6.59× |
| natural-orderby | 2798820 | 0.000 | 45.50× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 129060305 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105888691 | 0.000 | 1.22× |
| es-toolkit.orderBy | 80650644 | 0.000 | 1.60× |
| sort-on | 73128510 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 62688725 | 0.000 | 2.06× |
| inline comparator chain, toSorted() | 37537177 | 0.000 | 3.44× |
| sort-array | 29577900 | 0.000 | 4.36× |
| sort-by | 25772825 | 0.000 | 5.01× |
| ramda.sortWith | 22140307 | 0.000 | 5.83× |
| remeda.sortBy | 17048746 | 0.000 | 7.57× |
| lodash.orderBy | 15136373 | 0.000 | 8.53× |
| thenby | 11944026 | 0.000 | 10.81× |
| fast-sort | 4841004 | 0.000 | 26.66× |
| natural-orderby | 890881 | 0.001 | 144.87× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4738884 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4727191 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 4497817 | 0.000 | 1.05× |
| thenby | 3983649 | 0.000 | 1.19× |
| remeda.sortBy | 3767073 | 0.000 | 1.26× |
| Array.prototype.sort, decorated | 3760462 | 0.000 | 1.26× |
| es-toolkit.orderBy | 3725727 | 0.000 | 1.27× |
| fast-sort | 3012913 | 0.000 | 1.57× |
| sort-array | 2796536 | 0.000 | 1.69× |
| underscore.sortBy | 2741958 | 0.000 | 1.73× |
| lodash.orderBy | 2176459 | 0.000 | 2.18× |
| ramda.sortWith | 1749754 | 0.001 | 2.71× |
| just-sort-by (different order) | 1100912 | 0.001 | 4.30× |
| natural-orderby (different order) | 308894 | 0.003 | 15.34× |
| sort-on (different order) | 218139 | 0.005 | 21.72× |
| sort-by | 29642 | 0.034 | 159.87× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 3844284 | 0.000 | 0.86× |
| inline comparator chain, slice().sort() | 3668937 | 0.000 | 0.90× |
| fast-multisort | 3290793 | 0.000 | 1.00× |
| thenby | 2620842 | 0.000 | 1.26× |
| remeda.sortBy | 2580179 | 0.000 | 1.28× |
| es-toolkit.orderBy | 2473780 | 0.000 | 1.33× |
| fast-sort | 2256455 | 0.000 | 1.46× |
| underscore.sortBy | 2190353 | 0.000 | 1.50× |
| Array.prototype.sort, decorated | 1967282 | 0.001 | 1.67× |
| lodash.orderBy | 1832357 | 0.001 | 1.80× |
| ramda.sortWith | 1367705 | 0.001 | 2.41× |
| sort-array | 1247273 | 0.001 | 2.64× |
| just-sort-by | 872428 | 0.001 | 3.77× |
| sort-on | 184413 | 0.005 | 17.84× |
| natural-orderby | 124283 | 0.008 | 26.48× |
| sort-by | 28942 | 0.035 | 113.70× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6663280 | 0.000 | 0.66× |
| inline comparator chain, slice().sort() | 6157578 | 0.000 | 0.71× |
| fast-multisort | 4379370 | 0.000 | 1.00× |
| just-sort-by (different order) | 4019247 | 0.000 | 1.09× |
| thenby (different order) | 3361542 | 0.000 | 1.30× |
| es-toolkit.orderBy | 3300640 | 0.000 | 1.33× |
| remeda.sortBy (different order) | 3250861 | 0.000 | 1.35× |
| underscore.sortBy (different order) | 2934596 | 0.000 | 1.49× |
| Array.prototype.sort, decorated | 2749503 | 0.000 | 1.59× |
| fast-sort | 2713856 | 0.000 | 1.61× |
| lodash.orderBy | 2278140 | 0.000 | 1.92× |
| ramda.sortWith (different order) | 1734661 | 0.001 | 2.52× |
| sort-array | 1526078 | 0.001 | 2.87× |
| natural-orderby | 315064 | 0.003 | 13.90× |
| sort-on | 269616 | 0.004 | 16.24× |
| sort-by (different order) | 36066 | 0.028 | 121.42× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 5081599 | 0.000 | 0.70× |
| inline comparator chain, slice().sort() | 4733657 | 0.000 | 0.75× |
| fast-multisort | 3571983 | 0.000 | 1.00× |
| just-sort-by | 2867061 | 0.000 | 1.25× |
| thenby | 2669849 | 0.000 | 1.34× |
| remeda.sortBy | 2626939 | 0.000 | 1.36× |
| es-toolkit.orderBy | 2468225 | 0.000 | 1.45× |
| underscore.sortBy | 2459191 | 0.000 | 1.45× |
| fast-sort | 2073118 | 0.000 | 1.72× |
| Array.prototype.sort, decorated | 1958908 | 0.001 | 1.82× |
| lodash.orderBy | 1790991 | 0.001 | 1.99× |
| ramda.sortWith | 1291566 | 0.001 | 2.77× |
| sort-array | 1080449 | 0.001 | 3.31× |
| natural-orderby | 260789 | 0.004 | 13.70× |
| sort-on | 181339 | 0.006 | 19.70× |
| sort-by | 26186 | 0.038 | 136.41× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4180175 | 0.000 | 0.71× |
| inline comparator chain, slice().sort() | 3929566 | 0.000 | 0.75× |
| fast-multisort | 2960457 | 0.000 | 1.00× |
| thenby | 2538659 | 0.000 | 1.17× |
| remeda.sortBy | 2468147 | 0.000 | 1.20× |
| es-toolkit.orderBy | 2331077 | 0.000 | 1.27× |
| underscore.sortBy | 2007392 | 0.000 | 1.47× |
| fast-sort | 1989577 | 0.001 | 1.49× |
| Array.prototype.sort, decorated | 1965360 | 0.001 | 1.51× |
| lodash.orderBy | 1651093 | 0.001 | 1.79× |
| just-sort-by | 1507126 | 0.001 | 1.96× |
| ramda.sortWith | 1382142 | 0.001 | 2.14× |
| sort-array | 1203345 | 0.001 | 2.46× |
| sort-on | 181256 | 0.006 | 16.33× |
| natural-orderby | 180050 | 0.006 | 16.44× |
| sort-by | 29453 | 0.034 | 100.51× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14000739 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 12334374 | 0.000 | 1.14× |
| inline comparator chain, slice().sort() | 10487106 | 0.000 | 1.34× |
| just-sort-by | 6509444 | 0.000 | 2.15× |
| es-toolkit.orderBy | 5345251 | 0.000 | 2.62× |
| thenby | 5309228 | 0.000 | 2.64× |
| remeda.sortBy | 4961051 | 0.000 | 2.82× |
| Array.prototype.sort, decorated | 4766067 | 0.000 | 2.94× |
| underscore.sortBy | 3836848 | 0.000 | 3.65× |
| fast-sort | 3831931 | 0.000 | 3.65× |
| ramda.sortWith | 3251580 | 0.000 | 4.31× |
| lodash.orderBy | 3155231 | 0.000 | 4.44× |
| sort-array | 3054401 | 0.000 | 4.58× |
| sort-on | 524147 | 0.002 | 26.71× |
| natural-orderby | 380234 | 0.003 | 36.82× |
| sort-by | 73549 | 0.014 | 190.36× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14058774 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 11730153 | 0.000 | 1.20× |
| inline comparator chain, slice().sort() | 10164773 | 0.000 | 1.38× |
| just-sort-by | 6482388 | 0.000 | 2.17× |
| es-toolkit.orderBy | 5532497 | 0.000 | 2.54× |
| thenby | 5500832 | 0.000 | 2.56× |
| Array.prototype.sort, decorated | 4804472 | 0.000 | 2.93× |
| remeda.sortBy | 4803423 | 0.000 | 2.93× |
| fast-sort | 3996874 | 0.000 | 3.52× |
| underscore.sortBy | 3687279 | 0.000 | 3.81× |
| ramda.sortWith | 3249004 | 0.000 | 4.33× |
| sort-array | 3138190 | 0.000 | 4.48× |
| lodash.orderBy | 3002273 | 0.000 | 4.68× |
| sort-on | 473907 | 0.002 | 29.67× |
| natural-orderby | 378511 | 0.003 | 37.14× |
| sort-by | 71634 | 0.014 | 196.26× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6860957 | 0.000 | 0.61× |
| inline comparator chain, slice().sort() | 6311691 | 0.000 | 0.66× |
| fast-multisort | 4169797 | 0.000 | 1.00× |
| just-sort-by | 3208247 | 0.000 | 1.30× |
| underscore.sortBy | 3003942 | 0.000 | 1.39× |
| thenby | 2924148 | 0.000 | 1.43× |
| remeda.sortBy | 2886948 | 0.000 | 1.44× |
| es-toolkit.orderBy | 2755065 | 0.000 | 1.51× |
| Array.prototype.sort, decorated | 2441539 | 0.000 | 1.71× |
| fast-sort | 2302852 | 0.000 | 1.81× |
| lodash.orderBy | 2151440 | 0.000 | 1.94× |
| ramda.sortWith | 1569884 | 0.001 | 2.66× |
| sort-array | 1378105 | 0.001 | 3.03× |
| natural-orderby | 345166 | 0.003 | 12.08× |
| sort-on | 234833 | 0.004 | 17.76× |
| sort-by | 32096 | 0.031 | 129.92× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4523195 | 0.000 | 0.48× |
| inline comparator chain, slice().sort() | 4354130 | 0.000 | 0.50× |
| fast-multisort | 2173998 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2127700 | 0.000 | 1.02× |
| remeda.sortBy (different order) | 1899351 | 0.001 | 1.14× |
| Array.prototype.sort, decorated | 1898792 | 0.001 | 1.14× |
| thenby (different order) | 1616756 | 0.001 | 1.34× |
| lodash.orderBy | 1471355 | 0.001 | 1.48× |
| fast-sort (different order) | 1185986 | 0.001 | 1.83× |
| ramda.sortWith (different order) | 1122913 | 0.001 | 1.94× |
| sort-array (different order) | 897642 | 0.001 | 2.42× |
| sort-on (different order) | 184436 | 0.005 | 11.79× |
| natural-orderby (different order) | 85970 | 0.012 | 25.29× |
| sort-by (different order) | 26130 | 0.038 | 83.20× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 423155 | 0.002 | 1.00× |
| inline comparator chain, toSorted() | 249415 | 0.004 | 1.70× |
| inline comparator chain, slice().sort() | 237383 | 0.004 | 1.78× |
| underscore.sortBy | 138836 | 0.007 | 3.05× |
| thenby | 115479 | 0.009 | 3.66× |
| lodash.orderBy | 105812 | 0.009 | 4.00× |
| fast-sort | 105222 | 0.010 | 4.02× |
| es-toolkit.orderBy | 104776 | 0.010 | 4.04× |
| Array.prototype.sort, decorated | 93509 | 0.011 | 4.53× |
| remeda.sortBy | 88240 | 0.011 | 4.80× |
| ramda.sortWith | 55519 | 0.018 | 7.62× |
| sort-array | 48382 | 0.021 | 8.75× |
| just-sort-by (different order) | 42216 | 0.024 | 10.02× |
| natural-orderby (different order) | 24889 | 0.040 | 17.00× |
| sort-on (different order) | 9526 | 0.105 | 44.42× |
| sort-by | 1293 | 0.773 | 327.16× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 199140 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 174280 | 0.006 | 1.14× |
| inline comparator chain, slice().sort() | 170301 | 0.006 | 1.17× |
| thenby | 99989 | 0.010 | 1.99× |
| underscore.sortBy | 95118 | 0.011 | 2.09× |
| es-toolkit.orderBy | 89492 | 0.011 | 2.23× |
| fast-sort | 87617 | 0.011 | 2.27× |
| remeda.sortBy | 80487 | 0.012 | 2.47× |
| lodash.orderBy | 74176 | 0.013 | 2.68× |
| Array.prototype.sort, decorated | 73378 | 0.014 | 2.71× |
| ramda.sortWith | 48048 | 0.021 | 4.14× |
| sort-array | 37794 | 0.026 | 5.27× |
| just-sort-by (different order) | 34849 | 0.029 | 5.71× |
| natural-orderby (different order) | 9706 | 0.103 | 20.52× |
| sort-on (different order) | 7805 | 0.128 | 25.52× |
| sort-by | 1215 | 0.823 | 163.90× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 274296 | 0.004 | 0.94× |
| inline comparator chain, slice().sort() | 265313 | 0.004 | 0.97× |
| fast-multisort | 258150 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 170994 | 0.006 | 1.51× |
| just-sort-by (different order) | 150559 | 0.007 | 1.71× |
| fast-sort | 127912 | 0.008 | 2.02× |
| thenby (different order) | 127856 | 0.008 | 2.02× |
| es-toolkit.orderBy | 118929 | 0.008 | 2.17× |
| lodash.orderBy | 107127 | 0.009 | 2.41× |
| remeda.sortBy (different order) | 106619 | 0.009 | 2.42× |
| Array.prototype.sort, decorated | 102811 | 0.010 | 2.51× |
| ramda.sortWith (different order) | 57699 | 0.017 | 4.47× |
| sort-array | 52576 | 0.019 | 4.91× |
| natural-orderby | 27607 | 0.036 | 9.35× |
| sort-on | 9809 | 0.102 | 26.32× |
| sort-by (different order) | 1293 | 0.773 | 199.60× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 272208 | 0.004 | 0.78× |
| inline comparator chain, slice().sort() | 251876 | 0.004 | 0.84× |
| fast-multisort | 211409 | 0.005 | 1.00× |
| underscore.sortBy | 153514 | 0.007 | 1.38× |
| just-sort-by | 119682 | 0.008 | 1.77× |
| thenby | 119547 | 0.008 | 1.77× |
| fast-sort | 106712 | 0.009 | 1.98× |
| es-toolkit.orderBy | 105254 | 0.010 | 2.01× |
| remeda.sortBy | 97589 | 0.010 | 2.17× |
| lodash.orderBy | 97256 | 0.010 | 2.17× |
| Array.prototype.sort, decorated | 88805 | 0.011 | 2.38× |
| ramda.sortWith | 54947 | 0.018 | 3.85× |
| sort-array | 47601 | 0.021 | 4.44× |
| natural-orderby | 23392 | 0.043 | 9.04× |
| sort-on | 8611 | 0.116 | 24.55× |
| sort-by | 1224 | 0.817 | 172.69× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 199712 | 0.005 | 0.76× |
| inline comparator chain, slice().sort() | 192944 | 0.005 | 0.79× |
| fast-multisort | 152233 | 0.007 | 1.00× |
| thenby | 107449 | 0.009 | 1.42× |
| underscore.sortBy | 99235 | 0.010 | 1.53× |
| es-toolkit.orderBy | 94790 | 0.011 | 1.61× |
| fast-sort | 92681 | 0.011 | 1.64× |
| remeda.sortBy | 84272 | 0.012 | 1.81× |
| Array.prototype.sort, decorated | 79647 | 0.013 | 1.91× |
| lodash.orderBy | 77227 | 0.013 | 1.97× |
| just-sort-by | 58243 | 0.017 | 2.61× |
| ramda.sortWith | 49580 | 0.020 | 3.07× |
| sort-array | 42855 | 0.023 | 3.55× |
| natural-orderby | 16711 | 0.060 | 9.11× |
| sort-on | 7353 | 0.136 | 20.70× |
| sort-by | 1217 | 0.822 | 125.10× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1815634 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 1815247 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1506214 | 0.001 | 1.21× |
| just-sort-by | 857898 | 0.001 | 2.12× |
| thenby | 746207 | 0.001 | 2.43× |
| fast-sort | 671809 | 0.001 | 2.70× |
| remeda.sortBy | 659255 | 0.002 | 2.75× |
| es-toolkit.orderBy | 655241 | 0.002 | 2.77× |
| Array.prototype.sort, decorated | 558147 | 0.002 | 3.25× |
| underscore.sortBy | 473843 | 0.002 | 3.83× |
| lodash.orderBy | 386062 | 0.003 | 4.70× |
| ramda.sortWith | 336084 | 0.003 | 5.40× |
| sort-array | 313255 | 0.003 | 5.80× |
| sort-on | 48895 | 0.020 | 37.13× |
| natural-orderby | 35048 | 0.029 | 51.80× |
| sort-by | 6787 | 0.147 | 267.53× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1849088 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 1704473 | 0.001 | 1.08× |
| inline comparator chain, slice().sort() | 1412482 | 0.001 | 1.31× |
| just-sort-by | 846711 | 0.001 | 2.18× |
| thenby | 748786 | 0.001 | 2.47× |
| fast-sort | 698430 | 0.001 | 2.65× |
| es-toolkit.orderBy | 656814 | 0.002 | 2.82× |
| Array.prototype.sort, decorated | 569226 | 0.002 | 3.25× |
| remeda.sortBy | 538564 | 0.002 | 3.43× |
| underscore.sortBy | 450416 | 0.002 | 4.11× |
| lodash.orderBy | 352873 | 0.003 | 5.24× |
| ramda.sortWith | 341241 | 0.003 | 5.42× |
| sort-array | 321755 | 0.003 | 5.75× |
| sort-on | 44137 | 0.023 | 41.89× |
| natural-orderby | 34991 | 0.029 | 52.84× |
| sort-by | 6635 | 0.151 | 278.67× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1084563 | 0.001 | 0.85× |
| inline comparator chain, slice().sort() | 963799 | 0.001 | 0.95× |
| fast-multisort | 919265 | 0.001 | 1.00× |
| just-sort-by | 500566 | 0.002 | 1.84× |
| thenby | 440076 | 0.002 | 2.09× |
| underscore.sortBy | 390576 | 0.003 | 2.35× |
| remeda.sortBy | 389157 | 0.003 | 2.36× |
| fast-sort | 384883 | 0.003 | 2.39× |
| es-toolkit.orderBy | 374916 | 0.003 | 2.45× |
| Array.prototype.sort, decorated | 337893 | 0.003 | 2.72× |
| lodash.orderBy | 294567 | 0.003 | 3.12× |
| ramda.sortWith | 196476 | 0.005 | 4.68× |
| sort-array | 173571 | 0.006 | 5.30× |
| natural-orderby | 34135 | 0.029 | 26.93× |
| sort-on | 29548 | 0.034 | 31.11× |
| sort-by | 3979 | 0.251 | 231.06× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 221692 | 0.005 | 0.70× |
| inline comparator chain, slice().sort() | 214600 | 0.005 | 0.72× |
| fast-multisort | 155088 | 0.006 | 1.00× |
| lodash.orderBy | 86134 | 0.012 | 1.80× |
| es-toolkit.orderBy | 78262 | 0.013 | 1.98× |
| Array.prototype.sort, decorated | 70626 | 0.014 | 2.20× |
| remeda.sortBy (different order) | 68714 | 0.015 | 2.26× |
| thenby (different order) | 67307 | 0.015 | 2.30× |
| fast-sort (different order) | 56005 | 0.018 | 2.77× |
| ramda.sortWith (different order) | 42296 | 0.024 | 3.67× |
| sort-array (different order) | 34738 | 0.029 | 4.46× |
| natural-orderby (different order) | 8270 | 0.121 | 18.75× |
| sort-on (different order) | 7160 | 0.140 | 21.66× |
| sort-by (different order) | 884 | 1.131 | 175.34× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 46142 | 0.022 | 1.00× |
| inline comparator chain, toSorted() | 17551 | 0.057 | 2.63× |
| inline comparator chain, slice().sort() | 17155 | 0.058 | 2.69× |
| underscore.sortBy | 9897 | 0.101 | 4.66× |
| thenby | 8748 | 0.114 | 5.27× |
| fast-sort | 7841 | 0.128 | 5.88× |
| lodash.orderBy | 7723 | 0.129 | 5.97× |
| es-toolkit.orderBy | 7710 | 0.130 | 5.98× |
| Array.prototype.sort, decorated | 7031 | 0.142 | 6.56× |
| remeda.sortBy | 6527 | 0.153 | 7.07× |
| ramda.sortWith | 4307 | 0.232 | 10.71× |
| sort-array | 3868 | 0.259 | 11.93× |
| just-sort-by (different order) | 3079 | 0.325 | 14.99× |
| natural-orderby (different order) | 2251 | 0.444 | 20.50× |
| sort-on (different order) | 745 | 1.343 | 61.95× |
| sort-by | 102 | 9.830 | 453.56× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11754 | 0.085 | 1.00× |
| inline comparator chain, slice().sort() | 8170 | 0.122 | 1.44× |
| inline comparator chain, toSorted() | 8165 | 0.122 | 1.44× |
| underscore.sortBy | 5517 | 0.181 | 2.13× |
| thenby | 5350 | 0.187 | 2.20× |
| es-toolkit.orderBy | 4890 | 0.204 | 2.40× |
| fast-sort | 4820 | 0.207 | 2.44× |
| remeda.sortBy | 4506 | 0.222 | 2.61× |
| lodash.orderBy | 4324 | 0.231 | 2.72× |
| Array.prototype.sort, decorated | 4267 | 0.234 | 2.75× |
| ramda.sortWith | 2849 | 0.351 | 4.13× |
| sort-array | 2374 | 0.421 | 4.95× |
| just-sort-by (different order) | 2252 | 0.444 | 5.22× |
| natural-orderby (different order) | 756 | 1.322 | 15.54× |
| sort-on (different order) | 478 | 2.092 | 24.59× |
| sort-by | 75 | 13.333 | 156.72× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 33803 | 0.030 | 1.00× |
| inline comparator chain, toSorted() | 15520 | 0.064 | 2.18× |
| inline comparator chain, slice().sort() | 15254 | 0.066 | 2.22× |
| underscore.sortBy (different order) | 9896 | 0.101 | 3.42× |
| just-sort-by (different order) | 8208 | 0.122 | 4.12× |
| thenby (different order) | 7614 | 0.131 | 4.44× |
| fast-sort | 7497 | 0.133 | 4.51× |
| es-toolkit.orderBy | 7285 | 0.137 | 4.64× |
| lodash.orderBy | 7021 | 0.142 | 4.81× |
| remeda.sortBy (different order) | 6619 | 0.151 | 5.11× |
| Array.prototype.sort, decorated | 6596 | 0.152 | 5.12× |
| ramda.sortWith (different order) | 3657 | 0.273 | 9.24× |
| sort-array | 3334 | 0.300 | 10.14× |
| natural-orderby | 2338 | 0.428 | 14.46× |
| sort-on | 620 | 1.614 | 54.54× |
| sort-by (different order) | 82 | 12.219 | 413.05× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 31157 | 0.032 | 1.00× |
| inline comparator chain, toSorted() | 12216 | 0.082 | 2.55× |
| inline comparator chain, slice().sort() | 12004 | 0.083 | 2.60× |
| underscore.sortBy | 8594 | 0.116 | 3.63× |
| thenby | 6769 | 0.148 | 4.60× |
| just-sort-by | 6709 | 0.149 | 4.64× |
| fast-sort | 6327 | 0.158 | 4.92× |
| es-toolkit.orderBy | 6120 | 0.163 | 5.09× |
| lodash.orderBy | 6017 | 0.166 | 5.18× |
| remeda.sortBy | 5963 | 0.168 | 5.23× |
| Array.prototype.sort, decorated | 5527 | 0.181 | 5.64× |
| ramda.sortWith | 3369 | 0.297 | 9.25× |
| sort-array | 3008 | 0.332 | 10.36× |
| natural-orderby | 1928 | 0.519 | 16.16× |
| sort-on | 540 | 1.853 | 57.73× |
| sort-by | 77 | 12.938 | 403.10× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11962 | 0.084 | 1.00× |
| inline comparator chain, toSorted() | 9968 | 0.100 | 1.20× |
| inline comparator chain, slice().sort() | 9743 | 0.103 | 1.23× |
| underscore.sortBy | 5899 | 0.170 | 2.03× |
| thenby | 5719 | 0.175 | 2.09× |
| fast-sort | 5340 | 0.187 | 2.24× |
| es-toolkit.orderBy | 5308 | 0.188 | 2.25× |
| remeda.sortBy | 4874 | 0.205 | 2.45× |
| lodash.orderBy | 4663 | 0.214 | 2.57× |
| Array.prototype.sort, decorated | 4640 | 0.216 | 2.58× |
| just-sort-by | 3598 | 0.278 | 3.32× |
| ramda.sortWith | 3056 | 0.327 | 3.91× |
| sort-array | 2688 | 0.372 | 4.45× |
| natural-orderby | 1437 | 0.696 | 8.33× |
| sort-on | 458 | 2.185 | 26.14× |
| sort-by | 75 | 13.277 | 158.83× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 190266 | 0.005 | 0.96× |
| fast-multisort | 182618 | 0.005 | 1.00× |
| inline comparator chain, slice().sort() | 156247 | 0.006 | 1.17× |
| just-sort-by | 88579 | 0.011 | 2.06× |
| thenby | 79107 | 0.013 | 2.31× |
| fast-sort | 72060 | 0.014 | 2.53× |
| remeda.sortBy | 67505 | 0.015 | 2.71× |
| es-toolkit.orderBy | 67261 | 0.015 | 2.72× |
| Array.prototype.sort, decorated | 55296 | 0.018 | 3.30× |
| underscore.sortBy | 48208 | 0.021 | 3.79× |
| lodash.orderBy | 38931 | 0.026 | 4.69× |
| ramda.sortWith | 34171 | 0.029 | 5.34× |
| sort-array | 31168 | 0.032 | 5.86× |
| sort-on | 4861 | 0.206 | 37.57× |
| natural-orderby | 3451 | 0.290 | 52.91× |
| sort-by | 666 | 1.502 | 274.23× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 185597 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 179557 | 0.006 | 1.03× |
| inline comparator chain, slice().sort() | 148818 | 0.007 | 1.25× |
| just-sort-by | 85741 | 0.012 | 2.16× |
| thenby | 77979 | 0.013 | 2.38× |
| fast-sort | 74193 | 0.013 | 2.50× |
| es-toolkit.orderBy | 67018 | 0.015 | 2.77× |
| Array.prototype.sort, decorated | 55794 | 0.018 | 3.33× |
| remeda.sortBy | 54495 | 0.018 | 3.41× |
| underscore.sortBy | 46215 | 0.022 | 4.02× |
| lodash.orderBy | 36504 | 0.027 | 5.08× |
| ramda.sortWith | 33299 | 0.030 | 5.57× |
| sort-array | 32400 | 0.031 | 5.73× |
| sort-on | 4350 | 0.230 | 42.67× |
| natural-orderby | 3445 | 0.290 | 53.87× |
| sort-by | 642 | 1.558 | 289.07× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 160629 | 0.006 | 0.78× |
| inline comparator chain, slice().sort() | 132261 | 0.008 | 0.95× |
| fast-multisort | 125294 | 0.008 | 1.00× |
| just-sort-by | 78902 | 0.013 | 1.59× |
| thenby | 70644 | 0.014 | 1.77× |
| fast-sort | 67261 | 0.015 | 1.86× |
| es-toolkit.orderBy | 61699 | 0.016 | 2.03× |
| remeda.sortBy | 60566 | 0.017 | 2.07× |
| Array.prototype.sort, decorated | 49668 | 0.020 | 2.52× |
| underscore.sortBy | 46263 | 0.022 | 2.71× |
| lodash.orderBy | 37555 | 0.027 | 3.34× |
| ramda.sortWith | 32246 | 0.031 | 3.89× |
| sort-array | 28519 | 0.035 | 4.39× |
| sort-on | 4932 | 0.203 | 25.40× |
| natural-orderby | 3424 | 0.292 | 36.60× |
| sort-by | 663 | 1.507 | 188.88× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12405 | 0.081 | 1.00× |
| inline comparator chain, slice().sort() | 11629 | 0.086 | 1.07× |
| inline comparator chain, toSorted() | 11539 | 0.087 | 1.08× |
| lodash.orderBy | 5339 | 0.187 | 2.32× |
| es-toolkit.orderBy | 4218 | 0.237 | 2.94× |
| Array.prototype.sort, decorated | 4172 | 0.240 | 2.97× |
| thenby (different order) | 3833 | 0.261 | 3.24× |
| remeda.sortBy (different order) | 3701 | 0.270 | 3.35× |
| fast-sort (different order) | 3163 | 0.316 | 3.92× |
| ramda.sortWith (different order) | 2431 | 0.411 | 5.10× |
| sort-array (different order) | 1971 | 0.507 | 6.29× |
| natural-orderby (different order) | 713 | 1.403 | 17.40× |
| sort-on (different order) | 402 | 2.489 | 30.87× |
| sort-by (different order) | 47 | 21.427 | 265.80× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4528 | 0.221 | 1.00× |
| inline comparator chain, toSorted() | 1223 | 0.818 | 3.70× |
| inline comparator chain, slice().sort() | 1189 | 0.841 | 3.81× |
| underscore.sortBy | 826 | 1.211 | 5.48× |
| thenby | 771 | 1.298 | 5.88× |
| fast-sort | 700 | 1.429 | 6.47× |
| es-toolkit.orderBy | 693 | 1.443 | 6.54× |
| lodash.orderBy | 658 | 1.521 | 6.89× |
| Array.prototype.sort, decorated | 620 | 1.614 | 7.31× |
| remeda.sortBy | 574 | 1.742 | 7.89× |
| ramda.sortWith | 399 | 2.506 | 11.35× |
| sort-array | 353 | 2.836 | 12.84× |
| just-sort-by (different order) | 290 | 3.452 | 15.63× |
| natural-orderby (different order) | 202 | 4.947 | 22.40× |
| sort-on (different order) | 71 | 14.113 | 63.91× |
| sort-by | 10 | 103.783 | 469.97× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 797 | 1.254 | 1.00× |
| inline comparator chain, toSorted() | 459 | 2.179 | 1.74× |
| inline comparator chain, slice().sort() | 440 | 2.273 | 1.81× |
| thenby | 346 | 2.893 | 2.31× |
| underscore.sortBy | 345 | 2.896 | 2.31× |
| es-toolkit.orderBy | 324 | 3.084 | 2.46× |
| fast-sort | 321 | 3.111 | 2.48× |
| remeda.sortBy | 304 | 3.290 | 2.62× |
| Array.prototype.sort, decorated | 288 | 3.472 | 2.77× |
| lodash.orderBy | 267 | 3.751 | 2.99× |
| ramda.sortWith | 205 | 4.887 | 3.90× |
| sort-array | 176 | 5.683 | 4.53× |
| just-sort-by (different order) | 159 | 6.293 | 5.02× |
| natural-orderby (different order) | 59 | 17.078 | 13.62× |
| sort-on (different order) | 35 | 28.670 | 22.86× |
| sort-by | 5 | 182.993 | 145.90× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3677 | 0.272 | 1.00× |
| inline comparator chain, toSorted() | 922 | 1.085 | 3.99× |
| inline comparator chain, slice().sort() | 918 | 1.089 | 4.00× |
| underscore.sortBy (different order) | 730 | 1.370 | 5.04× |
| just-sort-by (different order) | 579 | 1.729 | 6.36× |
| thenby (different order) | 574 | 1.742 | 6.41× |
| fast-sort | 556 | 1.799 | 6.61× |
| es-toolkit.orderBy | 525 | 1.905 | 7.00× |
| lodash.orderBy | 494 | 2.026 | 7.45× |
| remeda.sortBy (different order) | 477 | 2.096 | 7.71× |
| Array.prototype.sort, decorated | 463 | 2.161 | 7.94× |
| ramda.sortWith (different order) | 272 | 3.671 | 13.50× |
| sort-array | 254 | 3.931 | 14.45× |
| natural-orderby | 178 | 5.624 | 20.68× |
| sort-on | 46 | 21.770 | 80.05× |
| sort-by (different order) | 6 | 169.558 | 623.44× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3421 | 0.292 | 1.00× |
| inline comparator chain, slice().sort() | 693 | 1.443 | 4.94× |
| inline comparator chain, toSorted() | 690 | 1.449 | 4.96× |
| underscore.sortBy | 621 | 1.609 | 5.51× |
| thenby | 470 | 2.130 | 7.29× |
| just-sort-by | 461 | 2.169 | 7.42× |
| fast-sort | 441 | 2.265 | 7.75× |
| es-toolkit.orderBy | 415 | 2.407 | 8.24× |
| remeda.sortBy | 415 | 2.409 | 8.24× |
| lodash.orderBy | 400 | 2.502 | 8.56× |
| Array.prototype.sort, decorated | 384 | 2.602 | 8.90× |
| ramda.sortWith | 242 | 4.138 | 14.16× |
| sort-array | 218 | 4.580 | 15.67× |
| natural-orderby | 150 | 6.682 | 22.86× |
| sort-on | 39 | 25.525 | 87.33× |
| sort-by | 6 | 179.125 | 612.87× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 751 | 1.332 | 1.00× |
| inline comparator chain, toSorted() | 511 | 1.956 | 1.47× |
| inline comparator chain, slice().sort() | 506 | 1.978 | 1.48× |
| underscore.sortBy | 390 | 2.565 | 1.92× |
| thenby | 376 | 2.660 | 2.00× |
| fast-sort | 359 | 2.783 | 2.09× |
| es-toolkit.orderBy | 355 | 2.813 | 2.11× |
| Array.prototype.sort, decorated | 329 | 3.041 | 2.28× |
| remeda.sortBy | 327 | 3.060 | 2.30× |
| lodash.orderBy | 298 | 3.352 | 2.52× |
| just-sort-by | 255 | 3.918 | 2.94× |
| ramda.sortWith | 213 | 4.700 | 3.53× |
| sort-array | 193 | 5.187 | 3.89× |
| natural-orderby | 115 | 8.701 | 6.53× |
| sort-on | 33 | 30.265 | 22.71× |
| sort-by | 5 | 184.265 | 138.29× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 18710 | 0.053 | 0.97× |
| fast-multisort | 18116 | 0.055 | 1.00× |
| inline comparator chain, slice().sort() | 14809 | 0.068 | 1.22× |
| just-sort-by | 8613 | 0.116 | 2.10× |
| thenby | 7716 | 0.130 | 2.35× |
| fast-sort | 7257 | 0.138 | 2.50× |
| remeda.sortBy | 6655 | 0.150 | 2.72× |
| es-toolkit.orderBy | 6530 | 0.153 | 2.77× |
| Array.prototype.sort, decorated | 5269 | 0.190 | 3.44× |
| underscore.sortBy | 4904 | 0.204 | 3.69× |
| lodash.orderBy | 3771 | 0.265 | 4.80× |
| ramda.sortWith | 3241 | 0.309 | 5.59× |
| sort-array | 3091 | 0.324 | 5.86× |
| sort-on | 484 | 2.067 | 37.44× |
| natural-orderby | 324 | 3.091 | 55.99× |
| sort-by | 66 | 15.063 | 272.88× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 17535 | 0.057 | 0.99× |
| fast-multisort | 17429 | 0.057 | 1.00× |
| inline comparator chain, slice().sort() | 14176 | 0.071 | 1.23× |
| just-sort-by | 8308 | 0.120 | 2.10× |
| thenby | 7803 | 0.128 | 2.23× |
| fast-sort | 7353 | 0.136 | 2.37× |
| es-toolkit.orderBy | 6546 | 0.153 | 2.66× |
| remeda.sortBy | 5442 | 0.184 | 3.20× |
| Array.prototype.sort, decorated | 5442 | 0.184 | 3.20× |
| underscore.sortBy | 4615 | 0.217 | 3.78× |
| lodash.orderBy | 3483 | 0.287 | 5.00× |
| ramda.sortWith | 3305 | 0.303 | 5.27× |
| sort-array | 3204 | 0.312 | 5.44× |
| sort-on | 440 | 2.275 | 39.64× |
| natural-orderby | 324 | 3.087 | 53.81× |
| sort-by | 65 | 15.332 | 267.22× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 16622 | 0.060 | 0.78× |
| inline comparator chain, slice().sort() | 13650 | 0.073 | 0.95× |
| fast-multisort | 12917 | 0.077 | 1.00× |
| just-sort-by | 8300 | 0.120 | 1.56× |
| thenby | 7440 | 0.134 | 1.74× |
| fast-sort | 7079 | 0.141 | 1.82× |
| remeda.sortBy | 6446 | 0.155 | 2.00× |
| es-toolkit.orderBy | 6327 | 0.158 | 2.04× |
| Array.prototype.sort, decorated | 5148 | 0.194 | 2.51× |
| underscore.sortBy | 4697 | 0.213 | 2.75× |
| lodash.orderBy | 3651 | 0.274 | 3.54× |
| ramda.sortWith | 3358 | 0.298 | 3.85× |
| sort-array | 2940 | 0.340 | 4.39× |
| sort-on | 506 | 1.977 | 25.54× |
| natural-orderby | 317 | 3.158 | 40.79× |
| sort-by | 67 | 15.020 | 194.02× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1466 | 0.682 | 1.00× |
| inline comparator chain, toSorted() | 664 | 1.506 | 2.21× |
| inline comparator chain, slice().sort() | 648 | 1.542 | 2.26× |
| lodash.orderBy | 347 | 2.880 | 4.22× |
| es-toolkit.orderBy | 290 | 3.447 | 5.05× |
| Array.prototype.sort, decorated | 288 | 3.478 | 5.10× |
| thenby (different order) | 269 | 3.714 | 5.44× |
| remeda.sortBy (different order) | 252 | 3.973 | 5.83× |
| fast-sort (different order) | 217 | 4.605 | 6.75× |
| ramda.sortWith (different order) | 162 | 6.168 | 9.04× |
| sort-array (different order) | 137 | 7.282 | 10.68× |
| natural-orderby (different order) | 60 | 16.605 | 24.35× |
| sort-on (different order) | 27 | 36.441 | 53.43× |
| sort-by (different order) | 3 | 315.884 | 463.13× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 402 | 2.489 | 1.00× |
| inline comparator chain, toSorted() | 112 | 8.956 | 3.60× |
| inline comparator chain, slice().sort() | 107 | 9.377 | 3.77× |
| underscore.sortBy | 76 | 13.202 | 5.30× |
| thenby | 73 | 13.697 | 5.50× |
| fast-sort | 68 | 14.689 | 5.90× |
| es-toolkit.orderBy | 65 | 15.310 | 6.15× |
| lodash.orderBy | 59 | 16.839 | 6.77× |
| remeda.sortBy | 55 | 18.090 | 7.27× |
| Array.prototype.sort, decorated | 45 | 22.388 | 9.00× |
| ramda.sortWith | 37 | 27.275 | 10.96× |
| sort-array | 34 | 29.017 | 11.66× |
| just-sort-by (different order) | 28 | 35.598 | 14.30× |
| natural-orderby (different order) | 18 | 55.103 | 22.14× |
| sort-on (different order) | 7 | 141.352 | 56.80× |
| sort-by | 1 | 1042.752 | 418.99× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 56 | 17.876 | 1.00× |
| inline comparator chain, toSorted() | 28 | 35.402 | 1.98× |
| inline comparator chain, slice().sort() | 27 | 36.393 | 2.04× |
| thenby | 22 | 46.227 | 2.59× |
| underscore.sortBy | 21 | 47.064 | 2.63× |
| fast-sort | 19 | 51.551 | 2.88× |
| es-toolkit.orderBy | 19 | 52.450 | 2.93× |
| remeda.sortBy | 17 | 57.490 | 3.22× |
| lodash.orderBy | 14 | 69.504 | 3.89× |
| Array.prototype.sort, decorated | 13 | 74.421 | 4.16× |
| ramda.sortWith | 12 | 85.549 | 4.79× |
| sort-array | 11 | 89.121 | 4.99× |
| just-sort-by (different order) | 10 | 101.692 | 5.69× |
| natural-orderby (different order) | 3 | 287.044 | 16.06× |
| sort-on (different order) | 2 | 400.358 | 22.40× |
| sort-by | 0 | 2373.557 | 132.78× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 309 | 3.234 | 1.00× |
| inline comparator chain, toSorted() | 66 | 15.064 | 4.66× |
| inline comparator chain, slice().sort() | 65 | 15.364 | 4.75× |
| underscore.sortBy (different order) | 53 | 18.736 | 5.79× |
| thenby (different order) | 43 | 23.362 | 7.22× |
| fast-sort | 41 | 24.128 | 7.46× |
| just-sort-by (different order) | 40 | 24.959 | 7.72× |
| es-toolkit.orderBy | 38 | 26.345 | 8.15× |
| remeda.sortBy (different order) | 34 | 29.127 | 9.01× |
| lodash.orderBy | 30 | 33.447 | 10.34× |
| Array.prototype.sort, decorated | 28 | 35.472 | 10.97× |
| ramda.sortWith (different order) | 19 | 52.796 | 16.33× |
| sort-array | 19 | 53.372 | 16.50× |
| natural-orderby | 14 | 73.962 | 22.87× |
| sort-on | 3 | 289.413 | 89.49× |
| sort-by (different order) | 0 | 2135.110 | 660.22× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 310 | 3.230 | 1.00× |
| inline comparator chain, toSorted() | 50 | 19.906 | 6.16× |
| inline comparator chain, slice().sort() | 48 | 20.855 | 6.46× |
| underscore.sortBy | 45 | 22.304 | 6.90× |
| thenby | 33 | 30.712 | 9.51× |
| fast-sort | 32 | 30.873 | 9.56× |
| remeda.sortBy | 30 | 33.319 | 10.31× |
| just-sort-by | 29 | 34.165 | 10.58× |
| es-toolkit.orderBy | 29 | 34.231 | 10.60× |
| lodash.orderBy | 25 | 40.652 | 12.58× |
| Array.prototype.sort, decorated | 19 | 51.427 | 15.92× |
| ramda.sortWith | 17 | 58.562 | 18.13× |
| sort-array | 15 | 65.095 | 20.15× |
| natural-orderby | 10 | 100.080 | 30.98× |
| sort-on | 3 | 343.054 | 106.20× |
| sort-by | 0 | 2329.059 | 721.00× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 40 | 24.848 | 1.00× |
| inline comparator chain, toSorted() | 31 | 32.074 | 1.29× |
| inline comparator chain, slice().sort() | 30 | 33.541 | 1.35× |
| underscore.sortBy | 28 | 35.542 | 1.43× |
| thenby | 25 | 40.708 | 1.64× |
| fast-sort | 23 | 44.068 | 1.77× |
| es-toolkit.orderBy | 21 | 47.894 | 1.93× |
| remeda.sortBy | 20 | 50.367 | 2.03× |
| Array.prototype.sort, decorated | 19 | 53.637 | 2.16× |
| just-sort-by | 17 | 58.855 | 2.37× |
| lodash.orderBy | 17 | 60.149 | 2.42× |
| ramda.sortWith | 14 | 70.271 | 2.83× |
| sort-array | 13 | 79.579 | 3.20× |
| natural-orderby | 8 | 124.770 | 5.02× |
| sort-on | 2 | 418.267 | 16.83× |
| sort-by | 0 | 2372.296 | 95.47× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1525 | 0.656 | 0.99× |
| fast-multisort | 1511 | 0.662 | 1.00× |
| inline comparator chain, slice().sort() | 1265 | 0.791 | 1.19× |
| just-sort-by | 756 | 1.322 | 2.00× |
| thenby | 719 | 1.392 | 2.10× |
| fast-sort | 694 | 1.440 | 2.18× |
| es-toolkit.orderBy | 601 | 1.664 | 2.51× |
| remeda.sortBy | 535 | 1.870 | 2.83× |
| underscore.sortBy | 421 | 2.376 | 3.59× |
| ramda.sortWith | 329 | 3.043 | 4.60× |
| Array.prototype.sort, decorated | 327 | 3.060 | 4.63× |
| lodash.orderBy | 304 | 3.292 | 4.98× |
| sort-array | 288 | 3.470 | 5.24× |
| sort-on | 45 | 22.183 | 33.52× |
| natural-orderby | 27 | 37.062 | 56.01× |
| sort-by | 7 | 152.179 | 229.98× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1536 | 0.651 | 1.00× |
| inline comparator chain, toSorted() | 1450 | 0.690 | 1.06× |
| inline comparator chain, slice().sort() | 1213 | 0.824 | 1.27× |
| just-sort-by | 739 | 1.354 | 2.08× |
| thenby | 722 | 1.385 | 2.13× |
| fast-sort | 689 | 1.451 | 2.23× |
| es-toolkit.orderBy | 613 | 1.632 | 2.51× |
| remeda.sortBy | 459 | 2.177 | 3.34× |
| underscore.sortBy | 395 | 2.531 | 3.89× |
| ramda.sortWith | 327 | 3.056 | 4.69× |
| Array.prototype.sort, decorated | 326 | 3.069 | 4.71× |
| sort-array | 291 | 3.438 | 5.28× |
| lodash.orderBy | 281 | 3.559 | 5.47× |
| sort-on | 40 | 24.827 | 38.13× |
| natural-orderby | 27 | 37.386 | 57.42× |
| sort-by | 6 | 155.942 | 239.49× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1476 | 0.677 | 0.75× |
| inline comparator chain, slice().sort() | 1161 | 0.861 | 0.95× |
| fast-multisort | 1102 | 0.907 | 1.00× |
| just-sort-by | 765 | 1.307 | 1.44× |
| thenby | 685 | 1.459 | 1.61× |
| fast-sort | 649 | 1.542 | 1.70× |
| es-toolkit.orderBy | 591 | 1.692 | 1.87× |
| remeda.sortBy | 520 | 1.924 | 2.12× |
| underscore.sortBy | 396 | 2.525 | 2.78× |
| ramda.sortWith | 322 | 3.106 | 3.42× |
| Array.prototype.sort, decorated | 308 | 3.250 | 3.58× |
| lodash.orderBy | 287 | 3.482 | 3.84× |
| sort-array | 262 | 3.811 | 4.20× |
| sort-on | 46 | 21.704 | 23.93× |
| natural-orderby | 26 | 38.053 | 41.95× |
| sort-by | 7 | 150.591 | 166.00× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 134 | 7.479 | 1.00× |
| inline comparator chain, toSorted() | 46 | 21.589 | 2.89× |
| inline comparator chain, slice().sort() | 43 | 23.073 | 3.09× |
| lodash.orderBy | 20 | 48.800 | 6.53× |
| es-toolkit.orderBy | 20 | 49.243 | 6.58× |
| Array.prototype.sort, decorated | 19 | 53.200 | 7.11× |
| thenby (different order) | 18 | 55.314 | 7.40× |
| remeda.sortBy (different order) | 18 | 55.956 | 7.48× |
| fast-sort (different order) | 16 | 63.173 | 8.45× |
| ramda.sortWith (different order) | 12 | 84.752 | 11.33× |
| sort-array (different order) | 10 | 99.515 | 13.31× |
| natural-orderby (different order) | 5 | 204.911 | 27.40× |
| sort-on (different order) | 2 | 498.997 | 66.72× |
| sort-by (different order) | 0 | 4229.394 | 565.54× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 37 | 26.843 | 1.00× |
| inline comparator chain, slice().sort() | 10 | 98.582 | 3.67× |
| inline comparator chain, toSorted() | 10 | 98.613 | 3.67× |
| thenby | 7 | 147.403 | 5.49× |
| fast-sort | 6 | 155.813 | 5.80× |
| underscore.sortBy | 6 | 160.510 | 5.98× |
| es-toolkit.orderBy | 6 | 161.044 | 6.00× |
| remeda.sortBy | 5 | 192.511 | 7.17× |
| lodash.orderBy | 5 | 205.840 | 7.67× |
| Array.prototype.sort, decorated | 5 | 206.977 | 7.71× |
| ramda.sortWith | 4 | 281.183 | 10.47× |
| sort-array | 3 | 298.825 | 11.13× |
| just-sort-by (different order) | 3 | 391.827 | 14.60× |
| natural-orderby (different order) | 1 | 673.482 | 25.09× |
| sort-on (different order) | 1 | 1516.401 | 56.49× |
| sort-by | 0 | 10389.934 | 387.06× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 431.790 | 1.00× |
| inline comparator chain, slice().sort() | 1 | 815.151 | 1.89× |
| inline comparator chain, toSorted() | 1 | 838.007 | 1.94× |
| thenby | 1 | 934.665 | 2.16× |
| underscore.sortBy | 1 | 1059.939 | 2.45× |
| fast-sort | 1 | 1079.474 | 2.50× |
| es-toolkit.orderBy | 1 | 1160.088 | 2.69× |
| remeda.sortBy | 1 | 1212.241 | 2.81× |
| Array.prototype.sort, decorated | 1 | 1466.357 | 3.40× |
| lodash.orderBy | 1 | 1576.678 | 3.65× |
| ramda.sortWith | 1 | 1707.943 | 3.96× |
| sort-array | 1 | 1837.466 | 4.26× |
| just-sort-by (different order) | 0 | 2257.455 | 5.23× |
| natural-orderby (different order) | 0 | 5506.303 | 12.75× |
| sort-on (different order) | 0 | 6027.583 | 13.96× |
| sort-by | 0 | 30191.897 | 69.92× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 23 | 44.030 | 1.00× |
| inline comparator chain, toSorted() | 4 | 241.788 | 5.49× |
| inline comparator chain, slice().sort() | 4 | 256.685 | 5.83× |
| underscore.sortBy (different order) | 4 | 275.637 | 6.26× |
| just-sort-by (different order) | 3 | 379.262 | 8.61× |
| fast-sort | 3 | 387.836 | 8.81× |
| thenby (different order) | 3 | 389.206 | 8.84× |
| es-toolkit.orderBy | 2 | 413.767 | 9.40× |
| remeda.sortBy (different order) | 2 | 426.585 | 9.69× |
| lodash.orderBy | 2 | 658.083 | 14.95× |
| Array.prototype.sort, decorated | 1 | 705.318 | 16.02× |
| ramda.sortWith (different order) | 1 | 829.791 | 18.85× |
| sort-array | 1 | 867.213 | 19.70× |
| natural-orderby | 1 | 1198.588 | 27.22× |
| sort-on | 0 | 3852.144 | 87.49× |
| sort-by (different order) | 0 | 25660.534 | 582.80× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 21 | 46.798 | 1.00× |
| underscore.sortBy | 3 | 363.877 | 7.78× |
| inline comparator chain, toSorted() | 3 | 368.532 | 7.88× |
| inline comparator chain, slice().sort() | 3 | 370.615 | 7.92× |
| fast-sort | 2 | 532.768 | 11.38× |
| thenby | 2 | 536.275 | 11.46× |
| just-sort-by | 2 | 574.610 | 12.28× |
| remeda.sortBy | 2 | 618.896 | 13.22× |
| es-toolkit.orderBy | 2 | 628.522 | 13.43× |
| lodash.orderBy | 1 | 875.382 | 18.71× |
| ramda.sortWith | 1 | 938.791 | 20.06× |
| Array.prototype.sort, decorated | 1 | 963.661 | 20.59× |
| sort-array | 1 | 1097.509 | 23.45× |
| natural-orderby | 1 | 1596.101 | 34.11× |
| sort-on | 0 | 4566.271 | 97.57× |
| sort-by | 0 | 28098.708 | 600.43× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 438.955 | 1.00× |
| inline comparator chain, toSorted() | 2 | 574.961 | 1.31× |
| inline comparator chain, slice().sort() | 2 | 593.075 | 1.35× |
| underscore.sortBy | 1 | 681.725 | 1.55× |
| thenby | 1 | 773.320 | 1.76× |
| fast-sort | 1 | 838.096 | 1.91× |
| es-toolkit.orderBy | 1 | 843.896 | 1.92× |
| remeda.sortBy | 1 | 873.216 | 1.99× |
| Array.prototype.sort, decorated | 1 | 1144.108 | 2.61× |
| lodash.orderBy | 1 | 1175.991 | 2.68× |
| ramda.sortWith | 1 | 1244.547 | 2.84× |
| just-sort-by | 1 | 1246.601 | 2.84× |
| sort-array | 1 | 1409.721 | 3.21× |
| natural-orderby | 0 | 2032.308 | 4.63× |
| sort-on | 0 | 5526.627 | 12.59× |
| sort-by | 0 | 29104.142 | 66.30× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 145 | 6.908 | 0.79× |
| inline comparator chain, slice().sort() | 132 | 7.599 | 0.86× |
| fast-multisort | 114 | 8.785 | 1.00× |
| just-sort-by | 79 | 12.668 | 1.44× |
| fast-sort | 69 | 14.456 | 1.65× |
| thenby | 67 | 15.036 | 1.71× |
| es-toolkit.orderBy | 62 | 16.224 | 1.85× |
| remeda.sortBy | 52 | 19.187 | 2.18× |
| ramda.sortWith | 32 | 30.884 | 3.52× |
| Array.prototype.sort, decorated | 30 | 33.161 | 3.77× |
| sort-array | 28 | 35.170 | 4.00× |
| underscore.sortBy | 25 | 40.302 | 4.59× |
| lodash.orderBy | 19 | 51.556 | 5.87× |
| sort-on | 5 | 206.358 | 23.49× |
| natural-orderby | 3 | 377.950 | 43.02× |
| sort-by | 1 | 1494.064 | 170.07× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 152 | 6.598 | 1.00× |
| inline comparator chain, toSorted() | 126 | 7.945 | 1.20× |
| inline comparator chain, slice().sort() | 99 | 10.108 | 1.53× |
| just-sort-by | 77 | 12.909 | 1.96× |
| thenby | 72 | 13.966 | 2.12× |
| fast-sort | 67 | 14.819 | 2.25× |
| es-toolkit.orderBy | 62 | 16.196 | 2.45× |
| remeda.sortBy | 47 | 21.333 | 3.23× |
| ramda.sortWith | 30 | 33.681 | 5.10× |
| underscore.sortBy | 29 | 33.984 | 5.15× |
| sort-array | 29 | 34.106 | 5.17× |
| Array.prototype.sort, decorated | 28 | 35.637 | 5.40× |
| lodash.orderBy | 18 | 54.327 | 8.23× |
| sort-on | 4 | 237.262 | 35.96× |
| natural-orderby | 3 | 383.540 | 58.13× |
| sort-by | 1 | 1542.460 | 233.77× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 122 | 8.207 | 0.99× |
| fast-multisort | 120 | 8.301 | 1.00× |
| inline comparator chain, slice().sort() | 99 | 10.147 | 1.22× |
| just-sort-by | 78 | 12.756 | 1.54× |
| thenby | 71 | 14.156 | 1.71× |
| fast-sort | 65 | 15.286 | 1.84× |
| es-toolkit.orderBy | 60 | 16.618 | 2.00× |
| remeda.sortBy | 52 | 19.371 | 2.33× |
| ramda.sortWith | 33 | 30.138 | 3.63× |
| sort-array | 26 | 38.623 | 4.65× |
| lodash.orderBy | 20 | 49.883 | 6.01× |
| underscore.sortBy | 18 | 55.509 | 6.69× |
| Array.prototype.sort, decorated | 13 | 77.408 | 9.32× |
| sort-on | 5 | 202.704 | 24.42× |
| natural-orderby | 3 | 377.783 | 45.51× |
| sort-by | 1 | 1498.641 | 180.53× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11 | 87.779 | 1.00× |
| inline comparator chain, slice().sort() | 3 | 353.260 | 4.02× |
| inline comparator chain, toSorted() | 3 | 370.562 | 4.22× |
| es-toolkit.orderBy | 1 | 789.773 | 9.00× |
| thenby (different order) | 1 | 890.968 | 10.15× |
| remeda.sortBy (different order) | 1 | 894.410 | 10.19× |
| lodash.orderBy | 1 | 915.705 | 10.43× |
| Array.prototype.sort, decorated | 1 | 1074.122 | 12.24× |
| fast-sort (different order) | 1 | 1075.050 | 12.25× |
| ramda.sortWith (different order) | 1 | 1326.411 | 15.11× |
| sort-array (different order) | 1 | 1497.553 | 17.06× |
| natural-orderby (different order) | 0 | 2777.643 | 31.64× |
| sort-on (different order) | 0 | 6373.427 | 72.61× |
| sort-by (different order) | 0 | 52406.366 | 597.03× |

</details>

<!-- bench:end -->

### Browsers

Same data, sizes, cases and libraries as above, each result checked against lodash before timing, best competitor per case (`pnpm bench:browsers`). Chromium and WebKit are Playwright's builds; Firefox is the installed `/Applications/Firefox.app` driven over WebDriver BiDi (Playwright's own Firefox build does not start on macOS 27), with Playwright's Firefox as the fallback. Firefox stops at 100k rows: at a million, sort-by and sort-on take minutes per call in SpiderMonkey and one case ran for 44 minutes, while fast-multisort sorts a million rows there in 11 to 674 ms. Apple M5 Max.

<!-- browsers:start -->

#### Chromium 156.0.8078.4

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, slice().sort() | 0.45× | 1.33× | 8.06× | 63 | 0 |
| inline comparator chain, toSorted() | 0.44× | 1.58× | 7.84× | 63 | 0 |
| just-sort-by | 0.41× | 2.01× | 12.13× | 56 | 17 |
| es-toolkit.orderBy | 0.86× | 2.29× | 13.20× | 63 | 0 |
| thenby | 1.07× | 2.78× | 12.03× | 63 | 12 |
| fast-sort | 1.21× | 2.93× | 17.76× | 63 | 6 |
| remeda.sortBy | 1.03× | 3.10× | 13.27× | 63 | 12 |
| Array.prototype.sort, decorated | 1.03× | 3.13× | 18.98× | 63 | 0 |
| underscore.sortBy | 1.27× | 3.51× | 8.22× | 56 | 6 |
| ramda.sortWith | 1.18× | 3.54× | 15.27× | 63 | 12 |
| lodash.orderBy | 1.44× | 4.66× | 17.69× | 63 | 0 |
| sort-array | 1.64× | 5.37× | 23.37× | 63 | 6 |
| natural-orderby | 4.29× | 21.62× | 119.04× | 63 | 17 |
| sort-on | 1.65× | 22.57× | 88.64× | 63 | 17 |
| sort-by | 4.36× | 158.83× | 644.28× | 63 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 363143204 | 0.000 | 0.41× |
| fast-multisort | 148208622 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 108660725 | 0.000 | 1.36× |
| sort-on | 90006524 | 0.000 | 1.65× |
| es-toolkit.orderBy | 90006524 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 67650065 | 0.000 | 2.19× |
| thenby | 48998879 | 0.000 | 3.02× |
| inline comparator chain, toSorted() | 38692841 | 0.000 | 3.83× |
| ramda.sortWith | 37583369 | 0.000 | 3.94× |
| underscore.sortBy | 33716270 | 0.000 | 4.40× |
| remeda.sortBy | 33500831 | 0.000 | 4.42× |
| fast-sort | 33288127 | 0.000 | 4.45× |
| sort-by | 32870721 | 0.000 | 4.51× |
| sort-array | 32164908 | 0.000 | 4.61× |
| lodash.orderBy | 24049908 | 0.000 | 6.16× |
| natural-orderby | 4890746 | 0.000 | 30.30× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 286300614 | 0.000 | 0.49× |
| fast-multisort | 139810133 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104596110 | 0.000 | 1.34× |
| es-toolkit.orderBy | 83220317 | 0.000 | 1.68× |
| sort-on | 83220317 | 0.000 | 1.68× |
| Array.prototype.sort, decorated | 64133089 | 0.000 | 2.18× |
| thenby | 46603378 | 0.000 | 3.00× |
| inline comparator chain, toSorted() | 38130036 | 0.000 | 3.67× |
| ramda.sortWith | 36535749 | 0.000 | 3.83× |
| remeda.sortBy | 33500831 | 0.000 | 4.17× |
| fast-sort | 32066544 | 0.000 | 4.36× |
| sort-by | 31583614 | 0.000 | 4.43× |
| sort-array | 31115015 | 0.000 | 4.49× |
| underscore.sortBy | 30660117 | 0.000 | 4.56× |
| lodash.orderBy | 20321240 | 0.000 | 6.88× |
| natural-orderby | 2035280 | 0.000 | 68.69× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 290263253 | 0.000 | 0.48× |
| fast-multisort | 139345648 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103819406 | 0.000 | 1.34× |
| sort-on | 84562581 | 0.000 | 1.65× |
| es-toolkit.orderBy | 83220317 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 64527754 | 0.000 | 2.16× |
| thenby | 46811429 | 0.000 | 2.98× |
| inline comparator chain, toSorted() | 37854729 | 0.000 | 3.68× |
| ramda.sortWith | 36663496 | 0.000 | 3.80× |
| remeda.sortBy | 33500831 | 0.000 | 4.16× |
| fast-sort | 32066544 | 0.000 | 4.35× |
| sort-by | 31583614 | 0.000 | 4.41× |
| sort-array | 31300776 | 0.000 | 4.45× |
| underscore.sortBy | 30840471 | 0.000 | 4.52× |
| lodash.orderBy | 20321240 | 0.000 | 6.86× |
| natural-orderby | 3661229 | 0.000 | 38.06× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 289262345 | 0.000 | 0.48× |
| fast-multisort | 138425875 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103819406 | 0.000 | 1.33× |
| es-toolkit.orderBy | 83886080 | 0.000 | 1.65× |
| sort-on | 83551872 | 0.000 | 1.66× |
| Array.prototype.sort, decorated | 63937561 | 0.000 | 2.17× |
| thenby | 46397168 | 0.000 | 2.98× |
| inline comparator chain, toSorted() | 37991884 | 0.000 | 3.64× |
| ramda.sortWith | 36921690 | 0.000 | 3.75× |
| remeda.sortBy | 33394140 | 0.000 | 4.15× |
| fast-sort | 32363457 | 0.000 | 4.28× |
| sort-by | 31394491 | 0.000 | 4.41× |
| sort-array | 31300776 | 0.000 | 4.42× |
| underscore.sortBy | 30218329 | 0.000 | 4.58× |
| lodash.orderBy | 20087663 | 0.000 | 6.89× |
| natural-orderby | 3335165 | 0.000 | 41.50× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 283398919 | 0.000 | 0.49× |
| fast-multisort | 138425875 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103819406 | 0.000 | 1.33× |
| es-toolkit.orderBy | 83551872 | 0.000 | 1.66× |
| sort-on | 82891383 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 64329816 | 0.000 | 2.15× |
| thenby | 46603378 | 0.000 | 2.97× |
| inline comparator chain, toSorted() | 37718561 | 0.000 | 3.67× |
| ramda.sortWith | 37052155 | 0.000 | 3.74× |
| remeda.sortBy | 33608205 | 0.000 | 4.12× |
| fast-sort | 32363457 | 0.000 | 4.28× |
| sort-by | 31583614 | 0.000 | 4.38× |
| sort-array | 31394491 | 0.000 | 4.41× |
| underscore.sortBy | 30931445 | 0.000 | 4.48× |
| lodash.orderBy | 20480000 | 0.000 | 6.76× |
| natural-orderby | 2291469 | 0.000 | 60.41× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 286300614 | 0.000 | 0.49× |
| fast-multisort | 139345648 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103819406 | 0.000 | 1.34× |
| es-toolkit.orderBy | 84562581 | 0.000 | 1.65× |
| sort-on | 84562581 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 64726914 | 0.000 | 2.15× |
| thenby | 47446878 | 0.000 | 2.94× |
| inline comparator chain, toSorted() | 37991884 | 0.000 | 3.67× |
| ramda.sortWith | 37183546 | 0.000 | 3.75× |
| remeda.sortBy | 33934498 | 0.000 | 4.11× |
| fast-sort | 32564472 | 0.000 | 4.28× |
| sort-by | 31968780 | 0.000 | 4.36× |
| sort-array | 31488769 | 0.000 | 4.43× |
| underscore.sortBy | 31022959 | 0.000 | 4.49× |
| lodash.orderBy | 20805079 | 0.000 | 6.70× |
| natural-orderby | 4032985 | 0.000 | 34.55× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 286300614 | 0.000 | 0.49× |
| fast-multisort | 139810133 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105120401 | 0.000 | 1.33× |
| sort-on | 84562581 | 0.000 | 1.65× |
| es-toolkit.orderBy | 83886080 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 65331838 | 0.000 | 2.14× |
| thenby | 47662545 | 0.000 | 2.93× |
| inline comparator chain, toSorted() | 38269197 | 0.000 | 3.65× |
| ramda.sortWith | 37315872 | 0.000 | 3.75× |
| remeda.sortBy | 33608205 | 0.000 | 4.16× |
| fast-sort | 32463653 | 0.000 | 4.31× |
| sort-by | 31968780 | 0.000 | 4.37× |
| sort-array | 31488769 | 0.000 | 4.44× |
| underscore.sortBy | 30931445 | 0.000 | 4.52× |
| lodash.orderBy | 20722846 | 0.000 | 6.75× |
| natural-orderby | 4108840 | 0.000 | 34.03× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 288268316 | 0.000 | 0.49× |
| fast-multisort | 140277726 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105120401 | 0.000 | 1.33× |
| es-toolkit.orderBy | 84904939 | 0.000 | 1.65× |
| sort-on | 83886080 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 65536000 | 0.000 | 2.14× |
| thenby | 47233153 | 0.000 | 2.97× |
| inline comparator chain, toSorted() | 38269197 | 0.000 | 3.67× |
| ramda.sortWith | 37315872 | 0.000 | 3.76× |
| remeda.sortBy | 33934498 | 0.000 | 4.13× |
| fast-sort | 32974088 | 0.000 | 4.25× |
| sort-by | 31775030 | 0.000 | 4.41× |
| sort-array | 31394491 | 0.000 | 4.47× |
| underscore.sortBy | 30750029 | 0.000 | 4.56× |
| lodash.orderBy | 20560314 | 0.000 | 6.82× |
| natural-orderby | 3422245 | 0.000 | 40.99× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 139810133 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103819406 | 0.000 | 1.35× |
| sort-on | 84222972 | 0.000 | 1.66× |
| es-toolkit.orderBy | 83886080 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 65948176 | 0.000 | 2.12× |
| inline comparator chain, toSorted() | 38130036 | 0.000 | 3.67× |
| sort-array | 31394491 | 0.000 | 4.45× |
| sort-by | 28187527 | 0.000 | 4.96× |
| ramda.sortWith | 22215593 | 0.000 | 6.29× |
| remeda.sortBy | 18267875 | 0.000 | 7.65× |
| lodash.orderBy | 16231827 | 0.000 | 8.61× |
| thenby | 14285777 | 0.000 | 9.79× |
| fast-sort | 7872192 | 0.000 | 17.76× |
| natural-orderby | 1174480 | 0.001 | 119.04× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 5438672 | 0.000 | 0.90× |
| inline comparator chain, slice().sort() | 5285161 | 0.000 | 0.93× |
| fast-multisort | 4909064 | 0.000 | 1.00× |
| thenby | 4582937 | 0.000 | 1.07× |
| Array.prototype.sort, decorated | 4311579 | 0.000 | 1.14× |
| es-toolkit.orderBy | 4297443 | 0.000 | 1.14× |
| remeda.sortBy | 4283399 | 0.000 | 1.15× |
| fast-sort | 3889377 | 0.000 | 1.26× |
| underscore.sortBy | 3260498 | 0.000 | 1.51× |
| ramda.sortWith | 3006239 | 0.000 | 1.63× |
| sort-array | 2992511 | 0.000 | 1.64× |
| lodash.orderBy | 2340571 | 0.000 | 2.10× |
| just-sort-by (different order) | 1598439 | 0.001 | 3.07× |
| natural-orderby (different order) | 403547 | 0.002 | 12.16× |
| sort-on (different order) | 309132 | 0.003 | 15.88× |
| sort-by | 38935 | 0.026 | 126.08× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4134763 | 0.000 | 0.77× |
| inline comparator chain, slice().sort() | 3983951 | 0.000 | 0.80× |
| fast-multisort | 3196878 | 0.000 | 1.00× |
| thenby | 2861834 | 0.000 | 1.12× |
| remeda.sortBy | 2837056 | 0.000 | 1.13× |
| es-toolkit.orderBy | 2696955 | 0.000 | 1.19× |
| fast-sort | 2642581 | 0.000 | 1.21× |
| underscore.sortBy | 2520615 | 0.000 | 1.27× |
| Array.prototype.sort, decorated | 2120906 | 0.000 | 1.51× |
| ramda.sortWith | 2093802 | 0.000 | 1.53× |
| lodash.orderBy | 1888646 | 0.001 | 1.69× |
| just-sort-by | 1285020 | 0.001 | 2.49× |
| sort-array | 1227266 | 0.001 | 2.60× |
| sort-on | 243086 | 0.004 | 13.15× |
| natural-orderby | 147870 | 0.007 | 21.62× |
| sort-by | 37236 | 0.027 | 85.85× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6586533 | 0.000 | 0.73× |
| inline comparator chain, slice().sort() | 6393756 | 0.000 | 0.75× |
| fast-multisort | 4783650 | 0.000 | 1.00× |
| just-sort-by (different order) | 4369067 | 0.000 | 1.09× |
| thenby (different order) | 3723636 | 0.000 | 1.28× |
| es-toolkit.orderBy | 3495253 | 0.000 | 1.37× |
| remeda.sortBy (different order) | 3458364 | 0.000 | 1.38× |
| underscore.sortBy (different order) | 3196878 | 0.000 | 1.50× |
| fast-sort | 3181359 | 0.000 | 1.50× |
| Array.prototype.sort, decorated | 2742092 | 0.000 | 1.74× |
| ramda.sortWith (different order) | 2708099 | 0.000 | 1.77× |
| lodash.orderBy | 2229116 | 0.000 | 2.15× |
| sort-array | 1614187 | 0.001 | 2.96× |
| natural-orderby | 395749 | 0.003 | 12.09× |
| sort-on | 348596 | 0.003 | 13.72× |
| sort-by (different order) | 42667 | 0.023 | 112.12× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 5577532 | 0.000 | 0.68× |
| inline comparator chain, slice().sort() | 5221992 | 0.000 | 0.73× |
| fast-multisort | 3799188 | 0.000 | 1.00× |
| just-sort-by | 3260498 | 0.000 | 1.17× |
| thenby | 2912711 | 0.000 | 1.30× |
| underscore.sortBy | 2912711 | 0.000 | 1.30× |
| remeda.sortBy | 2899823 | 0.000 | 1.31× |
| es-toolkit.orderBy | 2765232 | 0.000 | 1.37× |
| fast-sort | 2418303 | 0.000 | 1.57× |
| Array.prototype.sort, decorated | 2244384 | 0.000 | 1.69× |
| ramda.sortWith | 2080508 | 0.000 | 1.83× |
| lodash.orderBy | 1899594 | 0.001 | 2.00× |
| sort-array | 1174480 | 0.001 | 3.23× |
| natural-orderby | 331660 | 0.003 | 11.46× |
| sort-on | 248997 | 0.004 | 15.26× |
| sort-by | 34595 | 0.029 | 109.82× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4983726 | 0.000 | 0.64× |
| inline comparator chain, slice().sort() | 4836605 | 0.000 | 0.66× |
| fast-multisort | 3181359 | 0.000 | 1.00× |
| thenby | 2978909 | 0.000 | 1.07× |
| es-toolkit.orderBy | 2861834 | 0.000 | 1.11× |
| remeda.sortBy | 2776949 | 0.000 | 1.15× |
| fast-sort | 2482424 | 0.000 | 1.28× |
| underscore.sortBy | 2436283 | 0.000 | 1.31× |
| Array.prototype.sort, decorated | 2323972 | 0.000 | 1.37× |
| ramda.sortWith | 2275556 | 0.000 | 1.40× |
| just-sort-by | 2010307 | 0.000 | 1.58× |
| lodash.orderBy | 1780870 | 0.001 | 1.79× |
| sort-array | 1354050 | 0.001 | 2.35× |
| sort-on | 248997 | 0.004 | 12.78× |
| natural-orderby | 227556 | 0.004 | 13.98× |
| sort-by | 39084 | 0.026 | 81.40× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14604123 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 9637647 | 0.000 | 1.52× |
| inline comparator chain, slice().sort() | 9165874 | 0.000 | 1.59× |
| just-sort-by | 4714820 | 0.000 | 3.10× |
| remeda.sortBy | 4008318 | 0.000 | 3.64× |
| thenby | 3843754 | 0.000 | 3.80× |
| underscore.sortBy | 3671485 | 0.000 | 3.98× |
| es-toolkit.orderBy | 3640889 | 0.000 | 4.01× |
| fast-sort | 3165990 | 0.000 | 4.61× |
| Array.prototype.sort, decorated | 3048186 | 0.000 | 4.79× |
| ramda.sortWith | 2812704 | 0.000 | 5.19× |
| lodash.orderBy | 2530347 | 0.000 | 5.77× |
| sort-array | 1742979 | 0.001 | 8.38× |
| natural-orderby | 435745 | 0.002 | 33.52× |
| sort-on | 331660 | 0.003 | 44.03× |
| sort-by | 44716 | 0.022 | 326.60× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 15240930 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 6271388 | 0.000 | 2.43× |
| inline comparator chain, slice().sort() | 6040184 | 0.000 | 2.52× |
| just-sort-by | 3671485 | 0.000 | 4.15× |
| thenby | 3244356 | 0.000 | 4.70× |
| es-toolkit.orderBy | 2965430 | 0.000 | 5.14× |
| underscore.sortBy | 2874386 | 0.000 | 5.30× |
| remeda.sortBy | 2812704 | 0.000 | 5.42× |
| fast-sort | 2550039 | 0.000 | 5.98× |
| Array.prototype.sort, decorated | 2473057 | 0.000 | 6.16× |
| ramda.sortWith | 2087134 | 0.000 | 7.30× |
| lodash.orderBy | 1883218 | 0.001 | 8.09× |
| sort-array | 1394383 | 0.001 | 10.93× |
| natural-orderby | 420103 | 0.002 | 36.28× |
| sort-on | 228827 | 0.004 | 66.60× |
| sort-by | 33139 | 0.030 | 459.91× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 7642682 | 0.000 | 0.59× |
| inline comparator chain, slice().sort() | 7363596 | 0.000 | 0.62× |
| fast-multisort | 4535363 | 0.000 | 1.00× |
| just-sort-by | 3777291 | 0.000 | 1.20× |
| underscore.sortBy | 3318278 | 0.000 | 1.37× |
| remeda.sortBy | 3252407 | 0.000 | 1.39× |
| thenby | 3120762 | 0.000 | 1.45× |
| es-toolkit.orderBy | 3048186 | 0.000 | 1.49× |
| Array.prototype.sort, decorated | 2685902 | 0.000 | 1.69× |
| fast-sort | 2590356 | 0.000 | 1.75× |
| ramda.sortWith | 2427259 | 0.000 | 1.87× |
| lodash.orderBy | 2170066 | 0.000 | 2.09× |
| sort-array | 1430917 | 0.001 | 3.17× |
| natural-orderby | 415838 | 0.002 | 10.91× |
| sort-on | 318755 | 0.003 | 14.23× |
| sort-by | 40474 | 0.025 | 112.06× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 5060695 | 0.000 | 0.44× |
| inline comparator chain, slice().sort() | 4983726 | 0.000 | 0.45× |
| es-toolkit.orderBy | 2590356 | 0.000 | 0.86× |
| fast-multisort | 2229116 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 2170066 | 0.000 | 1.03× |
| remeda.sortBy (different order) | 2155789 | 0.000 | 1.03× |
| ramda.sortWith (different order) | 1883218 | 0.001 | 1.18× |
| thenby (different order) | 1883218 | 0.001 | 1.18× |
| fast-sort (different order) | 1582995 | 0.001 | 1.41× |
| lodash.orderBy | 1552986 | 0.001 | 1.44× |
| sort-array (different order) | 1030440 | 0.001 | 2.16× |
| sort-on (different order) | 256000 | 0.004 | 8.71× |
| natural-orderby (different order) | 113778 | 0.009 | 19.59× |
| sort-by (different order) | 34133 | 0.029 | 65.31× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 440430 | 0.002 | 1.00× |
| inline comparator chain, toSorted() | 256000 | 0.004 | 1.72× |
| inline comparator chain, slice().sort() | 248997 | 0.004 | 1.77× |
| underscore.sortBy | 159377 | 0.006 | 2.76× |
| thenby | 127601 | 0.008 | 3.45× |
| fast-sort | 114413 | 0.009 | 3.85× |
| es-toolkit.orderBy | 106945 | 0.009 | 4.12× |
| lodash.orderBy | 106390 | 0.009 | 4.14× |
| Array.prototype.sort, decorated | 102915 | 0.010 | 4.28× |
| remeda.sortBy | 90619 | 0.011 | 4.86× |
| ramda.sortWith | 81920 | 0.012 | 5.38× |
| just-sort-by (different order) | 58017 | 0.017 | 7.59× |
| sort-array | 48995 | 0.020 | 8.99× |
| natural-orderby (different order) | 30659 | 0.033 | 14.37× |
| sort-on (different order) | 12800 | 0.078 | 34.41× |
| sort-by | 1637 | 0.611 | 269.08× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 207392 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 179649 | 0.006 | 1.15× |
| inline comparator chain, slice().sort() | 174298 | 0.006 | 1.19× |
| thenby | 105296 | 0.009 | 1.97× |
| underscore.sortBy | 98462 | 0.010 | 2.11× |
| fast-sort | 96150 | 0.010 | 2.16× |
| es-toolkit.orderBy | 93091 | 0.011 | 2.23× |
| Array.prototype.sort, decorated | 79380 | 0.013 | 2.61× |
| remeda.sortBy | 78769 | 0.013 | 2.63× |
| lodash.orderBy | 72113 | 0.014 | 2.88× |
| ramda.sortWith | 70621 | 0.014 | 2.94× |
| just-sort-by (different order) | 47628 | 0.021 | 4.35× |
| sort-array | 41626 | 0.024 | 4.98× |
| natural-orderby (different order) | 11228 | 0.089 | 18.47× |
| sort-on (different order) | 9961 | 0.100 | 20.82× |
| sort-by | 1553 | 0.644 | 133.51× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 282483 | 0.004 | 0.94× |
| inline comparator chain, slice().sort() | 281512 | 0.004 | 0.94× |
| fast-multisort | 265974 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 169256 | 0.006 | 1.57× |
| just-sort-by (different order) | 155741 | 0.006 | 1.71× |
| thenby (different order) | 130863 | 0.008 | 2.03× |
| fast-sort | 130032 | 0.008 | 2.05× |
| es-toolkit.orderBy | 119766 | 0.008 | 2.22× |
| remeda.sortBy (different order) | 107789 | 0.009 | 2.47× |
| Array.prototype.sort, decorated | 104757 | 0.010 | 2.54× |
| lodash.orderBy | 104490 | 0.010 | 2.55× |
| ramda.sortWith (different order) | 82915 | 0.012 | 3.21× |
| sort-array | 53333 | 0.019 | 4.99× |
| natural-orderby | 33355 | 0.030 | 7.97× |
| sort-on | 13368 | 0.075 | 19.90× |
| sort-by (different order) | 1633 | 0.612 | 162.91× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 252062 | 0.004 | 0.89× |
| inline comparator chain, slice().sort() | 240941 | 0.004 | 0.93× |
| fast-multisort | 223215 | 0.004 | 1.00× |
| underscore.sortBy | 156935 | 0.006 | 1.42× |
| just-sort-by | 112837 | 0.009 | 1.98× |
| thenby | 111608 | 0.009 | 2.00× |
| fast-sort | 103434 | 0.010 | 2.16× |
| remeda.sortBy | 97524 | 0.010 | 2.29× |
| es-toolkit.orderBy | 97062 | 0.010 | 2.30× |
| lodash.orderBy | 93091 | 0.011 | 2.40× |
| Array.prototype.sort, decorated | 89825 | 0.011 | 2.49× |
| ramda.sortWith | 76134 | 0.013 | 2.93× |
| sort-array | 49231 | 0.020 | 4.53× |
| natural-orderby | 28444 | 0.035 | 7.85× |
| sort-on | 11378 | 0.088 | 19.62× |
| sort-by | 1576 | 0.634 | 141.60× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 210051 | 0.005 | 0.73× |
| inline comparator chain, toSorted() | 210051 | 0.005 | 0.73× |
| fast-multisort | 153408 | 0.007 | 1.00× |
| underscore.sortBy | 115056 | 0.009 | 1.33× |
| thenby | 114095 | 0.009 | 1.34× |
| es-toolkit.orderBy | 102400 | 0.010 | 1.50× |
| fast-sort | 102400 | 0.010 | 1.50× |
| Array.prototype.sort, decorated | 90619 | 0.011 | 1.69× |
| remeda.sortBy | 88276 | 0.011 | 1.74× |
| lodash.orderBy | 80630 | 0.012 | 1.90× |
| ramda.sortWith | 74745 | 0.013 | 2.05× |
| just-sort-by | 68495 | 0.015 | 2.24× |
| sort-array | 46126 | 0.022 | 3.33× |
| natural-orderby | 20317 | 0.049 | 7.55× |
| sort-on | 9588 | 0.104 | 16.00× |
| sort-by | 1531 | 0.653 | 100.19× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2267682 | 0.000 | 0.81× |
| inline comparator chain, slice().sort() | 1899594 | 0.001 | 0.97× |
| fast-multisort | 1846085 | 0.001 | 1.00× |
| just-sort-by | 978149 | 0.001 | 1.89× |
| thenby | 869178 | 0.001 | 2.12× |
| fast-sort | 803137 | 0.001 | 2.30× |
| es-toolkit.orderBy | 795340 | 0.001 | 2.32× |
| remeda.sortBy | 769202 | 0.001 | 2.40× |
| Array.prototype.sort, decorated | 583060 | 0.002 | 3.17× |
| underscore.sortBy | 551650 | 0.002 | 3.35× |
| ramda.sortWith | 546133 | 0.002 | 3.38× |
| lodash.orderBy | 422268 | 0.002 | 4.37× |
| sort-array | 321255 | 0.003 | 5.75× |
| sort-on | 65641 | 0.015 | 28.12× |
| natural-orderby | 44138 | 0.023 | 41.83× |
| sort-by | 8505 | 0.118 | 217.06× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2093802 | 0.000 | 0.88× |
| fast-multisort | 1846085 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1752299 | 0.001 | 1.05× |
| just-sort-by | 949797 | 0.001 | 1.94× |
| thenby | 869178 | 0.001 | 2.12× |
| fast-sort | 803137 | 0.001 | 2.30× |
| es-toolkit.orderBy | 799220 | 0.001 | 2.31× |
| remeda.sortBy | 625344 | 0.002 | 2.95× |
| Array.prototype.sort, decorated | 589353 | 0.002 | 3.13× |
| ramda.sortWith | 521783 | 0.002 | 3.54× |
| underscore.sortBy | 505679 | 0.002 | 3.65× |
| lodash.orderBy | 390095 | 0.003 | 4.73× |
| sort-array | 338512 | 0.003 | 5.45× |
| sort-on | 58514 | 0.017 | 31.55× |
| natural-orderby | 44522 | 0.022 | 41.46× |
| sort-by | 8366 | 0.120 | 220.66× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1231880 | 0.001 | 0.65× |
| inline comparator chain, slice().sort() | 1114558 | 0.001 | 0.72× |
| fast-multisort | 797275 | 0.001 | 1.00× |
| just-sort-by | 572867 | 0.002 | 1.39× |
| thenby | 453850 | 0.002 | 1.76× |
| underscore.sortBy | 436907 | 0.002 | 1.82× |
| es-toolkit.orderBy | 420103 | 0.002 | 1.90× |
| remeda.sortBy | 420103 | 0.002 | 1.90× |
| fast-sort | 404543 | 0.002 | 1.97× |
| Array.prototype.sort, decorated | 345654 | 0.003 | 2.31× |
| lodash.orderBy | 310303 | 0.003 | 2.57× |
| ramda.sortWith | 295740 | 0.003 | 2.70× |
| sort-array | 176552 | 0.006 | 4.52× |
| natural-orderby | 42314 | 0.024 | 18.84× |
| sort-on | 40474 | 0.025 | 19.70× |
| sort-by | 5020 | 0.199 | 158.83× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 227556 | 0.004 | 0.63× |
| inline comparator chain, slice().sort() | 225675 | 0.004 | 0.64× |
| fast-multisort | 144225 | 0.007 | 1.00× |
| es-toolkit.orderBy | 88658 | 0.011 | 1.63× |
| lodash.orderBy | 84979 | 0.012 | 1.70× |
| Array.prototype.sort, decorated | 79380 | 0.013 | 1.82× |
| remeda.sortBy (different order) | 69660 | 0.014 | 2.07× |
| thenby (different order) | 69424 | 0.014 | 2.08× |
| ramda.sortWith (different order) | 66065 | 0.015 | 2.18× |
| fast-sort (different order) | 60772 | 0.016 | 2.37× |
| sort-array (different order) | 34830 | 0.029 | 4.14× |
| natural-orderby (different order) | 10323 | 0.097 | 13.97× |
| sort-on (different order) | 9552 | 0.105 | 15.10× |
| sort-by (different order) | 1115 | 0.897 | 129.35× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 43025 | 0.023 | 1.00× |
| inline comparator chain, slice().sort() | 17840 | 0.056 | 2.41× |
| inline comparator chain, toSorted() | 17778 | 0.056 | 2.42× |
| underscore.sortBy | 10987 | 0.091 | 3.92× |
| thenby | 9176 | 0.109 | 4.69× |
| fast-sort | 8477 | 0.118 | 5.08× |
| es-toolkit.orderBy | 7877 | 0.127 | 5.46× |
| lodash.orderBy | 7665 | 0.130 | 5.61× |
| Array.prototype.sort, decorated | 7191 | 0.139 | 5.98× |
| remeda.sortBy | 6564 | 0.152 | 6.55× |
| ramda.sortWith | 6095 | 0.164 | 7.06× |
| just-sort-by (different order) | 4238 | 0.236 | 10.15× |
| sort-array | 3867 | 0.259 | 11.13× |
| natural-orderby (different order) | 2581 | 0.387 | 16.67× |
| sort-on (different order) | 994 | 1.006 | 43.29× |
| sort-by | 128 | 7.825 | 336.67× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13838 | 0.072 | 1.00× |
| inline comparator chain, toSorted() | 9481 | 0.105 | 1.46× |
| inline comparator chain, slice().sort() | 9309 | 0.107 | 1.49× |
| underscore.sortBy | 6154 | 0.162 | 2.25× |
| thenby | 5740 | 0.174 | 2.41× |
| fast-sort | 5333 | 0.188 | 2.59× |
| es-toolkit.orderBy | 5267 | 0.190 | 2.63× |
| remeda.sortBy | 4741 | 0.211 | 2.92× |
| Array.prototype.sort, decorated | 4621 | 0.216 | 2.99× |
| lodash.orderBy | 4491 | 0.223 | 3.08× |
| ramda.sortWith | 4169 | 0.240 | 3.32× |
| just-sort-by (different order) | 2896 | 0.345 | 4.78× |
| sort-array | 2550 | 0.392 | 5.43× |
| natural-orderby (different order) | 872 | 1.147 | 15.87× |
| sort-on (different order) | 613 | 1.631 | 22.57× |
| sort-by | 95 | 10.500 | 145.30× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 33139 | 0.030 | 1.00× |
| inline comparator chain, toSorted() | 14629 | 0.068 | 2.27× |
| inline comparator chain, slice().sort() | 14504 | 0.069 | 2.28× |
| underscore.sortBy (different order) | 9446 | 0.106 | 3.51× |
| just-sort-by (different order) | 7926 | 0.126 | 4.18× |
| fast-sort | 7781 | 0.129 | 4.26× |
| thenby (different order) | 7619 | 0.131 | 4.35× |
| es-toolkit.orderBy | 7232 | 0.138 | 4.58× |
| remeda.sortBy (different order) | 6632 | 0.151 | 5.00× |
| lodash.orderBy | 6581 | 0.152 | 5.04× |
| Array.prototype.sort, decorated | 6497 | 0.154 | 5.10× |
| ramda.sortWith (different order) | 5224 | 0.191 | 6.34× |
| sort-array | 3307 | 0.302 | 10.02× |
| natural-orderby | 2645 | 0.378 | 12.53× |
| sort-on | 853 | 1.172 | 38.83× |
| sort-by (different order) | 101 | 9.925 | 328.91× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30937 | 0.032 | 1.00× |
| inline comparator chain, toSorted() | 10940 | 0.091 | 2.83× |
| inline comparator chain, slice().sort() | 10119 | 0.099 | 3.06× |
| underscore.sortBy | 8449 | 0.118 | 3.66× |
| just-sort-by | 6352 | 0.157 | 4.87× |
| thenby | 6305 | 0.159 | 4.91× |
| fast-sort | 6066 | 0.165 | 5.10× |
| remeda.sortBy | 5926 | 0.169 | 5.22× |
| es-toolkit.orderBy | 5899 | 0.170 | 5.24× |
| lodash.orderBy | 5590 | 0.179 | 5.53× |
| Array.prototype.sort, decorated | 5470 | 0.183 | 5.66× |
| ramda.sortWith | 4621 | 0.216 | 6.69× |
| sort-array | 2963 | 0.337 | 10.44× |
| natural-orderby | 2261 | 0.442 | 13.68× |
| sort-on | 714 | 1.400 | 43.31× |
| sort-by | 97 | 10.350 | 320.19× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 15015 | 0.067 | 1.00× |
| inline comparator chain, toSorted() | 10802 | 0.093 | 1.39× |
| inline comparator chain, slice().sort() | 10622 | 0.094 | 1.41× |
| underscore.sortBy | 6719 | 0.149 | 2.23× |
| thenby | 6009 | 0.166 | 2.50× |
| fast-sort | 5541 | 0.180 | 2.71× |
| es-toolkit.orderBy | 5401 | 0.185 | 2.78× |
| Array.prototype.sort, decorated | 5224 | 0.191 | 2.87× |
| remeda.sortBy | 4981 | 0.201 | 3.01× |
| lodash.orderBy | 4812 | 0.208 | 3.12× |
| ramda.sortWith | 4295 | 0.233 | 3.50× |
| just-sort-by | 4038 | 0.248 | 3.72× |
| sort-array | 2795 | 0.358 | 5.37× |
| natural-orderby | 1744 | 0.573 | 8.61× |
| sort-on | 608 | 1.644 | 24.68× |
| sort-by | 95 | 10.550 | 158.40× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 248242 | 0.004 | 0.74× |
| inline comparator chain, slice().sort() | 203275 | 0.005 | 0.90× |
| fast-multisort | 183677 | 0.005 | 1.00× |
| just-sort-by | 101891 | 0.010 | 1.80× |
| thenby | 89825 | 0.011 | 2.04× |
| fast-sort | 83252 | 0.012 | 2.21× |
| es-toolkit.orderBy | 80314 | 0.012 | 2.29× |
| remeda.sortBy | 77283 | 0.013 | 2.38× |
| Array.prototype.sort, decorated | 58017 | 0.017 | 3.17× |
| underscore.sortBy | 57047 | 0.018 | 3.22× |
| ramda.sortWith | 56110 | 0.018 | 3.27× |
| lodash.orderBy | 43207 | 0.023 | 4.25× |
| sort-array | 31801 | 0.031 | 5.78× |
| sort-on | 6531 | 0.153 | 28.13× |
| natural-orderby | 4399 | 0.227 | 41.76× |
| sort-by | 844 | 1.184 | 217.54× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 228189 | 0.004 | 0.82× |
| fast-multisort | 187032 | 0.005 | 1.00× |
| inline comparator chain, slice().sort() | 183677 | 0.005 | 1.02× |
| just-sort-by | 101386 | 0.010 | 1.84× |
| thenby | 91839 | 0.011 | 2.04× |
| fast-sort | 85690 | 0.012 | 2.18× |
| es-toolkit.orderBy | 82249 | 0.012 | 2.27× |
| remeda.sortBy | 63210 | 0.016 | 2.96× |
| Array.prototype.sort, decorated | 59020 | 0.017 | 3.17× |
| ramda.sortWith | 57690 | 0.017 | 3.24× |
| underscore.sortBy | 52112 | 0.019 | 3.59× |
| lodash.orderBy | 39690 | 0.025 | 4.71× |
| sort-array | 34020 | 0.029 | 5.50× |
| sort-on | 5818 | 0.172 | 32.15× |
| natural-orderby | 4444 | 0.225 | 42.08× |
| sort-by | 833 | 1.200 | 224.44× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 205829 | 0.005 | 0.59× |
| inline comparator chain, slice().sort() | 169256 | 0.006 | 0.71× |
| fast-multisort | 120826 | 0.008 | 1.00× |
| just-sort-by | 91839 | 0.011 | 1.32× |
| thenby | 80949 | 0.012 | 1.49× |
| fast-sort | 74745 | 0.013 | 1.62× |
| es-toolkit.orderBy | 73405 | 0.014 | 1.65× |
| remeda.sortBy | 68956 | 0.015 | 1.75× |
| Array.prototype.sort, decorated | 54324 | 0.018 | 2.22× |
| underscore.sortBy | 53473 | 0.019 | 2.26× |
| ramda.sortWith | 51457 | 0.019 | 2.35× |
| lodash.orderBy | 40960 | 0.024 | 2.95× |
| sort-array | 29174 | 0.034 | 4.14× |
| sort-on | 6772 | 0.148 | 17.84× |
| natural-orderby | 4384 | 0.228 | 27.56× |
| sort-by | 829 | 1.206 | 145.75× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 12133 | 0.082 | 0.99× |
| inline comparator chain, toSorted() | 12133 | 0.082 | 0.99× |
| fast-multisort | 11963 | 0.084 | 1.00× |
| lodash.orderBy | 5203 | 0.192 | 2.30× |
| es-toolkit.orderBy | 4812 | 0.208 | 2.49× |
| Array.prototype.sort, decorated | 4324 | 0.231 | 2.77× |
| thenby (different order) | 3879 | 0.258 | 3.08× |
| remeda.sortBy (different order) | 3855 | 0.259 | 3.10× |
| ramda.sortWith (different order) | 3754 | 0.266 | 3.19× |
| fast-sort (different order) | 3432 | 0.291 | 3.49× |
| sort-array (different order) | 1981 | 0.505 | 6.04× |
| natural-orderby (different order) | 889 | 1.125 | 13.46× |
| sort-on (different order) | 532 | 1.881 | 22.50× |
| sort-by (different order) | 58 | 17.200 | 205.76× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4339 | 0.230 | 1.00× |
| inline comparator chain, slice().sort() | 1236 | 0.809 | 3.51× |
| inline comparator chain, toSorted() | 1231 | 0.813 | 3.53× |
| underscore.sortBy | 882 | 1.134 | 4.92× |
| thenby | 806 | 1.241 | 5.38× |
| fast-sort | 766 | 1.306 | 5.67× |
| es-toolkit.orderBy | 721 | 1.387 | 6.02× |
| Array.prototype.sort, decorated | 632 | 1.581 | 6.86× |
| lodash.orderBy | 632 | 1.581 | 6.86× |
| remeda.sortBy | 599 | 1.669 | 7.24× |
| ramda.sortWith | 569 | 1.756 | 7.62× |
| just-sort-by (different order) | 392 | 2.550 | 11.06× |
| sort-array | 367 | 2.725 | 11.82× |
| natural-orderby (different order) | 242 | 4.125 | 17.90× |
| sort-on (different order) | 95 | 10.550 | 45.78× |
| sort-by | 12 | 82.400 | 357.53× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1139 | 0.878 | 1.00× |
| inline comparator chain, slice().sort() | 472 | 2.119 | 2.41× |
| inline comparator chain, toSorted() | 468 | 2.137 | 2.43× |
| underscore.sortBy | 388 | 2.575 | 2.93× |
| thenby | 362 | 2.762 | 3.15× |
| fast-sort | 345 | 2.900 | 3.30× |
| es-toolkit.orderBy | 340 | 2.938 | 3.35× |
| remeda.sortBy | 317 | 3.150 | 3.59× |
| Array.prototype.sort, decorated | 310 | 3.225 | 3.67× |
| lodash.orderBy | 289 | 3.463 | 3.94× |
| ramda.sortWith | 282 | 3.550 | 4.04× |
| just-sort-by (different order) | 202 | 4.962 | 5.65× |
| sort-array | 182 | 5.500 | 6.26× |
| natural-orderby (different order) | 72 | 13.950 | 15.89× |
| sort-on (different order) | 45 | 22.300 | 25.40× |
| sort-by | 7 | 144.900 | 165.01× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3616 | 0.277 | 1.00× |
| inline comparator chain, toSorted() | 909 | 1.100 | 3.98× |
| inline comparator chain, slice().sort() | 896 | 1.116 | 4.03× |
| underscore.sortBy (different order) | 702 | 1.425 | 5.15× |
| fast-sort | 584 | 1.713 | 6.19× |
| just-sort-by (different order) | 565 | 1.769 | 6.40× |
| thenby (different order) | 552 | 1.813 | 6.55× |
| es-toolkit.orderBy | 528 | 1.894 | 6.85× |
| remeda.sortBy (different order) | 508 | 1.969 | 7.12× |
| Array.prototype.sort, decorated | 478 | 2.094 | 7.57× |
| lodash.orderBy | 465 | 2.150 | 7.77× |
| ramda.sortWith (different order) | 391 | 2.556 | 9.24× |
| sort-array | 245 | 4.075 | 14.73× |
| natural-orderby | 220 | 4.550 | 16.45× |
| sort-on | 62 | 16.050 | 58.03× |
| sort-by (different order) | 7 | 134.100 | 484.88× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3536 | 0.283 | 1.00× |
| inline comparator chain, toSorted() | 664 | 1.506 | 5.33× |
| inline comparator chain, slice().sort() | 643 | 1.556 | 5.50× |
| underscore.sortBy | 630 | 1.587 | 5.61× |
| just-sort-by | 458 | 2.181 | 7.71× |
| thenby | 453 | 2.206 | 7.80× |
| fast-sort | 441 | 2.269 | 8.02× |
| remeda.sortBy | 434 | 2.306 | 8.15× |
| es-toolkit.orderBy | 423 | 2.362 | 8.35× |
| lodash.orderBy | 409 | 2.444 | 8.64× |
| Array.prototype.sort, decorated | 390 | 2.563 | 9.06× |
| ramda.sortWith | 335 | 2.987 | 10.56× |
| sort-array | 218 | 4.588 | 16.22× |
| natural-orderby | 185 | 5.400 | 19.09× |
| sort-on | 52 | 19.050 | 67.36× |
| sort-by | 7 | 142.500 | 503.87× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1085 | 0.922 | 1.00× |
| inline comparator chain, toSorted() | 518 | 1.931 | 2.09× |
| inline comparator chain, slice().sort() | 516 | 1.938 | 2.10× |
| underscore.sortBy | 431 | 2.319 | 2.52× |
| thenby | 390 | 2.563 | 2.78× |
| fast-sort | 370 | 2.700 | 2.93× |
| es-toolkit.orderBy | 365 | 2.737 | 2.97× |
| Array.prototype.sort, decorated | 351 | 2.850 | 3.09× |
| remeda.sortBy | 340 | 2.938 | 3.19× |
| lodash.orderBy | 321 | 3.113 | 3.38× |
| ramda.sortWith | 297 | 3.363 | 3.65× |
| just-sort-by | 285 | 3.512 | 3.81× |
| sort-array | 202 | 4.963 | 5.38× |
| natural-orderby | 149 | 6.700 | 7.27× |
| sort-on | 44 | 22.900 | 24.84× |
| sort-by | 7 | 145.200 | 157.51× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 24976 | 0.040 | 0.74× |
| inline comparator chain, slice().sort() | 20000 | 0.050 | 0.93× |
| fast-multisort | 18551 | 0.054 | 1.00× |
| just-sort-by | 10364 | 0.096 | 1.79× |
| thenby | 9176 | 0.109 | 2.02× |
| fast-sort | 8477 | 0.118 | 2.19× |
| es-toolkit.orderBy | 8076 | 0.124 | 2.30× |
| remeda.sortBy | 7853 | 0.127 | 2.36× |
| Array.prototype.sort, decorated | 5872 | 0.170 | 3.16× |
| underscore.sortBy | 5714 | 0.175 | 3.25× |
| ramda.sortWith | 5714 | 0.175 | 3.25× |
| lodash.orderBy | 4324 | 0.231 | 4.29× |
| sort-array | 3265 | 0.306 | 5.68× |
| sort-on | 661 | 1.513 | 28.06× |
| natural-orderby | 423 | 2.362 | 43.83× |
| sort-by | 85 | 11.700 | 217.04× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 22960 | 0.044 | 0.80× |
| inline comparator chain, slice().sort() | 18551 | 0.054 | 0.99× |
| fast-multisort | 18351 | 0.054 | 1.00× |
| just-sort-by | 10079 | 0.099 | 1.82× |
| thenby | 9110 | 0.110 | 2.01× |
| fast-sort | 8533 | 0.117 | 2.15× |
| es-toolkit.orderBy | 8153 | 0.123 | 2.25× |
| remeda.sortBy | 6368 | 0.157 | 2.88× |
| Array.prototype.sort, decorated | 5872 | 0.170 | 3.13× |
| ramda.sortWith | 5664 | 0.177 | 3.24× |
| underscore.sortBy | 5141 | 0.195 | 3.57× |
| lodash.orderBy | 4013 | 0.249 | 4.57× |
| sort-array | 3395 | 0.295 | 5.41× |
| sort-on | 586 | 1.706 | 31.31× |
| natural-orderby | 413 | 2.419 | 44.39× |
| sort-by | 82 | 12.150 | 222.97× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 21695 | 0.046 | 0.62× |
| inline comparator chain, slice().sort() | 17595 | 0.057 | 0.76× |
| fast-multisort | 13368 | 0.075 | 1.00× |
| just-sort-by | 9552 | 0.105 | 1.40× |
| thenby | 8562 | 0.117 | 1.56× |
| fast-sort | 7829 | 0.128 | 1.71× |
| es-toolkit.orderBy | 7507 | 0.133 | 1.78× |
| remeda.sortBy | 7314 | 0.137 | 1.83× |
| Array.prototype.sort, decorated | 5541 | 0.180 | 2.41× |
| underscore.sortBy | 5401 | 0.185 | 2.48× |
| ramda.sortWith | 5311 | 0.188 | 2.52× |
| lodash.orderBy | 4103 | 0.244 | 3.26× |
| sort-array | 3048 | 0.328 | 4.39× |
| sort-on | 693 | 1.444 | 19.30× |
| natural-orderby | 410 | 2.438 | 32.58× |
| sort-by | 84 | 11.850 | 158.41× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1475 | 0.678 | 1.00× |
| inline comparator chain, slice().sort() | 693 | 1.444 | 2.13× |
| inline comparator chain, toSorted() | 684 | 1.463 | 2.16× |
| lodash.orderBy | 360 | 2.775 | 4.09× |
| es-toolkit.orderBy | 331 | 3.025 | 4.46× |
| Array.prototype.sort, decorated | 295 | 3.388 | 5.00× |
| thenby (different order) | 279 | 3.588 | 5.29× |
| remeda.sortBy (different order) | 270 | 3.700 | 5.46× |
| ramda.sortWith (different order) | 262 | 3.813 | 5.62× |
| fast-sort (different order) | 237 | 4.213 | 6.21× |
| sort-array (different order) | 141 | 7.100 | 10.47× |
| natural-orderby (different order) | 79 | 12.600 | 18.58× |
| sort-on (different order) | 37 | 26.800 | 39.52× |
| sort-by (different order) | 4 | 252.600 | 372.50× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 440 | 2.275 | 1.00× |
| inline comparator chain, slice().sort() | 110 | 9.125 | 4.01× |
| inline comparator chain, toSorted() | 110 | 9.125 | 4.01× |
| underscore.sortBy | 78 | 12.800 | 5.63× |
| thenby | 76 | 13.150 | 5.78× |
| fast-sort | 74 | 13.450 | 5.91× |
| es-toolkit.orderBy | 69 | 14.400 | 6.33× |
| lodash.orderBy | 58 | 17.100 | 7.52× |
| Array.prototype.sort, decorated | 58 | 17.300 | 7.60× |
| remeda.sortBy | 57 | 17.550 | 7.71× |
| ramda.sortWith | 56 | 18.000 | 7.91× |
| just-sort-by (different order) | 36 | 27.600 | 12.13× |
| sort-array | 35 | 28.200 | 12.40× |
| natural-orderby (different order) | 21 | 47.000 | 20.66× |
| sort-on (different order) | 9 | 108.900 | 47.87× |
| sort-by | 1 | 849.300 | 373.32× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 80 | 12.450 | 1.00× |
| inline comparator chain, slice().sort() | 32 | 31.200 | 2.51× |
| inline comparator chain, toSorted() | 32 | 31.300 | 2.51× |
| underscore.sortBy | 28 | 36.000 | 2.89× |
| thenby | 24 | 42.500 | 3.41× |
| es-toolkit.orderBy | 23 | 42.700 | 3.43× |
| fast-sort | 23 | 43.300 | 3.48× |
| remeda.sortBy | 21 | 47.300 | 3.80× |
| Array.prototype.sort, decorated | 19 | 51.400 | 4.13× |
| ramda.sortWith | 19 | 52.900 | 4.25× |
| lodash.orderBy | 19 | 53.100 | 4.27× |
| just-sort-by (different order) | 13 | 79.600 | 6.39× |
| sort-array | 12 | 80.200 | 6.44× |
| natural-orderby (different order) | 4 | 223.200 | 17.93× |
| sort-on (different order) | 3 | 309.100 | 24.83× |
| sort-by | 1 | 1892.800 | 152.03× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 376 | 2.662 | 1.00× |
| inline comparator chain, slice().sort() | 69 | 14.450 | 5.43× |
| inline comparator chain, toSorted() | 69 | 14.550 | 5.46× |
| underscore.sortBy (different order) | 56 | 17.850 | 6.70× |
| fast-sort | 44 | 22.600 | 8.49× |
| just-sort-by (different order) | 44 | 22.800 | 8.56× |
| thenby (different order) | 43 | 23.500 | 8.83× |
| es-toolkit.orderBy | 40 | 25.000 | 9.39× |
| remeda.sortBy (different order) | 38 | 26.300 | 9.88× |
| lodash.orderBy | 37 | 27.300 | 10.25× |
| Array.prototype.sort, decorated | 33 | 30.000 | 11.27× |
| ramda.sortWith (different order) | 30 | 33.600 | 12.62× |
| sort-array | 19 | 52.000 | 19.53× |
| natural-orderby | 17 | 60.300 | 22.65× |
| sort-on | 5 | 203.400 | 76.39× |
| sort-by (different order) | 1 | 1715.400 | 644.28× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 336 | 2.975 | 1.00× |
| underscore.sortBy | 47 | 21.100 | 7.09× |
| inline comparator chain, toSorted() | 46 | 21.900 | 7.36× |
| inline comparator chain, slice().sort() | 44 | 22.800 | 7.66× |
| thenby | 31 | 32.200 | 10.82× |
| fast-sort | 30 | 33.500 | 11.26× |
| es-toolkit.orderBy | 29 | 34.000 | 11.43× |
| just-sort-by | 29 | 34.200 | 11.50× |
| lodash.orderBy | 29 | 34.600 | 11.63× |
| remeda.sortBy | 28 | 36.300 | 12.20× |
| ramda.sortWith | 24 | 42.500 | 14.29× |
| Array.prototype.sort, decorated | 22 | 45.700 | 15.36× |
| sort-array | 15 | 68.500 | 23.03× |
| natural-orderby | 14 | 71.900 | 24.17× |
| sort-on | 4 | 263.700 | 88.64× |
| sort-by | 1 | 1868.800 | 628.17× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 66 | 15.200 | 1.00× |
| inline comparator chain, toSorted() | 35 | 28.300 | 1.86× |
| inline comparator chain, slice().sort() | 35 | 28.800 | 1.89× |
| underscore.sortBy | 30 | 33.800 | 2.22× |
| thenby | 28 | 35.400 | 2.33× |
| es-toolkit.orderBy | 26 | 38.300 | 2.52× |
| fast-sort | 26 | 38.400 | 2.53× |
| remeda.sortBy | 24 | 42.300 | 2.78× |
| Array.prototype.sort, decorated | 22 | 45.300 | 2.98× |
| ramda.sortWith | 21 | 46.700 | 3.07× |
| just-sort-by | 20 | 50.100 | 3.30× |
| lodash.orderBy | 19 | 51.400 | 3.38× |
| sort-array | 15 | 67.200 | 4.42× |
| natural-orderby | 11 | 93.000 | 6.12× |
| sort-on | 3 | 307.400 | 20.22× |
| sort-by | 1 | 1900.800 | 125.05× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2452 | 0.408 | 0.74× |
| inline comparator chain, slice().sort() | 1945 | 0.514 | 0.93× |
| fast-multisort | 1803 | 0.555 | 1.00× |
| just-sort-by | 899 | 1.112 | 2.01× |
| thenby | 894 | 1.119 | 2.02× |
| fast-sort | 825 | 1.212 | 2.19× |
| es-toolkit.orderBy | 784 | 1.275 | 2.30× |
| remeda.sortBy | 773 | 1.294 | 2.33× |
| ramda.sortWith | 554 | 1.806 | 3.26× |
| underscore.sortBy | 554 | 1.806 | 3.26× |
| Array.prototype.sort, decorated | 460 | 2.175 | 3.92× |
| lodash.orderBy | 386 | 2.588 | 4.66× |
| sort-array | 319 | 3.137 | 5.66× |
| sort-on | 65 | 15.400 | 27.76× |
| natural-orderby | 35 | 28.700 | 51.74× |
| sort-by | 8 | 118.600 | 213.81× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2222 | 0.450 | 0.79× |
| inline comparator chain, slice().sort() | 1788 | 0.559 | 0.98× |
| fast-multisort | 1758 | 0.569 | 1.00× |
| just-sort-by | 941 | 1.063 | 1.87× |
| thenby | 904 | 1.106 | 1.95× |
| fast-sort | 847 | 1.181 | 2.08× |
| es-toolkit.orderBy | 818 | 1.222 | 2.15× |
| remeda.sortBy | 620 | 1.612 | 2.84× |
| ramda.sortWith | 554 | 1.806 | 3.18× |
| underscore.sortBy | 516 | 1.938 | 3.41× |
| Array.prototype.sort, decorated | 435 | 2.300 | 4.04× |
| lodash.orderBy | 359 | 2.787 | 4.90× |
| sort-array | 328 | 3.050 | 5.36× |
| sort-on | 57 | 17.550 | 30.86× |
| natural-orderby | 35 | 28.600 | 50.29× |
| sort-by | 8 | 121.600 | 213.80× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2032 | 0.492 | 0.65× |
| inline comparator chain, slice().sort() | 1662 | 0.602 | 0.80× |
| fast-multisort | 1322 | 0.756 | 1.00× |
| just-sort-by | 914 | 1.094 | 1.45× |
| thenby | 838 | 1.194 | 1.58× |
| fast-sort | 769 | 1.300 | 1.72× |
| es-toolkit.orderBy | 755 | 1.325 | 1.75× |
| remeda.sortBy | 724 | 1.381 | 1.83× |
| ramda.sortWith | 541 | 1.850 | 2.45× |
| underscore.sortBy | 533 | 1.875 | 2.48× |
| Array.prototype.sort, decorated | 400 | 2.500 | 3.31× |
| lodash.orderBy | 367 | 2.725 | 3.60× |
| sort-array | 301 | 3.325 | 4.40× |
| sort-on | 68 | 14.650 | 19.37× |
| natural-orderby | 35 | 28.900 | 38.21× |
| sort-by | 8 | 117.700 | 155.64× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 142 | 7.050 | 1.00× |
| inline comparator chain, toSorted() | 49 | 20.600 | 2.92× |
| inline comparator chain, slice().sort() | 48 | 20.650 | 2.93× |
| lodash.orderBy | 25 | 39.800 | 5.65× |
| es-toolkit.orderBy | 24 | 41.200 | 5.84× |
| Array.prototype.sort, decorated | 21 | 47.700 | 6.77× |
| thenby (different order) | 21 | 48.200 | 6.84× |
| remeda.sortBy (different order) | 20 | 50.100 | 7.11× |
| ramda.sortWith (different order) | 20 | 50.100 | 7.11× |
| fast-sort (different order) | 18 | 54.800 | 7.77× |
| sort-array (different order) | 11 | 92.900 | 13.18× |
| natural-orderby (different order) | 7 | 152.400 | 21.62× |
| sort-on (different order) | 3 | 367.700 | 52.16× |
| sort-by (different order) | 0 | 3386.800 | 480.40× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 40 | 24.700 | 1.00× |
| inline comparator chain, slice().sort() | 10 | 97.200 | 3.94× |
| inline comparator chain, toSorted() | 10 | 97.600 | 3.95× |
| underscore.sortBy | 8 | 133.000 | 5.38× |
| thenby | 7 | 138.400 | 5.60× |
| fast-sort | 7 | 140.600 | 5.69× |
| es-toolkit.orderBy | 7 | 146.800 | 5.94× |
| remeda.sortBy | 6 | 176.700 | 7.15× |
| ramda.sortWith | 5 | 182.900 | 7.40× |
| lodash.orderBy | 5 | 183.600 | 7.43× |
| Array.prototype.sort, decorated | 5 | 185.400 | 7.51× |
| just-sort-by (different order) | 4 | 276.600 | 11.20× |
| sort-array | 4 | 283.700 | 11.49× |
| natural-orderby (different order) | 2 | 475.100 | 19.23× |
| sort-on (different order) | 1 | 1090.500 | 44.15× |
| sort-by | 0 | 8298.100 | 335.96× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5 | 203.100 | 1.00× |
| inline comparator chain, toSorted() | 2 | 644.100 | 3.17× |
| inline comparator chain, slice().sort() | 1 | 685.900 | 3.38× |
| underscore.sortBy | 1 | 732.600 | 3.61× |
| thenby | 1 | 857.000 | 4.22× |
| es-toolkit.orderBy | 1 | 868.300 | 4.28× |
| fast-sort | 1 | 921.000 | 4.53× |
| remeda.sortBy | 1 | 929.800 | 4.58× |
| ramda.sortWith | 1 | 1019.400 | 5.02× |
| Array.prototype.sort, decorated | 1 | 1210.600 | 5.96× |
| lodash.orderBy | 1 | 1234.500 | 6.08× |
| sort-array | 1 | 1510.800 | 7.44× |
| just-sort-by (different order) | 1 | 1590.600 | 7.83× |
| natural-orderby (different order) | 0 | 4178.600 | 20.57× |
| sort-on (different order) | 0 | 4406.100 | 21.69× |
| sort-by | 0 | 23823.400 | 117.30× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 28 | 36.100 | 1.00× |
| inline comparator chain, toSorted() | 4 | 235.300 | 6.52× |
| inline comparator chain, slice().sort() | 4 | 241.700 | 6.70× |
| underscore.sortBy (different order) | 4 | 248.800 | 6.89× |
| fast-sort | 3 | 348.500 | 9.65× |
| thenby (different order) | 3 | 349.700 | 9.69× |
| just-sort-by (different order) | 3 | 352.900 | 9.78× |
| es-toolkit.orderBy | 3 | 365.900 | 10.14× |
| remeda.sortBy (different order) | 2 | 408.000 | 11.30× |
| ramda.sortWith (different order) | 2 | 473.100 | 13.11× |
| lodash.orderBy | 2 | 483.200 | 13.39× |
| Array.prototype.sort, decorated | 2 | 542.400 | 15.02× |
| sort-array | 1 | 746.600 | 20.68× |
| natural-orderby | 1 | 983.100 | 27.23× |
| sort-on | 0 | 2663.500 | 73.78× |
| sort-by (different order) | 0 | 20965.000 | 580.75× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 25 | 40.300 | 1.00× |
| inline comparator chain, toSorted() | 3 | 316.000 | 7.84× |
| inline comparator chain, slice().sort() | 3 | 325.000 | 8.06× |
| underscore.sortBy | 3 | 331.200 | 8.22× |
| just-sort-by | 2 | 470.600 | 11.68× |
| thenby | 2 | 484.900 | 12.03× |
| fast-sort | 2 | 491.100 | 12.19× |
| es-toolkit.orderBy | 2 | 532.000 | 13.20× |
| remeda.sortBy | 2 | 534.600 | 13.27× |
| ramda.sortWith | 2 | 615.300 | 15.27× |
| lodash.orderBy | 1 | 713.100 | 17.69× |
| Array.prototype.sort, decorated | 1 | 764.900 | 18.98× |
| sort-array | 1 | 942.000 | 23.37× |
| natural-orderby | 1 | 1148.800 | 28.51× |
| sort-on | 0 | 3285.500 | 81.53× |
| sort-by | 0 | 22760.700 | 564.78× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 329.500 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 517.900 | 1.57× |
| inline comparator chain, toSorted() | 2 | 520.600 | 1.58× |
| underscore.sortBy | 2 | 582.100 | 1.77× |
| thenby | 1 | 668.800 | 2.03× |
| es-toolkit.orderBy | 1 | 730.300 | 2.22× |
| fast-sort | 1 | 756.900 | 2.30× |
| ramda.sortWith | 1 | 793.000 | 2.41× |
| just-sort-by | 1 | 802.900 | 2.44× |
| remeda.sortBy | 1 | 818.300 | 2.48× |
| lodash.orderBy | 1 | 897.700 | 2.72× |
| Array.prototype.sort, decorated | 1 | 922.300 | 2.80× |
| sort-array | 1 | 1210.000 | 3.67× |
| natural-orderby | 1 | 1415.200 | 4.29× |
| sort-on | 0 | 4173.600 | 12.67× |
| sort-by | 0 | 23709.200 | 71.96× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 219 | 4.563 | 0.61× |
| inline comparator chain, slice().sort() | 156 | 6.425 | 0.86× |
| fast-multisort | 134 | 7.450 | 1.00× |
| just-sort-by | 98 | 10.250 | 1.38× |
| thenby | 83 | 12.050 | 1.62× |
| fast-sort | 80 | 12.550 | 1.68× |
| es-toolkit.orderBy | 76 | 13.150 | 1.77× |
| remeda.sortBy | 74 | 13.500 | 1.81× |
| ramda.sortWith | 52 | 19.150 | 2.57× |
| underscore.sortBy | 36 | 27.400 | 3.68× |
| Array.prototype.sort, decorated | 34 | 29.300 | 3.93× |
| sort-array | 31 | 32.100 | 4.31× |
| lodash.orderBy | 25 | 40.000 | 5.37× |
| sort-on | 6 | 155.500 | 20.87× |
| natural-orderby | 3 | 297.000 | 39.87× |
| sort-by | 1 | 1187.700 | 159.42× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 199 | 5.025 | 0.87× |
| fast-multisort | 172 | 5.800 | 1.00× |
| inline comparator chain, slice().sort() | 144 | 6.925 | 1.19× |
| just-sort-by | 93 | 10.750 | 1.85× |
| thenby | 83 | 12.050 | 2.08× |
| fast-sort | 81 | 12.350 | 2.13× |
| es-toolkit.orderBy | 78 | 12.850 | 2.22× |
| remeda.sortBy | 58 | 17.100 | 2.95× |
| ramda.sortWith | 53 | 18.700 | 3.22× |
| Array.prototype.sort, decorated | 34 | 29.700 | 5.12× |
| sort-array | 33 | 30.100 | 5.19× |
| underscore.sortBy | 29 | 34.300 | 5.91× |
| lodash.orderBy | 23 | 43.100 | 7.43× |
| sort-on | 6 | 176.300 | 30.40× |
| natural-orderby | 3 | 292.600 | 50.45× |
| sort-by | 1 | 1218.800 | 210.14× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 208 | 4.800 | 0.51× |
| inline comparator chain, slice().sort() | 145 | 6.900 | 0.73× |
| fast-multisort | 106 | 9.400 | 1.00× |
| just-sort-by | 92 | 10.850 | 1.15× |
| thenby | 86 | 11.600 | 1.23× |
| fast-sort | 78 | 12.850 | 1.37× |
| es-toolkit.orderBy | 75 | 13.350 | 1.42× |
| remeda.sortBy | 71 | 14.000 | 1.49× |
| ramda.sortWith | 52 | 19.300 | 2.05× |
| underscore.sortBy | 35 | 28.450 | 3.03× |
| sort-array | 29 | 34.400 | 3.66× |
| lodash.orderBy | 24 | 42.100 | 4.48× |
| Array.prototype.sort, decorated | 13 | 79.400 | 8.45× |
| sort-on | 7 | 146.200 | 15.55× |
| natural-orderby | 3 | 295.000 | 31.38× |
| sort-by | 1 | 1172.900 | 124.78× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13 | 75.000 | 1.00× |
| inline comparator chain, slice().sort() | 3 | 318.700 | 4.25× |
| inline comparator chain, toSorted() | 3 | 320.300 | 4.27× |
| es-toolkit.orderBy | 2 | 629.400 | 8.39× |
| lodash.orderBy | 1 | 731.500 | 9.75× |
| ramda.sortWith (different order) | 1 | 743.300 | 9.91× |
| thenby (different order) | 1 | 755.800 | 10.08× |
| remeda.sortBy (different order) | 1 | 776.900 | 10.36× |
| Array.prototype.sort, decorated | 1 | 901.000 | 12.01× |
| fast-sort (different order) | 1 | 908.300 | 12.11× |
| sort-array (different order) | 1 | 1360.300 | 18.14× |
| natural-orderby (different order) | 0 | 2080.300 | 27.74× |
| sort-on (different order) | 0 | 4761.000 | 63.48× |
| sort-by (different order) | 0 | 42472.400 | 566.30× |

</details>

#### WebKit 27.2

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, toSorted() | 0.43× | 1.37× | 6.51× | 63 | 0 |
| inline comparator chain, slice().sort() | 0.43× | 1.52× | 6.49× | 63 | 0 |
| thenby | 0.33× | 2.42× | 10.51× | 63 | 12 |
| just-sort-by | 0.31× | 2.56× | 18.78× | 56 | 17 |
| es-toolkit.orderBy | 0.37× | 2.56× | 11.27× | 63 | 0 |
| fast-sort | 0.39× | 2.92× | 10.48× | 63 | 6 |
| remeda.sortBy | 0.83× | 3.20× | 10.62× | 63 | 12 |
| underscore.sortBy | 0.66× | 3.30× | 9.14× | 56 | 6 |
| ramda.sortWith | 0.69× | 3.36× | 12.92× | 63 | 12 |
| Array.prototype.sort, decorated | 0.66× | 3.45× | 19.27× | 63 | 0 |
| sort-array | 1.49× | 4.55× | 21.13× | 63 | 6 |
| lodash.orderBy | 1.49× | 5.79× | 25.19× | 63 | 0 |
| natural-orderby | 7.77× | 25.08× | 164.57× | 63 | 19 |
| sort-on | 1.14× | 27.87× | 115.43× | 63 | 17 |
| sort-by | 4.91× | 99.56× | 862.32× | 63 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 279620267 | 0.000 | 0.34× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 83886080 | 0.000 | 1.14× |
| inline comparator chain, slice().sort() | 69905067 | 0.000 | 1.36× |
| sort-on | 67650065 | 0.000 | 1.41× |
| es-toolkit.orderBy | 61680941 | 0.000 | 1.55× |
| thenby | 38836148 | 0.000 | 2.45× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 2.91× |
| ramda.sortWith | 28339892 | 0.000 | 3.36× |
| fast-sort | 26214400 | 0.000 | 3.64× |
| sort-array | 23831273 | 0.000 | 4.00× |
| underscore.sortBy | 21845333 | 0.000 | 4.36× |
| sort-by | 19418074 | 0.000 | 4.91× |
| remeda.sortBy | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 16384000 | 0.000 | 5.82× |
| natural-orderby | 5041231 | 0.000 | 18.91× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.31× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 83886080 | 0.000 | 1.14× |
| sort-on | 83886080 | 0.000 | 1.14× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.45× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.59× |
| thenby | 41943040 | 0.000 | 2.27× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 2.91× |
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
| just-sort-by | 310689185 | 0.000 | 0.31× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| sort-on | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.45× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.59× |
| thenby | 40329846 | 0.000 | 2.36× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.00× |
| ramda.sortWith | 28339892 | 0.000 | 3.36× |
| fast-sort | 26214400 | 0.000 | 3.64× |
| underscore.sortBy | 23831273 | 0.000 | 4.00× |
| sort-array | 22795130 | 0.000 | 4.18× |
| remeda.sortBy | 19418074 | 0.000 | 4.91× |
| sort-by | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15887515 | 0.000 | 6.00× |
| natural-orderby | 3276800 | 0.000 | 29.09× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.32× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| sort-on | 83886080 | 0.000 | 1.19× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.24× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.52× |
| es-toolkit.orderBy | 58254222 | 0.000 | 1.71× |
| thenby | 40329846 | 0.000 | 2.48× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.14× |
| ramda.sortWith | 28339892 | 0.000 | 3.52× |
| fast-sort | 26214400 | 0.000 | 3.81× |
| sort-array | 22795130 | 0.000 | 4.38× |
| underscore.sortBy | 22795130 | 0.000 | 4.38× |
| remeda.sortBy | 19418074 | 0.000 | 5.14× |
| sort-by | 19418074 | 0.000 | 5.14× |
| lodash.orderBy | 15420235 | 0.000 | 6.48× |
| natural-orderby | 2978909 | 0.000 | 33.52× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.32× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| sort-on | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.45× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.59× |
| thenby | 41943040 | 0.000 | 2.27× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.00× |
| ramda.sortWith | 27594105 | 0.000 | 3.45× |
| fast-sort | 26214400 | 0.000 | 3.64× |
| sort-array | 22795130 | 0.000 | 4.18× |
| underscore.sortBy | 22795130 | 0.000 | 4.18× |
| sort-by | 19418074 | 0.000 | 4.91× |
| remeda.sortBy | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15420235 | 0.000 | 6.18× |
| natural-orderby | 936229 | 0.001 | 101.82× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.31× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 83886080 | 0.000 | 1.14× |
| sort-on | 83886080 | 0.000 | 1.14× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.45× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.59× |
| thenby | 40329846 | 0.000 | 2.36× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 2.91× |
| ramda.sortWith | 28339892 | 0.000 | 3.36× |
| fast-sort | 26886564 | 0.000 | 3.55× |
| underscore.sortBy | 23831273 | 0.000 | 4.00× |
| sort-array | 22795130 | 0.000 | 4.18× |
| sort-by | 19418074 | 0.000 | 4.91× |
| remeda.sortBy | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15420235 | 0.000 | 6.18× |
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
| Array.prototype.sort, decorated | 36157793 | 0.000 | 2.76× |
| ramda.sortWith | 28339892 | 0.000 | 3.52× |
| fast-sort | 26214400 | 0.000 | 3.81× |
| sort-array | 23831273 | 0.000 | 4.19× |
| underscore.sortBy | 23831273 | 0.000 | 4.19× |
| remeda.sortBy | 19418074 | 0.000 | 5.14× |
| sort-by | 19418074 | 0.000 | 5.14× |
| lodash.orderBy | 14979657 | 0.000 | 6.67× |
| natural-orderby | 4096000 | 0.000 | 24.38× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 310689185 | 0.000 | 0.32× |
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.24× |
| sort-on | 80659692 | 0.000 | 1.24× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.52× |
| es-toolkit.orderBy | 58254222 | 0.000 | 1.71× |
| thenby | 41943040 | 0.000 | 2.38× |
| Array.prototype.sort, decorated | 34952533 | 0.000 | 2.86× |
| ramda.sortWith | 27594105 | 0.000 | 3.62× |
| fast-sort | 26214400 | 0.000 | 3.81× |
| underscore.sortBy | 23831273 | 0.000 | 4.19× |
| sort-array | 22795130 | 0.000 | 4.38× |
| remeda.sortBy | 18724571 | 0.000 | 5.33× |
| sort-by | 18724571 | 0.000 | 5.33× |
| lodash.orderBy | 14979657 | 0.000 | 6.67× |
| natural-orderby | 3276800 | 0.000 | 30.48× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 83886080 | 0.000 | 1.19× |
| sort-on | 80659692 | 0.000 | 1.24× |
| inline comparator chain, slice().sort() | 67650065 | 0.000 | 1.48× |
| es-toolkit.orderBy | 59918629 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 34952533 | 0.000 | 2.86× |
| fast-sort | 22795130 | 0.000 | 4.38× |
| sort-array | 22795130 | 0.000 | 4.38× |
| ramda.sortWith | 20971520 | 0.000 | 4.76× |
| sort-by | 18078897 | 0.000 | 5.52× |
| thenby | 17476267 | 0.000 | 5.71× |
| lodash.orderBy | 15887515 | 0.000 | 6.29× |
| remeda.sortBy | 10922667 | 0.000 | 9.14× |
| natural-orderby | 606815 | 0.002 | 164.57× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 7084973 | 0.000 | 0.74× |
| thenby | 5698783 | 0.000 | 0.92× |
| fast-multisort | 5242880 | 0.000 | 1.00× |
| es-toolkit.orderBy | 5041231 | 0.000 | 1.04× |
| Array.prototype.sort, decorated | 5041231 | 0.000 | 1.04× |
| inline comparator chain, toSorted() | 4854519 | 0.000 | 1.08× |
| fast-sort | 4369067 | 0.000 | 1.20× |
| underscore.sortBy | 4228129 | 0.000 | 1.24× |
| remeda.sortBy | 3360821 | 0.000 | 1.56× |
| ramda.sortWith | 3276800 | 0.000 | 1.60× |
| lodash.orderBy | 2259862 | 0.000 | 2.32× |
| sort-array | 1985939 | 0.001 | 2.64× |
| just-sort-by (different order) | 1092267 | 0.001 | 4.80× |
| natural-orderby (different order) | 372364 | 0.003 | 14.08× |
| sort-on (different order) | 264258 | 0.004 | 19.84× |
| sort-by | 68267 | 0.015 | 76.80× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 6241524 | 0.000 | 0.72× |
| thenby | 5242880 | 0.000 | 0.86× |
| es-toolkit.orderBy | 4854519 | 0.000 | 0.93× |
| inline comparator chain, toSorted() | 4681143 | 0.000 | 0.97× |
| fast-multisort | 4519724 | 0.000 | 1.00× |
| fast-sort | 4228129 | 0.000 | 1.07× |
| Array.prototype.sort, decorated | 3855059 | 0.000 | 1.17× |
| underscore.sortBy | 3542486 | 0.000 | 1.28× |
| ramda.sortWith | 3276800 | 0.000 | 1.38× |
| remeda.sortBy | 3120762 | 0.000 | 1.45× |
| lodash.orderBy | 2184533 | 0.000 | 2.07× |
| sort-array | 1680410 | 0.001 | 2.69× |
| just-sort-by | 1057032 | 0.001 | 4.28× |
| sort-on | 227556 | 0.004 | 19.86× |
| natural-orderby | 157538 | 0.006 | 28.69× |
| sort-by | 66065 | 0.015 | 68.41× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 13797053 | 0.000 | 0.43× |
| just-sort-by (different order) | 12483048 | 0.000 | 0.48× |
| inline comparator chain, toSorted() | 8456258 | 0.000 | 0.70× |
| es-toolkit.orderBy | 8456258 | 0.000 | 0.70× |
| thenby (different order) | 8192000 | 0.000 | 0.73× |
| fast-sort | 6898526 | 0.000 | 0.86× |
| fast-multisort | 5957818 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 5698783 | 0.000 | 1.05× |
| underscore.sortBy (different order) | 4681143 | 0.000 | 1.27× |
| remeda.sortBy (different order) | 4519724 | 0.000 | 1.32× |
| ramda.sortWith (different order) | 4096000 | 0.000 | 1.45× |
| sort-array | 2978909 | 0.000 | 2.00× |
| lodash.orderBy | 2427259 | 0.000 | 2.45× |
| natural-orderby | 390095 | 0.003 | 15.27× |
| sort-on | 327680 | 0.003 | 18.18× |
| sort-by (different order) | 68267 | 0.015 | 87.27× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 7281778 | 0.000 | 0.49× |
| inline comparator chain, toSorted() | 6898526 | 0.000 | 0.51× |
| thenby | 6553600 | 0.000 | 0.54× |
| just-sort-by | 6553600 | 0.000 | 0.54× |
| fast-sort | 5957818 | 0.000 | 0.59× |
| es-toolkit.orderBy | 5461333 | 0.000 | 0.65× |
| remeda.sortBy | 4096000 | 0.000 | 0.86× |
| fast-multisort | 3542486 | 0.000 | 1.00× |
| ramda.sortWith | 2849391 | 0.000 | 1.24× |
| underscore.sortBy | 2621440 | 0.000 | 1.35× |
| Array.prototype.sort, decorated | 2520615 | 0.000 | 1.41× |
| sort-array | 1771243 | 0.001 | 2.00× |
| lodash.orderBy | 1213630 | 0.001 | 2.92× |
| natural-orderby | 341333 | 0.003 | 10.38× |
| sort-on | 215579 | 0.005 | 16.43× |
| sort-by | 44522 | 0.022 | 79.57× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4519724 | 0.000 | 0.66× |
| inline comparator chain, toSorted() | 4519724 | 0.000 | 0.66× |
| thenby | 4519724 | 0.000 | 0.66× |
| es-toolkit.orderBy | 4228129 | 0.000 | 0.70× |
| fast-sort | 3744914 | 0.000 | 0.80× |
| remeda.sortBy | 3120762 | 0.000 | 0.95× |
| fast-multisort | 2978909 | 0.000 | 1.00× |
| ramda.sortWith | 2978909 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 2427259 | 0.000 | 1.23× |
| underscore.sortBy | 2114065 | 0.000 | 1.41× |
| just-sort-by | 1724632 | 0.001 | 1.73× |
| sort-array | 1638400 | 0.001 | 1.82× |
| lodash.orderBy | 1365333 | 0.001 | 2.18× |
| sort-on | 221405 | 0.005 | 13.45× |
| natural-orderby | 89043 | 0.011 | 33.45× |
| sort-by | 58514 | 0.017 | 50.91× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 31775030 | 0.000 | 1.00× |
| es-toolkit.orderBy | 16384000 | 0.000 | 1.94× |
| thenby | 16384000 | 0.000 | 1.94× |
| inline comparator chain, slice().sort() | 13797053 | 0.000 | 2.30× |
| inline comparator chain, toSorted() | 13107200 | 0.000 | 2.42× |
| fast-sort | 12483048 | 0.000 | 2.55× |
| just-sort-by | 12483048 | 0.000 | 2.55× |
| Array.prototype.sort, decorated | 9039448 | 0.000 | 3.52× |
| ramda.sortWith | 8456258 | 0.000 | 3.76× |
| underscore.sortBy | 7943758 | 0.000 | 4.00× |
| remeda.sortBy | 5957818 | 0.000 | 5.33× |
| sort-array | 4854519 | 0.000 | 6.55× |
| lodash.orderBy | 3276800 | 0.000 | 9.70× |
| sort-on | 630154 | 0.002 | 50.42× |
| natural-orderby | 512000 | 0.002 | 62.06× |
| sort-by | 170667 | 0.006 | 186.18× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 27594105 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 13107200 | 0.000 | 2.11× |
| inline comparator chain, toSorted() | 13107200 | 0.000 | 2.11× |
| just-sort-by | 11915636 | 0.000 | 2.32× |
| remeda.sortBy | 5957818 | 0.000 | 4.63× |
| underscore.sortBy | 5242880 | 0.000 | 5.26× |
| thenby | 5041231 | 0.000 | 5.47× |
| sort-array | 4854519 | 0.000 | 5.68× |
| fast-sort | 4681143 | 0.000 | 5.89× |
| es-toolkit.orderBy | 4228129 | 0.000 | 6.53× |
| Array.prototype.sort, decorated | 2978909 | 0.000 | 9.26× |
| ramda.sortWith | 2259862 | 0.000 | 12.21× |
| lodash.orderBy | 1560381 | 0.001 | 17.68× |
| sort-on | 546133 | 0.002 | 50.53× |
| natural-orderby | 431158 | 0.002 | 64.00× |
| sort-by | 32000 | 0.031 | 862.32× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| thenby | 11397565 | 0.000 | 0.33× |
| es-toolkit.orderBy | 10082462 | 0.000 | 0.37× |
| fast-sort | 9709037 | 0.000 | 0.39× |
| inline comparator chain, slice().sort() | 7710118 | 0.000 | 0.49× |
| inline comparator chain, toSorted() | 7084973 | 0.000 | 0.53× |
| just-sort-by | 6898526 | 0.000 | 0.54× |
| Array.prototype.sort, decorated | 5698783 | 0.000 | 0.66× |
| underscore.sortBy | 5698783 | 0.000 | 0.66× |
| ramda.sortWith | 5461333 | 0.000 | 0.69× |
| remeda.sortBy | 4519724 | 0.000 | 0.83× |
| fast-multisort | 3744914 | 0.000 | 1.00× |
| lodash.orderBy | 2520615 | 0.000 | 1.49× |
| sort-array | 2520615 | 0.000 | 1.49× |
| natural-orderby | 481882 | 0.002 | 7.77× |
| sort-on | 273067 | 0.004 | 13.71× |
| sort-by | 110703 | 0.009 | 33.83× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4681143 | 0.000 | 0.52× |
| inline comparator chain, toSorted() | 4519724 | 0.000 | 0.54× |
| es-toolkit.orderBy | 3120762 | 0.000 | 0.78× |
| Array.prototype.sort, decorated | 2849391 | 0.000 | 0.85× |
| fast-multisort | 2427259 | 0.000 | 1.00× |
| remeda.sortBy (different order) | 2259862 | 0.000 | 1.07× |
| thenby (different order) | 2259862 | 0.000 | 1.07× |
| ramda.sortWith (different order) | 1927529 | 0.001 | 1.26× |
| fast-sort (different order) | 1724632 | 0.001 | 1.41× |
| lodash.orderBy | 1489455 | 0.001 | 1.63× |
| sort-array (different order) | 1424696 | 0.001 | 1.70× |
| sort-on (different order) | 221405 | 0.005 | 10.96× |
| natural-orderby (different order) | 62061 | 0.016 | 39.11× |
| sort-by (different order) | 51200 | 0.020 | 47.41× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 564966 | 0.002 | 1.00× |
| inline comparator chain, slice().sort() | 264258 | 0.004 | 2.14× |
| inline comparator chain, toSorted() | 264258 | 0.004 | 2.14× |
| thenby | 157538 | 0.006 | 3.59× |
| underscore.sortBy | 151704 | 0.007 | 3.72× |
| Array.prototype.sort, decorated | 141241 | 0.007 | 4.00× |
| fast-sort | 124121 | 0.008 | 4.55× |
| es-toolkit.orderBy | 113778 | 0.009 | 4.97× |
| remeda.sortBy | 113778 | 0.009 | 4.97× |
| lodash.orderBy | 97524 | 0.010 | 5.79× |
| ramda.sortWith | 89043 | 0.011 | 6.34× |
| sort-array | 89043 | 0.011 | 6.34× |
| just-sort-by (different order) | 42667 | 0.023 | 13.24× |
| natural-orderby (different order) | 26947 | 0.037 | 20.97× |
| sort-on (different order) | 11636 | 0.086 | 48.55× |
| sort-by | 2783 | 0.359 | 203.03× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 264258 | 0.004 | 1.00× |
| inline comparator chain, toSorted() | 248242 | 0.004 | 1.06× |
| inline comparator chain, slice().sort() | 240941 | 0.004 | 1.10× |
| thenby | 128000 | 0.008 | 2.06× |
| underscore.sortBy | 117029 | 0.009 | 2.26× |
| fast-sort | 107789 | 0.009 | 2.45× |
| es-toolkit.orderBy | 102400 | 0.010 | 2.58× |
| remeda.sortBy | 102400 | 0.010 | 2.58× |
| Array.prototype.sort, decorated | 102400 | 0.010 | 2.58× |
| ramda.sortWith | 85333 | 0.012 | 3.10× |
| lodash.orderBy | 73143 | 0.014 | 3.61× |
| sort-array | 68267 | 0.015 | 3.87× |
| just-sort-by (different order) | 35310 | 0.028 | 7.48× |
| natural-orderby (different order) | 11636 | 0.086 | 22.71× |
| sort-on (different order) | 9481 | 0.105 | 27.87× |
| sort-by | 2667 | 0.375 | 99.10× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 455111 | 0.002 | 0.78× |
| inline comparator chain, toSorted() | 455111 | 0.002 | 0.78× |
| fast-multisort | 356174 | 0.003 | 1.00× |
| underscore.sortBy (different order) | 273067 | 0.004 | 1.30× |
| just-sort-by (different order) | 195048 | 0.005 | 1.83× |
| thenby (different order) | 186182 | 0.005 | 1.91× |
| Array.prototype.sort, decorated | 186182 | 0.005 | 1.91× |
| fast-sort | 178087 | 0.006 | 2.00× |
| es-toolkit.orderBy | 163840 | 0.006 | 2.17× |
| remeda.sortBy (different order) | 163840 | 0.006 | 2.17× |
| lodash.orderBy | 132129 | 0.008 | 2.70× |
| sort-array | 120471 | 0.008 | 2.96× |
| ramda.sortWith (different order) | 113778 | 0.009 | 3.13× |
| natural-orderby | 34133 | 0.029 | 10.43× |
| sort-on | 12190 | 0.082 | 29.22× |
| sort-by (different order) | 2909 | 0.344 | 122.43× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 431158 | 0.002 | 0.79× |
| inline comparator chain, toSorted() | 420103 | 0.002 | 0.81× |
| fast-multisort | 341333 | 0.003 | 1.00× |
| underscore.sortBy | 178087 | 0.006 | 1.92× |
| just-sort-by | 170667 | 0.006 | 2.00× |
| Array.prototype.sort, decorated | 146286 | 0.007 | 2.33× |
| thenby | 141241 | 0.007 | 2.42× |
| remeda.sortBy | 128000 | 0.008 | 2.67× |
| fast-sort | 124121 | 0.008 | 2.75× |
| es-toolkit.orderBy | 120471 | 0.008 | 2.83× |
| ramda.sortWith | 97524 | 0.010 | 3.50× |
| sort-array | 85333 | 0.012 | 4.00× |
| lodash.orderBy | 75852 | 0.013 | 4.50× |
| natural-orderby | 29257 | 0.034 | 11.67× |
| sort-on | 9846 | 0.102 | 34.67× |
| sort-by | 2783 | 0.359 | 122.67× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 221405 | 0.005 | 0.77× |
| inline comparator chain, toSorted() | 221405 | 0.005 | 0.77× |
| fast-multisort | 170667 | 0.006 | 1.00× |
| underscore.sortBy | 110703 | 0.009 | 1.54× |
| Array.prototype.sort, decorated | 107789 | 0.009 | 1.58× |
| thenby | 102400 | 0.010 | 1.67× |
| remeda.sortBy | 97524 | 0.010 | 1.75× |
| fast-sort | 97524 | 0.010 | 1.75× |
| es-toolkit.orderBy | 93091 | 0.011 | 1.83× |
| ramda.sortWith | 89043 | 0.011 | 1.92× |
| lodash.orderBy | 73143 | 0.014 | 2.33× |
| sort-array | 70621 | 0.014 | 2.42× |
| just-sort-by | 60235 | 0.017 | 2.83× |
| sort-on | 9143 | 0.109 | 18.67× |
| natural-orderby | 8258 | 0.121 | 20.67× |
| sort-by | 2667 | 0.375 | 64.00× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 2114065 | 0.000 | 0.74× |
| inline comparator chain, toSorted() | 2114065 | 0.000 | 0.74× |
| fast-multisort | 1560381 | 0.001 | 1.00× |
| just-sort-by | 1213630 | 0.001 | 1.29× |
| fast-sort | 992970 | 0.001 | 1.57× |
| es-toolkit.orderBy | 885622 | 0.001 | 1.76× |
| thenby | 885622 | 0.001 | 1.76× |
| remeda.sortBy | 744727 | 0.001 | 2.10× |
| Array.prototype.sort, decorated | 744727 | 0.001 | 2.10× |
| underscore.sortBy | 744727 | 0.001 | 2.10× |
| ramda.sortWith | 712348 | 0.001 | 2.19× |
| sort-array | 655360 | 0.002 | 2.38× |
| lodash.orderBy | 356174 | 0.003 | 4.38× |
| sort-on | 58514 | 0.017 | 26.67× |
| natural-orderby | 40960 | 0.024 | 38.10× |
| sort-by | 15059 | 0.066 | 103.62× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 2048000 | 0.000 | 0.64× |
| inline comparator chain, toSorted() | 2048000 | 0.000 | 0.64× |
| fast-multisort | 1310720 | 0.001 | 1.00× |
| just-sort-by | 1170286 | 0.001 | 1.12× |
| thenby | 1057032 | 0.001 | 1.24× |
| fast-sort | 963765 | 0.001 | 1.36× |
| es-toolkit.orderBy | 885622 | 0.001 | 1.48× |
| Array.prototype.sort, decorated | 780190 | 0.001 | 1.68× |
| remeda.sortBy | 712348 | 0.001 | 1.84× |
| ramda.sortWith | 712348 | 0.001 | 1.84× |
| underscore.sortBy | 712348 | 0.001 | 1.84× |
| sort-array | 655360 | 0.002 | 2.00× |
| lodash.orderBy | 341333 | 0.003 | 3.84× |
| sort-on | 48762 | 0.021 | 26.88× |
| natural-orderby | 40960 | 0.024 | 32.00× |
| sort-by | 14629 | 0.068 | 89.60× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 992970 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 992970 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 936229 | 0.001 | 1.06× |
| just-sort-by | 885622 | 0.001 | 1.12× |
| thenby | 780190 | 0.001 | 1.27× |
| fast-sort | 712348 | 0.001 | 1.39× |
| es-toolkit.orderBy | 630154 | 0.002 | 1.58× |
| Array.prototype.sort, decorated | 606815 | 0.002 | 1.64× |
| underscore.sortBy | 585143 | 0.002 | 1.70× |
| remeda.sortBy | 564966 | 0.002 | 1.76× |
| ramda.sortWith | 512000 | 0.002 | 1.94× |
| sort-array | 468114 | 0.002 | 2.12× |
| lodash.orderBy | 282483 | 0.004 | 3.52× |
| sort-on | 44522 | 0.022 | 22.30× |
| natural-orderby | 42667 | 0.023 | 23.27× |
| sort-by | 11130 | 0.090 | 89.21× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 221405 | 0.005 | 0.77× |
| inline comparator chain, toSorted() | 221405 | 0.005 | 0.77× |
| fast-multisort | 170667 | 0.006 | 1.00× |
| Array.prototype.sort, decorated | 120471 | 0.008 | 1.42× |
| es-toolkit.orderBy | 113778 | 0.009 | 1.50× |
| remeda.sortBy (different order) | 107789 | 0.009 | 1.58× |
| thenby (different order) | 89043 | 0.011 | 1.92× |
| lodash.orderBy | 85333 | 0.012 | 2.00× |
| fast-sort (different order) | 81920 | 0.012 | 2.08× |
| ramda.sortWith (different order) | 73143 | 0.014 | 2.33× |
| sort-array (different order) | 60235 | 0.017 | 2.83× |
| sort-on (different order) | 8000 | 0.125 | 21.33× |
| natural-orderby (different order) | 5818 | 0.172 | 29.33× |
| sort-by (different order) | 1882 | 0.531 | 90.67× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 53895 | 0.019 | 1.00× |
| inline comparator chain, slice().sort() | 18963 | 0.053 | 2.84× |
| inline comparator chain, toSorted() | 18286 | 0.055 | 2.95× |
| underscore.sortBy | 11636 | 0.086 | 4.63× |
| thenby | 11130 | 0.090 | 4.84× |
| Array.prototype.sort, decorated | 10240 | 0.098 | 5.26× |
| fast-sort | 8828 | 0.113 | 6.11× |
| es-toolkit.orderBy | 8000 | 0.125 | 6.74× |
| remeda.sortBy | 7758 | 0.129 | 6.95× |
| lodash.orderBy | 7529 | 0.133 | 7.16× |
| ramda.sortWith | 7111 | 0.141 | 7.58× |
| sort-array | 6564 | 0.152 | 8.21× |
| just-sort-by (different order) | 3200 | 0.313 | 16.84× |
| natural-orderby (different order) | 2462 | 0.406 | 21.89× |
| sort-on (different order) | 889 | 1.125 | 60.63× |
| sort-by | 222 | 4.500 | 242.53× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 15059 | 0.066 | 1.00× |
| inline comparator chain, slice().sort() | 11130 | 0.090 | 1.35× |
| inline comparator chain, toSorted() | 11130 | 0.090 | 1.35× |
| underscore.sortBy | 6919 | 0.145 | 2.18× |
| thenby | 6564 | 0.152 | 2.29× |
| remeda.sortBy | 6400 | 0.156 | 2.35× |
| fast-sort | 6400 | 0.156 | 2.35× |
| Array.prototype.sort, decorated | 6400 | 0.156 | 2.35× |
| es-toolkit.orderBy | 6095 | 0.164 | 2.47× |
| ramda.sortWith | 5333 | 0.188 | 2.82× |
| lodash.orderBy | 4923 | 0.203 | 3.06× |
| sort-array | 4414 | 0.227 | 3.41× |
| just-sort-by (different order) | 2065 | 0.484 | 7.29× |
| natural-orderby (different order) | 889 | 1.125 | 16.94× |
| sort-on (different order) | 593 | 1.688 | 25.41× |
| sort-by | 167 | 6.000 | 90.35× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 40960 | 0.024 | 1.00× |
| inline comparator chain, toSorted() | 24381 | 0.041 | 1.68× |
| inline comparator chain, slice().sort() | 23273 | 0.043 | 1.76× |
| underscore.sortBy (different order) | 18963 | 0.053 | 2.16× |
| just-sort-by (different order) | 12800 | 0.078 | 3.20× |
| fast-sort | 11636 | 0.086 | 3.52× |
| thenby (different order) | 11130 | 0.090 | 3.68× |
| Array.prototype.sort, decorated | 11130 | 0.090 | 3.68× |
| remeda.sortBy (different order) | 10667 | 0.094 | 3.84× |
| es-toolkit.orderBy | 9846 | 0.102 | 4.16× |
| lodash.orderBy | 8258 | 0.121 | 4.96× |
| ramda.sortWith (different order) | 7529 | 0.133 | 5.44× |
| sort-array | 7111 | 0.141 | 5.76× |
| natural-orderby | 2783 | 0.359 | 14.72× |
| sort-on | 762 | 1.313 | 53.76× |
| sort-by (different order) | 182 | 5.500 | 225.28× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 36571 | 0.027 | 1.00× |
| inline comparator chain, toSorted() | 18963 | 0.053 | 1.93× |
| inline comparator chain, slice().sort() | 18286 | 0.055 | 2.00× |
| underscore.sortBy | 9481 | 0.105 | 3.86× |
| just-sort-by | 9143 | 0.109 | 4.00× |
| thenby | 8258 | 0.121 | 4.43× |
| remeda.sortBy | 8000 | 0.125 | 4.57× |
| fast-sort | 8000 | 0.125 | 4.57× |
| Array.prototype.sort, decorated | 8000 | 0.125 | 4.57× |
| es-toolkit.orderBy | 7314 | 0.137 | 5.00× |
| ramda.sortWith | 6400 | 0.156 | 5.71× |
| sort-array | 5565 | 0.180 | 6.57× |
| lodash.orderBy | 4741 | 0.211 | 7.71× |
| natural-orderby | 2370 | 0.422 | 15.43× |
| sort-on | 615 | 1.625 | 59.43× |
| sort-by | 174 | 5.750 | 210.29× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 15059 | 0.066 | 1.00× |
| inline comparator chain, slice().sort() | 10240 | 0.098 | 1.47× |
| inline comparator chain, toSorted() | 10240 | 0.098 | 1.47× |
| underscore.sortBy | 6564 | 0.152 | 2.29× |
| remeda.sortBy | 6095 | 0.164 | 2.47× |
| fast-sort | 6095 | 0.164 | 2.47× |
| thenby | 6095 | 0.164 | 2.47× |
| Array.prototype.sort, decorated | 6095 | 0.164 | 2.47× |
| es-toolkit.orderBy | 5818 | 0.172 | 2.59× |
| ramda.sortWith | 5120 | 0.195 | 2.94× |
| lodash.orderBy | 4571 | 0.219 | 3.29× |
| sort-array | 4267 | 0.234 | 3.53× |
| just-sort-by | 3765 | 0.266 | 4.00× |
| natural-orderby | 762 | 1.313 | 19.76× |
| sort-on | 533 | 1.875 | 28.24× |
| sort-by | 167 | 6.000 | 90.35× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 303407 | 0.003 | 1.00× |
| inline comparator chain, toSorted() | 221405 | 0.005 | 1.37× |
| inline comparator chain, slice().sort() | 210051 | 0.005 | 1.44× |
| just-sort-by | 124121 | 0.008 | 2.44× |
| thenby | 113778 | 0.009 | 2.67× |
| fast-sort | 105026 | 0.010 | 2.89× |
| es-toolkit.orderBy | 93091 | 0.011 | 3.26× |
| remeda.sortBy | 81920 | 0.012 | 3.70× |
| Array.prototype.sort, decorated | 81920 | 0.012 | 3.70× |
| ramda.sortWith | 75852 | 0.013 | 4.00× |
| underscore.sortBy | 75852 | 0.013 | 4.00× |
| sort-array | 64000 | 0.016 | 4.74× |
| lodash.orderBy | 36571 | 0.027 | 8.30× |
| sort-on | 5818 | 0.172 | 52.15× |
| natural-orderby | 4414 | 0.227 | 68.74× |
| sort-by | 1524 | 0.656 | 199.11× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 227556 | 0.004 | 1.00× |
| inline comparator chain, toSorted() | 215579 | 0.005 | 1.06× |
| inline comparator chain, slice().sort() | 204800 | 0.005 | 1.11× |
| just-sort-by | 124121 | 0.008 | 1.83× |
| thenby | 110703 | 0.009 | 2.06× |
| fast-sort | 102400 | 0.010 | 2.22× |
| es-toolkit.orderBy | 89043 | 0.011 | 2.56× |
| remeda.sortBy | 78769 | 0.013 | 2.89× |
| Array.prototype.sort, decorated | 78769 | 0.013 | 2.89× |
| ramda.sortWith | 75852 | 0.013 | 3.00× |
| underscore.sortBy | 73143 | 0.014 | 3.11× |
| sort-array | 64000 | 0.016 | 3.56× |
| lodash.orderBy | 36571 | 0.027 | 6.22× |
| sort-on | 4923 | 0.203 | 46.22× |
| natural-orderby | 4267 | 0.234 | 53.33× |
| sort-by | 1455 | 0.688 | 156.44× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 117029 | 0.009 | 0.88× |
| fast-multisort | 102400 | 0.010 | 1.00× |
| inline comparator chain, slice().sort() | 102400 | 0.010 | 1.00× |
| inline comparator chain, toSorted() | 102400 | 0.010 | 1.00× |
| thenby | 102400 | 0.010 | 1.00× |
| fast-sort | 97524 | 0.010 | 1.05× |
| es-toolkit.orderBy | 81920 | 0.012 | 1.25× |
| remeda.sortBy | 75852 | 0.013 | 1.35× |
| ramda.sortWith | 73143 | 0.014 | 1.40× |
| underscore.sortBy | 73143 | 0.014 | 1.40× |
| Array.prototype.sort, decorated | 66065 | 0.015 | 1.55× |
| sort-array | 51200 | 0.020 | 2.00× |
| lodash.orderBy | 36571 | 0.027 | 2.80× |
| sort-on | 5818 | 0.172 | 17.60× |
| natural-orderby | 4267 | 0.234 | 24.00× |
| sort-by | 1455 | 0.688 | 70.40× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13838 | 0.072 | 1.00× |
| inline comparator chain, slice().sort() | 11130 | 0.090 | 1.24× |
| inline comparator chain, toSorted() | 11130 | 0.090 | 1.24× |
| es-toolkit.orderBy | 6095 | 0.164 | 2.27× |
| remeda.sortBy (different order) | 5818 | 0.172 | 2.38× |
| lodash.orderBy | 5565 | 0.180 | 2.49× |
| thenby (different order) | 4923 | 0.203 | 2.81× |
| fast-sort (different order) | 4571 | 0.219 | 3.03× |
| ramda.sortWith (different order) | 4129 | 0.242 | 3.35× |
| Array.prototype.sort, decorated | 3765 | 0.266 | 3.68× |
| sort-array (different order) | 2207 | 0.453 | 6.27× |
| natural-orderby (different order) | 552 | 1.813 | 25.08× |
| sort-on (different order) | 444 | 2.250 | 31.14× |
| sort-by (different order) | 105 | 9.500 | 131.46× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5565 | 0.180 | 1.00× |
| inline comparator chain, toSorted() | 1333 | 0.750 | 4.17× |
| inline comparator chain, slice().sort() | 1280 | 0.781 | 4.35× |
| thenby | 1000 | 1.000 | 5.57× |
| underscore.sortBy | 1000 | 1.000 | 5.57× |
| fast-sort | 800 | 1.250 | 6.96× |
| es-toolkit.orderBy | 727 | 1.375 | 7.65× |
| remeda.sortBy | 727 | 1.375 | 7.65× |
| lodash.orderBy | 696 | 1.438 | 8.00× |
| ramda.sortWith | 640 | 1.563 | 8.70× |
| Array.prototype.sort, decorated | 615 | 1.625 | 9.04× |
| sort-array | 421 | 2.375 | 13.22× |
| just-sort-by (different order) | 296 | 3.375 | 18.78× |
| natural-orderby (different order) | 235 | 4.250 | 23.65× |
| sort-on (different order) | 91 | 11.000 | 61.22× |
| sort-by | 22 | 46.000 | 256.00× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1231 | 0.813 | 1.00× |
| inline comparator chain, slice().sort() | 593 | 1.688 | 2.08× |
| inline comparator chain, toSorted() | 593 | 1.688 | 2.08× |
| underscore.sortBy | 457 | 2.188 | 2.69× |
| remeda.sortBy | 432 | 2.313 | 2.85× |
| fast-sort | 421 | 2.375 | 2.92× |
| thenby | 421 | 2.375 | 2.92× |
| es-toolkit.orderBy | 400 | 2.500 | 3.08× |
| ramda.sortWith | 348 | 2.875 | 3.54× |
| lodash.orderBy | 308 | 3.250 | 4.00× |
| Array.prototype.sort, decorated | 308 | 3.250 | 4.00× |
| sort-array | 211 | 4.750 | 5.85× |
| just-sort-by (different order) | 138 | 7.250 | 8.92× |
| natural-orderby (different order) | 67 | 15.000 | 18.46× |
| sort-on (different order) | 42 | 24.000 | 29.54× |
| sort-by | 12 | 83.000 | 102.15× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4414 | 0.227 | 1.00× |
| inline comparator chain, slice().sort() | 1231 | 0.813 | 3.59× |
| inline comparator chain, toSorted() | 1231 | 0.813 | 3.59× |
| underscore.sortBy (different order) | 1032 | 0.969 | 4.28× |
| fast-sort | 800 | 1.250 | 5.52× |
| just-sort-by (different order) | 800 | 1.250 | 5.52× |
| remeda.sortBy (different order) | 727 | 1.375 | 6.07× |
| thenby (different order) | 727 | 1.375 | 6.07× |
| es-toolkit.orderBy | 696 | 1.438 | 6.34× |
| lodash.orderBy | 552 | 1.813 | 8.00× |
| ramda.sortWith (different order) | 533 | 1.875 | 8.28× |
| Array.prototype.sort, decorated | 432 | 2.313 | 10.21× |
| sort-array | 308 | 3.250 | 14.34× |
| natural-orderby | 229 | 4.375 | 19.31× |
| sort-on | 57 | 17.500 | 77.24× |
| sort-by (different order) | 14 | 74.000 | 326.62× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3879 | 0.258 | 1.00× |
| inline comparator chain, toSorted() | 914 | 1.094 | 4.24× |
| inline comparator chain, slice().sort() | 889 | 1.125 | 4.36× |
| underscore.sortBy | 615 | 1.625 | 6.30× |
| just-sort-by | 615 | 1.625 | 6.30× |
| remeda.sortBy | 571 | 1.750 | 6.79× |
| fast-sort | 571 | 1.750 | 6.79× |
| thenby | 552 | 1.813 | 7.03× |
| es-toolkit.orderBy | 533 | 1.875 | 7.27× |
| ramda.sortWith | 444 | 2.250 | 8.73× |
| Array.prototype.sort, decorated | 348 | 2.875 | 11.15× |
| lodash.orderBy | 333 | 3.000 | 11.64× |
| sort-array | 250 | 4.000 | 15.52× |
| natural-orderby | 182 | 5.500 | 21.33× |
| sort-on | 45 | 22.000 | 85.33× |
| sort-by | 13 | 80.000 | 310.30× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1185 | 0.844 | 1.00× |
| inline comparator chain, slice().sort() | 552 | 1.813 | 2.15× |
| inline comparator chain, toSorted() | 533 | 1.875 | 2.22× |
| underscore.sortBy | 421 | 2.375 | 2.81× |
| remeda.sortBy | 400 | 2.500 | 2.96× |
| fast-sort | 400 | 2.500 | 2.96× |
| thenby | 400 | 2.500 | 2.96× |
| es-toolkit.orderBy | 381 | 2.625 | 3.11× |
| ramda.sortWith | 348 | 2.875 | 3.41× |
| lodash.orderBy | 308 | 3.250 | 3.85× |
| Array.prototype.sort, decorated | 296 | 3.375 | 4.00× |
| just-sort-by | 258 | 3.875 | 4.59× |
| sort-array | 211 | 4.750 | 5.63× |
| natural-orderby | 57 | 17.500 | 20.74× |
| sort-on | 40 | 25.000 | 29.63× |
| sort-by | 12 | 84.000 | 99.56× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 22261 | 0.045 | 0.43× |
| inline comparator chain, slice().sort() | 21333 | 0.047 | 0.44× |
| just-sort-by | 12190 | 0.082 | 0.78× |
| thenby | 11130 | 0.090 | 0.85× |
| fast-sort | 10667 | 0.094 | 0.89× |
| fast-multisort | 9481 | 0.105 | 1.00× |
| es-toolkit.orderBy | 9143 | 0.109 | 1.04× |
| remeda.sortBy | 9143 | 0.109 | 1.04× |
| underscore.sortBy | 8000 | 0.125 | 1.19× |
| ramda.sortWith | 7758 | 0.129 | 1.22× |
| Array.prototype.sort, decorated | 4741 | 0.211 | 2.00× |
| lodash.orderBy | 3657 | 0.273 | 2.59× |
| sort-array | 3459 | 0.289 | 2.74× |
| sort-on | 571 | 1.750 | 16.59× |
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
| lodash.orderBy | 3657 | 0.273 | 7.00× |
| sort-array | 3657 | 0.273 | 7.00× |
| sort-on | 500 | 2.000 | 51.20× |
| natural-orderby | 364 | 2.750 | 70.40× |
| sort-by | 143 | 7.000 | 179.20× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 12800 | 0.078 | 0.95× |
| fast-multisort | 12190 | 0.082 | 1.00× |
| inline comparator chain, slice().sort() | 11636 | 0.086 | 1.05× |
| just-sort-by | 9481 | 0.105 | 1.29× |
| thenby | 8258 | 0.121 | 1.48× |
| fast-sort | 8000 | 0.125 | 1.52× |
| remeda.sortBy | 7758 | 0.129 | 1.57× |
| es-toolkit.orderBy | 7314 | 0.137 | 1.67× |
| underscore.sortBy | 6400 | 0.156 | 1.90× |
| ramda.sortWith | 6095 | 0.164 | 2.00× |
| Array.prototype.sort, decorated | 4267 | 0.234 | 2.86× |
| lodash.orderBy | 3048 | 0.328 | 4.00× |
| sort-array | 3048 | 0.328 | 4.00× |
| sort-on | 593 | 1.688 | 20.57× |
| natural-orderby | 381 | 2.625 | 32.00× |
| sort-by | 148 | 6.750 | 82.29× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1882 | 0.531 | 1.00× |
| inline comparator chain, toSorted() | 640 | 1.563 | 2.94× |
| inline comparator chain, slice().sort() | 615 | 1.625 | 3.06× |
| es-toolkit.orderBy | 421 | 2.375 | 4.47× |
| lodash.orderBy | 400 | 2.500 | 4.71× |
| remeda.sortBy (different order) | 381 | 2.625 | 4.94× |
| fast-sort (different order) | 320 | 3.125 | 5.88× |
| thenby (different order) | 320 | 3.125 | 5.88× |
| ramda.sortWith (different order) | 286 | 3.500 | 6.59× |
| Array.prototype.sort, decorated | 267 | 3.750 | 7.06× |
| sort-array (different order) | 154 | 6.500 | 12.24× |
| natural-orderby (different order) | 43 | 23.000 | 43.29× |
| sort-on (different order) | 29 | 34.000 | 64.00× |
| sort-by (different order) | 7 | 146.000 | 274.82× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 533 | 1.875 | 1.00× |
| inline comparator chain, toSorted() | 118 | 8.500 | 4.53× |
| inline comparator chain, slice().sort() | 114 | 8.750 | 4.67× |
| thenby | 91 | 11.000 | 5.87× |
| underscore.sortBy | 91 | 11.000 | 5.87× |
| fast-sort | 77 | 13.000 | 6.93× |
| es-toolkit.orderBy | 71 | 14.000 | 7.47× |
| remeda.sortBy | 69 | 14.500 | 7.73× |
| lodash.orderBy | 63 | 16.000 | 8.53× |
| ramda.sortWith | 63 | 16.000 | 8.53× |
| Array.prototype.sort, decorated | 59 | 17.000 | 9.07× |
| sort-array | 40 | 25.000 | 13.33× |
| just-sort-by (different order) | 29 | 34.000 | 18.13× |
| natural-orderby (different order) | 22 | 45.000 | 24.00× |
| sort-on (different order) | 8 | 123.000 | 65.60× |
| sort-by | 2 | 458.000 | 244.27× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 80 | 12.500 | 1.00× |
| inline comparator chain, slice().sort() | 38 | 26.000 | 2.08× |
| inline comparator chain, toSorted() | 38 | 26.000 | 2.08× |
| underscore.sortBy | 29 | 35.000 | 2.80× |
| thenby | 27 | 37.000 | 2.96× |
| fast-sort | 26 | 38.000 | 3.04× |
| es-toolkit.orderBy | 25 | 40.000 | 3.20× |
| remeda.sortBy | 25 | 40.000 | 3.20× |
| ramda.sortWith | 23 | 43.000 | 3.44× |
| Array.prototype.sort, decorated | 17 | 58.000 | 4.64× |
| lodash.orderBy | 16 | 61.000 | 4.88× |
| sort-array | 15 | 68.000 | 5.44× |
| just-sort-by (different order) | 9 | 108.000 | 8.64× |
| natural-orderby (different order) | 3 | 291.000 | 23.28× |
| sort-on (different order) | 3 | 341.000 | 27.28× |
| sort-by | 1 | 1075.000 | 86.00× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 457 | 2.188 | 1.00× |
| inline comparator chain, slice().sort() | 87 | 11.500 | 5.26× |
| inline comparator chain, toSorted() | 83 | 12.000 | 5.49× |
| underscore.sortBy (different order) | 74 | 13.500 | 6.17× |
| just-sort-by (different order) | 61 | 16.500 | 7.54× |
| fast-sort | 59 | 17.000 | 7.77× |
| remeda.sortBy (different order) | 56 | 18.000 | 8.23× |
| thenby (different order) | 53 | 19.000 | 8.69× |
| es-toolkit.orderBy | 50 | 20.000 | 9.14× |
| ramda.sortWith (different order) | 42 | 24.000 | 10.97× |
| lodash.orderBy | 36 | 28.000 | 12.80× |
| Array.prototype.sort, decorated | 32 | 31.000 | 14.17× |
| sort-array | 23 | 43.000 | 19.66× |
| natural-orderby | 15 | 65.000 | 29.71× |
| sort-on | 4 | 239.000 | 109.26× |
| sort-by (different order) | 1 | 940.000 | 429.71× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 381 | 2.625 | 1.00× |
| inline comparator chain, slice().sort() | 65 | 15.500 | 5.90× |
| inline comparator chain, toSorted() | 65 | 15.500 | 5.90× |
| underscore.sortBy | 48 | 21.000 | 8.00× |
| just-sort-by | 45 | 22.000 | 8.38× |
| remeda.sortBy | 42 | 24.000 | 9.14× |
| fast-sort | 42 | 24.000 | 9.14× |
| thenby | 42 | 24.000 | 9.14× |
| es-toolkit.orderBy | 38 | 26.000 | 9.90× |
| ramda.sortWith | 32 | 31.000 | 11.81× |
| Array.prototype.sort, decorated | 25 | 40.000 | 15.24× |
| lodash.orderBy | 23 | 44.000 | 16.76× |
| sort-array | 19 | 53.000 | 20.19× |
| natural-orderby | 11 | 87.000 | 33.14× |
| sort-on | 3 | 303.000 | 115.43× |
| sort-by | 1 | 1045.000 | 398.10× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 69 | 14.500 | 1.00× |
| inline comparator chain, slice().sort() | 36 | 28.000 | 1.93× |
| inline comparator chain, toSorted() | 36 | 28.000 | 1.93× |
| remeda.sortBy | 28 | 36.000 | 2.48× |
| fast-sort | 28 | 36.000 | 2.48× |
| underscore.sortBy | 28 | 36.000 | 2.48× |
| thenby | 27 | 37.000 | 2.55× |
| es-toolkit.orderBy | 26 | 39.000 | 2.69× |
| ramda.sortWith | 23 | 43.000 | 2.97× |
| Array.prototype.sort, decorated | 18 | 55.000 | 3.79× |
| lodash.orderBy | 17 | 58.000 | 4.00× |
| just-sort-by | 17 | 60.000 | 4.14× |
| sort-array | 14 | 73.000 | 5.03× |
| natural-orderby (different order) | 3 | 300.000 | 20.69× |
| sort-on | 3 | 360.000 | 24.83× |
| sort-by | 1 | 1112.000 | 76.69× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3200 | 0.313 | 1.00× |
| inline comparator chain, slice().sort() | 1524 | 0.656 | 2.10× |
| inline comparator chain, toSorted() | 1143 | 0.875 | 2.80× |
| just-sort-by | 970 | 1.031 | 3.30× |
| thenby | 914 | 1.094 | 3.50× |
| fast-sort | 889 | 1.125 | 3.60× |
| es-toolkit.orderBy | 800 | 1.250 | 4.00× |
| remeda.sortBy | 800 | 1.250 | 4.00× |
| ramda.sortWith | 667 | 1.500 | 4.80× |
| underscore.sortBy | 615 | 1.625 | 5.20× |
| Array.prototype.sort, decorated | 400 | 2.500 | 8.00× |
| sort-array | 320 | 3.125 | 10.00× |
| lodash.orderBy | 308 | 3.250 | 10.40× |
| sort-on | 54 | 18.500 | 59.20× |
| natural-orderby | 37 | 27.000 | 86.40× |
| sort-by | 15 | 67.000 | 214.40× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2560 | 0.391 | 1.00× |
| inline comparator chain, slice().sort() | 1455 | 0.688 | 1.76× |
| inline comparator chain, toSorted() | 1143 | 0.875 | 2.24× |
| just-sort-by | 1000 | 1.000 | 2.56× |
| thenby | 914 | 1.094 | 2.80× |
| fast-sort | 865 | 1.156 | 2.96× |
| es-toolkit.orderBy | 762 | 1.313 | 3.36× |
| remeda.sortBy | 762 | 1.313 | 3.36× |
| ramda.sortWith | 667 | 1.500 | 3.84× |
| underscore.sortBy | 615 | 1.625 | 4.16× |
| Array.prototype.sort, decorated | 400 | 2.500 | 6.40× |
| sort-array | 333 | 3.000 | 7.68× |
| lodash.orderBy | 308 | 3.250 | 8.32× |
| sort-on | 45 | 22.000 | 56.32× |
| natural-orderby | 36 | 28.000 | 71.68× |
| sort-by | 14 | 70.000 | 179.20× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1524 | 0.656 | 1.00× |
| just-sort-by | 842 | 1.188 | 1.81× |
| inline comparator chain, toSorted() | 821 | 1.219 | 1.86× |
| fast-sort | 800 | 1.250 | 1.90× |
| thenby | 800 | 1.250 | 1.90× |
| inline comparator chain, slice().sort() | 762 | 1.313 | 2.00× |
| es-toolkit.orderBy | 727 | 1.375 | 2.10× |
| remeda.sortBy | 727 | 1.375 | 2.10× |
| ramda.sortWith | 615 | 1.625 | 2.48× |
| underscore.sortBy | 571 | 1.750 | 2.67× |
| Array.prototype.sort, decorated | 381 | 2.625 | 4.00× |
| sort-array | 320 | 3.125 | 4.76× |
| lodash.orderBy | 308 | 3.250 | 4.95× |
| sort-on | 57 | 17.500 | 26.67× |
| natural-orderby | 37 | 27.000 | 41.14× |
| sort-by | 15 | 66.000 | 100.57× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 167 | 6.000 | 1.00× |
| inline comparator chain, slice().sort() | 43 | 23.000 | 3.83× |
| inline comparator chain, toSorted() | 43 | 23.000 | 3.83× |
| es-toolkit.orderBy | 30 | 33.000 | 5.50× |
| remeda.sortBy (different order) | 29 | 34.000 | 5.67× |
| thenby (different order) | 24 | 41.000 | 6.83× |
| fast-sort (different order) | 23 | 44.000 | 7.33× |
| lodash.orderBy | 22 | 45.000 | 7.50× |
| ramda.sortWith (different order) | 22 | 46.000 | 7.67× |
| Array.prototype.sort, decorated | 18 | 57.000 | 9.50× |
| sort-array (different order) | 11 | 87.000 | 14.50× |
| natural-orderby (different order) | 4 | 250.000 | 41.67× |
| sort-on (different order) | 2 | 500.000 | 83.33× |
| sort-by (different order) | 1 | 1939.000 | 323.17× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 50 | 20.000 | 1.00× |
| inline comparator chain, slice().sort() | 11 | 87.000 | 4.35× |
| inline comparator chain, toSorted() | 11 | 88.000 | 4.40× |
| thenby | 9 | 116.000 | 5.80× |
| underscore.sortBy | 8 | 123.000 | 6.15× |
| fast-sort | 8 | 131.000 | 6.55× |
| es-toolkit.orderBy | 7 | 140.000 | 7.00× |
| remeda.sortBy | 7 | 142.000 | 7.10× |
| ramda.sortWith | 6 | 159.000 | 7.95× |
| lodash.orderBy | 6 | 161.000 | 8.05× |
| Array.prototype.sort, decorated | 6 | 181.000 | 9.05× |
| sort-array | 4 | 242.000 | 12.10× |
| just-sort-by (different order) | 3 | 336.000 | 16.80× |
| natural-orderby (different order) | 2 | 484.000 | 24.20× |
| sort-on (different order) | 1 | 1275.000 | 63.75× |
| sort-by | 0 | 4615.000 | 230.75× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 323.000 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 572.000 | 1.77× |
| inline comparator chain, toSorted() | 2 | 594.000 | 1.84× |
| underscore.sortBy | 1 | 686.000 | 2.12× |
| remeda.sortBy | 1 | 865.000 | 2.68× |
| thenby | 1 | 884.000 | 2.74× |
| fast-sort | 1 | 886.000 | 2.74× |
| es-toolkit.orderBy | 1 | 959.000 | 2.97× |
| ramda.sortWith | 1 | 1022.000 | 3.16× |
| Array.prototype.sort, decorated | 1 | 1232.000 | 3.81× |
| lodash.orderBy | 1 | 1355.000 | 4.20× |
| sort-array | 1 | 1573.000 | 4.87× |
| just-sort-by (different order) | 0 | 2127.000 | 6.59× |
| sort-on (different order) | 0 | 5027.000 | 15.56× |
| natural-orderby (different order) | 0 | 5202.000 | 16.11× |
| sort-by | 0 | 13713.000 | 42.46× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 32 | 31.000 | 1.00× |
| inline comparator chain, slice().sort() | 5 | 186.000 | 6.00× |
| inline comparator chain, toSorted() | 5 | 188.000 | 6.06× |
| underscore.sortBy (different order) | 5 | 192.000 | 6.19× |
| fast-sort | 4 | 284.000 | 9.16× |
| just-sort-by (different order) | 4 | 284.000 | 9.16× |
| thenby (different order) | 3 | 297.000 | 9.58× |
| remeda.sortBy (different order) | 3 | 302.000 | 9.74× |
| es-toolkit.orderBy | 3 | 315.000 | 10.16× |
| ramda.sortWith (different order) | 3 | 395.000 | 12.74× |
| Array.prototype.sort, decorated | 2 | 580.000 | 18.71× |
| lodash.orderBy | 2 | 601.000 | 19.39× |
| sort-array | 2 | 655.000 | 21.13× |
| natural-orderby | 1 | 1248.000 | 40.26× |
| sort-on | 0 | 3199.000 | 103.19× |
| sort-by (different order) | 0 | 11632.000 | 375.23× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 27 | 37.000 | 1.00× |
| inline comparator chain, slice().sort() | 4 | 240.000 | 6.49× |
| inline comparator chain, toSorted() | 4 | 241.000 | 6.51× |
| underscore.sortBy | 3 | 338.000 | 9.14× |
| just-sort-by | 3 | 351.000 | 9.49× |
| fast-sort | 3 | 371.000 | 10.03× |
| thenby | 3 | 389.000 | 10.51× |
| remeda.sortBy | 3 | 393.000 | 10.62× |
| es-toolkit.orderBy | 2 | 417.000 | 11.27× |
| ramda.sortWith | 2 | 478.000 | 12.92× |
| Array.prototype.sort, decorated | 1 | 713.000 | 19.27× |
| sort-array | 1 | 777.000 | 21.00× |
| lodash.orderBy | 1 | 932.000 | 25.19× |
| natural-orderby | 1 | 1441.000 | 38.95× |
| sort-on | 0 | 4228.000 | 114.27× |
| sort-by | 0 | 12978.000 | 350.76× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 376.000 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 581.000 | 1.55× |
| inline comparator chain, toSorted() | 2 | 592.000 | 1.57× |
| underscore.sortBy | 1 | 780.000 | 2.07× |
| remeda.sortBy | 1 | 856.000 | 2.28× |
| fast-sort | 1 | 859.000 | 2.28× |
| thenby | 1 | 861.000 | 2.29× |
| es-toolkit.orderBy | 1 | 914.000 | 2.43× |
| ramda.sortWith | 1 | 987.000 | 2.63× |
| Array.prototype.sort, decorated | 1 | 1177.000 | 3.13× |
| lodash.orderBy | 1 | 1414.000 | 3.76× |
| just-sort-by | 1 | 1421.000 | 3.78× |
| sort-array | 1 | 1449.000 | 3.85× |
| sort-on | 0 | 5389.000 | 14.33× |
| natural-orderby (different order) | 0 | 5818.000 | 15.47× |
| sort-by | 0 | 14043.000 | 37.35× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 242 | 4.125 | 1.00× |
| inline comparator chain, slice().sort() | 111 | 9.000 | 2.18× |
| inline comparator chain, toSorted() | 108 | 9.250 | 2.24× |
| just-sort-by | 91 | 11.000 | 2.67× |
| fast-sort | 83 | 12.000 | 2.91× |
| es-toolkit.orderBy | 71 | 14.000 | 3.39× |
| remeda.sortBy | 71 | 14.000 | 3.39× |
| thenby | 71 | 14.000 | 3.39× |
| ramda.sortWith | 65 | 15.500 | 3.76× |
| underscore.sortBy | 56 | 18.000 | 4.36× |
| Array.prototype.sort, decorated | 38 | 26.000 | 6.30× |
| sort-array | 30 | 33.000 | 8.00× |
| lodash.orderBy | 27 | 37.000 | 8.97× |
| sort-on | 5 | 186.000 | 45.09× |
| natural-orderby | 3 | 286.000 | 69.33× |
| sort-by | 1 | 703.000 | 170.42× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 200 | 5.000 | 1.00× |
| inline comparator chain, slice().sort() | 133 | 7.500 | 1.50× |
| inline comparator chain, toSorted() | 105 | 9.500 | 1.90× |
| just-sort-by | 91 | 11.000 | 2.20× |
| thenby | 83 | 12.000 | 2.40× |
| fast-sort | 80 | 12.500 | 2.50× |
| es-toolkit.orderBy | 74 | 13.500 | 2.70× |
| remeda.sortBy | 65 | 15.500 | 3.10× |
| ramda.sortWith | 63 | 16.000 | 3.20× |
| underscore.sortBy | 51 | 19.500 | 3.90× |
| Array.prototype.sort, decorated | 38 | 26.000 | 5.20× |
| sort-array | 31 | 32.000 | 6.40× |
| lodash.orderBy | 29 | 35.000 | 7.00× |
| sort-on | 4 | 236.000 | 47.20× |
| natural-orderby | 3 | 301.000 | 60.20× |
| sort-by | 1 | 713.000 | 142.60× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 138 | 7.250 | 1.00× |
| just-sort-by | 91 | 11.000 | 1.52× |
| fast-sort | 80 | 12.500 | 1.72× |
| thenby | 71 | 14.000 | 1.93× |
| es-toolkit.orderBy | 69 | 14.500 | 2.00× |
| remeda.sortBy | 67 | 15.000 | 2.07× |
| inline comparator chain, slice().sort() | 63 | 16.000 | 2.21× |
| inline comparator chain, toSorted() | 63 | 16.000 | 2.21× |
| ramda.sortWith | 61 | 16.500 | 2.28× |
| underscore.sortBy | 50 | 20.000 | 2.76× |
| Array.prototype.sort, decorated | 40 | 25.000 | 3.45× |
| sort-array | 30 | 33.000 | 4.55× |
| lodash.orderBy | 24 | 42.000 | 5.79× |
| sort-on | 5 | 201.000 | 27.72× |
| natural-orderby | 3 | 287.000 | 39.59× |
| sort-by | 1 | 669.000 | 92.28× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13 | 75.000 | 1.00× |
| inline comparator chain, slice().sort() | 3 | 385.000 | 5.13× |
| inline comparator chain, toSorted() | 3 | 389.000 | 5.19× |
| remeda.sortBy (different order) | 2 | 596.000 | 7.95× |
| es-toolkit.orderBy | 2 | 603.000 | 8.04× |
| thenby (different order) | 1 | 706.000 | 9.41× |
| lodash.orderBy | 1 | 771.000 | 10.28× |
| fast-sort (different order) | 1 | 786.000 | 10.48× |
| ramda.sortWith (different order) | 1 | 806.000 | 10.75× |
| Array.prototype.sort, decorated | 1 | 1044.000 | 13.92× |
| sort-array (different order) | 1 | 1287.000 | 17.16× |
| natural-orderby (different order) | 0 | 3632.000 | 48.43× |
| sort-on (different order) | 0 | 6786.000 | 90.48× |
| sort-by (different order) | 0 | 24857.000 | 331.43× |

</details>

#### Firefox 158.0

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, toSorted() | 0.43× | 1.14× | 5.00× | 54 | 0 |
| inline comparator chain, slice().sort() | 0.43× | 1.58× | 4.87× | 54 | 0 |
| es-toolkit.orderBy | 0.95× | 2.47× | 17.14× | 54 | 0 |
| just-sort-by | 0.63× | 2.55× | 18.09× | 48 | 14 |
| underscore.sortBy | 1.14× | 3.03× | 10.29× | 48 | 5 |
| thenby | 0.83× | 3.15× | 14.86× | 54 | 10 |
| fast-sort | 0.85× | 3.43× | 13.14× | 54 | 9 |
| Array.prototype.sort, decorated | 0.95× | 3.62× | 14.86× | 54 | 0 |
| remeda.sortBy | 1.00× | 4.11× | 16.00× | 54 | 10 |
| sort-array | 1.21× | 5.14× | 22.86× | 54 | 5 |
| ramda.sortWith | 1.36× | 5.82× | 24.00× | 54 | 10 |
| lodash.orderBy | 1.66× | 6.40× | 25.14× | 54 | 0 |
| sort-on | 2.29× | 21.12× | 222.86× | 54 | 14 |
| natural-orderby | 8.33× | 29.87× | 256.00× | 54 | 15 |
| sort-by | 4.00× | 196.27× | 2264.00× | 54 | 10 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.65× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.97× |
| fast-multisort | 123361882 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.94× |
| es-toolkit.orderBy | 52428800 | 0.000 | 2.35× |
| sort-on | 52428800 | 0.000 | 2.35× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.65× |
| thenby | 30840471 | 0.000 | 4.00× |
| sort-by | 29959314 | 0.000 | 4.12× |
| fast-sort | 21845333 | 0.000 | 5.65× |
| ramda.sortWith | 19418074 | 0.000 | 6.35× |
| sort-array | 18078897 | 0.000 | 6.82× |
| remeda.sortBy | 17476267 | 0.000 | 7.06× |
| underscore.sortBy | 14979657 | 0.000 | 8.24× |
| lodash.orderBy | 9709037 | 0.000 | 12.71× |
| natural-orderby | 3855059 | 0.000 | 32.00× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.65× |
| fast-multisort | 123361882 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.94× |
| es-toolkit.orderBy | 52428800 | 0.000 | 2.35× |
| sort-on | 52428800 | 0.000 | 2.35× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.65× |
| thenby | 30840471 | 0.000 | 4.00× |
| sort-by | 29959314 | 0.000 | 4.12× |
| fast-sort | 21845333 | 0.000 | 5.65× |
| ramda.sortWith | 19418074 | 0.000 | 6.35× |
| sort-array | 18724571 | 0.000 | 6.59× |
| remeda.sortBy | 15887515 | 0.000 | 7.76× |
| underscore.sortBy | 14169946 | 0.000 | 8.71× |
| lodash.orderBy | 9709037 | 0.000 | 12.71× |
| natural-orderby | 1638400 | 0.001 | 75.29× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.65× |
| fast-multisort | 123361882 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.94× |
| sort-on | 52428800 | 0.000 | 2.35× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.47× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.65× |
| thenby | 31775030 | 0.000 | 3.88× |
| sort-by | 29959314 | 0.000 | 4.12× |
| fast-sort | 21845333 | 0.000 | 5.65× |
| ramda.sortWith | 19418074 | 0.000 | 6.35× |
| sort-array | 18724571 | 0.000 | 6.59× |
| remeda.sortBy | 15887515 | 0.000 | 7.76× |
| underscore.sortBy | 14169946 | 0.000 | 8.71× |
| lodash.orderBy | 9709037 | 0.000 | 12.71× |
| natural-orderby | 2621440 | 0.000 | 47.06× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.94× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.83× |
| es-toolkit.orderBy | 52428800 | 0.000 | 2.29× |
| sort-on | 52428800 | 0.000 | 2.29× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.54× |
| thenby | 31775030 | 0.000 | 3.77× |
| sort-by | 29959314 | 0.000 | 4.00× |
| fast-sort | 21845333 | 0.000 | 5.49× |
| ramda.sortWith | 19418074 | 0.000 | 6.17× |
| sort-array | 18078897 | 0.000 | 6.63× |
| remeda.sortBy | 15887515 | 0.000 | 7.54× |
| underscore.sortBy | 14169946 | 0.000 | 8.46× |
| lodash.orderBy | 9362286 | 0.000 | 12.80× |
| natural-orderby | 2340571 | 0.000 | 51.20× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.94× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.89× |
| sort-on | 52428800 | 0.000 | 2.29× |
| es-toolkit.orderBy | 51150049 | 0.000 | 2.34× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.54× |
| thenby | 31775030 | 0.000 | 3.77× |
| sort-by | 29959314 | 0.000 | 4.00× |
| fast-sort | 21845333 | 0.000 | 5.49× |
| ramda.sortWith | 19418074 | 0.000 | 6.17× |
| sort-array | 18724571 | 0.000 | 6.40× |
| remeda.sortBy | 15887515 | 0.000 | 7.54× |
| underscore.sortBy | 14169946 | 0.000 | 8.46× |
| lodash.orderBy | 9362286 | 0.000 | 12.80× |
| natural-orderby | 630154 | 0.002 | 190.17× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.65× |
| fast-multisort | 123361882 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 1.00× |
| sort-on | 52428800 | 0.000 | 2.35× |
| es-toolkit.orderBy | 47662545 | 0.000 | 2.59× |
| inline comparator chain, slice().sort() | 33825032 | 0.000 | 3.65× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.65× |
| thenby | 29959314 | 0.000 | 4.12× |
| sort-by | 29127111 | 0.000 | 4.24× |
| fast-sort | 20971520 | 0.000 | 5.88× |
| ramda.sortWith | 19418074 | 0.000 | 6.35× |
| sort-array | 18078897 | 0.000 | 6.82× |
| remeda.sortBy | 17476267 | 0.000 | 7.06× |
| underscore.sortBy | 13443282 | 0.000 | 9.18× |
| lodash.orderBy | 9362286 | 0.000 | 13.18× |
| natural-orderby | 2730667 | 0.000 | 45.18× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.65× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.97× |
| fast-multisort | 123361882 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.94× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.47× |
| sort-on | 43690667 | 0.000 | 2.82× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.65× |
| thenby | 31775030 | 0.000 | 3.88× |
| sort-by | 29959314 | 0.000 | 4.12× |
| fast-sort | 20971520 | 0.000 | 5.88× |
| ramda.sortWith | 19418074 | 0.000 | 6.35× |
| remeda.sortBy | 17476267 | 0.000 | 7.06× |
| sort-array | 17476267 | 0.000 | 7.06× |
| underscore.sortBy | 14169946 | 0.000 | 8.71× |
| lodash.orderBy | 9362286 | 0.000 | 13.18× |
| natural-orderby | 2849391 | 0.000 | 43.29× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.65× |
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.97× |
| fast-multisort | 123361882 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.88× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.47× |
| sort-on | 43690667 | 0.000 | 2.82× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.65× |
| thenby | 31775030 | 0.000 | 3.88× |
| sort-by | 29959314 | 0.000 | 4.12× |
| fast-sort | 20971520 | 0.000 | 5.88× |
| ramda.sortWith | 19418074 | 0.000 | 6.35× |
| remeda.sortBy | 17476267 | 0.000 | 7.06× |
| sort-array | 17476267 | 0.000 | 7.06× |
| underscore.sortBy | 13797053 | 0.000 | 8.94× |
| lodash.orderBy | 9709037 | 0.000 | 12.71× |
| natural-orderby | 2730667 | 0.000 | 45.18× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 127100121 | 0.000 | 0.94× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.83× |
| sort-on | 52428800 | 0.000 | 2.29× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.40× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 3.54× |
| sort-by | 26886564 | 0.000 | 4.46× |
| sort-array | 18078897 | 0.000 | 6.63× |
| fast-sort | 15887515 | 0.000 | 7.54× |
| thenby | 12483048 | 0.000 | 9.60× |
| ramda.sortWith | 9709037 | 0.000 | 12.34× |
| remeda.sortBy | 7489829 | 0.000 | 16.00× |
| lodash.orderBy | 6553600 | 0.000 | 18.29× |
| natural-orderby | 468114 | 0.002 | 256.00× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 3855059 | 0.000 | 0.71× |
| inline comparator chain, toSorted() | 3640889 | 0.000 | 0.75× |
| thenby | 3276800 | 0.000 | 0.83× |
| fast-multisort | 2730667 | 0.000 | 1.00× |
| fast-sort | 2730667 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2427259 | 0.000 | 1.13× |
| remeda.sortBy | 2427259 | 0.000 | 1.13× |
| Array.prototype.sort, decorated | 2427259 | 0.000 | 1.13× |
| underscore.sortBy | 2048000 | 0.000 | 1.33× |
| sort-array | 1872457 | 0.001 | 1.46× |
| ramda.sortWith | 1638400 | 0.001 | 1.67× |
| lodash.orderBy | 1310720 | 0.001 | 2.08× |
| just-sort-by (different order) | 1260308 | 0.001 | 2.17× |
| natural-orderby (different order) | 327680 | 0.003 | 8.33× |
| sort-on (different order) | 215579 | 0.005 | 12.67× |
| sort-by | 23273 | 0.043 | 117.33× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 3640889 | 0.000 | 0.62× |
| inline comparator chain, toSorted() | 3542486 | 0.000 | 0.64× |
| thenby | 2730667 | 0.000 | 0.83× |
| fast-sort | 2520615 | 0.000 | 0.90× |
| Array.prototype.sort, decorated | 2340571 | 0.000 | 0.97× |
| fast-multisort | 2259862 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2259862 | 0.000 | 1.00× |
| remeda.sortBy | 2259862 | 0.000 | 1.00× |
| underscore.sortBy | 1985939 | 0.001 | 1.14× |
| sort-array | 1872457 | 0.001 | 1.21× |
| ramda.sortWith | 1638400 | 0.001 | 1.38× |
| lodash.orderBy | 1365333 | 0.001 | 1.66× |
| just-sort-by | 1092267 | 0.001 | 2.07× |
| sort-on | 221405 | 0.005 | 10.21× |
| natural-orderby | 132129 | 0.008 | 17.10× |
| sort-by | 26947 | 0.037 | 83.86× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5242880 | 0.000 | 0.54× |
| inline comparator chain, toSorted() | 5041231 | 0.000 | 0.57× |
| fast-sort | 3360821 | 0.000 | 0.85× |
| just-sort-by (different order) | 3276800 | 0.000 | 0.87× |
| es-toolkit.orderBy | 2978909 | 0.000 | 0.96× |
| Array.prototype.sort, decorated | 2978909 | 0.000 | 0.96× |
| fast-multisort | 2849391 | 0.000 | 1.00× |
| thenby (different order) | 2730667 | 0.000 | 1.04× |
| remeda.sortBy (different order) | 2259862 | 0.000 | 1.26× |
| sort-array | 2048000 | 0.000 | 1.39× |
| underscore.sortBy (different order) | 2048000 | 0.000 | 1.39× |
| ramda.sortWith (different order) | 1489455 | 0.001 | 1.91× |
| lodash.orderBy | 1365333 | 0.001 | 2.09× |
| sort-on | 315077 | 0.003 | 9.04× |
| natural-orderby | 303407 | 0.003 | 9.39× |
| sort-by (different order) | 20480 | 0.049 | 139.13× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5957818 | 0.000 | 0.50× |
| inline comparator chain, toSorted() | 5461333 | 0.000 | 0.55× |
| just-sort-by | 4096000 | 0.000 | 0.73× |
| fast-sort | 3120762 | 0.000 | 0.95× |
| thenby | 3120762 | 0.000 | 0.95× |
| fast-multisort | 2978909 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 2978909 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2849391 | 0.000 | 1.05× |
| remeda.sortBy | 2730667 | 0.000 | 1.09× |
| underscore.sortBy | 2340571 | 0.000 | 1.27× |
| sort-array | 2259862 | 0.000 | 1.32× |
| ramda.sortWith | 1872457 | 0.001 | 1.59× |
| lodash.orderBy | 1560381 | 0.001 | 1.91× |
| sort-on | 227556 | 0.004 | 13.09× |
| natural-orderby | 227556 | 0.004 | 13.09× |
| sort-by | 24381 | 0.041 | 122.18× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 2978909 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 2849391 | 0.000 | 0.66× |
| thenby | 2184533 | 0.000 | 0.86× |
| fast-sort | 1985939 | 0.001 | 0.94× |
| fast-multisort | 1872457 | 0.001 | 1.00× |
| es-toolkit.orderBy | 1820444 | 0.001 | 1.03× |
| remeda.sortBy | 1820444 | 0.001 | 1.03× |
| Array.prototype.sort, decorated | 1680410 | 0.001 | 1.11× |
| underscore.sortBy | 1424696 | 0.001 | 1.31× |
| ramda.sortWith | 1365333 | 0.001 | 1.37× |
| sort-array | 1365333 | 0.001 | 1.37× |
| just-sort-by | 992970 | 0.001 | 1.89× |
| lodash.orderBy | 885622 | 0.001 | 2.11× |
| sort-on | 170667 | 0.006 | 10.97× |
| natural-orderby | 62061 | 0.016 | 30.17× |
| sort-by | 21333 | 0.047 | 87.77× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 10485760 | 0.000 | 0.93× |
| fast-multisort | 9709037 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 9362286 | 0.000 | 1.04× |
| just-sort-by | 7084973 | 0.000 | 1.37× |
| thenby | 6241524 | 0.000 | 1.56× |
| es-toolkit.orderBy | 5461333 | 0.000 | 1.78× |
| fast-sort | 5242880 | 0.000 | 1.85× |
| Array.prototype.sort, decorated | 4228129 | 0.000 | 2.30× |
| remeda.sortBy | 3971879 | 0.000 | 2.44× |
| sort-array | 3855059 | 0.000 | 2.52× |
| ramda.sortWith | 3640889 | 0.000 | 2.67× |
| underscore.sortBy | 2978909 | 0.000 | 3.26× |
| lodash.orderBy | 1985939 | 0.001 | 4.89× |
| sort-on | 564966 | 0.002 | 17.19× |
| natural-orderby | 356174 | 0.003 | 27.26× |
| sort-by | 62061 | 0.016 | 156.44× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9709037 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 6553600 | 0.000 | 1.48× |
| inline comparator chain, toSorted() | 6241524 | 0.000 | 1.56× |
| just-sort-by | 3449263 | 0.000 | 2.81× |
| thenby | 3120762 | 0.000 | 3.11× |
| remeda.sortBy | 2621440 | 0.000 | 3.70× |
| fast-sort | 2621440 | 0.000 | 3.70× |
| es-toolkit.orderBy | 2520615 | 0.000 | 3.85× |
| Array.prototype.sort, decorated | 2340571 | 0.000 | 4.15× |
| underscore.sortBy | 2340571 | 0.000 | 4.15× |
| sort-array | 1771243 | 0.001 | 5.48× |
| ramda.sortWith | 1724632 | 0.001 | 5.63× |
| lodash.orderBy | 1424696 | 0.001 | 6.81× |
| natural-orderby | 327680 | 0.003 | 29.63× |
| sort-on | 204800 | 0.005 | 47.41× |
| sort-by | 25600 | 0.039 | 379.26× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5698783 | 0.000 | 0.52× |
| inline comparator chain, toSorted() | 5242880 | 0.000 | 0.57× |
| fast-multisort | 2978909 | 0.000 | 1.00× |
| just-sort-by | 2978909 | 0.000 | 1.00× |
| thenby | 2849391 | 0.000 | 1.05× |
| fast-sort | 2340571 | 0.000 | 1.27× |
| es-toolkit.orderBy | 2184533 | 0.000 | 1.36× |
| remeda.sortBy | 2184533 | 0.000 | 1.36× |
| underscore.sortBy | 2184533 | 0.000 | 1.36× |
| Array.prototype.sort, decorated | 1985939 | 0.001 | 1.50× |
| ramda.sortWith | 1560381 | 0.001 | 1.91× |
| sort-array | 1489455 | 0.001 | 2.00× |
| lodash.orderBy | 1213630 | 0.001 | 2.45× |
| natural-orderby | 303407 | 0.003 | 9.82× |
| sort-on | 234057 | 0.004 | 12.73× |
| sort-by | 23273 | 0.043 | 128.00× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 3449263 | 0.000 | 0.43× |
| inline comparator chain, toSorted() | 3449263 | 0.000 | 0.43× |
| es-toolkit.orderBy | 1560381 | 0.001 | 0.95× |
| Array.prototype.sort, decorated | 1560381 | 0.001 | 0.95× |
| fast-multisort | 1489455 | 0.001 | 1.00× |
| thenby (different order) | 1489455 | 0.001 | 1.00× |
| remeda.sortBy (different order) | 1424696 | 0.001 | 1.05× |
| sort-array (different order) | 1213630 | 0.001 | 1.23× |
| fast-sort (different order) | 1129931 | 0.001 | 1.32× |
| ramda.sortWith (different order) | 1092267 | 0.001 | 1.36× |
| lodash.orderBy | 655360 | 0.002 | 2.27× |
| sort-on (different order) | 178087 | 0.006 | 8.36× |
| natural-orderby (different order) | 46545 | 0.021 | 32.00× |
| sort-by (different order) | 22261 | 0.045 | 66.91× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 390095 | 0.003 | 1.00× |
| inline comparator chain, slice().sort() | 215579 | 0.005 | 1.81× |
| inline comparator chain, toSorted() | 204800 | 0.005 | 1.90× |
| underscore.sortBy | 146286 | 0.007 | 2.67× |
| thenby | 107789 | 0.009 | 3.62× |
| remeda.sortBy | 93091 | 0.011 | 4.19× |
| fast-sort | 93091 | 0.011 | 4.19× |
| Array.prototype.sort, decorated | 93091 | 0.011 | 4.19× |
| es-toolkit.orderBy | 78769 | 0.013 | 4.95× |
| sort-array | 70621 | 0.014 | 5.52× |
| ramda.sortWith | 60235 | 0.017 | 6.48× |
| just-sort-by (different order) | 55351 | 0.018 | 7.05× |
| lodash.orderBy | 53895 | 0.019 | 7.24× |
| natural-orderby (different order) | 23273 | 0.043 | 16.76× |
| sort-on (different order) | 11130 | 0.090 | 35.05× |
| sort-by | 1067 | 0.938 | 365.71× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 163840 | 0.006 | 1.00× |
| inline comparator chain, slice().sort() | 157538 | 0.006 | 1.04× |
| inline comparator chain, toSorted() | 157538 | 0.006 | 1.04× |
| underscore.sortBy | 97524 | 0.010 | 1.68× |
| thenby | 89043 | 0.011 | 1.84× |
| remeda.sortBy | 73143 | 0.014 | 2.24× |
| fast-sort | 73143 | 0.014 | 2.24× |
| Array.prototype.sort, decorated | 68267 | 0.015 | 2.40× |
| es-toolkit.orderBy | 66065 | 0.015 | 2.48× |
| sort-array | 51200 | 0.020 | 3.20× |
| ramda.sortWith | 48762 | 0.021 | 3.36× |
| just-sort-by (different order) | 36571 | 0.027 | 4.48× |
| lodash.orderBy | 35310 | 0.028 | 4.64× |
| natural-orderby (different order) | 9143 | 0.109 | 17.92× |
| sort-on (different order) | 7758 | 0.129 | 21.12× |
| sort-by | 941 | 1.063 | 174.08× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 256000 | 0.004 | 0.97× |
| fast-multisort | 248242 | 0.004 | 1.00× |
| inline comparator chain, toSorted() | 248242 | 0.004 | 1.00× |
| just-sort-by (different order) | 146286 | 0.007 | 1.70× |
| underscore.sortBy (different order) | 141241 | 0.007 | 1.76× |
| fast-sort (different order) | 117029 | 0.009 | 2.12× |
| thenby (different order) | 110703 | 0.009 | 2.24× |
| Array.prototype.sort, decorated | 105026 | 0.010 | 2.36× |
| es-toolkit.orderBy | 93091 | 0.011 | 2.67× |
| remeda.sortBy (different order) | 93091 | 0.011 | 2.67× |
| sort-array | 75852 | 0.013 | 3.27× |
| lodash.orderBy | 66065 | 0.015 | 3.76× |
| ramda.sortWith (different order) | 62061 | 0.016 | 4.00× |
| natural-orderby | 25600 | 0.039 | 9.70× |
| sort-on | 11130 | 0.090 | 22.30× |
| sort-by (different order) | 1000 | 1.000 | 248.24× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 273067 | 0.004 | 0.83× |
| inline comparator chain, toSorted() | 264258 | 0.004 | 0.86× |
| fast-multisort | 227556 | 0.004 | 1.00× |
| underscore.sortBy | 141241 | 0.007 | 1.61× |
| just-sort-by | 128000 | 0.008 | 1.78× |
| thenby | 113778 | 0.009 | 2.00× |
| fast-sort | 107789 | 0.009 | 2.11× |
| Array.prototype.sort, decorated | 97524 | 0.010 | 2.33× |
| es-toolkit.orderBy | 89043 | 0.011 | 2.56× |
| remeda.sortBy | 89043 | 0.011 | 2.56× |
| sort-array | 73143 | 0.014 | 3.11× |
| lodash.orderBy | 64000 | 0.016 | 3.56× |
| ramda.sortWith | 62061 | 0.016 | 3.67× |
| natural-orderby | 19692 | 0.051 | 11.56× |
| sort-on | 8533 | 0.117 | 26.67× |
| sort-by | 941 | 1.063 | 241.78× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 132129 | 0.008 | 0.67× |
| inline comparator chain, toSorted() | 128000 | 0.008 | 0.70× |
| fast-multisort | 89043 | 0.011 | 1.00× |
| thenby | 75852 | 0.013 | 1.17× |
| underscore.sortBy | 75852 | 0.013 | 1.17× |
| fast-sort | 70621 | 0.014 | 1.26× |
| remeda.sortBy | 66065 | 0.015 | 1.35× |
| es-toolkit.orderBy | 60235 | 0.017 | 1.48× |
| Array.prototype.sort, decorated | 60235 | 0.017 | 1.48× |
| ramda.sortWith | 46545 | 0.021 | 1.91× |
| sort-array | 44522 | 0.022 | 2.00× |
| just-sort-by | 40960 | 0.024 | 2.17× |
| lodash.orderBy | 34133 | 0.029 | 2.61× |
| sort-on | 7314 | 0.137 | 12.17× |
| natural-orderby | 5565 | 0.180 | 16.00× |
| sort-by | 914 | 1.094 | 97.39× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1680410 | 0.001 | 0.65× |
| inline comparator chain, toSorted() | 1365333 | 0.001 | 0.80× |
| fast-multisort | 1092267 | 0.001 | 1.00× |
| just-sort-by | 862316 | 0.001 | 1.27× |
| fast-sort | 712348 | 0.001 | 1.53× |
| thenby | 712348 | 0.001 | 1.53× |
| es-toolkit.orderBy | 606815 | 0.002 | 1.80× |
| Array.prototype.sort, decorated | 431158 | 0.002 | 2.53× |
| sort-array | 409600 | 0.002 | 2.67× |
| ramda.sortWith | 390095 | 0.003 | 2.80× |
| underscore.sortBy | 390095 | 0.003 | 2.80× |
| remeda.sortBy | 372364 | 0.003 | 2.93× |
| lodash.orderBy | 227556 | 0.004 | 4.80× |
| sort-on | 51200 | 0.020 | 21.33× |
| natural-orderby | 36571 | 0.027 | 29.87× |
| sort-by | 5565 | 0.180 | 196.27× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1092267 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 512000 | 0.002 | 2.13× |
| inline comparator chain, toSorted() | 496485 | 0.002 | 2.20× |
| just-sort-by | 240941 | 0.004 | 4.53× |
| underscore.sortBy | 227556 | 0.004 | 4.80× |
| fast-sort | 186182 | 0.005 | 5.87× |
| thenby | 178087 | 0.006 | 6.13× |
| remeda.sortBy | 170667 | 0.006 | 6.40× |
| Array.prototype.sort, decorated | 157538 | 0.006 | 6.93× |
| es-toolkit.orderBy | 146286 | 0.007 | 7.47× |
| sort-array | 110703 | 0.009 | 9.87× |
| lodash.orderBy | 102400 | 0.010 | 10.67× |
| ramda.sortWith | 102400 | 0.010 | 10.67× |
| natural-orderby | 31030 | 0.032 | 35.20× |
| sort-on | 11636 | 0.086 | 93.87× |
| sort-by | 1391 | 0.719 | 785.07× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 885622 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 744727 | 0.001 | 1.19× |
| inline comparator chain, toSorted() | 682667 | 0.001 | 1.30× |
| just-sort-by | 409600 | 0.002 | 2.16× |
| fast-sort | 327680 | 0.003 | 2.70× |
| thenby | 327680 | 0.003 | 2.70× |
| underscore.sortBy | 292571 | 0.003 | 3.03× |
| es-toolkit.orderBy | 273067 | 0.004 | 3.24× |
| Array.prototype.sort, decorated | 248242 | 0.004 | 3.57× |
| remeda.sortBy | 215579 | 0.005 | 4.11× |
| sort-array | 195048 | 0.005 | 4.54× |
| ramda.sortWith | 178087 | 0.006 | 4.97× |
| lodash.orderBy | 146286 | 0.007 | 6.05× |
| natural-orderby | 34133 | 0.029 | 25.95× |
| sort-on | 25600 | 0.039 | 34.59× |
| sort-by | 2560 | 0.391 | 345.95× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 186182 | 0.005 | 0.55× |
| inline comparator chain, toSorted() | 178087 | 0.006 | 0.57× |
| fast-multisort | 102400 | 0.010 | 1.00× |
| Array.prototype.sort, decorated | 66065 | 0.015 | 1.55× |
| remeda.sortBy (different order) | 62061 | 0.016 | 1.65× |
| thenby (different order) | 62061 | 0.016 | 1.65× |
| es-toolkit.orderBy | 60235 | 0.017 | 1.70× |
| sort-array (different order) | 48762 | 0.021 | 2.10× |
| lodash.orderBy | 42667 | 0.023 | 2.40× |
| ramda.sortWith (different order) | 42667 | 0.023 | 2.40× |
| fast-sort (different order) | 42667 | 0.023 | 2.40× |
| sort-on (different order) | 7529 | 0.133 | 13.60× |
| natural-orderby (different order) | 4267 | 0.234 | 24.00× |
| sort-by (different order) | 696 | 1.438 | 147.20× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42667 | 0.023 | 1.00× |
| inline comparator chain, slice().sort() | 12800 | 0.078 | 3.33× |
| inline comparator chain, toSorted() | 12800 | 0.078 | 3.33× |
| underscore.sortBy | 10240 | 0.098 | 4.17× |
| thenby | 6737 | 0.148 | 6.33× |
| remeda.sortBy | 6095 | 0.164 | 7.00× |
| fast-sort | 6095 | 0.164 | 7.00× |
| Array.prototype.sort, decorated | 6095 | 0.164 | 7.00× |
| es-toolkit.orderBy | 5333 | 0.188 | 8.00× |
| sort-array | 4571 | 0.219 | 9.33× |
| lodash.orderBy | 3879 | 0.258 | 11.00× |
| ramda.sortWith | 3879 | 0.258 | 11.00× |
| just-sort-by (different order) | 3556 | 0.281 | 12.00× |
| natural-orderby (different order) | 1730 | 0.578 | 24.67× |
| sort-on (different order) | 727 | 1.375 | 58.67× |
| sort-by | 65 | 15.500 | 661.33× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 8828 | 0.113 | 1.00× |
| inline comparator chain, slice().sort() | 7758 | 0.129 | 1.14× |
| inline comparator chain, toSorted() | 7758 | 0.129 | 1.14× |
| underscore.sortBy | 5565 | 0.180 | 1.59× |
| thenby | 4923 | 0.203 | 1.79× |
| fast-sort | 4571 | 0.219 | 1.93× |
| remeda.sortBy | 4414 | 0.227 | 2.00× |
| es-toolkit.orderBy | 4000 | 0.250 | 2.21× |
| Array.prototype.sort, decorated | 4000 | 0.250 | 2.21× |
| ramda.sortWith | 3048 | 0.328 | 2.90× |
| sort-array | 3048 | 0.328 | 2.90× |
| lodash.orderBy | 2286 | 0.438 | 3.86× |
| just-sort-by (different order) | 2207 | 0.453 | 4.00× |
| natural-orderby (different order) | 640 | 1.563 | 13.79× |
| sort-on (different order) | 516 | 1.938 | 17.10× |
| sort-by | 61 | 16.500 | 145.66× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24381 | 0.041 | 1.00× |
| inline comparator chain, slice().sort() | 14222 | 0.070 | 1.71× |
| inline comparator chain, toSorted() | 14222 | 0.070 | 1.71× |
| underscore.sortBy (different order) | 9481 | 0.105 | 2.57× |
| just-sort-by (different order) | 8258 | 0.121 | 2.95× |
| fast-sort (different order) | 7111 | 0.141 | 3.43× |
| thenby (different order) | 7111 | 0.141 | 3.43× |
| Array.prototype.sort, decorated | 6737 | 0.148 | 3.62× |
| es-toolkit.orderBy | 6095 | 0.164 | 4.00× |
| remeda.sortBy (different order) | 6095 | 0.164 | 4.00× |
| sort-array | 5120 | 0.195 | 4.76× |
| lodash.orderBy | 4414 | 0.227 | 5.52× |
| ramda.sortWith (different order) | 4129 | 0.242 | 5.90× |
| natural-orderby | 2000 | 0.500 | 12.19× |
| sort-on | 762 | 1.313 | 32.00× |
| sort-by (different order) | 65 | 15.500 | 377.90× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24381 | 0.041 | 1.00× |
| inline comparator chain, slice().sort() | 12800 | 0.078 | 1.90× |
| inline comparator chain, toSorted() | 12800 | 0.078 | 1.90× |
| underscore.sortBy | 9481 | 0.105 | 2.57× |
| just-sort-by | 8000 | 0.125 | 3.05× |
| thenby | 7111 | 0.141 | 3.43× |
| fast-sort | 6919 | 0.145 | 3.52× |
| remeda.sortBy | 6400 | 0.156 | 3.81× |
| Array.prototype.sort, decorated | 6400 | 0.156 | 3.81× |
| es-toolkit.orderBy | 5818 | 0.172 | 4.19× |
| sort-array | 4741 | 0.211 | 5.14× |
| lodash.orderBy | 4414 | 0.227 | 5.52× |
| ramda.sortWith | 4129 | 0.242 | 5.90× |
| natural-orderby | 1600 | 0.625 | 15.24× |
| sort-on | 593 | 1.688 | 41.14× |
| sort-by | 63 | 16.000 | 390.10× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 8000 | 0.125 | 1.00× |
| inline comparator chain, toSorted() | 6737 | 0.148 | 1.19× |
| inline comparator chain, slice().sort() | 6564 | 0.152 | 1.22× |
| underscore.sortBy | 4571 | 0.219 | 1.75× |
| thenby | 4267 | 0.234 | 1.88× |
| remeda.sortBy | 4129 | 0.242 | 1.94× |
| fast-sort | 4129 | 0.242 | 1.94× |
| es-toolkit.orderBy | 3657 | 0.273 | 2.19× |
| Array.prototype.sort, decorated | 3657 | 0.273 | 2.19× |
| ramda.sortWith | 2909 | 0.344 | 2.75× |
| sort-array | 2783 | 0.359 | 2.88× |
| just-sort-by | 2560 | 0.391 | 3.13× |
| lodash.orderBy | 2207 | 0.453 | 3.63× |
| sort-on | 471 | 2.125 | 17.00× |
| natural-orderby | 444 | 2.250 | 18.00× |
| sort-by | 59 | 17.000 | 136.00× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 178087 | 0.006 | 0.61× |
| inline comparator chain, toSorted() | 136533 | 0.007 | 0.79× |
| fast-multisort | 107789 | 0.009 | 1.00× |
| just-sort-by | 89043 | 0.011 | 1.21× |
| thenby | 75852 | 0.013 | 1.42× |
| fast-sort | 73143 | 0.014 | 1.47× |
| es-toolkit.orderBy | 62061 | 0.016 | 1.74× |
| Array.prototype.sort, decorated | 44522 | 0.022 | 2.42× |
| sort-array | 42667 | 0.023 | 2.53× |
| underscore.sortBy | 42667 | 0.023 | 2.53× |
| ramda.sortWith | 40960 | 0.024 | 2.63× |
| remeda.sortBy | 39385 | 0.025 | 2.74× |
| lodash.orderBy | 23273 | 0.043 | 4.63× |
| sort-on | 5120 | 0.195 | 21.05× |
| natural-orderby | 3368 | 0.297 | 32.00× |
| sort-by | 571 | 1.750 | 188.63× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 113778 | 0.009 | 1.00× |
| inline comparator chain, slice().sort() | 37926 | 0.026 | 3.00× |
| inline comparator chain, toSorted() | 36571 | 0.027 | 3.11× |
| underscore.sortBy | 18963 | 0.053 | 6.00× |
| just-sort-by | 17655 | 0.057 | 6.44× |
| remeda.sortBy | 12800 | 0.078 | 8.89× |
| fast-sort | 12800 | 0.078 | 8.89× |
| thenby | 12190 | 0.082 | 9.33× |
| Array.prototype.sort, decorated | 12190 | 0.082 | 9.33× |
| es-toolkit.orderBy | 10240 | 0.098 | 11.11× |
| lodash.orderBy | 7758 | 0.129 | 14.67× |
| sort-array | 7758 | 0.129 | 14.67× |
| ramda.sortWith | 7314 | 0.137 | 15.56× |
| natural-orderby | 2667 | 0.375 | 42.67× |
| sort-on | 821 | 1.219 | 138.67× |
| sort-by | 91 | 11.000 | 1251.56× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 97524 | 0.010 | 1.00× |
| inline comparator chain, slice().sort() | 85333 | 0.012 | 1.14× |
| inline comparator chain, toSorted() | 75852 | 0.013 | 1.29× |
| just-sort-by | 46545 | 0.021 | 2.10× |
| fast-sort | 36571 | 0.027 | 2.67× |
| thenby | 36571 | 0.027 | 2.67× |
| underscore.sortBy | 33032 | 0.030 | 2.95× |
| es-toolkit.orderBy | 30118 | 0.033 | 3.24× |
| Array.prototype.sort, decorated | 26947 | 0.037 | 3.62× |
| remeda.sortBy | 23273 | 0.043 | 4.19× |
| sort-array | 21333 | 0.047 | 4.57× |
| ramda.sortWith | 19692 | 0.051 | 4.95× |
| lodash.orderBy | 15515 | 0.064 | 6.29× |
| natural-orderby | 3200 | 0.313 | 30.48× |
| sort-on | 2909 | 0.344 | 33.52× |
| sort-by | 276 | 3.625 | 353.52× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 9846 | 0.102 | 0.93× |
| inline comparator chain, toSorted() | 9846 | 0.102 | 0.93× |
| fast-multisort | 9143 | 0.109 | 1.00× |
| Array.prototype.sort, decorated | 4129 | 0.242 | 2.21× |
| thenby (different order) | 3879 | 0.258 | 2.36× |
| remeda.sortBy (different order) | 3657 | 0.273 | 2.50× |
| es-toolkit.orderBy | 3556 | 0.281 | 2.57× |
| lodash.orderBy | 2909 | 0.344 | 3.14× |
| sort-array (different order) | 2909 | 0.344 | 3.14× |
| ramda.sortWith (different order) | 2667 | 0.375 | 3.43× |
| fast-sort (different order) | 2560 | 0.391 | 3.57× |
| sort-on (different order) | 432 | 2.313 | 21.14× |
| natural-orderby (different order) | 364 | 2.750 | 25.14× |
| sort-by (different order) | 40 | 25.000 | 228.57× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4129 | 0.242 | 1.00× |
| inline comparator chain, slice().sort() | 914 | 1.094 | 4.52× |
| inline comparator chain, toSorted() | 914 | 1.094 | 4.52× |
| underscore.sortBy | 762 | 1.313 | 5.42× |
| thenby | 500 | 2.000 | 8.26× |
| remeda.sortBy | 471 | 2.125 | 8.77× |
| Array.prototype.sort, decorated | 471 | 2.125 | 8.77× |
| fast-sort | 457 | 2.188 | 9.03× |
| es-toolkit.orderBy | 381 | 2.625 | 10.84× |
| sort-array | 333 | 3.000 | 12.39× |
| lodash.orderBy | 286 | 3.500 | 14.45× |
| ramda.sortWith | 276 | 3.625 | 14.97× |
| just-sort-by (different order) | 250 | 4.000 | 16.52× |
| natural-orderby (different order) | 129 | 7.750 | 32.00× |
| sort-on (different order) | 54 | 18.500 | 76.39× |
| sort-by | 5 | 217.000 | 896.00× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 640 | 1.563 | 1.00× |
| inline comparator chain, slice().sort() | 444 | 2.250 | 1.44× |
| inline comparator chain, toSorted() | 444 | 2.250 | 1.44× |
| thenby | 333 | 3.000 | 1.92× |
| fast-sort | 320 | 3.125 | 2.00× |
| underscore.sortBy | 320 | 3.125 | 2.00× |
| remeda.sortBy | 308 | 3.250 | 2.08× |
| es-toolkit.orderBy | 276 | 3.625 | 2.32× |
| Array.prototype.sort, decorated | 267 | 3.750 | 2.40× |
| ramda.sortWith | 222 | 4.500 | 2.88× |
| sort-array | 216 | 4.625 | 2.96× |
| lodash.orderBy | 148 | 6.750 | 4.32× |
| just-sort-by (different order) | 148 | 6.750 | 4.32× |
| natural-orderby (different order) | 43 | 23.000 | 14.72× |
| sort-on (different order) | 36 | 28.000 | 17.92× |
| sort-by | 4 | 236.000 | 151.04× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2783 | 0.359 | 1.00× |
| inline comparator chain, slice().sort() | 941 | 1.063 | 2.96× |
| inline comparator chain, toSorted() | 941 | 1.063 | 2.96× |
| underscore.sortBy (different order) | 667 | 1.500 | 4.17× |
| just-sort-by (different order) | 571 | 1.750 | 4.87× |
| fast-sort (different order) | 516 | 1.938 | 5.39× |
| thenby (different order) | 516 | 1.938 | 5.39× |
| remeda.sortBy (different order) | 457 | 2.188 | 6.09× |
| Array.prototype.sort, decorated | 444 | 2.250 | 6.26× |
| es-toolkit.orderBy | 432 | 2.313 | 6.43× |
| sort-array | 348 | 2.875 | 8.00× |
| ramda.sortWith (different order) | 308 | 3.250 | 9.04× |
| lodash.orderBy | 296 | 3.375 | 9.39× |
| natural-orderby | 143 | 7.000 | 19.48× |
| sort-on | 53 | 19.000 | 52.87× |
| sort-by (different order) | 5 | 221.000 | 614.96× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2667 | 0.375 | 1.00× |
| inline comparator chain, slice().sort() | 842 | 1.188 | 3.17× |
| inline comparator chain, toSorted() | 821 | 1.219 | 3.25× |
| underscore.sortBy | 667 | 1.500 | 4.00× |
| just-sort-by | 552 | 1.813 | 4.83× |
| thenby | 516 | 1.938 | 5.17× |
| fast-sort | 500 | 2.000 | 5.33× |
| remeda.sortBy | 444 | 2.250 | 6.00× |
| Array.prototype.sort, decorated | 432 | 2.313 | 6.17× |
| es-toolkit.orderBy | 421 | 2.375 | 6.33× |
| sort-array | 348 | 2.875 | 7.67× |
| ramda.sortWith | 296 | 3.375 | 9.00× |
| lodash.orderBy | 276 | 3.625 | 9.67× |
| natural-orderby | 118 | 8.500 | 22.67× |
| sort-on | 42 | 24.000 | 64.00× |
| sort-by | 4 | 235.000 | 626.67× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 552 | 1.813 | 1.00× |
| inline comparator chain, slice().sort() | 381 | 2.625 | 1.45× |
| inline comparator chain, toSorted() | 381 | 2.625 | 1.45× |
| underscore.sortBy | 296 | 3.375 | 1.86× |
| thenby | 286 | 3.500 | 1.93× |
| remeda.sortBy | 276 | 3.625 | 2.00× |
| fast-sort | 276 | 3.625 | 2.00× |
| es-toolkit.orderBy | 242 | 4.125 | 2.28× |
| Array.prototype.sort, decorated | 242 | 4.125 | 2.28× |
| sort-array | 205 | 4.875 | 2.69× |
| ramda.sortWith | 200 | 5.000 | 2.76× |
| just-sort-by | 174 | 5.750 | 3.17× |
| lodash.orderBy | 143 | 7.000 | 3.86× |
| natural-orderby | 34 | 29.000 | 16.00× |
| sort-on | 33 | 30.000 | 16.55× |
| sort-by | 4 | 246.000 | 135.72× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 15059 | 0.066 | 0.71× |
| inline comparator chain, toSorted() | 12190 | 0.082 | 0.88× |
| fast-multisort | 10667 | 0.094 | 1.00× |
| just-sort-by | 8000 | 0.125 | 1.33× |
| thenby | 7314 | 0.137 | 1.46× |
| fast-sort | 7111 | 0.141 | 1.50× |
| es-toolkit.orderBy | 5818 | 0.172 | 1.83× |
| underscore.sortBy | 4129 | 0.242 | 2.58× |
| ramda.sortWith | 4000 | 0.250 | 2.67× |
| sort-array | 4000 | 0.250 | 2.67× |
| Array.prototype.sort, decorated | 4000 | 0.250 | 2.67× |
| remeda.sortBy | 3879 | 0.258 | 2.75× |
| lodash.orderBy | 2207 | 0.453 | 4.83× |
| sort-on | 516 | 1.938 | 20.67× |
| natural-orderby | 296 | 3.375 | 36.00× |
| sort-by | 54 | 18.500 | 197.33× |

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
| Array.prototype.sort, decorated | 941 | 1.063 | 11.83× |
| es-toolkit.orderBy | 842 | 1.188 | 13.22× |
| sort-array | 615 | 1.625 | 18.09× |
| lodash.orderBy | 593 | 1.688 | 18.78× |
| ramda.sortWith | 552 | 1.813 | 20.17× |
| natural-orderby | 211 | 4.750 | 52.87× |
| sort-on | 63 | 16.000 | 178.09× |
| sort-by | 7 | 141.000 | 1569.39× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9846 | 0.102 | 1.00× |
| inline comparator chain, slice().sort() | 6564 | 0.152 | 1.50× |
| inline comparator chain, toSorted() | 5818 | 0.172 | 1.69× |
| just-sort-by | 3556 | 0.281 | 2.77× |
| fast-sort | 2909 | 0.344 | 3.38× |
| thenby | 2909 | 0.344 | 3.38× |
| underscore.sortBy | 2667 | 0.375 | 3.69× |
| es-toolkit.orderBy | 2286 | 0.438 | 4.31× |
| Array.prototype.sort, decorated | 2207 | 0.453 | 4.46× |
| remeda.sortBy | 1939 | 0.516 | 5.08× |
| sort-array | 1684 | 0.594 | 5.85× |
| ramda.sortWith | 1524 | 0.656 | 6.46× |
| lodash.orderBy | 1231 | 0.813 | 8.00× |
| natural-orderby | 276 | 3.625 | 35.69× |
| sort-on | 222 | 4.500 | 44.31× |
| sort-by | 20 | 49.000 | 482.46× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1280 | 0.781 | 1.00× |
| inline comparator chain, slice().sort() | 615 | 1.625 | 2.08× |
| inline comparator chain, toSorted() | 615 | 1.625 | 2.08× |
| Array.prototype.sort, decorated | 286 | 3.500 | 4.48× |
| thenby (different order) | 267 | 3.750 | 4.80× |
| remeda.sortBy (different order) | 250 | 4.000 | 5.12× |
| es-toolkit.orderBy | 242 | 4.125 | 5.28× |
| lodash.orderBy | 200 | 5.000 | 6.40× |
| sort-array (different order) | 200 | 5.000 | 6.40× |
| ramda.sortWith (different order) | 182 | 5.500 | 7.04× |
| fast-sort (different order) | 167 | 6.000 | 7.68× |
| natural-orderby (different order) | 32 | 31.000 | 39.68× |
| sort-on (different order) | 29 | 34.000 | 43.52× |
| sort-by (different order) | 2 | 451.000 | 577.28× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 348 | 2.875 | 1.00× |
| inline comparator chain, slice().sort() | 71 | 14.000 | 4.87× |
| inline comparator chain, toSorted() | 71 | 14.000 | 4.87× |
| underscore.sortBy | 61 | 16.500 | 5.74× |
| thenby | 40 | 25.000 | 8.70× |
| remeda.sortBy | 37 | 27.000 | 9.39× |
| fast-sort | 36 | 28.000 | 9.74× |
| Array.prototype.sort, decorated | 34 | 29.000 | 10.09× |
| es-toolkit.orderBy | 31 | 32.000 | 11.13× |
| sort-array | 26 | 38.000 | 13.22× |
| ramda.sortWith | 22 | 45.000 | 15.65× |
| just-sort-by (different order) | 19 | 52.000 | 18.09× |
| lodash.orderBy | 19 | 53.000 | 18.43× |
| natural-orderby (different order) | 8 | 133.000 | 46.26× |
| sort-on (different order) | 4 | 256.000 | 89.04× |
| sort-by | 0 | 3159.000 | 1098.78× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 45 | 22.000 | 1.00× |
| inline comparator chain, toSorted() | 29 | 34.000 | 1.55× |
| inline comparator chain, slice().sort() | 29 | 35.000 | 1.59× |
| fast-sort | 22 | 46.000 | 2.09× |
| thenby | 22 | 46.000 | 2.09× |
| remeda.sortBy | 21 | 48.000 | 2.18× |
| underscore.sortBy | 21 | 48.000 | 2.18× |
| es-toolkit.orderBy | 19 | 54.000 | 2.45× |
| Array.prototype.sort, decorated | 16 | 61.000 | 2.77× |
| ramda.sortWith | 15 | 65.000 | 2.95× |
| sort-array | 15 | 67.000 | 3.05× |
| just-sort-by (different order) | 9 | 112.000 | 5.09× |
| lodash.orderBy | 9 | 114.000 | 5.18× |
| natural-orderby (different order) | 3 | 366.000 | 16.64× |
| sort-on (different order) | 3 | 369.000 | 16.77× |
| sort-by | 0 | 3472.000 | 157.82× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 267 | 3.750 | 1.00× |
| inline comparator chain, toSorted() | 67 | 15.000 | 4.00× |
| inline comparator chain, slice().sort() | 65 | 15.500 | 4.13× |
| underscore.sortBy (different order) | 50 | 20.000 | 5.33× |
| just-sort-by (different order) | 40 | 25.000 | 6.67× |
| thenby (different order) | 38 | 26.000 | 6.93× |
| fast-sort (different order) | 37 | 27.000 | 7.20× |
| remeda.sortBy (different order) | 33 | 30.000 | 8.00× |
| es-toolkit.orderBy | 31 | 32.000 | 8.53× |
| Array.prototype.sort, decorated | 31 | 32.000 | 8.53× |
| sort-array | 26 | 38.000 | 10.13× |
| ramda.sortWith (different order) | 22 | 45.000 | 12.00× |
| lodash.orderBy | 15 | 65.000 | 17.33× |
| natural-orderby | 9 | 110.000 | 29.33× |
| sort-on | 4 | 251.000 | 66.93× |
| sort-by (different order) | 0 | 3223.000 | 859.47× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 242 | 4.125 | 1.00× |
| inline comparator chain, toSorted() | 59 | 17.000 | 4.12× |
| inline comparator chain, slice().sort() | 56 | 18.000 | 4.36× |
| underscore.sortBy | 48 | 21.000 | 5.09× |
| just-sort-by | 42 | 24.000 | 5.82× |
| thenby | 37 | 27.000 | 6.55× |
| fast-sort | 36 | 28.000 | 6.79× |
| remeda.sortBy | 33 | 30.000 | 7.27× |
| es-toolkit.orderBy | 31 | 32.000 | 7.76× |
| Array.prototype.sort, decorated | 29 | 35.000 | 8.48× |
| sort-array | 26 | 39.000 | 9.45× |
| ramda.sortWith | 22 | 45.000 | 10.91× |
| lodash.orderBy | 14 | 72.000 | 17.45× |
| natural-orderby | 8 | 125.000 | 30.30× |
| sort-on | 3 | 326.000 | 79.03× |
| sort-by | 0 | 3401.000 | 824.48× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 33 | 30.000 | 1.00× |
| inline comparator chain, toSorted() | 26 | 38.000 | 1.27× |
| inline comparator chain, slice().sort() | 26 | 39.000 | 1.30× |
| underscore.sortBy | 20 | 50.000 | 1.67× |
| fast-sort | 19 | 52.000 | 1.73× |
| thenby | 19 | 52.000 | 1.73× |
| remeda.sortBy | 19 | 54.000 | 1.80× |
| es-toolkit.orderBy | 17 | 60.000 | 2.00× |
| Array.prototype.sort, decorated | 15 | 68.000 | 2.27× |
| sort-array | 14 | 72.000 | 2.40× |
| ramda.sortWith | 14 | 73.000 | 2.43× |
| just-sort-by | 11 | 87.000 | 2.90× |
| lodash.orderBy | 8 | 121.000 | 4.03× |
| sort-on | 2 | 401.000 | 13.37× |
| natural-orderby (different order) | 2 | 458.000 | 15.27× |
| sort-by | 0 | 3532.000 | 117.73× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1143 | 0.875 | 0.93× |
| fast-multisort | 1067 | 0.938 | 1.00× |
| inline comparator chain, toSorted() | 1000 | 1.000 | 1.07× |
| just-sort-by | 696 | 1.438 | 1.53× |
| thenby | 640 | 1.563 | 1.67× |
| fast-sort | 615 | 1.625 | 1.73× |
| es-toolkit.orderBy | 516 | 1.938 | 2.07× |
| sort-array | 381 | 2.625 | 2.80× |
| ramda.sortWith | 364 | 2.750 | 2.93× |
| underscore.sortBy | 364 | 2.750 | 2.93× |
| remeda.sortBy | 348 | 2.875 | 3.07× |
| Array.prototype.sort, decorated | 276 | 3.625 | 3.87× |
| lodash.orderBy | 154 | 6.500 | 6.93× |
| sort-on | 49 | 20.500 | 21.87× |
| natural-orderby | 23 | 43.000 | 45.87× |
| sort-by | 5 | 195.000 | 208.00× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1143 | 0.875 | 1.00× |
| inline comparator chain, slice().sort() | 235 | 4.250 | 4.86× |
| inline comparator chain, toSorted() | 229 | 4.375 | 5.00× |
| underscore.sortBy | 111 | 9.000 | 10.29× |
| just-sort-by | 111 | 9.000 | 10.29× |
| remeda.sortBy | 87 | 11.500 | 13.14× |
| fast-sort | 87 | 11.500 | 13.14× |
| thenby | 77 | 13.000 | 14.86× |
| Array.prototype.sort, decorated | 77 | 13.000 | 14.86× |
| es-toolkit.orderBy | 67 | 15.000 | 17.14× |
| sort-array | 50 | 20.000 | 22.86× |
| ramda.sortWith | 48 | 21.000 | 24.00× |
| lodash.orderBy | 45 | 22.000 | 25.14× |
| natural-orderby | 15 | 66.000 | 75.43× |
| sort-on | 5 | 195.000 | 222.86× |
| sort-by | 1 | 1981.000 | 2264.00× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 970 | 1.031 | 1.00× |
| inline comparator chain, slice().sort() | 615 | 1.625 | 1.58× |
| inline comparator chain, toSorted() | 593 | 1.688 | 1.64× |
| just-sort-by | 381 | 2.625 | 2.55× |
| fast-sort | 308 | 3.250 | 3.15× |
| thenby | 308 | 3.250 | 3.15× |
| es-toolkit.orderBy | 250 | 4.000 | 3.88× |
| underscore.sortBy | 229 | 4.375 | 4.24× |
| Array.prototype.sort, decorated | 211 | 4.750 | 4.61× |
| remeda.sortBy | 200 | 5.000 | 4.85× |
| sort-array | 174 | 5.750 | 5.58× |
| ramda.sortWith | 167 | 6.000 | 5.82× |
| lodash.orderBy | 77 | 13.000 | 12.61× |
| sort-on | 24 | 42.000 | 40.73× |
| natural-orderby | 22 | 46.000 | 44.61× |
| sort-by | 2 | 451.000 | 437.33× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 105 | 9.500 | 1.00× |
| inline comparator chain, slice().sort() | 43 | 23.000 | 2.42× |
| inline comparator chain, toSorted() | 43 | 23.000 | 2.42× |
| thenby (different order) | 21 | 48.000 | 5.05× |
| Array.prototype.sort, decorated | 21 | 48.000 | 5.05× |
| remeda.sortBy (different order) | 18 | 55.000 | 5.79× |
| es-toolkit.orderBy | 17 | 59.000 | 6.21× |
| sort-array (different order) | 15 | 66.000 | 6.95× |
| ramda.sortWith (different order) | 14 | 73.000 | 7.68× |
| lodash.orderBy | 12 | 82.000 | 8.63× |
| fast-sort (different order) | 12 | 83.000 | 8.74× |
| natural-orderby (different order) | 3 | 391.000 | 41.16× |
| sort-on (different order) | 2 | 475.000 | 50.00× |
| sort-by (different order) | 0 | 6005.000 | 632.11× |

</details>

<!-- browsers:end -->

Run `pnpm bench` (or `pnpm bench --sizes=100,10000` for a subset) and `pnpm bench:browsers` to reproduce; `pnpm bench:readme` rewrites the tables above, and `pnpm bench:floor` writes [benchmark/floor.md](benchmark/floor.md), the cost of the contract alone. What each competitor does and which of their ideas ended up in here: [benchmark/COMPETITORS.md](benchmark/COMPETITORS.md).

The honest footnote: a hand-written comparator chain passed to the native sort is the thing to beat. It wins at ten rows by up to 2.3×, where a sort takes a few hundred nanoseconds and our key pass is most of it, and at a hundred rows by up to 1.8× on three keys. It also wins on input that is already sorted, reversed or has one row moved, which the native sort handles in linear time without a key pass: in Chromium by up to 2× and in node by up to 1.3× at every size from a thousand rows, in Firefox by up to 1.6× on already sorted input up to a hundred thousand rows, and in WebKit by 2.3× on already sorted input at ten thousand rows. Most of both leads is the contract rather than the sort: calling every getter once and returning a new array, with no comparison at all, takes 9–58% of the inline chain's time at ten rows and 78–85% of it on those ordered shapes from ten thousand rows in node, because the native sort reads keys inside its comparator and has no separate pass. On one row moved at ten thousand rows our scan alone takes as long as the inline chain's whole sort (64 µs against 63) and merging adds 10 µs. At ten rows some libraries are ahead as well, by up to 3× in WebKit, 1.4× in Firefox and 1.2× in Chromium, a couple of hundred nanoseconds that move with the JIT's state; in node none is. From a hundred rows up no library beats us, except in WebKit: just-sort-by on one row moved at a thousand rows (by 12%), and just-sort-by, thenby and fast-sort on already sorted input at ten thousand (by 22%, 15% and 11%). There JavaScriptCore has specialised our key loop to the previous case's getter, leaves the optimised code on entry (889 exits during that case when the same sequence runs in the `jsc` shell) and runs it in its baseline tier: 105 µs, where reading every key first and scanning the array after took 45 µs. That single pass is 6–29% faster in V8, and reading keys in chunks through a separate function, which keeps the getter call out of the scan, is 11–31% slower there, so the single pass stays. From a thousand rows up on the six shapes that need sorting we lead the inline chain by up to 8× and are within 8% of it at worst (three keys, a thousand rows, Firefox), and we lead the closest library by 1.4 to 9.7×. Absolute times at a million rows move by up to half between runs with the heap's state. Between the last two runs no lead on those six shapes changed sign; on sorted, reversed and one-row-moved input, where both sides are linear, ratios near 1× land on either side. The tables are the only argument, and the scripts above regenerate them from scratch.

## How

Numbers go through a stable radix sort on their float64 bits, strings through buckets and a radix sort over the characters that actually differ, ties recurse into the next rule, and anything exotic falls back to the lodash comparator so the order stays identical to lodash. Inputs that are already in order are passed through, and inputs that are nearly in order (a list that came back sorted from the server, then had a few rows edited) are cut into their ordered runs and merged with galloping, the way TimSort does it, but on the extracted keys instead of through a comparator callback. Up to 128 rows the radix passes cost more than they save: a single string column with a repeat among its first 16 keys is ranked by its distinct keys and placed by counting, other leading string columns are bucketed by the first character that differs and each bucket is sorted in place by binary insertion, and numbers, or several columns led by a number, go to the engine's sort. Binary insertion also sorts inputs of up to 16 rows whose keys compare consistently. The rest is bookkeeping.

## License

MIT
