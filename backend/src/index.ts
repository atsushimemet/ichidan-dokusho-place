import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

interface Place {
  id: number;
  name: string;
  location: string;
  station: string;
  googleMapsUrl: string;
  walkingTime?: string;
}

let cafes: Place[] = [
  {
    id: 1,
    name: '喫茶 木漏れ日',
    location: '渋谷区',
    station: '渋谷駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶+木漏れ日+渋谷',
    walkingTime: '3分'
  },
  {
    id: 2,
    name: 'カフェ ブックエンド',
    location: '新宿区',
    station: '新宿駅',
    googleMapsUrl: 'https://maps.google.com/?q=カフェ+ブックエンド+新宿',
    walkingTime: '5分'
  },
  {
    id: 3,
    name: '読書カフェ 静寂',
    location: '池袋区',
    station: '池袋駅',
    googleMapsUrl: 'https://maps.google.com/?q=読書カフェ+静寂+池袋',
    walkingTime: '7分'
  },
  {
    id: 4,
    name: 'コーヒーショップ ページ',
    location: '千代田区',
    station: '東京駅',
    googleMapsUrl: 'https://maps.google.com/?q=コーヒーショップ+ページ+東京',
    walkingTime: '4分'
  },
  {
    id: 5,
    name: '喫茶室 思索',
    location: '港区',
    station: '品川駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶室+思索+品川',
    walkingTime: '6分'
  },
  {
    id: 6,
    name: 'カフェ リテラチャー',
    location: '台東区',
    station: '上野駅',
    googleMapsUrl: 'https://maps.google.com/?q=カフェ+リテラチャー+上野',
    walkingTime: '8分'
  },
  {
    id: 7,
    name: '読書スペース デジタル',
    location: '千代田区',
    station: '秋葉原駅',
    googleMapsUrl: 'https://maps.google.com/?q=読書スペース+デジタル+秋葉原',
    walkingTime: '2分'
  },
  {
    id: 8,
    name: 'カフェ アートブック',
    location: '渋谷区',
    station: '原宿駅',
    googleMapsUrl: 'https://maps.google.com/?q=カフェ+アートブック+原宿',
    walkingTime: '4分'
  },
  {
    id: 9,
    name: '喫茶店 文庫',
    location: '目黒区',
    station: '代官山駅',
    googleMapsUrl: 'https://maps.google.com/?q=喫茶店+文庫+代官山',
    walkingTime: '5分'
  },
  {
    id: 10,
    name: 'カフェ エッセイ',
    location: '渋谷区',
    station: '恵比寿駅',
    googleMapsUrl: 'https://maps.google.com/?q=カフェ+エッセイ+恵比寿',
    walkingTime: '3分'
  }
];

let bookstores: Place[] = [
  {
    id: 1,
    name: '三省堂書店 渋谷店',
    location: '渋谷区',
    station: '渋谷駅',
    googleMapsUrl: 'https://maps.google.com/?q=三省堂書店+渋谷店',
    walkingTime: '2分'
  },
  {
    id: 2,
    name: '紀伊國屋書店 新宿本店',
    location: '新宿区',
    station: '新宿駅',
    googleMapsUrl: 'https://maps.google.com/?q=紀伊國屋書店+新宿本店',
    walkingTime: '1分'
  },
  {
    id: 3,
    name: 'ジュンク堂書店 池袋本店',
    location: '池袋区',
    station: '池袋駅',
    googleMapsUrl: 'https://maps.google.com/?q=ジュンク堂書店+池袋本店',
    walkingTime: '3分'
  },
  {
    id: 4,
    name: '丸善 東京駅店',
    location: '千代田区',
    station: '東京駅',
    googleMapsUrl: 'https://maps.google.com/?q=丸善+東京駅店',
    walkingTime: '5分'
  },
  {
    id: 5,
    name: '有隣堂 品川店',
    location: '港区',
    station: '品川駅',
    googleMapsUrl: 'https://maps.google.com/?q=有隣堂+品川店',
    walkingTime: '4分'
  },
  {
    id: 6,
    name: '書泉 上野店',
    location: '台東区',
    station: '上野駅',
    googleMapsUrl: 'https://maps.google.com/?q=書泉+上野店',
    walkingTime: '6分'
  },
  {
    id: 7,
    name: '書泉 秋葉原店',
    location: '千代田区',
    station: '秋葉原駅',
    googleMapsUrl: 'https://maps.google.com/?q=書泉+秋葉原店',
    walkingTime: '2分'
  },
  {
    id: 8,
    name: 'ブックファースト 原宿店',
    location: '渋谷区',
    station: '原宿駅',
    googleMapsUrl: 'https://maps.google.com/?q=ブックファースト+原宿店',
    walkingTime: '3分'
  },
  {
    id: 9,
    name: '蔦屋書店 代官山店',
    location: '目黒区',
    station: '代官山駅',
    googleMapsUrl: 'https://maps.google.com/?q=蔦屋書店+代官山店',
    walkingTime: '7分'
  },
  {
    id: 10,
    name: '有隣堂 恵比寿店',
    location: '渋谷区',
    station: '恵比寿駅',
    googleMapsUrl: 'https://maps.google.com/?q=有隣堂+恵比寿店',
    walkingTime: '4分'
  }
];

// ヘルスチェック
app.get('/', (req, res) => {
  res.json({ 
    message: 'ichidan-dokusho-place API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      cafes: '/api/cafes',
      bookstores: '/api/bookstores',
      stations: '/api/stations'
    }
  });
});

// 喫茶店一覧取得
app.get('/api/cafes', (req, res) => {
  const { station } = req.query;
  
  if (station) {
    const filteredCafes = cafes.filter(cafe => cafe.station === station);
    res.json(filteredCafes);
  } else {
    res.json(cafes);
  }
});

// 喫茶店登録
app.post('/api/cafes', (req, res) => {
  const { name, googleMapsUrl, station, walkingTime } = req.body;
  
  if (!name || !googleMapsUrl || !station) {
    return res.status(400).json({ error: '店舗名、Google Maps URL、最寄駅は必須です' });
  }
  
  const newCafe: Place = {
    id: cafes.length + 1,
    name,
    location: getLocationFromStation(station),
    station,
    googleMapsUrl,
    walkingTime: walkingTime || '不明'
  };
  
  cafes.push(newCafe);
  res.status(201).json(newCafe);
});

// 本屋一覧取得
app.get('/api/bookstores', (req, res) => {
  const { station } = req.query;
  
  if (station) {
    const filteredBookstores = bookstores.filter(bookstore => bookstore.station === station);
    res.json(filteredBookstores);
  } else {
    res.json(bookstores);
  }
});

// 本屋登録
app.post('/api/bookstores', (req, res) => {
  const { name, googleMapsUrl, station, walkingTime } = req.body;
  
  if (!name || !googleMapsUrl || !station) {
    return res.status(400).json({ error: '店舗名、Google Maps URL、最寄駅は必須です' });
  }
  
  const newBookstore: Place = {
    id: bookstores.length + 1,
    name,
    location: getLocationFromStation(station),
    station,
    googleMapsUrl,
    walkingTime: walkingTime || '不明'
  };
  
  bookstores.push(newBookstore);
  res.status(201).json(newBookstore);
});

// 駅一覧取得
app.get('/api/stations', (req, res) => {
  const stations = [
    '渋谷駅', '新宿駅', '池袋駅', '東京駅', '品川駅',
    '上野駅', '秋葉原駅', '原宿駅', '代官山駅', '恵比寿駅'
  ];
  res.json(stations);
});

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      cafes: cafes.length,
      bookstores: bookstores.length
    }
  });
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
}); 
