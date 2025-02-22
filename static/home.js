const renderCryptoList = async () => {
    cryptoData = []
    response = await fetch('/balance', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getCookie('session'),
            'Testnet': testnet
        }
    }).then(async res => {
        res = await res.json()
        console.log(res)
        if (res.success === false) {
            console.error("Error fetching balance")
        }
        cryptoData = [
            { symbol: "E", name: "ETH", fullName: "Ethereum", bgColor: 'bg-gray-100', textColor: 'text-gray-600', amount: res.eth_balance, value: formatNumber(res.eth_balance_usd) },
            { symbol: "B", name: "BSC", fullName: "Binance Coin", bgColor: 'bg-yellow-100', textColor: 'text-yellow-600', amount: res.bsc_balance, value: formatNumber(res.bsc_balance_usd) },
            { symbol: "P", name: "POL", fullName: "Polygon", bgColor: 'bg-purple-100', textColor: 'text-purple-600', amount: res.pol_balance, value: formatNumber(res.pol_balance_usd) }
        ]
        console.log(res)
    });
    const listContainer = document.getElementById("crypto-list");
    listContainer.innerHTML = cryptoData.map(crypto => `
        <div class="flex hover:bg-gray-200 items-center justify-between p-4 bg-[#F2F2F4] rounded-2xl">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 ${crypto.bgColor} rounded-full flex items-center justify-center">
                    <span class="${crypto.textColor} font-bold">${crypto.symbol}</span>
                </div>
                <div>
                    <p class="font-medium">${crypto.name}</p>
                    <p class="text-sm text-gray-500">${crypto.fullName}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-medium">${crypto.amount} ${crypto.name}</p>
                <p class="text-sm text-gray-500">$${crypto.value}</p>
            </div>
        </div>
    `).join("");
    total_balance = `${cryptoData.reduce((acc, crypto) => acc + crypto.value, 0)}`
    integer = Math.floor(total_balance)
    decimal = Math.floor((total_balance - integer) * 100)
    document.querySelector('.balance').innerHTML = `$${integer}.<span class="text-4xl bold">${decimal}</span>`
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

function formatNumber(num) {
    if (Math.abs(num) < 0.01) {
        return 0.00;
    }
    return Number(num.toFixed(2));
}

document.addEventListener('DOMContentLoaded', function () {
    renderCryptoList();
})
