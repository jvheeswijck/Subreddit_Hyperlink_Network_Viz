from app import flask_app, routes


if __name__ == '__main__':
    print('Starting server.')
    flask_app.run(host='0.0.0.0', use_reloader = False)

    # socketio.run(app, host='0.0.0.0', use_reloader = True)
    