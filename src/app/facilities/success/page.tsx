import Link from 'next/link';

export default function FacilitySuccessPage() {
  return (
    <main>
      <h1>施設登録完了</h1>
      <p>新しい施設が正常に登録されました。</p>

      <div>
        <p>
          <Link href="/facilities">施設一覧に戻る</Link>
        </p>
        
        <p>
          <Link href="/">トップ画面へ戻る</Link>
        </p>
      </div>
    </main>
  );
}