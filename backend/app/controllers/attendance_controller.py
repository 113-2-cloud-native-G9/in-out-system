# app/controllers/attendance_controller.py

from flask_restful import Resource
from flask import request
from datetime import datetime, timedelta
from app.services.attendance_service import update_attendance_service
from app.services.attendance_service import AttendanceService
from flask_jwt_extended import jwt_required, get_jwt_identity

class UpdateAttendance(Resource):
    def put(self):
        print("Updating attendance...")
        try:
            total, status = update_attendance_service()
            return {"message": f"✅ Attendance updated ", "total": total}, status
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"error": "❌ Failed to update attendance", "details": str(e)}, 500
        
#GET /api/v1/attendance/employees/{employee_id}?month=<string>
class EmployeeAttendanceController(Resource):
    @jwt_required()
    def get(self, employee_id):
        # 驗證角色（這裡可以讓 Administrator、Employee 和 Manager 都可以訪問）
        claims = get_jwt_identity()
        if not (claims["is_admin"] or claims["is_manager"] or claims["employee_id"] == employee_id):
            return {"error": "Unauthorized access."}, 403
        
        # 驗證請求參數
        month = request.args.get('month')
        if not month:
            return {"error": "Missing month parameter."}, 400

        # 調用 Service 層來獲取出勤紀錄
        try:
            return AttendanceService.get_attendance_by_employee(employee_id, month)
        except Exception as e:
            return {"error": f"Failed to get attendance: {str(e)}"}, 500
        
        
#新版本：改得跟上面那支的呼叫格式一樣！
#GET /api/v1/attendance/organizations/{organization_id}?month=YYYY-MM
class OrganizationAttendanceController(Resource):
    @jwt_required()
    def get(self, organization_id):
        # 驗證角色
        claims = get_jwt_identity()
        if not (claims["is_admin"] or claims["is_manager"]):
            return {"error": "Unauthorized access."}, 403  # 只有admin和manager有權限
        
        month = request.args.get('month')
        if not month:
            return {"error": "Missing month parameter."}, 400

        # 呼叫 service 層處理具體的邏輯，這裡不再使用 month 參數，直接查詢所有歷史出勤紀錄
        try:
            # 解包 service 回傳的 list 和 status
            attendance_list, status = AttendanceService.get_attendance_by_organization(organization_id, month)
            # 最外層直接回傳 List
            return attendance_list, status

        except Exception as e:
            return {"error": f"Failed to get attendance: {str(e)}"}, 500