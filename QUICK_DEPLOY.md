# Touvel - 快速上線部署指南

## 快速開始 (5分鐘內上線)

如果你想快速睇吓個網站係咪可以運作，可以用呢個簡化版本。我哋會用免費服務快速部署：

## 方案 1: 用 Railway + Vercel (推薦 - 最快)

### Frontend部署 (Vercel) - 1分鐘

1. 去 https://vercel.com 註冊帳號
2. 點擊 "Import Git Repository"
3. 選擇你嘅 Touvel repository
4. 喺 "Root Directory" 改成 `frontend`
5. 添加 Environment Variables:
   ```
   VITE_API_URL=https://your-railway-backend.up.railway.app/api
   ```
6. Deploy!

🎉 完成！你嘅前端會自動部署到: `touvel.vercel.app`

### Backend部署 (Railway) - 2分鐘

1. 去 https://railway.app 註冊帳號
2. 點擊 "Create New Project"
3. 選 "Deploy from GitHub"
4. 授權並選擇 Touvel repository
5. 添加 Environment Variables:
   ```
   DATABASE_HOST=your-mysql-host
   DATABASE_USER=your_user
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=touvel_db
   JWT_SECRET=your_super_secret_key_12345
   NODE_ENV=production
   PORT=3000
   ```
6. Deploy!

🎉 完成！你嘅後端會自動部署到: `https://your-project.up.railway.app`

---

## 方案 2: 用 GitHub Pages + Heroku (免費但較慢)

### Frontend部署 (GitHub Pages)

1. 編輯 `frontend/vite.config.js`:
   ```javascript
   export default {
     build: {
       outDir: 'dist'
     },
     base: '/Touvel/'
   }
   ```

2. 編輯 `package.json` 添加:
   ```json
   "homepage": "https://kylec1114.github.io/Touvel/"
   ```

3. 執行:
   ```bash
   cd frontend
   npm run build
   npm install gh-pages --save-dev
   ```

4. 編輯 `package.json` scripts:
   ```json
   "deploy": "gh-pages -d dist"
   ```

5. 執行:
   ```bash
   npm run deploy
   ```

🎉 完成！訪問: `https://kylec1114.github.io/Touvel/`

### Backend部署 (Heroku)

1. 去 https://heroku.com 註冊帳號
2. 安裝 Heroku CLI
3. 執行:
   ```bash
   cd backend
   heroku login
   heroku create touvel-api
   heroku config:set DATABASE_HOST=your-db-host
   heroku config:set DATABASE_USER=your_user
   heroku config:set JWT_SECRET=your_secret
   git push heroku main
   ```

---

## 方案 3: 最簡單 - 用 Vercel 嘅 Serverless Backend

1. 在 `frontend` 目錄創建 `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist"
   }
   ```

2. 在 `api` 目錄創建 serverless functions (Node.js)
3. 全部用 Vercel 部署

---

## 測試清單

部署後，檢查以下功能:

- [ ] 網站能否訪問
- [ ] 登入頁面能否正常顯示
- [ ] 首頁搜尋目的地功能
- [ ] 用戶註冊功能
- [ ] 登入功能
- [ ] 查看我的預訂頁面
- [ ] 建立新預訂
- [ ] 取消預訂

---

## 常見問題

### 1. CORS 錯誤

**解決方案**: 在 backend `server.js` 添加:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### 2. 數據庫連接失敗

**檢查清單**:
- ✅ Database 地址正確？
- ✅ 用戶名和密碼正確？
- ✅ 數據庫已建立？
- ✅ 防火牆允許連接？

### 3. 環境變量未讀取

**Railway 解決方案**:
1. 去 Project Settings
2. 點擊 "Variables"
3. 確認所有變數已添加
4. 重新部署

---

## 下一步

一旦基礎部署完成:

1. **添加樣本數據** - 在數據庫添加 10 個旅遊目的地
2. **配置自定義域名** - 用你自己嘅域名而不是 vercel.app
3. **設置 SSL 憑證** - 所有服務都會自動配置 HTTPS
4. **監控性能** - 用 Vercel 和 Railway 嘅儀表板監控

---

## 推薦配置

**最簡單方案 (我建議):**
- Frontend: Vercel (自動部署，免費 SSL)
- Backend: Railway (1 click 部署，免費額度)
- Database: Neon (PostgreSQL) 或 PlanetScale (MySQL)

**成本**: 完全免費！✨

---

## 需要幫助?

如果部署過程中有任何問題，檢查以下文件:
- `docs/DEPLOYMENT.md` - 詳細部署指南
- `docs/API.md` - API 文檔
- `backend/.env.example` - 環境變數模板
