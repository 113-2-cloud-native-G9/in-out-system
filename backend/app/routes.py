from flask_restful import Api
from app.controllers.accesslog_controller import GetEmployeeAccessLog, CreateAccessLog, GetPersonalAccessLog
from app.controllers.auth_controller import Auth_Login

BASE_ROUTE = "/api/v1"

def initialize_routes(api: Api):
    api.add_resource(GetEmployeeAccessLog, f"{BASE_ROUTE}/access-logs/employees/<string:employee_id>")  # 去抓其他人的log資料
    api.add_resource(CreateAccessLog, f"{BASE_ROUTE}/access-logs") # 模擬逼卡的時候去對資料庫寫入資料
    api.add_resource(GetPersonalAccessLog, f"{BASE_ROUTE}/access-logs/<string:date>")  # 去抓自己的log資料

    api.add_resource(Auth_Login, f"{BASE_ROUTE}/auth/login") #登入
