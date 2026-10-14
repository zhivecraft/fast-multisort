
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

Apple M5 Max, 18 cores, 128 GB, Darwin 27.2.0, Node v24.22.0
