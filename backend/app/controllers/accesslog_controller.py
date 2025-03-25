from flask import request, jsonify
from flask_restful import Resource
from app.services.accesslog_service import AccessLogService
from flask_jwt_extended import jwt_required, get_jwt_identity

#GET /api/v1/access-logs/employees/{employee_id}?date=<string>
class GetEmployeeAccessLog(Resource):
    #@jwt_required()
    def get(self, employee_id):
       
        date_param = request.args.get("date")  # 從 URL 參數取得日期
        if not date_param:
            return {"logs": "datetime are not provided"}, 404
        logs, status = AccessLogService.get_employee_logs_by_employeeid_and_date(employee_id, date_param)
        return {"logs": logs}, status
    
#POST /api/v1/access-logs
class CreateAccessLog(Resource):
    #@jwt_required()
    def post(self):
        data = request.get_json()

        employee_id = data.get("employee_id")
        access_time = data.get("access_time")
        gate_id = data.get("gate_id")
       
        if not employee_id or not access_time or not gate_id:
            return {"error": "Some data are not provided"}, 400
        
        _, status = AccessLogService.add_access_logs_by_id_time_gate(employee_id, access_time, gate_id)

        return status

#GET /api/v1/access-logs/{date}
class GetPersonalAccessLog(Resource):
    #@jwt_required()
    def get(self, date):
        AccessLogService.get_personal_logs_by_date(date)
        return {
            "message": f"Fetching access logs for date {date}"
        }, 200

