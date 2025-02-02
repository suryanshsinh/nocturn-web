from flask import *
from nocturn import Nocturn, Wallet
from db import Database
import env
import qrcode
import base64
from io import BytesIO

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
ETHERSCAN_API_KEY = env.ETHERSCAN_API_KEY
COINMARKETCAP_API_KEY = env.COINMARKETCAP_API_KEY

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

@app.route('/balance')
def balance():
    try:
        session = request.headers.get('Authorization')
        testnet = bool(eval(request.headers.get('Testnet')))
        db = Database()
        wallet = Wallet(ETHERSCAN_API_KEY, private_key=db.get_user(session)['message'][2])
        eth_balance = wallet.fetch_balance('eth', testnet=testnet) / 10**18
        bsc_balance = wallet.fetch_balance('bsc', testnet=testnet) / 10**18
        pol_balance = wallet.fetch_balance('pol', testnet=testnet) / 10**18
        eth_balance_usd = Nocturn.to_currency(COINMARKETCAP_API_KEY, eth_balance, 'eth')
        bsc_balance_usd = Nocturn.to_currency(COINMARKETCAP_API_KEY, bsc_balance, 'bsc')
        pol_balance_usd = Nocturn.to_currency(COINMARKETCAP_API_KEY, pol_balance, 'pol')
        return {
            'address': wallet.address,
            'testnet': testnet,
            'success': True,
            'eth_balance': eth_balance,
            'bsc_balance': bsc_balance,
            'pol_balance': pol_balance,
            'eth_balance_usd': eth_balance_usd,
            'bsc_balance_usd': bsc_balance_usd,
            'pol_balance_usd': pol_balance_usd
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'{e}'
        }

@app.route('/receive', methods=['GET', 'POST'])
def receive():
    if request.method == 'GET':
        return render_template('receive.html')
    try:
        session = request.headers.get('Authorization')
        db = Database()
        wallet = Wallet(ETHERSCAN_API_KEY, private_key=db.get_user(session)['message'][2])
        qr_base64 = generate_qr_base64(wallet.address)
        return {
            'success': True,
            'address': wallet.address,
            'qr': qr_base64
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'{e}'
        }


def generate_qr_base64(data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=7,
        border=1,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill="black", back_color="white")
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_base64

if __name__ == '__main__':
    app.run(debug=True)