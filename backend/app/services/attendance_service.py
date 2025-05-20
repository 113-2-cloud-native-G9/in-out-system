from flask import request
from datetime import datetime, timedelta
from app.models import db
from app.models.gate_model import GateModel
from app.models.attendance_model import AttendanceRecordModel
from app.models.accesslog_model import AccessLogModel
from sqlalchemy import func
from app.models.employee_model import EmployeeModel
from app.models.organization_model import OrganizationModel

def update_attendance_service():
    
    # 今天凌晨1200到晚上2359的意思
    target_date = datetime.now().date()
    start_dt = datetime.combine(target_date, datetime.min.time())  
    end_dt = datetime.combine(target_date + timedelta(days=1), datetime.min.time())  

    # JOIN Access_Log 和 Gate，並依 gate direction 分出 in/out
    in_subquery = (
    db.session.query(
        AccessLogModel.employee_id,
        AccessLogModel.access_time,
        AccessLogModel.gate_id,
        GateModel.direction,
        func.row_number().over(
            partition_by=AccessLogModel.employee_id,
            order_by=AccessLogModel.access_time.asc()
        ).label("rn")
    )
    .join(GateModel, AccessLogModel.gate_id == GateModel.gate_id)
    .filter(
            AccessLogModel.access_time >= start_dt,
            AccessLogModel.access_time < end_dt,
            GateModel.direction == 'in'
        )
    ).subquery()

    # 只取 rn = 1 的那一筆
    in_logs = (
        db.session.query(
            in_subquery.c.employee_id,
            in_subquery.c.access_time.label("check_in_time"),
            in_subquery.c.gate_id.label("check_in_gate")
        )
        .filter(in_subquery.c.rn == 1)
        .all()
    )

    #最晚的 out
    # Subquery with row_number for OUT
    out_subquery = (
        db.session.query(
            AccessLogModel.employee_id,
            AccessLogModel.access_time,
            AccessLogModel.gate_id,
            GateModel.direction,
            func.row_number().over(
                partition_by=AccessLogModel.employee_id,
                order_by=AccessLogModel.access_time.desc()
            ).label("rn")
        )
        .join(GateModel, AccessLogModel.gate_id == GateModel.gate_id)
        .filter(
            AccessLogModel.access_time >= start_dt,
            AccessLogModel.access_time < end_dt,
            GateModel.direction == 'out'
            )
        ).subquery()

    # 只取 rn = 1 的那一筆
    out_logs = (
        db.session.query(
            out_subquery.c.employee_id,
            out_subquery.c.access_time.label("check_out_time"),
            out_subquery.c.gate_id.label("check_out_gate")
        )
        .filter(out_subquery.c.rn == 1)
        .all()
    )

    # 轉成 dict for merge
    in_dict = {row.employee_id: row for row in in_logs}
    out_dict = {row.employee_id: row for row in out_logs}

    # Step 4: 合併兩邊結果並更新 Attendance_Record
    all_employees = set(in_dict.keys()) | set(out_dict.keys())
    for employee_id in all_employees:
        check_in_time = in_dict.get(employee_id).check_in_time if employee_id in in_dict else None
        check_in_gate = in_dict.get(employee_id).check_in_gate if employee_id in in_dict else None

        check_out_time = out_dict.get(employee_id).check_out_time if employee_id in out_dict else None
        check_out_gate = out_dict.get(employee_id).check_out_gate if employee_id in out_dict else None

        if not check_in_time or not check_out_time:
            # 忽略不完整記錄
            continue

        stay_hours = round((check_out_time - check_in_time).total_seconds() / 3600, 2)

        # 查是否已存在該日記錄
        record = AttendanceRecordModel.query.filter_by(
            employee_id=employee_id,
            report_date=target_date
        ).first()

        if record:
            # 更新
            record.check_in_time = check_in_time
            record.check_out_time = check_out_time
            record.check_in_gate = check_in_gate
            record.check_out_gate = check_out_gate
            record.total_stay_hours = stay_hours
            record.updated_by = 'system'
        else:
            # 新增
            new_record = AttendanceRecordModel(
                employee_id=employee_id,
                report_date=target_date,
                check_in_time=check_in_time,
                check_out_time=check_out_time,
                check_in_gate=check_in_gate,
                check_out_gate=check_out_gate,
                total_stay_hours=stay_hours,
                updated_by='system'
            )
            db.session.add(new_record)

    db.session.commit()

    return {"message": f"✅ Attendance updated for {target_date}", "total": len(all_employees)}, 200

#取得當前登入員工的出勤紀錄
class AttendanceService:
    @staticmethod
    def get_attendance_by_employee(employee_id, month):
        # 解析月份，確保格式為 YYYY-MM
        try:
            start_date = datetime.strptime(month, "%Y-%m")
            end_date = datetime(start_date.year, start_date.month + 1, 1)
        except ValueError:
            return {"error": "Invalid month format, use YYYY-MM"}, 400

        # 查詢員工基本資料
        employee = EmployeeModel.query.filter_by(employee_id=employee_id).first()
        if not employee:
            return {"error": "Employee not found."}, 404

        # 查詢員工所屬組織
        organization = OrganizationModel.query.filter_by(organization_id=employee.organization_id).first()

        # 查詢員工在該月的出勤紀錄
        attendance_records = AttendanceRecordModel.query.filter(
            AttendanceRecordModel.employee_id == employee_id,
            AttendanceRecordModel.report_date >= start_date,
            AttendanceRecordModel.report_date < end_date
        ).all()

        # 整理出勤紀錄
        records = []
        for record in attendance_records:
            # 判斷遲到和早退的邏輯
            late_arrival_status = "On time"
            late_arrival_minutes = 0
            early_departure_status = "On time"
            early_departure_minutes = 0

            # 設定上班時間為 08:00 AM 和下班時間為 05:00 PM
            work_start_time = record.check_in_time.replace(hour=8, minute=30, second=0, microsecond=0) if record.check_in_time else None
            work_end_time = record.check_out_time.replace(hour=17, minute=30, second=0, microsecond=0) if record.check_out_time else None

            # 遲到判斷
            if record.check_in_time and work_start_time and record.check_in_time > work_start_time:
                late_arrival_status = "Late"
                late_arrival_minutes = int((record.check_in_time - work_start_time).total_seconds() / 60)

            # 早退判斷
            if record.check_out_time and work_end_time and record.check_out_time < work_end_time:
                early_departure_status = "Early"
                early_departure_minutes = int((work_end_time - record.check_out_time).total_seconds() / 60)

            # 添加到結果列表
            records.append({
                "record_id": record.record_id,
                "report_date": record.report_date.strftime("%Y-%m-%d"),
                "check_in_time": record.check_in_time.strftime("%H:%M") if record.check_in_time else None,
                "check_out_time": record.check_out_time.strftime("%H:%M") if record.check_out_time else None,
                "check_in_gate": record.check_in_gate,
                "check_out_gate": record.check_out_gate,
                "total_stay_hours": float(record.total_stay_hours) if record.total_stay_hours else 0.0,  # 確保轉換為 float
                "late_arrival_status": late_arrival_status,
                "late_arrival_minutes": late_arrival_minutes,
                "early_departure_status": early_departure_status,
                "early_departure_minutes": early_departure_minutes
            })

        # 整理最終返回的資料
        response = {
            "employee_id": employee.employee_id,
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "organization_id": organization.organization_id if organization else None,
            "records": records
        }

        return response, 200
    

    #取得組織出勤紀錄
    #新版本：改成回傳month的出席紀錄
    @staticmethod
    def get_attendance_by_organization(organization_id, month):
        # ✅ 新增：月份參數
        try:
            start_date = datetime.strptime(month, "%Y-%m")
            end_date = datetime(start_date.year, start_date.month + 1, 1)
        except ValueError:
            return {"error": "Invalid month format, use YYYY-MM"}, 400

        # 查詢組織內所有員工
        employees = EmployeeModel.query.filter_by(organization_id=organization_id).all()
        if not employees:
            return [], 200  # ✅ 改：沒有員工也回傳空陣列，而不是 404

        organization_records = []

        for employee in employees:
            # ✅ 修改：加上月份條件
            attendance_records = AttendanceRecordModel.query.filter(
                AttendanceRecordModel.employee_id == employee.employee_id,
                AttendanceRecordModel.report_date >= start_date,
                AttendanceRecordModel.report_date < end_date
            ).order_by(AttendanceRecordModel.report_date.desc()).all()

            records = []
            for record in attendance_records:
                # 遲到與早退預設值
                late_arrival_status = "On time"
                late_arrival_minutes = 0
                early_departure_status = "On time"
                early_departure_minutes = 0

                # 計算遲到
                if record.check_in_time:
                    work_start = record.check_in_time.replace(hour=8, minute=30, second=0, microsecond=0)
                    if record.check_in_time > work_start:
                        delta = record.check_in_time - work_start
                        late_arrival_status = "Late"
                        late_arrival_minutes = int(delta.total_seconds() / 60)

                # 計算早退
                if record.check_out_time:
                    work_end = record.check_out_time.replace(hour=17, minute=30, second=0, microsecond=0)
                    if record.check_out_time < work_end:
                        delta = work_end - record.check_out_time
                        early_departure_status = "Early"
                        early_departure_minutes = int(delta.total_seconds() / 60)

                records.append({
                    "record_id": record.record_id,
                    "report_date": record.report_date.strftime("%Y-%m-%d"),
                    "check_in_time": record.check_in_time.strftime("%H:%M") if record.check_in_time else None,
                    "check_out_time": record.check_out_time.strftime("%H:%M") if record.check_out_time else None,
                    "check_in_gate": record.check_in_gate,
                    "check_out_gate": record.check_out_gate,
                    "total_stay_hours": float(record.total_stay_hours or 0),
                    "late_arrival_status": late_arrival_status,
                    "late_arrival_minutes": late_arrival_minutes,
                    "early_departure_status": early_departure_status,
                    "early_departure_minutes": early_departure_minutes
                })

            organization_records.append({
                "employee_id": employee.employee_id,
                "employee_name": f"{employee.first_name} {employee.last_name}",
                "organization_id": employee.organization_id,
                "records": records
            })

        return organization_records, 200