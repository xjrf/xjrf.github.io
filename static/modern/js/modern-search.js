(() => {
    const core = window.BlogSearchCore;
    if (!core) {
        console.error("search-core.js is required before modern-search.js");
        return;
    }

    let searchIndex = [];
    let modal = null;
    let input = null;
    let results = null;
    let selectedIndex = -1;

    const bodyBase = document.body.getAttribute("data-base");
    const basePath = bodyBase === null ? "" : bodyBase;
    const i18nText = (key, fallback) => {
        const translator = window.ModernI18n;
        if (!translator || typeof translator.t !== "function") return fallback;
        return translator.t(key);
    };

    const loadIndex = async () => {
        searchIndex = await core.loadIndex("/search-index.json");
    };

    const search = (query) => {
        return core.searchPosts(searchIndex, query, 10);
    };

    const render = (items) => {
        selectedIndex = -1;
        if (items.length === 0) {
            results.innerHTML = `<div class="modern-search-item">${i18nText("search.no_results", "No results yet.")}</div>`;
            return;
        }

        results.innerHTML = items
            .map(
                (post, index) => `
                <a class="modern-search-item" data-index="${index}" href="${basePath}/post/${core.escapeHtml(post.slug)}.html">
                    <strong>${core.highlight(post.title, input.value)}</strong>
                    <span>${core.escapeHtml(post.date)} · ${core.escapeHtml(post.category || "")}</span>
                </a>
            `,
            )
            .join("");
    };

    const openModal = () => {
        modal.classList.add("is-open");
        input.focus();
        document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
        modal.classList.remove("is-open");
        input.value = "";
        results.innerHTML = "";
        selectedIndex = -1;
        document.body.style.overflow = "";
    };

    const selectItem = (direction) => {
        const items = results.querySelectorAll(".modern-search-item");
        if (!items.length) return;

        if (selectedIndex >= 0) {
            items[selectedIndex].classList.remove("is-active");
        }

        if (direction === "down") {
            selectedIndex = (selectedIndex + 1) % items.length;
        } else {
            selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
        }

        items[selectedIndex].classList.add("is-active");
        items[selectedIndex].scrollIntoView({ block: "nearest" });
    };

    const init = () => {
        const trigger = document.getElementById("modernSearchBtn");
        if (!trigger) return;

        const modalHtml = `
            <div class="modern-search-modal" id="modernSearchModal">
                <div class="modern-search-backdrop"></div>
                <div class="modern-search-panel">
                    <input class="modern-search-input" id="modernSearchInput" type="text" placeholder="${i18nText("search.placeholder", "Search the archive")}" />
                    <div class="modern-search-results" id="modernSearchResults"></div>
                    <div class="hero-meta">
                        <span id="modernSearchEsc">${i18nText("search.esc_to_close", "Esc to close")}</span>
                        <span id="modernSearchNavHint">${i18nText("search.navigate", "↑ ↓ to navigate")}</span>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHtml);
        modal = document.getElementById("modernSearchModal");
        input = document.getElementById("modernSearchInput");
        results = document.getElementById("modernSearchResults");
        const escHint = document.getElementById("modernSearchEsc");
        const navHint = document.getElementById("modernSearchNavHint");

        const backdrop = modal.querySelector(".modern-search-backdrop");

        trigger.addEventListener("click", openModal);
        backdrop.addEventListener("click", closeModal);

        input.addEventListener("input", (event) => {
            render(search(event.target.value));
        });

        window.addEventListener("modern:lang-change", () => {
            input.setAttribute("placeholder", i18nText("search.placeholder", "Search the archive"));
            if (escHint) escHint.textContent = i18nText("search.esc_to_close", "Esc to close");
            if (navHint) navHint.textContent = i18nText("search.navigate", "↑ ↓ to navigate");
            render(search(input.value));
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "/" && !modal.classList.contains("is-open")) {
                if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
                    event.preventDefault();
                    openModal();
                }
            }

            if (modal.classList.contains("is-open")) {
                if (event.key === "Escape") closeModal();
                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    selectItem("down");
                }
                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    selectItem("up");
                }
                if (event.key === "Enter") {
                    const items = results.querySelectorAll(".modern-search-item");
                    if (selectedIndex >= 0 && selectedIndex < items.length) {
                        items[selectedIndex].click();
                    }
                }
            }
        });

        loadIndex();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
