from app.models import db

class AttendanceRecordModel(db.Model):
    __tablename__ = 'Attendance_Record'

    record_id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.String(50), db.ForeignKey('Employee.employee_id'), nullable=False)
    report_date = db.Column(db.Date, nullable=False)
    check_in_time = db.Column(db.DateTime, nullable=False)
    check_out_time = db.Column(db.DateTime, nullable=False)
    check_in_gate = db.Column(db.Integer, db.ForeignKey('Gate.gate_id'), nullable=False)
    check_out_gate = db.Column(db.Integer, db.ForeignKey('Gate.gate_id'), nullable=False)
    total_stay_hours = db.Column(db.Numeric(5, 2), nullable=False)
    updated_by = db.Column(db.String(50), db.ForeignKey('Employee.employee_id'), nullable=False)