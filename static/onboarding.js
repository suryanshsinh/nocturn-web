function checkCookie() {    
    if (document.cookie.indexOf("session") >= 0) {
        fetch('/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getCookie('session')
            }
        }).then(res => {
            if (res.json().message !== null) {
                window.location.href = "/";
            }
        })
    }
}

function getCookie(name) {
    var cookieArr = document.cookie.split(";");
    for (var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

document.querySelectorAll('.spinnable-button').forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('spinnable-black')) {
            spinnerColor = 'black'
        } else {
            spinnerColor = 'white'
        }
        button.innerHTML = `<svg width="24" fill="${spinnerColor}" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_5nOS{transform-origin:center;animation:spinner_sEAn .75s infinite linear}@keyframes spinner_sEAn{100%{transform:rotate(360deg)}}</style><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" class="spinner_5nOS"/></svg>`
        all_spinnable_buttons(disable=true);
        setTimeout(() => {
            if (button.classList.contains('create')) {
                createWallet();
            } else if (button.classList.contains('import')) {
                importWallet();
            } else if (button.classList.contains('final-import')) {
                importWalletFromAPI();
            }
        }, 1000);
    });
})

async function createWallet() {
    const res = fetch('/create').then(res => res.json()).then(data => {
        document.querySelector('.seed-phrase').innerHTML = data.seed;
        document.querySelector('.saved-seed').addEventListener('click', () => {
            setTimeout(() => {
                document.cookie = `session=${data.session}`;
                checkCookie();
            }, 1000);
        });
        change_screen('create-wallet');
    }).catch(err => {
        console.log(err);
    });
    all_spinnable_buttons(disable=false);
}

function importWallet() {
    change_screen('import-wallet');
    all_spinnable_buttons(disable=true);
    private_key_regex = /^(0x)?[a-fA-F0-9]{64}$/
    seed_phrase_12_regex = /^([a-z]+(\s[a-z]+){11})$/
    seed_phrase_24_regex = /^([a-z]+(\s[a-z]+){23})$/
    inputBox = document.getElementById('seed-phrase');
    inputBox.addEventListener('input', () => {
        if (private_key_regex.test(inputBox.value) || seed_phrase_12_regex.test(inputBox.value) || seed_phrase_24_regex.test(inputBox.value)) {
            document.querySelector('.final-import').disabled = false
            inputBox.classList.remove('border-red-500')
            inputBox.classList.add('border-green-500')
        } else {
            document.querySelector('.final-import').disabled = true
            inputBox.classList.add('border-red-500')
            inputBox.classList.remove('border-green-500')
        }
    });
}

function importWalletFromAPI() {
    private_key_regex = /^(0x)?[a-fA-F0-9]{64}$/
    seed_phrase_12_regex = /^([a-z]+(\s[a-z]+){11})$/
    seed_phrase_24_regex = /^([a-z]+(\s[a-z]+){23})$/
    inputBox = document.getElementById('seed-phrase');
    if (private_key_regex.test(inputBox.value)) {
        body = {
            private_key: inputBox.value
        }
    } else if (seed_phrase_12_regex.test(inputBox.value) || seed_phrase_24_regex.test(inputBox.value)) {
        body = {
            seed: inputBox.value
        }
    } else {
        console.log('Invalid input');
        return
    }
    fetch('/import', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(res => res.json()).then(data => {
        if (data.success) {
            document.cookie = `session=${data.session}`;
            checkCookie();
        } else {
            throw new Error(data.message);
        }
    }).catch(err => {
        console.log(err);
        document.querySelector('.final-import').innerHTML = 'Import Wallet'
        all_spinnable_buttons(disable=false);
    });
}

function copySeedPhrase() {
    document.querySelector('.copy-seed-phrase').innerHTML = document.querySelector('.copy-seed-phrase').innerHTML.replace('Copy', 'Copied');
    navigator.clipboard.writeText(document.querySelector('.seed-phrase').innerHTML);
    setTimeout(() => {
        document.querySelector('.copy-seed-phrase').innerHTML = document.querySelector('.copy-seed-phrase').innerHTML.replace('Copied', 'Copy');
    }, 10000)
}

function change_screen(current) {
    listOfClassNames = ['landing', 'create-wallet', 'import-wallet']
    for (className of listOfClassNames) {
        document.querySelector(`.${className}`).classList.remove('flex')
        document.querySelector(`.${className}`).classList.add('hidden')
    }
    document.querySelector(`.${current}`).classList.remove('hidden')
    document.querySelector(`.${current}`).classList.add('flex')
}

function all_spinnable_buttons(disable=true) {
    document.querySelectorAll('.spinnable-button').forEach(button => {
        button.disabled = disable;
    });
}