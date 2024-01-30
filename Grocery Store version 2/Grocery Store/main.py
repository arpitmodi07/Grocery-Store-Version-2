from flask import Flask
from flask_security import SQLAlchemyUserDatastore, Security
from flask_cors import CORS
from application.models import db, User, Role
from config import DevelopmentConfig
from application.resources import api
from application.worker import celery_init_app
import flask_excel as excel
# import crontab
from celery.schedules import crontab
# from application.tasks import daily_reminder
from application.tasks import daily_reminder_one, monthly_reminder
from application.instances import cache




def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    excel.init_excel(app)
    CORS(app)
    datastore = SQLAlchemyUserDatastore(db,User, Role)
    app.security = Security(app, datastore)
    cache.init_app(app)
    with app.app_context():
        import application.views

    return app, datastore

app, datastore = create_app()

celery_app = celery_init_app(app)

@celery_app.on_after_configure.connect
def send_email(sender, **kwargs):
    sender.add_periodic_task(
        # crontab(hour=19, minute=30),
        10,
        daily_reminder_one.s("modiarpit2001@gmail.com",'Daily Reminder'),
    )
    sender.add_periodic_task(
        # crontab(day_of_month=1, hour=0, minute=0),  # Run monthly reminder on the first day of the month
        10,
        monthly_reminder.s("modiarpit2001@gmail.com", 'Monthly Reminder'),
    )

if __name__ == '__main__':
    app.run(debug=True)