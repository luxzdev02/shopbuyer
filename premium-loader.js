// ========== PREMIUM LOADING SCREEN ==========
// Tampil di awal tiap halaman: logo (dari /api/watermark) + ring orbit animasi
// + counter persen, lalu fade-out begitu halaman selesai load.
// Taruh <script src="/premium-loader.js"></script> sebagai elemen PERTAMA
// di dalam <body>, sebelum konten lain, biar tampil duluan.
(function () {
  if (document.getElementById('dpLoader')) return; // sudah ada, jangan dobel

  var isDark = false;
  try { isDark = (localStorage.getItem('dp_theme') || 'light') === 'dark'; } catch (e) {}

  var bg = isDark
    ? 'radial-gradient(circle at 25% 20%,rgba(59,130,246,.14),transparent 55%),' +
      'radial-gradient(circle at 80% 85%,rgba(56,189,248,.10),transparent 55%),#0B1220'
    : 'radial-gradient(circle at 25% 20%,rgba(59,130,246,.10),transparent 55%),' +
      'radial-gradient(circle at 80% 85%,rgba(56,189,248,.10),transparent 55%),#ffffff';
  var ringBg   = isDark ? '#1F2937' : '#e5edfb';
  var logoBg   = isDark ? '#111827' : '#f0f6ff';
  var logoBorder = isDark ? '#253044' : '#e5edfb';
  var orbitBorder = isDark ? '#2b3a54' : '#cfe0fc';
  var pctColor = isDark ? '#E6EDF3' : '#0f172a';
  var nameColor = isDark ? '#94A3B8' : '#94a3b8';

  var style = document.createElement('style');
  style.textContent = [
    '#dpLoader{position:fixed;inset:0;z-index:999999;',
    'background:' + bg + ';',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;',
    'transition:opacity .4s ease,visibility .4s ease;}',
    '#dpLoader.dpHide{opacity:0;visibility:hidden;pointer-events:none;}',
    '.dpLoaderRing{position:relative;width:104px;height:104px;margin-bottom:22px;}',
    '.dpLoaderRing svg{width:100%;height:100%;transform:rotate(-90deg);}',
    '.dpLoaderRing circle{fill:none;stroke-width:4;}',
    '.dpLoaderRing .dpBg{stroke:' + ringBg + ';}',
    '.dpLoaderRing .dpFg{stroke:#3B82F6;stroke-linecap:round;transition:stroke-dashoffset .2s linear;}',
    '.dpLoaderLogo{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);',
    'width:68px;height:68px;border-radius:50%;overflow:hidden;',
    'border:1px solid ' + logoBorder + ';box-shadow:0 8px 24px rgba(37,99,235,.16);background:' + logoBg + ';',
    'display:flex;align-items:center;justify-content:center;}',
    '.dpLoaderLogo img{width:100%;height:100%;object-fit:cover;display:none;}',
    '.dpLoaderLogo img.dpShow{display:block;}',
    '.dpLoaderFallback{font-size:22px;font-weight:900;color:#3B82F6;font-family:"Plus Jakarta Sans",sans-serif;}',
    '.dpLoaderFallback.dpGone{display:none;}',
    '.dpLoaderOrbit{position:absolute;inset:-9px;border-radius:50%;',
    'border:2px dashed ' + orbitBorder + ';animation:dpOrbitSpin 3s linear infinite;}',
    '.dpLoaderOrbit::before{content:"";position:absolute;top:-4px;left:50%;transform:translateX(-50%);',
    'width:9px;height:9px;border-radius:50%;background:#3B82F6;box-shadow:0 0 10px 2px rgba(59,130,246,.55);}',
    '@keyframes dpOrbitSpin{to{transform:rotate(360deg);}}',
    '.dpLoaderPct{font-family:"Plus Jakarta Sans",sans-serif;font-size:15px;font-weight:800;color:' + pctColor + ';letter-spacing:.02em;}',
    '.dpLoaderName{font-family:"Plus Jakarta Sans",sans-serif;font-size:11px;font-weight:700;color:' + nameColor + ';',
    'margin-top:6px;letter-spacing:.08em;text-transform:uppercase;}'
  ].join('');
  document.head.appendChild(style);

  var CIRC = 2 * Math.PI * 50;
  var html =
    '<div id="dpLoader">' +
      '<div class="dpLoaderRing">' +
        '<div class="dpLoaderOrbit"></div>' +
        '<svg viewBox="0 0 110 110">' +
          '<circle class="dpBg" cx="55" cy="55" r="50"></circle>' +
          '<circle class="dpFg" id="dpLoaderCircle" cx="55" cy="55" r="50" ' +
            'stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"></circle>' +
        '</svg>' +
        '<div class="dpLoaderLogo">' +
          '<span class="dpLoaderFallback" id="dpLoaderFallback">D</span>' +
          '<img id="dpLoaderImg" alt="Logo">' +
        '</div>' +
      '</div>' +
      '<div class="dpLoaderPct" id="dpLoaderPct">0%</div>' +
      '<div class="dpLoaderName" id="dpLoaderName">Memuat...</div>' +
    '</div>';
  document.body.insertAdjacentHTML('afterbegin', html);

  // ── Logo: preload di background, baru ditampilkan kalau BENAR-BENAR berhasil.
  // Gagal/lambat/network error → tetap fallback huruf inisial, TIDAK PERNAH nunjukin ikon broken-image. ──
  function applyLogo(url, name) {
    if (!url) return;
    var probe = new Image();
    probe.onload = function () {
      var img = document.getElementById('dpLoaderImg');
      var fb = document.getElementById('dpLoaderFallback');
      if (!img) return;
      img.src = url;
      img.classList.add('dpShow');
      if (fb) fb.classList.add('dpGone');
    };
    probe.onerror = function () { /* biarkan fallback huruf inisial yang tampil */ };
    probe.src = url;
    var fbEl = document.getElementById('dpLoaderFallback');
    if (fbEl && name) fbEl.textContent = name.trim().charAt(0).toUpperCase() || 'D';
  }

  // Ambil logo + nama web dari watermark.json (live, ikut apa yang admin set).
  // Disimpan juga ke window.DP_WATERMARK + event 'dpwatermarkready' biar
  // halaman lain (header, sidebar, dst) bisa ikut pakai tanpa fetch ulang.
  fetch('/api/watermark').then(function (r) { return r.json(); }).then(function (res) {
    if (res && res.data) {
      var name = document.getElementById('dpLoaderName');
      if (name && res.data.site_name) name.textContent = res.data.site_name;
      applyLogo(res.data.logo_url, res.data.site_name);
      window.DP_WATERMARK = res.data;
      document.dispatchEvent(new CustomEvent('dpwatermarkready', { detail: res.data }));
    }
  }).catch(function () { /* offline/gagal → tetap fallback huruf, jangan pernah nyangkut */ });

  // ── Progress LINEAR (konstan), bukan easing yang melambat ──
  var pct = 0;
  var circle = document.getElementById('dpLoaderCircle');
  var pctEl = document.getElementById('dpLoaderPct');

  function setProgress(p) {
    pct = Math.min(p, 100);
    pctEl.textContent = Math.round(pct) + '%';
    circle.style.strokeDashoffset = CIRC - (CIRC * pct / 100);
  }

  var timer = setInterval(function () {
    setProgress(Math.min(pct + 3, 90)); // naik rata 3%/40ms, ditahan di 90% sampai halaman beneran selesai
  }, 40);

  var finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    clearInterval(timer);
    setProgress(100);
    setTimeout(function () {
      var loader = document.getElementById('dpLoader');
      if (loader) {
        loader.classList.add('dpHide');
        setTimeout(function () { loader.remove(); }, 450);
      }
    }, 200);
  }

  if (document.readyState === 'complete') {
    finish();
  } else {
    window.addEventListener('load', finish);
  }
  setTimeout(finish, 4000); // safety net biar gak nyangkut kalau ada resource gagal load
})();
