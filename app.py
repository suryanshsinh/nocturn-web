from flask import *
from nocturn import Nocturn, Wallet
from db import Database
import env

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
ETHERSCAN_API_KEY = env.ETHERSCAN_API_KEY

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

@app.route('/receive')
def receive():
    return render_template('receive.html')

@app.route('/history-detail')
def history_detail():
    return render_template('historyDetail.html')

@app.route('/onboarding')
def onboarding():
    return render_template('onboarding.html')

@app.route('/me')
def me():
    try:
        session = request.headers.get('Authorization')
        db = Database()
        wallet = Wallet(ETHERSCAN_API_KEY, private_key=db.get_user(session)['message'][2])
        return {
            'success': True,
            'address': wallet.address,
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'{e}'
        }

@app.route('/import', methods=['POST'])
def import_wallet():
    try:
        if 'private_key' in request.get_json():
            private_key = request.get_json()['private_key']
            wallet = Wallet(ETHERSCAN_API_KEY, private_key=private_key)
        elif 'seed' in request.get_json():
            seed = request.get_json()['seed']
            wallet = Wallet(ETHERSCAN_API_KEY, mnemonic_phrase=seed)
        else:
            raise Exception('Invalid request')
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }
    db = Database()
    res = db.insert_user(wallet.private_key, seed=wallet.mnemonic)
    if res['success']:
        return {
            'success': True,
            'message': 'Wallet imported successfully',
            'session': res['session']
        }
    return {
        'success': False,
        'message': res['message']
    }

@app.route('/create')
def create_wallet():
    wallet = Wallet(ETHERSCAN_API_KEY)
    db = Database()
    res = db.insert_user(wallet.private_key, seed=wallet.mnemonic)
    if res['success']:
        return {
            'success': True,
            'message': 'Wallet created successfully',
            'session': res['session'],
            'private_key': wallet.private_key,
            'seed': wallet.mnemonic
        }
    return {
        'success': False,
        'message': res['message']
    }

if __name__ == '__main__':
    app.run(debug=True)