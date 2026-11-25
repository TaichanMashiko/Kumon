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

const DRILL_SETS_5 = ['基本1', '基本2', '定着1', '定着2', '仕上げ'];
const DRILL_SETS_4 = ['導入', '基本', '反復', '定着'];
const DRILL_SETS_3 = ['基本', '反復', '仕上げ'];

export function buildElementaryCatalog(): MicroStepSpec[] {
  const specs: MicroStepSpec[] = [];

  // ================= 小学校1年 =================
  specs.push(
    ...expandSeries({
      prefix: 'E1-ADD1',
      stage: '小学校1年',
      category: 'たし算（くり上がりなし）',
      baseTitle: '1けたのたし算',
      subLabels: [
        '和が5まで・基本',
        '和が5まで・反復',
        '和が7まで・基本',
        '和が7まで・反復',
        '和が9まで・基本',
        '和が9まで・反復',
        '和が10まで・基本',
        '和が10まで・反復',
        '10をつくるたし算1',
        '10をつくるたし算2',
      ],
      questionCount: 20,
      explanation:
        '2つの数をあわせた大きさを求めます。大きい方の数から、もう一方の数だけ数えたしてみましょう。\n\n**例**：$3 + 2$ は、$3$ の次から $4, 5$ と $2$ つ進んで **$5$** です。ブロックや丸をかいて考えても大丈夫です。',
      template: 'add',
      paramsFn: (i) => ({
        aMin: 1,
        aMax: i < 2 ? 4 : i < 4 ? 6 : 9,
        bMin: 1,
        bMax: i < 2 ? 4 : i < 4 ? 6 : 9,
        maxSum: i < 2 ? 5 : i < 4 ? 7 : i < 6 ? 9 : 10,
      }),
    }),
    ...expandSeries({
      prefix: 'E1-ADD2',
      stage: '小学校1年',
      category: 'たし算（くり上がりあり）',
      baseTitle: 'くり上がりのあるたし算',
      subLabels: [
        '9＋□（基本）',
        '9＋□（反復）',
        '8＋□（基本）',
        '8＋□（反復）',
        '7＋□（基本）',
        '7＋□（反復）',
        '6＋□（基本）',
        '6＋□（反復）',
        '5＋□・4＋□',
        'くり上がり総合1',
        'くり上がり総合2',
        'くり上がり総合3',
        'くり上がり仕上げ1',
        'くり上がり仕上げ2',
      ],
      questionCount: 20,
      explanation:
        '「あといくつで $10$ になるか」を考え、後ろの数を2つに分けて（さくらんぼ計算）$10$ のまとまりをつくります。\n\n**例**：$8 + 5$ のとき、$8$ はあと $2$ で $10$ になります。$5$ を $2$ と $3$ に分けて、$8 + 2 = 10$、$10 + 3 = 13$ です。',
      template: 'add',
      paramsFn: (i) => {
        if (i < 2) return { aMin: 9, aMax: 9, bMin: 2, bMax: 9, carry: 'yes' };
        if (i < 4) return { aMin: 8, aMax: 8, bMin: 3, bMax: 9, carry: 'yes' };
        if (i < 6) return { aMin: 7, aMax: 7, bMin: 4, bMax: 9, carry: 'yes' };
        if (i < 8) return { aMin: 6, aMax: 6, bMin: 5, bMax: 9, carry: 'yes' };
        if (i === 8) return { aMin: 4, aMax: 5, bMin: 6, bMax: 9, carry: 'yes' };
        return { aMin: 2, aMax: 9, bMin: 2, bMax: 9, carry: 'yes' };
      },
    }),
    ...expandSeries({
      prefix: 'E1-SUB1',
      stage: '小学校1年',
      category: 'ひき算（くり下がりなし）',
      baseTitle: '1けたのひき算',
      subLabels: [
        '5までのひき算1',
        '5までのひき算2',
        '8までのひき算1',
        '8までのひき算2',
        '10までのひき算1',
        '10までのひき算2',
        '10からひく計算1',
        '10からひく計算2',
        'くり下がりなし総合1',
        'くり下がりなし総合2',
      ],
      questionCount: 20,
      explanation:
        'はじめの数から、とった残りを求めます。「ひく数にいくつたすとはじめの数になるか」と考えることもできます。\n\n**例**：$7 - 3$ は、$3$ に $4$ をたすと $7$ なので **$4$** です。',
      template: 'sub',
      paramsFn: (i) => ({
        aMin: i >= 6 && i < 8 ? 10 : 3,
        aMax: i < 2 ? 5 : i < 4 ? 8 : 10,
        bMin: 1,
        bMax: i < 2 ? 4 : i < 4 ? 7 : 9,
        borrow: 'no',
      }),
    }),
    ...expandSeries({
      prefix: 'E1-SUB2',
      stage: '小学校1年',
      category: 'ひき算（くり下がりあり）',
      baseTitle: 'くり下がりのあるひき算',
      subLabels: [
        '11−□（基本）',
        '11−□（反復）',
        '12−□（基本）',
        '12−□（反復）',
        '13−□（基本）',
        '13−□（反復）',
        '14−□・15−□',
        '16−□・17−□・18−□',
        'くり下がり総合1',
        'くり下がり総合2',
        'くり下がり総合3',
        'くり下がり仕上げ1',
        'くり下がり仕上げ2',
      ],
      questionCount: 20,
      explanation:
        '前の数を「$10$」と「残りの数」に分け、まず $10$ からひいて、出てきた答えに残りをたします。\n\n**例**：$13 - 5$ は、$13$ を $10$ と $3$ に分けます。$10 - 5 = 5$、それに $3$ をたして $5 + 3 = 8$ です。',
      template: 'sub',
      paramsFn: (i) => {
        if (i < 2) return { aMin: 11, aMax: 11, bMin: 2, bMax: 9, borrow: 'yes' };
        if (i < 4) return { aMin: 12, aMax: 12, bMin: 3, bMax: 9, borrow: 'yes' };
        if (i < 6) return { aMin: 13, aMax: 13, bMin: 4, bMax: 9, borrow: 'yes' };
        if (i === 6) return { aMin: 14, aMax: 15, bMin: 5, bMax: 9, borrow: 'yes' };
        if (i === 7) return { aMin: 16, aMax: 18, bMin: 7, bMax: 9, borrow: 'yes' };
        return { aMin: 11, aMax: 18, bMin: 2, bMax: 9, borrow: 'yes' };
      },
    }),
    ...expandSeries({
      prefix: 'E1-ADD3',
      stage: '小学校1年',
      category: '3つの数の計算・2けたの入口',
      baseTitle: '3つの数のたし算',
      subLabels: DRILL_SETS_5,
      questionCount: 20,
      explanation:
        '左から順番に2つずつたします。あわせて $10$ になる組があれば、先にたすと計算しやすくなります。\n\n**例**：$4 + 3 + 6$ は、$4 + 6 = 10$ を先につくると $10 + 3 = 13$ です。',
      template: 'add3',
      paramsFn: (i) => ({ max: i < 2 ? 5 : 9 }),
    }),
    ...expandSeries({
      prefix: 'E1-2D',
      stage: '小学校1年',
      category: '2けたのたし算・ひき算（基礎）',
      baseTitle: '2けた＋1けた（くり上がりなし）',
      subLabels: DRILL_SETS_5,
      questionCount: 20,
      explanation:
        '一の位どうしをたして、十の位はそのまま書きます。\n\n**例**：$23 + 4$ は、一の位で $3 + 4 = 7$、十の位は $2$ のままなので **$27$** です。',
      template: 'add',
      paramsFn: () => ({ aMin: 11, aMax: 89, bMin: 1, bMax: 8, carry: 'no' }),
    })
  );

  // ================= 小学校2年 =================
  specs.push(
    ...expandSeries({
      prefix: 'E2-ADD1',
      stage: '小学校2年',
      category: '2けたのたし算（筆算）',
      baseTitle: '2けた＋1けた（くり上がりあり）',
      subLabels: DRILL_SETS_5,
      questionCount: 20,
      explanation:
        '一の位どうしをたして $10$ 以上になったら、十の位に $1$ くり上げます。\n\n**例**：$28 + 5$ は、一の位 $8 + 5 = 13$ なので、一の位に $3$ を書き、十の位を $2 + 1 = 3$ にして **$33$** です。',
      template: 'add',
      paramsFn: () => ({ aMin: 12, aMax: 89, bMin: 2, bMax: 9, carry: 'yes' }),
    }),
    ...expandSeries({
      prefix: 'E2-ADD2',
      stage: '小学校2年',
      category: '2けたのたし算（筆算）',
      baseTitle: '2けた＋2けたの筆算（くり上がりなし）',
      subLabels: DRILL_SETS_5,
      questionCount: 20,
      explanation:
        '一の位と十の位をたてにそろえて書き、一の位から順番にたします。\n\n**例**：$32 + 45$ は、一の位 $2 + 5 = 7$、十の位 $3 + 4 = 7$ で **$77$** です。',
      template: 'add',
      paramsFn: () => ({ aMin: 11, aMax: 78, bMin: 11, bMax: 78, carry: 'no', maxSum: 99 }),
    }),
    ...expandSeries({
      prefix: 'E2-ADD3',
      stage: '小学校2年',
      category: '2けたのたし算（筆算）',
      baseTitle: '2けた＋2けたの筆算（くり上がりあり）',
      subLabels: ['基本1', '基本2', '和が100未満1', '和が100未満2', '和が100以上1', '和が100以上2', '総合1', '総合2'],
      questionCount: 20,
      explanation:
        '位をそろえて筆算し、一の位が $10$ 以上になったら十の位の上に小さく「$1$」とメモしてくり上げます。\n\n**例**：$47 + 36$ は、一の位 $7 + 6 = 13$（$1$ くり上げ）、十の位 $4 + 3 + 1 = 8$ で **$83$** です。',
      template: 'add',
      paramsFn: (i) => ({
        aMin: i >= 4 ? 45 : 15,
        aMax: 98,
        bMin: i >= 4 ? 45 : 15,
        bMax: 98,
        carry: 'yes',
        maxSum: i < 4 ? 99 : 198,
      }),
    }),
    ...expandSeries({
      prefix: 'E2-SUB1',
      stage: '小学校2年',
      category: '2けたのひき算（筆算）',
      baseTitle: '2けた−2けたの筆算（くり下がりなし）',
      subLabels: DRILL_SETS_5,
      questionCount: 20,
      explanation:
        '位をたてにそろえて、一の位からひきます。\n\n**例**：$68 - 25$ は、一の位 $8 - 5 = 3$、十の位 $6 - 2 = 4$ で **$43$** です。',
      template: 'sub',
      paramsFn: () => ({ aMin: 22, aMax: 99, bMin: 11, bMax: 88, borrow: 'no' }),
    }),
    ...expandSeries({
      prefix: 'E2-SUB2',
      stage: '小学校2年',
      category: '2けたのひき算（筆算）',
      baseTitle: '2けた−2けたの筆算（くり下がりあり）',
      subLabels: ['基本1', '基本2', '反復1', '反復2', '定着1', '定着2', '仕上げ1', '仕上げ2'],
      questionCount: 20,
      explanation:
        '一の位がひけないときは、十の位から $1$ くり下げて $10$ として計算します（十の位は $1$ 減ります）。\n\n**例**：$52 - 27$ は、十の位を $4$ にして一の位を $12 - 7 = 5$、十の位 $4 - 2 = 2$ で **$25$** です。',
      template: 'sub',
      paramsFn: () => ({ aMin: 21, aMax: 98, bMin: 12, bMax: 89, borrow: 'yes' }),
    }),
    ...expandSeries({
      prefix: 'E2-3D',
      stage: '小学校2年',
      category: '3けたのたし算・ひき算',
      baseTitle: '3けたのたし算・ひき算（基礎）',
      subLabels: ['3けた＋2けた・基本', '3けた＋2けた・反復', '3けた＋3けた・基本', '3けた＋3けた・反復', '3けた−2けた・基本', '3けた−2けた・反復'],
      questionCount: 20,
      explanation:
        '百の位・十の位・一の位をたてにそろえ、右の一の位から順に計算します。くり上がりは1つ左の位へ送ります。',
      template: 'add',
      paramsFn: (i) => ({
        aMin: 100,
        aMax: 699,
        bMin: i < 2 ? 12 : 100,
        bMax: i < 2 ? 98 : 499,
      }),
    })
  );

  for (let dan = 2; dan <= 9; dan += 1) {
    specs.push(
      {
        id: `E2-KUKU-${dan}A`,
        stage: '小学校2年',
        category: 'かけ算九九',
        title: `かけ算九九 ${dan}の段（順番に練習）`,
        questionCount: 18,
        explanation: `かけ算は「同じ数を何回たすか」を表します。${dan}の段は、かける数が $1$ ふえるごとに答えが **${dan} ずつ** ふえます。\n\n**例**：$${dan} \\times 3 = ${dan} + ${dan} + ${dan} = ${dan * 3}$ です。`,
        template: 'mul',
        params: { fixed: dan, ordered: true },
      },
      {
        id: `E2-KUKU-${dan}B`,
        stage: '小学校2年',
        category: 'かけ算九九',
        title: `かけ算九九 ${dan}の段（バラバラ）`,
        questionCount: 20,
        explanation: `${dan}の段を順番どおりでなく答える練習です。迷ったときは $${dan} \\times 5 = ${dan * 5}$ を目印にして、そこから ${dan} をたしたりひいたりして確かめられます。`,
        template: 'mul',
        params: { fixed: dan, ordered: false },
      },
      {
        id: `E2-KUKU-${dan}C`,
        stage: '小学校2年',
        category: 'かけ算九九',
        title: `かけ算九九 ${dan}の段（虫食い・逆算）`,
        questionCount: 20,
        explanation: `${dan} に何をかけると右の数になるかを考えます。これは小3で習う「わり算」の大切な土台になります。\n\n**例**：$${dan} \\times \\square = ${dan * 4}$ なら、${dan}の段から $\\square = 4$ です。`,
        template: 'mul_blank',
        params: { fixed: dan },
      }
    );
  }
  specs.push(
    ...expandSeries({
      prefix: 'E2-KUKU-ALL',
      stage: '小学校2年',
      category: 'かけ算九九（総合）',
      baseTitle: 'かけ算九九 ミックス総復習',
      subLabels: ['2〜5の段', '6〜9の段', '全段ミックス1', '全段ミックス2', '全段ミックス3', '全段仕上げ'],
      questionCount: 20,
      explanation:
        'かけ算では「かける数」と「かけられる数」を入れかえても答えは同じになります（交換法則：$3 \\times 7 = 7 \\times 3 = 21$）。得意な段に入れかえて確かめてみましょう。',
      template: 'mul',
      paramsFn: (i) => ({
        aMin: i === 1 ? 6 : 2,
        aMax: i === 0 ? 5 : 9,
        bMin: 1,
        bMax: 9,
      }),
    })
  );

  // ================= 小学校3年 =================
  specs.push(
    ...expandSeries({
      prefix: 'E3-ADD3',
      stage: '小学校3年',
      category: '3けた・4けたの筆算',
      baseTitle: '3けた＋3けたの筆算',
      subLabels: ['くり上がり1回・基本', 'くり上がり1回・反復', 'くり上がり2回・基本', 'くり上がり2回・反復', '4けたのたし算1', '4けたのたし算2'],
      questionCount: 20,
      explanation:
        '位をたてにそろえ、一の位 → 十の位 → 百の位の順に計算します。くり上がった「$1$」を上の位に小さく書いておくと見落としを防げます。',
      template: 'add',
      paramsFn: (i) => ({
        aMin: i >= 4 ? 1000 : 120,
        aMax: i >= 4 ? 4999 : 899,
        bMin: i >= 4 ? 1000 : 120,
        bMax: i >= 4 ? 4999 : 899,
      }),
    }),
    ...expandSeries({
      prefix: 'E3-SUB3',
      stage: '小学校3年',
      category: '3けた・4けたの筆算',
      baseTitle: '3けた−3けたの筆算',
      subLabels: ['くり下がり1回・基本', 'くり下がり1回・反復', 'くり下がり2回・基本', 'くり下がり2回・反復', '4けたのひき算1', '4けたのひき算2'],
      questionCount: 20,
      explanation:
        'ひけない位では1つ左の位から $1$ くり下げます。くり下げた元の数字に斜線を引いて $1$ 小さい数を書き直しておくと正確です。',
      template: 'sub',
      paramsFn: (i) => ({
        aMin: i >= 4 ? 2000 : 300,
        aMax: i >= 4 ? 8999 : 999,
        bMin: i >= 4 ? 1000 : 111,
        bMax: i >= 4 ? 4999 : 699,
      }),
    }),
    ...expandSeries({
      prefix: 'E3-DIV1',
      stage: '小学校3年',
      category: 'わり算（九九の逆算）',
      baseTitle: 'あまりのないわり算',
      subLabels: ['2・3でわる', '4・5でわる', '6・7でわる', '8・9でわる', '全段ミックス1', '全段ミックス2', '全段仕上げ'],
      questionCount: 20,
      explanation:
        'わり算は「わる数の九九」を使って求めます。\n\n**例**：$24 \\div 6$ は、「$6 \\times \\square = 24$」となる数を $6$ の段から見つけて **$4$** です。',
      template: 'div_exact',
      paramsFn: (i) => {
        const ranges: Array<[number, number]> = [
          [2, 3],
          [4, 5],
          [6, 7],
          [8, 9],
          [2, 9],
          [2, 9],
          [2, 9],
        ];
        const [dMin, dMax] = ranges[i] ?? [2, 9];
        return { dMin, dMax, qMin: 1, qMax: 9 };
      },
    }),
    ...expandSeries({
      prefix: 'E3-DIV2',
      stage: '小学校3年',
      category: 'あまりのあるわり算',
      baseTitle: 'あまりのあるわり算',
      subLabels: ['2・3でわる', '4・5でわる', '6・7でわる', '8・9でわる', 'ミックス1', 'ミックス2', 'ミックス3', '仕上げ'],
      questionCount: 20,
      explanation:
        'わる数の九九で、わられる数をこえない一番大きい数を見つけ、その差を「あまり」にします。あまりは必ず**わる数より小さく**なります。\n\n**例**：$17 \\div 5$ は $5 \\times 3 = 15$、$17 - 15 = 2$ より **$3$ あまり $2$**（検算：$5 \\times 3 + 2 = 17$）。',
      template: 'div_rem',
      paramsFn: (i) => {
        const ranges: Array<[number, number]> = [
          [2, 3],
          [4, 5],
          [6, 7],
          [8, 9],
          [2, 9],
          [2, 9],
          [2, 9],
          [2, 9],
        ];
        const [dMin, dMax] = ranges[i] ?? [2, 9];
        return { dMin, dMax, qMin: 1, qMax: 9 };
      },
    }),
    ...expandSeries({
      prefix: 'E3-MUL21',
      stage: '小学校3年',
      category: 'かけ算の筆算',
      baseTitle: '2けた×1けたの筆算',
      subLabels: ['くり上がりなし1', 'くり上がりなし2', 'くり上がりあり1', 'くり上がりあり2', 'くり上がりあり3', '総合仕上げ'],
      questionCount: 20,
      explanation:
        '一の位、十の位の順に1けたの数をかけます。\n\n**例**：$24 \\times 3$ は、一の位 $4 \\times 3 = 12$（$1$ くり上げ）、十の位 $2 \\times 3 + 1 = 7$ で **$72$** です。',
      template: 'mul',
      paramsFn: (i) => ({ aMin: 12, aMax: i < 2 ? 33 : 98, bMin: 2, bMax: i < 2 ? 3 : 9 }),
    }),
    ...expandSeries({
      prefix: 'E3-MUL31',
      stage: '小学校3年',
      category: 'かけ算の筆算',
      baseTitle: '3けた×1けたの筆算',
      subLabels: DRILL_SETS_5,
      questionCount: 15,
      explanation:
        '一の位 → 十の位 → 百の位の順にかけ、くり上がった数を次の積にたします。\n\n**例**：$135 \\times 2$ は $5\\times 2=10$、$3\\times 2+1=7$、$1\\times 2=2$ で **$270$** です。',
      template: 'mul',
      paramsFn: () => ({ aMin: 102, aMax: 899, bMin: 2, bMax: 9 }),
    }),
    ...expandSeries({
      prefix: 'E3-MUL22',
      stage: '小学校3年',
      category: 'かけ算の筆算',
      baseTitle: '2けた×2けたの筆算',
      subLabels: ['基本1', '基本2', '基本3', '反復1', '反復2', '仕上げ'],
      questionCount: 15,
      explanation:
        '①一の位をかけた答え、②十の位をかけた答え（十の位から左へ書く）の2段をつくり、最後にたてにたし合わせます。\n\n**例**：$23 \\times 12 = 23 \\times 2 + 23 \\times 10 = 46 + 230 = 276$ です。',
      template: 'mul',
      paramsFn: (i) => ({ aMin: 12, aMax: i < 2 ? 39 : 89, bMin: 12, bMax: i < 2 ? 39 : 89 }),
    }),
    ...expandSeries({
      prefix: 'E3-DEC',
      stage: '小学校3年',
      category: '小数のたし算・ひき算',
      baseTitle: '小数第1位のたし算・ひき算',
      subLabels: ['たし算・基本', 'たし算・反復', 'たし算・くり上がり', 'ひき算・基本', 'ひき算・くり下がり'],
      questionCount: 20,
      explanation:
        '小数点の位置をたてにそろえて筆算します。$0.1$ がいくつ分あるかで考えると整数と同じように計算できます。\n\n**例**：$1.4 + 0.8$ は $0.1$ が $14 + 8 = 22$ 個なので **$2.2$** です。',
      template: 'dec_add_sub',
      paramsFn: (i) => ({ scale: 10, isSub: i >= 3, maxVal: 89 }),
    }),
    ...expandSeries({
      prefix: 'E3-FRAC',
      stage: '小学校3年',
      category: '同分母の分数',
      baseTitle: '同分母分数のたし算・ひき算',
      subLabels: ['たし算1', 'たし算2', 'ひき算1', 'ひき算2'],
      questionCount: 20,
      explanation:
        '分母が同じ分数は、単位分数（$\\frac{1}{\\text{分母}}$）がいくつ分あるかを数えるので、分母はそのままで**分子どうし**を計算します。\n\n**例**：$\\frac{2}{5} + \\frac{1}{5} = \\frac{2+1}{5} = \\frac{3}{5}$ です。',
      template: 'frac_add_sub',
      paramsFn: (i) => ({ sameDen: true, isSub: i >= 2 }),
    })
  );

  // ================= 小学校4年 =================
  specs.push(
    ...expandSeries({
      prefix: 'E4-DIV21',
      stage: '小学校4年',
      category: 'わり算の筆算（1けたでわる）',
      baseTitle: '2けた÷1けたの筆算',
      subLabels: ['あまりなし1', 'あまりなし2', 'あまりなし3', 'あまりあり1', 'あまりあり2', 'あまりあり3'],
      questionCount: 15,
      explanation:
        '十の位から順に「**①たてる → ②かける → ③ひく → ④おろす**」の4手順を繰り返します。\n\n**例**：$72 \\div 3$ は、十の位 $7 \\div 3 = 2$ あまり $1$、$2$ をおろして $12 \\div 3 = 4$ より **$24$** です。',
      template: 'div_exact',
      paramsFn: () => ({ dMin: 2, dMax: 9, qMin: 11, qMax: 29 }),
    }),
    ...expandSeries({
      prefix: 'E4-DIV31',
      stage: '小学校4年',
      category: 'わり算の筆算（1けたでわる）',
      baseTitle: '3けた÷1けたの筆算',
      subLabels: ['商が3けた・基本', '商が3けた・反復', '商が2けた・基本', '商が2けた・反復', 'あまりあり1', 'あまりあり2'],
      questionCount: 15,
      explanation:
        '百の位から商をたてます。百の位がわる数より小さくてたてられないときは、百の位と十の位をあわせた2けたで十の位に商をたてます。',
      template: 'div_exact',
      paramsFn: (i) => ({ dMin: 2, dMax: 9, qMin: i < 2 ? 105 : 25, qMax: i < 2 ? 299 : 98 }),
    }),
    ...expandSeries({
      prefix: 'E4-DIV22',
      stage: '小学校4年',
      category: 'わり算の筆算（2けたでわる）',
      baseTitle: '2けた・3けた÷2けたの筆算',
      subLabels: ['仮商そのまま1', '仮商そのまま2', '仮商の修正1', '仮商の修正2', '3けた÷2けた1', '3けた÷2けた2', 'あまりあり1', 'あまりあり2'],
      questionCount: 15,
      explanation:
        'わる数を近い「何十」と見なして仮の商（仮商）をたてます。かけてみて引けなければ仮商を $1$ 小さくし、あまりがわる数以上なら $1$ 大きくして直します。',
      template: 'div_exact',
      paramsFn: (i) => ({ dMin: 12, dMax: 48, qMin: i >= 4 ? 11 : 2, qMax: i >= 4 ? 29 : 9 }),
    }),
    ...expandSeries({
      prefix: 'E4-DEC1',
      stage: '小学校4年',
      category: '小数の計算',
      baseTitle: '小数第2位までのたし算・ひき算',
      subLabels: ['たし算1', 'たし算2', 'たし算3', 'ひき算1', 'ひき算2', 'ひき算3'],
      questionCount: 20,
      explanation:
        '小数点をたてにそろえて書きます。けた数がちがうときは末尾に $0$ を補って考え、答えの末尾の不要な $0$ は消します。\n\n**例**：$2.35 + 1.4 = 2.35 + 1.40 = 3.75$ です。',
      template: 'dec_add_sub',
      paramsFn: (i) => ({ scale: 100, isSub: i >= 3, maxVal: 599 }),
    }),
    ...expandSeries({
      prefix: 'E4-DEC2',
      stage: '小学校4年',
      category: '小数×整数・小数÷整数',
      baseTitle: '小数×整数の筆算',
      subLabels: ['小数第1位×1けた1', '小数第1位×1けた2', '小数第2位×1けた1', '小数第2位×1けた2', '小数×2けた1', '小数×2けた2'],
      questionCount: 15,
      explanation:
        'いったん小数点がない整数どうしとして筆算し、最後にかけられる数の小数点以下のけた数だけ右から左へ小数点を打ちます。\n\n**例**：$1.2 \\times 4$ は $12 \\times 4 = 48$、小数第1位なので **$4.8$** です。',
      template: 'dec_mul',
      paramsFn: (i) => ({ aScale: i === 2 || i === 3 ? 100 : 10, bScale: 1 }),
    }),
    ...expandSeries({
      prefix: 'E4-AREA',
      stage: '小学校4年',
      category: '面積',
      baseTitle: '長方形・正方形の面積',
      subLabels: DRILL_SETS_4,
      questionCount: 15,
      explanation:
        '面積は $1\\text{ cm}^2$ の正方形が何個並ぶかで表します。長方形は「$\\text{たて} \\times \\text{横}$」、正方形は「$1\\text{辺} \\times 1\\text{辺}$」で求めます。',
      template: 'geom_area',
      paramsFn: () => ({ shape: 'rect' }),
    })
  );

  // ================= 小学校5年 =================
  specs.push(
    ...expandSeries({
      prefix: 'E5-DECMUL',
      stage: '小学校5年',
      category: '小数のかけ算',
      baseTitle: '小数×小数の筆算',
      subLabels: ['小数第1位×第1位・基本', '小数第1位×第1位・反復', '小数第2位×第1位・基本', '小数第2位×第1位・反復', '総合1', '総合2'],
      questionCount: 15,
      explanation:
        '整数どうしのかけ算を計算したあと、2つの数の**小数点以下のけた数の合計**だけ右から左へ小数点を打ちます。\n\n**例**：$1.2 \\times 0.3$ は $12 \\times 3 = 36$、小数点以下は $1+1=2$ けたなので **$0.36$** です。',
      template: 'dec_mul',
      paramsFn: (i) => ({ aScale: i >= 2 ? 100 : 10, bScale: 10 }),
    }),
    ...expandSeries({
      prefix: 'E5-DECDIV',
      stage: '小学校5年',
      category: '小数のわり算',
      baseTitle: '小数÷小数の筆算',
      subLabels: ['基本1', '基本2', '小数点移動1', '小数点移動2', '総合1', '総合2'],
      questionCount: 15,
      explanation:
        'わる数とわられる数の両方に同じ $10$ 倍・$100$ 倍をして、**わる数を整数にしてから**わり算します。\n\n**例**：$3.6 \\div 0.4$ は両方 $10$ 倍して $36 \\div 4 = 9$ です。',
      template: 'dec_div',
      paramsFn: (i) => ({ dScale: i >= 2 ? 100 : 10 }),
    }),
    ...expandSeries({
      prefix: 'E5-GCD',
      stage: '小学校5年',
      category: '倍数と約数',
      baseTitle: '最大公約数・最小公倍数',
      subLabels: [
        '最大公約数・基本1',
        '最大公約数・基本2',
        '最大公約数・反復1',
        '最大公約数・反復2',
        '最小公倍数・基本1',
        '最小公倍数・基本2',
        '最小公倍数・反復1',
        '最小公倍数・反復2',
      ],
      questionCount: 15,
      explanation:
        '2つの数に共通する約数（公約数）のうち最大のものが**最大公約数**、共通する倍数（公倍数）のうち最小のものが**最小公倍数**です。\n\n**例**：$12$ と $18$ なら最大公約数は $6$、最小公倍数は $36$ です。',
      template: 'gcd_lcm',
      paramsFn: (i) => ({ mode: i < 4 ? 'gcd' : 'lcm' }),
    }),
    ...expandSeries({
      prefix: 'E5-RED',
      stage: '小学校5年',
      category: '約分・通分',
      baseTitle: '分数の約分トレーニング',
      subLabels: ['基本1', '基本2', '基本3', '反復1', '反復2', '仕上げ'],
      questionCount: 20,
      explanation:
        '分母と分子を同じ数（最大公約数）でわって、これ以上われない最も簡単な分数にします。\n\n**例**：$\\frac{12}{18}$ は分母・分子を $6$ でわって $\\frac{2}{3}$ です。',
      template: 'frac_reduce',
    }),
    ...expandSeries({
      prefix: 'E5-FADD',
      stage: '小学校5年',
      category: '異分母分数のたし算・ひき算',
      baseTitle: '異分母分数のたし算',
      subLabels: ['基本1', '基本2', '基本3', '約分あり1', '約分あり2', '約分あり3', '総合1', '総合2'],
      questionCount: 15,
      explanation:
        '分母の最小公倍数で分母をそろえ（通分）、分子どうしをたします。最後に約分できるか必ず確認します。\n\n**例**：$\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$ です。',
      template: 'frac_add_sub',
      paramsFn: () => ({ sameDen: false, isSub: false }),
    }),
    ...expandSeries({
      prefix: 'E5-FSUB',
      stage: '小学校5年',
      category: '異分母分数のたし算・ひき算',
      baseTitle: '異分母分数のひき算',
      subLabels: ['基本1', '基本2', '基本3', '約分あり1', '約分あり2', '約分あり3', '総合1', '総合2'],
      questionCount: 15,
      explanation:
        '分母を通分してから分子どうしをひき、最後に約分します。\n\n**例**：$\\frac{2}{3} - \\frac{1}{6} = \\frac{4}{6} - \\frac{1}{6} = \\frac{3}{6} = \\frac{1}{2}$ です。',
      template: 'frac_add_sub',
      paramsFn: () => ({ sameDen: false, isSub: true }),
    }),
    ...expandSeries({
      prefix: 'E5-PCT',
      stage: '小学校5年',
      category: '割合と百分率・速さ',
      baseTitle: '百分率（％）の計算',
      subLabels: DRILL_SETS_5,
      questionCount: 15,
      explanation:
        '$100\\%$ を $1$ としたとき、$p\\%$ は $\\frac{p}{100}$ を表します。もとにする量に割合をかけて求めます。\n\n**例**：$800$ の $25\\%$ は $800 \\times \\frac{25}{100} = 200$ です。',
      template: 'percent_ratio',
      paramsFn: () => ({ mode: 'percent' }),
    }),
    ...expandSeries({
      prefix: 'E5-SPD',
      stage: '小学校5年',
      category: '割合と百分率・速さ',
      baseTitle: '速さ・道のり・時間',
      subLabels: DRILL_SETS_4,
      questionCount: 15,
      explanation:
        '「1時間あたりに進む距離（時速）」に時間をかけると全体の道のりが求まります。\n\n**公式**：$\\text{道のり} = \\text{速さ} \\times \\text{時間}$',
      template: 'percent_ratio',
      paramsFn: () => ({ mode: 'speed' }),
    }),
    ...expandSeries({
      prefix: 'E5-TRI',
      stage: '小学校5年',
      category: '図形の面積',
      baseTitle: '三角形の面積',
      subLabels: DRILL_SETS_4,
      questionCount: 15,
      explanation:
        '同じ三角形を2つ合わせると平行四辺形になるため、三角形の面積は「$\\text{底辺} \\times \\text{高さ} \\div 2$」で求めます。',
      template: 'geom_area',
      paramsFn: () => ({ shape: 'tri' }),
    })
  );

  // ================= 小学校6年 =================
  specs.push(
    ...expandSeries({
      prefix: 'E6-FMUL',
      stage: '小学校6年',
      category: '分数のかけ算',
      baseTitle: '分数×分数の計算',
      subLabels: ['基本1', '基本2', '基本3', '途中約分1', '途中約分2', '途中約分3', '総合1', '総合2'],
      questionCount: 20,
      explanation:
        '分母どうし・分子どうしをかけます。かける前に分母と分子をナナメに約分しておくと数が小さくなりミスを防げます。\n\n**例**：$\\frac{2}{3} \\times \\frac{3}{5} = \\frac{2}{5}$ です。',
      template: 'frac_mul_div',
      paramsFn: () => ({ isDiv: false }),
    }),
    ...expandSeries({
      prefix: 'E6-FDIV',
      stage: '小学校6年',
      category: '分数のわり算',
      baseTitle: '分数÷分数の計算',
      subLabels: ['逆数基本1', '逆数基本2', '逆数基本3', '途中約分1', '途中約分2', '途中約分3', '総合1', '総合2'],
      questionCount: 20,
      explanation:
        '分数でわる計算は、わる数の分母と分子を入れかえた**逆数**をかける計算に直します。\n\n**例**：$\\frac{2}{3} \\div \\frac{4}{9} = \\frac{2}{3} \\times \\frac{9}{4} = \\frac{3}{2}$ です。',
      template: 'frac_mul_div',
      paramsFn: () => ({ isDiv: true }),
    }),
    ...expandSeries({
      prefix: 'E6-RATIO',
      stage: '小学校6年',
      category: '比とその利用',
      baseTitle: '比を簡単にする',
      subLabels: DRILL_SETS_5,
      questionCount: 20,
      explanation:
        '比の前と後ろの数を同じ最大公約数でわって、最も簡単な整数の比に直します。\n\n**例**：$12 : 18$ は両方を $6$ でわって **$2 : 3$** です。',
      template: 'percent_ratio',
      paramsFn: () => ({ mode: 'ratio' }),
    }),
    ...expandSeries({
      prefix: 'E6-CIR',
      stage: '小学校6年',
      category: '円の面積',
      baseTitle: '円の面積の計算',
      subLabels: DRILL_SETS_4,
      questionCount: 15,
      explanation:
        '円の面積は「$\\text{半径} \\times \\text{半径} \\times 3.14$」で求めます。まず $\\text{半径} \\times \\text{半径}$ を計算してから $3.14$ をかけると計算しやすくなります。',
      template: 'geom_area',
      paramsFn: () => ({ shape: 'circle' }),
    }),
    ...expandSeries({
      prefix: 'E6-EQ',
      stage: '小学校6年',
      category: '文字と式（中学への橋渡し）',
      baseTitle: 'xを使った式（逆算の基礎）',
      subLabels: DRILL_SETS_3,
      questionCount: 15,
      explanation:
        'わからない数を $x$ とおき、逆の計算を使って $x$ の値を求めます。\n\n**例**：$x + 5 = 12$ なら、$12$ から $5$ をひいて $x = 7$ です。',
      template: 'linear_eq',
      paramsFn: () => ({ kind: 'x_plus_a' }),
    })
  );

  return specs;
}
