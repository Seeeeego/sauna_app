// src/app/login/page.tsx
'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { loginAction, type LoginState } from './login/actions';

const initialState: LoginState = {
  error: undefined,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <main style={{ padding: '40px 20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>♨️ ログイン</h1>

      {state.error && (
        <div
          style={{
            padding: '10px 15px',
            marginBottom: '20px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            border: '1px solid #ef9a9a',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        >
          {state.error}
        </div>
      )}

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            ユーザー名:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            disabled={isPending}
            placeholder="例: サウナ太郎"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            メールアドレス:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            disabled={isPending}
            placeholder="example@example.com"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '10px',
            backgroundColor: isPending ? '#cccccc' : '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isPending ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {isPending ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <hr style={{ margin: '30px 0' }} />

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#666' }}>まだアカウントをお持ちでない方</p>
        <Link href="/register">
          <button
            type="button"
            disabled={isPending}
            style={{
              padding: '8px 16px',
              backgroundColor: '#fff',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            ＋ 新規ユーザー登録はこちら
          </button>
        </Link>
      </div>
    </main>
  );
}