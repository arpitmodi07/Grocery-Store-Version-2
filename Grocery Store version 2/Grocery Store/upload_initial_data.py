from main import app
from application.sec import datastore
from application.models import db, Role
from flask_security import hash_password
from werkzeug.security import generate_password_hash

with app.app_context():
    db.create_all()
    datastore.find_or_create_role(name="admin", description="User is an admin")
    datastore.find_or_create_role(name="mang", description="User is an Manager")
    datastore.find_or_create_role(name="cust", description="User is a Customer")
    db.session.commit()
    if not datastore.find_user(email="admin@email.com"):
        datastore.create_user(email="admin@email.com", password=generate_password_hash("admin"), roles=["admin"])
    if not datastore.find_user(email="mang1@email.com"):
        datastore.create_user(email="mang1@email.com", password=generate_password_hash("mang1"), roles=["mang"], active=False)   
    if not datastore.find_user(email="cust1@email.com"):
        datastore.create_user(email="cust1@email.com", password=generate_password_hash("cust1"), roles=["cust"])
    db.session.commit()