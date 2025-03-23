from flask import request, jsonify
from flask_restful import Resource
from app.services.accesslog_service import AccessLogService
from flask_jwt_extended import jwt_required, get_jwt_identity

#GET /api/v1/access-logs/employees/{employee_id}?date=<string>
class GetEmployeeAccessLog(Resource):
    #@jwt_required()
    def get(self, employee_id):
        date_param = request.args.get("date")  # 從 URL 參數取得日期
        logs, status = AccessLogService.get_employee_logs_by_employeeid_and_date(employee_id, date_param)
        return {"logs": logs}, status
    
#POST /api/v1/access-logs
class CreateAccessLog(Resource):
    #@jwt_required()
    def post(self):
        data = request.get_json()  # 解析請求 JSON 內容
        if not data:
            return {"error": "No data provided"}, 400
        
        return {
            "message": "Access log created successfully",
            "data": data
        }, 201

#GET /api/v1/access-logs/{date}
class GetPersonalAccessLog(Resource):
    #@jwt_required()
    def get(self, date):
        AccessLogService.get_personal_logs_by_date(date)
        return {
            "message": f"Fetching access logs for date {date}"
        }, 200

