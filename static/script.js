const addNavigation = () => {
    const navButtons = document.querySelectorAll(".fixed button");
    const currentPath = window.location.pathname.split("/").pop();

    navButtons.forEach(button => {
        const buttonUrl = button.getAttribute("data-url");

        if (currentPath !== buttonUrl) {
            button.classList.remove("active-nav");
        } else {
            button.classList.add("active-nav");
        }

        button.addEventListener("click", function () {
            if (buttonUrl) {
                this.classList.add("active-nav");
                window.location.href = buttonUrl;
            } else {
                this.classList.add("active-nav");
                window.location.href = "/";
            }
        })

    });
}

document.addEventListener('DOMContentLoaded', function () {
    addNavigation();
})