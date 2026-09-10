import Link from 'next/link';
import { prisma } from '@/lib/prisma';

// クエリパラメータを受け取るための型定義
type SearchParams = Promise<{
  prefectureId?: string;
}>;

export default async function FacilitiesPage(props: {
  searchParams: SearchParams;
}) {
  // 1. クエリパラメータから prefectureId を取得
  const searchParams = await props.searchParams;
  const prefectureIdParam = searchParams.prefectureId;
  // urlから受け取る値は文字列のため数値型に変換する 
  // -> 値が存在しないor数値に変換ができない場合は NaNに
  const prefectureId = prefectureIdParam ? Number(prefectureIdParam) : NaN;

  // 2. 都道府県一覧を取得（ドロップダウン用）
  const prefectures = await prisma.prefecture.findMany({
    orderBy: { id: 'asc' },
  });

  // 3. DBから施設一覧を取得（prefecture リレーションと訪問回数のカウントを含める）
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

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 画面ヘッダーと新規追加ボタン */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>施設一覧</h1>
        <Link href="/facilities/new">
          <button style={{ padding: '10px 15px', cursor: 'pointer' }}>
            ＋ 新規施設を追加
          </button>
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
          <button type="submit" style={{ padding: '5px 10px', cursor: 'pointer' }}>
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
                <Link href={
                prefectureId
                  ? `/facilities/${facility.id}?prefectureId=${prefectureId}`
                  : `/facilities/${facility.id}`
              }>
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