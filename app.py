from flask import Flask, render_template, request, send_from_directory, jsonify

# App config.
DEBUG = True
app = Flask(__name__)
app.config.from_object(__name__)
app.jinja_env.globals.update(zip=zip)
app.config['SECRET_KEY'] = '7d441f27d441f27567d441f2b6176a'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 1