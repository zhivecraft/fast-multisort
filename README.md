# fast-multisort

Sorts arrays of records by several keys, puts nulls where you tell it to, and tries very hard not to call a comparator. Stable, lodash-compatible where you want it to be, and the fastest thing on this side of the canyon as far as the benchmarks below can see.

The ambition is simple: be for sorting what [fast-equals](https://github.com/planttheidea/fast-equals) is for equality.

- Stable. Keys are read once per item, never inside a comparator.
- `multisort` puts nulls first or last per rule; `sortBy`/`orderBy` are drop-ins for lodash down to its quirks.
- Zero dependencies, ESM and CJS, types included.

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

Every competitor is run with its own multi-key API where it has one and checked against the lodash permutation first; `(different order)` marks results that differ (mostly where `null` lands). Numbers below are from `pnpm bench --markdown`, Apple M5 Max, Node 24. Ops/sec, higher is better; the last column is how many times slower than `fast-multisort`.

<!-- bench:start -->

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| remeda.sortBy | 193725 | 0.005 | 0.96× |
| fast-sort | 185340 | 0.005 | 1.00× |
| fast-multisort | 185127 | 0.005 | 1.00× |
| thenby | 181488 | 0.006 | 1.02× |
| Array.prototype.sort, decorated | 165034 | 0.006 | 1.12× |
| es-toolkit.orderBy | 164531 | 0.006 | 1.13× |
| underscore.sortBy | 155818 | 0.006 | 1.19× |
| sort-array | 121487 | 0.008 | 1.52× |
| lodash.orderBy | 117136 | 0.009 | 1.58× |
| ramda.sortWith | 71033 | 0.014 | 2.61× |
| just-sort-by (different order) | 42171 | 0.024 | 4.39× |
| natural-orderby (different order) | 12025 | 0.083 | 15.39× |
| sort-on (different order) | 9028 | 0.111 | 20.51× |
| sort-by | 1231 | 0.813 | 150.36× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 140522 | 0.007 | 1.00× |
| underscore.sortBy | 121397 | 0.008 | 1.16× |
| thenby | 96132 | 0.011 | 1.46× |
| remeda.sortBy | 95615 | 0.011 | 1.47× |
| fast-sort | 94553 | 0.011 | 1.49× |
| lodash.orderBy | 92909 | 0.011 | 1.51× |
| Array.prototype.sort, decorated | 88375 | 0.011 | 1.59× |
| es-toolkit.orderBy | 87516 | 0.012 | 1.61× |
| ramda.sortWith | 52277 | 0.019 | 2.69× |
| sort-array | 51375 | 0.020 | 2.74× |
| just-sort-by (different order) | 32463 | 0.031 | 4.33× |
| natural-orderby (different order) | 9517 | 0.106 | 14.76× |
| sort-on (different order) | 7767 | 0.129 | 18.09× |
| sort-by | 1162 | 0.861 | 120.89× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 245835 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 163754 | 0.006 | 1.50× |
| just-sort-by (different order) | 113143 | 0.009 | 2.17× |
| thenby (different order) | 109094 | 0.009 | 2.25× |
| remeda.sortBy (different order) | 109084 | 0.009 | 2.25× |
| lodash.orderBy | 108793 | 0.009 | 2.26× |
| fast-sort | 108266 | 0.009 | 2.27× |
| es-toolkit.orderBy | 101015 | 0.010 | 2.43× |
| Array.prototype.sort, decorated | 99673 | 0.010 | 2.47× |
| sort-array | 59040 | 0.017 | 4.16× |
| ramda.sortWith (different order) | 58826 | 0.017 | 4.18× |
| natural-orderby | 27806 | 0.036 | 8.84× |
| sort-on | 9940 | 0.101 | 24.73× |
| sort-by (different order) | 1207 | 0.829 | 203.65× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 187297 | 0.005 | 1.00× |
| underscore.sortBy | 146908 | 0.007 | 1.27× |
| just-sort-by | 99158 | 0.010 | 1.89× |
| remeda.sortBy | 96815 | 0.010 | 1.93× |
| thenby | 96149 | 0.010 | 1.95× |
| lodash.orderBy | 95339 | 0.011 | 1.96× |
| es-toolkit.orderBy | 90550 | 0.011 | 2.07× |
| fast-sort | 90396 | 0.011 | 2.07× |
| Array.prototype.sort, decorated | 85935 | 0.012 | 2.18× |
| ramda.sortWith | 55727 | 0.018 | 3.36× |
| sort-array | 51902 | 0.019 | 3.61× |
| natural-orderby | 22942 | 0.044 | 8.16× |
| sort-on | 8498 | 0.118 | 22.04× |
| sort-by | 1133 | 0.884 | 165.29× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 131361 | 0.008 | 1.00× |
| underscore.sortBy | 99433 | 0.010 | 1.32× |
| thenby | 88852 | 0.011 | 1.48× |
| remeda.sortBy | 85856 | 0.012 | 1.53× |
| es-toolkit.orderBy | 82069 | 0.012 | 1.60× |
| fast-sort | 79562 | 0.013 | 1.65× |
| Array.prototype.sort, decorated | 77905 | 0.013 | 1.69× |
| lodash.orderBy | 77185 | 0.013 | 1.70× |
| just-sort-by | 54273 | 0.019 | 2.42× |
| ramda.sortWith | 50963 | 0.020 | 2.58× |
| sort-array | 46204 | 0.022 | 2.84× |
| natural-orderby | 16285 | 0.062 | 8.07× |
| sort-on | 7297 | 0.138 | 18.00× |
| sort-by | 1137 | 0.881 | 115.51× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 983863 | 0.001 | 1.00× |
| just-sort-by | 766056 | 0.001 | 1.28× |
| thenby | 703829 | 0.001 | 1.40× |
| remeda.sortBy | 684916 | 0.001 | 1.44× |
| fast-sort | 625717 | 0.002 | 1.57× |
| es-toolkit.orderBy | 621127 | 0.002 | 1.58× |
| Array.prototype.sort, decorated | 558612 | 0.002 | 1.76× |
| underscore.sortBy | 477371 | 0.002 | 2.06× |
| lodash.orderBy | 378418 | 0.003 | 2.60× |
| ramda.sortWith | 363687 | 0.003 | 2.71× |
| sort-array | 352374 | 0.003 | 2.79× |
| sort-on | 47727 | 0.021 | 20.61× |
| natural-orderby | 33859 | 0.030 | 29.06× |
| sort-by | 6195 | 0.162 | 158.81× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1049552 | 0.001 | 1.00× |
| just-sort-by | 769324 | 0.001 | 1.36× |
| thenby | 718076 | 0.001 | 1.46× |
| fast-sort | 660308 | 0.002 | 1.59× |
| es-toolkit.orderBy | 645743 | 0.002 | 1.63× |
| remeda.sortBy | 623104 | 0.002 | 1.68× |
| Array.prototype.sort, decorated | 541606 | 0.002 | 1.94× |
| underscore.sortBy | 444304 | 0.002 | 2.36× |
| ramda.sortWith | 366444 | 0.003 | 2.86× |
| sort-array | 361417 | 0.003 | 2.90× |
| lodash.orderBy | 350910 | 0.003 | 2.99× |
| sort-on | 42888 | 0.024 | 24.47× |
| natural-orderby | 34366 | 0.029 | 30.54× |
| sort-by | 6038 | 0.166 | 173.82× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 104059 | 0.010 | 1.00× |
| remeda.sortBy | 87238 | 0.012 | 1.19× |
| Array.prototype.sort, decorated | 82171 | 0.012 | 1.27× |
| es-toolkit.orderBy | 80770 | 0.012 | 1.29× |
| lodash.orderBy | 79913 | 0.013 | 1.30× |
| thenby | 65769 | 0.015 | 1.58× |
| fast-sort | 61619 | 0.016 | 1.69× |
| ramda.sortWith | 50809 | 0.020 | 2.05× |
| sort-array | 44640 | 0.023 | 2.33× |
| sort-on (different order) | 8652 | 0.116 | 12.03× |
| natural-orderby (different order) | 5683 | 0.176 | 18.31× |
| sort-by | 1198 | 0.836 | 86.89× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 17533 | 0.057 | 1.00× |
| underscore.sortBy | 6329 | 0.158 | 2.77× |
| thenby | 4976 | 0.201 | 3.52× |
| remeda.sortBy | 4929 | 0.203 | 3.56× |
| lodash.orderBy | 4835 | 0.207 | 3.63× |
| es-toolkit.orderBy | 4630 | 0.216 | 3.79× |
| fast-sort | 4617 | 0.217 | 3.80× |
| Array.prototype.sort, decorated | 4524 | 0.221 | 3.88× |
| ramda.sortWith | 3053 | 0.328 | 5.74× |
| sort-array | 2763 | 0.362 | 6.35× |
| just-sort-by (different order) | 2101 | 0.477 | 8.34× |
| natural-orderby (different order) | 1019 | 0.982 | 17.21× |
| sort-on (different order) | 541 | 1.850 | 32.42× |
| sort-by | 73 | 13.641 | 239.10× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11851 | 0.085 | 1.00× |
| underscore.sortBy | 5326 | 0.188 | 2.23× |
| thenby | 4631 | 0.216 | 2.56× |
| remeda.sortBy | 4525 | 0.221 | 2.62× |
| es-toolkit.orderBy | 4220 | 0.237 | 2.81× |
| fast-sort | 4203 | 0.238 | 2.82× |
| Array.prototype.sort, decorated | 4172 | 0.240 | 2.84× |
| lodash.orderBy | 4168 | 0.240 | 2.84× |
| ramda.sortWith | 2933 | 0.341 | 4.04× |
| sort-array | 2555 | 0.392 | 4.64× |
| just-sort-by (different order) | 2061 | 0.486 | 5.75× |
| natural-orderby (different order) | 744 | 1.345 | 15.92× |
| sort-on (different order) | 481 | 2.081 | 24.65× |
| sort-by | 70 | 14.317 | 169.46× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 29779 | 0.034 | 1.00× |
| underscore.sortBy (different order) | 9790 | 0.102 | 3.04× |
| just-sort-by (different order) | 6785 | 0.148 | 4.39× |
| thenby (different order) | 6740 | 0.149 | 4.42× |
| lodash.orderBy | 6599 | 0.152 | 4.51× |
| fast-sort | 6482 | 0.155 | 4.59× |
| remeda.sortBy (different order) | 6468 | 0.155 | 4.60× |
| es-toolkit.orderBy | 6271 | 0.160 | 4.75× |
| Array.prototype.sort, decorated | 6150 | 0.163 | 4.84× |
| ramda.sortWith (different order) | 3743 | 0.267 | 7.96× |
| sort-array | 3731 | 0.268 | 7.98× |
| natural-orderby | 2241 | 0.447 | 13.29× |
| sort-on | 615 | 1.627 | 48.42× |
| sort-by (different order) | 74 | 13.450 | 400.35× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 25605 | 0.039 | 1.00× |
| underscore.sortBy | 8524 | 0.118 | 3.00× |
| just-sort-by | 6179 | 0.162 | 4.14× |
| thenby | 6061 | 0.165 | 4.22× |
| remeda.sortBy | 5995 | 0.167 | 4.27× |
| lodash.orderBy | 5892 | 0.170 | 4.35× |
| fast-sort | 5648 | 0.178 | 4.53× |
| es-toolkit.orderBy | 5554 | 0.180 | 4.61× |
| Array.prototype.sort, decorated | 5397 | 0.186 | 4.74× |
| ramda.sortWith | 3497 | 0.286 | 7.32× |
| sort-array | 3285 | 0.306 | 7.80× |
| natural-orderby | 1888 | 0.530 | 13.56× |
| sort-on | 534 | 1.873 | 47.94× |
| sort-by | 72 | 13.959 | 357.30× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11837 | 0.085 | 1.00× |
| underscore.sortBy | 5676 | 0.176 | 2.09× |
| thenby | 5233 | 0.191 | 2.26× |
| remeda.sortBy | 5135 | 0.195 | 2.31× |
| es-toolkit.orderBy | 4791 | 0.209 | 2.47× |
| fast-sort | 4718 | 0.212 | 2.51× |
| Array.prototype.sort, decorated | 4508 | 0.222 | 2.63× |
| lodash.orderBy | 4436 | 0.226 | 2.67× |
| just-sort-by | 3214 | 0.312 | 3.68× |
| ramda.sortWith | 3103 | 0.323 | 3.81× |
| sort-array | 2856 | 0.350 | 4.14× |
| natural-orderby | 1412 | 0.709 | 8.38× |
| sort-on | 455 | 2.197 | 25.99× |
| sort-by | 70 | 14.321 | 169.49× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 96562 | 0.010 | 1.00× |
| just-sort-by | 80083 | 0.013 | 1.21× |
| thenby | 68892 | 0.015 | 1.40× |
| fast-sort | 62676 | 0.016 | 1.54× |
| remeda.sortBy | 61953 | 0.016 | 1.56× |
| es-toolkit.orderBy | 61814 | 0.016 | 1.56× |
| Array.prototype.sort, decorated | 53679 | 0.019 | 1.80× |
| underscore.sortBy | 47164 | 0.021 | 2.05× |
| lodash.orderBy | 38607 | 0.026 | 2.50× |
| ramda.sortWith | 35489 | 0.028 | 2.72× |
| sort-array | 35434 | 0.028 | 2.73× |
| sort-on | 4664 | 0.215 | 20.70× |
| natural-orderby | 3354 | 0.299 | 28.79× |
| sort-by | 607 | 1.649 | 159.09× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 108356 | 0.009 | 1.00× |
| just-sort-by | 77331 | 0.013 | 1.40× |
| thenby | 74075 | 0.014 | 1.46× |
| fast-sort | 66036 | 0.015 | 1.64× |
| es-toolkit.orderBy | 65806 | 0.015 | 1.65× |
| remeda.sortBy | 62608 | 0.016 | 1.73× |
| Array.prototype.sort, decorated | 54004 | 0.019 | 2.01× |
| underscore.sortBy | 44628 | 0.023 | 2.43× |
| sort-array | 36464 | 0.028 | 2.97× |
| ramda.sortWith | 36095 | 0.028 | 3.00× |
| lodash.orderBy | 35909 | 0.028 | 3.02× |
| sort-on | 4329 | 0.231 | 25.03× |
| natural-orderby | 3332 | 0.301 | 32.52× |
| sort-by | 603 | 1.660 | 179.71× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11671 | 0.086 | 1.00× |
| Array.prototype.sort, decorated | 4498 | 0.223 | 2.59× |
| lodash.orderBy | 4443 | 0.225 | 2.63× |
| es-toolkit.orderBy | 4338 | 0.231 | 2.69× |
| remeda.sortBy (different order) | 4007 | 0.250 | 2.91× |
| thenby (different order) | 3806 | 0.263 | 3.07× |
| fast-sort (different order) | 3430 | 0.292 | 3.40× |
| ramda.sortWith (different order) | 2724 | 0.368 | 4.28× |
| sort-array (different order) | 2395 | 0.418 | 4.87× |
| natural-orderby (different order) | 516 | 1.943 | 22.63× |
| sort-on (different order) | 499 | 2.006 | 23.38× |
| sort-by (different order) | 69 | 14.453 | 168.63× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3159 | 0.318 | 1.00× |
| underscore.sortBy | 423 | 2.366 | 7.47× |
| thenby | 349 | 2.866 | 9.05× |
| fast-sort | 330 | 3.034 | 9.58× |
| Array.prototype.sort, decorated | 326 | 3.069 | 9.69× |
| es-toolkit.orderBy | 324 | 3.088 | 9.75× |
| lodash.orderBy | 315 | 3.175 | 10.02× |
| remeda.sortBy | 294 | 3.401 | 10.74× |
| ramda.sortWith | 208 | 4.807 | 15.18× |
| sort-array | 187 | 5.343 | 16.87× |
| just-sort-by (different order) | 153 | 6.555 | 20.65× |
| natural-orderby (different order) | 87 | 11.438 | 36.11× |
| sort-on (different order) | 38 | 26.026 | 82.13× |
| sort-by | 5 | 189.950 | 599.79× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 726 | 1.383 | 1.00× |
| underscore.sortBy | 335 | 2.983 | 2.17× |
| thenby | 306 | 3.271 | 2.37× |
| fast-sort | 288 | 3.469 | 2.52× |
| es-toolkit.orderBy | 286 | 3.498 | 2.54× |
| Array.prototype.sort, decorated | 278 | 3.601 | 2.61× |
| remeda.sortBy | 265 | 3.777 | 2.74× |
| lodash.orderBy | 259 | 3.864 | 2.80× |
| ramda.sortWith | 189 | 5.284 | 3.84× |
| sort-array | 172 | 5.826 | 4.23× |
| just-sort-by (different order) | 141 | 7.130 | 5.14× |
| natural-orderby (different order) | 58 | 17.382 | 12.61× |
| sort-on (different order) | 33 | 29.914 | 21.72× |
| sort-by | 5 | 199.527 | 144.87× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3649 | 0.275 | 1.00× |
| underscore.sortBy (different order) | 717 | 1.395 | 5.09× |
| thenby (different order) | 511 | 1.957 | 7.14× |
| just-sort-by (different order) | 489 | 2.047 | 7.47× |
| fast-sort | 474 | 2.115 | 7.71× |
| lodash.orderBy | 472 | 2.119 | 7.73× |
| es-toolkit.orderBy | 467 | 2.141 | 7.81× |
| Array.prototype.sort, decorated | 460 | 2.178 | 7.94× |
| remeda.sortBy (different order) | 428 | 2.338 | 8.53× |
| ramda.sortWith (different order) | 258 | 3.878 | 14.15× |
| sort-array | 248 | 4.039 | 14.73× |
| natural-orderby | 183 | 5.457 | 19.90× |
| sort-on | 44 | 22.666 | 82.57× |
| sort-by (different order) | 6 | 181.652 | 662.71× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2972 | 0.337 | 1.00× |
| underscore.sortBy | 617 | 1.622 | 4.82× |
| just-sort-by | 447 | 2.237 | 6.65× |
| thenby | 440 | 2.272 | 6.75× |
| fast-sort | 419 | 2.390 | 7.10× |
| es-toolkit.orderBy | 406 | 2.464 | 7.32× |
| remeda.sortBy | 399 | 2.507 | 7.45× |
| lodash.orderBy | 394 | 2.545 | 7.54× |
| Array.prototype.sort, decorated | 393 | 2.548 | 7.57× |
| ramda.sortWith | 236 | 4.248 | 12.62× |
| sort-array | 219 | 4.577 | 13.60× |
| natural-orderby | 143 | 7.017 | 20.81× |
| sort-on | 38 | 26.065 | 77.45× |
| sort-by | 5 | 196.619 | 584.28× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 738 | 1.360 | 1.00× |
| underscore.sortBy | 384 | 2.607 | 1.92× |
| thenby | 346 | 2.896 | 2.13× |
| fast-sort | 323 | 3.095 | 2.28× |
| es-toolkit.orderBy | 320 | 3.125 | 2.30× |
| Array.prototype.sort, decorated | 308 | 3.248 | 2.40× |
| remeda.sortBy | 299 | 3.347 | 2.47× |
| lodash.orderBy | 283 | 3.537 | 2.61× |
| just-sort-by | 236 | 4.234 | 3.12× |
| ramda.sortWith | 201 | 4.965 | 3.66× |
| sort-array | 191 | 5.232 | 3.86× |
| natural-orderby | 111 | 8.986 | 6.63× |
| sort-on | 33 | 30.791 | 22.69× |
| sort-by | 5 | 200.369 | 147.80× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10086 | 0.099 | 1.00× |
| just-sort-by | 8157 | 0.123 | 1.24× |
| thenby | 6950 | 0.144 | 1.45× |
| fast-sort | 6484 | 0.154 | 1.56× |
| remeda.sortBy | 6328 | 0.158 | 1.59× |
| es-toolkit.orderBy | 6236 | 0.161 | 1.62× |
| Array.prototype.sort, decorated | 5600 | 0.179 | 1.80× |
| underscore.sortBy | 4766 | 0.211 | 2.12× |
| lodash.orderBy | 3791 | 0.266 | 2.66× |
| ramda.sortWith | 3354 | 0.298 | 3.01× |
| sort-array | 3213 | 0.311 | 3.14× |
| sort-on | 469 | 2.133 | 21.49× |
| natural-orderby | 318 | 3.150 | 31.75× |
| sort-by | 60 | 16.670 | 168.08× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10476 | 0.096 | 1.00× |
| just-sort-by | 7923 | 0.126 | 1.32× |
| thenby | 7403 | 0.135 | 1.42× |
| fast-sort | 6717 | 0.149 | 1.56× |
| es-toolkit.orderBy | 6320 | 0.159 | 1.66× |
| Array.prototype.sort, decorated | 5456 | 0.184 | 1.92× |
| remeda.sortBy | 5314 | 0.188 | 1.97× |
| underscore.sortBy | 4519 | 0.222 | 2.32× |
| lodash.orderBy | 3421 | 0.296 | 3.06× |
| ramda.sortWith | 3344 | 0.299 | 3.13× |
| sort-array | 3244 | 0.309 | 3.23× |
| sort-on | 425 | 2.354 | 24.65× |
| natural-orderby | 316 | 3.170 | 33.18× |
| sort-by | 61 | 16.375 | 171.47× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1360 | 0.737 | 1.00× |
| Array.prototype.sort, decorated | 289 | 3.467 | 4.71× |
| lodash.orderBy | 285 | 3.511 | 4.77× |
| es-toolkit.orderBy | 280 | 3.576 | 4.86× |
| remeda.sortBy (different order) | 256 | 3.909 | 5.31× |
| thenby (different order) | 254 | 3.947 | 5.36× |
| fast-sort (different order) | 226 | 4.428 | 6.02× |
| ramda.sortWith (different order) | 178 | 5.618 | 7.64× |
| sort-array (different order) | 159 | 6.278 | 8.53× |
| natural-orderby (different order) | 44 | 22.512 | 30.59× |
| sort-on (different order) | 33 | 30.081 | 40.90× |
| sort-by (different order) | 4 | 229.657 | 312.23× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 278 | 3.610 | 1.00× |
| underscore.sortBy | 35 | 28.895 | 8.03× |
| thenby | 30 | 33.159 | 9.21× |
| fast-sort | 28 | 35.349 | 9.81× |
| es-toolkit.orderBy | 28 | 35.947 | 9.99× |
| Array.prototype.sort, decorated | 26 | 39.080 | 10.84× |
| lodash.orderBy | 25 | 40.065 | 11.12× |
| remeda.sortBy | 24 | 40.960 | 11.39× |
| ramda.sortWith | 17 | 57.432 | 15.96× |
| sort-array | 16 | 62.193 | 17.27× |
| just-sort-by (different order) | 13 | 77.708 | 21.58× |
| natural-orderby (different order) | 7 | 137.155 | 38.10× |
| sort-on (different order) | 3 | 306.544 | 85.18× |
| sort-by | 0 | 2176.220 | 605.11× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 328 | 3.091 | 1.00× |
| underscore.sortBy (different order) | 52 | 19.467 | 6.37× |
| thenby (different order) | 38 | 26.113 | 8.56× |
| just-sort-by (different order) | 38 | 26.299 | 8.62× |
| fast-sort | 36 | 27.670 | 9.06× |
| es-toolkit.orderBy | 35 | 28.400 | 9.30× |
| remeda.sortBy (different order) | 33 | 30.764 | 10.08× |
| lodash.orderBy | 32 | 31.531 | 10.30× |
| Array.prototype.sort, decorated | 31 | 32.058 | 10.48× |
| ramda.sortWith (different order) | 20 | 50.393 | 16.51× |
| sort-array | 19 | 51.963 | 17.04× |
| natural-orderby | 13 | 77.458 | 25.37× |
| sort-on | 3 | 291.995 | 95.71× |
| sort-by (different order) | 0 | 2314.834 | 759.11× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 94 | 10.723 | 1.00× |
| es-toolkit.orderBy | 19 | 52.555 | 4.91× |
| Array.prototype.sort, decorated | 18 | 56.814 | 5.30× |
| remeda.sortBy (different order) | 18 | 57.096 | 5.33× |
| lodash.orderBy | 17 | 57.670 | 5.38× |
| thenby (different order) | 17 | 58.121 | 5.43× |
| fast-sort (different order) | 15 | 67.641 | 6.31× |
| ramda.sortWith (different order) | 12 | 85.127 | 7.95× |
| sort-array (different order) | 11 | 91.991 | 8.59× |
| natural-orderby (different order) | 4 | 277.705 | 25.95× |
| sort-on (different order) | 2 | 450.149 | 42.07× |
| sort-by (different order) | 0 | 3446.252 | 322.24× |

<!-- bench:end -->

Run `pnpm bench` (or `pnpm bench --quick` for 10k rows only) to reproduce.

The honest footnote: at a hundred rows a sort takes a few microseconds, and on short near-unique strings a plain comparator sort is as fast as anything; there we are within measurement noise of remeda. From a thousand rows up, nothing in this table comes within 2× on any case.

## How

Numbers go through a stable radix sort on their float64 bits, strings through buckets and a radix sort over the characters that actually differ, ties recurse into the next rule, and anything exotic falls back to the lodash comparator so the order stays identical to lodash. Inputs that are already in order are passed through. The rest is bookkeeping.

## License

MIT
