import JapanMap from '@/components/JapanMap';

export default function HomePage() {
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

        {/* 日本地図コンポーネント */}
        <JapanMap />
      </div>
    </main>
  );
}