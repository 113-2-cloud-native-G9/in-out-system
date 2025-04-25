from flask import request, jsonify
from flask_restful import Resource
from app.services.accesslog_service import AccessLogService
from flask_jwt_extended import jwt_required, get_jwt_identity
import base64
import json

#GET /api/v1/access-logs/employees/{employee_id}?date=<string>
class GetEmployeeAccessLog(Resource):
    @jwt_required()
    def get(self, employee_id):
       
        date_param = request.args.get("date")  # 從 URL 參數取得日期

        if not date_param:
            return {"logs": "datetime are not provided"}, 404
        
        is_admin = get_jwt_identity()["is_admin"]
        is_manager = get_jwt_identity()['is_manager']
        if not is_admin and not is_manager:
            return {"logs": "You are not admin or manager"}, 401 #只有admin or manager可以看他人的資料
        
        logs, status = AccessLogService.get_employee_logs_by_employeeid_and_date(employee_id, date_param)
        return {"logs": logs}, status
    
#POST /api/v1/pubsub/access-logs
class CreatePersonalAccessLog(Resource):
    def post(self):
        envelope = request.get_json()

        # 檢查 Pub/Sub 標準訊息格式
        if not envelope or "message" not in envelope:
            return {"error": "No message field in request"}, 400

        try:
            # 解碼 base64 資料
            pubsub_message = envelope["message"]
            data = base64.b64decode(pubsub_message["data"]).decode("utf-8")
            log_data = json.loads(data)

            # 抓出欄位
            employee_id = log_data.get("employee_id")
            access_time = log_data.get("access_time")
            gate_id = log_data.get("gate_id")

            if not employee_id or not access_time or not gate_id:
                return {"error": "Missing fields in pubsub data"}, 400

            # 寫入資料庫或服務
            _, status = AccessLogService.add_access_logs_by_id_time_gate(employee_id, access_time, gate_id)

            return status

        except Exception as e:
            print(f"Pub/Sub error: {e}")
            return {"error": "Failed to process message"}, 500
        
 #GET /api/v1/access-logs?date=<string>
class GetPersonalAccessLog(Resource):    
    @jwt_required()
    def get(self):  
        date_param = request.args.get("date") 
        if not date_param:
            return {"error": "Date are not provided"}, 400

        employee_id = get_jwt_identity()["employee_id"]

        logs, status = AccessLogService.get_employee_logs_by_employeeid_and_date(employee_id, date_param)
        return {"logs": logs}, status



