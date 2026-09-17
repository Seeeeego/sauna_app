import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-xl shadow-md">
        {/* タイトル領域 */}
        <h1 className="text-3xl font-bold text-slate-800">
          ♨️ 温泉訪問ログ
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          訪れた温泉の記録や思い出を安全に管理できるアプリケーションです。
        </p>

        {/* ログイン画面への遷移ボタン */}
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block w-full py-3 px-6 text-white font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg transition-colors duration-200 shadow-sm"
          >
            ログイン画面へ進む
          </Link>
        </div>
      </div>
    </main>
  )
}