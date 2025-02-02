function copyAddress() {
    document.querySelector('.copy-seed-phrase').innerHTML = document.querySelector('.copy-seed-phrase').innerHTML.replace('Copy', 'Copied');
    navigator.clipboard.writeText(document.querySelector('.address').innerHTML);
    setTimeout(() => {
        document.querySelector('.copy-seed-phrase').innerHTML = document.querySelector('.copy-seed-phrase').innerHTML.replace('Copied', 'Copy');
    }, 10000)
}

document.addEventListener('DOMContentLoaded', async () => {
    const res = await fetch('/receive', {
        method: 'POST',
        headers: {
            'Authorization': getCookie('session')
        }
    });
    const data = await res.json();
    if (data.success === false) {
        console.error("Error fetching wallet address");
        return
    }
    document.querySelector('.address').innerHTML = data.address;
    document.querySelector('.address-qr').src = `data:image/png;base64,${data.qr}`;
    document.querySelector('.copy-seed-phrase').addEventListener('click', copyAddress);
});