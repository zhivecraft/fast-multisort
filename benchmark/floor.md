| rows | case | fast-multisort µs | getters + copy µs | inline toSorted µs | floor / inline |
|---:|---|---:|---:|---:|---:|
| 10 | string key, 10 distinct values | 0.271 | 0.047 | 0.206 | 0.23× |
| 10 | string key, all unique | 0.431 | 0.049 | 0.335 | 0.15× |
| 10 | integer key, 10% null | 0.214 | 0.048 | 0.174 | 0.28× |
| 10 | float key | 0.257 | 0.054 | 0.195 | 0.28× |
| 10 | ISO date string key | 0.337 | 0.047 | 0.253 | 0.19× |
| 10 | already sorted integer key | 0.072 | 0.047 | 0.083 | 0.57× |
| 10 | reverse sorted integer key | 0.069 | 0.047 | 0.087 | 0.55× |
| 10 | ordered list, one row moved | 0.222 | 0.049 | 0.148 | 0.33× |
| 10 | three keys, mixed directions | 0.474 | 0.126 | 0.222 | 0.57× |
| 100 | string key, 10 distinct values | 2.557 | 0.431 | 4.001 | 0.11× |
| 100 | string key, all unique | 4.630 | 0.429 | 4.908 | 0.09× |
| 100 | integer key, 10% null | 3.938 | 0.430 | 3.503 | 0.12× |
| 100 | float key | 4.555 | 0.488 | 3.951 | 0.12× |
| 100 | ISO date string key | 6.511 | 0.436 | 5.018 | 0.09× |
| 100 | already sorted integer key | 0.536 | 0.418 | 0.554 | 0.76× |
| 100 | reverse sorted integer key | 0.540 | 0.426 | 0.589 | 0.72× |
| 100 | ordered list, one row moved | 1.077 | 0.447 | 0.923 | 0.48× |
| 100 | three keys, mixed directions | 6.563 | 1.227 | 4.536 | 0.27× |
| 10,000 | string key, 10 distinct values | 227.1 | 44.3 | 780.7 | 0.06× |
| 10,000 | string key, all unique | 1079.7 | 43.8 | 1849.7 | 0.02× |
| 10,000 | integer key, 10% null | 272.9 | 48.9 | 1040.3 | 0.05× |
| 10,000 | float key | 283.7 | 48.7 | 1406.0 | 0.03× |
| 10,000 | ISO date string key | 1208.9 | 43.6 | 1930.2 | 0.02× |
| 10,000 | already sorted integer key | 54.2 | 43.4 | 52.4 | 0.83× |
| 10,000 | reverse sorted integer key | 54.1 | 42.9 | 55.6 | 0.77× |
| 10,000 | ordered list, one row moved | 73.0 | 44.1 | 58.3 | 0.76× |
| 10,000 | three keys, mixed directions | 672.9 | 123.3 | 1434.0 | 0.09× |
| 100,000 | string key, 10 distinct values | 2683.3 | 525.0 | 8767.2 | 0.06× |
| 100,000 | string key, all unique | 15830.2 | 532.2 | 29514.1 | 0.02× |
| 100,000 | integer key, 10% null | 3163.5 | 590.3 | 15153.7 | 0.04× |
| 100,000 | float key | 3177.8 | 615.1 | 20320.9 | 0.03× |
| 100,000 | ISO date string key | 17723.8 | 528.2 | 28727.9 | 0.02× |
| 100,000 | already sorted integer key | 666.2 | 525.0 | 637.0 | 0.82× |
| 100,000 | reverse sorted integer key | 660.4 | 528.0 | 668.0 | 0.79× |
| 100,000 | ordered list, one row moved | 828.2 | 543.0 | 679.0 | 0.80× |
| 100,000 | three keys, mixed directions | 7369.4 | 1439.2 | 21782.8 | 0.07× |

Apple M5 Max, Node v24.22.0
