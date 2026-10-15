
#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 267745384 | 0.000 | 0.52× |
| fast-multisort | 138245840 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 113799127 | 0.000 | 1.21× |
| es-toolkit.orderBy | 86516618 | 0.000 | 1.60× |
| sort-on | 75106282 | 0.000 | 1.84× |
| Array.prototype.sort, decorated | 63866247 | 0.000 | 2.16× |
| thenby | 42487445 | 0.000 | 3.25× |
| inline comparator chain, toSorted() | 37647239 | 0.000 | 3.67× |
| ramda.sortWith | 36740306 | 0.000 | 3.76× |
| remeda.sortBy | 30542271 | 0.000 | 4.53× |
| fast-sort | 29769005 | 0.000 | 4.64× |
| sort-array | 28841203 | 0.000 | 4.79× |
| sort-by | 28629736 | 0.000 | 4.83× |
| underscore.sortBy | 24814597 | 0.000 | 5.57× |
| lodash.orderBy | 24055103 | 0.000 | 5.75× |
| natural-orderby | 3643634 | 0.000 | 37.94× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 223567784 | 0.000 | 0.58× |
| fast-multisort | 129404067 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105273100 | 0.000 | 1.23× |
| es-toolkit.orderBy | 81158872 | 0.000 | 1.59× |
| sort-on | 72569369 | 0.000 | 1.78× |
| Array.prototype.sort, decorated | 62461556 | 0.000 | 2.07× |
| thenby | 41111357 | 0.000 | 3.15× |
| inline comparator chain, toSorted() | 37303371 | 0.000 | 3.47× |
| ramda.sortWith | 35368456 | 0.000 | 3.66× |
| remeda.sortBy | 30357101 | 0.000 | 4.26× |
| fast-sort | 30216152 | 0.000 | 4.28× |
| sort-array | 29494218 | 0.000 | 4.39× |
| sort-by | 28741134 | 0.000 | 4.50× |
| underscore.sortBy | 22661215 | 0.000 | 5.71× |
| lodash.orderBy | 19546696 | 0.000 | 6.62× |
| natural-orderby | 1706150 | 0.001 | 75.85× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 228545703 | 0.000 | 0.57× |
| fast-multisort | 129294703 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104534197 | 0.000 | 1.24× |
| es-toolkit.orderBy | 80449672 | 0.000 | 1.61× |
| sort-on | 72329616 | 0.000 | 1.79× |
| Array.prototype.sort, decorated | 63222770 | 0.000 | 2.05× |
| thenby | 41414726 | 0.000 | 3.12× |
| inline comparator chain, toSorted() | 37190470 | 0.000 | 3.48× |
| ramda.sortWith | 34914613 | 0.000 | 3.70× |
| remeda.sortBy | 30165517 | 0.000 | 4.29× |
| fast-sort | 29668982 | 0.000 | 4.36× |
| sort-array | 29021204 | 0.000 | 4.46× |
| sort-by | 28873730 | 0.000 | 4.48× |
| underscore.sortBy | 23204616 | 0.000 | 5.57× |
| lodash.orderBy | 19390514 | 0.000 | 6.67× |
| natural-orderby | 2981461 | 0.000 | 43.37× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 226587727 | 0.000 | 0.57× |
| fast-multisort | 129014656 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104687049 | 0.000 | 1.23× |
| es-toolkit.orderBy | 80450573 | 0.000 | 1.60× |
| sort-on | 72886002 | 0.000 | 1.77× |
| Array.prototype.sort, decorated | 63406435 | 0.000 | 2.03× |
| thenby | 41531327 | 0.000 | 3.11× |
| inline comparator chain, toSorted() | 37396775 | 0.000 | 3.45× |
| ramda.sortWith | 34249421 | 0.000 | 3.77× |
| remeda.sortBy | 30261096 | 0.000 | 4.26× |
| fast-sort | 29826551 | 0.000 | 4.33× |
| sort-array | 29399534 | 0.000 | 4.39× |
| sort-by | 28925337 | 0.000 | 4.46× |
| underscore.sortBy | 22563528 | 0.000 | 5.72× |
| lodash.orderBy | 19196778 | 0.000 | 6.72× |
| natural-orderby | 2670270 | 0.000 | 48.32× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 225119720 | 0.000 | 0.58× |
| fast-multisort | 129514451 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104598718 | 0.000 | 1.24× |
| es-toolkit.orderBy | 80153468 | 0.000 | 1.62× |
| sort-on | 72458106 | 0.000 | 1.79× |
| Array.prototype.sort, decorated | 62456286 | 0.000 | 2.07× |
| thenby | 41158356 | 0.000 | 3.15× |
| inline comparator chain, toSorted() | 37120309 | 0.000 | 3.49× |
| ramda.sortWith | 35031257 | 0.000 | 3.70× |
| remeda.sortBy | 30610480 | 0.000 | 4.23× |
| fast-sort | 30264954 | 0.000 | 4.28× |
| sort-array | 29452279 | 0.000 | 4.40× |
| sort-by | 28647921 | 0.000 | 4.52× |
| underscore.sortBy | 22614745 | 0.000 | 5.73× |
| lodash.orderBy | 19505518 | 0.000 | 6.64× |
| natural-orderby | 1849116 | 0.001 | 70.04× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 229293782 | 0.000 | 0.56× |
| fast-multisort | 128763148 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 104904807 | 0.000 | 1.23× |
| es-toolkit.orderBy | 80475401 | 0.000 | 1.60× |
| sort-on | 73436334 | 0.000 | 1.75× |
| Array.prototype.sort, decorated | 63132683 | 0.000 | 2.04× |
| thenby | 41243280 | 0.000 | 3.12× |
| inline comparator chain, toSorted() | 37170695 | 0.000 | 3.46× |
| ramda.sortWith | 34553963 | 0.000 | 3.73× |
| remeda.sortBy | 30403532 | 0.000 | 4.24× |
| fast-sort | 30100823 | 0.000 | 4.28× |
| sort-array | 29278587 | 0.000 | 4.40× |
| sort-by | 29097642 | 0.000 | 4.43× |
| underscore.sortBy | 22867793 | 0.000 | 5.63× |
| lodash.orderBy | 19429468 | 0.000 | 6.63× |
| natural-orderby | 3573562 | 0.000 | 36.03× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 227961110 | 0.000 | 0.56× |
| fast-multisort | 128211450 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105629796 | 0.000 | 1.21× |
| es-toolkit.orderBy | 80357579 | 0.000 | 1.60× |
| sort-on | 72515002 | 0.000 | 1.77× |
| Array.prototype.sort, decorated | 63402362 | 0.000 | 2.02× |
| thenby | 40926293 | 0.000 | 3.13× |
| inline comparator chain, toSorted() | 37586064 | 0.000 | 3.41× |
| ramda.sortWith | 34900038 | 0.000 | 3.67× |
| remeda.sortBy | 30619456 | 0.000 | 4.19× |
| fast-sort | 29988803 | 0.000 | 4.28× |
| sort-array | 29222761 | 0.000 | 4.39× |
| sort-by | 28867272 | 0.000 | 4.44× |
| underscore.sortBy | 23190417 | 0.000 | 5.53× |
| lodash.orderBy | 19528010 | 0.000 | 6.57× |
| natural-orderby | 3548396 | 0.000 | 36.13× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 227446811 | 0.000 | 0.57× |
| fast-multisort | 129256352 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 106117971 | 0.000 | 1.22× |
| es-toolkit.orderBy | 80606858 | 0.000 | 1.60× |
| sort-on | 73793144 | 0.000 | 1.75× |
| Array.prototype.sort, decorated | 62513302 | 0.000 | 2.07× |
| thenby | 41253894 | 0.000 | 3.13× |
| inline comparator chain, toSorted() | 37361466 | 0.000 | 3.46× |
| ramda.sortWith | 35115969 | 0.000 | 3.68× |
| remeda.sortBy | 30481196 | 0.000 | 4.24× |
| fast-sort | 29907261 | 0.000 | 4.32× |
| sort-array | 29589308 | 0.000 | 4.37× |
| sort-by | 28799978 | 0.000 | 4.49× |
| underscore.sortBy | 22401960 | 0.000 | 5.77× |
| lodash.orderBy | 19038797 | 0.000 | 6.79× |
| natural-orderby | 2743958 | 0.000 | 47.11× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 129401907 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 105282570 | 0.000 | 1.23× |
| es-toolkit.orderBy | 80876918 | 0.000 | 1.60× |
| sort-on | 72385058 | 0.000 | 1.79× |
| Array.prototype.sort, decorated | 62282933 | 0.000 | 2.08× |
| inline comparator chain, toSorted() | 37613084 | 0.000 | 3.44× |
| sort-array | 29573937 | 0.000 | 4.38× |
| sort-by | 25606199 | 0.000 | 5.05× |
| ramda.sortWith | 21850075 | 0.000 | 5.92× |
| remeda.sortBy | 16746782 | 0.000 | 7.73× |
| lodash.orderBy | 15130148 | 0.000 | 8.55× |
| thenby | 11877328 | 0.000 | 10.89× |
| fast-sort | 4984034 | 0.000 | 25.96× |
| natural-orderby | 894784 | 0.001 | 144.62× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7069687 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4659302 | 0.000 | 1.52× |
| inline comparator chain, slice().sort() | 4471120 | 0.000 | 1.58× |
| thenby | 4015348 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 3813928 | 0.000 | 1.85× |
| remeda.sortBy | 3770676 | 0.000 | 1.87× |
| es-toolkit.orderBy | 3716549 | 0.000 | 1.90× |
| fast-sort | 3013017 | 0.000 | 2.35× |
| sort-array | 2841895 | 0.000 | 2.49× |
| underscore.sortBy | 2750354 | 0.000 | 2.57× |
| lodash.orderBy | 2188640 | 0.000 | 3.23× |
| ramda.sortWith | 1752344 | 0.001 | 4.03× |
| just-sort-by (different order) | 1102192 | 0.001 | 6.41× |
| natural-orderby (different order) | 313299 | 0.003 | 22.57× |
| sort-on (different order) | 219010 | 0.005 | 32.28× |
| sort-by | 29595 | 0.034 | 238.88× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5043073 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 3915889 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 3686773 | 0.000 | 1.37× |
| thenby | 2585361 | 0.000 | 1.95× |
| remeda.sortBy | 2526397 | 0.000 | 2.00× |
| es-toolkit.orderBy | 2444936 | 0.000 | 2.06× |
| underscore.sortBy | 2239226 | 0.000 | 2.25× |
| fast-sort | 2204283 | 0.000 | 2.29× |
| Array.prototype.sort, decorated | 1984351 | 0.001 | 2.54× |
| lodash.orderBy | 1808039 | 0.001 | 2.79× |
| ramda.sortWith | 1349086 | 0.001 | 3.74× |
| sort-array | 1225764 | 0.001 | 4.11× |
| just-sort-by | 889471 | 0.001 | 5.67× |
| sort-on | 182576 | 0.005 | 27.62× |
| natural-orderby | 125346 | 0.008 | 40.23× |
| sort-by | 28046 | 0.036 | 179.81× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 7059676 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 6512315 | 0.000 | 1.08× |
| inline comparator chain, slice().sort() | 6155590 | 0.000 | 1.15× |
| just-sort-by (different order) | 3977785 | 0.000 | 1.77× |
| thenby (different order) | 3378834 | 0.000 | 2.09× |
| es-toolkit.orderBy | 3271844 | 0.000 | 2.16× |
| remeda.sortBy (different order) | 3195618 | 0.000 | 2.21× |
| underscore.sortBy (different order) | 2906489 | 0.000 | 2.43× |
| Array.prototype.sort, decorated | 2757311 | 0.000 | 2.56× |
| fast-sort | 2655515 | 0.000 | 2.66× |
| lodash.orderBy | 2285581 | 0.000 | 3.09× |
| ramda.sortWith (different order) | 1716291 | 0.001 | 4.11× |
| sort-array | 1515546 | 0.001 | 4.66× |
| natural-orderby | 313155 | 0.003 | 22.54× |
| sort-on | 276968 | 0.004 | 25.49× |
| sort-by (different order) | 35509 | 0.028 | 198.82× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5839242 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 5068245 | 0.000 | 1.15× |
| inline comparator chain, slice().sort() | 4732090 | 0.000 | 1.23× |
| just-sort-by | 2871039 | 0.000 | 2.03× |
| thenby | 2690464 | 0.000 | 2.17× |
| remeda.sortBy | 2633449 | 0.000 | 2.22× |
| underscore.sortBy | 2456495 | 0.000 | 2.38× |
| es-toolkit.orderBy | 2448468 | 0.000 | 2.38× |
| fast-sort | 2069871 | 0.000 | 2.82× |
| Array.prototype.sort, decorated | 1980466 | 0.001 | 2.95× |
| lodash.orderBy | 1768308 | 0.001 | 3.30× |
| ramda.sortWith | 1296934 | 0.001 | 4.50× |
| sort-array | 1076219 | 0.001 | 5.43× |
| natural-orderby | 261323 | 0.004 | 22.34× |
| sort-on | 185055 | 0.005 | 31.55× |
| sort-by | 26259 | 0.038 | 222.37× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4570592 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4089626 | 0.000 | 1.12× |
| inline comparator chain, slice().sort() | 3840835 | 0.000 | 1.19× |
| thenby | 2511948 | 0.000 | 1.82× |
| remeda.sortBy | 2485739 | 0.000 | 1.84× |
| es-toolkit.orderBy | 2338849 | 0.000 | 1.95× |
| underscore.sortBy | 2031093 | 0.000 | 2.25× |
| fast-sort | 1988767 | 0.001 | 2.30× |
| Array.prototype.sort, decorated | 1954305 | 0.001 | 2.34× |
| lodash.orderBy | 1630141 | 0.001 | 2.80× |
| just-sort-by | 1489528 | 0.001 | 3.07× |
| ramda.sortWith | 1369418 | 0.001 | 3.34× |
| sort-array | 1184509 | 0.001 | 3.86× |
| sort-on | 183434 | 0.005 | 24.92× |
| natural-orderby | 179795 | 0.006 | 25.42× |
| sort-by | 29583 | 0.034 | 154.50× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 13844918 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 12311131 | 0.000 | 1.12× |
| inline comparator chain, slice().sort() | 10565920 | 0.000 | 1.31× |
| just-sort-by | 6609075 | 0.000 | 2.09× |
| thenby | 5647363 | 0.000 | 2.45× |
| es-toolkit.orderBy | 5466467 | 0.000 | 2.53× |
| remeda.sortBy | 5326389 | 0.000 | 2.60× |
| Array.prototype.sort, decorated | 4828313 | 0.000 | 2.87× |
| fast-sort | 4029709 | 0.000 | 3.44× |
| underscore.sortBy | 3849214 | 0.000 | 3.60× |
| ramda.sortWith | 3234569 | 0.000 | 4.28× |
| lodash.orderBy | 3167074 | 0.000 | 4.37× |
| sort-array | 3080477 | 0.000 | 4.49× |
| sort-on | 519018 | 0.002 | 26.68× |
| natural-orderby | 380175 | 0.003 | 36.42× |
| sort-by | 73523 | 0.014 | 188.31× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 14558501 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 11862234 | 0.000 | 1.23× |
| inline comparator chain, slice().sort() | 10327831 | 0.000 | 1.41× |
| just-sort-by | 6495445 | 0.000 | 2.24× |
| thenby | 5478654 | 0.000 | 2.66× |
| es-toolkit.orderBy | 5357978 | 0.000 | 2.72× |
| remeda.sortBy | 5019191 | 0.000 | 2.90× |
| Array.prototype.sort, decorated | 4885422 | 0.000 | 2.98× |
| fast-sort | 4049291 | 0.000 | 3.60× |
| underscore.sortBy | 3707141 | 0.000 | 3.93× |
| ramda.sortWith | 3254298 | 0.000 | 4.47× |
| sort-array | 3144426 | 0.000 | 4.63× |
| lodash.orderBy | 2997085 | 0.000 | 4.86× |
| sort-on | 468302 | 0.002 | 31.09× |
| natural-orderby | 380111 | 0.003 | 38.30× |
| sort-by | 72290 | 0.014 | 201.39× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6963427 | 0.000 | 0.99× |
| fast-multisort | 6861076 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 6475383 | 0.000 | 1.06× |
| just-sort-by | 3269546 | 0.000 | 2.10× |
| underscore.sortBy | 3022547 | 0.000 | 2.27× |
| remeda.sortBy | 2939674 | 0.000 | 2.33× |
| thenby | 2899208 | 0.000 | 2.37× |
| es-toolkit.orderBy | 2730340 | 0.000 | 2.51× |
| Array.prototype.sort, decorated | 2472742 | 0.000 | 2.77× |
| fast-sort | 2301912 | 0.000 | 2.98× |
| lodash.orderBy | 2136875 | 0.000 | 3.21× |
| ramda.sortWith | 1555754 | 0.001 | 4.41× |
| sort-array | 1366308 | 0.001 | 5.02× |
| natural-orderby | 337465 | 0.003 | 20.33× |
| sort-on | 236443 | 0.004 | 29.02× |
| sort-by | 32173 | 0.031 | 213.25× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 4600302 | 0.000 | 0.49× |
| inline comparator chain, slice().sort() | 4405220 | 0.000 | 0.51× |
| fast-multisort | 2259940 | 0.000 | 1.00× |
| es-toolkit.orderBy | 2181119 | 0.000 | 1.04× |
| remeda.sortBy (different order) | 1913204 | 0.001 | 1.18× |
| Array.prototype.sort, decorated | 1912434 | 0.001 | 1.18× |
| thenby (different order) | 1608591 | 0.001 | 1.40× |
| lodash.orderBy | 1501469 | 0.001 | 1.51× |
| fast-sort (different order) | 1201637 | 0.001 | 1.88× |
| ramda.sortWith (different order) | 1126488 | 0.001 | 2.01× |
| sort-array (different order) | 912408 | 0.001 | 2.48× |
| sort-on (different order) | 182923 | 0.005 | 12.35× |
| natural-orderby (different order) | 84758 | 0.012 | 26.66× |
| sort-by (different order) | 25969 | 0.039 | 87.02× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 421608 | 0.002 | 1.00× |
| inline comparator chain, toSorted() | 252174 | 0.004 | 1.67× |
| inline comparator chain, slice().sort() | 241872 | 0.004 | 1.74× |
| underscore.sortBy | 141366 | 0.007 | 2.98× |
| thenby | 120322 | 0.008 | 3.50× |
| es-toolkit.orderBy | 106115 | 0.009 | 3.97× |
| lodash.orderBy | 105376 | 0.009 | 4.00× |
| fast-sort | 105345 | 0.009 | 4.00× |
| Array.prototype.sort, decorated | 94813 | 0.011 | 4.45× |
| remeda.sortBy | 89081 | 0.011 | 4.73× |
| ramda.sortWith | 55297 | 0.018 | 7.62× |
| sort-array | 48548 | 0.021 | 8.68× |
| just-sort-by (different order) | 42775 | 0.023 | 9.86× |
| natural-orderby (different order) | 25291 | 0.040 | 16.67× |
| sort-on (different order) | 9668 | 0.103 | 43.61× |
| sort-by | 1306 | 0.766 | 322.92× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 199489 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 176798 | 0.006 | 1.13× |
| inline comparator chain, slice().sort() | 170460 | 0.006 | 1.17× |
| thenby | 101643 | 0.010 | 1.96× |
| underscore.sortBy | 95928 | 0.010 | 2.08× |
| es-toolkit.orderBy | 88481 | 0.011 | 2.25× |
| fast-sort | 87308 | 0.011 | 2.28× |
| remeda.sortBy | 79574 | 0.013 | 2.51× |
| Array.prototype.sort, decorated | 74374 | 0.013 | 2.68× |
| lodash.orderBy | 73954 | 0.014 | 2.70× |
| ramda.sortWith | 48581 | 0.021 | 4.11× |
| sort-array | 38700 | 0.026 | 5.15× |
| just-sort-by (different order) | 35846 | 0.028 | 5.57× |
| natural-orderby (different order) | 9616 | 0.104 | 20.75× |
| sort-on (different order) | 7918 | 0.126 | 25.19× |
| sort-by | 1214 | 0.824 | 164.33× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 278087 | 0.004 | 0.94× |
| inline comparator chain, slice().sort() | 274044 | 0.004 | 0.95× |
| fast-multisort | 261211 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 172023 | 0.006 | 1.52× |
| just-sort-by (different order) | 157739 | 0.006 | 1.66× |
| thenby (different order) | 139149 | 0.007 | 1.88× |
| fast-sort | 127583 | 0.008 | 2.05× |
| es-toolkit.orderBy | 119704 | 0.008 | 2.18× |
| lodash.orderBy | 109312 | 0.009 | 2.39× |
| remeda.sortBy (different order) | 106927 | 0.009 | 2.44× |
| Array.prototype.sort, decorated | 101949 | 0.010 | 2.56× |
| ramda.sortWith (different order) | 58742 | 0.017 | 4.45× |
| sort-array | 53366 | 0.019 | 4.89× |
| natural-orderby | 27900 | 0.036 | 9.36× |
| sort-on | 10143 | 0.099 | 25.75× |
| sort-by (different order) | 1302 | 0.768 | 200.66× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 270853 | 0.004 | 0.79× |
| inline comparator chain, slice().sort() | 255300 | 0.004 | 0.84× |
| fast-multisort | 214947 | 0.005 | 1.00× |
| underscore.sortBy | 157574 | 0.006 | 1.36× |
| just-sort-by | 119949 | 0.008 | 1.79× |
| thenby | 119288 | 0.008 | 1.80× |
| fast-sort | 105550 | 0.009 | 2.04× |
| es-toolkit.orderBy | 104716 | 0.010 | 2.05× |
| remeda.sortBy | 100259 | 0.010 | 2.14× |
| lodash.orderBy | 96877 | 0.010 | 2.22× |
| Array.prototype.sort, decorated | 89777 | 0.011 | 2.39× |
| ramda.sortWith | 55706 | 0.018 | 3.86× |
| sort-array | 47576 | 0.021 | 4.52× |
| natural-orderby | 23538 | 0.042 | 9.13× |
| sort-on | 8787 | 0.114 | 24.46× |
| sort-by | 1249 | 0.801 | 172.16× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 200005 | 0.005 | 0.77× |
| inline comparator chain, slice().sort() | 194716 | 0.005 | 0.79× |
| fast-multisort | 153680 | 0.007 | 1.00× |
| thenby | 108689 | 0.009 | 1.41× |
| underscore.sortBy | 102440 | 0.010 | 1.50× |
| es-toolkit.orderBy | 93458 | 0.011 | 1.64× |
| fast-sort | 93056 | 0.011 | 1.65× |
| remeda.sortBy | 84592 | 0.012 | 1.82× |
| Array.prototype.sort, decorated | 81068 | 0.012 | 1.90× |
| lodash.orderBy | 78759 | 0.013 | 1.95× |
| just-sort-by | 60164 | 0.017 | 2.55× |
| ramda.sortWith | 49926 | 0.020 | 3.08× |
| sort-array | 42274 | 0.024 | 3.64× |
| natural-orderby | 16546 | 0.060 | 9.29× |
| sort-on | 7459 | 0.134 | 20.60× |
| sort-by | 1209 | 0.827 | 127.09× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1851143 | 0.001 | 0.99× |
| fast-multisort | 1838137 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1529036 | 0.001 | 1.20× |
| just-sort-by | 854026 | 0.001 | 2.15× |
| thenby | 759585 | 0.001 | 2.42× |
| fast-sort | 691349 | 0.001 | 2.66× |
| remeda.sortBy | 679418 | 0.001 | 2.71× |
| es-toolkit.orderBy | 673752 | 0.001 | 2.73× |
| Array.prototype.sort, decorated | 574767 | 0.002 | 3.20× |
| underscore.sortBy | 487411 | 0.002 | 3.77× |
| lodash.orderBy | 390387 | 0.003 | 4.71× |
| ramda.sortWith | 346956 | 0.003 | 5.30× |
| sort-array | 307795 | 0.003 | 5.97× |
| sort-on | 48757 | 0.021 | 37.70× |
| natural-orderby | 35284 | 0.028 | 52.10× |
| sort-by | 6810 | 0.147 | 269.93× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1854825 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 1721176 | 0.001 | 1.08× |
| inline comparator chain, slice().sort() | 1445987 | 0.001 | 1.28× |
| just-sort-by | 842185 | 0.001 | 2.20× |
| thenby | 774454 | 0.001 | 2.40× |
| fast-sort | 697938 | 0.001 | 2.66× |
| es-toolkit.orderBy | 651091 | 0.002 | 2.85× |
| Array.prototype.sort, decorated | 576371 | 0.002 | 3.22× |
| remeda.sortBy | 541977 | 0.002 | 3.42× |
| underscore.sortBy | 459325 | 0.002 | 4.04× |
| lodash.orderBy | 360238 | 0.003 | 5.15× |
| ramda.sortWith | 341272 | 0.003 | 5.44× |
| sort-array | 321157 | 0.003 | 5.78× |
| sort-on | 44036 | 0.023 | 42.12× |
| natural-orderby | 35278 | 0.028 | 52.58× |
| sort-by | 6575 | 0.152 | 282.11× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1089412 | 0.001 | 0.86× |
| inline comparator chain, slice().sort() | 974975 | 0.001 | 0.96× |
| fast-multisort | 932629 | 0.001 | 1.00× |
| just-sort-by | 518749 | 0.002 | 1.80× |
| thenby | 444674 | 0.002 | 2.10× |
| underscore.sortBy | 401145 | 0.002 | 2.32× |
| fast-sort | 396717 | 0.003 | 2.35× |
| remeda.sortBy | 384387 | 0.003 | 2.43× |
| es-toolkit.orderBy | 381465 | 0.003 | 2.44× |
| Array.prototype.sort, decorated | 340146 | 0.003 | 2.74× |
| lodash.orderBy | 291274 | 0.003 | 3.20× |
| ramda.sortWith | 197852 | 0.005 | 4.71× |
| sort-array | 175498 | 0.006 | 5.31× |
| natural-orderby | 33678 | 0.030 | 27.69× |
| sort-on | 29713 | 0.034 | 31.39× |
| sort-by | 3960 | 0.253 | 235.49× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 223546 | 0.004 | 0.71× |
| inline comparator chain, slice().sort() | 217679 | 0.005 | 0.73× |
| fast-multisort | 158262 | 0.006 | 1.00× |
| lodash.orderBy | 85196 | 0.012 | 1.86× |
| es-toolkit.orderBy | 77980 | 0.013 | 2.03× |
| Array.prototype.sort, decorated | 71743 | 0.014 | 2.21× |
| remeda.sortBy (different order) | 68875 | 0.015 | 2.30× |
| thenby (different order) | 66082 | 0.015 | 2.39× |
| fast-sort (different order) | 54987 | 0.018 | 2.88× |
| ramda.sortWith (different order) | 42036 | 0.024 | 3.76× |
| sort-array (different order) | 34178 | 0.029 | 4.63× |
| natural-orderby (different order) | 8033 | 0.124 | 19.70× |
| sort-on (different order) | 7213 | 0.139 | 21.94× |
| sort-by (different order) | 845 | 1.184 | 187.38× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 45197 | 0.022 | 1.00× |
| inline comparator chain, toSorted() | 17518 | 0.057 | 2.58× |
| inline comparator chain, slice().sort() | 17237 | 0.058 | 2.62× |
| underscore.sortBy | 10073 | 0.099 | 4.49× |
| thenby | 8731 | 0.115 | 5.18× |
| fast-sort | 8017 | 0.125 | 5.64× |
| lodash.orderBy | 7645 | 0.131 | 5.91× |
| es-toolkit.orderBy | 7577 | 0.132 | 5.96× |
| Array.prototype.sort, decorated | 6893 | 0.145 | 6.56× |
| remeda.sortBy | 6538 | 0.153 | 6.91× |
| ramda.sortWith | 4335 | 0.231 | 10.43× |
| sort-array | 3841 | 0.260 | 11.77× |
| just-sort-by (different order) | 3129 | 0.320 | 14.45× |
| natural-orderby (different order) | 2178 | 0.459 | 20.75× |
| sort-on (different order) | 742 | 1.348 | 60.94× |
| sort-by | 101 | 9.917 | 448.23× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11301 | 0.088 | 1.00× |
| inline comparator chain, toSorted() | 8388 | 0.119 | 1.35× |
| inline comparator chain, slice().sort() | 8278 | 0.121 | 1.37× |
| underscore.sortBy | 5564 | 0.180 | 2.03× |
| thenby | 5439 | 0.184 | 2.08× |
| fast-sort | 4966 | 0.201 | 2.28× |
| es-toolkit.orderBy | 4841 | 0.207 | 2.33× |
| remeda.sortBy | 4460 | 0.224 | 2.53× |
| Array.prototype.sort, decorated | 4291 | 0.233 | 2.63× |
| lodash.orderBy | 4260 | 0.235 | 2.65× |
| ramda.sortWith | 2915 | 0.343 | 3.88× |
| sort-array | 2431 | 0.411 | 4.65× |
| just-sort-by (different order) | 2273 | 0.440 | 4.97× |
| natural-orderby (different order) | 752 | 1.329 | 15.02× |
| sort-on (different order) | 482 | 2.076 | 23.46× |
| sort-by | 76 | 13.176 | 148.91× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 34041 | 0.029 | 1.00× |
| inline comparator chain, toSorted() | 15202 | 0.066 | 2.24× |
| inline comparator chain, slice().sort() | 15128 | 0.066 | 2.25× |
| underscore.sortBy (different order) | 10340 | 0.097 | 3.29× |
| just-sort-by (different order) | 8494 | 0.118 | 4.01× |
| thenby (different order) | 8035 | 0.124 | 4.24× |
| fast-sort | 7654 | 0.131 | 4.45× |
| es-toolkit.orderBy | 7246 | 0.138 | 4.70× |
| lodash.orderBy | 7044 | 0.142 | 4.83× |
| Array.prototype.sort, decorated | 6644 | 0.151 | 5.12× |
| remeda.sortBy (different order) | 6520 | 0.153 | 5.22× |
| ramda.sortWith (different order) | 3739 | 0.267 | 9.11× |
| sort-array | 3327 | 0.301 | 10.23× |
| natural-orderby | 2302 | 0.434 | 14.79× |
| sort-on | 629 | 1.591 | 54.16× |
| sort-by (different order) | 81 | 12.394 | 421.91× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 30908 | 0.032 | 1.00× |
| inline comparator chain, toSorted() | 12149 | 0.082 | 2.54× |
| inline comparator chain, slice().sort() | 11889 | 0.084 | 2.60× |
| underscore.sortBy | 8870 | 0.113 | 3.48× |
| thenby | 6775 | 0.148 | 4.56× |
| just-sort-by | 6731 | 0.149 | 4.59× |
| fast-sort | 6250 | 0.160 | 4.95× |
| es-toolkit.orderBy | 6068 | 0.165 | 5.09× |
| lodash.orderBy | 5989 | 0.167 | 5.16× |
| remeda.sortBy | 5969 | 0.168 | 5.18× |
| Array.prototype.sort, decorated | 5618 | 0.178 | 5.50× |
| ramda.sortWith | 3387 | 0.295 | 9.13× |
| sort-array | 3032 | 0.330 | 10.19× |
| natural-orderby | 1913 | 0.523 | 16.15× |
| sort-on | 546 | 1.833 | 56.65× |
| sort-by | 77 | 12.993 | 401.58× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11885 | 0.084 | 1.00× |
| inline comparator chain, toSorted() | 9433 | 0.106 | 1.26× |
| inline comparator chain, slice().sort() | 9332 | 0.107 | 1.27× |
| thenby | 5857 | 0.171 | 2.03× |
| underscore.sortBy | 5840 | 0.171 | 2.04× |
| fast-sort | 5274 | 0.190 | 2.25× |
| es-toolkit.orderBy | 5157 | 0.194 | 2.30× |
| Array.prototype.sort, decorated | 4780 | 0.209 | 2.49× |
| remeda.sortBy | 4717 | 0.212 | 2.52× |
| lodash.orderBy | 4506 | 0.222 | 2.64× |
| just-sort-by | 3568 | 0.280 | 3.33× |
| ramda.sortWith | 3022 | 0.331 | 3.93× |
| sort-array | 2658 | 0.376 | 4.47× |
| natural-orderby | 1437 | 0.696 | 8.27× |
| sort-on | 470 | 2.128 | 25.30× |
| sort-by | 75 | 13.274 | 157.76× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 191267 | 0.005 | 0.96× |
| fast-multisort | 183595 | 0.005 | 1.00× |
| inline comparator chain, slice().sort() | 155900 | 0.006 | 1.18× |
| just-sort-by | 89057 | 0.011 | 2.06× |
| thenby | 78665 | 0.013 | 2.33× |
| fast-sort | 73689 | 0.014 | 2.49× |
| es-toolkit.orderBy | 66389 | 0.015 | 2.77× |
| remeda.sortBy | 65872 | 0.015 | 2.79× |
| Array.prototype.sort, decorated | 55271 | 0.018 | 3.32× |
| underscore.sortBy | 49594 | 0.020 | 3.70× |
| lodash.orderBy | 39575 | 0.025 | 4.64× |
| ramda.sortWith | 34030 | 0.029 | 5.40× |
| sort-array | 30988 | 0.032 | 5.92× |
| sort-on | 4817 | 0.208 | 38.11× |
| natural-orderby | 3412 | 0.293 | 53.81× |
| sort-by | 659 | 1.518 | 278.66× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 183053 | 0.005 | 1.00× |
| inline comparator chain, toSorted() | 180913 | 0.006 | 1.01× |
| inline comparator chain, slice().sort() | 146222 | 0.007 | 1.25× |
| just-sort-by | 86681 | 0.012 | 2.11× |
| thenby | 79668 | 0.013 | 2.30× |
| fast-sort | 75688 | 0.013 | 2.42× |
| es-toolkit.orderBy | 67250 | 0.015 | 2.72× |
| remeda.sortBy | 55327 | 0.018 | 3.31× |
| Array.prototype.sort, decorated | 55238 | 0.018 | 3.31× |
| underscore.sortBy | 46124 | 0.022 | 3.97× |
| lodash.orderBy | 36866 | 0.027 | 4.97× |
| ramda.sortWith | 33568 | 0.030 | 5.45× |
| sort-array | 31913 | 0.031 | 5.74× |
| sort-on | 4324 | 0.231 | 42.33× |
| natural-orderby | 3430 | 0.292 | 53.37× |
| sort-by | 651 | 1.536 | 281.24× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 160488 | 0.006 | 0.78× |
| inline comparator chain, slice().sort() | 133360 | 0.007 | 0.94× |
| fast-multisort | 125054 | 0.008 | 1.00× |
| just-sort-by | 79850 | 0.013 | 1.57× |
| thenby | 71710 | 0.014 | 1.74× |
| fast-sort | 67103 | 0.015 | 1.86× |
| es-toolkit.orderBy | 61446 | 0.016 | 2.04× |
| remeda.sortBy | 60425 | 0.017 | 2.07× |
| Array.prototype.sort, decorated | 50981 | 0.020 | 2.45× |
| underscore.sortBy | 46768 | 0.021 | 2.67× |
| lodash.orderBy | 38099 | 0.026 | 3.28× |
| ramda.sortWith | 32259 | 0.031 | 3.88× |
| sort-array | 28576 | 0.035 | 4.38× |
| sort-on | 4970 | 0.201 | 25.16× |
| natural-orderby | 3423 | 0.292 | 36.53× |
| sort-by | 659 | 1.518 | 189.82× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12711 | 0.079 | 1.00× |
| inline comparator chain, slice().sort() | 11926 | 0.084 | 1.07× |
| inline comparator chain, toSorted() | 11762 | 0.085 | 1.08× |
| lodash.orderBy | 5297 | 0.189 | 2.40× |
| es-toolkit.orderBy | 4341 | 0.230 | 2.93× |
| Array.prototype.sort, decorated | 4189 | 0.239 | 3.03× |
| thenby (different order) | 3864 | 0.259 | 3.29× |
| remeda.sortBy (different order) | 3789 | 0.264 | 3.36× |
| fast-sort (different order) | 3094 | 0.323 | 4.11× |
| ramda.sortWith (different order) | 2417 | 0.414 | 5.26× |
| sort-array (different order) | 1944 | 0.514 | 6.54× |
| natural-orderby (different order) | 733 | 1.364 | 17.34× |
| sort-on (different order) | 405 | 2.471 | 31.41× |
| sort-by (different order) | 47 | 21.497 | 273.25× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4488 | 0.223 | 1.00× |
| inline comparator chain, toSorted() | 1273 | 0.786 | 3.53× |
| inline comparator chain, slice().sort() | 1256 | 0.796 | 3.57× |
| underscore.sortBy | 861 | 1.161 | 5.21× |
| thenby | 775 | 1.291 | 5.79× |
| fast-sort | 708 | 1.411 | 6.33× |
| es-toolkit.orderBy | 708 | 1.413 | 6.34× |
| lodash.orderBy | 661 | 1.514 | 6.79× |
| Array.prototype.sort, decorated | 650 | 1.538 | 6.90× |
| remeda.sortBy | 580 | 1.724 | 7.74× |
| ramda.sortWith | 395 | 2.529 | 11.35× |
| sort-array | 355 | 2.818 | 12.64× |
| just-sort-by (different order) | 298 | 3.353 | 15.05× |
| natural-orderby (different order) | 213 | 4.700 | 21.09× |
| sort-on (different order) | 70 | 14.241 | 63.91× |
| sort-by | 10 | 104.448 | 468.71× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 830 | 1.205 | 1.00× |
| inline comparator chain, toSorted() | 458 | 2.184 | 1.81× |
| inline comparator chain, slice().sort() | 443 | 2.257 | 1.87× |
| underscore.sortBy | 355 | 2.820 | 2.34× |
| thenby | 347 | 2.886 | 2.39× |
| fast-sort | 322 | 3.110 | 2.58× |
| es-toolkit.orderBy | 320 | 3.124 | 2.59× |
| remeda.sortBy | 296 | 3.378 | 2.80× |
| Array.prototype.sort, decorated | 287 | 3.479 | 2.89× |
| lodash.orderBy | 266 | 3.755 | 3.12× |
| ramda.sortWith | 198 | 5.056 | 4.20× |
| sort-array | 171 | 5.854 | 4.86× |
| just-sort-by (different order) | 164 | 6.088 | 5.05× |
| natural-orderby (different order) | 57 | 17.505 | 14.53× |
| sort-on (different order) | 35 | 28.875 | 23.96× |
| sort-by | 5 | 184.773 | 153.33× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3750 | 0.267 | 1.00× |
| inline comparator chain, toSorted() | 934 | 1.071 | 4.02× |
| inline comparator chain, slice().sort() | 930 | 1.076 | 4.03× |
| underscore.sortBy (different order) | 720 | 1.389 | 5.21× |
| thenby (different order) | 602 | 1.661 | 6.23× |
| just-sort-by (different order) | 601 | 1.664 | 6.24× |
| fast-sort | 564 | 1.773 | 6.65× |
| es-toolkit.orderBy | 535 | 1.870 | 7.01× |
| remeda.sortBy (different order) | 495 | 2.022 | 7.58× |
| lodash.orderBy | 489 | 2.046 | 7.67× |
| Array.prototype.sort, decorated | 478 | 2.093 | 7.85× |
| ramda.sortWith (different order) | 280 | 3.574 | 13.40× |
| sort-array | 250 | 3.999 | 15.00× |
| natural-orderby | 185 | 5.403 | 20.26× |
| sort-on | 46 | 21.545 | 80.80× |
| sort-by (different order) | 6 | 170.780 | 640.44× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3540 | 0.282 | 1.00× |
| inline comparator chain, slice().sort() | 705 | 1.418 | 5.02× |
| inline comparator chain, toSorted() | 696 | 1.436 | 5.08× |
| underscore.sortBy | 618 | 1.619 | 5.73× |
| thenby | 468 | 2.135 | 7.56× |
| just-sort-by | 463 | 2.158 | 7.64× |
| fast-sort | 451 | 2.218 | 7.85× |
| remeda.sortBy | 422 | 2.371 | 8.40× |
| es-toolkit.orderBy | 420 | 2.379 | 8.42× |
| lodash.orderBy | 415 | 2.410 | 8.53× |
| Array.prototype.sort, decorated | 379 | 2.638 | 9.34× |
| ramda.sortWith | 241 | 4.142 | 14.67× |
| sort-array | 221 | 4.532 | 16.04× |
| natural-orderby | 140 | 7.129 | 25.24× |
| sort-on | 40 | 25.149 | 89.03× |
| sort-by | 6 | 180.951 | 640.62× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 784 | 1.275 | 1.00× |
| inline comparator chain, toSorted() | 498 | 2.007 | 1.57× |
| inline comparator chain, slice().sort() | 493 | 2.027 | 1.59× |
| underscore.sortBy | 403 | 2.481 | 1.95× |
| thenby | 375 | 2.668 | 2.09× |
| fast-sort | 362 | 2.761 | 2.16× |
| es-toolkit.orderBy | 349 | 2.865 | 2.25× |
| Array.prototype.sort, decorated | 332 | 3.016 | 2.37× |
| remeda.sortBy | 328 | 3.050 | 2.39× |
| lodash.orderBy | 300 | 3.334 | 2.61× |
| just-sort-by | 258 | 3.873 | 3.04× |
| ramda.sortWith | 217 | 4.612 | 3.62× |
| sort-array | 195 | 5.139 | 4.03× |
| natural-orderby | 119 | 8.403 | 6.59× |
| sort-on | 34 | 29.800 | 23.37× |
| sort-by | 5 | 184.567 | 144.73× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 19675 | 0.051 | 0.98× |
| fast-multisort | 19252 | 0.052 | 1.00× |
| inline comparator chain, slice().sort() | 15702 | 0.064 | 1.23× |
| just-sort-by | 8747 | 0.114 | 2.20× |
| thenby | 7912 | 0.126 | 2.43× |
| fast-sort | 7522 | 0.133 | 2.56× |
| remeda.sortBy | 6914 | 0.145 | 2.78× |
| es-toolkit.orderBy | 6713 | 0.149 | 2.87× |
| Array.prototype.sort, decorated | 5570 | 0.180 | 3.46× |
| underscore.sortBy | 4940 | 0.202 | 3.90× |
| lodash.orderBy | 3876 | 0.258 | 4.97× |
| ramda.sortWith | 3447 | 0.290 | 5.59× |
| sort-array | 3156 | 0.317 | 6.10× |
| sort-on | 485 | 2.060 | 39.66× |
| natural-orderby | 329 | 3.043 | 58.58× |
| sort-by | 67 | 15.029 | 289.35× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 18486 | 0.054 | 1.00× |
| inline comparator chain, toSorted() | 18395 | 0.054 | 1.00× |
| inline comparator chain, slice().sort() | 14723 | 0.068 | 1.26× |
| just-sort-by | 8666 | 0.115 | 2.13× |
| thenby | 7991 | 0.125 | 2.31× |
| fast-sort | 7669 | 0.130 | 2.41× |
| es-toolkit.orderBy | 6595 | 0.152 | 2.80× |
| remeda.sortBy | 5680 | 0.176 | 3.25× |
| Array.prototype.sort, decorated | 5632 | 0.178 | 3.28× |
| underscore.sortBy | 4651 | 0.215 | 3.97× |
| lodash.orderBy | 3559 | 0.281 | 5.19× |
| ramda.sortWith | 3464 | 0.289 | 5.34× |
| sort-array | 3241 | 0.309 | 5.70× |
| sort-on | 436 | 2.291 | 42.35× |
| natural-orderby | 321 | 3.113 | 57.54× |
| sort-by | 65 | 15.484 | 286.22× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 17471 | 0.057 | 0.78× |
| inline comparator chain, slice().sort() | 14182 | 0.071 | 0.97× |
| fast-multisort | 13705 | 0.073 | 1.00× |
| just-sort-by | 8509 | 0.118 | 1.61× |
| thenby | 7479 | 0.134 | 1.83× |
| fast-sort | 7045 | 0.142 | 1.95× |
| es-toolkit.orderBy | 6339 | 0.158 | 2.16× |
| remeda.sortBy | 6052 | 0.165 | 2.26× |
| Array.prototype.sort, decorated | 5275 | 0.190 | 2.60× |
| underscore.sortBy | 4841 | 0.207 | 2.83× |
| lodash.orderBy | 3685 | 0.271 | 3.72× |
| ramda.sortWith | 3357 | 0.298 | 4.08× |
| sort-array | 2911 | 0.344 | 4.71× |
| sort-on | 508 | 1.967 | 26.96× |
| natural-orderby | 318 | 3.145 | 43.11× |
| sort-by | 67 | 14.940 | 204.75× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1487 | 0.672 | 1.00× |
| inline comparator chain, toSorted() | 678 | 1.475 | 2.19× |
| inline comparator chain, slice().sort() | 674 | 1.484 | 2.21× |
| lodash.orderBy | 341 | 2.932 | 4.36× |
| Array.prototype.sort, decorated | 299 | 3.341 | 4.97× |
| es-toolkit.orderBy | 293 | 3.418 | 5.08× |
| thenby (different order) | 261 | 3.834 | 5.70× |
| remeda.sortBy (different order) | 256 | 3.912 | 5.82× |
| fast-sort (different order) | 217 | 4.609 | 6.86× |
| ramda.sortWith (different order) | 166 | 6.035 | 8.98× |
| sort-array (different order) | 136 | 7.361 | 10.95× |
| natural-orderby (different order) | 61 | 16.283 | 24.22× |
| sort-on (different order) | 28 | 36.123 | 53.73× |
| sort-by (different order) | 3 | 321.654 | 478.42× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 389 | 2.574 | 1.00× |
| inline comparator chain, toSorted() | 112 | 8.907 | 3.46× |
| inline comparator chain, slice().sort() | 109 | 9.204 | 3.58× |
| underscore.sortBy | 74 | 13.481 | 5.24× |
| thenby | 73 | 13.754 | 5.34× |
| fast-sort | 69 | 14.533 | 5.65× |
| es-toolkit.orderBy | 66 | 15.106 | 5.87× |
| lodash.orderBy | 59 | 16.987 | 6.60× |
| remeda.sortBy | 56 | 17.787 | 6.91× |
| Array.prototype.sort, decorated | 53 | 18.979 | 7.37× |
| ramda.sortWith | 37 | 26.940 | 10.47× |
| sort-array | 34 | 29.020 | 11.28× |
| just-sort-by (different order) | 27 | 37.029 | 14.39× |
| natural-orderby (different order) | 18 | 55.032 | 21.38× |
| sort-on (different order) | 7 | 143.707 | 55.83× |
| sort-by | 1 | 1084.044 | 421.19× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 54 | 18.350 | 1.00× |
| inline comparator chain, toSorted() | 28 | 35.748 | 1.95× |
| inline comparator chain, slice().sort() | 28 | 35.894 | 1.96× |
| underscore.sortBy | 23 | 44.092 | 2.40× |
| thenby | 22 | 45.618 | 2.49× |
| fast-sort | 21 | 46.726 | 2.55× |
| es-toolkit.orderBy | 20 | 49.803 | 2.71× |
| remeda.sortBy | 20 | 50.129 | 2.73× |
| Array.prototype.sort, decorated | 16 | 61.620 | 3.36× |
| lodash.orderBy | 15 | 64.800 | 3.53× |
| ramda.sortWith | 13 | 79.723 | 4.34× |
| sort-array | 12 | 85.166 | 4.64× |
| just-sort-by (different order) | 11 | 95.169 | 5.19× |
| natural-orderby (different order) | 4 | 280.589 | 15.29× |
| sort-on (different order) | 2 | 405.462 | 22.10× |
| sort-by | 0 | 2403.306 | 130.97× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 316 | 3.164 | 1.00× |
| inline comparator chain, slice().sort() | 66 | 15.246 | 4.82× |
| inline comparator chain, toSorted() | 65 | 15.285 | 4.83× |
| underscore.sortBy (different order) | 55 | 18.068 | 5.71× |
| just-sort-by (different order) | 44 | 22.547 | 7.13× |
| thenby (different order) | 44 | 22.798 | 7.20× |
| fast-sort | 41 | 24.571 | 7.77× |
| remeda.sortBy (different order) | 35 | 28.249 | 8.93× |
| es-toolkit.orderBy | 35 | 28.302 | 8.94× |
| lodash.orderBy | 31 | 32.645 | 10.32× |
| Array.prototype.sort, decorated | 29 | 34.245 | 10.82× |
| ramda.sortWith (different order) | 20 | 50.656 | 16.01× |
| sort-array | 19 | 53.289 | 16.84× |
| natural-orderby | 14 | 73.425 | 23.20× |
| sort-on | 3 | 285.959 | 90.37× |
| sort-by (different order) | 0 | 2163.894 | 683.83× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 321 | 3.115 | 1.00× |
| inline comparator chain, toSorted() | 49 | 20.214 | 6.49× |
| inline comparator chain, slice().sort() | 49 | 20.422 | 6.56× |
| underscore.sortBy | 45 | 22.234 | 7.14× |
| thenby | 34 | 29.750 | 9.55× |
| fast-sort | 32 | 31.117 | 9.99× |
| remeda.sortBy | 30 | 33.611 | 10.79× |
| just-sort-by | 29 | 35.087 | 11.27× |
| es-toolkit.orderBy | 27 | 36.415 | 11.69× |
| lodash.orderBy | 25 | 40.565 | 13.02× |
| Array.prototype.sort, decorated | 20 | 48.854 | 15.69× |
| ramda.sortWith | 17 | 57.219 | 18.37× |
| sort-array | 16 | 63.219 | 20.30× |
| natural-orderby | 10 | 97.837 | 31.41× |
| sort-on | 3 | 342.529 | 109.98× |
| sort-by | 0 | 2365.344 | 759.45× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 48 | 20.898 | 1.00× |
| inline comparator chain, toSorted() | 33 | 30.598 | 1.46× |
| inline comparator chain, slice().sort() | 32 | 31.255 | 1.50× |
| thenby | 26 | 38.219 | 1.83× |
| underscore.sortBy | 26 | 38.557 | 1.85× |
| fast-sort | 24 | 42.105 | 2.01× |
| es-toolkit.orderBy | 23 | 43.878 | 2.10× |
| remeda.sortBy | 23 | 44.239 | 2.12× |
| Array.prototype.sort, decorated | 19 | 52.811 | 2.53× |
| just-sort-by | 17 | 58.809 | 2.81× |
| lodash.orderBy | 17 | 59.613 | 2.85× |
| ramda.sortWith | 14 | 72.890 | 3.49× |
| sort-array | 13 | 78.261 | 3.74× |
| natural-orderby | 8 | 125.063 | 5.98× |
| sort-on | 2 | 419.595 | 20.08× |
| sort-by | 0 | 2404.542 | 115.06× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1577 | 0.634 | 0.91× |
| fast-multisort | 1428 | 0.701 | 1.00× |
| inline comparator chain, slice().sort() | 1249 | 0.800 | 1.14× |
| just-sort-by | 806 | 1.240 | 1.77× |
| thenby | 717 | 1.394 | 1.99× |
| fast-sort | 698 | 1.432 | 2.04× |
| es-toolkit.orderBy | 617 | 1.620 | 2.31× |
| remeda.sortBy | 547 | 1.828 | 2.61× |
| underscore.sortBy | 412 | 2.427 | 3.46× |
| Array.prototype.sort, decorated | 340 | 2.939 | 4.19× |
| ramda.sortWith | 328 | 3.046 | 4.35× |
| lodash.orderBy | 308 | 3.250 | 4.64× |
| sort-array | 280 | 3.571 | 5.10× |
| sort-on | 45 | 22.305 | 31.84× |
| natural-orderby | 27 | 37.098 | 52.96× |
| sort-by | 7 | 152.541 | 217.76× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1602 | 0.624 | 1.00× |
| inline comparator chain, toSorted() | 1487 | 0.672 | 1.08× |
| inline comparator chain, slice().sort() | 1212 | 0.825 | 1.32× |
| thenby | 766 | 1.305 | 2.09× |
| just-sort-by | 747 | 1.339 | 2.14× |
| fast-sort | 714 | 1.400 | 2.24× |
| es-toolkit.orderBy | 636 | 1.572 | 2.52× |
| remeda.sortBy | 479 | 2.089 | 3.35× |
| underscore.sortBy | 403 | 2.480 | 3.97× |
| ramda.sortWith | 337 | 2.968 | 4.75× |
| Array.prototype.sort, decorated | 331 | 3.024 | 4.84× |
| lodash.orderBy | 302 | 3.316 | 5.31× |
| sort-array | 292 | 3.421 | 5.48× |
| sort-on | 41 | 24.305 | 38.93× |
| natural-orderby | 27 | 36.813 | 58.96× |
| sort-by | 6 | 154.922 | 248.12× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1439 | 0.695 | 0.73× |
| inline comparator chain, slice().sort() | 1198 | 0.835 | 0.88× |
| fast-multisort | 1054 | 0.948 | 1.00× |
| just-sort-by | 775 | 1.290 | 1.36× |
| thenby | 710 | 1.409 | 1.49× |
| fast-sort | 665 | 1.504 | 1.59× |
| es-toolkit.orderBy | 593 | 1.686 | 1.78× |
| remeda.sortBy | 526 | 1.902 | 2.01× |
| underscore.sortBy | 437 | 2.286 | 2.41× |
| ramda.sortWith | 328 | 3.052 | 3.22× |
| lodash.orderBy | 315 | 3.175 | 3.35× |
| Array.prototype.sort, decorated | 295 | 3.385 | 3.57× |
| sort-array | 269 | 3.723 | 3.93× |
| sort-on | 48 | 20.789 | 21.92× |
| natural-orderby | 27 | 37.138 | 39.16× |
| sort-by | 7 | 148.263 | 156.33× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 126 | 7.935 | 1.00× |
| inline comparator chain, toSorted() | 46 | 21.757 | 2.74× |
| inline comparator chain, slice().sort() | 46 | 21.778 | 2.74× |
| es-toolkit.orderBy | 20 | 49.017 | 6.18× |
| lodash.orderBy | 20 | 49.072 | 6.18× |
| Array.prototype.sort, decorated | 19 | 52.248 | 6.58× |
| remeda.sortBy (different order) | 19 | 53.091 | 6.69× |
| thenby (different order) | 19 | 53.818 | 6.78× |
| fast-sort (different order) | 16 | 62.102 | 7.83× |
| ramda.sortWith (different order) | 11 | 88.964 | 11.21× |
| sort-array (different order) | 10 | 101.751 | 12.82× |
| natural-orderby (different order) | 5 | 205.935 | 25.95× |
| sort-on (different order) | 2 | 502.462 | 63.32× |
| sort-by (different order) | 0 | 4225.427 | 532.49× |

#### 1,000,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 38 | 26.284 | 1.00× |
| inline comparator chain, slice().sort() | 11 | 92.083 | 3.50× |
| inline comparator chain, toSorted() | 11 | 92.921 | 3.54× |
| es-toolkit.orderBy | 7 | 150.428 | 5.72× |
| fast-sort | 7 | 153.799 | 5.85× |
| underscore.sortBy | 6 | 155.802 | 5.93× |
| remeda.sortBy | 6 | 181.804 | 6.92× |
| thenby | 5 | 185.581 | 7.06× |
| lodash.orderBy | 5 | 189.385 | 7.21× |
| Array.prototype.sort, decorated | 5 | 198.767 | 7.56× |
| ramda.sortWith | 4 | 261.624 | 9.95× |
| sort-array | 3 | 292.135 | 11.11× |
| just-sort-by (different order) | 3 | 370.595 | 14.10× |
| natural-orderby (different order) | 2 | 635.962 | 24.20× |
| sort-on (different order) | 1 | 1429.094 | 54.37× |
| sort-by | 0 | 10222.938 | 388.94× |

#### 1,000,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 402.787 | 1.00× |
| inline comparator chain, toSorted() | 1 | 721.581 | 1.79× |
| inline comparator chain, slice().sort() | 1 | 727.780 | 1.81× |
| thenby | 1 | 959.443 | 2.38× |
| underscore.sortBy | 1 | 963.487 | 2.39× |
| fast-sort | 1 | 1010.337 | 2.51× |
| remeda.sortBy | 1 | 1044.622 | 2.59× |
| es-toolkit.orderBy | 1 | 1062.645 | 2.64× |
| Array.prototype.sort, decorated | 1 | 1442.223 | 3.58× |
| lodash.orderBy | 1 | 1519.455 | 3.77× |
| ramda.sortWith | 1 | 1528.497 | 3.79× |
| sort-array | 1 | 1803.253 | 4.48× |
| just-sort-by (different order) | 0 | 2049.194 | 5.09× |
| natural-orderby (different order) | 0 | 5353.431 | 13.29× |
| sort-on (different order) | 0 | 5636.373 | 13.99× |
| sort-by | 0 | 29580.205 | 73.44× |

#### 1,000,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24 | 42.143 | 1.00× |
| inline comparator chain, toSorted() | 4 | 244.072 | 5.79× |
| inline comparator chain, slice().sort() | 4 | 274.632 | 6.52× |
| underscore.sortBy (different order) | 4 | 274.981 | 6.52× |
| just-sort-by (different order) | 3 | 373.185 | 8.86× |
| thenby (different order) | 3 | 377.093 | 8.95× |
| fast-sort | 2 | 400.040 | 9.49× |
| es-toolkit.orderBy | 2 | 413.221 | 9.81× |
| remeda.sortBy (different order) | 2 | 441.303 | 10.47× |
| lodash.orderBy | 2 | 663.457 | 15.74× |
| Array.prototype.sort, decorated | 1 | 676.337 | 16.05× |
| ramda.sortWith (different order) | 1 | 808.233 | 19.18× |
| sort-array | 1 | 844.818 | 20.05× |
| natural-orderby | 1 | 1213.017 | 28.78× |
| sort-on | 0 | 3663.427 | 86.93× |
| sort-by (different order) | 0 | 25920.190 | 615.05× |

#### 1,000,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24 | 42.545 | 1.00× |
| inline comparator chain, toSorted() | 3 | 349.240 | 8.21× |
| inline comparator chain, slice().sort() | 3 | 350.095 | 8.23× |
| underscore.sortBy | 3 | 372.515 | 8.76× |
| thenby | 2 | 521.687 | 12.26× |
| fast-sort | 2 | 539.109 | 12.67× |
| just-sort-by | 2 | 569.643 | 13.39× |
| es-toolkit.orderBy | 2 | 602.392 | 14.16× |
| remeda.sortBy | 2 | 616.497 | 14.49× |
| ramda.sortWith | 1 | 901.123 | 21.18× |
| lodash.orderBy | 1 | 908.188 | 21.35× |
| Array.prototype.sort, decorated | 1 | 925.313 | 21.75× |
| sort-array | 1 | 1078.514 | 25.35× |
| natural-orderby | 1 | 1612.451 | 37.90× |
| sort-on | 0 | 4405.413 | 103.55× |
| sort-by | 0 | 28313.432 | 665.49× |

#### 1,000,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 2 | 468.808 | 1.00× |
| inline comparator chain, toSorted() | 2 | 562.945 | 1.20× |
| inline comparator chain, slice().sort() | 2 | 594.233 | 1.27× |
| underscore.sortBy | 1 | 716.584 | 1.53× |
| thenby | 1 | 761.989 | 1.63× |
| es-toolkit.orderBy | 1 | 831.778 | 1.77× |
| fast-sort | 1 | 853.842 | 1.82× |
| remeda.sortBy | 1 | 878.137 | 1.87× |
| Array.prototype.sort, decorated | 1 | 1221.189 | 2.60× |
| ramda.sortWith | 1 | 1242.015 | 2.65× |
| just-sort-by | 1 | 1267.004 | 2.70× |
| lodash.orderBy | 1 | 1327.623 | 2.83× |
| sort-array | 1 | 1410.582 | 3.01× |
| natural-orderby | 0 | 2137.497 | 4.56× |
| sort-on | 0 | 5462.828 | 11.65× |
| sort-by | 0 | 29470.513 | 62.86× |

#### 1,000,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 157 | 6.378 | 0.89× |
| fast-multisort | 140 | 7.139 | 1.00× |
| inline comparator chain, slice().sort() | 105 | 9.517 | 1.33× |
| just-sort-by | 75 | 13.259 | 1.86× |
| thenby | 73 | 13.793 | 1.93× |
| fast-sort | 65 | 15.360 | 2.15× |
| es-toolkit.orderBy | 62 | 16.146 | 2.26× |
| remeda.sortBy | 52 | 19.056 | 2.67× |
| ramda.sortWith | 34 | 29.764 | 4.17× |
| Array.prototype.sort, decorated | 29 | 34.741 | 4.87× |
| sort-array | 29 | 34.816 | 4.88× |
| underscore.sortBy | 25 | 40.087 | 5.62× |
| lodash.orderBy | 19 | 53.165 | 7.45× |
| sort-on | 5 | 210.870 | 29.54× |
| natural-orderby | 3 | 386.069 | 54.08× |
| sort-by | 1 | 1500.761 | 210.22× |

#### 1,000,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 157 | 6.352 | 1.00× |
| inline comparator chain, toSorted() | 150 | 6.671 | 1.05× |
| inline comparator chain, slice().sort() | 98 | 10.185 | 1.60× |
| just-sort-by | 77 | 13.057 | 2.06× |
| thenby | 73 | 13.679 | 2.15× |
| fast-sort | 71 | 14.105 | 2.22× |
| es-toolkit.orderBy | 61 | 16.523 | 2.60× |
| remeda.sortBy | 47 | 21.167 | 3.33× |
| ramda.sortWith | 30 | 33.404 | 5.26× |
| sort-array | 30 | 33.801 | 5.32× |
| underscore.sortBy | 28 | 35.226 | 5.55× |
| Array.prototype.sort, decorated | 28 | 36.011 | 5.67× |
| lodash.orderBy | 16 | 61.283 | 9.65× |
| sort-on | 4 | 241.124 | 37.96× |
| natural-orderby | 3 | 395.044 | 62.19× |
| sort-by | 1 | 1541.947 | 242.75× |

#### 1,000,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 149 | 6.709 | 0.75× |
| fast-multisort | 111 | 8.971 | 1.00× |
| inline comparator chain, slice().sort() | 94 | 10.669 | 1.19× |
| just-sort-by | 74 | 13.488 | 1.50× |
| thenby | 72 | 13.982 | 1.56× |
| fast-sort | 63 | 15.786 | 1.76× |
| es-toolkit.orderBy | 60 | 16.601 | 1.85× |
| remeda.sortBy | 52 | 19.164 | 2.14× |
| ramda.sortWith | 33 | 30.108 | 3.36× |
| sort-array | 26 | 37.888 | 4.22× |
| underscore.sortBy | 23 | 43.817 | 4.88× |
| lodash.orderBy | 18 | 56.263 | 6.27× |
| Array.prototype.sort, decorated | 12 | 81.941 | 9.13× |
| sort-on | 5 | 201.180 | 22.43× |
| natural-orderby | 3 | 383.028 | 42.70× |
| sort-by | 1 | 1485.559 | 165.59× |

#### 1,000,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11 | 90.409 | 1.00× |
| inline comparator chain, toSorted() | 3 | 365.325 | 4.04× |
| inline comparator chain, slice().sort() | 3 | 366.682 | 4.06× |
| es-toolkit.orderBy | 1 | 782.540 | 8.66× |
| remeda.sortBy (different order) | 1 | 852.309 | 9.43× |
| lodash.orderBy | 1 | 875.056 | 9.68× |
| thenby (different order) | 1 | 891.107 | 9.86× |
| fast-sort (different order) | 1 | 1047.168 | 11.58× |
| Array.prototype.sort, decorated | 1 | 1112.355 | 12.30× |
| ramda.sortWith (different order) | 1 | 1343.803 | 14.86× |
| sort-array (different order) | 1 | 1531.652 | 16.94× |
| natural-orderby (different order) | 0 | 2783.224 | 30.78× |
| sort-on (different order) | 0 | 6372.013 | 70.48× |
| sort-by (different order) | 0 | 53010.010 | 586.34× |

Apple M5 Max, 18 cores, 128 GB, Darwin 27.2.0, Node v24.22.0
