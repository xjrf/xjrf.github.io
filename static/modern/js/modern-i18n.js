(() => {
    const storageKey = "modernUiLang";
    const supportedLangs = ["en", "zh"];

    const dictionaries = {
        en: {
            "nav.home": "Home",
            "nav.archive": "Archive",
            "nav.tags": "Tags",
            "nav.bookmarks": "Bookmarks",
            "nav.guestbook": "Guestbook",
            "nav.about": "About",
            "nav.search": "Search",
            "nav.menu": "Menu",
            "nav.editor": "Editor",
            "nav.categories": "Categories",
            "nav.all": "All",
            "nav.retro": "Retro",
            "lang.en": "EN",
            "lang.zh": "中文",
            "theme.mode.light": "Light",
            "theme.mode.dark": "Dark",
            "theme.contrast.normal": "Normal",
            "theme.contrast.hicontrast": "HiContrast",
            "theme.glow": "Glow",
            "theme.glow_hint": "Adjust glow softness and intensity",
            "accent.blue": "Blue",
            "accent.red": "Red",
            "accent.orange": "Orange",
            "accent.yellow": "Yellow",
            "accent.green": "Green",
            "accent.cyan": "Cyan",
            "accent.purple": "Purple",
            "accent.magenta": "Magenta",
            "index.kicker.category": "Category",
            "index.kicker.tag_focus": "Tag Focus",
            "index.kicker.field_notes": "Field Notes",
            "index.hero_default": "Modern Essays & Experiments",
            "index.stat.posts": "Posts",
            "index.stat.on_page": "On this page",
            "index.read": "Read",
            "index.min_read": "min read",
            "index.identity.interactive": "Interactive",
            "index.identity.monthly": "Monthly",
            "index.identity.behind": "Behind the scenes",
            "index.identity.guestbook_desc": "Leave a trace from your corner of the internet.",
            "index.identity.bookmarks_desc": "What I'm reading, watching, and listening to lately.",
            "pagination.prev": "Prev",
            "pagination.next": "Next",
            "about.kicker": "Studio Notes",
            "about.title": "About the archive",
            "about.get_in_touch": "Get in touch",
            "about.prefix": "Find me on",
            "about.suffix": "or explore the retro portal for archived context.",
            "archive.kicker": "Chronicle",
            "archive.title": "Archive",
            "tags.kicker": "Taxonomy",
            "tags.title": "Tags & Categories",
            "tags.graph_title": "Tag Graph",
            "tags.graph_desc": "Click a node to open tag.",
            "post.kicker.essay": "Essay",
            "post.label.published": "Published",
            "post.label.reading": "Reading",
            "post.label.words": "Words",
            "post.label.category": "Category",
            "post.label.min": "min",
            "post.related": "Related reading",
            "post.comments": "Comments",
            "post.comments_missing_title": "Comments are not configured yet.",
            "post.comments_missing_desc":
                "Fill guestbook.repo_id and guestbook.category_id in config.toml.",
            "post.back_to_top": "Back to top",
            "error.kicker": "Lost signal",
            "error.title": "Page not found",
            "error.desc": "The modern archive couldn't locate this route.",
            "error.return": "Return to the modern index to continue exploring.",
            "error.go_home": "Go home",
            "bookmarks.kicker": "Current picks",
            "bookmarks.period_prefix": "In this period:",
            "bookmarks.reading": "Reading",
            "bookmarks.watching": "Watching",
            "bookmarks.listening": "Listening",
            "bookmarks.empty_reading": "No reading entries yet.",
            "bookmarks.empty_watching": "No watching entries yet.",
            "bookmarks.empty_listening": "No listening entries yet.",
            "guestbook.kicker": "Say hello",
            "guestbook.desc":
                "A dedicated place for messages, notes, and kind drive-by comments.",
            "guestbook.messages": "Messages",
            "guestbook.missing_title": "Guestbook is not fully configured yet.",
            "guestbook.missing_desc": "Fill guestbook giscus fields in config.toml.",
            "search.placeholder": "Search the archive",
            "search.no_results": "No results yet.",
            "search.esc_to_close": "Esc to close",
            "search.navigate": "↑ ↓ to navigate",
        },
        zh: {
            "nav.home": "首页",
            "nav.archive": "归档",
            "nav.tags": "标签",
            "nav.bookmarks": "书签",
            "nav.guestbook": "留言板",
            "nav.about": "关于",
            "nav.search": "搜索",
            "nav.menu": "菜单",
            "nav.editor": "作者",
            "nav.categories": "分类",
            "nav.all": "全部",
            "nav.retro": "复古版",
            "lang.en": "EN",
            "lang.zh": "中文",
            "theme.mode.light": "浅色",
            "theme.mode.dark": "深色",
            "theme.contrast.normal": "标准",
            "theme.contrast.hicontrast": "高对比",
            "theme.glow": "光效",
            "theme.glow_hint": "调整光效柔和度与强度",
            "accent.blue": "蓝",
            "accent.red": "红",
            "accent.orange": "橙",
            "accent.yellow": "黄",
            "accent.green": "绿",
            "accent.cyan": "青",
            "accent.purple": "紫",
            "accent.magenta": "品红",
            "index.kicker.category": "分类",
            "index.kicker.tag_focus": "标签聚焦",
            "index.kicker.field_notes": "现场笔记",
            "index.hero_default": "现代随笔与实验",
            "index.stat.posts": "文章数",
            "index.stat.on_page": "本页展示",
            "index.read": "阅读",
            "index.min_read": "分钟阅读",
            "index.identity.interactive": "互动",
            "index.identity.monthly": "月度",
            "index.identity.behind": "幕后",
            "index.identity.guestbook_desc": "从你的互联网角落留下一句吧。",
            "index.identity.bookmarks_desc": "我最近在读、在看、在听的内容。",
            "pagination.prev": "上一页",
            "pagination.next": "下一页",
            "about.kicker": "工作室笔记",
            "about.title": "关于这个博客",
            "about.get_in_touch": "联系我",
            "about.prefix": "你可以在",
            "about.suffix": "找到我，或去复古版查看历史语境。",
            "archive.kicker": "时间线",
            "archive.title": "归档",
            "tags.kicker": "分类体系",
            "tags.title": "标签与分类",
            "tags.graph_title": "标签图谱",
            "tags.graph_desc": "点击节点可打开对应标签页。",
            "post.kicker.essay": "文章",
            "post.label.published": "发布时间",
            "post.label.reading": "阅读时长",
            "post.label.words": "字数",
            "post.label.category": "分类",
            "post.label.min": "分钟",
            "post.related": "相关文章",
            "post.comments": "评论",
            "post.comments_missing_title": "评论尚未完成配置。",
            "post.comments_missing_desc":
                "请在 config.toml 中填写 guestbook.repo_id 与 guestbook.category_id。",
            "post.back_to_top": "回到顶部",
            "error.kicker": "信号丢失",
            "error.title": "页面不存在",
            "error.desc": "现代主题中找不到你访问的路径。",
            "error.return": "返回首页继续浏览。",
            "error.go_home": "回首页",
            "bookmarks.kicker": "近期收藏",
            "bookmarks.period_prefix": "本期：",
            "bookmarks.reading": "在读",
            "bookmarks.watching": "在看",
            "bookmarks.listening": "在听",
            "bookmarks.empty_reading": "暂无在读条目。",
            "bookmarks.empty_watching": "暂无在看条目。",
            "bookmarks.empty_listening": "暂无在听条目。",
            "guestbook.kicker": "来打个招呼",
            "guestbook.desc": "这里是独立留言区，欢迎留下你的短评与足迹。",
            "guestbook.messages": "留言",
            "guestbook.missing_title": "留言板配置尚未完成。",
            "guestbook.missing_desc": "请在 config.toml 中完善 guestbook 的 giscus 字段。",
            "search.placeholder": "搜索博客内容",
            "search.no_results": "暂未找到结果。",
            "search.esc_to_close": "按 Esc 关闭",
            "search.navigate": "↑ ↓ 选择结果",
        },
    };

    const modeKeyMap = {
        light: "theme.mode.light",
        dark: "theme.mode.dark",
    };

    const contrastKeyMap = {
        normal: "theme.contrast.normal",
        hicontrast: "theme.contrast.hicontrast",
    };

    const accentKeyMap = {
        blue: "accent.blue",
        red: "accent.red",
        orange: "accent.orange",
        yellow: "accent.yellow",
        green: "accent.green",
        cyan: "accent.cyan",
        purple: "accent.purple",
        magenta: "accent.magenta",
    };

    let currentLang = "en";

    const resolveLang = (lang) => (supportedLangs.includes(lang) ? lang : "en");

    const detectLang = () => {
        try {
            const stored = localStorage.getItem(storageKey);
            if (stored) return resolveLang(stored);
        } catch (_) {}

        const docLang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
        if (docLang.startsWith("zh")) return "zh";

        const browserLang = (navigator.language || "").toLowerCase();
        if (browserLang.startsWith("zh")) return "zh";

        return "en";
    };

    const t = (key) => dictionaries[currentLang]?.[key] ?? dictionaries.en[key] ?? key;

    const apply = () => {
        document.documentElement.setAttribute("data-ui-lang", currentLang);
        document.documentElement.setAttribute("lang", currentLang === "zh" ? "zh-CN" : "en");

        document.querySelectorAll("[data-i18n]").forEach((element) => {
            const key = element.dataset.i18n;
            if (!key) return;
            element.textContent = t(key);
        });

        document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
            const key = element.dataset.i18nPlaceholder;
            if (!key) return;
            element.setAttribute("placeholder", t(key));
        });

        document.querySelectorAll("[data-i18n-title]").forEach((element) => {
            const key = element.dataset.i18nTitle;
            if (!key) return;
            element.setAttribute("title", t(key));
        });

        const langToggle = document.getElementById("modernLangToggle");
        if (langToggle) {
            langToggle.dataset.lang = currentLang;
            const label = langToggle.querySelector("[data-lang-toggle-label]");
            if (label) {
                label.textContent = currentLang === "zh" ? t("lang.en") : t("lang.zh");
            }
        }
    };

    const setLang = (nextLang, options = {}) => {
        const { persist = true, emit = true } = options;
        currentLang = resolveLang(nextLang);
        if (persist) {
            try {
                localStorage.setItem(storageKey, currentLang);
            } catch (_) {}
        }
        apply();
        if (emit) {
            window.dispatchEvent(new CustomEvent("modern:lang-change", { detail: { lang: currentLang } }));
        }
    };

    const themeLabel = (mode, accent, contrast = "normal") => {
        const modeKey = modeKeyMap[mode] || modeKeyMap.light;
        const accentKey = accentKeyMap[accent] || accentKeyMap.blue;
        const base = `${t(modeKey)} · ${t(accentKey)}`;
        if (contrast === "hicontrast") {
            const contrastKey = contrastKeyMap[contrast] || contrastKeyMap.hicontrast;
            return `${base} · ${t(contrastKey)}`;
        }
        return base;
    };

    const init = () => {
        currentLang = detectLang();
        apply();

        const langToggle = document.getElementById("modernLangToggle");
        if (langToggle) {
            langToggle.addEventListener("click", () => {
                const nextLang = currentLang === "zh" ? "en" : "zh";
                setLang(nextLang);
            });
        }

        window.dispatchEvent(new CustomEvent("modern:lang-change", { detail: { lang: currentLang } }));
    };

    window.ModernI18n = {
        getLang: () => currentLang,
        t,
        apply,
        setLang,
        themeLabel,
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
