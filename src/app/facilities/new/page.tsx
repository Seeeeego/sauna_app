import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function NewFacilityPage() {

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

    if (!name || isNaN(prefectureId)) {
      return;
    }

    // DBからデフォルトのユーザーを取得（作成者の紐付け用）
    const defaultUser = await prisma.user.findFirst();

    if (!defaultUser) {
      throw new Error('ユーザーが存在しません。先に seed を実行してください。');
    }

    // 新規施設を作成
    await prisma.facility.create({
      data: {
        name,
        prefectureId,
        // createdBy または userId に取得したユーザーの ID を設定
        // ※スキーマの定義名に合わせて選択（どちらか一方）
        userId: defaultUser.id, 
      },
    });

    // 遷移図: C --> |登録完了| E (登録完了画面へ)
    redirect(`/facilities/success`);
  }

  return (
    <main>
      <p>
        <Link href="/facilities">← 施設一覧に戻る</Link>
      </p>

      <h1>新規施設登録</h1>

      <form action={createFacility}>
        <div>
          <label htmlFor="name">施設名: </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            placeholder="例: かるまる池袋"
          />
        </div>

        <br />

        <div>
          <label htmlFor="prefectureId">都道府県: </label>
          <select id="prefectureId" name="prefectureId" required defaultValue="">
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

        <br />

        <button type="submit">施設を登録する</button>
      </form>
    </main>
  );
}