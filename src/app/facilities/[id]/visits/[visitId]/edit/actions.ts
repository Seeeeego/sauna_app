'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function updateVisitAction(formData: FormData) {
  const visitId = Number(formData.get('visitId'));
  const userId = Number(formData.get('userId'));
  const facilityId = formData.get('facilityId') as string;
  const comment = (formData.get('comment') as string)?.trim();

  // 基本チェック
  if (!visitId || !userId || !comment) {
    return;
  }

  try {
    // 本人確認：DB上の訪問ログ所有者と送信された userId を照合
    const visitLog = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visitLog || visitLog.userId !== userId) {
      // 本人でない場合はそのまま一覧画面へ戻す
      redirect(`/facilities/${facilityId}/visits?userId=${userId}`);
    }

    // 更新実行
    await prisma.visit.update({
      where: { id: visitId },
      data: { comment },
    });

    // 更新後、訪問ログ一覧へリダイレクト
    redirect(`/facilities/${facilityId}/visits?userId=${userId}`);
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('更新エラー:', error);
  }
}