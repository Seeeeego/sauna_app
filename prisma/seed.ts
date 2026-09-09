import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 既存データを削除(外部キー制約のため、子テーブル → 親テーブルの順に消すこと)
  await prisma.visitImage.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.facilityTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.prefecture.deleteMany();
  await prisma.user.deleteMany();

  // ユーザーを作成
  await prisma.user.createMany({
    data: [
      { email: 'taro@example.com', name: 'サウナ太郎' },
      { email: 'hanako@example.com', name: '温泉花子' },
      { email: 'totonoi_ken@example.com', name: '宮島数郎' },
      { email: 'furo_suki@example.com', name: '東栄介' },
      { email: 'yudono_misa@example.com', name: '小杉ブラまよ' },
      { email: 'spa_master@example.com', name: '残馬二浪' },
      { email: 'roten_daisuki@example.com', name: '吉岡ひでひと' },
      { email: 'mizuburo_love@example.com', name: '高脚ざむらい' },
    ]
  });

  // 都道府県を作成
  await prisma.prefecture.createMany({
    data:[
      // 1(1)
      {name: '北海道'},

      // 6(7)
      {name: "青森県"},{name: "岩手県"},{name: "宮城県"},{name: "秋田県"},
      {name: "山形県"},{name: "福島県"},

      // 7(14)
      {name: "茨城県"},{name: "栃木県"},{name: "群馬県"},{name: "埼玉県"},
      {name: "千葉県"},{name: "東京都"},{name: "神奈川県"},

      // 9(23)
      {name: "新潟県"},{name: "富山県"},{name: "石川県"},{name: "福井県"},
      {name: "山梨県"},{name: "長野県"},{name: "岐阜県"},{name: "静岡県"},{name: "愛知県"},

      // 7(30)
      {name: "三重県"},{name: "滋賀県"},{name: "京都府"},{name: "大阪府"},
      {name: "兵庫県"},{name: "奈良県"},{name: "和歌山県"},

      // 5(35)
      {name: "鳥取県"},{name: "島根県"},{name: "岡山県"},{name: "広島県"},{name: "山口県"},

      // 4(39)
      {name: "徳島県"},{name: "香川県"},{name: "愛媛県"},{name: "高知県"},

      // 8(47)
      {name: "福岡県"},{name: "佐賀県"},{name: "長崎県"},{name: "熊本県"},
      {name: "大分県"},{name: "宮崎県"},{name: "鹿児島県"},{name: "沖縄県"}
    ]
  })

  // タグを作成
  const tagSauna = await prisma.tag.create({
    data: { name: 'サウナあり' },
  });
  const tagMizuburo = await prisma.tag.create({
    data: { name: '水風呂あり' },
  });
  const tagRoten = await prisma.tag.create({
    data: { name: '露天風呂あり' },
  });
  const tagGensen = await prisma.tag.create({
    data: { name: '源泉かけ流し' },
  });

  // 施設を作成
  const facility1 = await prisma.facility.create({
    data: {
      userId: 3,
      name: '黄金の湯 スパリゾート',
      prefectureId: 13,
      address: '東京都江東区豊洲1-2-3',
      hpUrl: 'https://example.com/kogane',
    },
  });

  const facility2 = await prisma.facility.create({
    data: {
      userId: 8,
      name: '富士見サウナヘブン',
      prefectureId: 22,
      address: '静岡県富士宮市100',
      hpUrl: 'https://example.com/fujimi',
    },
  });

  // 施設とタグの紐付け(中間テーブル)
  await prisma.facilityTag.createMany({
    data: [
      { facilityId: facility1.id, tagId: tagSauna.id },
      { facilityId: facility1.id, tagId: tagMizuburo.id },
      { facilityId: facility1.id, tagId: tagRoten.id },
      { facilityId: facility1.id, tagId: tagGensen.id },
      { facilityId: facility2.id, tagId: tagSauna.id },
      { facilityId: facility2.id, tagId: tagMizuburo.id },
    ],
  });

  // 訪問記録を作成
  const visit1 = await prisma.visit.create({
    data: {
      userId: 3,
      facilityId: facility1.id,
      visitDate: new Date('2024-02-10'),
      fee: 1500,
      rating: 5,
      comment: '外気浴エリアからの眺めが最高。水風呂も15度でしっかり冷えている。',
    },
  });

  const visit2 = await prisma.visit.create({
    data: {
      userId: 8,
      facilityId: facility2.id,
      visitDate: new Date('2024-03-01'),
      fee: 2000,
      rating: 4,
      comment: 'セルフロウリュ可能なサウナ室がとても集中できる空間でした。',
    },
  });

  // 訪問画像を作成
  await prisma.visitImage.createMany({
    data: [
      {
        visitId: visit1.id,
        imageUrl: '/images/visits/kogane_exterior.jpg',
      },
      {
        visitId: visit1.id,
        imageUrl: '/images/visits/kogane_saunameshi.jpg',
      },
      {
        visitId: visit2.id,
        imageUrl: '/images/visits/fujimi_sauna.jpg',
      },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });