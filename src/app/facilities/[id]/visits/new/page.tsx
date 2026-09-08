import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewVisitPage({ params }: Props) {
  const { id } = await params;

  // 対象の施設が存在するか確認
  const facility = await prisma.facility.findUnique({
    where: { id :Number(id) },
  });

  if (!facility) {
    notFound();
  }

  // Server Action: 訪問ログの保存処理
  async function createVisit(formData: FormData) {
    'use server';

    const visitDate = formData.get('visitDate') as string;
    const rating = Number(formData.get('rating'));
    const comment = formData.get('comment') as string;

    if (!visitDate || !rating) {
      return;
    }

    await prisma.visit.create({
      data: {
        facilityId: Number(id),
        userId: 1,
        visitDate: new Date(visitDate),
        rating: rating,
        comment: comment || null,
      },
    });

    // 登録完了後、施設詳細画面へリダイレクト
    redirect(`/facilities/${id}`);
  }

  // 本日の日付（YYYY-MM-DD形式）を初期値用に取得
  const today = new Date().toISOString().split('T')[0];

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {/* 戻るボタン */}
      <div>
        <Link href={`/facilities/${id}`}>
          <button style={{ padding: '5px 10px', cursor: 'pointer', marginBottom: '20px' }}>
            ← 施設詳細に戻る
          </button>
        </Link>
      </div>

      <h1>{facility.name} - 訪問ログを追加</h1>

      {/* フォーム領域 */}
      <form action={createVisit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>
        
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

        {/* 送信ボタン */}
        <div>
          <button type="submit" style={{ padding: '10px 15px', cursor: 'pointer' }}>
            訪問ログを保存する
          </button>
        </div>

      </form>
    </main>
  );
}