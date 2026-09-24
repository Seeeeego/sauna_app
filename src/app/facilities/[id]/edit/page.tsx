import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    prefectureId?: string,
  }>;
}

export default async function EditFacilityPage({ params, searchParams }: Props) {
  const { id } = await params;
//   null,undefinedを許容
  const { prefectureId } = await searchParams ?? {};
  const facilityId = Number(id);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  const session = await prisma.session.findUnique({
    where: {id: sessionId}
  });

  if (!session || session.expiresAt < new Date()){
    redirect('/login')
  }

  if (isNaN(facilityId)) {
    notFound();
  }

  // 編集対象の施設データを取得
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
  });

  if (!facility) {
    notFound();
  }

  // 都道府県一覧を DB から取得
  const prefectures = await prisma.prefecture.findMany({
    orderBy: { id: 'asc' },
  });

  // 施設更新処理 (Server Action)
  async function updateFacility(formData: FormData) {
    'use server';

    const actionCookieStore = await cookies();
    const actionSessionId = actionCookieStore.get('session_id')?.value;

    if (!actionSessionId){
      redirect('/login')
    }

    const actionSession = await prisma.session.findUnique({
      where: { id: actionSessionId },
    })

    const name = (formData.get('name') as string)?.trim();
    const prefectureIdStr = formData.get('prefectureId') as string;
    const updatePrefectureId = Number(prefectureIdStr);
    const address = (formData.get('address') as string)?.trim();
    const hpUrl = (formData.get('hpUrl') as string)?.trim();

    if (!name || isNaN(updatePrefectureId)) {
      return;
    }

    // 施設情報を更新
    await prisma.facility.update({
      where: { id: facilityId },
      data: {
        name,
        prefectureId: updatePrefectureId,
        address: address || null,
        hpUrl: hpUrl || null,
      },
    });

    // 編集完了後は詳細画面へリダイレクト
    const redirectUrl = prefectureId
      ? `/facilities/${facilityId}?prefectureId=${prefectureId}`
      : `/facilities/${facilityId}`;

    redirect(redirectUrl);
  }

  // キャンセル（戻る）URL
  const backUrl = prefectureId
    ? `/facilities/${facilityId}?prefectureId=${prefectureId}`
    : `/facilities/${facilityId}`;

  return (
  <main className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-8 font-sans">
    <h1 className="text-2xl font-bold mb-6 text-slate-800">施設情報の編集</h1>

    <form action={updateFacility} className="space-y-4">
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
          defaultValue={facility.name}
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
          defaultValue={facility.prefectureId}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
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
          defaultValue={facility.address ?? ''}
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
          defaultValue={facility.hpUrl ?? ''}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* ボタン領域 */}
      <div className="flex gap-4 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          更新保存する
        </button>
        
        <Link
          href={backUrl}
          className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center"
        >
          キャンセル
        </Link>
      </div>
    </form>
  </main>
);
}