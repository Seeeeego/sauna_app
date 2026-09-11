import { redirect } from 'next/navigation';
import JapanMap from '@/components/JapanMap';
import { prisma } from '@/lib/prisma';

type Props = {
  searchParams?: Promise<{
    userId?: string;
  }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { userId } = await searchParams ?? {};

  if (!userId) {
    redirect('/');
  }

  // DBから都道府県データ（id, name）を全件取得
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

        {/* 3. JapanMap に userId を渡す */}
        <JapanMap prefectures={prefectures} userId={userId} />
      </div>
    </main>
  );
}