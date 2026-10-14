export type SortIteratee<T> = ((item: T) => unknown) | (keyof T & string);
export type SortOrder = "asc" | "desc";

export type SortColumn = {
  keys: unknown[];
  desc: boolean;
  specialClass: (key: unknown) => number;
  specialsFirst: boolean;
  compare?: ((a: unknown, b: unknown) => number) | undefined;
};

const isSymbol = (value: unknown): boolean =>
  typeof value === "symbol" ||
  (typeof value === "object" && value !== null && Object.prototype.toString.call(value) === "[object Symbol]");

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
  return isSymbol(key) ? 1 : 0;
};

const compareMixed = (value: unknown, other: unknown): number => {
  const valIsDefined = value !== undefined;
  const valIsNull = value === null;
  const valIsReflexive = !Number.isNaN(value);
  const valIsSymbol = isSymbol(value);
  const othIsDefined = other !== undefined;
  const othIsNull = other === null;
  const othIsReflexive = !Number.isNaN(other);
  const othIsSymbol = isSymbol(other);
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

const SMALL = 24;
const RADIX_MIN = 64;
const RADIX_BITS = 11;
const RADIX_MASK = (1 << RADIX_BITS) - 1;
const RETAIN_MAX = 1 << 17;
const IDLE_FRAMES_MAX = 4;
const counts = new Uint32Array(1 << RADIX_BITS);

type Pool = {
  values: Float64Array;
  lo: Uint32Array;
  hi: Uint32Array;
  order: Uint32Array;
  tmp: Uint32Array;
};

type Chain = {next: Int32Array; tail: Int32Array};

type Frame = {pools: Pool[]; chains: Chain[]; largest: number};

type Sink = {out: Uint32Array; pos: number; frame: Frame};

const idleFrames: Frame[] = [];

const acquireFrame = (): Frame => idleFrames.pop() ?? {pools: [], chains: [], largest: 0};

const releaseFrame = (frame: Frame) => {
  if (frame.largest <= RETAIN_MAX && idleFrames.length < IDLE_FRAMES_MAX) {
    idleFrames.push(frame);
  }
};

const grown = (frame: Frame, have: number, n: number) => {
  const size = Math.max(n, 1024, have * 2);
  frame.largest = Math.max(frame.largest, size);
  return size;
};

const poolAt = (frame: Frame, depth: number, n: number): Pool => {
  let pool = frame.pools[depth];
  if (pool === undefined || pool.values.length < n) {
    const size = grown(frame, pool === undefined ? 0 : pool.values.length, n);
    pool = {
      values: new Float64Array(size),
      lo: new Uint32Array(size),
      hi: new Uint32Array(size),
      order: new Uint32Array(size),
      tmp: new Uint32Array(size),
    };
    frame.pools[depth] = pool;
  }
  return pool;
};

const chainAt = (frame: Frame, depth: number, n: number): Chain => {
  let chain = frame.chains[depth];
  if (chain === undefined || chain.next.length < n) {
    const size = grown(frame, chain === undefined ? 0 : chain.next.length, n);
    chain = {next: new Int32Array(size), tail: new Int32Array(size)};
    frame.chains[depth] = chain;
  }
  return chain;
};

const LO = new Uint8Array(new Uint32Array([1]).buffer)[0] === 1 ? 0 : 1;
const HI = 1 - LO;

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
    const l = raw[2 * i + LO];
    const h = raw[2 * i + HI];
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

const sortUniqueStrings = (strings: string[], frame: Frame) => {
  const n = strings.length;
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    idx[i] = i;
  }
  const sorted = new Array<string>(n);
  if (!windowSort(strings, idx, n, 0, 0, sorted, {out: idx, pos: 0, frame})) {
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
      classA === 0
        ? (compare ?? compareAscending)(keyA, keys[b])
        : specialClass === lodashSpecialClass && Number.isNaN(keyA)
          ? compareAscending(keyA, keys[b])
          : 0;
    if (result < 0 || result > 0) {
      return desc ? -result : result;
    }
  }
  return 0;
};

type Classes = Map<number, number[]>;

const classBuckets = (classes: Classes, first: boolean): number[][] => {
  const ids = Array.from(classes.keys()).sort(byNumber);
  if (first) {
    ids.reverse();
  }
  return ids.map((cls) => classes.get(cls)!);
};

const fastClasses = ({keys, specialClass}: SortColumn, classes: Float64Array | null): boolean => {
  let kind = 0;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (Number.isNaN(key)) {
      return false;
    }
    const cls = specialClass(key);
    if (classes !== null) {
      classes[i] = cls;
    }
    if (cls !== 0) {
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

const isFastColumn = (column: SortColumn) => fastClasses(column, null);

const NEARLY = 64;

type Compare = (a: number, b: number) => number;

const stops = (chain: Compare, src: Uint32Array, at: number, pivot: number, pivotFirst: boolean) =>
  pivotFirst ? chain(pivot, src[at]) < 0 : !(chain(src[at], pivot) < 0);

const gallop = (chain: Compare, src: Uint32Array, from: number, to: number, pivot: number, pivotFirst: boolean) => {
  let lo = from;
  let hi = from;
  let step = 1;
  while (hi < to && !stops(chain, src, hi, pivot, pivotFirst)) {
    lo = hi + 1;
    hi += step;
    step *= 2;
  }
  hi = Math.min(hi, to);
  while (lo < hi) {
    const m = (lo + hi) >>> 1;
    if (stops(chain, src, m, pivot, pivotFirst)) {
      hi = m;
    } else {
      lo = m + 1;
    }
  }
  return lo;
};

const runBounds = (chain: Compare, n: number, limit: number) => {
  const bounds = [0];
  for (let i = 1; i < n; i++) {
    if (chain(i - 1, i) > 0) {
      if (bounds.length > limit) {
        return null;
      }
      bounds.push(i);
    }
  }
  bounds.push(n);
  return bounds;
};

const mergeRuns = (chain: Compare, runs: number[], n: number) => {
  let bounds = runs;
  let src = new Uint32Array(n);
  for (let i = 0; i < n; i++) {
    src[i] = i;
  }
  let dst = new Uint32Array(n);
  while (bounds.length > 2) {
    const next = [0];
    for (let r = 0; r < bounds.length - 1; r += 2) {
      const mid = bounds[r + 1];
      const end = r + 2 < bounds.length ? bounds[r + 2] : mid;
      let i = bounds[r];
      let j = mid;
      let o = i;
      while (i < mid && j < end) {
        const left = gallop(chain, src, i, mid, src[j], true);
        dst.set(src.subarray(i, left), o);
        o += left - i;
        i = left;
        if (i === mid) {
          break;
        }
        const right = gallop(chain, src, j, end, src[i], false);
        dst.set(src.subarray(j, right), o);
        o += right - j;
        j = right;
      }
      dst.set(src.subarray(i, mid), o);
      dst.set(src.subarray(j, end), o + mid - i);
      next.push(end);
    }
    const t = src;
    src = dst;
    dst = t;
    bounds = next;
  }
  return src;
};

const classChain = (columns: SortColumn[], classes: Float64Array[]) => {
  const keys = columns.map((column) => column.keys);
  const descs = columns.map((column) => column.desc);
  const firsts = columns.map((column) => column.specialsFirst);
  const compares = columns.map((column) => column.compare);
  return (a: number, b: number) => {
    for (let c = 0; c < keys.length; c++) {
      const ca = classes[c][a];
      const cb = classes[c][b];
      if (ca !== cb) {
        const result = compareClasses(ca, cb);
        return firsts[c] ? -result : result;
      }
      if (ca === 0) {
        const x = keys[c][a];
        const y = keys[c][b];
        const compare = compares[c];
        const result = compare === undefined ? (x === y ? 0 : (x as number) < (y as number) ? -1 : 1) : compare(x, y);
        if (result < 0 || result > 0) {
          return descs[c] ? -result : result;
        }
      }
    }
    return 0;
  };
};

const fastChain = (columns: SortColumn[], n: number) => {
  const plain = plainComparator(columns);
  if (plain !== null) {
    return plain;
  }
  const classes: Float64Array[] = [];
  for (const column of columns) {
    const cls = new Float64Array(n);
    if (!fastClasses(column, cls)) {
      return null;
    }
    classes.push(cls);
  }
  return classChain(columns, classes);
};

const roughlyOrdered = ({keys, desc, compare}: SortColumn, n: number, limit: number) => {
  if (compare !== undefined) {
    return true;
  }
  let descents = 0;
  for (let i = 1; i < n; i++) {
    const prev = keys[i - 1];
    const next = keys[i];
    const kind = typeof prev;
    if (kind !== typeof next || (kind !== "number" && kind !== "string")) {
      continue;
    }
    if ((desc ? (prev as number) < (next as number) : (prev as number) > (next as number)) && ++descents > limit) {
      return false;
    }
  }
  return true;
};

const nearlyOrdered = <T>(items: readonly T[], columns: SortColumn[]): T[] | null => {
  const n = items.length;
  if (!roughlyOrdered(columns[0], n, n / NEARLY)) {
    return null;
  }
  const chain = fastChain(columns, n);
  if (chain === null) {
    return null;
  }
  const runs = runBounds(chain, n, n / NEARLY);
  return runs === null ? null : gather(items, mergeRuns(chain, runs, n));
};

const gather = <T>(items: readonly T[], order: ArrayLike<number>) => {
  const result = new Array<T>(order.length);
  for (let i = 0; i < order.length; i++) {
    result[i] = items[order[i]];
  }
  return result;
};

const emitBucket =(bucket: number[], columns: SortColumn[], c: number, sink: Sink): void => {
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

const emitChain = (
  comparable: number[],
  head: number,
  next: Int32Array,
  columns: SortColumn[],
  c: number,
  sink: Sink
): void => {
  if (next[head] === -1) {
    sink.out[sink.pos++] = comparable[head];
    return;
  }
  if (c < columns.length) {
    const bucket: number[] = [];
    for (let t = head; t !== -1; t = next[t]) {
      bucket.push(comparable[t]);
    }
    sortInto(bucket, columns, c, sink);
    return;
  }
  for (let t = head; t !== -1; t = next[t]) {
    sink.out[sink.pos++] = comparable[t];
  }
};

const emitSpecials = (classes: Classes, columns: SortColumn[], c: number, first: boolean, sink: Sink) => {
  for (const bucket of classBuckets(classes, first)) {
    emitBucket(bucket, columns, c, sink);
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
  const pool = poolAt(sink.frame, c, n);
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
  const {next, tail} = chainAt(sink.frame, c, n);
  const heads = new Map<unknown, number>();
  for (let t = 0; t < n; t++) {
    const key = keys[comparable[t]];
    const head = heads.get(key);
    next[t] = -1;
    if (head === undefined) {
      heads.set(key, t);
      tail[t] = t;
    } else {
      next[tail[head]] = t;
      tail[head] = t;
    }
  }
  const unique = Array.from(heads.keys());
  if (strings) {
    if (unique.length >= WINDOW_MIN) {
      sortUniqueStrings(unique as string[], sink.frame);
    } else {
      (unique as string[]).sort();
    }
  } else {
    (unique as number[]).sort(byNumber);
  }
  const nextColumn = c + 1;
  if (desc) {
    for (let u = unique.length - 1; u >= 0; u--) {
      emitChain(comparable, heads.get(unique[u])!, next, columns, nextColumn, sink);
    }
  } else {
    for (let u = 0; u < unique.length; u++) {
      emitChain(comparable, heads.get(unique[u])!, next, columns, nextColumn, sink);
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
  let classes: Classes | null = null;
  let comparable = indices;
  let numbers = false;
  let seen = false;
  for (let t = 0; t < indices.length; t++) {
    const i = indices[t];
    const key = keys[i];
    const cls = specialClass(key);
    if (cls !== 0) {
      if (classes === null) {
        classes = new Map();
        comparable = indices.slice(0, t);
      }
      const bucket = classes.get(cls);
      if (bucket === undefined) {
        classes.set(cls, [i]);
      } else {
        bucket.push(i);
      }
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
      const sorted = comparable.toSorted(comparatorFrom(columns, c));
      for (let t = 0; t < n; t++) {
        sink.out[sink.pos++] = sorted[t];
      }
    } else if (n <= SMALL) {
      sortSmall(comparable, columns, c, sink);
    } else if (!sortedRuns(comparable, columns, c, sink)) {
      if (numbers && n >= RADIX_MIN) {
        sortNumbers(comparable, columns, c, sink);
      } else {
        sortBuckets(comparable, columns, c, !numbers, sink);
      }
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

const plainColumn = (keys: unknown[], desc: boolean) =>
  desc
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

const tinyComparator = (columns: SortColumn[]) => plainComparator(columns) ?? comparatorFrom(columns, 0);

const plainComparator = (columns: SortColumn[]) => {
  if (!columns.every(isPlainColumn)) {
    return null;
  }
  if (columns.length === 1) {
    return plainColumn(columns[0].keys, columns[0].desc);
  }
  const keys = columns.map((column) => column.keys);
  const descs = columns.map((column) => column.desc);
  return (a: number, b: number) => {
    for (let c = 0; c < keys.length; c++) {
      const x = keys[c][a] as number;
      const y = keys[c][b] as number;
      if (x !== y) {
        return (x < y) === descs[c] ? 1 : -1;
      }
    }
    return 0;
  };
};

const orderedColumn = <T>(items: readonly T[], {keys, desc, specialClass, compare}: SortColumn): T[] | null => {
  const n = keys.length;
  const first = keys[0];
  const kind = typeof first;
  if (compare !== undefined || (kind !== "number" && kind !== "string") || Number.isNaN(first) || specialClass(first) !== 0) {
    return null;
  }
  const custom = specialClass !== lodashSpecialClass && specialClass !== nullClass;
  let nonDecreasing = true;
  let nonIncreasing = true;
  let strict = true;
  let crowded = false;
  const runs = [0];
  const limit = n / NEARLY;
  for (let i = 1; i < n; i++) {
    const prev = keys[i - 1];
    const next = keys[i];
    if ((kind === "number" ? typeof next !== "number" || Number.isNaN(next) : typeof next !== "string") || (custom && specialClass(next) !== 0)) {
      return null;
    }
    if (kind === "number" ? (prev as number) > (next as number) : (prev as string) > (next as string)) {
      nonDecreasing = false;
      if (!desc) {
        crowded ||= addRun(runs, i, limit);
      }
    } else if (kind === "number" ? (prev as number) < (next as number) : (prev as string) < (next as string)) {
      nonIncreasing = false;
      if (desc) {
        crowded ||= addRun(runs, i, limit);
      }
    } else {
      strict = false;
    }
    if (crowded && !(strict && (desc ? nonDecreasing : nonIncreasing))) {
      return null;
    }
  }
  if (desc ? nonIncreasing : nonDecreasing) {
    return items.slice();
  }
  if (crowded) {
    const result = new Array<T>(n);
    for (let i = 0; i < n; i++) {
      result[i] = items[n - 1 - i];
    }
    return result;
  }
  runs.push(n);
  return gather(items, mergeRuns(plainColumn(keys, desc), runs, n));
};

const SAMPLE = 16;

const sampleHasDuplicates = (keys: unknown[], comparable: number[]) => {
  const limit = Math.min(SAMPLE, comparable.length);
  for (let i = 1; i < limit; i++) {
    const key = keys[comparable[i]];
    for (let j = 0; j < i; j++) {
      if (keys[comparable[j]] === key) {
        return true;
      }
    }
  }
  return false;
};

const tinyCounts = new Int32Array(258);

const tinyBucketStrings = (keys: unknown[], comparable: number[], desc: boolean, ordered: number[]): boolean => {
  const m = comparable.length;
  const first = keys[comparable[0]] as string;
  let p = 0;
  for (; p < WINDOW_SCAN; p++) {
    const code = codeAt(first, p);
    let varies = false;
    for (let t = 1; t < m; t++) {
      if (codeAt(keys[comparable[t]] as string, p) !== code) {
        varies = true;
        break;
      }
    }
    if (varies) {
      break;
    }
  }
  if (p === WINDOW_SCAN) {
    return false;
  }
  const codes = new Int32Array(m);
  const counts = tinyCounts;
  counts.fill(0);
  for (let t = 0; t < m; t++) {
    const code = codeAt(keys[comparable[t]] as string, p);
    if (code > 256) {
      return false;
    }
    codes[t] = code;
    counts[code + 1]++;
  }
  for (let d = 0; d < 257; d++) {
    counts[d + 1] += counts[d];
  }
  const order = new Array<number>(m);
  for (let t = 0; t < m; t++) {
    order[counts[codes[t]]++] = t;
  }
  const compare = desc
    ? (a: number, b: number) => {
        const x = keys[comparable[a]] as string;
        const y = keys[comparable[b]] as string;
        return x < y ? 1 : x > y ? -1 : 0;
      }
    : (a: number, b: number) => {
        const x = keys[comparable[a]] as string;
        const y = keys[comparable[b]] as string;
        return x < y ? -1 : x > y ? 1 : 0;
      };
  let write = desc ? m : 0;
  let start = 0;
  for (let t = 1; t <= m; t++) {
    if (t === m || codes[order[t]] !== codes[order[start]]) {
      const size = t - start;
      if (desc) {
        write -= size;
      }
      if (size === 1) {
        ordered[write] = comparable[order[start]];
      } else {
        const run = order.slice(start, t).sort(compare);
        for (let q = 0; q < size; q++) {
          ordered[write + q] = comparable[run[q]];
        }
      }
      if (!desc) {
        write += size;
      }
      start = t;
    }
  }
  return true;
};

const tinySingle = <T>(items: readonly T[], column: SortColumn): T[] | null => {
  const {keys, desc, specialClass, specialsFirst, compare} = column;
  if (compare !== undefined) {
    return null;
  }
  const n = keys.length;
  let classes: Classes | null = null;
  let kind = "";
  const comparable: number[] = [];
  for (let i = 0; i < n; i++) {
    const key = keys[i];
    if (Number.isNaN(key)) {
      return null;
    }
    const cls = specialClass(key);
    if (cls !== 0) {
      classes ??= new Map();
      const bucket = classes.get(cls);
      if (bucket === undefined) {
        classes.set(cls, [i]);
      } else {
        bucket.push(i);
      }
      continue;
    }
    const type = typeof key;
    if (type !== "number" && type !== "string") {
      return null;
    }
    if (kind === "") {
      kind = type;
    } else if (type !== kind) {
      return null;
    }
    comparable.push(i);
  }
  const m = comparable.length;
  let ordered = comparable;
  if (kind === "string" && sampleHasDuplicates(keys, comparable)) {
    const rankOf: Record<string, number> = Object.create(null);
    const unique: string[] = [];
    for (let t = 0; t < m; t++) {
      const key = keys[comparable[t]] as string;
      if (rankOf[key] === undefined) {
        rankOf[key] = 0;
        unique.push(key);
      }
    }
    unique.sort();
    const last = unique.length - 1;
    for (let u = 0; u <= last; u++) {
      rankOf[unique[u]] = desc ? last - u : u;
    }
    const counts = new Int32Array(unique.length + 1);
    const ranks = new Int32Array(m);
    for (let t = 0; t < m; t++) {
      const rank = rankOf[keys[comparable[t]] as string];
      ranks[t] = rank;
      counts[rank + 1]++;
    }
    for (let u = 0; u <= last; u++) {
      counts[u + 1] += counts[u];
    }
    ordered = new Array<number>(m);
    for (let t = 0; t < m; t++) {
      ordered[counts[ranks[t]]++] = comparable[t];
    }
  } else if (kind === "string") {
    ordered = new Array<number>(m);
    if (!tinyBucketStrings(keys, comparable, desc, ordered)) {
      ordered = comparable;
      comparable.sort(
        desc
          ? (a, b) => {
              const x = keys[a] as string;
              const y = keys[b] as string;
              return x < y ? 1 : x > y ? -1 : 0;
            }
          : (a, b) => {
              const x = keys[a] as string;
              const y = keys[b] as string;
              return x < y ? -1 : x > y ? 1 : 0;
            }
      );
    }
  } else {
    comparable.sort(
      desc
        ? (a, b) => {
            const x = keys[a] as number;
            const y = keys[b] as number;
            return x < y ? 1 : x > y ? -1 : 0;
          }
        : (a, b) => {
            const x = keys[a] as number;
            const y = keys[b] as number;
            return x < y ? -1 : x > y ? 1 : 0;
          }
    );
  }
  const result = new Array<T>(n);
  let pos = 0;
  const emitClasses = () => {
    if (classes === null) {
      return;
    }
    for (const bucket of classBuckets(classes, specialsFirst)) {
      for (let t = 0; t < bucket.length; t++) {
        result[pos++] = items[bucket[t]];
      }
    }
  };
  if (specialsFirst) {
    emitClasses();
  }
  for (let t = 0; t < m; t++) {
    result[pos++] = items[ordered[t]];
  }
  if (!specialsFirst) {
    emitClasses();
  }
  return result;
};

const tinyMulti = <T>(items: readonly T[], columns: SortColumn[]): T[] | null => {
  const first = columns[0];
  const {keys, desc, specialClass} = first;
  if (first.compare !== undefined || !columns.every((column) => isFastColumn(column))) {
    return null;
  }
  const n = keys.length;
  for (let i = 0; i < n; i++) {
    const key = keys[i];
    if (typeof key !== "string" || specialClass(key) !== 0) {
      return null;
    }
  }
  const comparable = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    comparable[i] = i;
  }
  const ordered = new Array<number>(n);
  if (!tinyBucketStrings(keys, comparable, desc, ordered)) {
    return null;
  }
  const chain = comparatorFrom(columns, 1);
  const result = new Array<T>(n);
  let start = 0;
  for (let t = 1; t <= n; t++) {
    if (t === n || keys[ordered[t]] !== keys[ordered[start]]) {
      if (t - start === 1) {
        result[start] = items[ordered[start]];
      } else {
        const run = ordered.slice(start, t).sort(chain);
        for (let q = 0; q < run.length; q++) {
          result[start + q] = items[run[q]];
        }
      }
      start = t;
    }
  }
  return result;
};

const COLUMNS_MAX_RECURSIVE = 64;

export const orderByColumns = <T>(items: readonly T[], columns: SortColumn[]): T[] => {
  const n = items.length;
  for (const {keys} of columns) {
    if (keys.length !== n) {
      throw new RangeError(`column has ${keys.length} keys for ${n} items`);
    }
  }
  if (n < 2 || columns.length === 0) {
    return items.slice();
  }
  if (columns.length === 1) {
    const ordered = orderedColumn(items, columns[0]);
    if (ordered !== null) {
      return ordered;
    }
  }
  if (columns.length <= COLUMNS_MAX_RECURSIVE) {
    const nearly = nearlyOrdered(items, columns);
    if (nearly !== null) {
      return nearly;
    }
  }
  if (n <= TINY && columns.length === 1) {
    const single = tinySingle(items, columns[0]);
    if (single !== null) {
      return single;
    }
  }
  const indices = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    indices[i] = i;
  }
  if (n <= TINY) {
    const multi = tinyMulti(items, columns);
    if (multi !== null) {
      return multi;
    }
    return indices.sort(tinyComparator(columns)).map((i) => items[i]);
  }
  if (columns.length > COLUMNS_MAX_RECURSIVE || !columns.every((column) => isFastColumn(column))) {
    return indices.sort(comparatorFrom(columns, 0)).map((i) => items[i]);
  }
  const frame = acquireFrame();
  const out = new Uint32Array(n);
  try {
    sortInto(indices, columns, 0, {out, pos: 0, frame});
  } finally {
    releaseFrame(frame);
  }
  return gather(items, out);
};

const toGetter = <T>(iteratee: SortIteratee<T>) =>
  typeof iteratee === "function"
    ? iteratee
    : (item: T) => (item === null || item === undefined ? undefined : item[iteratee]);

const keysOf = <T>(items: readonly T[], get: (item: T) => unknown): unknown[] => {
  const keys = new Array<unknown>(items.length);
  for (let i = 0; i < items.length; i++) {
    keys[i] = get(items[i]);
  }
  return keys;
};

const addRun = (runs: number[], at: number, limit: number) => {
  if (runs.length > limit) {
    return true;
  }
  runs.push(at);
  return false;
};

const DIRECT = 16;

const lodashChain = (keys: unknown[][], descs: boolean[]) => (a: number, b: number) => {
  for (let c = 0; c < keys.length; c++) {
    const result = compareAscending(keys[c][a], keys[c][b]);
    if (result !== 0) {
      return descs[c] ? -result : result;
    }
  }
  return 0;
};

const nullsChain = (keys: unknown[][], descs: boolean[], nullsFirst: boolean[]) => (a: number, b: number) => {
  for (let c = 0; c < keys.length; c++) {
    const x = keys[c][a];
    const y = keys[c][b];
    const xNull = x === null || x === undefined;
    const yNull = y === null || y === undefined;
    if (xNull !== yNull) {
      return xNull === nullsFirst[c] ? -1 : 1;
    }
    if (!xNull) {
      const result = compareAscending(x, y);
      if (result !== 0) {
        return descs[c] ? -result : result;
      }
    }
  }
  return 0;
};

const sortByKeys = <T>(items: readonly T[], compare: Compare) => {
  const indices = new Array<number>(items.length);
  for (let i = 0; i < items.length; i++) {
    indices[i] = i;
  }
  return gather(items, indices.sort(compare));
};

export const orderBy = <T>(
  items: readonly T[],
  iteratees: readonly SortIteratee<T>[],
  orders: readonly SortOrder[] = []
): T[] => {
  if (items.length < 2) {
    return items.slice();
  }
  if (iteratees.length === 1) {
    const desc = orders[0] === "desc";
    const column = {keys: keysOf(items, toGetter(iteratees[0])), desc, specialClass: lodashSpecialClass, specialsFirst: desc};
    if (items.length > DIRECT) {
      return orderByColumns(items, [column]);
    }
    return orderedColumn(items, column) ?? sortByKeys(items, lodashChain([column.keys], [desc]));
  }
  const getters = iteratees.length === 0 ? [(item: T) => item] : iteratees.map(toGetter);
  if (items.length <= DIRECT) {
    return sortByKeys(
      items,
      lodashChain(
        getters.map((get) => keysOf(items, get)),
        getters.map((_, c) => orders[c] === "desc")
      )
    );
  }
  return orderByColumns(
    items,
    getters.map((get, c) => {
      const desc = orders[c] === "desc";
      return {keys: keysOf(items, get), desc, specialClass: lodashSpecialClass, specialsFirst: desc};
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
  order?: SortOrder | undefined;
  nulls?: NullsOrder | undefined;
};

const nullClass = (key: unknown): number => (key === null || key === undefined ? 1 : 0);

export const multisort = <T>(items: readonly T[], rules: readonly SortRule<T>[]): T[] => {
  if (items.length < 2) {
    return items.slice();
  }
  if (items.length <= DIRECT) {
    const descs = rules.map(({order}) => order === "desc");
    return sortByKeys(
      items,
      nullsChain(
        rules.map(({by}) => keysOf(items, toGetter(by))),
        descs,
        rules.map(({nulls}, c) => (nulls === undefined ? descs[c] : nulls === "first"))
      )
    );
  }
  return orderByColumns(
    items,
    rules.map(({by, order, nulls}) => {
      const desc = order === "desc";
      const get = toGetter(by);
      return {
        keys: keysOf(items, get),
        desc,
        specialClass: nullClass,
        specialsFirst: nulls === undefined ? desc : nulls === "first",
      };
    })
  );
};
