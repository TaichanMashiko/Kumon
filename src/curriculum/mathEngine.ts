export type StageGroup =
  | '小学校1年'
  | '小学校2年'
  | '小学校3年'
  | '小学校4年'
  | '小学校5年'
  | '小学校6年'
  | '中学校1年'
  | '中学校2年'
  | '中学校3年'
  | '高校 数学Ⅰ'
  | '高校 数学A'
  | '高校 数学Ⅱ'
  | '高校 数学B'
  | '高校 数学C'
  | '高校 数学Ⅲ';

export interface MicroStepSpec {
  id: string;
  stage: StageGroup;
  category: string;
  title: string;
  questionCount: number;
  explanation: string;
  template: string;
  params?: Record<string, number | string | boolean | number[]>;
}

export interface GeneratedProblem {
  prompt: string;
  answer: string;
}

// Deterministic PRNG (Mulberry32)
function hashString(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createRng(seedStr: string) {
  let a = hashString(seedStr) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randNonZero(rng: () => number, min: number, max: number): number {
  let v = 0;
  for (let i = 0; i < 20 && v === 0; i += 1) {
    v = randInt(rng, min, max);
  }
  return v || 1;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

export function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function fmtFrac(num: number, den: number): string {
  if (den === 0) return '0';
  if (num === 0) return '0';
  const sign = num * den < 0 ? '-' : '';
  const n = Math.abs(num);
  const d = Math.abs(den);
  const g = gcd(n, d);
  const rn = n / g;
  const rd = d / g;
  if (rd === 1) return `${sign}${rn}`;
  return `${sign}\\frac{${rn}}{${rd}}`;
}

function fmtSigned(n: number): string {
  return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}

function fmtTerm(coef: number, variable: string, isFirst = false): string {
  if (coef === 0) return '';
  const abs = Math.abs(coef);
  const cStr = abs === 1 && variable ? '' : `${abs}`;
  if (isFirst) {
    return coef < 0 ? `-${cStr}${variable}` : `${cStr}${variable}`;
  }
  return coef < 0 ? `- ${cStr}${variable}` : `+ ${cStr}${variable}`;
}

function fmtLinear(a: number, b: number, v = 'x'): string {
  const t1 = fmtTerm(a, v, true);
  if (b === 0) return t1 || '0';
  if (!t1) return `${b}`;
  return `${t1} ${fmtSigned(b)}`;
}

function fmtQuad(a: number, b: number, c: number, v = 'x'): string {
  const parts: string[] = [];
  if (a !== 0) parts.push(fmtTerm(a, `${v}^2`, true));
  if (b !== 0) parts.push(fmtTerm(b, v, parts.length === 0));
  if (c !== 0) {
    if (parts.length === 0) parts.push(`${c}`);
    else parts.push(fmtSigned(c));
  }
  return parts.join(' ') || '0';
}

function simplifySqrt(n: number): { out: number; inside: number; tex: string } {
  let out = 1;
  let inside = n;
  for (let k = 2; k * k <= inside; k += 1) {
    while (inside % (k * k) === 0) {
      out *= k;
      inside /= k * k;
    }
  }
  if (inside === 1) return { out, inside, tex: `${out}` };
  if (out === 1) return { out, inside, tex: `\\sqrt{${inside}}` };
  return { out, inside, tex: `${out}\\sqrt{${inside}}` };
}

function nPr(n: number, r: number): number {
  let res = 1;
  for (let i = 0; i < r; i += 1) res *= n - i;
  return res;
}

function nCr(n: number, r: number): number {
  const k = Math.min(r, n - r);
  let res = 1;
  for (let i = 1; i <= k; i += 1) {
    res = (res * (n - i + 1)) / i;
  }
  return Math.round(res);
}

function generateSingleProblem(
  rng: () => number,
  template: string,
  params: Record<string, number | string | boolean | number[]> = {},
  index: number
): GeneratedProblem {
  const p = (k: string, fallback: number): number =>
    typeof params[k] === 'number' ? (params[k] as number) : fallback;

  switch (template) {
    // ================= ELEMENTARY =================
    case 'add': {
      const aMin = p('aMin', 1);
      const aMax = p('aMax', 9);
      const bMin = p('bMin', 1);
      const bMax = p('bMax', 9);
      const carry = params.carry as string | undefined; // 'no' | 'yes' | 'any'
      const maxSum = p('maxSum', 99999);
      let a = randInt(rng, aMin, aMax);
      let b = randInt(rng, bMin, bMax);
      for (let t = 0; t < 40; t += 1) {
        const ca = randInt(rng, aMin, aMax);
        const cb = randInt(rng, bMin, bMax);
        const sum = ca + cb;
        const onesCarry = (ca % 10) + (cb % 10) >= 10;
        if (sum > maxSum) continue;
        if (carry === 'no' && onesCarry) continue;
        if (carry === 'yes' && !onesCarry) continue;
        a = ca;
        b = cb;
        break;
      }
      return { prompt: `$${a} + ${b}$`, answer: `$${a + b}$` };
    }

    case 'sub': {
      const aMin = p('aMin', 2);
      const aMax = p('aMax', 18);
      const bMin = p('bMin', 1);
      const bMax = p('bMax', 9);
      const borrow = params.borrow as string | undefined; // 'no' | 'yes' | 'any'
      let a = Math.max(aMin, bMin + 1);
      let b = bMin;
      for (let t = 0; t < 50; t += 1) {
        const ca = randInt(rng, aMin, aMax);
        const cb = randInt(rng, bMin, Math.min(bMax, ca));
        const onesBorrow = ca % 10 < cb % 10;
        if (ca < cb) continue;
        if (borrow === 'no' && onesBorrow) continue;
        if (borrow === 'yes' && !onesBorrow) continue;
        a = ca;
        b = cb;
        break;
      }
      return { prompt: `$${a} - ${b}$`, answer: `$${a - b}$` };
    }

    case 'add3': {
      const max = p('max', 9);
      const a = randInt(rng, 1, max);
      const b = randInt(rng, 1, max);
      const c = randInt(rng, 1, max);
      return { prompt: `$${a} + ${b} + ${c}$`, answer: `$${a + b + c}$` };
    }

    case 'mul': {
      const fixed = p('fixed', 0);
      const ordered = Boolean(params.ordered);
      const aMin = p('aMin', 2);
      const aMax = p('aMax', 9);
      const bMin = p('bMin', 1);
      const bMax = p('bMax', 9);
      const a = fixed > 0 ? fixed : randInt(rng, aMin, aMax);
      const b = ordered ? (index % 9) + 1 : randInt(rng, bMin, bMax);
      return { prompt: `$${a} \\times ${b}$`, answer: `$${a * b}$` };
    }

    case 'mul_blank': {
      const fixed = p('fixed', 0);
      const a = fixed > 0 ? fixed : randInt(rng, 2, 9);
      const b = randInt(rng, 1, 9);
      return { prompt: `$${a} \\times \\square = ${a * b}$`, answer: `$\\square = ${b}$` };
    }

    case 'div_exact': {
      const dMin = p('dMin', 2);
      const dMax = p('dMax', 9);
      const qMin = p('qMin', 2);
      const qMax = p('qMax', 9);
      const d = randInt(rng, dMin, dMax);
      const q = randInt(rng, qMin, qMax);
      return { prompt: `$${d * q} \\div ${d}$`, answer: `$${q}$` };
    }

    case 'div_rem': {
      const dMin = p('dMin', 2);
      const dMax = p('dMax', 9);
      const qMin = p('qMin', 2);
      const qMax = p('qMax', 9);
      const d = randInt(rng, dMin, dMax);
      const q = randInt(rng, qMin, qMax);
      const r = randInt(rng, 1, d - 1);
      return {
        prompt: `$${d * q + r} \\div ${d}$ （あまりも求める）`,
        answer: `$${q}$ あまり $${r}$`,
      };
    }

    case 'dec_add_sub': {
      const scale = p('scale', 10);
      const isSub = Boolean(params.isSub);
      const maxVal = p('maxVal', 99);
      let a = randInt(rng, 1, maxVal);
      let b = randInt(rng, 1, maxVal);
      if (isSub && a < b) [a, b] = [b, a];
      const dec = scale === 100 ? 2 : 1;
      const ans = isSub ? (a - b) / scale : (a + b) / scale;
      const op = isSub ? '-' : '+';
      return {
        prompt: `$${(a / scale).toFixed(dec)} ${op} ${(b / scale).toFixed(dec)}$`,
        answer: `$${Number(ans.toFixed(dec))}$`,
      };
    }

    case 'dec_mul': {
      const aScale = p('aScale', 10);
      const bScale = p('bScale', 1);
      const a = randInt(rng, 11, 89);
      const b = randInt(rng, 2, bScale > 1 ? 49 : 9);
      const ans = (a * b) / (aScale * bScale);
      const aStr = aScale > 1 ? (a / aScale).toFixed(aScale === 100 ? 2 : 1) : `${a}`;
      const bStr = bScale > 1 ? (b / bScale).toFixed(bScale === 100 ? 2 : 1) : `${b}`;
      return {
        prompt: `$${aStr} \\times ${bStr}$`,
        answer: `$${Number(ans.toFixed(4))}$`,
      };
    }

    case 'dec_div': {
      const dScale = p('dScale', 10);
      const d = randInt(rng, 2, 15);
      const q = randInt(rng, 12, 85);
      const dividend = (d * q) / (dScale * 10);
      const divisor = d / dScale;
      return {
        prompt: `$${Number(dividend.toFixed(3))} \\div ${Number(divisor.toFixed(2))}$`,
        answer: `$${Number((q / 10).toFixed(2))}$`,
      };
    }

    case 'gcd_lcm': {
      const mode = (params.mode as string) || 'gcd';
      const base = randInt(rng, 2, 6);
      const a = base * randInt(rng, 2, 6);
      let b = base * randInt(rng, 2, 7);
      if (a === b) b += base;
      const label = mode === 'gcd' ? '最大公約数' : '最小公倍数';
      const val = mode === 'gcd' ? gcd(a, b) : lcm(a, b);
      return {
        prompt: `$${a}$ と $${b}$ の${label}を求めよ。`,
        answer: `$${val}$`,
      };
    }

    case 'frac_reduce': {
      const k = randInt(rng, 2, 7);
      const n = randInt(rng, 1, 7);
      let d = randInt(rng, n + 1, 11);
      while (gcd(n, d) !== 1) d += 1;
      return {
        prompt: `$\\displaystyle \\frac{${n * k}}{${d * k}}$ を約分せよ。`,
        answer: `$\\displaystyle ${fmtFrac(n, d)}$`,
      };
    }

    case 'frac_add_sub': {
      const sameDen = Boolean(params.sameDen);
      const isSub = Boolean(params.isSub);
      const d1 = randInt(rng, 2, 9);
      const d2 = sameDen ? d1 : randInt(rng, 2, 9);
      let n1 = randInt(rng, 1, d1 - 1);
      let n2 = randInt(rng, 1, d2 - 1);
      if (isSub && n1 / d1 < n2 / d2) {
        [n1, n2] = [n2, n1];
        if (!sameDen) {
          const td1 = d1;
          const num = n1 * td1 - n2 * d2;
          if (num < 0) {
            return {
              prompt: `$\\displaystyle \\frac{${n2}}{${td1}} - \\frac{${n1}}{${d2}}$`,
              answer: `$\\displaystyle ${fmtFrac(n2 * d2 - n1 * td1, td1 * d2)}$`,
            };
          }
        }
      }
      const num = isSub ? n1 * d2 - n2 * d1 : n1 * d2 + n2 * d1;
      const den = d1 * d2;
      if (isSub && num < 0) {
        return {
          prompt: `$\\displaystyle \\frac{${n2}}{${d2}} - \\frac{${n1}}{${d1}}$`,
          answer: `$\\displaystyle ${fmtFrac(-num, den)}$`,
        };
      }
      const op = isSub ? '-' : '+';
      return {
        prompt: `$\\displaystyle \\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}}$`,
        answer: `$\\displaystyle ${fmtFrac(num, den)}$`,
      };
    }

    case 'frac_mul_div': {
      const isDiv = Boolean(params.isDiv);
      const d1 = randInt(rng, 2, 10);
      const d2 = randInt(rng, 2, 10);
      const n1 = randInt(rng, 1, d1 + 2);
      const n2 = randInt(rng, 1, d2 + 2);
      const num = isDiv ? n1 * d2 : n1 * n2;
      const den = isDiv ? d1 * n2 : d1 * d2;
      const op = isDiv ? '\\div' : '\\times';
      return {
        prompt: `$\\displaystyle \\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}}$`,
        answer: `$\\displaystyle ${fmtFrac(num, den)}$`,
      };
    }

    case 'percent_ratio': {
      const mode = (params.mode as string) || 'percent';
      if (mode === 'ratio') {
        const k = randInt(rng, 2, 6);
        const a = randInt(rng, 2, 9);
        let b = randInt(rng, 2, 9);
        while (gcd(a, b) !== 1) b += 1;
        return {
          prompt: `$${a * k} : ${b * k}$ を最も簡単な整数の比で表せ。`,
          answer: `$${a} : ${b}$`,
        };
      }
      if (mode === 'speed') {
        const s = randInt(rng, 3, 12) * 10;
        const t = randInt(rng, 2, 5);
        return {
          prompt: `時速 $${s}\\text{ km}$ で $${t}$ 時間進むと何 $\\text{km}$ 進みますか。`,
          answer: `$${s * t}\\text{ km}$`,
        };
      }
      const base = randInt(rng, 2, 20) * 100;
      const pct = pick(rng, [10, 15, 20, 25, 30, 40, 50, 60, 75, 80]);
      return {
        prompt: `$${base}$ の $${pct}\\%$ はいくつですか。`,
        answer: `$${(base * pct) / 100}$`,
      };
    }

    case 'geom_area': {
      const shape = (params.shape as string) || 'rect';
      const a = randInt(rng, 3, 14);
      const b = randInt(rng, 2, 12);
      if (shape === 'tri') {
        const evenA = a % 2 === 0 ? a : a + 1;
        return {
          prompt: `底辺 $${evenA}\\text{ cm}$、高さ $${b}\\text{ cm}$ の三角形の面積を求めよ。`,
          answer: `$${(evenA * b) / 2}\\text{ cm}^2$`,
        };
      }
      if (shape === 'circle') {
        const r = randInt(rng, 2, 10);
        return {
          prompt: `半径 $${r}\\text{ cm}$ の円の面積を求めよ。（円周率は $3.14$ とする）`,
          answer: `$${Number((r * r * 3.14).toFixed(2))}\\text{ cm}^2$`,
        };
      }
      return {
        prompt: `たて $${a}\\text{ cm}$、横 $${b}\\text{ cm}$ の長方形の面積を求めよ。`,
        answer: `$${a * b}\\text{ cm}^2$`,
      };
    }

    // ================= JUNIOR HIGH =================
    case 'signed_add_sub': {
      const a = randNonZero(rng, -15, 15);
      const b = randNonZero(rng, -15, 15);
      const isSub = Boolean(params.isSub);
      const ans = isSub ? a - b : a + b;
      const op = isSub ? '-' : '+';
      const aStr = a < 0 ? `(${a})` : `(+${a})`;
      const bStr = b < 0 ? `(${b})` : `(+${b})`;
      return { prompt: `$${aStr} ${op} ${bStr}$`, answer: `$${ans}$` };
    }

    case 'signed_mul_div': {
      const isDiv = Boolean(params.isDiv);
      const a = randNonZero(rng, -12, 12);
      const b = randNonZero(rng, -9, 9);
      if (isDiv) {
        const prod = a * b;
        const pStr = prod < 0 ? `(${prod})` : `${prod}`;
        const bStr = b < 0 ? `(${b})` : `${b}`;
        return { prompt: `$${pStr} \\div ${bStr}$`, answer: `$${a}$` };
      }
      const aStr = a < 0 ? `(${a})` : `${a}`;
      const bStr = b < 0 ? `(${b})` : `${b}`;
      return { prompt: `$${aStr} \\times ${bStr}$`, answer: `$${a * b}$` };
    }

    case 'linear_expr': {
      const a = randNonZero(rng, -6, 6);
      const b = randNonZero(rng, -9, 9);
      const c = randNonZero(rng, -6, 6);
      const d = randNonZero(rng, -9, 9);
      const isSub = Boolean(params.isSub);
      const resA = isSub ? a - c : a + c;
      const resB = isSub ? b - d : b + d;
      const op = isSub ? '-' : '+';
      return {
        prompt: `$(${fmtLinear(a, b)}) ${op} (${fmtLinear(c, d)})$`,
        answer: `$${fmtLinear(resA, resB)}$`,
      };
    }

    case 'linear_eq': {
      const kind = (params.kind as string) || 'ax_b_c';
      const x = randNonZero(rng, -8, 8);
      if (kind === 'x_plus_a') {
        const a = randInt(rng, 2, 15);
        return { prompt: `$x + ${a} = ${x + a}$`, answer: `$x = ${x}$` };
      }
      if (kind === 'x_minus_a') {
        const a = randInt(rng, 2, 15);
        return { prompt: `$x - ${a} = ${x - a}$`, answer: `$x = ${x}$` };
      }
      if (kind === 'ax_eq_b') {
        const a = randNonZero(rng, -7, 7);
        return { prompt: `$${fmtTerm(a, 'x', true)} = ${a * x}$`, answer: `$x = ${x}$` };
      }
      if (kind === 'both_sides') {
        const a = randInt(rng, 3, 9);
        const c = randInt(rng, 1, a - 1);
        const b = randNonZero(rng, -9, 9);
        const d = (a - c) * x + b;
        return {
          prompt: `$${fmtLinear(a, b)} = ${fmtLinear(c, d)}$`,
          answer: `$x = ${x}$`,
        };
      }
      if (kind === 'parens') {
        const a = randInt(rng, 2, 5);
        const b = randNonZero(rng, -5, 5);
        const rhs = a * (x + b);
        return {
          prompt: `$${a}(${fmtLinear(1, b)}) = ${rhs}$`,
          answer: `$x = ${x}$`,
        };
      }
      // default ax + b = c
      const a = randInt(rng, 2, 7);
      const b = randNonZero(rng, -9, 9);
      return {
        prompt: `$${fmtLinear(a, b)} = ${a * x + b}$`,
        answer: `$x = ${x}$`,
      };
    }

    case 'simultaneous_eq': {
      const x = randNonZero(rng, -6, 6);
      const y = randNonZero(rng, -6, 6);
      const a1 = randInt(rng, 1, 4);
      const b1 = randNonZero(rng, -4, 4);
      const a2 = randInt(rng, 1, 4);
      let b2 = randNonZero(rng, -4, 4);
      if (a1 * b2 === a2 * b1) b2 = -b2;
      const c1 = a1 * x + b1 * y;
      const c2 = a2 * x + b2 * y;
      const eq1 = `${fmtTerm(a1, 'x', true)} ${fmtTerm(b1, 'y', false)} = ${c1}`;
      const eq2 = `${fmtTerm(a2, 'x', true)} ${fmtTerm(b2, 'y', false)} = ${c2}`;
      return {
        prompt: `$\\begin{cases} ${eq1} \\\\ ${eq2} \\end{cases}$`,
        answer: `$x = ${x}, \\ y = ${y}$`,
      };
    }

    case 'linear_func': {
      const a = randNonZero(rng, -5, 5);
      const b = randNonZero(rng, -8, 8);
      const x1 = randInt(rng, 1, 4);
      const y1 = a * x1 + b;
      return {
        prompt: `傾きが $${a}$ で、点 $(${x1}, \\ ${y1})$ を通る1次関数の式を求めよ。`,
        answer: `$y = ${fmtLinear(a, b)}$`,
      };
    }

    case 'expand_poly': {
      const kind = (params.kind as string) || 'x_ab';
      const a = randNonZero(rng, -8, 8);
      const b = randNonZero(rng, -8, 8);
      if (kind === 'square') {
        return {
          prompt: `$(${fmtLinear(1, a)})^2$ を展開せよ。`,
          answer: `$${fmtQuad(1, 2 * a, a * a)}$`,
        };
      }
      if (kind === 'diff_sq') {
        const k = randInt(rng, 2, 12);
        return {
          prompt: `$(x + ${k})(x - ${k})$ を展開せよ。`,
          answer: `$x^2 - ${k * k}$`,
        };
      }
      if (kind === 'ax_b_cx_d') {
        const c1 = randInt(rng, 2, 4);
        const c2 = randInt(rng, 1, 3);
        const d1 = randNonZero(rng, -5, 5);
        const d2 = randNonZero(rng, -5, 5);
        return {
          prompt: `$(${fmtLinear(c1, d1)})(${fmtLinear(c2, d2)})$ を展開せよ。`,
          answer: `$${fmtQuad(c1 * c2, c1 * d2 + c2 * d1, d1 * d2)}$`,
        };
      }
      return {
        prompt: `$(${fmtLinear(1, a)})(${fmtLinear(1, b)})$ を展開せよ。`,
        answer: `$${fmtQuad(1, a + b, a * b)}$`,
      };
    }

    case 'factor_poly': {
      const kind = (params.kind as string) || 'monic';
      if (kind === 'diff_sq') {
        const k = randInt(rng, 2, 12);
        return {
          prompt: `$x^2 - ${k * k}$ を因数分解せよ。`,
          answer: `$(x + ${k})(x - ${k})$`,
        };
      }
      if (kind === 'tasuki') {
        const a = randInt(rng, 2, 4);
        const c = randInt(rng, 1, 3);
        const b = randNonZero(rng, -5, 5);
        const d = randNonZero(rng, -5, 5);
        return {
          prompt: `$${fmtQuad(a * c, a * d + b * c, b * d)}$ を因数分解せよ。`,
          answer: `$(${fmtLinear(a, b)})(${fmtLinear(c, d)})$`,
        };
      }
      const a = randNonZero(rng, -8, 8);
      const b = randNonZero(rng, -8, 8);
      return {
        prompt: `$${fmtQuad(1, a + b, a * b)}$ を因数分解せよ。`,
        answer: `$(${fmtLinear(1, a)})(${fmtLinear(1, b)})$`,
      };
    }

    case 'sqrt_calc': {
      const kind = (params.kind as string) || 'simplify';
      if (kind === 'rationalize') {
        const r = pick(rng, [2, 3, 5, 6, 7]);
        const num = randInt(rng, 1, 6);
        const g = gcd(num, r);
        const top = num / g === 1 ? `\\sqrt{${r}}` : `${num / g}\\sqrt{${r}}`;
        const bot = r / g;
        return {
          prompt: `$\\displaystyle \\frac{${num}}{\\sqrt{${r}}}$ の分母を有理化せよ。`,
          answer: bot === 1 ? `$${top}$` : `$\\displaystyle \\frac{${top}}{${bot}}$`,
        };
      }
      const k = randInt(rng, 2, 6);
      const r = pick(rng, [2, 3, 5, 6, 7]);
      const n = k * k * r;
      return {
        prompt: `$\\sqrt{${n}}$ を $a\\sqrt{b}$ の形にせよ。`,
        answer: `$${simplifySqrt(n).tex}$`,
      };
    }

    case 'quad_eq': {
      const r1 = randNonZero(rng, -7, 7);
      const r2 = randNonZero(rng, -7, 7);
      const ans = r1 === r2 ? `$x = ${r1}$` : `$x = ${Math.min(r1, r2)}, \\ ${Math.max(r1, r2)}$`;
      return {
        prompt: `$${fmtQuad(1, -(r1 + r2), r1 * r2)} = 0$ を解け。`,
        answer: ans,
      };
    }

    case 'pythagoras': {
      const triples: Array<[number, number, number]> = [
        [3, 4, 5],
        [5, 12, 13],
        [6, 8, 10],
        [8, 15, 17],
        [9, 12, 15],
        [7, 24, 25],
      ];
      const [a, b, c] = pick(rng, triples);
      return {
        prompt: `直角をはさむ2辺の長さが $${a}, \\ ${b}$ の直角三角形の斜辺の長さを求めよ。`,
        answer: `$${c}$`,
      };
    }

    // ================= HIGH SCHOOL (MATH I / A / II / B / C / III) =================
    case 'hs_complete_sq': {
      const a = p('leadOne', 1) === 1 ? 1 : randNonZero(rng, -3, 3);
      const h = randNonZero(rng, -5, 5);
      const k = randNonZero(rng, -8, 8);
      const b = -2 * a * h;
      const c = a * h * h + k;
      const aPrefix = a === 1 ? '' : a === -1 ? '-' : `${a}`;
      return {
        prompt: `$y = ${fmtQuad(a, b, c)}$ を平方完成し、頂点の座標を求めよ。`,
        answer: `$y = ${aPrefix}(${fmtLinear(1, -h)})^2 ${fmtSigned(k)}$、頂点 $(${h}, \\ ${k})$`,
      };
    }

    case 'hs_quad_ineq': {
      const r1 = randInt(rng, -5, 2);
      const r2 = randInt(rng, r1 + 1, 7);
      const isGt = Boolean(params.isGt);
      const op = isGt ? '> 0' : '< 0';
      const ans = isGt ? `$x < ${r1}, \\ ${r2} < x$` : `$${r1} < x < ${r2}$`;
      return {
        prompt: `2次不等式 $${fmtQuad(1, -(r1 + r2), r1 * r2)} ${op}$ を解け。`,
        answer: ans,
      };
    }

    case 'hs_trig_basic': {
      const angles: Array<{ deg: number; sin: string; cos: string; tan: string }> = [
        { deg: 30, sin: '\\frac{1}{2}', cos: '\\frac{\\sqrt{3}}{2}', tan: '\\frac{1}{\\sqrt{3}}' },
        { deg: 45, sin: '\\frac{1}{\\sqrt{2}}', cos: '\\frac{1}{\\sqrt{2}}', tan: '1' },
        { deg: 60, sin: '\\frac{\\sqrt{3}}{2}', cos: '\\frac{1}{2}', tan: '\\sqrt{3}' },
        { deg: 120, sin: '\\frac{\\sqrt{3}}{2}', cos: '-\\frac{1}{2}', tan: '-\\sqrt{3}' },
        { deg: 135, sin: '\\frac{1}{\\sqrt{2}}', cos: '-\\frac{1}{\\sqrt{2}}', tan: '-1' },
        { deg: 150, sin: '\\frac{1}{2}', cos: '-\\frac{\\sqrt{3}}{2}', tan: '-\\frac{1}{\\sqrt{3}}' },
      ];
      const item = pick(rng, angles);
      const fn = pick(rng, ['sin', 'cos', 'tan'] as const);
      return {
        prompt: `$\\${fn} ${item.deg}^\\circ$ の値を求めよ。`,
        answer: `$${item[fn]}$`,
      };
    }

    case 'hs_comb_perm': {
      const mode = (params.mode as string) || 'P';
      const n = randInt(rng, 5, 9);
      const r = randInt(rng, 2, Math.min(4, n - 1));
      if (mode === 'C') {
        return { prompt: `$_{${n}}\\mathrm{C}_{${r}}$ を計算せよ。`, answer: `$${nCr(n, r)}$` };
      }
      return { prompt: `$_{${n}}\\mathrm{P}_{${r}}$ を計算せよ。`, answer: `$${nPr(n, r)}$` };
    }

    case 'hs_complex': {
      const a = randNonZero(rng, -5, 5);
      const b = randNonZero(rng, -5, 5);
      const c = randNonZero(rng, -5, 5);
      const d = randNonZero(rng, -5, 5);
      const isMul = Boolean(params.isMul);
      if (isMul) {
        const re = a * c - b * d;
        const im = a * d + b * c;
        return {
          prompt: `$(${a} ${fmtSigned(b)}i)(${c} ${fmtSigned(d)}i)$ を計算せよ。`,
          answer: `$${re} ${fmtSigned(im)}i$`,
        };
      }
      return {
        prompt: `$(${a} ${fmtSigned(b)}i) + (${c} ${fmtSigned(d)}i)$ を計算せよ。`,
        answer: `$${a + c} ${fmtSigned(b + d)}i$`,
      };
    }

    case 'hs_log_exp': {
      const base = pick(rng, [2, 3, 5]);
      const exp = randInt(rng, 2, 5);
      const val = Math.pow(base, exp);
      return {
        prompt: `$\\log_{${base}} ${val}$ の値を求めよ。`,
        answer: `$${exp}$`,
      };
    }

    case 'hs_diff_poly': {
      const a = randNonZero(rng, -5, 5);
      const b = randNonZero(rng, -6, 6);
      const c = randNonZero(rng, -8, 8);
      const d = randNonZero(rng, -9, 9);
      return {
        prompt: `$y = ${fmtTerm(a, 'x^3', true)} ${fmtTerm(b, 'x^2', false)} ${fmtTerm(c, 'x', false)} ${fmtSigned(d)}$ を微分せよ。`,
        answer: `$y' = ${fmtQuad(3 * a, 2 * b, c)}$`,
      };
    }

    case 'hs_int_poly': {
      const a = randNonZero(rng, -4, 4);
      const b = randNonZero(rng, -5, 5);
      const c = randNonZero(rng, -7, 7);
      const coef3 = a * 3;
      const coef2 = b * 2;
      return {
        prompt: `$\\displaystyle \\int (${fmtQuad(coef3, coef2, c)}) \\, dx$ を求めよ。`,
        answer: `$${fmtTerm(a, 'x^3', true)} ${fmtTerm(b, 'x^2', false)} ${fmtTerm(c, 'x', false)} + C$`,
      };
    }

    case 'hs_seq': {
      const kind = (params.kind as string) || 'arith';
      const a1 = randInt(rng, 1, 9);
      const d = randNonZero(rng, -5, 7);
      const n = randInt(rng, 5, 12);
      if (kind === 'geom') {
        const r = pick(rng, [2, 3, -2]);
        const k = randInt(rng, 3, 5);
        return {
          prompt: `初項 $${a1}$、公比 $${r}$ の等比数列の第 $${k}$ 項を求めよ。`,
          answer: `$${a1 * Math.pow(r, k - 1)}$`,
        };
      }
      return {
        prompt: `初項 $${a1}$、公差 $${d}$ の等差数列の第 $${n}$ 項を求めよ。`,
        answer: `$${a1 + (n - 1) * d}$`,
      };
    }

    case 'hs_vector': {
      const a1 = randNonZero(rng, -5, 5);
      const a2 = randNonZero(rng, -5, 5);
      const b1 = randNonZero(rng, -5, 5);
      const b2 = randNonZero(rng, -5, 5);
      const dot = a1 * b1 + a2 * b2;
      return {
        prompt: `$\\vec{a} = (${a1}, \\ ${a2}), \\ \\vec{b} = (${b1}, \\ ${b2})$ の内積 $\\vec{a} \\cdot \\vec{b}$ を求めよ。`,
        answer: `$${dot}$`,
      };
    }

    case 'hs3_diff_chain': {
      const a = randInt(rng, 2, 5);
      const b = randNonZero(rng, -6, 6);
      const n = randInt(rng, 3, 6);
      return {
        prompt: `$y = (${fmtLinear(a, b)})^{${n}}$ を微分せよ。`,
        answer: `$y' = ${a * n}(${fmtLinear(a, b)})^{${n - 1}}$`,
      };
    }

    case 'hs3_int_sub': {
      const k = randInt(rng, 1, 5);
      const n = randInt(rng, 2, 5);
      const pwr = randInt(rng, 2, 3);
      if (pwr === 2) {
        return {
          prompt: `$\\displaystyle \\int 2x(x^2 + ${k})^{${n}} \\, dx$`,
          answer: `$\\displaystyle \\frac{1}{${n + 1}}(x^2 + ${k})^{${n + 1}} + C$`,
        };
      }
      return {
        prompt: `$\\displaystyle \\int 3x^2(x^3 + ${k})^{${n}} \\, dx$`,
        answer: `$\\displaystyle \\frac{1}{${n + 1}}(x^3 + ${k})^{${n + 1}} + C$`,
      };
    }

    default: {
      const a = randInt(rng, 1, 9);
      const b = randInt(rng, 1, 9);
      return { prompt: `$${a} + ${b}$`, answer: `$${a + b}$` };
    }
  }
}

export function renderStepMarkdown(
  spec: MicroStepSpec,
  variantNumber = 0
): string {
  const rng = createRng(`${spec.id}::v${variantNumber}`);
  const problems: GeneratedProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < spec.questionCount; i += 1) {
    let prob = generateSingleProblem(rng, spec.template, spec.params, i);
    for (let retry = 0; retry < 12 && seen.has(prob.prompt); retry += 1) {
      prob = generateSingleProblem(rng, spec.template, spec.params, i + retry + 1);
    }
    seen.add(prob.prompt);
    problems.push(prob);
  }

  const problemLines = problems
    .map((item, idx) => `${idx + 1}. ${item.prompt}`)
    .join('\n');
  const answerLines = problems
    .map((item, idx) => `${idx + 1}. ${item.answer}`)
    .join('\n');

  const heading =
    variantNumber > 0
      ? `# ✍️ 類題トレーニング #${variantNumber}（全${spec.questionCount}問）`
      : `# ✍️ 練習問題（全${spec.questionCount}問）`;

  const intro =
    variantNumber > 0
      ? `同じレベルの類題です。90%以上を目指してノートに鉛筆で解きましょう。`
      : `手元のノートに鉛筆で解きましょう。`;

  const explanationPart =
    variantNumber > 0 ? '' : `# 📖 解説\n\n${spec.explanation}\n\n`;

  return `${explanationPart}${heading}

${intro}

${problemLines}

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

${answerLines}

</details>`;
}
