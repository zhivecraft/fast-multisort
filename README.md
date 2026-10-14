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
| inline comparator chain, slice().sort() | 0.41× | 1.11× | 8.15× | 56 | 0 |
| inline comparator chain, toSorted() | 0.39× | 1.66× | 7.97× | 56 | 0 |
| thenby | 0.87× | 2.19× | 11.94× | 56 | 12 |
| underscore.sortBy | 0.82× | 2.36× | 8.49× | 49 | 6 |
| es-toolkit.orderBy | 0.93× | 2.37× | 12.89× | 56 | 0 |
| just-sort-by | 0.72× | 2.40× | 17.47× | 49 | 17 |
| fast-sort | 1.06× | 2.43× | 12.45× | 56 | 6 |
| remeda.sortBy | 0.92× | 2.69× | 13.20× | 56 | 12 |
| Array.prototype.sort, decorated | 0.59× | 2.72× | 19.26× | 56 | 0 |
| lodash.orderBy | 1.16× | 3.47× | 18.25× | 56 | 0 |
| ramda.sortWith | 1.62× | 4.14× | 20.95× | 56 | 12 |
| sort-array | 0.85× | 4.55× | 21.90× | 56 | 6 |
| natural-orderby | 4.63× | 19.77× | 61.33× | 56 | 17 |
| sort-on | 1.20× | 26.70× | 108.14× | 56 | 17 |
| sort-by | 1.88× | 192.87× | 770.37× | 56 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 54158745 | 0.000 | 0.88× |
| fast-multisort | 47806898 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 44919051 | 0.000 | 1.06× |
| sort-on | 39680187 | 0.000 | 1.20× |
| es-toolkit.orderBy | 37910533 | 0.000 | 1.26× |
| Array.prototype.sort, decorated | 36451057 | 0.000 | 1.31× |
| thenby | 24749099 | 0.000 | 1.93× |
| ramda.sortWith | 24710233 | 0.000 | 1.93× |
| inline comparator chain, toSorted() | 24261257 | 0.000 | 1.97× |
| sort-by | 24049269 | 0.000 | 1.99× |
| fast-sort | 23744866 | 0.000 | 2.01× |
| remeda.sortBy | 23620476 | 0.000 | 2.02× |
| sort-array | 23543733 | 0.000 | 2.03× |
| underscore.sortBy | 23261335 | 0.000 | 2.06× |
| lodash.orderBy | 21950065 | 0.000 | 2.18× |
| natural-orderby | 3724432 | 0.000 | 12.84× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 52602272 | 0.000 | 0.91× |
| fast-multisort | 47702413 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 41749388 | 0.000 | 1.14× |
| sort-on | 35368457 | 0.000 | 1.35× |
| es-toolkit.orderBy | 34659841 | 0.000 | 1.38× |
| Array.prototype.sort, decorated | 34000395 | 0.000 | 1.40× |
| thenby | 25910385 | 0.000 | 1.84× |
| inline comparator chain, toSorted() | 24506096 | 0.000 | 1.95× |
| ramda.sortWith | 24030683 | 0.000 | 1.99× |
| sort-array | 23647612 | 0.000 | 2.02× |
| sort-by | 23505228 | 0.000 | 2.03× |
| remeda.sortBy | 23486858 | 0.000 | 2.03× |
| fast-sort | 23456378 | 0.000 | 2.03× |
| underscore.sortBy | 21171491 | 0.000 | 2.25× |
| lodash.orderBy | 17299008 | 0.000 | 2.76× |
| natural-orderby | 1757574 | 0.001 | 27.14× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 46791912 | 0.000 | 1.00× |
| just-sort-by | 46750052 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 45981052 | 0.000 | 1.02× |
| es-toolkit.orderBy | 35184258 | 0.000 | 1.33× |
| Array.prototype.sort, decorated | 25030559 | 0.000 | 1.87× |
| inline comparator chain, toSorted() | 24816434 | 0.000 | 1.89× |
| ramda.sortWith | 23452757 | 0.000 | 2.00× |
| remeda.sortBy | 23397699 | 0.000 | 2.00× |
| thenby | 22541433 | 0.000 | 2.08× |
| fast-sort | 22233414 | 0.000 | 2.10× |
| sort-array | 21470046 | 0.000 | 2.18× |
| sort-by | 21419516 | 0.000 | 2.18× |
| underscore.sortBy | 21036305 | 0.000 | 2.22× |
| sort-on | 19496569 | 0.000 | 2.40× |
| lodash.orderBy | 19424811 | 0.000 | 2.41× |
| natural-orderby | 2694483 | 0.000 | 17.37× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 51641022 | 0.000 | 0.86× |
| fast-multisort | 44308615 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 35313173 | 0.000 | 1.25× |
| Array.prototype.sort, decorated | 33460382 | 0.000 | 1.32× |
| sort-on | 32795502 | 0.000 | 1.35× |
| sort-by | 23586316 | 0.000 | 1.88× |
| ramda.sortWith | 23298535 | 0.000 | 1.90× |
| inline comparator chain, toSorted() | 23074012 | 0.000 | 1.92× |
| es-toolkit.orderBy | 22917609 | 0.000 | 1.93× |
| thenby | 22500238 | 0.000 | 1.97× |
| underscore.sortBy | 21739790 | 0.000 | 2.04× |
| fast-sort | 21266051 | 0.000 | 2.08× |
| remeda.sortBy | 20750097 | 0.000 | 2.14× |
| sort-array | 20350239 | 0.000 | 2.18× |
| lodash.orderBy | 12786170 | 0.000 | 3.47× |
| natural-orderby | 2644130 | 0.000 | 16.76× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 52119615 | 0.000 | 0.88× |
| fast-multisort | 45644852 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 44941000 | 0.000 | 1.02× |
| es-toolkit.orderBy | 39936880 | 0.000 | 1.14× |
| Array.prototype.sort, decorated | 32836560 | 0.000 | 1.39× |
| sort-on | 32677805 | 0.000 | 1.40× |
| inline comparator chain, toSorted() | 24778388 | 0.000 | 1.84× |
| thenby | 24682468 | 0.000 | 1.85× |
| ramda.sortWith | 24677676 | 0.000 | 1.85× |
| fast-sort | 23879708 | 0.000 | 1.91× |
| remeda.sortBy | 23747788 | 0.000 | 1.92× |
| sort-array | 23708857 | 0.000 | 1.93× |
| sort-by | 23392119 | 0.000 | 1.95× |
| underscore.sortBy | 22581494 | 0.000 | 2.02× |
| lodash.orderBy | 19788999 | 0.000 | 2.31× |
| natural-orderby | 1765029 | 0.001 | 25.86× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 50163690 | 0.000 | 0.95× |
| fast-multisort | 47895193 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 43263055 | 0.000 | 1.11× |
| es-toolkit.orderBy | 36918271 | 0.000 | 1.30× |
| sort-on | 34208211 | 0.000 | 1.40× |
| Array.prototype.sort, decorated | 32902427 | 0.000 | 1.46× |
| thenby | 25204862 | 0.000 | 1.90× |
| inline comparator chain, toSorted() | 24800439 | 0.000 | 1.93× |
| ramda.sortWith | 24686844 | 0.000 | 1.94× |
| fast-sort | 23785897 | 0.000 | 2.01× |
| remeda.sortBy | 23753905 | 0.000 | 2.02× |
| sort-array | 23541468 | 0.000 | 2.03× |
| sort-by | 23201076 | 0.000 | 2.06× |
| underscore.sortBy | 22175809 | 0.000 | 2.16× |
| lodash.orderBy | 18456716 | 0.000 | 2.60× |
| natural-orderby | 3377228 | 0.000 | 14.18× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 50430461 | 0.000 | 0.91× |
| fast-multisort | 45952661 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 43711383 | 0.000 | 1.05× |
| es-toolkit.orderBy | 38553814 | 0.000 | 1.19× |
| Array.prototype.sort, decorated | 33601146 | 0.000 | 1.37× |
| sort-on | 27398526 | 0.000 | 1.68× |
| thenby | 25893169 | 0.000 | 1.77× |
| inline comparator chain, toSorted() | 24685266 | 0.000 | 1.86× |
| ramda.sortWith | 24260227 | 0.000 | 1.89× |
| fast-sort | 23709946 | 0.000 | 1.94× |
| sort-by | 23612103 | 0.000 | 1.95× |
| remeda.sortBy | 23558985 | 0.000 | 1.95× |
| sort-array | 23515742 | 0.000 | 1.95× |
| underscore.sortBy | 21716616 | 0.000 | 2.12× |
| lodash.orderBy | 18927271 | 0.000 | 2.43× |
| natural-orderby | 3628153 | 0.000 | 12.67× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 46607196 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 43542872 | 0.000 | 1.07× |
| Array.prototype.sort, decorated | 30027695 | 0.000 | 1.55× |
| es-toolkit.orderBy | 27870407 | 0.000 | 1.67× |
| sort-on | 27541118 | 0.000 | 1.69× |
| inline comparator chain, toSorted() | 24349519 | 0.000 | 1.91× |
| sort-array | 23543712 | 0.000 | 1.98× |
| ramda.sortWith | 20616457 | 0.000 | 2.26× |
| sort-by | 20071399 | 0.000 | 2.32× |
| remeda.sortBy | 17325673 | 0.000 | 2.69× |
| lodash.orderBy | 14805846 | 0.000 | 3.15× |
| thenby | 11134275 | 0.000 | 4.19× |
| fast-sort | 5020135 | 0.000 | 9.28× |
| natural-orderby | 759994 | 0.002 | 61.33× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4152101 | 0.000 | 0.51× |
| inline comparator chain, toSorted() | 4043450 | 0.000 | 0.53× |
| Array.prototype.sort, decorated | 3639020 | 0.000 | 0.59× |
| underscore.sortBy | 2597775 | 0.000 | 0.82× |
| sort-array | 2515867 | 0.000 | 0.85× |
| thenby | 2151251 | 0.001 | 0.99× |
| fast-multisort | 2129555 | 0.000 | 1.00× |
| remeda.sortBy | 2064184 | 0.001 | 1.03× |
| es-toolkit.orderBy | 1939270 | 0.001 | 1.10× |
| fast-sort | 1828976 | 0.001 | 1.16× |
| lodash.orderBy | 1578925 | 0.003 | 1.35× |
| ramda.sortWith | 1128962 | 0.001 | 1.89× |
| just-sort-by (different order) | 888631 | 0.001 | 2.40× |
| natural-orderby (different order) | 294569 | 0.004 | 7.23× |
| sort-on (different order) | 206298 | 0.005 | 10.32× |
| sort-by | 28144 | 0.037 | 75.67× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 3636168 | 0.000 | 0.54× |
| inline comparator chain, slice().sort() | 3502375 | 0.000 | 0.56× |
| thenby | 2065133 | 0.001 | 0.95× |
| remeda.sortBy | 1985729 | 0.001 | 0.99× |
| es-toolkit.orderBy | 1970441 | 0.001 | 0.99× |
| fast-multisort | 1960393 | 0.001 | 1.00× |
| fast-sort | 1851280 | 0.001 | 1.06× |
| lodash.orderBy | 1696391 | 0.001 | 1.16× |
| Array.prototype.sort, decorated | 1677209 | 0.001 | 1.17× |
| underscore.sortBy | 1652018 | 0.001 | 1.19× |
| ramda.sortWith | 1213515 | 0.001 | 1.62× |
| sort-array | 1205300 | 0.001 | 1.63× |
| just-sort-by | 673439 | 0.002 | 2.91× |
| sort-on | 172009 | 0.006 | 11.40× |
| natural-orderby | 97223 | 0.011 | 20.16× |
| sort-by | 21484 | 0.050 | 91.25× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 5320098 | 0.000 | 0.39× |
| inline comparator chain, slice().sort() | 4823693 | 0.000 | 0.43× |
| just-sort-by (different order) | 2611156 | 0.001 | 0.80× |
| thenby (different order) | 2293302 | 0.001 | 0.91× |
| es-toolkit.orderBy | 2253296 | 0.001 | 0.93× |
| remeda.sortBy (different order) | 2148646 | 0.001 | 0.97× |
| Array.prototype.sort, decorated | 2132801 | 0.001 | 0.98× |
| underscore.sortBy (different order) | 2118322 | 0.001 | 0.99× |
| fast-multisort | 2090011 | 0.001 | 1.00× |
| fast-sort | 1907212 | 0.001 | 1.10× |
| lodash.orderBy | 1670452 | 0.001 | 1.25× |
| ramda.sortWith (different order) | 1125745 | 0.001 | 1.86× |
| sort-array | 1110625 | 0.001 | 1.88× |
| natural-orderby | 232643 | 0.006 | 8.98× |
| sort-on | 205107 | 0.006 | 10.19× |
| sort-by (different order) | 26968 | 0.048 | 77.50× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4004532 | 0.000 | 0.39× |
| inline comparator chain, slice().sort() | 3835806 | 0.000 | 0.41× |
| just-sort-by | 2164067 | 0.001 | 0.72× |
| underscore.sortBy | 1887529 | 0.001 | 0.83× |
| thenby | 1783881 | 0.001 | 0.87× |
| remeda.sortBy | 1687741 | 0.001 | 0.92× |
| Array.prototype.sort, decorated | 1651937 | 0.001 | 0.94× |
| es-toolkit.orderBy | 1642024 | 0.001 | 0.95× |
| fast-multisort | 1559354 | 0.001 | 1.00× |
| fast-sort | 1456049 | 0.001 | 1.07× |
| lodash.orderBy | 1306671 | 0.001 | 1.19× |
| ramda.sortWith | 844632 | 0.002 | 1.85× |
| sort-array | 791905 | 0.002 | 1.97× |
| natural-orderby | 227670 | 0.005 | 6.85× |
| sort-on | 144750 | 0.010 | 10.77× |
| sort-by | 20668 | 0.055 | 75.45× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 3830084 | 0.000 | 0.54× |
| inline comparator chain, slice().sort() | 3629743 | 0.000 | 0.57× |
| thenby | 2181342 | 0.000 | 0.95× |
| fast-multisort | 2079748 | 0.001 | 1.00× |
| es-toolkit.orderBy | 2077944 | 0.001 | 1.00× |
| remeda.sortBy | 2058958 | 0.001 | 1.01× |
| Array.prototype.sort, decorated | 1930493 | 0.001 | 1.08× |
| underscore.sortBy | 1930068 | 0.001 | 1.08× |
| fast-sort | 1718573 | 0.001 | 1.21× |
| lodash.orderBy | 1566131 | 0.001 | 1.33× |
| just-sort-by | 1373637 | 0.001 | 1.51× |
| ramda.sortWith | 1235201 | 0.001 | 1.68× |
| sort-array | 1141669 | 0.001 | 1.82× |
| sort-on | 179886 | 0.006 | 11.56× |
| natural-orderby | 179463 | 0.006 | 11.59× |
| sort-by | 28690 | 0.037 | 72.49× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 11723716 | 0.000 | 0.46× |
| inline comparator chain, slice().sort() | 10235744 | 0.000 | 0.52× |
| just-sort-by | 6048982 | 0.000 | 0.89× |
| fast-multisort | 5365672 | 0.000 | 1.00× |
| es-toolkit.orderBy | 5295057 | 0.000 | 1.01× |
| thenby | 5166021 | 0.000 | 1.04× |
| remeda.sortBy | 5049112 | 0.000 | 1.06× |
| Array.prototype.sort, decorated | 4893102 | 0.000 | 1.10× |
| underscore.sortBy | 3747033 | 0.000 | 1.43× |
| fast-sort | 3636772 | 0.000 | 1.48× |
| ramda.sortWith | 3206354 | 0.000 | 1.67× |
| sort-array | 3096644 | 0.000 | 1.73× |
| lodash.orderBy | 3040515 | 0.000 | 1.76× |
| sort-on | 507784 | 0.002 | 10.57× |
| natural-orderby | 381821 | 0.003 | 14.05× |
| sort-by | 69587 | 0.015 | 77.11× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 11466684 | 0.000 | 0.46× |
| inline comparator chain, slice().sort() | 10067203 | 0.000 | 0.52× |
| just-sort-by | 5895271 | 0.000 | 0.89× |
| es-toolkit.orderBy | 5472403 | 0.000 | 0.96× |
| fast-multisort | 5270740 | 0.000 | 1.00× |
| thenby | 5231886 | 0.000 | 1.01× |
| remeda.sortBy | 4756709 | 0.000 | 1.11× |
| Array.prototype.sort, decorated | 4634174 | 0.000 | 1.14× |
| fast-sort | 3675569 | 0.000 | 1.43× |
| underscore.sortBy | 3501573 | 0.000 | 1.51× |
| ramda.sortWith | 3152175 | 0.000 | 1.67× |
| sort-array | 3035418 | 0.000 | 1.74× |
| lodash.orderBy | 2927427 | 0.000 | 1.80× |
| sort-on | 456539 | 0.002 | 11.54× |
| natural-orderby | 363739 | 0.003 | 14.49× |
| sort-by | 67883 | 0.015 | 77.64× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4364773 | 0.000 | 0.43× |
| inline comparator chain, slice().sort() | 4110115 | 0.000 | 0.45× |
| Array.prototype.sort, decorated | 1905776 | 0.001 | 0.97× |
| fast-multisort | 1855431 | 0.001 | 1.00× |
| es-toolkit.orderBy | 1692936 | 0.001 | 1.10× |
| remeda.sortBy (different order) | 1535153 | 0.001 | 1.21× |
| lodash.orderBy | 1404016 | 0.001 | 1.32× |
| thenby (different order) | 1355358 | 0.001 | 1.37× |
| fast-sort (different order) | 1049262 | 0.001 | 1.77× |
| ramda.sortWith (different order) | 993829 | 0.001 | 1.87× |
| sort-array (different order) | 911037 | 0.001 | 2.04× |
| sort-on (different order) | 185239 | 0.006 | 10.02× |
| natural-orderby (different order) | 87695 | 0.012 | 21.16× |
| sort-by (different order) | 25937 | 0.039 | 71.54× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 409496 | 0.003 | 1.00× |
| inline comparator chain, slice().sort() | 236391 | 0.004 | 1.73× |
| inline comparator chain, toSorted() | 233561 | 0.004 | 1.75× |
| underscore.sortBy | 136581 | 0.007 | 3.00× |
| lodash.orderBy | 103318 | 0.010 | 3.96× |
| Array.prototype.sort, decorated | 95599 | 0.011 | 4.28× |
| thenby | 94883 | 0.011 | 4.32× |
| es-toolkit.orderBy | 83704 | 0.012 | 4.89× |
| fast-sort | 82321 | 0.012 | 4.97× |
| remeda.sortBy | 71304 | 0.014 | 5.74× |
| ramda.sortWith | 49506 | 0.021 | 8.27× |
| sort-array | 47499 | 0.021 | 8.62× |
| just-sort-by (different order) | 36079 | 0.028 | 11.35× |
| natural-orderby (different order) | 25359 | 0.040 | 16.15× |
| sort-on (different order) | 9638 | 0.105 | 42.49× |
| sort-by | 1230 | 0.820 | 332.92× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 178324 | 0.006 | 1.00× |
| inline comparator chain, toSorted() | 177069 | 0.006 | 1.01× |
| inline comparator chain, slice().sort() | 172152 | 0.006 | 1.04× |
| underscore.sortBy | 96533 | 0.010 | 1.85× |
| thenby | 82086 | 0.012 | 2.17× |
| es-toolkit.orderBy | 78180 | 0.013 | 2.28× |
| Array.prototype.sort, decorated | 76756 | 0.013 | 2.32× |
| lodash.orderBy | 76597 | 0.013 | 2.33× |
| fast-sort | 73299 | 0.014 | 2.43× |
| remeda.sortBy | 69501 | 0.014 | 2.57× |
| ramda.sortWith | 46297 | 0.022 | 3.85× |
| sort-array | 39687 | 0.025 | 4.49× |
| just-sort-by (different order) | 33461 | 0.030 | 5.33× |
| natural-orderby (different order) | 9746 | 0.104 | 18.30× |
| sort-on (different order) | 7779 | 0.130 | 22.92× |
| sort-by | 1160 | 0.870 | 153.79× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 284449 | 0.004 | 0.90× |
| inline comparator chain, slice().sort() | 269564 | 0.004 | 0.95× |
| fast-multisort | 255970 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 163224 | 0.006 | 1.57× |
| just-sort-by (different order) | 110363 | 0.009 | 2.32× |
| lodash.orderBy | 109231 | 0.009 | 2.34× |
| thenby (different order) | 108779 | 0.009 | 2.35× |
| fast-sort | 105351 | 0.010 | 2.43× |
| es-toolkit.orderBy | 102058 | 0.010 | 2.51× |
| Array.prototype.sort, decorated | 101217 | 0.010 | 2.53× |
| remeda.sortBy (different order) | 90913 | 0.011 | 2.82× |
| ramda.sortWith (different order) | 57071 | 0.018 | 4.49× |
| sort-array | 53715 | 0.019 | 4.77× |
| natural-orderby | 27019 | 0.038 | 9.47× |
| sort-on | 10210 | 0.099 | 25.07× |
| sort-by (different order) | 1237 | 0.816 | 206.91× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 264300 | 0.004 | 0.83× |
| inline comparator chain, slice().sort() | 250069 | 0.004 | 0.88× |
| fast-multisort | 219628 | 0.005 | 1.00× |
| underscore.sortBy | 152757 | 0.007 | 1.44× |
| just-sort-by | 108908 | 0.009 | 2.02× |
| lodash.orderBy | 100262 | 0.010 | 2.19× |
| thenby | 98478 | 0.010 | 2.23× |
| fast-sort | 96903 | 0.011 | 2.27× |
| es-toolkit.orderBy | 95697 | 0.011 | 2.30× |
| Array.prototype.sort, decorated | 89710 | 0.011 | 2.45× |
| remeda.sortBy | 87655 | 0.012 | 2.51× |
| ramda.sortWith | 55094 | 0.018 | 3.99× |
| sort-array | 47873 | 0.021 | 4.59× |
| natural-orderby | 23198 | 0.044 | 9.47× |
| sort-on | 8603 | 0.118 | 25.53× |
| sort-by | 1155 | 0.872 | 190.19× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 203445 | 0.005 | 0.68× |
| inline comparator chain, slice().sort() | 195635 | 0.005 | 0.71× |
| fast-multisort | 138633 | 0.007 | 1.00× |
| underscore.sortBy | 95758 | 0.011 | 1.45× |
| thenby | 94339 | 0.011 | 1.47× |
| es-toolkit.orderBy | 87224 | 0.012 | 1.59× |
| fast-sort | 83372 | 0.012 | 1.66× |
| lodash.orderBy | 80216 | 0.013 | 1.73× |
| Array.prototype.sort, decorated | 77863 | 0.013 | 1.78× |
| remeda.sortBy | 76199 | 0.013 | 1.82× |
| just-sort-by | 53820 | 0.019 | 2.58× |
| ramda.sortWith | 49739 | 0.020 | 2.79× |
| sort-array | 43178 | 0.023 | 3.21× |
| natural-orderby | 15456 | 0.067 | 8.97× |
| sort-on | 7516 | 0.134 | 18.45× |
| sort-by | 1188 | 0.847 | 116.70× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1745356 | 0.001 | 0.82× |
| fast-multisort | 1435634 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1405353 | 0.001 | 1.02× |
| just-sort-by | 813896 | 0.001 | 1.76× |
| thenby | 656178 | 0.002 | 2.19× |
| fast-sort | 607578 | 0.002 | 2.36× |
| es-toolkit.orderBy | 597174 | 0.002 | 2.40× |
| remeda.sortBy | 591825 | 0.002 | 2.43× |
| Array.prototype.sort, decorated | 583412 | 0.002 | 2.46× |
| underscore.sortBy | 490307 | 0.002 | 2.93× |
| lodash.orderBy | 364309 | 0.003 | 3.94× |
| ramda.sortWith | 322022 | 0.003 | 4.46× |
| sort-array | 308517 | 0.003 | 4.65× |
| sort-on | 45794 | 0.023 | 31.35× |
| natural-orderby | 35410 | 0.029 | 40.54× |
| sort-by | 6449 | 0.158 | 222.63× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1776652 | 0.001 | 0.94× |
| fast-multisort | 1671029 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1456731 | 0.001 | 1.15× |
| just-sort-by | 766945 | 0.001 | 2.18× |
| thenby | 715543 | 0.001 | 2.34× |
| es-toolkit.orderBy | 662088 | 0.002 | 2.52× |
| fast-sort | 644026 | 0.002 | 2.59× |
| Array.prototype.sort, decorated | 538687 | 0.002 | 3.10× |
| remeda.sortBy | 536374 | 0.002 | 3.12× |
| underscore.sortBy | 447676 | 0.002 | 3.73× |
| lodash.orderBy | 363156 | 0.003 | 4.60× |
| ramda.sortWith | 344895 | 0.003 | 4.85× |
| sort-array | 315975 | 0.003 | 5.29× |
| sort-on | 43075 | 0.024 | 38.79× |
| natural-orderby | 34728 | 0.029 | 48.12× |
| sort-by | 6377 | 0.159 | 262.03× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 225345 | 0.004 | 0.52× |
| inline comparator chain, slice().sort() | 215122 | 0.005 | 0.54× |
| fast-multisort | 117006 | 0.009 | 1.00× |
| lodash.orderBy | 81050 | 0.013 | 1.44× |
| Array.prototype.sort, decorated | 67100 | 0.015 | 1.74× |
| es-toolkit.orderBy | 63077 | 0.016 | 1.85× |
| remeda.sortBy (different order) | 56665 | 0.018 | 2.06× |
| thenby (different order) | 54395 | 0.019 | 2.15× |
| fast-sort (different order) | 46014 | 0.022 | 2.54× |
| ramda.sortWith (different order) | 36756 | 0.028 | 3.18× |
| sort-array (different order) | 32556 | 0.031 | 3.59× |
| natural-orderby (different order) | 7839 | 0.129 | 14.93× |
| sort-on (different order) | 6819 | 0.150 | 17.16× |
| sort-by (different order) | 812 | 1.239 | 144.13× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 45430 | 0.022 | 1.00× |
| inline comparator chain, toSorted() | 17140 | 0.059 | 2.65× |
| inline comparator chain, slice().sort() | 16843 | 0.060 | 2.70× |
| underscore.sortBy | 10250 | 0.099 | 4.43× |
| lodash.orderBy | 7640 | 0.132 | 5.95× |
| thenby | 7613 | 0.132 | 5.97× |
| Array.prototype.sort, decorated | 7173 | 0.140 | 6.33× |
| es-toolkit.orderBy | 6454 | 0.155 | 7.04× |
| fast-sort | 6284 | 0.160 | 7.23× |
| remeda.sortBy | 5591 | 0.180 | 8.13× |
| ramda.sortWith | 3999 | 0.253 | 11.36× |
| sort-array | 3886 | 0.258 | 11.69× |
| just-sort-by (different order) | 2928 | 0.343 | 15.52× |
| natural-orderby (different order) | 2297 | 0.439 | 19.77× |
| sort-on (different order) | 759 | 1.322 | 59.84× |
| sort-by | 99 | 10.146 | 459.36× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12059 | 0.083 | 1.00× |
| inline comparator chain, toSorted() | 9197 | 0.109 | 1.31× |
| inline comparator chain, slice().sort() | 8821 | 0.114 | 1.37× |
| underscore.sortBy | 5593 | 0.179 | 2.16× |
| thenby | 4815 | 0.208 | 2.50× |
| es-toolkit.orderBy | 4548 | 0.220 | 2.65× |
| Array.prototype.sort, decorated | 4500 | 0.223 | 2.68× |
| lodash.orderBy | 4477 | 0.224 | 2.69× |
| fast-sort | 4262 | 0.236 | 2.83× |
| remeda.sortBy | 4087 | 0.245 | 2.95× |
| ramda.sortWith | 2915 | 0.343 | 4.14× |
| sort-array | 2379 | 0.422 | 5.07× |
| just-sort-by (different order) | 2152 | 0.466 | 5.60× |
| natural-orderby (different order) | 771 | 1.301 | 15.65× |
| sort-on (different order) | 488 | 2.052 | 24.71× |
| sort-by | 72 | 13.921 | 166.77× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 34259 | 0.029 | 1.00× |
| inline comparator chain, slice().sort() | 16142 | 0.062 | 2.12× |
| inline comparator chain, toSorted() | 15895 | 0.063 | 2.16× |
| underscore.sortBy (different order) | 10569 | 0.095 | 3.24× |
| just-sort-by (different order) | 7180 | 0.139 | 4.77× |
| lodash.orderBy | 7086 | 0.142 | 4.83× |
| fast-sort | 7006 | 0.143 | 4.89× |
| thenby (different order) | 6866 | 0.146 | 4.99× |
| es-toolkit.orderBy | 6698 | 0.149 | 5.11× |
| Array.prototype.sort, decorated | 6632 | 0.151 | 5.17× |
| remeda.sortBy (different order) | 6028 | 0.166 | 5.68× |
| ramda.sortWith (different order) | 3644 | 0.275 | 9.40× |
| sort-array | 3312 | 0.304 | 10.34× |
| natural-orderby | 2260 | 0.449 | 15.16× |
| sort-on | 647 | 1.546 | 52.93× |
| sort-by (different order) | 81 | 12.332 | 422.38× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 31591 | 0.032 | 1.00× |
| inline comparator chain, slice().sort() | 13276 | 0.076 | 2.38× |
| inline comparator chain, toSorted() | 12954 | 0.078 | 2.44× |
| underscore.sortBy | 9289 | 0.108 | 3.40× |
| just-sort-by | 6518 | 0.154 | 4.85× |
| thenby | 6207 | 0.162 | 5.09× |
| fast-sort | 6191 | 0.162 | 5.10× |
| lodash.orderBy | 6092 | 0.165 | 5.19× |
| es-toolkit.orderBy | 5850 | 0.171 | 5.40× |
| Array.prototype.sort, decorated | 5798 | 0.173 | 5.45× |
| remeda.sortBy | 5717 | 0.176 | 5.53× |
| ramda.sortWith | 3481 | 0.288 | 9.08× |
| sort-array | 3083 | 0.326 | 10.25× |
| natural-orderby | 1945 | 0.517 | 16.24× |
| sort-on | 532 | 1.882 | 59.37× |
| sort-by | 78 | 12.829 | 405.09× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12451 | 0.081 | 1.00× |
| inline comparator chain, toSorted() | 10503 | 0.096 | 1.19× |
| inline comparator chain, slice().sort() | 10133 | 0.100 | 1.23× |
| underscore.sortBy | 6112 | 0.164 | 2.04× |
| thenby | 5311 | 0.190 | 2.34× |
| fast-sort | 5012 | 0.200 | 2.48× |
| es-toolkit.orderBy | 4960 | 0.202 | 2.51× |
| lodash.orderBy | 4795 | 0.209 | 2.60× |
| Array.prototype.sort, decorated | 4778 | 0.210 | 2.61× |
| remeda.sortBy | 4597 | 0.218 | 2.71× |
| just-sort-by | 3518 | 0.285 | 3.54× |
| ramda.sortWith | 3047 | 0.329 | 4.09× |
| sort-array | 2739 | 0.365 | 4.55× |
| natural-orderby | 1483 | 0.675 | 8.40× |
| sort-on | 462 | 2.170 | 26.94× |
| sort-by | 72 | 13.837 | 172.01× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 192152 | 0.005 | 0.81× |
| inline comparator chain, slice().sort() | 157339 | 0.006 | 0.98× |
| fast-multisort | 154712 | 0.007 | 1.00× |
| just-sort-by | 84110 | 0.012 | 1.84× |
| thenby | 74792 | 0.014 | 2.07× |
| fast-sort | 69691 | 0.014 | 2.22× |
| es-toolkit.orderBy | 66308 | 0.015 | 2.33× |
| remeda.sortBy | 64448 | 0.016 | 2.40× |
| Array.prototype.sort, decorated | 56900 | 0.018 | 2.72× |
| underscore.sortBy | 50182 | 0.020 | 3.08× |
| lodash.orderBy | 40326 | 0.025 | 3.84× |
| ramda.sortWith | 34689 | 0.029 | 4.46× |
| sort-array | 33830 | 0.030 | 4.57× |
| sort-on | 4867 | 0.207 | 31.79× |
| natural-orderby | 3361 | 0.299 | 46.04× |
| sort-by | 645 | 1.557 | 240.04× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 188438 | 0.005 | 0.85× |
| fast-multisort | 160657 | 0.006 | 1.00× |
| inline comparator chain, slice().sort() | 155552 | 0.006 | 1.03× |
| just-sort-by | 82770 | 0.012 | 1.94× |
| thenby | 79353 | 0.013 | 2.02× |
| fast-sort | 72690 | 0.014 | 2.21× |
| es-toolkit.orderBy | 67696 | 0.015 | 2.37× |
| Array.prototype.sort, decorated | 58426 | 0.017 | 2.75× |
| remeda.sortBy | 54325 | 0.019 | 2.96× |
| underscore.sortBy | 47158 | 0.021 | 3.41× |
| lodash.orderBy | 37909 | 0.027 | 4.24× |
| ramda.sortWith | 35044 | 0.029 | 4.58× |
| sort-array | 34380 | 0.029 | 4.67× |
| sort-on | 4432 | 0.228 | 36.25× |
| natural-orderby | 3502 | 0.287 | 45.87× |
| sort-by | 657 | 1.524 | 244.56× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 12666 | 0.079 | 0.99× |
| inline comparator chain, toSorted() | 12622 | 0.079 | 1.00× |
| fast-multisort | 12565 | 0.080 | 1.00× |
| lodash.orderBy | 5460 | 0.184 | 2.30× |
| Array.prototype.sort, decorated | 4122 | 0.243 | 3.05× |
| es-toolkit.orderBy | 3706 | 0.270 | 3.39× |
| remeda.sortBy (different order) | 3363 | 0.298 | 3.74× |
| thenby (different order) | 3310 | 0.303 | 3.80× |
| fast-sort (different order) | 2890 | 0.346 | 4.35× |
| ramda.sortWith (different order) | 2175 | 0.460 | 5.78× |
| sort-array (different order) | 2064 | 0.485 | 6.09× |
| natural-orderby (different order) | 746 | 1.346 | 16.84× |
| sort-on (different order) | 408 | 2.452 | 30.79× |
| sort-by (different order) | 46 | 22.014 | 276.08× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4789 | 0.209 | 1.00× |
| inline comparator chain, toSorted() | 1305 | 0.768 | 3.67× |
| inline comparator chain, slice().sort() | 1266 | 0.791 | 3.78× |
| underscore.sortBy | 891 | 1.123 | 5.37× |
| thenby | 701 | 1.429 | 6.83× |
| lodash.orderBy | 664 | 1.508 | 7.21× |
| fast-sort | 650 | 1.539 | 7.37× |
| es-toolkit.orderBy | 645 | 1.552 | 7.43× |
| Array.prototype.sort, decorated | 639 | 1.572 | 7.50× |
| remeda.sortBy | 552 | 1.814 | 8.68× |
| ramda.sortWith | 393 | 2.547 | 12.20× |
| sort-array | 374 | 2.678 | 12.82× |
| just-sort-by (different order) | 274 | 3.652 | 17.47× |
| natural-orderby (different order) | 217 | 4.608 | 22.05× |
| sort-on (different order) | 73 | 13.642 | 65.32× |
| sort-by | 10 | 104.419 | 499.94× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 888 | 1.132 | 1.00× |
| inline comparator chain, toSorted() | 464 | 2.155 | 1.91× |
| inline comparator chain, slice().sort() | 457 | 2.190 | 1.94× |
| underscore.sortBy | 353 | 2.835 | 2.51× |
| thenby | 329 | 3.040 | 2.70× |
| fast-sort | 309 | 3.237 | 2.87× |
| es-toolkit.orderBy | 304 | 3.287 | 2.92× |
| Array.prototype.sort, decorated | 292 | 3.444 | 3.05× |
| remeda.sortBy | 283 | 3.542 | 3.14× |
| lodash.orderBy | 276 | 3.628 | 3.22× |
| ramda.sortWith | 202 | 4.951 | 4.40× |
| sort-array | 181 | 5.523 | 4.90× |
| just-sort-by (different order) | 159 | 6.278 | 5.57× |
| natural-orderby (different order) | 59 | 17.057 | 15.04× |
| sort-on (different order) | 36 | 27.668 | 24.57× |
| sort-by | 5 | 182.663 | 162.21× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3651 | 0.274 | 1.00× |
| inline comparator chain, toSorted() | 978 | 1.023 | 3.73× |
| inline comparator chain, slice().sort() | 974 | 1.028 | 3.75× |
| underscore.sortBy (different order) | 747 | 1.340 | 4.89× |
| thenby (different order) | 538 | 1.859 | 6.79× |
| just-sort-by (different order) | 527 | 1.897 | 6.92× |
| fast-sort | 503 | 1.989 | 7.26× |
| lodash.orderBy | 501 | 1.997 | 7.28× |
| Array.prototype.sort, decorated | 493 | 2.033 | 7.41× |
| es-toolkit.orderBy | 492 | 2.032 | 7.41× |
| remeda.sortBy (different order) | 445 | 2.251 | 8.21× |
| ramda.sortWith (different order) | 276 | 3.619 | 13.21× |
| sort-array | 260 | 3.849 | 14.03× |
| natural-orderby | 182 | 5.511 | 20.01× |
| sort-on | 48 | 20.819 | 76.02× |
| sort-by (different order) | 6 | 168.951 | 616.79× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3568 | 0.281 | 1.00× |
| inline comparator chain, toSorted() | 712 | 1.406 | 5.01× |
| inline comparator chain, slice().sort() | 710 | 1.410 | 5.03× |
| underscore.sortBy | 631 | 1.586 | 5.66× |
| thenby | 455 | 2.199 | 7.84× |
| just-sort-by | 427 | 2.354 | 8.36× |
| fast-sort | 426 | 2.351 | 8.38× |
| es-toolkit.orderBy | 412 | 2.427 | 8.66× |
| lodash.orderBy | 408 | 2.456 | 8.74× |
| remeda.sortBy | 401 | 2.494 | 8.89× |
| Array.prototype.sort, decorated | 395 | 2.537 | 9.03× |
| ramda.sortWith | 246 | 4.062 | 14.49× |
| sort-array | 228 | 4.400 | 15.68× |
| natural-orderby | 156 | 6.398 | 22.82× |
| sort-on | 40 | 24.753 | 88.32× |
| sort-by | 5 | 186.808 | 666.40× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 848 | 1.186 | 1.00× |
| inline comparator chain, slice().sort() | 514 | 1.946 | 1.65× |
| inline comparator chain, toSorted() | 511 | 1.960 | 1.66× |
| underscore.sortBy | 395 | 2.544 | 2.15× |
| thenby | 368 | 2.721 | 2.31× |
| fast-sort | 342 | 2.925 | 2.48× |
| es-toolkit.orderBy | 336 | 2.975 | 2.52× |
| Array.prototype.sort, decorated | 332 | 3.014 | 2.55× |
| remeda.sortBy | 316 | 3.162 | 2.68× |
| lodash.orderBy | 303 | 3.316 | 2.80× |
| just-sort-by | 251 | 3.992 | 3.38× |
| ramda.sortWith | 214 | 4.681 | 3.97× |
| sort-array | 198 | 5.059 | 4.29× |
| natural-orderby | 120 | 8.326 | 7.05× |
| sort-on | 33 | 30.077 | 25.38× |
| sort-by | 5 | 183.103 | 155.24× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 19809 | 0.051 | 0.72× |
| inline comparator chain, slice().sort() | 15796 | 0.064 | 0.91× |
| fast-multisort | 14341 | 0.070 | 1.00× |
| just-sort-by | 8018 | 0.125 | 1.79× |
| thenby | 7352 | 0.137 | 1.95× |
| fast-sort | 6814 | 0.147 | 2.10× |
| es-toolkit.orderBy | 6560 | 0.153 | 2.19× |
| remeda.sortBy | 6458 | 0.155 | 2.22× |
| Array.prototype.sort, decorated | 5909 | 0.170 | 2.43× |
| underscore.sortBy | 5004 | 0.201 | 2.87× |
| lodash.orderBy | 3959 | 0.256 | 3.62× |
| ramda.sortWith | 3457 | 0.290 | 4.15× |
| sort-array | 3330 | 0.301 | 4.31× |
| sort-on | 503 | 1.990 | 28.52× |
| natural-orderby | 338 | 2.963 | 42.44× |
| sort-by | 65 | 15.375 | 219.95× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 18720 | 0.054 | 0.89× |
| fast-multisort | 16669 | 0.060 | 1.00× |
| inline comparator chain, slice().sort() | 15005 | 0.067 | 1.11× |
| just-sort-by | 7884 | 0.128 | 2.11× |
| thenby | 7846 | 0.128 | 2.12× |
| fast-sort | 7258 | 0.138 | 2.30× |
| es-toolkit.orderBy | 6809 | 0.147 | 2.45× |
| Array.prototype.sort, decorated | 5858 | 0.171 | 2.85× |
| remeda.sortBy | 5581 | 0.180 | 2.99× |
| underscore.sortBy | 4769 | 0.211 | 3.50× |
| lodash.orderBy | 3694 | 0.274 | 4.51× |
| ramda.sortWith | 3543 | 0.283 | 4.70× |
| sort-array | 3427 | 0.292 | 4.86× |
| sort-on | 457 | 2.191 | 36.50× |
| natural-orderby | 331 | 3.034 | 50.32× |
| sort-by | 66 | 15.192 | 252.89× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1458 | 0.687 | 1.00× |
| inline comparator chain, toSorted() | 714 | 1.402 | 2.04× |
| inline comparator chain, slice().sort() | 707 | 1.416 | 2.06× |
| lodash.orderBy | 364 | 2.748 | 4.00× |
| Array.prototype.sort, decorated | 295 | 3.388 | 4.93× |
| es-toolkit.orderBy | 258 | 3.879 | 5.65× |
| thenby (different order) | 234 | 4.275 | 6.23× |
| remeda.sortBy (different order) | 234 | 4.282 | 6.24× |
| fast-sort (different order) | 199 | 5.025 | 7.32× |
| ramda.sortWith (different order) | 149 | 6.700 | 9.76× |
| sort-array (different order) | 141 | 7.073 | 10.30× |
| natural-orderby (different order) | 63 | 15.855 | 23.08× |
| sort-on (different order) | 27 | 36.701 | 53.38× |
| sort-by (different order) | 3 | 319.445 | 465.67× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 433 | 2.319 | 1.00× |
| inline comparator chain, slice().sort() | 114 | 8.771 | 3.80× |
| inline comparator chain, toSorted() | 113 | 8.831 | 3.82× |
| underscore.sortBy | 78 | 13.013 | 5.57× |
| thenby | 67 | 14.972 | 6.48× |
| fast-sort | 63 | 15.927 | 6.90× |
| lodash.orderBy | 62 | 16.178 | 7.00× |
| es-toolkit.orderBy | 61 | 16.595 | 7.16× |
| Array.prototype.sort, decorated | 58 | 17.310 | 7.44× |
| remeda.sortBy | 54 | 18.635 | 8.07× |
| ramda.sortWith | 38 | 26.616 | 11.52× |
| sort-array | 35 | 28.606 | 12.36× |
| just-sort-by (different order) | 27 | 36.755 | 15.91× |
| natural-orderby (different order) | 17 | 57.433 | 24.77× |
| sort-on (different order) | 7 | 142.177 | 61.59× |
| sort-by | 1 | 1013.534 | 439.12× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 49 | 20.646 | 1.00× |
| inline comparator chain, slice().sort() | 29 | 34.406 | 1.67× |
| inline comparator chain, toSorted() | 27 | 36.760 | 1.77× |
| underscore.sortBy | 23 | 43.251 | 2.10× |
| thenby | 21 | 48.652 | 2.36× |
| fast-sort | 20 | 50.978 | 2.47× |
| es-toolkit.orderBy | 19 | 53.845 | 2.61× |
| remeda.sortBy | 19 | 53.998 | 2.62× |
| Array.prototype.sort, decorated | 17 | 60.043 | 2.91× |
| lodash.orderBy | 15 | 64.707 | 3.14× |
| sort-array | 12 | 82.946 | 4.02× |
| ramda.sortWith | 12 | 83.629 | 4.04× |
| just-sort-by (different order) | 10 | 96.904 | 4.69× |
| natural-orderby (different order) | 4 | 268.792 | 13.05× |
| sort-on (different order) | 3 | 377.278 | 18.32× |
| sort-by | 0 | 2364.178 | 114.81× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 333 | 3.037 | 1.00× |
| inline comparator chain, slice().sort() | 70 | 14.304 | 4.75× |
| inline comparator chain, toSorted() | 70 | 14.422 | 4.78× |
| underscore.sortBy (different order) | 56 | 17.915 | 5.92× |
| thenby (different order) | 41 | 24.474 | 8.13× |
| just-sort-by (different order) | 41 | 24.475 | 8.14× |
| fast-sort | 39 | 25.413 | 8.45× |
| es-toolkit.orderBy | 38 | 26.566 | 8.84× |
| Array.prototype.sort, decorated | 34 | 29.517 | 9.80× |
| remeda.sortBy (different order) | 34 | 29.549 | 9.81× |
| lodash.orderBy | 34 | 29.859 | 9.88× |
| sort-array | 21 | 47.877 | 15.93× |
| ramda.sortWith (different order) | 20 | 49.817 | 16.51× |
| natural-orderby | 14 | 73.040 | 24.21× |
| sort-on | 4 | 266.069 | 88.51× |
| sort-by (different order) | 0 | 2117.303 | 704.36× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 338 | 2.985 | 1.00× |
| inline comparator chain, toSorted() | 54 | 18.571 | 6.27× |
| inline comparator chain, slice().sort() | 52 | 19.235 | 6.47× |
| underscore.sortBy | 47 | 21.563 | 7.24× |
| thenby | 35 | 28.763 | 9.72× |
| just-sort-by | 34 | 29.508 | 9.96× |
| fast-sort | 33 | 30.240 | 10.22× |
| es-toolkit.orderBy | 31 | 32.524 | 10.96× |
| remeda.sortBy | 30 | 33.905 | 11.41× |
| lodash.orderBy | 28 | 36.135 | 12.21× |
| Array.prototype.sort, decorated | 25 | 40.378 | 13.56× |
| ramda.sortWith | 19 | 52.873 | 17.82× |
| sort-array | 17 | 57.417 | 19.41× |
| natural-orderby | 10 | 96.665 | 32.65× |
| sort-on | 3 | 319.702 | 108.14× |
| sort-by | 0 | 2277.368 | 770.37× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 50 | 20.018 | 1.00× |
| inline comparator chain, toSorted() | 33 | 29.926 | 1.50× |
| inline comparator chain, slice().sort() | 31 | 33.060 | 1.64× |
| underscore.sortBy | 27 | 37.622 | 1.89× |
| thenby | 24 | 40.853 | 2.05× |
| fast-sort | 23 | 43.409 | 2.18× |
| es-toolkit.orderBy | 22 | 45.222 | 2.27× |
| remeda.sortBy | 21 | 46.951 | 2.36× |
| Array.prototype.sort, decorated | 20 | 50.838 | 2.55× |
| lodash.orderBy | 18 | 56.543 | 2.84× |
| just-sort-by | 18 | 56.595 | 2.84× |
| ramda.sortWith | 14 | 70.206 | 3.52× |
| sort-array | 14 | 71.070 | 3.57× |
| natural-orderby | 8 | 133.083 | 6.66× |
| sort-on | 3 | 393.575 | 19.78× |
| sort-by | 0 | 2355.762 | 118.42× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1721 | 0.594 | 0.78× |
| inline comparator chain, slice().sort() | 1410 | 0.722 | 0.95× |
| fast-multisort | 1340 | 0.758 | 1.00× |
| just-sort-by | 770 | 1.318 | 1.74× |
| thenby | 703 | 1.437 | 1.91× |
| fast-sort | 655 | 1.540 | 2.05× |
| es-toolkit.orderBy | 628 | 1.603 | 2.13× |
| remeda.sortBy | 559 | 1.827 | 2.40× |
| underscore.sortBy | 461 | 2.212 | 2.91× |
| Array.prototype.sort, decorated | 403 | 2.540 | 3.33× |
| lodash.orderBy | 347 | 2.942 | 3.87× |
| ramda.sortWith | 343 | 2.919 | 3.90× |
| sort-array | 329 | 3.050 | 4.08× |
| sort-on | 50 | 19.981 | 26.77× |
| natural-orderby | 26 | 38.580 | 51.51× |
| sort-by | 7 | 153.977 | 206.20× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1608 | 0.642 | 0.93× |
| fast-multisort | 1497 | 0.683 | 1.00× |
| inline comparator chain, slice().sort() | 1345 | 0.755 | 1.11× |
| just-sort-by | 746 | 1.360 | 2.01× |
| thenby | 731 | 1.380 | 2.05× |
| fast-sort | 671 | 1.500 | 2.23× |
| es-toolkit.orderBy | 640 | 1.574 | 2.34× |
| remeda.sortBy | 474 | 2.134 | 3.16× |
| underscore.sortBy | 440 | 2.334 | 3.40× |
| Array.prototype.sort, decorated | 407 | 2.503 | 3.68× |
| ramda.sortWith | 346 | 2.898 | 4.33× |
| sort-array | 329 | 3.066 | 4.55× |
| lodash.orderBy | 320 | 3.166 | 4.68× |
| sort-on | 44 | 22.942 | 34.22× |
| natural-orderby | 26 | 38.758 | 57.85× |
| sort-by | 7 | 153.157 | 229.20× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 140 | 7.251 | 1.00× |
| inline comparator chain, slice().sort() | 50 | 20.025 | 2.79× |
| inline comparator chain, toSorted() | 50 | 20.048 | 2.80× |
| lodash.orderBy | 24 | 41.863 | 5.83× |
| Array.prototype.sort, decorated | 20 | 49.092 | 6.84× |
| es-toolkit.orderBy | 18 | 55.978 | 7.78× |
| thenby (different order) | 18 | 56.320 | 7.86× |
| remeda.sortBy (different order) | 18 | 57.105 | 7.97× |
| fast-sort (different order) | 15 | 67.746 | 9.46× |
| ramda.sortWith (different order) | 11 | 89.884 | 12.56× |
| sort-array (different order) | 11 | 92.136 | 12.87× |
| natural-orderby (different order) | 5 | 197.896 | 27.60× |
| sort-on (different order) | 2 | 478.520 | 66.86× |
| sort-by (different order) | 0 | 4171.916 | 582.87× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42 | 23.877 | 1.00× |
| inline comparator chain, toSorted() | 11 | 90.726 | 3.80× |
| inline comparator chain, slice().sort() | 10 | 101.977 | 4.17× |
| underscore.sortBy | 7 | 147.607 | 6.17× |
| thenby | 6 | 162.470 | 6.70× |
| fast-sort | 6 | 167.239 | 7.00× |
| es-toolkit.orderBy | 6 | 168.970 | 7.08× |
| remeda.sortBy | 5 | 194.761 | 8.16× |
| Array.prototype.sort, decorated | 5 | 199.692 | 8.37× |
| lodash.orderBy | 5 | 205.960 | 8.51× |
| ramda.sortWith | 4 | 266.998 | 11.19× |
| sort-array | 4 | 281.662 | 11.80× |
| just-sort-by (different order) | 3 | 383.770 | 16.07× |
| natural-orderby (different order) | 2 | 590.568 | 24.75× |
| sort-on (different order) | 1 | 1365.265 | 57.22× |
| sort-by | 0 | 10168.045 | 426.17× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 374.867 | 1.00× |
| inline comparator chain, toSorted() | 2 | 663.521 | 1.77× |
| inline comparator chain, slice().sort() | 1 | 675.410 | 1.80× |
| underscore.sortBy | 1 | 882.527 | 2.36× |
| fast-sort | 1 | 1006.879 | 2.69× |
| thenby | 1 | 1012.498 | 2.70× |
| es-toolkit.orderBy | 1 | 1019.275 | 2.72× |
| remeda.sortBy | 1 | 1109.635 | 2.96× |
| Array.prototype.sort, decorated | 1 | 1285.483 | 3.43× |
| ramda.sortWith | 1 | 1377.770 | 3.68× |
| lodash.orderBy | 1 | 1400.846 | 3.74× |
| sort-array | 1 | 1559.646 | 4.17× |
| just-sort-by (different order) | 1 | 1790.062 | 4.78× |
| natural-orderby (different order) | 0 | 4878.874 | 13.03× |
| sort-on (different order) | 0 | 5240.767 | 14.00× |
| sort-by | 0 | 29221.043 | 78.06× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 28 | 35.151 | 1.00× |
| inline comparator chain, slice().sort() | 4 | 223.601 | 6.36× |
| inline comparator chain, toSorted() | 4 | 239.710 | 6.74× |
| underscore.sortBy (different order) | 4 | 276.743 | 7.88× |
| thenby (different order) | 3 | 395.006 | 11.24× |
| fast-sort | 3 | 399.618 | 11.38× |
| es-toolkit.orderBy | 2 | 416.554 | 11.86× |
| just-sort-by (different order) | 2 | 418.599 | 11.87× |
| remeda.sortBy (different order) | 2 | 460.251 | 13.09× |
| lodash.orderBy | 2 | 558.291 | 15.89× |
| Array.prototype.sort, decorated | 2 | 599.171 | 17.06× |
| ramda.sortWith (different order) | 1 | 735.868 | 20.95× |
| sort-array | 1 | 769.270 | 21.90× |
| natural-orderby | 1 | 1065.814 | 30.34× |
| sort-on | 0 | 3484.141 | 99.18× |
| sort-by (different order) | 0 | 25564.260 | 727.72× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 23 | 44.297 | 1.00× |
| inline comparator chain, toSorted() | 3 | 341.648 | 7.97× |
| inline comparator chain, slice().sort() | 3 | 350.156 | 8.15× |
| underscore.sortBy | 3 | 369.112 | 8.49× |
| thenby | 2 | 511.743 | 11.94× |
| just-sort-by | 2 | 529.727 | 12.36× |
| fast-sort | 2 | 533.231 | 12.45× |
| es-toolkit.orderBy | 2 | 552.267 | 12.89× |
| remeda.sortBy | 2 | 565.601 | 13.20× |
| lodash.orderBy | 1 | 781.895 | 18.25× |
| ramda.sortWith | 1 | 820.857 | 19.16× |
| Array.prototype.sort, decorated | 1 | 825.147 | 19.26× |
| sort-array | 1 | 926.117 | 21.62× |
| natural-orderby | 1 | 1452.963 | 33.91× |
| sort-on | 0 | 4217.620 | 98.44× |
| sort-by | 0 | 27935.472 | 652.01× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 417.463 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 518.052 | 1.24× |
| inline comparator chain, toSorted() | 2 | 542.962 | 1.30× |
| underscore.sortBy | 2 | 614.479 | 1.47× |
| thenby | 1 | 733.487 | 1.76× |
| fast-sort | 1 | 793.546 | 1.90× |
| es-toolkit.orderBy | 1 | 817.915 | 1.96× |
| remeda.sortBy | 1 | 824.462 | 1.97× |
| Array.prototype.sort, decorated | 1 | 1075.547 | 2.58× |
| just-sort-by | 1 | 1085.308 | 2.60× |
| ramda.sortWith | 1 | 1121.608 | 2.69× |
| lodash.orderBy | 1 | 1170.656 | 2.80× |
| sort-array | 1 | 1253.574 | 3.00× |
| natural-orderby | 1 | 1931.244 | 4.63× |
| sort-on | 0 | 5182.870 | 12.42× |
| sort-by | 0 | 28995.919 | 69.46× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 169 | 5.973 | 0.79× |
| inline comparator chain, slice().sort() | 140 | 7.199 | 0.95× |
| fast-multisort | 133 | 7.598 | 1.00× |
| just-sort-by | 77 | 13.075 | 1.72× |
| thenby | 70 | 14.316 | 1.90× |
| fast-sort | 64 | 15.953 | 2.08× |
| es-toolkit.orderBy | 62 | 16.155 | 2.14× |
| remeda.sortBy | 55 | 18.322 | 2.43× |
| ramda.sortWith | 34 | 29.830 | 3.96× |
| sort-array | 31 | 33.121 | 4.32× |
| underscore.sortBy | 29 | 36.660 | 4.60× |
| Array.prototype.sort, decorated | 28 | 35.771 | 4.73× |
| lodash.orderBy | 19 | 53.128 | 6.85× |
| sort-on | 5 | 200.969 | 26.70× |
| natural-orderby | 3 | 386.345 | 51.19× |
| sort-by | 1 | 1451.607 | 192.87× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 160 | 6.267 | 0.89× |
| fast-multisort | 143 | 7.044 | 1.00× |
| inline comparator chain, slice().sort() | 133 | 7.536 | 1.07× |
| just-sort-by | 74 | 13.684 | 1.93× |
| thenby | 73 | 13.724 | 1.96× |
| fast-sort | 68 | 14.780 | 2.11× |
| es-toolkit.orderBy | 64 | 15.745 | 2.24× |
| remeda.sortBy | 47 | 21.405 | 3.05× |
| ramda.sortWith | 34 | 29.569 | 4.22× |
| Array.prototype.sort, decorated | 32 | 32.714 | 4.45× |
| underscore.sortBy | 30 | 35.373 | 4.72× |
| sort-array | 30 | 33.898 | 4.72× |
| lodash.orderBy | 19 | 52.908 | 7.37× |
| sort-on | 4 | 224.410 | 32.05× |
| natural-orderby | 3 | 385.926 | 55.03× |
| sort-by | 1 | 1502.263 | 214.58× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11 | 87.822 | 1.00× |
| inline comparator chain, slice().sort() | 3 | 320.506 | 3.68× |
| inline comparator chain, toSorted() | 3 | 335.876 | 3.86× |
| lodash.orderBy | 1 | 810.224 | 9.30× |
| es-toolkit.orderBy | 1 | 831.400 | 9.54× |
| thenby (different order) | 1 | 890.613 | 10.22× |
| remeda.sortBy (different order) | 1 | 901.189 | 10.35× |
| Array.prototype.sort, decorated | 1 | 943.607 | 10.83× |
| fast-sort (different order) | 1 | 1034.287 | 11.87× |
| ramda.sortWith (different order) | 1 | 1351.395 | 15.51× |
| sort-array (different order) | 1 | 1357.683 | 15.59× |
| natural-orderby (different order) | 0 | 2601.888 | 29.87× |
| sort-on (different order) | 0 | 6233.161 | 71.56× |
| sort-by (different order) | 0 | 52353.497 | 601.01× |

</details>

<!-- bench:end -->

### Browsers

Same data, sizes, cases and libraries as above, each result checked against lodash before timing, best competitor per case (`pnpm bench:browsers`). Chromium and WebKit are Playwright's builds; Firefox is the installed `/Applications/Firefox.app` driven over WebDriver BiDi (Playwright's own Firefox build does not start on macOS 27), with Playwright's Firefox as the fallback. Apple M5 Max.

<!-- browsers:start -->

#### WebKit 27.2

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, slice().sort() | 0.38× | 1.30× | 6.70× | 56 | 0 |
| inline comparator chain, toSorted() | 0.42× | 1.33× | 6.73× | 56 | 0 |
| thenby | 0.61× | 2.26× | 11.63× | 56 | 12 |
| just-sort-by | 0.54× | 2.42× | 24.00× | 49 | 17 |
| fast-sort | 0.71× | 2.51× | 11.94× | 56 | 6 |
| underscore.sortBy | 0.66× | 2.55× | 9.19× | 49 | 6 |
| es-toolkit.orderBy | 0.61× | 2.57× | 11.74× | 56 | 0 |
| Array.prototype.sort, decorated | 0.62× | 2.76× | 14.43× | 56 | 0 |
| remeda.sortBy | 0.95× | 2.97× | 13.56× | 56 | 12 |
| ramda.sortWith | 0.78× | 3.21× | 14.92× | 56 | 12 |
| sort-array | 1.20× | 3.31× | 15.53× | 56 | 6 |
| lodash.orderBy | 1.28× | 4.63× | 31.44× | 56 | 0 |
| natural-orderby | 8.23× | 23.81× | 69.01× | 56 | 19 |
| sort-on | 1.03× | 31.00× | 132.29× | 56 | 17 |
| sort-by | 2.61× | 116.78× | 484.59× | 56 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 47154558 | 0.000 | 0.89× |
| fast-multisort | 42051532 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 40821046 | 0.000 | 1.03× |
| inline comparator chain, slice().sort() | 39632348 | 0.000 | 1.06× |
| es-toolkit.orderBy | 36077902 | 0.000 | 1.17× |
| sort-on | 33498044 | 0.000 | 1.26× |
| thenby | 28355644 | 0.000 | 1.48× |
| Array.prototype.sort, decorated | 24492170 | 0.000 | 1.72× |
| ramda.sortWith | 22857612 | 0.000 | 1.84× |
| fast-sort | 22160960 | 0.000 | 1.90× |
| underscore.sortBy | 16388100 | 0.000 | 2.57× |
| sort-array | 15912188 | 0.000 | 2.64× |
| remeda.sortBy | 15718256 | 0.000 | 2.68× |
| sort-by | 15268644 | 0.000 | 2.75× |
| lodash.orderBy | 13659282 | 0.000 | 3.08× |
| natural-orderby | 4457874 | 0.000 | 9.43× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 47079800 | 0.000 | 0.86× |
| inline comparator chain, slice().sort() | 41218930 | 0.000 | 0.98× |
| fast-multisort | 40308578 | 0.000 | 1.00× |
| sort-on | 39045602 | 0.000 | 1.03× |
| es-toolkit.orderBy | 38326632 | 0.000 | 1.05× |
| inline comparator chain, toSorted() | 38226104 | 0.000 | 1.05× |
| thenby | 25892130 | 0.000 | 1.56× |
| Array.prototype.sort, decorated | 23954722 | 0.000 | 1.68× |
| ramda.sortWith | 22292968 | 0.000 | 1.81× |
| fast-sort | 20778582 | 0.000 | 1.94× |
| underscore.sortBy | 17583812 | 0.000 | 2.29× |
| remeda.sortBy | 16286146 | 0.000 | 2.48× |
| sort-array | 15153918 | 0.000 | 2.66× |
| sort-by | 14800968 | 0.000 | 2.72× |
| lodash.orderBy | 13241432 | 0.000 | 3.04× |
| natural-orderby | 2195376 | 0.000 | 18.36× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 49596254 | 0.000 | 0.89× |
| fast-multisort | 44045294 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 39482792 | 0.000 | 1.12× |
| inline comparator chain, toSorted() | 38046010 | 0.000 | 1.16× |
| sort-on | 37242384 | 0.000 | 1.18× |
| es-toolkit.orderBy | 33454576 | 0.000 | 1.32× |
| thenby | 28041038 | 0.000 | 1.57× |
| ramda.sortWith | 23275666 | 0.000 | 1.89× |
| Array.prototype.sort, decorated | 23123638 | 0.000 | 1.90× |
| fast-sort | 20912874 | 0.000 | 2.11× |
| underscore.sortBy | 16373412 | 0.000 | 2.69× |
| remeda.sortBy | 15483428 | 0.000 | 2.84× |
| sort-array | 15289136 | 0.000 | 2.88× |
| sort-by | 14501050 | 0.000 | 3.04× |
| lodash.orderBy | 13337128 | 0.000 | 3.30× |
| natural-orderby | 2774282 | 0.000 | 15.88× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 48946856 | 0.000 | 0.85× |
| fast-multisort | 41458036 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 38686546 | 0.000 | 1.07× |
| inline comparator chain, slice().sort() | 38507838 | 0.000 | 1.08× |
| es-toolkit.orderBy | 35765130 | 0.000 | 1.16× |
| sort-on | 35567028 | 0.000 | 1.17× |
| thenby | 27746740 | 0.000 | 1.49× |
| Array.prototype.sort, decorated | 24360088 | 0.000 | 1.70× |
| ramda.sortWith | 22377250 | 0.000 | 1.85× |
| fast-sort | 19387248 | 0.000 | 2.14× |
| underscore.sortBy | 17560810 | 0.000 | 2.36× |
| remeda.sortBy | 14844958 | 0.000 | 2.79× |
| sort-array | 14722638 | 0.000 | 2.82× |
| sort-by | 14635192 | 0.000 | 2.83× |
| lodash.orderBy | 12528032 | 0.000 | 3.31× |
| natural-orderby | 2648362 | 0.000 | 15.65× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 46079890 | 0.000 | 0.96× |
| fast-multisort | 44083100 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 38354312 | 0.000 | 1.15× |
| sort-on | 36367652 | 0.000 | 1.21× |
| inline comparator chain, slice().sort() | 33978432 | 0.000 | 1.30× |
| es-toolkit.orderBy | 33761496 | 0.000 | 1.31× |
| thenby | 25043626 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 23699746 | 0.000 | 1.86× |
| ramda.sortWith | 22235192 | 0.000 | 1.98× |
| fast-sort | 19460344 | 0.000 | 2.27× |
| underscore.sortBy | 17135260 | 0.000 | 2.57× |
| sort-by | 14595844 | 0.000 | 3.02× |
| sort-array | 14314750 | 0.000 | 3.08× |
| remeda.sortBy | 13550680 | 0.000 | 3.25× |
| lodash.orderBy | 11800032 | 0.000 | 3.74× |
| natural-orderby | 907545 | 0.001 | 48.57× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 50019718 | 0.000 | 0.84× |
| fast-multisort | 41802990 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 36103258 | 0.000 | 1.16× |
| inline comparator chain, toSorted() | 36037208 | 0.000 | 1.16× |
| sort-on | 33145880 | 0.000 | 1.26× |
| es-toolkit.orderBy | 32949540 | 0.000 | 1.27× |
| thenby | 26942162 | 0.000 | 1.55× |
| Array.prototype.sort, decorated | 22570942 | 0.000 | 1.85× |
| ramda.sortWith | 22356004 | 0.000 | 1.87× |
| fast-sort | 19332962 | 0.000 | 2.16× |
| underscore.sortBy | 17246460 | 0.000 | 2.42× |
| sort-by | 15075172 | 0.000 | 2.77× |
| sort-array | 14982430 | 0.000 | 2.79× |
| remeda.sortBy | 14064176 | 0.000 | 2.97× |
| lodash.orderBy | 12007926 | 0.000 | 3.48× |
| natural-orderby | 3589058 | 0.000 | 11.65× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 45101024 | 0.000 | 0.91× |
| fast-multisort | 41129494 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 38566860 | 0.000 | 1.07× |
| inline comparator chain, toSorted() | 37937572 | 0.000 | 1.08× |
| sort-on | 34719724 | 0.000 | 1.18× |
| es-toolkit.orderBy | 31778008 | 0.000 | 1.29× |
| thenby | 26409702 | 0.000 | 1.56× |
| Array.prototype.sort, decorated | 21542796 | 0.000 | 1.91× |
| ramda.sortWith | 20836796 | 0.000 | 1.97× |
| fast-sort | 19324216 | 0.000 | 2.13× |
| underscore.sortBy | 16115278 | 0.000 | 2.55× |
| sort-array | 16064288 | 0.000 | 2.56× |
| sort-by | 15732410 | 0.000 | 2.61× |
| remeda.sortBy | 14686206 | 0.000 | 2.80× |
| lodash.orderBy | 11701784 | 0.000 | 3.51× |
| natural-orderby | 3373914 | 0.000 | 12.19× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 40330508 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 39642678 | 0.000 | 1.02× |
| inline comparator chain, slice().sort() | 34566600 | 0.000 | 1.17× |
| sort-on | 34146166 | 0.000 | 1.18× |
| es-toolkit.orderBy | 31082298 | 0.000 | 1.30× |
| Array.prototype.sort, decorated | 22238646 | 0.000 | 1.81× |
| fast-sort | 15867562 | 0.000 | 2.54× |
| sort-array | 14783198 | 0.000 | 2.73× |
| ramda.sortWith | 14734962 | 0.000 | 2.74× |
| sort-by | 13081652 | 0.000 | 3.08× |
| thenby | 12013530 | 0.000 | 3.36× |
| lodash.orderBy | 11923590 | 0.000 | 3.38× |
| remeda.sortBy | 9045274 | 0.000 | 4.46× |
| natural-orderby | 584398 | 0.002 | 69.01× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 6821586 | 0.000 | 0.42× |
| Array.prototype.sort, decorated | 4638814 | 0.000 | 0.62× |
| inline comparator chain, toSorted() | 4527774 | 0.000 | 0.64× |
| underscore.sortBy | 4242900 | 0.000 | 0.68× |
| thenby | 3507186 | 0.000 | 0.82× |
| es-toolkit.orderBy | 3192474 | 0.000 | 0.90× |
| fast-sort | 3022662 | 0.000 | 0.95× |
| fast-multisort | 2876680 | 0.000 | 1.00× |
| ramda.sortWith | 2537952 | 0.000 | 1.13× |
| remeda.sortBy | 2444246 | 0.000 | 1.18× |
| lodash.orderBy | 2040996 | 0.000 | 1.41× |
| sort-array | 1904707 | 0.001 | 1.51× |
| just-sort-by (different order) | 1182837 | 0.001 | 2.43× |
| natural-orderby (different order) | 343759 | 0.003 | 8.37× |
| sort-on (different order) | 288919 | 0.003 | 9.96× |
| sort-by | 68146 | 0.014 | 42.21× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5851430 | 0.000 | 0.42× |
| inline comparator chain, toSorted() | 4384192 | 0.000 | 0.56× |
| thenby | 3802966 | 0.000 | 0.64× |
| underscore.sortBy | 3681072 | 0.000 | 0.66× |
| Array.prototype.sort, decorated | 3550312 | 0.000 | 0.69× |
| es-toolkit.orderBy | 3228440 | 0.000 | 0.76× |
| fast-sort | 3130486 | 0.000 | 0.78× |
| ramda.sortWith | 2552156 | 0.000 | 0.96× |
| fast-multisort | 2440780 | 0.000 | 1.00× |
| remeda.sortBy | 2363026 | 0.000 | 1.03× |
| lodash.orderBy | 1912051 | 0.001 | 1.28× |
| sort-array | 1559115 | 0.001 | 1.57× |
| just-sort-by | 844615 | 0.001 | 2.89× |
| sort-on | 209917 | 0.005 | 11.63× |
| natural-orderby | 125121 | 0.008 | 19.51× |
| sort-by | 66669 | 0.015 | 36.61× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 10409168 | 0.000 | 0.38× |
| inline comparator chain, toSorted() | 7572882 | 0.000 | 0.52× |
| just-sort-by (different order) | 6703894 | 0.000 | 0.59× |
| es-toolkit.orderBy | 5975580 | 0.000 | 0.66× |
| fast-sort | 5517744 | 0.000 | 0.71× |
| thenby (different order) | 5111614 | 0.000 | 0.77× |
| Array.prototype.sort, decorated | 5074522 | 0.000 | 0.77× |
| underscore.sortBy (different order) | 4056002 | 0.000 | 0.97× |
| fast-multisort | 3923214 | 0.000 | 1.00× |
| remeda.sortBy (different order) | 3454006 | 0.000 | 1.14× |
| ramda.sortWith (different order) | 3279880 | 0.000 | 1.20× |
| sort-array | 2732348 | 0.000 | 1.44× |
| lodash.orderBy | 2195524 | 0.000 | 1.79× |
| natural-orderby | 374555 | 0.003 | 10.47× |
| sort-on | 308749 | 0.003 | 12.71× |
| sort-by (different order) | 66319 | 0.015 | 59.16× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 6186260 | 0.000 | 0.41× |
| inline comparator chain, toSorted() | 6100794 | 0.000 | 0.42× |
| just-sort-by | 4688102 | 0.000 | 0.54× |
| thenby | 3050962 | 0.000 | 0.83× |
| fast-sort | 2742956 | 0.000 | 0.93× |
| remeda.sortBy | 2688438 | 0.000 | 0.95× |
| es-toolkit.orderBy | 2649778 | 0.000 | 0.96× |
| fast-multisort | 2544846 | 0.000 | 1.00× |
| underscore.sortBy | 2505478 | 0.000 | 1.02× |
| Array.prototype.sort, decorated | 2337174 | 0.000 | 1.09× |
| ramda.sortWith | 2193510 | 0.000 | 1.16× |
| sort-array | 1676041 | 0.001 | 1.52× |
| lodash.orderBy | 1178061 | 0.001 | 2.16× |
| natural-orderby | 309289 | 0.003 | 8.23× |
| sort-on | 188459 | 0.005 | 13.50× |
| sort-by | 45528 | 0.022 | 55.90× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4133274 | 0.000 | 0.55× |
| inline comparator chain, slice().sort() | 4110946 | 0.000 | 0.55× |
| thenby | 3015642 | 0.000 | 0.75× |
| es-toolkit.orderBy | 2691088 | 0.000 | 0.84× |
| fast-sort | 2518988 | 0.000 | 0.90× |
| fast-multisort | 2260602 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 2233432 | 0.000 | 1.01× |
| remeda.sortBy | 2196894 | 0.000 | 1.03× |
| ramda.sortWith | 2139054 | 0.000 | 1.06× |
| underscore.sortBy | 2061426 | 0.000 | 1.10× |
| sort-array | 1526253 | 0.001 | 1.48× |
| just-sort-by | 1457311 | 0.001 | 1.55× |
| lodash.orderBy | 1300885 | 0.001 | 1.74× |
| sort-on | 201559 | 0.005 | 11.22× |
| natural-orderby | 80874 | 0.012 | 27.95× |
| sort-by | 56825 | 0.017 | 39.78× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 10089244 | 0.000 | 0.50× |
| inline comparator chain, toSorted() | 10073604 | 0.000 | 0.50× |
| thenby | 8232276 | 0.000 | 0.61× |
| es-toolkit.orderBy | 8212162 | 0.000 | 0.61× |
| Array.prototype.sort, decorated | 8114118 | 0.000 | 0.62× |
| just-sort-by | 7005392 | 0.000 | 0.72× |
| fast-sort | 6648126 | 0.000 | 0.75× |
| underscore.sortBy | 6611590 | 0.000 | 0.76× |
| ramda.sortWith | 6384034 | 0.000 | 0.78× |
| fast-multisort | 5011416 | 0.000 | 1.00× |
| remeda.sortBy | 4420114 | 0.000 | 1.13× |
| sort-array | 4082198 | 0.000 | 1.23× |
| lodash.orderBy | 2862548 | 0.000 | 1.75× |
| sort-on | 563840 | 0.002 | 8.89× |
| natural-orderby | 460974 | 0.002 | 10.87× |
| sort-by | 167556 | 0.006 | 29.91× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 10049468 | 0.000 | 0.51× |
| inline comparator chain, toSorted() | 9775520 | 0.000 | 0.52× |
| just-sort-by | 7185044 | 0.000 | 0.71× |
| fast-multisort | 5099854 | 0.000 | 1.00× |
| underscore.sortBy | 4753056 | 0.000 | 1.07× |
| remeda.sortBy | 4418246 | 0.000 | 1.15× |
| sort-array | 4246278 | 0.000 | 1.20× |
| thenby | 2682520 | 0.000 | 1.90× |
| Array.prototype.sort, decorated | 2629230 | 0.000 | 1.94× |
| fast-sort | 2291466 | 0.000 | 2.23× |
| es-toolkit.orderBy | 2230530 | 0.000 | 2.29× |
| ramda.sortWith | 1590659 | 0.001 | 3.21× |
| lodash.orderBy | 1410219 | 0.001 | 3.62× |
| sort-on | 489600 | 0.002 | 10.42× |
| natural-orderby | 401618 | 0.002 | 12.70× |
| sort-by | 28538 | 0.034 | 178.71× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4505796 | 0.000 | 0.46× |
| inline comparator chain, slice().sort() | 4396400 | 0.000 | 0.47× |
| Array.prototype.sort, decorated | 2615160 | 0.000 | 0.79× |
| es-toolkit.orderBy | 2151048 | 0.000 | 0.96× |
| fast-multisort | 2066444 | 0.000 | 1.00× |
| remeda.sortBy (different order) | 1930621 | 0.001 | 1.07× |
| thenby (different order) | 1849215 | 0.001 | 1.12× |
| ramda.sortWith (different order) | 1612205 | 0.001 | 1.28× |
| fast-sort (different order) | 1509593 | 0.001 | 1.37× |
| lodash.orderBy | 1374451 | 0.001 | 1.50× |
| sort-array (different order) | 1358587 | 0.001 | 1.52× |
| sort-on (different order) | 203375 | 0.005 | 10.16× |
| natural-orderby (different order) | 51982 | 0.019 | 39.75× |
| sort-by (different order) | 50545 | 0.019 | 40.88× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 627734 | 0.002 | 1.00× |
| inline comparator chain, toSorted() | 255074 | 0.004 | 2.46× |
| inline comparator chain, slice().sort() | 251228 | 0.004 | 2.50× |
| underscore.sortBy | 154118 | 0.006 | 4.07× |
| Array.prototype.sort, decorated | 148987 | 0.007 | 4.21× |
| thenby | 115685 | 0.009 | 5.43× |
| fast-sort | 111641 | 0.009 | 5.62× |
| es-toolkit.orderBy | 96974 | 0.010 | 6.47× |
| remeda.sortBy | 96166 | 0.010 | 6.53× |
| lodash.orderBy | 88683 | 0.011 | 7.08× |
| sort-array | 85524 | 0.012 | 7.34× |
| ramda.sortWith | 82102 | 0.012 | 7.65× |
| just-sort-by (different order) | 36523 | 0.027 | 17.19× |
| natural-orderby (different order) | 26025 | 0.037 | 24.12× |
| sort-on (different order) | 10521 | 0.088 | 59.66× |
| sort-by | 2190 | 0.357 | 286.70× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 243620 | 0.004 | 0.95× |
| inline comparator chain, toSorted() | 240812 | 0.004 | 0.96× |
| fast-multisort | 232352 | 0.004 | 1.00× |
| thenby | 122096 | 0.008 | 1.90× |
| es-toolkit.orderBy | 111391 | 0.009 | 2.09× |
| underscore.sortBy | 110987 | 0.009 | 2.09× |
| Array.prototype.sort, decorated | 109285 | 0.009 | 2.13× |
| fast-sort | 106477 | 0.009 | 2.18× |
| remeda.sortBy | 100546 | 0.010 | 2.31× |
| ramda.sortWith | 83028 | 0.012 | 2.80× |
| lodash.orderBy | 75005 | 0.013 | 3.10× |
| sort-array | 70246 | 0.014 | 3.31× |
| just-sort-by (different order) | 29900 | 0.032 | 7.77× |
| natural-orderby (different order) | 10089 | 0.091 | 23.03× |
| sort-on (different order) | 7897 | 0.115 | 29.42× |
| sort-by | 1990 | 0.385 | 116.78× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 432358 | 0.002 | 0.85× |
| inline comparator chain, toSorted() | 430126 | 0.002 | 0.85× |
| fast-multisort | 366671 | 0.003 | 1.00× |
| underscore.sortBy (different order) | 259174 | 0.004 | 1.41× |
| Array.prototype.sort, decorated | 197745 | 0.005 | 1.85× |
| just-sort-by (different order) | 181451 | 0.005 | 2.02× |
| thenby (different order) | 177338 | 0.006 | 2.07× |
| fast-sort | 160558 | 0.006 | 2.28× |
| es-toolkit.orderBy | 156806 | 0.006 | 2.34× |
| remeda.sortBy (different order) | 136583 | 0.007 | 2.68× |
| lodash.orderBy | 125480 | 0.008 | 2.92× |
| sort-array | 116651 | 0.009 | 3.14× |
| ramda.sortWith (different order) | 103396 | 0.010 | 3.55× |
| natural-orderby | 31263 | 0.031 | 11.73× |
| sort-on | 10405 | 0.089 | 35.24× |
| sort-by (different order) | 2199 | 0.351 | 166.71× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 402384 | 0.002 | 0.84× |
| inline comparator chain, slice().sort() | 383457 | 0.003 | 0.88× |
| fast-multisort | 336287 | 0.003 | 1.00× |
| just-sort-by | 189585 | 0.005 | 1.77× |
| underscore.sortBy | 171646 | 0.006 | 1.96× |
| thenby | 157854 | 0.006 | 2.13× |
| es-toolkit.orderBy | 135147 | 0.007 | 2.49× |
| fast-sort | 130120 | 0.008 | 2.58× |
| remeda.sortBy | 121114 | 0.008 | 2.78× |
| Array.prototype.sort, decorated | 114283 | 0.009 | 2.94× |
| ramda.sortWith | 87703 | 0.011 | 3.83× |
| sort-array | 84700 | 0.012 | 3.97× |
| lodash.orderBy | 71832 | 0.014 | 4.68× |
| natural-orderby | 26269 | 0.037 | 12.80× |
| sort-on | 8408 | 0.108 | 39.99× |
| sort-by | 2025 | 0.379 | 166.10× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 223444 | 0.004 | 0.65× |
| inline comparator chain, slice().sort() | 218365 | 0.005 | 0.67× |
| fast-multisort | 146205 | 0.007 | 1.00× |
| thenby | 111667 | 0.009 | 1.31× |
| underscore.sortBy | 110175 | 0.009 | 1.33× |
| fast-sort | 101262 | 0.010 | 1.44× |
| es-toolkit.orderBy | 100592 | 0.010 | 1.45× |
| Array.prototype.sort, decorated | 99648 | 0.010 | 1.47× |
| remeda.sortBy | 94404 | 0.010 | 1.55× |
| lodash.orderBy | 75291 | 0.013 | 1.94× |
| ramda.sortWith | 75023 | 0.013 | 1.95× |
| sort-array | 72246 | 0.014 | 2.02× |
| just-sort-by | 60400 | 0.016 | 2.42× |
| sort-on | 7759 | 0.116 | 18.84× |
| natural-orderby | 7103 | 0.125 | 20.58× |
| sort-by | 2132 | 0.362 | 68.58× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2123028 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 1917739 | 0.001 | 1.11× |
| inline comparator chain, slice().sort() | 1813971 | 0.001 | 1.17× |
| just-sort-by | 1144877 | 0.001 | 1.85× |
| thenby | 1072357 | 0.001 | 1.98× |
| fast-sort | 949027 | 0.001 | 2.24× |
| es-toolkit.orderBy | 840689 | 0.001 | 2.53× |
| Array.prototype.sort, decorated | 736193 | 0.001 | 2.88× |
| remeda.sortBy | 697995 | 0.001 | 3.04× |
| underscore.sortBy | 692631 | 0.001 | 3.07× |
| sort-array | 674627 | 0.001 | 3.15× |
| ramda.sortWith | 666571 | 0.001 | 3.18× |
| lodash.orderBy | 321459 | 0.003 | 6.60× |
| sort-on | 54539 | 0.018 | 38.93× |
| natural-orderby | 39117 | 0.025 | 54.27× |
| sort-by | 14827 | 0.063 | 143.18× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1964867 | 0.001 | 0.97× |
| inline comparator chain, toSorted() | 1961787 | 0.001 | 0.97× |
| fast-multisort | 1908293 | 0.001 | 1.00× |
| just-sort-by | 1052417 | 0.001 | 1.81× |
| thenby | 951081 | 0.001 | 2.01× |
| es-toolkit.orderBy | 848555 | 0.001 | 2.25× |
| fast-sort | 841175 | 0.001 | 2.27× |
| Array.prototype.sort, decorated | 709293 | 0.001 | 2.69× |
| sort-array | 668693 | 0.001 | 2.85× |
| underscore.sortBy | 665582 | 0.002 | 2.87× |
| remeda.sortBy | 612904 | 0.002 | 3.11× |
| ramda.sortWith | 601516 | 0.002 | 3.17× |
| lodash.orderBy | 332851 | 0.003 | 5.73× |
| sort-on | 46250 | 0.021 | 41.26× |
| natural-orderby | 37012 | 0.026 | 51.56× |
| sort-by | 14038 | 0.067 | 135.94× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 230572 | 0.004 | 0.64× |
| inline comparator chain, toSorted() | 223936 | 0.004 | 0.65× |
| fast-multisort | 146547 | 0.007 | 1.00× |
| Array.prototype.sort, decorated | 120750 | 0.008 | 1.21× |
| lodash.orderBy | 86057 | 0.011 | 1.70× |
| es-toolkit.orderBy | 81288 | 0.012 | 1.80× |
| thenby (different order) | 79074 | 0.012 | 1.85× |
| fast-sort (different order) | 70240 | 0.014 | 2.09× |
| remeda.sortBy (different order) | 69910 | 0.014 | 2.10× |
| ramda.sortWith (different order) | 59660 | 0.016 | 2.46× |
| sort-array (different order) | 49872 | 0.020 | 2.94× |
| sort-on (different order) | 6618 | 0.135 | 22.14× |
| natural-orderby (different order) | 4578 | 0.186 | 32.01× |
| sort-by (different order) | 1448 | 0.518 | 101.20× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 54082 | 0.018 | 1.00× |
| inline comparator chain, toSorted() | 18864 | 0.050 | 2.87× |
| inline comparator chain, slice().sort() | 17909 | 0.053 | 3.02× |
| underscore.sortBy | 10521 | 0.087 | 5.14× |
| Array.prototype.sort, decorated | 10031 | 0.091 | 5.39× |
| fast-sort | 7983 | 0.113 | 6.77× |
| thenby | 7681 | 0.117 | 7.04× |
| es-toolkit.orderBy | 6879 | 0.129 | 7.86× |
| lodash.orderBy | 6576 | 0.134 | 8.22× |
| remeda.sortBy | 5865 | 0.149 | 9.22× |
| ramda.sortWith | 5392 | 0.160 | 10.03× |
| sort-array | 5303 | 0.163 | 10.20× |
| just-sort-by (different order) | 2254 | 0.344 | 24.00× |
| natural-orderby (different order) | 1811 | 0.418 | 29.87× |
| sort-on (different order) | 973 | 1.129 | 55.58× |
| sort-by | 232 | 4.365 | 233.23× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13749 | 0.068 | 1.00× |
| inline comparator chain, toSorted() | 10980 | 0.084 | 1.25× |
| inline comparator chain, slice().sort() | 10851 | 0.085 | 1.27× |
| underscore.sortBy | 6133 | 0.143 | 2.24× |
| thenby | 6092 | 0.144 | 2.26× |
| Array.prototype.sort, decorated | 5673 | 0.153 | 2.42× |
| fast-sort | 5385 | 0.161 | 2.55× |
| es-toolkit.orderBy | 5208 | 0.166 | 2.64× |
| remeda.sortBy | 4864 | 0.176 | 2.83× |
| lodash.orderBy | 4029 | 0.207 | 3.41× |
| ramda.sortWith | 4014 | 0.208 | 3.43× |
| sort-array | 3385 | 0.241 | 4.06× |
| just-sort-by (different order) | 1454 | 0.516 | 9.45× |
| natural-orderby (different order) | 929 | 1.142 | 14.80× |
| sort-on (different order) | 677 | 1.767 | 20.31× |
| sort-by | 173 | 5.837 | 79.43× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 39872 | 0.024 | 1.00× |
| inline comparator chain, toSorted() | 25260 | 0.038 | 1.58× |
| inline comparator chain, slice().sort() | 23880 | 0.040 | 1.67× |
| underscore.sortBy (different order) | 18330 | 0.052 | 2.18× |
| Array.prototype.sort, decorated | 11286 | 0.082 | 3.53× |
| just-sort-by (different order) | 10690 | 0.086 | 3.73× |
| thenby (different order) | 9982 | 0.092 | 3.99× |
| fast-sort | 9433 | 0.097 | 4.23× |
| es-toolkit.orderBy | 9068 | 0.100 | 4.40× |
| lodash.orderBy | 7497 | 0.119 | 5.32× |
| remeda.sortBy (different order) | 7489 | 0.119 | 5.32× |
| sort-array | 5888 | 0.148 | 6.77× |
| ramda.sortWith (different order) | 5707 | 0.153 | 6.99× |
| natural-orderby | 2096 | 0.366 | 19.02× |
| sort-on | 889 | 1.305 | 44.86× |
| sort-by (different order) | 194 | 5.229 | 205.68× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 35178 | 0.028 | 1.00× |
| inline comparator chain, toSorted() | 18619 | 0.051 | 1.89× |
| inline comparator chain, slice().sort() | 18033 | 0.053 | 1.95× |
| underscore.sortBy | 8910 | 0.102 | 3.95× |
| just-sort-by | 7393 | 0.121 | 4.76× |
| thenby | 6907 | 0.129 | 5.09× |
| fast-sort | 6217 | 0.141 | 5.66× |
| Array.prototype.sort, decorated | 6180 | 0.142 | 5.69× |
| es-toolkit.orderBy | 5855 | 0.149 | 6.01× |
| remeda.sortBy | 5334 | 0.162 | 6.59× |
| ramda.sortWith | 4556 | 0.186 | 7.72× |
| sort-array | 4223 | 0.199 | 8.33× |
| lodash.orderBy | 3777 | 0.219 | 9.31× |
| natural-orderby | 1715 | 0.439 | 20.51× |
| sort-on | 669 | 1.770 | 52.61× |
| sort-by | 173 | 5.826 | 203.82× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13449 | 0.070 | 1.00× |
| inline comparator chain, slice().sort() | 9564 | 0.096 | 1.41× |
| inline comparator chain, toSorted() | 9492 | 0.096 | 1.42× |
| underscore.sortBy | 5710 | 0.152 | 2.36× |
| thenby | 5584 | 0.156 | 2.41× |
| Array.prototype.sort, decorated | 5174 | 0.166 | 2.60× |
| fast-sort | 5048 | 0.170 | 2.66× |
| es-toolkit.orderBy | 4903 | 0.175 | 2.74× |
| remeda.sortBy | 4599 | 0.185 | 2.92× |
| ramda.sortWith | 3928 | 0.212 | 3.42× |
| lodash.orderBy | 3717 | 0.223 | 3.62× |
| sort-array | 3442 | 0.238 | 3.91× |
| just-sort-by | 3080 | 0.262 | 4.37× |
| natural-orderby | 800 | 1.401 | 16.82× |
| sort-on | 609 | 1.891 | 22.08× |
| sort-by | 165 | 6.098 | 81.51× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 201625 | 0.005 | 0.98× |
| fast-multisort | 198253 | 0.005 | 1.00× |
| inline comparator chain, slice().sort() | 196053 | 0.005 | 1.01× |
| just-sort-by | 108153 | 0.009 | 1.83× |
| thenby | 99854 | 0.010 | 1.99× |
| fast-sort | 89215 | 0.011 | 2.22× |
| es-toolkit.orderBy | 81924 | 0.012 | 2.42× |
| Array.prototype.sort, decorated | 76363 | 0.013 | 2.60× |
| underscore.sortBy | 72966 | 0.014 | 2.72× |
| remeda.sortBy | 65833 | 0.015 | 3.01× |
| ramda.sortWith | 64371 | 0.015 | 3.08× |
| sort-array | 60542 | 0.016 | 3.27× |
| lodash.orderBy | 35036 | 0.028 | 5.66× |
| sort-on | 4711 | 0.182 | 42.08× |
| natural-orderby | 3297 | 0.247 | 60.13× |
| sort-by | 1176 | 0.664 | 168.56× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 201645 | 0.005 | 0.87× |
| inline comparator chain, toSorted() | 196181 | 0.005 | 0.90× |
| fast-multisort | 175868 | 0.006 | 1.00× |
| just-sort-by | 105901 | 0.009 | 1.66× |
| thenby | 99326 | 0.010 | 1.77× |
| fast-sort | 90379 | 0.011 | 1.95× |
| es-toolkit.orderBy | 82432 | 0.012 | 2.13× |
| Array.prototype.sort, decorated | 77417 | 0.013 | 2.27× |
| underscore.sortBy | 69816 | 0.014 | 2.52× |
| sort-array | 67287 | 0.015 | 2.61× |
| ramda.sortWith | 63316 | 0.016 | 2.78× |
| remeda.sortBy | 59185 | 0.017 | 2.97× |
| lodash.orderBy | 32734 | 0.030 | 5.37× |
| sort-on | 3752 | 0.223 | 46.87× |
| natural-orderby | 3147 | 0.257 | 55.88× |
| sort-by | 1155 | 0.678 | 152.25× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13656 | 0.069 | 1.00× |
| inline comparator chain, slice().sort() | 10291 | 0.089 | 1.33× |
| inline comparator chain, toSorted() | 10279 | 0.089 | 1.33× |
| Array.prototype.sort, decorated | 6704 | 0.132 | 2.04× |
| lodash.orderBy | 4599 | 0.185 | 2.97× |
| thenby (different order) | 3823 | 0.217 | 3.57× |
| es-toolkit.orderBy | 3534 | 0.232 | 3.86× |
| fast-sort (different order) | 3517 | 0.233 | 3.88× |
| remeda.sortBy (different order) | 3087 | 0.261 | 4.42× |
| ramda.sortWith (different order) | 2725 | 0.291 | 5.01× |
| sort-array (different order) | 2493 | 0.315 | 5.48× |
| natural-orderby (different order) | 573 | 1.856 | 23.81× |
| sort-on (different order) | 459 | 2.480 | 29.77× |
| sort-by (different order) | 106 | 9.472 | 128.48× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5174 | 0.167 | 1.00× |
| inline comparator chain, slice().sort() | 1085 | 0.749 | 4.77× |
| inline comparator chain, toSorted() | 1066 | 0.774 | 4.85× |
| underscore.sortBy | 979 | 1.037 | 5.28× |
| Array.prototype.sort, decorated | 976 | 1.048 | 5.30× |
| thenby | 908 | 1.185 | 5.70× |
| fast-sort | 872 | 1.256 | 5.93× |
| es-toolkit.orderBy | 817 | 1.365 | 6.33× |
| lodash.orderBy | 764 | 1.474 | 6.77× |
| remeda.sortBy | 750 | 1.500 | 6.90× |
| ramda.sortWith | 680 | 1.639 | 7.61× |
| sort-array | 642 | 1.716 | 8.06× |
| just-sort-by (different order) | 298 | 3.425 | 17.37× |
| natural-orderby (different order) | 227 | 4.464 | 22.81× |
| sort-on (different order) | 90 | 11.698 | 57.62× |
| sort-by | 22 | 44.667 | 230.41× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1082 | 0.751 | 1.00× |
| inline comparator chain, toSorted() | 704 | 1.592 | 1.54× |
| inline comparator chain, slice().sort() | 701 | 1.597 | 1.54× |
| underscore.sortBy | 473 | 2.165 | 2.29× |
| thenby | 449 | 2.304 | 2.41× |
| Array.prototype.sort, decorated | 436 | 2.386 | 2.48× |
| fast-sort | 431 | 2.415 | 2.51× |
| es-toolkit.orderBy | 410 | 2.538 | 2.64× |
| remeda.sortBy | 388 | 2.670 | 2.79× |
| ramda.sortWith | 337 | 2.988 | 3.21× |
| lodash.orderBy | 321 | 3.151 | 3.37× |
| sort-array | 303 | 3.362 | 3.57× |
| just-sort-by (different order) | 139 | 7.243 | 7.81× |
| natural-orderby (different order) | 66 | 15.118 | 16.32× |
| sort-on (different order) | 43 | 23.905 | 25.24× |
| sort-by | 13 | 78.714 | 85.20× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3896 | 0.214 | 1.00× |
| inline comparator chain, toSorted() | 1082 | 0.752 | 3.60× |
| inline comparator chain, slice().sort() | 1073 | 0.763 | 3.63× |
| underscore.sortBy (different order) | 1006 | 0.919 | 3.87× |
| Array.prototype.sort, decorated | 851 | 1.299 | 4.58× |
| just-sort-by (different order) | 846 | 1.308 | 4.60× |
| thenby (different order) | 830 | 1.340 | 4.69× |
| fast-sort | 802 | 1.397 | 4.86× |
| es-toolkit.orderBy | 738 | 1.524 | 5.28× |
| remeda.sortBy (different order) | 635 | 1.730 | 6.14× |
| lodash.orderBy | 627 | 1.748 | 6.21× |
| sort-array | 513 | 1.996 | 7.60× |
| ramda.sortWith (different order) | 497 | 2.024 | 7.83× |
| natural-orderby | 233 | 4.336 | 16.70× |
| sort-on | 58 | 18.034 | 67.70× |
| sort-by (different order) | 14 | 71.429 | 278.23× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3466 | 0.237 | 1.00× |
| inline comparator chain, toSorted() | 981 | 1.037 | 3.53× |
| inline comparator chain, slice().sort() | 960 | 1.080 | 3.61× |
| underscore.sortBy | 714 | 1.572 | 4.86× |
| just-sort-by | 707 | 1.585 | 4.90× |
| thenby | 665 | 1.670 | 5.21× |
| fast-sort | 623 | 1.754 | 5.56× |
| es-toolkit.orderBy | 576 | 1.849 | 6.02× |
| remeda.sortBy | 503 | 2.008 | 6.89× |
| Array.prototype.sort, decorated | 495 | 2.049 | 7.01× |
| ramda.sortWith | 438 | 2.370 | 7.91× |
| sort-array | 392 | 2.651 | 8.84× |
| lodash.orderBy | 346 | 2.941 | 10.02× |
| natural-orderby | 190 | 5.305 | 18.25× |
| sort-on | 45 | 22.435 | 76.70× |
| sort-by | 13 | 78.429 | 271.20× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1035 | 0.826 | 1.00× |
| inline comparator chain, slice().sort() | 623 | 1.754 | 1.66× |
| inline comparator chain, toSorted() | 618 | 1.764 | 1.68× |
| underscore.sortBy | 423 | 2.463 | 2.45× |
| thenby | 402 | 2.588 | 2.58× |
| es-toolkit.orderBy | 396 | 2.623 | 2.61× |
| Array.prototype.sort, decorated | 375 | 2.747 | 2.76× |
| fast-sort | 373 | 2.762 | 2.78× |
| remeda.sortBy | 367 | 2.799 | 2.82× |
| lodash.orderBy | 312 | 3.260 | 3.32× |
| ramda.sortWith | 296 | 3.445 | 3.49× |
| sort-array | 286 | 3.571 | 3.62× |
| just-sort-by | 245 | 4.115 | 4.23× |
| natural-orderby | 59 | 17.000 | 17.56× |
| sort-on | 37 | 27.833 | 28.32× |
| sort-by | 12 | 84.833 | 87.70× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 21756 | 0.044 | 0.98× |
| fast-multisort | 21367 | 0.045 | 1.00× |
| inline comparator chain, slice().sort() | 21079 | 0.045 | 1.01× |
| just-sort-by | 9706 | 0.094 | 2.20× |
| thenby | 8963 | 0.101 | 2.38× |
| fast-sort | 8406 | 0.108 | 2.54× |
| es-toolkit.orderBy | 7170 | 0.124 | 2.98× |
| underscore.sortBy | 6787 | 0.131 | 3.15× |
| remeda.sortBy | 6747 | 0.131 | 3.17× |
| Array.prototype.sort, decorated | 6700 | 0.132 | 3.19× |
| sort-array | 5804 | 0.150 | 3.68× |
| ramda.sortWith | 5445 | 0.159 | 3.92× |
| lodash.orderBy | 2875 | 0.278 | 7.43× |
| sort-on | 603 | 1.908 | 35.44× |
| natural-orderby | 395 | 2.632 | 54.07× |
| sort-by | 153 | 6.632 | 139.76× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 21012 | 0.046 | 0.96× |
| inline comparator chain, slice().sort() | 20113 | 0.047 | 1.00× |
| fast-multisort | 20103 | 0.047 | 1.00× |
| thenby | 10323 | 0.089 | 1.95× |
| just-sort-by | 10020 | 0.092 | 2.01× |
| fast-sort | 8991 | 0.101 | 2.24× |
| es-toolkit.orderBy | 7815 | 0.115 | 2.57× |
| Array.prototype.sort, decorated | 6810 | 0.130 | 2.95× |
| underscore.sortBy | 6441 | 0.137 | 3.12× |
| sort-array | 6370 | 0.138 | 3.16× |
| remeda.sortBy | 6321 | 0.139 | 3.18× |
| ramda.sortWith | 5976 | 0.146 | 3.36× |
| lodash.orderBy | 2669 | 0.297 | 7.53× |
| sort-on | 494 | 2.178 | 40.66× |
| natural-orderby | 398 | 2.615 | 50.46× |
| sort-by | 151 | 6.667 | 132.98× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1480 | 0.510 | 1.00× |
| inline comparator chain, toSorted() | 719 | 1.563 | 2.06× |
| inline comparator chain, slice().sort() | 694 | 1.613 | 2.13× |
| Array.prototype.sort, decorated | 472 | 2.169 | 3.14× |
| lodash.orderBy | 399 | 2.609 | 3.71× |
| thenby (different order) | 303 | 3.362 | 4.88× |
| es-toolkit.orderBy | 301 | 3.385 | 4.91× |
| remeda.sortBy (different order) | 263 | 3.840 | 5.62× |
| fast-sort (different order) | 241 | 4.175 | 6.13× |
| ramda.sortWith (different order) | 236 | 4.282 | 6.27× |
| sort-array (different order) | 229 | 4.425 | 6.47× |
| natural-orderby (different order) | 48 | 21.042 | 30.98× |
| sort-on (different order) | 27 | 37.429 | 54.29× |
| sort-by (different order) | 7 | 153.000 | 226.21× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 676 | 1.650 | 1.00× |
| inline comparator chain, slice().sort() | 116 | 8.655 | 5.83× |
| inline comparator chain, toSorted() | 111 | 9.036 | 6.10× |
| underscore.sortBy | 92 | 10.935 | 7.36× |
| Array.prototype.sort, decorated | 88 | 11.333 | 7.65× |
| thenby | 78 | 12.821 | 8.65× |
| fast-sort | 71 | 14.139 | 9.54× |
| es-toolkit.orderBy | 69 | 14.629 | 9.86× |
| lodash.orderBy | 62 | 16.129 | 10.88× |
| remeda.sortBy | 61 | 16.355 | 11.04× |
| sort-array | 56 | 17.893 | 12.06× |
| ramda.sortWith | 54 | 18.519 | 12.51× |
| just-sort-by (different order) | 28 | 35.400 | 23.88× |
| natural-orderby (different order) | 22 | 46.182 | 31.17× |
| sort-on (different order) | 8 | 124.000 | 83.78× |
| sort-by | 2 | 445.000 | 300.82× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 85 | 11.814 | 1.00× |
| inline comparator chain, toSorted() | 39 | 25.600 | 2.18× |
| inline comparator chain, slice().sort() | 38 | 26.250 | 2.23× |
| underscore.sortBy | 31 | 32.563 | 2.77× |
| fast-sort | 27 | 36.786 | 3.12× |
| es-toolkit.orderBy | 26 | 37.929 | 3.22× |
| thenby | 26 | 39.615 | 3.31× |
| Array.prototype.sort, decorated | 25 | 40.385 | 3.42× |
| remeda.sortBy | 25 | 40.538 | 3.44× |
| ramda.sortWith | 21 | 48.545 | 4.11× |
| sort-array | 21 | 48.727 | 4.14× |
| lodash.orderBy | 18 | 56.111 | 4.77× |
| just-sort-by (different order) | 9 | 106.000 | 9.00× |
| natural-orderby (different order) | 3 | 311.500 | 26.48× |
| sort-on (different order) | 3 | 354.000 | 30.07× |
| sort-by | 1 | 1052.000 | 89.46× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 491 | 2.087 | 1.00× |
| inline comparator chain, slice().sort() | 87 | 11.455 | 5.61× |
| inline comparator chain, toSorted() | 86 | 11.674 | 5.72× |
| underscore.sortBy (different order) | 74 | 13.622 | 6.66× |
| just-sort-by (different order) | 59 | 17.067 | 8.36× |
| fast-sort | 56 | 17.759 | 8.70× |
| thenby (different order) | 55 | 18.143 | 8.86× |
| es-toolkit.orderBy | 53 | 18.926 | 9.27× |
| remeda.sortBy (different order) | 47 | 21.167 | 10.38× |
| Array.prototype.sort, decorated | 46 | 22.087 | 10.70× |
| ramda.sortWith (different order) | 39 | 25.550 | 12.54× |
| lodash.orderBy | 38 | 26.200 | 12.79× |
| sort-array | 35 | 28.500 | 13.96× |
| natural-orderby | 15 | 69.250 | 33.86× |
| sort-on | 4 | 233.667 | 114.64× |
| sort-by (different order) | 1 | 987.000 | 484.59× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 439 | 2.370 | 1.00× |
| inline comparator chain, slice().sort() | 66 | 15.273 | 6.70× |
| inline comparator chain, toSorted() | 65 | 15.364 | 6.73× |
| underscore.sortBy | 48 | 20.958 | 9.19× |
| just-sort-by | 45 | 22.087 | 9.69× |
| thenby | 42 | 24.143 | 10.57× |
| fast-sort | 41 | 24.381 | 10.69× |
| es-toolkit.orderBy | 39 | 25.450 | 11.16× |
| remeda.sortBy | 37 | 27.211 | 11.93× |
| Array.prototype.sort, decorated | 36 | 27.778 | 12.18× |
| ramda.sortWith | 31 | 32.438 | 14.22× |
| sort-array | 31 | 32.750 | 14.36× |
| lodash.orderBy | 23 | 43.083 | 18.86× |
| natural-orderby | 13 | 80.143 | 35.05× |
| sort-on | 3 | 301.500 | 132.29× |
| sort-by | 1 | 1015.000 | 445.37× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 71 | 14.250 | 1.00× |
| inline comparator chain, toSorted() | 36 | 27.778 | 1.97× |
| inline comparator chain, slice().sort() | 35 | 28.278 | 2.01× |
| fast-sort | 26 | 38.000 | 2.70× |
| thenby | 26 | 38.071 | 2.70× |
| underscore.sortBy | 26 | 38.615 | 2.72× |
| es-toolkit.orderBy | 25 | 39.923 | 2.83× |
| remeda.sortBy | 24 | 41.385 | 2.94× |
| Array.prototype.sort, decorated | 23 | 44.250 | 3.11× |
| ramda.sortWith | 22 | 45.333 | 3.22× |
| sort-array | 21 | 47.818 | 3.39× |
| lodash.orderBy | 17 | 57.333 | 4.07× |
| just-sort-by | 15 | 66.375 | 4.67× |
| natural-orderby (different order) | 3 | 298.000 | 21.17× |
| sort-on | 3 | 360.000 | 25.56× |
| sort-by | 1 | 1055.000 | 74.95× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1758 | 0.430 | 1.00× |
| inline comparator chain, slice().sort() | 1163 | 0.669 | 1.51× |
| inline comparator chain, toSorted() | 1021 | 0.865 | 1.72× |
| just-sort-by | 985 | 1.031 | 1.79× |
| thenby | 982 | 1.035 | 1.79× |
| fast-sort | 927 | 1.147 | 1.90× |
| es-toolkit.orderBy | 863 | 1.275 | 2.04× |
| remeda.sortBy | 811 | 1.377 | 2.17× |
| underscore.sortBy | 759 | 1.488 | 2.32× |
| ramda.sortWith | 706 | 1.587 | 2.49× |
| sort-array | 688 | 1.627 | 2.56× |
| Array.prototype.sort, decorated | 600 | 1.805 | 2.93× |
| lodash.orderBy | 316 | 3.212 | 5.56× |
| sort-on | 56 | 18.321 | 31.42× |
| natural-orderby | 37 | 27.053 | 47.46× |
| sort-by | 15 | 65.250 | 114.32× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1493 | 0.503 | 1.00× |
| inline comparator chain, slice().sort() | 1169 | 0.665 | 1.28× |
| inline comparator chain, toSorted() | 1026 | 0.852 | 1.46× |
| thenby | 939 | 1.121 | 1.59× |
| just-sort-by | 937 | 1.126 | 1.59× |
| fast-sort | 880 | 1.241 | 1.70× |
| es-toolkit.orderBy | 841 | 1.322 | 1.78× |
| sort-array | 741 | 1.520 | 2.01× |
| underscore.sortBy | 725 | 1.556 | 2.06× |
| remeda.sortBy | 696 | 1.608 | 2.14× |
| ramda.sortWith | 658 | 1.684 | 2.27× |
| Array.prototype.sort, decorated | 604 | 1.802 | 2.47× |
| lodash.orderBy | 316 | 3.212 | 4.73× |
| sort-on | 48 | 21.208 | 31.00× |
| natural-orderby | 37 | 26.947 | 40.17× |
| sort-by | 15 | 67.625 | 100.57× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 183 | 5.527 | 1.00× |
| inline comparator chain, toSorted() | 46 | 21.870 | 3.99× |
| inline comparator chain, slice().sort() | 44 | 22.609 | 4.11× |
| Array.prototype.sort, decorated | 26 | 38.643 | 7.01× |
| lodash.orderBy | 25 | 39.769 | 7.21× |
| thenby (different order) | 24 | 41.462 | 7.57× |
| es-toolkit.orderBy | 23 | 43.917 | 8.02× |
| remeda.sortBy (different order) | 21 | 48.727 | 8.89× |
| fast-sort (different order) | 19 | 54.000 | 9.86× |
| ramda.sortWith (different order) | 18 | 54.300 | 9.91× |
| sort-array (different order) | 18 | 55.889 | 10.20× |
| natural-orderby (different order) | 4 | 280.500 | 50.90× |
| sort-on (different order) | 2 | 508.000 | 92.77× |
| sort-by (different order) | 1 | 1968.000 | 359.41× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 53 | 18.889 | 1.00× |
| inline comparator chain, slice().sort() | 12 | 85.667 | 4.54× |
| inline comparator chain, toSorted() | 12 | 86.667 | 4.60× |
| underscore.sortBy | 8 | 119.000 | 6.31× |
| Array.prototype.sort, decorated | 8 | 121.800 | 6.46× |
| thenby | 8 | 127.250 | 6.75× |
| fast-sort | 8 | 131.000 | 6.95× |
| es-toolkit.orderBy | 7 | 135.000 | 7.16× |
| remeda.sortBy | 7 | 153.250 | 8.13× |
| lodash.orderBy | 6 | 160.000 | 8.48× |
| sort-array | 6 | 169.333 | 8.98× |
| ramda.sortWith | 6 | 169.667 | 9.00× |
| just-sort-by (different order) | 3 | 331.500 | 17.58× |
| natural-orderby (different order) | 2 | 502.000 | 26.63× |
| sort-on (different order) | 1 | 1239.000 | 65.72× |
| sort-by | 0 | 4672.000 | 247.81× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 395.500 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 666.000 | 1.69× |
| inline comparator chain, toSorted() | 1 | 685.000 | 1.73× |
| underscore.sortBy | 1 | 895.000 | 2.27× |
| thenby | 1 | 910.000 | 2.30× |
| fast-sort | 1 | 1096.000 | 2.77× |
| remeda.sortBy | 1 | 1110.000 | 2.81× |
| es-toolkit.orderBy | 1 | 1216.000 | 3.08× |
| ramda.sortWith | 1 | 1265.000 | 3.20× |
| Array.prototype.sort, decorated | 1 | 1309.000 | 3.31× |
| sort-array | 1 | 1313.000 | 3.32× |
| lodash.orderBy | 1 | 1831.000 | 4.63× |
| just-sort-by (different order) | 0 | 2565.000 | 6.49× |
| sort-on (different order) | 0 | 5435.000 | 13.76× |
| natural-orderby (different order) | 0 | 6352.000 | 16.08× |
| sort-by | 0 | 14612.000 | 36.98× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 31 | 35.857 | 1.00× |
| inline comparator chain, toSorted() | 5 | 187.000 | 5.80× |
| inline comparator chain, slice().sort() | 5 | 189.667 | 5.87× |
| underscore.sortBy (different order) | 5 | 215.000 | 6.66× |
| just-sort-by (different order) | 3 | 299.500 | 9.26× |
| fast-sort | 3 | 302.000 | 9.37× |
| thenby (different order) | 3 | 307.500 | 9.54× |
| es-toolkit.orderBy | 3 | 348.500 | 10.81× |
| remeda.sortBy (different order) | 3 | 377.000 | 11.69× |
| sort-array | 2 | 432.500 | 13.38× |
| ramda.sortWith (different order) | 2 | 439.000 | 13.61× |
| Array.prototype.sort, decorated | 2 | 460.500 | 14.28× |
| lodash.orderBy | 1 | 681.000 | 21.12× |
| natural-orderby | 1 | 1408.000 | 43.66× |
| sort-on | 0 | 3323.000 | 103.05× |
| sort-by (different order) | 0 | 11925.000 | 369.81× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 26 | 42.833 | 1.00× |
| inline comparator chain, slice().sort() | 4 | 253.500 | 6.47× |
| inline comparator chain, toSorted() | 4 | 255.000 | 6.51× |
| underscore.sortBy | 3 | 327.500 | 8.36× |
| just-sort-by | 3 | 333.000 | 8.50× |
| fast-sort | 2 | 404.500 | 10.33× |
| thenby | 2 | 455.500 | 11.63× |
| es-toolkit.orderBy | 2 | 461.000 | 11.74× |
| remeda.sortBy | 2 | 531.000 | 13.56× |
| Array.prototype.sort, decorated | 2 | 565.000 | 14.43× |
| ramda.sortWith | 2 | 584.000 | 14.92× |
| sort-array | 2 | 608.000 | 15.53× |
| lodash.orderBy | 1 | 1231.000 | 31.44× |
| natural-orderby | 1 | 1563.000 | 39.92× |
| sort-on | 0 | 4488.000 | 114.62× |
| sort-by | 0 | 13207.000 | 337.30× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3 | 385.000 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 618.000 | 1.61× |
| inline comparator chain, toSorted() | 2 | 624.000 | 1.62× |
| underscore.sortBy | 1 | 858.000 | 2.23× |
| remeda.sortBy | 1 | 1002.000 | 2.60× |
| es-toolkit.orderBy | 1 | 1041.000 | 2.71× |
| thenby | 1 | 1055.000 | 2.74× |
| fast-sort | 1 | 1063.000 | 2.76× |
| ramda.sortWith | 1 | 1081.000 | 2.81× |
| Array.prototype.sort, decorated | 1 | 1187.000 | 3.08× |
| sort-array | 1 | 1273.000 | 3.31× |
| just-sort-by | 1 | 1469.000 | 3.82× |
| lodash.orderBy | 1 | 1525.000 | 3.96× |
| sort-on | 0 | 5745.000 | 14.93× |
| natural-orderby (different order) | 0 | 6658.000 | 17.30× |
| sort-by | 0 | 14554.000 | 37.82× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 191 | 5.376 | 1.00× |
| inline comparator chain, slice().sort() | 126 | 7.968 | 1.51× |
| inline comparator chain, toSorted() | 104 | 9.615 | 1.83× |
| just-sort-by | 85 | 11.744 | 2.24× |
| thenby | 80 | 12.650 | 2.40× |
| fast-sort | 77 | 13.026 | 2.48× |
| es-toolkit.orderBy | 71 | 14.111 | 2.69× |
| remeda.sortBy | 62 | 16.063 | 3.06× |
| sort-array | 57 | 17.690 | 3.37× |
| ramda.sortWith | 56 | 18.000 | 3.44× |
| underscore.sortBy | 53 | 19.731 | 3.64× |
| Array.prototype.sort, decorated | 49 | 20.440 | 3.90× |
| lodash.orderBy | 26 | 38.846 | 7.35× |
| sort-on | 5 | 204.333 | 39.04× |
| natural-orderby | 3 | 303.000 | 57.85× |
| sort-by | 1 | 672.000 | 128.44× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 164 | 6.146 | 1.00× |
| inline comparator chain, slice().sort() | 116 | 8.672 | 1.42× |
| inline comparator chain, toSorted() | 100 | 10.060 | 1.65× |
| just-sort-by | 89 | 11.267 | 1.85× |
| thenby | 79 | 12.700 | 2.07× |
| fast-sort | 74 | 13.568 | 2.23× |
| es-toolkit.orderBy | 72 | 13.865 | 2.27× |
| sort-array | 59 | 19.385 | 2.77× |
| underscore.sortBy | 57 | 17.655 | 2.90× |
| remeda.sortBy | 57 | 17.759 | 2.91× |
| ramda.sortWith | 55 | 18.179 | 2.99× |
| Array.prototype.sort, decorated | 50 | 19.923 | 3.26× |
| lodash.orderBy | 25 | 40.923 | 6.55× |
| sort-on | 4 | 232.667 | 38.27× |
| natural-orderby | 3 | 303.000 | 49.81× |
| sort-by | 1 | 670.000 | 110.21× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12 | 93.500 | 1.00× |
| inline comparator chain, toSorted() | 2 | 428.500 | 4.96× |
| inline comparator chain, slice().sort() | 2 | 431.500 | 4.99× |
| Array.prototype.sort, decorated | 2 | 642.000 | 7.43× |
| es-toolkit.orderBy | 1 | 847.000 | 9.80× |
| thenby (different order) | 1 | 859.000 | 9.94× |
| remeda.sortBy (different order) | 1 | 936.000 | 10.83× |
| ramda.sortWith (different order) | 1 | 1001.000 | 11.58× |
| fast-sort (different order) | 1 | 1032.000 | 11.94× |
| sort-array (different order) | 1 | 1045.000 | 12.09× |
| lodash.orderBy | 1 | 1131.000 | 13.08× |
| natural-orderby (different order) | 0 | 3745.000 | 43.32× |
| sort-on (different order) | 0 | 6847.000 | 79.19× |
| sort-by (different order) | 0 | 24602.000 | 284.55× |

</details>

#### Firefox 158.0

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| inline comparator chain, toSorted() | 0.40× | 1.30× | 9.89× | 56 | 0 |
| inline comparator chain, slice().sort() | 0.36× | 1.31× | 9.77× | 56 | 0 |
| fast-sort | 0.76× | 2.34× | 19.80× | 56 | 11 |
| thenby | 0.79× | 2.36× | 15.94× | 56 | 12 |
| underscore.sortBy | 0.86× | 2.38× | 10.49× | 49 | 6 |
| Array.prototype.sort, decorated | 0.66× | 2.60× | 17.62× | 56 | 0 |
| es-toolkit.orderBy | 0.82× | 2.64× | 19.86× | 56 | 0 |
| remeda.sortBy | 0.97× | 2.73× | 15.59× | 56 | 12 |
| sort-array | 0.88× | 3.18× | 23.47× | 56 | 6 |
| ramda.sortWith | 1.10× | 3.35× | 26.24× | 56 | 12 |
| just-sort-by | 0.68× | 3.72× | 53.55× | 49 | 17 |
| lodash.orderBy | 1.30× | 5.05× | 25.98× | 56 | 0 |
| natural-orderby | 5.78× | 20.81× | 63.28× | 56 | 19 |
| sort-on | 1.18× | 21.66× | 9128.64× | 56 | 17 |
| sort-by | 1.45× | 234.76× | 12322.07× | 56 | 12 |

<details>
<summary>Per case</summary>

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 21010850 | 0.000 | 1.00× |
| fast-multisort | 20936970 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 20016080 | 0.000 | 1.05× |
| inline comparator chain, slice().sort() | 16392454 | 0.000 | 1.28× |
| sort-on | 15952736 | 0.000 | 1.31× |
| es-toolkit.orderBy | 15511656 | 0.000 | 1.35× |
| Array.prototype.sort, decorated | 13412208 | 0.000 | 1.56× |
| sort-by | 13075798 | 0.000 | 1.60× |
| thenby | 12424528 | 0.000 | 1.69× |
| fast-sort | 10250440 | 0.000 | 2.04× |
| ramda.sortWith | 9911058 | 0.000 | 2.11× |
| remeda.sortBy | 9784112 | 0.000 | 2.14× |
| sort-array | 9300726 | 0.000 | 2.25× |
| underscore.sortBy | 8796046 | 0.000 | 2.38× |
| lodash.orderBy | 6669152 | 0.000 | 3.14× |
| natural-orderby | 3359578 | 0.000 | 6.23× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 20894632 | 0.000 | 0.91× |
| inline comparator chain, toSorted() | 20583186 | 0.000 | 0.93× |
| fast-multisort | 19075828 | 0.000 | 1.00× |
| es-toolkit.orderBy | 16594280 | 0.000 | 1.15× |
| inline comparator chain, slice().sort() | 16249354 | 0.000 | 1.17× |
| sort-on | 16161300 | 0.000 | 1.18× |
| Array.prototype.sort, decorated | 13527988 | 0.000 | 1.41× |
| thenby | 13123500 | 0.000 | 1.45× |
| sort-by | 11680134 | 0.000 | 1.63× |
| ramda.sortWith | 10604194 | 0.000 | 1.80× |
| fast-sort | 10366466 | 0.000 | 1.84× |
| remeda.sortBy | 9641164 | 0.000 | 1.98× |
| sort-array | 9352310 | 0.000 | 2.04× |
| underscore.sortBy | 8792414 | 0.000 | 2.17× |
| lodash.orderBy | 6029856 | 0.000 | 3.16× |
| natural-orderby | 1524511 | 0.001 | 12.51× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 21868466 | 0.000 | 0.94× |
| inline comparator chain, toSorted() | 21117338 | 0.000 | 0.97× |
| fast-multisort | 20566430 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 16817728 | 0.000 | 1.22× |
| sort-on | 16577672 | 0.000 | 1.24× |
| es-toolkit.orderBy | 16495780 | 0.000 | 1.25× |
| Array.prototype.sort, decorated | 14636942 | 0.000 | 1.41× |
| thenby | 12391272 | 0.000 | 1.66× |
| sort-by | 12087182 | 0.000 | 1.70× |
| fast-sort | 10932870 | 0.000 | 1.88× |
| remeda.sortBy | 10086228 | 0.000 | 2.04× |
| ramda.sortWith | 9651732 | 0.000 | 2.13× |
| sort-array | 9279648 | 0.000 | 2.22× |
| underscore.sortBy | 8636040 | 0.000 | 2.38× |
| lodash.orderBy | 6468882 | 0.000 | 3.18× |
| natural-orderby | 2351498 | 0.000 | 8.75× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 21155634 | 0.000 | 0.97× |
| fast-multisort | 20563068 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 20463392 | 0.000 | 1.00× |
| sort-on | 16484970 | 0.000 | 1.25× |
| inline comparator chain, slice().sort() | 15718634 | 0.000 | 1.31× |
| es-toolkit.orderBy | 14690824 | 0.000 | 1.40× |
| sort-by | 13315324 | 0.000 | 1.54× |
| Array.prototype.sort, decorated | 13024120 | 0.000 | 1.58× |
| thenby | 12321490 | 0.000 | 1.67× |
| fast-sort | 10875660 | 0.000 | 1.89× |
| ramda.sortWith | 10373058 | 0.000 | 1.98× |
| sort-array | 9517366 | 0.000 | 2.16× |
| underscore.sortBy | 9016542 | 0.000 | 2.28× |
| remeda.sortBy | 8729902 | 0.000 | 2.36× |
| lodash.orderBy | 5793710 | 0.000 | 3.55× |
| natural-orderby | 2232542 | 0.000 | 9.21× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 21622124 | 0.000 | 0.93× |
| inline comparator chain, toSorted() | 21344336 | 0.000 | 0.94× |
| fast-multisort | 20166670 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 17041936 | 0.000 | 1.18× |
| sort-on | 16828984 | 0.000 | 1.20× |
| es-toolkit.orderBy | 15469488 | 0.000 | 1.30× |
| Array.prototype.sort, decorated | 12944768 | 0.000 | 1.56× |
| thenby | 12917282 | 0.000 | 1.56× |
| sort-by | 12211518 | 0.000 | 1.65× |
| fast-sort | 10283308 | 0.000 | 1.96× |
| ramda.sortWith | 10002256 | 0.000 | 2.02× |
| underscore.sortBy | 9098454 | 0.000 | 2.22× |
| remeda.sortBy | 8967164 | 0.000 | 2.25× |
| sort-array | 8751726 | 0.000 | 2.30× |
| lodash.orderBy | 6526406 | 0.000 | 3.09× |
| natural-orderby | 585006 | 0.002 | 34.47× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 23336402 | 0.000 | 0.95× |
| fast-multisort | 22260852 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 21180730 | 0.000 | 1.05× |
| inline comparator chain, slice().sort() | 17629684 | 0.000 | 1.26× |
| sort-on | 16915574 | 0.000 | 1.32× |
| es-toolkit.orderBy | 16411824 | 0.000 | 1.36× |
| thenby | 13094128 | 0.000 | 1.70× |
| Array.prototype.sort, decorated | 12248908 | 0.000 | 1.82× |
| fast-sort | 12152680 | 0.000 | 1.83× |
| sort-by | 11830624 | 0.000 | 1.88× |
| remeda.sortBy | 10043574 | 0.000 | 2.22× |
| ramda.sortWith | 9372812 | 0.000 | 2.38× |
| sort-array | 9274864 | 0.000 | 2.40× |
| underscore.sortBy | 8647854 | 0.000 | 2.57× |
| lodash.orderBy | 6347810 | 0.000 | 3.51× |
| natural-orderby | 2162344 | 0.000 | 10.29× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 21720282 | 0.000 | 0.90× |
| just-sort-by | 21423006 | 0.000 | 0.91× |
| fast-multisort | 19480000 | 0.000 | 1.00× |
| sort-on | 15953144 | 0.000 | 1.22× |
| inline comparator chain, slice().sort() | 15565144 | 0.000 | 1.25× |
| es-toolkit.orderBy | 13946448 | 0.000 | 1.40× |
| sort-by | 13393922 | 0.000 | 1.45× |
| Array.prototype.sort, decorated | 13365872 | 0.000 | 1.46× |
| thenby | 11971812 | 0.000 | 1.63× |
| fast-sort | 10260586 | 0.000 | 1.90× |
| sort-array | 9780128 | 0.000 | 1.99× |
| ramda.sortWith | 9446266 | 0.000 | 2.06× |
| underscore.sortBy | 9429362 | 0.000 | 2.07× |
| remeda.sortBy | 8382602 | 0.000 | 2.32× |
| lodash.orderBy | 6206982 | 0.000 | 3.14× |
| natural-orderby | 2469920 | 0.000 | 7.89× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 20713128 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 20408186 | 0.000 | 1.01× |
| sort-on | 17601908 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 16498846 | 0.000 | 1.26× |
| es-toolkit.orderBy | 16030970 | 0.000 | 1.29× |
| sort-by | 12325012 | 0.000 | 1.68× |
| Array.prototype.sort, decorated | 12215978 | 0.000 | 1.70× |
| fast-sort | 10346878 | 0.000 | 2.00× |
| sort-array | 9462128 | 0.000 | 2.19× |
| thenby | 8005872 | 0.000 | 2.59× |
| ramda.sortWith | 6627150 | 0.000 | 3.13× |
| remeda.sortBy | 5164216 | 0.000 | 4.01× |
| lodash.orderBy | 4890220 | 0.000 | 4.24× |
| natural-orderby | 468834 | 0.002 | 44.18× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 3189276 | 0.000 | 0.66× |
| inline comparator chain, slice().sort() | 3180616 | 0.000 | 0.67× |
| thenby | 2396382 | 0.000 | 0.88× |
| fast-sort | 2298398 | 0.000 | 0.92× |
| Array.prototype.sort, decorated | 2297610 | 0.000 | 0.92× |
| remeda.sortBy | 2129670 | 0.000 | 0.99× |
| fast-multisort | 2118156 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2003570 | 0.000 | 1.06× |
| underscore.sortBy | 1841301 | 0.001 | 1.15× |
| sort-array | 1656983 | 0.001 | 1.28× |
| ramda.sortWith | 1516339 | 0.001 | 1.40× |
| lodash.orderBy | 1258173 | 0.001 | 1.68× |
| just-sort-by (different order) | 1157285 | 0.001 | 1.83× |
| natural-orderby (different order) | 306223 | 0.003 | 6.92× |
| sort-on (different order) | 226970 | 0.004 | 9.33× |
| sort-by | 14202 | 0.067 | 149.14× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 3092328 | 0.000 | 0.58× |
| inline comparator chain, slice().sort() | 2959964 | 0.000 | 0.61× |
| Array.prototype.sort, decorated | 2120054 | 0.000 | 0.84× |
| thenby | 2097010 | 0.000 | 0.85× |
| fast-sort | 1907965 | 0.001 | 0.94× |
| sort-array | 1814509 | 0.001 | 0.99× |
| fast-multisort | 1791295 | 0.001 | 1.00× |
| underscore.sortBy | 1778089 | 0.001 | 1.01× |
| es-toolkit.orderBy | 1749745 | 0.001 | 1.02× |
| remeda.sortBy | 1713605 | 0.001 | 1.05× |
| ramda.sortWith | 1368465 | 0.001 | 1.31× |
| lodash.orderBy | 1204337 | 0.001 | 1.49× |
| just-sort-by | 939945 | 0.001 | 1.91× |
| sort-on | 233986 | 0.004 | 7.66× |
| natural-orderby | 134999 | 0.007 | 13.27× |
| sort-by | 10939 | 0.087 | 163.76× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4415432 | 0.000 | 0.39× |
| inline comparator chain, toSorted() | 4012256 | 0.000 | 0.43× |
| Array.prototype.sort, decorated | 2630820 | 0.000 | 0.66× |
| fast-sort | 2289970 | 0.000 | 0.76× |
| just-sort-by (different order) | 2127350 | 0.000 | 0.82× |
| es-toolkit.orderBy | 2104594 | 0.000 | 0.82× |
| thenby (different order) | 1858697 | 0.001 | 0.93× |
| underscore.sortBy (different order) | 1849419 | 0.001 | 0.94× |
| sort-array | 1807049 | 0.001 | 0.96× |
| fast-multisort | 1735179 | 0.001 | 1.00× |
| remeda.sortBy (different order) | 1634951 | 0.001 | 1.06× |
| lodash.orderBy | 1245581 | 0.001 | 1.39× |
| ramda.sortWith (different order) | 1191363 | 0.001 | 1.46× |
| sort-on | 302435 | 0.003 | 5.74× |
| natural-orderby | 285133 | 0.003 | 6.09× |
| sort-by (different order) | 19004 | 0.050 | 91.31× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4560204 | 0.000 | 0.40× |
| inline comparator chain, toSorted() | 4354112 | 0.000 | 0.42× |
| just-sort-by | 2400346 | 0.000 | 0.76× |
| Array.prototype.sort, decorated | 2362170 | 0.000 | 0.77× |
| fast-sort | 2298822 | 0.000 | 0.80× |
| thenby | 2153204 | 0.000 | 0.85× |
| sort-array | 2069506 | 0.000 | 0.88× |
| underscore.sortBy | 2011938 | 0.000 | 0.91× |
| es-toolkit.orderBy | 2001780 | 0.000 | 0.91× |
| remeda.sortBy | 1840879 | 0.001 | 0.99× |
| fast-multisort | 1827749 | 0.001 | 1.00× |
| ramda.sortWith | 1453763 | 0.001 | 1.26× |
| lodash.orderBy | 1403903 | 0.001 | 1.30× |
| sort-on | 225404 | 0.004 | 8.11× |
| natural-orderby | 213557 | 0.005 | 8.56× |
| sort-by | 23790 | 0.040 | 76.83× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 2574246 | 0.000 | 0.50× |
| inline comparator chain, toSorted() | 2355158 | 0.000 | 0.55× |
| thenby | 1627883 | 0.001 | 0.79× |
| Array.prototype.sort, decorated | 1612439 | 0.001 | 0.80× |
| fast-sort | 1462655 | 0.001 | 0.88× |
| es-toolkit.orderBy | 1387331 | 0.001 | 0.93× |
| remeda.sortBy | 1316067 | 0.001 | 0.98× |
| underscore.sortBy | 1302585 | 0.001 | 0.99× |
| fast-multisort | 1284349 | 0.001 | 1.00× |
| sort-array | 1225345 | 0.001 | 1.05× |
| ramda.sortWith | 1169505 | 0.001 | 1.10× |
| just-sort-by | 840447 | 0.001 | 1.53× |
| lodash.orderBy | 763595 | 0.001 | 1.68× |
| sort-on | 174676 | 0.006 | 7.35× |
| natural-orderby | 60308 | 0.016 | 21.30× |
| sort-by | 18868 | 0.051 | 68.07× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 6236000 | 0.000 | 0.48× |
| inline comparator chain, toSorted() | 6012594 | 0.000 | 0.50× |
| just-sort-by | 4370728 | 0.000 | 0.68× |
| thenby | 3747238 | 0.000 | 0.80× |
| fast-sort | 3556312 | 0.000 | 0.84× |
| Array.prototype.sort, decorated | 3496576 | 0.000 | 0.85× |
| es-toolkit.orderBy | 3409898 | 0.000 | 0.87× |
| sort-array | 3173952 | 0.000 | 0.94× |
| fast-multisort | 2981634 | 0.000 | 1.00× |
| remeda.sortBy | 2677910 | 0.000 | 1.11× |
| ramda.sortWith | 2671084 | 0.000 | 1.12× |
| underscore.sortBy | 2543392 | 0.000 | 1.17× |
| lodash.orderBy | 1510795 | 0.001 | 1.97× |
| sort-on | 543750 | 0.002 | 5.48× |
| natural-orderby | 340529 | 0.003 | 8.76× |
| sort-by | 56367 | 0.017 | 52.90× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4852160 | 0.000 | 0.36× |
| inline comparator chain, toSorted() | 4474236 | 0.000 | 0.40× |
| just-sort-by | 2525144 | 0.000 | 0.70× |
| Array.prototype.sort, decorated | 2141398 | 0.000 | 0.83× |
| thenby | 2124684 | 0.000 | 0.83× |
| underscore.sortBy | 2068968 | 0.000 | 0.86× |
| fast-sort | 2049158 | 0.000 | 0.86× |
| es-toolkit.orderBy | 2034978 | 0.000 | 0.87× |
| remeda.sortBy | 1826803 | 0.001 | 0.97× |
| fast-multisort | 1769425 | 0.001 | 1.00× |
| ramda.sortWith | 1497055 | 0.001 | 1.18× |
| sort-array | 1467337 | 0.001 | 1.21× |
| lodash.orderBy | 1258041 | 0.001 | 1.41× |
| natural-orderby | 306229 | 0.003 | 5.78× |
| sort-on | 214533 | 0.005 | 8.25× |
| sort-by | 23446 | 0.041 | 75.47× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2935612 | 0.000 | 0.41× |
| inline comparator chain, slice().sort() | 2860922 | 0.000 | 0.42× |
| Array.prototype.sort, decorated | 1454469 | 0.001 | 0.83× |
| es-toolkit.orderBy | 1380241 | 0.001 | 0.87× |
| thenby (different order) | 1217237 | 0.001 | 0.99× |
| fast-multisort | 1204771 | 0.001 | 1.00× |
| sort-array (different order) | 1201341 | 0.001 | 1.00× |
| remeda.sortBy (different order) | 1180435 | 0.001 | 1.02× |
| fast-sort (different order) | 1056075 | 0.001 | 1.14× |
| ramda.sortWith (different order) | 997401 | 0.001 | 1.21× |
| lodash.orderBy | 682745 | 0.001 | 1.76× |
| sort-on (different order) | 186001 | 0.005 | 6.48× |
| natural-orderby (different order) | 44244 | 0.022 | 27.23× |
| sort-by (different order) | 20141 | 0.047 | 59.82× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 399550 | 0.002 | 1.00× |
| inline comparator chain, slice().sort() | 200373 | 0.005 | 1.99× |
| inline comparator chain, toSorted() | 179365 | 0.006 | 2.23× |
| underscore.sortBy | 135541 | 0.007 | 2.95× |
| thenby | 92231 | 0.011 | 4.33× |
| fast-sort | 82538 | 0.012 | 4.84× |
| Array.prototype.sort, decorated | 79548 | 0.012 | 5.02× |
| remeda.sortBy | 74893 | 0.013 | 5.33× |
| sort-array | 69904 | 0.014 | 5.72× |
| es-toolkit.orderBy | 65099 | 0.015 | 6.14× |
| ramda.sortWith | 56056 | 0.018 | 7.13× |
| just-sort-by (different order) | 49128 | 0.020 | 8.13× |
| lodash.orderBy | 46750 | 0.021 | 8.55× |
| natural-orderby (different order) | 20879 | 0.046 | 19.14× |
| sort-on (different order) | 10575 | 0.087 | 37.78× |
| sort-by | 952 | 0.988 | 419.73× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 154308 | 0.006 | 0.93× |
| inline comparator chain, toSorted() | 150401 | 0.007 | 0.96× |
| fast-multisort | 144023 | 0.007 | 1.00× |
| underscore.sortBy | 94109 | 0.011 | 1.53× |
| thenby | 72660 | 0.014 | 1.98× |
| fast-sort | 66843 | 0.015 | 2.15× |
| remeda.sortBy | 65221 | 0.015 | 2.21× |
| Array.prototype.sort, decorated | 64819 | 0.015 | 2.22× |
| es-toolkit.orderBy | 60122 | 0.016 | 2.40× |
| sort-array | 47562 | 0.021 | 3.03× |
| ramda.sortWith | 47195 | 0.021 | 3.05× |
| lodash.orderBy | 37548 | 0.026 | 3.84× |
| just-sort-by (different order) | 30454 | 0.032 | 4.73× |
| natural-orderby (different order) | 7505 | 0.119 | 19.19× |
| sort-on (different order) | 6650 | 0.133 | 21.66× |
| sort-by | 909 | 1.147 | 158.39× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 233478 | 0.004 | 0.97× |
| fast-multisort | 227334 | 0.004 | 1.00× |
| inline comparator chain, toSorted() | 220025 | 0.005 | 1.03× |
| underscore.sortBy (different order) | 141295 | 0.007 | 1.61× |
| fast-sort (different order) | 103514 | 0.010 | 2.20× |
| just-sort-by (different order) | 101266 | 0.010 | 2.24× |
| Array.prototype.sort, decorated | 98574 | 0.010 | 2.31× |
| thenby (different order) | 93063 | 0.011 | 2.44× |
| remeda.sortBy (different order) | 83216 | 0.012 | 2.73× |
| es-toolkit.orderBy | 80626 | 0.012 | 2.82× |
| sort-array | 71520 | 0.014 | 3.18× |
| lodash.orderBy | 64499 | 0.015 | 3.52× |
| ramda.sortWith (different order) | 54544 | 0.018 | 4.17× |
| natural-orderby | 23223 | 0.041 | 9.79× |
| sort-on | 10585 | 0.087 | 21.48× |
| sort-by (different order) | 930 | 1.070 | 244.53× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 268942 | 0.004 | 0.85× |
| inline comparator chain, toSorted() | 242852 | 0.004 | 0.94× |
| fast-multisort | 227708 | 0.004 | 1.00× |
| underscore.sortBy | 134535 | 0.007 | 1.69× |
| just-sort-by | 103040 | 0.010 | 2.21× |
| thenby | 95208 | 0.010 | 2.39× |
| fast-sort | 89769 | 0.011 | 2.54× |
| Array.prototype.sort, decorated | 89095 | 0.011 | 2.56× |
| remeda.sortBy | 85694 | 0.012 | 2.66× |
| es-toolkit.orderBy | 79628 | 0.012 | 2.86× |
| sort-array | 71192 | 0.014 | 3.20× |
| lodash.orderBy | 66129 | 0.015 | 3.44× |
| ramda.sortWith | 58909 | 0.017 | 3.87× |
| natural-orderby | 18368 | 0.052 | 12.40× |
| sort-on | 7920 | 0.114 | 28.75× |
| sort-by | 895 | 1.171 | 254.32× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 127020 | 0.008 | 0.69× |
| inline comparator chain, toSorted() | 123970 | 0.008 | 0.71× |
| fast-multisort | 88129 | 0.011 | 1.00× |
| underscore.sortBy | 71490 | 0.014 | 1.23× |
| thenby | 66569 | 0.015 | 1.32× |
| fast-sort | 61730 | 0.016 | 1.43× |
| remeda.sortBy | 57549 | 0.017 | 1.53× |
| Array.prototype.sort, decorated | 57459 | 0.017 | 1.53× |
| es-toolkit.orderBy | 54662 | 0.018 | 1.61× |
| ramda.sortWith | 42677 | 0.023 | 2.07× |
| sort-array | 42025 | 0.023 | 2.10× |
| just-sort-by | 34874 | 0.028 | 2.53× |
| lodash.orderBy | 32158 | 0.030 | 2.74× |
| sort-on | 6296 | 0.140 | 14.00× |
| natural-orderby | 4522 | 0.188 | 19.49× |
| sort-by | 896 | 1.188 | 98.39× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1588161 | 0.001 | 0.77× |
| fast-multisort | 1222383 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 1196061 | 0.001 | 1.02× |
| thenby | 700859 | 0.001 | 1.74× |
| just-sort-by | 697559 | 0.001 | 1.75× |
| fast-sort | 589662 | 0.002 | 2.07× |
| es-toolkit.orderBy | 519638 | 0.002 | 2.35× |
| Array.prototype.sort, decorated | 394197 | 0.003 | 3.10× |
| sort-array | 387261 | 0.003 | 3.16× |
| ramda.sortWith | 363113 | 0.003 | 3.37× |
| remeda.sortBy | 352363 | 0.003 | 3.47× |
| underscore.sortBy | 350109 | 0.003 | 3.49× |
| lodash.orderBy | 207871 | 0.005 | 5.88× |
| sort-on | 51167 | 0.019 | 23.89× |
| natural-orderby | 35587 | 0.027 | 34.35× |
| sort-by | 4427 | 0.192 | 276.15× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1057585 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 525780 | 0.002 | 2.01× |
| inline comparator chain, toSorted() | 461110 | 0.002 | 2.29× |
| underscore.sortBy | 212155 | 0.005 | 4.98× |
| just-sort-by | 182999 | 0.005 | 5.78× |
| fast-sort | 160664 | 0.006 | 6.58× |
| thenby | 154224 | 0.006 | 6.86× |
| Array.prototype.sort, decorated | 153534 | 0.006 | 6.89× |
| remeda.sortBy | 150053 | 0.007 | 7.05× |
| es-toolkit.orderBy | 136031 | 0.007 | 7.77× |
| sort-array | 113025 | 0.009 | 9.36× |
| lodash.orderBy | 107059 | 0.009 | 9.88× |
| ramda.sortWith | 95052 | 0.010 | 11.13× |
| natural-orderby | 29073 | 0.033 | 36.38× |
| sort-on | 11230 | 0.082 | 94.17× |
| sort-by | 1046 | 0.785 | 1010.92× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 179008 | 0.006 | 0.50× |
| inline comparator chain, toSorted() | 161872 | 0.006 | 0.56× |
| fast-multisort | 90217 | 0.011 | 1.00× |
| Array.prototype.sort, decorated | 65387 | 0.015 | 1.38× |
| remeda.sortBy (different order) | 51427 | 0.019 | 1.75× |
| es-toolkit.orderBy | 50273 | 0.020 | 1.79× |
| sort-array (different order) | 46411 | 0.021 | 1.94× |
| thenby (different order) | 45528 | 0.022 | 1.98× |
| lodash.orderBy | 38000 | 0.026 | 2.37× |
| ramda.sortWith (different order) | 36531 | 0.027 | 2.47× |
| fast-sort (different order) | 34122 | 0.028 | 2.64× |
| sort-on (different order) | 6822 | 0.130 | 13.22× |
| natural-orderby (different order) | 3540 | 0.233 | 25.48× |
| sort-by (different order) | 747 | 1.582 | 120.83× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42663 | 0.023 | 1.00× |
| inline comparator chain, toSorted() | 11652 | 0.080 | 3.66× |
| inline comparator chain, slice().sort() | 11331 | 0.082 | 3.77× |
| underscore.sortBy | 9628 | 0.095 | 4.43× |
| Array.prototype.sort, decorated | 5519 | 0.157 | 7.73× |
| thenby | 5494 | 0.158 | 7.77× |
| remeda.sortBy | 4894 | 0.175 | 8.72× |
| fast-sort | 4813 | 0.178 | 8.86× |
| es-toolkit.orderBy | 4043 | 0.207 | 10.55× |
| sort-array | 3841 | 0.217 | 11.11× |
| lodash.orderBy | 3120 | 0.260 | 13.67× |
| ramda.sortWith | 2947 | 0.273 | 14.48× |
| just-sort-by (different order) | 2669 | 0.298 | 15.99× |
| natural-orderby (different order) | 1351 | 0.561 | 31.57× |
| sort-on (different order) | 797 | 1.376 | 53.55× |
| sort-by | 63 | 17.033 | 675.32× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7991 | 0.113 | 1.00× |
| inline comparator chain, slice().sort() | 7808 | 0.115 | 1.02× |
| inline comparator chain, toSorted() | 7784 | 0.115 | 1.03× |
| underscore.sortBy | 4977 | 0.173 | 1.61× |
| thenby | 3818 | 0.218 | 2.09× |
| fast-sort | 3572 | 0.231 | 2.24× |
| Array.prototype.sort, decorated | 3460 | 0.238 | 2.31× |
| remeda.sortBy | 3328 | 0.246 | 2.40× |
| es-toolkit.orderBy | 3176 | 0.256 | 2.52× |
| sort-array | 2562 | 0.309 | 3.12× |
| ramda.sortWith | 2386 | 0.328 | 3.35× |
| lodash.orderBy | 1774 | 0.429 | 4.50× |
| just-sort-by (different order) | 1629 | 0.464 | 4.91× |
| natural-orderby (different order) | 776 | 1.448 | 10.29× |
| sort-on (different order) | 597 | 1.842 | 13.39× |
| sort-by | 61 | 17.345 | 131.08× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24354 | 0.040 | 1.00× |
| inline comparator chain, slice().sort() | 13039 | 0.072 | 1.87× |
| inline comparator chain, toSorted() | 12874 | 0.072 | 1.89× |
| underscore.sortBy (different order) | 8221 | 0.110 | 2.96× |
| just-sort-by (different order) | 6010 | 0.146 | 4.05× |
| Array.prototype.sort, decorated | 5591 | 0.156 | 4.36× |
| fast-sort (different order) | 5418 | 0.160 | 4.50× |
| thenby (different order) | 5389 | 0.161 | 4.52× |
| remeda.sortBy (different order) | 4971 | 0.173 | 4.90× |
| es-toolkit.orderBy | 4767 | 0.179 | 5.11× |
| sort-array | 4364 | 0.194 | 5.58× |
| lodash.orderBy | 3879 | 0.215 | 6.28× |
| ramda.sortWith (different order) | 3199 | 0.255 | 7.61× |
| natural-orderby | 1587 | 0.477 | 15.35× |
| sort-on | 859 | 1.266 | 28.36× |
| sort-by (different order) | 62 | 17.483 | 394.70× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 23275 | 0.041 | 1.00× |
| inline comparator chain, slice().sort() | 12135 | 0.077 | 1.92× |
| inline comparator chain, toSorted() | 11979 | 0.078 | 1.94× |
| underscore.sortBy | 8785 | 0.103 | 2.65× |
| just-sort-by | 6150 | 0.143 | 3.78× |
| thenby | 5896 | 0.148 | 3.95× |
| fast-sort | 5358 | 0.162 | 4.34× |
| Array.prototype.sort, decorated | 5251 | 0.165 | 4.43× |
| remeda.sortBy | 5230 | 0.165 | 4.45× |
| es-toolkit.orderBy | 4551 | 0.187 | 5.11× |
| sort-array | 4067 | 0.206 | 5.72× |
| lodash.orderBy | 3862 | 0.216 | 6.03× |
| ramda.sortWith | 3289 | 0.248 | 7.08× |
| natural-orderby | 1276 | 0.597 | 18.24× |
| sort-on | 688 | 1.629 | 33.85× |
| sort-by | 60 | 17.724 | 386.05× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7321 | 0.122 | 1.00× |
| inline comparator chain, slice().sort() | 5804 | 0.150 | 1.26× |
| inline comparator chain, toSorted() | 5762 | 0.151 | 1.27× |
| underscore.sortBy | 3939 | 0.212 | 1.86× |
| thenby | 3503 | 0.235 | 2.09× |
| Array.prototype.sort, decorated | 3163 | 0.257 | 2.31× |
| remeda.sortBy | 3147 | 0.258 | 2.33× |
| fast-sort | 3126 | 0.260 | 2.34× |
| es-toolkit.orderBy | 2878 | 0.279 | 2.54× |
| sort-array | 2216 | 0.351 | 3.30× |
| ramda.sortWith | 2215 | 0.352 | 3.30× |
| just-sort-by | 1892 | 0.404 | 3.87× |
| lodash.orderBy | 1714 | 0.444 | 4.27× |
| sort-on | 536 | 2.024 | 13.65× |
| natural-orderby | 513 | 2.110 | 14.27× |
| sort-by | 59 | 16.967 | 123.95× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 179598 | 0.006 | 0.68× |
| inline comparator chain, toSorted() | 133101 | 0.007 | 0.92× |
| fast-multisort | 122206 | 0.008 | 1.00× |
| thenby | 70190 | 0.014 | 1.74× |
| just-sort-by | 70118 | 0.014 | 1.74× |
| fast-sort | 62810 | 0.016 | 1.95× |
| es-toolkit.orderBy | 55612 | 0.018 | 2.20× |
| Array.prototype.sort, decorated | 43381 | 0.023 | 2.82× |
| underscore.sortBy | 41681 | 0.023 | 2.93× |
| sort-array | 41595 | 0.023 | 2.94× |
| remeda.sortBy | 39747 | 0.025 | 3.07× |
| ramda.sortWith | 38601 | 0.025 | 3.17× |
| lodash.orderBy | 23453 | 0.041 | 5.21× |
| sort-on | 4725 | 0.181 | 25.86× |
| natural-orderby | 2796 | 0.287 | 43.71× |
| sort-by | 610 | 1.927 | 200.44× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 110603 | 0.009 | 1.00× |
| inline comparator chain, slice().sort() | 38915 | 0.025 | 2.84× |
| inline comparator chain, toSorted() | 35627 | 0.027 | 3.10× |
| underscore.sortBy | 17861 | 0.053 | 6.19× |
| just-sort-by | 13077 | 0.071 | 8.46× |
| Array.prototype.sort, decorated | 11216 | 0.082 | 9.86× |
| thenby | 10547 | 0.087 | 10.49× |
| fast-sort | 10389 | 0.089 | 10.65× |
| remeda.sortBy | 9444 | 0.097 | 11.71× |
| es-toolkit.orderBy | 9087 | 0.100 | 12.17× |
| lodash.orderBy | 7416 | 0.121 | 14.91× |
| sort-array | 7149 | 0.125 | 15.47× |
| ramda.sortWith | 6259 | 0.141 | 17.67× |
| natural-orderby | 2116 | 0.365 | 52.27× |
| sort-on | 914 | 1.139 | 121.07× |
| sort-by | 91 | 11.568 | 1214.17× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 9264 | 0.098 | 0.96× |
| inline comparator chain, toSorted() | 9083 | 0.100 | 0.98× |
| fast-multisort | 8889 | 0.102 | 1.00× |
| Array.prototype.sort, decorated | 3420 | 0.240 | 2.60× |
| remeda.sortBy (different order) | 2610 | 0.304 | 3.41× |
| es-toolkit.orderBy | 2530 | 0.313 | 3.51× |
| thenby (different order) | 2418 | 0.325 | 3.68× |
| lodash.orderBy | 2385 | 0.329 | 3.73× |
| sort-array (different order) | 2326 | 0.337 | 3.82× |
| fast-sort (different order) | 1852 | 0.413 | 4.80× |
| ramda.sortWith (different order) | 1818 | 0.420 | 4.89× |
| sort-on (different order) | 475 | 2.217 | 18.73× |
| natural-orderby (different order) | 408 | 2.591 | 21.81× |
| sort-by (different order) | 38 | 27.474 | 234.76× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2773 | 0.290 | 1.00× |
| inline comparator chain, slice().sort() | 894 | 1.166 | 3.10× |
| inline comparator chain, toSorted() | 888 | 1.168 | 3.12× |
| underscore.sortBy | 850 | 1.275 | 3.26× |
| Array.prototype.sort, decorated | 524 | 2.083 | 5.29× |
| thenby | 517 | 2.110 | 5.37× |
| remeda.sortBy | 460 | 2.277 | 6.03× |
| fast-sort | 455 | 2.315 | 6.09× |
| es-toolkit.orderBy | 393 | 2.688 | 7.05× |
| sort-array | 367 | 2.857 | 7.55× |
| lodash.orderBy | 290 | 3.571 | 9.56× |
| ramda.sortWith | 283 | 3.623 | 9.80× |
| just-sort-by (different order) | 247 | 4.123 | 11.21× |
| natural-orderby (different order) | 133 | 7.591 | 20.81× |
| sort-on (different order) | 55 | 18.143 | 50.18× |
| sort-by | 4 | 235.667 | 647.43× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 627 | 1.869 | 1.00× |
| inline comparator chain, slice().sort() | 448 | 2.473 | 1.40× |
| inline comparator chain, toSorted() | 435 | 2.525 | 1.44× |
| underscore.sortBy | 357 | 2.930 | 1.76× |
| thenby | 322 | 3.239 | 1.95× |
| fast-sort | 301 | 3.425 | 2.08× |
| remeda.sortBy | 286 | 3.612 | 2.19× |
| Array.prototype.sort, decorated | 272 | 3.774 | 2.31× |
| es-toolkit.orderBy | 257 | 4.024 | 2.44× |
| ramda.sortWith | 221 | 4.587 | 2.83× |
| sort-array | 219 | 4.673 | 2.86× |
| just-sort-by (different order) | 142 | 7.099 | 4.43× |
| lodash.orderBy | 140 | 7.246 | 4.49× |
| natural-orderby (different order) | 43 | 24.143 | 14.70× |
| sort-on (different order) | 37 | 27.053 | 16.91× |
| sort-by | 4 | 253.000 | 157.78× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2141 | 0.362 | 1.00× |
| inline comparator chain, toSorted() | 918 | 1.085 | 2.33× |
| inline comparator chain, slice().sort() | 911 | 1.082 | 2.35× |
| underscore.sortBy (different order) | 760 | 1.475 | 2.82× |
| fast-sort (different order) | 491 | 2.288 | 4.36× |
| Array.prototype.sort, decorated | 476 | 2.217 | 4.50× |
| just-sort-by (different order) | 466 | 2.324 | 4.59× |
| thenby (different order) | 462 | 2.309 | 4.63× |
| remeda.sortBy (different order) | 462 | 2.292 | 4.64× |
| es-toolkit.orderBy | 434 | 2.463 | 4.94× |
| sort-array | 337 | 3.074 | 6.35× |
| lodash.orderBy | 324 | 3.177 | 6.61× |
| ramda.sortWith (different order) | 273 | 3.891 | 7.86× |
| natural-orderby | 142 | 7.200 | 15.06× |
| sort-on | 52 | 19.500 | 41.58× |
| sort-by (different order) | 4 | 267.500 | 568.04× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2014 | 0.382 | 1.00× |
| inline comparator chain, slice().sort() | 873 | 1.196 | 2.31× |
| inline comparator chain, toSorted() | 859 | 1.229 | 2.34× |
| underscore.sortBy | 755 | 1.466 | 2.67× |
| just-sort-by | 541 | 2.008 | 3.72× |
| thenby | 511 | 2.119 | 3.94× |
| Array.prototype.sort, decorated | 481 | 2.221 | 4.18× |
| fast-sort | 474 | 2.247 | 4.25× |
| remeda.sortBy | 459 | 2.304 | 4.39× |
| es-toolkit.orderBy | 420 | 2.538 | 4.80× |
| sort-array | 368 | 2.869 | 5.47× |
| lodash.orderBy | 310 | 3.356 | 6.50× |
| ramda.sortWith | 289 | 3.604 | 6.96× |
| natural-orderby | 123 | 8.197 | 16.34× |
| sort-on | 41 | 24.810 | 49.61× |
| sort-by | 4 | 253.500 | 505.68× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 673 | 1.695 | 1.00× |
| inline comparator chain, slice().sort() | 414 | 2.577 | 1.63× |
| inline comparator chain, toSorted() | 385 | 2.743 | 1.75× |
| underscore.sortBy | 322 | 3.205 | 2.09× |
| thenby | 280 | 3.684 | 2.40× |
| fast-sort | 272 | 3.759 | 2.47× |
| remeda.sortBy | 256 | 4.008 | 2.63× |
| Array.prototype.sort, decorated | 256 | 4.008 | 2.63× |
| es-toolkit.orderBy | 251 | 4.107 | 2.69× |
| sort-array | 210 | 4.817 | 3.21× |
| ramda.sortWith | 203 | 5.000 | 3.31× |
| just-sort-by | 171 | 5.941 | 3.95× |
| lodash.orderBy | 147 | 6.849 | 4.57× |
| sort-on | 35 | 29.167 | 19.45× |
| natural-orderby | 28 | 36.357 | 23.98× |
| sort-by | 4 | 276.500 | 185.21× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 13218 | 0.071 | 0.84× |
| fast-multisort | 11155 | 0.083 | 1.00× |
| inline comparator chain, toSorted() | 10388 | 0.089 | 1.07× |
| just-sort-by | 5999 | 0.146 | 1.86× |
| thenby | 5306 | 0.163 | 2.10× |
| fast-sort | 5202 | 0.166 | 2.14× |
| es-toolkit.orderBy | 4067 | 0.206 | 2.74× |
| Array.prototype.sort, decorated | 3395 | 0.241 | 3.29× |
| underscore.sortBy | 3145 | 0.258 | 3.55× |
| remeda.sortBy | 3090 | 0.262 | 3.61× |
| sort-array | 2768 | 0.289 | 4.03× |
| ramda.sortWith | 2683 | 0.297 | 4.16× |
| lodash.orderBy | 1503 | 0.503 | 7.42× |
| sort-on | 595 | 1.859 | 18.73× |
| natural-orderby | 314 | 3.340 | 35.56× |
| sort-by | 54 | 18.607 | 205.82× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10553 | 0.087 | 1.00× |
| inline comparator chain, slice().sort() | 2391 | 0.329 | 4.41× |
| inline comparator chain, toSorted() | 2242 | 0.348 | 4.71× |
| underscore.sortBy | 1237 | 0.620 | 8.53× |
| just-sort-by | 984 | 0.899 | 10.72× |
| Array.prototype.sort, decorated | 939 | 1.018 | 11.24× |
| fast-sort | 921 | 1.106 | 11.46× |
| thenby | 916 | 1.099 | 11.53× |
| remeda.sortBy | 910 | 1.101 | 11.59× |
| es-toolkit.orderBy | 804 | 1.373 | 13.13× |
| lodash.orderBy | 725 | 1.566 | 14.56× |
| sort-array | 725 | 1.543 | 14.56× |
| ramda.sortWith | 624 | 1.818 | 16.92× |
| natural-orderby | 217 | 4.710 | 48.65× |
| sort-on | 68 | 14.735 | 155.02× |
| sort-by | 7 | 143.750 | 1496.09× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1098 | 0.728 | 1.00× |
| inline comparator chain, slice().sort() | 735 | 1.543 | 1.49× |
| inline comparator chain, toSorted() | 723 | 1.558 | 1.52× |
| Array.prototype.sort, decorated | 301 | 3.425 | 3.65× |
| remeda.sortBy (different order) | 233 | 4.365 | 4.71× |
| es-toolkit.orderBy | 232 | 4.386 | 4.74× |
| thenby (different order) | 221 | 4.596 | 4.97× |
| lodash.orderBy | 218 | 4.692 | 5.05× |
| sort-array (different order) | 212 | 4.771 | 5.17× |
| ramda.sortWith (different order) | 169 | 5.976 | 6.50× |
| fast-sort (different order) | 163 | 6.185 | 6.72× |
| natural-orderby (different order) | 31 | 32.875 | 35.82× |
| sort-on (different order) | 30 | 32.938 | 36.14× |
| sort-by (different order) | 2 | 443.500 | 486.94× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 391 | 2.688 | 1.00× |
| inline comparator chain, slice().sort() | 70 | 14.286 | 5.57× |
| inline comparator chain, toSorted() | 69 | 14.824 | 5.71× |
| underscore.sortBy | 64 | 15.576 | 6.07× |
| thenby | 38 | 26.250 | 10.26× |
| Array.prototype.sort, decorated | 37 | 27.158 | 10.61× |
| remeda.sortBy | 35 | 28.722 | 11.21× |
| fast-sort | 34 | 29.333 | 11.46× |
| es-toolkit.orderBy | 28 | 35.333 | 13.79× |
| sort-array | 27 | 36.714 | 14.34× |
| ramda.sortWith | 20 | 49.455 | 19.11× |
| just-sort-by (different order) | 19 | 53.200 | 20.79× |
| lodash.orderBy | 17 | 59.111 | 22.72× |
| natural-orderby (different order) | 8 | 128.250 | 49.14× |
| sort-on (different order) | 4 | 242.667 | 94.91× |
| sort-by | 0 | 3050.000 | 1192.94× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 38 | 28.778 | 1.00× |
| inline comparator chain, slice().sort() | 31 | 32.438 | 1.22× |
| inline comparator chain, toSorted() | 29 | 34.533 | 1.30× |
| underscore.sortBy | 23 | 42.750 | 1.61× |
| remeda.sortBy | 20 | 50.700 | 1.91× |
| thenby | 19 | 53.800 | 1.97× |
| fast-sort | 19 | 53.800 | 1.99× |
| es-toolkit.orderBy | 18 | 56.333 | 2.12× |
| Array.prototype.sort, decorated | 17 | 59.444 | 2.24× |
| sort-array | 16 | 63.750 | 2.41× |
| ramda.sortWith | 15 | 68.625 | 2.59× |
| just-sort-by (different order) | 10 | 103.800 | 3.92× |
| lodash.orderBy | 7 | 151.250 | 5.69× |
| natural-orderby (different order) | 3 | 365.000 | 13.80× |
| sort-on (different order) | 2 | 401.500 | 15.18× |
| sort-by | 0 | 3478.000 | 131.50× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 269 | 3.832 | 1.00× |
| inline comparator chain, slice().sort() | 69 | 14.514 | 3.89× |
| inline comparator chain, toSorted() | 65 | 15.656 | 4.16× |
| underscore.sortBy (different order) | 49 | 20.480 | 5.47× |
| just-sort-by (different order) | 37 | 27.421 | 7.29× |
| fast-sort (different order) | 35 | 28.611 | 7.68× |
| thenby (different order) | 34 | 30.235 | 7.95× |
| remeda.sortBy (different order) | 33 | 30.647 | 8.23× |
| Array.prototype.sort, decorated | 31 | 32.688 | 8.70× |
| es-toolkit.orderBy | 29 | 34.400 | 9.21× |
| sort-array | 26 | 38.538 | 10.31× |
| ramda.sortWith (different order) | 22 | 45.167 | 12.12× |
| lodash.orderBy | 19 | 52.800 | 14.08× |
| natural-orderby | 9 | 117.600 | 30.98× |
| sort-on | 4 | 244.667 | 65.63× |
| sort-by (different order) | 0 | 3129.000 | 840.64× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 261 | 3.945 | 1.00× |
| inline comparator chain, slice().sort() | 63 | 15.906 | 4.14× |
| inline comparator chain, toSorted() | 63 | 16.031 | 4.18× |
| underscore.sortBy | 51 | 19.692 | 5.13× |
| just-sort-by | 37 | 27.105 | 7.06× |
| thenby | 33 | 30.059 | 7.81× |
| remeda.sortBy | 33 | 30.118 | 7.86× |
| fast-sort | 32 | 31.250 | 8.04× |
| es-toolkit.orderBy | 30 | 33.125 | 8.63× |
| Array.prototype.sort, decorated | 29 | 34.533 | 8.93× |
| sort-array | 27 | 36.571 | 9.54× |
| ramda.sortWith | 22 | 44.667 | 11.66× |
| lodash.orderBy | 19 | 53.200 | 13.79× |
| natural-orderby | 6 | 160.000 | 41.39× |
| sort-on | 3 | 314.000 | 81.94× |
| sort-by | 0 | 3425.000 | 894.46× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 38 | 26.200 | 1.00× |
| inline comparator chain, slice().sort() | 24 | 41.385 | 1.58× |
| inline comparator chain, toSorted() | 22 | 46.364 | 1.76× |
| underscore.sortBy | 22 | 46.000 | 1.76× |
| thenby | 19 | 52.300 | 2.00× |
| fast-sort | 18 | 54.200 | 2.07× |
| remeda.sortBy | 17 | 57.556 | 2.20× |
| es-toolkit.orderBy | 16 | 62.875 | 2.39× |
| Array.prototype.sort, decorated | 15 | 65.125 | 2.48× |
| sort-array | 15 | 66.125 | 2.54× |
| ramda.sortWith | 14 | 70.750 | 2.71× |
| just-sort-by | 11 | 93.500 | 3.51× |
| lodash.orderBy | 7 | 140.250 | 5.38× |
| sort-on | 2 | 407.000 | 15.61× |
| natural-orderby (different order) | 2 | 479.000 | 18.36× |
| sort-by | 0 | 3482.000 | 133.56× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1006 | 0.850 | 0.99× |
| fast-multisort | 993 | 0.877 | 1.00× |
| inline comparator chain, toSorted() | 949 | 1.010 | 1.05× |
| just-sort-by | 705 | 1.590 | 1.41× |
| thenby | 671 | 1.676 | 1.48× |
| fast-sort | 647 | 1.764 | 1.53× |
| es-toolkit.orderBy | 541 | 2.000 | 1.83× |
| sort-array | 407 | 2.596 | 2.44× |
| Array.prototype.sort, decorated | 387 | 2.758 | 2.57× |
| remeda.sortBy | 385 | 2.717 | 2.58× |
| underscore.sortBy | 380 | 2.799 | 2.61× |
| ramda.sortWith | 360 | 2.941 | 2.75× |
| lodash.orderBy | 158 | 6.632 | 6.30× |
| sort-on | 52 | 19.462 | 19.21× |
| natural-orderby | 21 | 48.091 | 47.39× |
| sort-by | 5 | 190.667 | 189.11× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 971 | 0.928 | 1.00× |
| inline comparator chain, slice().sort() | 243 | 4.192 | 3.99× |
| inline comparator chain, toSorted() | 240 | 4.254 | 4.05× |
| underscore.sortBy | 137 | 7.382 | 7.10× |
| just-sort-by | 94 | 10.723 | 10.38× |
| remeda.sortBy | 81 | 12.415 | 12.03× |
| Array.prototype.sort, decorated | 80 | 12.525 | 12.13× |
| fast-sort | 76 | 13.158 | 12.75× |
| thenby | 74 | 13.474 | 13.04× |
| es-toolkit.orderBy | 64 | 15.688 | 15.20× |
| sort-array | 52 | 19.346 | 18.70× |
| lodash.orderBy | 50 | 20.160 | 19.54× |
| ramda.sortWith | 47 | 21.458 | 20.83× |
| natural-orderby | 15 | 65.500 | 63.28× |
| sort-on | 5 | 190.333 | 184.73× |
| sort-by | 1 | 1896.000 | 1841.39× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 116 | 8.724 | 1.00× |
| inline comparator chain, toSorted() | 45 | 22.261 | 2.58× |
| inline comparator chain, slice().sort() | 43 | 23.409 | 2.71× |
| Array.prototype.sort, decorated | 20 | 50.900 | 5.90× |
| thenby (different order) | 14 | 72.625 | 8.40× |
| es-toolkit.orderBy | 12 | 85.167 | 9.78× |
| remeda.sortBy (different order) | 12 | 86.833 | 9.89× |
| sort-array (different order) | 11 | 89.333 | 10.32× |
| ramda.sortWith (different order) | 8 | 123.000 | 13.77× |
| lodash.orderBy | 8 | 128.500 | 13.91× |
| fast-sort (different order) | 8 | 128.750 | 14.94× |
| natural-orderby (different order) | 2 | 417.500 | 48.43× |
| sort-on (different order) | 2 | 512.000 | 59.43× |
| sort-by (different order) | 0 | 5957.000 | 691.48× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 33 | 30.176 | 1.00× |
| underscore.sortBy | 4 | 257.500 | 8.55× |
| inline comparator chain, slice().sort() | 3 | 294.500 | 9.77× |
| inline comparator chain, toSorted() | 3 | 298.000 | 9.89× |
| thenby | 2 | 456.000 | 15.14× |
| remeda.sortBy | 2 | 469.500 | 15.59× |
| fast-sort | 2 | 485.000 | 16.10× |
| Array.prototype.sort, decorated | 2 | 493.500 | 16.37× |
| es-toolkit.orderBy | 2 | 551.000 | 18.29× |
| sort-array | 2 | 608.000 | 20.18× |
| lodash.orderBy | 2 | 664.000 | 22.04× |
| ramda.sortWith | 1 | 719.000 | 23.87× |
| natural-orderby (different order) | 1 | 1546.000 | 51.32× |
| just-sort-by (different order) | 1 | 1613.000 | 53.55× |
| sort-on (different order) | 0 | 274979.000 | 9128.64× |
| sort-by | 0 | 363677.000 | 12073.20× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 417.000 | 1.00× |
| inline comparator chain, slice().sort() | 1 | 733.000 | 1.76× |
| inline comparator chain, toSorted() | 1 | 750.000 | 1.80× |
| underscore.sortBy | 1 | 946.000 | 2.27× |
| thenby | 1 | 983.000 | 2.36× |
| remeda.sortBy | 1 | 1024.000 | 2.46× |
| fast-sort | 1 | 1034.000 | 2.48× |
| es-toolkit.orderBy | 1 | 1100.000 | 2.64× |
| ramda.sortWith | 1 | 1280.000 | 3.07× |
| sort-array | 1 | 1290.000 | 3.09× |
| Array.prototype.sort, decorated | 1 | 1382.000 | 3.31× |
| lodash.orderBy | 0 | 2066.000 | 4.95× |
| just-sort-by (different order) | 0 | 3294.000 | 7.90× |
| natural-orderby (different order) | 0 | 5644.000 | 13.53× |
| sort-on (different order) | 0 | 114916.000 | 275.58× |
| sort-by | 0 | 386666.000 | 927.26× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 21 | 48.818 | 1.00× |
| inline comparator chain, slice().sort() | 4 | 255.000 | 5.31× |
| inline comparator chain, toSorted() | 4 | 275.500 | 5.74× |
| underscore.sortBy (different order) | 3 | 320.500 | 6.67× |
| just-sort-by (different order) | 2 | 432.000 | 8.99× |
| thenby (different order) | 2 | 470.500 | 9.80× |
| fast-sort (different order) | 2 | 479.000 | 9.97× |
| remeda.sortBy (different order) | 2 | 511.000 | 10.64× |
| es-toolkit.orderBy | 2 | 551.000 | 11.47× |
| sort-array | 2 | 612.000 | 12.74× |
| ramda.sortWith (different order) | 1 | 716.000 | 14.91× |
| Array.prototype.sort, decorated | 1 | 746.000 | 15.53× |
| lodash.orderBy | 1 | 829.000 | 17.26× |
| natural-orderby | 1 | 1343.000 | 27.96× |
| sort-on | 0 | 17924.000 | 373.20× |
| sort-by (different order) | 0 | 379239.000 | 7896.15× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 18 | 55.000 | 1.00× |
| inline comparator chain, toSorted() | 4 | 277.500 | 5.10× |
| inline comparator chain, slice().sort() | 4 | 285.000 | 5.24× |
| underscore.sortBy | 3 | 352.000 | 6.46× |
| just-sort-by | 2 | 436.500 | 8.03× |
| thenby | 2 | 469.000 | 8.63× |
| fast-sort | 2 | 506.000 | 9.31× |
| remeda.sortBy | 2 | 520.000 | 9.57× |
| es-toolkit.orderBy | 2 | 562.000 | 10.34× |
| sort-array | 2 | 614.000 | 11.30× |
| ramda.sortWith | 1 | 681.000 | 12.53× |
| Array.prototype.sort, decorated | 1 | 735.000 | 13.52× |
| lodash.orderBy | 1 | 856.000 | 15.75× |
| natural-orderby | 1 | 1558.000 | 28.66× |
| sort-on | 0 | 214345.000 | 3943.18× |
| sort-by | 0 | 381475.000 | 7017.76× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 543.000 | 1.00× |
| inline comparator chain, toSorted() | 1 | 905.000 | 1.67× |
| inline comparator chain, slice().sort() | 1 | 912.000 | 1.68× |
| underscore.sortBy | 1 | 1024.000 | 1.89× |
| thenby | 1 | 1091.000 | 2.01× |
| es-toolkit.orderBy | 1 | 1176.000 | 2.17× |
| fast-sort | 1 | 1178.000 | 2.17× |
| remeda.sortBy | 1 | 1205.000 | 2.22× |
| sort-array | 1 | 1375.000 | 2.53× |
| Array.prototype.sort, decorated | 1 | 1379.000 | 2.54× |
| ramda.sortWith | 1 | 1396.000 | 2.57× |
| just-sort-by | 1 | 1728.000 | 3.18× |
| lodash.orderBy | 0 | 2143.000 | 3.95× |
| natural-orderby (different order) | 0 | 5859.000 | 10.79× |
| sort-on | 0 | 298033.000 | 548.86× |
| sort-by | 0 | 488447.000 | 899.53× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 117 | 8.610 | 1.00× |
| inline comparator chain, slice().sort() | 75 | 13.395 | 1.56× |
| inline comparator chain, toSorted() | 62 | 16.258 | 1.89× |
| just-sort-by | 46 | 21.870 | 2.55× |
| thenby | 42 | 23.773 | 2.76× |
| fast-sort | 40 | 25.200 | 2.94× |
| es-toolkit.orderBy | 37 | 27.316 | 3.17× |
| remeda.sortBy | 32 | 31.500 | 3.67× |
| sort-array | 27 | 36.786 | 4.28× |
| ramda.sortWith | 26 | 38.071 | 4.45× |
| underscore.sortBy | 21 | 48.545 | 5.52× |
| Array.prototype.sort, decorated | 20 | 49.545 | 5.71× |
| lodash.orderBy | 10 | 97.333 | 11.31× |
| natural-orderby | 2 | 470.500 | 55.02× |
| sort-on | 1 | 812.000 | 95.01× |
| sort-by | 0 | 3269.000 | 382.50× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 104 | 9.769 | 1.00× |
| inline comparator chain, slice().sort() | 18 | 55.556 | 5.75× |
| inline comparator chain, toSorted() | 17 | 57.222 | 5.92× |
| underscore.sortBy | 10 | 101.800 | 10.49× |
| just-sort-by | 7 | 135.000 | 13.96× |
| remeda.sortBy | 7 | 149.250 | 15.45× |
| thenby | 6 | 154.000 | 15.94× |
| fast-sort | 6 | 160.750 | 16.64× |
| Array.prototype.sort, decorated | 6 | 170.333 | 17.62× |
| es-toolkit.orderBy | 5 | 192.000 | 19.86× |
| sort-array | 4 | 226.667 | 23.47× |
| lodash.orderBy | 4 | 251.000 | 25.98× |
| ramda.sortWith | 4 | 253.500 | 26.24× |
| natural-orderby | 2 | 591.000 | 61.18× |
| sort-on | 0 | 3868.000 | 400.44× |
| sort-by | 0 | 119023.000 | 12322.07× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 8 | 120.400 | 1.00× |
| inline comparator chain, slice().sort() | 2 | 462.000 | 3.84× |
| inline comparator chain, toSorted() | 2 | 467.000 | 3.89× |
| es-toolkit.orderBy | 1 | 1023.000 | 8.51× |
| remeda.sortBy (different order) | 1 | 1027.000 | 8.55× |
| thenby (different order) | 1 | 1067.000 | 8.88× |
| Array.prototype.sort, decorated | 1 | 1090.000 | 9.07× |
| sort-array (different order) | 1 | 1178.000 | 9.80× |
| lodash.orderBy | 1 | 1287.000 | 10.71× |
| ramda.sortWith (different order) | 1 | 1425.000 | 11.86× |
| fast-sort (different order) | 0 | 2380.000 | 19.80× |
| natural-orderby (different order) | 0 | 5023.000 | 41.80× |
| sort-on (different order) | 0 | 526126.000 | 4378.05× |
| sort-by (different order) | 0 | 737334.000 | 6135.57× |

</details>

<!-- browsers:end -->

Run `pnpm bench` (or `pnpm bench --sizes=100,10000` for a subset) and `pnpm bench:browsers` to reproduce; `pnpm bench:readme` rewrites the tables above. What each competitor does and which of their ideas ended up in here: [benchmark/COMPETITORS.md](benchmark/COMPETITORS.md).

The honest footnote: a hand-written comparator chain passed to the native sort is the thing to beat, and it wins at ten rows (we are 2× slower: a sort there is a few hundred nanoseconds and our setup is most of it), ties or wins at a hundred rows on numeric keys, and is level with us on inputs that are already in order at every size, because the native sort is linear there too and skips our key pass. From a thousand rows up on data that actually needs sorting we lead it by 1.4 to 6× and the libraries by 2 to 10×, in every engine. The tables are the only argument, and the scripts above regenerate them from scratch.

## How

Numbers go through a stable radix sort on their float64 bits, strings through buckets and a radix sort over the characters that actually differ, ties recurse into the next rule, and anything exotic falls back to the lodash comparator so the order stays identical to lodash. Inputs that are already in order are passed through. The rest is bookkeeping.

## License

MIT
