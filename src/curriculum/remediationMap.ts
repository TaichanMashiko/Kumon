import type { StageGroup } from './mathEngine';

export const STAGE_TO_KUMON_RANK: Record<StageGroup, string> = {
  小学校1年: 'A教材相当',
  小学校2年: 'B〜C教材相当',
  小学校3年: 'C教材相当',
  小学校4年: 'D教材相当',
  小学校5年: 'E教材相当',
  小学校6年: 'F教材相当',
  中学校1年: 'G教材相当',
  中学校2年: 'H教材相当',
  中学校3年: 'I教材相当',
  '高校 数学Ⅰ': 'J教材相当',
  '高校 数学A': 'J教材相当',
  '高校 数学Ⅱ': 'K教材相当',
  '高校 数学B': 'M教材相当',
  '高校 数学C': 'K〜M教材相当',
  '高校 数学Ⅲ': 'L〜N教材相当',
  '大学入試（茨城大・筑波大）': 'M〜O教材相当',
};

/**
 * ステップIDのプレフィックスから「解けなかったときに戻るべき基礎ステップID」を定義
 * 高校 → 中学 → 小学まで一貫して診断・戻り学習が可能
 */
export const PREFIX_REMEDIATION_MAP: Record<string, string[]> = {
  // 中学 → 小学
  'J1-SGN': ['E2-ADD3-001', 'E2-SUB2-001'],
  'J1-EXP': ['J1-SGN-ADD-001', 'J1-SGN-SUB-001'],
  'J1-EQ': ['J1-EXP-ADD-001', 'E6-EQ-001'],
  'J2-SIM': ['J1-EQ-5-001', 'J1-EXP-SUB-001'],
  'J2-FUNC': ['J1-EQ-4-001', 'J2-SIM-1-001'],
  'J3-EXP': ['J1-SGN-MUL-001', 'J2-POLY-ADD-001'],
  'J3-FAC': ['J3-EXP-1-001', 'E2-KUKU-ALL-001'],
  'J3-SQRT': ['E2-KUKU-ALL-001', 'E5-RED-001'],
  'J3-QUAD': ['J3-FAC-1-001', 'J1-EQ-4-001'],
  'J3-PYTH': ['J3-SQRT-1-001', 'J3-QUAD-1-001'],

  // 高校 数学Ⅰ → 中学・小学
  'H1-EXP': ['J3-FAC-1-001', 'J3-EXP-1-001', 'J1-SGN-MUL-001'],
  'H1-SYM': ['J3-EXP-2-001', 'J1-EXP-ADD-001'],
  'H1-DSQRT': ['J3-SQRT-1-001', 'J3-EXP-2-001'],
  'H1-ABS': ['J1-EQ-4-001', 'J1-SGN-ADD-001'],
  'H1-LOGIC': ['J3-QUAD-1-001', 'J1-SGN-ADD-001'],
  'H1-QF-SQ': ['J3-EXP-2-001', 'E5-FADD-001'],
  'H1-QF-MM': ['H1-QF-SQ-001', 'J2-FUNC-1-001'],
  'H1-QF-DISC': ['J3-QUAD-1-001', 'J1-EQ-4-001'],
  'H1-QINEQ': ['J3-FAC-1-001', 'J3-QUAD-1-001'],
  'H1-TRIG-V': ['J3-PYTH-1-001', 'J3-SQRT-2-001', 'E6-FMUL-001'],
  'H1-TRIG-TH': ['H1-TRIG-V-001', 'J3-PYTH-1-001', 'E6-FMUL-001'],
  'H1-STAT': ['E5-DECDIV-001', 'E4-DEC1-001'],

  // 高校 数学A → 中学・小学
  'HA-PC': ['J2-PROB-1-001', 'E3-MUL22-001'],
  'HA-PROB': ['HA-PC-001', 'E6-FMUL-001', 'E5-FADD-001'],
  'HA-GEOM': ['E6-RATIO-001', 'J1-EQ-3-001'],
  'HA-INT': ['E5-GCD-001', 'E3-DIV2-001'],

  // 高校 数学Ⅱ → 数Ⅰ・中学・小学
  'H2-BINOM': ['HA-PC-003', 'J3-EXP-2-001'],
  'H2-CMP': ['H1-SYM-001', 'J3-QUAD-1-001'],
  'H2-REM': ['J1-EXP-ADD-001', 'J1-SGN-MUL-001'],
  'H2-GEOM': ['J2-FUNC-1-001', 'J3-SQRT-2-001', 'J3-PYTH-1-001'],
  'H2-TRIG': ['H1-TRIG-V-001', 'J3-SQRT-1-001', 'E5-FADD-001'],
  'H2-EXPLOG': ['J1-EQ-4-001', 'E6-FDIV-001'],
  'H2-DIFF-AP': ['J3-FAC-1-001', 'J2-FUNC-1-001'],
  'H2-INT-AREA': ['J3-QUAD-1-001', 'E5-FSUB-001', 'E6-FMUL-001'],

  // 高校 数学B・C・Ⅲ → 数ⅠⅡ・中学
  'HB-SEQ': ['J1-EQ-4-001', 'J2-FUNC-1-001'],
  'HB-SIGMA': ['HB-SEQ-001', 'J1-EXP-ADD-001'],
  'HB-REC': ['HB-SEQ-003', 'J1-EQ-5-001'],
  'HB-STAT': ['HA-PROB-003', 'E6-FMUL-001'],
  'HC-VEC': ['J1-EQ-4-001', 'J3-PYTH-1-001'],
  'HC-CONIC': ['H1-QF-SQ-001', 'J3-SQRT-1-001'],
  'HC-CMP': ['H2-CMP-001', 'H2-TRIG-001'],
  'H3-LIM': ['HB-SEQ-003', 'E6-FDIV-001'],
  'H3-DIFF': ['H2-DIFF-AP-001', 'H2-TRIG-001'],
  'H3-INT-SUB': ['H3-DIFF-001', 'H2-INT-AREA-001', 'E6-FMUL-001'],
  'H3-INT-PARTS': ['H3-DIFF-001', 'H3-INT-SUB-001'],
  'H3-INT-VOL': ['H2-INT-AREA-001', 'H3-INT-SUB-001'],
};

export function resolveRemediationIds(
  stepId: string,
  explicitIds?: string[]
): string[] {
  if (explicitIds && explicitIds.length > 0) {
    return explicitIds;
  }
  const matchedKey = Object.keys(PREFIX_REMEDIATION_MAP)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => stepId.startsWith(prefix));
  return matchedKey ? PREFIX_REMEDIATION_MAP[matchedKey] : [];
}
