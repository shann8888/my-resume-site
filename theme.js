/* Restore the saved theme before the page is displayed. */
(function () {
    "use strict";

    const root = document.documentElement;
    const storageKey = "hesshan-theme";
    let theme = "dark";

    try {
        const saved = localStorage.getItem(storageKey);
        if (saved === "light" || saved === "dark") {
            theme = saved;
        }
    } catch (error) {
        // Theme switching can still work without browser storage.
    }

    function applyTheme(value) {
        root.dataset.theme = value;

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.content = value === "dark" ? "#0c1419" : "#f7f8f5";
        }

        const button = document.querySelector(".theme-toggle");
        if (button) {
            const label = value === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme";

            button.setAttribute("aria-label", label);
            button.title = label;
        }
    }

    applyTheme(theme);

    document.addEventListener("DOMContentLoaded", function () {
        const themeButton = document.querySelector(".theme-toggle");
        const menuButton = document.querySelector(".menu-toggle");
        const navigation = document.querySelector(".primary-nav");

        // Wait until the redesigned HTML includes these controls.
        if (!themeButton || !menuButton || !navigation) {
            return;
        }

        applyTheme(root.dataset.theme);

        /* Switch themes and remember the choice. */
        themeButton.addEventListener("click", function () {
            theme = root.dataset.theme === "dark" ? "light" : "dark";
            applyTheme(theme);

            try {
                localStorage.setItem(storageKey, theme);
            } catch (error) {
                // Storage restrictions must not prevent theme switching.
            }
        });

        /* Open and close the mobile navigation. */
        function closeMenu(returnFocus) {
            navigation.classList.remove("is-open");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.querySelector("span").textContent = "Menu";

            if (returnFocus) {
                menuButton.focus();
            }
        }

        menuButton.addEventListener("click", function () {
            const open = menuButton.getAttribute("aria-expanded") !== "true";

            menuButton.setAttribute("aria-expanded", String(open));
            menuButton.querySelector("span").textContent = open ? "Close" : "Menu";
            navigation.classList.toggle("is-open", open);

            if (open) {
                navigation.querySelector("a").focus();
            }
        });

        navigation.addEventListener("click", function (event) {
            if (event.target.closest("a")) {
                closeMenu(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && navigation.classList.contains("is-open")) {
                closeMenu(true);
            }
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest(".site-header")) {
                closeMenu(false);
            }
        });

        window.matchMedia("(min-width: 721px)").addEventListener("change", function (event) {
            if (event.matches) {
                closeMenu(false);
            }
        });

        root.classList.add("js-ready");

        /* Reveal sections as they enter the screen. */
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

        if ("IntersectionObserver" in window && !reducedMotion.matches) {
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove("reveal-pending");
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.07 });

            document.querySelectorAll(".reveal").forEach(function (element) {
                element.classList.add("reveal-pending");
                observer.observe(element);
            });

            reducedMotion.addEventListener("change", function (event) {
                if (event.matches) {
                    observer.disconnect();

                    document.querySelectorAll(".reveal-pending").forEach(function (element) {
                        element.classList.remove("reveal-pending");
                    });
                }
            });
        }
    });

    /* Keep the selected theme consistent across open tabs. */
    window.addEventListener("storage", function (event) {
        if (event.key === storageKey) {
            applyTheme(event.newValue === "light" ? "light" : "dark");
        }
    });
}());