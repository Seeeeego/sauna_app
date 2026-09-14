# ♨️ 温泉・サウナ訪問記録アプリ (Onsen Log App)

温泉やサウナの訪問体験を構造化して記録し、日本地図や各種ソート機能を通じて視覚的に振り返ることができるWebアプリケーションです。

---

## プロジェクト概要

* **目的:** 趣味の温泉・サウナ巡りの記録（評価、利用料金、感想、写真など）を一元管理・可視化する。
* **提供価値:** 
  * 日本地図UIを通じた視覚的な訪問履歴の管理
  * 評価順・料金順・登録順での迅速な検索・ソート
  * 訪問ごとの複数写真保存や特徴タグによる管理
* **ターゲット:** 温泉・サウナ巡りを趣味とする個人ユーザー

---

## 主な機能 (MVP)

* **インタラクティブ日本地図ナビゲーション**
  * トップ画面に日本地図を表示。都道府県をクリックすると該当エリアの施設一覧へ遷移。
* **施設一覧・インタラクティブソート機能**
  * 選択エリアの温泉・サウナをカード型UIで一覧表示。
  * 「評価順（降順）」「料金順（昇順/降順）」「登録順（降順）」に即座に表示切り替え。
* **温泉・サウナ訪問記録の登録機能**
  * 施設基本情報（名称、都道府県、住所、HPリンク）の登録。
  * 訪問ログ（訪問日、料金、5段階星評価、感想コメント）の記録。
  * 1回の訪問につき複数の写真をアップロード・管理。
* **特徴タグ機能**
  * 「サウナあり」「源泉かけ流し」「露天風呂」などのタグによる特徴の管理・検索。

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
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ sample-hot-spring.png
│  ├─ vercel.svg
│  └─ window.svg
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