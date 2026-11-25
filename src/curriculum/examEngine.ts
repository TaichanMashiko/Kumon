import type { GeneratedProblem } from './mathEngine';
import { gcd } from './mathEngine';

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function randNonZero(rng: () => number, min: number, max: number): number {
  let v = 0;
  for (let i = 0; i < 20 && v === 0; i += 1) v = randInt(rng, min, max);
  return v || 1;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function fmtFrac(num: number, den: number): string {
  if (den === 0 || num === 0) return '0';
  const sign = num * den < 0 ? '-' : '';
  const n = Math.abs(num);
  const d = Math.abs(den);
  const g = gcd(n, d);
  const rn = n / g;
  const rd = d / g;
  return rd === 1 ? `${sign}${rn}` : `${sign}\\frac{${rn}}{${rd}}`;
}

function fmtSigned(n: number): string {
  return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`;
}

function nCr(n: number, r: number): number {
  const k = Math.min(r, n - r);
  let res = 1;
  for (let i = 1; i <= k; i += 1) res = (res * (n - i + 1)) / i;
  return Math.round(res);
}

/**
 * 教科書・大学入試レベルの思考・応用問題ジェネレーター（数Ⅰ・A・Ⅱ・B・C・Ⅲ全章網羅）
 */
export function generateExamProblem(
  rng: () => number,
  template: string,
  params: Record<string, number | string | boolean | number[]> = {}
): GeneratedProblem | null {
  switch (template) {
    // ===== 数学Ⅰ =====
    case 'hs1_symmetric': {
      const s = randNonZero(rng, 2, 7);
      const p = randNonZero(rng, -5, 5);
      const mode = (params.mode as string) || 'sq';
      if (mode === 'cube') {
        const ans = s * s * s - 3 * p * s;
        return {
          prompt: `$x + y = ${s}, \\ xy = ${p}$ のとき、$x^3 + y^3$ の値を求めよ。`,
          answer: `$(x+y)^3 - 3xy(x+y) = ${ans}$`,
        };
      }
      const ans = s * s - 2 * p;
      return {
        prompt: `$x + y = ${s}, \\ xy = ${p}$ のとき、$x^2 + y^2$ の値を求めよ。`,
        answer: `$(x+y)^2 - 2xy = ${ans}$`,
      };
    }

    case 'hs1_double_sqrt': {
      const a = randInt(rng, 2, 7);
      const b = randInt(rng, 1, a - 1);
      const isMinus = Boolean(params.isMinus);
      const op = isMinus ? '-' : '+';
      const ansA = a === 1 ? '1' : `\\sqrt{${a}}`;
      const ansB = b === 1 ? '1' : `\\sqrt{${b}}`;
      return {
        prompt: `二重根号 $\\sqrt{${a + b} ${op} 2\\sqrt{${a * b}}}$ を外して簡単にせよ。`,
        answer: `$${ansA} ${op} ${ansB}$`,
      };
    }

    case 'hs1_abs_eq_ineq': {
      const mode = (params.mode as string) || 'eq';
      const a = randInt(rng, 1, 3);
      const b = randNonZero(rng, -6, 6);
      const c = randInt(rng, 2, 8);
      const lhs = a === 1 ? `x ${fmtSigned(b)}` : `${a}x ${fmtSigned(b)}`;
      const r1 = fmtFrac(-c - b, a);
      const r2 = fmtFrac(c - b, a);
      if (mode === 'lt') {
        return {
          prompt: `不等式 $|${lhs}| < ${c}$ を解け。`,
          answer: `$${r1} < x < ${r2}$`,
        };
      }
      if (mode === 'gt') {
        return {
          prompt: `不等式 $|${lhs}| > ${c}$ を解け。`,
          answer: `$x < ${r1}, \\ ${r2} < x$`,
        };
      }
      return {
        prompt: `方程式 $|${lhs}| = ${c}$ を解け。`,
        answer: `$x = ${r1}, \\ ${r2}$`,
      };
    }

    case 'hs1_logic_cond': {
      const bank: GeneratedProblem[] = [
        {
          prompt: '$x = 2$ は $x^2 = 4$ であるための何条件か。',
          answer: '十分条件（必要条件ではない）',
        },
        {
          prompt: '$x^2 = 9$ は $x = 3$ であるための何条件か。',
          answer: '必要条件（十分条件ではない）',
        },
        {
          prompt: '$x > 3$ は $x > 1$ であるための何条件か。',
          answer: '十分条件（必要条件ではない）',
        },
        {
          prompt: '$x > 0$ は $x > 5$ であるための何条件か。',
          answer: '必要条件（十分条件ではない）',
        },
        {
          prompt: '$xy = 0$ は「$x = 0$ または $y = 0$」であるための何条件か。',
          answer: '必要十分条件',
        },
        {
          prompt: '$x = 0$ かつ $y = 0$ は $x^2 + y^2 = 0$（$x, y$ は実数）であるための何条件か。',
          answer: '必要十分条件',
        },
        {
          prompt: '整数 $n$ が $6$ の倍数であることは、$n$ が $3$ の倍数であるための何条件か。',
          answer: '十分条件（必要条件ではない）',
        },
        {
          prompt: '整数 $n$ が偶数であることは、$n$ が $4$ の倍数であるための何条件か。',
          answer: '必要条件（十分条件ではない）',
        },
        {
          prompt: '$\\triangle\\mathrm{ABC}$ が正三角形であることは、二等辺三角形であるための何条件か。',
          answer: '十分条件（必要条件ではない）',
        },
        {
          prompt: '$a = b$ は $ac = bc$ であるための何条件か。',
          answer: '十分条件（必要条件ではない）',
        },
        {
          prompt: '$|x| = 2$ は $x = 2$ であるための何条件か。',
          answer: '必要条件（十分条件ではない）',
        },
        {
          prompt: '$x < -1$ は $x^2 > 1$ であるための何条件か。',
          answer: '十分条件（必要条件ではない）',
        },
      ];
      return pick(rng, bank);
    }

    case 'hs1_qf_maxmin': {
      const h = randInt(rng, 1, 3);
      const k = randInt(rng, -4, 3);
      const L = h - randInt(rng, 1, 2);
      const R = h + randInt(rng, 2, 3);
      const b = -2 * h;
      const c = h * h + k;
      const f = (x: number) => x * x + b * x + c;
      const fL = f(L);
      const fR = f(R);
      const maxVal = Math.max(fL, fR);
      const maxX = fL >= fR ? L : R;
      return {
        prompt: `関数 $y = x^2 ${fmtSigned(b)}x ${fmtSigned(c)} \\ (${L} \\le x \\le ${R})$ の最大値と最小値を求めよ。`,
        answer: `最大値 $${maxVal}$ ($x=${maxX}$)、最小値 $${k}$ ($x=${h}$)`,
      };
    }

    case 'hs1_qf_disc': {
      const b = randInt(rng, 1, 4) * 2;
      const kLimit = (b * b) / 4;
      const mode = (params.mode as string) || 'two';
      if (mode === 'touch') {
        return {
          prompt: `2次関数 $y = x^2 + ${b}x + k$ のグラフが $x$ 軸に接するとき、定数 $k$ の値を求めよ。`,
          answer: `$D = 0$ より $k = ${kLimit}$`,
        };
      }
      return {
        prompt: `2次方程式 $x^2 + ${b}x + k = 0$ が異なる2つの実数解をもつとき、定数 $k$ の値の範囲を求めよ。`,
        answer: `$D > 0$ より $k < ${kLimit}$`,
      };
    }

    case 'hs1_trig_rel': {
      const triples: Array<[number, number, number]> = [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
      ];
      const [opp, adj, hyp] = pick(rng, triples);
      const obtuse = Boolean(params.obtuse);
      if (obtuse) {
        return {
          prompt: `$90^\\circ < \\theta < 180^\\circ$ で $\\sin\\theta = \\frac{${opp}}{${hyp}}$ のとき、$\\cos\\theta$ と $\\tan\\theta$ を求めよ。`,
          answer: `$\\cos\\theta = -\\frac{${adj}}{${hyp}}, \\ \\tan\\theta = -\\frac{${opp}}{${adj}}$`,
        };
      }
      return {
        prompt: `$0^\\circ < \\theta < 90^\\circ$ で $\\sin\\theta = \\frac{${opp}}{${hyp}}$ のとき、$\\cos\\theta$ と $\\tan\\theta$ を求めよ。`,
        answer: `$\\cos\\theta = \\frac{${adj}}{${hyp}}, \\ \\tan\\theta = \\frac{${opp}}{${adj}}$`,
      };
    }

    case 'hs1_sine_cosine': {
      const mode = (params.mode as string) || 'area';
      if (mode === 'sine') {
        const a = randInt(rng, 2, 8) * 2;
        return {
          prompt: `$\\triangle\\mathrm{ABC}$ で $a = ${a}, \\ A = 30^\\circ$ のとき、外接円の半径 $R$ を求めよ。`,
          answer: `$2R = \\frac{${a}}{\\sin 30^\\circ}$ より $R = ${a}$`,
        };
      }
      if (mode === 'cosine') {
        const b = randInt(rng, 2, 6);
        const c = randInt(rng, 2, 6);
        const a2 = b * b + c * c - b * c; // cos 60 = 1/2
        return {
          prompt: `$\\triangle\\mathrm{ABC}$ で $b = ${b}, \\ c = ${c}, \\ A = 60^\\circ$ のとき、$a^2$ の値を求めよ。`,
          answer: `$a^2 = ${b}^2 + ${c}^2 - 2\\cdot ${b}\\cdot ${c}\\cos 60^\\circ = ${a2}$`,
        };
      }
      const b = randInt(rng, 2, 8) * 2;
      const c = randInt(rng, 3, 9);
      return {
        prompt: `$\\triangle\\mathrm{ABC}$ で $b = ${b}, \\ c = ${c}, \\ A = 30^\\circ$ のとき、面積 $S$ を求めよ。`,
        answer: `$S = \\frac{1}{2}\\cdot ${b}\\cdot ${c}\\sin 30^\\circ = ${(b * c) / 4}$`,
      };
    }

    case 'hs1_stats': {
      const m = randInt(rng, 4, 10);
      const d1 = randInt(rng, 1, 3);
      const d2 = randInt(rng, 1, 3);
      const data = [m - d1, m - d2, m, m + d2, m + d1];
      const variance = (2 * d1 * d1 + 2 * d2 * d2) / 5;
      return {
        prompt: `データ $${data.join(', \\ ')}$ の平均値と分散を求めよ。`,
        answer: `平均値 $${m}$、分散 $${Number(variance.toFixed(2))}$`,
      };
    }

    // ===== 数学A =====
    case 'hsa_prob_events': {
      const mode = (params.mode as string) || 'rep';
      if (mode === 'complement') {
        const n = randInt(rng, 2, 4);
        const den = Math.pow(2, n);
        return {
          prompt: `1枚の硬貨を $${n}$ 回投げるとき、少なくとも1回は表が出る確率を求めよ。`,
          answer: `$1 - \\left(\\frac{1}{2}\\right)^{${n}} = \\frac{${den - 1}}{${den}}$`,
        };
      }
      const n = randInt(rng, 3, 4);
      const k = randInt(rng, 1, n - 1);
      const num = nCr(n, k);
      const den = Math.pow(2, n);
      return {
        prompt: `1枚の硬貨を $${n}$ 回投げるとき、表がちょうど $${k}$ 回出る確率を求めよ。`,
        answer: `$_{${n}}\\mathrm{C}_{${k}}\\left(\\frac{1}{2}\\right)^{${n}} = ${fmtFrac(num, den)}$`,
      };
    }

    case 'hsa_geom_theorems': {
      const mode = (params.mode as string) || 'bisector';
      if (mode === 'power') {
        const pa = randInt(rng, 2, 6);
        const pb = randInt(rng, 3, 8);
        const pc = pick(rng, [2, 3, 4]);
        const prod = pa * pb;
        return {
          prompt: `円の2つの弦 $\\mathrm{AB, CD}$ が点 $\\mathrm{P}$ で交わり、$\\mathrm{PA}=${pa}, \\ \\mathrm{PB}=${pb}, \\ \\mathrm{PC}=${pc}$ のとき、$\\mathrm{PD}$ を求めよ。`,
          answer: `方べきの定理より $\\mathrm{PD} = ${fmtFrac(prod, pc)}$`,
        };
      }
      const ab = randInt(rng, 3, 9);
      const ac = randInt(rng, 2, 8);
      const k = randInt(rng, 1, 3);
      return {
        prompt: `$\\triangle\\mathrm{ABC}$ で $\\angle\\mathrm{A}$ の二等分線と辺 $\\mathrm{BC}$ の交点を $\\mathrm{D}$ とする。$\\mathrm{AB}=${ab}, \\ \\mathrm{AC}=${ac}, \\ \\mathrm{BC}=${(ab + ac) * k}$ のとき、$\\mathrm{BD}$ の長さを求めよ。`,
        answer: `$\\mathrm{BD} : \\mathrm{DC} = ${ab} : ${ac}$ より $\\mathrm{BD} = ${ab * k}$`,
      };
    }

    case 'hsa_int_diophantine': {
      const mode = (params.mode as string) || 'divisors';
      if (mode === 'base') {
        const val = randInt(rng, 10, 31);
        return {
          prompt: `10進法で表された数 $${val}$ を2進法で表せ。`,
          answer: `$${val.toString(2)}_{(2)}$`,
        };
      }
      const a = randInt(rng, 1, 3);
      const b = randInt(rng, 1, 2);
      const n = Math.pow(2, a) * Math.pow(3, b);
      const count = (a + 1) * (b + 1);
      return {
        prompt: `$${n}$ の正の約数の個数を求めよ。`,
        answer: `$${n} = 2^{${a}}\\cdot 3^{${b}}$ より $(${a}+1)(${b}+1) = ${count}$ 個`,
      };
    }

    // ===== 数学Ⅱ =====
    case 'hs2_binomial': {
      const n = randInt(rng, 4, 6);
      const k = randInt(rng, 1, n - 1);
      const a = randInt(rng, 1, 3);
      const b = randNonZero(rng, -3, 3);
      const coef = nCr(n, k) * Math.pow(a, k) * Math.pow(b, n - k);
      const inner = a === 1 ? `x ${fmtSigned(b)}` : `${a}x ${fmtSigned(b)}`;
      return {
        prompt: `$(${inner})^{${n}}$ の展開式における $x^{${k}}$ の係数を求めよ。`,
        answer: `$${coef}$`,
      };
    }

    case 'hs2_vieta': {
      const s = randNonZero(rng, -5, 5);
      const p = randNonZero(rng, -5, 5);
      const b = -s;
      const ans = s * s - 2 * p;
      return {
        prompt: `2次方程式 $x^2 ${fmtSigned(b)}x ${fmtSigned(p)} = 0$ の2つの解を $\\alpha, \\beta$ とするとき、$\\alpha^2 + \\beta^2$ の値を求めよ。`,
        answer: `$\\alpha+\\beta=${s}, \\ \\alpha\\beta=${p}$ より $\\alpha^2+\\beta^2 = ${ans}$`,
      };
    }

    case 'hs2_remainder_cubic': {
      const a = randNonZero(rng, -3, 3);
      const b = randNonZero(rng, -4, 4);
      const c = randNonZero(rng, -5, 5);
      const k = randNonZero(rng, -2, 2);
      const rem = k * k * k + a * k * k + b * k + c;
      const divStr = k > 0 ? `x - ${k}` : `x + ${Math.abs(k)}`;
      return {
        prompt: `整式 $P(x) = x^3 ${fmtSigned(a)}x^2 ${fmtSigned(b)}x ${fmtSigned(c)}$ を $${divStr}$ で割った余りを求めよ。`,
        answer: `剰余の定理より $P(${k}) = ${rem}$`,
      };
    }

    case 'hs2_point_line_dist': {
      const pairs: Array<[number, number, number]> = [
        [3, 4, 5],
        [4, -3, 5],
        [5, 12, 13],
      ];
      const [a, b, den] = pick(rng, pairs);
      const x1 = randNonZero(rng, -3, 3);
      const y1 = randNonZero(rng, -3, 3);
      const c = randNonZero(rng, -6, 6);
      const num = Math.abs(a * x1 + b * y1 + c);
      return {
        prompt: `点 $(${x1}, \\ ${y1})$ と直線 $${a}x ${fmtSigned(b)}y ${fmtSigned(c)} = 0$ の距離を求めよ。`,
        answer: `$\\displaystyle ${fmtFrac(num, den)}$`,
      };
    }

    case 'hs2_trig_add': {
      const bank: GeneratedProblem[] = [
        {
          prompt: '加法定理を用いて $\\sin 75^\\circ$ の値を求めよ。',
          answer: '$\\displaystyle \\frac{\\sqrt{6} + \\sqrt{2}}{4}$',
        },
        {
          prompt: '加法定理を用いて $\\cos 75^\\circ$ の値を求めよ。',
          answer: '$\\displaystyle \\frac{\\sqrt{6} - \\sqrt{2}}{4}$',
        },
        {
          prompt: '加法定理を用いて $\\sin 15^\\circ$ の値を求めよ。',
          answer: '$\\displaystyle \\frac{\\sqrt{6} - \\sqrt{2}}{4}$',
        },
        {
          prompt: '加法定理を用いて $\\cos 15^\\circ$ の値を求めよ。',
          answer: '$\\displaystyle \\frac{\\sqrt{6} + \\sqrt{2}}{4}$',
        },
        {
          prompt: '$\\sin\\theta + \\sqrt{3}\\cos\\theta$ を $r\\sin(\\theta + \\alpha)$ の形に合成せよ。',
          answer: '$\\displaystyle 2\\sin\\left(\\theta + \\frac{\\pi}{3}\\right)$',
        },
        {
          prompt: '$\\sqrt{3}\\sin\\theta + \\cos\\theta$ を $r\\sin(\\theta + \\alpha)$ の形に合成せよ。',
          answer: '$\\displaystyle 2\\sin\\left(\\theta + \\frac{\\pi}{6}\\right)$',
        },
        {
          prompt: '$\\sin\\theta - \\cos\\theta$ を $r\\sin(\\theta + \\alpha)$ の形に合成せよ。',
          answer: '$\\displaystyle \\sqrt{2}\\sin\\left(\\theta - \\frac{\\pi}{4}\\right)$',
        },
        {
          prompt: '$\\sin\\alpha = \\frac{3}{5}, \\ \\cos\\alpha = \\frac{4}{5}$ のとき、$\\sin 2\\alpha$ を求めよ。',
          answer: '$\\displaystyle 2\\sin\\alpha\\cos\\alpha = \\frac{24}{25}$',
        },
        {
          prompt: '$\\cos\\alpha = \\frac{3}{5}$ のとき、$\\cos 2\\alpha$ を求めよ。',
          answer: '$\\displaystyle 2\\cos^2\\alpha - 1 = -\\frac{7}{25}$',
        },
        {
          prompt: '$\\tan\\alpha = 2$ のとき、$\\tan 2\\alpha$ を求めよ。',
          answer: '$\\displaystyle \\frac{2\\tan\\alpha}{1-\\tan^2\\alpha} = -\\frac{4}{3}$',
        },
      ];
      return pick(rng, bank);
    }

    case 'hs2_exp_log_eq': {
      const mode = (params.mode as string) || 'exp';
      if (mode === 'log') {
        const base = pick(rng, [2, 3]);
        const rhs = randInt(rng, 2, 4);
        const k = randNonZero(rng, -4, 4);
        const x = Math.pow(base, rhs) - k;
        return {
          prompt: `対数方程式 $\\log_{${base}}(x ${fmtSigned(k)}) = ${rhs}$ を解け。`,
          answer: `$x = ${x}$`,
        };
      }
      const base = pick(rng, [2, 3]);
      const p = randInt(rng, 2, 5);
      const b = randNonZero(rng, -3, 3);
      return {
        prompt: `指数方程式 $${base}^{x ${fmtSigned(b)}} = ${Math.pow(base, p)}$ を解け。`,
        answer: `$x = ${p - b}$`,
      };
    }

    case 'hs2_tangent_extrema': {
      const mode = (params.mode as string) || 'tangent';
      if (mode === 'extrema') {
        const a = randInt(rng, 1, 3);
        const maxVal = 4 * a * a * a;
        // f(x) = x^3 - 3a^2 x -> f'(x) = 3(x-a)(x+a)
        return {
          prompt: `関数 $f(x) = x^3 - ${3 * a * a}x$ の極大値と極小値を求めよ。`,
          answer: `極大値 $${2 * a * a * a}$ ($x=-${a}$)、極小値 $-${2 * a * a * a}$ ($x=${a}$)${maxVal ? '' : ''}`,
        };
      }
      const k = randInt(rng, 1, 4);
      const c = randNonZero(rng, -4, 4);
      // y = x^2 + c at x = k -> y0 = k^2 + c, slope = 2k
      const y0 = k * k + c;
      const slope = 2 * k;
      const intercept = y0 - slope * k;
      return {
        prompt: `曲線 $y = x^2 ${fmtSigned(c)}$ 上の点 $(${k}, \\ ${y0})$ における接線の方程式を求めよ。`,
        answer: `$y = ${slope}x ${fmtSigned(intercept)}$`,
      };
    }

    case 'hs2_def_int_area': {
      const r1 = randInt(rng, -3, 1);
      const d = randInt(rng, 2, 5);
      const r2 = r1 + d;
      const b = -(r1 + r2);
      const c = r1 * r2;
      return {
        prompt: `放物線 $y = x^2 ${fmtSigned(b)}x ${fmtSigned(c)}$ と $x$ 軸で囲まれた図形の面積 $S$ を求めよ。`,
        answer: `$\\frac{1}{6}$公式より $S = \\frac{1}{6}(${r2} - (${r1}))^3 = ${fmtFrac(d * d * d, 6)}$`,
      };
    }

    // ===== 数学B =====
    case 'hsb_sigma_diff': {
      const a = randInt(rng, 2, 5);
      const b = randNonZero(rng, -4, 4);
      const n = randInt(rng, 5, 10);
      const sum = a * ((n * (n + 1)) / 2) + b * n;
      return {
        prompt: `$\\displaystyle \\sum_{k=1}^{${n}} (${a}k ${fmtSigned(b)})$ の値を求めよ。`,
        answer: `$${sum}$`,
      };
    }

    case 'hsb_recurrence': {
      const p = pick(rng, [2, 3]);
      const alpha = randNonZero(rng, -3, 3);
      const q = alpha * (1 - p);
      const c = randNonZero(rng, 1, 3);
      const a1 = alpha + c;
      return {
        prompt: `$a_1 = ${a1}, \\ a_{n+1} = ${p}a_n ${fmtSigned(q)}$ で定められる数列 $\\{a_n\\}$ の一般項 $a_n$ を求めよ。`,
        answer: `$a_{n+1} ${fmtSigned(-alpha)} = ${p}(a_n ${fmtSigned(-alpha)})$ より $a_n = ${c}\\cdot ${p}^{n-1} ${fmtSigned(alpha)}$`,
      };
    }

    case 'hsb_binomial_dist': {
      const n = pick(rng, [18, 24, 36, 48, 60]);
      const den = pick(rng, [2, 3, 6]);
      const exp = n / den;
      const variance = fmtFrac(n * (den - 1), den * den);
      return {
        prompt: `確率変数 $X$ が二項分布 $B\\left(${n}, \\ \\frac{1}{${den}}\\right)$ に従うとき、期待値 $E(X)$ と分散 $V(X)$ を求めよ。`,
        answer: `$E(X) = ${exp}, \\ V(X) = ${variance}$`,
      };
    }

    // ===== 数学C =====
    case 'hsc_vec_angle_perp': {
      const a1 = randNonZero(rng, -4, 4);
      const a2 = randNonZero(rng, 1, 4);
      const k = randNonZero(rng, -3, 3);
      const b2 = k * a1;
      const x = -k * a2;
      return {
        prompt: `2つのベクトル $\\vec{a} = (${a1}, \\ ${a2}), \\ \\vec{b} = (x, \\ ${b2})$ が垂直となるように、実数 $x$ の値を定めよ。`,
        answer: `$\\vec{a}\\cdot\\vec{b} = 0$ より $x = ${x}$`,
      };
    }

    case 'hsc_conics': {
      const mode = (params.mode as string) || 'parabola';
      if (mode === 'ellipse') {
        const b = randInt(rng, 2, 4);
        const c = randInt(rng, 1, 3);
        const a2 = b * b + c * c;
        return {
          prompt: `楕円 $\\displaystyle \\frac{x^2}{${a2}} + \\frac{y^2}{${b * b}} = 1$ の焦点の座標を求めよ。`,
          answer: `$(\\pm ${c}, \\ 0)$`,
        };
      }
      const p = randInt(rng, 1, 6);
      return {
        prompt: `放物線 $y^2 = ${4 * p}x$ の焦点の座標と準線の方程式を求めよ。`,
        answer: `焦点 $(${p}, \\ 0)$、準線 $x = -${p}$`,
      };
    }

    case 'hsc_complex_polar': {
      const bank: GeneratedProblem[] = [
        {
          prompt: '複素数 $z = 1 + \\sqrt{3}i$ を極形式で表せ（$0 \\le \\theta < 2\\pi$）。',
          answer: '$\\displaystyle 2\\left(\\cos\\frac{\\pi}{3} + i\\sin\\frac{\\pi}{3}\\right)$',
        },
        {
          prompt: '複素数 $z = \\sqrt{3} + i$ を極形式で表せ（$0 \\le \\theta < 2\\pi$）。',
          answer: '$\\displaystyle 2\\left(\\cos\\frac{\\pi}{6} + i\\sin\\frac{\\pi}{6}\\right)$',
        },
        {
          prompt: '複素数 $z = 1 + i$ を極形式で表せ（$0 \\le \\theta < 2\\pi$）。',
          answer: '$\\displaystyle \\sqrt{2}\\left(\\cos\\frac{\\pi}{4} + i\\sin\\frac{\\pi}{4}\\right)$',
        },
        {
          prompt: 'ド・モアブルの定理を用いて $(1 + i)^4$ を計算せよ。',
          answer: '$-4$',
        },
        {
          prompt: 'ド・モアブルの定理を用いて $\\left(\\cos\\frac{\\pi}{6} + i\\sin\\frac{\\pi}{6}\\right)^3$ を計算せよ。',
          answer: '$i$',
        },
        {
          prompt: 'ド・モアブルの定理を用いて $(1 + \\sqrt{3}i)^3$ を計算せよ。',
          answer: '$-8$',
        },
      ];
      return pick(rng, bank);
    }

    // ===== 数学Ⅲ =====
    case 'hs3_limits': {
      const mode = (params.mode as string) || 'rational';
      if (mode === 'series') {
        const a = randInt(rng, 1, 6);
        const d = randInt(rng, 2, 5);
        return {
          prompt: `初項 $${a}$、公比 $\\frac{1}{${d}}$ の無限等比級数の和を求めよ。`,
          answer: `$\\displaystyle \\frac{${a}}{1 - \\frac{1}{${d}}} = ${fmtFrac(a * d, d - 1)}$`,
        };
      }
      if (mode === 'trig') {
        const a = randInt(rng, 2, 7);
        const b = randInt(rng, 1, 5);
        return {
          prompt: `$\\displaystyle \\lim_{x \\to 0} \\frac{\\sin ${a}x}{${b}x}$ を求めよ。`,
          answer: `$\\displaystyle ${fmtFrac(a, b)}$`,
        };
      }
      const a = randInt(rng, 2, 8);
      const b = randNonZero(rng, -5, 5);
      const d = randInt(rng, 1, 6);
      const e = randNonZero(rng, -5, 5);
      return {
        prompt: `$\\displaystyle \\lim_{n \\to \\infty} \\frac{${a}n^2 ${fmtSigned(b)}n + 1}{${d}n^2 ${fmtSigned(e)}n + 3}$ を求めよ。`,
        answer: `$\\displaystyle ${fmtFrac(a, d)}$`,
      };
    }

    case 'hs3_diff_adv': {
      const a = randInt(rng, 2, 6);
      const kind = pick(rng, ['exp', 'sin', 'cos', 'log', 'prod'] as const);
      if (kind === 'exp') {
        return {
          prompt: `$y = e^{${a}x}$ を微分せよ。`,
          answer: `$y' = ${a}e^{${a}x}$`,
        };
      }
      if (kind === 'sin') {
        return {
          prompt: `$y = \\sin(${a}x)$ を微分せよ。`,
          answer: `$y' = ${a}\\cos(${a}x)$`,
        };
      }
      if (kind === 'cos') {
        return {
          prompt: `$y = \\cos(${a}x)$ を微分せよ。`,
          answer: `$y' = -${a}\\sin(${a}x)$`,
        };
      }
      if (kind === 'log') {
        const b = randInt(rng, 1, 5);
        return {
          prompt: `$y = \\log(${a}x + ${b})$ を微分せよ。`,
          answer: `$\\displaystyle y' = \\frac{${a}}{${a}x + ${b}}$`,
        };
      }
      return {
        prompt: `$y = x e^{${a}x}$ を微分せよ。`,
        answer: `$y' = (1 + ${a}x)e^{${a}x}$`,
      };
    }

    case 'hs3_int_parts': {
      const bank: GeneratedProblem[] = [
        {
          prompt: '$\\displaystyle \\int x e^x \\, dx$ を求めよ。',
          answer: '$(x - 1)e^x + C$',
        },
        {
          prompt: '$\\displaystyle \\int x \\cos x \\, dx$ を求めよ。',
          answer: '$x\\sin x + \\cos x + C$',
        },
        {
          prompt: '$\\displaystyle \\int x \\sin x \\, dx$ を求めよ。',
          answer: '$-x\\cos x + \\sin x + C$',
        },
        {
          prompt: '$\\displaystyle \\int \\log x \\, dx$ を求めよ。',
          answer: '$x\\log x - x + C$',
        },
        {
          prompt: '$\\displaystyle \\int x e^{2x} \\, dx$ を求めよ。',
          answer: '$\\displaystyle \\frac{1}{4}(2x - 1)e^{2x} + C$',
        },
        {
          prompt: '$\\displaystyle \\int_0^1 x e^x \\, dx$ を求めよ。',
          answer: '$1$',
        },
        {
          prompt: '$\\displaystyle \\int_1^e \\log x \\, dx$ を求めよ。',
          answer: '$1$',
        },
        {
          prompt: '$\\displaystyle \\int_0^{\\frac{\\pi}{2}} x \\cos x \\, dx$ を求めよ。',
          answer: '$\\displaystyle \\frac{\\pi}{2} - 1$',
        },
      ];
      return pick(rng, bank);
    }

    case 'hs3_int_volume': {
      const a = randInt(rng, 1, 3);
      const b = randInt(rng, 1, 3);
      return {
        prompt: `曲線 $y = ${a === 1 ? '' : a}\\sqrt{x}$ と $x$ 軸および直線 $x = ${b}$ で囲まれた図形を $x$ 軸のまわりに1回転してできる立体の体積 $V$ を求めよ。`,
        answer: `$\\displaystyle V = \\pi \\int_0^{${b}} ${a * a}x \\, dx = ${fmtFrac(a * a * b * b, 2)}\\pi$`,
      };
    }

    // ===== 大学入試（茨城大・筑波大 二次試験レベル M〜O教材相当） =====
    case 'univ_qf_moving_axis': {
      const r = randInt(rng, 2, 4);
      const c = randInt(rng, 1, 5);
      return {
        prompt: `実数 $a$ に対し、関数 $f(x) = x^2 - 2ax + ${c} \\ (0 \\le x \\le ${r})$ の最小値 $m(a)$ を $a$ の値で場合分けして求めよ。`,
        answer: `$a < 0$ のとき $m(a) = ${c}$、$0 \\le a \\le ${r}$ のとき $m(a) = -a^2 + ${c}$、$a > ${r}$ のとき $m(a) = ${r * r + c} - ${2 * r}a$`,
      };
    }

    case 'univ_const_sep': {
      const a = randInt(rng, 1, 3);
      const peak = 2 * a * a * a;
      return {
        prompt: `3次方程式 $x^3 - ${3 * a * a}x - k = 0$ が異なる3つの実数解をもつとき、定数 $k$ の値の範囲を求めよ。`,
        answer: `$k = x^3 - ${3 * a * a}x$ と定数分離し、極大値 $${peak}$・極小値 $-${peak}$ より **$-${peak} < k < ${peak}$**`,
      };
    }

    case 'univ_int_equation': {
      const mode = (params.mode as string) || 'const';
      if (mode === 'var') {
        const a = randInt(rng, 2, 5);
        const b = randNonZero(rng, -4, 4);
        return {
          prompt: `等式 $\\displaystyle \\int_1^x f(t) \\, dt = x^3 ${fmtSigned(a)}x^2 ${fmtSigned(b)}x + c$ を満たす関数 $f(x)$ と定数 $c$ を求めよ。`,
          answer: `両辺を $x$ で微分して $f(x) = 3x^2 ${fmtSigned(2 * a)}x ${fmtSigned(b)}$、$x=1$ 代入より $c = ${-(1 + a + b)}$`,
        };
      }
      const k = randInt(rng, 2, 5);
      // f(x) = kx + int_0^1 f(t) dt -> a = k/2 + a? Wait: let's use f(x) = kx + 2*int_0^1 f(t) dt -> a = k/2 + 2a -> a = -k/2
      return {
        prompt: `等式 $\\displaystyle f(x) = ${k * 2}x + 2\\int_0^1 f(t) \\, dt$ を満たす関数 $f(x)$ を求めよ。`,
        answer: `$a = \\int_0^1 f(t)\\,dt$ とおくと $a = ${k} + 2a \\implies a = -${k}$、よって $f(x) = ${k * 2}x - ${k * 2}$`,
      };
    }

    case 'univ_seq_sn_an': {
      const a = randInt(rng, 1, 4);
      const b = randInt(rng, 1, 5);
      // S_n = a n^2 + b n -> a_1 = a+b, for n>=2: a_n = 2an + (b - a)
      const c = b - a;
      return {
        prompt: `初項から第 $n$ 項までの和 $S_n$ が $S_n = ${a}n^2 + ${b}n$ で表される数列 $\\{a_n\\}$ の一般項 $a_n$ を求めよ。`,
        answer: `$n \\ge 2$ で $a_n = S_n - S_{n-1} = ${2 * a}n ${c === 0 ? '' : fmtSigned(c)}$（$n=1$ でも成立）`,
      };
    }

    case 'univ_space_vec': {
      const a = randInt(rng, 1, 3);
      const b = randInt(rng, 1, 3);
      const c = randInt(rng, 1, 3);
      const norm2 = a * a + b * b + c * c;
      return {
        prompt: `空間の2点 $\\mathrm{A}(${a}, ${b}, ${c}), \\ \\mathrm{B}(${a * 2}, 0, ${c})$ に対し、内積 $\\overrightarrow{\\mathrm{OA}} \\cdot \\overrightarrow{\\mathrm{OB}}$ と $|\\overrightarrow{\\mathrm{OA}}|^2$ を求めよ。`,
        answer: `$\\overrightarrow{\\mathrm{OA}} \\cdot \\overrightarrow{\\mathrm{OB}} = ${2 * a * a + c * c}, \\ |\\overrightarrow{\\mathrm{OA}}|^2 = ${norm2}$`,
      };
    }

    case 'univ_complex_rot': {
      const a = randInt(rng, 1, 4);
      const b = randInt(rng, 1, 4);
      return {
        prompt: `複素数平面上で、点 $z = ${a} + ${b}i$ を原点のまわりに $\\frac{\\pi}{2}$ だけ回転した点 $w$ を求めよ。`,
        answer: `$w = i(${a} + ${b}i) = -${b} + ${a}i$`,
      };
    }

    case 'univ_riemann_sum': {
      const p = pick(rng, [1, 2, 3]);
      return {
        prompt: `区分求積法を用いて $\\displaystyle \\lim_{n \\to \\infty} \\frac{1}{n} \\sum_{k=1}^{n} \\left(\\frac{k}{n}\\right)^{${p}}$ の極限値を求めよ。`,
        answer: `$\\displaystyle \\int_0^1 x^{${p}} \\, dx = \\frac{1}{${p + 1}}$`,
      };
    }

    case 'univ_trig_sub_int': {
      const a = randInt(rng, 1, 4);
      return {
        prompt: `$x = ${a}\\sin\\theta$ と置換して、定積分 $\\displaystyle \\int_0^{${a}} \\sqrt{${a * a} - x^2} \\, dx$ を求めよ。`,
        answer: `$\\displaystyle ${a * a}\\int_0^{\\frac{\\pi}{2}} \\cos^2\\theta \\, d\\theta = ${fmtFrac(a * a, 4)}\\pi$`,
      };
    }

    case 'univ_prob_recurrence': {
      const n = randInt(rng, 2, 4);
      return {
        prompt: `1個のさいころを $n$ 回投げて出た目の和が偶数になる確率を $p_n$ とする。$p_1$ と $p_{n+1}$ を $p_n$ で表す漸化式を求め、$p_{${n}}$ を求めよ。`,
        answer: `$p_1 = \\frac{1}{2}, \\ p_{n+1} = \\frac{1}{2}p_n + \\frac{1}{2}(1-p_n) = \\frac{1}{2}$ より $p_{${n}} = \\frac{1}{2}$`,
      };
    }

    // ===== 全国国公立59校網羅調査による新規追加テンプレート（数Ⅰ〜数Ⅲ・二次大問） =====
    case 'hs1_cubic_expand_factor': {
      const mode = (params.mode as string) || 'factor';
      const a = randInt(rng, 1, 4);
      if (mode === 'decimal') {
        const n = pick(rng, [2, 3, 5, 6, 7, 10, 11]);
        const intPart = Math.floor(Math.sqrt(n));
        return {
          prompt: `$\\sqrt{${n}}$ の整数部分 $a$ と小数部分 $b$ を求めよ。`,
          answer: `$${intPart} < \\sqrt{${n}} < ${intPart + 1}$ より $a = ${intPart}, \\ b = \\sqrt{${n}} - ${intPart}$`,
        };
      }
      if (mode === 'expand') {
        return {
          prompt: `$(x + ${a})^3$ を展開せよ。`,
          answer: `$x^3 + ${3 * a}x^2 + ${3 * a * a}x + ${a * a * a}$`,
        };
      }
      return {
        prompt: `$x^3 + ${a * a * a}$ を因数分解せよ。`,
        answer: `$(x + ${a})(x^2 - ${a}x + ${a * a})$`,
      };
    }

    case 'hs1_qf_root_loc': {
      const a = randInt(rng, 1, 3);
      // x^2 - 2ax + k = 0 has two distinct positive roots -> axis a>0 (OK), D/4 = a^2 - k > 0 => k < a^2, f(0) = k > 0
      return {
        prompt: `2次方程式 $x^2 - ${2 * a}x + k = 0$ が異なる2つの正の解をもつとき、定数 $k$ の値の範囲を求めよ。`,
        answer: `軸 $x=${a}>0$、$D/4 = ${a * a} - k > 0$、$f(0) = k > 0$ より **$0 < k < ${a * a}$**`,
      };
    }

    case 'hs1_stats_corr': {
      const mode = (params.mode as string) || 'corr';
      if (mode === 'transform') {
        const a = randInt(rng, 2, 5);
        const b = randNonZero(rng, -6, 6);
        const m = randInt(rng, 4, 10);
        const v = randInt(rng, 2, 5);
        return {
          prompt: `平均値 $${m}$、分散 $${v}$ の変量 $x$ を $y = ${a}x ${fmtSigned(b)}$ で変換したとき、$y$ の平均値と分散を求めよ。`,
          answer: `平均値 $${a * m + b}$、分散 $${a * a * v}$`,
        };
      }
      const sx = pick(rng, [2, 3, 4, 5]);
      const sy = pick(rng, [2, 4, 5]);
      const cov = randInt(rng, 1, sx * sy - 1);
      return {
        prompt: `2つの変量 $x, y$ の標準偏差が $s_x = ${sx}, \\ s_y = ${sy}$、共分散が $s_{xy} = ${cov}$ のとき、相関係数 $r$ を求めよ。`,
        answer: `$\\displaystyle r = \\frac{s_{xy}}{s_x s_y} = ${fmtFrac(cov, sx * sy)}$`,
      };
    }

    case 'hsa_perm_comb_adv': {
      const mode = (params.mode as string) || 'circle';
      if (mode === 'same') {
        const a = randInt(rng, 2, 3);
        const b = randInt(rng, 2, 3);
        const total = a + b;
        return {
          prompt: `同じ文字 $\\mathrm{A}$ が $${a}$ 個、$\\mathrm{B}$ が $${b}$ 個の計 $${total}$ 個を一列に並べる方法は何通りあるか。`,
          answer: `$\\displaystyle \\frac{${total}!}{${a}!\\,${b}!} = ${nCr(total, a)}$ 通り`,
        };
      }
      if (mode === 'rep_comb') {
        const n = 3;
        const r = randInt(rng, 3, 6);
        return {
          prompt: `3種類の果物から重複を許して $${r}$ 個選ぶ組合せは何通りあるか（$_3\\mathrm{H}_{${r}}$）。`,
          answer: `$_{${n + r - 1}}\\mathrm{C}_{${r}} = ${nCr(n + r - 1, r)}$ 通り`,
        };
      }
      const n = randInt(rng, 4, 7);
      let fact = 1;
      for (let i = 2; i <= n - 1; i += 1) fact *= i;
      return {
        prompt: `異なる $${n}$ 人が円形のテーブルに座る座り方は何通りあるか。`,
        answer: `$(${n}-1)! = ${fact}$ 通り`,
      };
    }

    case 'hsa_cond_prob_exp': {
      const mode = (params.mode as string) || 'cond';
      if (mode === 'exp') {
        const prize = pick(rng, [300, 600, 900, 1200]);
        const win = randInt(rng, 1, 2);
        const total = 6;
        return {
          prompt: `1個のさいころを投げて $${win === 1 ? '6の目' : '5以上の目'}$ が出たら $${prize}$ 円もらえ、それ以外は $0$ 円のゲームがある。賞金の期待値を求めよ。`,
          answer: `$\\displaystyle ${prize} \\times \\frac{${win}}{${total}} = ${(prize * win) / total}$ 円`,
        };
      }
      const r = randInt(rng, 2, 5);
      const w = randInt(rng, 2, 4);
      const total = r + w;
      return {
        prompt: `赤玉 $${r}$ 個、白玉 $${w}$ 個が入った袋から玉を1個ずつ2回取り出す（戻さない）。1回目が赤玉だったとき、2回目も赤玉である条件付き確率を求めよ。`,
        answer: `残り $${total - 1}$ 個中赤玉 $${r - 1}$ 個より $\\displaystyle ${fmtFrac(r - 1, total - 1)}$`,
      };
    }

    case 'hsa_ceva_menelaus': {
      const mode = (params.mode as string) || 'ceva';
      const a = randInt(rng, 1, 4);
      const b = randInt(rng, 2, 5);
      const c = randInt(rng, 1, 4);
      const d = randInt(rng, 2, 5);
      if (mode === 'menelaus') {
        return {
          prompt: `メネラウスの定理で $\\displaystyle \\frac{\\mathrm{AR}}{\\mathrm{RB}}\\cdot\\frac{\\mathrm{BP}}{\\mathrm{PC}}\\cdot\\frac{\\mathrm{CQ}}{\\mathrm{QA}} = 1$ が成り立ち、$\\frac{\\mathrm{AR}}{\\mathrm{RB}} = \\frac{${a}}{${b}}, \\ \\frac{\\mathrm{BP}}{\\mathrm{PC}} = \\frac{${c}}{${d}}$ のとき、$\\frac{\\mathrm{CQ}}{\\mathrm{QA}}$ を求めよ。`,
          answer: `$\\displaystyle ${fmtFrac(b * d, a * c)}$`,
        };
      }
      return {
        prompt: `$\\triangle\\mathrm{ABC}$ でチェバの定理 $\\displaystyle \\frac{\\mathrm{AR}}{\\mathrm{RB}}\\cdot\\frac{\\mathrm{BP}}{\\mathrm{PC}}\\cdot\\frac{\\mathrm{CQ}}{\\mathrm{QA}} = 1$ を適用し、$\\mathrm{AR}:\\mathrm{RB} = ${a}:${b}, \\ \\mathrm{BP}:\\mathrm{PC} = ${c}:${d}$ のとき、$\\mathrm{CQ}:\\mathrm{QA}$ を求めよ。`,
        answer: `$${b * d} : ${a * c}$` + (gcd(b * d, a * c) > 1 ? `（簡単にすると $${(b * d) / gcd(b * d, a * c)} : ${(a * c) / gcd(b * d, a * c)}$）` : ''),
      };
    }

    case 'hsa_euclid_mod': {
      const mode = (params.mode as string) || 'diophantine';
      if (mode === 'mod') {
        const m = pick(rng, [3, 5, 7]);
        const p = randInt(rng, 4, 8);
        const base = m + 1;
        return {
          prompt: `合同式を用いて $${base}^{${p}}$ を $${m}$ で割った余りを求めよ。`,
          answer: `$${base} \\equiv 1 \\pmod{${m}}$ より $${base}^{${p}} \\equiv 1^{${p}} = 1 \\pmod{${m}}$、よって余り **$1$**`,
        };
      }
      const bank: GeneratedProblem[] = [
        {
          prompt: '一次不定方程式 $3x + 2y = 1$ の整数解をすべて求めよ（$k$ を整数とする）。',
          answer: '特殊解 $(1, -1)$ より $x = 2k + 1, \\ y = -3k - 1$',
        },
        {
          prompt: '一次不定方程式 $5x + 3y = 1$ の整数解をすべて求めよ（$k$ を整数とする）。',
          answer: '特殊解 $(2, -3)$ より $x = 3k + 2, \\ y = -5k - 3$',
        },
        {
          prompt: '一次不定方程式 $7x + 4y = 1$ の整数解をすべて求めよ（$k$ を整数とする）。',
          answer: '特殊解 $(-1, 2)$ より $x = 4k - 1, \\ y = -7k + 2$',
        },
        {
          prompt: '一次不定方程式 $4x - 3y = 1$ の整数解をすべて求めよ（$k$ を整数とする）。',
          answer: '特殊解 $(1, 1)$ より $x = 3k + 1, \\ y = 4k + 1$',
        },
        {
          prompt: '一次不定方程式 $5x - 2y = 1$ の整数解をすべて求めよ（$k$ を整数とする）。',
          answer: '特殊解 $(1, 2)$ より $x = 2k + 1, \\ y = 5k + 2$',
        },
      ];
      return pick(rng, bank);
    }

    case 'hs2_identity_amgm': {
      const mode = (params.mode as string) || 'amgm';
      if (mode === 'identity') {
        const a = randInt(rng, 2, 5);
        const b = randNonZero(rng, -4, 4);
        const c = randNonZero(rng, -5, 5);
        return {
          prompt: `$${a}x^2 ${fmtSigned(b)}x ${fmtSigned(c)} = p(x-1)^2 + q(x-1) + r$ が $x$ の恒等式となるとき、定数 $p, q, r$ を求めよ。`,
          answer: `$p = ${a}, \\ q = ${2 * a + b}, \\ r = ${a + b + c}$`,
        };
      }
      const k = pick(rng, [1, 4, 9, 16, 25]);
      const rt = Math.round(Math.sqrt(k));
      return {
        prompt: `$x > 0$ のとき、相加平均と相乗平均の大小関係を用いて $x + \\frac{${k}}{x}$ の最小値と、そのときの $x$ の値を求めよ。`,
        answer: `最小値 $${2 * rt}$（等号成立は $x = ${rt}$ のとき）`,
      };
    }

    case 'hs2_circle_region': {
      const mode = (params.mode as string) || 'tangent';
      if (mode === 'lp') {
        const a = randInt(rng, 2, 4);
        const b = randInt(rng, 1, 3);
        const r = randInt(rng, 2, 4);
        return {
          prompt: `連立不等式 $x \\ge 0, \\ y \\ge 0, \\ x + y \\le ${r}$ の表す領域で、$k = ${a}x + ${b}y$ の最大値を求めよ。`,
          answer: `領域の頂点 $(0,0), (${r},0), (0,${r})$ を比較して最大値 $${Math.max(a, b) * r}$`,
        };
      }
      const pts: Array<[number, number, number]> = [
        [3, 4, 25],
        [4, 3, 25],
        [1, 2, 5],
        [2, 1, 5],
        [3, -4, 25],
      ];
      const [x1, y1, r2] = pick(rng, pts);
      return {
        prompt: `円 $x^2 + y^2 = ${r2}$ 上の点 $(${x1}, \\ ${y1})$ における接線の方程式を求めよ。`,
        answer: `$${x1}x ${fmtSigned(y1)}y = ${r2}$`,
      };
    }

    case 'hs2_trig_eq_log_digits': {
      const mode = (params.mode as string) || 'digits';
      if (mode === 'trig_eq') {
        const bank: GeneratedProblem[] = [
          { prompt: '$0 \\le \\theta < 2\\pi$ のとき、方程式 $\\sin\\theta = \\frac{1}{2}$ を解け。', answer: '$\\displaystyle \\theta = \\frac{\\pi}{6}, \\ \\frac{5}{6}\\pi$' },
          { prompt: '$0 \\le \\theta < 2\\pi$ のとき、方程式 $\\cos\\theta = \\frac{1}{2}$ を解け。', answer: '$\\displaystyle \\theta = \\frac{\\pi}{3}, \\ \\frac{5}{3}\\pi$' },
          { prompt: '$0 \\le \\theta < 2\\pi$ のとき、方程式 $\\sin\\theta = \\frac{\\sqrt{3}}{2}$ を解け。', answer: '$\\displaystyle \\theta = \\frac{\\pi}{3}, \\ \\frac{2}{3}\\pi$' },
          { prompt: '$0 \\le \\theta < 2\\pi$ のとき、方程式 $\\cos\\theta = -\\frac{1}{2}$ を解け。', answer: '$\\displaystyle \\theta = \\frac{2}{3}\\pi, \\ \\frac{4}{3}\\pi$' },
          { prompt: '$0 \\le \\theta < 2\\pi$ のとき、方程式 $\\tan\\theta = 1$ を解け。', answer: '$\\displaystyle \\theta = \\frac{\\pi}{4}, \\ \\frac{5}{4}\\pi$' },
        ];
        return pick(rng, bank);
      }
      const n = pick(rng, [10, 20, 30, 50, 100]);
      const logVal = Number((n * 0.301).toFixed(3));
      const digits = Math.floor(logVal) + 1;
      return {
        prompt: `$\\log_{10} 2 = 0.3010$ とするとき、$2^{${n}}$ は何桁の整数か求めよ。`,
        answer: `$\\log_{10} 2^{${n}} = ${logVal}$ より **${digits} 桁**`,
      };
    }

    case 'hsb_diff_group_induct': {
      const mode = (params.mode as string) || 'diff';
      if (mode === 'group') {
        const k = randInt(rng, 4, 8);
        const start = ((k - 1) * k) / 2 + 1;
        return {
          prompt: `自然数の列を $1 \\mid 2, 3 \\mid 4, 5, 6 \\mid 7, 8, 9, 10 \\mid \\cdots$ のように第 $n$ 群に $n$ 個の数が入るように分けるとき、第 $${k}$ 群の最初の数を求めよ。`,
          answer: `第 $${k - 1}$ 群までの個数の和 $+ 1 = \\frac{${k - 1}\\cdot ${k}}{2} + 1 = ${start}$`,
        };
      }
      const a1 = randInt(rng, 1, 5);
      const d = randInt(rng, 2, 4);
      // b_n = d*n -> a_n = a1 + sum_{k=1}^{n-1} d*k = a1 + d*n(n-1)/2
      return {
        prompt: `初項 $a_1 = ${a1}$、階差数列が $b_n = ${d}n$ である数列 $\\{a_n\\}$ の一般項 $a_n$ を求めよ。`,
        answer: `$n \\ge 2$ で $a_n = ${a1} + \\sum_{k=1}^{n-1} ${d}k = ${fmtFrac(d, 2)}n^2 ${fmtSigned(-d / 2 === Math.floor(-d / 2) ? -d / 2 : 0)}n \\cdots \\Rightarrow \\displaystyle ${a1} + \\frac{${d}}{2}n(n-1)$（$n=1$ でも成立）`,
      };
    }

    case 'hsb_normal_conf': {
      const m = pick(rng, [50, 60, 70, 100]);
      const sigma = pick(rng, [5, 10]);
      const k = pick(rng, [1, 2, -1]);
      const x = m + k * sigma;
      return {
        prompt: `確率変数 $X$ が正規分布 $N(${m}, \\ ${sigma}^2)$ に従うとき、$X = ${x}$ に対応する標準正規分布 $Z = \\frac{X - m}{\\sigma}$ の値を求めよ。`,
        answer: `$\\displaystyle Z = \\frac{${x} - ${m}}{${sigma}} = ${k}$`,
      };
    }

    case 'hsc_pos_vec_space': {
      const mode = (params.mode as string) || 'pos';
      if (mode === 'space_foot') {
        const a = randInt(rng, 1, 3);
        const b = randInt(rng, 1, 3);
        const c = randInt(rng, 2, 5);
        return {
          prompt: `空間の点 $\\mathrm{P}(${a}, \\ ${b}, \\ ${c})$ から $xy$ 平面に下ろした垂線の足 $\\mathrm{H}$ の座標と線分 $\\mathrm{PH}$ の長さを求めよ。`,
          answer: `$\\mathrm{H}(${a}, \\ ${b}, \\ 0)$、$\\mathrm{PH} = ${c}$`,
        };
      }
      const m = randInt(rng, 1, 3);
      const n = randInt(rng, 2, 4);
      return {
        prompt: `2点 $\\mathrm{A}(\\vec{a}), \\ \\mathrm{B}(\\vec{b})$ を結ぶ線分 $\\mathrm{AB}$ を $${m} : ${n}$ に内分する点 $\\mathrm{P}$ の位置ベクトル $\\vec{p}$ を表せ。`,
        answer: `$\\displaystyle \\vec{p} = \\frac{${n}\\vec{a} + ${m}\\vec{b}}{${m + n}}$`,
      };
    }

    case 'hsc_hyperbola_polar': {
      const mode = (params.mode as string) || 'hyperbola';
      if (mode === 'polar') {
        const r = randInt(rng, 2, 6);
        return {
          prompt: `極座標 $\\left(${r}, \\ \\frac{\\pi}{3}\\right)$ で表される点の直交座標 $(x, y)$ を求めよ。`,
          answer: `$\\displaystyle \\left(${fmtFrac(r, 2)}, \\ ${fmtFrac(r, 2)}\\sqrt{3}\\right)$`,
        };
      }
      const a = randInt(rng, 2, 4);
      const b = randInt(rng, 2, 4);
      return {
        prompt: `双曲線 $\\displaystyle \\frac{x^2}{${a * a}} - \\frac{y^2}{${b * b}} = 1$ の漸近線の方程式を求めよ。`,
        answer: `$\\displaystyle y = \\pm ${fmtFrac(b, a)}x$`,
      };
    }

    case 'hsc_complex_geom': {
      const bank: GeneratedProblem[] = [
        {
          prompt: '複素数平面上で、方程式 $|z - 2| = |z - 4i|$ を満たす点 $z$ はどのような図形を描くか。',
          answer: '2点 $2$ と $4i$ を結ぶ線分の垂直二等分線',
        },
        {
          prompt: '複素数平面上で、方程式 $|z - (1 + 2i)| = 3$ を満たす点 $z$ はどのような図形を描くか。',
          answer: '点 $1 + 2i$ を中心とする半径 $3$ の円',
        },
        {
          prompt: '複素数平面上で、3点 $\\alpha, \\beta, \\gamma$ について $\\frac{\\gamma - \\alpha}{\\beta - \\alpha}$ が純虚数であるとき、2直線 $\\mathrm{AB}$ と $\\mathrm{AC}$ の位置関係を答えよ。',
          answer: '$\\mathrm{AB} \\perp \\mathrm{AC}$（垂直に交わる）',
        },
        {
          prompt: '複素数平面上で、3点 $\\alpha, \\beta, \\gamma$ について $\\frac{\\gamma - \\alpha}{\\beta - \\alpha}$ が実数であるとき、3点の位置関係を答えよ。',
          answer: '3点 $\\mathrm{A, B, C}$ は一直線上にある',
        },
      ];
      return pick(rng, bank);
    }

    case 'hs3_lim_squeeze_cont': {
      const a = randInt(rng, 1, 5);
      return {
        prompt: `はさみうちの原理を用いて $\\displaystyle \\lim_{x \\to \\infty} \\frac{\\sin ${a}x}{x}$ を求めよ。`,
        answer: `$-\\frac{1}{x} \\le \\frac{\\sin ${a}x}{x} \\le \\frac{1}{x}$ より極限値は **$0$**`,
      };
    }

    case 'hs3_diff_quot_inflect': {
      const mode = (params.mode as string) || 'quot';
      if (mode === 'ineq') {
        return {
          prompt: '$x > 0$ のとき、微分を用いて不等式 $e^x > 1 + x$ が成り立つことを示す手順の要点を述べよ。',
          answer: '$f(x) = e^x - (1+x)$ とおくと $f(0) = 0$ かつ $x > 0$ で $f\'(x) = e^x - 1 > 0$ より単調増加となるため $f(x) > 0$',
        };
      }
      if (mode === 'inflect') {
        const a = randInt(rng, 1, 3);
        return {
          prompt: `曲線 $y = x^3 - ${3 * a}x^2 + 1$ の変曲点の $x$ 座標を求めよ。`,
          answer: `$y'' = 6x - ${6 * a} = 0$ より $x = ${a}$（前後で $y''$ の符号変化あり）`,
        };
      }
      const a = randInt(rng, 1, 4);
      return {
        prompt: `商の微分公式を用いて $\\displaystyle y = \\frac{x}{x + ${a}}$ を微分せよ。`,
        answer: `$\\displaystyle y' = \\frac{${a}}{(x + ${a})^2}$`,
      };
    }

    case 'hs3_int_yvol_len': {
      const mode = (params.mode as string) || 'yvol';
      if (mode === 'length') {
        const a = randInt(rng, 2, 5);
        return {
          prompt: `媒介変数表示 $x = ${a}\\cos t, \\ y = ${a}\\sin t \\ (0 \\le t \\le \\pi)$ で表される曲線の長さ $L$ を求めよ。`,
          answer: `$\\displaystyle L = \\int_0^{\\pi} \\sqrt{(-${a}\\sin t)^2 + (${a}\\cos t)^2}\\,dt = ${a}\\pi$`,
        };
      }
      const h = randInt(rng, 2, 5);
      return {
        prompt: `曲線 $y = x^2 \\ (x \\ge 0)$ と $y$ 軸および直線 $y = ${h}$ で囲まれた図形を $y$ 軸のまわりに1回転した体積 $V$ を求めよ。`,
        answer: `$\\displaystyle V = \\pi \\int_0^{${h}} x^2\\,dy = \\pi \\int_0^{${h}} y\\,dy = ${fmtFrac(h * h, 2)}\\pi$`,
      };
    }

    case 'univ_guided_multipart': {
      const bank: GeneratedProblem[] = [
        {
          prompt: '【国公立二次・誘導大問】関数 $f(x) = \\frac{\\log x}{x} \\ (x > 0)$ について、(1) $f\'(x) = 0$ を解け。(2) $f(x)$ の最大値を求めよ。(3) $e^{\\pi}$ と $\\pi^e$ の大小を比較せよ。',
          answer: '(1) $x = e$ (2) 最大値 $\\frac{1}{e}$（$x=e$） (3) $f(e) > f(\\pi)$ より $\\frac{1}{e} > \\frac{\\log \\pi}{\\pi} \\implies e^{\\pi} > \\pi^e$',
        },
        {
          prompt: '【国公立二次・誘導大問】$n$ を自然数とするとき、(1) $n^3 - n$ を因数分解せよ。(2) $n^3 - n$ が $6$ の倍数であることを示せ。',
          answer: '(1) $(n-1)n(n+1)$ (2) 連続する3整数の積なので2の倍数かつ3の倍数となり、$2$ と $3$ は互いに素だから $6$ の倍数',
        },
        {
          prompt: '【国公立二次・誘導大問】座標空間の3点 $\\mathrm{A}(1,0,0), \\ \\mathrm{B}(0,1,0), \\ \\mathrm{C}(0,0,1)$ について、(1) $\\triangle\\mathrm{ABC}$ の面積を求めよ。(2) 原点 $\\mathrm{O}$ から平面 $\\mathrm{ABC}$ への距離を求めよ。',
          answer: '(1) 1辺 $\\sqrt{2}$ の正三角形なので $S = \\frac{\\sqrt{3}}{2}$ (2) 四面体 $\\mathrm{OABC}$ の体積 $\\frac{1}{6} = \\frac{1}{3} S h$ より $h = \\frac{1}{\\sqrt{3}} = \\frac{\\sqrt{3}}{3}$',
        },
        {
          prompt: '【国公立二次・誘導大問】曲線 $C: y = e^x$ について、(1) $C$ 上の点 $(t, e^t)$ における接線の方程式を求めよ。(2) 原点を通る接線の接点と方程式を求めよ。',
          answer: '(1) $y = e^t(x - t + 1)$ (2) $(0,0)$ 代入より $t = 1$、接点 $(1, e)$、接線 $y = ex$',
        },
        {
          prompt: '【国公立二次・誘導大問】数列 $a_1 = 1, \\ a_{n+1} = 2a_n + 3$ について、(1) $b_n = a_n + 3$ の満たす漸化式を求めよ。(2) $a_n$ の一般項を求めよ。(3) $\\sum_{k=1}^n a_k$ を求めよ。',
          answer: '(1) $b_{n+1} = 2b_n, \\ b_1 = 4$ (2) $a_n = 2^{n+1} - 3$ (3) $4(2^n - 1) - 3n = 2^{n+2} - 3n - 4$',
        },
      ];
      return pick(rng, bank);
    }

    default:
      return null;
  }
}
