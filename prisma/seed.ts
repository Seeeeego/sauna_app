import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 既存データを削除
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

  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } });
  const user1Id = users[0].id;
  const user3Id = users[2].id;
  const user8Id = users[7].id;

  // 都道府県を作成
  await prisma.prefecture.createMany({
    data: [
      { name: '北海道' }, { name: '青森県' }, { name: '岩手県' }, { name: '宮城県' },
      { name: '秋田県' }, { name: '山形県' }, { name: '福島県' }, { name: '茨城県' },
      { name: '栃木県' }, { name: '群馬県' }, { name: '埼玉県' }, { name: '千葉県' },
      { name: '東京都' }, { name: '神奈川県' }, { name: '新潟県' }, { name: '富山県' },
      { name: '石川県' }, { name: '福井県' }, { name: '山梨県' }, { name: '長野県' },
      { name: '岐阜県' }, { name: '静岡県' }, { name: '愛知県' }, { name: '三重県' },
      { name: '滋賀県' }, { name: '京都府' }, { name: '大阪府' }, { name: '兵庫県' },
      { name: '奈良県' }, { name: '和歌山県' }, { name: '鳥取県' }, { name: '島根県' },
      { name: '岡山県' }, { name: '広島県' }, { name: '山口県' }, { name: '徳島県' },
      { name: '香川県' }, { name: '愛媛県' }, { name: '高知県' }, { name: '福岡県' },
      { name: '佐賀県' }, { name: '長崎県' }, { name: '熊本県' }, { name: '大分県' },
      { name: '宮崎県' }, { name: '鹿児島県' }, { name: '沖縄県' }
    ]
  });

  const prefectures = await prisma.prefecture.findMany({ orderBy: { id: 'asc' } });
  const getPrefId = (index: number) => prefectures[index - 1].id;

  // タグを作成
  const tagSauna = await prisma.tag.create({ data: { name: 'サウナあり' } });
  const tagMizuburo = await prisma.tag.create({ data: { name: '水風呂あり' } });
  const tagRoten = await prisma.tag.create({ data: { name: '露天風呂あり' } });
  const tagGensen = await prisma.tag.create({ data: { name: '源泉かけ流し' } });

  // 個別施設を作成
  const facility1 = await prisma.facility.create({
    data: {
      userId: user3Id,
      name: '黄金の湯 スパリゾート',
      prefectureId: getPrefId(13), // 東京都
      address: '東京都江東区豊洲1-2-3',
      hpUrl: 'https://example.com/kogane',
    },
  });

  const facility2 = await prisma.facility.create({
    data: {
      userId: user8Id,
      name: '富士見サウナヘブン',
      prefectureId: getPrefId(22), // 静岡県
      address: '静岡県富士宮市100',
      hpUrl: 'https://example.com/fujimi',
    },
  });

  // 各地の温泉施設を一括作成
  await prisma.facility.createMany({
    data: [
      // 北海道
      { userId: user1Id, name: "登別温泉", prefectureId: getPrefId(1), address: "登別市登別温泉町" },
      { userId: user1Id, name: "洞爺湖温泉", prefectureId: getPrefId(1), address: "虻田郡洞爺湖町洞爺湖温泉" },
      { userId: user1Id, name: "定山渓温泉", prefectureId: getPrefId(1), address: "札幌市南区定山渓温泉" },
      // 東北
      { userId: user1Id, name: "極楽湯 青森店", prefectureId: getPrefId(2), address: "青森市東大野2-4-21" },
      { userId: user1Id, name: "天然温泉 かっぱのゆ", prefectureId: getPrefId(2), address: "青森市大字横内字神田95-1" },
      { userId: user1Id, name: "喜盛の湯", prefectureId: getPrefId(3), address: "盛岡市南仙北1丁目18番50号" },
      { userId: user1Id, name: "鉛温泉 藤三旅館", prefectureId: getPrefId(3), address: "花巻市鉛字中平75-1" },
      { userId: user1Id, name: "やすらぎの湯 ゆっぽ", prefectureId: getPrefId(4), address: "白石市大平森合字森合沖86" },
      { userId: user1Id, name: "アクアイグニス仙台 天然温泉 藤塚の湯", prefectureId: getPrefId(4), address: "仙台市若林区藤塚字松の西33-3" },
      { userId: user1Id, name: "天然温泉 ホテルこまち", prefectureId: getPrefId(5), address: "秋田市卸町1-2-3" },
      { userId: user1Id, name: "桜温泉 さくらさくら", prefectureId: getPrefId(5), address: "秋田市桜2-92-1" },
      { userId: user1Id, name: "みいずみ温泉 吉乃ゆ", prefectureId: getPrefId(6), address: "寒河江市下河原153-2" },
      { userId: user1Id, name: "百目鬼温泉", prefectureId: getPrefId(6), address: "山形市百目鬼42-1" },
      { userId: user1Id, name: "スパリゾートハワイアンズ", prefectureId: getPrefId(7), address: "いわき市常磐藤原町蕨平50" },
      { userId: user1Id, name: "小名浜オーシャンホテル", prefectureId: getPrefId(7), address: "いわき市泉町下川大畑17" },
      // 関東
      { userId: user1Id, name: "勝田あかつきの湯", prefectureId: getPrefId(8), address: "ひたちなか市東石川六ツ野3378-17" },
      { userId: user1Id, name: "スーパー銭湯 やまの湯", prefectureId: getPrefId(8), address: "水戸市笠原町144-1" },
      { userId: user1Id, name: "宮の街道温泉 江戸遊", prefectureId: getPrefId(9), address: "宇都宮市インターパーク4-2-5" },
      { userId: user1Id, name: "宇都宮天然温泉 ベルさくらの湯", prefectureId: getPrefId(9), address: "宇都宮市陽東6-5-31" },
      { userId: user1Id, name: "高崎 京ヶ島天然温泉 湯都里", prefectureId: getPrefId(10), address: "高崎市島野町890-3" },
      { userId: user1Id, name: "天然温泉湯楽部 太田店", prefectureId: getPrefId(10), address: "太田市植木野町694-1" },
      { userId: user1Id, name: "湯の泉 草加健康センター", prefectureId: getPrefId(11), address: "草加市北谷2-23-23" },
      { userId: user1Id, name: "小江戸温泉 KASHIBA", prefectureId: getPrefId(11), address: "川越市松郷1313-1" },
      { userId: user1Id, name: "スパメッツァおおたか 竜泉寺の湯", prefectureId: getPrefId(12), address: "流山市おおたかの森西1-15-1" },
      { userId: user1Id, name: "JFA夢フィールド 幕張温泉 湯楽の里", prefectureId: getPrefId(12), address: "千葉市美浜区美浜26" },
      { userId: user1Id, name: "新宿天然温泉 テルマー湯", prefectureId: getPrefId(13), address: "新宿区歌舞伎町1-1-2" },
      { userId: user1Id, name: "東京ドーム天然温泉 Spa LaQua（スパ ラクーア）", prefectureId: getPrefId(13), address: "文京区春日1-1-1" },
      { userId: user1Id, name: "横浜みなとみらい 万葉倶楽部", prefectureId: getPrefId(14), address: "横浜市中区新港2-7-1" },
      { userId: user1Id, name: "綱島源泉 湯けむりの庄", prefectureId: getPrefId(14), address: "横浜市港北区樽町3-7-61" },
      // 中部
      { userId: user1Id, name: "弥彦桜井郷温泉 さくらの湯", prefectureId: getPrefId(15), address: "西蒲原郡弥彦村弥彦大字麓1970" },
      { userId: user1Id, name: "極楽湯 女池店", prefectureId: getPrefId(15), address: "新潟市中央区女池6-1-11" },
      { userId: user1Id, name: "たから湯", prefectureId: getPrefId(16), address: "富山市北新町1丁目2-12" },
      { userId: user1Id, name: "立山鉱泉", prefectureId: getPrefId(16), address: "富山市中島3丁目8-33" },
      { userId: user1Id, name: "極楽湯 金沢野々市店", prefectureId: getPrefId(17), address: "野々市市若松町18-1" },
      { userId: user1Id, name: "アパスパ金沢駅前", prefectureId: getPrefId(17), address: "金沢市広岡1-9-28" },
      { userId: user1Id, name: "敦賀きらめき温泉 リラ・ポート", prefectureId: getPrefId(18), address: "敦賀市高野91-9-3" },
      { userId: user1Id, name: "湯っぷる（道の駅シーサイド高浜）", prefectureId: getPrefId(18), address: "大飯郡高浜町下車持46-10" },
      { userId: user1Id, name: "山梨泊まれる温泉 より道の湯", prefectureId: getPrefId(19), address: "都留市つる1-13-31" },
      { userId: user1Id, name: "ほったらかし温泉 あっちの湯・こっちの湯", prefectureId: getPrefId(19), address: "山梨市矢坪1669-18" },
      { userId: user1Id, name: "林檎の湯屋おぶ～", prefectureId: getPrefId(20), address: "松本市石芝3-9-44" },
      { userId: user1Id, name: "地蔵温泉 十福の湯", prefectureId: getPrefId(20), address: "上田市真田町傍陽9097-70" },
      { userId: user1Id, name: "土岐よりみち温泉", prefectureId: getPrefId(21), address: "土岐市土岐ヶ丘4-5-3" },
      { userId: user1Id, name: "湯どころ みのり", prefectureId: getPrefId(21), address: "羽島郡岐南町下印食2-60-1" },
      { userId: user1Id, name: "赤沢日帰り温泉館", prefectureId: getPrefId(22), address: "伊東市赤沢浮山170-2" },
      { userId: user1Id, name: "富士・湯らぎの里", prefectureId: getPrefId(22), address: "富士市蓼原227-1" },
      { userId: user1Id, name: "RAKU SPA GARDEN 名古屋", prefectureId: getPrefId(23), address: "名古屋市名東区平和が丘1-65-2" },
      { userId: user1Id, name: "天然温泉 みどり楽の湯", prefectureId: getPrefId(23), address: "名古屋市緑区徳重3-2904" },
      // 関西
      { userId: user1Id, name: "松阪温泉 熊野の郷", prefectureId: getPrefId(24), address: "松阪市中万町2074-1" },
      { userId: user1Id, name: "極楽湯 津店", prefectureId: getPrefId(24), address: "津市白塚町3678番地" },
      { userId: user1Id, name: "草津湯元 水春", prefectureId: getPrefId(25), address: "草津市新浜町300番地" },
      { userId: user1Id, name: "北近江リゾート 天然温泉 北近江の湯", prefectureId: getPrefId(25), address: "長浜市高月町唐川89" },
      { userId: user1Id, name: "上方温泉 一休京都本館", prefectureId: getPrefId(26), address: "城陽市中芦原25-2" },
      { userId: user1Id, name: "壬生温泉 はなの湯", prefectureId: getPrefId(26), address: "京都市中京区壬生松原町15-3" },
      { userId: user1Id, name: "SPAWORLD HOTEL&RESORT", prefectureId: getPrefId(27), address: "大阪市浪速区恵美須東3-4-24" },
      { userId: user1Id, name: "鶴見緑地湯元 水春", prefectureId: getPrefId(27), address: "大阪市鶴見区緑地公園1-37" },
      { userId: user1Id, name: "神戸ハーバーランド温泉 万葉倶楽部", prefectureId: getPrefId(28), address: "神戸市中央区東川崎町1-8-1" },
      { userId: user1Id, name: "天然温泉スパ&サウナ awa awa KOBE", prefectureId: getPrefId(28), address: "神戸市中央区脇浜海岸通1-3-3" },
      { userId: user1Id, name: "天然大和温泉 奈良健康ランド 奈良プラザホテル", prefectureId: getPrefId(29), address: "天理市嘉幡町600-1" },
      { userId: user1Id, name: "ゆららの湯 押熊店", prefectureId: getPrefId(29), address: "奈良市押熊町2147-1" },
      { userId: user1Id, name: "野天風呂 宝の湯", prefectureId: getPrefId(30), address: "御坊市湯川町財部1118-1" },
      { userId: user1Id, name: "とれとれの湯", prefectureId: getPrefId(30), address: "西牟婁郡白浜町堅田2508" },
    ]
  });

  // 施設とタグの紐付け
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

  // 訪問記録を作成 (変数で取得したIDを使用)
  const visit1 = await prisma.visit.create({
    data: {
      userId: user3Id,
      facilityId: facility1.id,
      visitDate: new Date('2024-02-10'),
      fee: 1500,
      rating: 5,
      comment: '外気浴エリアからの眺めが最高。水風呂も15度でしっかり冷えている。',
    },
  });

  const visit2 = await prisma.visit.create({
    data: {
      userId: user8Id,
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