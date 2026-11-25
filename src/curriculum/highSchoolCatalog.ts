import type { MicroStepSpec, StageGroup } from './mathEngine';

interface SeriesBlueprint {
  prefix: string;
  stage: StageGroup;
  category: string;
  baseTitle: string;
  subLabels: string[];
  questionCount: number;
  explanation: string;
  template: string;
  paramsFn?: (idx: number) => Record<string, number | string | boolean>;
}

function expandSeries(bp: SeriesBlueprint): MicroStepSpec[] {
  return bp.subLabels.map((label, idx) => ({
    id: `${bp.prefix}-${String(idx + 1).padStart(3, '0')}`,
    stage: bp.stage,
    category: bp.category,
    title: `${bp.baseTitle}（${label}）`,
    questionCount: bp.questionCount,
    explanation: bp.explanation,
    template: bp.template,
    params: bp.paramsFn ? bp.paramsFn(idx) : {},
  }));
}

const SETS_8 = ['導入', '基本1', '基本2', '標準1', '標準2', '反復1', '反復2', '定着仕上げ'];
const SETS_6 = ['導入', '基本1', '基本2', '標準1', '標準2', '仕上げ'];
const SETS_5 = ['導入', '基本', '標準', '反復', '仕上げ'];

export function buildHighSchoolCatalog(): MicroStepSpec[] {
  const specs: MicroStepSpec[] = [];

  // ================= 高校 数学Ⅰ（約70ステップ・classpulse/slides 数学Ⅰ 1〜5章準拠） =================
  specs.push(
    ...expandSeries({
      prefix: 'H1-EXP',
      stage: '高校 数学Ⅰ',
      category: '1章 数と式',
      baseTitle: '1次式の積 (ax+b)(cx+d) の展開',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: '$(ax+b)(cx+d) = acx^2 + (ad+bc)x + bd$ を正確かつ素早く展開します。',
      template: 'expand_poly',
      paramsFn: () => ({ kind: 'ax_b_cx_d' }),
    }),
    ...expandSeries({
      prefix: 'H1-TASUKI',
      stage: '高校 数学Ⅰ',
      category: '1章 数と式',
      baseTitle: 'たすき掛けによる因数分解',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '$acx^2+(ad+bc)x+bd = (ax+b)(cx+d)$ となる組をたすき掛けで見つけます。',
      template: 'factor_poly',
      paramsFn: () => ({ kind: 'tasuki' }),
    }),
    ...expandSeries({
      prefix: 'H1-SQRT',
      stage: '高校 数学Ⅰ',
      category: '1章 数と式',
      baseTitle: '実数と分母の有理化',
      subLabels: SETS_5,
      questionCount: 12,
      explanation: '根号を含む分数式を簡潔な形に有理化します。',
      template: 'sqrt_calc',
      paramsFn: () => ({ kind: 'rationalize' }),
    }),
    ...expandSeries({
      prefix: 'H1-QF-SQ1',
      stage: '高校 数学Ⅰ',
      category: '3章 2次関数',
      baseTitle: '平方完成と頂点（x²の係数が1）',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '$y = x^2 + 2px + q = (x+p)^2 - p^2 + q$ と変形し、頂点 $(-p, -p^2+q)$ を求めます。',
      template: 'hs_complete_sq',
      paramsFn: () => ({ leadOne: 1 }),
    }),
    ...expandSeries({
      prefix: 'H1-QF-SQ2',
      stage: '高校 数学Ⅰ',
      category: '3章 2次関数',
      baseTitle: '平方完成と頂点（x²の係数がa）',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: 'まず $x^2$ と $x$ の項を係数 $a$ でくくり出してから平方完成します。',
      template: 'hs_complete_sq',
      paramsFn: () => ({ leadOne: 0 }),
    }),
    ...expandSeries({
      prefix: 'H1-QINEQ1',
      stage: '高校 数学Ⅰ',
      category: '3章 2次関数',
      baseTitle: '2次不等式（< 0 型）',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: '$(x-\\alpha)(x-\\beta) < 0 \\iff \\alpha < x < \\beta$（2解の間）をグラフと対応させて解きます。',
      template: 'hs_quad_ineq',
      paramsFn: () => ({ isGt: false }),
    }),
    ...expandSeries({
      prefix: 'H1-QINEQ2',
      stage: '高校 数学Ⅰ',
      category: '3章 2次関数',
      baseTitle: '2次不等式（> 0 型）',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: '$(x-\\alpha)(x-\\beta) > 0 \\iff x < \\alpha, \\ \\beta < x$（2解の外側）をグラフと対応させて解きます。',
      template: 'hs_quad_ineq',
      paramsFn: () => ({ isGt: true }),
    }),
    ...expandSeries({
      prefix: 'H1-TRIG',
      stage: '高校 数学Ⅰ',
      category: '4章 図形と計量',
      baseTitle: '三角比の値（0°〜180°）',
      subLabels: SETS_8,
      questionCount: 15,
      explanation: '単位円（半円）をイメージし、$30^\\circ, 45^\\circ, 60^\\circ, 120^\\circ, 135^\\circ, 150^\\circ$ の値を即答できるようにします。',
      template: 'hs_trig_basic',
    })
  );

  // ================= 高校 数学A（約45ステップ・classpulse/slides 数学A 1〜3章準拠） =================
  specs.push(
    ...expandSeries({
      prefix: 'HA-PERM',
      stage: '高校 数学A',
      category: '1章 場合の数と確率',
      baseTitle: '順列 nPr の計算と応用',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '$_n\\mathrm{P}_r = n(n-1)\\cdots(n-r+1)$。並べる順序を区別するときに使います。',
      template: 'hs_comb_perm',
      paramsFn: () => ({ mode: 'P' }),
    }),
    ...expandSeries({
      prefix: 'HA-COMB',
      stage: '高校 数学A',
      category: '1章 場合の数と確率',
      baseTitle: '組合せ nCr の計算と応用',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '$_n\\mathrm{C}_r = \\frac{_n\\mathrm{P}_r}{r!}$。順序を区別せず選ぶときに使います。',
      template: 'hs_comb_perm',
      paramsFn: () => ({ mode: 'C' }),
    }),
    ...expandSeries({
      prefix: 'HA-INT',
      stage: '高校 数学A',
      category: '3章 整数の性質',
      baseTitle: '最大公約数・最小公倍数と互除法',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: '素因数分解やユークリッドの互除法を用いて最大公約数・最小公倍数を求めます。',
      template: 'gcd_lcm',
      paramsFn: (i) => ({ mode: i < 3 ? 'gcd' : 'lcm' }),
    })
  );

  // ================= 高校 数学Ⅱ（約80ステップ・classpulse/slides 数学Ⅱ 1〜6章準拠） =================
  specs.push(
    ...expandSeries({
      prefix: 'H2-CMP1',
      stage: '高校 数学Ⅱ',
      category: '2章 複素数と方程式',
      baseTitle: '複素数の加法・減法',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: '実部どうし、虚部どうしをまとめて $a + bi$ の形にします。',
      template: 'hs_complex',
      paramsFn: () => ({ isMul: false }),
    }),
    ...expandSeries({
      prefix: 'H2-CMP2',
      stage: '高校 数学Ⅱ',
      category: '2章 複素数と方程式',
      baseTitle: '複素数の乗法（i² = -1）',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '多項式と同じように展開し、$i^2 = -1$ を代入して整理します。',
      template: 'hs_complex',
      paramsFn: () => ({ isMul: true }),
    }),
    ...expandSeries({
      prefix: 'H2-LOG',
      stage: '高校 数学Ⅱ',
      category: '5章 指数関数と対数関数',
      baseTitle: '対数の定義と値の計算',
      subLabels: SETS_8,
      questionCount: 15,
      explanation: '$a^p = M \\iff \\log_a M = p$ の定義を使って対数の値を求めます。',
      template: 'hs_log_exp',
    }),
    ...expandSeries({
      prefix: 'H2-DIFF',
      stage: '高校 数学Ⅱ',
      category: '6章 微分法と積分法',
      baseTitle: '整関数の導関数（微分計算）',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '$(x^n)\' = n x^{n-1}$、定数の微分は $0$ を使って3次関数を微分します。',
      template: 'hs_diff_poly',
    }),
    ...expandSeries({
      prefix: 'H2-INT',
      stage: '高校 数学Ⅱ',
      category: '6章 微分法と積分法',
      baseTitle: '整関数の不定積分',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '$\\int x^n\\,dx = \\frac{1}{n+1}x^{n+1} + C$ を用います。微分して検算する習慣をつけましょう。',
      template: 'hs_int_poly',
    })
  );

  // ================= 高校 数学B（約40ステップ・classpulse/slides 数学B 1〜2章準拠） =================
  specs.push(
    ...expandSeries({
      prefix: 'HB-ARITH',
      stage: '高校 数学B',
      category: '1章 数列',
      baseTitle: '等差数列の一般項と項の計算',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '初項 $a$、公差 $d$ の等差数列の一般項は $a_n = a + (n-1)d$ です。',
      template: 'hs_seq',
      paramsFn: () => ({ kind: 'arith' }),
    }),
    ...expandSeries({
      prefix: 'HB-GEOM',
      stage: '高校 数学B',
      category: '1章 数列',
      baseTitle: '等比数列の一般項と項の計算',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '初項 $a$、公比 $r$ の等比数列の一般項は $a_n = a r^{n-1}$ です。',
      template: 'hs_seq',
      paramsFn: () => ({ kind: 'geom' }),
    })
  );

  // ================= 高校 数学C（約40ステップ・classpulse/slides 数学C 1〜3章準拠） =================
  specs.push(
    ...expandSeries({
      prefix: 'HC-VEC',
      stage: '高校 数学C',
      category: '1章 ベクトル',
      baseTitle: '平面ベクトルの成分と内積',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '$\\vec{a}=(a_1, a_2), \\vec{b}=(b_1, b_2)$ の内積は $\\vec{a}\\cdot\\vec{b} = a_1 b_1 + a_2 b_2$ です。',
      template: 'hs_vector',
    }),
    ...expandSeries({
      prefix: 'HC-CMP',
      stage: '高校 数学C',
      category: '3章 複素数平面',
      baseTitle: '複素数平面の演算と回転の基礎',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: '複素数の積と和を正確に計算し、平面上の点と対応させます。',
      template: 'hs_complex',
      paramsFn: (i) => ({ isMul: i >= 2 }),
    })
  );

  // ================= 高校 数学Ⅲ（約60ステップ・classpulse/slides 数学Ⅲ 1〜4章準拠） =================
  specs.push(
    ...expandSeries({
      prefix: 'H3-DIFF',
      stage: '高校 数学Ⅲ',
      category: '2章 微分',
      baseTitle: '合成関数の微分法',
      subLabels: SETS_8,
      questionCount: 12,
      explanation: '$\\{f(g(x))\\}\' = f\'(g(x))\\cdot g\'(x)$。外側の微分に内側の微分 $g\'(x)$ を忘れずに掛けます。',
      template: 'hs3_diff_chain',
    }),
    ...expandSeries({
      prefix: 'H3-INT-BASE',
      stage: '高校 数学Ⅲ',
      category: '4章 積分とその応用',
      baseTitle: '不定積分の基本計算',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: 'べき乗の積分公式を正確に使い、微分による検算を行います。',
      template: 'hs_int_poly',
    }),
    ...expandSeries({
      prefix: 'H3-INT-SUB',
      stage: '高校 数学Ⅲ',
      category: '4章 積分とその応用',
      baseTitle: '置換積分法の基本と定着',
      subLabels: SETS_8,
      questionCount: 10,
      explanation: '塊を $t = g(x)$ とおき、$dt = g\'(x)\\,dx$ を使って $t$ の積分に書き換えます。',
      template: 'hs3_int_sub',
    })
  );

  return specs;
}
