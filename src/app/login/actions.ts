'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export type LoginState = {
  error?: string;
};

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();

  // 1. バリデーションチェック
  if (!name || !email || !password) {
    return { error: '名前、メールアドレス、パスワードをすべて入力してください。' };
  }

  // 2. DBから名前とメールアドレスの両方が一致するユーザーを取得
  const user = await prisma.user.findFirst({
    where: {
      name,
      email,
    },
  });

  if (!user) {
    return { error: '入力されたユーザー情報が見つかりません。' };
  }

  // 3. パスワードのハッシュ照合
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return { error: 'パスワードが正しくありません。' };
  }

  // 4. DBにセッションを作成 (有効期限: 7日間)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      expiresAt,
    },
  });

  // 5. Cookie にセッションIDを保存
  const cookieStore = await cookies();
  cookieStore.set('session_id', session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  // 6. ログイン成功後のリダイレクト
  redirect('/top');
}