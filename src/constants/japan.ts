export interface Prefecture {
  code: number;
  name: string;
  region: string;
}

export interface Region {
  id: string;
  name: string;
  color: string; // Tailwindカラー
  prefs: string[];
}

export const REGIONS: Region[] = [
  {
    id: 'hokkaido-tohoku',
    name: '北海道・東北',
    color: 'bg-sky-500 hover:bg-sky-600 text-white',
    prefs: ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'],
  },
  {
    id: 'kanto',
    name: '関東',
    color: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    prefs: ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'],
  },
  {
    id: 'chubu',
    name: '中部・北陸',
    color: 'bg-teal-500 hover:bg-teal-600 text-white',
    prefs: ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'],
  },
  {
    id: 'kansai',
    name: '近畿',
    color: 'bg-amber-500 hover:bg-amber-600 text-white',
    prefs: ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'],
  },
  {
    id: 'chugoku-shikoku',
    name: '中国・四国',
    color: 'bg-orange-500 hover:bg-orange-600 text-white',
    prefs: ['鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県'],
  },
  {
    id: 'kyushu-okinawa',
    name: '九州・沖縄',
    color: 'bg-rose-500 hover:bg-rose-600 text-white',
    prefs: ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'],
  },
];