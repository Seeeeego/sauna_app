import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    prefectureId?: string;
  }>;
}

export default async function EditFacilityPage({ params, searchParams }: Props) {
  const { id } = await params;
//   null,undefinedを許容
  const { prefectureId } = await searchParams ?? {};
  const facilityId = Number(id);

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

    const name = formData.get('name') as string;
    const prefectureIdStr = formData.get('prefectureId') as string;
    const updatePrefectureId = Number(prefectureIdStr);
    const address = formData.get('address') as string;
    const hpUrl = formData.get('hpUrl') as string;

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
    <main style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <p>
        <Link href={backUrl}>← 施設詳細に戻る</Link>
      </p>

      <h1>施設情報の編集</h1>

      <form action={updateFacility}>
        <div>
          <label htmlFor="name">施設名: </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            defaultValue={facility.name}
          />
        </div>

        <br />

        <div>
          <label htmlFor="prefectureId">都道府県: </label>
          <select
            id="prefectureId"
            name="prefectureId"
            required
            defaultValue={facility.prefectureId}
          >
            {prefectures.map((pref) => (
              <option key={pref.id} value={pref.id}>
                {pref.name}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label htmlFor="address">詳細な住所（任意）: </label>
          <input
            type="text"
            id="address"
            name="address"
            defaultValue={facility.address ?? ''}
          />
        </div>

        <br />

        <div>
          <label htmlFor="hpUrl">ホームページURL（任意）: </label>
          <input
            type="url"
            id="hpUrl"
            name="hpUrl"
            defaultValue={facility.hpUrl ?? ''}
          />
        </div>

        <br />

        <button type="submit">更新保存する</button>
      </form>
    </main>
  );
}