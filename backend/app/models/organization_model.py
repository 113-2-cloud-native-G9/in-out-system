from app.models import db

class OrganizationModel(db.Model):
    __tablename__ = 'Organization'

    organization_id = db.Column(db.String(50), primary_key=True)
    organization_name = db.Column(db.String(255), nullable=False, unique=True)
    manager_id = db.Column(db.String(50), db.ForeignKey('Employee.employee_id'), nullable=False)
    parent_department_id = db.Column(db.String(50), db.ForeignKey('Organization.organization_id'), nullable=False)