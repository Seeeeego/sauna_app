'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function updateVisitAction(formData: FormData) {

  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if(!sessionId){
    redirect('/login');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId},
  })

  if (!session || session.expiresAt < new Date()){
    redirect('/login');
  }

  const visitId = Number(formData.get('visitId'));
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
  if (!visitId || isNaN(rating)) {
    return;
  }

  try {
    // 本人確認
    const visitLog = await prisma.visit.findUnique({
      where: { id: visitId },
    });

    if (!visitLog || visitLog.userId !== session.userId) {
      redirect(`/facilities/${facilityId}`);
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

    // リダイレクト URL の構築（prefectureId のみ保持）
  const query = new URLSearchParams();
  if (prefectureId) query.set('prefectureId', prefectureId);

  const queryString = query.toString();
  const redirectUrl = queryString
    ? `/facilities/${facilityId}?${queryString}`
    : `/facilities/${facilityId}`;

  redirect(redirectUrl);
  } catch (error) {
    if ((error as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('更新エラー:', error);
  }
}