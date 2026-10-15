
#### 1 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 253994999 | 0.000 | 0.51× |
| fast-multisort | 130410777 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 108124540 | 0.000 | 1.21× |
| es-toolkit.orderBy | 83606833 | 0.000 | 1.56× |
| sort-on | 70268413 | 0.000 | 1.86× |
| Array.prototype.sort, decorated | 61064977 | 0.000 | 2.14× |
| thenby | 40975939 | 0.000 | 3.18× |
| inline comparator chain, toSorted() | 35963867 | 0.000 | 3.63× |
| ramda.sortWith | 34621323 | 0.000 | 3.77× |
| remeda.sortBy | 29511304 | 0.000 | 4.42× |
| fast-sort | 28037010 | 0.000 | 4.65× |
| sort-array | 27532097 | 0.000 | 4.74× |
| sort-by | 27232115 | 0.000 | 4.79× |
| underscore.sortBy | 23702569 | 0.000 | 5.50× |
| lodash.orderBy | 23535386 | 0.000 | 5.54× |
| natural-orderby | 3467628 | 0.000 | 37.61× |

#### 1 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 219012511 | 0.000 | 0.56× |
| fast-multisort | 123184804 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 101016041 | 0.000 | 1.22× |
| es-toolkit.orderBy | 77176722 | 0.000 | 1.60× |
| sort-on | 70530040 | 0.000 | 1.75× |
| Array.prototype.sort, decorated | 60046657 | 0.000 | 2.05× |
| thenby | 39492033 | 0.000 | 3.12× |
| inline comparator chain, toSorted() | 35590442 | 0.000 | 3.46× |
| ramda.sortWith | 33765307 | 0.000 | 3.65× |
| remeda.sortBy | 29273921 | 0.000 | 4.21× |
| fast-sort | 28505823 | 0.000 | 4.32× |
| sort-array | 28132510 | 0.000 | 4.38× |
| sort-by | 27541981 | 0.000 | 4.47× |
| underscore.sortBy | 22206184 | 0.000 | 5.55× |
| lodash.orderBy | 18378954 | 0.000 | 6.70× |
| natural-orderby | 1646378 | 0.001 | 74.82× |

#### 1 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 219321957 | 0.000 | 0.55× |
| fast-multisort | 121647927 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 100265644 | 0.000 | 1.21× |
| es-toolkit.orderBy | 77037569 | 0.000 | 1.58× |
| sort-on | 69892642 | 0.000 | 1.74× |
| Array.prototype.sort, decorated | 59723743 | 0.000 | 2.04× |
| thenby | 39437263 | 0.000 | 3.08× |
| inline comparator chain, toSorted() | 35782183 | 0.000 | 3.40× |
| ramda.sortWith | 33671654 | 0.000 | 3.61× |
| remeda.sortBy | 29444629 | 0.000 | 4.13× |
| fast-sort | 28377409 | 0.000 | 4.29× |
| sort-array | 27835191 | 0.000 | 4.37× |
| sort-by | 27440953 | 0.000 | 4.43× |
| underscore.sortBy | 22278369 | 0.000 | 5.46× |
| lodash.orderBy | 18476404 | 0.000 | 6.58× |
| natural-orderby | 2836616 | 0.000 | 42.88× |

#### 1 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 200565843 | 0.000 | 0.56× |
| fast-multisort | 113058078 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 95025794 | 0.000 | 1.19× |
| es-toolkit.orderBy | 70193642 | 0.000 | 1.61× |
| sort-on | 64200741 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 53398823 | 0.000 | 2.12× |
| thenby | 35262303 | 0.000 | 3.21× |
| inline comparator chain, toSorted() | 34318031 | 0.000 | 3.29× |
| ramda.sortWith | 31465658 | 0.000 | 3.59× |
| fast-sort | 26898145 | 0.000 | 4.20× |
| remeda.sortBy | 26858730 | 0.000 | 4.21× |
| sort-array | 25181738 | 0.000 | 4.49× |
| sort-by | 23466454 | 0.000 | 4.82× |
| underscore.sortBy | 20205204 | 0.000 | 5.60× |
| lodash.orderBy | 17278002 | 0.000 | 6.54× |
| natural-orderby | 2226869 | 0.000 | 50.77× |

#### 1 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 217200938 | 0.000 | 0.56× |
| fast-multisort | 121167066 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 99022884 | 0.000 | 1.22× |
| es-toolkit.orderBy | 74232513 | 0.000 | 1.63× |
| sort-on | 67574405 | 0.000 | 1.79× |
| Array.prototype.sort, decorated | 57075131 | 0.000 | 2.12× |
| thenby | 37980819 | 0.000 | 3.19× |
| inline comparator chain, toSorted() | 34240148 | 0.000 | 3.54× |
| ramda.sortWith | 32911645 | 0.000 | 3.68× |
| remeda.sortBy | 28099276 | 0.000 | 4.31× |
| sort-array | 27354038 | 0.000 | 4.43× |
| sort-by | 26475682 | 0.000 | 4.58× |
| fast-sort | 26090578 | 0.000 | 4.64× |
| underscore.sortBy | 21552835 | 0.000 | 5.62× |
| lodash.orderBy | 17781641 | 0.000 | 6.81× |
| natural-orderby | 1713048 | 0.001 | 70.73× |

#### 1 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 162968659 | 0.000 | 0.65× |
| fast-multisort | 105605418 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 80857039 | 0.000 | 1.31× |
| es-toolkit.orderBy | 61338991 | 0.000 | 1.72× |
| sort-on | 54148407 | 0.000 | 1.95× |
| Array.prototype.sort, decorated | 48035731 | 0.000 | 2.20× |
| thenby | 31315655 | 0.000 | 3.37× |
| inline comparator chain, toSorted() | 29716313 | 0.000 | 3.55× |
| ramda.sortWith | 26195708 | 0.000 | 4.03× |
| fast-sort | 22170110 | 0.000 | 4.76× |
| remeda.sortBy | 22005850 | 0.000 | 4.80× |
| sort-array | 20551918 | 0.000 | 5.14× |
| sort-by | 19424609 | 0.000 | 5.44× |
| underscore.sortBy | 17340840 | 0.000 | 6.09× |
| lodash.orderBy | 14961703 | 0.000 | 7.06× |
| natural-orderby | 2383080 | 0.000 | 44.31× |

#### 1 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 174447389 | 0.000 | 0.55× |
| fast-multisort | 95298381 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 79716763 | 0.000 | 1.20× |
| es-toolkit.orderBy | 63224518 | 0.000 | 1.51× |
| sort-on | 57159655 | 0.000 | 1.67× |
| Array.prototype.sort, decorated | 48383347 | 0.000 | 1.97× |
| thenby | 32557142 | 0.000 | 2.93× |
| inline comparator chain, toSorted() | 28718275 | 0.000 | 3.32× |
| ramda.sortWith | 27083848 | 0.000 | 3.52× |
| remeda.sortBy | 22939666 | 0.000 | 4.15× |
| sort-by | 22146425 | 0.000 | 4.30× |
| fast-sort | 21498227 | 0.000 | 4.43× |
| sort-array | 21308189 | 0.000 | 4.47× |
| underscore.sortBy | 17575520 | 0.000 | 5.42× |
| lodash.orderBy | 14946330 | 0.000 | 6.38× |
| natural-orderby | 2741672 | 0.000 | 34.76× |

#### 1 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| just-sort-by | 176811037 | 0.000 | 0.54× |
| fast-multisort | 96096228 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 76648191 | 0.000 | 1.25× |
| es-toolkit.orderBy | 61879624 | 0.000 | 1.55× |
| sort-on | 54060179 | 0.000 | 1.78× |
| Array.prototype.sort, decorated | 48922105 | 0.000 | 1.96× |
| thenby | 30461051 | 0.000 | 3.15× |
| inline comparator chain, toSorted() | 28677173 | 0.000 | 3.35× |
| ramda.sortWith | 27289640 | 0.000 | 3.52× |
| fast-sort | 22651711 | 0.000 | 4.24× |
| remeda.sortBy | 21751981 | 0.000 | 4.42× |
| sort-by | 21403697 | 0.000 | 4.49× |
| sort-array | 21079659 | 0.000 | 4.56× |
| underscore.sortBy | 16453090 | 0.000 | 5.84× |
| lodash.orderBy | 13456422 | 0.000 | 7.14× |
| natural-orderby | 2114943 | 0.000 | 45.44× |

#### 1 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 96268081 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 81275640 | 0.000 | 1.18× |
| es-toolkit.orderBy | 61648757 | 0.000 | 1.56× |
| sort-on | 54630878 | 0.000 | 1.76× |
| Array.prototype.sort, decorated | 49163139 | 0.000 | 1.96× |
| inline comparator chain, toSorted() | 29530247 | 0.000 | 3.26× |
| sort-array | 21467490 | 0.000 | 4.48× |
| sort-by | 18938902 | 0.000 | 5.08× |
| ramda.sortWith | 16234277 | 0.000 | 5.93× |
| remeda.sortBy | 12545977 | 0.000 | 7.67× |
| lodash.orderBy | 11063418 | 0.000 | 8.70× |
| thenby | 9015821 | 0.000 | 10.68× |
| fast-sort | 3730397 | 0.000 | 25.81× |
| natural-orderby | 700764 | 0.001 | 137.38× |

#### 10 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 6313376 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 4165137 | 0.000 | 1.52× |
| inline comparator chain, slice().sort() | 4087792 | 0.000 | 1.54× |
| thenby | 3615247 | 0.000 | 1.75× |
| Array.prototype.sort, decorated | 3450050 | 0.000 | 1.83× |
| remeda.sortBy | 3263989 | 0.000 | 1.93× |
| es-toolkit.orderBy | 3243835 | 0.000 | 1.95× |
| fast-sort | 2732996 | 0.000 | 2.31× |
| sort-array | 2528704 | 0.000 | 2.50× |
| underscore.sortBy | 2508555 | 0.000 | 2.52× |
| lodash.orderBy | 1937435 | 0.001 | 3.26× |
| ramda.sortWith | 1490961 | 0.001 | 4.23× |
| just-sort-by (different order) | 1014114 | 0.001 | 6.23× |
| natural-orderby (different order) | 272049 | 0.004 | 23.21× |
| sort-on (different order) | 199500 | 0.005 | 31.65× |
| sort-by | 24613 | 0.041 | 256.51× |

#### 10 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4493833 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 3493204 | 0.000 | 1.29× |
| inline comparator chain, slice().sort() | 3374723 | 0.000 | 1.33× |
| thenby | 2326660 | 0.000 | 1.93× |
| remeda.sortBy | 2256193 | 0.000 | 1.99× |
| es-toolkit.orderBy | 2206736 | 0.000 | 2.04× |
| underscore.sortBy | 2046143 | 0.000 | 2.20× |
| fast-sort | 1989275 | 0.001 | 2.26× |
| Array.prototype.sort, decorated | 1781136 | 0.001 | 2.52× |
| lodash.orderBy | 1653982 | 0.001 | 2.72× |
| ramda.sortWith | 1236099 | 0.001 | 3.64× |
| sort-array | 1098267 | 0.001 | 4.09× |
| just-sort-by | 806369 | 0.001 | 5.57× |
| sort-on | 166615 | 0.006 | 26.97× |
| natural-orderby | 112647 | 0.009 | 39.89× |
| sort-by | 24703 | 0.040 | 181.92× |

#### 10 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 5638961 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 5173852 | 0.000 | 1.09× |
| inline comparator chain, slice().sort() | 4851374 | 0.000 | 1.16× |
| just-sort-by (different order) | 3050583 | 0.000 | 1.85× |
| thenby (different order) | 2689829 | 0.000 | 2.10× |
| remeda.sortBy (different order) | 2560700 | 0.000 | 2.20× |
| es-toolkit.orderBy | 2482906 | 0.000 | 2.27× |
| underscore.sortBy (different order) | 2235557 | 0.000 | 2.52× |
| fast-sort | 2176194 | 0.000 | 2.59× |
| Array.prototype.sort, decorated | 2102726 | 0.000 | 2.68× |
| lodash.orderBy | 1662431 | 0.001 | 3.39× |
| ramda.sortWith (different order) | 1360595 | 0.001 | 4.14× |
| sort-array | 1125814 | 0.001 | 5.01× |
| natural-orderby | 236778 | 0.004 | 23.82× |
| sort-on | 211343 | 0.005 | 26.68× |
| sort-by (different order) | 26462 | 0.038 | 213.10× |

#### 10 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4148390 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 3501159 | 0.000 | 1.18× |
| inline comparator chain, slice().sort() | 3429760 | 0.000 | 1.21× |
| just-sort-by | 2022427 | 0.000 | 2.05× |
| remeda.sortBy | 1830881 | 0.001 | 2.27× |
| underscore.sortBy | 1802718 | 0.001 | 2.30× |
| thenby | 1788661 | 0.001 | 2.32× |
| es-toolkit.orderBy | 1667970 | 0.001 | 2.49× |
| fast-sort | 1529065 | 0.001 | 2.71× |
| Array.prototype.sort, decorated | 1444577 | 0.001 | 2.87× |
| lodash.orderBy | 1154830 | 0.001 | 3.59× |
| ramda.sortWith | 877926 | 0.001 | 4.73× |
| sort-array | 756602 | 0.001 | 5.48× |
| natural-orderby | 191444 | 0.005 | 21.67× |
| sort-on | 126833 | 0.008 | 32.71× |
| sort-by | 18876 | 0.053 | 219.77× |

#### 10 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3477072 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 3259754 | 0.000 | 1.07× |
| inline comparator chain, slice().sort() | 3057959 | 0.000 | 1.14× |
| remeda.sortBy | 1895675 | 0.001 | 1.83× |
| thenby | 1717114 | 0.001 | 2.02× |
| es-toolkit.orderBy | 1556974 | 0.001 | 2.23× |
| fast-sort | 1545949 | 0.001 | 2.25× |
| Array.prototype.sort, decorated | 1515534 | 0.001 | 2.29× |
| underscore.sortBy | 1498694 | 0.001 | 2.32× |
| lodash.orderBy | 1213241 | 0.001 | 2.87× |
| just-sort-by | 1143735 | 0.001 | 3.04× |
| ramda.sortWith | 969663 | 0.001 | 3.59× |
| sort-array | 835481 | 0.001 | 4.16× |
| sort-on | 131343 | 0.008 | 26.47× |
| natural-orderby | 127272 | 0.008 | 27.32× |
| sort-by | 20941 | 0.048 | 166.04× |

#### 10 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 9822236 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 7669122 | 0.000 | 1.28× |
| inline comparator chain, slice().sort() | 6068171 | 0.000 | 1.62× |
| just-sort-by | 4782588 | 0.000 | 2.05× |
| thenby | 3406798 | 0.000 | 2.88× |
| Array.prototype.sort, decorated | 3402796 | 0.000 | 2.89× |
| es-toolkit.orderBy | 2742448 | 0.000 | 3.58× |
| remeda.sortBy | 2505191 | 0.000 | 3.92× |
| fast-sort | 2378482 | 0.000 | 4.13× |
| lodash.orderBy | 2205931 | 0.000 | 4.45× |
| ramda.sortWith | 2190444 | 0.000 | 4.48× |
| underscore.sortBy | 1493212 | 0.001 | 6.58× |
| sort-array | 1161889 | 0.001 | 8.45× |
| sort-on | 375070 | 0.003 | 26.19× |
| natural-orderby | 162303 | 0.006 | 60.52× |
| sort-by | 50057 | 0.020 | 196.22× |

#### 10 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11416385 | 0.000 | 1.00× |
| inline comparator chain, toSorted() | 9755496 | 0.000 | 1.17× |
| inline comparator chain, slice().sort() | 8383869 | 0.000 | 1.36× |
| just-sort-by | 5475259 | 0.000 | 2.09× |
| thenby | 4723954 | 0.000 | 2.42× |
| es-toolkit.orderBy | 4553153 | 0.000 | 2.51× |
| remeda.sortBy | 4255901 | 0.000 | 2.68× |
| Array.prototype.sort, decorated | 4183627 | 0.000 | 2.73× |
| fast-sort | 3472397 | 0.000 | 3.29× |
| underscore.sortBy | 3166717 | 0.000 | 3.61× |
| ramda.sortWith | 2849784 | 0.000 | 4.01× |
| sort-array | 2768298 | 0.000 | 4.12× |
| lodash.orderBy | 2513618 | 0.000 | 4.54× |
| sort-on | 395760 | 0.003 | 28.85× |
| natural-orderby | 329268 | 0.003 | 34.67× |
| sort-by | 58447 | 0.017 | 195.33× |

#### 10 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 6485435 | 0.000 | 0.98× |
| fast-multisort | 6330197 | 0.000 | 1.00× |
| inline comparator chain, slice().sort() | 5972580 | 0.000 | 1.06× |
| just-sort-by | 3105352 | 0.000 | 2.04× |
| thenby | 2821751 | 0.000 | 2.24× |
| underscore.sortBy | 2800061 | 0.000 | 2.26× |
| remeda.sortBy | 2774808 | 0.000 | 2.28× |
| es-toolkit.orderBy | 2623176 | 0.000 | 2.41× |
| Array.prototype.sort, decorated | 2344259 | 0.000 | 2.70× |
| fast-sort | 2133967 | 0.000 | 2.97× |
| lodash.orderBy | 2002432 | 0.000 | 3.16× |
| ramda.sortWith | 1487373 | 0.001 | 4.26× |
| sort-array | 1317404 | 0.001 | 4.81× |
| natural-orderby | 319976 | 0.003 | 19.78× |
| sort-on | 224711 | 0.004 | 28.17× |
| sort-by | 28673 | 0.035 | 220.77× |

#### 10 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 3883068 | 0.000 | 0.45× |
| inline comparator chain, slice().sort() | 3537316 | 0.000 | 0.50× |
| es-toolkit.orderBy | 1961840 | 0.001 | 0.90× |
| fast-multisort | 1756830 | 0.001 | 1.00× |
| remeda.sortBy (different order) | 1576315 | 0.001 | 1.11× |
| Array.prototype.sort, decorated | 1509991 | 0.001 | 1.16× |
| thenby (different order) | 1387402 | 0.001 | 1.27× |
| lodash.orderBy | 1295869 | 0.001 | 1.36× |
| fast-sort (different order) | 963127 | 0.001 | 1.82× |
| ramda.sortWith (different order) | 919399 | 0.001 | 1.91× |
| sort-array (different order) | 720308 | 0.001 | 2.44× |
| sort-on (different order) | 146016 | 0.007 | 12.03× |
| natural-orderby (different order) | 62121 | 0.016 | 28.28× |
| sort-by (different order) | 19253 | 0.052 | 91.25× |

#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 381156 | 0.003 | 1.00× |
| inline comparator chain, slice().sort() | 225222 | 0.004 | 1.69× |
| inline comparator chain, toSorted() | 217072 | 0.005 | 1.76× |
| underscore.sortBy | 121228 | 0.008 | 3.14× |
| thenby | 104189 | 0.010 | 3.66× |
| fast-sort | 95938 | 0.010 | 3.97× |
| es-toolkit.orderBy | 88400 | 0.011 | 4.31× |
| lodash.orderBy | 85217 | 0.012 | 4.47× |
| Array.prototype.sort, decorated | 83156 | 0.012 | 4.58× |
| remeda.sortBy | 75320 | 0.013 | 5.06× |
| ramda.sortWith | 51750 | 0.019 | 7.37× |
| sort-array | 42762 | 0.023 | 8.91× |
| just-sort-by (different order) | 34084 | 0.029 | 11.18× |
| natural-orderby (different order) | 19810 | 0.050 | 19.24× |
| sort-on (different order) | 7492 | 0.133 | 50.87× |
| sort-by | 979 | 1.022 | 389.40× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 173905 | 0.006 | 1.00× |
| inline comparator chain, slice().sort() | 157262 | 0.006 | 1.11× |
| inline comparator chain, toSorted() | 153436 | 0.007 | 1.13× |
| thenby | 93569 | 0.011 | 1.86× |
| underscore.sortBy | 87629 | 0.011 | 1.98× |
| es-toolkit.orderBy | 79603 | 0.013 | 2.18× |
| fast-sort | 76833 | 0.013 | 2.26× |
| remeda.sortBy | 70794 | 0.014 | 2.46× |
| lodash.orderBy | 67773 | 0.015 | 2.57× |
| Array.prototype.sort, decorated | 64633 | 0.015 | 2.69× |
| ramda.sortWith | 42151 | 0.024 | 4.13× |
| sort-array | 34695 | 0.029 | 5.01× |
| just-sort-by (different order) | 32262 | 0.031 | 5.39× |
| natural-orderby (different order) | 8462 | 0.118 | 20.55× |
| sort-on (different order) | 7283 | 0.137 | 23.88× |
| sort-by | 1037 | 0.964 | 167.65× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 270618 | 0.004 | 0.90× |
| inline comparator chain, slice().sort() | 254542 | 0.004 | 0.96× |
| fast-multisort | 244205 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 163462 | 0.006 | 1.49× |
| just-sort-by (different order) | 143935 | 0.007 | 1.70× |
| thenby (different order) | 132036 | 0.008 | 1.85× |
| fast-sort | 121138 | 0.008 | 2.02× |
| es-toolkit.orderBy | 117591 | 0.009 | 2.08× |
| lodash.orderBy | 104358 | 0.010 | 2.34× |
| remeda.sortBy (different order) | 101161 | 0.010 | 2.41× |
| Array.prototype.sort, decorated | 96424 | 0.010 | 2.53× |
| ramda.sortWith (different order) | 56358 | 0.018 | 4.33× |
| sort-array | 50030 | 0.020 | 4.88× |
| natural-orderby | 26606 | 0.038 | 9.18× |
| sort-on | 9573 | 0.104 | 25.51× |
| sort-by (different order) | 1170 | 0.854 | 208.67× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 258223 | 0.004 | 0.78× |
| inline comparator chain, slice().sort() | 239941 | 0.004 | 0.84× |
| fast-multisort | 200423 | 0.005 | 1.00× |
| underscore.sortBy | 147790 | 0.007 | 1.36× |
| just-sort-by | 112678 | 0.009 | 1.78× |
| thenby | 112651 | 0.009 | 1.78× |
| fast-sort | 100762 | 0.010 | 1.99× |
| es-toolkit.orderBy | 99533 | 0.010 | 2.01× |
| remeda.sortBy | 93757 | 0.011 | 2.14× |
| lodash.orderBy | 91718 | 0.011 | 2.19× |
| Array.prototype.sort, decorated | 86303 | 0.012 | 2.32× |
| ramda.sortWith | 53235 | 0.019 | 3.76× |
| sort-array | 45086 | 0.022 | 4.45× |
| natural-orderby | 22587 | 0.044 | 8.87× |
| sort-on | 8432 | 0.119 | 23.77× |
| sort-by | 1115 | 0.897 | 179.73× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 169280 | 0.006 | 0.70× |
| inline comparator chain, slice().sort() | 166510 | 0.006 | 0.71× |
| fast-multisort | 117674 | 0.008 | 1.00× |
| thenby | 87035 | 0.011 | 1.35× |
| underscore.sortBy | 82456 | 0.012 | 1.43× |
| fast-sort | 79887 | 0.013 | 1.47× |
| es-toolkit.orderBy | 76555 | 0.013 | 1.54× |
| remeda.sortBy | 70003 | 0.014 | 1.68× |
| Array.prototype.sort, decorated | 64336 | 0.016 | 1.83× |
| lodash.orderBy | 63354 | 0.016 | 1.86× |
| just-sort-by | 44370 | 0.023 | 2.65× |
| ramda.sortWith | 40790 | 0.025 | 2.88× |
| sort-array | 34980 | 0.029 | 3.36× |
| natural-orderby | 13076 | 0.076 | 9.00× |
| sort-on | 5970 | 0.168 | 19.71× |
| sort-by | 898 | 1.114 | 131.08× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1671002 | 0.001 | 0.99× |
| fast-multisort | 1662643 | 0.001 | 1.00× |
| inline comparator chain, slice().sort() | 1381428 | 0.001 | 1.20× |
| just-sort-by | 808439 | 0.001 | 2.06× |
| thenby | 732392 | 0.001 | 2.27× |
| fast-sort | 629752 | 0.002 | 2.64× |
| remeda.sortBy | 615173 | 0.002 | 2.70× |
| es-toolkit.orderBy | 613412 | 0.002 | 2.71× |
| Array.prototype.sort, decorated | 517950 | 0.002 | 3.21× |
| underscore.sortBy | 445857 | 0.002 | 3.73× |
| lodash.orderBy | 358712 | 0.003 | 4.64× |
| ramda.sortWith | 317808 | 0.003 | 5.23× |
| sort-array | 289029 | 0.003 | 5.75× |
| sort-on | 45804 | 0.022 | 36.30× |
| natural-orderby | 33314 | 0.030 | 49.91× |
| sort-by | 5895 | 0.170 | 282.05× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1540590 | 0.001 | 1.00× |
| inline comparator chain, toSorted() | 1450297 | 0.001 | 1.06× |
| inline comparator chain, slice().sort() | 1245736 | 0.001 | 1.24× |
| just-sort-by | 708568 | 0.001 | 2.17× |
| thenby | 678180 | 0.001 | 2.27× |
| fast-sort | 600795 | 0.002 | 2.56× |
| es-toolkit.orderBy | 573858 | 0.002 | 2.68× |
| Array.prototype.sort, decorated | 511030 | 0.002 | 3.01× |
| remeda.sortBy | 481281 | 0.002 | 3.20× |
| underscore.sortBy | 402347 | 0.002 | 3.83× |
| ramda.sortWith | 305857 | 0.003 | 5.04× |
| lodash.orderBy | 300487 | 0.003 | 5.13× |
| sort-array | 281751 | 0.004 | 5.47× |
| sort-on | 38825 | 0.026 | 39.68× |
| natural-orderby | 31156 | 0.032 | 49.45× |
| sort-by | 5282 | 0.189 | 291.66× |

#### 100 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1044426 | 0.001 | 0.82× |
| inline comparator chain, slice().sort() | 926921 | 0.001 | 0.92× |
| fast-multisort | 853919 | 0.001 | 1.00× |
| just-sort-by | 470357 | 0.002 | 1.82× |
| thenby | 426377 | 0.002 | 2.00× |
| underscore.sortBy | 380890 | 0.003 | 2.24× |
| remeda.sortBy | 376041 | 0.003 | 2.27× |
| fast-sort | 366592 | 0.003 | 2.33× |
| es-toolkit.orderBy | 363061 | 0.003 | 2.35× |
| Array.prototype.sort, decorated | 319963 | 0.003 | 2.67× |
| lodash.orderBy | 276628 | 0.004 | 3.09× |
| ramda.sortWith | 188371 | 0.005 | 4.53× |
| sort-array | 165924 | 0.006 | 5.15× |
| natural-orderby | 32341 | 0.031 | 26.40× |
| sort-on | 28063 | 0.036 | 30.43× |
| sort-by | 3561 | 0.281 | 239.77× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 212275 | 0.005 | 0.71× |
| inline comparator chain, slice().sort() | 208813 | 0.005 | 0.72× |
| fast-multisort | 149958 | 0.007 | 1.00× |
| lodash.orderBy | 82621 | 0.012 | 1.82× |
| es-toolkit.orderBy | 76747 | 0.013 | 1.95× |
| Array.prototype.sort, decorated | 68825 | 0.015 | 2.18× |
| remeda.sortBy (different order) | 65104 | 0.015 | 2.30× |
| thenby (different order) | 64337 | 0.016 | 2.33× |
| fast-sort (different order) | 53985 | 0.019 | 2.78× |
| ramda.sortWith (different order) | 39896 | 0.025 | 3.76× |
| sort-array (different order) | 32927 | 0.030 | 4.55× |
| natural-orderby (different order) | 7884 | 0.127 | 19.02× |
| sort-on (different order) | 6838 | 0.146 | 21.93× |
| sort-by (different order) | 795 | 1.258 | 188.63× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 46010 | 0.022 | 1.00× |
| inline comparator chain, toSorted() | 17141 | 0.058 | 2.68× |
| inline comparator chain, slice().sort() | 16983 | 0.059 | 2.71× |
| underscore.sortBy | 10064 | 0.099 | 4.57× |
| thenby | 8546 | 0.117 | 5.38× |
| fast-sort | 7652 | 0.131 | 6.01× |
| es-toolkit.orderBy | 7469 | 0.134 | 6.16× |
| lodash.orderBy | 7458 | 0.134 | 6.17× |
| Array.prototype.sort, decorated | 6757 | 0.148 | 6.81× |
| remeda.sortBy | 6273 | 0.159 | 7.33× |
| ramda.sortWith | 4135 | 0.242 | 11.13× |
| sort-array | 3670 | 0.273 | 12.54× |
| just-sort-by (different order) | 2998 | 0.334 | 15.35× |
| natural-orderby (different order) | 2159 | 0.463 | 21.31× |
| sort-on (different order) | 729 | 1.372 | 63.12× |
| sort-by | 94 | 10.688 | 491.75× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11346 | 0.088 | 1.00× |
| inline comparator chain, toSorted() | 8074 | 0.124 | 1.41× |
| inline comparator chain, slice().sort() | 7881 | 0.127 | 1.44× |
| underscore.sortBy | 5343 | 0.187 | 2.12× |
| thenby | 5236 | 0.191 | 2.17× |
| fast-sort | 4821 | 0.207 | 2.35× |
| es-toolkit.orderBy | 4766 | 0.210 | 2.38× |
| remeda.sortBy | 4371 | 0.229 | 2.60× |
| lodash.orderBy | 4136 | 0.242 | 2.74× |
| Array.prototype.sort, decorated | 4128 | 0.242 | 2.75× |
| ramda.sortWith | 2849 | 0.351 | 3.98× |
| sort-array | 2343 | 0.427 | 4.84× |
| just-sort-by (different order) | 2175 | 0.460 | 5.22× |
| natural-orderby (different order) | 718 | 1.394 | 15.81× |
| sort-on (different order) | 473 | 2.114 | 23.99× |
| sort-by | 70 | 14.354 | 162.86× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 32253 | 0.031 | 1.00× |
| inline comparator chain, slice().sort() | 15045 | 0.066 | 2.14× |
| inline comparator chain, toSorted() | 14918 | 0.067 | 2.16× |
| underscore.sortBy (different order) | 9931 | 0.101 | 3.25× |
| just-sort-by (different order) | 8044 | 0.124 | 4.01× |
| thenby (different order) | 7781 | 0.129 | 4.14× |
| fast-sort | 7567 | 0.132 | 4.26× |
| es-toolkit.orderBy | 7068 | 0.141 | 4.56× |
| lodash.orderBy | 6686 | 0.150 | 4.82× |
| remeda.sortBy (different order) | 6308 | 0.159 | 5.11× |
| Array.prototype.sort, decorated | 6288 | 0.159 | 5.13× |
| ramda.sortWith (different order) | 3604 | 0.277 | 8.95× |
| sort-array | 3243 | 0.308 | 9.95× |
| natural-orderby | 2231 | 0.448 | 14.46× |
| sort-on | 614 | 1.629 | 52.54× |
| sort-by (different order) | 73 | 13.641 | 439.97× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 29523 | 0.034 | 1.00× |
| inline comparator chain, toSorted() | 11995 | 0.083 | 2.46× |
| inline comparator chain, slice().sort() | 11471 | 0.087 | 2.57× |
| underscore.sortBy | 8678 | 0.115 | 3.40× |
| thenby | 6572 | 0.152 | 4.49× |
| just-sort-by | 6455 | 0.155 | 4.57× |
| fast-sort | 6135 | 0.163 | 4.81× |
| es-toolkit.orderBy | 5846 | 0.171 | 5.05× |
| remeda.sortBy | 5762 | 0.174 | 5.12× |
| lodash.orderBy | 5744 | 0.174 | 5.14× |
| Array.prototype.sort, decorated | 5368 | 0.186 | 5.50× |
| ramda.sortWith | 3286 | 0.304 | 8.98× |
| sort-array | 2907 | 0.344 | 10.16× |
| natural-orderby | 1855 | 0.539 | 15.92× |
| sort-on | 530 | 1.888 | 55.73× |
| sort-by | 70 | 14.354 | 423.76× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10667 | 0.094 | 1.00× |
| inline comparator chain, toSorted() | 8784 | 0.114 | 1.21× |
| inline comparator chain, slice().sort() | 8392 | 0.119 | 1.27× |
| underscore.sortBy | 5126 | 0.195 | 2.08× |
| thenby | 4862 | 0.206 | 2.19× |
| es-toolkit.orderBy | 4751 | 0.210 | 2.25× |
| fast-sort | 4608 | 0.217 | 2.31× |
| remeda.sortBy | 4413 | 0.227 | 2.42× |
| lodash.orderBy | 4183 | 0.239 | 2.55× |
| Array.prototype.sort, decorated | 4029 | 0.248 | 2.65× |
| just-sort-by | 3166 | 0.316 | 3.37× |
| ramda.sortWith | 2667 | 0.375 | 4.00× |
| sort-array | 2349 | 0.426 | 4.54× |
| natural-orderby | 1219 | 0.820 | 8.75× |
| sort-on | 406 | 2.465 | 26.29× |
| sort-by | 64 | 15.656 | 167.00× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 146482 | 0.007 | 1.00× |
| fast-multisort | 146425 | 0.007 | 1.00× |
| inline comparator chain, slice().sort() | 119271 | 0.008 | 1.23× |
| just-sort-by | 68882 | 0.015 | 2.13× |
| thenby | 60081 | 0.017 | 2.44× |
| fast-sort | 57250 | 0.017 | 2.56× |
| remeda.sortBy | 52973 | 0.019 | 2.76× |
| es-toolkit.orderBy | 52497 | 0.019 | 2.79× |
| Array.prototype.sort, decorated | 43724 | 0.023 | 3.35× |
| underscore.sortBy | 39110 | 0.026 | 3.74× |
| lodash.orderBy | 32617 | 0.031 | 4.49× |
| ramda.sortWith | 28151 | 0.036 | 5.20× |
| sort-array | 23978 | 0.042 | 6.11× |
| sort-on | 3631 | 0.275 | 40.33× |
| natural-orderby | 2536 | 0.394 | 57.75× |
| sort-by | 492 | 2.033 | 297.74× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 170728 | 0.006 | 1.00× |
| inline comparator chain, toSorted() | 166195 | 0.006 | 1.03× |
| inline comparator chain, slice().sort() | 139164 | 0.007 | 1.23× |
| just-sort-by | 82086 | 0.012 | 2.08× |
| thenby | 74706 | 0.013 | 2.29× |
| fast-sort | 70599 | 0.014 | 2.42× |
| es-toolkit.orderBy | 63659 | 0.016 | 2.68× |
| Array.prototype.sort, decorated | 52952 | 0.019 | 3.22× |
| remeda.sortBy | 51918 | 0.019 | 3.29× |
| underscore.sortBy | 43256 | 0.023 | 3.95× |
| lodash.orderBy | 34146 | 0.029 | 5.00× |
| ramda.sortWith | 32121 | 0.031 | 5.32× |
| sort-array | 30655 | 0.033 | 5.57× |
| sort-on | 4096 | 0.244 | 41.69× |
| natural-orderby | 3245 | 0.308 | 52.61× |
| sort-by | 583 | 1.715 | 292.72× |

#### 1,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 150383 | 0.007 | 0.77× |
| inline comparator chain, slice().sort() | 127160 | 0.008 | 0.91× |
| fast-multisort | 115088 | 0.009 | 1.00× |
| just-sort-by | 75062 | 0.013 | 1.53× |
| thenby | 69433 | 0.014 | 1.66× |
| fast-sort | 63939 | 0.016 | 1.80× |
| es-toolkit.orderBy | 58354 | 0.017 | 1.97× |
| remeda.sortBy | 58040 | 0.017 | 1.98× |
| Array.prototype.sort, decorated | 47802 | 0.021 | 2.41× |
| underscore.sortBy | 44404 | 0.023 | 2.59× |
| lodash.orderBy | 35494 | 0.028 | 3.24× |
| ramda.sortWith | 30952 | 0.032 | 3.72× |
| sort-array | 27142 | 0.037 | 4.24× |
| sort-on | 4650 | 0.215 | 24.75× |
| natural-orderby | 3198 | 0.313 | 35.98× |
| sort-by | 589 | 1.699 | 195.48× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11589 | 0.086 | 1.00× |
| inline comparator chain, slice().sort() | 11019 | 0.091 | 1.05× |
| inline comparator chain, toSorted() | 10917 | 0.092 | 1.06× |
| lodash.orderBy | 4931 | 0.203 | 2.35× |
| es-toolkit.orderBy | 4079 | 0.245 | 2.84× |
| Array.prototype.sort, decorated | 3820 | 0.262 | 3.03× |
| thenby (different order) | 3584 | 0.279 | 3.23× |
| remeda.sortBy (different order) | 3579 | 0.279 | 3.24× |
| fast-sort (different order) | 2991 | 0.334 | 3.87× |
| ramda.sortWith (different order) | 2289 | 0.437 | 5.06× |
| sort-array (different order) | 1815 | 0.551 | 6.38× |
| natural-orderby (different order) | 647 | 1.547 | 17.92× |
| sort-on (different order) | 370 | 2.702 | 31.31× |
| sort-by (different order) | 41 | 24.295 | 281.55× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 4232 | 0.236 | 1.00× |
| inline comparator chain, toSorted() | 1194 | 0.838 | 3.54× |
| inline comparator chain, slice().sort() | 1168 | 0.856 | 3.62× |
| underscore.sortBy | 810 | 1.234 | 5.22× |
| thenby | 737 | 1.356 | 5.74× |
| fast-sort | 692 | 1.444 | 6.11× |
| es-toolkit.orderBy | 667 | 1.499 | 6.35× |
| lodash.orderBy | 615 | 1.626 | 6.88× |
| Array.prototype.sort, decorated | 604 | 1.656 | 7.01× |
| remeda.sortBy | 569 | 1.757 | 7.43× |
| ramda.sortWith | 385 | 2.595 | 10.98× |
| sort-array | 338 | 2.954 | 12.50× |
| just-sort-by (different order) | 279 | 3.586 | 15.18× |
| natural-orderby (different order) | 197 | 5.064 | 21.43× |
| sort-on (different order) | 67 | 14.839 | 62.80× |
| sort-by | 9 | 113.516 | 480.40× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 742 | 1.348 | 1.00× |
| inline comparator chain, slice().sort() | 411 | 2.434 | 1.81× |
| inline comparator chain, toSorted() | 408 | 2.452 | 1.82× |
| underscore.sortBy | 320 | 3.124 | 2.32× |
| thenby | 318 | 3.143 | 2.33× |
| fast-sort | 303 | 3.304 | 2.45× |
| es-toolkit.orderBy | 295 | 3.390 | 2.51× |
| remeda.sortBy | 271 | 3.692 | 2.74× |
| Array.prototype.sort, decorated | 260 | 3.845 | 2.85× |
| lodash.orderBy | 241 | 4.154 | 3.08× |
| ramda.sortWith | 189 | 5.285 | 3.92× |
| sort-array | 159 | 6.275 | 4.66× |
| just-sort-by (different order) | 151 | 6.614 | 4.91× |
| natural-orderby (different order) | 50 | 20.006 | 14.84× |
| sort-on (different order) | 32 | 31.173 | 23.13× |
| sort-by | 5 | 205.578 | 152.51× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3551 | 0.282 | 1.00× |
| inline comparator chain, toSorted() | 910 | 1.099 | 3.90× |
| inline comparator chain, slice().sort() | 900 | 1.111 | 3.94× |
| underscore.sortBy (different order) | 691 | 1.447 | 5.14× |
| thenby (different order) | 565 | 1.770 | 6.29× |
| just-sort-by (different order) | 560 | 1.785 | 6.34× |
| fast-sort | 542 | 1.846 | 6.56× |
| es-toolkit.orderBy | 503 | 1.990 | 7.06× |
| remeda.sortBy (different order) | 470 | 2.128 | 7.56× |
| lodash.orderBy | 459 | 2.177 | 7.73× |
| Array.prototype.sort, decorated | 444 | 2.253 | 8.00× |
| ramda.sortWith (different order) | 267 | 3.748 | 13.31× |
| sort-array | 237 | 4.217 | 14.97× |
| natural-orderby | 161 | 6.219 | 22.08× |
| sort-on | 44 | 22.704 | 80.61× |
| sort-by (different order) | 5 | 185.730 | 659.44× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3272 | 0.306 | 1.00× |
| inline comparator chain, toSorted() | 659 | 1.516 | 4.96× |
| inline comparator chain, slice().sort() | 648 | 1.544 | 5.05× |
| underscore.sortBy | 596 | 1.678 | 5.49× |
| thenby | 449 | 2.229 | 7.29× |
| just-sort-by | 441 | 2.270 | 7.43× |
| fast-sort | 428 | 2.336 | 7.64× |
| es-toolkit.orderBy | 401 | 2.492 | 8.16× |
| remeda.sortBy | 401 | 2.494 | 8.16× |
| lodash.orderBy | 383 | 2.609 | 8.54× |
| Array.prototype.sort, decorated | 361 | 2.774 | 9.08× |
| ramda.sortWith | 232 | 4.313 | 14.11× |
| sort-array | 204 | 4.896 | 16.02× |
| natural-orderby | 136 | 7.332 | 23.99× |
| sort-on | 37 | 27.332 | 89.44× |
| sort-by | 5 | 200.251 | 655.29× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 744 | 1.343 | 1.00× |
| inline comparator chain, toSorted() | 484 | 2.067 | 1.54× |
| inline comparator chain, slice().sort() | 476 | 2.099 | 1.56× |
| underscore.sortBy | 375 | 2.664 | 1.98× |
| thenby | 365 | 2.737 | 2.04× |
| fast-sort | 341 | 2.936 | 2.19× |
| es-toolkit.orderBy | 332 | 3.016 | 2.25× |
| Array.prototype.sort, decorated | 306 | 3.263 | 2.43× |
| remeda.sortBy | 305 | 3.274 | 2.44× |
| lodash.orderBy | 287 | 3.490 | 2.60× |
| just-sort-by | 246 | 4.070 | 3.03× |
| ramda.sortWith | 202 | 4.949 | 3.68× |
| sort-array | 185 | 5.417 | 4.03× |
| natural-orderby | 108 | 9.302 | 6.92× |
| sort-on | 32 | 31.497 | 23.45× |
| sort-by | 5 | 205.465 | 152.96× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 18853 | 0.053 | 0.93× |
| fast-multisort | 17486 | 0.057 | 1.00× |
| inline comparator chain, slice().sort() | 14948 | 0.067 | 1.17× |
| just-sort-by | 8725 | 0.115 | 2.00× |
| thenby | 7597 | 0.132 | 2.30× |
| fast-sort | 7209 | 0.139 | 2.43× |
| remeda.sortBy | 6635 | 0.151 | 2.64× |
| es-toolkit.orderBy | 6448 | 0.155 | 2.71× |
| Array.prototype.sort, decorated | 5391 | 0.186 | 3.24× |
| underscore.sortBy | 4766 | 0.210 | 3.67× |
| lodash.orderBy | 3646 | 0.274 | 4.80× |
| ramda.sortWith | 3311 | 0.302 | 5.28× |
| sort-array | 2993 | 0.334 | 5.84× |
| sort-on | 469 | 2.130 | 37.25× |
| natural-orderby | 307 | 3.253 | 56.89× |
| sort-by | 60 | 16.554 | 289.47× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 17981 | 0.056 | 1.00× |
| inline comparator chain, toSorted() | 17832 | 0.056 | 1.01× |
| inline comparator chain, slice().sort() | 14351 | 0.070 | 1.25× |
| just-sort-by | 8556 | 0.117 | 2.10× |
| thenby | 7691 | 0.130 | 2.34× |
| fast-sort | 7369 | 0.136 | 2.44× |
| es-toolkit.orderBy | 6541 | 0.153 | 2.75× |
| remeda.sortBy | 5527 | 0.181 | 3.25× |
| Array.prototype.sort, decorated | 5463 | 0.183 | 3.29× |
| underscore.sortBy | 4573 | 0.219 | 3.93× |
| lodash.orderBy | 3453 | 0.290 | 5.21× |
| ramda.sortWith | 3290 | 0.304 | 5.47× |
| sort-array | 3167 | 0.316 | 5.68× |
| sort-on | 426 | 2.347 | 42.20× |
| natural-orderby | 315 | 3.175 | 57.09× |
| sort-by | 60 | 16.681 | 299.94× |

#### 10,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 16659 | 0.060 | 0.75× |
| inline comparator chain, slice().sort() | 13479 | 0.074 | 0.93× |
| fast-multisort | 12476 | 0.080 | 1.00× |
| just-sort-by | 8046 | 0.124 | 1.55× |
| thenby | 7256 | 0.138 | 1.72× |
| fast-sort | 6693 | 0.149 | 1.86× |
| remeda.sortBy | 6271 | 0.159 | 1.99× |
| es-toolkit.orderBy | 6187 | 0.162 | 2.02× |
| Array.prototype.sort, decorated | 5015 | 0.199 | 2.49× |
| underscore.sortBy | 4602 | 0.217 | 2.71× |
| lodash.orderBy | 3529 | 0.283 | 3.53× |
| ramda.sortWith | 3277 | 0.305 | 3.81× |
| sort-array | 2833 | 0.353 | 4.40× |
| sort-on | 489 | 2.045 | 25.52× |
| natural-orderby | 302 | 3.313 | 41.33× |
| sort-by | 62 | 16.102 | 200.88× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1416 | 0.706 | 1.00× |
| inline comparator chain, slice().sort() | 654 | 1.528 | 2.16× |
| inline comparator chain, toSorted() | 653 | 1.531 | 2.17× |
| lodash.orderBy | 333 | 3.000 | 4.25× |
| es-toolkit.orderBy | 287 | 3.489 | 4.94× |
| Array.prototype.sort, decorated | 282 | 3.545 | 5.02× |
| thenby (different order) | 258 | 3.879 | 5.49× |
| remeda.sortBy (different order) | 255 | 3.925 | 5.56× |
| fast-sort (different order) | 210 | 4.761 | 6.74× |
| ramda.sortWith (different order) | 162 | 6.172 | 8.74× |
| sort-array (different order) | 131 | 7.633 | 10.81× |
| natural-orderby (different order) | 57 | 17.546 | 24.85× |
| sort-on (different order) | 26 | 37.817 | 53.55× |
| sort-by (different order) | 3 | 348.633 | 493.66× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 359 | 2.784 | 1.00× |
| inline comparator chain, toSorted() | 107 | 9.308 | 3.34× |
| inline comparator chain, slice().sort() | 106 | 9.446 | 3.39× |
| underscore.sortBy | 74 | 13.480 | 4.84× |
| thenby | 72 | 13.960 | 5.01× |
| fast-sort | 67 | 14.986 | 5.38× |
| es-toolkit.orderBy | 65 | 15.478 | 5.56× |
| lodash.orderBy | 56 | 17.792 | 6.39× |
| remeda.sortBy | 54 | 18.368 | 6.60× |
| Array.prototype.sort, decorated | 52 | 19.416 | 6.97× |
| ramda.sortWith | 38 | 26.576 | 9.55× |
| sort-array | 34 | 29.335 | 10.54× |
| just-sort-by (different order) | 25 | 40.329 | 14.48× |
| natural-orderby (different order) | 18 | 56.341 | 20.24× |
| sort-on (different order) | 7 | 146.976 | 52.79× |
| sort-by | 1 | 1126.086 | 404.46× |

#### 100,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 42 | 23.635 | 1.00× |
| inline comparator chain, slice().sort() | 24 | 41.463 | 1.75× |
| inline comparator chain, toSorted() | 22 | 46.285 | 1.96× |
| thenby | 19 | 52.383 | 2.22× |
| underscore.sortBy | 19 | 53.757 | 2.27× |
| fast-sort | 17 | 57.855 | 2.45× |
| es-toolkit.orderBy | 17 | 60.155 | 2.55× |
| remeda.sortBy | 16 | 64.131 | 2.71× |
| Array.prototype.sort, decorated | 12 | 82.435 | 3.49× |
| lodash.orderBy | 12 | 84.457 | 3.57× |
| ramda.sortWith | 11 | 93.629 | 3.96× |
| sort-array | 9 | 112.824 | 4.77× |
| just-sort-by (different order) | 8 | 118.084 | 5.00× |
| natural-orderby (different order) | 3 | 320.133 | 13.54× |
| sort-on (different order) | 2 | 456.593 | 19.32× |
| sort-by | 0 | 2580.328 | 109.17× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 305 | 3.275 | 1.00× |
| inline comparator chain, slice().sort() | 64 | 15.627 | 4.77× |
| inline comparator chain, toSorted() | 64 | 15.635 | 4.77× |
| underscore.sortBy (different order) | 53 | 18.843 | 5.75× |
| just-sort-by (different order) | 42 | 24.067 | 7.35× |
| thenby (different order) | 40 | 24.736 | 7.55× |
| fast-sort | 39 | 25.440 | 7.77× |
| es-toolkit.orderBy | 36 | 27.773 | 8.48× |
| remeda.sortBy (different order) | 32 | 31.222 | 9.53× |
| lodash.orderBy | 29 | 34.076 | 10.41× |
| Array.prototype.sort, decorated | 27 | 36.608 | 11.18× |
| ramda.sortWith (different order) | 19 | 53.363 | 16.29× |
| sort-array | 17 | 57.582 | 17.58× |
| natural-orderby | 13 | 77.993 | 23.82× |
| sort-on | 3 | 298.796 | 91.24× |
| sort-by (different order) | 0 | 2879.815 | 879.38× |

#### 100,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 299 | 3.346 | 1.00× |
| inline comparator chain, slice().sort() | 47 | 21.317 | 6.37× |
| inline comparator chain, toSorted() | 47 | 21.328 | 6.37× |
| underscore.sortBy | 44 | 22.601 | 6.75× |
| thenby | 32 | 31.209 | 9.33× |
| fast-sort | 31 | 32.281 | 9.65× |
| remeda.sortBy | 28 | 35.137 | 10.50× |
| just-sort-by | 28 | 35.298 | 10.55× |
| es-toolkit.orderBy | 27 | 37.253 | 11.13× |
| lodash.orderBy | 23 | 42.947 | 12.84× |
| Array.prototype.sort, decorated | 20 | 49.772 | 14.87× |
| ramda.sortWith | 17 | 59.129 | 17.67× |
| sort-array | 15 | 66.616 | 19.91× |
| natural-orderby | 9 | 105.805 | 31.62× |
| sort-on | 3 | 350.994 | 104.90× |
| sort-by | 0 | 2538.696 | 758.71× |

#### 100,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 35 | 28.358 | 1.00× |
| inline comparator chain, toSorted() | 30 | 33.029 | 1.16× |
| inline comparator chain, slice().sort() | 28 | 36.002 | 1.27× |
| underscore.sortBy | 23 | 42.668 | 1.50× |
| thenby | 23 | 42.947 | 1.51× |
| fast-sort | 22 | 45.433 | 1.60× |
| es-toolkit.orderBy | 20 | 48.882 | 1.72× |
| remeda.sortBy | 19 | 52.769 | 1.86× |
| Array.prototype.sort, decorated | 16 | 61.187 | 2.16× |
| lodash.orderBy | 16 | 63.698 | 2.25× |
| just-sort-by | 15 | 68.189 | 2.40× |
| ramda.sortWith | 12 | 80.244 | 2.83× |
| sort-array | 12 | 84.442 | 2.98× |
| natural-orderby | 7 | 134.136 | 4.73× |
| sort-on | 2 | 431.208 | 15.21× |
| sort-by | 0 | 2601.038 | 91.72× |

#### 100,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1620 | 0.617 | 0.85× |
| fast-multisort | 1372 | 0.729 | 1.00× |
| inline comparator chain, slice().sort() | 1224 | 0.817 | 1.12× |
| just-sort-by | 803 | 1.246 | 1.71× |
| thenby | 712 | 1.405 | 1.93× |
| fast-sort | 677 | 1.477 | 2.03× |
| es-toolkit.orderBy | 622 | 1.609 | 2.21× |
| remeda.sortBy | 548 | 1.826 | 2.51× |
| underscore.sortBy | 419 | 2.385 | 3.27× |
| ramda.sortWith | 322 | 3.106 | 4.26× |
| Array.prototype.sort, decorated | 313 | 3.196 | 4.38× |
| lodash.orderBy | 307 | 3.254 | 4.47× |
| sort-array | 273 | 3.658 | 5.02× |
| sort-on | 45 | 22.272 | 30.56× |
| natural-orderby | 27 | 37.417 | 51.34× |
| sort-by | 6 | 161.573 | 221.70× |

#### 100,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1460 | 0.685 | 0.98× |
| fast-multisort | 1437 | 0.696 | 1.00× |
| inline comparator chain, slice().sort() | 1147 | 0.872 | 1.25× |
| just-sort-by | 789 | 1.267 | 1.82× |
| thenby | 714 | 1.402 | 2.01× |
| fast-sort | 691 | 1.448 | 2.08× |
| es-toolkit.orderBy | 616 | 1.623 | 2.33× |
| remeda.sortBy | 465 | 2.150 | 3.09× |
| underscore.sortBy | 412 | 2.425 | 3.49× |
| ramda.sortWith | 324 | 3.086 | 4.43× |
| lodash.orderBy | 297 | 3.365 | 4.83× |
| sort-array | 285 | 3.507 | 5.04× |
| Array.prototype.sort, decorated | 255 | 3.918 | 5.63× |
| sort-on | 40 | 24.798 | 35.63× |
| natural-orderby | 27 | 36.891 | 53.01× |
| sort-by | 6 | 165.987 | 238.50× |

#### 100,000 rows, ordered list, one row moved

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| inline comparator chain, toSorted() | 1406 | 0.711 | 0.76× |
| inline comparator chain, slice().sort() | 1159 | 0.863 | 0.93× |
| fast-multisort | 1075 | 0.930 | 1.00× |
| just-sort-by | 753 | 1.328 | 1.43× |
| thenby | 694 | 1.441 | 1.55× |
| fast-sort | 645 | 1.549 | 1.67× |
| es-toolkit.orderBy | 589 | 1.698 | 1.83× |
| remeda.sortBy | 522 | 1.914 | 2.06× |
| underscore.sortBy | 419 | 2.385 | 2.56× |
| ramda.sortWith | 319 | 3.133 | 3.37× |
| lodash.orderBy | 305 | 3.280 | 3.53× |
| Array.prototype.sort, decorated | 288 | 3.472 | 3.73× |
| sort-array | 260 | 3.843 | 4.13× |
| sort-on | 46 | 21.752 | 23.38× |
| natural-orderby | 26 | 38.263 | 41.12× |
| sort-by | 6 | 159.545 | 171.46× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 122 | 8.211 | 1.00× |
| inline comparator chain, slice().sort() | 45 | 22.364 | 2.72× |
| inline comparator chain, toSorted() | 44 | 22.619 | 2.75× |
| lodash.orderBy | 19 | 52.364 | 6.38× |
| es-toolkit.orderBy | 19 | 52.507 | 6.39× |
| remeda.sortBy (different order) | 18 | 55.204 | 6.72× |
| Array.prototype.sort, decorated | 17 | 58.963 | 7.18× |
| thenby (different order) | 16 | 62.723 | 7.64× |
| fast-sort (different order) | 15 | 67.061 | 8.17× |
| ramda.sortWith (different order) | 11 | 89.821 | 10.94× |
| sort-array (different order) | 9 | 112.375 | 13.69× |
| natural-orderby (different order) | 5 | 221.737 | 27.00× |
| sort-on (different order) | 2 | 542.912 | 66.12× |
| sort-by (different order) | 0 | 4573.195 | 556.95× |

Apple M5 Max, 18 cores, 128 GB, Darwin 27.2.0, Node v24.22.0
