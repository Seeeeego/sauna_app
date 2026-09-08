import Link from 'next/link';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function VisitSuccessPage({ params }: Props) {
  const { id } = await params;

  return (
    <main>
      <h1>登録完了</h1>
      <p>訪問ログの登録が完了しました。</p>

      <div>
        <p>
          <Link href="/">トップ画面へ戻る</Link>
        </p>

        <p>
          <Link href={`/facilities/${id}`}>施設詳細に戻る</Link>
        </p>
      </div>
    </main>
  );
}