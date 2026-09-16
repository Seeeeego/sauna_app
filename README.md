# ♨️ 温泉・サウナ訪問記録アプリ (Onsen Log App)

## プロジェクト概要

本サービスは、全国の温泉施設情報を検索・管理し、ユーザーが実際の訪問記録（評価・利用料金・コメント・画像）を保存・共有できる温泉訪問記録・管理アプリケーションです。
都道府県ごとの施設検索から、新しい温泉スポットの登録、ユーザー独自の訪問ログの管理までを一元的に行える設計となっています。

---

## 主な機能 (MVP)

- **ユーザー管理機能**
    - ログイン・新規ユーザー登録：
        - ユーザー名・メールアドレスによるシンプルな認証機能
        - メールアドレスの重複チェックおよび入力バリデーション機能
    - ログイン状態の保持・アクセス制御:
        - クエリパラメータ（userId）を用いた画面間のセッション維持と認可制御
        - 未ログイン（userId 不足）状態での保護ページアクセスに対する自動ログイン画面リダイレクト


- **温泉施設検索・閲覧機能**
    - エリア・都道府県別絞り込み:
        - トップ画面の日本地図コンポーネント（<JapanMap/>）や都道府県ボタンによる直感的なエリア選択
        - 都道府県ごとの登録済み温泉施設一覧表示（新着順ソート）

    - 施設詳細情報の確認：
        - 施設名・住所・公式HPなどの詳細データ閲覧
        - 該当施設に紐づくユーザー訪問ログの一覧表示（投稿日時が新しい順）

- **温泉施設管理機能（CRUD）**
    - 新規施設情報の登録：
        - 施設名、都道府県、詳細住所、公式HP URLの登録
        - 登録完了後の動的パラメータ引き継ぎ・完了画面遷移

    - 施設情報の編集・更新：
        - 既存施設データ（住所・公式HPなど）の最新化

    - 施設の削除制限：
        - 訪問ログが存在する施設に対する安全策（ログが1件以上ある場合は削除ボタンを無効化し、誤削除を防止）

- **訪問ログ（思い出記録）機能**
    - 訪問ログの新規投稿：
        - 訪問日、評価（5段階）、利用料金、コメント、訪問時の画像URLの記録
        - フォーム入力におけるバリデーション（訪問日・評価の必須化、利用料金の負数チェック）

    - 訪問ログの編集・所有権チェック：
        - 投稿者本人（userId の一致）のみに編集権限を付与するセキュリティ制御
        -  投稿済み評価やコメントの再編集・更新処理


---

## 画面遷移図(メイン動線のみ)

アプリの全体的な画面構成とユーザーの動線は以下の通りです。

```mermaid
graph TD
    A[ログイン画面] --> |ログイン| B[トップ画面]
    A --> |新規アカウント登録| C[新規ユーザー登録画面]
    C --> |登録ボタン| D[ユーザー登録完了画面]
    D --> |ログイン画面へ| A
    B --> |都道府県を選択| E[施設一覧表示]
    E --> |施設選択| F[施設詳細情報]
    E --> |追加| G[新規施設追加画面]
    F --> |編集| H[施設編集画面]
    F --> |訪問ログ追加| I[訪問ログ追加画面]
    F --> |訪問ログ編集| J[ログ編集画面]
    H --> |完了| F
    I --> |追加| K[ログ追加完了画面]
    J --> |完了| F
    G --> |新規施設登録| L[新規施設登録完了画面]
```

※ 詳細な仕様や画面ごとの要件は、[docs/screens.md](./docs/screens.md) を参照してください。
---

## データベース設計 (ER図)

データ整合性と拡張性を考慮し、全7テーブルで構成しています。

```mermaid
erDiagram
    users {
        SERIAL id PK "利用者id"
        VARCHER(50) name "利用者名"
        VARCHER(50) email  "連絡先"
    }
    
    prefectures {
        SERIAL  id  PK  "都道府県id"
        VARCHAER(5) name "都道府県名"
    }

    facilities {
        INTEGER id PK "施設ID"
        VARCHAER(50) name "施設名"
        INTEGER prefecture_id FK "都道府県id"
        VARCHAER(200) address "住所"
        INTEGER user_id  FK "登録者"
        VARCHAR(200) hp_url "施設hpリンク"
        DATE created_at "登録日時"
        DATE updeted_at "更新日時"
    }
    
    visits {
        SERIAL id PK
        INTEGER user_id FK
        INTEGER facility_id FK
        DATE visit_date "訪れた日"
        INTEGER fee "利用料金"
        INTEGER rating "評価"
        TEXT comment "コメント"
        DATE created_at "登録日時"
        DATE updeted_at "更新日時"
    }

    tags {
        SERIAL id PK "タグID"
        VARCHAR name "タグ名 (例: セルフロウリュ)"
    }
    facility_tags {
        INTEGER facility_id FK
        INTEGER tag_id FK
    }
    visit_images {
        SERIAL id PK "画像ID"
        INTEGER visit_id FK "訪問記録ID"
        VARCHAR image_url "画像URL"
    }
    
    users ||--o{ facilities : "登録する"
    users ||--o{ visits : "記録する"
    facilities ||--o{ visits : "保持する"
    facilities ||--o{ facility_tags : ""
    tags ||--o{ facility_tags : ""
    visits ||--o{ visit_images : "保持する"
    prefectures ||--o{ facilities: "保持する"
```
---

## ディレクトリ構成

``` text
sauna-app
├─ Dockerfile
├─ README.md
├─ docker-compose.yml
├─ docs
│  ├─ database.md
│  ├─ requirements.md
│  ├─ screens.md
│  ├─ test-case.md
│  └─ transition-diagram.md
├─ next.config.ts
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ postcss.config.mjs
├─ prisma
│  ├─ migrations
│  ├─ schema.prisma
│  └─ seed.ts
├─ prisma.config.ts
├─ public
│  └─ uploads
├─ src
│  ├─ app
│  │  ├─ facilities
│  │  │  ├─ [id]
│  │  │  │  ├─ edit
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ visits
│  │  │  │     ├─ [visitId]
│  │  │  │     │  └─ edit
│  │  │  │     │     ├─ actions.ts
│  │  │  │     │     └─ page.tsx
│  │  │  │     ├─ new
│  │  │  │     │  └─ page.tsx
│  │  │  │     └─ success
│  │  │  │        └─ page.tsx
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ success
│  │  │     └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ login
│  │  │  └─ actions.ts
│  │  ├─ page.tsx
│  │  ├─ register
│  │  │  ├─ actions.ts
│  │  │  ├─ page.tsx
│  │  │  └─ success
│  │  │     └─ page.tsx
│  │  └─ top
│  │     └─ page.tsx
│  ├─ components
│  │  └─ JapanMap.tsx
│  ├─ constants
│  │  └─ japan.ts
│  └─ lib
│     └─ prisma.ts
└─ tsconfig.json

```
---

## 開発環境セットアップ
### 起動手順

1. リポジトリのクローン

```bash
git clone <repository-url>
cd <repository-directory>
```
2. 環境変数の設定

.env.example をコピーして .env ファイルを作成し、データベース接続情報を設定します。
```bash
cp .env.example .env
```
```bash
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/onsensauna_db?schema=public"
```
3. dockerコンテナの起動(postgresql)

```bash
docker-compose up -d
```

4. 依存パッケージのインストール

```bash
pnpm install
```

5. Prismaマイグレーションの実行
```bash
pnpm prisma migrate dev
```

6. 開発サーバの起動
```bash
pnpm dev
```