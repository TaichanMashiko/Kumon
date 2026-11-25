---
id: M3-INT-011b
title: 【補助ステップ】dx と dt の書き換え集中トレーニング
stage: 高校3年
category: 数学Ⅲ / 積分法
order: 11.5
prerequisites:
  - M3-INT-011
stats:
  total_attempts: 0
  pass_rate_avg: 0
  clarity_score: 5
  confused_notes: []
version: 1
last_updated: "2026-11-25"
---

# 📖 解説（補助スモールステップ）

> 本ステップは、次のステップ **M3-INT-012「置換積分法の基本」** の平均正答率が 70% を下回ったため、落差を埋めるために定期パッチで自動挿入されました。

置換積分で最もつまずきやすいのは、**積分計算そのものではなく「$dx$ を $dt$ に書き換える瞬間」**です。
このステップでは積分を実行せず、**「$t$ と置いて $dt = g'(x)\,dx$ を作る」練習だけ**に集中しましょう。

### 3秒ルール（書き換えテンプレート）
1. $t = g(x)$ と書く
2. 右辺を $x$ で微分して $\dfrac{dt}{dx} = g'(x)$ と書く
3. 両辺に $dx$ を掛けて **$dt = g'(x)\,dx$** にする（係数が邪魔なら割る）

$$ t = x^2 + 1 \implies \frac{dt}{dx} = 2x \implies dt = 2x\,dx \quad \left(\text{また } x\,dx = \frac{1}{2}\,dt\right) $$

<svg width="420" height="105" viewBox="0 0 420 105" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="dxからdt書き換えの3ステップ">
  <rect x="12" y="22" width="114" height="60" rx="8" fill="#f0f9ff" stroke="#0284c7" stroke-width="2" />
  <text x="69" y="47" text-anchor="middle" font-size="12" font-weight="700" fill="#0369a1">① 置く</text>
  <text x="69" y="68" text-anchor="middle" font-size="12" fill="#0f172a">t = x² + 1</text>
  <path d="M 130 52 L 150 52" stroke="#64748b" stroke-width="2" marker-end="url(#arrAux)" />
  <rect x="154" y="22" width="114" height="60" rx="8" fill="#fefce8" stroke="#ca8a04" stroke-width="2" />
  <text x="211" y="47" text-anchor="middle" font-size="12" font-weight="700" fill="#854d0e">② 微分する</text>
  <text x="211" y="68" text-anchor="middle" font-size="12" fill="#0f172a">dt/dx = 2x</text>
  <path d="M 272 52 L 292 52" stroke="#64748b" stroke-width="2" marker-end="url(#arrAux)" />
  <rect x="296" y="22" width="112" height="60" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" />
  <text x="352" y="47" text-anchor="middle" font-size="12" font-weight="700" fill="#166534">③ 書き換え</text>
  <text x="352" y="68" text-anchor="middle" font-size="12" fill="#0f172a">dt = 2x dx</text>
  <defs>
    <marker id="arrAux" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
    </marker>
  </defs>
</svg>

# ✍️ 練習問題

次の置換について、ノートに **$dt = \dots \, dx$** および **$dx = \dots \, dt$** の形を書き出しましょう。

1. $t = 3x + 2$
2. $t = x^2 + 5$
3. $t = x^3 - 1$
4. $t = \sin x$

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

1. $dt = 3\,dx$、$dx = \dfrac{1}{3}\,dt$
2. $dt = 2x\,dx$、$x\,dx = \dfrac{1}{2}\,dt$
3. $dt = 3x^2\,dx$、$x^2\,dx = \dfrac{1}{3}\,dt$
4. $dt = \cos x\,dx$

</details>
