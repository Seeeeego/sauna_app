import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { cookies } from 'next/headers';

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    prefectureId?: string;
  }>;
};

export default async function FacilityDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { prefectureId } = await searchParams ?? {}; 
  const facilityId = Number(id);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    redirect('/login');
  }
  
  const session = await prisma.session.findUnique({
    where: { id: sessionId }
  });

  if (!session || session.expiresAt < new Date()){
    redirect('/login');
  }
  
  // 数値に変換できない場合は 404 画面へ
  if (isNaN(facilityId)) {
    notFound();
  }

  // DBから対象施設と関連する訪問ログ・タグを取得
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: {
      prefecture: true,
      tags: {
        include: { tag: true },
      },
      visits: {
        orderBy: { visitDate: 'desc' },
        include: { images: true, user: true }, 
      },
    },
  });

  // 施設が存在しない場合は 404 画面へ
  if (!facility) {
    notFound();
  }

  // 施設削除処理 (Server Action)
  async function deleteFacility() {
    'use server';

    const actionCookieStore = await cookies();
    const actionSessionId = actionCookieStore.get('session_id')?.value;

    if (!actionSessionId){
      redirect('/login');
    }

    const visitCount = await prisma.visit.count({
      where: { facilityId },
    });

    if (visitCount > 0) {
      console.warn(`施設ID: ${facilityId} は訪問ログが ${visitCount} 件存在するため削除できません。`);
      return;
    }

    await prisma.facility.delete({
      where: { id: facilityId },
    });

    // 削除後のリダイレクト先を構築（prefectureId のみ引き継ぎ）
    const redirectUrl = prefectureId
      ? `/facilities?prefectureId=${prefectureId}`
      : '/facilities';

    redirect(redirectUrl);
  }

  const buildQuery = (extraParams: Record<string, string | undefined> = {}) => {
    const query = new URLSearchParams();
    if (prefectureId) query.set('prefectureId', prefectureId);

    Object.entries(extraParams).forEach(([key, val]) => {
      if (val) query.set(key, val);
    });

    const str = query.toString();
    return str ? `?${str}` : '';
  };

  // ページ遷移用URLの生成（prefectureId を保持）
  const backUrl = `/facilities${buildQuery()}`;
  const editUrl = `/facilities/${facility.id}/edit${buildQuery()}`;
  const newVisitUrl = `/facilities/${facility.id}/visits/new${buildQuery()}`;

  const hasVisits = facility.visits.length > 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 font-sans space-y-8">
      {/* ナビゲーション & 操作ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href={backUrl}
          className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          ← 施設一覧に戻る
        </Link>

        {/* 施設情報編集・削除ボタン群 */}
        <div className="flex items-center gap-3">
          <Link
            href={editUrl}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            編集
          </Link>

          <form action={deleteFacility}>
            <button
              type="submit"
              disabled={hasVisits}
              className={`px-4 py-2 font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                hasVisits
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 cursor-pointer'
              }`}
              title={
                hasVisits
                  ? '訪問ログが存在する施設は削除できません'
                  : '施設を削除します'
              }
            >
              <span>🗑️</span> 削除
            </button>
          </form>
        </div>
      </div>

      {/* 施設基本情報メインカード */}
      <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
              {facility.prefecture.name}
            </span>
            {hasVisits && (
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-md border border-amber-100">
                訪問 {facility.visits.length} 回
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {facility.name}
          </h1>
        </div>

        {/* 詳細メタ情報 */}
        <div className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-100 text-sm text-slate-700">
          {facility.address && (
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-500 min-w-17.5">住所:</span>
              <span>{facility.address}</span>
            </div>
          )}

          {facility.hpUrl && (
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-500 min-w-17.5">公式HP:</span>
              <a
                href={facility.hpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
              >
                {facility.hpUrl}
              </a>
            </div>
          )}

          {facility.tags.length > 0 && (
            <div className="flex items-start gap-2 pt-2">
              <span className="font-bold text-slate-500 min-w-17.5">特徴:</span>
              <div className="flex flex-wrap gap-1.5">
                {facility.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 訪問ログセクション */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            訪問ログ ({facility.visits.length}件)
          </h2>
          <Link
            href={newVisitUrl}
            className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-sm shadow-blue-200"
          >
            <span className="mr-1 text-base">＋</span> 訪問ログを追加
          </Link>
        </div>

        {/* 訪問ログ一覧表示 */}
        {facility.visits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">まだ訪問ログが投稿されていません。</p>
            <p className="text-xs text-slate-400 mt-1">最初の思い出を記録してみましょう！</p>
          </div>
        ) : (
          <div className="space-y-4">
            {facility.visits.map((visit) => {
              const isOwner = session.userId === visit.userId;

              return (
                <article
                  key={visit.id}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4"
                >
                  {/* ヘッダー: 投稿者 & 編集ボタン */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                        {(visit.user?.name ?? '匿')[0]}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">
                        {visit.user?.name ?? '匿名'} さん
                      </span>
                    </div>

                    {isOwner && (
                      <Link
                        href={`/facilities/${facility.id}/visits/${visit.id}/edit${buildQuery()}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        編集する
                      </Link>
                    )}
                  </div>

                  {/* 訪問情報: 日付 & 評価 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div>
                      <span className="font-medium text-slate-500">訪問日: </span>
                      <span className="font-semibold text-slate-800">
                        {new Date(visit.visitDate).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-slate-500">評価: </span>
                      <span className="text-amber-500 tracking-widest text-base">
                        {'★'.repeat(visit.rating)}{'☆'.repeat(5 - visit.rating)}
                      </span>
                      <span className="font-bold text-slate-700 text-xs">
                        ({visit.rating}/5)
                      </span>
                    </div>
                  </div>

                  {/* コメント */}
                  {visit.comment && (
                    <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed">
                      {visit.comment}
                    </p>
                  )}

                  {/* 訪問写真 */}
                  {visit.images && visit.images.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-500 mb-2">訪問写真</p>
                      <div className="flex flex-wrap gap-2">
                        {visit.images.map((image) => (
                          <div
                            key={image.id}
                            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-slate-200/80 shadow-xs"
                          >
                            <Image
                              src={image.imageUrl}
                              alt="訪問写真"
                              fill
                              className="object-cover hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}