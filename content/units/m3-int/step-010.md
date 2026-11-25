---
id: M3-INT-010
title: 不定積分の基本公式とべき乗の確認
stage: 高校3年
category: 数学Ⅲ / 積分法
order: 10
prerequisites: []
stats:
  total_attempts: 47
  pass_rate_avg: 91.6
  clarity_score: 4.6
  confused_notes: []
version: 1
last_updated: "2026-11-25"
---

# 📖 解説

置換積分法に入る前に、すべての積分の土台となる**べき乗の不定積分**と**基本公式**を確認しましょう。

実数 $\alpha \neq -1$ に対して、次が成り立ちます。

$$ \int x^\alpha \, dx = \frac{1}{\alpha + 1} x^{\alpha + 1} + C \quad (C\text{は積分定数}) $$

また、$\alpha = -1$ のとき（つまり $\frac{1}{x}$ の積分）は対数関数になります。

$$ \int \frac{1}{x} \, dx = \log |x| + C $$

<svg width="420" height="120" viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="微分と積分の逆演算イメージ">
  <rect x="16" y="34" width="125" height="52" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
  <text x="78" y="65" text-anchor="middle" font-size="14" font-weight="700" fill="#1e3a8a">元の関数 F(x)</text>
  <rect x="279" y="34" width="125" height="52" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2" />
  <text x="341" y="65" text-anchor="middle" font-size="14" font-weight="700" fill="#14532d">導関数 f(x)</text>
  <path d="M 148 48 Q 210 14 270 48" fill="none" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arrowBlue)" />
  <text x="210" y="24" text-anchor="middle" font-size="12" font-weight="600" fill="#1d4ed8">微分 d/dx</text>
  <path d="M 270 74 Q 210 108 148 74" fill="none" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arrowGreen)" />
  <text x="210" y="106" text-anchor="middle" font-size="12" font-weight="600" fill="#15803d">積分 ∫ ... dx (+ C)</text>
  <defs>
    <marker id="arrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
    </marker>
    <marker id="arrowGreen" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#16a34a" />
    </marker>
  </defs>
</svg>

### 確認ポイント
- 根号 $\sqrt{x}$ は $x^{\frac{1}{2}}$、$\frac{1}{x^2}$ は $x^{-2}$ のように**指数形式**に直してから公式を適用します。
- 計算が終わったら、答えを**暗算で微分して元の式に戻るか検算**する習慣をつけましょう。

# ✍️ 練習問題

手元のノートに鉛筆で解いてみましょう。（$C$ は積分定数とします）

1. $\displaystyle \int (3x^2 - 4x + 5) \, dx$
2. $\displaystyle \int \sqrt{x} \, dx$
3. $\displaystyle \int \frac{1}{x^3} \, dx$
4. $\displaystyle \int \left( \frac{2}{x} + e^x \right) dx$

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

1. $x^3 - 2x^2 + 5x + C$
2. $\displaystyle \int x^{\frac{1}{2}} \, dx = \frac{1}{\frac{1}{2}+1} x^{\frac{3}{2}} + C = \frac{2}{3} x\sqrt{x} + C$
3. $\displaystyle \int x^{-3} \, dx = \frac{1}{-3+1} x^{-2} + C = -\frac{1}{2x^2} + C$
4. $2\log|x| + e^x + C$

</details>
