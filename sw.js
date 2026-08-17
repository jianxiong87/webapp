// sw.js — must be hosted at the ROOT of your site (same level as index.html),
// not in a subfolder, for the scope to cover the whole app.

self.addEventListener('push', function (event) {
  let data = { title: 'SGCashback', body: 'You have a new alert.' };
  try {
    data = event.data.json();
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'SGCashback', {
      body: data.body || '',
      icon: undefined, // add a path here if you have an icon asset, e.g. '/icon-192.png'
      badge: undefined,
      data: { tab: data.tab || null, account: data.account || null },
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const tab = event.notification.data && event.notification.data.tab;
  const account = event.notification.data && event.notification.data.account;

  const targetUrl = new URL(self.registration.scope);
  if (tab) targetUrl.searchParams.set('tab', tab);
  if (account) targetUrl.searchParams.set('account', account);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          // App is already open — focus it and tell it to switch tabs via postMessage
          client.postMessage({ type: 'navigate-tab', tab: tab, account: account });
          return client.focus();
        }
      }
      // Not open anywhere — open a fresh tab with the routing baked into the URL
      return clients.openWindow(targetUrl.href);
    })
  );
});
