---
id: M3-INT-012
title: 置換積分法の基本
stage: 高校3年
category: 数学Ⅲ / 積分法
order: 12
prerequisites:
  - M3-INT-011b
stats:
  total_attempts: 41
  pass_rate_avg: 62.3
  clarity_score: 2.8
  confused_notes:
    - tに置いた後のdxからdtへの変換が分からない
    - 2xが式の外にないときどう変形すればいいか迷った
version: 2
last_updated: "2026-11-25"
---

# 📖 解説

関数 $f(g(x))g'(x)$ の積分では、$t = g(x)$ と置くことで次のように計算できます。

$$ \int f(g(x))g'(x) \, dx = \int f(t) \, dt $$

<svg width="420" height="120" viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="置換積分法の変数変換フロー">
  <rect x="12" y="28" width="118" height="62" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2" />
  <text x="71" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#1e3a8a">Step 1: 置換</text>
  <text x="71" y="75" text-anchor="middle" font-size="12" fill="#1e40af">t = g(x)</text>
  <path d="M 134 59 L 154 59" stroke="#64748b" stroke-width="2" marker-end="url(#arr12)" />
  <rect x="158" y="28" width="118" height="62" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="2" />
  <text x="217" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#92400e">Step 2: 微分</text>
  <text x="217" y="75" text-anchor="middle" font-size="12" fill="#92400e">dt = g'(x) dx</text>
  <path d="M 280 59 L 300 59" stroke="#64748b" stroke-width="2" marker-end="url(#arr12)" />
  <rect x="304" y="28" width="104" height="62" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2" />
  <text x="356" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#166534">Step 3: 積分</text>
  <text x="356" y="75" text-anchor="middle" font-size="12" fill="#166534">t を x に戻す</text>
  <defs>
    <marker id="arr12" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
    </marker>
  </defs>
</svg>

### 基本手順
1. 塊を $t = g(x)$ と置く。
2. 両辺を微分して $\frac{dt}{dx} = g'(x)$、すなわち $dt = g'(x) \, dx$ を作る。
3. $t$ の積分を実行し、最後に $t$ を元の $x$ の式に戻す。

<!-- ANTIGRAVITY-PATCH-START:v2 -->
## 🔍 よくあるつまずき補足（定期パッチ自動改訂 v2）

生徒の学習ログ（解説スコア: **2.8**、躓きメモ: **2件**）をもとに、途中計算と変換イメージを補強しました。

#### Q1. 「tに置いた後のdxからdtへの変換が分からない」
- **ポイント**: $t = g(x)$ を $x$ で微分した式 $\dfrac{dt}{dx} = g'(x)$ は、置換積分では分数のように扱って **$dt = g'(x)\,dx$**（または $dx = \dfrac{1}{g'(x)}\,dt$）と書き換えてOKです。
- **途中計算の例**: $t = x^2 + 1$ なら $\dfrac{dt}{dx} = 2x$ なので、両辺に $dx$ を掛けるイメージで $dt = 2x\,dx$ となります。

#### Q2. 「2xが式の外にないときどう変形すればいいか迷った」
- **ポイント**: 係数が足りないときは、定数倍で調整します。たとえば $\displaystyle \int x(x^2+1)^3\,dx$ で $2x$ が欲しいときは、$dt = 2x\,dx \iff x\,dx = \dfrac{1}{2}\,dt$ として $\dfrac{1}{2}$ を積分の外に出します。

### 途中計算のフル展開（$\displaystyle \int 2x(x^2 + 1)^3 \, dx$）
$$
\begin{aligned}
t &= x^2 + 1 \quad \text{と置くと} \\
\frac{dt}{dx} &= 2x \implies dt = 2x \, dx \\
\int (x^2 + 1)^3 \cdot \underbrace{2x \, dx}_{dt} &= \int t^3 \, dt = \frac{1}{4}t^4 + C = \frac{1}{4}(x^2 + 1)^4 + C
\end{aligned}
$$

<svg width="440" height="130" viewBox="0 0 440 130" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="dxからdtへの変換とペアの対応図">
  <rect x="14" y="18" width="185" height="94" rx="10" fill="#fff7ed" stroke="#ea580c" stroke-width="2" />
  <text x="106" y="42" text-anchor="middle" font-size="12" font-weight="700" fill="#9a3412">元の x の積分</text>
  <text x="106" y="68" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">∫ (x²+1)³ · (2x dx)</text>
  <text x="106" y="94" text-anchor="middle" font-size="11" fill="#c2410c">塊 t と 微分ペア 2x dx</text>
  <path d="M 206 65 L 246 65" stroke="#ea580c" stroke-width="2.5" marker-end="url(#arrPatch)" />
  <text x="226" y="53" text-anchor="middle" font-size="11" font-weight="700" fill="#9a3412">変換</text>
  <rect x="254" y="18" width="172" height="94" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="2" />
  <text x="340" y="42" text-anchor="middle" font-size="12" font-weight="700" fill="#1e3a8a">t だけの積分</text>
  <text x="340" y="68" text-anchor="middle" font-size="15" font-weight="700" fill="#1d4ed8">∫ t³ dt</text>
  <text x="340" y="94" text-anchor="middle" font-size="11" fill="#1e40af">2x dx が丸ごと dt に変化</text>
  <defs>
    <marker id="arrPatch" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
    </marker>
  </defs>
</svg>
<!-- ANTIGRAVITY-PATCH-END -->

# ✍️ 練習問題

手元のノートに解いてみましょう。（$C$ は積分定数とします）

1. $\displaystyle \int 2x(x^2 + 1)^3 \, dx$
2. $\displaystyle \int 3x^2(x^3 - 2)^4 \, dx$
3. $\displaystyle \int \frac{2x}{x^2 + 3} \, dx$
4. $\displaystyle \int \sin^2 x \cos x \, dx$

---

# 💡 解答（自己採点用）

<details>
<summary>解き終わったらここを押して答え合わせ</summary>

1. $t = x^2 + 1$ と置くと $dt = 2x \, dx$ より、
   $$\int t^3 \, dt = \frac{1}{4}t^4 + C = \frac{1}{4}(x^2 + 1)^4 + C$$
2. $t = x^3 - 2$ と置くと $dt = 3x^2 \, dx$ より、
   $$\int t^4 \, dt = \frac{1}{5}t^5 + C = \frac{1}{5}(x^3 - 2)^5 + C$$
3. $t = x^2 + 3$ と置くと $dt = 2x \, dx$ より、
   $$\int \frac{1}{t} \, dt = \log|t| + C = \log(x^2 + 3) + C \quad (\text{※ } x^2 + 3 > 0)$$
4. $t = \sin x$ と置くと $dt = \cos x \, dx$ より、
   $$\int t^2 \, dt = \frac{1}{3}t^3 + C = \frac{1}{3}\sin^3 x + C$$

</details>
