const cryptoData = [
    { symbol: "₿", name: "BTC", fullName: "Bitcoin", amount: "0.01912343", value: "$10,234.23", bgColor: "bg-orange-100", textColor: "text-orange-600" },
    { symbol: "Ł", name: "LTC", fullName: "Litecoin", amount: "20,000.85", value: "$10,234.23", bgColor: "bg-gray-100", textColor: "text-gray-600" },
    { symbol: "₿", name: "BTC", fullName: "Bitcoin", amount: "0.01912343", value: "$10,234.23", bgColor: "bg-orange-100", textColor: "text-orange-600" },
    { symbol: "Ł", name: "LTC", fullName: "Litecoin", amount: "20,000.85", value: "$10,234.23", bgColor: "bg-gray-100", textColor: "text-gray-600" },
    { symbol: "T", name: "TRX", fullName: "Tron", amount: "1,580.8565", value: "$10,234.23", bgColor: "bg-red-100", textColor: "text-red-600" },
    { symbol: "₿", name: "BTC", fullName: "Bitcoin", amount: "0.01912343", value: "$10,234.23", bgColor: "bg-orange-100", textColor: "text-orange-600" },
    { symbol: "Ł", name: "LTC", fullName: "Litecoin", amount: "20,000.85", value: "$10,234.23", bgColor: "bg-gray-100", textColor: "text-gray-600" },
    { symbol: "T", name: "TRX", fullName: "Tron", amount: "1,580.8565", value: "$10,234.23", bgColor: "bg-red-100", textColor: "text-red-600" }
];


const renderCryptoList = () => {
    const listContainer = document.getElementById("crypto-list");
    listContainer.innerHTML = cryptoData.map(crypto => `
        <div class="flex hover:bg-gray-200 cursor-pointer items-center justify-between p-4 bg-[#F2F2F4] rounded-2xl" onclick="detail()">
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
                <p class="font-medium">${crypto.amount}</p>
                <p class="text-sm text-gray-500">${crypto.value}</p>
            </div>
        </div>
    `).join("");
}

const detail = () => {
    window.location.href = '/detail';
}

document.addEventListener('DOMContentLoaded', function () {
    renderCryptoList();
})

