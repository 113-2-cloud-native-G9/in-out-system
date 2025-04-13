from app.models import db

class GateModel(db.Model):
    __tablename__ = 'Gate'

    gate_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    gate_name = db.Column(db.String(255), nullable=False)
    direction = db.Column(db.String(10), nullable=False)
    gate_type = db.Column(db.String(50), nullable=False)