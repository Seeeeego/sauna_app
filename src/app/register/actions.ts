'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export type RegisterState = {
  error?: string;
};

export async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();

  // 1. 入力チェック
  if (!name || !email || !password) {
    return { error: '名前、メールアドレス、パスワードのすべてを入力してください。' };
  }

  if (password.length < 8) {
    return { error: 'パスワードは8文字以上で入力してください。' };
  }

  try {
    // 2. メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'このメールアドレスは既に登録されています。' };
    }

    // 3. パスワードのハッシュ化 (現代の標準であるラウンド数 12 を指定)
    // -> 現状テストの場合なので10に設定
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. 新規ユーザーを作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 5. セッション作成 (有効期限: 7日間)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
      },
    });

    // 6. Cookie にセッションIDを設定して自動ログイン状態にする
    const cookieStore = await cookies();
    cookieStore.set('session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    // 7. 登録・ログイン完了後のリダイレクト
    redirect('/register/success');
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return { error: 'ユーザー登録処理中にエラーが発生しました。' };
  }
}