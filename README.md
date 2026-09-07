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

## データベース設計 (ER図)

データ整合性と拡張性を考慮し、全6テーブルで構成しています。

```mermaid
erDiagram
    users {
        SERIAL id PK "利用者ID"
        VARCHAR(50) name "利用者名"
        VARCHAR(50) email "連絡先"
    }
    
    facilities {
        SERIAL id PK "施設ID"
        VARCHAR(50) name "施設名"
        VARCHAR(20) prefecture "都道府県名"
        VARCHAR(200) address "住所"
        VARCHAR(200) hp_url "施設HPリンク"
        INTEGER user_id FK "登録者ID"
        TIMESTAMP created_at "登録日時"
        TIMESTAMP updated_at "更新日時"
    }

    visits {
        SERIAL id PK "訪問記録ID"
        INTEGER user_id FK "訪問者ID"
        INTEGER facility_id FK "施設ID"
        DATE visit_date "訪れた日"
        INTEGER fee "利用料金"
        INTEGER rating "評価(1-5)"
        TEXT comment "コメント"
        TIMESTAMP created_at "作成日時"
        TIMESTAMP updated_at "更新日時"
    }

    tags {
        SERIAL id PK "タグID"
        VARCHAR(30) name "タグ名 (例: セルフロウリュ)"
    }

    facility_tags {
        INTEGER facility_id FK "施設ID"
        INTEGER tag_id FK "タグID"
    }

    visit_images {
        SERIAL id PK "画像ID"
        INTEGER visit_id FK "訪問記録ID"
        VARCHAR(2048) image_url "画像URL"
        TIMESTAMP created_at "作成日時"
    }
    
    users ||--o{ facilities : "登録する"
    users ||--o{ visits : "記録する"
    facilities ||--o{ visits : "保持する"
    facilities ||--o{ facility_tags : ""
    tags ||--o{ facility_tags : ""
    visits ||--o{ visit_images : "保持する"
```
---

## <思案中> ディレクトリ構成案

```text
.
├── docker-compose.yml
├── prisma/
│   └── schema.prisma         # Prismaデータモデル定義
├── public/                   # 静的ファイル（日本地図SVG等）
└── src/
    ├── app/                  # Next.js App Router
    │   ├── page.tsx          # トップ画面 (日本地図ナビゲーション)
    │   ├── logs/
    │   │   └── [prefecture]/ # 都道府県別 施設一覧・ソート画面
    │   │       ├── page.tsx
    │   │       └── new/      # 新規記録作成画面
    │   └── layout.tsx
    ├── components/           # UIコンポーネント (JapanMap, OnsenCard, Form等)
    ├── lib/                  # Prismaクライアント定義・ユーティリティ関数
    └── types/                # TypeScript型定義
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
