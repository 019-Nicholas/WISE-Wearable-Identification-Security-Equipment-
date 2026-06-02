document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initLockControls();
    initNavigation();
    initProfile();
});

// === Realtime Clock ===
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

// === Navigation Switch Router ===
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page-content');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = 'page' + item.getAttribute('data-page').charAt(0).toUpperCase() + item.getAttribute('data-page').slice(1);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(page => {
                page.style.display = (page.id === target) ? 'block' : 'none';
            });
        });
    });
}

// === Lock Engine Outputs Directing To Logs Page ===
function initLockControls() {
    const btnLock = document.getElementById('btnLock');
    const btnUnlock = document.getElementById('btnUnlock');
    const lockStatus = document.getElementById('lockStatus');
    const logBody = document.getElementById('logBody');
    
    if (!btnLock || !btnUnlock) return;

    function addLogRecord(message, statusType = 'default') {
        if (!logBody) return;
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const row = document.createElement('div');
        let modifierClass = 'text-muted';
        if (statusType === 'success') modifierClass = 'success-text';
        if (statusType === 'warning') modifierClass = 'warning-text';

        row.className = `log-row ${modifierClass}`;
        row.innerHTML = `Hari Ini, ${timestamp} - ${message}`;
        
        logBody.insertBefore(row, logBody.firstChild);
    }
    
    btnLock.addEventListener('click', () => {
        btnLock.classList.add('active');
        btnUnlock.classList.remove('active');
        lockStatus.classList.remove('unlocked');
        lockStatus.querySelector('.status-text').textContent = 'TERKUNCI';
        addLogRecord("Status Kendaraan: TERKUNCI (via aplikasi)", "warning");
    });
    
    btnUnlock.addEventListener('click', () => {
        btnLock.classList.remove('active');
        btnUnlock.classList.add('active');
        lockStatus.classList.add('unlocked');
        lockStatus.querySelector('.status-text').textContent = 'TERBUKA';
        addLogRecord("Status Kendaraan: TERBUKA (via aplikasi)", "success");
    });
}

// === Profile Management Component ===
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
        const email = document.getElementById('loginEmail').value;
        const nameClean = email.split('@')[0].toUpperCase();
        const firstLetter = nameClean.charAt(0);
        
        profileBtn.classList.add('logged-in');
        profileIconDefault.style.display = 'none';
        profileAvatarText.textContent = firstLetter;
        profileAvatarText.style.display = 'block';
        
        loggedAvatar.textContent = firstLetter;
        loggedName.textContent = nameClean;
        loggedEmail.textContent = email;
        
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