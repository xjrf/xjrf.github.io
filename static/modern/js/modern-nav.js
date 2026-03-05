(() => {
    const header = document.getElementById("modernHeader");
    const nav = document.getElementById("modernNav");
    const toggle = document.getElementById("modernNavToggle");
    const backToTop = document.getElementById("modernBackToTop");
    const themeToggle = document.getElementById("modernThemeToggle");
    const themePop = document.getElementById("modernThemePop");

    let lastScrollY = window.scrollY;
    let navBackdrop = null;
    const navBackdropHost = header?.closest(".modern-shell") || document.body;

    const closestFromTarget = (target, selector) => {
        if (!(target instanceof Element)) return null;
        return target.closest(selector);
    };

    const closeThemePanel = () => {
        if (!themePop || themePop.hidden) return;
        themePop.hidden = true;
        if (themeToggle) themeToggle.setAttribute("aria-expanded", "false");
    };

    const closeNav = () => {
        if (!nav) return;
        nav.classList.remove("is-open");
        if (navBackdrop) {
            navBackdrop.remove();
            navBackdrop = null;
        }
    };

    const openNav = () => {
        if (!nav) return;
        nav.classList.add("is-open");
        if (!navBackdrop) {
            navBackdrop = document.createElement("div");
            navBackdrop.className = "modern-nav-backdrop";
            navBackdrop.addEventListener("click", closeNav);
            navBackdropHost.appendChild(navBackdrop);
        }
    };

    const toggleNav = () => {
        if (!nav) return;
        if (nav.classList.contains("is-open")) {
            closeNav();
        } else {
            openNav();
        }
    };

    const updateHeader = () => {
        if (!header) return;
        header.classList.toggle("is-scrolled", window.scrollY > 20);

        if (nav && nav.classList.contains("is-open")) {
            header.classList.remove("is-hidden");
            lastScrollY = window.scrollY;
            return;
        }

        const currentScroll = window.scrollY;
        const scrollingDown = currentScroll > lastScrollY;
        if (scrollingDown && currentScroll > 120) {
            header.classList.add("is-hidden");
        } else {
            header.classList.remove("is-hidden");
        }
        lastScrollY = currentScroll;
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (toggle && nav) {
        let suppressToggleClick = false;

        if (window.PointerEvent) {
            toggle.addEventListener("pointerdown", (event) => {
                if (event.pointerType === "touch" || event.pointerType === "pen") {
                    suppressToggleClick = true;
                    toggleNav();
                    if (event.cancelable) event.preventDefault();
                }
            });
        } else {
            toggle.addEventListener(
                "touchstart",
                (event) => {
                    suppressToggleClick = true;
                    toggleNav();
                    if (event.cancelable) event.preventDefault();
                },
                { passive: false },
            );
        }

        toggle.addEventListener("click", (event) => {
            if (suppressToggleClick) {
                suppressToggleClick = false;
                if (event.cancelable) event.preventDefault();
                return;
            }
            toggleNav();
        });

        nav.addEventListener("click", (event) => {
            const link = closestFromTarget(event.target, "a");
            if (link) closeNav();
            closeThemePanel();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeNav();
                closeThemePanel();
            }
        });

        window.addEventListener(
            "resize",
            () => {
                if (window.innerWidth > 720) closeNav();
            },
            { passive: true },
        );
    }

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }
})();
