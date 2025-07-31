# Render デプロイ手順書（Neon DB使用・無料プラン）

## 📋 概要

このドキュメントでは、ichidan-dokusho-placeアプリケーションをRenderの無料プランでデプロイし、Neonデータベースを使用する手順を説明します。

## 🚀 デプロイ手順

### 1. Neonデータベース作成

#### 1.1 Neonアカウント作成
1. [Neon](https://neon.tech) にアクセス
2. GitHubアカウントでサインアップ
3. 無料プランで開始

#### 1.2 プロジェクト作成
1. 「Create Project」をクリック
2. プロジェクト名: `ichidan-dokusho-place`
3. データベース名: `ichidan_dokusho_place`
4. リージョン: 東京（ap-northeast-1）を推奨
5. 「Create Project」をクリック

#### 1.3 接続情報の取得
1. プロジェクトダッシュボードで「Connection Details」を確認
2. 接続文字列をコピー（例: `postgresql://user:password@ep-xxx.ap-northeast-1.aws.neon.tech/ichidan_dokusho_place`）

### 2. Renderアカウント作成

1. [Render](https://render.com) にアクセス
2. GitHubアカウントでサインアップ
3. 無料プランで開始

### 3. バックエンドサービス作成

#### 3.1 新しいWebサービス作成
1. Renderダッシュボードで「New +」をクリック
2. 「Web Service」を選択
3. GitHubリポジトリを接続: `atsushimemet/ichidan-dokusho-place`
4. ブランチを選択: `feature/render-deployment`

#### 3.2 バックエンド設定
以下の設定を入力：

| 項目 | 値 |
|------|-----|
| **Name** | `ichidan-dokusho-place-backend` |
| **Environment** | `Node` |
| **Region** | `Oregon (US West)` |
| **Branch** | `feature/render-deployment` |
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

**重要**: Start Commandは必ず`npm start`にしてください。`node dist/index.js`ではありません。

#### 3.3 環境変数設定
「Environment Variables」セクションで以下を追加：

| キー | 値 |
|------|-----|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | Neonの接続文字列 |

#### 3.4 デプロイ実行
1. 「Create Web Service」をクリック
2. デプロイが開始されます（約5-10分）

### 4. フロントエンドサービス作成

#### 4.1 新しいStatic Site作成
1. Renderダッシュボードで「New +」をクリック
2. 「Static Site」を選択
3. GitHubリポジトリを接続: `atsushimemet/ichidan-dokusho-place`
4. ブランチを選択: `feature/render-deployment`

#### 4.2 フロントエンド設定
以下の設定を入力：

| 項目 | 値 |
|------|-----|
| **Name** | `ichidan-dokusho-place-frontend` |
| **Branch** | `feature/render-deployment` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

#### 4.3 環境変数設定
「Environment Variables」セクションで以下を追加：

| キー | 値 |
|------|-----|
| `VITE_API_URL` | `https://ichidan-dokusho-place-backend.onrender.com` |

#### 4.4 デプロイ実行
1. 「Create Static Site」をクリック
2. デプロイが開始されます（約3-5分）

### 5. データベース初期化

#### 5.1 テーブル作成
NeonのSQLエディタまたはpsqlで以下のSQLを実行：

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

-- サンプルデータ挿入
INSERT INTO cafes (name, location, station, google_maps_url, walking_time) VALUES
('喫茶 木漏れ日', '渋谷区', '渋谷駅', 'https://maps.google.com/?q=喫茶+木漏れ日+渋谷', '3'),
('珈琲 森の時計', '新宿区', '新宿駅', 'https://maps.google.com/?q=珈琲+森の時計+新宿', '5'),
('喫茶 古書', '池袋区', '池袋駅', 'https://maps.google.com/?q=喫茶+古書+池袋', '2'),
('カフェ 読書空間', '千代田区', '東京駅', 'https://maps.google.com/?q=カフェ+読書空間+東京', '4'),
('喫茶 静寂', '港区', '品川駅', 'https://maps.google.com/?q=喫茶+静寂+品川', '6');

INSERT INTO bookstores (name, location, station, google_maps_url, walking_time) VALUES
('三省堂書店 渋谷店', '渋谷区', '渋谷駅', 'https://maps.google.com/?q=三省堂書店+渋谷店', '2'),
('紀伊國屋書店 新宿本店', '新宿区', '新宿駅', 'https://maps.google.com/?q=紀伊國屋書店+新宿本店', '3'),
('ジュンク堂書店 池袋本店', '池袋区', '池袋駅', 'https://maps.google.com/?q=ジュンク堂書店+池袋本店', '1'),
('丸善 丸の内本店', '千代田区', '東京駅', 'https://maps.google.com/?q=丸善+丸の内本店', '5'),
('有隣堂 品川店', '港区', '品川駅', 'https://maps.google.com/?q=有隣堂+品川店', '4');
```

### 6. デプロイ確認

#### 6.1 フロントエンド確認
- URL: `https://ichidan-dokusho-place-frontend.onrender.com`
- ページが正常に表示されることを確認
- 駅選択、喫茶店・本屋の表示をテスト

#### 6.2 バックエンド確認
- URL: `https://ichidan-dokusho-place-backend.onrender.com`
- ヘルスチェック: `/health` エンドポイント
- API動作確認: `/api/stations` エンドポイント

#### 6.3 データベース確認
- Neonダッシュボードでテーブルとデータを確認
- サンプルデータが正常に表示されることを確認

## 🔧 トラブルシューティング

### よくある問題

#### 1. データベース接続エラー
```
Error: connect ECONNREFUSED
```
**解決方法:**
- Neonの接続文字列が正しいか確認
- ファイアウォール設定を確認
- Neonプロジェクトが有効か確認

#### 2. 環境変数エラー
```
Error: DATABASE_URL is not defined
```
**解決方法:**
- Renderダッシュボードで環境変数を確認
- Neonの接続文字列が正しく設定されているか確認

#### 3. CORSエラー
```
Error: CORS policy blocked
```
**解決方法:**
- バックエンドのCORS設定を確認
- フロントエンドのAPI URLが正しいか確認

#### 4. ビルドエラー
```
Error: Build failed
```
**解決方法:**
- ログを確認して具体的なエラーを特定
- `package.json`の依存関係を確認
- Node.jsバージョンの互換性を確認

#### 5. TypeScriptコンパイルエラー
```
Error: Cannot find module '/opt/render/project/src/backend/dist/index.js'
```
**解決方法:**
- Renderダッシュボードで「Settings」→「Start Command」を確認
- Start Commandが`npm start`になっているか確認
- `package.json`のstartスクリプトが`npm run build && node dist/index.js`になっているか確認
- TypeScriptの設定ファイル（tsconfig.json）が正しいか確認

### ログ確認方法

1. Renderダッシュボードでサービスを選択
2. 「Logs」タブをクリック
3. リアルタイムログを確認

## 📊 監視とメンテナンス

### 自動スケーリング
- 無料プランでは自動スケーリングは無効
- 有料プランにアップグレードで有効化可能

### ヘルスチェック
- バックエンド: `/health` エンドポイント
- フロントエンド: 静的ファイル配信

### バックアップ
- Neonデータベースは自動バックアップ
- 手動バックアップも可能

## 🔄 更新手順

### コード更新時
1. GitHubにプッシュ
2. Renderが自動でデプロイを開始
3. デプロイ完了を確認

### 手動再デプロイ
1. Renderダッシュボードでサービスを選択
2. 「Manual Deploy」をクリック
3. 「Deploy latest commit」を選択

## 💰 コスト

### 無料プラン
- フロントエンド: 無料
- バックエンド: 無料（月512時間）
- Neonデータベース: 無料（月0.5GB）

### 有料プラン
- バックエンド: $7/月から
- Neonデータベース: $5/月から

## 📞 サポート

問題が発生した場合：
1. Renderログを確認
2. Neonログを確認
3. GitHub Issuesで報告
4. Render/Neonサポートに問い合わせ

---

**注意**: 本番環境での使用前に、セキュリティ設定とパフォーマンス最適化を実施してください。 
