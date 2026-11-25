import type { UserAccount } from '../types/curriculum';

export const DEMO_ACCOUNTS: UserAccount[] = [
  {
    id: 'stu-001',
    name: '佐藤 健太',
    email: 'k.sato@school.ed.jp',
    role: 'student',
    classLabel: '高校3年 2組',
    initials: '佐',
  },
  {
    id: 'stu-002',
    name: '鈴木 葵',
    email: 'a.suzuki@school.ed.jp',
    role: 'student',
    classLabel: '高校3年 2組',
    initials: '鈴',
  },
  {
    id: 'stu-003',
    name: '高橋 蓮',
    email: 'r.takahashi@school.ed.jp',
    role: 'student',
    classLabel: '高校3年 1組',
    initials: '高',
  },
  {
    id: 'tch-001',
    name: '山田 太郎 先生',
    email: 't.yamada@school.ed.jp',
    role: 'teacher',
    classLabel: '数学科 担当',
    initials: '山',
  },
];

const AUTH_STORAGE_KEY = 'mathstep_auth_user_id_v1';

export function getSavedUser(): UserAccount | null {
  try {
    const savedId = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedId) return null;
    return DEMO_ACCOUNTS.find((acc) => acc.id === savedId) ?? null;
  } catch {
    return null;
  }
}

export function saveUserSession(user: UserAccount): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, user.id);
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export function clearUserSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function getStudentAccounts(): UserAccount[] {
  return DEMO_ACCOUNTS.filter((acc) => acc.role === 'student');
}
