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

const SETS_6 = ['導入', '基本1', '基本2', '反復1', '反復2', '仕上げ'];
const SETS_5 = ['基本1', '基本2', '反復1', '反復2', '仕上げ'];
const SETS_4 = ['基本1', '基本2', '反復', '仕上げ'];

export function buildJuniorHighCatalog(): MicroStepSpec[] {
  const specs: MicroStepSpec[] = [];

  // ================= 中学校1年（約100ステップ・各15問） =================
  specs.push(
    ...expandSeries({
      prefix: 'J1-SGN-ADD',
      stage: '中学校1年',
      category: '1章 正負の数',
      baseTitle: '正負の数の加法（たし算）',
      subLabels: SETS_6,
      questionCount: 20,
      explanation: '同符号の和は共通の符号をつけて絶対値の和、異符号の和は絶対値が大きい方の符号をつけて差をとります。',
      template: 'signed_add_sub',
      paramsFn: () => ({ isSub: false }),
    }),
    ...expandSeries({
      prefix: 'J1-SGN-SUB',
      stage: '中学校1年',
      category: '1章 正負の数',
      baseTitle: '正負の数の減法（ひき算）',
      subLabels: SETS_6,
      questionCount: 20,
      explanation: 'ひく数の符号を変えてたし算（加法）に直してから計算します。',
      template: 'signed_add_sub',
      paramsFn: () => ({ isSub: true }),
    }),
    ...expandSeries({
      prefix: 'J1-SGN-MUL',
      stage: '中学校1年',
      category: '1章 正負の数',
      baseTitle: '正負の数の乗法（かけ算）',
      subLabels: SETS_6,
      questionCount: 20,
      explanation: '同符号の積は $+$、異符号の積は $-$ になります。まず符号を決めてから絶対値をかけます。',
      template: 'signed_mul_div',
      paramsFn: () => ({ isDiv: false }),
    }),
    ...expandSeries({
      prefix: 'J1-SGN-DIV',
      stage: '中学校1年',
      category: '1章 正負の数',
      baseTitle: '正負の数の除法（わり算）',
      subLabels: SETS_6,
      questionCount: 20,
      explanation: '符号の決まりは乗法と同じです。分数のわり算は逆数の積に直します。',
      template: 'signed_mul_div',
      paramsFn: () => ({ isDiv: true }),
    }),
    ...expandSeries({
      prefix: 'J1-EXP-ADD',
      stage: '中学校1年',
      category: '2章 文字と式',
      baseTitle: '1次式の加法',
      subLabels: SETS_5,
      questionCount: 15,
      explanation: '文字の部分が同じ項（同類項）どうし、数字の項どうしをまとめて計算します。',
      template: 'linear_expr',
      paramsFn: () => ({ isSub: false }),
    }),
    ...expandSeries({
      prefix: 'J1-EXP-SUB',
      stage: '中学校1年',
      category: '2章 文字と式',
      baseTitle: '1次式の減法',
      subLabels: SETS_5,
      questionCount: 15,
      explanation: 'ひく式の各項の符号をすべて変えてからたします。',
      template: 'linear_expr',
      paramsFn: () => ({ isSub: true }),
    }),
    ...expandSeries({
      prefix: 'J1-EQ-1',
      stage: '中学校1年',
      category: '3章 1次方程式',
      baseTitle: '1次方程式 x + a = b',
      subLabels: SETS_4,
      questionCount: 15,
      explanation: '左辺の $+a$ を右辺へ移項して $-a$ にします。',
      template: 'linear_eq',
      paramsFn: () => ({ kind: 'x_plus_a' }),
    }),
    ...expandSeries({
      prefix: 'J1-EQ-2',
      stage: '中学校1年',
      category: '3章 1次方程式',
      baseTitle: '1次方程式 x - a = b',
      subLabels: SETS_4,
      questionCount: 15,
      explanation: '左辺の $-a$ を右辺へ移項して $+a$ にします。',
      template: 'linear_eq',
      paramsFn: () => ({ kind: 'x_minus_a' }),
    }),
    ...expandSeries({
      prefix: 'J1-EQ-3',
      stage: '中学校1年',
      category: '3章 1次方程式',
      baseTitle: '1次方程式 ax = b',
      subLabels: SETS_5,
      questionCount: 15,
      explanation: '両辺を $x$ の係数 $a$ でわって $x = \\dots$ の形にします。',
      template: 'linear_eq',
      paramsFn: () => ({ kind: 'ax_eq_b' }),
    }),
    ...expandSeries({
      prefix: 'J1-EQ-4',
      stage: '中学校1年',
      category: '3章 1次方程式',
      baseTitle: '1次方程式 ax + b = c（移項1回）',
      subLabels: SETS_6,
      questionCount: 15,
      explanation: '定数項を右辺へ移項し、両辺を $a$ でわります。',
      template: 'linear_eq',
      paramsFn: () => ({ kind: 'ax_b_c' }),
    }),
    ...expandSeries({
      prefix: 'J1-EQ-5',
      stage: '中学校1年',
      category: '3章 1次方程式',
      baseTitle: '1次方程式 ax + b = cx + d（両辺移項）',
      subLabels: SETS_6,
      questionCount: 15,
      explanation: '文字の項を左辺に、数の項を右辺に集めて整理してから解きます。',
      template: 'linear_eq',
      paramsFn: () => ({ kind: 'both_sides' }),
    }),
    ...expandSeries({
      prefix: 'J1-EQ-6',
      stage: '中学校1年',
      category: '3章 1次方程式',
      baseTitle: 'かっこを含む1次方程式',
      subLabels: SETS_5,
      questionCount: 15,
      explanation: 'まず分配法則でかっこを外し、その後移項して解きます。',
      template: 'linear_eq',
      paramsFn: () => ({ kind: 'parens' }),
    })
  );

  // ================= 中学校2年（約85ステップ・各15問） =================
  specs.push(
    ...expandSeries({
      prefix: 'J2-POLY-ADD',
      stage: '中学校2年',
      category: '1章 式の計算',
      baseTitle: '多項式の加法・減法',
      subLabels: SETS_6,
      questionCount: 15,
      explanation: 'かっこを外し、同類項をまとめて簡単にします。',
      template: 'linear_expr',
      paramsFn: (i) => ({ isSub: i >= 3 }),
    }),
    ...expandSeries({
      prefix: 'J2-SIM-1',
      stage: '中学校2年',
      category: '2章 連立方程式',
      baseTitle: '連立方程式（加減法・基本）',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: '片方の文字の係数をそろえて足すか引くかして、1文字消去します。',
      template: 'simultaneous_eq',
    }),
    ...expandSeries({
      prefix: 'J2-SIM-2',
      stage: '中学校2年',
      category: '2章 連立方程式',
      baseTitle: '連立方程式（加減法・応用・反復）',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: '両方の式を定数倍して係数をそろえ、確実に $x, y$ を求めます。',
      template: 'simultaneous_eq',
    }),
    ...expandSeries({
      prefix: 'J2-FUNC-1',
      stage: '中学校2年',
      category: '3章 1次関数',
      baseTitle: '1次関数の式の決定（傾きと1点）',
      subLabels: SETS_6,
      questionCount: 12,
      explanation: '$y = ax + b$ に傾き $a$ と通る点の座標 $(x, y)$ を代入して切片 $b$ を求めます。',
      template: 'linear_func',
    }),
    ...expandSeries({
      prefix: 'J2-PROB-1',
      stage: '中学校2年',
      category: '5章 確率',
      baseTitle: '場合の数と確率の基礎',
      subLabels: SETS_4,
      questionCount: 12,
      explanation: 'すべての場合の数に対する、起こる場合の数の割合を求めます。',
      template: 'hs_comb_perm',
      paramsFn: (i) => ({ mode: i < 2 ? 'P' : 'C' }),
    })
  );

  // ================= 中学校3年（約105ステップ・各15問） =================
  specs.push(
    ...expandSeries({
      prefix: 'J3-EXP-1',
      stage: '中学校3年',
      category: '1章 多項式の展開',
      baseTitle: '展開公式 (x+a)(x+b)',
      subLabels: SETS_6,
      questionCount: 15,
      explanation:
        '公式 $(x+a)(x+b) = x^2 + (a+b)x + ab$ を使います。$x$ の係数は「たし算」、定数項は「かけ算」です。\n\n**例**：$(x+2)(x-5) = x^2 + (2-5)x + 2\\times(-5) = x^2 - 3x - 10$',
      template: 'expand_poly',
      paramsFn: () => ({ kind: 'x_ab' }),
    }),
    ...expandSeries({
      prefix: 'J3-EXP-2',
      stage: '中学校3年',
      category: '1章 多項式の展開',
      baseTitle: '展開公式 (x+a)²・(x-a)²',
      subLabels: SETS_6,
      questionCount: 15,
      explanation: '$(x+a)^2 = x^2 + 2ax + a^2$。真ん中の項 $2ax$ を落とさないよう注意しましょう。',
      template: 'expand_poly',
      paramsFn: () => ({ kind: 'square' }),
    }),
    ...expandSeries({
      prefix: 'J3-EXP-3',
      stage: '中学校3年',
      category: '1章 多項式の展開',
      baseTitle: '展開公式 (x+a)(x-a)',
      subLabels: SETS_5,
      questionCount: 15,
      explanation: '和と差の積は $(x+a)(x-a) = x^2 - a^2$ になります。',
      template: 'expand_poly',
      paramsFn: () => ({ kind: 'diff_sq' }),
    }),
    ...expandSeries({
      prefix: 'J3-FAC-1',
      stage: '中学校3年',
      category: '1章 因数分解',
      baseTitle: '因数分解 x²+(a+b)x+ab',
      subLabels: ['基本1', '基本2', '基本3', '負の数を含む1', '負の数を含む2', '負の数を含む3', '総合1', '総合2'],
      questionCount: 15,
      explanation: 'かけて定数項、たして $x$ の係数になる2つの数の組み合わせを探します。',
      template: 'factor_poly',
      paramsFn: () => ({ kind: 'monic' }),
    }),
    ...expandSeries({
      prefix: 'J3-FAC-2',
      stage: '中学校3年',
      category: '1章 因数分解',
      baseTitle: '因数分解 x² - a²',
      subLabels: SETS_5,
      questionCount: 15,
      explanation: '2乗の差は $x^2 - a^2 = (x+a)(x-a)$ と因数分解できます。',
      template: 'factor_poly',
      paramsFn: () => ({ kind: 'diff_sq' }),
    }),
    ...expandSeries({
      prefix: 'J3-SQRT-1',
      stage: '中学校3年',
      category: '2章 平方根',
      baseTitle: '根号の簡単化 a√b の形',
      subLabels: SETS_6,
      questionCount: 15,
      explanation: '根号の中を素因数分解し、2乗のペアになった数を根号の外へ出します。',
      template: 'sqrt_calc',
      paramsFn: () => ({ kind: 'simplify' }),
    }),
    ...expandSeries({
      prefix: 'J3-SQRT-2',
      stage: '中学校3年',
      category: '2章 平方根',
      baseTitle: '分母の有理化',
      subLabels: SETS_6,
      questionCount: 15,
      explanation: '分母と分子に同じ根号をかけて、分母に根号がない形に直します。',
      template: 'sqrt_calc',
      paramsFn: () => ({ kind: 'rationalize' }),
    }),
    ...expandSeries({
      prefix: 'J3-QUAD-1',
      stage: '中学校3年',
      category: '3章 2次方程式',
      baseTitle: '2次方程式の解法（因数分解型）',
      subLabels: ['基本1', '基本2', '基本3', '反復1', '反復2', '総合1', '総合2'],
      questionCount: 15,
      explanation: '右辺を0にして左辺を因数分解し、$A \\cdot B = 0 \\iff A=0 \\text{ または } B=0$ を用います。',
      template: 'quad_eq',
    }),
    ...expandSeries({
      prefix: 'J3-PYTH-1',
      stage: '中学校3年',
      category: '7章 三平方の定理',
      baseTitle: '三平方の定理（直角三角形の辺）',
      subLabels: SETS_5,
      questionCount: 12,
      explanation: '直角三角形の斜辺を $c$、他の2辺を $a, b$ とすると $a^2 + b^2 = c^2$ が成り立ちます。',
      template: 'pythagoras',
    })
  );

  return specs;
}
