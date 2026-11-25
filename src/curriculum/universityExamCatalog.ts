import type { MicroStepSpec } from './mathEngine';

/**
 * 公文式 M〜O教材相当：茨城大学・筑波大学 二次試験レベル 総合演習コース
 * 各ステップに「解けなかったときに戻るべき基礎ステップ（remediationIds）」を厳密にリンク
 */
export function buildUniversityExamCatalog(): MicroStepSpec[] {
  const specs: MicroStepSpec[] = [
    {
      id: 'UNIV-QF-001',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：2次関数・場合分け',
      title: '軸が動く2次関数の最小値（場合分け・基本）',
      questionCount: 6,
      kumonRank: 'M',
      remediationIds: ['H1-QF-MM-001', 'H1-QF-SQ-001', 'J3-EXP-2-001'],
      explanation:
        '頂点の $x$ 座標（軸 $x=a$）が定義域の「①左側 ($a<0$)」「②内部 ($0\\le a\\le r$)」「③右側 ($a>r$)」の3つに場合分けして記述します。茨城大・筑波大の文理共通頻出テーマです。',
      template: 'univ_qf_moving_axis',
    },
    {
      id: 'UNIV-QF-002',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：2次関数・場合分け',
      title: '軸が動く2次関数の最小値（場合分け・記述演習）',
      questionCount: 6,
      kumonRank: 'M',
      remediationIds: ['UNIV-QF-001', 'H1-QF-MM-001', 'H1-QF-DISC-001'],
      explanation:
        '場合分けの境界値で最小値がつながっているか（連続性）を必ず検算しましょう。',
      template: 'univ_qf_moving_axis',
    },
    {
      id: 'UNIV-DIFF-001',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：微分法・定数分離',
      title: '定数分離による3次方程式の実数解の個数（基本）',
      questionCount: 8,
      kumonRank: 'N',
      remediationIds: ['H2-DIFF-AP-003', 'H1-QF-DISC-001', 'J3-QUAD-1-001'],
      explanation:
        '定数 $k$ を右辺に移項して $f(x) = k$ とし、曲線 $y=f(x)$ の極大値・極小値と水平線 $y=k$ の共有点の個数を増減表から読み取ります。',
      template: 'univ_const_sep',
    },
    {
      id: 'UNIV-DIFF-002',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：微分法・定数分離',
      title: '定数分離による3次方程式の実数解の個数（入試演習）',
      questionCount: 8,
      kumonRank: 'N',
      remediationIds: ['UNIV-DIFF-001', 'H2-DIFF-AP-003'],
      explanation:
        '記述答案では必ず増減表を明記し、極値と $k$ の大小関係を不等式で示しましょう。',
      template: 'univ_const_sep',
    },
    {
      id: 'UNIV-INTEQ-001',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：積分方程式',
      title: '定数型積分方程式の解法（筑波・茨城大頻出）',
      questionCount: 8,
      kumonRank: 'N',
      remediationIds: ['H2-INT-AREA-001', 'J1-EQ-5-001', 'E5-FADD-001'],
      explanation:
        '定積分 $\\int_0^1 f(t)\\,dt$ は $x$ を含まない定数なので $a$ とおき、$f(x)$ を $a$ で表してから元の定積分に代入して $a$ の方程式を解きます。',
      template: 'univ_int_equation',
      params: { mode: 'const' },
    },
    {
      id: 'UNIV-INTEQ-002',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：積分方程式',
      title: '変数型積分方程式（微分と代入の2ステップ）',
      questionCount: 8,
      kumonRank: 'N',
      remediationIds: ['UNIV-INTEQ-001', 'H2-DIFF-AP-001', 'H2-INT-AREA-001'],
      explanation:
        '①両辺を $x$ で微分して $\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)$ を取り出し、② $x=a$ を代入して左辺を $0$ にすることで定数を決定します。',
      template: 'univ_int_equation',
      params: { mode: 'var' },
    },
    {
      id: 'UNIV-SEQ-001',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：数列・漸化式',
      title: '数列の和 Sn と一般項 an の関係（n=1の確認）',
      questionCount: 8,
      kumonRank: 'N',
      remediationIds: ['HB-SIGMA-001', 'HB-SEQ-001', 'J1-EXP-SUB-001'],
      explanation:
        '$n \\ge 2$ で $a_n = S_n - S_{n-1}$ を計算し、最後に $n=1$ のとき $a_1 = S_1$ がその式を満たすか必ず確認して記述します。',
      template: 'univ_seq_sn_an',
    },
    {
      id: 'UNIV-SEQ-002',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：確率と漸化式',
      title: '確率漸化式の立式と解法（筑波大頻出）',
      questionCount: 6,
      kumonRank: 'O',
      remediationIds: ['HB-REC-001', 'HA-PROB-001', 'E6-FMUL-001'],
      explanation:
        '$n$ 回目から $n+1$ 回目への状態遷移を図に書き、余事象 $1 - p_n$ を用いて $p_{n+1}$ と $p_n$ の漸化式を立てます。',
      template: 'univ_prob_recurrence',
    },
    {
      id: 'UNIV-VEC-001',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：空間ベクトル・複素数平面',
      title: '空間ベクトルの成分・内積・大きさ（筑波・茨城大定番）',
      questionCount: 8,
      kumonRank: 'N',
      remediationIds: ['HC-VEC-001', 'J3-PYTH-1-001'],
      explanation:
        '空間でも内積 $\\vec{a}\\cdot\\vec{b} = a_1 b_1 + a_2 b_2 + a_3 b_3$、大きさ $|\\vec{a}|^2 = a_1^2 + a_2^2 + a_3^2$ がそのまま成り立ちます。',
      template: 'univ_space_vec',
    },
    {
      id: 'UNIV-CMP-001',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：空間ベクトル・複素数平面',
      title: '複素数平面における回転移動（筑波大理系頻出）',
      questionCount: 8,
      kumonRank: 'O',
      remediationIds: ['HC-CMP-001', 'H2-TRIG-001', 'H2-CMP-001'],
      explanation:
        '原点のまわりに角 $\\theta$ だけ回転させる操作は、$\\cos\\theta + i\\sin\\theta$ を掛けることに対応します（$\\frac{\\pi}{2}$ 回転は $\\times i$）。',
      template: 'univ_complex_rot',
    },
    {
      id: 'UNIV-M3-001',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：数Ⅲ微積分（筑波大・茨城大理系）',
      title: '区分求積法と定積分の極限',
      questionCount: 8,
      kumonRank: 'O',
      remediationIds: ['H3-LIM-001', 'H2-INT-AREA-001', 'HB-SIGMA-001'],
      explanation:
        '$\\lim_{n\\to\\infty}\\frac{1}{n}\\sum_{k=1}^n f\\left(\\frac{k}{n}\\right) = \\int_0^1 f(x)\\,dx$。$\\frac{1}{n}$ をくくり出して $\\frac{k}{n}$ の関数に変形するのが定石です。',
      template: 'univ_riemann_sum',
    },
    {
      id: 'UNIV-M3-002',
      stage: '大学入試（茨城大・筑波大）',
      category: '二次対策：数Ⅲ微積分（筑波大・茨城大理系）',
      title: '三角置換積分（x = a sinθ 型・円の面積導出）',
      questionCount: 6,
      kumonRank: 'O',
      remediationIds: ['H3-INT-SUB-001', 'H2-TRIG-001', 'H1-TRIG-V-001'],
      explanation:
        '$\\sqrt{a^2 - x^2}$ を含む定積分では $x = a\\sin\\theta$（$dx = a\\cos\\theta\\,d\\theta$）と置換し、積分区間も $0 \\to \\frac{\\pi}{2}$ に変換して半角公式で計算します。',
      template: 'univ_trig_sub_int',
    },
  ];

  return specs;
}
