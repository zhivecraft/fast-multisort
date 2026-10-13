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

Every competitor is run with its own multi-key API where it has one and checked against the lodash permutation first; `(different order)` marks results that differ (mostly where `null` lands), and the run aborts if `fast-multisort` itself differs. Numbers below are from `pnpm bench --markdown`, Apple M5 Max, Node 24. Ops/sec, higher is better; the last column is how many times slower than `fast-multisort`.

<!-- bench:start -->

Times slower than `fast-multisort` across all cases below (min / median / max), and in how many cases the result order differs from lodash.

| library | min | median | max | cases | order differs |
|---|---:|---:|---:|---:|---:|
| thenby | 1.21× | 2.43× | 9.43× | 27 | 7 |
| fast-sort | 1.24× | 2.56× | 10.12× | 27 | 3 |
| remeda.sortBy | 1.16× | 2.62× | 11.62× | 27 | 7 |
| es-toolkit.orderBy | 1.45× | 2.63× | 10.46× | 27 | 0 |
| Array.prototype.sort, decorated | 1.32× | 2.77× | 11.20× | 27 | 0 |
| underscore.sortBy | 1.41× | 2.89× | 8.50× | 23 | 4 |
| lodash.orderBy | 1.77× | 3.71× | 11.79× | 27 | 0 |
| ramda.sortWith | 2.68× | 4.22× | 17.22× | 27 | 7 |
| sort-array | 1.86× | 4.42× | 18.16× | 27 | 3 |
| just-sort-by | 1.69× | 4.61× | 22.45× | 23 | 11 |
| natural-orderby | 6.42× | 22.14× | 49.81× | 27 | 11 |
| sort-on | 18.54× | 29.31× | 98.90× | 27 | 11 |
| sort-by | 118.32× | 222.90× | 723.79× | 27 | 7 |

<details>
<summary>Per case</summary>

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 222859 | 0.005 | 1.00× |
| remeda.sortBy | 191541 | 0.005 | 1.16× |
| thenby | 184388 | 0.005 | 1.21× |
| fast-sort | 179772 | 0.006 | 1.24× |
| Array.prototype.sort, decorated | 168305 | 0.006 | 1.32× |
| underscore.sortBy | 154605 | 0.007 | 1.44× |
| es-toolkit.orderBy | 153225 | 0.007 | 1.45× |
| sort-array | 120138 | 0.008 | 1.86× |
| lodash.orderBy | 119159 | 0.008 | 1.87× |
| ramda.sortWith | 70186 | 0.014 | 3.18× |
| just-sort-by (different order) | 42334 | 0.024 | 5.26× |
| natural-orderby (different order) | 11955 | 0.084 | 18.64× |
| sort-on (different order) | 9017 | 0.112 | 24.72× |
| sort-by | 1264 | 0.792 | 176.26× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 177503 | 0.006 | 1.00× |
| underscore.sortBy | 121572 | 0.008 | 1.46× |
| thenby | 95062 | 0.011 | 1.87× |
| fast-sort | 94603 | 0.011 | 1.88× |
| remeda.sortBy | 93874 | 0.011 | 1.89× |
| lodash.orderBy | 92779 | 0.011 | 1.91× |
| Array.prototype.sort, decorated | 87715 | 0.012 | 2.02× |
| es-toolkit.orderBy | 86423 | 0.012 | 2.05× |
| ramda.sortWith | 52229 | 0.019 | 3.40× |
| sort-array | 51118 | 0.020 | 3.47× |
| just-sort-by (different order) | 32553 | 0.031 | 5.45× |
| natural-orderby (different order) | 9709 | 0.103 | 18.28× |
| sort-on (different order) | 7594 | 0.132 | 23.37× |
| sort-by | 1213 | 0.826 | 146.33× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 255482 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 162329 | 0.006 | 1.57× |
| just-sort-by (different order) | 111068 | 0.009 | 2.30× |
| lodash.orderBy | 108497 | 0.009 | 2.35× |
| thenby (different order) | 107938 | 0.009 | 2.37× |
| remeda.sortBy (different order) | 106620 | 0.009 | 2.40× |
| fast-sort | 103011 | 0.010 | 2.48× |
| es-toolkit.orderBy | 100821 | 0.010 | 2.53× |
| Array.prototype.sort, decorated | 100222 | 0.010 | 2.55× |
| ramda.sortWith (different order) | 59311 | 0.017 | 4.31× |
| sort-array | 58408 | 0.017 | 4.37× |
| natural-orderby | 27722 | 0.036 | 9.22× |
| sort-on | 9897 | 0.101 | 25.81× |
| sort-by (different order) | 1224 | 0.818 | 208.81× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 208724 | 0.005 | 1.00× |
| underscore.sortBy | 138496 | 0.007 | 1.51× |
| remeda.sortBy | 97828 | 0.010 | 2.13× |
| just-sort-by | 97695 | 0.010 | 2.14× |
| thenby | 97450 | 0.010 | 2.14× |
| lodash.orderBy | 94201 | 0.011 | 2.22× |
| es-toolkit.orderBy | 90481 | 0.011 | 2.31× |
| fast-sort | 89576 | 0.011 | 2.33× |
| Array.prototype.sort, decorated | 86644 | 0.012 | 2.41× |
| ramda.sortWith | 55339 | 0.018 | 3.77× |
| sort-array | 53390 | 0.019 | 3.91× |
| natural-orderby | 22728 | 0.044 | 9.18× |
| sort-on | 8039 | 0.125 | 25.96× |
| sort-by | 1150 | 0.870 | 181.47× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 135226 | 0.007 | 1.00× |
| underscore.sortBy | 95930 | 0.011 | 1.41× |
| thenby | 89778 | 0.011 | 1.51× |
| remeda.sortBy | 88314 | 0.011 | 1.53× |
| es-toolkit.orderBy | 83671 | 0.012 | 1.62× |
| fast-sort | 79173 | 0.013 | 1.71× |
| lodash.orderBy | 76468 | 0.013 | 1.77× |
| Array.prototype.sort, decorated | 74106 | 0.014 | 1.82× |
| ramda.sortWith | 50447 | 0.020 | 2.68× |
| just-sort-by | 50125 | 0.020 | 2.70× |
| sort-array | 46618 | 0.022 | 2.90× |
| natural-orderby | 16036 | 0.063 | 8.43× |
| sort-on | 7282 | 0.138 | 18.57× |
| sort-by | 1143 | 0.876 | 118.32× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1420203 | 0.001 | 1.00× |
| just-sort-by | 792400 | 0.001 | 1.79× |
| thenby | 702064 | 0.001 | 2.02× |
| remeda.sortBy | 681061 | 0.002 | 2.09× |
| fast-sort | 619333 | 0.002 | 2.29× |
| es-toolkit.orderBy | 617675 | 0.002 | 2.30× |
| Array.prototype.sort, decorated | 556847 | 0.002 | 2.55× |
| underscore.sortBy | 472572 | 0.002 | 3.01× |
| lodash.orderBy | 378897 | 0.003 | 3.75× |
| ramda.sortWith | 359112 | 0.003 | 3.95× |
| sort-array | 335885 | 0.003 | 4.23× |
| sort-on | 48446 | 0.021 | 29.31× |
| natural-orderby | 33628 | 0.030 | 42.23× |
| sort-by | 6371 | 0.157 | 222.90× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1558970 | 0.001 | 1.00× |
| just-sort-by | 771389 | 0.001 | 2.02× |
| thenby | 732889 | 0.001 | 2.13× |
| fast-sort | 675949 | 0.002 | 2.31× |
| es-toolkit.orderBy | 644693 | 0.002 | 2.42× |
| remeda.sortBy | 626315 | 0.002 | 2.49× |
| Array.prototype.sort, decorated | 527562 | 0.002 | 2.96× |
| underscore.sortBy | 442652 | 0.002 | 3.52× |
| ramda.sortWith | 364937 | 0.003 | 4.27× |
| sort-array | 361625 | 0.003 | 4.31× |
| lodash.orderBy | 352898 | 0.003 | 4.42× |
| sort-on | 43049 | 0.023 | 36.21× |
| natural-orderby | 34510 | 0.029 | 45.17× |
| sort-by | 6227 | 0.161 | 250.36× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 156356 | 0.006 | 1.00× |
| remeda.sortBy | 90771 | 0.011 | 1.72× |
| es-toolkit.orderBy | 81182 | 0.012 | 1.93× |
| lodash.orderBy | 80518 | 0.013 | 1.94× |
| Array.prototype.sort, decorated | 79822 | 0.013 | 1.96× |
| thenby | 66579 | 0.015 | 2.35× |
| fast-sort | 62561 | 0.016 | 2.50× |
| ramda.sortWith | 52038 | 0.019 | 3.00× |
| sort-array | 45659 | 0.022 | 3.42× |
| sort-on (different order) | 8432 | 0.119 | 18.54× |
| natural-orderby (different order) | 5710 | 0.175 | 27.38× |
| sort-by | 1235 | 0.811 | 126.63× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 17707 | 0.057 | 1.00× |
| underscore.sortBy | 6280 | 0.160 | 2.82× |
| remeda.sortBy | 4990 | 0.201 | 3.55× |
| thenby | 4949 | 0.202 | 3.58× |
| lodash.orderBy | 4778 | 0.210 | 3.71× |
| es-toolkit.orderBy | 4609 | 0.217 | 3.84× |
| fast-sort | 4598 | 0.218 | 3.85× |
| Array.prototype.sort, decorated | 4523 | 0.221 | 3.91× |
| ramda.sortWith | 3011 | 0.333 | 5.88× |
| sort-array | 2781 | 0.360 | 6.37× |
| just-sort-by (different order) | 2020 | 0.497 | 8.76× |
| natural-orderby (different order) | 1014 | 0.987 | 17.46× |
| sort-on (different order) | 542 | 1.847 | 32.70× |
| sort-by | 77 | 13.015 | 230.33× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12085 | 0.083 | 1.00× |
| underscore.sortBy | 5340 | 0.188 | 2.26× |
| remeda.sortBy | 4612 | 0.217 | 2.62× |
| thenby | 4595 | 0.218 | 2.63× |
| fast-sort | 4260 | 0.235 | 2.84× |
| es-toolkit.orderBy | 4184 | 0.239 | 2.89× |
| Array.prototype.sort, decorated | 4141 | 0.242 | 2.92× |
| lodash.orderBy | 4125 | 0.243 | 2.93× |
| ramda.sortWith | 2906 | 0.345 | 4.16× |
| sort-array | 2508 | 0.400 | 4.82× |
| just-sort-by (different order) | 1972 | 0.509 | 6.13× |
| natural-orderby (different order) | 729 | 1.374 | 16.58× |
| sort-on (different order) | 472 | 2.122 | 25.63× |
| sort-by | 73 | 13.660 | 165.06× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30479 | 0.033 | 1.00× |
| underscore.sortBy (different order) | 9532 | 0.105 | 3.20× |
| thenby (different order) | 6717 | 0.149 | 4.54× |
| remeda.sortBy (different order) | 6692 | 0.150 | 4.55× |
| lodash.orderBy | 6619 | 0.151 | 4.61× |
| just-sort-by (different order) | 6608 | 0.152 | 4.61× |
| fast-sort | 6440 | 0.155 | 4.73× |
| es-toolkit.orderBy | 6309 | 0.159 | 4.83× |
| Array.prototype.sort, decorated | 6204 | 0.161 | 4.91× |
| sort-array | 3773 | 0.265 | 8.08× |
| ramda.sortWith (different order) | 3733 | 0.268 | 8.17× |
| natural-orderby | 2204 | 0.454 | 13.83× |
| sort-on | 618 | 1.620 | 49.35× |
| sort-by (different order) | 78 | 12.762 | 388.67× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 29578 | 0.034 | 1.00× |
| underscore.sortBy | 8357 | 0.120 | 3.54× |
| just-sort-by | 6073 | 0.165 | 4.87× |
| remeda.sortBy | 5998 | 0.167 | 4.93× |
| thenby | 5928 | 0.169 | 4.99× |
| lodash.orderBy | 5614 | 0.179 | 5.27× |
| fast-sort | 5558 | 0.180 | 5.32× |
| es-toolkit.orderBy | 5419 | 0.185 | 5.46× |
| Array.prototype.sort, decorated | 5310 | 0.189 | 5.57× |
| ramda.sortWith | 3469 | 0.289 | 8.53× |
| sort-array | 3280 | 0.305 | 9.02× |
| natural-orderby | 1839 | 0.545 | 16.08× |
| sort-on | 517 | 1.937 | 57.20× |
| sort-by | 74 | 13.569 | 401.27× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12335 | 0.081 | 1.00× |
| underscore.sortBy | 5675 | 0.176 | 2.17× |
| remeda.sortBy | 5090 | 0.197 | 2.42× |
| thenby | 5074 | 0.197 | 2.43× |
| es-toolkit.orderBy | 4626 | 0.216 | 2.67× |
| fast-sort | 4573 | 0.219 | 2.70× |
| Array.prototype.sort, decorated | 4473 | 0.224 | 2.76× |
| lodash.orderBy | 4394 | 0.228 | 2.81× |
| just-sort-by | 3146 | 0.319 | 3.92× |
| ramda.sortWith | 3095 | 0.324 | 3.99× |
| sort-array | 2796 | 0.358 | 4.41× |
| natural-orderby | 1399 | 0.716 | 8.81× |
| sort-on | 435 | 2.304 | 28.34× |
| sort-by | 72 | 13.991 | 172.49× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 131533 | 0.008 | 1.00× |
| just-sort-by | 77978 | 0.013 | 1.69× |
| thenby | 69736 | 0.014 | 1.89× |
| remeda.sortBy | 67741 | 0.015 | 1.94× |
| es-toolkit.orderBy | 63737 | 0.016 | 2.06× |
| fast-sort | 58483 | 0.017 | 2.25× |
| Array.prototype.sort, decorated | 53350 | 0.019 | 2.47× |
| underscore.sortBy | 46735 | 0.022 | 2.81× |
| lodash.orderBy | 38393 | 0.026 | 3.43× |
| ramda.sortWith | 35514 | 0.028 | 3.70× |
| sort-array | 33628 | 0.030 | 3.91× |
| sort-on | 4694 | 0.214 | 28.02× |
| natural-orderby | 3397 | 0.295 | 38.71× |
| sort-by | 661 | 1.515 | 199.01× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 146644 | 0.007 | 1.00× |
| just-sort-by | 77550 | 0.013 | 1.89× |
| thenby | 74032 | 0.014 | 1.98× |
| es-toolkit.orderBy | 66394 | 0.015 | 2.21× |
| remeda.sortBy | 63457 | 0.016 | 2.31× |
| fast-sort | 62977 | 0.016 | 2.33× |
| Array.prototype.sort, decorated | 53665 | 0.019 | 2.73× |
| underscore.sortBy | 43555 | 0.023 | 3.37× |
| lodash.orderBy | 36307 | 0.028 | 4.04× |
| ramda.sortWith | 36218 | 0.028 | 4.05× |
| sort-array | 35667 | 0.028 | 4.11× |
| sort-on | 4189 | 0.240 | 35.00× |
| natural-orderby | 3344 | 0.300 | 43.86× |
| sort-by | 626 | 1.602 | 234.20× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11390 | 0.088 | 1.00× |
| lodash.orderBy | 4475 | 0.224 | 2.55× |
| Array.prototype.sort, decorated | 4421 | 0.227 | 2.58× |
| es-toolkit.orderBy | 4329 | 0.232 | 2.63× |
| remeda.sortBy (different order) | 4034 | 0.248 | 2.82× |
| thenby (different order) | 3726 | 0.269 | 3.06× |
| fast-sort (different order) | 3508 | 0.285 | 3.25× |
| ramda.sortWith (different order) | 2697 | 0.371 | 4.22× |
| sort-array (different order) | 2383 | 0.420 | 4.78× |
| natural-orderby (different order) | 515 | 1.945 | 22.14× |
| sort-on (different order) | 503 | 1.988 | 22.64× |
| sort-by (different order) | 72 | 13.906 | 158.33× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3292 | 0.305 | 1.00× |
| underscore.sortBy | 427 | 2.344 | 7.71× |
| thenby | 358 | 2.792 | 9.19× |
| fast-sort | 336 | 2.980 | 9.80× |
| es-toolkit.orderBy | 330 | 3.034 | 9.98× |
| Array.prototype.sort, decorated | 325 | 3.075 | 10.12× |
| lodash.orderBy | 316 | 3.165 | 10.41× |
| remeda.sortBy | 296 | 3.386 | 11.14× |
| ramda.sortWith | 195 | 5.177 | 16.92× |
| sort-array | 189 | 5.295 | 17.43× |
| just-sort-by (different order) | 158 | 6.313 | 20.78× |
| natural-orderby (different order) | 88 | 11.402 | 37.51× |
| sort-on (different order) | 38 | 26.061 | 85.60× |
| sort-by | 5 | 184.804 | 608.21× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 744 | 1.349 | 1.00× |
| underscore.sortBy | 341 | 2.930 | 2.18× |
| thenby | 306 | 3.267 | 2.43× |
| fast-sort | 290 | 3.444 | 2.56× |
| es-toolkit.orderBy | 281 | 3.567 | 2.65× |
| remeda.sortBy | 270 | 3.706 | 2.76× |
| Array.prototype.sort, decorated | 268 | 3.741 | 2.77× |
| lodash.orderBy | 261 | 3.827 | 2.85× |
| ramda.sortWith | 191 | 5.238 | 3.90× |
| sort-array | 169 | 5.933 | 4.42× |
| just-sort-by (different order) | 148 | 6.777 | 5.04× |
| natural-orderby (different order) | 57 | 17.411 | 12.95× |
| sort-on (different order) | 34 | 29.838 | 22.17× |
| sort-by | 5 | 191.403 | 142.44× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3763 | 0.267 | 1.00× |
| underscore.sortBy (different order) | 703 | 1.423 | 5.35× |
| thenby (different order) | 498 | 2.009 | 7.56× |
| just-sort-by (different order) | 496 | 2.018 | 7.59× |
| fast-sort | 486 | 2.060 | 7.74× |
| lodash.orderBy | 478 | 2.092 | 7.87× |
| Array.prototype.sort, decorated | 462 | 2.166 | 8.15× |
| es-toolkit.orderBy | 461 | 2.171 | 8.16× |
| remeda.sortBy (different order) | 420 | 2.385 | 8.96× |
| ramda.sortWith (different order) | 259 | 3.869 | 14.55× |
| sort-array | 250 | 4.003 | 15.06× |
| natural-orderby | 183 | 5.475 | 20.59× |
| sort-on | 43 | 23.216 | 87.12× |
| sort-by (different order) | 6 | 177.391 | 667.47× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3574 | 0.281 | 1.00× |
| underscore.sortBy | 599 | 1.671 | 5.96× |
| just-sort-by | 441 | 2.272 | 8.11× |
| thenby | 440 | 2.273 | 8.12× |
| fast-sort | 407 | 2.462 | 8.79× |
| es-toolkit.orderBy | 400 | 2.504 | 8.95× |
| remeda.sortBy | 398 | 2.516 | 8.99× |
| lodash.orderBy | 396 | 2.527 | 9.02× |
| Array.prototype.sort, decorated | 383 | 2.613 | 9.33× |
| ramda.sortWith | 231 | 4.345 | 15.49× |
| sort-array | 221 | 4.525 | 16.17× |
| natural-orderby | 145 | 6.896 | 24.62× |
| sort-on | 37 | 27.042 | 96.36× |
| sort-by | 5 | 188.265 | 672.82× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 735 | 1.367 | 1.00× |
| underscore.sortBy | 379 | 2.640 | 1.94× |
| thenby | 340 | 2.948 | 2.16× |
| fast-sort | 325 | 3.077 | 2.26× |
| Array.prototype.sort, decorated | 318 | 3.145 | 2.31× |
| es-toolkit.orderBy | 317 | 3.157 | 2.32× |
| remeda.sortBy | 298 | 3.353 | 2.46× |
| lodash.orderBy | 294 | 3.405 | 2.50× |
| just-sort-by | 226 | 4.447 | 3.26× |
| ramda.sortWith | 203 | 4.935 | 3.63× |
| sort-array | 186 | 5.373 | 3.95× |
| natural-orderby | 114 | 8.744 | 6.42× |
| sort-on | 33 | 30.452 | 22.36× |
| sort-by | 5 | 192.200 | 141.22× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13531 | 0.075 | 1.00× |
| just-sort-by | 7769 | 0.129 | 1.74× |
| thenby | 7088 | 0.141 | 1.91× |
| es-toolkit.orderBy | 6321 | 0.158 | 2.14× |
| fast-sort | 6281 | 0.160 | 2.15× |
| remeda.sortBy | 6184 | 0.162 | 2.19× |
| Array.prototype.sort, decorated | 5419 | 0.185 | 2.50× |
| underscore.sortBy | 4675 | 0.215 | 2.89× |
| lodash.orderBy | 3792 | 0.268 | 3.57× |
| ramda.sortWith | 3219 | 0.311 | 4.20× |
| sort-array | 3165 | 0.316 | 4.28× |
| sort-on | 465 | 2.154 | 29.09× |
| natural-orderby | 313 | 3.195 | 43.21× |
| sort-by | 64 | 15.661 | 211.87× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 15695 | 0.064 | 1.00× |
| just-sort-by | 7767 | 0.129 | 2.02× |
| thenby | 7278 | 0.138 | 2.16× |
| fast-sort | 6472 | 0.155 | 2.43× |
| es-toolkit.orderBy | 6056 | 0.166 | 2.59× |
| Array.prototype.sort, decorated | 5434 | 0.185 | 2.89× |
| remeda.sortBy | 5093 | 0.197 | 3.08× |
| underscore.sortBy | 4474 | 0.225 | 3.51× |
| lodash.orderBy | 3347 | 0.302 | 4.69× |
| ramda.sortWith | 3256 | 0.308 | 4.82× |
| sort-array | 3192 | 0.314 | 4.92× |
| sort-on | 432 | 2.319 | 36.37× |
| natural-orderby | 315 | 3.176 | 49.81× |
| sort-by | 63 | 16.012 | 251.07× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1373 | 0.731 | 1.00× |
| Array.prototype.sort, decorated | 288 | 3.471 | 4.76× |
| es-toolkit.orderBy | 283 | 3.532 | 4.85× |
| lodash.orderBy | 283 | 3.538 | 4.85× |
| remeda.sortBy (different order) | 263 | 3.810 | 5.22× |
| thenby (different order) | 250 | 4.000 | 5.49× |
| fast-sort (different order) | 233 | 4.297 | 5.90× |
| ramda.sortWith (different order) | 180 | 5.545 | 7.61× |
| sort-array (different order) | 159 | 6.292 | 8.64× |
| natural-orderby (different order) | 44 | 22.974 | 31.52× |
| sort-on (different order) | 33 | 30.094 | 41.31× |
| sort-by (different order) | 4 | 226.499 | 310.82× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 286 | 3.513 | 1.00× |
| underscore.sortBy | 34 | 29.790 | 8.50× |
| thenby | 30 | 32.947 | 9.43× |
| fast-sort | 28 | 35.375 | 10.12× |
| es-toolkit.orderBy | 27 | 36.641 | 10.46× |
| Array.prototype.sort, decorated | 26 | 39.207 | 11.20× |
| remeda.sortBy | 25 | 40.628 | 11.62× |
| lodash.orderBy | 24 | 41.344 | 11.79× |
| ramda.sortWith | 17 | 57.316 | 16.40× |
| sort-array | 16 | 63.525 | 18.16× |
| just-sort-by (different order) | 13 | 78.613 | 22.45× |
| natural-orderby (different order) | 7 | 138.112 | 39.47× |
| sort-on (different order) | 3 | 311.035 | 88.85× |
| sort-by | 0 | 2061.692 | 589.87× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 332 | 3.058 | 1.00× |
| underscore.sortBy (different order) | 53 | 18.844 | 6.24× |
| thenby (different order) | 39 | 25.793 | 8.55× |
| just-sort-by (different order) | 38 | 26.204 | 8.69× |
| fast-sort | 36 | 27.572 | 9.14× |
| es-toolkit.orderBy | 35 | 28.793 | 9.54× |
| remeda.sortBy (different order) | 33 | 30.544 | 10.13× |
| Array.prototype.sort, decorated | 32 | 31.378 | 10.37× |
| lodash.orderBy | 32 | 31.397 | 10.39× |
| ramda.sortWith (different order) | 19 | 51.955 | 17.22× |
| sort-array | 19 | 53.237 | 17.64× |
| natural-orderby | 13 | 78.861 | 26.13× |
| sort-on | 3 | 298.479 | 98.90× |
| sort-by (different order) | 0 | 2182.274 | 723.79× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 92 | 10.935 | 1.00× |
| es-toolkit.orderBy | 19 | 53.575 | 4.90× |
| remeda.sortBy (different order) | 17 | 57.316 | 5.25× |
| thenby (different order) | 17 | 57.469 | 5.26× |
| Array.prototype.sort, decorated | 17 | 57.851 | 5.26× |
| lodash.orderBy | 17 | 58.533 | 5.35× |
| fast-sort (different order) | 14 | 71.918 | 6.57× |
| ramda.sortWith (different order) | 12 | 85.782 | 7.85× |
| sort-array (different order) | 11 | 92.463 | 8.45× |
| natural-orderby (different order) | 4 | 281.212 | 25.72× |
| sort-on (different order) | 2 | 451.926 | 41.32× |
| sort-by (different order) | 0 | 3292.502 | 301.42× |

</details>

<!-- bench:end -->

### Browsers

Same data, Chromium, WebKit and Firefox via Playwright (`pnpm bench:browsers`), 1k and 10k rows, each result checked against lodash before timing, best competitor per case. Apple M5 Max.

#### Chromium 149.0.7827.55

| case | fast-multisort ms | runner-up | runner-up ms | lead |
|---|---:|---|---:|---:|
| 1,000 rows, string key, 10 distinct values | 0.050 | thenby | 0.084 | 1.68× |
| 1,000 rows, string key, all unique | 0.071 | lodash.orderBy | 0.189 | 2.64× |
| 1,000 rows, integer key, 10% null | 0.035 | thenby | 0.152 | 4.38× |
| 1,000 rows, float key | 0.037 | remeda.sortBy | 0.170 | 4.63× |
| 1,000 rows, ISO date string key | 0.070 | thenby | 0.188 | 2.69× |
| 1,000 rows, already sorted integer key | 0.009 | thenby | 0.014 | 1.52× |
| 1,000 rows, three keys, mixed directions | 0.091 | es-toolkit.orderBy | 0.208 | 2.28× |
| 10,000 rows, string key, 10 distinct values | 0.330 | thenby | 2.570 | 7.79× |
| 10,000 rows, string key, all unique | 1.070 | thenby | 3.077 | 2.88× |
| 10,000 rows, integer key, 10% null | 0.287 | thenby | 2.007 | 7.00× |
| 10,000 rows, float key | 0.307 | thenby | 2.377 | 7.75× |
| 10,000 rows, ISO date string key | 1.250 | thenby | 2.697 | 2.16× |
| 10,000 rows, already sorted integer key | 0.087 | thenby | 0.137 | 1.58× |
| 10,000 rows, three keys, mixed directions | 0.813 | es-toolkit.orderBy | 3.123 | 3.84× |

#### WebKit 26.5

| case | fast-multisort ms | runner-up | runner-up ms | lead |
|---|---:|---|---:|---:|
| 1,000 rows, string key, 10 distinct values | 0.060 | thenby | 0.087 | 1.44× |
| 1,000 rows, string key, all unique | 0.073 | thenby | 0.093 | 1.27× |
| 1,000 rows, integer key, 10% null | 0.027 | thenby | 0.073 | 2.75× |
| 1,000 rows, float key | 0.027 | thenby | 0.100 | 3.75× |
| 1,000 rows, ISO date string key | 0.070 | thenby | 0.137 | 1.95× |
| 1,000 rows, already sorted integer key | 0.003 | thenby | 0.007 | 2.00× |
| 1,000 rows, three keys, mixed directions | 0.073 | es-toolkit.orderBy | 0.160 | 2.18× |
| 10,000 rows, string key, 10 distinct values | 0.300 | thenby | 2.067 | 6.89× |
| 10,000 rows, string key, all unique | 0.967 | thenby | 2.133 | 2.21× |
| 10,000 rows, integer key, 10% null | 0.233 | remeda.sortBy | 1.300 | 5.57× |
| 10,000 rows, float key | 0.233 | thenby | 1.667 | 7.14× |
| 10,000 rows, ISO date string key | 1.067 | thenby | 2.367 | 2.22× |
| 10,000 rows, already sorted integer key | 0.033 | thenby | 0.067 | 2.00× |
| 10,000 rows, three keys, mixed directions | 0.533 | thenby | 2.600 | 4.88× |

Run `pnpm bench` (or `pnpm bench --quick` for 10k rows only) to reproduce; `pnpm bench:readme` rewrites the tables above. What each competitor does and which of their ideas ended up in here: [benchmark/COMPETITORS.md](benchmark/COMPETITORS.md).

The honest footnote: at a hundred rows a sort takes a few microseconds and the margins are small, and on inputs that are already in order every library is linear, so the lead there is a pass-through against a native sort. From a thousand rows up the closest anyone gets is about 1.9×. The table is the only argument, and the script above regenerates it from scratch.

## How

Numbers go through a stable radix sort on their float64 bits, strings through buckets and a radix sort over the characters that actually differ, ties recurse into the next rule, and anything exotic falls back to the lodash comparator so the order stays identical to lodash. Inputs that are already in order are passed through. The rest is bookkeeping.

## License

MIT
