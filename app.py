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

@app.route('/history')
def history():
    return render_template('history.html')

@app.route('/send')
def send():
    return render_template('send.html')

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
        prices = Nocturn.get_prices(COINMARKETCAP_API_KEY, ['eth', 'bsc', 'pol'])
        eth_balance_usd = eth_balance * prices['eth']
        bsc_balance_usd = bsc_balance * prices['bsc']
        pol_balance_usd = pol_balance * prices['pol']
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

@app.route('/token_balance')
def token_balance():
    try:
        session = request.headers.get('Authorization')
        testnet = bool(eval(request.headers.get('Testnet')))
        coin = request.args.get('coin')
        if coin is None or coin.upper() not in ["ETH", "BSC", "POL"]:
            return {'success': False, 'message': 'Invalid coin parameter'}
        db = Database()
        wallet = Wallet(ETHERSCAN_API_KEY, private_key=db.get_user(session)['message'][2])
        balance = wallet.fetch_balance(coin.lower(), testnet=testnet) / 10**18
        return {'success': True, 'coin': coin.upper(), 'balance': balance}
    except Exception as e:
        return {'success': False, 'message': str(e)}

@app.route('/price')
def price():
    try:
        coin = request.args.get('coin', '').lower()
        if coin not in ['eth', 'bsc', 'pol']:
            return {'success': False, 'message': 'Invalid coin'}
        p = Nocturn.get_prices(COINMARKETCAP_API_KEY, [coin])
        return {'success': True, 'price': p}
    except Exception as e:
        return {'success': False, 'message': str(e)}

@app.route('/preview_transaction', methods=['POST'])
def preview_transaction_route():
    try:
        session = request.headers.get('Authorization')
        testnet = bool(eval(request.headers.get('Testnet')))
        data = request.get_json()
        to_address = data.get('to_address')
        amount = float(data.get('amount'))
        chain = data.get('chain')
        if chain not in ["eth", "bsc", "pol"]:
            raise Exception("Invalid chain.")
        db = Database()
        user = db.get_user(session)
        if not user['success'] or user['message'] is None:
            raise Exception("User not found.")
        private_key = user['message'][2]
        wallet = Wallet(ETHERSCAN_API_KEY, private_key=private_key)
        wei_amount = Nocturn.to_wei(amount)
        preview = wallet.preview_transaction(to_address, wei_amount, chain, testnet=testnet)
        preview['success'] = True
        return preview
    except Exception as e:
        return {'success': False, 'message': str(e)}

@app.route('/send_transaction', methods=['POST'])
def send_transaction():
    try:
        session = request.headers.get('Authorization')
        testnet = bool(eval(request.headers.get('Testnet')))
        data = request.get_json()
        to_address = data.get('to_address')
        amount = float(data.get('amount'))
        chain = data.get('chain')
        db = Database()
        user = db.get_user(session)
        if not user['success'] or not user['message']:
            raise Exception("User not found.")
        if chain not in ["eth", "bsc", "pol"]:
            raise Exception("Invalid chain.")
        private_key = user['message'][2]
        wallet = Wallet(ETHERSCAN_API_KEY, private_key=private_key)
        wei_amount = Nocturn.to_wei(amount)
        tx_result = wallet.send_crypto(to_address, wei_amount, chain, testnet=testnet)
        return {'success': True, 'tx_hash': tx_result['tx_hash'], 'message': 'Transaction sent successfully'}
    except Exception as e:
        return {'success': False, 'message': str(e)}

@app.route('/transaction_history', methods=['GET'])
def transaction_history():
    try:
        session = request.headers.get('Authorization')
        chain = request.args.get('chain', 'eth').lower()
        page = int(request.args.get('page', 1))
        testnet = bool(eval(request.headers.get('Testnet')))
        db = Database()
        user = db.get_user(session)
        if not user['success'] or not user['message']:
            raise Exception("User not found.")
        if chain not in ["eth", "bsc", "pol"]:
            raise Exception("Invalid chain.")
        private_key = user['message'][2]
        wallet = Wallet(ETHERSCAN_API_KEY, private_key=private_key)
        txs = wallet.get_transaction_history(chain, page=page, testnet=testnet)
        address = wallet.address.lower()
        results = []
        for tx in txs:
            color = "red" if tx["isError"] == "1" else (
                "blue" if tx["from"].lower() == address else "green"
            )
            value_eth = str(float(tx["value"]) / 1e18)
            results.append({
                "hash": tx["hash"],
                "from": tx["from"],
                "to": tx["to"],
                "value": value_eth,
                "timeStamp": tx["timeStamp"],
                "color": color
            })
        return {"success": True, "transactions": results}
    except Exception as e:
        return {"success": False, "message": str(e)}

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