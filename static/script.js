testnet = 1

const navMappings = {
    "send": ["send", "send/detail", "send/confirmation"],
    "receive": ["receive", "receive-detail"],
    "history": ["history", "history-detail"],
    "settings": ["settings", "settings/profile"]
};

const addNavigation = (currentPath) => {
    const navButtons = document.querySelectorAll(".nav-buttons button");
    navButtons.forEach(button => {
        const buttonUrl = button.getAttribute("data-url");
        let isActive = false;
        if (currentPath === "" && buttonUrl === "") {
            isActive = true;
        } else {
            isActive = Object.keys(navMappings).some(key =>
                buttonUrl === key && navMappings[key].some(path => currentPath.startsWith(path))
            );
        }
        if (isActive) {
            button.classList.add("active-nav");
        } else {
            button.classList.remove("active-nav");
        }
        button.addEventListener("click", function () {
            window.location.href = buttonUrl || "/";
        });
    });
};

document.addEventListener('DOMContentLoaded', function () {
    let currentPath = window.location.pathname.replace(/^\//, "");
    addNavigation(currentPath);

    logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            window.location.href = "/";
        });
    }
});