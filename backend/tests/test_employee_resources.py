# test_employee_api.py
import json
from datetime import datetime, timezone
from app.models.employee_model import EmployeeModel
from app.models.gate_model import GateModel
from app.models.accesslog_model import AccessLogModel
from app.models.organization_model import OrganizationModel
from app.models import db
from flask_jwt_extended import create_access_token

# ----------------------------------
# /api/v1/employees/<employee_id> - 查詢員工資訊
# ----------------------------------

def test_get_employee_by_id_success(client):
    with client.application.app_context():
        dummy_employee = EmployeeModel(
            employee_id="E001",
            first_name="Test",
            last_name="User",
            phone_number="0912345678",
            email="test@example.com",
            organization_id="ORG001",
            job_title="Engineer",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            is_admin=True,
            updated_at=datetime.now(timezone.utc),
            updated_by="system",
            hashed_password="fake_hashed_password"
        )
        db.session.add(dummy_employee)
        db.session.commit()

        token = create_access_token(identity={
            "employee_id": "E001",
            "is_admin": True,
            "is_manager": True,
        })

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get('/api/v1/employees/E001', headers=headers)
    assert response.status_code == 200
    assert response.json['employee_id'] == 'E001'
    
def test_get_employee_by_id_access_denied(client):
    with client.application.app_context():
        token = create_access_token(identity={
            "employee_id": "E002",
            "is_admin": False,
            "is_manager": False,
        })

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get('/api/v1/employees/E001', headers=headers)
    assert response.status_code == 403
    assert response.json['message'] == 'Access denied. Only admins and managers can view this information.'

def test_get_employee_by_id_not_found(client):
    with client.application.app_context():
        token = create_access_token(identity={
            "employee_id": "E001",
            "is_admin": True,
            "is_manager": True,
        })

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get('/api/v1/employees/nonexistent_id', headers=headers)
    assert response.status_code == 404
    assert response.is_json
    assert response.json['message'] == 'Employee not found'

# ----------------------------------
# /api/v1/employees - 新增員工
# ----------------------------------
def test_add_employee_access_denied(client):
    with client.application.app_context():
        token = create_access_token(identity={
            "employee_id": "E001",
            "is_admin": False,
            "is_manager": True,
        })
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post('/api/v1/employees', data=json.dumps({}), content_type='application/json', headers=headers)
    assert response.status_code == 403
    assert response.json['message'] == 'Access denied. Only admins can add employees.'

def test_add_employee_db_success(client):
    with client.application.app_context():
        fake_organization = OrganizationModel(
            organization_id="ORG001",
            organization_name="Test Organization",
            manager_id="E000",
            parent_department_id="ORG001"
        )
        db.session.add(fake_organization)
        db.session.commit()

        token = create_access_token(identity={
            "employee_id": "E001",
            "is_admin": True,
            "is_manager": True,
        })

        headers = {"Authorization": f"Bearer {token}"}

        new_employee = {
            "employee_id": "1234561212",
            "first_name": "John2",
            "last_name": "Doe2",
            "email": "john2.doe2@example.com",
            "phone_number": "123-456-7890",
            "is_admin": True,
            "job_title": "Software Engineer",
            "organization_id": "ORG001",
            "hire_date": "2022-01-15",
            "hire_status": "active"
        }

        response = client.post('/api/v1/employees',
                               data=json.dumps(new_employee),
                               content_type='application/json',
                               headers=headers)

        assert response.status_code == 201
        assert response.json['message'] == "Employee added successfully"

def test_add_employee_invalid_hire_date_format(client):
    with client.application.app_context():
        fake_organization = OrganizationModel(
            organization_id="ORG001",
            organization_name="Test Organization",
            manager_id="E000",
            parent_department_id="ORG001"
        )
        db.session.add(fake_organization)
        db.session.commit()

        token = create_access_token(identity={
            "employee_id": "E001",
            "is_admin": True,
            "is_manager": True,
        })

    headers = {"Authorization": f"Bearer {token}"}

    new_employee = {
        "employee_id": "E002",
        "first_name": "Invalid",
        "last_name": "Date",
        "email": "invalid.date@example.com",
        "phone_number": "123-456-7890",
        "is_admin": False,
        "job_title": "Tester",
        "organization_id": "ORG001",
        "hire_date": "2022/13/40",
        "hire_status": "active"
    }

    response = client.post('/api/v1/employees',
                           data=json.dumps(new_employee),
                           content_type='application/json',
                           headers=headers)

    assert response.status_code == 400 or response.status_code == 422
    assert response.is_json
    assert 'hire_date' in response.json['message'].lower()


# ----------------------------------
# /api/v1/employees/<employee_id> - 更新員工資訊
# ----------------------------------
def test_edit_employee_access_denied(client):
    with client.application.app_context():
        token = create_access_token(identity={
            "employee_id": "E001",
            "is_admin": False,
            "is_manager": True,
        })

    headers = {"Authorization": f"Bearer {token}"}
    response = client.put('/api/v1/employees/E001', data=json.dumps({}), content_type='application/json', headers=headers)
    assert response.status_code == 403
    assert response.json['message'] == 'Access denied. Only admins can edit employees.'

def test_edit_employee_success(client):
    with client.application.app_context():
        token = create_access_token(identity={
            "employee_id": "E000",
            "is_admin": True,
            "is_manager": True,
        })
        headers = {"Authorization": f"Bearer {token}"}

        dummy_employee = EmployeeModel(
            employee_id="E001",
            first_name="Test",
            last_name="User",
            phone_number="0912345678",
            email="test@example.com",
            organization_id="ORG001",
            job_title="Engineer",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            is_admin=True,
            updated_at=datetime.now(timezone.utc),
            updated_by="system",
            hashed_password="fake_hashed_password"
        )
        db.session.add(dummy_employee)
        db.session.commit()

    update_data = {
        "first_name": "Jane",
        "last_name": "Doe",
        "email": "123"
    }

    response = client.put('/api/v1/employees/E001',
                          data=json.dumps(update_data),
                          content_type='application/json',
                          headers=headers)
    assert response.status_code == 200
    assert response.json['message'] == "Employee updated successfully"

def test_update_nonexistent_employee(client):
    with client.application.app_context():
        token = create_access_token(identity={
            "employee_id": "E000",
            "is_admin": True,
            "is_manager": True,
        })

    headers = {"Authorization": f"Bearer {token}"}

    update_data = {
        "first_name": "NoOne",
        "last_name": "Here",
        "email": "noone@example.com"
    }

    response = client.put('/api/v1/employees/nonexistent_employee_id',
                          data=json.dumps(update_data),
                          content_type='application/json',
                          headers=headers)

    assert response.status_code == 404
    assert response.is_json
    assert response.json['message'] == "Employee not found"


# ----------------------------------
# /api/v1/employees/reset-password - 重設密碼
# ----------------------------------

def test_reset_password_success(client):
    with client.application.app_context():
        token = create_access_token(identity={
            "employee_id": "E001",
            "is_admin": True,
            "is_manager": True,
        })
        headers = {"Authorization": f"Bearer {token}"}

        dummy_employee = EmployeeModel(
            employee_id="E001",
            first_name="Test",
            last_name="User",
            phone_number="0912345678",
            email="test@example.com",
            organization_id="ORG001",
            job_title="Engineer",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            is_admin=True,
            updated_at=datetime.now(timezone.utc),
            updated_by="system",
            hashed_password="fake_hashed_password"
        )
        db.session.add(dummy_employee)
        db.session.commit()

    password_data = {
        "original_hashed_password": "fake_hashed_password",
        "new_hashed_password": "new_pass"
    }

    response = client.post('/api/v1/employees/reset-password',
                           data=json.dumps(password_data),
                           content_type='application/json',
                           headers=headers)
    assert response.status_code == 200
    assert response.json['message'] == "Password reset successfully."

def test_reset_password_employee_not_found(client):
    with client.application.app_context():
        token = create_access_token(identity={
            "employee_id": "E000",
            "is_admin": True,
            "is_manager": True,
        })

    headers = {"Authorization": f"Bearer {token}"}

    password_data = {
        "original_hashed_password": "anything",
        "new_hashed_password": "new_pass"
    }

    response = client.post('/api/v1/employees/reset-password',
                           data=json.dumps(password_data),
                           content_type='application/json',
                           headers=headers)

    assert response.status_code == 400
    assert response.is_json
    assert response.json['message'] == "Employee not found."


# ----------------------------------
# /api/v1/employee-list - 取得員工清單
# ----------------------------------

def test_get_employee_list_success(client):
    with client.application.app_context():
        dummy_employee1 = EmployeeModel(
            employee_id="E001",
            first_name="Test",
            last_name="User1",
            phone_number="0912345678",
            email="test1@example.com",
            organization_id="ORG001",
            job_title="Engineer",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            is_admin=True,
            updated_at=datetime.now(timezone.utc),
            updated_by="system",
            hashed_password="fake_hashed_password"
        )
        dummy_employee2 = EmployeeModel(
            employee_id="E002",
            first_name="Test",
            last_name="User2",
            phone_number="0987654321",
            email="test2@example.com",
            organization_id="ORG001",
            job_title="Engineer",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            is_admin=False,
            updated_at=datetime.now(timezone.utc),
            updated_by="system",
            hashed_password="fake_hashed_password"
        )
        db.session.add(dummy_employee1)
        db.session.add(dummy_employee2)
        db.session.commit()

        token = create_access_token(identity={
            "employee_id": "E001",
            "is_admin": True,
            "is_manager": False,
        })

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get('/api/v1/employee-list', headers=headers)
    data = response.get_json()

    assert response.status_code == 200
    assert isinstance(data, dict)
    assert 'employee_list' in data
    employee_list = data['employee_list']
    assert isinstance(employee_list, list), "'employee_list' should be a list"

    for employee in employee_list:
        assert isinstance(employee, dict), "Each employee should be a dictionary"
        assert 'employee_id' in employee, "'employee_id' is missing in employee"
        assert 'employee_first_name' in employee, "'employee_first_name' is missing in employee"
        assert 'employee_last_name' in employee, "'employee_last_name' is missing in employee"
        assert isinstance(employee['employee_id'], str), "'employee_id' should be a string"
        assert isinstance(employee['employee_first_name'], str), "'employee_first_name' should be a string"
        assert isinstance(employee['employee_last_name'], str), "'employee_last_name' should be a string"

def test_get_employee_list_access_denied(client):
    
    with client.application.app_context():
        token = create_access_token(identity={
            "employee_id": "E003",
            "is_admin": False,
            "is_manager": False,
        })

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get('/api/v1/employee-list', headers=headers)
    assert response.status_code == 403
    assert response.is_json
    assert response.json['message'] == 'Access denied. Only admins can view this information.'

def test_get_employee_list_no_employees_found(client):
    with client.application.app_context():
        EmployeeModel.query.delete()
        db.session.commit()

        token = create_access_token(identity={
            "employee_id": "E001",
            "is_admin": True,
            "is_manager": True,
        })

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get('/api/v1/employee-list', headers=headers)
    assert response.is_json
    assert response.json['message'] == 'No employees found'

    assert response.status_code == 404
