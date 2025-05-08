import os

class Config:
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
    )
    DEBUG = True

class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@localhost/{os.getenv('DB_NAME')}?unix_socket=/cloudsql/{os.getenv('INSTANCE_CONNECTION_NAME')}"
    )
    DEBUG = False

class TestingConfig(Config):
    SQLALCHEMY_DATABASE_URI = f"sqlite:///:memory:"  # 測試用記憶體資料庫
    TESTING = True
   