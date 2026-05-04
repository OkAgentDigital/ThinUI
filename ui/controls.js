// ─── Gift Wrapper UI Controls (browser-compatible, no Tauri deps) ───

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎁 Gift Wrapper controls loaded');

    // ─── Theme Toggle (dark/light) ───
    const htmlEl = document.documentElement;
    const themeIconDark = document.getElementById('theme-icon-dark');
    const themeIconLight = document.getElementById('theme-icon-light');

    function setTheme(dark) {
        if (dark) {
            htmlEl.classList.add('dark');
            themeIconDark?.classList.remove('hidden');
            themeIconLight?.classList.add('hidden');
        } else {
            htmlEl.classList.remove('dark');
            themeIconDark?.classList.add('hidden');
            themeIconLight?.classList.remove('hidden');
        }
        localStorage.setItem('gw-theme', dark ? 'dark' : 'light');
    }

    const savedTheme = localStorage.getItem('gw-theme') || 'dark';
    setTheme(savedTheme === 'dark');

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        setTheme(!htmlEl.classList.contains('dark'));
    });

    // ─── Font Size Controls ───
    const MIN_FONT = 0;
    const MAX_FONT = 4;
    const DEFAULT_FONT = 2;

    function setFontSize(level) {
        const clamped = Math.max(MIN_FONT, Math.min(MAX_FONT, level));
        htmlEl.setAttribute('data-font-size', String(clamped));
        localStorage.setItem('gw-font-size', String(clamped));
    }

    const savedFontSize = parseInt(localStorage.getItem('gw-font-size')) || DEFAULT_FONT;
    setFontSize(savedFontSize);

    document.getElementById('font-size-down')?.addEventListener('click', () => {
        const current = parseInt(htmlEl.getAttribute('data-font-size')) || DEFAULT_FONT;
        setFontSize(current - 1);
    });

    document.getElementById('font-size-up')?.addEventListener('click', () => {
        const current = parseInt(htmlEl.getAttribute('data-font-size')) || DEFAULT_FONT;
        setFontSize(current + 1);
    });

    // ─── Sidebar Toggle ───
    const sidebar = document.getElementById('gw-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    const sidebarCollapsed = localStorage.getItem('gw-sidebar-collapsed') === 'true';
    if (sidebarCollapsed) sidebar?.classList.add('collapsed');

    sidebarToggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('collapsed');
        localStorage.setItem('gw-sidebar-collapsed', String(sidebar?.classList.contains('collapsed')));
    });

    // ─── Navbar Location Toggle (in sidebar) ───
    const navbar = document.getElementById('gw-navbar');
    const navbarLocationBtn = document.getElementById('navbar-location-btn');
    const navbarAtBottom = localStorage.getItem('gw-navbar-location') === 'bottom';
    if (navbarAtBottom) navbar?.classList.add('navbar-bottom');

    navbarLocationBtn?.addEventListener('click', () => {
        navbar?.classList.toggle('navbar-bottom');
        localStorage.setItem('gw-navbar-location', navbar?.classList.contains('navbar-bottom') ? 'bottom' : 'top');
    });

    // ─── Connection UI (browser demo) ───
    let connected = false;
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('status-text');
    const connectBtn = document.getElementById('connect-btn');

    connectBtn?.addEventListener('click', () => {
        connected = !connected;
        if (connected) {
            statusDot?.classList.remove('disconnected');
            statusDot?.classList.add('connected');
            statusText.textContent = 'Connected';
            connectBtn.textContent = 'Disconnect';
        } else {
            statusDot?.classList.remove('connected');
            statusDot?.classList.add('disconnected');
            statusText.textContent = 'Disconnected';
            connectBtn.textContent = 'Connect';
        }
    });
});
