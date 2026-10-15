| rows | case | fast-multisort µs | getters + copy µs | inline toSorted µs | floor / inline |
|---:|---|---:|---:|---:|---:|
| 10 | string key, 10 distinct values | 0.212 | 0.020 | 0.219 | 0.09× |
| 10 | string key, all unique | 0.422 | 0.050 | 0.336 | 0.15× |
| 10 | integer key, 10% null | 0.222 | 0.048 | 0.179 | 0.27× |
| 10 | float key | 0.273 | 0.054 | 0.202 | 0.27× |
| 10 | ISO date string key | 0.359 | 0.050 | 0.269 | 0.19× |
| 10 | already sorted integer key | 0.076 | 0.049 | 0.086 | 0.57× |
| 10 | reverse sorted integer key | 0.072 | 0.049 | 0.091 | 0.54× |
| 10 | ordered list, one row moved | 0.236 | 0.050 | 0.157 | 0.32× |
| 10 | three keys, mixed directions | 0.494 | 0.135 | 0.231 | 0.58× |
| 100 | string key, 10 distinct values | 2.359 | 0.444 | 4.190 | 0.11× |
| 100 | string key, all unique | 5.246 | 0.447 | 5.979 | 0.07× |
| 100 | integer key, 10% null | 4.037 | 0.479 | 3.686 | 0.13× |
| 100 | float key | 4.766 | 0.490 | 3.700 | 0.13× |
| 100 | ISO date string key | 6.543 | 0.444 | 5.273 | 0.08× |
| 100 | already sorted integer key | 0.556 | 0.432 | 0.564 | 0.77× |
| 100 | reverse sorted integer key | 0.561 | 0.435 | 0.616 | 0.71× |
| 100 | ordered list, one row moved | 1.113 | 0.458 | 0.950 | 0.48× |
| 100 | three keys, mixed directions | 6.673 | 1.249 | 4.816 | 0.26× |
| 10,000 | string key, 10 distinct values | 227.8 | 44.9 | 818.9 | 0.05× |
| 10,000 | string key, all unique | 1277.0 | 45.4 | 2286.5 | 0.02× |
| 10,000 | integer key, 10% null | 274.4 | 50.8 | 1089.5 | 0.05× |
| 10,000 | float key | 297.1 | 51.6 | 1489.7 | 0.03× |
| 10,000 | ISO date string key | 1286.3 | 45.1 | 2038.2 | 0.02× |
| 10,000 | already sorted integer key | 54.7 | 43.9 | 53.2 | 0.82× |
| 10,000 | reverse sorted integer key | 55.8 | 43.9 | 56.3 | 0.78× |
| 10,000 | ordered list, one row moved | 78.2 | 46.6 | 59.5 | 0.78× |
| 10,000 | three keys, mixed directions | 708.3 | 127.0 | 1530.2 | 0.08× |
| 100,000 | string key, 10 distinct values | 2623.8 | 558.8 | 9309.9 | 0.06× |
| 100,000 | string key, all unique | 21529.0 | 584.7 | 43715.8 | 0.01× |
| 100,000 | integer key, 10% null | 3404.7 | 629.4 | 16308.2 | 0.04× |
| 100,000 | float key | 3352.2 | 634.1 | 22700.3 | 0.03× |
| 100,000 | ISO date string key | 20266.1 | 560.4 | 36128.2 | 0.02× |
| 100,000 | already sorted integer key | 672.9 | 557.5 | 655.6 | 0.85× |
| 100,000 | reverse sorted integer key | 679.4 | 542.5 | 698.5 | 0.78× |
| 100,000 | ordered list, one row moved | 849.6 | 575.4 | 714.9 | 0.80× |
| 100,000 | three keys, mixed directions | 7529.4 | 1532.8 | 24740.6 | 0.06× |

Apple M5 Max, Node v24.22.0
