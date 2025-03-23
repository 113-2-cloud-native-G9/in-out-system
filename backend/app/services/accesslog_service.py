from app.models import db
from app.models.accesslog_model import AccessLogModel
from app.models.gate_model import GateModel
from sqlalchemy import func
from datetime import datetime

class AccessLogService:
    @staticmethod
    def get_employee_logs_by_employeeid_and_date(employee_id, date_str):
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD."}, 400

        results = db.session.query(
            AccessLogModel.log_id,
            AccessLogModel.employee_id,
            AccessLogModel.access_time,
            AccessLogModel.gate_id,
            GateModel.gate_name,
            GateModel.direction,
            GateModel.gate_type
        ).join(GateModel, AccessLogModel.gate_id == GateModel.gate_id
        ).filter(
            AccessLogModel.employee_id == employee_id,
            func.date(AccessLogModel.access_time) == date_obj
        ).all()

        logs = []
        for row in results:
            logs.append({
                "log_id": row.log_id,
                "access_time": row.access_time.isoformat(),
                "direction": row.direction,
                "gate_name": row.gate_name,
                "gate_type": row.gate_type
            })

        return logs, 200
    
    @staticmethod
    def get_personal_logs_by_date(date_str):
        try:
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD."}, 400
