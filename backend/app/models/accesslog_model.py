from app.models import db

class AccessLogModel(db.Model):
    __tablename__ = 'Access_Log'

    log_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    employee_id = db.Column(db.String(50), db.ForeignKey('Employee.employee_id'), nullable=False)
    access_time = db.Column(db.DateTime, nullable=False)
    gate_id = db.Column(db.Integer, db.ForeignKey('Gate.gate_id'), nullable=False)

  