const cryptoInfo = {
    "Symbol": "POL",
    "Network": "Polygon",
    "Market Cap": "$653.52M",
    "Total Supply": "10B",
    "Circulating Supply": "1.78B",
    "Max Supply": "10B"
};

function renderCryptoInfo() {
    const infoContainer = document.getElementById("crypto-info");

    infoContainer.innerHTML = Object.entries(cryptoInfo).map(([key, value]) => `
        <div class="flex justify-between items-center py-2 ">
            <span class="text-gray-600 px-6 ">${key}</span>
            <span class="font-semibold px-6 text-black">${value}</span>
        </div>
    `).join("");
}



document.addEventListener('DOMContentLoaded', function () {
    renderCryptoInfo();
})
