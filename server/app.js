const express = require('express');
const cors = require('cors');
const publisher = require('./publisher');
const app = express();
const port = 3000;

app.use(express.json());

app.use(cors());

const subscribers = new Map();

app.post('/addSubscriber', function (req, res) {
  const pushSubscription = req.body;
  const id = pushSubscription.keys.auth;
  subscribers.set(id, pushSubscription);
  console.log(`New subscriber added. Total Subscribers:  ${subscribers.size}`);
  res.send('ok!');
});

app.post('/removeSubscriber', function (req, res) {
  const id = req.body.id;
  subscribers.delete(id);
  console.log(
    `Subscriber unsubscribed. Total subscribers: ${subscribers.size}`
  );
  res.send('ok!');
});

const users = {
  user1: {
    name: 'mahesh',
    password: 'password1',
    profession: 'teacher',
    id: 1,
  },
  user2: {
    name: 'suresh',
    password: 'password2',
    profession: 'librarian',
    id: 2,
  },
  user3: { name: 'ramesh', password: 'password3', profession: 'clerk', id: 3 },
  user4: { name: 'mohit', password: 'password4', profession: 'teacher', id: 4 },
};

app.get('/getUsers', function (req, res, next) {
  res.end(JSON.stringify(users));
});

setInterval(() => publisher.notify(subscribers), 5000);

app.listen(port, () =>
  console.log(`Server App is running at http://localhost:${port}`)
);
