from io import StringIO
from flask import Flask, render_template, request, send_from_directory, jsonify
from flask_socketio import SocketIO, emit, send


# from . import data

# Temp
DEBUG = True
app = Flask(__name__)
app.config.from_object(__name__)
app.jinja_env.globals.update(zip=zip)
app.config['SECRET_KEY'] = '7d441f27d441f27567d441f2b6176a'
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 1
socketio = SocketIO(app)

# Move this to data module -> Figure out packages and imports
import pandas as pd
import numpy as np
import datetime as dt

df_title = pd.read_csv('../data/soc-redditHyperlinks-title.tsv', sep='\t')
df_body = pd.read_csv('../data/soc-redditHyperlinks-body.tsv', sep='\t')
df_embeddings = pd.read_csv('../data/web-redditEmbeddings-subreddits.csv', header=None)
df_title.TIMESTAMP = pd.to_datetime(df_title.TIMESTAMP)
df_body.TIMESTAMP = pd.to_datetime(df_body.TIMESTAMP)
df_all = pd.concat([df_title, df_body])
df_embeddings.rename({0:'sub'}, axis=1, inplace=True)
df_current = df_all

df_points = pd.read_csv('../data/projections/perp_10_2500subs.csv')

def prepare_csv(df):
    csv_obj = StringIO()
    df.to_csv(csv_obj, index=False)
    csv_ready = csv_obj.getvalue()
    csv_obj.close()
    return csv_ready


@app.route("/", methods=['POST', 'GET'])
def home():
    first_link = df_all.TIMESTAMP.min().ctime()
    last_link = df_all.TIMESTAMP.max().ctime()
    return render_template('index.html', first_link=first_link, last_link=last_link)

@app.route('/data')
def serve_data():
    if request.args.get('g') == 'volume_hist':
        return prepare_csv(df_current)

    if request.args.get('g') == 'sub_points':
        return prepare_csv(df_points)


@socketio.on('date_change')
def on_date_update(dates):
    df_current = df_all
    emit('update_graph', {'one':'msg'})


if __name__ == "__main__":
    socketio.run(app, host='0.0.0.0', use_reloader = True)