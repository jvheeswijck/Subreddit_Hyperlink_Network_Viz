from flask import render_template, request, send_from_directory, jsonify, send_file
from io import StringIO

from .data import *
from app import flask_app as app



# link_limit = 100_000
print('Defining routes')

def compute_links(df):
    links = df.groupby(['source', 'target', 'sentiment'])['post_id'].count().reset_index()
    links.columns = 'source target sentiment n'.split()
    links = links.sort_values(by='n', ascending=False)
    return links   

def prepare_csv(df):
    csv_obj = StringIO()
    df.to_csv(csv_obj, index=False)
    csv_ready = csv_obj.getvalue()
    csv_obj.close()
    return csv_ready

###### ROUTES ######

@app.route("/", methods=['POST', 'GET'])
def home():
    first_link = df_all.timestamp.min().ctime()
    last_link = df_all.timestamp.max().ctime()
    return render_template('index.html', first_link=first_link, last_link=last_link)

@app.route('/data')
def serve_data():
    if request.args.get('g') == 'volume_hist':
        df_vol = pd.DataFrame(pos_rows.groupby('bin')['post_id'].count().values, columns=['positive'])
        df_vol['negative'] = neg_rows.groupby('bin')['post_id'].count().values
        return prepare_csv(df_vol)

    if request.args.get('g') == 'sub_points':
        return prepare_csv(df_points)

    if request.args.get('g') == 'tag_graph':
        return jsonify(tag_graph)

    if request.args.get('g') == 'tag_filter':
        return jsonify(tag_filter)   

@app.route("/nodes",methods=["GET","POST"])
def get_nodes():
    links = compute_links(df_all)
    # links_trunc = links[:link_limit]
    links_trunc = links
    sub_set = set()
    sub_set.update(links_trunc.source)
    sub_set.update(links_trunc.target)
    points = df_points[df_points['sub'].map(lambda x: x in sub_set)]
    return prepare_csv(points)

@app.route("/links",methods=["GET"])
def get_links():
    df = df_all
    start = request.args.get('start_date')
    if start:
        start = dt.datetime.fromisoformat(start)
        end = dt.datetime.fromisoformat(request.args.get('end_date'))
        df = df[(df.timestamp >= start) & (df.timestamp <= end)]
    links = compute_links(df)
    return prepare_csv(links.iloc[:])

@app.route("/sentiment_links",methods=["GET","POST"])
def get_sent_links():
    if request.args.get('s') == 'pos':
        links = compute_links(pos_rows)
    elif request.args.get('s') == 'neg':
        links = compute_links(neg_rows)
    return prepare_csv(links.iloc[:])




# @app.route("/sentiment_nodes",methods=["GET","POST"])
# def get_sent_nodes():
#     if request.args.get('s') == 'pos':
#         links = compute_links(pos_rows)
#     elif request.args.get('s') == 'neg':
#         links = compute_links(neg_rows)

#     links_trunc = links[:]
#     sub_set = set()
#     sub_set.update(links_trunc.source)
#     sub_set.update(links_trunc.target)
#     points = df_points[df_points['sub'].map(lambda x: x in sub_set)]
#     return prepare_csv(points)
