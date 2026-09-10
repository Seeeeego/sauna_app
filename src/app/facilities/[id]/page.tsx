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
  }>;
}

export default async function FacilityDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { prefectureId } = await searchParams ?? {};
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

  // 施設削除処理 (Server Action)
  async function deleteFacility() {
    'use server';

    // 1. 施設に紐づく訪問ログの件数をカウント
    const visitCount = await prisma.visit.count({
      where: { facilityId },
    });

    // 2. 訪問ログが1件以上存在する場合は削除をブロックする
    if (visitCount > 0) {
      // ログが存在する場合は削除せず処理を中断
      // ※より丁寧にする場合は、エラーメッセージを画面へ返却・表示させるかクエリで通知する
      console.warn(`施設ID: ${facilityId} は訪問ログが ${visitCount} 件存在するため削除できません。`);
      return;
    }

    // 3. 訪問ログが 0 件の場合のみ削除を実行
    await prisma.facility.delete({
      where: { id: facilityId },
    });

    // 削除後は一覧画面へリダイレクト
    const redirectUrl = prefectureId
      ? `/facilities?prefectureId=${prefectureId}`
      : '/facilities';

    redirect(redirectUrl);
  }

  // ページ遷移する際にprefectureIdを持たせる
  const backUrl = prefectureId
  ? `/facilities?prefectureId=${prefectureId}` : '/facilities';

  // 編集画面へ遷移するURL（prefectureIdを引き継ぐ）
  const editUrl = prefectureId
    ? `/facilities/${facility.id}/edit?prefectureId=${prefectureId}`
    : `/facilities/${facility.id}/edit`;

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 戻る導線 */}
      <div>
        <Link href= {backUrl}>
          <button style={{ padding: '5px 10px', cursor: 'pointer', marginBottom: '20px' }}>
            ← 施設一覧に戻る
          </button>
        </Link>

        {/* 編集ボタン */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href={editUrl}>
            <button style={{ padding: '5px 10px', cursor: 'pointer' }}>
              編集
            </button>
          </Link>
          
          {/* 削除ボタンの箇所 */}
      <form action={deleteFacility}>
        <button
          type="submit"
          /* ログが存在する場合はUI上でボタンを押せない */
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