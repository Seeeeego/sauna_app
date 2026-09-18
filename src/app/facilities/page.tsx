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

  // urlから受け取る値は数値型に変換する
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
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 画面ヘッダーと新規追加ボタン */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
          施設一覧
        </h1>

        <Link
          href={`/facilities/new${buildQuery()}`}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-1"
        >
          <span>＋</span> 新規施設を追加
        </Link>
      </div>

      {/* 都道府県絞り込みフォーム */}
      <div style={{ marginBottom: '20px' }}>
        <form action="/facilities" method="GET">
          <label htmlFor="prefectureId" style={{ marginRight: '8px' }}>都道府県で絞り込み:</label>
          <select
            id="prefectureId"
            name="prefectureId"
            defaultValue={!isNaN(prefectureId) ? String(prefectureId) : ''}
            style={{ padding: '5px', marginRight: '8px' }}
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
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-1.5 px-4 
            rounded-lg shadow-sm transition-colors text-sm cursor-pointer"
          >
            絞り込む
          </button>
        </form>
      </div>

      {/* 施設が0件の場合 */}
      {facilities.length === 0 ? (
        <p>登録されている施設がありません。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {facilities.map((facility) => (
            <li
              key={facility.id}
              style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '5px',
              }}
            >
              <h2>{facility.name}</h2>
              <p>都道府県: {facility.prefecture.name}</p>
              <p>訪問回数: {facility._count.visits}回</p>

              {/* 詳細画面への遷移ボタン */}
              <div style={{ marginTop: '10px' }}>
                <Link href={`/facilities/${facility.id}${buildQuery()}`}>
                  <button style={{ padding: '5px 10px', cursor: 'pointer' }}>
                    詳細を見る →
                  </button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}