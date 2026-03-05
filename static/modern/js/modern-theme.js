(() => {
    const themeToggle = document.getElementById("modernThemeToggle");
    const themePop = document.getElementById("modernThemePop");
    const themeLabel = document.getElementById("modernThemeLabel");
    const glowRange = document.getElementById("modernGlowRange");
    const glowValue = document.getElementById("modernGlowValue");
    const giscusHost = document.querySelector('[data-giscus-enabled="true"]');

    const modeStorageKey = "modernMode";
    const accentStorageKey = "modernAccent";
    const contrastStorageKey = "modernContrast";
    const glowStorageKey = "modernGlowStrength";
    const themeTransitionDuration = 520;
    const allowedModes = ["light", "dark"];
    const allowedContrasts = ["normal", "hicontrast"];
    const allowedAccents = [
        "blue",
        "red",
        "orange",
        "yellow",
        "green",
        "cyan",
        "purple",
        "magenta",
    ];

    const closestFromTarget = (target, selector) => {
        if (!(target instanceof Element)) return null;
        return target.closest(selector);
    };

    let themeTransitionTimer = 0;

    const beginThemeTransition = () => {
        if (document.documentElement.getAttribute("data-contrast") === "hicontrast") return;
        document.documentElement.setAttribute("data-theme-transition", "on");
        window.clearTimeout(themeTransitionTimer);
        themeTransitionTimer = window.setTimeout(() => {
            document.documentElement.removeAttribute("data-theme-transition");
            themeTransitionTimer = 0;
        }, themeTransitionDuration);
    };

    const cssDataUrl = (css) => `data:text/css;charset=utf-8,${encodeURIComponent(css)}`;

    const dynamicGiscusTheme = (mode) => {
        const styles = getComputedStyle(document.documentElement);
        const accent = styles.getPropertyValue("--accent").trim() || (mode === "dark" ? "#4385be" : "#205ea6");
        const accentSoft = styles.getPropertyValue("--accent-soft").trim() || (mode === "dark" ? "#66a0c8" : "#3171b2");
        const accentRgb = styles.getPropertyValue("--accent-rgb").trim() || (mode === "dark" ? "67, 133, 190" : "32, 94, 166");
        const panel = styles.getPropertyValue("--panel").trim() || (mode === "dark" ? "#282726" : "#f2f0e5");
        const panel2 = styles.getPropertyValue("--panel-2").trim() || (mode === "dark" ? "#343331" : "#e6e4d9");
        const border = styles.getPropertyValue("--border").trim() || (mode === "dark" ? "#343331" : "#e6e4d9");
        const text = styles.getPropertyValue("--text").trim() || (mode === "dark" ? "#cecdc3" : "#100f0f");
        const muted = styles.getPropertyValue("--muted").trim() || (mode === "dark" ? "#878580" : "#6f6e69");
        const primaryText = mode === "dark" ? "#0f0f0f" : "#fffcf0";
        const neutralMuted = mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(16, 15, 15, 0.08)";
        const accentMuted = mode === "dark" ? `rgba(${accentRgb}, 0.2)` : `rgba(${accentRgb}, 0.22)`;

        const css = `
:root, main {
    color-scheme: ${mode};
    --color-canvas-default: ${panel};
    --color-canvas-subtle: ${panel2};
    --color-border-default: ${border};
    --color-border-muted: ${panel2};
    --color-fg-default: ${text};
    --color-fg-muted: ${muted};
    --color-accent-fg: ${accent};
    --color-accent-emphasis: ${accent};
    --color-accent-muted: ${accentMuted};
    --color-btn-primary-bg: ${accent};
    --color-btn-primary-hover-bg: ${accentSoft};
    --color-btn-primary-text: ${primaryText};
    --color-btn-primary-border: ${accent};
    --color-neutral-muted: ${neutralMuted};
    --button-primary-fgColor-rest: ${primaryText};
    --button-primary-fgColor-disabled: ${primaryText};
    --button-primary-bgColor-rest: ${accent};
    --button-primary-bgColor-hover: ${accentSoft};
    --button-primary-bgColor-active: ${accentSoft};
    --button-primary-borderColor-rest: ${accent};
    --button-primary-borderColor-hover: ${accentSoft};
    --button-primary-borderColor-active: ${accentSoft};
    --fgColor-accent: ${accent};
    --fgColor-default: ${text};
    --bgColor-default: ${panel};
    --borderColor-default: ${border};
    --borderRadius-small: 0px;
    --borderRadius-medium: 0px;
    --borderRadius-large: 0px;
    --borderRadius-full: 0px;
    --control-borderRadius: 0px;
}

body {
    background: var(--color-canvas-default);
}

*,
*::before,
*::after {
    border-radius: 0 !important;
}

main .btn-primary,
main .Button--primary {
    background-color: var(--button-primary-bgColor-rest, var(--color-btn-primary-bg)) !important;
    border-color: var(--button-primary-borderColor-rest, var(--color-btn-primary-border)) !important;
    color: var(--button-primary-fgColor-rest, var(--color-btn-primary-text)) !important;
}

main .btn-primary:hover,
main .Button--primary:hover {
    background-color: var(--button-primary-bgColor-hover, var(--color-btn-primary-hover-bg)) !important;
    border-color: var(--button-primary-borderColor-hover, var(--color-btn-primary-hover-bg)) !important;
}
`;

        return cssDataUrl(css);
    };

    const syncGiscusTheme = () => {
        const frame = document.querySelector("iframe.giscus-frame");
        if (!frame || !frame.contentWindow) return;

        const mode = document.documentElement.getAttribute("data-mode") || "light";
        const lightTheme = giscusHost?.dataset.giscusThemeLight || "light";
        const darkTheme = giscusHost?.dataset.giscusThemeDark || "dark";
        const defaultTheme = mode === "dark" ? darkTheme : lightTheme;
        const giscusTheme = dynamicGiscusTheme(mode) || defaultTheme;
        const uiLang = window.ModernI18n?.getLang?.() || "en";
        const giscusLang = uiLang === "zh" ? "zh-CN" : "en";

        frame.contentWindow.postMessage(
            {
                giscus: {
                    setConfig: {
                        theme: giscusTheme,
                        lang: giscusLang,
                    },
                },
            },
            "https://giscus.app",
        );
    };

    const applyMode = (mode, options = {}) => {
        const { animate = true } = options;
        const next = allowedModes.includes(mode) ? mode : "light";
        if (animate) beginThemeTransition();
        document.documentElement.setAttribute("data-mode", next);
        if (themePop) {
            themePop.querySelectorAll(".theme-mode").forEach((btn) => {
                btn.classList.toggle("is-active", btn.dataset.mode === next);
            });
        }
        syncGiscusTheme();
    };

    const applyContrast = (contrast, options = {}) => {
        const { animate = true } = options;
        const next = allowedContrasts.includes(contrast) ? contrast : "normal";
        if (next === "hicontrast") {
            window.clearTimeout(themeTransitionTimer);
            document.documentElement.removeAttribute("data-theme-transition");
        } else if (animate) {
            beginThemeTransition();
        }
        document.documentElement.setAttribute("data-contrast", next);
        if (themePop) {
            themePop.querySelectorAll(".theme-contrast").forEach((btn) => {
                btn.classList.toggle("is-active", btn.dataset.contrast === next);
            });
        }
        window.dispatchEvent(new CustomEvent("modern:contrast-change", { detail: { contrast: next } }));
        syncGiscusTheme();
    };

    const applyAccent = (accent, options = {}) => {
        const { animate = true } = options;
        const next = allowedAccents.includes(accent) ? accent : "blue";
        if (animate) beginThemeTransition();
        document.documentElement.setAttribute("data-accent", next);
        if (themePop) {
            themePop.querySelectorAll(".accent-option").forEach((btn) => {
                btn.classList.toggle("is-active", btn.dataset.accent === next);
            });
        }
        syncGiscusTheme();
    };

    const applyGlowStrength = (value) => {
        const parsed = Number.parseInt(value, 10);
        const next = Number.isFinite(parsed) ? Math.max(20, Math.min(120, parsed)) : 70;
        const normalized = (next / 100).toFixed(2);
        document.documentElement.style.setProperty("--glow-strength", normalized);
        if (glowRange) glowRange.value = String(next);
        if (glowValue) glowValue.textContent = `${next}%`;
    };

    const updateThemeLabel = () => {
        if (!themeLabel) return;
        const mode = document.documentElement.getAttribute("data-mode") || "light";
        const accent = document.documentElement.getAttribute("data-accent") || "blue";
        const contrast = document.documentElement.getAttribute("data-contrast") || "normal";
        if (window.ModernI18n && typeof window.ModernI18n.themeLabel === "function") {
            themeLabel.textContent = window.ModernI18n.themeLabel(mode, accent, contrast);
            return;
        }
        const base = `${mode.charAt(0).toUpperCase() + mode.slice(1)} · ${accent.charAt(0).toUpperCase() + accent.slice(1)}`;
        themeLabel.textContent = contrast === "hicontrast" ? `${base} · HiContrast` : base;
    };

    const storedMode = localStorage.getItem(modeStorageKey);
    applyMode(storedMode || "light", { animate: false });

    const storedAccent = localStorage.getItem(accentStorageKey);
    applyAccent(storedAccent || "blue", { animate: false });

    const storedContrast = localStorage.getItem(contrastStorageKey);
    applyContrast(storedContrast || "normal", { animate: false });

    const storedGlow = localStorage.getItem(glowStorageKey);
    applyGlowStrength(storedGlow || "70");
    updateThemeLabel();

    window.addEventListener("modern:lang-change", () => {
        updateThemeLabel();
        syncGiscusTheme();
    });

    if (giscusHost) {
        const observer = new MutationObserver(() => {
            syncGiscusTheme();
        });
        observer.observe(giscusHost, { childList: true, subtree: true });
        window.setTimeout(syncGiscusTheme, 600);
        window.setTimeout(syncGiscusTheme, 1600);
    }

    if (!themeToggle || !themePop) return;

    const closeTheme = () => {
        themePop.hidden = true;
        themeToggle.setAttribute("aria-expanded", "false");
    };

    const openTheme = () => {
        themePop.hidden = false;
        themeToggle.setAttribute("aria-expanded", "true");
    };

    themeToggle.addEventListener("click", (event) => {
        event.stopPropagation();
        if (themePop.hidden) {
            openTheme();
        } else {
            closeTheme();
        }
    });

    const onOutside = (event) => {
        if (themePop.hidden) return;
        if (closestFromTarget(event.target, "#modernTheme")) return;
        closeTheme();
    };

    document.addEventListener("pointerdown", onOutside, true);
    document.addEventListener("touchstart", onOutside, true);

    window.addEventListener(
        "scroll",
        () => {
            if (!themePop.hidden) closeTheme();
        },
        { passive: true },
    );

    themePop.addEventListener("click", (event) => {
        const contrastBtn = event.target.closest(".theme-contrast[data-contrast]");
        if (contrastBtn) {
            const contrast = contrastBtn.dataset.contrast;
            localStorage.setItem(contrastStorageKey, contrast);
            applyContrast(contrast);
            updateThemeLabel();
            closeTheme();
            return;
        }

        const modeBtn = event.target.closest(".theme-mode[data-mode]");
        if (modeBtn) {
            const mode = modeBtn.dataset.mode;
            localStorage.setItem(modeStorageKey, mode);
            applyMode(mode);
            updateThemeLabel();
            closeTheme();
            return;
        }

        const accentBtn = event.target.closest(".accent-option");
        if (accentBtn) {
            const accent = accentBtn.dataset.accent;
            localStorage.setItem(accentStorageKey, accent);
            applyAccent(accent);
            updateThemeLabel();
            closeTheme();
        }
    });

    if (glowRange) {
        glowRange.addEventListener("input", (event) => {
            const next = event.target.value;
            applyGlowStrength(next);
            localStorage.setItem(glowStorageKey, String(next));
        });
    }

    document.addEventListener("click", (event) => {
        if (themePop.hidden) return;
        if (closestFromTarget(event.target, "#modernTheme")) return;
        closeTheme();
    });

    closeTheme();
})();
