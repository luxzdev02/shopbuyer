/* ========== THEME SYSTEM — Digital Pedia ========== */
(function(){
  const KEY = 'dp_theme';

  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(KEY, t);
  }

  // Apply immediately before paint to avoid flash
  // Default sekarang LIGHT (tema biru/putih FNB NOKOS OTP).
  const saved = localStorage.getItem(KEY) || 'light';
  applyTheme(saved);

  window.DP_THEME = {
    get: () => localStorage.getItem(KEY) || 'light',
    set: applyTheme,
    toggle: () => applyTheme(localStorage.getItem(KEY)==='dark' ? 'light' : 'dark'),
    isDark: () => (localStorage.getItem(KEY)||'light') === 'dark',
  };
})();
