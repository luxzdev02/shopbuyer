// ===== GLOBAL BACKGROUND THEME (bg-theme.js) =====
// Tambahkan <script src="/bg-theme.js"></script> di semua halaman
// Akan otomatis set background hitam atau putih tanpa mengubah elemen lain

(async function applyBgTheme() {
  try {
    const res = await fetch('/api/bg');
    const data = await res.json();
    const color = data.color;
    if (color === 'white' || color === 'light') {
      document.documentElement.style.setProperty('--bg-override', '#ffffff');
      document.body.style.backgroundColor = '#ffffff';
      document.documentElement.setAttribute('data-bg', 'white');
    } else {
      // black / dark (default)
      // no override, let existing CSS handle it
    }
  } catch(e) {
    // Silently fail — no bg override
  }
})();
