from flask import request
from flask_restful import Resource
from app.services.employee_service import EmployeeService
from datetime import datetime  # Import datetime for timestamps
from app.models.employee_model import EmployeeModel  # Import EmployeeModel
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
    
# post /api/v1/employees
class EmployeeAddingResource(Resource):
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        is_admin = current_user["is_admin"]

        data = request.get_json()
        if not is_admin:
            return {'message': 'Access denied. Only admins can add employees.'}, 403

        if EmployeeService.get_employee_by_id(data.get('employee_id')):
            return {'message': 'The employee already exists'}, 400
        
        new_employee = EmployeeModel(
            employee_id=data.get('employee_id'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=data.get('email'),
            phone_number=data.get('phone_number'),
            is_admin=data.get('is_admin', False),
            job_title=data.get('job_title'),
            organization_id=data.get('organization_id'),
            hire_date=data.get('hire_date'),
            hire_status=data.get('hire_status', 'active'),
            updated_at=datetime.utcnow(),  # Set the current timestamp
            updated_by=current_user['employee_id'],  # Use the current user's ID for updated_by
            hashed_password=data.get('hashed_password', 'default_hashed_password'),  # Use a default hashed password or handle it as needed
        )

        EmployeeService.add_employee(new_employee)

        return {"message": "Employee added successfully"}, 201
    
# put /api/v1/employees/{employee_id}
class EmployeeEditingResource(Resource):
    @jwt_required()
    def put(self, employee_id):
        current_user = get_jwt_identity()
        is_admin = current_user["is_admin"]

        if not is_admin:
            return {'message': 'Access denied. Only admins can edit employees.'}, 403

        data = request.get_json()

        # Ensure the employee exists
        employee = EmployeeService.get_employee_by_id(employee_id)
        if not employee:
            return {'message': 'Employee not found'}, 404

        # Prepare updated data
        updated_data = {
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "email": data.get("email"),
            "phone_number": data.get("phone_number"),
            "is_admin": data.get("is_admin"),
            "organization_id": data.get("organization_id"),
            "job_title": data.get("job_title"),
            "hire_date": data.get("hire_date"),
            "hire_status": data.get("hire_status"),
            "updated_at": datetime.utcnow(),  # Update the timestamp
            "updated_by": current_user["employee_id"],  # Set the current user's ID
        }

        try:
            updated_employee = EmployeeService.edit_employee(employee_id, updated_data)
            if not updated_employee:
                return {'message': 'Employee not found'}, 404

            return {"message": "Employee updated successfully"}, 200
        except Exception as e:
            return {"message": f"Failed to update employee: {str(e)}"}, 500

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