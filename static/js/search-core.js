(() => {
    const escapeHtml = (text) => {
        const div = document.createElement("div");
        div.textContent = text ?? "";
        return div.innerHTML;
    };

    const escapeRegex = (text) => String(text ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const highlight = (text, query) => {
        if (!text || !query) return escapeHtml(text || "");
        const escaped = escapeHtml(text);
        const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
        return escaped.replace(regex, "<mark>$1</mark>");
    };

    const searchPosts = (index, query, limit = 10) => {
        if (!query || query.length < 2) return [];

        const lowerQuery = query.toLowerCase();
        const scored = [];

        index.forEach((post) => {
            let score = 0;
            const titleLower = (post.title || "").toLowerCase();
            const excerptLower = (post.excerpt || "").toLowerCase();
            const tagsLower = (post.tags || []).map((tag) => String(tag).toLowerCase());
            const categoryLower = (post.category || "").toLowerCase();

            if (titleLower === lowerQuery) score += 100;
            else if (titleLower.includes(lowerQuery)) score += 50;
            else if (titleLower.split(/\s+/).some((word) => word.includes(lowerQuery))) score += 30;

            if (excerptLower.includes(lowerQuery)) score += 20;
            if (tagsLower.some((tag) => tag.includes(lowerQuery))) score += 15;
            if (categoryLower.includes(lowerQuery)) score += 10;

            if (score > 0) scored.push({ post, score });
        });

        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map((entry) => entry.post);
    };

    const loadIndex = async (url = "/search-index.json") => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Failed to load search index:", error);
            return [];
        }
    };

    window.BlogSearchCore = {
        escapeHtml,
        escapeRegex,
        highlight,
        searchPosts,
        loadIndex,
    };
})();
