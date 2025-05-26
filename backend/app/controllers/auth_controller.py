from flask_restful import Resource
from app.services.auth_service import AuthService
from flask import request, jsonify
import logging

logger = logging.getLogger(__name__)

# POST /api/v1/auth/login
class Auth_Login(Resource):
    def post(self):
        data = request.get_json()
        if not data:
            logger.warning("Login attempt with no data.")
            return {"error": "No data received"}, 400

        employee_id = data.get("employee_id")
        hashed_password = data.get("hashed_password")

        if not employee_id:
            logger.warning("Login attempt missing employee_id.")
            return {"error": "No employee_id provided"}, 400
        if not hashed_password:
            logger.warning("Login attempt missing hashed_password.")
            return {"error": "No hashed_password provided"}, 400

        logger.info(f"Login attempt from employee_id: {employee_id}")
        response_data, status_code = AuthService.auth_login_by_employee_id_hashed_password(
            employee_id, hashed_password
        )

        logger.info(f"Login result for {employee_id}: {status_code}")
        return response_data, status_code

