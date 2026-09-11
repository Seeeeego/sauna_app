import Link from 'next/link';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    prefectureId?: string;
    userId?: string;
  }>;
}

export default async function VisitSuccessPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { prefectureId, userId } = (await searchParams) ?? {};

  // 未ログイン（userIdがない）場合はログイン画面へリダイレクト
  if (!userId) {
    redirect('/');
  }

  // クエリ文字列を構築するヘルパー
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

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-6">
        {/* アイコン & タイトル */}
        <div className="space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
            ♨️
          </div>
          <h1 className="text-2xl font-bold text-slate-800">訪問ログを保存しました</h1>
          <p className="text-slate-500 text-sm">
            訪問記録の登録が正常に完了しました。
          </p>
        </div>

        {/* 導線ボタン群 */}
        <div className="space-y-3 pt-2">
          {/* 施設詳細に戻る */}
          <Link
            href={`/facilities/${id}${buildQuery()}`}
            className="block w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm text-center"
          >
            ← 施設詳細に戻る
          </Link>

          {/* トップ画面（マップ）へ戻る */}
          <Link
            href={`/top${buildQuery()}`}
            className="block w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors text-center"
          >
            トップ画面（マップ）へ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}