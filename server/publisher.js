const webPush = require('web-push');
const faker = require('faker');

// Push subscription object
// const pushSubscription = {
//   endpoint:
//     'https://fcm.googleapis.com/fcm/send/eQy4eD_KXYw:APA91bFSo625uPl-bELbNoTGOboAQIaFbYzt8aWq310sWmDnCkDo5OHGhNINImN6BUCqRdWNiwnxBFEZP0SqMIEwalnj7ry-VefxuTUOk7qm_0X3BHN4SY8sfqGEkNYJNeoSwxUFBUev',
//   expirationTime: null,
//   keys: {
//     p256dh:
//       'BFMm4OkA-4KcgqdhdtzOPbm0HQVlg2lsbtLF9HA_UhYwl0ox9Zr24yEgyzt9X7MP9X73GG5NJMFH22H0wspGiig',
//     auth: '3Tc9_sX4GacQE0Mh4ivRtg',
//   },
// };

const vapidPublicKey =
  'BPcxbNUoHxEXBWeh2PZEhQW5aFHyhg0KYQxArUp8-mi4bs83mJEw6wr7QaBqM9nDhjYmyzyQHlE_bUvCpaqSKBo';
const vapidPrivateKey = 'BjooLFvj6zSVOC5z7WIqCl7y0yoB7we2udTMhnz9tk4';

const option = {
  TTL: 60,
  vapidDetails: {
    subject: 'mailto: pushy@pushy.com',
    publicKey: vapidPublicKey,
    privateKey: vapidPrivateKey,
  },
};

const notify = (subscribers) => {
  const transaction = faker.helpers.createTransaction();

  if (subscribers.size < 1) {
    console.log('No subscribers to notify');
    return;
  }

  subscribers.forEach((subscriber, id) => {
    webPush
      .sendNotification(subscriber, JSON.stringify(transaction), option)
      .then(() => console.log(`${subscribers.size} Subscribers Notified.`))
      .catch((error) => console.error('Error in pushing notification', error));
  });
};

module.exports = {
  notify: notify,
};
