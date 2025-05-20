from app.models import db

class OrganizationModel(db.Model):
    __tablename__ = 'Organization'

    organization_id = db.Column(db.String(50), primary_key=True)
    organization_name = db.Column(db.String(255), nullable=False, unique=True)
    manager_id = db.Column(db.String(50), db.ForeignKey('Employee.employee_id'), nullable=True)  # 確保 manager_id 與 EmployeeModel 一致
    parent_department_id = db.Column(db.String(50), db.ForeignKey('Organization.organization_id'), nullable=True)  # 設置為 nullable=True
