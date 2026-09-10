import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchparams?: Promise<{
    prefectureId?: string;
  }>;
}

export default async function FacilityDetailPage({ params, searchparams }: Props) {
  const { id } = await params;
  const { prefectureId } = await searchparams ?? {};
  const facilityId = Number(id);

  // 数値に変換できない場合は 404 画面へ
  if (isNaN(facilityId)) {
    notFound();
  }

  // DBから対象施設と関連する訪問ログ・タグを取得
  const facility = await prisma.facility.findUnique({
    where: { id :Number(id) },
    include: {
      prefecture: true,
      tags: {
        include: { tag: true },
      },
      visits: {
        orderBy: { visitDate: 'desc' },
        include: { images: true, }
      },
    },
  });

  // 施設が存在しない場合は 404 画面へ
  if (!facility) {
    notFound();
  }

  // 
  const backUrl = prefectureId
  ? `/facilities?prefectureId=${prefectureId}` : '/facilities';

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 戻る導線 */}
      <div>
        <Link href= {backUrl}>
          <button style={{ padding: '5px 10px', cursor: 'pointer', marginBottom: '20px' }}>
            ← 施設一覧に戻る
          </button>
        </Link>
      </div>

      {/* 施設基本情報 */}
      <h1>{facility.name}</h1>
      <p><strong>都道府県:</strong> {facility.prefecture.name}</p>

      {/* 詳細な住所（任意項目のため存在時のみ表示） */}
      {facility.address && (
        <p><strong>住所:</strong> {facility.address}</p>
      )}

      {/* ホームページURL（任意項目のため存在時のみ表示） */}
      {facility.hpUrl && (
        <p>
          <strong>公式HP:</strong>{' '}
          <a href={facility.hpUrl} target="_blank" rel="noopener noreferrer">
            {facility.hpUrl}
          </a>
        </p>
      )}
      
      {/* タグ一覧 */}
      {facility.tags.length > 0 && (
        <p>
          <strong>特徴タグ:</strong>{' '}
          {facility.tags.map(({ tag }) => `#${tag.name}`).join(' ')}
        </p>
      )}

      <hr style={{ margin: '20px 0' }} />

      {/* 訪問ログヘッダーと新規ログ追加ボタン */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>訪問ログ ({facility.visits.length}件)</h2>
        <Link href={`/facilities/${facility.id}/visits/new`}>
          <button style={{ padding: '8px 12px', cursor: 'pointer' }}>
            ＋ この施設の訪問ログを追加
          </button>
        </Link>
      </div>

      {/* 訪問ログ一覧 */}
      {facility.visits.length === 0 ? (
        <p>まだ訪問ログがありません。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {facility.visits.map((visit) => (
            <li
              key={visit.id}
              style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '5px',
              }}
            >
              <p>
                <strong>訪問日:</strong>{' '}
                {new Date(visit.visitDate).toLocaleDateString('ja-JP')}
              </p>
              <p>
                <strong>評価:</strong> {'★'.repeat(visit.rating)} ({visit.rating} / 5)
              </p>
              {visit.comment && (
                <p>
                  <strong>コメント:</strong> {visit.comment}
                </p>
              )}

              {/*  訪問画像の表示 */}
              {visit.images && visit.images.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <strong>画像:</strong>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {visit.images.map((image) => (
                      <Image
                      key={image.id}
                      src={image.imageUrl}
                      alt="訪問写真"
                      width={120}
                      height={120}
                      style={{
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #eee',
                      }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}