---
id: M3-INT-013
title: 根号を含む関数の置換積分
stage: 高校3年
category: 数学Ⅲ / 積分法
order: 13
prerequisites:
  - M3-INT-012
stats:
  total_attempts: 27
  pass_rate_avg: 74.3
  clarity_score: 3.7
  confused_notes: []
version: 1
last_updated: "2026-11-25"
---

# 📖 解説

$\displaystyle \int x\sqrt{x + 1} \, dx$ のように、根号（ルート）の中身が1次式の積分では、**根号ごと（または根号の中身）を $t$ と置く**と見通しがよくなります。

### 方針: $t = \sqrt{x + 1}$ と置く方法
1. $t = \sqrt{x + 1}$ と置くと、両辺を2乗して $t^2 = x + 1$、よって $x = t^2 - 1$。
2. 両辺を $t$ で微分すると $\frac{dx}{dt} = 2t$、すなわち $dx = 2t \, dt$。
3. 元の式にすべて代入すると、根号が消えて多項式の積分になります。

$$ \int x\sqrt{x + 1} \, dx = \int (t^2 - 1) \cdot t \cdot 2t \, dt = \int (2t^4 - 2t^2) \, dt $$

<svg width="420" height="110" viewBox="0 0 420 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="根号の置換イメージ">
  <rect x="18" y="25" width="160" height="60" rx="8" fill="#fdf2f8" stroke="#db2777" stroke-width="2" />
  <text x="98" y="50" text-anchor="middle" font-size="13" font-weight="700" fill="#9d174d">根号つきの式</text>
  <text x="98" y="72" text-anchor="middle" font-size="13" fill="#1e293b">x · √(x + 1) dx</text>
  <path d="M 184 55 L 234 55" stroke="#475569" stroke-width="2.2" marker-end="url(#arr13)" />
  <text x="209" y="45" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">t = √(x+1)</text>
  <rect x="242" y="25" width="160" height="60" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" />
  <text x="322" y="50" text-anchor="middle" font-size="13" font-weight="700" fill="#166534">多項式の積分</text>
  <text x="322" y="72" text-anchor="middle" font-size="13" fill="#1e293b">(2t⁴ - 2t²) dt</text>
  <defs>
    <marker id="arr13" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
    </marker>
  </defs>
</svg>

# ✍️ 練習問題

手元のノートに鉛筆で解いてみましょう。（$C$ は積分定数とします）

1. $\displaystyle \int x\sqrt{x + 1} \, dx$
2. $\displaystyle \int x\sqrt{2x - 1} \, dx$
3. $\displaystyle \int \frac{x}{\sqrt{x + 2}} \, dx$

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

1. $t = \sqrt{x + 1}$ と置くと $x = t^2 - 1$, $dx = 2t \, dt$。
   $$\int (2t^4 - 2t^2) \, dt = \frac{2}{5}t^5 - \frac{2}{3}t^3 + C = \frac{2}{15}(x + 1)\sqrt{x + 1}(3x - 2) + C$$
2. $t = \sqrt{2x - 1}$ と置くと $x = \frac{t^2 + 1}{2}$, $dx = t \, dt$。
   $$\int \frac{t^2 + 1}{2} \cdot t \cdot t \, dt = \frac{1}{10}t^5 + \frac{1}{6}t^3 + C = \frac{1}{15}(2x - 1)\sqrt{2x - 1}(3x + 1) + C$$
3. $t = \sqrt{x + 2}$ と置くと $x = t^2 - 2$, $dx = 2t \, dt$。
   $$\int \frac{t^2 - 2}{t} \cdot 2t \, dt = \int (2t^2 - 4) \, dt = \frac{2}{3}t^3 - 4t + C = \frac{2}{3}(x - 4)\sqrt{x + 2} + C$$

</details>
