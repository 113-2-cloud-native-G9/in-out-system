import pytest
from app import create_app
from app.models import db

@pytest.fixture
def client():
    app = create_app(config_name = 'testing') 
    app.config['TESTING'] = True

    with app.app_context():
        db.create_all()  

    with app.test_client() as client:
        yield client

    print("使用的資料庫 URI：", app.config["SQLALCHEMY_DATABASE_URI"])
    assert 'sqlite' in app.config['SQLALCHEMY_DATABASE_URI'] 

    with app.app_context():
        db.session.remove()
        #db.drop_all()  