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

    case 'hs1_stats':
      return {
        problem: 'データ $2, 4, 6, 8, 10$ の平均値と分散',
        steps: [
          '平均値を求めます：$\\bar{x} = \\frac{2+4+6+8+10}{5} = 6$',
          '各値と平均値の差（偏差）を2乗します：$(-4)^2, (-2)^2, 0^2, 2^2, 4^2 = 16, 4, 0, 4, 16$',
          '偏差の2乗の平均が分散です：$s^2 = \\frac{16+4+0+4+16}{5} = 8$',
        ],
        answer: '平均値 $6$、分散 $8$',
      };

    case 'hs_comb_perm':
      if (params.mode === 'C') {
        return {
          problem: '$_6\\mathrm{C}_2$ を計算せよ。',
          steps: [
            '組合せの公式 $_n\\mathrm{C}_r = \\frac{_n\\mathrm{P}_r}{r!}$ に当てはめます。',
            '$\\displaystyle \\frac{6 \\times 5}{2 \\times 1} = 15$',
          ],
          answer: '$15$',
        };
      }
      return {
        problem: '$_5\\mathrm{P}_3$ を計算せよ。',
        steps: [
          '$5$ から始めて $1$ ずつ減らしながら $3$ 個かけます。',
          '$5 \\times 4 \\times 3 = 60$',
        ],
        answer: '$60$',
      };

    case 'hsa_prob_events':
      if (params.mode === 'complement') {
        return {
          problem: '硬貨を3回投げるとき、少なくとも1回は表が出る確率',
          steps: [
            '余事象「3回とも裏が出る確率」を求めます：$\\left(\\frac{1}{2}\\right)^3 = \\frac{1}{8}$',
            '$1$ から引きます：$1 - \\frac{1}{8} = \\frac{7}{8}$',
          ],
          answer: '$\\displaystyle \\frac{7}{8}$',
        };
      }
      return {
        problem: '硬貨を4回投げるとき、表がちょうど2回出る確率',
        steps: [
          '表が出る2回の選び方は $_4\\mathrm{C}_2 = 6$ 通り。',
          '反復試行の公式より $_4\\mathrm{C}_2 \\left(\\frac{1}{2}\\right)^2 \\left(\\frac{1}{2}\\right)^2 = 6 \\times \\frac{1}{16} = \\frac{3}{8}$',
        ],
        answer: '$\\displaystyle \\frac{3}{8}$',
      };

    case 'hsa_geom_theorems':
      if (params.mode === 'power') {
        return {
          problem: '弦 $\\mathrm{AB, CD}$ の交点 $\\mathrm{P}$ で $\\mathrm{PA}=3, \\mathrm{PB}=4, \\mathrm{PC}=2$ のとき $\\mathrm{PD}$',
          steps: [
            '方べきの定理より $\\mathrm{PA} \\cdot \\mathrm{PB} = \\mathrm{PC} \\cdot \\mathrm{PD}$',
            '$3 \\times 4 = 2 \\times \\mathrm{PD} \\implies 12 = 2\\mathrm{PD} \\implies \\mathrm{PD} = 6$',
          ],
          answer: '$\\mathrm{PD} = 6$',
        };
      }
      return {
        problem: '$\\mathrm{AB}=6, \\mathrm{AC}=4, \\mathrm{BC}=5$ で $\\angle\\mathrm{A}$ の二等分線と $\\mathrm{BC}$ の交点 $\\mathrm{D}$ のとき $\\mathrm{BD}$',
        steps: [
          '角の二等分線の性質より $\\mathrm{BD} : \\mathrm{DC} = \\mathrm{AB} : \\mathrm{AC} = 6 : 4 = 3 : 2$',
          '$\\mathrm{BD} = 5 \\times \\frac{3}{3+2} = 3$',
        ],
        answer: '$\\mathrm{BD} = 3$',
      };

    case 'hsa_int_diophantine':
      if (params.mode === 'base') {
        return {
          problem: '10進法の $13$ を2進法で表せ。',
          steps: [
            '$13 \\div 2 = 6$ あまり $1$、$6 \\div 2 = 3$ あまり $0$、$3 \\div 2 = 1$ あまり $1$、$1 \\div 2 = 0$ あまり $1$',
            '余りを下から順に並べると $1101_{(2)}$ です。',
          ],
          answer: '$1101_{(2)}$',
        };
      }
      return {
        problem: '$72$ の正の約数の個数を求めよ。',
        steps: [
          '素因数分解します：$72 = 2^3 \\times 3^2$',
          '各指数に $1$ を足して掛けます：$(3+1)(2+1) = 4 \\times 3 = 12$',
        ],
        answer: '$12$ 個',
      };

    case 'hs_complex':
      return {
        problem: '$(2 + 3i)(1 - 2i)$ を計算せよ。',
        steps: [
          '多項式と同じように展開します：$2 - 4i + 3i - 6i^2$',
          '$i^2 = -1$ を代入します：$2 - i - 6(-1) = 2 - i + 6 = 8 - i$',
        ],
        answer: '$8 - i$',
      };

    case 'hs2_remainder_cubic':
      return {
        problem: '$P(x) = x^3 - 2x^2 + 3x - 1$ を $x - 2$ で割った余り',
        steps: [
          '剰余の定理より、$x - 2 = 0$ となる $x = 2$ を $P(x)$ に代入します。',
          '$P(2) = 2^3 - 2(2^2) + 3(2) - 1 = 8 - 8 + 6 - 1 = 5$',
        ],
        answer: '$5$',
      };

    case 'hs2_trig_add':
      return {
        problem: '$\\sin\\theta + \\sqrt{3}\\cos\\theta$ の合成',
        steps: [
          '係数 $(1, \\sqrt{3})$ より $r = \\sqrt{1^2 + (\\sqrt{3})^2} = 2$。',
          '$\\cos\\alpha = \\frac{1}{2}, \\ \\sin\\alpha = \\frac{\\sqrt{3}}{2}$ より $\\alpha = \\frac{\\pi}{3}$。',
        ],
        answer: '$\\displaystyle 2\\sin\\left(\\theta + \\frac{\\pi}{3}\\right)$',
      };

    case 'hs2_exp_log_eq':
      if (params.mode === 'log') {
        return {
          problem: '$\\log_2(x - 1) = 3$ を解け。',
          steps: [
            '真数条件より $x - 1 > 0 \\iff x > 1$。',
            '対数の定義より $x - 1 = 2^3 = 8 \\implies x = 9$（$x > 1$ を満たす）。',
          ],
          answer: '$x = 9$',
        };
      }
      return {
        problem: '$2^{x+1} = 16$ を解け。',
        steps: [
          '右辺を底 $2$ で表します：$16 = 2^4$',
          '指数を比較します：$x + 1 = 4 \\implies x = 3$',
        ],
        answer: '$x = 3$',
      };

    case 'hs2_def_int_area':
      return {
        problem: '放物線 $y = x^2 - 3x + 2$ と $x$ 軸で囲まれた面積 $S$',
        steps: [
          '交点を求めます：$(x-1)(x-2)=0 \\implies x = 1, 2$。',
          '$\\frac{1}{6}$公式より $S = \\frac{1}{6}(2 - 1)^3 = \\frac{1}{6}$',
        ],
        answer: '$\\displaystyle \\frac{1}{6}$',
      };

    case 'hs_seq':
      if (params.kind === 'geom') {
        return {
          problem: '初項 $2$、公比 $3$ の等比数列の第 $4$ 項',
          steps: [
            '等比数列の一般項 $a_n = a_1 r^{n-1}$ に $a_1=2, r=3, n=4$ を代入します。',
            '$a_4 = 2 \\times 3^{4-1} = 2 \\times 27 = 54$',
          ],
          answer: '$54$',
        };
      }
      return {
        problem: '初項 $3$、公差 $4$ の等差数列の第 $6$ 項',
        steps: [
          '等差数列の一般項 $a_n = a_1 + (n-1)d$ に代入します。',
          '$a_6 = 3 + (6-1) \\times 4 = 3 + 20 = 23$',
        ],
        answer: '$23$',
      };

    case 'hsb_sigma_diff':
      return {
        problem: '$\\displaystyle \\sum_{k=1}^{5} (2k + 1)$ を計算せよ。',
        steps: [
          '$\\sum$ を分けます：$2\\sum_{k=1}^5 k + \\sum_{k=1}^5 1$',
          '$2 \\cdot \\frac{5 \\cdot 6}{2} + 5 = 30 + 5 = 35$',
        ],
        answer: '$35$',
      };

    case 'hsb_binomial_dist':
      return {
        problem: '二項分布 $B\\left(30, \\frac{1}{3}\\right)$ の期待値と分散',
        steps: [
          '期待値：$E(X) = np = 30 \\times \\frac{1}{3} = 10$',
          '分散：$V(X) = np(1-p) = 10 \\times \\frac{2}{3} = \\frac{20}{3}$',
        ],
        answer: '$E(X) = 10, \\ V(X) = \\frac{20}{3}$',
      };

    case 'hs_vector':
      return {
        problem: '$\\vec{a}=(2, -3), \\ \\vec{b}=(4, 1)$ の内積',
        steps: [
          '成分ごとの積をたします：$\\vec{a}\\cdot\\vec{b} = 2 \\times 4 + (-3) \\times 1$',
          '$8 - 3 = 5$',
        ],
        answer: '$5$',
      };

    case 'hsc_vec_angle_perp':
      return {
        problem: '$\\vec{a}=(2, 3), \\ \\vec{b}=(x, 4)$ が垂直となる $x$ の値',
        steps: [
          '垂直条件より $\\vec{a}\\cdot\\vec{b} = 0$：$2x + 3 \\times 4 = 0$',
          '$2x = -12 \\implies x = -6$',
        ],
        answer: '$x = -6$',
      };

    case 'hsc_conics':
      if (params.mode === 'ellipse') {
        return {
          problem: '楕円 $\\frac{x^2}{25} + \\frac{y^2}{9} = 1$ の焦点',
          steps: [
            '$a^2 = 25, \\ b^2 = 9$ より $c = \\sqrt{a^2 - b^2} = \\sqrt{25 - 9} = 4$',
            '焦点は $x$ 軸上に $(\\pm 4, 0)$ です。',
          ],
          answer: '$(\\pm 4, 0)$',
        };
      }
      return {
        problem: '放物線 $y^2 = 12x$ の焦点と準線',
        steps: [
          '$y^2 = 4px$ と比較して $4p = 12 \\implies p = 3$。',
          'よって焦点 $(3, 0)$、準線 $x = -3$ です。',
        ],
        answer: '焦点 $(3, 0)$、準線 $x = -3$',
      };

    case 'hsc_complex_polar':
      return {
        problem: '$z = 1 + \\sqrt{3}i$ を極形式で表せ。',
        steps: [
          '絶対値 $r = \\sqrt{1^2 + (\\sqrt{3})^2} = 2$。',
          '$z = 2\\left(\\frac{1}{2} + \\frac{\\sqrt{3}}{2}i\\right)$ より偏角 $\\theta = \\frac{\\pi}{3}$。',
        ],
        answer: '$\\displaystyle 2\\left(\\cos\\frac{\\pi}{3} + i\\sin\\frac{\\pi}{3}\\right)$',
      };

    case 'hs3_limits':
      if (params.mode === 'series') {
        return {
          problem: '初項 $3$、公比 $\\frac{1}{2}$ の無限等比級数の和',
          steps: [
            '$|r| = \\frac{1}{2} < 1$ なので収束します。',
            '公式 $\\frac{a}{1-r} = \\frac{3}{1 - 1/2} = 6$',
          ],
          answer: '$6$',
        };
      }
      if (params.mode === 'trig') {
        return {
          problem: '$\\displaystyle \\lim_{x \\to 0} \\frac{\\sin 3x}{2x}$',
          steps: [
            '$\\displaystyle \\frac{\\sin 3x}{3x} \\cdot \\frac{3}{2}$ と変形します。',
            '$x \\to 0$ のとき $\\frac{\\sin 3x}{3x} \\to 1$ より $\\frac{3}{2}$。',
          ],
          answer: '$\\displaystyle \\frac{3}{2}$',
        };
      }
      return {
        problem: '$\\displaystyle \\lim_{n \\to \\infty} \\frac{3n^2 + 2n + 1}{2n^2 - n + 5}$',
        steps: [
          '分母・分子を $n^2$ で割ります：$\\displaystyle \\frac{3 + \\frac{2}{n} + \\frac{1}{n^2}}{2 - \\frac{1}{n} + \\frac{5}{n^2}}$',
          '$n \\to \\infty$ で $\\frac{1}{n} \\to 0$ より $\\frac{3}{2}$。',
        ],
        answer: '$\\displaystyle \\frac{3}{2}$',
      };

    case 'hs3_diff_adv':
      return {
        problem: '$y = x e^{2x}$ を微分せよ。',
        steps: [
          '積の微分公式 $(fg)\' = f\'g + fg\'$ より $y\' = (x)\'e^{2x} + x(e^{2x})\'$',
          '$(e^{2x})\' = 2e^{2x}$ なので $y\' = e^{2x} + 2xe^{2x} = (1 + 2x)e^{2x}$',
        ],
        answer: '$y\' = (1 + 2x)e^{2x}$',
      };

    case 'hs3_int_volume':
      return {
        problem: '$y = \\sqrt{x} \\ (0 \\le x \\le 2)$ を $x$ 軸まわりに1回転した体積 $V$',
        steps: [
          '公式 $V = \\pi \\int_0^2 (\\sqrt{x})^2 \\, dx = \\pi \\int_0^2 x \\, dx$',
          '$\\displaystyle \\pi \\left[\\frac{1}{2}x^2\\right]_0^2 = 2\\pi$',
        ],
        answer: '$2\\pi$',
      };

    case 'univ_const_sep':
      return {
        problem: '$x^3 - 3x - k = 0$ が異なる3実数解をもつ $k$ の範囲',
        steps: [
          '定数分離します：$k = x^3 - 3x$。右辺を $f(x)$ とおきます。',
          '$f\'(x) = 3(x+1)(x-1)$ より、極大値 $f(-1) = 2$、極小値 $f(1) = -2$。',
          '直線 $y = k$ が曲線と3点で交わる範囲は $-2 < k < 2$。',
        ],
        answer: '$-2 < k < 2$',
      };

    case 'univ_seq_sn_an':
      return {
        problem: '$S_n = n^2 + 2n$ のとき一般項 $a_n$',
        steps: [
          '$n \\ge 2$ で $a_n = S_n - S_{n-1} = (n^2+2n) - \\{(n-1)^2+2(n-1)\\} = 2n + 1$',
          '$n = 1$ のとき $a_1 = S_1 = 3$。$2(1)+1 = 3$ より $n=1$ でも成り立ちます。',
        ],
        answer: '$a_n = 2n + 1$',
      };

    case 'univ_space_vec':
      return {
        problem: '$\\mathrm{A}(1, 2, 2), \\ \\mathrm{B}(2, 0, 2)$ のとき $\\overrightarrow{\\mathrm{OA}}\\cdot\\overrightarrow{\\mathrm{OB}}$ と $|\\overrightarrow{\\mathrm{OA}}|^2$',
        steps: [
          '内積：$1\\cdot 2 + 2\\cdot 0 + 2\\cdot 2 = 6$',
          '大きさの2乗：$1^2 + 2^2 + 2^2 = 9$',
        ],
        answer: '内積 $6$、$|\\overrightarrow{\\mathrm{OA}}|^2 = 9$',
      };

    case 'univ_complex_rot':
      return {
        problem: '$z = 2 + 3i$ を原点まわりに $\\frac{\\pi}{2}$ 回転した点 $w$',
        steps: [
          '$\\frac{\\pi}{2}$ 回転は $\\cos\\frac{\\pi}{2} + i\\sin\\frac{\\pi}{2} = i$ を掛けます。',
          '$w = i(2 + 3i) = 2i + 3i^2 = -3 + 2i$',
        ],
        answer: '$w = -3 + 2i$',
      };

    case 'univ_riemann_sum':
      return {
        problem: '$\\displaystyle \\lim_{n \\to \\infty} \\frac{1}{n} \\sum_{k=1}^{n} \\left(\\frac{k}{n}\\right)^2$',
        steps: [
          '区分求積法の公式 $\\lim_{n\\to\\infty}\\frac{1}{n}\\sum_{k=1}^n f\\left(\\frac{k}{n}\\right) = \\int_0^1 f(x)\\,dx$ を適用します。',
          '$\\displaystyle \\int_0^1 x^2 \\, dx = \\left[\\frac{1}{3}x^3\\right]_0^1 = \\frac{1}{3}$',
        ],
        answer: '$\\displaystyle \\frac{1}{3}$',
      };

    case 'univ_prob_recurrence':
      return {
        problem: 'さいころを $n$ 回投げて目の和が偶数になる確率 $p_n$',
        steps: [
          '$p_1 = \\frac{1}{2}$。$n$ 回目が偶数($p_n$)なら次は偶数($\\frac{1}{2}$)、奇数($1-p_n$)なら次は奇数($\\frac{1}{2}$)が出ればよい。',
          '$p_{n+1} = \\frac{1}{2}p_n + \\frac{1}{2}(1 - p_n) = \\frac{1}{2}$',
        ],
        answer: '$p_n = \\frac{1}{2}$',
      };

    case 'hs1_cubic_expand_factor':
      if (params.mode === 'decimal') {
        return {
          problem: '$\\sqrt{7}$ の整数部分と小数部分',
          steps: [
            '$2^2 = 4 < 7 < 9 = 3^2$ より $2 < \\sqrt{7} < 3$ なので、整数部分は $2$。',
            '小数部分は元の数から整数部分を引いて $\\sqrt{7} - 2$。',
          ],
          answer: '整数部分 $2$、小数部分 $\\sqrt{7} - 2$',
        };
      }
      if (params.mode === 'expand') {
        return {
          problem: '$(x + 2)^3$ を展開せよ。',
          steps: [
            '公式 $(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3$ に $a=x, b=2$ を代入します。',
            '$x^3 + 3x^2(2) + 3x(4) + 8 = x^3 + 6x^2 + 12x + 8$',
          ],
          answer: '$x^3 + 6x^2 + 12x + 8$',
        };
      }
      return {
        problem: '$x^3 + 8$ を因数分解せよ。',
        steps: [
          '$8 = 2^3$ なので公式 $a^3 + b^3 = (a+b)(a^2 - ab + b^2)$ を用います。',
          '$(x + 2)(x^2 - 2x + 4)$',
        ],
        answer: '$(x + 2)(x^2 - 2x + 4)$',
      };

    case 'hs1_qf_root_loc':
      return {
        problem: '$x^2 - 4x + k = 0$ が異なる2つの正の解をもつ $k$ の範囲',
        steps: [
          '① 判別式：$D/4 = 4 - k > 0 \\implies k < 4$',
          '② 軸：$x = 2 > 0$（常に成立）',
          '③ 端点：$f(0) = k > 0$。①〜③を合わせて $0 < k < 4$。',
        ],
        answer: '$0 < k < 4$',
      };

    case 'hs1_stats_corr':
      if (params.mode === 'transform') {
        return {
          problem: '平均 $5$・分散 $3$ の変量 $x$ を $y = 2x + 1$ に変換した平均と分散',
          steps: [
            '平均：$\\bar{y} = 2\\bar{x} + 1 = 2(5) + 1 = 11$',
            '分散：$s_y^2 = 2^2 s_x^2 = 4 \\times 3 = 12$',
          ],
          answer: '平均 $11$、分散 $12$',
        };
      }
      return {
        problem: '$s_x = 4, \\ s_y = 5, \\ s_{xy} = 10$ のとき相関係数 $r$',
        steps: [
          '定義より $r = \\frac{s_{xy}}{s_x s_y} = \\frac{10}{4 \\times 5} = \\frac{1}{2}$',
        ],
        answer: '$\\displaystyle \\frac{1}{2}$',
      };

    case 'hsa_perm_comb_adv':
      if (params.mode === 'same') {
        return {
          problem: 'Aが3個、Bが2個の計5文字を一列に並べる方法',
          steps: [
            '同じものを含む順列の公式より $\\frac{5!}{3!\\,2!} = \\frac{120}{6 \\times 2} = 10$',
          ],
          answer: '$10$ 通り',
        };
      }
      if (params.mode === 'rep_comb') {
        return {
          problem: '3種類から重複を許して4個選ぶ組合せ $_3\\mathrm{H}_4$',
          steps: [
            '公式 $_n\\mathrm{H}_r = _{n+r-1}\\mathrm{C}_r$ より $_6\\mathrm{C}_4 = _6\\mathrm{C}_2 = 15$',
          ],
          answer: '$15$ 通り',
        };
      }
      return {
        problem: '5人が円形に座る座り方',
        steps: [
          '1人を固定して残り4人を並べるので $(5-1)! = 4! = 24$ 通り。',
        ],
        answer: '$24$ 通り',
      };

    case 'hsa_cond_prob_exp':
      if (params.mode === 'exp') {
        return {
          problem: 'さいころで6が出たら600円、他は0円の期待値',
          steps: [
            '期待値 $E(X) = 600 \\times \\frac{1}{6} + 0 \\times \\frac{5}{6} = 100$',
          ],
          answer: '$100$ 円',
        };
      }
      return {
        problem: '赤3白2から戻さず2回取り出し、1回目が赤のとき2回目も赤の条件付き確率',
        steps: [
          '1回目に赤を1個取った後、袋には赤2・白2の計4個が残っています。',
          'よって2回目も赤を引く確率は $\\frac{2}{4} = \\frac{1}{2}$。',
        ],
        answer: '$\\displaystyle \\frac{1}{2}$',
      };

    case 'hsa_ceva_menelaus':
      return {
        problem: '$\\frac{\\mathrm{AR}}{\\mathrm{RB}}=\\frac{2}{3}, \\ \\frac{\\mathrm{BP}}{\\mathrm{PC}}=\\frac{1}{2}$ のとき $\\frac{\\mathrm{CQ}}{\\mathrm{QA}}$',
        steps: [
          '$\\frac{2}{3} \\cdot \\frac{1}{2} \\cdot \\frac{\\mathrm{CQ}}{\\mathrm{QA}} = 1 \\implies \\frac{1}{3} \\cdot \\frac{\\mathrm{CQ}}{\\mathrm{QA}} = 1$',
          'よって $\\frac{\\mathrm{CQ}}{\\mathrm{QA}} = 3$（比は $3:1$）。',
        ],
        answer: '$3$（$3:1$）',
      };

    case 'hsa_euclid_mod':
      if (params.mode === 'mod') {
        return {
          problem: '$8^5$ を $7$ で割った余り',
          steps: [
            '$8 \\equiv 1 \\pmod 7$ なので、両辺を5乗して $8^5 \\equiv 1^5 = 1 \\pmod 7$',
          ],
          answer: '余り $1$',
        };
      }
      return {
        problem: '一次不定方程式 $3x + 2y = 1$ の整数解',
        steps: [
          '特殊解 $(1, -1)$ を元の式から引くと $3(x-1) = -2(y+1)$。',
          '$3$ と $2$ は互いに素なので $x - 1 = 2k, \\ y + 1 = -3k$（$k$ は整数）。',
        ],
        answer: '$x = 2k + 1, \\ y = -3k - 1$',
      };

    case 'hs2_identity_amgm':
      if (params.mode === 'identity') {
        return {
          problem: '$2x^2 + 3x + 1 = p(x-1)^2 + q(x-1) + r$ の係数決定',
          steps: [
            '右辺を展開すると $px^2 + (q-2p)x + (p-q+r)$。',
            '係数を比較して $p = 2, \\ q = 7, \\ r = 6$。',
          ],
          answer: '$p = 2, \\ q = 7, \\ r = 6$',
        };
      }
      return {
        problem: '$x > 0$ のとき $x + \\frac{9}{x}$ の最小値',
        steps: [
          '$x > 0, \\frac{9}{x} > 0$ より相加・相乗平均の関係から $x + \\frac{9}{x} \\ge 2\\sqrt{x \\cdot \\frac{9}{x}} = 6$。',
          '等号成立は $x = \\frac{9}{x}$ かつ $x > 0$ すなわち $x = 3$ のとき。',
        ],
        answer: '最小値 $6$（$x = 3$）',
      };

    case 'hs2_circle_region':
      if (params.mode === 'lp') {
        return {
          problem: '$x \\ge 0, y \\ge 0, x+y \\le 3$ で $k = 2x + y$ の最大値',
          steps: [
            '領域は3点 $(0,0), (3,0), (0,3)$ を頂点とする三角形です。',
            '各頂点で $2x+y$ を調べると $(3,0)$ のとき最大値 $6$。',
          ],
          answer: '最大値 $6$',
        };
      }
      return {
        problem: '円 $x^2 + y^2 = 25$ 上の点 $(3, 4)$ における接線',
        steps: [
          '円の接線の公式 $x_1 x + y_1 y = r^2$ に $(3, 4)$ を代入します。',
          '$3x + 4y = 25$',
        ],
        answer: '$3x + 4y = 25$',
      };

    case 'hs2_trig_eq_log_digits':
      if (params.mode === 'trig_eq') {
        return {
          problem: '$0 \\le \\theta < 2\\pi$ で $\\sin\\theta = \\frac{1}{2}$ を解け。',
          steps: [
            '単位円上で $y$ 座標が $\\frac{1}{2}$ となる動径の角を読み取ります。',
            '$\\theta = \\frac{\\pi}{6}, \\ \\frac{5}{6}\\pi$',
          ],
          answer: '$\\displaystyle \\theta = \\frac{\\pi}{6}, \\ \\frac{5}{6}\\pi$',
        };
      }
      return {
        problem: '$2^{10}$ の桁数（$\\log_{10} 2 = 0.3010$）',
        steps: [
          '$\\log_{10} 2^{10} = 10 \\times 0.3010 = 3.010$',
          '$3 \\le \\log_{10} 2^{10} < 4$ より $10^3 \\le 2^{10} < 10^4$ なので $4$ 桁。',
        ],
        answer: '$4$ 桁',
      };

    case 'hsb_diff_group_induct':
      if (params.mode === 'group') {
        return {
          problem: '第 $n$ 群に $n$ 個の自然数が入るとき、第 $5$ 群の最初の数',
          steps: [
            '第 $4$ 群までの個数の合計は $1 + 2 + 3 + 4 = 10$ 個。',
            'よって第 $5$ 群の最初は $10 + 1 = 11$。',
          ],
          answer: '$11$',
        };
      }
      return {
        problem: '初項 $a_1 = 2$、階差数列 $b_n = 2n$ の一般項 $a_n$',
        steps: [
          '$n \\ge 2$ のとき $a_n = 2 + \\sum_{k=1}^{n-1} 2k = 2 + n(n-1) = n^2 - n + 2$',
          '$n = 1$ を代入しても $1 - 1 + 2 = 2 = a_1$ で成り立ちます。',
        ],
        answer: '$a_n = n^2 - n + 2$',
      };

    case 'hsb_normal_conf':
      return {
        problem: '$N(60, 5^2)$ で $X = 70$ のときの標準化 $Z$',
        steps: [
          '公式 $Z = \\frac{X - m}{\\sigma}$ に代入します：$Z = \\frac{70 - 60}{5} = 2$',
        ],
        answer: '$Z = 2$',
      };

    case 'hsc_pos_vec_space':
      if (params.mode === 'space_foot') {
        return {
          problem: '点 $\\mathrm{P}(2, 3, 4)$ から $xy$ 平面への垂線の足 $\\mathrm{H}$ と長さ $\\mathrm{PH}$',
          steps: [
            '$xy$ 平面上では $z = 0$ なので $\\mathrm{H}(2, 3, 0)$。',
            '距離は $z$ 座標の絶対値で $\\mathrm{PH} = 4$。',
          ],
          answer: '$\\mathrm{H}(2, 3, 0)$、$\\mathrm{PH} = 4$',
        };
      }
      return {
        problem: '線分 $\\mathrm{AB}$ を $2:3$ に内分する点の位置ベクトル',
        steps: [
          '内分公式 $\\frac{n\\vec{a} + m\\vec{b}}{m+n}$ に $m=2, n=3$ を代入します。',
          '$\\displaystyle \\frac{3\\vec{a} + 2\\vec{b}}{5}$',
        ],
        answer: '$\\displaystyle \\frac{3\\vec{a} + 2\\vec{b}}{5}$',
      };

    case 'hsc_hyperbola_polar':
      if (params.mode === 'polar') {
        return {
          problem: '極座標 $\\left(4, \\frac{\\pi}{3}\\right)$ の直交座標',
          steps: [
            '$x = 4\\cos\\frac{\\pi}{3} = 2, \\ y = 4\\sin\\frac{\\pi}{3} = 2\\sqrt{3}$',
          ],
          answer: '$(2, \\ 2\\sqrt{3})$',
        };
      }
      return {
        problem: '双曲線 $\\frac{x^2}{9} - \\frac{y^2}{4} = 1$ の漸近線',
        steps: [
          '$a = 3, b = 2$ より漸近線は $y = \\pm \\frac{b}{a}x = \\pm \\frac{2}{3}x$',
        ],
        answer: '$\\displaystyle y = \\pm \\frac{2}{3}x$',
      };

    case 'hsc_complex_geom':
      return {
        problem: '$|z - 1| = |z - 3i|$ が表す図形',
        steps: [
          '点 $z$ から2点 $1$ と $3i$ までの距離が等しいことを意味します。',
          'よって2点を結ぶ線分の垂直二等分線です。',
        ],
        answer: '2点 $1, 3i$ を結ぶ線分の垂直二等分線',
      };

    case 'hs3_lim_squeeze_cont':
      return {
        problem: '$\\displaystyle \\lim_{x \\to \\infty} \\frac{\\sin 2x}{x}$',
        steps: [
          '$-1 \\le \\sin 2x \\le 1$ より $x > 0$ で $-\\frac{1}{x} \\le \\frac{\\sin 2x}{x} \\le \\frac{1}{x}$。',
          '$x \\to \\infty$ で両端が $0$ に収束するので、はさみうちの原理より $0$。',
        ],
        answer: '$0$',
      };

    case 'hs3_diff_quot_inflect':
      if (params.mode === 'ineq') {
        return {
          problem: '$x > 0$ で $e^x > 1 + x$ の証明手順',
          steps: [
            '$f(x) = e^x - 1 - x$ とおくと $f(0) = 0$。',
            '$f\'(x) = e^x - 1 > 0 \\ (x > 0)$ より $f(x)$ は単調増加なので $f(x) > f(0) = 0$。',
          ],
          answer: '$e^x > 1 + x$（証明完了）',
        };
      }
      if (params.mode === 'inflect') {
        return {
          problem: '$y = x^3 - 3x^2 + 1$ の変曲点の $x$ 座標',
          steps: [
            '$y\' = 3x^2 - 6x, \\ y\'\' = 6x - 6 = 6(x - 1)$。',
            '$x = 1$ の前後で $y\'\'$ の符号が変わるので変曲点は $x = 1$。',
          ],
          answer: '$x = 1$',
        };
      }
      return {
        problem: '$\\displaystyle y = \\frac{x}{x + 2}$ の微分',
        steps: [
          '商の微分より $y\' = \\frac{1\\cdot(x+2) - x\\cdot 1}{(x+2)^2} = \\frac{2}{(x+2)^2}$',
        ],
        answer: '$\\displaystyle y\' = \\frac{2}{(x+2)^2}$',
      };

    case 'hs3_int_yvol_len':
      if (params.mode === 'length') {
        return {
          problem: '$x = 2\\cos t, y = 2\\sin t \\ (0 \\le t \\le \\pi)$ の曲線の長さ',
          steps: [
            '$\\sqrt{(x\'(t))^2 + (y\'(t))^2} = \\sqrt{4\\sin^2 t + 4\\cos^2 t} = 2$',
            '$L = \\int_0^{\\pi} 2\\,dt = 2\\pi$',
          ],
          answer: '$2\\pi$',
        };
      }
      return {
        problem: '$y = x^2 \\ (x \\ge 0)$ と $y$ 軸・$y = 3$ で囲まれた図形の $y$ 軸回転体の体積',
        steps: [
          '$x^2 = y$ なので $V = \\pi \\int_0^3 x^2\\,dy = \\pi \\int_0^3 y\\,dy$',
          '$\\displaystyle \\pi \\left[\\frac{1}{2}y^2\\right]_0^3 = \\frac{9}{2}\\pi$',
        ],
        answer: '$\\displaystyle \\frac{9}{2}\\pi$',
      };

    case 'univ_guided_multipart':
      return {
        problem: '$f(x) = \\frac{\\log x}{x} \\ (x > 0)$ の最大値と $e^{\\pi}, \\pi^e$ の大小',
        steps: [
          '(1) 商の微分より $f\'(x) = \\frac{1 - \\log x}{x^2} = 0 \\implies x = e$',
          '(2) 増減表より $x = e$ で最大値 $\\frac{1}{e}$。',
          '(3) $f(e) > f(\\pi)$ より $\\frac{1}{e} > \\frac{\\log \\pi}{\\pi}$、両辺に $e\\pi > 0$ を掛けて $\\pi > e\\log\\pi = \\log \\pi^e \\implies e^{\\pi} > \\pi^e$。',
        ],
        answer: '$e^{\\pi} > \\pi^e$',
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
