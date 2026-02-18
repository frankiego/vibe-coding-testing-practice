# DashboardPage 測試案例

> 狀態：初始為 [ ]、完成為 [x]
> 注意：狀態只能在測試通過後由流程更新。
> 測試類型：前端元素、function 邏輯、Mock API、驗證權限...

---

## [] 【前端元素】檢查儀表板頁面基本渲染
**範例輸入**：渲染 DashboardPage 元件 (Mock user data)  
**期待輸出**：
1. 標題顯示「儀表板」
2. 顯示歡迎訊息 (包含 username)
3. 顯示商品列表區塊

---

## [x] 【驗證權限】Admin 連結顯示 (Admin 角色)
**範例輸入**：Mock user role 為 'admin'  
**期待輸出**：顯示「管理後台」連結

---

## [x] 【驗證權限】Admin 連結隱藏 (一般用戶)
**範例輸入**：Mock user role 為 'user'  
**期待輸出**：不顯示「管理後台」連結

---

## [x] 【function 邏輯】登出功能
**範例輸入**：點擊「登出」按鈕  
**期待輸出**：
1. 呼叫 `logout` function
2. 導向至 '/login'

---

## [x] 【UI 狀態】商品列表載入中
**範例輸入**：API 請求尚未完成 (`isLoading` 為 true)  
**期待輸出**：
1. 顯示 loading spinner
2. 顯示文字「載入商品中...」

---

## [x] 【Mock API】商品列表載入成功
**範例輸入**：Mock `productApi.getProducts` 回傳商品陣列  
**期待輸出**：
1. 顯示商品卡片
2. 正確顯示商品名稱、描述與價格

---

## [x] 【Mock API】商品列表載入失敗
**範例輸入**：Mock `productApi.getProducts` 拋出錯誤  
**期待輸出**：
1. 顯示錯誤圖示
2. 顯示錯誤訊息 (如「無法載入商品資料」)
