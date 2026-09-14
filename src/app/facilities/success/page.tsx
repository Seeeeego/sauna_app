import Link from 'next/link';
import { redirect } from 'next/navigation';

// クエリパラメータを受け取るための型定義
type SearchParams = Promise<{
  facilityId?: string;   
  prefectureId?: string; 
  userId?: string;       
}>;

export default async function FacilitySuccessPage(props: {
  searchParams: SearchParams
}) {
  // クエリパラメータから各IDを取得
  const searchParams = await props.searchParams;
  const facilityId = searchParams.facilityId;
  const prefectureId = searchParams.prefectureId;
  const userId = searchParams.userId;

  // userIdがない場合はログイン画面へ
  if (!userId) {
    redirect('/');
  }

  // 他の画面に戻るための共通クエリ文字列を構築
  const buildQuery = () => {
    const query = new URLSearchParams();
    if (prefectureId) query.set('prefectureId', prefectureId);
    if (userId) query.set('userId', userId);
    const str = query.toString();
    return str ? `?${str}` : '';
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-6">
        
        {/* メッセージ領域 */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-800">施設登録完了</h1>
          <p className="text-slate-500 text-sm">
            新しい施設が正常に登録されました。
          </p>
        </div>

        {/* ボタン・導線領域 */}
        <div className="space-y-3 pt-2">
          
          {/* 1. 【メイン】登録した施設の詳細画面へ遷移するリンク */}
          {facilityId && (
            <Link 
              href={`/facilities/${facilityId}${buildQuery()}`}
              className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm text-center"
            >
              今登録した施設の詳細を見る
            </Link>
          )}

          {/* 施設一覧に戻るリンク */}
          <Link 
            href={`/facilities${buildQuery()}`}
            className="block w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors text-center"
          >
            施設一覧に戻る
          </Link>

        </div>
      </div>
    </main>
  );
}