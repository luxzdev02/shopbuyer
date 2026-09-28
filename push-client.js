// public/push-client.js
// Include di halaman yang ingin bisa terima notifikasi (dashboard/admin/chat).
// Pemakaian: <script src="/push-client.js"></script> lalu panggil enablePushNotif()
// dari tombol, misalnya: <button onclick="enablePushNotif()">Aktifkan Notifikasi</button>

async function enablePushNotif(userId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Browser Anda tidak mendukung notifikasi push.');
    return false;
  }

  const perm = await Notification.requestPermission();
  if (perm !== 'granted') {
    alert('Izin notifikasi ditolak.');
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    const { data } = await axios.get('/api/push/vapid-public-key');
    if (!data.enabled) {
      console.warn('Push belum dikonfigurasi di server.');
      return false;
    }

    const key = urlBase64ToUint8Array(data.key);
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });
    }

    await axios.post('/api/push/subscribe', { subscription: sub, user_id: userId || null });
    return true;
  } catch (e) {
    console.error('Gagal aktifkan push:', e);
    return false;
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
