from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_cors import CORS
from app.routes import initialize_routes
from flask_jwt_extended import JWTManager
from app.create_db import init_db
db = SQLAlchemy()
from dotenv import load_dotenv

def create_app(config_name="development"):
    app = Flask(__name__)
    load_dotenv()

    if config_name == "development":
        app.config.from_object("config.DevelopmentConfig")
    elif config_name == "testing":
        app.config.from_object("config.TestingConfig")
    elif config_name == "production":
        app.config.from_object("config.ProductionConfig")
    else:
        raise ValueError(f"Unknown config name: {config_name}")

    init_db(app)
    api = Api(app)
    CORS(app)
    jwt = JWTManager(app)
    initialize_routes(api)

    @app.route("/")
    def hello():
        return "<h1>THE BACKEND IS RUNNING</h1>"
    
    return app