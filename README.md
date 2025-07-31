# ichidan-dokusho-place

読書の空間設計を支援するプロトタイプ機能です。一段読書と連携し、読書に集中できる場所を見つけるためのアプリケーションです。

## 🎯 概要

インプットの質と習慣性を高めるため、「どこで読むか」「どこで本を買うか」まで含めて、読書の空間設計を支援します。

## 🚀 開発環境の起動

### Docker開発環境での起動

```bash
# 開発環境を起動
docker compose -f docker-compose.dev.yml up --build

# フロントエンド: http://localhost:5173
# バックエンド: http://localhost:3000
# データベース: localhost:5432
```

### ローカル開発環境での起動

#### フロントエンド
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

#### バックエンド
```bash
cd backend
npm install
npm run dev
# http://localhost:3000
```

## 🌐 Renderデプロイ（Neon DB使用・無料プラン）

### デプロイ手順

1. **Neonデータベース作成**
   - [Neon](https://neon.tech) にサインアップ
   - プロジェクト作成: `ichidan-dokusho-place`
   - 接続文字列を取得

2. **Renderアカウント作成**
   - [Render](https://render.com) にサインアップ

3. **バックエンドサービス作成**
   - 「New +」→「Web Service」を選択
   - リポジトリ: `atsushimemet/ichidan-dokusho-place`
   - ブランチ: `feature/render-deployment`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **フロントエンドサービス作成**
   - 「New +」→「Static Site」を選択
   - リポジトリ: `atsushimemet/ichidan-dokusho-place`
   - ブランチ: `feature/render-deployment`
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

5. **環境変数設定**
   - バックエンド: `DATABASE_URL` にNeonの接続文字列を設定
   - フロントエンド: `VITE_API_URL` にバックエンドのURLを設定

### 環境変数設定

#### フロントエンド
- `VITE_API_URL`: バックエンドのURL（手動設定）

#### バックエンド
- `NODE_ENV`: `production`
- `PORT`: `10000`
- `DATABASE_URL`: Neon PostgreSQL接続文字列（手動設定）

### デプロイ後のURL

- **フロントエンド**: `https://ichidan-dokusho-place-frontend.onrender.com`
- **バックエンド**: `https://ichidan-dokusho-place-backend.onrender.com`

### データベース初期化

NeonのSQLエディタで以下のSQLを実行：

```sql
-- 喫茶店テーブル
CREATE TABLE IF NOT EXISTS cafes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    station VARCHAR(255) NOT NULL,
    google_maps_url TEXT NOT NULL,
    walking_time VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 本屋テーブル
CREATE TABLE IF NOT EXISTS bookstores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    station VARCHAR(255) NOT NULL,
    google_maps_url TEXT NOT NULL,
    walking_time VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

詳細な手順は `DEPLOYMENT.md` を参照してください。

## 📋 実装機能

- [x] トップページの実装
- [x] 駅選択機能
- [x] 喫茶店・本屋の表示
- [x] 喫茶店・本屋の登録機能
- [x] 徒歩時間表示
- [x] Google Maps連携
- [x] レスポンシブデザイン
- [x] Docker開発環境
- [x] Renderデプロイ設定
- [x] Neonデータベース対応

## 🛠 技術スタック

### フロントエンド
- React 18.2.0
- TypeScript 5.2.2
- Vite 5.0.8
- Tailwind CSS 3.3.6

### バックエンド
- Node.js 20
- TypeScript 5.3.2
- Express.js 4.18.2
- CORS

### インフラ
- Docker & Docker Compose
- PostgreSQL 15（開発環境）
- Render (本番環境)
- Neon (本番データベース)

## 📁 プロジェクト構造

```
ichidan-dokusho-place/
├── frontend/                 # Reactフロントエンド
│   ├── src/
│   │   ├── App.tsx          # メインコンポーネント
│   │   ├── index.css        # スタイル
│   │   └── main.tsx         # エントリーポイント
│   ├── package.json
│   ├── tailwind.config.js   # Tailwind設定
│   └── vite.config.ts       # Vite設定
├── backend/                  # Expressバックエンド
│   ├── src/
│   │   └── index.ts         # メインサーバー
│   ├── package.json
│   └── tsconfig.json        # TypeScript設定
├── docker-compose.dev.yml    # 開発環境Docker設定
├── render.yaml              # Renderデプロイ設定（有料プラン用）
├── DEPLOYMENT.md            # 詳細デプロイ手順書
└── README.md
```

## 🔧 開発コマンド

### フロントエンド
```bash
cd frontend
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run preview  # ビルドプレビュー
```

### バックエンド
```bash
cd backend
npm run dev      # 開発サーバー起動
npm run build    # TypeScriptコンパイル
npm start        # 本番サーバー起動
```

## 📝 API仕様

### エンドポイント

#### 駅一覧取得
```
GET /api/stations
```

#### 喫茶店一覧取得
```
GET /api/cafes?station={駅名}
```

#### 本屋一覧取得
```
GET /api/bookstores?station={駅名}
```

#### 喫茶店登録
```
POST /api/cafes
Content-Type: application/json

{
  "name": "店舗名",
  "googleMapsUrl": "Google Maps URL",
  "station": "最寄駅",
  "walkingTime": "徒歩時間（分）"
}
```

#### 本屋登録
```
POST /api/bookstores
Content-Type: application/json

{
  "name": "店舗名",
  "googleMapsUrl": "Google Maps URL",
  "station": "最寄駅",
  "walkingTime": "徒歩時間（分）"
}
```

## 🤝 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。
