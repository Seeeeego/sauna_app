import { redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { updateVisitAction } from './actions';

interface Props {
  params: Promise<{
    id: string;        // 施設ID
    visitId: string;   // 訪問ログID
  }>;
  searchParams?: Promise<{
    prefectureId?: string; // 都道府県ID
    userId?: string;       // ユーザーID
  }>;
}

export default async function EditVisitPage({ params, searchParams }: Props) {
  const { id: facilityId, visitId } = await params;
  const { prefectureId, userId } = (await searchParams) ?? {};

  // 未ログインの場合はログイン画面へ
  if (!userId) {
    redirect('/');
  }

  // クエリ文字列を構築するヘルパー関数
  //   何も渡されなかった場合は,{}を返す
  const buildQuery = (extraParams: Record<string, string | undefined> = {}) => {
    // URLSearchParams オブジェクトを作成
    // ->自動で正しいurlの形を整形してくれる(&,=など)
    const query = new URLSearchParams();
    // prefectureId,userIdが存在する場合のみqueryに追加する
    if (prefectureId) query.set('prefectureId', prefectureId);
    if (userId) query.set('userId', userId);

    // 引数で渡されたもの(extraParams)をforEachで展開し,
    // 値があるものだけをクエリに追加している
    Object.entries(extraParams).forEach(([key, val]) => {
      if (val) query.set(key, val);
    });

    const str = query.toString();
    // strに値があれば先頭に?をつけないなら空文字で返す
    return str ? `?${str}` : '';
  };

  // 戻り先URL（施設詳細画面）の定義
  const backUrl = `/facilities/${facilityId}${buildQuery()}`;

  // 対象の訪問ログを取得
  const visitLog = await prisma.visit.findUnique({
    where: { id: Number(visitId) },
  });

  // ログが存在しない、または作成者でない場合は施設詳細画面へ返す
  if (!visitLog || visitLog.userId !== Number(userId)) {
    redirect(backUrl);
  }

  // 本日の日付（YYYY-MM-DD形式）を初期値用に取得
  const today = new Date().toISOString().split('T')[0];

  return (
    <main className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-8 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">訪問ログの編集</h1>

      {/* action に Server Action 関数を直接渡す */}
      <form action={updateVisitAction} className="space-y-4">
        {/* 送信に必要な情報を hidden で保持 */}
        <input type="hidden" name="visitId" value={visitLog.id} />
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="facilityId" value={facilityId} />
        {prefectureId && <input type="hidden" name="prefectureId" value={prefectureId} />}

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
            // foucs:入力中,選択中のスタイル
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
            defaultValue={String(visitLog.rating)}
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
            defaultValue={visitLog.fee ?? ''}
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
            defaultValue={visitLog.comment ?? ''}
            placeholder="感想や混雑具合などを入力"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            更新する
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