import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';
import { regions, prefectures, getPrefecturesByRegionId, getPrefectureIdByLocation } from './regions-data';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS設定を本番環境に適した設定に変更
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ichidan-dokusho-place-frontend.onrender.com',
    'https://ichidan-dokusho-place.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// PostgreSQL接続プール
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

interface Place {
  id: number;
  name: string;
  location: string;
  station: string;
  googleMapsUrl: string;
  walkingTime?: string;
}

interface Station {
  id: number;
  name: string;
  location: string;
  prefecture_id?: number;
}

// データベース初期化
async function initializeDatabase() {
  try {
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

    // テーブル作成
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cafes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        station VARCHAR(255) NOT NULL,
        google_maps_url TEXT NOT NULL,
        walking_time VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookstores (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        station VARCHAR(255) NOT NULL,
        google_maps_url TEXT NOT NULL,
        walking_time VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        location VARCHAR(255) NOT NULL,
        prefecture_id INTEGER REFERENCES prefectures(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // stationsテーブルにprefecture_idカラムを追加（既存テーブル対応）
    await pool.query(`
      ALTER TABLE stations 
      ADD COLUMN IF NOT EXISTS prefecture_id INTEGER REFERENCES prefectures(id)
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bars (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        station VARCHAR(255) NOT NULL,
        google_maps_url TEXT NOT NULL,
        walking_time VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // サンプルデータの挿入（テーブルが空の場合のみ）
    const cafesCount = await pool.query('SELECT COUNT(*) FROM cafes');
    if (parseInt(cafesCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO cafes (name, location, station, google_maps_url, walking_time) VALUES
        ('喫茶 木漏れ日', '渋谷区', '渋谷駅', 'https://maps.google.com/?q=喫茶+木漏れ日+渋谷', '3'),
        ('珈琲 森の時計', '新宿区', '新宿駅', 'https://maps.google.com/?q=珈琲+森の時計+新宿', '5'),
        ('喫茶 古書', '池袋区', '池袋駅', 'https://maps.google.com/?q=喫茶+古書+池袋', '2'),
        ('カフェ 読書空間', '千代田区', '東京駅', 'https://maps.google.com/?q=カフェ+読書空間+東京', '4'),
        ('喫茶 静寂', '港区', '品川駅', 'https://maps.google.com/?q=喫茶+静寂+品川', '6')
      `);
    }

    const bookstoresCount = await pool.query('SELECT COUNT(*) FROM bookstores');
    if (parseInt(bookstoresCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO bookstores (name, location, station, google_maps_url, walking_time) VALUES
        ('三省堂書店 渋谷店', '渋谷区', '渋谷駅', 'https://maps.google.com/?q=三省堂書店+渋谷店', '2'),
        ('紀伊國屋書店 新宿本店', '新宿区', '新宿駅', 'https://maps.google.com/?q=紀伊國屋書店+新宿本店', '3'),
        ('ジュンク堂書店 池袋本店', '池袋区', '池袋駅', 'https://maps.google.com/?q=ジュンク堂書店+池袋本店', '1'),
        ('丸善 丸の内本店', '千代田区', '東京駅', 'https://maps.google.com/?q=丸善+丸の内本店', '5'),
        ('有隣堂 品川店', '港区', '品川駅', 'https://maps.google.com/?q=有隣堂+品川店', '4')
      `);
    }

    // 地方データの投入
    const regionsCount = await pool.query('SELECT COUNT(*) FROM regions');
    if (parseInt(regionsCount.rows[0].count) === 0) {
      for (const region of regions) {
        await pool.query(
          'INSERT INTO regions (id, name, code) VALUES ($1, $2, $3)',
          [region.id, region.name, region.code]
        );
      }
    }

    // 都道府県データの投入
    const prefecturesCount = await pool.query('SELECT COUNT(*) FROM prefectures');
    if (parseInt(prefecturesCount.rows[0].count) === 0) {
      for (const prefecture of prefectures) {
        await pool.query(
          'INSERT INTO prefectures (id, name, code, region_id) VALUES ($1, $2, $3, $4)',
          [prefecture.id, prefecture.name, prefecture.code, prefecture.region_id]
        );
      }
    }

    const stationsCount = await pool.query('SELECT COUNT(*) FROM stations');
    if (parseInt(stationsCount.rows[0].count) === 0) {
      const stationData = [
        { name: '渋谷駅', location: '渋谷区' },
        { name: '新宿駅', location: '新宿区' },
        { name: '池袋駅', location: '池袋区' },
        { name: '東京駅', location: '千代田区' },
        { name: '品川駅', location: '港区' },
        { name: '上野駅', location: '台東区' },
        { name: '秋葉原駅', location: '千代田区' },
        { name: '原宿駅', location: '渋谷区' },
        { name: '代官山駅', location: '渋谷区' },
        { name: '恵比寿駅', location: '渋谷区' }
      ];

      for (const station of stationData) {
        const prefectureId = getPrefectureIdByLocation(station.location);
        await pool.query(
          'INSERT INTO stations (name, location, prefecture_id) VALUES ($1, $2, $3)',
          [station.name, station.location, prefectureId]
        );
      }
    }

    // 既存の駅データにprefecture_idを設定
    await updateStationsPrefectureIds();

    const barsCount = await pool.query('SELECT COUNT(*) FROM bars');
    if (parseInt(barsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO bars (name, location, station, google_maps_url, walking_time) VALUES
        ('バー 読書空間', '渋谷区', '渋谷駅', 'https://maps.google.com/?q=バー+読書空間+渋谷', '3'),
        ('BAR 静寂', '新宿区', '新宿駅', 'https://maps.google.com/?q=BAR+静寂+新宿', '4'),
        ('酒場 古書', '池袋区', '池袋駅', 'https://maps.google.com/?q=酒場+古書+池袋', '2'),
        ('PUB 読書', '千代田区', '東京駅', 'https://maps.google.com/?q=PUB+読書+東京', '5'),
        ('バー 木漏れ日', '港区', '品川駅', 'https://maps.google.com/?q=バー+木漏れ日+品川', '3')
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// 既存の駅データにprefecture_idを設定する関数
async function updateStationsPrefectureIds() {
  try {
    const stations = await pool.query('SELECT id, location FROM stations WHERE prefecture_id IS NULL');
    
    for (const station of stations.rows) {
      const prefectureId = getPrefectureIdByLocation(station.location);
      if (prefectureId) {
        await pool.query(
          'UPDATE stations SET prefecture_id = $1 WHERE id = $2',
          [prefectureId, station.id]
        );
      }
    }
  } catch (error) {
    console.error('Error updating stations prefecture_ids:', error);
  }
}

// データベース初期化を実行
initializeDatabase();

app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'ichidan-dokusho-place API',
    version: '1.0.0',
    endpoints: {
      regions: '/api/regions',
      prefectures: '/api/prefectures',
      stations: '/api/stations',
      cafes: '/api/cafes',
      bookstores: '/api/bookstores',
      bars: '/api/bars',
      health: '/health'
    }
  });
});

app.get('/health', async (req: express.Request, res: express.Response) => {
  try {
    const cafesResult = await pool.query('SELECT COUNT(*) FROM cafes');
    const bookstoresResult = await pool.query('SELECT COUNT(*) FROM bookstores');
    
    res.json({
      status: 'healthy',
      database: 'connected',
      cafes: parseInt(cafesResult.rows[0].count),
      bookstores: parseInt(bookstoresResult.rows[0].count)
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// === 新しい階層データ取得API ===

// 地方一覧取得
app.get('/api/regions', async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM regions ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.json(regions); // フォールバック
  }
});

// 都道府県一覧取得（地方IDでフィルタ可能）
app.get('/api/prefectures', async (req: express.Request, res: express.Response) => {
  try {
    const { region_id } = req.query;
    let query = 'SELECT * FROM prefectures';
    let params: any[] = [];
    
    if (region_id) {
      query += ' WHERE region_id = $1';
      params.push(parseInt(region_id as string));
    }
    
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching prefectures:', error);
    // フォールバック
    if (req.query.region_id) {
      const regionId = parseInt(req.query.region_id as string);
      res.json(getPrefecturesByRegionId(regionId));
    } else {
      res.json(prefectures);
    }
  }
});

// 駅一覧取得（都道府県IDでフィルタ可能、フロントエンド用）
app.get('/api/stations', async (req: express.Request, res: express.Response) => {
  try {
    const { prefecture_id } = req.query;
    let query = 'SELECT name FROM stations';
    let params: any[] = [];
    
    if (prefecture_id) {
      query += ' WHERE prefecture_id = $1';
      params.push(parseInt(prefecture_id as string));
    }
    
    query += ' ORDER BY name';
    const result = await pool.query(query, params);
    const stations = result.rows.map((row: any) => row.name);
    res.json(stations);
  } catch (error) {
    console.error('Error fetching stations:', error);
    // フォールバック: ハードコードされた駅リスト
    const stations = [
      '渋谷駅', '新宿駅', '池袋駅', '東京駅', '品川駅',
      '上野駅', '秋葉原駅', '原宿駅', '代官山駅', '恵比寿駅'
    ];
    res.json(stations);
  }
});

// 駅一覧取得（管理画面用）
app.get('/api/stations/all', async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query(`
      SELECT s.*, p.name as prefecture_name, r.name as region_name 
      FROM stations s
      LEFT JOIN prefectures p ON s.prefecture_id = p.id
      LEFT JOIN regions r ON p.region_id = r.id
      ORDER BY s.created_at DESC
    `);
    
    const stations = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      prefecture_id: row.prefecture_id,
      prefecture_name: row.prefecture_name,
      region_name: row.region_name,
      created_at: row.created_at
    }));
    res.json(stations);
  } catch (error) {
    console.error('Error fetching all stations:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// 駅登録
app.post('/api/stations', async (req: express.Request, res: express.Response) => {
  try {
    console.log('🚉 Station registration attempt:', req.body);
    console.log('🚉 Request headers:', req.headers);
    const { name, location, prefecture_id } = req.body;
    
    if (!name || !location) {
      console.log('❌ Validation failed: missing name or location');
      console.log('❌ Name:', name, 'Location:', location);
      return res.status(400).json({ error: '駅名と地域は必須です' });
    }
    
    // prefecture_idが指定されていない場合、locationから推測
    let finalPrefectureId = prefecture_id;
    if (!finalPrefectureId) {
      finalPrefectureId = getPrefectureIdByLocation(location);
    }
    
    // 既存の駅をチェック
    const existingStation = await pool.query('SELECT * FROM stations WHERE name = $1', [name]);
    if (existingStation.rows.length > 0) {
      console.log('❌ Station already exists:', existingStation.rows[0]);
      return res.status(400).json({ error: 'この駅名は既に登録されています' });
    }
    
    const result = await pool.query(
      'INSERT INTO stations (name, location, prefecture_id) VALUES ($1, $2, $3) RETURNING *',
      [name, location, finalPrefectureId]
    );
    
    const newStation: Station = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location,
      prefecture_id: result.rows[0].prefecture_id
    };
    
    console.log('✅ Station created successfully:', newStation);
    res.status(201).json(newStation);
  } catch (error: any) {
    console.error('❌ Error creating station:', error);
    if (error.code === '23505') { // UNIQUE violation
      res.status(400).json({ error: 'この駅名は既に登録されています' });
    } else {
      res.status(500).json({ error: 'Failed to create station' });
    }
  }
});

// 駅編集
app.put('/api/stations/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { name, location, prefecture_id } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ error: '駅名と地域は必須です' });
    }
    
    // prefecture_idが指定されていない場合、locationから推測
    let finalPrefectureId = prefecture_id;
    if (!finalPrefectureId) {
      finalPrefectureId = getPrefectureIdByLocation(location);
    }
    
    const result = await pool.query(
      'UPDATE stations SET name = $1, location = $2, prefecture_id = $3 WHERE id = $4 RETURNING *',
      [name, location, finalPrefectureId, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '駅が見つかりません' });
    }
    
    const updatedStation: Station = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location,
      prefecture_id: result.rows[0].prefecture_id
    };
    
    res.json(updatedStation);
  } catch (error: any) {
    if (error.code === '23505') { // UNIQUE制約違反
      return res.status(400).json({ error: 'この駅名は既に登録されています' });
    }
    console.error('Error updating station:', error);
    res.status(500).json({ error: 'Failed to update station' });
  }
});

// 駅削除（管理画面用）
app.delete('/api/stations/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM stations WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }
    
    res.json({ message: 'Station deleted successfully' });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ error: 'Failed to delete station' });
  }
});

// 喫茶店一覧取得
app.get('/api/cafes', async (req: express.Request, res: express.Response) => {
  try {
    const { station } = req.query;
    let query = 'SELECT * FROM cafes';
    let params: string[] = [];

    if (station) {
      query += ' WHERE station = $1';
      params.push(station as string);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    
    const cafes: Place[] = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      station: row.station,
      googleMapsUrl: row.google_maps_url,
      walkingTime: row.walking_time
    }));

    res.json(cafes);
  } catch (error) {
    console.error('Error fetching cafes:', error);
    res.status(500).json({ error: 'Failed to fetch cafes' });
  }
});

// 喫茶店一覧取得（管理画面用）
app.get('/api/cafes/all', async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM cafes ORDER BY created_at DESC');
    const cafes = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      station: row.station,
      google_maps_url: row.google_maps_url,
      walking_time: row.walking_time,
      created_at: row.created_at
    }));
    res.json(cafes);
  } catch (error) {
    console.error('Error fetching all cafes:', error);
    res.status(500).json({ error: 'Failed to fetch cafes' });
  }
});

// 喫茶店削除（管理画面用）
app.delete('/api/cafes/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cafes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cafe not found' });
    }
    
    res.json({ message: 'Cafe deleted successfully' });
  } catch (error) {
    console.error('Error deleting cafe:', error);
    res.status(500).json({ error: 'Failed to delete cafe' });
  }
});

// 喫茶店登録
app.post('/api/cafes', async (req: express.Request, res: express.Response) => {
  try {
    const { name, googleMapsUrl, station, walkingTime } = req.body;
    
    if (!name || !googleMapsUrl || !station) {
      return res.status(400).json({ error: '店舗名、Google Maps URL、最寄駅は必須です' });
    }
    
    // 徒歩時間のバリデーション
    if (walkingTime) {
      const walkingTimeNum = parseInt(walkingTime);
      if (isNaN(walkingTimeNum) || walkingTimeNum < 1 || walkingTimeNum > 60) {
        return res.status(400).json({ error: '徒歩時間は1〜60分の整数で入力してください' });
      }
    }
    
    const location = getLocationFromStation(station);
    
    const result = await pool.query(
      'INSERT INTO cafes (name, location, station, google_maps_url, walking_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, location, station, googleMapsUrl, walkingTime || null]
    );
    
    const newCafe: Place = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location,
      station: result.rows[0].station,
      googleMapsUrl: result.rows[0].google_maps_url,
      walkingTime: result.rows[0].walking_time
    };
    
    res.status(201).json(newCafe);
  } catch (error) {
    console.error('Error creating cafe:', error);
    res.status(500).json({ error: 'Failed to create cafe' });
  }
});

// 本屋一覧取得
app.get('/api/bookstores', async (req: express.Request, res: express.Response) => {
  try {
    const { station } = req.query;
    let query = 'SELECT * FROM bookstores';
    let params: string[] = [];

    if (station) {
      query += ' WHERE station = $1';
      params.push(station as string);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    
    const bookstores: Place[] = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      station: row.station,
      googleMapsUrl: row.google_maps_url,
      walkingTime: row.walking_time
    }));

    res.json(bookstores);
  } catch (error) {
    console.error('Error fetching bookstores:', error);
    res.status(500).json({ error: 'Failed to fetch bookstores' });
  }
});

// 本屋一覧取得（管理画面用）
app.get('/api/bookstores/all', async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM bookstores ORDER BY created_at DESC');
    const bookstores = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      station: row.station,
      google_maps_url: row.google_maps_url,
      walking_time: row.walking_time,
      created_at: row.created_at
    }));
    res.json(bookstores);
  } catch (error) {
    console.error('Error fetching all bookstores:', error);
    res.status(500).json({ error: 'Failed to fetch bookstores' });
  }
});

// 本屋削除（管理画面用）
app.delete('/api/bookstores/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM bookstores WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bookstore not found' });
    }
    
    res.json({ message: 'Bookstore deleted successfully' });
  } catch (error) {
    console.error('Error deleting bookstore:', error);
    res.status(500).json({ error: 'Failed to delete bookstore' });
  }
});

// 本屋登録
app.post('/api/bookstores', async (req: express.Request, res: express.Response) => {
  try {
    const { name, googleMapsUrl, station, walkingTime } = req.body;
    
    if (!name || !googleMapsUrl || !station) {
      return res.status(400).json({ error: '店舗名、Google Maps URL、最寄駅は必須です' });
    }
    
    // 徒歩時間のバリデーション
    if (walkingTime) {
      const walkingTimeNum = parseInt(walkingTime);
      if (isNaN(walkingTimeNum) || walkingTimeNum < 1 || walkingTimeNum > 60) {
        return res.status(400).json({ error: '徒歩時間は1〜60分の整数で入力してください' });
      }
    }
    
    const location = getLocationFromStation(station);
    
    const result = await pool.query(
      'INSERT INTO bookstores (name, location, station, google_maps_url, walking_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, location, station, googleMapsUrl, walkingTime || null]
    );
    
    const newBookstore: Place = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location,
      station: result.rows[0].station,
      googleMapsUrl: result.rows[0].google_maps_url,
      walkingTime: result.rows[0].walking_time
    };
    
    res.status(201).json(newBookstore);
  } catch (error) {
    console.error('Error creating bookstore:', error);
    res.status(500).json({ error: 'Failed to create bookstore' });
  }
});

// バー一覧取得
app.get('/api/bars', async (req: express.Request, res: express.Response) => {
  try {
    const { station } = req.query;
    let query = 'SELECT * FROM bars';
    let params: string[] = [];

    if (station) {
      query += ' WHERE station = $1';
      params.push(station as string);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    
    const bars: Place[] = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      station: row.station,
      googleMapsUrl: row.google_maps_url,
      walkingTime: row.walking_time
    }));

    res.json(bars);
  } catch (error) {
    console.error('Error fetching bars:', error);
    res.status(500).json({ error: 'Failed to fetch bars' });
  }
});

// バー一覧取得（管理画面用）
app.get('/api/bars/all', async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM bars ORDER BY created_at DESC');
    const bars = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location,
      station: row.station,
      google_maps_url: row.google_maps_url,
      walking_time: row.walking_time,
      created_at: row.created_at
    }));
    res.json(bars);
  } catch (error) {
    console.error('Error fetching all bars:', error);
    res.status(500).json({ error: 'Failed to fetch bars' });
  }
});

// バー削除（管理画面用）
app.delete('/api/bars/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM bars WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bar not found' });
    }
    
    res.json({ message: 'Bar deleted successfully' });
  } catch (error) {
    console.error('Error deleting bar:', error);
    res.status(500).json({ error: 'Failed to delete bar' });
  }
});

// バー登録
app.post('/api/bars', async (req: express.Request, res: express.Response) => {
  try {
    const { name, googleMapsUrl, station, walkingTime } = req.body;
    
    if (!name || !googleMapsUrl || !station) {
      return res.status(400).json({ error: '店舗名、Google Maps URL、最寄駅は必須です' });
    }
    
    // 徒歩時間のバリデーション
    if (walkingTime) {
      const walkingTimeNum = parseInt(walkingTime);
      if (isNaN(walkingTimeNum) || walkingTimeNum < 1 || walkingTimeNum > 60) {
        return res.status(400).json({ error: '徒歩時間は1〜60分の整数で入力してください' });
      }
    }
    
    const location = getLocationFromStation(station);
    
    const result = await pool.query(
      'INSERT INTO bars (name, location, station, google_maps_url, walking_time) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, location, station, googleMapsUrl, walkingTime || null]
    );
    
    const newBar: Place = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location,
      station: result.rows[0].station,
      googleMapsUrl: result.rows[0].google_maps_url,
      walkingTime: result.rows[0].walking_time
    };
    
    res.status(201).json(newBar);
  } catch (error) {
    console.error('Error creating bar:', error);
    res.status(500).json({ error: 'Failed to create bar' });
  }
});

// 駅から区を取得するヘルパー関数
function getLocationFromStation(station: string): string {
  const stationLocationMap: { [key: string]: string } = {
    '渋谷駅': '渋谷区',
    '新宿駅': '新宿区',
    '池袋駅': '池袋区',
    '東京駅': '千代田区',
    '品川駅': '港区',
    '上野駅': '台東区',
    '秋葉原駅': '千代田区',
    '原宿駅': '渋谷区',
    '代官山駅': '目黒区',
    '恵比寿駅': '渋谷区'
  };
  
  return stationLocationMap[station] || '不明';
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 ichidan-dokusho-place API ready`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`🗄️ Database URL: ${process.env.DATABASE_URL ? 'Connected' : 'Not set'}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 CORS Origins:`, corsOptions.origin);
}); 
