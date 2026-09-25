import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    prefectureId?: string;
  }>;
};

export default async function NewVisitPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { prefectureId } = (await searchParams) ?? {}; 
  const facilityId = Number(id);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId},
  })

  if (!session || session.expiresAt < new Date()){
    redirect('/login')
  }

  if (isNaN(facilityId)){
    notFound()
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
    const imageFile = formData.get('imageFile') as File | null;
    const actionCookieStore = await cookies();
    const actionSessionId = actionCookieStore.get('session_id')?.value;

    if (!actionSessionId){
      redirect('/login')
    }

    const actionSession = await prisma.session.findUnique({
      where: { id: actionSessionId}
    });

    if(!actionSession || actionSession.expiresAt < new Date()){
      redirect('/login')
    }

    const fee = feeStr ? Number(feeStr) : null;

    // 二重チェック
    // -> 画面を介さずデータを送りつけてくる場合を防ぐため
    if ( !visitDate || !rating ) {
      return;
    }

    // 画像ファイルの保存処理（最小限）
    let imageDataUrl: string | null = null;

    if (imageFile && imageFile.size > 0 && imageFile.name !== 'undefined') {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // 例: "data:image/png;base64,iVBORw0KG..." のような文字列を作成
      const base64String = buffer.toString('base64');
      const mimeType = imageFile.type || 'image/jpeg';
      imageDataUrl = `data:${mimeType};base64,${base64String}`;
    }

    // DBへの登録
    await prisma.visit.create({
      data: {
        facilityId,
        userId: actionSession.userId,
        visitDate: new Date(visitDate),
        rating,
        fee: fee,
        comment: comment || null,
        ...(imageDataUrl && {
          images: {
            create: { imageUrl: imageDataUrl },
          },
        }),
      },
    });

    // 完了画面へリダイレクト
    const query = new URLSearchParams();
    if (prefectureId) query.set('prefectureId', prefectureId);
    
    const queryString = query.toString();
    const redirectUrl = queryString
    ? `/facilities/${id}/visits/success?${queryString}`
    : `/facilities/${id}/visits/success`;

    redirect(redirectUrl);
  }

  // クエリ文字列を構築するヘルパー
  const buildQuery = () => {
    if (prefectureId) {
      return `?prefectureId=${prefectureId}`
    }
    return '';
  };

  // 本日の日付（YYYY-MM-DD形式）を初期値用に取得
  const today = new Date().toISOString().split('T')[0];

  return (
  <main className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-8 font-sans">
    <h1 className="text-2xl font-bold mb-6 text-slate-800">
      {facility.name} - 訪問ログを追加
    </h1>

    <form action={createVisit} className="space-y-4">

      {/* 1. 訪問日 */}
      <div>
        <label htmlFor="visitDate" className="block text-sm font-bold text-slate-700 mb-2">
          訪問日
        </label>
        <input
          type="date"
          id="visitDate"
          name="visitDate"
          defaultValue={today}
          required
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* 2. 評価 (1〜5) */}
      <div>
        <label htmlFor="rating" className="block text-sm font-bold text-slate-700 mb-2">
          評価 (1〜5)
        </label>
        <select
          id="rating"
          name="rating"
          defaultValue="5"
          required
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="5">★★★★★ (5)</option>
          <option value="4">★★★★☆ (4)</option>
          <option value="3">★★★☆☆ (3)</option>
          <option value="2">★★☆☆☆ (2)</option>
          <option value="1">★☆☆☆☆ (1)</option>
        </select>
      </div>

      {/* 3. 利用料金 (任意) */}
      <div>
        <label htmlFor="fee" className="block text-sm font-bold text-slate-700 mb-2">
          利用料金 (円) (任意)
        </label>
        <input
          type="number"
          id="fee"
          name="fee"
          placeholder="例: 1500"
          min="0"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* 4. コメント (任意) */}
      <div>
        <label htmlFor="comment" className="block text-sm font-bold text-slate-700 mb-2">
          コメント (任意)
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          placeholder="感想や混雑具合などを入力"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* 5. 画像ファイル (任意) */}
      <div>
        <label htmlFor="imageFile" className="block text-sm font-bold text-slate-700 mb-2">
          画像ファイル (任意)
        </label>
        <input
          type="file"
          id="imageFile"
          name="imageFile"
          accept="image/*"
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </div>

      {/* ボタン領域 */}
      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          保存する
        </button>

        <Link
          href={`/facilities/${id}${buildQuery()}`}
          className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center"
        >
          キャンセル
        </Link>
      </div>
    </form>
  </main>
);
}