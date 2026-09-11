'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export type RegisterState = {
  error?: string;
};

export async function registerAction(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
    // trim()：先頭,末尾の不要な空白を自動で取り除く
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();

  // 入力チェック
  if (!name || !email) {
    return { error: 'ユーザー名とメールアドレスの両方を入力してください。' };
  }

  try {
    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'このメールアドレスは既に登録されています。' };
    }

    // 新規ユーザーを作成
    await prisma.user.create({
      data: {
        name,
        email,
      },
    });

    // 登録成功：登録完了画面へリダイレクト
    redirect('/register/success');
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return { error: 'ユーザー登録処理中にエラーが発生しました。' };
  }
}