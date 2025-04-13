from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app.models import db

def init_db(app: Flask):
    db.init_app(app)
    with app.app_context(): #進入這個app的context 系統才知道你是要創db在哪一個app
        db.create_all()  #這邊會看你的model ORM寫得怎樣 如果之前gcp db已經有特定db table那如果有重新跑一次後端他不會覆蓋掉 只會創新的
        print("✅ 資料表建立成功！")
    return db