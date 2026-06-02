/* ==========================================
   WISE App - JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initGreeting();
    initLockControls();
    initNavigation();
    initProfile();
    initBatteryAnimation();
});

// === Clock ===
function initClock() {
    const timeEl = document.getElementById('currentTime');
    if (!timeEl) return;
    
    function updateTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}`;
    }
    
    updateTime();
    setInterval(updateTime, 1000);
}

// === Dynamic Greeting ===
function initGreeting() {
    const greetingLabel = document.querySelector('.greeting-label');
    if (!greetingLabel) return;

    const now = new Date();
    const hour = now.getHours();
    
    let greeting = 'SELAMAT MALAM';
    if (hour >= 5 && hour < 11) greeting = 'SELAMAT PAGI';
    else if (hour >= 11 && hour < 15) greeting = 'SELAMAT SIANG';
    else if (hour >= 15 && hour < 18) greeting = 'SELAMAT SORE';
    
    greetingLabel.textContent = greeting;
}

// === Lock/Unlock & Realtime Log Engine ===
function initLockControls() {
    const btnLock = document.getElementById('btnLock');
    const btnUnlock = document.getElementById('btnUnlock');
    const lockStatus = document.getElementById('lockStatus');
    const glowRing = document.getElementById('glowRing');
    const carImage = document.getElementById('carImage');
    const logBody = document.getElementById('logBody');
    
    if (!btnLock || !btnUnlock) return;

    let isLocked = true;
    let isAnimating = false;

    // Fungsi mencetak log aktivitas secara realtime
    function addRealtimeLog(message, type = 'default') {
        if (!logBody) return;
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        
        const logRow = document.createElement('div');
        let classColor = 'text-muted';
        if (type === 'success') classColor = 'success-text';
        if (type === 'warning') classColor = 'warning-text';

        logRow.className = `log-row item-fade-in ${classColor}`;
        logRow.innerHTML = `Hari Ini, ${timestamp} - ${message}`;
        
        // Memasukkan log terbaru di bagian paling atas list log
        logBody.insertBefore(logRow, logBody.firstChild);
    }
    
    btnLock.addEventListener('click', () => {
        if (isLocked || isAnimating) return;
        isAnimating = true;
        
        addRipple(btnLock);
        isLocked = true;
        updateLockUI(true);
        animateLockAction('lock');

        // Mengirim instruksi ke Log secara Realtime seketika tombol diklik
        addRealtimeLog("Perintah Kunci: Memproses penguncian...", "default");
        
        setTimeout(() => {
            addRealtimeLog("Spion Terlipat: Selesai", "default");
            addRealtimeLog("Status Kendaraan: TERKUNCI (via aplikasi)", "warning");
            isAnimating = false;
        }, 350);
    });
    
    btnUnlock.addEventListener('click', () => {
        if (!isLocked || isAnimating) return;
        isAnimating = true;
        
        addRipple(btnUnlock);
        isLocked = false;
        updateLockUI(false);
        animateLockAction('unlock');

        // Mengirim instruksi ke Log secara Realtime seketika tombol diklik
        addRealtimeLog("Perintah Buka Kunci: Berhasil dikirim", "default");
        
        setTimeout(() => {
            addRealtimeLog("Spion Terbuka Otomatis: Selesai", "default");
            addRealtimeLog("Status Kendaraan: TERBUKA (via aplikasi)", "success");
            isAnimating = false;
        }, 350);
    });
    
    function updateLockUI(locked) {
        if (!lockStatus) return;
        const statusText = lockStatus.querySelector('.status-text');
        
        if (locked) {
            btnLock.classList.add('active');
            btnUnlock.classList.remove('active');
            lockStatus.classList.remove('unlocked');
            if (statusText) statusText.textContent = 'TERKUNCI';
        } else {
            btnLock.classList.remove('active');
            btnUnlock.classList.add('active');
            lockStatus.classList.add('unlocked');
            if (statusText) statusText.textContent = 'TERBUKA';
        }
    }
    
    function animateLockAction(action) {
        if (!glowRing) return;

        glowRing.style.animation = 'none';
        glowRing.offsetHeight; // Force reflow
        
        if (action === 'lock') {
            glowRing.style.borderColor = 'rgba(52, 211, 153, 0.3)';
            glowRing.style.boxShadow = '0 0 25px rgba(52, 211, 153, 0.15)';
            if (carImage) carImage.style.filter = 'drop-shadow(0 10px 10px rgba(0, 0, 0, 0.7)) brightness(0.8)';
        } else {
            glowRing.style.borderColor = 'rgba(232, 160, 32, 0.3)';
            glowRing.style.boxShadow = '0 0 25px rgba(232, 160, 32, 0.15)';
            if (carImage) carImage.style.filter = 'drop-shadow(0 10px 10px rgba(232, 160, 32, 0.1)) brightness(1.05)';
        }
        
        glowRing.style.animation = 'glow-pulse 2s ease-in-out infinite';
    }
}

// === Battery Pulse Loader ===
function initBatteryAnimation() {
    const batteryBar = document.getElementById('batteryBar');
    if (!batteryBar) return;
    
    batteryBar.style.width = '0%';
    setTimeout(() => {
        batteryBar.style.transition = 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
        batteryBar.style.width = '87%';
    }, 200);
}

// === Ripple Button Animation Effect ===
function addRipple(button) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute; width: 16px; height: 16px; border-radius: 50%;
        background: rgba(255, 255, 255, 0.25); animation: ripple 0.5s ease forwards;
        pointer-events: none; top: 50%; left: 50%; transform: translate(-50%, -50%);
    `;
    button.style.position = 'relative';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
}

// === Navigation Menu Handler ===
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const iconWrapper = item.querySelector('.nav-icon-wrapper');
            if (iconWrapper) {
                iconWrapper.style.animation = 'none';
                iconWrapper.offsetHeight;
                iconWrapper.style.animation = 'btnPress 0.2s ease';
            }
            showPageTransition();
        });
    });
}

function showPageTransition() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    mainContent.style.opacity = '0.5';
    setTimeout(() => { mainContent.style.opacity = '1'; }, 100);
}

// === Profile Management (Login/Logout) ===
function initProfile() {
    const profileBtn = document.getElementById('profileBtn');
    const profileDropdown = document.getElementById('profileDropdown');
    const overlay = document.getElementById('overlay');
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const loginPassword = document.getElementById('loginPassword');
    const dropdownLogin = document.getElementById('dropdownLogin');
    const dropdownLogged = document.getElementById('dropdownLogged');
    const profileIconDefault = document.getElementById('profileIconDefault');
    const profileAvatarText = document.getElementById('profileAvatarText');
    const loggedAvatar = document.getElementById('loggedAvatar');
    const loggedName = document.getElementById('loggedName');
    const loggedEmail = document.getElementById('loggedEmail');
    const btnLogout = document.getElementById('btnLogout');

    if (!profileBtn || !profileDropdown) return;

    profileBtn.addEventListener('click', () => {
        const isShow = profileDropdown.classList.toggle('show');
        if (overlay) overlay.classList.toggle('show', isShow);
    });

    if (overlay) {
        overlay.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
            overlay.classList.remove('show');
        });
    }

    if (togglePassword && loginPassword) {
        togglePassword.addEventListener('click', () => {
            loginPassword.type = loginPassword.type === 'password' ? 'text' : 'password';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail').value;
            const name = emailInput.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            const initial = name.charAt(0).toUpperCase();
            
            profileBtn.classList.add('logged-in');
            if (profileIconDefault) profileIconDefault.style.display = 'none';
            if (profileAvatarText) {
                profileAvatarText.textContent = initial;
                profileAvatarText.style.display = 'block';
            }
            
            if (loggedAvatar) loggedAvatar.textContent = initial;
            if (loggedName) loggedName.textContent = name;
            if (loggedEmail) loggedEmail.textContent = emailInput;
            
            if (dropdownLogin) dropdownLogin.style.display = 'none';
            if (dropdownLogged) dropdownLogged.style.display = 'block';
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            profileBtn.classList.remove('logged-in');
            if (profileIconDefault) profileIconDefault.style.display = 'block';
            if (profileAvatarText) profileAvatarText.style.display = 'none';
            if (dropdownLogin) dropdownLogin.style.display = 'block';
            if (dropdownLogged) dropdownLogged.style.display = 'none';
            if (loginForm) loginForm.reset();
        });
    }
}
