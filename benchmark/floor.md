| rows | case | fast-multisort µs | getters + copy µs | inline toSorted µs | floor / inline |
|---:|---|---:|---:|---:|---:|
| 10 | string key, 10 distinct values | 0.181 | 0.049 | 0.216 | 0.23× |
| 10 | string key, all unique | 0.267 | 0.048 | 0.333 | 0.14× |
| 10 | integer key, 10% null | 0.144 | 0.049 | 0.171 | 0.29× |
| 10 | float key | 0.162 | 0.053 | 0.187 | 0.28× |
| 10 | ISO date string key | 0.218 | 0.048 | 0.253 | 0.19× |
| 10 | already sorted integer key | 0.072 | 0.048 | 0.083 | 0.57× |
| 10 | reverse sorted integer key | 0.068 | 0.048 | 0.087 | 0.55× |
| 10 | ordered list, one row moved | 0.138 | 0.049 | 0.149 | 0.33× |
| 10 | three keys, mixed directions | 0.454 | 0.121 | 0.220 | 0.55× |
| 100 | string key, 10 distinct values | 2.545 | 0.432 | 4.126 | 0.10× |
| 100 | string key, all unique | 4.738 | 0.439 | 4.915 | 0.09× |
| 100 | integer key, 10% null | 3.988 | 0.455 | 3.497 | 0.13× |
| 100 | float key | 4.573 | 0.472 | 3.809 | 0.12× |
| 100 | ISO date string key | 6.375 | 0.425 | 4.941 | 0.09× |
| 100 | already sorted integer key | 0.541 | 0.422 | 0.548 | 0.77× |
| 100 | reverse sorted integer key | 0.553 | 0.428 | 0.581 | 0.74× |
| 100 | ordered list, one row moved | 1.103 | 0.450 | 0.914 | 0.49× |
| 100 | three keys, mixed directions | 6.231 | 1.197 | 4.746 | 0.25× |
| 10,000 | string key, 10 distinct values | 219.9 | 44.2 | 775.1 | 0.06× |
| 10,000 | string key, all unique | 1116.9 | 44.5 | 1938.0 | 0.02× |
| 10,000 | integer key, 10% null | 272.1 | 50.8 | 1052.0 | 0.05× |
| 10,000 | float key | 289.5 | 49.8 | 1407.4 | 0.04× |
| 10,000 | ISO date string key | 1261.0 | 44.3 | 2014.2 | 0.02× |
| 10,000 | already sorted integer key | 54.2 | 43.7 | 53.1 | 0.82× |
| 10,000 | reverse sorted integer key | 55.2 | 43.0 | 55.6 | 0.77× |
| 10,000 | ordered list, one row moved | 77.0 | 46.5 | 60.0 | 0.77× |
| 10,000 | three keys, mixed directions | 686.2 | 128.0 | 1466.2 | 0.09× |
| 100,000 | string key, 10 distinct values | 2510.6 | 536.4 | 9006.6 | 0.06× |
| 100,000 | string key, all unique | 15720.0 | 537.8 | 29553.5 | 0.02× |
| 100,000 | integer key, 10% null | 3172.9 | 592.3 | 14733.3 | 0.04× |
| 100,000 | float key | 3064.5 | 606.6 | 20589.7 | 0.03× |
| 100,000 | ISO date string key | 18849.4 | 550.4 | 31014.0 | 0.02× |
| 100,000 | already sorted integer key | 644.4 | 534.4 | 649.7 | 0.82× |
| 100,000 | reverse sorted integer key | 666.6 | 559.2 | 690.1 | 0.81× |
| 100,000 | ordered list, one row moved | 832.0 | 540.7 | 687.1 | 0.79× |
| 100,000 | three keys, mixed directions | 6918.0 | 1455.2 | 20918.3 | 0.07× |

Apple M5 Max, Node v24.22.0
