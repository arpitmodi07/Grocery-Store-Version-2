from datetime import datetime
from decimal import Decimal
import json
from flask import current_app as app, jsonify, request, render_template, session, send_file
from flask_security import auth_required, roles_required
from flask_restful import marshal_with, fields, marshal
from .models import User, db
from werkzeug.security import check_password_hash
from .sec import datastore
from .models import Category,Role,RolesUsers,Product,Order
from .tasks import create_product
import flask_excel as excel
from celery.result import AsyncResult

# In this file we will write all the end points which are not created by flask-restful.

@app.get('/')
def home():
    return render_template("index.html")


@app.get('/admin')
@auth_required("token")
@roles_required("admin")
def admin():
    return "Hello Admin"

@app.get('/activate/mang/<int:mang_id>')
@auth_required("token")
@roles_required("admin")
def activate_manager(mang_id):
    manager = User.query.get(mang_id)
    if not manager or "mang" not in manager.roles:
        return jsonify({"message":"Manager not found or user is not an manager"}), 404
    
    if manager.active==True:
        return jsonify({"message":"Manager is already activated"})
    else:
        manager.active=True
        db.session.commit()
    return jsonify({"message":"Manager Activated"})


@app.get('/remove/mang/<int:mang_id>')
@auth_required("token")
@roles_required("admin")
def remove_manager(mang_id):
    manager = User.query.get(mang_id)
    if not manager or "mang" not in manager.roles:
        return jsonify({"message":"Manager not found or user is not an manager"}), 404
    db.session.delete(manager)
    db.session.commit()
    return jsonify({"message":"Manager deleted successfully"})



@app.post('/user-login')
def user_login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "Email not provided"}), 400
    
    
    user = datastore.find_user(email=email)

    if not user:
        return jsonify({"message": "User Not Found"}), 404

    if check_password_hash(user.password, data.get("password")):
        return jsonify({"token": user.get_auth_token(),"id":user.id, "email": user.email, "role": user.roles[0].name})
    else:
        return jsonify({"message": "Wrong Password"}), 400


user_fields={
    "id":fields.Integer,
    "email":fields.String,
    "username":fields.String,
    "active":fields.Boolean
}

@app.get('/users')
@auth_required("token")
@roles_required("admin")
def all_users():
    users = User.query.join(RolesUsers).join(Role).filter(Role.name == "mang").all()
    if len(users)==0:
        return jsonify({"message":"No user found"}),404
    return marshal(users,user_fields)

@app.get('/category/approve/<int:id>')
@auth_required("token")
@roles_required("admin")
def category(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({"message":"Category not found"}),404
    
    category.is_approved=True
    db.session.commit()
    return {"message":"Category has been approved"}


@app.get('/category/remove/<int:id>')
@auth_required("token")
@roles_required("admin")
def remove_category(id):
    category = Category.query.get(id)
    products = Product.query.filter_by(category_id=id).all()
    
    if not category:
        return jsonify({"message":"Category not found"}),404
    
    for product in products:
        db.session.delete(product)
    db.session.delete(category)
    db.session.commit()
    return {"message":"Category and products related to this category has been deleted successfully"}


product_detail={
    'id':fields.Integer,
    'name':fields.String,
    'price':fields.Integer,
    'unit':fields.String,
    'discount':fields.Integer,
    'stock':fields.Integer,
    'desc':fields.String,
    'category_id':fields.Integer
}

@app.get('/product/details/<int:id>')
# @auth_required("token")
def product_details(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"message":"No product found"}),404
    return marshal(product,product_detail)



@app.post('/update/product/<int:id>')
@auth_required("token")
@roles_required("mang")
def update_product(id):
    product=Product.query.get(id)
    data = request.get_json()
    if not product:
        return jsonify({"message":"No product found"}),404
    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        product.price = data['price']
    if 'unit' in data:
        product.unit = data['unit']
    if 'manufacturing' in data:
        product.manufacturing = data['manufacturing']
    if 'discount' in data:
        product.discount = data['discount']
    if 'stock' in data:
        product.stock = data['stock']
    if 'desc' in data:
        product.desc = data['desc']
    if 'category_id' in data:
        product.category_id = data['category_id']

    try:
        db.session.commit()
        return jsonify({"message": "Product updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Error updating product: {str(e)}"}), 500
    
    


@app.get('/remove/product/<int:id>')
@auth_required("token")
@roles_required("mang")
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"message":"No Product Found"}),404
    db.session.delete(product)
    db.session.commit()
    return {"message":"Product Deleted successfully"}



@app.post('/update/category/<int:id>')
@auth_required("token")
def update_category(id):
    category = Category.query.get(id)
    data = request.get_json()
    if not category:
        return jsonify({"message":"No Category found"}),404
    category.name = data['name']
    db.session.commit()
    return {"message":"Category Update Successfully"}
    




    



def MergeDicts(dict1, dict2):
    if isinstance(dict1, list) and isinstance(dict2, list):
        return dict1 + dict2
    if isinstance(dict1, dict) and isinstance(dict2, dict):
        return dict(list((str(k), v) for k, v in dict1.items()) + list((str(k), v) for k, v in dict2.items()))



@app.post('/addcart/<int:id>')
def AddCart(id):
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        print(user_id)
        
        product = Product.query.filter_by(id=id).first()
        DictItems = {id: {'id':product.id,'name': product.name, 'price': product.price, 'discount': product.discount,'stock':product.stock, 'quantity': 1}}

        user_cart_key = f"Shoppingcart_{user_id}"
       
        if user_cart_key in session:
            if str(id) in session[user_cart_key]:
                for key, item in session[user_cart_key].items():
                    if int(key) == id:
                        session.modified = True
                        item['quantity'] += 1
                        return {"message": "Product quantity updated in cart"}
            else:
                session[user_cart_key] = MergeDicts(session[user_cart_key], DictItems)
                return {"message": "Product added to cart"}
        else:
            session[user_cart_key] = DictItems
            return {"message": "Product added to cart"}

    except Exception as e:
        print(e)
        # Handle exceptions if needed

    return {"message": "Request processed successfully"}



    



# Define a structure for a single product in the shopping cart
product_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'price': fields.Float,
    'quantity': fields.Integer,
    'discount': fields.Float,
    'stock': fields.Integer,
}


# Define the structure for the entire shopping cart
shopping_cart_fields = {
    'products': fields.List(fields.Nested(product_fields)),
}


@app.get('/shopping-cart/<int:user_id>')
def get_shopping_cart(user_id):
    try:
        # Fetch shopping cart data based on the user_id
        user_cart_key = f"Shoppingcart_{user_id}"
        shopping_cart = session.get(user_cart_key, {})
        products = list(shopping_cart.values())

        # Print products for debugging
        print("Products:", products)

        # Use marshal to serialize the data according to the defined structure
        result = {'products': marshal(products, product_fields)}
        return jsonify(result)
    except Exception as e:
        print(e)
        return jsonify({'error': 'Internal Server Error'}), 500



# Add this route to update the quantity in the session
@app.post('/updatecart/<int:id>')
def update_cart(id):
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        product = Product.query.filter_by(id=id).first()
        quantity = data.get('quantity')

        if not product or not quantity:
            return {"message": "Invalid request"}, 400

        user_cart_key = f"Shoppingcart_{user_id}"

        if int(quantity)>int(product.stock):
            return {"message":f'Quantity must be less than {product.stock} units'}
        if user_cart_key in session:
            if str(id) in session[user_cart_key]:
                session[user_cart_key][str(id)]['quantity'] = quantity
                session.modified = True
                return {"message": "Product quantity updated in cart"}
        
        return {"message": "Product not found in the cart"}, 404

    except Exception as e:
        print(e)
        return {"message": "Something went wrong"}, 500



@app.post('/deleteitem/<int:id>')
def deleteitem(id):
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        print("User id is", user_id)
        session.modified = True
        user_cart_key = f"Shoppingcart_{user_id}"

        if user_cart_key in session:
            for key, item in session[user_cart_key].items():
                if int(key) == id:
                    session[user_cart_key].pop(key, None)
                    return {"message": "Item deleted successfully"}

    except Exception as e:
        print(e)
        return {"message": "Something went wrong"}

    return {"message": "Item not found or something went wrong"}



@app.post('/ordernow')
def order_now():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        grand_total = data.get('grand_total')
        grand_total = int(grand_total)
        print(type(grand_total))
        user_cart_key = f"Shoppingcart_{user_id}"
        current_date_str = datetime.now().strftime("%d-%m-%Y")
        current_date = datetime.strptime(current_date_str, "%d-%m-%Y")
        current_date = current_date.date()
        orders = Order.query.all()
        
        for order in orders:
            print(type(order.date),order.date)
            print(type(current_date),current_date)
            # Compare the date attribute of each order with current_date
            if order.date == current_date:
                print("yes")
            else:
                print("No")
        print(type(current_date))
        products = data.get('products')
        print("date is",current_date)
        
        print("User idis",user_id)
        print("total is ",grand_total)
        print(products)
        order = Order(user_id=user_id,amount=grand_total,date=current_date)
        print(order)
        db.session.add(order)
        
        for product in products:
            database = Product.query.filter_by(id=product['id']).first()
            database.stock= database.stock-product['quantity']
            db.session.commit()
        
       
        
        db.session.commit()
        session.pop(user_cart_key,None)
        return jsonify({"message":"Thank You for Ordering"}),200
        
    except Exception as e:
        return jsonify({"message":"Something went wrong here"}),400

        

@app.post('/clearcart')
def clear_cart():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        user_cart_key = f"Shoppingcart_{user_id}"
        session.pop(user_cart_key,None)
        return jsonify({"message":"Cart has been cleard"}),200
    except Exception as e:
        return jsonify({"message":"Something went wrong "}),400
    

@app.post('/result')
def result():
    # search_query = request.args.get('q')
    data = request.get_json()
    search_query = data.get('query')
    category_id = Category.query.filter(Category.name.ilike(f'%{search_query}%')).first()
    print(category_id)
    category_id = category_id.id if category_id else -1
    print(category_id)
    products = Product.query.filter(
        (Product.name.ilike(f'%{search_query}%')) |
        (Product.price.ilike(f'%{search_query}%')) |
        (Product.manufacturing.ilike(f'%{search_query}%')) |
        (Product.category_id == category_id)
    ).all()
    print("Products are",products)
    result = {'products': marshal(products, product_fields)}
    return jsonify(result)


 


@app.get('/download-csv')
def download_csv():
    task = create_product.delay()
    return jsonify({"task-id":task.id})


@app.get('/get-csv/<task_id>')
def get_csv(task_id):
    res = AsyncResult(task_id)
    if res.ready():
        filename = res.result
        return send_file(filename, as_attachment=True)
    else:
        return jsonify({"message": "Task Pending"}), 404