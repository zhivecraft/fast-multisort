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
| remeda.sortBy | 198459 | 0.005 | 0.82× |
| fast-sort | 189088 | 0.005 | 0.86× |
| thenby | 187954 | 0.005 | 0.87× |
| Array.prototype.sort, decorated | 168251 | 0.006 | 0.97× |
| fast-multisort | 162925 | 0.006 | 1.00× |
| es-toolkit.orderBy | 162106 | 0.006 | 1.01× |
| underscore.sortBy | 152957 | 0.007 | 1.07× |
| sort-array | 123977 | 0.008 | 1.31× |
| lodash.orderBy | 116535 | 0.009 | 1.40× |
| ramda.sortWith | 70073 | 0.014 | 2.33× |
| just-sort-by (different order) | 43509 | 0.023 | 3.74× |
| natural-orderby (different order) | 12215 | 0.082 | 13.34× |
| sort-on (different order) | 9061 | 0.111 | 17.98× |
| sort-by | 1219 | 0.822 | 133.61× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 143173 | 0.007 | 1.00× |
| underscore.sortBy | 122516 | 0.008 | 1.17× |
| fast-sort | 97063 | 0.010 | 1.48× |
| thenby | 94908 | 0.011 | 1.51× |
| lodash.orderBy | 94188 | 0.011 | 1.52× |
| remeda.sortBy | 93132 | 0.011 | 1.54× |
| es-toolkit.orderBy | 86963 | 0.012 | 1.65× |
| Array.prototype.sort, decorated | 84960 | 0.012 | 1.69× |
| ramda.sortWith | 52861 | 0.019 | 2.71× |
| sort-array | 50956 | 0.020 | 2.81× |
| just-sort-by (different order) | 33724 | 0.030 | 4.25× |
| natural-orderby (different order) | 8896 | 0.116 | 16.09× |
| sort-on (different order) | 7913 | 0.127 | 18.09× |
| sort-by | 1104 | 0.913 | 129.67× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 171329 | 0.006 | 1.00× |
| underscore.sortBy (different order) | 162824 | 0.006 | 1.05× |
| just-sort-by (different order) | 110915 | 0.009 | 1.54× |
| lodash.orderBy | 110486 | 0.009 | 1.55× |
| remeda.sortBy (different order) | 109781 | 0.009 | 1.56× |
| thenby (different order) | 108147 | 0.009 | 1.58× |
| fast-sort | 105809 | 0.010 | 1.62× |
| es-toolkit.orderBy | 101145 | 0.010 | 1.69× |
| Array.prototype.sort, decorated | 98446 | 0.010 | 1.74× |
| ramda.sortWith (different order) | 58965 | 0.017 | 2.91× |
| sort-array | 58577 | 0.017 | 2.92× |
| natural-orderby | 25884 | 0.043 | 6.62× |
| sort-on | 10035 | 0.100 | 17.07× |
| sort-by (different order) | 1199 | 0.836 | 142.88× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 153639 | 0.007 | 1.00× |
| underscore.sortBy | 152645 | 0.007 | 1.01× |
| remeda.sortBy | 103749 | 0.010 | 1.48× |
| thenby | 100196 | 0.010 | 1.53× |
| just-sort-by | 97499 | 0.010 | 1.58× |
| lodash.orderBy | 97128 | 0.010 | 1.58× |
| fast-sort | 94479 | 0.011 | 1.63× |
| es-toolkit.orderBy | 92998 | 0.011 | 1.65× |
| Array.prototype.sort, decorated | 87211 | 0.012 | 1.76× |
| ramda.sortWith | 55490 | 0.018 | 2.77× |
| sort-array | 53298 | 0.019 | 2.88× |
| natural-orderby | 22906 | 0.044 | 6.71× |
| sort-on | 8634 | 0.116 | 17.79× |
| sort-by | 1138 | 0.880 | 135.01× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 123087 | 0.008 | 1.00× |
| underscore.sortBy | 98567 | 0.010 | 1.25× |
| remeda.sortBy | 90955 | 0.011 | 1.35× |
| thenby | 90861 | 0.011 | 1.35× |
| es-toolkit.orderBy | 83833 | 0.012 | 1.47× |
| fast-sort | 79757 | 0.013 | 1.54× |
| Array.prototype.sort, decorated | 76635 | 0.013 | 1.61× |
| lodash.orderBy | 76543 | 0.013 | 1.61× |
| just-sort-by | 53311 | 0.019 | 2.31× |
| ramda.sortWith | 49388 | 0.020 | 2.49× |
| sort-array | 46887 | 0.021 | 2.63× |
| natural-orderby | 16259 | 0.062 | 7.57× |
| sort-on | 7352 | 0.136 | 16.74× |
| sort-by | 1154 | 0.868 | 106.71× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 955382 | 0.001 | 1.00× |
| just-sort-by | 799847 | 0.001 | 1.19× |
| thenby | 696957 | 0.001 | 1.37× |
| remeda.sortBy | 665933 | 0.002 | 1.43× |
| es-toolkit.orderBy | 622225 | 0.002 | 1.54× |
| fast-sort | 616746 | 0.002 | 1.55× |
| Array.prototype.sort, decorated | 553476 | 0.002 | 1.73× |
| underscore.sortBy | 477594 | 0.002 | 2.00× |
| lodash.orderBy | 380018 | 0.003 | 2.51× |
| ramda.sortWith | 358687 | 0.003 | 2.66× |
| sort-array | 353761 | 0.003 | 2.70× |
| sort-on | 48311 | 0.021 | 19.78× |
| natural-orderby | 32579 | 0.031 | 29.32× |
| sort-by | 6261 | 0.160 | 152.58× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1060799 | 0.001 | 1.00× |
| just-sort-by | 765513 | 0.001 | 1.39× |
| thenby | 729514 | 0.001 | 1.45× |
| fast-sort | 645800 | 0.002 | 1.64× |
| es-toolkit.orderBy | 642309 | 0.002 | 1.65× |
| remeda.sortBy | 642290 | 0.002 | 1.65× |
| Array.prototype.sort, decorated | 551322 | 0.002 | 1.92× |
| underscore.sortBy | 450285 | 0.002 | 2.36× |
| ramda.sortWith | 365794 | 0.003 | 2.90× |
| sort-array | 363533 | 0.003 | 2.92× |
| lodash.orderBy | 350284 | 0.003 | 3.03× |
| sort-on | 43480 | 0.023 | 24.40× |
| natural-orderby | 34389 | 0.029 | 30.85× |
| sort-by | 6074 | 0.165 | 174.64× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 98038 | 0.010 | 1.00× |
| remeda.sortBy | 90748 | 0.011 | 1.08× |
| es-toolkit.orderBy | 82465 | 0.012 | 1.19× |
| lodash.orderBy | 79720 | 0.013 | 1.23× |
| Array.prototype.sort, decorated | 78066 | 0.013 | 1.26× |
| thenby | 66585 | 0.015 | 1.47× |
| fast-sort | 63178 | 0.016 | 1.55× |
| ramda.sortWith | 51081 | 0.020 | 1.92× |
| sort-array | 46539 | 0.022 | 2.11× |
| sort-on (different order) | 8469 | 0.119 | 11.58× |
| natural-orderby (different order) | 5739 | 0.175 | 17.08× |
| sort-by | 1195 | 0.838 | 82.02× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 17727 | 0.057 | 1.00× |
| underscore.sortBy | 6235 | 0.161 | 2.84× |
| remeda.sortBy | 5211 | 0.192 | 3.40× |
| thenby | 5143 | 0.195 | 3.45× |
| lodash.orderBy | 4794 | 0.209 | 3.70× |
| es-toolkit.orderBy | 4759 | 0.210 | 3.73× |
| fast-sort | 4654 | 0.215 | 3.81× |
| Array.prototype.sort, decorated | 4569 | 0.219 | 3.88× |
| ramda.sortWith | 3119 | 0.321 | 5.68× |
| sort-array | 2820 | 0.355 | 6.29× |
| just-sort-by (different order) | 2038 | 0.497 | 8.70× |
| natural-orderby (different order) | 1060 | 0.945 | 16.73× |
| sort-on (different order) | 546 | 1.832 | 32.44× |
| sort-by | 73 | 13.695 | 242.60× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12150 | 0.083 | 1.00× |
| underscore.sortBy | 5389 | 0.186 | 2.25× |
| remeda.sortBy | 4693 | 0.213 | 2.59× |
| thenby | 4591 | 0.218 | 2.65× |
| fast-sort | 4331 | 0.231 | 2.81× |
| es-toolkit.orderBy | 4310 | 0.232 | 2.82× |
| lodash.orderBy | 4252 | 0.236 | 2.86× |
| Array.prototype.sort, decorated | 4150 | 0.241 | 2.93× |
| ramda.sortWith | 2872 | 0.349 | 4.23× |
| sort-array | 2611 | 0.383 | 4.65× |
| just-sort-by (different order) | 2054 | 0.488 | 5.92× |
| natural-orderby (different order) | 734 | 1.365 | 16.55× |
| sort-on (different order) | 474 | 2.113 | 25.63× |
| sort-by | 72 | 13.973 | 169.67× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30179 | 0.033 | 1.00× |
| underscore.sortBy (different order) | 9816 | 0.102 | 3.07× |
| remeda.sortBy (different order) | 6861 | 0.146 | 4.40× |
| thenby (different order) | 6832 | 0.147 | 4.42× |
| just-sort-by (different order) | 6660 | 0.150 | 4.53× |
| lodash.orderBy | 6578 | 0.152 | 4.59× |
| fast-sort | 6560 | 0.153 | 4.60× |
| es-toolkit.orderBy | 6315 | 0.159 | 4.78× |
| Array.prototype.sort, decorated | 6239 | 0.161 | 4.84× |
| ramda.sortWith (different order) | 3771 | 0.266 | 8.00× |
| sort-array | 3770 | 0.265 | 8.01× |
| natural-orderby | 2229 | 0.449 | 13.54× |
| sort-on | 622 | 1.610 | 48.55× |
| sort-by (different order) | 73 | 13.625 | 410.73× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 25166 | 0.040 | 1.00× |
| underscore.sortBy | 8276 | 0.121 | 3.04× |
| remeda.sortBy | 6176 | 0.162 | 4.07× |
| thenby | 6156 | 0.163 | 4.09× |
| just-sort-by | 6112 | 0.164 | 4.12× |
| fast-sort | 5805 | 0.173 | 4.34× |
| lodash.orderBy | 5734 | 0.175 | 4.39× |
| es-toolkit.orderBy | 5627 | 0.178 | 4.47× |
| Array.prototype.sort, decorated | 5343 | 0.187 | 4.71× |
| ramda.sortWith | 3511 | 0.285 | 7.17× |
| sort-array | 3354 | 0.299 | 7.50× |
| natural-orderby | 1894 | 0.529 | 13.29× |
| sort-on | 540 | 1.853 | 46.61× |
| sort-by | 71 | 14.009 | 352.46× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12116 | 0.083 | 1.00× |
| underscore.sortBy | 5766 | 0.174 | 2.10× |
| remeda.sortBy | 5164 | 0.194 | 2.35× |
| thenby | 5132 | 0.195 | 2.36× |
| es-toolkit.orderBy | 4660 | 0.215 | 2.60× |
| fast-sort | 4658 | 0.215 | 2.60× |
| Array.prototype.sort, decorated | 4533 | 0.221 | 2.67× |
| lodash.orderBy | 4489 | 0.223 | 2.70× |
| just-sort-by | 3212 | 0.312 | 3.77× |
| ramda.sortWith | 3111 | 0.322 | 3.90× |
| sort-array | 2829 | 0.354 | 4.28× |
| natural-orderby | 1403 | 0.714 | 8.64× |
| sort-on | 464 | 2.157 | 26.11× |
| sort-by | 70 | 14.372 | 174.04× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 95673 | 0.011 | 1.00× |
| just-sort-by | 79326 | 0.013 | 1.21× |
| thenby | 72570 | 0.014 | 1.32× |
| remeda.sortBy | 66767 | 0.015 | 1.43× |
| fast-sort | 64402 | 0.016 | 1.49× |
| es-toolkit.orderBy | 62059 | 0.016 | 1.54× |
| Array.prototype.sort, decorated | 54438 | 0.019 | 1.76× |
| underscore.sortBy | 48336 | 0.021 | 1.98× |
| lodash.orderBy | 37776 | 0.027 | 2.53× |
| ramda.sortWith | 35790 | 0.028 | 2.67× |
| sort-array | 35550 | 0.028 | 2.69× |
| sort-on | 4895 | 0.205 | 19.54× |
| natural-orderby | 3344 | 0.300 | 28.61× |
| sort-by | 607 | 1.649 | 157.68× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 110862 | 0.009 | 1.00× |
| just-sort-by | 75624 | 0.013 | 1.47× |
| thenby | 74614 | 0.014 | 1.49× |
| fast-sort | 68082 | 0.015 | 1.63× |
| es-toolkit.orderBy | 65024 | 0.016 | 1.70× |
| remeda.sortBy | 62565 | 0.016 | 1.77× |
| Array.prototype.sort, decorated | 53170 | 0.019 | 2.09× |
| underscore.sortBy | 44050 | 0.023 | 2.52× |
| ramda.sortWith | 36683 | 0.027 | 3.02× |
| sort-array | 36191 | 0.028 | 3.06× |
| lodash.orderBy | 35346 | 0.029 | 3.14× |
| sort-on | 4298 | 0.233 | 25.80× |
| natural-orderby | 3380 | 0.297 | 32.80× |
| sort-by | 608 | 1.646 | 182.34× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11462 | 0.088 | 1.00× |
| Array.prototype.sort, decorated | 4526 | 0.221 | 2.53× |
| lodash.orderBy | 4470 | 0.224 | 2.56× |
| es-toolkit.orderBy | 4405 | 0.228 | 2.60× |
| remeda.sortBy (different order) | 4130 | 0.242 | 2.78× |
| thenby (different order) | 3945 | 0.254 | 2.91× |
| fast-sort (different order) | 3651 | 0.274 | 3.14× |
| ramda.sortWith (different order) | 2753 | 0.364 | 4.16× |
| sort-array (different order) | 2467 | 0.406 | 4.65× |
| natural-orderby (different order) | 525 | 1.907 | 21.83× |
| sort-on (different order) | 504 | 1.987 | 22.75× |
| sort-by (different order) | 70 | 14.220 | 162.86× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3069 | 0.331 | 1.00× |
| underscore.sortBy | 417 | 2.403 | 7.37× |
| thenby | 360 | 2.781 | 8.53× |
| fast-sort | 335 | 2.984 | 9.16× |
| es-toolkit.orderBy | 328 | 3.047 | 9.35× |
| Array.prototype.sort, decorated | 320 | 3.122 | 9.58× |
| lodash.orderBy | 314 | 3.191 | 9.79× |
| remeda.sortBy | 298 | 3.354 | 10.29× |
| ramda.sortWith | 204 | 4.904 | 15.03× |
| sort-array | 187 | 5.340 | 16.39× |
| just-sort-by (different order) | 157 | 6.382 | 19.58× |
| natural-orderby (different order) | 89 | 11.206 | 34.36× |
| sort-on (different order) | 38 | 26.399 | 80.77× |
| sort-by | 5 | 191.485 | 587.44× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 747 | 1.347 | 1.00× |
| underscore.sortBy | 340 | 2.942 | 2.19× |
| thenby | 308 | 3.247 | 2.42× |
| fast-sort | 292 | 3.430 | 2.56× |
| es-toolkit.orderBy | 286 | 3.499 | 2.61× |
| Array.prototype.sort, decorated | 277 | 3.617 | 2.70× |
| remeda.sortBy | 267 | 3.751 | 2.80× |
| lodash.orderBy | 261 | 3.839 | 2.86× |
| ramda.sortWith | 191 | 5.235 | 3.91× |
| sort-array | 171 | 5.857 | 4.37× |
| just-sort-by (different order) | 147 | 6.818 | 5.08× |
| natural-orderby (different order) | 58 | 17.416 | 12.97× |
| sort-on (different order) | 34 | 29.653 | 22.10× |
| sort-by | 5 | 195.050 | 145.59× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3662 | 0.274 | 1.00× |
| underscore.sortBy (different order) | 703 | 1.426 | 5.21× |
| just-sort-by (different order) | 505 | 1.982 | 7.26× |
| thenby (different order) | 504 | 1.984 | 7.26× |
| fast-sort | 483 | 2.072 | 7.58× |
| lodash.orderBy | 479 | 2.091 | 7.65× |
| Array.prototype.sort, decorated | 462 | 2.167 | 7.93× |
| es-toolkit.orderBy | 454 | 2.205 | 8.07× |
| remeda.sortBy (different order) | 421 | 2.377 | 8.70× |
| ramda.sortWith (different order) | 258 | 3.870 | 14.17× |
| sort-array | 248 | 4.038 | 14.78× |
| natural-orderby | 182 | 5.506 | 20.16× |
| sort-on | 45 | 22.270 | 81.54× |
| sort-by (different order) | 5 | 184.011 | 673.68× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3045 | 0.329 | 1.00× |
| underscore.sortBy | 603 | 1.660 | 5.05× |
| just-sort-by | 441 | 2.272 | 6.90× |
| thenby | 436 | 2.297 | 6.99× |
| fast-sort | 422 | 2.372 | 7.22× |
| lodash.orderBy | 404 | 2.476 | 7.53× |
| es-toolkit.orderBy | 396 | 2.525 | 7.68× |
| Array.prototype.sort, decorated | 392 | 2.551 | 7.76× |
| remeda.sortBy | 389 | 2.571 | 7.82× |
| ramda.sortWith | 236 | 4.246 | 12.93× |
| sort-array | 215 | 4.674 | 14.19× |
| natural-orderby | 147 | 6.806 | 20.72× |
| sort-on | 39 | 25.878 | 78.70× |
| sort-by | 5 | 197.741 | 602.03× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 728 | 1.381 | 1.00× |
| underscore.sortBy | 384 | 2.603 | 1.90× |
| thenby | 348 | 2.874 | 2.09× |
| fast-sort | 329 | 3.039 | 2.21× |
| es-toolkit.orderBy | 319 | 3.138 | 2.28× |
| Array.prototype.sort, decorated | 312 | 3.204 | 2.33× |
| remeda.sortBy | 299 | 3.342 | 2.43× |
| lodash.orderBy | 293 | 3.421 | 2.49× |
| just-sort-by | 230 | 4.360 | 3.17× |
| ramda.sortWith | 201 | 4.975 | 3.62× |
| sort-array | 189 | 5.295 | 3.86× |
| natural-orderby | 113 | 8.832 | 6.43× |
| sort-on | 33 | 30.344 | 22.10× |
| sort-by | 5 | 199.914 | 145.58× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9641 | 0.104 | 1.00× |
| just-sort-by | 7921 | 0.127 | 1.22× |
| thenby | 7107 | 0.141 | 1.36× |
| fast-sort | 6579 | 0.153 | 1.47× |
| remeda.sortBy | 6121 | 0.164 | 1.58× |
| es-toolkit.orderBy | 6025 | 0.166 | 1.60× |
| Array.prototype.sort, decorated | 5605 | 0.179 | 1.72× |
| underscore.sortBy | 4796 | 0.210 | 2.01× |
| lodash.orderBy | 3697 | 0.275 | 2.61× |
| ramda.sortWith | 3292 | 0.304 | 2.93× |
| sort-array | 3181 | 0.315 | 3.03× |
| sort-on | 483 | 2.071 | 19.95× |
| natural-orderby | 314 | 3.196 | 30.75× |
| sort-by | 62 | 16.140 | 155.56× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10482 | 0.096 | 1.00× |
| just-sort-by | 7702 | 0.130 | 1.36× |
| thenby | 7349 | 0.136 | 1.43× |
| fast-sort | 6700 | 0.150 | 1.56× |
| es-toolkit.orderBy | 6010 | 0.167 | 1.74× |
| Array.prototype.sort, decorated | 5523 | 0.182 | 1.90× |
| remeda.sortBy | 5119 | 0.196 | 2.05× |
| underscore.sortBy | 4434 | 0.227 | 2.36× |
| lodash.orderBy | 3382 | 0.299 | 3.10× |
| ramda.sortWith | 3323 | 0.301 | 3.15× |
| sort-array | 3221 | 0.311 | 3.25× |
| sort-on | 423 | 2.363 | 24.75× |
| natural-orderby | 319 | 3.134 | 32.82× |
| sort-by | 61 | 16.502 | 172.94× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1375 | 0.729 | 1.00× |
| Array.prototype.sort, decorated | 294 | 3.406 | 4.68× |
| lodash.orderBy | 282 | 3.549 | 4.88× |
| es-toolkit.orderBy | 279 | 3.591 | 4.93× |
| remeda.sortBy (different order) | 263 | 3.805 | 5.23× |
| thenby (different order) | 257 | 3.886 | 5.34× |
| fast-sort (different order) | 233 | 4.290 | 5.89× |
| ramda.sortWith (different order) | 180 | 5.561 | 7.64× |
| sort-array (different order) | 161 | 6.231 | 8.56× |
| natural-orderby (different order) | 43 | 23.238 | 31.88× |
| sort-on (different order) | 33 | 30.351 | 41.71× |
| sort-by (different order) | 4 | 231.492 | 318.18× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 267 | 3.757 | 1.00× |
| underscore.sortBy | 34 | 29.180 | 7.78× |
| thenby | 30 | 33.323 | 8.88× |
| fast-sort | 28 | 35.475 | 9.47× |
| es-toolkit.orderBy | 27 | 37.063 | 9.84× |
| Array.prototype.sort, decorated | 26 | 39.050 | 10.41× |
| remeda.sortBy | 25 | 40.001 | 10.68× |
| lodash.orderBy | 24 | 40.890 | 10.90× |
| ramda.sortWith | 17 | 57.463 | 15.34× |
| sort-array | 16 | 62.540 | 16.68× |
| just-sort-by (different order) | 13 | 77.207 | 20.60× |
| natural-orderby (different order) | 7 | 137.149 | 36.60× |
| sort-on (different order) | 3 | 298.526 | 79.69× |
| sort-by | 0 | 2168.521 | 579.11× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 297 | 3.405 | 1.00× |
| underscore.sortBy (different order) | 52 | 19.354 | 5.71× |
| just-sort-by (different order) | 38 | 26.158 | 7.75× |
| thenby (different order) | 38 | 26.121 | 7.75× |
| fast-sort | 37 | 27.256 | 8.09× |
| es-toolkit.orderBy | 35 | 28.716 | 8.50× |
| remeda.sortBy (different order) | 32 | 30.794 | 9.13× |
| lodash.orderBy | 32 | 31.664 | 9.38× |
| Array.prototype.sort, decorated | 31 | 32.001 | 9.47× |
| ramda.sortWith (different order) | 20 | 50.460 | 14.97× |
| sort-array | 19 | 52.299 | 15.52× |
| natural-orderby | 13 | 78.577 | 23.29× |
| sort-on | 3 | 289.065 | 85.75× |
| sort-by (different order) | 0 | 2320.985 | 688.85× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 89 | 11.303 | 1.00× |
| es-toolkit.orderBy | 19 | 53.119 | 4.70× |
| remeda.sortBy (different order) | 18 | 55.071 | 4.88× |
| thenby (different order) | 18 | 56.830 | 5.03× |
| Array.prototype.sort, decorated | 18 | 57.335 | 5.04× |
| lodash.orderBy | 17 | 57.758 | 5.11× |
| fast-sort (different order) | 15 | 65.946 | 5.84× |
| ramda.sortWith (different order) | 12 | 83.084 | 7.36× |
| sort-array (different order) | 11 | 91.338 | 8.09× |
| natural-orderby (different order) | 4 | 278.481 | 24.67× |
| sort-on (different order) | 2 | 444.399 | 39.36× |
| sort-by (different order) | 0 | 3432.904 | 304.19× |

<!-- bench:end -->

Run `pnpm bench` (or `pnpm bench --quick` for 10k rows only) to reproduce.

## How

Numbers go through a stable radix sort on their float64 bits, strings through buckets and a radix sort over the characters that actually differ, ties recurse into the next rule, and anything exotic falls back to the lodash comparator so the order stays identical to lodash. Inputs that are already in order are passed through. The rest is bookkeeping.

## License

MIT
