
FROM python:3.12

# 設定工作目錄
WORKDIR /app

# 複製專案檔案
COPY . /app

# 安裝相依套件
RUN pip install --no-cache-dir -r requirements.txt

# 設定 Flask 運行
CMD ["python", "main.py"]