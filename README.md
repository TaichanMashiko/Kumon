# MathStep — 自律進化型 公文式デジタル数学学習システム

小学生レベルの算数から大学受験（高校数学Ⅲ）まで、ノートに鉛筆でガンガン解き進めることで完全習得（90%以上合格）を目指すデジタル数学学習システムです。

## 主な機能
- **一貫カリキュラム（小学基礎 → 中学数学 → 大学受験・数Ⅲ）**: スモールステップの前提条件グラフで段階解放。
- **アカウントごとの自習モード開放（冬休み等）**: 教員管理画面から生徒単位（または一括）で自習モードをON/OFF可能。ONの生徒は自己採点で90%以上なら自力で次のステップへ進行可能。
- **90%以上マスタリー＆同問題数の類題生成・共有再利用**: 90%未満または再挑戦時は、同じ問題数の類題セットを自動出題。Gemini APIで生成した類題は共有プールに保存され、別生徒からはAPIコストゼロで再利用。
- **AI先生に質問（Gemini API）**: Vercel Serverless Function (`/api/ask-gemini`) 経由で、答えを丸投げせずヒントとKaTeX数式で指導。質問は自動で躓きメモにも蓄積。
- **週末定期パッチ (`scripts/patch-curriculum.mjs`)**: 学習ログJSONから解説の自動リライト・補助ステップ挿入を実行。

## GitHub & Vercel デプロイ手順
1. 本リポジトリを GitHub にプッシュします。
2. Vercel ダッシュボードで「Add New Project」から該当リポジトリをインポートします（Framework Preset: `Vite` が自動認識されます）。
3. **Settings → Environment Variables** に以下を追加して Deploy します：
   - `GEMINI_API_KEY`（必須：AI先生質問・新規類題生成用）
   - `GEMINI_MODEL`（任意：デフォルト `gemini-2.5-flash`）
   - `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`（任意：生成した類題を別端末の生徒間でも永続共有したい場合に設定）
