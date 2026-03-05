document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const mask = document.getElementById('sidebar-mask');

    if (!btn || !sidebar || !mask) {
        return;
    }

    function openMenu() {
        sidebar.classList.add('open');
        mask.classList.add('open');
    }

    function closeMenu() {
        sidebar.classList.remove('open');
        mask.classList.remove('open');
    }

    function toggleMenu() {
        if (sidebar.classList.contains('open')) {
            closeMenu();
            return;
        }
        openMenu();
    }

    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleMenu();
    });

    mask.addEventListener('click', closeMenu);

    sidebar.addEventListener('click', function (event) {
        if (!(event.target instanceof Element)) {
            return;
        }
        const link = event.target.closest('a');
        if (link) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();
        }
    });
});
