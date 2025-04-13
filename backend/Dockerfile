# 使用 Python 3.12 作為基底
FROM python:3.12

# 設定工作目錄
WORKDIR /app

# 複製 requirements.txt
COPY requirements.txt .

# 安裝相依套件
RUN pip install --no-cache-dir -r requirements.txt

# 複製所有檔案到 /app
COPY . .

# 設定 Flask 運行
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "main:app"]