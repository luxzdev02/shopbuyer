// public/sw.js
self.addEventListener('push', (event) => {
  let data = { title: 'FNB NOKOS OTP', body: 'Ada notifikasi baru', url: '/' };
  try { data = event.data.json(); } catch (e) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: 'https://files.catbox.moe/je2gz1.jpg',
      badge: 'https://files.catbox.moe/je2gz1.jpg',
      data: { url: data.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
