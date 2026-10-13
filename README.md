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
- Every path returns the same elements, once each, and the result never depends on which internal path ran.

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

Every competitor is run with its own multi-key API where it has one and checked against the lodash permutation first; `(different order)` marks results that differ (mostly where `null` lands), and the run aborts if `fast-multisort` itself differs. `inline comparator chain` is the hand-written baseline, `(a, b) => str(a.name, b.name) || rankDesc(a.rank, b.rank) || str(a.created, b.created)` passed to `rows.slice().sort()` and to `rows.toSorted()`, relying on the native sort's stability. Sizes run from 1 row to 1 million, every case and every library at every size. Numbers below are from `pnpm bench --markdown`, Apple M5 Max, Node 24. Ops/sec, higher is better; the last column is how many times slower than `fast-multisort`.

<!-- bench:start -->

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, slice().sort() | 0.43× | 1.21× | 5.38× | 46 | 0 |
| inline comparator chain, toSorted() | 0.39× | 1.70× | 5.45× | 46 | 0 |
| just-sort-by | 0.80× | 2.11× | 17.89× | 37 | 13 |
| thenby | 0.88× | 2.14× | 12.24× | 46 | 12 |
| underscore.sortBy | 0.83× | 2.20× | 5.97× | 37 | 5 |
| Array.prototype.sort, decorated | 0.61× | 2.36× | 14.82× | 46 | 0 |
| es-toolkit.orderBy | 0.90× | 2.38× | 11.39× | 46 | 0 |
| fast-sort | 1.04× | 2.40× | 13.81× | 46 | 6 |
| remeda.sortBy | 0.89× | 2.70× | 12.65× | 46 | 12 |
| lodash.orderBy | 1.11× | 2.92× | 14.38× | 46 | 0 |
| ramda.sortWith | 1.58× | 4.04× | 15.94× | 43 | 10 |
| sort-array | 0.85× | 4.27× | 19.56× | 43 | 5 |
| natural-orderby | 7.04× | 17.18× | 54.19× | 43 | 13 |
| sort-on | 1.26× | 24.84× | 97.71× | 43 | 13 |
| sort-by | 1.88× | 167.05× | 724.03× | 43 | 10 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 50171596 | 0.000 | 0.89× |
| fast-multisort | 44833730 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 40249494 | 0.000 | 1.11× |
| sort-on | 35504332 | 0.000 | 1.26× |
| Array.prototype.sort, decorated | 34375421 | 0.000 | 1.30× |
| es-toolkit.orderBy | 34128439 | 0.000 | 1.31× |
| thenby | 24646295 | 0.000 | 1.82× |
| inline comparator chain, toSorted() | 24145144 | 0.000 | 1.86× |
| ramda.sortWith | 24042370 | 0.000 | 1.86× |
| sort-by | 23598373 | 0.000 | 1.90× |
| remeda.sortBy | 23578015 | 0.000 | 1.90× |
| sort-array | 23148350 | 0.000 | 1.94× |
| fast-sort | 22907267 | 0.000 | 1.96× |
| underscore.sortBy | 22406511 | 0.000 | 2.00× |
| lodash.orderBy | 21331906 | 0.000 | 2.10× |
| natural-orderby | 3626406 | 0.000 | 12.36× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 49696761 | 0.000 | 0.90× |
| fast-multisort | 44925931 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 36275444 | 0.000 | 1.24× |
| Array.prototype.sort, decorated | 32108792 | 0.000 | 1.40× |
| sort-on | 31010674 | 0.000 | 1.45× |
| es-toolkit.orderBy | 27051600 | 0.000 | 1.66× |
| ramda.sortWith | 24482157 | 0.000 | 1.84× |
| inline comparator chain, toSorted() | 23667217 | 0.000 | 1.90× |
| fast-sort | 23549077 | 0.000 | 1.91× |
| thenby | 23539843 | 0.000 | 1.91× |
| remeda.sortBy | 23358078 | 0.000 | 1.92× |
| sort-array | 23255835 | 0.000 | 1.93× |
| sort-by | 23158224 | 0.000 | 1.94× |
| underscore.sortBy | 21081073 | 0.000 | 2.13× |
| lodash.orderBy | 17985559 | 0.000 | 2.50× |
| natural-orderby | 1672401 | 0.001 | 26.86× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 51623337 | 0.000 | 0.85× |
| fast-multisort | 43995627 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 36214395 | 0.000 | 1.21× |
| sort-on | 34786273 | 0.000 | 1.26× |
| Array.prototype.sort, decorated | 32758779 | 0.000 | 1.34× |
| es-toolkit.orderBy | 32731620 | 0.000 | 1.34× |
| thenby | 25503538 | 0.000 | 1.73× |
| ramda.sortWith | 23944110 | 0.000 | 1.84× |
| inline comparator chain, toSorted() | 23881454 | 0.000 | 1.84× |
| remeda.sortBy | 23665096 | 0.000 | 1.86× |
| fast-sort | 23466231 | 0.000 | 1.87× |
| sort-by | 23394517 | 0.000 | 1.88× |
| sort-array | 23335130 | 0.000 | 1.89× |
| underscore.sortBy | 21457981 | 0.000 | 2.05× |
| lodash.orderBy | 18973530 | 0.000 | 2.32× |
| natural-orderby | 2934974 | 0.000 | 14.99× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 50393300 | 0.000 | 0.92× |
| fast-multisort | 46581866 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 37764680 | 0.000 | 1.23× |
| es-toolkit.orderBy | 36102671 | 0.000 | 1.29× |
| Array.prototype.sort, decorated | 33950749 | 0.000 | 1.37× |
| sort-on | 32510996 | 0.000 | 1.43× |
| thenby | 24249100 | 0.000 | 1.92× |
| inline comparator chain, toSorted() | 24181366 | 0.000 | 1.93× |
| ramda.sortWith | 24124656 | 0.000 | 1.93× |
| fast-sort | 23645104 | 0.000 | 1.97× |
| sort-by | 23460115 | 0.000 | 1.99× |
| sort-array | 23420405 | 0.000 | 1.99× |
| remeda.sortBy | 23403815 | 0.000 | 1.99× |
| underscore.sortBy | 21946416 | 0.000 | 2.12× |
| lodash.orderBy | 18979683 | 0.000 | 2.45× |
| natural-orderby | 2711312 | 0.000 | 17.18× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 52994109 | 0.000 | 0.87× |
| fast-multisort | 45957690 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 37961020 | 0.000 | 1.21× |
| Array.prototype.sort, decorated | 33652727 | 0.000 | 1.37× |
| sort-on | 33432120 | 0.000 | 1.37× |
| es-toolkit.orderBy | 33328600 | 0.000 | 1.38× |
| ramda.sortWith | 24356763 | 0.000 | 1.89× |
| inline comparator chain, toSorted() | 23868909 | 0.000 | 1.93× |
| thenby | 23842036 | 0.000 | 1.93× |
| sort-array | 23473134 | 0.000 | 1.96× |
| fast-sort | 23464011 | 0.000 | 1.96× |
| sort-by | 23445480 | 0.000 | 1.96× |
| remeda.sortBy | 23078935 | 0.000 | 1.99× |
| underscore.sortBy | 22061226 | 0.000 | 2.08× |
| lodash.orderBy | 18877741 | 0.000 | 2.43× |
| natural-orderby | 1787800 | 0.001 | 25.71× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 49284291 | 0.000 | 0.96× |
| fast-multisort | 47333518 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 38488614 | 0.000 | 1.23× |
| Array.prototype.sort, decorated | 32795678 | 0.000 | 1.44× |
| es-toolkit.orderBy | 31064606 | 0.000 | 1.52× |
| sort-on | 29136688 | 0.000 | 1.62× |
| inline comparator chain, toSorted() | 24305270 | 0.000 | 1.95× |
| ramda.sortWith | 23818409 | 0.000 | 1.99× |
| sort-by | 23572617 | 0.000 | 2.01× |
| sort-array | 23452606 | 0.000 | 2.02× |
| fast-sort | 23449290 | 0.000 | 2.02× |
| thenby | 23037888 | 0.000 | 2.05× |
| remeda.sortBy | 22439778 | 0.000 | 2.11× |
| underscore.sortBy | 21293586 | 0.000 | 2.22× |
| lodash.orderBy | 19669545 | 0.000 | 2.41× |
| natural-orderby | 3458330 | 0.000 | 13.69× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 52628789 | 0.000 | 0.90× |
| fast-multisort | 47336134 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 40021665 | 0.000 | 1.18× |
| sort-on | 36256134 | 0.000 | 1.31× |
| es-toolkit.orderBy | 35880685 | 0.000 | 1.32× |
| Array.prototype.sort, decorated | 31728204 | 0.000 | 1.49× |
| thenby | 25900645 | 0.000 | 1.83× |
| ramda.sortWith | 24348130 | 0.000 | 1.94× |
| inline comparator chain, toSorted() | 24237819 | 0.000 | 1.95× |
| fast-sort | 23737338 | 0.000 | 1.99× |
| sort-by | 23602744 | 0.000 | 2.01× |
| remeda.sortBy | 23525062 | 0.000 | 2.01× |
| sort-array | 23297434 | 0.000 | 2.03× |
| underscore.sortBy | 21494700 | 0.000 | 2.20× |
| lodash.orderBy | 18779560 | 0.000 | 2.52× |
| natural-orderby | 3487524 | 0.000 | 13.57× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 47170366 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 40127325 | 0.000 | 1.18× |
| es-toolkit.orderBy | 36419728 | 0.000 | 1.30× |
| sort-on | 34732243 | 0.000 | 1.36× |
| Array.prototype.sort, decorated | 32323253 | 0.000 | 1.46× |
| inline comparator chain, toSorted() | 23899740 | 0.000 | 1.97× |
| sort-array | 23510458 | 0.000 | 2.01× |
| sort-by | 23035319 | 0.000 | 2.05× |
| ramda.sortWith | 21561137 | 0.000 | 2.19× |
| remeda.sortBy | 17741514 | 0.000 | 2.66× |
| lodash.orderBy | 15329546 | 0.000 | 3.08× |
| thenby | 11006012 | 0.000 | 4.29× |
| fast-sort | 4342274 | 0.000 | 10.86× |
| natural-orderby | 871464 | 0.001 | 54.13× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4589237 | 0.000 | 0.52× |
| inline comparator chain, slice().sort() | 4515578 | 0.000 | 0.53× |
| Array.prototype.sort, decorated | 3886454 | 0.000 | 0.61× |
| sort-array | 2788090 | 0.000 | 0.85× |
| underscore.sortBy | 2704753 | 0.000 | 0.88× |
| fast-multisort | 2380025 | 0.000 | 1.00× |
| thenby | 2338489 | 0.000 | 1.02× |
| remeda.sortBy | 2329360 | 0.000 | 1.02× |
| es-toolkit.orderBy | 2281140 | 0.000 | 1.04× |
| lodash.orderBy | 2137414 | 0.001 | 1.11× |
| fast-sort | 1978738 | 0.001 | 1.20× |
| ramda.sortWith | 1281612 | 0.001 | 1.86× |
| just-sort-by (different order) | 944502 | 0.001 | 2.52× |
| natural-orderby (different order) | 321278 | 0.003 | 7.41× |
| sort-on (different order) | 227656 | 0.005 | 10.45× |
| sort-by | 29570 | 0.037 | 80.49× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 3712754 | 0.000 | 0.52× |
| inline comparator chain, slice().sort() | 3579578 | 0.000 | 0.54× |
| underscore.sortBy | 2280260 | 0.000 | 0.85× |
| thenby | 2174414 | 0.000 | 0.89× |
| Array.prototype.sort, decorated | 2109599 | 0.000 | 0.92× |
| remeda.sortBy | 2032679 | 0.001 | 0.96× |
| es-toolkit.orderBy | 1975594 | 0.001 | 0.98× |
| fast-multisort | 1944183 | 0.001 | 1.00× |
| fast-sort | 1863989 | 0.001 | 1.04× |
| lodash.orderBy | 1705367 | 0.001 | 1.14× |
| sort-array | 1281274 | 0.001 | 1.52× |
| ramda.sortWith | 1229338 | 0.001 | 1.58× |
| just-sort-by | 850739 | 0.001 | 2.29× |
| sort-on | 186109 | 0.005 | 10.45× |
| natural-orderby | 129856 | 0.008 | 14.97× |
| sort-by | 27555 | 0.037 | 70.56× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6913616 | 0.000 | 0.39× |
| inline comparator chain, slice().sort() | 6397420 | 0.000 | 0.43× |
| just-sort-by (different order) | 3400918 | 0.000 | 0.80× |
| thenby (different order) | 3055871 | 0.000 | 0.89× |
| es-toolkit.orderBy | 3038352 | 0.000 | 0.90× |
| underscore.sortBy (different order) | 2924761 | 0.000 | 0.93× |
| remeda.sortBy (different order) | 2873251 | 0.000 | 0.95× |
| Array.prototype.sort, decorated | 2840043 | 0.000 | 0.96× |
| fast-multisort | 2725888 | 0.000 | 1.00× |
| fast-sort | 2503517 | 0.000 | 1.09× |
| lodash.orderBy | 2290490 | 0.000 | 1.19× |
| ramda.sortWith (different order) | 1648828 | 0.001 | 1.65× |
| sort-array | 1596981 | 0.001 | 1.71× |
| natural-orderby | 321291 | 0.003 | 8.48× |
| sort-on | 281750 | 0.004 | 9.67× |
| sort-by (different order) | 35062 | 0.029 | 77.74× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 5031088 | 0.000 | 0.40× |
| inline comparator chain, slice().sort() | 4667884 | 0.000 | 0.43× |
| underscore.sortBy | 2424864 | 0.000 | 0.83× |
| just-sort-by | 2387939 | 0.000 | 0.84× |
| thenby | 2287413 | 0.000 | 0.88× |
| remeda.sortBy | 2244673 | 0.000 | 0.89× |
| es-toolkit.orderBy | 2146504 | 0.000 | 0.93× |
| fast-multisort | 2004118 | 0.001 | 1.00× |
| Array.prototype.sort, decorated | 1993477 | 0.001 | 1.01× |
| fast-sort | 1802170 | 0.001 | 1.11× |
| lodash.orderBy | 1727071 | 0.001 | 1.16× |
| ramda.sortWith | 1177832 | 0.001 | 1.70× |
| sort-array | 1108975 | 0.001 | 1.81× |
| natural-orderby | 267260 | 0.004 | 7.50× |
| sort-on | 185464 | 0.005 | 10.81× |
| sort-by | 26159 | 0.039 | 76.61× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4086281 | 0.000 | 0.54× |
| inline comparator chain, slice().sort() | 3913277 | 0.000 | 0.56× |
| fast-multisort | 2206855 | 0.000 | 1.00× |
| thenby | 2206520 | 0.000 | 1.00× |
| remeda.sortBy | 2176887 | 0.000 | 1.01× |
| es-toolkit.orderBy | 2163703 | 0.000 | 1.02× |
| underscore.sortBy | 1969189 | 0.001 | 1.12× |
| Array.prototype.sort, decorated | 1950199 | 0.001 | 1.13× |
| fast-sort | 1762406 | 0.001 | 1.25× |
| lodash.orderBy | 1636019 | 0.001 | 1.35× |
| just-sort-by | 1431706 | 0.001 | 1.54× |
| ramda.sortWith | 1309765 | 0.001 | 1.68× |
| sort-array | 1193391 | 0.001 | 1.85× |
| sort-on | 184694 | 0.005 | 11.95× |
| natural-orderby | 174929 | 0.006 | 12.62× |
| sort-by | 28924 | 0.035 | 76.30× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 11497637 | 0.000 | 0.47× |
| inline comparator chain, slice().sort() | 9936610 | 0.000 | 0.55× |
| just-sort-by | 6342776 | 0.000 | 0.86× |
| fast-multisort | 5424504 | 0.000 | 1.00× |
| es-toolkit.orderBy | 5423017 | 0.000 | 1.00× |
| thenby | 5381206 | 0.000 | 1.01× |
| remeda.sortBy | 5222716 | 0.000 | 1.04× |
| Array.prototype.sort, decorated | 4947520 | 0.000 | 1.10× |
| fast-sort | 3808997 | 0.000 | 1.42× |
| underscore.sortBy | 3789082 | 0.000 | 1.43× |
| ramda.sortWith | 3258352 | 0.000 | 1.66× |
| lodash.orderBy | 3192895 | 0.000 | 1.70× |
| sort-array | 3150561 | 0.000 | 1.72× |
| sort-on | 532446 | 0.002 | 10.19× |
| natural-orderby | 389395 | 0.003 | 13.93× |
| sort-by | 74301 | 0.014 | 73.01× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 11236072 | 0.000 | 0.47× |
| inline comparator chain, slice().sort() | 9960005 | 0.000 | 0.53× |
| just-sort-by | 6258766 | 0.000 | 0.85× |
| es-toolkit.orderBy | 5347106 | 0.000 | 0.99× |
| fast-multisort | 5307780 | 0.000 | 1.00× |
| thenby | 5188811 | 0.000 | 1.02× |
| Array.prototype.sort, decorated | 4550738 | 0.000 | 1.17× |
| remeda.sortBy | 4524950 | 0.000 | 1.17× |
| fast-sort | 3649013 | 0.000 | 1.45× |
| underscore.sortBy | 3573737 | 0.000 | 1.49× |
| sort-array | 2986106 | 0.000 | 1.78× |
| lodash.orderBy | 2965808 | 0.000 | 1.79× |
| ramda.sortWith | 2947583 | 0.000 | 1.80× |
| sort-on | 429340 | 0.003 | 12.36× |
| natural-orderby | 345373 | 0.003 | 15.37× |
| sort-by | 66832 | 0.016 | 79.42× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4518868 | 0.000 | 0.41× |
| inline comparator chain, slice().sort() | 4246994 | 0.000 | 0.44× |
| Array.prototype.sort, decorated | 1895387 | 0.001 | 0.98× |
| fast-multisort | 1854528 | 0.001 | 1.00× |
| es-toolkit.orderBy | 1787600 | 0.001 | 1.04× |
| remeda.sortBy (different order) | 1627051 | 0.001 | 1.14× |
| lodash.orderBy | 1487396 | 0.001 | 1.25× |
| thenby (different order) | 1410148 | 0.001 | 1.32× |
| fast-sort (different order) | 1063032 | 0.001 | 1.74× |
| ramda.sortWith (different order) | 1036267 | 0.001 | 1.79× |
| sort-array (different order) | 932985 | 0.001 | 1.99× |
| sort-on (different order) | 182671 | 0.006 | 10.15× |
| natural-orderby (different order) | 88240 | 0.011 | 21.02× |
| sort-by (different order) | 24902 | 0.041 | 74.47× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 424936 | 0.002 | 1.00× |
| inline comparator chain, toSorted() | 254026 | 0.004 | 1.67× |
| inline comparator chain, slice().sort() | 248405 | 0.004 | 1.71× |
| underscore.sortBy | 140985 | 0.007 | 3.01× |
| lodash.orderBy | 107816 | 0.009 | 3.94× |
| thenby | 99814 | 0.010 | 4.26× |
| Array.prototype.sort, decorated | 92821 | 0.011 | 4.58× |
| es-toolkit.orderBy | 88881 | 0.011 | 4.78× |
| fast-sort | 88834 | 0.011 | 4.78× |
| remeda.sortBy | 76414 | 0.013 | 5.56× |
| ramda.sortWith | 51676 | 0.020 | 8.22× |
| sort-array | 49997 | 0.020 | 8.50× |
| just-sort-by (different order) | 38524 | 0.026 | 11.03× |
| natural-orderby (different order) | 25922 | 0.039 | 16.39× |
| sort-on (different order) | 9791 | 0.103 | 43.40× |
| sort-by | 1279 | 0.787 | 332.18× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 167608 | 0.006 | 1.00× |
| inline comparator chain, toSorted() | 159009 | 0.007 | 1.05× |
| inline comparator chain, slice().sort() | 151735 | 0.007 | 1.10× |
| underscore.sortBy | 97362 | 0.010 | 1.72× |
| thenby | 82041 | 0.012 | 2.04× |
| Array.prototype.sort, decorated | 77408 | 0.013 | 2.17× |
| lodash.orderBy | 66946 | 0.016 | 2.50× |
| es-toolkit.orderBy | 66541 | 0.017 | 2.52× |
| fast-sort | 65338 | 0.016 | 2.57× |
| remeda.sortBy | 61968 | 0.017 | 2.70× |
| ramda.sortWith | 41020 | 0.025 | 4.09× |
| sort-array | 34969 | 0.030 | 4.79× |
| just-sort-by (different order) | 33635 | 0.030 | 4.98× |
| natural-orderby (different order) | 9751 | 0.104 | 17.19× |
| sort-on (different order) | 7888 | 0.128 | 21.25× |
| sort-by | 1191 | 0.843 | 140.71× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 272117 | 0.004 | 0.87× |
| inline comparator chain, slice().sort() | 270613 | 0.004 | 0.87× |
| fast-multisort | 235414 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 164971 | 0.006 | 1.43× |
| just-sort-by (different order) | 115682 | 0.009 | 2.04× |
| thenby (different order) | 110266 | 0.009 | 2.13× |
| lodash.orderBy | 110166 | 0.009 | 2.14× |
| fast-sort | 109143 | 0.009 | 2.16× |
| Array.prototype.sort, decorated | 104465 | 0.010 | 2.25× |
| es-toolkit.orderBy | 103399 | 0.010 | 2.28× |
| remeda.sortBy (different order) | 90816 | 0.011 | 2.59× |
| ramda.sortWith (different order) | 56530 | 0.018 | 4.16× |
| sort-array | 52277 | 0.019 | 4.50× |
| natural-orderby | 27987 | 0.036 | 8.41× |
| sort-on | 10230 | 0.099 | 23.01× |
| sort-by (different order) | 1290 | 0.782 | 182.53× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 274488 | 0.004 | 0.78× |
| inline comparator chain, slice().sort() | 258940 | 0.004 | 0.83× |
| fast-multisort | 215388 | 0.005 | 1.00× |
| underscore.sortBy | 152443 | 0.007 | 1.41× |
| just-sort-by | 104621 | 0.010 | 2.06× |
| thenby | 103735 | 0.010 | 2.08× |
| fast-sort | 98225 | 0.010 | 2.19× |
| lodash.orderBy | 95583 | 0.011 | 2.25× |
| es-toolkit.orderBy | 94396 | 0.011 | 2.28× |
| Array.prototype.sort, decorated | 92769 | 0.011 | 2.32× |
| remeda.sortBy | 88576 | 0.011 | 2.43× |
| ramda.sortWith | 53259 | 0.019 | 4.04× |
| sort-array | 49044 | 0.021 | 4.39× |
| natural-orderby | 23837 | 0.042 | 9.04× |
| sort-on | 8673 | 0.118 | 24.84× |
| sort-by | 1232 | 0.818 | 174.87× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 207543 | 0.005 | 0.67× |
| inline comparator chain, slice().sort() | 198138 | 0.005 | 0.70× |
| fast-multisort | 138637 | 0.007 | 1.00× |
| underscore.sortBy | 100396 | 0.010 | 1.38× |
| thenby | 93936 | 0.011 | 1.48× |
| fast-sort | 83001 | 0.012 | 1.67× |
| es-toolkit.orderBy | 80446 | 0.013 | 1.72× |
| Array.prototype.sort, decorated | 80039 | 0.013 | 1.73× |
| lodash.orderBy | 78116 | 0.013 | 1.77× |
| remeda.sortBy | 76822 | 0.013 | 1.80× |
| just-sort-by | 56260 | 0.018 | 2.46× |
| ramda.sortWith | 48775 | 0.021 | 2.84× |
| sort-array | 42984 | 0.023 | 3.23× |
| natural-orderby | 16904 | 0.060 | 8.20× |
| sort-on | 7509 | 0.135 | 18.46× |
| sort-by | 1169 | 0.861 | 118.62× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1840843 | 0.001 | 0.76× |
| inline comparator chain, slice().sort() | 1512051 | 0.001 | 0.92× |
| fast-multisort | 1395436 | 0.001 | 1.00× |
| just-sort-by | 725646 | 0.002 | 1.92× |
| thenby | 651332 | 0.002 | 2.14× |
| es-toolkit.orderBy | 604751 | 0.002 | 2.31× |
| remeda.sortBy | 604613 | 0.002 | 2.31× |
| fast-sort | 600370 | 0.002 | 2.32× |
| Array.prototype.sort, decorated | 558108 | 0.002 | 2.50× |
| underscore.sortBy | 465522 | 0.002 | 3.00× |
| lodash.orderBy | 346680 | 0.003 | 4.03× |
| ramda.sortWith | 304258 | 0.004 | 4.59× |
| sort-array | 301900 | 0.003 | 4.62× |
| sort-on | 47617 | 0.022 | 29.31× |
| natural-orderby | 32653 | 0.033 | 42.74× |
| sort-by | 6278 | 0.163 | 222.27× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1561803 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 1543846 | 0.001 | 1.01× |
| inline comparator chain, slice().sort() | 1380103 | 0.001 | 1.13× |
| just-sort-by | 739650 | 0.001 | 2.11× |
| thenby | 656790 | 0.002 | 2.38× |
| fast-sort | 608236 | 0.002 | 2.57× |
| es-toolkit.orderBy | 606944 | 0.002 | 2.57× |
| Array.prototype.sort, decorated | 495032 | 0.002 | 3.15× |
| remeda.sortBy | 447871 | 0.003 | 3.49× |
| underscore.sortBy | 430307 | 0.002 | 3.63× |
| lodash.orderBy | 340224 | 0.003 | 4.59× |
| ramda.sortWith | 318638 | 0.003 | 4.90× |
| sort-array | 304469 | 0.003 | 5.13× |
| sort-on | 42238 | 0.025 | 36.98× |
| natural-orderby | 32263 | 0.033 | 48.41× |
| sort-by | 5989 | 0.176 | 260.77× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 202996 | 0.005 | 0.53× |
| inline comparator chain, toSorted() | 199050 | 0.005 | 0.54× |
| fast-multisort | 107814 | 0.010 | 1.00× |
| lodash.orderBy | 77145 | 0.014 | 1.40× |
| Array.prototype.sort, decorated | 67910 | 0.015 | 1.59× |
| es-toolkit.orderBy | 61147 | 0.017 | 1.76× |
| thenby (different order) | 54297 | 0.019 | 1.99× |
| remeda.sortBy (different order) | 54102 | 0.019 | 1.99× |
| fast-sort (different order) | 42247 | 0.025 | 2.55× |
| sort-array (different order) | 32204 | 0.032 | 3.35× |
| ramda.sortWith (different order) | 31427 | 0.034 | 3.43× |
| natural-orderby (different order) | 7522 | 0.141 | 14.33× |
| sort-on (different order) | 6591 | 0.157 | 16.36× |
| sort-by (different order) | 675 | 1.575 | 159.72× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 44339 | 0.023 | 1.00× |
| inline comparator chain, slice().sort() | 16762 | 0.060 | 2.65× |
| inline comparator chain, toSorted() | 15347 | 0.069 | 2.89× |
| underscore.sortBy | 9712 | 0.104 | 4.57× |
| thenby | 6962 | 0.149 | 6.37× |
| lodash.orderBy | 6834 | 0.160 | 6.49× |
| Array.prototype.sort, decorated | 6665 | 0.152 | 6.65× |
| es-toolkit.orderBy | 6390 | 0.159 | 6.94× |
| fast-sort | 5585 | 0.203 | 7.94× |
| remeda.sortBy | 5491 | 0.185 | 8.07× |
| ramda.sortWith | 3606 | 0.295 | 12.30× |
| sort-array | 3416 | 0.308 | 12.98× |
| just-sort-by (different order) | 2479 | 0.420 | 17.89× |
| natural-orderby (different order) | 1994 | 0.529 | 22.24× |
| sort-on (different order) | 711 | 1.419 | 62.32× |
| sort-by | 82 | 12.765 | 542.80× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9655 | 0.111 | 1.00× |
| inline comparator chain, toSorted() | 8137 | 0.126 | 1.19× |
| inline comparator chain, slice().sort() | 7211 | 0.152 | 1.34× |
| underscore.sortBy | 5554 | 0.181 | 1.74× |
| thenby | 4598 | 0.218 | 2.10× |
| fast-sort | 4325 | 0.232 | 2.23× |
| Array.prototype.sort, decorated | 4275 | 0.235 | 2.26× |
| lodash.orderBy | 4114 | 0.251 | 2.35× |
| es-toolkit.orderBy | 4049 | 0.253 | 2.38× |
| remeda.sortBy | 3335 | 0.332 | 2.89× |
| ramda.sortWith | 2693 | 0.375 | 3.59× |
| sort-array | 2383 | 0.420 | 4.05× |
| just-sort-by (different order) | 2061 | 0.488 | 4.69× |
| natural-orderby (different order) | 768 | 1.308 | 12.57× |
| sort-on (different order) | 461 | 2.180 | 20.93× |
| sort-by | 73 | 13.799 | 133.16× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 33582 | 0.031 | 1.00× |
| inline comparator chain, toSorted() | 15974 | 0.063 | 2.10× |
| inline comparator chain, slice().sort() | 15817 | 0.064 | 2.12× |
| underscore.sortBy (different order) | 10053 | 0.100 | 3.34× |
| just-sort-by (different order) | 7088 | 0.141 | 4.74× |
| lodash.orderBy | 7013 | 0.144 | 4.79× |
| thenby (different order) | 6959 | 0.144 | 4.83× |
| fast-sort | 6735 | 0.150 | 4.99× |
| es-toolkit.orderBy | 6559 | 0.153 | 5.12× |
| Array.prototype.sort, decorated | 6521 | 0.154 | 5.15× |
| remeda.sortBy (different order) | 5881 | 0.171 | 5.71× |
| ramda.sortWith (different order) | 3561 | 0.283 | 9.43× |
| sort-array | 3345 | 0.300 | 10.04× |
| natural-orderby | 2301 | 0.439 | 14.59× |
| sort-on | 634 | 1.579 | 52.94× |
| sort-by (different order) | 78 | 12.845 | 431.03× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 31533 | 0.032 | 1.00× |
| inline comparator chain, toSorted() | 13210 | 0.077 | 2.39× |
| inline comparator chain, slice().sort() | 13023 | 0.078 | 2.42× |
| underscore.sortBy | 8860 | 0.114 | 3.56× |
| just-sort-by | 6308 | 0.160 | 5.00× |
| lodash.orderBy | 5979 | 0.169 | 5.27× |
| es-toolkit.orderBy | 5687 | 0.178 | 5.54× |
| thenby | 5680 | 0.182 | 5.55× |
| fast-sort | 5625 | 0.181 | 5.61× |
| Array.prototype.sort, decorated | 5584 | 0.181 | 5.65× |
| remeda.sortBy | 5560 | 0.182 | 5.67× |
| ramda.sortWith | 3338 | 0.302 | 9.45× |
| sort-array | 2986 | 0.338 | 10.56× |
| natural-orderby | 1934 | 0.523 | 16.31× |
| sort-on | 542 | 1.860 | 58.13× |
| sort-by | 74 | 13.505 | 425.47× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12573 | 0.081 | 1.00× |
| inline comparator chain, toSorted() | 9154 | 0.112 | 1.37× |
| inline comparator chain, slice().sort() | 9105 | 0.114 | 1.38× |
| underscore.sortBy | 5297 | 0.197 | 2.37× |
| fast-sort | 4670 | 0.220 | 2.69× |
| es-toolkit.orderBy | 4607 | 0.219 | 2.73× |
| lodash.orderBy | 4405 | 0.233 | 2.85× |
| thenby | 4336 | 0.244 | 2.90× |
| Array.prototype.sort, decorated | 3919 | 0.268 | 3.21× |
| remeda.sortBy | 3808 | 0.287 | 3.30× |
| just-sort-by | 3201 | 0.322 | 3.93× |
| ramda.sortWith | 2582 | 0.419 | 4.87× |
| sort-array | 2565 | 0.392 | 4.90× |
| natural-orderby | 1323 | 0.792 | 9.51× |
| sort-on | 398 | 2.652 | 31.59× |
| sort-by | 68 | 14.761 | 184.10× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 195260 | 0.005 | 0.69× |
| inline comparator chain, slice().sort() | 157827 | 0.006 | 0.86× |
| fast-multisort | 135055 | 0.008 | 1.00× |
| just-sort-by | 82197 | 0.012 | 1.64× |
| thenby | 72964 | 0.014 | 1.85× |
| fast-sort | 67319 | 0.015 | 2.01× |
| es-toolkit.orderBy | 63641 | 0.016 | 2.12× |
| remeda.sortBy | 62008 | 0.017 | 2.18× |
| Array.prototype.sort, decorated | 57191 | 0.018 | 2.36× |
| underscore.sortBy | 49142 | 0.021 | 2.75× |
| lodash.orderBy | 39465 | 0.026 | 3.42× |
| sort-array | 32545 | 0.031 | 4.15× |
| ramda.sortWith | 31935 | 0.033 | 4.23× |
| sort-on | 4889 | 0.206 | 27.62× |
| natural-orderby | 3447 | 0.296 | 39.18× |
| sort-by | 636 | 1.579 | 212.27× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 170879 | 0.006 | 0.97× |
| fast-multisort | 166225 | 0.006 | 1.00× |
| inline comparator chain, slice().sort() | 148973 | 0.007 | 1.12× |
| just-sort-by | 78812 | 0.013 | 2.11× |
| thenby | 74623 | 0.014 | 2.23× |
| fast-sort | 71153 | 0.014 | 2.34× |
| es-toolkit.orderBy | 66241 | 0.015 | 2.51× |
| Array.prototype.sort, decorated | 55933 | 0.018 | 2.97× |
| remeda.sortBy | 52266 | 0.020 | 3.18× |
| underscore.sortBy | 46765 | 0.022 | 3.55× |
| lodash.orderBy | 36980 | 0.028 | 4.49× |
| ramda.sortWith | 34571 | 0.029 | 4.81× |
| sort-array | 33777 | 0.030 | 4.92× |
| sort-on | 4425 | 0.229 | 37.56× |
| natural-orderby | 3474 | 0.294 | 47.85× |
| sort-by | 630 | 1.598 | 263.70× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12167 | 0.084 | 1.00× |
| inline comparator chain, toSorted() | 11972 | 0.084 | 1.02× |
| inline comparator chain, slice().sort() | 11863 | 0.085 | 1.03× |
| lodash.orderBy | 5221 | 0.193 | 2.33× |
| Array.prototype.sort, decorated | 3901 | 0.257 | 3.12× |
| es-toolkit.orderBy | 3578 | 0.280 | 3.40× |
| remeda.sortBy (different order) | 3240 | 0.309 | 3.75× |
| thenby (different order) | 3006 | 0.339 | 4.05× |
| fast-sort (different order) | 2622 | 0.389 | 4.64× |
| sort-array (different order) | 1842 | 0.553 | 6.61× |
| ramda.sortWith (different order) | 1831 | 0.578 | 6.65× |
| natural-orderby (different order) | 608 | 1.710 | 20.02× |
| sort-on (different order) | 354 | 2.879 | 34.34× |
| sort-by (different order) | 40 | 25.315 | 301.37× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4391 | 0.230 | 1.00× |
| inline comparator chain, toSorted() | 1273 | 0.791 | 3.45× |
| inline comparator chain, slice().sort() | 1266 | 0.793 | 3.47× |
| underscore.sortBy | 818 | 1.231 | 5.37× |
| thenby | 688 | 1.456 | 6.38× |
| Array.prototype.sort, decorated | 625 | 1.610 | 7.03× |
| lodash.orderBy | 623 | 1.665 | 7.05× |
| fast-sort | 614 | 1.631 | 7.15× |
| es-toolkit.orderBy | 600 | 1.667 | 7.31× |
| remeda.sortBy | 507 | 1.987 | 8.66× |
| ramda.sortWith | 362 | 2.773 | 12.15× |
| sort-array | 352 | 2.856 | 12.48× |
| just-sort-by (different order) | 269 | 3.723 | 16.33× |
| natural-orderby (different order) | 210 | 4.760 | 20.86× |
| sort-on (different order) | 70 | 14.397 | 63.10× |
| sort-by | 8 | 126.872 | 552.93× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 857 | 1.190 | 1.00× |
| inline comparator chain, toSorted() | 470 | 2.129 | 1.82× |
| inline comparator chain, slice().sort() | 463 | 2.163 | 1.85× |
| thenby | 324 | 3.087 | 2.64× |
| fast-sort | 306 | 3.267 | 2.80× |
| es-toolkit.orderBy | 299 | 3.347 | 2.87× |
| remeda.sortBy | 282 | 3.548 | 3.04× |
| lodash.orderBy | 270 | 3.711 | 3.17× |
| ramda.sortWith | 196 | 5.114 | 4.38× |
| underscore.sortBy | 192 | 10.665 | 4.46× |
| sort-array | 178 | 5.634 | 4.82× |
| Array.prototype.sort, decorated | 116 | 22.109 | 7.37× |
| just-sort-by (different order) | 106 | 9.591 | 8.06× |
| natural-orderby (different order) | 46 | 53.990 | 18.52× |
| sort-on (different order) | 34 | 29.812 | 25.48× |
| sort-by | 5 | 195.150 | 167.05× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3651 | 0.283 | 1.00× |
| inline comparator chain, toSorted() | 945 | 1.060 | 3.86× |
| inline comparator chain, slice().sort() | 932 | 1.075 | 3.92× |
| underscore.sortBy (different order) | 736 | 1.361 | 4.96× |
| just-sort-by (different order) | 519 | 1.930 | 7.04× |
| thenby (different order) | 517 | 1.935 | 7.06× |
| fast-sort | 505 | 1.981 | 7.22× |
| lodash.orderBy | 480 | 2.091 | 7.61× |
| Array.prototype.sort, decorated | 479 | 2.092 | 7.62× |
| es-toolkit.orderBy | 448 | 2.241 | 8.15× |
| remeda.sortBy (different order) | 441 | 2.272 | 8.28× |
| ramda.sortWith (different order) | 264 | 3.790 | 13.83× |
| sort-array | 256 | 3.902 | 14.24× |
| natural-orderby | 187 | 5.364 | 19.56× |
| sort-on | 45 | 22.092 | 80.54× |
| sort-by (different order) | 6 | 179.874 | 655.50× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3385 | 0.303 | 1.00× |
| inline comparator chain, slice().sort() | 684 | 1.477 | 4.95× |
| inline comparator chain, toSorted() | 663 | 1.521 | 5.10× |
| underscore.sortBy | 617 | 1.625 | 5.49× |
| just-sort-by | 442 | 2.274 | 7.66× |
| thenby | 439 | 2.290 | 7.71× |
| fast-sort | 425 | 2.358 | 7.96× |
| es-toolkit.orderBy | 409 | 2.449 | 8.28× |
| remeda.sortBy | 402 | 2.492 | 8.42× |
| Array.prototype.sort, decorated | 391 | 2.568 | 8.66× |
| lodash.orderBy | 386 | 2.622 | 8.78× |
| ramda.sortWith | 236 | 4.240 | 14.34× |
| sort-array | 218 | 4.584 | 15.50× |
| natural-orderby | 128 | 7.871 | 26.54× |
| sort-on | 39 | 25.784 | 87.25× |
| sort-by | 5 | 191.361 | 647.45× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 839 | 1.212 | 1.00× |
| inline comparator chain, slice().sort() | 501 | 2.001 | 1.67× |
| inline comparator chain, toSorted() | 494 | 2.026 | 1.70× |
| underscore.sortBy | 398 | 2.513 | 2.10× |
| thenby | 362 | 2.767 | 2.32× |
| fast-sort | 342 | 2.925 | 2.45× |
| Array.prototype.sort, decorated | 326 | 3.075 | 2.58× |
| es-toolkit.orderBy | 316 | 3.188 | 2.65× |
| remeda.sortBy | 309 | 3.244 | 2.71× |
| lodash.orderBy | 287 | 3.485 | 2.92× |
| just-sort-by | 245 | 4.079 | 3.42× |
| ramda.sortWith | 209 | 4.780 | 4.00× |
| sort-array | 196 | 5.092 | 4.27× |
| natural-orderby | 119 | 8.407 | 7.04× |
| sort-on | 32 | 31.008 | 25.97× |
| sort-by | 5 | 194.099 | 162.68× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 19077 | 0.054 | 0.71× |
| inline comparator chain, slice().sort() | 14980 | 0.068 | 0.91× |
| fast-multisort | 13625 | 0.075 | 1.00× |
| just-sort-by | 8259 | 0.122 | 1.65× |
| thenby | 7383 | 0.137 | 1.85× |
| fast-sort | 6729 | 0.150 | 2.02× |
| remeda.sortBy | 6580 | 0.154 | 2.07× |
| es-toolkit.orderBy | 6463 | 0.156 | 2.11× |
| Array.prototype.sort, decorated | 5805 | 0.175 | 2.35× |
| underscore.sortBy | 5037 | 0.201 | 2.70× |
| lodash.orderBy | 3825 | 0.274 | 3.56× |
| ramda.sortWith | 3418 | 0.295 | 3.99× |
| sort-array | 3188 | 0.316 | 4.27× |
| sort-on | 501 | 2.001 | 27.19× |
| natural-orderby | 332 | 3.026 | 41.07× |
| sort-by | 66 | 15.248 | 207.66× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 18670 | 0.054 | 0.91× |
| fast-multisort | 16955 | 0.060 | 1.00× |
| inline comparator chain, slice().sort() | 15047 | 0.067 | 1.13× |
| just-sort-by | 8191 | 0.123 | 2.07× |
| thenby | 7870 | 0.128 | 2.15× |
| fast-sort | 7074 | 0.143 | 2.40× |
| es-toolkit.orderBy | 6713 | 0.150 | 2.53× |
| Array.prototype.sort, decorated | 5777 | 0.175 | 2.94× |
| remeda.sortBy | 5533 | 0.183 | 3.06× |
| underscore.sortBy | 4742 | 0.213 | 3.58× |
| lodash.orderBy | 3588 | 0.289 | 4.73× |
| ramda.sortWith | 3474 | 0.290 | 4.88× |
| sort-array | 3137 | 0.323 | 5.40× |
| sort-on | 441 | 2.272 | 38.42× |
| natural-orderby | 313 | 3.253 | 54.19× |
| sort-by | 64 | 15.616 | 264.67× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1431 | 0.707 | 1.00× |
| inline comparator chain, toSorted() | 658 | 1.522 | 2.18× |
| inline comparator chain, slice().sort() | 651 | 1.539 | 2.20× |
| lodash.orderBy | 336 | 2.981 | 4.26× |
| Array.prototype.sort, decorated | 280 | 3.572 | 5.11× |
| es-toolkit.orderBy | 241 | 4.157 | 5.95× |
| remeda.sortBy (different order) | 222 | 4.513 | 6.46× |
| thenby (different order) | 221 | 4.517 | 6.46× |
| fast-sort (different order) | 187 | 5.360 | 7.67× |
| ramda.sortWith (different order) | 138 | 7.244 | 10.36× |
| sort-array (different order) | 134 | 7.458 | 10.67× |
| natural-orderby (different order) | 61 | 16.540 | 23.55× |
| sort-on (different order) | 25 | 39.774 | 56.91× |
| sort-by (different order) | 3 | 341.485 | 488.46× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 376 | 2.953 | 1.00× |
| inline comparator chain, toSorted() | 115 | 8.674 | 3.26× |
| inline comparator chain, slice().sort() | 114 | 8.756 | 3.29× |
| underscore.sortBy | 75 | 13.567 | 5.04× |
| thenby | 67 | 14.860 | 5.58× |
| fast-sort | 63 | 15.962 | 6.00× |
| lodash.orderBy | 62 | 16.341 | 6.11× |
| es-toolkit.orderBy | 59 | 17.155 | 6.42× |
| Array.prototype.sort, decorated | 56 | 18.121 | 6.77× |
| remeda.sortBy | 52 | 19.083 | 7.17× |
| ramda.sortWith | 37 | 27.258 | 10.23× |
| sort-array | 36 | 27.860 | 10.48× |
| just-sort-by (different order) | 27 | 37.265 | 14.01× |
| natural-orderby (different order) | 17 | 57.992 | 21.77× |
| sort-on (different order) | 6 | 3467.827 | 60.63× |
| sort-by | 1 | 1079.547 | 405.83× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 318 | 3.260 | 1.00× |
| inline comparator chain, slice().sort() | 68 | 14.663 | 4.66× |
| inline comparator chain, toSorted() | 68 | 14.730 | 4.66× |
| underscore.sortBy (different order) | 53 | 18.835 | 5.97× |
| just-sort-by (different order) | 38 | 26.490 | 8.40× |
| fast-sort | 37 | 26.963 | 8.56× |
| es-toolkit.orderBy | 36 | 27.957 | 8.86× |
| remeda.sortBy (different order) | 33 | 30.602 | 9.70× |
| lodash.orderBy | 32 | 31.380 | 9.93× |
| thenby (different order) | 31 | 32.544 | 10.11× |
| Array.prototype.sort, decorated | 31 | 32.871 | 10.36× |
| ramda.sortWith (different order) | 20 | 50.224 | 15.94× |
| sort-array | 16 | 62.773 | 19.56× |
| natural-orderby | 12 | 80.550 | 25.51× |
| sort-on | 3 | 368.772 | 97.71× |
| sort-by (different order) | 0 | 2281.042 | 724.03× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 135 | 7.436 | 1.00× |
| inline comparator chain, slice().sort() | 46 | 22.055 | 2.97× |
| inline comparator chain, toSorted() | 40 | 25.060 | 3.37× |
| Array.prototype.sort, decorated | 20 | 50.506 | 6.80× |
| lodash.orderBy | 19 | 52.392 | 7.05× |
| es-toolkit.orderBy | 18 | 56.661 | 7.65× |
| thenby (different order) | 17 | 59.166 | 7.99× |
| remeda.sortBy (different order) | 16 | 62.015 | 8.36× |
| fast-sort (different order) | 14 | 72.440 | 9.77× |
| ramda.sortWith (different order) | 10 | 100.611 | 13.56× |
| sort-array (different order) | 10 | 102.180 | 13.80× |
| natural-orderby (different order) | 5 | 205.892 | 27.80× |
| sort-on (different order) | 2 | 511.869 | 69.21× |
| sort-by (different order) | 0 | 4457.698 | 602.75× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 31 | 32.550 | 1.00× |
| inline comparator chain, toSorted() | 10 | 97.420 | 3.06× |
| inline comparator chain, slice().sort() | 10 | 101.802 | 3.20× |
| thenby | 6 | 155.270 | 4.88× |
| es-toolkit.orderBy | 6 | 174.582 | 5.48× |
| fast-sort | 6 | 176.185 | 5.53× |
| lodash.orderBy | 5 | 204.449 | 6.40× |
| remeda.sortBy | 5 | 208.328 | 6.55× |
| Array.prototype.sort, decorated | 5 | 215.521 | 6.76× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 22 | 46.533 | 1.00× |
| inline comparator chain, slice().sort() | 4 | 243.232 | 5.38× |
| inline comparator chain, toSorted() | 4 | 246.355 | 5.45× |
| thenby (different order) | 2 | 433.392 | 9.57× |
| fast-sort | 2 | 439.043 | 9.72× |
| remeda.sortBy (different order) | 2 | 494.035 | 10.91× |
| es-toolkit.orderBy | 2 | 517.111 | 11.39× |
| lodash.orderBy | 2 | 651.273 | 14.38× |
| Array.prototype.sort, decorated | 1 | 669.266 | 14.82× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12 | 85.860 | 1.00× |
| inline comparator chain, slice().sort() | 3 | 352.615 | 4.12× |
| inline comparator chain, toSorted() | 3 | 353.796 | 4.13× |
| lodash.orderBy | 1 | 926.389 | 10.82× |
| es-toolkit.orderBy | 1 | 941.021 | 10.99× |
| thenby (different order) | 1 | 1054.164 | 12.24× |
| remeda.sortBy (different order) | 1 | 1084.683 | 12.65× |
| fast-sort (different order) | 1 | 1180.525 | 13.81× |
| Array.prototype.sort, decorated | 1 | 1222.849 | 14.21× |

</details>

<!-- bench:end -->

### Browsers

Same data, sizes, cases and libraries as above, each result checked against lodash before timing, best competitor per case (`pnpm bench:browsers`). Chromium and WebKit are Playwright's builds; Firefox is the installed `/Applications/Firefox.app` driven over WebDriver BiDi (Playwright's own Firefox build does not start on macOS 27), with Playwright's Firefox as the fallback. Apple M5 Max.

<!-- browsers:start -->
<!-- browsers:end -->

Run `pnpm bench` (or `pnpm bench --sizes=100,10000` for a subset) and `pnpm bench:browsers` to reproduce; `pnpm bench:readme` rewrites the tables above. What each competitor does and which of their ideas ended up in here: [benchmark/COMPETITORS.md](benchmark/COMPETITORS.md).

The honest footnote: at a hundred rows a sort takes a few microseconds and the margins are small, and on inputs that are already in order every library is linear, so the lead there is a pass-through against a native sort. From a thousand rows up the closest anyone gets is about 1.9×. The table is the only argument, and the script above regenerates it from scratch.

## How

Numbers go through a stable radix sort on their float64 bits, strings through buckets and a radix sort over the characters that actually differ, ties recurse into the next rule, and anything exotic falls back to the lodash comparator so the order stays identical to lodash. Inputs that are already in order are passed through. The rest is bookkeeping.

## License

MIT
