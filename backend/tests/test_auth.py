from app.models.employee_model import EmployeeModel
from app import db
from datetime import datetime, timezone

# 測試登入成功
def test_auth_login_success(client):
    with client.application.app_context():
        fake_employee = EmployeeModel(
            employee_id="E001",
            first_name="Test",
            last_name="User",
            phone_number="0912345678",
            email="test@example.com",
            organization_id="ORG001",
            job_title="Engineer",
            hire_date= datetime.now(timezone.utc),
            hire_status="Active",
            is_admin=True,
            updated_at = datetime.now(timezone.utc),
            updated_by="system",
            hashed_password="fake_hashed_password"
        )
        #這邊還要塞其他資料表的資料才能測成功＃＃＃＃！！！！！！！

        db.session.add(fake_employee)
        db.session.commit()

    response = client.post('/api/v1/auth/login', json={
        "employee_id": "E001",
        "hashed_password": "fake_hashed_password"
    })

    assert response.status_code == 200
    

# 測試送空資料
def test_auth_login_no_data(client):
    response = client.post('/api/v1/auth/login', json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "No data received"

# 測試缺少 employee_id
def test_auth_login_missing_employee_id(client):
    response = client.post('/api/v1/auth/login', json={
        "hashed_password": "fake_hashed_password"
    })
    assert response.status_code == 400
    assert response.get_json()["error"] == "No employee_id provided"

# 測試缺少 hashed_password
def test_auth_login_missing_hashed_password(client):
    response = client.post('/api/v1/auth/login', json={
        "employee_id": "E001"
    })
    assert response.status_code == 400
    assert "error" in response.get_json()
