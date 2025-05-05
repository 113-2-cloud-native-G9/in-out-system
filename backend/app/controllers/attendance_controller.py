# app/controllers/attendance_controller.py

from flask_restful import Resource
from flask import request
from datetime import datetime, timedelta
from app.services.attendance_service import update_attendance_service

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