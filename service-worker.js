self.addEventListener('notificationclick', (event) => {
  if (event.action === 'search') {
    const githubUser = event.notification.data.githubuser;
    clients.openWindow(`https://github.com/${githubUser}`);
  } else if (event.action === 'close') {
    clients.openWindow(`https://rebrand.ly/funny-dog`);
  } else if (event.action === '') {
    event.waitUntil(
      clients.matchAll().then((cs) => {
        const client = cs.find((c) => c.visibilityState === 'visible');
        if (client !== undefined) {
          // On the same domain.
          client.navigate('/notificationDetails.html');
        } else {
          // On different domain or closed.
          clients.openWindow('/notificationDetails.html');
        }
      })
    );
  }

  console.log('notification clicked', event);

  // Close all the notification on click of one.
  self.registration
    .getNotifications()
    .then((ns) => ns.forEach((n) => n.close()));
});

self.addEventListener('push', (event) => {
  const transaction = JSON.parse(event.data.text());
  console.log('transaction', transaction);
  const options = {
    body: transaction.business,
  };

  const transactionType = transaction.type === 'deposit' ? '+' : '-';

  event.waitUntil(
    // self.registration.showNotification(
    //   `${transactionType}` + transaction.amount,
    //   options
    // )

    clients.matchAll().then((cs) => {
      const client = cs.find((c) => c.visibilityState === 'visible');
      if (client === undefined) {
        self.registration.showNotification(
          `${transactionType} ` + transaction.amount,
          options
        );
      } else {
        cs[0].postMessage(transaction);
      }
    })
  );
});
