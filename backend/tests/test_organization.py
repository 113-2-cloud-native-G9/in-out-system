from app.models import db
from app.models.employee_model import EmployeeModel
from app.models.organization_model import OrganizationModel
from datetime import datetime, timezone

# 測試 admin 成功撈組織列表
def test_get_organization_list_success(client):
    with client.application.app_context():
        # 建立一個 admin 員工
        admin_emp = EmployeeModel(
            employee_id="EADMIN",
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            phone_number="0911222333",
            job_title="Admin",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORG001",
            is_admin=True,
            hashed_password="fake_hashed_password",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )

        # 建立一筆組織資料
        org = OrganizationModel(
            organization_id="ORG001",
            organization_name="Test Org",
            manager_id="EADMIN",
            parent_department_id=None
        )

        db.session.add(admin_emp)
        db.session.add(org)
        db.session.commit()

    # 登入拿 token
    login_res = client.post("/api/v1/auth/login", json={
        "employee_id": "EADMIN",
        "hashed_password": "fake_hashed_password"
    })

    assert login_res.status_code == 200
    jwt_token = login_res.get_json()["jwt_token"]

    # 打組織列表 API，帶 token
    headers = {"Authorization": f"Bearer {jwt_token}"}
    res = client.get("/api/v1/organizations/list", headers=headers)

    assert res.status_code == 200
    data = res.get_json()
    assert "organization" in data
    assert isinstance(data["organization"], list)
    assert any("organization_id" in org and "organization_name" in org for org in data["organization"])


# 測試：非 admin 嘗試撈組織列表會被拒
def test_get_organization_list_unauthorized(client):
    from app.models import db
    from app.models.employee_model import EmployeeModel
    from app.models.organization_model import OrganizationModel
    from datetime import datetime, timezone

    with client.application.app_context():
        # 建立一個非 admin 員工
        normal_emp = EmployeeModel(
            employee_id="E001",
            first_name="Normal",
            last_name="User",
            email="normal@example.com",
            phone_number="0988777666",
            job_title="Staff",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORG001",
            is_admin=False,
            hashed_password="fake_hashed_password",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )

        # 給他一個組織，不然 login 還是會炸
        org = OrganizationModel(
            organization_id="ORG001",
            organization_name="Test Org",
            manager_id="E001",
            parent_department_id=None
        )

        db.session.add(normal_emp)
        db.session.add(org)
        db.session.commit()

    # 登入拿 token
    login_res = client.post("/api/v1/auth/login", json={
        "employee_id": "E001",
        "hashed_password": "fake_hashed_password"
    })

    assert login_res.status_code == 200
    jwt_token = login_res.get_json()["jwt_token"]

    # 打組織列表 API，帶上非 admin 的 token
    headers = {"Authorization": f"Bearer {jwt_token}"}
    res = client.get("/api/v1/organizations/list", headers=headers)

    # 應該被擋下來
    assert res.status_code == 403
    assert "error" in res.get_json()

# 測試/api/v1/organizations/<organization_id>
def test_get_organization_detail_success(client):
    from app.models import db
    from app.models.employee_model import EmployeeModel
    from app.models.organization_model import OrganizationModel
    from datetime import datetime, timezone

    with client.application.app_context():
        # 建 manager 員工
        manager = EmployeeModel(
            employee_id="EMGR",
            first_name="Manager",
            last_name="User",
            email="mgr@example.com",
            phone_number="0911111111",
            job_title="Manager",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORG900",
            is_admin=False,
            hashed_password="fake_hashed_password",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )

        # 建組織 ORG900，manager 是上面那個人
        org = OrganizationModel(
            organization_id="ORG900",
            organization_name="Research Dept",
            manager_id="EMGR",
            parent_department_id=None
        )

        # 建底下的員工
        emp1 = EmployeeModel(
            employee_id="E001",
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone_number="0912345678",
            job_title="Engineer",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORG900",
            is_admin=False,
            hashed_password="pw1",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )

        emp2 = EmployeeModel(
            employee_id="E002",
            first_name="Jane",
            last_name="Smith",
            email="jane@example.com",
            phone_number="0923456789",
            job_title="Designer",
            hire_date=datetime.now(timezone.utc),
            hire_status="Inactive",
            organization_id="ORG900",
            is_admin=False,
            hashed_password="pw2",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )

        db.session.add_all([manager, emp1, emp2, org])
        db.session.commit()

    # 登入 manager，因為有 manager 權限就能打這支 API
    login_res = client.post("/api/v1/auth/login", json={
        "employee_id": "EMGR",
        "hashed_password": "fake_hashed_password"
    })

    assert login_res.status_code == 200
    jwt_token = login_res.get_json()["jwt_token"]

    # 打 API
    headers = {"Authorization": f"Bearer {jwt_token}"}
    res = client.get("/api/v1/organizations/ORG900", headers=headers)

    assert res.status_code == 200
    data = res.get_json()
    assert data["organization_id"] == "ORG900"
    assert data["organization_name"] == "Research Dept"
    assert data["manager_id"] == "EMGR"
    assert len(data["employee_list"]) == data["employee_count"]
    assert isinstance(data["employee_list"], list)
    assert any(emp["employee_id"] == "E001" for emp in data["employee_list"])
    assert any(emp["employee_id"] == "E002" for emp in data["employee_list"])

# 測試非 admin 或 manager 嘗試撈組織會被拒
def test_get_organization_detail_not_found(client):
    from app.models import db
    from app.models.employee_model import EmployeeModel
    from app.models.organization_model import OrganizationModel
    from datetime import datetime, timezone

    with client.application.app_context():
    # 建 admin 員工
        admin_emp = EmployeeModel(
            employee_id="E404",
            first_name="Admin",
            last_name="User",
            email="notfound@example.com",
            phone_number="0999999999",
            job_title="Admin",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORGX",
            is_admin=True,
            hashed_password="fake_hashed_password",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )

        # 要建立一個假的組織，才能讓 login 通過
        org = OrganizationModel(
            organization_id="ORGX",
            organization_name="Ghost Dept",
            manager_id="E404",
            parent_department_id=None
        )

        db.session.add_all([admin_emp, org])
        db.session.commit()


    # 登入 admin 拿 token
    login_res = client.post("/api/v1/auth/login", json={
        "employee_id": "E404",
        "hashed_password": "fake_hashed_password"
    })

    assert login_res.status_code == 200
    jwt_token = login_res.get_json()["jwt_token"]

    # 打 API 查一個根本不存在的組織 ID
    headers = {"Authorization": f"Bearer {jwt_token}"}
    res = client.get("/api/v1/organizations/NONSENSE123", headers=headers)

    assert res.status_code == 404
    data = res.get_json()
    assert data["error"] == "Organization not found."

# 測試 DELETE /api/v1/organizations/<id> 成功刪除 leaf 組織
def test_delete_leaf_organization_success(client):
    from app.models import db
    from app.models.employee_model import EmployeeModel
    from app.models.organization_model import OrganizationModel
    from datetime import datetime, timezone

    with client.application.app_context():
        # 建 admin 員工
        admin_emp = EmployeeModel(
            employee_id="EDEL",
            first_name="Admin",
            last_name="Delete",
            email="del@example.com",
            phone_number="0977123456",
            job_title="Admin",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORGDEL",
            is_admin=True,
            hashed_password="fake_hashed_password",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )

        # 建 leaf 組織 ORGDEL
        org = OrganizationModel(
            organization_id="ORGDEL",
            organization_name="Temporary Dept",
            manager_id="EDEL",
            parent_department_id=None
        )

        # 建一個員工底下屬於這個部門
        emp = EmployeeModel(
            employee_id="E555",
            first_name="Worker",
            last_name="Bee",
            email="bee@example.com",
            phone_number="0911999888",
            job_title="Temp",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORGDEL",
            is_admin=False,
            hashed_password="pw",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )

        db.session.add_all([admin_emp, org, emp])
        db.session.commit()

    # 登入 admin
    login_res = client.post("/api/v1/auth/login", json={
        "employee_id": "EDEL",
        "hashed_password": "fake_hashed_password"
    })
    assert login_res.status_code == 200
    jwt_token = login_res.get_json()["jwt_token"]

    # 打 DELETE API
    headers = {"Authorization": f"Bearer {jwt_token}"}
    res = client.delete("/api/v1/organizations/ORGDEL", headers=headers)

    assert res.status_code == 200
    data = res.get_json()
    assert data["message"] == "Organization and related employees deleted successfully."

    # 確認資料真的不見
    with client.application.app_context():
        from app.models.organization_model import OrganizationModel
        from app.models.employee_model import EmployeeModel

        assert OrganizationModel.query.filter_by(organization_id="ORGDEL").first() is None
        assert EmployeeModel.query.filter_by(employee_id="E555").first() is None

# 測試：非 admin 拒看組織樹（403）
def test_get_organization_tree_non_admin_forbidden(client):
    from app.models import db
    from app.models.employee_model import EmployeeModel
    from datetime import datetime, timezone

    from app.models.organization_model import OrganizationModel

    with client.application.app_context():
        org = OrganizationModel(
            organization_id="ORGZ",
            organization_name="Non Admin Dept",
            manager_id="ENOTADMIN",  # 可以設定自己當 manager
            parent_department_id=None
        )
        emp = EmployeeModel(
            employee_id="ENOTADMIN",
            first_name="Normal",
            last_name="User",
            email="user@example.com",
            phone_number="0988777666",
            job_title="Staff",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORGZ",
            is_admin=False,
            hashed_password="pw",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )
        db.session.add_all([org, emp])
        db.session.commit()


    # login 拿 token
    login_res = client.post("/api/v1/auth/login", json={
        "employee_id": "ENOTADMIN",
        "hashed_password": "pw"
    })
    assert login_res.status_code == 200
    jwt_token = login_res.get_json()["jwt_token"]

    # 非 admin 去打 tree view
    headers = {"Authorization": f"Bearer {jwt_token}"}
    res = client.get("/api/v1/organizations", headers=headers)

    assert res.status_code == 403
    data = res.get_json()
    assert data["error"] == "Only Administrator can access this resource."

# 測試：刪除非 leaf 組織（失敗）
def test_delete_non_leaf_organization_should_fail(client):
    from app.models import db
    from app.models.employee_model import EmployeeModel
    from app.models.organization_model import OrganizationModel
    from datetime import datetime, timezone

    with client.application.app_context():
        admin = EmployeeModel(
            employee_id="EROOT",
            first_name="Admin",
            last_name="Tree",
            email="tree@example.com",
            phone_number="0977123456",
            job_title="Admin",
            hire_date=datetime.now(timezone.utc),
            hire_status="Active",
            organization_id="ORGROOT",
            is_admin=True,
            hashed_password="pw",
            updated_at=datetime.now(timezone.utc),
            updated_by="system"
        )

        parent_org = OrganizationModel(
            organization_id="ORGROOT",
            organization_name="Root Dept",
            manager_id="EROOT",
            parent_department_id=None
        )

        child_org = OrganizationModel(
            organization_id="ORGCHILD",
            organization_name="Child Dept",
            manager_id="EROOT",
            parent_department_id="ORGROOT"
        )

        db.session.add_all([admin, parent_org, child_org])
        db.session.commit()

    login_res = client.post("/api/v1/auth/login", json={
        "employee_id": "EROOT",
        "hashed_password": "pw"
    })
    assert login_res.status_code == 200
    jwt_token = login_res.get_json()["jwt_token"]

    headers = {"Authorization": f"Bearer {jwt_token}"}
    res = client.delete("/api/v1/organizations/ORGROOT", headers=headers)

    assert res.status_code == 400
    assert res.get_json()["error"] == "Cannot delete non-leaf organization node."
