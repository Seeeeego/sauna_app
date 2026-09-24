import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

// クエリパラメータを受け取るための型定義
type SearchParams = Promise<{
  facilityId?: string;
  prefectureId?: string;
}>;

export default async function FacilitySuccessPage(props: {
  searchParams: SearchParams;
}) {
  // 1. Cookie から session_id を取得してユーザー認証を行う
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  // DBの session テーブルを参照して有効なセッションか確認
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session || session.expiresAt < new Date()) {
    redirect('/login');
  }

  // 2. クエリパラメータから各IDを取得
  const searchParams = await props.searchParams;
  const facilityId = searchParams.facilityId;
  const prefectureId = searchParams.prefectureId;

  // 都道府県絞り込み条件を引き継ぐクエリ文字列を構築
  const buildQuery = () => {
    if (prefectureId) {
      return `?prefectureId=${prefectureId}`;
    }
    return '';
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center space-y-6">
        
        {/* メッセージ領域 */}
        <div className="space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            ✓
          </div>
          <h1 className="text-2xl font-bold text-slate-800">施設登録完了</h1>
          <p className="text-slate-500 text-sm">
            新しい施設が正常に登録されました。
          </p>
        </div>

        {/* ボタン・導線領域 */}
        <div className="space-y-3 pt-2">
          
          {/* 1. 登録した施設の詳細画面へ遷移するリンク */}
          {facilityId && (
            <Link 
              href={`/facilities/${facilityId}${buildQuery()}`}
              className="block w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-colors shadow-sm text-center"
            >
              今登録した施設の詳細を見る
            </Link>
          )}

          {/* 2. 施設一覧に戻るリンク */}
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