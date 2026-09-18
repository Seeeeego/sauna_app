import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import JapanMap from '@/components/JapanMap';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  // 1. Cookie から session_id を取得
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) {
    redirect('/login');
  }

  // 2. DB の session テーブルを参照して有効なユーザーとセッションかを判定
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  // セッションが存在しない、または有効期限切れの場合はログイン画面へリダイレクト
  if (!session || session.expiresAt < new Date()) {
    redirect('/login');
  }

  // 3. DB から都道府県データを全件取得
  const prefectures = await prisma.prefecture.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { id: 'asc' },
  });

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            温泉・サウナログ
          </h1>
          <p className="text-slate-600">
            行った温泉・サウナの記録とマップでの視覚化アプリ
          </p>
        </header>

        {/* JapanMap に userId を渡す必要はなくなりました */}
        <JapanMap prefectures={prefectures} />
      </div>
    </main>
  );
}