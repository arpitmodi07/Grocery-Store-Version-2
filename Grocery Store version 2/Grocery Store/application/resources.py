from datetime import date, datetime
import email
from operator import or_
import uuid
from flask import jsonify,request
from werkzeug.security import generate_password_hash

from flask_restful import Resource, Api, reqparse, marshal_with, fields,marshal
from flask_security import auth_required, roles_required, current_user
from wtforms import PasswordField
from .models import Product,Category, db,User,Role
from .instances import cache
from email_validator import validate_email, EmailNotValidError

# cache.clear()

api = Api(prefix='/api')

product_parser = reqparse.RequestParser()
product_parser.add_argument('name', type=str, help='Name is required should be a string', required=True)
product_parser.add_argument('price', type=int, help='Price is required and should be a integer', required=True)
product_parser.add_argument('unit', type=str, help='Unit is required and should be a string', required=True)
product_parser.add_argument('manufacturing', type=str, help='Date is required and should be a string', required=True)

product_parser.add_argument('discount', type=int, help='Discount is required and should be a integer', required=True)
product_parser.add_argument('stock', type=int, help='Stock is required and should be a string', required=True)
product_parser.add_argument('desc', type=str, help='Desc is required and should be a string', required=True)
product_parser.add_argument('category_id', type=int, help='Category_id is required and should be a string', required=True)

category_parser = reqparse.RequestParser()
category_parser.add_argument('name',type=str,help='Category Name is required and should be a string',required=True)
category_parser.add_argument('id',type=int,help='Creator ID is required and should be a Integer',required=True)
category_parser.add_argument('role',type=str,help='Role is required and should be a String',required=True)

class Creator(fields.Raw):
    def format(self, user):
        return user.email

 

product_fields = {
    'id':   fields.Integer,
    'name':  fields.String,
    'price': fields.Integer,
    'unit':fields.String,
    'manufacturing':fields.String(attribute=lambda x: x.manufacturing.strftime("%Y-%m-%d") if x.manufacturing else None),
    'discount':fields.Integer,
    'stock':fields.Integer,
    'desc':fields.String,
    'category_id':fields.Integer
}


category_fields={
    'id':fields.Integer,
    'name':fields.String,
    'is_approved':fields.Boolean,
    'category_id':fields.Integer
}


class Products(Resource):
    @marshal_with(product_fields)
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self):
        product = Product.query.all() 
        if len(product)>0:
            return product
        else:
            return {"message":"No product found"}
    
    @auth_required("token")
    @roles_required("mang")
    def post(self):
        args = product_parser.parse_args()
        manufacturing_str = args.get("manufacturing")
        manufacturing = (
            datetime.strptime(manufacturing_str, "%Y-%m-%d")
            if manufacturing_str
            else datetime.now()
        )

        if manufacturing is None:
            manufacturing = datetime.now()
        product=Product(name=args.get("name"),desc=args.get("desc"),price=args.get("price"),unit=args.get("unit"),manufacturing=manufacturing,discount=args.get("discount"),stock=args.get("stock"),category_id=args.get("category_id"))
        db.session.add(product)
        print("Product is",product)
        db.session.commit()
        return {"message": "Product Created"}



api.add_resource(Products, '/product')

class Categories(Resource):   #here class name should be different from the Category table name that's why I write Categries instead of Category here.
    @auth_required("token")
    def get(self):
        if "admin" in current_user.roles:
            category=Category.query.all()
        else:
            category=Category.query.filter(or_(Category.is_approved==True,Category.creator==current_user)).all()
        if len(category)>0:
            return marshal(category,category_fields)
        return {"message":"No category found"},404

    @auth_required("token")
    def post(self):
        if "cust" in current_user.roles:
            return {"message":"Unauthorized access"}
        else:

            args = category_parser.parse_args()
            role=args.get('role')
            if role=='mang':
                is_approved=False
            else:
                is_approved=True
            category=Category(name=args.get("name"),is_approved=is_approved,creator_id=args.get("id"))
            db.session.add(category)
            db.session.commit()
            return {"message": "Category has been created successfully"}
    
   

    
api.add_resource(Categories,'/category')



manager_parser = reqparse.RequestParser()
manager_parser.add_argument('name', type=str, help='Name is required should be a string', required=True)
# manager_parser.add_argument('username', type=str, help='Username is required', required=True)
manager_parser.add_argument('email', type=str, help='Email is required', required=True)
manager_parser.add_argument('password', type=str, help='Password is required', required=True)
manager_parser.add_argument('repeat_pass', type=str, help='Repeat Password is required', required=True)


class Manager(Resource):
    def post(self):
        args = manager_parser.parse_args()
        email=args.get("email")
        password=args.get("password")
        repeat_pass = args.get("repeat_pass")
        if not email:
            return ({"message":"email not provided"}),400
        try:
        # Validate email using the email_validator library
            v = validate_email(email)
            email = v["email"]
        except EmailNotValidError as e:
            return {"message": str(e)}, 400
        user = User.query.filter_by(email=email).first()
        if user:
            return ({"message":"email already exists"}),400
        if not password:
            return ({"message":"Password does not provide"}),400
        if not repeat_pass:
            return ({"message":"Repeat pass section is empty"}),400
        if password!=repeat_pass:
            return({"message":"Password does not match"}),400
        
        manager=User(username=args.get("name"),email=args.get("email"),password=generate_password_hash(args.get("password")),active=False, fs_uniquifier=uuid.uuid4().hex)
        db.session.add(manager)
        db.session.commit()

        mang_role = Role.query.filter_by(name='mang').first()
        if mang_role:
            manager.roles.append(mang_role)
            db.session.commit()
        return jsonify({"message": "Manager has been created successfully"})


api.add_resource(Manager,'/manager')


user_parser = reqparse.RequestParser()
user_parser.add_argument('name', type=str, help='Name is required should be a string', required=True)
# manager_parser.add_argument('username', type=str, help='Username is required', required=True)
user_parser.add_argument('email', type=str, help='Email is required', required=True)
user_parser.add_argument('password', type=str, help='Password is required', required=True)
user_parser.add_argument('repeat_pass', type=str, help='Repeat Password is required', required=True)



class Users(Resource):
    def post(self):
        args = user_parser.parse_args()
        email=args.get("email")
        password=args.get("password")
        repeat_pass = args.get("repeat_pass")
        if not email:
            return ({"message":"email not provided"}),400
        
        if not email:
            return ({"message":"email not provided"}),400
        try:
            v = validate_email(email)
            email = v["email"]
        except EmailNotValidError as e:
            return {"message": str(e)}, 400
        user = User.query.filter_by(email=email).first()
        if user:
            return ({"message":"email already exists"}),400
        if not password:
            return ({"message":"Password does not provide"}),400
        if not repeat_pass:
            return ({"message":"Repeat pass section is empty"}),400
        if password!=repeat_pass:
            return({"message":"Password does not match"}),400
        
        user=User(username=args.get("name"),email=args.get("email"),password=generate_password_hash(args.get("password")),active=True, fs_uniquifier=uuid.uuid4().hex)
        db.session.add(user)
        db.session.commit()

        user_role = Role.query.filter_by(name='cust').first()
        if user_role:
            user.roles.append(user_role)
            db.session.commit()
        return jsonify({"message": "User has been created successfully"})


api.add_resource(Users,'/user')


# with app.app_context():
    # db.create_all()