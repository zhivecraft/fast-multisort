# What each competitor does, and what was taken from it

Every library in `benchmark/index.js` was read, not just run. "Taken" means the idea is now in `src/index.ts`; "no" means it never beat fast-multisort on any case, so there was nothing to transplant.

| library | how it sorts | ever faster? | taken |
|---|---|---|---|
| thenby | native `sort` with a composed comparator; linear on presorted input via TimSort | yes, presorted inputs | pass-through of ordered single columns (copy or reverse) |
| fast-sort | native `sort` with a generated comparator per key | yes, presorted inputs | same as above |
| just-sort-by | copy + native `sort`, uppercases strings per compare | yes, presorted inputs | same as above |
| remeda.sortBy | copy + native `sort`, comparator calls each key function per compare | yes, arrays of ~100 short strings | no precomputation on tiny arrays; its comparator shape was tried and then beaten by bucketing on the first differing character |
| underscore.sortBy | decorate (criteria objects) → `sort` → undecorate | yes, ~100-row numeric keys in one run | typed-key comparator for tiny numeric columns |
| es-toolkit.orderBy | decorated comparator chain, lodash-compatible | no | — |
| lodash.orderBy | criteria objects + `compareMultiple`, lodash is the oracle for the tests | no | its comparator chain is kept verbatim for heterogeneous columns so results match bit for bit |
| ramda.sortWith | composed `ascend`/`descend` comparators, curried | no | — |
| sort-array | property paths, computed fields, custom orders; comparator per compare | no | — |
| sort-on | `dot-prop` paths with `-` prefix for desc | no | — |
| sort-by | `object-path` lookups inside the comparator | no | — |
| natural-orderby | natural (chunked numeric) comparison per compare | no, and it answers a different question | — |
| Array.prototype.sort, decorated | the reference "do it by hand" baseline | no | — |

Ideas that came from nowhere in particular: LSD radix on float64 bits for numeric columns, MSD radix over the first eight differing character positions for large sets of distinct strings, rank counting for low-cardinality tiny columns, and column-wise recursion inside tie buckets.
