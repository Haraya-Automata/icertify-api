const { login, validateInput } = require('./lib/utilities');
const { createCertificate } = require('./lib/create-certificate');

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

let clients = [];
let started = false;

const PORT = process.env.PORT || 3001;
const corsOptions = {
  origin: ['https://icertify.vercel.app', 'https://console.cron-job.org',
    'http://localhost:5500']
};

app.listen(PORT, () => console.log(`(INFO) server has started in port ${PORT}`));

app.use(cors(corsOptions));

app.use(allow);

app.get('/start', start);

app.get('/logging/:id', sendMessage);

app.post('/login', [upload.none(), login]);

app.post('/generate', [logger, upload.single('file'),
  validateInput, createCertificate]);

// middlewares that need access to global variables
function allow(req, res, next) {
  const origin = req.get('origin');
  if (corsOptions.origin.includes(origin)) {
    return next();
  }
  console.log(`(INFO) a request has been blocked with the origin:`, origin)
  res.status(404).send('Origin not allowed');
}

function start(req, res) {
  if (!started) {
    started = true;
    console.log('(INFO) server has started');
  }
  res.status(200).end('Server started');
}

function getClient(id) {
  return clients.find(client => client.id === id);
}

function removeClient(client) {
  return function () {
    let id = client?.id;
    if (getClient(id)) {
      console.log(`(INFO) a client has disconnected ${id}`);

      clearInterval(client.intervalID);
      console.log(client);
      clients = clients.filter(client => client.id !== id);

      console.log('(INFO) clients connected', clients);
    }
  }
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
  // res.send(`/logging/${res.client.id}`); 
  res.status(200).end(); // remove after testing
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
      removeClient(client)();
    }

    if (client.messages.length) {
      res.write(`retry: ${1500}\n`);
      res.write(`data: ${client.messages.shift()}\n\n`);
      res.write(`id: ${++res.messageCount}\n`);
    }
  }, 300);
  console.log(clients);
}



