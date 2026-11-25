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
      // y = a*sqrt(x) on [0, b] rotated around x-axis -> V = pi * int_0^b a^2 x dx = pi * a^2 * b^2 / 2
      return {
        prompt: `曲線 $y = ${a === 1 ? '' : a}\\sqrt{x}$ と $x$ 軸および直線 $x = ${b}$ で囲まれた図形を $x$ 軸のまわりに1回転してできる立体の体積 $V$ を求めよ。`,
        answer: `$\\displaystyle V = \\pi \\int_0^{${b}} ${a * a}x \\, dx = ${fmtFrac(a * a * b * b, 2)}\\pi$`,
      };
    }

    default:
      return null;
  }
}
