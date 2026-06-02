/* ==========================================
   WISE App - JavaScript
   Smart Vehicle Access Control
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
    
    let greeting;
    if (hour >= 5 && hour < 11) {
        greeting = 'SELAMAT PAGI';
    } else if (hour >= 11 && hour < 15) {
        greeting = 'SELAMAT SIANG';
    } else if (hour >= 15 && hour < 18) {
        greeting = 'SELAMAT SORE';
    } else {
        greeting = 'SELAMAT MALAM';
    }
    
    greetingLabel.textContent = greeting;
}

// === PERUBAHAN: Kontrol Lock/Unlock & Log Realtime ===
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

    // Fungsi utilitas untuk mencetak baris log baru secara realtime
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
        
        // Memasukkan log terbaru di bagian paling atas
        logBody.insertBefore(logRow, logBody.firstChild);
    }
    
    btnLock.addEventListener('click', () => {
        if (isLocked || isAnimating) return;
        isAnimating = true;
        
        addRipple(btnLock);
        btnLock.classList.add('pressing');
        
        isLocked = true;
        updateLockUI(true);
        animateLockAction('lock');

        // Simulasi Log Realtime Seketika saat Tombol Ditekan
        addRealtimeLog("Perintah Kunci: Memproses penguncian kendaraan...", "default");
        
        setTimeout(() => {
            addRealtimeLog("Spion Terlipat Otomatis: Selesai", "default");
            addRealtimeLog("Status Kendaraan: TERKUNCI (via aplikasi)", "warning");
            btnLock.classList.remove('pressing');
            isAnimating = false;
        }, 400);
    });
    
    btnUnlock.addEventListener('click', () => {
        if (!isLocked || isAnimating) return;
        isAnimating = true;
        
        addRipple(btnUnlock);
        btnUnlock.classList.add('pressing');
        
        isLocked = false;
        updateLockUI(false);
        animateLockAction('unlock');

        // Simulasi Log Realtime Seketika saat Tombol Ditekan
        addRealtimeLog("Perintah Buka Kunci: Berhasil dikirim", "default");
        
        setTimeout(() => {
            addRealtimeLog("Spion Terbuka: Selesai", "default");
            addRealtimeLog("Status Kendaraan: TERBUKA (via aplikasi)", "success");
            btnUnlock.classList.remove('pressing');
            isAnimating = false;
        }, 400);
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
            glowRing.style.borderColor = 'rgba(52, 211, 153, 0.4)';
            glowRing.style.boxShadow = '0 0 35px rgba(52, 211, 153, 0.2)';
            if (carImage) carImage.style.filter = 'drop-shadow(0 15px 12px rgba(0, 0, 0, 0.6)) brightness(0.8)';
        } else {
            glowRing.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            glowRing.style.boxShadow = '0 0 35px rgba(245, 158, 11, 0.2)';
            if (carImage) carImage.style.filter = 'drop-shadow(0 15px 12px rgba(232, 160, 32, 0.15)) brightness(1.1)';
        }
        
        glowRing.style.animation = 'glow-pulse 2s ease-in-out infinite';
    }
}

// === Battery Pulse Animation Interaction ===
function initBatteryAnimation() {
    const batteryBar = document.getElementById('batteryBar');
    if (!batteryBar) return;
    
    batteryBar.style.width = '0%';
    setTimeout(() => {
        batteryBar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
        batteryBar.style.width = '87%';
    }, 300);
}

// === Ripple Effect ===
function addRipple(button) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        animation: ripple 0.6s ease forwards;
        pointer-events: none;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    `;
    button.style.position = 'relative';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// === Navigation & Transitions ===
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
                iconWrapper.style.animation = 'btnPress 0.3s ease';
            }
            
            const page = item.dataset.page;
            showPageTransition(page);
        });
    });
}

function showPageTransition(page) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        mainContent.style.transition = 'all 0.3s ease';
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateY(0)';
    }, 150);
}

// === Profile Management ===
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
    const loginError = document.getElementById('loginError');

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
            const isPassword = loginPassword.type === 'password';
            loginPassword.type = isPassword ? 'text' : 'password';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('loginEmail').value;
            
            if (isValidEmail(emailInput)) {
                if (loginError) loginError.textContent = '';
                const name = extractNameFromEmail(emailInput);
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
                
                showToast('Berhasil masuk ke akun Anda!', 'success');
            } else {
                showLoginError('Format email tidak valid.');
            }
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
            
            showToast('Anda telah keluar.', 'info');
        });
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function extractNameFromEmail(email) {
        const localPart = email.split('@')[0];
        return localPart
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }
}

// === Toast System ===
function showToast(message, type = 'info') {
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: #111D2E;
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        opacity: 0;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 1px solid rgba(232, 160, 32, 0.2);
    `;
    
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 50);
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
