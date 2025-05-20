from app.models.employee_model import EmployeeModel
from app.models.organization_model import OrganizationModel
from app.models import db  # Import the db object
from datetime import datetime  # Import datetime for timestamps

class EmployeeService:
    
    # @staticmethod
    # def get_employee_by_id(employee_id):
    #     try:
    #         return EmployeeModel.query.filter_by(employee_id=employee_id).first()
    #     except Exception as e:
    #         # Log the error (assuming you have a logging system)
    #         print(f"Database error while fetching employee {employee_id}: {str(e)}")
    #         return None  # Return None to indicate failure
        
    @staticmethod
    def get_employee_by_id(employee_id):
        try:
            employee = EmployeeModel.query.filter_by(employee_id=employee_id).first()
            if not employee:
                return None

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
            }
        except Exception as e:
            # Ideally use a logging framework instead of print
            print(f"Database error while fetching employee {employee_id}: {str(e)}")
            return None
        
    @staticmethod
    def get_all_employees():
        try:
            employees = EmployeeModel.query.all()

            return { 
                'employee_list': [
                    {
                        'employee_id': emp.employee_id,
                        'employee_first_name': emp.first_name,
                        'employee_last_name': emp.last_name,
                    }
                    for emp in employees
                ]
            }
        except Exception as e:
            # Log the error (assuming you have a logging system)
            print(f"Database error while fetching all employees: {str(e)}")

    @staticmethod
    def update_employee(employee):
        try:
            db.session.commit()
        except Exception as e:
            # Log the error (assuming you have a logging system)
            print(f"Database error while updating employee {employee.employee_id}: {str(e)}")
            raise e
        
    @staticmethod
    def add_employee(data, created_by):
        if EmployeeModel.query.filter_by(employee_id=data.get('employee_id')).first():
            raise ValueError("The employee already exists")
        
        organization_id = data.get('organization_id')
        if not organization_id:
            raise ValueError("Missing organization_id")
        
        if not OrganizationModel.query.filter_by(organization_id=organization_id).first():
            raise ValueError(f"Organization with id {organization_id} does not exist")
        
        employee = EmployeeModel(
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
            updated_at=datetime.utcnow(),
            updated_by=created_by,
            hashed_password=data.get('hashed_password', 'default_hashed_password')
        )

        try:
            db.session.add(employee)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Database error while adding employee {employee.employee_id}: {str(e)}")
            raise e
    
    @staticmethod
    def edit_employee(employee_id, data, updated_by):
        try:
            employee = EmployeeModel.query.filter_by(employee_id=employee_id).first()
            if not employee:
                return False
            
            for field in [
                "first_name", "last_name", "email", "phone_number", 
                "is_admin", "organization_id", "job_title", "hire_date", "hire_status"
            ]:
                if field in data:
                    setattr(employee, field, data[field])

            employee.updated_at = datetime.utcnow()
            employee.updated_by = updated_by

            db.session.commit()
            return True
        except Exception as e:
            db.session.rollback()
            print(f"Database error while editing employee {employee_id}: {str(e)}")
            raise e
        
    @staticmethod
    def reset_password(employee_id, original_hashed_password, new_hashed_password):
        if not original_hashed_password or not new_hashed_password:
            raise ValueError("Both original and new passwords are required.")

        employee = EmployeeModel.query.filter_by(employee_id=employee_id).first()
        if not employee:
            raise ValueError("Employee not found.")

        if employee.hashed_password != original_hashed_password:
            raise PermissionError("Original password is incorrect.")

        employee.hashed_password = new_hashed_password
        db.session.commit()