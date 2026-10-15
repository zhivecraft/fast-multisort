### Chromium 156.0.8078.4

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 345210206 | 0.000 | 0.42× |
| fast-multisort | 145635555 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 107546256 | 0.000 | 1.35× |
| es-toolkit.orderBy | 88115630 | 0.000 | 1.65× |
| sort-on | 88115630 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 64927306 | 0.000 | 2.24× |
| thenby | 48099816 | 0.000 | 3.03× |
| inline comparator chain, toSorted() | 37991884 | 0.000 | 3.83× |
| ramda.sortWith | 37183546 | 0.000 | 3.92× |
| sort-by | 32768000 | 0.000 | 4.44× |
| underscore.sortBy | 32564472 | 0.000 | 4.47× |
| remeda.sortBy | 32463653 | 0.000 | 4.49× |
| fast-sort | 31871611 | 0.000 | 4.57× |
| sort-array | 31488769 | 0.000 | 4.62× |
| lodash.orderBy | 24160737 | 0.000 | 6.03× |
| natural-orderby | 4783650 | 0.000 | 30.44× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 280555451 | 0.000 | 0.48× |
| fast-multisort | 134432821 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 101803495 | 0.000 | 1.32× |
| sort-on | 84562581 | 0.000 | 1.59× |
| es-toolkit.orderBy | 81284961 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 62415238 | 0.000 | 2.15× |
| thenby | 46397168 | 0.000 | 2.90× |
| inline comparator chain, toSorted() | 36921690 | 0.000 | 3.64× |
| ramda.sortWith | 35910137 | 0.000 | 3.74× |
| remeda.sortBy | 31968780 | 0.000 | 4.21× |
| fast-sort | 31679033 | 0.000 | 4.24× |
| sort-array | 31394491 | 0.000 | 4.28× |
| sort-by | 30393507 | 0.000 | 4.42× |
| underscore.sortBy | 29454382 | 0.000 | 4.56× |
| lodash.orderBy | 20010992 | 0.000 | 6.72× |
| natural-orderby | 1985939 | 0.001 | 67.69× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 282444714 | 0.000 | 0.48× |
| fast-multisort | 136178701 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 102801569 | 0.000 | 1.32× |
| sort-on | 84562581 | 0.000 | 1.61× |
| es-toolkit.orderBy | 81920000 | 0.000 | 1.66× |
| Array.prototype.sort, decorated | 62788982 | 0.000 | 2.17× |
| thenby | 46603378 | 0.000 | 2.92× |
| inline comparator chain, toSorted() | 37449143 | 0.000 | 3.64× |
| ramda.sortWith | 35910137 | 0.000 | 3.79× |
| remeda.sortBy | 32263877 | 0.000 | 4.22× |
| fast-sort | 31775030 | 0.000 | 4.29× |
| sort-array | 31488769 | 0.000 | 4.32× |
| sort-by | 30393507 | 0.000 | 4.48× |
| underscore.sortBy | 29789091 | 0.000 | 4.57× |
| lodash.orderBy | 20164923 | 0.000 | 6.75× |
| natural-orderby | 3610799 | 0.000 | 37.71× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 279620267 | 0.000 | 0.49× |
| fast-multisort | 136178701 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 102300098 | 0.000 | 1.33× |
| sort-on | 84562581 | 0.000 | 1.61× |
| es-toolkit.orderBy | 81920000 | 0.000 | 1.66× |
| Array.prototype.sort, decorated | 62788982 | 0.000 | 2.17× |
| thenby | 46603378 | 0.000 | 2.92× |
| inline comparator chain, toSorted() | 37315872 | 0.000 | 3.65× |
| ramda.sortWith | 35910137 | 0.000 | 3.79× |
| remeda.sortBy | 32263877 | 0.000 | 4.22× |
| fast-sort | 31775030 | 0.000 | 4.29× |
| sort-array | 31583614 | 0.000 | 4.31× |
| sort-by | 30481860 | 0.000 | 4.47× |
| underscore.sortBy | 29127111 | 0.000 | 4.68× |
| lodash.orderBy | 19710075 | 0.000 | 6.91× |
| natural-orderby | 3268628 | 0.000 | 41.66× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 275941053 | 0.000 | 0.49× |
| fast-multisort | 135300129 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 102300098 | 0.000 | 1.32× |
| sort-on | 84904939 | 0.000 | 1.59× |
| es-toolkit.orderBy | 82241255 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 62601552 | 0.000 | 2.16× |
| thenby | 46397168 | 0.000 | 2.92× |
| inline comparator chain, toSorted() | 37052155 | 0.000 | 3.65× |
| ramda.sortWith | 36157793 | 0.000 | 3.74× |
| remeda.sortBy | 32263877 | 0.000 | 4.19× |
| fast-sort | 31968780 | 0.000 | 4.23× |
| sort-array | 31488769 | 0.000 | 4.30× |
| sort-by | 30305665 | 0.000 | 4.46× |
| underscore.sortBy | 29789091 | 0.000 | 4.54× |
| lodash.orderBy | 20087663 | 0.000 | 6.74× |
| natural-orderby | 2229116 | 0.000 | 60.70× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 275941053 | 0.000 | 0.49× |
| fast-multisort | 136178701 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 102801569 | 0.000 | 1.32× |
| sort-on | 85598041 | 0.000 | 1.59× |
| es-toolkit.orderBy | 82891383 | 0.000 | 1.64× |
| Array.prototype.sort, decorated | 63167229 | 0.000 | 2.16× |
| thenby | 46603378 | 0.000 | 2.92× |
| inline comparator chain, toSorted() | 37449143 | 0.000 | 3.64× |
| ramda.sortWith | 36282907 | 0.000 | 3.75× |
| remeda.sortBy | 32463653 | 0.000 | 4.19× |
| fast-sort | 32164908 | 0.000 | 4.23× |
| sort-array | 31679033 | 0.000 | 4.30× |
| sort-by | 30481860 | 0.000 | 4.47× |
| underscore.sortBy | 29959314 | 0.000 | 4.55× |
| lodash.orderBy | 20321240 | 0.000 | 6.70× |
| natural-orderby | 4020613 | 0.000 | 33.87× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 278691296 | 0.000 | 0.49× |
| fast-multisort | 137518164 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 103307980 | 0.000 | 1.33× |
| sort-on | 85948852 | 0.000 | 1.60× |
| es-toolkit.orderBy | 82565039 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 63550061 | 0.000 | 2.16× |
| thenby | 47021345 | 0.000 | 2.92× |
| inline comparator chain, toSorted() | 37583369 | 0.000 | 3.66× |
| ramda.sortWith | 36408889 | 0.000 | 3.78× |
| remeda.sortBy | 32665919 | 0.000 | 4.21× |
| fast-sort | 32263877 | 0.000 | 4.26× |
| sort-array | 31968780 | 0.000 | 4.30× |
| sort-by | 30750029 | 0.000 | 4.47× |
| underscore.sortBy | 30045158 | 0.000 | 4.58× |
| lodash.orderBy | 20321240 | 0.000 | 6.77× |
| natural-orderby | 4096000 | 0.000 | 33.57× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 277768477 | 0.000 | 0.49× |
| fast-multisort | 137068758 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 102801569 | 0.000 | 1.33× |
| sort-on | 85598041 | 0.000 | 1.60× |
| es-toolkit.orderBy | 82891383 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 63167229 | 0.000 | 2.17× |
| thenby | 46811429 | 0.000 | 2.93× |
| inline comparator chain, toSorted() | 37449143 | 0.000 | 3.66× |
| ramda.sortWith | 36535749 | 0.000 | 3.75× |
| remeda.sortBy | 32665919 | 0.000 | 4.20× |
| fast-sort | 32363457 | 0.000 | 4.24× |
| sort-array | 31775030 | 0.000 | 4.31× |
| sort-by | 30481860 | 0.000 | 4.50× |
| underscore.sortBy | 29371877 | 0.000 | 4.67× |
| lodash.orderBy | 20010992 | 0.000 | 6.85× |
| natural-orderby | 3404468 | 0.000 | 40.26× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 135737994 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 101803495 | 0.000 | 1.33× |
| sort-on | 84904939 | 0.000 | 1.60× |
| es-toolkit.orderBy | 82241255 | 0.000 | 1.65× |
| Array.prototype.sort, decorated | 62788982 | 0.000 | 2.16× |
| inline comparator chain, toSorted() | 37052155 | 0.000 | 3.66× |
| sort-array | 31679033 | 0.000 | 4.28× |
| sort-by | 26817801 | 0.000 | 5.06× |
| ramda.sortWith | 21487213 | 0.000 | 6.32× |
| remeda.sortBy | 17593557 | 0.000 | 7.72× |
| lodash.orderBy | 15839517 | 0.000 | 8.57× |
| thenby | 13906844 | 0.000 | 9.76× |
| fast-sort | 7598377 | 0.000 | 17.86× |
| natural-orderby | 1110780 | 0.001 | 122.20× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7426176 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 5306559 | 0.000 | 1.40× |
| inline comparator chain, slice().sort() | 5080310 | 0.000 | 1.46× |
| thenby | 4473447 | 0.000 | 1.66× |
| Array.prototype.sort, decorated | 4241812 | 0.000 | 1.75× |
| remeda.sortBy | 4161016 | 0.000 | 1.78× |
| es-toolkit.orderBy | 4134763 | 0.000 | 1.80× |
| fast-sort | 3777291 | 0.000 | 1.97× |
| underscore.sortBy | 3120762 | 0.000 | 2.38× |
| ramda.sortWith | 2912711 | 0.000 | 2.55× |
| sort-array | 2912711 | 0.000 | 2.55× |
| lodash.orderBy | 2252096 | 0.000 | 3.30× |
| just-sort-by (different order) | 1552986 | 0.001 | 4.78× |
| natural-orderby (different order) | 390095 | 0.003 | 19.04× |
| sort-on (different order) | 298978 | 0.003 | 24.84× |
| sort-by | 38209 | 0.026 | 194.36× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4664484 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 3855059 | 0.000 | 1.21× |
| inline comparator chain, slice().sort() | 3799188 | 0.000 | 1.23× |
| thenby | 2696955 | 0.000 | 1.73× |
| remeda.sortBy | 2664065 | 0.000 | 1.75× |
| es-toolkit.orderBy | 2570039 | 0.000 | 1.81× |
| fast-sort | 2445373 | 0.000 | 1.91× |
| underscore.sortBy | 2340571 | 0.000 | 1.99× |
| ramda.sortWith | 2041620 | 0.000 | 2.28× |
| Array.prototype.sort, decorated | 2010307 | 0.000 | 2.32× |
| lodash.orderBy | 1795507 | 0.001 | 2.60× |
| just-sort-by | 1236528 | 0.001 | 3.77× |
| sort-array | 1195912 | 0.001 | 3.90× |
| sort-on | 236763 | 0.004 | 19.70× |
| natural-orderby | 143719 | 0.007 | 32.46× |
| sort-by | 35804 | 0.028 | 130.28× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7511289 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 6301538 | 0.000 | 1.19× |
| inline comparator chain, slice().sort() | 6211943 | 0.000 | 1.21× |
| just-sort-by (different order) | 4311579 | 0.000 | 1.74× |
| thenby (different order) | 3523441 | 0.000 | 2.13× |
| es-toolkit.orderBy | 3467513 | 0.000 | 2.17× |
| remeda.sortBy (different order) | 3335165 | 0.000 | 2.25× |
| fast-sort | 3105972 | 0.000 | 2.42× |
| underscore.sortBy (different order) | 3091321 | 0.000 | 2.43× |
| Array.prototype.sort, decorated | 2719336 | 0.000 | 2.76× |
| ramda.sortWith (different order) | 2600635 | 0.000 | 2.89× |
| lodash.orderBy | 2170066 | 0.000 | 3.46× |
| sort-array | 1552986 | 0.001 | 4.84× |
| natural-orderby | 384601 | 0.003 | 19.53× |
| sort-on | 337119 | 0.003 | 22.28× |
| sort-by (different order) | 41796 | 0.024 | 179.71× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 6636557 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 5698783 | 0.000 | 1.16× |
| inline comparator chain, slice().sort() | 5371803 | 0.000 | 1.24× |
| just-sort-by | 3196878 | 0.000 | 2.08× |
| thenby | 2837056 | 0.000 | 2.34× |
| remeda.sortBy | 2800684 | 0.000 | 2.37× |
| underscore.sortBy | 2788766 | 0.000 | 2.38× |
| es-toolkit.orderBy | 2719336 | 0.000 | 2.44× |
| fast-sort | 2348961 | 0.000 | 2.83× |
| Array.prototype.sort, decorated | 2177276 | 0.000 | 3.05× |
| ramda.sortWith | 2016492 | 0.000 | 3.29× |
| lodash.orderBy | 1830615 | 0.001 | 3.63× |
| sort-array | 1149754 | 0.001 | 5.77× |
| natural-orderby | 328996 | 0.003 | 20.17× |
| sort-on | 246747 | 0.004 | 26.90× |
| sort-by | 34247 | 0.029 | 193.78× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5060695 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4697921 | 0.000 | 1.08× |
| inline comparator chain, slice().sort() | 4599018 | 0.000 | 1.10× |
| thenby | 2899823 | 0.000 | 1.75× |
| es-toolkit.orderBy | 2800684 | 0.000 | 1.81× |
| remeda.sortBy | 2708099 | 0.000 | 1.87× |
| fast-sort | 2418303 | 0.000 | 2.09× |
| underscore.sortBy | 2348961 | 0.000 | 2.15× |
| Array.prototype.sort, decorated | 2252096 | 0.000 | 2.25× |
| ramda.sortWith | 2221559 | 0.000 | 2.28× |
| just-sort-by | 1968048 | 0.001 | 2.57× |
| lodash.orderBy | 1733757 | 0.001 | 2.92× |
| sort-array | 1305498 | 0.001 | 3.88× |
| sort-on | 241652 | 0.004 | 20.94× |
| natural-orderby | 222609 | 0.004 | 22.73× |
| sort-by | 38496 | 0.026 | 131.46× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14644916 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 9328968 | 0.000 | 1.57× |
| inline comparator chain, slice().sort() | 9039448 | 0.000 | 1.62× |
| just-sort-by | 4766255 | 0.000 | 3.07× |
| remeda.sortBy | 3996098 | 0.000 | 3.66× |
| thenby | 3832515 | 0.000 | 3.82× |
| es-toolkit.orderBy | 3651031 | 0.000 | 4.01× |
| underscore.sortBy | 3651031 | 0.000 | 4.01× |
| fast-sort | 3165990 | 0.000 | 4.63× |
| Array.prototype.sort, decorated | 2978909 | 0.000 | 4.92× |
| ramda.sortWith | 2753613 | 0.000 | 5.32× |
| lodash.orderBy | 2501374 | 0.000 | 5.85× |
| sort-array | 1715602 | 0.001 | 8.54× |
| natural-orderby | 434589 | 0.002 | 33.70× |
| sort-on | 327680 | 0.003 | 44.69× |
| sort-by | 43207 | 0.023 | 338.95× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14131752 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 6012477 | 0.000 | 2.35× |
| inline comparator chain, slice().sort() | 5877668 | 0.000 | 2.40× |
| just-sort-by | 3630803 | 0.000 | 3.89× |
| thenby | 3150769 | 0.000 | 4.49× |
| es-toolkit.orderBy | 2925714 | 0.000 | 4.83× |
| remeda.sortBy | 2849391 | 0.000 | 4.96× |
| underscore.sortBy | 2730667 | 0.000 | 5.18× |
| fast-sort | 2510958 | 0.000 | 5.63× |
| Array.prototype.sort, decorated | 2409412 | 0.000 | 5.87× |
| ramda.sortWith | 2073924 | 0.000 | 6.81× |
| lodash.orderBy | 1851299 | 0.001 | 7.63× |
| sort-array | 1348477 | 0.001 | 10.48× |
| natural-orderby | 415838 | 0.002 | 33.98× |
| sort-on | 226298 | 0.004 | 62.45× |
| sort-by | 32405 | 0.031 | 436.10× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 7489829 | 0.000 | 0.99× |
| fast-multisort | 7405198 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 7162404 | 0.000 | 1.03× |
| just-sort-by | 3671485 | 0.000 | 2.02× |
| underscore.sortBy | 3212549 | 0.000 | 2.31× |
| remeda.sortBy | 3135694 | 0.000 | 2.36× |
| thenby | 3091321 | 0.000 | 2.40× |
| es-toolkit.orderBy | 2978909 | 0.000 | 2.49× |
| Array.prototype.sort, decorated | 2642581 | 0.000 | 2.80× |
| fast-sort | 2621440 | 0.000 | 2.82× |
| ramda.sortWith | 2332242 | 0.000 | 3.18× |
| lodash.orderBy | 2120906 | 0.000 | 3.49× |
| sort-array | 1400342 | 0.001 | 5.29× |
| natural-orderby | 415838 | 0.002 | 17.81× |
| sort-on | 313870 | 0.003 | 23.59× |
| sort-by | 39690 | 0.025 | 186.58× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4872565 | 0.000 | 0.44× |
| inline comparator chain, toSorted() | 4872565 | 0.000 | 0.44× |
| es-toolkit.orderBy | 2520615 | 0.000 | 0.85× |
| fast-multisort | 2141699 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 2100513 | 0.000 | 1.02× |
| remeda.sortBy (different order) | 2087134 | 0.000 | 1.03× |
| thenby (different order) | 1846085 | 0.001 | 1.16× |
| ramda.sortWith (different order) | 1790601 | 0.001 | 1.20× |
| lodash.orderBy | 1560381 | 0.001 | 1.37× |
| fast-sort (different order) | 1538404 | 0.001 | 1.39× |
| sort-array (different order) | 986988 | 0.001 | 2.17× |
| sort-on (different order) | 252062 | 0.004 | 8.50× |
| natural-orderby (different order) | 110404 | 0.009 | 19.40× |
| sort-by (different order) | 33355 | 0.030 | 64.21× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 427781 | 0.002 | 1.00× |
| inline comparator chain, toSorted() | 248997 | 0.004 | 1.72× |
| inline comparator chain, slice().sort() | 246006 | 0.004 | 1.74× |
| underscore.sortBy | 152268 | 0.007 | 2.81× |
| thenby | 125644 | 0.008 | 3.40× |
| fast-sort | 112219 | 0.009 | 3.81× |
| es-toolkit.orderBy | 106945 | 0.009 | 4.00× |
| lodash.orderBy | 105296 | 0.009 | 4.06× |
| Array.prototype.sort, decorated | 98937 | 0.010 | 4.32× |
| remeda.sortBy | 88658 | 0.011 | 4.83× |
| ramda.sortWith | 78769 | 0.013 | 5.43× |
| just-sort-by (different order) | 55804 | 0.018 | 7.67× |
| sort-array | 48762 | 0.021 | 8.77× |
| natural-orderby (different order) | 30029 | 0.033 | 14.25× |
| sort-on (different order) | 12549 | 0.080 | 34.09× |
| sort-by | 1584 | 0.631 | 270.04× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 201773 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 167184 | 0.006 | 1.21× |
| inline comparator chain, slice().sort() | 166504 | 0.006 | 1.21× |
| thenby | 101891 | 0.010 | 1.98× |
| underscore.sortBy | 93945 | 0.011 | 2.15× |
| fast-sort | 92252 | 0.011 | 2.19× |
| es-toolkit.orderBy | 90619 | 0.011 | 2.23× |
| remeda.sortBy | 76418 | 0.013 | 2.64× |
| Array.prototype.sort, decorated | 76134 | 0.013 | 2.65× |
| lodash.orderBy | 71111 | 0.014 | 2.84× |
| ramda.sortWith | 68040 | 0.015 | 2.97× |
| just-sort-by (different order) | 46758 | 0.021 | 4.32× |
| sort-array | 39234 | 0.025 | 5.14× |
| natural-orderby (different order) | 11034 | 0.091 | 18.29× |
| sort-on (different order) | 9697 | 0.103 | 20.81× |
| sort-by | 1502 | 0.666 | 134.31× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 274899 | 0.004 | 0.92× |
| inline comparator chain, slice().sort() | 267712 | 0.004 | 0.94× |
| fast-multisort | 252840 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 161260 | 0.006 | 1.57× |
| just-sort-by (different order) | 150037 | 0.007 | 1.69× |
| fast-sort | 126811 | 0.008 | 1.99× |
| thenby (different order) | 124878 | 0.008 | 2.02× |
| es-toolkit.orderBy | 117364 | 0.009 | 2.15× |
| remeda.sortBy (different order) | 104757 | 0.010 | 2.41× |
| lodash.orderBy | 102400 | 0.010 | 2.47× |
| Array.prototype.sort, decorated | 100887 | 0.010 | 2.51× |
| ramda.sortWith (different order) | 80630 | 0.012 | 3.14× |
| sort-array | 50693 | 0.020 | 4.99× |
| natural-orderby | 32821 | 0.030 | 7.70× |
| sort-on | 13028 | 0.077 | 19.41× |
| sort-by (different order) | 1592 | 0.628 | 158.81× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 260063 | 0.004 | 0.82× |
| inline comparator chain, slice().sort() | 238834 | 0.004 | 0.89× |
| fast-multisort | 212228 | 0.005 | 1.00× |
| underscore.sortBy | 150588 | 0.007 | 1.41× |
| just-sort-by | 111304 | 0.009 | 1.91× |
| thenby | 109227 | 0.009 | 1.94× |
| fast-sort | 98937 | 0.010 | 2.15× |
| es-toolkit.orderBy | 98462 | 0.010 | 2.16× |
| remeda.sortBy | 94378 | 0.011 | 2.25× |
| lodash.orderBy | 90220 | 0.011 | 2.35× |
| Array.prototype.sort, decorated | 87521 | 0.011 | 2.42× |
| ramda.sortWith | 72883 | 0.014 | 2.91× |
| sort-array | 47189 | 0.021 | 4.50× |
| natural-orderby | 28055 | 0.036 | 7.56× |
| sort-on | 11278 | 0.089 | 18.82× |
| sort-by | 1538 | 0.650 | 137.95× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 205829 | 0.005 | 0.73× |
| inline comparator chain, slice().sort() | 198835 | 0.005 | 0.75× |
| fast-multisort | 149489 | 0.007 | 1.00× |
| thenby | 112219 | 0.009 | 1.33× |
| underscore.sortBy | 111003 | 0.009 | 1.35× |
| fast-sort | 101891 | 0.010 | 1.47× |
| es-toolkit.orderBy | 99902 | 0.010 | 1.50× |
| Array.prototype.sort, decorated | 89043 | 0.011 | 1.68× |
| remeda.sortBy | 88276 | 0.011 | 1.69× |
| lodash.orderBy | 77283 | 0.013 | 1.93× |
| ramda.sortWith | 73143 | 0.014 | 2.04× |
| just-sort-by | 67148 | 0.015 | 2.23× |
| sort-array | 43761 | 0.023 | 3.42× |
| natural-orderby | 20000 | 0.050 | 7.47× |
| sort-on | 9517 | 0.105 | 15.71× |
| sort-by | 1488 | 0.672 | 100.44× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2236724 | 0.000 | 0.83× |
| inline comparator chain, slice().sort() | 1877822 | 0.001 | 0.98× |
| fast-multisort | 1846085 | 0.001 | 1.00× |
| just-sort-by | 975238 | 0.001 | 1.89× |
| thenby | 848912 | 0.001 | 2.17× |
| fast-sort | 791498 | 0.001 | 2.33× |
| es-toolkit.orderBy | 776493 | 0.001 | 2.38× |
| remeda.sortBy | 755023 | 0.001 | 2.45× |
| Array.prototype.sort, decorated | 572867 | 0.002 | 3.22× |
| underscore.sortBy | 546133 | 0.002 | 3.38× |
| ramda.sortWith | 531948 | 0.002 | 3.47× |
| lodash.orderBy | 420103 | 0.002 | 4.39× |
| sort-array | 311483 | 0.003 | 5.93× |
| sort-on | 64201 | 0.016 | 28.75× |
| natural-orderby | 43948 | 0.023 | 42.01× |
| sort-by | 8366 | 0.120 | 220.66× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2048000 | 0.000 | 0.89× |
| fast-multisort | 1830615 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1724632 | 0.001 | 1.06× |
| just-sort-by | 941609 | 0.001 | 1.94× |
| thenby | 838056 | 0.001 | 2.18× |
| fast-sort | 780190 | 0.001 | 2.35× |
| es-toolkit.orderBy | 776493 | 0.001 | 2.36× |
| remeda.sortBy | 602353 | 0.002 | 3.04× |
| Array.prototype.sort, decorated | 568889 | 0.002 | 3.22× |
| ramda.sortWith | 526817 | 0.002 | 3.47× |
| underscore.sortBy | 494985 | 0.002 | 3.70× |
| lodash.orderBy | 386415 | 0.003 | 4.74× |
| sort-array | 323794 | 0.003 | 5.65× |
| sort-on | 57853 | 0.017 | 31.64× |
| natural-orderby | 43948 | 0.023 | 41.65× |
| sort-by | 8179 | 0.122 | 223.82× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1209151 | 0.001 | 0.64× |
| inline comparator chain, slice().sort() | 1095920 | 0.001 | 0.71× |
| fast-multisort | 772830 | 0.001 | 1.00× |
| just-sort-by | 557279 | 0.002 | 1.39× |
| thenby | 442811 | 0.002 | 1.75× |
| underscore.sortBy | 425558 | 0.002 | 1.82× |
| fast-sort | 413737 | 0.002 | 1.87× |
| remeda.sortBy | 409600 | 0.002 | 1.89× |
| es-toolkit.orderBy | 406551 | 0.002 | 1.90× |
| Array.prototype.sort, decorated | 339917 | 0.003 | 2.27× |
| lodash.orderBy | 302288 | 0.003 | 2.56× |
| ramda.sortWith | 285436 | 0.004 | 2.71× |
| sort-array | 172101 | 0.006 | 4.49× |
| natural-orderby | 42314 | 0.024 | 18.26× |
| sort-on | 40000 | 0.025 | 19.32× |
| sort-by | 4904 | 0.204 | 157.58× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 218453 | 0.005 | 0.65× |
| inline comparator chain, toSorted() | 217872 | 0.005 | 0.65× |
| fast-multisort | 141241 | 0.007 | 1.00× |
| es-toolkit.orderBy | 84280 | 0.012 | 1.68× |
| lodash.orderBy | 82915 | 0.012 | 1.70× |
| Array.prototype.sort, decorated | 75852 | 0.013 | 1.86× |
| remeda.sortBy (different order) | 67815 | 0.015 | 2.08× |
| thenby (different order) | 65431 | 0.015 | 2.16× |
| ramda.sortWith (different order) | 64000 | 0.016 | 2.21× |
| fast-sort (different order) | 59362 | 0.017 | 2.38× |
| sort-array (different order) | 34133 | 0.029 | 4.14× |
| natural-orderby (different order) | 9961 | 0.100 | 14.18× |
| sort-on (different order) | 9377 | 0.107 | 15.06× |
| sort-by (different order) | 1077 | 0.928 | 131.09× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42140 | 0.024 | 1.00× |
| inline comparator chain, toSorted() | 18092 | 0.055 | 2.33× |
| inline comparator chain, slice().sort() | 17840 | 0.056 | 2.36× |
| underscore.sortBy | 10847 | 0.092 | 3.88× |
| thenby | 8737 | 0.114 | 4.82× |
| fast-sort | 8232 | 0.121 | 5.12× |
| es-toolkit.orderBy | 7642 | 0.131 | 5.51× |
| lodash.orderBy | 7442 | 0.134 | 5.66× |
| Array.prototype.sort, decorated | 7072 | 0.141 | 5.96× |
| remeda.sortBy | 6416 | 0.156 | 6.57× |
| ramda.sortWith | 5872 | 0.170 | 7.18× |
| just-sort-by (different order) | 4169 | 0.240 | 10.11× |
| sort-array | 3743 | 0.267 | 11.26× |
| natural-orderby (different order) | 2471 | 0.405 | 17.05× |
| sort-on (different order) | 985 | 1.016 | 42.80× |
| sort-by | 125 | 8.025 | 338.17× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14027 | 0.071 | 1.00× |
| inline comparator chain, toSorted() | 9377 | 0.107 | 1.50× |
| inline comparator chain, slice().sort() | 9014 | 0.111 | 1.56× |
| underscore.sortBy | 5899 | 0.170 | 2.38× |
| thenby | 5470 | 0.183 | 2.56× |
| fast-sort | 5141 | 0.195 | 2.73× |
| es-toolkit.orderBy | 4981 | 0.201 | 2.82× |
| remeda.sortBy | 4523 | 0.221 | 3.10× |
| Array.prototype.sort, decorated | 4491 | 0.223 | 3.12× |
| lodash.orderBy | 4324 | 0.231 | 3.24× |
| ramda.sortWith | 3975 | 0.252 | 3.53× |
| just-sort-by (different order) | 2819 | 0.355 | 4.98× |
| sort-array | 2424 | 0.413 | 5.79× |
| natural-orderby (different order) | 825 | 1.213 | 17.01× |
| sort-on (different order) | 597 | 1.675 | 23.50× |
| sort-by | 93 | 10.750 | 150.79× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 31801 | 0.031 | 1.00× |
| inline comparator chain, slice().sort() | 13989 | 0.071 | 2.27× |
| inline comparator chain, toSorted() | 13989 | 0.071 | 2.27× |
| underscore.sortBy (different order) | 9242 | 0.108 | 3.44× |
| just-sort-by (different order) | 7619 | 0.131 | 4.17× |
| fast-sort | 7574 | 0.132 | 4.20× |
| thenby (different order) | 7273 | 0.138 | 4.37× |
| es-toolkit.orderBy | 6790 | 0.147 | 4.68× |
| remeda.sortBy (different order) | 6400 | 0.156 | 4.97× |
| lodash.orderBy | 6275 | 0.159 | 5.07× |
| Array.prototype.sort, decorated | 6275 | 0.159 | 5.07× |
| ramda.sortWith (different order) | 5059 | 0.198 | 6.29× |
| sort-array | 3216 | 0.311 | 9.89× |
| natural-orderby | 2530 | 0.395 | 12.57× |
| sort-on | 840 | 1.191 | 37.86× |
| sort-by (different order) | 99 | 10.100 | 321.19× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30386 | 0.033 | 1.00× |
| inline comparator chain, toSorted() | 11034 | 0.091 | 2.75× |
| inline comparator chain, slice().sort() | 10407 | 0.096 | 2.92× |
| underscore.sortBy | 8312 | 0.120 | 3.66× |
| just-sort-by | 6275 | 0.159 | 4.84× |
| thenby | 6184 | 0.162 | 4.91× |
| fast-sort | 6009 | 0.166 | 5.06× |
| es-toolkit.orderBy | 5818 | 0.172 | 5.22× |
| remeda.sortBy | 5818 | 0.172 | 5.22× |
| lodash.orderBy | 5517 | 0.181 | 5.51× |
| Array.prototype.sort, decorated | 5333 | 0.188 | 5.70× |
| ramda.sortWith | 4491 | 0.223 | 6.77× |
| sort-array | 2922 | 0.342 | 10.40× |
| natural-orderby | 2162 | 0.462 | 14.05× |
| sort-on | 711 | 1.406 | 42.73× |
| sort-by | 95 | 10.550 | 320.57× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14713 | 0.068 | 1.00× |
| inline comparator chain, toSorted() | 10323 | 0.097 | 1.43× |
| inline comparator chain, slice().sort() | 9846 | 0.102 | 1.49× |
| underscore.sortBy | 6632 | 0.151 | 2.22× |
| thenby | 5818 | 0.172 | 2.53× |
| fast-sort | 5401 | 0.185 | 2.72× |
| es-toolkit.orderBy | 5267 | 0.190 | 2.79× |
| Array.prototype.sort, decorated | 5182 | 0.193 | 2.84× |
| remeda.sortBy | 4812 | 0.208 | 3.06× |
| lodash.orderBy | 4672 | 0.214 | 3.15× |
| ramda.sortWith | 4129 | 0.242 | 3.56× |
| just-sort-by | 3879 | 0.258 | 3.79× |
| sort-array | 2723 | 0.367 | 5.40× |
| natural-orderby | 1658 | 0.603 | 8.87× |
| sort-on | 599 | 1.669 | 24.55× |
| sort-by | 93 | 10.750 | 158.16× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 243810 | 0.004 | 0.75× |
| inline comparator chain, slice().sort() | 198835 | 0.005 | 0.92× |
| fast-multisort | 182857 | 0.005 | 1.00× |
| just-sort-by | 102400 | 0.010 | 1.79× |
| thenby | 88658 | 0.011 | 2.06× |
| fast-sort | 84979 | 0.012 | 2.15× |
| es-toolkit.orderBy | 79073 | 0.013 | 2.31× |
| remeda.sortBy | 75572 | 0.013 | 2.42× |
| Array.prototype.sort, decorated | 56575 | 0.018 | 3.23× |
| underscore.sortBy | 55804 | 0.018 | 3.28× |
| ramda.sortWith | 55501 | 0.018 | 3.29× |
| lodash.orderBy | 42490 | 0.024 | 4.30× |
| sort-array | 31605 | 0.032 | 5.79× |
| sort-on | 6432 | 0.155 | 28.43× |
| natural-orderby | 4354 | 0.230 | 42.00× |
| sort-by | 833 | 1.200 | 219.43× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 222609 | 0.004 | 0.80× |
| inline comparator chain, slice().sort() | 181239 | 0.006 | 0.98× |
| fast-multisort | 178087 | 0.006 | 1.00× |
| just-sort-by | 97990 | 0.010 | 1.82× |
| thenby | 87897 | 0.011 | 2.03× |
| fast-sort | 82915 | 0.012 | 2.15× |
| es-toolkit.orderBy | 80000 | 0.012 | 2.23× |
| remeda.sortBy | 60059 | 0.017 | 2.97× |
| Array.prototype.sort, decorated | 55956 | 0.018 | 3.18× |
| ramda.sortWith | 55804 | 0.018 | 3.19× |
| underscore.sortBy | 50945 | 0.020 | 3.50× |
| lodash.orderBy | 39084 | 0.026 | 4.56× |
| sort-array | 32821 | 0.030 | 5.43× |
| sort-on | 5766 | 0.173 | 30.89× |
| natural-orderby | 4295 | 0.233 | 41.46× |
| sort-by | 812 | 1.231 | 219.27× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 199805 | 0.005 | 0.59× |
| inline comparator chain, slice().sort() | 165161 | 0.006 | 0.71× |
| fast-multisort | 118040 | 0.008 | 1.00× |
| just-sort-by | 90220 | 0.011 | 1.31× |
| thenby | 77871 | 0.013 | 1.52× |
| fast-sort | 73935 | 0.014 | 1.60× |
| es-toolkit.orderBy | 71608 | 0.014 | 1.65× |
| remeda.sortBy | 67368 | 0.015 | 1.75× |
| underscore.sortBy | 52245 | 0.019 | 2.26× |
| Array.prototype.sort, decorated | 52112 | 0.019 | 2.27× |
| ramda.sortWith | 49951 | 0.020 | 2.36× |
| lodash.orderBy | 40797 | 0.025 | 2.89× |
| sort-array | 28683 | 0.035 | 4.12× |
| sort-on | 6684 | 0.150 | 17.66× |
| natural-orderby | 4267 | 0.234 | 27.67× |
| sort-by | 816 | 1.225 | 144.60× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 11797 | 0.085 | 0.98× |
| inline comparator chain, slice().sort() | 11743 | 0.085 | 0.98× |
| fast-multisort | 11532 | 0.087 | 1.00× |
| lodash.orderBy | 5100 | 0.196 | 2.26× |
| es-toolkit.orderBy | 4672 | 0.214 | 2.47× |
| Array.prototype.sort, decorated | 4169 | 0.240 | 2.77× |
| remeda.sortBy (different order) | 3787 | 0.264 | 3.05× |
| thenby (different order) | 3765 | 0.266 | 3.06× |
| ramda.sortWith (different order) | 3536 | 0.283 | 3.26× |
| fast-sort (different order) | 3299 | 0.303 | 3.50× |
| sort-array (different order) | 1957 | 0.511 | 5.89× |
| natural-orderby (different order) | 879 | 1.138 | 13.12× |
| sort-on (different order) | 521 | 1.919 | 22.13× |
| sort-by (different order) | 58 | 17.300 | 199.50× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4369 | 0.229 | 1.00× |
| inline comparator chain, toSorted() | 1221 | 0.819 | 3.58× |
| inline comparator chain, slice().sort() | 1185 | 0.844 | 3.69× |
| underscore.sortBy | 858 | 1.166 | 5.09× |
| thenby | 777 | 1.287 | 5.62× |
| fast-sort | 744 | 1.344 | 5.87× |
| es-toolkit.orderBy | 705 | 1.419 | 6.20× |
| Array.prototype.sort, decorated | 627 | 1.594 | 6.96× |
| lodash.orderBy | 618 | 1.619 | 7.07× |
| remeda.sortBy | 590 | 1.694 | 7.40× |
| ramda.sortWith | 556 | 1.800 | 7.86× |
| just-sort-by (different order) | 386 | 2.587 | 11.30× |
| sort-array | 356 | 2.813 | 12.29× |
| natural-orderby (different order) | 231 | 4.337 | 18.95× |
| sort-on (different order) | 93 | 10.750 | 46.96× |
| sort-by | 12 | 84.100 | 367.40× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1127 | 0.888 | 1.00× |
| inline comparator chain, toSorted() | 453 | 2.206 | 2.49× |
| inline comparator chain, slice().sort() | 452 | 2.213 | 2.49× |
| underscore.sortBy | 376 | 2.663 | 3.00× |
| thenby | 345 | 2.900 | 3.27× |
| fast-sort | 336 | 2.975 | 3.35× |
| es-toolkit.orderBy | 328 | 3.050 | 3.44× |
| remeda.sortBy | 307 | 3.262 | 3.68× |
| Array.prototype.sort, decorated | 292 | 3.425 | 3.86× |
| lodash.orderBy | 279 | 3.587 | 4.04× |
| ramda.sortWith | 272 | 3.675 | 4.14× |
| just-sort-by (different order) | 199 | 5.025 | 5.66× |
| sort-array | 175 | 5.725 | 6.45× |
| natural-orderby (different order) | 65 | 15.400 | 17.35× |
| sort-on (different order) | 43 | 23.000 | 25.92× |
| sort-by | 7 | 148.600 | 167.44× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3596 | 0.278 | 1.00× |
| inline comparator chain, toSorted() | 896 | 1.116 | 4.01× |
| inline comparator chain, slice().sort() | 891 | 1.122 | 4.03× |
| underscore.sortBy (different order) | 684 | 1.463 | 5.26× |
| just-sort-by (different order) | 557 | 1.794 | 6.45× |
| fast-sort | 554 | 1.806 | 6.49× |
| thenby (different order) | 537 | 1.862 | 6.70× |
| es-toolkit.orderBy | 503 | 1.988 | 7.15× |
| remeda.sortBy (different order) | 485 | 2.063 | 7.42× |
| Array.prototype.sort, decorated | 469 | 2.131 | 7.66× |
| lodash.orderBy | 465 | 2.150 | 7.73× |
| ramda.sortWith (different order) | 379 | 2.637 | 9.48× |
| sort-array | 240 | 4.175 | 15.01× |
| natural-orderby | 206 | 4.850 | 17.44× |
| sort-on | 62 | 16.150 | 58.07× |
| sort-by (different order) | 7 | 136.300 | 490.07× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3469 | 0.288 | 1.00× |
| inline comparator chain, toSorted() | 650 | 1.537 | 5.33× |
| inline comparator chain, slice().sort() | 637 | 1.569 | 5.44× |
| underscore.sortBy | 606 | 1.650 | 5.72× |
| just-sort-by | 444 | 2.250 | 7.80× |
| thenby | 438 | 2.281 | 7.91× |
| fast-sort | 430 | 2.325 | 8.07× |
| es-toolkit.orderBy | 415 | 2.413 | 8.37× |
| remeda.sortBy | 415 | 2.413 | 8.37× |
| lodash.orderBy | 394 | 2.538 | 8.80× |
| Array.prototype.sort, decorated | 377 | 2.650 | 9.19× |
| ramda.sortWith | 323 | 3.100 | 10.75× |
| sort-array | 211 | 4.737 | 16.43× |
| natural-orderby | 172 | 5.800 | 20.12× |
| sort-on | 51 | 19.600 | 67.99× |
| sort-by | 7 | 146.400 | 507.84× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1070 | 0.934 | 1.00× |
| inline comparator chain, toSorted() | 513 | 1.950 | 2.09× |
| inline comparator chain, slice().sort() | 506 | 1.975 | 2.11× |
| underscore.sortBy | 420 | 2.381 | 2.55× |
| thenby | 370 | 2.700 | 2.89× |
| fast-sort | 357 | 2.800 | 3.00× |
| es-toolkit.orderBy | 352 | 2.837 | 3.04× |
| Array.prototype.sort, decorated | 335 | 2.988 | 3.20× |
| remeda.sortBy | 332 | 3.013 | 3.22× |
| lodash.orderBy | 314 | 3.188 | 3.41× |
| ramda.sortWith | 287 | 3.488 | 3.73× |
| just-sort-by | 276 | 3.625 | 3.88× |
| sort-array | 197 | 5.075 | 5.43× |
| natural-orderby | 139 | 7.200 | 7.71× |
| sort-on | 43 | 23.400 | 25.04× |
| sort-by | 7 | 149.100 | 159.57× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 24151 | 0.041 | 0.76× |
| inline comparator chain, slice().sort() | 19542 | 0.051 | 0.94× |
| fast-multisort | 18417 | 0.054 | 1.00× |
| just-sort-by | 10240 | 0.098 | 1.80× |
| thenby | 8858 | 0.113 | 2.08× |
| fast-sort | 8449 | 0.118 | 2.18× |
| es-toolkit.orderBy | 8101 | 0.123 | 2.27× |
| remeda.sortBy | 7781 | 0.129 | 2.37× |
| Array.prototype.sort, decorated | 5818 | 0.172 | 3.17× |
| underscore.sortBy | 5689 | 0.176 | 3.24× |
| ramda.sortWith | 5614 | 0.178 | 3.28× |
| lodash.orderBy | 4211 | 0.238 | 4.37× |
| sort-array | 3192 | 0.313 | 5.77× |
| sort-on | 648 | 1.544 | 28.43× |
| natural-orderby | 407 | 2.456 | 45.24× |
| sort-by | 83 | 12.000 | 221.01× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 22165 | 0.045 | 0.81× |
| inline comparator chain, slice().sort() | 18156 | 0.055 | 0.99× |
| fast-multisort | 18028 | 0.055 | 1.00× |
| just-sort-by | 9961 | 0.100 | 1.81× |
| thenby | 8797 | 0.114 | 2.05× |
| fast-sort | 8449 | 0.118 | 2.13× |
| es-toolkit.orderBy | 8076 | 0.124 | 2.23× |
| remeda.sortBy | 6095 | 0.164 | 2.96× |
| Array.prototype.sort, decorated | 5740 | 0.174 | 3.14× |
| ramda.sortWith | 5614 | 0.178 | 3.21× |
| underscore.sortBy | 5141 | 0.195 | 3.51× |
| lodash.orderBy | 3867 | 0.259 | 4.66× |
| sort-array | 3316 | 0.302 | 5.44× |
| sort-on | 576 | 1.738 | 31.32× |
| natural-orderby | 407 | 2.456 | 44.28× |
| sort-by | 82 | 12.250 | 220.85× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 21070 | 0.047 | 0.62× |
| inline comparator chain, slice().sort() | 17356 | 0.058 | 0.75× |
| fast-multisort | 12995 | 0.077 | 1.00× |
| just-sort-by | 9517 | 0.105 | 1.37× |
| thenby | 8312 | 0.120 | 1.56× |
| fast-sort | 7781 | 0.129 | 1.67× |
| es-toolkit.orderBy | 7552 | 0.132 | 1.72× |
| remeda.sortBy | 7273 | 0.137 | 1.79× |
| Array.prototype.sort, decorated | 5447 | 0.184 | 2.39× |
| underscore.sortBy | 5378 | 0.186 | 2.42× |
| ramda.sortWith | 5311 | 0.188 | 2.45× |
| lodash.orderBy | 4051 | 0.247 | 3.21× |
| sort-array | 3005 | 0.333 | 4.32× |
| sort-on | 681 | 1.469 | 19.09× |
| natural-orderby | 394 | 2.537 | 32.97× |
| sort-by | 83 | 12.050 | 156.59× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1461 | 0.684 | 1.00× |
| inline comparator chain, toSorted() | 664 | 1.506 | 2.20× |
| inline comparator chain, slice().sort() | 661 | 1.513 | 2.21× |
| lodash.orderBy | 348 | 2.875 | 4.20× |
| es-toolkit.orderBy | 321 | 3.113 | 4.55× |
| Array.prototype.sort, decorated | 287 | 3.488 | 5.10× |
| remeda.sortBy (different order) | 264 | 3.788 | 5.53× |
| thenby (different order) | 262 | 3.813 | 5.57× |
| ramda.sortWith (different order) | 256 | 3.912 | 5.72× |
| fast-sort (different order) | 237 | 4.225 | 6.17× |
| sort-array (different order) | 137 | 7.275 | 10.63× |
| natural-orderby (different order) | 76 | 13.150 | 19.21× |
| sort-on (different order) | 36 | 27.700 | 40.47× |
| sort-by (different order) | 4 | 257.100 | 375.67× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 435 | 2.300 | 1.00× |
| inline comparator chain, toSorted() | 107 | 9.325 | 4.05× |
| inline comparator chain, slice().sort() | 107 | 9.375 | 4.08× |
| underscore.sortBy | 79 | 12.600 | 5.48× |
| thenby | 73 | 13.700 | 5.96× |
| fast-sort | 71 | 14.100 | 6.13× |
| es-toolkit.orderBy | 67 | 15.000 | 6.52× |
| Array.prototype.sort, decorated | 58 | 17.300 | 7.52× |
| lodash.orderBy | 57 | 17.400 | 7.57× |
| remeda.sortBy | 56 | 17.750 | 7.72× |
| ramda.sortWith | 54 | 18.600 | 8.09× |
| just-sort-by (different order) | 35 | 28.600 | 12.43× |
| sort-array | 35 | 28.800 | 12.52× |
| natural-orderby (different order) | 20 | 49.300 | 21.43× |
| sort-on (different order) | 9 | 109.500 | 47.61× |
| sort-by | 1 | 852.200 | 370.52× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 81 | 12.350 | 1.00× |
| inline comparator chain, slice().sort() | 31 | 32.700 | 2.65× |
| inline comparator chain, toSorted() | 30 | 33.100 | 2.68× |
| underscore.sortBy | 25 | 39.600 | 3.21× |
| thenby | 23 | 43.000 | 3.48× |
| es-toolkit.orderBy | 22 | 44.700 | 3.62× |
| fast-sort | 21 | 47.400 | 3.84× |
| remeda.sortBy | 20 | 49.300 | 3.99× |
| Array.prototype.sort, decorated | 19 | 52.100 | 4.22× |
| ramda.sortWith | 19 | 54.000 | 4.37× |
| lodash.orderBy | 18 | 56.400 | 4.57× |
| just-sort-by (different order) | 13 | 78.700 | 6.37× |
| sort-array | 11 | 87.000 | 7.04× |
| natural-orderby (different order) | 4 | 223.900 | 18.13× |
| sort-on (different order) | 3 | 315.100 | 25.51× |
| sort-by | 1 | 1943.500 | 157.37× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 369 | 2.713 | 1.00× |
| inline comparator chain, toSorted() | 66 | 15.050 | 5.55× |
| inline comparator chain, slice().sort() | 66 | 15.250 | 5.62× |
| underscore.sortBy (different order) | 53 | 18.800 | 6.93× |
| fast-sort | 42 | 23.700 | 8.74× |
| just-sort-by (different order) | 42 | 23.900 | 8.81× |
| thenby (different order) | 40 | 24.800 | 9.14× |
| es-toolkit.orderBy | 40 | 25.200 | 9.29× |
| remeda.sortBy (different order) | 37 | 26.900 | 9.92× |
| lodash.orderBy | 34 | 29.700 | 10.95× |
| Array.prototype.sort, decorated | 32 | 31.200 | 11.50× |
| ramda.sortWith (different order) | 30 | 33.800 | 12.46× |
| sort-array | 19 | 53.400 | 19.69× |
| natural-orderby | 16 | 63.400 | 23.37× |
| sort-on | 5 | 208.100 | 76.72× |
| sort-by (different order) | 1 | 1740.100 | 641.51× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 327 | 3.063 | 1.00× |
| underscore.sortBy | 46 | 21.700 | 7.09× |
| inline comparator chain, toSorted() | 44 | 22.700 | 7.41× |
| inline comparator chain, slice().sort() | 44 | 22.900 | 7.48× |
| thenby | 30 | 32.800 | 10.71× |
| fast-sort | 30 | 33.800 | 11.04× |
| just-sort-by | 28 | 35.100 | 11.46× |
| lodash.orderBy | 28 | 35.200 | 11.49× |
| remeda.sortBy | 28 | 35.600 | 11.62× |
| es-toolkit.orderBy | 28 | 36.300 | 11.85× |
| ramda.sortWith | 23 | 43.700 | 14.27× |
| Array.prototype.sort, decorated | 21 | 48.300 | 15.77× |
| sort-array | 15 | 66.700 | 21.78× |
| natural-orderby | 13 | 77.000 | 25.14× |
| sort-on | 4 | 262.400 | 85.68× |
| sort-by | 1 | 1915.700 | 625.53× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 64 | 15.650 | 1.00× |
| inline comparator chain, toSorted() | 33 | 30.200 | 1.93× |
| inline comparator chain, slice().sort() | 33 | 30.700 | 1.96× |
| underscore.sortBy | 30 | 33.800 | 2.16× |
| thenby | 25 | 39.400 | 2.52× |
| fast-sort | 24 | 41.400 | 2.65× |
| es-toolkit.orderBy | 22 | 45.700 | 2.92× |
| remeda.sortBy | 21 | 46.800 | 2.99× |
| just-sort-by | 19 | 51.400 | 3.28× |
| Array.prototype.sort, decorated | 19 | 51.700 | 3.30× |
| ramda.sortWith | 19 | 51.900 | 3.32× |
| lodash.orderBy | 18 | 54.700 | 3.50× |
| sort-array | 14 | 73.300 | 4.68× |
| natural-orderby | 10 | 100.800 | 6.44× |
| sort-on | 3 | 312.400 | 19.96× |
| sort-by | 1 | 1935.900 | 123.70× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2362 | 0.423 | 0.75× |
| inline comparator chain, slice().sort() | 1910 | 0.523 | 0.93× |
| fast-multisort | 1778 | 0.563 | 1.00× |
| just-sort-by | 985 | 1.016 | 1.81× |
| thenby | 886 | 1.128 | 2.01× |
| fast-sort | 840 | 1.191 | 2.12× |
| es-toolkit.orderBy | 806 | 1.241 | 2.21× |
| remeda.sortBy | 769 | 1.300 | 2.31× |
| underscore.sortBy | 548 | 1.825 | 3.24× |
| ramda.sortWith | 544 | 1.838 | 3.27× |
| Array.prototype.sort, decorated | 438 | 2.281 | 4.06× |
| lodash.orderBy | 385 | 2.600 | 4.62× |
| sort-array | 311 | 3.212 | 5.71× |
| sort-on | 63 | 15.750 | 28.00× |
| natural-orderby | 34 | 29.500 | 52.44× |
| sort-by | 8 | 121.100 | 215.29× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2126 | 0.470 | 0.84× |
| fast-multisort | 1778 | 0.563 | 1.00× |
| inline comparator chain, slice().sort() | 1680 | 0.595 | 1.06× |
| just-sort-by | 914 | 1.094 | 1.94× |
| thenby | 847 | 1.181 | 2.10× |
| fast-sort | 796 | 1.256 | 2.23× |
| es-toolkit.orderBy | 788 | 1.269 | 2.26× |
| remeda.sortBy | 586 | 1.706 | 3.03× |
| ramda.sortWith | 535 | 1.869 | 3.32× |
| underscore.sortBy | 495 | 2.019 | 3.59× |
| Array.prototype.sort, decorated | 422 | 2.369 | 4.21× |
| lodash.orderBy | 345 | 2.900 | 5.16× |
| sort-array | 321 | 3.113 | 5.53× |
| sort-on | 55 | 18.100 | 32.18× |
| natural-orderby | 33 | 30.600 | 54.40× |
| sort-by | 8 | 125.800 | 223.64× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1839 | 0.544 | 0.68× |
| inline comparator chain, slice().sort() | 1509 | 0.663 | 0.83× |
| fast-multisort | 1250 | 0.800 | 1.00× |
| just-sort-by | 844 | 1.184 | 1.48× |
| thenby | 780 | 1.281 | 1.60× |
| fast-sort | 702 | 1.425 | 1.78× |
| es-toolkit.orderBy | 699 | 1.431 | 1.79× |
| remeda.sortBy | 672 | 1.487 | 1.86× |
| underscore.sortBy | 502 | 1.994 | 2.49× |
| ramda.sortWith | 498 | 2.006 | 2.51× |
| Array.prototype.sort, decorated | 379 | 2.637 | 3.30× |
| lodash.orderBy | 352 | 2.837 | 3.55× |
| sort-array | 286 | 3.500 | 4.38× |
| sort-on | 65 | 15.300 | 19.13× |
| natural-orderby | 32 | 31.300 | 39.13× |
| sort-by | 8 | 123.100 | 153.88× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 128 | 7.800 | 1.00× |
| inline comparator chain, toSorted() | 43 | 23.100 | 2.96× |
| inline comparator chain, slice().sort() | 43 | 23.400 | 3.00× |
| es-toolkit.orderBy | 22 | 45.200 | 5.79× |
| lodash.orderBy | 20 | 50.300 | 6.45× |
| thenby (different order) | 18 | 56.200 | 7.21× |
| remeda.sortBy (different order) | 18 | 56.400 | 7.23× |
| ramda.sortWith (different order) | 18 | 56.800 | 7.28× |
| Array.prototype.sort, decorated | 17 | 57.800 | 7.41× |
| fast-sort (different order) | 16 | 63.300 | 8.12× |
| sort-array (different order) | 10 | 103.700 | 13.29× |
| natural-orderby (different order) | 6 | 177.500 | 22.76× |
| sort-on (different order) | 3 | 381.200 | 48.87× |
| sort-by (different order) | 0 | 3508.300 | 449.78× |

### WebKit 27.2

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 262144000 | 0.000 | 0.34× |
| fast-multisort | 89240511 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 77672296 | 0.000 | 1.15× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.36× |
| sort-on | 61680941 | 0.000 | 1.45× |
| es-toolkit.orderBy | 56679784 | 0.000 | 1.57× |
| thenby | 34952533 | 0.000 | 2.55× |
| Array.prototype.sort, decorated | 29959314 | 0.000 | 2.98× |
| ramda.sortWith | 26214400 | 0.000 | 3.40× |
| fast-sort | 24966095 | 0.000 | 3.57× |
| sort-array | 21845333 | 0.000 | 4.09× |
| underscore.sortBy | 20164923 | 0.000 | 4.43× |
| sort-by | 18078897 | 0.000 | 4.94× |
| remeda.sortBy | 16912516 | 0.000 | 5.28× |
| lodash.orderBy | 14979657 | 0.000 | 5.96× |
| natural-orderby | 4519724 | 0.000 | 19.74× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 289262345 | 0.000 | 0.32× |
| fast-multisort | 91180522 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 74898286 | 0.000 | 1.22× |
| sort-on | 72315586 | 0.000 | 1.26× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.48× |
| es-toolkit.orderBy | 55188211 | 0.000 | 1.65× |
| thenby | 37449143 | 0.000 | 2.43× |
| Array.prototype.sort, decorated | 29959314 | 0.000 | 3.04× |
| ramda.sortWith | 26214400 | 0.000 | 3.48× |
| fast-sort | 23831273 | 0.000 | 3.83× |
| underscore.sortBy | 21845333 | 0.000 | 4.17× |
| sort-array | 20971520 | 0.000 | 4.35× |
| sort-by | 18078897 | 0.000 | 5.04× |
| lodash.orderBy | 14563556 | 0.000 | 6.26× |
| remeda.sortBy | 14169946 | 0.000 | 6.43× |
| natural-orderby | 2114065 | 0.000 | 43.13× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.32× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| sort-on | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.50× |
| es-toolkit.orderBy | 58254222 | 0.000 | 1.64× |
| thenby | 40329846 | 0.000 | 2.36× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.00× |
| ramda.sortWith | 27594105 | 0.000 | 3.45× |
| fast-sort | 26214400 | 0.000 | 3.64× |
| underscore.sortBy | 22795130 | 0.000 | 4.18× |
| sort-array | 21845333 | 0.000 | 4.36× |
| sort-by | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15420235 | 0.000 | 6.18× |
| remeda.sortBy | 14563556 | 0.000 | 6.55× |
| natural-orderby | 3120762 | 0.000 | 30.55× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.32× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| sort-on | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.50× |
| es-toolkit.orderBy | 56679784 | 0.000 | 1.68× |
| thenby | 40329846 | 0.000 | 2.36× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.00× |
| ramda.sortWith | 27594105 | 0.000 | 3.45× |
| fast-sort | 24966095 | 0.000 | 3.82× |
| underscore.sortBy | 22795130 | 0.000 | 4.18× |
| sort-array | 21845333 | 0.000 | 4.36× |
| sort-by | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15420235 | 0.000 | 6.18× |
| remeda.sortBy | 14563556 | 0.000 | 6.55× |
| natural-orderby | 2849391 | 0.000 | 33.45× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.32× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| sort-on | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.50× |
| es-toolkit.orderBy | 56679784 | 0.000 | 1.68× |
| thenby | 40329846 | 0.000 | 2.36× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.00× |
| ramda.sortWith | 26886564 | 0.000 | 3.55× |
| fast-sort | 24966095 | 0.000 | 3.82× |
| underscore.sortBy | 22795130 | 0.000 | 4.18× |
| sort-array | 21845333 | 0.000 | 4.36× |
| sort-by | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15420235 | 0.000 | 6.18× |
| remeda.sortBy | 14563556 | 0.000 | 6.55× |
| natural-orderby | 910222 | 0.001 | 104.73× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.32× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| sort-on | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.45× |
| es-toolkit.orderBy | 58254222 | 0.000 | 1.64× |
| thenby | 40329846 | 0.000 | 2.36× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.00× |
| ramda.sortWith | 27594105 | 0.000 | 3.45× |
| fast-sort | 24966095 | 0.000 | 3.82× |
| sort-array | 22795130 | 0.000 | 4.18× |
| underscore.sortBy | 22795130 | 0.000 | 4.18× |
| sort-by | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15420235 | 0.000 | 6.18× |
| remeda.sortBy | 14563556 | 0.000 | 6.55× |
| natural-orderby | 3971879 | 0.000 | 24.00× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.32× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| sort-on | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.50× |
| es-toolkit.orderBy | 58254222 | 0.000 | 1.64× |
| thenby | 40329846 | 0.000 | 2.36× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 2.82× |
| ramda.sortWith | 27594105 | 0.000 | 3.45× |
| fast-sort | 24966095 | 0.000 | 3.82× |
| sort-array | 22795130 | 0.000 | 4.18× |
| underscore.sortBy | 22795130 | 0.000 | 4.18× |
| remeda.sortBy | 18724571 | 0.000 | 5.09× |
| sort-by | 18724571 | 0.000 | 5.09× |
| lodash.orderBy | 15420235 | 0.000 | 6.18× |
| natural-orderby | 3971879 | 0.000 | 24.00× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 299593143 | 0.000 | 0.32× |
| fast-multisort | 95325091 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.18× |
| sort-on | 80659692 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.50× |
| es-toolkit.orderBy | 56679784 | 0.000 | 1.68× |
| thenby | 40329846 | 0.000 | 2.36× |
| Array.prototype.sort, decorated | 34952533 | 0.000 | 2.73× |
| ramda.sortWith | 27594105 | 0.000 | 3.45× |
| fast-sort | 24966095 | 0.000 | 3.82× |
| underscore.sortBy | 22795130 | 0.000 | 4.18× |
| sort-array | 21845333 | 0.000 | 4.36× |
| sort-by | 18724571 | 0.000 | 5.09× |
| remeda.sortBy | 18078897 | 0.000 | 5.27× |
| lodash.orderBy | 15420235 | 0.000 | 6.18× |
| natural-orderby | 3276800 | 0.000 | 29.09× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 99864381 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 80659692 | 0.000 | 1.24× |
| sort-on | 80659692 | 0.000 | 1.24× |
| inline comparator chain, slice().sort() | 65536000 | 0.000 | 1.52× |
| es-toolkit.orderBy | 58254222 | 0.000 | 1.71× |
| Array.prototype.sort, decorated | 33825032 | 0.000 | 2.95× |
| sort-array | 22795130 | 0.000 | 4.38× |
| fast-sort | 21845333 | 0.000 | 4.57× |
| ramda.sortWith | 20164923 | 0.000 | 4.95× |
| sort-by | 17476267 | 0.000 | 5.71× |
| thenby | 16912516 | 0.000 | 5.90× |
| lodash.orderBy | 16384000 | 0.000 | 6.10× |
| remeda.sortBy | 10082462 | 0.000 | 9.90× |
| natural-orderby | 606815 | 0.002 | 164.57× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 6553600 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 6553600 | 0.000 | 1.00× |
| thenby | 5698783 | 0.000 | 1.15× |
| Array.prototype.sort, decorated | 5041231 | 0.000 | 1.30× |
| inline comparator chain, toSorted() | 4854519 | 0.000 | 1.35× |
| es-toolkit.orderBy | 4854519 | 0.000 | 1.35× |
| fast-sort | 4228129 | 0.000 | 1.55× |
| underscore.sortBy | 4228129 | 0.000 | 1.55× |
| remeda.sortBy | 3276800 | 0.000 | 2.00× |
| ramda.sortWith | 3276800 | 0.000 | 2.00× |
| lodash.orderBy | 2184533 | 0.000 | 3.00× |
| sort-array | 1927529 | 0.001 | 3.40× |
| just-sort-by (different order) | 1057032 | 0.001 | 6.20× |
| natural-orderby (different order) | 356174 | 0.003 | 18.40× |
| sort-on (different order) | 264258 | 0.004 | 24.80× |
| sort-by | 66065 | 0.015 | 99.20× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 6553600 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 5957818 | 0.000 | 1.10× |
| thenby | 5242880 | 0.000 | 1.25× |
| es-toolkit.orderBy | 4854519 | 0.000 | 1.35× |
| inline comparator chain, toSorted() | 4681143 | 0.000 | 1.40× |
| fast-sort | 4228129 | 0.000 | 1.55× |
| Array.prototype.sort, decorated | 3855059 | 0.000 | 1.70× |
| underscore.sortBy | 3542486 | 0.000 | 1.85× |
| ramda.sortWith | 3276800 | 0.000 | 2.00× |
| remeda.sortBy | 3120762 | 0.000 | 2.10× |
| lodash.orderBy | 2048000 | 0.000 | 3.20× |
| sort-array | 1680410 | 0.001 | 3.90× |
| just-sort-by | 1057032 | 0.001 | 6.20× |
| sort-on | 221405 | 0.005 | 29.60× |
| natural-orderby | 157538 | 0.006 | 41.60× |
| sort-by | 68267 | 0.015 | 96.00× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 13107200 | 0.000 | 0.77× |
| just-sort-by (different order) | 11915636 | 0.000 | 0.85× |
| fast-multisort | 10082462 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 8456258 | 0.000 | 1.19× |
| es-toolkit.orderBy | 7943758 | 0.000 | 1.27× |
| thenby (different order) | 7943758 | 0.000 | 1.27× |
| fast-sort | 6553600 | 0.000 | 1.54× |
| Array.prototype.sort, decorated | 5698783 | 0.000 | 1.77× |
| remeda.sortBy (different order) | 4519724 | 0.000 | 2.23× |
| underscore.sortBy (different order) | 4519724 | 0.000 | 2.23× |
| ramda.sortWith (different order) | 3971879 | 0.000 | 2.54× |
| sort-array | 2978909 | 0.000 | 3.38× |
| lodash.orderBy | 2340571 | 0.000 | 4.31× |
| natural-orderby | 390095 | 0.003 | 25.85× |
| sort-on | 327680 | 0.003 | 30.77× |
| sort-by (different order) | 68267 | 0.015 | 147.69× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 7084973 | 0.000 | 0.84× |
| inline comparator chain, toSorted() | 6721641 | 0.000 | 0.89× |
| thenby | 6553600 | 0.000 | 0.91× |
| just-sort-by | 6241524 | 0.000 | 0.95× |
| fast-multisort | 5957818 | 0.000 | 1.00× |
| fast-sort | 5698783 | 0.000 | 1.05× |
| es-toolkit.orderBy | 5242880 | 0.000 | 1.14× |
| remeda.sortBy | 4096000 | 0.000 | 1.45× |
| ramda.sortWith | 2849391 | 0.000 | 2.09× |
| underscore.sortBy | 2621440 | 0.000 | 2.27× |
| Array.prototype.sort, decorated | 2427259 | 0.000 | 2.45× |
| sort-array | 1724632 | 0.001 | 3.45× |
| lodash.orderBy | 1213630 | 0.001 | 4.91× |
| natural-orderby | 327680 | 0.003 | 18.18× |
| sort-on | 204800 | 0.005 | 29.09× |
| sort-by | 44522 | 0.022 | 133.82× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4519724 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 4519724 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4369067 | 0.000 | 1.03× |
| thenby | 4369067 | 0.000 | 1.03× |
| es-toolkit.orderBy | 4228129 | 0.000 | 1.07× |
| fast-sort | 3744914 | 0.000 | 1.21× |
| remeda.sortBy | 2978909 | 0.000 | 1.52× |
| ramda.sortWith | 2849391 | 0.000 | 1.59× |
| Array.prototype.sort, decorated | 2340571 | 0.000 | 1.93× |
| underscore.sortBy | 2114065 | 0.000 | 2.14× |
| sort-array | 1638400 | 0.001 | 2.76× |
| just-sort-by | 1638400 | 0.001 | 2.76× |
| lodash.orderBy | 1310720 | 0.001 | 3.45× |
| sort-on | 215579 | 0.005 | 20.97× |
| natural-orderby | 85333 | 0.012 | 52.97× |
| sort-by | 56889 | 0.018 | 79.45× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 32768000 | 0.000 | 1.00× |
| es-toolkit.orderBy | 15887515 | 0.000 | 2.06× |
| thenby | 15420235 | 0.000 | 2.13× |
| inline comparator chain, slice().sort() | 13443282 | 0.000 | 2.44× |
| inline comparator chain, toSorted() | 12787512 | 0.000 | 2.56× |
| fast-sort | 12483048 | 0.000 | 2.63× |
| just-sort-by | 12483048 | 0.000 | 2.63× |
| Array.prototype.sort, decorated | 8738133 | 0.000 | 3.75× |
| ramda.sortWith | 8192000 | 0.000 | 4.00× |
| underscore.sortBy | 7710118 | 0.000 | 4.25× |
| remeda.sortBy | 5957818 | 0.000 | 5.50× |
| sort-array | 4681143 | 0.000 | 7.00× |
| lodash.orderBy | 3120762 | 0.000 | 10.50× |
| sort-on | 606815 | 0.002 | 54.00× |
| natural-orderby | 496485 | 0.002 | 66.00× |
| sort-by | 163840 | 0.006 | 200.00× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 27594105 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 13107200 | 0.000 | 2.11× |
| inline comparator chain, toSorted() | 12483048 | 0.000 | 2.21× |
| just-sort-by | 11915636 | 0.000 | 2.32× |
| remeda.sortBy | 5698783 | 0.000 | 4.84× |
| thenby | 5041231 | 0.000 | 5.47× |
| underscore.sortBy | 5041231 | 0.000 | 5.47× |
| sort-array | 4854519 | 0.000 | 5.68× |
| fast-sort | 4681143 | 0.000 | 5.89× |
| es-toolkit.orderBy | 4096000 | 0.000 | 6.74× |
| Array.prototype.sort, decorated | 2849391 | 0.000 | 9.68× |
| ramda.sortWith | 2259862 | 0.000 | 12.21× |
| lodash.orderBy | 1489455 | 0.001 | 18.53× |
| sort-on | 528516 | 0.002 | 52.21× |
| natural-orderby | 431158 | 0.002 | 64.00× |
| sort-by | 32000 | 0.031 | 862.32× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| thenby | 10922667 | 0.000 | 0.57× |
| es-toolkit.orderBy | 9709037 | 0.000 | 0.64× |
| fast-sort | 9362286 | 0.000 | 0.67× |
| inline comparator chain, slice().sort() | 7281778 | 0.000 | 0.86× |
| inline comparator chain, toSorted() | 6898526 | 0.000 | 0.90× |
| just-sort-by | 6553600 | 0.000 | 0.95× |
| fast-multisort | 6241524 | 0.000 | 1.00× |
| Array.prototype.sort, decorated | 5698783 | 0.000 | 1.10× |
| underscore.sortBy | 5461333 | 0.000 | 1.14× |
| ramda.sortWith | 5041231 | 0.000 | 1.24× |
| remeda.sortBy | 4369067 | 0.000 | 1.43× |
| sort-array | 2520615 | 0.000 | 2.48× |
| lodash.orderBy | 2427259 | 0.000 | 2.57× |
| natural-orderby | 468114 | 0.002 | 13.33× |
| sort-on | 264258 | 0.004 | 23.62× |
| sort-by | 107789 | 0.009 | 57.90× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 4519724 | 0.000 | 0.56× |
| inline comparator chain, toSorted() | 4519724 | 0.000 | 0.56× |
| es-toolkit.orderBy | 3120762 | 0.000 | 0.81× |
| Array.prototype.sort, decorated | 2730667 | 0.000 | 0.92× |
| fast-multisort | 2520615 | 0.000 | 1.00× |
| thenby (different order) | 2259862 | 0.000 | 1.12× |
| remeda.sortBy (different order) | 2184533 | 0.000 | 1.15× |
| ramda.sortWith (different order) | 1927529 | 0.001 | 1.31× |
| fast-sort (different order) | 1638400 | 0.001 | 1.54× |
| lodash.orderBy | 1489455 | 0.001 | 1.69× |
| sort-array (different order) | 1424696 | 0.001 | 1.77× |
| sort-on (different order) | 215579 | 0.005 | 11.69× |
| natural-orderby (different order) | 60235 | 0.017 | 41.85× |
| sort-by (different order) | 48762 | 0.021 | 51.69× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 546133 | 0.002 | 1.00× |
| inline comparator chain, slice().sort() | 256000 | 0.004 | 2.13× |
| inline comparator chain, toSorted() | 256000 | 0.004 | 2.13× |
| thenby | 157538 | 0.006 | 3.47× |
| underscore.sortBy | 146286 | 0.007 | 3.73× |
| Array.prototype.sort, decorated | 141241 | 0.007 | 3.87× |
| fast-sort | 124121 | 0.008 | 4.40× |
| es-toolkit.orderBy | 113778 | 0.009 | 4.80× |
| remeda.sortBy | 107789 | 0.009 | 5.07× |
| lodash.orderBy | 93091 | 0.011 | 5.87× |
| sort-array | 89043 | 0.011 | 6.13× |
| ramda.sortWith | 85333 | 0.012 | 6.40× |
| just-sort-by (different order) | 42667 | 0.023 | 12.80× |
| natural-orderby (different order) | 25600 | 0.039 | 21.33× |
| sort-on (different order) | 11130 | 0.090 | 49.07× |
| sort-by | 2783 | 0.359 | 196.27× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 256000 | 0.004 | 1.00× |
| inline comparator chain, slice().sort() | 234057 | 0.004 | 1.09× |
| inline comparator chain, toSorted() | 234057 | 0.004 | 1.09× |
| thenby | 128000 | 0.008 | 2.00× |
| underscore.sortBy | 113778 | 0.009 | 2.25× |
| fast-sort | 105026 | 0.010 | 2.44× |
| es-toolkit.orderBy | 102400 | 0.010 | 2.50× |
| remeda.sortBy | 102400 | 0.010 | 2.50× |
| Array.prototype.sort, decorated | 97524 | 0.010 | 2.63× |
| ramda.sortWith | 81920 | 0.012 | 3.13× |
| lodash.orderBy | 70621 | 0.014 | 3.63× |
| sort-array | 66065 | 0.015 | 3.88× |
| just-sort-by (different order) | 34133 | 0.029 | 7.50× |
| natural-orderby (different order) | 11130 | 0.090 | 23.00× |
| sort-on (different order) | 9143 | 0.109 | 28.00× |
| sort-by | 2560 | 0.391 | 100.00× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 431158 | 0.002 | 0.76× |
| inline comparator chain, toSorted() | 431158 | 0.002 | 0.76× |
| fast-multisort | 327680 | 0.003 | 1.00× |
| underscore.sortBy (different order) | 264258 | 0.004 | 1.24× |
| just-sort-by (different order) | 195048 | 0.005 | 1.68× |
| thenby (different order) | 178087 | 0.006 | 1.84× |
| Array.prototype.sort, decorated | 178087 | 0.006 | 1.84× |
| fast-sort | 170667 | 0.006 | 1.92× |
| es-toolkit.orderBy | 157538 | 0.006 | 2.08× |
| remeda.sortBy (different order) | 151704 | 0.007 | 2.16× |
| lodash.orderBy | 120471 | 0.008 | 2.72× |
| ramda.sortWith (different order) | 107789 | 0.009 | 3.04× |
| sort-array | 105026 | 0.010 | 3.12× |
| natural-orderby | 33032 | 0.030 | 9.92× |
| sort-on | 11636 | 0.086 | 28.16× |
| sort-by (different order) | 2783 | 0.359 | 117.76× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 409600 | 0.002 | 0.83× |
| inline comparator chain, toSorted() | 390095 | 0.003 | 0.88× |
| fast-multisort | 341333 | 0.003 | 1.00× |
| underscore.sortBy | 170667 | 0.006 | 2.00× |
| just-sort-by | 163840 | 0.006 | 2.08× |
| thenby | 141241 | 0.007 | 2.42× |
| Array.prototype.sort, decorated | 141241 | 0.007 | 2.42× |
| remeda.sortBy | 120471 | 0.008 | 2.83× |
| fast-sort | 120471 | 0.008 | 2.83× |
| es-toolkit.orderBy | 117029 | 0.009 | 2.92× |
| ramda.sortWith | 89043 | 0.011 | 3.83× |
| sort-array | 85333 | 0.012 | 4.00× |
| lodash.orderBy | 70621 | 0.014 | 4.83× |
| natural-orderby | 28444 | 0.035 | 12.00× |
| sort-on | 9481 | 0.105 | 36.00× |
| sort-by | 2667 | 0.375 | 128.00× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 215579 | 0.005 | 0.73× |
| inline comparator chain, slice().sort() | 210051 | 0.005 | 0.75× |
| fast-multisort | 157538 | 0.006 | 1.00× |
| underscore.sortBy | 105026 | 0.010 | 1.50× |
| thenby | 102400 | 0.010 | 1.54× |
| Array.prototype.sort, decorated | 102400 | 0.010 | 1.54× |
| remeda.sortBy | 93091 | 0.011 | 1.69× |
| fast-sort | 93091 | 0.011 | 1.69× |
| es-toolkit.orderBy | 89043 | 0.011 | 1.77× |
| ramda.sortWith | 81920 | 0.012 | 1.92× |
| lodash.orderBy | 70621 | 0.014 | 2.23× |
| sort-array | 68267 | 0.015 | 2.31× |
| just-sort-by | 58514 | 0.017 | 2.69× |
| sort-on | 8828 | 0.113 | 17.85× |
| natural-orderby | 8000 | 0.125 | 19.69× |
| sort-by | 2560 | 0.391 | 61.54× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 2048000 | 0.000 | 0.73× |
| inline comparator chain, slice().sort() | 1985939 | 0.001 | 0.75× |
| fast-multisort | 1489455 | 0.001 | 1.00× |
| just-sort-by | 1170286 | 0.001 | 1.27× |
| fast-sort | 963765 | 0.001 | 1.55× |
| thenby | 885622 | 0.001 | 1.68× |
| es-toolkit.orderBy | 862316 | 0.001 | 1.73× |
| remeda.sortBy | 744727 | 0.001 | 2.00× |
| Array.prototype.sort, decorated | 712348 | 0.001 | 2.09× |
| underscore.sortBy | 712348 | 0.001 | 2.09× |
| ramda.sortWith | 655360 | 0.002 | 2.27× |
| sort-array | 630154 | 0.002 | 2.36× |
| lodash.orderBy | 315077 | 0.003 | 4.73× |
| sort-on | 56889 | 0.018 | 26.18× |
| natural-orderby | 40960 | 0.024 | 36.36× |
| sort-by | 14629 | 0.068 | 101.82× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1985939 | 0.001 | 0.66× |
| inline comparator chain, toSorted() | 1985939 | 0.001 | 0.66× |
| fast-multisort | 1310720 | 0.001 | 1.00× |
| just-sort-by | 1170286 | 0.001 | 1.12× |
| thenby | 1024000 | 0.001 | 1.28× |
| fast-sort | 963765 | 0.001 | 1.36× |
| es-toolkit.orderBy | 862316 | 0.001 | 1.52× |
| Array.prototype.sort, decorated | 744727 | 0.001 | 1.76× |
| remeda.sortBy | 712348 | 0.001 | 1.84× |
| underscore.sortBy | 682667 | 0.001 | 1.92× |
| sort-array | 655360 | 0.002 | 2.00× |
| ramda.sortWith | 630154 | 0.002 | 2.08× |
| lodash.orderBy | 303407 | 0.003 | 4.32× |
| sort-on | 48762 | 0.021 | 26.88× |
| natural-orderby | 40960 | 0.024 | 32.00× |
| sort-by | 14222 | 0.070 | 92.16× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 992970 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 963765 | 0.001 | 1.03× |
| just-sort-by | 862316 | 0.001 | 1.15× |
| inline comparator chain, slice().sort() | 799220 | 0.001 | 1.24× |
| thenby | 744727 | 0.001 | 1.33× |
| fast-sort | 682667 | 0.001 | 1.45× |
| es-toolkit.orderBy | 630154 | 0.002 | 1.58× |
| Array.prototype.sort, decorated | 585143 | 0.002 | 1.70× |
| remeda.sortBy | 564966 | 0.002 | 1.76× |
| underscore.sortBy | 564966 | 0.002 | 1.76× |
| ramda.sortWith | 481882 | 0.002 | 2.06× |
| sort-array | 468114 | 0.002 | 2.12× |
| lodash.orderBy | 264258 | 0.004 | 3.76× |
| sort-on | 42667 | 0.023 | 23.27× |
| natural-orderby | 40960 | 0.024 | 24.24× |
| sort-by | 11130 | 0.090 | 89.21× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 221405 | 0.005 | 0.74× |
| inline comparator chain, toSorted() | 221405 | 0.005 | 0.74× |
| fast-multisort | 163840 | 0.006 | 1.00× |
| Array.prototype.sort, decorated | 120471 | 0.008 | 1.36× |
| es-toolkit.orderBy | 110703 | 0.009 | 1.48× |
| remeda.sortBy (different order) | 105026 | 0.010 | 1.56× |
| lodash.orderBy | 85333 | 0.012 | 1.92× |
| thenby (different order) | 85333 | 0.012 | 1.92× |
| fast-sort (different order) | 78769 | 0.013 | 2.08× |
| ramda.sortWith (different order) | 70621 | 0.014 | 2.32× |
| sort-array (different order) | 64000 | 0.016 | 2.56× |
| sort-on (different order) | 7758 | 0.129 | 21.12× |
| natural-orderby (different order) | 5818 | 0.172 | 28.16× |
| sort-by (different order) | 1778 | 0.563 | 92.16× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 52513 | 0.019 | 1.00× |
| inline comparator chain, slice().sort() | 18286 | 0.055 | 2.87× |
| inline comparator chain, toSorted() | 18286 | 0.055 | 2.87× |
| thenby | 11130 | 0.090 | 4.72× |
| underscore.sortBy | 11130 | 0.090 | 4.72× |
| Array.prototype.sort, decorated | 9846 | 0.102 | 5.33× |
| fast-sort | 8533 | 0.117 | 6.15× |
| es-toolkit.orderBy | 8000 | 0.125 | 6.56× |
| remeda.sortBy | 7758 | 0.129 | 6.77× |
| lodash.orderBy | 7111 | 0.141 | 7.38× |
| sort-array | 6919 | 0.145 | 7.59× |
| ramda.sortWith | 6737 | 0.148 | 7.79× |
| just-sort-by (different order) | 3200 | 0.313 | 16.41× |
| natural-orderby (different order) | 2370 | 0.422 | 22.15× |
| sort-on (different order) | 889 | 1.125 | 59.08× |
| sort-by | 216 | 4.625 | 242.87× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14222 | 0.070 | 1.00× |
| inline comparator chain, slice().sort() | 11130 | 0.090 | 1.28× |
| inline comparator chain, toSorted() | 10667 | 0.094 | 1.33× |
| underscore.sortBy | 6564 | 0.152 | 2.17× |
| thenby | 6400 | 0.156 | 2.22× |
| Array.prototype.sort, decorated | 6400 | 0.156 | 2.22× |
| remeda.sortBy | 6095 | 0.164 | 2.33× |
| fast-sort | 6095 | 0.164 | 2.33× |
| es-toolkit.orderBy | 5818 | 0.172 | 2.44× |
| ramda.sortWith | 5120 | 0.195 | 2.78× |
| lodash.orderBy | 4571 | 0.219 | 3.11× |
| sort-array | 4571 | 0.219 | 3.11× |
| just-sort-by (different order) | 2000 | 0.500 | 7.11× |
| natural-orderby (different order) | 842 | 1.188 | 16.89× |
| sort-on (different order) | 552 | 1.813 | 25.78× |
| sort-by | 167 | 6.000 | 85.33× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 39385 | 0.025 | 1.00× |
| inline comparator chain, toSorted() | 23273 | 0.043 | 1.69× |
| inline comparator chain, slice().sort() | 22261 | 0.045 | 1.77× |
| underscore.sortBy (different order) | 18286 | 0.055 | 2.15× |
| just-sort-by (different order) | 12190 | 0.082 | 3.23× |
| fast-sort | 11130 | 0.090 | 3.54× |
| thenby (different order) | 11130 | 0.090 | 3.54× |
| Array.prototype.sort, decorated | 11130 | 0.090 | 3.54× |
| remeda.sortBy (different order) | 10240 | 0.098 | 3.85× |
| es-toolkit.orderBy | 9846 | 0.102 | 4.00× |
| lodash.orderBy | 7758 | 0.129 | 5.08× |
| ramda.sortWith (different order) | 7314 | 0.137 | 5.38× |
| sort-array | 7111 | 0.141 | 5.54× |
| natural-orderby | 2783 | 0.359 | 14.15× |
| sort-on | 762 | 1.313 | 51.69× |
| sort-by (different order) | 174 | 5.750 | 226.46× |

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
| sort-array | 5565 | 0.180 | 6.34× |
| lodash.orderBy | 4571 | 0.219 | 7.72× |
| natural-orderby | 2370 | 0.422 | 14.90× |
| sort-on | 615 | 1.625 | 57.38× |
| sort-by | 167 | 6.000 | 211.86× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14222 | 0.070 | 1.00× |
| inline comparator chain, slice().sort() | 10240 | 0.098 | 1.39× |
| inline comparator chain, toSorted() | 10240 | 0.098 | 1.39× |
| underscore.sortBy | 6400 | 0.156 | 2.22× |
| fast-sort | 6095 | 0.164 | 2.33× |
| thenby | 6095 | 0.164 | 2.33× |
| Array.prototype.sort, decorated | 6095 | 0.164 | 2.33× |
| remeda.sortBy | 5818 | 0.172 | 2.44× |
| es-toolkit.orderBy | 5565 | 0.180 | 2.56× |
| ramda.sortWith | 4923 | 0.203 | 2.89× |
| lodash.orderBy | 4571 | 0.219 | 3.11× |
| sort-array | 4267 | 0.234 | 3.33× |
| just-sort-by | 3657 | 0.273 | 3.89× |
| natural-orderby | 727 | 1.375 | 19.56× |
| sort-on | 552 | 1.813 | 25.78× |
| sort-by | 160 | 6.250 | 88.89× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 292571 | 0.003 | 1.00× |
| inline comparator chain, slice().sort() | 204800 | 0.005 | 1.43× |
| inline comparator chain, toSorted() | 204800 | 0.005 | 1.43× |
| just-sort-by | 124121 | 0.008 | 2.36× |
| thenby | 107789 | 0.009 | 2.71× |
| fast-sort | 102400 | 0.010 | 2.86× |
| es-toolkit.orderBy | 89043 | 0.011 | 3.29× |
| remeda.sortBy | 78769 | 0.013 | 3.71× |
| Array.prototype.sort, decorated | 78769 | 0.013 | 3.71× |
| underscore.sortBy | 75852 | 0.013 | 3.86× |
| ramda.sortWith | 70621 | 0.014 | 4.14× |
| sort-array | 66065 | 0.015 | 4.43× |
| lodash.orderBy | 33032 | 0.030 | 8.86× |
| sort-on | 5818 | 0.172 | 50.29× |
| natural-orderby | 4267 | 0.234 | 68.57× |
| sort-by | 1455 | 0.688 | 201.14× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 227556 | 0.004 | 1.00× |
| inline comparator chain, slice().sort() | 195048 | 0.005 | 1.17× |
| inline comparator chain, toSorted() | 195048 | 0.005 | 1.17× |
| just-sort-by | 120471 | 0.008 | 1.89× |
| thenby | 110703 | 0.009 | 2.06× |
| fast-sort | 102400 | 0.010 | 2.22× |
| es-toolkit.orderBy | 89043 | 0.011 | 2.56× |
| Array.prototype.sort, decorated | 78769 | 0.013 | 2.89× |
| remeda.sortBy | 73143 | 0.014 | 3.11× |
| underscore.sortBy | 73143 | 0.014 | 3.11× |
| ramda.sortWith | 70621 | 0.014 | 3.22× |
| sort-array | 66065 | 0.015 | 3.44× |
| lodash.orderBy | 31030 | 0.032 | 7.33× |
| sort-on | 4741 | 0.211 | 48.00× |
| natural-orderby | 4129 | 0.242 | 55.11× |
| sort-by | 1391 | 0.719 | 163.56× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 117029 | 0.009 | 0.83× |
| fast-multisort | 97524 | 0.010 | 1.00× |
| inline comparator chain, toSorted() | 97524 | 0.010 | 1.00× |
| fast-sort | 97524 | 0.010 | 1.00× |
| thenby | 97524 | 0.010 | 1.00× |
| inline comparator chain, slice().sort() | 89043 | 0.011 | 1.10× |
| es-toolkit.orderBy | 85333 | 0.012 | 1.14× |
| remeda.sortBy | 73143 | 0.014 | 1.33× |
| underscore.sortBy | 73143 | 0.014 | 1.33× |
| ramda.sortWith | 66065 | 0.015 | 1.48× |
| Array.prototype.sort, decorated | 66065 | 0.015 | 1.48× |
| sort-array | 51200 | 0.020 | 1.90× |
| lodash.orderBy | 31030 | 0.032 | 3.14× |
| sort-on | 5565 | 0.180 | 17.52× |
| natural-orderby | 4129 | 0.242 | 23.62× |
| sort-by | 1455 | 0.688 | 67.05× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12800 | 0.078 | 1.00× |
| inline comparator chain, slice().sort() | 10667 | 0.094 | 1.20× |
| inline comparator chain, toSorted() | 10667 | 0.094 | 1.20× |
| es-toolkit.orderBy | 5818 | 0.172 | 2.20× |
| remeda.sortBy (different order) | 5565 | 0.180 | 2.30× |
| lodash.orderBy | 5333 | 0.188 | 2.40× |
| thenby (different order) | 4571 | 0.219 | 2.80× |
| fast-sort (different order) | 4414 | 0.227 | 2.90× |
| ramda.sortWith (different order) | 4000 | 0.250 | 3.20× |
| Array.prototype.sort, decorated | 3556 | 0.281 | 3.60× |
| sort-array (different order) | 2207 | 0.453 | 5.80× |
| natural-orderby (different order) | 516 | 1.938 | 24.80× |
| sort-on (different order) | 421 | 2.375 | 30.40× |
| sort-by (different order) | 95 | 10.500 | 134.40× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4923 | 0.203 | 1.00× |
| inline comparator chain, slice().sort() | 1280 | 0.781 | 3.85× |
| inline comparator chain, toSorted() | 1280 | 0.781 | 3.85× |
| underscore.sortBy | 970 | 1.031 | 5.08× |
| thenby | 941 | 1.063 | 5.23× |
| fast-sort | 762 | 1.313 | 6.46× |
| es-toolkit.orderBy | 727 | 1.375 | 6.77× |
| remeda.sortBy | 696 | 1.438 | 7.08× |
| lodash.orderBy | 667 | 1.500 | 7.38× |
| ramda.sortWith | 615 | 1.625 | 8.00× |
| Array.prototype.sort, decorated | 593 | 1.688 | 8.31× |
| sort-array | 400 | 2.500 | 12.31× |
| just-sort-by (different order) | 296 | 3.375 | 16.62× |
| natural-orderby (different order) | 222 | 4.500 | 22.15× |
| sort-on (different order) | 91 | 11.000 | 54.15× |
| sort-by | 21 | 47.000 | 231.38× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1185 | 0.844 | 1.00× |
| inline comparator chain, slice().sort() | 571 | 1.750 | 2.07× |
| inline comparator chain, toSorted() | 571 | 1.750 | 2.07× |
| underscore.sortBy | 432 | 2.313 | 2.74× |
| fast-sort | 421 | 2.375 | 2.81× |
| thenby | 410 | 2.438 | 2.89× |
| remeda.sortBy | 400 | 2.500 | 2.96× |
| es-toolkit.orderBy | 381 | 2.625 | 3.11× |
| ramda.sortWith | 333 | 3.000 | 3.56× |
| lodash.orderBy | 308 | 3.250 | 3.85× |
| Array.prototype.sort, decorated | 296 | 3.375 | 4.00× |
| sort-array | 200 | 5.000 | 5.93× |
| just-sort-by (different order) | 138 | 7.250 | 8.59× |
| natural-orderby (different order) | 63 | 16.000 | 18.96× |
| sort-on (different order) | 40 | 25.000 | 29.63× |
| sort-by | 11 | 87.000 | 103.11× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4267 | 0.234 | 1.00× |
| inline comparator chain, slice().sort() | 1185 | 0.844 | 3.60× |
| inline comparator chain, toSorted() | 1185 | 0.844 | 3.60× |
| underscore.sortBy (different order) | 1000 | 1.000 | 4.27× |
| fast-sort | 762 | 1.313 | 5.60× |
| just-sort-by (different order) | 762 | 1.313 | 5.60× |
| thenby (different order) | 696 | 1.438 | 6.13× |
| es-toolkit.orderBy | 667 | 1.500 | 6.40× |
| remeda.sortBy (different order) | 667 | 1.500 | 6.40× |
| lodash.orderBy | 533 | 1.875 | 8.00× |
| ramda.sortWith (different order) | 533 | 1.875 | 8.00× |
| Array.prototype.sort, decorated | 421 | 2.375 | 10.13× |
| sort-array | 296 | 3.375 | 14.40× |
| natural-orderby | 211 | 4.750 | 20.27× |
| sort-on | 57 | 17.500 | 74.67× |
| sort-by (different order) | 13 | 79.000 | 337.07× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3657 | 0.273 | 1.00× |
| inline comparator chain, slice().sort() | 865 | 1.156 | 4.23× |
| inline comparator chain, toSorted() | 865 | 1.156 | 4.23× |
| underscore.sortBy | 615 | 1.625 | 5.94× |
| just-sort-by | 593 | 1.688 | 6.17× |
| fast-sort | 552 | 1.813 | 6.63× |
| remeda.sortBy | 533 | 1.875 | 6.86× |
| thenby | 533 | 1.875 | 6.86× |
| es-toolkit.orderBy | 500 | 2.000 | 7.31× |
| ramda.sortWith | 432 | 2.313 | 8.46× |
| Array.prototype.sort, decorated | 348 | 2.875 | 10.51× |
| lodash.orderBy | 320 | 3.125 | 11.43× |
| sort-array | 242 | 4.125 | 15.09× |
| natural-orderby | 174 | 5.750 | 21.03× |
| sort-on | 43 | 23.000 | 84.11× |
| sort-by | 12 | 83.000 | 303.54× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1103 | 0.906 | 1.00× |
| inline comparator chain, slice().sort() | 533 | 1.875 | 2.07× |
| inline comparator chain, toSorted() | 533 | 1.875 | 2.07× |
| underscore.sortBy | 421 | 2.375 | 2.62× |
| fast-sort | 400 | 2.500 | 2.76× |
| thenby | 400 | 2.500 | 2.76× |
| remeda.sortBy | 381 | 2.625 | 2.90× |
| es-toolkit.orderBy | 364 | 2.750 | 3.03× |
| ramda.sortWith | 333 | 3.000 | 3.31× |
| lodash.orderBy | 286 | 3.500 | 3.86× |
| Array.prototype.sort, decorated | 286 | 3.500 | 3.86× |
| just-sort-by | 250 | 4.000 | 4.41× |
| sort-array | 200 | 5.000 | 5.52× |
| natural-orderby | 57 | 17.500 | 19.31× |
| sort-on | 38 | 26.000 | 28.69× |
| sort-by | 11 | 87.000 | 96.00× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 20480 | 0.049 | 0.46× |
| inline comparator chain, toSorted() | 20480 | 0.049 | 0.46× |
| just-sort-by | 11636 | 0.086 | 0.81× |
| thenby | 10667 | 0.094 | 0.89× |
| fast-sort | 10240 | 0.098 | 0.93× |
| fast-multisort | 9481 | 0.105 | 1.00× |
| es-toolkit.orderBy | 8828 | 0.113 | 1.07× |
| remeda.sortBy | 8828 | 0.113 | 1.07× |
| underscore.sortBy | 7758 | 0.129 | 1.22× |
| ramda.sortWith | 6919 | 0.145 | 1.37× |
| Array.prototype.sort, decorated | 4741 | 0.211 | 2.00× |
| sort-array | 3459 | 0.289 | 2.74× |
| lodash.orderBy | 3200 | 0.313 | 2.96× |
| sort-on | 552 | 1.813 | 17.19× |
| natural-orderby | 381 | 2.625 | 24.89× |
| sort-by | 143 | 7.000 | 66.37× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24381 | 0.041 | 1.00× |
| inline comparator chain, toSorted() | 20480 | 0.049 | 1.19× |
| inline comparator chain, slice().sort() | 19692 | 0.051 | 1.24× |
| just-sort-by | 11636 | 0.086 | 2.10× |
| thenby | 10667 | 0.094 | 2.29× |
| fast-sort | 10240 | 0.098 | 2.38× |
| es-toolkit.orderBy | 8828 | 0.113 | 2.76× |
| remeda.sortBy | 8533 | 0.117 | 2.86× |
| underscore.sortBy | 7314 | 0.137 | 3.33× |
| ramda.sortWith | 6919 | 0.145 | 3.52× |
| Array.prototype.sort, decorated | 4923 | 0.203 | 4.95× |
| sort-array | 3657 | 0.273 | 6.67× |
| lodash.orderBy | 3048 | 0.328 | 8.00× |
| sort-on | 471 | 2.125 | 51.81× |
| natural-orderby | 381 | 2.625 | 64.00× |
| sort-by | 138 | 7.250 | 176.76× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 12190 | 0.082 | 0.95× |
| fast-multisort | 11636 | 0.086 | 1.00× |
| inline comparator chain, slice().sort() | 9143 | 0.109 | 1.27× |
| thenby | 7758 | 0.129 | 1.50× |
| fast-sort | 7529 | 0.133 | 1.55× |
| just-sort-by | 7529 | 0.133 | 1.55× |
| remeda.sortBy | 7314 | 0.137 | 1.59× |
| es-toolkit.orderBy | 6919 | 0.145 | 1.68× |
| underscore.sortBy | 6095 | 0.164 | 1.91× |
| ramda.sortWith | 5818 | 0.172 | 2.00× |
| Array.prototype.sort, decorated | 4129 | 0.242 | 2.82× |
| sort-array | 2909 | 0.344 | 4.00× |
| lodash.orderBy | 2560 | 0.391 | 4.55× |
| sort-on | 552 | 1.813 | 21.09× |
| natural-orderby | 364 | 2.750 | 32.00× |
| sort-by | 143 | 7.000 | 81.45× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1730 | 0.578 | 1.00× |
| inline comparator chain, toSorted() | 615 | 1.625 | 2.81× |
| inline comparator chain, slice().sort() | 593 | 1.688 | 2.92× |
| lodash.orderBy | 381 | 2.625 | 4.54× |
| es-toolkit.orderBy | 381 | 2.625 | 4.54× |
| remeda.sortBy (different order) | 364 | 2.750 | 4.76× |
| thenby (different order) | 320 | 3.125 | 5.41× |
| fast-sort (different order) | 296 | 3.375 | 5.84× |
| ramda.sortWith (different order) | 276 | 3.625 | 6.27× |
| Array.prototype.sort, decorated | 250 | 4.000 | 6.92× |
| sort-array (different order) | 154 | 6.500 | 11.24× |
| natural-orderby (different order) | 48 | 21.000 | 36.32× |
| sort-on (different order) | 28 | 36.000 | 62.27× |
| sort-by (different order) | 7 | 153.000 | 264.65× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 457 | 2.188 | 1.00× |
| inline comparator chain, slice().sort() | 108 | 9.250 | 4.23× |
| inline comparator chain, toSorted() | 108 | 9.250 | 4.23× |
| underscore.sortBy | 87 | 11.500 | 5.26× |
| thenby | 83 | 12.000 | 5.49× |
| fast-sort | 71 | 14.000 | 6.40× |
| es-toolkit.orderBy | 67 | 15.000 | 6.86× |
| remeda.sortBy | 65 | 15.500 | 7.09× |
| lodash.orderBy | 61 | 16.500 | 7.54× |
| ramda.sortWith | 59 | 17.000 | 7.77× |
| Array.prototype.sort, decorated | 54 | 18.500 | 8.46× |
| sort-array | 38 | 26.000 | 11.89× |
| just-sort-by (different order) | 28 | 36.000 | 16.46× |
| natural-orderby (different order) | 21 | 48.000 | 21.94× |
| sort-on (different order) | 8 | 128.000 | 58.51× |
| sort-by | 2 | 483.000 | 220.80× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 74 | 13.500 | 1.00× |
| inline comparator chain, slice().sort() | 36 | 28.000 | 2.07× |
| inline comparator chain, toSorted() | 36 | 28.000 | 2.07× |
| underscore.sortBy | 29 | 35.000 | 2.59× |
| fast-sort | 26 | 39.000 | 2.89× |
| remeda.sortBy | 25 | 40.000 | 2.96× |
| thenby | 25 | 40.000 | 2.96× |
| es-toolkit.orderBy | 23 | 43.000 | 3.19× |
| ramda.sortWith | 21 | 48.000 | 3.56× |
| lodash.orderBy | 17 | 60.000 | 4.44× |
| Array.prototype.sort, decorated | 17 | 60.000 | 4.44× |
| sort-array | 13 | 78.000 | 5.78× |
| just-sort-by (different order) | 9 | 114.000 | 8.44× |
| natural-orderby (different order) | 3 | 305.000 | 22.59× |
| sort-on (different order) | 3 | 353.000 | 26.15× |
| sort-by | 1 | 1107.000 | 82.00× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 444 | 2.250 | 1.00× |
| inline comparator chain, slice().sort() | 80 | 12.500 | 5.56× |
| inline comparator chain, toSorted() | 80 | 12.500 | 5.56× |
| underscore.sortBy (different order) | 71 | 14.000 | 6.22× |
| fast-sort | 57 | 17.500 | 7.78× |
| just-sort-by (different order) | 57 | 17.500 | 7.78× |
| thenby (different order) | 53 | 19.000 | 8.44× |
| es-toolkit.orderBy | 50 | 20.000 | 8.89× |
| remeda.sortBy (different order) | 50 | 20.000 | 8.89× |
| ramda.sortWith (different order) | 40 | 25.000 | 11.11× |
| lodash.orderBy | 36 | 28.000 | 12.44× |
| Array.prototype.sort, decorated | 30 | 33.000 | 14.67× |
| sort-array | 24 | 42.000 | 18.67× |
| natural-orderby | 14 | 72.000 | 32.00× |
| sort-on | 4 | 244.000 | 108.44× |
| sort-by (different order) | 1 | 970.000 | 431.11× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 364 | 2.750 | 1.00× |
| inline comparator chain, slice().sort() | 63 | 16.000 | 5.82× |
| inline comparator chain, toSorted() | 61 | 16.500 | 6.00× |
| underscore.sortBy | 45 | 22.000 | 8.00× |
| just-sort-by | 43 | 23.000 | 8.36× |
| fast-sort | 42 | 24.000 | 8.73× |
| remeda.sortBy | 40 | 25.000 | 9.09× |
| thenby | 40 | 25.000 | 9.09× |
| es-toolkit.orderBy | 37 | 27.000 | 9.82× |
| ramda.sortWith | 32 | 31.000 | 11.27× |
| Array.prototype.sort, decorated | 24 | 41.000 | 14.91× |
| lodash.orderBy | 21 | 47.000 | 17.09× |
| sort-array | 19 | 53.000 | 19.27× |
| natural-orderby | 11 | 94.000 | 34.18× |
| sort-on | 3 | 313.000 | 113.82× |
| sort-by | 1 | 1055.000 | 383.64× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 43 | 23.500 | 1.00× |
| inline comparator chain, slice().sort() | 28 | 36.000 | 1.53× |
| inline comparator chain, toSorted() | 26 | 38.000 | 1.62× |
| remeda.sortBy | 22 | 46.000 | 1.96× |
| fast-sort | 22 | 46.000 | 1.96× |
| thenby | 21 | 47.000 | 2.00× |
| es-toolkit.orderBy | 21 | 48.000 | 2.04× |
| underscore.sortBy | 21 | 48.000 | 2.04× |
| ramda.sortWith | 19 | 54.000 | 2.30× |
| Array.prototype.sort, decorated | 13 | 77.000 | 3.28× |
| just-sort-by | 12 | 81.000 | 3.45× |
| lodash.orderBy | 12 | 86.000 | 3.66× |
| sort-array | 11 | 88.000 | 3.74× |
| natural-orderby (different order) | 3 | 376.000 | 16.00× |
| sort-on | 3 | 397.000 | 16.89× |
| sort-by | 1 | 1182.000 | 50.30× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3048 | 0.328 | 1.00× |
| inline comparator chain, slice().sort() | 1455 | 0.688 | 2.10× |
| inline comparator chain, toSorted() | 1103 | 0.906 | 2.76× |
| just-sort-by | 941 | 1.063 | 3.24× |
| thenby | 889 | 1.125 | 3.43× |
| fast-sort | 865 | 1.156 | 3.52× |
| es-toolkit.orderBy | 762 | 1.313 | 4.00× |
| remeda.sortBy | 762 | 1.313 | 4.00× |
| ramda.sortWith | 640 | 1.563 | 4.76× |
| underscore.sortBy | 615 | 1.625 | 4.95× |
| Array.prototype.sort, decorated | 381 | 2.625 | 8.00× |
| sort-array | 320 | 3.125 | 9.52× |
| lodash.orderBy | 286 | 3.500 | 10.67× |
| sort-on | 53 | 19.000 | 57.90× |
| natural-orderby | 36 | 28.000 | 85.33× |
| sort-by | 14 | 69.000 | 210.29× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2462 | 0.406 | 1.00× |
| inline comparator chain, slice().sort() | 1391 | 0.719 | 1.77× |
| inline comparator chain, toSorted() | 1103 | 0.906 | 2.23× |
| just-sort-by | 970 | 1.031 | 2.54× |
| thenby | 889 | 1.125 | 2.77× |
| fast-sort | 842 | 1.188 | 2.92× |
| es-toolkit.orderBy | 762 | 1.313 | 3.23× |
| remeda.sortBy | 727 | 1.375 | 3.38× |
| ramda.sortWith | 640 | 1.563 | 3.85× |
| underscore.sortBy | 593 | 1.688 | 4.15× |
| Array.prototype.sort, decorated | 381 | 2.625 | 6.46× |
| sort-array | 348 | 2.875 | 7.08× |
| lodash.orderBy | 267 | 3.750 | 9.23× |
| sort-on | 43 | 23.000 | 56.62× |
| natural-orderby | 34 | 29.000 | 71.38× |
| sort-by | 14 | 72.000 | 177.23× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1455 | 0.688 | 1.00× |
| just-sort-by | 842 | 1.188 | 1.73× |
| inline comparator chain, slice().sort() | 800 | 1.250 | 1.82× |
| inline comparator chain, toSorted() | 800 | 1.250 | 1.82× |
| fast-sort | 800 | 1.250 | 1.82× |
| thenby | 800 | 1.250 | 1.82× |
| remeda.sortBy | 727 | 1.375 | 2.00× |
| es-toolkit.orderBy | 696 | 1.438 | 2.09× |
| ramda.sortWith | 593 | 1.688 | 2.45× |
| underscore.sortBy | 552 | 1.813 | 2.64× |
| Array.prototype.sort, decorated | 364 | 2.750 | 4.00× |
| sort-array | 320 | 3.125 | 4.55× |
| lodash.orderBy | 276 | 3.625 | 5.27× |
| sort-on | 56 | 18.000 | 26.18× |
| natural-orderby | 36 | 28.000 | 40.73× |
| sort-by | 15 | 68.000 | 98.91× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 154 | 6.500 | 1.00× |
| inline comparator chain, slice().sort() | 37 | 27.000 | 4.15× |
| inline comparator chain, toSorted() | 37 | 27.000 | 4.15× |
| es-toolkit.orderBy | 25 | 40.000 | 6.15× |
| remeda.sortBy (different order) | 24 | 41.000 | 6.31× |
| thenby (different order) | 22 | 45.000 | 6.92× |
| fast-sort (different order) | 20 | 51.000 | 7.85× |
| lodash.orderBy | 19 | 53.000 | 8.15× |
| ramda.sortWith (different order) | 19 | 54.000 | 8.31× |
| Array.prototype.sort, decorated | 14 | 69.000 | 10.62× |
| sort-array (different order) | 11 | 92.000 | 14.15× |
| natural-orderby (different order) | 3 | 295.000 | 45.38× |
| sort-on (different order) | 2 | 518.000 | 79.69× |
| sort-by (different order) | 0 | 2013.000 | 309.69× |

### Firefox 158.0

#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.97× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.94× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.40× |
| sort-on | 49932190 | 0.000 | 2.40× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.66× |
| thenby | 30840471 | 0.000 | 3.89× |
| sort-by | 29959314 | 0.000 | 4.00× |
| fast-sort | 20971520 | 0.000 | 5.71× |
| ramda.sortWith | 18724571 | 0.000 | 6.40× |
| sort-array | 18078897 | 0.000 | 6.63× |
| remeda.sortBy | 16912516 | 0.000 | 7.09× |
| underscore.sortBy | 14169946 | 0.000 | 8.46× |
| lodash.orderBy | 9709037 | 0.000 | 12.34× |
| natural-orderby | 3744914 | 0.000 | 32.00× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.97× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.94× |
| sort-on | 52428800 | 0.000 | 2.29× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.40× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.66× |
| thenby | 29959314 | 0.000 | 4.00× |
| sort-by | 29959314 | 0.000 | 4.00× |
| fast-sort | 20164923 | 0.000 | 5.94× |
| ramda.sortWith | 18724571 | 0.000 | 6.40× |
| sort-array | 18078897 | 0.000 | 6.63× |
| remeda.sortBy | 16912516 | 0.000 | 7.09× |
| underscore.sortBy | 13797053 | 0.000 | 8.69× |
| lodash.orderBy | 9362286 | 0.000 | 12.80× |
| natural-orderby | 1638400 | 0.001 | 73.14× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.61× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.94× |
| fast-multisort | 116508444 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.89× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.33× |
| sort-on | 49932190 | 0.000 | 2.33× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.67× |
| thenby | 29127111 | 0.000 | 4.00× |
| sort-by | 29127111 | 0.000 | 4.00× |
| fast-sort | 20164923 | 0.000 | 5.78× |
| ramda.sortWith | 18724571 | 0.000 | 6.22× |
| sort-array | 18078897 | 0.000 | 6.44× |
| remeda.sortBy | 16912516 | 0.000 | 6.89× |
| underscore.sortBy | 13797053 | 0.000 | 8.44× |
| lodash.orderBy | 9362286 | 0.000 | 12.44× |
| natural-orderby | 2520615 | 0.000 | 46.22× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.61× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.94× |
| fast-multisort | 116508444 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.83× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.33× |
| sort-on | 49932190 | 0.000 | 2.33× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.56× |
| sort-by | 29959314 | 0.000 | 3.89× |
| thenby | 29127111 | 0.000 | 4.00× |
| fast-sort | 20971520 | 0.000 | 5.56× |
| ramda.sortWith | 18724571 | 0.000 | 6.22× |
| sort-array | 18078897 | 0.000 | 6.44× |
| remeda.sortBy | 17476267 | 0.000 | 6.67× |
| underscore.sortBy | 13443282 | 0.000 | 8.67× |
| lodash.orderBy | 9362286 | 0.000 | 12.44× |
| natural-orderby | 2259862 | 0.000 | 51.56× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.97× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.94× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.40× |
| sort-on | 49932190 | 0.000 | 2.40× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.66× |
| thenby | 29127111 | 0.000 | 4.11× |
| sort-by | 29127111 | 0.000 | 4.11× |
| fast-sort | 20164923 | 0.000 | 5.94× |
| ramda.sortWith | 18724571 | 0.000 | 6.40× |
| sort-array | 18078897 | 0.000 | 6.63× |
| remeda.sortBy | 16912516 | 0.000 | 7.09× |
| underscore.sortBy | 13107200 | 0.000 | 9.14× |
| lodash.orderBy | 9362286 | 0.000 | 12.80× |
| natural-orderby | 606815 | 0.002 | 197.49× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.61× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.94× |
| fast-multisort | 116508444 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 61680941 | 0.000 | 1.89× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.33× |
| sort-on | 49932190 | 0.000 | 2.33× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.56× |
| thenby | 29127111 | 0.000 | 4.00× |
| sort-by | 29127111 | 0.000 | 4.00× |
| fast-sort | 20164923 | 0.000 | 5.78× |
| ramda.sortWith | 18724571 | 0.000 | 6.22× |
| sort-array | 18078897 | 0.000 | 6.44× |
| remeda.sortBy | 16912516 | 0.000 | 6.89× |
| underscore.sortBy | 13443282 | 0.000 | 8.67× |
| lodash.orderBy | 9362286 | 0.000 | 12.44× |
| natural-orderby | 2730667 | 0.000 | 42.67× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.61× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.94× |
| fast-multisort | 116508444 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.83× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.33× |
| sort-on | 49932190 | 0.000 | 2.33× |
| Array.prototype.sort, decorated | 32768000 | 0.000 | 3.56× |
| thenby | 29127111 | 0.000 | 4.00× |
| sort-by | 29127111 | 0.000 | 4.00× |
| fast-sort | 20164923 | 0.000 | 5.78× |
| ramda.sortWith | 18724571 | 0.000 | 6.22× |
| sort-array | 18078897 | 0.000 | 6.44× |
| remeda.sortBy | 16912516 | 0.000 | 6.89× |
| underscore.sortBy | 13107200 | 0.000 | 8.89× |
| lodash.orderBy | 9362286 | 0.000 | 12.44× |
| natural-orderby | 2730667 | 0.000 | 42.67× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 190650182 | 0.000 | 0.63× |
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.97× |
| fast-multisort | 119837257 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 63550061 | 0.000 | 1.89× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.40× |
| sort-on | 49932190 | 0.000 | 2.40× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.77× |
| sort-by | 29959314 | 0.000 | 4.00× |
| thenby | 29127111 | 0.000 | 4.11× |
| fast-sort | 20971520 | 0.000 | 5.71× |
| ramda.sortWith | 18724571 | 0.000 | 6.40× |
| sort-array | 18078897 | 0.000 | 6.63× |
| remeda.sortBy | 16912516 | 0.000 | 7.09× |
| underscore.sortBy | 13797053 | 0.000 | 8.69× |
| lodash.orderBy | 9362286 | 0.000 | 12.80× |
| natural-orderby | 2621440 | 0.000 | 45.71× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 123361882 | 0.000 | 0.94× |
| fast-multisort | 116508444 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 59918629 | 0.000 | 1.94× |
| es-toolkit.orderBy | 49932190 | 0.000 | 2.33× |
| sort-on | 49932190 | 0.000 | 2.33× |
| Array.prototype.sort, decorated | 31775030 | 0.000 | 3.67× |
| sort-by | 24966095 | 0.000 | 4.67× |
| sort-array | 18078897 | 0.000 | 6.44× |
| fast-sort | 16384000 | 0.000 | 7.11× |
| thenby | 11915636 | 0.000 | 9.78× |
| ramda.sortWith | 9039448 | 0.000 | 12.89× |
| remeda.sortBy | 7084973 | 0.000 | 16.44× |
| lodash.orderBy | 6241524 | 0.000 | 18.67× |
| natural-orderby | 455111 | 0.002 | 256.00× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4228129 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 3640889 | 0.000 | 1.16× |
| thenby | 3120762 | 0.000 | 1.35× |
| inline comparator chain, toSorted() | 2978909 | 0.000 | 1.42× |
| fast-sort | 2730667 | 0.000 | 1.55× |
| remeda.sortBy | 2427259 | 0.000 | 1.74× |
| es-toolkit.orderBy | 2259862 | 0.000 | 1.87× |
| Array.prototype.sort, decorated | 2114065 | 0.000 | 2.00× |
| underscore.sortBy | 2048000 | 0.000 | 2.06× |
| sort-array | 1820444 | 0.001 | 2.32× |
| ramda.sortWith | 1560381 | 0.001 | 2.71× |
| lodash.orderBy | 1310720 | 0.001 | 3.23× |
| just-sort-by (different order) | 1260308 | 0.001 | 3.35× |
| natural-orderby (different order) | 315077 | 0.003 | 13.42× |
| sort-on (different order) | 215579 | 0.005 | 19.61× |
| sort-by | 22261 | 0.045 | 189.94× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3640889 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 3449263 | 0.000 | 1.06× |
| inline comparator chain, toSorted() | 3048186 | 0.000 | 1.19× |
| thenby | 2621440 | 0.000 | 1.39× |
| remeda.sortBy | 2184533 | 0.000 | 1.67× |
| fast-sort | 2184533 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 2184533 | 0.000 | 1.67× |
| es-toolkit.orderBy | 2114065 | 0.000 | 1.72× |
| underscore.sortBy | 1985939 | 0.001 | 1.83× |
| sort-array | 1872457 | 0.001 | 1.94× |
| ramda.sortWith | 1560381 | 0.001 | 2.33× |
| lodash.orderBy | 1310720 | 0.001 | 2.78× |
| just-sort-by | 1057032 | 0.001 | 3.44× |
| sort-on | 221405 | 0.005 | 16.44× |
| natural-orderby | 128000 | 0.008 | 28.44× |
| sort-by | 25600 | 0.039 | 142.22× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5242880 | 0.000 | 0.96× |
| fast-multisort | 5041231 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4228129 | 0.000 | 1.19× |
| fast-sort | 3276800 | 0.000 | 1.54× |
| just-sort-by (different order) | 3276800 | 0.000 | 1.54× |
| es-toolkit.orderBy | 2849391 | 0.000 | 1.77× |
| thenby (different order) | 2730667 | 0.000 | 1.85× |
| Array.prototype.sort, decorated | 2730667 | 0.000 | 1.85× |
| remeda.sortBy (different order) | 2259862 | 0.000 | 2.23× |
| sort-array | 1985939 | 0.001 | 2.54× |
| underscore.sortBy (different order) | 1985939 | 0.001 | 2.54× |
| ramda.sortWith (different order) | 1489455 | 0.001 | 3.38× |
| lodash.orderBy | 1310720 | 0.001 | 3.85× |
| sort-on | 303407 | 0.003 | 16.62× |
| natural-orderby | 292571 | 0.003 | 17.23× |
| sort-by (different order) | 20480 | 0.049 | 246.15× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5698783 | 0.000 | 0.72× |
| fast-multisort | 4096000 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 3971879 | 0.000 | 1.03× |
| just-sort-by | 3971879 | 0.000 | 1.03× |
| fast-sort | 3120762 | 0.000 | 1.31× |
| thenby | 3120762 | 0.000 | 1.31× |
| Array.prototype.sort, decorated | 2730667 | 0.000 | 1.50× |
| es-toolkit.orderBy | 2621440 | 0.000 | 1.56× |
| remeda.sortBy | 2621440 | 0.000 | 1.56× |
| sort-array | 2259862 | 0.000 | 1.81× |
| underscore.sortBy | 2259862 | 0.000 | 1.81× |
| ramda.sortWith | 1872457 | 0.001 | 2.19× |
| lodash.orderBy | 1560381 | 0.001 | 2.63× |
| sort-on | 221405 | 0.005 | 18.50× |
| natural-orderby | 221405 | 0.005 | 18.50× |
| sort-by | 24381 | 0.041 | 168.00× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3120762 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 2849391 | 0.000 | 1.10× |
| inline comparator chain, toSorted() | 2520615 | 0.000 | 1.24× |
| thenby | 2114065 | 0.000 | 1.48× |
| fast-sort | 1927529 | 0.001 | 1.62× |
| es-toolkit.orderBy | 1771243 | 0.001 | 1.76× |
| remeda.sortBy | 1771243 | 0.001 | 1.76× |
| Array.prototype.sort, decorated | 1524093 | 0.001 | 2.05× |
| underscore.sortBy | 1365333 | 0.001 | 2.29× |
| ramda.sortWith | 1310720 | 0.001 | 2.38× |
| sort-array | 1310720 | 0.001 | 2.38× |
| just-sort-by | 963765 | 0.001 | 3.24× |
| lodash.orderBy | 862316 | 0.001 | 3.62× |
| sort-on | 163840 | 0.006 | 19.05× |
| natural-orderby | 58514 | 0.017 | 53.33× |
| sort-by | 21333 | 0.047 | 146.29× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 10082462 | 0.000 | 0.96× |
| fast-multisort | 9709037 | 0.000 | 1.00× |
| just-sort-by | 6898526 | 0.000 | 1.41× |
| thenby | 6241524 | 0.000 | 1.56× |
| inline comparator chain, toSorted() | 6096372 | 0.000 | 1.59× |
| es-toolkit.orderBy | 5242880 | 0.000 | 1.85× |
| fast-sort | 5242880 | 0.000 | 1.85× |
| remeda.sortBy | 3971879 | 0.000 | 2.44× |
| sort-array | 3855059 | 0.000 | 2.52× |
| ramda.sortWith | 3542486 | 0.000 | 2.74× |
| Array.prototype.sort, decorated | 3542486 | 0.000 | 2.74× |
| underscore.sortBy | 2849391 | 0.000 | 3.41× |
| lodash.orderBy | 1872457 | 0.001 | 5.19× |
| sort-on | 546133 | 0.002 | 17.78× |
| natural-orderby | 341333 | 0.003 | 28.44× |
| sort-by | 62061 | 0.016 | 156.44× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9362286 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 6553600 | 0.000 | 1.43× |
| inline comparator chain, toSorted() | 4519724 | 0.000 | 2.07× |
| just-sort-by | 3449263 | 0.000 | 2.71× |
| thenby | 2978909 | 0.000 | 3.14× |
| fast-sort | 2621440 | 0.000 | 3.57× |
| remeda.sortBy | 2520615 | 0.000 | 3.71× |
| es-toolkit.orderBy | 2340571 | 0.000 | 4.00× |
| underscore.sortBy | 2340571 | 0.000 | 4.00× |
| Array.prototype.sort, decorated | 2184533 | 0.000 | 4.29× |
| ramda.sortWith | 1724632 | 0.001 | 5.43× |
| sort-array | 1724632 | 0.001 | 5.43× |
| lodash.orderBy | 1424696 | 0.001 | 6.57× |
| natural-orderby | 315077 | 0.003 | 29.71× |
| sort-on | 210051 | 0.005 | 44.57× |
| sort-by | 24381 | 0.041 | 384.00× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 5461333 | 0.000 | 0.89× |
| fast-multisort | 4854519 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 3744914 | 0.000 | 1.30× |
| just-sort-by | 2978909 | 0.000 | 1.63× |
| thenby | 2730667 | 0.000 | 1.78× |
| fast-sort | 2340571 | 0.000 | 2.07× |
| remeda.sortBy | 2184533 | 0.000 | 2.22× |
| es-toolkit.orderBy | 2114065 | 0.000 | 2.30× |
| underscore.sortBy | 2114065 | 0.000 | 2.30× |
| Array.prototype.sort, decorated | 1820444 | 0.001 | 2.67× |
| ramda.sortWith | 1489455 | 0.001 | 3.26× |
| sort-array | 1489455 | 0.001 | 3.26× |
| lodash.orderBy | 1170286 | 0.001 | 4.15× |
| natural-orderby | 303407 | 0.003 | 16.00× |
| sort-on | 234057 | 0.004 | 20.74× |
| sort-by | 23273 | 0.043 | 208.59× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 3449263 | 0.000 | 0.43× |
| inline comparator chain, toSorted() | 2849391 | 0.000 | 0.52× |
| fast-multisort | 1489455 | 0.001 | 1.00× |
| es-toolkit.orderBy | 1489455 | 0.001 | 1.00× |
| thenby (different order) | 1424696 | 0.001 | 1.05× |
| Array.prototype.sort, decorated | 1424696 | 0.001 | 1.05× |
| remeda.sortBy (different order) | 1365333 | 0.001 | 1.09× |
| sort-array (different order) | 1213630 | 0.001 | 1.23× |
| ramda.sortWith (different order) | 1092267 | 0.001 | 1.36× |
| fast-sort (different order) | 1092267 | 0.001 | 1.36× |
| lodash.orderBy | 655360 | 0.002 | 2.27× |
| sort-on (different order) | 170667 | 0.006 | 8.73× |
| natural-orderby (different order) | 44522 | 0.022 | 33.45× |
| sort-by (different order) | 21333 | 0.047 | 69.82× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 372364 | 0.003 | 1.00× |
| inline comparator chain, slice().sort() | 204800 | 0.005 | 1.82× |
| inline comparator chain, toSorted() | 178087 | 0.006 | 2.09× |
| underscore.sortBy | 146286 | 0.007 | 2.55× |
| thenby | 102400 | 0.010 | 3.64× |
| remeda.sortBy | 89043 | 0.011 | 4.18× |
| fast-sort | 89043 | 0.011 | 4.18× |
| Array.prototype.sort, decorated | 85333 | 0.012 | 4.36× |
| es-toolkit.orderBy | 75852 | 0.013 | 4.91× |
| sort-array | 68267 | 0.015 | 5.45× |
| ramda.sortWith | 60235 | 0.017 | 6.18× |
| just-sort-by (different order) | 55351 | 0.018 | 6.73× |
| lodash.orderBy | 52513 | 0.019 | 7.09× |
| natural-orderby (different order) | 21333 | 0.047 | 17.45× |
| sort-on (different order) | 11130 | 0.090 | 33.45× |
| sort-by | 1000 | 1.000 | 372.36× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 157538 | 0.006 | 0.96× |
| fast-multisort | 151704 | 0.007 | 1.00× |
| inline comparator chain, toSorted() | 141241 | 0.007 | 1.07× |
| underscore.sortBy | 97524 | 0.010 | 1.56× |
| thenby | 81920 | 0.012 | 1.85× |
| remeda.sortBy | 73143 | 0.014 | 2.07× |
| fast-sort | 73143 | 0.014 | 2.07× |
| es-toolkit.orderBy | 64000 | 0.016 | 2.37× |
| Array.prototype.sort, decorated | 64000 | 0.016 | 2.37× |
| sort-array | 51200 | 0.020 | 2.96× |
| ramda.sortWith | 48762 | 0.021 | 3.11× |
| lodash.orderBy | 35310 | 0.028 | 4.30× |
| just-sort-by (different order) | 35310 | 0.028 | 4.30× |
| natural-orderby (different order) | 8533 | 0.117 | 17.78× |
| sort-on (different order) | 7529 | 0.133 | 20.15× |
| sort-by | 889 | 1.125 | 170.67× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 256000 | 0.004 | 0.94× |
| fast-multisort | 240941 | 0.004 | 1.00× |
| inline comparator chain, toSorted() | 215579 | 0.005 | 1.12× |
| underscore.sortBy (different order) | 146286 | 0.007 | 1.65× |
| just-sort-by (different order) | 146286 | 0.007 | 1.65× |
| fast-sort (different order) | 113778 | 0.009 | 2.12× |
| thenby (different order) | 107789 | 0.009 | 2.24× |
| Array.prototype.sort, decorated | 102400 | 0.010 | 2.35× |
| es-toolkit.orderBy | 93091 | 0.011 | 2.59× |
| remeda.sortBy (different order) | 89043 | 0.011 | 2.71× |
| sort-array | 75852 | 0.013 | 3.18× |
| lodash.orderBy | 66065 | 0.015 | 3.65× |
| ramda.sortWith (different order) | 64000 | 0.016 | 3.76× |
| natural-orderby | 24381 | 0.041 | 9.88× |
| sort-on | 11130 | 0.090 | 21.65× |
| sort-by (different order) | 1000 | 1.000 | 240.94× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 264258 | 0.004 | 0.84× |
| fast-multisort | 221405 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 221405 | 0.005 | 1.00× |
| underscore.sortBy | 136533 | 0.007 | 1.62× |
| just-sort-by | 124121 | 0.008 | 1.78× |
| fast-sort | 102400 | 0.010 | 2.16× |
| thenby | 102400 | 0.010 | 2.16× |
| es-toolkit.orderBy | 93091 | 0.011 | 2.38× |
| Array.prototype.sort, decorated | 93091 | 0.011 | 2.38× |
| remeda.sortBy | 89043 | 0.011 | 2.49× |
| sort-array | 73143 | 0.014 | 3.03× |
| lodash.orderBy | 64000 | 0.016 | 3.46× |
| ramda.sortWith | 64000 | 0.016 | 3.46× |
| natural-orderby | 18963 | 0.053 | 11.68× |
| sort-on | 8828 | 0.113 | 25.08× |
| sort-by | 941 | 1.063 | 235.24× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 128000 | 0.008 | 0.70× |
| inline comparator chain, toSorted() | 124121 | 0.008 | 0.72× |
| fast-multisort | 89043 | 0.011 | 1.00× |
| underscore.sortBy | 75852 | 0.013 | 1.17× |
| thenby | 73143 | 0.014 | 1.22× |
| fast-sort | 68267 | 0.015 | 1.30× |
| remeda.sortBy | 66065 | 0.015 | 1.35× |
| es-toolkit.orderBy | 62061 | 0.016 | 1.43× |
| Array.prototype.sort, decorated | 56889 | 0.018 | 1.57× |
| ramda.sortWith | 46545 | 0.021 | 1.91× |
| sort-array | 44522 | 0.022 | 2.00× |
| just-sort-by | 37926 | 0.026 | 2.35× |
| lodash.orderBy | 33032 | 0.030 | 2.70× |
| sort-on | 7314 | 0.137 | 12.17× |
| natural-orderby | 5333 | 0.188 | 16.70× |
| sort-by | 889 | 1.125 | 100.17× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 1680410 | 0.001 | 0.61× |
| fast-multisort | 1024000 | 0.001 | 1.00× |
| just-sort-by | 840205 | 0.001 | 1.22× |
| thenby | 712348 | 0.001 | 1.44× |
| fast-sort | 682667 | 0.001 | 1.50× |
| inline comparator chain, toSorted() | 642510 | 0.002 | 1.59× |
| es-toolkit.orderBy | 585143 | 0.002 | 1.75× |
| ramda.sortWith | 409600 | 0.002 | 2.50× |
| sort-array | 390095 | 0.003 | 2.63× |
| underscore.sortBy | 390095 | 0.003 | 2.63× |
| remeda.sortBy | 372364 | 0.003 | 2.75× |
| Array.prototype.sort, decorated | 341333 | 0.003 | 3.00× |
| lodash.orderBy | 227556 | 0.004 | 4.50× |
| sort-on | 51200 | 0.020 | 20.00× |
| natural-orderby | 35310 | 0.028 | 29.00× |
| sort-by | 5565 | 0.180 | 184.00× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1024000 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 512000 | 0.002 | 2.00× |
| inline comparator chain, toSorted() | 356174 | 0.003 | 2.88× |
| just-sort-by | 234057 | 0.004 | 4.38× |
| underscore.sortBy | 221405 | 0.005 | 4.63× |
| fast-sort | 178087 | 0.006 | 5.75× |
| remeda.sortBy | 163840 | 0.006 | 6.25× |
| thenby | 157538 | 0.006 | 6.50× |
| es-toolkit.orderBy | 146286 | 0.007 | 7.00× |
| Array.prototype.sort, decorated | 146286 | 0.007 | 7.00× |
| sort-array | 107789 | 0.009 | 9.50× |
| ramda.sortWith | 102400 | 0.010 | 10.00× |
| lodash.orderBy | 97524 | 0.010 | 10.50× |
| natural-orderby | 30118 | 0.033 | 34.00× |
| sort-on | 11636 | 0.086 | 88.00× |
| sort-by | 1333 | 0.750 | 768.00× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 840205 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 744727 | 0.001 | 1.13× |
| inline comparator chain, toSorted() | 409600 | 0.002 | 2.05× |
| just-sort-by | 390095 | 0.003 | 2.15× |
| thenby | 327680 | 0.003 | 2.56× |
| fast-sort | 315077 | 0.003 | 2.67× |
| underscore.sortBy | 273067 | 0.004 | 3.08× |
| es-toolkit.orderBy | 264258 | 0.004 | 3.18× |
| Array.prototype.sort, decorated | 215579 | 0.005 | 3.90× |
| remeda.sortBy | 199805 | 0.005 | 4.21× |
| sort-array | 186182 | 0.005 | 4.51× |
| ramda.sortWith | 178087 | 0.006 | 4.72× |
| lodash.orderBy | 136533 | 0.007 | 6.15× |
| natural-orderby | 33032 | 0.030 | 25.44× |
| sort-on | 24381 | 0.041 | 34.46× |
| sort-by | 2370 | 0.422 | 354.46× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 186182 | 0.005 | 0.50× |
| inline comparator chain, toSorted() | 157538 | 0.006 | 0.59× |
| fast-multisort | 93091 | 0.011 | 1.00× |
| Array.prototype.sort, decorated | 64000 | 0.016 | 1.45× |
| remeda.sortBy (different order) | 62061 | 0.016 | 1.50× |
| es-toolkit.orderBy | 60235 | 0.017 | 1.55× |
| thenby (different order) | 60235 | 0.017 | 1.55× |
| sort-array (different order) | 46545 | 0.021 | 2.00× |
| ramda.sortWith (different order) | 44522 | 0.022 | 2.09× |
| lodash.orderBy | 40960 | 0.024 | 2.27× |
| fast-sort (different order) | 40960 | 0.024 | 2.27× |
| sort-on (different order) | 7529 | 0.133 | 12.36× |
| natural-orderby (different order) | 4129 | 0.242 | 22.55× |
| sort-by (different order) | 667 | 1.500 | 139.64× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42667 | 0.023 | 1.00× |
| inline comparator chain, slice().sort() | 12190 | 0.082 | 3.50× |
| inline comparator chain, toSorted() | 11636 | 0.086 | 3.67× |
| underscore.sortBy | 10240 | 0.098 | 4.17× |
| thenby | 6400 | 0.156 | 6.67× |
| remeda.sortBy | 6095 | 0.164 | 7.00× |
| fast-sort | 6095 | 0.164 | 7.00× |
| Array.prototype.sort, decorated | 5818 | 0.172 | 7.33× |
| es-toolkit.orderBy | 5120 | 0.195 | 8.33× |
| sort-array | 4571 | 0.219 | 9.33× |
| ramda.sortWith | 3879 | 0.258 | 11.00× |
| lodash.orderBy | 3765 | 0.266 | 11.33× |
| just-sort-by (different order) | 3459 | 0.289 | 12.33× |
| natural-orderby (different order) | 1684 | 0.594 | 25.33× |
| sort-on (different order) | 727 | 1.375 | 58.67× |
| sort-by | 63 | 16.000 | 682.67× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 8533 | 0.117 | 1.00× |
| inline comparator chain, slice().sort() | 7758 | 0.129 | 1.10× |
| inline comparator chain, toSorted() | 7758 | 0.129 | 1.10× |
| underscore.sortBy | 5333 | 0.188 | 1.60× |
| thenby | 4923 | 0.203 | 1.73× |
| remeda.sortBy | 4571 | 0.219 | 1.87× |
| fast-sort | 4571 | 0.219 | 1.87× |
| es-toolkit.orderBy | 4000 | 0.250 | 2.13× |
| Array.prototype.sort, decorated | 3879 | 0.258 | 2.20× |
| ramda.sortWith | 3200 | 0.313 | 2.67× |
| sort-array | 3048 | 0.328 | 2.80× |
| lodash.orderBy | 2286 | 0.438 | 3.73× |
| just-sort-by (different order) | 2207 | 0.453 | 3.87× |
| natural-orderby (different order) | 640 | 1.563 | 13.33× |
| sort-on (different order) | 500 | 2.000 | 17.07× |
| sort-by | 61 | 16.500 | 140.80× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 23273 | 0.043 | 1.00× |
| inline comparator chain, slice().sort() | 13474 | 0.074 | 1.73× |
| inline comparator chain, toSorted() | 12800 | 0.078 | 1.82× |
| underscore.sortBy (different order) | 9481 | 0.105 | 2.45× |
| just-sort-by (different order) | 7758 | 0.129 | 3.00× |
| fast-sort (different order) | 6919 | 0.145 | 3.36× |
| thenby (different order) | 6737 | 0.148 | 3.45× |
| remeda.sortBy (different order) | 6095 | 0.164 | 3.82× |
| Array.prototype.sort, decorated | 6095 | 0.164 | 3.82× |
| es-toolkit.orderBy | 5818 | 0.172 | 4.00× |
| sort-array | 4741 | 0.211 | 4.91× |
| lodash.orderBy | 4267 | 0.234 | 5.45× |
| ramda.sortWith (different order) | 4129 | 0.242 | 5.64× |
| natural-orderby | 1882 | 0.531 | 12.36× |
| sort-on | 727 | 1.375 | 32.00× |
| sort-by (different order) | 63 | 16.000 | 372.36× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 23273 | 0.043 | 1.00× |
| inline comparator chain, slice().sort() | 12800 | 0.078 | 1.82× |
| inline comparator chain, toSorted() | 11636 | 0.086 | 2.00× |
| underscore.sortBy | 9143 | 0.109 | 2.55× |
| just-sort-by | 7758 | 0.129 | 3.00× |
| thenby | 6919 | 0.145 | 3.36× |
| fast-sort | 6737 | 0.148 | 3.45× |
| remeda.sortBy | 6095 | 0.164 | 3.82× |
| es-toolkit.orderBy | 5818 | 0.172 | 4.00× |
| Array.prototype.sort, decorated | 5818 | 0.172 | 4.00× |
| sort-array | 4571 | 0.219 | 5.09× |
| lodash.orderBy | 4267 | 0.234 | 5.45× |
| ramda.sortWith | 4267 | 0.234 | 5.45× |
| natural-orderby | 1600 | 0.625 | 14.55× |
| sort-on | 571 | 1.750 | 40.73× |
| sort-by | 61 | 16.500 | 384.00× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 6400 | 0.156 | 1.00× |
| inline comparator chain, slice().sort() | 5818 | 0.172 | 1.10× |
| inline comparator chain, toSorted() | 5333 | 0.188 | 1.20× |
| underscore.sortBy | 4414 | 0.227 | 1.45× |
| fast-sort | 4000 | 0.250 | 1.60× |
| thenby | 4000 | 0.250 | 1.60× |
| remeda.sortBy | 3765 | 0.266 | 1.70× |
| es-toolkit.orderBy | 3368 | 0.297 | 1.90× |
| Array.prototype.sort, decorated | 3368 | 0.297 | 1.90× |
| ramda.sortWith | 2667 | 0.375 | 2.40× |
| sort-array | 2667 | 0.375 | 2.40× |
| just-sort-by | 2370 | 0.422 | 2.70× |
| lodash.orderBy | 2133 | 0.469 | 3.00× |
| sort-on | 444 | 2.250 | 14.40× |
| natural-orderby | 421 | 2.375 | 15.20× |
| sort-by | 53 | 19.000 | 121.60× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 170667 | 0.006 | 0.60× |
| fast-multisort | 102400 | 0.010 | 1.00× |
| just-sort-by | 89043 | 0.011 | 1.15× |
| thenby | 73143 | 0.014 | 1.40× |
| fast-sort | 70621 | 0.014 | 1.45× |
| inline comparator chain, toSorted() | 64000 | 0.016 | 1.60× |
| es-toolkit.orderBy | 60235 | 0.017 | 1.70× |
| ramda.sortWith | 40960 | 0.024 | 2.50× |
| underscore.sortBy | 40960 | 0.024 | 2.50× |
| sort-array | 39385 | 0.025 | 2.60× |
| remeda.sortBy | 35310 | 0.028 | 2.90× |
| Array.prototype.sort, decorated | 33032 | 0.030 | 3.10× |
| lodash.orderBy | 22261 | 0.045 | 4.60× |
| sort-on | 5120 | 0.195 | 20.00× |
| natural-orderby | 3282 | 0.305 | 31.20× |
| sort-by | 533 | 1.875 | 192.00× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 107789 | 0.009 | 1.00× |
| inline comparator chain, slice().sort() | 34133 | 0.029 | 3.16× |
| inline comparator chain, toSorted() | 25600 | 0.039 | 4.21× |
| underscore.sortBy | 17067 | 0.059 | 6.32× |
| just-sort-by | 16000 | 0.063 | 6.74× |
| fast-sort | 11636 | 0.086 | 9.26× |
| remeda.sortBy | 11130 | 0.090 | 9.68× |
| thenby | 11130 | 0.090 | 9.68× |
| Array.prototype.sort, decorated | 11130 | 0.090 | 9.68× |
| es-toolkit.orderBy | 9481 | 0.105 | 11.37× |
| sort-array | 7314 | 0.137 | 14.74× |
| ramda.sortWith | 6737 | 0.148 | 16.00× |
| lodash.orderBy | 6400 | 0.156 | 16.84× |
| natural-orderby | 2462 | 0.406 | 43.79× |
| sort-on | 762 | 1.313 | 141.47× |
| sort-by | 87 | 11.500 | 1239.58× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 93091 | 0.011 | 1.00× |
| inline comparator chain, slice().sort() | 85333 | 0.012 | 1.09× |
| inline comparator chain, toSorted() | 44522 | 0.022 | 2.09× |
| just-sort-by | 44522 | 0.022 | 2.09× |
| thenby | 36571 | 0.027 | 2.55× |
| fast-sort | 35310 | 0.028 | 2.64× |
| underscore.sortBy | 32000 | 0.031 | 2.91× |
| es-toolkit.orderBy | 30118 | 0.033 | 3.09× |
| remeda.sortBy | 24381 | 0.041 | 3.82× |
| Array.prototype.sort, decorated | 23273 | 0.043 | 4.00× |
| ramda.sortWith | 20480 | 0.049 | 4.55× |
| sort-array | 20480 | 0.049 | 4.55× |
| lodash.orderBy | 15059 | 0.066 | 6.18× |
| natural-orderby | 3200 | 0.313 | 29.09× |
| sort-on | 2783 | 0.359 | 33.45× |
| sort-by | 267 | 3.750 | 349.09× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 9846 | 0.102 | 0.90× |
| inline comparator chain, toSorted() | 9481 | 0.105 | 0.93× |
| fast-multisort | 8828 | 0.113 | 1.00× |
| Array.prototype.sort, decorated | 3879 | 0.258 | 2.28× |
| thenby (different order) | 3765 | 0.266 | 2.34× |
| remeda.sortBy (different order) | 3657 | 0.273 | 2.41× |
| es-toolkit.orderBy | 3556 | 0.281 | 2.48× |
| lodash.orderBy | 2783 | 0.359 | 3.17× |
| sort-array (different order) | 2783 | 0.359 | 3.17× |
| ramda.sortWith (different order) | 2667 | 0.375 | 3.31× |
| fast-sort (different order) | 2462 | 0.406 | 3.59× |
| sort-on (different order) | 432 | 2.313 | 20.41× |
| natural-orderby (different order) | 348 | 2.875 | 25.38× |
| sort-by (different order) | 38 | 26.000 | 229.52× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4000 | 0.250 | 1.00× |
| inline comparator chain, slice().sort() | 889 | 1.125 | 4.50× |
| inline comparator chain, toSorted() | 842 | 1.188 | 4.75× |
| underscore.sortBy | 762 | 1.313 | 5.25× |
| thenby | 500 | 2.000 | 8.00× |
| remeda.sortBy | 471 | 2.125 | 8.50× |
| fast-sort | 457 | 2.188 | 8.75× |
| Array.prototype.sort, decorated | 457 | 2.188 | 8.75× |
| es-toolkit.orderBy | 381 | 2.625 | 10.50× |
| sort-array | 348 | 2.875 | 11.50× |
| ramda.sortWith | 286 | 3.500 | 14.00× |
| lodash.orderBy | 276 | 3.625 | 14.50× |
| just-sort-by (different order) | 242 | 4.125 | 16.50× |
| natural-orderby (different order) | 118 | 8.500 | 34.00× |
| sort-on (different order) | 53 | 19.000 | 76.00× |
| sort-by | 5 | 215.000 | 860.00× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 593 | 1.688 | 1.00× |
| inline comparator chain, slice().sort() | 421 | 2.375 | 1.41× |
| inline comparator chain, toSorted() | 410 | 2.438 | 1.44× |
| thenby | 320 | 3.125 | 1.85× |
| underscore.sortBy | 308 | 3.250 | 1.93× |
| remeda.sortBy | 296 | 3.375 | 2.00× |
| fast-sort | 296 | 3.375 | 2.00× |
| es-toolkit.orderBy | 258 | 3.875 | 2.30× |
| Array.prototype.sort, decorated | 242 | 4.125 | 2.44× |
| ramda.sortWith | 216 | 4.625 | 2.74× |
| sort-array | 211 | 4.750 | 2.81× |
| lodash.orderBy | 133 | 7.500 | 4.44× |
| just-sort-by (different order) | 133 | 7.500 | 4.44× |
| sort-on (different order) | 33 | 30.000 | 17.78× |
| natural-orderby (different order) | 31 | 32.000 | 18.96× |
| sort-by | 4 | 269.000 | 159.41× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2560 | 0.391 | 1.00× |
| inline comparator chain, slice().sort() | 865 | 1.156 | 2.96× |
| inline comparator chain, toSorted() | 821 | 1.219 | 3.12× |
| underscore.sortBy (different order) | 640 | 1.563 | 4.00× |
| just-sort-by (different order) | 500 | 2.000 | 5.12× |
| fast-sort (different order) | 485 | 2.063 | 5.28× |
| thenby (different order) | 471 | 2.125 | 5.44× |
| es-toolkit.orderBy | 400 | 2.500 | 6.40× |
| Array.prototype.sort, decorated | 400 | 2.500 | 6.40× |
| remeda.sortBy (different order) | 390 | 2.563 | 6.56× |
| sort-array | 320 | 3.125 | 8.00× |
| ramda.sortWith (different order) | 276 | 3.625 | 9.28× |
| lodash.orderBy | 250 | 4.000 | 10.24× |
| natural-orderby | 121 | 8.250 | 21.12× |
| sort-on | 50 | 20.000 | 51.20× |
| sort-by (different order) | 4 | 283.000 | 724.48× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2286 | 0.438 | 1.00× |
| inline comparator chain, slice().sort() | 696 | 1.438 | 3.29× |
| inline comparator chain, toSorted() | 696 | 1.438 | 3.29× |
| underscore.sortBy | 615 | 1.625 | 3.71× |
| just-sort-by | 500 | 2.000 | 4.57× |
| thenby | 421 | 2.375 | 5.43× |
| fast-sort | 390 | 2.563 | 5.86× |
| es-toolkit.orderBy | 381 | 2.625 | 6.00× |
| Array.prototype.sort, decorated | 381 | 2.625 | 6.00× |
| remeda.sortBy | 372 | 2.688 | 6.14× |
| sort-array | 308 | 3.250 | 7.43× |
| ramda.sortWith | 267 | 3.750 | 8.57× |
| lodash.orderBy | 235 | 4.250 | 9.71× |
| natural-orderby | 83 | 12.000 | 27.43× |
| sort-on | 37 | 27.000 | 61.71× |
| sort-by | 3 | 320.000 | 731.43× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 516 | 1.938 | 1.00× |
| inline comparator chain, slice().sort() | 364 | 2.750 | 1.42× |
| inline comparator chain, toSorted() | 364 | 2.750 | 1.42× |
| underscore.sortBy | 286 | 3.500 | 1.81× |
| thenby | 276 | 3.625 | 1.87× |
| remeda.sortBy | 258 | 3.875 | 2.00× |
| fast-sort | 258 | 3.875 | 2.00× |
| es-toolkit.orderBy | 242 | 4.125 | 2.13× |
| Array.prototype.sort, decorated | 235 | 4.250 | 2.19× |
| sort-array | 200 | 5.000 | 2.58× |
| ramda.sortWith | 190 | 5.250 | 2.71× |
| just-sort-by | 167 | 6.000 | 3.10× |
| lodash.orderBy | 125 | 8.000 | 4.13× |
| sort-on | 32 | 31.000 | 16.00× |
| natural-orderby | 25 | 40.000 | 20.65× |
| sort-by | 4 | 252.000 | 130.06× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, slice().sort() | 14222 | 0.070 | 0.75× |
| fast-multisort | 10667 | 0.094 | 1.00× |
| just-sort-by | 8000 | 0.125 | 1.33× |
| thenby | 7111 | 0.141 | 1.50× |
| fast-sort | 6737 | 0.148 | 1.58× |
| inline comparator chain, toSorted() | 5818 | 0.172 | 1.83× |
| es-toolkit.orderBy | 5818 | 0.172 | 1.83× |
| ramda.sortWith | 4000 | 0.250 | 2.67× |
| sort-array | 3879 | 0.258 | 2.75× |
| underscore.sortBy | 3879 | 0.258 | 2.75× |
| remeda.sortBy | 3765 | 0.266 | 2.83× |
| Array.prototype.sort, decorated | 3200 | 0.313 | 3.33× |
| lodash.orderBy | 2000 | 0.500 | 5.33× |
| sort-on | 485 | 2.063 | 22.00× |
| natural-orderby | 286 | 3.500 | 37.33× |
| sort-by | 53 | 19.000 | 202.67× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10667 | 0.094 | 1.00× |
| inline comparator chain, slice().sort() | 2909 | 0.344 | 3.67× |
| inline comparator chain, toSorted() | 2286 | 0.438 | 4.67× |
| underscore.sortBy | 1524 | 0.656 | 7.00× |
| just-sort-by | 1333 | 0.750 | 8.00× |
| remeda.sortBy | 1000 | 1.000 | 10.67× |
| fast-sort | 1000 | 1.000 | 10.67× |
| thenby | 941 | 1.063 | 11.33× |
| Array.prototype.sort, decorated | 941 | 1.063 | 11.33× |
| es-toolkit.orderBy | 842 | 1.188 | 12.67× |
| lodash.orderBy | 593 | 1.688 | 18.00× |
| sort-array | 593 | 1.688 | 18.00× |
| ramda.sortWith | 571 | 1.750 | 18.67× |
| natural-orderby | 190 | 5.250 | 56.00× |
| sort-on | 63 | 16.000 | 170.67× |
| sort-by | 7 | 142.000 | 1514.67× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9846 | 0.102 | 1.00× |
| inline comparator chain, slice().sort() | 6400 | 0.156 | 1.54× |
| inline comparator chain, toSorted() | 3765 | 0.266 | 2.62× |
| just-sort-by | 3459 | 0.289 | 2.85× |
| fast-sort | 2783 | 0.359 | 3.54× |
| thenby | 2783 | 0.359 | 3.54× |
| underscore.sortBy | 2560 | 0.391 | 3.85× |
| es-toolkit.orderBy | 2286 | 0.438 | 4.31× |
| Array.prototype.sort, decorated | 1939 | 0.516 | 5.08× |
| remeda.sortBy | 1882 | 0.531 | 5.23× |
| sort-array | 1641 | 0.609 | 6.00× |
| ramda.sortWith | 1600 | 0.625 | 6.15× |
| lodash.orderBy | 1185 | 0.844 | 8.31× |
| natural-orderby | 258 | 3.875 | 38.15× |
| sort-on | 216 | 4.625 | 45.54× |
| sort-by | 20 | 50.000 | 492.31× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1103 | 0.906 | 1.00× |
| inline comparator chain, slice().sort() | 593 | 1.688 | 1.86× |
| inline comparator chain, toSorted() | 571 | 1.750 | 1.93× |
| Array.prototype.sort, decorated | 267 | 3.750 | 4.14× |
| thenby (different order) | 250 | 4.000 | 4.41× |
| remeda.sortBy (different order) | 242 | 4.125 | 4.55× |
| es-toolkit.orderBy | 235 | 4.250 | 4.69× |
| sort-array (different order) | 190 | 5.250 | 5.79× |
| lodash.orderBy | 182 | 5.500 | 6.07× |
| ramda.sortWith (different order) | 174 | 5.750 | 6.34× |
| fast-sort (different order) | 160 | 6.250 | 6.90× |
| natural-orderby (different order) | 29 | 35.000 | 38.62× |
| sort-on (different order) | 27 | 37.000 | 40.83× |
| sort-by (different order) | 2 | 504.000 | 556.14× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 333 | 3.000 | 1.00× |
| inline comparator chain, slice().sort() | 59 | 17.000 | 5.67× |
| inline comparator chain, toSorted() | 59 | 17.000 | 5.67× |
| underscore.sortBy | 57 | 17.500 | 5.83× |
| thenby | 36 | 28.000 | 9.33× |
| remeda.sortBy | 34 | 29.000 | 9.67× |
| fast-sort | 33 | 30.000 | 10.00× |
| Array.prototype.sort, decorated | 29 | 34.000 | 11.33× |
| es-toolkit.orderBy | 26 | 38.000 | 12.67× |
| sort-array | 26 | 39.000 | 13.00× |
| ramda.sortWith | 20 | 49.000 | 16.33× |
| just-sort-by (different order) | 16 | 61.000 | 20.33× |
| lodash.orderBy | 14 | 73.000 | 24.33× |
| natural-orderby (different order) | 8 | 131.000 | 43.67× |
| sort-on (different order) | 4 | 264.000 | 88.00× |
| sort-by | 0 | 3215.000 | 1071.67× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 37 | 27.000 | 1.00× |
| inline comparator chain, toSorted() | 26 | 39.000 | 1.44× |
| inline comparator chain, slice().sort() | 22 | 46.000 | 1.70× |
| thenby | 19 | 53.000 | 1.96× |
| underscore.sortBy | 19 | 53.000 | 1.96× |
| remeda.sortBy | 17 | 58.000 | 2.15× |
| fast-sort | 17 | 58.000 | 2.15× |
| es-toolkit.orderBy | 15 | 65.000 | 2.41× |
| Array.prototype.sort, decorated | 13 | 77.000 | 2.85× |
| sort-array | 13 | 78.000 | 2.89× |
| ramda.sortWith | 13 | 79.000 | 2.93× |
| just-sort-by (different order) | 8 | 131.000 | 4.85× |
| lodash.orderBy | 6 | 176.000 | 6.52× |
| sort-on (different order) | 2 | 433.000 | 16.04× |
| natural-orderby (different order) | 2 | 450.000 | 16.67× |
| sort-by | 0 | 3568.000 | 132.15× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 242 | 4.125 | 1.00× |
| inline comparator chain, slice().sort() | 56 | 18.000 | 4.36× |
| inline comparator chain, toSorted() | 56 | 18.000 | 4.36× |
| underscore.sortBy (different order) | 43 | 23.000 | 5.58× |
| just-sort-by (different order) | 38 | 26.000 | 6.30× |
| thenby (different order) | 34 | 29.000 | 7.03× |
| fast-sort (different order) | 33 | 30.000 | 7.27× |
| es-toolkit.orderBy | 28 | 36.000 | 8.73× |
| remeda.sortBy (different order) | 27 | 37.000 | 8.97× |
| Array.prototype.sort, decorated | 25 | 40.000 | 9.70× |
| sort-array | 24 | 41.000 | 9.94× |
| ramda.sortWith (different order) | 20 | 51.000 | 12.36× |
| lodash.orderBy | 13 | 79.000 | 19.15× |
| natural-orderby | 8 | 124.000 | 30.06× |
| sort-on | 4 | 267.000 | 64.73× |
| sort-by (different order) | 0 | 3368.000 | 816.48× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 229 | 4.375 | 1.00× |
| inline comparator chain, slice().sort() | 54 | 18.500 | 4.23× |
| inline comparator chain, toSorted() | 54 | 18.500 | 4.23× |
| underscore.sortBy | 45 | 22.000 | 5.03× |
| just-sort-by | 38 | 26.000 | 5.94× |
| thenby | 36 | 28.000 | 6.40× |
| fast-sort | 34 | 29.000 | 6.63× |
| remeda.sortBy | 29 | 34.000 | 7.77× |
| es-toolkit.orderBy | 28 | 36.000 | 8.23× |
| Array.prototype.sort, decorated | 26 | 39.000 | 8.91× |
| sort-array | 24 | 41.000 | 9.37× |
| ramda.sortWith | 22 | 46.000 | 10.51× |
| lodash.orderBy | 13 | 78.000 | 17.83× |
| natural-orderby | 7 | 136.000 | 31.09× |
| sort-on | 3 | 343.000 | 78.40× |
| sort-by | 0 | 3474.000 | 794.06× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 33 | 30.000 | 1.00× |
| inline comparator chain, slice().sort() | 25 | 40.000 | 1.33× |
| inline comparator chain, toSorted() | 24 | 41.000 | 1.37× |
| underscore.sortBy | 20 | 51.000 | 1.70× |
| thenby | 19 | 52.000 | 1.73× |
| remeda.sortBy | 17 | 60.000 | 2.00× |
| fast-sort | 17 | 60.000 | 2.00× |
| es-toolkit.orderBy | 16 | 64.000 | 2.13× |
| Array.prototype.sort, decorated | 14 | 69.000 | 2.30× |
| sort-array | 14 | 70.000 | 2.33× |
| ramda.sortWith | 13 | 75.000 | 2.50× |
| just-sort-by | 11 | 93.000 | 3.10× |
| lodash.orderBy | 8 | 123.000 | 4.10× |
| sort-on | 2 | 416.000 | 13.87× |
| natural-orderby (different order) | 2 | 456.000 | 15.20× |
| sort-by | 0 | 3642.000 | 121.40× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1103 | 0.906 | 1.00× |
| inline comparator chain, slice().sort() | 1103 | 0.906 | 1.00× |
| just-sort-by | 696 | 1.438 | 1.59× |
| fast-sort | 615 | 1.625 | 1.79× |
| thenby | 615 | 1.625 | 1.79× |
| inline comparator chain, toSorted() | 542 | 1.844 | 2.03× |
| es-toolkit.orderBy | 533 | 1.875 | 2.07× |
| ramda.sortWith | 364 | 2.750 | 3.03× |
| sort-array | 364 | 2.750 | 3.03× |
| remeda.sortBy | 348 | 2.875 | 3.17× |
| underscore.sortBy | 348 | 2.875 | 3.17× |
| Array.prototype.sort, decorated | 222 | 4.500 | 4.97× |
| lodash.orderBy | 148 | 6.750 | 7.45× |
| sort-on | 48 | 21.000 | 23.17× |
| natural-orderby | 23 | 44.000 | 48.55× |
| sort-by | 5 | 198.000 | 218.48× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1000 | 1.000 | 1.00× |
| inline comparator chain, slice().sort() | 211 | 4.750 | 4.75× |
| inline comparator chain, toSorted() | 186 | 5.375 | 5.38× |
| underscore.sortBy | 118 | 8.500 | 8.50× |
| just-sort-by | 105 | 9.500 | 9.50× |
| remeda.sortBy | 80 | 12.500 | 12.50× |
| fast-sort | 77 | 13.000 | 13.00× |
| thenby | 74 | 13.500 | 13.50× |
| Array.prototype.sort, decorated | 74 | 13.500 | 13.50× |
| es-toolkit.orderBy | 67 | 15.000 | 15.00× |
| sort-array | 48 | 21.000 | 21.00× |
| lodash.orderBy | 43 | 23.000 | 23.00× |
| ramda.sortWith | 43 | 23.000 | 23.00× |
| natural-orderby | 13 | 76.000 | 76.00× |
| sort-on | 5 | 212.000 | 212.00× |
| sort-by | 0 | 2165.000 | 2165.00× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 941 | 1.063 | 1.00× |
| inline comparator chain, slice().sort() | 552 | 1.813 | 1.71× |
| inline comparator chain, toSorted() | 348 | 2.875 | 2.71× |
| just-sort-by | 333 | 3.000 | 2.82× |
| thenby | 267 | 3.750 | 3.53× |
| fast-sort | 258 | 3.875 | 3.65× |
| es-toolkit.orderBy | 229 | 4.375 | 4.12× |
| underscore.sortBy | 205 | 4.875 | 4.59× |
| remeda.sortBy | 190 | 5.250 | 4.94× |
| Array.prototype.sort, decorated | 174 | 5.750 | 5.41× |
| sort-array | 160 | 6.250 | 5.88× |
| ramda.sortWith | 148 | 6.750 | 6.35× |
| lodash.orderBy | 74 | 13.500 | 12.71× |
| sort-on | 22 | 46.000 | 43.29× |
| natural-orderby | 20 | 50.000 | 47.06× |
| sort-by | 2 | 474.000 | 446.12× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 83 | 12.000 | 1.00× |
| inline comparator chain, slice().sort() | 38 | 26.000 | 2.17× |
| inline comparator chain, toSorted() | 38 | 26.000 | 2.17× |
| thenby (different order) | 18 | 55.000 | 4.58× |
| remeda.sortBy (different order) | 18 | 57.000 | 4.75× |
| es-toolkit.orderBy | 16 | 64.000 | 5.33× |
| Array.prototype.sort, decorated | 15 | 67.000 | 5.58× |
| sort-array (different order) | 14 | 73.000 | 6.08× |
| ramda.sortWith (different order) | 13 | 78.000 | 6.50× |
| fast-sort (different order) | 11 | 94.000 | 7.83× |
| lodash.orderBy | 10 | 99.000 | 8.25× |
| natural-orderby (different order) | 2 | 446.000 | 37.17× |
| sort-on (different order) | 2 | 554.000 | 46.17× |
| sort-by (different order) | 0 | 6467.000 | 538.92× |
