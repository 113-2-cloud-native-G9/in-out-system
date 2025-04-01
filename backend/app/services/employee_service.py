from app.models.employee_model import EmployeeModel

class EmployeeService:
    
    @staticmethod
    def get_employee_by_id(employee_id):
        try:
            return EmployeeModel.query.filter_by(employee_id=employee_id).first()
        except Exception as e:
            # Log the error (assuming you have a logging system)
            print(f"Database error while fetching employee {employee_id}: {str(e)}")
            return None  # Return None to indicate failure