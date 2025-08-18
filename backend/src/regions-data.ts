// 日本の八地方区分と都道府県のデータ

export interface Region {
  id: number;
  name: string;
  code: string;
}

export interface Prefecture {
  id: number;
  name: string;
  code: string;
  region_id: number;
}

// 八地方区分
export const regions: Region[] = [
  { id: 1, name: '北海道地方', code: 'hokkaido' },
  { id: 2, name: '東北地方', code: 'tohoku' },
  { id: 3, name: '関東地方', code: 'kanto' },
  { id: 4, name: '中部地方', code: 'chubu' },
  { id: 5, name: '近畿地方', code: 'kinki' },
  { id: 6, name: '中国地方', code: 'chugoku' },
  { id: 7, name: '四国地方', code: 'shikoku' },
  { id: 8, name: '九州・沖縄地方', code: 'kyushu_okinawa' }
];

// 都道府県
export const prefectures: Prefecture[] = [
  // 北海道地方
  { id: 1, name: '北海道', code: 'hokkaido', region_id: 1 },
  
  // 東北地方
  { id: 2, name: '青森県', code: 'aomori', region_id: 2 },
  { id: 3, name: '岩手県', code: 'iwate', region_id: 2 },
  { id: 4, name: '宮城県', code: 'miyagi', region_id: 2 },
  { id: 5, name: '秋田県', code: 'akita', region_id: 2 },
  { id: 6, name: '山形県', code: 'yamagata', region_id: 2 },
  { id: 7, name: '福島県', code: 'fukushima', region_id: 2 },
  
  // 関東地方
  { id: 8, name: '茨城県', code: 'ibaraki', region_id: 3 },
  { id: 9, name: '栃木県', code: 'tochigi', region_id: 3 },
  { id: 10, name: '群馬県', code: 'gunma', region_id: 3 },
  { id: 11, name: '埼玉県', code: 'saitama', region_id: 3 },
  { id: 12, name: '千葉県', code: 'chiba', region_id: 3 },
  { id: 13, name: '東京都', code: 'tokyo', region_id: 3 },
  { id: 14, name: '神奈川県', code: 'kanagawa', region_id: 3 },
  
  // 中部地方
  { id: 15, name: '新潟県', code: 'niigata', region_id: 4 },
  { id: 16, name: '富山県', code: 'toyama', region_id: 4 },
  { id: 17, name: '石川県', code: 'ishikawa', region_id: 4 },
  { id: 18, name: '福井県', code: 'fukui', region_id: 4 },
  { id: 19, name: '山梨県', code: 'yamanashi', region_id: 4 },
  { id: 20, name: '長野県', code: 'nagano', region_id: 4 },
  { id: 21, name: '岐阜県', code: 'gifu', region_id: 4 },
  { id: 22, name: '静岡県', code: 'shizuoka', region_id: 4 },
  { id: 23, name: '愛知県', code: 'aichi', region_id: 4 },
  
  // 近畿地方
  { id: 24, name: '三重県', code: 'mie', region_id: 5 },
  { id: 25, name: '滋賀県', code: 'shiga', region_id: 5 },
  { id: 26, name: '京都府', code: 'kyoto', region_id: 5 },
  { id: 27, name: '大阪府', code: 'osaka', region_id: 5 },
  { id: 28, name: '兵庫県', code: 'hyogo', region_id: 5 },
  { id: 29, name: '奈良県', code: 'nara', region_id: 5 },
  { id: 30, name: '和歌山県', code: 'wakayama', region_id: 5 },
  
  // 中国地方
  { id: 31, name: '鳥取県', code: 'tottori', region_id: 6 },
  { id: 32, name: '島根県', code: 'shimane', region_id: 6 },
  { id: 33, name: '岡山県', code: 'okayama', region_id: 6 },
  { id: 34, name: '広島県', code: 'hiroshima', region_id: 6 },
  { id: 35, name: '山口県', code: 'yamaguchi', region_id: 6 },
  
  // 四国地方
  { id: 36, name: '徳島県', code: 'tokushima', region_id: 7 },
  { id: 37, name: '香川県', code: 'kagawa', region_id: 7 },
  { id: 38, name: '愛媛県', code: 'ehime', region_id: 7 },
  { id: 39, name: '高知県', code: 'kochi', region_id: 7 },
  
  // 九州・沖縄地方
  { id: 40, name: '福岡県', code: 'fukuoka', region_id: 8 },
  { id: 41, name: '佐賀県', code: 'saga', region_id: 8 },
  { id: 42, name: '長崎県', code: 'nagasaki', region_id: 8 },
  { id: 43, name: '熊本県', code: 'kumamoto', region_id: 8 },
  { id: 44, name: '大分県', code: 'oita', region_id: 8 },
  { id: 45, name: '宮崎県', code: 'miyazaki', region_id: 8 },
  { id: 46, name: '鹿児島県', code: 'kagoshima', region_id: 8 },
  { id: 47, name: '沖縄県', code: 'okinawa', region_id: 8 }
];

// 都道府県名から市区町村を取得するマッピング（既存の駅データ用）
export const prefectureLocationMap: { [key: string]: string } = {
  // 東京都の区
  '渋谷区': '東京都',
  '新宿区': '東京都',
  '池袋区': '東京都', // 注：実際は豊島区だが、既存データに合わせる
  '千代田区': '東京都',
  '港区': '東京都',
  '台東区': '東京都',
  '目黒区': '東京都',
  '品川区': '東京都',
  '中央区': '東京都',
  '文京区': '東京都',
  '墨田区': '東京都',
  '江東区': '東京都',
  '豊島区': '東京都',
  '北区': '東京都',
  '荒川区': '東京都',
  '板橋区': '東京都',
  '練馬区': '東京都',
  '足立区': '東京都',
  '葛飾区': '東京都',
  '江戸川区': '東京都',
  '世田谷区': '東京都',
  '杉並区': '東京都',
  '中野区': '東京都'
};

// 都道府県IDから都道府県名を取得
export const getPrefectureById = (id: number): Prefecture | undefined => {
  return prefectures.find(p => p.id === id);
};

// 地方IDから都道府県一覧を取得
export const getPrefecturesByRegionId = (regionId: number): Prefecture[] => {
  return prefectures.filter(p => p.region_id === regionId);
};

// 地方IDから地方名を取得
export const getRegionById = (id: number): Region | undefined => {
  return regions.find(r => r.id === id);
};

// 都道府県名から都道府県IDを取得
export const getPrefectureIdByName = (name: string): number | undefined => {
  const prefecture = prefectures.find(p => p.name === name);
  return prefecture?.id;
};

// 既存の所在地（市区町村）から都道府県IDを推測
export const getPrefectureIdByLocation = (location: string): number | undefined => {
  const prefectureName = prefectureLocationMap[location];
  if (prefectureName) {
    return getPrefectureIdByName(prefectureName);
  }
  return undefined;
};