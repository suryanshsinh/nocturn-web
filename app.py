from flask import *

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True 

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/detail')
def detail():
    return render_template('detail.html')

if __name__ == '__main__':
    app.run()