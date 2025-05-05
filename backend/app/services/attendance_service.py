from flask import request
from datetime import datetime, timedelta
from app.models import db
from app.models.gate_model import GateModel
from app.models.attendance_model import AttendanceRecordModel
from app.models.accesslog_model import AccessLogModel
from sqlalchemy import func

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