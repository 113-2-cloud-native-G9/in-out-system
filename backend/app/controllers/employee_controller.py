from flask import request
from flask_restful import Resource
from app.services.employee_service import EmployeeService
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

# get /api/v1/employees/<string:employee_id>
class EmployeeResource(Resource):
    @jwt_required()
    def get(self, employee_id):

        # Get user identity & check roles
        current_user = get_jwt_identity()
        is_admin = current_user["is_admin"]
        is_manager = current_user["is_manager"]

        if not employee_id:
            return {'message': 'Employee not found'}, 404
        
        if not (is_admin or is_manager):
            return {'message': 'Access denied. Only admins and managers can view this information.'}, 403
        
        employee = EmployeeService.get_employee_by_id(employee_id)
        
        return {
            'employee_id': employee.employee_id,
            'first_name': employee.first_name,
            'last_name': employee.last_name,
            'phone_number': employee.phone_number,
            'email': employee.email,
            'organization_id': employee.organization_id,
            'job_title': employee.job_title,
            'hire_date': employee.hire_date.isoformat(),
            'hire_status': employee.hire_status,
            'is_admin': employee.is_admin,
            'updated_at': employee.updated_at.isoformat(),
            'updated_by': employee.updated_by,
        }, 200
    
# post /api/v1/employees/reset-password
class ResetPasswordResource(Resource):
    @jwt_required()
    def post(self):

        # Get user identity & check roles
        current_user = get_jwt_identity()
        is_admin = current_user["is_admin"]
        is_manager = current_user["is_manager"]
        
        # Parse request data
        data = request.get_json()
        employee_id = data.get("employee_id")
        original_hashed_password = data.get("original_hashed_password")
        new_hashed_password = data.get("new_hashed_password")

        if not original_hashed_password or not new_hashed_password:
            return {"message": "Both original and new passwords are required."}, 400

        employee = EmployeeService.get_employee_by_id(employee_id)
        if not employee:
            return {"message": "Employee not found."}, 404

        # Check if the current user is an admin or the owner of the account
        if not is_admin and employee.employee_id != employee_id:
            return {"message": "Access denied. You can only reset your own password."}, 403

        # Verify the original password
        if employee.hashed_password != original_hashed_password:
            return {"message": "Original password is incorrect."}, 403

        # Update the password
        # employee.hashed_password = generate_password_hash(new_hashed_password)
        employee.hashed_password = new_hashed_password
        
        try:
            EmployeeService.update_employee(employee)
            return {"message": "Password reset successfully."}, 200
        except Exception as e:
            return {"message": f"Failed to reset password: {str(e)}"}, 500