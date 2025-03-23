from app.models import db
from app.models.employee_model import EmployeeModel
from app.models.organization_model import  OrganizationModel
from flask_jwt_extended import create_access_token

class AuthService:
    @staticmethod
    def auth_login_by_employee_id_hashed_password(employee_id, hashed_password):
        #這裡是查資料庫先看有沒有這人 有的話對照hash後的密碼是否正確
        user = EmployeeModel.query.filter_by(employee_id=employee_id).first()

        if not user:
            return {"error": "Employee not found."}, 404
        
        if user.hashed_password != hashed_password:
            return {"error": "Incorrect password."}, 401

        #這邊再用employee_id去部門表抓他是不是is_manager跟organization_name
        org = OrganizationModel.query.filter_by(organization_id=user.organization_id).first()
        if not org:
            return {"error": "org can't be found in db."}, 401
        
        organization_name = org.organization_name 
        is_manager_or_not = org.manager_id == employee_id #bool 看他所在的部門表 上面寫的主管是不是他本人

        #建立有包含個人基本資訊的 JWT 
        claims = {
            "employee_id": user.employee_id,
            "is_manager": is_manager_or_not,
            "is_admin": user.is_admin,
            "hire_status": user.hire_status
        }

        jwt_token = create_access_token(identity=user.employee_id, additional_claims=claims)

        response_data = {
            "jwt_token": jwt_token,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "job_title": user.job_title,
            "organization_id": user.organization_id,
            "organization_name": organization_name
        }

        return response_data, 200