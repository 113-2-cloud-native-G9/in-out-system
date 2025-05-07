import pytest
from app import create_app
from app.models import db
import os

@pytest.fixture
def client():
    app = create_app() 
    os.environ['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['SQLALCHEMY_DATABASE_URI']
    

    with app.app_context():
        db.create_all()  

    with app.test_client() as client:
        yield client

    with app.app_context():
        db.session.remove()
        db.drop_all()  