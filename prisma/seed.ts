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
  await prisma.user.deleteMany();

  // ユーザーを作成
  const user1 = await prisma.user.create({
    data: { email: 'taro@example.com', name: 'サウナ太郎' },
  });
  const user2 = await prisma.user.create({
    data: { email: 'hanako@example.com', name: '温泉花子' },
  });

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
      userId: user1.id,
      name: '黄金の湯 スパリゾート',
      prefecture: '東京都',
      address: '東京都江東区豊洲1-2-3',
      hpUrl: 'https://example.com/kogane',
    },
  });

  const facility2 = await prisma.facility.create({
    data: {
      userId: user2.id,
      name: '富士見サウナヘブン',
      prefecture: '静岡県',
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
      userId: user1.id,
      facilityId: facility1.id,
      visitDate: new Date('2024-02-10'),
      fee: 1500,
      rating: 5,
      comment: '外気浴エリアからの眺めが最高。水風呂も15度でしっかり冷えている。',
    },
  });

  const visit2 = await prisma.visit.create({
    data: {
      userId: user2.id,
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