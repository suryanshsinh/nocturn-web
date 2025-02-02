const cryptoInfo = {
    "Amount": "0.00001 SOL",
    "Symbol": "₿",
    "Date": "Jan 23, 2025 at 5:00 pm",
    "Status": "Succeeded",
    "To": "Iron(Exkj...zjx)",
    "Network": "Solana",
    "Network Fee": "-<0.00001 SOL",
    "Sent": false,
};

const avoidableKeys = ["receive", "Sent", "Amount", "Symbol"];

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case "succeeded":
            return "text-green-500";
        case "pending":
            return "text-gray-400";
        default:
            return "text-red-500";
    }
}

function renderCryptoInfo() {
    const infoContainer = document.getElementById("crypto-info");
    if (!infoContainer) return;

    infoContainer.innerHTML = Object.entries(cryptoInfo)
        .filter(([key]) => !avoidableKeys.includes(key))
        .map(([key, value]) => {
            const valueClass = key === "Status" ? getStatusColor(value) : "text-black";

            return `<div class="flex justify-between items-center py-2">
                <span class="text-gray-600 px-6">${key}</span>
                <span class="font-semibold px-6 ${valueClass}">${value}</span>
            </div>`;
        })
        .join('');

    infoContainer.innerHTML += `<div class="flex justify-center items-center py-3 pb-2">
    <span class="text-[#1C1E32] px-6 hover:text-gray-500 cursor-pointer">View On Solscan</span>
    </div>`;

    console.log(cryptoInfo.Sent);

    document.querySelector("#history-main-info").innerHTML = `
    <h2 class="text-4xl font-semibold">${cryptoInfo.Sent ? "Sent" :
            "Received"} </h2>
        <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <span class="text-orange-600 font-bold text-4xl">${cryptoInfo.Symbol}</span>
        </div>
    <h1 class="text-4xl font-semibold" >${cryptoInfo.Sent ? "-" :
            "+"} ${cryptoInfo.Amount}</h1>`
}

document.addEventListener("DOMContentLoaded", renderCryptoInfo);
