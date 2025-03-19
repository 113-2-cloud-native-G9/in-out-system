# 設定工作目錄
WORKDIR /app

# 複製 backend 內的 requirements.txt
COPY backend/requirements.txt .

# 複製 backend 目錄所有內容到 /app
COPY backend/ .

# 安裝相依套件
RUN pip install --no-cache-dir -r requirements.txt

# 設定 Flask 運行
CMD ["python", "main.py"]