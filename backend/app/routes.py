from flask_restful import Api
from app.controllers.accesslog_controller import GetEmployeeAccessLog, GetPersonalAccessLog, CreatePersonalAccessLog
from app.controllers.auth_controller import Auth_Login
from app.controllers.organization_controller import OrganizationList, GetOrganization, GetOrganizationTree, DeleteOrganization
from app.controllers.employee_controller import EmployeeResource, ResetPasswordResource, EmployeeAddingResource, EmployeeEditingResource, EmployeeListResource
from app.controllers.attendance_controller import UpdateAttendance, EmployeeAttendanceController, OrganizationAttendanceController

BASE_ROUTE = "/api/v1"

def initialize_routes(api: Api):
    api.add_resource(GetEmployeeAccessLog, f"{BASE_ROUTE}/access-logs/employees/<string:employee_id>")  # 去抓其他人的log資料
    api.add_resource(Auth_Login, f"{BASE_ROUTE}/auth/login")  # 去抓自己的log資料

    api.add_resource(OrganizationList, f"{BASE_ROUTE}/organizations/list")  #取得所有組織清單
    api.add_resource(GetOrganization, f"{BASE_ROUTE}/organizations/<string:organization_id>")  #取得單一組織資訊
    api.add_resource(GetOrganizationTree, f"{BASE_ROUTE}/organizations")  #獲取組織結構資訊
    api.add_resource(DeleteOrganization, f"{BASE_ROUTE}/organizations/<string:organization_id>")

    api.add_resource(GetPersonalAccessLog, f"{BASE_ROUTE}/access-logs")  # 去抓自己的log資料
    api.add_resource(CreatePersonalAccessLog, f"{BASE_ROUTE}/pubsub/access-logs")  # 模擬逼卡的時候 先丟到pubsub topic 然後我們8080是sub才在這邊接收

    api.add_resource(EmployeeResource, f"{BASE_ROUTE}/employees/<string:employee_id>")  # 取得單一員工資訊
    api.add_resource(ResetPasswordResource, f"{BASE_ROUTE}/employees/reset-password")  # 重設密碼
    api.add_resource(EmployeeAddingResource, f"{BASE_ROUTE}/employees")  # 新增員工資訊
    api.add_resource(EmployeeEditingResource, f"{BASE_ROUTE}/employees/<string:employee_id>")  # 取得單一員工資訊
    api.add_resource(EmployeeListResource, f"{BASE_ROUTE}/employee-list") # 取得所有員工資訊

    api.add_resource(UpdateAttendance, f"{BASE_ROUTE}/attendance/update")  # 更新考勤紀錄
    api.add_resource(EmployeeAttendanceController, f"{BASE_ROUTE}/attendance/employees/<string:employee_id>")  # 取得當前登入員工的出勤紀錄
    api.add_resource(OrganizationAttendanceController, f"{BASE_ROUTE}/attendance/organizations/<string:organization_id>")  # 取得組織出勤紀錄