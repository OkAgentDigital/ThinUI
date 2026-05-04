import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWindow } from '@tauri-apps/api/window';

// ─── Gift Wrapper UI Controls ───

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎁 Gift Wrapper initialized');

    // ─── Window Controls ───
    try {
        const appWindow = getCurrentWindow();
        document.getElementById('minimize-btn')?.addEventListener('click', () => {
            try { appWindow.minimize(); } catch (e) { console.error('Minimize failed:', e); }
        });
        document.getElementById('maximize-btn')?.addEventListener('click', () => {
            try { appWindow.toggleMaximize(); } catch (e) { console.error('Maximize failed:', e); }
        });
        document.getElementById('close-btn')?.addEventListener('click', () => {
            try { appWindow.close(); } catch (e) { console.error('Close failed:', e); }
        });
    } catch (e) {
        console.error('Window API not available:', e);
        document.querySelectorAll('.titlebar-btn').forEach(btn => btn.style.display = 'none');
    }

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

    // Restore theme — default to dark
    const savedTheme = localStorage.getItem('gw-theme') || 'dark';
    setTheme(savedTheme === 'dark');

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        setTheme(!htmlEl.classList.contains('dark'));
    });

    // ─── Font Size Controls ───
    const MIN_FONT = 0;
    const MAX_FONT = 4;
    const DEFAULT_FONT = 2; // 14px

    function setFontSize(level) {
        const clamped = Math.max(MIN_FONT, Math.min(MAX_FONT, level));
        htmlEl.setAttribute('data-font-size', clamped);
        localStorage.setItem('gw-font-size', clamped);
    }

    // Restore font size
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

    // Restore sidebar state
    const sidebarCollapsed = localStorage.getItem('gw-sidebar-collapsed') === 'true';
    if (sidebarCollapsed) sidebar?.classList.add('collapsed');

    sidebarToggle?.addEventListener('click', () => {
        sidebar?.classList.toggle('collapsed');
        const isCollapsed = sidebar?.classList.contains('collapsed');
        localStorage.setItem('gw-sidebar-collapsed', isCollapsed);
    });

    // ─── Navbar Location Toggle (top/bottom) ───
    const navbar = document.getElementById('gw-navbar');
    const navbarLocationBtn = document.getElementById('navbar-location-btn');

    // Restore navbar location
    const navbarAtBottom = localStorage.getItem('gw-navbar-location') === 'bottom';
    if (navbarAtBottom) navbar?.classList.add('navbar-bottom');

    navbarLocationBtn?.addEventListener('click', () => {
        navbar?.classList.toggle('navbar-bottom');
        const isBottom = navbar?.classList.contains('navbar-bottom');
        localStorage.setItem('gw-navbar-location', isBottom ? 'bottom' : 'top');
    });

    // ─── Navbar Auto-Hide ───
    const autoHideCheckbox = document.getElementById('navbar-auto-hide');
    let navbarAutoHide = true;
    let navbarHideTimeout;

    // Restore auto-hide preference
    const autoHidePref = localStorage.getItem('gw-navbar-auto-hide');
    if (autoHidePref !== null) {
        navbarAutoHide = autoHidePref === 'true';
        if (autoHideCheckbox) autoHideCheckbox.checked = navbarAutoHide;
    }

    function updateNavbarVisibility(show) {
        if (!navbarAutoHide) return;
        if (show) {
            navbar?.classList.remove('navbar-hidden');
            clearTimeout(navbarHideTimeout);
            navbarHideTimeout = setTimeout(() => {
                if (!navbar?.matches(':hover')) {
                    navbar?.classList.add('navbar-hidden');
                }
            }, 2000);
        } else {
            navbarHideTimeout = setTimeout(() => {
                navbar?.classList.add('navbar-hidden');
            }, 2000);
        }
    }

    // Show navbar on mouse move near top/bottom
    window.addEventListener('mousemove', (e) => {
        if (!navbarAutoHide) return;
        const isBottom = navbar?.classList.contains('navbar-bottom');
        const threshold = 60;
        if (isBottom) {
            if (window.innerHeight - e.clientY < threshold) {
                navbar?.classList.remove('navbar-hidden');
                clearTimeout(navbarHideTimeout);
                navbarHideTimeout = setTimeout(() => {
                    navbar?.classList.add('navbar-hidden');
                }, 2000);
            }
        } else {
            if (e.clientY < threshold + 44) {
                navbar?.classList.remove('navbar-hidden');
                clearTimeout(navbarHideTimeout);
                navbarHideTimeout = setTimeout(() => {
                    navbar?.classList.add('navbar-hidden');
                }, 2000);
            }
        }
    });

    // Keep navbar visible on hover
    navbar?.addEventListener('mouseenter', () => {
        clearTimeout(navbarHideTimeout);
    });

    navbar?.addEventListener('mouseleave', () => {
        if (navbarAutoHide) {
            navbarHideTimeout = setTimeout(() => {
                navbar?.classList.add('navbar-hidden');
            }, 1000);
        }
    });

    // Show/hide based on content scroll
    let lastScrollY = 0;
    const appContainer = document.getElementById('app');
    appContainer?.addEventListener('scroll', () => {
        if (!navbarAutoHide) return;
        const scrollY = appContainer.scrollTop;
        if (scrollY < 50) {
            navbar?.classList.remove('navbar-hidden');
            clearTimeout(navbarHideTimeout);
        } else if (scrollY > lastScrollY) {
            // Scrolling down - hide
            navbar?.classList.add('navbar-hidden');
        } else {
            // Scrolling up - show
            navbar?.classList.remove('navbar-hidden');
            clearTimeout(navbarHideTimeout);
            navbarHideTimeout = setTimeout(() => {
                navbar?.classList.add('navbar-hidden');
            }, 2000);
        }
        lastScrollY = scrollY;
    });

    // Auto-hide checkbox toggle
    autoHideCheckbox?.addEventListener('change', () => {
        navbarAutoHide = autoHideCheckbox.checked;
        localStorage.setItem('gw-navbar-auto-hide', navbarAutoHide);
        if (!navbarAutoHide) {
            navbar?.classList.remove('navbar-hidden');
            clearTimeout(navbarHideTimeout);
        } else {
            // Start with visible, then auto-hide
            navbar?.classList.remove('navbar-hidden');
            clearTimeout(navbarHideTimeout);
            navbarHideTimeout = setTimeout(() => {
                navbar?.classList.add('navbar-hidden');
            }, 2000);
        }
    });

    // Initial auto-hide setup
    if (navbarAutoHide) {
        clearTimeout(navbarHideTimeout);
        navbarHideTimeout = setTimeout(() => {
            navbar?.classList.add('navbar-hidden');
        }, 3000);
    }

    // ─── Connection handling ───
    let connected = false;
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('status-text');
    const connectBtn = document.getElementById('connect-btn');

    async function connectToCore() {
        try {
            await invoke('connect_core');
            connected = true;
            statusDot?.classList.remove('disconnected');
            statusDot?.classList.add('connected');
            statusText.textContent = 'Connected';
            connectBtn.textContent = 'Disconnect';
            connectBtn.style.background = 'var(--gw-danger)';
        } catch (err) {
            console.error('Connection failed:', err);
            statusText.textContent = 'Connection failed';
            setTimeout(() => {
                if (!connected) statusText.textContent = 'Disconnected';
            }, 3000);
        }
    }

    async function disconnectFromCore() {
        await invoke('disconnect');
        connected = false;
        statusDot?.classList.remove('connected');
        statusDot?.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
        connectBtn.textContent = 'Connect';
        connectBtn.style.background = '';
    }

    connectBtn?.addEventListener('click', () => {
        if (connected) disconnectFromCore();
        else connectToCore();
    });

    // ─── Dashboard Loading ───
    async function loadDashboard() {
        try {
            const udx = await invoke('load_udx_from_vault', { filename: 'gauge-demo.udx' });
            renderDashboard(udx);
        } catch (err) {
            console.log('Gauge demo not found:', err);
            try {
                const udx = await invoke('load_udx_from_vault', { filename: 'dashboard.udx' });
                renderDashboard(udx);
            } catch (err2) {
                console.error('Failed to load dashboard:', err2);
                document.getElementById('app').innerHTML = '<div class="loading">Dashboard not found.</div>';
            }
        }
    }

    function renderDashboard(udx) {
        let html = `<h1>${udx.title}</h1>`;
        if (udx.description) html += `<p>${udx.description}</p>`;
        if (udx.blocks) {
            for (const block of udx.blocks) {
                if (block.type === 'teletext-page') {
                    html += `<div class="teletext-page"><pre>${block.extra.content || ''}</pre></div>`;
                } else if (block.type === 'list') {
                    html += `<div class="teletext-list"><pre>${block.extra.items || ''}</pre></div>`;
                } else if (block.type === 'gauge') {
                    html += renderGauge(block.extra);
                } else {
                    html += `<div class="teletext-block">${JSON.stringify(block)}</div>`;
                }
            }
        }
        document.getElementById('app').innerHTML = html;
    }

    function renderGauge(extra) {
        const value = Math.min(100, Math.max(0, extra.value || 0));
        const label = extra.label || 'Metric';
        const units = extra.units || '';
        return `
            <div class="gauge-plugin">
                <div class="gauge-label">${label}</div>
                <div class="gauge-container">
                    <div class="gauge-fill" style="width: ${value}%"></div>
                </div>
                <div class="gauge-value">${value}${units}</div>
            </div>
        `;
    }

    // ─── Core Events ───
    listen('core-event', (event) => {
        const payload = event.payload.data;
        console.log('Core event:', payload);
    });

    // ─── Tauri readiness check ───
    if (typeof window.__TAURI__ !== 'undefined') {
        loadDashboard();
    } else {
        // Keep the static demo content from HTML
    }
});
