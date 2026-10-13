#### Chromium 149.0.7827.55

| case | fast-multisort ms | runner-up | runner-up ms | lead |
|---|---:|---|---:|---:|
| 1,000 rows, string key, 10 distinct values | 0.051 | remeda.sortBy | 0.088 | 1.73× |
| 1,000 rows, string key, all unique | 0.075 | remeda.sortBy | 0.187 | 2.50× |
| 1,000 rows, integer key, 10% null | 0.034 | fast-sort | 0.148 | 4.40× |
| 1,000 rows, float key | 0.041 | remeda.sortBy | 0.167 | 4.07× |
| 1,000 rows, ISO date string key | 0.071 | thenby | 0.189 | 2.68× |
| 1,000 rows, already sorted integer key | 0.007 | thenby | 0.013 | 2.00× |
| 1,000 rows, three keys, mixed directions | 0.087 | es-toolkit.orderBy | 0.203 | 2.33× |
| 10,000 rows, string key, 10 distinct values | 0.340 | thenby | 2.527 | 7.43× |
| 10,000 rows, string key, all unique | 1.100 | thenby | 3.007 | 2.73× |
| 10,000 rows, integer key, 10% null | 0.277 | thenby | 1.970 | 7.12× |
| 10,000 rows, float key | 0.337 | thenby | 2.380 | 7.07× |
| 10,000 rows, ISO date string key | 1.257 | thenby | 2.733 | 2.18× |
| 10,000 rows, already sorted integer key | 0.073 | thenby | 0.133 | 1.82× |
| 10,000 rows, three keys, mixed directions | 0.743 | es-toolkit.orderBy | 3.097 | 4.17× |

#### WebKit 26.5

| case | fast-multisort ms | runner-up | runner-up ms | lead |
|---|---:|---|---:|---:|
| 1,000 rows, string key, 10 distinct values | 0.060 | remeda.sortBy | 0.097 | 1.61× |
| 1,000 rows, string key, all unique | 0.070 | thenby | 0.093 | 1.33× |
| 1,000 rows, integer key, 10% null | 0.027 | remeda.sortBy | 0.073 | 2.75× |
| 1,000 rows, float key | 0.027 | thenby | 0.100 | 3.75× |
| 1,000 rows, ISO date string key | 0.073 | thenby | 0.143 | 1.95× |
| 1,000 rows, already sorted integer key | 0.003 | thenby | 0.007 | 2.00× |
| 1,000 rows, three keys, mixed directions | 0.073 | remeda.sortBy | 0.157 | 2.14× |
| 10,000 rows, string key, 10 distinct values | 0.300 | thenby | 2.133 | 7.11× |
| 10,000 rows, string key, all unique | 0.967 | thenby | 2.100 | 2.17× |
| 10,000 rows, integer key, 10% null | 0.233 | remeda.sortBy | 1.333 | 5.71× |
| 10,000 rows, float key | 0.233 | remeda.sortBy | 1.667 | 7.14× |
| 10,000 rows, ISO date string key | 1.033 | thenby | 2.367 | 2.29× |
| 10,000 rows, already sorted integer key | 0.033 | thenby | 0.067 | 2.00× |
| 10,000 rows, three keys, mixed directions | 0.533 | remeda.sortBy | 2.700 | 5.06× |
