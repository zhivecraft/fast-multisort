
#### 100 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 210155 | 0.005 | 1.00× |
| remeda.sortBy | 192277 | 0.005 | 1.09× |
| fast-sort | 186991 | 0.005 | 1.12× |
| thenby | 184741 | 0.005 | 1.14× |
| Array.prototype.sort, decorated | 167391 | 0.006 | 1.26× |
| es-toolkit.orderBy | 162380 | 0.006 | 1.29× |
| underscore.sortBy | 152390 | 0.007 | 1.38× |
| sort-array | 121532 | 0.008 | 1.73× |
| lodash.orderBy | 117808 | 0.009 | 1.78× |
| ramda.sortWith | 70288 | 0.014 | 2.99× |
| just-sort-by (different order) | 43499 | 0.023 | 4.83× |
| natural-orderby (different order) | 11975 | 0.084 | 17.55× |
| sort-on (different order) | 8760 | 0.114 | 23.99× |
| sort-by | 1222 | 0.820 | 171.98× |

#### 100 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 173723 | 0.006 | 1.00× |
| underscore.sortBy | 121505 | 0.008 | 1.43× |
| thenby | 94582 | 0.011 | 1.84× |
| remeda.sortBy | 94372 | 0.011 | 1.84× |
| lodash.orderBy | 92641 | 0.011 | 1.88× |
| fast-sort | 91801 | 0.011 | 1.89× |
| Array.prototype.sort, decorated | 87704 | 0.012 | 1.98× |
| es-toolkit.orderBy | 86307 | 0.012 | 2.01× |
| ramda.sortWith | 52446 | 0.019 | 3.31× |
| sort-array | 51111 | 0.020 | 3.40× |
| just-sort-by (different order) | 31586 | 0.032 | 5.50× |
| natural-orderby (different order) | 9626 | 0.104 | 18.05× |
| sort-on (different order) | 7746 | 0.129 | 22.43× |
| sort-by | 1121 | 0.893 | 154.98× |

#### 100 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 243323 | 0.004 | 1.00× |
| underscore.sortBy (different order) | 163500 | 0.006 | 1.49× |
| just-sort-by (different order) | 111965 | 0.009 | 2.17× |
| thenby (different order) | 109435 | 0.009 | 2.22× |
| remeda.sortBy (different order) | 108616 | 0.009 | 2.24× |
| lodash.orderBy | 108357 | 0.009 | 2.25× |
| fast-sort | 102087 | 0.010 | 2.38× |
| es-toolkit.orderBy | 100870 | 0.010 | 2.41× |
| Array.prototype.sort, decorated | 100090 | 0.010 | 2.43× |
| ramda.sortWith (different order) | 59079 | 0.017 | 4.12× |
| sort-array | 57928 | 0.017 | 4.20× |
| natural-orderby | 27587 | 0.037 | 8.82× |
| sort-on | 9477 | 0.106 | 25.68× |
| sort-by (different order) | 1213 | 0.825 | 200.56× |

#### 100 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 189375 | 0.005 | 1.00× |
| underscore.sortBy | 145916 | 0.007 | 1.30× |
| remeda.sortBy | 101681 | 0.010 | 1.86× |
| thenby | 98915 | 0.010 | 1.91× |
| just-sort-by | 98256 | 0.010 | 1.93× |
| lodash.orderBy | 94284 | 0.011 | 2.01× |
| es-toolkit.orderBy | 90668 | 0.011 | 2.09× |
| fast-sort | 89845 | 0.011 | 2.11× |
| Array.prototype.sort, decorated | 85947 | 0.012 | 2.20× |
| ramda.sortWith | 55013 | 0.018 | 3.44× |
| sort-array | 51906 | 0.019 | 3.65× |
| natural-orderby | 22888 | 0.044 | 8.27× |
| sort-on | 8310 | 0.121 | 22.79× |
| sort-by | 1144 | 0.875 | 165.47× |

#### 100 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 130729 | 0.008 | 1.00× |
| underscore.sortBy | 99299 | 0.010 | 1.32× |
| thenby | 92457 | 0.011 | 1.41× |
| remeda.sortBy | 89819 | 0.011 | 1.46× |
| es-toolkit.orderBy | 84303 | 0.012 | 1.55× |
| fast-sort | 82886 | 0.012 | 1.58× |
| Array.prototype.sort, decorated | 78611 | 0.013 | 1.66× |
| lodash.orderBy | 76503 | 0.013 | 1.71× |
| just-sort-by | 53245 | 0.019 | 2.46× |
| ramda.sortWith | 51599 | 0.019 | 2.53× |
| sort-array | 48041 | 0.021 | 2.72× |
| natural-orderby | 16312 | 0.062 | 8.01× |
| sort-on | 7383 | 0.136 | 17.71× |
| sort-by | 1146 | 0.874 | 114.07× |

#### 100 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 967509 | 0.001 | 1.00× |
| just-sort-by | 777389 | 0.001 | 1.24× |
| thenby | 684334 | 0.001 | 1.41× |
| remeda.sortBy | 683018 | 0.001 | 1.42× |
| es-toolkit.orderBy | 620173 | 0.002 | 1.56× |
| fast-sort | 612590 | 0.002 | 1.58× |
| Array.prototype.sort, decorated | 561433 | 0.002 | 1.72× |
| underscore.sortBy | 477257 | 0.002 | 2.03× |
| lodash.orderBy | 375832 | 0.003 | 2.57× |
| ramda.sortWith | 363166 | 0.003 | 2.66× |
| sort-array | 352062 | 0.003 | 2.75× |
| sort-on | 47832 | 0.021 | 20.23× |
| natural-orderby | 32858 | 0.031 | 29.44× |
| sort-by | 6231 | 0.161 | 155.28× |

#### 100 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1044067 | 0.001 | 1.00× |
| just-sort-by | 780753 | 0.001 | 1.34× |
| thenby | 711152 | 0.001 | 1.47× |
| fast-sort | 674323 | 0.002 | 1.55× |
| remeda.sortBy | 648473 | 0.002 | 1.61× |
| Array.prototype.sort, decorated | 547745 | 0.002 | 1.91× |
| es-toolkit.orderBy | 538712 | 0.002 | 1.94× |
| underscore.sortBy | 440149 | 0.002 | 2.37× |
| sort-array | 364351 | 0.003 | 2.87× |
| ramda.sortWith | 361295 | 0.003 | 2.89× |
| lodash.orderBy | 351154 | 0.003 | 2.97× |
| sort-on | 43176 | 0.023 | 24.18× |
| natural-orderby | 34321 | 0.029 | 30.42× |
| sort-by | 6222 | 0.161 | 167.79× |

#### 100 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 102326 | 0.010 | 1.00× |
| remeda.sortBy | 92353 | 0.011 | 1.11× |
| lodash.orderBy | 80718 | 0.013 | 1.27× |
| Array.prototype.sort, decorated | 80435 | 0.013 | 1.27× |
| thenby | 66334 | 0.015 | 1.54× |
| fast-sort | 63223 | 0.016 | 1.62× |
| es-toolkit.orderBy | 61783 | 0.016 | 1.66× |
| ramda.sortWith | 49725 | 0.020 | 2.06× |
| sort-array | 45857 | 0.022 | 2.23× |
| sort-on (different order) | 8069 | 0.124 | 12.68× |
| natural-orderby (different order) | 5748 | 0.175 | 17.80× |
| sort-by | 1199 | 0.836 | 85.35× |

#### 1,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 17395 | 0.058 | 1.00× |
| underscore.sortBy | 6356 | 0.158 | 2.74× |
| remeda.sortBy | 5091 | 0.197 | 3.42× |
| thenby | 5005 | 0.200 | 3.48× |
| lodash.orderBy | 4796 | 0.209 | 3.63× |
| Array.prototype.sort, decorated | 4546 | 0.220 | 3.83× |
| fast-sort | 4503 | 0.223 | 3.86× |
| es-toolkit.orderBy | 3474 | 0.289 | 5.01× |
| ramda.sortWith | 3011 | 0.333 | 5.78× |
| sort-array | 2756 | 0.363 | 6.31× |
| just-sort-by (different order) | 2122 | 0.472 | 8.20× |
| natural-orderby (different order) | 1043 | 0.960 | 16.68× |
| sort-on (different order) | 520 | 1.928 | 33.46× |
| sort-by | 72 | 13.833 | 240.46× |

#### 1,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11897 | 0.084 | 1.00× |
| underscore.sortBy | 5508 | 0.182 | 2.16× |
| remeda.sortBy | 4697 | 0.213 | 2.53× |
| thenby | 4584 | 0.218 | 2.60× |
| fast-sort | 4261 | 0.235 | 2.79× |
| Array.prototype.sort, decorated | 4212 | 0.238 | 2.82× |
| lodash.orderBy | 4196 | 0.239 | 2.84× |
| es-toolkit.orderBy | 3207 | 0.312 | 3.71× |
| ramda.sortWith | 2919 | 0.343 | 4.08× |
| sort-array | 2594 | 0.386 | 4.59× |
| just-sort-by (different order) | 1969 | 0.510 | 6.04× |
| natural-orderby (different order) | 736 | 1.362 | 16.17× |
| sort-on (different order) | 465 | 2.151 | 25.57× |
| sort-by | 71 | 14.170 | 168.39× |

#### 1,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 29691 | 0.034 | 1.00× |
| underscore.sortBy (different order) | 9831 | 0.102 | 3.02× |
| thenby (different order) | 6751 | 0.148 | 4.40× |
| remeda.sortBy (different order) | 6749 | 0.149 | 4.40× |
| just-sort-by (different order) | 6660 | 0.150 | 4.46× |
| lodash.orderBy | 6566 | 0.153 | 4.52× |
| fast-sort | 6459 | 0.155 | 4.60× |
| Array.prototype.sort, decorated | 6161 | 0.163 | 4.82× |
| es-toolkit.orderBy | 5147 | 0.195 | 5.77× |
| ramda.sortWith (different order) | 3701 | 0.271 | 8.02× |
| sort-array | 3685 | 0.272 | 8.06× |
| natural-orderby | 2251 | 0.445 | 13.19× |
| sort-on | 614 | 1.629 | 48.34× |
| sort-by (different order) | 74 | 13.595 | 403.40× |

#### 1,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 24961 | 0.040 | 1.00× |
| underscore.sortBy | 8492 | 0.118 | 2.94× |
| remeda.sortBy | 6218 | 0.161 | 4.01× |
| just-sort-by | 6124 | 0.164 | 4.08× |
| thenby | 6014 | 0.167 | 4.15× |
| fast-sort | 5834 | 0.172 | 4.28× |
| lodash.orderBy | 5707 | 0.176 | 4.37× |
| Array.prototype.sort, decorated | 5341 | 0.188 | 4.67× |
| es-toolkit.orderBy | 4579 | 0.219 | 5.45× |
| ramda.sortWith | 3497 | 0.286 | 7.14× |
| sort-array | 3299 | 0.304 | 7.57× |
| natural-orderby | 1832 | 0.547 | 13.62× |
| sort-on | 511 | 1.958 | 48.83× |
| sort-by | 70 | 14.301 | 356.84× |

#### 1,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 12260 | 0.082 | 1.00× |
| underscore.sortBy | 5798 | 0.173 | 2.11× |
| remeda.sortBy | 5160 | 0.194 | 2.38× |
| thenby | 5127 | 0.195 | 2.39× |
| fast-sort | 4648 | 0.216 | 2.64× |
| Array.prototype.sort, decorated | 4575 | 0.219 | 2.68× |
| lodash.orderBy | 4409 | 0.227 | 2.78× |
| es-toolkit.orderBy | 3521 | 0.287 | 3.48× |
| ramda.sortWith | 3080 | 0.325 | 3.98× |
| just-sort-by | 3075 | 0.328 | 3.99× |
| sort-array | 2760 | 0.363 | 4.44× |
| natural-orderby | 1396 | 0.717 | 8.78× |
| sort-on | 451 | 2.218 | 27.17× |
| sort-by | 70 | 14.292 | 175.04× |

#### 1,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 102295 | 0.010 | 1.00× |
| just-sort-by | 78577 | 0.013 | 1.30× |
| thenby | 70725 | 0.014 | 1.45× |
| remeda.sortBy | 68037 | 0.015 | 1.50× |
| fast-sort | 63385 | 0.016 | 1.61× |
| Array.prototype.sort, decorated | 54535 | 0.019 | 1.88× |
| es-toolkit.orderBy | 49999 | 0.020 | 2.05× |
| underscore.sortBy | 47892 | 0.021 | 2.14× |
| lodash.orderBy | 38369 | 0.026 | 2.67× |
| ramda.sortWith | 35580 | 0.028 | 2.88× |
| sort-array | 35423 | 0.028 | 2.89× |
| sort-on | 4655 | 0.215 | 21.97× |
| natural-orderby | 3334 | 0.301 | 30.69× |
| sort-by | 599 | 1.671 | 170.68× |

#### 1,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 107256 | 0.009 | 1.00× |
| just-sort-by | 77436 | 0.013 | 1.39× |
| thenby | 73136 | 0.014 | 1.47× |
| fast-sort | 65769 | 0.015 | 1.63× |
| remeda.sortBy | 62549 | 0.016 | 1.71× |
| es-toolkit.orderBy | 53368 | 0.019 | 2.01× |
| Array.prototype.sort, decorated | 52596 | 0.019 | 2.04× |
| underscore.sortBy | 45388 | 0.022 | 2.36× |
| sort-array | 36061 | 0.028 | 2.97× |
| ramda.sortWith | 35834 | 0.028 | 2.99× |
| lodash.orderBy | 35726 | 0.028 | 3.00× |
| sort-on | 4118 | 0.244 | 26.04× |
| natural-orderby | 3395 | 0.295 | 31.59× |
| sort-by | 600 | 1.667 | 178.62× |

#### 1,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 11781 | 0.085 | 1.00× |
| lodash.orderBy | 4588 | 0.218 | 2.57× |
| Array.prototype.sort, decorated | 4449 | 0.225 | 2.65× |
| es-toolkit.orderBy | 4433 | 0.226 | 2.66× |
| remeda.sortBy (different order) | 4080 | 0.245 | 2.89× |
| thenby (different order) | 3836 | 0.261 | 3.07× |
| fast-sort (different order) | 3598 | 0.278 | 3.27× |
| ramda.sortWith (different order) | 2752 | 0.364 | 4.28× |
| sort-array (different order) | 2420 | 0.414 | 4.87× |
| natural-orderby (different order) | 517 | 1.938 | 22.78× |
| sort-on (different order) | 492 | 2.034 | 23.95× |
| sort-by (different order) | 69 | 14.469 | 170.28× |

#### 10,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3184 | 0.316 | 1.00× |
| underscore.sortBy | 422 | 2.374 | 7.55× |
| thenby | 358 | 2.798 | 8.90× |
| fast-sort | 336 | 2.983 | 9.49× |
| es-toolkit.orderBy | 327 | 3.064 | 9.74× |
| Array.prototype.sort, decorated | 325 | 3.076 | 9.79× |
| lodash.orderBy | 314 | 3.186 | 10.13× |
| remeda.sortBy | 301 | 3.326 | 10.58× |
| ramda.sortWith | 206 | 4.861 | 15.47× |
| sort-array | 186 | 5.393 | 17.16× |
| just-sort-by (different order) | 153 | 6.544 | 20.81× |
| natural-orderby (different order) | 86 | 11.699 | 37.16× |
| sort-on (different order) | 36 | 27.428 | 87.23× |
| sort-by | 5 | 188.277 | 599.10× |

#### 10,000 rows, string key, all unique

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 741 | 1.356 | 1.00× |
| underscore.sortBy | 350 | 2.856 | 2.11× |
| thenby | 308 | 3.251 | 2.41× |
| fast-sort | 289 | 3.466 | 2.57× |
| es-toolkit.orderBy | 284 | 3.519 | 2.61× |
| Array.prototype.sort, decorated | 280 | 3.570 | 2.64× |
| remeda.sortBy | 270 | 3.704 | 2.74× |
| lodash.orderBy | 256 | 3.910 | 2.90× |
| ramda.sortWith | 190 | 5.252 | 3.89× |
| sort-array | 170 | 5.899 | 4.37× |
| just-sort-by (different order) | 138 | 7.276 | 5.37× |
| natural-orderby (different order) | 55 | 18.301 | 13.53× |
| sort-on (different order) | 33 | 30.341 | 22.43× |
| sort-by | 5 | 196.997 | 145.96× |

#### 10,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3624 | 0.277 | 1.00× |
| underscore.sortBy (different order) | 720 | 1.390 | 5.03× |
| thenby (different order) | 508 | 1.968 | 7.13× |
| just-sort-by (different order) | 503 | 1.989 | 7.20× |
| fast-sort | 483 | 2.075 | 7.51× |
| lodash.orderBy | 466 | 2.149 | 7.78× |
| es-toolkit.orderBy | 460 | 2.177 | 7.89× |
| Array.prototype.sort, decorated | 453 | 2.207 | 8.00× |
| remeda.sortBy (different order) | 426 | 2.348 | 8.50× |
| ramda.sortWith (different order) | 260 | 3.849 | 13.94× |
| sort-array | 242 | 4.136 | 14.98× |
| natural-orderby | 178 | 5.606 | 20.31× |
| sort-on | 44 | 22.856 | 82.80× |
| sort-by (different order) | 5 | 182.079 | 659.78× |

#### 10,000 rows, float key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 3015 | 0.332 | 1.00× |
| underscore.sortBy | 601 | 1.664 | 5.02× |
| thenby | 447 | 2.238 | 6.74× |
| just-sort-by | 437 | 2.288 | 6.89× |
| fast-sort | 407 | 2.460 | 7.42× |
| es-toolkit.orderBy | 401 | 2.498 | 7.53× |
| lodash.orderBy | 388 | 2.583 | 7.78× |
| remeda.sortBy | 386 | 2.591 | 7.81× |
| Array.prototype.sort, decorated | 384 | 2.605 | 7.84× |
| ramda.sortWith | 236 | 4.233 | 12.76× |
| sort-array | 215 | 4.648 | 14.01× |
| natural-orderby | 149 | 6.734 | 20.30× |
| sort-on | 35 | 28.312 | 85.12× |
| sort-by | 5 | 193.592 | 583.36× |

#### 10,000 rows, ISO date string key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 725 | 1.386 | 1.00× |
| underscore.sortBy | 377 | 2.651 | 1.92× |
| thenby | 350 | 2.856 | 2.07× |
| fast-sort | 331 | 3.024 | 2.19× |
| Array.prototype.sort, decorated | 309 | 3.239 | 2.34× |
| es-toolkit.orderBy | 306 | 3.272 | 2.37× |
| lodash.orderBy | 293 | 3.411 | 2.47× |
| remeda.sortBy | 290 | 3.463 | 2.50× |
| just-sort-by | 236 | 4.243 | 3.07× |
| ramda.sortWith | 202 | 4.945 | 3.58× |
| sort-array | 182 | 5.509 | 3.98× |
| natural-orderby | 115 | 8.688 | 6.29× |
| sort-on | 31 | 32.405 | 23.43× |
| sort-by | 5 | 197.099 | 142.77× |

#### 10,000 rows, already sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10012 | 0.100 | 1.00× |
| just-sort-by | 7954 | 0.126 | 1.26× |
| thenby | 6865 | 0.146 | 1.46× |
| fast-sort | 6376 | 0.157 | 1.57× |
| remeda.sortBy | 6099 | 0.164 | 1.64× |
| es-toolkit.orderBy | 5859 | 0.171 | 1.71× |
| Array.prototype.sort, decorated | 5552 | 0.181 | 1.80× |
| underscore.sortBy | 4847 | 0.207 | 2.07× |
| lodash.orderBy | 3766 | 0.269 | 2.66× |
| ramda.sortWith | 3251 | 0.308 | 3.08× |
| sort-array | 3141 | 0.319 | 3.19× |
| sort-on | 465 | 2.153 | 21.54× |
| natural-orderby | 314 | 3.188 | 31.89× |
| sort-by | 62 | 16.054 | 160.69× |

#### 10,000 rows, reverse sorted integer key

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 10661 | 0.094 | 1.00× |
| just-sort-by | 7799 | 0.129 | 1.37× |
| thenby | 7527 | 0.133 | 1.42× |
| fast-sort | 6796 | 0.147 | 1.57× |
| es-toolkit.orderBy | 6462 | 0.155 | 1.65× |
| Array.prototype.sort, decorated | 5526 | 0.182 | 1.93× |
| remeda.sortBy | 5296 | 0.189 | 2.01× |
| underscore.sortBy | 4553 | 0.220 | 2.34× |
| lodash.orderBy | 3428 | 0.295 | 3.11× |
| ramda.sortWith | 3325 | 0.301 | 3.21× |
| sort-array | 3184 | 0.315 | 3.35× |
| sort-on | 404 | 2.496 | 26.41× |
| natural-orderby | 324 | 3.085 | 32.87× |
| sort-by | 59 | 16.907 | 180.20× |

#### 10,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 1401 | 0.715 | 1.00× |
| Array.prototype.sort, decorated | 288 | 3.472 | 4.86× |
| es-toolkit.orderBy | 284 | 3.524 | 4.93× |
| lodash.orderBy | 275 | 3.632 | 5.09× |
| remeda.sortBy (different order) | 260 | 3.848 | 5.39× |
| thenby (different order) | 260 | 3.857 | 5.40× |
| fast-sort (different order) | 228 | 4.394 | 6.15× |
| ramda.sortWith (different order) | 179 | 5.584 | 7.82× |
| sort-array (different order) | 159 | 6.290 | 8.81× |
| natural-orderby (different order) | 44 | 22.942 | 32.10× |
| sort-on (different order) | 31 | 31.791 | 44.48× |
| sort-by (different order) | 4 | 235.021 | 329.19× |

#### 100,000 rows, string key, 10 distinct values

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 274 | 3.667 | 1.00× |
| underscore.sortBy | 34 | 29.449 | 8.05× |
| thenby | 30 | 33.398 | 9.14× |
| fast-sort | 28 | 36.068 | 9.84× |
| es-toolkit.orderBy | 27 | 36.528 | 9.99× |
| Array.prototype.sort, decorated | 26 | 39.064 | 10.69× |
| remeda.sortBy | 24 | 41.039 | 11.23× |
| lodash.orderBy | 24 | 41.955 | 11.47× |
| ramda.sortWith | 17 | 57.716 | 15.80× |
| sort-array | 16 | 63.741 | 17.43× |
| just-sort-by (different order) | 12 | 81.292 | 22.21× |
| natural-orderby (different order) | 7 | 138.317 | 37.85× |
| sort-on (different order) | 3 | 320.375 | 87.64× |
| sort-by | 0 | 2157.260 | 590.93× |

#### 100,000 rows, integer key, 10% null

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 307 | 3.302 | 1.00× |
| underscore.sortBy (different order) | 52 | 19.458 | 5.92× |
| just-sort-by (different order) | 38 | 26.137 | 8.02× |
| thenby (different order) | 38 | 26.181 | 8.03× |
| fast-sort | 37 | 27.075 | 8.31× |
| es-toolkit.orderBy | 35 | 28.342 | 8.69× |
| remeda.sortBy (different order) | 33 | 30.271 | 9.29× |
| lodash.orderBy | 32 | 31.444 | 9.63× |
| Array.prototype.sort, decorated | 32 | 31.702 | 9.68× |
| ramda.sortWith (different order) | 20 | 50.929 | 15.63× |
| sort-array | 19 | 52.959 | 16.23× |
| natural-orderby | 13 | 78.716 | 24.12× |
| sort-on | 3 | 302.974 | 92.86× |
| sort-by (different order) | 0 | 2299.617 | 705.87× |

#### 100,000 rows, three keys, mixed directions

| library | ops/sec | mean ms | vs fast-multisort |
|---|---:|---:|---:|
| fast-multisort | 90 | 11.184 | 1.00× |
| es-toolkit.orderBy | 19 | 53.937 | 4.83× |
| thenby (different order) | 17 | 57.474 | 5.15× |
| remeda.sortBy (different order) | 17 | 58.217 | 5.22× |
| lodash.orderBy | 17 | 58.357 | 5.23× |
| Array.prototype.sort, decorated | 16 | 62.947 | 5.57× |
| fast-sort (different order) | 15 | 68.498 | 6.13× |
| ramda.sortWith (different order) | 12 | 85.636 | 7.68× |
| sort-array (different order) | 11 | 94.425 | 8.45× |
| natural-orderby (different order) | 4 | 280.447 | 25.15× |
| sort-on (different order) | 2 | 472.404 | 42.35× |
| sort-by (different order) | 0 | 3426.794 | 307.64× |

Apple M5 Max, 18 cores, 128 GB, Darwin 27.2.0, Node v24.21.0
