# Touvel 旅行預訂系統 - 實作指南

## 概述

根據技術規格文件，本實作提供了一個完整的多產品、API 驅動的旅行預訂平台，支援：

- **多產品類型**：行程套票、活動體驗、交通、住宿（預留）
- **供應商管理**：產品上架、庫存管理、訂單處理
- **智能預訂**：報價、庫存鎖定、狀態機管理
- **AI 行程**：自動生成行程並關聯產品
- **角色權限**：旅客 (traveler)、供應商 (supplier)、管理員 (admin)

## 架構設計

### 資料庫架構

採用 PostgreSQL 作為主資料庫，包含以下核心表：

#### 核心表結構

1. **users** - 用戶表（支援角色：traveler/supplier/admin）
2. **suppliers** - 供應商資料
3. **destinations** - 目的地
4. **products** - 產品目錄
5. **product_contents** - 多語系內容
6. **inventory_slots** - 庫存日曆
7. **quotes** - 報價（不扣庫存）
8. **bookings** - 訂單（原子扣庫存）
9. **payments** - 付款記錄
10. **ai_itineraries** - AI 生成行程
11. **reviews** - 評價
12. **wishlist** - 收藏

詳細 schema 請參考：`database/schema_enhanced.sql`

### API 架構

#### 認證與授權
- JWT Token 認證
- 角色基礎權限控制 (RBAC)
- 支援 traveler、supplier、admin 三種角色

#### 核心 API 模組

1. **Authentication** (`/api/auth`)
   - POST `/register` - 註冊（支援角色選擇）
   - POST `/login` - 登入
   - GET `/me` - 獲取當前用戶

2. **Products** (`/api/products`)
   - GET `/` - 搜尋和篩選產品
   - GET `/:id` - 產品詳情
   - GET `/:id/availability` - 可用性日曆

3. **Suppliers** (`/api/suppliers`)
   - POST `/products` - 建立產品（供應商專用）
   - GET `/products` - 列出自己的產品
   - PUT `/products/:id` - 更新產品
   - GET `/inventory/:productId/calendar` - 查看庫存日曆
   - PUT `/inventory/:productId` - 更新庫存

4. **Bookings** (`/api/bookings`)
   - POST `/quote` - 建立報價（不扣庫存）
   - POST `/` - 建立訂單（原子扣庫存）
   - POST `/:id/confirm` - 確認訂單
   - POST `/:id/cancel` - 取消訂單
   - GET `/user/me` - 獲取用戶訂單列表
   - GET `/:id` - 訂單詳情

5. **AI Itinerary** (`/api/ai`)
   - POST `/itineraries/generate` - 生成 AI 行程
   - GET `/itineraries` - 列出用戶行程
   - GET `/itineraries/:id` - 行程詳情
   - POST `/itineraries/:id/attach-products` - 關聯產品到行程

## 關鍵實作細節

### 1. 報價與預訂流程 (Quote vs Booking)

#### Quote 流程（不減庫存）
```javascript
POST /api/bookings/quote
{
  "productId": "uuid",
  "date": "2024-06-15",
  "pax": [
    { "type": "adult", "qty": 2 },
    { "type": "child", "qty": 1 }
  ]
}

回應：
{
  "quoteId": "uuid",
  "total": "1240.00",
  "currency": "HKD",
  "validUntil": "2024-01-19T12:34:56Z"
}
```

#### Booking 流程（原子扣庫存）
```javascript
POST /api/bookings
{
  "quoteId": "uuid",  // 或直接提供 productId, date, pax
  "userInfo": {
    "name": "Chan Tai Man",
    "email": "chan@example.com",
    "phone": "+852..."
  },
  "paymentMode": "pay_now"  // 或 "pay_later"
}

回應：
{
  "bookingId": "uuid",
  "status": "AWAITING_PAYMENT",
  "expiresAt": "2024-01-19T12:34:56Z"
}
```

### 2. 庫存鎖定機制

使用 PostgreSQL 的 `SELECT FOR UPDATE` 實現原子操作：

```sql
BEGIN;

-- 鎖定庫存行
SELECT id, remaining FROM inventory_slots 
WHERE product_id = $1 AND date = $2 
FOR UPDATE;

-- 檢查並扣除
UPDATE inventory_slots 
SET remaining = remaining - $3 
WHERE product_id = $1 AND date = $2 
AND remaining >= $3;

-- 建立訂單
INSERT INTO bookings (...) VALUES (...);

COMMIT;
```

### 3. 訂單狀態機

```
PENDING (建立) 
  → AWAITING_PAYMENT (等待付款)
  → CONFIRMED (已確認)
  → COMPLETED (已完成)

或

PENDING → EXPIRED (逾時未付款)
PENDING/CONFIRMED → CANCELLED (取消)
```

### 4. 角色與權限

#### Traveler（旅客）
- 搜尋產品
- 建立報價和訂單
- 查看自己的訂單
- 生成 AI 行程

#### Supplier（供應商）
- 建立和管理產品
- 管理庫存日曆
- 查看自己的訂單
- 處理訂單確認/拒絕

#### Admin（管理員）
- 審核供應商
- 查看所有資料
- 管理用戶和產品
- 生成報表

## 環境設定

### 1. 資料庫設定

```bash
# 使用 PostgreSQL
createdb touvel_db

# 執行 schema
psql -d touvel_db -f database/schema_enhanced.sql

# 匯入測試資料
psql -d touvel_db -f database/seed_data.sql
```

### 2. 環境變數

複製 `.env.example` 並設定：

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/touvel_db

# JWT
JWT_SECRET=your_strong_secret_key_here

# Server
PORT=5000
NODE_ENV=development
```

### 3. 啟動後端

```bash
cd backend
npm install
npm start
```

伺服器啟動於 `http://localhost:5000`

### 4. API 文件

啟動後訪問：
- API 概覽：http://localhost:5000/api
- OpenAPI 規格：查看 `docs/openapi.yaml`

## 測試流程

### 測試帳號

使用 seed data 中的測試帳號：

```
旅客帳號：
Email: traveler@example.com
Password: password123

供應商帳號：
Email: supplier@example.com
Password: password123

管理員帳號：
Email: admin@example.com
Password: password123
```

### API 測試範例

#### 1. 登入
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "traveler@example.com",
    "password": "password123"
  }'
```

#### 2. 搜尋產品
```bash
curl http://localhost:5000/api/products?type=activity
```

#### 3. 建立報價
```bash
curl -X POST http://localhost:5000/api/bookings/quote \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "pppppppp-pppp-pppp-pppp-pppppppppp01",
    "date": "2024-06-15",
    "pax": [{"type": "adult", "qty": 2}]
  }'
```

#### 4. 建立訂單（需要 Token）
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "quoteId": "YOUR_QUOTE_ID",
    "userInfo": {
      "name": "Test User",
      "email": "test@example.com",
      "phone": "+852-12345678"
    },
    "paymentMode": "pay_now"
  }'
```

## 進階功能

### 1. AI 行程生成

```bash
curl -X POST http://localhost:5000/api/ai/itineraries/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "destination": "Hong Kong",
    "days": 3,
    "budget": 5000,
    "currency": "HKD",
    "preferences": {
      "interests": ["culture", "food", "nature"]
    }
  }'
```

### 2. 供應商管理產品

```bash
# 建立產品
curl -X POST http://localhost:5000/api/suppliers/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPPLIER_TOKEN" \
  -d '{
    "type": "activity",
    "title": "New Tour",
    "shortDesc": "Amazing experience",
    "content": {
      "longDesc": "Full description...",
      "images": ["url1", "url2"]
    }
  }'

# 更新庫存
curl -X PUT http://localhost:5000/api/suppliers/inventory/PRODUCT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SUPPLIER_TOKEN" \
  -d '{
    "updates": [
      {
        "date": "2024-06-15",
        "capacity": 20,
        "basePrice": 500
      }
    ]
  }'
```

## 安全考量

1. **密碼加密**：使用 bcryptjs，rounds = 10
2. **JWT Token**：7 天有效期
3. **SQL 注入防護**：使用參數化查詢
4. **CORS 保護**：設定允許的來源
5. **Rate Limiting**：15 分鐘 100 次請求

## 效能優化

1. **資料庫索引**：
   - products: type, status, supplier_id, destination_id
   - inventory_slots: product_id + date
   - bookings: user_id, status, date

2. **庫存查詢優化**：
   - 使用複合索引 (product_id, date)
   - remaining > 0 條件過濾

3. **建議擴展**：
   - Redis 快取熱門產品
   - Elasticsearch 全文搜尋
   - CDN 靜態資源

## 待實作功能

### Phase 1 (優先)
- [ ] 付款整合 (Stripe)
- [ ] Email/SMS 通知
- [ ] 訂單憑證生成 (PDF/QR)
- [ ] 管理後台 API

### Phase 2
- [ ] 評價與收藏完整實作
- [ ] 外部供應商 API 連接器
- [ ] 多貨幣支援
- [ ] 進階搜尋與篩選

### Phase 3
- [ ] 住宿預訂整合
- [ ] GDS/Hotel API 連接
- [ ] 即時聊天客服
- [ ] 行動應用 API

## 疑難排解

### 資料庫連接失敗
確認 DATABASE_URL 設定正確：
```bash
psql $DATABASE_URL -c "SELECT 1"
```

### JWT 驗證失敗
確認 JWT_SECRET 已設定且前端正確傳送 Token：
```
Authorization: Bearer <token>
```

### 庫存扣除失敗
檢查交易隔離級別和鎖定機制是否正常運作

## 參考文件

- API 規格：`docs/openapi.yaml`
- 資料庫 Schema：`database/schema_enhanced.sql`
- 測試資料：`database/seed_data.sql`

## 聯絡支援

如有問題請聯絡開發團隊或查閱項目 GitHub Issues。

---

**Made with ❤️ by Touvel Team**
