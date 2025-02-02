const historyCard = (crypto, cardContainer) => {
    cardContainer.innerHTML += ` <div class="flex hover:bg-gray-200 cursor-pointer items-center justify-between p-4 bg-[#F2F2F4] rounded-2xl" onclick="window.location.href='/history-detail'"> 
    <div class="flex items center space-x-2">
        <div class="w-12 h-12 bg-[#FEE2E2] rounded-full flex justify-center items-center">
            <i class="fas fa-exchange-alt text-xl text-[#F87171]"></i>
        </div>
        <div>
            <h2 class="font-semibold">Sent ${crypto.name}</h2>
            <p class="text-sm text-[#9CA3AF]">${crypto.amount}</p>
        </div>

    </div>
    <div>
        <p class="text-sm text-[#9CA3AF]">${crypto.days} days ago</p>
    </div>
</div>`;
}

const cryptoData = [
    { days: "2", name: "BTC", fullName: "Bitcoin", amount: "0.01912343", value: "$10,234.23" },
    { days: "7", name: "ETH", fullName: "Ethereum", amount: "1.45367892", value: "$3,267.89" },
    { days: "3", name: "SOL", fullName: "Solana", amount: "5.67823412", value: "$740.12" },
    { days: "9", name: "XRP", fullName: "Ripple", amount: "234.569872", value: "$130.45" },
];


const renderCryptoList = () => {
    const listContainer = document.getElementById("crypto-list");
    console.log(cryptoData.length);
    if (cryptoData.length !== 0) {
        cryptoData.map(crypto => historyCard(crypto, listContainer));
    } else {
        listContainer.innerHTML = `<p class="text-xl text-gray-600 text-center font-semibold">No Transactions yet</p>`;
    }
}


document.addEventListener('DOMContentLoaded', function () {
    renderCryptoList();
})
