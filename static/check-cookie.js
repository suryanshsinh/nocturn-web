testnet = 0;

if (document.cookie.indexOf("session") >= 0) {
    fetch('/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getCookie('session'),
            'Testnet': testnet
        }
    }).then(async res => {
        res = await res.json()
        console.log(res)
        if (res.message === null) {
            throw new Error();
        } else if (res.success === false) {
            throw new Error();
        }
    }).catch(() => {
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/onboarding";
    });
} else {
    window.location.href = "/onboarding";
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
