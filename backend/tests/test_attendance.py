# tests/test_attendance.py

from datetime import datetime, timezone, timedelta
from app.models import db
from app.models.employee_model import EmployeeModel
from app.models.gate_model import GateModel
from app.models.accesslog_model import AccessLogModel
from app.models.organization_model import OrganizationModel

def test_update_attendance_success(client):
    with client.application.app_context():
        # 建 Gate（in & out 各一個）
        gate_in = GateModel(gate_id=1, gate_name="IN", direction="in", gate_type="entry")
        gate_out = GateModel(gate_id=2, gate_name="OUT", direction="out", gate_type="exit")
        db.session.add_all([gate_in, gate_out])
        db.session.commit()

        # 建 Employee
        emp = EmployeeModel(
            employee_id="E001",
            first_name="Test",
            last_name="User",
            email="test@example.com",
            phone_number="0911222333",
            job_title="Engineer",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORG001",
            is_admin=True,
            hashed_password="pw",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )
        db.session.add(emp)
        db.session.commit()

        # 建 AccessLog（當天）
        now = datetime.now(timezone.utc)
        check_in_time = now.replace(hour=8, minute=10, second=0, microsecond=0)
        check_out_time = now.replace(hour=17, minute=10, second=0, microsecond=0)
        in_log = AccessLogModel(employee_id="E001", access_time=check_in_time, gate_id=1)
        out_log = AccessLogModel(employee_id="E001", access_time=check_out_time, gate_id=2)
        db.session.add_all([in_log, out_log])
        db.session.commit()

    # 呼叫 API
    res = client.put("/api/v1/attendance/update")
    assert res.status_code == 200

    data = res.get_json()
    print("🔍 DEBUG: 回傳內容 =>", data)

    # ✅ 修正這裡的邏輯
    assert "message" in data
    assert isinstance(data["message"], str)


#測試 GET /api/v1/attendance/employees/<employee_id>?month=YYYY-MM 員工查詢自己某月份的出勤紀錄成功
def test_get_attendance_by_employee_success(client):
    with client.application.app_context():
        # 建立 Gate
        gate_in = GateModel(gate_id=1, gate_name="IN", direction="in", gate_type="entry")
        gate_out = GateModel(gate_id=2, gate_name="OUT", direction="out", gate_type="exit")
        db.session.add_all([gate_in, gate_out])
        db.session.commit()

        # 建立組織
        org = OrganizationModel(
            organization_id="ORG001",
            organization_name="R&D Dept",
            manager_id="E001",  # 指定等下這個人是 manager（否則登入時會查不到 org）
            parent_department_id=None
        )
        db.session.add(org)
        db.session.commit()

        # 建立員工
        emp = EmployeeModel(
            employee_id="E001",
            first_name="Normal",
            last_name="User",
            email="user@example.com",
            phone_number="0911222333",
            job_title="Engineer",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORG001",
            is_admin=False,
            hashed_password="pw",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )
        db.session.add(emp)
        db.session.commit()

        # 執行更新出勤
        update_res = client.put("/api/v1/attendance/update")
        assert update_res.status_code == 200

        # 登入取得 JWT
        login_res = client.post("/api/v1/auth/login", json={
            "employee_id": "E001",
            "hashed_password": "pw"
        })
        assert login_res.status_code == 200
        token = login_res.get_json()["jwt_token"]

    # 呼叫出勤查詢 API
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/v1/attendance/employees/E001?month=2025-05", headers=headers)
    assert res.status_code == 200
    data = res.get_json()
    assert data["employee_id"] == "E001"
    assert "records" in data
    assert isinstance(data["records"], list)


# 測試 GET /api/v1/attendance/organizations/<organization_id>
# 🔧 新版 API：加入 month=YYYY-MM 查詢參數
def test_get_attendance_by_organization_success(client):
    with client.application.app_context():
        # 1. 建立 Gate（in/out 各一個）
        gate_in = GateModel(gate_id=1, gate_name="IN", direction="in", gate_type="entry")
        gate_out = GateModel(gate_id=2, gate_name="OUT", direction="out", gate_type="exit")
        db.session.add_all([gate_in, gate_out])
        db.session.commit()

        # 2. 建立 admin 員工與組織
        admin = EmployeeModel(
            employee_id="ADMIN1",
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            phone_number="0988000111",
            job_title="Administrator",
            hire_date=datetime.now(),
            hire_status="Active",
            organization_id="ORGX",
            is_admin=True,
            hashed_password="pw",
            updated_at=datetime.now(),
            updated_by="system"
        )
        org = OrganizationModel(
            organization_id="ORGX",
            organization_name="Test Department",
            manager_id="ADMIN1",
            parent_department_id=None
        )
        db.session.add_all([admin, org])
        db.session.commit()

        # 3. 建立兩位員工，emp1 會有出勤資料
        emp1 = EmployeeModel(
            employee_id="E101",
            first_name="Alice",
            last_name="Wang",
            email="alice@example.com",
            phone_number="0911111111",
            job_title="Staff",
            hire_date=datetime.now(),
            hire_status="Active",
            organization_id="ORGX",
            is_admin=False,
            hashed_password="pw1",
            updated_at=datetime.now(),
            updated_by="system"
        )
        emp2 = EmployeeModel(
            employee_id="E102",
            first_name="Bob",
            last_name="Chen",
            email="bob@example.com",
            phone_number="0922222222",
            job_title="Staff",
            hire_date=datetime.now(),
            hire_status="Active",
            organization_id="ORGX",
            is_admin=False,
            hashed_password="pw2",
            updated_at=datetime.now(),
            updated_by="system"
        )
        db.session.add_all([emp1, emp2])
        db.session.commit()

        month = datetime.now().strftime("%Y-%m")
        # 4. 插入 access log（注意：naive datetime 才會被 update_attendance_service() 抓到）
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        checkin_time = today + timedelta(hours=8, minutes=5)
        checkout_time = today + timedelta(hours=17, minutes=25)

        in_log = AccessLogModel(employee_id="E101", access_time=checkin_time, gate_id=1)
        out_log = AccessLogModel(employee_id="E101", access_time=checkout_time, gate_id=2)
        db.session.add_all([in_log, out_log])
        db.session.commit()

    # 5. 更新出勤
    update_res = client.put("/api/v1/attendance/update")
    assert update_res.status_code == 200

    # 6. 登入 admin 拿 token
    login_res = client.post("/api/v1/auth/login", json={
        "employee_id": "ADMIN1",
        "hashed_password": "pw"
    })
    assert login_res.status_code == 200
    jwt_token = login_res.get_json()["jwt_token"]

    # 7. 呼叫 API 拿 ORGX 出勤資料
    headers = {"Authorization": f"Bearer {jwt_token}"}
    res = client.get(f"/api/v1/attendance/organizations/ORGX?month={month}", headers=headers)
    assert res.status_code == 200

    data = res.get_json()
    assert isinstance(data, list)

    # 8. 檢查 emp1 有記錄且至少有一筆出勤資料
    matched_emp = next((emp for emp in data if emp["employee_id"] == "E101"), None)
    assert matched_emp is not None
    assert len(matched_emp["records"]) >= 1