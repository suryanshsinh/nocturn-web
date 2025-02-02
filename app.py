from flask import *

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True 

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/detail')
def detail():
    return render_template('detail.html')

@app.route('/history')
def history():
    return render_template('history.html')

@app.route('/send')
def send():
    return render_template('send.html')

@app.route('/recieve')
def recieve():
    return render_template('recieve.html')

if __name__ == '__main__':
    app.run()