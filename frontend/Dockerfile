# 使用官方 Node.js 映像作為基礎映像
FROM node:latest AS builder

# 設定工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json（或者 yarn.lock）
COPY package*.json ./

# 安裝依賴
RUN npm install

# 複製其他源碼檔案
COPY . .

# 建立 Vite 前端
RUN npm run build

# 使用 Nginx 伺服器作為靜態資源伺服器
FROM nginx:latest

# 複製構建後的檔案到 nginx 的 public 目錄
COPY --from=builder /app/dist /usr/share/nginx/html

# 複製自定義的 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 開啟 8080 端口
EXPOSE 8080

# 啟動 nginx 伺服器
CMD ["nginx", "-g", "daemon off;"]