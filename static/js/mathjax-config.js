window.MathJax = {
    loader: {
        load: [
            "[tex]/ams",
            "[tex]/mathtools",
            "[tex]/mhchem",
            "[tex]/physics",
            "[tex]/noerrors",
            "[tex]/noundefined",
        ],
    },
    tex: {
        inlineMath: [
            ["$", "$"],
            ["\\(", "\\)"],
        ],
        displayMath: [
            ["$$", "$$"],
            ["\\[", "\\]"],
        ],
        processEscapes: true,
        processEnvironments: true,
        packages: {
            "[+]": ["ams", "mathtools", "mhchem", "physics", "noerrors", "noundefined"],
        },
    },
    options: {
        skipHtmlTags: [
            "script",
            "noscript",
            "style",
            "textarea",
            "pre",
            "code",
            "option",
        ],
        ignoreHtmlClass: "tex2jax_ignore|no-mathjax",
        processHtmlClass: "tex2jax_process|mathjax-process",
    },
    chtml: {
        scale: 1,
        matchFontHeight: false,
    },
};
