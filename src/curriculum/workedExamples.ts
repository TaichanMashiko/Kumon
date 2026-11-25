import type { MicroStepSpec } from './mathEngine';

export interface WorkedExample {
  problem: string;
  steps: string[];
  answer: string;
}

/**
 * 各ステップのテンプレートに応じた「そのレベルと同じ例題＋途中式つきの詳しい解き方」を返す
 */
export function getWorkedExampleForSpec(spec: MicroStepSpec): WorkedExample {
  const params = spec.params ?? {};

  switch (spec.template) {
    // ================= 小学校 =================
    case 'add': {
      if (params.carry === 'yes' && (params.aMax as number) <= 9) {
        return {
          problem: '$8 + 5$',
          steps: [
            '$8$ はあと $2$ で $10$ になるので、$5$ を **$2$ と $3$** に分けます（さくらんぼ計算）。',
            'まず $10$ のまとまりをつくります：$8 + 2 = 10$',
            '残りの $3$ をたします：$10 + 3 = 13$',
          ],
          answer: '$13$',
        };
      }
      if ((params.aMin as number) >= 10) {
        return {
          problem: '$47 + 36$',
          steps: [
            '一の位と十の位をたてにそろえて書きます。',
            '一の位を計算します：$7 + 6 = 13$（一の位に $3$、十の位に $1$ くり上げ）。',
            '十の位を計算します：$4 + 3 + 1 = 8$',
          ],
          answer: '$83$',
        };
      }
      return {
        problem: '$3 + 2$',
        steps: [
          '$3$ に $2$ をあわせます。',
          '$3$ から $1$ つずつ数えると「$4, \\ 5$」になります。',
        ],
        answer: '$5$',
      };
    }

    case 'sub': {
      if (params.borrow === 'yes' && (params.aMax as number) <= 18) {
        return {
          problem: '$13 - 5$',
          steps: [
            '$13$ を **$10$ と $3$** に分けます。',
            'まず $10$ から $5$ をひきます：$10 - 5 = 5$',
            '残っていた $3$ をたします：$5 + 3 = 8$',
          ],
          answer: '$8$',
        };
      }
      if ((params.aMin as number) >= 20) {
        return {
          problem: '$52 - 27$',
          steps: [
            '一の位の $2 - 7$ はひけないので、十の位の $5$ から $1$ くり下げて $4$ にします。',
            '一の位を計算します：$12 - 7 = 5$',
            '十の位を計算します：$4 - 2 = 2$',
          ],
          answer: '$25$',
        };
      }
      return {
        problem: '$7 - 3$',
        steps: [
          '$7$ から $3$ つ戻って数えると「$6, \\ 5, \\ 4$」になります。',
          'たし算で確かめます：$4 + 3 = 7$',
        ],
        answer: '$4$',
      };
    }

    case 'add3':
      return {
        problem: '$4 + 3 + 6$',
        steps: [
          'たして $10$ になる組を先に見つけます：$4 + 6 = 10$',
          '残りの $3$ をたします：$10 + 3 = 13$',
        ],
        answer: '$13$',
      };

    case 'mul': {
      if ((params.aMin as number) >= 10 && (params.bMin as number) >= 10) {
        return {
          problem: '$23 \\times 14$',
          steps: [
            '一の位をかけます：$23 \\times 4 = 92$',
            '十の位をかけます：$23 \\times 10 = 230$',
            '2つの答えをたし合わせます：$92 + 230 = 322$',
          ],
          answer: '$322$',
        };
      }
      if ((params.aMin as number) >= 10) {
        return {
          problem: '$24 \\times 3$',
          steps: [
            '一の位をかけます：$4 \\times 3 = 12$（一の位に $2$、十の位に $1$ くり上げ）。',
            '十の位をかけてくり上がりをたします：$2 \\times 3 + 1 = 7$',
          ],
          answer: '$72$',
        };
      }
      const d = (params.fixed as number) || 6;
      return {
        problem: `$${d} \\times 4$`,
        steps: [
          `$${d}$ が $4$ 個分あるという意味です：$${d} + ${d} + ${d} + ${d}$`,
          `${d}の段で唱えて求めます：$${d} \\times 4 = ${d * 4}$`,
        ],
        answer: `$${d * 4}$`,
      };
    }

    case 'mul_blank':
      return {
        problem: '$6 \\times \\square = 42$',
        steps: [
          '$6$ の段で答えが $42$ になるかけ算を探します。',
          '$6 \\times 7 = 42$ なので、$\\square$ に入る数は $7$ です。',
        ],
        answer: '$\\square = 7$',
      };

    case 'div_exact':
      return {
        problem: '$72 \\div 3$',
        steps: [
          '十の位：$7 \\div 3 = 2$ あまり $1$（商の十の位に $2$ をたてる）。',
          '一の位の $2$ をおろして $12$ にします。',
          '$12 \\div 3 = 4$（商の一の位に $4$ をたてる）。検算：$3 \\times 24 = 72$',
        ],
        answer: '$24$',
      };

    case 'div_rem':
      return {
        problem: '$23 \\div 4$',
        steps: [
          '$4$ の段で $23$ をこえない一番大きい積を探します：$4 \\times 5 = 20$',
          'ひき算であまりを求めます：$23 - 20 = 3$（あまり $3$ はわる数 $4$ より小さいのでOK）。',
          '検算：$4 \\times 5 + 3 = 23$',
        ],
        answer: '$5$ あまり $3$',
      };

    case 'dec_add_sub':
      return {
        problem: '$2.45 + 1.3$',
        steps: [
          '小数点をたてにそろえ、$1.3$ を $1.30$ と見ます。',
          '右の位からたします：$5+0=5, \\ 4+3=7, \\ 2+1=3$',
          '同じ位置に小数点を打ちます。',
        ],
        answer: '$3.75$',
      };

    case 'dec_mul':
      return {
        problem: '$1.4 \\times 0.3$',
        steps: [
          '小数点を外して整数どうしをかけます：$14 \\times 3 = 42$',
          '小数点以下のけた数を合計します：$1\\text{けた} + 1\\text{けた} = 2\\text{けた}$',
          '答えの右から $2$ けた左へ小数点を打ちます。',
        ],
        answer: '$0.42$',
      };

    case 'dec_div':
      return {
        problem: '$4.2 \\div 0.6$',
        steps: [
          'わる数 $0.6$ を整数にするため、両方を $10$ 倍します：$42 \\div 6$',
          '整数のわり算を計算します：$42 \\div 6 = 7$',
        ],
        answer: '$7$',
      };

    case 'gcd_lcm':
      return {
        problem: '$12$ と $18$ の最大公約数・最小公倍数',
        steps: [
          '両方を共通して割れる数で割ります：$2$ で割ると $(6, 9)$、さらに $3$ で割ると $(2, 3)$。',
          '最大公約数は左の積：$2 \\times 3 = 6$',
          '最小公倍数はL字の積：$2 \\times 3 \\times 2 \\times 3 = 36$',
        ],
        answer: '最大公約数 $6$、最小公倍数 $36$',
      };

    case 'frac_reduce':
      return {
        problem: '$\\displaystyle \\frac{12}{18}$ を約分せよ。',
        steps: [
          '$12$ と $18$ の最大公約数は $6$ です。',
          '分母と分子をどちらも $6$ で割ります：$\\displaystyle \\frac{12 \\div 6}{18 \\div 6} = \\frac{2}{3}$',
        ],
        answer: '$\\displaystyle \\frac{2}{3}$',
      };

    case 'frac_add_sub':
      return {
        problem: '$\\displaystyle \\frac{1}{4} + \\frac{5}{6}$',
        steps: [
          '分母 $4$ と $6$ の最小公倍数 $12$ で通分します：$\\displaystyle \\frac{3}{12} + \\frac{10}{12}$',
          '分子どうしをたします：$\\displaystyle \\frac{3 + 10}{12} = \\frac{13}{12}$',
          '約分できないか確認して完了です。',
        ],
        answer: '$\\displaystyle \\frac{13}{12}$',
      };

    case 'frac_mul_div':
      return {
        problem: '$\\displaystyle \\frac{3}{4} \\div \\frac{9}{8}$',
        steps: [
          'わる分数の逆数（$\\frac{8}{9}$）をかける式に直します：$\\displaystyle \\frac{3}{4} \\times \\frac{8}{9}$',
          'かける前にナナメで約分します：$3$ と $9$ を $3$ で割り、$4$ と $8$ を $4$ で割ると $\\displaystyle \\frac{1}{1} \\times \\frac{2}{3}$',
          '分母どうし・分子どうしをかけます。',
        ],
        answer: '$\\displaystyle \\frac{2}{3}$',
      };

    case 'percent_ratio':
      return {
        problem: '$800$ の $25\\%$ を求めよ。',
        steps: [
          '$25\\%$ を分数（または小数）に直します：$25\\% = \\frac{25}{100} = 0.25$',
          'もとにする量にかけます：$800 \\times 0.25 = 200$',
        ],
        answer: '$200$',
      };

    case 'geom_area':
      return {
        problem: '底辺 $8\\text{ cm}$、高さ $5\\text{ cm}$ の三角形の面積',
        steps: [
          '三角形の面積の公式：$\\text{底辺} \\times \\text{高さ} \\div 2$',
          '数値を代入します：$8 \\times 5 \\div 2 = 40 \\div 2 = 20$',
        ],
        answer: '$20\\text{ cm}^2$',
      };

    // ================= 中学校 =================
    case 'signed_add_sub':
      return {
        problem: '$(-7) - (-4)$',
        steps: [
          'ひき算を「符号を変えてたし算」に直します：$(-7) + (+4)$',
          '異符号のたし算なので、絶対値が大きい $-$ の符号をつけ、差 $7 - 4 = 3$ を求めます。',
        ],
        answer: '$-3$',
      };

    case 'signed_mul_div':
      return {
        problem: '$(-6) \\times (-4)$',
        steps: [
          '符号を先に決めます：マイナス $\\times$ マイナス $=$ プラス（$+$）。',
          '絶対値どうしをかけます：$6 \\times 4 = 24$',
        ],
        answer: '$24$',
      };

    case 'linear_expr':
      return {
        problem: '$(3x - 5) - (x - 2)$',
        steps: [
          '後ろのかっこを外すとき、各項の符号を逆転させます：$3x - 5 - x + 2$',
          '同類項どうしをまとめます：$(3 - 1)x + (-5 + 2) = 2x - 3$',
        ],
        answer: '$2x - 3$',
      };

    case 'linear_eq':
      return {
        problem: '$5x - 4 = 2x + 8$',
        steps: [
          '文字の項を左辺、数の項を右辺へ移項します（符号を逆にする）：$5x - 2x = 8 + 4$',
          '両辺を整理します：$3x = 12$',
          '両辺を $3$ で割ります：$x = 4$',
        ],
        answer: '$x = 4$',
      };

    case 'simultaneous_eq':
      return {
        problem: '$\\begin{cases} 2x + y = 7 \\\\ x - y = 2 \\end{cases}$',
        steps: [
          '$y$ の係数が $+1$ と $-1$ なので、2つの式をそのまま足して $y$ を消去します：$3x = 9 \\implies x = 3$',
          '$x = 3$ を2つ目の式に代入します：$3 - y = 2 \\implies y = 1$',
        ],
        answer: '$x = 3, \\ y = 1$',
      };

    case 'linear_func':
      return {
        problem: '傾きが $2$ で、点 $(3, 1)$ を通る1次関数の式',
        steps: [
          '傾き $2$ より $y = 2x + b$ とおきます。',
          '$x = 3, \\ y = 1$ を代入します：$1 = 2 \\times 3 + b \\implies 1 = 6 + b \\implies b = -5$',
        ],
        answer: '$y = 2x - 5$',
      };

    case 'expand_poly':
      return {
        problem: '$(x + 3)(x - 5)$',
        steps: [
          '公式 $(x+a)(x+b) = x^2 + (a+b)x + ab$ に $a=3, \\ b=-5$ を当てはめます。',
          '$x$ の係数：$3 + (-5) = -2$、定数項：$3 \\times (-5) = -15$',
        ],
        answer: '$x^2 - 2x - 15$',
      };

    case 'factor_poly': {
      if (params.kind === 'tasuki') {
        return {
          problem: '$2x^2 + 5x + 3$ を因数分解せよ。',
          steps: [
            'かけて $2$ になる組 $(2, 1)$ と、かけて $3$ になる組 $(3, 1)$ をたすき掛けします。',
            '$2 \\times 1 + 1 \\times 3 = 2 + 3 = 5$（真ん中の係数と一致！）。',
            '横に読んで因数にまとめます：$(2x + 3)(x + 1)$',
          ],
          answer: '$(2x + 3)(x + 1)$',
        };
      }
      return {
        problem: '$x^2 - 2x - 15$ を因数分解せよ。',
        steps: [
          'かけて $-15$、たして $-2$ になる2つの数を探します。',
          '$(-5) \\times 3 = -15$ かつ $(-5) + 3 = -2$ より、$-5$ と $+3$ です。',
        ],
        answer: '$(x - 5)(x + 3)$',
      };
    }

    case 'sqrt_calc':
      return {
        problem: '$\\displaystyle \\frac{6}{\\sqrt{3}}$ の分母を有理化せよ。',
        steps: [
          '分母と分子の両方に $\\sqrt{3}$ を掛けます：$\\displaystyle \\frac{6\\sqrt{3}}{\\sqrt{3} \\times \\sqrt{3}} = \\frac{6\\sqrt{3}}{3}$',
          '$6$ と $3$ を約分します：$2\\sqrt{3}$',
        ],
        answer: '$2\\sqrt{3}$',
      };

    case 'quad_eq':
      return {
        problem: '$x^2 - 5x + 6 = 0$',
        steps: [
          '左辺を因数分解します：$(x - 2)(x - 3) = 0$',
          '$x - 2 = 0$ または $x - 3 = 0$ を解きます。',
        ],
        answer: '$x = 2, \\ 3$',
      };

    case 'pythagoras':
      return {
        problem: '直角をはさむ2辺が $3, 4$ の直角三角形の斜辺 $c$',
        steps: [
          '三平方の定理より $c^2 = 3^2 + 4^2 = 9 + 16 = 25$',
          '$c > 0$ なので $c = \\sqrt{25} = 5$',
        ],
        answer: '$5$',
      };

    // ================= 高校・大学入試 =================
    case 'hs1_symmetric':
      return {
        problem: '$x + y = 4, \\ xy = 2$ のとき $x^2 + y^2$ の値',
        steps: [
          '対称式の変形公式を使います：$x^2 + y^2 = (x + y)^2 - 2xy$',
          '$x + y = 4, \\ xy = 2$ を代入します：$4^2 - 2 \\times 2 = 16 - 4 = 12$',
        ],
        answer: '$12$',
      };

    case 'hs1_double_sqrt':
      return {
        problem: '$\\sqrt{7 + 2\\sqrt{10}}$ の二重根号を外せ。',
        steps: [
          'たして $7$、かけて $10$ になる2数を探します $\\implies 5$ と $2$。',
          '$\\sqrt{(5+2) + 2\\sqrt{5 \\times 2}} = \\sqrt{5} + \\sqrt{2}$',
        ],
        answer: '$\\sqrt{5} + \\sqrt{2}$',
      };

    case 'hs1_abs_eq_ineq':
      return {
        problem: '$|2x - 1| < 5$ を解け。',
        steps: [
          '絶対値の性質 $|A| < c \\iff -c < A < c$ を用います：$-5 < 2x - 1 < 5$',
          '各辺に $1$ をたします：$-4 < 2x < 6$',
          '各辺を $2$ で割ります：$-2 < x < 3$',
        ],
        answer: '$-2 < x < 3$',
      };

    case 'hs1_logic_cond':
      return {
        problem: '$x = 2$ は $x^2 = 4$ であるための何条件か。',
        steps: [
          '$x = 2 \\implies x^2 = 4$ は **真**（2の2乗は必ず4）。',
          '逆 $x^2 = 4 \\implies x = 2$ は **偽**（反例：$x = -2$）。',
          '右向きだけ真なので **十分条件（必要条件ではない）** です。',
        ],
        answer: '十分条件（必要条件ではない）',
      };

    case 'hs_complete_sq':
      return {
        problem: '$y = 2x^2 - 8x + 5$ を平方完成して頂点を求めよ。',
        steps: [
          '$x^2$ と $x$ の項を $2$ でくくります：$y = 2(x^2 - 4x) + 5$',
          'かっこの中で $x$ の係数 $-4$ の半分（$-2$）の2乗をたして引きます：$y = 2\\{(x - 2)^2 - 4\\} + 5$',
          '$2$ を分配して定数項をまとめます：$y = 2(x - 2)^2 - 8 + 5 = 2(x - 2)^2 - 3$',
        ],
        answer: '$y = 2(x - 2)^2 - 3$、頂点 $(2, -3)$',
      };

    case 'hs1_qf_maxmin':
      return {
        problem: '$y = x^2 - 4x + 5 \\ (0 \\le x \\le 3)$ の最大値・最小値',
        steps: [
          '平方完成します：$y = (x - 2)^2 + 1$（下に凸、軸 $x = 2$）。',
          '軸 $x = 2$ は定義域 $0 \\le x \\le 3$ の内部にあるため、**$x = 2$ で最小値 $1$**。',
          '軸からより遠い端 $x = 0$ を代入します：$y = 0 - 0 + 5 = 5$（$x=3$ では $y=2$）。',
        ],
        answer: '最大値 $5$ ($x=0$)、最小値 $1$ ($x=2$)',
      };

    case 'hs1_qf_disc':
      return {
        problem: '$x^2 + 4x + k = 0$ が異なる2つの実数解をもつ $k$ の範囲',
        steps: [
          '判別式を計算します：$D = 4^2 - 4 \\cdot 1 \\cdot k = 16 - 4k$',
          '異なる2実数解をもつ条件は $D > 0$：$16 - 4k > 0 \\implies 4k < 16$',
        ],
        answer: '$k < 4$',
      };

    case 'hs_quad_ineq': {
      if (params.isGt) {
        return {
          problem: '$x^2 - 5x + 6 > 0$ を解け。',
          steps: [
            '左辺を因数分解します：$(x - 2)(x - 3) > 0$',
            '下に凸の放物線が $x$ 軸より上にある範囲なので、2解の外側をとります。',
          ],
          answer: '$x < 2, \\ 3 < x$',
        };
      }
      return {
        problem: '$x^2 - 5x + 6 < 0$ を解け。',
        steps: [
          '左辺を因数分解します：$(x - 2)(x - 3) < 0$',
          '下に凸の放物線が $x$ 軸より下にある範囲なので、2解の間をとります。',
        ],
        answer: '$2 < x < 3$',
      };
    }

    case 'hs1_trig_rel': {
      if (params.obtuse) {
        return {
          problem: '$90^\\circ < \\theta < 180^\\circ$ で $\\sin\\theta = \\frac{3}{5}$ のとき $\\cos\\theta, \\tan\\theta$',
          steps: [
            '$\\cos^2\\theta = 1 - \\sin^2\\theta = 1 - \\frac{9}{25} = \\frac{16}{25}$',
            '鈍角（$90^\\circ < \\theta < 180^\\circ$）なので $\\cos\\theta < 0$ より $\\cos\\theta = -\\frac{4}{5}$',
            '$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} = \\frac{3/5}{-4/5} = -\\frac{3}{4}$',
          ],
          answer: '$\\cos\\theta = -\\frac{4}{5}, \\ \\tan\\theta = -\\frac{3}{4}$',
        };
      }
      return {
        problem: '$0^\\circ < \\theta < 90^\\circ$ で $\\sin\\theta = \\frac{3}{5}$ のとき $\\cos\\theta, \\tan\\theta$',
        steps: [
          '$\\cos^2\\theta = 1 - \\sin^2\\theta = 1 - \\frac{9}{25} = \\frac{16}{25}$',
          '鋭角（$0^\\circ < \\theta < 90^\\circ$）なので $\\cos\\theta > 0$ より $\\cos\\theta = \\frac{4}{5}$',
          '$\\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta} = \\frac{3/5}{4/5} = \\frac{3}{4}$',
        ],
        answer: '$\\cos\\theta = \\frac{4}{5}, \\ \\tan\\theta = \\frac{3}{4}$',
      };
    }

    case 'hs1_sine_cosine':
      return {
        problem: '$\\triangle\\mathrm{ABC}$ で $b = 4, \\ c = 5, \\ A = 60^\\circ$ のとき $a^2$ と面積 $S$',
        steps: [
          '余弦定理：$a^2 = 4^2 + 5^2 - 2 \\cdot 4 \\cdot 5 \\cos 60^\\circ = 16 + 25 - 20 = 21$',
          '面積公式：$S = \\frac{1}{2} \\cdot 4 \\cdot 5 \\sin 60^\\circ = 10 \\cdot \\frac{\\sqrt{3}}{2} = 5\\sqrt{3}$',
        ],
        answer: '$a^2 = 21, \\ S = 5\\sqrt{3}$',
      };

    case 'hs2_binomial':
      return {
        problem: '$(2x + 1)^4$ の展開式における $x^2$ の係数',
        steps: [
          '一般項は $_4\\mathrm{C}_k (2x)^k \\cdot 1^{4-k}$ です。',
          '$x^2$ の項は $k = 2$ のとき：$_4\\mathrm{C}_2 \\cdot 2^2 = 6 \\times 4 = 24$',
        ],
        answer: '$24$',
      };

    case 'hs2_vieta':
      return {
        problem: '$x^2 - 3x + 4 = 0$ の2解 $\\alpha, \\beta$ に対し $\\alpha^2 + \\beta^2$',
        steps: [
          '解と係数の関係より $\\alpha + \\beta = 3, \\ \\alpha\\beta = 4$',
          '$\\alpha^2 + \\beta^2 = (\\alpha + \\beta)^2 - 2\\alpha\\beta = 3^2 - 2 \\cdot 4 = 1$',
        ],
        answer: '$1$',
      };

    case 'hs2_point_line_dist':
      return {
        problem: '点 $(1, 2)$ と直線 $3x + 4y - 1 = 0$ の距離',
        steps: [
          '距離公式 $d = \\frac{|ax_1 + by_1 + c|}{\\sqrt{a^2 + b^2}}$ に代入します。',
          '$\\displaystyle d = \\frac{|3(1) + 4(2) - 1|}{\\sqrt{3^2 + 4^2}} = \\frac{|10|}{5} = 2$',
        ],
        answer: '$2$',
      };

    case 'hs2_tangent_extrema': {
      if (params.mode === 'tangent') {
        return {
          problem: '曲線 $y = x^2 + 1$ 上の点 $(2, 5)$ における接線の方程式',
          steps: [
            '微分して傾きを求めます：$y\' = 2x$、$x = 2$ を代入して傾き $4$。',
            '接線公式に代入します：$y - 5 = 4(x - 2) \\implies y = 4x - 3$',
          ],
          answer: '$y = 4x - 3$',
        };
      }
      return {
        problem: '$f(x) = x^3 - 3x$ の極大値・極小値',
        steps: [
          '微分します：$f\'(x) = 3x^2 - 3 = 3(x + 1)(x - 1)$',
          '$f\'(x) = 0$ の解は $x = -1, \\ 1$。符号は $+ \\to - \\to +$ と変化します。',
          'よって $x = -1$ で極大値 $f(-1) = 2$、$x = 1$ で極小値 $f(1) = -2$。',
        ],
        answer: '極大値 $2$ ($x=-1$)、極小値 $-2$ ($x=1$)',
      };
    }

    case 'hsb_recurrence':
      return {
        problem: '$a_1 = 3, \\ a_{n+1} = 2a_n - 1$ の一般項 $a_n$',
        steps: [
          '特性方程式 $\\alpha = 2\\alpha - 1$ を解くと $\\alpha = 1$。',
          '変形します：$a_{n+1} - 1 = 2(a_n - 1)$',
          '数列 $\\{a_n - 1\\}$ は初項 $a_1 - 1 = 2$、公比 $2$ の等比数列より $a_n - 1 = 2 \\cdot 2^{n-1} = 2^n$',
        ],
        answer: '$a_n = 2^n + 1$',
      };

    case 'hs3_int_sub':
      return {
        problem: '$\\displaystyle \\int 2x(x^2 + 1)^3 \\, dx$',
        steps: [
          '内側の塊を $t = x^2 + 1$ とおきます。',
          '両辺を微分して $dt = 2x \\, dx$ を作ります。',
          '$t$ に書き換えて積分します：$\\displaystyle \\int t^3 \\, dt = \\frac{1}{4}t^4 + C$',
          '$t$ を $x^2 + 1$ に戻します。',
        ],
        answer: '$\\displaystyle \\frac{1}{4}(x^2 + 1)^4 + C$',
      };

    case 'hs3_int_parts':
      return {
        problem: '$\\displaystyle \\int x e^x \\, dx$',
        steps: [
          '部分積分公式 $\\int f(x)g\'(x)\\,dx = f(x)g(x) - \\int f\'(x)g(x)\\,dx$ で $f(x)=x, \\ g\'(x)=e^x$ とします。',
          '$\\displaystyle x e^x - \\int 1 \\cdot e^x \\, dx = x e^x - e^x + C$',
        ],
        answer: '$(x - 1)e^x + C$',
      };

    case 'univ_qf_moving_axis':
      return {
        problem: '$f(x) = x^2 - 2ax + 3 \\ (0 \\le x \\le 2)$ の最小値 $m(a)$',
        steps: [
          '平方完成：$f(x) = (x - a)^2 - a^2 + 3$（下に凸、軸 $x = a$）。',
          '① $a < 0$（軸が左外）：$x = 0$ で最小値 $f(0) = 3$。',
          '② $0 \\le a \\le 2$（軸が範囲内）：頂点 $x = a$ で最小値 $-a^2 + 3$。',
          '③ $a > 2$（軸が右外）：$x = 2$ で最小値 $f(2) = 7 - 4a$。',
        ],
        answer: '$a<0$ で $3$、$0\\le a\\le 2$ で $-a^2+3$、$a>2$ で $7-4a$',
      };

    case 'univ_int_equation':
      return {
        problem: '$\\displaystyle f(x) = 4x + 2\\int_0^1 f(t)\\,dt$ を満たす $f(x)$',
        steps: [
          '定積分は定数なので $a = \\int_0^1 f(t)\\,dt$ とおくと、$f(x) = 4x + 2a$。',
          'これを $a$ の定義式に代入して積分します：$a = \\int_0^1 (4t + 2a)\\,dt = \\bigl[2t^2 + 2at\\bigr]_0^1 = 2 + 2a$',
          '$a = 2 + 2a \\implies a = -2$ より $f(x) = 4x - 4$。',
        ],
        answer: '$f(x) = 4x - 4$',
      };

    case 'univ_trig_sub_int':
      return {
        problem: '$\\displaystyle \\int_0^2 \\sqrt{4 - x^2} \\, dx$',
        steps: [
          '$x = 2\\sin\\theta$ とおくと $dx = 2\\cos\\theta\\,d\\theta$、積分区間は $x: 0 \\to 2$ が $\\theta: 0 \\to \\frac{\\pi}{2}$。',
          '$\\displaystyle \\int_0^{\\frac{\\pi}{2}} 2\\cos\\theta \\cdot 2\\cos\\theta \\, d\\theta = 4\\int_0^{\\frac{\\pi}{2}} \\frac{1 + \\cos 2\\theta}{2} \\, d\\theta$',
          '$\\displaystyle = 2\\left[\\theta + \\frac{1}{2}\\sin 2\\theta\\right]_0^{\\frac{\\pi}{2}} = \\pi$',
        ],
        answer: '$\\pi$',
      };

    default:
      return {
        problem: 'このレベルの標準例題',
        steps: [
          '上の「ポイント」にある公式・手順を確認しながら、途中式を省略せずにノートへ書き出します。',
          '答えが出たら、逆算（微分・代入など）で正しいか検算しましょう。',
        ],
        answer: '解答欄と照らし合わせて自己採点しましょう',
      };
  }
}
