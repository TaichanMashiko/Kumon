import type { MicroStepSpec, StageGroup } from './mathEngine';

interface SeriesBlueprint {
  prefix: string;
  stage: StageGroup;
  category: string;
  baseTitle: string;
  subLabels: string[];
  questionCount: number;
  explanation: string;
  explanationFn?: (idx: number) => string;
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
    explanation: bp.explanationFn ? bp.explanationFn(idx) : bp.explanation,
    template: bp.template,
    params: bp.paramsFn ? bp.paramsFn(idx) : {},
  }));
}

const SETS_6 = ['導入', '基本1', '基本2', '標準1', '標準2', '入試演習'];
const SETS_5 = ['導入', '基本', '標準', '応用', '入試演習'];
const SETS_4 = ['基本', '標準', '応用', '定着'];

export function buildHighSchoolCatalog(): MicroStepSpec[] {
  const specs: MicroStepSpec[] = [];

  // ================= 高校 数学Ⅰ（教科書1〜5章・全節網羅） =================
  specs.push(
    ...expandSeries({
      prefix: 'H1-EXP',
      stage: '高校 数学Ⅰ',
      category: '1章 数と式',
      baseTitle: '1次式の積の展開・たすき掛け因数分解',
      subLabels: ['展開・基本', '展開・標準', 'たすき掛け・導入', 'たすき掛け・基本', 'たすき掛け・標準', 'たすき掛け・仕上げ'],
      questionCount: 12,
      explanation:
        '$(ax+b)(cx+d) = acx^2 + (ad+bc)x + bd$ の関係を用います。因数分解では積が $ac, bd$、たすき掛けの和が $ad+bc$ となる組を探します。',
      template: 'factor_poly',
      paramsFn: (i) => ({ kind: i < 2 ? 'monic' : 'tasuki' }),
    }),
    ...expandSeries({
      prefix: 'H1-SYM',
      stage: '高校 数学Ⅰ',
      category: '1章 数と式',
      baseTitle: '対称式の値（x²+y²・x³+y³）',
      subLabels: ['2乗和・基本', '2乗和・応用', '3乗和・基本', '3乗和・入試演習'],
      questionCount: 10,
      explanation:
        '基本対称式 $x+y, xy$ で表します。\n\n- $x^2 + y^2 = (x+y)^2 - 2xy$\n- $x^3 + y^3 = (x+y)^3 - 3xy(x+y)$',
      template: 'hs1_symmetric',
      paramsFn: (i) => ({ mode: i >= 2 ? 'cube' : 'sq' }),
    }),
    ...expandSeries({
      prefix: 'H1-DSQRT',
      stage: '高校 数学Ⅰ',
      category: '1章 数と式',
      baseTitle: '二重根号の外し方',
      subLabels: ['和の形・基本', '和の形・定着', '差の形・基本', '差の形・入試演習'],
      questionCount: 10,
      explanation:
        '$a > b > 0$ のとき、$\\sqrt{(a+b) \\pm 2\\sqrt{ab}} = \\sqrt{a} \\pm \\sqrt{b}$ を用います。たして前、かけて根号の中になる2数 $a, b$ を見つけます。',
      template: 'hs1_double_sqrt',
      paramsFn: (i) => ({ isMinus: i >= 2 }),
    }),
    ...expandSeries({
      prefix: 'H1-ABS',
      stage: '高校 数学Ⅰ',
      category: '1章 数と式',
      baseTitle: '絶対値を含む方程式・不等式',
      subLabels: ['方程式・基本', '方程式・標準', '不等式(<)・基本', '不等式(<)・標準', '不等式(>)・基本', '不等式(>)・入試演習'],
      questionCount: 10,
      explanation:
        '$c > 0$ のとき、$|A| = c \\iff A = \\pm c$、$|A| < c \\iff -c < A < c$、$|A| > c \\iff A < -c, \\ c < A$ を使います。',
      template: 'hs1_abs_eq_ineq',
      paramsFn: (i) => ({ mode: i < 2 ? 'eq' : i < 4 ? 'lt' : 'gt' }),
    }),
    ...expandSeries({
      prefix: 'H1-LOGIC',
      stage: '高校 数学Ⅰ',
      category: '2章 集合と論証',
      baseTitle: '必要条件・十分条件の判定',
      subLabels: SETS_4,
      questionCount: 10,
      explanation:
        '$p \\implies q$ が真なら $p$ は $q$ の**十分条件**、$q \\implies p$ が真なら**必要条件**、両方真なら**必要十分条件**です。反例を1つ探して真偽を確かめます。',
      template: 'hs1_logic_cond',
    }),
    ...expandSeries({
      prefix: 'H1-QF-SQ',
      stage: '高校 数学Ⅰ',
      category: '3章 2次関数',
      baseTitle: '平方完成とグラフの頂点',
      subLabels: ['係数1・基本', '係数1・標準', '係数a・基本', '係数a・標準', '係数a・入試演習'],
      questionCount: 12,
      explanation:
        '$y = ax^2 + bx + c$ は、まず $x^2$ と $x$ の項を $a$ でくくり、$x$ の係数の半分の2乗をたして引くことで $y = a(x-p)^2 + q$（頂点 $(p, q)$）に変形します。',
      template: 'hs_complete_sq',
      paramsFn: (i) => ({ leadOne: i < 2 ? 1 : 0 }),
    }),
    ...expandSeries({
      prefix: 'H1-QF-MM',
      stage: '高校 数学Ⅰ',
      category: '3章 2次関数',
      baseTitle: '定義域のある2次関数の最大・最小',
      subLabels: SETS_5,
      questionCount: 10,
      explanation:
        '平方完成して軸と頂点を求め、定義域 $a \\le x \\le b$ の両端と頂点の $y$ 座標を比較して最大値・最小値を決定します。',
      template: 'hs1_qf_maxmin',
    }),
    ...expandSeries({
      prefix: 'H1-QF-DISC',
      stage: '高校 数学Ⅰ',
      category: '3章 2次関数',
      baseTitle: '判別式 D と共有点・実数解の条件',
      subLabels: ['実数解2個(D>0)・基本', '実数解2個(D>0)・応用', '接する条件(D=0)・基本', '接する条件(D=0)・入試演習'],
      questionCount: 10,
      explanation:
        '2次方程式 $ax^2+bx+c=0$ の判別式 $D = b^2 - 4ac$ について、$D > 0$ なら異なる2実数解、$D = 0$ なら重解（接する）、$D < 0$ なら実数解なしです。',
      template: 'hs1_qf_disc',
      paramsFn: (i) => ({ mode: i >= 2 ? 'touch' : 'two' }),
    }),
    ...expandSeries({
      prefix: 'H1-QINEQ',
      stage: '高校 数学Ⅰ',
      category: '3章 2次関数',
      baseTitle: '2次不等式の解法',
      subLabels: ['< 0 型・基本', '< 0 型・標準', '> 0 型・基本', '> 0 型・標準', '総合入試演習'],
      questionCount: 12,
      explanation:
        'まず左辺を因数分解して2解 $\\alpha < \\beta$ を求め、放物線が $x$ 軸より下（$< 0$）か上（$> 0$）かで範囲を決めます。',
      template: 'hs_quad_ineq',
      paramsFn: (i) => ({ isGt: i >= 2 }),
    }),
    ...expandSeries({
      prefix: 'H1-TRIG-V',
      stage: '高校 数学Ⅰ',
      category: '4章 図形と計量',
      baseTitle: '三角比の値と相互関係',
      subLabels: ['相互関係(鋭角)・基本', '相互関係(鋭角)・反復', '相互関係(鋭角)・標準', '相互関係(鋭角)・定着', '相互関係(鈍角)・入試演習'],
      questionCount: 12,
      explanation: '',
      explanationFn: (i) =>
        i >= 4
          ? '相互関係 $\\sin^2\\theta + \\cos^2\\theta = 1$、$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ を用います。**鈍角（$90^\\circ < \\theta < 180^\\circ$）では $\\sin\\theta > 0, \\ \\cos\\theta < 0, \\ \\tan\\theta < 0$** となる点に注意しましょう。'
          : '相互関係 $\\sin^2\\theta + \\cos^2\\theta = 1$、$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}$ を用います。**鋭角（$0^\\circ < \\theta < 90^\\circ$）では $\\sin\\theta > 0, \\ \\cos\\theta > 0, \\ \\tan\\theta > 0$（すべて正）** です。',
      template: 'hs1_trig_rel',
      paramsFn: (i) => ({ obtuse: i >= 4 }),
    }),
    ...expandSeries({
      prefix: 'H1-TRIG-TH',
      stage: '高校 数学Ⅰ',
      category: '4章 図形と計量',
      baseTitle: '正弦定理・余弦定理・三角形の面積',
      subLabels: ['正弦定理・基本', '正弦定理・応用', '余弦定理・基本', '余弦定理・応用', '三角形の面積・基本', '三角形の面積・入試演習'],
      questionCount: 10,
      explanation:
        '- 正弦定理：$\\frac{a}{\\sin A} = 2R$\n- 余弦定理：$a^2 = b^2 + c^2 - 2bc\\cos A$\n- 面積：$S = \\frac{1}{2}bc\\sin A$',
      template: 'hs1_sine_cosine',
      paramsFn: (i) => ({ mode: i < 2 ? 'sine' : i < 4 ? 'cosine' : 'area' }),
    }),
    ...expandSeries({
      prefix: 'H1-STAT',
      stage: '高校 数学Ⅰ',
      category: '5章 データの分析',
      baseTitle: '平均値・分散・標準偏差の計算',
      subLabels: SETS_4,
      questionCount: 10,
      explanation:
        '各値と平均値の差（偏差）を2乗し、その平均をとったものが分散 $s^2$ です。標準偏差は $s = \\sqrt{s^2}$ です。',
      template: 'hs1_stats',
    })
  );

  // ================= 高校 数学A（教科書1〜3章・全節網羅） =================
  specs.push(
    ...expandSeries({
      prefix: 'HA-PC',
      stage: '高校 数学A',
      category: '1章 場合の数と確率',
      baseTitle: '順列 nPr と組合せ nCr',
      subLabels: ['順列・基本', '順列・標準', '組合せ・基本', '組合せ・標準', '入試演習'],
      questionCount: 12,
      explanation:
        '並べる順序を区別するときは順列 $_n\\mathrm{P}_r$、選ぶだけのときは組合せ $_n\\mathrm{C}_r = \\frac{_n\\mathrm{P}_r}{r!}$ を使います。',
      template: 'hs_comb_perm',
      paramsFn: (i) => ({ mode: i < 2 ? 'P' : 'C' }),
    }),
    ...expandSeries({
      prefix: 'HA-PROB',
      stage: '高校 数学A',
      category: '1章 場合の数と確率',
      baseTitle: '余事象の確率・反復試行の確率',
      subLabels: ['余事象・基本', '余事象・応用', '反復試行・基本', '反復試行・応用', '入試演習'],
      questionCount: 10,
      explanation:
        '「少なくとも1回」は $1 - (\\text{1回も起こらない確率})$（余事象）を使います。反復試行は $_n\\mathrm{C}_k p^k (1-p)^{n-k}$ です。',
      template: 'hsa_prob_events',
      paramsFn: (i) => ({ mode: i < 2 ? 'complement' : 'rep' }),
    }),
    ...expandSeries({
      prefix: 'HA-GEOM',
      stage: '高校 数学A',
      category: '2章 図形の性質',
      baseTitle: '角の二等分線と比・方べきの定理',
      subLabels: ['角の二等分線・基本', '角の二等分線・標準', '方べきの定理・基本', '方べきの定理・入試演習'],
      questionCount: 10,
      explanation:
        '- 角の二等分線：$\\mathrm{BD}:\\mathrm{DC} = \\mathrm{AB}:\\mathrm{AC}$\n- 方べきの定理：$\\mathrm{PA}\\cdot\\mathrm{PB} = \\mathrm{PC}\\cdot\\mathrm{PD}$',
      template: 'hsa_geom_theorems',
      paramsFn: (i) => ({ mode: i >= 2 ? 'power' : 'bisector' }),
    }),
    ...expandSeries({
      prefix: 'HA-INT',
      stage: '高校 数学A',
      category: '3章 整数の性質',
      baseTitle: '約数の個数・n進法・整数の性質',
      subLabels: ['約数の個数・基本', '約数の個数・標準', '2進法変換・基本', '2進法変換・入試演習'],
      questionCount: 10,
      explanation:
        '素因数分解 $N = p^a q^b$ に対して正の約数の個数は $(a+1)(b+1)$ 個です。10進法から2進法へは $2$ で割り続けて余りを下から並べます。',
      template: 'hsa_int_diophantine',
      paramsFn: (i) => ({ mode: i >= 2 ? 'base' : 'divisors' }),
    })
  );

  // ================= 高校 数学Ⅱ（教科書全章網羅） =================
  specs.push(
    ...expandSeries({
      prefix: 'H2-BINOM',
      stage: '高校 数学Ⅱ',
      category: '1章 式と証明',
      baseTitle: '二項定理による特定項の係数',
      subLabels: SETS_5,
      questionCount: 10,
      explanation:
        '$(ax+b)^n$ の一般項は $_n\\mathrm{C}_k (ax)^k b^{n-k}$ です。求める次数に合う $k$ を決めて係数を計算します。',
      template: 'hs2_binomial',
    }),
    ...expandSeries({
      prefix: 'H2-CMP',
      stage: '高校 数学Ⅱ',
      category: '2章 複素数と方程式',
      baseTitle: '複素数の四則・解と係数の関係',
      subLabels: ['複素数の積・基本', '複素数の積・標準', '解と係数の関係・基本', '解と係数の関係・入試演習'],
      questionCount: 12,
      explanation:
        '$ax^2+bx+c=0$ の2解 $\\alpha, \\beta$ に対し、$\\alpha+\\beta=-\\frac{b}{a}, \\ \\alpha\\beta=\\frac{c}{a}$ が成り立ちます。',
      template: 'hs2_vieta',
    }),
    ...expandSeries({
      prefix: 'H2-REM',
      stage: '高校 数学Ⅱ',
      category: '2章 複素数と方程式',
      baseTitle: '剰余の定理・因数定理',
      subLabels: SETS_5,
      questionCount: 10,
      explanation:
        '整式 $P(x)$ を $x-k$ で割った余りは $P(k)$ に等しい（剰余の定理）。特に $P(k)=0$ なら $x-k$ を因数にもちます。',
      template: 'hs2_remainder_cubic',
    }),
    ...expandSeries({
      prefix: 'H2-GEOM',
      stage: '高校 数学Ⅱ',
      category: '3章 図形と方程式',
      baseTitle: '点と直線の距離の公式',
      subLabels: SETS_5,
      questionCount: 10,
      explanation:
        '点 $(x_1, y_1)$ と直線 $ax+by+c=0$ の距離は $d = \\frac{|ax_1+by_1+c|}{\\sqrt{a^2+b^2}}$ で求めます。',
      template: 'hs2_point_line_dist',
    }),
    ...expandSeries({
      prefix: 'H2-TRIG',
      stage: '高校 数学Ⅱ',
      category: '4章 三角関数',
      baseTitle: '加法定理・2倍角の公式・三角関数の合成',
      subLabels: SETS_6,
      questionCount: 10,
      explanation:
        '加法定理 $\\sin(\\alpha\\pm\\beta)=\\sin\\alpha\\cos\\beta\\pm\\cos\\alpha\\sin\\beta$、2倍角、および $a\\sin\\theta+b\\cos\\theta = \\sqrt{a^2+b^2}\\sin(\\theta+\\alpha)$ を自在に使いこなします。',
      template: 'hs2_trig_add',
    }),
    ...expandSeries({
      prefix: 'H2-EXPLOG',
      stage: '高校 数学Ⅱ',
      category: '5章 指数関数と対数関数',
      baseTitle: '指数方程式・対数方程式',
      subLabels: ['指数方程式・基本', '指数方程式・標準', '対数方程式・基本', '対数方程式・標準', '対数計算・入試演習'],
      questionCount: 12,
      explanation:
        '底をそろえて指数どうしを比較します。対数方程式では真数条件（真数 $> 0$）を必ず確認します。',
      template: 'hs2_exp_log_eq',
      paramsFn: (i) => ({ mode: i >= 2 ? 'log' : 'exp' }),
    }),
    ...expandSeries({
      prefix: 'H2-DIFF-AP',
      stage: '高校 数学Ⅱ',
      category: '6章 微分法と積分法',
      baseTitle: '接線の方程式・3次関数の極値',
      subLabels: ['接線の方程式・基本', '接線の方程式・標準', '極大・極小・基本', '極大・極小・標準', '入試演習'],
      questionCount: 10,
      explanation:
        '接線の傾きは $f\'(a)$ で求まります。極値は $f\'(x)=0$ となる点の前後で符号が変わるかを増減表で確認して求めます。',
      template: 'hs2_tangent_extrema',
      paramsFn: (i) => ({ mode: i >= 2 ? 'extrema' : 'tangent' }),
    }),
    ...expandSeries({
      prefix: 'H2-INT-AREA',
      stage: '高校 数学Ⅱ',
      category: '6章 微分法と積分法',
      baseTitle: '定積分と面積（1/6公式の活用）',
      subLabels: SETS_5,
      questionCount: 10,
      explanation:
        '放物線 $y=(x-\\alpha)(x-\\beta)$ と $x$ 軸で囲まれた面積は $S = \\frac{1}{6}(\\beta-\\alpha)^3$ で高速かつ正確に求められます。',
      template: 'hs2_def_int_area',
    })
  );

  // ================= 高校 数学B（教科書1〜2章・全節網羅） =================
  specs.push(
    ...expandSeries({
      prefix: 'HB-SEQ',
      stage: '高校 数学B',
      category: '1章 数列',
      baseTitle: '等差数列・等比数列の一般項',
      subLabels: ['等差数列・基本', '等差数列・標準', '等比数列・基本', '等比数列・標準'],
      questionCount: 12,
      explanation:
        '等差数列は $a_n = a_1 + (n-1)d$、等比数列は $a_n = a_1 r^{n-1}$ を用います。',
      template: 'hs_seq',
      paramsFn: (i) => ({ kind: i >= 2 ? 'geom' : 'arith' }),
    }),
    ...expandSeries({
      prefix: 'HB-SIGMA',
      stage: '高校 数学B',
      category: '1章 数列',
      baseTitle: 'Σ（シグマ）記号と数列の和',
      subLabels: SETS_5,
      questionCount: 10,
      explanation:
        '$\\sum_{k=1}^n k = \\frac{1}{2}n(n+1)$、$\\sum_{k=1}^n c = nc$ の和の公式を用いて整理します。',
      template: 'hsb_sigma_diff',
    }),
    ...expandSeries({
      prefix: 'HB-REC',
      stage: '高校 数学B',
      category: '1章 数列',
      baseTitle: '漸化式（特性方程式 a_{n+1}=pa_n+q 型）',
      subLabels: SETS_5,
      questionCount: 10,
      explanation:
        '$\\alpha = p\\alpha + q$ を解いて $a_{n+1}-\\alpha = p(a_n-\\alpha)$ と変形し、数列 $\\{a_n-\\alpha\\}$ が等比数列になることを用います。',
      template: 'hsb_recurrence',
    }),
    ...expandSeries({
      prefix: 'HB-STAT',
      stage: '高校 数学B',
      category: '2章 統計的な推測',
      baseTitle: '二項分布 B(n, p) の期待値と分散',
      subLabels: SETS_4,
      questionCount: 10,
      explanation:
        '二項分布 $B(n, p)$ に従う確率変数 $X$ について、$E(X) = np$、$V(X) = np(1-p)$ が成り立ちます。',
      template: 'hsb_binomial_dist',
    })
  );

  // ================= 高校 数学C（教科書1〜3章・全節網羅） =================
  specs.push(
    ...expandSeries({
      prefix: 'HC-VEC',
      stage: '高校 数学C',
      category: '1章 ベクトル',
      baseTitle: 'ベクトルの内積と垂直条件',
      subLabels: ['内積計算・基本', '内積計算・標準', '垂直条件・基本', '垂直条件・標準', '入試演習'],
      questionCount: 12,
      explanation:
        '成分による内積は $\\vec{a}\\cdot\\vec{b} = a_1 b_1 + a_2 b_2$。ゼロでない2つのベクトルが垂直であるための必要十分条件は $\\vec{a}\\cdot\\vec{b} = 0$ です。',
      template: 'hsc_vec_angle_perp',
    }),
    ...expandSeries({
      prefix: 'HC-CONIC',
      stage: '高校 数学C',
      category: '2章 平面上の曲線',
      baseTitle: '放物線・楕円の標準形と焦点',
      subLabels: ['放物線の焦点と準線・基本', '放物線の焦点と準線・標準', '楕円の焦点・基本', '楕円の焦点・入試演習'],
      questionCount: 10,
      explanation:
        '放物線 $y^2 = 4px$ の焦点は $(p, 0)$・準線は $x=-p$。楕円 $\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1 \\ (a>b>0)$ の焦点は $(\\pm\\sqrt{a^2-b^2}, 0)$ です。',
      template: 'hsc_conics',
      paramsFn: (i) => ({ mode: i >= 2 ? 'ellipse' : 'parabola' }),
    }),
    ...expandSeries({
      prefix: 'HC-CMP',
      stage: '高校 数学C',
      category: '3章 複素数平面',
      baseTitle: '複素数の極形式とド・モアブルの定理',
      subLabels: SETS_5,
      questionCount: 10,
      explanation:
        '$z = r(\\cos\\theta + i\\sin\\theta)$ に対し、ド・モアブルの定理 $z^n = r^n(\\cos n\\theta + i\\sin n\\theta)$ を用いて高次累乗を計算します。',
      template: 'hsc_complex_polar',
    })
  );

  // ================= 高校 数学Ⅲ（教科書1〜4章・全節網羅） =================
  specs.push(
    ...expandSeries({
      prefix: 'H3-LIM',
      stage: '高校 数学Ⅲ',
      category: '1章 関数と極限',
      baseTitle: '数列の極限・無限等比級数・三角関数の極限',
      subLabels: ['分数式の極限・基本', '分数式の極限・標準', '無限等比級数の和・基本', '無限等比級数の和・標準', 'sin x / x の極限・基本', 'sin x / x の極限・入試演習'],
      questionCount: 10,
      explanation:
        '- 分数式は分母の最高次で割る\n- 無限等比級数（$|r|<1$）の和は $\\frac{a}{1-r}$\n- $\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1$',
      template: 'hs3_limits',
      paramsFn: (i) => ({ mode: i < 2 ? 'rational' : i < 4 ? 'series' : 'trig' }),
    }),
    ...expandSeries({
      prefix: 'H3-DIFF',
      stage: '高校 数学Ⅲ',
      category: '2章 微分',
      baseTitle: '合成関数・積の微分・三角/指数/対数関数の微分',
      subLabels: ['合成関数の微分・基本', '合成関数の微分・標準', '初等関数の微分・基本', '初等関数の微分・標準', '積の微分・入試演習'],
      questionCount: 12,
      explanation:
        '合成関数の微分 $\\{f(g(x))\\}\' = f\'(g(x))g\'(x)$ と、積の微分 $(fg)\' = f\'g + fg\'$ を正確に適用します。',
      template: 'hs3_diff_adv',
    }),
    ...expandSeries({
      prefix: 'H3-INT-SUB',
      stage: '高校 数学Ⅲ',
      category: '4章 積分とその応用',
      baseTitle: '置換積分法',
      subLabels: SETS_5,
      questionCount: 10,
      explanation:
        '内側の塊を $t = g(x)$ とおき、$dt = g\'(x)\\,dx$ を使って変数 $t$ の積分に書き換えて計算します。',
      template: 'hs3_int_sub',
    }),
    ...expandSeries({
      prefix: 'H3-INT-PARTS',
      stage: '高校 数学Ⅲ',
      category: '4章 積分とその応用',
      baseTitle: '部分積分法（不定積分・定積分）',
      subLabels: SETS_5,
      questionCount: 8,
      explanation:
        '$\\int f(x)g\'(x)\\,dx = f(x)g(x) - \\int f\'(x)g(x)\\,dx$。多項式や $\\log x$ を微分側 $f(x)$ に選ぶのが定石です。',
      template: 'hs3_int_parts',
    }),
    ...expandSeries({
      prefix: 'H3-INT-VOL',
      stage: '高校 数学Ⅲ',
      category: '4章 積分とその応用',
      baseTitle: '定積分と回転体の体積',
      subLabels: SETS_4,
      questionCount: 8,
      explanation:
        '曲線 $y = f(x) \\ (a \\le x \\le b)$ と $x$ 軸で囲まれた図形を $x$ 軸のまわりに1回転した体積は $V = \\pi \\int_a^b \\{f(x)\\}^2\\,dx$ です。',
      template: 'hs3_int_volume',
    })
  );

  return specs;
}
