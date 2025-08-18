import { Pool } from 'pg';
import dotenv from 'dotenv';
import { regions, prefectures, getPrefectureIdByLocation } from './regions-data';

dotenv.config();

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 実際の駅データ（主要駅のサンプル）
const stationData = [
  // 北海道
  { name: '札幌駅', location: '札幌市', prefecture_name: '北海道' },
  { name: '新千歳空港駅', location: '千歳市', prefecture_name: '北海道' },
  { name: '函館駅', location: '函館市', prefecture_name: '北海道' },
  { name: '旭川駅', location: '旭川市', prefecture_name: '北海道' },
  
  // 東北地方
  { name: '青森駅', location: '青森市', prefecture_name: '青森県' },
  { name: '盛岡駅', location: '盛岡市', prefecture_name: '岩手県' },
  { name: '仙台駅', location: '仙台市', prefecture_name: '宮城県' },
  { name: '秋田駅', location: '秋田市', prefecture_name: '秋田県' },
  { name: '山形駅', location: '山形市', prefecture_name: '山形県' },
  { name: '郡山駅', location: '郡山市', prefecture_name: '福島県' },
  { name: 'いわき駅', location: 'いわき市', prefecture_name: '福島県' },
  
  // 関東地方
  { name: '水戸駅', location: '水戸市', prefecture_name: '茨城県' },
  { name: 'つくば駅', location: 'つくば市', prefecture_name: '茨城県' },
  { name: '宇都宮駅', location: '宇都宮市', prefecture_name: '栃木県' },
  { name: '前橋駅', location: '前橋市', prefecture_name: '群馬県' },
  { name: '高崎駅', location: '高崎市', prefecture_name: '群馬県' },
  { name: '大宮駅', location: 'さいたま市', prefecture_name: '埼玉県' },
  { name: '川越駅', location: '川越市', prefecture_name: '埼玉県' },
  { name: '千葉駅', location: '千葉市', prefecture_name: '千葉県' },
  { name: '船橋駅', location: '船橋市', prefecture_name: '千葉県' },
  { name: '柏駅', location: '柏市', prefecture_name: '千葉県' },
  
  // 東京都（既存データを含む）
  { name: '東京駅', location: '千代田区', prefecture_name: '東京都' },
  { name: '新宿駅', location: '新宿区', prefecture_name: '東京都' },
  { name: '渋谷駅', location: '渋谷区', prefecture_name: '東京都' },
  { name: '池袋駅', location: '豊島区', prefecture_name: '東京都' },
  { name: '品川駅', location: '港区', prefecture_name: '東京都' },
  { name: '上野駅', location: '台東区', prefecture_name: '東京都' },
  { name: '秋葉原駅', location: '千代田区', prefecture_name: '東京都' },
  { name: '原宿駅', location: '渋谷区', prefecture_name: '東京都' },
  { name: '恵比寿駅', location: '渋谷区', prefecture_name: '東京都' },
  { name: '新橋駅', location: '港区', prefecture_name: '東京都' },
  { name: '有楽町駅', location: '千代田区', prefecture_name: '東京都' },
  { name: '銀座駅', location: '中央区', prefecture_name: '東京都' },
  { name: '六本木駅', location: '港区', prefecture_name: '東京都' },
  { name: '表参道駅', location: '港区', prefecture_name: '東京都' },
  { name: '赤坂駅', location: '港区', prefecture_name: '東京都' },
  
  // 神奈川県
  { name: '横浜駅', location: '横浜市', prefecture_name: '神奈川県' },
  { name: '川崎駅', location: '川崎市', prefecture_name: '神奈川県' },
  { name: '藤沢駅', location: '藤沢市', prefecture_name: '神奈川県' },
  { name: '鎌倉駅', location: '鎌倉市', prefecture_name: '神奈川県' },
  { name: '小田原駅', location: '小田原市', prefecture_name: '神奈川県' },
  
  // 中部地方
  { name: '新潟駅', location: '新潟市', prefecture_name: '新潟県' },
  { name: '富山駅', location: '富山市', prefecture_name: '富山県' },
  { name: '金沢駅', location: '金沢市', prefecture_name: '石川県' },
  { name: '福井駅', location: '福井市', prefecture_name: '福井県' },
  { name: '甲府駅', location: '甲府市', prefecture_name: '山梨県' },
  { name: '長野駅', location: '長野市', prefecture_name: '長野県' },
  { name: '松本駅', location: '松本市', prefecture_name: '長野県' },
  { name: '岐阜駅', location: '岐阜市', prefecture_name: '岐阜県' },
  { name: '静岡駅', location: '静岡市', prefecture_name: '静岡県' },
  { name: '浜松駅', location: '浜松市', prefecture_name: '静岡県' },
  { name: '名古屋駅', location: '名古屋市', prefecture_name: '愛知県' },
  { name: '豊田市駅', location: '豊田市', prefecture_name: '愛知県' },
  
  // 近畿地方
  { name: '津駅', location: '津市', prefecture_name: '三重県' },
  { name: '四日市駅', location: '四日市市', prefecture_name: '三重県' },
  { name: '大津駅', location: '大津市', prefecture_name: '滋賀県' },
  { name: '京都駅', location: '京都市', prefecture_name: '京都府' },
  { name: '大阪駅', location: '大阪市', prefecture_name: '大阪府' },
  { name: '難波駅', location: '大阪市', prefecture_name: '大阪府' },
  { name: '天王寺駅', location: '大阪市', prefecture_name: '大阪府' },
  { name: '神戸駅', location: '神戸市', prefecture_name: '兵庫県' },
  { name: '姫路駅', location: '姫路市', prefecture_name: '兵庫県' },
  { name: '奈良駅', location: '奈良市', prefecture_name: '奈良県' },
  { name: '和歌山駅', location: '和歌山市', prefecture_name: '和歌山県' },
  
  // 中国地方
  { name: '鳥取駅', location: '鳥取市', prefecture_name: '鳥取県' },
  { name: '松江駅', location: '松江市', prefecture_name: '島根県' },
  { name: '岡山駅', location: '岡山市', prefecture_name: '岡山県' },
  { name: '倉敷駅', location: '倉敷市', prefecture_name: '岡山県' },
  { name: '広島駅', location: '広島市', prefecture_name: '広島県' },
  { name: '下関駅', location: '下関市', prefecture_name: '山口県' },
  
  // 四国地方
  { name: '徳島駅', location: '徳島市', prefecture_name: '徳島県' },
  { name: '高松駅', location: '高松市', prefecture_name: '香川県' },
  { name: '松山駅', location: '松山市', prefecture_name: '愛媛県' },
  { name: '高知駅', location: '高知市', prefecture_name: '高知県' },
  
  // 九州・沖縄地方
  { name: '博多駅', location: '福岡市', prefecture_name: '福岡県' },
  { name: '天神駅', location: '福岡市', prefecture_name: '福岡県' },
  { name: '小倉駅', location: '北九州市', prefecture_name: '福岡県' },
  { name: '佐賀駅', location: '佐賀市', prefecture_name: '佐賀県' },
  { name: '長崎駅', location: '長崎市', prefecture_name: '長崎県' },
  { name: '熊本駅', location: '熊本市', prefecture_name: '熊本県' },
  { name: '大分駅', location: '大分市', prefecture_name: '大分県' },
  { name: '宮崎駅', location: '宮崎市', prefecture_name: '宮崎県' },
  { name: '鹿児島中央駅', location: '鹿児島市', prefecture_name: '鹿児島県' },
  { name: '那覇空港駅', location: '那覇市', prefecture_name: '沖縄県' },
  { name: '首里駅', location: '那覇市', prefecture_name: '沖縄県' }
];

// 都道府県名からIDを取得するヘルパー関数
function getPrefectureIdByName(prefectureName: string): number | undefined {
  const prefecture = prefectures.find(p => p.name === prefectureName);
  return prefecture?.id;
}

// データベース初期化とデータ投入
async function seedDatabase() {
  try {
    console.log('🌱 データベースの初期化を開始します...');

    // テーブル作成
    console.log('📋 テーブルを作成中...');
    
    // 新しいテーブル作成: regions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 新しいテーブル作成: prefectures
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prefectures (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        region_id INTEGER REFERENCES regions(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 既存テーブルの確認・作成
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // stationsテーブルにprefecture_idカラムを追加
    await pool.query(`
      ALTER TABLE stations 
      ADD COLUMN IF NOT EXISTS prefecture_id INTEGER REFERENCES prefectures(id)
    `);

    // 地方データの投入
    console.log('🗾 地方データを投入中...');
    const regionsCount = await pool.query('SELECT COUNT(*) FROM regions');
    if (parseInt(regionsCount.rows[0].count) === 0) {
      for (const region of regions) {
        await pool.query(
          'INSERT INTO regions (id, name, code) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
          [region.id, region.name, region.code]
        );
      }
      console.log(`✅ ${regions.length}件の地方データを投入しました`);
    } else {
      console.log('ℹ️  地方データは既に存在します');
    }

    // 都道府県データの投入
    console.log('🏛️  都道府県データを投入中...');
    const prefecturesCount = await pool.query('SELECT COUNT(*) FROM prefectures');
    if (parseInt(prefecturesCount.rows[0].count) === 0) {
      for (const prefecture of prefectures) {
        await pool.query(
          'INSERT INTO prefectures (id, name, code, region_id) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
          [prefecture.id, prefecture.name, prefecture.code, prefecture.region_id]
        );
      }
      console.log(`✅ ${prefectures.length}件の都道府県データを投入しました`);
    } else {
      console.log('ℹ️  都道府県データは既に存在します');
    }

    // 駅データの投入
    console.log('🚉 駅データを投入中...');
    let stationsInserted = 0;
    let stationsUpdated = 0;
    
    for (const station of stationData) {
      const prefectureId = getPrefectureIdByName(station.prefecture_name);
      
      if (!prefectureId) {
        console.warn(`⚠️  都道府県が見つかりません: ${station.prefecture_name} (駅: ${station.name})`);
        continue;
      }

      try {
        // 駅が既に存在するかチェック
        const existingStation = await pool.query('SELECT id, prefecture_id FROM stations WHERE name = $1', [station.name]);
        
        if (existingStation.rows.length > 0) {
          // 既存の駅のprefecture_idを更新
          if (!existingStation.rows[0].prefecture_id) {
            await pool.query(
              'UPDATE stations SET prefecture_id = $1, location = $2 WHERE name = $3',
              [prefectureId, station.location, station.name]
            );
            stationsUpdated++;
          }
        } else {
          // 新しい駅を挿入
          await pool.query(
            'INSERT INTO stations (name, location, prefecture_id) VALUES ($1, $2, $3)',
            [station.name, station.location, prefectureId]
          );
          stationsInserted++;
        }
      } catch (error) {
        console.error(`❌ 駅データの処理でエラー: ${station.name}`, error);
      }
    }

    console.log(`✅ ${stationsInserted}件の駅を新規追加しました`);
    console.log(`✅ ${stationsUpdated}件の駅を更新しました`);

    // データ統計の表示
    console.log('\n📊 データベース統計:');
    const finalRegionsCount = await pool.query('SELECT COUNT(*) FROM regions');
    const finalPrefecturesCount = await pool.query('SELECT COUNT(*) FROM prefectures');
    const finalStationsCount = await pool.query('SELECT COUNT(*) FROM stations');
    
    console.log(`   地方: ${finalRegionsCount.rows[0].count}件`);
    console.log(`   都道府県: ${finalPrefecturesCount.rows[0].count}件`);
    console.log(`   駅: ${finalStationsCount.rows[0].count}件`);

    console.log('\n🎉 データベースの初期化が完了しました！');

  } catch (error) {
    console.error('❌ データベースの初期化でエラーが発生しました:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// スクリプトが直接実行された場合にデータ投入を実行
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };