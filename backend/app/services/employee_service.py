from app.models.employee_model import EmployeeModel
from app.models import db  # Import the db object

class EmployeeService:
    
    @staticmethod
    def get_employee_by_id(employee_id):
        try:
            return EmployeeModel.query.filter_by(employee_id=employee_id).first()
        except Exception as e:
            # Log the error (assuming you have a logging system)
            print(f"Database error while fetching employee {employee_id}: {str(e)}")
            return None  # Return None to indicate failure
        
    @staticmethod
    def update_employee(employee):
        try:
            db.session.commit()
        except Exception as e:
            # Log the error (assuming you have a logging system)
            print(f"Database error while updating employee {employee.employee_id}: {str(e)}")
            raise e