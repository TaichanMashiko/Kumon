# Antigravity 定期パッチ実行レポート

- 実行日: 2026-11-25
- 入力ログ: `logs\feedback-sample.json`
- モード: 本番適用

## 変更サマリー

- **[解説リライト]** `M3-INT-012` (置換積分法の基本): clarity_score=2.8, confused_notes=2件 -> 補足Q&A・途中計算KaTeX・SVG図解を追記し **v2** へ更新。
- **[ステップ細分化]** `M3-INT-012` (pass_rate_avg=62.3% < 70%) -> 補助ステップ `M3-INT-011b` (`content/units/m3-int/step-011b.md`) を新規生成し、`curriculum-map.json` の前提条件を自動接続。
