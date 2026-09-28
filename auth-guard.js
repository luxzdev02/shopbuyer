/**
 * auth-guard.js — FNB NOKOS
 * Cek ban status setiap 30 detik + saat halaman dibuka.
 * Jika akun di-ban: hapus sesi → redirect ke login.
 */

(function () {
  const CHECK_INTERVAL = 30 * 1000; // 30 detik
  let guardTimer = null;
  let banOverlay = null;

  // ── Ambil user dari localStorage ──────────────────────────────────
  function getStoredUser() {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // ── Bersihkan sesi & redirect ke login ────────────────────────────
  function forceLogout(message) {
    clearInterval(guardTimer);
    localStorage.removeItem('user');
    sessionStorage.clear();

    // Tampilkan overlay ban sebelum redirect
    showBanOverlay(message || 'Akun Anda telah dinonaktifkan oleh admin.');
  }

  // ── Overlay merah "Akun Dibanned" ─────────────────────────────────
  function showBanOverlay(message) {
    // Jangan buat 2x
    if (banOverlay) return;

    banOverlay = document.createElement('div');
    banOverlay.style.cssText = [
      'position:fixed', 'inset:0', 'z-index:99999',
      'background:rgba(15,23,42,0.95)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'flex-direction:column', 'gap:16px',
      'padding:32px', 'text-align:center',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'backdrop-filter:blur(8px)'
    ].join(';');

    banOverlay.innerHTML = `
      <div style="font-size:52px;line-height:1;">🚫</div>
      <div style="font-size:20px;font-weight:800;color:#f87171;">Akun Dinonaktifkan</div>
      <div style="font-size:14px;color:#94a3b8;max-width:320px;line-height:1.6;">${escHtml(message)}</div>
      <button onclick="window.location.href='login'"
        style="margin-top:8px;padding:13px 32px;border-radius:12px;
               background:linear-gradient(135deg,#ef4444,#dc2626);
               color:#fff;border:none;font-size:15px;font-weight:700;
               cursor:pointer;box-shadow:0 6px 20px rgba(239,68,68,.4);">
        Kembali ke Login
      </button>
    `;

    document.body.appendChild(banOverlay);

    // Auto redirect setelah 3 detik
    setTimeout(() => { window.location.href = 'login'; }, 3000);
  }

  function escHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ── Cek ke server ─────────────────────────────────────────────────
  async function checkSession() {
    const user = getStoredUser();
    if (!user || !user.id) return; // Tidak login, skip

    try {
      const res = await fetch('/api/session/check?user_id=' + user.id);
      if (res.status === 403) {
        const data = await res.json().catch(() => ({}));
        forceLogout(data.message || 'Akun Anda telah dinonaktifkan oleh admin.');
      }
      // 200 → session valid, lanjut
    } catch (e) {
      // Network error → jangan logout, bisa saja server sebentar down
    }
  }

  // ── Cek apakah device ini di-"Logout Paksa" dari device lain ──────
  async function checkDeviceSession() {
    const sessionId = localStorage.getItem('session_id');
    if (!sessionId) return; // Sesi lama sebelum fitur ini ada — skip, jangan paksa logout

    try {
      const res = await fetch('/api/sessions/check/' + sessionId);
      const data = await res.json().catch(() => ({}));
      if (data && data.valid === false) {
        clearInterval(guardTimer);
        localStorage.removeItem('user');
        localStorage.removeItem('session_id');
        sessionStorage.clear();
        showBanOverlay('Perangkat ini sudah logout dari perangkat lain.');
      }
    } catch (e) {
      // Network error → jangan logout
    }
  }

  // ── Init ──────────────────────────────────────────────────────────
  function init() {
    const user = getStoredUser();
    if (!user || !user.id) return; // Bukan halaman yang butuh auth

    // Cek langsung saat halaman dibuka
    checkSession();
    checkDeviceSession();

    // Cek berkala setiap 30 detik
    guardTimer = setInterval(() => { checkSession(); checkDeviceSession(); }, CHECK_INTERVAL);

    // Cek juga saat tab menjadi aktif lagi (user buka tab lama)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') { checkSession(); checkDeviceSession(); }
    });
  }

  // Tunggu DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
