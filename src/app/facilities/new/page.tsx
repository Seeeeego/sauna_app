import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// クエリパラメータを受け取るための型定義
type SearchParams = Promise<{
  prefectureId?: string;
  userId?: string; 
}>;

export default async function NewFacilityPage(props: {
  searchParams: SearchParams;
}) {

   // クエリパラメータから prefectureId と userId を取得
  const searchParams = await props.searchParams;
  const prefectureIdParam = searchParams.prefectureId;
  const userId = searchParams.userId; 

  if (!userId) {
    redirect('/');
  }

  // 都道府県一覧を DB から取得
  const prefectures = await prisma.prefecture.findMany({
    orderBy: { id: 'asc' },
  });

  // 施設登録処理
  async function createFacility(formData: FormData) {
    'use server';

    const name = formData.get('name') as string;
    const prefectureIdStr = formData.get('prefectureId') as string;
    const prefectureId = Number(prefectureIdStr);
    const address = formData.get('address') as string;
    const hpUrl = formData.get('hpUrl') as string;

    if (!name || isNaN(prefectureId)) {
      return;
    }

    /// ★ フォームから送られた userId を取得
    const currentUserIdStr = formData.get('userId') as string;
    const currentUserId = Number(currentUserIdStr);

    if (!name || isNaN(prefectureId) || isNaN(currentUserId)) {
      return;
    }

    // 新規施設を作成
    const newFacility = await prisma.facility.create({
      data: {
        name,
        prefectureId,
        address: address || null,
        hpUrl: hpUrl || null,
        userId: currentUserId,
      },
    });

    // 次の完了画面へ引き継ぐクエリパラメータを構築
    const query = new URLSearchParams();
    query.set('facilityId', String(newFacility.id)); // 新しい施設のID
    if (userId) query.set('userId', userId);
    // フォームで今選んだ都道府県、またはURLに元々あった都道府県をセット
    query.set('prefectureId', String(prefectureId) || prefectureIdParam || '');

    // 完了画面へリダイレクト
    redirect(`/facilities/success?${query.toString()}`);
  }
  
  // 「← 施設一覧に戻る」ボタン用のクエリ文字列
  const buildQuery = () => {
    const query = new URLSearchParams();
    if (prefectureIdParam) query.set('prefectureId', prefectureIdParam);
    if (userId) query.set('userId', userId);
    const str = query.toString();
    return str ? `?${str}` : '';
  };
  return (
    <main className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">新規施設登録</h1>

      <form action={createFacility} className="space-y-4">
        <input type="hidden" name="userId" value={userId ?? ''} />
        {/* 施設名 */}
        <div>
          <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-2">
            施設名
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="例: かるまる池袋"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* 都道府県 */}
        <div>
          <label htmlFor="prefectureId" className="block text-sm font-bold text-slate-700 mb-2">
            都道府県
          </label>
          <select
            id="prefectureId"
            name="prefectureId"
            required
            defaultValue={prefectureIdParam ?? ''}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="" disabled>
              選択してください
            </option>
            {prefectures.map((pref) => (
              <option key={pref.id} value={pref.id}>
                {pref.name}
              </option>
            ))}
          </select>
        </div>

        {/* 詳細な住所（任意） */}
        <div>
          <label htmlFor="address" className="block text-sm font-bold text-slate-700 mb-2">
            詳細な住所 (任意)
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="例: 豊島区池袋2-7-7"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* ホームページURL（任意） */}
        <div>
          <label htmlFor="hpUrl" className="block text-sm font-bold text-slate-700 mb-2">
            ホームページURL (任意)
          </label>
          <input
            type="url"
            id="hpUrl"
            name="hpUrl"
            placeholder="https://example.com"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* ボタン領域 */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            登録する
          </button>

          <Link
            href={`/facilities${buildQuery()}`}
            className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </main>
  );
}