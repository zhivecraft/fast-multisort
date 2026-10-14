
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

Apple M5 Max, 18 cores, 128 GB, Darwin 27.2.0, Node v24.21.0
