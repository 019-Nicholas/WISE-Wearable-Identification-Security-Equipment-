document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initLockControls();
    initNavigation();
    initProfile();
});

// === Clock ===
function initClock() {
    const timeEl = document.getElementById('currentTime');
    if (!timeEl) return;
    function updateTime() {
        const now = new Date();
        timeEl.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    }
    updateTime();
    setInterval(updateTime, 1000);
}

// === Navigation Menu Switcher ===
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPageId = 'page' + item.getAttribute('data-page').charAt(0).toUpperCase() + item.getAttribute('data-page').slice(1);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(page => {
                if (page.id === targetPageId) {
                    page.style.display = 'block';
                } else {
                    page.style.display = 'none';
                }
            });
        });
    });
}

// === Lock/Unlock Engine & Log Realtime Writer ===
function initLockControls() {
    const btnLock = document.getElementById('btnLock');
    const btnUnlock = document.getElementById('btnUnlock');
    const lockStatus = document.getElementById('lockStatus');
    const logBody = document.getElementById('logBody');
    
    if (!btnLock || !btnUnlock) return;

    function addLog(message, type = 'default') {
        if (!logBody) return;
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const logRow = document.createElement('div');
        let classColor = 'text-muted';
        if (type === 'success') classColor = 'success-text';
        if (type === 'warning') classColor = 'warning-text';

        logRow.className = `log-row ${classColor}`;
        logRow.innerHTML = `[${timestamp}] - ${message}`;
        logBody.insertBefore(logRow, logBody.firstChild);
    }
    
    btnLock.addEventListener('click', () => {
        btnLock.classList.add('active');
        btnUnlock.classList.remove('active');
        lockStatus.classList.remove('unlocked');
        lockStatus.querySelector('.status-text').textContent = 'TERKUNCI';
        addLog("Sistem mendeteksi perintah kunci: Mengunci seluruh pintu.", "warning");
    });
    
    btnUnlock.addEventListener('click', () => {
        btnLock.classList.remove('active');
        btnUnlock.classList.add('active');
        lockStatus.classList.add('unlocked');
        lockStatus.querySelector('.status-text').textContent = 'TERBUKA';
        addLog("Akses diverifikasi: Kunci pintu kendaraan berhasil dibuka.", "success");
    });
}

// === Profile Management (Clean Login Flow) ===
function initProfile() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const overlay = document.getElementById('overlay');
    const loginForm = document.getElementById('loginForm');
    const dropdownLogin = document.getElementById('dropdownLogin');
    const dropdownLogged = document.getElementById('dropdownLogged');
    const profileIconDefault = document.getElementById('profileIconDefault');
    const profileAvatarText = document.getElementById('profileAvatarText');
    const loggedAvatar = document.getElementById('loggedAvatar');
    const loggedName = document.getElementById('loggedName');
    const loggedEmail = document.getElementById('loggedEmail');
    const btnLogout = document.getElementById('btnLogout');

    profileBtn.addEventListener('click', () => {
        profileDropdown.classList.toggle('show');
        overlay.classList.toggle('show');
    });

    overlay.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
        overlay.classList.remove('show');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('loginEmail').value;
        const name = emailInput.split('@')[0].toUpperCase();
        const initial = name.charAt(0);
        
        profileBtn.classList.add('logged-in');
        profileIconDefault.style.display = 'none';
        profileAvatarText.textContent = initial;
        profileAvatarText.style.display = 'block';
        
        loggedAvatar.textContent = initial;
        loggedName.textContent = name;
        loggedEmail.textContent = emailInput;
        
        dropdownLogin.style.display = 'none';
        dropdownLogged.style.display = 'block';
        
        profileDropdown.classList.remove('show');
        overlay.classList.remove('show');
    });

    btnLogout.addEventListener('click', () => {
        profileBtn.classList.remove('logged-in');
        profileIconDefault.style.display = 'block';
        profileAvatarText.style.display = 'none';
        dropdownLogin.style.display = 'block';
        dropdownLogged.style.display = 'none';
        loginForm.reset();
        
        profileDropdown.classList.remove('show');
        overlay.classList.remove('show');
    });
}
