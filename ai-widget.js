// ========== AI SUPPORT — FLOATING WIDGET ==========
// Tombol bulat mengambang di kanan bawah, mengarah ke /ai (AI Support chat).
// Cukup include <script src="/ai-widget.js"></script> di halaman manapun.
(function () {
  if (document.getElementById('dpAiWidgetBtn')) return; // sudah ada, jangan dobel
  if (/\/ai\/?$/.test(location.pathname)) return;        // jangan tampil di halaman AI itu sendiri

  var style = document.createElement('style');
  style.textContent = [
    '#dpAiWidgetBtn{position:fixed;right:18px;bottom:158px;z-index:9998;width:56px;height:56px;',
    'border-radius:50%;background:linear-gradient(135deg,#3B82F6,#1D4ED8);',
    'box-shadow:0 10px 26px rgba(37,99,235,.4),0 2px 6px rgba(0,0,0,.15);',
    'display:flex;align-items:center;justify-content:center;cursor:pointer;',
    'border:3px solid var(--surface,#fff);overflow:visible;transition:transform .2s;text-decoration:none;}',
    '#dpAiWidgetBtn:hover{transform:scale(1.06);}',
    '#dpAiWidgetBtn:active{transform:scale(.94);}',
    '#dpAiWidgetBtn img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;}',
    '#dpAiWidgetPulse{position:absolute;inset:-3px;border-radius:50%;border:2px solid rgba(59,130,246,.55);',
    'animation:dpAiPulse 2.2s ease-out infinite;pointer-events:none;}',
    '@keyframes dpAiPulse{0%{transform:scale(.9);opacity:.8;}100%{transform:scale(1.55);opacity:0;}}',
    '#dpAiWidgetLabel{position:absolute;bottom:0;right:64px;background:var(--surface,#fff);',
    'color:var(--text,#0f172a);border:1px solid var(--border,#e5e7eb);font-family:"Plus Jakarta Sans",sans-serif;',
    'font-size:12px;font-weight:700;padding:8px 13px;border-radius:12px;white-space:nowrap;',
    'box-shadow:0 6px 18px rgba(0,0,0,.12);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;',
    'transform:translateX(6px);}',
    '#dpAiWidgetBtn:hover #dpAiWidgetLabel{opacity:1;transform:translateX(0);}',
    '@media(max-width:480px){#dpAiWidgetBtn{right:14px;bottom:150px;width:50px;height:50px;}',
    '#dpAiWidgetLabel{display:none;}}'
  ].join('');
  document.head.appendChild(style);

  var a = document.createElement('a');
  a.id = 'dpAiWidgetBtn';
  a.href = '/ai';
  a.title = 'AI Support';
  a.innerHTML =
    '<span id="dpAiWidgetPulse"></span>' +
    '<span id="dpAiWidgetLabel">Tanya AI Support</span>' +
    '<img src="https://files.catbox.moe/je2gz1.jpg" alt="AI Support">';
  document.body.appendChild(a);
})();
