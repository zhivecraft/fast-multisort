#### Chromium 149.0.7827.55

| case | fast-multisort ms | runner-up | runner-up ms | lead |
|---|---:|---|---:|---:|
| 1,000 rows, string key, 10 distinct values | 0.050 | thenby | 0.084 | 1.68× |
| 1,000 rows, string key, all unique | 0.071 | lodash.orderBy | 0.189 | 2.64× |
| 1,000 rows, integer key, 10% null | 0.035 | thenby | 0.152 | 4.38× |
| 1,000 rows, float key | 0.037 | remeda.sortBy | 0.170 | 4.63× |
| 1,000 rows, ISO date string key | 0.070 | thenby | 0.188 | 2.69× |
| 1,000 rows, already sorted integer key | 0.009 | thenby | 0.014 | 1.52× |
| 1,000 rows, three keys, mixed directions | 0.091 | es-toolkit.orderBy | 0.208 | 2.28× |
| 10,000 rows, string key, 10 distinct values | 0.330 | thenby | 2.570 | 7.79× |
| 10,000 rows, string key, all unique | 1.070 | thenby | 3.077 | 2.88× |
| 10,000 rows, integer key, 10% null | 0.287 | thenby | 2.007 | 7.00× |
| 10,000 rows, float key | 0.307 | thenby | 2.377 | 7.75× |
| 10,000 rows, ISO date string key | 1.250 | thenby | 2.697 | 2.16× |
| 10,000 rows, already sorted integer key | 0.087 | thenby | 0.137 | 1.58× |
| 10,000 rows, three keys, mixed directions | 0.813 | es-toolkit.orderBy | 3.123 | 3.84× |

#### WebKit 26.5

| case | fast-multisort ms | runner-up | runner-up ms | lead |
|---|---:|---|---:|---:|
| 1,000 rows, string key, 10 distinct values | 0.060 | thenby | 0.087 | 1.44× |
| 1,000 rows, string key, all unique | 0.073 | thenby | 0.093 | 1.27× |
| 1,000 rows, integer key, 10% null | 0.027 | thenby | 0.073 | 2.75× |
| 1,000 rows, float key | 0.027 | thenby | 0.100 | 3.75× |
| 1,000 rows, ISO date string key | 0.070 | thenby | 0.137 | 1.95× |
| 1,000 rows, already sorted integer key | 0.003 | thenby | 0.007 | 2.00× |
| 1,000 rows, three keys, mixed directions | 0.073 | es-toolkit.orderBy | 0.160 | 2.18× |
| 10,000 rows, string key, 10 distinct values | 0.300 | thenby | 2.067 | 6.89× |
| 10,000 rows, string key, all unique | 0.967 | thenby | 2.133 | 2.21× |
| 10,000 rows, integer key, 10% null | 0.233 | remeda.sortBy | 1.300 | 5.57× |
| 10,000 rows, float key | 0.233 | thenby | 1.667 | 7.14× |
| 10,000 rows, ISO date string key | 1.067 | thenby | 2.367 | 2.22× |
| 10,000 rows, already sorted integer key | 0.033 | thenby | 0.067 | 2.00× |
| 10,000 rows, three keys, mixed directions | 0.533 | thenby | 2.600 | 4.88× |
