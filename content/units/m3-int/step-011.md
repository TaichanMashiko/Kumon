---
id: M3-INT-011
title: 合成関数の微分と置換のアイデア
stage: 高校3年
category: 数学Ⅲ / 積分法
order: 11
prerequisites:
  - M3-INT-010
stats:
  total_attempts: 42
  pass_rate_avg: 84.3
  clarity_score: 4.2
  confused_notes:
    - 内側の微分を掛け忘れることがある
version: 1
last_updated: "2026-11-25"
---

# 📖 解説

置換積分法は、**合成関数の微分（連鎖律）を逆向きにたどる操作**です。
まず、合成関数 $F(g(x))$ を $x$ で微分するとどうなるか復習しましょう。

$$ \frac{d}{dx} \bigl\{ F(g(x)) \bigr\} = F'(g(x)) \cdot g'(x) $$

ここで $F'(t) = f(t)$ とすると、右辺は $f(g(x))g'(x)$ になります。
したがって、両辺を $x$ で積分すれば次の関係が見えてきます。

$$ \int f(g(x)) g'(x) \, dx = F(g(x)) + C $$

<svg width="440" height="125" viewBox="0 0 440 125" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="合成関数の構造と塊の置き換え">
  <rect x="14" y="20" width="180" height="84" rx="10" fill="#fefce8" stroke="#ca8a04" stroke-width="2" />
  <text x="104" y="45" text-anchor="middle" font-size="13" font-weight="700" fill="#854d0e">塊を見つける</text>
  <text x="104" y="70" text-anchor="middle" font-size="14" fill="#1e293b">f( g(x) ) · g'(x)</text>
  <text x="104" y="92" text-anchor="middle" font-size="11" fill="#a16207">内側の塊 g(x) とその微分 g'(x)</text>
  <path d="M 200 62 L 246 62" stroke="#475569" stroke-width="2.5" marker-end="url(#arrowGray)" />
  <text x="223" y="52" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">t = g(x)</text>
  <rect x="254" y="20" width="172" height="84" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
  <text x="340" y="45" text-anchor="middle" font-size="13" font-weight="700" fill="#1e3a8a">シンプルな積分へ</text>
  <text x="340" y="72" text-anchor="middle" font-size="15" font-weight="700" fill="#1d4ed8">∫ f(t) dt</text>
  <text x="340" y="93" text-anchor="middle" font-size="11" fill="#1e40af">基本公式がそのまま使える</text>
  <defs>
    <marker id="arrowGray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
    </marker>
  </defs>
</svg>

### 例題で確認
$(x^2 + 1)^4$ を微分すると、
$$ \frac{d}{dx}(x^2 + 1)^4 = 4(x^2 + 1)^3 \cdot (x^2 + 1)' = 4(x^2 + 1)^3 \cdot 2x = 8x(x^2 + 1)^3 $$
このように、**「塊 $g(x)$」**と**「その微分 $g'(x)$」**がペアで式の中に現れるのが特徴です。

# ✍️ 練習問題

まずは「塊 $g(x)$」とその微分 $g'(x)$ を見抜く練習をノートで行いましょう。

1. 次の関数を $x$ で微分せよ。
   (1) $(2x + 3)^5$
   (2) $(x^2 + 1)^4$
   (3) $\sin(x^3)$
2. 次の積分において、$t = g(x)$ と置くべき「塊 $g(x)$」と、その導関数 $g'(x)$ をそれぞれ書き出せ。（積分の計算はまだ不要です）
   (1) $\displaystyle \int 2x (x^2 + 5)^3 \, dx$
   (2) $\displaystyle \int \frac{3x^2}{x^3 + 1} \, dx$

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

1.
   (1) $5(2x + 3)^4 \cdot 2 = 10(2x + 3)^4$
   (2) $4(x^2 + 1)^3 \cdot 2x = 8x(x^2 + 1)^3$
   (3) $\cos(x^3) \cdot 3x^2 = 3x^2 \cos(x^3)$
2.
   (1) $g(x) = x^2 + 5$、$g'(x) = 2x$
   (2) $g(x) = x^3 + 1$、$g'(x) = 3x^2$

</details>
