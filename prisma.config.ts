import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",     // 設計図の場所
  migrations: {
    path: "prisma/migrations",        // マイグレーション履歴の保存場所
  },
  datasource: {
    url: process.env["DATABASE_URL"], // DB への接続 URL(環境変数から取得)
  },
});