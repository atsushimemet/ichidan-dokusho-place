import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// サンプルデータ
const cafes = [
  {
    id: 1,
    name: '喫茶 木漏れ日',
    location: '渋谷区',
    station: '渋谷駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶+木漏れ日+渋谷'
  },
  {
    id: 2,
    name: 'スターバックス 渋谷店',
    location: '渋谷区',
    station: '渋谷駅',
    googleMapsUrl: 'https://maps.google.com/?q=スターバックス+渋谷店'
  },
  {
    id: 3,
    name: '喫茶 古書',
    location: '新宿区',
    station: '新宿駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶+古書+新宿'
  },
  {
    id: 4,
    name: '喫茶 珈琲亭',
    location: '新宿区',
    station: '新宿駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶+珈琲亭+新宿'
  },
  {
    id: 5,
    name: '喫茶 読書堂',
    location: '池袋区',
    station: '池袋駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶+読書堂+池袋'
  },
  {
    id: 6,
    name: 'スターバックス 池袋店',
    location: '池袋区',
    station: '池袋駅',
    googleMapsUrl: 'https://maps.google.com/?q=スターバックス+池袋店'
  },
  {
    id: 7,
    name: '喫茶 思索',
    location: '千代田区',
    station: '東京駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶+思索+東京駅'
  },
  {
    id: 8,
    name: '喫茶 文庫',
    location: '千代田区',
    station: '東京駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶+文庫+東京駅'
  },
  {
    id: 9,
    name: '喫茶 海辺',
    location: '港区',
    station: '品川駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶+海辺+品川'
  },
  {
    id: 10,
    name: '喫茶 学術',
    location: '港区',
    station: '品川駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶+学術+品川'
  }
];

const bookstores = [
  {
    id: 1,
    name: '三省堂書店 渋谷店',
    location: '渋谷区',
    station: '渋谷駅',
    googleMapsUrl: 'https://maps.google.com/?q=三省堂書店+渋谷店'
  },
  {
    id: 2,
    name: '蔦屋書店 代官山店',
    location: '目黒区',
    station: '代官山駅',
    googleMapsUrl: 'https://maps.google.com/?q=蔦屋書店+代官山店'
  },
  {
    id: 3,
    name: '紀伊國屋書店 新宿本店',
    location: '新宿区',
    station: '新宿駅',
    googleMapsUrl: 'https://maps.google.com/?q=紀伊國屋書店+新宿本店'
  },
  {
    id: 4,
    name: 'ジュンク堂書店 池袋本店',
    location: '池袋区',
    station: '池袋駅',
    googleMapsUrl: 'https://maps.google.com/?q=ジュンク堂書店+池袋本店'
  },
  {
    id: 5,
    name: '丸善 丸の内本店',
    location: '千代田区',
    station: '東京駅',
    googleMapsUrl: 'https://maps.google.com/?q=丸善+丸の内本店'
  },
  {
    id: 6,
    name: '有隣堂 品川店',
    location: '港区',
    station: '品川駅',
    googleMapsUrl: 'https://maps.google.com/?q=有隣堂+品川店'
  },
  {
    id: 7,
    name: 'ブックファースト 上野店',
    location: '台東区',
    station: '上野駅',
    googleMapsUrl: 'https://maps.google.com/?q=ブックファースト+上野店'
  },
  {
    id: 8,
    name: '書泉 秋葉原店',
    location: '千代田区',
    station: '秋葉原駅',
    googleMapsUrl: 'https://maps.google.com/?q=書泉+秋葉原店'
  },
  {
    id: 9,
    name: 'ブックファースト 原宿店',
    location: '渋谷区',
    station: '原宿駅',
    googleMapsUrl: 'https://maps.google.com/?q=ブックファースト+原宿店'
  },
  {
    id: 10,
    name: '恵文社 恵比寿店',
    location: '渋谷区',
    station: '恵比寿駅',
    googleMapsUrl: 'https://maps.google.com/?q=恵文社+恵比寿店'
  }
];

// ルート
app.get('/', (req, res) => {
  res.json({
    message: 'ichidan-dokusho-place API',
    version: '1.0.0',
    description: '読書に集中できる場所をレコメンドするAPI'
  });
});

// 喫茶店一覧API
app.get('/api/cafes', (req, res) => {
  const { station } = req.query;
  
  if (station) {
    const filteredCafes = cafes.filter(cafe => cafe.station === station);
    res.json(filteredCafes);
  } else {
    res.json(cafes);
  }
});

// 本屋一覧API
app.get('/api/bookstores', (req, res) => {
  const { station } = req.query;
  
  if (station) {
    const filteredBookstores = bookstores.filter(bookstore => bookstore.station === station);
    res.json(filteredBookstores);
  } else {
    res.json(bookstores);
  }
});

// 駅一覧API
app.get('/api/stations', (req, res) => {
  const stations = [
    '渋谷駅',
    '新宿駅', 
    '池袋駅',
    '東京駅',
    '品川駅',
    '上野駅',
    '秋葉原駅',
    '原宿駅',
    '代官山駅',
    '恵比寿駅'
  ];
  res.json(stations);
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📚 ichidan-dokusho-place API ready`);
  console.log(`🌐 http://localhost:${PORT}`);
}); 
