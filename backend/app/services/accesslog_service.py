from app.models import db
from app.models.accesslog_model import AccessLogModel
from app.models.gate_model import GateModel
from sqlalchemy import func
from datetime import datetime
import traceback

class AccessLogService:
    @staticmethod
    def get_employee_logs_by_employeeid_and_date(employee_id, date_str):
        try:
            # Parse the date string
            date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()

            # Query the database
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

            # Process the results
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

        except ValueError:
            return {"error": "Invalid date format. Use YYYY-MM-DD."}, 400
        except Exception as e:
            print("ERROR:", traceback.format_exc())
            return {"error": "An unexpected error occurred.", "details": str(e)}, 500

    @staticmethod
    def add_access_logs_by_id_time_gate(employee_id, access_time, gate_id):
        try:
            # Convert access_time to datetime if it's a string
            if isinstance(access_time, str):
                access_time = datetime.fromisoformat(access_time)

            # Create a new access log
            new_log = AccessLogModel(
                employee_id=employee_id,
                access_time=access_time,
                gate_id=gate_id
            )

            # Add to the database
            db.session.add(new_log)
            db.session.commit()

            return {"message": "Access log added successfully."}, 201

        except ValueError:
            return {"error": "Invalid date format."}, 400
        except Exception as e:
            db.session.rollback()
            print("ERROR:", traceback.format_exc())
            return {"error": "An unexpected error occurred.", "details": str(e)}, 500
