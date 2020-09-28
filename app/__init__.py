import configparser

from flask import Flask
# from flask_socketio import SocketIO

print('Initializing app.')

# Temp
DEBUG = True
flask_app = Flask(__name__)
flask_app.config.from_object(__name__)
flask_app.jinja_env.globals.update(zip=zip)
flask_app.config['SECRET_KEY'] = '7d441f27d441f27567d441f2b6176a'
flask_app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 1

from app import routes


# socketio = SocketIO(app)



