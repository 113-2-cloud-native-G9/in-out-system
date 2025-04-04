from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.organization_service import OrganizationService


# GET /api/v1/organizations/list
class OrganizationList(Resource):
    @jwt_required()
    def get(self):
        claims = get_jwt_identity()
        #如果不是admim拒絕訪問
        if not claims["is_admin"]:
            return {"error": "Admin only access"}, 403
        
        #是admin
        return OrganizationService.get_organization_list()
    
# GET /api/v1/organizations/<organization_id>
class GetOrganization(Resource):
    @jwt_required()
    def get(self, organization_id):
        claims = get_jwt_identity()

        #限定Administrator或Manager
        if not (claims["is_admin"] or claims["is_manager"]):
            return {"error": "Only Administrator or Manager can access this resource."}, 403


        return OrganizationService.get_organization_by_id(organization_id)

# GET /api/v1/organizations
class GetOrganizationTree(Resource):
    @jwt_required()
    def get(self):
        claims = get_jwt_identity()
     
        if not claims["is_admin"]:
            return {"error": "Only Administrator can access this resource."}, 403

        return OrganizationService.get_organization_tree()

