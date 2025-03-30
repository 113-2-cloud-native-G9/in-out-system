from flask_restful import Api
from app.controllers.accesslog_controller import GetEmployeeAccessLog, CreateAccessLog, GetPersonalAccessLog
from app.controllers.auth_controller import Auth_Login
from app.controllers.organization_controller import OrganizationList, GetOrganization, GetOrganizationTree


BASE_ROUTE = "/api/v1"

def initialize_routes(api: Api):
    api.add_resource(GetEmployeeAccessLog, f"{BASE_ROUTE}/access-logs/employees/<string:employee_id>")  # 去抓其他人的log資料
    api.add_resource(CreateAccessLog, f"{BASE_ROUTE}/access-logs/<string:date>") # 模擬逼卡的時候去對資料庫寫入資料
    api.add_resource(GetPersonalAccessLog, f"{BASE_ROUTE}/access-logs")  # 去抓自己的log資料

    api.add_resource(Auth_Login, f"{BASE_ROUTE}/auth/login")  # 去抓自己的log資料

    api.add_resource(OrganizationList, f"{BASE_ROUTE}/organizations/list")  #取得所有組織清單
    api.add_resource(GetOrganization, f"{BASE_ROUTE}/organizations/<string:organization_id>")  #取得單一組織資訊
    api.add_resource(GetOrganizationTree, f"{BASE_ROUTE}/organizations")  #獲取組織結構資訊
