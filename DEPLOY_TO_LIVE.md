# 🚀 Touvel - 部署到生產環境

## 目的

呢份文件提供一份完整嘅部署清單，幫你快速將 Touvel 應用程式上線。

---

## ✅ 部署前檢查清單

### 環境準備
- [ ] 已註冊 Vercel 帳號 (https://vercel.com)
- [ ] 已註冊 Railway 帳號 (https://railway.app)
- [ ] 已登入 GitHub 帳號
- [ ] 有 MySQL 數據庫 (或已選擇 Railway 提供嘅數據庫)

### 代碼準備
- [ ] 所有代碼已 push 到 GitHub main 分支
- [ ] 已檢查 `backend/.env.example` 有所有必要環境變量
- [ ] 已檢查 `frontend` 有正確嘅 API 配置
- [ ] `vercel.json` 已在根目錄

---

## 📋 部署步驟

### 第 1 步：部署前端到 Vercel (5 分鐘)

1. 打開 https://vercel.com
2. 用 GitHub 帳號登入
3. 點擊 "Add New" → "Project"
4. 選擇 `kylec1114/Touvel` repository
5. 配置設置：
   - Framework Preset: "Other"
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. 點擊 "Environment Variables" 並添加：
   ```
   VITE_API_URL = https://your-railway-backend-url/api
   ```
   *(暫時用 http://localhost:3001/api，之後再改)*
7. 點擊 "Deploy"

🎉 **前端 URL**: `https://touvel.vercel.app` (會自動生成)

---

### 第 2 步：設置數據庫 (5 分鐘)

#### 選項 A：用 Railway 內置數據庫 (推薦)

1. 去 https://railway.app
2. 用 GitHub 登入
3. 點擊 "New Project"
4. 選擇 "Provision PostgreSQL" 或 "Provision MySQL"
5. 記下連接信息：
   - HOST
   - PORT
   - DATABASE
   - USER
   - PASSWORD

#### 選項 B：用現有嘅 MySQL/PostgreSQL

確保你有以下信息：
- 數據庫 HOST
- 數據庫 PORT
- DATABASE 名稱
- USER 名稱
- PASSWORD
- 防火牆已允許連接

---

### 第 3 步：部署後端到 Railway (10 分鐘)

1. 去 https://railway.app
2. 創建新 Project (如果還未做)
3. 點擊 "New" → "GitHub Repo"
4. 授權並選擇 `kylec1114/Touvel`
5. Railway 會自動檢測並配置
6. 添加環境變量 (點擊 "Variables")：
   ```
   DATABASE_HOST=your-database-host
   DATABASE_PORT=3306 或 5432
   DATABASE_USER=your_user
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=touvel_db
   JWT_SECRET=your-super-secret-key-12345
   NODE_ENV=production
   PORT=3000
   API_URL=https://your-railway-url.railway.app
   CORS_ORIGIN=https://touvel.vercel.app
   ```

7. 點擊 "Deploy"

🎉 **後端 URL**: 會自動生成，例如 `https://touvel-backend-production.up.railway.app`

---

### 第 4 步：更新前端 API 地址

1. 去 Vercel 的 Project Settings
2. 點擊 "Environment Variables"
3. 編輯 `VITE_API_URL` 為 Railway 後端 URL + `/api`
   例如: `https://touvel-backend-production.up.railway.app/api`
4. 點擊 "Save" 並重新部署
5. Vercel 會自動重新部署

---

### 第 5 步：初始化數據庫

1. 連接到你嘅數據庫
2. 執行 `database/schema.sql`：
   ```bash
   mysql -h your-host -u your_user -p your_db < database/schema.sql
   ```

3. 添加樣本數據 (可選)：
   ```sql
   INSERT INTO destinations (name, description, location, price, image_url) VALUES
   ('巴黎', '浪漫之都', '法國', 1500, 'paris.jpg'),
   ('東京', '現代化城市', '日本', 1200, 'tokyo.jpg'),
   -- 更多...
   ```

---

## 🧪 測試

### 前端測試

1. 訪問 https://touvel.vercel.app
2. 檢查頁面是否正常加載
3. 測試登入
4. 測試搜尋功能
5. 測試預訂功能

### 後端測試

使用 Postman 或 curl 測試 API：

```bash
# 測試健康檢查
curl https://your-railway-url/api/health

# 測試登入
curl -X POST https://your-railway-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

---

## 🐛 常見問題排除

### CORS 錯誤

**症狀**: 前端無法調用後端 API

**解決**:
1. 檢查 `CORS_ORIGIN` 環境變量
2. 確保後端 `server.js` 有 CORS 配置
3. 重新部署後端

### 數據庫連接錯誤

**症狀**: 後端啟動失敗，"connection refused"

**檢查清單**:
- [ ] 數據庫主機地址正確
- [ ] 防火牆允許連接
- [ ] 用戶名和密碼正確
- [ ] 數據庫已建立

### 前端空白頁

**症狀**: 訪問前端只顯示空白

**解決**:
1. 檢查瀏覽器控制台 (F12)
2. 查看 Vercel 構建日誌
3. 確認 `vercel.json` 配置正確

---

## 📊 監控和維護

### Vercel 監控

1. 登入 Vercel Dashboard
2. 查看 "Analytics" 標籤
3. 檢查部署日誌
4. 設置 notifications

### Railway 監控

1. 登入 Railway Dashboard
2. 查看應用程式日誌
3. 監控資源使用
4. 設置 alerts

---

## 🔄 重新部署

### 更新代碼後重新部署

1. 在本機更新代碼
2. 提交並 push 到 GitHub:
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```
3. Vercel 和 Railway 會自動檢測並重新部署

---

## 📞 需要幫助?

- 查看 `docs/DEPLOYMENT.md` 瞭解詳細信息
- 查看 `docs/API.md` 瞭解 API 文檔
- 檢查 GitHub Issues

---

## ✨ 恭喜！

你已經成功部署 Touvel 到生產環境！🎉

**下一步**:
- [ ] 添加自定義域名
- [ ] 配置 SSL 證書
- [ ] 添加更多目的地數據
- [ ] 監控應用效能
- [ ] 收集用戶反饋
