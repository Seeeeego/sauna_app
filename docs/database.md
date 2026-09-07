```mermaid
erDiagram
    users {
        SERIAL id PK "利用者id"
        VARCHER(50) name "利用者名"
        VARCHER(50) email  "連絡先"
    }
    
    facilities {
        INTEGER id PK "施設ID"
        VARCHAER(50) name "施設名"
        VARCHER(20) prefecture "都道府県名"
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
```

<!-- テーブル名、カラム名、データ型、制約（必須項目など） -->
## 2. テーブル定義

### 2.1 users（ユーザーテーブル）
アプリを利用するユーザー情報を管理する。

| カラム名 | データ型 | 制約 | 備考 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 自動連番 |
| `name` | VARCHAR(50) | NOT NULL | 画面表示用のユーザー名 |
| `email` | VARCHAR(50) | UNIQUE, NOT NULL | ログインおよび連絡用アドレス |

### 2.2 facilities（施設テーブル）
温泉・サウナの基本情報を管理する。ユーザーによって新規登録される。

| カラム名 | データ型 | 制約 | 備考 |
| :--- | :--- | :--- | :--- |
| `id` | SERIAL | PRIMARY KEY | 自動連番 |
| `name` | VARCHAR(50) | NOT NULL | 施設名 |
| `prefecture` | VARCHAR(20) | NOT NULL | 都道府県（検索・地図UI連動用） |
| `address` | VARCHAR(200) | | 詳細な住所 |
| `user_id` | INTEGER | FOREIGN KEY | 施設を初登録したユーザーのID |
| `hp_url` | VARCHAR(200) | UNIQUE | 施設ホームページへのリンク |
| `created_at`| TIMESTAMP | DEFAULT NOW() | 施設データの初回登録日時 |
| `updated_at`| TIMESTAMP | DEFAULT NOW() | 施設データの最終更新日時 |

### 2.3 visits（訪問記録テーブル）
ユーザーが特定の施設を訪れた際の日記・レビュー（トランザクションデータ）を管理する。

| カラム名 | データ型 | 制約 | 備考 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY | 一意の識別子（自動連番・サロゲートキー） |
| `user_id` | INTEGER | FOREIGN KEY | 訪問したユーザーのID |
| `facility_id` | INTEGER | FOREIGN KEY | 訪問した施設のID |
| `visit_date`| DATE | NOT NULL | 実際に施設を訪れた日付 |
| `fee` | INTEGER | | その日支払った利用料金（円） |
| `rating` | INTEGER | NOT NULL | 1〜5段階の星評価 |
| `comment` | TEXT | | 感想・レビュー本文 |
| `image_url` | VARCHAR(2048) | | 思い出の画像（S3等のURLを想定） |

テーブル同士のリレーション（繋がり）
実務のワンポイント:
Markdown内で「Mermaid（マーメイド）」という記法を使うと、テキストで書くだけでGitHub上で綺麗なER図（テーブル関係図）が表示されるため、ポートフォリオとしても非常に見栄えが良くなります。

