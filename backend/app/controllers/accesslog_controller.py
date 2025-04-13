from flask import request, jsonify
from flask_restful import Resource
from app.services.accesslog_service import AccessLogService
from flask_jwt_extended import jwt_required, get_jwt_identity

#GET /api/v1/access-logs/employees/{employee_id}?date=<string>
class GetEmployeeAccessLog(Resource):
    @jwt_required()
    def get(self, employee_id):
       
        date_param = request.args.get("date")  # 從 URL 參數取得日期

        if not date_param:
            return {"error": "datetime are not provided"}, 404
        
        is_admin = get_jwt_identity()["is_admin"]
        is_manager = get_jwt_identity()['is_manager']
        if not is_admin and not is_manager:
            return {"error": "You are not admin or manager"}, 401 #只有admin or manager可以看他人的資料
        
        logs, status = AccessLogService.get_employee_logs_by_employeeid_and_date(employee_id, date_param)
        return {"logs": logs}, status
    
#POST /api/v1/access-logs  &&  #GET /api/v1/access-logs?date=<string>
class Create_or_GetPersonalAccessLog(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()

        employee_id = data.get("employee_id")
        access_time = data.get("access_time")
        gate_id = data.get("gate_id")
       
        if not employee_id or not access_time or not gate_id:
            return {"error": "Some data are not provided"}, 400
        
        _, status = AccessLogService.add_access_logs_by_id_time_gate(employee_id, access_time, gate_id)

        return status
    
    @jwt_required()
    def get(self):  
        date_param = request.args.get("date") 
        if not date_param:
            return {"error": "Date are not provided"}, 400

        employee_id = get_jwt_identity()["employee_id"]

        logs, status = AccessLogService.get_employee_logs_by_employeeid_and_date(employee_id, date_param)
        return {"logs": logs}, status



