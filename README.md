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

## 🌐 Renderデプロイ

### デプロイ手順

1. **Renderアカウント作成**
   - [Render](https://render.com) にサインアップ

2. **GitHubリポジトリ連携**
   - GitHubリポジトリをRenderに接続
   - `feature/render-deployment` ブランチを選択

3. **BluePrintデプロイ**
   - `render.yaml` ファイルを使用してBluePrintデプロイ
   - フロントエンド、バックエンド、データベースが自動で作成されます

### 環境変数設定

#### フロントエンド
- `VITE_API_URL`: バックエンドのURL（自動設定）

#### バックエンド
- `NODE_ENV`: `production`
- `PORT`: `10000`
- `DATABASE_URL`: PostgreSQL接続文字列（自動設定）

### デプロイ後のURL

- **フロントエンド**: `https://ichidan-dokusho-place-frontend.onrender.com`
- **バックエンド**: `https://ichidan-dokusho-place-backend.onrender.com`

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
- PostgreSQL 15
- Render (本番環境)

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
├── render.yaml              # Renderデプロイ設定
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
