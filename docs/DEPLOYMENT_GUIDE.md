# Touvel 完整部署指南

## 概述

本指南將協助您將 Touvel 旅行預訂平台部署到生產環境。系統包含：
- **後端 API**：Node.js + Express + PostgreSQL
- **前端**：React + Vite
- **資料庫**：PostgreSQL

## 部署架構

```
Frontend (Vercel/Netlify)
    ↓ API 請求
Backend (Railway/Heroku/AWS)
    ↓ 查詢
Database (Railway PostgreSQL/AWS RDS)
```

---

## 1. 資料庫部署 (Railway PostgreSQL)

### 1.1 建立 Railway 專案

1. 前往 [Railway.app](https://railway.app)
2. 登入並建立新專案
3. 選擇 "Provision PostgreSQL"
4. 記錄連接資訊：
   - `DATABASE_URL`

### 1.2 初始化資料庫

```bash
# 本地連接到 Railway 資料庫
export DATABASE_URL="你的DATABASE_URL"

# 執行 schema
psql $DATABASE_URL -f database/schema_enhanced.sql

# 匯入測試資料
psql $DATABASE_URL -f database/seed_data.sql
```

---

## 2. 後端部署 (Railway)

### 2.1 準備後端

確保 `backend/package.json` 有正確的 start script：

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 2.2 Railway 部署

1. 在 Railway 專案中點擊 "New Service" → "GitHub Repo"
2. 選擇 `kylec1114/Touvel` repository
3. 設定環境變數：

```env
DATABASE_URL=你的Railway_PostgreSQL_URL
JWT_SECRET=your_strong_random_secret_here_min_32_chars
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://你的前端網址.vercel.app
```

4. 設定 Root Directory：`backend`
5. 部署完成後會獲得後端 URL：`https://touvel-backend.railway.app`

---

## 3. 前端部署 (Vercel)

### 3.1 更新 Vite 配置

確保 `frontend/vite.config.js` 正確設定：

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

### 3.2 Vercel 部署

1. 前往 [Vercel.com](https://vercel.com)
2. Import `kylec1114/Touvel` repository
3. 設定：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. 環境變數：

```env
VITE_API_URL=https://你的後端網址.railway.app
```

5. 部署完成後獲得前端 URL：`https://touvel.vercel.app`

### 3.3 更新後端 CORS

回到 Railway 後端專案，更新環境變數：

```env
CORS_ORIGIN=https://touvel.vercel.app
```

重新部署後端。

---

## 4. 驗證部署

### 4.1 檢查後端

訪問：`https://你的後端網址.railway.app/api`

應該看到 API 文件。

### 4.2 檢查前端

訪問：`https://touvel.vercel.app`

### 4.3 測試完整流程

1. **登入測試**
   - Email: `traveler@example.com`
   - Password: `password123`

2. **瀏覽產品**
   - 前往 "探索產品"
   - 應該看到種子資料中的產品

3. **建立預訂**
   - 選擇產品
   - 選擇日期和人數
   - 獲取報價
   - 建立預訂

4. **供應商測試**
   - 登出並使用 `supplier@example.com` 登入
   - 訪問供應商後台
   - 查看產品列表

---

## 5. 環境變數完整清單

### 後端環境變數 (Railway)

```env
# 資料庫
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=至少32字元的隨機密鑰
JWT_EXPIRE=7d

# 伺服器
NODE_ENV=production
PORT=5000

# CORS
CORS_ORIGIN=https://你的前端網址.vercel.app

# 可選：如需要
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 前端環境變數 (Vercel)

```env
VITE_API_URL=https://你的後端網址.railway.app
```

---

## 6. 替代部署方案

### 6.1 Heroku 部署後端

```bash
# 安裝 Heroku CLI
heroku login

# 建立應用
heroku create touvel-backend

# 設定 buildpack
heroku buildpacks:set heroku/nodejs

# 添加 PostgreSQL
heroku addons:create heroku-postgresql:mini

# 設定環境變數
heroku config:set JWT_SECRET=your_secret

# 部署
git push heroku main

# 執行資料庫 migration
heroku pg:psql < database/schema_enhanced.sql
```

### 6.2 Netlify 部署前端

創建 `frontend/netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/api/*"
  to = "https://你的後端網址.railway.app/api/:splat"
  status = 200
```

---

## 7. 監控與維護

### 7.1 健康檢查

設定監控工具定期檢查：
- `https://你的後端網址.railway.app/health`

### 7.2 日誌檢視

**Railway**:
- 在 Railway dashboard 中查看 Logs 標籤

**Vercel**:
- 在 Vercel dashboard 中查看 Deployments → Logs

### 7.3 資料庫備份

**Railway**:
```bash
# 每日備份
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## 8. 效能優化

### 8.1 CDN 設定

Vercel 自動提供 CDN，無需額外設定。

### 8.2 資料庫索引

已在 schema 中包含，確保已執行：
```sql
SELECT * FROM pg_indexes WHERE tablename IN ('products', 'inventory_slots', 'bookings');
```

### 8.3 快取策略

考慮添加 Redis (Railway 提供):
```bash
# 在 Railway 中添加 Redis plugin
railway add redis
```

---

## 9. 安全檢查清單

- [x] 所有 API 使用 HTTPS
- [x] JWT_SECRET 使用強密碼
- [x] CORS 正確設定
- [x] Rate limiting 已啟用
- [x] 資料庫憑證安全儲存
- [x] 環境變數不提交到 Git

---

## 10. 疑難排解

### 問題：前端無法連接後端

**解決方案**:
1. 檢查 `VITE_API_URL` 是否正確
2. 檢查後端 `CORS_ORIGIN` 設定
3. 查看瀏覽器 Console 錯誤

### 問題：資料庫連接失敗

**解決方案**:
1. 檢查 `DATABASE_URL` 格式
2. 確認資料庫允許外部連接
3. 檢查 SSL 設定

### 問題：登入後 Token 無效

**解決方案**:
1. 確認前後端 `JWT_SECRET` 一致
2. 檢查 Token 過期時間
3. 清除瀏覽器 localStorage

---

## 11. 上線後首次設定

1. **建立管理員帳號**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin@example.com';
```

2. **審核供應商**
```sql
UPDATE suppliers SET kyc_status = 'approved' WHERE id = 'supplier_uuid';
```

3. **設定優惠碼**
```sql
INSERT INTO promo_codes (code, discount_type, discount_value, max_usage, is_active)
VALUES ('LAUNCH2024', 'percentage', 15, 100, true);
```

---

## 12. 持續整合 (可選)

設定 GitHub Actions 自動部署：

創建 `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 完成！

您的 Touvel 平台現已成功部署。訪問前端 URL 即可開始使用。

**前端**: https://touvel.vercel.app  
**後端 API**: https://touvel-backend.railway.app  
**API 文件**: https://touvel-backend.railway.app/api

如有問題，請查閱文件或提交 GitHub Issue。
