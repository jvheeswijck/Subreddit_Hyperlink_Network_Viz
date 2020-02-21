from flask import Flask, render_template, request, send_from_directory, jsonify
from flask_socketio import SocketIO

# Temp
DEBUG = True
app = Flask(__name__)
app.config.from_object(__name__)
app.jinja_env.globals.update(zip=zip)
app.config['SECRET_KEY'] = '7d441f27d441f27567d441f2b6176a'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 1
socketio = SocketIO(app)


@app.route("/", methods=['POST', 'GET'])
def home():
    return render_template('index.html')


if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', use_reloader = True)