function copyAddress() {
    document.querySelector('.copy-seed-phrase').innerHTML = document.querySelector('.copy-seed-phrase').innerHTML.replace('Copy', 'Copied');

    navigator.clipboard.writeText(document.querySelector('.address').innerHTML);
    setTimeout(() => {
        document.querySelector('.copy-seed-phrase').innerHTML = document.querySelector('.copy-seed-phrase').innerHTML.replace('Copied', 'Copy');
    }, 10000)
}