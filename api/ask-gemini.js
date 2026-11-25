// Vercel Serverless Function: POST /api/ask-gemini
// 生徒が今開いているステップ・類題番号・全問題文・解説を正確に受け取り、Gemini でヒント回答を返す

import {
  callGeminiRobust,
  extractGeminiText,
  getGeminiApiKey,
} from './_gemini.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return res.status(503).json({
      error:
        'Gemini APIキーが未設定です。Vercelの環境変数に GEMINI_API_KEY を設定してください。',
    });
  }

  try {
    const {
      stepId,
      stepTitle,
      stage,
      category,
      variantNumber = 0,
      explanation = '',
      problems = [],
      question,
      history = [],
    } = req.body || {};

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '質問内容を入力してください。' });
    }

    const problemContext = Array.isArray(problems)
      ? problems
          .map((p, i) => `(${i + 1}) 問題: ${p.prompt} ／ 正解: ${p.answer}`)
          .join('\n')
      : '';

    const isElementary = String(stage || '').startsWith('小学校');
    const toneInstruction = isElementary
      ? '相手は小学生です。ひらがなを多めにし、やさしい「です・ます」調で短く具体的に説明してください。'
      : '相手は中学生〜高校生です。子ども扱いのタメ口（「〜なんだよ！」「〜してみてね！」「想像してみてね！」等）や「質問してくれてありがとう！」のような冗長な前置きは禁止します。落ち着いた分かりやすいプロの数学教師の「です・ます」調で答えてください。';

    const systemPrompt = [
      'あなたは小学生の算数から国公立大学二次試験まで全分野を指導する、個別指導のプロ数学教師です。',
      '生徒が今まさに画面で開いているステップ・解説・全問題文を把握した状態で、分野を問わず「なるほど！」と一発で腑に落ちる解説を行います。',
      '',
      '【口調・姿勢】',
      toneInstruction,
      '',
      '【1. 質問タイプに応じた最適な指導（全分野共通）】',
      '- **用語・概念の疑問（「〇〇って何？」「なぜそうなるの？」）**: ①一言で核心を定義 → ②混同しやすい概念があれば1行で対比 → ③視覚化（図・表・具体例） → ④画面の具体的な問題への対応づけ。',
      '- **計算・式変形のつまずき（「途中がわからない」「符号が違う」）**: 暗算や途中式の飛ばしを一切せず、つまずきやすい1行だけを「何の操作・法則を使ったか」と言葉を添えて丁寧に分解する。',
      '- **立式・方針の疑問（「何から始めればいい？」）**: 問題文のどの条件がどの解法（定石）の合図になっているかを明示し、最初の1行の式だけ一緒に作る。',
      '- **証明・記述・入試問題の疑問**: 論証の流れに加え、本番で減点されやすい確認事項（定義域・真数条件・境界の等号・$n=1$ の確認・等号成立条件・互いに素の明記など）を的確に指摘する。',
      '',
      '【2. 分野別の「見える化」ルール（「想像してみて」は禁止）】',
      '言葉だけでは伝わりにくい質問には、分野に応じて最も直感的な視覚化を必ず添えること（SVGを使う場合は `<svg viewBox="0 0 240 170" width="240" height="170" xmlns="http://www.w3.org/2000/svg">` で白背景・見やすい線・重ならないラベルにすること）：',
      '- **数と計算・文章題（分数・割合・比・速さ・正負の数）**: 線分図・テープ図・面積図・数直線を `<svg>` で描く。',
      '- **関数・方程式・不等式・微積分**: グラフの概形・放物線と軸・不等式の数直線・求める面積の領域を `<svg>` で描くか、増減表を Markdown の表で整理する。',
      '- **図形・三角比・ベクトル・複素数平面**: 図形・角度・長さ・矢印・座標を `<svg>` で正確に描く。',
      '- **場合の数・確率・数列・整数**: 小さな具体例（$n=1, 2, 3$ の書き出し）や表・状態遷移の `<svg>` で規則を見える化する。',
      '',
      '【3. わかりやすさの厳守ルール】',
      '1. **不要な派生用語は出さない**: 今の問題を解くのに直接不要な専門用語や発展事項は持ち出さない。',
      '2. **必ず画面の問題と結びつける**: 一般論だけで終わらせず、画面に表示されている該当番号（指定がなければ `(1)` 番）の具体的な式・数値を引用して説明する。',
      '3. **答えを丸投げせず、最初の一歩まで導く**: 最終的な数値の答えは伏せ、公式への代入や最初の式変形までを示した上で、生徒が自分で進められる短い確認の問いかけ（1行）で締める。',
      '4. **構成をすっきり整理する**: 「結論（一言）→ 見える化（図・表・具体例）→ 今の問題へのあてはめ → 次の一歩の問いかけ」の順で簡潔にまとめる。',
      '5. **記法**: 数式は必ず KaTeX 記法（インライン `$...$`、ブロック `$$...$$`）で書く。SVG内の `<text>` には `$` を使わずプレーン文字を書くこと。',
    ].join('\n');

    const contextMessage = [
      `【生徒が今開いている画面の情報】`,
      `- ステップID: ${stepId}${variantNumber > 0 ? `（類題 #${variantNumber}）` : '（通常問題）'}`,
      `- ステージ / 単元: ${stage} / ${category || ''}`,
      `- タイトル: ${stepTitle}`,
      ``,
      `【画面の解説】`,
      explanation,
      ``,
      `【画面に表示されている問題一覧】`,
      problemContext,
    ].join('\n');

    const validHistory = Array.isArray(history)
      ? history
          .slice(-6)
          .filter((msg) => msg && typeof msg.text === 'string' && msg.text.trim())
          .map((msg) => ({
            role: msg.role === 'student' ? 'user' : 'model',
            parts: [{ text: msg.text }],
          }))
      : [];

    const contents = [
      { role: 'user', parts: [{ text: contextMessage }] },
      {
        role: 'model',
        parts: [
          {
            text: '承知しました。今開いているステップの解説と各番号の問題を把握しました。生徒の質問にわかりやすく答えます。',
          },
        ],
      },
      ...validHistory,
      { role: 'user', parts: [{ text: question }] },
    ];

    const result = await callGeminiRobust(apiKey, {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 2048,
      },
    });

    if (!result.ok) {
      console.error('[ask-gemini] All candidates failed:', result.attemptLog, result.errorText?.slice(0, 200));
      const friendlyMsg = result.hadAuthError
        ? 'AI先生のAPIキー設定に問題があります。先生または管理者へお知らせください。'
        : result.hadBusy || result.status === 503 || result.status === 429
        ? 'ただいまAI先生が大変混み合っています。5〜10秒ほど待ってから「もう一度送信」を押してください。'
        : `AI先生との通信に失敗しました（エラー ${result.status}）。少し時間を置いて再度お試しください。`;
      return res
        .status(result.hadBusy || result.status === 503 || result.status === 429 ? 503 : 502)
        .json({ error: friendlyMsg });
    }

    const answer =
      extractGeminiText(result.data) ||
      '回答を生成できませんでした。もう一度質問してみてください。';

    return res.status(200).json({ answer, model: result.model });
  } catch (err) {
    return res.status(500).json({
      error: err instanceof Error ? err.message : 'Internal Server Error',
    });
  }
}
