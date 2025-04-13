from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
#from app.models.user_model import db
from app.routes import initialize_routes

def create_app():
    app = Flask(__name__)

    #app.config.from_object("config.Config")

    #db.init_app(app)
    
    return app