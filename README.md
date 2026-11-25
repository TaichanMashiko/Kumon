# MathStep — 自律進化型 公文式デジタル数学学習システム

小学生レベルの算数から大学受験（高校数学Ⅲ）まで、ノートに鉛筆でガンガン解き進めることで完全習得（90%以上合格）を目指すデジタル数学学習システムです。

## 主な機能
- **Firebase Auth + Cloud Firestore リアルタイム同期**: 学校の Google アカウントでログインし、進度・自習モード・共有類題バンクを全端末で同期。
- **一貫カリキュラム（小学基礎 → 中学数学 → 大学受験・数Ⅲ）**: スモールステップの前提条件グラフで段階解放。
- **アカウントごとの自習モード開放（冬休み等）**: 教員管理画面から生徒単位（または一括）で自習モードをON/OFF可能。ONの生徒は自己採点で90%以上なら自力で次のステップへ進行可能。
- **90%以上マスタリー＆同問題数の類題生成・全生徒共有再利用**: 90%未満または再挑戦時は同問題数の類題を自動出題。Gemini API で生成した類題は Firestore の `shared_variants` に保存され、別生徒からは API コストゼロで即再利用。
- **AI先生に質問（Gemini API）**: Vercel Serverless Function (`/api/ask-gemini`) 経由でヒントと KaTeX 数式で指導。質問は自動で躓きメモにも蓄積。

## Firebase + Vercel デプロイ手順
1. **Firebase Console** でプロジェクトを作成し、以下を有効化：
   - **Authentication → Sign-in method → Google** を有効化（承認済みドメインに Vercel のドメイン `*.vercel.app` を追加）
   - **Firestore Database** を作成し、リポジトリ内の `firestore.rules` をルールに設定
2. **Vercel → Settings → Environment Variables** に以下を設定：
   - `GEMINI_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_TEACHER_EMAILS`（例: `tmashiko@kiryo.ac.jp`）
3. Redeploy すれば、Firebase Auth + Cloud Firestore モードで稼働します（未設定時はデモモードで動作）。
