# 使用 Python 3.12 作為基底
FROM python:3.12

# 設定工作目錄
WORKDIR /app

# 複製 backend 內的 requirements.txt
COPY backend/requirements.txt /app/

# 安裝相依套件
RUN pip install --no-cache-dir -r requirements.txt

# 複製 backend 內的所有檔案到 /app
COPY backend/ /app/

# 設定 Flask 運行
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "main:app"]