import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function FacilitiesPage() {
  // DBから施設一覧を取得（訪問ログ数もカウント）
  const facilities = await prisma.facility.findMany({
    include: {
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

      {/* 施設が0件の場合 */}
      {facilities.length === 0 ? (
        <p>登録されている施設がありません。</p>
      ) : (
        /* 施設リスト表示 */
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
              <p>都道府県: {facility.prefecture}</p>
              <p>訪問回数: {facility._count.visits}回</p>

              {/* 詳細画面への遷移ボタン */}
              <div style={{ marginTop: '10px' }}>
                <Link href={`/facilities/${facility.id}`}>
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