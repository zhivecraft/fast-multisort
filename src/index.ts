export type SortIteratee<T> = ((item: T) => unknown) | (keyof T & string);
export type SortOrder = "asc" | "desc";

export type SortColumn = {
  keys: unknown[];
  desc: boolean;
  specialClass: (key: unknown) => number;
  specialsFirst: boolean;
  compare?: (a: unknown, b: unknown) => number;
};

const lodashSpecialClass = (key: unknown): number => {
  if (key === null) {
    return 2;
  }
  if (key === undefined) {
    return 3;
  }
  if (Number.isNaN(key)) {
    return 4;
  }
  return typeof key === "symbol" ? 1 : 0;
};

const compareMixed = (value: unknown, other: unknown): number => {
  const valIsDefined = value !== undefined;
  const valIsNull = value === null;
  const valIsReflexive = !Number.isNaN(value);
  const valIsSymbol = typeof value === "symbol";
  const othIsDefined = other !== undefined;
  const othIsNull = other === null;
  const othIsReflexive = !Number.isNaN(other);
  const othIsSymbol = typeof other === "symbol";
  if (
    (!othIsNull && !othIsSymbol && !valIsSymbol && (value as number) > (other as number)) ||
    (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
    (valIsNull && othIsDefined && othIsReflexive) ||
    (!valIsDefined && othIsReflexive) ||
    !valIsReflexive
  ) {
    return 1;
  }
  if (
    (!valIsNull && !valIsSymbol && !othIsSymbol && (value as number) < (other as number)) ||
    (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
    (othIsNull && valIsDefined && valIsReflexive) ||
    (!othIsDefined && valIsReflexive) ||
    !othIsReflexive
  ) {
    return -1;
  }
  return 0;
};

export const compareAscending = (value: unknown, other: unknown): number => {
  if (value === other) {
    return 0;
  }
  if (typeof value === "string" && typeof other === "string") {
    return value > other ? 1 : -1;
  }
  if (typeof value === "number" && typeof other === "number") {
    if (Number.isNaN(value)) {
      return 1;
    }
    if (Number.isNaN(other)) {
      return -1;
    }
    return value > other ? 1 : -1;
  }
  return compareMixed(value, other);
};

const byNumber = (a: number, b: number) => a - b;

type Sink = {out: Uint32Array; pos: number};

const SMALL = 24;
const RADIX_MIN = 64;
const RADIX_BITS = 11;
const RADIX_MASK = (1 << RADIX_BITS) - 1;
const POOL_MAX = 1 << 17;
const counts = new Uint32Array(1 << RADIX_BITS);

type Pool = {
  values: Float64Array;
  lo: Uint32Array;
  hi: Uint32Array;
  order: Uint32Array;
  tmp: Uint32Array;
  next: Int32Array;
  tail: Int32Array;
};

const makePool = (size: number): Pool => ({
  values: new Float64Array(size),
  lo: new Uint32Array(size),
  hi: new Uint32Array(size),
  order: new Uint32Array(size),
  tmp: new Uint32Array(size),
  next: new Int32Array(size),
  tail: new Int32Array(size),
});

const pools: Pool[] = [];

const poolAt = (depth: number, n: number): Pool => {
  if (n > POOL_MAX) {
    return makePool(n);
  }
  let pool = pools[depth];
  if (pool === undefined || pool.values.length < n) {
    pool = makePool(Math.max(n, 1024, pool === undefined ? 0 : pool.values.length * 2));
    pools[depth] = pool;
  }
  return pool;
};

const radixPass = (words: Uint32Array, shift: number, mask: number, from: Uint32Array, to: Uint32Array, n: number) => {
  counts.fill(0, 0, mask + 1);
  const first = (words[from[0]] >>> shift) & mask;
  let varies = false;
  for (let i = 0; i < n; i++) {
    const digit = (words[from[i]] >>> shift) & mask;
    if (digit !== first) {
      varies = true;
    }
    counts[digit]++;
  }
  if (!varies) {
    return false;
  }
  let sum = 0;
  for (let d = 0; d <= mask; d++) {
    const c = counts[d];
    counts[d] = sum;
    sum += c;
  }
  for (let i = 0; i < n; i++) {
    const k = from[i];
    to[counts[(words[k] >>> shift) & mask]++] = k;
  }
  return true;
};

const radixOrder = (pool: Pool, n: number): Uint32Array => {
  const {values, lo, hi} = pool;
  const raw = new Uint32Array(values.buffer, 0, n * 2);
  for (let i = 0; i < n; i++) {
    const l = raw[2 * i];
    const h = raw[2 * i + 1];
    if (h >>> 31) {
      lo[i] = ~l >>> 0;
      hi[i] = ~h >>> 0;
    } else {
      lo[i] = l;
      hi[i] = (h ^ 0x80000000) >>> 0;
    }
  }
  let order = pool.order;
  let tmp = pool.tmp;
  for (let i = 0; i < n; i++) {
    order[i] = i;
  }
  for (let p = 0; p < 6; p++) {
    const digit = p % 3;
    const shift = digit * RADIX_BITS;
    const mask = digit === 2 ? 0x3ff : RADIX_MASK;
    if (radixPass(p < 3 ? lo : hi, shift, mask, order, tmp, n)) {
      const t = order;
      order = tmp;
      tmp = t;
    }
  }
  return order;
};

const compareClasses = (a: number, b: number) => (a === 0 ? -1 : b === 0 ? 1 : a - b);

const WINDOW_MIN = 256;
const WINDOW = 8;
const WINDOW_SMALL = 64;
const WINDOW_SCAN = 64;

type StringPool = {hi: Uint32Array; lo: Uint32Array; order: Uint32Array; tmp: Uint32Array};

const stringPools: StringPool[] = [];

const stringPoolAt = (depth: number, n: number): StringPool => {
  let pool = stringPools[depth];
  if (pool === undefined || pool.hi.length < n) {
    const size = Math.max(n, 1024, pool === undefined ? 0 : pool.hi.length * 2);
    pool = {hi: new Uint32Array(size), lo: new Uint32Array(size), order: new Uint32Array(size), tmp: new Uint32Array(size)};
    stringPools[depth] = pool;
  }
  return pool;
};

const codeAt = (s: string, p: number) => (p < s.length ? s.charCodeAt(p) + 1 : 0);

const varyingPositions = (strings: string[], idx: Uint32Array, n: number, offset: number, positions: Int32Array): number => {
  const first = strings[idx[0]];
  let found = 0;
  for (let p = offset; p < offset + WINDOW_SCAN && found < WINDOW; p++) {
    const code = codeAt(first, p);
    for (let i = 1; i < n; i++) {
      if (codeAt(strings[idx[i]], p) !== code) {
        positions[found++] = p;
        break;
      }
    }
  }
  return found;
};

const packWindow = (s: string, positions: Int32Array, from: number, to: number): number => {
  let packed = 0;
  for (let q = from; q < to; q++) {
    const code = codeAt(s, positions[q]);
    if (code > 0xff) {
      return -1;
    }
    packed = (packed << 8) | code;
  }
  return packed >>> 0;
};

const positionsPool: Int32Array[] = [];

const windowSort = (strings: string[], idx: Uint32Array, n: number, offset: number, depth: number, sorted: string[], sink: Sink): boolean => {
  if (n <= WINDOW_SMALL) {
    const run = new Array<string>(n);
    for (let i = 0; i < n; i++) {
      run[i] = strings[idx[i]];
    }
    run.sort();
    for (let i = 0; i < n; i++) {
      sorted[sink.pos++] = run[i];
    }
    return true;
  }
  const positions = (positionsPool[depth] ??= new Int32Array(WINDOW));
  let found = 0;
  let scanFrom = offset;
  for (;;) {
    found = varyingPositions(strings, idx, n, scanFrom, positions);
    if (found > 0) {
      break;
    }
    let ended = true;
    for (let i = 0; i < n && ended; i++) {
      ended = strings[idx[i]].length <= scanFrom + WINDOW_SCAN;
    }
    if (ended) {
      for (let i = 0; i < n; i++) {
        sorted[sink.pos++] = strings[idx[i]];
      }
      return true;
    }
    scanFrom += WINDOW_SCAN;
  }
  for (let q = found; q < WINDOW; q++) {
    positions[q] = -1;
  }
  const next = positions[found - 1] + 1;
  const pool = stringPoolAt(depth, n);
  const {hi, lo} = pool;
  for (let i = 0; i < n; i++) {
    const s = strings[idx[i]];
    const h = packWindow(s, positions, 0, 4);
    const l = packWindow(s, positions, 4, WINDOW);
    if (h < 0 || l < 0) {
      return false;
    }
    hi[i] = h;
    lo[i] = l;
  }
  let order = pool.order;
  let tmp = pool.tmp;
  for (let i = 0; i < n; i++) {
    order[i] = i;
  }
  for (let p = 0; p < 6; p++) {
    const digit = p % 3;
    const shift = digit * RADIX_BITS;
    const mask = digit === 2 ? 0x3ff : RADIX_MASK;
    if (radixPass(p < 3 ? lo : hi, shift, mask, order, tmp, n)) {
      const t = order;
      order = tmp;
      tmp = t;
    }
  }
  let runStart = 0;
  for (let t = 1; t <= n; t++) {
    if (t === n || hi[order[t]] !== hi[order[runStart]] || lo[order[t]] !== lo[order[runStart]]) {
      if (t - runStart === 1) {
        sorted[sink.pos++] = strings[idx[order[runStart]]];
      } else {
        const run = new Uint32Array(t - runStart);
        for (let q = runStart; q < t; q++) {
          run[q - runStart] = idx[order[q]];
        }
        if (!windowSort(strings, run, run.length, next, depth + 1, sorted, sink)) {
          return false;
        }
      }
      runStart = t;
    }
  }
  return true;
};

const sortUniqueStrings = (strings: string[]) => {
  const n = strings.length;
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    idx[i] = i;
  }
  const sorted = new Array<string>(n);
  if (!windowSort(strings, idx, n, 0, 0, sorted, {out: idx, pos: 0})) {
    strings.sort();
    return;
  }
  for (let i = 0; i < n; i++) {
    strings[i] = sorted[i];
  }
};

const comparatorFrom = (columns: SortColumn[], c: number) => (a: number, b: number) => {
  for (let d = c; d < columns.length; d++) {
    const {keys, desc, specialClass, specialsFirst, compare} = columns[d];
    const classA = specialClass(keys[a]);
    const classB = specialClass(keys[b]);
    if (classA !== classB) {
      const result = compareClasses(classA, classB);
      return specialsFirst ? -result : result;
    }
    const keyA = keys[a];
    const result =
      classA === 0 ? (compare ?? compareAscending)(keyA, keys[b]) : Number.isNaN(keyA) ? compareAscending(keyA, keys[b]) : 0;
    if (result !== 0) {
      return desc ? -result : result;
    }
  }
  return 0;
};

const isFastColumn = ({keys, specialClass}: SortColumn): boolean => {
  let kind = 0;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (Number.isNaN(key)) {
      return false;
    }
    if (specialClass(key) !== 0) {
      continue;
    }
    const type = typeof key;
    if (type === "number") {
      if (kind === 2) {
        return false;
      }
      kind = 1;
    } else if (type === "string") {
      if (kind === 1) {
        return false;
      }
      kind = 2;
    } else {
      return false;
    }
  }
  return true;
};

const emitBucket = (bucket: number[], columns: SortColumn[], c: number, sink: Sink): void => {
  if (c < columns.length && bucket.length > 1) {
    sortInto(bucket, columns, c, sink);
    return;
  }
  for (let t = 0; t < bucket.length; t++) {
    sink.out[sink.pos++] = bucket[t];
  }
};

const emitSlice = (
  sorted: number[],
  start: number,
  end: number,
  columns: SortColumn[],
  c: number,
  sink: Sink
): void => {
  if (c < columns.length && end - start > 1) {
    sortInto(sorted.slice(start, end), columns, c, sink);
    return;
  }
  for (let t = start; t < end; t++) {
    sink.out[sink.pos++] = sorted[t];
  }
};

const emitRun = (
  comparable: number[],
  order: Uint32Array,
  start: number,
  end: number,
  columns: SortColumn[],
  c: number,
  sink: Sink
): void => {
  if (c < columns.length && end - start > 1) {
    const bucket = new Array<number>(end - start);
    for (let t = start; t < end; t++) {
      bucket[t - start] = comparable[order[t]];
    }
    sortInto(bucket, columns, c, sink);
    return;
  }
  for (let t = start; t < end; t++) {
    sink.out[sink.pos++] = comparable[order[t]];
  }
};

const emitChain = (head: number, next: Int32Array, columns: SortColumn[], c: number, sink: Sink): void => {
  if (next[head] === -1) {
    sink.out[sink.pos++] = head;
    return;
  }
  if (c < columns.length) {
    const bucket: number[] = [];
    for (let i = head; i !== -1; i = next[i]) {
      bucket.push(i);
    }
    sortInto(bucket, columns, c, sink);
    return;
  }
  for (let i = head; i !== -1; i = next[i]) {
    sink.out[sink.pos++] = i;
  }
};

const emitSpecials = (classes: number[][], columns: SortColumn[], c: number, first: boolean, sink: Sink) => {
  if (first) {
    for (let cls = classes.length - 1; cls >= 1; cls--) {
      const bucket = classes[cls];
      if (bucket !== undefined) {
        emitBucket(bucket, columns, c, sink);
      }
    }
  } else {
    for (let cls = 1; cls < classes.length; cls++) {
      const bucket = classes[cls];
      if (bucket !== undefined) {
        emitBucket(bucket, columns, c, sink);
      }
    }
  }
};

const sortSmall = (comparable: number[], columns: SortColumn[], c: number, sink: Sink) => {
  const {keys, desc} = columns[c];
  const n = comparable.length;
  const sorted = comparable.slice();
  for (let t = 1; t < n; t++) {
    const i = sorted[t];
    const key = keys[i] as number;
    let u = t - 1;
    while (u >= 0 && (keys[sorted[u]] as number) > key) {
      sorted[u + 1] = sorted[u];
      u--;
    }
    sorted[u + 1] = i;
  }
  const nextColumn = c + 1;
  if (desc) {
    let end = n;
    for (let t = n - 1; t >= 0; t--) {
      if (t === 0 || keys[sorted[t - 1]] !== keys[sorted[t]]) {
        emitSlice(sorted, t, end, columns, nextColumn, sink);
        end = t;
      }
    }
  } else {
    let start = 0;
    for (let t = 1; t <= n; t++) {
      if (t === n || keys[sorted[t]] !== keys[sorted[start]]) {
        emitSlice(sorted, start, t, columns, nextColumn, sink);
        start = t;
      }
    }
  }
};

const sortNumbers = (comparable: number[], columns: SortColumn[], c: number, sink: Sink) => {
  const {keys, desc} = columns[c];
  const n = comparable.length;
  const pool = poolAt(c, n);
  const values = pool.values;
  for (let t = 0; t < n; t++) {
    const v = keys[comparable[t]] as number;
    values[t] = v === 0 ? 0 : v;
  }
  const order = radixOrder(pool, n);
  const nextColumn = c + 1;
  if (desc) {
    let end = n;
    for (let t = n - 1; t >= 0; t--) {
      if (t === 0 || values[order[t - 1]] !== values[order[t]]) {
        emitRun(comparable, order, t, end, columns, nextColumn, sink);
        end = t;
      }
    }
  } else {
    let start = 0;
    for (let t = 1; t <= n; t++) {
      if (t === n || values[order[t]] !== values[order[start]]) {
        emitRun(comparable, order, start, t, columns, nextColumn, sink);
        start = t;
      }
    }
  }
};

const sortBuckets = (comparable: number[], columns: SortColumn[], c: number, strings: boolean, sink: Sink) => {
  const {keys, desc} = columns[c];
  const n = comparable.length;
  const {next, tail} = poolAt(c, keys.length);
  const heads = new Map<unknown, number>();
  for (let t = 0; t < n; t++) {
    const i = comparable[t];
    const key = keys[i];
    const head = heads.get(key);
    next[i] = -1;
    if (head === undefined) {
      heads.set(key, i);
      tail[i] = i;
    } else {
      next[tail[head]] = i;
      tail[head] = i;
    }
  }
  const unique = Array.from(heads.keys());
  if (strings) {
    if (unique.length >= WINDOW_MIN) {
      sortUniqueStrings(unique as string[]);
    } else {
      (unique as string[]).sort();
    }
  } else {
    (unique as number[]).sort(byNumber);
  }
  const nextColumn = c + 1;
  if (desc) {
    for (let u = unique.length - 1; u >= 0; u--) {
      emitChain(heads.get(unique[u])!, next, columns, nextColumn, sink);
    }
  } else {
    for (let u = 0; u < unique.length; u++) {
      emitChain(heads.get(unique[u])!, next, columns, nextColumn, sink);
    }
  }
};

const sortedRuns = (comparable: number[], columns: SortColumn[], c: number, sink: Sink): boolean => {
  const {keys, desc} = columns[c];
  const n = comparable.length;
  let ascending = true;
  let descending = true;
  for (let t = 1; t < n && (ascending || descending); t++) {
    const prev = keys[comparable[t - 1]] as number;
    const next = keys[comparable[t]] as number;
    if (prev > next) {
      ascending = false;
    } else if (prev < next) {
      descending = false;
    }
  }
  if (!ascending && !descending) {
    return false;
  }
  const nextColumn = c + 1;
  if (ascending === !desc) {
    let start = 0;
    for (let t = 1; t <= n; t++) {
      if (t === n || keys[comparable[t]] !== keys[comparable[start]]) {
        emitSlice(comparable, start, t, columns, nextColumn, sink);
        start = t;
      }
    }
    return true;
  }
  let end = n;
  for (let t = n - 1; t >= 0; t--) {
    if (t === 0 || keys[comparable[t - 1]] !== keys[comparable[t]]) {
      emitSlice(comparable, t, end, columns, nextColumn, sink);
      end = t;
    }
  }
  return true;
};

const sortInto = (indices: number[], columns: SortColumn[], c: number, sink: Sink): void => {
  const column = columns[c];
  const {keys, specialClass, specialsFirst} = column;
  let classes: number[][] | null = null;
  let comparable = indices;
  let numbers = false;
  let seen = false;
  for (let t = 0; t < indices.length; t++) {
    const i = indices[t];
    const key = keys[i];
    const cls = specialClass(key);
    if (cls !== 0) {
      if (classes === null) {
        classes = [];
        comparable = indices.slice(0, t);
      }
      (classes[cls] ??= []).push(i);
      continue;
    }
    if (classes !== null) {
      comparable.push(i);
    }
    if (!seen) {
      seen = true;
      numbers = typeof key === "number";
    }
  }
  if (classes !== null && specialsFirst) {
    emitSpecials(classes, columns, c + 1, true, sink);
  }
  const n = comparable.length;
  if (n === 1) {
    sink.out[sink.pos++] = comparable[0];
  } else if (n > 1) {
    if (column.compare !== undefined) {
      const sorted = comparable.slice().sort(comparatorFrom(columns, c));
      for (let t = 0; t < n; t++) {
        sink.out[sink.pos++] = sorted[t];
      }
    } else if (n <= SMALL) {
      sortSmall(comparable, columns, c, sink);
    } else if (sortedRuns(comparable, columns, c, sink)) {
      return;
    } else if (numbers && n >= RADIX_MIN) {
      sortNumbers(comparable, columns, c, sink);
    } else {
      sortBuckets(comparable, columns, c, !numbers, sink);
    }
  }
  if (classes !== null && !specialsFirst) {
    emitSpecials(classes, columns, c + 1, false, sink);
  }
};

const TINY = 128;

const isPlainColumn = ({keys, specialClass, compare}: SortColumn) => {
  if (compare !== undefined) {
    return false;
  }
  const kind = typeof keys[0];
  if (kind !== "number" && kind !== "string") {
    return false;
  }
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (typeof key !== kind || specialClass(key) !== 0 || Number.isNaN(key)) {
      return false;
    }
  }
  return true;
};

const tinyComparator = (columns: SortColumn[]) => {
  if (!columns.every(isPlainColumn)) {
    return comparatorFrom(columns, 0);
  }
  if (columns.length === 1) {
    const {keys, desc} = columns[0];
    return desc
      ? (a: number, b: number) => {
          const x = keys[a] as number;
          const y = keys[b] as number;
          return x < y ? 1 : x > y ? -1 : 0;
        }
      : (a: number, b: number) => {
          const x = keys[a] as number;
          const y = keys[b] as number;
          return x < y ? -1 : x > y ? 1 : 0;
        };
  }
  return (a: number, b: number) => {
    for (let c = 0; c < columns.length; c++) {
      const {keys, desc} = columns[c];
      const x = keys[a] as number;
      const y = keys[b] as number;
      if (x !== y) {
        return (x < y) === desc ? 1 : -1;
      }
    }
    return 0;
  };
};

const orderedCopy = <T>(items: readonly T[], column: SortColumn): T[] | null => {
  const {keys, desc, specialClass} = column;
  const n = keys.length;
  const first = keys[0];
  const kind = typeof first;
  if ((kind !== "number" && kind !== "string") || specialClass(first) !== 0 || Number.isNaN(first)) {
    return null;
  }
  let nonDecreasing = true;
  let nonIncreasing = true;
  let strict = true;
  for (let i = 1; i < n; i++) {
    const key = keys[i];
    if (typeof key !== kind || specialClass(key) !== 0 || Number.isNaN(key)) {
      return null;
    }
    const prev = keys[i - 1] as number;
    const next = key as number;
    if (prev > next) {
      nonDecreasing = false;
    } else if (prev < next) {
      nonIncreasing = false;
    } else {
      strict = false;
    }
    if (!nonDecreasing && !nonIncreasing) {
      return null;
    }
  }
  if (desc ? nonIncreasing : nonDecreasing) {
    return items.slice();
  }
  if (strict) {
    const result = new Array<T>(n);
    for (let i = 0; i < n; i++) {
      result[i] = items[n - 1 - i];
    }
    return result;
  }
  return null;
};

export const orderByColumns = <T>(items: readonly T[], columns: SortColumn[]): T[] => {
  const n = items.length;
  if (n < 2) {
    return items.slice();
  }
  if (columns.length === 1) {
    const ordered = orderedCopy(items, columns[0]);
    if (ordered !== null) {
      return ordered;
    }
  }
  const indices = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    indices[i] = i;
  }
  if (n <= TINY) {
    return indices.sort(tinyComparator(columns)).map((i) => items[i]);
  }
  if (!columns.every(isFastColumn)) {
    return indices.sort(comparatorFrom(columns, 0)).map((i) => items[i]);
  }
  const sink = {out: new Uint32Array(n), pos: 0};
  sortInto(indices, columns, 0, sink);
  const out = sink.out;
  const result = new Array<T>(n);
  for (let i = 0; i < n; i++) {
    result[i] = items[out[i]];
  }
  return result;
};

const toGetter = <T>(iteratee: SortIteratee<T>) =>
  typeof iteratee === "function" ? iteratee : (item: T) => item[iteratee];

export const orderBy = <T>(
  items: readonly T[],
  iteratees: readonly SortIteratee<T>[],
  orders: readonly SortOrder[] = []
): T[] => {
  const getters = iteratees.length === 0 ? [(item: T) => item] : iteratees.map(toGetter);
  return orderByColumns(
    items,
    getters.map((get, c) => {
      const desc = orders[c] === "desc";
      return {keys: items.map(get), desc, specialClass: lodashSpecialClass, specialsFirst: desc};
    })
  );
};

export const sortBy = <T>(
  items: readonly T[],
  ...iteratees: Array<SortIteratee<T> | readonly SortIteratee<T>[]>
): T[] => orderBy(items, iteratees.flat() as SortIteratee<T>[]);

export type NullsOrder = "first" | "last";

export type SortRule<T> = {
  by: SortIteratee<T>;
  order?: SortOrder;
  nulls?: NullsOrder;
};

const nullClass = (key: unknown): number => (key === null || key === undefined ? 1 : 0);

export const multisort = <T>(items: readonly T[], rules: readonly SortRule<T>[]): T[] =>
  orderByColumns(
    items,
    rules.map(({by, order, nulls}) => {
      const desc = order === "desc";
      const get = toGetter(by);
      return {
        keys: items.map(get),
        desc,
        specialClass: nullClass,
        specialsFirst: nulls === undefined ? desc : nulls === "first",
      };
    })
  );
