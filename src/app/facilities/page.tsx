import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// クエリパラメータを受け取るための型定義
type SearchParams = Promise<{
  prefectureId?: string;
}>;

export default async function FacilitiesPage(props: {
  searchParams: SearchParams;
}) {
  // 1. Cookie から session_id を取得してユーザー認証を行う
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  // DBの session テーブルを参照して有効なセッションか確認
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.expiresAt < new Date()) {
    redirect('/login');
  }

  // 2. クエリパラメータから prefectureId を取得
  const searchParams = await props.searchParams;
  const prefectureIdParam = searchParams.prefectureId;

  // URLから受け取る値は数値型に変換する
  const prefectureId = prefectureIdParam ? Number(prefectureIdParam) : NaN;

  // 3. 都道府県一覧を取得（ドロップダウン用）
  const prefectures = await prisma.prefecture.findMany({
    orderBy: { id: 'asc' },
  });

  // 4. DBから施設一覧を取得（prefecture リレーションと訪問回数のカウントを含める）
  const facilities = await prisma.facility.findMany({
    where: !isNaN(prefectureId) ? { prefectureId } : undefined,
    include: {
      prefecture: true,
      _count: {
        select: { visits: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // prefectureId のみを保持したクエリ文字列を作成するヘルパー
  const buildQuery = () => {
    if (!isNaN(prefectureId)) {
      return `?prefectureId=${prefectureId}`;
    }
    return '';
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 font-sans">
      {/* ヘッダーエリア */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            温泉施設一覧
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            登録されている温泉施設の閲覧・編集ができます
          </p>
        </div>

        {/* ナビゲーションボタン群 */}
        <div className="flex items-center gap-3">
          <Link
            href={`/top${buildQuery()}`}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            ← トップへ戻る
          </Link>

          <Link
            href={`/facilities/new${buildQuery()}`}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
          >
            <span className="mr-1 text-base">＋</span> 施設を追加
          </Link>
        </div>
      </div>

      {/* 検索・絞り込みカード */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-8">
        <form action="/facilities" method="GET" className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <label htmlFor="prefectureId" className="text-sm font-bold text-slate-700 whitespace-nowrap">
            エリアで絞り込み
          </label>
          <div className="flex-1 flex gap-2">
            <select
              id="prefectureId"
              name="prefectureId"
              defaultValue={!isNaN(prefectureId) ? String(prefectureId) : ''}
              className="w-full sm:w-64 p-2.5 bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
            >
              <option value="">すべての都道府県</option>
              {prefectures.map((pref) => (
                <option key={pref.id} value={pref.id}>
                  {pref.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-all shadow-sm whitespace-nowrap cursor-pointer"
            >
              検索
            </button>
          </div>
        </form>
      </div>

      {/* 施設一覧コンテンツ */}
      {facilities.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">該当する施設が見つかりませんでした。</p>
          <p className="text-xs text-slate-400 mt-1">条件を変更するか、新しい施設を登録してください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {facilities.map((facility) => (
            <div
              key={facility.id}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* バッジ・メタ情報 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-100">
                    {facility.prefecture.name}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                    訪問 {facility._count.visits} 回
                  </span>
                </div>

                {/* 施設名 */}
                <h2 className="text-xl font-bold text-slate-900 tracking-tight line-clamp-1 mb-2">
                  {facility.name}
                </h2>
              </div>

              {/* 詳細リンクボタン */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                <Link
                  href={`/facilities/${facility.id}${buildQuery()}`}
                  className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 group transition-colors"
                >
                  詳細を見る
                  <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}