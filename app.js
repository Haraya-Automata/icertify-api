const { validateInput } = require('./lib/utilities');
const { createCertificate } = require('./lib/create-certificate');

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const limiter = rateLimit({
  windowMs: 8 * 60 * 1000,
  max: 10,
  standardHeaders: true,
})

let clients = [];
let started = false;

const PORT = process.env.PORT || 3001;
const corsOptions = {
  origin: ['https://icertify.vercel.app', 'http://localhost:5500']
};

app.listen(PORT, () => console.log(`(INFO) server has started in port ${PORT}`));

app.get('/start', start);

app.use(cors(corsOptions));

app.use(allow);

app.use(limiter);

app.get('/logging/:id', sendMessage);

app.post('/generate', [upload.single('file'), logger,
  validateInput, createCertificate]);

function start(req, res) {
  if (!started) {
    console.log('(INFO) server has started');
    started = true;
  }
  res.status(200).send('Server has started');
}

function allow(req, res, next) {
  const origin = req.get('origin');
  if (corsOptions.origin.includes(origin)) return next();

  console.log('(INFO) a request has been blocked');
  res.status(404).send('Origin not allowed');
}

function logger(req, res, next) {
  console.log('(INFO) a client has connected');
  const id = crypto.randomUUID();

  clients.push({
    id: id,
    intervalID: 0,
    messages: [],
    newMessage: function (message) {
      this.messages.push(message);
    }
  });

  res.client = getClient(id);
  res.client.newMessage('server accepted request');
  res.send(`/logging/${res.client.id}`);
  next();
};

function sendMessage(req, res) {
  res.messageCount = 0;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  let client = getClient(req?.params?.id);

  req.on('close', removeClient(client));

  client.intervalID = setInterval(() => {
    if (client.messages?.at(0) === 'END') {
      removeClient(client)()
    }

    if (client.messages.length) {
      res.write(`retry: ${1500}\n`);
      res.write(`data: ${client.messages.shift()}\n\n`);
      res.write(`id: ${++res.messageCount}\n`);
    }
  }, 200);
  console.log('(INFO) clients connected', getIDs());
}

function getClient(id) {
  return clients.find(client => client.id === id);
}

function getIDs() {
  return clients.map(client => client.id);
}

function removeClient(client) {
  return function () {
    let id = client.id;
    if (getClient(id)) {
      clearInterval(client.intervalID);
      console.log(`(INFO) a client has disconnected ${client.id}`);
      console.log(`(INFO) setInterval destroyed? ${client.intervalID._destroyed}`);
      console.log(`(INFO) messages: ${client.messages}`);

      clients = clients.filter(client => client.id !== id);
      console.log('(INFO) clients connected', getIDs());
    }
  }
}




