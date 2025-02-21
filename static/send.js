const currencySelect = document.getElementById("currencySelect");
const amountInput = document.getElementById("amountInput");
const availableBalance = document.getElementById("availableBalance");
const maxButton = document.getElementById("maxButton");
const usdEstimation = document.getElementById("usdEstimation");
const proceedButton = document.getElementById("proceedButton");
const transactionModal = document.getElementById("transactionModal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");
const modalConfirm = document.getElementById("modalConfirm");

function showToast(message, err=true) {
  const toast = document.createElement("div");
  toast.className = `absolute bottom-24 max-w-[90%] w-full left-1/2 transform -translate-x-1/2 text-white py-2 px-4 rounded shadow-lg z-50 ${err ? "bg-red-500" : "bg-green-500"}`;
  toast.innerText = message;
  document.body.querySelector('body>div').appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
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

function shortAddress(addr) {
  if (!addr.startsWith("0x") || addr.length < 10) return addr;
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

async function updateBalance() {
  availableBalance.innerHTML = `Available - <div class="skeleton-loading absolute inset-0 bg-gray-400 animate-pulse"></div>`;
  try {
    const coin = currencySelect.value;
    const res = await fetch(`/token_balance?coin=${coin}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getCookie("session"),
        "Testnet": testnet
      }
    });
    const data = await res.json();
    if (data.success) {
      availableBalance.innerText = `Available - ${data.balance} ${coin}`;
    } else {
      availableBalance.innerText = `Available - 0`;
    }
  } catch (err) {
    availableBalance.innerText = `Available - 0`;
  }
}

async function updateUsdEstimation() {
  usdEstimation.innerHTML = `<div class="skeleton-loading absolute inset-0 bg-gray-400 animate-pulse"></div>`;
  try {
    const coin = currencySelect.value.toLowerCase();
    const amountVal = parseFloat(amountInput.value) || 0;
    if (amountVal <= 0) {
      usdEstimation.innerText = "~$0.00";
      return;
    }
    const res = await fetch(`/price?coin=${coin}`, { method: "GET" });
    const data = await res.json();
    if (data.success) {
      const usdValue = amountVal * data.price[coin];
      usdEstimation.innerText = `~$${usdValue.toFixed(2)}`;
    } else {
      usdEstimation.innerText = "~$0.00";
    }
  } catch (err) {
    usdEstimation.innerText = "~$0.00";
  }
}

let debounceTimer;
document.addEventListener("DOMContentLoaded", function() {
  currencySelect.addEventListener("change", () => {
    updateBalance();
    updateUsdEstimation();
  });
  amountInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateUsdEstimation();
    }, 500);
  });
  maxButton.addEventListener("click", async () => {
    availableBalance.innerHTML = `Available - <div class="skeleton-loading absolute inset-0 bg-gray-400 animate-pulse"></div>`;
    try {
      const coin = currencySelect.value;
      const res = await fetch(`/token_balance?coin=${coin}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": getCookie("session"),
          "Testnet": testnet
        }
      });
      const data = await res.json();
      if (data.success) {
        amountInput.value = data.balance;
        updateUsdEstimation();
      }
    } catch(err) {}
    updateBalance();
  });
  updateBalance();
  updateUsdEstimation();
});

proceedButton.addEventListener("click", async () => {
  const recipient = document.getElementById("recipientInput").value.trim();
  const amountVal = parseFloat(amountInput.value);
  const coin = currencySelect.value;
  if (!recipient || isNaN(amountVal) || amountVal <= 0) {
    showToast("Please enter a valid recipient address and amount.");
    return;
  }
  const payload = { to_address: recipient, amount: amountVal, chain: coin.toLowerCase() };
  modalContent.innerHTML = `<div class="skeleton-loading absolute inset-0 bg-gray-400 animate-pulse"></div>`;
  try {
    proceedButton.innerHTML = `<svg width="24" fill="white" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_5nOS{transform-origin:center;animation:spinner_sEAn .75s infinite linear}@keyframes spinner_sEAn{100%{transform:rotate(360deg)}}</style><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" class="spinner_5nOS"/></svg>`
    const res = await fetch("/preview_transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getCookie("session"),
        "Testnet": testnet
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!data.success) {
      showToast(data.message);
      return;
    }
    if (!data.can_proceed) {
      showToast("Insufficient funds");
      return;
    }
    const priceRes = await fetch(`/price?coin=${coin.toLowerCase()}`, { method: "GET" });
    const priceData = await priceRes.json();
    if (!priceData.success) {
      showToast("Error fetching price.");
      return;
    }
    proceedButton.innerHTML = "Proceed";
    const chainPrice = priceData.price[coin.toLowerCase()];
    const fromWei = (val) => parseFloat(val) / 1e18;
    const chainAmount = fromWei(data.amount_to_send);
    const chainGasFee = fromWei(data.estimated_gas_fee);
    const chainTotalDeductions = chainGasFee;
    const chainAmountSending = fromWei(data.amount_sending);
    const amountUsd = chainAmount * chainPrice;
    const feeUsd = chainGasFee * chainPrice;
    const totalDeductionsUsd = chainTotalDeductions * chainPrice;
    const sendingUsd = chainAmountSending * chainPrice;
    const senderShort = shortAddress(data.sender);
    const recipientShort = shortAddress(data.recipient);
    const previewHtml = `
      <div class="px-4 py-2 flex justify-between items-center">
        <span class="text-gray-500">Sender</span>
        <span class="text-black">${senderShort}</span>
      </div>
      <div class="px-4 py-2 flex justify-between items-center bg-gray-100">
        <span class="text-gray-500">Recipient</span>
        <span class="text-black">${recipientShort}</span>
      </div>
      <div class="px-4 py-2 flex justify-between items-center">
        <span class="text-gray-500">Amount</span>
        <span class="text-black">${chainAmount.toFixed(6)} ${coin} <span class="text-gray-500">($${amountUsd.toFixed(2)})</span></span>
      </div>
      <div class="px-4 py-2 flex justify-between items-center bg-gray-100">
        <span class="text-gray-500">Estimated Gas Fee</span>
        <span class="text-black">${chainGasFee.toFixed(6)} ${coin} <span class="text-gray-500">($${feeUsd.toFixed(2)})</span></span>
      </div>
      <div class="px-4 py-2 flex justify-between items-center">
        <span class="text-gray-500">Total Deductions</span>
        <span class="text-black">${chainTotalDeductions.toFixed(6)} ${coin} <span class="text-gray-500">($${totalDeductionsUsd.toFixed(2)})</span></span>
      </div>
      <div class="px-4 py-2 flex justify-between items-center bg-gray-100">
        <span class="text-gray-500">Amount Sending</span>
        <span class="text-black">${chainAmountSending.toFixed(6)} ${coin} <span class="text-gray-500">($${sendingUsd.toFixed(2)})</span></span>
      </div>
    `;
    modalContent.innerHTML = previewHtml;
    transactionModal.classList.remove("hidden");
    transactionModal.classList.add("flex");
  } catch(err) {
    showToast("Error previewing transaction.");
  }
});

modalClose.addEventListener("click", (e) => {
  e.preventDefault();
  transactionModal.classList.add("hidden");
  transactionModal.classList.remove("flex");
});

modalConfirm.addEventListener("click", async () => {
  const payload = {
    to_address: recipientInput.value.trim(),
    amount: parseFloat(amountInput.value),
    chain: currencySelect.value.toLowerCase()
  }
  try {
    modalConfirm.innerHTML = `<svg width="24" fill="white" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_5nOS{transform-origin:center;animation:spinner_sEAn .75s infinite linear}@keyframes spinner_sEAn{100%{transform:rotate(360deg)}}</style><path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25"/><path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z" class="spinner_5nOS"/></svg>`
    const res = await fetch("/send_transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": getCookie("session"),
        "Testnet": testnet
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast("Transaction sent successfully.", err=false);
    } else {
      showToast(data.message);
    }
  } catch (err) {
    showToast("Error sending transaction.");
  }
  modalConfirm.innerHTML = "Confirm Transaction";
});
