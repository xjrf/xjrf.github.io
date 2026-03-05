(() => {
    const addCodeCopyButtons = () => {
        document.querySelectorAll(".post-content pre").forEach((pre) => {
            if (pre.querySelector(".code-copy-btn")) return;

            const code = pre.querySelector("code");
            if (code) {
                const className = code.className || "";
                const match = className.match(/language-([a-z0-9]+)/i);
                if (match) {
                    const raw = match[1].toLowerCase();
                    const labelMap = {
                        cpp: "C++",
                        c: "C",
                        rust: "Rust",
                        js: "JavaScript",
                        ts: "TypeScript",
                    };
                    const label = labelMap[raw] || raw.toUpperCase();
                    pre.setAttribute("data-lang", label);
                }
            }

            const button = document.createElement("button");
            button.type = "button";
            button.className = "code-copy-btn";
            button.textContent = "copy";

            let resetTimer = 0;
            button.addEventListener("click", async () => {
                try {
                    const source = code ? code.innerText : pre.innerText;
                    await navigator.clipboard.writeText(source.trim());
                    button.textContent = "copied";
                    button.classList.add("is-copied");
                    window.clearTimeout(resetTimer);
                    resetTimer = window.setTimeout(() => {
                        button.textContent = "copy";
                        button.classList.remove("is-copied");
                    }, 1200);
                } catch (error) {
                    console.error("Copy failed", error);
                }
            });

            pre.appendChild(button);
        });
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addCodeCopyButtons);
    } else {
        addCodeCopyButtons();
    }
})();
