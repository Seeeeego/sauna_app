import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    prefectureId?: string;
    userId?: string; 
  }>;
};

export default async function NewVisitPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { prefectureId, userId } = (await searchParams) ?? {}; 
  const facilityId = Number(id);

  if (!userId) {
    redirect('/');
  }

  // 対象の施設が存在するか確認
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
  });

  if (!facility) {
    notFound();
  }

  // Server Action: 訪問ログの保存処理
  async function createVisit(formData: FormData) {
    'use server';

    const visitDate = formData.get('visitDate') as string;
    const rating = Number(formData.get('rating'));
    const feeStr = formData.get('fee') as string;
    const comment = (formData.get('comment') as string)?.trim(); 
    const imageUrl = (formData.get('imageUrl') as string)?.trim();
    const actionUserId = Number(formData.get('userId')); // hiddenからuserIdを取得

    const fee = feeStr ? Number(feeStr) : null;

    if (!visitDate || !rating || !actionUserId) {
      return;
    }

    // DB上のユーザーが存在するか確認（不正なuserId改ざんのチェック）
    const user = await prisma.user.findUnique({
      where: { id: actionUserId },
    });

    if (!user) {
      throw new Error('ユーザーが存在しません。');
    }

    // Visit の作成（送られてきた userId を指定）
    await prisma.visit.create({
      data: {
        facilityId,
        userId: actionUserId, 
        visitDate: new Date(visitDate),
        rating,
        fee,
        comment: comment || null,
        ...(imageUrl && {
          images: {
            create: {
              imageUrl,
            },
          },
        }),
      },
    });

    // 完了画面へリダイレクト
    const query = new URLSearchParams();
    if (prefectureId) query.set('prefectureId', prefectureId);
    query.set('userId', String(actionUserId));

    redirect(`/facilities/${id}/visits/success?${query.toString()}`);
  }

  // クエリ文字列を構築するヘルパー
  const buildQuery = () => {
    const query = new URLSearchParams();
    if (prefectureId) query.set('prefectureId', prefectureId);
    if (userId) query.set('userId', userId);
    const str = query.toString();
    return str ? `?${str}` : '';
  };

  // 本日の日付（YYYY-MM-DD形式）を初期値用に取得
  const today = new Date().toISOString().split('T')[0];

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 戻るボタン */}
      <div>
        <Link href={`/facilities/${id}${buildQuery()}`}>
          <button style={{ padding: '5px 10px', cursor: 'pointer', marginBottom: '20px' }}>
            ← 施設詳細に戻る
          </button>
        </Link>
      </div>

      <h1>{facility.name} - 訪問ログを追加</h1>

      {/* フォーム領域 */}
      <form action={createVisit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        
        {/* Server Action に userId を渡すための hidden input */}
        <input type="hidden" name="userId" value={userId} />

        {/* 訪問日 */}
        <div>
          <label htmlFor="visitDate" style={{ display: 'block', fontWeight: 'bold' }}>
            訪問日:
          </label>
          <input
            type="date"
            id="visitDate"
            name="visitDate"
            defaultValue={today}
            required
            style={{ width: '100%', padding: '5px' }}
          />
        </div>

        {/* 評価 (1〜5) */}
        <div>
          <label htmlFor="rating" style={{ display: 'block', fontWeight: 'bold' }}>
            評価 (1〜5):
          </label>
          <select
            id="rating"
            name="rating"
            defaultValue="5"
            required
            style={{ width: '100%', padding: '5px' }}
          >
            <option value="5">★★★★★ (5)</option>
            <option value="4">★★★★☆ (4)</option>
            <option value="3">★★★☆☆ (3)</option>
            <option value="2">★★☆☆☆ (2)</option>
            <option value="1">★☆☆☆☆ (1)</option>
          </select>
        </div>

        {/* 利用料金 (任意) */}
        <div>
          <label htmlFor="fee" style={{ display: 'block', fontWeight: 'bold' }}>
            利用料金 (円) (任意):
          </label>
          <input
            type="number"
            id="fee"
            name="fee"
            placeholder="例: 1500"
            min="0"
            style={{ width: '100%', padding: '5px' }}
          />
        </div>

        {/* コメント */}
        <div>
          <label htmlFor="comment" style={{ display: 'block', fontWeight: 'bold' }}>
            コメント (任意):
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={4}
            placeholder="感想や混雑具合などを入力"
            style={{ width: '100%', padding: '5px' }}
          />
        </div>

        {/* 画像URL (任意) */}
        <div>
          <label htmlFor="imageUrl" style={{ display: 'block', fontWeight: 'bold' }}>
            画像URL (任意):
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            placeholder="https://example.com/image.jpg"
            style={{ width: '100%', padding: '5px' }}
          />
        </div>

        {/* 送信ボタン */}
        <div>
          <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>
            保存する
          </button>
        </div>

      </form>
    </main>
  );
}