import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    prefectureId?: string;
    userId?: string; // userId を受け取れるよう型を追加
  }>;
};

export default async function FacilityDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { prefectureId, userId } = await searchParams ?? {}; 
  const facilityId = Number(id);

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

    // ④ 削除後のリダイレクト先にも userId を引き継ぐ
    const query = new URLSearchParams();
    if (prefectureId) query.set('prefectureId', prefectureId);
    if (userId) query.set('userId', userId);

    const queryString = query.toString();
    const redirectUrl = queryString ? `/facilities?${queryString}` : '/facilities';

    redirect(redirectUrl);
  }

  const buildQuery = (extraParams: Record<string, string | undefined> = {}) => {
    const query = new URLSearchParams();
    if (prefectureId) query.set('prefectureId', prefectureId);
    if (userId) query.set('userId', userId);

    Object.entries(extraParams).forEach(([key, val]) => {
      if (val) query.set(key, val);
    });

    const str = query.toString();
    return str ? `?${str}` : '';
  };

  // ページ遷移用URLの生成（prefectureId と userId を保持）
  const backUrl = `/facilities${buildQuery()}`;
  const editUrl = `/facilities/${facility.id}/edit${buildQuery()}`;
  const newVisitUrl = `/facilities/${facility.id}/visits/new${buildQuery()}`;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 戻る導線 */}
      <div>
        <Link href={backUrl}>
          <button style={{ padding: '5px 10px', cursor: 'pointer', marginBottom: '20px' }}>
            ← 施設一覧に戻る
          </button>
        </Link>

        {/* 施設編集・削除ボタン */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href={editUrl}>
            <button style={{ padding: '5px 10px', cursor: 'pointer' }}>
              編集
            </button>
          </Link>

          <form action={deleteFacility}>
            <button
              type="submit"
              disabled={facility.visits.length > 0}
              style={{
                padding: '5px 10px',
                cursor: facility.visits.length > 0 ? 'not-allowed' : 'pointer',
                backgroundColor: facility.visits.length > 0 ? '#e0e0e0' : '#ffebee',
                color: facility.visits.length > 0 ? '#9e9e9e' : '#c62828',
                border: '1px solid #ef9a9a',
              }}
              title={
                facility.visits.length > 0
                  ? '訪問ログが存在する施設は削除できません'
                  : '施設を削除します'
              }
            >
              🗑️ 削除
            </button>
          </form>
        </div>
      </div>

      {/* 施設基本情報 */}
      <h1>{facility.name}</h1>
      <p><strong>都道府県:</strong> {facility.prefecture.name}</p>

      {facility.address && (
        <p><strong>住所:</strong> {facility.address}</p>
      )}

      {facility.hpUrl && (
        <p>
          <strong>公式HP:</strong>{' '}
          <a href={facility.hpUrl} target="_blank" rel="noopener noreferrer">
            {facility.hpUrl}
          </a>
        </p>
      )}

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
        <Link href={newVisitUrl}>
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
          {facility.visits.map((visit) => {
            // 投稿者本人判定：ログイン中の userId とログ作成者の userId を比較
            const isOwner = userId && Number(userId) === visit.userId;

            return (
              <li
                key={visit.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '15px',
                  marginBottom: '10px',
                  borderRadius: '5px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0 }}>
                    <strong>投稿者:</strong> {visit.user?.name ?? '匿名'} さん
                  </p>

                  {/* 本人の訪問ログのみ「編集する」リンクを表示 */}
                  {isOwner && (
                    <Link
                      href={`/facilities/${facility.id}/visits/${visit.id}/edit${buildQuery()}`}
                      style={{
                        fontSize: '14px',
                        color: '#0070f3',
                        textDecoration: 'underline',
                      }}
                    >
                      編集する
                    </Link>
                  )}
                </div>

                <p style={{ marginTop: '8px' }}>
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

                {/* 訪問画像の表示 */}
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
            );
          })}
        </ul>
      )}
    </main>
  );
}