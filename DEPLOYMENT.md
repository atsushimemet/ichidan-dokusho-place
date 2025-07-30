# Render デプロイ手順書

## 📋 概要

このドキュメントでは、ichidan-dokusho-placeアプリケーションをRenderにデプロイする手順を説明します。

## 🚀 デプロイ手順

### 1. Renderアカウント作成

1. [Render](https://render.com) にアクセス
2. GitHubアカウントでサインアップ
3. 無料プランで開始

### 2. BluePrintデプロイ

#### 2.1 BluePrint作成
1. Renderダッシュボードで「New Blueprint Instance」をクリック
2. GitHubリポジトリを選択: `atsushimemet/ichidan-dokusho-place`
3. ブランチを選択: `feature/render-deployment`
4. 「Connect」をクリック

#### 2.2 設定確認
`render.yaml`の設定が自動で読み込まれます：

```yaml
services:
  # フロントエンド（静的サイト）
  - type: web
    name: ichidan-dokusho-place-frontend
    env: static
    buildCommand: cd frontend && npm install && npm run build
    staticPublishPath: ./frontend/dist

  # バックエンド（Node.js）
  - type: web
    name: ichidan-dokusho-place-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start

databases:
  # PostgreSQLデータベース
  - name: ichidan-dokusho-place-db
    databaseName: ichidan_dokusho_place
    user: ichidan_dokusho_place_user
```

#### 2.3 デプロイ実行
1. 「Create Blueprint Instance」をクリック
2. デプロイが開始されます（約5-10分）

### 3. 環境変数設定

デプロイ後、以下の環境変数が自動設定されます：

#### フロントエンド
- `VITE_API_URL`: バックエンドのURL（自動設定）

#### バックエンド
- `NODE_ENV`: `production`
- `PORT`: `10000`
- `DATABASE_URL`: PostgreSQL接続文字列（自動設定）

### 4. デプロイ確認

#### 4.1 フロントエンド確認
- URL: `https://ichidan-dokusho-place-frontend.onrender.com`
- ページが正常に表示されることを確認
- 駅選択、喫茶店・本屋の表示をテスト

#### 4.2 バックエンド確認
- URL: `https://ichidan-dokusho-place-backend.onrender.com`
- ヘルスチェック: `/health` エンドポイント
- API動作確認: `/api/stations` エンドポイント

#### 4.3 データベース確認
- Renderダッシュボードでデータベース接続を確認
- サンプルデータが正常に表示されることを確認

## 🔧 トラブルシューティング

### よくある問題

#### 1. ビルドエラー
```
Error: Build failed
```
**解決方法:**
- ログを確認して具体的なエラーを特定
- `package.json`の依存関係を確認
- Node.jsバージョンの互換性を確認

#### 2. 環境変数エラー
```
Error: DATABASE_URL is not defined
```
**解決方法:**
- Renderダッシュボードで環境変数を確認
- データベース接続が正常に設定されているか確認

#### 3. CORSエラー
```
Error: CORS policy blocked
```
**解決方法:**
- バックエンドのCORS設定を確認
- フロントエンドのAPI URLが正しいか確認

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
- PostgreSQLデータベースは自動バックアップ
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
- データベース: 無料（90日間）

### 有料プラン
- バックエンド: $7/月から
- データベース: $7/月から

## 📞 サポート

問題が発生した場合：
1. Renderログを確認
2. GitHub Issuesで報告
3. Renderサポートに問い合わせ

---

**注意**: 本番環境での使用前に、セキュリティ設定とパフォーマンス最適化を実施してください。 
