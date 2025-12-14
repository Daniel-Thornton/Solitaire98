// Desktop and Window Management
(function() {
    let isDragging = false;
    let currentWindow = null;
    let offsetX = 0;
    let offsetY = 0;
    let isMaximized = false;

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        initializeDesktop();
        initializeWindow();
        initializeTaskbar();
        updateClock();
        setInterval(updateClock, 1000);
    });

    function initializeDesktop() {
        // Desktop icon functionality
        const desktopIcons = document.querySelectorAll('.desktop-icon');
        
        desktopIcons.forEach(icon => {
            // Single click to select
            icon.addEventListener('click', (e) => {
                desktopIcons.forEach(i => i.classList.remove('selected'));
                icon.classList.add('selected');
            });

            // Double click to open
            icon.addEventListener('dblclick', () => {
                const app = icon.dataset.app;
                if (app === 'solitaire') {
                    openWindow('solitaire-window');
                } else if (app === 'win-animation') {
                    triggerWinAnimation();
                }
            });
        });

        // Click on desktop to deselect icons
        document.querySelector('.desktop').addEventListener('click', (e) => {
            if (e.target.classList.contains('desktop')) {
                desktopIcons.forEach(i => i.classList.remove('selected'));
            }
        });
    }

    function initializeWindow() {
        const window = document.getElementById('solitaire-window');
        const titleBar = document.getElementById('title-bar');
        const minimizeBtn = document.getElementById('minimize-btn');
        const maximizeBtn = document.getElementById('maximize-btn');
        const closeBtn = document.getElementById('close-btn');

        // Make window draggable
        titleBar.addEventListener('mousedown', startDragging);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);

        // Double-click title bar to maximize/restore
        titleBar.addEventListener('dblclick', (e) => {
            if (e.target === titleBar || e.target.classList.contains('title-bar-text')) {
                toggleMaximize();
            }
        });

        // Window control buttons
        minimizeBtn.addEventListener('click', () => minimizeWindow('solitaire-window'));
        maximizeBtn.addEventListener('click', toggleMaximize);
        closeBtn.addEventListener('click', () => closeWindow('solitaire-window'));
    }

    function startDragging(e) {
        if (e.target.closest('.title-bar-controls')) return;
        if (isMaximized) return;

        isDragging = true;
        currentWindow = document.getElementById('solitaire-window');
        
        const rect = currentWindow.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        currentWindow.style.cursor = 'move';
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging || !currentWindow) return;

        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        // Keep window within screen bounds
        const maxX = window.innerWidth - currentWindow.offsetWidth;
        const maxY = window.innerHeight - currentWindow.offsetHeight - 32; // Account for taskbar

        currentWindow.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        currentWindow.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        currentWindow.style.transform = 'none';
    }

    function stopDragging() {
        if (isDragging) {
            isDragging = false;
            if (currentWindow) {
                currentWindow.style.cursor = 'default';
            }
            currentWindow = null;
        }
    }

    function toggleMaximize() {
        const window = document.getElementById('solitaire-window');
        
        if (isMaximized) {
            // Restore
            window.classList.remove('maximized');
            window.style.left = '50%';
            window.style.top = '50%';
            window.style.transform = 'translate(-50%, -50%)';
            isMaximized = false;
        } else {
            // Maximize
            window.classList.add('maximized');
            isMaximized = true;
        }
    }

    function minimizeWindow(windowId) {
        const window = document.getElementById(windowId);
        window.classList.add('minimized');
        
        // Update taskbar button
        const taskbarBtn = document.querySelector(`[data-window="${windowId}"]`);
        if (taskbarBtn) {
            taskbarBtn.classList.remove('active');
        }
    }

    function openWindow(windowId) {
        const window = document.getElementById(windowId);
        window.classList.remove('minimized');
        
        // Update taskbar button
        const taskbarBtn = document.querySelector(`[data-window="${windowId}"]`);
        if (taskbarBtn) {
            taskbarBtn.classList.add('active');
        }
    }

    function closeWindow(windowId) {
        const window = document.getElementById(windowId);
        window.classList.add('minimized');
        
        // Update taskbar button
        const taskbarBtn = document.querySelector(`[data-window="${windowId}"]`);
        if (taskbarBtn) {
            taskbarBtn.classList.remove('active');
            taskbarBtn.style.display = 'none';
        }
    }

    function initializeTaskbar() {
        // Taskbar app buttons
        const taskbarApps = document.querySelectorAll('.taskbar-app');
        
        taskbarApps.forEach(btn => {
            btn.addEventListener('click', () => {
                const windowId = btn.dataset.window;
                const window = document.getElementById(windowId);
                
                if (window.classList.contains('minimized')) {
                    openWindow(windowId);
                } else {
                    minimizeWindow(windowId);
                }
            });
        });

        // Start button (placeholder)
        const startBtn = document.querySelector('.start-button');
        startBtn.addEventListener('click', () => {
            alert('Start menu not implemented yet!');
        });
    }

    function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        
        const timeString = `${displayHours}:${minutes} ${ampm}`;
        
        const clockElement = document.getElementById('tray-time');
        if (clockElement) {
            clockElement.textContent = timeString;
        }
    }

    function triggerWinAnimation() {
        // Clear any existing animation
        const container = document.getElementById('win-animation');
        container.innerHTML = '';
        
        // Trigger the animation using the game's method
        if (window.game && window.game.startCardCascade) {
            window.game.startCardCascade(container);
        }
    }

    // Make functions available globally if needed
    window.desktopManager = {
        openWindow,
        closeWindow,
        minimizeWindow,
        toggleMaximize,
        triggerWinAnimation
    };
})();
