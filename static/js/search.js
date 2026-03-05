// Search functionality
(function() {
    const core = window.BlogSearchCore;
    if (!core) {
        console.error('search-core.js is required before search.js');
        return;
    }

    let searchIndex = [];
    let searchModal = null;
    let searchInput = null;
    let searchResults = null;
    let selectedIndex = -1;

    // Load search index
    async function loadSearchIndex() {
        searchIndex = await core.loadIndex('/search-index.json');
    }

    // Search function
    function search(query) {
        return core.searchPosts(searchIndex, query, 10);
    }

    // Render search results
    function renderResults(results) {
        selectedIndex = -1;

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-no-results">No results found</div>';
            return;
        }

        const basePath = document.body.getAttribute('data-base') || '';
        const html = results.map((post, index) => `
            <a href="${basePath}/post/${core.escapeHtml(post.slug)}.html" class="search-result-item" data-index="${index}">
                <div class="search-result-title">${highlightMatch(post.title, searchInput.value)}</div>
                <div class="search-result-meta">
                    ${core.escapeHtml(post.date)} ${post.category ? `· ${core.escapeHtml(post.category)}` : ''}
                </div>
                ${post.excerpt ? `<div class="search-result-excerpt">${highlightMatch(post.excerpt, searchInput.value)}</div>` : ''}
            </a>
        `).join('');

        searchResults.innerHTML = html;
    }

    // Highlight matching text
    function highlightMatch(text, query) {
        return core.highlight(text, query);
    }

    // Open search modal
    function openSearch() {
        searchModal.classList.add('search-modal-open');
        searchInput.focus();
        document.body.style.overflow = 'hidden';
    }

    // Close search modal
    function closeSearch() {
        searchModal.classList.remove('search-modal-open');
        searchInput.value = '';
        searchResults.innerHTML = '';
        selectedIndex = -1;
        document.body.style.overflow = '';
    }

    // Select result item
    function selectResult(direction) {
        const items = searchResults.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        // Remove previous selection
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            items[selectedIndex].classList.remove('selected');
        }

        // Update selected index
        if (direction === 'down') {
            selectedIndex = (selectedIndex + 1) % items.length;
        } else if (direction === 'up') {
            selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
        }

        // Add new selection state
        items[selectedIndex].classList.add('selected');
        items[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Initialize
    function init() {
        // Create search modal
        const modalHTML = `
            <div class="search-modal" id="searchModal">
                <div class="search-modal-backdrop"></div>
                <div class="search-modal-content card">
                    <div class="search-input-wrapper">
                        <i class="ri-search-line search-icon"></i>
                        <input
                            type="text"
                            id="searchInput"
                            class="search-input"
                            placeholder="Search articles..."
                            autocomplete="off"
                        />
                        <button class="search-close-btn button" id="searchCloseBtn">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                    <div class="search-results" id="searchResults"></div>
                    <div class="search-footer">
                        <span class="search-hint"><kbd>/</kbd> to open</span>
                        <span class="search-hint"><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
                        <span class="search-hint"><kbd>Enter</kbd> to select</span>
                        <span class="search-hint"><kbd>Esc</kbd> to close</span>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        searchModal = document.getElementById('searchModal');
        searchInput = document.getElementById('searchInput');
        searchResults = document.getElementById('searchResults');
        const searchBtn = document.getElementById('searchBtn');
        const searchCloseBtn = document.getElementById('searchCloseBtn');
        const backdrop = searchModal.querySelector('.search-modal-backdrop');

        // Load search index
        loadSearchIndex();

        // Search button click
        searchBtn.addEventListener('click', openSearch);

        // Close button
        searchCloseBtn.addEventListener('click', closeSearch);
        backdrop.addEventListener('click', closeSearch);

        // Input event
        searchInput.addEventListener('input', (e) => {
            const results = search(e.target.value);
            renderResults(results);
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            // Press / to open search (when not in input field)
            if (e.key === '/' && !searchModal.classList.contains('search-modal-open') &&
                document.activeElement.tagName !== 'INPUT' &&
                document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                openSearch();
            }

            // Keyboard operations when search modal is open
            if (searchModal.classList.contains('search-modal-open')) {
                if (e.key === 'Escape') {
                    closeSearch();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectResult('down');
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectResult('up');
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const items = searchResults.querySelectorAll('.search-result-item');
                    if (selectedIndex >= 0 && selectedIndex < items.length) {
                        items[selectedIndex].click();
                    }
                }
            }
        });
    }

    // Initialize after page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
