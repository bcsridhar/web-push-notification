const client = (() => {
  let serviceWorkerRegObj = undefined;

  const notificationButton = document.getElementById('btn-notify');
  const pushButton = document.getElementById('btn-push');
  const pushNotification = document.getElementById('push-notification');

  let isUserSubscribed = false;

  const showNotificationButton = () => {
    notificationButton.style.display = 'block';
    notificationButton.addEventListener('click', showNotification);
  };

  const notifyInApp = (transaction) => {
    const html = `<div>
      <div>Amount  : <b>${transaction.amount}</b></div>
      <div>Business: <b>${transaction.business}</b>
      <div>Name  : <b>${transaction.name}</b>
      <div>Type  : <b>${transaction.type}</b>
      <div>Account  : <b>${transaction.account}</b>
      </div>
    `;
    pushNotification.style.display = 'flex';
    pushNotification.innerHTML = html;
  };

  let count = 0;

  const showNotification = () => {
    const simpleTextNotification = (reg) =>
      reg.showNotification('My First Notification');

    const customizeNotification = (reg) => {
      const options = {
        body: 'This is an important body!',
        icon: 'imgs/notification.png',
        tag: 'group-1',
        actions: [
          { action: 'search', title: 'Try Searching!' },
          { action: 'close', title: 'Forget it!' },
        ],
        data: {
          notificationTime: Date.now(),
          githubuser: 'bcsridhar',
        },
      };
      reg.showNotification('Second Notification - ' + count++, options);
    };

    navigator.serviceWorker
      .getRegistration()
      .then((registration) => customizeNotification(registration));
  };

  const checkNotificationSupport = () => {
    if (!('Notification' in window)) {
      return Promise.reject("The browser doesn't support notification.");
    }
    console.log('The browser supports notification.');
    return Promise.resolve('OK!');
  };

  const registerServiceWorker = () => {
    if (!'serviceWorker' in navigator) {
      return Promise.reject('Service worker support is not available');
    }

    return navigator.serviceWorker
      .register('service-worker.js')
      .then((regObj) => {
        console.log('Service worker is registered successfully!');
        serviceWorkerRegObj = regObj;
        showNotificationButton();

        serviceWorkerRegObj.pushManager
          .getSubscription()
          .then((subscription) => {
            if (subscription) disablePushNotificationButton();
            else enablePushNotificationButton();
          });

        navigator.serviceWorker.addEventListener('message', (e) =>
          notifyInApp(e.data)
        );
      });
  };

  const requestNotificationPermissions = () => {
    return Notification.requestPermission((status) => {
      console.log('Notification Permission Status:', status);
    });
    //return Promise.reject('Permission not requested.');
  };

  checkNotificationSupport()
    .then(registerServiceWorker)
    .then(requestNotificationPermissions)
    .catch((err) => console.error(err));

  const disablePushNotificationButton = () => {
    isUserSubscribed = true;
    pushButton.innerHTML = 'DISABLE PUSH NOTIFICATION';
    pushButton.style.backgroundColor = '#ea9085';
  };

  const enablePushNotificationButton = () => {
    isUserSubscribed = false;
    pushButton.innerHTML = 'ENABLE PUSH NOTIFICATION';
    pushButton.style.backgroundColor = '#efb1ff';
  };

  const setupPush = () => {
    function urlB64ToUint8Array(url) {
      const padding = '='.repeat((4 - (url.length % 4)) % 4);
      const base64 = (url + padding).replace(/\-/g, '+').replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    const subscribeWithServer = (subscription) => {
      return fetch('http://localhost:3000/addSubscriber', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    };

    const subscribeUser = () => {
      const appServerPublicKey =
        'BPcxbNUoHxEXBWeh2PZEhQW5aFHyhg0KYQxArUp8-mi4bs83mJEw6wr7QaBqM9nDhjYmyzyQHlE_bUvCpaqSKBo';

      // Convert to uint8 array.
      const publicKeyAsArray = urlB64ToUint8Array(appServerPublicKey);

      serviceWorkerRegObj.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKeyAsArray,
        })
        .then((subscription) => {
          console.log(JSON.stringify(subscription, null, 4));
          subscribeWithServer(subscription);
          disablePushNotificationButton();
        })
        .catch((error) =>
          console.error('Failed to subscribe to push service.', error)
        );
    };

    const unsubscribeWithServer = (id) => {
      return fetch('http://localhost:3000/removeSubscriber', {
        method: 'POST',
        body: JSON.stringify({ id }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    };

    const unSubscribeUser = () => {
      console.log('Un-Subscribe User');
      serviceWorkerRegObj.pushManager
        .getSubscription()
        .then((subscription) => {
          if (subscription) {
            let subAsString = JSON.stringify(subscription);
            let subAsObject = JSON.parse(subAsString);
            unsubscribeWithServer(subAsObject.keys.auth);
            return subscription.unsubscribe();
          }
        })
        .then(enablePushNotificationButton)
        .catch((error) =>
          console.err('Failed to unsubscribe from push service.', error)
        );
    };

    pushButton.addEventListener('click', () => {
      if (isUserSubscribed) unSubscribeUser();
      else subscribeUser();
    });
  };

  setupPush();
})();
