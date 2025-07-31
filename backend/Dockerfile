# ビルドステージ
FROM node:18-alpine AS builder

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# ソースコードをコピー
COPY . .

# TypeScriptをコンパイル
RUN npm run build

# 本番ステージ
FROM node:18-alpine AS production

WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 本番依存関係のみをインストール
RUN npm ci --only=production && npm cache clean --force

# ビルドされたファイルをコピー
COPY --from=builder /app/dist ./dist

# 非rootユーザーを作成
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# ファイルの所有者を変更
RUN chown -R nodejs:nodejs /app
USER nodejs

# ポートを公開
EXPOSE 10000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:10000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# アプリケーションを起動
CMD ["node", "dist/index.js"] 
