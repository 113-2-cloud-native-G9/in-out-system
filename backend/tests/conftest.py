import pytest
from app import create_app
from app.models import db

@pytest.fixture
def client():
    app = create_app() 
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()  

    with app.test_client() as client:
        yield client

    with app.app_context():
        db.session.remove()
        db.drop_all()  