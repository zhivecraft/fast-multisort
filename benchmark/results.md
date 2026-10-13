
#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 209730 | 0.005 | 1.00× |
| remeda.sortBy | 192146 | 0.005 | 1.09× |
| thenby | 187661 | 0.005 | 1.12× |
| fast-sort | 184173 | 0.006 | 1.14× |
| es-toolkit.orderBy | 166584 | 0.006 | 1.26× |
| Array.prototype.sort, decorated | 163090 | 0.006 | 1.29× |
| underscore.sortBy | 154871 | 0.007 | 1.35× |
| sort-array | 122918 | 0.008 | 1.71× |
| lodash.orderBy | 119157 | 0.009 | 1.76× |
| ramda.sortWith | 69507 | 0.015 | 3.02× |
| just-sort-by (different order) | 41982 | 0.024 | 5.00× |
| natural-orderby (different order) | 11966 | 0.084 | 17.53× |
| sort-on (different order) | 9005 | 0.111 | 23.29× |
| sort-by | 1235 | 0.811 | 169.83× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 172218 | 0.006 | 1.00× |
| underscore.sortBy | 119988 | 0.008 | 1.44× |
| fast-sort | 93733 | 0.011 | 1.84× |
| thenby | 93124 | 0.011 | 1.85× |
| remeda.sortBy | 92963 | 0.011 | 1.85× |
| lodash.orderBy | 92912 | 0.011 | 1.85× |
| es-toolkit.orderBy | 87152 | 0.012 | 1.98× |
| Array.prototype.sort, decorated | 86281 | 0.012 | 2.00× |
| ramda.sortWith | 52141 | 0.019 | 3.30× |
| sort-array | 50050 | 0.020 | 3.44× |
| just-sort-by (different order) | 31139 | 0.033 | 5.53× |
| natural-orderby (different order) | 9658 | 0.104 | 17.83× |
| sort-on (different order) | 7637 | 0.131 | 22.55× |
| sort-by | 1151 | 0.870 | 149.64× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 250848 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 160775 | 0.006 | 1.56× |
| just-sort-by (different order) | 111688 | 0.009 | 2.25× |
| remeda.sortBy (different order) | 109752 | 0.009 | 2.29× |
| thenby (different order) | 109187 | 0.009 | 2.30× |
| lodash.orderBy | 108328 | 0.009 | 2.32× |
| fast-sort | 104713 | 0.010 | 2.40× |
| es-toolkit.orderBy | 101058 | 0.010 | 2.48× |
| Array.prototype.sort, decorated | 100042 | 0.010 | 2.51× |
| ramda.sortWith (different order) | 58937 | 0.017 | 4.26× |
| sort-array | 58443 | 0.017 | 4.29× |
| natural-orderby | 27713 | 0.036 | 9.05× |
| sort-on | 9851 | 0.102 | 25.46× |
| sort-by (different order) | 1251 | 0.801 | 200.54× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 188147 | 0.005 | 1.00× |
| underscore.sortBy | 146478 | 0.007 | 1.28× |
| just-sort-by | 103652 | 0.010 | 1.82× |
| remeda.sortBy | 100927 | 0.010 | 1.86× |
| thenby | 99215 | 0.010 | 1.90× |
| lodash.orderBy | 93759 | 0.011 | 2.01× |
| fast-sort | 93145 | 0.011 | 2.02× |
| es-toolkit.orderBy | 90632 | 0.011 | 2.08× |
| Array.prototype.sort, decorated | 87642 | 0.011 | 2.15× |
| ramda.sortWith | 55175 | 0.018 | 3.41× |
| sort-array | 52346 | 0.019 | 3.59× |
| natural-orderby | 23435 | 0.043 | 8.03× |
| sort-on | 8585 | 0.117 | 21.92× |
| sort-by | 1137 | 0.880 | 165.53× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 134743 | 0.007 | 1.00× |
| underscore.sortBy | 98880 | 0.010 | 1.36× |
| thenby | 89731 | 0.011 | 1.50× |
| remeda.sortBy | 88681 | 0.011 | 1.52× |
| es-toolkit.orderBy | 83077 | 0.012 | 1.62× |
| fast-sort | 81459 | 0.012 | 1.65× |
| lodash.orderBy | 77831 | 0.013 | 1.73× |
| Array.prototype.sort, decorated | 75036 | 0.013 | 1.80× |
| just-sort-by | 52233 | 0.019 | 2.58× |
| ramda.sortWith | 51215 | 0.020 | 2.63× |
| sort-array | 47312 | 0.021 | 2.85× |
| natural-orderby | 16284 | 0.062 | 8.27× |
| sort-on | 7265 | 0.138 | 18.55× |
| sort-by | 1120 | 0.894 | 120.28× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1615080 | 0.001 | 1.00× |
| just-sort-by | 795881 | 0.001 | 2.03× |
| thenby | 704796 | 0.001 | 2.29× |
| remeda.sortBy | 667021 | 0.002 | 2.42× |
| fast-sort | 617400 | 0.002 | 2.62× |
| es-toolkit.orderBy | 590506 | 0.002 | 2.74× |
| Array.prototype.sort, decorated | 560396 | 0.002 | 2.88× |
| underscore.sortBy | 480791 | 0.002 | 3.36× |
| lodash.orderBy | 376758 | 0.003 | 4.29× |
| ramda.sortWith | 363273 | 0.003 | 4.45× |
| sort-array | 348642 | 0.003 | 4.63× |
| sort-on | 48735 | 0.021 | 33.14× |
| natural-orderby | 33999 | 0.030 | 47.50× |
| sort-by | 6257 | 0.160 | 258.11× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1767175 | 0.001 | 1.00× |
| just-sort-by | 764332 | 0.001 | 2.31× |
| thenby | 730922 | 0.001 | 2.42× |
| fast-sort | 667316 | 0.002 | 2.65× |
| es-toolkit.orderBy | 648426 | 0.002 | 2.73× |
| remeda.sortBy | 631091 | 0.002 | 2.80× |
| Array.prototype.sort, decorated | 545548 | 0.002 | 3.24× |
| underscore.sortBy | 444163 | 0.002 | 3.98× |
| ramda.sortWith | 368988 | 0.003 | 4.79× |
| sort-array | 359939 | 0.003 | 4.91× |
| lodash.orderBy | 346808 | 0.003 | 5.10× |
| sort-on | 42396 | 0.024 | 41.68× |
| natural-orderby | 34687 | 0.029 | 50.95× |
| sort-by | 6101 | 0.164 | 289.63× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 104898 | 0.010 | 1.00× |
| remeda.sortBy | 89135 | 0.011 | 1.18× |
| es-toolkit.orderBy | 80985 | 0.012 | 1.30× |
| Array.prototype.sort, decorated | 79934 | 0.013 | 1.31× |
| lodash.orderBy | 78573 | 0.013 | 1.34× |
| thenby | 66656 | 0.015 | 1.57× |
| fast-sort | 61834 | 0.016 | 1.70× |
| ramda.sortWith | 50516 | 0.020 | 2.08× |
| sort-array | 45466 | 0.022 | 2.31× |
| sort-on (different order) | 8542 | 0.118 | 12.28× |
| natural-orderby (different order) | 5779 | 0.173 | 18.15× |
| sort-by | 1214 | 0.825 | 86.40× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 17243 | 0.058 | 1.00× |
| underscore.sortBy | 6319 | 0.159 | 2.73× |
| remeda.sortBy | 5016 | 0.200 | 3.44× |
| thenby | 4983 | 0.201 | 3.46× |
| lodash.orderBy | 4753 | 0.211 | 3.63× |
| es-toolkit.orderBy | 4641 | 0.216 | 3.72× |
| fast-sort | 4630 | 0.216 | 3.72× |
| Array.prototype.sort, decorated | 4539 | 0.221 | 3.80× |
| ramda.sortWith | 3056 | 0.328 | 5.64× |
| sort-array | 2747 | 0.364 | 6.28× |
| just-sort-by (different order) | 2020 | 0.497 | 8.54× |
| natural-orderby (different order) | 1027 | 0.974 | 16.78× |
| sort-on (different order) | 538 | 1.859 | 32.03× |
| sort-by | 73 | 13.647 | 235.26× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12205 | 0.082 | 1.00× |
| underscore.sortBy | 5450 | 0.184 | 2.24× |
| remeda.sortBy | 4635 | 0.216 | 2.63× |
| thenby | 4627 | 0.216 | 2.64× |
| fast-sort | 4281 | 0.234 | 2.85× |
| es-toolkit.orderBy | 4241 | 0.236 | 2.88× |
| lodash.orderBy | 4178 | 0.240 | 2.92× |
| Array.prototype.sort, decorated | 4159 | 0.241 | 2.93× |
| ramda.sortWith | 2942 | 0.340 | 4.15× |
| sort-array | 2583 | 0.387 | 4.73× |
| just-sort-by (different order) | 1984 | 0.507 | 6.15× |
| natural-orderby (different order) | 727 | 1.380 | 16.80× |
| sort-on (different order) | 477 | 2.098 | 25.60× |
| sort-by | 71 | 14.175 | 172.92× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 29909 | 0.034 | 1.00× |
| underscore.sortBy (different order) | 9984 | 0.100 | 3.00× |
| thenby (different order) | 6829 | 0.147 | 4.38× |
| remeda.sortBy (different order) | 6726 | 0.149 | 4.45× |
| just-sort-by (different order) | 6686 | 0.150 | 4.47× |
| lodash.orderBy | 6590 | 0.152 | 4.54× |
| fast-sort | 6579 | 0.152 | 4.55× |
| es-toolkit.orderBy | 6285 | 0.159 | 4.76× |
| Array.prototype.sort, decorated | 6169 | 0.162 | 4.85× |
| sort-array | 3763 | 0.266 | 7.95× |
| ramda.sortWith (different order) | 3760 | 0.266 | 7.95× |
| natural-orderby | 2230 | 0.449 | 13.41× |
| sort-on | 612 | 1.635 | 48.88× |
| sort-by (different order) | 75 | 13.319 | 397.92× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 25543 | 0.039 | 1.00× |
| underscore.sortBy | 8348 | 0.120 | 3.06× |
| just-sort-by | 6200 | 0.162 | 4.12× |
| thenby | 6125 | 0.164 | 4.17× |
| remeda.sortBy | 6099 | 0.164 | 4.19× |
| lodash.orderBy | 5786 | 0.173 | 4.41× |
| fast-sort | 5772 | 0.174 | 4.43× |
| es-toolkit.orderBy | 5526 | 0.181 | 4.62× |
| Array.prototype.sort, decorated | 5293 | 0.189 | 4.83× |
| ramda.sortWith | 3502 | 0.286 | 7.29× |
| sort-array | 3301 | 0.303 | 7.74× |
| natural-orderby | 1853 | 0.541 | 13.78× |
| sort-on | 528 | 1.894 | 48.33× |
| sort-by | 72 | 13.943 | 355.83× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12329 | 0.081 | 1.00× |
| underscore.sortBy | 5725 | 0.175 | 2.15× |
| thenby | 5254 | 0.191 | 2.35× |
| remeda.sortBy | 5190 | 0.193 | 2.38× |
| es-toolkit.orderBy | 4710 | 0.213 | 2.62× |
| fast-sort | 4662 | 0.215 | 2.64× |
| Array.prototype.sort, decorated | 4544 | 0.220 | 2.71× |
| lodash.orderBy | 4436 | 0.226 | 2.78× |
| ramda.sortWith | 3122 | 0.321 | 3.95× |
| just-sort-by | 3074 | 0.327 | 4.01× |
| sort-array | 2859 | 0.350 | 4.31× |
| natural-orderby | 1408 | 0.711 | 8.76× |
| sort-on | 448 | 2.232 | 27.51× |
| sort-by | 71 | 14.178 | 174.74× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 164641 | 0.006 | 1.00× |
| just-sort-by | 79149 | 0.013 | 2.08× |
| thenby | 70532 | 0.014 | 2.33× |
| remeda.sortBy | 67266 | 0.015 | 2.45× |
| fast-sort | 64791 | 0.016 | 2.54× |
| es-toolkit.orderBy | 62685 | 0.016 | 2.63× |
| Array.prototype.sort, decorated | 53732 | 0.019 | 3.06× |
| underscore.sortBy | 47906 | 0.021 | 3.44× |
| lodash.orderBy | 37575 | 0.027 | 4.38× |
| ramda.sortWith | 35886 | 0.028 | 4.59× |
| sort-array | 35334 | 0.028 | 4.66× |
| sort-on | 4790 | 0.209 | 34.37× |
| natural-orderby | 3394 | 0.295 | 48.50× |
| sort-by | 620 | 1.615 | 265.63× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 173604 | 0.006 | 1.00× |
| just-sort-by | 78635 | 0.013 | 2.21× |
| thenby | 74451 | 0.014 | 2.33× |
| fast-sort | 67487 | 0.015 | 2.57× |
| es-toolkit.orderBy | 65725 | 0.015 | 2.64× |
| remeda.sortBy | 62997 | 0.016 | 2.76× |
| Array.prototype.sort, decorated | 53416 | 0.019 | 3.25× |
| underscore.sortBy | 45256 | 0.022 | 3.84× |
| sort-array | 36850 | 0.027 | 4.71× |
| ramda.sortWith | 36437 | 0.028 | 4.76× |
| lodash.orderBy | 35440 | 0.029 | 4.90× |
| sort-on | 4295 | 0.233 | 40.42× |
| natural-orderby | 3390 | 0.296 | 51.21× |
| sort-by | 613 | 1.635 | 283.29× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11467 | 0.088 | 1.00× |
| lodash.orderBy | 4444 | 0.226 | 2.58× |
| Array.prototype.sort, decorated | 4432 | 0.226 | 2.59× |
| es-toolkit.orderBy | 4294 | 0.233 | 2.67× |
| remeda.sortBy (different order) | 4107 | 0.244 | 2.79× |
| thenby (different order) | 3833 | 0.261 | 2.99× |
| fast-sort (different order) | 3496 | 0.286 | 3.28× |
| ramda.sortWith (different order) | 2750 | 0.364 | 4.17× |
| sort-array (different order) | 2381 | 0.420 | 4.82× |
| natural-orderby (different order) | 520 | 1.925 | 22.06× |
| sort-on (different order) | 504 | 1.985 | 22.74× |
| sort-by (different order) | 71 | 14.019 | 160.71× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3271 | 0.307 | 1.00× |
| underscore.sortBy | 426 | 2.352 | 7.69× |
| thenby | 355 | 2.815 | 9.20× |
| fast-sort | 330 | 3.031 | 9.90× |
| Array.prototype.sort, decorated | 326 | 3.074 | 10.05× |
| es-toolkit.orderBy | 325 | 3.082 | 10.07× |
| lodash.orderBy | 312 | 3.205 | 10.48× |
| remeda.sortBy | 293 | 3.421 | 11.17× |
| ramda.sortWith | 205 | 4.884 | 15.97× |
| sort-array | 186 | 5.366 | 17.54× |
| just-sort-by (different order) | 154 | 6.506 | 21.26× |
| natural-orderby (different order) | 87 | 11.550 | 37.76× |
| sort-on (different order) | 38 | 26.010 | 85.05× |
| sort-by | 5 | 190.503 | 622.67× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 726 | 1.383 | 1.00× |
| underscore.sortBy | 339 | 2.953 | 2.14× |
| thenby | 308 | 3.252 | 2.36× |
| fast-sort | 285 | 3.523 | 2.55× |
| es-toolkit.orderBy | 282 | 3.555 | 2.58× |
| Array.prototype.sort, decorated | 279 | 3.585 | 2.60× |
| remeda.sortBy | 267 | 3.747 | 2.72× |
| lodash.orderBy | 255 | 3.922 | 2.85× |
| ramda.sortWith | 189 | 5.314 | 3.85× |
| sort-array | 171 | 5.833 | 4.24× |
| just-sort-by (different order) | 145 | 6.956 | 5.02× |
| natural-orderby (different order) | 56 | 17.981 | 13.05× |
| sort-on (different order) | 34 | 29.706 | 21.55× |
| sort-by | 5 | 194.074 | 140.94× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3696 | 0.272 | 1.00× |
| underscore.sortBy (different order) | 719 | 1.393 | 5.14× |
| thenby (different order) | 510 | 1.963 | 7.25× |
| just-sort-by (different order) | 494 | 2.026 | 7.49× |
| fast-sort | 482 | 2.074 | 7.66× |
| lodash.orderBy | 469 | 2.136 | 7.89× |
| es-toolkit.orderBy | 463 | 2.163 | 7.99× |
| Array.prototype.sort, decorated | 458 | 2.184 | 8.07× |
| remeda.sortBy (different order) | 430 | 2.328 | 8.60× |
| ramda.sortWith (different order) | 261 | 3.826 | 14.14× |
| sort-array | 246 | 4.063 | 15.01× |
| natural-orderby | 180 | 5.571 | 20.58× |
| sort-on | 43 | 23.188 | 85.45× |
| sort-by (different order) | 6 | 181.393 | 670.41× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3006 | 0.333 | 1.00× |
| underscore.sortBy | 601 | 1.666 | 5.00× |
| thenby | 444 | 2.252 | 6.77× |
| just-sort-by | 441 | 2.271 | 6.82× |
| fast-sort | 414 | 2.419 | 7.27× |
| es-toolkit.orderBy | 402 | 2.491 | 7.48× |
| remeda.sortBy | 396 | 2.529 | 7.60× |
| lodash.orderBy | 393 | 2.545 | 7.65× |
| Array.prototype.sort, decorated | 389 | 2.573 | 7.73× |
| ramda.sortWith | 240 | 4.169 | 12.53× |
| sort-array | 218 | 4.589 | 13.79× |
| natural-orderby | 148 | 6.775 | 20.36× |
| sort-on | 38 | 26.379 | 79.12× |
| sort-by | 5 | 192.708 | 579.10× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 725 | 1.385 | 1.00× |
| underscore.sortBy | 376 | 2.664 | 1.93× |
| thenby | 343 | 2.915 | 2.11× |
| fast-sort | 325 | 3.076 | 2.23× |
| es-toolkit.orderBy | 325 | 3.077 | 2.23× |
| Array.prototype.sort, decorated | 315 | 3.174 | 2.30× |
| remeda.sortBy | 301 | 3.331 | 2.41× |
| lodash.orderBy | 300 | 3.334 | 2.42× |
| just-sort-by | 232 | 4.325 | 3.13× |
| ramda.sortWith | 201 | 4.990 | 3.61× |
| sort-array | 188 | 5.316 | 3.85× |
| natural-orderby | 115 | 8.681 | 6.28× |
| sort-on | 32 | 31.091 | 22.52× |
| sort-by | 5 | 196.463 | 142.36× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 15609 | 0.064 | 1.00× |
| just-sort-by | 7956 | 0.126 | 1.96× |
| thenby | 6860 | 0.146 | 2.28× |
| fast-sort | 6366 | 0.158 | 2.45× |
| es-toolkit.orderBy | 6120 | 0.164 | 2.55× |
| remeda.sortBy | 6074 | 0.165 | 2.57× |
| Array.prototype.sort, decorated | 5428 | 0.185 | 2.88× |
| underscore.sortBy | 4744 | 0.212 | 3.29× |
| lodash.orderBy | 3745 | 0.270 | 4.17× |
| ramda.sortWith | 3271 | 0.306 | 4.77× |
| sort-array | 3123 | 0.321 | 5.00× |
| sort-on | 473 | 2.122 | 33.01× |
| natural-orderby | 318 | 3.153 | 49.15× |
| sort-by | 63 | 15.855 | 247.42× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 17753 | 0.057 | 1.00× |
| just-sort-by | 7642 | 0.131 | 2.32× |
| thenby | 7359 | 0.136 | 2.41× |
| fast-sort | 6669 | 0.150 | 2.66× |
| es-toolkit.orderBy | 6379 | 0.157 | 2.78× |
| Array.prototype.sort, decorated | 5423 | 0.185 | 3.27× |
| remeda.sortBy | 5175 | 0.194 | 3.43× |
| underscore.sortBy | 4420 | 0.227 | 4.02× |
| lodash.orderBy | 3417 | 0.296 | 5.20× |
| ramda.sortWith | 3346 | 0.299 | 5.31× |
| sort-array | 3123 | 0.321 | 5.69× |
| sort-on | 430 | 2.326 | 41.27× |
| natural-orderby | 322 | 3.109 | 55.17× |
| sort-by | 59 | 16.922 | 300.31× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1360 | 0.738 | 1.00× |
| Array.prototype.sort, decorated | 289 | 3.459 | 4.70× |
| lodash.orderBy | 282 | 3.546 | 4.82× |
| es-toolkit.orderBy | 276 | 3.628 | 4.93× |
| remeda.sortBy (different order) | 259 | 3.856 | 5.24× |
| thenby (different order) | 253 | 3.952 | 5.37× |
| fast-sort (different order) | 216 | 4.630 | 6.29× |
| ramda.sortWith (different order) | 178 | 5.608 | 7.62× |
| sort-array (different order) | 154 | 6.498 | 8.82× |
| natural-orderby (different order) | 43 | 23.075 | 31.33× |
| sort-on (different order) | 33 | 30.034 | 40.80× |
| sort-by (different order) | 4 | 228.142 | 310.18× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 286 | 3.516 | 1.00× |
| underscore.sortBy | 36 | 28.194 | 8.05× |
| thenby | 31 | 32.674 | 9.34× |
| fast-sort | 29 | 34.958 | 9.97× |
| es-toolkit.orderBy | 27 | 36.626 | 10.46× |
| Array.prototype.sort, decorated | 26 | 39.130 | 11.17× |
| lodash.orderBy | 25 | 39.963 | 11.41× |
| remeda.sortBy | 25 | 40.072 | 11.43× |
| ramda.sortWith | 18 | 56.847 | 16.24× |
| sort-array | 16 | 61.794 | 17.63× |
| just-sort-by (different order) | 13 | 78.634 | 22.44× |
| natural-orderby (different order) | 7 | 136.885 | 39.11× |
| sort-on (different order) | 3 | 305.963 | 87.40× |
| sort-by | 0 | 2161.720 | 617.90× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 310 | 3.275 | 1.00× |
| underscore.sortBy (different order) | 53 | 18.828 | 5.81× |
| thenby (different order) | 38 | 26.035 | 8.05× |
| just-sort-by (different order) | 38 | 26.514 | 8.21× |
| fast-sort | 37 | 26.924 | 8.34× |
| es-toolkit.orderBy | 35 | 28.363 | 8.78× |
| remeda.sortBy (different order) | 33 | 29.919 | 9.27× |
| Array.prototype.sort, decorated | 32 | 31.610 | 9.73× |
| lodash.orderBy | 32 | 31.712 | 9.80× |
| ramda.sortWith (different order) | 20 | 50.773 | 15.72× |
| sort-array | 19 | 53.527 | 16.55× |
| natural-orderby | 13 | 78.247 | 24.21× |
| sort-on | 3 | 302.167 | 93.48× |
| sort-by (different order) | 0 | 2300.939 | 712.71× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 92 | 10.869 | 1.00× |
| es-toolkit.orderBy | 19 | 53.462 | 4.91× |
| Array.prototype.sort, decorated | 19 | 53.616 | 4.93× |
| remeda.sortBy (different order) | 18 | 55.356 | 5.10× |
| thenby (different order) | 18 | 56.276 | 5.18× |
| lodash.orderBy | 18 | 57.033 | 5.24× |
| fast-sort (different order) | 15 | 67.423 | 6.20× |
| ramda.sortWith (different order) | 12 | 83.160 | 7.65× |
| sort-array (different order) | 11 | 93.708 | 8.62× |
| natural-orderby (different order) | 4 | 276.424 | 25.46× |
| sort-on (different order) | 2 | 448.899 | 41.34× |
| sort-by (different order) | 0 | 3461.852 | 319.08× |

Apple M5 Max, 18 cores, 128 GB, Darwin 27.2.0, Node v24.21.0
