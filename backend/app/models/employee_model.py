from app.models import db

class EmployeeModel(db.Model):
    __tablename__ = 'Employee'

    employee_id = db.Column(db.String(50), primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    phone_number = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    organization_id = db.Column(db.String(50), nullable=False)
    job_title = db.Column(db.String(50), nullable=False)
    hire_date = db.Column(db.DateTime, nullable=False)
    hire_status = db.Column(db.String(50), nullable=False)
    is_admin = db.Column(db.Boolean, nullable=False)
    updated_at = db.Column(db.DateTime, nullable=False)
    updated_by = db.Column(db.String(50), nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)