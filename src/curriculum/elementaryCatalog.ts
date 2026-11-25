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

  // ================= 小学校1年（約75ステップ・各20問） =================
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
      explanation: '2つの数をあわせていくつになるかを考えます。指を使わずにすぐ答えが出るまで練習しましょう。',
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
      explanation: '「あといくつで10になるか」を考えて、10のまとまりをつくってから残りをたします。',
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
      explanation: 'はじめの数からとった残りを求めます。たし算の逆としてすぐ答えが出るようにしましょう。',
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
      explanation: '10のまとまりからひいて、残りの1けたをたす（減加法）で確実に計算します。',
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
      explanation: '左から順番に計算するか、あわせて10になる組を先に見つけて計算します。',
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
      explanation: '一の位どうしをたして、十の位はそのままにします。',
      template: 'add',
      paramsFn: () => ({ aMin: 11, aMax: 89, bMin: 1, bMax: 8, carry: 'no' }),
    })
  );

  // ================= 小学校2年（約85ステップ・各20問） =================
  specs.push(
    ...expandSeries({
      prefix: 'E2-ADD1',
      stage: '小学校2年',
      category: '2けたのたし算（筆算）',
      baseTitle: '2けた＋1けた（くり上がりあり）',
      subLabels: DRILL_SETS_5,
      questionCount: 20,
      explanation: '一の位が10以上になったら、十の位に1くり上げます。',
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
      explanation: '位をたてにそろえて、一の位から順番にたします。',
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
      explanation: '一の位からたし、10以上になったら次の位に1くり上げます。',
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
      explanation: '位をたてにそろえて、一の位からひきます。',
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
      explanation: '一の位がひけないときは、十の位から1くり下げて10として計算します。',
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
      explanation: '百の位・十の位・一の位をそろえて、右の位から順に計算します。',
      template: 'add',
      paramsFn: (i) => ({
        aMin: 100,
        aMax: 699,
        bMin: i < 2 ? 12 : 100,
        bMax: i < 2 ? 98 : 499,
      }),
    })
  );

  // 九九（2の段〜9の段 × 順番・ランダム・虫食い = 24ステップ + 総合8ステップ）
  for (let dan = 2; dan <= 9; dan += 1) {
    specs.push(
      {
        id: `E2-KUKU-${dan}A`,
        stage: '小学校2年',
        category: 'かけ算九九',
        title: `かけ算九九 ${dan}の段（順番に練習）`,
        questionCount: 18,
        explanation: `${dan}の段は答えが${dan}ずつふえていきます。声に出しながらリズムよく覚えましょう。`,
        template: 'mul',
        params: { fixed: dan, ordered: true },
      },
      {
        id: `E2-KUKU-${dan}B`,
        stage: '小学校2年',
        category: 'かけ算九九',
        title: `かけ算九九 ${dan}の段（バラバラ）`,
        questionCount: 20,
        explanation: `順番がバラバラでも1問1秒以内で答えられるように練習しましょう。`,
        template: 'mul',
        params: { fixed: dan, ordered: false },
      },
      {
        id: `E2-KUKU-${dan}C`,
        stage: '小学校2年',
        category: 'かけ算九九',
        title: `かけ算九九 ${dan}の段（虫食い・逆算）`,
        questionCount: 20,
        explanation: `わり算の準備として、${dan}に何をかけたらその数になるか考えます。`,
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
      subLabels: ['2〜5の段', '6〜9の段', '全段ミックス1', '全段ミックス2', '全段ミックス3', '全段スピード仕上げ'],
      questionCount: 20,
      explanation: '2の段から9の段までランダムに出題されます。満点を目指しましょう。',
      template: 'mul',
      paramsFn: (i) => ({
        aMin: i === 1 ? 6 : 2,
        aMax: i === 0 ? 5 : 9,
        bMin: 1,
        bMax: 9,
      }),
    })
  );

  // ================= 小学校3年（約75ステップ・各20問） =================
  specs.push(
    ...expandSeries({
      prefix: 'E3-ADD3',
      stage: '小学校3年',
      category: '3けた・4けたの筆算',
      baseTitle: '3けた＋3けたの筆算',
      subLabels: ['くり上がり1回・基本', 'くり上がり1回・反復', 'くり上がり2回・基本', 'くり上がり2回・反復', '4けたのたし算1', '4けたのたし算2'],
      questionCount: 20,
      explanation: 'くり上がりの「1」を小さくメモしながら正確に計算しましょう。',
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
      explanation: 'くり下がりが続くときは、上の位が1減ることを忘れずに計算します。',
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
      subLabels: ['2・3でわる', '4・5でわる', '6・7でわる', '8・9でわる', '全段ミックス1', '全段ミックス2', '全段スピード仕上げ'],
      questionCount: 20,
      explanation: 'わる数の九九を使って、わられる数になるかけ算を見つけます。',
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
      explanation: 'あまりは必ず「わる数より小さく」なります。計算後に検算（わる数×商＋あまり）しましょう。',
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
      explanation: '一の位、十の位の順に1けたの数をかけ、くり上がりをたします。',
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
      explanation: '一の位・十の位・百の位の順に1けたをかけます。',
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
      explanation: '一の位をかけた答えと、十の位をかけた答え（1けた左にずらす）をたし合わせます。',
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
      explanation: '小数点の位置をたてにそろえて、整数と同じように計算します。',
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
      explanation: '分母は変えずに、分子どうしをたしたりひいたりします。',
      template: 'frac_add_sub',
      paramsFn: (i) => ({ sameDen: true, isSub: i >= 2 }),
    })
  );

  // ================= 小学校4年（約65ステップ・各15〜20問） =================
  specs.push(
    ...expandSeries({
      prefix: 'E4-DIV21',
      stage: '小学校4年',
      category: 'わり算の筆算（1けたでわる）',
      baseTitle: '2けた÷1けたの筆算',
      subLabels: ['あまりなし1', 'あまりなし2', 'あまりなし3', 'あまりあり1', 'あまりあり2', 'あまりあり3'],
      questionCount: 15,
      explanation: '「たてる → かける → ひく → おろす」の4ステップを十の位から繰り返します。',
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
      explanation: '百の位から順に商をたてます。たてられないときは十の位からたてます。',
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
      explanation: 'わる数を近い何十と見て「仮商」をたて、大きすぎたら1小さくして調整します。',
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
      explanation: '小数点をそろえ、空いている位には0があるものとして計算します。',
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
      explanation: '整数どうしのかけ算として計算し、あとから小数点以下のけた数だけ左に小数点を打ちます。',
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
      explanation: '長方形の面積は「たて × 横」、正方形の面積は「1辺 × 1辺」で求めます。',
      template: 'geom_area',
      paramsFn: () => ({ shape: 'rect' }),
    })
  );

  // ================= 小学校5年（約80ステップ・各15〜20問） =================
  specs.push(
    ...expandSeries({
      prefix: 'E5-DECMUL',
      stage: '小学校5年',
      category: '小数のかけ算',
      baseTitle: '小数×小数の筆算',
      subLabels: ['小数第1位×第1位・基本', '小数第1位×第1位・反復', '小数第2位×第1位・基本', '小数第2位×第1位・反復', '総合1', '総合2'],
      questionCount: 15,
      explanation: 'かける数とかけられる数の小数点以下のけた数の合計だけ、答えの小数点を左へ動かします。',
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
      explanation: 'わる数が整数になるように、わる数とわられる数の小数点を同じけた数だけ右へ動かします。',
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
      explanation: '共通する約数の中で最大のものが最大公約数、共通する倍数の中で最小のものが最小公倍数です。',
      template: 'gcd_lcm',
      paramsFn: (i) => ({ mode: i < 4 ? 'gcd' : 'lcm' }),
    }),
    ...expandSeries({
      prefix: 'E5-RED',
      stage: '小学校5年',
      category: '約分・通分',
      baseTitle: '分数の約分トレーニング',
      subLabels: ['基本1', '基本2', '基本3', '反復1', '反復2', 'スピード仕上げ'],
      questionCount: 20,
      explanation: '分母と分子を最大公約数でわり、これ以上われない既約分数にします。',
      template: 'frac_reduce',
    }),
    ...expandSeries({
      prefix: 'E5-FADD',
      stage: '小学校5年',
      category: '異分母分数のたし算・ひき算',
      baseTitle: '異分母分数のたし算',
      subLabels: ['基本1', '基本2', '基本3', '約分あり1', '約分あり2', '約分あり3', '総合1', '総合2'],
      questionCount: 15,
      explanation: '分母の最小公倍数で通分してから分子をたします。最後に約分できるか必ず確認しましょう。',
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
      explanation: '通分してから分子どうしをひき、最後に約分します。',
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
      explanation: '$p\\%$ は $\\frac{p}{100}$ のこと。もとにする量に割合をかけて求めます。',
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
      explanation: '道のり $=$ 速さ $\\times$ 時間、速さ $=$ 道のり $\\div$ 時間 の関係を使います。',
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
      explanation: '三角形の面積は「底辺 × 高さ ÷ 2」で求めます。',
      template: 'geom_area',
      paramsFn: () => ({ shape: 'tri' }),
    })
  );

  // ================= 小学校6年（約65ステップ・各15〜20問） =================
  specs.push(
    ...expandSeries({
      prefix: 'E6-FMUL',
      stage: '小学校6年',
      category: '分数のかけ算',
      baseTitle: '分数×分数の計算',
      subLabels: ['基本1', '基本2', '基本3', '途中約分1', '途中約分2', '途中約分3', '総合1', '総合2'],
      questionCount: 20,
      explanation: '分母どうし・分子どうしをかけます。かける前にナナメで約分すると計算が速くなります。',
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
      explanation: 'わる分数の分母と分子を入れかえて（逆数にして）かけ算に直します。',
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
      explanation: '比の両方の数を最大公約数でわって、最も簡単な整数の比にします。',
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
      explanation: '円の面積は「半径 × 半径 × 3.14」で求めます。',
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
      explanation: 'わからない数を $x$ とおき、逆の計算を使って $x$ の値を求めます。',
      template: 'linear_eq',
      paramsFn: () => ({ kind: 'x_plus_a' }),
    })
  );

  return specs;
}
