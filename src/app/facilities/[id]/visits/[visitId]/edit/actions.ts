'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function updateVisitAction(formData: FormData) {
  const visitId = Number(formData.get('visitId'));
  const userId = Number(formData.get('userId'));
  const facilityId = formData.get('facilityId') as string;
  const prefectureId = formData.get('prefectureId') as string;

  // 1. 各フィールドを FormData から取得
  const visitDateStr = formData.get('visitDate') as string;
  const ratingStr = formData.get('rating') as string;
  const feeStr = formData.get('fee') as string;
  const comment = (formData.get('comment') as string)?.trim();

  // 2. 数値・日付等の型変換
  const visitDate = visitDateStr ? new Date(visitDateStr) : new Date();
  const rating = Number(ratingStr);
  const fee = feeStr ? Number(feeStr) : null;

  // 基本チェック
  if (!visitId || !userId || isNaN(rating)) {
    return;
  }

  const buildRedirectQuery = () => {
    const query = new URLSearchParams();
    query.set('userId', String(userId));
    if (prefectureId) query.set('prefectureId', prefectureId);
    return query.toString();
  };

  try {
    // 本人確認
    const visitLog = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visitLog || visitLog.userId !== userId) {
      redirect(`/`);
    }

    // 3. すべての項目を DB に反映（update に渡す data を拡張）
    await prisma.visit.update({
      where: { id: visitId },
      data: {
        visitDate,
        rating,
        fee,
        comment: comment || null,
      },
    });

    // リダイレクト
    redirect(`/facilities/${facilityId}?${buildRedirectQuery()}`);
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('更新エラー:', error);
  }
}