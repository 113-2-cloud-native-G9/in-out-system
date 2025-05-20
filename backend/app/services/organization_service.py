from app.models.organization_model import OrganizationModel
from app.models.employee_model import EmployeeModel
from app.models import db

class OrganizationService:
    @staticmethod  #不用建立class實體也可以直接呼叫函式
    def get_organization_list():
        orgs = OrganizationModel.query.all()
        
        result = [
            {
                "organization_id": org.organization_id,
                "organization_name": org.organization_name
            }
            for org in orgs
        ]
        
        return {"organization": result}, 200  #狀態碼 200 OK #不須jsonify，flask會自動做
    
    @staticmethod
    def get_organization_by_id(organization_id):
        #查詢該組織
        org = OrganizationModel.query.filter_by(organization_id=organization_id).first()
        if not org:
            return {"error": "Organization not found."}, 404

        #查詢上層組織（parent）
        parent_org = OrganizationModel.query.filter_by(organization_id=org.parent_department_id).first()
        parent_name = parent_org.organization_name if parent_org else None

        #查詢該組織的 manager
        manager = EmployeeModel.query.filter_by(employee_id=org.manager_id).first()
        manager_id = manager.employee_id if manager else None
        manager_first_name = manager.first_name if manager else None
        manager_last_name = manager.last_name if manager else None

        #查詢所有隸屬於該組織的員工
        employees = EmployeeModel.query.filter_by(organization_id=organization_id).all()
        employee_list = [
            {
                "employee_id": emp.employee_id,
                "employee_first_name": emp.first_name,
                "employee_last_name": emp.last_name,
                "email": emp.email,
                "phone_number": emp.phone_number,
                "job_title": emp.job_title,
                "hire_date": emp.hire_date.strftime("%Y-%m-%d"),
                "hire_status": emp.hire_status
            }
            for emp in employees
        ]

        #整理回傳結果
        response = {
            "organization_id": org.organization_id,
            "organization_name": org.organization_name,
            "parent_organization_id": org.parent_department_id,
            "parent_organization_name": parent_name,
            "manager_id": manager_id,
            "manager_first_name": manager_first_name,
            "manager_last_name": manager_last_name,
            "employee_count": len(employee_list),
            "employee_list": employee_list
        }

        return response, 200
    
    @staticmethod
    def get_organization_tree():
        # 1. 抓出所有組織
        orgs = OrganizationModel.query.all()

        # 2. 建一張 org_id 對應 organization 的 dict（方便組成樹）
        org_dict = {}
        for org in orgs:
            org_dict[org.organization_id] = {
                "organization_id": org.organization_id,
                "organization_name": org.organization_name,
                "parent_organization_id": org.parent_department_id,
                "manager_id": org.manager_id,
                "manager_first_name": "",
                "manager_last_name": "",
                "employee_count": "0",  #新增的，預設員工數量為0
                "children": []
            }

        # 3. 一次抓出所有 manager，建立 manager_id → manager 的對應表
        manager_ids = [org.manager_id for org in orgs]
        managers = EmployeeModel.query.filter(EmployeeModel.employee_id.in_(manager_ids)).all()
        manager_map = {m.employee_id: m for m in managers}

        # 4. 把 manager 名字補進去
        for org_data in org_dict.values():
            manager = manager_map.get(org_data["manager_id"])
            if manager:
                org_data["manager_first_name"] = manager.first_name
                org_data["manager_last_name"] = manager.last_name

        #新增的4.5. 計算每個組織的員工數量
        for org in org_dict.values():
            #查詢該組織的員工數量
            employees = EmployeeModel.query.filter_by(organization_id=org["organization_id"]).all()
            org["employee_count"] = str(len(employees))

        # 5. 把所有組織串成樹狀結構
        root_orgs = []
        for org in org_dict.values():
            parent_id = org["parent_organization_id"]

            # 跳過無效 parent：自己是自己的 parent，或 parent 根本不存在
            if parent_id == org["organization_id"] or parent_id not in org_dict:
                root_orgs.append(org)
            else:
                org_dict[parent_id]["children"].append(org)

        # 6. 回傳 JSON 格式
        return {"organizations": root_orgs}, 200
    
    @staticmethod
    def delete_organization(organization_id):
        # 1. 查詢該組織是否存在
        org = OrganizationModel.query.filter_by(organization_id=organization_id).first()
        if not org:
            return {"error": "Organization not found."}, 404

        # 2. 檢查是否為 leaf 組織
        has_children = OrganizationModel.query.filter_by(parent_department_id=organization_id).first()
        if has_children:
            return {"error": "Cannot delete non-leaf organization node."}, 400

        # 3. 查出所有要被刪除的員工
        employees = EmployeeModel.query.filter_by(organization_id=organization_id).all()
        employee_ids = [emp.employee_id for emp in employees]

        # 4. 把其他部門用到這些員工當 manager_id 的清空掉
        OrganizationModel.query.filter(OrganizationModel.manager_id.in_(employee_ids))\
            .update({OrganizationModel.manager_id: None}, synchronize_session=False)

        # 5. 刪除這些員工
        for emp in employees:
            db.session.delete(emp)

        # 6. 刪除組織
        db.session.delete(org)
        db.session.commit()

        return {"message": "Organization and related employees deleted successfully."}, 200