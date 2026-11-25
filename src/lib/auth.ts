import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import type { UserAccount } from '../types/curriculum';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

export interface FirebaseIdentity {
  uid: string;
  name: string;
  email: string;
}

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
    email: 'tmashiko@kiryo.ac.jp',
    role: 'teacher',
    classLabel: '数学科 担当',
    initials: '山',
  },
];

const AUTH_STORAGE_KEY = 'mathstep_auth_user_id_v1';

function toIdentity(fbUser: FirebaseUser): FirebaseIdentity {
  const email = fbUser.email ?? '';
  const name = fbUser.displayName || email.split('@')[0] || 'ユーザー';
  return {
    uid: fbUser.uid,
    name,
    email,
  };
}

export async function signInWithGoogleFirebase(): Promise<FirebaseIdentity> {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error('クラウド認証が設定されていません。');
  }
  const cred = await signInWithPopup(auth, googleProvider);
  return toIdentity(cred.user);
}

export async function signOutFirebase(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
  clearUserSession();
}

export function subscribeFirebaseAuth(
  cb: (identity: FirebaseIdentity | null) => void
): () => void {
  if (!isFirebaseConfigured || !auth) {
    return () => {};
  }
  return onAuthStateChanged(auth, (fbUser) => {
    cb(fbUser ? toIdentity(fbUser) : null);
  });
}

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
    // Ignore storage errors
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
