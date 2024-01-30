from celery import shared_task
import os
import flask_excel as excel
# from .mail_service import send_message
from .models import Order, User, Role,Product
from .mail_service import send_message
from jinja2 import Template
from datetime import datetime, timedelta

current_directory = os.path.dirname(os.path.abspath(__file__))


@shared_task(ignore_result=False)
def create_product():
    prod = Product.query.with_entities(
        Product.name, Product.price,Product.unit,Product.discount,Product.stock,Product.desc,
        Product.category_id).all()

    csv_output = excel.make_response_from_query_sets(
        prod, ["name", "price","unit","discount","stock","desc","category_id"], "csv")
    filename = "test.csv"

    with open(filename, 'wb') as f:
        f.write(csv_output.data)

    return filename


# @shared_task(ignore_result=True)
# def daily_reminder(to, subject):
#     # Build the absolute path to the 'test.html' file
#     html_file_path = os.path.join(current_directory, 'test.html')

#     users = User.query.filter(User.roles.any(Role.name == 'cust')).all()
#     for user in users:
#         with open(html_file_path, 'r') as f:
#             template = Template(f.read())
#             send_message(user.email, subject, template.render(email=user.email,active=user.active))
    
#     return "OK"


from datetime import datetime

@shared_task(ignore_result=True)
def daily_reminder_one(to, subject):
    # Build the absolute path to the 'test.html' file
    html_file_path = os.path.join(current_directory, 'test.html')

    # Get the current date
    current_date_str = datetime.now().strftime("%Y-%m-%d")
    current_date = datetime.strptime(current_date_str, "%Y-%m-%d")
    current_date = current_date.date()
    # Get all users with the 'cust' role
    users = User.query.filter(User.roles.any(Role.name == 'cust')).all()

    # Iterate over users
    for user in users:
        # Check if the user has made a purchase today
        if not any(order.date == current_date for order in user.orders):
            # User has not made a purchase today, send the reminder
            with open(html_file_path, 'r') as f:
                template = Template(f.read())
                send_message(user.email, subject, template.render(email=user.email, active=user.active))

    return "OK"


@shared_task(ignore_result=True)
def monthly_reminder(to, subject):
    html_file_path = os.path.join(current_directory, 'monthly_report.html')

    # Get the start and end dates of the last month
    today = datetime.now().date()
    last_month_end = (today.replace(day=1) - timedelta(days=1))
    last_month_start = last_month_end.replace(day=1)

    # Get all users with the 'cust' role
    users = User.query.filter(User.roles.any(Role.name == 'cust')).all()

    # Iterate over users
    for user in users:
        # Calculate the total expenditure for the last month
        total_expenditure = sum(
            order.amount for order in user.orders if last_month_start <= order.date <= last_month_end
        )

        # Send the monthly report
        with open(html_file_path, 'r') as f:
            template = Template(f.read())
            send_message(user.email, subject, template.render(email=user.email, active=user.active, total_expenditure=total_expenditure))

    return "OK"
