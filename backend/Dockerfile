# 本番環境用Dockerfile
FROM node:18-alpine

WORKDIR /app

# package.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# TypeScriptをコンパイル
RUN npm run build

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
