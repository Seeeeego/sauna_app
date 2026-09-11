'use server';

import { redirect } from 'next/navigation';
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

  if (!name || !email) {
    return { error: 'ユーザー名とメールアドレスの両方を入力してください。' };
  }

  // DBから一致するユーザーを検索
  const user = await prisma.user.findFirst({
    where: {
      name,
      email,
    },
  });

  if (!user) {
    return { error: 'ユーザー名またはメールアドレスが一致しません。' };
  }

  // ログイン成功：URLクエリパラメータに userId を付与してトップページへリダイレクト
  redirect(`/top?userId=${user.id}`);
}