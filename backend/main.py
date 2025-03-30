from flask import Flask
import os
from flask_restful import Api
from app.routes import initialize_routes
from dotenv import load_dotenv
from app.create_db import init_db
from app.models.accesslog_model import AccessLogModel
from app.models.employee_model import EmployeeModel
from app.models.gate_model import GateModel
from app.models.organization_model import OrganizationModel
from app.models.attendance_model import AttendanceRecordModel # 匯入 db 去綁定在 app
from flask_jwt_extended import JWTManager
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
api = Api(app)
CORS(app)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')  #這是伺服器簽署 JWT token 用的密鑰 到時候前端請求時會用這個解密看看是否合法
jwt = JWTManager(app)

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
    f"{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


db = init_db(app)
initialize_routes(api)

@app.route("/")
def hello():
    return "<h1>THE BACKEND IS RUNNING</h1>"

if __name__ == "__main__":

    app.run(debug=True, host="0.0.0.0", port=8080)