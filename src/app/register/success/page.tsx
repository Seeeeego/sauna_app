// src/app/register/success/page.tsx
import Link from 'next/link';

export default function RegisterSuccessPage() {
  return (
    <main style={{ padding: '40px 20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#2e7d32' }}>🎉 登録が完了しました！</h1>
      
      <p style={{ marginTop: '20px', lineHeight: '1.6', color: '#555' }}>
        アカウントの作成が正常に完了いたしました。<br />
        続いてログイン画面よりログインを行ってください。
      </p>

      <div style={{ marginTop: '30px' }}>
        <Link href="/">
          <button
            type="button"
            style={{
              padding: '12px 24px',
              backgroundColor: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            ログイン画面へ移動する
          </button>
        </Link>
      </div>
    </main>
  );
}