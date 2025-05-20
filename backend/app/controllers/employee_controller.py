from flask import request
from flask_restful import Resource
from app.services.employee_service import EmployeeService
from datetime import datetime  # Import datetime for timestamps
from app.models.employee_model import EmployeeModel  # Import EmployeeModel
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from dateutil.parser import isoparse  # pip install python-dateutil

# get /api/v1/employees/<string:employee_id>
class EmployeeResource(Resource):

    @jwt_required()
    def get(self, employee_id):
        current_user = get_jwt_identity()
        is_admin = current_user["is_admin"]
        is_manager = current_user["is_manager"]

        if not employee_id:
            return {'message': 'Employee not found'}, 404
        
        if not (is_admin or is_manager):
            return {'message': 'Access denied. Only admins and managers can view this information.'}, 403
        
        employee_data = EmployeeService.get_employee_by_id(employee_id)
        
        if not employee_data:
            return {'message': 'Employee not found'}, 404

        return employee_data, 200

# get /api/v1/employees-list
class EmployeeListResource(Resource):
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        is_admin = current_user["is_admin"]

        if not (is_admin):
            return {'message': 'Access denied. Only admins can view this information.'}, 403
        
        data = EmployeeService.get_all_employees() # json
        
        if not data or not data.get("employee_list"):
            return {'message': 'No employees found'}, 404
        
        return data, 200

# post /api/v1/employees
class EmployeeAddingResource(Resource):
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        is_admin = current_user["is_admin"]

        if not is_admin:
            return {'message': 'Access denied. Only admins can add employees.'}, 403

        data = request.get_json()

        # Parse hire_date string into datetime object
        if 'hire_date' in data:
            try:
                data['hire_date'] = isoparse(data['hire_date'])
            except Exception:
                return {'message': 'Invalid hire_date format. Use ISO8601 date string.'}, 400

        try:
            EmployeeService.add_employee(data, current_user["employee_id"]) 
            return {"message": "Employee added successfully"}, 201
        except ValueError as ve:
            return {'message': str(ve)}, 400
        except Exception as e:
            return {"message": f"Failed to add employee: {str(e)}"}, 500

# put /api/v1/employees/{employee_id}
class EmployeeEditingResource(Resource):
    @jwt_required()
    def put(self, employee_id):
        current_user = get_jwt_identity()
        is_admin = current_user["is_admin"]

        if not is_admin:
            return {'message': 'Access denied. Only admins can edit employees.'}, 403

        data = request.get_json()
        try:
            success = EmployeeService.edit_employee(employee_id, data, current_user["employee_id"])
            if not success:
                return {'message': 'Employee not found'}, 404
            return {"message": "Employee updated successfully"}, 200
        except Exception as e:
            return {"message": f"Failed to update employee: {str(e)}"}, 500


# post /api/v1/employees/reset-password
class ResetPasswordResource(Resource):
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        is_admin = current_user["is_admin"]

        data = request.get_json()
        try:
            EmployeeService.reset_password(
                current_user=current_user,
                employee_id=data.get("employee_id"),
                original_hashed_password=data.get("original_hashed_password"),
                new_hashed_password=data.get("new_hashed_password")
            )
            return {"message": "Password reset successfully."}, 200
        except ValueError as ve:
            return {"message": str(ve)}, 400
        except PermissionError as pe:
            return {"message": str(pe)}, 403
        except Exception as e:
            return {"message": f"Failed to reset password: {str(e)}"}, 500
        

