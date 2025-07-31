import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';

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
}

// データベース初期化
async function initializeDatabase() {
  try {
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

    const stationsCount = await pool.query('SELECT COUNT(*) FROM stations');
    if (parseInt(stationsCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO stations (name, location) VALUES
        ('渋谷駅', '渋谷区'),
        ('新宿駅', '新宿区'),
        ('池袋駅', '池袋区'),
        ('東京駅', '千代田区'),
        ('品川駅', '港区'),
        ('上野駅', '台東区'),
        ('秋葉原駅', '千代田区'),
        ('原宿駅', '渋谷区'),
        ('代官山駅', '渋谷区'),
        ('恵比寿駅', '渋谷区')
      `);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// データベース初期化を実行
initializeDatabase();

app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    message: 'ichidan-dokusho-place API',
    version: '1.0.0',
    endpoints: {
      stations: '/api/stations',
      cafes: '/api/cafes',
      bookstores: '/api/bookstores',
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

// 駅一覧取得（フロントエンド用）
app.get('/api/stations', async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT name FROM stations ORDER BY name');
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

// 駅一覧取得（管理用）
app.get('/api/stations/all', async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM stations ORDER BY name');
    
    const stations: Station[] = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      location: row.location
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
    const { name, location } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ error: '駅名と地域は必須です' });
    }
    
    const result = await pool.query(
      'INSERT INTO stations (name, location) VALUES ($1, $2) RETURNING *',
      [name, location]
    );
    
    const newStation: Station = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location
    };
    
    res.status(201).json(newStation);
  } catch (error: any) {
    if (error.code === '23505') { // UNIQUE制約違反
      return res.status(400).json({ error: 'この駅名は既に登録されています' });
    }
    console.error('Error creating station:', error);
    res.status(500).json({ error: 'Failed to create station' });
  }
});

// 駅編集
app.put('/api/stations/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ error: '駅名と地域は必須です' });
    }
    
    const result = await pool.query(
      'UPDATE stations SET name = $1, location = $2 WHERE id = $3 RETURNING *',
      [name, location, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '駅が見つかりません' });
    }
    
    const updatedStation: Station = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location
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

// 駅削除
app.delete('/api/stations/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    // 駅を使用している喫茶店・本屋があるかチェック
    const cafesResult = await pool.query('SELECT COUNT(*) FROM cafes WHERE station = (SELECT name FROM stations WHERE id = $1)', [id]);
    const bookstoresResult = await pool.query('SELECT COUNT(*) FROM bookstores WHERE station = (SELECT name FROM stations WHERE id = $1)', [id]);
    
    const cafesCount = parseInt(cafesResult.rows[0].count);
    const bookstoresCount = parseInt(bookstoresResult.rows[0].count);
    
    if (cafesCount > 0 || bookstoresCount > 0) {
      return res.status(400).json({ 
        error: 'この駅は使用中のため削除できません',
        details: {
          cafes: cafesCount,
          bookstores: bookstoresCount
        }
      });
    }
    
    const result = await pool.query('DELETE FROM stations WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '駅が見つかりません' });
    }
    
    res.json({ message: '駅を削除しました', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting station:', error);
    res.status(500).json({ error: 'Failed to delete station' });
  }
});

// 喫茶店の全件取得（管理用）
app.get('/api/cafes/all', async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM cafes ORDER BY created_at DESC');
    
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
    console.error('Error fetching all cafes:', error);
    res.status(500).json({ error: 'Failed to fetch cafes' });
  }
});
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

// 喫茶店の編集
app.put('/api/cafes/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
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
      'UPDATE cafes SET name = $1, location = $2, station = $3, google_maps_url = $4, walking_time = $5 WHERE id = $6 RETURNING *',
      [name, location, station, googleMapsUrl, walkingTime || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '喫茶店が見つかりません' });
    }
    
    const updatedCafe: Place = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location,
      station: result.rows[0].station,
      googleMapsUrl: result.rows[0].google_maps_url,
      walkingTime: result.rows[0].walking_time
    };
    
    res.json(updatedCafe);
  } catch (error) {
    console.error('Error updating cafe:', error);
    res.status(500).json({ error: 'Failed to update cafe' });
  }
});

// 喫茶店の削除
app.delete('/api/cafes/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM cafes WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '喫茶店が見つかりません' });
    }
    
    res.json({ message: '喫茶店を削除しました', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting cafe:', error);
    res.status(500).json({ error: 'Failed to delete cafe' });
  }
});

// 本屋の全件取得（管理用）
app.get('/api/bookstores/all', async (req: express.Request, res: express.Response) => {
  try {
    const result = await pool.query('SELECT * FROM bookstores ORDER BY created_at DESC');
    
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
    console.error('Error fetching all bookstores:', error);
    res.status(500).json({ error: 'Failed to fetch bookstores' });
  }
});
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

// 本屋の編集
app.put('/api/bookstores/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
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
      'UPDATE bookstores SET name = $1, location = $2, station = $3, google_maps_url = $4, walking_time = $5 WHERE id = $6 RETURNING *',
      [name, location, station, googleMapsUrl, walkingTime || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '本屋が見つかりません' });
    }
    
    const updatedBookstore: Place = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      location: result.rows[0].location,
      station: result.rows[0].station,
      googleMapsUrl: result.rows[0].google_maps_url,
      walkingTime: result.rows[0].walking_time
    };
    
    res.json(updatedBookstore);
  } catch (error) {
    console.error('Error updating bookstore:', error);
    res.status(500).json({ error: 'Failed to update bookstore' });
  }
});

// 本屋の削除
app.delete('/api/bookstores/:id', async (req: express.Request, res: express.Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM bookstores WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '本屋が見つかりません' });
    }
    
    res.json({ message: '本屋を削除しました', id: parseInt(id) });
  } catch (error) {
    console.error('Error deleting bookstore:', error);
    res.status(500).json({ error: 'Failed to delete bookstore' });
  }
});

function getLocationFromStation(station: string): string {
  const stationToLocation: { [key: string]: string } = {
    '渋谷駅': '渋谷区',
    '新宿駅': '新宿区',
    '池袋駅': '池袋区',
    '東京駅': '千代田区',
    '品川駅': '港区',
    '上野駅': '台東区',
    '秋葉原駅': '千代田区',
    '原宿駅': '渋谷区',
    '代官山駅': '渋谷区',
    '恵比寿駅': '渋谷区'
  };
  
  return stationToLocation[station] || '東京都';
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
}); 
